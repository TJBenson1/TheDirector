/**
 * M8 — AI club ambition & the "money still talks" constraint
 * (docs/DESIGN-ambition.md).
 *
 * Increment 1 (this file, for now) is pure measurement helpers: which clubs are
 * "big-money", and each club's plausible strength ceiling. They read state and
 * change no simulation, so wiring them into the harness is calibration
 * byte-identical. Increment 2 adds the pressure state and the ambition-override
 * mechanic, which perturb the world (the first non-byte-identical build).
 */

import type { ClubId, ClubPressure, ClubState, GameState, PlayerState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { appendMemory } from './memory.js';
import { valuePlayer, initialFinances } from './finance.js';
import { computeWageBill } from './players.js';
import { executeTransfer } from './transfers.js';
import { evaluateApproach } from './agency.js';
import { ERA_REALITY, eraForScenario, entryKey } from './ledger.js';

/** Prestige at or above which a club is treated as a wealth power (a "money
 *  club"), independent of ownership. The moneyed-era signal is already carried
 *  in prestige (Man City 60→85 across eras), so this needs no authored list. */
export const MONEY_PRESTIGE = 80;

/** How far above its authored `baseStrength` a club may legitimately climb
 *  (real ledger buys, academy graduates, an unlocked talent, an ambition
 *  override) before the rise reads as a fantasy leap. */
export const CEILING_MARGIN = 8;

/**
 * A "big-money" club — one whose spending power lets it win commensurate with
 * its wallet ("money still talks", DESIGN-internal-friction governing
 * constraint). Sugar-daddy ownership (Abramovich Chelsea, the takeover clubs)
 * qualifies at any prestige; otherwise a high prestige is the wealth proxy.
 * Pure read — no simulation effect.
 */
export function isMoneyClub(club: ClubState): boolean {
  return club.finances.ownership === 'sugar-daddy' || club.prestige >= MONEY_PRESTIGE;
}

/**
 * The strength a club may plausibly reach. `baseStrength` is the authored M2
 * calibration anchor; a club can rise above it with cause, but only so far.
 * Live `strength` exceeding this at era end (without a logged multi-cause chain)
 * is a fantasy leap — the guard the M8 ceiling target holds at 0. Pure read.
 */
export function plausibleCeiling(club: ClubState): number {
  return club.baseStrength + CEILING_MARGIN;
}

/** Does a club's live strength exceed its plausible ceiling? (Fantasy-leap
 *  detection; the user's own club is exempt — its ambition is authored by the
 *  user, so its climb is always "caused".) */
export function exceedsPlausibleCeiling(club: ClubState): boolean {
  return club.strength > plausibleCeiling(club);
}

// ── Benefactor funding & Financial Fair Play ─────────────────────────────────
//
// "Money still talks" — a sugar-daddy owner keeps refilling the war chest, so the
// advantage is ONGOING, not a one-off kitty that decays as it's spent. Each
// summer the benefactor tops the transfer budget back up to a rich funded level.
//
// Then from ~2011 UEFA's FFP reins the era in: the benefactor can no longer write
// a blank cheque, so the annual funding drops from a ×2.2 splurge to a ×1.4
// still-rich-but-accountable level, and any war chest already above that is
// clipped back (logged once). A sugar-daddy club stays a power; it just can't
// buy the league outright any more.
//
// Inert on any world with no sugar-daddy club — the calibrated man-utd-1999 never
// gives Chelsea that ownership — so this is calibration byte-identical there. It
// bites the moneyed clubs in the 2004 (Chelsea) and 2013 (City) worlds, and funds
// then curbs City in 2009, exactly as reality did.

const FFP_YEAR = 2011;
/** Post-FFP, the benefactor may only fund up to this multiple of a self-funded
 *  club's kitty — richer than sustainable, far short of the old ×2.2 splurge. */
const FFP_SUGAR_HEADROOM = 1.4;
/** Pre-FFP, the benefactor's blank cheque (mirrors OWNERSHIP_BUDGET_MULT). */
const PRE_FFP_SUGAR_MULT = 2.2;

/**
 * Season-rollover funding for sugar-daddy clubs. Pre-2011 the owner tops the
 * budget up to the ×2.2 funded level (an ongoing advantage). From 2011 FFP caps
 * the funding at ×1.4 and clips any excess war chest back to it (logged once per
 * club). Called before the summer window so the constraint bites the same year.
 */
export function applyOwnerFunding(state: GameState): void {
  const year = Number(state.clock.date.slice(0, 4));
  for (const club of Object.values(state.clubs)) {
    if (club.finances.ownership !== 'sugar-daddy') continue;
    const selfFunded = initialFinances(club.prestige, year, 'sustainable', computeWageBill(state, club.id)).transferBudget;

    if (year < FFP_YEAR) {
      // Benefactor top-up: guarantee the rich funded floor, keep any surplus.
      club.finances.transferBudget = Math.max(club.finances.transferBudget, Math.round(selfFunded * PRE_FFP_SUGAR_MULT));
      continue;
    }

    // FFP era: a hard ceiling, never a top-up (FFP constrains, it doesn't fund).
    const cap = Math.round(selfFunded * FFP_SUGAR_HEADROOM);
    club.finances.transferBudget = Math.min(club.finances.transferBudget, cap);
    // Announce the regime change once per club, the first FFP-era summer it is
    // governed — deterministic (calendar-driven), unlike a spend-dependent clip.
    const key = `ffp:${club.id}`;
    if (!state.meta.firedScripted.includes(key)) {
      state.meta.firedScripted.push(key);
      logEvent(state, {
        category: 'event',
        code: 'ffp.constrained',
        message: `Financial Fair Play now governs ${club.name} — the benefactor's blank cheque is gone`,
        data: { clubId: club.id, cap },
      });
    }
  }
}

// ── Increment 2: club pressure → ambition overrides ──────────────────────────
//
// The world pushes back. A high-pressure AI club occasionally makes ONE off-
// ledger statement signing — plausibility-gated, ceiling-guarded, never a hard-
// block breach, always from a foreign/context seller (no domestic cascade, so
// the tracked real players and the real ledger are left intact). This is the
// first mechanic on the branch that is NOT byte-identical: an override changes a
// squad, so the world diverges. It stays deterministic (all rolls forked).

/** How many trophy-less seasons a club of a given prestige tolerates before the
 *  drought bites. Only genuine trophy-expecting clubs feel it; a mid-table side
 *  that never wins isn't "under pressure" for not winning. */
function expectedTitleGap(prestige: number): number {
  if (prestige >= 85) return 2;
  if (prestige >= 80) return 3;
  if (prestige >= 76) return 5;
  if (prestige >= 72) return 8;
  return 99; // no title expectation → no drought pressure
}

function clamp100(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/** The streak-holder at the top of a league's honours (who is dominating, and by
 *  how many consecutive titles) — the driver of everyone else's rivalDominance. */
function currentDominant(championIds: ClubId[]): { id: ClubId | null; streak: number } {
  let id: ClubId | null = null;
  let streak = 0;
  for (const champ of championIds) {
    streak = champ === id ? streak + 1 : 1;
    id = champ;
  }
  return { id, streak };
}

/**
 * Recompute ambition pressure for every simulated AI club (never the user's —
 * the user IS the ambition). Derived fresh each season from honours + grudge, so
 * it's deterministic and path-light. Stored on `club.pressure` for the override
 * step, the Historian and the UI.
 */
export function updateClubPressure(state: GameState): void {
  for (const league of Object.values(state.leagues)) {
    const champions = league.titleHistory.map((t) => t.championId);
    const seasonsElapsed = champions.length;
    const dominant = currentDominant(champions);

    for (const clubId of league.clubIds) {
      if (clubId === state.playerClub) continue;
      const club = state.clubs[clubId];
      if (!club || club.leagueId === null) continue;

      const lastWinIdx = champions.lastIndexOf(clubId);
      const seasonsSinceTitle = lastWinIdx < 0 ? seasonsElapsed : seasonsElapsed - 1 - lastWinIdx;
      const gap = expectedTitleGap(club.prestige);
      const trophyDrought = gap >= 99 ? 0 : clamp100((seasonsSinceTitle - gap) * 18);

      // Someone else is dominating (a runaway user especially) — but a club that
      // is ITSELF the dominant one feels no rival pressure.
      const rivalDominance =
        dominant.id && dominant.id !== clubId && dominant.streak >= 2
          ? clamp100(dominant.streak * 20)
          : 0;

      const windfall = clamp100(club.grudge); // raided → cash in hand, primed to spend
      const unrest = clamp100(trophyDrought * 0.6 + rivalDominance * 0.3 + club.grudge * 0.4);
      const jobSecurity = clamp100(100 - unrest);

      club.pressure = { trophyDrought, jobSecurity, unrest, rivalDominance, windfall };
    }
  }
}

// How hard reality pushes back when the user takes something that was a rival's:
// a grudge boost that feeds `windfall`/`unrest` pressure, priming a statement buy to
// claw the club's real trajectory back.
const TROPHY_THWART = 22; // the user lifted a title reality would have favoured a rival
const SIGNING_THWART = 30; // the user hijacked/blocked a signing that was a rival's in reality

/**
 * Reality reasserts itself at the rival-ambition level. When the user takes
 * something that reality gave another club — a title a strong rival would have
 * contended for, or a real signing the user hijacked or blocked — that club is
 * STUNG (its grudge rises), so next summer it is far likelier to make an off-ledger
 * statement move to restore the balance. Called each season before the pressure
 * recompute so the sting feeds straight into the override step. Deterministic and
 * dated only where the user has actually disrupted reality, so a passive run (and
 * the calibration harness's zero-divergence baseline) never triggers it.
 */
export function applyRealityThwarts(state: GameState): void {
  const seen = (state.meta.thwartedLedger ??= []);

  // Thwarted signings: a real ledger move offered as reality that did NOT happen as
  // reality (the user blocked the sale or hijacked the target) → the intended,
  // simulated buyer is stung into the market.
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (pack) {
    for (const entry of pack.realTransferLedger) {
      const key = entryKey(entry);
      if (seen.includes(key)) continue;
      if (!state.meta.executedLedger.includes(key)) continue; // not yet reached
      if (state.meta.realizedLedger.includes(key)) continue; // happened as in reality
      const buyer = entry.to ? state.clubs[entry.to] : undefined;
      if (!buyer || buyer.leagueId === null || entry.to === state.playerClub) continue;
      seen.push(key);
      buyer.grudge = Math.min(100, buyer.grudge + SIGNING_THWART);
      const player = state.players[entry.playerId];
      logEvent(state, {
        category: 'transfer', code: 'reality.thwarted-signing',
        message: `${buyer.name}, denied ${player?.name ?? 'their target'} by your hand, turn to the market to answer it`,
        data: { clubId: buyer.id, playerId: entry.playerId },
      });
    }
  }

  // Thwarted trophies: a title the user has just taken that reality would have
  // favoured the division's strongest rival → that rival is stung.
  for (const league of Object.values(state.leagues)) {
    if (league.titleHistory.length === 0) continue;
    const last = league.titleHistory[league.titleHistory.length - 1]!;
    if (last.championId !== state.playerClub) continue; // only when the USER took it
    const key = `trophy:${league.id}:${last.seasonYear}`;
    if (seen.includes(key)) continue;
    let rival: ClubState | undefined;
    for (const id of league.clubIds) {
      if (id === state.playerClub) continue;
      const c = state.clubs[id];
      if (!c || c.leagueId === null) continue;
      if (!rival || c.prestige > rival.prestige) rival = c;
    }
    if (!rival) continue;
    seen.push(key);
    rival.grudge = Math.min(100, rival.grudge + TROPHY_THWART);
    logEvent(state, {
      category: 'match', code: 'reality.thwarted-trophy',
      message: `${rival.name}, watching you lift a title reality might have handed them, are stung into the market`,
      data: { clubId: rival.id, seasonYear: last.seasonYear },
    });
  }
}

/** The dominant pressure cause and its magnitude (higher = more pressure). Job
 *  security is inverted (low security = high pressure) so all causes compare on
 *  one scale. */
function dominantPressure(p: ClubPressure): { cause: keyof ClubPressure; score: number } {
  const scores: Record<keyof ClubPressure, number> = {
    trophyDrought: p.trophyDrought,
    rivalDominance: p.rivalDominance,
    unrest: p.unrest,
    windfall: p.windfall,
    jobSecurity: 100 - p.jobSecurity,
  };
  let cause: keyof ClubPressure = 'unrest';
  let score = -1;
  for (const k of Object.keys(scores) as (keyof ClubPressure)[]) {
    if (scores[k] > score) { score = scores[k]; cause = k; }
  }
  return { cause, score };
}

const CAUSE_PHRASE: Record<keyof ClubPressure, string> = {
  trophyDrought: 'a trophy drought',
  rivalDominance: "a rival's dominance",
  unrest: 'board & fan unrest',
  windfall: 'cash to spend',
  jobSecurity: "the manager's job on the line",
};

/** News-desk framing of WHY a club broke the bank — for the marquee narrative
 *  beat, so a statement signing reads like a back-page story, not a ledger row. */
const CAUSE_NEWS: Record<keyof ClubPressure, string> = {
  trophyDrought: 'years without silverware demanding an answer',
  rivalDominance: 'unwilling to keep watching a rival run away with it',
  unrest: 'a restless boardroom demanding a marquee arrival',
  windfall: 'a sale war-chest burning a hole',
  jobSecurity: 'a manager gambling big to save his job',
};

// ── Tunables (calibrated against the harness — the override SHARE target) ──────
const OVERRIDE_THRESHOLD = 44; // dominant-pressure score to be eligible (churn taper bounds the share)
const OVERRIDE_PROB_SLOPE = 0.9; // how sharply probability rises past threshold
const OVERRIDE_MAX_PROB = 0.6; // per-summer ceiling on a single club's chance
const AMBITION_BUDGET_STRETCH = 1.6; // a statement buy stretches, doesn't invent, the budget
const NEED_MIN = -1; // target must be at least (baseStrength + this) — improves the side
const NEED_MAX = 6; // …but at most (baseStrength + this) — a plausible, not fantasy, target

const CHURN_REF = 5; // real ledger moves in a ±1yr window that count as a "busy" market

function overrideProbability(score: number): number {
  const over = Math.max(0, score - OVERRIDE_THRESHOLD) / 100;
  return Math.max(0, Math.min(OVERRIDE_MAX_PROB, over * OVERRIDE_PROB_SLOPE));
}

/** How many real ledger transfers execute within ±1 year of `year` — a proxy for
 *  how busy the real market is right now, i.e. how much genuine AI activity an
 *  override would be a minority of. Front-loaded per era, so it decays as the era's
 *  real churn winds down. */
function localLedgerChurn(state: GameState, year: number): number {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return 0;
  let n = 0;
  for (const e of pack.realTransferLedger) {
    // Only count entries that will actually FIRE — the player exists in this world.
    // A scenario whose ledger references players it doesn't curate (a procedural
    // mid-era start) has ~0 real churn, so its overrides self-throttle to the floor
    // and its share stays bounded even as the base rate rises.
    if (Math.abs(Number(e.window.slice(0, 4)) - year) <= 1 && state.players[e.playerId]) n++;
  }
  return n;
}

/** All players who are subjects of the era's real timeline (ledger moves, near-
 *  misses, academy graduates, retirements). An override never touches these, so
 *  reality-fidelity and squad-match are untouched by the mechanic. */
function realityTimelineSubjects(state: GameState): Set<string> {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  const set = new Set<string>();
  if (!pack) return set;
  for (const e of pack.realTransferLedger) set.add(e.playerId);
  for (const e of pack.nearMisses ?? []) set.add(e.playerId);
  for (const g of pack.academyGraduates ?? []) set.add(g.seed.id);
  for (const r of pack.retirements ?? []) set.add(r.playerId);
  return set;
}

/** Pick a plausible, ceiling-safe target for a club's statement signing, or
 *  undefined if nothing fits. Foreign/context sellers only; never a reality-
 *  timeline subject; never a hard-blocked player; must improve the side without
 *  breaching the plausible ceiling; the target must be willing (§6 prestige pull). */
function pickAmbitionTarget(
  state: GameState,
  club: ClubState,
  subjects: Set<string>,
  year: number,
): PlayerState | undefined {
  const ceiling = plausibleCeiling(club);
  const budgetCap = club.finances.transferBudget * AMBITION_BUDGET_STRETCH;
  let best: PlayerState | undefined;
  for (const p of Object.values(state.players)) {
    if (!p.club) continue;
    const seller = state.clubs[p.club];
    if (!seller || seller.leagueId !== null) continue; // foreign/context only — no domestic cascade
    if (subjects.has(p.id)) continue; // never a tracked real player
    if (p.resistance.hardBlocks.length > 0) continue; // never breach a hard block
    if (p.ability < club.baseStrength + NEED_MIN) continue; // must strengthen the side
    if (p.ability > club.baseStrength + NEED_MAX) continue; // …plausibly, not a galáctico to a mid club
    if (p.ability > ceiling) continue; // ceiling gate — an override can't fantasy-leap a club
    if (valuePlayer(p, year) > budgetCap) continue; // budget reality (a stretch, not invention)
    if (!evaluateApproach(state, { playerId: p.id, toClub: club.id, wageOffer: p.wage * 3 }).willing) continue;
    if (!best || p.ability > best.ability) best = p;
  }
  return best;
}

/**
 * Run the ambition-override step for one summer window (called at the deadline,
 * after the real ledger and counter-punch).
 *
 * At most ONE override per window, across the whole league: a dominant user
 * pressures the entire field, but only the single most-desperate club actually
 * makes the statement move in any given summer. This global cap is what keeps
 * overrides a rare MINORITY of AI activity (the ~10–15% share target) rather than
 * a league-wide spending spree, and it reads truer — a splash-the-cash summer is
 * one club's story, not everyone's at once. Emits `ambition.override` (the event
 * the Historian sampler already watches) and a divergence-log butterfly.
 */
export function runAmbitionOverrides(state: GameState, rng: Rng): void {
  if (state.clock.window !== 'summer') return; // statement signings land in the summer
  const r = rng.fork(`ambition:${state.clock.date}`);
  const year = Number(state.clock.date.slice(0, 4));

  // Eligible = a simulated AI club, with ceiling headroom, over the pressure
  // threshold. Ranked by pressure; ties broken by id for determinism.
  const eligible: Array<{ club: ClubState; cause: keyof ClubPressure; score: number }> = [];
  for (const club of Object.values(state.clubs)) {
    if (club.leagueId === null || club.id === state.playerClub || !club.pressure) continue;
    // A club already near its plausible ceiling has no room for a statement buy —
    // this is what stops a repeat buyer running away (the ceiling IS the cooldown).
    if (club.strength >= plausibleCeiling(club) - 3) continue;
    const { cause, score } = dominantPressure(club.pressure);
    if (score < OVERRIDE_THRESHOLD) continue;
    eligible.push({ club, cause, score });
  }
  if (eligible.length === 0) return;
  eligible.sort((a, b) => b.score - a.score || (a.club.id < b.club.id ? -1 : 1));

  const top = eligible[0]!;
  // One roll for the window, on the most-pressured club's score, scaled by the LOCAL
  // density of real transfer churn. Overrides are meant to be a bounded MINORITY of
  // significant AI activity, but that activity (the real ledger, the override's
  // denominator) is front-loaded per era — so a flat rate balloons the SHARE once
  // reality goes quiet. Tapering by how busy the real market is right now keeps the
  // share bounded over a full career in EVERY era (rich eras keep overrides flowing;
  // a sparse tail thins them), rather than only while the career is cut short by an
  // early sacking. Era-fair, so it doesn't over-suppress a rich-ledger scenario.
  // No floor: a world with zero real transfer churn (a procedural or Serie-B start
  // with no curated market) gets no statement signings — the override share can't
  // balloon against a near-empty denominator.
  const activityTaper = Math.min(1, localLedgerChurn(state, year) / CHURN_REF);
  if (!r.chance(overrideProbability(top.score) * activityTaper)) return;

  // Give the override to the highest-pressure club that actually has a plausible
  // target available (the most desperate club that can act on it).
  const subjects = realityTimelineSubjects(state);
  for (const { club, cause } of eligible) {
    const target = pickAmbitionTarget(state, club, subjects, year);
    if (!target) continue;

    const fee = valuePlayer(target, year);
    club.finances.transferBudget = Math.max(club.finances.transferBudget, fee); // ambition frees the cash
    const fromId: ClubId | null = target.club;
    const res = executeTransfer(state, { playerId: target.id, toClub: club.id, fee });
    if (!res.ok) continue;

    // A genuine statement signing — a wealthy club, or a real star — is a
    // marquee back-page beat the user should feel, not a quiet ledger row.
    const marquee = isMoneyClub(club) || target.ability >= 82;
    const feeM = `£${(fee / 1_000_000).toFixed(0)}m`;
    logEvent(state, {
      category: 'transfer',
      code: 'ambition.override',
      message: marquee
        ? `STATEMENT SIGNING — ${club.name} break the bank for ${target.name} (${feeM}), ${CAUSE_NEWS[cause]}`
        : `${club.name} go off-script for ${target.name} (${feeM}), driven by ${CAUSE_PHRASE[cause]}`,
      data: { override: true, marquee, clubId: club.id, playerId: target.id, from: fromId, fee, cause },
    });
    // Surface it in the narrative feed (§10) — a rival flexing threads across
    // seasons, so the world's ambition is something the user tracks and answers.
    appendMemory(
      state,
      'rival-ambition',
      marquee
        ? `${club.name} made a statement: ${target.name} signed for ${feeM} — ${CAUSE_NEWS[cause]}.`
        : `${club.name} moved off the script for ${target.name} (${feeM}).`,
    );
    state.timeline.divergenceLog.push({
      date: state.clock.date,
      kind: 'butterfly',
      detail: `${club.name}, under ${CAUSE_PHRASE[cause]}, deviated from the real ledger to sign ${target.name} — a pressure-driven ambition override.`,
    });

    // The statement signing relieves the pressure that drove it.
    club.grudge = Math.max(0, club.grudge - 25);
    return; // one override per window
  }
}
