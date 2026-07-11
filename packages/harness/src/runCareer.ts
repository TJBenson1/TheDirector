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
  executeTransfer,
  evaluateApproach,
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

  // Decade buckets in which the user club suffered a major injury crisis
  // (3+ simultaneous significant injuries), sampled at each window boundary.
  const crisisDecades = new Set<number>();

  let iterations = 0;
  while (parseYearMonth(state.clock.date).year < endYear && iterations < MAX_ITERATIONS) {
    iterations++;

    // Resolve any interrupts/decisions the world raised.
    if (state.pendingDecisions.length > 0) {
      bot.decide(state, state.pendingDecisions, botRng);
      // TODO(M7): apply the returned choices via engine.applyDecision.
      // Until that exists, clear them so the loop makes progress.
      state = { ...state, pendingDecisions: [] };
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

      // Apply the bot's logical signings; record the hidden adaptation outcome.
      if (bot.transferActions) {
        for (const req of bot.transferActions(draft, botRng)) {
          const res = executeTransfer(draft, req);
          if (res.ok) {
            const signed = draft.players[res.playerId];
            if (signed?.adaptation) {
              metrics.logicalSignings += 1;
              if (signed.adaptation.outcome !== 'seamless') metrics.signingsUnderperformingFirstSeason += 1;
            }
          }
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

    // Sample the user club for a major injury crisis.
    if (significantInjuredCount(state, state.playerClub) >= 3) {
      const decade = Math.floor((parseYearMonth(state.clock.date).year - startYear) / 10);
      crisisDecades.add(decade);
    }

    // Safety: if an advance produced nothing, bail rather than spin.
    if (state.eventLog.length === before) break;
  }

  metrics.userMajorInjuryCrisisDecades = crisisDecades.size;

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
