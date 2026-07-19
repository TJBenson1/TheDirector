/**
 * Divergence drift (§9f; docs/DESIGN-reality-default.md).
 *
 * The world follows real history by default and frays as the player pushes on
 * it. The probability of non-real storylines rises with BOTH how aggressive the
 * user has been (signings, raids) AND how much time has elapsed (butterflies
 * compound). Critically it is GATED on aggression: a passive user (aggression 0)
 * has ~0 divergence no matter how many years pass, so reality — and scripted
 * history — holds for them. This is what keeps "knowledge is an edge" true early
 * and appropriately unreliable once you've reshaped the world.
 */

import type { ClubState, GameState, PlayerState } from './types.js';
import type { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { appendMemory } from './memory.js';

/**
 * Divergence factor in [0, 1]. Zero while the user stays passive; otherwise it
 * grows with aggression and is amplified by elapsed seasons.
 */
export function divergenceFactor(state: GameState): number {
  if (state.userAggression <= 0) return 0;
  const year = Number(state.clock.date.slice(0, 4));
  const elapsedSeasons = Math.max(0, year - state.meta.startYear);
  const aggression = Math.min(1, state.userAggression * 0.045);
  const time = 1 + elapsedSeasons * 0.08;
  return Math.max(0, Math.min(1, aggression * time));
}

/** Procedural "non-real storyline" flavour, drawn as divergence rises. */
const DIVERGENT_STORYLINES = [
  'a rival club unexpectedly parts with its manager',
  'an out-of-nowhere bid reshapes a rival squad',
  'a boardroom power struggle erupts at a rival',
  'a fire-sale opens up at a struggling club',
  'a young talent breaks through ahead of his real timeline',
];

/** Months before a player can headline another suitor saga — so the sagas rotate
 *  through the world's stars rather than fixating on one man. */
const FEATURE_COOLDOWN = 18;

function ymIndex(date: string): number {
  return Number(date.slice(0, 4)) * 12 + (Number(date.slice(5, 7)) - 1);
}

/** Was this player the subject of a divergence storyline in the last `months`?
 *  A cooldown so the same star isn't "come for" every other window. */
function recentlyFeatured(state: GameState, playerId: string, months: number): boolean {
  const cutoff = ymIndex(state.clock.date) - months;
  for (let i = state.eventLog.length - 1; i >= 0; i--) {
    const e = state.eventLog[i]!;
    if (ymIndex(e.date) < cutoff) break; // eventLog is chronological
    if (e.code.startsWith('divergence.') && e.data?.playerId === playerId) return true;
  }
  return false;
}

/** Real (curated), fit, first-team stars at a simulated or context club — the pool
 *  the world writes its selling stories around (Principle 2: never anonymous
 *  filler). This is what turns curated selling clubs — Celtic's Larsson,
 *  Fenerbahçe's Rüştü, Galatasaray's Hasan Şaş — from inert depth into live
 *  sources of transfer sagas as the world diverges. */
function realStars(state: GameState, minAbility: number): PlayerState[] {
  return Object.values(state.players).filter(
    (p) => p.curated && p.club != null && !p.injury && p.ability >= minAbility && p.club !== state.playerClub,
  );
}

/** A plausible glamour suitor for `target`: a comparable-or-bigger club (a giant,
 *  prestige ≥ 82), never the player's own. Foreign context giants count — "Real
 *  Madrid come for your star" is the canonical deviation, and Madrid often sits
 *  outside the simulated league. */
function pickSuitor(state: GameState, target: PlayerState, rng: Rng): ClubState | undefined {
  const targetPrestige = target.club ? state.clubs[target.club]?.prestige ?? 0 : 0;
  const suitors = Object.values(state.clubs).filter(
    (c) => c.id !== target.club && c.prestige >= 82 && c.prestige >= targetPrestige - 3,
  );
  if (suitors.length === 0) return undefined;
  return rng.pick(suitors);
}

/**
 * A giant comes for a real star at a NON-user club — the world's own transfer
 * theatre moving without you (Real Madrid circling Larsson at Celtic). Pure,
 * logged colour: no state mutation, so it is safe to run at any divergence level.
 * All randomness is drawn from the passed (forked) stream, so it never perturbs
 * the sim's main RNG. Returns false when no eligible star can build one.
 */
function emitSuitorSagaWorld(state: GameState, rng: Rng, f: number): boolean {
  const pool = realStars(state, 82).filter((p) => !recentlyFeatured(state, p.id, FEATURE_COOLDOWN));
  if (pool.length === 0) return false;
  const target = rng.pick(pool);
  const suitor = pickSuitor(state, target, rng);
  if (!suitor || !target.club) return false;
  const holder = state.clubs[target.club];
  if (!holder) return false;
  const detail = `${suitor.name} open talks to prise ${target.name} away from ${holder.name}`;
  state.timeline.divergenceLog.push({ date: state.clock.date, kind: 'storyline', detail });
  appendMemory(state, 'divergence', detail);
  logEvent(state, {
    category: 'transfer',
    code: 'divergence.suitor',
    message: `The world diverges: ${detail}`,
    data: { divergence: Number(f.toFixed(2)), playerId: target.id, suitor: suitor.id, clubId: holder.id },
  });
  return true;
}

/**
 * Roll for a non-real storyline this window. The more the user has diverged from
 * reality, the more the world writes its own history. Prefers a concrete,
 * player-anchored suitor saga (a giant prising a real ≥82 star from his club),
 * falling back to generic flavour. Logged to the divergence log (§9f) so every
 * butterfly is traceable.
 *
 * Byte-identity for calibration: the MAIN stream consumes exactly the same draws
 * as before — the gate `rng.chance(...)` and one index draw — and ALL storyline
 * construction runs on a forked sub-stream (fork does not consume the parent), so
 * whether or not the suitor saga fires the main sim RNG is unchanged.
 */
export function rollDivergentStoryline(state: GameState, rng: Rng): void {
  const f = divergenceFactor(state);
  if (f <= 0) return;
  // Up to ~35% per window at full divergence; ~0 for a lightly-active user.
  if (!rng.chance(0.35 * f)) return;
  // One index draw on the MAIN stream (matches the previous rng.pick exactly) so
  // the generic fallback is chosen with identical RNG consumption.
  const fallbackIdx = rng.int(0, DIVERGENT_STORYLINES.length - 1);

  // Everything below draws from a forked stream — no further main-stream draws.
  const sRng = rng.fork('divergence:storyline');
  if (emitSuitorSagaWorld(state, sRng, f)) return;

  const storyline = DIVERGENT_STORYLINES[fallbackIdx]!;
  state.timeline.divergenceLog.push({
    date: state.clock.date,
    kind: 'storyline',
    detail: storyline,
  });
  appendMemory(state, 'divergence', storyline);
  logEvent(state, {
    category: 'event',
    code: 'divergence.storyline',
    message: `The world diverges: ${storyline}`,
    data: { divergence: Number(f.toFixed(2)) },
  });
}
