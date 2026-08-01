/**
 * Event engine (§9b): procedural events, scripted historical events, and the
 * consequence/decision machinery. Choices have FAILURE STATES — there are no
 * deterministic "correct" answers; the player manages probabilities (§9b), and
 * mediation can fail.
 *
 * Flow: `rollEventsMonth` fires events each month. An interrupt-class event at
 * the user's club becomes a `pendingDecision` and pauses the sim (§3); other
 * events auto-resolve. `applyDecision` resolves a pending decision with an
 * uncertain outcome. Ignored decisions apply their fallout when the sim
 * advances past them.
 *
 * Scandals (§9d) are personality-weighted and rare; AI clubs get them on the
 * same distributions. Memory tags thread consequences across seasons (§10).
 */

import type {
  ClubState,
  Consequence,
  Decision,
  GameState,
  LoggedEvent,
  PlayerState,
  YearMonth,
} from './types.js';
import { Rng } from './rng.js';
import { parseYearMonth } from './clock.js';
import { logEvent } from './eventLog.js';
import { cloneState } from './state.js';
import { eventsSince } from './eventLog.js';
import { appendMemory } from './memory.js';
import { divergenceFactor, rollDivergentStoryline } from './divergence.js';
import { executeTransfer, reactToLoss } from './transfers.js';
import { clubSquadPlayers, recomputeClubStrength } from './players.js';
import { valuePlayer, suggestWage } from './finance.js';
import { contractRetentionOdds, sagaFee, feeMillions, sportingRewriteOdds, careerFulfilmentOdds, injuryRecoveryOdds, transferLandsOdds } from './realityRegister.js';

/**
 * Dressing-room wage parity (§ internal friction). Football wages only ratchet
 * upward: when a KEY player lands a lucrative new deal, comparable teammates who
 * are now out-earned by a peer of similar or greater standing want their own terms
 * brought up to the market. Modelled as unrest on the aggrieved men — surfaced to
 * the Director as "wants his deal looked at". Deterministic (no RNG), so it never
 * perturbs a roll: only a handful of players' agitation shifts, and only when the
 * user (or an ignored contract call) renews a star. Contained to the top few peers.
 */
function applyWageParityRipple(state: GameState, renewedId: string): void {
  const star = state.players[renewedId];
  if (!star || !star.club) return;
  if (star.ability < 80) return; // only a genuine key man's deal moves the room
  const peers = clubSquadPlayers(state, star.club)
    .filter((p) => p.id !== star.id && p.curated && p.ability >= star.ability - 2 && p.wage < star.wage)
    .sort((a, b) => b.ability - a.ability || a.id.localeCompare(b.id))
    .slice(0, 3);
  if (peers.length === 0) return;
  for (const p of peers) {
    p.agitation = clamp(p.agitation + 6, 0, 100);
    p.morale = clamp(p.morale - 2, 0, 100);
  }
  logEvent(state, {
    category: 'event',
    code: 'wage.parity',
    message: `${star.name}'s new deal ripples through the dressing room — ${peers.map((p) => p.name).join(', ')} want their own terms brought up to the market`,
    data: { playerId: star.id, clubId: star.club, peers: peers.map((p) => p.id) },
  });
}

// ── Consequence application ──────────────────────────────────────────────────

export function applyConsequence(state: GameState, c: Consequence): void {
  switch (c.kind) {
    case 'morale': {
      if (c.playerId) {
        const p = state.players[c.playerId];
        if (p) p.morale = clamp(p.morale + (c.amount ?? 0), 0, 100);
      } else if (c.clubId) {
        for (const id of state.clubs[c.clubId]?.squad ?? []) {
          const p = state.players[id];
          if (p) p.morale = clamp(p.morale + (c.amount ?? 0), 0, 100);
        }
      }
      break;
    }
    case 'money': {
      const club = c.clubId ? state.clubs[c.clubId] : undefined;
      if (club) club.finances.transferBudget = Math.max(0, club.finances.transferBudget + (c.amount ?? 0));
      break;
    }
    case 'ability': {
      const p = c.playerId ? state.players[c.playerId] : undefined;
      if (p) p.ability = clamp(p.ability + (c.amount ?? 0), 20, 99);
      break;
    }
    case 'boardPatience':
      state.board.patience = clamp(state.board.patience + (c.amount ?? 0), 0, 100);
      break;
    case 'fanTrust':
      // Fan trust is tracked as narrative memory and nudges board patience.
      state.board.patience = clamp(state.board.patience + (c.amount ?? 0), 0, 100);
      appendMemory(state, c.tag ?? 'fan-trust', c.text ?? 'Fan trust shifted.');
      break;
    case 'managerRelationship':
      state.managerRelations.relationshipWithUser = clamp(
        state.managerRelations.relationshipWithUser + (c.amount ?? 0),
        0,
        100,
      );
      break;
    case 'agitation': {
      const p = c.playerId ? state.players[c.playerId] : undefined;
      if (p) {
        p.agitation = clamp(p.agitation + (c.amount ?? 0), 0, 100);
        p.morale = clamp(p.morale - Math.round((c.amount ?? 0) / 3), 0, 100);
      }
      break;
    }
    case 'transferOut': {
      if (c.playerId && c.clubId) {
        // Guarantee the buyer can fund the move at EXECUTION time. A sanctioned
        // real sale is offered with the buyer's budget bumped, but the buyer may
        // spend it on its other same-window real signings before the user acts
        // (Chelsea buying Shevchenko before you sanction Cole→Chelsea) — so
        // re-fund here, symmetric with signReal, or the real move silently fails
        // and any deal it enables (the Cole↔Gallas swap) wrongly cancels.
        const buyer = state.clubs[c.clubId];
        if (buyer && c.amount) buyer.finances.transferBudget = Math.max(buyer.finances.transferBudget, c.amount);
        const res = executeTransfer(state, { playerId: c.playerId, toClub: c.clubId, fee: c.amount ?? 0 }, { reality: true });
        if (res.ok) markLedgerRealized(state, c.tag);
      }
      break;
    }
    case 'sellAbroad': {
      // Sell a player OUT of the modelled world (China/Saudi/MLS market window):
      // pull him from his club's squad, credit the fee, and park him at the
      // non-league market sentinel (`clubId`, e.g. 'china'). His departure is a
      // real squad change, so recompute the seller's strength.
      if (c.playerId) {
        const p = state.players[c.playerId];
        if (p && p.club) {
          const seller = state.clubs[p.club];
          if (seller) {
            seller.squad = seller.squad.filter((id) => id !== p.id);
            seller.finances.transferBudget += c.amount ?? 0;
            p.club = c.clubId ?? 'abroad';
            recomputeClubStrength(state, seller.id);
          }
        }
      }
      break;
    }
    case 'signReal': {
      // A real incoming signing the club genuinely made: the board backs it (topped up
      // to the fee) so reality-default reproduces history — many real signings were
      // funded by revenue or owner money, not sales (United's £59.7m Di María), so the
      // real ledger cannot be gated on the user balancing the books. The DISCRETIONARY
      // budget (his real net spend × financial strength) is the room he has to go
      // BEYOND history, and THAT is what selling players grows.
      if (c.playerId) {
        const user = state.clubs[state.playerClub];
        if (user) user.finances.transferBudget = Math.max(user.finances.transferBudget, c.amount ?? 0);
        const res = executeTransfer(state, { playerId: c.playerId, toClub: state.playerClub, fee: c.amount ?? 0 }, { reality: true });
        if (res.ok) markLedgerRealized(state, c.tag);
      }
      break;
    }
    case 'renewContract': {
      // Extend a player's deal by `amount` years from the current season, keeping
      // him off a free transfer. Priced into the wage bill via a modest rise.
      if (c.playerId) {
        const p = state.players[c.playerId];
        if (p) {
          const year = parseYearMonth(state.clock.date).year;
          p.contractUntil = Math.max(p.contractUntil, year + Math.max(1, c.amount ?? 3));
          // A new deal keeps up with the market: at least a 10% rise, and — once the
          // Director has begun reshaping the world — never below the going rate for
          // his ability at today's inflated wages, so renewing a man who has fallen
          // behind brings him up to scratch. A passive, reality-default world keeps
          // its real wage history (the plain rise), so the calibration is untouched.
          const bumped = Math.round(p.wage * 1.1);
          p.wage = divergenceFactor(state) > 0 ? Math.max(bumped, suggestWage(p, year)) : bumped;
          p.letLapse = false; // a renewal reverses any decision to let him walk
          // Give a key man a lucrative new deal and the dressing room takes note —
          // his comparable peers want their own terms brought up to the market.
          applyWageParityRipple(state, p.id);
        }
      }
      break;
    }
    case 'letContractLapse': {
      // The Director elects NOT to renew: flag him to walk on a free when his deal
      // actually runs out (window phase 2). His contract is left as it is — he runs
      // it DOWN, he isn't torn up early — so a man with years left stays until they
      // expire, and only one already at the end walks this summer.
      if (c.playerId) {
        const p = state.players[c.playerId];
        if (p) p.letLapse = true;
      }
      break;
    }
    case 'changeFormation':
      // The coach switches shape. His preference doesn't change — only what he
      // fields — so a reluctant switch can drift back later if unhappy.
      if (c.formation) state.managerRelations.activeFormation = c.formation;
      break;
    case 'deductPoints': {
      // A governance sanction: dock league points from the club's live standings.
      const club = c.clubId ? state.clubs[c.clubId] : undefined;
      const league = club?.leagueId ? state.leagues[club.leagueId] : undefined;
      const rec = league && c.clubId ? league.standings[c.clubId] : undefined;
      if (rec) rec.points = Math.max(0, rec.points - (c.amount ?? 0));
      break;
    }
    case 'ban': {
      // A player sidelined for N months (an injury-class absence, or a suspension).
      // Modelled as an injury so the squad actually loses him — his strength drops out
      // and he's unavailable — rather than the consequence silently doing nothing.
      const p = c.playerId ? state.players[c.playerId] : undefined;
      if (p) {
        const months = Math.max(1, c.months ?? 1);
        const kind = months >= 6 ? 'serious' : months >= 2 ? 'moderate' : 'minor';
        p.injury = { kind, monthsRemaining: months, since: state.clock.date };
        if (kind === 'serious') p.injuryHistory += 1;
        if (p.club) recomputeClubStrength(state, p.club);
      }
      break;
    }
    case 'rivalReplace': {
      // A rival the Director denied a real signing (he KEPT the man they were due to
      // buy) reacts like any deprived club: to the finite market for the best available
      // alternative, a notch below — explicable, not a reattach-by-default.
      const club = c.clubId ? state.clubs[c.clubId] : undefined;
      const lost = c.playerId ? state.players[c.playerId] : undefined;
      if (club && lost) reactToLoss(state, club, lost);
      break;
    }
    case 'memory':
      appendMemory(state, c.tag ?? 'event', c.text ?? '');
      break;
    case 'log':
      logEvent(state, { category: 'event', code: 'event.note', message: c.text ?? '' });
      break;
  }
}

/** A ledger-linked reality-default move that actually executed marks its entry
 *  realized, so dependents (`enabledBy`) know the funding move really happened. */
function markLedgerRealized(state: GameState, tag: string | undefined): void {
  if (tag?.startsWith('ledger:')) {
    const key = tag.slice('ledger:'.length);
    if (!state.meta.realizedLedger.includes(key)) state.meta.realizedLedger.push(key);
  }
}

function applyConsequences(state: GameState, cs: Consequence[] | undefined): void {
  for (const c of cs ?? []) applyConsequence(state, c);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ── Decisions ────────────────────────────────────────────────────────────────

/** Apply the fallout of any decisions left unresolved, then clear them. Called
 *  when the sim advances past an interrupt the player chose not to handle. */
export function resolveIgnoredDecisions(state: GameState): void {
  for (const d of state.pendingDecisions) {
    applyConsequences(state, d.falloutIfIgnored);
    logEvent(state, {
      category: d.category ?? 'decision',
      code: 'decision.ignored',
      message: `Ignored: ${d.title}`,
      data: { decisionId: d.id },
    });
  }
  state.pendingDecisions = [];
}

/**
 * Resolve any still-open real-transfer decisions involving the user's club to
 * their reality-default (the sale sanctioned / the signing completed), WITHOUT
 * touching other pending decisions. Called at the window deadline so a real move
 * the user left open realises in-window — which lets its dependent transfer
 * chain (a sale that FUNDS an onward sale) settle the same window instead of
 * deferring to the next. A move the user actively DECLINED earlier in the window
 * is already gone from the queue, so its chain stays broken.
 */
export function resolvePendingLedgerDecisions(state: GameState): void {
  const kept: typeof state.pendingDecisions = [];
  const ledgerDecisions: typeof state.pendingDecisions = [];
  for (const d of state.pendingDecisions) {
    if (d.id.startsWith('real-in:') || d.id.startsWith('real-out:')) ledgerDecisions.push(d);
    else kept.push(d);
  }
  // Resolve SALES (real-out) before BUYS (real-in): the summer's outgoings must bank
  // their fees before the incomings draw on them, or a passive reproduction of a real
  // sell-to-buy window could fail a buy for want of the sale that funds it. With the
  // net-spend budget model the chest only covers the buys once the sales land.
  ledgerDecisions.sort((a, b) => (a.id.startsWith('real-out:') ? 0 : 1) - (b.id.startsWith('real-out:') ? 0 : 1));
  for (const d of ledgerDecisions) applyConsequences(state, d.falloutIfIgnored);
  state.pendingDecisions = kept;
}

export interface DecisionResult {
  state: GameState;
  events: LoggedEvent[];
  success: boolean;
}

/**
 * Resolve a pending decision by choosing one of its options. The outcome is
 * uncertain — `successProbability` is rolled on a deterministic stream — and the
 * matching consequences apply. Pure over GameState.
 */
export function applyDecision(state: GameState, decisionId: string, choiceId: string): DecisionResult {
  const draft = cloneState(state);
  const startSeq = draft.meta.nextSeq;
  const idx = draft.pendingDecisions.findIndex((d) => d.id === decisionId);
  if (idx === -1) {
    logEvent(draft, { category: 'decision', code: 'decision.unknown', message: `No pending decision ${decisionId}` });
    return { state: draft, events: eventsSince(draft, startSeq), success: false };
  }
  const decision = draft.pendingDecisions[idx]!;
  const choice = decision.choices.find((ch) => ch.id === choiceId);
  if (!choice) {
    logEvent(draft, { category: 'decision', code: 'decision.badchoice', message: `No choice ${choiceId}` });
    return { state: draft, events: eventsSince(draft, startSeq), success: false };
  }

  const rng = new Rng(draft.meta.rngState).fork(`decision:${decisionId}:${choiceId}`);
  const success = choice.successProbability === undefined ? true : rng.chance(choice.successProbability);
  applyConsequences(draft, success ? choice.onSuccess : choice.onFailure);
  for (const tag of decision.memoryTags ?? []) appendMemory(draft, tag, `${decision.title}: ${choice.label}`);

  draft.pendingDecisions.splice(idx, 1);
  logEvent(draft, {
    category: decision.category ?? 'decision',
    code: 'decision.resolved',
    message: `${decision.title} → ${choice.label} (${success ? 'success' : 'failure'})`,
    data: { decisionId, choiceId, success },
  });

  return { state: draft, events: eventsSince(draft, startSeq), success };
}

// ── Scandals (§9d) ───────────────────────────────────────────────────────────

const SCANDAL_BASE = 0.0026;

function scandalProbability(player: PlayerState, scandalFrequency: number): number {
  const per = player.personality;
  const p =
    SCANDAL_BASE *
    (0.35 + per.volatility / 10) *
    ((11 - per.professionalism) / 6) *
    scandalFrequency;
  return clamp(p, 0, 0.05);
}

const SCANDAL_KINDS = ['a training-ground bust-up', 'an off-field media storm', 'a disciplinary breach'];

function scandalDecision(state: GameState, player: PlayerState): Decision {
  const kind = state && SCANDAL_KINDS[Math.abs(hashCode(player.id)) % SCANDAL_KINDS.length];
  return {
    id: `scandal:${player.id}:${state.clock.date}`,
    title: `Media storm: ${player.name}`,
    description: `${player.name} is embroiled in ${kind}. The press are circling and the dressing room is watching how you respond.`,
    interrupt: true,
    clubId: player.club ?? undefined,
    category: 'scandal',
    choices: [
      {
        id: 'back',
        label: 'Back him publicly',
        successProbability: 0.55,
        onSuccess: [{ kind: 'morale', playerId: player.id, amount: 6 }, { kind: 'memory', tag: 'scandal', text: `Stood by ${player.name}.` }],
        onFailure: [{ kind: 'fanTrust', amount: -6, text: `Fans unhappy you shielded ${player.name}.` }, { kind: 'morale', clubId: player.club ?? undefined, amount: -3 }],
      },
      {
        id: 'discipline',
        label: 'Fine and discipline him',
        successProbability: 0.75,
        onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'morale', playerId: player.id, amount: -4 }],
        onFailure: [{ kind: 'morale', playerId: player.id, amount: -10 }, { kind: 'managerRelationship', amount: -4 }],
      },
    ],
    falloutIfIgnored: [{ kind: 'fanTrust', amount: -5, text: `You let the ${player.name} story fester.` }, { kind: 'morale', clubId: player.club ?? undefined, amount: -4 }],
    memoryTags: ['scandal', player.id],
  };
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function rollScandals(state: GameState, rng: Rng): void {
  // Procedural scandals are OFF-SCRIPT drama, and the reality-default holds them
  // back: real disciplinary sagas of a given era are told as scripted history, so
  // an on-script world should not be inventing its own. They are therefore gated on
  // divergence — ~0 while the user is still following history (a passive save, or
  // the opening seasons before butterflies compound) and rising only as the world
  // frays (§9f). An extra early-seasons ramp keeps the first year or two quiet even
  // for an aggressive start, so "the early years follow reality" holds.
  const year = Number(state.clock.date.slice(0, 4));
  const seasonsIn = Math.max(0, year - state.meta.startYear);
  const earlyRamp = Math.min(1, seasonsIn / 3); // 0 in the opening season, full by season 3
  const gate = divergenceFactor(state) * earlyRamp;
  const scandalFrequency = state.settings.scandalFrequency * gate;
  for (const club of Object.values(state.clubs)) {
    if (club.leagueId === null) continue; // simulated clubs only
    for (const id of club.squad) {
      const player = state.players[id];
      if (!player || player.injury) continue;
      // One main-stream draw per player regardless of the gate, so calibration's
      // RNG stream is byte-identical whatever the scandal rate; all fallout runs on
      // a forked stream (fork does not consume the parent).
      if (!rng.chance(scandalProbability(player, scandalFrequency))) continue;

      const isUser = club.id === state.playerClub;
      logEvent(state, {
        category: 'scandal',
        code: 'scandal.fired',
        message: `Scandal involving ${player.name} (${club.name})`,
        data: { clubId: club.id, playerId: player.id, significant: true, user: isUser },
      });

      if (isUser) {
        // Surface as an interrupt for the player to navigate.
        state.pendingDecisions.push(scandalDecision(state, player));
      } else {
        // AI clubs navigate it themselves — a morale hit and occasional board fallout.
        player.morale = clamp(player.morale - rng.fork(`scandal:${player.id}`).int(3, 9), 0, 100);
      }
    }
  }
}

// ── Scripted historical events (§9b) — Man Utd 1999 flagship pack ────────────

interface ScriptedEvent {
  id: string;
  date: string; // YearMonth it fires
  /** Scenarios this event belongs to. An event is only ever processed for its own
   *  scenario — so a different scenario never logs a spurious `scripted.skipped`
   *  for it (which would wrongly count against zero-divergence fidelity). */
  scenarios: string[];
  /** Precondition (divergence check): usually a curated player still at his club. */
  requires: (state: GameState) => boolean;
  build: (state: GameState) => Decision;
}

function playerAt(state: GameState, playerId: string, clubId: string): boolean {
  return state.players[playerId]?.club === clubId;
}

const MAN_UTD_1999_PACK: ScriptedEvent[] = [
  {
    id: 'keane-contract',
    date: '1999-12',
    scenarios: ['man-utd-1999'],
    requires: (s) => playerAt(s, 'cur_keane', 'man_utd') && s.playerClub === 'man_utd',
    build: (s) => ({
      id: 'scripted:keane-contract',
      title: 'Roy Keane holds out for a landmark contract',
      description: 'Your captain, out of contract soon, wants to become the best-paid player in the country. Break the wage structure, or risk losing him.',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'pay',
          label: 'Smash the wage structure to keep him',
          successProbability: 0.9,
          // He signs the landmark deal — the real outcome, staying to ~2005.
          onSuccess: [{ kind: 'renewContract', playerId: 'cur_keane', amount: 6 }, { kind: 'morale', playerId: 'cur_keane', amount: 10 }, { kind: 'money', clubId: 'man_utd', amount: -3_000_000 }],
          onFailure: [{ kind: 'morale', clubId: 'man_utd', amount: -3 }],
        },
        {
          id: 'hold',
          label: 'Hold firm on the structure',
          successProbability: 0.4,
          // Hold firm and he settles for a straight deal anyway; fail and he's
          // alienated, runs the clock down and leaves on a free in 2000 (divergence).
          onSuccess: [{ kind: 'renewContract', playerId: 'cur_keane', amount: 6 }, { kind: 'boardPatience', amount: 5 }],
          onFailure: [{ kind: 'morale', playerId: 'cur_keane', amount: -14 }, { kind: 'managerRelationship', amount: -6 }],
        },
      ],
      // Reality-default: ignoring the saga still ends with him signing (he did),
      // but the messy public standoff dents the dressing room.
      falloutIfIgnored: [{ kind: 'renewContract', playerId: 'cur_keane', amount: 6 }, { kind: 'morale', playerId: 'cur_keane', amount: -10 }],
      memoryTags: ['contract', 'cur_keane'],
    }),
  },
  {
    id: 'stam-exit',
    date: '2001-08',
    scenarios: ['man-utd-1999'],
    requires: (s) => playerAt(s, 'cur_stam', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:stam-exit',
      title: 'The manager wants to sell Jaap Stam',
      description: 'After the "Head to Head" book fallout, the manager is agitating to cash in on Stam while his value holds. Your best centre-back — back the boss, or overrule him?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'sell',
          label: 'Back the manager and sell',
          successProbability: 0.5,
          onSuccess: [{ kind: 'money', clubId: 'man_utd', amount: 16_000_000 }, { kind: 'managerRelationship', amount: 6 }],
          onFailure: [{ kind: 'fanTrust', amount: -8, text: 'Selling Stam looks a huge mistake.' }],
        },
        {
          id: 'keep',
          label: 'Overrule him and keep Stam',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_stam', amount: 6 }],
          onFailure: [{ kind: 'managerRelationship', amount: -10 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: -5 }],
      memoryTags: ['manager', 'cur_stam'],
    }),
  },
  {
    id: 'beckham-boot',
    date: '2003-02',
    scenarios: ['man-utd-1999'],
    requires: (s) => playerAt(s, 'cur_beckham', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:beckham-boot',
      title: 'Dressing-room rift: the flying boot',
      description: 'A post-match row between the manager and David Beckham has spilled into the press. The relationship is fracturing — manage the fallout.',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'mediate',
          label: 'Mediate between them',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: 'cur_beckham', amount: 6 }, { kind: 'managerRelationship', amount: 3 }],
          onFailure: [{ kind: 'morale', playerId: 'cur_beckham', amount: -8 }, { kind: 'managerRelationship', amount: -6 }],
        },
        {
          id: 'sideWithManager',
          label: 'Side with the manager',
          successProbability: 0.7,
          onSuccess: [{ kind: 'managerRelationship', amount: 8 }],
          onFailure: [{ kind: 'morale', playerId: 'cur_beckham', amount: -12 }, { kind: 'fanTrust', amount: -5, text: 'Fans side with Beckham.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_beckham', amount: -8 }, { kind: 'managerRelationship', amount: -4 }],
      memoryTags: ['manager', 'cur_beckham'],
    }),
  },
  {
    id: 'utd-club-world-championship',
    // The withdrawal bit in Dec 1999 (United skipped the FA Cup third round to
    // prepare for January's tournament in Brazil) — fire the decision then.
    date: '1999-12',
    scenarios: ['man-utd-1999'],
    requires: (s) => s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:utd-club-world-championship',
      title: 'Brazil, or defend the FA Cup?',
      description:
        'The FA wants you in Brazil for FIFA’s inaugural Club World Championship — which means withdrawing as holders from the FA Cup. Reality: United flew to Brazil, flopped in the group stage, and took heavy criticism for abandoning the Cup. Go, or defend the trophy?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'brazil',
          label: 'Fly to Brazil (as reality did)',
          successProbability: 0.35,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'world', text: 'Went to Brazil for the Club World Championship and salvaged some credit.' }],
          onFailure: [{ kind: 'fanTrust', amount: -5, text: 'Abandoning the FA Cup for a flop in Brazil sours the support.' }],
        },
        {
          id: 'defend-cup',
          label: 'Stay and defend the FA Cup',
          successProbability: 0.55,
          onSuccess: [{ kind: 'fanTrust', amount: 6, text: 'Defied the FA to defend the Cup — the fans love it.' }, { kind: 'memory', tag: 'world', text: 'Kept United in the FA Cup instead of flying to Brazil.' }],
          onFailure: [{ kind: 'boardPatience', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -4, text: 'United withdrew from the FA Cup for the Club World Championship and flopped.' }, { kind: 'memory', tag: 'world', text: 'Withdrew as FA Cup holders to play in Brazil — and came home early.' }],
      memoryTags: ['world'],
    }),
  },
  {
    id: 'rvn-knee',
    date: '2000-04',
    scenarios: ['man-utd-1999'],
    // On-script only while van Nistelrooy (cur_ruud, at PSV) is NOT yet a United
    // player — the real deal collapsed on the medical in 2000, a year before he signed.
    requires: (s) => s.playerClub === 'man_utd' && s.players['cur_ruud']?.club !== 'man_utd',
    build: () => ({
      id: 'scripted:rvn-knee',
      title: 'Van Nistelrooy fails the medical',
      description:
        'The deal for the PSV striker is agreed — then the medical flags his knee. Reality: United pulled out, he ruptured the cruciate days later, and they waited a year to sign him fit in 2001. Gamble on him now, or hold your nerve?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'gamble',
          label: 'Sign him anyway, bad knee and all',
          successProbability: 0.4,
          onSuccess: [{ kind: 'signReal', playerId: 'cur_ruud', clubId: 'man_utd' }, { kind: 'memory', tag: 'transfer', text: 'Gambled on van Nistelrooy’s knee a year early — and it held.' }],
          onFailure: [{ kind: 'ban', playerId: 'cur_ruud', months: 10 }, { kind: 'money', clubId: 'man_utd', amount: -18_000_000 }, { kind: 'fanTrust', amount: -6, text: 'The knee went. £18m on the treatment table.' }],
        },
        {
          id: 'wait',
          label: 'Pull out and wait (as reality did)',
          successProbability: 0.9,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Held nerve on the medical; re-signed him fit a year on.' }],
          onFailure: [],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'The deal collapsed on the medical; he ruptured the cruciate and arrived a year late.' }],
      memoryTags: ['transfer', 'cur_ruud'],
    }),
  },
  {
    id: 'ferguson-u-turn',
    date: '2001-12',
    scenarios: ['man-utd-1999'],
    // On-script only while Ferguson is still the manager — a Director who already
    // changed the dugout has written this succession drama out of history.
    requires: (s) => s.playerClub === 'man_utd' && s.managerRelations.identity === 'Alex Ferguson',
    build: () => ({
      id: 'scripted:ferguson-u-turn',
      title: 'Ferguson signals he will retire — then wavers',
      description:
        'Your manager announced he would step down at season’s end, and successors are being sounded out (Sven-Göran Eriksson was courted). Now he is wavering. Reality: he reversed the decision in Feb 2002 and stayed on for another decade. Line up the succession, or convince him to stay?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'persuade',
          label: 'Convince him to stay (as reality did)',
          successProbability: 0.85,
          onSuccess: [{ kind: 'managerRelationship', amount: 10 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'manager', text: 'Talked Ferguson out of retirement — the dynasty rolls on.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -6 }],
        },
        {
          id: 'succeed',
          label: 'Let him go and line up a successor',
          successProbability: 0.45,
          onSuccess: [{ kind: 'memory', tag: 'manager', text: 'Began the search for the post-Ferguson era early.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -14 }, { kind: 'fanTrust', amount: -8, text: 'Pushing Ferguson towards the door outrages the support.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Ferguson reversed his retirement call and stayed on.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'keane-saipan',
    date: '2002-05',
    scenarios: ['man-utd-1999'],
    requires: (s) => playerAt(s, 'cur_keane', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:keane-saipan',
      title: 'Keane sent home from the World Cup',
      description:
        'Your captain’s bust-up with Mick McCarthy has seen him sent home from Ireland’s World Cup camp — a global story rebounding on the club. Reality: Keane returned, unrepentant. Back him publicly, or stay out of an international row?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'back',
          label: 'Back your captain publicly',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_keane', amount: 8 }, { kind: 'managerRelationship', amount: 3 }],
          onFailure: [{ kind: 'fanTrust', amount: -4, text: 'Wading into the Saipan row drags the club into the mess.' }],
        },
        {
          id: 'stayout',
          label: 'Stay out of it',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 2 }],
          onFailure: [{ kind: 'morale', playerId: 'cur_keane', amount: -6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'fallout', text: 'Keane came home from Saipan; the club rode out the storm.' }],
      memoryTags: ['fallout', 'cur_keane'],
    }),
  },
  {
    id: 'ronaldinho-or-cristiano',
    date: '2003-07',
    scenarios: ['man-utd-1999'],
    requires: (s) => s.playerClub === 'man_utd' && s.players['cur_cristiano']?.club !== 'man_utd',
    build: () => ({
      id: 'scripted:ronaldinho-or-cristiano',
      title: 'The marquee or the teenager',
      description:
        'With Beckham sold to Real Madrid, the summer’s move is a Brazilian playmaker (Ronaldinho was chased) — or a bet on the 18-year-old winger who tormented you in a friendly. Reality: United missed Ronaldinho (he went to Barça) and signed Cristiano Ronaldo instead. Chase the finished star, or gamble on the kid?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'teenager',
          label: 'Bet on the 18-year-old (as reality did)',
          successProbability: 0.9,
          onSuccess: [{ kind: 'signReal', playerId: 'cur_cristiano', clubId: 'man_utd' }, { kind: 'memory', tag: 'transfer', text: 'Signed the teenage Ronaldo — the bet of the decade.' }],
          onFailure: [],
        },
        {
          id: 'marquee',
          label: 'Chase the marquee Brazilian instead',
          successProbability: 0.35,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Landed the marquee playmaker — but the teenager got away.' }, { kind: 'fanTrust', amount: 4 }],
          onFailure: [{ kind: 'memory', tag: 'transfer', text: 'Missed the Brazilian AND passed on the teenager — the summer slipped away.' }, { kind: 'fanTrust', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'signReal', playerId: 'cur_cristiano', clubId: 'man_utd' }, { kind: 'memory', tag: 'transfer', text: 'Missed Ronaldinho, signed the teenage Cristiano Ronaldo.' }],
      memoryTags: ['transfer', 'cur_cristiano'],
    }),
  },
  {
    id: 'ferdinand-drug-test',
    date: '2003-09',
    scenarios: ['man-utd-1999'],
    requires: (s) => playerAt(s, 'cur_ferdinand', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:ferdinand-drug-test',
      title: 'Ferdinand misses a drug test',
      description:
        'Your first-choice centre-back failed to attend a routine drug test. Reality: he was banned eight months from January 2004 — a season-defining blow. Fight the charge, or accept the discipline and plan around his absence?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'appeal',
          label: 'Back him and fight the charge',
          successProbability: 0.25,
          onSuccess: [{ kind: 'memory', tag: 'scandal', text: 'The appeal softened the sanction.' }, { kind: 'morale', playerId: 'cur_ferdinand', amount: 6 }],
          onFailure: [{ kind: 'ban', playerId: 'cur_ferdinand', months: 8 }, { kind: 'fanTrust', amount: -4, text: 'The failed appeal drags the club through the press.' }],
        },
        {
          id: 'accept',
          label: 'Accept the ban and move on',
          successProbability: 0.9,
          onSuccess: [{ kind: 'ban', playerId: 'cur_ferdinand', months: 8 }, { kind: 'boardPatience', amount: 3 }],
          onFailure: [{ kind: 'ban', playerId: 'cur_ferdinand', months: 8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'ban', playerId: 'cur_ferdinand', months: 8 }, { kind: 'morale', clubId: 'man_utd', amount: -5 }],
      memoryTags: ['scandal', 'cur_ferdinand'],
    }),
  },
  {
    id: 'rooney-record',
    date: '2004-08',
    scenarios: ['man-utd-1999'],
    // Rooney is not a curated player in this world, so this is a club+date beat with
    // narrative consequences (no signReal on a non-existent id).
    requires: (s) => s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:rooney-record',
      title: 'A record fee for an 18-year-old',
      description:
        'Everton’s teenage forward lit up Euro 2004, and the fee is a world record for a teenager (~£25.6m). Reality: United paid it and Wayne Rooney became a generational signing. Pay up, or balk at the price for a kid?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'pay',
          label: 'Pay the record fee (as reality did)',
          successProbability: 0.85,
          onSuccess: [{ kind: 'money', clubId: 'man_utd', amount: -25_600_000 }, { kind: 'fanTrust', amount: 6, text: 'Smashed the teenage transfer record for Rooney — a statement of intent.' }, { kind: 'memory', tag: 'transfer', text: 'Signed the 18-year-old Rooney for a record fee.' }],
          onFailure: [{ kind: 'money', clubId: 'man_utd', amount: -25_600_000 }],
        },
        {
          id: 'pass',
          label: 'Balk at the price',
          successProbability: 0.4,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Passed on the record teenage fee and kept the powder dry.' }],
          onFailure: [{ kind: 'fanTrust', amount: -6, text: 'Letting the country’s brightest teenager go elsewhere stings.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'money', clubId: 'man_utd', amount: -25_600_000 }, { kind: 'memory', tag: 'transfer', text: 'United paid a record teenage fee for Wayne Rooney.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'pizzagate',
    date: '2004-10',
    scenarios: ['man-utd-1999'],
    requires: (s) => s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:pizzagate',
      title: 'The Battle of the Buffet',
      description:
        'Your side has just ended Arsenal’s 49-game unbeaten run — and the tunnel has erupted, with pizza thrown at your manager. Reality: the fracas became folklore and fired the rivalry. Escalate the mind-games, or take the high road?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'escalate',
          label: 'Escalate the mind-games',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', clubId: 'man_utd', amount: 4 }, { kind: 'memory', tag: 'world', text: 'Won the war of words after the Battle of the Buffet.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
        {
          id: 'highroad',
          label: 'Take the high road',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'world', text: 'Rose above the tunnel fracas and let the win do the talking.' }],
          onFailure: [],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'world', text: 'United ended Arsenal’s 49-game unbeaten run; pizza flew in the tunnel.' }],
      memoryTags: ['world'],
    }),
  },
  {
    id: 'glazer-takeover',
    date: '2005-05',
    scenarios: ['man-utd-1999'],
    requires: (s) => s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:glazer-takeover',
      title: 'The Glazers’ leveraged takeover',
      description:
        'A leveraged buyout is loading debt onto the club and the fans are in open revolt (FC United of Manchester will form in protest). Reality: the takeover completed and the debt stayed for a generation. You have no vote — but how you position the club shapes the fallout.',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'reassure',
          label: 'Reassure the dressing room, insulate football from the boardroom',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', clubId: 'man_utd', amount: 4 }, { kind: 'memory', tag: 'ownership', text: 'Shielded the squad from the takeover noise.' }],
          onFailure: [{ kind: 'morale', clubId: 'man_utd', amount: -3 }],
        },
        {
          id: 'sidewithfans',
          label: 'Side publicly with the fan protest',
          successProbability: 0.4,
          onSuccess: [{ kind: 'fanTrust', amount: 8, text: 'The support rallies to a Director who stood with them.' }, { kind: 'boardPatience', amount: -8 }],
          onFailure: [{ kind: 'boardPatience', amount: -15 }, { kind: 'memory', tag: 'ownership', text: 'Picking a fight with the new owners burned boardroom capital.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -6, text: 'The debt-loaded takeover completes; a splinter club forms in protest.' }, { kind: 'memory', tag: 'ownership', text: 'The Glazers’ leveraged buyout completed.' }],
      memoryTags: ['ownership'],
    }),
  },
  {
    id: 'keane-mutv-exit',
    date: '2005-11',
    scenarios: ['man-utd-1999'],
    requires: (s) => playerAt(s, 'cur_keane', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:keane-mutv-exit',
      title: 'Keane’s MUTV interview',
      description:
        'Your captain recorded a club-TV interview savaging his teammates; it was pulled before broadcast, but the damage is done. Reality: it was the final straw — Keane left by mutual consent in November 2005, joining Celtic, ending an era. Back the split, or fight to keep him?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'split',
          label: 'Agree the split (as reality did)',
          successProbability: 0.8,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_keane', clubId: 'celtic', amount: 0 }, { kind: 'managerRelationship', amount: 4 }, { kind: 'memory', tag: 'fallout', text: 'Keane left by mutual consent for Celtic — the end of an era.' }],
          onFailure: [{ kind: 'transferOut', playerId: 'cur_keane', clubId: 'celtic', amount: 0 }],
        },
        {
          id: 'keep',
          label: 'Fight to keep the captain',
          successProbability: 0.35,
          onSuccess: [{ kind: 'morale', playerId: 'cur_keane', amount: 6 }, { kind: 'memory', tag: 'fallout', text: 'Talked Keane down and kept the captain — for now.' }],
          onFailure: [{ kind: 'transferOut', playerId: 'cur_keane', clubId: 'celtic', amount: 0 }, { kind: 'managerRelationship', amount: -6 }, { kind: 'morale', clubId: 'man_utd', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'transferOut', playerId: 'cur_keane', clubId: 'celtic', amount: 0 }, { kind: 'memory', tag: 'fallout', text: 'Keane and United parted by mutual consent; he joined Celtic.' }],
      memoryTags: ['fallout', 'cur_keane'],
    }),
  },
];

