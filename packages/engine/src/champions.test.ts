import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { executeTransfer } from './transfers.js';
import { attemptSigning, courtPlayer, evaluateApproach } from './index.js';
import type { GameState } from './types.js';

function play(scenarioId: string, seed: string, endYear: number, hook?: (s: GameState) => void): GameState {
  let s = createNewGame({ scenarioId, seed });
  let guard = 0;
  while (Number(s.clock.date.slice(0, 4)) < endYear && guard++ < 120) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    if (s.board.dismissed) {
      s.board.dismissed = false;
      s.board.patience = 40;
      s.board.warnings = 0;
    }
    hook?.(s);
    s = advanceWindow(s).state;
  }
  return s;
}
const clWinner = (s: GameState, finalYear: number): string | undefined =>
  s.europeanCup?.titleHistory.find((t) => t.seasonYear === finalYear - 1)?.winnerId;

describe('Champions League (§ butterfly showcase)', () => {
  it('reality-default: a passive world reproduces the real European Cup winners', () => {
    const s = play('arsenal-2004', 'ucl', 2010);
    // era-2004 window, reality-anchored.
    expect(clWinner(s, 2006)).toBe('barcelona'); // Ronaldinho's Barça
    expect(clWinner(s, 2007)).toBe('milan');
    expect(clWinner(s, 2008)).toBe('man_utd');
    expect(clWinner(s, 2009)).toBe('barcelona'); // Guardiola's Barça
  });

  it('a butterfly that saps a champion flips the trophy to the next-best side', () => {
    // Barça, weakened (never landed Ronaldinho/Eto'o/Deco) — a strength drop
    // below their real baseline. Reality no longer holds where it depended on them.
    const weaken = (s: GameState) => {
      const b = s.clubs['barcelona'];
      if (b) b.strength = Math.max(20, b.baseStrength - 7);
    };
    const s = play('arsenal-2004', 'ucl', 2010, weaken);
    expect(clWinner(s, 2006)).not.toBe('barcelona'); // someone else lifts it
    expect(clWinner(s, 2009)).not.toBe('barcelona');
    // A year that never depended on Barça is untouched.
    expect(clWinner(s, 2008)).toBe('man_utd');
  });
});

describe('the continental star lens is reality-anchored (§ butterfly showcase)', () => {
  it('a REAL star sale banks no continental butterfly; an identical DEVIATION does', () => {
    // Selling a talisman the SAME way, once flagged as reality (the ledger), once
    // as a user deviation. Only the deviation should weaken the club on the
    // continent — reality's own star shuffles carry no butterfly.
    const buyerFunds = (s: GameState) => (s.clubs['real_madrid']!.finances.transferBudget = 300_000_000);
    const move = (reality: boolean) => {
      const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'anchor' });
      buyerFunds(s);
      const before = s.clubs['arsenal']!.starButterfly;
      executeTransfer(s, { playerId: 'cur_henry', toClub: 'real_madrid', fee: 40_000_000 }, { reality });
      expect(s.players['cur_henry']!.club).toBe('real_madrid'); // the move happened either way
      return s.clubs['arsenal']!.starButterfly - before;
    };
    // Reality: no butterfly (Arsenal are no weaker in Europe than reality says).
    expect(Math.abs(move(true))).toBeLessThan(0.01);
    // Deviation: the premium the talisman carried is stripped — a negative
    // continental butterfly.
    expect(move(false)).toBeLessThan(-0.5);
  });
});

describe('the Ronaldinho gambit (playable counterfactual)', () => {
  it("courting is required to prise Barça's spine away, and it moves the European board", () => {
    // Passive: reality — Barça win the 2006 European Cup.
    const base = play('manchester-united-2003', 'cf', 2010);
    expect(clWinner(base, 2006)).toBe('barcelona');

    // Counterfactual: United court and hijack Ronaldinho/Eto'o/Deco (a cold bid
    // is refused — Barça are in pole), keep Piqué, and load up.
    let s = createNewGame({ scenarioId: 'manchester-united-2003', seed: 'cf' });
    const targets = ['cur_ronaldinho', 'cur_etoo', 'cur_deco'];
    let signed = 0;
    for (let i = 0; i < 60 && Number(s.clock.date.slice(0, 4)) < 2010; i++) {
      for (const d of [...s.pendingDecisions]) {
        const keep = d.id.includes('pique-barca') ? (d.choices.find((c) => c.id === 'keep')?.id ?? d.choices[0]!.id) : d.choices[0]!.id;
        s = applyDecision(s, d.id, keep).state;
      }
      if (s.clock.window) {
        s.clubs['man_utd']!.finances.transferBudget = 900_000_000;
        for (const pid of targets) {
          const p = s.players[pid];
          if (!p || p.club === 'man_utd' || p.club === 'barcelona') continue;
          courtPlayer(s, pid);
          courtPlayer(s, pid);
          courtPlayer(s, pid);
          if (evaluateApproach(s, { playerId: pid, toClub: 'man_utd' }).willing) {
            if (attemptSigning(s, { playerId: pid, toClub: 'man_utd', fee: 45_000_000 }).ok) signed++;
          }
        }
      }
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }
    // The gambit landed the spine United really failed to sign.
    expect(signed).toBeGreaterThanOrEqual(2);
    expect(s.players.cur_ronaldinho?.club).toBe('man_utd');
    // The European board is not identical to reality — United's super-team takes
    // a final Barça won in the real world.
    const changed = [2006, 2007, 2008, 2009].some((y) => clWinner(s, y) !== clWinner(base, y));
    expect(changed).toBe(true);
  });
});

describe('temporary relegation (Calciopoli)', () => {
  it('Juventus vanish from Serie A for a season and return', () => {
    const s = play('juventus-1995', 'releg', 2009);
    const ita = s.leagues['ita-1']!;
    // Back in the top flight by 2007-08, at a full 18-club division.
    expect(ita.clubIds).toContain('juventus');
    expect(ita.clubIds).not.toContain('promoted_juventus');
    expect(ita.clubIds).toHaveLength(18);
    expect(s.clubs['juventus']!.relegatedUntil).toBeUndefined();
    // The drop-and-return really happened.
    expect(s.eventLog.some((e) => e.code === 'club.relegated' && e.data?.clubId === 'juventus')).toBe(true);
    expect(s.eventLog.some((e) => e.code === 'club.promoted' && e.data?.clubId === 'juventus')).toBe(true);
    // While relegated (2006-07), Juventus did not contest the Champions League.
    const cl0607 = s.europeanCup?.titleHistory.find((t) => t.seasonYear === 2006);
    expect(cl0607?.winnerId).not.toBe('juventus');
  });
});
