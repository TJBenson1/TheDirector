import { describe, it, expect } from 'vitest';
import * as engine from './index.js';
import { createNewGame } from './state.js';

/**
 * The front-end contract (docs/LOVABLE.md). The Lovable front end binds to these
 * exports and to these top-level `GameState` keys; removing or renaming one is a
 * breaking change the UI can't compile against. This test fails BEFORE publish so
 * the engine and front end never drift silently apart. Adding to the surface is
 * fine — this guards removals/renames, not additions.
 */
describe('public API contract (front-end handoff)', () => {
  const REQUIRED_EXPORTS = [
    // core loop
    'createNewGame', 'advanceWindow', 'applyDecision',
    // persistence / determinism
    'saveGame', 'loadGame', 'cloneState', 'hashState',
    // scenarios
    'SCENARIOS', 'getScenario', 'DEFAULT_SCENARIO_ID',
    // fog of war (§7) — the UI must render revealed ranges, never raw truth
    'scoutPlayer', 'medicalCheck',
    // transfer/market helpers the views use
    'suggestTargets', 'queryPlayer', 'resolvePlayer', 'acquisitionTags', 'askingPrice',
    // world reference data
    'LEAGUES',
  ] as const;

  const REQUIRED_STATE_KEYS = [
    'meta', 'clock', 'settings', 'playerClub', 'clubs', 'leagues', 'players',
    'managerRelations', 'timeline', 'pendingDecisions', 'eventLog', 'board',
    'worldDefiance', 'userAggression', 'pursuit',
  ] as const;

  it('exposes every front-end-critical export', () => {
    for (const name of REQUIRED_EXPORTS) {
      expect(engine[name as keyof typeof engine], `missing export: ${name}`).toBeDefined();
    }
  });

  it('GameState keeps its top-level shape and round-trips through save/load', () => {
    const state = createNewGame({ scenarioId: engine.DEFAULT_SCENARIO_ID });
    for (const key of REQUIRED_STATE_KEYS) {
      expect(state, `GameState missing key: ${key}`).toHaveProperty(key);
    }
    expect(state.meta.version, 'save format must be versioned').toBeTruthy();
    // The serialisation boundary the UI relies on: JSON out, GameState back, no throw.
    const reloaded = engine.loadGame(engine.saveGame(state));
    expect(reloaded.meta.version).toBe(state.meta.version);
    expect(engine.hashState(reloaded)).toBe(engine.hashState(state));
  });
});
