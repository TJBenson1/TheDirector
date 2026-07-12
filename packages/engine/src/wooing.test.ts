import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { evaluateApproach } from './agency.js';
import { courtPlayer, decayPursuit, poleSuitorFor } from './wooing.js';
import { ERA_REALITY, eraForScenario } from './ledger.js';

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
