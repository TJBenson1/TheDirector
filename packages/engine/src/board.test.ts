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

  const rec = (points: number) => ({
    played: 38, won: Math.floor(points / 3), drawn: 0, lost: 38 - Math.floor(points / 3),
    goalsFor: points, goalsAgainst: 76 - points, points,
  });
  const placeUser = (state: GameState, rank: number) => {
    const lg = state.leagues[state.clubs[state.playerClub]!.leagueId!]!;
    const others = lg.clubIds.filter((id) => id !== state.playerClub);
    for (const id of lg.clubIds) lg.standings[id] = rec(20);
    for (let i = 0; i < rank - 1; i++) lg.standings[others[i]!] = rec(90 - i * 2); // clubs above the user
    lg.standings[state.playerClub] = rec(90 - (rank - 1) * 2 - 1); // the user, just below them
    lg.titleHistory.push({ seasonYear: 1999 + lg.titleHistory.length, championId: others[0]!, points: 90 });
    return lg;
  };

  it('grace band: finishing one place short of the target does not spiral to the sack', () => {
    const state = cloneState(createNewGame({ seed: 'grace' }));
    state.board.expectedFinish = 1;
    state.board.patience = 50;
    for (let i = 0; i < 8; i++) { placeUser(state, 2); reviewBoard(state, Rng.fromSeed(`g:${i}`)); } // finish 2nd, expected 1
    expect(state.board.dismissed).toBe(false); // a perennial runner-up keeps the job
    expect(state.board.warnings).toBe(0);
  });

  it('the board recalibrates its expectation toward a sustained finishing level', () => {
    const state = cloneState(createNewGame({ seed: 'recalibrate' }));
    state.board.expectedFinish = 1;
    state.board.patience = 60;
    for (let i = 0; i < 6 && !state.board.dismissed; i++) { placeUser(state, 6); reviewBoard(state, Rng.fromSeed(`r:${i}`)); }
    // The Director's drifting bar relaxes; the scenario baseline (read by the manager
    // review) stays put.
    expect(state.board.driftedExpected).toBeGreaterThan(1);
    expect(state.board.expectedFinish).toBe(1);
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

  it('reacts to a star displaced from where reality put him (the world flavour)', () => {
    const state = cloneState(createNewGame({ seed: 'displaced-world' }));
    state.userAggression = 20;
    state.clock = { ...state.clock, date: '2010-07' };
    // A curated rival star reality never had at his current club.
    const star = Object.values(state.players).find(
      (p) => p.curated && p.club != null && p.club !== state.playerClub && p.ability >= 80 && state.clubs[p.club]?.leagueId != null,
    )!;
    star.originClub = star.club === 'real_madrid' ? 'barcelona' : 'real_madrid';
    let found = false;
    for (let i = 0; i < 300 && !found; i++) {
      rollDivergentStoryline(state, Rng.fromSeed(`dw:${i}`));
      found = state.timeline.divergenceLog.some((d) => d.detail.includes(star.name));
    }
    expect(found).toBe(true);
  });

  it('the interactive displaced-star decision is gated on a reshaped world', () => {
    const displaceAtUserClub = (state: GameState) => {
      const star = Object.values(state.players).find(
        (p) => p.club === state.playerClub && p.curated && p.ability >= 80,
      )!;
      star.originClub = state.playerClub === 'arsenal' ? 'liverpool' : 'arsenal';
      return star;
    };
    const hasDisplacedDecision = (state: GameState) =>
      state.pendingDecisions.some((d) => d.id.startsWith('divergence:displaced:'));

    // A lightly-active user (below the reshaped threshold) never triggers it, even
    // with a displaced star in his own squad.
    const low = cloneState(createNewGame({ seed: 'displaced-gate-low' }));
    low.userAggression = 2;
    low.clock = { ...low.clock, date: '2010-07' };
    displaceAtUserClub(low);
    for (let i = 0; i < 150; i++) rollDivergentStoryline(low, Rng.fromSeed(`gl:${i}`));
    expect(hasDisplacedDecision(low)).toBe(false);

    // A user who has genuinely reshaped his squad gets the counterfactual decision.
    const high = cloneState(createNewGame({ seed: 'displaced-gate-high' }));
    high.userAggression = 20;
    high.clock = { ...high.clock, date: '2010-07' };
    displaceAtUserClub(high);
    let pushed = false;
    for (let i = 0; i < 400 && !pushed; i++) {
      rollDivergentStoryline(high, Rng.fromSeed(`gh:${i}`));
      pushed = hasDisplacedDecision(high);
    }
    expect(pushed).toBe(true);
  });

  it('curated players record their origin club at kickoff', () => {
    const state = createNewGame({ seed: 'origin' });
    const curated = Object.values(state.players).filter((p) => p.curated && p.club != null);
    expect(curated.length).toBeGreaterThan(0);
    // At kickoff nobody is displaced: origin equals current club.
    expect(curated.every((p) => p.originClub === p.club)).toBe(true);
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
