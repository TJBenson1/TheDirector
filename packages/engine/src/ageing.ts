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
import { ERA_REALITY, eraForScenario, entryKey } from './ledger.js';
import { estimateMinutesShare } from './development.js';

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

/** All ledger subjects (for crediting a retiree in the squad-match metric). */
function ledgerSubjectIds(state: GameState): Set<string> {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  const ids = new Set<string>();
  for (const e of pack?.realTransferLedger ?? []) ids.add(e.playerId);
  return ids;
}

/** Ledger subjects with a real move STILL to execute — they must not retire yet,
 *  or their transfer would never happen (breaking reality-default). Once his
 *  moves are done a legend retires normally (at his real date), and squad-match
 *  credits the retirement rather than counting him as misplaced. */
function pendingMoverIds(state: GameState): Set<string> {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  const ids = new Set<string>();
  for (const e of pack?.realTransferLedger ?? []) {
    if (!state.meta.executedLedger.includes(entryKey(e))) ids.add(e.playerId);
  }
  return ids;
}

/** Real retirement years for curated players, from the era pack. */
function retirementSchedule(state: GameState): Map<string, number> {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  const m = new Map<string, number>();
  for (const r of pack?.retirements ?? []) m.set(r.playerId, r.year);
  return m;
}

/**
 * The year a curated player actually retires, adjusted by USER influence on his
 * own squad (the "played squad" directive): if his minutes have dried up — the
 * user built a stronger side around him — he steps aside a year or two early
 * (Giggs' minutes going earlier); if he is still a key starter he plays on a
 * touch (a graceful, planned send-off). Only the user's own club is influenced;
 * elsewhere reality's date holds.
 */
function effectiveRetireYear(state: GameState, player: PlayerState, realYear: number): number {
  if (player.club !== state.playerClub || !player.club) return realYear;
  const club = state.clubs[player.club];
  if (!club) return realYear;
  const share = estimateMinutesShare(state, club, player);
  if (share < 0.2) return realYear - 2; // squeezed out — bows out early
  if (share < 0.4) return realYear - 1;
  if (share >= 0.6) return realYear + 1; // still needed — plays on gracefully
  return realYear;
}

function shouldRetire(
  state: GameState,
  player: PlayerState,
  age: number,
  year: number,
  pendingMovers: Set<string>,
  schedule: Map<string, number>,
): boolean {
  if (pendingMovers.has(player.id)) return false; // finish real moves before retiring
  const realYear = schedule.get(player.id);
  if (realYear !== undefined) return year >= effectiveRetireYear(state, player, realYear);
  // No real date (procedural filler, or an uncurated career): age-based fallback.
  const retireAge = RETIRE_AGE[player.positions[0] ?? 'CM'];
  return age >= retireAge || (age >= 35 && player.ability < 55);
}

/** Minimum squad size kept via anonymous depth so injuries/rotation stay real. */
const SQUAD_DEPTH_FLOOR = 22;

/**
 * Retire a player. The NAMED youth pipeline is real academy graduates
 * (development.ts) — no fabricated academy stars. But a squad must still field a
 * viable bench, so if retirement leaves it below the depth floor it is topped up
 * with ANONYMOUS depth: unnamed, raw filler standing in for the dozens of
 * real-but-uncurated squad members (Principle 2). This filler is never surfaced
 * as a graduate, prospect, or named career (the sampler + scouting exclude
 * procedural players), so no fake player enters the narrative. Deterministic.
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
    data: { playerId: player.id, clubId: club.id, age, curated: player.curated },
  });

  // Only top up when genuinely thin — real academy graduates and signings fill
  // most gaps; anonymous depth is the safety net, raw and weaker than the man it
  // replaces, so an unmanaged squad still erodes (renewal is not a free upgrade).
  if (club.squad.length >= SQUAD_DEPTH_FLOOR) return;
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
  const pendingMovers = pendingMoverIds(state);
  const ledgerIds = ledgerSubjectIds(state);
  const schedule = retirementSchedule(state);

  for (const club of Object.values(state.clubs)) {
    let changed = false;
    const retirees: PlayerState[] = [];
    for (const player of clubSquadPlayers(state, club.id)) {
      const age = year - player.birthYear;

      // End of the road: he retires (handled after the loop so we don't mutate
      // the squad mid-iteration). Real players retire ≈ when they really did.
      if (shouldRetire(state, player, age, year, pendingMovers, schedule)) {
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
      for (const r of retirees) {
        // A retiring ledger legend is recorded so squad-match still credits him
        // (he retired at his real club — reality-consistent, not misplaced).
        if (ledgerIds.has(r.id)) (state.meta.retiredLedgerSubjects ??= []).push(r.id);
        retirePlayer(state, club, r, year, retRng);
      }
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
