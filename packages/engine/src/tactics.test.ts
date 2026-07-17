import { describe, it, expect } from 'vitest';
import { formationEraModifier, eraIdealFormation } from './tactics.js';
import { coachForScenario } from './coaches.js';
import { createNewGame } from './state.js';
import { runReviewPhase } from './review.js';
import { applyDecision } from './events.js';

describe('tactical-era formation model (M13a)', () => {
  it('punishes a flat two-man midfield in the modern game, not the 1990s', () => {
    // A 4-4-2 was the shape of its time in the 90s (zero delta) but gets its
    // midfield overrun by the 2010s.
    expect(formationEraModifier('4-4-2', 1997)).toBe(0);
    expect(formationEraModifier('4-4-2', 2015)).toBeLessThan(-2);
  });

  it('rewards the era-appropriate three-man midfield / lone-striker shapes', () => {
    // The 4-2-3-1 is the defining modern shape.
    expect(formationEraModifier('4-2-3-1', 2018)).toBeGreaterThan(0);
    // A genuine three keeps pace with the era.
    expect(formationEraModifier('4-3-3', 2015)).toBe(0);
  });

  it('back-three shapes are in vogue in the mid-90s and again from the later 2010s', () => {
    expect(formationEraModifier('3-5-2', 1996)).toBeGreaterThan(0);
    expect(formationEraModifier('3-5-2', 2018)).toBeGreaterThan(0);
    expect(formationEraModifier('3-5-2', 2008)).toBeLessThan(0);
  });

  it('eraIdealFormation tracks the tactical timeline', () => {
    expect(eraIdealFormation(1997)).toBe('4-4-2');
    expect(eraIdealFormation(2010)).toBe('4-3-3');
    expect(eraIdealFormation(2018)).toBe('4-2-3-1');
  });
});

describe('coach personas (M13a)', () => {
  it('seeds the real manager for a known scenario', () => {
    const c = coachForScenario('man-utd-1999', 1999);
    expect(c.identity).toBe('Alex Ferguson');
    expect(c.archetype).toBe('man-manager');
    expect(c.preferredFormation).toBe('4-4-2');
    expect(c.activeFormation).toBe('4-4-2');
  });

  it('gives different personas different playing styles', () => {
    const pep = coachForScenario('barcelona-2003', 2003); // possession (Rijkaard)
    const klopp = coachForScenario('dortmund-2012', 2012); // gegenpress
    expect(pep.style.technical).toBeGreaterThan(klopp.style.technical);
    expect(klopp.style.tempo).toBeGreaterThan(pep.style.tempo);
    expect(klopp.favourites).toContain('Robert Lewandowski');
  });

  it('falls back to a balanced coach on the era shape for an unseeded scenario', () => {
    const c = coachForScenario('no-such-scenario', 2012);
    expect(c.identity).toBe('Head Coach');
    expect(c.archetype).toBe('balanced');
    expect(c.preferredFormation).toBe(eraIdealFormation(2012));
  });

  it('a new game seeds its scenario coach into managerRelations', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'coach-a' });
    expect(s.managerRelations.identity).toBe('Alex Ferguson');
    expect(s.managerRelations.activeFormation).toBe('4-4-2');
  });
});

describe('Director formation suggestion (M13a)', () => {
  it('surfaces a switch when the coach is tactically left behind, and accepting changes the shape', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'formation-a' });
    // Cast the club forward into a modern era still stuck in a flat 4-4-2.
    s.clock.date = '2015-06';
    s.managerRelations.activeFormation = '4-4-2';
    s.managerRelations.preferredFormation = '4-4-2';
    runReviewPhase(s);

    const dec = s.pendingDecisions.find((d) => d.id.startsWith('formation:'));
    expect(dec).toBeDefined();
    // Force the coach to agree (deterministic) and apply.
    dec!.choices.find((c) => c.id === 'suggest-switch')!.successProbability = 1;
    const next = applyDecision(s, dec!.id, 'suggest-switch').state;
    expect(next.managerRelations.activeFormation).toBe(eraIdealFormation(2015));
  });

  it('does not surface a switch when the coach already plays the era shape', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'formation-b' });
    s.clock.date = '2015-06';
    s.managerRelations.activeFormation = eraIdealFormation(2015);
    runReviewPhase(s);
    expect(s.pendingDecisions.some((d) => d.id.startsWith('formation:'))).toBe(false);
  });

  it('a rebuffed suggestion costs the Director relationship capital', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'formation-c' });
    s.clock.date = '2015-06';
    s.managerRelations.activeFormation = '4-4-2';
    const rel0 = s.managerRelations.relationshipWithUser;
    runReviewPhase(s);
    const dec = s.pendingDecisions.find((d) => d.id.startsWith('formation:'))!;
    dec.choices.find((c) => c.id === 'suggest-switch')!.successProbability = 0;
    const next = applyDecision(s, dec.id, 'suggest-switch').state;
    expect(next.managerRelations.activeFormation).toBe('4-4-2'); // unchanged
    expect(next.managerRelations.relationshipWithUser).toBeLessThan(rel0);
  });
});
