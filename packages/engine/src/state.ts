/**
 * GameState lifecycle: create, clone, save, load, hash (§1 rule #1, §18).
 */

import type {
  ClubState,
  ClubTier,
  DifficultySettings,
  GameState,
  LeagueState,
  OwnershipModel,
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
  clubAnchorRaw,
  recomputeClubStrength,
  computeWageBill,
  buildResistance,
  instantiateCuratedSeed,
} from './players.js';
import { initialFinances, suggestWage, inflationFactor } from './finance.js';
import { CURATED_SQUADS } from './data/curated-1999.js';
import { coachForScenario } from './coaches.js';
import { ERA_REALITY, eraForScenario } from './ledger.js';

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
      reviewedWindows: [],
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
    managerRelations: coachForScenario(scenarioId, parseYearMonth(scenario.startDate).year),
    timeline: { divergenceLog: [], narrativeMemory: [] },
    pendingDecisions: [],
    eventLog: [],
    board: {
      mandate: scenario.mandate,
      patience: scenario.boardPatience,
      expectedFinish: scenario.boardExpectedFinish,
      warnings: 0,
      consecutiveMisses: 0,
      dismissed: false,
    },
    worldDefiance: 0,
    userAggression: 0,
    pursuit: {},
  };

  // Build squads (curated where available + procedural filler), anchor each
  // club's strength to its M2 baseline, and set finances (§4, §11).
  populateSquads(state, scenarioId, parseYearMonth(scenario.startDate).year, rng.fork('squads'));

  // Explicit starting war chest, where a scenario models money the prestige-derived
  // kitty can't (a fresh takeover: 2009 City's owners had the cash but not yet the
  // reputation). Set AFTER populateSquads so it overrides the derived transferBudget.
  for (const [id, budget] of Object.entries(scenario.startingBudget ?? {})) {
    const club = state.clubs[id];
    if (club && budget != null) club.finances.transferBudget = budget;
  }

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
 * scenario provides them; squad depth below the named spine is modelled
 * abstractly in the strength calc, never as procedural filler (§4, no regens).
 */
function populateSquads(state: GameState, scenarioId: ScenarioId, year: number, rng: Rng): void {
  const curatedForScenario = CURATED_SQUADS[scenarioId] ?? {};

  // Pass 1 — place every club's curated spine (real squads at real clubs).
  // REAL PLAYERS ONLY: squad depth below the named spine is modelled abstractly in
  // the strength calc (clubDepthPad), never as procedural filler (§4, no regens);
  // real next-gen players arrive over the save via authored academyIntakes.
  for (const club of Object.values(state.clubs)) {
    const clubRng = rng.fork(`squad:${club.id}`);
    const seeds = curatedForScenario[club.id] ?? [];
    for (const seed of seeds) {
      const player = instantiateCuratedSeed(seed, year, clubRng);
      state.players[player.id] = player;
      club.squad.push(player.id);
    }
  }

  // Pass 1.5 — LIVE OPENING WINDOW (M12C, generalised to every era). Any real move
  // due in the scenario's opening summer whose subject is currently baked at his
  // DESTINATION is rewound to his SELLING club, so the move becomes a live,
  // interceptable decision rather than a fait accompli — bringing every era up to
  // the man-utd-1999 standard. A player already at his selling club (man-utd-1999's
  // own opening movers) is a no-op, so calibration is untouched. Runs before the
  // anchors so each club's baseline reflects its true pre-window squad.
  rewindOpeningWindow(state);

  // Pass 2 — anchor each club's live strength to its pre-window baseline (abstract
  // depth padding makes a thin real spine a coherent XI at its level), then float;
  // and derive finances from prestige, era and wage bill.
  for (const club of Object.values(state.clubs)) {
    club.squadStrengthAnchor = clubAnchorRaw(state, club.id);
    recomputeClubStrength(state, club.id);
    const wageBill = computeWageBill(state, club.id);
    club.finances = initialFinances(club.prestige, year, club.finances.ownership, wageBill);
    // The USER's opening transfer budget is grounded in what his club REALLY did that
    // summer — its net spend (buys − sales) scaled by financial strength — not a
    // prestige guess. So he can complete the real business provided he makes the real
    // sales, with a surplus that reflects the club's financial muscle (§ budget model).
    if (club.id === state.playerClub) {
      club.finances.transferBudget = openingTransferBudget(state, club.finances.ownership, year);
    }
  }
}

/** Financial-strength multiplier on the club's real NET transfer spend — how far
 *  past merely matching history the board backs the Director. A sugar-daddy owner
 *  goes well beyond it; a debt/stadium-constrained club can only balance the books. */
const NET_SPEND_MULT: Record<OwnershipModel, number> = {
  'sugar-daddy': 1.5,
  sustainable: 1.2,
  debt: 1.0,
};

/**
 * The Director's opening transfer budget: his club's REAL net spend that summer
 * (buys − sales, straight from the reality ledger) scaled by financial strength, and
 * floored so a quiet or net-selling window still leaves something to work with. This
 * makes the war chest self-derived and honest — sell to buy, with surplus by financial
 * muscle — so no scenario needs a hand-tuned figure. Real sales resolve before real
 * buys in the window (resolvePendingLedgerDecisions), so reality-default still
 * reproduces history: the summer's sales fund the summer's buys.
 */
function openingTransferBudget(state: GameState, ownership: OwnershipModel, year: number): number {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  let buys = 0;
  let sales = 0;
  if (pack) {
    for (const e of pack.realTransferLedger) {
      const wy = Number(e.window.slice(0, 4));
      const wm = Number(e.window.slice(5, 7));
      if (wy !== year || wm < 6 || wm > 9) continue; // the opening SUMMER window only
      if (e.to === state.playerClub) buys += e.fee ?? 0;
      else if (e.from === state.playerClub) sales += e.fee ?? 0;
    }
  }
  const net = buys - sales;
  const mult = NET_SPEND_MULT[ownership] ?? NET_SPEND_MULT.sustainable;
  const floor = Math.round(2_500_000 * inflationFactor(year)); // a base for quiet windows
  return Math.max(floor, Math.round(net * mult));
}

/**
 * Rewind the opening summer: seed each of the window's real movers at his SELLING
 * club so his transfer is a live decision the Director can complete, intercept or
 * divert (the man-utd-1999 pattern, applied everywhere). Only a player currently at
 * his real DESTINATION is moved (a pre-window pack that already seeds him at the
 * selling club is left exactly as authored — hence a no-op for man-utd-1999). The
 * selling club must exist in this world; academy/free arrivals (no `from`) are
 * skipped. Pure relocation — no RNG, no finances — so it cannot perturb determinism.
 */
function rewindOpeningWindow(state: GameState): void {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return;
  const openYear = Number(state.clock.date.slice(0, 4));
  for (const e of pack.realTransferLedger) {
    const wy = Number(e.window.slice(0, 4));
    const wm = Number(e.window.slice(5, 7));
    if (wy !== openYear || wm < 6 || wm > 9) continue; // only the opening summer
    if (!e.from) continue; // academy / free arrival — nothing to rewind
    const player = state.players[e.playerId];
    if (!player || player.club !== e.to) continue; // only a destination-baked subject
    const fromClub = state.clubs[e.from];
    const toClub = state.clubs[e.to];
    if (!fromClub || !toClub) continue; // selling club must exist in the world
    toClub.squad = toClub.squad.filter((id) => id !== player.id);
    fromClub.squad.push(player.id);
    player.club = e.from;
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
