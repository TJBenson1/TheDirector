/**
 * Curated real players — 2006 La Liga "Post-Galáctico Rebuild" pack (Spain).
 *
 * The vertical slice for "Real Madrid — 2006: Post-Galáctico Rebuild". Florentino
 * has resigned, the galáctico project is over, and Capello is back to rebuild:
 * Cannavaro (the reigning Ballon d'Or) and Van Nistelrooy arrive, Zidane has
 * retired, Ronaldo is on his way to Milan, and Beckham is in his last season
 * before LA. Reality: Capello grinds out the 2007 title, Schuster wins 2008, and
 * the Mourinho and BBC/Décima eras follow. The counterfactual is to rebuild
 * cleaner and faster — without wasting another galáctico decade.
 *
 * The Spanish clubs (and the 2006-07 Liverpool) are curated here; the rest of the
 * elite of Europe is reused from the late-2000s pack, so every real European Cup
 * of 2007-2022 is anchored to a side that exists. Ability/potential/personality
 * are HIDDEN designer estimates (§7); clubs, birth years, positions and contracts
 * are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { EUROPE_2007_SQUADS } from './curated-europe-2007.js';
import { ESP_DOMESTIC_2006_SQUADS } from './curated-esp-domestic-2006.js';
import {
  MANUTD_2007, MILAN_2007, INTER_2007, BAYERN_2007, CHELSEA_2007,
  JUVENTUS_2007, DORTMUND_2007, PORTO_2007,
} from './curated-serie-a-2007.js';

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

// ── Real Madrid, 2006–07 (Capello; the rebuild begins) ────────────────────────
export const REAL_MADRID_2006: CuratedSeed[] = [
  q('real_madrid', 'casillas_r6', 'Iker Casillas', 1981, 'Spain', ['GK'], 88, 90, 2013, 15, t(9, 6, 9, 10, 4, 7), { loyalty: 95 }),
  q('real_madrid', 'sergio_ramos_r6', 'Sergio Ramos', 1986, 'Spain', ['RB', 'CB'], 83, 92, 2013, 20, t(8, 7, 9, 9, 7, 7)),
  q('real_madrid', 'cannavaro_r6', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 87, 87, 2009, 20, t(9, 6, 9, 8, 5, 7)),
  q('real_madrid', 'helguera_r6', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 81, 81, 2007, 25, t(8, 6, 8, 8, 5, 7)),
  q('real_madrid', 'roberto_carlos_r6', 'Roberto Carlos', 1973, 'Brazil', ['LB', 'LW'], 84, 84, 2007, 20, t(8, 7, 9, 8, 5, 8)),
  q('real_madrid', 'salgado_r6', 'Míchel Salgado', 1975, 'Spain', ['RB'], 79, 79, 2009, 25, t(8, 5, 8, 8, 5, 7)),
  q('real_madrid', 'emerson_r6', 'Emerson', 1976, 'Brazil', ['DM', 'CM'], 83, 83, 2009, 25, t(8, 6, 8, 7, 5, 7)),
  q('real_madrid', 'diarra_r6', 'Mahamadou Diarra', 1981, 'Mali', ['DM', 'CM'], 82, 83, 2011, 25, t(8, 5, 8, 7, 5, 7)),
  q('real_madrid', 'guti_r6', 'Guti', 1976, 'Spain', ['AM', 'CM'], 82, 82, 2009, 25, t(6, 7, 7, 8, 6, 7)),
  q('real_madrid', 'beckham_r6', 'David Beckham', 1975, 'England', ['RW', 'CM'], 83, 83, 2007, 15, t(9, 7, 9, 7, 4, 7)),
  q('real_madrid', 'gago_r6', 'Fernando Gago', 1986, 'Argentina', ['DM', 'CM'], 76, 85, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('real_madrid', 'robinho_r6', 'Robinho', 1984, 'Brazil', ['LW', 'ST'], 83, 86, 2010, 25, t(6, 7, 8, 6, 6, 8)),
  q('real_madrid', 'reyes_r6', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'ST'], 80, 84, 2007, 25, t(6, 7, 8, 7, 6, 7)),
  q('real_madrid', 'raul_r6', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 84, 84, 2010, 20, t(9, 6, 9, 10, 4, 7), { loyalty: 96 }),
  q('real_madrid', 'van_nistelrooy_r6', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 87, 87, 2010, 25, t(9, 7, 9, 7, 4, 7)),
  q('real_madrid', 'ronaldo_r6', 'Ronaldo', 1976, 'Brazil', ['ST'], 84, 84, 2007, 45, t(4, 8, 7, 6, 8, 7)),
  q('real_madrid', 'higuain_r6', 'Gonzalo Higuaín', 1987, 'Argentina', ['ST'], 76, 88, 2013, 20, t(8, 6, 8, 7, 5, 8)),
  q('real_madrid', 'cassano_r6', 'Antonio Cassano', 1982, 'Italy', ['AM', 'ST'], 80, 85, 2008, 25, t(4, 9, 7, 6, 9, 6)),
];

// ── Barcelona, 2006–07 (Rijkaard's champions in decline; Ronaldinho fading) ────
export const BARCELONA_2006: CuratedSeed[] = [
  q('barcelona', 'valdes_b6', 'Víctor Valdés', 1982, 'Spain', ['GK'], 85, 87, 2012, 15, t(8, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('barcelona', 'puyol_b6', 'Carles Puyol', 1978, 'Spain', ['CB', 'RB'], 86, 87, 2011, 20, t(10, 5, 9, 10, 4, 7), { loyalty: 96 }),
  q('barcelona', 'marquez_b6', 'Rafael Márquez', 1979, 'Mexico', ['CB', 'DM'], 82, 84, 2010, 25, t(8, 6, 8, 7, 5, 7)),
  q('barcelona', 'zambrotta_b6', 'Gianluca Zambrotta', 1977, 'Italy', ['RB', 'LB'], 82, 84, 2010, 20, t(9, 5, 8, 8, 5, 7)),
  q('barcelona', 'thuram_b6', 'Lilian Thuram', 1972, 'France', ['CB'], 82, 82, 2008, 20, t(9, 5, 9, 8, 4, 7)),
  q('barcelona', 'van_bronckhorst_b6', 'Giovanni van Bronckhorst', 1975, 'Netherlands', ['LB', 'CM'], 80, 80, 2007, 20, t(9, 5, 8, 7, 4, 8)),
  q('barcelona', 'xavi_b6', 'Xavi', 1980, 'Spain', ['CM'], 87, 92, 2013, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'deco_b6', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 85, 85, 2009, 25, t(7, 6, 8, 7, 5, 7)),
  q('barcelona', 'iniesta_b6', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 84, 93, 2013, 20, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'edmilson_b6', 'Edmílson', 1976, 'Brazil', ['DM', 'CM'], 80, 81, 2008, 25, t(8, 5, 8, 7, 5, 7)),
  q('barcelona', 'giuly_b6', 'Ludovic Giuly', 1976, 'France', ['RW'], 81, 82, 2008, 25, t(8, 6, 8, 7, 5, 7)),
  q('barcelona', 'ronaldinho_b6', 'Ronaldinho', 1980, 'Brazil', ['AM', 'LW'], 89, 91, 2010, 25, t(5, 8, 8, 7, 7, 8)),
  q('barcelona', 'etoo_b6', 'Samuel Eto’o', 1981, 'Cameroon', ['ST'], 88, 89, 2010, 25, t(7, 8, 9, 6, 6, 7)),
  q('barcelona', 'messi_b6', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 84, 99, 2014, 15, t(10, 6, 10, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'saviola_b6', 'Javier Saviola', 1981, 'Argentina', ['ST'], 80, 82, 2007, 30, t(7, 6, 8, 6, 5, 7)),
  q('barcelona', 'gudjohnsen_b6', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 81, 81, 2010, 25, t(8, 6, 8, 7, 5, 7)),
];

// ── Sevilla, 2006–07 (Juande Ramos; back-to-back UEFA Cups, a title challenge) ─
export const SEVILLA_2006: CuratedSeed[] = [
  q('sevilla', 'palop_s6', 'Andrés Palop', 1973, 'Spain', ['GK'], 82, 82, 2010, 20, t(8, 6, 8, 8, 5, 6)),
  q('sevilla', 'daniel_alves_s6', 'Dani Alves', 1983, 'Brazil', ['RB'], 84, 89, 2010, 20, t(9, 6, 9, 8, 5, 8)),
  q('sevilla', 'javi_navarro_s6', 'Javi Navarro', 1974, 'Spain', ['CB'], 79, 79, 2008, 25, t(8, 5, 7, 9, 6, 6)),
  q('sevilla', 'escude', 'Julien Escudé', 1979, 'France', ['CB'], 80, 81, 2010, 25, t(8, 5, 8, 8, 5, 7)),
  q('sevilla', 'dragutinovic', 'Ivica Dragutinović', 1975, 'Serbia', ['CB', 'LB'], 78, 79, 2009, 25, t(8, 5, 7, 8, 5, 6)),
  q('sevilla', 'poulsen_s6', 'Christian Poulsen', 1980, 'Denmark', ['DM'], 80, 82, 2009, 25, t(8, 6, 8, 7, 6, 7)),
  q('sevilla', 'renato_s6', 'Renato', 1979, 'Brazil', ['DM', 'CM'], 80, 81, 2009, 25, t(8, 5, 8, 7, 5, 7)),
  q('sevilla', 'jesus_navas_s6', 'Jesús Navas', 1985, 'Spain', ['RW'], 80, 86, 2012, 20, t(9, 5, 8, 10, 6, 7), { loyalty: 92 }),
  q('sevilla', 'kanoute_s6', 'Frédéric Kanouté', 1977, 'Mali', ['ST'], 84, 85, 2010, 25, t(8, 6, 9, 8, 5, 7)),
  q('sevilla', 'luis_fabiano_s6', 'Luís Fabiano', 1980, 'Brazil', ['ST'], 83, 85, 2010, 25, t(7, 7, 8, 7, 6, 7)),
  q('sevilla', 'maresca', 'Enzo Maresca', 1980, 'Italy', ['CM', 'AM'], 78, 80, 2009, 25, t(8, 5, 8, 7, 5, 7)),
  q('sevilla', 'adriano_s6', 'Adriano Correia', 1984, 'Brazil', ['LB'], 76, 83, 2011, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── Valencia, 2006–07 ─────────────────────────────────────────────────────────
export const VALENCIA_2006: CuratedSeed[] = [
  q('valencia', 'canizares_v6', 'Santiago Cañizares', 1969, 'Spain', ['GK'], 82, 82, 2008, 20, t(9, 6, 8, 8, 5, 6)),
  q('valencia', 'ayala_v6', 'Roberto Ayala', 1973, 'Argentina', ['CB'], 84, 84, 2008, 20, t(9, 6, 8, 8, 5, 7)),
  q('valencia', 'marchena_v6', 'Carlos Marchena', 1979, 'Spain', ['CB', 'DM'], 81, 82, 2010, 25, t(8, 5, 8, 8, 5, 7)),
  q('valencia', 'miguel_v6', 'Miguel', 1980, 'Portugal', ['RB'], 78, 80, 2010, 25, t(8, 5, 7, 8, 4, 7)),
  q('valencia', 'moretti', 'Emiliano Moretti', 1981, 'Italy', ['LB'], 78, 80, 2010, 25, t(8, 5, 7, 8, 5, 7)),
  q('valencia', 'baraja_v6', 'Rubén Baraja', 1975, 'Spain', ['CM', 'DM'], 82, 82, 2009, 25, t(9, 5, 8, 8, 5, 7)),
  q('valencia', 'albelda_v6', 'David Albelda', 1977, 'Spain', ['DM'], 82, 82, 2010, 25, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('valencia', 'silva_v6', 'David Silva', 1986, 'Spain', ['AM', 'LW'], 79, 90, 2012, 20, t(9, 5, 9, 8, 4, 8)),
  q('valencia', 'vicente_v6', 'Vicente', 1981, 'Spain', ['LW'], 82, 84, 2009, 30, t(8, 6, 8, 8, 5, 8)),
  q('valencia', 'joaquin_v6', 'Joaquín', 1981, 'Spain', ['RW'], 82, 84, 2010, 25, t(8, 6, 8, 8, 5, 8)),
  q('valencia', 'villa_v6', 'David Villa', 1981, 'Spain', ['ST'], 85, 89, 2010, 20, t(9, 6, 9, 8, 5, 8)),
  q('valencia', 'morientes_v6', 'Fernando Morientes', 1976, 'Spain', ['ST'], 81, 81, 2009, 25, t(8, 6, 8, 8, 4, 7)),
];

// ── Atlético Madrid, 2006–07 (Torres's last season; Agüero arrives) ───────────
export const ATLETICO_2006: CuratedSeed[] = [
  q('atletico', 'abbiati_a6', 'Christian Abbiati', 1977, 'Italy', ['GK'], 80, 82, 2007, 20, t(8, 5, 8, 8, 5, 6)),
  q('atletico', 'perea_a6', 'Luis Perea', 1979, 'Colombia', ['CB'], 80, 81, 2010, 25, t(8, 5, 8, 8, 5, 7)),
  q('atletico', 'pablo_a6', 'Pablo Ibáñez', 1981, 'Spain', ['CB'], 79, 81, 2010, 25, t(8, 5, 8, 8, 5, 7)),
  q('atletico', 'antonio_lopez', 'Antonio López', 1981, 'Spain', ['LB'], 78, 80, 2010, 25, t(8, 5, 7, 8, 5, 7)),
  q('atletico', 'seitaridis_a6', 'Giourkas Seitaridis', 1981, 'Greece', ['RB'], 78, 79, 2009, 25, t(8, 4, 7, 7, 5, 7)),
  q('atletico', 'maniche_a6', 'Maniche', 1977, 'Portugal', ['CM'], 80, 81, 2008, 25, t(8, 6, 8, 7, 5, 7)),
  q('atletico', 'gabi_a6', 'Gabi', 1983, 'Spain', ['DM', 'CM'], 76, 83, 2010, 20, t(9, 5, 8, 9, 5, 7)),
  q('atletico', 'maxi_a6', 'Maxi Rodríguez', 1981, 'Argentina', ['RW', 'AM'], 81, 83, 2009, 25, t(8, 6, 8, 7, 5, 7)),
  q('atletico', 'petrov_a6', 'Martin Petrov', 1979, 'Bulgaria', ['LW'], 79, 80, 2008, 25, t(7, 6, 8, 7, 5, 7)),
  q('atletico', 'torres_a6', 'Fernando Torres', 1984, 'Spain', ['ST'], 84, 91, 2009, 25, t(8, 6, 9, 9, 5, 8), { loyalty: 85 }),
  q('atletico', 'aguero_a6', 'Sergio Agüero', 1988, 'Argentina', ['ST'], 78, 93, 2011, 20, t(8, 7, 9, 7, 5, 8)),
  q('atletico', 'kezman_a6', 'Mateja Kežman', 1979, 'Serbia', ['ST'], 76, 78, 2008, 25, t(7, 6, 8, 6, 6, 7)),
];

// ── Villarreal, 2006–07 (Riquelme's yellow submarine, fresh off a CL semi) ────
export const VILLARREAL_2006: CuratedSeed[] = [
  q('villarreal', 'barbosa', 'Sebastián Viera', 1983, 'Uruguay', ['GK'], 77, 80, 2010, 25, t(8, 5, 7, 8, 5, 6)),
  q('villarreal', 'quique_alvarez', 'Quique Álvarez', 1975, 'Spain', ['CB'], 77, 77, 2008, 25, t(8, 5, 7, 8, 5, 6)),
  q('villarreal', 'gonzalo', 'Gonzalo Rodríguez', 1984, 'Argentina', ['CB'], 79, 84, 2011, 25, t(8, 5, 8, 8, 5, 7)),
  q('villarreal', 'arruabarrena', 'Rodolfo Arruabarrena', 1975, 'Argentina', ['LB'], 76, 76, 2008, 25, t(8, 5, 7, 8, 5, 6)),
  q('villarreal', 'senna_v6', 'Marcos Senna', 1976, 'Spain', ['DM', 'CM'], 82, 84, 2010, 25, t(9, 5, 8, 9, 4, 7), { loyalty: 88 }),
  q('villarreal', 'cazorla_v6', 'Santi Cazorla', 1984, 'Spain', ['AM', 'LW'], 78, 87, 2011, 20, t(9, 5, 9, 8, 4, 8)),
  q('villarreal', 'pires_v6', 'Robert Pirès', 1973, 'France', ['LW', 'AM'], 82, 82, 2008, 25, t(8, 6, 8, 7, 4, 8)),
  q('villarreal', 'riquelme_v6', 'Juan Román Riquelme', 1978, 'Argentina', ['AM'], 85, 86, 2009, 30, t(6, 7, 8, 7, 6, 6)),
  q('villarreal', 'cani', 'Cani', 1981, 'Spain', ['RW', 'AM'], 78, 80, 2009, 25, t(8, 5, 8, 7, 5, 7)),
  q('villarreal', 'nihat', 'Nihat Kahveci', 1979, 'Turkey', ['ST', 'AM'], 80, 81, 2009, 25, t(7, 6, 8, 7, 5, 7)),
  q('villarreal', 'franco_v6', 'Guillermo Franco', 1976, 'Mexico', ['ST'], 78, 79, 2008, 25, t(7, 6, 8, 7, 5, 7)),
  q('villarreal', 'forlan_v6', 'Diego Forlán', 1979, 'Uruguay', ['ST', 'AM'], 83, 85, 2011, 20, t(9, 6, 9, 8, 4, 8)),
];

// ── Liverpool, 2006–07 (Benítez; back to the European Cup final) ───────────────
export const LIVERPOOL_2006: CuratedSeed[] = [
  q('liverpool', 'reina_l6', 'Pepe Reina', 1982, 'Spain', ['GK'], 84, 87, 2011, 15, t(9, 6, 8, 9, 4, 7)),
  q('liverpool', 'carragher_l6', 'Jamie Carragher', 1978, 'England', ['CB'], 84, 84, 2011, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'agger_l6', 'Daniel Agger', 1984, 'Denmark', ['CB'], 79, 85, 2012, 30, t(8, 5, 8, 9, 5, 7)),
  q('liverpool', 'finnan_l6', 'Steve Finnan', 1976, 'Ireland', ['RB'], 80, 80, 2008, 20, t(9, 4, 8, 8, 4, 7)),
  q('liverpool', 'riise_l6', 'John Arne Riise', 1980, 'Norway', ['LB', 'LW'], 80, 81, 2009, 25, t(8, 5, 8, 8, 4, 7)),
  q('liverpool', 'gerrard_l6', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 88, 90, 2011, 20, t(9, 7, 9, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'alonso_l6', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 85, 88, 2010, 20, t(9, 5, 8, 8, 4, 8)),
  q('liverpool', 'mascherano_l6', 'Javier Mascherano', 1984, 'Argentina', ['DM', 'CM'], 82, 86, 2011, 20, t(9, 6, 9, 8, 6, 7)),
  q('liverpool', 'sissoko_l6', 'Momo Sissoko', 1985, 'Mali', ['DM', 'CM'], 78, 82, 2010, 25, t(8, 5, 8, 7, 5, 7)),
  q('liverpool', 'kuyt_l6', 'Dirk Kuyt', 1980, 'Netherlands', ['RW', 'ST'], 81, 82, 2011, 20, t(9, 5, 8, 9, 4, 7)),
  q('liverpool', 'pennant', 'Jermaine Pennant', 1983, 'England', ['RW'], 77, 80, 2010, 25, t(5, 7, 7, 6, 7, 7)),
  q('liverpool', 'crouch_l6', 'Peter Crouch', 1981, 'England', ['ST'], 80, 81, 2009, 25, t(8, 5, 8, 7, 5, 7)),
  q('liverpool', 'bellamy_l6', 'Craig Bellamy', 1979, 'Wales', ['ST'], 80, 81, 2009, 25, t(6, 7, 8, 6, 7, 7)),
  q('liverpool', 'kewell_l6', 'Harry Kewell', 1978, 'Australia', ['LW'], 78, 80, 2008, 35, t(6, 6, 7, 7, 6, 7)),
];

// ── Deportivo, 2006–07 (fading) ───────────────────────────────────────────────
export const DEPORTIVO_2006: CuratedSeed[] = [
  q('deportivo', 'aranzubia', 'Daniel Aranzubia', 1979, 'Spain', ['GK'], 78, 80, 2010, 20, t(8, 5, 7, 8, 5, 6)),
  q('deportivo', 'juanma', 'Juan Rodríguez', 1982, 'Spain', ['CB', 'DM'], 76, 79, 2010, 25, t(8, 5, 7, 8, 5, 7)),
  q('deportivo', 'lopo', 'Joan Capdevila', 1978, 'Spain', ['LB'], 79, 80, 2008, 25, t(8, 5, 8, 8, 5, 7)),
  q('deportivo', 'juan_c_valeron', 'Juan Carlos Valerón', 1975, 'Spain', ['AM'], 82, 82, 2009, 30, t(8, 5, 8, 9, 4, 8), { loyalty: 90 }),
  q('deportivo', 'sergio_d6', 'Sergio', 1976, 'Spain', ['CM'], 77, 77, 2008, 25, t(8, 5, 7, 8, 5, 7)),
  q('deportivo', 'duscher', 'Aldo Duscher', 1979, 'Argentina', ['DM', 'CM'], 77, 78, 2009, 25, t(8, 5, 7, 7, 6, 7)),
  q('deportivo', 'taborda', 'Diego Tristán', 1976, 'Spain', ['ST'], 78, 78, 2007, 30, t(6, 6, 7, 6, 6, 7)),
  q('deportivo', 'riki', 'Riki', 1980, 'Spain', ['ST', 'LW'], 77, 79, 2009, 25, t(7, 5, 8, 7, 5, 7)),
];

/** The full Real-Madrid-2006 curated universe: the Spanish clubs (and the 2006-07
 *  Liverpool) fresh, the rest of the elite of Europe reused from the late-2000s
 *  pack so every real European Cup of 2007-2022 is anchored. */