/** Liverpool 2001 (Houllier era). */
const LIVERPOOL_2001_PACK: ScriptedEvent[] = [
  {
    id: 'houllier-heart',
    date: '2001-10',
    scenarios: ['liverpool-2001'],
    // Tied to Houllier actually being in post — if the Director has already
    // parted with him (divergence), the real health crisis never happens.
    requires: (s) => s.playerClub === 'liverpool' && s.managerRelations.identity === 'Gérard Houllier',
    build: () => ({
      id: 'scripted:houllier-heart',
      title: 'Gérard Houllier taken seriously ill',
      description:
        'Your manager has been rushed to hospital with a heart problem and undergone major surgery — he will be out for months. His assistant can steer the club in his absence. How do you steady the ship?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'caretaker',
          label: 'Back his assistant as caretaker and hold his job open',
          successProbability: 0.75,
          onSuccess: [
            { kind: 'morale', clubId: 'liverpool', amount: 4 },
            { kind: 'boardPatience', amount: 5 },
            { kind: 'memory', tag: 'manager', text: 'Held Houllier’s job open; the squad rallied behind the caretaker.' },
          ],
          onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -3 }],
        },
        {
          id: 'replace',
          label: 'Start the search for a permanent replacement',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 2 }],
          onFailure: [
            { kind: 'managerRelationship', amount: -20 },
            { kind: 'fanTrust', amount: -10, text: 'Moving on a sick manager appals the fans.' },
          ],
        },
      ],
      // Reality-default: the club stands by him and he recovers to return.
      falloutIfIgnored: [{ kind: 'morale', clubId: 'liverpool', amount: 3 }],
      memoryTags: ['manager'],
    }),
  },
  // Houllier's peak and decline into the Benítez–Istanbul years. Fowler out, Riise
  // and Diouf in, Owen out, Xabi Alonso in are ledger-replayed → narrative overlays;
  // Luis García's 2004 arrival is NOT in the ledger, so that beat signs him for real.
  {
    id: 'treble-afterglow',
    // Riise (bible 2001-06) arrives in the opening window; fold the "treble
    // afterglow" super-cup colour into the first post-kickoff month.
    date: '2001-08',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:treble-afterglow',
      title: 'Treble afterglow — and Riise arrives',
      description:
        'Fresh off the 2001 cup treble, you add the rocket-shooting John Arne Riise from Monaco and pick up the Charity Shield and UEFA Super Cup. Reality: momentum and belief, but a squad that still needed to convert cups into a title. Ride the feel-good factor and push for the league, or temper expectations and build quietly?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'push',
          label: 'Ride the momentum — go for the league',
          successProbability: 0.65,
          onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Treble afterglow and Riise in — belief surges at Anfield.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'temper',
          label: 'Temper expectations and build',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'silverware', text: 'Kept feet on the ground after the treble.' }],
          onFailure: [{ kind: 'fanTrust', amount: -2 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'silverware', text: 'Riise arrives and the cups keep coming in the treble afterglow.' }],
      memoryTags: ['silverware', 'cur_riise01'],
    }),
  },
  {
    id: 'fowler-to-leeds',
    date: '2001-11',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:fowler-to-leeds',
      title: 'Selling God — Fowler to Leeds',
      description:
        'Robbie Fowler — "God" to the Kop — has fallen down the pecking order behind Owen and Heskey, and Leeds are offering big money. Reality: Houllier sold the icon, a hugely divisive call with the fans. Cash in on the fading legend, or keep a talisman the terraces worship?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'sell',
          label: 'Cash in (as reality did)',
          successProbability: 0.6,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Sold Fowler to Leeds — pragmatic, and painful for the Kop.' }],
          onFailure: [{ kind: 'fanTrust', amount: -5, text: 'Selling God does not go down well.' }],
        },
        {
          id: 'keep',
          label: 'Keep the Kop’s idol',
          successProbability: 0.5,
          onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'Kept Fowler — the terraces are grateful.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -3, text: 'Fowler, "God" to the Kop, is sold to Leeds.' }, { kind: 'memory', tag: 'transfer', text: 'Robbie Fowler sold to Leeds United.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'runners-up-2002',
    date: '2002-05',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:runners-up-2002',
      title: '80 points — so close to the title',
      description:
        'A storming second half of the season delivers 80 points and second place — Liverpool’s best league finish in years, but still short of Arsenal. Reality: the platform Houllier never quite built on. Back this group to go one better with targeted additions, or overhaul aggressively to close the final gap?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'targeted',
          label: 'Targeted additions to this core',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'league', text: 'Backed the runners-up to push on smartly.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'overhaul',
          label: 'Aggressive overhaul to close the gap',
          successProbability: 0.45,
          onSuccess: [{ kind: 'memory', tag: 'league', text: 'Gambled on a big overhaul to catch Arsenal.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'league', text: 'Liverpool finish 2nd on 80 points — the near-miss of the Houllier era.' }],
      memoryTags: ['league'],
    }),
  },
  {
    id: 'overhaul-2002',
    date: '2002-07',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:overhaul-2002',
      title: 'The 2002 overhaul — Diouf, Cheyrou, Diao',
      description:
        'Chasing the final step, Houllier spends the runners-up momentum on El-Hadji Diouf, Bruno Cheyrou (hyped as "the new Zidane") and Salif Diao. Reality: the recruitment misfired badly and stalled the whole project. Trust the manager’s judgement on his targets, or challenge a scattergun summer before the money is spent?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'trust',
          label: 'Back the manager’s targets (as reality did)',
          successProbability: 0.4,
          onSuccess: [{ kind: 'managerRelationship', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Backed Houllier’s 2002 signings — history judged them harshly.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }, { kind: 'memory', tag: 'transfer', text: 'The Diouf/Cheyrou/Diao overhaul misfired.' }],
        },
        {
          id: 'challenge',
          label: 'Challenge the recruitment',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Questioned the scattergun summer before the money was gone.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'The 2002 overhaul — Diouf, Cheyrou, Diao — largely misfires.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'the-slide',
    date: '2003-05',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool' && s.managerRelations.identity === 'Gérard Houllier',
    build: () => ({
      id: 'scripted:the-slide',
      title: 'The slide',
      description:
        'The momentum has drained away — the football is cautious, the signings haven’t worked, and questions are growing about whether Houllier has taken the club as far as he can. Reality: one more season was given before the change. Back him for another year, or start planning for a new manager now?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'back',
          label: 'Give him another year (as reality did)',
          successProbability: 0.5,
          onSuccess: [{ kind: 'managerRelationship', amount: 6 }, { kind: 'memory', tag: 'manager', text: 'Backed Houllier through the slide — one more season.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
        {
          id: 'plan',
          label: 'Start planning for a change',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Quietly began the search for Houllier’s successor.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'The Houllier project slides; patience wears thin.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'houllier-out-benitez',
    date: '2004-05',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool' && s.managerRelations.identity === 'Gérard Houllier',
    build: () => ({
      id: 'scripted:houllier-out-benitez',
      title: 'Houllier out, Benítez in',
      description:
        'The project has run its course. Reality: Houllier departed and Liverpool appointed Rafael Benítez, fresh from winning La Liga with Valencia against the Spanish giants — a shrewd, methodical operator. Make the change and hand it to Benítez, or give the popular Houllier one final chance?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'benitez',
          label: 'Appoint Benítez (as reality did)',
          successProbability: 0.75,
          onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'manager', text: 'Hired Benítez — the methodical Spaniard who’d deliver Istanbul.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'stay',
          label: 'Give Houllier one more chance',
          successProbability: 0.4,
          onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'manager', text: 'Stuck with Houllier for one last roll of the dice.' }],
          onFailure: [{ kind: 'boardPatience', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Houllier sacked; Rafael Benítez appointed.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'owen-to-real',
    date: '2004-08',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:owen-to-real',
      title: 'Owen sold to Real Madrid',
      description:
        'With a year left on his deal and Real Madrid calling, Michael Owen — a homegrown Ballon d’Or winner — can be kept only at the risk of losing him for nothing next summer. Reality: the forced-sale dynamic meant a modest ~£8m fee (plus Núñez). Cash in now while you can, or gamble on keeping your star and persuading him to stay?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'sell',
          label: 'Cash in before the deal runs down (as reality did)',
          successProbability: 0.65,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Sold Owen to Real Madrid — a forced sale on an expiring deal.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
        {
          id: 'keep',
          label: 'Gamble on keeping him',
          successProbability: 0.35,
          onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'Persuaded Owen to stay — a coup.' }, { kind: 'morale', clubId: 'liverpool', amount: 4 }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_owen01', amount: 8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Owen sold to Real Madrid on his expiring contract.' }],
      memoryTags: ['transfer', 'cur_owen01'],
    }),
  },
  {
    id: 'benitez-spanish-core',
    date: '2004-08',
    scenarios: ['liverpool-2001'],
    requires: (s) => playerAt(s, 'cur_luis_garcia_at01', 'atletico') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:benitez-spanish-core',
      title: 'Benítez’s Spanish core',
      description:
        'The new manager wants players he trusts from La Liga: Xabi Alonso from Real Sociedad and the mercurial Luis García from Atlético. Reality: both were central to Istanbul the following May. Back Benítez’s Spanish recruits, or insist he prove himself with the squad he inherited first?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'back',
          label: 'Sign his Spanish core (as reality did)',
          successProbability: 0.85,
          onSuccess: [{ kind: 'signReal', playerId: 'cur_luis_garcia_at01', clubId: 'liverpool' }, { kind: 'memory', tag: 'transfer', text: 'Signed Alonso and Luis García — the spine of Istanbul.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -4 }],
        },
        {
          id: 'inherit',
          label: 'Make him work with the current squad',
          successProbability: 0.4,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'transfer', text: 'Held back the cheque book and tested the new manager.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'signReal', playerId: 'cur_luis_garcia_at01', clubId: 'liverpool' }, { kind: 'memory', tag: 'transfer', text: 'Benítez brings in Alonso and Luis García.' }],
      memoryTags: ['transfer', 'cur_luis_garcia_at01'],
    }),
  },
  {
    id: 'istanbul-miracle',
    date: '2005-05',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:istanbul-miracle',
      title: 'The Miracle of Istanbul',
      description:
        '3-0 down to AC Milan at half-time in the Champions League final — then three goals in six minutes, Gerrard leading the charge, and victory on penalties with Dudek’s save and dance. Reality: the greatest final comeback of all, a fifth European Cup that lets the club keep the trophy. Use this to build a dynasty, or accept a cup-run team that flatters a squad still short in the league?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'build',
          label: 'Build a dynasty on it',
          successProbability: 0.7,
          onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 6 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'silverware', text: 'Istanbul — a fifth European Cup, and belief without limit.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'realist',
          label: 'Bank the glory, address the league gap',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Won Europe and set about fixing the league shortfall.' }],
          onFailure: [{ kind: 'fanTrust', amount: -2 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 8, text: 'The Miracle of Istanbul — 3-0 down, champions of Europe.' }, { kind: 'memory', tag: 'silverware', text: 'Won the Champions League from 3-0 down against Milan.' }],
      memoryTags: ['silverware', 'cur_gerrard01'],
    }),
  },
  {
    id: 'gerrard-chelsea-uturn',
    date: '2005-07',
    scenarios: ['liverpool-2001'],
    requires: (s) => playerAt(s, 'cur_gerrard01', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:gerrard-chelsea-uturn',
      title: 'Gerrard’s Chelsea U-turn',
      description:
        'Weeks after Istanbul, your captain and heartbeat hands in a transfer request with Chelsea circling and their millions on the table. Reality: it lasted about a day — Gerrard reversed it and stayed, the defining loyalty of the era. Move heaven and earth to keep him, or refuse to be held to ransom and consider the record fee?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'keep',
          label: 'Do whatever it takes to keep him (as reality did)',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', playerId: 'cur_gerrard01', amount: 10 }, { kind: 'fanTrust', amount: 8, text: 'Gerrard stays — the captain’s heart belongs to Liverpool.' }, { kind: 'memory', tag: 'loyalty', text: 'Talked Gerrard out of Chelsea — the U-turn that defined an era.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_gerrard01', amount: 6 }],
        },
        {
          id: 'cash',
          label: 'Refuse to be held to ransom',
          successProbability: 0.3,
          onSuccess: [{ kind: 'memory', tag: 'loyalty', text: 'Called the captain’s bluff — and it held.' }],
          onFailure: [{ kind: 'transferOut', playerId: 'cur_gerrard01', clubId: 'chelsea', amount: 32_000_000 }, { kind: 'fanTrust', amount: -10, text: 'Letting Gerrard go to Chelsea is unthinkable to the Kop.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_gerrard01', amount: 6 }, { kind: 'memory', tag: 'loyalty', text: 'Gerrard reverses his transfer request within a day and stays.' }],
      memoryTags: ['loyalty', 'cur_gerrard01'],
    }),
  },
  {
    id: 'gerrard-final-2006',
    date: '2006-05',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:gerrard-final-2006',
      title: 'The "Gerrard Final" — 2006 FA Cup',
      description:
        'The FA Cup final against West Ham is dragged single-handedly into extra time and penalties by a Gerrard masterclass, capped by a stoppage-time thunderbolt. Reality: more silverware, and confirmation of an over-reliance on one man. Celebrate the captain’s heroics, or heed the warning that the team leans too heavily on him?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'celebrate',
          label: 'Celebrate the captain’s greatness',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'The Gerrard Final — one man drags the club to the cup.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'heed',
          label: 'Address the over-reliance on Gerrard',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Won the cup but moved to share the creative load.' }],
          onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'silverware', text: 'Gerrard wins the 2006 FA Cup almost by himself.' }],
      memoryTags: ['silverware', 'cur_gerrard01'],
    }),
  },
  {
    id: 'gillett-hicks',
    date: '2007-02',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:gillett-hicks',
      title: 'The Gillett & Hicks takeover',
      description:
        'American businessmen George Gillett and Tom Hicks have bought the club, promising a new stadium and funds. Reality: it became a debt-loaded, faction-riven ownership that nearly ruined Liverpool before a 2010 rescue. Welcome the investment and their promises, or sound early caution about the leverage behind the deal?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'welcome',
          label: 'Welcome the investment',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'ownership', text: 'Welcomed the new American owners and their promises.' }],
          onFailure: [{ kind: 'fanTrust', amount: -4 }],
        },
        {
          id: 'caution',
          label: 'Sound caution on the leverage',
          successProbability: 0.5,
          onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'Warned early about the debt behind the deal — the fans remember.' }, { kind: 'boardPatience', amount: -4 }],
          onFailure: [{ kind: 'boardPatience', amount: -6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'ownership', text: 'Gillett and Hicks complete a debt-loaded takeover.' }],
      memoryTags: ['ownership'],
    }),
  },
  {
    id: 'athens-2007',
    date: '2007-05',
    scenarios: ['liverpool-2001'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:athens-2007',
      title: 'Athens heartbreak',
      description:
        'A second Champions League final in three years, a rematch with Milan in Athens — and this time Milan win 2-1, Pippo Inzaghi punishing you for Istanbul. Reality: agonising revenge for the Rossoneri and the end of the era’s European run. Rally the squad for another assault, or accept the cycle has peaked and rebuild?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'rally',
          label: 'Go again for Europe',
          successProbability: 0.55,
          onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 4 }, { kind: 'memory', tag: 'near-miss', text: 'Took the Athens defeat as fuel for another run.' }],
          onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -3 }],
        },
        {
          id: 'rebuild',
          label: 'Accept the peak and rebuild',
          successProbability: 0.55,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'near-miss', text: 'Read the Athens loss as the cue to refresh the squad.' }],
          onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'near-miss', text: 'Lost the 2007 Champions League final to Milan in Athens.' }],
      memoryTags: ['near-miss'],
    }),
  },
];

/** Arsenal 2004 (the Invincibles, playing forward). */
const ARSENAL_2004_PACK: ScriptedEvent[] = [
  {
    id: 'battle-of-the-buffet',
    date: '2004-10',
    scenarios: ['arsenal-2004'],
    // Only if the real feud's protagonist is still in the dugout — a Director who
    // has already replaced Wenger has written this rivalry out.
    requires: (s) => s.playerClub === 'arsenal' && s.managerRelations.identity === 'Arsène Wenger',
    build: () => ({
      id: 'scripted:battle-of-the-buffet',
      title: 'The Battle of the Buffet — 49 unbeaten ends at Old Trafford',
      description:
        'A bad-tempered defeat at United ends your record unbeaten run, and it boils over in the tunnel — a slice of pizza flies past Ferguson and the two managers are at war in the press. The dressing room is raw. Which way do you point it?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'stoke',
          label: 'Back Wenger and stoke the feud — us against the world',
          successProbability: 0.55,
          onSuccess: [
            { kind: 'morale', clubId: 'arsenal', amount: 5 },
            { kind: 'managerRelationship', amount: 4 },
            { kind: 'memory', tag: 'rivalry', text: 'Stoked the United feud after the Old Trafford defeat; the squad closed ranks.' },
          ],
          onFailure: [{ kind: 'fanTrust', amount: -4, text: 'The war of words invites a media pile-on.' }],
        },
        {
          id: 'calm',
          label: 'Calm it down — draw a line, back to the football',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 3 }, { kind: 'boardPatience', amount: 3 }],
          onFailure: [{ kind: 'managerRelationship', amount: -5 }],
        },
      ],
      // Reality-default: the run's over, the feud simmers, the squad takes the knock.
      falloutIfIgnored: [{ kind: 'morale', clubId: 'arsenal', amount: -4 }, { kind: 'memory', tag: 'rivalry', text: 'The unbeaten run ended at Old Trafford; the Wenger–Ferguson feud hardened.' }],
      memoryTags: ['rivalry', 'manager'],
    }),
  },
  // Post-Invincibles decline into the austerity years. Vieira (2005), Ashley Cole
  // (2006) and Henry (2007) exits are ledger-replayed → narrative overlays; the 2011
  // Fàbregas sale to Barça is NOT in the ledger, so that beat carries the real
  // departure. Gallas, Nasri, van Persie and Eduardo aren't curated here → narrative.
  {
    id: 'fa-cup-2005',
    date: '2005-05',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:fa-cup-2005',
      title: 'The FA Cup on penalties — the last for nine years',
      description:
        'A drab final against Manchester United goes to penalties, and Arsenal win it — Vieira’s last kick for the club. Reality: nobody knew it would be the last trophy for nine long years, as the stadium move squeezed the budget. Treat it as a platform to defend, or read the warning that a lean era is coming?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'platform',
          label: 'A platform to build on',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Won the FA Cup on penalties — determined it won’t be the last for long.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'brace',
          label: 'Brace for the austerity years',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Won the Cup and steeled the club for the lean stadium years.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'silverware', text: 'FA Cup won on penalties — the last trophy for nine years.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'vieira-sold',
    date: '2005-07',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:vieira-sold',
      title: 'Vieira sold to Juventus',
      description:
        'The captain and midfield colossus wants a new challenge, and Juventus are offering good money. Reality: Arsenal sold Patrick Vieira — the end of the Invincibles’ spine and a symbolic passing of an era. Cash in and hand the future to the kids, or move heaven and earth to keep your leader?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'sell',
          label: 'Cash in — trust the youth (as reality did)',
          successProbability: 0.65,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Sold Vieira to Juventus — the handover to a new generation begins.' }],
          onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -4 }],
        },
        {
          id: 'keep',
          label: 'Fight to keep the captain',
          successProbability: 0.4,
          onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Kept Vieira — the old guard holds a while longer.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Vieira sold to Juventus — the Invincibles’ engine departs.' }],
      memoryTags: ['transfer', 'cur_vieira2'],
    }),
  },
  {
    id: 'farewell-highbury',
    date: '2006-05',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:farewell-highbury',
      title: 'Farewell to Highbury',
      description:
        'The final game at Highbury after 93 years — Henry’s hat-trick sends the old ground off, Bergkamp fêted. Reality: an emotional goodbye before the move to the Emirates. Make it a celebration that binds the club to its history, or keep the focus firmly on the future across the road?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'celebrate',
          label: 'A celebration of the history',
          successProbability: 0.8,
          onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'Highbury sent off in style — the fans’ hearts full.' }, { kind: 'memory', tag: 'club', text: 'A fitting farewell to Highbury.' }],
          onFailure: [{ kind: 'fanTrust', amount: -2 }],
        },
        {
          id: 'future',
          label: 'Eyes on the new era',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'club', text: 'Closed Highbury with the future firmly in mind.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'club', text: 'Arsenal play their last game at Highbury after 93 years.' }],
      memoryTags: ['club'],
    }),
  },
  {
    id: 'cl-final-paris-2006',
    date: '2006-05',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:cl-final-paris-2006',
      title: 'Champions League final — Lehmann sent off',
      description:
        'Arsenal’s first Champions League final, against Barcelona in Paris — and it turns on Lehmann’s early red card for a foul on Eto’o. Reality: down to ten men Arsenal led, then were beaten 2-1 late; the club’s best chance at Europe’s crown, gone. Rally the ten men behind the cause, or let the injustice sap them?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'rally',
          label: 'Rally the ten men',
          successProbability: 0.45,
          onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 4 }, { kind: 'memory', tag: 'near-miss', text: 'So near in Paris — a final lost to ten men and a red card.' }],
          onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -3 }],
        },
        {
          id: 'absorb',
          label: 'Absorb the blow and rebuild',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'near-miss', text: 'Took the Paris heartbreak and looked to the Emirates era.' }],
          onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'near-miss', text: 'Lost the Champions League final to Barcelona in Paris, Lehmann sent off early.' }],
      memoryTags: ['near-miss', 'cur_lehmann'],
    }),
  },
  {
    id: 'emirates-move',
    date: '2006-07',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:emirates-move',
      title: 'The Emirates — and its debt',
      description:
        'The move to the 60,000-seat Emirates is complete — a magnificent stadium carrying a mountain of debt that will discipline the wage bill and transfer budget for years. Reality: the constraint that defined the trophyless era. Accept the austerity and trade shrewdly, or push the board to spend through it and risk the finances?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'austerity',
          label: 'Embrace the discipline (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'infrastructure', text: 'Backed the stadium project and the years of thrift it demands.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
        {
          id: 'spend',
          label: 'Push to spend through the debt',
          successProbability: 0.4,
          onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'Refused to let the stadium starve the squad.' }, { kind: 'boardPatience', amount: -6 }],
          onFailure: [{ kind: 'boardPatience', amount: -10 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'infrastructure', text: 'Arsenal move to the Emirates — the debt will squeeze the budget for years.' }],
      memoryTags: ['infrastructure'],
    }),
  },
  {
    id: 'cashley-gallas-swap',
    date: '2006-08',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:cashley-gallas-swap',
      title: 'The "Cashley" saga and the Gallas swap',
      description:
        'Ashley Cole’s contract stand-off has turned toxic — the "tapping-up" affair with Chelsea, a fanbase that feels betrayed. Reality: he left for Chelsea on deadline day in a part-swap that brought William Gallas the other way. Force the sour sale through and take Gallas, or dig in and try to hold your left-back?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'swap',
          label: 'Do the deal — Gallas in (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Cole to Chelsea, Gallas the other way — a bitter saga closed.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
        {
          id: 'hold',
          label: 'Dig in and try to keep Cole',
          successProbability: 0.3,
          onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 3 }, { kind: 'memory', tag: 'transfer', text: 'Faced down the Cole saga and kept him — for now.' }],
          onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -4 }, { kind: 'fanTrust', amount: -2 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -3, text: '"Cashley" Cole leaves for Chelsea in an acrimonious deadline-day swap for Gallas.' }, { kind: 'memory', tag: 'transfer', text: 'Ashley Cole to Chelsea; Gallas arrives in the swap.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'henry-to-barca',
    date: '2007-06',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:henry-to-barca',
      title: 'Henry sold to Barcelona',
      description:
        'The club’s greatest-ever goalscorer, and its captain, wants to join Barcelona. Reality: Arsenal let Thierry Henry go — the definitive end of the Invincibles era, and the club handed fully to Fàbregas’s generation. Cash in and complete the youth transition, or refuse to sell your talisman and icon?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'sell',
          label: 'Let the icon go (as reality did)',
          successProbability: 0.6,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Henry to Barcelona — the era of the kids begins in earnest.' }],
          onFailure: [{ kind: 'fanTrust', amount: -4 }],
        },
        {
          id: 'refuse',
          label: 'Refuse to sell your talisman',
          successProbability: 0.4,
          onSuccess: [{ kind: 'fanTrust', amount: 6, text: 'Kept Henry — the Bernabéu of north London roars.' }, { kind: 'morale', clubId: 'arsenal', amount: 4 }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_henry', amount: 8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Henry sold to Barcelona — the last of the Invincibles core departs.' }],
      memoryTags: ['transfer', 'cur_henry'],
    }),
  },
  {
    id: 'eduardo-legbreak',
    date: '2008-02',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:eduardo-legbreak',
      title: 'Eduardo’s leg break and the title collapse',
      description:
        'A horror tackle at Birmingham shatters Eduardo’s leg — and, with it, a title challenge that had Arsenal top. Reality: the young side never recovered from the psychological blow and let the league slip. Steady the traumatised squad and salvage the run-in, or let the injustice and shock unravel the season?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'steady',
          label: 'Steady the squad, salvage the run-in',
          successProbability: 0.45,
          onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 4 }, { kind: 'memory', tag: 'injury', text: 'Held the young side together after Eduardo’s horror injury.' }],
          onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -5 }],
        },
        {
          id: 'unravel',
          label: 'A wounded side chasing the impossible',
          successProbability: 0.4,
          onSuccess: [{ kind: 'memory', tag: 'injury', text: 'Rode the emotion as far as it would carry them.' }],
          onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -5 }, { kind: 'fanTrust', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'arsenal', amount: -5 }, { kind: 'memory', tag: 'injury', text: 'Eduardo’s leg is broken at Birmingham; the title challenge collapses.' }],
      memoryTags: ['injury'],
    }),
  },
  {
    id: 'fabregas-captain',
    date: '2008-11',
    scenarios: ['arsenal-2004'],
    requires: (s) => playerAt(s, 'cur_fabregas', 'arsenal') && s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:fabregas-captain',
      title: 'Fàbregas made captain — Project Youth',
      description:
        'Cesc Fàbregas, still only 21, is handed the armband as the face of Wenger’s young project — van Persie, Nasri and a clutch of talents around him. Reality: a thrilling, brittle side that dazzled without winning. Build patiently around the kids and hold them together, or accept you’ll need to buy experience to convert promise into trophies?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'patient',
          label: 'Build patiently around the youth (as reality did)',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_fabregas', amount: 6 }, { kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'youth', text: 'Fàbregas captains a golden generation — the promise is intoxicating.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'experience',
          label: 'Buy experience to win now',
          successProbability: 0.45,
          onSuccess: [{ kind: 'memory', tag: 'youth', text: 'Added steel to the kids to chase trophies sooner.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'youth', text: 'Fàbregas made captain — the face of Wenger’s Project Youth.' }],
      memoryTags: ['youth', 'cur_fabregas'],
    }),
  },
  {
    id: 'fabregas-nasri-sold',
    date: '2011-08',
    scenarios: ['arsenal-2004'],
    requires: (s) => playerAt(s, 'cur_fabregas', 'arsenal') && s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:fabregas-nasri-sold',
      title: 'The spine stripped — Fàbregas and Nasri go',
      description:
        'In one brutal summer the captain Fàbregas pushes for his boyhood Barcelona and Nasri agitates for Manchester City’s money. Reality: both were sold, gutting the team of its creative heart on the eve of the season. Hold firm and refuse to sell, or cash in on unhappy stars and reinvest?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'sell',
          label: 'Cash in on the unsettled pair (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_fabregas', clubId: 'barcelona', amount: 35_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Fàbregas to Barça, Nasri to City — the spine is stripped.' }],
          onFailure: [{ kind: 'transferOut', playerId: 'cur_fabregas', clubId: 'barcelona', amount: 35_000_000 }],
        },
        {
          id: 'hold',
          label: 'Refuse to sell — hold the spine together',
          successProbability: 0.35,
          onSuccess: [{ kind: 'morale', playerId: 'cur_fabregas', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Faced down the exodus and kept the creative core — for now.' }],
          onFailure: [{ kind: 'transferOut', playerId: 'cur_fabregas', clubId: 'barcelona', amount: 35_000_000 }, { kind: 'morale', clubId: 'arsenal', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'transferOut', playerId: 'cur_fabregas', clubId: 'barcelona', amount: 35_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Fàbregas sold to Barcelona and Nasri to City — the creative heart torn out.' }],
      memoryTags: ['transfer', 'cur_fabregas'],
    }),
  },
  {
    id: 'van-persie-talisman',
    date: '2011-08',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:van-persie-talisman',
      title: 'Van Persie inherits the armband',
      description:
        'With the spine sold, Robin van Persie is made captain and asked to carry the side almost alone. Reality: he responded with a stunning goalscoring run that dragged an over-reliant Arsenal into the top four. Build the whole side around him, or spread the load so you aren’t hostage to one man’s form and fitness?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'around-him',
          label: 'Build around the talisman (as reality did)',
          successProbability: 0.65,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'talisman', text: 'Van Persie carries Arsenal almost single-handed.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'spread',
          label: 'Spread the goalscoring load',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 3 }, { kind: 'memory', tag: 'talisman', text: 'Refused to be a one-man team and shared the burden.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'talisman', text: 'Van Persie takes the armband and becomes the team’s everything.' }],
      memoryTags: ['talisman'],
    }),
  },
  {
    id: 'eight-two-old-trafford',
    date: '2011-08',
    scenarios: ['arsenal-2004'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:eight-two-old-trafford',
      title: '8-2 at Old Trafford',
      description:
        'A depleted, freshly-gutted Arsenal are humiliated 8-2 at Manchester United — the lowest point of the austerity era. Reality: the thrashing forced a panicked late deadline-day scramble for reinforcements. Spend big in the last days of the window to steady the ship, or hold the line and trust the project through the storm?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'panic-buy',
          label: 'Scramble for deadline-day reinforcements (as reality did)',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 3 }, { kind: 'memory', tag: 'crisis', text: 'Answered the 8-2 with a flurry of deadline-day signings.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
        {
          id: 'hold-line',
          label: 'Hold the line and trust the project',
          successProbability: 0.4,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'crisis', text: 'Refused to panic after the Old Trafford humiliation.' }],
          onFailure: [{ kind: 'fanTrust', amount: -5, text: 'Standing pat after an 8-2 enrages the support.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'arsenal', amount: -5 }, { kind: 'memory', tag: 'crisis', text: 'Humiliated 8-2 at Old Trafford — the nadir of the austerity years.' }],
      memoryTags: ['crisis'],
    }),
  },
];

