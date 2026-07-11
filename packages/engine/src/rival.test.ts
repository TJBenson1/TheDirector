import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState, hashState } from './state.js';
import { advanceWindow } from './advance.js';
import { executeTransfer } from './transfers.js';
import { applyDecision } from './events.js';
import { runRivalWindow, updateWorldDefiance } from './rival.js';
import { Rng } from './rng.js';
import type { GameState } from './types.js';

function resolveAll(s: GameState): GameState {
  let st = s;
  for (const d of [...st.pendingDecisions]) st = applyDecision(st, d.id, d.choices[0]!.id).state;
  return st;
}

describe('rival AI — counter-punch (§9a)', () => {
  it('raiding a simulated rival marks it for a counter-punch', () => {
    const state = cloneState(createNewGame({ seed: 'raid' }));
    state.clubs.man_utd!.finances.transferBudget = 100_000_000;
    // Buy an Arsenal player (Arsenal is a simulated in-league, non-rival club).
    const target = Object.values(state.players).find((p) => p.club === 'arsenal')!;
    executeTransfer(state, { playerId: target.id, toClub: 'man_utd', fee: 10_000_000 });
    expect(state.clubs.arsenal!.pendingCounterPunch).toBe(2);
    expect(state.clubs.arsenal!.grudge).toBeGreaterThan(0);
  });

  it('a raided club signs a replacement within its response window', () => {
    const state = cloneState(createNewGame({ seed: 'counter' }));
    state.clubs.man_utd!.finances.transferBudget = 100_000_000;
    const target = Object.values(state.players).find((p) => p.club === 'arsenal')!;
    executeTransfer(state, { playerId: target.id, toClub: 'man_utd', fee: 10_000_000 });
    const squadBefore = state.clubs.arsenal!.squad.length;

    // Give Arsenal room and run a rival window.
    state.clock = { ...state.clock, monthIndex: 6, window: 'winter' };
    runRivalWindow(state, Rng.fromSeed('rw'));

    expect(state.clubs.arsenal!.pendingCounterPunch).toBe(0);
    expect(state.clubs.arsenal!.squad.length).toBeGreaterThanOrEqual(squadBefore);
    expect(state.eventLog.some((e) => e.code === 'rival.counterpunch')).toBe(true);
  });
});

describe('rival AI — poaching (§9a #3)', () => {
  it('a rich rival can poach a willing user star', () => {
    // A star who dreams of Real Madrid, with high temptation, is at real risk.
    let poached = false;
    for (let seed = 0; seed < 30 && !poached; seed++) {
      const state = cloneState(createNewGame({ seed: `poach:${seed}`, settings: { starTemptation: 2 } }));
      state.clock = { ...state.clock, monthIndex: 0, window: 'summer' };
      state.userAggression = 5; // an active user provokes the response layer (§9a)
      const star = Object.values(state.players).find((p) => p.club === 'man_utd' && p.ability >= 85)!;
      star.resistance.dreamClubs = ['real_madrid'];
      star.resistance.clubLoyalty = 30;
      runRivalWindow(state, Rng.fromSeed(`rw:${seed}`));
      if (state.players[star.id]!.club !== 'man_utd') poached = true;
    }
    expect(poached).toBe(true);
  });
});

describe('rubber-band (§9a #5)', () => {
  it('a title-winning user raises world defiance; a poor finish lowers it', () => {
    const state = cloneState(createNewGame({ seed: 'defiance' }));
    const league = state.leagues['eng-1']!;
    // Simulate a title win.
    league.titleHistory.push({ seasonYear: 1999, championId: 'man_utd', points: 90 });
    for (const id of league.clubIds) league.standings[id] = { played: 38, won: 28, drawn: 6, lost: 4, goalsFor: 80, goalsAgainst: 30, points: 90 };
    const before = state.worldDefiance;
    updateWorldDefiance(state);
    expect(state.worldDefiance).toBeGreaterThan(before);
  });
});

describe('rival AI determinism', () => {
  it('same seed ⇒ identical hash with the rival AI active', () => {
    const run = () => {
      let s = createNewGame({ seed: 'rival-det' });
      for (let i = 0; i < 6; i++) {
        s = resolveAll(s);
        s = advanceWindow(s).state;
      }
      return hashState(s);
    };
    expect(run()).toBe(run());
  });
});
