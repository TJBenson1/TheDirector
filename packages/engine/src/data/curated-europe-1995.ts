/**
 * European selling clubs — 1995-96 (M12A rollout, the talent pipeline).
 *
 * Foreign context sellers for the 1995 Serie A world (juventus-1995 / milan-1995),
 * whose Italian league is modelled: PSV (a young Ronaldo & Nilis), Feyenoord
 * (Ronald Koeman), Benfica, Celtic, SuperDepor (Bebeto, Rivaldo) and Valencia
 * (Mijatović, Mendieta). Ability/potential/personality are HIDDEN designer
 * estimates (§7); clubs, birth years, positions and contracts are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';

type Trait = PlayerState['personality'];
const t = (prof: number, ego: number, amb: number, loy: number, vol: number, adapt: number): Trait => ({
  professionalism: prof, ego, ambition: amb, loyalty: loy, volatility: vol, adaptability: adapt,
});
function q(
  club: ClubId, id: string, name: string, birthYear: number, nationality: string, positions: Position[],
  ability: number, potentialCeiling: number, contractUntil: number, injuryProneness: number, personality: Trait,
  extra: { hardBlocks?: HardBlock[]; loyalty?: number } = {},
): CuratedSeed {
  return { id: `cur_${id}`, name, birthYear, nationality, positions, club, contractUntil, ability, potentialCeiling, personality, injuryProneness, ...extra };
}

// ── PSV, 1995-96 (a 19-year-old Ronaldo tearing up the Eredivisie) ─────────────
const PSV_95: CuratedSeed[] = [
  // The real 1995-96 Ronaldo: at PSV, a year before his world-record move to Barça
  // (that PSV→Barcelona 1996 move is in LEDGER_1995_2001).
  q('psv', 'ronaldo_r', 'Ronaldo', 1976, 'Brazil', ['ST'], 88, 94, 1998, 60, t(6, 8, 8, 5, 6, 7)),
  q('psv', 'zenden_ps95', 'Boudewijn Zenden', 1976, 'Netherlands', ['LW', 'AM'], 74, 84, 1999, 20, t(8, 5, 8, 7, 5, 8)),
  q('psv', 'nilis_ps95', 'Luc Nilis', 1967, 'Belgium', ['ST'], 81, 82, 1998, 20, t(9, 6, 8, 8, 4, 8)),
  q('psv', 'numan_ps95', 'Arthur Numan', 1969, 'Netherlands', ['LB'], 78, 81, 1998, 20, t(9, 5, 8, 8, 4, 8)),
  q('psv', 'jonk_ps95', 'Wim Jonk', 1966, 'Netherlands', ['CM', 'AM'], 79, 80, 1998, 20, t(9, 5, 8, 8, 5, 8)),
  q('psv', 'valckx_ps95', 'Stan Valckx', 1963, 'Netherlands', ['CB'], 76, 77, 1997, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── Feyenoord, 1995-96 (Ronald Koeman's twilight) ──────────────────────────────
const FEYENOORD_95: CuratedSeed[] = [
  q('feyenoord', 'koeman_r95', 'Ronald Koeman', 1963, 'Netherlands', ['CB', 'DM'], 81, 82, 1997, 20, t(9, 6, 8, 8, 5, 8)),
  q('feyenoord', 'de_goey_95', 'Ed de Goey', 1966, 'Netherlands', ['GK'], 79, 81, 1997, 20, t(9, 5, 8, 8, 5, 7)),
  q('feyenoord', 'taument_95', 'Gaston Taument', 1970, 'Netherlands', ['RW', 'LW'], 76, 78, 1997, 20, t(7, 6, 8, 7, 5, 8)),
  q('feyenoord', 'blinker_95', 'Regi Blinker', 1969, 'Netherlands', ['LW', 'AM'], 75, 78, 1997, 20, t(7, 6, 8, 7, 5, 8)),
  q('feyenoord', 'obiku_95', 'Mike Obiku', 1970, 'Nigeria', ['ST'], 73, 76, 1997, 20, t(7, 5, 8, 7, 5, 8)),
];

// ── Benfica, 1995-96 ────────────────────────────────────────────────────────────
const BENFICA_95: CuratedSeed[] = [
  q('benfica', 'joao_pinto_95', 'João Vieira Pinto', 1971, 'Portugal', ['AM', 'ST'], 80, 82, 1998, 25, t(6, 7, 8, 7, 6, 8)),
  q('benfica', 'helder_95', 'Hélder', 1971, 'Portugal', ['CB'], 76, 79, 1998, 20, t(8, 5, 8, 8, 5, 7)),
  q('benfica', 'paulao_95', 'Paulão', 1972, 'Brazil', ['CB'], 75, 78, 1998, 20, t(8, 5, 8, 7, 5, 8)),
  q('benfica', 'kenedy_95', 'Kenedy', 1965, 'Brazil', ['AM', 'CM'], 75, 76, 1997, 20, t(7, 6, 8, 7, 5, 8)),
  q('benfica', 'valdo_95', 'Valdo', 1964, 'Brazil', ['AM', 'CM'], 76, 77, 1997, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── Celtic, 1995-96 (Van Hooijdonk & Andreas Thom) ─────────────────────────────
const CELTIC_95: CuratedSeed[] = [
  q('celtic', 'van_hooijdonk_95', 'Pierre van Hooijdonk', 1969, 'Netherlands', ['ST'], 79, 81, 1998, 25, t(6, 7, 8, 6, 6, 8)),
  q('celtic', 'thom_95', 'Andreas Thom', 1965, 'Germany', ['AM', 'ST'], 78, 79, 1997, 20, t(8, 6, 8, 7, 5, 8)),
  q('celtic', 'collins_j95', 'John Collins', 1968, 'Scotland', ['CM'], 78, 80, 1997, 20, t(9, 5, 8, 8, 4, 8)),
  q('celtic', 'donnelly_95', 'Simon Donnelly', 1974, 'Scotland', ['ST', 'AM'], 73, 78, 1998, 20, t(7, 5, 8, 8, 5, 7)),
  q('celtic', 'mckinlay_95', 'Tosh McKinlay', 1964, 'Scotland', ['LB'], 74, 75, 1997, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── Deportivo La Coruña, 1995-96 (SuperDepor: Bebeto, Rivaldo, Fran) ────────────
const DEPORTIVO_95: CuratedSeed[] = [
  q('deportivo', 'rivaldo_dep95', 'Rivaldo', 1972, 'Brazil', ['AM', 'ST'], 83, 90, 1997, 20, t(7, 7, 9, 6, 5, 8)),
  q('deportivo', 'bebeto_95', 'Bebeto', 1964, 'Brazil', ['ST', 'AM'], 82, 83, 1997, 20, t(8, 6, 8, 8, 5, 8)),
  q('deportivo', 'fran_95', 'Fran', 1969, 'Spain', ['AM', 'LW'], 79, 81, 1998, 20, t(8, 5, 8, 9, 5, 8), { loyalty: 92 }),
  q('deportivo', 'mauro_silva_95', 'Mauro Silva', 1968, 'Brazil', ['DM'], 80, 81, 1998, 20, t(9, 5, 8, 9, 4, 8)),
  q('deportivo', 'donato_95', 'Donato', 1962, 'Spain', ['CB', 'DM'], 78, 79, 1997, 20, t(9, 5, 8, 8, 5, 7)),
  q('deportivo', 'naybet_95', 'Noureddine Naybet', 1970, 'Morocco', ['CB'], 79, 81, 1998, 20, t(9, 5, 8, 8, 5, 8)),
];

// ── Valencia, 1995-96 (Mijatović & a young Mendieta) ───────────────────────────
const VALENCIA_95: CuratedSeed[] = [
  q('valencia', 'djukic_95', 'Miroslav Đukić', 1966, 'Serbia', ['CB'], 79, 80, 1998, 20, t(9, 5, 8, 8, 5, 7)),
  q('valencia', 'mendieta_95', 'Gaizka Mendieta', 1974, 'Spain', ['CM', 'AM'], 78, 86, 1999, 20, t(9, 5, 8, 8, 4, 8)),
  q('valencia', 'penev_95', 'Lyuboslav Penev', 1966, 'Bulgaria', ['ST'], 79, 80, 1997, 25, t(7, 6, 8, 7, 6, 8)),
  q('valencia', 'poyatos_95', 'Fernando Giner', 1964, 'Spain', ['CB', 'RB'], 76, 77, 1997, 20, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('valencia', 'mazinho_95', 'Mazinho', 1966, 'Brazil', ['DM', 'CM'], 78, 79, 1997, 20, t(8, 5, 8, 7, 5, 8)),
];

/** The non-Italian European selling clubs of the 1995-96 world, shared context for
 *  the juventus-1995 and milan-1995 universes. Merged by CONCATENATION. */
export const EUROPE_1995_SQUADS: Record<string, CuratedSeed[]> = {
  psv: PSV_95,
  feyenoord: FEYENOORD_95,
  benfica: BENFICA_95,
  celtic: CELTIC_95,
  deportivo: DEPORTIVO_95,
  valencia: VALENCIA_95,
};
