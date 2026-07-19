/**
 * The head coach's opening briefing (§13) — the meeting the Director takes with
 * his manager after the intro. It is a pure, deterministic read of the current
 * squad and coach persona: how happy he is, what he thinks the club can achieve,
 * his priority (league / Europe / both), the shape he wants to play, his best XI
 * in that shape, the players he isn't sold on, the positions he wants
 * strengthened, and a couple of concrete targets. The engine owns every fact;
 * the narrator turns it into the manager's own voice.
 */

import type { GameState, Position, PlayerState } from './types.js';
import type { Formation } from './tactics.js';
import { formationLabel } from './tactics.js';
import { clubSquadPlayers } from './players.js';
import { effectiveAbility } from './adaptation.js';
import { coachFit } from './coaches.js';
import { suggestTargets } from './recommend.js';
import { getScenario } from './scenarios.js';

export interface BriefingXI {
  slot: Position;
  name: string;
  ability: number;
  /** Whether the player naturally plays the slot's position (vs an out-of-position fill). */
  natural: boolean;
}

export interface BriefingTarget {
  name: string;
  club: string;
  position: Position;
  note: string;
}

export interface CoachBriefing {
  coach: string;
  mood: string;
  priority: string;
  formation: string;
  bestXI: BriefingXI[];
  notKeenOn: Array<{ name: string; reason: string }>;
  strengthen: Array<{ position: Position; reason: string }>;
  targets: BriefingTarget[];
}

/** The eleven positional slots each shape lines up in — enough to pick a best XI
 *  and spot where the squad is short. Wing-back shapes borrow the full-back slots. */
