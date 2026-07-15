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
  ledgerSquadMatch,
  cloneState,
  isMoneyClub,
  exceedsPlausibleCeiling,
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

/** A career run plus the final world state — the review material the Historian
 *  harness (packages/harness/src/historian) samples post-hoc. `runCareer` (the
 *  calibration path) discards `finalState`; the Historian keeps it. */
export interface CareerTrace {
  metrics: CareerMetrics;
  finalState: GameState;
}

/** Guard against a stuck loop: 15 years ≈ 30 windows; cap well above that. */
const MAX_ITERATIONS = 400;

/**
 * The calibration entry point (§12): run a career, return only its metrics.
 * A thin wrapper over `traceCareer` so the Monte Carlo batch is unchanged and
 * bit-identical, while the Historian can ask the same loop for the final state.
 */
export function runCareer(options: RunCareerOptions): CareerMetrics {
  return traceCareer(options).metrics;
}

/**
 * Identical to `runCareer` but also returns the final `GameState` for post-hoc
 * realism review. Same code path ⇒ same seed ⇒ identical metrics; the extra
 * return value is a pure read of the state the loop already produced.
 */
export function traceCareer(options: RunCareerOptions): CareerTrace {
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
  // Players the user was pressured to sell via a logical poach bid ("keep him
  // happy" campaigns), and those who left despite the keep policy (§12).
  const poachBidTargets = new Set<string>();
  const poachDeparted = new Set<string>();
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
      // A logical poach bid (butterfly of the user's own move) on a user player.
      if (e.code === 'poach.bid' && e.data?.from === state.playerClub) {
        poachBidTargets.add(String(e.data.playerId));
      }
      // A player who left despite the keep policy (forced out by unrest).
      if (e.code === 'poach.completed' && e.data?.from === state.playerClub) {
        poachDeparted.add(String(e.data.playerId));
      }
      // Scripted fidelity is a zero-divergence measure only (§12).
      if (zeroDivergence && e.code === 'scripted.fired') {
        metrics.scriptedEventsExpected += 1;
        metrics.scriptedEventsFired += 1;
      } else if (zeroDivergence && e.code === 'scripted.skipped') {
        metrics.scriptedEventsExpected += 1;
      }
      // Reality-ledger fidelity — also a zero-divergence measure (§9f).
      if (zeroDivergence && e.code === 'ledger.executed') {
        metrics.ledgerExpected += 1;
        metrics.ledgerExecutedAsReal += 1;
      } else if (zeroDivergence && e.code === 'ledger.fallback') {
        metrics.ledgerExpected += 1;
      }
    }

    // Internal crises imposed on the player (§ internal-friction).
    metrics.internalCrises += result.events.filter((e) => e.code === 'internal.crisis').length;

    // M8: significant AI transfers (the denominator for the ambition-override
    // share). A real ledger move, a counter-punch, or an ambition override is
    // each a meaningful AI signing; the override subset is counted separately.
    for (const e of result.events) {
      if (e.code === 'ledger.executed' || e.code === 'rival.counterpunch' || e.code === 'ambition.override') {
        metrics.significantAiTransfers += 1;
      }
      if (e.code === 'ambition.override') metrics.ambitionOverrides += 1;
    }

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
  // "Keep him happy" campaigns = players bid for; departures = those who were
  // forced out despite the keep policy (counted from the event, so a later
  // re-signing doesn't mask that the departure happened).
  metrics.keepHappyCampaigns = poachBidTargets.size;
  metrics.keepHappyEndedInDeparture = [...poachBidTargets].filter((id) => poachDeparted.has(id)).length;

  // Reality squad-match at era end (zero-divergence control): did the ledger
  // subjects end up at their real destinations? (§9f)
  if (zeroDivergence) {
    const match = ledgerSquadMatch(state);
    metrics.trackedRealPlayersAtRealClub = match.atRealClub;
    metrics.trackedRealPlayersTotal = match.total;
  }

  collectEndOfCareerMetrics(state, metrics);
  return { metrics, finalState: state };
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

  // M8: "money still talks" — every league title, and the subset won by a
  // big-money club (the user included: an elite, wealthy club winning IS money
  // talking). Strength-driven titles at anchored strengths should leave the
  // wealthy winning the clear majority.
  for (const league of Object.values(state.leagues)) {
    for (const t of league.titleHistory) {
      metrics.leagueTitlesTotal += 1;
      const champ = state.clubs[t.championId];
      if (champ && isMoneyClub(champ)) metrics.moneyClubTitles += 1;
    }
  }

  // M8: no fantasy leaps — a simulated club whose live strength has run above its
  // plausible ceiling. The user's own club is exempt (its climb is authored by
  // the user, hence always "caused"). Held at 0 by the strength anchor.
  for (const club of Object.values(state.clubs)) {
    if (club.leagueId === null || club.id === state.playerClub) continue;
    if (exceedsPlausibleCeiling(club)) metrics.fantasyLeaps += 1;
  }

  // M5: wonderkid outcomes (§12 + internal-friction §5). Benched (<40% mins,
  // 2+ yrs) should almost never reach ceiling; well-managed should reach it
  // only ~40–60% of the time — development is not on rails.
  for (const player of Object.values(state.players)) {
    if (!player.wonderkid) continue;
    if (player.benchedDevSeasons >= 2) {
      // A blocked pathway plateaus any prospect — curated or not (the butterfly).
      metrics.benchedWonderkids += 1;
      if (player.reachedPotential) metrics.benchedWonderkidsReachedCeiling += 1;
    } else if (!player.curated) {
      // The ~40–60% anti-hindsight band is about the user's speculative PROCEDURAL
      // gambles; curated real players follow the reality-rail and reach their peak.
      metrics.wellManagedWonderkids += 1;
      if (player.reachedPotential) metrics.wellManagedWonderkidsReachedCeiling += 1;
    }
  }
}
