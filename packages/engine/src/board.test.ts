import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState, hashState } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { reviewBoard, rollInternalCrisis } from './board.js';
import { divergenceFactor, rollDivergentStoryline } from './divergence.js';
import { Rng } from './rng.js';
import type { GameState } from './types.js';

function crownUserWith(state: GameState, championId: string, userPoints: number) {
  const league = state.leagues['eng-1']!;
  league.titleHistory.push({ seasonYear: 1999, championId, points: 90 });
  // Give the user a middling record so standings order is deterministic.
  for (const id of league.clubIds) {
    league.standings[id] = { played: 38, won: 10, drawn: 8, lost: 20, goalsFor: 40, goalsAgainst: 60, points: 34 };
  }
  league.standings[state.playerClub] = {
    played: 38, won: Math.floor(userPoints / 3), drawn: 0, lost: 38 - Math.floor(userPoints / 3),
    goalsFor: 50, goalsAgainst: 50, points: userPoints,
  };
}

describe('board & job security (internal-friction §1)', () => {
  it('rewards patience for meeting the mandate', () => {
    const state = cloneState(createNewGame({ seed: 'board-good' }));
    crownUserWith(state, state.playerClub, 95); // user wins the title
    const before = state.board.patience;
    reviewBoard(state, Rng.fromSeed('b'));
    expect(state.board.patience).toBeGreaterThanOrEqual(before);
    expect(state.board.dismissed).toBe(false);
  });

  it('erodes patience, warns and can dismiss after sustained failure', () => {
    const state = cloneState(createNewGame({ seed: 'board-bad' }));
    state.board.patience = 30;
    let dismissed = false;
    for (let i = 0; i < 6 && !dismissed; i++) {
      crownUserWith(state, 'leeds', 20); // user finishes near the bottom
      reviewBoard(state, Rng.fromSeed(`b:${i}`));
      dismissed = state.board.dismissed;
    }
    expect(state.board.warnings).toBeGreaterThan(0);
    expect(dismissed).toBe(true);
  });

  it('a dismissed career does not advance', () => {
    const state = cloneState(createNewGame({ seed: 'sacked' }));
    state.board.dismissed = true;
    const before = state.clock.date;
    const { state: next } = advanceWindow(state);
    expect(next.clock.date).toBe(before);
  });
});

describe('internal crises (imposed adversity)', () => {
  it('raises an interrupt crisis the player must navigate', () => {
    const state = cloneState(createNewGame({ seed: 'crisis' }));
    // Force a crisis (probability 1).
    rollInternalCrisis(state, new ForcedRng(), 1);
    expect(state.pendingDecisions.some((d) => d.category === 'system')).toBe(true);
    expect(state.eventLog.some((e) => e.code === 'internal.crisis')).toBe(true);
  });
});

describe('divergence drift (§9f)', () => {
  it('is zero for a passive user, regardless of elapsed time', () => {
    const state = cloneState(createNewGame({ seed: 'passive' }));
    state.clock = { ...state.clock, date: '2010-07' }; // years later
    expect(state.userAggression).toBe(0);
    expect(divergenceFactor(state)).toBe(0);
  });

  it('rises with both user aggression and elapsed time', () => {
    const base = cloneState(createNewGame({ seed: 'drift' }));
    base.userAggression = 6;
    const early = divergenceFactor({ ...base, clock: { ...base.clock, date: '1999-07' } });
    const late = divergenceFactor({ ...base, clock: { ...base.clock, date: '2012-07' } });
    const lessAggressive = divergenceFactor({ ...base, userAggression: 2, clock: { ...base.clock, date: '2012-07' } });
    expect(early).toBeGreaterThan(0);
    expect(late).toBeGreaterThan(early); // time amplifies
    expect(late).toBeGreaterThan(lessAggressive); // aggression amplifies
  });

  it('a reshaped world writes non-real storylines into the divergence log', () => {
    const state = cloneState(createNewGame({ seed: 'story' }));
    state.userAggression = 20;
    state.clock = { ...state.clock, date: '2010-07' };
    let logged = 0;
    for (let i = 0; i < 50; i++) rollDivergentStoryline(state, Rng.fromSeed(`s:${i}`));
    logged = state.timeline.divergenceLog.filter((d) => d.kind === 'storyline').length;
    expect(logged).toBeGreaterThan(0);
  });
});

describe('M9 determinism', () => {
  it('same seed ⇒ identical hash with board + divergence active', () => {
    const run = () => {
      let s = createNewGame({ seed: 'm9-det' });
      for (let i = 0; i < 8 && !s.board.dismissed; i++) {
        for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
        s = advanceWindow(s).state;
      }
      return hashState(s);
    };
    expect(run()).toBe(run());
  });
});

/** An RNG whose chance() always returns true (for forcing a crisis). */
class ForcedRng extends Rng {
  constructor() {
    super(1);
  }
  override chance(): boolean {
    return true;
  }
}
