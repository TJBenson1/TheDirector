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
import { setPlayerAbility } from './attributes.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { isRunInMonth } from './clock.js';
import { clubSquadPlayers, recomputeClubStrength } from './players.js';
import { ERA_REALITY, eraForScenario } from './ledger.js';

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
 * Narrative CAUSE of a serious injury. A genuinely fragile player's injuries read
 * as OVERLOAD — the manager could have protected him (rest, load management), so
 * they're on you. A robust player's are bad luck — a heavy tackle or a freak
 * incident, not a management failure. This is what lets the game distinguish "you
 * rode him into the ground" from "nothing you could do".
 */
const CAUSE_PHRASE: Record<string, string> = {
  overload: 'breaks down under his workload',
  muscle: 'pulls up with a muscle injury',
  tackle: 'is hurt by a heavy challenge',
  freak: 'suffers a freak injury',
};
function injuryCause(player: PlayerState, rng: Rng): { cause: string; phrase: string } {
  const fragile = player.injuryProneness >= 55;
  const r = rng.next();
  if (fragile) {
    const cause = r < 0.5 ? 'overload' : r < 0.75 ? 'muscle' : 'tackle';
    return { cause, phrase: CAUSE_PHRASE[cause]! };
  }
  const cause = r < 0.5 ? 'tackle' : r < 0.8 ? 'freak' : 'muscle';
  return { cause, phrase: CAUSE_PHRASE[cause]! };
}

/**
 * Fire real historical injuries scheduled for this exact month — but only if the
 * player is still at the club he was at in reality (so injuries "match up", per
 * feedback). If the user has already moved him, the real injury lapses: it was a
 * fact about that squad in that timeline, not a curse on the player. Each entry
 * fires at most once (tracked in meta.firedRealInjuries).
 */
export function fireRealInjuries(state: GameState): void {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return;
  const touched = new Set<string>();
  for (const entry of pack.realInjuries) {
    if (entry.since !== state.clock.date) continue;
    if (state.meta.firedRealInjuries.includes(entry.playerId)) continue;
    const player = state.players[entry.playerId];
    if (!player || player.club !== entry.atClub) continue; // moved by the user → lapses
    if (player.injury) continue; // already hurt; don't stack
    const months = entry.months;
    const kind: InjuryKind = entry.serious ? 'serious' : 'moderate';
    player.injury = { kind, monthsRemaining: months, since: state.clock.date };
    if (entry.serious) player.injuryHistory += 1;
    state.meta.firedRealInjuries.push(entry.playerId);
    touched.add(entry.atClub);
    logEvent(state, {
      category: 'injury',
      code: entry.serious ? 'injury.real.serious' : 'injury.real',
      message: `${player.name} (${state.clubs[entry.atClub]?.name ?? entry.atClub}) — ${entry.note ?? 'injury'}, out ~${months} months`,
      data: { playerId: entry.playerId, clubId: entry.atClub, months, real: true },
    });
  }
  for (const clubId of touched) recomputeClubStrength(state, clubId);
}

/**
 * Process one month of injuries across all simulated (in-league) clubs.
 * Decrements existing injuries (applying return/permanent effects), then rolls
 * new ones, then recomputes affected clubs' strength so availability feeds
 * results the same month.
 */
export function processInjuriesMonth(state: GameState, rng: Rng): void {
  fireRealInjuries(state);
  const year = Number(state.clock.date.slice(0, 4));
  const monthIndex = state.clock.monthIndex;
  const injuryFrequency = state.settings.injuryFrequency;
  const injRng = rng.fork(`injuries:${state.clock.date}`);

  for (const club of Object.values(state.clubs)) {
    if (club.leagueId === null) continue; // only simulated squads get injuries
    let changed = false;

    for (const player of clubSquadPlayers(state, club.id)) {
      // Load-managed rest: he sits out (unavailable → weaker side) but picks up no
      // injury this month, and returns fresh.
      if (player.restMonths && player.restMonths > 0) {
        player.restMonths -= 1;
        player.seasonMonthsInjured += 1; // games missed this season (drives valuation §1)
        if (player.restMonths <= 0) {
          player.restMonths = 0;
          player.fitness = Math.max(player.fitness, 90);
          logEvent(state, {
            category: 'injury',
            code: 'load.return',
            message: `${player.name} (${club.name}) returns from a managed rest, fresh`,
            data: { playerId: player.id, clubId: club.id },
          });
          changed = true;
        }
        continue;
      }

      if (player.injury) {
        player.seasonMonthsInjured += 1; // time lost this season (drives valuation §1)
        // Recover.
        player.injury.monthsRemaining -= 1;
        if (player.injury.monthsRemaining <= 0) {
          const wasSerious = player.injury.kind === 'serious';
          player.injury = null;
          player.fitness = RETURN_FITNESS;
          if (wasSerious) {
            setPlayerAbility(player, Math.max(30, player.ability - injRng.int(...SERIOUS_ABILITY_HIT)));
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
          // Fork for the cause flavour so we don't perturb the injury stream
          // (determinism + calibration preserved).
          const { cause, phrase } = injuryCause(player, injRng.fork(`cause:${player.id}`));
          logEvent(state, {
            category: 'injury',
            code: 'injury.serious',
            message: `${player.name} (${club.name}) ${phrase} — out ~${months} months`,
            data: { playerId: player.id, clubId: club.id, months, cause },
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
