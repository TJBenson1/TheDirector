/**
 * Run one headless career end-to-end (§1 rule #4). This is the unit the Monte
 * Carlo batch multiplies by ≥500.
 *
 * The loop is the real game loop: advance to the next window/interrupt, let the
 * strategy bot answer any pending decisions, repeat until the horizon. M1 has
 * no decisions or mid-month systems, so a career is a clean walk through the
 * two-clock model — which is exactly what we want to stress at this stage
 * (determinism + it-actually-scales). Metric collection hooks are in place for
 * later milestones to populate.
 */

import {
  createNewGame,
  advanceWindow,
  attemptSigning,
  evaluateApproach,
  applyDecision,
  parseYearMonth,
  maxConsecutiveTitles,
  significantInjuredCount,
  cloneState,
  type GameState,
  type NewGameOptions,
  Rng,
} from '@director/engine';
import { emptyCareerMetrics, type CareerMetrics } from './metrics.js';
import type { StrategyBot } from './strategy.js';

export interface RunCareerOptions extends NewGameOptions {
  years: number;
  bot: StrategyBot;
}

/** Guard against a stuck loop: 15 years ≈ 30 windows; cap well above that. */
const MAX_ITERATIONS = 400;

export function runCareer(options: RunCareerOptions): CareerMetrics {
  const { years, bot } = options;
  let state: GameState = createNewGame(options);

  const startYear = parseYearMonth(state.clock.date).year;
  const endYear = startYear + years;
  const metrics = emptyCareerMetrics(state.meta.seed, years);

  // A dedicated stream for any bot-side randomness, forked so it never
  // perturbs the engine's own rolls.
  const botRng = new Rng(state.meta.rngState).fork('harness:bot');

  // Decade buckets with a major injury crisis / user scandal, for calibration.
  const crisisDecades = new Set<number>();
  const scandalDecades = new Set<number>();
  // Distinct user stars held over the career ("keep him happy" campaigns).
  const starIds = new Set<string>();
  // A career is "zero-divergence" if the user makes no transfers — the control
  // for scripted-event fidelity (§12). Active careers measure star retention.
  const zeroDivergence = !bot.transferActions;
  const decadeOf = () => Math.floor((parseYearMonth(state.clock.date).year - startYear) / 10);

  let iterations = 0;
  while (parseYearMonth(state.clock.date).year < endYear && iterations < MAX_ITERATIONS) {
    iterations++;

    // Resolve interrupts the world raised: apply the bot's chosen options via
    // the decision engine. Options the bot declines to answer are left pending
    // and applied as "ignored" fallout when the window advances (§9b).
    if (state.pendingDecisions.length > 0) {
      const chosen = bot.decide(state, state.pendingDecisions, botRng);
      const byId = new Map(chosen.map((c) => [c.decisionId, c.choiceId]));
      for (const d of [...state.pendingDecisions]) {
        const choiceId = byId.get(d.id);
        if (choiceId) state = applyDecision(state, d.id, choiceId).state;
      }
    }

    // Summer transfer window.
    if (state.clock.window === 'summer') {
      const draft = cloneState(state);

      // Probe the hard-block invariant (§6), read-only: an unlimited-budget
      // approach to any hard-blocked player must be refused (a willing verdict
      // would let the deal complete). None may ever pass before unlock.
      const y = parseYearMonth(draft.clock.date).year;
      for (const p of Object.values(draft.players)) {
        const blocked = p.resistance.hardBlocks.some((b) => (b.untilYear ?? Infinity) > y);
        if (!blocked || p.club === draft.playerClub) continue;
        metrics.hardBlockedApproaches += 1;
        const verdict = evaluateApproach(draft, {
          playerId: p.id,
          toClub: draft.playerClub,
          wageOffer: p.wage * 5,
        });
        if (verdict.willing) metrics.hardBlockedCompletedBeforeUnlock += 1;
      }

      // Apply the bot's transfer activity WITH agency (attemptSigning consults
      // willingness). Cross-border signings feed the adaptation metric; domestic
      // raids feed the counter-punch metric (tracked via engine events).
      if (bot.transferActions) {
        for (const req of bot.transferActions(draft, botRng)) {
          const target = draft.players[req.playerId];
          const sellerLeague = target?.club ? draft.clubs[target.club]?.leagueId : undefined;
          const wasForeign = sellerLeague === null;
          const wasRaid = sellerLeague != null && target?.club !== draft.playerClub;
          const res = attemptSigning(draft, req);
          if (res.ok) {
            const signed = draft.players[res.playerId];
            if (wasForeign && signed?.adaptation) {
              metrics.logicalSignings += 1;
              if (signed.adaptation.outcome !== 'seamless') metrics.signingsUnderperformingFirstSeason += 1;
            }
            // A raid on a simulated rival — the counter-punch is tracked via the
            // engine's rival.counterpunch event during the following advance.
            if (wasRaid) metrics.raidsSuffered += 1;
          }
        }
      }

      // Track the user's stars (a "keep him happy" campaign per §12) — only in
      // active careers, where the rival response layer is in play.
      if (!zeroDivergence) {
        for (const id of draft.clubs[draft.playerClub]?.squad ?? []) {
          const p = draft.players[id];
          if (p && p.ability >= 82) starIds.add(p.id);
        }
      }
      state = draft;
    }

    const before = state.eventLog.length;
    const result = advanceWindow(state);
    state = result.state;

    metrics.windowsAdvanced++;
    metrics.monthsSimulated += result.events.filter((e) => e.code === 'month.advanced').length;
    // League-wide serious injuries (logged by the engine).
    metrics.seriousInjuriesLeagueWide += result.events.filter(
      (e) => e.code === 'injury.serious',
    ).length;

    // Events fired this advance: scandals, scripted fidelity, raids/counters,
    // and poaching of the user's stars (§9a, §9b, §9d).
    for (const e of result.events) {
      if (e.code === 'scandal.fired' && e.data?.user === true) scandalDecades.add(decadeOf());
      if (e.code === 'rival.counterpunch') metrics.raidsCounterPunchedWithin2Windows += 1;
      if (e.code === 'poach.completed' && e.data?.from === state.playerClub) {
        metrics.keepHappyEndedInDeparture += 1;
      }
      // Scripted fidelity is a zero-divergence measure only (§12).
      if (zeroDivergence && e.code === 'scripted.fired') {
        metrics.scriptedEventsExpected += 1;
        metrics.scriptedEventsFired += 1;
      } else if (zeroDivergence && e.code === 'scripted.skipped') {
        metrics.scriptedEventsExpected += 1;
      }
    }

    // Internal crises imposed on the player (§ internal-friction).
    metrics.internalCrises += result.events.filter((e) => e.code === 'internal.crisis').length;

    // Sample the user club for a major injury crisis.
    if (significantInjuredCount(state, state.playerClub) >= 3) crisisDecades.add(decadeOf());

    // Dismissal ends the career (M9).
    if (state.board.dismissed) {
      metrics.careerEndedInSack = 1;
      break;
    }

    // Safety: if an advance produced nothing, bail rather than spin.
    if (state.eventLog.length === before) break;
  }

  metrics.userMajorInjuryCrisisDecades = crisisDecades.size;
  metrics.userScandalDecades = scandalDecades.size;
  metrics.keepHappyCampaigns = starIds.size;

  collectEndOfCareerMetrics(state, metrics);
  return metrics;
}

