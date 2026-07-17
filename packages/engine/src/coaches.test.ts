import { describe, it, expect } from 'vitest';
import { coachForScenario, coachFit, resolveCoachFriction } from './coaches.js';
import { createNewGame } from './state.js';
import { runReviewPhase } from './review.js';
import { executeTransfer } from './transfers.js';
import { applyDecision } from './events.js';
import type { GameState, PlayerState } from './types.js';

/** An external (non-user) player to experiment on. */
function anExternalPlayer(s: GameState): PlayerState {
  return Object.values(s.players).find((p) => p.club && p.club !== s.playerClub && !p.retired)!;
}

describe('coach recruitment fit (M13b)', () => {
  it('a possession coach vetoes a volatile big-ego maverick a man-manager would take', () => {
    const pep = coachForScenario('barcelona-2003', 2003); // possession, low-ego/low-volatility
    const fergie = coachForScenario('man-utd-1999', 1999); // man-manager, tolerant
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'fit-a' });
    const p = anExternalPlayer(s);
    p.personality = { professionalism: 4, ego: 10, ambition: 7, loyalty: 3, volatility: 10, adaptability: 5 };

    const pepFit = coachFit(pep, p);
    const fergieFit = coachFit(fergie, p);
    expect(pepFit.verdict).toBe('veto');
    expect(fergieFit.score).toBeGreaterThan(pepFit.score);
    expect(fergieFit.verdict).not.toBe('veto');
  });

  it('a favourite from a former club is wanted outright', () => {
    const klopp = coachForScenario('dortmund-2012', 2012); // favourites: Robert Lewandowski
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'fit-b' });
    const p = anExternalPlayer(s);
    p.name = 'Robert Lewandowski';
    expect(coachFit(klopp, p).verdict).toBe('wants');
  });
});

describe('coach reaction to a Director signing (M13b)', () => {
  it('overruling a veto costs relationship and saddles the player with a misfit adaptation', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'sign-a' });
    s.managerRelations = coachForScenario('barcelona-2003', 1999); // possession — will veto
    const p = anExternalPlayer(s);
    p.personality = { professionalism: 4, ego: 10, ambition: 7, loyalty: 3, volatility: 10, adaptability: 5 };
    s.clubs[s.playerClub]!.finances.transferBudget = 200_000_000;
    const rel0 = s.managerRelations.relationshipWithUser;

    const res = executeTransfer(s, { playerId: p.id, toClub: s.playerClub, fee: 1_000_000 });
    expect(res.ok).toBe(true);
    expect(s.managerRelations.relationshipWithUser).toBeLessThan(rel0);
    expect(p.adaptation && !p.adaptation.settled).toBe(true);
    expect(s.eventLog.some((e) => e.code === 'coach.signing.vetoed')).toBe(true);
  });

  it('signing a favourite warms the relationship and settles the player', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'sign-b' });
    const p = anExternalPlayer(s);
    s.managerRelations.favourites = [p.name];
    s.clubs[s.playerClub]!.finances.transferBudget = 200_000_000;
    const rel0 = s.managerRelations.relationshipWithUser;

    executeTransfer(s, { playerId: p.id, toClub: s.playerClub, fee: 1_000_000 });
    expect(s.managerRelations.relationshipWithUser).toBeGreaterThan(rel0);
    expect(s.eventLog.some((e) => e.code === 'coach.signing.approved')).toBe(true);
  });

  it('a reality move draws no coach judgement', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'sign-c' });
    s.managerRelations = coachForScenario('barcelona-2003', 1999);
    const p = anExternalPlayer(s);
    p.personality = { professionalism: 4, ego: 10, ambition: 7, loyalty: 3, volatility: 10, adaptability: 5 };
    const rel0 = s.managerRelations.relationshipWithUser;
    executeTransfer(s, { playerId: p.id, toClub: s.playerClub, fee: 0 }, { reality: true });
    expect(s.managerRelations.relationshipWithUser).toBe(rel0);
  });
});

describe('coach–Director friction resolution (M13b)', () => {
  it('a floored relationship ends in the coach resigning', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'fric-a' });
    s.managerRelations.relationshipWithUser = 5;
    resolveCoachFriction(s);
    expect(s.managerRelations.identity).toBe('Interim Head Coach');
    expect(s.managerRelations.relationshipWithUser).toBeGreaterThan(5);
    expect(s.eventLog.some((e) => e.code === 'coach.resigned')).toBe(true);
  });

  it('a strong relationship lifts the dressing room', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'fric-b' });
    s.managerRelations.relationshipWithUser = 95;
    const someone = Object.values(s.players).find((p) => p.club === s.playerClub)!;
    someone.morale = 50;
    resolveCoachFriction(s);
    expect(someone.morale).toBe(51);
    expect(s.eventLog.some((e) => e.code === 'coach.harmony')).toBe(true);
  });

  it('a healthy relationship trips neither branch', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'fric-c' });
    const id0 = s.managerRelations.identity;
    resolveCoachFriction(s);
    expect(s.managerRelations.identity).toBe(id0);
    expect(s.eventLog.some((e) => e.code === 'coach.resigned' || e.code === 'coach.harmony')).toBe(false);
  });
});

describe('coach transfer request in the review phase (M13b)', () => {
  it('surfaces a request for a favourite who is out there, and overruling erodes the relationship', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'req-a' });
    const target = anExternalPlayer(s);
    s.managerRelations.favourites = [target.name];
    runReviewPhase(s);

    const dec = s.pendingDecisions.find((d) => d.id === `coach-request:${target.id}`);
    expect(dec).toBeDefined();
    const rel0 = s.managerRelations.relationshipWithUser;
    const next = applyDecision(s, dec!.id, 'overrule').state;
    expect(next.managerRelations.relationshipWithUser).toBeLessThan(rel0);
  });

  it('does not request a favourite already in the squad', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'req-b' });
    const own = Object.values(s.players).find((p) => p.club === s.playerClub)!;
    s.managerRelations.favourites = [own.name];
    runReviewPhase(s);
    expect(s.pendingDecisions.some((d) => d.id.startsWith('coach-request:'))).toBe(false);
  });
});
