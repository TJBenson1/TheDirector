import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { ledgerSquadMatch } from './ledgerExec.js';
import type { GameState } from './types.js';

function runPassive(scenarioId: string, seed: string, endYear: number): GameState {
  let s = createNewGame({ scenarioId, seed });
  let guard = 0;
  while (Number(s.clock.date.slice(0, 4)) < endYear && guard++ < 120) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    if (s.board.dismissed) {
      s.board.dismissed = false;
      s.board.patience = 40;
      s.board.warnings = 0;
    }
    s = advanceWindow(s).state;
  }
  return s;
}

describe('Serie A era scandals (§9f)', () => {
  it('Parmalat collapses Parma into a distress fire-sale whose proceeds do not rebuild it', () => {
    const s = runPassive('juventus-1995', 'parmalat', 2006);
    expect(s.eventLog.some((e) => e.code === 'crisis.parmalat')).toBe(true);
    const parma = s.clubs['parma']!;
    expect(parma.financialHealth).toBe('crisis');
    // A distressed club's fire-sale proceeds go to creditors, not a transfer
    // kitty — so it cannot rebuild through the market.
    expect(parma.finances.transferBudget).toBeLessThan(5_000_000);
  });

  it('Calciopoli strips and guts Juventus — the mercenaries leave, the legends stay', () => {
    const s = runPassive('juventus-1995', 'calciopoli', 2008);
    expect(s.eventLog.some((e) => e.code === 'crisis.calciopoli')).toBe(true);
    const juve = s.clubs['juventus']!;
    expect(juve.financialHealth).not.toBe('healthy');
    expect(juve.prestige).toBeLessThan(88); // humbled from its 1995 standing

    // The real exodus (fidelity-tracked ledger moves).
    expect(s.players.cur_cannavaro_p?.club).toBe('real_madrid');
    expect(s.players.cur_thuram_p?.club).toBe('barcelona');
    expect(s.players.cur_zambrotta_j?.club).toBe('barcelona');
    // The loyal legends refuse to abandon the club.
    expect(s.players.cur_delpiero_j?.club).toBe('juventus');
    expect(s.players.cur_buffon_p?.club).toBe('juventus');
    expect(s.players.cur_trezeguet_m?.club).toBe('juventus');
  });

  it('the calcio world still holds to reality across the scandal decade', () => {
    const s = runPassive('juventus-1995', 'fidelity', 2008);
    const m = ledgerSquadMatch(s);
    expect(m.atRealClub / m.total).toBeGreaterThanOrEqual(0.95);
    expect(s.eventLog.filter((e) => e.code === 'ledger.fallback').length).toBe(0);
  });
});
