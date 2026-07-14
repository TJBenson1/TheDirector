/**
 * @director/engine — pure, deterministic game engine (§1).
 *
 * Public surface for the API layer, the harness, and tests. Everything here is
 * a pure function over a serialisable `GameState`; there is no I/O, no clock,
 * and no randomness outside the seeded RNG.
 */

export * from './types.js';
export { Rng, hashStringToU32, clamp01 } from './rng.js';
export { logEvent, eventsSince } from './eventLog.js';
export {
  parseYearMonth,
  formatYearMonth,
  nextMonth,
  seasonMonthIndex,
  windowForMonthIndex,
  isRunInMonth,
  advanceOneMonth,
  windowStepLabel,
  SEASON_START_CALENDAR_MONTH,
  SUMMER_WINDOW_MONTH_INDEX,
  WINTER_WINDOW_MONTH_INDEX,
  WINDOW_STEPS,
} from './clock.js';
export {
  createNewGame,
  cloneState,
  saveGame,
  loadGame,
  hashState,
  DEFAULT_SETTINGS,
  type NewGameOptions,
} from './state.js';
export { advanceWindow, type AdvanceResult, type AdvanceOptions } from './advance.js';
export { stableStringify, hashString, hashValue } from './hash.js';
export {
  SCENARIOS,
  DEFAULT_SCENARIO_ID,
  getScenario,
  type ScenarioSeed,
  type ClubSeed,
} from './scenarios.js';
export {
  LEAGUES,
  ENGLAND_1999,
  SECOND_TIER,
  SECOND_TIER_CLUB,
  type LeagueSeed,
  type LeagueClubSeed,
} from './leagues.js';
export {
  inflationFactor,
  valuePlayer,
  outputFactor,
  suggestWage,
  initialFinances,
} from './finance.js';
export {
  LEAGUE_STYLES,
  styleForClub,
  styleKeyForClub,
  styleDistance,
  styleSuitability,
  type LeagueStyle,
} from './leaguestyle.js';
export {
  effectiveAbility,
  rollAdaptation,
  resolveAdaptationSeason,
} from './adaptation.js';
export { computeSeasonStats, computePlayerSeason } from './stats.js';
export {
  generatePlayer,
  generateSquad,
  deriveRawStrength,
  recomputeClubStrength,
  clubSquadPlayers,
  availableSquadPlayers,
  isAvailable,
  computeWageBill,
  type GeneratePlayerOptions,
} from './players.js';
export {
  processInjuriesMonth,
  fireRealInjuries,
  injuredCount,
  significantInjuredCount,
} from './injuries.js';
export { rollInjuryManagement } from './injuryManagement.js';
export { processSeasonAgeing, processSeasonMorale } from './ageing.js';
export {
  processSeasonDevelopment,
  processAcademyGraduates,
  estimateMinutesShare,
  applyPrematureMove,
} from './development.js';
export {
  scoutPlayer,
  medicalCheck,
  listScoutableProspects,
  type ScoutReport,
  type ScoutConfidence,
  type Range,
  type ScoutOptions,
  type MedicalResult,
  type MedicalGrade,
} from './scouting.js';
export {
  executeTransfer,
  attemptSigning,
  affordableTargets,
  squadSize,
  currentYear,
  type TransferRequest,
  type TransferResult,
  type SigningResult,
} from './transfers.js';
export {
  evaluateApproach,
  wouldAcceptMove,
  areRivals,
  WILLINGNESS_THRESHOLD,
  type ApproachInput,
  type ApproachVerdict,
} from './agency.js';
export { buildResistance } from './players.js';
export {
  applyDecision,
  applyConsequence,
  rollEventsMonth,
  resolveIgnoredDecisions,
  type DecisionResult,
} from './events.js';
export { runRivalWindow, updateWorldDefiance } from './rival.js';
export { reviewBoard, rollInternalCrisis } from './board.js';
export { divergenceFactor, rollDivergentStoryline } from './divergence.js';
export { appendMemory, memoriesWithTag } from './memory.js';
export { CURATED_SQUADS, MAN_UTD_1999, type CuratedSeed } from './data/curated-1999.js';
export {
  ERA_REALITY,
  eraForScenario,
  isProcedural,
  type RealTransferLedgerEntry,
  type AcademyIntake,
  type EraRealityPack,
  type FallbackTier,
  type InvalidationCause,
  type ClubPressure,
  type AmbitionOverride,
} from './ledger.js';
export { executeLedgerWindow, stepForEntry, ledgerSquadMatch, ledgerClubs } from './ledgerExec.js';
export {
  suggestTargets,
  queryPlayer,
  acquisitionTags,
  askingPrice,
  resolvePlayer,
  type TargetSuggestion,
  type PlayerQuery,
  type AcquisitionTag,
  type SuggestOptions,
} from './recommend.js';
export { courtPlayer, decayPursuit, poleSuitorFor } from './wooing.js';
export {
  initialManager,
  reviewManager,
  reviewDirectorStrategy,
  directorSackManager,
  performSack,
  managerShortlist,
  courtManager,
  appointManager,
  willManagerJoin,
  issueDirective,
  coachResistanceChance,
  imposeDirective,
  revokeDirective,
  applyDirectiveEffects,
  managerStrengthMod,
  managerDevMod,
} from './manager.js';
export {
  simulateMatch,
  generateSchedule,
  standingsOrder,
  initLeagueSeason,
  finalizeSeason,
  stepLeagueMonth,
  maxConsecutiveTitles,
  applyPromotionRelegation,
  emptyRecord,
  type MatchResult,
} from './season.js';
