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

/** A club's financial state (internal-friction §6). Distress makes it sell
 *  cheaply and push players out — the fire-sale opportunity (Leeds, Lazio…). */
export type FinancialHealth = 'healthy' | 'strained' | 'crisis';

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
/**
 * Simulation tier (performance only, never narrative — see
 * docs/DESIGN-reality-default.md Amendment B):
 *  1 = playable (full sim), 2 = significant non-playable (full transfer/event/
 *  squad sim, narratively indistinguishable), 3 = results-level only.
 */
export type ClubTier = 1 | 2 | 3;

export interface ClubState {
  id: ClubId;
  name: string;
  tier: ClubTier;
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
  /** Accumulated change in the club's STAR PREMIUM caused by BUTTERFLY (non-
   *  reality) transfers only — the extra weight the CONTINENTAL game gives the
   *  XI's best few (§ butterfly showcase). Reality transfers and ageing never
   *  touch it, so a passive world holds it at 0 and reproduces the real European
   *  Cup winners exactly; a user/rival deviation that guts (or gorges) a spine
   *  moves it, and a different side lifts the trophy. */
  starButterfly: number;
  /** Effective-strength drag from an UNBALANCED, over-stacked squad (§ chemistry):
   *  hoard more stars than the XI can field — especially in one zone — and the
   *  surplus egos rot the dressing room and the shape, so a bloated galáctico side
   *  plays BELOW its raw talent (the post-2003 Madrid / Messi-Mbappé-Neymar PSG
   *  effect). Zero for a balanced squad, so real sides are untouched. */
  chemistryPenalty: number;
  /** Rolling form modifier, roughly -6..+6, drifting toward 0. */
  form: number;
  /** The simulated league this club plays in, or null if not simulated yet. */
  leagueId: string | null;
  finances: ClubFinances;
  /** Windows remaining to counter-punch after being raided (§9a). 0 = settled. */
  pendingCounterPunch: number;
  /** Grudge toward the user after being raided/gazumped (§9a #4). 0..100. */
  grudge: number;
  /** Financial state — distress means a fire-sale (cheaper fees, willing sellers). */
  financialHealth: FinancialHealth;
  /** True the season after finishing in the relegation zone — easy pickings. */
  relegationThreatened: boolean;
  /** If set, the club is OUT of the top flight (and Europe) until this opening
   *  year — a temporary disappearance (Juventus after Calciopoli; a demoted City).
   *  Lower divisions aren't simulated: the club simply steps out of the picture
   *  and returns. Absent/undefined for the overwhelming majority that never drop. */
  relegatedUntil?: number;
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

/** One European Cup / Champions League final result (§ butterfly showcase). */
export interface EuroTitleEntry {
  seasonYear: number;
  winnerId: ClubId;
  runnerUpId: ClubId;
}

/** The continental knockout that runs alongside the domestic leagues. Its winner
 *  is the single sharpest lens on butterfly effects — a squad weakened or
 *  strengthened by the user's moves changes who lifts the European Cup. */
export interface EuropeanCupState {
  name: string;
  titleHistory: EuroTitleEntry[];
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
  potentialCeiling: number; // max under ideal development NOW (§5); erodes if stunted
  birthCeiling: number; // the potential he was born with (immutable; measures "reached potential")
  personality: Personality;
  injuryProneness: number; // 1–100 baseline, history-modified (M4)

  /** True for hand-authored real players; false for procedural filler. */
  curated: boolean;

  // ── M4 live state ─────────────────────────────────────────────
  /** Match sharpness / recovery, 0–100. */
  fitness: number;
  /** Happiness, 0–100 (playing time, success, wages). Full agency in M6. */
  morale: number;
  /** Individual form, -10..+10. Full development weighting in M5. */
  form: number;
  /** Current injury, or null if fit. */
  injury: InjuryState | null;
  /** Count of serious injuries suffered (raises proneness + recurrence risk). */
  injuryHistory: number;

  // ── M5 development (§5) ───────────────────────────────────────
  /** A high-ceiling young talent at generation (potentialCeiling ≥ 85, age ≤ 21). */
  wonderkid: boolean;
  /** Development seasons spent with <40% expected minutes (benched → plateau). */
  benchedDevSeasons: number;
  /** True once ability came within ~2 of the ceiling — "became the player". */
  reachedPotential: boolean;

