import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { executeTransfer } from './transfers.js';
import { resolvePlayer } from './recommend.js';
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

/**
 * Play PER-STEP to a target year, resolving decisions each sub-step via `choose`
 * (default: reality). The window-phase model (§3) surfaces the user's own real
 * ins/outs in the REVIEW phase, so a divergence (keep a player) must be acted on
 * DURING the window — this helper hands the player a turn at every sub-step.
 */
function playPerStepTo(
  state: GameState,
  endYear: number,
  choose: (d: GameState['pendingDecisions'][number]) => string = (d) => d.choices[0]!.id,
): GameState {
  let s = state;
  let guard = 0;
  while (Number(s.clock.date.slice(0, 4)) < endYear && guard++ < 600) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, choose(d)).state;
    if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; s.board.warnings = 0; }
    s = advanceWindow(s, { pausePerStep: true }).state;
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
      if (s.meta.executedLedger.some((k) => k.startsWith('cur_anelka@'))) break;
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

  it('a ledger entry TO the user club is offered as a decision, never a rival butterfly', () => {
    // Fellaini → Man Utd (2013) targets the user's own club: it surfaces as a
    // reality-default "real signing" offer the user can decline, and never a
    // fallback/poach bid against the user's squad. Here the user PASSES.
    let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'ledger-userclub' });
    let sawOffer = false;
    s = playPerStepTo(s, 2015, (d) => {
      if (d.id.startsWith('real-in:') && d.title.includes('Fellaini')) {
        sawOffer = true;
        return 'pass'; // decline — "no Fellaini"
      }
      return d.choices[0]!.id;
    });
    expect(sawOffer).toBe(true);
    expect(s.players.cur_fellaini?.club).toBe('everton'); // declined → he stays
    expect(s.eventLog.some((e) => e.code === 'poach.bid' && e.data?.from === 'man_utd')).toBe(false);
  });
});

