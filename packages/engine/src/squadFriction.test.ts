/**
 * Emergent squad-friction dilemmas — the consequences of the squad the Director
 * builds coming back as forks in the road. Gated on divergence so a passive,
 * reality-default world (the calibration run) raises none.
 */
import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { clubSquadPlayers } from './players.js';
import { coachFit } from './coaches.js';
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

  it('raises a poach dilemma when a giant circles an unsettled star', () => {
    const s = createNewGame({ scenarioId: 'juventus-1995', seed: 'poach' });
    s.userAggression = 25;
    // A prized man of yours, unsettled, whom the coach is happy with (so he can't
    // fall into the misfit branch) — a giant will come calling.
    const star = clubSquadPlayers(s, 'juventus').find(
      (p) => coachFit(s.managerRelations, p).verdict !== 'veto' && !p.adaptation && !p.injury,
    )!;
    star.ability = 84;
    star.agitation = 36;
    const rng = new Rng(7);
    for (let i = 0; i < 60 && !s.pendingDecisions.some((d) => d.id.startsWith('friction:poach:')); i++) {
      rollSquadFrictionEvents(s, rng);
    }
    const d = s.pendingDecisions.find((dd) => dd.id.startsWith('friction:poach:'));
    expect(d).toBeDefined();
    expect(d!.choices.some((ch) => ch.id === 'cash-in')).toBe(true);
    expect(d!.choices.some((ch) => ch.id === 'reject')).toBe(true);
    // Ignore does NOT force a sale (rival.ts owns forced departures — no double-count).
    expect((d!.falloutIfIgnored ?? []).some((f) => f.kind === 'transferOut')).toBe(false);
  });

  it('raises a legend farewell when a loyal club great runs his deal down', () => {
    const s = createNewGame({ scenarioId: 'juventus-1995', seed: 'legend' });
    s.userAggression = 25;
    const great = clubSquadPlayers(s, 'juventus').find(
      (p) => coachFit(s.managerRelations, p).verdict !== 'veto' && !p.adaptation && !p.injury,
    )!;
    great.birthYear = 1961; // 34 in 1995
    great.personality.loyalty = 9;
    great.ability = 82;
    great.agitation = 0;
    great.contractUntil = 1996;
    great.letLapse = false;
    const rng = new Rng(11);
    for (let i = 0; i < 60 && !s.pendingDecisions.some((d) => d.id.startsWith('friction:legend:')); i++) {
      rollSquadFrictionEvents(s, rng);
    }
    const d = s.pendingDecisions.find((dd) => dd.id.startsWith('friction:legend:'));
    expect(d).toBeDefined();
    expect(d!.choices.some((ch) => ch.id === 'farewell')).toBe(true);
    expect(d!.choices.some((ch) => ch.id === 'dignified-exit')).toBe(true);
  });

  it('raises a wonderkid pathway demand when a kid is starved of minutes', () => {
    const s = createNewGame({ scenarioId: 'juventus-1995', seed: 'kid' });
    s.userAggression = 25;
    const kid = clubSquadPlayers(s, 'juventus').find(
      (p) => coachFit(s.managerRelations, p).verdict !== 'veto' && !p.adaptation && !p.injury,
    )!;
    kid.birthYear = 1976; // 19 in 1995
    kid.potentialCeiling = 88;
    kid.ability = 78;
    kid.wonderkid = true;
    kid.benchedDevSeasons = 1;
    kid.agitation = 0;
    const rng = new Rng(13);
    for (let i = 0; i < 60 && !s.pendingDecisions.some((d) => d.id.startsWith('friction:wonderkid:')); i++) {
      rollSquadFrictionEvents(s, rng);
    }
    const d = s.pendingDecisions.find((dd) => dd.id.startsWith('friction:wonderkid:'));
    expect(d).toBeDefined();
    expect(d!.choices.some((ch) => ch.id === 'promise-pathway')).toBe(true);
    expect(d!.choices.some((ch) => ch.id === 'loan-out')).toBe(true);
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
