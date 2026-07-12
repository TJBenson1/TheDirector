/**
 * Injuries (§9c) — the first CI-gated realism system (§12).
 *
 * Rates depend on injury-proneness, age, congestion and post-injury fitness.
 * Most injuries are soft-tissue (a month); serious ligament-class injuries
 * (6–9 months) are rare — league-wide ~1–2 per squad per season — and can
 * permanently shave ability/ceiling and raise recurrence risk. Depth mitigates
 * the on-pitch damage (strength drops to the next-best available player) but
 * never nullifies it (§9c). AI clubs suffer on the same distributions.
 *
 * Calibration targets (§12), asserted by the harness in CI:
 *   • Serious (6mo+) injuries league-wide ~1–2 per squad-season.
 *   • User club ≥1 major injury crisis (3+ simultaneous) per decade (≥90%).
 */

import type { GameState, InjuryKind, PlayerState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { isRunInMonth } from './clock.js';
import { clubSquadPlayers, recomputeClubStrength } from './players.js';

// ── Tunables (calibrated in injuries.test.ts + the harness) ──────────────────
const BASE_MONTHLY_PROB = 0.032;
const SERIOUS_ABILITY_HIT: [min: number, max: number] = [1, 3];
const SERIOUS_CEILING_HIT: [min: number, max: number] = [0, 2];
const SERIOUS_PRONENESS_HIT = 12;
const RETURN_FITNESS = 60; // rusty on return → elevated recurrence risk

function ageOf(player: PlayerState, year: number): number {
  return year - player.birthYear;
}

/** Per-player monthly probability of picking up a new injury. */
function injuryProbability(
  player: PlayerState,
  year: number,
  monthIndex: number,
  injuryFrequency: number,
): number {
  const proneness = player.injuryProneness / 40; // 40 ≈ ×1.0
  const age = ageOf(player, year);
  const ageFactor = age >= 33 ? 1.5 : age >= 30 ? 1.2 : age <= 20 ? 1.1 : 1.0;
  const congestion = isRunInMonth(monthIndex) ? 1.4 : 1.0;
  const fitnessFactor = player.fitness < 70 ? 1.25 : 1.0;
  const p = BASE_MONTHLY_PROB * proneness * ageFactor * congestion * fitnessFactor * injuryFrequency;
  return Math.max(0, Math.min(0.5, p));
}

/** Roll a severity and its duration in months. */
function rollSeverity(rng: Rng): { kind: InjuryKind; months: number } {
  const r = rng.next();
  if (r < 0.64) return { kind: 'minor', months: 1 };
  if (r < 0.88) return { kind: 'moderate', months: rng.int(2, 3) };
  return { kind: 'serious', months: rng.int(6, 9) };
}

/**
 * Process one month of injuries across all simulated (in-league) clubs.
 * Decrements existing injuries (applying return/permanent effects), then rolls
 * new ones, then recomputes affected clubs' strength so availability feeds
 * results the same month.
 */
export function processInjuriesMonth(state: GameState, rng: Rng): void {
  const year = Number(state.clock.date.slice(0, 4));
  const monthIndex = state.clock.monthIndex;
  const injuryFrequency = state.settings.injuryFrequency;
  const injRng = rng.fork(`injuries:${state.clock.date}`);

  for (const club of Object.values(state.clubs)) {
    if (club.leagueId === null) continue; // only simulated squads get injuries
    let changed = false;

    for (const player of clubSquadPlayers(state, club.id)) {
      if (player.injury) {
        player.seasonMonthsInjured += 1; // time lost this season (drives valuation §1)
        // Recover.
        player.injury.monthsRemaining -= 1;
        if (player.injury.monthsRemaining <= 0) {
          const wasSerious = player.injury.kind === 'serious';
          player.injury = null;
          player.fitness = RETURN_FITNESS;
          if (wasSerious) {
            player.ability = Math.max(30, player.ability - injRng.int(...SERIOUS_ABILITY_HIT));
            player.potentialCeiling = Math.max(
              player.ability,
              player.potentialCeiling - injRng.int(...SERIOUS_CEILING_HIT),
            );
            player.injuryProneness = Math.min(95, player.injuryProneness + SERIOUS_PRONENESS_HIT);
          }
          changed = true;
        }
        continue; // an injured player can't pick up a new injury this month
      }

      // Fitness recovers toward full when fit.
      if (player.fitness < 100) player.fitness = Math.min(100, player.fitness + 10);

      const p = injuryProbability(player, year, monthIndex, injuryFrequency);
      if (injRng.chance(p)) {
        const { kind, months } = rollSeverity(injRng);
        player.injury = { kind, monthsRemaining: months, since: state.clock.date };
        if (kind === 'serious') {
          player.injuryHistory += 1;
          logEvent(state, {
            category: 'injury',
            code: 'injury.serious',
            message: `${player.name} (${club.name}) suffers a serious injury — out ~${months} months`,
            data: { playerId: player.id, clubId: club.id, months },
          });
        }
        changed = true;
      }
    }

    if (changed) recomputeClubStrength(state, club.id);
  }
}

/** Count of a club's currently-injured players (for crisis detection, §12). */
export function injuredCount(state: GameState, clubId: string): number {
  return clubSquadPlayers(state, clubId).filter((p) => p.injury !== null).length;
}

/** Count of a club's players out with a significant (moderate+) injury. */
export function significantInjuredCount(state: GameState, clubId: string): number {
  return clubSquadPlayers(state, clubId).filter(
    (p) => p.injury !== null && p.injury.kind !== 'minor',
  ).length;
}
