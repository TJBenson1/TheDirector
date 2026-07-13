/**
 * The head coach — hire, fire, survive & woo (internal-friction §, "The Director").
 *
 * The player IS the Director (sporting director / owner). The head coach is a
 * hired agent with his OWN job security (`standing`), which erodes FASTER than
 * the board's patience with the Director. That difference is the whole mechanic:
 *
 *   • A failing coach is the FIRST to go — the board pushes to sack him long
 *     before it turns on the Director (a lower threshold, checked every season).
 *   • Sacking the coach is a LIGHTNING ROD: it absorbs blame and buys the
 *     Director back some patience — the classic "new manager bounce" that saves
 *     the man upstairs. It is worth LESS when the Director appointed him himself
 *     (you own that hire; you can't blame it on your predecessor).
 *   • The Director's own dismissal stays RARE (board.ts), on a higher threshold.
 *     But it can happen WITHOUT a coach being sacked, in two rarer ways: the
 *     board decides the Director's whole STRATEGY is wrong, or a powerful,
 *     estranged manager wins a boardroom power struggle and pushes him out.
 *   • Wooing works here too: a marquee coach must be COURTED ("speak to his
 *     people") before he'll take the job — a cold offer to a big name is snubbed.
 *
 * Politics/narrative layer only for now: the coach does not (yet) move match
 * results, so this is calibration-neutral on the passive path.
 */

import type { Decision, GameState, ManagerState } from './types.js';
import { Rng, hashStringToU32 } from './rng.js';
import { logEvent } from './eventLog.js';
import { appendMemory } from './memory.js';
import { standingsOrder } from './season.js';

/** The real head coach each scenario inherits at kickoff (reality-default). */
const REAL_COACHES: Record<string, { name: string; reputation: number }> = {
  'man-utd-1999': { name: 'Alex Ferguson', reputation: 94 },
  'liverpool-2001': { name: 'Gérard Houllier', reputation: 76 },
  'arsenal-2004': { name: 'Arsène Wenger', reputation: 90 },
  'arsenal-1996': { name: 'Arsène Wenger', reputation: 80 },
  'bayern-2009': { name: 'Louis van Gaal', reputation: 85 },
  'barcelona-1999': { name: 'Louis van Gaal', reputation: 82 },
  'man-utd-2013': { name: 'David Moyes', reputation: 68 },
  'chelsea-2003': { name: 'Claudio Ranieri', reputation: 74 },
  'real-madrid-2000': { name: 'Vicente del Bosque', reputation: 82 },
  'inter-1998': { name: 'Gigi Simoni', reputation: 66 },
};

/** A pool of coaches available to hire (era-agnostic — real managers who moved
 *  clubs across this window). The shortlist is drawn from here, ranked by fit. */
const COACH_POOL: Array<{ name: string; reputation: number }> = [
  { name: 'Fabio Capello', reputation: 90 },
  { name: 'Marcello Lippi', reputation: 88 },
  { name: 'Carlo Ancelotti', reputation: 88 },
  { name: 'Rafael Benítez', reputation: 82 },
  { name: 'Guus Hiddink', reputation: 82 },
  { name: 'Sven-Göran Eriksson', reputation: 78 },
  { name: 'Martin O’Neill', reputation: 74 },
  { name: 'Gordon Strachan', reputation: 68 },
  { name: 'Alan Curbishley', reputation: 66 },
  { name: 'Roy Hodgson', reputation: 70 },
  { name: 'Sam Allardyce', reputation: 68 },
  { name: 'Steve McClaren', reputation: 66 },
];

/** The manager the world starts with — the real coach, inherited (not the
 *  Director's own appointment). Falls back to a generic incumbent scaled to the
 *  club's stature for scenarios without a curated coach. */
export function initialManager(scenarioId: string, clubPrestige: number): ManagerState {
  const real = REAL_COACHES[scenarioId];
  return {
    identity: real?.name ?? 'the incumbent manager',
    relationshipWithUser: 60,
    reputation: real?.reputation ?? Math.max(45, clubPrestige - 8),
    standing: 62,
    appointedByUser: false,
    seasonsInCharge: 0,
  };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0]!;
}

function stateRng(state: GameState, label: string): Rng {
  return new Rng(state.meta.rngState).fork(`${label}:${state.clock.date}`);
}

