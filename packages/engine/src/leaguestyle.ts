/**
 * League playing-style model (docs/DESIGN-context-and-friction.md §4).
 *
 * Each league/country has a style profile — physicality, tempo, technical
 * emphasis (all 1..10). Fit between an origin style and a destination style
 * feeds the adaptation engine (§3): a technical La Liga player moving to the
 * physical/quick 2000s Premier League faces a hard jump; Eredivisie →
 * Bundesliga is gentle. Only England is simulated until multi-league lands, but
 * all four playable nations are profiled so foreign→English moves compute a
 * real fit.
 */

import type { ClubId, GameState } from './types.js';

export interface LeagueStyle {
  physicality: number;
  tempo: number;
  technical: number;
}

/** Country/league styles (2000s-calibrated). */
export const LEAGUE_STYLES: Record<string, LeagueStyle> = {
  england: { physicality: 8, tempo: 8, technical: 5 },
  spain: { physicality: 4, tempo: 5, technical: 9 },
  italy: { physicality: 6, tempo: 4, technical: 8 },
  germany: { physicality: 7, tempo: 7, technical: 6 },
  netherlands: { physicality: 5, tempo: 6, technical: 8 },
  generic: { physicality: 6, tempo: 6, technical: 6 },
};

/** Map a club to its country/style key (region-based until leagues are data). */
const CLUB_STYLE_KEY: Record<ClubId, keyof typeof LEAGUE_STYLES> = {
  real_madrid: 'spain',
  barcelona: 'spain',
  juventus: 'italy',
  milan: 'italy',
  inter: 'italy',
  bayern: 'germany',
};

/** A club's league-style key derived from the COUNTRY of its league, so that a
 *  move within one country (Lazio → Milan, Valencia → Real Madrid) is a
 *  same-style move and settles seamlessly — the design's stated rule ("same
 *  country/style ⇒ no adaptation friction"). Previously only the handful of
 *  elite clubs in CLUB_STYLE_KEY and English clubs were keyed, so every other
 *  domestic move read as `generic → italy/spain/…` and wrongly triggered a
 *  "new league" adaptation. League ids are era-suffixed (esp-2003, ita-2004,
 *  ger-1997), so we match on the country prefix, not an exact id. */
function styleKeyForLeague(leagueId: string | null | undefined): keyof typeof LEAGUE_STYLES | null {
  if (!leagueId) return null;
  if (leagueId.startsWith('eng')) return 'england';
  if (leagueId.startsWith('esp') || leagueId.includes('la-liga')) return 'spain';
  if (leagueId.startsWith('ita') || leagueId.includes('serie-a')) return 'italy';
  if (leagueId.startsWith('ger') || leagueId.includes('bundesliga')) return 'germany';
  if (leagueId.startsWith('ned') || leagueId.includes('eredivisie')) return 'netherlands';
  return null;
}

export function styleKeyForClub(state: GameState, clubId: ClubId | null): keyof typeof LEAGUE_STYLES {
  if (!clubId) return 'generic';
  if (CLUB_STYLE_KEY[clubId]) return CLUB_STYLE_KEY[clubId]!;
  return styleKeyForLeague(state.clubs[clubId]?.leagueId) ?? 'generic';
}

export function styleForClub(state: GameState, clubId: ClubId | null): LeagueStyle {
  return LEAGUE_STYLES[styleKeyForClub(state, clubId)]!;
}

/**
 * Style distance 0..1 between two clubs' leagues. 0 = identical style (same
 * country), higher = a bigger stylistic jump. Directionally symmetric.
 */
export function styleDistance(a: LeagueStyle, b: LeagueStyle): number {
  const d =
    Math.abs(a.physicality - b.physicality) +
    Math.abs(a.tempo - b.tempo) +
    Math.abs(a.technical - b.technical);
  return Math.min(1, d / 18); // max component sum ~18 → normalise
}

/**
 * Ongoing performance modifier from playing in a league that doesn't suit a
 * player's profile (§4): a technically gifted, low-pace player underperforms
 * his rating in a physical/fast league even after adapting. Returns ~0.9..1.05.
 */
export function styleSuitability(style: LeagueStyle, technical: number, pace: number): number {
  // Reward technical players in technical leagues, pacey/physical players in
  // physical/fast leagues; penalise mismatches modestly.
  const techMatch = 1 - Math.abs(style.technical - technical) / 20;
  const physMatch = 1 - Math.abs((style.physicality + style.tempo) / 2 - pace) / 20;
  return Math.max(0.88, Math.min(1.05, (techMatch + physMatch) / 2 + 0.5));
}
