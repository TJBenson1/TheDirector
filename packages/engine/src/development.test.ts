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
  it('a young talent who plays regularly develops toward his ceiling', () => {
    const state = cloneState(createNewGame({ seed: 'dev-play' }));
    // A 19-year-old with a big gap, made the clear best CB at a weak club.
    const p = firstCB(state, 'watford');
    p.birthYear = 1980;
    p.ability = 68;
    p.potentialCeiling = 90;
    p.birthCeiling = 90;
    const before = p.ability;

    processSeasonDevelopment(state, Rng.fromSeed('run'));

    expect(estimateMinutesShare(state, state.clubs.watford!, p)).toBeGreaterThanOrEqual(0.6);
    expect(p.ability).toBeGreaterThan(before);
    expect(p.benchedDevSeasons).toBe(0);
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
