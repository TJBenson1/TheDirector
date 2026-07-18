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
import { poleMoveFor } from './wooing.js';
import { clubSquadPlayers } from './players.js';
import { loanParent, isPersonaNonGrata } from './restrictions.js';

/** Willingness at/above which a player will consider a move at a fair package. */
export const WILLINGNESS_THRESHOLD = 50;

// The magnet effect (§ galáctico pull): a club that already holds a genuine
// superstar is a more alluring destination — players want to play alongside the
// best, so a Ronaldo (however he got there — reality or a butterfly that diverted
// him) draws OTHER stars toward his club and helps it win contested moves. Bounded
// so a super-club forms believably (the real Galácticos) without snowballing into
// an everyone-signs-here fantasy.
const MAGNET_ABILITY = 90;
const MAGNET_WEIGHT = 1.8;
const MAGNET_MAX = 14;
// Resistance added per as-good-or-better incumbent (beyond the first) already in
// the buyer's squad at the target's position — a logjam he won't want to join.
const DEPTH_GLUT_PENALTY = 11;

/** A club's pull from the superstars it already fields (0 if it has none). */
export function magnetPull(state: GameState, clubId: ClubId): number {
  let m = 0;
  for (const p of clubSquadPlayers(state, clubId)) {
    if (p.ability >= MAGNET_ABILITY) m += p.ability - MAGNET_ABILITY + 1;
  }
  return Math.min(MAGNET_MAX, m * MAGNET_WEIGHT);
}

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

/**
 * Direct rivals for the purposes of the transfer market: a named rivalry, OR two
 * big clubs (prestige ≥ 78) in the SAME domestic league — title competitors do
 * not sell each other their players (Essien from Chelsea to Arsenal is simply
 * impossible). Note this is about the CURRENT clubs: hijacking a player from his
 * neutral source club before a rival gets him (Essien from Lyon in 2004, before
 * Chelsea in 2005) is a different, perfectly legitimate move.
 */
export function areDirectRivals(state: GameState, a: ClubId | null | undefined, b: ClubId | null | undefined): boolean {
  if (!a || !b || a === b) return false;
  if (areRivals(a, b)) return true;
  const ca = state.clubs[a];
  const cb = state.clubs[b];
  if (!ca || !cb) return false;
  return ca.leagueId !== null && ca.leagueId === cb.leagueId && ca.prestige >= 78 && cb.prestige >= 78;
}

export interface ApproachInput {
  playerId: PlayerId;
  toClub: ClubId;
  /** Annual wage offered; defaults to the player's current wage. */
  wageOffer?: number;
  /** Transfer fee offered to the selling club. Out-bidding a pole suitor's real
   *  fee buys the club's agreement first, so the player never gets to negotiate
   *  with them ("he isn't allowed to speak to Juve"). Defaults to 0 (a bare
   *  approach with no fee tabled leaves reality's pole deal untouched). */
  feeOffer?: number;
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

  // 1a) On loan: the parent club controls his future — you can't buy him from the
  //     club he's playing for (Courtois is Chelsea's, not Atlético's to sell).
  const parent = loanParent(player.id);
  if (parent && parent !== buyer.id) {
    const owner = state.clubs[parent];
    return {
      willing: false,
      willingness: 0,
      hardBlocked: true,
      reason: `${player.name} is only on loan at ${fromClub?.name ?? 'his club'} — ${owner?.name ?? 'his parent club'} own him and control his future.`,
    };
  }

  // 1a-ii) Returning villain: the supporters would never accept it.
  if (isPersonaNonGrata(buyer.id, player)) {
    return {
      willing: false,
      willingness: 0,
      hardBlocked: true,
      reason: `${player.name} to ${buyer.name} is unthinkable — the supporters would never forgive it.`,
    };
  }

  // 1b) Direct rivals never trade with each other — impossible on club and player
  //     preference alike, at any price (Essien would not cross Chelsea→Arsenal).
  if (fromClub && areDirectRivals(state, fromClub.id, buyer.id)) {
    return {
      willing: false,
      willingness: 0,
      hardBlocked: true,
      reason: `${fromClub.name} will not sell ${player.name} to a direct rival in ${buyer.name} — at any price.`,
    };
  }

  // 2) Pull — the buyer's appeal.
  let pull = 45;
  if (fromClub) pull += (buyer.prestige - fromClub.prestige) * 0.9; // moving up appeals
  pull += magnetPull(state, buyer.id); // play alongside a galáctico (§ magnet)
  if (res.dreamClubs.includes(input.toClub)) pull += 35; // boyhood dream
  const wageOffer = input.wageOffer ?? player.wage;
  pull += Math.max(-15, Math.min(20, ((wageOffer - player.wage) / Math.max(player.wage, 1)) * 30));
  if (res.careerStagePull === 'payday') pull += 8;
  if (res.careerStagePull === 'prove') pull += 5;

