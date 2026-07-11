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

describe('calibration harness (M1)', () => {
  it('runs a small batch and reports every §12 target as pending (no false pass/fail)', () => {
    const careers = Array.from({ length: 20 }, (_, i) =>
      runCareer({ seed: `batch:${i}`, years: 15, bot: passiveBot }),
    );
    const results = evaluateAll(careers);
    expect(results).toHaveLength(9); // all nine §12 rows present
    // Nothing is active yet, so nothing can fail the build at M1.
    expect(results.every((r) => r.active === false)).toBe(true);
    expect(results.every((r) => r.pass === null)).toBe(true);
  });
});
