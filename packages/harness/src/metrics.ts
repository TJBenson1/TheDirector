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
  /** This career made no user transfers — the on-script control (§9f). Procedural
   *  off-script drama (scandals, divergent storylines) must stay absent here. */
  zeroDivergence: boolean;
  decadesElapsed: number;
  /** League-wide serious (6mo+) injuries, summed, plus squad-seasons for context. */
  seriousInjuriesLeagueWide: number;
  squadSeasons: number;
  /** Real-player-seasons across all simulated leagues (Σ real players present at
   *  each season's completion). The body-count-independent denominator for the
   *  serious-injury RATE, so the rate stays meaningful in a real-players-only
   *  world where squads are smaller than the old 23-body procedural ones. */
  realPlayerSeasons: number;

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
  /** Well-managed (not benched 2+ yrs) generational prospects, and how many
   *  reached ceiling — must land ~40–60% (internal-friction §5). */
  wellManagedWonderkids: number;
  wellManagedWonderkidsReachedCeiling: number;

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

  // ── M6: adaptation (DESIGN-context-and-friction §3) ──
  /** On-paper-logical signings made, and how many underperformed their first
   *  season (adaptation outcome other than seamless). */
  logicalSignings: number;
  signingsUnderperformingFirstSeason: number;

  // ── Governing constraint (DESIGN-internal-friction) — M8/M9 ──
  /** Career ended in dismissal (sackable job, §1). */
  careerEndedInSack: number;
  /** Board warnings issued this career — the signal that the board genuinely
   *  lost patience (a run that went wrong). The denominator for "dismissal in a
   *  meaningful minority of UNDERPERFORMING runs": a dominant club rarely
   *  underperforms, so sackings are measured against warned runs, not all runs. */
  boardWarningsIssued: number;
  /** Titles won by big-money clubs (Chelsea/City/Madrid), and total titles, for
   *  the "money still talks" share. */
  moneyClubTitles: number;
  leagueTitlesTotal: number;
  /** Internal crises suffered (forced sale / contract loss / manager conflict /
   *  financial shock / prospect bust / chemistry failure). */
  internalCrises: number;
  /** Clubs exceeding their plausible ceiling without a logged multi-cause chain.
   *  MUST stay 0 (no fantasy leaps). */
  fantasyLeaps: number;

  // ── Season-model shape (points spread / draw rate) ────────────
  /** Completed simulated seasons, and the sum of champion / runner-up points and
   *  league draw stats across them — for the "real title race, not a procession"
   *  points-spread target. */
  seasonsCompleted: number;
  championPointsSum: number;
  runnerUpPointsSum: number;
  leagueDrawnTeamGames: number;
  leagueTeamGames: number;
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
    zeroDivergence: false,
    decadesElapsed: Math.max(1, Math.floor(years / 10)),
    seriousInjuriesLeagueWide: 0,
    squadSeasons: 0,
    realPlayerSeasons: 0,
    raidsSuffered: 0,
    raidsCounterPunchedWithin2Windows: 0,
    keepHappyCampaigns: 0,
    keepHappyEndedInDeparture: 0,
    hardBlockedApproaches: 0,
    hardBlockedCompletedBeforeUnlock: 0,
    benchedWonderkids: 0,
    benchedWonderkidsReachedCeiling: 0,
    wellManagedWonderkids: 0,
    wellManagedWonderkidsReachedCeiling: 0,
    scriptedEventsExpected: 0,
    scriptedEventsFired: 0,
    ledgerExpected: 0,
    ledgerExecutedAsReal: 0,
    trackedRealPlayersAtRealClub: 0,
    trackedRealPlayersTotal: 0,
    ambitionOverrides: 0,
    significantAiTransfers: 0,
    logicalSignings: 0,
    signingsUnderperformingFirstSeason: 0,
    careerEndedInSack: 0,
    boardWarningsIssued: 0,
    moneyClubTitles: 0,
    leagueTitlesTotal: 0,
    internalCrises: 0,
    fantasyLeaps: 0,
    seasonsCompleted: 0,
    championPointsSum: 0,
    runnerUpPointsSum: 0,
    leagueDrawnTeamGames: 0,
    leagueTeamGames: 0,
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
