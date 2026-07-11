/**
 * Fog of war — scouting & medicals (§7).
 *
 * The user NEVER sees raw `ability`/`potentialCeiling`. Scout reports return
 * RANGES with a confidence level; range width narrows with observation and with
 * scouting reach (own league > familiar > exotic). Medicals return risk grades
 * and can MISS things (a false-clean whose probability scales with the club's
 * medical-department quality) — the Ruud-knee gamble.
 *
 * Principle 2 (docs/DESIGN-reality-default.md): prospect DISCOVERY surfaces real
 * players only. Procedural filler is anonymous depth — you can still scout a
 * specific known player you're buying, but it never appears as a tracked
 * prospect or academy gem.
 */

import type { ClubId, GameState, PlayerState } from './types.js';
import { Rng } from './rng.js';
import { isProcedural } from './ledger.js';

export type ScoutConfidence = 'low' | 'medium' | 'high';

export interface Range {
  low: number;
  high: number;
}

export interface ScoutReport {
  playerId: PlayerId;
  name: string;
  ability: Range;
  potential: Range;
  confidence: ScoutConfidence;
  /** Partial personality signal (§7): volatility can stay hidden. */
  personalityHints: { professionalism: string; ambition: string };
}

type PlayerId = string;

export interface ScoutOptions {
  /** Observation depth 0..1 (games watched, network reach). Improves precision. */
  observation?: number;
}

const BASE_HALF_WIDTH = 9;

/** Reach multiplier: own league is best-known, foreign leagues fuzzier. */
function reachMultiplier(state: GameState, scoutClubId: ClubId, target: PlayerState): number {
  const scout = state.clubs[scoutClubId];
  const targetClub = target.club ? state.clubs[target.club] : undefined;
  if (scout && targetClub && scout.leagueId && scout.leagueId === targetClub.leagueId) return 0.7;
  return 1.35; // exotic / unfamiliar
}

function bandLabel(v: number): string {
  if (v >= 8) return 'high';
  if (v >= 5) return 'moderate';
  return 'low';
}

/**
 * Produce a fogged scout report for a specific player. The true value always
 * lies within the reported range; width and a small centring bias encode the
 * uncertainty. Deterministic for a given (scoutClub, player, seed).
 */
export function scoutPlayer(
  state: GameState,
  scoutClubId: ClubId,
  playerId: PlayerId,
  rng: Rng,
  opts: ScoutOptions = {},
): ScoutReport {
  const player = state.players[playerId];
  if (!player) throw new Error(`scoutPlayer: unknown player "${playerId}"`);

  const observation = Math.max(0, Math.min(1, opts.observation ?? 0.5));
  const fog = state.settings.scoutingFog;
  const reach = reachMultiplier(state, scoutClubId, player);

  const r = rng.fork(`scout:${scoutClubId}:${playerId}`);
  const halfWidth = Math.max(2, Math.round(BASE_HALF_WIDTH * fog * reach * (1 - 0.35 * observation)));

  // Centre within ±halfWidth/2 of truth so the midpoint isn't a giveaway, but
  // the true value is still contained in the range.
  const bias = r.int(-Math.floor(halfWidth / 2), Math.floor(halfWidth / 2));
  const mkRange = (truth: number): Range => ({
    low: Math.max(1, truth + bias - halfWidth),
    high: Math.min(99, truth + bias + halfWidth),
  });

  const confidence: ScoutConfidence = halfWidth <= 4 ? 'high' : halfWidth <= 8 ? 'medium' : 'low';

  return {
    playerId,
    name: player.name,
    ability: mkRange(player.ability),
    potential: mkRange(player.potentialCeiling),
    confidence,
    personalityHints: {
      professionalism: bandLabel(player.personality.professionalism),
      ambition: bandLabel(player.personality.ambition),
    },
  };
}

// ── Medicals (§7) ─────────────────────────────────────────────────────────────

export type MedicalGrade = 'clean' | 'minor-risk' | 'moderate-risk' | 'high-risk';

export interface MedicalResult {
  playerId: PlayerId;
  grade: MedicalGrade; // what the club is told
  /** True if the real risk is worse than the grade shown (a missed flag). The
   *  engine knows this; the UI shows only `grade` — the Ruud-knee gamble. */
  missedRisk: boolean;
}

function trueGrade(player: PlayerState): MedicalGrade {
  const risk = player.injuryProneness + player.injuryHistory * 12;
  if (risk >= 70) return 'high-risk';
  if (risk >= 50) return 'moderate-risk';
  if (risk >= 32) return 'minor-risk';
  return 'clean';
}

const GRADE_ORDER: MedicalGrade[] = ['clean', 'minor-risk', 'moderate-risk', 'high-risk'];

/**
 * Run a medical. `deptQuality` (0..1) is the club's medical department; a lower
 * department is more likely to under-report a genuine risk (false-clean).
 */
export function medicalCheck(
  state: GameState,
  playerId: PlayerId,
  deptQuality: number,
  rng: Rng,
): MedicalResult {
  const player = state.players[playerId];
  if (!player) throw new Error(`medicalCheck: unknown player "${playerId}"`);
  const q = Math.max(0, Math.min(1, deptQuality));
  const truth = trueGrade(player);
  const r = rng.fork(`medical:${playerId}`);

  // Chance of under-reporting a real risk scales with poor department quality.
  const missChance = (1 - q) * 0.4;
  const trueIdx = GRADE_ORDER.indexOf(truth);
  if (trueIdx > 0 && r.chance(missChance)) {
    return { playerId, grade: GRADE_ORDER[trueIdx - 1]!, missedRisk: true };
  }
  return { playerId, grade: truth, missedRisk: false };
}

// ── Prospect discovery — REAL players only (Principle 2) ─────────────────────

/**
 * Real, scoutable young prospects visible to a scouting club — curated players
 * only. Procedural filler is anonymous depth and never surfaces here (Principle
 * 2). Generational talents enter the database at 16 and reliably appear in the
 * 16–18 band; scouting reach affects precision, not visibility.
 */
export function listScoutableProspects(state: GameState, scoutClubId: ClubId): PlayerId[] {
  const year = Number(state.clock.date.slice(0, 4));
  const out: PlayerId[] = [];
  for (const player of Object.values(state.players)) {
    if (isProcedural(player)) continue; // real players only
    const age = year - player.birthYear;
    if (age < 16 || age > 18) continue; // the emergence band
    if (player.club === scoutClubId) continue; // your own already-known
    out.push(player.id);
  }
  return out;
}
