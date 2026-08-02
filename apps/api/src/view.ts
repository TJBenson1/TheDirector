/**
 * UI projection of a GameState.
 *
 * The frontend is a pure renderer: it holds the opaque `state` blob and draws
 * whatever this view returns. Crucially, `decisions` and `events` are passed
 * through GENERICALLY — a new decision type or event code added to the engine
 * shows up in the app with no frontend change. That is the whole point: engine
 * changes pull through to the client for free.
 */

import {
  standingsOrder,
  clubSquadPlayers,
  parseYearMonth,
  windowStepLabel,
  isProcedural,
  WINDOW_STEPS,
  type GameState,
  type ClubId,
} from '@director/engine';

export interface GameView {
  meta: {
    scenarioId: string;
    date: string;
    year: number;
    windowLabel: string;
    windowStep: number;
    windowSteps: number;
    stepLabel: string;
  };
  club: { id: string; name: string; strength: number };
  board: {
    mandate: string;
    patience: number;
    expectedFinish: number;
    warnings: number;
    dismissed: boolean;
  };
  coach: {
    identity: string;
    archetype: string;
    relationship: number;
    preferredFormation: string;
    activeFormation: string;
    style: { physicality: number; tempo: number; technical: number };
  };
  finances: { transferBudget: number; wageBill: number };
  table: TableRow[];
  squad: SquadPlayer[];
  decisions: unknown[]; // engine Decision[] — rendered generically
  events: unknown[]; // engine LoggedEvent[] (most-recent first) — rendered generically
}

interface TableRow {
  pos: number;
  clubId: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  isUser: boolean;
}

interface SquadPlayer {
  id: string;
  name: string;
  positions: string[];
  age: number;
  ability: number;
  potential: number;
  morale: number;
  fitness: number;
  contractUntil: number;
  injured: boolean;
  wageWeekly: number; // £/week — render this
  wageAnnual: number; // £/year
}

const WINDOW_LABEL: Record<string, string> = { summer: 'Summer window', winter: 'Winter window' };

/** How many recent events the client renders in its feed. */
const RECENT_EVENTS = 60;

export function buildView(state: GameState): GameView {
  const club = state.clubs[state.playerClub]!;
  const league = club.leagueId ? state.leagues[club.leagueId] : undefined;
  const year = parseYearMonth(state.clock.date).year;

  const table: TableRow[] = [];
  if (league) {
    const order =
      league.roundsPlayed === 0
        ? [...league.clubIds].sort((a, b) => state.clubs[b]!.strength - state.clubs[a]!.strength)
        : standingsOrder(league);
    order.forEach((id: ClubId, i: number) => {
      const rec = league.standings[id] ?? { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
      table.push({
        pos: i + 1,
        clubId: id,
        name: state.clubs[id]?.name ?? id,
        played: rec.played,
        won: rec.won,
        drawn: rec.drawn,
        lost: rec.lost,
        goalsFor: rec.goalsFor,
        goalsAgainst: rec.goalsAgainst,
        points: rec.points,
        isUser: id === state.playerClub,
      });
    });
  }

  const squad: SquadPlayer[] = clubSquadPlayers(state, state.playerClub)
    .map((p) => ({
      id: p.id,
      name: p.name,
      positions: p.positions,
      age: year - p.birthYear,
      ability: p.ability,
      potential: p.potentialCeiling,
      morale: p.morale,
      fitness: p.fitness,
      contractUntil: p.contractUntil,
      injured: !!p.injury,
      wageWeekly: Math.round(p.wage / 52),
      wageAnnual: p.wage,
    }))
    .sort((a, b) => b.ability - a.ability);

  const coach = state.managerRelations;

  return {
    meta: {
      scenarioId: state.meta.scenarioId,
      date: state.clock.date,
      year,
      windowLabel: state.clock.window ? WINDOW_LABEL[state.clock.window] ?? state.clock.window : 'In season',
      windowStep: state.clock.windowStep,
      windowSteps: WINDOW_STEPS,
      stepLabel: state.clock.window ? windowStepLabel(state.clock.windowStep) : '',
    },
    club: { id: club.id, name: club.name, strength: Math.round(club.strength) },
    board: {
      mandate: state.board.mandate,
      patience: state.board.patience,
      expectedFinish: state.board.expectedFinish,
      warnings: state.board.warnings,
      dismissed: state.board.dismissed,
    },
    coach: {
      identity: coach.identity,
      archetype: coach.archetype,
      relationship: coach.relationshipWithUser,
      preferredFormation: coach.preferredFormation,
      activeFormation: coach.activeFormation,
      style: coach.style,
    },
    finances: {
      transferBudget: club.finances.transferBudget,
      wageBill: club.finances.wageBill,
    },
    table,
    squad,
    decisions: state.pendingDecisions,
    events: feedEvents(state),
  };
}

/** The Feed shows real football, not filler noise: drop any event whose subject
 *  is a procedural squad-filler player (the league-wide fake-name injury/transfer
 *  churn that made the feed feel like an injury crisis). Everything real —
 *  transfers, scripted history, board, decisions, the user's own club — stays. */
function feedEvents(state: GameState): unknown[] {
  const isFiller = (id: unknown): boolean => {
    if (typeof id !== 'string') return false;
    const p = state.players[id];
    return !!p && isProcedural(p);
  };
  return [...state.eventLog]
    .filter((e) => {
      const d = (e.data ?? {}) as Record<string, unknown>;
      // Injury/transfer events carry the player in data.playerId; a filler subject
      // is noise unless it somehow concerns the user's club (it won't — the user's
      // squad is real-only).
      if (isFiller(d.playerId)) return false;
      // A rival club's random serious injury is squad-strength bookkeeping, not the
      // Director's news — keep it out of the feed (his own + real injuries stay).
      if (d.rival === true) return false;
      return true;
    })
    .slice(-RECENT_EVENTS)
    .reverse();
}
