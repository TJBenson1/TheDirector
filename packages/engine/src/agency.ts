/**
 * Player agency & transfer resistance (§6).
 *
 * Every approach computes willingness = pull − resistance. Below a threshold the
 * player says NO regardless of fee — and the game explains why ("He will not
 * leave Barcelona. This is not about money."). Hard blocks (the Messi rule) are
 * near-absolute until their unlock. Rivalry sales carry near-total resistance at
 * player level. The maths is symmetric, so it powers both the user's approaches
 * and (from M8) rival poaching of the user's players.
 */

import type { ClubId, GameState, PlayerId } from './types.js';
import { parseYearMonth } from './clock.js';
import { styleKeyForClub } from './leaguestyle.js';

/** Willingness at/above which a player will consider a move at a fair package. */
export const WILLINGNESS_THRESHOLD = 50;

/** Direct rivalries — sales across these carry near-absolute player resistance. */
const RIVALRIES: Array<[ClubId, ClubId]> = [
  ['man_utd', 'liverpool'],
  ['man_utd', 'man_city'],
  ['man_utd', 'leeds'],
  ['arsenal', 'spurs'],
  ['liverpool', 'everton'],
  ['inter', 'milan'],
  ['real_madrid', 'barcelona'],
];

export function areRivals(a: ClubId, b: ClubId): boolean {
  return RIVALRIES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export interface ApproachInput {
  playerId: PlayerId;
  toClub: ClubId;
  /** Annual wage offered; defaults to the player's current wage. */
  wageOffer?: number;
}

export interface ApproachVerdict {
  willing: boolean;
  willingness: number; // 0..100
  hardBlocked: boolean;
  /** Human-readable explanation (surfaced in the negotiation view, §16). */
  reason: string;
}

function currentYearOf(state: GameState): number {
  return parseYearMonth(state.clock.date).year;
}

/**
 * Resolve an approach for a player joining `toClub`. Pure read over state.
 */
export function evaluateApproach(state: GameState, input: ApproachInput): ApproachVerdict {
  const player = state.players[input.playerId];
  if (!player) return { willing: false, willingness: 0, hardBlocked: false, reason: 'Unknown player' };
  const buyer = state.clubs[input.toClub];
  if (!buyer) return { willing: false, willingness: 0, hardBlocked: false, reason: 'Unknown club' };

  const year = currentYearOf(state);
  const res = player.resistance;

  // 1) Hard blocks — near-absolute until unlock (the Messi rule).
  const block = res.hardBlocks.find((b) => (b.untilYear ?? Infinity) > year);
  if (block) {
    return { willing: false, willingness: 0, hardBlocked: true, reason: block.reason };
  }

  const fromClub = player.club ? state.clubs[player.club] : undefined;

  // 2) Pull — the buyer's appeal.
  let pull = 45;
  if (fromClub) pull += (buyer.prestige - fromClub.prestige) * 0.9; // moving up appeals
  if (res.dreamClubs.includes(input.toClub)) pull += 35; // boyhood dream
  const wageOffer = input.wageOffer ?? player.wage;
  pull += Math.max(-15, Math.min(20, ((wageOffer - player.wage) / Math.max(player.wage, 1)) * 30));
  if (res.careerStagePull === 'payday') pull += 8;
  if (res.careerStagePull === 'prove') pull += 5;

  // 3) Resistance.
  let resistance = res.clubLoyalty * 0.45;
  if (res.careerStagePull === 'legacy') resistance += 12; // settled elder statesman
  // Cultural anchor: a move to an unfamiliar country adds friction.
  if (fromClub && styleKeyForClub(state, player.club) !== styleKeyForClub(state, input.toClub)) {
    resistance += 8;
  }
  // Rivalry: near-absolute at player level.
  if (fromClub && areRivals(fromClub.id, buyer.id)) resistance += 70;

  const willingness = Math.max(0, Math.min(100, Math.round(pull - resistance + 30)));
  const willing = willingness >= WILLINGNESS_THRESHOLD;

  let reason: string;
  if (willing) {
    reason = res.dreamClubs.includes(input.toClub)
      ? `${player.name} is drawn to a move to ${buyer.name}.`
      : `${player.name} is open to the move.`;
  } else if (fromClub && areRivals(fromClub.id, buyer.id)) {
    reason = `${player.name} will not cross to a direct rival in ${buyer.name}.`;
  } else if (res.clubLoyalty >= 80 && fromClub) {
    reason = `${player.name} will not leave ${fromClub.name}. This is not about money.`;
  } else {
    reason = `${player.name} is not convinced by the move to ${buyer.name}.`;
  }

  return { willing, willingness, hardBlocked: false, reason };
}

/** Would this player accept a move to `toClub`? (Symmetric poaching maths, §6.) */
export function wouldAcceptMove(state: GameState, playerId: PlayerId, toClub: ClubId): boolean {
  return evaluateApproach(state, { playerId, toClub }).willing;
}
