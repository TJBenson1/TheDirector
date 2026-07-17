import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { ERA_REALITY, eraForScenario } from './ledger.js';

describe('forward ledgers for mid-era starts', () => {
  it('map to their own era and reference players that exist (no typo\'d ids)', () => {
    const cases: Record<string, string> = {
      'real-madrid-2006': 'era-2006', 'juventus-2006': 'era-2006', 'milan-2007': 'era-2006',
      'barcelona-2003': 'era-2003', 'chelsea-2003': 'era-2003',
    };
    for (const [sc, era] of Object.entries(cases)) {
      expect(eraForScenario(sc), sc).toBe(era);
    }
    // For the curated 2003/2006 sides, the forward ledger must actually fire — the
    // exits reference curated players that exist at kickoff.
    for (const sc of ['real-madrid-2006', 'barcelona-2003']) {
      const s = createNewGame({ scenarioId: sc });
      const pack = ERA_REALITY[eraForScenario(sc)]!;
      const curatedFrom = new Set(Object.values(s.players).filter((p) => p.curated).map((p) => p.originClub));
      const relevant = pack.realTransferLedger.filter((e) => curatedFrom.has(e.from ?? undefined));
      expect(relevant.length, `${sc}: forward exits`).toBeGreaterThan(4);
      for (const e of relevant) expect(s.players[e.playerId], `${sc}: ${e.playerId}`).toBeTruthy();
    }
  });
});
