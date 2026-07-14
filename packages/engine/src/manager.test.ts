import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { applyDecision } from './events.js';
import { advanceWindow } from './advance.js';
import {
  directorSackManager,
  performSack,
  managerShortlist,
  courtManager,
  appointManager,
  willManagerJoin,
  reviewDirectorStrategy,
  issueDirective,
  coachResistanceChance,
  applyDirectiveEffects,
  managerStrengthMod,
  managerDevMod,
  managerStyleStrengthMod,
  styleMatchAffinity,
  coachStyle,
} from './manager.js';
import { recomputeClubStrength, clubSquadPlayers } from './players.js';
import { estimateMinutesShare } from './development.js';
import { Rng } from './rng.js';
import type { GameState, PlayerState } from './types.js';

describe('the head coach — hire, fire, survive & woo', () => {
  it('each scenario inherits its real head coach', () => {
    expect(createNewGame({ scenarioId: 'man-utd-1999' }).managerRelations.identity).toBe('Alex Ferguson');
    expect(createNewGame({ scenarioId: 'arsenal-2004' }).managerRelations.identity).toBe('Arsène Wenger');
    expect(createNewGame({ scenarioId: 'bayern-2009' }).managerRelations.identity).toBe('Louis van Gaal');
    expect(createNewGame({ scenarioId: 'man-utd-2013' }).managerRelations.identity).toBe('David Moyes');
    // The inherited coach is NOT the Director's own hire.
    expect(createNewGame({ scenarioId: 'man-utd-1999' }).managerRelations.appointedByUser).toBe(false);
  });

  it('the Director can fire the coach and appoint a successor (his own hire)', () => {
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'sack' });
    expect(directorSackManager(s).ok).toBe(true);
    expect(s.managerRelations.identity).toBe('caretaker manager');
    const hire = s.pendingDecisions.find((d) => d.id.startsWith('hire-manager:'))!;
    expect(hire).toBeTruthy();
    const chosen = hire.choices[0]!;
    s = applyDecision(s, hire.id, chosen.id).state;
    expect(s.managerRelations.identity).not.toBe('caretaker manager');
    expect(s.managerRelations.appointedByUser).toBe(true); // you own this one now
  });

  it('sacking a failing coach is a lightning rod — it buys the Director patience', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'rod' });
    s.board.patience = 30;
    s.managerRelations.appointedByUser = false; // an inherited coach — full blame deflects
    performSack(s, 18, 'the board');
    expect(s.board.patience).toBe(48); // +18 relief

    // But sacking your OWN appointment deflects far less blame (×0.4).
    const s2 = createNewGame({ scenarioId: 'man-utd-1999', seed: 'rod2' });
    s2.board.patience = 30;
    s2.managerRelations.appointedByUser = true;
    performSack(s2, 18, 'the board');
    expect(s2.board.patience).toBe(37); // +round(18*0.4)=+7
  });

  it('a marquee coach snubs a cold approach but joins once wooed', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'woo' }); // prestige 82
    // Capello (rep 90) is out of Liverpool's cold reach.
    expect(willManagerJoin(s, 'Fabio Capello', 90, true)).toBe(false);
    // Cold appointment is snubbed — the caretaker/incumbent stays.
    const before = s.managerRelations.identity;
    appointManager(s, 'Fabio Capello', 90, true);
    expect(s.managerRelations.identity).toBe(before);
    expect(s.eventLog.some((e) => e.code === 'manager.snubbed')).toBe(true);
    // Court him twice ("speak to his people") and he'll take it.
    courtManager(s, 'Fabio Capello');
    courtManager(s, 'Fabio Capello');
    expect(willManagerJoin(s, 'Fabio Capello', 90, true)).toBe(true);
    appointManager(s, 'Fabio Capello', 90, true);
    expect(s.managerRelations.identity).toBe('Fabio Capello');
    expect(s.managerRelations.appointedByUser).toBe(true);
  });

  it('an attainable coach always accepts; the shortlist ranks by fit', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'short' });
    const list = managerShortlist(s);
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(3);
    const attainable = list.find((c) => !c.marquee)!;
    expect(willManagerJoin(s, attainable.name, attainable.reputation, false)).toBe(true);
  });

  it('the Director can be dismissed on STRATEGY alone, but only when already under pressure', () => {
    // Under pressure (patience 30): the strategy route eventually fires.
    const under = firstDismissal((s) => {
      s.board.patience = 30;
      s.managerRelations.reputation = 70; // rule out the coup route
      s.managerRelations.relationshipWithUser = 60;
    });
    expect(under.dismissed).toBe(true);
    expect(under.code).toBe('board.strategy');

    // Thriving (patience 80): neither rare route fires across many seasons.
    const safe = firstDismissal((s) => {
      s.board.patience = 80;
      s.managerRelations.reputation = 90;
      s.managerRelations.relationshipWithUser = 20;
    });
    expect(safe.dismissed).toBe(false);
  });

  it('a powerful, estranged manager can win a boardroom coup', () => {
    const coup = firstDismissal((s) => {
      s.board.patience = 50; // >42 so the strategy route is closed
      s.managerRelations.reputation = 90;
      s.managerRelations.relationshipWithUser = 20;
    });
    expect(coup.dismissed).toBe(true);
    expect(coup.code).toBe('board.managercoup');
  });
});

