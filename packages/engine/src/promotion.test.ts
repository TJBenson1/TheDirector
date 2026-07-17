import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { applyInPlacePromotion } from './season.js';
import { applyDecision } from './events.js';
import { advanceWindow } from './advance.js';
import { Rng } from './rng.js';
import type { GameState, LeagueState, TeamRecord } from './types.js';

const rec = (points: number): TeamRecord => ({
  played: 38, won: Math.floor(points / 3), drawn: points % 3, lost: 38 - Math.floor(points / 3),
  goalsFor: points, goalsAgainst: 76 - points, points,
});

function juveGame(): { state: GameState; league: LeagueState } {
  const state = createNewGame({ scenarioId: 'juventus-2006', seed: 'juve' });
  const league = state.leagues['ita-b-2006']!;
  return { state, league };
}

const PROMO = { leagueId: 'ita-2007', maxPosition: 2 };

describe('in-place promotion of the player’s own club (juventus-2006)', () => {
  it('starts Juventus in a simulated Serie B', () => {
    const { league } = juveGame();
    expect(league.name).toBe('Serie B');
    expect(league.clubIds).toContain('juventus');
  });

  it('rises into Serie A when Juventus wins the division', () => {
    const { state, league } = juveGame();
    const oldMembers = [...league.clubIds];
    for (const id of league.clubIds) league.standings[id] = rec(20);
    league.standings['juventus'] = rec(95); // runaway champions

    const ok = applyInPlacePromotion(state, league, PROMO, Rng.fromSeed('p'));
    expect(ok).toBe(true);
    expect(league.name).toBe('Serie A');
    expect(league.clubIds).toContain('juventus');
    expect(league.clubIds.length).toBe(20);
    // Serie A sides came in around them...
    expect(league.clubIds).toContain('inter');
    expect(league.clubIds).toContain('roma');
    expect(state.clubs['roma']!.leagueId).toBe(league.id);
    expect(state.clubs['roma']!.squad.length).toBeGreaterThan(0);
    // ...and a beaten Serie B side dropped to the reservoir.
    const dropped = oldMembers.find((id) => id !== 'juventus' && !league.clubIds.includes(id))!;
    expect(dropped).toBeDefined();
    expect(league.reservoir).toContain(dropped);
    expect(state.clubs[dropped]!.leagueId).toBeNull();
  });

  it('does NOT promote when Juventus finishes outside the top two', () => {
    const { state, league } = juveGame();
    for (const id of league.clubIds) league.standings[id] = rec(80);
    league.standings['juventus'] = rec(12); // rock bottom

    const ok = applyInPlacePromotion(state, league, PROMO, Rng.fromSeed('p'));
    expect(ok).toBe(false);
    expect(league.name).toBe('Serie B');
  });

  it('the promoted division plays on without breaking the sim', () => {
    let s = createNewGame({ scenarioId: 'juventus-2006', seed: 'career' });
    // Guarantee promotion at the first boundary: make Juventus champions-in-waiting.
    const league = s.leagues['ita-b-2006']!;
    for (const id of league.clubIds) league.standings[id] = rec(15);
    league.standings['juventus'] = rec(99);
    for (let i = 0; i < 30; i++) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      s = advanceWindow(s).state;
    }
    const lg = Object.values(s.leagues)[0]!;
    expect(lg.clubIds).toContain('juventus');
    expect(lg.clubIds.length).toBeGreaterThanOrEqual(18);
    // Determinism holds with the transform in the path.
    const rerun = () => {
      let r = createNewGame({ scenarioId: 'juventus-2006', seed: 'career' });
      const rl = r.leagues['ita-b-2006']!;
      for (const id of rl.clubIds) rl.standings[id] = rec(15);
      rl.standings['juventus'] = rec(99);
      for (let i = 0; i < 30; i++) {
        for (const d of [...r.pendingDecisions]) r = applyDecision(r, d.id, d.choices[0]!.id).state;
        r = advanceWindow(r).state;
      }
      return Object.values(r.leagues)[0]!.name;
    };
    expect(rerun()).toBe(rerun());
  });
});
