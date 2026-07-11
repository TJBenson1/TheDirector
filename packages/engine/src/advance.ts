/**
 * The simulation stepper (§3).
 *
 * `advanceWindow` internally steps months, accumulating events, and pauses —
 * returning control to the player — as soon as either a decision window opens
 * or an interrupt-class decision fires (`pendingDecisions` becomes non-empty).
 *
 * M1 has no mid-month systems yet, so a call simply advances to the next
 * window. M2 slots the monthly season sim into `runMonth`; M4 slots injuries
 * and interrupts in. The RNG is threaded through now so that wiring is a
 * drop-in later and determinism holds from day one.
 */

import type { GameState, LoggedEvent } from './types.js';
import { cloneState } from './state.js';
import { Rng } from './rng.js';
import { advanceOneMonth } from './clock.js';
import { eventsSince } from './eventLog.js';
import { stepLeagueMonth } from './season.js';

export interface AdvanceResult {
  state: GameState;
  events: LoggedEvent[];
}

/** Hard cap: a single advance can never span more than a full season. */
const MAX_MONTHS_PER_ADVANCE = 12;

/**
 * Per-month simulation hook. Later milestones fill this in (M2 season sim, M4
 * injuries/form). It may push onto `state.pendingDecisions` to raise an
 * interrupt. Kept as a seam so `advanceWindow`'s control flow is stable.
 */
function runMonth(state: GameState, rng: Rng): void {
  // M2: monthly league results, tables, form, season boundaries (§15).
  stepLeagueMonth(state, rng);
  // M4+: injuries, form shocks, rival moves, event rolls slot in here.
}

/**
 * Step the simulation forward to the next decision window or interrupt.
 *
 * Pure over `GameState`: clones at the boundary, mutates the draft, and returns
 * the new state plus the events produced this call. Always advances at least
 * one month so repeated calls make progress.
 */
export function advanceWindow(state: GameState): AdvanceResult {
  const draft = cloneState(state);
  const startSeq = draft.meta.nextSeq;
  const rng = new Rng(draft.meta.rngState);

  for (let stepped = 0; stepped < MAX_MONTHS_PER_ADVANCE; stepped++) {
    const window = advanceOneMonth(draft);
    runMonth(draft, rng);

    // Persist RNG progress after each month so a save mid-advance is faithful.
    draft.meta.rngState = rng.state;

    // Pause on an interrupt (an event demanded a decision) ...
    if (draft.pendingDecisions.length > 0) break;
    // ... or when a decision window opens.
    if (window) break;
  }

  return { state: draft, events: eventsSince(draft, startSeq) };
}
