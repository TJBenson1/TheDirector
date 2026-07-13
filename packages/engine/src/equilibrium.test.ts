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
});
