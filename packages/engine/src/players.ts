/**
 * Real-player instantiation and squad-strength derivation (§4, §9e, §15).
 *
 * The world holds REAL, curated players ONLY — no procedural generation, no
 * regens (`instantiateCuratedSeed` is the single source of truth for turning a
 * CuratedSeed into a live player). The squad DEPTH a reserve/academy side would
 * provide is modelled abstractly in the strength calc (`clubDepthPad`), never as
 * invented bodies, so whichever club is inspected reads true, name by name.
 *
 * Squad strength for the season sim is DERIVED from the real squad (weighted XI +
 * depth, §15), padded to shape by abstract depth, but ANCHORED so it equals the
 * club's authored `baseStrength` at kickoff — preserving M2's calibrated tables —
 * then drifts as the squad changes through transfers (M3) and development (M5).
 */

import type {
  ClubId,
  GameState,
  PlayerId,
  PlayerState,
  Position,
  Personality,
  ResistanceProfile,
} from './types.js';
import type { CuratedSeed } from './data/curated-1999.js';
import { Rng } from './rng.js';
import { suggestWage } from './finance.js';
import { effectiveAbility } from './adaptation.js';

/** Marquee clubs a player might carry as a boyhood/dream pull (§6). */
const DREAM_POOL: ClubId[] = ['real_madrid', 'barcelona', 'man_utd', 'bayern', 'milan'];

/** Build a transfer-resistance profile (§6) from personality, age and level. */
export function buildResistance(
  personality: Personality,
  nationality: string,
  age: number,
  ability: number,
  rng: Rng,
): ResistanceProfile {
  const clubLoyalty = Math.max(5, Math.min(98, personality.loyalty * 9 + rng.int(-8, 8)));
  const careerStagePull =
    age <= 22 ? 'prove' : age >= 30 ? 'legacy' : ability < 64 && age >= 27 ? 'payday' : 'peak';
  return {
    clubLoyalty,
    culturalAnchors: [nationality],
    dreamClubs: rng.chance(0.15) ? [rng.pick(DREAM_POOL)] : [],
    agentInfluence: rng.int(20, 85),
    careerStagePull,
    hardBlocks: [],
  };
}

/**
 * Instantiate a curated real player from its seed — the single source of truth for
 * turning a CuratedSeed into a live PlayerState, shared by game creation (the
 * kickoff squads) and academy intakes (the real next generation arriving mid-save).
 */
export function instantiateCuratedSeed(seed: CuratedSeed, year: number, rng: Rng): PlayerState {
  const { hardBlocks, loyalty, ...rest } = seed;
  const age = year - seed.birthYear;
  const player: PlayerState = {
    ...rest,
    positions: [...seed.positions],
    personality: { ...seed.personality },
    birthCeiling: seed.potentialCeiling,
    wage: 0,
    curated: true,
    fitness: 100,
    morale: 78,
    form: 0,
    injury: null,
    injuryHistory: 0,
    wonderkid: seed.potentialCeiling >= 85 && age <= 21,
    benchedDevSeasons: 0,
    reachedPotential: false,
    lastSeason: null,
    seasonMonthsInjured: 0,
    adaptation: null,
    resistance: buildResistance(seed.personality, seed.nationality, age, seed.ability, rng),
    agitation: 0,
  };
  if (loyalty !== undefined) player.resistance.clubLoyalty = loyalty;
  if (hardBlocks) player.resistance.hardBlocks = hardBlocks.map((b) => ({ ...b }));
  player.wage = suggestWage(player, year);
  return player;
}


// ── Squad-strength derivation (§15) ──────────────────────────────────────────

/** Position group for XI selection (a striker can't fill a centre-back slot). */
function strengthGroup(p: PlayerState): 'GK' | 'DEF' | 'MID' | 'ATT' {
  const pos = p.positions[0] ?? 'CM';
  if (pos === 'GK') return 'GK';
  if (pos === 'CB' || pos === 'LB' || pos === 'RB') return 'DEF';
  if (pos === 'DM' || pos === 'CM' || pos === 'AM') return 'MID';
  return 'ATT';
}

/** A 4-3-3 skeleton: you field ONE team, so a fourth striker is depth, not XI. */
const FORMATION: Record<'GK' | 'DEF' | 'MID' | 'ATT', number> = { GK: 1, DEF: 4, MID: 3, ATT: 3 };