export const REAL_MADRID_2006_SQUADS: Record<string, CuratedSeed[]> = {
  real_madrid: REAL_MADRID_2006,
  barcelona: BARCELONA_2006,
  sevilla: SEVILLA_2006,
  valencia: VALENCIA_2006,
  atletico: ATLETICO_2006,
  villarreal: VILLARREAL_2006,
  deportivo: DEPORTIVO_2006,
  liverpool: LIVERPOOL_2006,
  man_utd: MANUTD_2007,
  // Reused 2007 context squads — drop players still at their 2006 clubs above
  // (Emerson & Ronaldo at Real, Sissoko at Liverpool) so nobody is double-rostered.
  milan: MILAN_2007.filter((p) => p.name !== 'Emerson' && p.name !== 'Ronaldo'),
  inter: INTER_2007,
  bayern: BAYERN_2007,
  chelsea: CHELSEA_2007,
  juventus: JUVENTUS_2007.filter((p) => p.name !== 'Momo Sissoko'),
  dortmund: DORTMUND_2007,
  porto: PORTO_2007,
};

// European selling clubs (M12A rollout) — the mid-2000s foreign talent pipeline.
// Merged by CONCATENATION onto any club already present (Porto is augmented).
for (const [club, seeds] of Object.entries(EUROPE_2007_SQUADS)) {
  if (club === 'porto') continue; // this pack already curates the full 2006-07 Porto
  REAL_MADRID_2006_SQUADS[club] = [...(REAL_MADRID_2006_SQUADS[club] ?? []), ...seeds];
}

// Domestic mid-tier of the 2006-07 La Liga (M12 shortlist supply) — real squad
// players at the non-elite clubs so options lists read like a real shortlist.
for (const [club, seeds] of Object.entries(ESP_DOMESTIC_2006_SQUADS)) {
  REAL_MADRID_2006_SQUADS[club] = [...(REAL_MADRID_2006_SQUADS[club] ?? []), ...seeds];
}
