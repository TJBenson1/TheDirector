import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { evaluateApproach, wouldAcceptMove, areRivals } from './agency.js';
import { attemptSigning } from './transfers.js';
import type { GameState } from './types.js';

function find(state: GameState, name: string) {
  return Object.values(state.players).find((p) => p.name === name)!;
}

describe('player agency & resistance (§6)', () => {
  it('a hard block makes a player unbuyable at any fee before unlock', () => {
    const state = cloneState(createNewGame({ seed: 'block' }));
    state.clubs.man_utd!.finances.transferBudget = 1_000_000_000;
    const tissier = find(state, 'Matt Le Tissier');
    const verdict = evaluateApproach(state, { playerId: tissier.id, toClub: 'man_utd' });
    expect(verdict.willing).toBe(false);
    expect(verdict.hardBlocked).toBe(true);
    expect(verdict.reason).toMatch(/one-club man|will not move/i);

    const res = attemptSigning(state, { playerId: tissier.id, toClub: 'man_utd', fee: 80_000_000 });
    expect(res.ok).toBe(false);
    expect('refusedByPlayer' in res && res.refusedByPlayer).toBe(true);
    // The player did not move.
    expect(state.players[tissier.id]!.club).toBe('southampton');
  });

  it('the block lifts after its unlock year', () => {
    const state = createNewGame({ seed: 'unlock' });
    const maldini = find(state, 'Paolo Maldini'); // blocked until 2009
    const before = evaluateApproach(state, { playerId: maldini.id, toClub: 'man_utd' });
    expect(before.hardBlocked).toBe(true);
    // Fast-forward the clock past the unlock.
    state.clock.date = '2010-07';
    const after = evaluateApproach(state, { playerId: maldini.id, toClub: 'man_utd' });
    expect(after.hardBlocked).toBe(false);
  });

  it('a direct-rival move meets near-absolute resistance', () => {
    const state = createNewGame({ seed: 'rival' });
    const lfc = Object.values(state.players).find((p) => p.club === 'liverpool' && p.ability >= 65)!;
    const verdict = evaluateApproach(state, {
      playerId: lfc.id,
      toClub: 'man_utd',
      wageOffer: lfc.wage * 3,
    });
    expect(verdict.willing).toBe(false);
    expect(verdict.reason).toMatch(/rival/i);
    expect(areRivals('man_utd', 'liverpool')).toBe(true);
  });

  it('an ordinary player is willing to move up for a fair package', () => {
    const state = createNewGame({ seed: 'willing' });
    // A modest, non-rival, low-loyalty player moving up to Man Utd.
    const modest = new Set(['sunderland', 'leicester', 'west_ham', 'middlesbrough', 'coventry']);
    const target = Object.values(state.players).find(
      (p) =>
        p.club !== null &&
        modest.has(p.club) &&
        p.resistance.clubLoyalty < 55 &&
        p.resistance.hardBlocks.length === 0,
    )!;
    const verdict = evaluateApproach(state, { playerId: target.id, toClub: 'man_utd', wageOffer: target.wage * 1.5 });
    expect(verdict.willing).toBe(true);
    expect(wouldAcceptMove(state, target.id, 'man_utd')).toBe(true);
  });

  it('a boyhood dream club adds real pull', () => {
    const state = cloneState(createNewGame({ seed: 'dream' }));
    const p = Object.values(state.players).find((x) => x.club === 'leeds' && x.resistance.hardBlocks.length === 0)!;
    const without = evaluateApproach(state, { playerId: p.id, toClub: 'barcelona' }).willingness;
    p.resistance.dreamClubs = ['barcelona'];
    const withDream = evaluateApproach(state, { playerId: p.id, toClub: 'barcelona' }).willingness;
    expect(withDream).toBeGreaterThan(without);
  });

  it('curated marquee players get their agency; squads keep procedural depth', () => {
    const state = createNewGame({ seed: 'squads' });
    expect(state.clubs.man_utd!.squad.length).toBe(23);
    expect(state.clubs.newcastle!.squad.length).toBe(23);
    // Shearer is present with his loyalty and block.
    const shearer = find(state, 'Alan Shearer');
    expect(shearer.resistance.clubLoyalty).toBeGreaterThanOrEqual(90);
    expect(shearer.resistance.hardBlocks.length).toBeGreaterThan(0);
    // Depth behind him is procedural (anonymous).
    const newcastleProcedural = state.clubs.newcastle!.squad.filter((id) => !state.players[id]!.curated);
    expect(newcastleProcedural.length).toBeGreaterThan(15);
  });
});
