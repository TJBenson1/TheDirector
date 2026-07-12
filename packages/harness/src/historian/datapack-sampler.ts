/**
 * Mode 3 — DATA-PACK VALIDATOR (§8). Validate a raw era pack BEFORE the engine
 * consumes it: data errors are the single most likely source of unrealism and
 * the cheapest to fix. We sample the ledger, curated ceilings, resistance
 * profiles/hard blocks and real injuries, and hand each to the Historian with
 * the data-pack suffix so it flags wrong fees, mis-rated careers, missing
 * blocks, and era-inappropriate bands.
 *
 * Input is a freshly-created GameState for a scenario in the target era (so the
 * curated players carry their built ceilings and resistance), plus the era
 * pack's ledger/injuries read via the engine registry.
 */

import {
  ERA_REALITY,
  eraForScenario,
  parseYearMonth,
  type ClubId,
  type GameState,
  type PlayerState,
} from '@director/engine';
import { buildReferenceSlice } from './reference-loader.js';
import type { ReviewItem } from './types.js';

export interface DataPackSampleOptions {
  /** Cap curated ceiling/resistance items so the batch stays a few dozen calls. */
  maxCeilingItems?: number;
  maxResistanceItems?: number;
  /** Loyalty at/above which a player is a "one-club" candidate worth validating. */
  oneClubLoyalty?: number;
}

const DEFAULTS: Required<DataPackSampleOptions> = {
  maxCeilingItems: 25,
  maxResistanceItems: 20,
  oneClubLoyalty: 75,
};

function curatedPlayers(state: GameState): PlayerState[] {
  return Object.values(state.players).filter((p) => p.curated);
}

/**
 * Build validation items for the era pack behind `state`'s scenario.
 * `eraLabel` names the items uniquely.
 */
export function sampleDataPack(
  state: GameState,
  options: DataPackSampleOptions = {},
): ReviewItem[] {
  const opts = { ...DEFAULTS, ...options };
  const eraId = eraForScenario(state.meta.scenarioId);
  const pack = ERA_REALITY[eraId];
  const ledger = pack?.realTransferLedger ?? [];
  const injuries = pack?.realInjuries ?? [];
  const items: ReviewItem[] = [];

  // ── Ledger entries: wrong fee / window / club (§8). ──────────────────────────
  for (const [i, e] of ledger.entries()) {
    const p = state.players[e.playerId];
    items.push({
      id: `data-ledger:${eraId}:${i}`,
      category: 'data-ledger',
      summary: `${e.playerId} ${e.from ?? 'free'}→${e.to} ${e.window} £${(e.fee / 1_000_000).toFixed(1)}m`,
      significance: e.fee >= 20_000_000 ? 0.9 : 0.7,
      payload: {
        entry: e,
        player: p
          ? { name: p.name, birthYear: p.birthYear, positions: p.positions, birthCeiling: p.birthCeiling }
          : { missing: true },
      },
      reference: buildReferenceSlice(state, {
        playerIds: [e.playerId],
        clubIds: [e.to, ...(e.from ? [e.from] : [])],
        window: e.window,
      }),
    });
  }

  // Coverage item: the full ledger + covered clubs, to catch MISSING transfers.
  const coveredClubs = new Set<ClubId>();
  for (const e of ledger) {
    coveredClubs.add(e.to);
    if (e.from) coveredClubs.add(e.from);
  }
  items.push({
    id: `data-ledger-coverage:${eraId}`,
    category: 'data-ledger',
    summary: `${eraId}: ${ledger.length} ledger entries across ${coveredClubs.size} clubs — check for missing significant real transfers`,
    significance: 0.95,
    payload: {
      eraId,
      coveredClubs: [...coveredClubs],
      entries: ledger.map((e) => ({ playerId: e.playerId, from: e.from, to: e.to, window: e.window, fee: e.fee })),
    },
    reference: buildReferenceSlice(state, { clubIds: [...coveredClubs] }),
  });

  // ── Curated ceilings: over/under-rated real careers (§8). ────────────────────
  const startYear = parseYearMonth(state.clock.date).year;
  const rated = curatedPlayers(state)
    .slice()
    .sort((a, b) => b.birthCeiling - a.birthCeiling)
    .slice(0, opts.maxCeilingItems);
  for (const p of rated) {
    items.push({
      id: `data-ceiling:${eraId}:${p.id}`,
      category: 'data-ceiling',
      summary: `${p.name} (age ${startYear - p.birthYear}) ability ${p.ability}, ceiling ${p.birthCeiling}`,
      significance: 0.6,
      payload: {
        playerId: p.id,
        name: p.name,
        ageAtEraStart: startYear - p.birthYear,
        positions: p.positions,
        nationality: p.nationality,
        ability: p.ability,
        potentialCeiling: p.potentialCeiling,
        birthCeiling: p.birthCeiling,
      },
      reference: buildReferenceSlice(state, { playerIds: [p.id], clubIds: p.club ? [p.club] : [] }),
    });
  }

  // ── Resistance / hard blocks: missing or wrong one-club & rivalry blocks (§8). ─
  const anchored = curatedPlayers(state)
    .filter((p) => p.resistance.hardBlocks.length > 0 || p.resistance.clubLoyalty >= opts.oneClubLoyalty)
    .sort((a, b) => b.resistance.clubLoyalty - a.resistance.clubLoyalty)
    .slice(0, opts.maxResistanceItems);
  for (const p of anchored) {
    items.push({
      id: `data-resistance:${eraId}:${p.id}`,
      category: 'data-resistance',
      summary: `${p.name}: loyalty ${p.resistance.clubLoyalty}, ${p.resistance.hardBlocks.length} hard block(s)`,
      significance: p.resistance.hardBlocks.length > 0 ? 0.8 : 0.6,
      payload: {
        playerId: p.id,
        name: p.name,
        club: p.club,
        resistance: p.resistance,
      },
      reference: buildReferenceSlice(state, { playerIds: [p.id], clubIds: p.club ? [p.club] : [] }),
    });
  }

  // ── Real injuries: era fidelity (§8). ────────────────────────────────────────
  for (const [i, inj] of injuries.entries()) {
    items.push({
      id: `data-injury:${eraId}:${i}`,
      category: 'data-injury',
      summary: `${inj.playerId} @ ${inj.atClub} ${inj.since} ${inj.months}mo${inj.serious ? ' (serious)' : ''}`,
      significance: 0.5,
      payload: { injury: inj },
      reference: buildReferenceSlice(state, { playerIds: [inj.playerId], clubIds: [inj.atClub], window: inj.since }),
    });
  }

  return items;
}
