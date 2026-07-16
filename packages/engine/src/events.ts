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

// ── Barcelona, 1999 (Van Gaal's Catalans) storyline pack ─────────────────────
const BARCELONA_1999_PACK: ScriptedEvent[] = [
  {
    // Figo's 2000 defection to Real Madrid — the most controversial transfer of
    // the era, the founding act of the galácticos, and the deepest betrayal in the
    // Clásico's history. Fires before his real summer-2000 move.
    id: 'figo-betrayal',
    date: '2000-06',
    requires: (s) => playerAt(s, 'cur_figo', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:figo-betrayal',
      title: 'Real Madrid trigger a move for Luís Figo',
      description: 'Florentino Pérez has built a presidency around prising your talisman across the divide. The unthinkable is on the table. Match anything to keep him, let him defect, or sell him elsewhere to deny Madrid?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'keep',
          label: 'Match any terms — he cannot join Madrid',
          successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: 'cur_figo', amount: 10 }, { kind: 'money', clubId: 'barcelona', amount: -6_000_000 }, { kind: 'fanTrust', amount: 8, text: 'Keeping Figo from Madrid is a statement.' }, { kind: 'memory', tag: 'transfer-saga', text: 'Kept Figo — the betrayal that never was.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_figo', amount: 12 }],
        },
        {
          id: 'let-go',
          label: 'Let him go to Madrid (as reality)',
          successProbability: 0.8,
          onSuccess: [{ kind: 'money', clubId: 'barcelona', amount: 30_000_000 }, { kind: 'fanTrust', amount: -8, text: 'Figo\'s defection to Madrid poisons the fanbase.' }, { kind: 'memory', tag: 'transfer-saga', text: 'Figo defects to Madrid — the great betrayal.' }],
          onFailure: [{ kind: 'fanTrust', amount: -10, text: 'The Figo sale is a catastrophe with the fans.' }],
        },
        {
          id: 'spite-sale',
          label: 'Sell him anywhere but Madrid',
          successProbability: 0.4,
          onSuccess: [{ kind: 'transferOut', playerId: 'cur_figo', clubId: 'juventus', amount: 28_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Figo to Italy to deny Madrid — history rewritten.' }],
          onFailure: [{ kind: 'agitation', playerId: 'cur_figo', amount: 15 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -6, text: 'Dithering over Figo lets Madrid dictate terms.' }, { kind: 'agitation', playerId: 'cur_figo', amount: 12 }],
      memoryTags: ['transfer-saga', 'cur_figo'],
    }),
  },
  {
    // Rivaldo's running battle with Van Gaal — the reigning Ballon d'Or refused to
    // be played wide on the left, wanting the free central role; he was dropped for
    // it. A context-dependent star-role dispute.
    id: 'rivaldo-role',
    date: '2001-01',
    requires: (s) => playerAt(s, 'cur_rivaldo', 'barcelona') && s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:rivaldo-role',
      title: 'Rivaldo refuses to play on the wing',
      description: 'Your Ballon d\'Or winner and the manager are at war: Van Gaal wants him wide on the left, Rivaldo insists he is a free number ten and will not do it. Whose side are you on?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'free-role',
          label: 'Give Rivaldo his free central role',
          successProbability: 0.55,
          onSuccess: [{ kind: 'morale', playerId: 'cur_rivaldo', amount: 10 }, { kind: 'managerRelationship', amount: -5 }, { kind: 'memory', tag: 'tactics', text: 'Freed Rivaldo — the manager is overruled.' }],
          onFailure: [{ kind: 'managerRelationship', amount: -10 }],
        },
        {
          id: 'back-manager',
          label: 'Back Van Gaal\'s system',
          successProbability: 0.6,
          onSuccess: [{ kind: 'managerRelationship', amount: 6 }, { kind: 'agitation', playerId: 'cur_rivaldo', amount: 15 }, { kind: 'memory', tag: 'tactics', text: 'Backed the system over the star — Rivaldo seethes.' }],
          onFailure: [{ kind: 'morale', playerId: 'cur_rivaldo', amount: -10 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_rivaldo', amount: 12 }, { kind: 'managerRelationship', amount: -4 }],
      memoryTags: ['tactics', 'cur_rivaldo'],
    }),
  },
  {
    // The Núñez era ends — his 1978–2000 presidency collapsed amid the Figo fallout
    // and Joan Gaspart took over into a chaotic, trophyless spell. A boardroom beat.
    id: 'barca-presidency',
    date: '2000-08',
    requires: (s) => s.playerClub === 'barcelona',
    build: () => ({
      id: 'scripted:barca-presidency',
      title: 'A new president takes charge at the Camp Nou',
      description: 'The old regime has fallen and a new president arrives promising to answer Madrid\'s galácticos spend-for-spend. Align with his vision, or protect the sporting project from boardroom politics?',
      interrupt: true,
      clubId: 'barcelona',
      category: 'event',
      choices: [
        {
          id: 'align',
          label: 'Align with the president\'s galáctico answer',
          successProbability: 0.6,
          onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'memory', tag: 'board', text: 'Backed the new president\'s marquee push.' }],
          onFailure: [{ kind: 'memory', tag: 'board', text: 'The president expected more ambition.' }],
        },
        {
          id: 'protect-project',
          label: 'Protect the sporting project',
          successProbability: 0.45,
          onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'memory', tag: 'board', text: 'Won room to build on football, not headlines.' }],
          onFailure: [{ kind: 'boardPatience', amount: -8 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'board', text: 'The boardroom sets the direction without you.' }],
      memoryTags: ['board', 'president'],
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

// ── Manchester City, 2013 (the moneyed champions) storyline pack ─────────────
const MAN_CITY_2013_PACK: ScriptedEvent[] = [
  {
    id: 'aguero-fitness',
    date: '2014-02',
    requires: (s) => playerAt(s, 'cur_aguero', 'man_city') && s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:aguero-fitness',
      title: 'Sergio Agüero\'s hamstrings are a worry in the run-in',
      description: 'Your talisman is your title, but his hamstrings keep tightening. Wrap him up for the decisive games, or lean on his goals now?',
      interrupt: true, clubId: 'man_city', category: 'event',
      choices: [
        { id: 'manage', label: 'Manage his minutes to keep him fit', successProbability: 0.6, onSuccess: [{ kind: 'restPlayer', playerId: 'cur_aguero', months: 1, amount: -8 }, { kind: 'memory', tag: 'load', text: 'Protected Agüero for the title run-in.' }], onFailure: [{ kind: 'morale', playerId: 'cur_aguero', amount: -4 }] },
        { id: 'ride', label: 'Play him — you need the goals', successProbability: 0.45, onSuccess: [{ kind: 'morale', playerId: 'cur_aguero', amount: 6 }], onFailure: [{ kind: 'reinjure', playerId: 'cur_aguero', months: 2 }] },
      ],
      falloutIfIgnored: [{ kind: 'injuryProneness', playerId: 'cur_aguero', amount: 6 }],
      memoryTags: ['load', 'cur_aguero'],
    }),
  },
  {
    id: 'yaya-unrest',
    date: '2014-06',
    requires: (s) => playerAt(s, 'cur_yayatoure', 'man_city') && s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:yaya-unrest',
      title: 'Yaya Touré\'s agent is stirring up trouble',
      description: 'Your midfield engine feels unloved — his agent is airing bizarre grievances in public and hinting at a move. Placate him, or hold the line?',
      interrupt: true, clubId: 'man_city', category: 'event',
      choices: [
        { id: 'placate', label: 'Give him the respect (and wages) he wants', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_yayatoure', amount: 8 }, { kind: 'agitation', playerId: 'cur_yayatoure', amount: -18 }, { kind: 'money', clubId: 'man_city', amount: -5_000_000 }], onFailure: [{ kind: 'agitation', playerId: 'cur_yayatoure', amount: 10 }] },
        { id: 'hold', label: 'Refuse to indulge the agent', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 4 }], onFailure: [{ kind: 'agitation', playerId: 'cur_yayatoure', amount: 16 }, { kind: 'morale', playerId: 'cur_yayatoure', amount: -6 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_yayatoure', amount: 14 }],
      memoryTags: ['transfer-saga', 'cur_yayatoure'],
    }),
  },
  {
    id: 'city-ffp',
    date: '2014-05',
    requires: (s) => s.playerClub === 'man_city',
    build: () => ({
      id: 'scripted:city-ffp',
      title: 'UEFA hit the club with Financial Fair Play sanctions',
      description: 'Your spending has drawn a fine and a squad-size restriction for Europe. Trim the wage bill to comply, or fight the ruling and spend on regardless?',
      interrupt: true, clubId: 'man_city', category: 'event',
      choices: [
        { id: 'comply', label: 'Comply — trim and build smarter', successProbability: 0.65, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'board', text: 'Reined the spending in to satisfy FFP.' }], onFailure: [{ kind: 'memory', tag: 'board', text: 'Compliance costs you squad depth.' }] },
        { id: 'defy', label: 'Fight it and keep spending', successProbability: 0.4, onSuccess: [{ kind: 'money', clubId: 'man_city', amount: 15_000_000 }, { kind: 'memory', tag: 'board', text: 'Backed the owners against UEFA.' }], onFailure: [{ kind: 'boardPatience', amount: -6 }] },
      ],
      falloutIfIgnored: [{ kind: 'memory', tag: 'board', text: 'The FFP sanctions bite unmanaged.' }],
      memoryTags: ['board', 'ffp'],
    }),
  },
];

