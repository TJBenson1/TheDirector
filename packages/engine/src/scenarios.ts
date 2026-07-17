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

// Shared per-era context club lists. A club's two sibling scenarios (e.g. the
// two Arsenal starts) must inhabit an IDENTICAL world — same Champions League
// field, same era transfer sources — so the reality anchors resolve the same
// way whichever club you pick. These consts are the single source of that world
// for each era; both siblings reference them.

// era-1996: the continental giants (and a 2nd-tier Man City) as context for the
// 1996-97 English packs, with their real 1996 squads.
const ERA_1996_CONTEXT: ClubSeed[] = [
  { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80 },
  { id: 'porto', name: 'FC Porto', prestige: 74 },
  { id: 'monaco', name: 'AS Monaco', prestige: 74 },
  { id: 'ajax', name: 'Ajax', prestige: 80 },
  { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 74 },
  { id: 'dynamo_kyiv', name: 'Dynamo Kyiv', prestige: 70 },
  // European selling clubs (M12A rollout) — the mid-90s talent pipeline.
  { id: 'psv', name: 'PSV Eindhoven', prestige: 74 },
  { id: 'fiorentina', name: 'Fiorentina', prestige: 76 },
  { id: 'lazio', name: 'Lazio', prestige: 76 },
];

// era-2001: the whole of Europe contests the Cup, not just the English top four.
const ERA_2001_CLUBS: ClubSeed[] = [
  { id: 'liverpool', name: 'Liverpool', prestige: 82 },
  { id: 'man_utd', name: 'Manchester United', prestige: 88 },
  { id: 'arsenal', name: 'Arsenal', prestige: 84 },
  { id: 'chelsea', name: 'Chelsea', prestige: 74 },
  { id: 'leeds', name: 'Leeds United', prestige: 74 },
  { id: 'newcastle', name: 'Newcastle United', prestige: 70 },
  { id: 'real_madrid', name: 'Real Madrid', prestige: 94 },
  { id: 'inter', name: 'Internazionale', prestige: 82 },
  { id: 'bayern', name: 'Bayern München', prestige: 86 },
  { id: 'juventus', name: 'Juventus', prestige: 86 },
  { id: 'barcelona', name: 'Barcelona', prestige: 84 },
  { id: 'milan', name: 'AC Milan', prestige: 84 },
];
const ERA_2001_CONTEXT: ClubSeed[] = [
  { id: 'lens', name: 'RC Lens', prestige: 66 },
  { id: 'lille', name: 'Lille', prestige: 64 },
  { id: 'parma', name: 'Parma', prestige: 68 },
  { id: 'man_city', name: 'Manchester City', prestige: 62 },
  // Mourinho's Porto and Deschamps' Monaco — the 2003–04 finalists.
  { id: 'porto', name: 'FC Porto', prestige: 78 },
  { id: 'monaco', name: 'AS Monaco', prestige: 74 },
  // European selling clubs (M12A rollout) — the turn-of-the-millennium pipeline.
  { id: 'ajax', name: 'Ajax', prestige: 76 },
  { id: 'psv', name: 'PSV Eindhoven', prestige: 74 },
  { id: 'feyenoord', name: 'Feyenoord', prestige: 72 },
  { id: 'valencia', name: 'Valencia', prestige: 82 },
  { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 80 },
  { id: 'lazio', name: 'Lazio', prestige: 80 },
  { id: 'roma', name: 'AS Roma', prestige: 82 },
  { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 80 },
  { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80 },
  { id: 'celtic', name: 'Celtic', prestige: 72 },
  { id: 'lyon', name: 'Olympique Lyonnais', prestige: 76 },
];

