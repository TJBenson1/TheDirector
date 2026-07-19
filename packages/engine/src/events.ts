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
import { valuePlayer } from './finance.js';

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
          p.wage = Math.round(p.wage * 1.1);
          p.letLapse = false; // a renewal reverses any decision to let him walk
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

const ALL_SCRIPTED: ScriptedEvent[] = [...MAN_UTD_1999_PACK, ...LIVERPOOL_2001_PACK, ...ARSENAL_2004_PACK];

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
