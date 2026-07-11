/**
 * Seeded, deterministic RNG.
 *
 * Non-negotiable engineering rule #2 (§1): every save has a seed; same seed +
 * same decisions = same game. The RNG's entire state is a single 32-bit
 * integer so it serialises trivially into `GameState` and round-trips through
 * save/load with zero drift.
 *
 * The generator is mulberry32 — small, fast, and good enough for game
 * simulation (it is NOT cryptographically secure and must never be used as
 * such). We deliberately do not use `Math.random()` anywhere in the engine.
 */

/** FNV-1a 32-bit string hash → unsigned 32-bit seed. */
export function hashStringToU32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // h *= 16777619, done with Math.imul to stay in 32-bit range.
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mix two 32-bit values into a new 32-bit value (used for stream forking). */
function mix(a: number, b: number): number {
  let h = (a ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad) >>> 0;
  h = (h ^ b) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97) >>> 0;
  return (h ^ (h >>> 15)) >>> 0;
}

export class Rng {
  private s: number;

  constructor(state: number) {
    this.s = state >>> 0;
  }

  /** Build an RNG from a human-readable string seed. */
  static fromSeed(seed: string): Rng {
    return new Rng(hashStringToU32(seed));
  }

  /** Serialisable internal state. Persist this in GameState; restore via `new Rng(state)`. */
  get state(): number {
    return this.s;
  }

  /**
   * A deterministically-derived child stream. Forking does NOT consume the
   * parent's state, so two subsystems can each fork a named stream and neither
   * perturbs the other's sequence. This decouples roll ordering across
   * modules — critical for keeping determinism stable as the engine grows.
   */
  fork(label: string): Rng {
    return new Rng(mix(this.s, hashStringToU32(label)));
  }

  /** Next float in [0, 1). Advances state. */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Float in [min, max). */
  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Integer in [min, max] inclusive on both ends. */
  int(min: number, max: number): number {
    if (max < min) throw new Error(`Rng.int: max (${max}) < min (${min})`);
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** True with probability p (clamped to [0, 1]). */
  chance(p: number): boolean {
    return this.next() < clamp01(p);
  }

  /** Uniformly pick one element. Throws on empty arrays. */
  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Rng.pick: empty array');
    return arr[this.int(0, arr.length - 1)]!;
  }

  /**
   * Approximately-normal sample via the sum of 3 uniforms (Irwin–Hall).
   * Cheap, bounded, and good enough for spreading ratings/ages. Result is
   * unbounded in theory but effectively within ~mean ± 3·sd.
   */
  gaussian(mean = 0, sd = 1): number {
    const u = this.next() + this.next() + this.next() - 1.5; // mean 0, sd ~0.5
    return mean + (u / 0.5) * sd;
  }

  /** In-place Fisher–Yates shuffle using this stream. Returns the same array. */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      const tmp = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = tmp;
    }
    return arr;
  }
}

export function clamp01(p: number): number {
  if (p < 0) return 0;
  if (p > 1) return 1;
  return p;
}
