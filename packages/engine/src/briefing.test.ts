import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { coachBriefing } from './briefing.js';
import { SCENARIOS } from './scenarios.js';

describe('coachBriefing', () => {
  it('names the real coach and a coherent best XI in his shape', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'brief' });
    const b = coachBriefing(s);
    expect(b.coach).toBe('Alex Ferguson');
    expect(b.formation).toBe('4-4-2');
    // A full XI, exactly one keeper, no player picked twice.
    expect(b.bestXI).toHaveLength(11);
    expect(b.bestXI.filter((x) => x.slot === 'GK')).toHaveLength(1);
    expect(new Set(b.bestXI.map((x) => x.name)).size).toBe(11);
    expect(b.mood).toMatch(/positive|buoyant|guarded|strained/);
    expect(b.priority.length).toBeGreaterThan(0);
  });

  it('starts a specialist in his own position, not out wide', () => {
    // Inter 1998: Ronaldo is a striker and must appear at ST, never shunted to a
    // wing by slot ordering.
    const s = createNewGame({ scenarioId: 'inter-1998', seed: 'brief' });
    const b = coachBriefing(s);
    const ronaldo = b.bestXI.find((x) => x.name === 'Ronaldo');
    expect(ronaldo?.slot).toBe('ST');
  });

  it('is deterministic and never throws across every scenario', () => {
    for (const sc of Object.values(SCENARIOS)) {
      const a = coachBriefing(createNewGame({ scenarioId: sc.id, seed: 'x' }));
      const c = coachBriefing(createNewGame({ scenarioId: sc.id, seed: 'x' }));
      expect(a).toEqual(c);
      expect(a.bestXI.length).toBeGreaterThanOrEqual(11);
    }
  });
});