const FORMATION_SLOTS: Record<Formation, Position[]> = {
  '4-4-2': ['GK', 'RB', 'CB', 'CB', 'LB', 'RW', 'CM', 'CM', 'LW', 'ST', 'ST'],
  '4-4-2-diamond': ['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'CM', 'CM', 'AM', 'ST', 'ST'],
  '4-3-3': ['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'CM', 'CM', 'RW', 'ST', 'LW'],
  '4-2-3-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'DM', 'RW', 'AM', 'LW', 'ST'],
  '3-5-2': ['GK', 'CB', 'CB', 'CB', 'RB', 'LB', 'CM', 'CM', 'AM', 'ST', 'ST'],
  '5-3-2': ['GK', 'CB', 'CB', 'CB', 'RB', 'LB', 'CM', 'CM', 'CM', 'ST', 'ST'],
  '3-4-3': ['GK', 'CB', 'CB', 'CB', 'RB', 'LB', 'CM', 'CM', 'RW', 'ST', 'LW'],
};

const GROUP: Record<Position, 'GK' | 'DEF' | 'MID' | 'ATT'> = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', DM: 'MID', CM: 'MID', AM: 'ATT', LW: 'ATT', RW: 'ATT', ST: 'ATT',
};

const POSITION_LABEL: Record<Position, string> = {
  GK: 'goalkeeper', CB: 'centre-back', LB: 'left-back', RB: 'right-back', DM: 'holding midfield',
  CM: 'central midfield', AM: 'attacking midfield', LW: 'left wing', RW: 'right wing', ST: 'striker',
};

function moodFor(relationship: number): string {
  if (relationship >= 75) return 'buoyant — delighted with the backing and what he has to work with';
  if (relationship >= 55) return 'positive — happy to be here and quietly ambitious';
  if (relationship >= 35) return 'guarded — professional, but waiting to see the Director’s intent';
  return 'strained — the working relationship needs repair before anything else';
}

/** Derive the club's realistic ambition from the scenario mandate and prestige. */
function priorityFor(state: GameState): string {
  const mandate = getScenario(state.meta.scenarioId).mandate.toLowerCase();
  const europe = /europ|champions|continental|european cup/.test(mandate);
  const league = /title|league|scudetto|domestic|championship|bundesliga|dominance|dynasty/.test(mandate);
  const prestige = state.clubs[state.playerClub]?.prestige ?? 70;
  if (europe && league) return 'both fronts — the league at home and a real run in Europe';
  if (europe) return 'Europe above all — a deep Champions Cup run is the measure of the season';
  if (league) return prestige >= 86 ? 'the league title, with Europe close behind' : 'the league — a title challenge is the priority';
  return prestige >= 84 ? 'silverware on both fronts' : 'a strong, competitive league campaign';
}

/** Pick a best XI for the coach's shape. Two passes so a specialist lands in his
 *  own slot before a like-for-like grabs him: pass one fills each slot with the
 *  best NATURAL fit (a striker to a striker's slot), pass two fills what's left
 *  with the best remaining cover — so Ronaldo starts up front, not out on a wing. */
function bestEleven(state: GameState, formation: Formation): BriefingXI[] {
  const slots = FORMATION_SLOTS[formation] ?? FORMATION_SLOTS['4-4-2'];
  const squad = clubSquadPlayers(state, state.playerClub)
    .filter((p) => !p.injury)
    .map((p) => ({ p, eff: effectiveAbility(p) }))
    .sort((a, b) => b.eff - a.eff);
  const used = new Set<string>();
  const filled: Array<BriefingXI | null> = slots.map(() => null);

  // Pass 1: natural fits only, highest-rated first.
  slots.forEach((slot, i) => {
    const pick = squad.find((r) => !used.has(r.p.id) && r.p.positions.includes(slot));
    if (pick) {
      used.add(pick.p.id);
      filled[i] = { slot, name: pick.p.name, ability: Math.round(pick.eff), natural: true };
    }
  });
  // Pass 2: fill the gaps with the best available cover (same group, then anyone).
  slots.forEach((slot, i) => {
    if (filled[i]) return;
    const group = GROUP[slot];
    const pick =
      squad.find((r) => !used.has(r.p.id) && r.p.positions.some((pos) => GROUP[pos] === group)) ??
      squad.find((r) => !used.has(r.p.id));
    if (pick) {
      used.add(pick.p.id);
      filled[i] = { slot, name: pick.p.name, ability: Math.round(pick.eff), natural: false };
    }
  });
  return filled.filter((x): x is BriefingXI => x !== null);
}

/**
 * Build the head coach's opening briefing for the user's club — pure and
 * deterministic (no RNG cursor use; scouting inside `suggestTargets` forks a
 * dedicated stream), so calling it never perturbs the sim or calibration.
 */
export function coachBriefing(state: GameState): CoachBriefing {
  const coach = state.managerRelations;
  const formation = coach.activeFormation ?? coach.preferredFormation;
  const squad = clubSquadPlayers(state, state.playerClub);

  const xi = bestEleven(state, formation);

  // Players the coach isn't sold on: a poor fit for how he plays / his dressing
  // room. Surface the clearest few, worst first.
  const notKeenOn = squad
    .map((p) => ({ p, fit: coachFit(coach, p) }))
    .filter((r) => r.fit.verdict === 'reluctant' || r.fit.verdict === 'veto')
    .sort((a, b) => a.fit.score - b.fit.score)
    .slice(0, 3)
    .map((r) => ({ name: r.p.name, reason: r.fit.reason }));

  // Positions to strengthen: a slot filled out of position (no natural option),
  // or one whose best man is short of the XI's standard, or a group with no cover.
  const xiAvg = xi.length ? xi.reduce((s, x) => s + x.ability, 0) / xi.length : 70;
  const seen = new Set<Position>();
  const strengthen: Array<{ position: Position; reason: string }> = [];
  for (const x of xi) {
    if (seen.has(x.slot)) continue;
    seen.add(x.slot);
    const coverCount = squad.filter((p) => p.positions.includes(x.slot)).length;
    if (!x.natural) {
      strengthen.push({ position: x.slot, reason: `no natural ${POSITION_LABEL[x.slot]} — ${x.name} is filling in out of position` });
    } else if (x.ability <= xiAvg - 6) {
      strengthen.push({ position: x.slot, reason: `${POSITION_LABEL[x.slot]} is the weak link in the side` });
    } else if (coverCount < 2) {
      strengthen.push({ position: x.slot, reason: `no cover behind ${x.name} at ${POSITION_LABEL[x.slot]}` });
    }
  }
  strengthen.sort((a, b) => (a.reason.startsWith('no natural') ? -1 : 1) - (b.reason.startsWith('no natural') ? -1 : 1));
  const topNeeds = strengthen.slice(0, 3);

  // A couple of concrete, attainable targets for the most pressing need.
  const targets: BriefingTarget[] = [];
  for (const need of topNeeds.slice(0, 2)) {
    const found = suggestTargets(state, need.position, { maxResults: 2, favourAvailable: true });
    for (const t of found) {
      if (targets.some((x) => x.name === t.name)) continue;
      targets.push({
        name: t.name,
        club: t.clubName,
        position: need.position,
        note: t.willing ? 'gettable' : 'would take some persuading',
      });
    }
  }

  return {
    coach: coach.identity,
    mood: moodFor(coach.relationshipWithUser),
    priority: priorityFor(state),
    formation: formationLabel(formation),
    bestXI: xi,
    notKeenOn,
    strengthen: topNeeds,
    targets: targets.slice(0, 4),
    // starters kept implicit in bestXI; exported set unused externally.
  } satisfies CoachBriefing;
}
