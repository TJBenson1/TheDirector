/**
 * AI squad renewal (§9a / §15). Real clubs recruit continuously to stay at their
 * level; without it, every curated squad is a frozen snapshot that only ages, so
 * over a long sim the elite decay, the table compresses, and variance hands
 * titles to mid-table sides. This keeps a simulated club near its baseStrength by
 * shedding aged deadwood and bringing in a first-teamer when it has slipped.
 *
 * The USER's club is never renewed here — the user runs their own transfers.
 * Recruits are procedural (anonymous depth, Principle 2), standing in for the
 * ongoing recruitment a curated ledger doesn't cover.
 */

import type { GameState, Position } from './types.js';
import { Rng } from './rng.js';
import { clubSquadPlayers, generatePlayer, recomputeClubStrength } from './players.js';

/** How far below baseStrength a club tolerates before it recruits. */
const SLIP_TOLERANCE = 2;
/** A recruit lands a touch below the club's level, then develops. */
const RECRUIT_GAP = 2;

function ageOf(birthYear: number, year: number): number {
  return year - birthYear;
}

/**
 * Once per season (July), each simulated non-user club that has slipped below
 * its baseStrength sheds its weakest aged/declined player and signs one prime
 * replacement at roughly its level — nudging strength back toward baseStrength.
 */
export function renewSimulatedSquads(state: GameState, rng: Rng): void {
  const year = Number(state.clock.date.slice(0, 4));

  for (const club of Object.values(state.clubs)) {
    if (club.leagueId === null) continue; // only simulated (in-league) squads
    if (club.id === state.playerClub) continue; // the user manages his own club
    if (club.strength >= club.baseStrength - SLIP_TOLERANCE) continue; // competitive enough

    const clubRng = rng.fork(`renew:${club.id}:${year}`);
    const squad = clubSquadPlayers(state, club.id);
    if (squad.length === 0) continue;

    // Shed the weakest player who is aged or well below the club's level — the
    // deadwood a recruiting club would move on. (Retirement / a quiet exit.)
    const shed = [...squad]
      .filter((p) => ageOf(p.birthYear, year) >= 31 || p.ability < club.baseStrength - 12)
      .sort((a, b) => a.ability - b.ability)[0];
    let position: Position = 'CM';
    if (shed) {
      position = shed.positions[0] ?? 'CM';
      club.squad = club.squad.filter((id) => id !== shed.id);
      delete state.players[shed.id];
    } else if (squad.length >= 25) {
      continue; // no deadwood and squad already full — leave it be
    }

    // Recruit one prime first-teamer at (about) the club's level; he'll bed in
    // and age like everyone else, so this is renewal, not a ratchet.
    const recruit = generatePlayer({
      id: `p_${club.id}_renew_${year}`,
      clubId: club.id,
      leagueId: club.leagueId,
      position,
      targetAbility: club.baseStrength - RECRUIT_GAP,
      currentYear: year,
      ageBias: 'prime',
      rng: clubRng,
    });
    state.players[recruit.id] = recruit;
    club.squad.push(recruit.id);

    recomputeClubStrength(state, club.id);
  }
}
