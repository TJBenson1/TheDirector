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

/** The fee a selling club would realistically accept (distress/relegation cut
 *  it; a Bosman is already cheap via the contract factor in valuePlayer). */
export function askingPrice(state: GameState, playerId: PlayerId): number {
  const p = state.players[playerId];
  if (!p) return 0;
  const club = p.club ? state.clubs[p.club] : undefined;
  let mult = 1;
  if (club?.financialHealth === 'crisis') mult *= 0.5;
  else if (club?.financialHealth === 'strained') mult *= 0.72;
  if (club?.relegationThreatened) mult *= 0.75;
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
  const rows: Array<{ s: TargetSuggestion; score: number }> = [];
  for (const p of Object.values(state.players)) {
    if (isProcedural(p)) continue; // real players only
    if (p.club === state.playerClub || p.club === null) continue;
    if (ageOf(state, p) < 16) continue; // 16+ rule
    const inPosition = p.positions.includes(position) || p.positions.some((pos) => GROUP[pos] === group);
    if (!inPosition) continue;

    const price = askingPrice(state, p.id);
    if (opts.maxPrice !== undefined && price > opts.maxPrice) continue;

    const tags = acquisitionTags(state, p);
    const verdict = evaluateApproach(state, { playerId: p.id, toClub: state.playerClub });
    const report = scoutPlayer(state, state.playerClub, p.id, deterministicScoutRng(state, p.id), { observation: 0.5 });

    const availability = tags.length * (opts.favourAvailable ? 9 : 5) + (verdict.willing ? 4 : -6);
    const score = p.ability + availability;
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
