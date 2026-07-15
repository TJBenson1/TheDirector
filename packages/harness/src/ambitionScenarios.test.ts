import { describe, it, expect } from 'vitest';
import { runCareer } from './runCareer.js';
import { ALL_BOTS } from './strategy.js';

/**
 * M8 cross-scenario safety guard. The ambition-override mechanic is
 * scenario-agnostic, but only man-utd-1999 is CI-calibrated (the harness). This
 * locks the two HARD safety invariants on the OTHER era worlds so a future change
 * can't silently break them off-CI:
 *   • a plausible-ceiling breach (fantasy leap) must NEVER happen;
 *   • overrides must NEVER run past the 20% failing-build line.
 * The override SHARE is only tuned to the ideal ~10–15% band for a dominant-user
 * scenario (man-utd-1999 / chelsea-2003); in a more competitive league it's a
 * safe, lower minority — which is realistic, not a miss.
 */
describe('M8 ambition — safe across every era world', () => {
  const scenarios = [
    'arsenal-2004', 'bayern-2009', 'man-utd-2013', 'chelsea-2003',
    'inter-1998', 'liverpool-2001', 'real-madrid-2000',
  ];

  it.each(scenarios)('%s: fantasy leaps 0, override share ≤20%', (scenarioId) => {
    let leaps = 0;
    let overrides = 0;
    let significant = 0;
    for (let i = 0; i < 4; i++) {
      const m = runCareer({ scenarioId, seed: `${scenarioId}:${i}`, years: 15, bot: ALL_BOTS[i % ALL_BOTS.length]! });
      leaps += m.fantasyLeaps;
      overrides += m.ambitionOverrides;
      significant += m.significantAiTransfers;
    }
    expect(leaps, `${scenarioId}: fantasy leaps must be 0`).toBe(0);
    const share = significant > 0 ? overrides / significant : 0;
    expect(share, `${scenarioId}: override share must stay ≤20%`).toBeLessThanOrEqual(0.2);
  }, 30000);
});
