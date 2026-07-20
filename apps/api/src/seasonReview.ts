/**
 * Scripted end-of-season (and mid-season) commentary — token-free narrative over
 * the deterministic engine facts, shown in the Advance feed.
 *
 * The engine emits a `board.season-review` event at each summer rollover carrying
 * the finish, the board's expectation and the points total; here we turn that into
 * a real review — where you finished, how the board took it, who your top scorer
 * was, and how the European run went — so advancing past a season lands as a story,
 * not a bare "38 rounds played". No model call.
 */

import {
  clubSquadPlayers,
  europeanCampaign,
  midSeasonForm,
  standingsOrder,
  narrativeContext,
  divergenceFactor,
  memoriesWithTag,
  type GameState,
} from '@director/engine';
import type { BeatKind } from './narrate.js';

/**
 * The Reality Register beats that have landed recently — the contract sagas,
 * near-misses, career forks and injuries the Director has lived through, and how each
 * resolved against history. Threaded into every season beat so these are a MAJOR part
 * of the story the narrator tells, not silent log lines. Most recent first.
 */
function recentRegisterBeats(state: GameState, sinceMonths = 14): string[] {
  const tags = ['contract-saga', 'near-miss', 'career-arc', 'injury', 'transfer-near-miss'];
  const nowIdx = Number(state.clock.date.slice(0, 4)) * 12 + Number(state.clock.date.slice(5, 7));
  const beats: { date: string; detail: string }[] = [];
  for (const tag of tags) {
    for (const m of memoriesWithTag(state, tag)) {
      const idx = Number(m.date.slice(0, 4)) * 12 + Number(m.date.slice(5, 7));
      if (nowIdx - idx <= sinceMonths) beats.push({ date: m.date, detail: m.detail });
    }
  }
  return beats
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6)
    .map((b) => b.detail);
}

interface ReviewData {
  finish: number;
  expected: number;
  points: number;
  wonTitle: boolean;
  patience: number;
  season: number;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0]!;
}

/** The club's top league scorer last season, from the settled per-player stats. */
function topScorer(state: GameState): { name: string; goals: number; assists: number } | null {
  let best: { name: string; goals: number; assists: number } | null = null;
  for (const p of clubSquadPlayers(state, state.playerClub)) {
    const g = p.lastSeason?.goals ?? 0;
    if (g > 0 && (!best || g > best.goals)) best = { name: p.name, goals: g, assists: p.lastSeason?.assists ?? 0 };
  }
  return best;
}

/** How the board reads the finish, coloured by patience. */
function boardVerdict(d: ReviewData, club: string): string {
  const exp = d.expected <= 1 ? 'the title' : `a top-${d.expected} finish`;
  if (d.wonTitle) return `The title is back at ${club}. The board are ecstatic — this is exactly what they hired you for.`;
  if (d.finish <= d.expected) return `That meets the board's brief (${exp}), and they'll back you again in the summer.`;
  const miss = d.finish - d.expected;
  if (d.patience < 25) return `The board wanted ${exp}, and falling short has their patience close to breaking — your position is under real threat.`;
  if (miss <= 1) return `The board wanted ${exp}; a near-miss is tolerated, but they'll want to see progress next season.`;
  return `Well short of ${exp} the board demanded — the mood in the boardroom has soured, and questions are being asked.`;
}

interface ReviewDataMaybe { finish: number; expected: number; points: number; wonTitle: boolean; patience: number; season: number }

/** The strongest clubs in the Director's league — the season's title threats. */
function leagueFavourites(state: GameState): { name: string; strength: number }[] {
  const club = state.clubs[state.playerClub];
  return Object.values(state.clubs)
    .filter((c) => c.leagueId && c.leagueId === club?.leagueId && c.id !== state.playerClub)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 4)
    .map((c) => ({ name: c.name, strength: Math.round(c.strength) }));
}

function safeEuro(state: GameState) {
  try {
    const e = europeanCampaign(state);
    return { inCompetition: e.inCompetition, phase: e.phase, note: e.note, groupSummary: e.groupSummary };
  } catch {
    return null;
  }
}

/**
 * Assemble the deterministic FACTS the model narrates for a season beat, plus a
 * scripted `fallback` used verbatim if the model is unavailable. The engine owns
 * every fact here; the model only supplies the voice.
 */
