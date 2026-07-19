import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { coachBriefing } from './briefing.js';
import { realInboundThisWindow } from './recommend.js';
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

  it('labels a target by the position he actually plays, not the need slot', () => {
    // Real Madrid 2000: the coach wants cover across the back, and suggestTargets
    // returns same-group defenders (Cannavaro, Blanc) as options for a full-back
    // need. They are centre-backs and must be labelled CB, never RB/LB.
    const s = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'brief' });
    const b = coachBriefing(s);
    const cannavaro = b.targets.find((t) => t.name === 'Fabio Cannavaro');
    if (cannavaro) expect(cannavaro.position).toBe('CB');
    // Every target's stated position must be one the player genuinely plays.
    for (const t of b.targets) {
      const p = Object.values(s.players).find((q) => q.name === t.name);
      if (p) expect(p.positions).toContain(t.position);
    }
  });

  it('surfaces the marquee real signing available this window', () => {
    // Figo → Real Madrid, £37m, is the day-one galáctico decision (2000-07).
    const s = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'brief' });
    const inbound = realInboundThisWindow(s);
    const figo = inbound.find((r) => r.name === 'Luís Figo');
    expect(figo).toBeDefined();
    expect(figo?.fromClub).toBe('Barcelona');
    expect(figo?.fee).toBe(37_000_000);
    // Highest fee ranks first — the biggest statement heads the list.
    expect(inbound[0]?.fee).toBeGreaterThanOrEqual(inbound[inbound.length - 1]?.fee ?? 0);
  });

  it('is deterministic and never throws across every scenario', () => {
    for (const sc of Object.values(SCENARIOS)) {
      const a = coachBriefing(createNewGame({ scenarioId: sc.id, seed: 'x' }));
      const c = coachBriefing(createNewGame({ scenarioId: sc.id, seed: 'x' }));
      expect(a).toEqual(c);
      expect(a.bestXI.length).toBeGreaterThanOrEqual(11);
      // realInboundThisWindow is a pure ledger read — deterministic too.
      expect(realInboundThisWindow(createNewGame({ scenarioId: sc.id, seed: 'x' }))).toEqual(
        realInboundThisWindow(createNewGame({ scenarioId: sc.id, seed: 'x' })),
      );
    }
  });
});
