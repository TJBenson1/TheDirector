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
    let s = createNewGame({ scenarioId: 'manchester-united-2003', seed: 'bk' });
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

describe('a filled need obviates a later real signing (§ butterfly showcase)', () => {
  it("a club that lands a forward early doesn't come back for another — the knock-on", () => {
    // Passive: reality — Shevchenko joins Chelsea in 2006.
    const passive = runPassive('arsenal-2004', 'needfill', 2007);
    expect(passive.players['cur_shevchenko2']?.club).toBe('chelsea');

    // A butterfly puts a marquee forward (Henry) into Chelsea in 2004. Their real
    // 2006 move for another forward is now redundant — it never happens, and he
    // stays where reality's alternate branch leaves him.
    let s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'needfill' });
    s.clubs['chelsea']!.finances.transferBudget = 200_000_000;
    executeTransfer(s, { playerId: 'cur_henry', toClub: 'chelsea', fee: 50_000_000 });
    let guard = 0;
    while (Number(s.clock.date.slice(0, 4)) < 2007 && guard++ < 40) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 40; s.board.warnings = 0; }
      s = advanceWindow(s).state;
    }
    expect(s.players['cur_shevchenko2']?.club).not.toBe('chelsea');
    expect(s.eventLog.some((e) => e.code === 'ledger.obviated' && e.data?.to === 'chelsea')).toBe(true);
  });
});
