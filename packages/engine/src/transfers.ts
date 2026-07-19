/**
 * Transfer market plumbing (§11). M3 provides the mechanism: valuation, budget
 * validation, the move itself, and the finance/strength bookkeeping. Player
 * agency & resistance (§6) arrive in M6; rival-AI-initiated transfers (§9a) in
 * M8. This function only *executes* an agreed deal and enforces the hard
 * invariants (no negative budgets, one club per player).
 */

import type { ClubId, GameState, PlayerId, PlayerState } from './types.js';
import { parseYearMonth } from './clock.js';
import { logEvent } from './eventLog.js';
import { valuePlayer, suggestWage } from './finance.js';
import { recomputeClubStrength, computeWageBill, clubSquadPlayers, clubStarPremium } from './players.js';
import { rollAdaptation } from './adaptation.js';
import { Rng } from './rng.js';
import { evaluateApproach, type ApproachVerdict } from './agency.js';
import { coachFit } from './coaches.js';
import { isProcedural } from './ledger.js';

export interface TransferRequest {
  playerId: PlayerId;
  toClub: ClubId;
  /** Agreed fee; defaults to market value. Ignored (0) for free agents. */
  fee?: number;
  /** Agreed annual wage; defaults to a suggested wage. */
  wage?: number;
  /** Contract length in years; defaults to 4. */
  contractYears?: number;
}

export type TransferResult =
  | { ok: true; playerId: PlayerId; from: ClubId | null; to: ClubId; fee: number }
  | { ok: false; reason: string };

/** Morale drop for an incumbent whose place is threatened by a new arrival. */
const HARMONY_MORALE_HIT = 6;

/** Current calendar year from the game clock. */
export function currentYear(state: GameState): number {
  return parseYearMonth(state.clock.date).year;
}

/**
 * Execute an agreed transfer, mutating `state`. Intended to run on a draft
 * (engine transitions clone at their boundary). Refuses any deal that would
 * push the buyer's transfer budget negative — the §18 property invariant.
 */
