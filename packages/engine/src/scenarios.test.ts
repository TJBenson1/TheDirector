import { describe, it, expect } from 'vitest';
import { SCENARIOS } from './scenarios.js';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { standingsOrder } from './season.js';
import type { GameState } from './types.js';

function playASeason(state: GameState): GameState {
  let s = state;
  const leagueId = s.clubs[s.playerClub]!.leagueId!;
  for (let i = 0; i < 14 && s.leagues[leagueId]!.titleHistory.length === 0; i++) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    s = advanceWindow(s).state;
  }
  return s;
}

describe('scenarios (§14 start points)', () => {
  it('registers multiple prescribed start points', () => {
    const ids = Object.keys(SCENARIOS);
    expect(ids).toContain('man-utd-1999');
    expect(ids.length).toBeGreaterThanOrEqual(4);
  });

  for (const [id, scenario] of Object.entries(SCENARIOS)) {
    it(`"${id}" builds a valid, playable game`, () => {
      const state = createNewGame({ scenarioId: id, seed: `scenario:${id}` });
      // The user's club is real and plays in a simulated league.
      const club = state.clubs[state.playerClub];
      expect(club).toBeDefined();
      expect(club!.leagueId).not.toBeNull();
      const league = state.leagues[club!.leagueId!];
      expect(league).toBeDefined();
      expect(league!.clubIds).toContain(state.playerClub);
      expect(state.meta.startYear).toBe(Number(scenario.startDate.slice(0, 4)));
      expect(Object.keys(state.players).length).toBeGreaterThan(400);

      // A full season completes and crowns a champion without error.
      const ended = playASeason(state);
      const endLeague = ended.leagues[club!.leagueId!]!;
      expect(endLeague.titleHistory.length).toBeGreaterThanOrEqual(1);
      for (const cid of endLeague.clubIds) {
        expect(endLeague.standings[cid]!.played).toBe(38);
      }
      // The user finished somewhere valid in the table.
      expect(standingsOrder(endLeague).indexOf(state.playerClub)).toBeGreaterThanOrEqual(0);
    });
  }
});
