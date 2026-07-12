import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { processSeasonDevelopment, estimateMinutesShare } from './development.js';
import { clubSquadPlayers } from './players.js';
import { Rng } from './rng.js';
import type { GameState, PlayerState } from './types.js';

function firstCB(state: GameState, clubId: string): PlayerState {
  return clubSquadPlayers(state, clubId).find((p) => p.positions[0] === 'CB')!;
}

describe('contextual development (§5)', () => {
  it('a young talent who plays regularly develops in most seasons (development is not on rails)', () => {
    // Development is stochastic — a playing season usually grows the player but
    // can stall (§5; internal-friction §5). Assert the common case across seeds.
    let grew = 0;
    const trials = 20;
    for (let i = 0; i < trials; i++) {
      const state = cloneState(createNewGame({ seed: `dev-play:${i}` }));
      const p = firstCB(state, 'watford');
      p.birthYear = 1980; // 19
      p.ability = 68;
      p.potentialCeiling = 90;
      p.birthCeiling = 90;
      // Control professionalism so the test isolates the MINUTES factor rather
      // than whichever procedural filler (and its random personality) is picked.
      p.personality = { professionalism: 9, ego: 4, ambition: 7, loyalty: 7, volatility: 2, adaptability: 7 };
      expect(estimateMinutesShare(state, state.clubs.watford!, p)).toBeGreaterThanOrEqual(0.6);
      const before = p.ability;
      processSeasonDevelopment(state, Rng.fromSeed(`run:${i}`));
      expect(p.benchedDevSeasons).toBe(0); // he played
      if (p.ability > before) grew++;
    }
    expect(grew).toBeGreaterThan(trials / 2); // develops in the clear majority
  });

  it('a benched young talent plateaus: ceiling erodes and he barely grows', () => {
    const state = cloneState(createNewGame({ seed: 'dev-bench' }));
    // Wes Brown, but reset young with a high ceiling, stuck behind the CBs.
    const brown = state.players['cur_wbrown']!;
    brown.birthYear = 1980;
    brown.ability = 60;
    brown.potentialCeiling = 88;
    brown.birthCeiling = 88;
    const ceilBefore = brown.potentialCeiling;

    processSeasonDevelopment(state, Rng.fromSeed('run'));

    expect(estimateMinutesShare(state, state.clubs.man_utd!, brown)).toBeLessThan(0.4);
    expect(brown.benchedDevSeasons).toBe(1);
    expect(brown.potentialCeiling).toBeLessThan(ceilBefore); // lost window
    expect(brown.ability).toBeLessThan(64); // negligible growth
  });

  it('estimateMinutesShare ranks the best at a position as first choice', () => {
    const state = createNewGame({ seed: 'minutes' });
    const cbs = clubSquadPlayers(state, 'man_utd')
      .filter((p) => p.positions[0] === 'CB')
      .sort((a, b) => b.ability - a.ability);
    const best = cbs[0]!;
    const worst = cbs[cbs.length - 1]!;
    expect(estimateMinutesShare(state, state.clubs.man_utd!, best)).toBeGreaterThan(
      estimateMinutesShare(state, state.clubs.man_utd!, worst),
    );
  });

  it('lifestyle decline strikes some low-professionalism stars (Ronaldinho pattern)', () => {
    let declines = 0;
    for (let i = 0; i < 60; i++) {
      const state = cloneState(createNewGame({ seed: `life:${i}` }));
      const star = clubSquadPlayers(state, 'man_utd')[0]!;
      star.birthYear = 1971; // 28
      star.ability = 88;
      star.personality.professionalism = 3;
      star.personality.volatility = 8;
      const before = star.ability;
      processSeasonDevelopment(state, Rng.fromSeed(`life-run:${i}`));
      if (star.ability < before) declines++;
    }
    expect(declines).toBeGreaterThan(0);
    expect(declines).toBeLessThan(60); // not everyone, every year
  });
});