export function executeTransfer(
  state: GameState,
  req: TransferRequest,
  opts: { reality?: boolean } = {},
): TransferResult {
  const player = state.players[req.playerId];
  if (!player) return { ok: false, reason: `Unknown player "${req.playerId}"` };

  const buyer = state.clubs[req.toClub];
  if (!buyer) return { ok: false, reason: `Unknown club "${req.toClub}"` };

  const fromClubId = player.club;
  if (fromClubId === req.toClub) return { ok: false, reason: 'Player already at this club' };

  // Star premium BEFORE the move, for the continental butterfly (§ showcase). A
  // reality (ledger) move leaves the premium's real trajectory intact; only a
  // DEVIATION banks its change as a butterfly, so the CL sees a gutted spine.
  const buyerStarBefore = opts.reality ? 0 : clubStarPremium(state, req.toClub);
  const sellerStarBefore = !opts.reality && fromClubId ? clubStarPremium(state, fromClubId) : 0;

  const year = currentYear(state);
  // A missing/NaN fee (e.g. a narrator that fumbled the number) must never sell a
  // player for £0 or corrupt a budget to NaN — fall back to market value.
  const fee = fromClubId
    ? typeof req.fee === 'number' && Number.isFinite(req.fee)
      ? Math.max(0, req.fee)
      : valuePlayer(player, year)
    : 0;

  if (fee > buyer.finances.transferBudget) {
    return {
      ok: false,
      reason: `Fee ${fee} exceeds ${req.toClub} transfer budget ${buyer.finances.transferBudget}`,
    };
  }

  // Move the player.
  if (fromClubId) {
    const seller = state.clubs[fromClubId];
    if (seller) {
      seller.squad = seller.squad.filter((id) => id !== player.id);
      // A healthy club banks the fee to reinvest. A club in financial distress
      // does NOT — its fire-sale proceeds go to its creditors, not a transfer
      // kitty (the real Parma/Leeds/Lazio pattern), so distress can't rebuild.
      // The USER's own club is the exception: the Director directs the money, so a
      // sanctioned sale always replenishes his budget (a sale he made to fund a
      // buy must actually fund it), regardless of the club's financial health.
      if (seller.financialHealth === 'healthy' || fromClubId === state.playerClub) {
        seller.finances.transferBudget += fee;
      }
    }
  }
  buyer.squad.push(player.id);
  buyer.finances.transferBudget -= fee;

  player.club = req.toClub;
  player.contractUntil = year + Math.max(1, req.contractYears ?? 4);
  player.wage = req.wage ?? suggestWage(player, year);

  // Roll a hidden adaptation outcome for the move (§3). Deterministic stream,
  // forked so it doesn't perturb the main RNG cursor.
  const adaptRng = new Rng(state.meta.rngState).fork(`transfer:${player.id}:${state.clock.date}`);
  player.adaptation = rollAdaptation(state, player, fromClubId, req.toClub, adaptRng);

  // Bookkeeping: wage bills and squad strengths for both clubs.
  buyer.finances.wageBill = computeWageBill(state, buyer.id);
  recomputeClubStrength(state, buyer.id);
  if (fromClubId && state.clubs[fromClubId]) {
    state.clubs[fromClubId]!.finances.wageBill = computeWageBill(state, fromClubId);
    recomputeClubStrength(state, fromClubId);
  }
  // Bank the star-premium swing of a DEVIATION as a continental butterfly (a
  // reality move banks nothing — its premium change is reality's own).
  if (!opts.reality) {
    buyer.starButterfly += clubStarPremium(state, buyer.id) - buyerStarBefore;
    if (fromClubId && state.clubs[fromClubId]) {
      state.clubs[fromClubId]!.starButterfly += clubStarPremium(state, fromClubId) - sellerStarBefore;
    }
  }

  // Squad harmony (§ internal friction): a new arrival unsettles the incumbents
  // he now competes with. When the USER stacks a position, those whose place is
  // threatened — at or below the newcomer's level — lose morale, so overloading
  // a position carries a real dressing-room cost (a reality move is the world as
  // it was and banks no such shock). Signing an upgrade dents more players; a
  // fringe body clearly worse than the incumbents troubles no one.
  if (!opts.reality && req.toClub === state.playerClub) {
    for (const mate of clubSquadPlayers(state, buyer.id)) {
      if (mate.id === player.id) continue;
      if (!mate.positions.some((pos) => player.positions.includes(pos))) continue;
      if (mate.ability > player.ability + 4) continue; // clearly ahead — not threatened
      mate.morale = Math.max(0, mate.morale - HARMONY_MORALE_HIT);
    }
  }

  // The head coach's verdict on a signing the Director makes (M13b). A player he
  // wanted lands settled and warms the working relationship; a poor fit he was
  // overruled on costs relationship capital AND struggles to settle — a misfit
  // adaptation on top of whatever the move itself rolled. Reality moves are the
  // world as it was; the coach passes no judgement on them.
  if (!opts.reality && req.toClub === state.playerClub && fromClubId !== state.playerClub) {
    applyCoachSigningReaction(state, player);
  }

  logEvent(state, {
    category: 'transfer',
    code: 'transfer.completed',
    message: `${player.name} → ${buyer.name}${fee > 0 ? ` for £${(fee / 1_000_000).toFixed(1)}m` : ' (free)'}`,
    data: { playerId: player.id, from: fromClubId, to: req.toClub, fee, wage: player.wage },
  });

  // The user acting on the market provokes the rival response layer (§9a) — a
  // do-nothing user doesn't, so reality/scripted history holds for the passive.
  // Sanctioning a REAL move (reality) is "do-nothing": it must not stir the world
  // off its real course, or the passive user's reality (and the Champions League)
  // would drift for no reason.
  if (!opts.reality && req.toClub === state.playerClub && fromClubId !== state.playerClub) {
    state.userAggression += 1;
  }

  // Raid detection (§9a): the user raiding a simulated rival provokes a
  // counter-punch and a grudge. The rival has ≤2 windows to respond. A reality
  // move is not a raid — the seller's real response is already in the ledger.
  if (!opts.reality && fromClubId && req.toClub === state.playerClub) {
    const seller = state.clubs[fromClubId];
    if (seller && seller.leagueId !== null && seller.id !== state.playerClub) {
      seller.pendingCounterPunch = 2;
      seller.grudge = Math.min(100, seller.grudge + 20);
      logEvent(state, {
        category: 'transfer',
        code: 'raid.suffered',
        message: `${seller.name} raided by ${buyer.name} for ${player.name}`,
        data: { clubId: seller.id, playerId: player.id, fee },
      });
    }
  }

  return { ok: true, playerId: player.id, from: fromClubId, to: req.toClub, fee };
}

