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

import type { Decision, GameState, ManagerState, ManagerStyle, PlayerId, Position } from './types.js';
import { Rng, hashStringToU32, clamp01 } from './rng.js';
import { logEvent } from './eventLog.js';
import { appendMemory } from './memory.js';
import { standingsOrder } from './season.js';
import { estimateMinutesShare } from './development.js';
import { recomputeClubStrength, clubSquadPlayers } from './players.js';

// ── Real coaching styles — Mourinho is Mourinho, Pep is Pep ───────────────────
const st = (label: string, possession: number, youth: number): ManagerStyle => ({ label, possession, youth });

/** Signature style per named coach. Real archetypes on two axes (possession,
 *  youth). Anyone not listed gets a balanced default. */
const STYLE_BY_NAME: Record<string, ManagerStyle> = {
  'Alex Ferguson': st('Relentless, youth-driven', 0.5, 0.82),
  'Gérard Houllier': st('Structured, counter-attacking', 0.4, 0.55),
  'Arsène Wenger': st('Flowing possession, youth', 0.8, 0.9),
  'Louis van Gaal': st('Positional, academy-first', 0.85, 0.82),
  'David Moyes': st('Hard-working, pragmatic', 0.35, 0.5),
  'Claudio Ranieri': st('Pragmatic, rotational', 0.45, 0.4),
  'Vicente del Bosque': st('Calm possession', 0.7, 0.6),
  'Gigi Simoni': st('Balanced', 0.5, 0.45),
  'Fabio Capello': st('Pragmatic, defensive rigour', 0.35, 0.25),
  'Marcello Lippi': st('Balanced winning machine', 0.5, 0.35),
  'Carlo Ancelotti': st('Adaptable man-management', 0.55, 0.45),
  'Rafael Benítez': st('Pragmatic, zonal, rotation', 0.4, 0.45),
  'Guus Hiddink': st('Pragmatic, tournament nous', 0.5, 0.45),
  'Sven-Göran Eriksson': st('Balanced, unflustered', 0.5, 0.4),
  'Martin O’Neill': st('Direct, motivational', 0.3, 0.4),
  'Gordon Strachan': st('Tidy, possession-leaning', 0.5, 0.5),
  'Alan Curbishley': st('Organised, pragmatic', 0.35, 0.45),
  'Roy Hodgson': st('Compact defensive block', 0.3, 0.35),
  'Sam Allardyce': st('Direct, physical, set-pieces', 0.2, 0.3),
  'Steve McClaren': st('Balanced', 0.45, 0.45),
  'Ottmar Hitzfeld': st('Balanced, tournament-hardened', 0.5, 0.55),
  // The two the Director will chase — polar opposites, era-appropriate names.
  'José Mourinho': st('Pragmatic — low block & lethal counter', 0.2, 0.2),
  'Pep Guardiola': st('Positional possession — total control', 0.98, 0.75),
};
const DEFAULT_STYLE = st('Balanced', 0.5, 0.45);
const CARETAKER_STYLE = st('Caretaker — keep it steady', 0.45, 0.4);

/** The footballing identity of a named coach (for the UI + appointments). */
export function coachStyle(name: string): ManagerStyle {
  return STYLE_BY_NAME[name] ?? DEFAULT_STYLE;
}

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

/** A pool of coaches available to hire, each with the YEARS he was a plausible
 *  hire (his real managerial availability). The shortlist is drawn from here,
 *  ERA-GATED to the current year — so a 2001 vacancy sees Eriksson, Capello,
 *  Hitzfeld and Lippi (the real names in the frame), never a pre-Barcelona Pep. */
interface PoolCoach { name: string; reputation: number; from: number; to?: number }
const COACH_POOL: PoolCoach[] = [
  { name: 'Pep Guardiola', reputation: 90, from: 2008 }, // no dugout before Barça B → Barça
  { name: 'José Mourinho', reputation: 88, from: 2002 }, // emerges at Porto
  { name: 'Fabio Capello', reputation: 90, from: 1991, to: 2012 },
  { name: 'Marcello Lippi', reputation: 88, from: 1994, to: 2011 },
  { name: 'Carlo Ancelotti', reputation: 88, from: 1999 },
  { name: 'Ottmar Hitzfeld', reputation: 86, from: 1991, to: 2008 }, // a real United 2002 target
  { name: 'Rafael Benítez', reputation: 82, from: 2001 },
  { name: 'Guus Hiddink', reputation: 82, from: 1987 },
  { name: 'Sven-Göran Eriksson', reputation: 80, from: 1982, to: 2010 }, // the board's real 2002 choice
  { name: 'Martin O’Neill', reputation: 76, from: 1995 },
  { name: 'Steve McClaren', reputation: 66, from: 2000 },
  { name: 'Gordon Strachan', reputation: 68, from: 1996 },
  { name: 'Alan Curbishley', reputation: 66, from: 1991 },
  { name: 'Roy Hodgson', reputation: 70, from: 1982 },
  { name: 'Sam Allardyce', reputation: 68, from: 1994 },
];

