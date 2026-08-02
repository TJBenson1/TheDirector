import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState, hashState } from './state.js';
import { advanceWindow } from './advance.js';
import { resolveIgnoredDecisions } from './events.js';
import { processInjuriesMonth, significantInjuredCount } from './injuries.js';
import { recomputeClubStrength, clubSquadPlayers } from './players.js';
import { processSeasonAgeing } from './ageing.js';
import { Rng } from './rng.js';
import type { GameState } from './types.js';

function strongestPlayers(state: GameState, clubId: string, n: number) {
  return clubSquadPlayers(state, clubId)
    .slice()
    .sort((a, b) => b.ability - a.ability)
    .slice(0, n);
}

describe('injuries (§9c)', () => {
  it('injured players are excluded from squad strength; depth mitigates', () => {
    const state = cloneState(createNewGame({ seed: 'inj-strength' }));
    const before = state.clubs.man_utd!.strength;
    // Injure the three best players.
    for (const p of strongestPlayers(state, 'man_utd', 3)) {
      p.injury = { kind: 'serious', monthsRemaining: 8, since: state.clock.date };
    }
    recomputeClubStrength(state, 'man_utd');
    const after = state.clubs.man_utd!.strength;
    expect(after).toBeLessThan(before); // it hurts
    expect(after).toBeGreaterThan(before - 40); // but depth cushions — not a collapse
  });

  it('a serious injury permanently shaves ability and raises proneness on return', () => {
    const state = cloneState(createNewGame({ seed: 'inj-perm' }));
    const p = strongestPlayers(state, 'man_utd', 1)[0]!;
    const abilityBefore = p.ability;
    const pronenessBefore = p.injuryProneness;
    p.injury = { kind: 'serious', monthsRemaining: 1, since: state.clock.date };

    processInjuriesMonth(state, Rng.fromSeed('recover'));

    expect(p.injury).toBeNull();
    expect(p.ability).toBeLessThan(abilityBefore);
    expect(p.injuryProneness).toBeGreaterThan(pronenessBefore);
    expect(p.fitness).toBeLessThan(100); // rusty on return
  });

  it('produces serious injuries at a sane rate over several seasons', () => {
    let state = createNewGame({ seed: 'inj-rate' });
    let serious = 0;
    let seasons = 0;
    // The live opening window consumes one advance in place, so run a couple more
    // to clear the same number of full seasons as before. Clear any scripted
    // interrupts (reality-default) each step so the injury RATE is measured over
    // real seasons, not throttled by how many set-pieces a scenario now fires.
    for (let i = 0; i < 14; i++) {
      resolveIgnoredDecisions(state);
      state.pendingDecisions = [];
      const res = advanceWindow(state);
      state = res.state;
      serious += res.events.filter((e) => e.code === 'injury.serious').length;
    }
    seasons = state.leagues['eng-1']!.titleHistory.length;
    expect(seasons).toBeGreaterThanOrEqual(3);
    // League-wide (20 clubs): well above zero, and not absurd.
    const perSquadSeason = serious / (20 * seasons);
    // Serious ligament-class injuries are the rare tail (the harness holds the
    // reality-calibrated 2–6% per-player-season band); here we only guard that they
    // happen and never run to an epidemic. Anti-clustering keeps the count modest.
    expect(perSquadSeason).toBeGreaterThan(0.25);
    expect(perSquadSeason).toBeLessThan(3.5);
  });

  it('the user club hits a 3+ simultaneous injury crisis within a career', () => {
    // A ~97% per-career property (see the harness): any single seed can miss it, so
    // sample a few careers and require the crisis in at least one — robust to RNG
    // shifts from unrelated engine changes, without seed-shopping.
    const seeds = ['inj-crisis', 'inj-crisis-2', 'inj-crisis-3'];
    const sawCrisis = seeds.some((seed) => {
      let state = createNewGame({ seed });
      for (let i = 0; i < 30; i++) {
        state = advanceWindow(state).state;
        if (significantInjuredCount(state, 'man_utd') >= 3) return true;
      }
      return false;
    });
    expect(sawCrisis).toBe(true);
  });

  it('injury processing is deterministic', () => {
    const run = () => {
      let s = createNewGame({ seed: 'inj-det' });
      for (let i = 0; i < 4; i++) s = advanceWindow(s).state;
      return hashState(s);
    };
    expect(run()).toBe(run());
  });
});

describe('ageing & decline (§5, §17.4)', () => {
  it('declines an ageing forward but leaves a youngster alone', () => {
    const state = cloneState(createNewGame({ seed: 'age' }));
    const year = 1999;
    const players = clubSquadPlayers(state, 'man_utd');
    const vet = players[0]!;
    const kid = players[1]!;
    vet.birthYear = year - 34; // 34-year-old
    vet.positions = ['ST'];
    const vetBefore = vet.ability;
    kid.birthYear = year - 20; // 20-year-old
    const kidBefore = kid.ability;

    processSeasonAgeing(state, Rng.fromSeed('age-run'));

    expect(vet.ability).toBeLessThan(vetBefore); // past the curve → declines
    expect(kid.ability).toBe(kidBefore); // pre-peak → untouched at M4
  });

  it('erodes an unmanaged squad over a long run (dominance is not free)', () => {
    let state = createNewGame({ seed: 'erode' });
    const start = state.clubs.man_utd!.baseStrength;
    for (let i = 0; i < 20; i++) state = advanceWindow(state).state; // ~10 seasons
    // With no transfers/development, the ageing squad's live strength drifts
    // below its 1999 baseline.
    expect(state.clubs.man_utd!.strength).toBeLessThan(start);
  });
});
