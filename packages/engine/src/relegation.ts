/**
 * Temporary relegation — a club vanishing from the top flight for a season
 * (Juventus after Calciopoli; a demoted Manchester City). Lower divisions are
 * NOT simulated: these are the only clubs in the model's window that ever drop,
 * so rather than build a second tier, the club simply steps out of the picture —
 * removed from the division and from Europe — and a promoted side takes its slot
 * to keep a full, even fixture list. It returns when its term is served.
 */

import type { ClubId, ClubState, GameState, PlayerState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { parseYearMonth } from './clock.js';
import { generateSquad, deriveRawStrength, recomputeClubStrength, clubSquadPlayers } from './players.js';

const PLACEHOLDER_PREFIX = 'promoted_';

function newPromotedClub(id: ClubId, name: string, leagueId: string, strength: number): ClubState {
  return {
    id,
    name,
    tier: 2,
    prestige: strength,
    squad: [],
    strength,
    baseStrength: strength,
    squadStrengthAnchor: 0,
    starButterfly: 0,
    form: 0,
    leagueId,
    finances: { ownership: 'sustainable', transferBudget: 0, wageBudget: 0, wageBill: 0 },
    pendingCounterPunch: 0,
    grudge: 0,
    financialHealth: 'healthy',
    relegationThreatened: false,
  };
}

/**
 * Drop `clubId` out of its division until `returnYear`, replaced by a promoted
 * side so the league stays full. The club keeps its squad and leagueId (it still
 * develops), but is out of the table and of Europe (see the CL eligibility check
 * and the `relegatedUntil` marker).
 */
export function relegateClub(state: GameState, clubId: ClubId, returnYear: number, replacementName: string, rng: Rng): void {
  const club = state.clubs[clubId];
  if (!club || club.leagueId === null || club.relegatedUntil !== undefined) return;
  const league = state.leagues[club.leagueId];
  if (!league) return;
  const year = parseYearMonth(state.clock.date).year;

  league.clubIds = league.clubIds.filter((id) => id !== clubId);
  club.relegatedUntil = returnYear;

  // A promoted club takes the vacated slot (procedural, modest strength).
  const pid = `${PLACEHOLDER_PREFIX}${clubId}`;
  const strength = 58;
  const placeholder = newPromotedClub(pid, replacementName, league.id, strength);
  state.clubs[pid] = placeholder;
  for (const p of generateSquad(pid, league.id, strength, year, rng.fork(pid)).slice(0, 23)) {
    state.players[p.id] = p;
    placeholder.squad.push(p.id);
  }
  placeholder.squadStrengthAnchor = deriveRawStrength(clubSquadPlayers(state, pid));
  recomputeClubStrength(state, pid);
  league.clubIds.push(pid);

  logEvent(state, {
    category: 'match',
    code: 'club.relegated',
    message: `${club.name} drop out of the top flight — ${replacementName} come up in their place`,
    data: { clubId, returnYear, replacement: pid },
  });
}

/** Return any club whose relegation term has ended (at the start of `returnYear`). */
export function restoreRelegatedClubs(state: GameState): void {
  const year = parseYearMonth(state.clock.date).year;
  for (const club of Object.values(state.clubs)) {
    if (club.relegatedUntil !== year) continue;
    const league = club.leagueId ? state.leagues[club.leagueId] : undefined;
    if (!league) {
      delete club.relegatedUntil;
      continue;
    }
    const pid = `${PLACEHOLDER_PREFIX}${club.id}`;
    league.clubIds = league.clubIds.filter((id) => id !== pid);
    const placeholder = state.clubs[pid];
    if (placeholder) {
      for (const id of placeholder.squad) delete state.players[id];
      delete state.clubs[pid];
    }
    if (!league.clubIds.includes(club.id)) league.clubIds.push(club.id);
    delete club.relegatedUntil;

    logEvent(state, {
      category: 'match',
      code: 'club.promoted',
      message: `${club.name} return to the top flight`,
      data: { clubId: club.id },
    });
  }
}
