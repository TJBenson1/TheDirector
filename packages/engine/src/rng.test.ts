import { describe, it, expect } from 'vitest';
import { Rng, hashStringToU32 } from './rng.js';

describe('Rng', () => {
  it('is deterministic for a given seed', () => {
    const a = Rng.fromSeed('the-director');
    const b = Rng.fromSeed('the-director');
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different streams for different seeds', () => {
    const a = Rng.fromSeed('seed-a');
    const b = Rng.fromSeed('seed-b');
    expect(a.next()).not.toEqual(b.next());
  });

  it('round-trips through serialised state', () => {
    const a = Rng.fromSeed('save-load');
    a.next();
    a.next();
    const restored = new Rng(a.state);
    // Both continue identically from the persisted cursor.
    expect(restored.next()).toEqual(new Rng(a.state).next());
  });

  it('next() stays in [0, 1)', () => {
    const r = Rng.fromSeed('bounds');
    for (let i = 0; i < 10000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() is inclusive on both ends and stays in range', () => {
    const r = Rng.fromSeed('int');
    let sawMin = false;
    let sawMax = false;
    for (let i = 0; i < 5000; i++) {
      const v = r.int(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
      expect(Number.isInteger(v)).toBe(true);
      if (v === 3) sawMin = true;
      if (v === 7) sawMax = true;
    }
    expect(sawMin && sawMax).toBe(true);
  });

  it('int() handles a single-value range', () => {
    const r = Rng.fromSeed('single');
    expect(r.int(5, 5)).toBe(5);
  });

  it('fork() does not consume the parent stream', () => {
    const parent = Rng.fromSeed('parent');
    const before = new Rng(parent.state);
    parent.fork('injuries');
    parent.fork('transfers');
    // Parent's own sequence is untouched by forking.
    expect(parent.next()).toEqual(before.next());
  });

  it('fork() yields independent, label-stable streams', () => {
    const parent = Rng.fromSeed('parent');
    const injuriesA = parent.fork('injuries').next();
    const injuriesB = parent.fork('injuries').next();
    const transfers = parent.fork('transfers').next();
    expect(injuriesA).toEqual(injuriesB); // same label ⇒ same stream
    expect(injuriesA).not.toEqual(transfers); // different label ⇒ different stream
  });

  it('chance(0) is never true and chance(1) is always true', () => {
    const r = Rng.fromSeed('chance');
    for (let i = 0; i < 100; i++) {
      expect(r.chance(0)).toBe(false);
      expect(r.chance(1)).toBe(true);
    }
  });

  it('hashStringToU32 is a stable unsigned 32-bit value', () => {
    const h = hashStringToU32('manchester');
    expect(h).toBe(h >>> 0);
    expect(hashStringToU32('manchester')).toEqual(h);
  });
});
