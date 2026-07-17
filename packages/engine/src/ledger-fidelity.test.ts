import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import type { GameState } from './types.js';

function playTo(scenarioId: string, seed: string, years: number): GameState {
  let s = createNewGame({ scenarioId, seed });
  const start = s.meta.startYear;
  let guard = 0;
  while (Number(s.clock.date.slice(0, 4)) < start + years && !s.board.dismissed && guard < 400) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    s = advanceWindow(s).state;
    guard++;
  }
  return s;
}

/** The forward ledgers I authored from memory for the 2003/2006 mid-era starts must
 *  actually execute — real AI-club moves fire as reality (these are NOT the user's
 *  club, so they auto-execute regardless of how the user plays). */
describe('forward-ledger fidelity (era-2003 / era-2006)', () => {
  it('barcelona-2003: the Galáctico sell-off leaves Real Madrid', () => {
    const s = playTo('barcelona-2003', 'fid:b03', 5); // → mid-2008
    expect(s.players['cur_cambiasso03']?.club, 'Cambiasso should have left Real (→Inter 2004)').not.toBe('real_madrid');
    expect(s.players['cur_figo03']?.club, 'Figo should have left Real (→Inter 2005)').not.toBe('real_madrid');
    expect(s.players['cur_ronaldo03']?.club, 'Ronaldo should have left Real (→Milan 2007)').not.toBe('real_madrid');
  }, 30000);

  it('real-madrid-2006: the Rijkaard Barça breaks up', () => {
    const s = playTo('real-madrid-2006', 'fid:r06', 4); // → mid-2010
    expect(s.players['cur_deco06']?.club, 'Deco should have left Barça (→Chelsea 2008)').not.toBe('barcelona');
    expect(s.players['cur_ronaldinho06']?.club, 'Ronaldinho should have left Barça (→Milan 2008)').not.toBe('barcelona');
    expect(s.players['cur_etoo06']?.club, 'Eto\'o should have left Barça (→Inter 2009)').not.toBe('barcelona');
  }, 30000);

  it('chelsea-2003: Ronaldo joins Real, Vieira leaves Arsenal', () => {
    const s = playTo('chelsea-2003', 'fid:c03', 7); // → mid-2010
    // Strong check: Cristiano actually lands at Real Madrid (man_utd → real_madrid, 2009).
    expect(s.players['cur_ronaldo03m']?.club, 'C. Ronaldo should be at Real Madrid by 2010').toBe('real_madrid');
    expect(s.players['cur_vieira03a']?.club, 'Vieira should have left Arsenal (→Juventus 2005)').not.toBe('arsenal');
  }, 30000);
});
