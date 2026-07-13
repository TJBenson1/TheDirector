/**
 * The Champions League / European Cup (§ butterfly showcase).
 *
 * A continental knockout run each season alongside the domestic leagues. This is
 * where the counterfactual bites hardest: the winner falls out of CLUB STRENGTH,
 * which is squad-derived, so any butterfly the user (or a chain of them) sets off
 * — a weakened Barça that never landed Ronaldinho, a strengthened United that
 * kept Piqué — changes who lifts the trophy, and why.
 *
 * Design: the field is the domestic league's real qualifiers (top four) plus the
 * strongest cross-European context clubs (each standing in for its own league's
 * entrants). A standard seeded single-elimination bracket keeps the two best
 * apart until the final; each tie is decided by a logistic on the strength gap
 * with a floor/ceiling, so favourites usually go through but upsets always can.
 */

import type { ClubId, GameState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { standingsOrder } from './season.js';
import { eraForScenario } from './ledger.js';
/**
 * The club's strength through the CONTINENTAL lens (§ butterfly showcase): the
 * domestic `strength` PLUS the star premium a BUTTERFLY has added or stripped
 * (`starButterfly`). Building on `strength` keeps every domestic signal (squad
 * churn, ageing, a scripted sapping) intact; the added term is non-zero only when
 * a USER or rival deviation has moved a talisman off his real path — reality's own
 * star shuffles and ordinary ageing never touch it. So a passive world reads
 * exactly `strength` (= `baseStrength`) and reproduces the real European Cup
 * winners, while a spine gutted by a deviation bites: a different side lifts it.
 */
function clStrength(state: GameState, id: ClubId): number {
  const c = state.clubs[id];
  if (!c) return 0;
  return Math.max(20, Math.min(99, c.strength + (c.starButterfly ?? 0)));
}

/**
 * Real Champions League / European Cup winners, by ERA pack and SEASON YEAR (the
 * opening year — the final is the following spring). Reality-default: the real
 * winner holds UNLESS a butterfly has knocked them off the top of the European
 * strength table (see `ANCHOR_MARGIN`). Only winners that exist as modelled clubs
 * in the relevant pack are listed; anything else falls through to a pure strength
 * knockout. `r` is the runner-up where it too is modelled.
 */
type RealFinal = { w: ClubId; r?: ClubId };
const REAL_UCL: Record<string, Record<number, RealFinal>> = {
  'era-serie-a-1995': {
    1995: { w: 'juventus', r: 'ajax' },
    1996: { w: 'dortmund', r: 'juventus' },
    1997: { w: 'real_madrid', r: 'juventus' },
    2000: { w: 'bayern' },
    2001: { w: 'real_madrid' },
    2002: { w: 'milan' },
    2005: { w: 'barcelona' },
  },
  'era-2000': {
    2000: { w: 'bayern' },
    2001: { w: 'real_madrid' },
    2002: { w: 'milan' },
    2004: { w: 'liverpool' },
    2005: { w: 'barcelona' },
  },
  'era-2004': {
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
  },
  'era-2003': {
    2003: { w: 'porto', r: 'monaco' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
  },
  'era-1995-2005': {
    1999: { w: 'real_madrid' },
    2000: { w: 'bayern' },
    2001: { w: 'real_madrid' },
    2002: { w: 'milan', r: 'juventus' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern', r: 'chelsea' },
    2013: { w: 'real_madrid' },
  },
};

/** Reality deviates only when a butterfly moves the balance: the real winner is
 *  weakened this far below their own baseline, or a rival out-swings them this
 *  far. Small, because squad-strength deltas from real transfers are small. */
const ANCHOR_DROP = 3;
const ANCHOR_SWING = 6;

/** How many clubs contest the knockout (a clean 16-team bracket when possible). */
const FIELD_SIZE = 16;
/** Logistic spread: a `K`-point strength edge ≈ 73% to advance a single tie. */
const K = 7;
/** Even a heavy favourite can go out; even a minnow can spring one. */
const MIN_ADVANCE = 0.12;
const MAX_ADVANCE = 0.9;

function eligible(state: GameState, id: ClubId): boolean {
  const c = state.clubs[id];
  // A currently-relegated club (out of the top flight this season) does not
  // contest Europe.
  return !!c && c.relegatedUntil === undefined;
}

/** The standard single-elimination seeding order for a bracket of size `n`
 *  (power of two): returns seed numbers 1..n arranged so 1 and 2 can only meet
 *  in the final. e.g. n=4 → [1,4,2,3]. */
function seedOrder(n: number): number[] {
  let order = [1, 2];
  while (order.length < n) {
    const size = order.length * 2;
    const next: number[] = [];
    for (const s of order) {
      next.push(s);
      next.push(size + 1 - s);
    }
    order = next;
  }
  return order;
}

/** Assemble this season's field: domestic top four + strongest context clubs. */
function buildField(state: GameState): ClubId[] {
  const userLeague = state.leagues[state.clubs[state.playerClub]?.leagueId ?? ''];
  const seen = new Set<ClubId>();
  const field: ClubId[] = [];
  const add = (id: ClubId) => {
    if (!seen.has(id) && eligible(state, id)) {
      seen.add(id);
      field.push(id);
    }
  };

  // Real qualification: the domestic league's top four.
  if (userLeague) for (const id of standingsOrder(userLeague).slice(0, 4)) add(id);

  // Fill from the strongest cross-European context clubs (each its league's
  // entrant), then, if still short, deeper domestic qualifiers.
  const context = Object.values(state.clubs)
    .filter((c) => c.leagueId === null)
    .sort((a, b) => clStrength(state, b.id) - clStrength(state, a.id))
    .map((c) => c.id);
  for (const id of context) {
    if (field.length >= FIELD_SIZE) break;
    add(id);
  }
  if (userLeague) for (const id of standingsOrder(userLeague)) {
    if (field.length >= FIELD_SIZE) break;
    add(id);
  }

  // Trim to the largest power of two ≤ field size (min 4) for a clean bracket.
  let size = 1;
  while (size * 2 <= Math.min(field.length, FIELD_SIZE)) size *= 2;
  return field
    .sort((a, b) => (clStrength(state, b) - clStrength(state, a)))
    .slice(0, size);
}

/** Probability the stronger side (by `sa` vs `sb`) advances a single tie. */
function advanceProb(sa: number, sb: number): number {
  const p = 1 / (1 + Math.exp(-(sa - sb) / K));
  return Math.max(MIN_ADVANCE, Math.min(MAX_ADVANCE, p));
}

/**
 * Simulate the season's Champions League and record the winner. Uses the field's
 * current squad strengths, so it reflects every butterfly to date. Called at the
 * July rollover for the season just completed (before the summer market runs).
 */
export function simulateChampionsLeague(state: GameState, rng: Rng, seasonYear: number): void {
  const seeds = buildField(state);
  if (seeds.length < 4) return; // not enough of a field to bother

  state.europeanCup ??= { name: 'Champions League', titleHistory: [] };
  const record = (winnerId: ClubId, runnerUpId: ClubId, real: boolean, realWinner?: ClubId) => {
    state.europeanCup!.titleHistory.push({ seasonYear, winnerId, runnerUpId });
    logEvent(state, {
      category: 'match',
      code: 'ucl.final',
      message: `${state.clubs[winnerId]!.name} win the Champions League (${seasonYear}–${seasonYear + 1}), beating ${state.clubs[runnerUpId]!.name} in the final`,
      data: { seasonYear, winnerId, runnerUpId, real },
    });
    if (!real && realWinner && realWinner !== winnerId) {
      state.timeline.divergenceLog.push({
        date: state.clock.date,
        kind: 'butterfly',
        detail: `Champions League ${seasonYear + 1}: ${state.clubs[realWinner]?.name ?? realWinner} were no longer strong enough to win it — ${state.clubs[winnerId]!.name} lift the European Cup instead.`,
      });
    }
  };

  const field = new Set(seeds);

  // Reality-default via BUTTERFLY DELTA, not absolute strength: reality isn't
  // strength-monotonic (Liverpool 2005, Porto 2004 were upset winners), so the
  // real winner holds by default and is unseated only when a butterfly has moved
  // the balance — dropped THEIR strength below their real baseline, or lifted a
  // rival's above them by a clear swing. In a passive world every delta is ~0, so
  // every real winner is reproduced exactly.
  const delta = (id: ClubId): number => clStrength(state, id) - state.clubs[id]!.baseStrength;
  const real = REAL_UCL[eraForScenario(state.meta.scenarioId)]?.[seasonYear];
  if (real && field.has(real.w)) {
    const rwDelta = delta(real.w);
    let maxRivalSwing = -Infinity;
    for (const id of seeds) if (id !== real.w) maxRivalSwing = Math.max(maxRivalSwing, delta(id));
    const outSwung = maxRivalSwing - rwDelta > ANCHOR_SWING;
    if (rwDelta >= -ANCHOR_DROP && !outSwung) {
      const runnerUp = real.r && field.has(real.r) ? real.r : seeds.find((id) => id !== real.w) ?? real.w;
      record(real.w, runnerUp, true);
      return;
    }
  }

  // Otherwise the knockout decides on merit (a butterfly-driven deviation, or a
  // year/era with no anchored real winner in the field).
  const r = rng.fork(`ucl:${seasonYear}`);
  let bracket: ClubId[] = seedOrder(seeds.length).map((seed) => seeds[seed - 1]!);
  let runnerUp: ClubId = seeds[1] ?? seeds[0]!;
  while (bracket.length > 1) {
    const next: ClubId[] = [];
    for (let i = 0; i < bracket.length; i += 2) {
      const a = bracket[i]!;
      const b = bracket[i + 1]!;
      const aWins = r.next() < advanceProb(clStrength(state, a), clStrength(state, b));
      if (bracket.length === 2) runnerUp = aWins ? b : a; // this tie is the final
      next.push(aWins ? a : b);
    }
    bracket = next;
  }
  record(bracket[0]!, runnerUp, false, real?.w);
}
