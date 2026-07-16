/**
 * Serie A era-defining scandals (scenario butterflies, §9f).
 *
 * Two calcio events reshape the Golden-Age world regardless of the user:
 *
 *  • Parmalat (2003–04): the dairy conglomerate that bankrolled Parma collapses
 *    in one of Europe's biggest accounting frauds. Parma falls into crisis and a
 *    fire-sale — its proceeds go to creditors, not the market (the distress rules
 *    in transfers.ts / rival.ts do the rest: cheap, willing sellers; no rebuild).
 *  • Calciopoli (2006): the match-fixing scandal strips Juventus of the 2005 and
 *    2006 titles, relegates them (modelled as a heavy blow to strength/finance)
 *    and triggers the real exodus — the non-loyal stars leave, the legends stay.
 *
 * Both resolve at the July rollover, era-gated to the Serie A 1995 pack.
 */

import type { ClubId, GameState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { eraForScenario } from './ledger.js';
import { recomputeClubStrength } from './players.js';
import { relegateClub } from './relegation.js';
import { standingsOrder } from './season.js';

function isSerieA1995(state: GameState): boolean {
  return eraForScenario(state.meta.scenarioId) === 'era-serie-a-1995';
}

/** The Serie A 2007-08 roster Juventus rejoin on promotion (matches ITALY_2007). */
const SERIE_A_2007_ROSTER: ClubId[] = [
  'juventus', 'inter', 'milan', 'roma', 'fiorentina', 'napoli', 'lazio',
  'sampdoria', 'udinese', 'genoa', 'atalanta', 'palermo', 'siena', 'cagliari',
  'torino', 'reggina', 'catania', 'empoli', 'parma', 'livorno',
];

/**
 * Juventus 2006: after their season in the wilderness, promote the Old Lady back
 * to the top flight. The engine simulates a single division, so promotion is
 * modelled by transforming Juve's one league from Serie B into Serie A — the
 * procedural second-tier minnows drop out, and the late-2000s Serie A clubs (which
 * exist as context) are swapped into the table. Fires at the July rollover once
 * Juventus have finished a Serie B season in a promotion place (top three): almost
 * every career goes straight back up, the odd mismanaged one takes another year.
 */
export function promoteJuventus(state: GameState, _rng: Rng): void {
  if (eraForScenario(state.meta.scenarioId) !== 'era-serie-a-2006') return;
  // Fire in August (the new season's first playing month), BEFORE the season
  // inits from the league's membership — so the completed Serie B final table
  // stays intact through the July summer window, then the top flight opens with
  // Juventus and the Serie A field swapped in.
  if (state.clock.monthIndex !== 1) return;
  if (state.meta.firedScripted.includes('juve-promoted')) return;
  const juve = state.clubs['juventus'];
  const league = juve?.leagueId ? state.leagues[juve.leagueId] : undefined;
  if (!juve || !league || league.id !== 'ita-b-2006') return;
  // Only after a completed Serie B season (a champion crowned) in which Juventus
  // finished in a promotion place — otherwise they serve another year below.
  if (league.titleHistory.length < 1) return;
  const pos = standingsOrder(league).indexOf('juventus');
  if (pos < 0 || pos > 2) return;
  state.meta.firedScripted.push('juve-promoted');

  // The second-tier minnows drop back out of the simulated world.
  for (const id of league.clubIds) {
    if (id === 'juventus') continue;
    const c = state.clubs[id];
    if (c) c.leagueId = null;
  }
  // Rebuild the league as Serie A: Juventus + the late-2000s top flight (context
  // clubs promoted into the table). Any club not present is simply skipped.
  league.name = 'Serie A';
  const roster = SERIE_A_2007_ROSTER.filter((id) => state.clubs[id]);
  league.clubIds = [...roster];
  for (const id of roster) {
    state.clubs[id]!.leagueId = league.id;
    recomputeClubStrength(state, id);
  }

  logEvent(state, {
    category: 'match',
    code: 'club.promoted',
    message: 'Juventus win promotion and return to Serie A — the Old Lady is back in the top flight',
    data: { clubId: 'juventus' },
  });
  state.timeline.divergenceLog.push({
    date: state.clock.date,
    kind: 'reality',
    detail: 'Juventus bounce straight back from Serie B, promoted at the first attempt — the rebuild begins in the top flight.',
  });
}

/** Parmalat's collapse tips Parma into crisis — the summer-2004 fire-sale. */
export function resolveParmalat(state: GameState, _rng: Rng): void {
  if (!isSerieA1995(state)) return;
  if (state.clock.monthIndex !== 0 || !state.clock.date.startsWith('2004')) return;
  if (state.meta.firedScripted.includes('parmalat')) return;
  state.meta.firedScripted.push('parmalat');

  const parma = state.clubs['parma'];
  if (!parma) return;
  parma.financialHealth = 'crisis';
  parma.prestige = Math.max(40, parma.prestige - 16);
  parma.finances.transferBudget = 0;
  parma.finances.ownership = 'debt';

  state.timeline.divergenceLog.push({
    date: state.clock.date,
    kind: 'butterfly',
    detail: 'Parmalat collapses in a €14bn accounting fraud — Parma fall into administration and a fire-sale; the proceeds go to creditors, not new signings.',
  });
  logEvent(state, {
    category: 'event',
    code: 'crisis.parmalat',
    message: 'Parmalat collapse: Parma plunged into financial crisis — a distress fire-sale begins',
    data: { clubId: 'parma' },
  });
}

/**
 * Calciopoli strips and relegates Juventus. The exodus of stars (Cannavaro →
 * Real, Thuram & Zambrotta → Barça) is real history, so it lives in the ledger
 * and executes there — offered to the user if they are Juventus, who can try to
 * hold a few, though the legends (Del Piero, Buffon, Nedvěd, Trezeguet) stay
 * regardless. This resolver applies the PUNISHMENT the engine can't route through
 * a non-existent second division: titles voided, prestige/finances/strength hit.
 */
export function resolveCalciopoli(state: GameState, rng: Rng): void {
  if (!isSerieA1995(state)) return;
  if (state.clock.monthIndex !== 0 || !state.clock.date.startsWith('2006')) return;
  if (state.meta.firedScripted.includes('calciopoli')) return;
  state.meta.firedScripted.push('calciopoli');

  const juve = state.clubs['juventus'];
  const league = state.leagues['ita-1'];
  if (!juve || !league) return;

  // Strip the 2005 & 2006 Scudetti (revoked in reality).
  const strippedBefore = league.titleHistory.length;
  league.titleHistory = league.titleHistory.filter(
    (t) => !(t.championId === 'juventus' && (t.seasonYear === 2005 || t.seasonYear === 2006)),
  );
  const stripped = strippedBefore - league.titleHistory.length;

  // Relegation + points-void, modelled as a heavy, lasting blow to standing and
  // finances (the engine has no second division to drop into). The star exodus
  // is handled separately by the ledger's 2006 Juventus departures.
  juve.prestige = Math.max(50, juve.prestige - 12);
  juve.financialHealth = 'strained';
  juve.finances.ownership = 'debt';
  juve.baseStrength = Math.max(50, juve.baseStrength - 8);
  recomputeClubStrength(state, 'juventus');

  // Relegation: Juventus vanish from Serie A (and Europe) for 2006–07, back for
  // 2007–08, with Catania promoted in their place. Lower tiers aren't simulated.
  relegateClub(state, 'juventus', 2007, 'Catania', rng.fork('calciopoli:relegate'));

  state.timeline.divergenceLog.push({
    date: state.clock.date,
    kind: 'butterfly',
    detail: `Calciopoli: Juventus stripped of ${stripped} title(s) and relegated to Serie B in disgrace — the mercenaries leave, the legends stay to rebuild.`,
  });
  logEvent(state, {
    category: 'event',
    code: 'crisis.calciopoli',
    message: `Calciopoli verdict: Juventus stripped of ${stripped} title(s), relegated and punished — a giant humbled`,
    data: { stripped },
  });
}
