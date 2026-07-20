import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { contractRetentionOdds } from './realityRegister.js';
import type { GameState, PlayerState } from './types.js';

/** A settled star at his club — the neutral baseline for the factor model. */
function settledStar(s: GameState): PlayerState {
  const p = Object.values(s.players).find((pl) => pl.club === s.playerClub && pl.curated && pl.ability >= 82);
  if (!p) throw new Error('no star');
  // Neutralise the live state so we measure the reality anchor + the factor under test.
  p.morale = 55;
  p.agitation = 0;
  p.wage = 2_000_000; // near the market for a star at the 2001 baseline
  s.board.patience = 50;
  return p;
}

describe('contract-saga factor model', () => {
  it('anchors on reality: a settled star reality kept is likely to stay; one reality sold is not', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'reg1' });
    const p = settledStar(s);
    const kept = contractRetentionOdds(s, p, { realStayed: true });
    const sold = contractRetentionOdds(s, p, { realStayed: false });
    expect(kept).toBeGreaterThan(0.5);
    expect(sold).toBeLessThan(0.5);
    expect(kept).toBeGreaterThan(sold);
  });

  it('factors can flip reality BOTH ways', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'reg2' });
    const p = settledStar(s);

    // A star reality KEPT, but mistreated — underpaid, unhappy, agitating, a giant
    // circling — should now be more likely to LEAVE than to stay.
    p.morale = 20;
    p.agitation = 80;
    p.wage = 400_000; // well below market
    const mistreated = contractRetentionOdds(s, p, { realStayed: true, suitor: 'real_madrid' });
    expect(mistreated).toBeLessThan(0.5);

    // A star reality SOLD, but looked after — well paid, happy, backed — should now be
    // more likely to STAY than to go.
    p.morale = 90;
    p.agitation = 0;
    p.wage = 6_000_000; // well above market
    s.board.patience = 90;
    const cherished = contractRetentionOdds(s, p, { realStayed: false });
    expect(cherished).toBeGreaterThan(0.5);
  });

  it('never returns a certainty — the saga stays genuinely tense', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'reg3' });
    const p = settledStar(s);
    p.morale = 100;
    p.agitation = 0;
    p.wage = 20_000_000;
    s.board.patience = 100;
    const odds = contractRetentionOdds(s, p, { realStayed: true });
    expect(odds).toBeLessThan(1);
    expect(odds).toBeGreaterThan(0);
  });
});
