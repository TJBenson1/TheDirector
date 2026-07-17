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
import { setPlayerAbility } from './attributes.js';
import { logEvent } from './eventLog.js';
import { cloneState } from './state.js';
import { eventsSince } from './eventLog.js';
import { appendMemory } from './memory.js';
import { divergenceFactor, rollDivergentStoryline } from './divergence.js';
import { executeTransfer } from './transfers.js';
import { recomputeClubStrength, instantiateCuratedPlayer } from './players.js';
import { performSack, appointManager, imposeDirective, retireManager } from './manager.js';
import { ERA_REALITY, eraForScenario, nearMissKey } from './ledger.js';

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
      if (p) setPlayerAbility(p, clamp(p.ability + (c.amount ?? 0), 20, 99));
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
    case 'imposeDirective':
      if (c.playerId && (c.tag === 'minutes' || c.tag === 'load')) imposeDirective(state, c.playerId, c.tag);
      break;
    case 'retireManager':
      retireManager(state, c.text);
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
    case 'signNearMiss': {
      // Complete a seed-based near-miss: spawn the (previously virtual) subject at
      // the user's club. Forked rng so the spawn is deterministic and does NOT
      // perturb the main stream (calibration-safe). The user's active choice, so
      // divergence here is expected.
      const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
      const entry = pack?.nearMisses?.find((e) => e.seed && nearMissKey(e) === c.tag);
      if (entry?.seed && !state.players[entry.seed.id]) {
        const user = state.clubs[state.playerClub];
        if (user) {
          const fee = c.amount ?? entry.fee;
          user.finances.transferBudget = Math.max(user.finances.transferBudget, fee);
          const rng = new Rng(state.meta.rngState).fork(`nearmiss:${entry.seed.id}:${state.clock.date}`);
          const p = instantiateCuratedPlayer(state, entry.seed, state.playerClub, rng);
          user.finances.transferBudget -= fee;
          logEvent(state, {
            category: 'transfer',
            code: 'nearmiss.signed',
            message: `The one that got away: ${p.name} finally signs for ${user.name} — reality rewritten`,
            data: { playerId: p.id, fee, reason: entry.reason ?? null },
          });
        }
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
        setPlayerAbility(p, clamp(p.ability - 2, 20, 99));
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
  {
    // Yorke's off-field lifestyle (2001) blunted his form; Ferguson froze him out
    // and sold him to Blackburn in 2002. Context: he must still be at the club.
    id: 'yorke-lifestyle',
    date: '2001-08',
    requires: (s) => playerAt(s, 'cur_yorke', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:yorke-lifestyle',
      title: "Dwight Yorke's off-field lifestyle is a problem",
      description: 'The tabloids are full of your striker\'s nightlife and his sharpness has dipped. The manager wants him reined in — or moved on.',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'quiet-word',
          label: 'A quiet word — keep it in-house',
          successProbability: 0.55,
          onSuccess: [{ kind: 'morale', playerId: 'cur_yorke', amount: 5 }, { kind: 'memory', tag: 'discipline', text: 'Kept the Yorke situation in-house.' }],
          onFailure: [{ kind: 'morale', playerId: 'cur_yorke', amount: -4 }, { kind: 'memory', tag: 'discipline', text: 'The Yorke talk did not take.' }],
        },
        {
          id: 'freeze-out',
          label: 'Freeze him out and force a sale',
          successProbability: 0.6,
          onSuccess: [{ kind: 'managerRelationship', amount: 6 }, { kind: 'agitation', playerId: 'cur_yorke', amount: 20 }],
          onFailure: [{ kind: 'morale', clubId: 'man_utd', amount: -3 }, { kind: 'managerRelationship', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_yorke', amount: -6 }, { kind: 'memory', tag: 'discipline', text: 'The Yorke story is left to fester.' }],
      memoryTags: ['discipline', 'cur_yorke'],
    }),
  },
  {
    // The missed drugs test (Sep 2003) that brought an eight-month FA ban from Jan
    // 2004 — a real, unavoidable blow to United's best defender. The ban lands on
    // every path; the choice is how you carry the club through it.
    id: 'rio-drug-test',
    date: '2003-09',
    requires: (s) => playerAt(s, 'cur_ferdinand', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:rio-drug-test',
      title: 'Rio Ferdinand has missed a drugs test',
      description: 'Your best defender failed to attend a scheduled test. A lengthy FA ban now looks certain — the dressing room and the press are watching how you respond.',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'support',
          label: 'Back him publicly and take the ban on the chin',
          successProbability: 0.6,
          onSuccess: [{ kind: 'restPlayer', playerId: 'cur_ferdinand', months: 8, amount: 0 }, { kind: 'morale', playerId: 'cur_ferdinand', amount: 6 }, { kind: 'memory', tag: 'ban', text: 'Stood by Ferdinand through his ban.' }],
          onFailure: [{ kind: 'restPlayer', playerId: 'cur_ferdinand', months: 8, amount: 0 }, { kind: 'fanTrust', amount: -4, text: 'The Ferdinand affair drags on.' }],
        },
        {
          id: 'distance',
          label: 'Distance the club from him',
          successProbability: 0.6,
          onSuccess: [{ kind: 'restPlayer', playerId: 'cur_ferdinand', months: 8, amount: 0 }, { kind: 'boardPatience', amount: 3 }, { kind: 'agitation', playerId: 'cur_ferdinand', amount: 15 }],
          onFailure: [{ kind: 'restPlayer', playerId: 'cur_ferdinand', months: 8, amount: 0 }, { kind: 'morale', playerId: 'cur_ferdinand', amount: -10 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'restPlayer', playerId: 'cur_ferdinand', months: 8, amount: 0 }, { kind: 'morale', playerId: 'cur_ferdinand', amount: -6 }, { kind: 'memory', tag: 'ban', text: 'You stayed silent through the Ferdinand ban.' }],
      memoryTags: ['ban', 'cur_ferdinand'],
    }),
  },
  {
    // The Glazers' leveraged buyout (2005) loaded the club with debt amid open fan
    // revolt. A club-level ownership beat — no player precondition.
    id: 'glazer-takeover',
    date: '2005-05',
    requires: (s) => s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:glazer-takeover',
      title: 'The Glazers launch a leveraged takeover',
      description: 'An American family is buying the club with borrowed money, loading United with debt as the supporters revolt. How do you position yourself?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'stay-out',
          label: 'Stay above it — focus on the football',
          successProbability: 0.7,
          onSuccess: [{ kind: 'memory', tag: 'ownership', text: 'Kept out of the Glazer politics.' }, { kind: 'money', clubId: 'man_utd', amount: -5_000_000 }],
          onFailure: [{ kind: 'fanTrust', amount: -4, text: 'Silence on the takeover reads as complicity.' }],
        },
        {
          id: 'side-with-fans',
          label: 'Side with the supporters',
          successProbability: 0.5,
          onSuccess: [{ kind: 'fanTrust', amount: 8, text: 'You stood with the fans against the debt.' }],
          onFailure: [{ kind: 'boardPatience', amount: -8 }, { kind: 'memory', tag: 'ownership', text: 'The new owners note your opposition.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'ownership', text: 'The takeover completes; the debt arrives.' }, { kind: 'money', clubId: 'man_utd', amount: -5_000_000 }],
      memoryTags: ['ownership', 'glazers'],
    }),
  },
  {
    // Keane's MUTV interview (Nov 2005) savaging his team-mates ended his United
    // career — he left for Celtic that December. The exit itself is handled by the
    // veteran/ageing system; this is the dressing-room beat around it.
    id: 'keane-mutv',
    date: '2005-11',
    requires: (s) => playerAt(s, 'cur_keane', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:keane-mutv',
      title: 'Roy Keane savages the squad on MUTV',
      description: 'Your captain has recorded a blistering attack on his team-mates for the club channel. The manager wants it buried — and may want Keane gone.',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'part-ways',
          label: 'Agree it is time to part ways',
          successProbability: 0.6,
          onSuccess: [{ kind: 'managerRelationship', amount: 6 }, { kind: 'memory', tag: 'captain', text: 'Sanctioned Keane\'s exit — as reality did.' }],
          onFailure: [{ kind: 'fanTrust', amount: -5, text: 'Fans mourn the captain\'s abrupt exit.' }],
        },
        {
          id: 'keep-captain',
          label: 'Stand by your captain',
          successProbability: 0.45,
          onSuccess: [{ kind: 'morale', playerId: 'cur_keane', amount: 8 }, { kind: 'agitation', playerId: 'cur_keane', amount: -10 }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }, { kind: 'morale', clubId: 'man_utd', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_keane', amount: -8 }, { kind: 'managerRelationship', amount: -4 }, { kind: 'memory', tag: 'captain', text: 'The Keane situation is left to combust.' }],
      memoryTags: ['captain', 'cur_keane'],
    }),
  },
  {
    // Real Madrid's public courting of Ronaldo (2008). Reality: Ferguson kept him
    // one more year, then sanctioned the world-record sale in 2009 (the ledger move
    // cr7-real-2009). This is the saga you manage; the sale itself stays scripted.
    id: 'ronaldo-real-interest',
    date: '2008-06',
    requires: (s) => playerAt(s, 'cur_cristiano', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:ronaldo-real-interest',
      title: 'Real Madrid are turning Cristiano Ronaldo\'s head',
      description: 'After his best season yet, Real Madrid are courting your talisman in public. He has not asked to leave — but the noise is growing louder by the week.',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'one-more-year',
          label: 'Convince him to give you one more year',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_cristiano', amount: 6 }, { kind: 'memory', tag: 'transfer-saga', text: 'CR7 agrees to stay one more year — as reality.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_cristiano', amount: 12 }],
        },
        {
          id: 'promise-sale',
          label: 'Promise him the move next summer',
          successProbability: 0.7,
          onSuccess: [{ kind: 'morale', playerId: 'cur_cristiano', amount: 8 }, { kind: 'agitation', playerId: 'cur_cristiano', amount: -8 }, { kind: 'memory', tag: 'transfer-saga', text: 'Promised CR7 the Madrid move — the exit is only deferred.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_cristiano', amount: 10 }],
        },
        {
          id: 'cash-in',
          label: 'Cash in now while his value peaks',
          successProbability: 0.5,
          onSuccess: [{ kind: 'agitation', playerId: 'cur_cristiano', amount: 20 }, { kind: 'memory', tag: 'transfer-saga', text: 'Signalled you would sell CR7 early — divergence from history.' }],
          onFailure: [{ kind: 'morale', clubId: 'man_utd', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_cristiano', amount: 8 }, { kind: 'memory', tag: 'transfer-saga', text: 'CR7 is left to stew on Madrid\'s interest.' }],
      memoryTags: ['transfer-saga', 'cur_cristiano'],
    }),
  },
];

