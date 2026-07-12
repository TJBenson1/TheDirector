import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { executeTransfer } from './transfers.js';
import { ledgerSquadMatch } from './ledgerExec.js';
import type { GameState } from './types.js';

function play(state: GameState, windows: number): GameState {
  let s = state;
  for (let i = 0; i < windows; i++) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    s = advanceWindow(s).state;
  }
  return s;
}

describe('reality-ledger execution (§9f)', () => {
  it('a passive user preserves real history — ledger subjects reach real clubs', () => {
    let s = createNewGame({ seed: 'ledger-passive' });
    s = play(s, 30); // ~15 years, no user transfers
    // Real destinations, as in reality.
    expect(s.players.cur_anelka?.club).toBe('real_madrid');
    expect(s.players.cur_overmars?.club).toBe('barcelona');
    expect(s.players.cur_crespo?.club).toBe('chelsea');
    expect(s.players.cur_rkeane?.club).toBe('spurs');
    expect(s.players.cur_owen?.club).toBe('real_madrid');

    const match = ledgerSquadMatch(s);
    expect(match.total).toBeGreaterThan(0);
    expect(match.atRealClub / match.total).toBeGreaterThanOrEqual(0.85);
    // Every executed entry logged as reality holding.
    expect(s.eventLog.some((e) => e.code === 'ledger.executed')).toBe(true);
    expect(s.eventLog.some((e) => e.code === 'ledger.fallback')).toBe(false);
  });

  it('the user signing a ledger target invalidates the entry → logged butterfly', () => {
    let s = cloneState(createNewGame({ seed: 'ledger-butterfly' }));
    // Before Anelka's move, the user (Man Utd) signs him first.
    s.clubs.man_utd!.finances.transferBudget = 100_000_000;
    const res = executeTransfer(s, { playerId: 'cur_anelka', toClub: 'man_utd', fee: 22_000_000 });
    expect(res.ok).toBe(true);

    // Advance until the ledger processes the Anelka entry (interrupts like the
    // Dec-1999 Keane event can fragment the way there).
    for (let i = 0; i < 6; i++) {
      if (s.meta.executedLedger.includes('cur_anelka')) break;
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      s = advanceWindow(s).state;
    }
    // The real move to Real Madrid could not happen; a butterfly was logged.
    expect(s.players.cur_anelka?.club).not.toBe('real_madrid');
    expect(s.timeline.divergenceLog.some((d) => d.kind === 'butterfly')).toBe(true);
    expect(s.eventLog.some((e) => e.code === 'ledger.fallback' && e.data?.cause === 'user-signed-target')).toBe(true);
  });

  it('each ledger entry resolves only once', () => {
    let s = createNewGame({ seed: 'ledger-once' });
    s = play(s, 30);
    const executed = s.eventLog.filter((e) => e.code === 'ledger.executed');
    const ids = executed.map((e) => e.data?.playerId);
    expect(new Set(ids).size).toBe(ids.length); // no duplicates
  });

  it('a ledger entry destined for the USER club is never a rival butterfly', () => {
    // Fellaini → Man Utd (2013) targets the user's own club: it must be consumed
    // silently, not fire a fallback/poach bid against a passive user's squad.
    let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'ledger-userclub' });
    s = play(s, 8); // through the 2013 summer + first season
    expect(s.meta.executedLedger).toContain('cur_fellaini');
    expect(s.players.cur_fellaini?.club).toBe('everton'); // he never actually arrives
    expect(s.eventLog.some((e) => e.code === 'poach.bid' && e.data?.from === 'man_utd')).toBe(false);
  });
});

describe('2013 post-Ferguson era pack (§4 data)', () => {
  it('places the four plan targets at their real clubs', () => {
    const s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'era2013' });
    expect(s.players.cur_bale?.club).toBe('spurs');
    expect(s.players.cur_thiago?.club).toBe('barcelona');
    expect(s.players.cur_baines?.club).toBe('everton');
    expect(s.players.cur_garay?.club).toBe('benfica');
  });

  it('passively reproduces the real 2013 knock-on transfers', () => {
    let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'era2013-passive' });
    s = play(s, 6);
    expect(s.players.cur_bale?.club).toBe('real_madrid');
    expect(s.players.cur_thiago?.club).toBe('bayern');
    expect(s.players.cur_ozil?.club).toBe('arsenal');
    expect(s.players.cur_lamela?.club).toBe('spurs');
  });

  it('buying Bale cancels the sale it funded — Madrid keep Özil (causal chain)', () => {
    let s = cloneState(createNewGame({ scenarioId: 'man-utd-2013', seed: 'era2013-bale' }));
    s.clubs.man_utd!.finances.transferBudget = 200_000_000;
    const res = executeTransfer(s, { playerId: 'cur_bale', toClub: 'man_utd', fee: 85_000_000 });
    expect(res.ok).toBe(true);
    s = play(s, 6);
    // Bale never reached Madrid, so the Özil sale it funded is cancelled — he
    // stays at Real Madrid rather than a like-for-like replacing him at Arsenal.
    expect(s.players.cur_bale?.club).toBe('man_utd');
    expect(s.players.cur_ozil?.club).toBe('real_madrid');
    expect(s.eventLog.some((e) => e.code === 'ledger.cancelled' && e.data?.playerId === 'cur_ozil')).toBe(true);
    // But Spurs still bank a huge fee (from you) and still rebuild.
    expect(s.players.cur_lamela?.club).toBe('spurs');
  });
});
