/**
 * Metrics collected from a single headless career, and the shape aggregated
 * across a Monte Carlo batch. Fields map directly onto the §12 calibration
 * targets. Anything owned by a system that does not exist yet stays at its
 * zero value and its target is reported as "pending" (not failed) until the
 * milestone that produces it lands. This lets the harness run — and prove it
 * scales to ≥500 careers — from M1, while the realism gate switches on
 * incrementally.
 */

export interface CareerMetrics {
  seed: string;
  years: number;
  windowsAdvanced: number;
  monthsSimulated: number;

  // ── M2 / M9: competition outcomes ─────────────────────────────
  /** Longest run of consecutive titles by ANY single club this career. */
  maxConsecutiveTitlesAnyClub: number;

  // ── M4: player state / injuries / scandals ────────────────────
  /** Decades in which the user club suffered ≥1 major injury crisis (3+ simultaneous). */
  userMajorInjuryCrisisDecades: number;
  userScandalDecades: number;
  decadesElapsed: number;
  /** League-wide serious (6mo+) injuries, summed, plus squad-seasons for the rate. */
  seriousInjuriesLeagueWide: number;
  squadSeasons: number;

  // ── M6: agency ────────────────────────────────────────────────
  raidsSuffered: number;
  raidsCounterPunchedWithin2Windows: number;
  keepHappyCampaigns: number;
  keepHappyEndedInDeparture: number;
  hardBlockedApproaches: number;
  hardBlockedCompletedBeforeUnlock: number;

  // ── M5: development ───────────────────────────────────────────
  benchedWonderkids: number;
  benchedWonderkidsReachedCeiling: number;

  // ── M7: scripted events ───────────────────────────────────────
  scriptedEventsExpected: number;
  scriptedEventsFired: number;

  // ── M8: reality-default timeline (docs/DESIGN-reality-default.md) ──
  /** Real ledger transfers among tracked clubs expected in a zero-divergence run. */
  ledgerExpected: number;
  /** …of those, how many executed exactly as in reality. */
  ledgerExecutedAsReal: number;
  /** Tracked real players still at their real club at era end (squad-match). */
  trackedRealPlayersAtRealClub: number;
  trackedRealPlayersTotal: number;
  /** Pressure-driven ambition overrides, and the significant AI transfers they're
   *  a share of (Amendment A). */
  ambitionOverrides: number;
  significantAiTransfers: number;
}

export function emptyCareerMetrics(seed: string, years: number): CareerMetrics {
  return {
    seed,
    years,
    windowsAdvanced: 0,
    monthsSimulated: 0,
    maxConsecutiveTitlesAnyClub: 0,
    userMajorInjuryCrisisDecades: 0,
    userScandalDecades: 0,
    decadesElapsed: Math.max(1, Math.floor(years / 10)),
    seriousInjuriesLeagueWide: 0,
    squadSeasons: 0,
    raidsSuffered: 0,
    raidsCounterPunchedWithin2Windows: 0,
    keepHappyCampaigns: 0,
    keepHappyEndedInDeparture: 0,
    hardBlockedApproaches: 0,
    hardBlockedCompletedBeforeUnlock: 0,
    benchedWonderkids: 0,
    benchedWonderkidsReachedCeiling: 0,
    scriptedEventsExpected: 0,
    scriptedEventsFired: 0,
    ledgerExpected: 0,
    ledgerExecutedAsReal: 0,
    trackedRealPlayersAtRealClub: 0,
    trackedRealPlayersTotal: 0,
    ambitionOverrides: 0,
    significantAiTransfers: 0,
  };
}

/** Fraction of careers for which `predicate` holds (0..1). */
export function fractionOfCareers(
  careers: CareerMetrics[],
  predicate: (c: CareerMetrics) => boolean,
): number {
  if (careers.length === 0) return 0;
  return careers.filter(predicate).length / careers.length;
}

export function sum(careers: CareerMetrics[], pick: (c: CareerMetrics) => number): number {
  return careers.reduce((acc, c) => acc + pick(c), 0);
}
