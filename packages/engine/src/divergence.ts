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

import type { GameState } from './types.js';
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

/**
 * Roll for a non-real storyline this window. The more the user has diverged from
 * reality, the more the world writes its own history. Logged to the divergence
 * log (§9f) so every butterfly is traceable.
 */
export function rollDivergentStoryline(state: GameState, rng: Rng): void {
  const f = divergenceFactor(state);
  if (f <= 0) return;
  // Up to ~35% per window at full divergence; ~0 for a lightly-active user.
  if (!rng.chance(0.35 * f)) return;

  const storyline = rng.pick(DIVERGENT_STORYLINES);
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
