import { describe, it, expect } from 'vitest';
import {
  generateSchedule,
  simulateMatch,
  standingsOrder,
  maxConsecutiveTitles,
} from './season.js';
import { createNewGame, cloneState, hashState } from './state.js';
import { advanceWindow } from './advance.js';
import { Rng } from './rng.js';
import type { GameState } from './types.js';

/** Advance a full season (July → next July) and return the ended state. */
function playOneSeason(state: GameState): GameState {
  let s = state;
  // Summer → winter, then winter → next summer completes the season.
  s = advanceWindow(s).state; // to winter
  s = advanceWindow(s).state; // to next summer (crosses June crowning)
  return s;
}

describe('schedule generation', () => {
  it('produces a valid double round-robin', () => {
    const ids = Array.from({ length: 20 }, (_, i) => `t${i}`);
    const schedule = generateSchedule(ids, 1999);
    expect(schedule).toHaveLength(38); // 2 × (20 − 1)
    expect(schedule.every((r) => r.length === 10)).toBe(true); // 10 fixtures/round

    // Every ordered pair (home vs away) appears exactly once.
    const seen = new Set<string>();
    for (const round of schedule) {
      for (const f of round) {
        expect(f.home).not.toBe(f.away);
        seen.add(`${f.home}>${f.away}`);
      }
    }
    expect(seen.size).toBe(20 * 19); // every home/away permutation once
  });

  it('gives every club exactly 38 games, 19 home + 19 away', () => {
    const ids = Array.from({ length: 20 }, (_, i) => `t${i}`);
    const schedule = generateSchedule(ids, 2003);
    const home: Record<string, number> = {};
    const away: Record<string, number> = {};
    for (const round of schedule) {
      for (const f of round) {
        home[f.home] = (home[f.home] ?? 0) + 1;
        away[f.away] = (away[f.away] ?? 0) + 1;
      }
    }
    for (const id of ids) {
      expect(home[id]).toBe(19);
      expect(away[id]).toBe(19);
    }
  });

  it('rejects odd club counts', () => {
    expect(() => generateSchedule(['a', 'b', 'c'], 1999)).toThrow();
  });
});

describe('match model', () => {
  it('a far stronger side wins the clear majority over many games', () => {
    const rng = Rng.fromSeed('match');
    let strongWins = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      const r = simulateMatch(90, 45, rng); // strong at home
      if (r.homeGoals > r.awayGoals) strongWins++;
    }
    expect(strongWins / N).toBeGreaterThan(0.7);
  });

  it('evenly-matched games average a realistic goal count', () => {
    const rng = Rng.fromSeed('goals');
    let goals = 0;
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const r = simulateMatch(70, 70, rng);
      goals += r.homeGoals + r.awayGoals;
    }
    const avg = goals / N;
    expect(avg).toBeGreaterThan(2.3);
    expect(avg).toBeLessThan(3.1);
  });

  it('shows home advantage in aggregate', () => {
    const rng = Rng.fromSeed('home');
    let homeWins = 0;
    let awayWins = 0;
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const r = simulateMatch(70, 70, rng);
      if (r.homeGoals > r.awayGoals) homeWins++;
      else if (r.awayGoals > r.homeGoals) awayWins++;
    }
    expect(homeWins).toBeGreaterThan(awayWins);
  });
});

describe('season simulation — sane 1999–2000 table', () => {
  it('completes all 38 rounds and crowns a champion', () => {
    const state = createNewGame({ seed: 'season-1' });
    const ended = playOneSeason(state);
    const league = ended.leagues['eng-1']!;
    expect(league.titleHistory).toHaveLength(1);
    // Every club played 38 games.
    for (const id of league.clubIds) {
      expect(league.standings[id]!.played).toBe(38);
    }
    // Champion's points are in a realistic Premier League band.
    const champ = league.titleHistory[0]!;
    expect(champ.points).toBeGreaterThanOrEqual(70);
    expect(champ.points).toBeLessThanOrEqual(100);
  });

  it('over many seasons, stronger clubs finish higher on average', () => {
    // Average finishing position of the strongest club vs a weak club.
    const strong = 'man_utd';
    const weak = 'watford';
    let strongPosSum = 0;
    let weakPosSum = 0;
    let strongTitles = 0;
    const SEASONS = 40;
    for (let s = 0; s < SEASONS; s++) {
      const state = createNewGame({ seed: `table:${s}` });
      const ended = playOneSeason(state);
      const league = ended.leagues['eng-1']!;
      const order = standingsOrder(league);
      strongPosSum += order.indexOf(strong) + 1;
      weakPosSum += order.indexOf(weak) + 1;
      if (order[0] === strong) strongTitles++;
    }
    const strongAvg = strongPosSum / SEASONS;
    const weakAvg = weakPosSum / SEASONS;
    // Man Utd should average a top-few finish; Watford should be near the drop.
    expect(strongAvg).toBeLessThan(4);
    expect(weakAvg).toBeGreaterThan(14);
    // The strongest club wins most seasons, but NOT all (variance is real, §12).
    expect(strongTitles).toBeGreaterThan(SEASONS * 0.4);
    expect(strongTitles).toBeLessThan(SEASONS); // never a clean sweep
  });
});

describe('season sim determinism & purity', () => {
  it('same seed ⇒ identical state hash after several seasons', () => {
    const run = () => {
      let s = createNewGame({ seed: 'det-season' });
      for (let i = 0; i < 6; i++) s = advanceWindow(s).state;
      return hashState(s);
    };
    expect(run()).toBe(run());
  });

  it('advanceWindow does not mutate its input across a season boundary', () => {
    const state = createNewGame({ seed: 'purity-season' });
    const before = hashState(state);
    playOneSeason(state);
    expect(hashState(state)).toBe(before);
  });

  it('maxConsecutiveTitles tracks the longest streak', () => {
    let s = createNewGame({ seed: 'streak' });
    // Play several seasons.
    for (let i = 0; i < 8; i++) s = advanceWindow(s).state;
    expect(maxConsecutiveTitles(s)).toBeGreaterThanOrEqual(1);
  });

  it('cloneState deep-copies league standings', () => {
    const state = createNewGame();
    const clone = cloneState(state);
    clone.leagues['eng-1']!.standings.man_utd!.points = 999;
    expect(state.leagues['eng-1']!.standings.man_utd!.points).not.toBe(999);
  });
});
