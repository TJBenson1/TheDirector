/**
 * Player attributes (docs/DESIGN-player-attributes.md — Phase 1).
 *
 * A player's TYPE, not just his overall level. Eight hidden attributes across
 * three groups (technical / physical / mental) describe WHAT KIND of player he
 * is; `ability` remains the single number the match sim uses.
 *
 * Phase-1 invariant (what keeps this calibration-safe): the vector is DERIVED on
 * demand from `ability` + `archetype` + position — it is never stored, never fed
 * back into `ability`, and the simulation never reads it. So adding attributes
 * changes no match, and calibration holds by construction. Only the style-fit,
 * player-type development and scouting layers read the vector. An `archetype`
 * shape is normalised against the position's roll-up weights so a player's
 * derived attributes roll BACK UP to (approximately) his `ability`.
 */

import type { Position, PlayerState, Attributes, AttributeKey } from './types.js';

export type { Attributes, AttributeKey } from './types.js';

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  'finishing', 'passing', 'technique', 'defending', 'pace', 'physical', 'vision', 'workrate',
];

/** How much each attribute contributes to `ability` for a given position (each
 *  row sums to 1). A striker's ability is mostly finishing/pace; a centre-half's
 *  is mostly defending/physical. Used both to roll a vector up to an ability and
 *  to normalise an archetype so its derived vector rolls back up to it. */
const POS_WEIGHTS: Record<Position, Attributes> = {
  GK: { finishing: 0.125, passing: 0.125, technique: 0.125, defending: 0.125, pace: 0.125, physical: 0.125, vision: 0.125, workrate: 0.125 },
  CB: { finishing: 0.02, passing: 0.10, technique: 0.04, defending: 0.34, pace: 0.12, physical: 0.24, vision: 0.06, workrate: 0.08 },
  LB: { finishing: 0.04, passing: 0.12, technique: 0.10, defending: 0.22, pace: 0.18, physical: 0.12, vision: 0.06, workrate: 0.16 },
  RB: { finishing: 0.04, passing: 0.12, technique: 0.10, defending: 0.22, pace: 0.18, physical: 0.12, vision: 0.06, workrate: 0.16 },
  DM: { finishing: 0.02, passing: 0.14, technique: 0.06, defending: 0.24, pace: 0.10, physical: 0.16, vision: 0.08, workrate: 0.20 },
  CM: { finishing: 0.06, passing: 0.18, technique: 0.14, defending: 0.12, pace: 0.08, physical: 0.12, vision: 0.14, workrate: 0.16 },
  AM: { finishing: 0.12, passing: 0.20, technique: 0.20, defending: 0.04, pace: 0.10, physical: 0.04, vision: 0.22, workrate: 0.08 },
  LW: { finishing: 0.16, passing: 0.10, technique: 0.20, defending: 0.06, pace: 0.22, physical: 0.06, vision: 0.10, workrate: 0.10 },
  RW: { finishing: 0.16, passing: 0.10, technique: 0.20, defending: 0.06, pace: 0.22, physical: 0.06, vision: 0.10, workrate: 0.10 },
  ST: { finishing: 0.28, passing: 0.06, technique: 0.14, defending: 0.04, pace: 0.18, physical: 0.14, vision: 0.10, workrate: 0.06 },
};

/** Archetype = relative emphasis per attribute (1.0 = neutral). The generator
 *  spreads a player's ability across the vector in these proportions. */