describe('the coach may resist a directive on minutes or load', () => {
  // A coach who always/never pushes back, to test both branches deterministically.
  const RESIST = { chance: () => true } as unknown as Rng;
  const COMPLY = { chance: () => false } as unknown as Rng;

  const userSquad = (s: GameState): PlayerState[] =>
    (s.clubs[s.playerClub]!.squad).map((id) => s.players[id]!).filter(Boolean);
  const lowestShare = (s: GameState): PlayerState =>
    userSquad(s).slice().sort((a, b) =>
      estimateMinutesShare(s, s.clubs[s.playerClub]!, a) - estimateMinutesShare(s, s.clubs[s.playerClub]!, b))[0]!;
  const highestShare = (s: GameState): PlayerState =>
    userSquad(s).slice().sort((a, b) =>
      estimateMinutesShare(s, s.clubs[s.playerClub]!, b) - estimateMinutesShare(s, s.clubs[s.playerClub]!, a))[0]!;

  it('resistance rises with the coach\'s reputation, a poor relationship, and contradiction', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'resist' });
    // A big-name, estranged, inherited coach vs a friendly hire of your own.
    s.managerRelations = { ...s.managerRelations, reputation: 92, relationshipWithUser: 25, appointedByUser: false };
    const hostile = coachResistanceChance(s, 0.8);
    s.managerRelations = { ...s.managerRelations, reputation: 60, relationshipWithUser: 75, appointedByUser: true };
    const friendly = coachResistanceChance(s, 0.8);
    expect(hostile).toBeGreaterThan(friendly);
    // More contradictory directives are fought harder.
    expect(coachResistanceChance(s, 0.9)).toBeGreaterThan(coachResistanceChance(s, 0.1));
  });

  it('a compliant coach just does it — no confrontation', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'comply' });
    const kid = lowestShare(s);
    const res = issueDirective(s, COMPLY, kid.id, 'minutes');
    expect(res.resisted).toBe(false);
    expect(s.directives?.[kid.id]?.kind).toBe('minutes');
    expect(s.pendingDecisions.some((d) => d.id.startsWith('directive-clash:'))).toBe(false);
  });

  it('a resisted directive is a confrontation — overrule imposes it and costs goodwill', () => {
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'overrule' });
    const rel0 = s.managerRelations.relationshipWithUser;
    const kid = lowestShare(s);
    const res = issueDirective(s, RESIST, kid.id, 'minutes');
    expect(res.resisted).toBe(true);
    expect(s.directives?.[kid.id]).toBeUndefined(); // not applied while contested
    const clash = s.pendingDecisions.find((d) => d.id.startsWith('directive-clash:'))!;
    expect(clash).toBeTruthy();
    // Overrule him: the directive takes effect, the relationship + his standing dip.
    s = applyDecision(s, clash.id, 'overrule').state;
    expect(s.directives?.[kid.id]?.kind).toBe('minutes');
    expect(s.managerRelations.relationshipWithUser).toBeLessThan(rel0);
  });

  it('deferring (choices[0]) drops the directive — the coach keeps control', () => {
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'defer' });
    const kid = lowestShare(s);
    issueDirective(s, RESIST, kid.id, 'minutes');
    const clash = s.pendingDecisions.find((d) => d.id.startsWith('directive-clash:'))!;
    s = applyDecision(s, clash.id, clash.choices[0]!.id).state; // defer
    expect(s.directives?.[kid.id]).toBeUndefined();
  });

  it('a minutes directive guarantees a benched player first-team football', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'minutes' });
    const club = s.clubs[s.playerClub]!;
    const kid = lowestShare(s);
    expect(estimateMinutesShare(s, club, kid)).toBeLessThan(0.6); // benched/rotation
    issueDirective(s, COMPLY, kid.id, 'minutes');
    expect(estimateMinutesShare(s, club, kid)).toBeGreaterThanOrEqual(0.7); // now plays
  });

  it('a load directive caps a key player and eases his body over the season', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'load' });
    const club = s.clubs[s.playerClub]!;
    const star = highestShare(s);
    star.injuryProneness = 60;
    expect(estimateMinutesShare(s, club, star)).toBeGreaterThanOrEqual(0.6); // first choice
    issueDirective(s, COMPLY, star.id, 'load');
    expect(estimateMinutesShare(s, club, star)).toBeLessThanOrEqual(0.4); // load-managed
    // A season of managed load makes the body more durable.
    applyDirectiveEffects(s);
    expect(star.injuryProneness).toBe(56);
  });
});

