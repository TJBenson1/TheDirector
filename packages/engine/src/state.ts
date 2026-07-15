/**
 * GameState lifecycle: create, clone, save, load, hash (§1 rule #1, §18).
 */

import type {
  ClubState,
  ClubTier,
  DifficultySettings,
  GameState,
  LeagueState,
  PlayerState,
  ScenarioId,
} from './types.js';
import { GAME_VERSION } from './types.js';
import { Rng } from './rng.js';
import { hashValue } from './hash.js';
import { logEvent } from './eventLog.js';
import { seasonMonthIndex, windowForMonthIndex, parseYearMonth } from './clock.js';
import { getScenario, DEFAULT_SCENARIO_ID } from './scenarios.js';
import { LEAGUES } from './leagues.js';
import { initLeagueSeason } from './season.js';
import {
  generateSquad,
  deriveRawStrength,
  recomputeClubStrength,
  clubSquadPlayers,
  computeWageBill,
  buildResistance,
} from './players.js';
import { initialFinances, suggestWage } from './finance.js';
import { CURATED_SQUADS } from './data/curated-1999.js';

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

/** Placeholder strength for context-only clubs whose league isn't simulated
 *  yet. M3 replaces this with squad-derived strength. */
function prestigeToStrength(prestige: number): number {
  return prestige;
}

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

  const league = LEAGUES[scenario.domesticLeagueId];
  if (!league) throw new Error(`Unknown league "${scenario.domesticLeagueId}"`);

  // Club universe = cross-European context clubs + the simulated league's
  // clubs. League clubs carry authored strength and a leagueId; context-only
  // clubs get a placeholder strength from prestige until their league is
  // simulated (M-later).
  // Tier 1 = the 12 playable clubs (docs/DESIGN-reality-default.md Amendment B).
  // Tier 2 = other simulated (in-league) clubs; Tier 3 = results-level context.
  // The full per-era Tier-2 roster is era-pack data (M8); this is the seed.
  const tier1 = new Set(scenario.clubs.map((c) => c.id));
  const tierFor = (id: string, leagueId: string | null): ClubTier =>
    tier1.has(id) ? 1 : leagueId !== null ? 2 : 3;

  const clubs: Record<string, ClubState> = {};
  const newClub = (
    id: string,
    name: string,
    prestige: number,
    strength: number,
    leagueId: string | null,
  ): ClubState => ({
    id,
    name,
    tier: tierFor(id, leagueId),
    prestige,
    squad: [],
    strength,
    baseStrength: strength,
    squadStrengthAnchor: 0,
    starButterfly: 0,
    chemistryPenalty: 0,
    form: 0,
    leagueId,
    finances: { ownership: 'sustainable', transferBudget: 0, wageBudget: 0, wageBill: 0 },
    pendingCounterPunch: 0,
    grudge: 0,
    financialHealth: 'healthy',
    relegationThreatened: false,
  });
  for (const clubSeed of scenario.clubs) {
    clubs[clubSeed.id] = newClub(
      clubSeed.id,
      clubSeed.name,
      clubSeed.prestige,
      prestigeToStrength(clubSeed.prestige),
      null,
    );
  }
  for (const clubSeed of scenario.contextExtra ?? []) {
    clubs[clubSeed.id] = newClub(
      clubSeed.id,
      clubSeed.name,
      clubSeed.prestige,
      prestigeToStrength(clubSeed.prestige),
      null,
    );
  }
  for (const lc of league.clubs) {
    clubs[lc.id] = newClub(lc.id, lc.name, lc.prestige, lc.strength, league.id);
  }
  // Seed historically-distressed clubs of the era (fire-sale opportunities).
  for (const [id, health] of Object.entries(scenario.distressedClubs ?? {})) {
    const club = clubs[id];
    if (club) club.financialHealth = health;
  }
  // Per-club ownership overrides (budget scale) — sugar-daddy / debt.
  for (const [id, own] of Object.entries(scenario.ownership ?? {})) {
    const club = clubs[id];
    if (club) club.finances.ownership = own;
  }

  const leagueState: LeagueState = {
    id: league.id,
    name: league.name,
    clubIds: league.clubs.map((c) => c.id),
    seasonYear: parseYearMonth(scenario.startDate).year,
    standings: {},
    roundsPlayed: 0,
    titleHistory: [],
  };
  initLeagueSeason(leagueState, leagueState.seasonYear);

  const monthIndex = seasonMonthIndex(scenario.startDate);

  const state: GameState = {
    meta: {
      seed,
      scenarioId,
      version: GAME_VERSION,
      ironman: settings.ironman,
      rngState: rng.state,
      nextSeq: 0,
      firedScripted: [],
      startYear: parseYearMonth(scenario.startDate).year,
      executedLedger: [],
      realizedLedger: [],
      firedRealInjuries: [],
    },
    clock: {
      date: scenario.startDate,
      window: windowForMonthIndex(monthIndex),
      monthIndex,
      // The opening window is LIVE, not pre-closed: the player can veto the real
      // moves their club made that window (decline signing Figo) and hijack other
      // live moves. windowStep 0 = a fresh, unprocessed open window; the first
      // advance unfolds it in place (moves already baked into the curated squad
      // are recognised as reality, not re-offered).
      windowStep: 0,
    },
    settings,
    playerClub: scenario.playerClub,
    clubs,
    leagues: { [leagueState.id]: leagueState },
    players: {},
    managerRelations: { identity: 'Unassigned', relationshipWithUser: 50 },
    timeline: { divergenceLog: [], narrativeMemory: [] },
    pendingDecisions: [],
    eventLog: [],
    board: {
      mandate: scenario.mandate,
      patience: scenario.boardPatience,
      expectedFinish: scenario.boardExpectedFinish,
      warnings: 0,
      dismissed: false,
    },
    worldDefiance: 0,
    userAggression: 0,
    pursuit: {},
  };

  // Build squads (curated where available + procedural filler), anchor each
  // club's strength to its M2 baseline, and set finances (§4, §11).
  populateSquads(state, scenarioId, parseYearMonth(scenario.startDate).year, rng.fork('squads'));

  logEvent(state, {
    category: 'system',
    code: 'game.created',
    message: `New game: ${scenario.name}`,
    data: {
      scenarioId,
      seed,
      startDate: scenario.startDate,
      players: Object.keys(state.players).length,
    },
  });

  return state;
}

