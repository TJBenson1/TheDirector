/**
 * Curated domestic mid-tier top-up — 1995-96 Serie A (M12 shortlist supply).
 *
 * The 1995 Serie A world already curates most clubs, but the non-elite sides
 * are thin. This tops them up with real 1995-96 squad players so options lists
 * read like a real shortlist — Bierhoff at Udinese, a breakout Filippo Inzaghi
 * at Piacenza, Igor Protti (the season's joint top scorer) at Bari, Marcelo
 * Otero at Vicenza, Alexi Lalas at Padova. HIDDEN designer estimates (§7); real
 * clubs, birth years, positions, contracts. Injury proneness at the population
 * norm (~30). Names already curated in the world are omitted.
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

const UDINESE_95: CuratedSeed[] = [
  q('udinese', 'bierhoff_ud95', 'Oliver Bierhoff', 1968, 'Germany', ['ST'], 79, 83, 1999, 30, t(8, 6, 8, 7, 5, 8)),
  q('udinese', 'helveg_ud95', 'Thomas Helveg', 1971, 'Denmark', ['RB', 'RW'], 77, 81, 1998, 30, t(8, 5, 8, 8, 5, 8)),
];

const TORINO_95: CuratedSeed[] = [
  q('torino', 'rizzitelli_to95', 'Ruggiero Rizzitelli', 1967, 'Italy', ['ST'], 77, 78, 1998, 30, t(7, 6, 8, 7, 5, 8)),
  q('torino', 'venturin_to95', 'Giorgio Venturin', 1968, 'Italy', ['CM', 'DM'], 74, 75, 1998, 30, t(8, 5, 8, 8, 5, 8)),
];

const VICENZA_95: CuratedSeed[] = [
  q('vicenza', 'otero_vi95', 'Marcelo Otero', 1971, 'Uruguay', ['AM', 'ST'], 76, 79, 1999, 30, t(6, 7, 8, 7, 6, 8)),
  q('vicenza', 'luiso_vi95', 'Pasquale Luiso', 1969, 'Italy', ['ST'], 74, 76, 1998, 30, t(7, 6, 8, 7, 5, 8)),
];

const CAGLIARI_95: CuratedSeed[] = [
  q('cagliari', 'marcolin_ca95', 'Dario Marcolin', 1971, 'Italy', ['CM', 'AM'], 75, 78, 1998, 30, t(8, 5, 8, 8, 5, 8)),
];

const ATALANTA_95: CuratedSeed[] = [
  q('atalanta', 'ganz_at95', 'Maurizio Ganz', 1968, 'Italy', ['ST'], 76, 78, 1998, 30, t(6, 7, 8, 7, 6, 8)),
];

const PIACENZA_95: CuratedSeed[] = [
  q('piacenza', 'inzaghi_f_pc95', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 76, 86, 1998, 30, t(8, 7, 9, 6, 5, 8)),
  q('piacenza', 'suppa_pc95', 'Antonio Suppa', 1970, 'Italy', ['CM'], 71, 73, 1998, 30, t(8, 5, 8, 8, 5, 8)),
];

const BARI_95: CuratedSeed[] = [
  q('bari', 'protti_ba95', 'Igor Protti', 1967, 'Italy', ['ST'], 78, 79, 1998, 30, t(7, 6, 8, 9, 5, 8), { loyalty: 90 }),
];

const PADOVA_95: CuratedSeed[] = [
  q('padova', 'lalas_pd95', 'Alexi Lalas', 1970, 'United States', ['CB'], 73, 75, 1997, 30, t(7, 7, 8, 7, 6, 8)),
  q('padova', 'galderisi_pd95', 'Giuseppe Galderisi', 1963, 'Italy', ['ST'], 72, 72, 1997, 30, t(7, 6, 8, 8, 5, 8)),
];

/** The domestic mid-tier top-up of the 1995-96 Serie A. Merged by CONCATENATION
 *  into JUVENTUS_1995_SQUADS. */
export const ITA_DOMESTIC_1995_SQUADS: Record<string, CuratedSeed[]> = {
  udinese: UDINESE_95,
  torino: TORINO_95,
  vicenza: VICENZA_95,
  cagliari: CAGLIARI_95,
  atalanta: ATALANTA_95,
  piacenza: PIACENZA_95,
  bari: BARI_95,
  padova: PADOVA_95,
};
