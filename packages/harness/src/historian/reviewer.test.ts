import { describe, it, expect } from 'vitest';
import { scriptedClient } from './client.js';
import { reviewItems } from './reviewer.js';
import type { RawVerdict, ReviewItem } from './types.js';

function item(id: string): ReviewItem {
  return {
    id,
    category: 'career-arc',
    summary: id,
    significance: 0.5,
    payload: {},
    reference: { eraContext: 'x', ledgerEntries: [], careerBaselines: [], clubs: [], divergenceLog: [] },
  };
}

const pass = (id: string): RawVerdict => ({
  itemId: id, verdict: 'PASS', severity: null, confidence: 'high', reasoning: 'ok', suspectedSystem: '',
});

describe('reviewItems', () => {
  it('returns exactly one verdict per item, in order, with category attached', async () => {
    const items = [item('a'), item('b')];
    const client = scriptedClient((batch) => batch.map((i) => pass(i.id)));
    const verdicts = await reviewItems(items, client, { mode: 'calibration' });
    expect(verdicts.map((v) => v.itemId)).toEqual(['a', 'b']);
    expect(verdicts.every((v) => v.category === 'career-arc')).toBe(true);
  });

  it('ignores hallucinated item ids and back-fills uncovered items', async () => {
    const items = [item('a'), item('b')];
    const client = scriptedClient(() => [pass('a'), pass('ghost')]); // 'b' omitted, 'ghost' invalid
    const verdicts = await reviewItems(items, client, { mode: 'calibration' });
    expect(verdicts.map((v) => v.itemId)).toEqual(['a', 'b']);
    const b = verdicts.find((v) => v.itemId === 'b')!;
    expect(b.confidence).toBe('low');
    expect(b.suspectedSystem).toBe('historian-coverage');
  });

  it('confirms a SEVERE finding only when the re-run agrees', async () => {
    // 'sev' comes back SEVERE the first time, MINOR on the confirmation re-run.
    const seen = new Set<string>();
    const client = scriptedClient((batch) =>
      batch.map((i) => {
        if (i.id !== 'sev') return pass(i.id);
        const first = !seen.has(i.id);
        seen.add(i.id);
        return {
          itemId: i.id, verdict: 'FAIL', severity: first ? 'SEVERE' : 'MINOR',
          confidence: 'high', reasoning: 'maybe', suspectedSystem: 'valuation',
        };
      }),
    );
    const verdicts = await reviewItems([item('sev')], client, { mode: 'calibration' });
    expect(verdicts[0]!.severity).toBe('SEVERE');
    expect(verdicts[0]!.confirmed).toBe(false);
  });

  it('marks a SEVERE finding confirmed when the re-run repeats it', async () => {
    const client = scriptedClient((batch) =>
      batch.map((i) => ({
        itemId: i.id, verdict: 'FAIL' as const, severity: 'SEVERE' as const,
        confidence: 'high' as const, reasoning: 'fantasy', suspectedSystem: 'rival-AI',
      })),
    );
    const verdicts = await reviewItems([item('sev')], client, { mode: 'calibration' });
    expect(verdicts[0]!.confirmed).toBe(true);
  });
});
