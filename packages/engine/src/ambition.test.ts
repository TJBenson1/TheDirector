import { describe, it, expect } from 'vitest';
import { isMoneyClub, plausibleCeiling, exceedsPlausibleCeiling, updateClubPressure, applyOwnerFunding, MONEY_PRESTIGE, CEILING_MARGIN } from './ambition.js';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { initialFinances } from './finance.js';
import type { ClubState } from './types.js';

function club(over: Partial<ClubState> & { prestige: number; baseStrength: number }): ClubState {
  const base: ClubState = {
    id: 'c',
    name: 'Club',
    tier: 2,
    prestige: over.prestige,
    squad: [],
    strength: over.strength ?? over.baseStrength,
    baseStrength: over.baseStrength,
    squadStrengthAnchor: over.baseStrength,
    form: 0,
    leagueId: 'l',
    finances: { ownership: 'sustainable', transferBudget: 0, wageBudget: 0, wageBill: 0 },
    pendingCounterPunch: 0,
    grudge: 0,
    financialHealth: 'healthy',
    relegationThreatened: false,
  };
  return { ...base, ...over };
}

describe('M8 ambition — money-club designation', () => {
  it('a high-prestige club is a money club', () => {
    expect(isMoneyClub(club({ prestige: MONEY_PRESTIGE, baseStrength: 80 }))).toBe(true);
    expect(isMoneyClub(club({ prestige: MONEY_PRESTIGE - 1, baseStrength: 70 }))).toBe(false);
  });

  it('sugar-daddy ownership qualifies at any prestige (money talks)', () => {
    const nouveau = club({ prestige: 62, baseStrength: 70, finances: { ownership: 'sugar-daddy', transferBudget: 0, wageBudget: 0, wageBill: 0 } });
    expect(isMoneyClub(nouveau)).toBe(true);
  });
});

describe('M8 ambition — plausible ceiling', () => {
  it('sits a fixed margin above baseStrength', () => {
    expect(plausibleCeiling(club({ prestige: 80, baseStrength: 82 }))).toBe(82 + CEILING_MARGIN);
  });

  it('flags a club that has run above its ceiling, not one within it', () => {
    expect(exceedsPlausibleCeiling(club({ prestige: 80, baseStrength: 80, strength: 80 + CEILING_MARGIN }))).toBe(false);
    expect(exceedsPlausibleCeiling(club({ prestige: 80, baseStrength: 80, strength: 80 + CEILING_MARGIN + 1 }))).toBe(true);
  });
});

describe('M8 ambition — pressure builds under a dominant rival', () => {
  it('a title-expecting club left trophy-less by a dominant champion feels pressure; the user does not', () => {
    const state = createNewGame({ seed: 'pressure', scenarioId: 'man-utd-1999' });
    const league = Object.values(state.leagues)[0]!;
    // Simulate five straight titles for the user (a dominant dynasty).
    for (let y = 0; y < 6; y++) {
      league.titleHistory.push({ seasonYear: 1999 + y, championId: state.playerClub, points: 90 });
    }
    updateClubPressure(state);

    // The user's own club never carries pressure (its ambition is the user).
    expect(state.clubs[state.playerClub]!.pressure).toBeUndefined();

    // A high-prestige rival in the same league feels a dominant champion + drought.
    const rival = league.clubIds
      .map((id) => state.clubs[id]!)
      .find((c) => c.id !== state.playerClub && c.prestige >= 80);
    expect(rival?.pressure).toBeDefined();
    expect(rival!.pressure!.rivalDominance).toBeGreaterThan(0);
  });
});

describe('M8 ambition — Financial Fair Play (post-2011)', () => {
  it('pre-2011 the benefactor tops a war chest up (never cuts) and FFP is silent', () => {
    const state = createNewGame({ seed: 'ffp-pre', scenarioId: 'arsenal-2004' });
    const chelsea = state.clubs['chelsea']!;
    expect(chelsea.finances.ownership).toBe('sugar-daddy');

    const richKitty = 400_000_000; // above any FFP cap
    state.clock.date = '2009-07';
    chelsea.finances.transferBudget = richKitty;
    applyOwnerFunding(state);
    expect(chelsea.finances.transferBudget).toBe(richKitty); // kept — a top-up, not a cut
    expect(state.eventLog.some((e) => e.code === 'ffp.constrained')).toBe(false);
  });

  it('from 2011 FFP clips the war chest to the constrained ×1.4 ceiling and announces itself once', () => {
    const state = createNewGame({ seed: 'ffp-post', scenarioId: 'arsenal-2004' });
    const chelsea = state.clubs['chelsea']!;
    const richKitty = 400_000_000;

    state.clock.date = '2014-07';
    chelsea.finances.transferBudget = richKitty;
    applyOwnerFunding(state);

    // Clipped well below both the war chest and the old ×2.2 blank cheque.
    const uncapped = initialFinances(chelsea.prestige, 2014, 'sugar-daddy', chelsea.finances.wageBill).transferBudget;
    expect(chelsea.finances.transferBudget).toBeLessThan(richKitty);
    expect(chelsea.finances.transferBudget).toBeLessThan(uncapped);

    // The regime-change event fires exactly once, even across repeated summers.
    state.clock.date = '2015-07';
    chelsea.finances.transferBudget = richKitty;
    applyOwnerFunding(state);
    const events = state.eventLog.filter((e) => e.code === 'ffp.constrained' && e.data?.clubId === 'chelsea');
    expect(events).toHaveLength(1);
  });
});

describe('M8 ambition — overrides respect every gate', () => {
  it('overrides never sign a hard-blocked player, only from foreign/context sellers, and never breach a ceiling', () => {
    let totalOverrides = 0;
    // A few careers: with the M9 rubber-band suppressing runaway dominance a
    // single career may see no override, so accumulate across seeds.
    for (const seed of ['gate-a', 'gate-b', 'gate-c', 'gate-d']) {
      let state = createNewGame({ seed, scenarioId: 'man-utd-1999' });
      for (let i = 0; i < 90 && Number(state.clock.date.slice(0, 4)) < 2014; i++) {
        state.pendingDecisions = []; // keep windows flowing (no bot in an engine test)
        state = advanceWindow(state).state;
      }

      for (const o of state.eventLog.filter((e) => e.code === 'ambition.override')) {
        totalOverrides += 1;
        // Foreign/context seller — no domestic cascade (from event data; robust).
        const from = state.clubs[String(o.data!.from)];
        expect(from?.leagueId ?? null).toBeNull();
        // Never a hard-blocked player (checked on survivors; a target signed years
        // ago may since have retired and left state.players).
        const target = state.players[String(o.data!.playerId)];
        if (target) expect(target.resistance.hardBlocks.length).toBe(0);
      }

      // No simulated rival ever ran above its plausible ceiling (no fantasy leaps).
      for (const c of Object.values(state.clubs)) {
        if (c.leagueId === null || c.id === state.playerClub) continue;
        expect(exceedsPlausibleCeiling(c)).toBe(false);
      }
    }
    // The mechanic must actually fire across the batch (else the gates are vacuous).
    expect(totalOverrides).toBeGreaterThan(0);
  }, 20000);
});