// ── Manchester United, 2013 (post-Ferguson) storyline pack ───────────────────
const MAN_UTD_2013_PACK: ScriptedEvent[] = [
  {
    // Chelsea (and Mourinho) chased Rooney all summer 2013; he handed in a
    // transfer request under Moyes, then stayed and signed a new deal in 2014.
    // The user's ask: "Rooney wanting to leave" — the 2013 leg of the saga.
    id: 'rooney-wants-out-2013',
    date: '2013-08',
    requires: (s) => playerAt(s, 'cur_rooney', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:rooney-wants-out-2013',
      title: 'Wayne Rooney hands in a transfer request',
      description: 'Unsettled under the new manager and courted openly by Chelsea, your talisman wants out. Rebuild around him, cash in, or let it fester?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'commit',
          label: 'Rebuild around him and offer a new deal',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_rooney', amount: 10 }, { kind: 'agitation', playerId: 'cur_rooney', amount: -25 }, { kind: 'memory', tag: 'transfer-saga', text: 'Rooney recommits — as reality: he stayed and signed a new deal.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_rooney', amount: 10 }, { kind: 'money', clubId: 'man_utd', amount: -8_000_000 }],
        },
        {
          id: 'sell',
          label: 'Cash in and sell to Chelsea',
          successProbability: 0.85,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_rooney', clubId: 'chelsea', amount: 30_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Rooney to a title rival — a divergence from history.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_rooney', amount: 20 }],
        },
        {
          id: 'hold-firm',
          label: 'Refuse to sell and make him stay',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'agitation', playerId: 'cur_rooney', amount: -5 }],
          onFailure: [{ kind: 'morale', playerId: 'cur_rooney', amount: -10 }, { kind: 'agitation', playerId: 'cur_rooney', amount: 8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_rooney', amount: 15 }, { kind: 'morale', clubId: 'man_utd', amount: -3 }, { kind: 'memory', tag: 'transfer-saga', text: 'The Rooney saga is left to drag on.' }],
      memoryTags: ['transfer-saga', 'cur_rooney'],
    }),
  },
  {
    // Kagawa — a Dortmund gem played out of position and frozen out under Moyes,
    // a talent wasted. Context: he must still be at the club.
    id: 'kagawa-misused',
    date: '2013-12',
    requires: (s) => playerAt(s, 'cur_kagawa', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:kagawa-misused',
      title: 'Shinji Kagawa is being played out of position',
      description: 'Your Japanese playmaker — a jewel at Dortmund — is stuck on the wing or on the bench, and his form has drained away. Reintegrate him centrally, or accept the manager\'s call?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'central',
          label: 'Insist he plays in the middle',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: 'cur_kagawa', amount: 10 }, { kind: 'managerRelationship', amount: -4 }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }],
        },
        {
          id: 'defer',
          label: "Back the manager's selection",
          successProbability: 0.6,
          onSuccess: [{ kind: 'managerRelationship', amount: 5 }, { kind: 'memory', tag: 'development', text: 'Kagawa left to fade on the wing — as reality.' }],
          onFailure: [{ kind: 'morale', playerId: 'cur_kagawa', amount: -8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_kagawa', amount: -8 }, { kind: 'agitation', playerId: 'cur_kagawa', amount: 12 }],
      memoryTags: ['development', 'cur_kagawa'],
    }),
  },
  {
    // Van Persie — the 2013 title's top scorer, but his body was breaking down;
    // his United decline set in fast. Manage his fitness or run him into the ground.
    id: 'vanpersie-body',
    date: '2014-10',
    requires: (s) => playerAt(s, 'cur_vanpersie', 'man_utd') && s.playerClub === 'man_utd',
    build: () => ({
      id: 'scripted:vanpersie-body',
      title: "Robin van Persie's body is breaking down",
      description: 'Your title-winning striker is 31 and increasingly fragile. Wrap him in cotton wool to keep him for the big games, or lean on him now while he can still deliver?',
      interrupt: true,
      clubId: 'man_utd',
      category: 'event',
      choices: [
        {
          id: 'manage-load',
          label: 'Manage his minutes carefully',
          successProbability: 0.65,
          onSuccess: [{ kind: 'restPlayer', playerId: 'cur_vanpersie', months: 2, amount: -8 }, { kind: 'memory', tag: 'load', text: 'Managed RvP\'s load to protect the run-in.' }],
          onFailure: [{ kind: 'morale', playerId: 'cur_vanpersie', amount: -4 }],
        },
        {
          id: 'lean-on-him',
          label: 'Play him every game while you can',
          successProbability: 0.45,
          onSuccess: [{ kind: 'morale', playerId: 'cur_vanpersie', amount: 6 }],
          onFailure: [{ kind: 'injuryProneness', playerId: 'cur_vanpersie', amount: 12 }, { kind: 'memory', tag: 'load', text: 'Ran RvP into the ground — his decline accelerates.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'injuryProneness', playerId: 'cur_vanpersie', amount: 8 }],
      memoryTags: ['load', 'cur_vanpersie'],
    }),
  },
];

// ── Real Madrid, 2000 (Galácticos) storyline pack ────────────────────────────
const REAL_MADRID_2000_PACK: ScriptedEvent[] = [
  {
    // Florentino Pérez won the 2000 presidency on a promise to sign Figo from
    // Barcelona — the founding act of the galáctico project. A board mandate beat.
    id: 'galactico-mandate',
    date: '2000-08',
    requires: (s) => s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:galactico-mandate',
      title: 'The president demands a Galáctico every summer',
      description: 'Florentino Pérez was elected on the Figo promise and now expects a marquee signing every year — box office over balance. Embrace the doctrine, or argue for a real team?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'embrace',
          label: 'Embrace the Galáctico doctrine',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 8 }, { kind: 'memory', tag: 'board', text: 'Signed up to the Galáctico project — as reality.' }],
          onFailure: [{ kind: 'memory', tag: 'board', text: 'The president expects more glamour.' }],
        },
        {
          id: 'argue-balance',
          label: 'Argue for balance over box office',
          successProbability: 0.4,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'board', text: 'Won room to build a balanced side — a divergence from the galáctico path.' }],
          onFailure: [{ kind: 'boardPatience', amount: -10 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'board', text: 'The president sets the transfer policy without you.' }],
      memoryTags: ['board', 'president'],
    }),
  },
  {
    // Figo's poisonous returns to the Camp Nou (the pig's head, 2002) after the
    // most controversial transfer of the era. Fires once he is at Madrid.
    id: 'figo-clasico-hostility',
    date: '2002-11',
    requires: (s) => playerAt(s, 'cur_figo', 'real_madrid') && s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:figo-clasico-hostility',
      title: 'Figo faces the Camp Nou\'s fury',
      description: 'The Clásico returns to Barcelona, where Figo — the man who crossed the divide — will be met with open hatred. Shield him from it, or send him out to face the storm?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'shield',
          label: 'Rest him — spare him the cauldron',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_figo', amount: 6 }],
          onFailure: [{ kind: 'memory', tag: 'clasico', text: 'Fans wanted him to front up.' }],
        },
        {
          id: 'send-out',
          label: 'Send him out to silence them',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: 'cur_figo', amount: 10 }, { kind: 'fanTrust', amount: 5, text: 'Figo faced the storm and stood tall.' }],
          onFailure: [{ kind: 'morale', playerId: 'cur_figo', amount: -8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_figo', amount: -4 }],
      memoryTags: ['clasico', 'cur_figo'],
    }),
  },
  {
    // Makélélé wanted parity with the galácticos; the board refused and sold the
    // balance of the side to Chelsea in 2003 — the "Makélélé role" lesson. Fires
    // while he is still at Madrid (the sim moves him to Chelsea in 2004).
    id: 'makelele-dispute',
    date: '2003-08',
    requires: (s) => playerAt(s, 'cur_makelele', 'real_madrid') && s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:makelele-dispute',
      title: 'Makélélé wants to be paid like a Galáctico',
      description: 'The midfield engine that makes the whole thing balance wants his wages to reflect it. The president would rather sell him and sign another star. What do you do?',
      interrupt: true,
      clubId: 'real_madrid',
      category: 'event',
      choices: [
        {
          id: 'pay-him',
          label: 'Break the pay structure to keep the engine',
          successProbability: 0.55,
          onSuccess: [{ kind: 'morale', playerId: 'cur_makelele', amount: 10 }, { kind: 'agitation', playerId: 'cur_makelele', amount: -20 }, { kind: 'memory', tag: 'board', text: 'Kept Makélélé — the divergence Madrid never made.' }],
          onFailure: [{ kind: 'boardPatience', amount: -8 }],
        },
        {
          id: 'let-go',
          label: 'Side with the president — cash in',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'agitation', playerId: 'cur_makelele', amount: 15 }, { kind: 'memory', tag: 'board', text: 'Sanctioned the Makélélé sale — as reality; the balance goes with him.' }],
          onFailure: [{ kind: 'fanTrust', amount: -5, text: 'Selling the engine looks a grave mistake.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_makelele', amount: 12 }, { kind: 'memory', tag: 'board', text: 'The Makélélé dispute is left unresolved.' }],
      memoryTags: ['board', 'cur_makelele'],
    }),
  },
];

// ── Arsenal, 2004 (The Invincibles) storyline pack ───────────────────────────
const ARSENAL_2004_PACK: ScriptedEvent[] = [
  {
    // "Cashley": Ashley Cole's secret hotel meeting with Chelsea (Jan 2005) — a
    // tapping-up scandal that drew fines all round and soured him on the club he
    // left in 2006. Fires while he is still yours.
    id: 'cole-tapping-up',
    date: '2005-01',
    requires: (s) => playerAt(s, 'cur_acole', 'arsenal') && s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:cole-tapping-up',
      title: 'Ashley Cole has been tapped up by Chelsea',
      description: 'Your left-back was caught at a secret hotel meeting with a rival. The Premier League is investigating, fines are coming, and his head has been turned.',
      interrupt: true,
      clubId: 'arsenal',
      category: 'scandal',
      choices: [
        {
          id: 'discipline',
          label: 'Fine him and read him the riot act',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'agitation', playerId: 'cur_acole', amount: 12 }, { kind: 'memory', tag: 'scandal', text: 'Came down hard on Cole — the rift with reality-echo widens.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_acole', amount: 20 }, { kind: 'fanTrust', amount: -4, text: 'The Cole saga drags on messily.' }],
        },
        {
          id: 'smooth-over',
          label: 'Smooth it over and offer him improved terms',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: 'cur_acole', amount: 8 }, { kind: 'agitation', playerId: 'cur_acole', amount: -20 }, { kind: 'money', clubId: 'arsenal', amount: -4_000_000 }, { kind: 'memory', tag: 'scandal', text: 'Kept Cole onside — a divergence from his real Chelsea exit.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_acole', amount: 10 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_acole', amount: 18 }, { kind: 'fanTrust', amount: -4, text: 'You let the Cole affair fester.' }],
      memoryTags: ['scandal', 'cur_acole'],
    }),
  },
  {
    // Vieira — the totemic captain — pushed for Juventus in 2005, the symbolic end
    // of the Invincibles. Fires before his real summer exit.
    id: 'vieira-captain-exit',
    date: '2005-05',
    requires: (s) => playerAt(s, 'cur_vieira2', 'arsenal') && s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:vieira-captain-exit',
      title: 'Patrick Vieira wants to leave for Juventus',
      description: 'Your captain and midfield heartbeat feels his time is up and Juventus are calling. Cash in and start the rebuild, or fight to keep the soul of the side?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'sell',
          label: 'Let the captain go and rebuild',
          successProbability: 0.7,
          onSuccess: [{ kind: 'money', clubId: 'arsenal', amount: 14_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Vieira — as reality; the Invincibles era ends.' }],
          onFailure: [{ kind: 'fanTrust', amount: -5, text: 'Fans mourn the captain\'s departure.' }],
        },
        {
          id: 'keep',
          label: 'Fight to keep him one more year',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: 'cur_vieira2', amount: 8 }, { kind: 'memory', tag: 'transfer-saga', text: 'Kept Vieira — a divergence from history.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_vieira2', amount: 15 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_vieira2', amount: 12 }, { kind: 'memory', tag: 'transfer-saga', text: 'The Vieira question is left hanging.' }],
      memoryTags: ['transfer-saga', 'cur_vieira2'],
    }),
  },
  {
    // Barcelona's long courtship of Henry (2006-07). Reality: he stayed a year,
    // then joined Barça in 2007. Fires while he is still your talisman.
    id: 'henry-barca',
    date: '2006-08',
    requires: (s) => playerAt(s, 'cur_henry', 'arsenal') && s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:henry-barca',
      title: 'Barcelona are courting Thierry Henry',
      description: 'Your greatest-ever player is being courted by Barcelona, and the new stadium\'s debt makes the money tempting. Build the new Arsenal around him, or take the fee?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'keep-talisman',
          label: 'Keep him — build the new era around him',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_henry', amount: 8 }, { kind: 'fanTrust', amount: 6, text: 'Keeping Henry lifts a nervous fanbase.' }, { kind: 'memory', tag: 'transfer-saga', text: 'Kept Henry at the Emirates.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_henry', amount: 10 }],
        },
        {
          id: 'take-the-fee',
          label: 'Take the fee for the stadium debt',
          successProbability: 0.8,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_henry', clubId: 'barcelona', amount: 24_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Henry to Barcelona — reality, a year early.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_henry', amount: 8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_henry', amount: 10 }, { kind: 'memory', tag: 'transfer-saga', text: 'Barcelona\'s interest in Henry is left unanswered.' }],
      memoryTags: ['transfer-saga', 'cur_henry'],
    }),
  },
];

