import { describe, it, expect } from 'vitest';
import { isMoneyClub, plausibleCeiling, exceedsPlausibleCeiling, MONEY_PRESTIGE, CEILING_MARGIN } from './ambition.js';
import type { ClubState } from './types.js';

function club(over: Partial<ClubState> & { prestige: number; baseStrength: number }): ClubState {
  return {
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
    finances: { ownership: over.finances?.ownership ?? 'sustainable', transferBudget: 0, wageBudget: 0, wageBill: 0 },
    pendingCounterPunch: 0,
    grudge: 0,
    financialHealth: 'healthy',
    relegationThreatened: false,
    ...over,
  } as ClubState;
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
