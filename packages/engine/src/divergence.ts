/**
 * Divergence drift (§9f; docs/DESIGN-reality-default.md).
 *
 * The world follows real history by default and frays as the player pushes on
 * it. The probability of non-real storylines rises with BOTH how aggressive the
 * user has been (signings, raids) AND how much time has elapsed (butterflies
 * compound). Critically it is GATED on aggression: a passive user (aggression 0)
 * has ~0 divergence no matter how many years pass, so reality — and scripted
 * history — holds for them. This is what keeps "knowledge is an edge" true early
 * and appropriately unreliable once you've reshaped the world.
 *
 * As divergence rises the world writes its OWN history: net-new, concrete stories
 * about real players at their CURRENT clubs — a giant coming for the star you
 * signed (Real Madrid for a Bale you took to United), a contract standoff, a
 * teenager breaking through early. Every such story names real actors and is
 * traceable in the divergence log; the ones that touch your club become decisions.
 */

import type { GameState, PlayerState, ClubState, Decision } from './types.js';
import type { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { appendMemory } from './memory.js';
import { clubSquadPlayers } from './players.js';
import { valuePlayer } from './finance.js';

/**
 * Divergence factor in [0, 1]. Zero while the user stays passive; otherwise it
 * grows with aggression and is amplified by elapsed seasons.
 */
export function divergenceFactor(state: GameState): number {
  if (state.userAggression <= 0) return 0;
  const year = Number(state.clock.date.slice(0, 4));
  const elapsedSeasons = Math.max(0, year - state.meta.startYear);
  const aggression = Math.min(1, state.userAggression * 0.045);
  const time = 1 + elapsedSeasons * 0.08;
  return Math.max(0, Math.min(1, aggression * time));
}

/**
 * Procedural "non-real storyline" flavour, drawn as divergence rises. Each names
 * a CONCRETE club so an entry reads as a real event ("Leeds part with their
 * manager"), not contentless stock text — a realism note from the Historian was
 * that the old generic lines repeated verbatim and named no actor.
 */
const STORYLINE_TEMPLATES: Array<(club: string) => string> = [
  (c) => `${c} unexpectedly part company with their manager`,
  (c) => `an out-of-nowhere bid reshapes ${c}'s squad`,
  (c) => `a boardroom power struggle erupts at ${c}`,
  (c) => `a fire-sale breaks out at a cash-strapped ${c}`,
  (c) => `a teenager forces his way into ${c}'s side ahead of his real timeline`,
];

function ageOf(state: GameState, p: PlayerState): number {
  return Number(state.clock.date.slice(0, 4)) - p.birthYear;
}

function ymIndex(date: string): number {
  return Number(date.slice(0, 4)) * 12 + (Number(date.slice(5, 7)) - 1);
}

/** Was this player the subject of a divergence storyline in the last `months`?
 *  A cooldown so the same displaced star is not "come for" every other window —
 *  the sagas rotate through the squad instead of fixating on one man. */
function recentlyFeatured(state: GameState, playerId: string, months: number): boolean {
  const cutoff = ymIndex(state.clock.date) - months;
  for (let i = state.eventLog.length - 1; i >= 0; i--) {
    const e = state.eventLog[i]!;
    if (ymIndex(e.date) < cutoff) break; // eventLog is chronological
    if (e.code.startsWith('divergence.') && e.data?.playerId === playerId) return true;
  }
  return false;
}

const FEATURE_COOLDOWN = 18; // months before a player can headline another saga

/** Real (curated), fit, first-team players at a simulated club — the pool the
 *  world writes its new stories around (Principle 2: never anonymous filler). */
function realStars(state: GameState, minAbility: number): PlayerState[] {
  return Object.values(state.players).filter(
    (p) => p.curated && p.club != null && !p.injury && p.ability >= minAbility && state.clubs[p.club]?.leagueId != null,
  );
}

/** Raw deliberate-aggression a user must reach before the world starts writing
 *  INTERACTIVE stories about his squad. Reality-default ledger signings into the
 *  user's club also nudge `userAggression`, so a passive (calibration) user sits
 *  at ~2–3; this threshold clears that baseline, keeping the calibration run inert
 *  (its only divergence output stays pure, mutation-free flavour). */
export const RESHAPED_AGGRESSION = 8;

/** A plausible glamour suitor for `target`: a comparable-or-bigger club (a giant,
 *  prestige ≥ 82), never the player's own club. Foreign context giants COUNT — the
 *  canonical deviation is "Real Madrid come for your star", and in an English-league
 *  world Real Madrid sits outside the simulated league (leagueId null). Comparable-
 *  or-bigger (not strictly higher) so the elite can poach each other. */
function pickSuitor(state: GameState, target: PlayerState, rng: Rng): ClubState | undefined {
  const targetPrestige = target.club ? state.clubs[target.club]?.prestige ?? 0 : 0;
  const suitors = Object.values(state.clubs).filter(
    (c) => c.id !== target.club && c.prestige >= 82 && c.prestige >= targetPrestige - 3,
  );
  if (suitors.length === 0) return undefined;
  return rng.pick(suitors);
}

/**
 * A GIANT comes for one of YOUR stars — the archetypal deviation decision ("Real
 * Madrid open talks for the Bale you took to United"). Interactive and mutating,
 * so it is reserved for a user who has genuinely reshaped his squad (gated on raw
 * aggression, above the reality-default baseline — the calibration run never sees
 * it). Fees are premium (a marquee, unsolicited bid).
 */
function emitSuitorSagaUser(state: GameState, rng: Rng, f: number): boolean {
  const userStars = clubSquadPlayers(state, state.playerClub).filter(
    (p) => p.curated && !p.injury && p.ability >= 80 && !recentlyFeatured(state, p.id, FEATURE_COOLDOWN),
  );
  if (userStars.length === 0) return false;
  const target = rng.pick(userStars);
  const suitor = pickSuitor(state, target, rng);
  if (!suitor) return false;
  // Don't stack two suitor sagas for the same man.
  const pendingId = `divergence:suitor:${target.id}`;
  if (state.pendingDecisions.some((d) => d.id.startsWith(pendingId))) return false;
  const year = Number(state.clock.date.slice(0, 4));
  const fee = Math.round(valuePlayer(target, year) * (1.3 + 0.3 * f));
  const decision: Decision = {
    id: `${pendingId}:${state.clock.date}`,
    title: `${suitor.name} come calling for ${target.name}`,
    description: `${suitor.name} have made an unsolicited, club-record approach for ${target.name}. It is a story the real world never wrote — and now it is yours to settle.`,
    interrupt: true,
    clubId: state.playerClub,
    category: 'transfer',
    choices: [
      {
        id: 'reject',
        label: `Reject it — he is not for sale`,
        successProbability: 0.6,
        onSuccess: [
          { kind: 'morale', playerId: target.id, amount: 6 },
          { kind: 'memory', tag: 'transfer-saga', text: `Rebuffed ${suitor.name}'s move for ${target.name}.` },
        ],
        onFailure: [{ kind: 'agitation', playerId: target.id, amount: 12 }],
      },
      {
        id: 'cash-in',
        label: `Cash in at a record fee (£${Math.round(fee / 1_000_000)}m)`,
        successProbability: 0.85,
        onSuccess: [
          { kind: 'transferOut', playerId: target.id, clubId: suitor.id, amount: fee },
          { kind: 'memory', tag: 'transfer-saga', text: `Sold ${target.name} to ${suitor.name} — the world turns again.` },
        ],
        onFailure: [{ kind: 'agitation', playerId: target.id, amount: 10 }],
      },
      {
        id: 'stall',
        label: `Stall and keep him hungry`,
        successProbability: 0.5,
        onSuccess: [{ kind: 'boardPatience', amount: 3 }],
        onFailure: [{ kind: 'agitation', playerId: target.id, amount: 8 }, { kind: 'morale', playerId: target.id, amount: -4 }],
      },
    ],
    falloutIfIgnored: [
      { kind: 'agitation', playerId: target.id, amount: 14 },
      { kind: 'memory', tag: 'transfer-saga', text: `Left ${suitor.name}'s interest in ${target.name} to fester.` },
    ],
    memoryTags: ['transfer-saga', target.id],
  };
  state.pendingDecisions.push(decision);
  logEvent(state, {
    category: 'transfer',
    code: 'divergence.suitor',
    message: `${suitor.name} open talks for your ${target.name} — a story reality never told`,
    data: { divergence: Number(f.toFixed(2)), playerId: target.id, suitor: suitor.id, clubId: state.playerClub },
  });
  return true;
}

/**
 * A giant comes for a RIVAL's star — the world moving without you. Pure, logged
 * colour (no state mutation), so it is safe at any divergence level, including the
 * near-zero baseline a passive user carries.
 */
function emitSuitorSagaWorld(state: GameState, rng: Rng, f: number): boolean {
  const pool = realStars(state, 82).filter((p) => p.club !== state.playerClub && !recentlyFeatured(state, p.id, FEATURE_COOLDOWN));
  if (pool.length === 0) return false;
  const target = rng.pick(pool);
  const suitor = pickSuitor(state, target, rng);
  if (!suitor || !target.club) return false;
  const holder = state.clubs[target.club];
  if (!holder) return false;
  const detail = `${suitor.name} open talks to prise ${target.name} away from ${holder.name}`;
  state.timeline.divergenceLog.push({ date: state.clock.date, kind: 'storyline', detail });
  appendMemory(state, 'divergence', detail);
  logEvent(state, {
    category: 'transfer',
    code: 'divergence.storyline',
    message: `The world diverges: ${detail}`,
    data: { divergence: Number(f.toFixed(2)), playerId: target.id, suitor: suitor.id, clubId: holder.id },
  });
  return true;
}

/** Is `p` a curated star who has ended up somewhere reality never put him — i.e.
 *  now at a different club from his seed origin? The raw material for the
 *  counterfactual-reaction story. */
function isDisplaced(p: PlayerState): boolean {
  return p.curated && p.club != null && p.originClub != null && p.club !== p.originClub;
}

/**
 * The canonical deviation: a giant comes for a star YOU have relocated — the "Real
 * Madrid open talks for the Bale you took to United" beat. Distinct from the plain
 * suitor saga because it names the counterfactual (a club reality never had him at)
 * and the suitor is often his ORIGIN club trying to reclaim him. Interactive and
 * mutating, so gated on raw aggression (the calibration run never reshapes, so it
 * never fires this).
 */
function emitDisplacedStarSagaUser(state: GameState, rng: Rng, f: number): boolean {
  const stars = clubSquadPlayers(state, state.playerClub).filter(
    (p) => !p.injury && p.ability >= 80 && isDisplaced(p) && p.originClub !== state.playerClub && !recentlyFeatured(state, p.id, FEATURE_COOLDOWN),
  );
  if (stars.length === 0) return false;
  const target = rng.pick(stars);
  const pendingId = `divergence:displaced:${target.id}`;
  if (state.pendingDecisions.some((d) => d.id.startsWith(pendingId))) return false;
  const origin = target.originClub ? state.clubs[target.originClub] : undefined;
  const giant = pickSuitor(state, target, rng);
  // Half the time the club reality gave him tries to take him back; otherwise a
  // fresh glamour suitor circles.
  const suitor = origin && origin.prestige >= 80 && rng.chance(0.5) ? origin : giant;
  if (!suitor || suitor.id === state.playerClub) return false;
  const reclaim = suitor.id === target.originClub;
  const year = Number(state.clock.date.slice(0, 4));
  const fee = Math.round(valuePlayer(target, year) * (1.35 + 0.3 * f));
  const you = state.clubs[state.playerClub]?.name ?? 'your club';
  const decision: Decision = {
    id: `${pendingId}:${state.clock.date}`,
    title: `${suitor.name} move for ${target.name}`,
    description: reclaim
      ? `${suitor.name} want ${target.name} back — the club reality had him at is trying to undo your work and reclaim him from ${you}.`
      : `${suitor.name} have opened talks for ${target.name}, thriving at ${you} — a home reality never gave him. It is a story the real world never wrote, and it is yours to settle.`,
    interrupt: true,
    clubId: state.playerClub,
    category: 'transfer',
    choices: [
      {
        id: 'reject',
        label: `Reject it — he is staying`,
        successProbability: 0.6,
        onSuccess: [
          { kind: 'morale', playerId: target.id, amount: 6 },
          { kind: 'memory', tag: 'transfer-saga', text: `Rebuffed ${suitor.name}'s move for ${target.name}.` },
        ],
        onFailure: [{ kind: 'agitation', playerId: target.id, amount: 12 }],
      },
      {
        id: 'cash-in',
        label: `Cash in at a record fee (£${Math.round(fee / 1_000_000)}m)`,
        successProbability: 0.85,
        onSuccess: [
          { kind: 'transferOut', playerId: target.id, clubId: suitor.id, amount: fee },
          { kind: 'memory', tag: 'transfer-saga', text: `Sold ${target.name} to ${suitor.name} — the counterfactual unwinds.` },
        ],
        onFailure: [{ kind: 'agitation', playerId: target.id, amount: 10 }],
      },
    ],
    falloutIfIgnored: [
      { kind: 'agitation', playerId: target.id, amount: 14 },
      { kind: 'memory', tag: 'transfer-saga', text: `Let ${suitor.name}'s interest in ${target.name} fester.` },
    ],
    memoryTags: ['transfer-saga', target.id],
  };
  state.pendingDecisions.push(decision);
  logEvent(state, {
    category: 'transfer',
    code: 'divergence.displaced',
    message: `${suitor.name} come for the displaced ${target.name} — reality reasserting itself`,
    data: { divergence: Number(f.toFixed(2)), playerId: target.id, suitor: suitor.id, reclaim, clubId: state.playerClub },
  });
  return true;
}

/**
 * The same counterfactual pull, but for a star YOU do not own — pure logged colour
 * (mutation-free, safe at any divergence). His origin club or a giant angles to
 * bring a displaced player back towards where reality had him.
 */
function emitDisplacedStarSagaWorld(state: GameState, rng: Rng, f: number): boolean {
  const pool = Object.values(state.players).filter(
    (p) => !p.injury && p.ability >= 80 && isDisplaced(p) && p.club !== state.playerClub && state.clubs[p.club!]?.leagueId != null && !recentlyFeatured(state, p.id, FEATURE_COOLDOWN),
  );
  if (pool.length === 0) return false;
  const target = rng.pick(pool);
  const holder = state.clubs[target.club!];
  const origin = target.originClub ? state.clubs[target.originClub] : undefined;
  const suitor = origin && origin.prestige >= 80 && rng.chance(0.5) ? origin : pickSuitor(state, target, rng);
  if (!holder || !suitor || suitor.id === target.club) return false;
  const detail = suitor.id === target.originClub
    ? `${suitor.name} move to reclaim ${target.name} from ${holder.name}`
    : `${suitor.name} circle ${target.name}, now out of place at ${holder.name}`;
  state.timeline.divergenceLog.push({ date: state.clock.date, kind: 'storyline', detail });
  appendMemory(state, 'divergence', detail);
  logEvent(state, {
    category: 'transfer',
    code: 'divergence.storyline',
    message: `The world diverges: ${detail}`,
    data: { divergence: Number(f.toFixed(2)), playerId: target.id, suitor: suitor.id, clubId: holder.id },
  });
  return true;
}

/** Two named giants fight over a real wonderkid at a smaller club — net-new colour,
 *  anchored on concrete, era-correct actors (never fabricated filler). */
function emitWonderkidBiddingWar(state: GameState, rng: Rng, f: number): boolean {
  const kids = Object.values(state.players).filter(
    (p) => p.curated && p.club != null && state.clubs[p.club]?.leagueId != null && ageOf(state, p) <= 21 && p.potentialCeiling >= 84 && p.ability >= 72,
  );
  if (kids.length === 0) return false;
  const kid = rng.pick(kids);
  const giants = Object.values(state.clubs).filter((c) => c.prestige >= 84 && c.id !== kid.club);
  if (giants.length < 2) return false;
  const a = rng.pick(giants);
  const b = rng.pick(giants.filter((c) => c.id !== a.id));
  if (!b) return false;
  const holder = state.clubs[kid.club!]!;
  const detail = `${a.name} and ${b.name} are locked in a bidding war for ${holder.name}'s ${kid.name}`;
  state.timeline.divergenceLog.push({ date: state.clock.date, kind: 'storyline', detail });
  appendMemory(state, 'divergence', detail);
  logEvent(state, {
    category: 'transfer',
    code: 'divergence.storyline',
    message: `The world diverges: ${detail}`,
    data: { divergence: Number(f.toFixed(2)), playerId: kid.id, clubId: holder.id },
  });
  return true;
}

/** An ageing curated great announces a farewell — the world marking the passage of
 *  an era it wrote its own way. Concrete, mutation-free colour. */
function emitVeteranFarewell(state: GameState, rng: Rng, f: number): boolean {
  const vets = Object.values(state.players).filter(
    (p) => p.curated && p.club != null && state.clubs[p.club]?.leagueId != null && ageOf(state, p) >= 34 && p.ability >= 78,
  );
  if (vets.length === 0) return false;
  const vet = rng.pick(vets);
  const club = state.clubs[vet.club!]!;
  const detail = `${vet.name} announces this will be his final season at ${club.name}`;
  state.timeline.divergenceLog.push({ date: state.clock.date, kind: 'storyline', detail });
  appendMemory(state, 'divergence', detail);
  logEvent(state, {
    category: 'event',
    code: 'divergence.storyline',
    message: `The world diverges: ${detail}`,
    data: { divergence: Number(f.toFixed(2)), playerId: vet.id, clubId: club.id },
  });
  return true;
}

/**
 * A star at your club enters the final phase of his deal and stalls on renewing —
 * a contract standoff you must break. A your-club-only decision (rivals resolve
 * these off-screen).
 */
function emitContractStandoff(state: GameState, rng: Rng, f: number): boolean {
  const candidates = clubSquadPlayers(state, state.playerClub).filter(
    (p) => p.curated && !p.injury && p.ability >= 80 && ageOf(state, p) <= 31 && !recentlyFeatured(state, p.id, FEATURE_COOLDOWN),
  );
  if (candidates.length === 0) return false;
  const target = rng.pick(candidates);
  const pendingId = `divergence:contract:${target.id}`;
  if (state.pendingDecisions.some((d) => d.id.startsWith(pendingId))) return false;

  const decision: Decision = {
    id: `${pendingId}:${state.clock.date}`,
    title: `${target.name} is stalling on a new contract`,
    description: `With his deal running down, ${target.name} and his agent are holding out for terms that would reset your wage structure. Meet them, hold firm, or move him on before he leaves for nothing?`,
    interrupt: true,
    clubId: state.playerClub,
    category: 'event',
    choices: [
      {
        id: 'meet-terms',
        label: 'Break the structure to keep him',
        successProbability: 0.75,
        onSuccess: [
          { kind: 'morale', playerId: target.id, amount: 8 },
          { kind: 'agitation', playerId: target.id, amount: -15 },
          { kind: 'money', clubId: state.playerClub, amount: -4_000_000 },
        ],
        onFailure: [{ kind: 'agitation', playerId: target.id, amount: 6 }],
      },
      {
        id: 'hold-firm',
        label: 'Hold firm on the wage structure',
        successProbability: 0.45,
        onSuccess: [{ kind: 'boardPatience', amount: 4 }],
        onFailure: [{ kind: 'agitation', playerId: target.id, amount: 14 }, { kind: 'morale', playerId: target.id, amount: -6 }],
      },
    ],
    falloutIfIgnored: [{ kind: 'agitation', playerId: target.id, amount: 12 }, { kind: 'memory', tag: 'contract', text: `Let ${target.name}'s contract situation drift.` }],
    memoryTags: ['contract', target.id],
  };
  state.pendingDecisions.push(decision);
  logEvent(state, {
    category: 'event',
    code: 'divergence.contract',
    message: `${target.name} stalls on a new deal — the standoff is yours to break`,
    data: { divergence: Number(f.toFixed(2)), playerId: target.id, clubId: state.playerClub },
  });
  return true;
}

/** A teenager forces his way up ahead of his real timeline — colour, logged at a
 *  concrete club (never the fabricated-star trap: only real, young, high-ceiling
 *  curated players). */
function emitYouthBreakout(state: GameState, rng: Rng, f: number): boolean {
  const kids = Object.values(state.players).filter(
    (p) => p.curated && p.club != null && state.clubs[p.club]?.leagueId != null && ageOf(state, p) <= 20 && p.potentialCeiling >= 82 && p.ability < p.potentialCeiling - 6,
  );
  if (kids.length === 0) return false;
  const kid = rng.pick(kids);
  const club = state.clubs[kid.club!]!;
  const detail = `${kid.name} forces his way into ${club.name}'s side ahead of his real timeline`;
  state.timeline.divergenceLog.push({ date: state.clock.date, kind: 'storyline', detail });
  appendMemory(state, 'divergence', detail);
  logEvent(state, {
    category: 'event',
    code: 'divergence.storyline',
    message: `The world diverges: ${detail}`,
    data: { divergence: Number(f.toFixed(2)), playerId: kid.id, clubId: club.id },
  });
  return true;
}

/** Generic world colour (manager change, boardroom struggle) at a concrete rival,
 *  never repeating the immediately-previous line. The fallback when no richer,
 *  player-anchored story is available this window. */
function emitWorldFlavour(state: GameState, rng: Rng, f: number): boolean {
  const rivals = Object.values(state.clubs).filter((c) => c.leagueId !== null && c.id !== state.playerClub);
  if (rivals.length === 0) return false;
  const club = rng.pick(rivals);
  const lastDetail = [...state.timeline.divergenceLog].reverse().find((d) => d.kind === 'storyline')?.detail;
  let idx = rng.int(0, STORYLINE_TEMPLATES.length - 1);
  let storyline = STORYLINE_TEMPLATES[idx]!(club.name);
  if (storyline === lastDetail) {
    idx = (idx + 1) % STORYLINE_TEMPLATES.length;
    storyline = STORYLINE_TEMPLATES[idx]!(club.name);
  }
  state.timeline.divergenceLog.push({ date: state.clock.date, kind: 'storyline', detail: storyline });
  appendMemory(state, 'divergence', storyline);
  logEvent(state, {
    category: 'event',
    code: 'divergence.storyline',
    message: `The world diverges: ${storyline}`,
    data: { divergence: Number(f.toFixed(2)), clubId: club.id },
  });
  return true;
}

/**
 * Roll for a non-real storyline this window. The more the user has diverged from
 * reality, the more the world writes its own history — concrete, player-anchored
 * stories at their current clubs, with the ones touching your club surfacing as
 * decisions. Gated on `divergenceFactor`, so a passive (calibration) user sees
 * nothing and reality holds. Logged to the divergence log (§9f): every butterfly
 * is traceable.
 */
export function rollDivergentStoryline(state: GameState, rng: Rng): void {
  const f = divergenceFactor(state);
  if (f <= 0) return;
  // Up to ~40% per window at full divergence; ~0 for a lightly-active user.
  if (!rng.chance(0.4 * f)) return;

  // Pure-flavour generators mutate nothing and are safe at any divergence — they
  // run even at the near-zero baseline a passive user carries. Shuffled so no one
  // archetype dominates the log over a long career.
  const flavour = rng.shuffle([
    emitDisplacedStarSagaWorld,
    emitSuitorSagaWorld,
    emitWonderkidBiddingWar,
    emitVeteranFarewell,
    emitYouthBreakout,
    emitWorldFlavour,
  ] as Array<(s: GameState, r: Rng, ff: number) => boolean>);
  // Interactive, MUTATING stories about your own squad appear only once you have
  // genuinely reshaped it (raw aggression clears the reality-default baseline),
  // so the calibration run — which never reshapes — never triggers them. The
  // interactive beats are shuffled so none crowds the others out; the displaced-
  // star saga (the signature deviation) leads when it can build.
  const interactive: Array<(s: GameState, r: Rng, ff: number) => boolean> =
    state.userAggression >= RESHAPED_AGGRESSION
      ? [emitDisplacedStarSagaUser, ...rng.shuffle([emitSuitorSagaUser, emitContractStandoff])]
      : [];

  // Prefer an interactive beat (the ones that matter most) when eligible, then
  // fall through to flavour if none can build this window.
  const order = rng.chance(0.6) ? [...interactive, ...flavour] : [...flavour, ...interactive];
  let fired = false;
  for (const gen of order) {
    if (gen(state, rng, f)) { fired = true; break; }
  }
  // A heavily-reshaped, late-career world is busy: at high divergence, sometimes a
  // second, purely-flavour beat fires the same window so history feels alive rather
  // than following reality one tidy event at a time.
  if (fired && f >= 0.5 && rng.chance(0.35 * f)) {
    for (const gen of flavour) {
      if (gen(state, rng, f)) break;
    }
  }
}
