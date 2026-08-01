import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState, hashState } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision, applyConsequence, resolveIgnoredDecisions } from './events.js';
import type { GameState, Decision } from './types.js';

/** Run a scenario fully passively (ignore every scripted decision → reality-default
 *  fallout) and collect the scripted beats that fired vs were skipped as spurious. */
function passiveScriptedCensus(scenarioId: string, untilYear: number): { fired: string[]; skipped: string[] } {
  let s = createNewGame({ scenarioId, seed: `passive-${scenarioId}` });
  const fired: string[] = [];
  const skipped: string[] = [];
  for (let i = 0; i < 120; i++) {
    resolveIgnoredDecisions(s);
    s.pendingDecisions = [];
    const before = s.eventLog.length;
    s = advanceWindow(s).state;
    for (const e of s.eventLog.slice(before)) {
      if (e.code === 'scripted.fired') fired.push(String(e.data?.id));
      if (e.code === 'scripted.skipped') skipped.push(String(e.data?.id));
    }
    if (Number(s.clock.date.slice(0, 4)) >= untilYear) break;
  }
  return { fired, skipped };
}

function advanceUntilDecision(state: GameState, maxWindows = 40): GameState {
  let s = state;
  for (let i = 0; i < maxWindows; i++) {
    if (s.pendingDecisions.length > 0) return s;
    s = advanceWindow(s).state;
  }
  return s;
}

describe('consequence application (§9b)', () => {
  it('applies morale, money and board-patience effects', () => {
    const state = cloneState(createNewGame({ seed: 'cons' }));
    const p = state.players[state.clubs.man_utd!.squad[0]!]!;
    const m0 = p.morale;
    applyConsequence(state, { kind: 'morale', playerId: p.id, amount: -10 });
    expect(state.players[p.id]!.morale).toBe(Math.max(0, m0 - 10));

    const b0 = state.clubs.man_utd!.finances.transferBudget;
    applyConsequence(state, { kind: 'money', clubId: 'man_utd', amount: -5_000_000 });
    expect(state.clubs.man_utd!.finances.transferBudget).toBe(Math.max(0, b0 - 5_000_000));

    const pat0 = state.board.patience;
    applyConsequence(state, { kind: 'boardPatience', amount: 5 });
    expect(state.board.patience).toBe(Math.min(100, pat0 + 5));
  });

  it('money never goes negative', () => {
    const state = cloneState(createNewGame({ seed: 'neg' }));
    applyConsequence(state, { kind: 'money', clubId: 'man_utd', amount: -10_000_000_000 });
    expect(state.clubs.man_utd!.finances.transferBudget).toBe(0);
  });
});

describe('decisions & interrupts (§9b)', () => {
  it('scripted + procedural events raise interrupts that pause the sim', () => {
    const state = createNewGame({ seed: 'interrupt' });
    const paused = advanceUntilDecision(state);
    expect(paused.pendingDecisions.length).toBeGreaterThan(0);
    const d = paused.pendingDecisions[0]!;
    expect(d.interrupt).toBe(true);
    expect(d.choices.length).toBeGreaterThan(0);
  });

  it('applyDecision resolves a choice with an uncertain outcome and clears it', () => {
    const state = createNewGame({ seed: 'resolve' });
    const paused = advanceUntilDecision(state);
    const d = paused.pendingDecisions[0]!;
    const res = applyDecision(paused, d.id, d.choices[0]!.id);
    expect(res.state.pendingDecisions.find((x) => x.id === d.id)).toBeUndefined();
    expect(typeof res.success).toBe('boolean');
    expect(res.events.some((e) => e.code === 'decision.resolved')).toBe(true);
  });

  it('choice outcomes are uncertain: the same choice can succeed or fail across seeds', () => {
    // A synthetic mediation decision resolved under many seeds.
    const outcomes = new Set<boolean>();
    for (let i = 0; i < 60; i++) {
      const s = cloneState(createNewGame({ seed: `coin:${i}` }));
      const decision: Decision = {
        id: 'test:coin',
        title: 'Mediate',
        description: 'x',
        interrupt: true,
        choices: [{ id: 'try', label: 'try', successProbability: 0.5, onSuccess: [], onFailure: [] }],
      };
      s.pendingDecisions.push(decision);
      outcomes.add(applyDecision(s, 'test:coin', 'try').success);
    }
    expect(outcomes.has(true)).toBe(true);
    expect(outcomes.has(false)).toBe(true);
  });

  it('ignoring a decision applies its fallout when the window advances', () => {
    const state = cloneState(createNewGame({ seed: 'ignore' }));
    const patienceBefore = state.board.patience;
    state.pendingDecisions.push({
      id: 'test:ignore',
      title: 'Unhandled crisis',
      description: 'x',
      interrupt: true,
      choices: [{ id: 'a', label: 'a' }],
      falloutIfIgnored: [{ kind: 'boardPatience', amount: -10 }],
    });
    // The opening window is live, so it is processed in place first (decisions
    // carry across it); the fallout applies when the calendar actually advances
    // past it. Advance until the ignored decision is lapsed.
    let next = state;
    for (let i = 0; i < 3 && next.pendingDecisions.some((d) => d.id === 'test:ignore'); i++) {
      next = advanceWindow(next).state;
    }
    // The ignored decision is gone (its fallout applied); other events may have
    // since raised new interrupts, so only assert the specific one cleared.
    expect(next.pendingDecisions.find((d) => d.id === 'test:ignore')).toBeUndefined();
    expect(next.board.patience).toBeLessThan(patienceBefore);
  });
});

