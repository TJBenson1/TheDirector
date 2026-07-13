import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { applyDecision } from './events.js';
import {
  directorSackManager,
  performSack,
  managerShortlist,
  courtManager,
  appointManager,
  willManagerJoin,
  reviewDirectorStrategy,
} from './manager.js';
import { Rng } from './rng.js';
import type { GameState } from './types.js';

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
