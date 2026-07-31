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
import {
  clubSquadPlayers,
  availableSquadPlayers,
  deriveRawStrength,
  clubDepthPad,
  squadChemistryPenalty,
} from './players.js';

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

// ── Departure assessment: what selling him would cost ────────────────────────

export type DepartureRole = 'key' | 'starter' | 'squad' | 'fringe';

export interface DepartureAssessment {
  role: DepartureRole;
  /** Strength points the XI loses — INCLUDING any balance hole the sale opens
   *  (the shape-aware strength calc means losing your only holder costs extra). */
  strengthLoss: number;
  /** The specific gap the sale opens, if he uniquely holds a role. */
  hole: string | null;
  /** How badly the dressing room takes it. */
  moraleRisk: 'high' | 'some' | 'low';
  for: string[]; // reasons to cash in
  against: string[]; // reasons to keep
  summary: string;
}

const POS_LABEL_D: Record<Position, string> = {
  GK: 'in goal', RB: 'at right-back', LB: 'at left-back', CB: 'at centre-back', DM: 'holding midfield',
  CM: 'in central midfield', AM: 'at No.10', LW: 'on the left', RW: 'on the right', ST: 'up front',
};

/**
 * Assess what SELLING one of your own would cost — the mirror of assessSigning.
 * Weighs the hole it leaves (strength AND shape: losing your only holder or your
 * only left-sided player bites past his rating), the dressing-room ripple (a loyal
 * talisman is a blow; a surplus ego eases a logjam), and whether he's genuinely
 * surplus. Pure and read-only.
 */
export function assessDeparture(state: GameState, clubId: ClubId, player: PlayerState): DepartureAssessment {
  const club = state.clubs[clubId];
  const year = Number(state.clock.date.slice(0, 4));
  const age = year - player.birthYear;
  const forArgs: string[] = [];
  const against: string[] = [];

  // Strength (and balance) lost, via the shape-aware calc: rebuild the raw XI with
  // and without him. The difference already carries any hole the sale opens.
  const pad = club ? clubDepthPad(club.baseStrength) : undefined;
  const avail = availableSquadPlayers(state, clubId);
  const rawNow = deriveRawStrength(avail, 0, pad);
  const rawAfter = deriveRawStrength(avail.filter((p) => p.id !== player.id), 0, pad);
  const strengthLoss = Math.max(0, Math.round((rawNow - rawAfter) * 10) / 10);

  // Is he a starter at his best position? (top slots by ability at that position).
  const SLOT: Record<Position, number> = { GK: 1, RB: 1, LB: 1, CB: 2, DM: 1, CM: 2, AM: 1, LW: 1, RW: 1, ST: 1 };
  const others = clubSquadPlayers(state, clubId).filter((p) => p.id !== player.id);
  const startsSomewhere = player.positions.some((pos) => {
    const ahead = others.filter((p) => p.positions.includes(pos) && effectiveAbility(p) >= effectiveAbility(player)).length;
    return ahead < (SLOT[pos] ?? 1);
  });
  let role: DepartureRole;
  if (startsSomewhere && (player.ability >= 84 || strengthLoss >= 2)) role = 'key';
  else if (startsSomewhere) role = 'starter';
  else if (player.ability >= 76) role = 'squad';
  else role = 'fringe';

  // A hole he uniquely holds: the only holder, or the only presence on a flank.
  let hole: string | null = null;
  const lists = (pos: Position) => player.positions.includes(pos);
  const othersList = (pos: Position) => others.some((p) => p.positions.includes(pos));
  if (lists('DM') && !othersList('DM')) {
    hole = `He is your only genuine holding midfielder — sell him and nothing shields the back four.`;
  } else if ((lists('LB') || lists('LW')) && !others.some((p) => p.positions.some((q) => q === 'LB' || q === 'LW'))) {
    hole = `He is your only natural left-sided player — the left flank goes bare.`;
  } else if ((lists('RB') || lists('RW')) && !others.some((p) => p.positions.some((q) => q === 'RB' || q === 'RW'))) {
    hole = `He is your only natural right-sided player — the right flank goes bare.`;
  } else if (lists('ST') && !othersList('ST') && !othersList('AM')) {
    hole = `He is your only recognised striker — there's no focal point without him.`;
  }

  // Dressing-room ripple. A loyal, senior talisman hurts; a bit-part barely registers.
  const loyalty = player.personality?.loyalty ?? 5;
  const talisman = player.ability >= 84;
  const beloved = loyalty >= 7 || (age >= 30 && talisman);
  const moraleRisk: 'high' | 'some' | 'low' =
    talisman && beloved ? 'high' : talisman || (beloved && player.ability >= 80) ? 'some' : 'low';

  // Chemistry: does moving him EASE an over-stacked zone? (a surplus ego cleared).
  const chemBefore = squadChemistryPenalty(state, clubId);
  const without = { ...state, clubs: { ...state.clubs, [clubId]: { ...club!, squad: club!.squad.filter((id) => id !== player.id) } } } as GameState;
  const chemAfter = squadChemistryPenalty(without, clubId);
  const epar = chemBefore - chemAfter;

  // Arguments — for cashing in…
  if (role === 'fringe') forArgs.push(`He's on the fringes — you can bank the fee without weakening the first XI.`);
  else if (role === 'squad') forArgs.push(`Useful squad man, not a mainstay — sellable if the fee is right or he wants to play.`);
  if (age >= 31) forArgs.push(`At ${age} his resale value only falls from here — cashing in now is sound business.`);
  if (epar > 0.5) forArgs.push(`Clearing him eases a star logjam — the men behind him finally get their minutes.`);
  if (player.morale < 45) forArgs.push(`He's unsettled (morale ${Math.round(player.morale)}) — a disgruntled player kept against his will drags others down too.`);

  // …and for keeping.
  if (role === 'key') against.push(`A key man ${POS_LABEL_D[player.positions[0] ?? 'CM']} — the XI is materially weaker without him (about -${strengthLoss} strength).`);
  else if (role === 'starter') against.push(`A first-choice starter — you'd need to replace him, not just pocket the fee.`);
  if (hole) against.push(hole);
  if (moraleRisk === 'high') against.push(`A dressing-room blow: he's a loyal figure and losing him will unsettle the squad.`);
  else if (moraleRisk === 'some') against.push(`Selling a name like his sends a message — expect some dressing-room grumbling.`);

  const summary =
    role === 'fringe'
      ? `Low-risk sale — squad fringe, little lost on the pitch.`
      : hole
        ? `Sell with caution — it tears a specific hole in the side.`
        : role === 'key'
          ? `A big call: he's central to the team, on the pitch and off it.`
          : `A judgement call — a useful player, but not one who unbalances the side to lose.`;

  return { role, strengthLoss, hole, moraleRisk, for: forArgs, against, summary };
}