describe('the coach\'s on-pitch effect (anchored to par)', () => {
  it('keeping the inherited coach is exactly neutral (0 strength / ×1 dev)', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'par' });
    // Inherited coach: reputation === parReputation → no effect at all.
    expect(s.managerRelations.reputation).toBe(s.managerRelations.parReputation);
    expect(managerStrengthMod(s.managerRelations)).toBe(0);
    expect(managerDevMod(s.managerRelations)).toBe(1);
  });

  it('a caretaker gap drags the side; a marquee upgrade sharpens it', () => {
    const s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'onpitch' }); // par = Moyes 68
    const par = s.managerRelations.parReputation;
    // Worse than par (a caretaker) → negative strength, sub-1 development.
    s.managerRelations = { ...s.managerRelations, reputation: par - 30 };
    expect(managerStrengthMod(s.managerRelations)).toBeLessThan(0);
    expect(managerDevMod(s.managerRelations)).toBeLessThan(1);
    // Better than par (a marquee) → positive, but bounded (a coach can't carry a
    // squad on his own).
    s.managerRelations = { ...s.managerRelations, reputation: par + 22 };
    expect(managerStrengthMod(s.managerRelations)).toBeGreaterThan(0);
    expect(managerStrengthMod(s.managerRelations)).toBeLessThanOrEqual(4);
    expect(managerDevMod(s.managerRelations)).toBeGreaterThan(1);
  });

  it('the effect flows into the club\'s live match strength', () => {
    const s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'strength' });
    recomputeClubStrength(s, s.playerClub);
    const parStrength = s.clubs[s.playerClub]!.strength;
    // Drop to a caretaker-calibre coach → the side is measurably weaker.
    s.managerRelations = { ...s.managerRelations, reputation: s.managerRelations.parReputation - 40 };
    recomputeClubStrength(s, s.playerClub);
    expect(s.clubs[s.playerClub]!.strength).toBeLessThan(parStrength);
    // AI clubs are never touched by the user's coach.
    const rivalBefore = s.clubs.chelsea!.strength;
    recomputeClubStrength(s, 'chelsea');
    expect(s.clubs.chelsea!.strength).toBe(rivalBefore);
  });

  it('sacking the coach dips the side immediately (the caretaker XI)', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'sackdip' });
    recomputeClubStrength(s, s.playerClub);
    const before = s.clubs[s.playerClub]!.strength;
    directorSackManager(s); // Ferguson out, caretaker in
    expect(s.clubs[s.playerClub]!.strength).toBeLessThan(before);
  });
});

describe('era-real coach pool + the Ferguson retirement counterfactual', () => {
  it('the hire shortlist is era-gated — no pre-Barcelona Pep in 2001', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'era' }); // 2001
    const names2001 = managerShortlist(s).map((c) => c.name);
    expect(names2001).not.toContain('Pep Guardiola'); // he had no dugout until 2008
    // A 2013 world CAN surface him.
    const s13 = createNewGame({ scenarioId: 'man-utd-2013', seed: 'era13' });
    // Pep is a marquee (rep 90) for United (prestige 88) — court, then he can be top.
    const pool13 = managerShortlist(s13);
    expect(pool13.length).toBeGreaterThan(0);
    // At minimum, an era-gated pool never offers a coach outside his years.
    for (const c of pool13) expect(typeof c.reputation).toBe('number');
  });

  it('Ferguson faces the 2001 retirement crossroads — persuading him keeps reality', () => {
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'fergie' });
    let sawEvent = false;
    for (let i = 0; i < 12 && !s.board.dismissed; i++) {
      const ev = s.pendingDecisions.find((d) => d.id.startsWith('manager-retirement:'));
      if (ev) {
        sawEvent = true;
        expect(Number(s.clock.date.slice(0, 4))).toBeGreaterThanOrEqual(2001);
        s = applyDecision(s, ev.id, 'persuade').state; // talk him round
        break;
      }
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      s = advanceWindow(s).state;
    }
    expect(sawEvent).toBe(true);
    expect(s.managerRelations.identity).toBe('Alex Ferguson'); // he stays, as in reality
    expect(s.eventLog.some((e) => e.code === 'manager.retirement.considering')).toBe(true);
  });

  it('letting Ferguson retire opens an era-real succession (no anachronisms)', () => {
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'fergie-go' });
    for (let i = 0; i < 12; i++) {
      const ev = s.pendingDecisions.find((d) => d.id.startsWith('manager-retirement:'));
      if (ev) { s = applyDecision(s, ev.id, 'accept').state; break; }
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      s = advanceWindow(s).state;
    }
    expect(s.eventLog.some((e) => e.code === 'manager.retired')).toBe(true);
    const hire = s.pendingDecisions.find((d) => d.id.startsWith('hire-manager:'))!;
    expect(hire).toBeTruthy();
    // The 2001-02 successors are era-real names, never a pre-2008 Pep.
    const successors = hire.choices.map((c) => c.label);
    expect(successors.join(' ')).not.toContain('Guardiola');
  });
});

