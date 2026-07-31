/**
 * Target suggestion & player query (§16 UI support).
 *
 * Surfaces realistic options for any position, and answers queries about any
 * specific real player — subject to the 16+ rule (§4): a player under 16 is not
 * yet on anyone's radar. Availability reflects reality: a player in the last
 * year of his deal is a Bosman (cheap/free), an unsettled player wants out, and
 * clubs in financial distress or facing relegation are easy pickings (Leeds,
 * Lazio…). Procedural filler never appears here — real players only (Principle 2).
 */

import type { ClubId, GameState, PlayerId, PlayerState, Position, YearMonth } from './types.js';
import { Rng } from './rng.js';
import { parseYearMonth, transferWindowOrdinal } from './clock.js';
import { valuePlayer, inflationFactor } from './finance.js';
import { scoutPlayer, type ScoutReport } from './scouting.js';
import { evaluateApproach, areDirectRivals } from './agency.js';
import { isProcedural, ERA_REALITY, eraForScenario } from './ledger.js';
import { isOnLoan, isPersonaNonGrata } from './restrictions.js';
import { assessSigning, type SigningAssessment } from './signingFit.js';
import { eraImportAffinity } from './culture.js';

const GROUP: Record<Position, string> = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', DM: 'MID', CM: 'MID', AM: 'MID', LW: 'ATT', RW: 'ATT', ST: 'ATT',
};

function year(state: GameState): number {
  return parseYearMonth(state.clock.date).year;
}
function ageOf(state: GameState, p: PlayerState): number {
  return year(state) - p.birthYear;
}

export type AcquisitionTag = 'bosman' | 'unsettled' | 'fire-sale' | 'relegation-threatened';

/** How a player might be prised loose (§ internal-friction). */
export function acquisitionTags(state: GameState, player: PlayerState): AcquisitionTag[] {
  const tags: AcquisitionTag[] = [];
  const club = player.club ? state.clubs[player.club] : undefined;
  if (player.contractUntil - year(state) <= 1) tags.push('bosman');
  if (player.agitation >= 30 || player.morale < 45) tags.push('unsettled');
  if (club && club.financialHealth !== 'healthy') tags.push('fire-sale');
  if (club?.relegationThreatened) tags.push('relegation-threatened');
  return tags;
}

/** How far ahead a real departure can be and still price him NOW — ~two years.
 *  A move further out (a fallen star's cut-price exit, an end-of-career free years
 *  hence) does not reflect what he is worth today: a peak-2000 Vieri is not priced
 *  at his 2005 fee. Beyond this horizon we fall back to the model valuation. */
const REAL_FEE_HORIZON_ORDINALS = 4;

/** What a player REALLY sold for out of his current club, if the era ledger knows
 *  AND the move is near enough to be his current market price — the reality anchor.
 *  A Vidić at Spartak costs roughly what United really paid (~£7m), not the abstract
 *  model value of an 82-rated CB (~£15m): the market discounts an unproven talent in
 *  a lesser league, and the real fee IS that discount. But a real move years away is
 *  NOT today's price (a champion Nedvěd is not priced at some distant cut-price exit),
 *  so only a move within ~2 years anchors; otherwise return null and use the model.
 *  Inflation-adjusted from the real transfer's window to now. */
function realMarketFee(state: GameState, p: PlayerState): number | null {
  if (!p.club) return null;
  const ledger = ERA_REALITY[eraForScenario(state.meta.scenarioId)]?.realTransferLedger;
  if (!ledger) return null;
  // His real departure FROM where he sits now — the market-clearing price for
  // prising him loose. (Once he has really moved on, the entry no longer applies.)
  const entries = ledger.filter((e) => e.playerId === p.id && e.from === p.club && e.fee > 0);
  if (!entries.length) return null;
  entries.sort((a, b) => a.window.localeCompare(b.window));
  const e = entries[0]!;
  // Only a near-term real move sets his price now; a distant one doesn't.
  if (transferWindowOrdinal(e.window) - transferWindowOrdinal(state.clock.date) > REAL_FEE_HORIZON_ORDINALS) {
    return null;
  }
  const entryYear = Number(e.window.slice(0, 4));
  return e.fee * (inflationFactor(year(state)) / inflationFactor(entryYear));
}

/** The fee a selling club would realistically accept. Anchored to the player's
 *  REAL sale fee when the ledger knows it (reality-default pricing), else the model
 *  valuation. Distress/relegation cut it further; a Bosman is already cheap via the
 *  contract factor in valuePlayer. */
