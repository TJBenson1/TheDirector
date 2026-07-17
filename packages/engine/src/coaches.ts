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

import type { CoachArchetype, GameState, ManagerState, PlayerState, TraitLean } from './types.js';
import type { Formation } from './tactics.js';
import { eraIdealFormation } from './tactics.js';
import { logEvent } from './eventLog.js';
import { parseYearMonth } from './clock.js';
import { clubSquadPlayers } from './players.js';

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

// ── Recruitment fit (M13b) ───────────────────────────────────────────────────

export type FitVerdict = 'wants' | 'fine' | 'reluctant' | 'veto';

export interface CoachFit {
  score: number; // signed; higher = better fit for this coach's profile
  verdict: FitVerdict;
  reason: string;
}

/** Neutral point of the 1..10 personality scale. */
const TRAIT_MID = 5.5;

/**
 * How well a player suits the coach's recruitment profile. A possession coach
 * who wants low-ego technicians will baulk at a volatile, big-ego maverick that
 * a man-manager would happily take on. Favourites from former clubs are wanted
 * outright. The coach's adaptability widens his tolerance — a flexible coach
 * grumbles where a dogmatic one digs in and vetoes.
 */
export function coachFit(coach: ManagerState, player: PlayerState): CoachFit {
  if (coach.favourites.includes(player.name)) {
    return { score: 100, verdict: 'wants', reason: `${player.name} is one of ${coach.identity}'s own — he wants him.` };
  }
  const lean = coach.traitLean;
  const per = player.personality;
  const raw =
    lean.professionalism * (per.professionalism - TRAIT_MID) +
    lean.ego * (per.ego - TRAIT_MID) +
    lean.ambition * (per.ambition - TRAIT_MID) +
    lean.loyalty * (per.loyalty - TRAIT_MID) +
    lean.volatility * (per.volatility - TRAIT_MID) +
    lean.adaptability * (per.adaptability - TRAIT_MID);
  // A more adaptable coach tolerates a wider spread of personalities.
  const score = raw + (coach.adaptability - 5) * 1.5;

  let verdict: FitVerdict;
  if (score >= 5) verdict = 'wants';
  else if (score >= -4) verdict = 'fine';
  else if (score >= -10) verdict = 'reluctant';
  else verdict = 'veto';

  const reason =
    verdict === 'wants'
      ? `${player.name}'s profile is exactly what ${coach.identity} wants.`
      : verdict === 'fine'
        ? `${coach.identity} is comfortable with ${player.name}.`
        : verdict === 'reluctant'
          ? `${coach.identity} has reservations about ${player.name}'s temperament.`
          : `${coach.identity} does not want ${player.name} — a poor fit for how he works.`;
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
