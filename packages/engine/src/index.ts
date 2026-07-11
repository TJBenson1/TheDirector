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
  SEASON_START_CALENDAR_MONTH,
  SUMMER_WINDOW_MONTH_INDEX,
  WINTER_WINDOW_MONTH_INDEX,
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
export { advanceWindow, type AdvanceResult } from './advance.js';
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
  suggestWage,
  initialFinances,
} from './finance.js';
export {
  generatePlayer,
  generateSquad,
  deriveRawStrength,
  recomputeClubStrength,
  clubSquadPlayers,
  computeWageBill,
  type GeneratePlayerOptions,
} from './players.js';
export {
  executeTransfer,
  affordableTargets,
  squadSize,
  currentYear,
  type TransferRequest,
  type TransferResult,
} from './transfers.js';
export { CURATED_SQUADS, MAN_UTD_1999, type CuratedSeed } from './data/curated-1999.js';
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