const ARCHETYPES: Record<string, Attributes> = {
  // Strikers
  poacher: { finishing: 1.5, passing: 0.7, technique: 1.0, defending: 0.4, pace: 1.15, physical: 0.9, vision: 0.85, workrate: 0.75 },
  'target-man': { finishing: 1.25, passing: 0.85, technique: 0.9, defending: 0.5, pace: 0.75, physical: 1.5, vision: 0.9, workrate: 0.9 },
  'complete-forward': { finishing: 1.3, passing: 0.95, technique: 1.15, defending: 0.5, pace: 1.15, physical: 1.1, vision: 1.0, workrate: 0.9 },
  // Wingers
  'winger-pace': { finishing: 1.0, passing: 1.0, technique: 1.25, defending: 0.6, pace: 1.5, physical: 0.8, vision: 1.0, workrate: 1.0 },
  // Attacking mids
  playmaker: { finishing: 0.95, passing: 1.4, technique: 1.3, defending: 0.6, pace: 0.85, physical: 0.75, vision: 1.4, workrate: 0.9 },
  // Central mids
  'box-to-box': { finishing: 0.9, passing: 1.05, technique: 1.0, defending: 1.05, pace: 1.05, physical: 1.2, vision: 1.0, workrate: 1.35 },
  'deep-playmaker': { finishing: 0.7, passing: 1.4, technique: 1.2, defending: 1.05, pace: 0.8, physical: 0.9, vision: 1.3, workrate: 1.0 },
  destroyer: { finishing: 0.5, passing: 0.9, technique: 0.8, defending: 1.4, pace: 0.9, physical: 1.3, vision: 0.85, workrate: 1.35 },
  // Defenders
  'ball-playing-cb': { finishing: 0.5, passing: 1.2, technique: 1.05, defending: 1.35, pace: 0.95, physical: 1.15, vision: 1.0, workrate: 0.95 },
  stopper: { finishing: 0.5, passing: 0.75, technique: 0.7, defending: 1.5, pace: 0.9, physical: 1.4, vision: 0.8, workrate: 1.0 },
  // A quick, positional centre-half whose game is reading + recovery pace, not
  // aerial power (Cannavaro, Ferdinand, Puyol) — defending≫physical.
  'covering-cb': { finishing: 0.45, passing: 1.0, technique: 0.85, defending: 1.45, pace: 1.15, physical: 1.0, vision: 0.95, workrate: 1.05 },
  'full-back-attacking': { finishing: 0.75, passing: 1.1, technique: 1.05, defending: 1.1, pace: 1.3, physical: 1.0, vision: 0.95, workrate: 1.3 },
  'full-back-defensive': { finishing: 0.6, passing: 0.95, technique: 0.9, defending: 1.3, pace: 1.1, physical: 1.2, vision: 0.85, workrate: 1.2 },
  // A wide man whose game is DELIVERY, not pace — crossing, passing, vision
  // (Beckham, Figo). Technique/passing/vision high, pace only ordinary.
  crosser: { finishing: 0.85, passing: 1.35, technique: 1.2, defending: 0.7, pace: 0.95, physical: 0.8, vision: 1.25, workrate: 1.15 },
  // A goalscoring wide forward who cuts inside (Robben, a young C. Ronaldo, wide
  // Henry) — pace + finishing + technique.
  'inside-forward': { finishing: 1.25, passing: 0.95, technique: 1.25, defending: 0.5, pace: 1.35, physical: 0.85, vision: 1.0, workrate: 0.9 },
  keeper: { finishing: 1, passing: 1, technique: 1, defending: 1, pace: 1, physical: 1, vision: 1, workrate: 1 },
};

/** The archetype a player defaults to from his primary position when none is set. */
export function defaultArchetypeFor(position: Position): string {
  switch (position) {
    case 'GK': return 'keeper';
    case 'CB': return 'stopper';
    case 'LB': case 'RB': return 'full-back-defensive';
    case 'DM': return 'destroyer';
    case 'CM': return 'box-to-box';
    case 'AM': return 'playmaker';
    case 'LW': case 'RW': return 'winger-pace';
    case 'ST': return 'complete-forward';
  }
}

function clampAttr(v: number): number {
  return Math.max(1, Math.min(99, Math.round(v)));
}

/** Spread an `ability` across the eight attributes per an archetype, normalised
 *  against the position weights so the vector rolls back up to (≈) `ability`. */
export function fillVector(ability: number, archetype: string, position: Position): Attributes {
  const shape = ARCHETYPES[archetype] ?? ARCHETYPES[defaultArchetypeFor(position)]!;
  const w = POS_WEIGHTS[position];
  let norm = 0;
  for (const k of ATTRIBUTE_KEYS) norm += w[k] * shape[k];
  const out = {} as Attributes;
  for (const k of ATTRIBUTE_KEYS) out[k] = clampAttr((ability * shape[k]) / norm);
  return out;
}