/** Was this coach a plausible hire in `year`? */
function availableInYear(c: PoolCoach, year: number): boolean {
  return c.from <= year && year <= (c.to ?? 9999);
}

/** The manager the world starts with — the real coach, inherited (not the
 *  Director's own appointment). Falls back to a generic incumbent scaled to the
 *  club's stature for scenarios without a curated coach. */
export function initialManager(scenarioId: string, clubPrestige: number): ManagerState {
  const real = REAL_COACHES[scenarioId];
  const reputation = real?.reputation ?? Math.max(45, clubPrestige - 8);
  const style = real ? coachStyle(real.name) : DEFAULT_STYLE;
  return {
    identity: real?.name ?? 'the incumbent manager',
    relationshipWithUser: 60,
    reputation,
    parReputation: reputation, // par = the coach reality gave this club
    standing: 62,
    appointedByUser: false,
    seasonsInCharge: 0,
    style,
    parStyle: style, // his style is the baseline the fit is measured against
  };
}

// ── On-pitch effect (calibration-anchored to par) ────────────────────────────
//
// The coach's quality nudges results and youth development — but measured
// AGAINST the coach reality gave the club (`parReputation`). Keeping the
// inherited coach is exactly neutral (0 / ×1), so a passive career (and the
// calibration harness, which never changes coach) is byte-identical to before.
// Only the Director's OWN coaching moves matter: upgrade the dugout and the side
// sharpens; sack a great coach for a caretaker and it dips. Asymmetric — a good
// coach lifts a squad only so far, but a bad appointment can really drag it.

/** Strength points added to the user's club from the coach's REPUTATION (0 at
 *  par). The style-fit term is separate (`managerStyleStrengthMod`). */
export function managerStrengthMod(mgr: ManagerState): number {
  const dev = mgr.reputation - mgr.parReputation;
  return Math.max(-7, Math.min(4, dev * 0.1));
}

/** Youth-development multiplier (×1 at par): a better coach AND a more
 *  youth-oriented style than the club had both bring prospects on faster. */
export function managerDevMod(mgr: ManagerState): number {
  const dev = mgr.reputation - mgr.parReputation;
  const repTerm = Math.max(0.8, Math.min(1.12, 1 + dev * 0.005));
  const youthTerm = Math.max(0.85, Math.min(1.15, 1 + (mgr.style.youth - mgr.parStyle.youth) * 0.25));
  return repTerm * youthTerm;
}

const POS_GROUP: Record<Position, 'GK' | 'DEF' | 'MID' | 'ATT'> = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', DM: 'MID', CM: 'MID', AM: 'MID', LW: 'ATT', RW: 'ATT', ST: 'ATT',
};

/** Position-group average ability for the user's outfield squad. */
function squadGroupAverages(state: GameState): { def: number; mid: number; att: number; overall: number } {
  const players = clubSquadPlayers(state, state.playerClub).filter((p) => (p.positions[0] ?? 'CM') !== 'GK');
  if (players.length === 0) return { def: 70, mid: 70, att: 70, overall: 70 };
  const buckets: Record<'DEF' | 'MID' | 'ATT', number[]> = { DEF: [], MID: [], ATT: [] };
  for (const p of players) {
    const g = POS_GROUP[p.positions[0] ?? 'CM'];
    if (g !== 'GK') buckets[g].push(p.ability);
  }
  const avg = (a: number[]): number => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 70);
  const overall = players.reduce((s, p) => s + p.ability, 0) / players.length;
  return { def: avg(buckets.DEF), mid: avg(buckets.MID), att: avg(buckets.ATT), overall };
}

/**
 * How well a style fits the user's current squad. A POSSESSION coach wants a
 * squad whose strength is in MIDFIELD (control the ball); a PRAGMATIC coach wants
 * defensive solidity and a threat to counter with. Returns a signed edge — the
 * ability by which the style-relevant units out- (or under-) perform the squad
 * as a whole.
 */
export function styleMatchAffinity(state: GameState, style: ManagerStyle): number {
  const { def, mid, att, overall } = squadGroupAverages(state);
  const midEdge = mid - overall; // possession lives on midfield control
  const defAttEdge = (def + att) / 2 - overall; // pragmatism lives on defence + a counter threat
  return style.possession * midEdge + (1 - style.possession) * defAttEdge;
}

