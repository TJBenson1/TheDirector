/**
 * Reality-default contracts (see docs/DESIGN-reality-default.md).
 *
 * TYPE SEAMS ONLY at this stage — the data is populated per era pack when the
 * Rival AI (M8) and academy (M9) land. Defined now so those milestones build
 * against a fixed contract rather than inventing an incompatible one.
 *
 * Principle 1: AI clubs execute their REAL transfers by default; autonomous
 * decision-making fires only when a ledger entry is invalidated, and every
 * butterfly is a traceable chain logged to `timeline.divergenceLog`.
 *
 * Principle 2: academy intakes and scoutable prospects are REAL players only;
 * procedural players (`curated === false`) are anonymous depth, excluded from
 * scouting, academy and narrative.
 */

import type { ClubId, PlayerId, YearMonth } from './types.js';

/** One real historical transfer among tracked clubs. */
export interface RealTransferLedgerEntry {
  /** Curated player id (real player). */
  playerId: PlayerId;
  from: ClubId | null; // null = academy graduation / free arrival
  to: ClubId;
  /** The real window this happened in. */
  window: YearMonth;
  fee: number;
}

/** Which tier satisfied an invalidated ledger entry (recorded for audit). */
export type FallbackTier = 'real-backup' | 'profile-similar' | 'generic-needs';

/** Why a ledger entry could not execute as in reality. */
export type InvalidationCause =
  | 'user-signed-target'
  | 'user-owns-seller-player'
  | 'chain-broken-by-user'
  | 'upstream-butterfly';

/** A real youth graduate surfaced into a club's academy at 17–18. */
export interface AcademyIntake {
  clubId: ClubId;
  year: number;
  /** Curated player id (real graduate). */
  playerId: PlayerId;
}

/** Per-era reality data. Empty until era packs populate it (M8/M9). */
export interface EraRealityPack {
  realTransferLedger: RealTransferLedgerEntry[];
  academyIntakes: AcademyIntake[];
}

/** Registry keyed by era pack id. Deliberately empty at M4. */
export const ERA_REALITY: Record<string, EraRealityPack> = {
  'era-1995-2005': { realTransferLedger: [], academyIntakes: [] },
};

/**
 * Pressure state driving ambition overrides (Amendment A). Higher = more likely
 * to deviate from the real ledger with an ambitious, logged, plausibility-gated
 * move. Wired into ClubState and the Rival AI in M8.
 */
export interface ClubPressure {
  /** Seasons without a trophy relative to expectation. */
  trophyDrought: number;
  /** Manager job security, 0 (about to be sacked) – 100. */
  jobSecurity: number;
  /** Fan/board unrest, 0 (content) – 100. */
  unrest: number;
  /** A rival's perceived dominance, 0 – 100. */
  rivalDominance: number;
  /** Recent financial windfall available for a statement signing, 0 – 100. */
  windfall: number;
}

/** An ambition override: a pressure-driven deviation from the real ledger. */
export interface AmbitionOverride {
  clubId: ClubId;
  targetPlayerId: PlayerId;
  /** Which pressure component crossed threshold. */
  cause: keyof ClubPressure;
  window: YearMonth;
}

/**
 * A procedural player is anonymous depth (Principle 2): NEVER a scoutable
 * prospect, academy intake, or narrative subject. Real players are `curated`.
 */
export function isProcedural(player: { curated: boolean }): boolean {
  return player.curated === false;
}
