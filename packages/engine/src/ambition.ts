/**
 * M8 — AI club ambition & the "money still talks" constraint
 * (docs/DESIGN-ambition.md).
 *
 * Increment 1 (this file, for now) is pure measurement helpers: which clubs are
 * "big-money", and each club's plausible strength ceiling. They read state and
 * change no simulation, so wiring them into the harness is calibration
 * byte-identical. Increment 2 adds the pressure state and the ambition-override
 * mechanic, which perturb the world (the first non-byte-identical build).
 */

import type { ClubState } from './types.js';

/** Prestige at or above which a club is treated as a wealth power (a "money
 *  club"), independent of ownership. The moneyed-era signal is already carried
 *  in prestige (Man City 60→85 across eras), so this needs no authored list. */
export const MONEY_PRESTIGE = 80;

/** How far above its authored `baseStrength` a club may legitimately climb
 *  (real ledger buys, academy graduates, an unlocked talent, an ambition
 *  override) before the rise reads as a fantasy leap. */
export const CEILING_MARGIN = 8;

/**
 * A "big-money" club — one whose spending power lets it win commensurate with
 * its wallet ("money still talks", DESIGN-internal-friction governing
 * constraint). Sugar-daddy ownership (Abramovich Chelsea, the takeover clubs)
 * qualifies at any prestige; otherwise a high prestige is the wealth proxy.
 * Pure read — no simulation effect.
 */
export function isMoneyClub(club: ClubState): boolean {
  return club.finances.ownership === 'sugar-daddy' || club.prestige >= MONEY_PRESTIGE;
}

/**
 * The strength a club may plausibly reach. `baseStrength` is the authored M2
 * calibration anchor; a club can rise above it with cause, but only so far.
 * Live `strength` exceeding this at era end (without a logged multi-cause chain)
 * is a fantasy leap — the guard the M8 ceiling target holds at 0. Pure read.
 */
export function plausibleCeiling(club: ClubState): number {
  return club.baseStrength + CEILING_MARGIN;
}

/** Does a club's live strength exceed its plausible ceiling? (Fantasy-leap
 *  detection; the user's own club is exempt — its ambition is authored by the
 *  user, so its climb is always "caused".) */
export function exceedsPlausibleCeiling(club: ClubState): boolean {
  return club.strength > plausibleCeiling(club);
}