/** Strength points from how much better the coach's STYLE fits the squad than
 *  the inherited coach's did (0 when the style is unchanged — calibration-safe,
 *  even as the squad drifts). Build a midfield-heavy side and Pep out-adds a
 *  route-one pragmatist; build around a back line and a counter, and it flips. */
export function managerStyleStrengthMod(state: GameState): number {
  const mgr = state.managerRelations;
  // The fit delta depends only on the possession axis; if it's unchanged from par
  // (every passive career, and any like-for-like appointment) the delta is 0, so
  // skip the squad scan entirely — this keeps recomputeClubStrength cheap.
  if (mgr.style.possession === mgr.parStyle.possession) return 0;
  const delta = styleMatchAffinity(state, mgr.style) - styleMatchAffinity(state, mgr.parStyle);
  return Math.max(-3, Math.min(3, delta * 0.4));
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
  beginSuccession(state);
}

/** Install a caretaker and open the (era-gated) hire shortlist — shared by a
 *  sacking and a retirement. */
function beginSuccession(state: GameState): void {
  const mgr = state.managerRelations;
  mgr.identity = 'caretaker manager';
  mgr.reputation = Math.max(40, mgr.reputation - 25);
  mgr.standing = 55;
  mgr.appointedByUser = false;
  mgr.seasonsInCharge = 0;
  mgr.relationshipWithUser = 55;
  mgr.style = CARETAKER_STYLE;
  recomputeClubStrength(state, state.playerClub); // the caretaker XI dips at once
  pushHireDecision(state);
}

/** A shortlist of hireable coaches, ranked by fit to the club and ERA-GATED to
 *  the current year (deterministic per club + date). The top name is a stretch (a
 *  marquee who must be WOOED); the others are attainable. */
