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

import type { ClubId, ClubState, GameState, LeagueState, PlayerState } from './types.js';
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

/**
 * Sustained unrest can force a discounted exit (internal-friction). A player
 * who was bid for and KEPT accumulates agitation; if it runs high he agitates
 * his way out — the "you kept him happy but he still left" ~30% (§12). Agitation
 * decays if no fresh bids arrive, so a one-off rejection usually settles.
 */
function processAgitationDepartures(state: GameState, rng: Rng): void {
  const user = state.clubs[state.playerClub];
  if (!user) return;
  const year = Number(state.clock.date.slice(0, 4));
  const rivals = richRivals(state);

  for (const id of [...user.squad]) {
    const p = state.players[id];
    if (!p) continue;
    if (p.agitation >= 40) {
      // A player kept against his wishes forces his way out ~30% of the time.
      const chance = 0.3 + Math.max(0, (p.agitation - 46) / 100);
      if (rng.chance(chance)) {
        // Find a willing buyer; a discounted, forced sale.
        const buyer =
          rng.shuffle([...rivals]).find((c) => evaluateApproach(state, { playerId: p.id, toClub: c.id }).willing) ??
          rivals[0];
        if (buyer) {
          const fee = Math.round(valuePlayer(p, year) * 0.8);
          buyer.finances.transferBudget = Math.max(buyer.finances.transferBudget, fee);
          const res = executeTransfer(state, { playerId: p.id, toClub: buyer.id, fee });
          if (res.ok) {
            logEvent(state, {
              category: 'transfer',
              code: 'poach.completed',
              message: `${p.name} forces his way out to ${buyer.name} — kept too long against his wishes`,
              data: { playerId: p.id, from: state.playerClub, to: buyer.id, fee, forced: true },
            });
            continue;
          }
        }
      }
    }
    // Unrest fades over time if no fresh bids stoke it.
    p.agitation = Math.max(0, p.agitation - 22);
  }
}

/** One rival-AI turn at a decision window (§9a response layer). Poaching is no
 *  longer a generic tax — it arises only as a logical butterfly of the user's
 *  own moves (see ledgerExec.createPoachBid). This turn handles counter-punch. */
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
}

export { processAgitationDepartures };

// ── Dominance headwind (§9a #5 rubber-band, the on-pitch half) ────────────────
//
// A pure strength model lets the strongest club win almost every season, so a
// dominant side runs off double-digit title streaks that reality never sees
// (the real treble-era United dropped titles to Arsenal and Chelsea). The
// rubber-band is the correction: a club running away with the title carries a
// growing HEADWIND (hunger wanes, every rival raises their game for the big one),
// while the strongest chasers get a TAILWIND (they invest and target the crown).
// Applied to effective strength IN MATCHES ONLY (never to `strength`), and only
// once a real streak has formed — so it corrects dynasties without disturbing the
// general title race, transfers or valuations.

// Onset is deliberately late and the steps gentle: a club can win three or four
// on the bounce (as real dominant sides do) before the headwind bites hard enough
// to usually — not always — hand the crown over. This keeps 5+ streaks RARE but
// still possible (a genuine dynasty), rather than impossible.
const HEADWIND_ONSET = 2; // titles in a row before the headwind starts
const HEADWIND_STEP = 4; // per year beyond onset, the champion's match headwind
const HEADWIND_CAP = 14;
const CHALLENGER_TAILWIND_STEP = 3; // per year beyond onset, boost to each top chaser
const CHALLENGER_TAILWIND_CAP = 9;
const CHALLENGERS = 3; // how many of the strongest chasers raise their game

/** The current consecutive-title streak in a league: who holds it and how long. */
function titleStreak(league: LeagueState): { holder: ClubId | null; streak: number } {
  let holder: ClubId | null = null;
  let streak = 0;
  for (const t of league.titleHistory) {
    streak = t.championId === holder ? streak + 1 : 1;
    holder = t.championId;
  }
  return { holder, streak };
}

/**
 * Recompute the dominance headwind for every simulated club at the season
 * rollover. A club on a 2+ title streak gets a negative match modifier that
 * grows with the streak; the strongest 3 chasers get a positive one. Inert (all
 * zero) until someone strings titles together, so the opening seasons of any
 * world are unperturbed.
 */
export function applyRubberBand(state: GameState): void {
  for (const league of Object.values(state.leagues)) {
    for (const id of league.clubIds) {
      const c = state.clubs[id];
      if (c) c.dominanceHeadwind = 0;
    }
    const { holder, streak } = titleStreak(league);
    if (!holder || streak < HEADWIND_ONSET) continue; // not yet a dynasty → no rubber-band

    const over = streak - HEADWIND_ONSET + 1; // 1 the year the headwind first applies
    const champ = state.clubs[holder];
    if (champ) champ.dominanceHeadwind = -Math.min(HEADWIND_CAP, over * HEADWIND_STEP);

    const tailwind = Math.min(CHALLENGER_TAILWIND_CAP, over * CHALLENGER_TAILWIND_STEP);
    const chasers = league.clubIds
      .filter((id) => id !== holder)
      .map((id) => state.clubs[id])
      .filter((c): c is ClubState => !!c)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, CHALLENGERS);
    for (const c of chasers) c.dominanceHeadwind = tailwind;
  }
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
