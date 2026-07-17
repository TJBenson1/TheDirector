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
import { SECOND_TIER_CLUB, LEAGUES } from './leagues.js';
import type { LeagueClubSeed } from './leagues.js';
import { getScenario } from './scenarios.js';
import {
  generateSquad,
  deriveRawStrength,
  recomputeClubStrength,
  clubSquadPlayers,
  computeWageBill,
} from './players.js';
import { initialFinances } from './finance.js';

// ── Tunable match-model constants (calibrated in season.test.ts) ─────────────
const HOME_ADVANTAGE = 6; // strength points
const BASE_GOALS = 1.35; // expected goals for an evenly-matched neutral game
const BETA = 0.014; // sensitivity of xG to effective-strength difference
const MAX_LAMBDA = 6; // safety cap on the Poisson mean
const FORM_STEP = 1; // form nudge per win/loss
const FORM_CAP = 5;
const FORM_DECAY = 0.7; // per round, form drifts toward 0
const PLAYING_MONTHS = 10; // Aug (idx 1) … May (idx 10)

/** Rounds in a double round-robin season, from the league's size: a 20-team
 *  division is 38, an 18-team Bundesliga is 34. (For any 20-team league this is
 *  exactly the old hardcoded 38, so existing worlds are bit-identical.) */
function seasonRounds(league: LeagueState): number {
  return 2 * (league.clubIds.length - 1);
}

