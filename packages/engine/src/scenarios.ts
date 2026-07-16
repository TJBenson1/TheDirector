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

/** The elite clubs as they stood in 2009 (Florentino's second Galácticos with
 *  Ronaldo/Kaká; Guardiola's treble Barça; Mourinho's Inter; a moneyed City). */
const ELITE_CLUBS_2009: ClubSeed[] = [
  { id: 'real_madrid', name: 'Real Madrid', prestige: 95 },
  { id: 'barcelona', name: 'Barcelona', prestige: 94 },
  { id: 'man_utd', name: 'Manchester United', prestige: 90 },
  { id: 'chelsea', name: 'Chelsea', prestige: 88 },
  { id: 'inter', name: 'Internazionale', prestige: 86 },
  { id: 'liverpool', name: 'Liverpool', prestige: 84 },
  { id: 'arsenal', name: 'Arsenal', prestige: 82 },
  { id: 'milan', name: 'AC Milan', prestige: 82 },
  { id: 'juventus', name: 'Juventus', prestige: 80 },
  { id: 'man_city', name: 'Manchester City', prestige: 76 },
];

export const SCENARIOS: Record<ScenarioId, ScenarioSeed> = {
  'bayern-2009': {
    id: 'bayern-2009',
    name: 'Bayern Munich — 2009: The Van Gaal Reset',
    startDate: '2009-07',
    playerClub: 'bayern',
    mandate: 'Rebuild after the Klinsmann failure: blood the youth, reclaim the Bundesliga and reach the top of Europe.',
    boardPatience: 74,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS_2009,
    contextExtra: [
      { id: 'lyon', name: 'Olympique Lyonnais', prestige: 74 },
      { id: 'sevilla', name: 'Sevilla', prestige: 70 },
      { id: 'villarreal', name: 'Villarreal', prestige: 70 },
      { id: 'porto', name: 'FC Porto', prestige: 74 },
      { id: 'valencia', name: 'Valencia', prestige: 74 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 74 },
      // The era's two European giants: Guardiola's Barça and Mourinho's treble Inter.
      { id: 'barcelona', name: 'Barcelona', prestige: 90 },
      { id: 'inter', name: 'Internazionale', prestige: 84 },
    ],
    // The Abu Dhabi takeover (2008) makes City a sugar-daddy club; FFP reins the
    // spending back in from 2011 (ambition.ts::applyFinancialFairPlay).
    ownership: { man_city: 'sugar-daddy' },
    domesticLeagueId: 'ger-2009',
  },
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
      { id: 'milan', name: 'AC Milan', prestige: 76 },
    ],
    // Sheikh Mansour's City are a moneyed power by 2013 — but already inside the
    // FFP era, so their kitty is the constrained (not blank-cheque) sugar-daddy.
    ownership: { man_city: 'sugar-daddy' },
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
    ],
    contextExtra: [
      { id: 'lens', name: 'RC Lens', prestige: 66 },
      { id: 'lille', name: 'Lille', prestige: 64 },
      { id: 'parma', name: 'Parma', prestige: 68 },
      { id: 'man_city', name: 'Manchester City', prestige: 62 },
      // Porto — the feeder club to pick apart before its 2004 CL win (Deco,
      // Carvalho): prestige 72, a food-chain step-up for the English/Spanish elite.
      { id: 'porto', name: 'FC Porto', prestige: 72 },
      // Barcelona — where Deco really went in 2004 (destination for the sell-off ledger).
      { id: 'barcelona', name: 'Barcelona', prestige: 86 },
      // Fiorentina — heading for the 2002 bankruptcy; a doomed side to raid (Chiesa,
      // Nuno Gomes, a young Adriano) before liquidation scatters them.
      { id: 'fiorentina', name: 'Fiorentina', prestige: 70 },
    ],
    domesticLeagueId: 'eng-2001',
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
      { id: 'inter', name: 'Internazionale', prestige: 82 },
      // Parma — Parmalat has just collapsed; a crisis club to pick apart (Gilardino).
      { id: 'parma', name: 'Parma', prestige: 68 },
      // Zaragoza — Supercopa winners with a young David Villa to prise away before
      // his real 2005 move to Valencia.
      { id: 'zaragoza', name: 'Real Zaragoza', prestige: 66 },
    ],
    // Abramovich bankrolls Chelsea; Arsenal are servicing the Emirates debt.
    ownership: { chelsea: 'sugar-daddy', arsenal: 'debt' },
    // Parmalat's fraud has bankrupted Parma — a distressed seller from kickoff.
    distressedClubs: { parma: 'crisis' },
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
  'inter-1998': {
    id: 'inter-1998',
    name: 'Internazionale — 1998: Il Fenomeno',
    startDate: '1998-07',
    playerClub: 'inter',
    mandate: 'Win the Scudetto with Ronaldo — and, above all, keep him fit.',
    boardPatience: 72,
    boardExpectedFinish: 1,
    // Tier-1 powers: the Serie A giants + the European elite of the day.
    clubs: [
      { id: 'inter', name: 'Internazionale', prestige: 88 },
      { id: 'juventus', name: 'Juventus', prestige: 90 },
      { id: 'milan', name: 'AC Milan', prestige: 88 },
      { id: 'lazio', name: 'Lazio', prestige: 82 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 90 },
      { id: 'barcelona', name: 'Barcelona', prestige: 88 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 86 },
    ],
    domesticLeagueId: 'ita-1',
  },
  'barcelona-1999': {
    id: 'barcelona-1999',
    name: 'Barcelona — 1999: Rivaldo’s Camp Nou',
    startDate: '1999-07',
    playerClub: 'barcelona',
    mandate: 'Rule Spain and win the elusive Champions League — before Figo’s head is turned.',
    boardPatience: 72,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS,
    // Reuses the 1999 curated world + ledger — so the real Figo-to-Madrid saga is
    // yours to sanction or fight. Same era selling clubs as the 1999 pack.
    contextExtra: [
      { id: 'monaco', name: 'AS Monaco', prestige: 74 },
      { id: 'lazio', name: 'Lazio', prestige: 78 },
      { id: 'psv', name: 'PSV Eindhoven', prestige: 72 },
      { id: 'marseille', name: 'Olympique de Marseille', prestige: 72 },
      { id: 'sporting', name: 'Sporting CP', prestige: 68 },
    ],
    domesticLeagueId: 'esp-1',
    distressedClubs: { leeds: 'strained', lazio: 'crisis' },
  },

  // ── More start points in the fully-curated 2013 Premier League world ─────────
  // These reuse the man-utd-2013 league (eng-2013), context and curated squads —
  // a different chair in the same real 2013-14 season.
  'man-city-2013': {
    id: 'man-city-2013',
    name: 'Manchester City — 2013: Sheikh Mansour’s Champions',
    startDate: '2013-07',
    playerClub: 'man_city',
    mandate: 'Turn the oil money into a dynasty — win the title Pellegrini did, and conquer Europe.',
    boardPatience: 76,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS_2013,
    contextExtra: [
      { id: 'benfica', name: 'Benfica', prestige: 76 },
      { id: 'roma', name: 'AS Roma', prestige: 74 },
      { id: 'valencia', name: 'Valencia', prestige: 72 },
      { id: 'ajax', name: 'Ajax', prestige: 70 },
      { id: 'milan', name: 'AC Milan', prestige: 76 },
    ],
    ownership: { man_city: 'sugar-daddy' },
    domesticLeagueId: 'eng-2013',
  },
  'chelsea-2013': {
    id: 'chelsea-2013',
    name: 'Chelsea — 2013: The Special One Returns',
    startDate: '2013-07',
    playerClub: 'chelsea',
    mandate: 'Mourinho is back — rebuild a champion and reclaim the Premier League.',
    boardPatience: 74,
    boardExpectedFinish: 2,
    clubs: ELITE_CLUBS_2013,
    contextExtra: [
      { id: 'benfica', name: 'Benfica', prestige: 76 },
      { id: 'roma', name: 'AS Roma', prestige: 74 },
      { id: 'valencia', name: 'Valencia', prestige: 72 },
      { id: 'ajax', name: 'Ajax', prestige: 70 },
      { id: 'milan', name: 'AC Milan', prestige: 76 },
    ],
    ownership: { man_city: 'sugar-daddy' },
    domesticLeagueId: 'eng-2013',
  },
  'liverpool-2013': {
    id: 'liverpool-2013',
    name: 'Liverpool — 2013: So Close',
    startDate: '2013-07',
    playerClub: 'liverpool',
    mandate: 'End the long wait for the title — ride the Suárez–Sturridge storm and go one better than the slip.',
    boardPatience: 72,
    boardExpectedFinish: 4,
    clubs: ELITE_CLUBS_2013,
    contextExtra: [
      { id: 'benfica', name: 'Benfica', prestige: 76 },
      { id: 'roma', name: 'AS Roma', prestige: 74 },
      { id: 'valencia', name: 'Valencia', prestige: 72 },
      { id: 'ajax', name: 'Ajax', prestige: 70 },
      { id: 'milan', name: 'AC Milan', prestige: 76 },
    ],
    ownership: { man_city: 'sugar-daddy' },
    domesticLeagueId: 'eng-2013',
  },
  'arsenal-2013': {
    id: 'arsenal-2013',
    name: 'Arsenal — 2013: Ending the Drought',
    startDate: '2013-07',
    playerClub: 'arsenal',
    mandate: 'Break the trophy drought — spend the new-stadium money at last and challenge for the title.',
    boardPatience: 74,
    boardExpectedFinish: 4,
    clubs: ELITE_CLUBS_2013,
    contextExtra: [
      { id: 'benfica', name: 'Benfica', prestige: 76 },
      { id: 'roma', name: 'AS Roma', prestige: 74 },
      { id: 'valencia', name: 'Valencia', prestige: 72 },
      { id: 'ajax', name: 'Ajax', prestige: 70 },
      { id: 'milan', name: 'AC Milan', prestige: 76 },
    ],
    ownership: { man_city: 'sugar-daddy' },
    domesticLeagueId: 'eng-2013',
  },

  // ── More start points in the fully-curated 2009 Bundesliga world ─────────────
  // Reuse the bayern-2009 league (ger-2009), context and curated squads.
  'wolfsburg-2009': {
    id: 'wolfsburg-2009',
    name: 'Wolfsburg — 2009: Defending the Miracle',
    startDate: '2009-07',
    playerClub: 'wolfsburg',
    mandate: 'Prove the title was no fluke — keep the Grafite–Džeko fire burning against Bayern’s reset.',
    boardPatience: 70,
    boardExpectedFinish: 3,
    clubs: ELITE_CLUBS_2009,
    contextExtra: [
      { id: 'lyon', name: 'Olympique Lyonnais', prestige: 74 },
      { id: 'sevilla', name: 'Sevilla', prestige: 70 },
      { id: 'villarreal', name: 'Villarreal', prestige: 70 },
      { id: 'porto', name: 'FC Porto', prestige: 74 },
      { id: 'valencia', name: 'Valencia', prestige: 74 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 74 },
      { id: 'barcelona', name: 'Barcelona', prestige: 90 },
      { id: 'inter', name: 'Internazionale', prestige: 84 },
    ],
    ownership: { man_city: 'sugar-daddy' },
    domesticLeagueId: 'ger-2009',
  },
  'dortmund-2009': {
    id: 'dortmund-2009',
    name: 'Borussia Dortmund — 2009: Klopp’s Young Guns',
    startDate: '2009-07',
    playerClub: 'dortmund',
    mandate: 'Build Klopp’s heavy-metal side from the academy up — and keep the giants from raiding it.',
    boardPatience: 72,
    boardExpectedFinish: 6,
    clubs: ELITE_CLUBS_2009,
    contextExtra: [
      { id: 'lyon', name: 'Olympique Lyonnais', prestige: 74 },
      { id: 'sevilla', name: 'Sevilla', prestige: 70 },
      { id: 'villarreal', name: 'Villarreal', prestige: 70 },
      { id: 'porto', name: 'FC Porto', prestige: 74 },
      { id: 'valencia', name: 'Valencia', prestige: 74 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 74 },
      { id: 'barcelona', name: 'Barcelona', prestige: 90 },
      { id: 'inter', name: 'Internazionale', prestige: 84 },
    ],
    ownership: { man_city: 'sugar-daddy' },
    domesticLeagueId: 'ger-2009',
  },

  // ── Newcastle 1995 — Keegan's Entertainers ───────────────────────────────────
  'newcastle-1995': {
    id: 'newcastle-1995',
    name: 'Newcastle United — 1995: The Entertainers',
    startDate: '1995-07',
    playerClub: 'newcastle',
    mandate: 'Make the swagger count — win the title Keegan\'s Entertainers threw away, and don\'t let the 12-point lead slip.',
    boardPatience: 74,
    boardExpectedFinish: 3,
    clubs: ELITE_CLUBS,
    contextExtra: [
      { id: 'blackburn', name: 'Blackburn Rovers', prestige: 74 },
      { id: 'leeds', name: 'Leeds United', prestige: 70 },
    ],
    domesticLeagueId: 'eng-1',
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
