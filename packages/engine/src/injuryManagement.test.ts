import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import type { GameState } from './types.js';

/** Play Inter, resolving Ronaldo's injury-management calls with `policy`. */
function playInter(seed: string, policy: 'manage' | 'rush' | 'ignore') {
  let s: GameState = createNewGame({ scenarioId: 'inter-1998', seed });
  const prone0 = s.players.cur_r9!.injuryProneness;
  let returnCalls = 0;
  for (let i = 0; i < 22 && Number(s.clock.date.slice(0, 4)) < 2005; i++) {
    for (const d of [...s.pendingDecisions]) {
      if (d.id === 'return:cur_r9') {
        returnCalls++;
        if (policy !== 'ignore') s = applyDecision(s, d.id, policy === 'rush' ? 'rush' : 'manage').state;
      }
    }
    s = advanceWindow(s).state;
    if (s.board.dismissed) break;
  }
  const recurrences = s.eventLog.filter((e) => e.code === 'injury.recurrence' && e.data?.playerId === 'cur_r9').length;
  return { prone0, proneEnd: s.players.cur_r9?.injuryProneness ?? 0, returnCalls, recurrences };
}

describe('injury management (fragile-star return + load calls)', () => {
  it('only fragile stars get the calls — Ronaldo does', () => {
    const r = playInter('inter-mgmt', 'manage');
    expect(r.prone0).toBeGreaterThanOrEqual(60); // Ronaldo is glass-bodied
    expect(r.returnCalls).toBeGreaterThan(0); // his knee flares → decisions surface
  });

  it('managing his return carefully makes him less injury-prone over time', () => {
    const managed = playInter('inter-mgmt', 'manage');
    expect(managed.proneEnd).toBeLessThan(managed.prone0); // durability earned
    expect(managed.recurrences).toBe(0); // careful returns never break down
  });

  it('rushing him back is a real gamble — sometimes it breaks down worse', () => {
    let recurrences = 0;
    for (let seed = 0; seed < 20; seed++) recurrences += playInter(`rush-${seed}`, 'rush').recurrences;
    expect(recurrences).toBeGreaterThan(0); // the Ronaldo-2000 catastrophe can recur
  }, 20_000);

  it('load-managing has a cost (games missed) and can be resisted', () => {
    // Across seeds, resting Ronaldo through the run should sometimes stick (he sits
    // out — games missed) and sometimes be refused (a proud star wants to play).
    let rested = 0;
    let resisted = 0;
    for (let seed = 0; seed < 24; seed++) {
      let s = createNewGame({ scenarioId: 'inter-1998', seed: `load-${seed}` });
      for (let i = 0; i < 24 && Number(s.clock.date.slice(0, 4)) < 2005; i++) {
        for (const d of [...s.pendingDecisions]) {
          if (d.id === 'load:cur_r9') {
            const ag = s.players.cur_r9?.agitation ?? 0;
            s = applyDecision(s, d.id, 'rest').state;
            if ((s.players.cur_r9?.agitation ?? 0) > ag) resisted++;
          }
        }
        s = advanceWindow(s).state;
        if (s.board.dismissed) break;
      }
      rested += s.eventLog.filter((e) => e.code === 'load.return' && e.data?.playerId === 'cur_r9').length;
    }
    expect(rested).toBeGreaterThan(0); // he genuinely sits out — the team feels it
    expect(resisted).toBeGreaterThan(0); // and he doesn't always accept the bench
  }, 20_000);

  it('bad management (rushing) costs far more games than careful management', () => {
    // Over full careers, rushing Ronaldo back racks up recurrences → far more time
    // out than managing him. This is the Ronaldo counterfactual made mechanical.
    const monthsOut = (policy: 'rush' | 'manage') => {
      let total = 0;
      for (let seed = 0; seed < 12; seed++) {
        let s = createNewGame({ scenarioId: 'inter-1998', seed: `cmp-${seed}` });
        for (let i = 0; i < 26 && Number(s.clock.date.slice(0, 4)) < 2010; i++) {
          for (const d of [...s.pendingDecisions]) {
            if (d.id === 'return:cur_r9') s = applyDecision(s, d.id, policy === 'rush' ? 'rush' : 'manage').state;
            else if (d.id === 'load:cur_r9' && policy === 'manage') s = applyDecision(s, d.id, 'rest').state;
          }
          s = advanceWindow(s).state;
          if (s.board.dismissed) break;
        }
        total += s.eventLog
          .filter((e) => e.data?.playerId === 'cur_r9' && ['injury.serious', 'injury.real.serious', 'injury.recurrence'].includes(e.code))
          .reduce((a, e) => a + (Number(e.data?.months) || 7), 0);
      }
      return total;
    };
    expect(monthsOut('rush')).toBeGreaterThan(monthsOut('manage') * 1.5);
  }, 20_000);
});
