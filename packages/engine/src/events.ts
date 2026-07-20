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
import { executeTransfer } from './transfers.js';
import { clubSquadPlayers, recomputeClubStrength } from './players.js';
import { valuePlayer, suggestWage } from './finance.js';

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
      // A real incoming signing to the user's club: fund it (the board backs the
      // real deal) then complete the move.
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
  for (const d of state.pendingDecisions) {
    if (d.id.startsWith('real-in:') || d.id.startsWith('real-out:')) {
      applyConsequences(state, d.falloutIfIgnored);
    } else {
      kept.push(d);
    }
  }
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
  // Divergence adds chaos: a world the user has reshaped throws up more
  // off-script drama (§9f). Passive users see the calm real baseline.
  const scandalFrequency = state.settings.scandalFrequency * (1 + 0.6 * divergenceFactor(state));
  for (const club of Object.values(state.clubs)) {
    if (club.leagueId === null) continue; // simulated clubs only
    for (const id of club.squad) {
      const player = state.players[id];
      if (!player || player.injury) continue;
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
        player.morale = clamp(player.morale - rng.int(3, 9), 0, 100);
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

const MAN_CITY_2008_PACK: ScriptedEvent[] = [
  {
    // The moment everything changed: the Abu Dhabi takeover on deadline day 2008,
    // and Robinho hijacked from under Chelsea's nose — the birth of modern City.
    id: 'city-takeover',
    date: '2008-08',
    scenarios: ['man-city-2008'],
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:city-takeover',
      title: 'The Abu Dhabi group buy the club — a fortune arrives overnight',
      description: 'On deadline day the takeover completes and the richest owners in football hand you a war chest. Reality’s statement was to hijack Robinho from under Chelsea. Make the marquee statement now, or bank the power and strike in January?',
      interrupt: true,
      clubId: 'man_city',
      category: 'event',
      choices: [
        {
          id: 'statement', label: 'Make the statement signing now', successProbability: 0.9,
          onSuccess: [{ kind: 'money', clubId: 'man_city', amount: 40_000_000 }, { kind: 'morale', clubId: 'man_city', amount: 8 }, { kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'takeover', text: 'The takeover lands — City announce themselves to the world.' }],
          onFailure: [],
        },
        {
          id: 'patient', label: 'Bank the power, plan a bigger January', successProbability: 0.8,
          onSuccess: [{ kind: 'money', clubId: 'man_city', amount: 55_000_000 }, { kind: 'memory', tag: 'takeover', text: 'Held fire on deadline day — a colossal January is being planned.' }],
          onFailure: [{ kind: 'money', clubId: 'man_city', amount: 40_000_000 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'money', clubId: 'man_city', amount: 40_000_000 }, { kind: 'memory', tag: 'takeover', text: 'The Abu Dhabi era begins — the money is here.' }],
      memoryTags: ['takeover'],
    }),
  },
];

const BARCELONA_2003_PACK: ScriptedEvent[] = [
  {
    // La Masia's crown jewel knocks on the first-team door: promote the 17-year-old
    // Messi, or send him out to toughen up. History fast-tracked him.
    id: 'messi-debut',
    date: '2004-08',
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
];

const ARSENAL_1996_PACK: ScriptedEvent[] = [
  {
    id: 'anelka-real',
    date: '1999-07',
    scenarios: ['arsenal-1996'],
    requires: (s) => playerAt(s, 'cur_anelka_a96', 'arsenal') && s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:anelka-real', title: 'Real Madrid come for the young Anelka',
      description: 'The teenager Wenger picked over Ian Wright is the most wanted forward in Europe, and Real Madrid have come calling with a fortune. Reality banked a ~£22m profit and reinvested it in Overmars-money and a training ground. Cash in on the prodigy, or build the side around him?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'sell', label: 'Cash in — a record profit (£22m)', successProbability: 0.9, onSuccess: [{ kind: 'transferOut', playerId: 'cur_anelka_a96', clubId: 'real_madrid', amount: 22_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Sold Anelka to Real for a fortune — as Arsenal really did.' }], onFailure: [] },
        { id: 'keep', label: 'Keep him — build around the prodigy', successProbability: 0.5, onSuccess: [{ kind: 'morale', playerId: 'cur_anelka_a96', amount: 10 }, { kind: 'ability', playerId: 'cur_anelka_a96', amount: 2 }], onFailure: [{ kind: 'agitation', playerId: 'cur_anelka_a96', amount: 16 }] },
      ],
      falloutIfIgnored: [{ kind: 'transferOut', playerId: 'cur_anelka_a96', clubId: 'real_madrid', amount: 22_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Anelka joins Real Madrid — the profit reshaped the club, as it did.' }],
      memoryTags: ['transfer', 'cur_anelka_a96'],
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
