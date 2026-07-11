/**
 * Rival AI — the reactive response layer (§9a; docs/DESIGN-reality-default.md).
 *
 * IMPORTANT: this is NOT a pure needs-based "AI buys every window" system — that
 * would produce fantasy squads (the reality-default correction). Proactive AI
 * transfers follow the real ledger (M8 data work, deferred). What lives here is
 * the RESPONSE LAYER the correction explicitly permits, triggered by the user's
 * own aggression:
 *
 *  • Counter-punch (§9a #2): a club the user raids signs a replacement within
 *    ≤2 windows — from foreign/context clubs, so it never cascades into another
 *    simulated raid.
 *  • Poaching (§9a #3): prestige+money rivals periodically prise away the user's
 *    best players; willingness maths (§6) decides — the user can genuinely lose
 *    a star even while trying to keep him.
 *  • Grudge memory (§9a #4) and rubber-band (§9a #5, worldDefiance): a raided
 *    director turns hostile; a cruising user makes the world fight harder.
 */

import type { ClubId, ClubState, GameState, PlayerState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { valuePlayer } from './finance.js';
import { executeTransfer } from './transfers.js';
import { evaluateApproach } from './agency.js';
import { standingsOrder } from './season.js';

const STAR_ABILITY = 82;

/** Rich clubs capable of poaching the user's stars (prestige near/above the user). */
function richRivals(state: GameState): ClubState[] {
  const user = state.clubs[state.playerClub];
  if (!user) return [];
  return Object.values(state.clubs).filter(
    (c) => c.id !== state.playerClub && c.prestige >= user.prestige - 4,
  );
}

/** Sign a replacement for a raided club from a foreign/context club (no cascade). */
function counterPunchSign(state: GameState, club: ClubState, rng: Rng): boolean {
  const budget = club.finances.transferBudget;
  const target = club.baseStrength;
  let best: PlayerState | undefined;
  for (const p of Object.values(state.players)) {
    const seller = p.club ? state.clubs[p.club] : undefined;
    if (!seller || seller.leagueId !== null) continue; // foreign/context only
    if (p.ability < target - 10 || p.ability > target + 5) continue;
    if (p.resistance.hardBlocks.length > 0) continue;
    if (valuePlayer(p, Number(state.clock.date.slice(0, 4))) > budget) continue;
    if (!best || p.ability > best.ability) best = p;
  }
  if (!best) return false;
  const fee = valuePlayer(best, Number(state.clock.date.slice(0, 4)));
  const res = executeTransfer(state, { playerId: best.id, toClub: club.id, fee });
  if (res.ok) {
    logEvent(state, {
      category: 'transfer',
      code: 'rival.counterpunch',
      message: `${club.name} counter-punch: signs ${best.name}`,
      data: { clubId: club.id, playerId: best.id, fee },
    });
    return true;
  }
  return false;
}

/** Attempt to poach the user's stars (§9a #3). Runs once per year (summer).
 *  Only a user who has been active in the market provokes poaching — a passive
 *  user doesn't, so reality (and scripted history) holds for them. */
function poachUserStars(state: GameState, rng: Rng): void {
  if (state.userAggression <= 0) return; // reality-default: no provocation, no poach
  const user = state.clubs[state.playerClub];
  if (!user) return;
  const rivals = richRivals(state);
  if (rivals.length === 0) return;
  const year = Number(state.clock.date.slice(0, 4));
  const temptation = state.settings.starTemptation;
  const defianceBoost = 1 + (state.worldDefiance / 100) * state.settings.worldDefiance;

  for (const id of [...user.squad]) {
    const star = state.players[id];
    if (!star || star.ability < STAR_ABILITY || star.injury) continue;

    for (const rival of rng.shuffle([...rivals])) {
      const verdict = evaluateApproach(state, { playerId: star.id, toClub: rival.id, wageOffer: star.wage * 1.5 });
      if (verdict.hardBlocked) continue;
      // Willing stars (dream move / low loyalty) are far more poachable; a loyal
      // star only leaves via rare agitation.
      const base = verdict.willing ? 0.038 : 0.003;
      const p = base * temptation * defianceBoost;
      if (!rng.chance(p)) continue;

      const fee = valuePlayer(star, year);
      // A rich rival stretches to fund a statement signing.
      rival.finances.transferBudget = Math.max(rival.finances.transferBudget, fee);
      const res = executeTransfer(state, { playerId: star.id, toClub: rival.id, fee });
      if (res.ok) {
        logEvent(state, {
          category: 'transfer',
          code: 'poach.completed',
          message: `${star.name} poached by ${rival.name} — the ${user.name} star departs`,
          data: { playerId: star.id, from: state.playerClub, to: rival.id, fee },
        });
      }
      break; // star handled (gone or stayed) this window
    }
  }
}

/** One rival-AI turn at a decision window (§9a response layer). */
export function runRivalWindow(state: GameState, rng: Rng): void {
  const r = rng.fork(`rival:${state.clock.date}`);

  // Counter-punch any club still owed a response.
  for (const club of Object.values(state.clubs)) {
    if (club.pendingCounterPunch <= 0) continue;
    if (counterPunchSign(state, club, r)) {
      club.pendingCounterPunch = 0;
    } else {
      club.pendingCounterPunch -= 1; // ran out of options this window
    }
  }

  // Poaching runs once a year, in the summer window.
  if (state.clock.monthIndex === 0) poachUserStars(state, r);
}

/**
 * Rubber-band (§9a #5): a dominant user raises `worldDefiance` (the world fights
 * harder); a struggling one lowers it. Governed by the worldDefiance slider.
 * Called at the season rollover.
 */
export function updateWorldDefiance(state: GameState): void {
  const league = state.leagues[Object.keys(state.leagues)[0] ?? ''];
  const userClub = state.clubs[state.playerClub];
  if (!league || !userClub || userClub.leagueId !== league.id) return;
  if (league.titleHistory.length === 0) return;

  const last = league.titleHistory[league.titleHistory.length - 1]!;
  const order = standingsOrder(league);
  const userPos = order.indexOf(state.playerClub);

  let delta: number;
  if (last.championId === state.playerClub) delta = 8;
  else if (userPos >= 0 && userPos < 2) delta = 4;
  else delta = -5;

  state.worldDefiance = Math.max(0, Math.min(100, state.worldDefiance + delta));
}
