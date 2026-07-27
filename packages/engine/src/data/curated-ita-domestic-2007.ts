/**
 * Curated domestic mid-tier — 2007-08 Serie A (M12 shortlist supply).
 *
 * Real 2007-08 squad players at the modelled Serie A's non-elite clubs for the
 * milan-2007 world, so options lists read like a real shortlist — Di Natale &
 * a teenage Handanović at Udinese, Borriello & Thiago Motta & Criscito at the
 * promoted Genoa, Amauri & Miccoli at Palermo, Rosina at Torino, Mascara &
 * Morimoto at Catania, a loaned teenage Giovinco at Empoli, Diamanti at Livorno.
 * HIDDEN designer estimates (§7); real clubs, birth years, positions, contracts.
 * Injury proneness at the population norm (~30). Names already curated in the
 * world are omitted.
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

const UDINESE_07: CuratedSeed[] = [
  q('udinese', 'handanovic_ud07', 'Samir Handanović', 1984, 'Slovenia', ['GK'], 78, 88, 2011, 30, t(9, 5, 8, 8, 4, 8)),
  q('udinese', 'felipe_ud07', 'Felipe', 1978, 'Brazil', ['CB'], 77, 78, 2010, 30, t(8, 5, 8, 7, 5, 8)),
  q('udinese', 'dossena_ud07', 'Andrea Dossena', 1981, 'Italy', ['LB'], 78, 80, 2009, 30, t(8, 5, 8, 8, 5, 8)),
  q('udinese', 'dagostino_ud07', 'Gaetano D’Agostino', 1982, 'Italy', ['CM', 'AM'], 77, 80, 2010, 30, t(8, 5, 8, 7, 5, 8)),
  q('udinese', 'di_natale_ud07', 'Antonio Di Natale', 1977, 'Italy', ['ST', 'LW'], 83, 85, 2011, 30, t(8, 6, 9, 9, 5, 8), { loyalty: 92 }),
  q('udinese', 'quagliarella_ud07', 'Fabio Quagliarella', 1983, 'Italy', ['ST', 'AM'], 79, 84, 2010, 30, t(8, 6, 8, 8, 5, 8)),
  q('udinese', 'pepe_ud07', 'Simone Pepe', 1983, 'Italy', ['RW', 'LW'], 76, 80, 2010, 30, t(8, 5, 8, 7, 5, 8)),
];

const SAMPDORIA_07: CuratedSeed[] = [
  q('sampdoria', 'castellazzi_sa07', 'Luca Castellazzi', 1975, 'Italy', ['GK'], 76, 78, 2010, 30, t(8, 5, 8, 8, 5, 7)),
  q('sampdoria', 'palombo_sa07', 'Angelo Palombo', 1981, 'Italy', ['DM', 'CM'], 79, 82, 2011, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('sampdoria', 'palombo_sa07', 'Angelo Palombo', 1981, 'Italy', ['DM', 'CM'], 79, 81, 2010, 20, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('sampdoria', 'ziegler_sa07', 'Reto Ziegler', 1986, 'Switzerland', ['LB', 'LW'], 74, 81, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('sampdoria', 'montella_sa07', 'Vincenzo Montella', 1974, 'Italy', ['ST'], 78, 79, 2009, 30, t(8, 6, 8, 8, 5, 8)),
  q('sampdoria', 'bellucci_sa07', 'Claudio Bellucci', 1975, 'Italy', ['ST'], 73, 74, 2009, 30, t(7, 6, 8, 7, 5, 8)),
  q('sampdoria', 'pozzi_sa07', 'Nicola Pozzi', 1986, 'Italy', ['ST'], 72, 78, 2010, 30, t(7, 6, 8, 7, 5, 8)),
];

const GENOA_07: CuratedSeed[] = [
  q('genoa', 'rubinho_ge07', 'Rubinho', 1982, 'Brazil', ['GK'], 74, 77, 2010, 30, t(8, 5, 8, 8, 5, 7)),
  q('genoa', 'criscito_ge07', 'Domenico Criscito', 1986, 'Italy', ['LB', 'CB'], 76, 85, 2011, 30, t(9, 5, 8, 8, 4, 8)),
  q('genoa', 'thiago_motta_ge07', 'Thiago Motta', 1982, 'Italy', ['CM', 'DM'], 80, 84, 2010, 30, t(7, 6, 8, 7, 6, 8)),
  q('genoa', 'milanetto_ge07', 'Omar Milanetto', 1976, 'Italy', ['CM'], 74, 75, 2009, 30, t(8, 5, 8, 8, 5, 8)),
  q('genoa', 'borriello_ge07', 'Marco Borriello', 1982, 'Italy', ['ST'], 79, 83, 2009, 30, t(6, 7, 8, 6, 6, 8)),
  q('genoa', 'sculli_ge07', 'Giuseppe Sculli', 1981, 'Italy', ['RW', 'ST'], 74, 77, 2010, 30, t(6, 7, 8, 7, 6, 8)),
];

const ATALANTA_07: CuratedSeed[] = [
  q('atalanta', 'coppola_at07', 'Ferdinando Coppola', 1978, 'Italy', ['GK'], 73, 75, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('atalanta', 'bellini_at07', 'Gianpaolo Bellini', 1980, 'Italy', ['CB', 'RB'], 74, 76, 2010, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('atalanta', 'manfredini_at07', 'Thomas Manfredini', 1980, 'Italy', ['CB'], 73, 75, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('atalanta', 'doni_c_at07', 'Cristiano Doni', 1973, 'Italy', ['AM'], 76, 77, 2009, 30, t(7, 6, 8, 9, 5, 8), { loyalty: 92 }),
  q('atalanta', 'padoin_at07', 'Simone Padoin', 1984, 'Italy', ['CM', 'RB'], 73, 78, 2010, 30, t(8, 5, 8, 8, 5, 8)),
  q('atalanta', 'tiribocchi_at07', 'Simone Tiribocchi', 1978, 'Italy', ['ST'], 72, 74, 2009, 30, t(7, 6, 8, 7, 5, 8)),
];

const PALERMO_07: CuratedSeed[] = [
  q('palermo', 'amelia_pa07', 'Marco Amelia', 1982, 'Italy', ['GK'], 78, 82, 2010, 30, t(8, 5, 8, 8, 5, 8)),
  q('palermo', 'barzagli_pa07', 'Andrea Barzagli', 1981, 'Italy', ['CB'], 80, 86, 2010, 30, t(9, 5, 8, 8, 4, 8)),
  q('palermo', 'simplicio_pa07', 'Fabio Simplício', 1979, 'Brazil', ['CM', 'AM'], 77, 80, 2010, 30, t(7, 6, 8, 7, 5, 8)),
  q('palermo', 'bresciano_pa07', 'Mark Bresciano', 1980, 'Australia', ['AM', 'CM'], 78, 80, 2009, 30, t(8, 6, 8, 7, 5, 8)),
  q('palermo', 'miccoli_pa07', 'Fabrizio Miccoli', 1979, 'Italy', ['ST', 'AM'], 79, 81, 2011, 30, t(6, 7, 8, 8, 6, 8)),
  q('palermo', 'amauri_pa07', 'Amauri', 1980, 'Brazil', ['ST'], 80, 83, 2009, 30, t(7, 6, 8, 7, 5, 8)),
];

const SIENA_07: CuratedSeed[] = [
  q('siena', 'fortin_si07', 'Marco Fortin', 1976, 'Italy', ['GK'], 72, 73, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('siena', 'vergassola_si07', 'Simone Vergassola', 1976, 'Italy', ['CM', 'RB'], 74, 75, 2009, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('siena', 'kharja_si07', 'Houssine Kharja', 1982, 'Morocco', ['CM', 'AM'], 75, 79, 2010, 30, t(8, 5, 8, 7, 5, 8)),
  q('siena', 'maccarone_si07', 'Massimo Maccarone', 1979, 'Italy', ['ST'], 76, 78, 2010, 30, t(7, 6, 8, 7, 5, 8)),
  q('siena', 'bogdani_si07', 'Erjon Bogdani', 1977, 'Albania', ['ST'], 73, 75, 2009, 30, t(7, 6, 8, 7, 5, 8)),
];

const CAGLIARI_07: CuratedSeed[] = [
  q('cagliari', 'bini_ca07', 'Davide Bini', 1978, 'Italy', ['GK'], 71, 73, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('cagliari', 'canini_ca07', 'Michele Canini', 1985, 'Italy', ['CB'], 73, 79, 2010, 30, t(8, 5, 8, 8, 5, 8)),
  q('cagliari', 'cossu_ca07', 'Andrea Cossu', 1980, 'Italy', ['AM', 'LW'], 76, 80, 2010, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('cagliari', 'matri_ca07', 'Alessandro Matri', 1984, 'Italy', ['ST'], 74, 83, 2010, 30, t(8, 6, 8, 8, 5, 8)),
  q('cagliari', 'jeda_ca07', 'Jeda', 1978, 'Brazil', ['ST'], 74, 76, 2009, 30, t(7, 6, 8, 7, 5, 8)),
];

const TORINO_07: CuratedSeed[] = [
  q('torino', 'sereni_to07', 'Matteo Sereni', 1975, 'Italy', ['GK'], 74, 76, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('torino', 'comotto_to07', 'Gianluca Comotto', 1978, 'Italy', ['RB', 'CB'], 74, 76, 2009, 30, t(8, 5, 8, 8, 5, 8)),
  q('torino', 'pratali_to07', 'Francesco Pratali', 1977, 'Italy', ['CB'], 72, 74, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('torino', 'de_ascentis_to07', 'Diego De Ascentis', 1976, 'Italy', ['CM', 'DM'], 73, 75, 2009, 30, t(8, 5, 8, 8, 5, 8)),
  q('torino', 'rosina_to07', 'Alessandro Rosina', 1984, 'Italy', ['AM', 'LW'], 77, 82, 2010, 30, t(6, 7, 8, 7, 6, 8)),
  q('torino', 'bianchi_r_to07', 'Rolando Bianchi', 1983, 'Italy', ['ST'], 76, 80, 2011, 30, t(7, 6, 8, 7, 5, 8)),
];

const REGGINA_07: CuratedSeed[] = [
  q('reggina', 'campagnolo_re07', 'Nicola Campagnolo', 1979, 'Italy', ['GK'], 71, 73, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('reggina', 'cozza_re07', 'Francesco Cozza', 1974, 'Italy', ['AM', 'CM'], 74, 75, 2009, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('reggina', 'amoruso_re07', 'Nicola Amoruso', 1974, 'Italy', ['ST'], 74, 76, 2009, 30, t(6, 7, 8, 7, 6, 8)),
  q('reggina', 'brienza_re07', 'Franco Brienza', 1979, 'Italy', ['AM', 'RW'], 74, 77, 2009, 30, t(7, 6, 8, 7, 5, 8)),
  q('reggina', 'vigiani_re07', 'Marco Vigiani', 1976, 'Italy', ['RW', 'AM'], 71, 73, 2009, 30, t(7, 5, 8, 8, 5, 7)),
];

const CATANIA_07: CuratedSeed[] = [
  q('catania', 'polito_ct07', 'Ciro Polito', 1976, 'Italy', ['GK'], 72, 74, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('catania', 'mascara_ct07', 'Giuseppe Mascara', 1979, 'Italy', ['AM', 'ST'], 76, 79, 2010, 30, t(7, 6, 8, 8, 6, 8)),
  q('catania', 'morimoto_ct07', 'Takayuki Morimoto', 1988, 'Japan', ['ST'], 71, 82, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('catania', 'spinesi_ct07', 'Gionatha Spinesi', 1978, 'Italy', ['ST'], 72, 74, 2009, 30, t(7, 6, 8, 7, 5, 8)),
  q('catania', 'martinez_j_ct07', 'Jorge Martínez', 1983, 'Uruguay', ['RW', 'AM'], 73, 78, 2010, 30, t(7, 6, 8, 7, 5, 8)),
];

const EMPOLI_07: CuratedSeed[] = [
  q('empoli', 'balli_em07', 'Daniele Balli', 1969, 'Italy', ['GK'], 71, 72, 2009, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('empoli', 'belmonte_em07', 'Nicola Belmonte', 1987, 'Italy', ['CB'], 71, 78, 2010, 30, t(8, 5, 8, 8, 5, 8)),
  q('empoli', 'vannucchi_em07', 'Ighli Vannucchi', 1979, 'Italy', ['AM', 'CM'], 74, 76, 2009, 30, t(7, 6, 8, 8, 5, 8)),
  q('empoli', 'giovinco_em07', 'Sebastian Giovinco', 1987, 'Italy', ['AM', 'ST'], 73, 86, 2009, 30, t(8, 6, 8, 7, 5, 8)),
  q('empoli', 'busce_em07', 'Antonio Buscè', 1978, 'Italy', ['CM', 'AM'], 72, 74, 2009, 30, t(7, 6, 8, 8, 5, 8)),
];

const PARMA_07: CuratedSeed[] = [
  q('parma', 'pavarini_pr07', 'Nicola Pavarini', 1974, 'Italy', ['GK'], 72, 73, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('parma', 'mariga_pr07', 'McDonald Mariga', 1987, 'Kenya', ['DM', 'CM'], 72, 80, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('parma', 'dessena_pr07', 'Daniele Dessena', 1987, 'Italy', ['CM', 'AM'], 72, 80, 2011, 30, t(8, 5, 8, 7, 5, 8)),
  q('parma', 'paloschi_pr07', 'Alberto Paloschi', 1990, 'Italy', ['ST'], 68, 82, 2010, 30, t(7, 6, 8, 7, 5, 8)),
  q('parma', 'pisanu_pr07', 'Andrea Pisanu', 1982, 'Italy', ['RW', 'AM'], 72, 76, 2009, 30, t(7, 5, 8, 7, 5, 8)),
];

const LIVORNO_07: CuratedSeed[] = [
  q('livorno', 'diamanti_li07', 'Alessandro Diamanti', 1983, 'Italy', ['AM', 'LW'], 76, 82, 2010, 30, t(6, 7, 8, 7, 6, 8)),
  q('livorno', 'a_lucarelli_li07', 'Alessandro Lucarelli', 1977, 'Italy', ['CB'], 73, 75, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('livorno', 'cascione_li07', 'Emmanuel Cascione', 1979, 'Italy', ['CM'], 71, 73, 2009, 30, t(8, 5, 8, 8, 5, 8)),
  q('livorno', 'grandoni_li07', 'Alessandro Grandoni', 1977, 'Italy', ['LB', 'CB'], 71, 73, 2009, 30, t(8, 5, 8, 8, 5, 7)),
  q('livorno', 'colucci_li07', 'Giuseppe Colucci', 1980, 'Italy', ['CM', 'AM'], 72, 74, 2009, 30, t(7, 6, 8, 7, 5, 8)),
];

/** The domestic mid-tier of the 2007-08 Serie A. Merged by CONCATENATION into
 *  MILAN_2007_SQUADS. */
export const ITA_DOMESTIC_2007_SQUADS: Record<string, CuratedSeed[]> = {
  udinese: UDINESE_07,
  sampdoria: SAMPDORIA_07,
  genoa: GENOA_07,
  atalanta: ATALANTA_07,
  palermo: PALERMO_07,
  siena: SIENA_07,
  cagliari: CAGLIARI_07,
  torino: TORINO_07,
  reggina: REGGINA_07,
  catania: CATANIA_07,
  empoli: EMPOLI_07,
  parma: PARMA_07,
  livorno: LIVORNO_07,
};