export function askingPrice(state: GameState, playerId: PlayerId): number {
  const p = state.players[playerId];
  if (!p) return 0;
  const club = p.club ? state.clubs[p.club] : undefined;
  let mult = 1;
  if (club?.financialHealth === 'crisis') mult *= 0.5;
  else if (club?.financialHealth === 'strained') mult *= 0.72;
  if (club?.relegationThreatened) mult *= 0.75;
  const base = realMarketFee(state, p) ?? valuePlayer(p, year(state));
  return Math.max(50_000, Math.round((base * mult) / 100_000) * 100_000);
}

export interface TargetSuggestion {
  playerId: PlayerId;
  name: string;
  club: ClubId | null;
  clubName: string;
  age: number;
  ability: ScoutReport['ability'];
  potential: ScoutReport['potential'];
  confidence: ScoutReport['confidence'];
  askingPrice: number;
  tags: AcquisitionTag[];
  willing: boolean;
  resistanceReason: string;
}

export interface SuggestOptions {
  maxResults?: number;
  /** Only players within this fee (e.g. the user's budget). */
  maxPrice?: number;
  /** Bias toward easy-to-acquire options (bosman/unsettled/distressed). */
  favourAvailable?: boolean;
  /**
   * Prospect mode (§4, §16): surface the young talents with the most UPSIDE for a
   * position — ranked by scouted POTENTIAL rather than current ability — so a
   * teenage Kirkland or a raw Gareth Barry is listable, not buried beneath the
   * established names. Restricts to players who are both young and yet to arrive.
   */
  prospects?: boolean;
}

/** The oldest a player can be to count as a "prospect" (§4). */
const PROSPECT_MAX_AGE = 21;
/** How much scouted upside (ceiling over current ability) a prospect must show. */
const PROSPECT_MIN_UPSIDE = 5;

/**
 * Suggest realistic targets for a position, ranked by ability with a boost for
 * acquirability so genuine opportunities surface. Real players only, ≥16,
 * not at the user's club, scout-fogged.
 */
