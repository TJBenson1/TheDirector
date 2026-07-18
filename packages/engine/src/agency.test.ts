import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { evaluateApproach, wouldAcceptMove, areRivals, areDirectRivals, magnetPull } from './agency.js';
import { attemptSigning, executeTransfer } from './transfers.js';
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

  it('title rivals never sell to each other — impossible at any price', () => {
    // Arsenal-2004: Chelsea and Arsenal are both big clubs in the same league, so
    // they are DIRECT rivals even without a named rivalry. Essien's real move is
    // Chelsea (2005) — from Chelsea to Arsenal must be flat impossible.
    const s = cloneState(createNewGame({ scenarioId: 'arsenal-2004', seed: 'rivals' }));
    expect(areDirectRivals(s, 'chelsea', 'arsenal')).toBe(true);

    const chelseaPlayer = Object.values(s.players).find(
      (p) => p.club === 'chelsea' && p.curated && p.resistance.hardBlocks.length === 0,
    )!;
    const blocked = evaluateApproach(s, {
      playerId: chelseaPlayer.id,
      toClub: 'arsenal',
      wageOffer: chelseaPlayer.wage * 10, // money is no object
    });
    expect(blocked.willing).toBe(false);
    expect(blocked.hardBlocked).toBe(true);
    expect(blocked.reason).toMatch(/direct rival/i);
  });

  it('hijacking the same player from his neutral source club IS legitimate', () => {
    // The asymmetry the design turns on: Essien Chelsea→Arsenal is impossible,
    // but Essien from LYON (his 2004 source club, before Chelsea sign him in 2005)
    // is an ordinary, winnable pursuit — a clean hijack, not a rival sale.
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'rivals' });
    expect(s.players['cur_essien']!.club).toBe('lyon');
    expect(areDirectRivals(s, 'lyon', 'arsenal')).toBe(false);

    const hijack = evaluateApproach(s, { playerId: 'cur_essien', toClub: 'arsenal' });
    // Not walled off by the rivalry rule — gated only by ordinary agency.
    expect(hijack.hardBlocked).toBe(false);
    expect(hijack.reason).not.toMatch(/direct rival/i);
  });

  it('an ordinary player is willing to move up for a fair package', () => {
    const state = createNewGame({ seed: 'willing' });
    // Ordinary (non-star) modest-club players who aren't one-club loyalists.
    const modest = new Set(['sunderland', 'leicester', 'west_ham', 'middlesbrough', 'coventry']);
    const candidates = Object.values(state.players).filter(
      (p) =>
        p.club !== null &&
        modest.has(p.club) &&
        p.ability < 78 &&
        p.resistance.clubLoyalty < 66 &&
        p.resistance.hardBlocks.length === 0,
    );
    expect(candidates.length).toBeGreaterThan(0);
    // At least one such player both entertains a fair approach from Man Utd and
    // would accept the step up.
    const someMovesUp = candidates.some(
      (t) =>
        evaluateApproach(state, { playerId: t.id, toClub: 'man_utd', wageOffer: t.wage * 1.5 }).willing &&
        wouldAcceptMove(state, t.id, 'man_utd'),
    );
    expect(someMovesUp).toBe(true);
  });

  it('a boyhood dream club adds real pull', () => {
    const state = cloneState(createNewGame({ seed: 'dream' }));
    const p = Object.values(state.players).find((x) => x.club === 'leeds' && x.resistance.hardBlocks.length === 0)!;
    const without = evaluateApproach(state, { playerId: p.id, toClub: 'barcelona' }).willingness;
    p.resistance.dreamClubs = ['barcelona'];
    const withDream = evaluateApproach(state, { playerId: p.id, toClub: 'barcelona' }).willingness;
    expect(withDream).toBeGreaterThan(without);
  });

  it('curated marquee players get their agency; the world is real players only', () => {
    const state = createNewGame({ seed: 'squads' });
    // 21 real players: Silvestre & Fortune are United's real 1999 signings, now
    // OFFERED via the ledger (real-in) rather than baked in — they join in the
    // opening window by default.
    expect(state.clubs.man_utd!.squad.length).toBe(21);
    // Shearer is present with his loyalty and block.
    const shearer = find(state, 'Alan Shearer');
    expect(shearer.resistance.clubLoyalty).toBeGreaterThanOrEqual(90);
    expect(shearer.resistance.hardBlocks.length).toBeGreaterThan(0);
    // Newcastle is a REAL spine (Shearer, Given, Dyer, Solano…) with NO procedural
    // filler behind it — no regens: every name in the squad is a real player, and
    // the depth beneath the spine is abstract, not invented bodies.
    const newcastle = state.clubs.newcastle!.squad.map((id) => state.players[id]!);
    expect(newcastle.length).toBeGreaterThanOrEqual(10);
    expect(newcastle.every((p) => p.curated)).toBe(true);
  });
});

