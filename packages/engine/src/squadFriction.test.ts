/**
 * Emergent squad-friction dilemmas — the consequences of the squad the Director
 * builds coming back as forks in the road. Gated on divergence so a passive,
 * reality-default world (the calibration run) raises none.
 */
import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { clubSquadPlayers } from './players.js';
import { rollSquadFrictionEvents } from './squadFriction.js';
import { Rng } from './rng.js';
import type { GameState } from './types.js';

function overstockedActive(seed = 'friction'): GameState {
  const s = createNewGame({ scenarioId: 'juventus-1995', seed });
  s.userAggression = 25; // the Director has reshaped the world
  // Build a genuine attacking glut (five 87-ability forwards, unhappy).
  for (const p of clubSquadPlayers(s, 'juventus').filter((q) => ['ST', 'AM', 'RW', 'LW'].includes(q.positions[0] ?? '')).slice(0, 5)) {
    p.ability = 87;
    p.agitation = 40;
  }
  return s;
}

describe('emergent squad-friction dilemmas', () => {
  it('raises an overstock dilemma with real forks when a glut festers', () => {
    const s = overstockedActive();
    // Roll enough times to clear the probability gate.
    const rng = new Rng(1);
    for (let i = 0; i < 30 && !s.pendingDecisions.some((d) => d.id.startsWith('friction:')); i++) {
      rollSquadFrictionEvents(s, rng);
    }
    const d = s.pendingDecisions.find((dd) => dd.id.startsWith('friction:'));
    expect(d).toBeDefined();
    expect(d!.title.toLowerCase()).toMatch(/wants out|doesn't fit|floundering/);
    // A genuine fork: multiple choices, at least one with a concrete consequence.
    expect(d!.choices.length).toBeGreaterThanOrEqual(2);
    expect(d!.falloutIfIgnored && d!.falloutIfIgnored.length).toBeGreaterThan(0);
  });

  it('never stacks two friction dilemmas at once', () => {
    const s = overstockedActive('stack');
    const rng = new Rng(2);
    for (let i = 0; i < 50; i++) rollSquadFrictionEvents(s, rng);
    expect(s.pendingDecisions.filter((d) => d.id.startsWith('friction:')).length).toBeLessThanOrEqual(1);
  });

  it('a passive, reality-default world raises none (the calibration gate)', () => {
    const s = createNewGame({ scenarioId: 'juventus-1995', seed: 'passive' });
    for (const p of clubSquadPlayers(s, 'juventus').filter((q) => ['ST', 'AM', 'RW', 'LW'].includes(q.positions[0] ?? '')).slice(0, 5)) {
      p.ability = 87;
      p.agitation = 40;
    }
    expect(s.userAggression).toBe(0);
    const rng = new Rng(3);
    for (let i = 0; i < 50; i++) rollSquadFrictionEvents(s, rng);
    expect(s.pendingDecisions.some((d) => d.id.startsWith('friction:'))).toBe(false);
  });
});
