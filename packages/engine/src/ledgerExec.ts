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
import { ERA_REALITY, eraForScenario, entryKey, type RealTransferLedgerEntry, type FallbackTier, type InvalidationCause } from './ledger.js';

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

  // Players whose real move is still ahead — used to let a deprived club hijack
  // a player reality was already moving IMMINENTLY (Arsenal → Ferdinand, whose
  // move was a year away). Only moves within ~1 year count: you can't pull a
  // striker's 2007 transfer forward to 2004 to plug a gap now.
  const nowYear = Number(now.slice(0, 4));
  const futureByPlayer = new Map<string, string[]>();
  for (const e of pack.realTransferLedger) {
    if (e.window > now && Number(e.window.slice(0, 4)) - nowYear <= 2 && !state.meta.executedLedger.includes(entryKey(e))) {
      const arr = futureByPlayer.get(e.playerId) ?? [];
      arr.push(entryKey(e));
      futureByPlayer.set(e.playerId, arr);
    }
  }

  for (const entry of pack.realTransferLedger) {
    const key = entryKey(entry);
    if (state.meta.executedLedger.includes(key)) continue;
    if (entry.window > now) continue; // not due yet (YYYY-MM compares lexically)
    state.meta.executedLedger.push(key);

    const player = state.players[entry.playerId];
    const dest = state.clubs[entry.to];

    // Causal chain: a move enabled by a funder the user pre-empted is (probably)
    // CANCELLED, not replaced — the club no longer needs/can afford it, so the
    // player stays put (Madrid keep Özil once they never sign Bale; keep Ronaldo
    // and Madrid never offload Robben/Sneijder). `cancelChance` < 1 lets a fringe
    // move still happen for depth.
    if (entry.enabledBy && !state.meta.realizedLedger.includes(entry.enabledBy)) {
      if (r.chance(entry.cancelChance ?? 1)) {
        const funderEntry = pack.realTransferLedger.find((e) => entryKey(e) === entry.enabledBy);
        const funderName = funderEntry ? state.players[funderEntry.playerId]?.name ?? 'that signing' : 'that signing';
        state.timeline.divergenceLog.push({
          date: now,
          kind: 'butterfly',
          detail: `${dest?.name ?? entry.to} never completed the ${funderName} deal, so ${player?.name ?? entry.playerId} is not moved — he stays at ${state.clubs[entry.from ?? '']?.name ?? entry.from}.`,
        });
        logEvent(state, {
          category: 'transfer',
          code: 'ledger.cancelled',
          message: `Chain broken: ${player?.name ?? entry.playerId} stays put (the deal that funded his move never happened)`,
          data: { playerId: entry.playerId, from: entry.from, to: entry.to, enabledBy: entry.enabledBy },
        });
        continue;
      }
    }

    // A move involving the USER's club is the user's own call — present it as a
    // reality-default decision (sign it / sanction it, or diverge), rather than
    // auto-executing or silently skipping. Reality holds if the user does nothing.
    if (entry.to === state.playerClub || entry.from === state.playerClub) {
      offerUserLedgerMove(state, entry, key);
      continue;
    }

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
        state.meta.realizedLedger.push(key); // funders for dependents
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
    const tier = fallbackForLedger(state, entry, player, r, futureByPlayer);
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
 * Present a real transfer involving the user's club as a reality-default
 * decision (§16 — "real transfers per window"). Doing nothing = reality holds
 * (the incoming signing is completed / the outgoing sale is sanctioned). The
 * player may diverge: pass on a signing, or KEEP a player whose real move was
 * out — which unsettles him, because he wanted to go. A target no longer at his
 * real club (an earlier butterfly took him) is simply reported as unavailable.
 */
function offerUserLedgerMove(state: GameState, entry: RealTransferLedgerEntry, key: string): void {
  const player = state.players[entry.playerId];
  const feeM = (entry.fee / 1_000_000).toFixed(1);
  const realizedTag = `ledger:${key}`;

  if (entry.to === state.playerClub) {
    // Incoming real signing the user is expected to make.
    if (!player || player.club !== entry.from) {
      logEvent(state, {
        category: 'transfer',
        code: 'ledger.unavailable',
        message: `A real target (${player?.name ?? entry.playerId}) is no longer available — an earlier move took him elsewhere`,
        data: { playerId: entry.playerId, to: entry.to },
      });
      return;
    }
    const fromName = entry.from ? state.clubs[entry.from]?.name ?? entry.from : 'a free transfer';
    state.pendingDecisions.push({
      id: `real-in:${key}`,
      title: `Real signing available: ${player.name} (${fromName}, £${feeM}m)`,
      description: `This is the window ${player.name} really joined ${state.clubs[state.playerClub]!.name}. Complete the deal, or pass and let history diverge.`,
      interrupt: false,
      clubId: state.playerClub,
      category: 'transfer',
      choices: [
        { id: 'sign', label: `Complete the signing (£${feeM}m)`, onSuccess: [{ kind: 'signReal', playerId: entry.playerId, clubId: entry.from ?? undefined, amount: entry.fee, tag: realizedTag }] },
        { id: 'pass', label: 'Pass (diverge from history)', onSuccess: [{ kind: 'memory', tag: 'divergence', text: `Passed on signing ${player.name}.` }] },
      ],
      falloutIfIgnored: [{ kind: 'signReal', playerId: entry.playerId, clubId: entry.from ?? undefined, amount: entry.fee, tag: realizedTag }],
      memoryTags: ['real-move', entry.playerId],
    });
    return;
  }

  // Outgoing: entry.from === user club. A real departure the user can sanction.
  if (!player || player.club !== state.playerClub) return; // already gone / not ours
  const buyer = state.clubs[entry.to];
  if (buyer) buyer.finances.transferBudget = Math.max(buyer.finances.transferBudget, entry.fee);
  state.pendingDecisions.push({
    id: `real-out:${key}`,
    title: `${buyer?.name ?? entry.to} bid £${feeM}m for ${player.name} (his real move)`,
    description: `This is the window ${player.name} really left for ${buyer?.name ?? entry.to}. Sanction the sale, or keep him — he wanted the move, so refusing will unsettle him.`,
    interrupt: false,
    clubId: state.playerClub,
    category: 'transfer',
    choices: [
      { id: 'sell', label: `Sanction the £${feeM}m sale (as in reality)`, onSuccess: [{ kind: 'transferOut', playerId: entry.playerId, clubId: entry.to, amount: entry.fee, tag: realizedTag }] },
      // You can always keep a player (§ "money talks, but you can refuse") — the
      // cost is unrest (38 sits just below the forced-exit threshold, so he stays
      // but sulks), not a guaranteed exit like a rejected poach bid.
      { id: 'keep', label: `Keep ${player.name} (he wanted the move — unrest)`, onSuccess: [{ kind: 'agitation', playerId: entry.playerId, amount: 38, text: `wanted the move to ${buyer?.name ?? entry.to} that you blocked` }] },
    ],
    falloutIfIgnored: [{ kind: 'transferOut', playerId: entry.playerId, clubId: entry.to, amount: entry.fee, tag: realizedTag }],
    memoryTags: ['real-move', entry.playerId],
  });
}

/**
 * How a club deprived of a real target reacts (§9f). Realistic priority:
 *
 *   1. Sign a COMPARABLE, AVAILABLE alternative from the market (the default —
 *      "if you take my target, I buy someone else of similar level").
 *   2. Only if that club genuinely rates the user's own asset as the best
 *      attainable replacement does it *sometimes* come back for HIM — a
 *      refusable poach bid, now a minority butterfly rather than the reflex.
 *   3. Otherwise it makes do (promote/patch — generic-needs, no deal).
 *
 * The poach is deliberately probabilistic so a single user signing does not
 * reliably boomerang into a bid for the user's stars.
 */
function fallbackForLedger(
  state: GameState,
  entry: RealTransferLedgerEntry,
  original: PlayerState | undefined,
  rng: Rng,
  futureByPlayer: Map<string, string[]>,
): FallbackTier {
  const dest = state.clubs[entry.to];
  if (!dest || !original) return 'generic-needs';
  const group = positionGroupOf(original);
  const targetAbility = original.ability;
  const year = Number(state.clock.date.slice(0, 4));

  // A comparable, genuinely-available alternative. Two sources count as
  // "available": (a) foreign/context depth reality isn't otherwise using, and
  // (b) a player whose OWN real move is still ahead — reality was going to sell
  // him anyway, so the deprived club can hijack that (Arsenal, denied Campbell,
  // go for Leeds' Ferdinand). Picking (b) consumes his onward move: he joins the
  // new club and his later real transfer never happens.
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  const ledgerSubjects = new Set((pack?.realTransferLedger ?? []).map((e) => e.playerId));

  const eligible = (p: PlayerState): boolean => {
    if (!p.curated) return false; // a named narrative signing must be a real player (Principle 2)
    if (p.id === entry.playerId || p.club === entry.to) return false;
    if (positionGroupOf(p) !== group) return false;
    if (p.resistance.hardBlocks.length > 0 || p.injury) return false;
    if (p.ability > targetAbility + 2) return false; // not a clear upgrade
    if (targetAbility - p.ability > 6) return false; // like-for-like, not a big drop
    const seller = p.club ? state.clubs[p.club] : undefined;
    if (!seller) return false;
    const hijackable = futureByPlayer.has(p.id); // reality was moving him anyway
    if (hijackable) return true;
    if (ledgerSubjects.has(p.id)) return false; // spoken for, but not yet movable
    if (seller.leagueId !== null) return false; // else only low-cascade foreign depth
    if (seller.prestige >= 82 && seller.financialHealth === 'healthy') return false; // no raiding a happy giant
    return true;
  };

  // Gather ALL plausible alternatives and pick one WEIGHTED-RANDOM, so there is
  // real variance across playthroughs rather than a fixed target sequence. A
  // candidate is weighted by fit (closeness to the lost man), availability (a
  // settled star at a strong club is far harder to prise than one at a mid club,
  // and a distressed seller is a soft touch), and a small boost if reality was
  // already moving him.
  const candidates: Array<{ p: PlayerState; w: number }> = [];
  for (const p of Object.values(state.players)) {
    if (!eligible(p)) continue;
    const seller = state.clubs[p.club!]!;
    // Gentle fit curve: a slightly lesser but available player shouldn't be
    // crowded out by a perfect-fit target who is hard to get.
    const fit = 1 / (1 + Math.abs(p.ability - targetAbility) * 0.4);
    let avail = Math.max(0.15, Math.min(1.4, (92 - seller.prestige) / 24));
    if (seller.financialHealth !== 'healthy') avail *= 1.6; // fire-sale = easy prey
    // Signing a genuinely-available player is the norm; pulling someone's real
    // future move forward is the occasional, more disruptive exception.
    const hijack = futureByPlayer.has(p.id) ? 0.4 : 1.0;
    candidates.push({ p, w: fit * avail * hijack });
  }
  let bestAlt: PlayerState | undefined;
  if (candidates.length) {
    const total = candidates.reduce((s, c) => s + c.w, 0);
    let roll = rng.next() * total;
    for (const c of candidates) {
      roll -= c.w;
      if (roll <= 0) { bestAlt = c.p; break; }
    }
    bestAlt ??= candidates[candidates.length - 1]!.p;
  }

  // The user's best positional fit (a genuine asset the deprived club might
  // want) — but never the very player they just lost to the user.
  const userAsset = clubSquadPlayers(state, state.playerClub)
    .filter((p) => p.id !== original.id && positionGroupOf(p) === group && p.ability >= 78 && p.resistance.hardBlocks.length === 0 && !p.injury)
    .sort((a, b) => Math.abs(a.ability - targetAbility) - Math.abs(b.ability - targetAbility))[0];

  // Come back for the user's player only sometimes: a minority when a clean
  // market alternative exists (they'd usually just buy that), more often when
  // nothing comparable is available and the user holds the obvious replacement.
  const poach = !!userAsset && rng.chance(bestAlt ? 0.35 : 0.75);
  if (poach) {
    createPoachBid(state, dest.id, userAsset!, original.name, year);
    return 'real-backup';
  }

  if (bestAlt) {
    const fee = valuePlayer(bestAlt, year);
    dest.finances.transferBudget = Math.max(dest.finances.transferBudget, fee);
    const res = executeTransfer(state, { playerId: bestAlt.id, toClub: entry.to, fee });
    if (res.ok) {
      // Hijacking a future ledger subject consumes his onward move (no cascade
      // of misses — his later transfer simply never comes up).
      const consumed = futureByPlayer.get(bestAlt.id);
      if (consumed) {
        for (const k of consumed) if (!state.meta.executedLedger.includes(k)) state.meta.executedLedger.push(k);
        state.timeline.divergenceLog.push({
          date: state.clock.date,
          kind: 'butterfly',
          detail: `${dest.name}, denied ${original.name}, sign ${bestAlt.name} instead — so his own later real move never happens.`,
        });
      }
      logEvent(state, {
        category: 'transfer',
        code: 'ledger.alternative',
        message: `${dest.name}, denied ${original.name}, sign ${bestAlt.name} instead`,
        data: { playerId: bestAlt.id, to: entry.to, insteadOf: entry.playerId, hijack: !!consumed },
      });
      return 'profile-similar';
    }
  }
  return 'generic-needs';
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

/** For the harness: is a ledger subject at his real destination now? Uses each
 *  player's LATEST processed move, so a multi-move subject (Sporting→United→Real)
 *  is judged by where reality finally left him, not an intermediate club. */
export function ledgerSquadMatch(state: GameState): { atRealClub: number; total: number } {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return { atRealClub: 0, total: 0 };
  const latest = new Map<string, RealTransferLedgerEntry>();
  for (const entry of pack.realTransferLedger) {
    if (!state.meta.executedLedger.includes(entryKey(entry))) continue; // only processed ones
    const prev = latest.get(entry.playerId);
    if (!prev || entry.window > prev.window) latest.set(entry.playerId, entry);
  }
  let atRealClub = 0;
  let total = 0;
  for (const entry of latest.values()) {
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
