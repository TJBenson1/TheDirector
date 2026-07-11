/**
 * Transfer market plumbing (§11). M3 provides the mechanism: valuation, budget
 * validation, the move itself, and the finance/strength bookkeeping. Player
 * agency & resistance (§6) arrive in M6; rival-AI-initiated transfers (§9a) in
 * M8. This function only *executes* an agreed deal and enforces the hard
 * invariants (no negative budgets, one club per player).
 */

import type { ClubId, GameState, PlayerId } from './types.js';
import { parseYearMonth } from './clock.js';
import { logEvent } from './eventLog.js';
import { valuePlayer, suggestWage } from './finance.js';
import { recomputeClubStrength, computeWageBill, clubSquadPlayers } from './players.js';
import { rollAdaptation } from './adaptation.js';
import { Rng } from './rng.js';
import { evaluateApproach, type ApproachVerdict } from './agency.js';

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

/** Current calendar year from the game clock. */
export function currentYear(state: GameState): number {
  return parseYearMonth(state.clock.date).year;
}

/**
 * Execute an agreed transfer, mutating `state`. Intended to run on a draft
 * (engine transitions clone at their boundary). Refuses any deal that would
 * push the buyer's transfer budget negative — the §18 property invariant.
 */
export function executeTransfer(state: GameState, req: TransferRequest): TransferResult {
  const player = state.players[req.playerId];
  if (!player) return { ok: false, reason: `Unknown player "${req.playerId}"` };

  const buyer = state.clubs[req.toClub];
  if (!buyer) return { ok: false, reason: `Unknown club "${req.toClub}"` };

  const fromClubId = player.club;
  if (fromClubId === req.toClub) return { ok: false, reason: 'Player already at this club' };

  const year = currentYear(state);
  const fee = fromClubId ? Math.max(0, req.fee ?? valuePlayer(player, year)) : 0;

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
      seller.finances.transferBudget += fee;
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

  logEvent(state, {
    category: 'transfer',
    code: 'transfer.completed',
    message: `${player.name} → ${buyer.name}${fee > 0 ? ` for £${(fee / 1_000_000).toFixed(1)}m` : ' (free)'}`,
    data: { playerId: player.id, from: fromClubId, to: req.toClub, fee, wage: player.wage },
  });

  return { ok: true, playerId: player.id, from: fromClubId, to: req.toClub, fee };
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
  const verdict: ApproachVerdict = evaluateApproach(state, {
    playerId: req.playerId,
    toClub: req.toClub,
    wageOffer: req.wageOffer,
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
    if (player.club === clubId) continue;
    if (valuePlayer(player, year) <= budget) targets.push(player.id);
  }
  return targets;
}

/** Total squad size for a club (guard against emptying a squad in tests/bots). */
export function squadSize(state: GameState, clubId: ClubId): number {
  return clubSquadPlayers(state, clubId).length;
}
