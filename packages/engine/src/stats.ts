/**
 * Per-player season output (docs/DESIGN-context-and-friction.md §1, §5).
 *
 * The season sim is abstract, so per-player output is generated statistically at
 * the rollover from the player's minutes share (position rank), effective
 * ability (adaptation-aware), position, and how much of the season he missed
 * injured. This produces realistic per-position numbers (a first-choice striker
 * ~15–22 league goals) that drive dynamic valuation and, later, the window
 * briefing. Reads the season that just finished; called before the standings
 * reset in August.
 */

import type { ClubState, GameState, PlayerState, Position, SeasonStats } from './types.js';
import { Rng } from './rng.js';
import { clubSquadPlayers } from './players.js';
import { estimateMinutesShare } from './development.js';
import { effectiveAbility } from './adaptation.js';

const TOTAL_ROUNDS = 38;

/** Goals per appearance baseline by position (scaled by ability). */
const GOAL_RATE: Record<Position, number> = {
  GK: 0, CB: 0.03, LB: 0.04, RB: 0.04, DM: 0.05, CM: 0.09, AM: 0.18, LW: 0.24, RW: 0.24, ST: 0.42,
};
const ASSIST_RATE: Record<Position, number> = {
  GK: 0, CB: 0.02, LB: 0.06, RB: 0.06, DM: 0.05, CM: 0.11, AM: 0.22, LW: 0.2, RW: 0.2, ST: 0.16,
};

function primary(player: PlayerState): Position {
  return player.positions[0] ?? 'CM';
}

/** Compute one player's season stats from his role, ability and availability. */
export function computePlayerSeason(
  state: GameState,
  club: ClubState,
  player: PlayerState,
  rng: Rng,
): SeasonStats {
  const share = estimateMinutesShare(state, club, player);
  const availableFraction = Math.max(0, (10 - Math.min(10, player.seasonMonthsInjured)) / 10);
  const appearances = Math.round(TOTAL_ROUNDS * share * availableFraction);
  const eff = effectiveAbility(player);
  const abilityScale = Math.max(0, (eff - 50) / 40); // 0 at 50, 1 at 90

  const pos = primary(player);
  const goalExp = GOAL_RATE[pos] * appearances * (0.6 + abilityScale);
  const assistExp = ASSIST_RATE[pos] * appearances * (0.6 + abilityScale);
  const goals = Math.max(0, Math.round(goalExp + rng.gaussian(0, Math.sqrt(goalExp + 0.5))));
  const assists = Math.max(0, Math.round(assistExp + rng.gaussian(0, Math.sqrt(assistExp + 0.5))));

  // Seasonal rating from effective ability and minutes, ADJUSTED by output
  // relative to what the role should produce. An attacker who blanks a full
  // season is not a 7.8 (a Historian realism note); defenders and keepers stay
  // output-neutral, judged on ability, not goals.
  const expectedOutput = goalExp + assistExp;
  const actualOutput = goals + assists;
  const attacker = pos === 'AM' || pos === 'LW' || pos === 'RW' || pos === 'ST';
  const outputTerm = attacker
    ? Math.max(-1.4, Math.min(1.2, (actualOutput - expectedOutput) * 0.12))
    : pos === 'CM'
      ? Math.max(-0.5, Math.min(0.6, (actualOutput - expectedOutput) * 0.08))
      : 0;
  const rating = Math.max(
    4,
    Math.min(9, 5.5 + abilityScale * 2 + (share - 0.5) * 1.5 + outputTerm + rng.gaussian(0, 0.3)),
  );

  return {
    appearances,
    goals,
    assists,
    monthsInjured: player.seasonMonthsInjured,
    minutesShare: Number(share.toFixed(2)),
    rating: Number(rating.toFixed(1)),
  };
}

/**
 * Write `lastSeason` for every simulated-club player from the season just
 * completed, then reset the injury-month counter for the new season.
 */
export function computeSeasonStats(state: GameState, rng: Rng): void {
  const statsRng = rng.fork(`stats:${state.clock.date}`);
  for (const club of Object.values(state.clubs)) {
    if (club.leagueId === null) continue;
    for (const player of clubSquadPlayers(state, club.id)) {
      player.lastSeason = computePlayerSeason(state, club, player, statsRng);
      player.seasonMonthsInjured = 0;
    }
  }
}
