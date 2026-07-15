import { describe, it, expect } from 'vitest';
import { isMoneyClub, plausibleCeiling, exceedsPlausibleCeiling, updateClubPressure, MONEY_PRESTIGE, CEILING_MARGIN } from './ambition.js';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
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

describe('M8 ambition — overrides respect every gate', () => {
  it('a full career never signs a hard-blocked player, only from foreign/context sellers, and never breaches a ceiling', () => {
    let state = createNewGame({ seed: 'gate-run', scenarioId: 'man-utd-1999' });
    for (let i = 0; i < 40 && Number(state.clock.date.slice(0, 4)) < 2014; i++) {
      state = advanceWindow(state).state;
    }

    const overrides = state.eventLog.filter((e) => e.code === 'ambition.override');
    // The mechanic must actually fire over 15 years (else the test is vacuous).
    expect(overrides.length).toBeGreaterThan(0);
    for (const o of overrides) {
      const target = state.players[String(o.data!.playerId)];
      expect(target).toBeDefined();
      // Never a hard-blocked player.
      expect(target!.resistance.hardBlocks.length).toBe(0);
      // Seller was a foreign/context club (no domestic cascade) — still un-simulated.
      const from = state.clubs[String(o.data!.from)];
      expect(from?.leagueId ?? null).toBeNull();
    }

    // No simulated rival ever ran above its plausible ceiling (no fantasy leaps).
    for (const c of Object.values(state.clubs)) {
      if (c.leagueId === null || c.id === state.playerClub) continue;
      expect(exceedsPlausibleCeiling(c)).toBe(false);
    }
  });
});
