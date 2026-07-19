/**
 * Head coaches (M13) — real names where the era has one, an archetype otherwise.
 *
 * Each scenario's manager is a persona with a playing style, a preferred shape
 * and personality leanings that shape which signings they want and which they'll
 * fight. Guardiola's possession game needs low-ego technicians in a three-man
 * midfield; Klopp's gegenpress wants runners and intensity; a man-manager will
 * take a volatile maverick and get a tune out of him. Real coaches are seeded per
 * scenario; anything unseeded falls back to a balanced coach on the era's shape.
 */

import type { CoachArchetype, GameState, ManagerState, PlayerState, Position, TraitLean } from './types.js';
import type { Formation } from './tactics.js';
import { eraIdealFormation, formationLabel } from './tactics.js';
import { logEvent } from './eventLog.js';
import { parseYearMonth } from './clock.js';
import { clubSquadPlayers } from './players.js';
import { styleDistance, type LeagueStyle } from './leaguestyle.js';

interface ArchetypeProfile {
  style: { physicality: number; tempo: number; technical: number };
  formation: Formation;
  traitLean: TraitLean;
  adaptability: number; // willingness to change shape / accept a signing he didn't ask for
}

const zeroLean: TraitLean = { professionalism: 0, ego: 0, ambition: 0, loyalty: 0, volatility: 0, adaptability: 0 };

const ARCHETYPES: Record<CoachArchetype, ArchetypeProfile> = {
  possession: {
    style: { physicality: 4, tempo: 6, technical: 10 },
    formation: '4-3-3',
    traitLean: { ...zeroLean, professionalism: 3, ego: -2, volatility: -3, adaptability: 2 },
    adaptability: 3, // dogmatic about the system
  },
  gegenpress: {
    style: { physicality: 8, tempo: 10, technical: 6 },
    formation: '4-3-3',
    traitLean: { ...zeroLean, professionalism: 2, ambition: 3, loyalty: 2, volatility: -1 },
    adaptability: 5,
  },
  'pragmatic-counter': {
    style: { physicality: 7, tempo: 6, technical: 6 },
    formation: '4-2-3-1',
    traitLean: { ...zeroLean, professionalism: 2, ambition: 2, loyalty: 2, volatility: -1 },
    adaptability: 4,
  },
  'defensive-block': {
    style: { physicality: 6, tempo: 4, technical: 7 },
    formation: '5-3-2',
    traitLean: { ...zeroLean, professionalism: 3, ego: -1, volatility: -2 },
    adaptability: 3,
  },
  'man-manager': {
    style: { physicality: 7, tempo: 7, technical: 6 },
    formation: '4-4-2',
    traitLean: { ...zeroLean, ambition: 2, loyalty: 2, ego: 1 }, // can handle a big personality
    adaptability: 7,
  },
  balanced: {
    style: { physicality: 6, tempo: 6, technical: 6 },
    formation: '4-2-3-1',
    traitLean: { ...zeroLean, professionalism: 1 },
    adaptability: 6,
  },
};

interface RealCoach {
  identity: string;
  archetype: CoachArchetype;
  formation?: Formation; // override the archetype's default shape
  favourites?: string[];
}

/** Real managers by scenario. Formation overrides where the real coach played a
 *  distinctive shape (Wenger's Invincibles 4-4-2, Ancelotti's narrow 4-2-3-1). */