/**
 * Fill every club's squad, then anchor its live strength to its authored
 * baseline and derive its finances. Curated real players are used where the
 * scenario provides them; the rest is procedural filler (§4, §9e).
 */
function populateSquads(state: GameState, scenarioId: ScenarioId, year: number, rng: Rng): void {
  const curatedForScenario = CURATED_SQUADS[scenarioId] ?? {};

  const TARGET_SQUAD = 23;

  for (const club of Object.values(state.clubs)) {
    const clubRng = rng.fork(`squad:${club.id}`);
    const seeds = curatedForScenario[club.id] ?? [];

    // Curated marquee real players first (real squads at real clubs).
    for (const seed of seeds) {
      const { hardBlocks, loyalty, ...rest } = seed;
      const age = year - seed.birthYear;
      const player: PlayerState = {
        ...rest,
        positions: [...seed.positions],
        personality: { ...seed.personality },
        birthCeiling: seed.potentialCeiling,
        wage: 0,
        curated: true,
        fitness: 100,
        morale: 78,
        form: 0,
        injury: null,
        injuryHistory: 0,
        wonderkid: seed.potentialCeiling >= 85 && age <= 21,
        benchedDevSeasons: 0,
        reachedPotential: false,
        lastSeason: null,
        seasonMonthsInjured: 0,
        adaptation: null,
        resistance: buildResistance(seed.personality, seed.nationality, age, seed.ability, clubRng),
        agitation: 0,
      };
      if (loyalty !== undefined) player.resistance.clubLoyalty = loyalty;
      if (hardBlocks) player.resistance.hardBlocks = hardBlocks.map((b) => ({ ...b }));
      player.wage = suggestWage(player, year);
      state.players[player.id] = player;
      club.squad.push(player.id);
    }

    // Procedural depth to fill the squad out (anonymous, per Principle 2). Where a
    // real first XI is already curated, the filler is DEPTH only — it must not
    // out-rate the club's own stars (a Gerrard has to stand out from his squad).
    const fillCount = Math.max(0, TARGET_SQUAD - club.squad.length);
    if (fillCount > 0) {
      const firstTeamSlots = seeds.length > 0 ? Math.max(0, 11 - seeds.length) : 14;
      // Anonymous filler must never OUT-RATE the club's own real stars — a Gerrard
      // always leads his squad, not some procedural nobody (§4 ratings spread).
      const starCap = seeds.length > 0 ? Math.max(...seeds.map((s) => s.ability)) - 1 : Infinity;
      const generated = generateSquad(club.id, club.leagueId, club.baseStrength, year, clubRng, firstTeamSlots);
      for (const player of generated.slice(0, fillCount)) {
        if (player.ability > starCap) {
          player.ability = starCap;
          if (player.birthCeiling < player.ability) player.birthCeiling = player.ability;
        }
        state.players[player.id] = player;
        club.squad.push(player.id);
      }
    }

    // Anchor strength so it equals baseStrength now, then let it float later.
    club.squadStrengthAnchor = deriveRawStrength(clubSquadPlayers(state, club.id));
    recomputeClubStrength(state, club.id);

    // Finances from prestige, era and current wage bill.
    const wageBill = computeWageBill(state, club.id);
    club.finances = initialFinances(club.prestige, year, club.finances.ownership, wageBill);
  }
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
