import { describe, it, expect } from 'vitest';
import { coachForScenario, coachFit, resolveCoachFriction, playerStyleProfile } from './coaches.js';
import { coachBriefing } from './briefing.js';
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

  it('a documented castoff is vetoed and named — Lippi wants Baggio moved on', () => {
    const s = createNewGame({ scenarioId: 'juventus-1995', seed: 'castoff' });
    const baggio = Object.values(s.players).find((p) => p.name === 'Roberto Baggio')!;
    const fit = coachFit(s.managerRelations, baggio);
    expect(fit.verdict).toBe('veto');
    expect(fit.reason).toContain('moved on');
    // He surfaces as the man the coach isn't sold on in the opening briefing.
    expect(coachBriefing(s).notKeenOn.some((n) => n.name === 'Roberto Baggio')).toBe(true);
  });
});

describe('playing-style fit (M13c)', () => {
  const NEUTRAL = { professionalism: 5, ego: 5, ambition: 5, loyalty: 5, volatility: 5, adaptability: 5 };

  it('derives a style profile from position — a winger is more technical/faster than a centre-half', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'style-a' });
    const p = anExternalPlayer(s);
    p.positions = ['LW'];
    const wing = playerStyleProfile(p);
    p.positions = ['CB'];
    const cb = playerStyleProfile(p);
    expect(wing.technical).toBeGreaterThan(cb.technical);
    expect(wing.tempo).toBeGreaterThan(cb.tempo);
    expect(cb.physicality).toBeGreaterThan(wing.physicality);
  });

  it('a possession coach rates a technical creator above a physical centre-half (style, not temperament)', () => {
    const pep = coachForScenario('barcelona-2003', 2003); // possession: low physicality, high technical
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'style-b' });
    const p = anExternalPlayer(s);
    p.personality = { ...NEUTRAL }; // hold temperament constant so only STYLE differs
    p.positions = ['AM'];
    const creator = coachFit(pep, p).score;
    p.positions = ['CB'];
    const stopper = coachFit(pep, p).score;
    expect(creator).toBeGreaterThan(stopper);
  });

  it('a gegenpress coach prefers a high-tempo runner to a slower playmaker', () => {
    const klopp = coachForScenario('dortmund-2012', 2012); // gegenpress: high tempo/physicality
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'style-c' });
    const p = anExternalPlayer(s);
    p.personality = { ...NEUTRAL };
    p.name = 'not-a-favourite'; // avoid the favourite short-circuit
    p.positions = ['RW'];
    const runner = coachFit(klopp, p).score;
    p.positions = ['AM'];
    const playmaker = coachFit(klopp, p).score;
    expect(runner).toBeGreaterThan(playmaker);
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
