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
    // Barça, gutted of their continental spine by a deviation — a banked star
    // butterfly (§ showcase) that drops them below their real baseline. This is
    // the ONLY thing that opens reality up: ageing alone never would. Reality no
    // longer holds where it depended on them.
    const weaken = (s: GameState) => {
      const b = s.clubs['barcelona'];
      if (b) b.starButterfly = -7;
    };
    const s = play('arsenal-2004', 'ucl', 2010, weaken);
    expect(clWinner(s, 2006)).not.toBe('barcelona'); // someone else lifts it
    expect(clWinner(s, 2009)).not.toBe('barcelona');
    // A year that never depended on Barça still resolves among the real finalists —
    // the deviation stays logical (Man Utd or the side they really beat, Chelsea),
    // it does not throw the trophy to a minnow.
    expect(['man_utd', 'chelsea']).toContain(clWinner(s, 2008));
  });
});

describe('the continental star lens is reality-anchored (§ butterfly showcase)', () => {
  it('a REAL star sale banks no continental butterfly; an identical DEVIATION does', () => {
    // Henry leaving Arsenal for Barcelona is his REAL move (2007). Flagged reality
    // it carries no butterfly (Arsenal are no weaker in Europe than history says);
    // as a user DEVIATION — the same sale, forced early — it strips the premium the
    // talisman carried.
    const move = (reality: boolean) => {
      const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'anchor' });
      s.clubs['barcelona']!.finances.transferBudget = 300_000_000;
      const before = s.clubs['arsenal']!.starButterfly;
      executeTransfer(s, { playerId: 'cur_henry', toClub: 'barcelona', fee: 40_000_000 }, { reality });
      expect(s.players['cur_henry']!.club).toBe('barcelona');
      return s.clubs['arsenal']!.starButterfly - before;
    };
    expect(Math.abs(move(true))).toBeLessThan(0.01);
    expect(move(false)).toBeLessThan(-0.5);
  });

  it('the BUYER side lifts a club only where the star fills a GAP — not into an already-elite XI', () => {
    // The counterfactual the whole pack is built on: United land Ronaldinho. He
    // cracks a strong-but-not-stacked forward line, so it is genuine STRENGTH — a
    // positive continental butterfly. Flagged reality it banks nothing.
    const united = (reality: boolean) => {
      const s = createNewGame({ scenarioId: 'chelsea-2003', seed: 'buy' });
      s.clubs['man_utd']!.finances.transferBudget = 200_000_000;
      const before = s.clubs['man_utd']!.starButterfly;
      executeTransfer(s, { playerId: 'cur_ronaldinho', toClub: 'man_utd', fee: 50_000_000 }, { reality });
      return s.clubs['man_utd']!.starButterfly - before;
    };
    expect(Math.abs(united(true))).toBeLessThan(0.01);
    expect(united(false)).toBeGreaterThan(0.3);

    // The flip side — and the concern that motivated this: a good striker into an
    // ALREADY-ELITE side (the Invincibles' front line, built around a 92-rated
    // Henry) is DEPTH, not strength. He never displaces the XI, so there is ~no
    // continental butterfly. Buying a star is not free strength.
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'depth' });
    s.clubs['arsenal']!.finances.transferBudget = 200_000_000;
    const before = s.clubs['arsenal']!.starButterfly;
    executeTransfer(s, { playerId: 'cur_drogba', toClub: 'arsenal', fee: 30_000_000 });
    expect(Math.abs(s.clubs['arsenal']!.starButterfly - before)).toBeLessThan(0.01);
  });
});

describe('the Ronaldinho gambit (a man-utd-1999 counterfactual)', () => {
  it('United, playing forward from 1999, can hijack Ronaldinho at his real 2003 move — and it bends the European board', () => {
    // Passive: reality — Barça win the 2006 European Cup (Ronaldinho's Barça).
    const base = play('man-utd-1999', 'cf', 2010);
    expect(clWinner(base, 2006)).toBe('barcelona');

    // Counterfactual: playing United forward, court and hijack the young Ronaldinho
    // from PSG in the summer his real Barça move comes live (a cold bid is refused —
    // Barça are in pole), and load up.
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'cf' });
    let signed = false;
    for (let i = 0; i < 120 && Number(s.clock.date.slice(0, 4)) < 2010; i++) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      if (s.clock.window) {
        s.clubs['man_utd']!.finances.transferBudget = 900_000_000;
        const p = s.players['cur_ronaldinho'];
        if (p && p.club !== 'man_utd' && p.club !== 'barcelona') {
          courtPlayer(s, 'cur_ronaldinho');
          courtPlayer(s, 'cur_ronaldinho');
          courtPlayer(s, 'cur_ronaldinho');
          if (evaluateApproach(s, { playerId: 'cur_ronaldinho', toClub: 'man_utd' }).willing) {
            if (attemptSigning(s, { playerId: 'cur_ronaldinho', toClub: 'man_utd', fee: 45_000_000 }).ok) signed = true;
          }
        }
      }
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }
    // The gambit landed the man United really failed to sign.
    expect(signed).toBe(true);
    expect(s.players.cur_ronaldinho?.club).toBe('man_utd');
    // The European board is no longer identical to reality — a Ronaldinho-powered
    // United sends a butterfly through the knockout draws.
    const changed = [2006, 2007, 2008, 2009].some((y) => clWinner(s, y) !== clWinner(base, y));
    expect(changed).toBe(true);
  });
});

