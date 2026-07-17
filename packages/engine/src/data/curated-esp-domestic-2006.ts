/**
 * Curated domestic mid-tier — 2006-07 La Liga (M12 shortlist supply).
 *
 * Real 2006-07 squad players at the modelled La Liga's non-elite clubs for the
 * real-madrid-2006 world, so options lists read like a real shortlist — the
 * Milito brothers & D'Alessandro at Zaragoza, Dani Güiza & Arango & Ibagaza at
 * Mallorca, Žigić & a teenage Garay & Munitis at Racing, Tamudo & Riera at the
 * UEFA-Cup-finalist Espanyol, a young Raúl García at Osasuna. HIDDEN designer
 * estimates (§7); real clubs, birth years, positions, contracts. Injury
 * proneness at the population norm (~30). Names already curated are omitted.
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

const ZARAGOZA_06: CuratedSeed[] = [
  q('zaragoza', 'g_milito_za06', 'Gabriel Milito', 1980, 'Argentina', ['CB'], 83, 85, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('zaragoza', 'dalessandro_za06', 'Andrés D’Alessandro', 1981, 'Argentina', ['AM', 'LW'], 80, 83, 2009, 30, t(6, 7, 8, 7, 6, 8)),
  q('zaragoza', 'ponzio_za06', 'Leonardo Ponzio', 1982, 'Argentina', ['CM', 'DM'], 78, 81, 2009, 30, t(8, 5, 8, 7, 5, 8)),
  q('zaragoza', 'd_milito_za06', 'Diego Milito', 1979, 'Argentina', ['ST'], 83, 86, 2008, 30, t(8, 6, 9, 7, 5, 8)),
  q('zaragoza', 'ewerthon_za06', 'Ewerthon', 1981, 'Brazil', ['ST'], 78, 80, 2009, 30, t(7, 6, 8, 7, 5, 8)),
  q('zaragoza', 'zapater_za06', 'Rubén Zapater', 1985, 'Spain', ['CM'], 72, 78, 2009, 30, t(8, 5, 8, 8, 5, 8)),
];

const MALLORCA_06: CuratedSeed[] = [
  q('mallorca', 'guiza_ma06', 'Daniel Güiza', 1980, 'Spain', ['ST'], 78, 82, 2008, 30, t(6, 7, 8, 7, 6, 8)),
  q('mallorca', 'arango_ma06', 'Juan Arango', 1980, 'Venezuela', ['LW', 'AM'], 78, 81, 2009, 30, t(8, 6, 8, 7, 5, 8)),
  q('mallorca', 'ibagaza_ma06', 'Ariel Ibagaza', 1976, 'Argentina', ['AM', 'CM'], 78, 79, 2008, 30, t(7, 6, 8, 8, 5, 8)),
  q('mallorca', 'jonas_ma06', 'Jonás Gutiérrez', 1983, 'Argentina', ['RW', 'CM'], 76, 82, 2008, 30, t(8, 6, 8, 7, 5, 8)),
  q('mallorca', 'varela_ma06', 'Fernando Varela', 1979, 'Spain', ['CB'], 74, 76, 2008, 30, t(8, 5, 8, 8, 5, 8)),
];

const RACING_06: CuratedSeed[] = [
  q('racing', 'zigic_ra06', 'Nikola Žigić', 1980, 'Serbia', ['ST'], 78, 81, 2009, 30, t(7, 6, 8, 7, 5, 8)),
  q('racing', 'munitis_ra06', 'Pedro Munitis', 1975, 'Spain', ['RW', 'AM'], 77, 78, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('racing', 'garay_ra06', 'Ezequiel Garay', 1986, 'Argentina', ['CB'], 74, 85, 2008, 30, t(9, 5, 8, 8, 5, 8)),
  q('racing', 'colsa_ra06', 'Gonzalo Colsa', 1976, 'Spain', ['DM', 'CM'], 74, 75, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('racing', 'oscar_serrano_ra06', 'Óscar Serrano', 1981, 'Spain', ['RW', 'CM'], 73, 75, 2008, 30, t(8, 5, 8, 8, 5, 8)),
];

const ESPANYOL_06: CuratedSeed[] = [
  q('espanyol', 'tamudo_es06', 'Raúl Tamudo', 1977, 'Spain', ['ST', 'AM'], 79, 80, 2008, 30, t(8, 6, 8, 9, 5, 8), { loyalty: 90 }),
  q('espanyol', 'riera_es06', 'Albert Riera', 1982, 'Spain', ['LW'], 78, 82, 2008, 30, t(7, 6, 8, 7, 6, 8)),
  q('espanyol', 'delapena_es06', 'Iván de la Peña', 1976, 'Spain', ['AM', 'CM'], 77, 78, 2008, 30, t(6, 7, 8, 7, 6, 8)),
  q('espanyol', 'pandiani_es06', 'Walter Pandiani', 1976, 'Uruguay', ['ST'], 76, 78, 2008, 30, t(7, 6, 8, 7, 5, 8)),
  q('espanyol', 'jarque_es06', 'Dani Jarque', 1983, 'Spain', ['CB'], 75, 81, 2009, 30, t(9, 5, 8, 9, 4, 8), { loyalty: 92 }),
];

const ATHLETIC_06: CuratedSeed[] = [
  q('athletic', 'etxeberria_at06', 'Joseba Etxeberria', 1977, 'Spain', ['RW', 'ST'], 77, 78, 2008, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 92 }),
  q('athletic', 'iraola_at06', 'Andoni Iraola', 1982, 'Spain', ['RB'], 76, 80, 2009, 30, t(9, 5, 8, 9, 4, 8), { loyalty: 90 }),
  q('athletic', 'yeste_at06', 'Francisco Yeste', 1979, 'Spain', ['AM', 'LW'], 75, 78, 2008, 30, t(7, 6, 8, 8, 5, 8)),
  q('athletic', 'gurpegui_at06', 'Carlos Gurpegui', 1980, 'Spain', ['DM', 'CB'], 75, 79, 2009, 30, t(9, 5, 8, 9, 4, 8), { loyalty: 90 }),
  q('athletic', 'ocio_at06', 'Aitor Ocio', 1976, 'Spain', ['CB'], 74, 76, 2008, 30, t(8, 5, 8, 8, 5, 8)),
];

const OSASUNA_06: CuratedSeed[] = [
  q('osasuna', 'raul_garcia_os06', 'Raúl García', 1986, 'Spain', ['CM', 'AM'], 74, 84, 2009, 30, t(8, 6, 8, 8, 5, 8)),
  q('osasuna', 'webo_os06', 'Pierre Webó', 1982, 'Cameroon', ['ST'], 76, 79, 2009, 30, t(7, 6, 8, 7, 5, 8)),
  q('osasuna', 'punal_os06', 'Patxi Puñal', 1975, 'Spain', ['DM', 'CM'], 75, 76, 2008, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 92 }),
  q('osasuna', 'juanfran_os06', 'Juanfran', 1976, 'Spain', ['LB', 'LW'], 74, 75, 2008, 30, t(8, 5, 8, 8, 5, 8)),
];

const GETAFE_06: CuratedSeed[] = [
  q('getafe', 'del_moral_ge06', 'Manu del Moral', 1984, 'Spain', ['ST', 'LW'], 74, 80, 2009, 30, t(8, 6, 8, 7, 5, 8)),
  q('getafe', 'cata_diaz_ge06', 'Gabriel Díaz', 1979, 'Argentina', ['CB'], 75, 78, 2009, 30, t(8, 5, 8, 8, 5, 8)),
  q('getafe', 'belenguer_ge06', 'David Belenguer', 1972, 'Spain', ['CB'], 73, 74, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('getafe', 'pachon_ge06', 'Francisco Pachón', 1977, 'Spain', ['ST'], 72, 74, 2008, 30, t(7, 6, 8, 7, 5, 8)),
];

const BETIS_06: CuratedSeed[] = [
  q('betis', 'sobis_be06', 'Rafael Sobis', 1985, 'Brazil', ['ST', 'AM'], 76, 82, 2009, 30, t(7, 6, 8, 7, 5, 8)),
  q('betis', 'arzu_be06', 'Arzu', 1977, 'Spain', ['RW', 'AM'], 73, 75, 2008, 30, t(7, 6, 8, 7, 5, 8)),
  q('betis', 'melli_be06', 'Melli', 1984, 'Spain', ['CM', 'DM'], 72, 78, 2009, 30, t(8, 5, 8, 8, 5, 8)),
  q('betis', 'juande_be06', 'Juande', 1984, 'Spain', ['RB', 'RW'], 72, 77, 2009, 30, t(8, 5, 8, 8, 5, 8)),
];

const REAL_SOCIEDAD_06: CuratedSeed[] = [
  q('real_sociedad', 'kovacevic_rs06', 'Darko Kovačević', 1973, 'Serbia', ['ST'], 79, 80, 2008, 30, t(8, 6, 8, 8, 5, 8)),
  q('real_sociedad', 'aranburu_rs06', 'Mikel Aranburu', 1979, 'Spain', ['LW', 'AM'], 73, 75, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('real_sociedad', 'prieto_rs06', 'Xabi Prieto', 1983, 'Spain', ['AM', 'RW'], 75, 80, 2009, 30, t(9, 5, 8, 9, 4, 8), { loyalty: 92 }),
];

const CELTA_06: CuratedSeed[] = [
  q('celta', 'baiano_ce06', 'Fernando Baiano', 1978, 'Brazil', ['ST'], 74, 76, 2008, 30, t(7, 6, 8, 7, 5, 8)),
  q('celta', 'canobbio_ce06', 'Fabián Canobbio', 1980, 'Uruguay', ['AM', 'RW'], 73, 76, 2008, 30, t(7, 6, 8, 7, 5, 8)),
  q('celta', 'oubina_ce06', 'Pablo Oubiña', 1980, 'Spain', ['DM', 'CM'], 72, 74, 2008, 30, t(8, 5, 8, 8, 5, 8)),
];

const RECREATIVO_06: CuratedSeed[] = [
  q('recreativo', 'sinama_re06', 'Florent Sinama Pongolle', 1984, 'France', ['ST', 'LW'], 74, 79, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('recreativo', 'uche_re06', 'Kalu Uche', 1982, 'Nigeria', ['ST', 'RW'], 73, 77, 2008, 30, t(7, 6, 8, 7, 5, 8)),
  q('recreativo', 'javi_guerrero_re06', 'Javi Guerrero', 1976, 'Spain', ['ST'], 72, 73, 2008, 30, t(7, 6, 8, 8, 5, 8)),
];

/** The domestic mid-tier of the 2006-07 La Liga. Merged by CONCATENATION into
 *  REAL_MADRID_2006_SQUADS. */
export const ESP_DOMESTIC_2006_SQUADS: Record<string, CuratedSeed[]> = {
  zaragoza: ZARAGOZA_06,
  mallorca: MALLORCA_06,
  racing: RACING_06,
  espanyol: ESPANYOL_06,
  athletic: ATHLETIC_06,
  osasuna: OSASUNA_06,
  getafe: GETAFE_06,
  betis: BETIS_06,
  real_sociedad: REAL_SOCIEDAD_06,
  celta: CELTA_06,
  recreativo: RECREATIVO_06,
};