// ── Liverpool, 2001 (Houllier's treble side) storyline pack ──────────────────
const LIVERPOOL_2001_PACK: ScriptedEvent[] = [
  {
    // Houllier's aortic dissection during the Leeds match (Oct 2001) — emergency
    // surgery, five months away from the touchline. A manager-health beat.
    id: 'houllier-health',
    date: '2001-10',
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:houllier-health',
      title: 'Gérard Houllier is rushed to hospital',
      description: 'Your manager was taken ill at half-time with a life-threatening heart problem and faces major surgery and months away. How do you steady the club?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'rally',
          label: 'Rally the squad and hold the fort until he returns',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 5 }, { kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Held Liverpool together through Houllier\'s illness.' }],
          onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -4 }],
        },
        {
          id: 'caretaker',
          label: 'Hand full control to a trusted caretaker',
          successProbability: 0.55,
          onSuccess: [{ kind: 'managerStanding', amount: 6 }, { kind: 'memory', tag: 'manager', text: 'A steady caretaker kept the season on track.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -4 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'liverpool', amount: -4 }, { kind: 'memory', tag: 'manager', text: 'The club drifted while Houllier recovered.' }],
      memoryTags: ['manager', 'houllier'],
    }),
  },
  {
    // Gerrard's Chelsea saga (2005) — after Istanbul he handed in a request, then
    // performed a dramatic u-turn and stayed. requires him still at the club.
    id: 'gerrard-chelsea',
    date: '2005-06',
    requires: (s) => playerAt(s, 'cur_gerrard01', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:gerrard-chelsea',
      title: 'Chelsea are turning Steven Gerrard\'s head',
      description: 'Your captain and local hero has a huge offer from Chelsea on the table. He is wavering. Convince him he is Liverpool to the core, cash in, or let it drift?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'talisman',
          label: 'Make him captain for life — he stays',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_gerrard01', amount: 10 }, { kind: 'agitation', playerId: 'cur_gerrard01', amount: -20 }, { kind: 'fanTrust', amount: 6, text: 'Keeping Gerrard electrifies the Kop.' }, { kind: 'memory', tag: 'transfer-saga', text: 'Gerrard stays — the u-turn, as reality.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_gerrard01', amount: 10 }],
        },
        {
          id: 'sell',
          label: 'Take Chelsea\'s money',
          successProbability: 0.85,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_gerrard01', clubId: 'chelsea', amount: 32_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Gerrard to Chelsea — a divergence Anfield never forgave.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_gerrard01', amount: 15 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_gerrard01', amount: 15 }, { kind: 'morale', clubId: 'liverpool', amount: -3 }],
      memoryTags: ['transfer-saga', 'cur_gerrard01'],
    }),
  },
  {
    // Real Madrid come for Michael Owen (2004) — reality: he left for the Bernabéu.
    id: 'owen-madrid',
    date: '2004-06',
    requires: (s) => playerAt(s, 'cur_owen01', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:owen-madrid',
      title: 'Real Madrid want Michael Owen',
      description: 'A Ballon d\'Or striker with a year left on his deal, and Real Madrid are calling. Cash in before he can leave for nothing, or build the attack around him?',
      interrupt: true,
      clubId: 'liverpool',
      category: 'event',
      choices: [
        {
          id: 'sell',
          label: 'Sell to Madrid while you still can',
          successProbability: 0.8,
          onSuccess: [{ kind: 'money', clubId: 'liverpool', amount: 8_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Owen to Madrid — as reality.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_owen01', amount: 10 }],
        },
        {
          id: 'keep',
          label: 'Keep your striker and build around him',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: 'cur_owen01', amount: 8 }, { kind: 'memory', tag: 'transfer-saga', text: 'Kept Owen — a divergence from his Bernabéu move.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_owen01', amount: 14 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_owen01', amount: 12 }],
      memoryTags: ['transfer-saga', 'cur_owen01'],
    }),
  },
];

// ── Bayern Munich, 2009 (Van Gaal reset) storyline pack ──────────────────────
const BAYERN_2009_PACK: ScriptedEvent[] = [
  {
    // Van Gaal's ruthless reset: blood Müller, Badstuber and a teenage Alaba over
    // the established names. Reality: the kids delivered a domestic double.
    id: 'vangaal-youth',
    date: '2009-09',
    requires: (s) => s.playerClub === 'bayern',
    build: () => ({
      id: 'scripted:vangaal-youth',
      title: 'Van Gaal wants to tear up the old guard',
      description: 'Your manager is convinced the future is the academy kids — Müller, Badstuber, a teenage Alaba — even at the cost of dropping proven internationals. Back the revolution, or protect the experienced core?',
      interrupt: true,
      clubId: 'bayern',
      category: 'event',
      choices: [
        {
          id: 'back-youth',
          label: 'Back the youth revolution',
          successProbability: 0.6,
          onSuccess: [{ kind: 'morale', playerId: 'cur_muller09', amount: 12 }, { kind: 'managerRelationship', amount: 6 }, { kind: 'memory', tag: 'development', text: 'Backed Van Gaal\'s kids — Müller breaks through, as reality.' }],
          onFailure: [{ kind: 'morale', clubId: 'bayern', amount: -3 }],
        },
        {
          id: 'protect-core',
          label: 'Protect the experienced core',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'development', text: 'Reined in the reset — the kids wait their turn.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: -4 }, { kind: 'memory', tag: 'development', text: 'Left Van Gaal to run the reset his own way.' }],
      memoryTags: ['development', 'vangaal'],
    }),
  },
  {
    // The Zahia affair (April 2010) — Ribéry named in an underage-prostitution
    // legal case that dominated the headlines. A scandal to navigate.
    id: 'ribery-scandal',
    date: '2010-04',
    requires: (s) => playerAt(s, 'cur_ribery09', 'bayern') && s.playerClub === 'bayern',
    build: () => ({
      id: 'scripted:ribery-scandal',
      title: 'Franck Ribéry is engulfed by a legal scandal',
      description: 'Your best player is named in a criminal investigation that has become a media circus on the eve of the biggest games of the season. Back him, or distance the club?',
      interrupt: true,
      clubId: 'bayern',
      category: 'scandal',
      choices: [
        {
          id: 'back',
          label: 'Back him and shield him from the noise',
          successProbability: 0.55,
          onSuccess: [{ kind: 'morale', playerId: 'cur_ribery09', amount: 8 }, { kind: 'memory', tag: 'scandal', text: 'Stood by Ribéry through the storm.' }],
          onFailure: [{ kind: 'fanTrust', amount: -5, text: 'Shielding Ribéry draws criticism.' }],
        },
        {
          id: 'distance',
          label: 'Distance the club from the affair',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'morale', playerId: 'cur_ribery09', amount: -6 }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_ribery09', amount: 12 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_ribery09', amount: -6 }, { kind: 'fanTrust', amount: -4, text: 'The Ribéry circus is left to swirl.' }],
      memoryTags: ['scandal', 'cur_ribery09'],
    }),
  },
  {
    // Robben — a match-winner when fit, but a famously fragile hamstring on the run
    // to the 2010 Champions League final. Manage his load or ride him.
    id: 'robben-fitness',
    date: '2010-03',
    requires: (s) => playerAt(s, 'cur_robben09', 'bayern') && s.playerClub === 'bayern',
    build: () => ({
      id: 'scripted:robben-fitness',
      title: 'Arjen Robben\'s hamstring is a constant worry',
      description: 'Your match-winner is carrying a hamstring into the business end of the season. Wrap him up for the knockout games, or lean on him now with the title in the balance?',
      interrupt: true,
      clubId: 'bayern',
      category: 'event',
      choices: [
        {
          id: 'manage',
          label: 'Manage his load for the run-in',
          successProbability: 0.6,
          onSuccess: [{ kind: 'restPlayer', playerId: 'cur_robben09', months: 1, amount: -6 }, { kind: 'memory', tag: 'load', text: 'Protected Robben for the knockouts.' }],
          onFailure: [{ kind: 'morale', playerId: 'cur_robben09', amount: -4 }],
        },
        {
          id: 'ride',
          label: 'Play him — you need him now',
          successProbability: 0.45,
          onSuccess: [{ kind: 'morale', playerId: 'cur_robben09', amount: 6 }],
          onFailure: [{ kind: 'reinjure', playerId: 'cur_robben09', months: 2 }, { kind: 'memory', tag: 'load', text: 'Rode Robben and his hamstring went.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'injuryProneness', playerId: 'cur_robben09', amount: 6 }],
      memoryTags: ['load', 'cur_robben09'],
    }),
  },
];

// ── Internazionale, 1998 (Ronaldo's Inter) storyline pack ────────────────────
const INTER_1998_PACK: ScriptedEvent[] = [
  {
    // Moratti's revolving door — Simoni was sacked only months after winning the
    // UEFA Cup, the start of a decade of managerial churn. A board-pressure beat.
    id: 'moratti-impatience',
    date: '1998-11',
    requires: (s) => s.playerClub === 'inter',
    build: () => ({
      id: 'scripted:moratti-impatience',
      title: 'The president is already losing patience',
      description: 'Months after winning the UEFA Cup, an inconsistent start has the president openly musing about a change — the impatience that would define his ownership. Steady his nerve, or accept a reckoning is coming?',
      interrupt: true,
      clubId: 'inter',
      category: 'event',
      choices: [
        {
          id: 'steady',
          label: 'Talk the president down and buy time',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 8 }, { kind: 'managerStanding', amount: 6 }, { kind: 'memory', tag: 'board', text: 'Bought the manager time against Moratti\'s instincts.' }],
          onFailure: [{ kind: 'boardPatience', amount: -6 }],
        },
        {
          id: 'accept',
          label: 'Accept the pressure and demand results now',
          successProbability: 0.55,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'managerStanding', amount: -8 }, { kind: 'memory', tag: 'board', text: 'Sided with the president — the manager is on notice.' }],
          onFailure: [{ kind: 'morale', clubId: 'inter', amount: -3 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'managerStanding', amount: -6 }, { kind: 'memory', tag: 'board', text: 'The manager twists in the wind.' }],
      memoryTags: ['board', 'moratti'],
    }),
  },
  {
    // Ronaldo's knee — the trouble that would explode into the catastrophic 2000
    // rupture and re-rupture. The comeback dilemma: caution, or rush the phenomenon
    // back? Reality rushed him, and it broke him.
    id: 'ronaldo-knee',
    date: '1999-01',
    requires: (s) => playerAt(s, 'cur_r9', 'inter') && s.playerClub === 'inter',
    build: () => ({
      id: 'scripted:ronaldo-knee',
      title: 'Ronaldo\'s knee is a growing concern',
      description: 'Il Fenomeno is carrying a knee problem, and the medical staff are split on how hard to push him. The whole club leans on his goals — but rushing him could be catastrophic.',
      interrupt: true,
      clubId: 'inter',
      category: 'injury',
      choices: [
        {
          id: 'caution',
          label: 'Protect him — manage the knee carefully',
          successProbability: 0.6,
          onSuccess: [{ kind: 'restPlayer', playerId: 'cur_r9', months: 2, amount: -12 }, { kind: 'memory', tag: 'injury', text: 'Protected Ronaldo\'s knee — the caution reality never showed.' }],
          onFailure: [{ kind: 'morale', playerId: 'cur_r9', amount: -4 }],
        },
        {
          id: 'rush',
          label: 'Rush him back — you need his goals',
          successProbability: 0.4,
          onSuccess: [{ kind: 'morale', playerId: 'cur_r9', amount: 6 }],
          onFailure: [{ kind: 'reinjure', playerId: 'cur_r9', months: 7 }, { kind: 'memory', tag: 'injury', text: 'Rushed Ronaldo back and the knee gave way — the nightmare, as reality.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'injuryProneness', playerId: 'cur_r9', amount: 10 }, { kind: 'memory', tag: 'injury', text: 'Left the Ronaldo knee question to the medics alone.' }],
      memoryTags: ['injury', 'cur_r9'],
    }),
  },
  {
    // Roberto Baggio — a divine talent frozen out and underused, forever fighting
    // for minutes at the clubs of his later career. Build around him, or not?
    id: 'baggio-role',
    date: '1998-12',
    requires: (s) => playerAt(s, 'cur_baggio_r', 'inter') && s.playerClub === 'inter',
    build: () => ({
      id: 'scripted:baggio-role',
      title: 'Roberto Baggio is stuck on the bench',
      description: 'Il Divin Codino — a World Cup icon — is being frozen out, and the tifosi want to see him play. Build the side around his genius, or leave the selection to the coach?',
      interrupt: true,
      clubId: 'inter',
      category: 'event',
      choices: [
        {
          id: 'build-around',
          label: 'Build the attack around Baggio',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: 'cur_baggio_r', amount: 10 }, { kind: 'fanTrust', amount: 5, text: 'The Curva roars for Baggio.' }, { kind: 'managerRelationship', amount: -4 }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }],
        },
        {
          id: 'coach-call',
          label: 'Leave the selection to the coach',
          successProbability: 0.6,
          onSuccess: [{ kind: 'managerRelationship', amount: 5 }, { kind: 'memory', tag: 'selection', text: 'Baggio stays on the margins — as reality.' }],
          onFailure: [{ kind: 'morale', playerId: 'cur_baggio_r', amount: -8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_baggio_r', amount: -6 }, { kind: 'agitation', playerId: 'cur_baggio_r', amount: 10 }],
      memoryTags: ['selection', 'cur_baggio_r'],
    }),
  },
];

// ── Chelsea, 2003 (the Roman revolution) storyline pack ──────────────────────
// The 2003 squad is procedural here (no curated roster), so these are club-level
// beats with no player precondition; Ranieri's real 2004 exit is the manager
// crossroads (see manager.ts::MANAGER_CROSSROADS).
const CHELSEA_2003_PACK: ScriptedEvent[] = [
  {
    id: 'abramovich-mandate',
    date: '2003-08',
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:abramovich-mandate',
      title: 'Roman Abramovich demands the title — now',
      description: 'The new owner\'s fortune is bottomless and his patience is not. He wants a blank-cheque assault on the very top, this season. Embrace the spend, or argue to build something that lasts?',
      interrupt: true,
      clubId: 'chelsea',
      category: 'event',
      choices: [
        {
          id: 'spend',
          label: 'Embrace the blank cheque — win now',
          successProbability: 0.7,
          onSuccess: [{ kind: 'boardPatience', amount: 8 }, { kind: 'money', clubId: 'chelsea', amount: 20_000_000 }, { kind: 'memory', tag: 'board', text: 'Signed up to Abramovich\'s win-now project.' }],
          onFailure: [{ kind: 'memory', tag: 'board', text: 'The owner wants more, faster.' }],
        },
        {
          id: 'build',
          label: 'Argue for a lasting project',
          successProbability: 0.4,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'board', text: 'Won a little room to build sustainably.' }],
          onFailure: [{ kind: 'boardPatience', amount: -8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'board', text: 'The owner sets the pace without you.' }],
      memoryTags: ['board', 'abramovich'],
    }),
  },
];

// ── Arsenal, 1996 (the Wenger revolution) storyline pack ─────────────────────
// The 1996 squad is procedural here (no curated roster), so these are club-level
// beats about the incoming manager's methods, with no player precondition.
const ARSENAL_1996_PACK: ScriptedEvent[] = [
  {
    id: 'wenger-revolution',
    date: '1996-10',
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:wenger-revolution',
      title: 'The new manager wants to change everything',
      description: '"Arsène who?" is overhauling the diet, the training and the drinking culture, and some senior pros are bristling at the Frenchman\'s methods. Back the revolution in full, or temper it to keep the dressing room?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'back-fully',
          label: 'Back his methods in full',
          successProbability: 0.6,
          onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'manager', text: 'Backed Wenger\'s revolution — the making of a dynasty.' }],
          onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -3 }],
        },
        {
          id: 'temper',
          label: 'Temper the changes to keep the senior pros',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 4 }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: -4 }, { kind: 'memory', tag: 'manager', text: 'Left Wenger to win the dressing room alone.' }],
      memoryTags: ['manager', 'wenger'],
    }),
  },
  {
    id: 'wenger-foreign-gamble',
    date: '1997-01',
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:wenger-foreign-gamble',
      title: 'Wenger wants to sign unknown Frenchmen',
      description: 'The manager\'s scouting network has flagged a clutch of unheralded young imports — the kind of gambles that could reshape the club, or flop badly on the English stage. Trust his eye, or insist on proven names?',
      interrupt: true,
      clubId: 'arsenal',
      category: 'event',
      choices: [
        {
          id: 'trust',
          label: 'Trust his eye for a bargain',
          successProbability: 0.6,
          onSuccess: [{ kind: 'managerRelationship', amount: 6 }, { kind: 'memory', tag: 'transfer', text: 'Trusted Wenger\'s scouting — the unknowns become legends.' }],
          onFailure: [{ kind: 'boardPatience', amount: -4 }],
        },
        {
          id: 'proven',
          label: 'Insist on proven Premier League names',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'transfer', text: 'Played it safe in the market.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -6 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Wenger backs his own judgement in the market.' }],
      memoryTags: ['transfer', 'wenger'],
    }),
  },
];