// ── Chelsea, 2013 (Mourinho's return) storyline pack ─────────────────────────
const CHELSEA_2013_PACK: ScriptedEvent[] = [
  {
    id: 'mourinho-return',
    date: '2013-08',
    requires: (s) => s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:mourinho-return',
      title: 'The Special One is back — and wants control',
      description: 'Mourinho has returned as "the Happy One", but he wants the squad built his way — physical, pragmatic, win-first. Give him full control of the rebuild, or keep the club\'s technical project?',
      interrupt: true, clubId: 'chelsea', category: 'event',
      choices: [
        { id: 'his-way', label: 'Hand him full control', successProbability: 0.7, onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'manager', text: 'Backed Mourinho\'s rebuild fully.' }], onFailure: [{ kind: 'memory', tag: 'manager', text: 'The manager wants more say still.' }] },
        { id: 'balance', label: 'Keep the possession project', successProbability: 0.4, onSuccess: [{ kind: 'boardPatience', amount: 3 }], onFailure: [{ kind: 'managerRelationship', amount: -8 }] },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: -4 }],
      memoryTags: ['manager', 'mourinho'],
    }),
  },
  {
    id: 'mata-frozen',
    date: '2013-12',
    requires: (s) => playerAt(s, 'cur_mata', 'chelsea') && s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:mata-frozen',
      title: 'Mourinho has frozen out Juan Mata',
      description: 'Your two-time Player of the Year does not fit the manager\'s system and has barely played. United are circling with a club-record bid. Sell the fans\' favourite, or overrule the manager and keep him?',
      interrupt: true, clubId: 'chelsea', category: 'event',
      choices: [
        { id: 'sell', label: 'Cash in — sell him to United', successProbability: 0.85, onSuccess: [{ kind: 'transferOut', playerId: 'cur_mata', clubId: 'man_utd', amount: 37_000_000 }, { kind: 'managerRelationship', amount: 5 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Mata to United — as reality, at a record fee.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_mata', amount: 12 }] },
        { id: 'keep', label: 'Overrule Mourinho and keep him', successProbability: 0.45, onSuccess: [{ kind: 'morale', playerId: 'cur_mata', amount: 10 }, { kind: 'managerRelationship', amount: -8 }, { kind: 'memory', tag: 'transfer-saga', text: 'Kept Mata against the manager\'s wishes — a divergence.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_mata', amount: 14 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_mata', amount: 14 }, { kind: 'morale', playerId: 'cur_mata', amount: -6 }],
      memoryTags: ['transfer-saga', 'cur_mata'],
    }),
  },
  {
    id: 'torres-problem',
    date: '2013-11',
    requires: (s) => playerAt(s, 'cur_torres', 'chelsea') && s.playerClub === 'chelsea',
    build: () => ({
      id: 'scripted:torres-problem',
      title: 'The £50m striker still is not firing',
      description: 'Fernando Torres has never rediscovered his Anfield form, and the manager does not trust him. Persist with the investment, or accept you need a new number nine?',
      interrupt: true, clubId: 'chelsea', category: 'event',
      choices: [
        { id: 'persist', label: 'Back him to come good', successProbability: 0.4, onSuccess: [{ kind: 'morale', playerId: 'cur_torres', amount: 10 }, { kind: 'memory', tag: 'selection', text: 'Kept faith with Torres.' }], onFailure: [{ kind: 'morale', playerId: 'cur_torres', amount: -6 }] },
        { id: 'move-on', label: 'Move him on and buy a striker', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 3 }, { kind: 'agitation', playerId: 'cur_torres', amount: 12 }, { kind: 'memory', tag: 'selection', text: 'Accepted the Torres gamble had failed.' }], onFailure: [{ kind: 'money', clubId: 'chelsea', amount: -3_000_000 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', playerId: 'cur_torres', amount: -5 }],
      memoryTags: ['selection', 'cur_torres'],
    }),
  },
];

// ── Liverpool, 2013 (the Suárez near-miss) storyline pack ────────────────────
const LIVERPOOL_2013_PACK: ScriptedEvent[] = [
  {
    id: 'suarez-suitors',
    date: '2013-08',
    requires: (s) => playerAt(s, 'cur_suarez', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:suarez-suitors',
      title: 'Arsenal are testing Luis Suárez\'s release clause',
      description: 'Your brilliant, volatile striker wants Champions League football and Arsenal have lodged a cheeky bid. Convince him the project is here, or cash in on a player who keeps courting controversy?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'keep', label: 'Refuse to sell and build around him', successProbability: 0.6, onSuccess: [{ kind: 'morale', playerId: 'cur_suarez', amount: 10 }, { kind: 'agitation', playerId: 'cur_suarez', amount: -20 }, { kind: 'memory', tag: 'transfer-saga', text: 'Kept Suárez — the near-miss title charge is on, as reality.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_suarez', amount: 12 }] },
        { id: 'sell', label: 'Cash in while his stock is high', successProbability: 0.8, onSuccess: [{ kind: 'transferOut', playerId: 'cur_suarez', clubId: 'arsenal', amount: 40_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Suárez to a rival — a divergence from the title tilt.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_suarez', amount: 15 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_suarez', amount: 14 }],
      memoryTags: ['transfer-saga', 'cur_suarez'],
    }),
  },
  {
    id: 'title-run-in-2014',
    date: '2014-04',
    requires: (s) => playerAt(s, 'cur_gerrard2', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:title-run-in-2014',
      title: 'The title is in your hands with weeks to go',
      description: 'Anfield is dreaming of a first title in 24 years. The nerves are jangling and one slip could undo it all. How do you steady the run-in?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'calm', label: 'Take the pressure off the players', successProbability: 0.55, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 6 }, { kind: 'memory', tag: 'title-race', text: 'Kept the players calm — the dream stays alive.' }], onFailure: [{ kind: 'morale', clubId: 'liverpool', amount: -5 }, { kind: 'memory', tag: 'title-race', text: 'The nerves told — echoes of the slip.' }] },
        { id: 'attack', label: 'Tell them to go for the jugular', successProbability: 0.5, onSuccess: [{ kind: 'morale', clubId: 'liverpool', amount: 8 }], onFailure: [{ kind: 'fanTrust', amount: -5, text: 'The gung-ho approach backfires.' }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'liverpool', amount: -4 }],
      memoryTags: ['title-race', 'cur_gerrard2'],
    }),
  },
  {
    id: 'sturridge-fitness',
    date: '2013-12',
    requires: (s) => playerAt(s, 'cur_sturridge', 'liverpool') && s.playerClub === 'liverpool',
    build: () => ({
      id: 'scripted:sturridge-fitness',
      title: 'Daniel Sturridge keeps breaking down',
      description: 'The other half of your SAS strike force is a goal machine — when his body allows it. Manage him carefully, or ride the hot streak while it lasts?',
      interrupt: true, clubId: 'liverpool', category: 'event',
      choices: [
        { id: 'manage', label: 'Protect him for the long run', successProbability: 0.6, onSuccess: [{ kind: 'restPlayer', playerId: 'cur_sturridge', months: 1, amount: -8 }], onFailure: [{ kind: 'morale', playerId: 'cur_sturridge', amount: -4 }] },
        { id: 'ride', label: 'Ride the goals while they flow', successProbability: 0.45, onSuccess: [{ kind: 'morale', playerId: 'cur_sturridge', amount: 6 }], onFailure: [{ kind: 'reinjure', playerId: 'cur_sturridge', months: 2 }] },
      ],
      falloutIfIgnored: [{ kind: 'injuryProneness', playerId: 'cur_sturridge', amount: 8 }],
      memoryTags: ['load', 'cur_sturridge'],
    }),
  },
];

// ── Arsenal, 2013 (ending the drought) storyline pack ────────────────────────
const ARSENAL_2013_PACK: ScriptedEvent[] = [
  {
    id: 'ozil-statement',
    date: '2013-09',
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:ozil-statement',
      title: 'A club-record signing is there for the taking',
      description: 'Deadline day, and a world-class playmaker (Özil) is suddenly available. Break the club\'s transfer record to make a statement of ambition, or bank the new-stadium money as usual?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'splash', label: 'Break the record — end the frugality', successProbability: 0.75, onSuccess: [{ kind: 'boardPatience', amount: 6 }, { kind: 'fanTrust', amount: 8, text: 'A marquee signing electrifies the Emirates.' }, { kind: 'memory', tag: 'transfer', text: 'Made the statement signing — as reality.' }], onFailure: [{ kind: 'money', clubId: 'arsenal', amount: -5_000_000 }] },
        { id: 'thrifty', label: 'Bank the money, as ever', successProbability: 0.5, onSuccess: [{ kind: 'money', clubId: 'arsenal', amount: 10_000_000 }, { kind: 'memory', tag: 'transfer', text: 'Played it safe again — the fans grumble.' }], onFailure: [{ kind: 'fanTrust', amount: -8, text: 'Another quiet window tests the fans\' patience.' }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -5, text: 'Dithering costs you the marquee target.' }],
      memoryTags: ['transfer', 'ozil'],
    }),
  },
  {
    id: 'arsenal-injury-crisis',
    date: '2014-01',
    requires: (s) => playerAt(s, 'cur_walcott', 'arsenal') && s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:arsenal-injury-crisis',
      title: 'The injuries are piling up again',
      description: 'The perennial Arsenal problem: the treatment room is full and Walcott has just gone down with a serious knee injury. Push the fit players through, or rotate and protect them?',
      interrupt: true, clubId: 'arsenal', category: 'injury',
      choices: [
        { id: 'rotate', label: 'Rotate to protect the survivors', successProbability: 0.6, onSuccess: [{ kind: 'memory', tag: 'load', text: 'Managed the squad through the injury crisis.' }, { kind: 'boardPatience', amount: 2 }], onFailure: [{ kind: 'morale', clubId: 'arsenal', amount: -3 }] },
        { id: 'push', label: 'Push the fit men through it', successProbability: 0.4, onSuccess: [{ kind: 'morale', clubId: 'arsenal', amount: 5 }], onFailure: [{ kind: 'memory', tag: 'load', text: 'Flogging the fit few deepens the crisis.' }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'arsenal', amount: -4 }],
      memoryTags: ['load', 'cur_walcott'],
    }),
  },
  {
    id: 'fa-cup-drought',
    date: '2014-04',
    requires: (s) => s.playerClub === 'arsenal',
    build: () => ({
      id: 'scripted:fa-cup-drought',
      title: 'A cup run could end nine years without a trophy',
      description: 'The club has not won a thing since 2005 and a cup final is in sight. Throw everything at ending the drought, or protect the top-four finish that pays the bills?',
      interrupt: true, clubId: 'arsenal', category: 'event',
      choices: [
        { id: 'go-for-it', label: 'Go all-in on the trophy', successProbability: 0.55, onSuccess: [{ kind: 'fanTrust', amount: 10, text: 'Ending the drought would change the mood entirely.' }, { kind: 'morale', clubId: 'arsenal', amount: 6 }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
        { id: 'top-four', label: 'Prioritise the top-four money', successProbability: 0.6, onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'board', text: 'Chose the safe top-four over the trophy gamble.' }], onFailure: [{ kind: 'fanTrust', amount: -6, text: '"Same old Arsenal", say the fans.' }] },
      ],
      falloutIfIgnored: [{ kind: 'fanTrust', amount: -4, text: 'The drought grinds on.' }],
      memoryTags: ['board', 'trophy'],
    }),
  },
];

// ── VfL Wolfsburg, 2009 (defending the miracle) storyline pack ───────────────
const WOLFSBURG_2009_PACK: ScriptedEvent[] = [
  {
    id: 'wolfsburg-title-defence',
    date: '2009-09',
    requires: (s) => s.playerClub === 'wolfsburg',
    build: () => ({
      id: 'scripted:wolfsburg-title-defence',
      title: 'Can the champions do it again?',
      description: 'You are the surprise champions of Germany, but the doubters call it a fluke and a title hangover is setting in. Demand the same all-out attacking football, or shore things up to defend what you have?',
      interrupt: true, clubId: 'wolfsburg', category: 'event',
      choices: [
        { id: 'attack', label: 'Keep the handbrake off — attack again', successProbability: 0.5, onSuccess: [{ kind: 'morale', clubId: 'wolfsburg', amount: 6 }, { kind: 'memory', tag: 'tactics', text: 'Backed the cavalier approach that won the title.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
        { id: 'solidify', label: 'Add steel and control', successProbability: 0.55, onSuccess: [{ kind: 'boardPatience', amount: 4 }], onFailure: [{ kind: 'morale', clubId: 'wolfsburg', amount: -4 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: 'wolfsburg', amount: -4 }],
      memoryTags: ['tactics', 'title-defence'],
    }),
  },
  {
    id: 'dzeko-suitors',
    date: '2010-06',
    requires: (s) => playerAt(s, 'cur_dzeko09', 'wolfsburg') && s.playerClub === 'wolfsburg',
    build: () => ({
      id: 'scripted:dzeko-suitors',
      title: 'The giants have come for Edin Džeko',
      description: 'Your title-winning striker\'s goals have Europe\'s richest clubs calling with life-changing money. Cash in on a huge fee for a smaller club, or build on and keep your star?',
      interrupt: true, clubId: 'wolfsburg', category: 'event',
      choices: [
        { id: 'sell', label: 'Take the money — it is too good to refuse', successProbability: 0.85, onSuccess: [{ kind: 'transferOut', playerId: 'cur_dzeko09', clubId: 'man_city', amount: 27_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Džeko to the money — as reality.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_dzeko09', amount: 12 }] },
        { id: 'keep', label: 'Keep him and stay a force', successProbability: 0.45, onSuccess: [{ kind: 'morale', playerId: 'cur_dzeko09', amount: 8 }, { kind: 'memory', tag: 'transfer-saga', text: 'Kept Džeko — a divergence a small club rarely manages.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_dzeko09', amount: 15 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_dzeko09', amount: 14 }],
      memoryTags: ['transfer-saga', 'cur_dzeko09'],
    }),
  },
];

// ── Borussia Dortmund, 2009 (Klopp's young guns) storyline pack ──────────────
const DORTMUND_2009_PACK: ScriptedEvent[] = [
  {
    id: 'klopp-project',
    date: '2009-09',
    requires: (s) => s.playerClub === 'dortmund',
    build: () => ({
      id: 'scripted:klopp-project',
      title: 'Trust the young project, or spend to compete now?',
      description: 'The manager wants to build a high-energy side from the cheapest young talent in Europe — but the board and fans are impatient for results. Commit to the long game, or demand signings now?',
      interrupt: true, clubId: 'dortmund', category: 'event',
      choices: [
        { id: 'long-game', label: 'Commit to the youth project', successProbability: 0.6, onSuccess: [{ kind: 'managerRelationship', amount: 8 }, { kind: 'memory', tag: 'development', text: 'Backed Klopp\'s young project — the making of a champion.' }], onFailure: [{ kind: 'boardPatience', amount: -4 }] },
        { id: 'spend', label: 'Demand experienced signings now', successProbability: 0.45, onSuccess: [{ kind: 'boardPatience', amount: 4 }], onFailure: [{ kind: 'managerRelationship', amount: -8 }] },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: -4 }],
      memoryTags: ['development', 'klopp'],
    }),
  },
  {
    id: 'sahin-madrid',
    date: '2011-06',
    requires: (s) => playerAt(s, 'cur_sahin09', 'dortmund') && s.playerClub === 'dortmund',
    build: () => ({
      id: 'scripted:sahin-madrid',
      title: 'Real Madrid want your young playmaker',
      description: 'Nuri Şahin has been the brain of your title-winning side, and now Real Madrid are calling. The fee would fund a rebuild, but losing him hurts. Cash in, or fight to keep the project together?',
      interrupt: true, clubId: 'dortmund', category: 'event',
      choices: [
        { id: 'sell', label: 'Sell to Madrid and reinvest', successProbability: 0.85, onSuccess: [{ kind: 'transferOut', playerId: 'cur_sahin09', clubId: 'real_madrid', amount: 10_000_000 }, { kind: 'memory', tag: 'transfer-saga', text: 'Sold Şahin to Madrid — as reality.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_sahin09', amount: 12 }] },
        { id: 'keep', label: 'Keep the heartbeat of the side', successProbability: 0.45, onSuccess: [{ kind: 'morale', playerId: 'cur_sahin09', amount: 8 }, { kind: 'memory', tag: 'transfer-saga', text: 'Kept Şahin — the project stays whole, a divergence.' }], onFailure: [{ kind: 'agitation', playerId: 'cur_sahin09', amount: 14 }] },
      ],
      falloutIfIgnored: [{ kind: 'agitation', playerId: 'cur_sahin09', amount: 12 }],
      memoryTags: ['transfer-saga', 'cur_sahin09'],
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

/** Scripted historical storylines by scenario. man-utd-1999 is the calibration
 *  pack; the others fire only in their own start point (no calibration impact). */
const SCRIPTED_PACKS: Record<string, ScriptedEvent[]> = {
  'man-utd-1999': MAN_UTD_1999_PACK,
  'newcastle-1995': NEWCASTLE_1995_PACK,
  'spurs-2013': SPURS_2013_PACK,
  'man-utd-2013': MAN_UTD_2013_PACK,
  'man-city-2013': MAN_CITY_2013_PACK,
  'chelsea-2013': CHELSEA_2013_PACK,
  'liverpool-2013': LIVERPOOL_2013_PACK,
  'arsenal-2013': ARSENAL_2013_PACK,
  'real-madrid-2000': REAL_MADRID_2000_PACK,
  'arsenal-2004': ARSENAL_2004_PACK,
  'liverpool-2001': LIVERPOOL_2001_PACK,
  'bayern-2009': BAYERN_2009_PACK,
  'wolfsburg-2009': WOLFSBURG_2009_PACK,
  'dortmund-2009': DORTMUND_2009_PACK,
  'barcelona-1999': BARCELONA_1999_PACK,
  'inter-1998': INTER_1998_PACK,
  'chelsea-2003': CHELSEA_2003_PACK,
  'arsenal-1996': ARSENAL_1996_PACK,
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
