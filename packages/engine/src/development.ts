/**
 * Contextual development engine (§5) — the signature system.
 *
 * A player's potential is a ceiling, not a script. Whether he approaches it
 * depends on development inputs evaluated each season: minutes at an appropriate
 * level (the biggest factor — benched wonderkids plateau), competition for
 * place, coaching, injury history, professionalism, and the age/position curve.
 *
 * Anti-hindsight property (§5): because development is contextual, "X became
 * world-class in reality" only pays off if the player can supply the pathway.
 *
 * Runs at the season rollover alongside decline (ageing.ts). This module owns
 * the *growth* half (young players); ageing.ts owns decline. It also runs the
 * low-professionalism lifestyle-decline check (the Ronaldinho pattern).
 *
 * Calibration target (§12), owned here: benched (<40% minutes, 2+ yrs)
 * wonderkids reaching their ceiling < 15%.
 */

import type { ClubState, GameState, PlayerState, Position } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { clubSquadPlayers, recomputeClubStrength } from './players.js';

const DEV_AGE_MAX = 23; // growth window (§5 age curve)
const REACHED_MARGIN = 2; // ability within this of ceiling ⇒ "reached potential"

type PositionGroup = 'GK' | 'DEF' | 'MID' | 'ATT';

const GROUP_OF: Record<Position, PositionGroup> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF',
  DM: 'MID', CM: 'MID', AM: 'MID',
  LW: 'ATT', RW: 'ATT', ST: 'ATT',
};

/** Typical first-choice slots per position group in a matchday XI. */
const GROUP_SLOTS: Record<PositionGroup, number> = { GK: 1, DEF: 4, MID: 3, ATT: 3 };

function groupOf(player: PlayerState): PositionGroup {
  return GROUP_OF[player.positions[0] ?? 'CM'];
}

/**
 * Estimated share of "minutes at an appropriate level" (0..1) for a player,
 * from his ability rank within his position group at the club. A young talent
 * blocked behind established stars gets few minutes → stunted; the same player
 * at a weaker club plays → develops. This is the core anti-hindsight lever.
 */
export function estimateMinutesShare(state: GameState, club: ClubState, player: PlayerState): number {
  const group = groupOf(player);
  const peers = clubSquadPlayers(state, club.id).filter((p) => groupOf(p) === group);
  const rank = peers.filter((p) => p.ability > player.ability || (p.ability === player.ability && p.id < player.id)).length;
  const slots = GROUP_SLOTS[group];
  if (rank < slots) return 0.85; // first choice
  if (rank < slots + 2) return 0.4; // rotation
  return 0.1; // benched
}

function minutesFactor(share: number): number {
  if (share >= 0.6) return 1.0;
  if (share >= 0.4) return 0.5;
  return 0.05; // benched → almost no growth
}

/** Ceiling erosion per benched development season — a lost window that
 *  permanently plateaus the player below his birth potential (§5: ~70–80%). */
const BENCH_CEILING_EROSION = 4;

/**
 * Develop and lifestyle-check every player at the season rollover. Growth for
 * the young (gated by minutes/coaching/professionalism/injuries), and a
 * lifestyle-decline roll for successful low-professionalism stars.
 */
export function processSeasonDevelopment(state: GameState, rng: Rng): void {
  const year = Number(state.clock.date.slice(0, 4));
  const devRng = rng.fork(`development:${year}`);

  for (const club of Object.values(state.clubs)) {
    let changed = false;
    for (const player of clubSquadPlayers(state, club.id)) {
      const age = year - player.birthYear;

      if (age <= DEV_AGE_MAX && player.ability < player.potentialCeiling) {
        changed = developYoungster(state, club, player, age, devRng) || changed;
      } else if (age >= 25 && player.ability >= 82) {
        lifestyleDeclineCheck(state, club, player, devRng);
        changed = true;
      }

      // "Reached potential" is measured against the BIRTH ceiling — a stunted
      // player who plateaus below it never counts, even if he maxes his eroded
      // working ceiling.
      if (!player.reachedPotential && player.ability >= player.birthCeiling - REACHED_MARGIN) {
        player.reachedPotential = true;
      }
    }
    if (changed && club.leagueId !== null) recomputeClubStrength(state, club.id);
  }
}

function developYoungster(
  state: GameState,
  club: ClubState,
  player: PlayerState,
  age: number,
  rng: Rng,
): boolean {
  const share = estimateMinutesShare(state, club, player);
  if (share < 0.4) {
    // A benched development season: count it and erode the working ceiling —
    // the missed window plateaus him below his birth potential (§5).
    player.benchedDevSeasons += 1;
    player.potentialCeiling = Math.max(player.ability, player.potentialCeiling - BENCH_CEILING_EROSION);
  }
  const gap = player.potentialCeiling - player.ability;
  if (gap <= 0) return false;

  const coaching = 0.6 + 0.4 * (club.prestige / 100); // facilities proxy (§5)
  const prof = 0.7 + 0.3 * (player.personality.professionalism / 10);
  const ageFactor = age <= 19 ? 1.2 : age <= 21 ? 1.0 : 0.7;
  const injuryPenalty = player.injuryHistory * 1.5;

  const ideal = gap * 0.35; // approach the ceiling over a few ideal years
  const realized = ideal * minutesFactor(share) * coaching * prof * ageFactor - injuryPenalty;
  const delta = Math.max(0, Math.round(realized + rng.gaussian(0, 0.6)));

  if (delta > 0) {
    player.ability = Math.min(player.potentialCeiling, player.ability + delta);
    return true;
  }
  return false;
}

/** The Ronaldinho pattern: a successful star with low professionalism can
 *  decline early. Weighted by volatility/professionalism and team success. */
function lifestyleDeclineCheck(
  state: GameState,
  club: ClubState,
  player: PlayerState,
  rng: Rng,
): void {
  const prof = player.personality.professionalism;
  const vol = player.personality.volatility;
  if (prof >= 7) return; // consummate pros rarely decline this way

  // Team success amplifies complacency: use club strength as a proxy for "won everything".
  const success = club.strength >= 80 ? 1.4 : 1.0;
  const p = 0.02 * (8 - prof) * (0.6 + vol / 20) * success;
  if (rng.chance(p)) {
    const drop = rng.int(3, 7);
    player.ability = Math.max(40, player.ability - drop);
    player.potentialCeiling = Math.max(player.ability, player.potentialCeiling - Math.round(drop / 2));
    logEvent(state, {
      category: 'development',
      code: 'decline.lifestyle',
      message: `${player.name} (${club.name}) declines through lifestyle/complacency`,
      data: { playerId: player.id, clubId: club.id, drop },
    });
  }
}
