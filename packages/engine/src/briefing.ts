/**
 * The head coach's opening briefing (§13) — the meeting the Director takes with
 * his manager after the intro. It is a pure, deterministic read of the current
 * squad and coach persona: how happy he is, what he thinks the club can achieve,
 * his priority (league / Europe / both), the shape he wants to play, his best XI
 * in that shape, the players he isn't sold on, the positions he wants
 * strengthened, and a couple of concrete targets. The engine owns every fact;
 * the narrator turns it into the manager's own voice.
 */

import type { CoachArchetype, GameState, Position, PlayerState } from './types.js';
import type { Formation } from './tactics.js';
import { formationLabel } from './tactics.js';
import { clubSquadPlayers } from './players.js';
import { effectiveAbility } from './adaptation.js';
import { coachFit } from './coaches.js';
import { estimateMinutesShare } from './development.js';
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

/** How the coach's read of a player nudges his place in the pecking order. A man
 *  he covets edges ahead of a like-for-like; one he has doubts about slips; and a
 *  documented castoff he wants gone (Lippi's Baggio) drops far enough to sit behind
 *  any viable alternative — yet still starts if he is genuinely the only option, as
 *  a coach fields who he has. Ability still leads; this only breaks close calls. */
function coachPecking(coach: GameState['managerRelations'], player: PlayerState): number {
  switch (coachFit(coach, player).verdict) {
    case 'wants': return 3;
    case 'fine': return 0;
    case 'reluctant': return -4;
    case 'veto': return -14; // benched behind any comparable option
  }
}

/** Pick a best XI for the coach's shape. Two passes so a specialist lands in his
 *  own slot before a like-for-like grabs him: pass one fills each slot with the
 *  best NATURAL fit (a striker to a striker's slot), pass two fills what's left
 *  with the best remaining cover — so Ronaldo starts up front, not out on a wing.
 *  Ordering folds in the coach's preference (a castoff he wants sold drops down the
 *  pecking order) while the displayed rating stays the player's true ability. */
