import { describe, it, expect } from 'vitest';
import { runCareer } from './runCareer.js';
import { passiveBot, firstChoiceBot, ALL_BOTS } from './strategy.js';
import { evaluateAll } from './calibration.js';

describe('runCareer', () => {
  it('walks a full 15-year career through the two-clock model', () => {
    const m = runCareer({ seed: 'career-1', years: 15, bot: passiveBot });
    expect(m.years).toBe(15);
    if (m.careerEndedInSack) {
      // A dismissed career ends early — it still walked a substantial run.
      expect(m.monthsSimulated).toBeGreaterThan(24);
    } else {
      // ~12 months/year (robust to interrupt events fragmenting advances, §9b).
      expect(m.monthsSimulated).toBeGreaterThanOrEqual(170);
      expect(m.monthsSimulated).toBeLessThanOrEqual(185);
      expect(m.windowsAdvanced).toBeGreaterThanOrEqual(28);
    }
  });

  it('is deterministic: same seed ⇒ identical metrics', () => {
    const a = runCareer({ seed: 'repeat', years: 5, bot: firstChoiceBot });
    const b = runCareer({ seed: 'repeat', years: 5, bot: firstChoiceBot });
    expect(a).toEqual(b);
  });
});

describe('calibration harness', () => {
  it('reports all §12 + reality rows; live targets pass by M5', () => {
    const careers = Array.from({ length: 36 }, (_, i) =>
      runCareer({ seed: `batch:${i}`, years: 15, bot: ALL_BOTS[i % ALL_BOTS.length]! }),
    );
    const results = evaluateAll(careers);
    // 9 §12 rows + 9 reality/friction/governing rows (design docs).
    expect(results).toHaveLength(18);

    // Live targets through M9 must all pass.
    const live = [
      'user-injury-crisis',
      'serious-injury-rate',
      'user-scandal',
      'rival-counter-punch',
      'star-retention-departure',
      'player-sackable',
      'internal-crisis-cadence',
      'benched-wonderkid-plateau',
      'prospect-hit-rate',
      'hard-block-integrity',
      'adaptation-signing-risk',
      'scripted-event-fidelity',
      'reality-ledger-fidelity',
      'reality-squad-match',
    ];
    for (const id of live) {
      const t = results.find((r) => r.id === id)!;
      expect(t.active).toBe(true);
      expect(t.pass).toBe(true);
    }

    // Targets owned by later milestones stay pending — no false pass/fail.
    const pending = results.filter((r) => !r.active);
    expect(pending.every((r) => r.pass === null)).toBe(true);
    expect(pending.length).toBe(4);
    // Higher budget than the early milestones: a mature world now also ages
    // players into retirement and runs promotion/relegation each season, so a
    // 36-career smoke batch does materially more work per career.
  }, 90000);
});