/**
 * Read final-state metrics that are cheaper to derive once at the end than to
 * accumulate each window. M1 has nothing to read yet; later milestones fill
 * this in (titles won, squad-seasons, etc.).
 */
function collectEndOfCareerMetrics(state: GameState, metrics: CareerMetrics): void {
  // M2: longest title streak by any club (dynasty target, §12) and the number
  // of club-seasons simulated (denominator for the serious-injury rate, M4).
  metrics.maxConsecutiveTitlesAnyClub = maxConsecutiveTitles(state);
  let squadSeasons = 0;
  for (const league of Object.values(state.leagues)) {
    squadSeasons += league.clubIds.length * league.titleHistory.length;
  }
  metrics.squadSeasons = squadSeasons;

  // M5: wonderkid outcomes (§12 + internal-friction §5). Benched (<40% mins,
  // 2+ yrs) should almost never reach ceiling; well-managed should reach it
  // only ~40–60% of the time — development is not on rails.
  for (const player of Object.values(state.players)) {
    if (!player.wonderkid) continue;
    if (player.benchedDevSeasons >= 2) {
      metrics.benchedWonderkids += 1;
      if (player.reachedPotential) metrics.benchedWonderkidsReachedCeiling += 1;
    } else {
      metrics.wellManagedWonderkids += 1;
      if (player.reachedPotential) metrics.wellManagedWonderkidsReachedCeiling += 1;
    }
  }
}