export function suggestTargets(
  state: GameState,
  position: Position,
  opts: SuggestOptions = {},
): TargetSuggestion[] {
  const max = opts.maxResults ?? 8;
  const group = GROUP[position];
  const rows: Array<{ s: TargetSuggestion; score: number; exact: boolean }> = [];
  for (const p of Object.values(state.players)) {
    if (isProcedural(p)) continue; // real players only
    if (p.retired) continue; // hung up his boots
    if (p.club === state.playerClub || p.club === null) continue;
    if (ageOf(state, p) < 16) continue; // 16+ rule
    // A direct rival will not sell you a player to strengthen you — don't dangle
    // Seaman to a United manager. (You can still chase a dream by naming him.)
    if (areDirectRivals(state, p.club, state.playerClub)) continue;
    // On loan (owned elsewhere) or a returning villain — never a real target.
    if (isOnLoan(p.id)) continue;
    if (isPersonaNonGrata(state.playerClub, p)) continue;
    // A true specialist in the EXACT position (an actual right-back for an RB
    // query) versus a positional-group cousin (a centre-back, who shares the DEF
    // group). Both are eligible, but exact matches are ranked first below so a
    // request for a right-back returns right-backs, not the best available CB.
    const exact = p.positions.includes(position);
    const inPosition = exact || p.positions.some((pos) => GROUP[pos] === group);
    if (!inPosition) continue;

    const price = askingPrice(state, p.id);
    // Young talent carries an upside premium, so a tight budget would return an
    // empty prospect list; allow a stretch (×1.5) in prospect mode so the closest
    // young options still surface (with their real price shown), not nothing.
    const priceCap = opts.maxPrice !== undefined && opts.prospects ? opts.maxPrice * 1.5 : opts.maxPrice;
    if (priceCap !== undefined && price > priceCap) continue;

    const tags = acquisitionTags(state, p);
    const verdict = evaluateApproach(state, { playerId: p.id, toClub: state.playerClub });
    // A franchise player (80+) settled at a strong, healthy club, with no lever
    // (out of contract / unsettled / distress), is not realistically on the market —
    // Kahn does not leave Bayern for the asking. Don't dangle him on the shortlist.
    const seller = p.club ? state.clubs[p.club] : undefined;
    const unraidable =
      !verdict.willing && tags.length === 0 && p.ability >= 80 &&
      !!seller && seller.prestige >= 82 && seller.financialHealth === 'healthy';
    if (unraidable) continue;
    const report = scoutPlayer(state, state.playerClub, p.id, deterministicScoutRng(state, p.id), { observation: 0.5 });

    // Prospect mode: only the young with real upside, ranked by scouted ceiling.
    if (opts.prospects) {
      if (ageOf(state, p) > PROSPECT_MAX_AGE) continue;
      if (p.potentialCeiling - p.ability < PROSPECT_MIN_UPSIDE) continue;
    }

    // Availability nudges the ranking but must not DOMINATE it — an over-heavy
    // "won't move" penalty buried every continental target beneath home-league
    // players (who are likelier to fancy a domestic switch), making shortlists read
    // as all-Premier-League. Keep the signal (willingness is still returned per
    // target) but let ability/upside lead, so real foreign options surface too.
    const availability = tags.length * (opts.favourAvailable ? 9 : 5) + (verdict.willing ? 3 : -3);
    // Era import-culture (§ market realism): a shortlist for an English club in
    // 2001 should read British-and-French, not full of exotic teenagers the era
    // wouldn't touch — but by 2014 the market is global. A soft nudge only (0 for
    // an era-appropriate profile, down to ~-7 for a distant one), so the signal
    // never buries a genuinely better player; it just orders the plausible ones.
    const userLeague = state.clubs[state.playerClub]?.leagueId;
    const affinity = eraImportAffinity(userLeague, Number(state.clock.date.slice(0, 4)), p.nationality);
    const cultureNudge = (affinity - 1) * 7;
    // Prospects rank by upside (scouted potential, fog-aware); senior targets by
    // present ability.
    const base = opts.prospects ? (report.potential.low + report.potential.high) / 2 : p.ability;
    const score = base + availability + cultureNudge;
    rows.push({
      score,
      exact,
      s: {
        playerId: p.id,
        name: p.name,
        club: p.club,
        clubName: p.club ? state.clubs[p.club]?.name ?? p.club : 'Free agent',
        age: ageOf(state, p),
        ability: report.ability,
        potential: report.potential,
        confidence: report.confidence,
        askingPrice: price,
        tags,
        willing: verdict.willing,
        resistanceReason: verdict.reason,
      },
    });
  }
  // Exact-position specialists first, then by score; positional-group cousins only
  // fill the remaining slots when true specialists are scarce. So an RB query lists
  // right-backs and drops to centre-backs only if there aren't enough real RBs.
  rows.sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score);
  return rows.slice(0, max).map((r) => r.s);
}

/** A marquee real arrival the club actually made — offered to the Director as a
 *  live decision this window (the Figo move Pérez really did, on day one). */
export interface RealInboundTarget {
  playerId: PlayerId;
  name: string;
  fromClub: string;
  toClub: string;
  fee: number;
  window: YearMonth;
}

/**
 * The real signings the club is positioned to make THIS window — the era ledger's
 * inbound entries to the user's club whose window is live now (Figo → Real Madrid
 * in 2000-07). These are the marquee decisions history put on the Director's desk;
 * surfacing the headline one gives the opening its "sign the deal Pérez really did"
 * hook. Pure ledger read (no RNG), ranked by fee (the biggest statement first).
 * A player already at the club, retired, or under 16 is filtered out. */
export function realInboundThisWindow(state: GameState): RealInboundTarget[] {
  const ledger = ERA_REALITY[eraForScenario(state.meta.scenarioId)]?.realTransferLedger;
  if (!ledger) return [];
  const now = state.clock.date;
  const out: RealInboundTarget[] = [];
  for (const e of ledger) {
    if (e.to !== state.playerClub) continue;
    if (e.window !== now) continue;
    const p = state.players[e.playerId];
    if (!p || p.retired) continue;
    if (p.club === state.playerClub) continue; // already ours
    if (ageOf(state, p) < 16) continue;
    out.push({
      playerId: e.playerId,
      name: p.name,
      fromClub: e.from ? state.clubs[e.from]?.name ?? e.from : 'a free transfer',
      toClub: state.clubs[state.playerClub]?.name ?? state.playerClub,
      fee: e.fee,
      window: e.window,
    });
  }
  out.sort((a, b) => b.fee - a.fee);
  return out;
}

/** A real DEPARTURE the club made this window — one of your own players whose
 *  reality was a move OUT (Baggio → Milan, 1995). The Director can sanction the
 *  sale (bank the fee) or keep him at NO fee (he simply doesn't leave). */