export function beatFacts(
  state: GameState,
  kind: BeatKind,
  reviewData?: ReviewDataMaybe,
): { facts: unknown; fallback: string } {
  const ctx = narrativeContext(state);
  const userLeague = state.clubs[state.playerClub]?.leagueId;
  // The arms race the Director is running against the world: rivals he has SUPPRESSED
  // (bought their signings, so they've slipped) and how hard the world is now fighting
  // back (worldDefiance). Lets the model narrate a living, reacting league.
  const suppressed = Object.values(state.clubs)
    .filter((c) => c.leagueId === userLeague && c.id !== state.playerClub && (c.suppressionPenalty ?? 0) >= 0.6)
    .sort((a, b) => (b.suppressionPenalty ?? 0) - (a.suppressionPenalty ?? 0))
    .slice(0, 3)
    .map((c) => c.name);
  const armsRace = {
    suppressedRivals: suppressed, // rivals you've weakened by taking their targets
    worldFightingBack: state.worldDefiance >= 40, // your dominance has stiffened the league
  };
  const common = {
    club: ctx.club,
    date: ctx.date,
    season: ctx.season,
    board: { mandate: ctx.board.mandate, mood: ctx.board.mood, patience: ctx.board.patience, warnings: ctx.board.warnings },
    coach: { identity: ctx.coach.identity, relationship: ctx.coach.relationship, mood: ctx.coach.mood, style: ctx.coach.archetype },
    realHistoryMapping: ctx.reality, // how this counterfactual maps to what really happened
    hasReshapedFromReality: divergenceFactor(state) > 0,
    armsRace,
    // The Reality Register beats lived through lately — the will-they-won't-they
    // renewals, near-misses, career forks and injuries, each resolved with or against
    // history. A headline seam of the story, so the narrator leans on it.
    realityRegister: recentRegisterBeats(state),
    threads: ctx.threads,
  };

  if (kind === 'mid-season') {
    const form = midSeasonForm(state);
    const facts = {
      ...common,
      table: ctx.league,
      momentum: ctx.form.momentum,
      inForm: form.players.filter((p) => p.flag === 'flying' || p.goals + p.assists >= 6).slice(0, 4).map((p) => ({ name: p.name, goals: p.goals, assists: p.assists, note: p.note })),
      struggling: form.players.filter((p) => ['struggling', 'misfit', 'adapting', 'fringe', 'injured'].includes(p.flag)).slice(0, 3).map((p) => ({ name: p.name, situation: p.flag, note: p.note })),
      europe: safeEuro(state),
      unsettled: ctx.squad.unsettled,
    };
    return { facts, fallback: scriptedMidSeasonNote(state) ?? `Mid-season at ${ctx.club}.` };
  }

  if (kind === 'end-of-season') {
    const scorer = topScorer(state);
    const facts = {
      ...common,
      finish: reviewData ?? null,
      europe: ctx.europe, // the most recent Champions League final and the club's part
      topScorer: scorer,
      keyMen: ctx.squad.talismen,
      unsettled: ctx.squad.unsettled,
    };
    return { facts, fallback: reviewData ? scriptedSeasonReview(state, reviewData) : `The season ends at ${ctx.club}.` };
  }

  // season-start
  const facts = {
    ...common,
    boardExpectation: ctx.board.mandate,
    spine: ctx.squad.talismen, // the side the Director will field
    emerging: ctx.squad.emerging,
    expiring: ctx.squad.expiring,
    titleThreats: leagueFavourites(state),
    europe: safeEuro(state),
  };
  return { facts, fallback: `A new season kicks off at ${ctx.club}. The squad the Director has built is set; the campaign begins.` };
}

/** Build the end-of-season review narrative from the engine's season-review data. */
export function scriptedSeasonReview(state: GameState, data: ReviewData): string {
  const club = state.clubs[state.playerClub]?.name ?? 'the club';
  const seasonLabel = `${data.season}–${String((data.season + 1) % 100).padStart(2, '0')}`;
  const lines: string[] = [];

  lines.push(
    data.wonTitle
      ? `📋 Season review — ${seasonLabel}: CHAMPIONS. ${club} finish top on ${data.points} points.`
      : `📋 Season review — ${seasonLabel}: ${club} finish ${data.finish}${ordinal(data.finish)} on ${data.points} points.`,
  );

  const scorer = topScorer(state);
  if (scorer) lines.push(`Top scorer: ${scorer.name} with ${scorer.goals} league goal${scorer.goals === 1 ? '' : 's'}${scorer.assists ? ` and ${scorer.assists} assist${scorer.assists === 1 ? '' : 's'}` : ''}.`);

  // The European run just concluded (the read layer keeps last season's final).
  try {
    const euro = europeanCampaign(state);
    if (euro.note) lines.push(euro.note);
  } catch {
    /* europe read is best-effort */
  }

  lines.push(boardVerdict(data, club));
  return lines.join('\n\n');
}

/** A lighter mid-season note, shown when the Advance lands in the winter window —
 *  the natural halfway checkpoint, so it lands roughly once per season, not monthly. */
export function scriptedMidSeasonNote(state: GameState): string | null {
  if (state.clock.window !== 'winter') return null;
  const form = midSeasonForm(state);
  if (!form.underway || form.roundsPlayed < 6) return null;
  const club = state.clubs[state.playerClub];
  const league = club?.leagueId ? state.leagues[club.leagueId] : undefined;
  if (!league) return null;
  const order = standingsOrder(league); // ordered clubIds, proper tie-breaks
  const pos = order.indexOf(state.playerClub) + 1;
  const me = league.standings[state.playerClub];
  if (!pos || !me) return null;
  const top4 = order[3] ? league.standings[order[3]]?.points ?? 0 : 0;
  const gap = top4 - me.points;
  const flyer = form.players.filter((p) => p.flag === 'flying').slice(0, 2).map((p) => p.name);
  const parts = [`⏱ Mid-season — ${club?.name} sit ${pos}${ordinal(pos)} after ${form.roundsPlayed} games on ${me.points} points${pos > 4 && gap > 0 ? `, ${gap} off the top four` : pos <= 4 ? ', inside the Champions League places' : ''}.`];
  if (flyer.length) parts.push(`Flying: ${flyer.join(' and ')}.`);
  return parts.join(' ');
}