/** The coach's reaction to a Director signing: relationship swing + a misfit
 *  adaptation drag on a player he didn't want. */
function applyCoachSigningReaction(state: GameState, player: PlayerState): void {
  const coach = state.managerRelations;
  const fit = coachFit(coach, player);
  const clampRel = (v: number) => Math.max(0, Math.min(100, v));
  if (fit.verdict === 'wants') {
    coach.relationshipWithUser = clampRel(coach.relationshipWithUser + 3);
    player.morale = Math.min(100, player.morale + 4); // a coach who wanted you settles you
    logEvent(state, {
      category: 'transfer',
      code: 'coach.signing.approved',
      message: `${coach.identity} welcomes ${player.name} — ${fit.reason}`,
      data: { playerId: player.id, fit: fit.score },
    });
    return;
  }
  if (fit.verdict === 'fine') return; // no friction, no bonus

  // Reluctant or vetoed: the Director signed over the coach's objection.
  const relHit = fit.verdict === 'veto' ? 7 : 2;
  coach.relationshipWithUser = clampRel(coach.relationshipWithUser - relHit);
  // A player the coach won't build around is left to sink or swim: deepen (or
  // create) an adaptation penalty so the misfit shows on the pitch.
  const extra = fit.verdict === 'veto' ? 0.12 : 0.06;
  const a = player.adaptation;
  if (a && !a.settled) {
    a.penalty = Math.min(0.4, a.penalty + extra);
    a.seasonsRemaining = Math.max(a.seasonsRemaining, fit.verdict === 'veto' ? 2 : 1);
  } else {
    player.adaptation = {
      outcome: fit.verdict === 'veto' ? 'failure' : 'partial',
      penalty: extra,
      seasonsRemaining: fit.verdict === 'veto' ? 2 : 1,
      settled: false,
    };
  }
  logEvent(state, {
    category: 'transfer',
    code: fit.verdict === 'veto' ? 'coach.signing.vetoed' : 'coach.signing.reluctant',
    message: `${fit.reason} The signing goes through regardless, straining the relationship.`,
    data: { playerId: player.id, fit: fit.score, verdict: fit.verdict },
  });
}

export type SigningResult = TransferResult | { ok: false; reason: string; refusedByPlayer: true };

/**
 * Attempt a signing WITH player agency (§6): consult willingness first, and only
 * execute the deal if the player is willing (and the fee is affordable). A hard
 * block or a below-threshold willingness refuses regardless of fee — this is the
 * Messi rule and the "not about money" verdict in one path.
 */
export function attemptSigning(
  state: GameState,
  req: TransferRequest & { wageOffer?: number },
): SigningResult {
  // Procedural filler is never a real target — the Director signs recognisable
  // footballers, not anonymous squad-padding. (The recommender already hides
  // them; this refuses a direct, by-id attempt too.)
  const target = state.players[req.playerId];
  if (target && isProcedural(target)) {
    return { ok: false, reason: `${target.name} is squad filler, not a signable player.` };
  }
  const verdict: ApproachVerdict = evaluateApproach(state, {
    playerId: req.playerId,
    toClub: req.toClub,
    wageOffer: req.wageOffer,
    feeOffer: req.fee,
  });
  if (!verdict.willing) {
    return { ok: false, reason: verdict.reason, refusedByPlayer: true };
  }
  return executeTransfer(state, req);
}

/** Affordable, sensible targets for a club from a candidate pool (helper for
 *  bots/tests; real scouting & shortlisting is M5+). */
export function affordableTargets(state: GameState, clubId: ClubId): PlayerId[] {
  const club = state.clubs[clubId];
  if (!club) return [];
  const year = currentYear(state);
  const budget = club.finances.transferBudget;
  const targets: PlayerId[] = [];
  for (const player of Object.values(state.players)) {
    if (player.club === clubId || player.retired) continue;
    if (valuePlayer(player, year) <= budget) targets.push(player.id);
  }
  return targets;
}

/** Total squad size for a club (guard against emptying a squad in tests/bots). */
export function squadSize(state: GameState, clubId: ClubId): number {
  return clubSquadPlayers(state, clubId).length;
}