describe('the magnet effect (§ galáctico pull)', () => {
  it('a club fielding a superstar draws other stars more strongly', () => {
    const state = cloneState(createNewGame({ scenarioId: 'man-utd-2013', seed: 'magnet' }));
    state.clubs.man_utd!.finances.transferBudget = 500_000_000;
    // A quality target at a neutral (non-rival, foreign) club.
    const target = find(state, 'Iker Casillas');
    const req = { playerId: target.id, toClub: 'man_utd' as const, wageOffer: target.wage * 2 };
    const before = evaluateApproach(state, req).willingness;
    // United land a genuine galáctico (Ronaldo, 93) — however he got there.
    executeTransfer(state, { playerId: 'cur_ronaldo2', toClub: 'man_utd', fee: 100_000_000 });
    const after = evaluateApproach(state, req).willingness;
    expect(after).toBeGreaterThan(before);
  });

  it('the pull comes only from genuine superstars, and is bounded', () => {
    const state = cloneState(createNewGame({ scenarioId: 'man-utd-2013', seed: 'nomagnet' }));
    // Real Madrid (Ronaldo, 93) is a magnet; Spurs, with no 90+ player, is not.
    expect(magnetPull(state, 'real_madrid')).toBeGreaterThan(0);
    expect(magnetPull(state, 'spurs')).toBe(0);
    // It never runs away — even a stacked side stays within the cap.
    expect(magnetPull(state, 'real_madrid')).toBeLessThanOrEqual(14);
  });
});

describe('squad balance & over-stacking (§ chemistry)', () => {
  it('hoarding stars into one zone drags effective strength below the raw talent', () => {
    const state = cloneState(createNewGame({ scenarioId: 'man-utd-2013', seed: 'stack' }));
    state.clubs.man_utd!.finances.transferBudget = 2_000_000_000;
    const before = state.clubs.man_utd!.chemistryPenalty;
    const effBefore = state.clubs.man_utd!.strength - before;
    // Hoard the era's best forwards onto one club — five galácticos for three shirts.
    const attackers = Object.values(state.players)
      .filter((p) => p.ability >= 87 && ['AM', 'LW', 'RW', 'ST'].includes(p.positions[0]!) && p.club && p.club !== 'man_utd' && state.clubs[p.club!])
      .sort((a, b) => b.ability - a.ability)
      .slice(0, 6);
    for (const p of attackers) executeTransfer(state, { playerId: p.id, toClub: 'man_utd', fee: 80_000_000 });
    const after = state.clubs.man_utd!.chemistryPenalty;
    const effAfter = state.clubs.man_utd!.strength - after;
    // The glut incurs a real, bounded chemistry drag...
    expect(after).toBeGreaterThan(before);
    expect(after).toBeLessThanOrEqual(10);
    // ...so effective strength ends up BELOW where it started despite the talent.
    expect(effAfter).toBeLessThan(effBefore);
  });

  it('a balanced squad carries no chemistry penalty', () => {
    const state = cloneState(createNewGame({ scenarioId: 'man-utd-1999', seed: 'balanced' }));
    // Ferguson's real 1999 side is balanced — no zone is over-stacked with stars.
    expect(state.clubs.man_utd!.chemistryPenalty).toBe(0);
  });
});