const REAL_COACHES: Record<string, RealCoach> = {
  'man-utd-1999': { identity: 'Alex Ferguson', archetype: 'man-manager', formation: '4-4-2' },
  'man-utd-2013': { identity: 'David Moyes', archetype: 'pragmatic-counter', formation: '4-4-2' },
  'chelsea-2003': { identity: 'José Mourinho', archetype: 'pragmatic-counter', formation: '4-3-3', favourites: ['Ricardo Carvalho', 'Didier Drogba', 'Paulo Ferreira'] },
  'liverpool-2001': { identity: 'Gérard Houllier', archetype: 'pragmatic-counter', formation: '4-4-2' },
  'liverpool-2010': { identity: 'Roy Hodgson', archetype: 'defensive-block', formation: '4-4-2' },
  'liverpool-1995': { identity: 'Roy Evans', archetype: 'man-manager', formation: '3-5-2' },
  'arsenal-2004': { identity: 'Arsène Wenger', archetype: 'possession', formation: '4-4-2', favourites: ['Thierry Henry', 'Patrick Vieira'] },
  'arsenal-1996': { identity: 'Arsène Wenger', archetype: 'possession', formation: '4-4-2', favourites: ['Emmanuel Petit'] },
  'spurs-2001': { identity: 'Glenn Hoddle', archetype: 'possession', formation: '4-4-2' },
  'spurs-2013': { identity: 'André Villas-Boas', archetype: 'pragmatic-counter', formation: '4-2-3-1' },
  'chelsea-1996': { identity: 'Ruud Gullit', archetype: 'possession', formation: '3-5-2' },
  'man-city-2008': { identity: 'Mark Hughes', archetype: 'pragmatic-counter', formation: '4-4-2' },
  'juventus-1995': { identity: 'Marcello Lippi', archetype: 'defensive-block', formation: '4-3-3' },
  'juventus-2006': { identity: 'Didier Deschamps', archetype: 'balanced', formation: '4-4-2' },
  'milan-1995': { identity: 'Fabio Capello', archetype: 'defensive-block', formation: '4-4-2' },
  'milan-2007': { identity: 'Carlo Ancelotti', archetype: 'man-manager', formation: '4-2-3-1', favourites: ['Kaká'] },
  'inter-1998': { identity: 'Mircea Lucescu', archetype: 'pragmatic-counter', formation: '4-4-2' },
  'inter-2004': { identity: 'Roberto Mancini', archetype: 'pragmatic-counter', formation: '4-4-2' },
  'real-madrid-2000': { identity: 'Vicente del Bosque', archetype: 'man-manager', formation: '4-4-2' },
  'real-madrid-2006': { identity: 'Fabio Capello', archetype: 'defensive-block', formation: '4-4-2' },
  'barcelona-2003': { identity: 'Frank Rijkaard', archetype: 'possession', formation: '4-3-3', favourites: ['Ronaldinho'] },
  'barcelona-2014': { identity: 'Luis Enrique', archetype: 'possession', formation: '4-3-3', favourites: ['Luis Suárez'] },
  'dortmund-1997': { identity: 'Nevio Scala', archetype: 'balanced', formation: '4-4-2' },
  'dortmund-2012': { identity: 'Jürgen Klopp', archetype: 'gegenpress', formation: '4-2-3-1', favourites: ['Robert Lewandowski'] },
  'bayern-1998': { identity: 'Ottmar Hitzfeld', archetype: 'balanced', formation: '4-4-2' },
  'bayern-2009': { identity: 'Louis van Gaal', archetype: 'possession', formation: '4-2-3-1', favourites: ['Arjen Robben'] },
};

// ── Playing style (M13c) ─────────────────────────────────────────────────────

/**
 * How each position tends to play, on the same {physicality, tempo, technical}
 * axes a coach's style uses. Players carry no style data of their own, so a
 * profile is derived from where they play — the honest, calibration-free signal
 * that a ball-playing winger is not a route-one centre-half. (A future curation
 * pass could tag distinctive individuals — a target-man vs a poacher — to
 * override this within a position.)
 */
const POSITION_STYLE: Record<Position, LeagueStyle> = {
  GK: { physicality: 5, tempo: 3, technical: 5 },
  CB: { physicality: 8, tempo: 4, technical: 4 },
  LB: { physicality: 6, tempo: 7, technical: 6 },
  RB: { physicality: 6, tempo: 7, technical: 6 },
  DM: { physicality: 7, tempo: 4, technical: 6 },
  CM: { physicality: 6, tempo: 6, technical: 7 },
  AM: { physicality: 4, tempo: 6, technical: 9 },
  LW: { physicality: 4, tempo: 9, technical: 8 },
  RW: { physicality: 4, tempo: 9, technical: 8 },
  ST: { physicality: 7, tempo: 6, technical: 6 },
};

/** A player's playing-style profile, averaged over the positions he can fill. */
export function playerStyleProfile(player: PlayerState): LeagueStyle {
  const rows = player.positions.map((pos) => POSITION_STYLE[pos]);
  const n = rows.length || 1;
  const sum = rows.reduce(
    (acc, s) => ({
      physicality: acc.physicality + s.physicality,
      tempo: acc.tempo + s.tempo,
      technical: acc.technical + s.technical,
    }),
    { physicality: 0, tempo: 0, technical: 0 },
  );
  return {
    physicality: sum.physicality / n,
    tempo: sum.tempo / n,
    technical: sum.technical / n,
  };
}

// ── Recruitment fit (M13b + M13c) ────────────────────────────────────────────

export type FitVerdict = 'wants' | 'fine' | 'reluctant' | 'veto';

export interface CoachFit {
  score: number; // signed; higher = better fit for this coach's profile
  verdict: FitVerdict;
  reason: string;
}

