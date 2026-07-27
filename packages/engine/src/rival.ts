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

import type { ClubId, ClubState, GameState, PlayerState, Position } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { valuePlayer } from './finance.js';
import { executeTransfer } from './transfers.js';
import { evaluateApproach } from './agency.js';
import { standingsOrder } from './season.js';
import { ERA_REALITY, eraForScenario, entryKey } from './ledger.js';

/** Real players reality is tracking in this scenario's era pack. A counter-punch
 *  may deviate one off course, but only LOGICALLY — never a settled star at the
 *  club reality put him at; only one still EN ROUTE (a future real move), whose
 *  move can be pulled forward. The vast majority therefore stay on their real
 *  path (§9a — deviations are the exception, not the rule). */
function ledgerSubjectIds(state: GameState): Set<string> {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  return new Set((pack?.realTransferLedger ?? []).map((e) => e.playerId));
}

/** Ledger subjects with a real move still AHEAD (hijackable — reality was moving
 *  them anyway), mapped to their remaining unprocessed entry keys. Only IMMINENT
 *  moves (this year or next) qualify: a club denied a target can pull forward a
 *  deal reality was about to make, but it cannot snipe a long-horizon arc — a
 *  teenager seeded years before his real marquee move (Xabi Alonso to Liverpool in
 *  2004, De Bruyne to City in 2015) must never be dragged to a random mid-table
 *  club the moment someone gets raided. */
function hijackableSubjects(state: GameState): Map<string, string[]> {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  const now = state.clock.date;
  const nowYear = Number(now.slice(0, 4));
  const out = new Map<string, string[]>();
  for (const e of pack?.realTransferLedger ?? []) {
    if (e.window <= now) continue; // already due/processed — not a future move
    if (Number(e.window.slice(0, 4)) - nowYear > 1) continue; // long-horizon arc — not snipeable
    const key = entryKey(e);
    if (state.meta.executedLedger.includes(key)) continue;
    (out.get(e.playerId) ?? out.set(e.playerId, []).get(e.playerId)!).push(key);
  }
  return out;
}

const STAR_ABILITY = 82;

/** Rich clubs capable of poaching the user's stars (prestige near/above the user). */
function richRivals(state: GameState): ClubState[] {
  const user = state.clubs[state.playerClub];
  if (!user) return [];
  return Object.values(state.clubs).filter(
    (c) => c.id !== state.playerClub && c.prestige >= user.prestige - 4,
  );
}

/** Broad role for position matching: a keeper is only ever replaced by a keeper,
 *  and a like-for-like replacement is preferred within the outfield lines. */
function roleGroup(pos: Position): 'GK' | 'DEF' | 'MID' | 'ATT' {
  if (pos === 'GK') return 'GK';
  if (pos === 'RB' || pos === 'LB' || pos === 'CB') return 'DEF';
  if (pos === 'DM' || pos === 'CM' || pos === 'AM') return 'MID';
  return 'ATT'; // LW, RW, ST
}

/** Sign a replacement for a raided club from a foreign/context club (no cascade). */
function counterPunchSign(state: GameState, club: ClubState, rng: Rng): boolean {
  const budget = club.finances.transferBudget;
  const target = club.baseStrength;
  const year = Number(state.clock.date.slice(0, 4));
  const tracked = ledgerSubjectIds(state);
  const hijackable = hijackableSubjects(state);

  // The raided player's role — the replacement must fill it. A keeper is replaced
  // ONLY by a keeper (never a striker for a goalkeeper); an outfielder is never
  // replaced by a keeper; and, where possible, the same line is preferred.
  const need = club.counterPunchNeed ?? [];
  const needIsGK = need.some((pos) => pos === 'GK');
  const needGroups = new Set(need.map(roleGroup));
  const roleMatch = (p: PlayerState): { ok: boolean; sameLine: boolean } => {
    const isGK = p.positions.includes('GK');
    if (need.length === 0) return { ok: true, sameLine: false }; // no record — no constraint
    if (isGK !== needIsGK) return { ok: false, sameLine: false }; // hard GK boundary
    const sameLine = p.positions.some((pos) => needGroups.has(roleGroup(pos)));
    return { ok: true, sameLine };
  };

  // Prefer genuine depth (a player reality isn't tracking). A tracked ledger
  // subject is only ever an option if he is still EN ROUTE (a future move to
  // pull forward) — never one settled at his real destination — and even then
  // only if no untracked option fits, so the deviation is a logical minority.
  // Within each pool a same-line replacement always beats an off-line one.
  let bestDepth: PlayerState | undefined;
  let bestDepthLine = false;
  let bestHijack: PlayerState | undefined;
  let bestHijackLine = false;
  const better = (p: PlayerState, cur: PlayerState | undefined, curLine: boolean, line: boolean): boolean =>
    !cur || (line && !curLine) || (line === curLine && p.ability > cur.ability);
  for (const p of Object.values(state.players)) {
    if (p.retired) continue; // hung up his boots
    const seller = p.club ? state.clubs[p.club] : undefined;
    if (!seller || seller.leagueId !== null) continue; // foreign/context only
    if (p.ability < target - 10 || p.ability > target + 5) continue;
    if (p.resistance.hardBlocks.length > 0) continue;
    if (valuePlayer(p, year) > budget) continue;
    const match = roleMatch(p);
    if (!match.ok) continue; // wrong role (a keeper for an outfielder, or vice versa)
    if (tracked.has(p.id)) {
      if (!hijackable.has(p.id)) continue; // settled real star — off limits (illogical)
      if (better(p, bestHijack, bestHijackLine, match.sameLine)) { bestHijack = p; bestHijackLine = match.sameLine; }
    } else if (better(p, bestDepth, bestDepthLine, match.sameLine)) {
      bestDepth = p; bestDepthLine = match.sameLine;
    }
  }
  // Depth wins outright; a real subject is pulled forward only when nothing else
  // fits (and consuming his onward move, so reality diverges cleanly, not twice).
  const best = bestDepth ?? bestHijack;
  if (!best) return false;
  const isHijack = !bestDepth;

  const fee = valuePlayer(best, year);
  const res = executeTransfer(state, { playerId: best.id, toClub: club.id, fee });
  if (!res.ok) return false;

  if (isHijack) {
    for (const key of hijackable.get(best.id) ?? []) {
      if (!state.meta.executedLedger.includes(key)) state.meta.executedLedger.push(key);
    }
    state.timeline.divergenceLog.push({
      date: state.clock.date,
      kind: 'butterfly',
      detail: `${club.name}, raided by the user, counter-punch for ${best.name} — pulling forward a move reality had ahead of him.`,
    });
  }
  logEvent(state, {
    category: 'transfer',
    code: 'rival.counterpunch',
    message: `${club.name} counter-punch: signs ${best.name}`,
    data: { clubId: club.id, playerId: best.id, fee, hijack: isHijack },
  });
  return true;
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
    // A club in financial distress does NOT counter-punch — it has no money to
    // reinvest (in reality the cash it raises goes to its creditors, not the
    // market). The debt simply eats the window; it stops chasing a replacement.
    if (club.financialHealth !== 'healthy') {
      club.pendingCounterPunch = 0;
      continue;
    }
    if (counterPunchSign(state, club, r)) {
      club.pendingCounterPunch = 0;
      club.counterPunchNeed = undefined;
    } else {
      club.pendingCounterPunch -= 1; // ran out of options this window
    }
  }
}

export { processAgitationDepartures };

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
