/**
 * Per-scenario passive-fidelity guards (reality-default, §9f).
 *
 * The core promise of the engine: leave the world alone (make no user transfers)
 * and each era plays out as it really did. These tests run each playable era pack
 * PASSIVELY — the user sanctions the real moves offered to their club (choice 0)
 * and otherwise does nothing — then assert the real destinations, aggregate
 * fidelity, and the ABSENCE of butterfly fallbacks. Every fidelity bug caught by
 * eye (Chelsea gutted, the Cole↔Gallas swap misfiring, Makelele astray) has a
 * home here so it cannot silently regress.
 *
 * We keep the manager in his seat (reset dismissals): a sacked user freezes the
 * clock, but these tests are about the WORLD's transfers, not job security.
 */
import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { ledgerSquadMatch } from './ledgerExec.js';
import type { GameState } from './types.js';

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

const fallbacks = (s: GameState) => s.eventLog.filter((e) => e.code === 'ledger.fallback').length;
function expectAt(s: GameState, dests: Record<string, string>): void {
  for (const [pid, club] of Object.entries(dests)) {
    expect(`${pid}@${s.players[pid]?.club}`).toBe(`${pid}@${club}`);
  }
}

describe('passive-fidelity — reality holds when the user does nothing (§9f)', () => {
  it('era-2013 (man-utd-2013): the post-Ferguson world plays out as reality', () => {
    const s = runPassive('man-utd-2013', 'fidelity', 2019);
    expectAt(s, {
      cur_bale: 'real_madrid',
      cur_thiago: 'bayern',
      cur_suarez: 'barcelona',
      cur_lamela: 'spurs',
      cur_eriksen: 'spurs',
      // Chains: Özil sold only because Bale arrived; Alexis only because Suárez left.
      cur_ozil: 'arsenal',
      cur_alexis: 'arsenal',
      // The user's real signings, sanctioned.
      cur_fellaini: 'man_utd',
      cur_dimaria: 'man_utd',
    });
    const m = ledgerSquadMatch(s);
    expect(m.atRealClub / m.total).toBeGreaterThanOrEqual(0.95);
    expect(fallbacks(s)).toBe(0);
  });

  it('era-2004 (arsenal-2004): Arsenal sell the spine, United rebuild, Chelsea buy real', () => {
    const s = runPassive('arsenal-2004', 'fidelity', 2012);
    expectAt(s, {
      // Arsenal's real sales, sanctioned by the user.
      cur_vieira2: 'juventus',
      cur_acole: 'chelsea',
      cur_henry: 'barcelona',
      // The Cole↔Gallas swap: Gallas only arrives because Cole left. This is the
      // exact regression that was silently misfiring — Cole failing to complete
      // (buyer out of budget) wrongly cancelled the swap.
      cur_gallas2: 'arsenal',
      // United's real rebuild — the reason they, not Arsenal, dominated 2007-09.
      cur_vidic: 'man_utd',
      cur_evra: 'man_utd',
      cur_tevez: 'man_utd',
      cur_nani: 'man_utd',
      cur_berbatov: 'man_utd', // multi-move: Leverkusen→Spurs→United
      // Chelsea buy their REAL targets (not gutted, not raided).
      cur_drogba: 'chelsea',
      cur_essien: 'chelsea',
      cur_ballack: 'chelsea',
      cur_torres: 'liverpool',
      cur_cristiano2: 'real_madrid',
      // Arsenal's real replacements, sanctioned.
      cur_adebayor: 'arsenal',
      cur_arshavin: 'arsenal',
    });
    const m = ledgerSquadMatch(s);
    expect(m.atRealClub / m.total).toBeGreaterThanOrEqual(0.95);
    expect(fallbacks(s)).toBe(0);
  });

  it('era-2001 (liverpool-2001): the Liverpool business holds; the Abramovich splurge is all-or-nothing', () => {
    const s = runPassive('liverpool-2001', 'fidelity', 2007);
    // Deterministic, non-conditional Liverpool moves (the user sanctions reality).
    expectAt(s, {
      cur_anelka01: 'man_city', // the loan really ended; user let him go
      cur_diouf: 'liverpool',
      cur_cheyrou: 'liverpool',
    });
    // No butterfly fallbacks — a passive world never misses-and-replaces.
    expect(fallbacks(s)).toBe(0);

    // The 2003 Chelsea splurge is gated on the takeover actually happening. It
    // must be ALL-OR-NOTHING and consistent with the marker: no half-splurge.
    const splurge: Array<[string, string]> = [
      ['cur_makelele03', 'real_madrid'],
      ['cur_duff03', 'blackburn'],
      ['cur_crespo03', 'inter'],
      ['cur_mutu03', 'parma'],
      ['cur_bridge03', 'southampton'],
    ];
    const tookOver = s.meta.realizedLedger.includes('abramovich');
    for (const [pid, source] of splurge) {
      expect(s.players[pid]?.club).toBe(tookOver ? 'chelsea' : source);
    }
  });
});