/** Neutral point of the 1..10 personality scale. */
const TRAIT_MID = 5.5;

/** Professionalism and ambition are uniformly high in elite targets, so they
 *  barely DISCRIMINATE between good players — down-weight them so the coach's
 *  opinion is driven by the traits that actually vary (ego, volatility, loyalty)
 *  and by playing style. Without this every coach "wants" every star. */
const FLAT_TRAIT_WEIGHT = 0.4;
/** Playing-style swing, and the distance at which it turns neutral. */
const STYLE_WEIGHT = 6;
const STYLE_NEUTRAL = 0.28;
/** A coach genuinely COVETS a player above this score (favourites aside). Set so
 *  "wants" is a minority — the players he'd push for, not everyone he'd accept. */
const WANTS_AT = 9;

/**
 * How well a player suits the coach's recruitment profile — on two axes,
 * personality and playing style. A possession coach baulks at a volatile,
 * big-ego maverick a man-manager would take on and rates a ball-playing creator
 * far above a route-one profile; a gegenpress coach wants tempo and running.
 * Favourites from former clubs are wanted outright.
 *
 * `wants` is reserved for players the coach actively covets; most decent signings
 * are `fine` (he'll take him); `reluctant`/`veto` are poor fits. Adaptability
 * doesn't make a coach want MORE players — it makes him TOLERATE poor ones (a
 * flexible coach grumbles where a dogmatic one digs in and vetoes).
 */
export function coachFit(coach: ManagerState, player: PlayerState): CoachFit {
  if (coach.favourites.includes(player.name)) {
    return { score: 100, verdict: 'wants', reason: `${player.name} is one of ${coach.identity}'s own — he wants him back.` };
  }
  const lean = coach.traitLean;
  const per = player.personality;
  const raw =
    lean.professionalism * (per.professionalism - TRAIT_MID) * FLAT_TRAIT_WEIGHT +
    lean.ego * (per.ego - TRAIT_MID) +
    lean.ambition * (per.ambition - TRAIT_MID) * FLAT_TRAIT_WEIGHT +
    lean.loyalty * (per.loyalty - TRAIT_MID) +
    lean.volatility * (per.volatility - TRAIT_MID) +
    lean.adaptability * (per.adaptability - TRAIT_MID);

  const dist = styleDistance(coach.style, playerStyleProfile(player)); // 0..1
  const styleScore = (STYLE_NEUTRAL - dist) * STYLE_WEIGHT;
  const styleDriven = dist <= 0.2; // an unusually good stylistic match
  const styleMismatch = dist > 0.55; // a genuinely wrong profile for his system

  const score = raw + styleScore;
  const tol = Math.max(0, coach.adaptability - 5) * 1.5; // adaptable → tolerates more

  let verdict: FitVerdict;
  if (score >= WANTS_AT) verdict = 'wants';
  else if (score >= -3 - tol) verdict = 'fine';
  else if (score >= -10 - tol) verdict = 'reluctant';
  else verdict = 'veto';

  const reason =
    verdict === 'wants'
      ? styleDriven
        ? `${player.name} fits ${coach.identity}'s system perfectly.`
        : `${coach.identity} rates ${player.name} highly and wants him.`
      : verdict === 'fine'
        ? `${coach.identity} would happily work with ${player.name}.`
        : verdict === 'reluctant'
          ? styleMismatch
            ? `${coach.identity} isn't sure ${player.name} suits how he plays.`
            : `${coach.identity} has doubts about ${player.name}'s temperament.`
          : styleMismatch
            ? `${coach.identity} doesn't want ${player.name} — the wrong profile for his system.`
            : `${coach.identity} doesn't want ${player.name} — too much of a risk in his dressing room.`;
  return { score: Math.round(score * 10) / 10, verdict, reason };
}

/** Build the head coach for a scenario at its opening year. */
export function coachForScenario(scenarioId: string, startYear: number): ManagerState {
  const real = REAL_COACHES[scenarioId];
  const archetype: CoachArchetype = real?.archetype ?? 'balanced';
  const base = ARCHETYPES[archetype];
  const formation = real?.formation ?? (archetype === 'balanced' ? eraIdealFormation(startYear) : base.formation);
  return {
    identity: real?.identity ?? 'Head Coach',
    relationshipWithUser: 60,
    archetype,
    style: { ...base.style },
    preferredFormation: formation,
    activeFormation: formation,
    traitLean: { ...base.traitLean },
    favourites: real?.favourites ?? [],
    adaptability: base.adaptability,
  };
}

