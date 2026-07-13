/**
 * Player generation and squad-strength derivation (§4, §9e, §15).
 *
 * Procedural filler is generated with realistic name/nationality distributions
 * (weighted by the club's region), a realistic potential curve (most are
 * filler), position needs, and age spread. Curated real players (see
 * data/curated-1999.ts) are layered on top for the vertical-slice club.
 *
 * Squad strength for the season sim is DERIVED from the squad (weighted XI +
 * depth, §15) but ANCHORED so it equals the club's authored `baseStrength` at
 * kickoff — preserving M2's calibrated tables — then drifts as the squad
 * changes through transfers (M3) and development (M5).
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

// ── Name & nationality pools by region ───────────────────────────────────────

interface Region {
  nationalities: string[];
  first: string[];
  last: string[];
}

const REGIONS: Record<string, Region> = {
  britain: {
    nationalities: ['England', 'England', 'England', 'Scotland', 'Wales', 'Ireland', 'N. Ireland'],
    first: ['Jack', 'Harry', 'Tom', 'James', 'Michael', 'David', 'Paul', 'Lee', 'Craig', 'Scott', 'Danny', 'Ryan', 'Wayne', 'Andy', 'Gary', 'Steven', 'Ashley', 'Joe', 'Sam', 'Kevin', 'Mark', 'Neil'],
    last: ['Smith', 'Taylor', 'Brown', 'Wilson', 'Walker', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Roberts', 'Johnson', 'Clarke', 'Hughes', 'Green', 'Hall', 'Cooper', 'Ward', 'Baker', 'Carter', 'Phillips', 'Turner', 'Parker', 'Collins', 'Murphy', 'Kelly', 'Reid'],
  },
  iberia: {
    nationalities: ['Spain', 'Spain', 'Spain', 'Portugal', 'Argentina', 'Brazil'],
    first: ['Carlos', 'Javier', 'Sergio', 'Pablo', 'Raúl', 'Fernando', 'Diego', 'Álvaro', 'Rubén', 'Iván', 'Jesús', 'Marcos', 'David', 'Antonio', 'Miguel', 'José', 'Luis', 'Andrés', 'Xavi', 'Gonzalo'],
    last: ['García', 'Martínez', 'López', 'Sánchez', 'Fernández', 'Gómez', 'Ruiz', 'Díaz', 'Moreno', 'Álvarez', 'Romero', 'Torres', 'Navarro', 'Ramos', 'Vidal', 'Castro', 'Silva', 'Costa', 'Reyes', 'Herrera'],
  },
  italy: {
    nationalities: ['Italy', 'Italy', 'Italy', 'Italy'],
    first: ['Marco', 'Alessandro', 'Andrea', 'Francesco', 'Luca', 'Matteo', 'Giovanni', 'Roberto', 'Stefano', 'Fabio', 'Paolo', 'Antonio', 'Davide', 'Simone', 'Gianluca', 'Cristian', 'Massimo', 'Daniele', 'Emiliano', 'Riccardo'],
    last: ['Rossi', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri'],
  },
  germanic: {
    nationalities: ['Germany', 'Germany', 'Germany', 'Austria', 'Switzerland', 'Netherlands'],
    first: ['Michael', 'Thomas', 'Stefan', 'Andreas', 'Markus', 'Jan', 'Sven', 'Lars', 'Dennis', 'Kai', 'Jens', 'Oliver', 'Tobias', 'Christian', 'Marcel', 'Patrick', 'Robin', 'Niklas', 'Florian', 'Max'],
    last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Braun', 'Krüger', 'Hofmann', 'Vogel'],
  },
  world: {
    nationalities: ['France', 'Brazil', 'Argentina', 'Nigeria', 'Ghana', 'Senegal', 'Croatia', 'Serbia', 'Denmark', 'Sweden', 'Norway', 'Belgium'],
    first: ['Didier', 'Emmanuel', 'Youssef', 'Kolo', 'Nwankwo', 'Ola', 'Zlatan', 'Dado', 'Sinisa', 'Thomas', 'Marc', 'Olof', 'Henri', 'Bruno', 'Salif', 'Papa', 'Nemanja', 'Ivan', 'Jesper', 'Ole'],
    last: ['Diarra', 'Traoré', 'Okocha', 'Kanu', 'Ibrahimović', 'Prso', 'Mihajlović', 'Sørensen', 'Larsson', 'Solskjær', 'Diouf', 'Camara', 'Vidić', 'Rakitić', 'Boateng', 'Essien', 'Touré', 'Adebayor', 'Drogba', 'Eto'],
  },
};

/** Primary talent region for each club (drives name/nationality weighting). */
const CLUB_REGION: Record<ClubId, keyof typeof REGIONS> = {
  real_madrid: 'iberia',
  barcelona: 'iberia',
  juventus: 'italy',
  milan: 'italy',
  inter: 'italy',
  bayern: 'germanic',
};

