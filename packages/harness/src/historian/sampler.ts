/**
 * Sampling strategy (§3): review DIVERGENCES, not everything. From a finished
 * career (final GameState + event log) we select the handful of items where
 * unrealism actually lives — divergence chains, ambition overrides, career
 * arcs, a couple of full windows, table checkpoints, event sequences, plus a
 * small reality-fidelity control — and attach the reference slice each needs.
 *
 * Everything here is a deterministic, pure read: same state + same seed ⇒ same
 * items, so a flagged build reproduces exactly.
 */

import {
  Rng,
  parseYearMonth,
  type ClubId,
  type GameState,
  type LoggedEvent,
  type PlayerId,
} from '@director/engine';
import { buildReferenceSlice, type ReferenceQuery } from './reference-loader.js';
import type { ReviewCategory, ReviewItem } from './types.js';

export interface SampleOptions {
  /** A fee (or top-player) at/above which a divergence is "significant" (§3). */
  significantFee?: number;
  /** Ability proxy for a "top-30 player" whose move is always significant. */
  topPlayerAbility?: number;
  /** ~20 key player arcs sampled per career. */
  keyPlayersPerCareer?: number;
  /** 2–3 random full transfer windows per career. */
  windowsPerCareer?: number;
  /** 10–15 random event sequences per career. */
  eventsPerCareer?: number;
  /** Small reality-fidelity control sample. */
  realityControlPerCareer?: number;
  /** Hard cap on items per career (keeps LLM calls to a few dozen per batch). */
  maxItemsPerCareer?: number;
}

const DEFAULTS: Required<SampleOptions> = {
  significantFee: 10_000_000,
  topPlayerAbility: 82,
  keyPlayersPerCareer: 20,
  windowsPerCareer: 3,
  eventsPerCareer: 15,
  realityControlPerCareer: 3,
  maxItemsPerCareer: 45,
};

/** Divergence/butterfly codes — every one above the significance bar is reviewed. */
const DIVERGENCE_CODES = new Set([
  'divergence.storyline',
  'ledger.fallback',
  'ledger.cancelled',
  'ledger.alternative',
  'ledger.unavailable',
]);
const EVENT_SEQ_CODES = new Set([
  'scandal.fired',
  'injury.serious',
  'internal.crisis',
  'poach.completed',
  'rival.counterpunch',
]);

function num(data: Record<string, unknown> | undefined, key: string): number | undefined {
  const v = data?.[key];
  return typeof v === 'number' ? v : undefined;
}
function str(data: Record<string, unknown> | undefined, key: string): string | undefined {
  const v = data?.[key];
  return typeof v === 'string' ? v : undefined;
}

/** Deterministically take up to n elements (shuffled copy). */
function sampleN<T>(arr: readonly T[], n: number, rng: Rng): T[] {
  if (arr.length <= n) return [...arr];
  return rng.shuffle([...arr]).slice(0, n);
}

/** Clubs/players referenced by an event, for the reference slice. */
function refsForEvent(e: LoggedEvent): ReferenceQuery {
  const clubIds: ClubId[] = [];
  for (const k of ['from', 'to', 'clubId', 'buyer']) {
    const v = e.data?.[k];
    if (typeof v === 'string') clubIds.push(v);
  }
  const playerIds: PlayerId[] = [];
  const p = e.data?.playerId;
  if (typeof p === 'string') playerIds.push(p);
  return { clubIds, playerIds, window: e.date };
}

// ── Sample producers ─────────────────────────────────────────────────────────

/** ALL significant divergence chains (§3, 100% coverage above the bar). */
function sampleDivergences(state: GameState, careerId: string, opts: Required<SampleOptions>): ReviewItem[] {
  const items: ReviewItem[] = [];

  // The divergence log itself — every logged butterfly.
  state.timeline.divergenceLog.forEach((d, i) => {
    items.push({
      id: `div-log:${careerId}:${i}`,
      category: 'divergence-chain',
      summary: `${d.date} ${d.kind}: ${d.detail}`,
      significance: 0.9,
      payload: { source: 'divergenceLog', ...d },
      reference: buildReferenceSlice(state),
    });
  });

  // Event-log butterflies above the significance bar.
  for (const e of state.eventLog) {
    if (!DIVERGENCE_CODES.has(e.code)) continue;
    const fee = num(e.data, 'fee') ?? 0;
    const significant = fee >= opts.significantFee || e.code !== 'divergence.storyline';
    if (!significant) continue;
    items.push({
      id: `div:${careerId}:${e.seq}`,
      category: 'divergence-chain',
      summary: `${e.date} ${e.code}: ${e.message}`,
      significance: fee >= opts.significantFee ? 1 : 0.8,
      payload: { code: e.code, date: e.date, message: e.message, ...e.data },
      reference: buildReferenceSlice(state, refsForEvent(e)),
    });
  }
  return items;
}

