/**
 * Narrative context (natural-language-first play).
 *
 * The engine is deterministic and emits FACTS; the story is told by a narrator
 * (the app's language model) on top. This module gives that narrator rich,
 * structured material: the club's momentum, the board's mood, the coach
 * relationship, which players are flying / sulking / running down their deals /
 * breaking through, the live narrative threads, and the recent beats. It reads
 * state only — no prose — so the same context can drive a briefing, a matchday
 * report, or an answer to "how's the dressing room?".
 */

import type { GameState, PlayerState } from './types.js';
import { parseYearMonth } from './clock.js';
import { standingsOrder } from './season.js';
import { clubSquadPlayers } from './players.js';
import { isProcedural } from './ledger.js';
import { formationLabel, formationEraModifier, eraIdealFormation } from './tactics.js';
import { realLeaguePosition } from './realStandings.js';

export interface NarrativeContext {
  club: string;
  date: string;
  season: string;
  form: { momentum: 'surging' | 'steady' | 'slumping'; value: number };
  league: { position: number | null; of: number; points: number };
  /** How the club's league campaign maps to real history this season (M14). */
  reality: { realPosition: number | null; note: string } | null;
  /** The most recent Champions League final, and the club's part in it. */
  europe: { season: number; winner: string; runnerUp: string; youWon: boolean; youReachedFinal: boolean } | null;
  board: { mandate: string; patience: number; mood: string; warnings: number; dismissed: boolean };
  coach: {
    identity: string;
    archetype: string;
    relationship: number;
    mood: string;
    formationTension: string | null;
  };
  squad: {
    talismen: { name: string; note: string }[];
    unsettled: { name: string; reason: string }[];
    expiring: { name: string; until: number }[];
    injured: { name: string; months: number }[];
    emerging: { name: string }[];
  };
  threads: string[];
  recent: string[];
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}

function momentum(form: number): 'surging' | 'steady' | 'slumping' {
  if (form >= 3) return 'surging';
  if (form <= -3) return 'slumping';
  return 'steady';
}

function boardMood(patience: number, warnings: number): string {
  if (warnings >= 1 && patience < 35) return 'furious — the job is on the line';
  if (patience >= 72) return 'delighted';
  if (patience >= 50) return 'content';
  if (patience >= 35) return 'anxious';
  return 'losing faith';
}

function coachMood(rel: number): string {
  if (rel >= 78) return 'fully behind you';
  if (rel >= 58) return 'a workable, professional relationship';
  if (rel >= 40) return 'strained';
  return 'close to breaking point';
}

/** Only recent, story-worthy events — not procedural filler churn. */
function isNotable(code: string): boolean {
  return /scripted|coach|transfer\.completed|window\.review|board|scandal|injury\.(serious|real)|season\.complete|crisis|takeover|retire|ucl\.final|ledger\.nearmiss|rival\.escalate/.test(code);
}

