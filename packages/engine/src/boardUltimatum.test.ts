/**
 * Board/ownership ultimatums (seam 2) — a board whose patience has run down puts a
 * demand on the desk. Gated on divergence so the calibration run never sees one.
 */
import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { rollBoardUltimatum } from './boardUltimatum.js';
import { Rng } from './rng.js';
import type { GameState } from './types.js';

function faltering(seed = 'ult'): GameState {
  const s = createNewGame({ scenarioId: 'juventus-1995', seed });
  s.userAggression = 25; // the Director has reshaped the world
  s.board.patience = 18;
  s.board.warnings = 1;
  s.board.consecutiveMisses = 1;
  return s;
}

describe('board ultimatums', () => {
  it('raises an ultimatum with real forks when patience has run down', () => {
    const s = faltering();
    const rng = new Rng(1);
    for (let i = 0; i < 40 && !s.pendingDecisions.some((d) => d.id.startsWith('ultimatum:')); i++) {
      rollBoardUltimatum(s, rng);
    }
    const d = s.pendingDecisions.find((dd) => dd.id.startsWith('ultimatum:'));
    expect(d).toBeDefined();
    expect(d!.choices.some((c) => c.id === 'stake-job')).toBe(true);
    expect(d!.choices.some((c) => c.id === 'comply')).toBe(true);
    expect(d!.choices.some((c) => c.id === 'defy')).toBe(true);
    expect((d!.falloutIfIgnored ?? []).length).toBeGreaterThan(0);
  });

  it('never stacks two ultimatums at once', () => {
    const s = faltering('stack');
    const rng = new Rng(2);
    for (let i = 0; i < 60; i++) rollBoardUltimatum(s, rng);
    expect(s.pendingDecisions.filter((d) => d.id.startsWith('ultimatum:')).length).toBeLessThanOrEqual(1);
  });

  it('a comfortable board never delivers one', () => {
    const s = createNewGame({ scenarioId: 'juventus-1995', seed: 'comfy' });
    s.userAggression = 25;
    s.board.patience = 70; // faith intact
    s.board.warnings = 2;
    s.board.consecutiveMisses = 2;
    const rng = new Rng(3);
    for (let i = 0; i < 60; i++) rollBoardUltimatum(s, rng);
    expect(s.pendingDecisions.some((d) => d.id.startsWith('ultimatum:'))).toBe(false);
  });

  it('a passive, reality-default world raises none (the calibration gate)', () => {
    const s = createNewGame({ scenarioId: 'juventus-1995', seed: 'passive' });
    s.board.patience = 10;
    s.board.warnings = 2;
    s.board.consecutiveMisses = 2;
    expect(s.userAggression).toBe(0);
    const rng = new Rng(4);
    for (let i = 0; i < 60; i++) rollBoardUltimatum(s, rng);
    expect(s.pendingDecisions.some((d) => d.id.startsWith('ultimatum:'))).toBe(false);
  });
});