  // Wooing: sustained pursuit ("speak to his people") warms a target to you.
  const pursuit = state.pursuit[input.playerId] ?? 0;
  pull += pursuit * 0.4;

  // 3) Resistance.
  let resistance = res.clubLoyalty * 0.45;
  if (res.careerStagePull === 'legacy') resistance += 12; // settled elder statesman
  // Cultural anchor: a move to an unfamiliar country adds friction.
  if (fromClub && styleKeyForClub(state, player.club) !== styleKeyForClub(state, input.toClub)) {
    resistance += 8;
  }
  // Rivalry: near-absolute at player level.
  if (fromClub && areRivals(fromClub.id, buyer.id)) resistance += 70;
  // "Spoken for": if reality already has him lined up for another top club, that
  // club is in pole position. A cold bid won't shift him; you must out-court them
  // and/or be the bigger draw. Being clearly bigger than the pole suitor helps.
  const pole = poleMoveFor(state, input.playerId);
  if (pole && pole.to !== input.toClub) {
    const poleClub = state.clubs[pole.to];
    const poleLead = (poleClub?.prestige ?? 72) - buyer.prestige;
    // Strong by default (a cold late bid loses out to the club in pole), eased by
    // pursuit and by being a bigger draw than that suitor. Pursuit is already in
    // `pull`, so a fully-courted (100) target claws back ~40.
    let poleResistance = Math.max(10, 44 + poleLead * 1.3);
    // Fee lever ("he isn't allowed to speak to them"): out-bidding the SELLING
    // club beyond the pole suitor's real fee buys their agreement first, so the
    // player never gets to the negotiating table with the pole. Beating the real
    // fee by the greater of £2m or 30% collapses the pole's advantage entirely;
    // a token pound over barely dents it. A do-nothing/cold approach (feeOffer 0)
    // leaves reality's deal fully in pole, so the passive world holds.
    const feeOffer = input.feeOffer ?? 0;
    if (pole.fee > 0 && feeOffer > pole.fee) {
      const beatBy = feeOffer - pole.fee;
      const needed = Math.max(2_000_000, pole.fee * 0.3);
      const collapse = Math.min(1, beatBy / needed);
      poleResistance *= 1 - collapse;
    }
    resistance += poleResistance;
  }

  // Squad-glut friction (the buyer's side of the deal): a good player will not
  // join to sit behind an established queue in his position — the more as-good-
  // or-better options the club already fields there, the less he fancies it,
  // because he won't play. One incumbent of his level is normal competition; a
  // second and third are a logjam. This is what stops a treble side signing an
  // unproven fifth striker on a whim — you have to clear the position first.
  const competitors = clubSquadPlayers(state, buyer.id).filter(
    (p) =>
      p.id !== player.id &&
      p.positions.some((pos) => player.positions.includes(pos)) &&
      p.ability >= player.ability - 2, // an incumbent at (or above) his level
  ).length;
  // Two incumbents of his calibre is a healthy rotation; a third means he'd be the
  // fourth option and won't play — the friction rises with every body beyond that.
  const glutted = competitors >= 3;
  if (glutted) resistance += (competitors - 2) * DEPTH_GLUT_PENALTY;

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
  } else if (pole && pole.to !== input.toClub && (input.feeOffer ?? 0) <= pole.fee) {
    // The blocker is a rival already in pole for his real move — tell the user the
    // lever (out-bid the selling club) rather than a flat "not convinced".
    const poleName = state.clubs[pole.to]?.name ?? pole.to;
    reason = `${player.name} is set to join ${poleName} — out-bid them at ${fromClub?.name ?? 'his club'} (beat £${(pole.fee / 1_000_000).toFixed(1)}m) to prise him away.`;
  } else if (glutted) {
    reason = `${player.name} sees no path to games at ${buyer.name} — you are already well stocked in his position. Clear the queue first.`;
  } else {
    reason = `${player.name} is not convinced by the move to ${buyer.name}.`;
  }

  return { willing, willingness, hardBlocked: false, reason };
}

/** Would this player accept a move to `toClub`? (Symmetric poaching maths, §6.) */
export function wouldAcceptMove(state: GameState, playerId: PlayerId, toClub: ClubId): boolean {
  return evaluateApproach(state, { playerId, toClub }).willing;
}