export function managerShortlist(state: GameState): Array<{ name: string; reputation: number; marquee: boolean }> {
  const club = state.clubs[state.playerClub];
  const prestige = club?.prestige ?? 70;
  const year = Number(state.clock.date.slice(0, 4));
  const seed = hashStringToU32(`${state.playerClub}:${state.clock.date}`);
  // Rank the pool by closeness to what the club can plausibly attract, with a
  // deterministic jitter so the same club at different times sees different names.
  const ranked = COACH_POOL
    .filter((c) => c.name !== state.managerRelations.identity && availableInYear(c, year))
    .map((c, i) => ({ c, key: Math.abs(c.reputation - (prestige - 2)) + ((seed >> (i % 16)) & 3) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.c);
  const marquee = ranked.find((c) => c.reputation > prestige + 2);
  const attainable = ranked.filter((c) => c.reputation <= prestige + 2).slice(0, marquee ? 2 : 3);
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
  mgr.style = coachStyle(name); // his real footballing identity
  recomputeClubStrength(state, state.playerClub); // the new man's effect lands now
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

// ── Scripted manager-retirement counterfactuals ──────────────────────────────
//
// A great coach at a crossroads reality really faced. The canonical case: Sir
// Alex Ferguson announced in 2001 he would retire at the end of 2001–02, then
// reversed it in February 2002 — a decision swayed by the team's direction and
// his family. Here the Director gets the call reality's board didn't force: talk
// him round with a squad-building plan (he stays, as he did), or let him bow out
// and appoint a successor from the era's REAL candidates (Eriksson, Capello,
// Hitzfeld, Lippi…). Reality holds if you back him, so the passive path (and
// calibration) is unperturbed.

interface RetirementFlirtation { year: number; name: string }
const MANAGER_RETIREMENTS: Record<string, RetirementFlirtation> = {
  'man-utd-1999': { year: 2001, name: 'Alex Ferguson' },
};

/** Fire the scripted retirement crossroads once, when its year arrives and the
 *  real coach is still in charge. Called at the season rollover. */
export function rollManagerRetirement(state: GameState): void {
  if (state.board.dismissed) return;
  const flirt = MANAGER_RETIREMENTS[state.meta.scenarioId];
  if (!flirt) return;
  const key = `retirement:${flirt.name}`;
  if (state.meta.firedScripted.includes(key)) return;
  const year = Number(state.clock.date.slice(0, 4));
  if (year < flirt.year) return;
  const mgr = state.managerRelations;
  if (mgr.identity !== flirt.name) { state.meta.firedScripted.push(key); return; } // already changed coach
  state.meta.firedScripted.push(key);

  // "Falling apart" vs "going out on a high", from where the club actually sits.
  const league = state.leagues[state.clubs[state.playerClub]?.leagueId ?? ''];
  const order = league ? standingsOrder(league) : [];
  const pos = order.indexOf(state.playerClub) + 1;
  const onAHigh = pos >= 1 && pos <= 2;
  const framing = onAHigh
    ? `With the trophies still coming, ${flirt.name} is tempted to walk away at the very top.`
    : `With the team looking like it needs rebuilding, ${flirt.name} is questioning whether he still has the appetite for it.`;

  logEvent(state, {
    category: 'system',
    code: 'manager.retirement.considering',
    message: `${flirt.name} has told the board he is thinking of retiring at the end of the season.`,
    data: { manager: flirt.name, onAHigh, position: pos || null },
  });
  state.pendingDecisions.push({
    id: `manager-retirement:${flirt.name}`,
    title: `${flirt.name} is considering retirement`,
    description: `${framing} You can try to talk him round — lay out an ambitious squad-building plan and convince him the best is still to come — or accept his decision and line up a successor.`,
    interrupt: true,
    clubId: state.playerClub,
    category: 'system',
    choices: [
      // choices[0] = reality-default: he stays (as Ferguson really did). No sim
      // change beyond goodwill, so the passive path stays byte-identical.
      {
        id: 'persuade',
        label: `Talk him round with a squad-building plan (he stays)`,
        onSuccess: [
          { kind: 'managerRelationship', amount: 10 },
          { kind: 'memory', tag: 'manager', text: `Persuaded ${flirt.name} to stay on with a rebuild plan.` },
          { kind: 'log', text: `${flirt.name} signs on — the project convinced him to stay.` },
        ],
      },
      {
        id: 'accept',
        label: `Let him retire — appoint his successor`,
        onSuccess: [{ kind: 'retireManager', text: flirt.name }],
      },
    ],
    // Ignore it and, as in reality, he stays on — nothing changes.
    falloutIfIgnored: [{ kind: 'memory', tag: 'manager', text: `${flirt.name} stayed on, as in reality.` }],
    memoryTags: ['manager', flirt.name],
  });
}

/** The head coach retires; a caretaker steps in and the (era-gated) hire
 *  shortlist opens. No Director-patience penalty — a legend leaving on his own
 *  terms isn't a sacking. */
export function retireManager(state: GameState): void {
  const name = state.managerRelations.identity;
  logEvent(state, {
    category: 'system',
    code: 'manager.retired',
    message: `${name} retires. An era ends — the Director must find a successor.`,
    data: { manager: name },
  });
  appendMemory(state, 'manager', `${name} retired.`);
  beginSuccession(state);
}

// ── Directives: the Director tells the coach how to use a player ──────────────
//
// The coach picks the team by ability. When the Director wants otherwise — blood
// a prospect the coach would bench, or protect a fragile star the coach would
// ride — he issues a DIRECTIVE, and the coach may RESIST it. Resistance rises
// with the coach's reputation (a big name guards selection), a poor relationship,
// and how much the directive fights winning football (playing a raw kid over a
// proven one, or resting your best XI). A coach the Director hired complies more
// readily. A resisted directive becomes a confrontation: defer, or overrule him
// (it takes effect, but it costs the relationship and his standing — overrule him
// too often and a big name may turn the boardroom against you).

/** How much a directive fights the coach's winning-XI instinct (0..1). */
function directiveContradiction(state: GameState, playerId: PlayerId, kind: 'minutes' | 'load'): number {
  const club = state.clubs[state.playerClub];
  const player = state.players[playerId];
  if (!club || !player) return 0.3;
  const share = estimateMinutesShare(state, club, player); // 0.1..0.85 by ability rank
  if (kind === 'minutes') {
    // Forcing a benched/rotation player in fights the coach most; a player who's
    // already first-choice needs no fight.
    return clamp01((0.85 - share) / 0.75);
  }
  // load: resting a KEY, fit starter costs results now — the coach fights that;
  // resting a squad player, or one already carrying a knock, is uncontroversial.
  return clamp01(share - (player.injury ? 0.35 : 0));
}

/** The coach's chance of pushing back on a directive of this contradiction. */
export function coachResistanceChance(state: GameState, contradicts: number): number {
  const m = state.managerRelations;
  let p = 0.12;
  p += Math.max(0, m.reputation - 62) * 0.006; // a big name guards selection
  p += Math.max(0, 60 - m.relationshipWithUser) * 0.005; // a poor relationship digs in
  p += contradicts * 0.4; // fighting winning football
  if (m.appointedByUser) p -= 0.1; // your own hire extends you the benefit of the doubt
  return Math.max(0.03, Math.min(0.92, p));
}

function setDirective(state: GameState, playerId: PlayerId, kind: 'minutes' | 'load'): void {
  (state.directives ??= {})[playerId] = { kind, setAt: state.clock.date };
}

/**
 * The Director issues a directive on one of his players (minutes / load). The
 * coach either accepts it, or resists — in which case a confrontation decision is
 * raised (defer to him, or overrule him). Returns whether the coach pushed back.
 */
export function issueDirective(
  state: GameState,
  rng: Rng,
  playerId: PlayerId,
  kind: 'minutes' | 'load',
): { ok: boolean; resisted: boolean; reason: string } {
  const player = state.players[playerId];
  if (!player || player.club !== state.playerClub) {
    return { ok: false, resisted: false, reason: 'Not one of your players.' };
  }
  const mgr = state.managerRelations;
  const contradicts = directiveContradiction(state, playerId, kind);
  const resisted = rng.chance(coachResistanceChance(state, contradicts));

  if (!resisted) {
    setDirective(state, playerId, kind);
    logEvent(state, {
      category: 'decision',
      code: 'directive.accepted',
      message: `${mgr.identity} accepts the directive on ${player.name} (${kind === 'minutes' ? 'guaranteed minutes' : 'managed load'}).`,
      data: { playerId, kind },
    });
    return { ok: true, resisted: false, reason: `${mgr.identity} will do it.` };
  }

  const want = kind === 'minutes'
    ? `You want ${player.name} given first-team minutes; ${mgr.identity} would rather pick on form and results.`
    : `You want ${player.name}'s workload managed; ${mgr.identity} wants his strongest XI out there every week.`;
  state.pendingDecisions.push({
    id: `directive-clash:${kind}:${playerId}`,
    title: `${mgr.identity} resists your call on ${player.name}`,
    description: `${want} Defer to your coach, or overrule him — impose it yourself, at a cost to his goodwill and his authority.`,
    interrupt: true,
    clubId: state.playerClub,
    category: 'decision',
    choices: [
      // choices[0] = reality-default: back the coach's judgement (no directive).
      { id: 'defer', label: `Defer to ${mgr.identity}`, onSuccess: [{ kind: 'managerRelationship', amount: 5 }, { kind: 'log', text: `Deferred to ${mgr.identity} on ${player.name}.` }] },
      { id: 'overrule', label: `Overrule him — impose it on ${player.name}`, onSuccess: [{ kind: 'imposeDirective', playerId, tag: kind }, { kind: 'managerRelationship', amount: -12 }, { kind: 'managerStanding', amount: -6 }] },
    ],
    // Ignore it and the coach keeps control — the directive lapses (reality holds).
    falloutIfIgnored: [{ kind: 'managerRelationship', amount: 5 }],
    memoryTags: ['manager', playerId],
  });
  logEvent(state, {
    category: 'decision',
    code: 'directive.resisted',
    message: `${mgr.identity} pushes back on your directive over ${player.name}.`,
    data: { playerId, kind, resistance: Math.round(coachResistanceChance(state, contradicts) * 100) },
  });
  return { ok: true, resisted: true, reason: `${mgr.identity} resists — overrule him or defer.` };
}

/** Apply an overruled directive (consequence handler). */
export function imposeDirective(state: GameState, playerId: PlayerId, kind: 'minutes' | 'load'): void {
  const player = state.players[playerId];
  if (!player || player.club !== state.playerClub) return;
  setDirective(state, playerId, kind);
  logEvent(state, {
    category: 'decision',
    code: 'directive.imposed',
    message: `You overrule ${state.managerRelations.identity} and impose your directive on ${player.name}.`,
    data: { playerId, kind },
  });
  appendMemory(state, 'manager', `Overruled the coach on ${player.name}.`);
}

/** Lift a directive (the Director changes his mind, or the player leaves). */
export function revokeDirective(state: GameState, playerId: PlayerId): void {
  if (state.directives) delete state.directives[playerId];
}

/**
 * Season-rollover upkeep for standing directives (called from advance.ts):
 *  - a `load` directive gently eases the player's injury-proneness (a managed
 *    body grows more durable — the same easing careful rehab gives);
 *  - directives on players who have left the user's club are cleared.
 * Empty by default, so calibration is untouched.
 */
export function applyDirectiveEffects(state: GameState): void {
  const dir = state.directives;
  if (!dir) return;
  for (const [playerId, directive] of Object.entries(dir)) {
    const player = state.players[playerId];
    if (!player || player.club !== state.playerClub) {
      delete dir[playerId];
      continue;
    }
    if (directive.kind === 'load') {
      player.injuryProneness = Math.max(20, player.injuryProneness - 4);
    }
  }
}