/** Abstract squad depth (§4, no-regens): the quality of the unmodelled reserve
 *  players a club fields BELOW its real, named spine, expressed as ability pegs
 *  rather than as procedural filler in the world. `xiPeg` fills XI slots a thin
 *  real spine can't (≈ the club's own level); `benchPeg` fills the bench. */
export interface DepthPad {
  xiPeg: number;
  benchPeg: number;
  benchSize?: number;
}

/** A club's abstract depth, pegged to its authored level. Mirrors the old
 *  procedural-filler targets (first-team ≈ base+2, depth ≈ base−11) so replacing
 *  named filler with a number leaves strength dynamics essentially unchanged. */
export function clubDepthPad(baseStrength: number): DepthPad {
  return { xiPeg: Math.min(99, baseStrength + 2), benchPeg: Math.max(30, baseStrength - 11), benchSize: 9 };
}

/** How many of the XI's best count toward the star term. Summing each one's
 *  MARGIN over a FIXED replacement level keeps the term monotonic and responsive:
 *  pull one talisman out and the sum drops by his margin (a bench player of
 *  ~replacement quality takes his place). The reference must be FIXED, not the
 *  squad's own mean or bench — those shift when the star leaves and perversely
 *  inflate the survivors' margins, masking the loss. */
const STAR_CORE = 4;
/** A replacement-level top-division regular. A player at or below this adds no
 *  star premium; the margin above it is what a talisman brings to the continent. */
const STAR_REPLACEMENT = 74;
/** The star weight the CONTINENTAL game uses (§ butterfly showcase). Domestic
 *  strength passes 0 — the league tables, ageing curves and board calibration all
 *  run on the flat mean, untouched. The Champions League passes this, so a side
 *  truly built around superstars is stronger in the knockout than eleven
 *  journeymen of the same mean, and — the point — loses more than the mean when
 *  one of those stars is prised away. Only butterfly (non-reality) moves bank the
 *  change (see `ClubState.starButterfly`), so a passive world still reproduces
 *  the real winners exactly. */
export const STAR_WEIGHT_CL = 0.2;

/**
 * Best available XI by POSITION, plus a depth bonus and (optionally) a star term.
 * Crucially the XI is filled to a real shape (a 4-3-3), so stacking one position
 * has sharply diminishing returns — a third elite striker rides the bench
 * (depth), he doesn't add a fourth forward to the team. Prevents "buy every star"
 * from inflating strength past a balanced side (§15, and the governing "no
 * fantasy leaps" constraint).
 *
 * `starWeight` defaults to 0 — the flat, calibrated mean used everywhere domestic.
 * A positive weight (the Champions League) adds a CONVEX peak term: the summed
 * MARGIN of the XI's best few over a fixed replacement level. A balanced XI has
 * ~zero premium; a star-built one loses that premium — and more than the mean —
 * when a talisman departs, which is what makes the continental butterfly bite.
 */
export function deriveRawStrength(players: PlayerState[], starWeight = 0, pad?: DepthPad): number {
  if (players.length === 0 && !pad) return 0;
  // Effective ability so an unsettled signing (adaptation penalty) genuinely
  // weakens the XI while he beds in (§3).
  const byGroup: Record<string, number[]> = { GK: [], DEF: [], MID: [], ATT: [] };
  for (const p of players) byGroup[strengthGroup(p)]!.push(effectiveAbility(p));
  for (const g of Object.keys(byGroup)) byGroup[g]!.sort((a, b) => b - a);

  const xi: number[] = [];
  const leftover: number[] = [];
  for (const g of ['GK', 'DEF', 'MID', 'ATT'] as const) {
    const need = FORMATION[g];
    const real = byGroup[g]!;
    xi.push(...real.slice(0, need));
    // ABSTRACT DEPTH (§4, real-players-only): a position short of real bodies is
    // filled to shape by unmodelled squad depth pegged to the club's level — the
    // "no regens" replacement for anonymous filler players. The world holds only
    // real names; the depth a real academy/reserve side would provide lives here
    // as a number, so a thin real spine still fields a coherent XI at its level.
    if (pad && real.length < need) for (let k = real.length; k < need; k++) xi.push(pad.xiPeg);
    leftover.push(...real.slice(need));
  }
  leftover.sort((a, b) => b - a);
  // A short position (e.g. only three defenders) is patched from the best
  // leftover — a real side still fields eleven — then, if still short, by depth.
  while (xi.length < 11 && leftover.length) xi.push(leftover.shift()!);
  if (pad) while (xi.length < 11) xi.push(pad.xiPeg);
  // Bench depth to a working size: real reserves first, then abstract depth.
  if (pad) {
    const benchSize = pad.benchSize ?? 9;
    while (leftover.length < benchSize) leftover.push(pad.benchPeg);
  }

  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const xiAvg = avg(xi);
  const depthAvg = avg(leftover.slice(0, 9));
  const base = xiAvg * 0.85 + depthAvg * 0.15;
  if (starWeight === 0) return base;
  // Convex peak: the summed MARGIN of the XI's best few over a FIXED replacement
  // level. Near-zero for a flat side; large for a star-built one — and each
  // talisman's margin vanishes when he is prised away and a bench player takes
  // his place, so a star's exit bites past the linear mean (the counterfactual
  // lever), while a star bought onto a full bench never reaches the top few and
  // so never inflates the buyer.
  const top = [...xi].sort((a, b) => b - a).slice(0, STAR_CORE);
  const starBonus = starWeight * top.reduce((sum, a) => sum + Math.max(0, a - STAR_REPLACEMENT), 0);
  return base + starBonus;
}