// era-2003: the continental powers plus the Barça-counterfactual source clubs.
const ERA_2003_CLUBS: ClubSeed[] = [
  { id: 'man_utd', name: 'Manchester United', prestige: 88 },
  { id: 'arsenal', name: 'Arsenal', prestige: 84 },
  { id: 'chelsea', name: 'Chelsea', prestige: 78 },
  { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
  { id: 'barcelona', name: 'Barcelona', prestige: 84 },
  { id: 'milan', name: 'AC Milan', prestige: 88 },
  { id: 'juventus', name: 'Juventus', prestige: 86 },
  { id: 'inter', name: 'Internazionale', prestige: 82 },
  { id: 'bayern', name: 'Bayern Munich', prestige: 86 },
];
const ERA_2003_CONTEXT: ClubSeed[] = [
  { id: 'valencia', name: 'Valencia', prestige: 78 },
  { id: 'porto', name: 'FC Porto', prestige: 78 },
  { id: 'psg', name: 'Paris Saint-Germain', prestige: 68 },
  { id: 'sporting', name: 'Sporting CP', prestige: 70 },
  { id: 'mallorca', name: 'RCD Mallorca', prestige: 62 },
  { id: 'sevilla', name: 'Sevilla', prestige: 72 },
  { id: 'monaco', name: 'AS Monaco', prestige: 72 },
];

// era-2013: the continental context sides for the post-Ferguson Premier League.
const ERA_2013_CONTEXT: ClubSeed[] = [
  { id: 'benfica', name: 'Benfica', prestige: 76 },
  { id: 'roma', name: 'AS Roma', prestige: 76 },
  { id: 'valencia', name: 'Valencia', prestige: 72 },
  { id: 'ajax', name: 'Ajax', prestige: 72 },
  // European selling clubs (M12A rollout) — the mid-2010s talent pipeline.
  { id: 'atletico', name: 'Atlético Madrid', prestige: 84 },
  { id: 'dortmund', name: 'Borussia Dortmund', prestige: 82 },
  { id: 'napoli', name: 'Napoli', prestige: 78 },
  { id: 'porto', name: 'FC Porto', prestige: 78 },
  { id: 'monaco', name: 'AS Monaco', prestige: 76 },
  { id: 'sevilla', name: 'Sevilla', prestige: 76 },
  { id: 'lyon', name: 'Olympique Lyonnais', prestige: 74 },
  { id: 'schalke', name: 'Schalke 04', prestige: 74 },
  { id: 'fiorentina', name: 'Fiorentina', prestige: 74 },
];

// era-serie-a-1995: Serie A is the simulated league; the elite European clubs
// (plus the era's real transfer partners and Cup winners) are context.
const ERA_1995_CLUBS: ClubSeed[] = [
  { id: 'juventus', name: 'Juventus', prestige: 88 },
  { id: 'milan', name: 'AC Milan', prestige: 90 },
  { id: 'inter', name: 'Internazionale', prestige: 84 },
  { id: 'real_madrid', name: 'Real Madrid', prestige: 90 },
  { id: 'barcelona', name: 'Barcelona', prestige: 88 },
  { id: 'ajax', name: 'Ajax', prestige: 82 },
  { id: 'bayern', name: 'Bayern Munich', prestige: 84 },
  { id: 'dortmund', name: 'Borussia Dortmund', prestige: 78 },
];
const ERA_1995_CONTEXT: ClubSeed[] = [
  { id: 'bordeaux', name: 'Bordeaux', prestige: 68 },
  { id: 'monaco', name: 'AS Monaco', prestige: 72 },
  { id: 'atletico', name: 'Atlético Madrid', prestige: 74 },
  { id: 'chelsea', name: 'Chelsea', prestige: 70 },
  { id: 'arsenal', name: 'Arsenal', prestige: 74 },
  { id: 'newcastle', name: 'Newcastle United', prestige: 68 },
  { id: 'middlesbrough', name: 'Middlesbrough', prestige: 56 },
  { id: 'dynamo_kyiv', name: 'Dynamo Kyiv', prestige: 66 },
  // Ferguson's Double winners and Roy Evans' Liverpool — so the European Cups
  // they really won can be anchored (Man Utd 1999 & 2008, Liverpool 2005).
  { id: 'man_utd', name: 'Manchester United', prestige: 84 },
  { id: 'liverpool', name: 'Liverpool', prestige: 80 },
  // Porto — so Mourinho's 2004 European Cup is anchored too.
  { id: 'porto', name: 'FC Porto', prestige: 74 },
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
    contextExtra: ERA_2013_CONTEXT,
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
    clubs: ERA_2001_CLUBS,
    contextExtra: ERA_2001_CONTEXT,
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
    // A title CHALLENGE (top two), not a guaranteed win: once the reality strength
    // arcs make the 2000s Premier League genuinely competitive (Arsenal's
    // Invincibles, Chelsea's billions, City's takeover), even a Ferguson-era United
    // finishes second some years — the board expects contention, not perfection.
    boardExpectedFinish: 2,
    clubs: ELITE_CLUBS,
    contextExtra: [
      { id: 'monaco', name: 'AS Monaco', prestige: 74 },
      { id: 'lazio', name: 'Lazio', prestige: 78 },
      { id: 'psv', name: 'PSV Eindhoven', prestige: 72 },
      { id: 'marseille', name: 'Olympique de Marseille', prestige: 72 },
      { id: 'sporting', name: 'Sporting CP', prestige: 68 },
      // PSG holds the young Ronaldinho — the gambit source club (see PSG_1999).
      { id: 'psg', name: 'Paris Saint-Germain', prestige: 70 },
      { id: 'wigan', name: 'Wigan Athletic', prestige: 52 },
      // European selling clubs (M12A) — the real talent pipeline into the big leagues.
      { id: 'ajax', name: 'Ajax', prestige: 72 },
      { id: 'feyenoord', name: 'Feyenoord', prestige: 66 },
      { id: 'porto', name: 'FC Porto', prestige: 72 },
      { id: 'benfica', name: 'Benfica', prestige: 70 },
      { id: 'celtic', name: 'Celtic', prestige: 68 },
      { id: 'rangers', name: 'Rangers', prestige: 68 },
      { id: 'galatasaray', name: 'Galatasaray', prestige: 66 },
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
    // The full era-2003 world (the Roman Empire is now the era's home start): the
    // continental powers plus the Barça counterfactual's source clubs (PSG→
    // Ronaldinho, Sporting→Cristiano, Mallorca→Eto'o, Porto→Deco) so those real
    // moves — and any diversion of them — can execute.
    clubs: ERA_2003_CLUBS,
    contextExtra: ERA_2003_CONTEXT,
    ownership: { chelsea: 'sugar-daddy' },
    domesticLeagueId: 'eng-2003',
  },
  'arsenal-1996': {
    id: 'arsenal-1996',
    name: 'Arsenal — 1996: Arrival of Wenger',
    startDate: '1996-07',
    playerClub: 'arsenal',
    mandate: 'Back the new manager’s revolution and challenge for the title.',
    boardPatience: 75,
    boardExpectedFinish: 3,
    // English clubs join the 1996-97 Premier League; the continental giants (and a
    // 2nd-tier Man City) sit as context, with their real 1996 squads.
    clubs: ELITE_CLUBS,
    contextExtra: ERA_1996_CONTEXT,
    domesticLeagueId: 'eng-1996',
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
    clubs: ERA_1995_CLUBS,
    contextExtra: ERA_1995_CONTEXT,
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
  // ── Reuse-first sibling starts ──────────────────────────────────────────────
  // Each shares its era's curated pack, league, CL anchors and strength arcs with
  // the club's already-built sibling; only the playable club and the board's
  // expectations change.
  'chelsea-1996': {
    id: 'chelsea-1996',
    name: 'Chelsea — 1996: Pre-Money',
    startDate: '1996-07',
    playerClub: 'chelsea',
    // Gullit's cup side, years before Abramovich. No sugar daddy, no galácticos —
    // just an FA Cup pedigree and a mandate to gatecrash the establishment.
    mandate: 'No billions, no shortcuts — build a top-four side the hard way.',
    boardPatience: 74,
    // Pre-money Chelsea were a mid-table cup team; breaking the top four is the win.
    boardExpectedFinish: 6,
    clubs: ELITE_CLUBS,
    contextExtra: ERA_1996_CONTEXT,
    domesticLeagueId: 'eng-1996',
  },
  'spurs-2001': {
    id: 'spurs-2001',
    name: 'Tottenham Hotspur — 2001: Sleeping Giant',
    startDate: '2001-07',
    playerClub: 'spurs',
    // A grand old name marooned in mid-table while the big four pull away.
    mandate: 'Wake the sleeping giant and drag Spurs back into Europe.',
    boardPatience: 76,
    boardExpectedFinish: 7,
    clubs: ERA_2001_CLUBS,
    contextExtra: ERA_2001_CONTEXT,
    domesticLeagueId: 'eng-2001',
    distressedClubs: { leeds: 'crisis' },
  },
  'spurs-2013': {
    id: 'spurs-2013',
    name: 'Tottenham Hotspur — 2013: The Bale Money',
    startDate: '2013-07',
    playerClub: 'spurs',
    // Bale is about to leave for a world-record fee. Reality blew the windfall on
    // seven signings who mostly flopped; the counterfactual is to spend it well.
    mandate: 'Reinvest the Bale windfall wisely and crack the top four.',
    boardPatience: 74,
    boardExpectedFinish: 5,
    clubs: ELITE_CLUBS_2013,
    contextExtra: ERA_2013_CONTEXT,
    domesticLeagueId: 'eng-2013',
  },
  'milan-1995': {
    id: 'milan-1995',
    name: 'AC Milan — 1995: End of the Dynasty',
    startDate: '1995-07',
    playerClub: 'milan',
    // Capello's champions, but Baresi and the invincibles of Fabio's back four are
    // ageing and the great side is fraying at the edges — squeeze one more era out.
    mandate: 'Hold off the decline and win one more Scudetto for the dynasty.',
    boardPatience: 74,
    boardExpectedFinish: 2,
    clubs: ERA_1995_CLUBS,
    contextExtra: ERA_1995_CONTEXT,
    domesticLeagueId: 'ita-1',
  },
  'inter-1998': {
    id: 'inter-1998',
    name: 'Internazionale — 1998: Il Fenomeno',
    startDate: '1998-07',
    playerClub: 'inter',
    // Ronaldo at his supernatural peak, flanked by Baggio, Zamorano and Djorkaeff —
    // a forward line so overstocked it strangled its own balance. Moratti's millions
    // have bought everything except a Scudetto (Inter's last was 1989). The clock is
    // ticking on Ronaldo's knee.
    mandate: 'Win the Scudetto that Moratti’s millions keep missing — before the knee goes.',
    boardPatience: 70,
    boardExpectedFinish: 2,
    // Serie A is the simulated league; the elite of Europe (full squads) plus a
    // light continental context anchor every real European Cup of 1999–2013.
    clubs: [
      { id: 'inter', name: 'Internazionale', prestige: 85 },
      { id: 'juventus', name: 'Juventus', prestige: 86 },
      { id: 'milan', name: 'AC Milan', prestige: 88 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 94 },
      { id: 'barcelona', name: 'Barcelona', prestige: 88 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 87 },
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
      { id: 'liverpool', name: 'Liverpool', prestige: 80 },
      { id: 'chelsea', name: 'Chelsea', prestige: 76 },
    ],
    contextExtra: [
      { id: 'lazio', name: 'Lazio', prestige: 82 },
      { id: 'roma', name: 'AS Roma', prestige: 78 },
      { id: 'parma', name: 'Parma', prestige: 80 },
      { id: 'fiorentina', name: 'Fiorentina', prestige: 76 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 78 },
      { id: 'porto', name: 'FC Porto', prestige: 76 },
      { id: 'valencia', name: 'Valencia', prestige: 78 },
      { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 72 },
      { id: 'monaco', name: 'AS Monaco', prestige: 74 },
      { id: 'dynamo_kyiv', name: 'Dynamo Kyiv', prestige: 72 },
    ],
    domesticLeagueId: 'ita-1998',
    // Lazio's Cragnotti empire and Parma's Parmalat funding are living on borrowed
    // money — the era's great fire-sales when the crashes come.
    distressedClubs: { lazio: 'strained', parma: 'strained' },
  },
  'milan-2007': {
    id: 'milan-2007',
    name: 'AC Milan — 2007: Last Dance Before the Fall',
    startDate: '2007-07',
    playerClub: 'milan',
    // Champions of Europe, but the oldest side on the continent: Maldini at 39,
    // Cafu at 37, a broken Ronaldo, and only Kaká and the teenage Pato pointing
    // forward. Reality was a slow slide into the 2012 austerity fire-sale — the
    // counterfactual is to rebuild before the fall.
    mandate: 'Squeeze one more European Cup from the champions — and rebuild before the fall.',
    boardPatience: 74,
    boardExpectedFinish: 2,
    // Serie A is the simulated league; the elite of Europe (full squads) plus a
    // light continental context anchor every real European Cup of 2008–2022.
    clubs: [
      { id: 'milan', name: 'AC Milan', prestige: 88 },
      { id: 'inter', name: 'Internazionale', prestige: 86 },
      { id: 'juventus', name: 'Juventus', prestige: 84 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'barcelona', name: 'Barcelona', prestige: 92 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 90 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'chelsea', name: 'Chelsea', prestige: 88 },
    ],
    contextExtra: [
      { id: 'roma', name: 'AS Roma', prestige: 82 },
      { id: 'fiorentina', name: 'Fiorentina', prestige: 76 },
      { id: 'napoli', name: 'Napoli', prestige: 70 },
      { id: 'lazio', name: 'Lazio', prestige: 74 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 82 },
      { id: 'porto', name: 'FC Porto', prestige: 78 },
    ],
    domesticLeagueId: 'ita-2007',
  },
  'inter-2004': {
    id: 'inter-2004',
    name: 'Internazionale — 2004: Pre-Calciopoli Positioning',
    startDate: '2004-07',
    playerClub: 'inter',
    // Mancini's Inter, Adriano at his terrifying peak — but perennial nearly-men,
    // beaten to the Scudetto by Juventus and Milan. A reckoning is coming: the 2006
    // Calciopoli scandal will strip and relegate Juventus and tip the balance to
    // Inter. Be built and ready — or win it on merit before the scandal breaks.
    mandate: 'End the wait for the Scudetto — position to seize it when the balance tips.',
    boardPatience: 70,
    boardExpectedFinish: 2,
    // Serie A is the simulated league; the elite of Europe (full squads) plus a
    // light continental context anchor every real European Cup of 2005–2019.
    clubs: [
      { id: 'inter', name: 'Internazionale', prestige: 85 },
      { id: 'juventus', name: 'Juventus', prestige: 86 },
      { id: 'milan', name: 'AC Milan', prestige: 88 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 93 },
      { id: 'barcelona', name: 'Barcelona', prestige: 90 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 88 },
      { id: 'man_utd', name: 'Manchester United', prestige: 89 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'chelsea', name: 'Chelsea', prestige: 86 },
    ],
    contextExtra: [
      { id: 'roma', name: 'AS Roma', prestige: 80 },
      { id: 'fiorentina', name: 'Fiorentina', prestige: 68 },
      { id: 'lazio', name: 'Lazio', prestige: 72 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 78 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 78 },
      { id: 'valencia', name: 'Valencia', prestige: 82 },
    ],
    domesticLeagueId: 'ita-2004',
  },
  'juventus-2006': {
    id: 'juventus-2006',
    name: 'Juventus — 2006: Calciopoli — Serie B',
    startDate: '2006-07',
    playerClub: 'juventus',
    // Stripped of two Scudetti and relegated in disgrace. The mercenaries fled, but
    // the legends stayed — Buffon, Del Piero, Nedvěd, Trezeguet — to drag the Old
    // Lady out of Serie B. Reality: promotion at the first attempt, then a dynasty.
    mandate: 'Win Serie B, return to the top flight, and rebuild the Old Lady into a dynasty.',
    boardPatience: 80,
    boardExpectedFinish: 2,
    // Year one is Serie B (procedural minnows); on promotion the league becomes the
    // late-2000s Serie A. The elite of Europe (full squads, reused from the 2007
    // pack) anchor every real European Cup of 2007–2021; the Serie A clubs sit as
    // context until Juventus's promotion swaps them into the top flight.
    clubs: [
      { id: 'juventus', name: 'Juventus', prestige: 80 },
      { id: 'inter', name: 'Internazionale', prestige: 86 },
      { id: 'milan', name: 'AC Milan', prestige: 86 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'barcelona', name: 'Barcelona', prestige: 92 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 90 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'chelsea', name: 'Chelsea', prestige: 88 },
    ],
    contextExtra: [
      // Serie A clubs (curated + procedural) that Juventus rejoin on promotion.
      { id: 'roma', name: 'AS Roma', prestige: 82 },
      { id: 'napoli', name: 'Napoli', prestige: 70 },
      { id: 'lazio', name: 'Lazio', prestige: 74 },
      { id: 'fiorentina', name: 'Fiorentina', prestige: 76 },
      { id: 'sampdoria', name: 'Sampdoria', prestige: 64 },
      { id: 'udinese', name: 'Udinese', prestige: 64 },
      { id: 'genoa', name: 'Genoa', prestige: 60 },
      { id: 'atalanta', name: 'Atalanta', prestige: 58 },
      { id: 'palermo', name: 'Palermo', prestige: 58 },
      { id: 'siena', name: 'Siena', prestige: 48 },
      { id: 'cagliari', name: 'Cagliari', prestige: 52 },
      { id: 'torino', name: 'Torino', prestige: 56 },
      { id: 'reggina', name: 'Reggina', prestige: 46 },
      { id: 'catania', name: 'Catania', prestige: 46 },
      { id: 'empoli', name: 'Empoli', prestige: 46 },
      { id: 'parma', name: 'Parma', prestige: 58 },
      { id: 'livorno', name: 'Livorno', prestige: 46 },
      // Continental context for the reality-anchored Champions League.
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 82 },
      { id: 'porto', name: 'FC Porto', prestige: 78 },
    ],
    domesticLeagueId: 'ita-b-2006',
  },
  'barcelona-2003': {
    id: 'barcelona-2003',
    name: 'Barcelona — 2003: Pre-Messi Dawn',
    startDate: '2003-07',
    playerClub: 'barcelona',
    // Rijkaard and Ronaldinho have just arrived; the home-grown spine (Xavi, Puyol,
    // a teenage Iniesta) is in place, and a sixteen-year-old Messi is in the academy.
    // Reality: Eto'o and Deco arrive in 2004, the 2006 European Cup and the Pep
    // dynasty follow. Build the golden age — or waste the dawn.
    mandate: 'Turn the dawn into a dynasty — win Spain and Europe with the golden generation.',
    boardPatience: 72,
    boardExpectedFinish: 1,
    // La Liga is the simulated league; the elite of Europe (full squads) plus a
    // light continental context anchor every real European Cup of 2004–2018.
    clubs: [
      { id: 'barcelona', name: 'Barcelona', prestige: 88 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'man_utd', name: 'Manchester United', prestige: 89 },
      { id: 'milan', name: 'AC Milan', prestige: 90 },
      { id: 'inter', name: 'Internazionale', prestige: 85 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 88 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'chelsea', name: 'Chelsea', prestige: 84 },
      { id: 'juventus', name: 'Juventus', prestige: 88 },
    ],
    contextExtra: [
      { id: 'valencia', name: 'Valencia', prestige: 82 },
      { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 78 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 72 },
      { id: 'sevilla', name: 'Sevilla', prestige: 66 },
      { id: 'mallorca', name: 'RCD Mallorca', prestige: 58 },
      { id: 'porto', name: 'FC Porto', prestige: 78 },
      { id: 'monaco', name: 'AS Monaco', prestige: 74 },
    ],
    // Abramovich has just arrived at Chelsea.
    ownership: { chelsea: 'sugar-daddy' },
    domesticLeagueId: 'esp-2003',
  },
  'real-madrid-2006': {
    id: 'real-madrid-2006',
    name: 'Real Madrid — 2006: Post-Galáctico Rebuild',
    startDate: '2006-07',
    playerClub: 'real_madrid',
    // Florentino has resigned, the galáctico project is over, Capello is back.
    // Cannavaro and Van Nistelrooy arrive, Zidane has retired, Ronaldo is bound for
    // Milan, Beckham for LA. Reality: the title returns in 2007, then a new
    // galáctico wave (Cristiano, Kaká) in 2009. Rebuild cleaner, without waste.
    mandate: 'End the galáctico circus — rebuild a team that wins Spain and the Décima.',
    boardPatience: 66,
    boardExpectedFinish: 1,
    // La Liga is the simulated league; the elite of Europe (full squads) plus a
    // light continental context anchor every real European Cup of 2007–2022 —
    // including Real's own mid-2010s dynasty.
    clubs: [
      { id: 'real_madrid', name: 'Real Madrid', prestige: 90 },
      { id: 'barcelona', name: 'Barcelona', prestige: 90 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'milan', name: 'AC Milan', prestige: 88 },
      { id: 'inter', name: 'Internazionale', prestige: 86 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 90 },
      { id: 'liverpool', name: 'Liverpool', prestige: 84 },
      { id: 'chelsea', name: 'Chelsea', prestige: 88 },
      { id: 'juventus', name: 'Juventus', prestige: 84 },
    ],
    contextExtra: [
      { id: 'sevilla', name: 'Sevilla', prestige: 74 },
      { id: 'valencia', name: 'Valencia', prestige: 78 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 74 },
      { id: 'villarreal', name: 'Villarreal', prestige: 68 },
      { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 66 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80 },
      { id: 'porto', name: 'FC Porto', prestige: 78 },
    ],
    domesticLeagueId: 'esp-2006',
  },
  'barcelona-2014': {
    id: 'barcelona-2014',
    name: 'Barcelona — 2014: Peak — Don’t Waste It',
    startDate: '2014-07',
    playerClub: 'barcelona',
    // Luis Enrique has arrived, Suárez signs, and MSN — Messi, Suárez, Neymar — is
    // about to become the most devastating front three in history. Reality: the
    // 2015 treble, then a slow squander (Neymar to PSG in 2017, the money wasted).
    // Keep the golden generation together and do not waste the peak.
    mandate: 'Win everything with MSN — and don’t waste the greatest team you’ll ever have.',
    boardPatience: 70,
    boardExpectedFinish: 1,
    // La Liga is the simulated league; the modern elite of Europe (full squads)
    // plus a light context anchor every real European Cup of 2015–2025.
    clubs: [
      { id: 'barcelona', name: 'Barcelona', prestige: 92 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 92 },
      { id: 'man_city', name: 'Manchester City', prestige: 88 },
      { id: 'chelsea', name: 'Chelsea', prestige: 88 },
      { id: 'juventus', name: 'Juventus', prestige: 86 },
      { id: 'liverpool', name: 'Liverpool', prestige: 84 },
      { id: 'inter', name: 'Internazionale', prestige: 80 },
    ],
    contextExtra: [
      { id: 'atletico', name: 'Atlético Madrid', prestige: 82 },
      { id: 'sevilla', name: 'Sevilla', prestige: 72 },
      { id: 'valencia', name: 'Valencia', prestige: 72 },
      { id: 'psg', name: 'Paris Saint-Germain', prestige: 84 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 82 },
    ],
    domesticLeagueId: 'esp-2014',
  },
  'dortmund-2012': {
    id: 'dortmund-2012',
    name: 'Borussia Dortmund — 2012: Defend the Peak',
    startDate: '2012-07',
    playerClub: 'dortmund',
    // Back-to-back champions, about to reach the 2013 Wembley final — the best young
    // side in Europe (Hummels, Götze, Reus, Gündoğan, Lewandowski). But the vultures
    // circle: Götze's Bayern move is agreed mid-season, and Lewandowski, Hummels and
    // Gündoğan will follow. Hold the golden generation together before it is
    // dismantled.
    mandate: 'Hold the golden generation together — and turn the Wembley run into a European Cup.',
    boardPatience: 74,
    boardExpectedFinish: 2,
    // The Bundesliga is the simulated league; the elite of Europe (full squads)
    // plus a light context anchor every real European Cup of 2013–2025.
    clubs: [
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 84 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 92 },
      { id: 'barcelona', name: 'Barcelona', prestige: 92 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
      { id: 'chelsea', name: 'Chelsea', prestige: 88 },
      { id: 'man_city', name: 'Manchester City', prestige: 88 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'inter', name: 'Internazionale', prestige: 80 },
      { id: 'juventus', name: 'Juventus', prestige: 86 },
    ],
    contextExtra: [
      { id: 'atletico', name: 'Atlético Madrid', prestige: 84 },
      { id: 'psg', name: 'Paris Saint-Germain', prestige: 84 },
      { id: 'schalke', name: 'Schalke 04', prestige: 72 },
      { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 72 },
      { id: 'wolfsburg', name: 'VfL Wolfsburg', prestige: 62 },
    ],
    domesticLeagueId: 'ger-2012',
  },
  'bayern-2009': {
    id: 'bayern-2009',
    name: 'Bayern München — 2009: Van Gaal Reset',
    startDate: '2009-07',
    playerClub: 'bayern',
    // Van Gaal has arrived to rebuild: Robben and Gómez signed, a teenage Müller
    // and Badstuber breaking through, Schweinsteiger remade in midfield. Reality:
    // the double, a lost 2010 final to Inter, and the dynasty's foundation — but
    // Klopp's Dortmund are about to take the next two titles.
    mandate: 'Complete the reset — fend off Klopp’s Dortmund and finish the job in Europe.',
    boardPatience: 72,
    boardExpectedFinish: 1,
    // The Bundesliga is the simulated league; the elite of Europe (full squads,
    // reused from the 2010 pack) anchor every real European Cup of 2010–2025.
    clubs: [
      { id: 'bayern', name: 'Bayern Munich', prestige: 90 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 74 },
      { id: 'barcelona', name: 'Barcelona', prestige: 92 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'chelsea', name: 'Chelsea', prestige: 88 },
      { id: 'man_city', name: 'Manchester City', prestige: 82 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'inter', name: 'Internazionale', prestige: 86 },
      { id: 'juventus', name: 'Juventus', prestige: 82 },
    ],
    contextExtra: [
      { id: 'schalke', name: 'Schalke 04', prestige: 70 },
      { id: 'werder', name: 'Werder Bremen', prestige: 68 },
      { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 70 },
      { id: 'wolfsburg', name: 'VfL Wolfsburg', prestige: 64 },
      { id: 'hamburg', name: 'Hamburger SV', prestige: 66 },
    ],
    domesticLeagueId: 'ger-2009',
  },
  'man-city-2008': {
    id: 'man-city-2008',
    name: 'Manchester City — 2008: The Takeover',
    startDate: '2008-07',
    playerClub: 'man_city',
    // In September 2008 the Abu Dhabi money lands, and a mid-table club with Richard
    // Dunne and Stephen Ireland is suddenly the richest in the world. Robinho arrives
    // as a statement. Reality: years of waste, then Tévez, Silva, Yaya and the 2012
    // title. Build the superclub faster — and don't squander the billions.
    mandate: 'Turn the billions into titles — build a superclub without wasting a decade.',
    boardPatience: 78,
    boardExpectedFinish: 5,
    // The Premier League is the simulated league; the continental elite (full
    // squads) anchor every real European Cup of 2009–2025. City are bankrolled by
    // the takeover — the money is there; the challenge is spending it well.
    ownership: { man_city: 'sugar-daddy' },
    clubs: [
      { id: 'man_city', name: 'Manchester City', prestige: 62 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'chelsea', name: 'Chelsea', prestige: 86 },
      { id: 'arsenal', name: 'Arsenal', prestige: 80 },
      { id: 'barcelona', name: 'Barcelona', prestige: 90 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 88 },
      { id: 'inter', name: 'Internazionale', prestige: 86 },
      { id: 'juventus', name: 'Juventus', prestige: 82 },
    ],
    contextExtra: [
      { id: 'spurs', name: 'Tottenham Hotspur', prestige: 70 },
      { id: 'everton', name: 'Everton', prestige: 64 },
      { id: 'aston_villa', name: 'Aston Villa', prestige: 62 },
      // European selling clubs (M12A rollout) — the takeover-era talent pipeline.
      { id: 'ajax', name: 'Ajax', prestige: 74 },
      { id: 'psv', name: 'PSV Eindhoven', prestige: 74 },
      { id: 'porto', name: 'FC Porto', prestige: 80 },
      { id: 'benfica', name: 'Benfica', prestige: 78 },
      { id: 'sporting', name: 'Sporting CP', prestige: 74 },
      { id: 'lyon', name: 'Olympique Lyonnais', prestige: 82 },
      { id: 'marseille', name: 'Olympique de Marseille', prestige: 76 },
      { id: 'sevilla', name: 'Sevilla', prestige: 78 },
      { id: 'villarreal', name: 'Villarreal', prestige: 78 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 78 },
      { id: 'roma', name: 'AS Roma', prestige: 80 },
      { id: 'fiorentina', name: 'Fiorentina', prestige: 74 },
      { id: 'werder', name: 'Werder Bremen', prestige: 74 },
    ],
    domesticLeagueId: 'eng-2008',
  },
  'liverpool-2010': {
    id: 'liverpool-2010',
    name: 'Liverpool — 2010: FSG Reset',
    startDate: '2010-07',
    playerClub: 'liverpool',
    // The Hicks & Gillett era ends in a fire sale and a High Court battle; in
    // October 2010 Fenway Sports Group take over a club on the brink. Torres forces
    // his way to Chelsea in January, Suárez and Carroll arrive, and the long climb
    // begins — Dalglish, Rodgers, the 2014 near-miss, then Klopp, 2019 and 2020.
    // Reality: nine years to a European Cup, ten to the title. Do it faster.
    mandate: 'Turn the reset into a return to the summit — faster, and without the false dawns.',
    boardPatience: 74,
    boardExpectedFinish: 5,
    // The 2010-11 Premier League is the simulated league; the continental elite
    // (full squads) anchor every real European Cup of 2011–2025.
    clubs: [
      { id: 'liverpool', name: 'Liverpool', prestige: 80 },
      { id: 'man_utd', name: 'Manchester United', prestige: 90 },
      { id: 'chelsea', name: 'Chelsea', prestige: 86 },
      { id: 'man_city', name: 'Manchester City', prestige: 74 },
      { id: 'arsenal', name: 'Arsenal', prestige: 80 },
      { id: 'barcelona', name: 'Barcelona', prestige: 92 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 92 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 88 },
      { id: 'inter', name: 'Internazionale', prestige: 84 },
      { id: 'juventus', name: 'Juventus', prestige: 82 },
    ],
    contextExtra: [
      { id: 'spurs', name: 'Tottenham Hotspur', prestige: 72 },
      { id: 'everton', name: 'Everton', prestige: 64 },
      { id: 'fulham', name: 'Fulham', prestige: 54 },
      // European selling clubs (M12A rollout) — the 2010s talent pipeline.
      { id: 'ajax', name: 'Ajax', prestige: 74 },
      { id: 'psv', name: 'PSV Eindhoven', prestige: 72 },
      { id: 'porto', name: 'FC Porto', prestige: 80 },
      { id: 'benfica', name: 'Benfica', prestige: 78 },
      { id: 'lyon', name: 'Olympique Lyonnais', prestige: 78 },
      { id: 'marseille', name: 'Olympique de Marseille', prestige: 76 },
      { id: 'sevilla', name: 'Sevilla', prestige: 76 },
      { id: 'villarreal', name: 'Villarreal', prestige: 74 },
      { id: 'atletico', name: 'Atlético Madrid', prestige: 80 },
      { id: 'roma', name: 'AS Roma', prestige: 78 },
      { id: 'napoli', name: 'Napoli', prestige: 76 },
    ],
    domesticLeagueId: 'eng-2010',
  },
  'liverpool-1995': {
    id: 'liverpool-1995',
    name: 'Liverpool — 1995: Spice Boys',
    startDate: '1995-07',
    playerClub: 'liverpool',
    // Roy Evans's Liverpool are the most gifted side in England — Fowler and
    // Collymore up front, McManaman and a young Redknapp behind — and the most
    // frustrating: brilliant one week, beaten in white Wembley suits the next. The
    // 1995-96 title goes to Ferguson's kids as Keegan's Newcastle collapse. Reality:
    // near misses, then a slow fade and a 30-year wait. Make the talent count.
    mandate: 'Make the swagger count — win the title the real Spice Boys never did.',
    boardPatience: 76,
    boardExpectedFinish: 3,
    // The 1995-96 Premier League is the simulated league; the continental elite
    // (full squads) anchor every real European Cup of 1996–2010.
    clubs: [
      { id: 'liverpool', name: 'Liverpool', prestige: 82 },
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
      { id: 'newcastle', name: 'Newcastle United', prestige: 76 },
      { id: 'arsenal', name: 'Arsenal', prestige: 78 },
      { id: 'blackburn', name: 'Blackburn Rovers', prestige: 68 },
      { id: 'barcelona', name: 'Barcelona', prestige: 88 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 90 },
      { id: 'bayern', name: 'Bayern Munich', prestige: 86 },
      { id: 'juventus', name: 'Juventus', prestige: 90 },
      { id: 'milan', name: 'AC Milan', prestige: 90 },
      { id: 'inter', name: 'Internazionale', prestige: 84 },
    ],
    contextExtra: [
      { id: 'chelsea', name: 'Chelsea', prestige: 72 },
      { id: 'spurs', name: 'Tottenham Hotspur', prestige: 70 },
      { id: 'man_city', name: 'Manchester City', prestige: 60 },
      // European selling clubs (M12A rollout) — the mid-90s talent pipeline.
      { id: 'ajax', name: 'Ajax', prestige: 80 },
      { id: 'psv', name: 'PSV Eindhoven', prestige: 74 },
      { id: 'porto', name: 'FC Porto', prestige: 74 },
      { id: 'monaco', name: 'AS Monaco', prestige: 74 },
      { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 74 },
      { id: 'fiorentina', name: 'Fiorentina', prestige: 76 },
      { id: 'lazio', name: 'Lazio', prestige: 76 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80 },
    ],
    domesticLeagueId: 'eng-1995',
  },
  'dortmund-1997': {
    id: 'dortmund-1997',
    name: 'Borussia Dortmund — 1997: Kings of Europe',
    startDate: '1997-07',
    playerClub: 'dortmund',
    // Riedle's brace and Ricken's audacious chip beat Juventus in Munich, May 1997 —
    // Dortmund are champions of Europe. Sammer is the Ballon d'Or libero, Möller the
    // craft. But the side is ageing, Bayern are reloading, and reality is a slow fade
    // from the summit. Defend the throne longer than the real Dortmund ever managed.
    mandate: 'You are champions of Europe. Don’t let the throne slip.',
    boardPatience: 78,
    boardExpectedFinish: 2,
    // The 1997-98 Bundesliga is the simulated league; the continental elite (full
    // squads reused from the 1996 pack) anchor every real European Cup of 1998-2013.
    clubs: [
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80 },
      { id: 'bayern', name: 'Bayern München', prestige: 88 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 88 },
      { id: 'barcelona', name: 'Barcelona', prestige: 86 },
      { id: 'juventus', name: 'Juventus', prestige: 90 },
      { id: 'milan', name: 'AC Milan', prestige: 86 },
      { id: 'inter', name: 'Internazionale', prestige: 84 },
      { id: 'man_utd', name: 'Manchester United', prestige: 86 },
      { id: 'liverpool', name: 'Liverpool', prestige: 78 },
      { id: 'arsenal', name: 'Arsenal', prestige: 78 },
      { id: 'chelsea', name: 'Chelsea', prestige: 72 },
    ],
    contextExtra: [
      { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 66 },
      { id: 'kaiserslautern', name: '1. FC Kaiserslautern', prestige: 58 },
    ],
    domesticLeagueId: 'ger-1997',
  },
  'bayern-1998': {
    id: 'bayern-1998',
    name: 'Bayern München — 1998: The Treble Denied',
    startDate: '1998-07',
    playerClub: 'bayern',
    // Kahn, Matthäus, Effenberg, Élber — Hitzfeld's Bayern were ninety seconds from
    // the 1999 European Cup before Solskjær and Sheringham turned Camp Nou. The other
    // bench that night is man-utd-1999. Bayern won it in 2001; the real story is a
    // decade of German dominance and European near-misses. This time, hold on.
    mandate: 'Ninety seconds from the European Cup last time. Now finish it.',
    boardPatience: 80,
    boardExpectedFinish: 1,
    // The 1998-99 Bundesliga is the simulated league; the continental elite (full
    // squads reused from the 1996 pack) anchor every real European Cup of 1999-2013.
    clubs: [
      { id: 'bayern', name: 'Bayern München', prestige: 90 },
      { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80 },
      { id: 'real_madrid', name: 'Real Madrid', prestige: 88 },
      { id: 'barcelona', name: 'Barcelona', prestige: 86 },
      { id: 'juventus', name: 'Juventus', prestige: 88 },
      { id: 'milan', name: 'AC Milan', prestige: 84 },
      { id: 'inter', name: 'Internazionale', prestige: 84 },
      { id: 'man_utd', name: 'Manchester United', prestige: 88 },
      { id: 'liverpool', name: 'Liverpool', prestige: 78 },
      { id: 'arsenal', name: 'Arsenal', prestige: 80 },
      { id: 'chelsea', name: 'Chelsea', prestige: 74 },
    ],
    contextExtra: [
      { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 68 },
      { id: 'schalke', name: 'Schalke 04', prestige: 66 },
    ],
    domesticLeagueId: 'ger-1998',
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
