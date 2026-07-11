/**
 * Adaptation engine (docs/DESIGN-context-and-friction.md §3).
 *
 * Every incoming transfer that crosses a stylistic/cultural boundary rolls a
 * HIDDEN, probabilistic adaptation outcome. Strong fit lowers the failure odds
 * but never to zero — "great player, logical signing" can still flop (the
 * Verón / Shevchenko-at-Chelsea archetype). Buying early trades a lower fee for
 * higher variance.
 *
 * While unsettled, an adaptation `penalty` reduces the player's EFFECTIVE
 * ability (feeding squad strength and season output, so a struggling signing
 * both plays worse and features less). On resolution it either blooms to full
 * ability (slow-burn) or leaves a permanent residual cut (partial/failure).
 */

import type {
  AdaptationOutcome,
  AdaptationState,
  ClubId,
  GameState,
  PlayerState,
} from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { styleForClub, styleKeyForClub, styleDistance } from './leaguestyle.js';

/** Effective ability after any active adaptation penalty. */
export function effectiveAbility(player: PlayerState): number {
  const pen = player.adaptation && !player.adaptation.settled ? player.adaptation.penalty : 0;
  return Math.max(20, Math.round(player.ability * (1 - pen)));
}

/** Rough nationality → country-style key (for cultural distance). */
const NATIONALITY_STYLE: Record<string, string> = {
  England: 'england', Scotland: 'england', Wales: 'england', Ireland: 'england',
  'N. Ireland': 'england',
  Spain: 'spain', Portugal: 'spain', Argentina: 'spain', Brazil: 'spain',
  Italy: 'italy',
  Germany: 'germany', Austria: 'germany', Switzerland: 'germany',
  Netherlands: 'netherlands',
};

const PENALTY: Record<AdaptationOutcome, { penalty: number; seasons: number }> = {
  seamless: { penalty: 0, seasons: 0 },
  'slow-burn': { penalty: 0.15, seasons: 1 },
  partial: { penalty: 0.1, seasons: 2 },
  failure: { penalty: 0.28, seasons: 2 },
};

/**
 * Roll an adaptation outcome for a player joining `toClub` from `fromClubId`.
 * A same-country move is seamless. Otherwise difficulty is built from style
 * distance, age, cultural distance and the player's adaptability/professionalism.
 */
export function rollAdaptation(
  state: GameState,
  player: PlayerState,
  fromClubId: ClubId | null,
  toClub: ClubId,
  rng: Rng,
): AdaptationState {
  const fromKey = styleKeyForClub(state, fromClubId);
  const toKey = styleKeyForClub(state, toClub);
  const settledSeamless: AdaptationState = { outcome: 'seamless', penalty: 0, seasonsRemaining: 0, settled: true };

  // Same country/style, or unknown origin ⇒ no adaptation friction.
  if (fromKey === toKey) return settledSeamless;

  const dist = styleDistance(styleForClub(state, fromClubId), styleForClub(state, toClub));
  const year = Number(state.clock.date.slice(0, 4));
  const age = year - player.birthYear;

  const agePenalty = age <= 23 ? -0.05 : age >= 29 ? 0.12 : 0;
  const nativeKey = NATIONALITY_STYLE[player.nationality];
  const culturalPenalty = nativeKey === toKey ? -0.05 : 0.1;
  const adaptBonus =
    (player.personality.adaptability - 5) * 0.02 + (player.personality.professionalism - 5) * 0.012;

  const difficulty = Math.max(0, Math.min(0.9, 0.55 * dist + agePenalty + culturalPenalty - adaptBonus));

  // Younger players carry more variance (bigger swings both ways).
  const variance = age <= 21 ? 1.2 : 1.0;
  const failureProb = difficulty * 0.35 * variance;
  const partialProb = difficulty * 0.25;
  const slowBurnProb = 0.18 + difficulty * 0.22;

  const r = rng.next();
  let outcome: AdaptationOutcome;
  if (r < failureProb) outcome = 'failure';
  else if (r < failureProb + partialProb) outcome = 'partial';
  else if (r < failureProb + partialProb + slowBurnProb) outcome = 'slow-burn';
  else outcome = 'seamless';

  const spec = PENALTY[outcome];
  return { outcome, penalty: spec.penalty, seasonsRemaining: spec.seasons, settled: outcome === 'seamless' };
}

/**
 * Resolve one season of adaptation for every player, at the rollover. Unsettled
 * players tick down; on resolution they bloom (slow-burn → full ability) or take
 * a permanent residual cut (partial/failure). Recomputes strength for affected
 * simulated clubs is left to the caller batch.
 */
export function resolveAdaptationSeason(state: GameState, rng: Rng): void {
  const r = rng.fork('adaptation:resolve');
  for (const player of Object.values(state.players)) {
    const a = player.adaptation;
    if (!a || a.settled) continue;
    a.seasonsRemaining -= 1;
    if (a.seasonsRemaining > 0) continue;

    if (a.outcome === 'slow-burn') {
      // Struggled, then bloomed — full ability retained.
      player.adaptation = { ...a, penalty: 0, settled: true };
    } else if (a.outcome === 'partial') {
      player.ability = Math.max(30, player.ability - 2);
      player.adaptation = { ...a, penalty: 0, settled: true };
    } else {
      // Failure: never realised in this context.
      const cut = r.int(5, 9);
      player.ability = Math.max(30, player.ability - cut);
      player.potentialCeiling = Math.max(player.ability, player.potentialCeiling - cut);
      player.adaptation = { ...a, penalty: 0, settled: true };
      const club = player.club ? state.clubs[player.club] : undefined;
      logEvent(state, {
        category: 'development',
        code: 'adaptation.failed',
        message: `${player.name}${club ? ` (${club.name})` : ''} never adapted — a failed signing`,
        data: { playerId: player.id, cut },
      });
    }
  }
}
