import { describe, it, expect } from 'vitest';
import { createNewGame } from '@director/engine';
import { runOp } from './ops.js';

// Regression for the Wiltord bug: a sale narrated as "£0, still in the squad, no
// money" was caused by the narrator passing a natural-language player/club
// reference ("Wiltord", "Bolton Wanderers") that the op couldn't resolve, so the
// tool returned ok:false and the model then confabulated a phantom deal. The ops
// now resolve players and clubs by name OR id.
describe('transfer ops resolve players and clubs by name or id', () => {
  it('sell works when given a player name and a club name (not just ids)', () => {
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'ops' });
    const before = s.clubs['arsenal']!.finances.transferBudget;
    const { state, result } = runOp(s, 'sell', { playerId: 'Wiltord', toClub: 'Bolton Wanderers', fee: 4_260_000 });
    expect((result as { ok: boolean }).ok).toBe(true);
    // The player actually left, and the money actually landed — no phantom sale.
    expect(state.clubs['arsenal']!.squad.includes('cur_wiltord_04')).toBe(false);
    expect(state.clubs['arsenal']!.finances.transferBudget).toBe(before + 4_260_000);
  });

  it('sell falls back to a real fee (never £0) when the fee is missing', () => {
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'ops' });
    const before = s.clubs['arsenal']!.finances.transferBudget;
    const { state, result } = runOp(s, 'sell', { playerId: 'cur_wiltord_04', toClub: 'liverpool', fee: 0 });
    expect((result as { ok: boolean }).ok).toBe(true);
    // Guard: a fumbled £0 never gives a player away — the budget rises meaningfully.
    expect(state.clubs['arsenal']!.finances.transferBudget).toBeGreaterThan(before + 1_000_000);
  });

  it('an unresolvable club returns a clear error, not a silent no-op', () => {
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'ops' });
    const { result } = runOp(s, 'sell', { playerId: 'cur_wiltord_04', toClub: 'Nonexistent FC', fee: 4_000_000 });
    expect((result as { ok: boolean }).ok).toBe(false);
    expect((result as { reason: string }).reason).toMatch(/No club found/i);
  });
});

// Regression for the "English-centric buyers" bug: the offers op gated suitors on
// leagueId !== null, but foreign giants sit in the world as context clubs (leagueId
// null), so every suitor list came out all-English — Vieira drawing Chelsea/Liverpool
// /United instead of Juventus/Real. Offers now (a) admit foreign clubs and (b) headline
// the player's REAL destination from the era ledger.
describe('offers admit foreign suitors and headline the real destination', () => {
  type Offer = { clubId: string; club: string; fee: number };
  const offersFor = (playerId: string): Offer[] => {
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'offers' });
    return (runOp(s, 'offers', { playerId }).result as { offers: Offer[] }).offers;
  };

  it('Vieira draws his real suitor Juventus, not an all-English list', () => {
    const offers = offersFor('cur_vieira2');
    expect(offers.map((o) => o.clubId)).toContain('juventus');
    // The lead suitor is the real destination, and it isn't an English club.
    expect(offers[0]!.clubId).toBe('juventus');
    const english = new Set(['chelsea', 'liverpool', 'man_utd', 'newcastle', 'everton', 'spurs', 'bolton']);
    expect(offers.every((o) => english.has(o.clubId))).toBe(false);
  });

  it('a Bosman departure (Edu → Valencia, Wiltord → Lyon) still surfaces the real club', () => {
    expect(offersFor('cur_edu').map((o) => o.clubId)).toContain('valencia');
    expect(offersFor('cur_wiltord_04').map((o) => o.clubId)).toContain('lyon');
  });
});
