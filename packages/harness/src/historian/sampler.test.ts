import { describe, it, expect } from 'vitest';
import { traceCareer } from '../runCareer.js';
import { passiveBot, raidingBot } from '../strategy.js';
import { sampleCareer } from './sampler.js';

function capture(bot = passiveBot, seed = 'sampler-test') {
  return traceCareer({ scenarioId: 'man-utd-1999', seed, years: 15, bot }).finalState;
}

describe('sampleCareer', () => {
  it('produces reviewable items with unique ids and a reference slice each', () => {
    const items = sampleCareer(capture(), 'c1');
    expect(items.length).toBeGreaterThan(0);
    // Ids are unique across the batch (they label items in a multi-career run).
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    // Every item is grounded (§2): a reference slice with era context.
    for (const it of items) {
      expect(it.reference.eraContext).toBeTruthy();
      expect(it.significance).toBeGreaterThanOrEqual(0);
      expect(it.significance).toBeLessThanOrEqual(1);
    }
    const cats = new Set(items.map((i) => i.category));
    expect(cats.has('career-arc')).toBe(true);
    expect(cats.has('table-checkpoint')).toBe(true);

    // Career arcs are REAL players only — no fabricated names in the narrative.
    const arcs = items.filter((i) => i.category === 'career-arc');
    expect(arcs.length).toBeGreaterThan(0);
    expect(arcs.every((a) => a.payload.curated === true)).toBe(true);
  });

  it('is deterministic: same state + id ⇒ identical items', () => {
    const state = capture();
    expect(sampleCareer(state, 'c1')).toEqual(sampleCareer(state, 'c1'));
  });

  it('caps sampled items but never drops a 100%-coverage item', () => {
    const state = capture(raidingBot);
    const mk = (c: string) =>
      c === 'divergence-chain' || c === 'ambition-override' || c === 'table-checkpoint';
    const uncapped = sampleCareer(state, 'raid');
    const capped = sampleCareer(state, 'raid', { maxItemsPerCareer: 30 });

    const uncappedMustKeep = uncapped.filter((i) => mk(i.category)).length;
    const cappedMustKeep = capped.filter((i) => mk(i.category)).length;
    // An aggressive (raiding) run reshapes the world → butterflies to review.
    expect(uncappedMustKeep).toBeGreaterThan(0);
    // The cap never drops a must-keep item…
    expect(cappedMustKeep).toBe(uncappedMustKeep);
    // …and the sampled (non-coverage) items respect the cap headroom.
    const cappedOthers = capped.length - cappedMustKeep;
    expect(cappedOthers).toBeLessThanOrEqual(30);
    expect(capped.length).toBeLessThanOrEqual(Math.max(cappedMustKeep, 30));
  });

  it('samples divergence chains from an aggressive career', () => {
    const items = sampleCareer(capture(raidingBot), 'raid2');
    expect(items.some((i) => i.category === 'divergence-chain')).toBe(true);
  });
});
