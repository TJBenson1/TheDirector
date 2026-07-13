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
import { advanceOneMonth, windowForMonthIndex, windowStepLabel, WINDOW_STEPS } from './clock.js';
import { eventsSince } from './eventLog.js';
import { stepLeagueMonth } from './season.js';
import { processInjuriesMonth } from './injuries.js';
import { rollInjuryManagement } from './injuryManagement.js';
import { rollEventsMonth, resolveIgnoredDecisions } from './events.js';
import { runRivalWindow, updateWorldDefiance, processAgitationDepartures } from './rival.js';
import { logEvent } from './eventLog.js';
import { reviewBoard, rollInternalCrisis } from './board.js';
import { divergenceFactor } from './divergence.js';
import { executeLedgerWindow, executeNearMisses, applyFinancialShocks } from './ledgerExec.js';
import { resolveAbramovich } from './takeover.js';
import { decayPursuit } from './wooing.js';
import { processSeasonAgeing, processSeasonMorale } from './ageing.js';
import { processSeasonDevelopment, processAcademyGraduates } from './development.js';
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
    // 3. Develop the young, surface real academy graduates, decline/retire the
    //    old, drift morale (§5). Graduates arrive before ageing so a debutant is
    //    available to inherit minutes from a retiree the same summer.
    processSeasonDevelopment(state, rng);
    processAcademyGraduates(state, rng.fork(`academy:${state.clock.date}`));
    processSeasonAgeing(state, rng);
    processSeasonMorale(state);
    // Scheduled distress (Calciopoli, Parmalat…): drops a club into a fire-sale
    // this summer — a cheap, raidable window for the user (before the ledger runs).
    applyFinancialShocks(state);
    // 4. Rubber-band: update world defiance from last season's finish (§9a #5).
    updateWorldDefiance(state);
    // 4b. Conditional takeover butterflies (Abramovich buys Chelsea only if they
    //     take a CL place — resolved before the summer ledger runs).
    resolveAbramovich(state, rng.fork(`takeover:${state.clock.date}`));
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
  // Injury management (user-only): return-from-injury + load-management calls for
  // the user's fragile stars — the decisions reality sometimes got wrong.
  rollInjuryManagement(state, rng);
  // M7: scripted + procedural events, scandals (§9b, §9d). May raise interrupts.
  rollEventsMonth(state, rng);
  // NB: the transfer window itself (real-ledger execution + rival response) is
  // driven by `advanceWindow`, not here — a window unfolds over sub-steps (§3
  // multi-step windows) which the caller may pause between.
}

/**
 * Run one sub-step of an open transfer window (§3 multi-step windows). Each step
 * executes its slice of the real ledger; the deadline step (final) also runs the
 * rival-AI reactive layer (counter-punch/poaching, §9a) and fades courtship —
 * the once-per-window beats. The player acts between steps. A single-shot caller
 * runs only the final step, which sweeps up the whole window at once (identical
 * to the pre-multi-step single pass).
 */
function runWindowStep(state: GameState, rng: Rng, step: number): void {
  // M10: proactive AI transfers follow the REAL ledger by default (§9f) — this
  // step's slice of it (or the whole window, on a final-step sweep).
  executeLedgerWindow(state, rng, step);
  if (step >= WINDOW_STEPS) {
    // "Almost happened" deals resolve once per window (marquee, not sliced): the
    // user is offered the counterfactual, or reality holds if he isn't involved.
    executeNearMisses(state);
    // M8: the rival-AI reactive response layer, at the deadline.
    runRivalWindow(state, rng);
    decayPursuit(state); // courtship fades if you stop working a target
  }
  logEvent(state, {
    category: 'transfer',
    code: 'window.step',
    message: `${state.clock.window ?? 'transfer'} window — ${windowStepLabel(step)}`,
    data: { window: state.clock.window, step, steps: WINDOW_STEPS },
  });
}

export interface AdvanceOptions {
  /**
   * Unfold a transfer window ONE sub-step at a time, pausing between (§3
   * multi-step windows) — the interactive UI path, where the player courts
   * targets and answers real-move offers as business lands in tranches (early →
   * mid → deadline). Default `false`: a window unfolds in a single call
   * (deadline-day sweep), which is what headless/batch callers want and is
   * byte-identical to the pre-multi-step behaviour.
   */
  pausePerStep?: boolean;
}

/**
 * Step the simulation forward to the next decision window or interrupt.
 *
 * Pure over `GameState`: clones at the boundary, mutates the draft, and returns
 * the new state plus the events produced this call. Always makes progress —
 * either a calendar month or a window sub-step.
 *
 * A transfer window is not an instant: it unfolds over `WINDOW_STEPS` sub-steps
 * with real moves landing at different points (§3). In the default batch mode
 * the whole window resolves in one call; with `pausePerStep`, each call advances
 * exactly one sub-step so the player gets a turn between tranches.
 */
export function advanceWindow(state: GameState, options: AdvanceOptions = {}): AdvanceResult {
  const pausePerStep = options.pausePerStep ?? false;
  const draft = cloneState(state);
  const startSeq = draft.meta.nextSeq;
  const rng = new Rng(draft.meta.rngState);

  // A dismissed manager's career is over — the sim does not advance (M9).
  if (draft.board.dismissed) return { state: draft, events: [] };

  // Advancing with decisions still pending means the player chose to ignore
  // them — apply their fallout before stepping on (§9b).
  if (draft.pendingDecisions.length > 0) resolveIgnoredDecisions(draft);

  // Mid-window (per-step mode only): a window is open with steps remaining.
  // Unfold the next sub-step WITHOUT moving the calendar, so the player gets a
  // turn between each tranche of real business.
  if (draft.clock.window !== null && draft.clock.windowStep >= 1 && draft.clock.windowStep < WINDOW_STEPS) {
    draft.clock.windowStep += 1;
    runWindowStep(draft, rng, draft.clock.windowStep);
    draft.meta.rngState = rng.state;
    return { state: draft, events: eventsSince(draft, startSeq) };
  }

  // A fully-unfolded window: clear the sub-step so the loop below advances the
  // calendar on to the next window.
  if (draft.clock.window !== null && draft.clock.windowStep >= WINDOW_STEPS) {
    draft.clock.windowStep = 0;
  }

  for (let stepped = 0; stepped < MAX_MONTHS_PER_ADVANCE; stepped++) {
    const window = advanceOneMonth(draft);
    runMonth(draft, rng);

    // A window opened this month. `advanceOneMonth` set windowStep = 1. Either
    // run only the first sub-step (pause between the rest), or — the default —
    // sweep the whole window in one final-step pass (batch/headless).
    if (window !== null) {
      if (pausePerStep) {
        runWindowStep(draft, rng, 1);
      } else {
        draft.clock.windowStep = WINDOW_STEPS;
        runWindowStep(draft, rng, WINDOW_STEPS);
      }
    }

    // Persist RNG progress after each month so a save mid-advance is faithful.
    draft.meta.rngState = rng.state;

    // Pause on an interrupt (an event demanded a decision) ...
    if (draft.pendingDecisions.length > 0) break;
    // ... or when a decision window opens.
    if (window) break;
  }

  return { state: draft, events: eventsSince(draft, startSeq) };
}