// ── Set-piece high-drama packs (§ stories) — the defining forks of each era, richest
//    in the near-reality early seasons. Each gated on its curated player still being
//    at his club (reality hasn't already diverged that thread away). ──────────────

const REAL_MADRID_2000_PACK: ScriptedEvent[] = [
  {
    // The substance-vs-spectacle heart of the Galácticos: Makélélé, the engine that
    // makes the show work, wants parity with the stars. Pérez let him go to Chelsea.
    id: 'makelele-raise',
    date: '2003-07',
    scenarios: ['real-madrid-2000'],
    requires: (s) => playerAt(s, 'cur_makelele', 'real_madrid') && s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:makelele-raise',
      title: 'Makélélé wants to be paid like a Galáctico',
      description: 'The one who does the running while Zidane and Raúl take the glory wants his worth recognised — a real raise, or he goes. Pérez famously refused and sold him to Chelsea, and the balance never recovered. Break the galáctico wage order to keep your engine, or let the spectacle roll on without him?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'pay', label: 'Pay him what he is worth — keep the balance', successProbability: 0.85,
          onSuccess: [{ kind: 'renewContract', playerId: 'cur_makelele', amount: 4 }, { kind: 'morale', clubId: 'real_madrid', amount: 6 }, { kind: 'memory', tag: 'galactico', text: 'Kept Makélélé — the engine stays, the balance holds.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -4 }],
        },
        {
          id: 'sell', label: 'Hold the wage line — cash in (£16m)', successProbability: 0.9,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_makelele', clubId: 'chelsea', amount: 16_000_000 }, { kind: 'morale', clubId: 'real_madrid', amount: -8 }, { kind: 'memory', tag: 'galactico', text: 'Sold Makélélé to Chelsea — as reality did; the midfield lost its balance.' }],
          onFailure: [],
        },
      ],
      falloutIfIgnored: [{ kind: 'transferOut', playerId: 'cur_makelele', clubId: 'chelsea', amount: 16_000_000 }, { kind: 'morale', clubId: 'real_madrid', amount: -6 }],
      memoryTags: ['galactico', 'cur_makelele'],
    }),
  },
  // The rest of the Galáctico era. Real Madrid's marquee transfers (Figo, Zidane,
  // Ronaldo, Beckham in; van Nistelrooy/Cannavaro in 2006; Redondo out) are ALL
  // replayed by the reality ledger by default, so these beats are NARRATIVE
  // OVERLAYS — the story and the Director's stance (rivalry, fan backlash,
  // boardroom, man-management), not duplicate signings. They carry no transfer
  // consequence; the ledger moves the players.
  {
    id: 'figo-betrayal',
    // Figo signed 24 Jul 2000 — the very kickoff month, which the live opening
    // window owns — so the rivalry-fallout beat fires the month after.
    date: '2000-08',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:figo-betrayal',
      title: 'The Figo betrayal',
      description:
        'Days after winning the presidency, Pérez has triggered Luís Figo’s buyout clause — a world-record ~£37m to prise Barcelona’s talisman from the Camp Nou. Reality: it was the founding act of the Galáctico project and made Figo a hate figure in Catalonia for life. Detonate the rivalry and embrace the project, or play it down?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'embrace',
          label: 'Own it — the Galácticos begin (as reality did)',
          successProbability: 0.8,
          onSuccess: [{ kind: 'fanTrust', amount: 8, text: 'Prising Figo from Barça electrifies the Bernabéu.' }, { kind: 'memory', tag: 'rivalry', text: 'Signed Figo from Barcelona — the founding Galáctico, and a lifelong villain at Camp Nou.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'downplay',
          label: 'Downplay the rivalry angle',
          successProbability: 0.6,
          onSuccess: [{ kind: 'memory', tag: 'rivalry', text: 'Signed Figo but kept the temperature down.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5, text: 'Figo arrives from Barcelona — the Galáctico era is launched.' }, { kind: 'memory', tag: 'rivalry', text: 'Figo prised from Barcelona in a world-record deal.' }],
      memoryTags: ['rivalry', 'transfer'],
    }),
  },
  {
    id: 'redondo-forced-sale',
    date: '2000-08',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:redondo-forced-sale',
      title: 'Selling Redondo against the fans’ will',
      description:
        'Pérez wants to cash in on the beloved midfield metronome Fernando Redondo (~£11m to Milan) to help fund the Galácticos — but the player didn’t ask to go, and fans are gathering outside the Bernabéu chanting his name. Reality: the sale went through and knee injuries then wrecked his Milan spell. Push it through, or find the money elsewhere?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'sell',
          label: 'Cash in to fund the project (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'memory', tag: 'fan-backlash', text: 'Sold Redondo to Milan — the war chest grows, the terraces seethe.' }, { kind: 'fanTrust', amount: -4, text: 'Selling Redondo against his will stings the support.' }],
          onFailure: [{ kind: 'fanTrust', amount: -6 }],
        },
        {
          id: 'protect',
          label: 'Refuse — keep the fans’ favourite',
          successProbability: 0.5,
          onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'Stood by Redondo against the boardroom — the terraces roar approval.' }, { kind: 'boardPatience', amount: -4 }],
          onFailure: [{ kind: 'boardPatience', amount: -6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -4, text: 'Redondo sold to Milan against his will; fans protest outside the Bernabéu.' }, { kind: 'memory', tag: 'fan-backlash', text: 'The popular Redondo was moved on to help fund the Galácticos.' }],
      memoryTags: ['fan-backlash', 'cur_redondo'],
    }),
  },
  {
    id: 'zidane-galactico',
    date: '2001-07',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:zidane-galactico',
      title: 'Zidane — the record smashed again',
      description:
        'Pérez has broken the world transfer record a second summer running (~€77.5m) to bring Zinedine Zidane from Juventus — a fee that will stand for eight years. Reality: the ultimate Galáctico signing. Bankroll the spectacle, or bank the money and fix the balance instead?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'smash',
          label: 'Smash the record for Zidane (as reality did)',
          successProbability: 0.85,
          onSuccess: [{ kind: 'fanTrust', amount: 7, text: 'The best playmaker on earth, in white.' }, { kind: 'memory', tag: 'transfer', text: 'Signed Zidane for a world record — the Galáctico project peaks.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'balance',
          label: 'Reinvest in depth and defensive balance',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Passed on the Zidane spectacle to build a more balanced side.' }],
          onFailure: [{ kind: 'fanTrust', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Zidane joins for a world-record fee.' }],
      memoryTags: ['transfer', 'cur_zidane'],
    }),
  },
  {
    id: 'la-novena',
    date: '2002-05',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:la-novena',
      title: 'La Novena — Zidane’s volley in Glasgow',
      description:
        'In the club’s centenary year you’ve won a ninth European Cup, Bayer Leverkusen beaten at Hampden Park — settled by Zidane’s left-footed volley off a Roberto Carlos cross, one of the greatest final goals ever. Reality: the peak of the project. Reward and lock down the core, or treat the peak as a selling window?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'reward',
          label: 'Reward the core and build on it',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', clubId: 'real_madrid', amount: 6 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'La Novena — and the champions kept together.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'cashin',
          label: 'Cash in at peak value',
          successProbability: 0.5,
          onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Sold from a position of strength after La Novena.' }, { kind: 'fanTrust', amount: -3 }],
          onFailure: [{ kind: 'morale', clubId: 'real_madrid', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6, text: 'La Novena: a ninth European Cup, sealed by Zidane’s Glasgow volley.' }, { kind: 'memory', tag: 'silverware', text: 'Won the Champions League with Zidane’s volley at Hampden.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'ronaldo-fenomeno',
    date: '2002-08',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:ronaldo-fenomeno',
      title: 'Ronaldo, on deadline day',
      description:
        'Hours before the deadline, the World Cup golden-boot winner Ronaldo is available from Inter. Reality: Madrid signed him, he took the 2002 Ballon d’Or, and the Galáctico gallery grew again. Add the marquee firepower, or spend the budget on the holding midfielder and centre-back the side actually needs?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'sign',
          label: 'Sign the World Cup star (as reality did)',
          successProbability: 0.85,
          onSuccess: [{ kind: 'fanTrust', amount: 7, text: 'O Fenômeno, in white — the gallery grows.' }, { kind: 'memory', tag: 'transfer', text: 'Signed Ronaldo on deadline day.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'spine',
          label: 'Reinforce the spine instead',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Chose balance over another galáctico forward.' }],
          onFailure: [{ kind: 'fanTrust', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Ronaldo signed from Inter on deadline day.' }],
      memoryTags: ['transfer', 'cur_ronaldo_r9'],
    }),
  },
  {
    id: 'del-bosque-sack',
    date: '2003-06',
    scenarios: ['real-madrid-2000'],
    // Only while del Bosque is still in post — a Director who already changed the
    // coach has written this out of history.
    requires: (s) => s.playerClub === 'real_madrid' && s.managerRelations.identity === 'Vicente del Bosque',
    build: () => ({
      id: 'scripted:del-bosque-sack',
      title: 'Del Bosque — champion, discarded',
      description:
        'You’ve just won La Liga on the final day. Reality: Madrid let the two-time Champions League winner del Bosque go the very next day — deemed not "glamorous" enough for the project — and moved captain Hierro on too. Renew the trusted, trophy-winning coach, or replace him with a glamour name (Queiroz) to fit the brand?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'renew',
          label: 'Keep the man who keeps winning',
          successProbability: 0.8,
          onSuccess: [{ kind: 'managerRelationship', amount: 10 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Kept del Bosque — substance over glamour.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -4 }],
        },
        {
          id: 'glamour',
          label: 'Replace him for a glamour appointment (as reality did)',
          successProbability: 0.4,
          onSuccess: [{ kind: 'memory', tag: 'manager', text: 'Let del Bosque go for a more "glamorous" name.' }],
          onFailure: [{ kind: 'fanTrust', amount: -8, text: 'Discarding a title-winning coach for image outrages the support.' }, { kind: 'boardPatience', amount: -6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -5, text: 'Del Bosque let go the day after winning La Liga; Hierro moved on too.' }, { kind: 'memory', tag: 'manager', text: 'A title-winning coach discarded for not fitting the Galáctico brand.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'beckham-brand',
    date: '2003-07',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:beckham-brand',
      title: 'Beckham — the global brand',
      description:
        'Manchester United have accepted ~£25m for David Beckham. Reality: the ultimate commercial-and-sporting Galáctico, unveiled to a sea of cameras. Land the planet’s biggest football brand for the shirt sales and star power, or resist Beckham-mania to protect the squad balance and wage structure?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'sign',
          label: 'Sign the brand (as reality did)',
          successProbability: 0.85,
          onSuccess: [{ kind: 'fanTrust', amount: 6, text: 'Beckham-mania sweeps the Bernabéu — and the megastore.' }, { kind: 'memory', tag: 'marketing', text: 'Signed Beckham — the commercial peak of the Galácticos.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'resist',
          label: 'Resist — protect the balance',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'marketing', text: 'Passed on Beckham-mania to keep the wage structure intact.' }],
          onFailure: [{ kind: 'fanTrust', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'marketing', text: 'Beckham signed from Manchester United — the global-brand Galáctico.' }],
      memoryTags: ['marketing', 'cur_beckham'],
    }),
  },
  {
    id: 'trophy-drought-carousel',
    date: '2004-09',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:trophy-drought-carousel',
      title: 'The drought and the manager carousel',
      description:
        'The galaxy of stars is winning nothing. Reality: after the 2003 title Madrid went three years trophyless, burning through coaches (Queiroz, Camacho, Luxemburgo…) and falling in Europe to Monaco, Juventus and Arsenal — the midfield and defence never rebuilt after Makélélé. Impose stability and fix the spine, or chase another big-name quick fix?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'stability',
          label: 'Stability — rebuild the neglected spine',
          successProbability: 0.55,
          onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'crisis', text: 'Broke the coaching carousel and rebuilt the midfield.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
        {
          id: 'quickfix',
          label: 'Another high-profile hire (as reality did)',
          successProbability: 0.35,
          onSuccess: [{ kind: 'fanTrust', amount: 3 }],
          onFailure: [{ kind: 'boardPatience', amount: -6 }, { kind: 'memory', tag: 'crisis', text: 'The carousel spun on; the drought deepened.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'boardPatience', amount: -5 }, { kind: 'memory', tag: 'crisis', text: 'Three trophyless years and a carousel of coaches — the Galáctico model creaks.' }],
      memoryTags: ['crisis'],
    }),
  },
  {
    id: 'perez-resigns',
    date: '2006-02',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:perez-resigns',
      title: 'Pérez resigns',
      description:
        'Amid a three-year trophy drought, a Copa exit and a Champions League loss to Arsenal, Florentino Pérez has resigned the presidency he built the Galácticos on. Reality: he walked, and an interim took over before fresh elections. Back the man and the project to the end, or side with the clean break?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'back',
          label: 'Back Pérez to double down',
          successProbability: 0.4,
          onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'boardroom', text: 'Stood by Pérez and the project through the storm.' }],
          onFailure: [{ kind: 'boardPatience', amount: -6 }],
        },
        {
          id: 'break',
          label: 'Side with a clean break (as reality did)',
          successProbability: 0.65,
          onSuccess: [{ kind: 'fanTrust', amount: 4 }, { kind: 'memory', tag: 'boardroom', text: 'The Pérez era ends; the club looks for new leadership.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'boardroom', text: 'Florentino Pérez resigned the presidency amid the trophy drought.' }],
      memoryTags: ['boardroom'],
    }),
  },
  {
    id: 'calderon-capello-rebuild',
    date: '2006-07',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:calderon-capello-rebuild',
      title: 'Calderón, Capello, and a grittier rebuild',
      description:
        'A new president (Calderón) has reappointed Fabio Capello and pivoted from pure glamour to a results-first squad — World Cup-winning captain Cannavaro and striker van Nistelrooy arriving. Reality: pragmatism over spectacle, and it worked. Endorse Capello’s hard-nosed rebuild, or insist on staying loyal to the flamboyant blueprint?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'endorse',
          label: 'Back the pragmatic rebuild (as reality did)',
          successProbability: 0.75,
          onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'rebuild', text: 'Backed Capello’s results-first reset — Cannavaro and van Nistelrooy in.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -3 }],
        },
        {
          id: 'glamour',
          label: 'Insist on the glamour blueprint',
          successProbability: 0.4,
          onSuccess: [{ kind: 'fanTrust', amount: 3 }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }, { kind: 'boardPatience', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'rebuild', text: 'Calderón brought Capello back and pivoted to a grittier, winning squad.' }],
      memoryTags: ['rebuild'],
    }),
  },
  {
    id: 'beckham-frozen',
    date: '2007-02',
    scenarios: ['real-madrid-2000'],
    requires: (s) => playerAt(s, 'cur_beckham', 'real_madrid') && s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:beckham-frozen',
      title: 'Beckham frozen out — then reinstated',
      description:
        'Beckham has agreed a summer move to LA Galaxy, and Capello has declared he’ll never play for Madrid again. Reality: Capello relented weeks later; Beckham returned, scored, and became pivotal to the title run-in. Back your coach’s hardline stance, or force the marketable star back into the side?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'back-coach',
          label: 'Back Capello’s discipline',
          successProbability: 0.5,
          onSuccess: [{ kind: 'managerRelationship', amount: 6 }, { kind: 'memory', tag: 'man-management', text: 'Backed the coach — and Beckham forced his own way back on merit.' }],
          onFailure: [{ kind: 'morale', playerId: 'cur_beckham', amount: -8 }],
        },
        {
          id: 'reinstate',
          label: 'Force Beckham back into the side',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_beckham', amount: 8 }, { kind: 'memory', tag: 'man-management', text: 'Reinstated Beckham — he repaid it in the run-in.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'man-management', text: 'Capello froze Beckham out, then reinstated him — and he drove the title run-in.' }],
      memoryTags: ['man-management', 'cur_beckham'],
    }),
  },
  {
    id: 'la-liga-2007',
    date: '2007-06',
    scenarios: ['real-madrid-2000'],
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:la-liga-2007',
      title: 'Champions again, on the final day',
      description:
        'From a goal down against Mallorca on the last day, you’ve come back to win and clinch a 30th La Liga title — level on points with Barcelona but ahead on the head-to-head. Reality: the drought ended and the Capello reset was vindicated. Build on the pragmatic foundation, or use the glory to relaunch a new star-signing cycle?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'build',
          label: 'Build on the reset',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'silverware', text: 'Title won — and the pragmatic foundation kept.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'relaunch',
          label: 'Relaunch a new galáctico cycle',
          successProbability: 0.5,
          onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'Vindicated — and straight back to the marquee market.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6, text: 'Champions on the final day — the drought is over.' }, { kind: 'memory', tag: 'silverware', text: 'Won a 30th La Liga on the final day, edging Barcelona on head-to-head.' }],
      memoryTags: ['silverware'],
    }),
  },
];

