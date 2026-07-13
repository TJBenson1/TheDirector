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
import { recomputeClubStrength, computeWageBill, clubSquadPlayers, clubStarPremium, needBucket } from './players.js';

/** Minimum ability for a butterfly signing to count as FILLING a need (a genuine
 *  contributor, not squad depth) and so obviate a later real move (§ showcase). */
const FILLED_NEED_MIN = 80;
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
      // A healthy club banks the fee to reinvest. A club in financial distress
      // does NOT — its fire-sale proceeds go to its creditors, not a transfer
      // kitty (the real Parma/Leeds/Lazio pattern), so distress can't rebuild.
      if (seller.financialHealth === 'healthy') seller.finances.transferBudget += fee;
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
    // A butterfly signing of a genuine contributor FILLS a need — the club's later
    // real signing of the same kind is then obviated (sign Ronaldinho and the deal
    // for another forward never comes). Depth signings don't count (§ showcase).
    if (player.ability >= FILLED_NEED_MIN) {
      state.meta.filledNeeds.push({ club: buyer.id, bucket: needBucket(player), window: state.clock.date });
    }
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
