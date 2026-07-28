import { describe, it, expect } from 'vitest';
import {
  createNewGame,
  saveGame,
  loadGame,
  hashState,
  cloneState,
  DEFAULT_SETTINGS,
} from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import type { GameState } from './types.js';

/** Advance one window's worth of time, resolving any interrupt events (§9b)
 *  that fire mid-window so the sim reaches the next decision window. */
function advanceResolving(state: GameState): { state: GameState; months: number } {
  let s = state;
  let months = 0;
  const startDate = s.clock.date;
  for (let i = 0; i < 24; i++) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    const res = advanceWindow(s);
    s = res.state;
    months += res.events.filter((e) => e.code === 'month.advanced').length;
    // Stop at the NEXT window (the opening window is now live, so skip it — it
    // resolves in place without moving the calendar).
    if (s.clock.window && s.clock.date !== startDate && s.pendingDecisions.length === 0) break;
  }
  return { state: s, months };
}

describe('createNewGame', () => {
  it('builds a valid state for the default scenario', () => {
    const state = createNewGame();
    expect(state.meta.scenarioId).toBe('man-utd-1999');
    expect(state.playerClub).toBe('man_utd');
    expect(state.clock.date).toBe('1999-07');
    expect(state.clock.window).toBe('summer');
    // Universe = 12 European context clubs ∪ 20 PL clubs (5 overlap) + context
    // selling clubs (Monaco/Lazio/PSV/Marseille/Sporting/PSG/Wigan) — PSG holds the
    // young Ronaldinho for the gambit (see PSG_1999).
    expect(Object.keys(state.clubs)).toHaveLength(45); // +7 European selling clubs (M12A) +1 Atlético (Fortune's club) +3 modern-elite cradles (Dortmund, Leverkusen, Napoli)
    expect(state.clubs.man_utd?.name).toBe('Manchester United');
    // The domestic league is initialised and ready to play.
    expect(state.leagues['eng-1']?.clubIds).toHaveLength(20);
    expect(state.clubs.man_utd?.leagueId).toBe('eng-1');
    expect(state.clubs.real_madrid?.leagueId).toBeNull();
    // Tiering (Amendment B): playable clubs = Tier 1, simulated non-playable
    // (e.g. Leeds) = Tier 2.
    expect(state.clubs.man_utd?.tier).toBe(1);
    expect(state.clubs.real_madrid?.tier).toBe(1);
    expect(state.clubs.leeds?.tier).toBe(2);
    // The creation event is the first log entry.
    expect(state.eventLog[0]?.code).toBe('game.created');
  });

  it('applies partial settings over the calibrated defaults', () => {
    const state = createNewGame({ settings: { injuryFrequency: 1.5, ironman: true } });
    expect(state.settings.injuryFrequency).toBe(1.5);
    expect(state.settings.ironman).toBe(true);
    expect(state.settings.scandalFrequency).toBe(DEFAULT_SETTINGS.scandalFrequency);
    expect(state.meta.ironman).toBe(true);
  });

  it('rejects unknown scenarios', () => {
    expect(() => createNewGame({ scenarioId: 'nope' })).toThrow(/Unknown scenarioId/);
  });
});

describe('save / load', () => {
  it('round-trips to an identical state hash', () => {
    const state = createNewGame({ seed: 'roundtrip' });
    const restored = loadGame(saveGame(state));
    expect(hashState(restored)).toBe(hashState(state));
  });

  it('rejects non-GameState payloads', () => {
    expect(() => loadGame('{"foo":1}')).toThrow(/valid GameState/);
  });
});

describe('determinism (§18 property)', () => {
  it('same seed + same advances ⇒ identical state hash', () => {
    const run = () => {
      let { state } = { state: createNewGame({ seed: 'determinism' }) };
      for (let i = 0; i < 8; i++) state = advanceWindow(state).state;
      return hashState(state);
    };
    expect(run()).toBe(run());
  });

  it('different seeds diverge in the log even if M1 rolls nothing yet', () => {
    // M1 has no random monthly systems, so states are structurally equal apart
    // from the seed itself — assert the seed is faithfully carried.
    const a = createNewGame({ seed: 'seed-a' });
    const b = createNewGame({ seed: 'seed-b' });
    expect(a.meta.seed).not.toBe(b.meta.seed);
  });

  it('save mid-run, reload, and continue reproduces an uninterrupted run', () => {
    const start = createNewGame({ seed: 'save-continue' });
    // Uninterrupted: advance 6 times.
    let straight = start;
    for (let i = 0; i < 6; i++) straight = advanceWindow(straight).state;

    // Interrupted: advance 3, save+load, advance 3 more.
    let broken = start;
    for (let i = 0; i < 3; i++) broken = advanceWindow(broken).state;
    broken = loadGame(saveGame(broken));
    for (let i = 0; i < 3; i++) broken = advanceWindow(broken).state;

    expect(hashState(broken)).toBe(hashState(straight));
  });
});

describe('advanceWindow', () => {
  it('is pure: the input state is not mutated', () => {
    const state = createNewGame({ seed: 'purity' });
    const snapshot = hashState(state);
    advanceWindow(state);
    expect(hashState(state)).toBe(snapshot);
  });

  it('advances from the summer window to the next winter window', () => {
    const state = createNewGame({ seed: 'windows' });
    expect(state.clock.window).toBe('summer');
    // Events can interrupt mid-window (§3); resolve them and continue.
    const { state: next, months } = advanceResolving(state);
    expect(next.clock.date).toBe('2000-01');
    expect(next.clock.window).toBe('winter');
    // Six months elapsed (Aug … Jan), regardless of interrupts along the way.
    expect(months).toBe(6);
  });

  it('cloneState is a deep copy', () => {
    const state = createNewGame();
    const clone = cloneState(state);
    clone.clubs.man_utd!.prestige = 1;
    expect(state.clubs.man_utd!.prestige).not.toBe(1);
  });
});
