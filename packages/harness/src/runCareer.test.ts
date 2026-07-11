import { describe, it, expect } from 'vitest';
import { runCareer } from './runCareer.js';
import { passiveBot, firstChoiceBot } from './strategy.js';
import { evaluateAll } from './calibration.js';

describe('runCareer', () => {
  it('walks a full 15-year career through the two-clock model', () => {
    const m = runCareer({ seed: 'career-1', years: 15, bot: passiveBot });
    expect(m.years).toBe(15);
    // ~2 windows/year over 15 years.
    expect(m.windowsAdvanced).toBeGreaterThanOrEqual(28);
    expect(m.windowsAdvanced).toBeLessThanOrEqual(32);
    // ~12 months/year simulated under the hood.
    expect(m.monthsSimulated).toBeGreaterThanOrEqual(170);
    expect(m.monthsSimulated).toBeLessThanOrEqual(185);
  });

  it('is deterministic: same seed ⇒ identical metrics', () => {
    const a = runCareer({ seed: 'repeat', years: 5, bot: firstChoiceBot });
    const b = runCareer({ seed: 'repeat', years: 5, bot: firstChoiceBot });
    expect(a).toEqual(b);
  });
});

describe('calibration harness', () => {
  it('reports all §12 + reality rows; live targets pass by M5', () => {
    const careers = Array.from({ length: 24 }, (_, i) =>
      runCareer({ seed: `batch:${i}`, years: 15, bot: passiveBot }),
    );
    const results = evaluateAll(careers);
    // 9 §12 rows + 3 reality-default rows (docs/DESIGN-reality-default.md).
    expect(results).toHaveLength(12);

    // Live targets (M4 injuries, M5 benched-wonderkid plateau) must all pass.
    const live = ['user-injury-crisis', 'serious-injury-rate', 'benched-wonderkid-plateau'];
    for (const id of live) {
      const t = results.find((r) => r.id === id)!;
      expect(t.active).toBe(true);
      expect(t.pass).toBe(true);
    }

    // Targets owned by later milestones stay pending — no false pass/fail.
    const pending = results.filter((r) => !r.active);
    expect(pending.every((r) => r.pass === null)).toBe(true);
    expect(pending.length).toBe(9);
  }, 30000);
});
