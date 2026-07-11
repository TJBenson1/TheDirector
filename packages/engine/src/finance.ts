/**
 * Finance & market (§11): market inflation over the 30 years, player
 * valuations, and club budgets. Fees/wages are whole £.
 *
 * Inflation matches the real shape — Bosman aftershocks, TV-deal jumps,
 * oil-money spikes, the post-2016 explosion — so a fee in 2020 dwarfs the same
 * quality in 1995. Anchored to 1995 = ×1.0 and interpolated between waypoints.
 */

import type { ClubFinances, OwnershipModel, PlayerState } from './types.js';

/** Inflation multiplier vs. a 1995 baseline, at real-shaped waypoints. */
const INFLATION_WAYPOINTS: Array<[year: number, factor: number]> = [
  [1995, 1.0],
  [2000, 2.0],
  [2005, 3.2],
  [2010, 4.6],
  [2015, 6.8],
  [2020, 11.0],
  [2025, 14.0],
];

/** Market inflation factor for a given year (linearly interpolated, clamped). */
export function inflationFactor(year: number): number {
  const pts = INFLATION_WAYPOINTS;
  if (year <= pts[0]![0]) return pts[0]![1];
  if (year >= pts[pts.length - 1]![0]) return pts[pts.length - 1]![1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [y0, f0] = pts[i]!;
    const [y1, f1] = pts[i + 1]!;
    if (year >= y0 && year <= y1) {
      const t = (year - y0) / (y1 - y0);
      return f0 + t * (f1 - f0);
    }
  }
  return 1.0;
}

/**
 * Live market value of a player (§11 + DESIGN-context-and-friction §1). Ability
 * drives value exponentially (anchored so a ~90 peak player ≈ £13m at the 1995
 * baseline, ~£150m in the 2020s), then it is modulated by his ACTUAL recent
 * output — a low-minutes or injury-hit season is a real haircut; a standout
 * season a premium. Youth upside, age curve, contract length and inflation all
 * apply. Never a static number independent of the season played.
 */
export function valuePlayer(player: PlayerState, year: number): number {
  const age = year - player.birthYear;

  // Exponential in ability: ~£0.3m at 50, ~£2m at 70, ~£5m at 80, ~£13m at 90
  // (all at the 1995 baseline).
  const abilityValue = 300_000 * Math.exp(0.094 * (player.ability - 50));

  // Youngsters below their ceiling carry a premium for the upside.
  const gap = Math.max(0, player.potentialCeiling - player.ability);
  const youthMult = 1 + (age <= 21 ? gap * 0.05 : age <= 24 ? gap * 0.03 : age <= 27 ? gap * 0.01 : 0);

  // Age curve: peak ~24–29, declining after.
  const ageFactor =
    age <= 21 ? 0.85 : age <= 29 ? 1.0 : age <= 32 ? 0.6 : age <= 34 ? 0.32 : 0.15;

  // A near-expired contract slashes the fee (leverage shifts to the player).
  const yearsLeft = Math.max(0, player.contractUntil - year);
  const contractFactor = yearsLeft >= 3 ? 1.0 : yearsLeft === 2 ? 0.8 : yearsLeft === 1 ? 0.5 : 0.2;

  const raw =
    abilityValue * youthMult * ageFactor * contractFactor * outputFactor(player) * inflationFactor(year);
  return Math.max(50_000, Math.round(raw / 100_000) * 100_000);
}

/**
 * Multiplier from a player's most recent season (~0.45..1.6). Neutral (1.0)
 * before any season is played, so opening-day valuations are pure ability/age.
 * Thereafter, minutes, rating and time lost to injury swing the fee.
 */
export function outputFactor(player: PlayerState): number {
  const s = player.lastSeason;
  if (!s) return 1.0;
  const ratingTerm = 0.55 + 0.09 * s.rating; // rating 6.5 ⇒ ~1.14
  const minutesTerm = 0.6 + 0.4 * s.minutesShare; // benched season ⇒ ~0.64
  const injuryTerm = 1 - 0.4 * (Math.min(10, s.monthsInjured) / 10); // half-year out ⇒ ~0.8
  return Math.max(0.45, Math.min(1.6, ratingTerm * minutesTerm * injuryTerm));
}

/**
 * A sensible annual wage. Anchored so a ~90-rated star earns ~£1.25m/yr at the
 * 1995 baseline (~£2.5m/yr ≈ £48k/wk in 1999), scaling with inflation.
 */
export function suggestWage(player: PlayerState, year: number): number {
  const abilityWage = 100_000 * Math.exp(0.063 * (player.ability - 50));
  const raw = abilityWage * inflationFactor(year);
  return Math.max(40_000, Math.round(raw / 20_000) * 20_000);
}

/** Ownership-model multipliers applied to the prestige-derived base budget. */
const OWNERSHIP_BUDGET_MULT: Record<OwnershipModel, number> = {
  debt: 0.7, // leveraged buyouts drain the kitty
  sustainable: 1.0,
  'sugar-daddy': 2.2, // soft ceilings (FFP scrutiny arrives post-2011, M8)
};

/** Initial finances for a club from its prestige, era and ownership model. */
export function initialFinances(
  prestige: number,
  year: number,
  ownership: OwnershipModel,
  wageBill: number,
): ClubFinances {
  const infl = inflationFactor(year);
  // Prestige → base transfer kitty, exponential and anchored so an elite side
  // (prestige ~92) has ~£15m at the 1995 baseline (~£30m in 1999), a mid club
  // ~£1m, a relegation battler a shoestring.
  const base = 1_630_000 * Math.exp(0.06 * (prestige - 55)) * infl;
  const mult = OWNERSHIP_BUDGET_MULT[ownership];
  const transferBudget = Math.max(0, Math.round((base * mult) / 500_000) * 500_000);
  // Wage ceiling sits above the current wage bill so clubs can operate.
  const wageBudget = Math.max(Math.round(wageBill * 1.25), Math.round(transferBudget * 0.4));
  return { ownership, transferBudget, wageBudget, wageBill };
}