/** Squad players for a club, in a stable order. */
export function clubSquadPlayers(state: GameState, clubId: ClubId): PlayerState[] {
  const club = state.clubs[clubId];
  if (!club) return [];
  return club.squad.map((id) => state.players[id]).filter((p): p is PlayerState => !!p);
}

/** A player is available if not currently injured (§9c). */
export function isAvailable(player: PlayerState): boolean {
  return player.injury === null;
}

/** Selectable (fit) squad players — what the season sim can actually field. */
export function availableSquadPlayers(state: GameState, clubId: ClubId): PlayerState[] {
  return clubSquadPlayers(state, clubId).filter(isAvailable);
}

/**
 * A club's STAR PREMIUM: how much its star-weighted XI outstrips the flat mean
 * the domestic model runs on (§ butterfly showcase). The Champions League tracks
 * the change in this across BUTTERFLY (non-reality) transfers only (see
 * `ClubState.starButterfly`), so a squad gutted of its talismen by a deviation is
 * weaker on the continent than the mean alone says — the counterfactual lever —
 * while reality's own star shuffles and ordinary ageing leave it untouched.
 */
export function clubStarPremium(state: GameState, clubId: ClubId): number {
  const players = availableSquadPlayers(state, clubId);
  return deriveRawStrength(players, STAR_WEIGHT_CL) - deriveRawStrength(players);
}

/**
 * One player's CONTINENTAL value — the margin over replacement level his ability
 * carries into the Champions League star model. Used to price a MISSED real
 * target (§ butterfly showcase): a club denied a talisman and left with a lesser
 * man is weaker in Europe by the gap between the two (Duff is no Ronaldinho).
 */
export function playerStarValue(ability: number): number {
  return Math.max(0, ability - STAR_REPLACEMENT) * STAR_WEIGHT_CL;
}

/**
 * Recompute a club's live `strength` from its currently-AVAILABLE squad,
 * anchored so a fully-fit squad equals `baseStrength`. Injuries drop the best
 * XI to the next-best available player, so losing a star measurably weakens the
 * side while depth mitigates (§9c) — call after squad, injury, or development
 * changes.
 */
export function recomputeClubStrength(state: GameState, clubId: ClubId): void {
  const club = state.clubs[clubId];
  if (!club) return;
  const raw = deriveRawStrength(availableSquadPlayers(state, clubId), 0, clubDepthPad(club.baseStrength));
  club.strength = Math.max(20, Math.min(99, club.baseStrength + (raw - club.squadStrengthAnchor)));
  club.chemistryPenalty = squadChemistryPenalty(state, clubId);
}

/** The anchored raw strength of a club's currently-available squad, padded with
 *  its abstract depth. The single source of truth for both the kickoff anchor and
 *  live recomputation, so `strength` reads exactly `baseStrength` when unchanged. */
export function clubAnchorRaw(state: GameState, clubId: ClubId): number {
  const club = state.clubs[clubId];
  if (!club) return 0;
  return deriveRawStrength(availableSquadPlayers(state, clubId), 0, clubDepthPad(club.baseStrength));
}

