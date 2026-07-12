/**
 * Built-in scenario seeds — SKELETON ONLY (M1).
 *
 * §1 rule #3 is "data over code": scenarios and clubs ultimately live in
 * versioned JSON data packs (M3). This module is a deliberately small stand-in
 * so the skeleton is runnable and testable now. When the era-1995-2005 pack
 * lands, `createNewGame` will load from @director/data and this file is
 * retired. Kept minimal on purpose — we are not pre-building the data layer.
 */

import type { ClubId, ScenarioId, YearMonth } from './types.js';

export interface ClubSeed {
  id: ClubId;
  name: string;
  prestige: number;
}

export interface ScenarioSeed {
  id: ScenarioId;
  name: string;
  startDate: YearMonth;
  playerClub: ClubId;
  mandate: string;
  boardPatience: number;
  /** League position the board expects the user to hit (1 = title). */
  boardExpectedFinish: number;
  /** Cross-European context clubs (transfers/scenario). */
  clubs: ClubSeed[];
  /** Extra non-elite context clubs (Tier 3) that hold curated players — the
   *  real selling clubs for era transfers (Monaco, Lazio, PSV, …). */
  contextExtra?: ClubSeed[];
  /** The player's simulated domestic league (§15). */
  domesticLeagueId: string;
  /** Clubs in real financial distress this era (fire-sale sources). */
  distressedClubs?: Record<ClubId, 'strained' | 'crisis'>;
}

/** The 12 elite clubs (§14), with rough late-90s prestige. Refined in M3. */
const ELITE_CLUBS: ClubSeed[] = [
  { id: 'man_utd', name: 'Manchester United', prestige: 92 },
  { id: 'real_madrid', name: 'Real Madrid', prestige: 94 },
  { id: 'barcelona', name: 'Barcelona', prestige: 90 },
  { id: 'bayern', name: 'Bayern Munich', prestige: 89 },
  { id: 'juventus', name: 'Juventus', prestige: 90 },
  { id: 'milan', name: 'AC Milan', prestige: 88 },
  { id: 'inter', name: 'Internazionale', prestige: 85 },
  { id: 'arsenal', name: 'Arsenal', prestige: 82 },
  { id: 'liverpool', name: 'Liverpool', prestige: 83 },
  { id: 'chelsea', name: 'Chelsea', prestige: 78 },
  { id: 'man_city', name: 'Manchester City', prestige: 60 },
  { id: 'spurs', name: 'Tottenham Hotspur', prestige: 72 },
];

/** The elite clubs as they stood in 2013 (City and PSG now moneyed powers). */
const ELITE_CLUBS_2013: ClubSeed[] = [
  { id: 'man_utd', name: 'Manchester United', prestige: 90 },
  { id: 'man_city', name: 'Manchester City', prestige: 85 },
  { id: 'chelsea', name: 'Chelsea', prestige: 86 },
  { id: 'arsenal', name: 'Arsenal', prestige: 82 },
  { id: 'liverpool', name: 'Liverpool', prestige: 82 },
  { id: 'spurs', name: 'Tottenham Hotspur', prestige: 78 },
  { id: 'real_madrid', name: 'Real Madrid', prestige: 94 },
  { id: 'barcelona', name: 'Barcelona', prestige: 93 },
  { id: 'bayern', name: 'Bayern Munich', prestige: 92 },
  { id: 'psg', name: 'Paris Saint-Germain', prestige: 82 },
  { id: 'juventus', name: 'Juventus', prestige: 84 },
];

export const SCENARIOS: Record<ScenarioId, ScenarioSeed> = {
  'man-utd-2013': {
    id: 'man-utd-2013',
    name: 'Manchester United — 2013: After Ferguson',
    startDate: '2013-07',
    playerClub: 'man_utd',
    mandate: 'Defend the title and prove the dynasty outlives Ferguson.',
    boardPatience: 78,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS_2013,
    contextExtra: [
      { id: 'benfica', name: 'Benfica', prestige: 76 },
      { id: 'roma', name: 'AS Roma', prestige: 74 },
      { id: 'valencia', name: 'Valencia', prestige: 72 },
      { id: 'ajax', name: 'Ajax', prestige: 70 },
    ],
    domesticLeagueId: 'eng-2013',
  },
  'man-utd-1999': {
    id: 'man-utd-1999',
    name: 'Manchester United — 1999: After the Treble',
    startDate: '1999-07',
    playerClub: 'man_utd',
    mandate: 'Sustain domestic dominance and win a second European Cup.',
    boardPatience: 80,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS,
    contextExtra: [
      { id: 'monaco', name: 'AS Monaco', prestige: 74 },
      { id: 'lazio', name: 'Lazio', prestige: 78 },
      { id: 'psv', name: 'PSV Eindhoven', prestige: 72 },
      { id: 'marseille', name: 'Olympique de Marseille', prestige: 72 },
    ],
    domesticLeagueId: 'eng-1',
    // Leeds' overreach and Lazio's Cragnotti crash are the era's fire-sales.
    distressedClubs: { leeds: 'strained', lazio: 'crisis' },
  },
  'chelsea-2003': {
    id: 'chelsea-2003',
    name: 'Chelsea — 2003: The Roman Empire',
    startDate: '2003-07',
    playerClub: 'chelsea',
    mandate: 'Turn Abramovich’s billions into the Premier League title — fast.',
    boardPatience: 70,
    boardExpectedFinish: 2,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'eng-1',
  },
  'arsenal-1996': {
    id: 'arsenal-1996',
    name: 'Arsenal — 1996: Arrival of Wenger',
    startDate: '1996-07',
    playerClub: 'arsenal',
    mandate: 'Back the new manager’s revolution and challenge for the title.',
    boardPatience: 75,
    boardExpectedFinish: 3,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'eng-1',
  },
  'real-madrid-2000': {
    id: 'real-madrid-2000',
    name: 'Real Madrid — 2000: Galácticos',
    startDate: '2000-07',
    playerClub: 'real_madrid',
    mandate: 'Assemble the Galácticos and conquer Spain and Europe.',
    boardPatience: 68,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'esp-1',
  },
};

export const DEFAULT_SCENARIO_ID: ScenarioId = 'man-utd-1999';

export function getScenario(scenarioId: ScenarioId): ScenarioSeed {
  const s = SCENARIOS[scenarioId];
  if (!s) {
    const known = Object.keys(SCENARIOS).join(', ');
    throw new Error(`Unknown scenarioId "${scenarioId}". Known: ${known}`);
  }
  return s;
}