function bestEleven(state: GameState, formation: Formation): BriefingXI[] {
  const slots = FORMATION_SLOTS[formation] ?? FORMATION_SLOTS['4-4-2'];
  const coach = state.managerRelations;
  const squad = clubSquadPlayers(state, state.playerClub)
    .filter((p) => !p.injury)
    .map((p) => ({ p, eff: effectiveAbility(p), rank: effectiveAbility(p) + coachPecking(coach, p) }))
    .sort((a, b) => b.rank - a.rank);
  const used = new Set<string>();
  const filled: Array<BriefingXI | null> = slots.map(() => null);

  // Pass 1: natural fits only, highest-ranked first.
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
      // Label him by the position he ACTUALLY plays, not the slot he'd cover.
      // suggestTargets returns same-group fill-ins (a CB for an RB need), so a
      // straight `need.position` mislabels Nesta/Cannavaro as right-backs. Prefer
      // the exact need position when he genuinely plays it, else his primary role.
      const player = state.players[t.playerId];
      const displayPosition =
        player && player.positions.includes(need.position)
          ? need.position
          : player?.positions[0] ?? need.position;
      targets.push({
        name: t.name,
        club: t.clubName,
        position: displayPosition,
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

// ── Manager's Room (the coach's dashboard) ───────────────────────────────────

export interface RoomXI { slot: Position; name: string; ability: number; natural: boolean; topPerformer: boolean }
export interface DepthLine { position: Position; label: string; players: Array<{ name: string; ability: number; age: number; starter: boolean; injured: boolean }> }
export interface RisingStar { name: string; age: number; ability: number; potential: number; minutesPct: number; developing: boolean; note: string }
export interface Concern { name: string; issue: string; severity: 'watch' | 'urgent' }
export interface OffloadItem { name: string; reason: string }

export interface ManagerRoom {
  coach: string;
  happiness: string;
  happinessPct: number;
  style: string;
  formation: string;
  priority: string;
  xi: RoomXI[];
  depth: DepthLine[];
  risingStars: RisingStar[];
  concerns: Concern[];
  wants: BriefingTarget[];
  offload: OffloadItem[];
}

const STYLE_PROSE: Record<CoachArchetype, string> = {
  possession: 'Possession — patient build-up, technical midfielders, a high line.',
  gegenpress: 'Gegenpressing — high tempo, win it back high up, runners everywhere.',
  'pragmatic-counter': 'Pragmatic — a solid shape that hits hard on the counter.',
  'defensive-block': 'Defensive — a deep, compact block that gives little away.',
  'man-manager': 'Man-management — gets a tune out of big characters, shape flexes to the group.',
  balanced: 'Balanced — sets the plan by the opponent, no fixed dogma.',
};

/** Canonical spine order for a readable depth chart. */
const DEPTH_ORDER: Position[] = ['GK', 'RB', 'CB', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];

/**
 * The Manager's Room — the head coach's full dashboard for the Director: his mood,
 * style and shape; the first-choice XI with the standout performers marked; a
 * position-by-position depth chart; the rising stars and whether they're getting
 * the minutes to develop; the concerns (age, form, happiness, injury, contract);
 * and his transfer wishlist, in and out. Pure and deterministic (scouting inside
 * suggestTargets forks its own stream), so reading it never perturbs the sim.
 */
export function managerRoom(state: GameState): ManagerRoom {
  const coach = state.managerRelations;
  const formation = coach.activeFormation ?? coach.preferredFormation;
  const year = Number(state.clock.date.slice(0, 4));
  const club = state.clubs[state.playerClub]!;
  const squad = clubSquadPlayers(state, state.playerClub);
  const brief = coachBriefing(state);

  const xiRaw = bestEleven(state, formation);
  const starterNames = new Set(xiRaw.map((x) => x.name));
  // Standout performers: the three highest by last season's rating (or ability
  // before any season is banked), so the coach's key men are flagged.
  const perf = (name: string): number => {
    const p = squad.find((q) => q.name === name);
    if (!p) return 0;
    return p.lastSeason ? p.lastSeason.rating : effectiveAbility(p) / 10 - 0.6;
  };
  const topThree = new Set([...xiRaw].sort((a, b) => perf(b.name) - perf(a.name)).slice(0, 3).map((x) => x.name));
  const xi: RoomXI[] = xiRaw.map((x) => ({ ...x, topPerformer: topThree.has(x.name) }));

  // Depth chart: for each spine position, everyone who can fill it, best first.
  const depth: DepthLine[] = [];
  for (const pos of DEPTH_ORDER) {
    const players = squad
      .filter((p) => p.positions.includes(pos))
      .sort((a, b) => effectiveAbility(b) - effectiveAbility(a))
      .map((p) => ({
        name: p.name,
        ability: Math.round(effectiveAbility(p)),
        age: year - p.birthYear,
        starter: starterNames.has(p.name) && xiRaw.find((x) => x.name === p.name)?.slot === pos,
        injured: !!p.injury,
      }));
    if (players.length) depth.push({ position: pos, label: POSITION_LABEL[pos], players });
  }

  // Rising stars: the young with real upside, and whether they're playing enough
  // to fulfil it (a benched prospect stalls, §5).
  const risingStars: RisingStar[] = squad
    .filter((p) => year - p.birthYear <= 21 && p.potentialCeiling - p.ability >= 5)
    .sort((a, b) => b.potentialCeiling - a.potentialCeiling)
    .slice(0, 6)
    .map((p) => {
      const minutesPct = Math.round(estimateMinutesShare(state, club, p) * 100);
      const developing = minutesPct >= 35;
      return {
        name: p.name,
        age: year - p.birthYear,
        ability: p.ability,
        potential: p.potentialCeiling,
        minutesPct,
        developing,
        note: developing
          ? 'getting the minutes to grow'
          : minutesPct >= 15
            ? 'needs more game time to keep developing'
            : 'stuck on the fringe — will stall unless he plays or moves on loan',
      };
    });

  // Concerns: the one most pressing issue per player, urgent first.
  const concerns: Concern[] = [];
  for (const p of squad) {
    const age = year - p.birthYear;
    const star = p.ability >= 82;
    if (p.injury) {
      concerns.push({ name: p.name, issue: 'currently injured', severity: p.injury.monthsRemaining >= 3 ? 'urgent' : 'watch' });
    } else if (p.contractUntil === year || p.contractUntil === year + 1) {
      // Only an ACTIONABLE deal — one expiring this season or next. (A deal already
      // lapsed is the contract-renewal gap, not a live "tie him down" call.)
      concerns.push({ name: p.name, issue: `contract expires ${p.contractUntil} — tie him down or risk losing him`, severity: star ? 'urgent' : 'watch' });
    } else if (p.morale <= 35) {
      concerns.push({ name: p.name, issue: `unhappy (happiness ${p.morale})`, severity: p.morale <= 25 ? 'urgent' : 'watch' });
    } else if (age >= 33) {
      concerns.push({ name: p.name, issue: `ageing (${age}) — plan the succession`, severity: 'watch' });
    } else if (p.form <= -3) {
      concerns.push({ name: p.name, issue: 'a dip in form', severity: 'watch' });
    } else if (p.lastSeason && p.lastSeason.rating <= 5.5) {
      concerns.push({ name: p.name, issue: 'underperformed last season', severity: 'watch' });
    }
  }
  concerns.sort((a, b) => (a.severity === 'urgent' ? 0 : 1) - (b.severity === 'urgent' ? 0 : 1));

  // Offload list: the men the coach isn't sold on, the deeply unhappy, and ageing
  // squad filler blocking a rising star's path.
  const offload: OffloadItem[] = [];
  const seenOff = new Set<string>();
  const addOff = (name: string, reason: string) => {
    if (seenOff.has(name)) return;
    seenOff.add(name);
    offload.push({ name, reason });
  };
  for (const n of brief.notKeenOn) addOff(n.name, 'not a fit for how the coach plays');
  for (const p of squad) {
    if (p.morale <= 25 && p.ability < 82) addOff(p.name, 'wants out — deeply unsettled');
  }
  for (const line of depth) {
    line.players.forEach((pl, i) => {
      if (i >= 2 && pl.age >= 31) addOff(pl.name, `surplus at ${line.label} — blocking a younger option`);
    });
  }

  return {
    coach: coach.identity,
    happiness: moodFor(coach.relationshipWithUser),
    happinessPct: coach.relationshipWithUser,
    style: STYLE_PROSE[coach.archetype],
    formation: formationLabel(formation),
    priority: brief.priority,
    xi,
    depth,
    risingStars,
    concerns: concerns.slice(0, 8),
    wants: brief.targets,
    offload: offload.slice(0, 5),
  };
}