/**
 * Review the head coach against the same season signal the board uses on the
 * Director — but on a LOWER threshold and a STEEPER penalty, so the coach's
 * standing collapses first. When it bottoms out the board pushes to sack him:
 * a decision offered to the DIRECTOR (back him, or wield the axe). Called at the
 * rollover once a champion is crowned, right after reviewBoard.
 */
export function reviewManager(state: GameState, rng: Rng): void {
  if (state.board.dismissed) return;
  const mgr = state.managerRelations;
  const league = state.leagues[state.clubs[state.playerClub]?.leagueId ?? ''];
  if (!league || league.titleHistory.length === 0) return;

  const order = standingsOrder(league);
  const pos = order.indexOf(state.playerClub);
  if (pos < 0) return;
  const finish = pos + 1;
  const wonTitle = league.titleHistory[league.titleHistory.length - 1]!.championId === state.playerClub;
  const expected = state.board.expectedFinish;

  let delta: number;
  if (wonTitle) delta = 12;
  else if (finish <= expected) delta = 6;
  else delta = -(finish - expected) * 11; // steeper than the Director's −9

  mgr.standing = Math.max(0, Math.min(100, mgr.standing + delta));
  mgr.seasonsInCharge += 1;

  // Board pressure to sack the coach — a lower bar than Director dismissal, so
  // the manager is the first head to roll. Only surfaced when he's genuinely
  // failing (standing < 30), so a winning side never triggers it.
  if (mgr.standing < 30 && !hasPendingManagerDecision(state)) {
    logEvent(state, {
      category: 'system',
      code: 'manager.pressure',
      message: `The board is losing faith in ${mgr.identity} after a ${finish}${ordinal(finish)}-place finish (expected top ${expected}).`,
      data: { finish, standing: Math.round(mgr.standing) },
    });
    // Relief is bigger the closer the DIRECTOR is to the edge — sacking the coach
    // is most valuable exactly when it's your own job on the line.
    const relief = Math.round(18 + Math.max(0, 45 - state.board.patience) * 0.3);
    state.pendingDecisions.push(buildSackPressureDecision(state, finish, relief));
  }
}

function hasPendingManagerDecision(state: GameState): boolean {
  return state.pendingDecisions.some((d) => d.id.startsWith('manager-') || d.id.startsWith('hire-'));
}

/** The board wants the coach gone. FIRST choice (reality-default for the passive
 *  bot) is to BACK him — so calibration is unperturbed; the axe is the opt-in. */
function buildSackPressureDecision(state: GameState, finish: number, relief: number): Decision {
  const mgr = state.managerRelations;
  return {
    id: `manager-pressure:${state.clock.date}`,
    title: `The board wants ${mgr.identity} sacked`,
    description: `A ${finish}${ordinal(finish)}-place finish has the board pushing to dismiss ${mgr.identity}. Back him and take the heat yourself, or wield the axe — a fresh appointment would buy YOU breathing room with the board.`,
    interrupt: true,
    clubId: state.playerClub,
    category: 'system',
    choices: [
      // choices[0] = reality-default: keep him. Small cost to the Director for
      // spending credibility to protect a failing coach.
      { id: 'back', label: `Back ${mgr.identity}`, onSuccess: [{ kind: 'boardPatience', amount: -3 }, { kind: 'managerStanding', amount: 8 }, { kind: 'managerRelationship', amount: 6 }] },
      { id: 'sack', label: 'Sack him (buys you patience)', onSuccess: [{ kind: 'sackManager', amount: relief, text: 'board pressure' }] },
    ],
    // Ignore it and the board's will prevails — he goes, but you get less credit
    // for a sacking you didn't own.
    falloutIfIgnored: [{ kind: 'sackManager', amount: Math.round(relief * 0.6), text: 'board pressure (unopposed)' }],
    memoryTags: ['manager'],
  };
}

/**
 * The Director proactively dismisses the head coach (a user action, any time).
 * Sacking a coach who is doing WELL costs the Director credibility with the
 * board (a gamble); sacking a failing one is accepted and buys a little relief.
 * Either way it opens the hire shortlist. Returns the relief applied.
 */
