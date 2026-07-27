/**
 * Curated domestic mid-tier — 2004-05 Serie A (M12 shortlist supply).
 *
 * Real 2004-05 squad players at the modelled Serie A's non-elite clubs for the
 * inter-2004 world, so options lists read like a real shortlist — Di Natale's
 * Udinese, Luca Toni & a young Barzagli at Palermo, Gilardino's Parma, Lucarelli's
 * Livorno, Zola & Suazo at Cagliari, a teenage Vučinić at Lecce. HIDDEN designer
 * estimates (§7); real clubs, birth years, positions, contracts. Injury proneness
 * at the population norm (~30). Names already curated in the world are omitted.
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

const UDINESE_04: CuratedSeed[] = [
  q('udinese', 'de_sanctis_ud04', 'Morgan De Sanctis', 1977, 'Italy', ['GK'], 78, 80, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('udinese', 'felipe_ud04', 'Felipe', 1978, 'Brazil', ['CB'], 76, 78, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('udinese', 'jankulovski_ud04', 'Marek Jankulovski', 1977, 'Czechia', ['LB', 'LW'], 78, 80, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('udinese', 'pizarro_d_ud04', 'David Pizarro', 1979, 'Chile', ['CM', 'DM'], 80, 83, 2007, 30, t(8, 6, 8, 7, 5, 8)),
  q('udinese', 'muntari_ud04', 'Sulley Muntari', 1984, 'Ghana', ['CM', 'DM'], 76, 82, 2008, 30, t(7, 6, 8, 7, 6, 8)),
  q('udinese', 'di_natale_ud04', 'Antonio Di Natale', 1977, 'Italy', ['ST', 'LW'], 80, 85, 2008, 30, t(8, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('udinese', 'iaquinta_ud04', 'Vincenzo Iaquinta', 1979, 'Italy', ['ST'], 78, 82, 2007, 30, t(7, 6, 8, 7, 5, 8)),
];

const PALERMO_04: CuratedSeed[] = [
  q('palermo', 'fontana_pa04', 'Alberto Fontana', 1967, 'Italy', ['GK'], 74, 75, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('palermo', 'barzagli_pa04', 'Andrea Barzagli', 1981, 'Italy', ['CB'], 77, 85, 2008, 30, t(9, 5, 8, 8, 4, 8)),
  q('palermo', 'zaccardo_pa04', 'Cristian Zaccardo', 1981, 'Italy', ['RB', 'CB'], 75, 79, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('palermo', 'grosso_pa04', 'Fabio Grosso', 1977, 'Italy', ['LB'], 78, 82, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('palermo', 'corini_pa04', 'Eugenio Corini', 1970, 'Italy', ['CM', 'AM'], 75, 76, 2006, 30, t(9, 5, 8, 8, 5, 8)),
  q('palermo', 'cassani_pa04', 'Mattia Cassani', 1983, 'Italy', ['RB', 'RW'], 72, 79, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('palermo', 'di_michele_pa04', 'David Di Michele', 1976, 'Italy', ['ST', 'AM'], 76, 78, 2007, 30, t(7, 6, 8, 7, 5, 8)),
];

const LECCE_04: CuratedSeed[] = [
  q('lecce', 'sicignano_le04', 'Antonio Chimenti', 1970, 'Italy', ['GK'], 72, 73, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('lecce', 'ledesma_le04', 'Cristian Ledesma', 1982, 'Italy', ['DM', 'CM'], 75, 80, 2008, 30, t(8, 5, 8, 7, 5, 8)),
  q('lecce', 'diamoutene_le04', 'Souleymane Diamoutene', 1983, 'Mali', ['CB', 'DM'], 73, 78, 2008, 30, t(8, 5, 8, 7, 5, 8)),
  q('lecce', 'vucinic_le04', 'Mirko Vučinić', 1983, 'Montenegro', ['ST', 'LW'], 76, 84, 2008, 30, t(6, 7, 8, 7, 6, 8)),
  q('lecce', 'bojinov_le04', 'Valeri Bojinov', 1986, 'Bulgaria', ['ST'], 72, 82, 2009, 30, t(5, 7, 8, 6, 7, 8)),
  q('lecce', 'chevanton_le04', 'Javier Chevantón', 1980, 'Uruguay', ['ST'], 78, 81, 2007, 30, t(6, 7, 8, 6, 6, 8)),
];

const PARMA_04: CuratedSeed[] = [
  q('parma', 'frey_pa04', 'Sébastien Frey', 1980, 'France', ['GK'], 80, 83, 2007, 30, t(8, 6, 8, 8, 5, 7)),
  q('parma', 'bonera_pa04', 'Daniele Bonera', 1981, 'Italy', ['CB', 'RB'], 76, 81, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('parma', 'cardone_pa04', 'Luigi Sartor', 1975, 'Italy', ['CB', 'LB'], 73, 74, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('parma', 'morfeo_pa04', 'Domenico Morfeo', 1976, 'Italy', ['AM'], 76, 78, 2006, 30, t(6, 7, 8, 6, 6, 8)),
  q('parma', 'marchionni_pa04', 'Marco Marchionni', 1980, 'Italy', ['RW', 'AM'], 74, 78, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('parma', 'gilardino_pa04', 'Alberto Gilardino', 1982, 'Italy', ['ST'], 81, 85, 2007, 30, t(8, 6, 9, 7, 5, 8)),
];

const SAMPDORIA_04: CuratedSeed[] = [
  q('sampdoria', 'antonioli_sa04', 'Francesco Antonioli', 1969, 'Italy', ['GK'], 75, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('sampdoria', 'falcone_sa04', 'Fabio Falcone', 1977, 'Italy', ['CB'], 72, 74, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('sampdoria', 'diana_sa04', 'Aimo Diana', 1978, 'Italy', ['RB', 'RW'], 73, 76, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('sampdoria', 'volpi_sa04', 'Sergio Volpi', 1973, 'Italy', ['DM', 'CM'], 74, 75, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('sampdoria', 'flachi_sa04', 'Francesco Flachi', 1975, 'Italy', ['ST', 'AM'], 76, 78, 2007, 30, t(6, 6, 8, 8, 6, 8)),
  q('sampdoria', 'quagliarella_sa04', 'Fabio Quagliarella', 1983, 'Italy', ['ST', 'AM'], 74, 83, 2008, 30, t(8, 6, 8, 8, 5, 8)),
];

const CAGLIARI_04: CuratedSeed[] = [
  q('cagliari', 'marchetti_ca04', 'Marco Storari', 1977, 'Italy', ['GK'], 74, 78, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('cagliari', 'agostini_ca04', 'Luca Agostini', 1978, 'Italy', ['CB'], 72, 74, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('cagliari', 'conti_d_ca04', 'Daniele Conti', 1979, 'Italy', ['CM', 'DM'], 74, 77, 2007, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('cagliari', 'zola_ca04', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 78, 79, 2005, 30, t(9, 5, 8, 10, 4, 8), { loyalty: 95 }),
  q('cagliari', 'langella_ca04', 'Antonio Langella', 1979, 'Italy', ['ST'], 73, 75, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('cagliari', 'suazo_ca04', 'David Suazo', 1979, 'Honduras', ['ST'], 78, 82, 2008, 30, t(7, 6, 8, 7, 5, 8)),
];

const LIVORNO_04: CuratedSeed[] = [
  q('livorno', 'amelia_li04', 'Marco Amelia', 1982, 'Italy', ['GK'], 76, 81, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('livorno', 'morrone_li04', 'Stefano Morrone', 1978, 'Italy', ['CM', 'DM'], 73, 75, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('livorno', 'protti_li04', 'Igor Protti', 1967, 'Italy', ['ST'], 72, 73, 2005, 30, t(8, 6, 8, 10, 5, 8), { loyalty: 95 }),
  q('livorno', 'lucarelli_li04', 'Cristiano Lucarelli', 1975, 'Italy', ['ST'], 79, 81, 2007, 30, t(6, 7, 8, 9, 6, 8)),
  q('livorno', 'vigiani_li04', 'Marco Vigiani', 1976, 'Italy', ['AM', 'RW'], 71, 73, 2006, 30, t(7, 5, 8, 8, 5, 7)),
];

const BOLOGNA_04: CuratedSeed[] = [
  q('bologna', 'pagliuca_bo04', 'Gianluca Pagliuca', 1966, 'Italy', ['GK'], 76, 76, 2005, 30, t(8, 6, 8, 8, 5, 7)),
  q('bologna', 'ze_maria_bo04', 'Zé Maria', 1973, 'Brazil', ['RB'], 75, 77, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('bologna', 'bellucci_bo04', 'Claudio Bellucci', 1975, 'Italy', ['ST'], 73, 75, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('bologna', 'locatelli_bo04', 'Tomás Locatelli', 1977, 'Italy', ['CM', 'AM'], 74, 77, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('bologna', 'gamberini_bo04', 'Alessandro Gamberini', 1981, 'Italy', ['CB'], 75, 80, 2008, 30, t(8, 5, 8, 8, 5, 8)),
];

const REGGINA_04: CuratedSeed[] = [
  q('reggina', 'campagnolo_re04', 'Emanuele Belardi', 1977, 'Italy', ['GK'], 73, 76, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('reggina', 'jimenez_re04', 'Jiménez', 1978, 'Argentina', ['CB'], 72, 74, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('reggina', 'brienza_re04', 'Franco Brienza', 1979, 'Italy', ['AM', 'RW'], 74, 77, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('reggina', 'bianchi_re04', 'Rolando Bianchi', 1983, 'Italy', ['ST'], 73, 80, 2008, 30, t(7, 6, 8, 7, 5, 8)),
  q('reggina', 'amoruso_re04', 'Nicola Amoruso', 1974, 'Italy', ['ST'], 74, 76, 2006, 30, t(6, 7, 8, 7, 6, 8)),
];

const CHIEVO_04: CuratedSeed[] = [
  q('chievo', 'pellissier_ch04', 'Sergio Pellissier', 1979, 'Italy', ['ST'], 74, 78, 2008, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 92 }),
  q('chievo', 'danna_ch04', 'Lorenzo D’Anna', 1972, 'Italy', ['RB', 'CB'], 72, 73, 2006, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('chievo', 'barone_ch04', 'Simone Barone', 1978, 'Italy', ['CM', 'DM'], 75, 78, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('chievo', 'cossato_ch04', 'Federico Cossato', 1975, 'Italy', ['ST'], 72, 74, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('chievo', 'marazzina_ch04', 'Massimo Marazzina', 1974, 'Italy', ['ST'], 71, 73, 2006, 30, t(7, 6, 8, 7, 5, 8)),
];

const BRESCIA_04: CuratedSeed[] = [
  q('brescia', 'castellazzi_br04', 'Luca Castellazzi', 1975, 'Italy', ['GK'], 74, 77, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('brescia', 'adani_br04', 'Daniele Adani', 1974, 'Italy', ['CB'], 74, 75, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('brescia', 'matuzalem_br04', 'Matuzalém', 1980, 'Brazil', ['CM', 'AM'], 77, 82, 2007, 30, t(6, 7, 8, 6, 6, 8)),
  q('brescia', 'baggio_br04', 'Roberto Baggio', 1967, 'Italy', ['AM', 'ST'], 78, 79, 2005, 30, t(8, 6, 8, 9, 5, 8), { loyalty: 90 }),
  q('brescia', 'caracciolo_br04', 'Andrea Caracciolo', 1981, 'Italy', ['ST'], 73, 78, 2008, 30, t(7, 6, 8, 8, 5, 8)),
];

const MESSINA_04: CuratedSeed[] = [
  q('messina', 'rossi_g_me04', 'Generoso Rossi', 1979, 'Italy', ['GK'], 73, 76, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('messina', 'modesto_me04', 'Francesco Modesto', 1982, 'Italy', ['RB', 'RW'], 72, 78, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('messina', 'di_napoli_me04', 'Arturo Di Napoli', 1974, 'Italy', ['ST', 'AM'], 75, 77, 2006, 30, t(6, 7, 8, 7, 6, 8)),
  q('messina', 'rigano_me04', 'Christian Riganò', 1974, 'Italy', ['ST'], 76, 78, 2007, 30, t(7, 6, 8, 8, 5, 8)),
];

const SIENA_04: CuratedSeed[] = [
  q('siena', 'taibi_si04', 'Massimo Taibi', 1970, 'Italy', ['GK'], 74, 75, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('siena', 'vergassola_si04', 'Simone Vergassola', 1976, 'Italy', ['CM', 'RB'], 74, 76, 2007, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('siena', 'chiesa_si04', 'Enrico Chiesa', 1970, 'Italy', ['ST', 'AM'], 78, 79, 2006, 30, t(8, 6, 8, 8, 5, 8)),
  q('siena', 'bogdani_si04', 'Erjon Bogdani', 1977, 'Albania', ['ST'], 73, 75, 2007, 30, t(7, 6, 8, 7, 5, 8)),
];

const ATALANTA_04: CuratedSeed[] = [
  q('atalanta', 'coppola_at04', 'Ferdinando Coppola', 1978, 'Italy', ['GK'], 73, 76, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('atalanta', 'bellini_at04', 'Gianpaolo Bellini', 1980, 'Italy', ['CB', 'RB'], 73, 76, 2008, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('atalanta', 'zenoni_d_at04', 'Damiano Zenoni', 1977, 'Italy', ['RB', 'RW'], 73, 75, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('atalanta', 'doni_c_at04', 'Cristiano Doni', 1973, 'Italy', ['AM'], 77, 78, 2007, 30, t(7, 6, 8, 9, 5, 8), { loyalty: 90 }),
];

/** The domestic mid-tier of the 2004-05 Serie A. Merged by CONCATENATION into
 *  INTER_2004_SQUADS. */
export const ITA_DOMESTIC_2004_SQUADS: Record<string, CuratedSeed[]> = {
  udinese: UDINESE_04,
  palermo: PALERMO_04,
  lecce: LECCE_04,
  parma: PARMA_04,
  sampdoria: SAMPDORIA_04,
  cagliari: CAGLIARI_04,
  livorno: LIVORNO_04,
  bologna: BOLOGNA_04,
  reggina: REGGINA_04,
  chievo: CHIEVO_04,
  brescia: BRESCIA_04,
  messina: MESSINA_04,
  siena: SIENA_04,
  atalanta: ATALANTA_04,
};
