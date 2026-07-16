import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { ERA_REALITY } from './ledger.js';

/** Advance a scenario, collecting every near-miss decision offered, optionally
 *  signing the first one. Passes (removes) all others so the run continues. */
function runCollectingNearMisses(scenarioId: string, seed: string, signFirst: boolean) {
  let state = createNewGame({ seed, scenarioId });
  const offered: string[] = [];
  let signedId: string | null = null;
  for (let i = 0; i < 200 && Number(state.clock.date.slice(0, 4)) < 2015; i++) {
    const decs = state.pendingDecisions.filter((d) => d.id.startsWith('near-miss-in:'));
    for (const dec of decs) {
      offered.push(dec.title);
      if (signFirst && !signedId) {
        state = applyDecision(state, dec.id, 'sign').state;
        const p = state.clubs[state.playerClub]!.squad
          .map((id) => state.players[id])
          .find((pl) => pl && pl.id.startsWith('nm_'));
        if (p) signedId = p.id;
      }
    }
    state.pendingDecisions = state.pendingDecisions.filter((d) => !d.id.startsWith('near-miss'));
    state = advanceWindow(state).state;
  }
  return { state, offered, signedId };
}

describe('near-miss database', () => {
  it('has a large, seed-based "almost happened" set across the era packs (50+)', () => {
    const total = Object.values(ERA_REALITY).reduce((n, pack) => n + (pack.nearMisses?.length ?? 0), 0);
    expect(total).toBeGreaterThanOrEqual(50);
    // Every seed-based entry carries a collapse reason (the "why it fell through").
    for (const pack of Object.values(ERA_REALITY)) {
      for (const e of pack.nearMisses ?? []) {
        if (e.seed) expect(e.reason).toBeDefined();
      }
    }
  });

  it('offers a United fan their famous ones that got away, in the real window', () => {
    const { offered } = runCollectingNearMisses('man-utd-1999', 'nm-offers', false);
    expect(offered.length).toBeGreaterThan(4);
    const blob = offered.join(' | ');
    // The user's own examples.
    for (const name of ['Ronaldinho', 'Sneijder', 'Robben', 'Fàbregas']) {
      expect(blob).toContain(name);
    }
  });

  it('completing a near-miss spawns the subject at the user club (reality rewritten)', () => {
    const { signedId } = runCollectingNearMisses('man-utd-1999', 'nm-sign', true);
    expect(signedId).not.toBeNull();
    expect(signedId!.startsWith('nm_')).toBe(true);
  });

  it('passing every near-miss leaves the world untouched — no virtual player spawns', () => {
    // Never sign: no nm_ subject should ever enter the world (reality holds).
    let state = createNewGame({ seed: 'nm-pass', scenarioId: 'man-utd-1999' });
    for (let i = 0; i < 60 && Number(state.clock.date.slice(0, 4)) < 2012; i++) {
      state.pendingDecisions = state.pendingDecisions.filter((d) => !d.id.startsWith('near-miss'));
      state = advanceWindow(state).state;
    }
    const spawned = Object.values(state.players).filter((p) => p.id.startsWith('nm_'));
    expect(spawned).toHaveLength(0);
  });
});