export interface RealDeparture {
  playerId: PlayerId;
  name: string;
  toClub: string;
  toClubId: ClubId;
  /** The real fee the BUYER paid — what you bank if you sanction the sale, never
   *  a cost to keep him. Keeping your own player is always free. */
  fee: number;
  window: YearMonth;
}

/**
 * The real departures FROM the user's club this window — the mirror of
 * realInboundThisWindow. These are your own players history sold on (Baggio to
 * Milan in 1995-07): a reality-default "sanction the sale or keep him" call.
 * Keeping costs nothing — the fee is what a sanctioned sale BANKS, not a price to
 * retain him. Skips a player already gone or a move already realized. Pure ledger
 * read (no RNG). */
export function realDepartureThisWindow(state: GameState): RealDeparture[] {
  const ledger = ERA_REALITY[eraForScenario(state.meta.scenarioId)]?.realTransferLedger;
  if (!ledger) return [];
  const now = state.clock.date;
  const done = new Set(state.meta.realizedLedger);
  const out: RealDeparture[] = [];
  for (const e of ledger) {
    if (e.from !== state.playerClub) continue;
    if (e.window !== now) continue;
    const key = e.id ?? `${e.playerId}@${e.window}->${e.to}`;
    if (done.has(key)) continue; // already sold on
    const p = state.players[e.playerId];
    if (!p || p.retired) continue;
    if (p.club !== state.playerClub) continue; // already left
    out.push({
      playerId: e.playerId,
      name: p.name,
      toClub: state.clubs[e.to]?.name ?? e.to,
      toClubId: e.to,
      fee: e.fee,
      window: e.window,
    });
  }
  out.sort((a, b) => b.fee - a.fee);
  return out;
}

export interface PlayerQuery {
  visible: boolean;
  note?: string;
  report?: ScoutReport;
  age?: number;
  clubName?: string;
  tags?: AcquisitionTag[];
  askingPrice?: number;
  willing?: boolean;
  resistanceReason?: string;
  /** Would he improve the SIDE? Position-aware role + arguments for and against. */
  fit?: SigningAssessment;
}

/** Query any specific real player — visible only if he is at least 16 (§4). */
export function queryPlayer(state: GameState, idOrName: string): PlayerQuery {
  const p = resolvePlayer(state, idOrName);
  if (!p) return { visible: false, note: `No player matching "${idOrName}".` };
  if (isProcedural(p)) return { visible: false, note: `${p.name} is squad filler, not a tracked player.` };
  const age = ageOf(state, p);
  if (age < 16) {
    return { visible: false, note: `${p.name} is only ${age} — not yet on the radar (the 16+ rule).` };
  }
  const verdict = evaluateApproach(state, { playerId: p.id, toClub: state.playerClub });
  return {
    visible: true,
    report: scoutPlayer(state, state.playerClub, p.id, deterministicScoutRng(state, p.id), { observation: 0.6 }),
    age,
    clubName: p.club ? state.clubs[p.club]?.name ?? p.club : 'Free agent',
    tags: acquisitionTags(state, p),
    askingPrice: askingPrice(state, p.id),
    willing: verdict.willing,
    resistanceReason: verdict.reason,
    fit: assessSigning(state, state.playerClub, p),
  };
}

/** Resolve a player by id or (case-insensitive) name. Name matching considers
 *  CURATED (real) players only — procedural filler is anonymous depth (Principle
 *  2), and its generated names can coincidentally reuse a real surname, so a
 *  query for "Drogba" must never resolve to a procedural "Kolo Drogba". */
export function resolvePlayer(state: GameState, idOrName: string): PlayerState | undefined {
  if (state.players[idOrName]) return state.players[idOrName];
  const needle = idOrName.toLowerCase();
  const real = Object.values(state.players).filter((p) => p.curated);
  // Prefer an exact full-name match, then a whole-word (first/surname) match —
  // so "Bale" finds Gareth Bale, not the "bale" inside "Zabaleta" — and only
  // then fall back to a loose substring match.
  return (
    real.find((p) => p.name.toLowerCase() === needle) ??
    real.find((p) => p.name.toLowerCase().split(/\s+/).includes(needle)) ??
    real.find((p) => p.name.toLowerCase().includes(needle))
  );
}

function deterministicScoutRng(state: GameState, playerId: PlayerId): Rng {
  return new Rng(state.meta.rngState).fork(`recommend:${playerId}`);
}
