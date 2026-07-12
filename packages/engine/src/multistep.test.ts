import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState, hashState } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { stepForEntry } from './ledgerExec.js';
import { ERA_REALITY, eraForScenario } from './ledger.js';
import { WINDOW_STEPS } from './clock.js';
import type { GameState } from './types.js';

/** State identity ignoring the append-only audit trail: two runs that reach the
 *  same game outcome differ only in how many `window.step` lines they logged. */
function canonical(s: GameState): string {
  const c = cloneState(s);
  c.eventLog = [];
  c.meta = { ...c.meta, nextSeq: 0 };
  return hashState(c);
}

function resolveAll(s: GameState): GameState {
  for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
  return s;
}

/**
 * Advance (batch) until we sit at a window with nothing pending AND the next
 * batch call fully unfolds that upcoming window (lands on the deadline step,
 * i.e. no interrupt broke the run-up). Gives the multi-step tests a clean window
 * to exercise.
 */
function cleanWindowStart(seed: string): GameState {
  let s = createNewGame({ seed });
  for (let i = 0; i < 60; i++) {
    s = resolveAll(s);
    s = advanceWindow(s).state;
    if (s.clock.window !== null && s.pendingDecisions.length === 0) {
      const probe = advanceWindow(s).state;
      if (probe.clock.window !== null && probe.clock.windowStep === WINDOW_STEPS) return s;
    }
  }
  throw new Error(`no clean window boundary for seed ${seed}`);
}

describe('multi-step transfer windows (§3)', () => {
  it('unfolds a window over WINDOW_STEPS sub-steps at a fixed date', () => {
    const start = cleanWindowStart('unfold');
    const s1 = advanceWindow(start, { pausePerStep: true }).state;
    const s2 = advanceWindow(s1, { pausePerStep: true }).state;
    const s3 = advanceWindow(s2, { pausePerStep: true }).state;

    // Steps 1..N all land on the SAME date and window — the calendar does not
    // move while a window is unfolding.
    expect([s1.clock.windowStep, s2.clock.windowStep, s3.clock.windowStep]).toEqual([1, 2, WINDOW_STEPS]);
    expect(s2.clock.date).toBe(s1.clock.date);
    expect(s3.clock.date).toBe(s1.clock.date);
    expect(s1.clock.window).not.toBeNull();
    expect(s3.clock.window).toBe(s1.clock.window);

    // One more advance closes the window and moves the calendar on.
    const s4 = advanceWindow(resolveAll(s3), { pausePerStep: true }).state;
    expect(s4.clock.date).not.toBe(s3.clock.date);
  });

  it('per-step unfolding reaches a byte-identical outcome to a single batch call', () => {
    const start = cleanWindowStart('equiv');
    const batch = advanceWindow(start).state;

    let per = advanceWindow(start, { pausePerStep: true }).state;
    for (let i = 0; i < WINDOW_STEPS && per.clock.windowStep !== batch.clock.windowStep; i++) {
      per = advanceWindow(per, { pausePerStep: true }).state;
    }

    expect(per.clock.date).toBe(batch.clock.date);
    expect(per.clock.windowStep).toBe(batch.clock.windowStep);
    // Same transfers, squads, ledgers, standings, RNG, pending offers — the only
    // difference is the extra window.step log lines (excluded by `canonical`).
    expect(canonical(per)).toBe(canonical(batch));
  });

  it('once-per-window beats fire once, not once per sub-step (pursuit decay)', () => {
    const start = cleanWindowStart('decay');
    const someone = Object.keys(start.players)[0]!;
    start.pursuit[someone] = 50;

    // Unfold exactly one full window (to its deadline step).
    let s = advanceWindow(start, { pausePerStep: true }).state;
    while (s.clock.windowStep >= 1 && s.clock.windowStep < WINDOW_STEPS) {
      s = advanceWindow(s, { pausePerStep: true }).state;
    }
    // Decay is 10/window: fired once ⇒ 40. Firing per step would have over-faded.
    expect(s.pursuit[someone]).toBe(40);
  });

  it('a real-move offer raised early stays open across the window, not lapsed at the next step', () => {
    // Drive per-step until an offer surfaces mid-window, then step forward WITHOUT
    // resolving it: it must still be pending (carried), not silently ignored.
    let s = cleanWindowStart('carry');
    for (let i = 0; i < 40; i++) {
      s = resolveAll(s);
      s = advanceWindow(s, { pausePerStep: true }).state;
      if (s.clock.window !== null && s.clock.windowStep < WINDOW_STEPS && s.pendingDecisions.length > 0) {
        const ids = s.pendingDecisions.map((d) => d.id).sort();
        const next = advanceWindow(s, { pausePerStep: true }).state; // advance a step, do NOT resolve
        expect(next.clock.windowStep).toBe(s.clock.windowStep + 1); // still same window
        const carried = next.pendingDecisions.map((d) => d.id);
        for (const id of ids) expect(carried).toContain(id);
        return;
      }
    }
    throw new Error('no mid-window offer surfaced to test carry-forward');
  });

  it('distributes real moves across the window — not all at one step', () => {
    const pack = ERA_REALITY[eraForScenario('man-utd-1999')]!;
    const steps = new Set(pack.realTransferLedger.map((e) => stepForEntry(e)));
    // Every step (early → mid → deadline) is used by some real move.
    for (let step = 1; step <= WINDOW_STEPS; step++) expect(steps.has(step)).toBe(true);
  });
});
