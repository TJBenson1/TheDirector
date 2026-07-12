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
import { processInjuriesMonth } from './injuries.js';
import { rollEventsMonth, resolveIgnoredDecisions } from './events.js';
import { runRivalWindow, updateWorldDefiance, processAgitationDepartures } from './rival.js';
import { windowForMonthIndex } from './clock.js';
import { reviewBoard, rollInternalCrisis } from './board.js';
import { divergenceFactor } from './divergence.js';
import { executeLedgerWindow } from './ledgerExec.js';
import { processSeasonAgeing, processSeasonMorale } from './ageing.js';
import { processSeasonDevelopment } from './development.js';
import { computeSeasonStats } from './stats.js';
import { resolveAdaptationSeason } from './adaptation.js';
import { recomputeClubStrength } from './players.js';

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
  // Season rollover (July), in order:
  if (state.clock.monthIndex === 0) {
    // 1. Bank the season just played as per-player output (drives valuation).
    computeSeasonStats(state, rng);
    // 2. Resolve a season of adaptation (bloom or permanent residual, §3).
    resolveAdaptationSeason(state, rng);
    // 3. Develop the young, decline the old, drift morale (§5).
    processSeasonDevelopment(state, rng);
    processSeasonAgeing(state, rng);
    processSeasonMorale(state);
    // 4. Rubber-band: update world defiance from last season's finish (§9a #5).
    updateWorldDefiance(state);
    // 5. Board review (job security) + an imposed internal crisis (M9).
    reviewBoard(state, rng.fork(`board:${state.clock.date}`));
    rollInternalCrisis(state, rng.fork(`crisis:${state.clock.date}`), divergenceFactor(state) * 0.3);
    // Sustained unrest can force a kept-against-his-wishes player out.
    processAgitationDepartures(state, rng.fork(`agitation:${state.clock.date}`));
    // 6. Reconcile strength for all simulated clubs after ability changes.
    for (const club of Object.values(state.clubs)) {
      if (club.leagueId !== null) recomputeClubStrength(state, club.id);
    }
  }
  // M2: monthly league results, tables, form, season boundaries (§15).
  stepLeagueMonth(state, rng);
  // M4: injuries/recoveries (§9c) — after matches, so a new injury bites the
  // following month and availability feeds strength.
  processInjuriesMonth(state, rng);
  // M7: scripted + procedural events, scandals (§9b, §9d). May raise interrupts.
  rollEventsMonth(state, rng);
  // M10: proactive AI transfers follow the REAL ledger by default (§9f), then
  // M8: the rival-AI reactive response layer (counter-punch, poaching, §9a).
  if (windowForMonthIndex(state.clock.monthIndex) !== null) {
    executeLedgerWindow(state, rng);
    runRivalWindow(state, rng);
  }
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

  // A dismissed manager's career is over — the sim does not advance (M9).
  if (draft.board.dismissed) return { state: draft, events: [] };

  // Advancing with decisions still pending means the player chose to ignore
  // them — apply their fallout before stepping on (§9b).
  if (draft.pendingDecisions.length > 0) resolveIgnoredDecisions(draft);

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
