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

describe('rival AI — poaching is a logical butterfly (§9a #3)', () => {
  it('a passive user is never poached — no provocation, no bid', () => {
    let s = createNewGame({ seed: 'no-poach' });
    for (let i = 0; i < 20; i++) {
      s = resolveAll(s);
      s = advanceWindow(s).state;
    }
    expect(s.eventLog.some((e) => e.code === 'poach.bid')).toBe(false);
  });

  it('depriving a club of a real signing makes them bid for your player in that position', () => {
    let s = cloneState(createNewGame({ seed: 'butterfly-poach' }));
    // Sign Arsenal's Anelka (a striker) before his real move to Real Madrid.
    s.clubs.man_utd!.finances.transferBudget = 50_000_000;
    executeTransfer(s, { playerId: 'cur_anelka', toClub: 'man_utd', fee: 22_000_000 });
    // Advance until Real Madrid, denied their striker, bid for one of yours.
    let bid = false;
    for (let i = 0; i < 8 && !bid; i++) {
      for (const d of [...s.pendingDecisions]) {
        if (d.id.startsWith('poach:')) bid = true;
        else s = applyDecision(s, d.id, d.choices[0]!.id).state;
      }
      if (bid) break;
      s = advanceWindow(s).state;
    }
    expect(bid).toBe(true);
    const bidDecision = s.pendingDecisions.find((d) => d.id.startsWith('poach:'))!;
    expect(bidDecision.description).toMatch(/denied .* by your move/i);
    expect(bidDecision.choices.map((c) => c.id)).toEqual(['reject', 'accept']);
  });

  it('rejecting a bid unsettles the player (unrest can force a later exit)', () => {
    let s = cloneState(createNewGame({ seed: 'reject-bid' }));
    s.clubs.man_utd!.finances.transferBudget = 50_000_000;
    executeTransfer(s, { playerId: 'cur_anelka', toClub: 'man_utd', fee: 22_000_000 });
    for (let i = 0; i < 8; i++) {
      const bid = s.pendingDecisions.find((d) => d.id.startsWith('poach:'));
      if (bid) {
        const target = bid.id.split(':')[1]!;
        s = applyDecision(s, bid.id, 'reject').state;
        expect(s.players[target]!.agitation).toBeGreaterThan(0);
        return;
      }
      s = resolveAll(s);
      s = advanceWindow(s).state;
    }
    throw new Error('no poach bid fired');
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