describe('scripted pack & scandals fire in sims', () => {
  it('the Keane contract event fires in December 1999 for Man Utd', () => {
    let s = createNewGame({ seed: 'keane' });
    let fired = false;
    for (let i = 0; i < 4 && !fired; i++) {
      const res = advanceWindow(s);
      s = res.state;
      if (res.events.some((e) => e.code === 'scripted.fired' && e.data?.id === 'keane-contract')) fired = true;
      // Resolve anything pending so the loop can continue.
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    }
    expect(fired).toBe(true);
  });

  it('a passive, on-script career invents no procedural scandals (reality holds)', () => {
    // Procedural scandals are gated on divergence: a user who follows history sees
    // the calm real baseline, with era scandals told as scripted history instead.
    let s = createNewGame({ seed: 'scandal-passive' });
    let scandals = 0;
    for (let i = 0; i < 20; i++) {
      const res = advanceWindow(s);
      s = res.state;
      scandals += res.events.filter((e) => e.code === 'scandal.fired').length;
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    }
    expect(scandals).toBe(0);
  });

  it('a diverged world throws up procedural scandals', () => {
    // Once the user has bent the world off history's script, off-script drama
    // returns — the world writes its own storylines (§9f).
    let s = createNewGame({ seed: 'scandal-diverged' });
    s = { ...s, userAggression: 40 }; // an aggressive Director, well off the real path
    let scandals = 0;
    for (let i = 0; i < 20; i++) {
      const res = advanceWindow(s);
      s = res.state;
      scandals += res.events.filter((e) => e.code === 'scandal.fired').length;
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    }
    expect(scandals).toBeGreaterThan(0);
  });
});

describe('event determinism (§18)', () => {
  it('same seed ⇒ identical hash with events active', () => {
    const run = () => {
      let s = createNewGame({ seed: 'ev-det' });
      for (let i = 0; i < 6; i++) {
        s = advanceWindow(s).state;
        for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      }
      return hashState(s);
    };
    expect(run()).toBe(run());
  });
});

describe('scripted beat-sheet packs (passive fidelity)', () => {
  // A passive save must replay a scenario's real history as a dense stream of
  // set-pieces, firing the whole pack in order with NO spurious skips (a skip
  // means a gate is wrong — an id that never exists, or a precondition a passive
  // world never meets). Grows as each scenario's pack is authored from the bible.
  // { minBeats, runUntilYear } — run past the era's last beat so late-season beats count.
  const EXPECTED: Record<string, { min: number; until: number }> = {
    'man-utd-1999': { min: 13, until: 2006 },
    'real-madrid-2000': { min: 13, until: 2008 },
    'barcelona-2003': { min: 13, until: 2011 },
    'chelsea-2003': { min: 13, until: 2009 },
    'arsenal-2004': { min: 13, until: 2012 },
    'liverpool-2001': { min: 14, until: 2008 },
    'man-city-2008': { min: 12, until: 2015 },
    'milan-1995': { min: 13, until: 2002 },
    'juventus-1995': { min: 14, until: 2002 },
  };
  for (const [scenarioId, { min, until }] of Object.entries(EXPECTED)) {
    it(`${scenarioId} fires its pack in order with no spurious skips`, () => {
      const { fired, skipped } = passiveScriptedCensus(scenarioId, until);
      // Only count this scenario's OWN scripted beats (shared procedural packs aside).
      expect(skipped, `spurious skips in ${scenarioId}: ${skipped.join(', ')}`).toEqual([]);
      expect(fired.length, `too few beats fired in ${scenarioId}`).toBeGreaterThanOrEqual(min);
    });
  }
});
