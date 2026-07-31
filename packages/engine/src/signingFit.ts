/**
 * Squad-role assessment for a prospective signing (§ "would this actually improve
 * the team?").
 *
 * `coachFit` answers whether a player suits the coach's STYLE and dressing room.
 * This answers the orthogonal, footballing question the Director actually asks:
 * does he make the SIDE better? A genuine upgrade at a position you're weak in
 * (Nedvěd for Savio on the left) is a strong move; a third right-winger behind
 * Figo is not — he'd rotate, not add a dimension you lack. The strength model
 * already damps a bench-warmer's contribution, but it reasons only in broad
 * bands (DEF/MID/ATT); this reads the SPECIFIC position and flank so the boardroom
 * can give the Director honest arguments for and against.
 *
 * Pure and read-only — it inspects the squad but changes nothing.
 */

import type { ClubId, GameState, PlayerState, Position } from './types.js';
import { effectiveAbility } from './adaptation.js';
import { clubSquadPlayers } from './players.js';

/** How many of each specific position a balanced side starts — the yardstick for
 *  "are we already covered here?". Roughly a 4-3-3: two centre-backs and two
 *  central midfielders, one of everything else. */
const SLOTS: Record<Position, number> = {
  GK: 1, RB: 1, LB: 1, CB: 2, DM: 1, CM: 2, AM: 1, LW: 1, RW: 1, ST: 1,
};

const FLANK: Partial<Record<Position, 'left' | 'right'>> = {
  LB: 'left', LW: 'left', RB: 'right', RW: 'right',
};

const POS_LABEL: Record<Position, string> = {
  GK: 'goalkeeper', RB: 'right-back', LB: 'left-back', CB: 'centre-back', DM: 'holding midfield',
  CM: 'central midfield', AM: 'attacking midfield', LW: 'the left', RW: 'the right', ST: 'up front',
};

export type SigningRole = 'upgrade' | 'starter' | 'rotation' | 'surplus';

export interface SigningAssessment {
  /** The position at which he most improves the side. */
  position: Position;
  role: SigningRole;
  /** The man he'd push out of the XI at that position, if any. */
  displaces: string | null;
  /** Marginal ability gain at his best slot (ability points), ≥0. */
  slotGain: number;
  for: string[];
  against: string[];
  summary: string;
}

interface SlotRead {
  pos: Position;
  gain: number; // his ability over the man he'd replace / the gap he fills
  incumbent: PlayerState | null; // the starter he'd displace (null = a gap)
  starters: PlayerState[]; // current best `SLOTS[pos]` at this position
  covered: boolean; // already ≥ SLOTS[pos] bodies at his level or better
}

/** Read how the player fits each position he can play at the club. */
function readSlots(state: GameState, clubId: ClubId, player: PlayerState): SlotRead[] {
  const squad = clubSquadPlayers(state, clubId).filter((p) => p.id !== player.id);
  return player.positions.map((pos) => {
    const need = SLOTS[pos] ?? 1;
    const here = squad
      .filter((p) => p.positions.includes(pos))
      .sort((a, b) => effectiveAbility(b) - effectiveAbility(a));
    const starters = here.slice(0, need);
    if (starters.length < need) {
      // A position short of bodies — he fills a real gap.
      return { pos, gain: Math.max(0, player.ability - 68), incumbent: null, starters, covered: false };
    }
    const weakestStarter = starters[starters.length - 1]!;
    const gain = player.ability - effectiveAbility(weakestStarter);
    // Covered if there's already an equal-or-better body BEYOND the starters (real depth).
    const backup = here[need];
    const covered = gain <= 0 && !!backup && effectiveAbility(backup) >= player.ability - 2;
    return { pos, gain, incumbent: gain > 0 ? weakestStarter : null, starters, covered };
  });
}

/**
 * Assess whether a signing improves the SIDE, with arguments for and against.
 * Chooses the position at which he most helps, then reads the surrounding squad
 * for redundancy, flank balance, and blocked youth.
 */
