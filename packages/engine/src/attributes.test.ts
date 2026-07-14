import { describe, it, expect } from 'vitest';
import {
  attributesOf, fillVector, deriveAbility, defaultArchetypeFor,
  possessionScore, pragmaticScore, ATTRIBUTE_KEYS,
} from './attributes.js';
import type { Position } from './types.js';

describe('player attributes (Phase 1 — derived vector)', () => {
  // Each archetype paired with a natural position for the roll-up.
  const CASES: Array<[string, Position]> = [
    ['poacher', 'ST'], ['target-man', 'ST'], ['complete-forward', 'ST'],
    ['winger-pace', 'LW'], ['playmaker', 'AM'], ['box-to-box', 'CM'],
    ['deep-playmaker', 'DM'], ['destroyer', 'DM'], ['ball-playing-cb', 'CB'],
    ['stopper', 'CB'], ['full-back-attacking', 'RB'], ['full-back-defensive', 'LB'],
    ['keeper', 'GK'],
  ];

  it('the roll-up invariant holds: derive(fill(ability)) ≈ ability', () => {
    for (const [arch, pos] of CASES) {
      for (const ability of [58, 68, 78]) {
        const v = fillVector(ability, arch, pos);
        // Every attribute is a valid 1..99 rating.
        for (const k of ATTRIBUTE_KEYS) {
          expect(v[k]).toBeGreaterThanOrEqual(1);
          expect(v[k]).toBeLessThanOrEqual(99);
        }
        // Rolls back up to (close to) the ability it was spread from. A standout
        // attribute can hit the 99 cap at high ability, so allow a small margin.
        expect(Math.abs(deriveAbility(v, pos) - ability)).toBeLessThanOrEqual(5);
      }
    }
  });

  it('archetypes shape the profile the way their name implies', () => {
    const poacher = fillVector(78, 'poacher', 'ST');
    expect(poacher.finishing).toBeGreaterThan(poacher.defending);
    const stopper = fillVector(78, 'stopper', 'CB');
    expect(stopper.defending).toBeGreaterThan(stopper.finishing);
    expect(stopper.physical).toBeGreaterThan(stopper.technique);
    const playmaker = fillVector(78, 'playmaker', 'AM');
    expect(playmaker.passing).toBeGreaterThan(playmaker.defending);
    expect(playmaker.vision).toBeGreaterThan(playmaker.physical);
    const winger = fillVector(78, 'winger-pace', 'LW');
    expect(winger.pace).toBeGreaterThan(winger.physical);
  });

  it('possession vs pragmatic scores separate ball-players from athletes', () => {
    expect(possessionScore(fillVector(78, 'playmaker', 'AM')))
      .toBeGreaterThan(pragmaticScore(fillVector(78, 'playmaker', 'AM')));
    expect(pragmaticScore(fillVector(78, 'stopper', 'CB')))
      .toBeGreaterThan(possessionScore(fillVector(78, 'stopper', 'CB')));
  });

  it('attributesOf falls back to a sensible default archetype by position', () => {
    expect(defaultArchetypeFor('ST')).toBe('complete-forward');
    expect(defaultArchetypeFor('CB')).toBe('stopper');
    // A player with no archetype gets the position default; a set archetype wins.
    const bare = attributesOf({ ability: 75, positions: ['CB'] });
    const stopper = fillVector(75, 'stopper', 'CB');
    expect(bare.defending).toBe(stopper.defending);
    const overridden = attributesOf({ ability: 75, positions: ['CB'], archetype: 'ball-playing-cb' });
    expect(overridden.passing).toBeGreaterThan(bare.passing); // ball-player passes better
  });

  it('attributes scale with ability (a better player is better across the board-ish)', () => {
    const lo = fillVector(60, 'complete-forward', 'ST');
    const hi = fillVector(85, 'complete-forward', 'ST');
    expect(hi.finishing).toBeGreaterThan(lo.finishing);
    expect(hi.pace).toBeGreaterThan(lo.pace);
  });
});