describe('management style reflects reality (Mourinho is Mourinho, Pep is Pep)', () => {
  it('real coaches carry their signature, opposite styles', () => {
    const pep = coachStyle('Pep Guardiola');
    const mou = coachStyle('José Mourinho');
    expect(pep.possession).toBeGreaterThan(0.9); // total control
    expect(mou.possession).toBeLessThan(0.3); // low block & counter
    expect(pep.possession).toBeGreaterThan(mou.possession);
    // Wenger develops youth; Allardyce does not.
    expect(coachStyle('Arsène Wenger').youth).toBeGreaterThan(coachStyle('Sam Allardyce').youth);
    // Each scenario's inherited coach carries his real identity.
    expect(createNewGame({ scenarioId: 'arsenal-2004' }).managerRelations.style.possession).toBeGreaterThan(0.7);
  });

  it('a style is judged by how it FITS the squad you have built', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'fit' });
    // Build a midfield-heavy side: crank MID, drop DEF/ATT.
    for (const p of clubSquadPlayers(s, s.playerClub)) {
      const pos = p.positions[0] ?? 'CM';
      if (['DM', 'CM', 'AM'].includes(pos)) p.ability = 90;
      else if (pos !== 'GK') p.ability = 68;
    }
    const possession = coachStyle('Pep Guardiola');
    const pragmatic = coachStyle('Sam Allardyce');
    // A possession coach gets more out of a midfield-dominant squad than a
    // route-one pragmatist does.
    expect(styleMatchAffinity(s, possession)).toBeGreaterThan(styleMatchAffinity(s, pragmatic));
  });

  it('keeping the inherited coach\'s style is neutral, even as the squad drifts', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'stylepar' });
    expect(managerStyleStrengthMod(s)).toBe(0); // style === parStyle
    // Reshape the squad — still neutral, because the style hasn't changed.
    for (const p of clubSquadPlayers(s, s.playerClub)) p.ability = 88;
    expect(managerStyleStrengthMod(s)).toBe(0);
  });

  it('appointing a style that suits your squad adds strength; a mismatch subtracts', () => {
    const base = createNewGame({ scenarioId: 'liverpool-2001', seed: 'stylefit' });
    // A midfield-dominant squad.
    for (const p of clubSquadPlayers(base, base.playerClub)) {
      const pos = p.positions[0] ?? 'CM';
      p.ability = ['DM', 'CM', 'AM'].includes(pos) ? 90 : pos === 'GK' ? 75 : 66;
    }
    // Court + appoint Pep (possession) — fits — vs Allardyce (direct) — misfit.
    const withPep = cloneStyle(base, 'Pep Guardiola');
    const withBig = cloneStyle(base, 'Sam Allardyce');
    expect(managerStyleStrengthMod(withPep)).toBeGreaterThan(managerStyleStrengthMod(withBig));
    expect(managerStyleStrengthMod(withPep)).toBeGreaterThan(0); // possession suits this squad
  });
});

/** Clone a state and swap in a coach's style (leaving parStyle as the inherited
 *  baseline), so the style-fit delta reflects that appointment. */
function cloneStyle(s: GameState, coachName: string): GameState {
  const c = structuredClone(s);
  c.managerRelations = { ...c.managerRelations, style: coachStyle(coachName) };
  return c;
}

/** Run reviewDirectorStrategy with fresh RNG streams until it dismisses (or give
 *  up), returning the outcome + the dismissal code that fired. */
function firstDismissal(setup: (s: GameState) => void): { dismissed: boolean; code?: string } {
  const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'director' });
  setup(s);
  for (let i = 0; i < 400 && !s.board.dismissed; i++) {
    reviewDirectorStrategy(s, new Rng(1000 + i));
  }
  const code = s.eventLog.filter((e) => e.category === 'system').map((e) => e.code)
    .find((c) => c === 'board.strategy' || c === 'board.managercoup');
  return { dismissed: s.board.dismissed, code };
}
