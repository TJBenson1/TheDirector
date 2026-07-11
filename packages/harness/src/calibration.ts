/**
 * The §12 calibration targets — the "realism budget", CI-enforced (§18).
 *
 * Each target evaluates the aggregate of a Monte Carlo batch to a measured
 * value and a pass/fail against its band. `active` gates whether a failure
 * breaks the build: a target only goes active once the milestone that produces
 * its underlying behaviour has landed. Until then it reports "pending" and
 * never fails CI — so the harness is honest about what it can and cannot yet
 * measure, and turning a system on is a one-line flag flip here.
 *
 * Milestone ownership is noted per target. M4 flips the injury/scandal targets
 * active (the reason the harness must be running by M4).
 */

import { fractionOfCareers, sum, type CareerMetrics } from './metrics.js';

export interface TargetResult {
  id: string;
  label: string;
  band: string;
  active: boolean;
  /** Measured value rendered for the report (e.g. "12.4%", "1.7/squad-season"). */
  value: string;
  /** null when not active (nothing to assert yet). */
  pass: boolean | null;
  ownedBy: string;
}

export interface CalibrationTarget {
  id: string;
  label: string;
  band: string;
  ownedBy: string;
  active: boolean;
  evaluate(careers: CareerMetrics[]): { value: string; pass: boolean };
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

export const TARGETS: CalibrationTarget[] = [
  {
    id: 'title-dynasty',
    label: 'Any club winning >4 consecutive titles',
    band: '<20% of sims',
    ownedBy: 'M2/M9',
    active: false,
    evaluate: (c) => {
      const f = fractionOfCareers(c, (x) => x.maxConsecutiveTitlesAnyClub > 4);
      return { value: pct(f), pass: f < 0.2 };
    },
  },
  {
    id: 'user-injury-crisis',
    label: 'User club ≥1 major injury crisis per decade',
    band: '≥90% of sims',
    ownedBy: 'M4',
    active: true,
    evaluate: (c) => {
      const f = fractionOfCareers(c, (x) => x.userMajorInjuryCrisisDecades >= x.decadesElapsed);
      return { value: pct(f), pass: f >= 0.9 };
    },
  },
  {
    id: 'user-scandal',
    label: 'User club ≥1 significant scandal per decade',
    band: '≥80% of sims',
    ownedBy: 'M4/M7',
    active: false,
    evaluate: (c) => {
      const f = fractionOfCareers(c, (x) => x.userScandalDecades >= x.decadesElapsed);
      return { value: pct(f), pass: f >= 0.8 };
    },
  },
  {
    id: 'serious-injury-rate',
    label: 'Serious (6mo+) injuries league-wide per squad-season',
    band: '~1–2 avg',
    ownedBy: 'M4',
    active: true,
    evaluate: (c) => {
      const injuries = sum(c, (x) => x.seriousInjuriesLeagueWide);
      const squadSeasons = sum(c, (x) => x.squadSeasons);
      const rate = squadSeasons > 0 ? injuries / squadSeasons : 0;
      return { value: `${rate.toFixed(2)}/squad-season`, pass: rate >= 1 && rate <= 2 };
    },
  },
  {
    id: 'rival-counter-punch',
    label: 'Rival counter-punch within 2 windows of being raided',
    band: '≥70% of raids',
    ownedBy: 'M8',
    active: false,
    evaluate: (c) => {
      const raids = sum(c, (x) => x.raidsSuffered);
      const counters = sum(c, (x) => x.raidsCounterPunchedWithin2Windows);
      const f = raids > 0 ? counters / raids : 0;
      return { value: pct(f), pass: f >= 0.7 };
    },
  },
  {
    id: 'star-retention-departure',
    label: '"Keep him happy" campaigns still ending in departure',
    band: '~30% over a career',
    ownedBy: 'M6',
    active: false,
    evaluate: (c) => {
      const campaigns = sum(c, (x) => x.keepHappyCampaigns);
      const departures = sum(c, (x) => x.keepHappyEndedInDeparture);
      const f = campaigns > 0 ? departures / campaigns : 0;
      return { value: pct(f), pass: f >= 0.2 && f <= 0.4 };
    },
  },
  {
    id: 'hard-block-integrity',
    label: 'Hard-blocked (Messi-class) transfers before unlock',
    band: '~0%',
    ownedBy: 'M6',
    active: false,
    evaluate: (c) => {
      const approaches = sum(c, (x) => x.hardBlockedApproaches);
      const completed = sum(c, (x) => x.hardBlockedCompletedBeforeUnlock);
      // Property-grade: this must be exactly zero, ever.
      return { value: String(completed), pass: completed === 0 };
    },
  },
  {
    id: 'benched-wonderkid-plateau',
    label: 'Benched (<40% mins, 2yr+) wonderkids reaching ceiling',
    band: '<15%',
    ownedBy: 'M5',
    active: true,
    evaluate: (c) => {
      const benched = sum(c, (x) => x.benchedWonderkids);
      const reached = sum(c, (x) => x.benchedWonderkidsReachedCeiling);
      const f = benched > 0 ? reached / benched : 0;
      return { value: pct(f), pass: f < 0.15 };
    },
  },
  {
    // docs/DESIGN-reality-default.md, Principle 1. In a zero-divergence run,
    // AI clubs' real transfers must execute as in reality.
    id: 'reality-ledger-fidelity',
    label: 'Zero-divergence real transfers executing as in reality',
    band: '≥85% of ledger',
    ownedBy: 'M8',
    active: false,
    evaluate: (c) => {
      const expected = sum(c, (x) => x.ledgerExpected);
      const asReal = sum(c, (x) => x.ledgerExecutedAsReal);
      const f = expected > 0 ? asReal / expected : 0;
      return { value: pct(f), pass: f >= 0.85 };
    },
  },
  {
    // docs/DESIGN-reality-default.md, Amendment A. Pressure-driven ambition
    // overrides are a minority of AI transfers; >~20% is a failing build.
    id: 'reality-ambition-overrides',
    label: 'Ambition overrides as a share of significant AI transfers',
    band: '~10–15% (fail >20%)',
    ownedBy: 'M8',
    active: false,
    evaluate: (c) => {
      const overrides = sum(c, (x) => x.ambitionOverrides);
      const significant = sum(c, (x) => x.significantAiTransfers);
      const f = significant > 0 ? overrides / significant : 0;
      return { value: pct(f), pass: f <= 0.2 };
    },
  },
  {
    // docs/DESIGN-reality-default.md, Principle 1. End-of-era squads at the 12
    // playable clubs must materially match their real counterparts.
    id: 'reality-squad-match',
    label: 'Playable-club end-of-era squads matching reality',
    band: '≥85% of tracked players',
    ownedBy: 'M8',
    active: false,
    evaluate: (c) => {
      const at = sum(c, (x) => x.trackedRealPlayersAtRealClub);
      const total = sum(c, (x) => x.trackedRealPlayersTotal);
      const f = total > 0 ? at / total : 0;
      return { value: pct(f), pass: f >= 0.85 };
    },
  },
  {
    // DESIGN-context-and-friction §3. On-paper-logical signings must still carry
    // real first-season risk — never a guaranteed success, never mostly failing.
    id: 'adaptation-signing-risk',
    label: 'On-paper-logical signings underperforming their first season',
    band: '~20–55%',
    ownedBy: 'M6',
    active: true,
    evaluate: (c) => {
      const signings = sum(c, (x) => x.logicalSignings);
      const under = sum(c, (x) => x.signingsUnderperformingFirstSeason);
      const f = signings > 0 ? under / signings : 0;
      // Ideal ~45%; accept 20–60% so a signing is never a guaranteed success
      // nor mostly a flop, with CI margin against small-sample variance.
      return { value: pct(f), pass: signings > 0 && f >= 0.2 && f <= 0.6 };
    },
  },
  {
    id: 'scripted-event-fidelity',
    label: 'Scripted historical events firing (zero-divergence run)',
    band: '≥95%',
    ownedBy: 'M7/M8',
    active: false,
    evaluate: (c) => {
      const expected = sum(c, (x) => x.scriptedEventsExpected);
      const fired = sum(c, (x) => x.scriptedEventsFired);
      const f = expected > 0 ? fired / expected : 0;
      return { value: pct(f), pass: f >= 0.95 };
    },
  },
];

export function evaluateAll(careers: CareerMetrics[]): TargetResult[] {
  return TARGETS.map((t) => {
    const { value, pass } = t.evaluate(careers);
    return {
      id: t.id,
      label: t.label,
      band: t.band,
      active: t.active,
      ownedBy: t.ownedBy,
      value,
      pass: t.active ? pass : null,
    };
  });
}