export function directorSackManager(state: GameState): { ok: boolean; reason: string } {
  if (state.board.dismissed) return { ok: false, reason: 'You are no longer in post.' };
  const mgr = state.managerRelations;
  // A well-regarded coach: sacking him is a risk the board dislikes. A failing
  // one: the board is relieved.
  const relief = mgr.standing >= 55 ? -8 : Math.round(10 + (30 - Math.min(30, mgr.standing)));
  performSack(state, relief, 'the Director');
  return { ok: true, reason: `${mgr.identity} dismissed.` };
}

/** Carry out a dismissal: log it, apply the Director-patience effect (scaled down
 *  when it was the Director's own appointment), and open the hire shortlist. */
export function performSack(state: GameState, directorRelief: number, initiatedBy: string): void {
  const mgr = state.managerRelations;
  const oldName = mgr.identity;
  // Blame only deflects onto someone else's hire. Sack your OWN appointment and
  // the board still sees your fingerprints on it — half the relief.
  const applied = directorRelief > 0 && mgr.appointedByUser ? Math.round(directorRelief * 0.4) : directorRelief;
  state.board.patience = Math.max(0, Math.min(100, state.board.patience + applied));

  logEvent(state, {
    category: 'system',
    code: 'manager.sacked',
    message: `${oldName} has been dismissed by ${initiatedBy}.` + (applied > 0 ? ` The board gives the Director the benefit of the doubt (+${applied} patience).` : applied < 0 ? ` The board is unconvinced (${applied} patience).` : ''),
    data: { manager: oldName, initiatedBy, patienceDelta: applied, wasOwnHire: mgr.appointedByUser },
  });
  appendMemory(state, 'manager', `Sacked ${oldName}.`);

  // A caretaker takes charge until the Director appoints a successor.
  mgr.identity = 'caretaker manager';
  mgr.reputation = Math.max(40, mgr.reputation - 25);
  mgr.standing = 55;
  mgr.appointedByUser = false;
  mgr.seasonsInCharge = 0;
  mgr.relationshipWithUser = 55;

  pushHireDecision(state);
}

/** A shortlist of hireable coaches, ranked by fit to the club (deterministic per
 *  club + date). The top name is a stretch (a marquee who must be WOOED); the
 *  others are attainable. */
