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

import type { ClubId, GameState, PlayerId, PlayerState, Position } from './types.js';
import { Rng } from './rng.js';
import { parseYearMonth } from './clock.js';
import { valuePlayer } from './finance.js';
import { scoutPlayer, type ScoutReport } from './scouting.js';
import { evaluateApproach } from './agency.js';
import { isProcedural } from './ledger.js';

const GROUP: Record<Position, string> = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', DM: 'MID', CM: 'MID', AM: 'MID', LW: 'ATT', RW: 'ATT', ST: 'ATT',
};

function year(state: GameState): number {
  return parseYearMonth(state.clock.date).year;
}
function ageOf(state: GameState, p: PlayerState): number {
  return year(state) - p.birthYear;
}

export type AcquisitionTag = 'bosman' | 'unsettled' | 'fire-sale' | 'relegation-threatened' | 'step-up' | 'one-club-man' | 'depth';

/** Highest ability a procedural (uncurated) player is offered at — above this a
 *  fabricated player would masquerade as a star, which Principle 2 forbids. Below
 *  it he is honest squad DEPTH: the countless serviceable pros the database does
 *  not name individually (a West Ham / Everton / lower-league squad player). */
const DEPTH_ABILITY_CAP = 80;

/** Is this procedural filler signable as DEPTH? A serviceable squad player at
 *  another club — never a fabricated star (ability cap) and never a fictional
 *  wonderkid (young + high ceiling), so prospect DISCOVERY stays real-only. */
