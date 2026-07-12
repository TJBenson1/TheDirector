import { describe, it, expect } from 'vitest';
import { createNewGame } from '@director/engine';
import { buildReferenceSlice } from './reference-loader.js';

function world() {
  return createNewGame({ scenarioId: 'man-utd-1999', seed: 'ref-test' });
}

describe('buildReferenceSlice', () => {
  it('injects era context for the scenario era', () => {
    const slice = buildReferenceSlice(world());
    expect(slice.eraContext).toContain('1995');
  });

  it('slices ledger entries touching a queried club', () => {
    const slice = buildReferenceSlice(world(), { clubIds: ['arsenal'] });
    // Arsenal's real ledger moves (e.g. Anelka → Real Madrid) are included.
    expect(slice.ledgerEntries.some((e) => e.from === 'arsenal')).toBe(true);
    // …and unrelated clubs are not dragged in.
    expect(slice.ledgerEntries.every((e) => e.from === 'arsenal' || e.to === 'arsenal')).toBe(true);
  });

  it('builds a career baseline with the real moves for a curated player', () => {
    const slice = buildReferenceSlice(world(), { playerIds: ['cur_anelka'] });
    expect(slice.careerBaselines).toHaveLength(1);
    const b = slice.careerBaselines[0]!;
    expect(b.playerId).toBe('cur_anelka');
    expect(b.birthCeiling).toBeGreaterThan(0);
    expect(b.realMoves?.some((m) => m.to === 'real_madrid')).toBe(true);
  });

  it('includes club finance/ownership reference for a queried club', () => {
    const slice = buildReferenceSlice(world(), { clubIds: ['man_utd'] });
    expect(slice.clubs).toHaveLength(1);
    expect(slice.clubs[0]!.id).toBe('man_utd');
    expect(slice.clubs[0]!.ownership).toBeTruthy();
  });
});