describe('more start points (§4 data)', () => {
  it('the galáctico Madrid start places Figo/Zidane/Makélélé and can keep Makélélé', () => {
    let s = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'gal' });
    expect(s.playerClub).toBe('real_madrid');
    // The opening window is LIVE: Figo still starts at Barcelona, and his move to
    // Madrid is the first decision the user faces (sign it, or veto it).
    expect(resolvePlayer(s, 'Figo')?.club).toBe('barcelona');
    expect(s.players.cur_zidane?.club).toBe('juventus');
    expect(s.players.cur_makelele?.club).toBe('real_madrid');
    // Keep Makélélé when his 2003 sale is offered; he stays, unsettled.
    s = playPerStepTo(s, 2004, (d) =>
      d.id.startsWith('real-out:') && d.title.includes('Makélélé') ? 'keep' : d.choices[0]!.id,
    );
    expect(s.players.cur_makelele?.club).toBe('real_madrid'); // kept, not sold to Chelsea
  });

  it("a star's real departure INTERRUPTS — a marquee player is never sold to inattention", () => {
    let s = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'star-out' });
    let starExitInterrupted = false;
    s = playPerStepTo(s, 2005, (d) => {
      // Makélélé (85) leaving is a star exit — it must force a conscious call.
      if (d.id.startsWith('real-out:') && d.title.includes('Makélélé')) {
        expect(d.interrupt).toBe(true);
        starExitInterrupted = true;
      }
      return d.choices[0]!.id;
    });
    expect(starExitInterrupted).toBe(true);
  });

  it('the Invincibles Arsenal start builds a real 2004-05 league and squad', () => {
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'inv' });
    expect(s.playerClub).toBe('arsenal');
    expect(resolvePlayer(s, 'Henry')?.club).toBe('arsenal');
    // Drogba starts at his real source club and joins Chelsea via the ledger.
    expect(resolvePlayer(s, 'Drogba')?.club).toBe('marseille');
    expect(s.leagues['eng-2004']?.clubIds).toContain('arsenal');
  });

  it('intercepting a Chelsea target makes Chelsea sign a real alternative, not get gutted', () => {
    // Ronaldo (a distant 2009 subject) must NEVER be hijacked to replace Drogba;
    // and across seeds Chelsea signs a genuine comparable striker.
    let sawAlternative = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      let s = cloneState(createNewGame({ scenarioId: 'arsenal-2004', seed: `intercept:${attempt}` }));
      s.clubs.arsenal!.finances.transferBudget = 40_000_000;
      const drogba = resolvePlayer(s, 'Drogba')!;
      expect(executeTransfer(s, { playerId: drogba.id, toClub: 'arsenal', fee: 24_000_000 }).ok).toBe(true);
      for (let i = 0; i < 3; i++) {
        for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
        s = advanceWindow(s).state;
      }
      expect(resolvePlayer(s, 'Cristiano Ronaldo')?.club).toBe('man_utd'); // never hijacked
      const alt = s.eventLog.find((e) => e.code === 'ledger.alternative' && e.data?.to === 'chelsea');
      if (alt) {
        sawAlternative = true;
        const altPlayer = s.players[String(alt.data!.playerId)]!;
        expect(altPlayer.curated).toBe(true); // a real, named alternative (not procedural)
        expect(altPlayer.name).not.toBe('Cristiano Ronaldo'); // never the distant marquee
      }
    }
    expect(sawAlternative).toBe(true);
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

  it('keeping Ronaldo cancels the sales it funded — Madrid keep Robben & Sneijder', () => {
    // A 1999 playthrough that signs Ronaldo (2003) and REFUSES his 2009 sale.
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'keep-cr7' });
    s = playPerStepTo(s, 2010, (d) =>
      d.id.startsWith('real-out:') && d.title.includes('Ronaldo') ? 'keep' : d.choices[0]!.id,
    );
    expect(s.players.cur_cristiano?.club).toBe('man_utd'); // kept
    expect(s.players.cur_cristiano!.agitation).toBeGreaterThan(0); // he wanted the move
    // Madrid never funded a Ronaldo window, so they never offloaded these two.
    expect(s.players.cur_robben?.club).toBe('real_madrid');
    expect(s.players.cur_sneijder?.club).toBe('real_madrid');
    expect(s.eventLog.some((e) => e.code === 'ledger.cancelled' && e.data?.playerId === 'cur_sneijder')).toBe(true);
  });

  it('a deprived club can hijack a future ledger subject, nullifying his onward move but not his growth', () => {
    // Sign Sol Campbell (Bosman) before his real move to Arsenal. Arsenal, denied
    // him, may hijack Leeds' Ferdinand — who then never joins United, but must
    // still develop toward his ceiling at his new club.
    for (let attempt = 0; attempt < 12; attempt++) {
      let s = cloneState(createNewGame({ scenarioId: 'man-utd-1999', seed: `hijack:${attempt}` }));
      s.clubs.man_utd!.finances.transferBudget = 60_000_000;
      const campbell = resolvePlayer(s, 'Sol Campbell')!;
      executeTransfer(s, { playerId: campbell.id, toClub: 'man_utd', fee: 0 });
      for (let i = 0; i < 20; i++) {
        for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
        s = advanceWindow(s).state;
        if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; }
      }
      const fer = s.players.cur_ferdinand!;
      if (fer.club === 'arsenal') {
        // His onward move to United was consumed, and his pathway wasn't blocked:
        // he held/advanced on his starting ability (82) and kept a high ceiling
        // rather than eroding on the bench behind a fading veteran.
        expect(s.timeline.divergenceLog.some((d) => /Ferdinand.*never happens/.test(d.detail))).toBe(true);
        expect(fer.ability).toBeGreaterThanOrEqual(82);
        expect(fer.potentialCeiling).toBeGreaterThanOrEqual(86);
        return;
      }
    }
    throw new Error('no Ferdinand hijack across 12 seeds');
  });

  it('Ronaldo starts at PSV in 1995 and reaches Barça via his real 1996 move', () => {
    let s = cloneState(createNewGame({ scenarioId: 'juventus-1995', seed: 'ronaldo95' }));
    // Reality: at PSV in 1995-96, NOT Barcelona (he only joined Barça in 1996).
    expect(s.players.cur_ronaldo_r?.club).toBe('psv');
    // Let the ledger run his real PSV → Barça (1996) move through.
    s = play(s, 4);
    expect(s.players.cur_ronaldo_r?.club).toBe('barcelona');
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
