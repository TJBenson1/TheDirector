/**
 * The world's equilibrium with reality (§9a; § butterfly showcase).
 *
 * The governing principle: the world plays out as reality until the USER bends
 * it, and then the AI always seeks to restore equilibrium — a club denied a real
 * target does not shrug and accept it, it reaches for a replacement. But finite
 * top-level talent means the replacement is a downgrade (Duff is no Ronaldinho),
 * so the miss leaves a real, lasting mark — most sharply in the Champions League.
 *
 * These tests pin BOTH halves: reality holds absolutely while the world is
 * undisturbed (test 1), and a genuine user deviation provokes the equilibrium-
 * seeking response AND a measurable continental cost that reality no longer
 * papers over (test 2).
 */
import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { executeTransfer } from './transfers.js';
import { ledgerSquadMatch } from './ledgerExec.js';
import { attemptSigning, courtPlayer, evaluateApproach } from './index.js';
import type { GameState } from './types.js';

const clWinner = (s: GameState, seasonYear: number): string | undefined =>
  s.europeanCup?.titleHistory.find((t) => t.seasonYear === seasonYear)?.winnerId;

/** Fully passive: sanction reality (choice 0), keep the manager in his seat. */
function runPassive(scenarioId: string, seed: string, endYear: number): GameState {
  let s = createNewGame({ scenarioId, seed });
  let guard = 0;
  while (Number(s.clock.date.slice(0, 4)) < endYear && guard++ < 80) {
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

describe('reality holds while the world is undisturbed (§9a divergence gate)', () => {
  it('a passive world stays at zero aggression and reproduces the real European Cup winners', () => {
    const s = runPassive('arsenal-2004', 'ucl', 2010);
    // The user did nothing but sanction reality — the world never diverged.
    expect(s.userAggression).toBe(0);
    // Every anchored season plays out exactly as it really did — ageing, form and
    // reality's own transfers never unseat a real winner (an upset winner like
    // Liverpool 2005 would otherwise be fragile).
    expect(clWinner(s, 2004)).toBe('liverpool'); // the real upset holds
    expect(clWinner(s, 2005)).toBe('barcelona');
    expect(clWinner(s, 2006)).toBe('milan');
    expect(clWinner(s, 2007)).toBe('man_utd');
    expect(clWinner(s, 2008)).toBe('barcelona');
    // No continental butterfly is banked anywhere in a passive world.
    const banked = Object.values(s.clubs).some((c) => Math.abs(c.starButterfly) > 0.01);
    expect(banked).toBe(false);
  });
});

describe('a denied club fights back — but the miss leaves a mark (§ butterfly showcase)', () => {
  it('Chelsea, denied their real target, sign a lesser man and are weaker in Europe for it', () => {
    // The user (Arsenal) hijacks Drogba — Chelsea's real centre-forward signing.
    let s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'drogba' });
    let hijacked = false;
    for (let i = 0; i < 30 && Number(s.clock.date.slice(0, 4)) < 2007; i++) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      const drogba = s.players['cur_drogba'];
      if (!hijacked && drogba && drogba.club !== 'arsenal' && s.clock.window) {
        s.clubs['arsenal']!.finances.transferBudget = 200_000_000;
        courtPlayer(s, 'cur_drogba');
        courtPlayer(s, 'cur_drogba');
        courtPlayer(s, 'cur_drogba');
        if (
          evaluateApproach(s, { playerId: 'cur_drogba', toClub: 'arsenal' }).willing &&
          attemptSigning(s, { playerId: 'cur_drogba', toClub: 'arsenal', fee: 35_000_000 }).ok
        ) {
          hijacked = true;
        }
      }
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }

    // The hijack landed, and reality no longer holds where it depended on Drogba.
    expect(hijacked).toBe(true);
    expect(s.players['cur_drogba']?.club).toBe('arsenal');

    // Equilibrium-seeking: Chelsea do not simply accept the miss — they fall back
    // for a replacement (a comparable, available man — "if you take Drogba, I buy
    // someone else").
    const fellBack = s.eventLog.some(
      (e) => e.code === 'ledger.fallback' && e.data?.to === 'chelsea',
    );
    expect(fellBack).toBe(true);

    // But finite top talent means the replacement is a downgrade, so Chelsea carry
    // a lasting NEGATIVE continental butterfly — weaker in the Champions League
    // than the reality that had them sign Drogba.
    expect(s.clubs['chelsea']!.starButterfly).toBeLessThan(-0.5);
  });

  it('being denied AGAIN AND AGAIN escalates — a compounding strike-back, not a shrug', () => {
    // The user (Arsenal) repeatedly gazumps Chelsea's real spine. Each miss deepens
    // the deficit; once a club has genuinely fallen behind reality, the next fallback
    // escalates (a more ambitious replacement, a readier raid on the culprit).
    let s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'escalation' });
    s.clubs['arsenal']!.finances.transferBudget = 500_000_000;
    // Prise Chelsea's real signings away before their windows fall due.
    for (const pid of ['cur_drogba', 'cur_essien', 'cur_ballack']) {
      const p = s.players[pid];
      if (p && p.club !== 'arsenal') executeTransfer(s, { playerId: pid, toClub: 'arsenal', fee: 30_000_000 });
    }
    for (let i = 0; i < 30 && Number(s.clock.date.slice(0, 4)) < 2008; i++) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }

    // Chelsea have been denied their spine and fallen well behind reality in Europe.
    expect(s.clubs['chelsea']!.starButterfly).toBeLessThan(-2);
    // And they did NOT shrug: a club far enough behind escalated its response — a
    // logged, compounding strike-back that a single miss would never trigger.
    const escalated = s.eventLog.some(
      (e) => e.code === 'rival.escalate' && e.data?.clubId === 'chelsea',
    );
    expect(escalated).toBe(true);
  });
});

