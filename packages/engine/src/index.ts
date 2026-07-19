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
export { LEAGUES, ENGLAND_1999, type LeagueSeed, type LeagueClubSeed } from './leagues.js';
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
export { computeSeasonStats, computePlayerSeason, liveRoleEstimate } from './stats.js';
export {
  deriveRawStrength,
  recomputeClubStrength,
  clubAnchorRaw,
  clubDepthPad,
  clubSquadPlayers,
  availableSquadPlayers,
  isAvailable,
  computeWageBill,
  type DepthPad,
} from './players.js';
export {
  processInjuriesMonth,
  fireRealInjuries,
  injuredCount,
  significantInjuredCount,
} from './injuries.js';
export { processSeasonAgeing, processSeasonMorale, processRetirementsAndYouth } from './ageing.js';
export {
  processSeasonDevelopment,
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
  areDirectRivals,
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
export { simulateChampionsLeague } from './champions.js';
export { relegateClub, restoreRelegatedClubs } from './relegation.js';
export { resolveParmalat, resolveCalciopoli } from './italyEvents.js';
export { reviewBoard, rollInternalCrisis, boardRuthlessness } from './board.js';
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
export { executeLedgerWindow, executeAcademyIntakes, stepForEntry, ledgerSquadMatch, ledgerClubs } from './ledgerExec.js';
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
  simulateMatch,
  generateSchedule,
  standingsOrder,
  initLeagueSeason,
  finalizeSeason,
  stepLeagueMonth,
  maxConsecutiveTitles,
  emptyRecord,
  type MatchResult,
} from './season.js';
export {
  coachForScenario,
  coachFit,
  resolveCoachFriction,
  playerStyleProfile,
  type CoachFit,
  type FitVerdict,
} from './coaches.js';
export {
  formationLabel,
  formationEraModifier,
  eraIdealFormation,
  ALL_FORMATIONS,
} from './tactics.js';
export { narrativeContext, type NarrativeContext } from './narrative.js';
export {
  coachBriefing,
  type CoachBriefing,
  type BriefingXI,
  type BriefingTarget,
} from './briefing.js';
