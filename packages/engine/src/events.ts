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
  Consequence,
  Decision,
  GameState,
  LoggedEvent,
  PlayerState,
} from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { cloneState } from './state.js';
import { eventsSince } from './eventLog.js';
import { appendMemory } from './memory.js';
import { divergenceFactor, rollDivergentStoryline } from './divergence.js';
import { executeTransfer } from './transfers.js';
import { recomputeClubStrength } from './players.js';
import { performSack, appointManager } from './manager.js';

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
    case 'managerStanding':
      state.managerRelations.standing = clamp(
        state.managerRelations.standing + (c.amount ?? 0),
        0,
        100,
      );
      break;
    case 'sackManager':
      performSack(state, c.amount ?? 0, c.text ?? 'the board');
      break;
    case 'appointManager':
      if (c.text) appointManager(state, c.text, c.amount ?? 70, c.tag === 'marquee');
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
        const res = executeTransfer(state, { playerId: c.playerId, toClub: c.clubId, fee: c.amount ?? 0 });
        if (res.ok) markLedgerRealized(state, c.tag);
      }
      break;
    }
    case 'signReal': {
      // A real incoming signing to the user's club: fund it (the board backs the
      // real deal) then complete the move.
      if (c.playerId) {
        const user = state.clubs[state.playerClub];
        if (user) user.finances.transferBudget = Math.max(user.finances.transferBudget, c.amount ?? 0);
        const res = executeTransfer(state, { playerId: c.playerId, toClub: state.playerClub, fee: c.amount ?? 0 });
        if (res.ok) markLedgerRealized(state, c.tag);
      }
      break;
    }
    case 'injuryHeal': {
      // Rush him back: injury cleared now, but rusty (low fitness → elevated
      // recurrence risk via the injury model's fitness factor).
      const p = c.playerId ? state.players[c.playerId] : undefined;
      if (p) {
        p.injury = null;
        p.fitness = clamp(c.amount ?? 55, 30, 100);
        if (p.club) recomputeClubStrength(state, p.club);
      }
      break;
    }
    case 'injuryProneness': {
      // Careful rehab / load management shifts long-run fragility.
      const p = c.playerId ? state.players[c.playerId] : undefined;
      if (p) p.injuryProneness = clamp(p.injuryProneness + (c.amount ?? 0), 5, 95);
      break;
    }
    case 'restPlayer': {
      // Load management: he sits out `months` (unavailable → team weaker now) and
      // his long-run fragility eases (`amount`, usually negative) — the trade.
      const p = c.playerId ? state.players[c.playerId] : undefined;
      if (p) {
        p.restMonths = Math.max(p.restMonths ?? 0, c.months ?? 2);
        p.injuryProneness = clamp(p.injuryProneness + (c.amount ?? 0), 5, 95);
        if (p.club) recomputeClubStrength(state, p.club);
      }
      break;
    }
    case 'reinjure': {
      // A rushed return breaks down — the catastrophic recurrence (Ronaldo 2000).
      const p = c.playerId ? state.players[c.playerId] : undefined;
      if (p) {
        const months = c.months ?? 7;
        p.injury = { kind: 'serious', monthsRemaining: months, since: state.clock.date };
        p.injuryHistory += 1;
        p.injuryProneness = clamp(p.injuryProneness + 15, 5, 95);
        p.ability = clamp(p.ability - 2, 20, 99);
        if (p.club) recomputeClubStrength(state, p.club);
        logEvent(state, {
          category: 'injury',
          code: 'injury.recurrence',
          message: `${p.name} breaks down again — rushed back too soon, out ~${months} months`,
          data: { playerId: p.id, clubId: p.club, months },
        });
      }
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
          onSuccess: [{ kind: 'morale', playerId: 'cur_keane', amount: 10 }, { kind: 'money', clubId: 'man_utd', amount: -3_000_000 }],
          onFailure: [{ kind: 'morale', clubId: 'man_utd', amount: -3 }],
        },
        {
          id: 'hold',
          label: 'Hold firm on the structure',
          successProbability: 0.4,
          onSuccess: [{ kind: 'boardPatience', amount: 5 }],
          onFailure: [{ kind: 'morale', playerId: 'cur_keane', amount: -14 }, { kind: 'managerRelationship', amount: -6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_keane', amount: -10 }],
      memoryTags: ['contract', 'cur_keane'],
    }),
  },
  {
    id: 'stam-exit',
    date: '2001-08',
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

function fireScriptedEvents(state: GameState): void {
  for (const ev of MAN_UTD_1999_PACK) {
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

// ── Monthly entry point ──────────────────────────────────────────────────────

/** Fire scripted + procedural events for the current month. */
export function rollEventsMonth(state: GameState, rng: Rng): void {
  fireScriptedEvents(state);
  rollScandals(state, rng.fork(`events:${state.clock.date}`));
  // Non-real storylines emerge as the world diverges from real history (§9f).
  rollDivergentStoryline(state, rng.fork(`divergence:${state.clock.date}`));
}