// ── Newcastle, 1995 (Keegan's Entertainers) storyline pack ───────────────────
const NEWCASTLE_1995_PACK: ScriptedEvent[] = [
  {
    // Keegan's creed: attack, attack, attack — the most thrilling side in England,
    // and the most open. Back the cavalier approach or add a defensive spine.
    id: 'entertainers-philosophy',
    date: '1995-08',
    requires: (s) => s.playerClub === 'newcastle',
    build: () => ({
      id: 'scripted:entertainers-philosophy',
      title: 'Keegan wants to attack, attack, attack',
      description: 'Your manager\'s creed is simple: outscore everyone and to hell with the defence. It is the most exciting football in the country — and the most dangerous. Back the cavalier approach, or insist on some balance?',
      interrupt: true,
      clubId: 'newcastle',
      category: 'event',
      choices: [
        {
          id: 'cavalier',
          label: 'Back the all-out-attack philosophy',
          successProbability: 0.55,
          onSuccess: [{ kind: 'morale', clubId: 'newcastle', amount: 6 }, { kind: 'fanTrust', amount: 6, text: 'The Toon roar for the Entertainers.' }, { kind: 'memory', tag: 'tactics', text: 'Backed Keegan\'s cavalry — thrilling, and perilous.' }],
          onFailure: [{ kind: 'memory', tag: 'tactics', text: 'The open football will cost points somewhere.' }],
        },
        {
          id: 'balance',
          label: 'Insist on a defensive spine',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'tactics', text: 'Added steel Keegan never would — a divergence from the real collapse.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'tactics', text: 'Keegan sends them out to attack, come what may.' }],
      memoryTags: ['tactics', 'keegan'],
    }),
  },
  {
    // The famous collapse: a 12-point lead surrendered to Ferguson's United, and
    // Keegan's "I would love it" meltdown. Hold your nerve, or let history repeat.
    id: 'keegan-title-race',
    date: '1996-03',
    requires: (s) => s.playerClub === 'newcastle',
    build: () => ({
      id: 'scripted:keegan-title-race',
      title: 'The 12-point lead is slipping away',
      description: 'You were streets clear at the top, but United are reeling you in and the manager is rattled — the mind games are getting to him. Steady the ship, or let the title race become a war of nerves?',
      interrupt: true,
      clubId: 'newcastle',
      category: 'event',
      choices: [
        {
          id: 'steady',
          label: 'Calm the manager and the dressing room',
          successProbability: 0.55,
          onSuccess: [{ kind: 'morale', clubId: 'newcastle', amount: 8 }, { kind: 'memory', tag: 'title-race', text: 'Held the nerve Keegan couldn\'t — the lead survives.' }],
          onFailure: [{ kind: 'morale', clubId: 'newcastle', amount: -6 }, { kind: 'memory', tag: 'title-race', text: 'The nerves told — the ghost of the real collapse.' }],
        },
        {
          id: 'fire',
          label: 'Let Keegan channel the fury ("I would love it")',
          successProbability: 0.4,
          onSuccess: [{ kind: 'morale', clubId: 'newcastle', amount: 6 }, { kind: 'fanTrust', amount: 5, text: 'The passion galvanises Tyneside.' }],
          onFailure: [{ kind: 'morale', clubId: 'newcastle', amount: -10 }, { kind: 'fanTrust', amount: -6, text: 'The meltdown becomes the story, as reality.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'newcastle', amount: -8 }, { kind: 'memory', tag: 'title-race', text: 'The lead evaporates — as it did in reality.' }],
      memoryTags: ['title-race', 'keegan'],
    }),
  },
  {
    // The record-breaking homecoming: Alan Shearer, the world's most expensive
    // player, joins his boyhood club in summer 1996. Break the bank, or not?
    id: 'shearer-homecoming',
    date: '1996-07',
    requires: (s) => s.playerClub === 'newcastle',
    build: () => ({
      id: 'scripted:shearer-homecoming',
      title: 'Alan Shearer can be brought home',
      description: 'The best striker in England — and a Geordie — is available for a world-record fee. Break the bank to bring him home to St James\' Park, or spend the money on a defence that could actually win the title?',
      interrupt: true,
      clubId: 'newcastle',
      category: 'event',
      choices: [
        {
          id: 'break-the-bank',
          label: 'Sign Shearer — the record homecoming',
          successProbability: 0.8,
          onSuccess: [{ kind: 'fanTrust', amount: 10, text: 'Shearer coming home sends Tyneside into raptures.' }, { kind: 'money', clubId: 'newcastle', amount: -8_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Brought Shearer home — as reality; the No.9 legend begins.' }],
          onFailure: [{ kind: 'money', clubId: 'newcastle', amount: -8_000_000 }],
        },
        {
          id: 'fix-defence',
          label: 'Spend it on a title-winning defence instead',
          successProbability: 0.5,
          onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Passed on Shearer to fix the defence — the road not taken.' }],
          onFailure: [{ kind: 'fanTrust', amount: -8, text: 'Snubbing the Shearer dream angers the Toon Army.' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'The Shearer question is left unanswered.' }],
      memoryTags: ['transfer', 'shearer'],
    }),
  },
];

// ── Tottenham, 2013 (the Bale money) storyline pack ──────────────────────────
const SPURS_2013_PACK: ScriptedEvent[] = [
  {
    id: 'bale-windfall',
    date: '2013-08',
    requires: (s) => s.playerClub === 'spurs',
    build: () => ({
      id: 'scripted:bale-windfall',
      title: 'A world-record windfall to reinvest',
      description: 'Gareth Bale has gone to Madrid for a record fee, and you have a war chest to replace the irreplaceable. Spread it across a whole new spine (as reality did — and mostly regretted), or gamble it all on one marquee talent?',
      interrupt: true, clubId: 'spurs', category: 'event',
      choices: [
        { id: 'spread', label: 'Sign a whole new team', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'transfer', text: 'Spread the Bale money across seven signings — as reality; a gamble on volume.' }], onFailure: [{ kind: 'memory', tag: 'transfer', text: 'Too many new faces, no cohesion — the real trap.' }] },
        { id: 'marquee', label: 'Gamble it all on one superstar', successProbability: 0.55, onSuccess: [{ kind: 'fanTrust', amount: 8, text: 'A single galáctico signing electrifies the Lane.' }, { kind: 'memory', tag: 'transfer', text: 'Bet the windfall on one star — the road not taken.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'The Bale money is spent piecemeal without a plan.' }],
      memoryTags: ['transfer', 'bale-money'],
    }),
  },
  {
    id: 'life-after-bale',
    date: '2013-12',
    requires: (s) => s.playerClub === 'spurs',
    build: () => ({
      id: 'scripted:life-after-bale',
      title: 'The new-look side is struggling to gel',
      description: 'The expensive rebuild is misfiring, the goals have dried up without Bale, and the pressure is mounting on everyone. Hold your nerve with the project, or shake it up now?',
      interrupt: true, clubId: 'spurs', category: 'event',
      choices: [
        { id: 'patience', label: 'Give the new signings time to settle', successProbability: 0.55, onSuccess: [{ kind: 'morale', clubId: 'spurs', amount: 6 }, { kind: 'memory', tag: 'board', text: 'Held faith with the rebuild.' }], onFailure: [{ kind: 'boardPatience', amount: -5 }] },
        { id: 'shake-up', label: 'Shake up the side and demand results', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 4 }], onFailure: [{ kind: 'morale', clubId: 'spurs', amount: -5 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'spurs', amount: -4 }],
      memoryTags: ['board', 'rebuild'],
    }),
  },
];

// ── AC Milan, 2007 (last dance before the fall) storyline pack ───────────────
const MILAN_2007_PACK: ScriptedEvent[] = [
  {
    id: 'milan-last-dance',
    date: '2006-08',
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:milan-last-dance',
      title: 'One last dance, or start the rebuild?',
      description: 'Your champions are the best team in Europe — and the oldest. Maldini, Cafu, Costacurta, an ageing spine that could win one more European Cup or fall off a cliff. Chase one more, or blood the next generation now?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'one-more', label: 'Go all-in for one more European Cup', successProbability: 0.6, onSuccess: [{ kind: 'morale', clubId: 'milan', amount: 6 }, { kind: 'memory', tag: 'board', text: 'Backed the old guard for one last charge — as reality (Athens 2007).' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
        { id: 'rebuild', label: 'Start the rebuild before the fall', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'board', text: 'Began the rebuild early — the divergence from the real slow decline.' }], onFailure: [{ kind: 'morale', clubId: 'milan', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'board', text: 'The ageing side rolls on without a plan.' }],
      memoryTags: ['board', 'rebuild'],
    }),
  },
  {
    id: 'milan-defence-age',
    date: '2006-11',
    requires: (s) => playerAt(s, 'cur_nesta07', 'milan') && s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:milan-defence-age',
      title: 'How long can Maldini and Nesta hold the line?',
      description: 'Your legendary defence is magnificent and fragile — every knock to Maldini or Nesta is a scare. Wrap them in cotton wool for the big nights, or lean on their brilliance while it lasts?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'manage', label: 'Rotate and protect the veterans', successProbability: 0.6, onSuccess: [{ kind: 'restPlayer', playerId: 'cur_nesta07', months: 1, amount: -6 }, { kind: 'memory', tag: 'load', text: 'Nursed the old guard through the season.' }], onFailure: [{ kind: 'morale', clubId: 'milan', amount: -3 }] },
        { id: 'ride', label: 'Play your best men every week', successProbability: 0.45, onSuccess: [{ kind: 'morale', clubId: 'milan', amount: 5 }], onFailure: [{ kind: 'reinjure', playerId: 'cur_nesta07', months: 2 }] },
      ],
      falloutIfIgnored: [{ kind: 'injuryProneness', playerId: 'cur_maldini07', amount: 6 }],
      memoryTags: ['load', 'cur_maldini07'],
    }),
  },
  {
    id: 'kaka-suitors',
    date: '2008-06',
    requires: (s) => playerAt(s, 'cur_kaka07', 'milan') && s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:kaka-suitors',
      title: 'The world wants Kaká',
      description: 'Your Ballon d\'Or winner is the most coveted player on earth — Real Madrid and a newly-rich Manchester City are readying nine-figure bids. Build the club around him, or take a world-record fee that would fund a whole rebuild?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'keep', label: 'He is not for sale at any price', successProbability: 0.55, onSuccess: [{ kind: 'morale', playerId: 'cur_kaka07', amount: 8 }, { kind: 'fanTrust', amount: 8, text: 'Keeping Kaká is a statement of intent.' }, { kind: 'memory', tag: 'transfer-saga', text: 'Turned down the world for Kaká — as reality did, in 2008.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_kaka07', amount: 10 }] },
        { id: 'cash-in', label: 'Take the world-record fee', successProbability: 0.85, onSuccess: [{ kind: 'transferOut', playerId: 'cur_kaka07', clubId: 'real_madrid', amount: 65_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Cashed in Kaká early — the rebuild is funded, the icon gone.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_kaka07', amount: 12 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_kaka07', amount: 10 }],
      memoryTags: ['transfer-saga', 'cur_kaka07'],
    }),
  },
];

// ── Juventus, 2006 (Calciopoli / Serie B) storyline pack ─────────────────────
const JUVENTUS_2006_PACK: ScriptedEvent[] = [
  {
    id: 'calciopoli-loyalty',
    date: '2006-08',
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:calciopoli-loyalty',
      title: 'The icons who stayed',
      description: 'Cannavaro, Emerson, Thuram, Zambrotta, Ibrahimović and Vieira have all jumped ship. But Del Piero, Buffon, Nedvěd, Trézéguet and a young Chiellini stayed to fight in Serie B. Reward that loyalty and build around them, or use the wreckage to start completely fresh?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'reward', label: 'Build around the loyal icons', successProbability: 0.65, onSuccess: [{ kind: 'morale', clubId: 'juventus', amount: 8 }, { kind: 'fanTrust', amount: 8, text: 'Backing the stayers galvanises a wounded Turin.' }, { kind: 'memory', tag: 'identity', text: 'Built the Serie B fightback on the loyal core — as reality.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'fresh', label: 'Tear it up and rebuild from scratch', successProbability: 0.45, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'identity', text: 'Cleared out even the icons — a ruthless divergence.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -6 }, { kind: 'fanTrust', amount: -6, text: 'Discarding the loyal icons appals the fans.' }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'identity', text: 'The loyal core carry the club without a clear plan.' }],
      memoryTags: ['identity', 'calciopoli'],
    }),
  },
  {
    id: 'buffon-temptation',
    date: '2006-09',
    requires: (s) => playerAt(s, 'cur_buffon07', 'juventus') && s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:buffon-temptation',
      title: 'A Champions League club wants Buffon',
      description: 'The best goalkeeper in the world does not belong in Serie B, and the giants know it — a huge offer is on the table. He is torn. Persuade him the fightback needs him, or let your prize asset go?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'keep', label: 'Convince him to lead the fightback', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_buffon07', amount: 10 }, { kind: 'agitation', playerId: 'cur_buffon07', amount: -20 }, { kind: 'memory', tag: 'transfer-saga', text: 'Buffon stays in Serie B — the loyalty that defined the era.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_buffon07', amount: 12 }] },
        { id: 'sell', label: 'Cash in on your world-class keeper', successProbability: 0.8, onSuccess: [{ kind: 'money', clubId: 'juventus', amount: 20_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Buffon — the war chest grows, the symbol gone.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_buffon07', amount: 10 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_buffon07', amount: 12 }],
      memoryTags: ['transfer-saga', 'cur_buffon07'],
    }),
  },
  {
    id: 'serie-b-grind',
    date: '2007-03',
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:serie-b-grind',
      title: 'Every Serie B side treats you like their cup final',
      description: 'The unglamorous grind is real — muddy pitches, hostile little grounds, and every opponent playing the game of their lives against the fallen giant. The title is yours to lose. How do you keep the stars switched on?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'professional', label: 'Demand ruthless professionalism', successProbability: 0.6, onSuccess: [{ kind: 'morale', clubId: 'juventus', amount: 6 }, { kind: 'memory', tag: 'title-race', text: 'Ground out the promotion the professional way — as reality.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'inspire', label: 'Make it a mission of redemption', successProbability: 0.55, onSuccess: [{ kind: 'morale', clubId: 'juventus', amount: 8 }, { kind: 'fanTrust', amount: 5, text: 'The redemption narrative fires the club.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'juventus', amount: -4 }],
      memoryTags: ['title-race', 'serie-b'],
    }),
  },
];

