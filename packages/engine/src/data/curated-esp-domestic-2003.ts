/**
 * Curated domestic mid-tier — 2003-04 La Liga (M12 shortlist supply).
 *
 * Real 2003-04 squad players at the modelled La Liga's non-elite clubs for the
 * barcelona-2003 world, so options lists read like a real shortlist — the
 * Real Sociedad of Xabi Alonso, Nihat & Kovačević fresh off nearly winning the
 * title, David Villa & the Milito brothers at Zaragoza, Riquelme's Villarreal,
 * Joaquín & Denílson at Betis, Mostovoi & McCarthy at Celta, Tamudo's Espanyol.
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

const REAL_SOCIEDAD_03: CuratedSeed[] = [
  q('real_sociedad', 'westerveld_rs03', 'Sander Westerveld', 1974, 'Netherlands', ['GK'], 78, 79, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('real_sociedad', 'xabi_rs03', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 81, 88, 2006, 30, t(9, 5, 8, 8, 4, 8)),
  q('real_sociedad', 'karpin_rs03', 'Valeri Karpin', 1969, 'Russia', ['RW', 'CM'], 78, 79, 2005, 30, t(8, 6, 8, 7, 5, 8)),
  q('real_sociedad', 'de_pedro_rs03', 'Javier de Pedro', 1973, 'Spain', ['LW', 'AM'], 78, 80, 2005, 30, t(7, 6, 8, 7, 5, 8)),
  q('real_sociedad', 'nihat_rs03', 'Nihat Kahveci', 1979, 'Turkey', ['ST', 'AM'], 80, 83, 2006, 30, t(7, 7, 8, 7, 6, 8)),
  q('real_sociedad', 'kovacevic_rs03', 'Darko Kovačević', 1973, 'Serbia', ['ST'], 81, 82, 2006, 30, t(8, 6, 8, 7, 5, 8)),
];

const ZARAGOZA_03: CuratedSeed[] = [
  q('zaragoza', 'g_milito_za03', 'Gabriel Milito', 1980, 'Argentina', ['CB'], 80, 85, 2006, 30, t(8, 5, 8, 8, 5, 8)),
  q('zaragoza', 'ponzio_za03', 'Leonardo Ponzio', 1982, 'Argentina', ['CM', 'DM'], 76, 81, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('zaragoza', 'd_milito_za03', 'Diego Milito', 1979, 'Argentina', ['ST'], 81, 86, 2006, 30, t(8, 6, 9, 7, 5, 8)),
  q('zaragoza', 'villa_za03', 'David Villa', 1981, 'Spain', ['ST'], 80, 90, 2006, 30, t(9, 6, 9, 8, 5, 8)),
  q('zaragoza', 'galletti_za03', 'Sergio Galletti', 1972, 'Argentina', ['AM', 'RW'], 74, 76, 2005, 30, t(7, 6, 8, 7, 5, 8)),
];

const VILLARREAL_03: CuratedSeed[] = [
  q('villarreal', 'riquelme_vl03', 'Juan Román Riquelme', 1978, 'Argentina', ['AM'], 85, 88, 2007, 30, t(7, 7, 8, 7, 6, 8)),
  q('villarreal', 'senna_vl03', 'Marcos Senna', 1976, 'Spain', ['DM', 'CM'], 79, 83, 2007, 30, t(9, 5, 8, 8, 4, 8)),
  q('villarreal', 'sonny_vl03', 'Sonny Anderson', 1970, 'Brazil', ['ST'], 81, 82, 2005, 30, t(8, 6, 8, 7, 5, 8)),
  q('villarreal', 'palermo_vl03', 'Martín Palermo', 1973, 'Argentina', ['ST'], 79, 81, 2005, 30, t(6, 7, 8, 7, 6, 8)),
  q('villarreal', 'josico_vl03', 'Josico', 1975, 'Spain', ['DM', 'CM'], 75, 77, 2006, 30, t(8, 5, 8, 8, 5, 8)),
];

const BETIS_03: CuratedSeed[] = [
  q('betis', 'joaquin_be03', 'Joaquín', 1981, 'Spain', ['RW', 'AM'], 81, 85, 2007, 30, t(8, 6, 8, 8, 5, 8)),
  q('betis', 'denilson_be03', 'Denílson', 1977, 'Brazil', ['LW', 'AM'], 79, 81, 2006, 30, t(6, 7, 8, 6, 6, 8)),
  q('betis', 'assuncao_be03', 'Assunção', 1975, 'Brazil', ['DM', 'CM'], 78, 80, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('betis', 'alfonso_be03', 'Alfonso Pérez', 1972, 'Spain', ['ST'], 78, 79, 2005, 30, t(7, 6, 8, 7, 5, 8)),
  q('betis', 'juanito_be03', 'Juanito', 1976, 'Spain', ['CB'], 77, 80, 2007, 30, t(8, 5, 8, 8, 5, 8)),
];

const CELTA_03: CuratedSeed[] = [
  q('celta', 'mostovoi_ce03', 'Aleksandr Mostovoi', 1968, 'Russia', ['AM'], 80, 81, 2005, 30, t(6, 7, 8, 7, 6, 8)),
  q('celta', 'sylvinho_ce03', 'Sylvinho', 1974, 'Brazil', ['LB'], 78, 80, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('celta', 'gustavo_lopez_ce03', 'Gustavo López', 1973, 'Argentina', ['AM', 'CM'], 77, 78, 2005, 30, t(7, 6, 8, 7, 5, 8)),
  q('celta', 'luccin_ce03', 'Peter Luccin', 1979, 'France', ['DM', 'CM'], 76, 79, 2006, 30, t(7, 6, 8, 7, 6, 8)),
  q('celta', 'jesuli_ce03', 'Jesuli', 1974, 'Spain', ['LW', 'RW'], 74, 76, 2005, 30, t(7, 6, 8, 7, 5, 8)),
];

const ATHLETIC_03: CuratedSeed[] = [
  q('athletic', 'urzaiz_at03', 'Ismael Urzaiz', 1971, 'Spain', ['ST'], 78, 79, 2006, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('athletic', 'etxeberria_at03', 'Joseba Etxeberria', 1977, 'Spain', ['RW', 'ST'], 78, 80, 2007, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 92 }),
  q('athletic', 'guerrero_at03', 'Julen Guerrero', 1974, 'Spain', ['AM'], 76, 78, 2005, 30, t(8, 5, 8, 10, 5, 8), { loyalty: 95 }),
  q('athletic', 'yeste_at03', 'Francisco Yeste', 1979, 'Spain', ['AM', 'LW'], 75, 79, 2007, 30, t(7, 6, 8, 8, 5, 8)),
  q('athletic', 'gurpegui_at03', 'Carlos Gurpegui', 1980, 'Spain', ['DM', 'CB'], 75, 80, 2007, 30, t(9, 5, 8, 9, 4, 8), { loyalty: 90 }),
];

const ESPANYOL_03: CuratedSeed[] = [
  q('espanyol', 'tamudo_es03', 'Raúl Tamudo', 1977, 'Spain', ['ST', 'AM'], 79, 81, 2007, 30, t(8, 6, 8, 9, 5, 8), { loyalty: 90 }),
  q('espanyol', 'delapena_es03', 'Iván de la Peña', 1976, 'Spain', ['AM', 'CM'], 78, 80, 2006, 30, t(6, 7, 8, 7, 6, 8)),
  q('espanyol', 'pochettino_es03', 'Mauricio Pochettino', 1972, 'Argentina', ['CB'], 77, 78, 2005, 30, t(8, 6, 8, 8, 5, 8)),
  q('espanyol', 'maxi_es03', 'Maxi Rodríguez', 1981, 'Argentina', ['RW', 'AM'], 78, 82, 2006, 30, t(8, 6, 8, 7, 5, 8)),
];

const MALAGA_03: CuratedSeed[] = [
  q('malaga', 'musampa_ma03', 'Kiki Musampa', 1977, 'Netherlands', ['AM', 'LW'], 76, 78, 2006, 30, t(7, 6, 8, 7, 5, 8)),
  q('malaga', 'dely_valdes_ma03', 'Julio Dely Valdés', 1967, 'Panama', ['ST'], 75, 76, 2005, 30, t(8, 5, 8, 7, 5, 8)),
  q('malaga', 'josemi_ma03', 'Josemi', 1979, 'Spain', ['RB'], 74, 78, 2006, 30, t(8, 5, 8, 8, 5, 8)),
  q('malaga', 'gerardo_ma03', 'Gerardo', 1975, 'Spain', ['LB', 'CB'], 73, 75, 2006, 30, t(8, 5, 8, 8, 5, 8)),
];

const OSASUNA_03: CuratedSeed[] = [
  q('osasuna', 'aloisi_os03', 'John Aloisi', 1976, 'Australia', ['ST'], 74, 76, 2006, 30, t(7, 6, 8, 7, 5, 8)),
  q('osasuna', 'pablo_garcia_os03', 'Pablo García', 1977, 'Uruguay', ['DM', 'CM'], 76, 78, 2006, 30, t(8, 5, 8, 7, 6, 8)),
  q('osasuna', 'moha_os03', 'Moha', 1975, 'Spain', ['LW', 'RW'], 72, 74, 2005, 30, t(7, 6, 8, 7, 5, 8)),
];

/** The domestic mid-tier of the 2003-04 La Liga. Merged by CONCATENATION into
 *  BARCELONA_2003_SQUADS. */
export const ESP_DOMESTIC_2003_SQUADS: Record<string, CuratedSeed[]> = {
  real_sociedad: REAL_SOCIEDAD_03,
  zaragoza: ZARAGOZA_03,
  villarreal: VILLARREAL_03,
  betis: BETIS_03,
  celta: CELTA_03,
  athletic: ATHLETIC_03,
  espanyol: ESPANYOL_03,
  malaga: MALAGA_03,
  osasuna: OSASUNA_03,
};