function isSignableDepth(state: GameState, p: PlayerState): boolean {
  if (!isProcedural(p)) return false;
  if (p.club === state.playerClub || p.club === null) return false;
  if (p.ability > DEPTH_ABILITY_CAP) return false; // no fabricated stars
  if (ageOf(state, p) <= 21 && p.potentialCeiling >= 82) return false; // no fictional gems
  return true;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** How OPEN a player is to being prised loose by his club's distress or by a
 *  bigger suitor. A loyal one-club icon FOLLOWS his club down rather than cash in
 *  on its trouble — Del Piero, Buffon, Nedvěd and Trézéguet all stayed for
 *  Juventus's Serie B season after Calciopoli — so his loyalty cancels the
 *  fire-sale / food-chain cut. The gettable bargains a distressed club really
 *  does part with are the LOWER-loyalty squad players around those icons.
 *  1 = fully gettable · 0 = a loyal icon reality's fire-sale never touched. */
function openness(player: PlayerState): number {
  const loyalty = player.resistance?.clubLoyalty ?? 50;
  return clamp01((86 - loyalty) / 24); // ≥86 shielded, ≤62 fully open
}

/** How a player might be prised loose (§ internal-friction). A `buyerClubId`
 *  surfaces the FOOD-CHAIN 'step-up' opportunity: a much bigger club can prise a
 *  player from a smaller selling club before his value explodes. A loyal one-club
 *  man is flagged as such and is NOT surfaced as a fire-sale/step-up bargain. */
export function acquisitionTags(state: GameState, player: PlayerState, buyerClubId?: ClubId): AcquisitionTag[] {
  const tags: AcquisitionTag[] = [];
  const club = player.club ? state.clubs[player.club] : undefined;
  const open = openness(player);
  if (player.contractUntil - year(state) <= 1) tags.push('bosman');
  if (player.agitation >= 30 || player.morale < 45) tags.push('unsettled');
  // A loyal icon rides out his club's distress — not a fire-sale, however deep
  // the trouble. Surface WHY (he won't be a cheap way in) rather than dangling him.
  const loyalIcon = open <= 0.15;
  if (club && club.financialHealth !== 'healthy' && !loyalIcon) tags.push('fire-sale');
  if (club?.relegationThreatened && !loyalIcon) tags.push('relegation-threatened');
  const buyer = buyerClubId ? state.clubs[buyerClubId] : undefined;
  if (buyer && club && buyer.prestige > club.prestige + 8 && !loyalIcon) tags.push('step-up');
  if (loyalIcon && club) tags.push('one-club-man');
  // A procedural squad player is honest DEPTH (not one of the named stars).
  if (isProcedural(player) && club) tags.push('depth');
  return tags;
}

/** The fee a selling club would realistically accept. Cut by distress/relegation
 *  (a Bosman is already cheap via the contract factor in valuePlayer) and — when
 *  a `buyerClubId` is given — by the FOOD CHAIN: a smaller "selling club" is a
 *  motivated seller to a much bigger suitor. It can't realistically hold the
 *  player and banks the fee to reinvest, so it takes a discount from the elite.
 *  This is what lets a big side pick apart the feeder clubs (Porto, PSV, Ajax,
 *  Lyon…) before a talent's value explodes; a peer or a smaller buyer pays full. */
export function askingPrice(state: GameState, playerId: PlayerId, buyerClubId?: ClubId): number {
  const p = state.players[playerId];
  if (!p) return 0;
  const club = p.club ? state.clubs[p.club] : undefined;
  const buyer = buyerClubId ? state.clubs[buyerClubId] : undefined;
  // Loyalty shields a one-club icon from his club's fire-sale: the discounts
  // below are scaled by how OPEN he is, so a Del-Piero-type follows the club down
  // at (near) full value while a lower-loyalty squad player is the real bargain.
  const open = openness(p);
  const scale = (factor: number): number => 1 - (1 - factor) * open;
  let mult = 1;
  if (club?.financialHealth === 'crisis') mult *= scale(0.5);
  else if (club?.financialHealth === 'strained') mult *= scale(0.72);
  if (club?.relegationThreatened) mult *= scale(0.75);
  if (buyer && club && buyer.prestige > club.prestige + 4) {
    // ~1.8% off per prestige point of gap beyond 4, capped at ~32% — a genuine
    // "food-chain" raid discount (Arsenal→Porto ≈ 13% off) that a distressed
    // small club stacks on top of its fire-sale cut. Also loyalty-scaled: a loyal
    // man at a feeder club won't leave on the cheap either.
    mult *= scale(Math.max(0.68, 1 - (buyer.prestige - club.prestige - 4) * 0.018));
  }
  return Math.max(50_000, Math.round((valuePlayer(p, year(state)) * mult) / 100_000) * 100_000);
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
}

/**
 * Suggest realistic targets for a position, ranked by ability with a boost for
 * acquirability so genuine opportunities surface. Named real players PLUS
 * procedural squad DEPTH (a serviceable RB from West Ham / a lower-league club) —
 * so recruitment isn't limited to the famous few. ≥16, not at the user's club,
 * scout-fogged. Prospect discovery stays real-only (a depth signing is not a gem).
 */
export function suggestTargets(
  state: GameState,
  position: Position,
  opts: SuggestOptions = {},
): TargetSuggestion[] {
  const max = opts.maxResults ?? 8;
  const group = GROUP[position];
  const rows: Array<{ s: TargetSuggestion; score: number }> = [];
  for (const p of Object.values(state.players)) {
    if (p.club === state.playerClub || p.club === null) continue;
    if (ageOf(state, p) < 16) continue; // 16+ rule
    const proc = isProcedural(p);
    if (proc && !isSignableDepth(state, p)) continue; // filler surfaces only as depth
    const inPosition = p.positions.includes(position) || p.positions.some((pos) => GROUP[pos] === group);
    if (!inPosition) continue;

    const price = askingPrice(state, p.id, state.playerClub);
    if (opts.maxPrice !== undefined && price > opts.maxPrice) continue;

    const tags = acquisitionTags(state, p, state.playerClub);
    const verdict = evaluateApproach(state, { playerId: p.id, toClub: state.playerClub });
    const report = scoutPlayer(state, state.playerClub, p.id, deterministicScoutRng(state, p.id), { observation: 0.5 });

    const availability = tags.length * (opts.favourAvailable ? 9 : 5) + (verdict.willing ? 4 : -6);
    // A named real player edges an equally-rated bit of depth (you'd take the
    // known quantity), but willing/affordable depth still beats an unwilling star.
    const score = p.ability + availability - (proc ? 2 : 0);
    rows.push({
      score,
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
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, max).map((r) => r.s);
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
}

/** Query any specific real player — visible only if he is at least 16 (§4). */
export function queryPlayer(state: GameState, idOrName: string): PlayerQuery {
  const p = resolvePlayer(state, idOrName);
  if (!p) return { visible: false, note: `No player matching "${idOrName}".` };
  // Procedural filler is inspectable as DEPTH only when addressed by its exact id
  // (i.e. surfaced from suggestTargets) — never discoverable by a coincidental
  // name search, which stays real-only (resolvePlayer only name-matches curated).
  if (isProcedural(p) && !isSignableDepth(state, p)) {
    return { visible: false, note: `${p.name} is squad filler, not a tracked player.` };
  }
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
    tags: acquisitionTags(state, p, state.playerClub),
    askingPrice: askingPrice(state, p.id, state.playerClub),
    willing: verdict.willing,
    resistanceReason: verdict.reason,
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
