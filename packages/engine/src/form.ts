/**
 * Mid-season form report (§ narrative support). A live, deterministic read of how
 * the Director's own players are doing at this point in the campaign — minutes,
 * projected goals & assists, an impact rating, and whether a new signing is still
 * adapting to a new country or being asked to play out of position. The engine
 * owns the facts; the narrator turns them into a manager's-eye commentary.
 */

import type { GameState } from './types.js';
import { clubSquadPlayers } from './players.js';
import { liveRoleEstimate, liveSeasonProjection } from './stats.js';
import { coachBriefing } from './briefing.js';

export type FormFlag = 'flying' | 'solid' | 'struggling' | 'adapting' | 'fringe' | 'injured';

export interface PlayerForm {
  name: string;
  position: string;
  age: number;
  minutesPct: number;
  starter: boolean;
  goals: number;
  assists: number;
  rating: number;
  flag: FormFlag;
  note: string;
}

export interface MidSeasonForm {
  roundsPlayed: number;
  /** True once enough of the season has been played for form to mean something. */
  underway: boolean;
  players: PlayerForm[];
}

/** A live, deterministic mid-season read of the user's squad — no RNG, so it is a
 *  snapshot of where things stand, safe to call any time without perturbing the sim. */
export function midSeasonForm(state: GameState): MidSeasonForm {
  const club = state.clubs[state.playerClub]!;
  const league = club.leagueId ? state.leagues[club.leagueId] : undefined;
  const roundsPlayed = league?.roundsPlayed ?? 0;
  const year = Number(state.clock.date.slice(0, 4));
  const starters = new Set(coachBriefing(state).bestXI.map((x) => x.name));

  const players: PlayerForm[] = clubSquadPlayers(state, state.playerClub).map((p) => {
    const live = liveRoleEstimate(state, club, p);
    const proj = liveSeasonProjection(state, club, p);
    const minutesPct = Math.round(live.minutesShare * 100);
    const starter = starters.has(p.name);
    const adapting = !!p.adaptation && !p.adaptation.settled && p.adaptation.outcome !== 'seamless';
    const attacker = ['ST', 'RW', 'LW', 'AM', 'CM'].includes(p.positions[0] ?? '');

    const output = proj.goals + proj.assists;
    let flag: FormFlag;
    let note: string;
    if (p.injury) {
      flag = 'injured';
      note = `sidelined — out roughly ${p.injury.monthsRemaining} more month${p.injury.monthsRemaining === 1 ? '' : 's'}`;
    } else if (adapting) {
      flag = 'adapting';
      note = `still finding his feet after the move — settling into a new league takes time, and his best is yet to come`;
    } else if (minutesPct < 25) {
      flag = 'fringe';
      note = `barely featuring (${minutesPct}% of minutes) — a bit-part role so far`;
    } else if (attacker && output >= 9) {
      // A genuine attacking return — the real form story, not just "he's good".
      flag = 'flying';
      note = `on fire — ${proj.goals} goal${proj.goals === 1 ? '' : 's'} and ${proj.assists} assist${proj.assists === 1 ? '' : 's'} already`;
    } else if (live.rating <= 6.3) {
      flag = 'struggling';
      note = `below his level — off the pace this season`;
    } else if (attacker && output === 0 && minutesPct >= 45) {
      // A forward who plays but isn't contributing — a quiet worry.
      flag = 'struggling';
      note = `playing but not producing — no goals or assists yet, and the coach will notice`;
    } else {
      flag = 'solid';
      note = attacker && output > 0
        ? `doing his bit — ${proj.goals}g/${proj.assists}a and holding his place`
        : `steady — reliable, quietly getting on with it`;
    }
    return { name: p.name, position: p.positions.join('/'), age: year - p.birthYear, minutesPct, starter, goals: proj.goals, assists: proj.assists, rating: live.rating, flag, note };
  });

  // Standouts first, then the strugglers/adapters worth flagging, then the rest.
  const order: Record<FormFlag, number> = { flying: 0, adapting: 1, struggling: 2, fringe: 3, injured: 4, solid: 5 };
  players.sort((a, b) => order[a.flag] - order[b.flag] || b.rating - a.rating);

  return { roundsPlayed, underway: roundsPlayed >= 4, players };
}
