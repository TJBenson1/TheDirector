/**
 * Ageing & decline (§5, §17.4). Applied once per season at the July rollover.
 *
 * Position-specific decline curves that can BREAK SUDDENLY (post-30 collapse
 * rolls) — rewarding "sell at peak" judgment and punishing holding too long.
 * Contextual *development* (young players growing toward their ceiling) is the
 * M5 signature system; M4 owns the decline half so squads age realistically
 * and dominance erodes over a career.
 */

import type { GameState, Position } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { clubSquadPlayers, recomputeClubStrength, overstackedStars } from './players.js';

/** Age at which decline begins, by position group (keepers last longest). */
const DECLINE_START: Record<Position, number> = {
  GK: 34,
  CB: 32,
  LB: 31,
  RB: 31,
  DM: 31,
  CM: 30,
  AM: 30,
  LW: 29,
  RW: 29,
  ST: 30,
};

function declineStartFor(positions: Position[]): number {
  // Use the most forgiving of the player's positions.
  return Math.max(...positions.map((p) => DECLINE_START[p]));
}

/**
 * Age the world by one season: apply decline to players past their curve, with
 * rare sudden collapses. Recomputes strength for simulated clubs afterwards.
 * Also nudges morale by last season's club success (light — full happiness/
 * agency is M6).
 */
export function processSeasonAgeing(state: GameState, rng: Rng): void {
  const year = Number(state.clock.date.slice(0, 4));
  const ageRng = rng.fork(`ageing:${year}`);

  for (const club of Object.values(state.clubs)) {
    let changed = false;
    for (const player of clubSquadPlayers(state, club.id)) {
      const age = year - player.birthYear;
      const start = declineStartFor(player.positions);
      if (age < start) continue;

      const yearsPast = age - start;
      // Gentle base decline that steepens with age.
      let drop = 1 + Math.floor(yearsPast / 2) + (ageRng.chance(0.5) ? 1 : 0);

      // Post-30 sudden collapse: a rare, sharp fall (the "held him too long" trap).
      if (age >= 31 && ageRng.chance(0.09)) {
        drop += ageRng.int(4, 8);
        logEvent(state, {
          category: 'development',
          code: 'decline.collapse',
          message: `${player.name} (${club.name}, ${age}) declines sharply`,
          data: { playerId: player.id, clubId: club.id, age },
        });
      }

      player.ability = Math.max(28, player.ability - drop);
      player.potentialCeiling = Math.max(player.ability, player.potentialCeiling);
      changed = true;
    }
    if (changed && club.leagueId !== null) recomputeClubStrength(state, club.id);
  }
}

// The age a player hangs up his boots, before personality/position adjustment. A
// keeper plays years longer; a true professional squeezes out a season or two more.
// Set past the typical 15-year career window so a normal save keeps its real spine
// and only the true long-horizon (25-year) run sheds and refreshes a generation.
const BASE_RETIRE_AGE = 37;

/** Position group's retirement bonus (keepers last far longer). */
export function retireAgeFor(positions: Position[], professionalism: number): number {
  const gk = positions.includes('GK') ? 3 : 0;
  const defender = positions.some((p) => p === 'CB') ? 1 : 0;
  const pro = Math.round((professionalism - 6) * 0.3);
  return BASE_RETIRE_AGE + gk + defender + pro;
}

/** The 23-slot squad-refresh template — a young graduate is generated into a
 *  position the squad most needs, cycling through this canonical spine. */

/**
 * Retirement & youth regeneration (§5, long-horizon world coherence). Applied at
 * the July rollover AFTER decline, so the world doesn't ossify into a squad of
 * fifty-year-olds over a 25-year save. Veterans hang up their boots around their
 * late thirties (keepers later, true pros a touch later still), and each club
 * refreshes with home-grown youth so squads stay a realistic age pyramid rather
 * than the frozen kickoff generation slowly aching into their sixties.
 *
 * The real next generation — a Rooney, a Messi — arrives via the ledger's
 * authored academyIntakes. There is NO procedural regeneration (no regens, real
 * youth only): a retiree simply leaves, and the squad depth his exit opens is
 * carried by the abstract depth term in the strength calc, not by an invented
 * academy body. Squads thin toward their real, named spine over a long save
 * rather than being padded back out with fabricated names.
 */