describe('an upset champion is fragile once the timeline bends (§ butterfly showcase)', () => {
  it("Liverpool's 2005 miracle evaporates when their spine is raided — yet holds when the world is left alone", () => {
    // Undisturbed, the improbable is reproduced: Liverpool lift the 2005 European
    // Cup (a weak side on a knockout run, reality not merit).
    const passive = play('arsenal-2004', 'ucl', 2006);
    expect(clWinner(passive, 2005)).toBe('liverpool');

    // A rich rival prises away Gerrard and Xabi Alonso in the summer of 2004 — the
    // spine Liverpool had no strength to replace. The timeline is bent AND the
    // disturbance reaches the champion, so reality no longer shields the miracle:
    // Liverpool take their true, long odds and the upset evaporates.
    let s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'ucl' });
    s.clubs['chelsea']!.finances.transferBudget = 400_000_000;
    for (const pid of ['cur_gerrard3', 'cur_alonso']) {
      expect(s.players[pid]?.club).toBe('liverpool');
      executeTransfer(s, { playerId: pid, toClub: 'chelsea', fee: 45_000_000 });
    }
    expect(s.players['cur_gerrard3']?.club).toBe('chelsea'); // the raid landed
    let guard = 0;
    while (Number(s.clock.date.slice(0, 4)) < 2006 && guard++ < 40) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }
    expect(clWinner(s, 2005)).not.toBe('liverpool');
  });
});

describe('continental butterfly accounting (§ butterfly showcase)', () => {
  it('is deterministic: the same seed yields identical European Cup winners', () => {
    const a = play('arsenal-2004', 'determinism', 2010);
    const b = play('arsenal-2004', 'determinism', 2010);
    expect(a.europeanCup?.titleHistory).toEqual(b.europeanCup?.titleHistory);
  });

  it('a round-trip nets out: buy a star then sell him on and the continental swing cancels', () => {
    // United land Ronaldinho (the buy lifts them); then he moves on to Barcelona
    // where reality had him. The two swings must cancel — a butterfly must not
    // leave a permanent scar from churn that reality would have shrugged off.
    const s = createNewGame({ scenarioId: 'chelsea-2003', seed: 'roundtrip' });
    const before = s.clubs['man_utd']!.starButterfly;
    s.clubs['man_utd']!.finances.transferBudget = 300_000_000;
    executeTransfer(s, { playerId: 'cur_ronaldinho', toClub: 'man_utd', fee: 50_000_000 });
    expect(s.clubs['man_utd']!.starButterfly - before).toBeGreaterThan(0.1); // the buy lifts them
    s.clubs['barcelona']!.finances.transferBudget = 300_000_000;
    executeTransfer(s, { playerId: 'cur_ronaldinho', toClub: 'barcelona', fee: 50_000_000 });
    // Back to roughly where they started — no lasting continental scar.
    expect(Math.abs(s.clubs['man_utd']!.starButterfly - before)).toBeLessThan(0.3);
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

describe('the world ends at the edge of reality (2025)', () => {
  it('a 2013 career stops after the 2024-25 season — no invented future beyond the data', () => {
    const s = play('man-utd-2013', 'worldend', 2035);
    // The clock halts at the 2025 rollover and advances no further.
    expect(s.clock.date).toBe('2025-07');
    const cl = s.europeanCup?.titleHistory ?? [];
    // The last European Cup is the real 2025 final (season 2024); nothing past it.
    expect(Math.max(...cl.map((t) => t.seasonYear))).toBe(2024);
    expect(clWinner(s, 2025)).toBe('psg');
  });
});

describe('a talisman-carried dynasty opens up when he is diverted (§ butterfly showcase)', () => {
  it("Real Madrid's Ronaldo-era European Cups hold in a passive world but not once he is prised away", () => {
    // Passive: Ronaldo stays and Real reproduce the Décima run to the letter.
    const passive = play('man-utd-2013', 'talisman', 2020);
    expect(clWinner(passive, 2014)).toBe('real_madrid');
    expect(clWinner(passive, 2017)).toBe('real_madrid');
    expect(clWinner(passive, 2018)).toBe('real_madrid');

    // A rival prises Ronaldo away before it all begins — those finals, which he
    // carried, are thrown open to merit (his weight travels to his new club).
    let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'talisman' });
    s.clubs['man_city']!.finances.transferBudget = 500_000_000;
    executeTransfer(s, { playerId: 'cur_ronaldo2', toClub: 'man_city', fee: 120_000_000 });
    expect(s.players['cur_ronaldo2']!.club).toBe('man_city');
    let guard = 0;
    while (Number(s.clock.date.slice(0, 4)) < 2019 && guard++ < 80) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }
    // At least one final Real really won (2014/16/17/18) is now someone else's.
    const held = [2014, 2016, 2017, 2018].filter((y) => clWinner(s, y) === 'real_madrid').length;
    expect(held).toBeLessThan(4);
  });
});
