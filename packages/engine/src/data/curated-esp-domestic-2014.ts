/**
 * Curated domestic mid-tier — 2014-15 La Liga (M12 shortlist supply).
 *
 * Real 2014-15 squad players at the modelled La Liga's non-elite clubs for the
 * barcelona-2014 world, so options lists read like a real shortlist — a breakout
 * Luciano Vietto at Villarreal, the one-club Athletic of Laporte, Muniain &
 * Aduriz, Carlos Vela & a young Iñigo Martínez at Real Sociedad, Nolito's Celta,
 * Lucas Pérez at Deportivo, Aleix Vidal & a loaned Thomas Partey at Almería.
 * HIDDEN designer estimates (§7); real clubs, birth years, positions, contracts.
 * A prospect-rich era. Injury proneness at the population norm (~30). Names
 * already curated in the world are omitted.
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

const VILLARREAL_14: CuratedSeed[] = [
  q('villarreal', 'asenjo_vl14', 'Sergio Asenjo', 1989, 'Spain', ['GK'], 78, 84, 2018, 30, t(8, 5, 8, 8, 5, 8)),
  q('villarreal', 'musacchio_vl14', 'Mateo Musacchio', 1990, 'Argentina', ['CB'], 78, 83, 2017, 30, t(8, 5, 8, 8, 5, 8)),
  q('villarreal', 'bruno_vl14', 'Bruno Soriano', 1984, 'Spain', ['DM', 'CM'], 79, 81, 2017, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 92 }),
  q('villarreal', 'gio_vl14', 'Giovani dos Santos', 1989, 'Mexico', ['AM', 'LW'], 78, 82, 2016, 30, t(6, 7, 8, 7, 6, 8)),
  q('villarreal', 'vietto_vl14', 'Luciano Vietto', 1993, 'Argentina', ['ST', 'AM'], 78, 87, 2018, 30, t(7, 6, 9, 7, 5, 8)),
  q('villarreal', 'uche_vl14', 'Ikechukwu Uche', 1984, 'Nigeria', ['ST'], 76, 78, 2016, 30, t(7, 6, 8, 7, 5, 8)),
];

const ATHLETIC_14: CuratedSeed[] = [
  q('athletic', 'laporte_at14', 'Aymeric Laporte', 1994, 'France', ['CB'], 78, 88, 2018, 30, t(9, 5, 8, 8, 4, 8)),
  q('athletic', 'muniain_at14', 'Iker Muniain', 1992, 'Spain', ['LW', 'AM'], 79, 85, 2017, 30, t(8, 6, 8, 9, 5, 8), { loyalty: 90 }),
  q('athletic', 'aduriz_at14', 'Aritz Aduriz', 1981, 'Spain', ['ST'], 81, 82, 2016, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('athletic', 'susaeta_at14', 'Markel Susaeta', 1987, 'Spain', ['RW'], 78, 80, 2017, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('athletic', 'demarcos_at14', 'Óscar de Marcos', 1989, 'Spain', ['RB', 'CM'], 77, 80, 2017, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('athletic', 'benat_at14', 'Beñat Etxebarria', 1987, 'Spain', ['CM', 'DM'], 77, 79, 2017, 30, t(8, 5, 8, 8, 5, 8)),
];

const REAL_SOCIEDAD_14: CuratedSeed[] = [
  q('real_sociedad', 'rulli_rs14', 'Gerónimo Rulli', 1992, 'Argentina', ['GK'], 76, 84, 2018, 30, t(8, 5, 8, 8, 5, 8)),
  q('real_sociedad', 'inigo_rs14', 'Iñigo Martínez', 1991, 'Spain', ['CB'], 78, 85, 2017, 30, t(9, 5, 8, 8, 5, 8)),
  q('real_sociedad', 'xabi_prieto_rs14', 'Xabi Prieto', 1983, 'Spain', ['AM', 'RW'], 78, 79, 2016, 30, t(9, 5, 8, 10, 4, 8), { loyalty: 95 }),
  q('real_sociedad', 'canales_rs14', 'Sergio Canales', 1991, 'Spain', ['AM', 'CM'], 77, 84, 2018, 30, t(8, 5, 8, 7, 5, 8)),
  q('real_sociedad', 'vela_rs14', 'Carlos Vela', 1989, 'Mexico', ['LW', 'ST'], 80, 84, 2017, 30, t(7, 6, 8, 7, 5, 8)),
  q('real_sociedad', 'agirretxe_rs14', 'Imanol Agirretxe', 1987, 'Spain', ['ST'], 75, 77, 2017, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
];

const CELTA_14: CuratedSeed[] = [
  q('celta', 'nolito_ce14', 'Nolito', 1986, 'Spain', ['LW', 'ST'], 80, 83, 2017, 30, t(7, 6, 8, 7, 5, 8)),
  q('celta', 'orellana_ce14', 'Fabián Orellana', 1985, 'Chile', ['RW', 'AM'], 77, 79, 2016, 30, t(7, 6, 8, 7, 6, 8)),
  q('celta', 'charles_ce14', 'Charles', 1984, 'Brazil', ['ST'], 76, 78, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('celta', 'augusto_ce14', 'Augusto Fernández', 1986, 'Argentina', ['CM', 'DM'], 77, 80, 2017, 30, t(8, 5, 8, 7, 5, 8)),
  q('celta', 'santi_mina_ce14', 'Santi Mina', 1995, 'Spain', ['ST', 'RW'], 71, 82, 2018, 30, t(8, 6, 8, 8, 5, 8)),
  q('celta', 'hugo_mallo_ce14', 'Hugo Mallo', 1991, 'Spain', ['RB'], 75, 80, 2018, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
];

const MALAGA_14: CuratedSeed[] = [
  q('malaga', 'juanmi_ma14', 'Juanmi', 1993, 'Spain', ['ST', 'LW'], 74, 82, 2017, 30, t(8, 6, 8, 7, 5, 8)),
  q('malaga', 'amrabat_ma14', 'Nordin Amrabat', 1987, 'Morocco', ['RW', 'LW'], 77, 79, 2016, 30, t(7, 6, 8, 7, 6, 8)),
  q('malaga', 'camacho_ma14', 'Ignacio Camacho', 1990, 'Spain', ['DM', 'CM'], 77, 81, 2017, 30, t(8, 5, 8, 8, 5, 8)),
  q('malaga', 'duda_ma14', 'Duda', 1980, 'Portugal', ['AM', 'LW'], 75, 76, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('malaga', 'weligton_ma14', 'Weligton', 1979, 'Brazil', ['CB'], 75, 76, 2016, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
];

const ESPANYOL_14: CuratedSeed[] = [
  q('espanyol', 'casilla_es14', 'Kiko Casilla', 1986, 'Spain', ['GK'], 78, 82, 2017, 30, t(8, 5, 8, 8, 5, 8)),
  q('espanyol', 'sergio_garcia_es14', 'Sergio García', 1983, 'Spain', ['ST', 'AM'], 76, 78, 2016, 30, t(7, 6, 8, 8, 5, 8)),
  q('espanyol', 'stuani_es14', 'Christian Stuani', 1986, 'Uruguay', ['ST'], 77, 80, 2017, 30, t(8, 6, 8, 7, 5, 8)),
  q('espanyol', 'caicedo_es14', 'Felipe Caicedo', 1988, 'Ecuador', ['ST'], 76, 79, 2016, 30, t(6, 7, 8, 6, 6, 8)),
  q('espanyol', 'lucas_vazquez_es14', 'Lucas Vázquez', 1991, 'Spain', ['RW', 'AM'], 73, 82, 2015, 30, t(8, 6, 8, 8, 5, 8)),
];

const DEPORTIVO_14: CuratedSeed[] = [
  q('deportivo', 'lucas_perez_dp14', 'Lucas Pérez', 1988, 'Spain', ['ST', 'AM'], 78, 83, 2017, 30, t(8, 6, 8, 7, 5, 8)),
  q('deportivo', 'cavaleiro_dp14', 'Iván Cavaleiro', 1993, 'Portugal', ['LW', 'AM'], 74, 83, 2015, 30, t(7, 6, 8, 7, 5, 8)),
  q('deportivo', 'celso_borges_dp14', 'Celso Borges', 1988, 'Costa Rica', ['CM', 'DM'], 76, 79, 2017, 30, t(8, 5, 8, 8, 5, 8)),
  q('deportivo', 'toche_dp14', 'Toché', 1982, 'Spain', ['ST'], 73, 74, 2016, 30, t(7, 6, 8, 7, 5, 8)),
];

const ALMERIA_14: CuratedSeed[] = [
  q('almeria', 'aleix_vidal_al14', 'Aleix Vidal', 1989, 'Spain', ['RW', 'RB'], 77, 83, 2016, 30, t(8, 6, 8, 7, 5, 8)),
  q('almeria', 'partey_al14', 'Thomas Partey', 1993, 'Ghana', ['DM', 'CM'], 74, 85, 2015, 30, t(8, 6, 8, 7, 5, 8)),
  q('almeria', 'hemed_al14', 'Tomer Hemed', 1987, 'Israel', ['ST'], 75, 77, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('almeria', 'verza_al14', 'Verza', 1986, 'Spain', ['AM', 'CM'], 73, 75, 2016, 30, t(7, 6, 8, 7, 5, 8)),
];

const GRANADA_14: CuratedSeed[] = [
  q('granada', 'el_arabi_gr14', 'Youssef El-Arabi', 1987, 'Morocco', ['ST'], 76, 79, 2017, 30, t(7, 6, 8, 7, 5, 8)),
  q('granada', 'success_gr14', 'Isaac Success', 1996, 'Nigeria', ['ST', 'LW'], 70, 82, 2018, 30, t(6, 7, 8, 7, 6, 8)),
  q('granada', 'rochina_gr14', 'Rubén Rochina', 1991, 'Spain', ['AM', 'LW'], 73, 79, 2016, 30, t(6, 7, 8, 7, 6, 8)),
  q('granada', 'piti_gr14', 'Piti', 1981, 'Spain', ['ST', 'RW'], 73, 74, 2016, 30, t(7, 6, 8, 7, 5, 8)),
];

const ELCHE_14: CuratedSeed[] = [
  q('elche', 'jonathas_el14', 'Jonathas', 1989, 'Brazil', ['ST'], 76, 80, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('elche', 'garry_el14', 'Garry Rodrigues', 1990, 'Cape Verde', ['RW', 'LW'], 73, 80, 2016, 30, t(6, 7, 8, 7, 6, 8)),
  q('elche', 'herrera_el14', 'Cristian Herrera', 1991, 'Spain', ['ST'], 71, 76, 2016, 30, t(7, 6, 8, 7, 5, 8)),
];

const RAYO_14: CuratedSeed[] = [
  q('rayo', 'bueno_ry14', 'Alberto Bueno', 1988, 'Spain', ['ST', 'AM'], 76, 79, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('rayo', 'trashorras_ry14', 'Roberto Trashorras', 1981, 'Spain', ['AM', 'CM'], 76, 77, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('rayo', 'baena_ry14', 'Raúl Baena', 1989, 'Spain', ['DM', 'CM'], 73, 76, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('rayo', 'jozabed_ry14', 'Jozabed', 1991, 'Spain', ['AM', 'CM'], 72, 78, 2016, 30, t(8, 5, 8, 7, 5, 8)),
];

const GETAFE_14: CuratedSeed[] = [
  q('getafe', 'pedro_leon_ge14', 'Pedro León', 1986, 'Spain', ['RW', 'AM'], 76, 78, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('getafe', 'lafita_ge14', 'Ángel Lafita', 1984, 'Spain', ['AM', 'RW'], 74, 76, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('getafe', 'diego_castro_ge14', 'Diego Castro', 1982, 'Spain', ['RW', 'ST'], 74, 76, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('getafe', 'alexis_ge14', 'Alexis Ruano', 1985, 'Spain', ['CB'], 73, 75, 2016, 30, t(8, 5, 8, 8, 6, 8)),
];

/** The domestic mid-tier of the 2014-15 La Liga. Merged by CONCATENATION into
 *  BARCELONA_2014_SQUADS. */
export const ESP_DOMESTIC_2014_SQUADS: Record<string, CuratedSeed[]> = {
  villarreal: VILLARREAL_14,
  athletic: ATHLETIC_14,
  real_sociedad: REAL_SOCIEDAD_14,
  celta: CELTA_14,
  malaga: MALAGA_14,
  espanyol: ESPANYOL_14,
  deportivo: DEPORTIVO_14,
  almeria: ALMERIA_14,
  granada: GRANADA_14,
  elche: ELCHE_14,
  rayo: RAYO_14,
  getafe: GETAFE_14,
};
