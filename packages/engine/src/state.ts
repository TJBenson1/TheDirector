/**
 * GameState lifecycle: create, clone, save, load, hash (§1 rule #1, §18).
 */

import type {
  ClubState,
  DifficultySettings,
  GameState,
  ScenarioId,
} from './types.js';
import { GAME_VERSION } from './types.js';
import { Rng } from './rng.js';
import { hashValue } from './hash.js';
import { logEvent } from './eventLog.js';
import { seasonMonthIndex, windowForMonthIndex } from './clock.js';
import { getScenario, DEFAULT_SCENARIO_ID } from './scenarios.js';

/** Calibrated defaults (§13): 1 = the §12 realism bands. */
export const DEFAULT_SETTINGS: DifficultySettings = {
  injuryFrequency: 1,
  scandalFrequency: 1,
  rivalAggression: 1,
  worldDefiance: 1,
  starTemptation: 1,
  varianceLuck: 1,
  scoutingFog: 1,
  ironman: false,
  narration: true,
};

export interface NewGameOptions {
  scenarioId?: ScenarioId;
  settings?: Partial<DifficultySettings>;
  seed?: string;
}

/**
 * Build a fresh GameState for a scenario. Deterministic given `seed`; if no
 * seed is supplied one is derived from the scenario id (still deterministic —
 * pass an explicit seed for variety).
 */
export function createNewGame(options: NewGameOptions = {}): GameState {
  const scenarioId = options.scenarioId ?? DEFAULT_SCENARIO_ID;
  const scenario = getScenario(scenarioId);
  const seed = options.seed ?? `${scenarioId}:default`;
  const settings: DifficultySettings = { ...DEFAULT_SETTINGS, ...options.settings };

  const rng = Rng.fromSeed(seed);

  const clubs: Record<string, ClubState> = {};
  for (const clubSeed of scenario.clubs) {
    clubs[clubSeed.id] = {
      id: clubSeed.id,
      name: clubSeed.name,
      prestige: clubSeed.prestige,
      squad: [],
    };
  }

  const monthIndex = seasonMonthIndex(scenario.startDate);

  const state: GameState = {
    meta: {
      seed,
      scenarioId,
      version: GAME_VERSION,
      ironman: settings.ironman,
      rngState: rng.state,
      nextSeq: 0,
    },
    clock: {
      date: scenario.startDate,
      window: windowForMonthIndex(monthIndex),
      monthIndex,
    },
    settings,
    playerClub: scenario.playerClub,
    clubs,
    players: {},
    managerRelations: { identity: 'Unassigned', relationshipWithUser: 50 },
    timeline: { divergenceLog: [], narrativeMemory: [] },
    pendingDecisions: [],
    eventLog: [],
    board: { mandate: scenario.mandate, patience: scenario.boardPatience },
  };

  logEvent(state, {
    category: 'system',
    code: 'game.created',
    message: `New game: ${scenario.name}`,
    data: { scenarioId, seed, startDate: scenario.startDate },
  });

  return state;
}

/** Deep, structured clone. Engine transitions clone at their boundary so the
 *  external contract stays pure while internals mutate a draft freely. */
export function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

/** Serialise to a save string. */
export function saveGame(state: GameState): string {
  return JSON.stringify(state);
}

/** Restore from a save string, with a version guard. */
export function loadGame(json: string): GameState {
  const state = JSON.parse(json) as GameState;
  if (!state?.meta?.version) {
    throw new Error('loadGame: not a valid GameState (missing meta.version)');
  }
  return state;
}

/** Stable fingerprint of an entire game (determinism gate, §18). */
export function hashState(state: GameState): string {
  return hashValue(state);
}