export function assessSigning(state: GameState, clubId: ClubId, player: PlayerState): SigningAssessment {
  const reads = readSlots(state, clubId, player);
  // His best role is at the position where he most improves the XI.
  const best = reads.slice().sort((a, b) => b.gain - a.gain)[0]!;
  const pos = best.pos;
  const label = POS_LABEL[pos];
  const forArgs: string[] = [];
  const against: string[] = [];

  let role: SigningRole;
  if (best.incumbent === null && best.starters.length < (SLOTS[pos] ?? 1)) {
    role = best.gain >= 6 ? 'upgrade' : 'starter';
    forArgs.push(`You're light at ${label} — he walks into a spot you actually need filled.`);
  } else if (best.gain >= 4) {
    role = 'upgrade';
    forArgs.push(`A clear upgrade on ${best.incumbent!.name} (${Math.round(effectiveAbility(best.incumbent!))}) at ${label} — straight into the XI.`);
  } else if (best.gain >= 1) {
    role = 'starter';
    forArgs.push(`Marginally better than ${best.incumbent!.name} at ${label} — he'd nose ahead, but it's a sideways-and-up move, not a transformation.`);
  } else {
    // He doesn't better the incumbent anywhere.
    const closest = reads.slice().sort((a, b) => b.gain - a.gain)[0]!;
    role = closest.gain >= -2 ? 'rotation' : 'surplus';
    const names = closest.starters.map((p) => p.name).join(' and ');
    if (role === 'rotation') {
      forArgs.push(`Genuine competition for ${names} at ${label} — useful depth for two fronts, without obviously strengthening the first XI.`);
    } else {
      against.push(`You're already well-stocked at ${label} (${names}) — he'd rotate at best, not add a dimension you lack.`);
    }
  }

  // Quality / European ceiling — a real talisman raises the top end even if he's
  // "only" one of eleven.
  if (player.ability >= 86 && role !== 'surplus') {
    forArgs.push(`At ${player.ability} he raises the ceiling on the biggest nights — the kind of individual who wins a European tie on his own.`);
  }

  // Versatility across more than one line is a squad asset.
  if (player.positions.length >= 2 && role !== 'surplus') {
    forArgs.push(`Covers ${player.positions.join('/')}, so he gives the coach more than one way to use him.`);
  }

  // Flank balance: signing onto a flank you already own, while the other flank is
  // thinner, buys width you don't need at the cost of the side you do.
  const flank = FLANK[pos];
  if (flank) {
    const squad = clubSquadPlayers(state, clubId).filter((p) => p.id !== player.id);
    const sameFlankStar = squad.find(
      (p) => p.positions.some((q) => FLANK[q] === flank) && p.ability >= 84,
    );
    const otherFlank = flank === 'left' ? 'right' : 'left';
    const otherFlankStar = squad.find((p) => p.positions.some((q) => FLANK[q] === otherFlank) && p.ability >= 82);
    if (sameFlankStar && best.gain < 4) {
      against.push(
        `You already have ${sameFlankStar.name} on ${flank === 'left' ? 'the left' : 'the right'} — two natural ${flank}-siders overload one flank${otherFlankStar ? '' : `, and ${otherFlank === 'left' ? 'the left' : 'the right'} is the thinner side`}.`,
      );
    }
  }

  // Blocking a prospect: a young high-ceiling player at his position who needs games.
  const squad = clubSquadPlayers(state, clubId).filter((p) => p.id !== player.id);
  const year = Number(state.clock.date.slice(0, 4));
  const blockedYouth = squad.find(
    (p) => p.positions.includes(pos) && year - p.birthYear <= 21 && p.potentialCeiling - p.ability >= 8,
  );
  if (blockedYouth && role !== 'upgrade') {
    against.push(`${blockedYouth.name} is coming through at ${label} and needs minutes — this signing stalls him.`);
  }

  // Age: a short-term fix vs a long build.
  const age = year - player.birthYear;
  if (age >= 31) against.push(`At ${age} he's a short-term answer, not one to build around.`);
  else if (age <= 23 && (player.potentialCeiling - player.ability) >= 6) forArgs.push(`At ${age} with room to grow, he improves the side AND appreciates.`);

  const summary =
    role === 'upgrade'
      ? `A strong move: a real upgrade at ${label}.`
      : role === 'starter'
        ? `A sensible signing that nudges the XI forward at ${label}.`
        : role === 'rotation'
          ? `Squad depth at ${label} rather than a first-XI upgrade.`
          : `Hard to justify on footballing grounds — the squad is already covered at ${label}.`;

  return { position: pos, role, displaces: best.incumbent?.name ?? null, slotGain: Math.max(0, Math.round(best.gain)), for: forArgs, against, summary };
}
