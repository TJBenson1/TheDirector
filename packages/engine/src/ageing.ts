/**
 * Ageing & decline (§5, §17.4). Applied once per season at the July rollover.
 *
 * Position-specific decline curves that can BREAK SUDDENLY (post-30 collapse
 * rolls) — rewarding "sell at peak" judgment and punishing holding too long.
 * Contextual *development* (young players growing toward their ceiling) is the
 * M5 signature system; M4 owns the decline half so squads age realistically
 * and dominance erodes over a career.
 */

import type { ClubState, GameState, PlayerState, Position } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { clubSquadPlayers, recomputeClubStrength, generatePlayer } from './players.js';
import { ERA_REALITY, eraForScenario } from './ledger.js';

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

/** Age at which a player hangs up his boots, by position (keepers last longest).
 *  Old players must LEAVE the game — otherwise a 1999 squad is still on the pitch
 *  in 2013 (a Historian realism note: Butt/Johnsen "at United" years after they
 *  really left). A faded player (very low ability past 35) also retires. */
const RETIRE_AGE: Record<Position, number> = {
  GK: 41,
  CB: 39,
  LB: 38,
  RB: 38,
  DM: 37,
  CM: 37,
  AM: 37,
  LW: 36,
  RW: 36,
  ST: 37,
};

function declineStartFor(positions: Position[]): number {
  // Use the most forgiving of the player's positions.
  return Math.max(...positions.map((p) => DECLINE_START[p]));
}

/** Ledger subjects are never retired: their real moves (past or future) drive
 *  the reality-default squad-match, so removing them would break that fidelity.
 *  A minority of ageing legends thus linger — acceptable next to the systemic
 *  "no one ever retires" break this fixes. */
function ledgerSubjectIds(state: GameState): Set<string> {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  const ids = new Set<string>();
  for (const e of pack?.realTransferLedger ?? []) ids.add(e.playerId);
  return ids;
}

function shouldRetire(player: PlayerState, age: number, protectedIds: Set<string>): boolean {
  if (protectedIds.has(player.id)) return false;
  const retireAge = RETIRE_AGE[player.positions[0] ?? 'CM'];
  return age >= retireAge || (age >= 35 && player.ability < 55);
}

/**
 * Retire a player: remove him from the game and blood a young replacement in his
 * position, so the squad churns generationally rather than shrinking or
 * fossilising. Deterministic given `rng`.
 */
function retirePlayer(
  state: GameState,
  club: ClubState,
  player: PlayerState,
  year: number,
  rng: Rng,
): void {
  const age = year - player.birthYear;
  club.squad = club.squad.filter((id) => id !== player.id);
  delete state.players[player.id];
  logEvent(state, {
    category: 'development',
    code: 'career.retired',
    message: `${player.name} (${club.name}, ${age}) hangs up his boots`,
    data: { playerId: player.id, clubId: club.id, age },
  });

  // A youth graduate steps up — but RAW: an academy kid, weaker than the man he
  // replaces, so an unmanaged squad still erodes (renewal is not a free upgrade).
  // He may develop later, or not (§5). Squads churn; dominance is still not free.
  const position = player.positions[0] ?? 'CM';
  const kid = generatePlayer({
    id: `p_${club.id}_y${year}_${player.id.replace(/[^a-z0-9]/gi, '')}`,
    clubId: club.id,
    leagueId: club.leagueId,
    position,
    targetAbility: Math.max(38, Math.min(player.ability - 6, club.baseStrength - 16)),
    currentYear: year,
    ageBias: 'young',
    rng,
  });
  state.players[kid.id] = kid;
  club.squad.push(kid.id);
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
  const protectedIds = ledgerSubjectIds(state);

  for (const club of Object.values(state.clubs)) {
    let changed = false;
    const retirees: PlayerState[] = [];
    for (const player of clubSquadPlayers(state, club.id)) {
      const age = year - player.birthYear;

      // End of the road: he retires and a youngster takes his place (handled
      // after the loop so we don't mutate the squad mid-iteration).
      if (shouldRetire(player, age, protectedIds)) {
        retirees.push(player);
        continue;
      }

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
    if (retirees.length > 0) {
      const retRng = ageRng.fork(`retire:${club.id}`);
      for (const r of retirees) retirePlayer(state, club, r, year, retRng);
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
