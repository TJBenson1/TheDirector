/**
 * Mid-season form report + European campaign narrative — read-only surfaces the
 * narrator turns into commentary. Deterministic, never touch the sim.
 */
import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { midSeasonForm } from './form.js';
import { europeanCampaign } from './champions.js';
import type { GameState } from './types.js';

function midSeason(scenario: string): GameState {
  let s = createNewGame({ scenarioId: scenario, seed: 'form' });
  let guard = 0;
  while (s.clock.date < '1996-01' && guard++ < 60) s = advanceWindow(s).state;
  return s;
}

describe('mid-season form report', () => {
  it('reports every squad player with minutes, output and a form note', () => {
    const s = midSeason('juventus-1995');
    const f = midSeasonForm(s);
    expect(f.underway).toBe(true);
    expect(f.roundsPlayed).toBeGreaterThan(0);
    expect(f.players.length).toBeGreaterThan(10);
    for (const p of f.players) {
      expect(p.note.length).toBeGreaterThan(0);
      expect(['flying', 'solid', 'struggling', 'adapting', 'misfit', 'logjam', 'fringe', 'injured']).toContain(p.flag);
      expect(p.minutesPct).toBeGreaterThanOrEqual(0);
    }
    // A first-choice striker at a strong side is banging them in — flagged flying.
    expect(f.players.some((p) => p.flag === 'flying' && p.goals >= 8)).toBe(true);
    // It is deterministic.
    expect(midSeasonForm(s)).toEqual(f);
  });

  it('is pure — reading it does not mutate the state', () => {
    const s = midSeason('juventus-1995');
    const before = JSON.stringify(s.players[Object.keys(s.players)[0]!]);
    midSeasonForm(s);
    expect(JSON.stringify(s.players[Object.keys(s.players)[0]!])).toBe(before);
  });
});

describe('European campaign narrative', () => {
  it('places a giant in the competition, tells the group story, and names favourites', () => {
    const s = midSeason('juventus-1995');
    const e = europeanCampaign(s);
    expect(e.inCompetition).toBe(true);
    expect(e.note.length).toBeGreaterThan(0);
    expect(e.favourites.length).toBeGreaterThanOrEqual(1);
    for (const f of e.favourites) expect(f.reason.length).toBeGreaterThan(0);
    // Being in the knockout field means they came through the group — never "out".
    if (e.phase === 'knockouts') expect(e.groupSummary.toLowerCase()).not.toContain('out at the group');
    // Deterministic.
    expect(europeanCampaign(s)).toEqual(e);
  });
});