/** Roll a vector back up to an overall ability for the given position (Phase 3
 *  will make this authoritative; Phase 1 uses it only to check the invariant). */
export function deriveAbility(attrs: Attributes, position: Position): number {
  const w = POS_WEIGHTS[position];
  let sum = 0;
  for (const k of ATTRIBUTE_KEYS) sum += w[k] * attrs[k];
  return Math.round(sum);
}

/** A player's attribute vector — his TYPE. Stored, evolving state from Phase 3;
 *  falls back to deriving from ability+archetype for old saves / bare fixtures. */
export function attributesOf(player: { ability: number; positions: Position[]; archetype?: string; attributes?: Attributes }): Attributes {
  if (player.attributes) return player.attributes;
  const pos = player.positions[0] ?? 'CM';
  return fillVector(player.ability, player.archetype ?? defaultArchetypeFor(pos), pos);
}

/** Nudge a vector by ±1 (highest-weight attributes first) until it rolls up to
 *  exactly `target` for the position. Always converges within a few steps. */
function correctToTarget(v: Attributes, target: number, position: Position): void {
  const w = POS_WEIGHTS[position];
  const order = ATTRIBUTE_KEYS.slice().sort((a, b) => w[b] - w[a]);
  for (let guard = 0; guard < 300 && deriveAbility(v, position) !== target; guard++) {
    const up = target > deriveAbility(v, position);
    const k = order.find((key) => (up ? v[key] < 99 : v[key] > 1));
    if (!k) break;
    v[k] += up ? 1 : -1;
  }
}

/** Build a STORED vector for a player whose roll-up equals `ability` exactly. */
export function buildAttributes(ability: number, archetype: string, position: Position): Attributes {
  const v = fillVector(ability, archetype, position);
  correctToTarget(v, ability, position);
  return v;
}

/**
 * Move a player to a target ability by rescaling his attribute vector to roll up
 * to it (Phase 3: the vector is authoritative, ability is its roll-up). The
 * profile's SHAPE is preserved (proportional scale), so a player who has skewed
 * technical/athletic over his career keeps that identity as he grows or declines.
 * `ability` is then pinned to the exact target, so this is calibration-identical
 * to a direct `ability =` assignment. A player with no stored vector (old save /
 * bare fixture) just gets the ability set.
 */
export function setPlayerAbility(player: PlayerState, target: number): void {
  const t = Math.round(target);
  if (player.attributes) {
    const pos = player.positions[0] ?? 'CM';
    const cur = deriveAbility(player.attributes, pos);
    if (cur !== t) {
      const factor = t / Math.max(1, cur);
      for (const k of ATTRIBUTE_KEYS) player.attributes[k] = clampAttr(player.attributes[k] * factor);
      correctToTarget(player.attributes, t, pos);
    }
  }
  player.ability = t;
}

/** Skew a profile toward a coaching philosophy (Phase 3 evolution): a positive
 *  `lean` (a more possession-minded coach than the club had) grows the technical
 *  attributes and trims the athletic ones; negative reverses it. `amount` is the
 *  per-season shift. The overall level is NOT changed here — callers re-pin the
 *  roll-up to the player's ability afterwards — so this only reshapes his TYPE. */
export function skewProfile(a: Attributes, lean: number, amount: number): void {
  const shift = lean * amount;
  for (const k of ['passing', 'technique', 'vision'] as AttributeKey[]) a[k] = clampAttr(a[k] + shift);
  for (const k of ['pace', 'physical'] as AttributeKey[]) a[k] = clampAttr(a[k] - shift);
}

/** Ball-playing index: how much a player is about keeping and using the ball —
 *  what a POSSESSION coach prizes. */
export function possessionScore(a: Attributes): number {
  return (a.passing + a.technique + a.vision) / 3;
}

/** Athletic/defensive index: solidity and a counter threat — what a PRAGMATIC
 *  coach prizes. */
export function pragmaticScore(a: Attributes): number {
  return (a.defending + a.physical + a.pace) / 3;
}