export function emptyRecord(): TeamRecord {
  return { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
}

/** Points-first ordering with GD then GF then id as deterministic tie-breaks. */
export function standingsOrder(league: LeagueState): ClubId[] {
  return [...league.clubIds].sort((a, b) => {
    const ra = league.standings[a]!;
    const rb = league.standings[b]!;
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

function playMatch(state: GameState, league: LeagueState, fixture: Fixture, rng: Rng): void {
  const home = state.clubs[fixture.home]!;
  const away = state.clubs[fixture.away]!;
  // The M9 rubber-band (rival.ts::applyRubberBand): a club running away with the
  // title carries a match headwind, its chasers a tailwind — 0 for everyone until
  // a streak forms, so the general race is unchanged.
  const result = simulateMatch(
    home.strength + home.form + (home.dominanceHeadwind ?? 0),
    away.strength + away.form + (away.dominanceHeadwind ?? 0),
    rng,
  );

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

/** Strength used to rank a reservoir club for promotion (live if instantiated,
 *  else its seed level). */
function reservoirStrength(state: GameState, id: ClubId): number {
  return state.clubs[id]?.strength ?? SECOND_TIER_CLUB[id]?.strength ?? 50;
}

/** Bring a promoted club into the top flight: re-attach it if it already exists
 *  (a previously-relegated side bouncing back), else instantiate it with a fresh
 *  procedural squad. Forked RNG keeps this from perturbing the match stream. */
function promoteClub(state: GameState, id: ClubId, leagueId: string, year: number, rng: Rng): void {
  const existing = state.clubs[id];
  if (existing) {
    existing.leagueId = leagueId;
    existing.relegationThreatened = false;
    recomputeClubStrength(state, id);
    return;
  }
  const seed = SECOND_TIER_CLUB[id];
  if (!seed) return;
  const clubRng = rng.fork(`promote:${id}`);
  const club: ClubState = {
    id: seed.id,
    name: seed.name,
    tier: 2,
    prestige: seed.prestige,
    squad: [],
    strength: seed.strength,
    baseStrength: seed.strength,
    squadStrengthAnchor: 0,
    form: 0,
    leagueId,
    finances: { ownership: 'sustainable', transferBudget: 0, wageBudget: 0, wageBill: 0 },
    pendingCounterPunch: 0,
    grudge: 0,
    financialHealth: 'healthy',
    relegationThreatened: false,
  };
  state.clubs[club.id] = club;
  for (const p of generateSquad(club.id, leagueId, club.baseStrength, year, clubRng)) {
    state.players[p.id] = p;
    club.squad.push(p.id);
  }
  club.squadStrengthAnchor = deriveRawStrength(clubSquadPlayers(state, club.id));
  recomputeClubStrength(state, club.id);
  club.finances = initialFinances(club.prestige, year, 'sustainable', computeWageBill(state, club.id));
}

/**
 * Promotion & relegation at the season boundary: the bottom 3 drop out of the
 * top flight and the strongest 3 reservoir clubs come up, so the division
 * evolves over a career instead of freezing the opening membership (a Historian
 * SEVERE — Wimbledon still top-flight in 2009). The user's club is never
 * auto-relegated (a bottom-3 finish is handled by the board, not the drop), so
 * the playable timeline stays coherent. Club count is preserved (3-for-3).
 *
 * Called at the August reset, AFTER the old final table has been read and
 * crowned, so mid-season standings are never disturbed.
 */
export function applyPromotionRelegation(state: GameState, league: LeagueState, rng: Rng): void {
  const reservoir = league.reservoir ?? [];
  if (reservoir.length < 3 || league.clubIds.length < 4) return;

  const order = standingsOrder(league);
  let relegated = order.slice(-3);
  if (relegated.includes(state.playerClub)) {
    relegated = order.filter((id) => id !== state.playerClub).slice(-3);
  }
  const relSet = new Set(relegated);

  const year = parseYearMonth(state.clock.date).year;
  const promoted = [...reservoir]
    .sort((a, b) => reservoirStrength(state, b) - reservoirStrength(state, a))
    .slice(0, 3);
  const proSet = new Set(promoted);

  for (const id of promoted) promoteClub(state, id, league.id, year, rng);
  for (const id of relegated) {
    const c = state.clubs[id];
    if (c) {
      c.leagueId = null;
      c.relegationThreatened = true;
    }
  }

  league.clubIds = league.clubIds.filter((id) => !relSet.has(id)).concat(promoted);
  league.reservoir = reservoir.filter((id) => !proSet.has(id)).concat(relegated);

  logEvent(state, {
    category: 'match',
    code: 'league.promrel',
    message: `${league.name}: ${promoted.map((id) => state.clubs[id]?.name ?? id).join(', ')} promoted; ${relegated
      .map((id) => state.clubs[id]?.name ?? id)
      .join(', ')} relegated`,
    data: { leagueId: league.id, promoted, relegated },
  });
}

/** Bring a top-flight seed club into the simulated division on an in-place
 *  promotion: re-attach it if it already exists (a context club), else instantiate
 *  it with a fresh procedural squad. Mirrors `promoteClub` but works from a league
 *  seed (prestige/strength) rather than the reservoir pool. */
function attachTopFlightClub(state: GameState, seed: LeagueClubSeed, leagueId: string, year: number, rng: Rng): void {
  const existing = state.clubs[seed.id];
  if (existing) {
    existing.leagueId = leagueId;
    existing.relegationThreatened = false;
    if (existing.squad.length === 0) {
      const clubRng = rng.fork(`attach:${seed.id}`);
      for (const p of generateSquad(existing.id, leagueId, existing.baseStrength || seed.strength, year, clubRng)) {
        state.players[p.id] = p;
        existing.squad.push(p.id);
      }
      existing.squadStrengthAnchor = deriveRawStrength(clubSquadPlayers(state, existing.id));
    }
    recomputeClubStrength(state, seed.id);
    return;
  }
  const clubRng = rng.fork(`attach:${seed.id}`);
  const club: ClubState = {
    id: seed.id,
    name: seed.name,
    tier: 1,
    prestige: seed.prestige,
    squad: [],
    strength: seed.strength,
    baseStrength: seed.strength,
    squadStrengthAnchor: 0,
    form: 0,
    leagueId,
    finances: { ownership: 'sustainable', transferBudget: 0, wageBudget: 0, wageBill: 0 },
    pendingCounterPunch: 0,
    grudge: 0,
    financialHealth: 'healthy',
    relegationThreatened: false,
  };
  state.clubs[club.id] = club;
  for (const p of generateSquad(club.id, leagueId, club.baseStrength, year, clubRng)) {
    state.players[p.id] = p;
    club.squad.push(p.id);
  }
  club.squadStrengthAnchor = deriveRawStrength(clubSquadPlayers(state, club.id));
  recomputeClubStrength(state, club.id);
  club.finances = initialFinances(club.prestige, year, 'sustainable', computeWageBill(state, club.id));
}

/**
 * In-place promotion of the player's OWN club (juventus-2006's Serie B → Serie A).
 * If the player's club finished within `maxPosition`, the simulated division is
 * transformed one level up: the top-flight seed's clubs come in around it, the
 * beaten second-tier sides drop to the reservoir, and the player continues the
 * career in the higher division. Returns true if the promotion fired (so the
 * caller skips the generic pool swap). Runs on a forked stream; only ever active
 * in a second-tier start, so calibrated top-flight scenarios are untouched.
 */
export function applyInPlacePromotion(
  state: GameState,
  league: LeagueState,
  promo: { leagueId: string; maxPosition: number },
  rng: Rng,
): boolean {
  const topSeed = LEAGUES[promo.leagueId];
  if (!topSeed) return false;
  if (!league.clubIds.includes(state.playerClub)) return false;
  const pos = standingsOrder(league).indexOf(state.playerClub) + 1;
  if (pos < 1 || pos > promo.maxPosition) return false;

  const year = parseYearMonth(state.clock.date).year;
  const seedIds = topSeed.clubs.map((c) => c.id).filter((id) => id !== state.playerClub);
  const keepCount = Math.max(0, topSeed.clubs.length - 1); // leave room for the player's club
  const memberSeedIds = seedIds.slice(0, keepCount);
  const overflowSeedIds = seedIds.slice(keepCount);
  const newMembers = [state.playerClub, ...memberSeedIds];
  const newSet = new Set(newMembers);

  for (const seed of topSeed.clubs) {
    if (!newSet.has(seed.id) || seed.id === state.playerClub) continue;
    attachTopFlightClub(state, seed, league.id, year, rng.fork(`top:${seed.id}`));
  }

  const dropped = league.clubIds.filter((id) => id !== state.playerClub && !newSet.has(id));
  for (const id of dropped) {
    const c = state.clubs[id];
    if (c) {
      c.leagueId = null;
      c.relegationThreatened = true;
    }
  }

  league.name = topSeed.name; // the division now IS the top flight
  league.clubIds = newMembers;
  league.reservoir = [...new Set([...(league.reservoir ?? []), ...dropped, ...overflowSeedIds])];

  logEvent(state, {
    category: 'match',
    code: 'league.promoted-in-place',
    message: `${state.clubs[state.playerClub]?.name ?? state.playerClub} promoted to ${topSeed.name} (finished ${pos})`,
    data: { leagueId: league.id, into: promo.leagueId, position: pos },
  });
  return true;
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
      // window, then is cleared only when the next campaign kicks off. Promotion
      // & relegation happen HERE — after the old table was read/crowned, before
      // the new one is built — on a forked stream so the match RNG is untouched.
      if (league.seasonYear !== owningSeasonYear) {
        // A second-tier start (Juventus in Serie B) can promote the player's own
        // club straight up, transforming the division in place; otherwise the
        // generic bottom-3/top-3 pool swap keeps the membership churning. The
        // in-place path only exists for a scenario with a `promotion` config while
        // the league still wears its second-tier name, so calibrated top-flight
        // scenarios take the identical generic path (bit-for-bit).
        const scenario = getScenario(state.meta.scenarioId);
        const promo = scenario.promotion;
        let promoted = false;
        if (promo && league.clubIds.includes(state.playerClub) && league.name === LEAGUES[scenario.domesticLeagueId]?.name) {
          promoted = applyInPlacePromotion(state, league, promo, leagueRng.fork('inplace'));
        }
        if (!promoted) applyPromotionRelegation(state, league, leagueRng.fork('promrel'));
        initLeagueSeason(league, owningSeasonYear);
      }
      const target = Math.round((seasonRounds(league) * idx) / PLAYING_MONTHS);
      const played = playRoundsUpTo(state, league, target, leagueRng);
      if (played > 0) {
        logEvent(state, {
          category: 'match',
          code: 'league.month',
          message: `${league.name}: ${played} round(s) played`,
          data: { leagueId: league.id, roundsPlayed: league.roundsPlayed, played },
        });
      }
    } else if (idx === 11 && league.roundsPlayed >= seasonRounds(league)) {
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
