/**
 * Mid-season form report (§ narrative support). A live, deterministic read of how
 * the Director's own players are doing at this point in the campaign — minutes,
 * projected goals & assists, an impact rating, and whether a new signing is still
 * adapting to a new country or being asked to play out of position. The engine
 * owns the facts; the narrator turns them into a manager's-eye commentary.
 */

import type { GameState, PlayerState } from './types.js';
import { clubSquadPlayers, overstackedStars } from './players.js';
import { effectiveAbility } from './adaptation.js';
import { coachFit } from './coaches.js';
import { formationLabel } from './tactics.js';
import { liveRoleEstimate, liveSeasonProjection } from './stats.js';
import { coachBriefing } from './briefing.js';

export type FormFlag = 'flying' | 'solid' | 'struggling' | 'adapting' | 'misfit' | 'logjam' | 'fringe' | 'injured';

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
  const coach = state.managerRelations;
  const shape = formationLabel(coach.activeFormation ?? coach.preferredFormation);
  const starters = new Set(coachBriefing(state).bestXI.map((x) => x.name));
  const squad = clubSquadPlayers(state, state.playerClub);
  // The engine's own read of a genuine GLUT — the surplus stars a squad the
  // Director has over-stocked can't field. This is the true "you overstocked"
  // signal (it fires only when hoarding has earned a chemistry penalty), so the
  // logjam story is reserved for it, not for ordinary squad depth.
  const overstocked = new Set(overstackedStars(state, state.playerClub).map((q) => q.id));

  // How many men are ahead of him in his own position — the raw material for a
  // "logjam" story. A situational read (competition), not an ability read.
  const aheadInPosition = (p: PlayerState): number => {
    const pos = p.positions[0];
    if (!pos) return 0;
    const eff = effectiveAbility(p);
    return squad.filter((q) => q.id !== p.id && !q.injury && q.positions.includes(pos) && effectiveAbility(q) >= eff).length;
  };

  const players: PlayerForm[] = squad.map((p) => {
    const live = liveRoleEstimate(state, club, p);
    const proj = liveSeasonProjection(state, club, p);
    const minutesPct = Math.round(live.minutesShare * 100);
    const starter = starters.has(p.name);
    const output = proj.goals + proj.assists;
    const attacker = ['ST', 'RW', 'LW', 'AM', 'CM'].includes(p.positions[0] ?? '');
    // ── Situational signals (independent of raw ability) ──
    const adapting = !!p.adaptation && !p.adaptation.settled && p.adaptation.outcome !== 'seamless';
    const fit = coachFit(coach, p).verdict; // wants | fine | reluctant | veto
    const ahead = aheadInPosition(p);
    const restless = p.agitation >= 25 || p.morale <= 40;
    const unrest = restless ? ' — and, tellingly, he is growing restless' : '';

    let flag: FormFlag;
    let note: string;
    if (p.injury) {
      flag = 'injured';
      note = `sidelined — out roughly ${p.injury.monthsRemaining} more month${p.injury.monthsRemaining === 1 ? '' : 's'}`;
    } else if (adapting) {
      // A signing from another football culture, still settling — a story of TIME,
      // not talent. He can be a fine player and still look short of it for now.
      flag = 'adapting';
      note = `still adapting after the move — the tempo and physicality of a new league are taking their toll, and it is dulling a good player's edge. Flashes of the quality you signed, but not yet the finished article; he needs a run of games and patience${unrest}`;
    } else if (fit === 'veto') {
      // A talent the coach simply cannot fit into how he plays — the classic
      // "great player, wrong system" story, nothing to do with his level.
      flag = 'misfit';
      note = `a square peg — ${coach.identity} can't make him fit the ${shape}, so even when he plays he looks a beat off the rhythm of the side. Talent going to waste in this setup${unrest}`;
    } else if (overstocked.has(p.id)) {
      // A glut the Director has BUILT in this position — a good player with no path
      // to games, chafing on the bench. Driven by the squad you assembled, not his
      // level.
      flag = 'logjam';
      note = `one of a glut you've stockpiled in his position — ${ahead} ahead of him and no route to regular football, so a player who should be starting somewhere is stuck watching. It is curdling into real discontent${unrest}`;
    } else if (minutesPct < 25) {
      flag = 'fringe';
      note = ahead >= 2
        ? `a squad man for now — ${ahead} ahead of him in his position, making do with the odd appearance`
        : `barely featuring (${minutesPct}% of the minutes) — a bit-part role so far`;
    } else if (attacker && output >= 9) {
      flag = 'flying';
      note = `on fire — ${proj.goals} goal${proj.goals === 1 ? '' : 's'} and ${proj.assists} assist${proj.assists === 1 ? '' : 's'} already`;
    } else if (attacker && output === 0 && minutesPct >= 45) {
      flag = 'struggling';
      note = `playing but not producing — no goals or assists yet, and the coach is noticing`;
    } else if (live.rating <= 6.3) {
      flag = 'struggling';
      note = `below his level — off the pace this season`;
    } else {
      flag = 'solid';
      const fitDoubt = fit === 'reluctant' ? `, though ${coach.identity} still isn't fully convinced he suits the ${shape}` : '';
      note = attacker && output > 0
        ? `doing his bit — ${proj.goals}g/${proj.assists}a and holding his place${fitDoubt}`
        : `steady — reliable, quietly getting on with it${fitDoubt}`;
    }
    return { name: p.name, position: p.positions.join('/'), age: year - p.birthYear, minutesPct, starter, goals: proj.goals, assists: proj.assists, rating: live.rating, flag, note };
  });

  // Standouts first, then the situational stories worth telling, then the rest.
  const order: Record<FormFlag, number> = { flying: 0, misfit: 1, adapting: 2, logjam: 3, struggling: 4, fringe: 5, injured: 6, solid: 7 };
  players.sort((a, b) => order[a.flag] - order[b.flag] || b.rating - a.rating);

  return { roundsPlayed, underway: roundsPlayed >= 4, players };
}