export function processRetirementsAndYouth(state: GameState, rng: Rng): void {
  const year = Number(state.clock.date.slice(0, 4));
  const rr = rng.fork(`retire:${year}`);

  for (const club of Object.values(state.clubs)) {
    // Retirements — collect first, then remove (don't mutate while iterating).
    const retirees = [];
    for (const player of clubSquadPlayers(state, club.id)) {
      const age = year - player.birthYear;
      const retireAge = retireAgeFor(player.positions, player.personality.professionalism);
      if (age < retireAge - 2) continue;
      // Probability ramps from the threshold to near-certain ~5 seasons later.
      const prob = Math.max(0, Math.min(1, (age - (retireAge - 2)) * 0.2));
      if (rr.chance(prob)) retirees.push(player);
    }
    for (const player of retirees) {
      // Remove from the squad but KEEP `club` (his final club is his reality — the
      // ledger/fidelity record that "he reached real_madrid" must still read true).
      // Filtered out of the market and selection via the `retired` flag.
      club.squad = club.squad.filter((id) => id !== player.id);
      player.retired = true;
      delete state.pursuit[player.id];
      logEvent(state, {
        category: 'development',
        code: 'player.retired',
        message: `${player.name} retires from football at ${year - player.birthYear}`,
        data: { playerId: player.id, clubId: club.id, age: year - player.birthYear },
      });
    }

    if (retirees.length && club.leagueId !== null) recomputeClubStrength(state, club.id);
  }
}

/**
 * Light end-of-season morale drift from league finish (§17.4 stub; §6/M6 owns
 * the full happiness → departure loop). Winners' squads lift; strugglers dip.
 */
export function processSeasonMorale(state: GameState): void {
  for (const league of Object.values(state.leagues)) {
    if (league.titleHistory.length === 0) continue;
    const champ = league.titleHistory[league.titleHistory.length - 1]!.championId;
    for (const clubId of league.clubIds) {
      const delta = clubId === champ ? 4 : 0;
      if (delta === 0) continue;
      for (const player of clubSquadPlayers(state, clubId)) {
        player.morale = Math.max(0, Math.min(100, player.morale + delta));
      }
    }
  }
}

/**
 * Over-stacking's human cost (§ chemistry): the stars a bloated squad can't field
 * chafe and unsettle. Each season on the bench sours their morale and grows their
 * agitation — which the existing agitation system may turn into a forced exit, so a
 * hoarded galáctico glut tends to shed its surplus and rebalance, as the real
 * Galácticos and MSN-era PSG did. Only over-stacked clubs are touched; a balanced
 * squad has no surplus and is untroubled.
 */
export function processOverstackUnrest(state: GameState): void {
  for (const club of Object.values(state.clubs)) {
    if ((club.chemistryPenalty ?? 0) <= 0) continue;
    const surplus = overstackedStars(state, club.id);
    if (surplus.length === 0) continue;
    // Outpace the ordinary agitation decay (a persistent glut is not a one-off
    // snub), so a star kept surplus season on season builds toward forcing an exit.
    for (const p of surplus) {
      p.agitation = Math.max(0, Math.min(100, p.agitation + 32));
      p.morale = Math.max(0, Math.min(100, p.morale - 8));
    }
    logEvent(state, {
      category: 'development',
      code: 'squad.overstacked',
      message: `${club.name}'s squad is bloated — ${surplus.map((p) => p.name).join(', ')} chafe at the lack of minutes.`,
      data: { clubId: club.id, players: surplus.map((p) => p.id), penalty: Number((club.chemistryPenalty ?? 0).toFixed(1)) },
    });
  }
}