describe('butterflies follow the grain of what almost happened (§ butterfly showcase)', () => {
  it('a denied club turns FIRST to a move that nearly happened in reality', () => {
    // Chelsea's real midfield signing (Essien) is intercepted. Reality nearly sent
    // Gerrard to Stamford Bridge — so THAT is who Chelsea turn to, ahead of any
    // generic alternative, prising him from a direct rival the ordinary caution
    // would never allow.
    let s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'nearmiss' });
    s.clubs['arsenal']!.finances.transferBudget = 200_000_000;
    expect(s.players['cur_gerrard3']?.club).toBe('liverpool');
    executeTransfer(s, { playerId: 'cur_essien', toClub: 'arsenal', fee: 30_000_000 });
    for (let i = 0; i < 20 && Number(s.clock.date.slice(0, 4)) < 2007; i++) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }
    // The near-miss became real: Gerrard to Chelsea, logged as such.
    expect(s.players['cur_gerrard3']?.club).toBe('chelsea');
    expect(s.eventLog.some((e) => e.code === 'ledger.nearmiss' && e.data?.clubId === 'chelsea')).toBe(true);
  });

  it("the near-miss follows the grain even across a title race: Barça, denied their forward, reach for Beckham", () => {
    // era-2003: United hijack Eto'o. Barça, denied, turn to the man Laporta really
    // courted — Beckham — pulling him off his real path to Real Madrid.
    let s = createNewGame({ scenarioId: 'chelsea-2003', seed: 'bk' });
    for (let i = 0; i < 8 && Number(s.clock.date.slice(0, 4)) < 2005; i++) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      if (s.clock.window) {
        s.clubs['man_utd']!.finances.transferBudget = 900_000_000;
        const p = s.players['cur_etoo'];
        if (p && p.club !== 'man_utd' && p.club !== 'barcelona') {
          courtPlayer(s, 'cur_etoo'); courtPlayer(s, 'cur_etoo'); courtPlayer(s, 'cur_etoo');
          if (evaluateApproach(s, { playerId: 'cur_etoo', toClub: 'man_utd' }).willing) {
            attemptSigning(s, { playerId: 'cur_etoo', toClub: 'man_utd', fee: 45_000_000 });
          }
        }
      }
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }
    expect(s.players['cur_etoo']?.club).toBe('man_utd'); // the hijack landed
    expect(s.players['cur_beckham_u']?.club).toBe('barcelona'); // the near-miss became real
  });
});

