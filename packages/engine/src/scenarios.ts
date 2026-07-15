/**
 * Built-in scenario seeds — SKELETON ONLY (M1).
 *
 * §1 rule #3 is "data over code": scenarios and clubs ultimately live in
 * versioned JSON data packs (M3). This module is a deliberately small stand-in
 * so the skeleton is runnable and testable now. When the era-1995-2005 pack
 * lands, `createNewGame` will load from @director/data and this file is
 * retired. Kept minimal on purpose — we are not pre-building the data layer.
 */

import type { ClubId, OwnershipModel, ScenarioId, YearMonth } from './types.js';

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
  /** Per-club ownership override (transfer-budget scale): a sugar-daddy buyer
   *  (Abramovich) or a debt-laden club (Arsenal's Emirates build). Defaults to
   *  'sustainable' for anyone unlisted. */
  ownership?: Record<ClubId, OwnershipModel>;
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
  'liverpool-2001': {
    id: 'liverpool-2001',
    name: 'Liverpool — 2001: After the Treble',
    startDate: '2001-07',
    playerClub: 'liverpool',
    mandate: 'Turn the cup treble into a first league title in a decade.',
    boardPatience: 76,
    boardExpectedFinish: 2,
    clubs: [
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
      { id: 'arsenal', name: 'Arsenal', prestige: 84 },
      { id: 'chelsea', name: 'Chelsea', prestige: 74 },
      { id: 'leeds', name: 'Leeds United', prestige: 74 },
      { id: 'newcastle', name: 'Newcastle United', prestige: 70 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 94 },
      { id: 'inter', name: 'Internazionale', prestige: 82 },
      // The continental giants of the era — as real context sides so the European
      // Cup is contested by the whole of Europe, not just the English top four.
      { id: 'bayern', name: 'Bayern München', prestige: 86 },
      { id: 'juventus', name: 'Juventus', prestige: 86 },
      { id: 'barcelona', name: 'Barcelona', prestige: 84 },
      { id: 'milan', name: 'AC Milan', prestige: 84 },
    ],
    contextExtra: [
      { id: 'lens', name: 'RC Lens', prestige: 66 },
      { id: 'lille', name: 'Lille', prestige: 64 },
      { id: 'parma', name: 'Parma', prestige: 68 },
      { id: 'man_city', name: 'Manchester City', prestige: 62 },
      // Mourinho's Porto and Deschamps' Monaco — the 2003–04 finalists — so the
      // one European Cup of the era not won by a giant is anchored, not sim'd.
      { id: 'porto', name: 'FC Porto', prestige: 78 },
      { id: 'monaco', name: 'AS Monaco', prestige: 74 },
    ],
    domesticLeagueId: 'eng-2001',
    // O'Leary's Champions-League semi-finalists were living on borrowed money;
    // the 2001 gamble collapsed into the era's great fire-sale (Ferdinand, Woodgate,
    // Kewell, Robbie Keane all cashed in), so Leeds must decline, not endure.
    distressedClubs: { leeds: 'crisis' },
  },
  'arsenal-2004': {
    id: 'arsenal-2004',
    name: 'Arsenal — 2004: The Invincibles',
    startDate: '2004-07',
    playerClub: 'arsenal',
    mandate: 'Build a dynasty on the unbeaten season — and hold off Chelsea’s billions.',
    boardPatience: 74,
    boardExpectedFinish: 1,
    clubs: [
      { id: 'arsenal', name: 'Arsenal', prestige: 86 },
      { id: 'chelsea', name: 'Chelsea', prestige: 84 },
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 90 },
      { id: 'barcelona', name: 'Barcelona', prestige: 88 },
      { id: 'juventus', name: 'Juventus', prestige: 86 },
      { id: 'milan', name: 'AC Milan', prestige: 86 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 85 },
    ],
    contextExtra: [
      { id: 'marseille', name: 'Olympique de Marseille', prestige: 74 },
      { id: 'psv', name: 'PSV Eindhoven', prestige: 72 },
      { id: 'mallorca', name: 'RCD Mallorca', prestige: 62 },
      { id: 'valencia', name: 'Valencia', prestige: 78 },
      { id: 'spartak_moscow', name: 'Spartak Moscow', prestige: 64 },
      { id: 'monaco', name: 'AS Monaco', prestige: 70 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 74 },
      { id: 'porto', name: 'FC Porto', prestige: 76 },
      { id: 'sporting', name: 'Sporting CP', prestige: 70 },
      { id: 'west_ham', name: 'West Ham United', prestige: 62 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 72 },
      { id: 'zenit', name: 'Zenit St Petersburg', prestige: 66 },
      { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 70 },
      { id: 'lyon', name: 'Olympique Lyonnais', prestige: 74 },
    ],
    // Abramovich bankrolls Chelsea; Arsenal are servicing the Emirates debt.
    ownership: { chelsea: 'sugar-daddy', arsenal: 'debt' },
    domesticLeagueId: 'eng-2004',
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
      { id: 'sporting', name: 'Sporting CP', prestige: 68 },
      { id: 'wigan', name: 'Wigan Athletic', prestige: 52 },
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
  'manchester-united-2003': {
    id: 'manchester-united-2003',
    name: 'Manchester United — 2003: The Ronaldinho Gambit',
    startDate: '2003-07',
    playerClub: 'man_utd',
    mandate: 'Rebuild after Beckham — and beat Barcelona to Ronaldinho.',
    boardPatience: 78,
    boardExpectedFinish: 1,
    // The Premier League is simulated; the continental powers are context, and
    // the counterfactual's source clubs (PSG→Ronaldinho, Sporting→Cristiano,
    // Mallorca→Eto'o, Porto→Deco) must exist for those moves — and their diversions.
    clubs: [
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
      { id: 'arsenal', name: 'Arsenal', prestige: 84 },
      { id: 'chelsea', name: 'Chelsea', prestige: 78 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'barcelona', name: 'Barcelona', prestige: 84 },
      { id: 'milan', name: 'AC Milan', prestige: 88 },
      { id: 'juventus', name: 'Juventus', prestige: 86 },
      { id: 'inter', name: 'Internazionale', prestige: 82 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 86 },
    ],
    contextExtra: [
      { id: 'valencia', name: 'Valencia', prestige: 78 },
      { id: 'porto', name: 'FC Porto', prestige: 78 },
      { id: 'psg', name: 'Paris Saint-Germain', prestige: 68 },
      { id: 'sporting', name: 'Sporting CP', prestige: 70 },
      { id: 'mallorca', name: 'RCD Mallorca', prestige: 62 },
      { id: 'sevilla', name: 'Sevilla', prestige: 72 },
      { id: 'monaco', name: 'AS Monaco', prestige: 72 },
    ],
    // Abramovich has just arrived at Chelsea; United carry no special debt.
    ownership: { chelsea: 'sugar-daddy' },
    domesticLeagueId: 'eng-2003',
  },
  'juventus-1995': {
    id: 'juventus-1995',
    name: 'Juventus — 1995: The Lippi Era',
    startDate: '1995-07',
    playerClub: 'juventus',
    mandate: 'Defend the Scudetto and conquer Europe — the Old Lady’s golden age.',
    boardPatience: 74,
    boardExpectedFinish: 1,
    // Serie A is the simulated domestic league; the elite European clubs are
    // context, and Juve bought/sold with them (Bordeaux→Zidane, Ajax→Davids,
    // Monaco→Trezeguet; Vialli/Ravanelli/Baggio out to England and Milan).
    clubs: [
      { id: 'juventus', name: 'Juventus', prestige: 88 },
      { id: 'milan', name: 'AC Milan', prestige: 90 },
      { id: 'inter', name: 'Internazionale', prestige: 84 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 90 },
      { id: 'barcelona', name: 'Barcelona', prestige: 88 },
      { id: 'ajax', name: 'Ajax', prestige: 82 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 84 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 78 },
    ],
    contextExtra: [
      { id: 'bordeaux', name: 'Bordeaux', prestige: 68 },
      { id: 'monaco', name: 'AS Monaco', prestige: 72 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 74 },
      { id: 'chelsea', name: 'Chelsea', prestige: 70 },
      { id: 'arsenal', name: 'Arsenal', prestige: 74 },
      { id: 'newcastle', name: 'Newcastle United', prestige: 68 },
      { id: 'middlesbrough', name: 'Middlesbrough', prestige: 56 },
      { id: 'dynamo_kyiv', name: 'Dynamo Kyiv', prestige: 66 },
      // The English powers of the era — Ferguson's Double winners and Roy Evans'
      // Liverpool — as context sides so the European Cup they really won can be
      // anchored (Man Utd 1999 & 2008, Liverpool 2005).
      { id: 'man_utd', name: 'Manchester United', prestige: 84 },
      { id: 'liverpool', name: 'Liverpool', prestige: 80 },
      // Porto — so Mourinho's 2004 European Cup is anchored too (Monaco, its
      // beaten finalist, is already in this pack above).
      { id: 'porto', name: 'FC Porto', prestige: 74 },
    ],
    domesticLeagueId: 'ita-1',
  },
  'real-madrid-2000': {
    id: 'real-madrid-2000',
    name: 'Real Madrid — 2000: Galácticos',
    startDate: '2000-07',
    playerClub: 'real_madrid',
    mandate: 'Assemble the Galácticos and conquer Spain and Europe.',
    boardPatience: 68,
    boardExpectedFinish: 1,
    // La Liga is the simulated domestic league; the elite European clubs are
    // context, and Real bought their galácticos from them (Juventus→Zidane,
    // Inter→Ronaldo, United→Beckham, Liverpool→Owen).
    clubs: [
      { id: 'real_madrid', name: 'Real Madrid', prestige: 94 },
      { id: 'barcelona', name: 'Barcelona', prestige: 90 },
      { id: 'juventus', name: 'Juventus', prestige: 90 },
      { id: 'milan', name: 'AC Milan', prestige: 88 },
      { id: 'inter', name: 'Internazionale', prestige: 85 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 88 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'arsenal', name: 'Arsenal', prestige: 82 },
      { id: 'chelsea', name: 'Chelsea', prestige: 76 },
    ],
    contextExtra: [
      { id: 'lazio', name: 'Lazio', prestige: 80 },
      { id: 'roma', name: 'AS Roma', prestige: 80 },
      { id: 'parma', name: 'Parma', prestige: 74 },
      { id: 'porto', name: 'FC Porto', prestige: 74 },
      { id: 'psg', name: 'Paris Saint-Germain', prestige: 70 },
      { id: 'monaco', name: 'AS Monaco', prestige: 72 },
      { id: 'sevilla', name: 'Sevilla', prestige: 70 },
      { id: 'newcastle', name: 'Newcastle United', prestige: 70 },
      { id: 'everton', name: 'Everton', prestige: 64 },
      { id: 'santos', name: 'Santos', prestige: 68 },
      { id: 'river_plate', name: 'River Plate', prestige: 70 },
      { id: 'man_city', name: 'Manchester City', prestige: 60 },
    ],
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