/** ALL ambition overrides (§3, 100% — the riskiest mechanic). Forward-compatible
 *  with the M8 override event; keyed off an override marker in event data. */
function sampleAmbitionOverrides(state: GameState, careerId: string): ReviewItem[] {
  const items: ReviewItem[] = [];
  for (const e of state.eventLog) {
    const isOverride = e.code === 'ambition.override' || e.data?.override === true;
    if (!isOverride) continue;
    items.push({
      id: `amb:${careerId}:${e.seq}`,
      category: 'ambition-override',
      summary: `${e.date} ambition override: ${e.message}`,
      significance: 1,
      payload: { code: e.code, date: e.date, message: e.message, ...e.data },
      reference: buildReferenceSlice(state, refsForEvent(e)),
    });
  }
  return items;
}

/** ~20 key player arcs: a mix of superstars, prospects and real players (§3). */
function sampleCareerArcs(
  state: GameState,
  careerId: string,
  rng: Rng,
  opts: Required<SampleOptions>,
): ReviewItem[] {
  // Only REAL (curated) players get individually-reviewed career arcs — procedural
  // filler is anonymous depth, never surfaced as a named career (a user directive:
  // no fake players in the narrative). Judge real arcs against reality.
  const players = Object.values(state.players).filter((p) => p.curated);
  const currentYear = parseYearMonth(state.clock.date).year;

  const superstars = players.filter((p) => p.ability >= opts.topPlayerAbility);
  const prospects = players.filter((p) => p.wonderkid);
  // A blended pool, deduped by id, then sampled to the budget.
  const poolMap = new Map<PlayerId, (typeof players)[number]>();
  for (const p of [...superstars, ...prospects, ...sampleN(players, opts.keyPlayersPerCareer, rng)]) {
    poolMap.set(p.id, p);
  }
  const picked = sampleN([...poolMap.values()], opts.keyPlayersPerCareer, rng);

  return picked.map((p) => {
    const age = currentYear - p.birthYear;
    return {
      id: `arc:${careerId}:${p.id}`,
      category: 'career-arc' as ReviewCategory,
      summary: `${p.name} (age ${age}) ability ${p.ability}/ceiling ${p.birthCeiling}, at ${p.club ?? 'free'}`,
      significance: p.ability >= opts.topPlayerAbility ? 0.7 : 0.5,
      payload: {
        playerId: p.id,
        name: p.name,
        age,
        // Position is decisive for judging an arc: a 37-year-old GK at 90 or a
        // defender with 0 goals is normal; the same numbers for a striker are not.
        positions: p.positions,
        club: p.club,
        curated: p.curated,
        ability: p.ability,
        potentialCeiling: p.potentialCeiling,
        birthCeiling: p.birthCeiling,
        ...(p.latentCeiling !== undefined ? { latentCeiling: p.latentCeiling } : {}),
        reachedPotential: p.reachedPotential,
        wonderkid: p.wonderkid,
        benchedDevSeasons: p.benchedDevSeasons,
        adaptation: p.adaptation,
        lastSeason: p.lastSeason,
        morale: p.morale,
      },
      reference: buildReferenceSlice(state, {
        playerIds: [p.id],
        clubIds: p.club ? [p.club] : [],
      }),
    };
  });
}

/** 2–3 random full transfer windows — the control that catches background weirdness. */
function sampleTransferWindows(
  state: GameState,
  careerId: string,
  rng: Rng,
  opts: Required<SampleOptions>,
): ReviewItem[] {
  const byWindow = new Map<string, LoggedEvent[]>();
  for (const e of state.eventLog) {
    if (e.category !== 'transfer' && !e.code.startsWith('ledger.') && e.code !== 'rival.counterpunch') continue;
    const list = byWindow.get(e.date) ?? [];
    list.push(e);
    byWindow.set(e.date, list);
  }
  const windows = sampleN([...byWindow.keys()], opts.windowsPerCareer, rng);
  return windows.map((w) => {
    const events = byWindow.get(w)!;
    const clubIds = new Set<ClubId>();
    for (const e of events) for (const q of refsForEvent(e).clubIds ?? []) clubIds.add(q);
    return {
      id: `win:${careerId}:${w}`,
      category: 'transfer-window' as ReviewCategory,
      summary: `${w}: ${events.length} transfer event(s)`,
      significance: 0.5,
      payload: {
        window: w,
        moves: events.map((e) => ({ code: e.code, message: e.message, ...e.data })),
      },
      reference: buildReferenceSlice(state, { clubIds, window: w }),
    };
  });
}

