/**
 * Season / match simulation (§15). Abstracted and monthly: squad strength +
 * form + variance → a results distribution, aggregated into league tables.
 * No match-engine minutiae — but sensitive enough that (from M4) a March injury
 * to a key player measurably moves title probability, and variance alone
 * occasionally costs the strongest squad a title (§12 dynasty band).
 *
 * The schedule is a deterministic double round-robin regenerated on demand from
 * (clubIds, seasonYear) so it never has to live in a save. Standings and the
 * title history do live in state.
 */

import type {
  ClubId,
  ClubState,
  GameState,
  LeagueState,
  TeamRecord,
} from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { parseYearMonth } from './clock.js';

// ── Tunable match-model constants (calibrated in season.test.ts) ─────────────
const HOME_ADVANTAGE = 6; // strength points
const BASE_GOALS = 1.35; // expected goals for an evenly-matched neutral game
const BETA = 0.014; // sensitivity of xG to effective-strength difference
const MAX_LAMBDA = 6; // safety cap on the Poisson mean
const FORM_STEP = 1; // form nudge per win/loss
const FORM_CAP = 5;
const FORM_DECAY = 0.7; // per round, form drifts toward 0
const PLAYING_MONTHS = 10; // Aug (idx 1) … May (idx 10)

/** Rounds in a double round-robin for a league of `n` clubs (Serie A 1995 had
 *  18 → 34 rounds; the Premier League 20 → 38). Kept league-size-aware so packs
 *  aren't locked to a 20-club division. */
function roundsFor(league: LeagueState): number {
  return Math.max(2, (league.clubIds.length - 1) * 2);
}

export function emptyRecord(): TeamRecord {
  return { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
}

/** Points-first ordering with GD then GF then id as deterministic tie-breaks. A
 *  club not yet in the standings (e.g. a promotion swapped in at the rollover,
 *  before the new season's table is initialised) sorts as a blank record. */
export function standingsOrder(league: LeagueState): ClubId[] {
  return [...league.clubIds].sort((a, b) => {
    const ra = league.standings[a] ?? emptyRecord();
    const rb = league.standings[b] ?? emptyRecord();
    if (rb.points !== ra.points) return rb.points - ra.points;
    const gdA = ra.goalsFor - ra.goalsAgainst;
    const gdB = rb.goalsFor - rb.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    if (rb.goalsFor !== ra.goalsFor) return rb.goalsFor - ra.goalsFor;
    return a < b ? -1 : 1;
  });
}

interface Fixture {
  home: ClubId;
  away: ClubId;
}

/**
 * Deterministic double round-robin via the circle method. Every club plays
 * every other twice (home + away). The initial ordering is rotated by
 * `seasonYear` so successive seasons aren't byte-identical fixture lists.
 */
export function generateSchedule(clubIds: readonly ClubId[], seasonYear: number): Fixture[][] {
  const n = clubIds.length;
  if (n < 2 || n % 2 !== 0) {
    throw new Error(`generateSchedule needs an even club count ≥2, got ${n}`);
  }
  // Deterministic rotation of the starting order.
  const rot = seasonYear % n;
  const teams = [...clubIds.slice(rot), ...clubIds.slice(0, rot)];

  const firstHalf: Fixture[][] = [];
  const arr = [...teams];
  for (let r = 0; r < n - 1; r++) {
    const fixtures: Fixture[] = [];
    for (let i = 0; i < n / 2; i++) {
      const t1 = arr[i]!;
      const t2 = arr[n - 1 - i]!;
      // Alternate home/away to balance the schedule.
      if ((r + i) % 2 === 0) fixtures.push({ home: t1, away: t2 });
      else fixtures.push({ home: t2, away: t1 });
    }
    firstHalf.push(fixtures);
    // Rotate all but the first element.
    arr.splice(1, 0, arr.pop()!);
  }

  // Second half: same pairings, reversed venues.
  const secondHalf = firstHalf.map((round) =>
    round.map((f) => ({ home: f.away, away: f.home })),
  );
  return [...firstHalf, ...secondHalf];
}

/** Draw a Poisson variate with the given mean using the seeded stream. */
function poisson(lambda: number, rng: Rng): number {
  const l = Math.exp(-Math.min(lambda, MAX_LAMBDA));
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng.next();
  } while (p > l);
  return k - 1;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
}

/**
 * Simulate one match from effective strengths. Home advantage and current form
 * are baked into the effective strengths by the caller's inputs here.
 */
export function simulateMatch(
  homeStrength: number,
  awayStrength: number,
  rng: Rng,
): MatchResult {
  const effHome = homeStrength + HOME_ADVANTAGE;
  const effAway = awayStrength;
  const d = effHome - effAway;
  const lambdaHome = BASE_GOALS * Math.exp(BETA * d);
  const lambdaAway = BASE_GOALS * Math.exp(-BETA * d);
  return { homeGoals: poisson(lambdaHome, rng), awayGoals: poisson(lambdaAway, rng) };
}

function applyResult(rec: TeamRecord, scored: number, conceded: number): void {
  rec.played++;
  rec.goalsFor += scored;
  rec.goalsAgainst += conceded;
  if (scored > conceded) {
    rec.won++;
    rec.points += 3;
  } else if (scored === conceded) {
    rec.drawn++;
    rec.points += 1;
  } else {
    rec.lost++;
  }
}

function nudgeForm(state: GameState, clubId: ClubId, delta: number): void {
  const club = state.clubs[clubId];
  if (!club) return;
  club.form = Math.max(-FORM_CAP, Math.min(FORM_CAP, club.form + delta));
}

