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
import { Rng, hashStringToU32 } from './rng.js';
import { WINDOW_STEPS, WINDOW_PHASE_REVIEW, transferWindowOrdinal } from './clock.js';
import { logEvent } from './eventLog.js';
import { valuePlayer } from './finance.js';
import { executeTransfer } from './transfers.js';
import { clubSquadPlayers, playerStarValue, instantiateCuratedSeed, recomputeClubStrength } from './players.js';
import { effectiveAbility } from './adaptation.js';
import { appendMemory } from './memory.js';
import { areDirectRivals } from './agency.js';
import { applyPrematureMove } from './development.js';
import { ERA_REALITY, eraForScenario, entryKey, type RealTransferLedgerEntry, type FallbackTier, type InvalidationCause } from './ledger.js';

/**
 * Fire the era's academy intakes due this season (long-horizon fidelity, §4). At
 * the July rollover each real graduate whose debut year has arrived is instantiated
 * from its curated seed and joins its real club — a teenage Messi at Barça, Rooney
 * at Everton — so a long save is repopulated by real names, not just anonymous
 * academy filler. Idempotent: a graduate already present (or already graduated) is
 * skipped, and an intake whose club has vanished is ignored.
 */
export function executeAcademyIntakes(state: GameState): void {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack?.academyIntakes?.length || !pack.academyGraduates?.length) return;
  const year = Number(state.clock.date.slice(0, 4));
  const rng = new Rng(state.meta.rngState).fork(`intake:${year}`);
  const byId = new Map(pack.academyGraduates.map((g) => [g.id, g]));
  // Real people already in the world (under ANY id) — a later-start era's kickoff
  // squad already holds the then-current stars, so a shared cross-era graduate pool
  // must never inject a second Harry Kane on top of the one the pack shipped.
  const presentNames = new Set(Object.values(state.players).map((p) => p.name));

  for (const intake of pack.academyIntakes) {
    if (intake.year !== year) continue;
    if (state.players[intake.playerId]) continue; // already in the world (by id)
    const seed = byId.get(intake.playerId);
    if (!seed) continue;
    if (presentNames.has(seed.name)) continue; // already in the world (by identity)
    const club = state.clubs[intake.clubId];
    if (!club) continue;
    const player = instantiateCuratedSeed(seed, year, rng.fork(intake.playerId));
    player.club = intake.clubId; // debut at the real club
    state.players[player.id] = player;
    club.squad.push(player.id);
    if (club.leagueId !== null) recomputeClubStrength(state, club.id);
    logEvent(state, {
      category: 'development',
      code: 'academy.graduate',
      message: `${player.name} breaks through at ${club.name} (${year - player.birthYear})`,
      data: { playerId: player.id, clubId: club.id, age: year - player.birthYear },
    });
  }
}

function positionGroupOf(p: PlayerState): string {
  const pos = p.positions[0] ?? 'CM';
  if (pos === 'GK') return 'GK';
  if (['CB', 'LB', 'RB'].includes(pos)) return 'DEF';
  // Holding/central midfield only — an ATTACKING midfielder (Ronaldinho, Deco,
  // Zidane) is a creator, not a Roy Keane. He groups with the forward line, so a
  // club denied a Ronaldinho reaches for another attacker, never a holding mid.
  if (['DM', 'CM'].includes(pos)) return 'MID';
  return 'ATT'; // AM, LW, RW, ST
}

/** Ceiling on how far above a missed target's ability a frustrated club will
 *  reach (§9a escalation). A club far enough behind reality can chase a genuine
 *  upgrade — but not a limitless one; even an aggrieved giant works the real
 *  market, not a fantasy one. */
const AMBITION_MAX = 6;

/**
 * Which sub-step of a window a real move lands in (§3 multi-step windows),
 * 1..WINDOW_STEPS. Marquee deals tend to resolve LATE (deadline-day drama),
 * which is also what gives the user time to court and intervene before a big
 * transfer locks in; routine business goes early. Deterministic, with a hash
 * jitter so same-tier deals spread across the window rather than clumping.
 */