const DORTMUND_2012_PACK: ScriptedEvent[] = [
  {
    // The defining Dortmund heartbreak: Bayern trigger Götze's release clause and
    // take the jewel of Klopp's side — the ultimate rival raid.
    id: 'gotze-bayern',
    date: '2013-04',
    scenarios: ['dortmund-2012'],
    requires: (s) => playerAt(s, 'cur_gotze_12', 'dortmund') && s.playerClub === 'dortmund',
    build: () => ({
      id: 'scripted:gotze-bayern',
      title: 'Bayern trigger Götze’s release clause',
      description: 'Your golden boy — the face of Klopp’s revolution — and your greatest rival has met his €37m buy-out clause in secret. Reality: he went to Munich and it broke Dortmund hearts. Move heaven and earth to keep him, or take the money and let the rival strengthen at your expense?',
      interrupt: true,
      clubId: 'dortmund',
      category: 'event',
      choices: [
        {
          id: 'fight', label: 'Fight to keep him — a new deal above the clause', successProbability: 0.4,
          onSuccess: [{ kind: 'renewContract', playerId: 'cur_gotze_12', amount: 4 }, { kind: 'morale', clubId: 'dortmund', amount: 10 }, { kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'rivalry', text: 'Kept Götze from Bayern’s clutches — the Yellow Wall roars.' }],
          onFailure: [{ kind: 'transferOut', playerId: 'cur_gotze_12', clubId: 'bayern', amount: 37_000_000 }, { kind: 'morale', clubId: 'dortmund', amount: -8 }],
        },
        {
          id: 'sell', label: 'Let him go to Bayern (£31m) — as reality did', successProbability: 0.95,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_gotze_12', clubId: 'bayern', amount: 31_000_000 }, { kind: 'morale', clubId: 'dortmund', amount: -6 }, { kind: 'memory', tag: 'rivalry', text: 'Götze joins Bayern — the rival is armed with your own jewel.' }],
          onFailure: [],
        },
      ],
      falloutIfIgnored: [{ kind: 'transferOut', playerId: 'cur_gotze_12', clubId: 'bayern', amount: 31_000_000 }, { kind: 'morale', clubId: 'dortmund', amount: -6 }],
      memoryTags: ['rivalry', 'cur_gotze_12'],
    }),
  },
  {
    // A year on, the same story: Lewandowski runs his deal down and leaves for Bayern
    // on a free. Sell now for a fee, or watch the rival take him for nothing.
    id: 'lewandowski-bayern',
    date: '2013-08',
    scenarios: ['dortmund-2012'],
    requires: (s) => playerAt(s, 'cur_lewandowski_12', 'dortmund') && s.playerClub === 'dortmund',
    build: () => ({
      id: 'scripted:lewandowski-bayern',
      title: 'Lewandowski runs his contract down — Bayern wait',
      description: 'Your talisman striker has one year left and his heart is set on Munich; reality let him leave on a FREE. Cash in now while he has value, or hold him for one last charge and lose him for nothing to the rival?',
      interrupt: true,
      clubId: 'dortmund',
      category: 'event',
      choices: [
        {
          id: 'cash-in', label: 'Sell now for a real fee (£22m)', successProbability: 0.85,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_lewandowski_12', clubId: 'bayern', amount: 22_000_000 }, { kind: 'memory', tag: 'rivalry', text: 'Banked a fee on Lewandowski rather than lose him for free — smarter than reality.' }],
          onFailure: [],
        },
        {
          id: 'hold', label: 'Hold him for one last charge (he leaves free in 2014)', successProbability: 0.5,
          onSuccess: [{ kind: 'morale', clubId: 'dortmund', amount: 6 }, { kind: 'letContractLapse', playerId: 'cur_lewandowski_12' }, { kind: 'memory', tag: 'rivalry', text: 'Kept Lewandowski for a final season — glory now, a free exit to Bayern later.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_lewandowski_12', amount: 12 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'letContractLapse', playerId: 'cur_lewandowski_12' }, { kind: 'memory', tag: 'rivalry', text: 'Let Lewandowski run his deal down — Bayern get him for free, as they did.' }],
      memoryTags: ['rivalry', 'cur_lewandowski_12'],
    }),
  },
];

// The Abu Dhabi takeover (deadline day 2008) and the Robinho statement predate this
// scenario's 2009 kickoff — the money is a given from the first window now, not a
// mid-save decision — so the old "spend the takeover cash on deadline day" event is
// gone. The 2009 spree itself (Tévez, Adebayor, Barry, Lescott) is the live opening
// window, driven by the reality ledger.
const MAN_CITY_2008_PACK: ScriptedEvent[] = [
  // The Abu Dhabi era. NOTE the playable start is 2009-07 (Robinho and the 2008
  // takeover are backstory, already in place at kickoff), so the opening beats fire
  // from 2009-08. Every marquee arrival (the 2009 spree; Yaya/Balotelli/Silva 2010;
  // Agüero/Nasri 2011) is ledger-replayed → narrative overlays.
  {
    id: 'city-project-expectations',
    date: '2009-08',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:city-project-expectations',
      title: 'The richest club in the world',
      description:
        'Sheikh Mansour’s ADUG money has made City the wealthiest club on earth — Robinho already prised from under Chelsea’s nose, and a mandate to gatecrash the established order fast. Reality: limitless funds, and limitless, impatient expectation. Promise instant success and spend to match, or set a steadier "built to last" course with the owners?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'instant',
          label: 'Promise instant success (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'fanTrust', amount: 6, text: 'The blue half of Manchester dreams of toppling United.' }, { kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'takeover', text: 'The Abu Dhabi project promises to conquer everything, fast.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'built-to-last',
          label: 'Sell a patient, built-to-last project',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'takeover', text: 'Won the owners to a longer-term build.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'takeover', text: 'The ADUG billions make City a superpower overnight.' }],
      memoryTags: ['takeover'],
    }),
  },
  {
    id: 'city-2009-spree',
    date: '2009-08',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:city-2009-spree',
      title: 'The 2009 spree',
      description:
        'The chequebook is open: Tévez, Adebayor, Barry, Lescott and Kolo Touré all arrive in one summer to turbo-charge Mark Hughes’s squad. Reality: a huge, slightly scattergun outlay that lifted City but didn’t yet cohere. Back the wholesale spend, or urge a more targeted, balanced build?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'spend',
          label: 'Back the spree (as reality did)',
          successProbability: 0.75,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Tévez, Adebayor, Barry, Lescott, Kolo — the spree lands.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'targeted',
          label: 'Push for a targeted, balanced build',
          successProbability: 0.55,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Spent big but smart, chasing balance over noise.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'City’s 2009 spree: Tévez, Adebayor, Barry, Lescott, Kolo Touré.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'tevez-billboard',
    date: '2009-09',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:tevez-billboard',
      title: '"Welcome to Manchester"',
      description:
        'Prising Carlos Tévez from Manchester United, the club plasters a giant sky-blue "Welcome to Manchester" billboard across the city. Reality: Ferguson dismissed it as "small-time," and the mind-games lit the rivalry. Own the provocation and stoke the derby, or take the classy high road?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'provoke',
          label: 'Own the billboard (as reality did)',
          successProbability: 0.6,
          onSuccess: [{ kind: 'fanTrust', amount: 6, text: 'The billboard delights the blue half and needles the red.' }, { kind: 'memory', tag: 'rivalry', text: '"Welcome to Manchester" — City announce themselves to United.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'highroad',
          label: 'Take the high road',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'rivalry', text: 'Let the signing do the talking, no billboard needed.' }],
          onFailure: [{ kind: 'fanTrust', amount: -2 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'rivalry', text: 'The "Welcome to Manchester" Tévez billboard taunts United.' }],
      memoryTags: ['rivalry', 'cur_tevez_u8'],
    }),
  },
  {
    id: 'hughes-out-mancini',
    date: '2009-12',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city' && s.managerRelations.identity === 'Mark Hughes',
    build: () => ({
      id: 'scripted:hughes-out-mancini',
      title: 'Hughes out, Mancini in',
      description:
        'Despite heavy spending, results — and a leaky defence — have the owners unconvinced by Mark Hughes. Reality: he was sacked in December 2009 and Roberto Mancini, a serial Serie A winner, took over to instil steel. Make the mid-season change for a proven winner, or give Hughes the time to make the expensive squad gel?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'mancini',
          label: 'Appoint Mancini (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Hired Mancini to turn the spending into silverware.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'keep-hughes',
          label: 'Give Hughes time',
          successProbability: 0.45,
          onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'manager', text: 'Kept faith with Hughes to bed the new signings in.' }],
          onFailure: [{ kind: 'boardPatience', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Hughes sacked; Roberto Mancini takes charge.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'mancini-marquees',
    date: '2010-08',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:mancini-marquees',
      title: 'Mancini’s marquees — Yaya, Balotelli, Silva',
      description:
        'The new manager reshapes the spine: Yaya Touré’s midfield power, David Silva’s craft, and the combustible genius of Mario Balotelli. Reality: the core of the team that would win the title — and, in Balotelli, endless drama. Back the blend of elite talent and volatility, or steer clear of the risk and buy safer?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'back',
          label: 'Sign them all, drama included (as reality did)',
          successProbability: 0.8,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Yaya, Silva and Balotelli in — the title core takes shape.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'safe',
          label: 'Avoid the volatility, buy safer',
          successProbability: 0.55,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Chose stability over the high-risk genius.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Mancini brings in Yaya Touré, Silva and Balotelli.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'fa-cup-2011',
    date: '2011-05',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:fa-cup-2011',
      title: 'The FA Cup — first trophy in 35 years',
      description:
        'Yaya Touré’s goals win the FA Cup — City’s first major trophy since 1976 and the validation the whole project needed. Reality: the breakthrough that turned spending into belief, and Champions League qualification followed. Use it as the launchpad for a title tilt, or caution that one cup doesn’t make champions?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'launchpad',
          label: 'Launch the title assault',
          successProbability: 0.75,
          onSuccess: [{ kind: 'morale', clubId: 'man_city', amount: 6 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'First trophy in 35 years — now for the title.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'caution',
          label: 'Temper the celebration',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'silverware', text: 'Won the cup and kept the feet on the ground.' }],
          onFailure: [{ kind: 'fanTrust', amount: -2 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6, text: 'The FA Cup — City’s first major trophy in 35 years.' }, { kind: 'memory', tag: 'silverware', text: 'Won the 2011 FA Cup, the breakthrough trophy.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'tevez-refusal',
    date: '2011-09',
    scenarios: ['man-city-2008'],
    requires: (s) => playerAt(s, 'cur_tevez_u8', 'man_city') && s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:tevez-refusal',
      title: 'Tévez refuses to play',
      description:
        'In a Champions League night in Munich, your talismanic striker appears to refuse to come off the bench. Reality: a huge disciplinary crisis — Tévez was exiled for months before an uneasy reconciliation, and still ended up part of the title run-in. Come down hard and freeze him out, or smooth it over to keep his goals available?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'hardline',
          label: 'Freeze him out — discipline first (as reality did)',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', clubId: 'man_city', amount: 3 }, { kind: 'agitation', playerId: 'cur_tevez_u8', amount: 8 }, { kind: 'memory', tag: 'scandal', text: 'Exiled Tévez over the Munich refusal — authority upheld.' }],
          onFailure: [{ kind: 'morale', clubId: 'man_city', amount: -4 }],
        },
        {
          id: 'smooth',
          label: 'Smooth it over to keep his goals',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: 'cur_tevez_u8', amount: 6 }, { kind: 'memory', tag: 'scandal', text: 'Patched things up with Tévez to keep him firing.' }],
          onFailure: [{ kind: 'morale', clubId: 'man_city', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_tevez_u8', amount: 6 }, { kind: 'memory', tag: 'scandal', text: 'Tévez’s Munich refusal triggers a months-long exile.' }],
      memoryTags: ['scandal', 'cur_tevez_u8'],
    }),
  },
  {
    id: 'six-one-old-trafford',
    date: '2011-10',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:six-one-old-trafford',
      title: '6-1 at Old Trafford — "Why Always Me?"',
      description:
        'City demolish United 6-1 in their own back yard, Balotelli revealing a "Why Always Me?" shirt after scoring. Reality: a statement of the new order and one of the derby’s most famous days. Milk the psychological blow to United, or keep the squad grounded with the title still to be won?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'milk',
          label: 'Ram home the statement',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', clubId: 'man_city', amount: 5 }, { kind: 'memory', tag: 'rivalry', text: '6-1 at Old Trafford — the balance of power shifts.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'grounded',
          label: 'Keep the squad grounded',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'rivalry', text: 'Enjoyed the 6-1 but kept the eyes on the prize.' }],
          onFailure: [{ kind: 'morale', clubId: 'man_city', amount: -2 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'rivalry', text: 'City win 6-1 at Old Trafford; Balotelli asks "Why Always Me?"' }],
      memoryTags: ['rivalry'],
    }),
  },
  {
    id: 'aguero-9320',
    date: '2012-05',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:aguero-9320',
      title: 'Agüerooo — 93:20',
      description:
        'Level on points with United on the final day, needing to beat QPR and trailing late, Sergio Agüero scores in the 94th minute to win the title on goal difference. Reality: "93:20" — the most dramatic finish in Premier League history, City’s first league title in 44 years. Build a dynasty on it, or let the euphoria mask the squad’s rough edges?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'dynasty',
          label: 'Build the dynasty',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', clubId: 'man_city', amount: 6 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'silverware', text: '93:20 — champions of England, and hungry for more.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'euphoria',
          label: 'Ride the euphoria',
          successProbability: 0.6,
          onSuccess: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'Basked in the Agüero moment.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 8, text: 'Agüero’s 93:20 winner clinches the title on the final day.' }, { kind: 'memory', tag: 'silverware', text: 'Won the title on goal difference — Agüero, 93:20.' }],
      memoryTags: ['silverware', 'cur_aguero_08'],
    }),
  },
  {
    id: 'mancini-sacked',
    date: '2013-05',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:mancini-sacked',
      title: 'Mancini sacked',
      description:
        'A trophyless title defence and an FA Cup final lost to Wigan have the owners ready to move on from the manager who delivered 93:20. Reality: Mancini was dismissed days after the Wigan defeat, his relationships across the club frayed. Stand by the title-winning coach, or make the ruthless change the owners want?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'stand-by',
          label: 'Stand by Mancini',
          successProbability: 0.45,
          onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'manager', text: 'Kept faith with the man who won 93:20.' }],
          onFailure: [{ kind: 'boardPatience', amount: -5 }],
        },
        {
          id: 'sack',
          label: 'Make the change (as reality did)',
          successProbability: 0.65,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Moved on from Mancini despite the title.' }],
          onFailure: [{ kind: 'fanTrust', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Mancini sacked two days after the Wigan cup final defeat.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'pellegrini-appointed',
    date: '2013-06',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:pellegrini-appointed',
      title: 'Pellegrini appointed',
      description:
        'The owners want a calmer, more expansive approach after Mancini’s abrasive reign. Reality: Manuel Pellegrini — "This Charming Man" — was appointed, and brought a more attacking style and a settled dressing room. Back the change of tone and hand him a refresh, or worry that a softer touch loses the winning edge?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'back',
          label: 'Back Pellegrini’s calmer, attacking project (as reality did)',
          successProbability: 0.75,
          onSuccess: [{ kind: 'managerRelationship', amount: 6 }, { kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Pellegrini in — a calmer dressing room and an attacking plan.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'worry',
          label: 'Demand he keep the hard edge',
          successProbability: 0.5,
          onSuccess: [{ kind: 'memory', tag: 'manager', text: 'Asked the new man to keep the ruthless streak.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Manuel Pellegrini appointed manager.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'title-2014',
    date: '2014-05',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:title-2014',
      title: 'Champions again — Pellegrini’s first',
      description:
        'A relentless, goal-laden season delivers a second title in three years — Agüero, Yaya, Silva, Nasri and Džeko sweeping teams aside. Reality: 156 goals, the League Cup too, and the project firmly established as England’s dominant force. Cement the dynasty and keep the core, or push the squad through a bigger refresh while on top?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'cement',
          label: 'Cement the dynasty',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', clubId: 'man_city', amount: 6 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'silverware', text: 'Champions again — the project is England’s new power.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'refresh',
          label: 'Push a bigger refresh from the top',
          successProbability: 0.55,
          onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Won the title and pressed on with an evolution.' }],
          onFailure: [{ kind: 'morale', clubId: 'man_city', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 7, text: 'Champions again — Pellegrini’s free-scoring first title.' }, { kind: 'memory', tag: 'silverware', text: 'Won the 2014 title, City’s second in three years.' }],
      memoryTags: ['silverware'],
    }),
  },
];

const BARCELONA_2003_PACK: ScriptedEvent[] = [
  {
    // La Masia's crown jewel knocks on the first-team door: promote the 17-year-old
    // Messi, or send him out to toughen up. History fast-tracked him (debut 16 Oct 2004).
    id: 'messi-debut',
    date: '2004-10',
    scenarios: ['barcelona-2003'],
    requires: (s) => playerAt(s, 'cur_messi_b3', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:messi-debut',
      title: 'A 17-year-old from La Masia is ready — his name is Messi',
      description: 'Rijkaard says the boy cannot wait any longer. Reality threw him straight into the first team and the rest is history. Fast-track him into the side now, or protect him with a patient path?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'promote', label: 'Throw him in — the future is now', successProbability: 0.85,
          onSuccess: [{ kind: 'ability', playerId: 'cur_messi_b3', amount: 3 }, { kind: 'morale', playerId: 'cur_messi_b3', amount: 10 }, { kind: 'memory', tag: 'la-masia', text: 'Handed Messi his stage at 17 — as history did.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_messi_b3', amount: 6 }],
        },
        {
          id: 'patient', label: 'A patient path — protect the jewel', successProbability: 0.7,
          onSuccess: [{ kind: 'memory', tag: 'la-masia', text: 'Held Messi back a little longer — the phenomenon will keep.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_messi_b3', amount: 8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'ability', playerId: 'cur_messi_b3', amount: 2 }, { kind: 'memory', tag: 'la-masia', text: 'Messi breaks through regardless — some things history insists upon.' }],
      memoryTags: ['la-masia', 'cur_messi_b3'],
    }),
  },
  // The Rijkaard–Ronaldinho era through the Guardiola dawn. Ronaldinho (2003 in,
  // 2008 out to Milan), Eto'o and Deco (2004 in) are ledger-replayed, so those are
  // NARRATIVE OVERLAYS. The 2009 Eto'o→Inter swap is NOT in the ledger, so that
  // beat carries the real departure. Ibrahimović isn't a curated player here, so
  // his arrival is narrative colour only.
  {
    id: 'laporta-presidency',
    // Laporta won the vote in June 2003, the month before kickoff — surface the new
    // regime's opening statement in the first month of play.
    date: '2003-08',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:laporta-presidency',
      title: 'A new presidency, a new direction',
      description:
        'Joan Laporta has taken the presidency on a promise of galáctico ambition and a return to the top. Reality: his board (with a young Sandro Rosell) reshaped the club and gambled on a Brazilian playmaker. Back an all-in, statement-signing mandate, or a patient, youth-and-structure rebuild?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'statement',
          label: 'Go big — a statement signing (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'fanTrust', amount: 6, text: 'The new board promises the earth — and the Camp Nou believes.' }, { kind: 'memory', tag: 'boardroom', text: 'Laporta’s regime bets on a marquee arrival to relaunch the club.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'patient',
          label: 'Build on youth and structure',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'boardroom', text: 'The new board backs La Masia and the long game.' }],
          onFailure: [{ kind: 'fanTrust', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'boardroom', text: 'Laporta takes the presidency, promising a return to the summit.' }],
      memoryTags: ['boardroom'],
    }),
  },
  {
    id: 'beckham-ronaldinho',
    // Ronaldinho signed in the kickoff window (opening-window owned); the "we chased
    // Beckham, landed Ronaldinho" story lands the month after.
    date: '2003-08',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:beckham-ronaldinho',
      title: 'Missed Beckham, landed Ronaldinho',
      description:
        'The summer’s marquee chase was David Beckham — but he always leaned to Madrid, and the pursuit turned into the signing of Ronaldinho instead. Reality: Laporta felt "used" by the Beckham saga, and Ronaldinho became the face of the revival. Sell the pivot as a triumph, or let the Beckham snub rankle?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'embrace',
          label: 'Ronaldinho is the future — sell the vision',
          successProbability: 0.85,
          onSuccess: [{ kind: 'fanTrust', amount: 6, text: 'Ronaldinho’s smile relaunches the Camp Nou.' }, { kind: 'memory', tag: 'transfer', text: 'Turned the Beckham snub into the signing of Ronaldinho.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'rankle',
          label: 'Let the Beckham snub drive the rivalry',
          successProbability: 0.6,
          onSuccess: [{ kind: 'memory', tag: 'rivalry', text: 'Barça "felt used" by Beckham — the Clásico edge sharpens.' }],
          onFailure: [{ kind: 'fanTrust', amount: -2 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Beckham chose Madrid; Barça signed Ronaldinho instead.' }],
      memoryTags: ['transfer', 'cur_ronaldinho_b3'],
    }),
  },
  {
    id: 'rijkaard-brink',
    date: '2003-12',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona' && s.managerRelations.identity === 'Frank Rijkaard',
    build: () => ({
      id: 'scripted:rijkaard-brink',
      title: 'Rijkaard on the brink',
      description:
        'A poor first half of the season has your coach’s job in question — mid-table and the fans restless. Reality: the board held its nerve, a January spark followed, and Rijkaard went on to build a dynasty. Sack him now, or hold firm and back him through the slump?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'hold',
          label: 'Hold your nerve (as reality did)',
          successProbability: 0.75,
          onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Backed Rijkaard through the slump — the turnaround followed.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -4 }],
        },
        {
          id: 'sack',
          label: 'Pull the trigger now',
          successProbability: 0.35,
          onSuccess: [{ kind: 'memory', tag: 'manager', text: 'Changed the coach mid-season, chasing a spark.' }],
          onFailure: [{ kind: 'boardPatience', amount: -6 }, { kind: 'fanTrust', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'The board kept faith with Rijkaard through a shaky first half.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'davids-loan-spark',
    date: '2004-01',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:davids-loan-spark',
      title: 'Davids’ loan sparks the turnaround',
      description:
        'A January loan for the veteran Edgar Davids injects steel and leadership into a drifting midfield. Reality: it lit the fuse — Barça surged up the table around Xavi and the new arrival. Bring in the warrior on loan, or trust the existing group to find its own way?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'loan',
          label: 'Sign the loan — add the steel (as reality did)',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', clubId: 'barcelona', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Davids’ loan sparked the second-half surge.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'trust',
          label: 'Trust the group as it is',
          successProbability: 0.5,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Backed the existing midfield to find its feet.' }],
          onFailure: [{ kind: 'morale', clubId: 'barcelona', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'barcelona', amount: 3 }, { kind: 'memory', tag: 'transfer', text: 'Davids arrived on loan and helped ignite the turnaround.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'etoo-deco-arrive',
    date: '2004-08',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:etoo-deco-arrive',
      title: 'Eto’o and Deco — the title spine arrives',
      description:
        'Samuel Eto’o (from Mallorca) and Deco (Champions League winner from Porto) join to turn a promising side into champions. Reality: they were the making of the 2005 and 2006 titles. Build the team around the new core, or worry that two big egos will unbalance the room?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'build',
          label: 'Build around the new core (as reality did)',
          successProbability: 0.85,
          onSuccess: [{ kind: 'morale', clubId: 'barcelona', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Eto’o and Deco land — the champions-in-waiting take shape.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'caution',
          label: 'Integrate them cautiously',
          successProbability: 0.6,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Eased the new stars in to protect the dressing room.' }],
          onFailure: [{ kind: 'morale', clubId: 'barcelona', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Eto’o and Deco arrive — the spine of the coming titles.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'first-title-2005',
    date: '2005-05',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:first-title-2005',
      title: 'Champions of Spain again',
      description:
        'Ronaldinho at his peak, Eto’o scoring for fun — Barça are La Liga champions for the first time in six years. Reality: the springboard for a golden era. Reward the squad and push on for Europe, or bank the moment and sell from strength?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'pushon',
          label: 'Reward the squad and go for Europe',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', clubId: 'barcelona', amount: 5 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'Champions of Spain — and eyes on the continent.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'cashin',
          label: 'Sell from strength',
          successProbability: 0.5,
          onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Cashed in from a title-winning position.' }, { kind: 'fanTrust', amount: -3 }],
          onFailure: [{ kind: 'morale', clubId: 'barcelona', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6, text: 'Barça are champions of Spain again — the Ronaldinho era peaks.' }, { kind: 'memory', tag: 'silverware', text: 'First La Liga title under Rijkaard.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'cl-paris-2006',
    date: '2006-05',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:cl-paris-2006',
      title: 'Champions of Europe in Paris',
      description:
        'Barça come from behind to beat Arsenal in the Champions League final in Paris — Belletti’s late winner seals a second European Cup. Reality: the peak of the Rijkaard–Ronaldinho project. Lock the champions down and build a dynasty, or take the peak as a selling window?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'dynasty',
          label: 'Build the dynasty',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', clubId: 'barcelona', amount: 6 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'silverware', text: 'Champions of Europe — and determined to stay there.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'cashin',
          label: 'Cash in at the summit',
          successProbability: 0.5,
          onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Sold from the top of Europe.' }, { kind: 'fanTrust', amount: -4 }],
          onFailure: [{ kind: 'morale', clubId: 'barcelona', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 7, text: 'Champions of Europe in Paris — Belletti sinks Arsenal.' }, { kind: 'memory', tag: 'silverware', text: 'Won the Champions League in Paris.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'decline-indiscipline',
    date: '2007-06',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:decline-indiscipline',
      title: 'The champions go stale',
      description:
        'Success has bred complacency — Ronaldinho’s edge is fading, Deco and Eto’o are unsettled, and the dressing room’s discipline is slipping. Reality: the title was surrendered and the cracks widened toward the 2008 reset. Crack down hard now, or indulge the stars a little longer?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'crackdown',
          label: 'Impose discipline — no untouchables',
          successProbability: 0.55,
          onSuccess: [{ kind: 'morale', clubId: 'barcelona', amount: 3 }, { kind: 'memory', tag: 'crisis', text: 'Cracked down on the slipping standards.' }],
          onFailure: [{ kind: 'morale', clubId: 'barcelona', amount: -5 }],
        },
        {
          id: 'indulge',
          label: 'Indulge the stars a while longer',
          successProbability: 0.4,
          onSuccess: [{ kind: 'memory', tag: 'crisis', text: 'Gave the champions the benefit of the doubt.' }],
          onFailure: [{ kind: 'fanTrust', amount: -5, text: 'The indiscipline festers and the title slips away.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'barcelona', amount: -4 }, { kind: 'memory', tag: 'crisis', text: 'Discipline slipped and the champions went stale.' }],
      memoryTags: ['crisis'],
    }),
  },
  {
    id: 'rijkaard-out-guardiola',
    date: '2008-05',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona' && s.managerRelations.identity === 'Frank Rijkaard',
    build: () => ({
      id: 'scripted:rijkaard-out-guardiola',
      title: 'Rijkaard out — promote the B-team coach?',
      description:
        'Two trophyless years end Rijkaard’s reign. Reality: Barça made the bold call to promote their B-team coach — a certain Pep Guardiola — and cleared out Ronaldinho and Deco to hand the group to Messi. Trust the untested insider and sell the stars, or bring in an established name and keep the marquee men?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'pep',
          label: 'Promote Guardiola and clear the stars (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'manager', text: 'Handed the team to Guardiola and built it around Messi — the dynasty begins.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
        {
          id: 'safe',
          label: 'Hire an established name, keep the stars',
          successProbability: 0.45,
          onSuccess: [{ kind: 'fanTrust', amount: 3 }, { kind: 'memory', tag: 'manager', text: 'Chose a proven coach over the B-team gamble.' }],
          onFailure: [{ kind: 'boardPatience', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Rijkaard out, Guardiola promoted; Ronaldinho and Deco sold to reset the culture.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'treble-sextuple',
    date: '2009-05',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:treble-sextuple',
      title: 'The treble',
      description:
        'Guardiola’s first season delivers La Liga, the Copa del Rey and the Champions League — a treble built on Messi, Xavi and Iniesta and the tiki-taka. Reality: three more cups later in 2009 made it a historic sextuple. Anoint this as the new identity and protect it, or treat a peak as the time to freshen the squad?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'protect',
          label: 'Protect the identity and the core',
          successProbability: 0.85,
          onSuccess: [{ kind: 'morale', clubId: 'barcelona', amount: 6 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'silverware', text: 'The treble — and a philosophy to defend for a decade.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'freshen',
          label: 'Freshen the squad at the peak',
          successProbability: 0.5,
          onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Reinforced from a position of total strength.' }],
          onFailure: [{ kind: 'morale', clubId: 'barcelona', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 8, text: 'The treble — Guardiola’s Barça conquer everything.' }, { kind: 'memory', tag: 'silverware', text: 'Won La Liga, Copa del Rey and the Champions League — the treble (a sextuple by year’s end).' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'ibra-etoo-swap',
    date: '2009-07',
    scenarios: ['barcelona-2003'],
    requires: (s) => playerAt(s, 'cur_etoo_m3', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:ibra-etoo-swap',
      title: 'Ibrahimović in, Eto’o out',
      description:
        'The summer’s big move: sign Zlatan Ibrahimović and let Samuel Eto’o go the other way to Inter. Reality: Barça made the swap — a huge gamble on a different kind of striker. Do the deal and cash in on Eto’o, or keep the treble’s goalscorer and pass on Zlatan?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'swap',
          label: 'Do the swap — Zlatan in, Eto’o to Inter (as reality did)',
          successProbability: 0.8,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_etoo_m3', clubId: 'inter', amount: 20_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Signed Ibrahimović; Eto’o left for Inter in the swap.' }],
          onFailure: [{ kind: 'transferOut', playerId: 'cur_etoo_m3', clubId: 'inter', amount: 20_000_000 }],
        },
        {
          id: 'keep',
          label: 'Keep Eto’o, pass on Zlatan',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_etoo_m3', amount: 6 }, { kind: 'memory', tag: 'transfer', text: 'Kept Eto’o and walked away from the Ibrahimović gamble.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_etoo_m3', amount: 6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'transferOut', playerId: 'cur_etoo_m3', clubId: 'inter', amount: 20_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Ibrahimović signed; Eto’o moved to Inter in the swap.' }],
      memoryTags: ['transfer', 'cur_etoo_m3'],
    }),
  },
  {
    id: 'record-99-points',
    date: '2010-05',
    scenarios: ['barcelona-2003'],
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:record-99-points',
      title: 'A record 99-point title',
      description:
        'Guardiola’s side retain La Liga with a record 99 points, Messi, Xavi and Iniesta at the height of their powers. Reality: statistical dominance, the tiki-taka era in full flow. Push the same core on for more, or begin the careful evolution while on top?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'continue',
          label: 'Keep the core together',
          successProbability: 0.8,
          onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'A record 99 points — and the core kept intact.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'evolve',
          label: 'Begin evolving from the top',
          successProbability: 0.55,
          onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Started the next evolution while still champions.' }],
          onFailure: [{ kind: 'morale', clubId: 'barcelona', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6, text: 'A record 99-point La Liga title — dominance made numeric.' }, { kind: 'memory', tag: 'silverware', text: 'Retained La Liga with a record 99 points.' }],
      memoryTags: ['silverware'],
    }),
  },
];

// The Wenger revolution, 1996-2003. The transfers (Vieira in 1996, Overmars &
// Petit 1997, Anelka out / Henry in 1999, Overmars & Petit out 2000, Campbell
// 2001) are all ledger-replayed, and the coach is already seeded as Wenger, so
// these beats are narrative overlays: morale/fanTrust/boardPatience/memory, each
// with a real Director fork and reality-default fallout.
const ARSENAL_1996_PACK: ScriptedEvent[] = [
  {
    id: 'rioch-sacked',
    date: '1996-08',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:rioch-sacked', title: 'Rioch sacked days before kickoff',
      description: 'Five days before the season opener, the board have fallen out with Bruce Rioch over transfer funds — one season, a 5th place, and it is over. Reality: David Dein won the argument, Pat Rice took caretaker charge, and a little-known foreign coach was already being lined up. Back Rioch with a war chest, or side with Dein and gamble on the untried target?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'back-rioch', label: 'Back Rioch — stability and a war chest', successProbability: 0.4, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Kept faith with Rioch against Dein.' }], onFailure: [{ kind: 'boardPatience', amount: -5 }] },
        { id: 'side-dein', label: 'Side with Dein — dismiss him now (as reality did)', successProbability: 0.7, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Sided with Dein — Rioch out, the foreign gamble on.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Rioch is sacked days before kickoff; Pat Rice takes caretaker charge.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'vieira-signed',
    date: '1996-08',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:vieira-signed', title: 'A 20-year-old from Milan on a coach’s word',
      description: 'David Dein has pushed through a ~£3.5m deal for Patrick Vieira — an unproven 20-year-old rotting in Milan’s reserves, signed on the recommendation of a manager who has not officially started. Reality: the archetype of the Wenger transfer model. Sanction the punt on your future coach’s word, or insist on a Premier-League-ready midfielder first?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'sanction', label: 'Sanction the punt (as reality did)', successProbability: 0.75, onSuccess: [{ kind: 'fanTrust', amount: 3, text: 'A gangly Frenchman arrives — the Wenger model begins.' }, { kind: 'memory', tag: 'transfer', text: 'Signed Vieira on the incoming coach’s recommendation.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'proven', label: 'Demand a proven midfielder instead', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'transfer', text: 'Chose a ready-made midfielder over the gamble.' }], onFailure: [{ kind: 'fanTrust', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 3 }, { kind: 'memory', tag: 'transfer', text: 'Vieira arrives from Milan — the future engine of the Double side.' }],
      memoryTags: ['transfer', 'cur_vieira_a96'],
    }),
  },
  {
    id: 'adams-alcoholism',
    date: '1996-09',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:adams-alcoholism', title: 'Tony Adams admits he is an alcoholic',
      description: 'The club captain has publicly admitted he is an alcoholic and has begun attending AA; his last drink was 16 August, after a bender following England’s Euro 96 exit. Reality: the club stood by him, and he stayed sober and captained both Doubles. Publicly back your captain and fund his recovery, or quietly protect the club’s image by easing him out of the armband?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'back', label: 'Stand behind him — fund the recovery (as reality did)', successProbability: 0.85, onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 6 }, { kind: 'fanTrust', amount: 4, text: 'The club stands by its captain.' }, { kind: 'memory', tag: 'leadership', text: 'Backed Adams through his recovery — captain of both Doubles.' }], onFailure: [] },
        { id: 'ease-out', label: 'Protect the image — ease him out of the captaincy', successProbability: 0.5, onSuccess: [{ kind: 'memory', tag: 'leadership', text: 'Quietly moved the captaincy on.' }], onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -6 }, { kind: 'fanTrust', amount: -5 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'arsenal', amount: 4 }, { kind: 'memory', tag: 'leadership', text: 'Adams is backed through his recovery and stays as captain.' }],
      memoryTags: ['leadership'],
    }),
  },
  {
    id: 'wenger-appointed',
    date: '1996-10',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:wenger-appointed', title: '‘Arsène Who?’',
      description: 'The little-known Frenchman takes charge on 1 October — Arsenal’s first manager born outside the British Isles, greeted by the ‘Arsène Who?’ headline. Reality: he overhauled diet, fitness and scouting and won at Blackburn in his first match. Give him full control over training, diet and transfers, or appoint him but keep a British No. 2 and a boardroom veto?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'full-control', label: 'Full control — let him revolutionise the club', successProbability: 0.7, onSuccess: [{ kind: 'managerRelationship', amount: 12 }, { kind: 'memory', tag: 'manager', text: 'Handed Wenger the keys — diet, fitness and scouting overhauled.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'veto', label: 'Appoint him but keep a boardroom veto', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'managerRelationship', amount: -6 }, { kind: 'memory', tag: 'manager', text: 'Wenger in, but on a leash.' }], onFailure: [{ kind: 'managerRelationship', amount: -10 }] },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'manager', text: 'Wenger takes charge — the revolution begins.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'overmars-petit',
    date: '1997-08',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:overmars-petit', title: 'Wenger’s continental engine — Overmars & Petit',
      description: 'Marc Overmars (~£5.5m from Ajax) and Emmanuel Petit (~£2.5m from Monaco) have arrived, with Grimandi alongside. Reality: Overmars’ pace and Petit’s partnership with Vieira became the engine of the Double side. Reinvest fully in the coach’s recruits, or balance the books after a heavy first summer?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'reinvest', label: 'Reinvest fully (as reality did)', successProbability: 0.75, onSuccess: [{ kind: 'fanTrust', amount: 4, text: 'Overmars and Petit complete Wenger’s spine.' }, { kind: 'memory', tag: 'transfer', text: 'Backed the continental rebuild — the Double engine assembled.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'balance', label: 'Balance the books — sign fewer, cheaper', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Trimmed the summer spend.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Overmars and Petit arrive — the engine of the Double side.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'double-1998',
    date: '1998-05',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:double-1998', title: 'The Double — Wenger’s first full season',
      description: 'A 4-0 win over Everton clinched the title at Highbury, then Newcastle were beaten 2-0 at Wembley (Overmars, Anelka) — the domestic Double in Wenger’s first full season. Reward the squad and hold it together for a title defence, or cash in on peak-value stars while the market is hot?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'hold', label: 'Hold the squad together for a defence', successProbability: 0.7, onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 5 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'Won the Double and kept the champions together.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'cash-in', label: 'Cash in on a star at peak value', successProbability: 0.5, onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Won the Double, then sold from the top.' }], onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6, text: 'Arsenal are champions of England and FA Cup winners — the Double.' }, { kind: 'memory', tag: 'silverware', text: 'Won the 1997-98 Double.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'anelka-real',
    date: '1999-08',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:anelka-real', title: '‘Le Sulk’ sold to Real for a fortune',
      description: 'Bought from PSG for ~£500k two years ago, the disaffected Nicolas Anelka has gone to Real Madrid for ~£22-23m. Reality: the proceeds funded BOTH the new London Colney training centre (~£10m) AND the signing of Henry (~£11m) — not Henry alone. Bank the record profit and reinvest, or hold firm, discipline him and keep your homegrown star?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'sell', label: 'Bank the record profit — fund the training ground & a striker', successProbability: 0.85, onSuccess: [{ kind: 'money', clubId: 'arsenal', amount: 11_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Sold Anelka at a record profit — funded London Colney and Henry.' }], onFailure: [] },
        { id: 'keep', label: 'Hold firm and discipline the sulking prodigy', successProbability: 0.4, onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Kept Anelka against his wishes.' }], onFailure: [{ kind: 'fanTrust', amount: -4 }, { kind: 'boardPatience', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Anelka joins Real Madrid — the profit funds the training ground and Henry.' }],
      memoryTags: ['transfer', 'cur_anelka_a96'],
    }),
  },
  {
    id: 'henry-arrives',
    date: '1999-08',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:henry-arrives', title: 'A misfiring winger, a club-record fee',
      description: 'A ~£11m club record has brought Thierry Henry from Juventus — a struggling wide man in Italy, funded by the Anelka sale. Reality: Wenger converted him into a central striker and he became the club’s all-time leading scorer. Trust the coach to reinvent a winger as your main striker, or spend the money on a proven goalscorer instead?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'trust', label: 'Trust Wenger to reinvent him (as reality did)', successProbability: 0.7, onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'fanTrust', amount: 4, text: 'A new No.14 arrives from Turin.' }, { kind: 'memory', tag: 'transfer', text: 'Backed Wenger on Henry — a club-record striker in the making.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'proven', label: 'Buy a proven Premier League goalscorer', successProbability: 0.5, onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Chose a ready-made scorer over the project.' }], onFailure: [{ kind: 'managerRelationship', amount: -6 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Henry arrives from Juventus — reinvented as a striker.' }],
      memoryTags: ['transfer', 'cur_henry_m'],
    }),
  },
  {
    id: 'pires-arrives',
    date: '2000-07',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:pires-arrives', title: 'Pirès over Real Madrid',
      description: 'France’s Euro 2000 winner Robert Pirès has arrived from Marseille (~£5-6m), Arsenal beating Real Madrid to his signature. Reality: earmarked as the long-term replacement for the departing Overmars, he became a talismanic creator and scorer. Pay up for the marquee international, or promote from within and save the fee for the stadium project?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'pay', label: 'Pay up — replace Overmars with a star (as reality did)', successProbability: 0.75, onSuccess: [{ kind: 'fanTrust', amount: 4, text: 'Pirès chooses Arsenal over Real Madrid.' }, { kind: 'memory', tag: 'transfer', text: 'Signed Pirès to replace Overmars.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'promote', label: 'Promote from within — save for the stadium', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'transfer', text: 'Backed youth and banked the fee for the build.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 3 }, { kind: 'memory', tag: 'transfer', text: 'Pirès signs from Marseille — Overmars’ heir.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'campbell-bosman',
    date: '2001-08',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:campbell-bosman', title: 'Sol Campbell crosses North London',
      description: 'England centre-back Sol Campbell has joined on a free after his Tottenham contract expired — one of the most incendiary transfers in English football, branding him ‘Judas’ to Spurs fans (though several players had crossed the divide before him). Reality: he anchored the 2002 Double and 2004 Invincibles. Take the PR firestorm and sign your rivals’ captain for nothing, or avoid the toxic backlash and buy elsewhere?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'sign', label: 'Sign him — free, and a defensive rock (as reality did)', successProbability: 0.8, onSuccess: [{ kind: 'fanTrust', amount: 4, text: 'Campbell crosses the divide — Highbury has its rock.' }, { kind: 'memory', tag: 'rivalry', text: 'Signed Campbell on a free from Tottenham — ‘Judas’ to Spurs.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'elsewhere', label: 'Avoid the backlash — buy a centre-back elsewhere', successProbability: 0.55, onSuccess: [{ kind: 'memory', tag: 'rivalry', text: 'Passed on the toxic transfer.' }], onFailure: [{ kind: 'fanTrust', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 3 }, { kind: 'memory', tag: 'rivalry', text: 'Campbell joins on a free from Tottenham — the North London firestorm.' }],
      memoryTags: ['rivalry', 'cur_campbell'],
    }),
  },
  {
    id: 'ashburton-grove',
    date: '2001-12',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:ashburton-grove', title: 'Ashburton Grove approved',
      description: 'Islington Council has resolved to grant planning permission for a new 60,000-seat stadium at Ashburton Grove (the Emirates naming-rights deal came later, in 2004). Reality: leaving 38,000-capacity Highbury shaped the club’s finances and transfer budgets for a decade. Commit to a costly self-financed stadium that will squeeze spending for years, or redevelop Highbury / go to Wembley and keep the cash free?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'build', label: 'Commit to the new stadium (as reality did)', successProbability: 0.7, onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'stadium', text: 'Committed to Ashburton Grove — years of squeezed budgets ahead.' }], onFailure: [{ kind: 'money', clubId: 'arsenal', amount: -5_000_000 }] },
        { id: 'stay', label: 'Redevelop Highbury / go to Wembley — keep cash free', successProbability: 0.55, onSuccess: [{ kind: 'money', clubId: 'arsenal', amount: 5_000_000 }, { kind: 'memory', tag: 'stadium', text: 'Stayed put and kept the transfer war chest.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'stadium', text: 'Ashburton Grove approved — the move that would define a decade’s finances.' }],
      memoryTags: ['stadium'],
    }),
  },
  {
    id: 'double-2002',
    date: '2002-05',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:double-2002', title: 'The second Double — title sealed at Old Trafford',
      description: 'Chelsea were beaten 2-0 in the FA Cup final (Parlour, Ljungberg), then the title was clinched with a 1-0 win at Old Trafford (Wiltord) — a second Wenger Double, equalling United’s record of three club Doubles. Declare this the platform for an unbeaten assault and keep it intact, or sell a star at peak value to bankroll the stadium build?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'keep', label: 'Keep it intact — build toward the invincible season', successProbability: 0.7, onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 5 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'Won the Double at Old Trafford — the platform for the Invincibles.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'sell', label: 'Sell a peak-value star for the stadium', successProbability: 0.5, onSuccess: [{ kind: 'money', clubId: 'arsenal', amount: 8_000_000 }, { kind: 'memory', tag: 'silverware', text: 'Won the Double, then cashed in for the build.' }], onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -5 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6, text: 'Arsenal seal the Double at Old Trafford.' }, { kind: 'memory', tag: 'silverware', text: 'Won the 2001-02 Double.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'unbeaten-begins',
    date: '2003-05',
    scenarios: ['arsenal-1996'],
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:unbeaten-begins', title: 'FA Cup retained — and the unbeaten run begins',
      description: 'The title went to United, but the FA Cup was retained (1-0 over Southampton, Pirès). And on 7 May the famous 49-match unbeaten league run quietly began — at the END of this title-losing season, not the next — the springboard for the Invincibles. Endorse Wenger’s public claim that the team can go a whole season unbeaten and build around it, or react to losing the title by overhauling the squad?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'endorse', label: 'Endorse the unbeaten vision — build around this core', successProbability: 0.65, onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'morale', clubId: 'arsenal', amount: 5 }, { kind: 'memory', tag: 'turning-point', text: 'Backed Wenger’s unbeaten claim — the Invincibles were coming.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'overhaul', label: 'Overhaul the squad after losing the title', successProbability: 0.45, onSuccess: [{ kind: 'memory', tag: 'turning-point', text: 'Reacted to losing the title with a rebuild.' }], onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -5 }, { kind: 'managerRelationship', amount: -6 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 4, text: 'Arsenal retain the FA Cup and, unnoticed, begin their unbeaten run.' }, { kind: 'memory', tag: 'turning-point', text: 'The 49-match unbeaten run begins in May 2003.' }],
      memoryTags: ['turning-point'],
    }),
  },
];

