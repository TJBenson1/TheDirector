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
      // A double round-robin: 38 games for a 20-club league, 34 for Serie A's 18.
      const expectedGames = (endLeague.clubIds.length - 1) * 2;
      for (const cid of endLeague.clubIds) {
        expect(endLeague.standings[cid]!.played).toBe(expectedGames);
      }
      // The user finished somewhere valid in the table.
      expect(standingsOrder(endLeague).indexOf(state.playerClub)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('every playable club is featured with a real squad (§4, §14)', () => {
  // The 12 playable clubs (ELITE_CLUBS / Amendment B Tier 1). Each must be
  // genuinely playable somewhere — a curated squad of at least a first XI + subs,
  // not a wall of anonymous filler.
  const PLAYABLE = [
    'man_utd', 'real_madrid', 'barcelona', 'bayern', 'juventus', 'milan',
    'inter', 'arsenal', 'liverpool', 'chelsea', 'man_city', 'spurs',
  ];
  const MIN_SQUAD = 13;

  it('each of the 12 playable clubs has >= 13 curated players in at least one scenario', () => {
    const best: Record<string, number> = {};
    for (const scenarioId of Object.keys(SCENARIOS)) {
      const s = createNewGame({ scenarioId, seed: 'curation' });
      for (const club of PLAYABLE) {
        const c = s.clubs[club];
        if (!c) continue;
        const curated = c.squad.map((id) => s.players[id]!).filter((p) => p.curated).length;
        best[club] = Math.max(best[club] ?? 0, curated);
      }
    }
    for (const club of PLAYABLE) {
      expect(best[club] ?? 0, `${club} best curated squad`).toBeGreaterThanOrEqual(MIN_SQUAD);
    }
  });
});