export function managerShortlist(state: GameState): Array<{ name: string; reputation: number; marquee: boolean }> {
  const club = state.clubs[state.playerClub];
  const prestige = club?.prestige ?? 70;
  const seed = hashStringToU32(`${state.playerClub}:${state.clock.date}`);
  // Rank the pool by closeness to what the club can plausibly attract, with a
  // deterministic jitter so the same club at different times sees different names.
  const ranked = COACH_POOL
    .filter((c) => c.name !== state.managerRelations.identity)
    .map((c, i) => ({ c, key: Math.abs(c.reputation - (prestige - 2)) + ((seed >> (i % 16)) & 3) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.c);
  const attainable = ranked.filter((c) => c.reputation <= prestige + 2).slice(0, 2);
  const marquee = ranked.find((c) => c.reputation > prestige + 2);
  const out: Array<{ name: string; reputation: number; marquee: boolean }> = [];
  if (marquee) out.push({ ...marquee, marquee: true });
  for (const c of attainable) out.push({ ...c, marquee: false });
  return out.slice(0, 3);
}

/** How courted a coaching target is (wooing reuses the pursuit map, namespaced). */
function managerPursuitKey(name: string): string {
  return `mgr:${name}`;
}

/** "Speak to his people": court a coach so a marquee name will take the job. */
export function courtManager(state: GameState, name: string): { ok: boolean; pursuit: number; reason: string } {
  const key = managerPursuitKey(name);
  const next = Math.min(100, (state.pursuit[key] ?? 0) + 30);
  state.pursuit[key] = next;
  logEvent(state, {
    category: 'system',
    code: 'manager.court',
    message: `Your people have opened talks with ${name} (interest ${next}/100).`,
    data: { name, pursuit: next },
  });
  return { ok: true, pursuit: next, reason: `Courting ${name} (${next}/100).` };
}

/** Does a marquee candidate say yes? A big name needs COURTING first — a cold
 *  approach to a coach out of the club's reach is snubbed. Attainable names
 *  always accept. */
export function willManagerJoin(state: GameState, name: string, reputation: number, marquee: boolean): boolean {
  if (!marquee) return true;
  const club = state.clubs[state.playerClub];
  const prestige = club?.prestige ?? 70;
  const pursuit = state.pursuit[managerPursuitKey(name)] ?? 0;
  // Pull rises with the club's stature and with how hard you've courted him.
  return prestige + pursuit * 0.5 >= reputation + 4;
}

/** Offer the Director the hire shortlist. FIRST choice is the top ATTAINABLE
 *  name (reality-default: a clean appointment), so the passive bot never stalls. */
export function pushHireDecision(state: GameState): void {
  const shortlist = managerShortlist(state);
  if (shortlist.length === 0) return;
  const attainableFirst = [...shortlist].sort((a, b) => Number(a.marquee) - Number(b.marquee));
  state.pendingDecisions.push({
    id: `hire-manager:${state.clock.date}`,
    title: 'Appoint a new head coach',
    description: 'Choose your next manager. A marquee name may need courting first ("speak to his people") — approach him cold and he may snub you.',
    interrupt: true,
    clubId: state.playerClub,
    category: 'system',
    choices: attainableFirst.map((c) => ({
      id: `appoint:${c.name}`,
      label: c.marquee ? `Appoint ${c.name} (marquee — needs wooing)` : `Appoint ${c.name}`,
      onSuccess: [{ kind: 'appointManager', text: c.name, amount: c.reputation, tag: c.marquee ? 'marquee' : 'attainable' }],
    })),
    falloutIfIgnored: [{ kind: 'appointManager', text: attainableFirst[0]!.name, amount: attainableFirst[0]!.reputation, tag: 'attainable' }],
    memoryTags: ['manager'],
  });
}

/** Install a coach the Director has chosen (consequence handler). A marquee name
 *  who hasn't been wooed enough snubs the job → a caretaker stays instead. */
export function appointManager(state: GameState, name: string, reputation: number, marquee: boolean): void {
  const mgr = state.managerRelations;
  if (!willManagerJoin(state, name, reputation, marquee)) {
    logEvent(state, {
      category: 'system',
      code: 'manager.snubbed',
      message: `${name} turns down the job — he wasn't courted enough to leave what he had.`,
      data: { name },
    });
    appendMemory(state, 'manager', `${name} snubbed the approach.`);
    return; // caretaker remains; the Director can try again
  }
  delete state.pursuit[managerPursuitKey(name)];
  mgr.identity = name;
  mgr.reputation = reputation;
  mgr.relationshipWithUser = 62;
  mgr.standing = 60;
  mgr.appointedByUser = true;
  mgr.seasonsInCharge = 0;
  logEvent(state, {
    category: 'system',
    code: 'manager.appointed',
    message: `${name} appointed as head coach (reputation ${reputation}).`,
    data: { name, reputation },
  });
  appendMemory(state, 'manager', `Appointed ${name}.`);
}

/**
 * The RARE ways a Director loses the job WITHOUT sacking his coach (checked at
 * the rollover, after reviewBoard). Both are gated to already-shaky situations
 * so a thriving Director is safe and the passive baseline barely moves:
 *
 *   (a) STRATEGY: the board concludes the Director's whole approach is wrong —
 *       a direct dismissal even when he still has a coach in place.
 *   (b) COUP: a powerful, estranged head coach the board rates more highly than
 *       the Director wins the boardroom and pushes him out.
 */
export function reviewDirectorStrategy(state: GameState, rng: Rng): void {
  if (state.board.dismissed) return;
  const mgr = state.managerRelations;
  const patience = state.board.patience;

  // (a) Strategy rejection — only when the board is already unhappy.
  if (patience < 42 && rng.chance(0.07)) {
    state.board.dismissed = true;
    logEvent(state, {
      category: 'system',
      code: 'board.strategy',
      message: `The board has lost faith in your STRATEGY, not just results — you are dismissed as Director.`,
      data: { patience: Math.round(patience) },
    });
    return;
  }

  // (b) A powerful manager pushes the Director out — needs a big-name coach who
  // has fallen out with the Director and outranks him in the board's eyes.
  if (mgr.reputation >= 84 && mgr.relationshipWithUser < 28 && patience < 58 && rng.chance(0.06)) {
    state.board.dismissed = true;
    logEvent(state, {
      category: 'system',
      code: 'board.managercoup',
      message: `${mgr.identity} has won the boardroom power struggle — the board backs the manager and dismisses the Director.`,
      data: { manager: mgr.identity, reputation: mgr.reputation, relationship: Math.round(mgr.relationshipWithUser) },
    });
  }
}