export function stepForEntry(entry: RealTransferLedgerEntry): number {
  const feeM = entry.fee / 1_000_000;
  let step = feeM >= 22 ? WINDOW_STEPS : feeM >= 8 ? 2 : 1;
  const h = hashStringToU32(entryKey(entry)) % 100;
  if (h < 20 && step > 1) step -= 1; // a fifth pulled forward
  else if (h >= 80 && step < WINDOW_STEPS) step += 1; // a fifth pushed to the deadline
  return step;
}

/**
 * Execute the real-ledger entries now due that belong to window sub-step `step`
 * (§3). On the final step (deadline day) every still-unprocessed due entry is
 * swept up, so nothing is stranded and a full window (steps 1..N) executes
 * exactly the set it did as a single pass. `step` defaults to the final step so
 * a single-shot caller still processes the whole window.
 */
export function executeLedgerWindow(state: GameState, rng: Rng, step: number = WINDOW_STEPS): void {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return;
  const isFinalStep = step >= WINDOW_STEPS;
  const now = state.clock.date;
  // Fork label deliberately omits the step: a single-shot final-step sweep
  // (the headless/batch path) draws the exact same stream as before multi-step
  // windows existed, so determinism and calibration are preserved.
  const r = rng.fork(`ledger:${now}`);

  const nowYear = Number(now.slice(0, 4));
  const nowOrd = transferWindowOrdinal(now);

  // Players whose real move is still ahead — used to let a deprived club hijack
  // a player reality was already moving IMMINENTLY (Arsenal → Ferdinand, whose
  // move was a year away). Only moves within ~1 year count: you can't pull a
  // striker's 2007 transfer forward to 2004 to plug a gap now.
  const futureByPlayer = new Map<string, string[]>();
  for (const e of pack.realTransferLedger) {
    if (transferWindowOrdinal(e.window) > nowOrd && Number(e.window.slice(0, 4)) - nowYear <= 2 && !state.meta.executedLedger.includes(entryKey(e))) {
      const arr = futureByPlayer.get(e.playerId) ?? [];
      arr.push(entryKey(e));
      futureByPlayer.set(e.playerId, arr);
    }
  }

  // Everything due this window (a real window spans Jul–Aug, so -07/-08/-09 all
  // resolve in the summer window — see transferWindowOrdinal). Execute them in a
  // canonical order so (a) per-step unfolding is byte-identical to a single batch
  // sweep, and (b) dependencies never invert: an arrival resolves before the same
  // player's departure, and an enabler before its dependent. Order key is
  // (effectiveStep, window, index): step is primary because the per-step path
  // groups by step, so the batch path must too for byte-identity.
  const due = pack.realTransferLedger
    .map((entry, index) => ({ entry, index, key: entryKey(entry) }))
    .filter((d) => !state.meta.executedLedger.includes(d.key) && transferWindowOrdinal(d.entry.window) <= nowOrd);

  // Effective step, raised by dependency propagation so a dependent/departure is
  // never scheduled before its enabler/arrival. Base = the drama-spread step.
  const effStep = new Map<string, number>();
  for (const d of due) {
    // A real move involving the user's club is surfaced in the REVIEW phase (up
    // front), so the user has the rest of the window to sanction or divert it —
    // and any chain it funds can settle at the deadline instead of deferring to
    // the next window. Non-user reality business keeps its fee-driven drama step.
    const isUserMove = d.entry.from === state.playerClub || d.entry.to === state.playerClub;
    effStep.set(d.key, isUserMove ? WINDOW_PHASE_REVIEW : stepForEntry(d.entry));
  }
  const byKey = new Map(due.map((d) => [d.key, d]));
  // A same-player, same-window later move (his departure) depends on the earlier
  // one (his arrival); an enabledBy dependent depends on its enabler.
  const dependsOn = new Map<string, string[]>();
  const byPlayer = new Map<string, typeof due>();
  for (const d of due) {
    const arr = byPlayer.get(d.entry.playerId) ?? [];
    arr.push(d); byPlayer.set(d.entry.playerId, arr);
  }
  for (const list of byPlayer.values()) {
    list.sort((a, b) => (a.entry.window < b.entry.window ? -1 : a.entry.window > b.entry.window ? 1 : a.index - b.index));
    for (let i = 1; i < list.length; i++) (dependsOn.get(list[i]!.key) ?? dependsOn.set(list[i]!.key, []).get(list[i]!.key)!).push(list[i - 1]!.key);
  }
  for (const d of due) {
    if (d.entry.enabledBy && byKey.has(d.entry.enabledBy)) {
      (dependsOn.get(d.key) ?? dependsOn.set(d.key, []).get(d.key)!).push(d.entry.enabledBy);
    }
  }
  // Propagate: effStep[dep] >= effStep[enabler]. Iterate to a fixpoint (chains are short).
  for (let pass = 0; pass < due.length; pass++) {
    let changed = false;
    for (const [depKey, enablers] of dependsOn) {
      for (const enKey of enablers) {
        const want = effStep.get(enKey) ?? 1;
        if ((effStep.get(depKey) ?? 1) < want) { effStep.set(depKey, want); changed = true; }
      }
    }
    if (!changed) break;
  }

  const dueSorted = [...due].sort((a, b) => {
    const sa = effStep.get(a.key)!, sb = effStep.get(b.key)!;
    if (sa !== sb) return sa - sb;
    if (a.entry.window !== b.entry.window) return a.entry.window < b.entry.window ? -1 : 1;
    return a.index - b.index;
  });

  for (const { entry, key } of dueSorted) {
    if (state.meta.executedLedger.includes(key)) continue;
    // Multi-step: only this step's slice fires now; the deadline step sweeps up
    // whatever remains due (so the full window still executes the same set).
    if (!isFinalStep && effStep.get(key) !== step) continue;
    // Defer a dependent whose enabler is still an OPEN user-club decision. The
    // user resolves real moves involving their club BETWEEN windows, so a swap
    // like Cole→Chelsea (a user sale) enabling Gallas→Arsenal must wait for that
    // sanction — exactly what the pre-merge summer/winter window gap guaranteed.
    // Leave it due (don't mark executed) and it retries once the user has acted.
    if (
      entry.enabledBy &&
      !state.meta.realizedLedger.includes(entry.enabledBy) &&
      state.pendingDecisions.some((d) => d.id === `real-out:${entry.enabledBy}` || d.id === `real-in:${entry.enabledBy}`)
    ) {
      continue;
    }
    state.meta.executedLedger.push(key);

    const player = state.players[entry.playerId];
    const dest = state.clubs[entry.to];

    // Already at his real destination — the curated squad baked this move in (a
    // pre-summer squad plus a live opening window can leave a player already
    // where reality was taking him). Reality holds; realise it silently, with no
    // spurious butterfly and no re-offer of a signing already made.
    if (player && player.club === entry.to) {
      state.meta.realizedLedger.push(key);
      continue;
    }

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
      const res = executeTransfer(state, { playerId: entry.playerId, toClub: entry.to, fee: entry.fee }, { reality: true });
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
    // Incoming real signing the user is expected to make. If he is no longer at
    // his real club, an earlier move (often a knock-on of the user's OWN business)
    // took him — surface WHERE he went and, where the divergence log recorded it,
    // WHY, so the Director hears the ripple ("you signed X, so Y went elsewhere")
    // rather than a bare "unavailable".
    if (!player || player.club !== entry.from) {
      const nowAt = player?.club ? state.clubs[player.club]?.name : undefined;
      const cause = player
        ? [...state.timeline.divergenceLog].reverse().find((d) => d.detail.includes(player.name))
        : undefined;
      const whereTo = nowAt ? ` — he went to ${nowAt} instead` : '';
      const because = cause ? ` ${cause.detail}` : '';
      logEvent(state, {
        category: 'transfer',
        code: 'ledger.unavailable',
        message: `A real signing you'd have been offered, ${player?.name ?? entry.playerId}, is off the table${whereTo}.${because}`,
        data: { playerId: entry.playerId, to: entry.to, nowAt: player?.club ?? null },
      });
      return;
    }
    const fromName = entry.from ? state.clubs[entry.from]?.name ?? entry.from : 'a free transfer';
    const clubName = state.clubs[state.playerClub]!.name;
    // Does the Director actually NEED him? If he already has two clearly better
    // players in the position (he built his own strength there), the coach frames
    // it as a signing for the record books, not the squad — the "bought Lampard and
    // Essien, so I don't need Carrick" case, told rather than silently offered.
    const grp = positionGroupOf(player);
    const ahead = clubSquadPlayers(state, state.playerClub)
      .filter((p) => p.id !== player.id && positionGroupOf(p) === grp && effectiveAbility(p) >= player.ability + 2)
      .sort((a, b) => effectiveAbility(b) - effectiveAbility(a));
    const description =
      ahead.length >= 2
        ? `This is the window ${player.name} really joined ${clubName} — but you are already well stocked here (${ahead[0]!.name} and ${ahead[1]!.name} are ahead of him), so this is one for the record books more than the squad. Complete it anyway, or pass and let history diverge.`
        : `This is the window ${player.name} really joined ${clubName}. Complete the deal, or pass and let history diverge.`;
    state.pendingDecisions.push({
      id: `real-in:${key}`,
      title: `Real signing available: ${player.name} (${fromName}, £${feeM}m)`,
      description,
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
  // A genuine STAR's exit forces a conscious call — you never lose a marquee player
  // to a window you weren't watching. (Reality-default is preserved: sell is still
  // there, and it remains the ignore fallout; the interrupt just guarantees you SEE
  // it.) A squad player's real move stays a soft, ignore-to-reality decision.
  const isStar = player.ability >= 85;
  // A departure the COACH pushed for (Lippi selling Baggio) is a different story
  // from a player agitating to leave: keeping him overrules the coach and strains
  // that relationship, rather than merely unsettling the player.
  const coach = state.managerRelations;
  const isCastoff = coach.castoffs.includes(player.name);
  const description = isCastoff
    ? `This is the window ${player.name} really left for ${buyer?.name ?? entry.to} — a sale ${coach.identity} pushed for; he wants him moved on. Cash in as reality had it, or overrule your coach and keep him, and expect the friction to fester.`
    : `This is the window ${player.name} really left for ${buyer?.name ?? entry.to}. Sanction the sale, or keep him — he wanted the move, so refusing will unsettle him.`;
  const keepChoice = isCastoff
    ? {
        id: 'keep',
        label: `Overrule ${coach.identity} and keep ${player.name}`,
        onSuccess: [
          { kind: 'agitation' as const, playerId: entry.playerId, amount: 24, text: `kept against ${coach.identity}'s wishes` },
          { kind: 'managerRelationship' as const, amount: -14, text: `You overruled ${coach.identity} and kept ${player.name}, whom he wanted sold.` },
        ],
      }
    : {
        id: 'keep',
        // You can always keep a player (§ "money talks, but you can refuse") — the
        // cost is unrest (38 sits just below the forced-exit threshold, so he stays
        // but sulks), not a guaranteed exit like a rejected poach bid.
        label: `Keep ${player.name} (he wanted the move — unrest)`,
        onSuccess: [{ kind: 'agitation' as const, playerId: entry.playerId, amount: 38, text: `wanted the move to ${buyer?.name ?? entry.to} that you blocked` }],
      };
  state.pendingDecisions.push({
    id: `real-out:${key}`,
    title: `${buyer?.name ?? entry.to} bid £${feeM}m for ${player.name} (his real move)`,
    description,
    interrupt: isStar,
    clubId: state.playerClub,
    category: 'transfer',
    choices: [
      { id: 'sell', label: `Sanction the £${feeM}m sale (as in reality)`, onSuccess: [{ kind: 'transferOut', playerId: entry.playerId, clubId: entry.to, amount: entry.fee, tag: realizedTag }] },
      keepChoice,
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

  // ESCALATION (§9a, compounding): how far this club had ALREADY fallen behind
  // reality in Europe BEFORE this miss — the ground lost to being gazumped again
  // and again. A first miss (prior deficit 0) is patched like-for-like; a club
  // repeatedly denied reaches for genuine UPGRADES and comes for the culprit's own
  // stars far more readily. Bounded, and zero for a club that has lost no ground
  // (so a passive world never escalates).
  const behind = Math.max(0, -dest.starButterfly);
  const ambition = Math.min(AMBITION_MAX, behind);
  if (ambition >= 2) {
    logEvent(state, {
      category: 'transfer',
      code: 'rival.escalate',
      message: `${dest.name}, ${behind.toFixed(1)} behind reality in Europe, escalate — chasing a more ambitious replacement`,
      data: { clubId: dest.id, behind: Number(behind.toFixed(2)), ambition: Number(ambition.toFixed(2)) },
    });
  }

  // The CONTINENTAL cost of THIS miss (§ butterfly showcase): a club denied a real
  // talisman is weaker in Europe by his star value. Any like-for-like replacement
  // signed below banks its own (smaller) positive butterfly through executeTransfer,
  // so the NET on `dest` is precisely the downgrade — Barça, denied Ronaldinho and
  // left with a lesser man, lose ground in the European Cup.
  dest.starButterfly -= playerStarValue(original.ability);

  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  const ledgerSubjects = new Set((pack?.realTransferLedger ?? []).map((e) => e.playerId));

  // NEAR-MISS FIRST (§ butterfly showcase): before any generic alternative, the
  // deprived club turns to a move that ALMOST happened in reality — Chelsea to
  // Gerrard, Barça to Beckham. A curated real intent overrides the ordinary "don't
  // raid a direct rival" caution: these deals were genuinely on the table. Pulling
  // him consumes any onward move reality had for him.
  for (const nm of pack?.nearMissLedger ?? []) {
    if (nm.to !== entry.to) continue;
    if (Math.abs(Number(nm.window.slice(0, 4)) - year) > 2) continue; // roughly the right era
    const p = state.players[nm.playerId];
    if (!p || p.club === entry.to || p.injury || p.resistance.hardBlocks.length > 0) continue;
    if (positionGroupOf(p) !== group) continue; // fills the same slot as the man they missed
    if (!state.clubs[p.club ?? '']) continue;
    const fee = valuePlayer(p, year);
    dest.finances.transferBudget = Math.max(dest.finances.transferBudget, fee);
    const res = executeTransfer(state, { playerId: p.id, toClub: entry.to, fee });
    if (!res.ok) continue;
    for (const k of futureByPlayer.get(p.id) ?? []) {
      if (!state.meta.executedLedger.includes(k)) state.meta.executedLedger.push(k);
    }
    state.timeline.divergenceLog.push({
      date: state.clock.date,
      kind: 'butterfly',
      detail: `${dest.name}, denied ${original.name}, land ${p.name} instead — a move that almost happened in reality now does.`,
    });
    logEvent(state, {
      category: 'transfer',
      code: 'ledger.nearmiss',
      message: `${dest.name} turn to a near-miss: sign ${p.name} (denied ${original.name})`,
      data: { clubId: dest.id, playerId: p.id, deniedOf: original.id, fee },
    });
    return 'near-miss';
  }

  // A comparable, genuinely-available alternative. Two sources count as
  // "available": (a) foreign/context depth reality isn't otherwise using, and
  // (b) a player whose OWN real move is still ahead — reality was going to sell
  // him anyway, so the deprived club can hijack that (Arsenal, denied Campbell,
  // go for Leeds' Ferdinand). Picking (b) consumes his onward move: he joins the
  // new club and his later real transfer never happens.
  const eligible = (p: PlayerState): boolean => {
    if (p.retired) return false; // hung up his boots
    if (!p.curated) return false; // a named narrative signing must be a real player (Principle 2)
    if (p.id === entry.playerId || p.club === entry.to) return false;
    if (positionGroupOf(p) !== group) return false;
    if (p.resistance.hardBlocks.length > 0 || p.injury) return false;
    if (p.ability > targetAbility + 2 + ambition) return false; // escalating clubs reach for upgrades
    if (targetAbility - p.ability > 6) return false; // never a big drop — ambition rises, standards don't fall
    const seller = p.club ? state.clubs[p.club] : undefined;
    if (!seller) return false;
    if (areDirectRivals(state, seller.id, entry.to)) return false; // rivals don't trade
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
  // nothing comparable is available and the user holds the obvious replacement —
  // and increasingly often the further behind the club has fallen (it turns on
  // the very club that keeps outsmarting it).
  const poachChance = Math.min(0.92, (bestAlt ? 0.35 : 0.75) + behind * 0.08);
  const poach = !!userAsset && rng.chance(poachChance);
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
        // He has been pulled off his real pathway ahead of time. A young talent
        // asked to deliver before he was ready may not fulfil his potential
        // (§5 reality-rail) — a logged, traceable consequence.
        let earliest: RealTransferLedgerEntry | undefined;
        for (const e of pack?.realTransferLedger ?? []) {
          if (e.playerId !== bestAlt.id || e.window <= state.clock.date) continue;
          if (!earliest || e.window < earliest.window) earliest = e;
        }
        const yearsEarly = earliest
          ? Number(earliest.window.slice(0, 4)) - Number(state.clock.date.slice(0, 4))
          : 1;
        applyPrematureMove(state, bestAlt, yearsEarly, earliest?.to ?? null, rng.fork(`premature:${bestAlt.id}`));
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

/**
 * A Director's SALE can sate a club's need (§9f, the mirror of the raid-ripple):
 * when the user sells a player to club C, and C had an upcoming REAL signing of
 * the same position the sold man fills, that signing becomes redundant — C no
 * longer needs it — so it is cancelled with a traceable butterfly ("Parma, having
 * just signed your Zamorano, no longer move for their real striker"). Only cancels
 * when the sold player genuinely fills the slot (comparable-or-better than the real
 * target), so dumping a fringe body doesn't call off a marquee arrival. Invoked
 * only from the interactive sell path (never the harness), so calibration is
 * untouched. Returns the cancelled target's name for the narrator, or null.
 */
export function rippleSaleSatesNeed(state: GameState, buyerId: ClubId, soldPlayerId: string): { cancelled: string } | null {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return null;
  const buyer = state.clubs[buyerId];
  const sold = state.players[soldPlayerId];
  if (!buyer || !sold || buyerId === state.playerClub) return null;
  const group = positionGroupOf(sold);
  const nowOrd = transferWindowOrdinal(state.clock.date);
  const nowYear = Number(state.clock.date.slice(0, 4));

  let best: { entry: RealTransferLedgerEntry; target: PlayerState } | undefined;
  for (const e of pack.realTransferLedger) {
    if (e.to !== buyerId) continue; // a real signing the buyer was going to make
    if (state.meta.executedLedger.includes(entryKey(e))) continue;
    if (transferWindowOrdinal(e.window) <= nowOrd) continue; // still ahead
    if (Number(e.window.slice(0, 4)) - nowYear > 2) continue; // within ~2 years
    const p = state.players[e.playerId];
    if (!p) continue;
    if (positionGroupOf(p) !== group) continue; // fills the same slot
    if (sold.ability < p.ability - 4) continue; // the sold man genuinely covers it
    if (!best || e.window < best.entry.window) best = { entry: e, target: p };
  }
  if (!best) return null;

  state.meta.executedLedger.push(entryKey(best.entry)); // cancel: the need is met
  state.timeline.divergenceLog.push({
    date: state.clock.date,
    kind: 'butterfly',
    detail: `${buyer.name}, having just signed your ${sold.name}, no longer need ${best.target.name} — that real move is off.`,
  });
  logEvent(state, {
    category: 'transfer',
    code: 'ledger.sated',
    message: `${buyer.name} drop their move for ${best.target.name} — your sale of ${sold.name} filled the gap`,
    data: { clubId: buyerId, cancelled: best.target.id, via: sold.id },
  });
  return { cancelled: best.target.name };
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
