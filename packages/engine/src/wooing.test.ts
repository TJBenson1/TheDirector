import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { evaluateApproach } from './agency.js';
import { attemptSigning } from './transfers.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { courtPlayer, decayPursuit, poleSuitorFor } from './wooing.js';
import { ERA_REALITY, eraForScenario } from './ledger.js';
import type { GameState } from './types.js';

/**
 * The wooing mechanic (§6, §16 — "speak to his people"). Arsenal-2004: Eto'o is
 * at Mallorca with Barcelona lined up as his real 2004 move, so a cold Arsenal
 * bid should lose out to the club in pole — until Arsenal court him.
 */
describe('wooing / pursuit (§16)', () => {
  it('a spoken-for target has his real suitor in pole position', () => {
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'woo' });
    expect(poleSuitorFor(s, 'cur_etoo')).toBe('barcelona');
  });

  it("the user's own real signing is not counted as a rival suitor", () => {
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'woo' });
    // Adebayor's real move is TO Arsenal (the user's club) — no one is in pole
    // against the user for his own signing.
    const pack = ERA_REALITY[eraForScenario(s.meta.scenarioId)]!;
    const toUser = pack.realTransferLedger.find((e) => e.to === 'arsenal');
    expect(toUser).toBeDefined();
    expect(poleSuitorFor(s, toUser!.playerId)).toBeNull();
  });

  it('a cold bid for a spoken-for target fails; sustained courting wins him', () => {
    const s = cloneState(createNewGame({ scenarioId: 'arsenal-2004', seed: 'woo' }));
    const cold = evaluateApproach(s, { playerId: 'cur_etoo', toClub: 'arsenal' });
    expect(cold.willing).toBe(false); // reality holds against a cold late bid

    // "Speak to his people" over a couple of windows — willingness climbs
    // monotonically and eventually clears the threshold.
    let prev = cold.willingness;
    let flipped = false;
    for (let i = 0; i < 3; i++) {
      courtPlayer(s, 'cur_etoo');
      const v = evaluateApproach(s, { playerId: 'cur_etoo', toClub: 'arsenal' });
      expect(v.willingness).toBeGreaterThan(prev);
      prev = v.willingness;
      if (v.willing) flipped = true;
    }
    expect(flipped).toBe(true);
  });

  it('courtship fades if you stop working the target (decay reverses the gain)', () => {
    const s = cloneState(createNewGame({ scenarioId: 'arsenal-2004', seed: 'woo' }));
    courtPlayer(s, 'cur_etoo');
    courtPlayer(s, 'cur_etoo');
    const courted = evaluateApproach(s, { playerId: 'cur_etoo', toClub: 'arsenal' }).willingness;
    const pursuitHigh = s.pursuit['cur_etoo']!;

    for (let i = 0; i < 5; i++) decayPursuit(s);
    const faded = evaluateApproach(s, { playerId: 'cur_etoo', toClub: 'arsenal' }).willingness;

    expect(s.pursuit['cur_etoo'] ?? 0).toBeLessThan(pursuitHigh);
    expect(faded).toBeLessThan(courted); // the pull you built up drains away
  });

  it('courting your own player is refused', () => {
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'woo' });
    const own = Object.values(s.players).find((p) => p.club === s.playerClub)!;
    const r = courtPlayer(s, own.id);
    expect(r.ok).toBe(false);
    expect(s.pursuit[own.id]).toBeUndefined();
  });
});

/**
 * The fee lever / gazump (§16, M12C — "he isn't allowed to speak to Juve").
 * VDS starts at Ajax in the 1999 world with a real move to Juventus lined up
 * (£5m). A cold United bid loses out to the pole — but out-bidding Ajax beyond
 * Juve's fee buys the club's agreement first, prising him away before the deal.
 */
describe('fee lever / gazump (§16, M12C)', () => {
  const VDS = 'cur_vandersar';

  it('out-bidding the pole suitor at the selling club prises a spoken-for target', () => {
    const s = createNewGame({ seed: 'gazump' });
    expect(poleSuitorFor(s, VDS)).toBe('juventus'); // his real move is still ahead
    const wage = s.players[VDS]!.wage;

    // Matching Juve's £5m does nothing — you must beat the selling club's agreed fee.
    expect(evaluateApproach(s, { playerId: VDS, toClub: 'man_utd', feeOffer: 5_000_000 }).willing).toBe(false);
    // A token £1m over still isn't enough (a real gazump costs real money).
    expect(evaluateApproach(s, { playerId: VDS, toClub: 'man_utd', feeOffer: 6_000_000 }).willing).toBe(false);
    // Beating it by ~£2m collapses the pole's advantage — he's now attainable.
    expect(
      evaluateApproach(s, { playerId: VDS, toClub: 'man_utd', feeOffer: 7_000_000, wageOffer: wage * 1.3 }).willing,
    ).toBe(true);
  });

  it('a cold approach leaves reality untouched (the passive world holds)', () => {
    const s = createNewGame({ seed: 'gazump' });
    // No fee tabled = reality's pole deal is fully in place, so he refuses.
    const cold = evaluateApproach(s, { playerId: VDS, toClub: 'man_utd' });
    expect(cold.willing).toBe(false);
    expect(cold.reason).toContain('Juventus'); // guides the user to the lever
  });

  it('the gazump completes end-to-end: he joins the user, the pole club falls back', () => {
    let s = createNewGame({ seed: 'gazump-e2e' });
    s.clubs.man_utd!.finances.transferBudget = 20_000_000;
    const wage = s.players[VDS]!.wage;
    const res = attemptSigning(s, { playerId: VDS, toClub: 'man_utd', fee: 7_000_000, wage: wage * 1.3 });
    expect(res.ok).toBe(true);
    expect(s.players[VDS]!.club).toBe('man_utd');

    // Advance past the winter window, where his real Ajax→Juventus move was due.
    const drain = (g: GameState): GameState => {
      let x = g;
      for (const d of [...x.pendingDecisions]) x = applyDecision(x, d.id, d.choices[0]!.id).state;
      return x;
    };
    for (let i = 0; i < 24 && s.clock.date < '2000-03'; i++) s = advanceWindow(drain(s)).state;

    // He stays at United — the real move is invalidated, and Juventus is deprived
    // of him and signs an alternative (a traceable butterfly).
    expect(s.players[VDS]!.club).toBe('man_utd');
    const div = s.timeline.divergenceLog.find((d) => /cur_vandersar.*juventus.*invalidated/i.test(d.detail));
    expect(div).toBeDefined();
  });
});
