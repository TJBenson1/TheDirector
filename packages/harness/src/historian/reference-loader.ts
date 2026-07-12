/**
 * Grounding (§2): never trust the model's memory for facts. For every review
 * item we inject the relevant slice of the data pack — real ledger entries,
 * career baselines, club finance/ownership, and the divergence chain — so the
 * model judges plausibility against injected facts, not recollection.
 */

import {
  ERA_REALITY,
  eraForScenario,
  type ClubId,
  type GameState,
  type PlayerId,
  type RealTransferLedgerEntry,
  type YearMonth,
} from '@director/engine';
import type { CareerBaseline, ClubReference, ReferenceSlice } from './types.js';

/** Short, factual era context — the market norms the model should judge against
 *  (§1 rule 3: a £15m fee means something different in 1997 vs 2017). */
const ERA_CONTEXT: Record<string, string> = {
  'era-1995-2005':
    '1995–2005: pre-mega-TV-deal market. £20–40m is a world-record-class fee ' +
    '(Figo £37m 2000, Zidane £46m 2001 were era peaks). The 2003 Abramovich ' +
    'takeover is the inflection point that starts blunt-force spending.',
  'era-2001':
    '2001–2005: the immediate post-treble years; the Abramovich Chelsea takeover ' +
    '(2003) reshapes the top of the market. £15–20m is a marquee fee.',
  'era-2004':
    '2004–2009: Chelsea are cash-rich; United rebuild the Ronaldo/Rooney side; ' +
    '£20–30m marks an elite signing, rising toward the £80m Ronaldo sale in 2009.',
  'era-2013':
    '2013–2016: post-Ferguson; TV money has inflated fees. £30–60m is a top ' +
    'signing (Bale £85m 2013 is the era record); wage inflation is well advanced.',
};

export interface ReferenceQuery {
  clubIds?: Iterable<ClubId>;
  playerIds?: Iterable<PlayerId>;
  /** Restrict ledger entries to this window (± the whole era if omitted). */
  window?: YearMonth;
}

function eraPackFor(state: GameState): { id: string; ledger: RealTransferLedgerEntry[] } {
  const id = eraForScenario(state.meta.scenarioId);
  const pack = ERA_REALITY[id];
  return { id, ledger: pack?.realTransferLedger ?? [] };
}

/** Ledger entries touching any of the given clubs/players (or all, if neither). */
function relevantLedger(
  ledger: RealTransferLedgerEntry[],
  clubs: Set<ClubId>,
  players: Set<PlayerId>,
): RealTransferLedgerEntry[] {
  if (clubs.size === 0 && players.size === 0) return ledger;
  return ledger.filter(
    (e) =>
      players.has(e.playerId) ||
      clubs.has(e.to) ||
      (e.from !== null && clubs.has(e.from)),
  );
}

function clubReference(state: GameState, id: ClubId): ClubReference | null {
  const c = state.clubs[id];
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    prestige: c.prestige,
    ownership: c.finances.ownership,
    financialHealth: c.financialHealth,
    baseStrength: c.baseStrength,
  };
}

function careerBaseline(
  state: GameState,
  id: PlayerId,
  ledger: RealTransferLedgerEntry[],
): CareerBaseline | null {
  const p = state.players[id];
  if (!p) return null;
  const realMoves = ledger.filter((e) => e.playerId === id);
  return {
    playerId: p.id,
    name: p.name,
    birthYear: p.birthYear,
    nationality: p.nationality,
    positions: p.positions,
    birthCeiling: p.birthCeiling,
    ...(realMoves.length > 0 ? { realMoves } : {}),
  };
}

/**
 * Build the reference slice for a review item. Facts only — the model supplies
 * judgment. Everything here is a pure read of the data pack and final state.
 */
export function buildReferenceSlice(state: GameState, query: ReferenceQuery = {}): ReferenceSlice {
  const { id: eraId, ledger } = eraPackFor(state);
  const clubs = new Set(query.clubIds ?? []);
  const players = new Set(query.playerIds ?? []);

  let ledgerEntries = relevantLedger(ledger, clubs, players);
  if (query.window) ledgerEntries = ledgerEntries.filter((e) => e.window === query.window);

  const careerBaselines: CareerBaseline[] = [];
  for (const id of players) {
    const b = careerBaseline(state, id, ledger);
    if (b) careerBaselines.push(b);
  }

  const clubRefs: ClubReference[] = [];
  for (const id of clubs) {
    const r = clubReference(state, id);
    if (r) clubRefs.push(r);
  }

  return {
    eraContext: ERA_CONTEXT[eraId] ?? `Era pack ${eraId}.`,
    ledgerEntries,
    careerBaselines,
    clubs: clubRefs,
    // The divergence log is short; ship it whole so the butterfly chain is legible.
    divergenceLog: state.timeline.divergenceLog,
  };
}