function regionForClub(clubId: ClubId, leagueId: string | null): keyof typeof REGIONS {
  if (CLUB_REGION[clubId]) return CLUB_REGION[clubId]!;
  if (leagueId === 'eng-1') return 'britain';
  return 'world';
}

// ── Squad composition ────────────────────────────────────────────────────────

/** A realistic 25-man squad's positional makeup. */
const SQUAD_TEMPLATE: Position[] = [
  'GK', 'GK', 'GK',
  'CB', 'CB', 'CB', 'CB',
  'LB', 'LB', 'RB', 'RB',
  'DM', 'DM', 'CM', 'CM', 'CM', 'AM', 'AM',
  'LW', 'LW', 'RW', 'RW',
  'ST', 'ST', 'ST',
];

export interface GeneratePlayerOptions {
  /** Caller-supplied unique, stable id (no hidden global state → determinism). */
  id: PlayerId;
  clubId: ClubId;
  leagueId: string | null;
  position: Position;
  /** Target ability center; actual is a spread around this. */
  targetAbility: number;
  currentYear: number;
  /** Bias toward youth (prospects) or a settled pro. */
  ageBias?: 'young' | 'prime' | 'veteran' | 'mixed';
  rng: Rng;
}

function pickName(region: Region, rng: Rng): { name: string; nationality: string } {
  const first = rng.pick(region.first);
  const last = rng.pick(region.last);
  const nationality = rng.pick(region.nationalities);
  return { name: `${first} ${last}`, nationality };
}

function rollAge(bias: GeneratePlayerOptions['ageBias'], rng: Rng): number {
  switch (bias) {
    case 'young':
      return rng.int(17, 21);
    case 'veteran':
      return rng.int(30, 35);
    case 'prime':
      return rng.int(23, 29);
    default: {
      // Mixed: a realistic squad age pyramid.
      const r = rng.next();
      if (r < 0.18) return rng.int(17, 21);
      if (r < 0.75) return rng.int(22, 29);
      return rng.int(30, 35);
    }
  }
}

function clampAbility(a: number): number {
  return Math.max(32, Math.min(94, Math.round(a)));
}