const MILAN_1995_PACK: ScriptedEvent[] = [
  {
    id: 'baresi-farewell',
    date: '1997-04',
    scenarios: ['milan-1995'],
    requires: (s) => playerAt(s, 'cur_baresi', 'milan') && s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:baresi-farewell', title: 'Franco Baresi’s last stand',
      description: 'Il Capitano, the greatest libero of them all, is 36 and his body is finally failing him. Reality gave him a farewell season and a retired No.6. Hand him one more year as the emblem, or let him bow out now with the whole San Siro on its feet?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'one-more', label: 'One more year — the captain plays on', onSuccess: [{ kind: 'renewContract', playerId: 'cur_baresi', amount: 1 }, { kind: 'morale', clubId: 'milan', amount: 6 }, { kind: 'memory', tag: 'legend', text: 'Baresi given a farewell season — the San Siro roars.' }] },
        { id: 'retire', label: 'Retire the No.6 with honour', onSuccess: [{ kind: 'letContractLapse', playerId: 'cur_baresi' }, { kind: 'morale', clubId: 'milan', amount: 4 }, { kind: 'memory', tag: 'legend', text: 'Baresi retires a Milan immortal — the shirt goes up into the rafters.' }] },
      ],
      falloutIfIgnored: [{ kind: 'letContractLapse', playerId: 'cur_baresi' }, { kind: 'memory', tag: 'legend', text: 'Baresi’s era quietly ends.' }],
      memoryTags: ['legend', 'cur_baresi'],
    }),
  },
  // The Capello dynasty's tail into the centenary title and the Ancelotti dawn.
  // Transfers (Weah/Baggio in, Shevchenko in, Weah out) are ledger-side; the long
  // managerial churn (Capello→Tabárez→Sacchi→Capello→Zaccheroni→Ancelotti) can't be
  // enacted as coach swaps, so these are narrative overlays.
  {
    id: 'weah-baggio-arrive',
    date: '1995-08',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:weah-baggio-arrive', title: 'Weah and Baggio — a galáctico attack',
      description: 'Capello has rebuilt the front line with George Weah from PSG and Roberto Baggio from champions Juventus. Reality: two superstars, and a balancing act to make them fit. Headline the double marquee splash, or worry it unbalances a winning spine?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'headline', label: 'Build around the two stars (as reality did)', successProbability: 0.8, onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'Weah and Baggio light up the San Siro.' }, { kind: 'memory', tag: 'transfer', text: 'Weah and Baggio arrive — Capello’s star attack.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'balance', label: 'Protect the defensive spine', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Added the stars but kept the balance.' }], onFailure: [{ kind: 'fanTrust', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Weah and Baggio join Capello’s Milan.' }],
      memoryTags: ['transfer', 'cur_weah'],
    }),
  },
  {
    id: 'weah-ballon-dor',
    date: '1995-12',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:weah-ballon-dor', title: 'Weah wins the Ballon d’Or',
      description: 'George Weah becomes the first African-born Ballon d’Or winner — the first edition open to non-Europeans. Reality: a global talisman at his peak. Build the club’s commercial and sporting identity around him, or cash in at maximum value?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'build', label: 'Build around the talisman', successProbability: 0.8, onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'The Ballon d’Or winner is the face of Milan.' }, { kind: 'memory', tag: 'honour', text: 'Weah’s Ballon d’Or crowns the project.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'cashin', label: 'Cash in at peak value', successProbability: 0.4, onSuccess: [{ kind: 'memory', tag: 'honour', text: 'Sold from the very top of the market.' }], onFailure: [{ kind: 'fanTrust', amount: -5 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 4 }, { kind: 'memory', tag: 'honour', text: 'Weah is named Ballon d’Or winner.' }],
      memoryTags: ['honour', 'cur_weah'],
    }),
  },
  {
    id: 'scudetto-15',
    date: '1996-04',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:scudetto-15', title: 'The 15th Scudetto',
      description: 'Milan clinch the title, Weah top-scoring — Capello’s fourth in five years, and, though nobody knows it, his last of this spell. Keep the winning core and the champion coach together, or treat the dynasty’s peak as the moment to rebuild?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'keep', label: 'Keep the champions together', successProbability: 0.8, onSuccess: [{ kind: 'morale', clubId: 'milan', amount: 5 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'The 15th Scudetto — dynasty preserved.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'rebuild', label: 'Rebuild at the peak', successProbability: 0.5, onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Chose to refresh from a title-winning base.' }], onFailure: [{ kind: 'morale', clubId: 'milan', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6, text: 'Milan are champions of Italy — Capello’s fourth title in five years.' }, { kind: 'memory', tag: 'silverware', text: 'Won the 15th Scudetto.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'capello-leaves-tabarez',
    date: '1996-06',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan' && s.managerRelations.identity === 'Fabio Capello',
    build: () => ({
      id: 'scripted:capello-leaves-tabarez', title: 'Capello leaves for Real Madrid',
      description: 'After nine years of success Capello is off to Real Madrid, and Óscar Tabárez is lined up — the first bench change in nearly a decade. Reality: the reboot misfired and the dynasty wobbled. Promote continuity and protect the identity, or gamble on the foreign reboot?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'continuity', label: 'Protect the winning identity', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Kept the Milan way after Capello’s exit.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'reboot', label: 'Gamble on the reboot (as reality did)', successProbability: 0.4, onSuccess: [{ kind: 'memory', tag: 'manager', text: 'Handed the project to a new voice.' }], onFailure: [{ kind: 'boardPatience', amount: -5 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Capello departs for Real Madrid; Tabárez takes over.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'weah-coast-to-coast',
    date: '1996-09',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:weah-coast-to-coast', title: 'Weah’s coast-to-coast',
      description: 'Weah collects the ball in his own box and runs ninety metres to score against Verona — one of Serie A’s greatest solo goals. A moment of pure box office in a faltering season. Milk it commercially, or keep a low profile amid the on-pitch struggles?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'milk', label: 'Make it a global highlight', successProbability: 0.75, onSuccess: [{ kind: 'fanTrust', amount: 4, text: 'Weah’s wonder-goal goes around the world.' }, { kind: 'memory', tag: 'iconic', text: 'Weah’s coast-to-coast against Verona.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'lowkey', label: 'Keep it low-key', successProbability: 0.6, onSuccess: [{ kind: 'memory', tag: 'iconic', text: 'Let the goal speak for itself.' }], onFailure: [] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'iconic', text: 'Weah scores a ninety-metre solo goal against Verona.' }],
      memoryTags: ['iconic', 'cur_weah'],
    }),
  },
  {
    id: 'tabarez-sacked-sacchi',
    date: '1996-12',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:tabarez-sacked-sacchi', title: 'Sacchi’s shock return',
      description: 'The season is unravelling and the call is made to bring back Arrigo Sacchi, five years on from his great side. Reality: the club was already in disarray and limped to 11th. Recall the legend as firefighter, or hold nerve to avoid a mid-season identity crisis?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'sacchi', label: 'Recall Sacchi (as reality did)', successProbability: 0.4, onSuccess: [{ kind: 'memory', tag: 'manager', text: 'Brought Sacchi back to steady the ship.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
        { id: 'hold', label: 'Hold nerve, avoid the churn', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Refused to panic mid-season.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Tabárez sacked; Sacchi returns as the club slides to 11th.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'baggio-departs-capello-returns',
    date: '1997-07',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:baggio-departs-capello-returns', title: 'Baggio out, Capello back',
      description: 'The Divine Ponytail is sold to Bologna (where he’ll score 22) while Capello returns from Madrid to restore order. Reality: the second spell flopped badly. Keep Baggio as creative fulcrum, or let him go and re-hire Capello to reimpose the old discipline?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'keep-baggio', label: 'Keep Baggio', successProbability: 0.5, onSuccess: [{ kind: 'morale', clubId: 'milan', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Kept Baggio’s creativity at the heart of the side.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'capello', label: 'Re-hire Capello (as reality did)', successProbability: 0.45, onSuccess: [{ kind: 'memory', tag: 'manager', text: 'Brought Capello back to reimpose the winning ways.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Baggio leaves for Bologna; Capello returns for a second spell.' }],
      memoryTags: ['manager', 'cur_baggio_r'],
    }),
  },
  {
    id: 'capello-sacked-zaccheroni',
    date: '1998-06',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:capello-sacked-zaccheroni', title: 'Zaccheroni and his 3-4-3',
      description: 'Capello’s return has failed — a distant 10th — and he’s dismissed. The outsider Alberto Zaccheroni is available from Udinese, bringing his 3-4-3 and Oliver Bierhoff. Reality: it clicked into the centenary title. Back the unfashionable outsider and his system, or reach for a reassuring marquee name?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'zac', label: 'Back Zaccheroni’s system (as reality did)', successProbability: 0.65, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Hired Zaccheroni and his 3-4-3 — the centenary title beckons.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'marquee', label: 'Reach for a big name instead', successProbability: 0.45, onSuccess: [{ kind: 'fanTrust', amount: 3 }, { kind: 'memory', tag: 'manager', text: 'Chose a reassuring name over the outsider.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Capello sacked again; Zaccheroni hired from Udinese.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'centenary-scudetto',
    date: '1999-05',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:centenary-scudetto', title: 'The Centenary Scudetto',
      description: 'In the club’s hundredth year, a late surge snatches the title from a Lazio side that looked home — Bierhoff, Weah, Boban and Leonardo powering the run. Reality: the 16th Scudetto. Build a new cycle on it, or bank the glory and coast?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'build', label: 'Reinforce and build a cycle', successProbability: 0.75, onSuccess: [{ kind: 'morale', clubId: 'milan', amount: 6 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'The centenary title — a platform to build on.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'coast', label: 'Bank the glory', successProbability: 0.5, onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Basked in the centenary title.' }], onFailure: [{ kind: 'morale', clubId: 'milan', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6, text: 'Milan snatch the centenary Scudetto from Lazio.' }, { kind: 'memory', tag: 'silverware', text: 'Won the 16th, centenary-season Scudetto.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'shevchenko-arrives',
    date: '1999-07',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:shevchenko-arrives', title: 'Shevchenko arrives from Dynamo Kyiv',
      description: 'Milan sign the prolific Andriy Shevchenko from Dynamo Kyiv. Reality: he plundered 24 league goals to finish Serie A top scorer in his debut season — and hastened Weah’s exit. Spend big on the new spearhead, or spread the budget and keep the veteran Weah central?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'sheva', label: 'Build around Sheva (as reality did)', successProbability: 0.85, onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'Shevchenko is an instant sensation.' }, { kind: 'memory', tag: 'transfer', text: 'Signed Shevchenko — the new spearhead.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'spread', label: 'Keep Weah central, spread the spend', successProbability: 0.5, onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Balanced the budget around the existing stars.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Shevchenko signs and takes Serie A by storm.' }],
      memoryTags: ['transfer', 'cur_shevchenko_k'],
    }),
  },
  {
    id: 'weah-leaves',
    date: '2000-01',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:weah-leaves', title: 'Weah moves on',
      description: 'Squeezed out by Bierhoff, Shevchenko and José Mari, the 33-year-old Weah heads to Chelsea on loan before his contract is cancelled that summer — the end of a five-year, two-Scudetto run. Free the wages and move the legend on, or keep him as a squad leader and mentor?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'move-on', label: 'Move the legend on (as reality did)', successProbability: 0.7, onSuccess: [{ kind: 'memory', tag: 'departure', text: 'Weah moves on after five years and two titles.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
        { id: 'keep', label: 'Keep him as a mentor', successProbability: 0.5, onSuccess: [{ kind: 'morale', clubId: 'milan', amount: 3 }, { kind: 'memory', tag: 'departure', text: 'Kept Weah on as a dressing-room leader.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'departure', text: 'Weah leaves for Chelsea on loan; his Milan contract is cancelled.' }],
      memoryTags: ['departure', 'cur_weah'],
    }),
  },
  {
    id: 'ancelotti-dawn',
    date: '2001-11',
    scenarios: ['milan-1995'],
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:ancelotti-dawn', title: 'The dawn of Ancelotti',
      description: 'The champions have unravelled — Zaccheroni sacked, Fatih Terim tried and dismissed — and Carlo Ancelotti takes charge. Reality: the reset that would build the next dynasty of Champions League glory. Churn coaches chasing a quick fix, or commit fully to Ancelotti’s long-term project?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'commit', label: 'Commit to Ancelotti (as reality did)', successProbability: 0.75, onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'manager', text: 'Backed Ancelotti — the next dynasty begins.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'churn', label: 'Keep chasing a quick fix', successProbability: 0.35, onSuccess: [{ kind: 'memory', tag: 'manager', text: 'Rolled the coaching dice again.' }], onFailure: [{ kind: 'boardPatience', amount: -5 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'After a coaching carousel, Ancelotti takes charge — the reset that builds a dynasty.' }],
      memoryTags: ['manager'],
    }),
  },
];

const JUVENTUS_1995_PACK: ScriptedEvent[] = [
  {
    id: 'juve-1996-final',
    date: '1996-05',
    scenarios: ['juventus-1995'],
    requires: (s) => playerAt(s, 'cur_delpiero_j', 'juventus') && s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:juve-1996-final', title: 'The European Cup final — Ajax await in Rome',
      description: 'Lippi’s Juventus have reached the final against the young champions of Ajax. Reality settled it on penalties, and the trophy came back to Turin. How do you set them up for the biggest night — go for the throat, or strangle the game and trust your nerve from the spot?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'attack', label: 'Go for the throat', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 8 }, { kind: 'morale', clubId: 'juventus', amount: 10 }, { kind: 'memory', tag: 'europe', text: 'Juventus attack Ajax and are crowned kings of Europe.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -6 }] },
        { id: 'control', label: 'Control it, trust the shootout', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 8 }, { kind: 'morale', clubId: 'juventus', amount: 8 }, { kind: 'memory', tag: 'europe', text: 'Juventus hold their nerve and win the European Cup on penalties — as reality had it.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -6 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'europe', text: 'The European Cup final comes and goes.' }],
      memoryTags: ['europe'],
    }),
  },
  // Lippi's dynasty: three straight CL finals (one won), two Scudetti, the Zeman
  // scandal and Del Piero's injury, into the Zidane sale. Transfers are ledger-side;
  // the manager changes can't be enacted — narrative overlays throughout.
  {
    id: 'baggio-sold',
    date: '1995-08',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:baggio-sold', title: 'Baggio sold — Del Piero’s No.10',
      description: 'With Del Piero emerging and Lippi favouring youth, the Divine Ponytail is sold to rivals Milan. Reality: Juve won the Scudetto that first Lippi season without him. Keep the ageing icon and box-office draw, or hand the No.10 fully to the 20-year-old?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'youth', label: 'Hand it to Del Piero (as reality did)', successProbability: 0.75, onSuccess: [{ kind: 'morale', playerId: 'cur_delpiero_j', amount: 8 }, { kind: 'memory', tag: 'transfer', text: 'Sold Baggio; the No.10 is Del Piero’s.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
        { id: 'keep', label: 'Keep the icon', successProbability: 0.45, onSuccess: [{ kind: 'fanTrust', amount: 4, text: 'Kept Baggio — the crowds are delighted.' }], onFailure: [{ kind: 'morale', playerId: 'cur_delpiero_j', amount: -6 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Baggio sold to Milan; the Del Piero era begins.' }],
      memoryTags: ['transfer', 'cur_baggio_r'],
    }),
  },
  {
    id: 'vialli-ravanelli-leave',
    date: '1996-07',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:vialli-ravanelli-leave', title: 'The winning strikeforce dismantled',
      description: 'Weeks after lifting the European Cup, captain Vialli leaves on a Bosman free to Chelsea and Ravanelli is sold to Middlesbrough. Reality: the champions’ attack was broken up at its peak. Retain the winning forwards, or sanction the exodus and rebuild around Del Piero and a new signing?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'rebuild', label: 'Let them go and rebuild (as reality did)', successProbability: 0.65, onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Vialli and Ravanelli move on; a new spine takes shape.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -3 }] },
        { id: 'retain', label: 'Retain the European-winning attack', successProbability: 0.4, onSuccess: [{ kind: 'morale', clubId: 'juventus', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Held the winning forwards together.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Vialli (free to Chelsea) and Ravanelli (Middlesbrough) leave after the final.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'zidane-arrives-juve',
    date: '1996-07',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:zidane-arrives-juve', title: 'Zidane arrives from Bordeaux',
      description: 'Juventus sign Zinedine Zidane from Bordeaux for a modest fee — a playmaker unproven in Italy. Reality: he became the creative fulcrum of the team. Gamble the fee on the Frenchman, or spend it on an established Serie A name?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'zidane', label: 'Sign Zidane (as reality did)', successProbability: 0.85, onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Signed Zidane — the fulcrum of the great side.' }, { kind: 'fanTrust', amount: 3 }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'proven', label: 'Buy an established name', successProbability: 0.5, onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Chose a proven Serie A star over the gamble.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Zidane joins from Bordeaux.' }],
      memoryTags: ['transfer', 'cur_zidane_b'],
    }),
  },
  {
    id: 'juve-scudetto-24',
    date: '1997-05',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:juve-scudetto-24', title: 'Scudetto No.24',
      description: 'The new Del Piero–Zidane axis delivers the league title. Reality: the first crown of the team that would dominate Serie A. Stand pat with a champion squad, or push the wage bill to strengthen for another European tilt?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'stand', label: 'Keep the champions', successProbability: 0.75, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'Scudetto No.24 — the Del Piero–Zidane axis rules Italy.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'push', label: 'Strengthen for Europe', successProbability: 0.55, onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Pushed the budget to chase the European Cup again.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'Won Scudetto No.24.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'cl-final-dortmund-1997',
    date: '1997-05',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:cl-final-dortmund-1997', title: 'Champions League final lost to Dortmund',
      description: 'Defending champions, Juventus lose the final 3-1 to Borussia Dortmund, Del Piero’s late goal a mere consolation. Reality: a first defeat in what would be three straight finals. Blame fatigue and keep faith, or make a marquee signing to close the European gap?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'faith', label: 'Keep faith with the group', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'near-miss', text: 'Took the Dortmund defeat on the chin and went again.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -3 }] },
        { id: 'marquee', label: 'Sign a marquee to close the gap', successProbability: 0.5, onSuccess: [{ kind: 'memory', tag: 'near-miss', text: 'Reinforced after the European final loss.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'near-miss', text: 'Lost the 1997 Champions League final to Dortmund.' }],
      memoryTags: ['near-miss'],
    }),
  },
  {
    id: 'inzaghi-davids',
    date: '1997-06',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:inzaghi-davids', title: 'Inzaghi signs; Davids joins in winter',
      description: 'The reigning Serie A top scorer Filippo Inzaghi arrives, and that winter Edgar "Pitbull" Davids joins from Milan to become the engine of the midfield. Reality: two shrewd additions to a title machine. Build the attack around the poacher Inzaghi, or keep Del Piero central and adapt around him?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'inzaghi', label: 'Build around Inzaghi’s goals', successProbability: 0.7, onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Inzaghi and Davids in — the machine gets stronger.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'delpiero', label: 'Keep Del Piero as the focal point', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_delpiero_j', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Adapted the new men around Del Piero.' }], onFailure: [] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Inzaghi signs; Davids arrives in winter.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'juve-scudetto-25',
    date: '1998-05',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:juve-scudetto-25', title: 'Scudetto No.25',
      description: 'A bitter title race with Ronaldo’s Inter — defined by the disputed no-penalty on the Iuliano–Ronaldo clash — ends in Juventus’ hands. Reality: another Scudetto amid controversy. Ride the momentum toward the European final, or rotate to protect key legs for Amsterdam?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'ride', label: 'Ride the momentum', successProbability: 0.7, onSuccess: [{ kind: 'morale', clubId: 'juventus', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'Scudetto No.25 — into the European final on a high.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'rotate', label: 'Rotate for Amsterdam', successProbability: 0.6, onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Managed the legs for the European final.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'Won Scudetto No.25 in a bitter race with Inter.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'cl-final-real-1998',
    date: '1998-05',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:cl-final-real-1998', title: 'Champions League final lost to Real Madrid',
      description: 'A third straight final, in Amsterdam — and a second straight defeat, 1-0 to Real Madrid, Mijatović scoring. Reality: three finals, one win. Accept the near-miss and persist with the group, or overhaul a side that keeps falling at the last?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'persist', label: 'Persist with the group', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'near-miss', text: 'Kept faith after a second straight final defeat.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -3 }] },
        { id: 'overhaul', label: 'Overhaul after three finals', successProbability: 0.45, onSuccess: [{ kind: 'memory', tag: 'near-miss', text: 'Reshaped the squad after the Amsterdam loss.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'near-miss', text: 'Lost the 1998 Champions League final to Real Madrid.' }],
      memoryTags: ['near-miss'],
    }),
  },
  {
    id: 'zeman-doping',
    date: '1998-08',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:zeman-doping', title: 'The Zeman doping accusations',
      description: 'Roma’s coach Zeman has alleged doping in Italian football, naming Juventus players, and a Turin prosecutor opens an investigation. Reality: a long saga (with later acquittals) that shadowed the club. Circle the wagons and sue, or cooperate publicly and reform the medical practices?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'fight', label: 'Circle the wagons and sue Zeman', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'scandal', text: 'Fought the Zeman allegations head-on.' }], onFailure: [{ kind: 'fanTrust', amount: -4 }] },
        { id: 'cooperate', label: 'Cooperate and reform', successProbability: 0.55, onSuccess: [{ kind: 'fanTrust', amount: 3 }, { kind: 'memory', tag: 'scandal', text: 'Cooperated with the inquiry and reformed practices.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'scandal', text: 'Zeman’s doping allegations trigger a Turin investigation.' }],
      memoryTags: ['scandal'],
    }),
  },
  {
    id: 'delpiero-injury',
    date: '1998-11',
    scenarios: ['juventus-1995'],
    requires: (s) => playerAt(s, 'cur_delpiero_j', 'juventus') && s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:delpiero-injury', title: 'Del Piero’s cruciate at Udine',
      description: 'Your talisman ruptures knee ligaments at the Friuli, needing surgery in Colorado and around nine months out. Reality: he was never quite the same explosive player. Sign an emergency forward to cover, or trust the squad and preserve the budget?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'cover', label: 'Sign emergency cover', successProbability: 0.6, onSuccess: [{ kind: 'memory', tag: 'injury', text: 'Brought in cover for the stricken Del Piero.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'trust', label: 'Trust the squad', successProbability: 0.45, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'injury', text: 'Held the budget and rode out the absence.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'ban', playerId: 'cur_delpiero_j', months: 9 }, { kind: 'memory', tag: 'injury', text: 'Del Piero ruptures his cruciate at Udinese.' }],
      memoryTags: ['injury', 'cur_delpiero_j'],
    }),
  },
  {
    id: 'ancelotti-replaces-lippi',
    date: '1999-02',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus' && s.managerRelations.identity === 'Marcello Lippi',
    build: () => ({
      id: 'scripted:ancelotti-replaces-lippi', title: 'Ancelotti replaces Lippi',
      description: 'Mired in their worst domestic season in years amid injuries, the club faces a call on Lippi. Reality: he departed and Carlo Ancelotti was appointed. Back Lippi to steady the ship, or make the change and hand Ancelotti a rebuild?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'keep-lippi', label: 'Back Lippi', successProbability: 0.5, onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'manager', text: 'Kept faith with Lippi through the slump.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
        { id: 'ancelotti', label: 'Appoint Ancelotti (as reality did)', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Handed the rebuild to Ancelotti.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Lippi departs; Ancelotti is appointed head coach.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'lippi-returns',
    date: '2001-06',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:lippi-returns', title: 'Lippi returns as Ancelotti goes',
      description: 'After two seasons as runners-up — one lost on the final day — Ancelotti is dismissed and Lippi returns for a second spell. Reality: the reunion that would restore the Scudetti. Persevere with Ancelotti’s project, or bring back the man who won it all in 1996?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'lippi', label: 'Bring Lippi back (as reality did)', successProbability: 0.7, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Lippi returns to restore the winning years.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'ancelotti', label: 'Persevere with Ancelotti', successProbability: 0.5, onSuccess: [{ kind: 'managerRelationship', amount: 6 }, { kind: 'memory', tag: 'manager', text: 'Stuck with Ancelotti’s project.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Ancelotti dismissed; Lippi returns for a second spell.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'zidane-sold-thuram-buffon',
    date: '2001-07',
    scenarios: ['juventus-1995'],
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:zidane-sold-thuram-buffon', title: 'Zidane sold; Thuram & Buffon arrive',
      description: 'Real Madrid offer a world-record fee for Zidane, and Juventus reinvest in Lilian Thuram (a world record for a defender) and the record keeper Gianluigi Buffon. Reality: cash in and rebuild the spine — and it worked. Take the money and remake the team, or reject Madrid and keep your galáctico?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'sell', label: 'Cash in and rebuild the spine (as reality did)', successProbability: 0.75, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Sold Zidane at a world record; Thuram and Buffon in.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
        { id: 'keep', label: 'Reject Madrid, keep Zidane', successProbability: 0.4, onSuccess: [{ kind: 'fanTrust', amount: 6, text: 'Kept Zidane against Madrid’s millions.' }, { kind: 'morale', clubId: 'juventus', amount: 4 }], onFailure: [{ kind: 'agitation', playerId: 'cur_zidane_b', amount: 8 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Zidane sold to Real Madrid; Thuram and Buffon signed with the proceeds.' }],
      memoryTags: ['transfer', 'cur_zidane_b'],
    }),
  },
];

const LIVERPOOL_1995_PACK: ScriptedEvent[] = [
  {
    id: 'spice-boys-final',
    date: '1996-05',
    scenarios: ['liverpool-1995'],
    requires: (s) => playerAt(s, 'cur_mcmanaman_95', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:spice-boys-final', title: 'The Cup final — and the white Armani suits',
      description: 'Evans’ gifted young side reach the FA Cup final against Manchester United — but the story before kickoff is the cream Armani suits they wore up the Wembley steps, and the "Spice Boys" tag hardening around them. Reality: they looked the part and lost the game. Rein in the image and lock in, or let them be who they are?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'focus', label: 'Rein it in — all business', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'morale', clubId: 'liverpool', amount: 6 }, { kind: 'memory', tag: 'culture', text: 'Cut the circus and focused the Spice Boys — a different Wembley.' }], onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -4 }] },
        { id: 'let-be', label: 'Let them be the Spice Boys', successProbability: 0.35, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 4 }], onFailure: [{ kind: 'boardPatience', amount: -5 }, { kind: 'memory', tag: 'culture', text: 'The suits, the swagger, the defeat — the Spice Boys legend written, as it was.' }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'culture', text: 'The Spice Boys have their Wembley day.' }],
      memoryTags: ['culture'],
    }),
  },
  // The Evans 'Spice Boys' years into Houllier's cup treble. Transfers are
  // ledger-side; Owen (a 1997 academy breakthrough, not curated at 1995 kickoff) and
  // the manager changes are narrative — overlays throughout.
  {
    id: 'collymore-record',
    date: '1995-08',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:collymore-record', title: 'A British-record £8.5m for Collymore',
      description: 'Roy Evans breaks the British transfer record for Stan Collymore, intending a partnership with Fowler. Reality: flashes of brilliance, but a troubled spell. Sanction the record outlay to chase the title now, or bank the fee and promote from within (Fowler, McManaman, the emerging youth)?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'spend', label: 'Break the record for Collymore (as reality did)', successProbability: 0.7, onSuccess: [{ kind: 'fanTrust', amount: 4, text: 'A British-record signing announces Liverpool’s intent.' }, { kind: 'memory', tag: 'transfer', text: 'Signed Collymore for a British-record fee.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'promote', label: 'Bank it and back the youth', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Backed the homegrown core over a record signing.' }], onFailure: [{ kind: 'fanTrust', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Collymore signs for a British-record £8.5m.' }],
      memoryTags: ['transfer', 'cur_collymore_95'],
    }),
  },
  {
    id: 'rush-leaves',
    date: '1996-06',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:rush-leaves', title: 'Ian Rush leaves on a free',
      description: 'The club’s all-time top scorer (346 goals) is out of contract after 16 seasons and can leave on a free. Reality: he went to Leeds; the end of an era. Offer a one-year extension or coaching role to keep the legend mentoring the young strikers, or let him walk and complete the handover to Fowler and Owen?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'keep', label: 'Keep the legend as a mentor', successProbability: 0.5, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 4 }, { kind: 'memory', tag: 'departure', text: 'Kept Rush on to mentor the young strikers.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'walk', label: 'Let him walk, complete the handover (as reality did)', successProbability: 0.65, onSuccess: [{ kind: 'memory', tag: 'departure', text: 'Rush departs; the future belongs to Fowler and Owen.' }], onFailure: [{ kind: 'fanTrust', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'departure', text: 'Ian Rush leaves on a free after 16 seasons.' }],
      memoryTags: ['departure', 'cur_rush_95'],
    }),
  },
  {
    id: 'owen-breakthrough',
    date: '1997-05',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:owen-breakthrough', title: 'Michael Owen’s breakthrough',
      description: 'A 17-year-old debuts and scores at Wimbledon, then explodes with 18 league goals to finish joint top scorer. Reality: a teenage sensation, stepping up after Fowler’s injury. Fast-track him into the first team on senior wages (risking burnout), or manage his minutes and tie him to a long youth deal?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'fasttrack', label: 'Fast-track him (as reality did)', successProbability: 0.8, onSuccess: [{ kind: 'fanTrust', amount: 4, text: 'A teenage goalscoring phenomenon is born.' }, { kind: 'memory', tag: 'youth', text: 'Owen breaks through at 17.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'manage', label: 'Manage his minutes carefully', successProbability: 0.6, onSuccess: [{ kind: 'memory', tag: 'youth', text: 'Protected the prodigy with a patient path.' }], onFailure: [{ kind: 'fanTrust', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'youth', text: 'Michael Owen explodes onto the scene as a teenager.' }],
      memoryTags: ['youth'],
    }),
  },
  {
    id: 'fowler-knee',
    date: '1998-02',
    scenarios: ['liverpool-1995'],
    requires: (s) => playerAt(s, 'cur_fowler_95', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:fowler-knee', title: 'Fowler’s knee wrecked in the derby',
      description: 'A collision with Everton’s keeper ruptures Fowler’s knee ligaments — around seven months out, and it will cost him the World Cup and blunt his peak. Reality: 129 of his 183 Liverpool goals came before this. Fund an elite overseas surgery/rehab to protect the asset, or pivot the attack permanently around Owen?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'rehab', label: 'Fund the best rehab to protect him', successProbability: 0.55, onSuccess: [{ kind: 'ban', playerId: 'cur_fowler_95', months: 7 }, { kind: 'morale', playerId: 'cur_fowler_95', amount: 5 }, { kind: 'memory', tag: 'injury', text: 'Gave Fowler the best chance to come back strong.' }], onFailure: [{ kind: 'ban', playerId: 'cur_fowler_95', months: 7 }] },
        { id: 'pivot', label: 'Pivot the attack around Owen', successProbability: 0.6, onSuccess: [{ kind: 'ban', playerId: 'cur_fowler_95', months: 7 }, { kind: 'memory', tag: 'injury', text: 'Rebuilt the attack around Owen during Fowler’s absence.' }], onFailure: [{ kind: 'ban', playerId: 'cur_fowler_95', months: 7 }, { kind: 'morale', clubId: 'liverpool', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'ban', playerId: 'cur_fowler_95', months: 7 }, { kind: 'memory', tag: 'injury', text: 'Fowler’s knee ligaments rupture in the Merseyside derby.' }],
      memoryTags: ['injury', 'cur_fowler_95'],
    }),
  },
  {
    id: 'owen-wonder-goal',
    date: '1998-06',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:owen-wonder-goal', title: 'Owen’s wonder goal v Argentina',
      description: 'At the World Cup, 18-year-old Owen scores a solo goal against Argentina and becomes a global star overnight. Reality: his value and profile rocket. Cash in at peak global interest, or build the commercial and sporting project around him with an improved, longer contract?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'build', label: 'Build around him with a new deal', successProbability: 0.75, onSuccess: [{ kind: 'fanTrust', amount: 5, text: 'The world’s brightest teenager is tied to Anfield.' }, { kind: 'memory', tag: 'international', text: 'Owen’s wonder goal makes him a global star; the club builds around him.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'cashin', label: 'Cash in at peak interest', successProbability: 0.4, onSuccess: [{ kind: 'memory', tag: 'international', text: 'Sold at the very height of Owen-mania.' }], onFailure: [{ kind: 'fanTrust', amount: -5 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'international', text: 'Owen’s solo goal against Argentina makes him a global star.' }],
      memoryTags: ['international'],
    }),
  },
  {
    id: 'houllier-joint',
    date: '1998-07',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool' && s.managerRelations.identity === 'Roy Evans',
    build: () => ({
      id: 'scripted:houllier-joint', title: 'Houllier arrives as joint manager',
      description: 'The club takes the unprecedented step of installing Gérard Houllier alongside Roy Evans as joint managers. Reality: a divided dressing room and blurred authority from day one. Commit to the joint-manager experiment, or give Houllier a Director-of-Football role and keep a single clear chain of command to Evans?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'joint', label: 'Try the joint-manager experiment (as reality did)', successProbability: 0.4, onSuccess: [{ kind: 'memory', tag: 'manager', text: 'Installed Houllier alongside Evans.' }], onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -4 }] },
        { id: 'clarify', label: 'Clarify a single chain of command', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Avoided the divided-authority trap.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Houllier joins Evans as joint manager — authority blurred from day one.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'evans-resigns',
    date: '1998-11',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool' && s.managerRelations.identity === 'Roy Evans',
    build: () => ({
      id: 'scripted:evans-resigns', title: 'Evans resigns; Houllier takes sole charge',
      description: 'After a home defeat to Spurs, Roy Evans resigns in tears, ending the awkward dual role. Houllier takes sole command and begins dismantling the "Spice Boys" culture. Reality: a hard cultural reset followed. Hand Houllier full autonomy for the reset, or insist on retaining boot-room continuity within a restructured staff?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'autonomy', label: 'Full autonomy for the reset (as reality did)', successProbability: 0.7, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Gave Houllier the keys for a hard cultural reset.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'continuity', label: 'Retain boot-room continuity', successProbability: 0.45, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 3 }, { kind: 'memory', tag: 'manager', text: 'Kept a thread of Anfield continuity in the restructure.' }], onFailure: [{ kind: 'managerRelationship', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Evans resigns; Houllier takes sole charge and resets the culture.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'mcmanaman-bosman',
    date: '1999-07',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:mcmanaman-bosman', title: 'McManaman leaves for Real Madrid (Bosman)',
      description: 'Having agreed a pre-contract in January, Steve McManaman completes a free transfer to Real Madrid — one of the era’s landmark Bosman departures, and Liverpool get nothing for a homegrown star. Reality: he’d win two Champions Leagues in Spain. Sell in the January window for a real fee once the pre-contract is known, or keep him for the run-in and lose him for free?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'sell-jan', label: 'Cash in early rather than lose him free', successProbability: 0.55, onSuccess: [{ kind: 'memory', tag: 'departure', text: 'Salvaged a fee before McManaman’s Bosman exit.' }], onFailure: [{ kind: 'fanTrust', amount: -2 }] },
        { id: 'keep-runin', label: 'Keep him for the run-in (as reality did)', successProbability: 0.6, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 3 }, { kind: 'memory', tag: 'departure', text: 'Kept McManaman to the end, then lost him for nothing.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'departure', text: 'McManaman leaves for Real Madrid on a Bosman free.' }],
      memoryTags: ['departure', 'cur_mcmanaman_95'],
    }),
  },
  {
    id: 'houllier-rebuild',
    date: '2000-07',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:houllier-rebuild', title: 'Houllier’s rebuild for the treble push',
      description: 'Houllier reshapes the squad with pragmatic recruits — Hyypiä, Heskey, plus free/veteran additions McAllister, Babbel and Barmby — building the solid, counter-attacking side that would peak in 2000-01. Bankroll the blend of experienced frees and a marquee striker, or demand a younger, cheaper homegrown core?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'bankroll', label: 'Back Houllier’s blend (as reality did)', successProbability: 0.75, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Backed the pragmatic rebuild — the treble side takes shape.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'homegrown', label: 'Demand a younger, cheaper core', successProbability: 0.5, onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Held the budget and leaned on youth.' }], onFailure: [{ kind: 'managerRelationship', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Houllier rebuilds with Hyypiä, Heskey, McAllister and more.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'league-cup-2001',
    date: '2001-02',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:league-cup-2001', title: 'League Cup won — treble part one',
      description: 'A penalty-shootout win over Birmingham lifts the first trophy of a cup treble, ending a six-year drought. Treat the League Cup as a priority to build momentum, or rotate heavily to protect the UEFA Cup and top-four push?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'priority', label: 'Win it — build momentum', successProbability: 0.75, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'The drought ends — first leg of the cup treble.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'rotate', label: 'Rotate for the bigger prizes', successProbability: 0.6, onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Managed the load across the cup runs.' }], onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'silverware', text: 'League Cup won on penalties — the treble begins.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'fa-cup-2001',
    date: '2001-05',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:fa-cup-2001', title: 'FA Cup won — Owen sinks Arsenal',
      description: 'Trailing late, Michael Owen scores twice in the final minutes to beat Arsenal 2-1 — treble part two. Reality: days before a UEFA Cup final. Rest key men for the European final, or go full-strength to guarantee the silverware in hand?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'rest', label: 'Rest men for the UEFA Cup final', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'silverware', text: 'Won the Cup and protected legs for Dortmund.' }], onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -2 }] },
        { id: 'fullstrength', label: 'Go full-strength', successProbability: 0.7, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Owen’s double beats Arsenal — treble part two.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'silverware', text: 'Owen’s late double beats Arsenal in the FA Cup final.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'uefa-cup-2001',
    date: '2001-05',
    scenarios: ['liverpool-1995'],
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:uefa-cup-2001', title: 'UEFA Cup — 5-4 v Alavés completes the treble',
      description: 'A five-goal-each classic against Alavés, settled by a golden-goal own goal in extra time, completes an unprecedented cup treble just four days after the FA Cup. Use the treble to sanction a bigger summer and push for the league title, or consolidate and reinvest selectively on inflated values?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'push', label: 'Go for the league title', successProbability: 0.65, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'The cup treble complete — now for the league.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'consolidate', label: 'Consolidate and reinvest selectively', successProbability: 0.6, onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Banked the treble and built carefully.' }], onFailure: [{ kind: 'fanTrust', amount: -2 }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 8, text: 'A 5-4 classic against Alavés completes an unprecedented cup treble.' }, { kind: 'memory', tag: 'silverware', text: 'Won the UEFA Cup 5-4 to complete the treble.' }],
      memoryTags: ['silverware'],
    }),
  },
];

const CHELSEA_1996_PACK: ScriptedEvent[] = [
  {
    id: 'gullit-vialli',
    date: '1998-02',
    scenarios: ['chelsea-1996'],
    requires: (s) => playerAt(s, 'cur_vialli_c96', 'chelsea') && s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:gullit-vialli', title: 'Vialli frozen out by player-manager Gullit',
      description: 'Ruud Gullit is barely picking Gianluca Vialli, and the dressing room is split. Reality: the board sacked Gullit and Vialli took charge — and promptly won the Cup Winners’ Cup. Back your manager, or side with the striker the players adore?',
      interrupt: true, clubId: 'chelsea', category: 'event',
      choices: [
        { id: 'back-gullit', label: 'Back Gullit — hold the line', successProbability: 0.45, onSuccess: [{ kind: 'managerRelationship', amount: 8 }], onFailure: [{ kind: 'morale', clubId: 'chelsea', amount: -6 }, { kind: 'agitation', playerId: 'cur_vialli_c96', amount: 10 }] },
        { id: 'back-vialli', label: 'Side with Vialli and the players', successProbability: 0.7, onSuccess: [{ kind: 'morale', playerId: 'cur_vialli_c96', amount: 12 }, { kind: 'morale', clubId: 'chelsea', amount: 5 }, { kind: 'managerRelationship', amount: -10 }, { kind: 'memory', tag: 'dressing-room', text: 'Sided with Vialli over Gullit — the room’s mood lifts, the manager fumes.' }], onFailure: [{ kind: 'managerRelationship', amount: -12 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_vialli_c96', amount: 8 }, { kind: 'memory', tag: 'dressing-room', text: 'The Gullit–Vialli standoff festers.' }],
      memoryTags: ['dressing-room', 'cur_vialli_c96'],
    }),
  },
];

const CHELSEA_2003_PACK: ScriptedEvent[] = [
  {
    id: 'abramovich-warchest',
    date: '2003-08',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:abramovich-warchest', title: 'Abramovich hands you a bottomless war chest',
      description: 'The Russian has bought the club and money is suddenly no object. Reality was a scattergun £100m+ splurge — Verón, Crespo, Mutu, Duff, Makélélé — that took a year and Mourinho to knit together. Blow the lot on marquee names now, or build with a plan?',
      interrupt: true, clubId: 'chelsea', category: 'event',
      choices: [
        { id: 'splurge', label: 'Spend it all now — announce yourselves', successProbability: 0.85, onSuccess: [{ kind: 'money', clubId: 'chelsea', amount: 60_000_000 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'takeover', text: 'The Roman revolution begins with a spending spree.' }], onFailure: [] },
        { id: 'plan', label: 'Build with a plan — quality over noise', successProbability: 0.75, onSuccess: [{ kind: 'money', clubId: 'chelsea', amount: 70_000_000 }, { kind: 'memory', tag: 'takeover', text: 'Held the nerve — a smarter build than reality managed.' }], onFailure: [{ kind: 'money', clubId: 'chelsea', amount: 55_000_000 }] },
      ],
      falloutIfIgnored: [{ kind: 'money', clubId: 'chelsea', amount: 60_000_000 }, { kind: 'memory', tag: 'takeover', text: 'The Abramovich billions arrive.' }],
      memoryTags: ['takeover'],
    }),
  },
  {
    id: 'mutu-scandal',
    date: '2004-09',
    scenarios: ['chelsea-2003'],
    requires: (s) => playerAt(s, 'cur_mutu_c3', 'chelsea') && s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:mutu-scandal', title: 'Adrian Mutu fails a drugs test',
      description: 'Your Romanian forward has tested positive for cocaine. Reality: Chelsea tore up his contract, sacked him and pursued him for damages. Cut him loose to protect the club, or stand by a troubled talent and try to save him?',
      interrupt: true, clubId: 'chelsea', category: 'event',
      choices: [
        { id: 'sack', label: 'Tear up his contract — protect the club', successProbability: 0.9, onSuccess: [{ kind: 'letContractLapse', playerId: 'cur_mutu_c3' }, { kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'scandal', text: 'Mutu sacked over the failed test — as reality had it.' }], onFailure: [] },
        { id: 'stand-by', label: 'Stand by him — rehab and a second chance', successProbability: 0.4, onSuccess: [{ kind: 'morale', playerId: 'cur_mutu_c3', amount: 10 }, { kind: 'memory', tag: 'scandal', text: 'Stood by Mutu through his ban — a road not taken in reality.' }], onFailure: [{ kind: 'boardPatience', amount: -6 }, { kind: 'agitation', playerId: 'cur_mutu_c3', amount: 10 }] },
      ],
      falloutIfIgnored: [{ kind: 'letContractLapse', playerId: 'cur_mutu_c3' }, { kind: 'memory', tag: 'scandal', text: 'The Mutu affair ends his Chelsea career.' }],
      memoryTags: ['scandal', 'cur_mutu_c3'],
    }),
  },
  // The Roman revolution, 2003–08. Every marquee move (the 2003 spree, Drogba/Čech/
  // Carvalho/Robben in 2004, Shevchenko and Ashley Cole in 2006, Duff out) is
  // ledger-replayed, so these are NARRATIVE OVERLAYS — the ownership, the Mourinho
  // arc, the trophies and the near-misses — with no duplicate transfers.
  {
    id: 'abramovich-takeover',
    // Completed Jul 2003 (kickoff month, opening-window owned); the ownership-shift
    // beat lands the month after, alongside the spending.
    date: '2003-08',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:abramovich-takeover',
      title: 'The Roman revolution',
      description:
        'Roman Abramovich has bought the club from Ken Bates, and with him come limitless funds — and limitless expectation. Reality: Chelsea were transformed overnight into a superpower, and patience grew short. Embrace the revolution and its win-now pressure, or try to manage the culture shift and protect the existing dressing room?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'embrace',
          label: 'Embrace the revolution (as reality did)',
          successProbability: 0.75,
          onSuccess: [{ kind: 'fanTrust', amount: 6, text: 'The Roman era begins — Stamford Bridge dreams big.' }, { kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'takeover', text: 'Abramovich’s billions transform Chelsea into a superpower.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'manage',
          label: 'Manage the culture shift carefully',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', clubId: 'chelsea', amount: 4 }, { kind: 'memory', tag: 'takeover', text: 'Steadied the dressing room through the ownership upheaval.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 5 }, { kind: 'memory', tag: 'takeover', text: 'Abramovich completes the takeover — the money, and the pressure, arrive.' }],
      memoryTags: ['takeover'],
    }),
  },
  {
    id: 'ranieri-mourinho',
    date: '2004-06',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea' && s.managerRelations.identity === 'Claudio Ranieri',
    build: () => ({
      id: 'scripted:ranieri-mourinho',
      title: 'The Special One is available',
      description:
        'Ranieri — the "Tinkerman" — took the club to a Champions League semi-final but the owner wants more. José Mourinho, fresh from winning the Champions League with Porto, is available. Reality: Ranieri was dismissed and Mourinho arrived to change everything. Make the ruthless change, or reward Ranieri’s progress with another season?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'mourinho',
          label: 'Appoint Mourinho (as reality did)',
          successProbability: 0.75,
          onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'manager', text: 'Hired the Special One — the winning machine is about to be built.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
        {
          id: 'keep-ranieri',
          label: 'Reward Ranieri with another year',
          successProbability: 0.45,
          onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'manager', text: 'Kept faith with the Tinkerman over the glamour hire.' }],
          onFailure: [{ kind: 'boardPatience', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: 'Ranieri out; Mourinho, the Special One, takes charge.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'mourinho-machine',
    date: '2004-07',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:mourinho-machine',
      title: 'Building the machine',
      description:
        'The new manager wants his own spine: Drogba up top, Čech in goal, Carvalho and Ferreira from Porto, Robben on the wing. Reality: this was the core that won back-to-back titles. Back the wholesale overhaul, or ask him to build more gradually around the players already here?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'overhaul',
          label: 'Back the overhaul (as reality did)',
          successProbability: 0.85,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Drogba, Čech, Carvalho, Robben in — the machine takes shape.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'gradual',
          label: 'Build more gradually',
          successProbability: 0.55,
          onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Evolved the squad rather than tearing it up.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'transfer', text: 'Mourinho builds his machine: Drogba, Čech, Carvalho, Robben.' }],
      memoryTags: ['transfer'],
    }),
  },
  {
    id: 'league-cup-2005',
    date: '2005-02',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:league-cup-2005',
      title: 'Mourinho’s first trophy',
      description:
        'The League Cup is won — the manager’s first silverware and a statement of the momentum building. Reality: the springboard to the title. Treat it as a priority and ride the momentum, or downplay it and save your energy for the league and Europe?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'momentum',
          label: 'Ride the momentum',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', clubId: 'chelsea', amount: 5 }, { kind: 'memory', tag: 'silverware', text: 'First trophy of the Mourinho era — the machine rolls.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'downplay',
          label: 'Save energy for the bigger prizes',
          successProbability: 0.6,
          onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Banked the cup and kept the eyes on the league.' }],
          onFailure: [{ kind: 'morale', clubId: 'chelsea', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'silverware', text: 'The League Cup — Mourinho’s first trophy at Chelsea.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'first-title-50-years',
    date: '2005-04',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:first-title-50-years',
      title: 'Champions of England — after 50 years',
      description:
        'A record-breaking season delivers the league title — Chelsea’s first English top-flight crown since 1955. Reality: 95 points, the meanest defence in history, and the making of a dynasty. Reward the squad and build for dominance, or bank the moment and evolve while on top?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'dominate',
          label: 'Build for dominance',
          successProbability: 0.8,
          onSuccess: [{ kind: 'morale', clubId: 'chelsea', amount: 6 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'silverware', text: 'Champions after 50 years — and hungry for more.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'evolve',
          label: 'Evolve from the top',
          successProbability: 0.55,
          onSuccess: [{ kind: 'memory', tag: 'silverware', text: 'Freshened the champions from a position of strength.' }],
          onFailure: [{ kind: 'morale', clubId: 'chelsea', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 7, text: 'Champions of England for the first time in 50 years.' }, { kind: 'memory', tag: 'silverware', text: 'Won the title — a first in half a century.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'ghost-goal',
    date: '2005-05',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:ghost-goal',
      title: 'The ghost goal — Europe denied',
      description:
        'A Champions League semi-final at Anfield turns on Luís García’s disputed early goal — "a goal from the moon," the manager calls it, never conclusively shown to have crossed the line. Reality: Chelsea went out, and the European Cup stayed out of reach. Rage at the injustice publicly, or take it on the chin and refocus?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'rage',
          label: 'Rage at the injustice',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', clubId: 'chelsea', amount: 3 }, { kind: 'memory', tag: 'near-miss', text: 'Made the ghost goal a rallying cry.' }],
          onFailure: [{ kind: 'fanTrust', amount: -2 }],
        },
        {
          id: 'refocus',
          label: 'Take it on the chin and refocus',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'near-miss', text: 'Absorbed the European heartbreak and went again.' }],
          onFailure: [],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'near-miss', text: 'Knocked out of Europe by Liverpool’s disputed "ghost goal".' }],
      memoryTags: ['near-miss'],
    }),
  },
  {
    id: 'back-to-back-2006',
    date: '2006-04',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:back-to-back-2006',
      title: 'Back-to-back champions',
      description:
        'A second successive league title confirms Chelsea as the dominant force in England — Terry, Lampard and Drogba at their peak. Reality: the high-water mark of Mourinho’s first spell. Push for the Champions League that’s still missing, or consolidate the domestic stranglehold?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'europe',
          label: 'Go all-in for Europe',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Back-to-back champions — now for the European Cup.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'consolidate',
          label: 'Consolidate at home',
          successProbability: 0.75,
          onSuccess: [{ kind: 'morale', clubId: 'chelsea', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Tightened the domestic grip.' }],
          onFailure: [{ kind: 'boardPatience', amount: -2 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: 6 }, { kind: 'memory', tag: 'silverware', text: 'Back-to-back Premier League titles.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'shevchenko-abramovich',
    date: '2006-05',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:shevchenko-abramovich',
      title: 'The owner’s signing',
      description:
        'Abramovich wants Andriy Shevchenko — a ~£30m personal pursuit, effectively forced on a reluctant Mourinho. Reality: it never clicked, and it became a key cause of the rift that ended Mourinho’s reign. Wave the owner’s signing through to keep the peace, or defend your manager’s judgement and resist it?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'wave-through',
          label: 'Wave it through (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'managerRelationship', amount: -6 }, { kind: 'memory', tag: 'boardroom', text: 'Signed the owner’s man over the manager’s objection — the rift widens.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }],
        },
        {
          id: 'defend-coach',
          label: 'Defend the manager and resist',
          successProbability: 0.4,
          onSuccess: [{ kind: 'managerRelationship', amount: 10 }, { kind: 'memory', tag: 'boardroom', text: 'Backed the coach against the owner’s pet signing.' }],
          onFailure: [{ kind: 'boardPatience', amount: -12, text: 'Defying the owner over a signing burns serious capital.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: -5 }, { kind: 'memory', tag: 'boardroom', text: 'Shevchenko arrives as Abramovich’s signing — the owner-manager rift begins.' }],
      memoryTags: ['boardroom', 'cur_shevchenko_m'],
    }),
  },
  {
    id: 'fa-cup-wembley-2007',
    date: '2007-05',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:fa-cup-wembley-2007',
      title: 'Drogba christens the new Wembley',
      description:
        'Drogba’s goal wins the first FA Cup final at the rebuilt Wembley. Reality: silverware, but a season below the sky-high expectations, and the manager’s position quietly weakening. Use the cup to steady the ship, or read the warning signs behind a trophy that papered over the cracks?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'steady',
          label: 'Use the cup to steady things',
          successProbability: 0.65,
          onSuccess: [{ kind: 'morale', clubId: 'chelsea', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Drogba’s Wembley winner buys some calm.' }],
          onFailure: [{ kind: 'boardPatience', amount: -3 }],
        },
        {
          id: 'confront',
          label: 'Confront the underlying tensions',
          successProbability: 0.45,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'silverware', text: 'Won the cup but tackled the boardroom cracks head-on.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'silverware', text: 'Drogba’s goal wins the first FA Cup final at the new Wembley.' }],
      memoryTags: ['silverware'],
    }),
  },
  {
    id: 'mourinho-leaves',
    date: '2007-09',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:mourinho-leaves',
      title: 'Mourinho leaves',
      description:
        'The owner-manager relationship has broken down irreparably. Reality: Mourinho left "by mutual consent" in September 2007 and the little-known Avram Grant stepped up — a hugely divisive change with the fans firmly behind the departing manager. Force the split and promote from within, or move heaven and earth to repair the relationship and keep him?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'repair',
          label: 'Fight to keep Mourinho',
          successProbability: 0.4,
          onSuccess: [{ kind: 'fanTrust', amount: 8, text: 'Kept the Special One — the fans are jubilant.' }, { kind: 'boardPatience', amount: -6 }],
          onFailure: [{ kind: 'fanTrust', amount: -6, text: 'The reconciliation collapsed and he walked anyway.' }],
        },
        {
          id: 'split',
          label: 'Accept the split (as reality did)',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'manager', text: 'Mourinho leaves by mutual consent; Grant steps in.' }],
          onFailure: [{ kind: 'fanTrust', amount: -8, text: 'Losing Mourinho enrages the support.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -6, text: 'Mourinho gone; Avram Grant takes over to a divided fanbase.' }, { kind: 'memory', tag: 'manager', text: 'The Special One departs by mutual consent.' }],
      memoryTags: ['manager'],
    }),
  },
  {
    id: 'moscow-final',
    date: '2008-05',
    scenarios: ['chelsea-2003'],
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:moscow-final',
      title: 'Moscow — the final lost on a slip',
      description:
        'The first Champions League final in the club’s history, against Manchester United in the Moscow rain. Reality: it went to penalties, John Terry slipped taking the one that would have won it, and Chelsea lost the shootout — the European Cup would wait until 2012. Rally the devastated squad, or let the heartbreak force a reckoning?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'rally',
          label: 'Rally the squad — so close, go again',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', clubId: 'chelsea', amount: 5 }, { kind: 'memory', tag: 'near-miss', text: 'Turned the Moscow heartbreak into fuel for another run.' }],
          onFailure: [{ kind: 'morale', clubId: 'chelsea', amount: -4 }],
        },
        {
          id: 'reckoning',
          label: 'Force a reckoning after the near-miss',
          successProbability: 0.45,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'near-miss', text: 'Used the Moscow defeat to demand change.' }],
          onFailure: [{ kind: 'morale', clubId: 'chelsea', amount: -5 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'near-miss', text: 'Lost the Moscow final on penalties — Terry’s slip, and the European Cup slips away.' }],
      memoryTags: ['near-miss'],
    }),
  },
];