/** Scripted historical storylines by scenario. man-utd-1999 is the calibration
 *  pack; the others fire only in their own start point (no calibration impact). */
// ── Borussia Dortmund, 1997 (kings of Europe) storyline pack ─────────────────
const DORTMUND_1997_PACK: ScriptedEvent[] = [
  {
    id: 'dortmund-throne',
    date: '1997-08',
    requires: (s) => s.playerClub === 'dortmund',
    build: () => ({
      id: 'scripted:dortmund-throne',
      title: 'Champions of Europe — but for how long?',
      description: 'You sit on the throne of European football, but the side that won it is ageing fast — Kohler, Zorc, Sammer\'s ravaged knees. Defend the crown with the old guard, or start refreshing before the decline arrives?',
      interrupt: true, clubId: 'dortmund', category: 'event',
      choices: [
        { id: 'defend', label: 'Defend the crown with the champions', successProbability: 0.55, onSuccess: [{ kind: 'morale', clubId: 'dortmund', amount: 6 }, { kind: 'memory', tag: 'board', text: 'Rode the ageing champions one more year.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
        { id: 'refresh', label: 'Refresh the squad before the fall', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'board', text: 'Rebuilt early — the divergence from the real slow slide.' }], onFailure: [{ kind: 'morale', clubId: 'dortmund', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'board', text: 'The champions roll on, a year older.' }],
      memoryTags: ['board', 'dynasty'],
    }),
  },
  {
    id: 'sammer-knee',
    date: '1997-11',
    requires: (s) => playerAt(s, 'cur_sammer97', 'dortmund') && s.playerClub === 'dortmund',
    build: () => ({
      id: 'scripted:sammer-knee',
      title: 'Matthias Sammer\'s knee is failing him',
      description: 'Your Ballon d\'Or libero — the heartbeat of the champions — has a knee that may not last the season. Every game you play him could be his last; every one you rest him, you miss the best defender in the world. Reality lost him to it. What do you do?',
      interrupt: true, clubId: 'dortmund', category: 'injury',
      choices: [
        { id: 'protect', label: 'Protect him — manage the knee', successProbability: 0.55, onSuccess: [{ kind: 'restPlayer', playerId: 'cur_sammer97', months: 2, amount: -10 }, { kind: 'memory', tag: 'injury', text: 'Nursed Sammer\'s knee — buying time reality never could.' }], onFailure: [{ kind: 'morale', playerId: 'cur_sammer97', amount: -4 }] },
        { id: 'ride', label: 'Play him while you still can', successProbability: 0.4, onSuccess: [{ kind: 'morale', clubId: 'dortmund', amount: 6 }], onFailure: [{ kind: 'reinjure', playerId: 'cur_sammer97', months: 8 }, { kind: 'memory', tag: 'injury', text: 'Rode Sammer and the knee gave out — the career-ending blow, as reality.' }] },
      ],
      falloutIfIgnored: [{ kind: 'injuryProneness', playerId: 'cur_sammer97', amount: 10 }],
      memoryTags: ['injury', 'cur_sammer97'],
    }),
  },
  {
    id: 'dortmund-ageing-core',
    date: '1998-06',
    requires: (s) => playerAt(s, 'cur_moller97', 'dortmund') && s.playerClub === 'dortmund',
    build: () => ({
      id: 'scripted:dortmund-ageing-core',
      title: 'The golden generation is fading',
      description: 'Möller, Kohler, Zorc, Reuter — the men who conquered Europe are past 30 and slowing. Do you hand the reins to Ricken and the kids now, or squeeze one more campaign from the legends?',
      interrupt: true, clubId: 'dortmund', category: 'event',
      choices: [
        { id: 'promote-youth', label: 'Hand it to Ricken and the young ones', successProbability: 0.5, onSuccess: [{ kind: 'morale', playerId: 'cur_ricken97', amount: 10 }, { kind: 'memory', tag: 'development', text: 'Trusted the youth — a bolder path than reality took.' }], onFailure: [{ kind: 'morale', clubId: 'dortmund', amount: -3 }] },
        { id: 'one-more', label: 'One more year from the legends', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'development', text: 'Leaned on the old guard again.' }], onFailure: [{ kind: 'morale', clubId: 'dortmund', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'development', text: 'The transition drifts, unmanaged.' }],
      memoryTags: ['development', 'dynasty'],
    }),
  },
];

// ── Bayern München, 1998 (the treble denied) storyline pack ──────────────────
const BAYERN_1998_PACK: ScriptedEvent[] = [
  {
    id: 'bayern-finish-job',
    date: '1998-08',
    requires: (s) => s.playerClub === 'bayern',
    build: () => ({
      id: 'scripted:bayern-finish-job',
      title: 'Finish the job in Europe',
      description: 'The wounds of past European near-misses run deep at this club. The squad is strong, hardened, hungry. Set the season\'s single obsession as the European Cup — or keep the focus on a domestic clean sweep first?',
      interrupt: true, clubId: 'bayern', category: 'event',
      choices: [
        { id: 'europe', label: 'Make the European Cup the obsession', successProbability: 0.55, onSuccess: [{ kind: 'morale', clubId: 'bayern', amount: 6 }, { kind: 'memory', tag: 'board', text: 'Set the whole season on Europe — the mission.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'domestic', label: 'Win Germany first, Europe second', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'board', text: 'Prioritised the Bundesliga — the surer prize.' }], onFailure: [{ kind: 'morale', clubId: 'bayern', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'board', text: 'The season starts without a clear obsession.' }],
      memoryTags: ['board', 'europe'],
    }),
  },
  {
    id: 'bayern-egos',
    date: '1998-10',
    requires: (s) => playerAt(s, 'cur_effenberg98', 'bayern') && s.playerClub === 'bayern',
    build: () => ({
      id: 'scripted:bayern-egos',
      title: 'A dressing room of giant egos',
      description: 'Effenberg the alpha, a 37-year-old Matthäus who wants to run everything, Basler the maverick who trains how he likes. This is "FC Hollywood" — brilliant and combustible. Impose your authority, or let the big characters police themselves?',
      interrupt: true, clubId: 'bayern', category: 'event',
      choices: [
        { id: 'authority', label: 'Impose firm authority', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'managerRelationship', amount: 4 }, { kind: 'memory', tag: 'dressing-room', text: 'Stamped authority on FC Hollywood.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_basler98', amount: 12 }] },
        { id: 'let-lead', label: 'Let the leaders run the room', successProbability: 0.55, onSuccess: [{ kind: 'morale', playerId: 'cur_effenberg98', amount: 8 }, { kind: 'memory', tag: 'dressing-room', text: 'Trusted the alphas to hold the room — as reality often did.' }], onFailure: [{ kind: 'morale', clubId: 'bayern', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'bayern', amount: -3 }],
      memoryTags: ['dressing-room', 'cur_effenberg98'],
    }),
  },
  {
    id: 'bayern-1999-final',
    date: '1999-05',
    requires: (s) => s.playerClub === 'bayern',
    build: () => ({
      id: 'scripted:bayern-1999-final',
      title: 'The European Cup final — don\'t let it slip',
      description: 'You are ninety minutes from the crown. Reality remembers this night for two injury-time goals that ripped it away. Lead 1-0 late — do you shut up shop and defend the lead, or keep going for the second that kills it?',
      interrupt: true, clubId: 'bayern', category: 'event',
      choices: [
        { id: 'kill-it', label: 'Go for the second goal to kill the game', successProbability: 0.5, onSuccess: [{ kind: 'morale', clubId: 'bayern', amount: 10 }, { kind: 'fanTrust', amount: 10, text: 'The second goal settles it — the ghost is exorcised.' }, { kind: 'memory', tag: 'europe', text: 'Went for the throat and finished it — rewriting the nightmare.' }], onFailure: [{ kind: 'morale', clubId: 'bayern', amount: -6 }] },
        { id: 'defend', label: 'Shut up shop and defend the lead', successProbability: 0.5, onSuccess: [{ kind: 'morale', clubId: 'bayern', amount: 8 }], onFailure: [{ kind: 'morale', clubId: 'bayern', amount: -12 }, { kind: 'fanTrust', amount: -8, text: 'Two injury-time goals — the exact horror of reality.' }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'bayern', amount: -6 }, { kind: 'memory', tag: 'europe', text: 'The final slips away, as it did in Barcelona.' }],
      memoryTags: ['europe', 'final'],
    }),
  },
];

// ── AC Milan, 1995 (end of the dynasty) storyline pack ───────────────────────
const MILAN_1995_PACK: ScriptedEvent[] = [
  {
    id: 'milan-baggio-role',
    date: '1995-09',
    requires: (s) => playerAt(s, 'cur_baggio95', 'milan') && s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:milan-baggio-role',
      title: 'Roberto Baggio does not fit the system',
      description: 'You have signed the Divine Ponytail, a free-roaming number ten — but the manager\'s rigid 4-4-2 has no place for him, and reality wasted him on the bench. Build the team around his genius, or make him conform to the system?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'build-around', label: 'Build the side around Baggio', successProbability: 0.5, onSuccess: [{ kind: 'morale', playerId: 'cur_baggio95', amount: 10 }, { kind: 'managerRelationship', amount: -4 }, { kind: 'memory', tag: 'tactics', text: 'Freed Baggio — the divergence from Capello\'s system.' }], onFailure: [{ kind: 'managerRelationship', amount: -8 }] },
        { id: 'conform', label: 'Make him fit the system', successProbability: 0.55, onSuccess: [{ kind: 'managerRelationship', amount: 5 }, { kind: 'agitation', playerId: 'cur_baggio95', amount: 14 }, { kind: 'memory', tag: 'tactics', text: 'Kept the system — Baggio chafes, as reality.' }], onFailure: [{ kind: 'morale', playerId: 'cur_baggio95', amount: -10 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_baggio95', amount: 12 }],
      memoryTags: ['tactics', 'cur_baggio95'],
    }),
  },
  {
    id: 'milan-dynasty-twilight',
    date: '1995-08',
    requires: (s) => s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:milan-dynasty-twilight',
      title: 'The immortals are growing old',
      description: 'Baresi is 35, Tassotti 35, Galli 32 — the greatest defence football has seen is in its twilight. Ride the legends for one more title, or begin blooding the next generation behind them?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'ride', label: 'One more title with the immortals', successProbability: 0.55, onSuccess: [{ kind: 'morale', clubId: 'milan', amount: 6 }, { kind: 'memory', tag: 'board', text: 'Rode the great defence one last time — as reality (the 1996 Scudetto).' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'renew', label: 'Blood the next generation now', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'board', text: 'Started the renewal early.' }], onFailure: [{ kind: 'morale', clubId: 'milan', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'board', text: 'The great side ages another year, unrenewed.' }],
      memoryTags: ['board', 'dynasty'],
    }),
  },
  {
    id: 'weah-ballon-dor',
    date: '1996-01',
    requires: (s) => playerAt(s, 'cur_weah95', 'milan') && s.playerClub === 'milan',
    build: () => ({
      id: 'scripted:weah-ballon-dor',
      title: 'George Weah is the best player in the world',
      description: 'Your striker has just won the Ballon d\'Or — the first African ever to do so. He is at his imperious peak. Make him the undisputed focal point of everything you do, or keep the balance of your star-laden attack?',
      interrupt: true, clubId: 'milan', category: 'event',
      choices: [
        { id: 'focal', label: 'Build everything around Weah', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_weah95', amount: 8 }, { kind: 'memory', tag: 'tactics', text: 'Made Weah the focal point at his peak.' }], onFailure: [{ kind: 'morale', clubId: 'milan', amount: -3 }] },
        { id: 'balance', label: 'Keep the attacking balance', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 3 }], onFailure: [{ kind: 'agitation', playerId: 'cur_weah95', amount: 8 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'tactics', text: 'Weah\'s peak goes unharnessed.' }],
      memoryTags: ['tactics', 'cur_weah95'],
    }),
  },
];

// ── Juventus, 1995 (the Lippi era) storyline pack ────────────────────────────
const JUVENTUS_1995_PACK: ScriptedEvent[] = [
  {
    id: 'delpiero-heir',
    date: '1995-09',
    requires: (s) => playerAt(s, 'cur_delpiero95', 'juventus') && s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:delpiero-heir',
      title: 'A 20-year-old is ready to take over',
      description: 'Alessandro Del Piero is bursting with talent, but Vialli and Ravanelli are the established stars leading the line. Throw the kid straight in and build the future around him, or bring him along slowly behind the veterans?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'throw-in', label: 'Hand Del Piero the keys now', successProbability: 0.55, onSuccess: [{ kind: 'morale', playerId: 'cur_delpiero95', amount: 12 }, { kind: 'memory', tag: 'development', text: 'Made Del Piero the centre of the project — the heir crowned early.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -3 }] },
        { id: 'slowly', label: 'Bring him along behind the veterans', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'development', text: 'Eased Del Piero in — the measured path, as reality.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_delpiero95', amount: 8 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'development', text: 'Del Piero waits his turn.' }],
      memoryTags: ['development', 'cur_delpiero95'],
    }),
  },
  {
    id: 'juve-european-cup',
    date: '1996-05',
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:juve-european-cup',
      title: 'The European Cup final — Ajax await',
      description: 'You have reached the final against the young champions of Ajax. It will likely come down to the finest margins, perhaps a shootout. How do you set up for the biggest night?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'front-foot', label: 'Take the game to them', successProbability: 0.5, onSuccess: [{ kind: 'morale', clubId: 'juventus', amount: 10 }, { kind: 'fanTrust', amount: 8, text: 'A bold final performance seizes the Cup.' }, { kind: 'memory', tag: 'europe', text: 'Won Europe on the front foot — the 1996 crown.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -6 }] },
        { id: 'contain', label: 'Contain them and trust the shootout', successProbability: 0.5, onSuccess: [{ kind: 'morale', clubId: 'juventus', amount: 8 }, { kind: 'memory', tag: 'europe', text: 'Held firm and won the shootout — as reality.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -6 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'europe', text: 'The final is left to chance.' }],
      memoryTags: ['europe', 'final'],
    }),
  },
  {
    id: 'juve-exodus',
    date: '1996-06',
    requires: (s) => s.playerClub === 'juventus',
    build: () => ({
      id: 'scripted:juve-exodus',
      title: 'The stars are being tempted away',
      description: 'Vialli is wanted by Chelsea, Ravanelli by the new English money — the champions of Europe are about to be picked apart for huge fees. Cash in and reinvest around Del Piero, or fight to keep the winning team together?',
      interrupt: true, clubId: 'juventus', category: 'event',
      choices: [
        { id: 'cash-in', label: 'Cash in and rebuild around Del Piero', successProbability: 0.65, onSuccess: [{ kind: 'money', clubId: 'juventus', amount: 20_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold the veterans and reinvested — as reality, the Zidane-era rebuild.' }], onFailure: [{ kind: 'morale', clubId: 'juventus', amount: -4 }] },
        { id: 'keep', label: 'Keep the European champions together', successProbability: 0.45, onSuccess: [{ kind: 'morale', clubId: 'juventus', amount: 8 }, { kind: 'memory', tag: 'transfer-saga', text: 'Held the winning side together — a divergence.' }], onFailure: [{ kind: 'boardPatience', amount: -5 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer-saga', text: 'The stars drift away for nothing decided.' }],
      memoryTags: ['transfer-saga', 'exodus'],
    }),
  },
];

// ── Liverpool, 1995 (the Spice Boys) storyline pack ──────────────────────────
const LIVERPOOL_1995_PACK: ScriptedEvent[] = [
  {
    id: 'spice-boys-culture',
    date: '1995-09',
    requires: (s) => s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:spice-boys-culture',
      title: 'The "Spice Boys" tag is sticking',
      description: 'Your gifted young side has the talent to win the title — and a growing reputation for fashion shoots, nightclubs and flakiness. The press mock the white suits before they\'re even worn. Crack down on the culture, or trust the talent to deliver?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'crack-down', label: 'Instil steel and professionalism', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'culture', text: 'Toughened up the Spice Boys — the divergence from the real flakiness.' }], onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -3 }] },
        { id: 'trust', label: 'Let the talent express itself', successProbability: 0.55, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 6 }, { kind: 'memory', tag: 'culture', text: 'Trusted the flair — brilliant on its day, brittle on others.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'culture', text: 'The image problem festers, as reality.' }],
      memoryTags: ['culture', 'spice-boys'],
    }),
  },
  {
    id: 'collymore-fowler',
    date: '1995-11',
    requires: (s) => playerAt(s, 'cur_collymore96', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:collymore-fowler',
      title: 'Stan Collymore is unsettled and combustible',
      description: 'Your British-record striker is a prodigious talent and a management nightmare — homesick, moody, at odds with the dressing room. Invest the time to settle him alongside Fowler, or cut your losses before it sours?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'settle', label: 'Put your arm around him and settle him', successProbability: 0.5, onSuccess: [{ kind: 'morale', playerId: 'cur_collymore96', amount: 10 }, { kind: 'agitation', playerId: 'cur_collymore96', amount: -18 }, { kind: 'memory', tag: 'man-management', text: 'Settled Collymore — unlocking the talent reality wasted.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_collymore96', amount: 10 }] },
        { id: 'hard-line', label: 'Take a hard line — he must conform', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'agitation', playerId: 'cur_collymore96', amount: 14 }], onFailure: [{ kind: 'morale', playerId: 'cur_collymore96', amount: -10 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_collymore96', amount: 14 }],
      memoryTags: ['man-management', 'cur_collymore96'],
    }),
  },
  {
    id: 'mcmanaman-bosman',
    date: '1997-01',
    requires: (s) => playerAt(s, 'cur_mcmanaman96', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:mcmanaman-bosman',
      title: 'Real Madrid are circling Steve McManaman',
      description: 'The new Bosman ruling means your best creative player could walk for nothing when his deal expires — and Real Madrid are watching (they eventually took him free in 1999). Tie him down now on big money, cash in while you can, or risk losing him for nothing?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'tie-down', label: 'Break the wage structure to keep him', successProbability: 0.55, onSuccess: [{ kind: 'morale', playerId: 'cur_mcmanaman96', amount: 8 }, { kind: 'money', clubId: 'liverpool', amount: -4_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Kept McManaman off a Bosman — the divergence from his free Madrid move.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_mcmanaman96', amount: 8 }] },
        { id: 'cash-in', label: 'Cash in now while he has value', successProbability: 0.75, onSuccess: [{ kind: 'transferOut', playerId: 'cur_mcmanaman96', clubId: 'real_madrid', amount: 12_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold McManaman for a fee, not a Bosman free.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_mcmanaman96', amount: 10 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer-saga', text: 'The McManaman contract drifts towards a free exit, as reality.' }],
      memoryTags: ['transfer-saga', 'cur_mcmanaman96'],
    }),
  },
];

// ── Chelsea, 1996 (Gullit's revolution, pre-money) storyline pack ────────────
const CHELSEA_1996_PACK: ScriptedEvent[] = [
  {
    id: 'gullit-revolution',
    date: '1996-08',
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:gullit-revolution',
      title: 'Sexy football, foreign stars — a new Chelsea',
      description: 'Your player-manager is importing continental flair — Vialli, Leboeuf, soon Zola — and preaching "sexy football". It is glamorous and years ahead of its time, but there are no billions behind it. Go all-in on the cosmopolitan vision, or keep some English steel and pragmatism?',
      interrupt: true, clubId: 'chelsea', category: 'event',
      choices: [
        { id: 'all-in', label: 'Go all-in on the continental revolution', successProbability: 0.55, onSuccess: [{ kind: 'morale', clubId: 'chelsea', amount: 6 }, { kind: 'fanTrust', amount: 6, text: 'The Bridge falls in love with the sexy football.' }, { kind: 'memory', tag: 'identity', text: 'Backed Gullit\'s revolution — the making of the modern Chelsea.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'balance', label: 'Temper the flair with English steel', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'identity', text: 'Kept a pragmatic core alongside the imports.' }], onFailure: [{ kind: 'morale', clubId: 'chelsea', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'identity', text: 'The revolution rolls on without your steer.' }],
      memoryTags: ['identity', 'gullit'],
    }),
  },
  {
    id: 'zola-magic',
    date: '1996-12',
    requires: (s) => playerAt(s, 'cur_zola96', 'chelsea') && s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:zola-magic',
      title: 'Gianfranco Zola has lit up the league',
      description: 'Your November signing has been a revelation — the little Sardinian magician is the best player in England and adored at the Bridge. Build the whole side to serve his genius, or keep a system that doesn\'t lean on one man?',
      interrupt: true, clubId: 'chelsea', category: 'event',
      choices: [
        { id: 'serve-zola', label: 'Build everything around Zola', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_zola96', amount: 8 }, { kind: 'fanTrust', amount: 6, text: 'Zola at the heart of it all — magic every week.' }, { kind: 'memory', tag: 'tactics', text: 'Made Zola the fulcrum — Footballer of the Year, as reality.' }], onFailure: [{ kind: 'morale', clubId: 'chelsea', amount: -3 }] },
        { id: 'system', label: 'Keep a balanced system', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 3 }], onFailure: [{ kind: 'agitation', playerId: 'cur_zola96', amount: 6 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'tactics', text: 'Zola dazzles regardless.' }],
      memoryTags: ['tactics', 'cur_zola96'],
    }),
  },
  {
    id: 'gullit-board-tension',
    date: '1998-02',
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:gullit-board-tension',
      title: 'The player-manager wants a "netto" pay rise',
      description: 'Gullit is doing brilliantly, but a contract row is brewing — and reality remembers this ending in a shock sacking despite success. Meet his demands and keep the revolution\'s architect, or stand firm and risk losing him?',
      interrupt: true, clubId: 'chelsea', category: 'event',
      choices: [
        { id: 'meet', label: 'Meet his demands — keep the architect', successProbability: 0.55, onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'manager', text: 'Kept Gullit — the divergence from his shock 1998 sacking.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
        { id: 'stand-firm', label: 'Stand firm on the money', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'manager', text: 'Held the line — as the real board did, to Gullit\'s cost.' }], onFailure: [{ kind: 'managerRelationship', amount: -8 }] },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: -5 }],
      memoryTags: ['manager', 'gullit'],
    }),
  },
];

