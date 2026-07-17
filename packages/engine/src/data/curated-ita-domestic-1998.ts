/**
 * Curated domestic mid-tier — 1998-99 Serie A (M12 shortlist supply).
 *
 * Real 1998-99 squad players at the modelled Serie A's non-elite clubs for the
 * inter-1998 world, so options lists read like a real shortlist — Márcio Amoroso
 * (the season's top scorer) at Udinese, Signori & a young Di Vaio at Bologna,
 * Montella & Ortega at Sampdoria, Nakata & Materazzi at Perugia, a loaned Recoba
 * at Venezia, Dario Hübner at Piacenza. HIDDEN designer estimates (§7); real
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

const UDINESE_98: CuratedSeed[] = [
  q('udinese', 'turci_ud98', 'Luigi Turci', 1969, 'Italy', ['GK'], 74, 75, 2001, 30, t(8, 5, 8, 8, 5, 7)),
  q('udinese', 'bertotto_ud98', 'Valerio Bertotto', 1973, 'Italy', ['CB'], 75, 77, 2002, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('udinese', 'giannichedda_ud98', 'Giuliano Giannichedda', 1975, 'Italy', ['DM', 'CM'], 76, 79, 2002, 30, t(8, 5, 8, 8, 5, 8)),
  q('udinese', 'amoroso_ud98', 'Márcio Amoroso', 1974, 'Brazil', ['ST'], 82, 85, 2001, 30, t(6, 7, 8, 6, 6, 8)),
  q('udinese', 'poggi_ud98', 'Paolo Poggi', 1970, 'Italy', ['ST'], 74, 75, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('udinese', 'fiore_ud98', 'Stefano Fiore', 1975, 'Italy', ['AM', 'CM'], 77, 81, 2001, 30, t(8, 5, 8, 7, 5, 8)),
];

const BOLOGNA_98: CuratedSeed[] = [
  q('bologna', 'paramatti_bo98', 'Michele Paramatti', 1968, 'Italy', ['CB'], 74, 75, 2001, 30, t(8, 5, 8, 8, 5, 7)),
  q('bologna', 'ingesson_bo98', 'Klas Ingesson', 1968, 'Sweden', ['CM', 'DM'], 76, 77, 2000, 30, t(8, 5, 8, 8, 5, 8)),
  q('bologna', 'kolyvanov_bo98', 'Igor Kolyvanov', 1968, 'Russia', ['LW', 'ST'], 76, 77, 2001, 30, t(7, 6, 8, 7, 5, 8)),
  q('bologna', 'signori_bo98', 'Giuseppe Signori', 1968, 'Italy', ['ST', 'AM'], 81, 82, 2001, 30, t(8, 6, 8, 8, 5, 8)),
  q('bologna', 'k_andersson_bo98', 'Kennet Andersson', 1967, 'Sweden', ['ST'], 77, 78, 2000, 30, t(8, 5, 8, 7, 5, 8)),
  q('bologna', 'di_vaio_bo98', 'Marco Di Vaio', 1976, 'Italy', ['ST'], 76, 84, 2002, 30, t(8, 6, 9, 7, 5, 8)),
];

const SAMPDORIA_98: CuratedSeed[] = [
  q('sampdoria', 'ferron_sa98', 'Fabrizio Ferron', 1965, 'Italy', ['GK'], 74, 75, 2000, 30, t(8, 5, 8, 8, 5, 7)),
  q('sampdoria', 'mannini_sa98', 'Moreno Mannini', 1962, 'Italy', ['CB', 'RB'], 72, 72, 2000, 30, t(9, 5, 8, 10, 4, 7), { loyalty: 95 }),
  q('sampdoria', 'ortega_sa98', 'Ariel Ortega', 1974, 'Argentina', ['AM', 'ST'], 82, 85, 2001, 30, t(5, 8, 8, 6, 8, 7)),
  q('sampdoria', 'montella_sa98', 'Vincenzo Montella', 1974, 'Italy', ['ST'], 81, 84, 2001, 30, t(8, 6, 9, 7, 5, 8)),
  q('sampdoria', 'bazzani_sa98', 'Fabio Bazzani', 1976, 'Italy', ['ST'], 72, 78, 2001, 30, t(7, 6, 8, 7, 5, 8)),
];

const PERUGIA_98: CuratedSeed[] = [
  q('perugia', 'mazzantini_pg98', 'Andrea Mazzantini', 1968, 'Italy', ['GK'], 72, 73, 2000, 30, t(8, 5, 8, 8, 5, 7)),
  q('perugia', 'materazzi_pg98', 'Marco Materazzi', 1973, 'Italy', ['CB', 'DM'], 78, 82, 2001, 30, t(6, 7, 8, 7, 8, 7)),
  q('perugia', 'tedesco_pg98', 'Giovanni Tedesco', 1972, 'Italy', ['CM'], 74, 76, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('perugia', 'nakata_pg98', 'Hidetoshi Nakata', 1977, 'Japan', ['AM', 'CM'], 79, 84, 2001, 30, t(9, 6, 9, 7, 5, 8)),
  q('perugia', 'rapaic_pg98', 'Milan Rapaić', 1973, 'Croatia', ['RW', 'AM'], 76, 78, 2001, 30, t(6, 7, 8, 7, 6, 8)),
  q('perugia', 'petrachi_pg98', 'Gianluca Petrachi', 1969, 'Italy', ['CM', 'RB'], 72, 73, 2000, 30, t(8, 5, 8, 8, 5, 8)),
];

const PIACENZA_98: CuratedSeed[] = [
  q('piacenza', 'taglialatela_pc98', 'Giuseppe Taglialatela', 1970, 'Italy', ['GK'], 73, 75, 2001, 30, t(8, 5, 8, 8, 5, 7)),
  q('piacenza', 'di_francesco_pc98', 'Eusebio Di Francesco', 1969, 'Italy', ['CM', 'AM'], 76, 78, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('piacenza', 'hubner_pc98', 'Dario Hübner', 1967, 'Italy', ['ST'], 77, 78, 2001, 30, t(7, 6, 8, 7, 5, 8)),
  q('piacenza', 'de_simone_pc98', 'Marco De Simone', 1970, 'Italy', ['CB'], 72, 73, 2000, 30, t(8, 5, 8, 8, 5, 7)),
];

const VENEZIA_98: CuratedSeed[] = [
  q('venezia', 'pagotto_ve98', 'Christian Pagotto', 1974, 'Italy', ['GK'], 71, 73, 2001, 30, t(8, 5, 8, 8, 5, 7)),
  q('venezia', 'recoba_ve98', 'Álvaro Recoba', 1976, 'Uruguay', ['AM', 'ST'], 80, 84, 2000, 30, t(5, 7, 8, 7, 7, 7)),
  q('venezia', 'maniero_ve98', 'Filippo Maniero', 1972, 'Italy', ['ST'], 74, 76, 2001, 30, t(7, 6, 8, 7, 5, 8)),
  q('venezia', 'tuta_ve98', 'Tuta', 1974, 'Brazil', ['CB'], 73, 75, 2001, 30, t(8, 5, 8, 7, 5, 8)),
];

const CAGLIARI_98: CuratedSeed[] = [
  q('cagliari', 'muzzi_ca98', 'Roberto Muzzi', 1971, 'Italy', ['ST'], 75, 77, 2001, 30, t(7, 6, 8, 7, 5, 8)),
  q('cagliari', 'statuto_ca98', 'Francesco Statuto', 1971, 'Italy', ['LB'], 72, 73, 2000, 30, t(8, 5, 8, 8, 5, 7)),
  q('cagliari', 'oscar_ca98', 'Oscar Brevi', 1968, 'Italy', ['CB'], 72, 73, 2000, 30, t(8, 5, 8, 8, 5, 7)),
];

const VICENZA_98: CuratedSeed[] = [
  q('vicenza', 'ambrosetti_vi98', 'Gabriele Ambrosetti', 1973, 'Italy', ['LW', 'AM'], 76, 78, 2000, 30, t(7, 6, 8, 7, 5, 8)),
  q('vicenza', 'luiso_vi98', 'Pasquale Luiso', 1969, 'Italy', ['ST'], 74, 75, 2001, 30, t(7, 6, 8, 7, 5, 8)),
  q('vicenza', 'castellini_vi98', 'Marcello Castellini', 1971, 'Italy', ['RB', 'CB'], 72, 73, 2001, 30, t(8, 5, 8, 8, 5, 7)),
  q('vicenza', 'zauli_vi98', 'Luca Zauli', 1974, 'Italy', ['CM'], 71, 73, 2001, 30, t(8, 5, 8, 8, 5, 8)),
];

const BARI_98: CuratedSeed[] = [
  q('bari', 'mancini_g_ba98', 'Gennaro Mancini', 1968, 'Italy', ['GK'], 71, 72, 2000, 30, t(8, 5, 8, 8, 5, 7)),
  q('bari', 'ferrante_ba98', 'Andrea Ferrante', 1970, 'Italy', ['ST'], 73, 74, 2001, 30, t(7, 6, 8, 7, 5, 8)),
  q('bari', 'zambelli_ba98', 'Simone Zambelli', 1972, 'Italy', ['CM', 'DM'], 71, 73, 2001, 30, t(8, 5, 8, 8, 5, 8)),
];

const SALERNITANA_98: CuratedSeed[] = [
  q('salernitana', 'di_napoli_sal98', 'Arturo Di Napoli', 1974, 'Italy', ['ST', 'AM'], 74, 77, 2001, 30, t(6, 7, 8, 7, 6, 8)),
  q('salernitana', 'pecchia_sal98', 'Fabio Pecchia', 1973, 'Italy', ['CM', 'AM'], 73, 75, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('salernitana', 'breda_sal98', 'Roberto Breda', 1971, 'Italy', ['DM', 'CM'], 72, 73, 2000, 30, t(8, 5, 8, 8, 5, 8)),
];

const EMPOLI_98: CuratedSeed[] = [
  q('empoli', 'bucci_em98', 'Luca Bucci', 1969, 'Italy', ['GK'], 74, 75, 2001, 30, t(8, 5, 8, 8, 5, 7)),
  q('empoli', 'esposito_v_em98', 'Vincenzo Esposito', 1969, 'Italy', ['AM', 'ST'], 73, 74, 2001, 30, t(7, 6, 8, 7, 5, 8)),
  q('empoli', 'cavani_em98', 'Nicola Cavani', 1970, 'Italy', ['ST'], 71, 72, 2000, 30, t(7, 6, 8, 7, 5, 8)),
];

/** The domestic mid-tier of the 1998-99 Serie A. Merged by CONCATENATION into
 *  INTER_1998_SQUADS. */
export const ITA_DOMESTIC_1998_SQUADS: Record<string, CuratedSeed[]> = {
  udinese: UDINESE_98,
  bologna: BOLOGNA_98,
  sampdoria: SAMPDORIA_98,
  perugia: PERUGIA_98,
  piacenza: PIACENZA_98,
  venezia: VENEZIA_98,
  cagliari: CAGLIARI_98,
  vicenza: VICENZA_98,
  bari: BARI_98,
  salernitana: SALERNITANA_98,
  empoli: EMPOLI_98,
};