const DORTMUND_1997_PACK: ScriptedEvent[] = [
  {
    id: 'sammer-knee',
    date: '1998-01',
    scenarios: ['dortmund-1997'],
    requires: (s) => playerAt(s, 'cur_sammer_97', 'dortmund') && s.playerClub === 'dortmund',
    build: () => ({
      id: 'scripted:sammer-knee', title: 'Matthias Sammer’s knee gives way',
      description: 'The reigning Ballon d’Or, the libero who drives your European champions, has broken down again — chronic cartilage damage. Reality: the knee never healed and it ended his career at 30. Push him through cortisone and comebacks, or shut him down to save the man?',
      interrupt: true, clubId: 'dortmund', category: 'event',
      choices: [
        { id: 'push', label: 'Push him back — you need him now', successProbability: 0.3, onSuccess: [{ kind: 'morale', clubId: 'dortmund', amount: 6 }], onFailure: [{ kind: 'ban', playerId: 'cur_sammer_97', months: 10 }, { kind: 'ability', playerId: 'cur_sammer_97', amount: -6 }, { kind: 'memory', tag: 'injury', text: 'Rushed Sammer back and the knee gave out for good — the tragedy history remembers.' }] },
        { id: 'protect', label: 'Shut him down — save the man', successProbability: 0.5, onSuccess: [{ kind: 'ability', playerId: 'cur_sammer_97', amount: -2 }, { kind: 'memory', tag: 'injury', text: 'Protected Sammer — a slim hope the great libero plays on.' }], onFailure: [{ kind: 'ban', playerId: 'cur_sammer_97', months: 8 }] },
      ],
      falloutIfIgnored: [{ kind: 'ban', playerId: 'cur_sammer_97', months: 10 }, { kind: 'memory', tag: 'injury', text: 'Sammer’s knee ends a glittering career at 30.' }],
      memoryTags: ['injury', 'cur_sammer_97'],
    }),
  },
];

const INTER_1998_PACK: ScriptedEvent[] = [
  {
    id: 'ronaldo-knee',
    date: '1999-11',
    scenarios: ['inter-1998'],
    requires: (s) => playerAt(s, 'cur_ronaldo_r9', 'inter') && s.playerClub === 'inter',
    build: () => ({
      id: 'scripted:ronaldo-knee', title: 'Ronaldo’s knee ruptures — Il Fenomeno in ruins',
      description: 'The greatest striker on earth, at 23, has ruptured the tendon in his right knee. Reality was catastrophic: he rushed a comeback in April and it went again in six minutes, costing him three years. Rush the Phenomenon back for the run-in, or lock him away for a full, patient rehabilitation?',
      interrupt: true, clubId: 'inter', category: 'event',
      choices: [
        { id: 'rush', label: 'Rush him back — you need him', successProbability: 0.2, onSuccess: [{ kind: 'morale', clubId: 'inter', amount: 8 }], onFailure: [{ kind: 'ban', playerId: 'cur_ronaldo_r9', months: 18 }, { kind: 'ability', playerId: 'cur_ronaldo_r9', amount: -5 }, { kind: 'memory', tag: 'injury', text: 'Ronaldo broke down again on his comeback — the six-minute tragedy, as it happened.' }] },
        { id: 'patient', label: 'A full, patient rehab — protect the miracle', successProbability: 0.7, onSuccess: [{ kind: 'ability', playerId: 'cur_ronaldo_r9', amount: -2 }, { kind: 'memory', tag: 'injury', text: 'Held Ronaldo out for a proper rehab — sparing him the second rupture reality inflicted.' }], onFailure: [{ kind: 'ban', playerId: 'cur_ronaldo_r9', months: 12 }] },
      ],
      falloutIfIgnored: [{ kind: 'ban', playerId: 'cur_ronaldo_r9', months: 14 }, { kind: 'ability', playerId: 'cur_ronaldo_r9', amount: -3 }, { kind: 'memory', tag: 'injury', text: 'Ronaldo’s knee robs the game of its phenomenon for years.' }],
      memoryTags: ['injury', 'cur_ronaldo_r9'],
    }),
  },
];

const INTER_2004_PACK: ScriptedEvent[] = [
  {
    id: 'adriano-grief',
    date: '2005-08',
    scenarios: ['inter-2004'],
    requires: (s) => playerAt(s, 'cur_adriano_04', 'inter') && s.playerClub === 'inter',
    build: () => ({
      id: 'scripted:adriano-grief', title: 'The Emperor is grieving',
      description: 'Adriano — the most fearsome forward in Italy, a man who once seemed unstoppable — has lost his father, and those close to him say he is slipping away from the game into drink and depression. Reality watched one of football’s great talents fade. Wrap the club around him and fight for him, or accept the decline and move on?',
      interrupt: true, clubId: 'inter', category: 'event',
      choices: [
        { id: 'support', label: 'Fight for him — the club as a family', successProbability: 0.4, onSuccess: [{ kind: 'morale', playerId: 'cur_adriano_04', amount: 14 }, { kind: 'ability', playerId: 'cur_adriano_04', amount: 3 }, { kind: 'memory', tag: 'human', text: 'Rallied around Adriano — a chance to save the Emperor reality never took.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_adriano_04', amount: 8 }] },
        { id: 'move-on', label: 'Accept the decline — plan without him', successProbability: 0.8, onSuccess: [{ kind: 'memory', tag: 'human', text: 'Let Adriano drift — the fall of the Emperor, as it sadly went.' }], onFailure: [] },
      ],
      falloutIfIgnored: [{ kind: 'ability', playerId: 'cur_adriano_04', amount: -4 }, { kind: 'memory', tag: 'human', text: 'Adriano fades from the game.' }],
      memoryTags: ['human', 'cur_adriano_04'],
    }),
  },
];

const JUVENTUS_2006_PACK: ScriptedEvent[] = [
  {
    id: 'juve-loyalists',
    date: '2006-08',
    scenarios: ['juventus-2006'],
    requires: (s) => playerAt(s, 'cur_delpiero_06', 'juventus') && s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:juve-loyalists', title: 'Serie B — the loyalists who stayed',
      description: 'Calciopoli has stripped the titles and cast the Old Lady into Serie B. The mercenaries fled — but Del Piero, Buffon, Trezeguet and Nedvěd chose to go down with the club and win their way back. Make heroes of the men who stayed and build the promotion push around them, or treat it as a fire-sale rebuild?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'honour', label: 'Build around the loyalists — win it back together', successProbability: 0.8, onSuccess: [{ kind: 'morale', clubId: 'juventus', amount: 12 }, { kind: 'boardPatience', amount: 8 }, { kind: 'memory', tag: 'loyalty', text: 'Made icons of the men who stayed — the Old Lady marches back up together.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: 4 }] },
        { id: 'rebuild', label: 'Cold rebuild — cash in and start over', successProbability: 0.6, onSuccess: [{ kind: 'money', clubId: 'juventus', amount: 20_000_000 }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -8 }, { kind: 'agitation', playerId: 'cur_delpiero_06', amount: 10 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'juventus', amount: 4 }, { kind: 'memory', tag: 'loyalty', text: 'The loyalists drag Juventus back to Serie A.' }],
      memoryTags: ['loyalty', 'cur_delpiero_06'],
    }),
  },
];

const MILAN_2007_PACK: ScriptedEvent[] = [
  {
    id: 'kaka-100m',
    date: '2009-01',
    scenarios: ['milan-2007'],
    requires: (s) => playerAt(s, 'cur_kaka_07', 'milan') && s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:kaka-100m', title: 'Manchester City offer £100m for Kaká',
      description: 'The newly-rich City have put a world-record, life-changing £100m on the table for your Ballon d’Or talisman. Reality: Milan agonised, the Curva revolted, and Berlusconi turned it down — only to sell him to Real that summer. Take the staggering money now, or keep your golden boy and face the same call in the summer?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'take', label: 'Cash in — no player is worth turning that money down', successProbability: 0.9, onSuccess: [{ kind: 'transferOut', playerId: 'cur_kaka_07', clubId: 'real_madrid', amount: 100_000_000 }, { kind: 'morale', clubId: 'milan', amount: -8 }, { kind: 'memory', tag: 'transfer', text: 'City’s £100m forced the issue and Kaká was sold — the golden boy gone, a year before reality let him leave for Madrid.' }], onFailure: [] },
        { id: 'refuse', label: 'Refuse — Kaká is not for sale', successProbability: 0.85, onSuccess: [{ kind: 'morale', clubId: 'milan', amount: 10 }, { kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Turned City down and kept Kaká — the Curva sing, as they did.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_kaka_07', amount: 8 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'milan', amount: 6 }, { kind: 'memory', tag: 'transfer', text: 'Milan reject City’s £100m for Kaká.' }],
      memoryTags: ['transfer', 'cur_kaka_07'],
    }),
  },
];

const REAL_MADRID_2006_PACK: ScriptedEvent[] = [
  {
    id: 'beckham-exile',
    date: '2007-01',
    scenarios: ['real-madrid-2006'],
    requires: (s) => playerAt(s, 'cur_beckham_r6', 'real_madrid') && s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:beckham-exile', title: 'Beckham signs for LA Galaxy — freeze him out, or bring him back?',
      description: 'David Beckham has announced he’ll join LA Galaxy at season’s end, and Capello has declared he’ll never play for Real again. Reality: Capello swallowed his words, reintegrated him, and Beckham drove Madrid to a stunning late title. Hold the hard line, or bring the Englishman back in from the cold?',
      interrupt: true, clubId: 'real_madrid', category: 'event',
      choices: [
        { id: 'reintegrate', label: 'Bring him back in — swallow the pride', successProbability: 0.7, onSuccess: [{ kind: 'morale', playerId: 'cur_beckham_r6', amount: 12 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'redemption', text: 'Brought Beckham back from exile — and he dragged Madrid to the title, as reality had it.' }], onFailure: [{ kind: 'managerRelationship', amount: -6 }] },
        { id: 'exile', label: 'Hold the line — he’s finished here', successProbability: 0.4, onSuccess: [{ kind: 'managerRelationship', amount: 4 }], onFailure: [{ kind: 'morale', clubId: 'real_madrid', amount: -6 }, { kind: 'agitation', playerId: 'cur_beckham_r6', amount: 10 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_beckham_r6', amount: 8 }, { kind: 'memory', tag: 'redemption', text: 'Beckham forces his way back and fires the title run.' }],
      memoryTags: ['redemption', 'cur_beckham_r6'],
    }),
  },
];

const LIVERPOOL_2010_PACK: ScriptedEvent[] = [
  {
    id: 'torres-chelsea',
    date: '2011-01',
    scenarios: ['liverpool-2010'],
    requires: (s) => playerAt(s, 'cur_torres_lv10', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:torres-chelsea', title: 'Torres hands in a transfer request — Chelsea bid £50m',
      description: 'El Niño, the idol of the Kop, wants out — and Chelsea have tabled a British-record £50m on deadline day. Reality: Liverpool took the money and spent it on Carroll and Suárez. Cash in on the talisman at a staggering price, or refuse to sell to a rival and hold him to his contract?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'sell', label: 'Take the £50m — reinvest it', successProbability: 0.9, onSuccess: [{ kind: 'transferOut', playerId: 'cur_torres_lv10', clubId: 'chelsea', amount: 50_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Sold Torres to Chelsea for a British record — the money that bought Suárez, as it did.' }], onFailure: [] },
        { id: 'keep', label: 'Refuse — no sale to a rival', successProbability: 0.45, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 6 }, { kind: 'agitation', playerId: 'cur_torres_lv10', amount: -10 }, { kind: 'memory', tag: 'transfer', text: 'Kept Torres against his wishes — a defiance reality didn’t risk.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_torres_lv10', amount: 16 }] },
      ],
      falloutIfIgnored: [{ kind: 'transferOut', playerId: 'cur_torres_lv10', clubId: 'chelsea', amount: 50_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Torres joins Chelsea on deadline day.' }],
      memoryTags: ['transfer', 'cur_torres_lv10'],
    }),
  },
];

const MAN_UTD_2013_PACK: ScriptedEvent[] = [
  {
    id: 'rooney-request',
    date: '2013-08',
    scenarios: ['man-utd-2013'],
    requires: (s) => playerAt(s, 'cur_rooney', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:rooney-request', title: 'Rooney wants out — Chelsea are circling',
      description: 'Wayne Rooney, unsettled and stung at being framed as van Persie’s back-up, has agitated for a move and Chelsea have tested you with two bids. Reality: Moyes dug in, kept him, and Rooney stayed to become captain. Sell your unsettled star to a rival, or convince him his future is here?',
      interrupt: true, clubId: 'man_utd', category: 'event',
      choices: [
        { id: 'keep', label: 'Dig in — convince him to stay', successProbability: 0.65, onSuccess: [{ kind: 'morale', playerId: 'cur_rooney', amount: 10 }, { kind: 'agitation', playerId: 'cur_rooney', amount: -14 }, { kind: 'memory', tag: 'saga', text: 'Kept Rooney and won him back — as United really did.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_rooney', amount: 12 }] },
        { id: 'sell', label: 'Cash in — sell to Chelsea (£28m)', successProbability: 0.85, onSuccess: [{ kind: 'transferOut', playerId: 'cur_rooney', clubId: 'chelsea', amount: 28_000_000 }, { kind: 'memory', tag: 'saga', text: 'Sold Rooney to Chelsea — a divergence United never dared.' }], onFailure: [] },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_rooney', amount: 6 }, { kind: 'agitation', playerId: 'cur_rooney', amount: -8 }, { kind: 'memory', tag: 'saga', text: 'Rooney stays and knuckles down.' }],
      memoryTags: ['saga', 'cur_rooney'],
    }),
  },
];

const SPURS_2001_PACK: ScriptedEvent[] = [
  {
    id: 'worthington-final',
    date: '2002-02',
    scenarios: ['spurs-2001'],
    requires: (s) => playerAt(s, 'cur_king01', 'spurs') && s.playerClub === 'spurs',
    build: () => ({
      id: 'scripted:worthington-final', title: 'A cup final — Spurs’ shot at silverware',
      description: 'Hoddle’s Tottenham have battled to the League Cup final and a first trophy in a decade is within reach. Reality: they froze against unfancied Blackburn and lost 2-1. This is the club’s day — throw everything at it, or manage the nerves of a side unused to finals?',
      interrupt: true, clubId: 'spurs', category: 'event',
      choices: [
        { id: 'go', label: 'Throw everything at it', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 10 }, { kind: 'morale', clubId: 'spurs', amount: 12 }, { kind: 'memory', tag: 'cup', text: 'Spurs seize the day and lift the cup — beating the ghost of reality.' }], onFailure: [{ kind: 'morale', clubId: 'spurs', amount: -6 }] },
        { id: 'manage', label: 'Steady the nerves, play it tight', successProbability: 0.45, onSuccess: [{ kind: 'boardPatience', amount: 8 }, { kind: 'memory', tag: 'cup', text: 'Nervelessly saw out a final Spurs had waited a decade for.' }], onFailure: [{ kind: 'morale', clubId: 'spurs', amount: -6 }, { kind: 'memory', tag: 'cup', text: 'Froze on the big day, as reality did.' }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'cup', text: 'The cup final comes and goes.' }],
      memoryTags: ['cup'],
    }),
  },
];