// ── Squad chemistry / balance (§ over-stacking) ──────────────────────────────
/** A genuine star for chemistry purposes. Below this, players slot in as depth
 *  and squad-fillers without ego friction. */
const CHEM_STAR = 86;
/** Star-quality slots a matchday XI can actually field per zone — beyond these,
 *  the extra stars are surplus egos, not a stronger team. */
const CHEM_SLOTS: Record<'GK' | 'DEF' | 'MID' | 'ATT', number> = { GK: 1, DEF: 4, MID: 3, ATT: 3 };
const CHEM_SURPLUS_WEIGHT = 2.2;
const CHEM_MAX = 10;

/** Attacking midfielders are forwards for balance — a #10 competes with the front
 *  line for star roles, not with the holding midfield. */
function chemGroupOf(pos: Position): 'GK' | 'DEF' | 'MID' | 'ATT' {
  if (pos === 'GK') return 'GK';
  if (pos === 'CB' || pos === 'LB' || pos === 'RB') return 'DEF';
  if (pos === 'DM' || pos === 'CM') return 'MID';
  return 'ATT'; // AM, LW, RW, ST
}

/**
 * Effective-strength drag from an over-stacked, unbalanced squad. Count the genuine
 * stars in each zone; every star beyond what the XI can field there is a surplus ego
 * that sours the dressing room and the shape. A balanced elite squad has none and is
 * untouched — the drag only bites a hoarder (post-2003 Madrid, MSN-era PSG), which
 * is exactly why buying a fifth galáctico for the same three shirts makes you worse.
 */
export function squadChemistryPenalty(state: GameState, clubId: ClubId): number {
  const counts: Record<'GK' | 'DEF' | 'MID' | 'ATT', number> = { GK: 0, DEF: 0, MID: 0, ATT: 0 };
  for (const p of clubSquadPlayers(state, clubId)) {
    if (p.ability >= CHEM_STAR) counts[chemGroupOf(p.positions[0] ?? 'CM')] += 1;
  }
  let surplus = 0;
  for (const g of ['GK', 'DEF', 'MID', 'ATT'] as const) surplus += Math.max(0, counts[g] - CHEM_SLOTS[g]);
  return Math.min(CHEM_MAX, surplus * CHEM_SURPLUS_WEIGHT);
}

/** The stars squeezed out by an over-stack — in each over-filled zone, the lesser
 *  of the glut (the men who won't start), who chafe at the lack of minutes. */
export function overstackedStars(state: GameState, clubId: ClubId): PlayerState[] {
  const byGroup: Record<'GK' | 'DEF' | 'MID' | 'ATT', PlayerState[]> = { GK: [], DEF: [], MID: [], ATT: [] };
  for (const p of clubSquadPlayers(state, clubId)) {
    if (p.ability >= CHEM_STAR) byGroup[chemGroupOf(p.positions[0] ?? 'CM')].push(p);
  }
  const surplus: PlayerState[] = [];
  for (const g of ['GK', 'DEF', 'MID', 'ATT'] as const) {
    const stars = byGroup[g].sort((a, b) => b.ability - a.ability); // best keep the shirts
    surplus.push(...stars.slice(CHEM_SLOTS[g])); // the rest are surplus to the XI
  }
  return surplus;
}

/**
 * Re-baseline a club's strength to `target`, re-anchoring so its currently
 * available squad reads exactly that. Used by the reality strength arcs
 * (strengthArcs.ts) to make a rival follow its real historical trajectory — a
 * Chelsea that surges under Abramovich, a Leeds that collapses — rather than
 * sitting frozen at its kickoff prestige. A butterfly (starButterfly) still
 * layers on top in matchStrength/clStrength, so a user raid deviates from the arc.
 */
export function reanchorClubStrength(state: GameState, clubId: ClubId, target: number): void {
  const club = state.clubs[clubId];
  if (!club) return;
  club.baseStrength = Math.max(20, Math.min(99, target));
  club.squadStrengthAnchor = clubAnchorRaw(state, clubId);
  recomputeClubStrength(state, clubId);
}

/** Sum of a club's committed wages. */
export function computeWageBill(state: GameState, clubId: ClubId): number {
  return clubSquadPlayers(state, clubId).reduce((acc, p) => acc + p.wage, 0);
}