// ── Barcelona, 2014 (the MSN peak) storyline pack ────────────────────────────
const BARCELONA_2014_PACK: ScriptedEvent[] = [
  {
    id: 'msn-balance',
    date: '2014-09',
    requires: (s) => playerAt(s, 'cur_neymar14', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:msn-balance',
      title: 'Three superstars, one attack',
      description: 'Messi, Suárez and Neymar are each capable of carrying a team alone — and now they must share one front line. The egos and the goalscoring pecking order could tear it apart, or become the greatest attack ever assembled. How do you build it?',
      interrupt: true, clubId: 'barcelona', category: 'event',
      choices: [
        { id: 'messi-central', label: 'Move Messi wide and let all three flourish', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_neymar14', amount: 8 }, { kind: 'morale', playerId: 'cur_suarez14', amount: 8 }, { kind: 'memory', tag: 'tactics', text: 'Struck the MSN balance — the greatest trident, as reality (Berlin 2015).' }], onFailure: [{ kind: 'agitation', playerId: 'cur_neymar14', amount: 8 }] },
        { id: 'messi-first', label: 'Build it all around Messi', successProbability: 0.55, onSuccess: [{ kind: 'morale', playerId: 'cur_messi14', amount: 8 }], onFailure: [{ kind: 'agitation', playerId: 'cur_neymar14', amount: 10 }, { kind: 'agitation', playerId: 'cur_suarez14', amount: 8 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'tactics', text: 'The three stars are left to find their own balance.' }],
      memoryTags: ['tactics', 'msn'],
    }),
  },
  {
    id: 'xavi-succession',
    date: '2015-01',
    requires: (s) => playerAt(s, 'cur_xavi14', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:xavi-succession',
      title: 'Xavi is playing his final season',
      description: 'The metronome of an era is 34 and winding down. The identity of the whole club runs through the midfield he defined. Pass the baton fully to Busquets and Rakitić now, or lean on Xavi\'s genius for one last title charge?',
      interrupt: true, clubId: 'barcelona', category: 'event',
      choices: [
        { id: 'transition', label: 'Pass the baton to the new midfield', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_busquets14', amount: 6 }, { kind: 'memory', tag: 'development', text: 'Managed the midfield succession smoothly.' }], onFailure: [{ kind: 'morale', clubId: 'barcelona', amount: -3 }] },
        { id: 'lean-on-xavi', label: 'Lean on Xavi one last time', successProbability: 0.55, onSuccess: [{ kind: 'morale', playerId: 'cur_xavi14', amount: 10 }, { kind: 'memory', tag: 'development', text: 'Rode Xavi\'s brilliance to a fitting farewell treble.' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'development', text: 'The generational handover drifts.' }],
      memoryTags: ['development', 'cur_xavi14'],
    }),
  },
  {
    id: 'suarez-integration',
    date: '2014-10',
    requires: (s) => playerAt(s, 'cur_suarez14', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:suarez-integration',
      title: 'Suárez arrives under a cloud',
      description: 'Your new number nine has arrived from a World Cup biting ban that kept him out for the first months, and the world is watching how the reformed talisman settles. Manage his reintegration carefully, or throw him straight into the fire?',
      interrupt: true, clubId: 'barcelona', category: 'event',
      choices: [
        { id: 'careful', label: 'Ease him in and rebuild his image', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_suarez14', amount: 8 }, { kind: 'agitation', playerId: 'cur_suarez14', amount: -12 }, { kind: 'memory', tag: 'man-management', text: 'Reintegrated Suárez perfectly — the redemption, as reality.' }], onFailure: [{ kind: 'morale', playerId: 'cur_suarez14', amount: -4 }] },
        { id: 'straight-in', label: 'Throw him straight into the fire', successProbability: 0.5, onSuccess: [{ kind: 'morale', playerId: 'cur_suarez14', amount: 6 }], onFailure: [{ kind: 'agitation', playerId: 'cur_suarez14', amount: 10 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'man-management', text: 'Suárez settles at his own pace.' }],
      memoryTags: ['man-management', 'cur_suarez14'],
    }),
  },
];

const BARCELONA_2003_PACK: ScriptedEvent[] = [
  {
    id: 'ronaldinho-dawn',
    date: '2003-10',
    requires: (s) => playerAt(s, 'cur_ronaldinho03', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:ronaldinho-dawn',
      title: 'Ronaldinho arrives to lift a fallen giant',
      description: 'Barça finished sixth last season and have not won the league in five years. The board have spent big on a smiling Brazilian to be the face of the revival. Build the whole project around Ronaldinho\'s joy now, or make him earn his place in a struggling side first?',
      interrupt: true, clubId: 'barcelona', category: 'event',
      choices: [
        { id: 'build-around', label: 'Hand him the keys — build everything around him', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_ronaldinho03', amount: 10 }, { kind: 'memory', tag: 'man-management', text: 'Unleashed Ronaldinho — the dawn of the revival, as reality (the 2004 second-half surge).' }], onFailure: [{ kind: 'boardPatience', amount: -3 }] },
        { id: 'earn-it', label: 'Make him earn it in a struggling side', successProbability: 0.5, onSuccess: [{ kind: 'morale', playerId: 'cur_ronaldinho03', amount: 5 }], onFailure: [{ kind: 'agitation', playerId: 'cur_ronaldinho03', amount: 8 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'man-management', text: 'Ronaldinho finds his own rhythm at the Camp Nou.' }],
      memoryTags: ['man-management', 'cur_ronaldinho03'],
    }),
  },
  {
    id: 'quaresma-or-deco',
    date: '2004-06',
    requires: (s) => playerAt(s, 'cur_quaresma03', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:quaresma-or-deco',
      title: 'A trickster\'s gift, or a proven brain',
      description: 'Ricardo Quaresma is 20 and dazzling — flicks and trivelas that light up training — but raw and impatient for minutes. Porto will hand you the reigning Champions League midfielder Deco if you let the boy go. Cash in the potential for a finished article, or keep the wonderkid?',
      interrupt: true, clubId: 'barcelona', category: 'transfer',
      choices: [
        { id: 'sell-for-deco', label: 'Trade Quaresma for Deco', successProbability: 0.65, onSuccess: [{ kind: 'memory', tag: 'transfer', text: 'Cashed the raw gift for Deco — the engine of the title win, as reality.' }, { kind: 'transferOut', playerId: 'cur_quaresma03' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'keep-quaresma', label: 'Keep the wonderkid and develop him', successProbability: 0.4, onSuccess: [{ kind: 'ability', playerId: 'cur_quaresma03', amount: 4 }, { kind: 'memory', tag: 'development', text: 'Bet on Quaresma\'s gift against history\'s verdict.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_quaresma03', amount: 10 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'The Quaresma question is left to solve itself.' }],
      memoryTags: ['transfer', 'cur_quaresma03'],
    }),
  },
  {
    id: 'iniesta-breakout-03',
    date: '2004-02',
    requires: (s) => playerAt(s, 'cur_iniesta03', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:iniesta-breakout-03',
      title: 'A shy boy from Fuentealbilla is ready',
      description: 'The academy is buzzing about a slight, quiet 19-year-old who never loses the ball. The coaching staff are split: some see the finest midfielder La Masia has ever produced, others a lightweight who will be bullied in the Primera. Throw Iniesta in now, or protect him another year?',
      interrupt: true, clubId: 'barcelona', category: 'event',
      choices: [
        { id: 'promote-now', label: 'Give Iniesta his chance now', successProbability: 0.6, onSuccess: [{ kind: 'ability', playerId: 'cur_iniesta03', amount: 4 }, { kind: 'morale', playerId: 'cur_iniesta03', amount: 8 }, { kind: 'memory', tag: 'development', text: 'Blooded Iniesta early — a decade of genius begins, as reality.' }], onFailure: [{ kind: 'morale', playerId: 'cur_iniesta03', amount: -3 }] },
        { id: 'protect', label: 'Protect him for another season', successProbability: 0.55, onSuccess: [{ kind: 'ability', playerId: 'cur_iniesta03', amount: 2 }], onFailure: [{ kind: 'agitation', playerId: 'cur_iniesta03', amount: 5 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'development', text: 'Iniesta bides his time in the reserves.' }],
      memoryTags: ['development', 'cur_iniesta03'],
    }),
  },
];

const REAL_MADRID_2006_PACK: ScriptedEvent[] = [
  {
    id: 'capello-vs-galacticos',
    date: '2006-10',
    requires: (s) => playerAt(s, 'cur_ronaldo06', 'real_madrid') && s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:capello-vs-galacticos',
      title: 'The galáctico circus must end',
      description: 'Three trophyless seasons have followed the era of signing a superstar every summer. The dressing room still runs on reputation, not sweat, and an overweight Ronaldo trains as he pleases. Impose iron discipline and win ugly, or keep the box office happy and hope the talent tells?',
      interrupt: true, clubId: 'real_madrid', category: 'event',
      choices: [
        { id: 'iron-discipline', label: 'Impose discipline — results over glamour', successProbability: 0.6, onSuccess: [{ kind: 'memory', tag: 'man-management', text: 'Ended the circus — grind out the title, as reality (Capello 2007).' }, { kind: 'boardPatience', amount: 3 }], onFailure: [{ kind: 'agitation', playerId: 'cur_ronaldo06', amount: 8 }, { kind: 'boardPatience', amount: -4 }] },
        { id: 'keep-glamour', label: 'Keep the galácticos happy', successProbability: 0.45, onSuccess: [{ kind: 'morale', clubId: 'real_madrid', amount: 5 }], onFailure: [{ kind: 'boardPatience', amount: -5 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'man-management', text: 'The Bernabéu drifts between glamour and grit.' }],
      memoryTags: ['man-management', 'cur_ronaldo06'],
    }),
  },
  {
    id: 'ronaldo-to-milan',
    date: '2007-01',
    requires: (s) => playerAt(s, 'cur_ronaldo06', 'real_madrid') && s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:ronaldo-to-milan',
      title: 'Il Fenomeno wants out',
      description: 'Ronaldo is out of shape, out of favour and Milan are on the phone with a January offer. The phenomenon can still win you a game from nothing on his day — but those days are rarer, and his presence undermines the discipline you preach. Cash in and move on, or gamble on one last flash of genius?',
      interrupt: true, clubId: 'real_madrid', category: 'transfer',
      choices: [
        { id: 'sell-ronaldo', label: 'Sell him to Milan and move on', successProbability: 0.65, onSuccess: [{ kind: 'money', amount: 8 }, { kind: 'memory', tag: 'transfer', text: 'Let Ronaldo go — the rebuild breathes, as reality (Milan, Jan 2007).' }, { kind: 'transferOut', playerId: 'cur_ronaldo06' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'keep-ronaldo', label: 'Keep him for one last gamble', successProbability: 0.35, onSuccess: [{ kind: 'morale', playerId: 'cur_ronaldo06', amount: 8 }, { kind: 'ability', playerId: 'cur_ronaldo06', amount: 3 }, { kind: 'memory', tag: 'man-management', text: 'Bet on the phenomenon against history.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_ronaldo06', amount: 10 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'transfer', text: 'Ronaldo\'s future is left unresolved into the summer.' }],
      memoryTags: ['transfer', 'cur_ronaldo06'],
    }),
  },
  {
    id: 'beckham-frozen-out',
    date: '2007-01',
    requires: (s) => playerAt(s, 'cur_beckham06', 'real_madrid') && s.playerClub === 'real_madrid',
    build: () => ({
      id: 'scripted:beckham-frozen-out',
      title: 'Beckham has signed for LA',
      description: 'David Beckham has announced a summer move to the Galaxy, and the easy call is to freeze out a player already halfway out the door. But he is your best crosser, a relentless professional, and the fans still adore him. Banish him to the stands on principle, or swallow your pride and reinstate him for the run-in?',
      interrupt: true, clubId: 'real_madrid', category: 'event',
      choices: [
        { id: 'reinstate', label: 'Reinstate him — winning trumps pride', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_beckham06', amount: 10 }, { kind: 'memory', tag: 'man-management', text: 'Brought Beckham back in from the cold — decisive in the title, as reality.' }], onFailure: [{ kind: 'boardPatience', amount: -2 }] },
        { id: 'freeze-out', label: 'Freeze him out — he chose to leave', successProbability: 0.4, onSuccess: [{ kind: 'memory', tag: 'man-management', text: 'Held the line and banished Beckham.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_beckham06', amount: 8 }, { kind: 'fanTrust', amount: -3 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'man-management', text: 'Beckham drifts to the fringes before his exit.' }],
      memoryTags: ['man-management', 'cur_beckham06'],
    }),
  },
];

const SCRIPTED_PACKS: Record<string, ScriptedEvent[]> = {
  'man-utd-1999': MAN_UTD_1999_PACK,
  'barcelona-2014': BARCELONA_2014_PACK,
  'liverpool-1995': LIVERPOOL_1995_PACK,
  'chelsea-1996': CHELSEA_1996_PACK,
  'milan-1995': MILAN_1995_PACK,
  'juventus-1995': JUVENTUS_1995_PACK,
  'dortmund-1997': DORTMUND_1997_PACK,
  'bayern-1998': BAYERN_1998_PACK,
  'newcastle-1995': NEWCASTLE_1995_PACK,
  'spurs-2013': SPURS_2013_PACK,
  'milan-2007': MILAN_2007_PACK,
  'juventus-2006': JUVENTUS_2006_PACK,
  'man-utd-2013': MAN_UTD_2013_PACK,
  'real-madrid-2000': REAL_MADRID_2000_PACK,
  'arsenal-2004': ARSENAL_2004_PACK,
  'liverpool-2001': LIVERPOOL_2001_PACK,
  'bayern-2009': BAYERN_2009_PACK,
  'inter-1998': INTER_1998_PACK,
  'chelsea-2003': CHELSEA_2003_PACK,
  'arsenal-1996': ARSENAL_1996_PACK,
  'barcelona-2003': BARCELONA_2003_PACK,
  'real-madrid-2006': REAL_MADRID_2006_PACK,
};

function fireScriptedEvents(state: GameState): void {
  const pack = SCRIPTED_PACKS[state.meta.scenarioId];
  if (!pack) return;
  for (const ev of pack) {
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