  // ── M6 context & friction (docs/DESIGN-context-and-friction.md) ──
  /** Actual output from the season just completed (drives dynamic valuation).
   *  null before any season has been played. */
  lastSeason: SeasonStats | null;
  /** Months spent injured in the current season (reset at rollover). */
  seasonMonthsInjured: number;
  /** Active adaptation to a new league/context, or null if settled. */
  adaptation: AdaptationState | null;

  /** Transfer agency (§6) — consulted on any approach. */
  resistance: ResistanceProfile;

  /** Unrest, 0–100. Rises when the user rejects a bid to keep him; sustained
   *  agitation can force a discounted exit (the "kept him but he left anyway"). */
  agitation: number;
}

export type CareerStagePull = 'prove' | 'peak' | 'legacy' | 'payday';

/** A scripted near-absolute block on a move (the Messi rule, §6). */
export interface HardBlock {
  reason: string;
  /** Block holds until at least this calendar year. */
  untilYear?: number;
}

/** Player agency (§6). Consulted on ANY approach; below a willingness threshold
 *  the player says no regardless of fee, and the game says why. */
export interface ResistanceProfile {
  clubLoyalty: number; // 0–100, one-club identity strength
  culturalAnchors: string[]; // language/region/boyhood pulls
  dreamClubs: ClubId[]; // pull factors
  agentInfluence: number; // 0–100
  careerStagePull: CareerStagePull;
  hardBlocks: HardBlock[]; // scripted near-absolute resistance
}

/** A player's actual output over one completed season (§1 dynamic valuation). */
export interface SeasonStats {
  appearances: number;
  goals: number;
  assists: number;
  monthsInjured: number;
  minutesShare: number; // average 0..1
  rating: number; // seasonal, ~4..9
}

export type AdaptationOutcome = 'seamless' | 'slow-burn' | 'partial' | 'failure';

/** Hidden adaptation to a new context (§3 adaptation engine). While unsettled,
 *  `penalty` reduces effective ability; on resolution it either blooms (0) or
 *  leaves a permanent residual cut. */
export interface AdaptationState {
  outcome: AdaptationOutcome;
  /** 0..1 reduction to effective ability while adapting. */
  penalty: number;
  /** Seasons of adaptation remaining before it resolves. */
  seasonsRemaining: number;
  settled: boolean;
}

export type InjuryKind = 'minor' | 'moderate' | 'serious';

/** An active injury (§9c). `serious` covers the 6mo+ ligament class. */
export interface InjuryState {
  kind: InjuryKind;
  monthsRemaining: number;
  /** The month it began, for narrative/log context. */
  since: YearMonth;
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

/** A surfaced decision (event choice / interrupt). Shape is stable so the API
 *  contract (§16) and Lovable can bind to it. The `on*`/`fallout` fields are
 *  engine-internal resolution data (serialised in state); the UI renders
 *  title/description/choices + `successProbability`. */
export interface Decision {
  id: string;
  title: string;
  description: string;
  interrupt: boolean;
  choices: DecisionChoice[];
  /** Consequences if the decision is left unresolved when the window advances. */
  falloutIfIgnored?: Consequence[];
  /** Narrative-memory tags this decision threads into (§10). */
  memoryTags?: string[];
  /** The club this decision concerns (usually the user's). */
  clubId?: ClubId;
  category?: LoggedEventCategory;
}

export interface DecisionChoice {
  id: string;
  label: string;
  /** Framed risk shown to the user (§16 view 2). 0..1. Outcomes are UNCERTAIN —
   *  mediation can fail. Absent ⇒ deterministic (always "succeeds"). */
  successProbability?: number;
  /** Applied on a successful roll. */
  onSuccess?: Consequence[];
  /** Applied on a failed roll. */
  onFailure?: Consequence[];
}

/** A single state effect produced by an event/decision outcome (§9b). */
export interface Consequence {
  kind:
    | 'morale' // player/squad happiness
    | 'money' // club transfer budget
    | 'ability' // player ability delta
    | 'fanTrust' // narrative memory + board patience nudge
    | 'boardPatience'
    | 'ban' // player unavailable for N months (injury-like)
    | 'managerRelationship'
    | 'agitation' // raise a player's unrest
    | 'transferOut' // sell a player to `clubId` for `amount`
    | 'signReal' // sign an incoming real target to the user club (funds + moves)
    | 'memory' // append a narrative-memory entry (§10)
    | 'log'; // purely informational log line
  playerId?: PlayerId;
  clubId?: ClubId;
  amount?: number; // signed delta for numeric kinds
  months?: number; // for 'ban'
  tag?: string; // memory tag
  text?: string; // human-readable detail
}

/** Board mandate, patience and job security (§11, internal-friction §1). */
export interface BoardState {
  mandate: string;
  patience: number; // 0..100; sustained failure erodes it
  /** League position the board expects (1 = title). Missing it costs patience. */
  expectedFinish: number;
  /** Formal warnings issued after poor seasons. */
  warnings: number;
  /** Consecutive seasons finishing below the expected position (reset on a
   *  meet-or-win). Drives the impatient-board escalation — a title-or-bust or
   *  sugar-daddy board (Pérez's Real, Abramovich's Chelsea) won't sit through a
   *  run of near-misses the way a rebuild/project board will. */
  consecutiveMisses: number;
  /** True once the player has been dismissed — the career is over. */
  dismissed: boolean;
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
  /** Scripted events already fired/skipped, so each resolves once (§9b). */
  firedScripted: string[];
  /** The scenario's opening calendar year (for elapsed-time drift, §9f). */
  startYear: number;
  /** Real-ledger entries already processed (executed or fallen back), by
   *  subject playerId, so each resolves once (reality-default). */
  executedLedger: string[];
  /** Subset of `executedLedger` that executed AS REALITY (the real move
   *  happened). A dependent entry (`enabledBy`) only fires if its funder is
   *  here — so a purchase the user pre-empts cancels the sale it would have
   *  funded (e.g. no Bale at Madrid → Özil is never sold). */
  realizedLedger: string[];
  /** Real historical injuries already fired (by subject playerId), so each
   *  scheduled real injury triggers at most once (reality-default). */
  firedRealInjuries: string[];
}

export interface GameClock {
  date: YearMonth;
  window: SeasonWindow;
  /** 0..11 month within the *season* (season starts in July → index 0). */
  monthIndex: number;
  /**
   * Sub-step within an OPEN transfer window (§3 multi-step windows). A window is
   * not a single instant: it unfolds over `WINDOW_STEPS` stages (early business →
   * mid-window → deadline day), with real ledger moves landing at different
   * points and the user acting between them. 0 when no window is open; 1..N while
   * a window is unfolding (N = deadline day, fully processed).
   */
  windowStep: number;
}

export interface GameState {
  meta: GameStateMeta;
  clock: GameClock;
  settings: DifficultySettings;
  playerClub: ClubId;
  clubs: Record<ClubId, ClubState>;
  leagues: Record<string, LeagueState>;
  /** The continental knockout (Champions League / European Cup), or undefined
   *  before it has run once. Winner recorded per season. */
  europeanCup?: EuropeanCupState;
  players: Record<PlayerId, PlayerState>;
  managerRelations: ManagerState;
  timeline: {
    divergenceLog: DivergenceEntry[];
    narrativeMemory: MemoryEntry[];
  };
  pendingDecisions: Decision[];
  eventLog: LoggedEvent[];
  board: BoardState;
  /** Rubber-band metric (§9a #5): rises when the user dominates, raising rival
   *  aggression/fortune. Governed by the worldDefiance slider (0 = sandbox). */
  worldDefiance: number;
  /** How aggressive the user has been (signings + raids). Gates the rival
   *  response layer: a do-nothing user doesn't provoke poaching, so reality (and
   *  scripted history) holds — poaching is a RESPONSE to aggression (§9a). */
  userAggression: number;
  /** Courtship level (0..100) per player the user is pursuing ("speak to his
   *  people"). Sustained pursuit is what lets you prise a spoken-for target off
   *  the club in pole position — a cold late bid won't. Decays each window. */
  pursuit: Record<PlayerId, number>;
}

/** The current schema version. Bump on breaking GameState changes. */
export const GAME_VERSION = '1.0.0-m1';