/** All 5-year table/trophy checkpoints — catches trajectory fantasy (§3). */
function sampleTableCheckpoints(state: GameState, careerId: string): ReviewItem[] {
  const items: ReviewItem[] = [];
  for (const league of Object.values(state.leagues)) {
    const history = league.titleHistory;
    if (history.length === 0) continue;
    // A checkpoint at every 5th season and at the end.
    const marks = new Set<number>();
    for (let i = 4; i < history.length; i += 5) marks.add(i);
    marks.add(history.length - 1);
    for (const i of [...marks].sort((a, b) => a - b)) {
      const window = history.slice(Math.max(0, i - 4), i + 1);
      const champions = window.map((t) => t.championId);
      const counts = champions.reduce<Record<string, number>>((acc, c) => {
        acc[c] = (acc[c] ?? 0) + 1;
        return acc;
      }, {});
      const topStreak = Math.max(...Object.values(counts));
      items.push({
        id: `table:${careerId}:${league.id}:${history[i]!.seasonYear}`,
        category: 'table-checkpoint',
        summary: `${league.name} through ${history[i]!.seasonYear}: champions ${window.map((t) => `${t.seasonYear} ${t.championId}`).join(', ')}`,
        significance: topStreak > 4 ? 0.85 : 0.5,
        payload: {
          leagueId: league.id,
          throughSeason: history[i]!.seasonYear,
          recentChampions: window,
          championCounts: counts,
          longestStreakInWindow: topStreak,
        },
        reference: buildReferenceSlice(state, { clubIds: Object.keys(counts) }),
      });
    }
  }
  return items;
}

/** 10–15 random event sequences (scandals/crises/injuries) — tone/frequency (§3). */
function sampleEventSequences(
  state: GameState,
  careerId: string,
  rng: Rng,
  opts: Required<SampleOptions>,
): ReviewItem[] {
  const candidates = state.eventLog.filter((e) => EVENT_SEQ_CODES.has(e.code));
  return sampleN(candidates, opts.eventsPerCareer, rng).map((e) => ({
    id: `evt:${careerId}:${e.seq}`,
    category: 'event-sequence' as ReviewCategory,
    summary: `${e.date} ${e.code}: ${e.message}`,
    significance: 0.55,
    payload: { code: e.code, date: e.date, message: e.message, ...e.data },
    reference: buildReferenceSlice(state, refsForEvent(e)),
  }));
}

/** Small reality-fidelity control: confirm the default timeline reads right (§3). */
function sampleRealityControl(
  state: GameState,
  careerId: string,
  rng: Rng,
  opts: Required<SampleOptions>,
): ReviewItem[] {
  const held = state.eventLog.filter((e) => e.code === 'ledger.executed');
  return sampleN(held, opts.realityControlPerCareer, rng).map((e) => ({
    id: `real:${careerId}:${e.seq}`,
    category: 'reality-control' as ReviewCategory,
    summary: `${e.date} reality held: ${e.message}`,
    significance: 0.25,
    payload: { code: e.code, date: e.date, message: e.message, ...e.data },
    reference: buildReferenceSlice(state, refsForEvent(e)),
  }));
}

/**
 * Sample the review items for one finished career. `careerId` labels the items
 * uniquely across a batch; `seed` seeds the (deterministic) selection.
 */
export function sampleCareer(
  state: GameState,
  careerId: string,
  options: SampleOptions = {},
): ReviewItem[] {
  const opts = { ...DEFAULTS, ...options };
  const rng = Rng.fromSeed(`historian:${careerId}:${state.meta.seed}`);

  const items: ReviewItem[] = [
    // 100%-coverage categories first — never dropped by the cap.
    ...sampleDivergences(state, careerId, opts),
    ...sampleAmbitionOverrides(state, careerId),
    // Then the sampled categories.
    ...sampleCareerArcs(state, careerId, rng.fork('arcs'), opts),
    ...sampleTransferWindows(state, careerId, rng.fork('windows'), opts),
    ...sampleTableCheckpoints(state, careerId),
    ...sampleEventSequences(state, careerId, rng.fork('events'), opts),
    ...sampleRealityControl(state, careerId, rng.fork('control'), opts),
  ];

  if (items.length <= opts.maxItemsPerCareer) return items;
  // Over budget: keep every 100%-coverage item, then fill by significance.
  // Divergences and overrides are where unrealism lives; table checkpoints catch
  // trajectory fantasy (a SEVERE archetype) and are few — never drop them.
  const isMustKeep = (c: string) =>
    c === 'divergence-chain' || c === 'ambition-override' || c === 'table-checkpoint';
  const mustKeep = items.filter((i) => isMustKeep(i.category));
  const rest = items
    .filter((i) => !isMustKeep(i.category))
    .sort((a, b) => b.significance - a.significance);
  return [...mustKeep, ...rest].slice(0, Math.max(mustKeep.length, opts.maxItemsPerCareer));
}
