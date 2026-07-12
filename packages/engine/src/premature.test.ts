import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { applyPrematureMove } from './development.js';
import { Rng } from './rng.js';
import type { GameState, PlayerState } from './types.js';

/** A young, still-developing curated player to pull off his pathway. */
function youngProspect(s: GameState): PlayerState {
  const year = Number(s.clock.date.slice(0, 4));
  const p = Object.values(s.players).find(
    (x) => x.curated && year - x.birthYear <= 22 && x.ability < x.potentialCeiling - 4,
  );
  if (!p) throw new Error('no young curated prospect in the default scenario');
  return p;
}

describe('premature-transfer explanation (§5 reality-rail)', () => {
  it('sometimes erodes the ceiling — and always logs the divergence when it does', () => {
    const base = createNewGame({ seed: 'premature' });
    const prospect = youngProspect(base);

    let fired = 0;
    let absorbed = 0;
    for (let i = 0; i < 60; i++) {
      const s = cloneState(base);
      const p = s.players[prospect.id]!;
      const ceilingBefore = p.potentialCeiling;
      const eroded = applyPrematureMove(s, p, 2, 'chelsea', new Rng(1).fork(`trial:${i}`));
      if (eroded) {
        fired += 1;
        // Ceiling actually slipped, and a traceable explanation was logged both
        // to the divergence log and the event stream.
        expect(p.potentialCeiling).toBeLessThan(ceilingBefore);
        expect(p.potentialCeiling).toBeGreaterThanOrEqual(p.ability);
        expect(s.timeline.divergenceLog.some((d) => d.detail.includes('ahead of his real move'))).toBe(true);
        expect(s.eventLog.some((e) => e.code === 'development.premature')).toBe(true);
      } else {
        absorbed += 1;
        expect(p.potentialCeiling).toBe(ceilingBefore);
        expect(s.eventLog.some((e) => e.code === 'development.premature.absorbed')).toBe(true);
      }
    }
    // It is a RISK, not a certainty — both outcomes occur across the batch.
    expect(fired).toBeGreaterThan(0);
    expect(absorbed).toBeGreaterThan(0);
  });

  it('a settled/finished player moved early is just a normal transfer (no erosion)', () => {
    const s = createNewGame({ seed: 'premature-mature' });
    // A finished pro: ability already at his ceiling.
    const p = Object.values(s.players).find((x) => x.curated)!;
    p.ability = p.potentialCeiling;
    const before = p.potentialCeiling;
    expect(applyPrematureMove(s, p, 2, 'chelsea', new Rng(2))).toBe(false);
    expect(p.potentialCeiling).toBe(before);
  });

  it('an on-time move (yearsEarly < 1) is a no-op', () => {
    const s = createNewGame({ seed: 'premature-ontime' });
    const p = youngProspect(s);
    const before = p.potentialCeiling;
    expect(applyPrematureMove(s, p, 0, 'chelsea', new Rng(3))).toBe(false);
    expect(p.potentialCeiling).toBe(before);
  });
});
