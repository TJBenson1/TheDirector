/**
 * Stable structural hashing — the backbone of the determinism property test
 * (§18): same seed + same decisions ⇒ identical state hash.
 *
 * `stableStringify` serialises with object keys sorted recursively so the hash
 * is independent of key insertion order. The hash itself is a 64-bit FNV-1a
 * variant rendered as hex — not cryptographic, just a stable fingerprint.
 */

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = sortKeys(obj[key]);
    }
    return out;
  }
  return value;
}

/** 64-bit FNV-1a over the UTF-16 code units, as a 16-char hex string. */
export function hashString(str: string): string {
  // Two 32-bit lanes emulate a 64-bit accumulator without BigInt overhead.
  let h1 = 0x811c9dc5;
  let h2 = 0xc9dc5118;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x01000193) >>> 0;
    h2 = (h2 ^ (h1 >>> 13)) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

/** Stable fingerprint of any serialisable value. */
export function hashValue(value: unknown): string {
  return hashString(stableStringify(value));
}
