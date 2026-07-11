/**
 * The single source of truth (§2). Save/load = serialise this object; Lovable
 * renders directly from it.
 *
 * M1 defines the full top-level container so every later milestone has a
 * stable home to grow into. Subsystems owned by later milestones (players,
 * managers, narrative memory, board finances) are intentionally thin here and
 * carry a TODO marking the milestone that fleshes them out — we define the
 * shape, we do not pre-build the systems.
 */

// ── Identifier & primitive aliases ──────────────────────────────────────────

export type ClubId = string;
export type PlayerId = string;
export type ScenarioId = string;

/** Calendar month as `YYYY-MM` (e.g. "1999-07"). Kept as a string so it is a
 *  plain JSON value with no Date/timezone surprises in a deterministic engine. */
export type YearMonth = string;

export type SeasonWindow = 'summer' | 'winter' | null;

// ── Difficulty (§13) ─────────────────────────────────────────────────────────

/** Sliders (§13). Defaults reproduce the §12 calibration bands; softer values
 *  are an explicit opt-out of realism. 0..2 where 1 = calibrated default. */
export interface DifficultySettings {
  injuryFrequency: number;
  scandalFrequency: number;
  rivalAggression: number;
  worldDefiance: number; // rubber-band
  starTemptation: number;
  varianceLuck: number;
  scoutingFog: number;
  ironman: boolean;
  narration: boolean;
}

// ── Clubs ────────────────────────────────────────────────────────────────────

/** M1: identity + the strength/finance handles later milestones lean on.
 *  Squad-strength maths and finances land in M2/M3. */
export interface ClubState {
  id: ClubId;
  name: string;
  /** Reputation/pull, 1–100. Drives budgets (§11) and transfer willingness (§6). */
  prestige: number;
  /** Squad = player ids. Populated properly in M3; may be empty at M1. */
  squad: PlayerId[];
  /** TODO(M2): league standing, form. TODO(M3): budgets, wage bill, ownership. */
}

// ── Players ──────────────────────────────────────────────────────────────────

/** M1: id + name only. The curated PlayerRecord (§4) with hidden
 *  ability/potential/personality lands in M3; player *state* (happiness,
 *  fitness, form) lands in M4. */
export interface PlayerState {
  id: PlayerId;
  name: string;
  club: ClubId | null;
  /** TODO(M3): ability, potentialCeiling, personality, contract, wage, resistance. */
  /** TODO(M4): happiness, fitness, form, injury. */
}

// ── Later-milestone placeholders (shape only) ────────────────────────────────

/** TODO(M8): manager as an agent. */
export interface ManagerState {
  identity: string;
  relationshipWithUser: number;
}

export interface DivergenceEntry {
  date: YearMonth;
  kind: string;
  detail: string;
}

export interface MemoryEntry {
  date: YearMonth;
  tag: string;
  detail: string;
}

/** TODO(M7): a surfaced decision (event choice / interrupt). Shape is stable so
 *  the API contract (§16) and Lovable can bind to it from M1. */
export interface Decision {
  id: string;
  title: string;
  description: string;
  interrupt: boolean;
  choices: DecisionChoice[];
}

export interface DecisionChoice {
  id: string;
  label: string;
  /** Framed risk shown to the user (§16 view 2). 0..1, optional pre-M7. */
  successProbability?: number;
}

/** TODO(M9/M11): board mandate, patience, finances. */
export interface BoardState {
  mandate: string;
  patience: number;
}

// ── Event log (append-only audit trail) ──────────────────────────────────────

export type LoggedEventCategory =
  | 'clock'
  | 'match'
  | 'transfer'
  | 'injury'
  | 'scandal'
  | 'event'
  | 'decision'
  | 'development'
  | 'system';

/**
 * One entry in the append-only audit trail (§1 rule #2). Every roll that
 * matters records cause, inputs and outcome so a save can be replayed,
 * debugged, or re-run with "same decisions, different luck".
 */
export interface LoggedEvent {
  seq: number; // monotonic within a game
  date: YearMonth;
  category: LoggedEventCategory;
  code: string; // machine-readable event code, e.g. "month.advanced"
  message: string; // human-readable summary
  data?: Record<string, unknown>; // cause/inputs/outcome payload
}

// ── The root ─────────────────────────────────────────────────────────────────

export interface GameStateMeta {
  seed: string;
  scenarioId: ScenarioId;
  version: string;
  ironman: boolean;
  /** Serialised RNG state (§1 rule #2). Persisting this is what makes save →
   *  load → advance bit-identical to an uninterrupted run. */
  rngState: number;
  /** Next sequence number for the event log. */
  nextSeq: number;
}

export interface GameClock {
  date: YearMonth;
  window: SeasonWindow;
  /** 0..11 month within the *season* (season starts in July → index 0). */
  monthIndex: number;
}

export interface GameState {
  meta: GameStateMeta;
  clock: GameClock;
  settings: DifficultySettings;
  playerClub: ClubId;
  clubs: Record<ClubId, ClubState>;
  players: Record<PlayerId, PlayerState>;
  managerRelations: ManagerState;
  timeline: {
    divergenceLog: DivergenceEntry[];
    narrativeMemory: MemoryEntry[];
  };
  pendingDecisions: Decision[];
  eventLog: LoggedEvent[];
  board: BoardState;
}

/** The current schema version. Bump on breaking GameState changes. */
export const GAME_VERSION = '1.0.0-m1';
