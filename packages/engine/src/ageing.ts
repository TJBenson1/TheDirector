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
