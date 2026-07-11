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

export type OwnershipModel = 'debt' | 'sustainable' | 'sugar-daddy';

/** Club finances (§11). Fees/wages are in whole currency units (£). */
export interface ClubFinances {
  /** Ownership shapes budgets and FFP exposure (§11). */
  ownership: OwnershipModel;
  /** Transfer kitty available to spend this season. */
  transferBudget: number;
  /** Annual wage ceiling. */
  wageBudget: number;
  /** Current committed annual wages (Σ squad wages). */
  wageBill: number;
}

/** M1: identity. M2: abstracted strength + form + league. M3: squad-derived
 *  strength (anchored to the M2 baseline) + finances. */
export interface ClubState {
  id: ClubId;
  name: string;
  /** Reputation/pull, 1–100. Drives budgets (§11) and transfer willingness (§6). */
  prestige: number;
  /** Squad = player ids. Built in M3 (curated + procedural filler). */
  squad: PlayerId[];
  /**
   * Live squad strength, ~40–95 (§15: weighted XI + depth). Used by the season
   * sim. Derived from the squad but anchored so it equals `baseStrength` at
   * kickoff (preserving M2 calibration), then moves as the squad changes.
   */
  strength: number;
  /** The authored/target strength the squad is anchored to (M2 baseline). */
  baseStrength: number;
  /** Raw squad-strength of the initial squad; the anchor for `strength`. */
  squadStrengthAnchor: number;
  /** Rolling form modifier, roughly -6..+6, drifting toward 0. */
  form: number;
  /** The simulated league this club plays in, or null if not simulated yet. */
  leagueId: string | null;
  finances: ClubFinances;
}

// ── Leagues & season sim (§15) ───────────────────────────────────────────────

/** A club's running record within the current league season. */
export interface TeamRecord {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface TitleEntry {
  seasonYear: number; // the opening calendar year (1999 = the 1999–2000 season)
  championId: ClubId;
  points: number;
}

/** A simulated league and its live season. Standings reset each season; the
 *  schedule is regenerated deterministically (not stored) so saves stay lean. */
export interface LeagueState {
  id: string;
  name: string;
  clubIds: ClubId[];
  /** Opening year of the season currently in progress. */
  seasonYear: number;
  standings: Record<ClubId, TeamRecord>;
  /** Rounds of the double round-robin completed so far this season. */
  roundsPlayed: number;
  /** Champions, most recent last. Feeds the §12 dynasty target and §16 timeline. */
  titleHistory: TitleEntry[];
}

// ── Players ──────────────────────────────────────────────────────────────────

export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'DM' | 'CM' | 'AM' | 'LW' | 'RW' | 'ST';

/** Personality traits, 1–10 each (§4). Hidden from the user; partially
 *  revealed pre-signing via interviews/references (§7). */
export interface Personality {
  professionalism: number;
  ego: number;
  ambition: number;
  loyalty: number;
  volatility: number;
  adaptability: number;
}

/**
 * A player (§4). Fields marked HIDDEN are never shown to the user directly —
 * only via scouting ranges and medical grades (§7). M3 establishes the record
 * and the market; M4 adds live *state* (happiness, fitness, form, injury); M5
 * adds contextual development; M6 adds transfer resistance.
 */
export interface PlayerState {
  id: PlayerId;
  name: string;
  birthYear: number;
  nationality: string;
  positions: Position[];
  club: ClubId | null;
  contractUntil: number; // calendar year the contract expires
  wage: number; // annual

  // HIDDEN (§7) — revealed only via scouting/medicals:
  ability: number; // current, 1–100
  potentialCeiling: number; // max under ideal development (§5)
  personality: Personality;
  injuryProneness: number; // 1–100 baseline, history-modified (M4)

  /** True for hand-authored real players; false for procedural filler. */
  curated: boolean;

  // TODO(M4): happiness, fitness, form, injury, minutes.
  // TODO(M6): transferResistance (ResistanceProfile).
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
  leagues: Record<string, LeagueState>;
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
