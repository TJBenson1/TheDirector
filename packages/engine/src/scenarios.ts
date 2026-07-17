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
  // ── English 1996 cluster (shared curated pack) ───────────────────────────────
  'arsenal-1996': {
    id: 'arsenal-1996',
    name: 'Arsenal — 1996: Arrival of Wenger',
    startDate: '1996-07',
    playerClub: 'arsenal',
    mandate: 'Back the new manager’s revolution and challenge for the title.',
    boardPatience: 75,
    boardExpectedFinish: 3,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'eng-1996',
  },
  'liverpool-1995': {
    id: 'liverpool-1995',
    name: 'Liverpool — 1995: Spice Boys',
    startDate: '1995-07',
    playerClub: 'liverpool',
    mandate: 'Make the swagger count — win the title the flashy, flaky Spice Boys never did.',
    boardPatience: 74,
    boardExpectedFinish: 3,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'eng-1996',
  },
  'chelsea-1996': {
    id: 'chelsea-1996',
    name: 'Chelsea — 1996: Pre-Money',
    startDate: '1996-07',
    playerClub: 'chelsea',
    mandate: 'No billions, no shortcuts — build a top-four side the hard way around Gullit\'s cosmopolitan revolution.',
    boardPatience: 76,
    boardExpectedFinish: 6,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'eng-1996',
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

  // ── Serie A 2006-07 cluster (shared curated pack) ────────────────────────────
  'milan-2007': {
    id: 'milan-2007',
    name: 'AC Milan — 2007: Last Dance Before the Fall',
    startDate: '2006-07',
    playerClub: 'milan',
    mandate: 'Squeeze one more European Cup from the champions — and rebuild the ageing side before the fall.',
    boardPatience: 74,
    boardExpectedFinish: 2,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'ita-2007',
  },
  'juventus-2006': {
    id: 'juventus-2006',
    name: 'Juventus — 2006: Calciopoli — Serie B',
    startDate: '2006-07',
    playerClub: 'juventus',
    mandate: 'Dumped to Serie B and stripped of your stars — win the division at a canter behind the icons who stayed, and rebuild the dynasty.',
    boardPatience: 78,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'ita-b-2006',
  },

  // ── La Liga (Spanish tier) ───────────────────────────────────────────────────
  'barcelona-2003': {
    id: 'barcelona-2003',
    name: 'Barcelona — 2003: Pre-Messi Dawn',
    startDate: '2003-07',
    playerClub: 'barcelona',
    mandate: 'Ronaldinho has arrived — turn the dawn into a dynasty with the golden generation before it fully blooms.',
    boardPatience: 72,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'esp-2003',
  },
  'real-madrid-2006': {
    id: 'real-madrid-2006',
    name: 'Real Madrid — 2006: Post-Galáctico Rebuild',
    startDate: '2006-07',
    playerClub: 'real_madrid',
    mandate: 'End the galáctico circus — rebuild a team that wins Spain and, at last, the Décima.',
    boardPatience: 68,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'esp-2006',
  },

  // ── La Liga 2014-15 ──────────────────────────────────────────────────────────
  'barcelona-2014': {
    id: 'barcelona-2014',
    name: 'Barcelona — 2014: Peak — Don\'t Waste It',
    startDate: '2014-07',
    playerClub: 'barcelona',
    mandate: 'Win everything with the MSN — don\'t waste the greatest team you will ever have.',
    boardPatience: 72,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS_2013,
    domesticLeagueId: 'esp-2014',
  },

  // ── Serie A 1995-96 cluster (shared curated pack) ────────────────────────────
  'milan-1995': {
    id: 'milan-1995',
    name: 'AC Milan — 1995: End of the Dynasty',
    startDate: '1995-07',
    playerClub: 'milan',
    mandate: 'Hold off the decline of the great side and win one more Scudetto — with Weah and Baggio now aboard.',
    boardPatience: 74,
    boardExpectedFinish: 2,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'ita-1995',
  },
  'juventus-1995': {
    id: 'juventus-1995',
    name: 'Juventus — 1995: The Lippi Era',
    startDate: '1995-07',
    playerClub: 'juventus',
    mandate: 'Defend the Scudetto and conquer Europe — turn the young Del Piero into the heir to the throne.',
    boardPatience: 72,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'ita-1995',
  },

  // ── Bundesliga 1997/98 cluster (shared curated pack) ─────────────────────────
  'dortmund-1997': {
    id: 'dortmund-1997',
    name: 'Borussia Dortmund — 1997: Kings of Europe',
    startDate: '1997-07',
    playerClub: 'dortmund',
    mandate: 'You are champions of Europe. Don\'t let the throne slip as the great side begins to age.',
    boardPatience: 74,
    boardExpectedFinish: 2,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'ger-1997',
  },
  'bayern-1998': {
    id: 'bayern-1998',
    name: 'Bayern München — 1998: The Treble Denied',
    startDate: '1998-07',
    playerClub: 'bayern',
    mandate: 'Ninety seconds from the European Cup last time. Now finish the job.',
    boardPatience: 72,
    boardExpectedFinish: 1,
    clubs: ELITE_CLUBS,
    domesticLeagueId: 'ger-1997',
  },

  'spurs-2013': {
    id: 'spurs-2013',
    name: 'Tottenham — 2013: The Bale Money',
    startDate: '2013-07',
    playerClub: 'spurs',
    mandate: 'Reinvest the world-record Bale windfall wisely — and crack the top four at last.',
    boardPatience: 74,
    boardExpectedFinish: 5,
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
  'spurs-2001': {
    id: 'spurs-2001',
    name: 'Tottenham — 2001: Stop the Sol Betrayal',
    startDate: '2001-07',
    playerClub: 'spurs',
    mandate: 'Drag a sleeping giant back into the elite — and keep Sol Campbell from walking across north London on a free.',
    boardPatience: 70,
    boardExpectedFinish: 6,
    clubs: [
      { id: 'spurs', name: 'Tottenham Hotspur', prestige: 68 },
      { id: 'arsenal', name: 'Arsenal', prestige: 84 },
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'chelsea', name: 'Chelsea', prestige: 74 },
      { id: 'leeds', name: 'Leeds United', prestige: 74 },
      { id: 'newcastle', name: 'Newcastle United', prestige: 70 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 94 },
    ],
    contextExtra: [
      { id: 'barcelona', name: 'Barcelona', prestige: 86 },
      { id: 'inter', name: 'Internazionale', prestige: 82 },
      { id: 'lazio', name: 'Lazio', prestige: 74 },
    ],
    domesticLeagueId: 'eng-2001',
  },
  'man-city-2008': {
    id: 'man-city-2008',
    name: 'Manchester City — 2008: The Money Lands',
    startDate: '2008-07',
    playerClub: 'man_city',
    mandate: 'The richest owners in football have just arrived. Turn the blank cheque into trophies — and dethrone the neighbours.',
    boardPatience: 72,
    boardExpectedFinish: 4,
    clubs: [
      { id: 'man_city', name: 'Manchester City', prestige: 66 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'chelsea', name: 'Chelsea', prestige: 86 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'arsenal', name: 'Arsenal', prestige: 82 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'barcelona', name: 'Barcelona', prestige: 90 },
      { id: 'inter', name: 'Internazionale', prestige: 84 },
    ],
    contextExtra: [
      { id: 'spurs', name: 'Tottenham Hotspur', prestige: 72 },
      { id: 'everton', name: 'Everton', prestige: 66 },
      { id: 'milan', name: 'AC Milan', prestige: 82 },
      { id: 'juventus', name: 'Juventus', prestige: 82 },
    ],
    ownership: { man_city: 'sugar-daddy' },
    domesticLeagueId: 'eng-2008',
  },
  'liverpool-2010': {
    id: 'liverpool-2010',
    name: 'Liverpool — 2010: The Ownership Crisis',
    startDate: '2010-07',
    playerClub: 'liverpool',
    mandate: 'Hold the club together through the Hicks & Gillett meltdown, keep Torres and Gerrard, and rebuild for the title.',
    boardPatience: 62,
    boardExpectedFinish: 5,
    clubs: [
      { id: 'liverpool', name: 'Liverpool', prestige: 80 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'chelsea', name: 'Chelsea', prestige: 86 },
      { id: 'man_city', name: 'Manchester City', prestige: 80 },
      { id: 'arsenal', name: 'Arsenal', prestige: 82 },
      { id: 'spurs', name: 'Tottenham Hotspur', prestige: 76 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 94 },
      { id: 'barcelona', name: 'Barcelona', prestige: 94 },
    ],
    contextExtra: [
      { id: 'everton', name: 'Everton', prestige: 66 },
      { id: 'inter', name: 'Internazionale', prestige: 82 },
      { id: 'milan', name: 'AC Milan', prestige: 80 },
      { id: 'juventus', name: 'Juventus', prestige: 80 },
    ],
    // Hicks & Gillett's leveraged buy-out saddled the club with debt and dragged
    // it to the brink before NESV (Fenway) rescued it in October 2010.
    ownership: { liverpool: 'debt' },
    domesticLeagueId: 'eng-2010',
  },
  'inter-2004': {
    id: 'inter-2004',
    name: 'Internazionale — 2004: End the Drought',
    startDate: '2004-07',
    playerClub: 'inter',
    mandate: 'End a 15-year Scudetto drought under Mancini — and build around Adriano before the gift burns out.',
    boardPatience: 70,
    boardExpectedFinish: 2,
    clubs: [
      { id: 'inter', name: 'Internazionale', prestige: 84 },
      { id: 'juventus', name: 'Juventus', prestige: 88 },
      { id: 'milan', name: 'AC Milan', prestige: 88 },
      { id: 'roma', name: 'AS Roma', prestige: 78 },
      { id: 'lazio', name: 'Lazio', prestige: 74 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'barcelona', name: 'Barcelona', prestige: 86 },
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
    ],
    contextExtra: [
      { id: 'arsenal', name: 'Arsenal', prestige: 86 },
      { id: 'chelsea', name: 'Chelsea', prestige: 82 },
      { id: 'fiorentina', name: 'Fiorentina', prestige: 68 },
      { id: 'udinese', name: 'Udinese', prestige: 62 },
    ],
    domesticLeagueId: 'ita-2004',
  },
  'dortmund-2012': {
    id: 'dortmund-2012',
    name: 'Borussia Dortmund — 2012: Hold the Wall',
    startDate: '2012-07',
    playerClub: 'dortmund',
    mandate: 'Defend the double against the Bayern juggernaut — and stop them buying Götze and Lewandowski out from under you.',
    boardPatience: 74,
    boardExpectedFinish: 1,
    clubs: [
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 82 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 92 },
      { id: 'schalke', name: 'Schalke 04', prestige: 74 },
      { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 72 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 94 },
      { id: 'barcelona', name: 'Barcelona', prestige: 93 },
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
      { id: 'man_city', name: 'Manchester City', prestige: 84 },
    ],
    contextExtra: [
      { id: 'chelsea', name: 'Chelsea', prestige: 84 },
      { id: 'juventus', name: 'Juventus', prestige: 82 },
      { id: 'psg', name: 'Paris Saint-Germain', prestige: 80 },
      { id: 'gladbach', name: 'Borussia Mönchengladbach', prestige: 66 },
    ],
    domesticLeagueId: 'ger-2012',
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
