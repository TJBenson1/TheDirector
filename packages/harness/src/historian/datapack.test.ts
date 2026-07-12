import { describe, it, expect } from 'vitest';
import { createNewGame } from '@director/engine';
import { sampleDataPack } from './datapack-sampler.js';

describe('sampleDataPack (Mode 3)', () => {
  it('produces ledger, ceiling, resistance and injury validation items', () => {
    const state = createNewGame({ scenarioId: 'man-utd-1999', seed: 'dp-test' });
    const items = sampleDataPack(state);

    expect(items.length).toBeGreaterThan(0);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);

    const cats = new Set(items.map((i) => i.category));
    expect(cats.has('data-ledger')).toBe(true);
    expect(cats.has('data-ceiling')).toBe(true);
    expect(cats.has('data-resistance')).toBe(true);
    expect(cats.has('data-injury')).toBe(true); // era-1995-2005 ships real injuries

    // The coverage item exists so the model can flag MISSING real transfers.
    expect(items.some((i) => i.id.startsWith('data-ledger-coverage:'))).toBe(true);

    // Ledger items carry the real player's baseline for factual grounding.
    const ledgerItem = items.find((i) => i.category === 'data-ledger' && 'entry' in i.payload);
    expect(ledgerItem).toBeDefined();
  });

  it('respects the ceiling/resistance caps', () => {
    const state = createNewGame({ scenarioId: 'man-utd-1999', seed: 'dp-cap' });
    const items = sampleDataPack(state, { maxCeilingItems: 3, maxResistanceItems: 2 });
    expect(items.filter((i) => i.category === 'data-ceiling').length).toBeLessThanOrEqual(3);
    expect(items.filter((i) => i.category === 'data-resistance').length).toBeLessThanOrEqual(2);
  });
});