const SPURS_2013_PACK: ScriptedEvent[] = [
  {
    id: 'bale-money',
    date: '2013-08',
    scenarios: ['spurs-2013'],
    requires: (s) => s.playerClub === 'spurs',
    build: () => ({
      id: 'scripted:bale-money', title: 'The Bale money — £85m to reshape the club',
      description: 'Gareth Bale has gone to Real for a world record, and the £85m is burning a hole in the club’s pocket. Reality: Levy spread it across SEVEN signings — Soldado, Eriksen, Lamela, Chadli, Paulinho, Capoue, Chiriches — and none replaced the one who left. Spend it on a single galáctico to fill Bale’s boots, or spread it wide as reality did?',
      interrupt: true, clubId: 'spurs', category: 'event',
      choices: [
        { id: 'marquee', label: 'One galáctico to replace him', successProbability: 0.6, onSuccess: [{ kind: 'money', clubId: 'spurs', amount: 30_000_000 }, { kind: 'morale', clubId: 'spurs', amount: 6 }, { kind: 'memory', tag: 'bale-money', text: 'Backed one star with the Bale money — the bet Spurs never made.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
        { id: 'spread', label: 'Spread it across seven (as reality did)', successProbability: 0.7, onSuccess: [{ kind: 'money', clubId: 'spurs', amount: 20_000_000 }, { kind: 'memory', tag: 'bale-money', text: 'Spread the Bale money wide — quantity over a talisman, as it went.' }], onFailure: [{ kind: 'morale', clubId: 'spurs', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'money', clubId: 'spurs', amount: 20_000_000 }, { kind: 'memory', tag: 'bale-money', text: 'The Bale money is spread across a magnificent seven.' }],
      memoryTags: ['bale-money'],
    }),
  },
];

const BARCELONA_2014_PACK: ScriptedEvent[] = [
  {
    id: 'xavi-farewell',
    date: '2015-05',
    scenarios: ['barcelona-2014'],
    requires: (s) => playerAt(s, 'cur_xavi_b14', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:xavi-farewell', title: 'Xavi’s last dance',
      description: 'The metronome of the greatest side in history, the heartbeat of tiki-taka, is 35 and ready to bow out for Al Sadd. Reality gave him a treble-winning send-off and a guard of honour. Persuade him to stay one more year as the on-pitch conductor, or let a legend leave at the very top?',
      interrupt: true, clubId: 'barcelona', category: 'event',
      choices: [
        { id: 'stay', label: 'One more year — the conductor plays on', successProbability: 0.5, onSuccess: [{ kind: 'renewContract', playerId: 'cur_xavi_b14', amount: 1 }, { kind: 'morale', clubId: 'barcelona', amount: 6 }, { kind: 'memory', tag: 'legend', text: 'Talked Xavi into one more season — the maestro conducts on.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_xavi_b14', amount: 8 }] },
        { id: 'farewell', label: 'A champion’s send-off to Al Sadd', onSuccess: [{ kind: 'letContractLapse', playerId: 'cur_xavi_b14' }, { kind: 'morale', clubId: 'barcelona', amount: 5 }, { kind: 'memory', tag: 'legend', text: 'Xavi bows out a treble winner — a guard of honour, as reality gave him.' }] },
      ],
      falloutIfIgnored: [{ kind: 'letContractLapse', playerId: 'cur_xavi_b14' }, { kind: 'memory', tag: 'legend', text: 'Xavi leaves for Al Sadd, a Barça immortal.' }],
      memoryTags: ['legend', 'cur_xavi_b14'],
    }),
  },
];

const BAYERN_1998_PACK: ScriptedEvent[] = [
  {
    id: 'bayern-1999-final',
    date: '1999-05',
    scenarios: ['bayern-1998'],
    requires: (s) => playerAt(s, 'cur_kahn_98', 'bayern') && s.playerClub === 'bayern',
    build: () => ({
      id: 'scripted:bayern-1999-final', title: 'The Champions League final — 90 minutes from glory',
      description: 'Hitzfeld’s Bayern have reached the final against Manchester United and lead through Basler. Reality is the cruellest in the competition’s history: two injury-time corners, Sheringham, Solskjær, and the cup ripped away. Sit deep and protect the lead, or keep playing and kill the game off?',
      interrupt: true, clubId: 'bayern', category: 'event',
      choices: [
        { id: 'kill', label: 'Keep playing — get the second goal', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 8 }, { kind: 'morale', clubId: 'bayern', amount: 12 }, { kind: 'memory', tag: 'europe', text: 'Bayern got the second and lifted the cup — rewriting the cruelest night of all.' }], onFailure: [{ kind: 'morale', clubId: 'bayern', amount: -8 }] },
        { id: 'defend', label: 'Sit deep and hold the lead', successProbability: 0.4, onSuccess: [{ kind: 'boardPatience', amount: 8 }, { kind: 'memory', tag: 'europe', text: 'Held on for the European Cup — the ninety-plus-two nightmare averted.' }], onFailure: [{ kind: 'morale', clubId: 'bayern', amount: -12 }, { kind: 'memory', tag: 'europe', text: 'Two injury-time corners and it was gone — as it truly, agonisingly was.' }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'bayern', amount: -8 }, { kind: 'memory', tag: 'europe', text: 'The 1999 final slips away in stoppage time.' }],
      memoryTags: ['europe'],
    }),
  },
];

const BAYERN_2009_PACK: ScriptedEvent[] = [
  {
    id: 'muller-breakthrough',
    date: '2009-09',
    scenarios: ['bayern-2009'],
    requires: (s) => playerAt(s, 'cur_muller_09', 'bayern') && s.playerClub === 'bayern',
    build: () => ({
      id: 'scripted:muller-breakthrough', title: 'Van Gaal stakes his job on a 19-year-old',
      description: 'Louis van Gaal has taken a shine to a gangly, unheralded academy forward named Thomas Müller and wants to throw him straight into the side ahead of established names. Reality: he was right, spectacularly — Müller became a World Cup Golden Boot winner within a year. Fast-track the kid, or protect him with a slower path?',
      interrupt: true, clubId: 'bayern', category: 'event',
      choices: [
        { id: 'promote', label: 'Throw him in — trust the coach', successProbability: 0.8, onSuccess: [{ kind: 'ability', playerId: 'cur_muller_09', amount: 4 }, { kind: 'morale', playerId: 'cur_muller_09', amount: 10 }, { kind: 'memory', tag: 'academy', text: 'Fast-tracked Müller — van Gaal’s hunch pays off, as history proved.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_muller_09', amount: 6 }] },
        { id: 'patient', label: 'A slower path — don’t rush him', successProbability: 0.6, onSuccess: [{ kind: 'memory', tag: 'academy', text: 'Held Müller back a while — the Raumdeuter will keep.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_muller_09', amount: 8 }] },
      ],
      falloutIfIgnored: [{ kind: 'ability', playerId: 'cur_muller_09', amount: 3 }, { kind: 'memory', tag: 'academy', text: 'Müller breaks through regardless — some talents will not be denied.' }],
      memoryTags: ['academy', 'cur_muller_09'],
    }),
  },
];

// ── The contract-saga register: tense will-they-won't-they renewals ──────────
// Curated real sagas of the era, resolved by FACTORS so they can go the other way
// than history: a star reality kept walks if he's underpaid, unhappy and courted;
// a star reality sold can be talked into staying if the wages and mood are right.
// `contractRetentionOdds` reads the live squad, so the same beat plays differently
// depending on how the Director has run the club. See realityRegister.ts.

interface ContractSagaCfg {
  id: string;
  scenario: string;
  club: ClubState['id'];
  playerId: string;
  date: string;
  realStayed: boolean; // did he actually stay, in reality?
  suitor?: ClubState['id']; // the club that came for him (must exist in that world)
  title: string;
  blurb: string; // the drama, minus the outcome
  stayMemory: string;
  leaveMemory: string;
}

/** Build a will-they-won't-they contract beat whose outcome bends with the factors. */
function contractSaga(cfg: ContractSagaCfg): ScriptedEvent {
  return {
    id: cfg.id,
    date: cfg.date,
    scenarios: [cfg.scenario],
    requires: (s) => playerAt(s, cfg.playerId, cfg.club) && s.playerClub === cfg.club,
    build: (s) => {
      const p = s.players[cfg.playerId]!;
      const stay = contractRetentionOdds(s, p, { realStayed: cfg.realStayed, suitor: cfg.suitor });
      const fee = sagaFee(s, p);
      const feeM = feeMillions(fee);
      const year = parseYearMonth(s.clock.date).year;
      const suitorExists = cfg.suitor ? !!s.clubs[cfg.suitor] : false;
      const suitorName = cfg.suitor ? s.clubs[cfg.suitor]?.name ?? 'a rival' : 'a rival';
      const unhappy = p.morale < 45 || p.agitation > 40;
      const mood = unhappy
        ? 'The mood around him is sour — he feels undervalued and the noise is growing.'
        : stay >= 0.6
          ? 'He is settled and happy here, which strengthens your hand.'
          : 'It is finely balanced — he could be persuaded either way.';
      // The IGNORE path resolves on the factors, and it can diverge from history.
      const leaveFallout = suitorExists
        ? [
            { kind: 'transferOut' as const, playerId: cfg.playerId, clubId: cfg.suitor!, amount: fee },
            { kind: 'memory' as const, tag: 'contract-saga', text: cfg.leaveMemory },
          ]
        : [
            { kind: 'letContractLapse' as const, playerId: cfg.playerId },
            { kind: 'agitation' as const, playerId: cfg.playerId, amount: 12 },
            { kind: 'memory' as const, tag: 'contract-saga', text: cfg.leaveMemory },
          ];
      const staysFallout = [
        { kind: 'morale' as const, playerId: cfg.playerId, amount: 4 },
        { kind: 'memory' as const, tag: 'contract-saga', text: cfg.stayMemory },
      ];
      const choices: Decision['choices'] = [
        {
          id: 'renew',
          label: 'Open the vault — bumper new terms to end it',
          successProbability: Math.min(0.96, stay + 0.28),
          onSuccess: [
            { kind: 'renewContract', playerId: cfg.playerId, amount: Math.max(3, p.contractUntil - year + 3) },
            { kind: 'morale', playerId: cfg.playerId, amount: 8 },
            { kind: 'memory', tag: 'contract-saga', text: cfg.stayMemory },
          ],
          onFailure: [
            { kind: 'agitation', playerId: cfg.playerId, amount: 14 },
            { kind: 'memory', tag: 'contract-saga', text: `${p.name} rebuffs the offer — his head has been turned.` },
          ],
        },
        {
          id: 'structure',
          label: 'Hold the wage structure — call his bluff',
          successProbability: stay,
          onSuccess: [
            { kind: 'morale', playerId: cfg.playerId, amount: 2 },
            { kind: 'memory', tag: 'contract-saga', text: `${p.name} stays on his existing deal — the structure holds.` },
          ],
          onFailure: [{ kind: 'agitation', playerId: cfg.playerId, amount: 16 }, ...leaveFallout],
        },
      ];
      if (suitorExists) {
        choices.push({
          id: 'sell',
          label: `Cash in now — take ${suitorName}'s £${feeM}m`,
          successProbability: 0.9,
          onSuccess: [
            { kind: 'transferOut', playerId: cfg.playerId, clubId: cfg.suitor!, amount: fee },
            { kind: 'memory', tag: 'contract-saga', text: cfg.leaveMemory },
          ],
          onFailure: [],
        });
      }
      return {
        id: `register:${cfg.id}`,
        title: cfg.title,
        description: `${cfg.blurb} ${mood}`,
        interrupt: true,
        clubId: cfg.club,
        category: 'event',
        choices,
        falloutIfIgnored: stay >= 0.5 ? staysFallout : leaveFallout,
        memoryTags: ['contract-saga', cfg.playerId],
      };
    },
  };
}

const CONTRACT_SAGA_PACK: ScriptedEvent[] = [
  contractSaga({
    id: 'saga-gerrard-2005', scenario: 'liverpool-2001', club: 'liverpool', playerId: 'cur_gerrard01',
    date: '2005-07', realStayed: true, suitor: 'chelsea',
    title: 'Gerrard and Chelsea — the captain on the brink',
    blurb: 'Fresh from a European Cup, Chelsea have come with a fortune and Steven Gerrard has all but gone — reality had him hand in a request, then perform a stunning overnight u-turn to stay.',
    stayMemory: 'Gerrard u-turns and stays a Liverpool man — as he really did, on the finest of margins.',
    leaveMemory: 'Gerrard goes to Chelsea — the request never withdrawn, the icon lost, a wound reality was spared.',
  }),
  contractSaga({
    id: 'saga-cole-2006', scenario: 'arsenal-2004', club: 'arsenal', playerId: 'cur_acole',
    date: '2006-05', realStayed: false, suitor: 'chelsea',
    title: 'Ashley Cole — the tapping-up saga',
    blurb: 'A secret meeting with Mourinho, a row over £5k a week, and a left-back who feels disrespected — reality ended with "Cashley" crossing London to Chelsea.',
    stayMemory: 'Talked Ashley Cole down and kept him — the defection reality never healed, undone.',
    leaveMemory: 'Cole crosses London to Chelsea — the bridge burned, exactly as it was.',
  }),
  contractSaga({
    id: 'saga-henry-2007', scenario: 'arsenal-2004', club: 'arsenal', playerId: 'cur_henry',
    date: '2007-06', realStayed: false, suitor: 'barcelona',
    title: "Henry's heart is in Barcelona",
    blurb: 'The greatest player in the club’s history, 29 and drawn to Barcelona and Guardiola’s coming revolution. Reality: he left for Camp Nou and won a treble a season later.',
    stayMemory: 'Persuaded Henry to stay and lead on — the talisman kept, against the pull of Barcelona.',
    leaveMemory: 'Henry joins Barcelona — the king leaves for Catalonia, as he truly did.',
  }),
  contractSaga({
    id: 'saga-vnistelrooy-2009', scenario: 'real-madrid-2006', club: 'real_madrid', playerId: 'cur_van_nistelrooy_r6',
    date: '2009-12', realStayed: false,
    title: 'Van Nistelrooy frozen out',
    blurb: 'A serial scorer reduced to the bench as the galácticos gather again — reality saw him pushed out to Hamburg in the January, his knee and his standing both gone.',
    stayMemory: 'Kept faith with Van Nistelrooy and got him firing again — a scrapheap exit averted.',
    leaveMemory: 'Van Nistelrooy is moved on for a pittance — the finisher discarded, as reality had it.',
  }),
  contractSaga({
    id: 'saga-pirlo-2011', scenario: 'milan-2007', club: 'milan', playerId: 'cur_pirlo_07',
    date: '2011-06', realStayed: false, suitor: 'juventus',
    title: 'Pirlo — the regista they let walk',
    blurb: 'Andrea Pirlo’s deal is expiring and Milan, chasing younger legs, are minded to let him leave on a free. Reality: he joined Juventus and defined a dynasty — the greatest free transfer in Serie A history.',
    stayMemory: 'Tied Pirlo down — the regista stays, and Juventus never get their dynasty-maker for free.',
    leaveMemory: 'Pirlo walks to Juventus on a free — Milan’s catastrophic gift, made all over again.',
  }),
  contractSaga({
    id: 'saga-drogba-2008', scenario: 'chelsea-2003', club: 'chelsea', playerId: 'cur_drogba_c',
    date: '2008-08', realStayed: true, suitor: 'inter',
    title: '"Sometimes I feel alone" — Drogba unsettled',
    blurb: 'Didier Drogba, unhappy and courted from Italy, has openly mused about leaving. Reality: he stayed, and two years later scored the penalty that won Chelsea the Champions League.',
    stayMemory: 'Kept Drogba through his wobble — the man who would win the European Cup, retained.',
    leaveMemory: 'Drogba leaves for Serie A — and is not there for the night Chelsea are finally crowned kings of Europe.',
  }),
  contractSaga({
    id: 'saga-ribery-2010', scenario: 'bayern-2009', club: 'bayern', playerId: 'cur_ribery_09',
    date: '2010-06', realStayed: true, suitor: 'real_madrid',
    title: 'Ribéry courted by the giants',
    blurb: 'Real Madrid and Barcelona both want Franck Ribéry after his brilliant season. Reality: Bayern held firm, kept their difference-maker, and built a Champions League winner around him.',
    stayMemory: 'Held firm and kept Ribéry — the spine of a European champion stays in Munich.',
    leaveMemory: 'Ribéry is sold to the Spanish giants — Bayern cash in and lose their talisman, a road not taken.',
  }),
  contractSaga({
    id: 'saga-robinho-2009', scenario: 'man-city-2008', club: 'man_city', playerId: 'cur_robinho_c8',
    date: '2009-08', realStayed: false,
    title: 'Robinho already wants out',
    blurb: 'The marquee statement of the takeover is homesick and unconvinced by the project, and Milan are circling. Reality: the Robinho experiment fizzled and he drifted back to Italy on loan.',
    stayMemory: 'Convinced Robinho to buy into the project — the statement signing kicks on rather than fading.',
    leaveMemory: 'Robinho drifts back to Milan — the flagship of the takeover a flop, as it was.',
  }),
  contractSaga({
    id: 'saga-ronaldinho-2008', scenario: 'barcelona-2003', club: 'barcelona', playerId: 'cur_ronaldinho_b3',
    date: '2008-06', realStayed: false, suitor: 'milan',
    title: "Ronaldinho's fade — time to cash in?",
    blurb: 'The magician who lit up Camp Nou has let his fitness and focus slip as Messi rises. Reality: Barcelona sold him to Milan and handed the club to the young Argentine.',
    stayMemory: 'Reignited Ronaldinho’s fire and kept him — the magician defies his real decline.',
    leaveMemory: 'Ronaldinho is sold to Milan — the torch passed to Messi, exactly as it happened.',
  }),
  contractSaga({
    id: 'saga-neymar-2017', scenario: 'barcelona-2014', club: 'barcelona', playerId: 'cur_neymar_b14',
    date: '2017-07', realStayed: false, suitor: 'psg',
    title: 'Neymar and the £198m clause',
    blurb: 'PSG are ready to trigger the buy-out clause and make Neymar the most expensive player in history, out from Messi’s shadow to lead his own project. Reality: he went, and the £198m reshaped the market forever.',
    stayMemory: 'Convinced Neymar to stay in Messi’s orbit — the record-breaking exit never happens.',
    leaveMemory: 'Neymar joins PSG for £198m — the transfer that broke the market, made all over again.',
  }),
  contractSaga({
    id: 'saga-suarez-2013', scenario: 'liverpool-2010', club: 'liverpool', playerId: 'cur_suarez_lv10',
    date: '2013-07', realStayed: true, suitor: 'arsenal',
    title: 'Suárez and the £40,000,001 bid',
    blurb: 'Arsenal have tested a release-clause myth with a famous £40m-and-a-pound bid, and Luis Suárez wants Champions League football. Reality: Liverpool dug in, kept him, and he almost won them the title.',
    stayMemory: 'Held Suárez against his wishes — and he stays to fire the title charge, as reality had it.',
    leaveMemory: 'Suárez forces his move — Liverpool lose their talisman a year before they meant to.',
  }),
];

// ── The sporting near-miss register: the almost-glory the Director can rewrite ──
// The famous inches — a title lost by a point, a final lost in stoppage time, a
// last-day escape or a shock drop. `sportingRewriteOdds` reads how good the side
// actually is now (its strength percentile in the league), its mood and the board's
// backing, so a juggernaut rewrites the heartbreak more often than a fragile side —
// but never as a certainty, because these moments never were.

interface SportingNearMissCfg {
  id: string;
  scenario: string;
  club: ClubState['id'];
  date: string;
  realWon?: boolean; // reality turned this one into glory at the death (hold it, or blow it)
  requiresPlayer?: string; // a key figure who must still be at the club for it to land
  title: string;
  blurb: string;
  goLabel: string;
  holdLabel: string;
  winMemory: string; // the outcome that beats history's near-miss
  loseMemory: string; // history's heartbreak, relived
}

/** Build a near-miss beat whose outcome turns on how good the side really is now. */
function sportingNearMiss(cfg: SportingNearMissCfg): ScriptedEvent {
  return {
    id: cfg.id,
    date: cfg.date,
    scenarios: [cfg.scenario],
    requires: (s) =>
      s.playerClub === cfg.club && (!cfg.requiresPlayer || playerAt(s, cfg.requiresPlayer, cfg.club)),
    build: (s) => {
      const odds = sportingRewriteOdds(s, { realWon: cfg.realWon });
      const win = [
        { kind: 'boardPatience' as const, amount: 12 },
        { kind: 'morale' as const, clubId: cfg.club, amount: 12 },
        { kind: 'memory' as const, tag: 'near-miss', text: cfg.winMemory },
      ];
      const lose = [
        { kind: 'morale' as const, clubId: cfg.club, amount: -8 },
        { kind: 'boardPatience' as const, amount: -3 },
        { kind: 'memory' as const, tag: 'near-miss', text: cfg.loseMemory },
      ];
      return {
        id: `register:${cfg.id}`,
        title: cfg.title,
        description: cfg.blurb,
        interrupt: true,
        clubId: cfg.club,
        category: 'event',
        choices: [
          { id: 'go', label: cfg.goLabel, successProbability: Math.min(0.9, odds + 0.05), onSuccess: win, onFailure: lose },
          {
            id: 'hold',
            label: cfg.holdLabel,
            successProbability: odds,
            onSuccess: win,
            onFailure: [{ kind: 'morale', clubId: cfg.club, amount: -5 }, { kind: 'memory', tag: 'near-miss', text: cfg.loseMemory }],
          },
        ],
        falloutIfIgnored: odds >= 0.5 ? win : lose,
        memoryTags: ['near-miss'],
      };
    },
  };
}

const SPORTING_NEAR_MISS_PACK: ScriptedEvent[] = [
  sportingNearMiss({
    id: 'nearmiss-gerrard-slip-2014', scenario: 'liverpool-2010', club: 'liverpool', date: '2014-04',
    requiresPlayer: 'cur_gerrard_lv10',
    title: 'The title in your hands — and a slip away',
    blurb: 'Liverpool lead the title race with weeks to go, Chelsea at Anfield the last true test. Reality is the cruellest of images: Gerrard’s slip, Demba Ba, the dream gone by two points. Throw caution to the wind, or manage the biggest game of a generation?',
    goLabel: 'Go for the throat — win it outright', holdLabel: 'Control it — nerveless and tight',
    winMemory: 'No slip, no collapse — Liverpool are champions at last, the ghost of 2014 exorcised.',
    loseMemory: 'The slip, the two points, the agony — the title lost exactly as it was.',
  }),
  sportingNearMiss({
    id: 'nearmiss-invincibles-run-2004', scenario: 'arsenal-2004', club: 'arsenal', date: '2004-10',
    requiresPlayer: 'cur_henry',
    title: '49 unbeaten — and Old Trafford await',
    blurb: 'The Invincibles have stretched their unbeaten league run to a record 49 games, and only Manchester United and a hostile Old Trafford stand in the way. Reality ended it in the "Battle of the Buffet" — a disputed penalty, a pizza thrown, the streak over. Protect the record, or go and win it in their backyard?',
    goLabel: 'Attack — win at Old Trafford', holdLabel: 'Stay disciplined — do not lose it',
    winMemory: 'The run rolls on past Old Trafford — the Invincibles’ streak becomes untouchable.',
    loseMemory: 'The streak dies at Old Trafford amid the pizza and the fury, as it really did.',
  }),
  sportingNearMiss({
    id: 'nearmiss-liverpool-title-2002', scenario: 'liverpool-2001', club: 'liverpool', date: '2002-04',
    title: 'Houllier’s Liverpool close on the title',
    blurb: 'Liverpool are chasing a first league title since 1990, Arsenal just ahead. Reality: they finished a strong second, seven points back, the drought going on. This is the run-in — chase Arsenal down, or bank the Champions League place?',
    goLabel: 'Chase the title — all or nothing', holdLabel: 'Lock down second and Europe',
    winMemory: 'Liverpool run Arsenal down and end the long wait — champions, decades early.',
    loseMemory: 'Second again, the title drought unbroken — as it went.',
  }),
  sportingNearMiss({
    id: 'nearmiss-lasagne-2006', scenario: 'spurs-2001', club: 'spurs', date: '2006-05',
    title: 'The final day — Champions League on the line',
    blurb: 'Tottenham need only match Arsenal on the last day to seize fourth and the Champions League. Reality: half the squad went down with food poisoning at the team hotel the night before — "Lasagne-gate" — and they lost at West Ham, the dream snatched away. Steady the ship, or throw everything forward?',
    goLabel: 'Attack — take it into your own hands', holdLabel: 'Keep calm — a point may be enough',
    winMemory: 'Spurs hold their nerve and take fourth — the Champions League reached, the lasagne curse beaten.',
    loseMemory: 'Struck down on the final morning, beaten at West Ham — fourth surrendered, as it was.',
  }),
  sportingNearMiss({
    id: 'nearmiss-aguero-2012', scenario: 'man-city-2008', club: 'man_city', date: '2012-05', realWon: true,
    title: '93:20 — the title on the final kick',
    blurb: 'The last day, the title decided on goal difference, and City somehow losing to ten-man QPR deep into stoppage time as United celebrate up the road. Reality produced the most famous moment in Premier League history — Agüerooooo. Do you hold your nerve for the miracle, or does the pressure tell?',
    goLabel: 'Throw everyone forward — force the winner', holdLabel: 'Trust the players — keep believing',
    winMemory: 'Agüero, 93:20 — City are champions in the maddest finish of all, exactly as it happened.',
    loseMemory: 'The winner never comes — City fall agonisingly short and United take the title, a miracle undone.',
  }),
  sportingNearMiss({
    id: 'nearmiss-moscow-2008', scenario: 'chelsea-2003', club: 'chelsea', date: '2008-05',
    requiresPlayer: 'cur_terry_c',
    title: 'Moscow — one kick from the European Cup',
    blurb: 'Chelsea’s first Champions League final, United the opponents, and it comes down to penalties in the Moscow rain. Reality: Terry slipped taking the kick that would have won it, and the trophy slipped away with him. Steel your men for the shootout, or go for the win in normal time?',
    goLabel: 'Win it before penalties', holdLabel: 'Hold firm — trust the shootout',
    winMemory: 'No slip in the rain — Chelsea are kings of Europe years ahead of schedule.',
    loseMemory: 'Terry slips, the kick misses, and the European Cup is lost in Moscow — as it truly was.',
  }),
  sportingNearMiss({
    id: 'nearmiss-barca-title-2004', scenario: 'barcelona-2003', club: 'barcelona', date: '2004-04',
    requiresPlayer: 'cur_ronaldinho_b3',
    title: 'Rijkaard’s revival closes on the title',
    blurb: 'After a dismal first half of the season, Ronaldinho and a reborn Barcelona have surged up the table. Reality: they fell just short in second and won the title the following year. Push for it now, or trust the project to bloom on schedule?',
    goLabel: 'Seize it a year early', holdLabel: 'Build steadily — second is progress',
    winMemory: 'Barça complete the surge and take the title a year early — the revival crowned ahead of time.',
    loseMemory: 'A strong second, the title one year away — the Rijkaard revival on its real timeline.',
  }),
  sportingNearMiss({
    id: 'nearmiss-juve-final-1998', scenario: 'juventus-1995', club: 'juventus', date: '1998-05',
    requiresPlayer: 'cur_delpiero_j',
    title: 'A third European final in a row — Real await',
    blurb: 'Lippi’s Juventus have reached yet another Champions League final, this time against Real Madrid. Reality: a lone Mijatović goal beat them, a third final in a row that ended in defeat — the great nearly-side of the age. Can you finally get it right on the grandest night?',
    goLabel: 'Go for the win — end the final curse', holdLabel: 'Control it — do not lose another',
    winMemory: 'Juventus finally win the big one — the serial finalists crowned, rewriting three years of hurt.',
    loseMemory: 'Beaten by Real, a third straight final lost — the nearly-men of Europe once more, as it was.',
  }),
];

// ── The career near-miss register: the talents who almost were ────────────────
// Wonderkids reality wasted, offered a road not taken. `careerFulfilmentOdds` turns
// on the levers the Director actually controls — minutes, mood, how he's handled —
// so a Reyes or a Pato can kick on under the right care, or stall exactly as he did.

interface CareerNearMissCfg {
  id: string;
  scenario: string;
  club: ClubState['id'];
  playerId: string;
  date: string;
  realFulfilled: boolean; // did he fulfil his talent, in reality?
  title: string;
  blurb: string;
  fulfilMemory: string;
  stallMemory: string;
}

/** Build a talent-crossroads beat whose outcome bends with how he's been handled. */
function careerNearMiss(cfg: CareerNearMissCfg): ScriptedEvent {
  return {
    id: cfg.id,
    date: cfg.date,
    scenarios: [cfg.scenario],
    requires: (s) => playerAt(s, cfg.playerId, cfg.club) && s.playerClub === cfg.club,
    build: (s) => {
      const p = s.players[cfg.playerId]!;
      const odds = careerFulfilmentOdds(s, p, { realFulfilled: cfg.realFulfilled });
      const fulfil = [
        { kind: 'ability' as const, playerId: cfg.playerId, amount: 3 },
        { kind: 'morale' as const, playerId: cfg.playerId, amount: 10 },
        { kind: 'memory' as const, tag: 'career-arc', text: cfg.fulfilMemory },
      ];
      const stall = [
        { kind: 'ability' as const, playerId: cfg.playerId, amount: -2 },
        { kind: 'memory' as const, tag: 'career-arc', text: cfg.stallMemory },
      ];
      return {
        id: `register:${cfg.id}`,
        title: cfg.title,
        description: cfg.blurb,
        interrupt: true,
        clubId: cfg.club,
        category: 'event',
        choices: [
          {
            id: 'invest',
            label: 'Build him in — guaranteed minutes and faith',
            successProbability: Math.min(0.92, odds + 0.12),
            onSuccess: fulfil,
            onFailure: [{ kind: 'memory', tag: 'career-arc', text: cfg.stallMemory }],
          },
          {
            id: 'patient',
            label: 'Bring him slowly — protect him from the hype',
            successProbability: odds,
            onSuccess: fulfil,
            onFailure: stall,
          },
        ],
        falloutIfIgnored: odds >= 0.5 ? fulfil : stall,
        memoryTags: ['career-arc', cfg.playerId],
      };
    },
  };
}

const CAREER_NEAR_MISS_PACK: ScriptedEvent[] = [
  careerNearMiss({
    id: 'career-reyes-2005', scenario: 'arsenal-2004', club: 'arsenal', playerId: 'cur_reyes',
    date: '2005-09', realFulfilled: false,
    title: 'Reyes — the flair that faded',
    blurb: 'José Antonio Reyes has the gifts to be Arsenal’s next great forward, but the English winters and the physical battering are grinding him down. Reality: he wilted, wanted home, and drifted back to Spain a shadow of the prospect.',
    fulfilMemory: 'Reyes settles and blooms in England — the star his talent always promised, unlike reality.',
    stallMemory: 'Reyes wilts and drifts home — the gifted forward who never was, as it went.',
  }),
  careerNearMiss({
    id: 'career-robinho-2007', scenario: 'real-madrid-2006', club: 'real_madrid', playerId: 'cur_robinho_r6',
    date: '2007-09', realFulfilled: false,
    title: 'Robinho — the next Pelé?',
    blurb: 'Anointed the heir to Pelé, Robinho has the tricks but not yet the end product or the discipline. Reality: the promise dissolved into stepovers and unfulfilled talent across a nomadic career.',
    fulfilMemory: 'Robinho adds substance to the samba — he becomes the superstar Brazil crowned him, defying his real fade.',
    stallMemory: 'Robinho stays all trick and no end product — the great unfulfilled talent, as reality had it.',
  }),
  careerNearMiss({
    id: 'career-pato-2009', scenario: 'milan-2007', club: 'milan', playerId: 'cur_pato_07',
    date: '2009-09', realFulfilled: false,
    title: 'Pato — the Duck before the injuries',
    blurb: 'Alexandre Pato is the most exciting teenager in Europe, electric and fearless. Reality: a relentless run of muscle injuries — some say rushed back too often — wrecked the career before it peaked.',
    fulfilMemory: 'Managed carefully, Pato stays fit and fulfils the hype — the world-beater his talent promised.',
    stallMemory: 'The muscle injuries pile up and break Pato’s rhythm — the wonderkid who never peaked, as it was.',
  }),
  careerNearMiss({
    id: 'career-bojinov-2007', scenario: 'juventus-2006', club: 'juventus', playerId: 'cur_bojinov',
    date: '2007-09', realFulfilled: false,
    title: 'Bojinov — the boy wonder',
    blurb: 'Valeri Bojinov arrived billed as a generational striker. Reality: injuries and temperament turned one of the era’s great hype stories into a cautionary tale.',
    fulfilMemory: 'Bojinov knuckles down and delivers — the striker the hype promised, against all of reality.',
    stallMemory: 'Bojinov’s career unravels in injuries and frustration — the cautionary tale, as it went.',
  }),
  careerNearMiss({
    id: 'career-martins-2006', scenario: 'inter-2004', club: 'inter', playerId: 'cur_martins_04',
    date: '2006-09', realFulfilled: false,
    title: 'Martins — pace to burn',
    blurb: 'Obafemi Martins is one of the quickest, most explosive forwards in Serie A, but raw and inconsistent. Reality: a solid career, but never quite the superstar the athleticism promised.',
    fulfilMemory: 'Martins adds the polish to the power — he kicks on into a genuine star, beyond his real ceiling.',
    stallMemory: 'Martins stays thrillingly raw but never quite elite — the near-miss reality settled for.',
  }),
  careerNearMiss({
    id: 'career-townsend-2014', scenario: 'spurs-2013', club: 'spurs', playerId: 'cur_townsend_13',
    date: '2014-09', realFulfilled: false,
    title: 'Townsend — the burst of promise',
    blurb: 'Andros Townsend has exploded onto the scene with fearless, direct wing play. Reality: the level dipped, the end product wavered, and he settled into a journeyman’s career.',
    fulfilMemory: 'Townsend sharpens his end product and pushes on — the winger the early burst promised.',
    stallMemory: 'Townsend’s level dips back — the flash of promise settling into the journeyman he became.',
  }),
  careerNearMiss({
    id: 'career-januzaj-2014', scenario: 'man-utd-2013', club: 'man_utd', playerId: 'cur_januzaj',
    date: '2014-09', realFulfilled: false,
    title: 'Januzaj — the boy who lit up a grim season',
    blurb: 'Adnan Januzaj is the one bright spark of the post-Ferguson gloom, a two-footed teenager the whole country is raving about. Reality: the hype curdled, the loans piled up, and he faded from view.',
    fulfilMemory: 'Januzaj builds on the dazzling start — the star United thought they had, made real.',
    stallMemory: 'Januzaj drifts into loans and irrelevance — the wonderkid who wasn’t, as it went.',
  }),
  careerNearMiss({
    id: 'career-zaha-2014', scenario: 'man-utd-2013', club: 'man_utd', playerId: 'cur_zaha',
    date: '2014-01', realFulfilled: false,
    title: 'Zaha — frozen out at Old Trafford',
    blurb: 'Wilfried Zaha, Ferguson’s last signing, cannot get near the team under the new regime and the confidence is draining out of him. Reality: he flopped at United and only rediscovered himself back at Palace.',
    fulfilMemory: 'Backed Zaha and unlocked him at United — the electric winger Palace later enjoyed, kept here.',
    stallMemory: 'Zaha withers on the United bench — a talent wasted before it bloomed elsewhere, as it did.',
  }),
  careerNearMiss({
    id: 'career-jones-2015', scenario: 'man-utd-2013', club: 'man_utd', playerId: 'cur_jones',
    date: '2015-01', realFulfilled: false,
    title: 'Phil Jones — “our best player ever”?',
    blurb: 'Ferguson swore Phil Jones could become United’s greatest ever, able to play anywhere. Reality: a relentless run of injuries and the odd calamity turned the prophecy into a punchline.',
    fulfilMemory: 'Jones stays fit and grows into the colossus Ferguson foresaw — the prophecy fulfilled.',
    stallMemory: 'Jones is ground down by injury and error — the great prediction that never came true, as it was.',
  }),
  careerNearMiss({
    id: 'career-sturridge-2009', scenario: 'man-city-2008', club: 'man_city', playerId: 'cur_sturridge_c8',
    date: '2009-09', realFulfilled: false,
    title: 'Sturridge — the finisher City let slip',
    blurb: 'Daniel Sturridge is a natural goalscorer stuck behind the takeover’s marquee names and starved of minutes. Reality: he left for nothing and became prolific elsewhere — a finisher City waved away.',
    fulfilMemory: 'Gave Sturridge his platform and kept him — the prolific striker City really let walk for free.',
    stallMemory: 'Sturridge is squeezed out and blooms elsewhere — the one that got away, as it happened.',
  }),
  careerNearMiss({
    id: 'career-joecole-2005', scenario: 'chelsea-2003', club: 'chelsea', playerId: 'cur_joecole_c3',
    date: '2005-01', realFulfilled: false,
    title: 'Joe Cole — flair in a machine',
    blurb: 'Joe Cole is England’s most gifted improviser, but Mourinho wants discipline and running before magic. Reality: he added the graft, had some fine years, then injuries and a fade robbed him of the very top.',
    fulfilMemory: 'Cole marries the flair to the discipline and reaches the top tier — the maverick fulfilled.',
    stallMemory: 'Cole’s magic is coached down and then injury bites — the gifted one who fell just short, as it went.',
  }),
  careerNearMiss({
    id: 'career-saviola-2004', scenario: 'barcelona-2003', club: 'barcelona', playerId: 'cur_saviola_b3',
    date: '2004-08', realFulfilled: false,
    title: 'Saviola — El Conejo’s crossroads',
    blurb: 'Javier Saviola arrived billed as the next great Argentine forward, but the goals have slowed and the new regime is not convinced. Reality: he was loaned out and never fulfilled the enormous promise.',
    fulfilMemory: 'Kept faith with Saviola and reignited him — the great Argentine forward his talent promised.',
    stallMemory: 'Saviola is loaned out and fades — the wonderkid who never quite was, exactly as it went.',
  }),
  careerNearMiss({
    id: 'career-gago-2007', scenario: 'real-madrid-2006', club: 'real_madrid', playerId: 'cur_gago_r6',
    date: '2007-09', realFulfilled: false,
    title: 'Gago — the next Redondo?',
    blurb: 'Fernando Gago has been anointed the heir to Redondo, an elegant metronome in Madrid’s midfield. Reality: injuries and inconsistency meant the comparison quietly faded away.',
    fulfilMemory: 'Gago grows into the midfield conductor Madrid dreamed of — the Redondo heir, fulfilled.',
    stallMemory: 'Gago’s promise dissolves in injury and drift — the comparison abandoned, as it was.',
  }),
  careerNearMiss({
    id: 'career-redknapp-1996', scenario: 'liverpool-1995', club: 'liverpool', playerId: 'cur_redknapp_95',
    date: '1996-11', realFulfilled: false,
    title: 'Redknapp — the elegance and the fragility',
    blurb: 'Jamie Redknapp is a cultured playmaker tipped to run England’s midfield for a decade. Reality: a catalogue of injuries hollowed out a career that promised so much more.',
    fulfilMemory: 'Managed Redknapp’s body and kept him whole — the cultured midfield general England awaited.',
    stallMemory: 'Redknapp’s injuries mount and the promise leaks away — the nearly-great, as it truly went.',
  }),
  careerNearMiss({
    id: 'career-ricken-1998', scenario: 'dortmund-1997', club: 'dortmund', playerId: 'cur_ricken_97',
    date: '1998-09', realFulfilled: false,
    title: 'Ricken — the golden boy of the final',
    blurb: 'Lars Ricken chipped the European Cup final winner as a 20-year-old substitute and looked destined for greatness. Reality: injuries and the weight of expectation meant he never truly kicked on.',
    fulfilMemory: 'Ricken builds on his final-night immortality — the golden boy who became a great, at last.',
    stallMemory: 'Ricken never escapes the shadow of that one perfect chip — the promise unfulfilled, as it was.',
  }),
  careerNearMiss({
    id: 'career-ventola-1999', scenario: 'inter-1998', club: 'inter', playerId: 'cur_ventola',
    date: '1999-09', realFulfilled: false,
    title: 'Ventola — the spark behind Ronaldo',
    blurb: 'Nicola Ventola is a quick, fearless young forward pressing for a place in a star-studded Inter attack. Reality: knee injuries wrecked his rhythm and a bright career petered out.',
    fulfilMemory: 'Ventola stays fit and forces his way in — the striker Inter’s academy always believed in.',
    stallMemory: 'Ventola’s knees betray him and the spark dies out — the nearly-man, as it really went.',
  }),
];

// ── The marquee injury register: the injuries that can go the other way ───────
// The career-altering injuries of the era, staged as a rush-or-protect fork whose
// outcome the factors decide. `injuryRecoveryOdds` reads the club's medical muscle,
// the man's age and how injury-prone he is, and whether you're rushing him back — so
// a big club that protects a young body can spare him the fate reality dealt, while a
// fragile veteran forced back for a run-in breaks down for good, exactly as he did.
// (These sit alongside the raw real-injury register in ledger.ts, which fires the
// smaller, background injuries of each era on their true dates.)

interface InjuryBeatCfg {
  id: string;
  scenario: string;
  club: ClubState['id'];
  playerId: string;
  date: string;
  outMonths: number; // the initial lay-off before the rush-or-protect call
  title: string;
  blurb: string;
  sparedMemory: string;
  wreckedMemory: string;
}

/** Build an injury beat: rush him back and risk the career, or protect the man. */
function injuryBeat(cfg: InjuryBeatCfg): ScriptedEvent {
  return {
    id: cfg.id,
    date: cfg.date,
    scenarios: [cfg.scenario],
    requires: (s) => playerAt(s, cfg.playerId, cfg.club) && s.playerClub === cfg.club,
    build: (s) => {
      const p = s.players[cfg.playerId]!;
      const rushOdds = injuryRecoveryOdds(s, p, { rushed: true });
      const protectOdds = injuryRecoveryOdds(s, p, { rushed: false });
      const spared = [
        { kind: 'ability' as const, playerId: cfg.playerId, amount: -1 },
        { kind: 'ban' as const, playerId: cfg.playerId, months: Math.max(1, Math.round(cfg.outMonths / 2)) },
        { kind: 'memory' as const, tag: 'injury', text: cfg.sparedMemory },
      ];
      const wrecked = [
        { kind: 'ban' as const, playerId: cfg.playerId, months: cfg.outMonths + 4 },
        { kind: 'ability' as const, playerId: cfg.playerId, amount: -6 },
        { kind: 'memory' as const, tag: 'injury', text: cfg.wreckedMemory },
      ];
      return {
        id: `register:${cfg.id}`,
        title: cfg.title,
        description: cfg.blurb,
        interrupt: true,
        clubId: cfg.club,
        category: 'event',
        choices: [
          {
            id: 'rush',
            label: 'Rush him back — you need him now',
            successProbability: rushOdds,
            onSuccess: [{ kind: 'ban', playerId: cfg.playerId, months: Math.max(1, Math.round(cfg.outMonths / 2)) }, { kind: 'memory', tag: 'injury', text: cfg.sparedMemory }],
            onFailure: wrecked,
          },
          {
            id: 'protect',
            label: 'Protect him — best specialists, a full rehab',
            successProbability: protectOdds,
            onSuccess: spared,
            onFailure: [{ kind: 'ban', playerId: cfg.playerId, months: cfg.outMonths }, { kind: 'ability', playerId: cfg.playerId, amount: -3 }, { kind: 'memory', tag: 'injury', text: cfg.wreckedMemory }],
          },
        ],
        falloutIfIgnored: protectOdds >= 0.5 ? spared : wrecked,
        memoryTags: ['injury', cfg.playerId],
      };
    },
  };
}

const INJURY_BEAT_PACK: ScriptedEvent[] = [
  injuryBeat({
    id: 'injury-owen-2003', scenario: 'liverpool-2001', club: 'liverpool', playerId: 'cur_owen01',
    date: '2003-02', outMonths: 3,
    title: 'Owen’s hamstring — the pace under threat',
    blurb: 'Michael Owen’s explosive pace is his whole game, and a recurring hamstring has flared again. Reality: the tears kept coming and the blistering acceleration was never quite the same. Manage his load and protect the burst, or push the goalscorer straight back in?',
    sparedMemory: 'Managed Owen’s hamstrings carefully — the explosive pace preserved, unlike reality’s slow erosion.',
    wreckedMemory: 'Owen’s hamstrings keep tearing and the blistering pace fades — the striker diminished, as it went.',
  }),
  injuryBeat({
    id: 'injury-rvp-2006', scenario: 'arsenal-2004', club: 'arsenal', playerId: 'cur_rvp',
    date: '2006-01', outMonths: 4,
    title: 'Van Persie’s fragile years',
    blurb: 'Robin van Persie has all the talent in the world but a body that keeps letting him down — another injury has struck. Reality: years of stop-start seasons before he finally stayed fit and became prolific. Wrap him in cotton wool, or trust him to play through it?',
    sparedMemory: 'Nursed Van Persie through his fragile years — he stays fit and delivers early, sparing the lost seasons.',
    wreckedMemory: 'Van Persie breaks down again — the brilliant talent lost to the treatment table for years, as it was.',
  }),
  injuryBeat({
    id: 'injury-robben-2010', scenario: 'bayern-2009', club: 'bayern', playerId: 'cur_robben_09',
    date: '2010-03', outMonths: 2,
    title: 'Robben’s hamstrings before the big games',
    blurb: 'Arjen Robben is unplayable when fit, but his hamstrings have a habit of going at the worst moments — one has tightened again with the season’s biggest games looming. Reality: he pulled up in finals and deciders time and again. Rest him and miss him now, or risk him for the run-in?',
    sparedMemory: 'Rested Robben and kept him whole for the finals — the difference-maker fit when it mattered most.',
    wreckedMemory: 'Robben’s hamstring goes again at the worst time — brilliance undone by fitness, as it so often was.',
  }),
  injuryBeat({
    id: 'injury-king-2004', scenario: 'spurs-2001', club: 'spurs', playerId: 'cur_king01',
    date: '2004-01', outMonths: 3,
    title: 'Ledley King’s knee — no cartilage left',
    blurb: 'Ledley King, the most gifted defender in England, has a knee so damaged he can barely train on it. Reality: he managed it match-to-match without training and had a truncated, heartbreaking career. Do you find a way to preserve him, or lean on him as your rock?',
    sparedMemory: 'Managed King’s knee like porcelain — the great defender gets the fuller career reality denied him.',
    wreckedMemory: 'King’s knee gives way under the load — a magnificent career cut short, exactly as it happened.',
  }),
];

// ── The transfer near-miss register: the deals that almost happened ───────────
// A real target the club historically chased and missed, offered mid-save as a swoop.
// Win the factor roll (`transferLandsOdds` — the club's pull and its budget vs the
// calibre) and you land the man reality let slip; lose it, or wave it away, and he
// stays put (or goes where he went — the ledger completes any real move on the miss
// path). Only targets still at their club when the beat fires qualify: a deal that
// resolves in the OPENING window is handled by the live gazump (M12A/C) instead.

interface TransferNearMissCfg {
  id: string;
  scenario: string;
  club: ClubState['id']; // the user's club (the historical near-miss suitor)
  targetId: string;
  fromClub: ClubState['id']; // where the target sits when the chance comes
  date: string;
  title: string;
  blurb: string;
  landMemory: string;
  missMemory: string;
}

/** Build a swoop beat: land a real near-miss target, or watch him stay where he was. */
function transferNearMiss(cfg: TransferNearMissCfg): ScriptedEvent {
  return {
    id: cfg.id,
    date: cfg.date,
    scenarios: [cfg.scenario],
    requires: (s) =>
      s.playerClub === cfg.club && playerAt(s, cfg.targetId, cfg.fromClub) && !!s.clubs[cfg.club],
    build: (s) => {
      const target = s.players[cfg.targetId]!;
      const odds = transferLandsOdds(s, { targetAbility: target.ability });
      const fee = sagaFee(s, target);
      const feeM = feeMillions(fee);
      const land = [
        { kind: 'transferOut' as const, playerId: cfg.targetId, clubId: cfg.club, amount: fee },
        { kind: 'memory' as const, tag: 'transfer-near-miss', text: cfg.landMemory },
      ];
      return {
        id: `register:${cfg.id}`,
        title: cfg.title,
        description: `${cfg.blurb} (~£${feeM}m).`,
        interrupt: true,
        clubId: cfg.club,
        category: 'event',
        choices: [
          {
            id: 'swoop',
            label: `Go all in — land him (£${feeM}m)`,
            successProbability: odds,
            onSuccess: land,
            // Lose the race and he goes where he really went (the ledger completes it).
            onFailure: [{ kind: 'memory', tag: 'transfer-near-miss', text: cfg.missMemory }],
          },
          {
            id: 'pass',
            label: 'Stay disciplined — walk away',
            successProbability: 1,
            onSuccess: [{ kind: 'memory', tag: 'transfer-near-miss', text: cfg.missMemory }],
            onFailure: [],
          },
        ],
        falloutIfIgnored: [{ kind: 'memory', tag: 'transfer-near-miss', text: cfg.missMemory }],
        memoryTags: ['transfer-near-miss', cfg.targetId],
      };
    },
  };
}

const TRANSFER_NEAR_MISS_PACK: ScriptedEvent[] = [
  transferNearMiss({
    id: 'swoop-terry-2009', scenario: 'man-city-2008', club: 'man_city', targetId: 'cur_terry_c8', fromClub: 'chelsea',
    date: '2009-07',
    title: 'The world-record bid for John Terry',
    blurb: 'The takeover’s money makes the impossible possible: prise Chelsea’s captain and heartbeat, John Terry, across London with a British-record offer. Reality: City tried, and Terry stayed at the Bridge',
    landMemory: 'City stun football and land John Terry — the captain of Chelsea, prised away by the petrodollars.',
    missMemory: 'Terry stays at Chelsea — the captain rebuffs the money, exactly as he did.',
  }),
  transferNearMiss({
    id: 'swoop-ronaldo-city-2009', scenario: 'man-city-2008', club: 'man_city', targetId: 'cur_cristiano_u8', fromClub: 'man_utd',
    date: '2009-01',
    title: 'The £100m question — Cristiano Ronaldo',
    blurb: 'The most audacious move in the game: test Manchester United with a world-shattering offer for Cristiano Ronaldo and announce City as the new superpower. Reality: he went to Madrid instead',
    landMemory: 'City land Cristiano Ronaldo — the statement to end all statements, the balance of power ripped up.',
    missMemory: 'Ronaldo chooses Madrid over the City project — the Galáctico dream, as reality had it.',
  }),
  transferNearMiss({
    id: 'swoop-villa-2009', scenario: 'real-madrid-2006', club: 'real_madrid', targetId: 'cur_villa_v6', fromClub: 'valencia',
    date: '2009-07',
    title: 'David Villa — beat Barça to El Guaje',
    blurb: 'Spain’s deadliest finisher is prised loose by Valencia’s money troubles, and both Madrid and Barcelona want him. Reality: he chose Barça and won a treble',
    landMemory: 'Madrid land David Villa ahead of Barça — El Guaje’s goals turned white, not blaugrana.',
    missMemory: 'Villa joins Barcelona — the finisher goes to the enemy, exactly as he did.',
  }),
  transferNearMiss({
    id: 'swoop-gerrard-chelsea-2005', scenario: 'chelsea-2003', club: 'chelsea', targetId: 'cur_gerrard_l', fromClub: 'liverpool',
    date: '2005-07',
    title: 'Gerrard — £32m to break the Kop’s heart',
    blurb: 'Fresh from Istanbul, Steven Gerrard has all but agreed to join Mourinho’s Chelsea, and a British-record bid is on the table. Reality: he performed a dramatic overnight u-turn and stayed at Liverpool',
    landMemory: 'Chelsea land Gerrard — the u-turn that never comes, the Kop’s captain in blue.',
    missMemory: 'Gerrard performs his famous u-turn and stays at Liverpool — the deal that got away, as it did.',
  }),
];

const ALL_SCRIPTED: ScriptedEvent[] = [
  ...MAN_UTD_1999_PACK,
  ...LIVERPOOL_2001_PACK,
  ...ARSENAL_2004_PACK,
  ...REAL_MADRID_2000_PACK,
  ...DORTMUND_2012_PACK,
  ...MAN_CITY_2008_PACK,
  ...BARCELONA_2003_PACK,
  ...ARSENAL_1996_PACK,
  ...MILAN_1995_PACK,
  ...JUVENTUS_1995_PACK,
  ...LIVERPOOL_1995_PACK,
  ...CHELSEA_1996_PACK,
  ...CHELSEA_2003_PACK,
  ...DORTMUND_1997_PACK,
  ...INTER_1998_PACK,
  ...INTER_2004_PACK,
  ...JUVENTUS_2006_PACK,
  ...MILAN_2007_PACK,
  ...REAL_MADRID_2006_PACK,
  ...LIVERPOOL_2010_PACK,
  ...MAN_UTD_2013_PACK,
  ...SPURS_2001_PACK,
  ...SPURS_2013_PACK,
  ...BARCELONA_2014_PACK,
  ...BAYERN_1998_PACK,
  ...BAYERN_2009_PACK,
  ...CONTRACT_SAGA_PACK,
  ...SPORTING_NEAR_MISS_PACK,
  ...CAREER_NEAR_MISS_PACK,
  ...INJURY_BEAT_PACK,
  ...TRANSFER_NEAR_MISS_PACK,
];

function fireScriptedEvents(state: GameState): void {
  for (const ev of ALL_SCRIPTED) {
    // Only ever consider an event for its own scenario — a different scenario must
    // not process it, so it never logs a spurious skip against fidelity.
    if (!ev.scenarios.includes(state.meta.scenarioId)) continue;
    if (ev.date !== state.clock.date) continue;
    if (state.meta.firedScripted.includes(ev.id)) continue;
    state.meta.firedScripted.push(ev.id);

    if (ev.requires(state)) {
      state.pendingDecisions.push(ev.build(state));
      logEvent(state, {
        category: 'event',
        code: 'scripted.fired',
        message: `Scripted event fired: ${ev.id}`,
        data: { id: ev.id },
      });
    } else {
      // Divergence invalidated it (e.g. the player was sold).
      logEvent(state, {
        category: 'event',
        code: 'scripted.skipped',
        message: `Scripted event skipped (divergence): ${ev.id}`,
        data: { id: ev.id },
      });
    }
  }
}

// ── Macro market windows (China / MLS / Saudi) ───────────────────────────────

function ymIndex(date: string): number {
  return Number(date.slice(0, 4)) * 12 + (Number(date.slice(5, 7)) - 1);
}

/**
 * A date-anchored world event. `world` fires its global colour once when the date
 * is reached; `build` optionally raises an interactive decision for the user's
 * club. Market windows use `windowMonths` to stay open a while after the date.
 */
interface MacroEvent {
  id: string;
  date: YearMonth;
  windowMonths?: number;
  /** Logged world colour, applied once when the date is reached. */
  world?: (state: GameState) => void;
  /** An interactive decision for the user's club, or null to stay world-only. */
  build?: (state: GameState, userClub: ClubState) => Decision | null;
}

/**
 * A market-window selling opportunity (China / Saudi / MLS). When a cash-rich
 * destination opens up, a real, inflated bid arrives for one of the user's players
 * who fits that market's profile — a chance to cash in above true value.
 * Deterministic (picks the highest-valued eligible player), and "keep him" is the
 * first choice, so a passive/reality run never sells. Returns null (no decision)
 * if the squad has no one who fits — the world colour still fires.
 */
function marketSaleDecision(
  state: GameState,
  userClub: ClubState,
  o: { market: string; marketName: string; minAge: number; minAbility: number; maxAbility?: number; feeMult: number; pitch: string },
): Decision | null {
  const year = Number(state.clock.date.slice(0, 4));
  const eligible = clubSquadPlayers(state, userClub.id).filter(
    (p) => !p.injury && year - p.birthYear >= o.minAge && p.ability >= o.minAbility && p.ability <= (o.maxAbility ?? 99),
  );
  if (eligible.length === 0) return null;
  const target = eligible
    .slice()
    .sort((a, b) => valuePlayer(b, year) - valuePlayer(a, year) || a.id.localeCompare(b.id))[0]!;
  const pendingId = `macro:${o.market}:${target.id}`;
  if (state.pendingDecisions.some((d) => d.id.startsWith(pendingId))) return null;
  const fee = Math.round(valuePlayer(target, year) * o.feeMult);
  const feeM = Math.round(fee / 1_000_000);
  return {
    id: `${pendingId}:${state.clock.date}`,
    title: `${o.marketName} table a huge bid for ${target.name}`,
    description: `${o.pitch} They have tabled an offer for ${target.name} that dwarfs his market value — £${feeM}m. Cash in on a fee reality would envy, or keep your man?`,
    interrupt: true,
    clubId: userClub.id,
    category: 'transfer',
    choices: [
      {
        id: 'keep',
        label: 'Keep him — reject the money',
        successProbability: 0.6,
        onSuccess: [{ kind: 'morale', playerId: target.id, amount: 4 }, { kind: 'memory', tag: 'transfer-saga', text: `Turned down ${o.marketName}'s money for ${target.name}.` }],
        onFailure: [{ kind: 'agitation', playerId: target.id, amount: 10 }],
      },
      {
        id: 'cash-in',
        label: `Cash in (£${feeM}m)`,
        successProbability: 0.9,
        onSuccess: [{ kind: 'sellAbroad', playerId: target.id, clubId: o.market, amount: fee }, { kind: 'memory', tag: 'transfer-saga', text: `Sold ${target.name} to ${o.marketName} for a fee above his worth.` }],
        onFailure: [{ kind: 'agitation', playerId: target.id, amount: 8 }],
      },
    ],
    falloutIfIgnored: [{ kind: 'memory', tag: 'transfer-saga', text: `${o.marketName}'s money for ${target.name} went unanswered.` }],
    memoryTags: ['transfer-saga', target.id],
  };
}

const MACRO_EVENTS: MacroEvent[] = [
  // ── Ambient background story: Simeone's Atlético, 2013-14 ──
  {
    id: 'atletico-2014',
    date: '2014-05',
    world: (state) => {
      // Only in games that begin in the 2013 era — a story reality wrote in that
      // window (never narrated 15 years into a 1999 save). Pure colour: no state
      // change, no RNG, so it can never perturb the sim or calibration.
      if (state.meta.startYear < 2013) return;
      const atleti = state.clubs['atletico'];
      if (!atleti) return;
      // Don't narrate a fairytale for a club the Director has gutted — only if the
      // spine reality won it with is still there.
      const core = ['cur_godin_13', 'cur_diego_costa_13', 'cur_koke_13'].filter(
        (id) => state.players[id]?.club === 'atletico',
      );
      if (core.length < 2) return;
      logEvent(state, {
        category: 'event', code: 'macro.world',
        message:
          "Diego Simeone's Atlético Madrid — Courtois, Godín, Koke and Diego Costa — win La Liga on the final day at the Camp Nou, breaking the Barça–Real duopoly, and push Real to extra time in the Champions League final before falling in Lisbon. A working-man's masterpiece.",
        data: { id: 'atletico-2014', clubId: 'atletico' },
      });
      appendMemory(state, 'world', "Simeone's Atlético win La Liga and reach the 2014 Champions League final — the duopoly is broken.");
    },
  },
  // ── Global governance / world-shaking events (2020s) ──
  {
    id: 'covid-2020',
    date: '2020-03',
    world: (state) => {
      // Matchday revenue vanishes: every simulated club's budget is slashed and the
      // financially-weaker ones tip into strain.
      for (const club of Object.values(state.clubs)) {
        if (club.leagueId == null) continue;
        club.finances.transferBudget = Math.round(club.finances.transferBudget * 0.6);
        if (club.financialHealth === 'healthy' && club.prestige < 70) club.financialHealth = 'strained';
      }
      logEvent(state, {
        category: 'event', code: 'macro.world',
        message: 'A global pandemic suspends football — stadiums stand empty and revenues collapse across the game',
        data: { id: 'covid-2020' },
      });
      appendMemory(state, 'world', "The 2020 pandemic empties the stadiums and drains the game's finances.");
    },
    build: (_state, club) => ({
      id: 'macro:covid-2020',
      title: 'Football stops: the pandemic hits',
      description: 'A global pandemic has suspended the season. Stadiums will sit empty for a year, matchday revenue has vanished, and the players are anxious and idle. How do you steer the club through the shutdown?',
      interrupt: true, clubId: club.id, category: 'event',
      choices: [
        {
          id: 'wage-deferral', label: 'Agree wage deferrals with the squad', successProbability: 0.6,
          onSuccess: [{ kind: 'money', clubId: club.id, amount: 20_000_000 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'world', text: 'Negotiated wage deferrals through the shutdown — the finances held.' }],
          onFailure: [{ kind: 'morale', clubId: club.id, amount: -5 }, { kind: 'boardPatience', amount: -2 }],
        },
        {
          id: 'full-pay', label: 'Guarantee full pay and eat the loss', successProbability: 0.7,
          onSuccess: [{ kind: 'morale', clubId: club.id, amount: 8 }, { kind: 'fanTrust', amount: 6, text: 'Stood by the staff and players through Covid.' }],
          onFailure: [{ kind: 'boardPatience', amount: -5, text: 'The board balks at the losses.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: club.id, amount: -4 }, { kind: 'memory', tag: 'world', text: 'Drifted through the shutdown without a plan.' }],
      memoryTags: ['world'],
    }),
  },
  {
    id: 'super-league-2021',
    date: '2021-04',
    world: (state) => {
      logEvent(state, {
        category: 'event', code: 'macro.world',
        message: "Twelve of Europe's giants launch a breakaway Super League — and within days fan revolt and political fury collapse it",
        data: { id: 'super-league-2021' },
      });
      appendMemory(state, 'world', 'The European Super League launches and implodes within 72 hours under fan revolt.');
    },
    build: (_state, club) => {
      if (club.prestige < 80) return null; // only the invited giants face the choice
      return {
        id: 'macro:super-league-2021',
        title: 'The Super League: a founding invitation',
        description: 'A closed, breakaway European Super League — guaranteed places, no relegation, a fortune in founding money — has invited your club to join twelve self-appointed giants. The football world is aghast and your own supporters are already marching on the stadium. Sign up, or refuse and stand with the pyramid?',
        interrupt: true, clubId: club.id, category: 'event',
        choices: [
          {
            id: 'join', label: 'Sign up — take the guaranteed billions', successProbability: 0.5,
            onSuccess: [{ kind: 'money', clubId: club.id, amount: 150_000_000 }, { kind: 'boardPatience', amount: 8 }, { kind: 'fanTrust', amount: -12, text: 'Joining the Super League enraged the supporters.' }, { kind: 'memory', tag: 'world', text: 'Joined the Super League for the money — the fans never forgot.' }],
            onFailure: [{ kind: 'fanTrust', amount: -14, text: 'The Super League gamble blew up in your face.' }, { kind: 'boardPatience', amount: -4 }],
          },
          {
            id: 'refuse', label: 'Refuse — stand with the fans and the pyramid', successProbability: 0.75,
            onSuccess: [{ kind: 'fanTrust', amount: 14, text: 'Rejected the Super League — the supporters adore you for it.' }, { kind: 'memory', tag: 'world', text: 'Turned down the breakaway and stood with the fans.' }],
            onFailure: [{ kind: 'boardPatience', amount: -6, text: 'The board wanted the guaranteed riches.' }],
          },
        ],
        falloutIfIgnored: [{ kind: 'fanTrust', amount: -6, text: 'Silence on the Super League satisfied no one.' }],
        memoryTags: ['world'],
      };
    },
  },
  {
    id: 'city-charges-2023',
    date: '2023-02',
    world: (state) => {
      // World colour only when the user is NOT the club in the dock.
      if (state.playerClub !== 'man_city' && state.clubs['man_city']) {
        logEvent(state, {
          category: 'event', code: 'macro.world',
          message: 'The Premier League charges Manchester City with 100+ alleged breaches of financial rules across a decade — a points deduction, even expulsion, is on the table',
          data: { id: 'city-charges-2023', clubId: 'man_city' },
        });
        appendMemory(state, 'world', 'Manchester City are charged with over a hundred financial breaches.');
      }
    },
    build: (_state, club) => {
      if (club.id !== 'man_city') return null; // the charges are City's to answer
      return {
        id: 'macro:city-charges-2023',
        title: 'Over a hundred financial charges',
        description: `The league has charged ${club.name} with more than a hundred alleged breaches of financial rules across a decade of spending. A points deduction — even expulsion — is on the table. Fight every charge through years of litigation, or negotiate a settlement now?`,
        interrupt: true, clubId: club.id, category: 'event',
        choices: [
          {
            id: 'fight', label: 'Fight every charge', successProbability: 0.5,
            onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'world', text: 'Fought the charges through the courts and, for now, held them off.' }],
            onFailure: [{ kind: 'deductPoints', clubId: club.id, amount: 10 }, { kind: 'fanTrust', amount: -6, text: 'The charges stuck — a heavy points deduction.' }],
          },
          {
            id: 'settle', label: 'Negotiate a settlement', successProbability: 0.7,
            onSuccess: [{ kind: 'money', clubId: club.id, amount: -50_000_000 }, { kind: 'deductPoints', clubId: club.id, amount: 4 }, { kind: 'memory', tag: 'world', text: 'Settled the charges — a fine and a modest points hit.' }],
            onFailure: [{ kind: 'deductPoints', clubId: club.id, amount: 8 }],
          },
        ],
        falloutIfIgnored: [{ kind: 'deductPoints', clubId: club.id, amount: 6 }, { kind: 'memory', tag: 'world', text: 'Ignoring the charges cost points on the pitch.' }],
        memoryTags: ['world'],
      };
    },
  },
  // ── Market windows: cash-rich destinations open up as selling opportunities ──
  {
    id: 'china-2016',
    date: '2016-01',
    windowMonths: 6,
    world: (state) => {
      logEvent(state, {
        category: 'event', code: 'macro.world',
        message: 'The Chinese Super League is spending extraordinary sums, luring established names east with wages Europe cannot match',
        data: { id: 'china-2016' },
      });
      appendMemory(state, 'world', 'The Chinese Super League spending boom opens a lucrative exit for established players.');
    },
    build: (state, club) => marketSaleDecision(state, club, {
      market: 'china', marketName: 'A Chinese Super League club', minAge: 27, minAbility: 74, maxAbility: 87, feeMult: 1.9,
      pitch: 'A cash-flooded Chinese Super League club has come calling.',
    }),
  },
  {
    id: 'mls-2020',
    date: '2020-07',
    windowMonths: 4,
    world: (state) => {
      logEvent(state, {
        category: 'event', code: 'macro.world',
        message: 'MLS has become a real destination for stars seeking a fresh challenge — and a designated-player payday — in their thirties',
        data: { id: 'mls-2020' },
      });
      appendMemory(state, 'world', 'MLS is now a genuine landing spot for experienced stars — a graceful, well-paid exit.');
    },
    build: (state, club) => marketSaleDecision(state, club, {
      market: 'mls', marketName: 'An MLS franchise', minAge: 31, minAbility: 76, feeMult: 1.4,
      pitch: 'An ambitious MLS franchise wants a marquee designated player.',
    }),
  },
  {
    id: 'saudi-2023',
    date: '2023-07',
    windowMonths: 4,
    world: (state) => {
      logEvent(state, {
        category: 'event', code: 'macro.world',
        message: "Saudi Arabia's PIF-backed clubs launch a stunning raid on the game's biggest names, dangling sums that rewrite the market",
        data: { id: 'saudi-2023' },
      });
      appendMemory(state, 'world', "The PIF-funded Saudi Pro League detonates the market, chasing the game's marquee names.");
    },
    build: (state, club) => marketSaleDecision(state, club, {
      market: 'saudi', marketName: 'A PIF-backed Saudi Pro League club', minAge: 29, minAbility: 80, feeMult: 1.7,
      pitch: 'A PIF-bankrolled Saudi Pro League club has arrived with a blank cheque.',
    }),
  },
];

/**
 * Fire date-anchored macro market windows (China 2016, MLS 2020, Saudi 2023).
 * Deterministic and dated — each fires once when its window is reached, tracked in
 * meta.firedScripted. Every anchor is in 2016+, beyond the calibration horizon
 * (man-utd-1999 runs to 2014), so this is calibration-safe: the harness never
 * reaches these dates. Consumes no RNG.
 */
export function fireMacroEvents(state: GameState): void {
  const curYM = ymIndex(state.clock.date);
  for (const ev of MACRO_EVENTS) {
    const key = `macro:${ev.id}`;
    if (state.meta.firedScripted.includes(key)) continue;
    const evYM = ymIndex(ev.date);
    if (curYM < evYM) continue;
    // Past the window with no fire — mark it done so it never fires late.
    if (curYM > evYM + (ev.windowMonths ?? 3)) { state.meta.firedScripted.push(key); continue; }
    state.meta.firedScripted.push(key);
    ev.world?.(state);
    const club = state.clubs[state.playerClub];
    if (ev.build && club) {
      const decision = ev.build(state, club);
      if (decision) {
        state.pendingDecisions.push(decision);
        logEvent(state, {
          category: 'event', code: 'macro.fired',
          message: `Macro event reaches ${club.name}: ${ev.id}`,
          data: { id: ev.id, clubId: club.id },
        });
      }
    }
  }
}

// ── Monthly entry point ──────────────────────────────────────────────────────

/** Fire scripted + procedural events for the current month. */
export function rollEventsMonth(state: GameState, rng: Rng): void {
  fireScriptedEvents(state);
  fireMacroEvents(state);
  rollScandals(state, rng.fork(`events:${state.clock.date}`));
  // Non-real storylines emerge as the world diverges from real history (§9f).
  rollDivergentStoryline(state, rng.fork(`divergence:${state.clock.date}`));
}