// ── Appointing a coach (the Director's prerogative) ──────────────────────────

export interface CoachOption {
  archetype: CoachArchetype;
  label: string;
  style: string;
  formation: Formation;
}

const ARCHETYPE_PROSE: Record<CoachArchetype, string> = {
  possession: 'Possession — patient build-up, technical midfielders, a high line.',
  gegenpress: 'Gegenpressing — high tempo, win it back high, runners everywhere.',
  'pragmatic-counter': 'Pragmatic — a solid shape that hits hard on the counter.',
  'defensive-block': 'Defensive — a deep, compact block that gives little away.',
  'man-manager': 'Man-management — gets a tune out of big characters; flexible shape.',
  balanced: 'Balanced — sets the plan by the opponent, no fixed dogma.',
};

/** The styles the Director can appoint a coach to play, each with its default
 *  shape (used to offer a choice when changing manager). */
export function coachArchetypes(): CoachOption[] {
  return (Object.keys(ARCHETYPES) as CoachArchetype[]).map((archetype) => ({
    archetype,
    label: archetype,
    style: ARCHETYPE_PROSE[archetype],
    formation: ARCHETYPES[archetype].formation,
  }));
}

/**
 * Appoint a new head coach — the boardroom's call, so it always goes through
 * (this is the Director's power, §1). The incoming coach plays the chosen style
 * and shape and starts cautiously aligned with the Director who hired him. Only
 * ever invoked by an explicit user action, so a passive/reality run — and the
 * calibration harness — never touches it.
 */
export function appointCoach(
  state: GameState,
  opts: { identity?: string; archetype?: CoachArchetype; formation?: Formation } = {},
): void {
  const archetype: CoachArchetype = opts.archetype && ARCHETYPES[opts.archetype] ? opts.archetype : 'balanced';
  const base = ARCHETYPES[archetype];
  const formation = opts.formation ?? base.formation;
  const previous = state.managerRelations.identity;
  state.managerRelations = {
    identity: opts.identity?.trim() || 'New Head Coach',
    relationshipWithUser: 58, // a fresh appointment: onside with the Director who hired him
    archetype,
    style: { ...base.style },
    preferredFormation: formation,
    activeFormation: formation,
    traitLean: { ...base.traitLean },
    favourites: [],
    adaptability: base.adaptability,
  };
  logEvent(state, {
    category: 'event',
    code: 'coach.appointed',
    message: `${state.managerRelations.identity} appointed head coach${previous ? `, replacing ${previous}` : ''} — ${archetype}, ${formationLabel(formation)}.`,
    data: { archetype, formation, previous },
  });
}

// ── Coach–Director friction (M13b) ───────────────────────────────────────────

/** Below this the working relationship is untenable — the coach walks. */
const COACH_RESIGN_FLOOR = 12;
/** Above this a settled, trusted coach gets a tune out of the whole group. */
const COACH_HARMONY_CEIL = 88;

/** A fresh, unaligned appointment on the era-appropriate shape — who the club
 *  turns to when a coach walks. */
function interimCoach(year: number): ManagerState {
  const c = coachForScenario('', year); // balanced, era shape, 'Head Coach'
  return { ...c, identity: 'Interim Head Coach', relationshipWithUser: 48 };
}

/**
 * Resolve the coach–Director relationship at the season boundary. A relationship
 * ground into the floor by overruled vetoes and rejected requests ends with the
 * coach resigning (a new appointment starts wary but clean); a strong one lifts
 * the dressing room. Only the USER's coach exists, so a passive reality run —
 * where nothing erodes the relationship — never trips either branch, keeping the
 * calibration harness untouched.
 */
export function resolveCoachFriction(state: GameState): void {
  const coach = state.managerRelations;
  const year = parseYearMonth(state.clock.date).year;
  if (coach.relationshipWithUser < COACH_RESIGN_FLOOR) {
    logEvent(state, {
      category: 'event',
      code: 'coach.resigned',
      message: `${coach.identity} has resigned — the relationship with the Director became untenable.`,
      data: { formerIdentity: coach.identity },
    });
    state.managerRelations = interimCoach(year);
    return;
  }
  if (coach.relationshipWithUser > COACH_HARMONY_CEIL) {
    for (const p of clubSquadPlayers(state, state.playerClub)) {
      p.morale = Math.min(100, p.morale + 1);
    }
    logEvent(state, {
      category: 'event',
      code: 'coach.harmony',
      message: `${coach.identity} has the dressing room fully on side — a settled, happy camp.`,
      data: { relationship: coach.relationshipWithUser },
    });
  }
}
