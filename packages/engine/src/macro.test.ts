import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { fireMacroEvents, applyConsequence } from './events.js';
import type { GameState } from './types.js';

const at = (scenarioId: string, date: string): GameState => {
  const s = createNewGame({ scenarioId, seed: `macro:${scenarioId}` });
  s.clock = { ...s.clock, date };
  return s;
};
const logged = (s: GameState, id: string) => s.eventLog.some((e) => e.code === 'macro.world' && e.data?.id === id);
const pending = (s: GameState, id: string) => s.pendingDecisions.some((d) => d.id === `macro:${id}`);

describe('macro world events (§9f)', () => {
  it('Covid (2020) hits finances world-wide and raises a decision at your club', () => {
    const s = at('barcelona-2014', '2020-03');
    const leagueBudget = () => Object.values(s.clubs).filter((c) => c.leagueId != null).reduce((n, c) => n + c.finances.transferBudget, 0);
    const before = leagueBudget();
    fireMacroEvents(s);
    expect(logged(s, 'covid-2020')).toBe(true);
    expect(pending(s, 'covid-2020')).toBe(true);
    expect(leagueBudget()).toBeLessThan(before); // revenue collapse
  });

  it('the Super League (2021) offers an elite club the join/refuse choice', () => {
    const s = at('barcelona-2014', '2021-04');
    fireMacroEvents(s);
    expect(logged(s, 'super-league-2021')).toBe(true);
    const d = s.pendingDecisions.find((x) => x.id === 'macro:super-league-2021');
    expect(d).toBeDefined();
    expect(d!.choices.map((c) => c.id).sort()).toEqual(['join', 'refuse']);
  });

  it('City’s charges (2023) are a decision if you manage City, world colour if not', () => {
    const asCity = at('man-city-2008', '2023-02');
    fireMacroEvents(asCity);
    expect(pending(asCity, 'city-charges-2023')).toBe(true);

    const asOther = at('barcelona-2014', '2023-02');
    fireMacroEvents(asOther);
    expect(pending(asOther, 'city-charges-2023')).toBe(false);
    expect(logged(asOther, 'city-charges-2023')).toBe(true);
  });

  it('deductPoints docks live league standings', () => {
    const s = at('man-city-2008', '2023-02');
    const lgId = s.clubs['man_city']!.leagueId!;
    s.leagues[lgId]!.standings['man_city'] = {
      played: 25, won: 10, drawn: 0, lost: 15, goalsFor: 30, goalsAgainst: 30, points: 30,
    };
    applyConsequence(s, { kind: 'deductPoints', clubId: 'man_city', amount: 10 });
    expect(s.leagues[lgId]!.standings['man_city']!.points).toBe(20);
    expect(s.eventLog.some((e) => e.code === 'points.deducted')).toBe(true);
  });

  it('fires once, and only within its date window', () => {
    const s = at('barcelona-2014', '2020-03');
    fireMacroEvents(s);
    fireMacroEvents(s); // same window, second call
    expect(s.eventLog.filter((e) => e.code === 'macro.world' && e.data?.id === 'covid-2020')).toHaveLength(1);

    const late = at('barcelona-2014', '2021-01'); // long past Covid's window, before Super League
    fireMacroEvents(late);
    expect(logged(late, 'covid-2020')).toBe(false);
  });

  it('is silent throughout the man-utd-1999 calibration window (never before 2020)', () => {
    for (const date of ['1999-08', '2005-05', '2010-01', '2014-06']) {
      const s = at('man-utd-1999', date);
      fireMacroEvents(s);
      expect(s.eventLog.some((e) => e.code === 'macro.world' || e.code === 'macro.fired')).toBe(false);
      expect(s.pendingDecisions.some((d) => d.id.startsWith('macro:'))).toBe(false);
    }
  });
});