/** Strength a club takes into a league match: its squad strength, current form,
 *  AND any BUTTERFLY that has gorged or gutted it (§ butterfly showcase). The same
 *  star-premium swing that moves the Champions League moves the league table too —
 *  an aggressive user who guts a rival's spine climbs past them, a raided club
 *  slips. Zero in a passive world, so the calibrated tables are undisturbed. */
export function matchStrength(club: ClubState): number {
  return club.strength + club.form + (club.starButterfly ?? 0);
}

function playMatch(state: GameState, league: LeagueState, fixture: Fixture, rng: Rng): void {
  const home = state.clubs[fixture.home]!;
  const away = state.clubs[fixture.away]!;
  const result = simulateMatch(matchStrength(home), matchStrength(away), rng);

  applyResult(league.standings[fixture.home]!, result.homeGoals, result.awayGoals);
  applyResult(league.standings[fixture.away]!, result.awayGoals, result.homeGoals);

  if (result.homeGoals > result.awayGoals) {
    nudgeForm(state, fixture.home, FORM_STEP);
    nudgeForm(state, fixture.away, -FORM_STEP);
  } else if (result.homeGoals < result.awayGoals) {
    nudgeForm(state, fixture.home, -FORM_STEP);
    nudgeForm(state, fixture.away, FORM_STEP);
  }
}

/** Reset a league to the start of a fresh season. */
export function initLeagueSeason(league: LeagueState, seasonYear: number): void {
  league.seasonYear = seasonYear;
  league.roundsPlayed = 0;
  const standings: Record<ClubId, TeamRecord> = {};
  for (const id of league.clubIds) standings[id] = emptyRecord();
  league.standings = standings;
}

/** Play league rounds until `targetRounds` (or the season) is complete. */
function playRoundsUpTo(state: GameState, league: LeagueState, targetRounds: number, rng: Rng): number {
  const schedule = generateSchedule(league.clubIds, league.seasonYear);
  let played = 0;
  while (league.roundsPlayed < targetRounds && league.roundsPlayed < schedule.length) {
    const round = schedule[league.roundsPlayed]!;
    for (const fixture of round) playMatch(state, league, fixture, rng);
    league.roundsPlayed++;
    played++;
    // Form drifts back toward 0 each round.
    for (const id of league.clubIds) {
      const club = state.clubs[id]!;
      club.form *= FORM_DECAY;
    }
  }
  return played;
}

function alreadyCrowned(league: LeagueState, seasonYear: number): boolean {
  return league.titleHistory.some((t) => t.seasonYear === seasonYear);
}

/** Crown the champion of a completed season and record it. */
export function finalizeSeason(state: GameState, league: LeagueState): void {
  if (alreadyCrowned(league, league.seasonYear)) return;
  const order = standingsOrder(league);
  // Bottom three go down — their players become easy pickings next season.
  const relegated = new Set(order.slice(-3));
  for (const id of league.clubIds) {
    const club = state.clubs[id];
    if (club) club.relegationThreatened = relegated.has(id);
  }
  const championId = order[0]!;
  const points = league.standings[championId]!.points;
  league.titleHistory.push({ seasonYear: league.seasonYear, championId, points });
  logEvent(state, {
    category: 'match',
    code: 'league.season.complete',
    message: `${state.clubs[championId]!.name} win the ${league.name} (${league.seasonYear}–${league.seasonYear + 1}) with ${points} pts`,
    data: { leagueId: league.id, seasonYear: league.seasonYear, championId, points },
  });
}

/**
 * Advance every simulated league by one calendar month. Called from
 * `advanceWindow`'s per-month hook. Handles the season boundary: crown at June,
 * roll a fresh season at July, and play the scheduled slice Aug–May.
 */
export function stepLeagueMonth(state: GameState, rng: Rng): void {
  const idx = state.clock.monthIndex;
  const year = parseYearMonth(state.clock.date).year;
  // The season owning this calendar month: Aug–Dec (idx 1–5) belong to `year`;
  // Jan–May (idx 6–10) belong to the season that opened the previous August.
  const owningSeasonYear = idx <= 5 ? year : year - 1;
  const leagueRng = rng.fork(`league:${state.clock.date}`);

  for (const league of Object.values(state.leagues)) {
    if (idx >= 1 && idx <= PLAYING_MONTHS) {
      // A new season's first playing month (August) resets the table. The old
      // final table therefore stays viewable through June + the July summer
      // window, then is cleared only when the next campaign kicks off.
      if (league.seasonYear !== owningSeasonYear) {
        initLeagueSeason(league, owningSeasonYear);
      }
      const target = Math.round((roundsFor(league) * idx) / PLAYING_MONTHS);
      const played = playRoundsUpTo(state, league, target, leagueRng);
      if (played > 0) {
        logEvent(state, {
          category: 'match',
          code: 'league.month',
          message: `${league.name}: ${played} round(s) played`,
          data: { leagueId: league.id, roundsPlayed: league.roundsPlayed, played },
        });
      }
    } else if (idx === 11 && league.roundsPlayed >= roundsFor(league)) {
      // June — season complete; crown the champion (standings preserved).
      finalizeSeason(state, league);
    }
    // July (idx 0): nothing — last season's final table remains on show.
  }
}

/** Longest run of consecutive titles by any single club, across all leagues. */
export function maxConsecutiveTitles(state: GameState): number {
  let best = 0;
  for (const league of Object.values(state.leagues)) {
    let run = 0;
    let prev: ClubId | null = null;
    for (const t of league.titleHistory) {
      run = t.championId === prev ? run + 1 : 1;
      prev = t.championId;
      if (run > best) best = run;
    }
  }
  return best;
}