describe('a butterfly stays contained — the world holds its course (§9a)', () => {
  // An aggressive user hijacks one or more of a rival's real targets to Arsenal,
  // then leaves the world to play out. We measure how far the ripple spreads.
  function hijackRun(pids: string[]): GameState {
    let s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'contain' });
    s.clubs['arsenal']!.finances.transferBudget = 400_000_000;
    for (const pid of pids) {
      const p = s.players[pid];
      if (p) executeTransfer(s, { playerId: pid, toClub: 'arsenal', fee: 30_000_000 });
    }
    let guard = 0;
    while (Number(s.clock.date.slice(0, 4)) < 2010 && guard++ < 40) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }
    return s;
  }
  const matchPct = (s: GameState) => {
    const m = ledgerSquadMatch(s);
    return m.atRealClub / m.total;
  };
  const touchedClubs = (s: GameState) =>
    Object.values(s.clubs).filter((c) => Math.abs(c.starButterfly) > 0.01).map((c) => c.id);

  it('a passive world is disturbed nowhere — reality holds absolutely', () => {
    const s = hijackRun([]);
    expect(matchPct(s)).toBe(1);
    expect(touchedClubs(s)).toEqual([]);
  });

  it('a single deviation ripples only through the clubs in its causal chain', () => {
    const s = hijackRun(['cur_drogba']);
    // The overwhelming majority of tracked players still reach their real clubs.
    expect(matchPct(s)).toBeGreaterThanOrEqual(0.9);
    // Only clubs actually in the chain are disturbed — the club denied Drogba, his
    // old club, and wherever the replacement came from. A handful, not the world.
    expect(touchedClubs(s).length).toBeLessThanOrEqual(4);
    // An unrelated club's real business is completely untouched.
    expect(s.players['cur_vidic']?.club).toBe('man_utd');
  });

  it('the ripple scales PROPORTIONALLY with aggression — it never explodes', () => {
    const single = hijackRun(['cur_drogba']);
    const triple = hijackRun(['cur_drogba', 'cur_essien', 'cur_ballack']);
    // Three times the aggression is not exponentially more chaos: the world still
    // mostly holds, and the touched-club set grows roughly linearly, not without
    // bound.
    expect(matchPct(triple)).toBeGreaterThanOrEqual(0.85);
    expect(touchedClubs(triple).length).toBeLessThanOrEqual(touchedClubs(single).length + 4);
    // Knock-on signings stay a handful — no runaway chain of misses.
    const knockOns = triple.eventLog.filter(
      (e) => e.code === 'ledger.fallback' || e.code === 'ledger.nearmiss',
    ).length;
    expect(knockOns).toBeLessThanOrEqual(6);
    // And still no unrelated club dragged in.
    expect(triple.players['cur_vidic']?.club).toBe('man_utd');
  });
});

describe('a near-miss consumes cleanly — no double-processing (§ butterfly showcase)', () => {
  it('the hijacked man ends at exactly one club and his ledger entry is consumed once', () => {
    // United hijack Eto'o; Barça turn to their near-miss, Beckham. However Beckham
    // reaches Barça, the STATE must stay coherent: he is at one club only, his old
    // clubs no longer list him, and his real ledger move is recorded once — never a
    // loop or a phantom double-move at the bookkeeping level.
    let s = createNewGame({ scenarioId: 'chelsea-2003', seed: 'consume' });
    for (let i = 0; i < 10 && Number(s.clock.date.slice(0, 4)) < 2005; i++) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      if (s.clock.window) {
        s.clubs['man_utd']!.finances.transferBudget = 900_000_000;
        const p = s.players['cur_etoo'];
        if (p && p.club !== 'man_utd' && p.club !== 'barcelona') {
          courtPlayer(s, 'cur_etoo'); courtPlayer(s, 'cur_etoo'); courtPlayer(s, 'cur_etoo');
          if (evaluateApproach(s, { playerId: 'cur_etoo', toClub: 'man_utd' }).willing) {
            attemptSigning(s, { playerId: 'cur_etoo', toClub: 'man_utd', fee: 45_000_000 });
          }
        }
      }
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }

    const beckhamClub = s.players['cur_beckham_u']?.club;
    expect(beckhamClub).toBe('barcelona');
    // He is in exactly ONE squad — no club still holds a phantom copy of him.
    const holders = Object.values(s.clubs).filter((c) => c.squad.includes('cur_beckham_u')).map((c) => c.id);
    expect(holders).toEqual(['barcelona']);
    // His real ledger entry is recorded once — the consumption never double-fires.
    expect(s.meta.executedLedger.filter((k) => k === 'beckham-real-2003').length).toBe(1);
  });
});

describe('multi-era passive CL fidelity — every era reproduces its real winners (§ butterfly showcase)', () => {
  it('era-2000 (real-madrid-2000): a passive world reproduces the real European Cup winners', () => {
    const s = runPassive('real-madrid-2000', 'cl2000', 2007);
    expect(clWinner(s, 2000)).toBe('bayern');
    expect(clWinner(s, 2001)).toBe('real_madrid');
    expect(clWinner(s, 2002)).toBe('milan');
    expect(clWinner(s, 2004)).toBe('liverpool'); // the real Istanbul-eve upset holds
    expect(clWinner(s, 2005)).toBe('barcelona');
  });

  it('era-serie-a-1995 (juventus-1995): the calcio golden age reproduces its real winners', () => {
    const s = runPassive('juventus-1995', 'cl1995', 2004);
    expect(clWinner(s, 1995)).toBe('juventus');
    expect(clWinner(s, 1996)).toBe('dortmund');
    expect(clWinner(s, 1997)).toBe('real_madrid');
    expect(clWinner(s, 2000)).toBe('bayern');
    expect(clWinner(s, 2001)).toBe('real_madrid');
    expect(clWinner(s, 2002)).toBe('milan');
  });
});