export function narrativeContext(state: GameState, opts: { recent?: number } = {}): NarrativeContext {
  const club = state.clubs[state.playerClub]!;
  const year = parseYearMonth(state.clock.date).year;
  const league = club.leagueId ? state.leagues[club.leagueId] : undefined;

  let position: number | null = null;
  let points = 0;
  if (league) {
    const order = league.roundsPlayed === 0
      ? [...league.clubIds].sort((a, b) => state.clubs[b]!.strength - state.clubs[a]!.strength)
      : standingsOrder(league);
    position = order.indexOf(state.playerClub) + 1 || null;
    points = league.standings[state.playerClub]?.points ?? 0;
  }

  const squad = clubSquadPlayers(state, state.playerClub).filter((p) => !isProcedural(p));
  const ageOf = (p: PlayerState) => year - p.birthYear;

  const talismen = [...squad]
    .sort((a, b) => b.ability + b.form * 2 - (a.ability + a.form * 2))
    .slice(0, 3)
    .map((p) => ({
      name: p.name,
      note: p.form >= 3 ? 'in blistering form' : p.form <= -3 ? 'out of sorts' : 'the spine of the side',
    }));

  const unsettled = squad
    .filter((p) => p.morale < 45 || p.agitation > 40)
    .slice(0, 4)
    .map((p) => ({
      name: p.name,
      reason: p.agitation > 40 ? 'agitating to leave' : 'unhappy',
    }));

  const expiring = squad
    .filter((p) => p.contractUntil <= year + 1)
    .sort((a, b) => a.contractUntil - b.contractUntil)
    .slice(0, 5)
    .map((p) => ({ name: p.name, until: p.contractUntil }));

  const injured = squad
    .filter((p) => p.injury && p.injury.monthsRemaining > 0)
    .map((p) => ({ name: p.name, months: p.injury!.monthsRemaining }));

  const emerging = squad
    .filter((p) => p.wonderkid && ageOf(p) <= 21)
    .slice(0, 3)
    .map((p) => ({ name: p.name }));

  const coach = state.managerRelations;
  const activeDelta = formationEraModifier(coach.activeFormation, year);
  const idealF = eraIdealFormation(year);
  let formationTension: string | null = null;
  if (coach.activeFormation !== idealF && idealF !== coach.activeFormation && activeDelta <= -2) {
    formationTension = `${formationLabel(coach.activeFormation)} is being left behind by the modern game`;
  } else if (coach.preferredFormation !== coach.activeFormation) {
    formationTension = `playing ${formationLabel(coach.activeFormation)} rather than his preferred ${formationLabel(coach.preferredFormation)}`;
  }

  const threads = [...state.timeline.narrativeMemory]
    .slice(-6)
    .reverse()
    .map((m) => m.detail);

  const recent = [...state.eventLog]
    .filter((e) => isNotable(e.code))
    .slice(-(opts.recent ?? 8))
    .reverse()
    .map((e) => `${e.date}: ${e.message}`);

  // How this campaign maps to reality (M14) — so a faithful bad season reads as
  // faithful, not as the Director's failure, and an overachievement is celebrated
  // as beating history. Only meaningful for an anchored league/season.
  const realPos = realLeaguePosition(state);
  let reality: NarrativeContext['reality'] = null;
  if (realPos != null && position != null) {
    const diff = realPos - position; // >0 = better than reality (lower number)
    const note =
      Math.abs(diff) <= 1
        ? `${club.name} really finished ${ordinal(realPos)} this season — your ${ordinal(position)} tracks history closely.`
        : diff > 0
          ? `${club.name} really finished ${ordinal(realPos)} this season — your ${ordinal(position)} is AHEAD of history, an overachievement.`
          : `${club.name} really finished ${ordinal(realPos)} this season — your ${ordinal(position)} is BEHIND where they landed in reality.`;
    reality = { realPosition: realPos, note };
  }

  // The most recent Champions League final, so the narrator always has the
  // European story (and whether the club was in it) to report at the rollover.
  let europe: NarrativeContext['europe'] = null;
  const lastCup = state.europeanCup?.titleHistory.at(-1);
  if (lastCup) {
    europe = {
      season: lastCup.seasonYear,
      winner: state.clubs[lastCup.winnerId]?.name ?? lastCup.winnerId,
      runnerUp: state.clubs[lastCup.runnerUpId]?.name ?? lastCup.runnerUpId,
      youWon: lastCup.winnerId === state.playerClub,
      youReachedFinal: lastCup.winnerId === state.playerClub || lastCup.runnerUpId === state.playerClub,
    };
  }

  return {
    club: club.name,
    date: state.clock.date,
    season: `${league?.seasonYear ?? year}/${((league?.seasonYear ?? year) + 1) % 100}`,
    form: { momentum: momentum(club.form), value: Math.round(club.form) },
    league: { position, of: league?.clubIds.length ?? 0, points },
    reality,
    europe,
    board: {
      mandate: state.board.mandate,
      patience: state.board.patience,
      mood: boardMood(state.board.patience, state.board.warnings),
      warnings: state.board.warnings,
      dismissed: state.board.dismissed,
    },
    coach: {
      identity: coach.identity,
      archetype: coach.archetype,
      relationship: coach.relationshipWithUser,
      mood: coachMood(coach.relationshipWithUser),
      formationTension,
    },
    squad: { talismen, unsettled, expiring, injured, emerging },
    threads,
    recent,
  };
}