export function generatePlayer(opts: GeneratePlayerOptions): PlayerState {
  const { rng, clubId, leagueId, position, targetAbility, currentYear } = opts;
  const region = REGIONS[regionForClub(clubId, leagueId)]!;
  const { name, nationality } = pickName(region, rng);
  const age = rollAge(opts.ageBias ?? 'mixed', rng);
  const birthYear = currentYear - age;

  const ability = clampAbility(targetAbility + rng.gaussian(0, 5));

  // Potential: young players can be well above current ability; the upside
  // shrinks with age. Most prospects are filler (small gap); a few are gems.
  let ceiling = ability;
  if (age <= 23) {
    const upsideRoll = rng.next();
    const upside = upsideRoll > 0.92 ? rng.int(10, 20) : upsideRoll > 0.6 ? rng.int(3, 9) : rng.int(0, 3);
    ceiling = Math.min(97, ability + Math.round((upside * (24 - age)) / 6));
  } else if (age <= 27) {
    ceiling = Math.min(97, ability + rng.int(0, 3));
  }

  const personality = {
    professionalism: rng.int(3, 10),
    ego: rng.int(1, 9),
    ambition: rng.int(3, 10),
    loyalty: rng.int(2, 9),
    volatility: rng.int(1, 9),
    adaptability: rng.int(2, 10),
  };

  // Injury proneness: most players low, a minority fragile.
  const injuryProneness = Math.max(5, Math.min(95, Math.round(rng.gaussian(30, 16))));

  const player: PlayerState = {
    id: opts.id,
    name,
    birthYear,
    nationality,
    positions: [position],
    club: clubId,
    contractUntil: currentYear + rng.int(1, 5),
    wage: 0,
    ability,
    potentialCeiling: ceiling,
    birthCeiling: ceiling,
    personality,
    injuryProneness,
    curated: false,
    fitness: 100,
    morale: rng.int(60, 85),
    form: 0,
    injury: null,
    injuryHistory: 0,
    wonderkid: ceiling >= 85 && age <= 21,
    benchedDevSeasons: 0,
    reachedPotential: false,
    lastSeason: null,
    seasonMonthsInjured: 0,
    adaptation: null,
    resistance: buildResistance(personality, nationality, age, ability, rng),
    agitation: 0,
  };
  player.wage = suggestWage(player, currentYear);
  return player;
}

/** Generate a full procedural squad for a club, targeting its base strength. */
export function generateSquad(
  clubId: ClubId,
  leagueId: string | null,
  baseStrength: number,
  currentYear: number,
  rng: Rng,
): PlayerState[] {
  const squad: PlayerState[] = [];
  SQUAD_TEMPLATE.forEach((position, i) => {
    // Front ~14 are first-team quality; the rest are squad depth / prospects.
    const isStarter = i < 14;
    const target = isStarter ? baseStrength + 2 : baseStrength - 11;
    const ageBias = !isStarter && rng.chance(0.4) ? 'young' : 'mixed';
    squad.push(
      generatePlayer({
        id: `p_${clubId}_${i}`,
        clubId,
        leagueId,
        position,
        targetAbility: target,
        currentYear,
        ageBias,
        rng,
      }),
    );
  });
  return squad;
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
export function deriveRawStrength(players: PlayerState[], starWeight = 0): number {
  if (players.length === 0) return 0;
  // Effective ability so an unsettled signing (adaptation penalty) genuinely
  // weakens the XI while he beds in (§3).
  const byGroup: Record<string, number[]> = { GK: [], DEF: [], MID: [], ATT: [] };
  for (const p of players) byGroup[strengthGroup(p)]!.push(effectiveAbility(p));
  for (const g of Object.keys(byGroup)) byGroup[g]!.sort((a, b) => b - a);

  const xi: number[] = [];
  const leftover: number[] = [];
  for (const g of ['GK', 'DEF', 'MID', 'ATT'] as const) {
    const need = FORMATION[g];
    xi.push(...byGroup[g]!.slice(0, need));
    leftover.push(...byGroup[g]!.slice(need));
  }
  leftover.sort((a, b) => b - a);
  // A short position (e.g. only three defenders) is patched from the best
  // leftover — a real side still fields eleven.
  while (xi.length < 11 && leftover.length) xi.push(leftover.shift()!);

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
  const raw = deriveRawStrength(availableSquadPlayers(state, clubId));
  club.strength = Math.max(20, Math.min(99, club.baseStrength + (raw - club.squadStrengthAnchor)));
}

/** Sum of a club's committed wages. */
export function computeWageBill(state: GameState, clubId: ClubId): number {
  return clubSquadPlayers(state, clubId).reduce((acc, p) => acc + p.wage, 0);
}
