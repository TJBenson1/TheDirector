/**
 * Reality-ledger execution (docs/DESIGN-reality-default.md, §9f).
 *
 * AI clubs execute their REAL transfers by default. Autonomous decision-making
 * fires only when an entry is INVALIDATED — the user signed the target first,
 * or a prior action broke the chain. Every invalidation is a traceable
 * butterfly logged to `timeline.divergenceLog`, and the replacement is chosen by
 * an explicit fallback hierarchy (real-backup → profile-similar → generic),
 * with the tier recorded.
 *
 * This is what keeps a non-interfered world matching real history: leave the
 * ledger alone and Anelka goes to Madrid, Crespo to Chelsea, on schedule.
 */

import type { ClubId, Decision, GameState, PlayerState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { valuePlayer } from './finance.js';
import { executeTransfer } from './transfers.js';
import { clubSquadPlayers } from './players.js';
import { appendMemory } from './memory.js';
import { ERA_REALITY, eraForScenario, type RealTransferLedgerEntry, type FallbackTier, type InvalidationCause } from './ledger.js';

function positionGroupOf(p: PlayerState): string {
  const pos = p.positions[0] ?? 'CM';
  if (pos === 'GK') return 'GK';
  if (['CB', 'LB', 'RB'].includes(pos)) return 'DEF';
  if (['DM', 'CM', 'AM'].includes(pos)) return 'MID';
  return 'ATT';
}

/** Execute all real-ledger entries now due, from the current window. */
export function executeLedgerWindow(state: GameState, rng: Rng): void {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return;
  const now = state.clock.date;
  const r = rng.fork(`ledger:${now}`);

  for (const entry of pack.realTransferLedger) {
    if (state.meta.executedLedger.includes(entry.playerId)) continue;
    if (entry.window > now) continue; // not due yet (YYYY-MM compares lexically)
    state.meta.executedLedger.push(entry.playerId);

    const player = state.players[entry.playerId];
    const dest = state.clubs[entry.to];
    const validReality =
      !!player &&
      !!dest &&
      player.club === entry.from &&
      entry.from !== state.playerClub &&
      entry.to !== state.playerClub;

    if (validReality) {
      // Reality holds: execute the real transfer (the buyer funds it).
      dest.finances.transferBudget = Math.max(dest.finances.transferBudget, entry.fee);
      const res = executeTransfer(state, { playerId: entry.playerId, toClub: entry.to, fee: entry.fee });
      if (res.ok) {
        logEvent(state, {
          category: 'transfer',
          code: 'ledger.executed',
          message: `Reality holds: ${player!.name} → ${dest!.name}`,
          data: { playerId: entry.playerId, from: entry.from, to: entry.to },
        });
        continue;
      }
    }

    // Invalidated → traceable butterfly + fallback.
    const cause: InvalidationCause =
      player?.club === state.playerClub ? 'user-signed-target' : 'chain-broken-by-user';
    const tier = fallbackForLedger(state, entry, player, r);
    state.timeline.divergenceLog.push({
      date: now,
      kind: 'butterfly',
      detail: `Real move ${entry.playerId} → ${entry.to} invalidated (${cause}); ${entry.to} falls back via ${tier}.`,
    });
    appendMemory(state, 'divergence', `${entry.to} missed a real target (${cause}).`);
    logEvent(state, {
      category: 'transfer',
      code: 'ledger.fallback',
      message: `Butterfly: ${entry.to} misses a real signing (${cause}) → ${tier}`,
      data: { playerId: entry.playerId, to: entry.to, cause, tier },
    });
  }
}

/**
 * Fallback hierarchy when a real transfer can't happen (§9f). Because the ONLY
 * way an entry invalidates is a user action, the deprived club first looks at
 * the player who caused the problem — the USER's squad. If the user has a
 * genuine asset in the needed position, the club bids for HIM (a refusable
 * poach bid — the logical, traceable butterfly of the user's move). Only if the
 * user has no fit does it pursue a profile-similar player from the wider market,
 * else generic-needs (no deal).
 */
function fallbackForLedger(
  state: GameState,
  entry: RealTransferLedgerEntry,
  original: PlayerState | undefined,
  rng: Rng,
): FallbackTier {
  const dest = state.clubs[entry.to];
  if (!dest || !original) return 'generic-needs';
  const group = positionGroupOf(original);
  const targetAbility = original.ability;
  const year = Number(state.clock.date.slice(0, 4));

  // Tier: poach the user — the club deprived by the user's move turns to the
  // user's squad for a genuine asset in the same position (ability ≥ 78).
  const userAsset = clubSquadPlayers(state, state.playerClub)
    .filter((p) => positionGroupOf(p) === group && p.ability >= 78 && p.resistance.hardBlocks.length === 0 && !p.injury)
    .sort((a, b) => Math.abs(a.ability - targetAbility) - Math.abs(b.ability - targetAbility))[0];
  if (userAsset) {
    createPoachBid(state, dest.id, userAsset, original.name, year);
    return 'profile-similar';
  }

  // Otherwise, a profile-similar player from the wider (foreign) market.
  let best: PlayerState | undefined;
  for (const p of Object.values(state.players)) {
    const seller = p.club ? state.clubs[p.club] : undefined;
    if (!seller || seller.leagueId !== null) continue; // foreign/context pool (no cascade)
    if (positionGroupOf(p) !== group) continue;
    if (Math.abs(p.ability - targetAbility) > 6) continue;
    if (p.resistance.hardBlocks.length > 0) continue;
    if (!best || Math.abs(p.ability - targetAbility) < Math.abs(best.ability - targetAbility)) best = p;
  }
  if (!best) return 'generic-needs';
  const fee = valuePlayer(best, year);
  dest.finances.transferBudget = Math.max(dest.finances.transferBudget, fee);
  const res = executeTransfer(state, { playerId: best.id, toClub: entry.to, fee });
  return res.ok ? 'profile-similar' : 'generic-needs';
}

/**
 * Surface a refusable bid for a user player, as the logical consequence of the
 * user depriving `buyerId` of a real signing. Accept = a sale (you cash in);
 * reject = you keep him, at the cost of unrest. Every bid is a traceable chain.
 */
function createPoachBid(
  state: GameState,
  buyerId: ClubId,
  target: PlayerState,
  deprivedOf: string,
  year: number,
): void {
  const buyer = state.clubs[buyerId]!;
  const fee = Math.round(valuePlayer(target, year) * 1.05);
  buyer.finances.transferBudget = Math.max(buyer.finances.transferBudget, fee);

  const decision: Decision = {
    id: `poach:${target.id}:${state.clock.date}`,
    title: `${buyer.name} bid ${(fee / 1_000_000).toFixed(1)}m for ${target.name}`,
    description: `Denied ${deprivedOf} by your move, ${buyer.name} have turned to your squad and table a bid for ${target.name}. You can keep him — but he will not take it well.`,
    interrupt: true,
    clubId: state.playerClub,
    category: 'transfer',
    choices: [
      {
        id: 'reject',
        label: `Reject and keep ${target.name} (risks unrest)`,
        onSuccess: [{ kind: 'agitation', playerId: target.id, amount: 46, text: 'unsettled by the rejected bid' }],
      },
      {
        id: 'accept',
        label: `Accept the ${(fee / 1_000_000).toFixed(1)}m bid`,
        onSuccess: [{ kind: 'transferOut', playerId: target.id, clubId: buyerId, amount: fee }],
      },
    ],
    falloutIfIgnored: [{ kind: 'agitation', playerId: target.id, amount: 44 }],
    memoryTags: ['poach', target.id],
  };
  state.pendingDecisions.push(decision);

  state.timeline.divergenceLog.push({
    date: state.clock.date,
    kind: 'butterfly',
    detail: `${buyer.name}, denied ${deprivedOf} by your move, bid for ${target.name}.`,
  });
  logEvent(state, {
    category: 'transfer',
    code: 'poach.bid',
    message: `${buyer.name} bid for ${target.name} (deprived of ${deprivedOf} by your move)`,
    data: { playerId: target.id, from: state.playerClub, to: buyerId, deprivedOf },
  });
}

/** For the harness: is a ledger subject at his real destination now? */
export function ledgerSquadMatch(state: GameState): { atRealClub: number; total: number } {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return { atRealClub: 0, total: 0 };
  let atRealClub = 0;
  let total = 0;
  for (const entry of pack.realTransferLedger) {
    if (!state.meta.executedLedger.includes(entry.playerId)) continue; // only due ones
    total += 1;
    if (state.players[entry.playerId]?.club === entry.to) atRealClub += 1;
  }
  return { atRealClub, total };
}

export function ledgerClubs(): Set<ClubId> {
  const pack = ERA_REALITY['era-1995-2005'];
  const set = new Set<ClubId>();
  for (const e of pack?.realTransferLedger ?? []) {
    if (e.from) set.add(e.from);
    set.add(e.to);
  }
  return set;
}
