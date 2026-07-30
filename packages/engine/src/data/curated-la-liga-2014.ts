/**
 * Curated real players — 2014 La Liga "Peak — Don't Waste It" pack (Spain).
 *
 * The vertical slice for "Barcelona — 2014: Peak — Don't Waste It". Luis Enrique
 * has arrived, Suárez signs after the World Cup, and MSN — Messi, Suárez, Neymar —
 * is about to become the most devastating front three in history. Reality: the
 * 2015 treble, then a slow squander — Neymar sold to PSG in 2017 for €222m and the
 * money wasted on Coutinho and Dembélé, the decline into the 8-2. The
 * counterfactual is to keep the golden generation together and not waste the peak.
 *
 * Across the modern game: the BBC/Décima Real, Pep's Bayern, Simeone's champion
 * Atlético, Abu Dhabi's City, the Qatari PSG — every real European Cup of
 * 2015-2025 anchored. Ability/potential/personality are HIDDEN designer estimates
 * (§7); clubs, birth years, positions and contracts are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { ESP_DOMESTIC_2014_SQUADS } from './curated-esp-domestic-2014.js';

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

// ── Barcelona, 2014–15 (Luis Enrique; MSN and the treble) ─────────────────────
export const BARCELONA_2014: CuratedSeed[] = [
  q('barcelona', 'ter_stegen', 'Marc-André ter Stegen', 1992, 'Germany', ['GK'], 82, 90, 2019, 15, t(9, 6, 9, 9, 4, 8)),
  q('barcelona', 'bravo_b14', 'Claudio Bravo', 1983, 'Chile', ['GK'], 82, 83, 2018, 15, t(9, 5, 8, 8, 4, 7)),
  q('barcelona', 'pique_b14', 'Gerard Piqué', 1987, 'Spain', ['CB'], 87, 88, 2019, 20, t(8, 7, 8, 9, 5, 8), { loyalty: 90 }),
  q('barcelona', 'mascherano_b14', 'Javier Mascherano', 1984, 'Argentina', ['CB', 'DM'], 85, 85, 2018, 20, t(9, 6, 9, 8, 6, 7)),
  q('barcelona', 'alba_b14', 'Jordi Alba', 1989, 'Spain', ['LB'], 85, 87, 2019, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 88 }),
  // Alexis Sánchez — a Barça man at the 2014 kickoff, sold to Arsenal that summer (£30m)
  // to help fund Suárez; seeded here so that real departure (and its income) is live.
  q('barcelona', 'sanchez_b14', 'Alexis Sánchez', 1988, 'Chile', ['RW', 'ST'], 84, 87, 2018, 20, t(8, 7, 9, 7, 6, 8)),
  q('barcelona', 'alves_b14', 'Dani Alves', 1983, 'Brazil', ['RB'], 85, 85, 2016, 20, t(8, 7, 9, 8, 5, 8)),
  q('barcelona', 'bartra_b14', 'Marc Bartra', 1991, 'Spain', ['CB'], 78, 84, 2017, 20, t(8, 6, 8, 8, 5, 7)),
  q('barcelona', 'montoya_b14', 'Martín Montoya', 1991, 'Spain', ['RB'], 76, 81, 2017, 20, t(8, 5, 8, 8, 5, 7)),
  q('barcelona', 'busquets_b14', 'Sergio Busquets', 1988, 'Spain', ['DM'], 88, 89, 2019, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 92 }),
  q('barcelona', 'rakitic_b14', 'Ivan Rakitić', 1988, 'Croatia', ['CM'], 85, 86, 2019, 20, t(9, 5, 8, 8, 4, 8)),
  q('barcelona', 'iniesta_b14', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 88, 88, 2018, 20, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'xavi_b14', 'Xavi', 1980, 'Spain', ['CM'], 84, 84, 2015, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 97 }),
  q('barcelona', 'rafinha_b14', 'Rafinha Alcântara', 1993, 'Brazil', ['AM', 'CM'], 76, 84, 2018, 25, t(8, 5, 8, 8, 5, 8)),
  q('barcelona', 'sergi_roberto_b14', 'Sergi Roberto', 1992, 'Spain', ['CM', 'RB'], 76, 84, 2018, 15, t(9, 5, 8, 10, 4, 8), { loyalty: 92 }),
  q('barcelona', 'messi_b14', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 95, 99, 2019, 15, t(10, 6, 10, 10, 3, 8), { loyalty: 94 }),
  q('barcelona', 'suarez_b14', 'Luis Suárez', 1987, 'Uruguay', ['ST'], 90, 92, 2019, 20, t(8, 8, 10, 8, 8, 8)),
  q('barcelona', 'neymar_b14', 'Neymar', 1992, 'Brazil', ['LW', 'ST'], 89, 95, 2018, 20, t(6, 8, 9, 7, 6, 8)),
  q('barcelona', 'pedro_b14', 'Pedro', 1987, 'Spain', ['RW', 'ST'], 82, 83, 2016, 20, t(9, 5, 8, 9, 4, 8)),
  q('barcelona', 'munir', 'Munir El Haddadi', 1995, 'Spain', ['ST', 'RW'], 70, 82, 2018, 20, t(8, 6, 8, 8, 5, 7)),
  // Real 2014-15 depth to the era minimum (Mathieu, that summer's centre-half signing).
  q('barcelona', 'mathieu_b14', 'Jérémy Mathieu', 1983, 'France', ['CB', 'LB'], 81, 82, 2018, 25, t(8, 5, 8, 7, 5, 7)),
];

// ── Real Madrid, 2014–15 (Ancelotti; the BBC after La Décima) ─────────────────
export const REAL_MADRID_2014: CuratedSeed[] = [
  q('real_madrid', 'casillas_r14', 'Iker Casillas', 1981, 'Spain', ['GK'], 85, 85, 2017, 15, t(9, 6, 9, 10, 5, 7), { loyalty: 92 }),
  q('real_madrid', 'keylor_r14', 'Keylor Navas', 1986, 'Costa Rica', ['GK'], 82, 86, 2019, 15, t(9, 6, 8, 9, 4, 8)),
  q('real_madrid', 'ramos_r14', 'Sergio Ramos', 1986, 'Spain', ['CB', 'RB'], 89, 90, 2019, 20, t(8, 7, 9, 9, 7, 7), { loyalty: 90 }),
  q('real_madrid', 'pepe_r14', 'Pepe', 1983, 'Portugal', ['CB'], 85, 85, 2017, 25, t(7, 7, 8, 8, 8, 7)),
  q('real_madrid', 'marcelo_r14', 'Marcelo', 1988, 'Brazil', ['LB', 'LW'], 86, 88, 2019, 20, t(8, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('real_madrid', 'carvajal_r14', 'Dani Carvajal', 1992, 'Spain', ['RB'], 82, 88, 2019, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('real_madrid', 'varane_r14', 'Raphaël Varane', 1993, 'France', ['CB'], 82, 90, 2019, 20, t(9, 6, 9, 8, 4, 8)),
  q('real_madrid', 'modric_r14', 'Luka Modrić', 1985, 'Croatia', ['CM'], 88, 89, 2018, 15, t(10, 5, 9, 9, 4, 8)),
  q('real_madrid', 'kroos_r14', 'Toni Kroos', 1990, 'Germany', ['CM'], 88, 90, 2020, 15, t(10, 5, 9, 9, 3, 8)),
  q('real_madrid', 'isco_r14', 'Isco', 1992, 'Spain', ['AM', 'CM'], 83, 89, 2018, 20, t(8, 6, 8, 8, 5, 8)),
  q('real_madrid', 'james_r14', 'James Rodríguez', 1991, 'Colombia', ['AM', 'LW'], 84, 88, 2020, 20, t(7, 7, 8, 7, 5, 8)),
  q('real_madrid', 'bale_r14', 'Gareth Bale', 1989, 'Wales', ['RW', 'ST'], 89, 91, 2020, 30, t(8, 7, 9, 7, 5, 7)),
  q('real_madrid', 'benzema_r14', 'Karim Benzema', 1987, 'France', ['ST'], 87, 90, 2019, 20, t(8, 7, 9, 8, 5, 8)),
  q('real_madrid', 'cristiano_r14', 'Cristiano Ronaldo', 1985, 'Portugal', ['LW', 'ST'], 94, 95, 2018, 15, t(10, 9, 10, 8, 5, 8)),
  q('real_madrid', 'chicharito_r14', 'Javier Hernández', 1988, 'Mexico', ['ST'], 79, 81, 2015, 20, t(9, 6, 8, 8, 5, 8)),
];

// ── Atlético Madrid, 2014–15 (Simeone; reigning champions) ────────────────────
export const ATLETICO_2014: CuratedSeed[] = [
  q('atletico', 'oblak_a14', 'Jan Oblak', 1993, 'Slovenia', ['GK'], 80, 92, 2020, 15, t(10, 5, 9, 9, 4, 7)),
  q('atletico', 'moya_a14', 'Miguel Ángel Moyà', 1984, 'Spain', ['GK'], 79, 80, 2018, 15, t(8, 5, 8, 8, 5, 7)),
  q('atletico', 'godin_a14', 'Diego Godín', 1986, 'Uruguay', ['CB'], 87, 88, 2019, 20, t(9, 6, 9, 9, 6, 7), { loyalty: 90 }),
  q('atletico', 'miranda_a14', 'Miranda', 1984, 'Brazil', ['CB'], 84, 85, 2018, 20, t(9, 5, 8, 8, 5, 7)),
  q('atletico', 'juanfran_a14', 'Juanfran', 1985, 'Spain', ['RB'], 83, 84, 2018, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('atletico', 'siqueira_a14', 'Guilherme Siqueira', 1986, 'Brazil', ['LB'], 79, 80, 2018, 20, t(8, 5, 8, 8, 5, 7)),
  q('atletico', 'gabi_a14', 'Gabi', 1983, 'Spain', ['DM', 'CM'], 83, 84, 2018, 20, t(9, 6, 8, 10, 6, 7), { loyalty: 92 }),
  q('atletico', 'koke_a14', 'Koke', 1992, 'Spain', ['CM', 'AM'], 84, 89, 2019, 15, t(9, 6, 9, 10, 5, 8), { loyalty: 92 }),
  q('atletico', 'tiago_a14', 'Tiago', 1981, 'Portugal', ['CM', 'DM'], 80, 80, 2016, 20, t(9, 5, 8, 8, 5, 7)),
  q('atletico', 'saul_a14', 'Saúl Ñíguez', 1994, 'Spain', ['CM', 'DM'], 76, 88, 2020, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('atletico', 'griezmann_a14', 'Antoine Griezmann', 1991, 'France', ['ST', 'AM'], 85, 91, 2020, 15, t(9, 7, 9, 8, 5, 8)),
  q('atletico', 'mandzukic_a14', 'Mario Mandžukić', 1986, 'Croatia', ['ST'], 84, 85, 2018, 20, t(8, 7, 9, 7, 6, 7)),
  q('atletico', 'raul_garcia_a14', 'Raúl García', 1986, 'Spain', ['CM', 'AM'], 79, 80, 2017, 20, t(9, 5, 8, 8, 6, 7)),
  q('atletico', 'torres_a14', 'Fernando Torres', 1984, 'Spain', ['ST'], 79, 79, 2017, 25, t(8, 6, 8, 10, 5, 8), { loyalty: 90 }),
];

// ── Sevilla, 2014–15 (Emery; the Europa League machine) ───────────────────────
export const SEVILLA_2014: CuratedSeed[] = [
  q('sevilla', 'rico_s14', 'Sergio Rico', 1993, 'Spain', ['GK'], 78, 84, 2019, 15, t(8, 5, 8, 8, 5, 7)),
  q('sevilla', 'rami_s14', 'Adil Rami', 1985, 'France', ['CB'], 80, 81, 2018, 20, t(7, 6, 8, 7, 6, 7)),
  q('sevilla', 'kolo_s14', 'Timothée Kolodziejczak', 1991, 'France', ['CB', 'LB'], 77, 82, 2019, 20, t(8, 5, 8, 8, 5, 7)),
  q('sevilla', 'coke_s14', 'Coke', 1987, 'Spain', ['RB'], 78, 80, 2017, 20, t(8, 5, 8, 8, 5, 7)),
  q('sevilla', 'trremoulinas', 'Benoît Trémoulinas', 1985, 'France', ['LB'], 77, 78, 2017, 20, t(8, 5, 7, 8, 5, 7)),
  q('sevilla', 'banega_s14', 'Éver Banega', 1988, 'Argentina', ['CM', 'AM'], 82, 84, 2016, 20, t(6, 7, 8, 7, 6, 8)),
  q('sevilla', 'krohn_dehli', 'Michael Krohn-Dehli', 1983, 'Denmark', ['AM', 'LW'], 78, 79, 2017, 20, t(8, 5, 8, 8, 5, 7)),
  q('sevilla', 'vitolo_s14', 'Vitolo', 1989, 'Spain', ['LW', 'RW'], 81, 84, 2019, 20, t(8, 6, 8, 8, 5, 8)),
  q('sevilla', 'reyes_s14', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'AM'], 79, 79, 2017, 25, t(6, 6, 7, 8, 6, 7)),
  q('sevilla', 'bacca_s14', 'Carlos Bacca', 1986, 'Colombia', ['ST'], 82, 84, 2018, 20, t(8, 7, 8, 7, 5, 7)),
  q('sevilla', 'gameiro_s14', 'Kevin Gameiro', 1987, 'France', ['ST'], 81, 83, 2018, 20, t(8, 6, 8, 8, 5, 8)),
  q('sevilla', 'iborra_s14', 'Vicente Iborra', 1988, 'Spain', ['DM', 'CM'], 78, 80, 2018, 20, t(9, 5, 8, 8, 5, 7)),
];

// ── Valencia, 2014–15 (Nuno; the Peter Lim revival) ───────────────────────────
export const VALENCIA_2014: CuratedSeed[] = [
  q('valencia', 'diego_alves_v14', 'Diego Alves', 1985, 'Brazil', ['GK'], 82, 83, 2018, 20, t(8, 5, 8, 8, 5, 7)),
  q('valencia', 'otamendi_v14', 'Nicolás Otamendi', 1988, 'Argentina', ['CB'], 83, 85, 2019, 20, t(8, 6, 8, 7, 6, 7)),
  q('valencia', 'mustafi_v14', 'Shkodran Mustafi', 1992, 'Germany', ['CB'], 80, 85, 2019, 20, t(8, 6, 8, 7, 6, 7)),
  q('valencia', 'gaya_v14', 'José Gayà', 1995, 'Spain', ['LB'], 76, 86, 2019, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 92 }),
  q('valencia', 'barragan_v14', 'Antonio Barragán', 1987, 'Spain', ['RB'], 76, 78, 2018, 20, t(8, 5, 7, 8, 5, 7)),
  q('valencia', 'parejo_v14', 'Dani Parejo', 1989, 'Spain', ['CM', 'AM'], 82, 85, 2019, 20, t(7, 6, 8, 8, 6, 8)),
  q('valencia', 'javi_fuego', 'Javi Fuego', 1984, 'Spain', ['DM'], 77, 78, 2017, 20, t(9, 5, 7, 8, 5, 7)),
  q('valencia', 'feghouli_v14', 'Sofiane Feghouli', 1989, 'Algeria', ['RW', 'AM'], 79, 82, 2017, 20, t(7, 6, 8, 7, 6, 8)),
  q('valencia', 'andre_gomes_v14', 'André Gomes', 1993, 'Portugal', ['CM', 'AM'], 79, 86, 2019, 20, t(8, 6, 8, 8, 5, 8)),
  q('valencia', 'piatti_v14', 'Pablo Piatti', 1989, 'Argentina', ['LW', 'RW'], 78, 80, 2018, 20, t(8, 5, 8, 8, 5, 7)),
  q('valencia', 'paco_alcacer', 'Paco Alcácer', 1993, 'Spain', ['ST'], 80, 86, 2019, 20, t(8, 6, 8, 9, 5, 8)),
  q('valencia', 'negredo_v14', 'Álvaro Negredo', 1985, 'Spain', ['ST'], 81, 82, 2018, 20, t(8, 6, 8, 7, 5, 7)),
];

// ── The elite of Europe, 2014–15 — full squads so every real European Cup of the
//    span (2015–2025) is anchored to a side that exists. ───────────────────────
export const BAYERN_2014: CuratedSeed[] = [
  q('bayern', 'neuer_y14', 'Manuel Neuer', 1986, 'Germany', ['GK'], 90, 91, 2019, 15, t(10, 6, 9, 9, 4, 8), { loyalty: 92 }),
  q('bayern', 'lahm_y14', 'Philipp Lahm', 1983, 'Germany', ['RB', 'DM'], 87, 87, 2018, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 95 }),
  q('bayern', 'boateng_y14', 'Jérôme Boateng', 1988, 'Germany', ['CB'], 86, 88, 2019, 20, t(8, 6, 8, 8, 5, 8)),
  q('bayern', 'alaba_y14', 'David Alaba', 1992, 'Austria', ['LB', 'CB'], 85, 89, 2019, 15, t(9, 6, 9, 9, 5, 8)),
  q('bayern', 'bernat_y14', 'Juan Bernat', 1993, 'Spain', ['LB'], 78, 84, 2019, 20, t(8, 5, 8, 8, 5, 8)),
  q('bayern', 'rafinha_y14', 'Rafinha', 1985, 'Brazil', ['RB'], 80, 81, 2017, 20, t(8, 5, 8, 8, 5, 8)),
  q('bayern', 'alonso_y14', 'Xabi Alonso', 1981, 'Spain', ['DM', 'CM'], 86, 86, 2016, 15, t(10, 5, 9, 8, 4, 8)),
  q('bayern', 'schweinsteiger_y14', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM'], 85, 85, 2016, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('bayern', 'thiago_y14', 'Thiago Alcântara', 1991, 'Spain', ['CM', 'AM'], 84, 89, 2019, 25, t(9, 6, 9, 8, 4, 8)),
  q('bayern', 'muller_y14', 'Thomas Müller', 1989, 'Germany', ['AM', 'RW', 'ST'], 87, 88, 2019, 15, t(9, 6, 9, 10, 4, 8), { loyalty: 94 }),
  q('bayern', 'robben_y14', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 88, 88, 2017, 30, t(8, 7, 9, 8, 5, 8)),
  q('bayern', 'ribery_y14', 'Franck Ribéry', 1983, 'France', ['LW', 'AM'], 87, 87, 2017, 30, t(8, 7, 9, 8, 6, 8)),
  q('bayern', 'gotze_y14', 'Mario Götze', 1992, 'Germany', ['AM', 'ST'], 84, 89, 2017, 25, t(8, 6, 8, 7, 5, 8)),
  q('bayern', 'lewandowski_y14', 'Robert Lewandowski', 1988, 'Poland', ['ST'], 89, 92, 2019, 15, t(9, 7, 10, 8, 5, 8)),
];

export const MANCITY_2014: CuratedSeed[] = [
  q('man_city', 'hart_c14', 'Joe Hart', 1987, 'England', ['GK'], 84, 85, 2019, 15, t(8, 6, 8, 8, 6, 7)),
  q('man_city', 'kompany_c14', 'Vincent Kompany', 1986, 'Belgium', ['CB'], 87, 88, 2019, 25, t(9, 7, 9, 9, 5, 7), { loyalty: 90 }),
  q('man_city', 'zabaleta_c14', 'Pablo Zabaleta', 1985, 'Argentina', ['RB'], 84, 84, 2017, 20, t(9, 6, 9, 9, 6, 8), { loyalty: 90 }),
  q('man_city', 'clichy_c14', 'Gaël Clichy', 1985, 'France', ['LB'], 81, 81, 2017, 20, t(8, 5, 8, 8, 5, 8)),
  q('man_city', 'kolarov_c14', 'Aleksandar Kolarov', 1985, 'Serbia', ['LB'], 81, 82, 2018, 20, t(8, 6, 8, 7, 5, 7)),
  q('man_city', 'mangala_c14', 'Eliaquim Mangala', 1991, 'France', ['CB'], 78, 84, 2019, 20, t(7, 6, 8, 7, 6, 7)),
  q('man_city', 'yaya_c14', 'Yaya Touré', 1983, 'Ivory Coast', ['CM', 'DM'], 87, 87, 2017, 20, t(7, 8, 9, 7, 6, 7)),
  q('man_city', 'fernandinho_c14', 'Fernandinho', 1985, 'Brazil', ['DM', 'CM'], 85, 86, 2018, 20, t(9, 6, 9, 8, 5, 8)),
  q('man_city', 'silva_c14', 'David Silva', 1986, 'Spain', ['AM', 'CM'], 88, 89, 2019, 15, t(9, 6, 9, 9, 4, 8), { loyalty: 90 }),
  q('man_city', 'nasri_c14', 'Samir Nasri', 1987, 'France', ['AM', 'LW'], 83, 85, 2017, 20, t(6, 7, 8, 7, 6, 8)),
  q('man_city', 'navas_c14', 'Jesús Navas', 1985, 'Spain', ['RW'], 81, 82, 2018, 20, t(9, 5, 8, 8, 5, 8)),
  q('man_city', 'aguero_c14', 'Sergio Agüero', 1988, 'Argentina', ['ST'], 90, 92, 2019, 25, t(8, 7, 10, 8, 5, 8)),
  q('man_city', 'dzeko_c14', 'Edin Džeko', 1986, 'Bosnia', ['ST'], 83, 84, 2018, 20, t(8, 6, 8, 7, 5, 8)),
  q('man_city', 'bony_c14', 'Wilfried Bony', 1988, 'Ivory Coast', ['ST'], 80, 82, 2018, 20, t(8, 6, 8, 7, 5, 7)),
];

export const CHELSEA_2014: CuratedSeed[] = [
  q('chelsea', 'courtois_c14', 'Thibaut Courtois', 1992, 'Belgium', ['GK'], 87, 91, 2019, 15, t(9, 6, 9, 8, 4, 8)),
  q('chelsea', 'terry_c14', 'John Terry', 1980, 'England', ['CB'], 85, 85, 2017, 20, t(9, 7, 9, 10, 6, 7), { loyalty: 95 }),
  q('chelsea', 'cahill_c14', 'Gary Cahill', 1985, 'England', ['CB'], 83, 84, 2019, 20, t(9, 6, 8, 9, 5, 7)),
  q('chelsea', 'ivanovic_c14', 'Branislav Ivanović', 1984, 'Serbia', ['RB', 'CB'], 84, 85, 2018, 20, t(9, 6, 8, 8, 6, 7)),
  q('chelsea', 'azpilicueta_c14', 'César Azpilicueta', 1989, 'Spain', ['LB', 'RB'], 84, 87, 2019, 15, t(10, 5, 9, 9, 5, 8), { loyalty: 92 }),
  q('chelsea', 'matic_c14', 'Nemanja Matić', 1988, 'Serbia', ['DM', 'CM'], 85, 87, 2019, 20, t(9, 6, 8, 8, 5, 8)),
  q('chelsea', 'fabregas_c14', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 86, 87, 2019, 20, t(8, 6, 8, 7, 5, 8)),
  q('chelsea', 'ramires_c14', 'Ramires', 1987, 'Brazil', ['CM', 'DM'], 82, 83, 2017, 20, t(9, 6, 8, 7, 5, 8)),
  q('chelsea', 'hazard_c14', 'Eden Hazard', 1991, 'Belgium', ['LW', 'AM'], 89, 92, 2020, 20, t(8, 7, 9, 8, 5, 8)),
  q('chelsea', 'willian_c14', 'Willian', 1988, 'Brazil', ['RW', 'AM'], 83, 84, 2018, 15, t(9, 6, 8, 8, 5, 8)),
  q('chelsea', 'oscar_c14', 'Oscar', 1991, 'Brazil', ['AM', 'CM'], 83, 87, 2019, 20, t(8, 6, 8, 8, 5, 8)),
  q('chelsea', 'costa_c14', 'Diego Costa', 1988, 'Spain', ['ST'], 87, 88, 2019, 25, t(7, 8, 9, 7, 8, 7)),
  q('chelsea', 'remy_c14', 'Loïc Rémy', 1987, 'France', ['ST'], 80, 81, 2018, 25, t(7, 6, 8, 7, 5, 7)),
  q('chelsea', 'drogba_c14', 'Didier Drogba', 1978, 'Ivory Coast', ['ST'], 80, 80, 2015, 25, t(9, 7, 9, 9, 6, 7), { loyalty: 90 }),
];

export const JUVENTUS_2014: CuratedSeed[] = [
  q('juventus', 'buffon_j14', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 88, 88, 2017, 20, t(10, 6, 9, 10, 4, 7), { loyalty: 97 }),
  q('juventus', 'barzagli_j14', 'Andrea Barzagli', 1981, 'Italy', ['CB'], 85, 85, 2017, 20, t(9, 5, 8, 9, 4, 7)),
  q('juventus', 'bonucci_j14', 'Leonardo Bonucci', 1987, 'Italy', ['CB'], 86, 89, 2019, 20, t(8, 7, 9, 8, 5, 8)),
  q('juventus', 'chiellini_j14', 'Giorgio Chiellini', 1984, 'Italy', ['CB'], 87, 87, 2018, 20, t(9, 6, 9, 10, 5, 7), { loyalty: 95 }),
  q('juventus', 'lichtsteiner_j14', 'Stephan Lichtsteiner', 1984, 'Switzerland', ['RB'], 82, 83, 2018, 20, t(9, 6, 8, 8, 5, 8)),
  q('juventus', 'evra_j14', 'Patrice Evra', 1981, 'France', ['LB'], 82, 82, 2016, 20, t(9, 6, 8, 8, 5, 8)),
  q('juventus', 'pirlo_j14', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'CM'], 86, 86, 2016, 20, t(9, 6, 9, 8, 4, 8)),
  q('juventus', 'vidal_j14', 'Arturo Vidal', 1987, 'Chile', ['CM', 'DM'], 87, 88, 2019, 20, t(7, 8, 9, 7, 7, 8)),
  q('juventus', 'pogba_j14', 'Paul Pogba', 1993, 'France', ['CM', 'DM'], 85, 93, 2019, 20, t(7, 8, 9, 7, 5, 8)),
  q('juventus', 'marchisio_j14', 'Claudio Marchisio', 1986, 'Italy', ['CM', 'DM'], 84, 85, 2018, 20, t(9, 6, 9, 10, 4, 8), { loyalty: 94 }),
  q('juventus', 'tevez_j14', 'Carlos Tévez', 1984, 'Argentina', ['ST', 'AM'], 87, 87, 2016, 20, t(8, 8, 10, 7, 7, 8)),
  q('juventus', 'morata_j14', 'Álvaro Morata', 1992, 'Spain', ['ST'], 81, 88, 2019, 20, t(8, 6, 8, 8, 5, 8)),
  q('juventus', 'llorente_j14', 'Fernando Llorente', 1985, 'Spain', ['ST'], 81, 82, 2016, 20, t(8, 6, 8, 8, 5, 7)),
];

export const LIVERPOOL_2014: CuratedSeed[] = [
  q('liverpool', 'mignolet_l14', 'Simon Mignolet', 1988, 'Belgium', ['GK'], 80, 82, 2019, 15, t(8, 5, 8, 8, 6, 7)),
  q('liverpool', 'skrtel_l14', 'Martin Škrtel', 1984, 'Slovakia', ['CB'], 82, 83, 2018, 20, t(8, 6, 8, 8, 6, 7)),
  q('liverpool', 'lovren_l14', 'Dejan Lovren', 1989, 'Croatia', ['CB'], 80, 84, 2019, 20, t(7, 6, 8, 7, 6, 7)),
  q('liverpool', 'sakho_l14', 'Mamadou Sakho', 1990, 'France', ['CB'], 81, 85, 2018, 25, t(7, 6, 8, 8, 6, 7)),
  q('liverpool', 'johnson_l14', 'Glen Johnson', 1984, 'England', ['RB'], 80, 80, 2015, 25, t(7, 6, 8, 7, 5, 7)),
  q('liverpool', 'moreno_l14', 'Alberto Moreno', 1992, 'Spain', ['LB'], 78, 84, 2019, 20, t(7, 6, 8, 8, 6, 8)),
  q('liverpool', 'gerrard_l14', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 84, 84, 2015, 20, t(9, 7, 9, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'henderson_l14', 'Jordan Henderson', 1990, 'England', ['CM', 'DM'], 82, 87, 2019, 20, t(10, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('liverpool', 'coutinho_l14', 'Philippe Coutinho', 1992, 'Brazil', ['AM', 'LW'], 84, 90, 2020, 20, t(8, 6, 9, 8, 5, 8)),
  q('liverpool', 'lallana_l14', 'Adam Lallana', 1988, 'England', ['AM', 'LW'], 81, 84, 2019, 25, t(9, 5, 8, 8, 5, 8)),
  q('liverpool', 'sterling_l14', 'Raheem Sterling', 1994, 'England', ['RW', 'LW'], 82, 90, 2017, 20, t(8, 7, 9, 7, 5, 8)),
  q('liverpool', 'sturridge_l14', 'Daniel Sturridge', 1989, 'England', ['ST'], 84, 87, 2019, 35, t(7, 7, 8, 7, 6, 8)),
  q('liverpool', 'balotelli_l14', 'Mario Balotelli', 1990, 'Italy', ['ST'], 80, 86, 2018, 25, t(4, 9, 8, 5, 9, 7)),
  q('liverpool', 'lambert_l14', 'Rickie Lambert', 1982, 'England', ['ST'], 77, 77, 2017, 20, t(8, 5, 8, 8, 5, 7)),
];

export const INTER_2014: CuratedSeed[] = [
  q('inter', 'handanovic_i14', 'Samir Handanović', 1984, 'Slovenia', ['GK'], 86, 86, 2019, 15, t(9, 6, 9, 9, 4, 7), { loyalty: 90 }),
  q('inter', 'ranocchia_i14', 'Andrea Ranocchia', 1988, 'Italy', ['CB'], 79, 82, 2018, 20, t(8, 5, 8, 8, 6, 7)),
  q('inter', 'juan_jesus_i14', 'Juan Jesus', 1991, 'Brazil', ['CB', 'LB'], 78, 83, 2019, 20, t(8, 5, 8, 7, 5, 7)),
  q('inter', 'vidic_i14', 'Nemanja Vidić', 1981, 'Serbia', ['CB'], 82, 82, 2016, 25, t(9, 6, 9, 8, 6, 7)),
  q('inter', 'nagatomo_i14', 'Yuto Nagatomo', 1986, 'Japan', ['LB', 'RB'], 79, 80, 2018, 20, t(9, 5, 8, 8, 5, 8)),
  q('inter', 'medel_i14', 'Gary Medel', 1987, 'Chile', ['DM', 'CB'], 80, 82, 2018, 20, t(8, 7, 8, 7, 7, 7)),
  q('inter', 'guarin_i14', 'Fredy Guarín', 1986, 'Colombia', ['CM', 'AM'], 80, 82, 2017, 20, t(6, 7, 8, 7, 6, 7)),
  q('inter', 'hernanes_i14', 'Hernanes', 1985, 'Brazil', ['CM', 'AM'], 80, 82, 2018, 20, t(7, 6, 8, 7, 5, 8)),
  q('inter', 'kovacic_i14', 'Mateo Kovačić', 1994, 'Croatia', ['CM', 'AM'], 78, 88, 2019, 20, t(9, 6, 9, 8, 4, 8)),
  q('inter', 'icardi_i14', 'Mauro Icardi', 1993, 'Argentina', ['ST'], 82, 88, 2019, 20, t(6, 8, 9, 6, 6, 7)),
  q('inter', 'palacio_i14', 'Rodrigo Palacio', 1982, 'Argentina', ['ST'], 81, 81, 2016, 20, t(8, 6, 8, 8, 5, 8)),
  q('inter', 'podolski_i14', 'Lukas Podolski', 1985, 'Germany', ['LW', 'ST'], 80, 81, 2015, 20, t(7, 6, 8, 8, 5, 8)),
  q('inter', 'obi_i14', 'Joel Obi', 1991, 'Nigeria', ['CM', 'DM'], 74, 79, 2018, 20, t(8, 5, 8, 7, 5, 7)),
];

// Arsenal 2014-15 — a real Champions League side in this world, and the club that
// signed Alexis Sánchez from Barcelona that summer (his sale is in the ledger).
export const ARSENAL_2014: CuratedSeed[] = [
  q('arsenal', 'szczesny_a14', 'Wojciech Szczęsny', 1990, 'Poland', ['GK'], 82, 86, 2019, 15, t(7, 7, 8, 7, 6, 7)),
  q('arsenal', 'ospina_a14', 'David Ospina', 1988, 'Colombia', ['GK'], 79, 80, 2018, 15, t(8, 5, 8, 8, 5, 7)),
  q('arsenal', 'debuchy_a14', 'Mathieu Debuchy', 1985, 'France', ['RB'], 80, 81, 2018, 25, t(8, 6, 8, 7, 5, 7)),
  q('arsenal', 'mertesacker_a14', 'Per Mertesacker', 1984, 'Germany', ['CB'], 82, 82, 2018, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 88 }),
  q('arsenal', 'koscielny_a14', 'Laurent Koscielny', 1985, 'France', ['CB'], 85, 85, 2019, 20, t(9, 6, 9, 8, 5, 7)),
  q('arsenal', 'monreal_a14', 'Nacho Monreal', 1986, 'Spain', ['LB', 'CB'], 81, 82, 2019, 15, t(9, 5, 8, 9, 4, 7)),
  q('arsenal', 'gibbs_a14', 'Kieran Gibbs', 1989, 'England', ['LB'], 79, 80, 2018, 25, t(8, 5, 8, 8, 5, 7)),
  q('arsenal', 'chambers_a14', 'Calum Chambers', 1995, 'England', ['CB', 'RB'], 74, 83, 2020, 20, t(8, 5, 8, 8, 5, 7)),
  q('arsenal', 'arteta_a14', 'Mikel Arteta', 1982, 'Spain', ['DM', 'CM'], 80, 80, 2016, 20, t(10, 6, 9, 9, 4, 8), { loyalty: 88 }),
  q('arsenal', 'ramsey_a14', 'Aaron Ramsey', 1990, 'Wales', ['CM', 'AM'], 84, 86, 2019, 30, t(8, 6, 9, 8, 5, 8)),
  q('arsenal', 'wilshere_a14', 'Jack Wilshere', 1992, 'England', ['CM', 'AM'], 80, 84, 2018, 55, t(7, 6, 8, 8, 6, 7)),
  q('arsenal', 'cazorla_a14', 'Santi Cazorla', 1984, 'Spain', ['AM', 'CM'], 85, 85, 2018, 15, t(9, 6, 9, 8, 4, 8)),
  q('arsenal', 'ozil_a14', 'Mesut Özil', 1988, 'Germany', ['AM'], 86, 88, 2019, 20, t(8, 6, 9, 7, 4, 8)),
  q('arsenal', 'giroud_a14', 'Olivier Giroud', 1986, 'France', ['ST'], 82, 83, 2018, 20, t(8, 6, 9, 8, 5, 7)),
  q('arsenal', 'walcott_a14', 'Theo Walcott', 1989, 'England', ['RW', 'ST'], 81, 82, 2018, 30, t(8, 6, 8, 8, 5, 8)),
  q('arsenal', 'oxlade_a14', 'Alex Oxlade-Chamberlain', 1993, 'England', ['RW', 'CM'], 79, 84, 2019, 35, t(8, 6, 8, 8, 5, 8)),
];

export const PSG_2014: CuratedSeed[] = [
  q('psg', 'sirigu_p14', 'Salvatore Sirigu', 1987, 'Italy', ['GK'], 82, 83, 2018, 15, t(8, 6, 8, 8, 5, 7)),
  q('psg', 'thiago_silva_p14', 'Thiago Silva', 1984, 'Brazil', ['CB'], 88, 88, 2018, 20, t(9, 6, 9, 8, 5, 8), { loyalty: 88 }),
  q('psg', 'david_luiz_p14', 'David Luiz', 1987, 'Brazil', ['CB', 'DM'], 84, 85, 2019, 20, t(7, 7, 8, 7, 6, 8)),
  q('psg', 'marquinhos_p14', 'Marquinhos', 1994, 'Brazil', ['CB', 'RB'], 80, 90, 2019, 15, t(9, 6, 9, 9, 5, 8)),
  q('psg', 'maxwell_p14', 'Maxwell', 1981, 'Brazil', ['LB'], 82, 82, 2016, 20, t(9, 5, 8, 8, 4, 8)),
  q('psg', 'verratti_p14', 'Marco Verratti', 1992, 'Italy', ['CM', 'DM'], 84, 90, 2019, 20, t(8, 7, 9, 8, 6, 8)),
  q('psg', 'matuidi_p14', 'Blaise Matuidi', 1987, 'France', ['CM', 'DM'], 84, 85, 2019, 15, t(9, 6, 9, 8, 5, 8)),
  q('psg', 'motta_p14', 'Thiago Motta', 1982, 'Italy', ['DM', 'CM'], 82, 82, 2016, 25, t(8, 6, 8, 7, 6, 8)),
  q('psg', 'cavani_p14', 'Edinson Cavani', 1987, 'Uruguay', ['ST'], 87, 88, 2018, 20, t(9, 7, 9, 8, 5, 8)),
  q('psg', 'ibrahimovic_p14', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 89, 89, 2016, 20, t(8, 9, 9, 7, 6, 8)),
  q('psg', 'lavezzi_p14', 'Ezequiel Lavezzi', 1985, 'Argentina', ['LW', 'ST'], 81, 82, 2016, 20, t(7, 6, 8, 7, 6, 8)),
  q('psg', 'pastore_p14', 'Javier Pastore', 1989, 'Argentina', ['AM'], 83, 85, 2019, 25, t(6, 7, 8, 7, 5, 8)),
];

export const DORTMUND_2014: CuratedSeed[] = [
  q('dortmund', 'weidenfeller_d14', 'Roman Weidenfeller', 1980, 'Germany', ['GK'], 82, 82, 2016, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('dortmund', 'hummels_d14', 'Mats Hummels', 1988, 'Germany', ['CB'], 87, 89, 2019, 20, t(9, 6, 9, 8, 5, 8)),
  q('dortmund', 'subotic_d14', 'Neven Subotić', 1988, 'Serbia', ['CB'], 82, 84, 2018, 20, t(8, 6, 8, 8, 5, 7)),
  q('dortmund', 'piszczek_d14', 'Łukasz Piszczek', 1985, 'Poland', ['RB'], 82, 83, 2018, 20, t(9, 5, 8, 9, 5, 8)),
  q('dortmund', 'schmelzer_d14', 'Marcel Schmelzer', 1988, 'Germany', ['LB'], 80, 82, 2018, 20, t(9, 5, 8, 9, 5, 7)),
  q('dortmund', 'gundogan_d14', 'İlkay Gündoğan', 1990, 'Germany', ['CM', 'DM'], 83, 88, 2016, 25, t(9, 6, 9, 8, 5, 8)),
  q('dortmund', 'bender_d14', 'Sven Bender', 1989, 'Germany', ['DM', 'CB'], 80, 82, 2017, 25, t(9, 5, 8, 9, 5, 7)),
  q('dortmund', 'mkhitaryan_d14', 'Henrikh Mkhitaryan', 1989, 'Armenia', ['AM', 'RW'], 83, 86, 2018, 20, t(8, 6, 9, 8, 5, 8)),
  q('dortmund', 'reus_d14', 'Marco Reus', 1989, 'Germany', ['LW', 'AM'], 87, 89, 2019, 30, t(9, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('dortmund', 'aubameyang_d14', 'Pierre-Emerick Aubameyang', 1989, 'Gabon', ['ST', 'LW'], 84, 89, 2018, 15, t(8, 7, 9, 7, 5, 8)),
  q('dortmund', 'immobile_d14', 'Ciro Immobile', 1990, 'Italy', ['ST'], 80, 87, 2018, 20, t(8, 6, 8, 8, 5, 7)),
];

// ── Ajax, 2014-15 (the academy that fed Barça's next midfield) ─────────────────
export const AJAX_2014: CuratedSeed[] = [
  q('ajax', 'cillessen_a14', 'Jasper Cillessen', 1989, 'Netherlands', ['GK'], 81, 85, 2018, 15, t(8, 6, 8, 8, 5, 8)),
  q('ajax', 'veltman_a14', 'Joël Veltman', 1992, 'Netherlands', ['CB', 'RB'], 77, 82, 2018, 15, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'moisander_a14', 'Niklas Moisander', 1985, 'Finland', ['CB'], 78, 80, 2016, 20, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'boilesen_a14', 'Nicolai Boilesen', 1992, 'Denmark', ['LB'], 75, 80, 2017, 25, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'schone_a14', 'Lasse Schöne', 1986, 'Denmark', ['CM', 'AM'], 79, 82, 2018, 15, t(8, 6, 8, 8, 5, 8)),
  q('ajax', 'klaassen_a14', 'Davy Klaassen', 1993, 'Netherlands', ['AM', 'CM'], 77, 85, 2018, 15, t(9, 6, 9, 8, 4, 8)),
  q('ajax', 'fischer_a14', 'Viktor Fischer', 1994, 'Denmark', ['LW', 'RW'], 74, 84, 2017, 25, t(7, 6, 8, 7, 6, 8)),
  q('ajax', 'el_ghazi_a14', 'Anwar El Ghazi', 1995, 'Netherlands', ['RW', 'ST'], 72, 83, 2018, 20, t(7, 7, 8, 6, 6, 8)),
  q('ajax', 'milik_a14', 'Arkadiusz Milik', 1994, 'Poland', ['ST'], 76, 86, 2018, 20, t(8, 6, 9, 7, 5, 8)),
  q('ajax', 'riedewald_a14', 'Jaïro Riedewald', 1996, 'Netherlands', ['CB', 'DM'], 70, 82, 2018, 15, t(8, 6, 8, 7, 5, 8)),
  // Frenkie de Jong — seeded young (17) for his real 2019 Ajax→Barcelona move,
  // the €75m heir to Iniesta and Busquets bought straight out of the academy run.
  q('ajax', 'de_jong_f14', 'Frenkie de Jong', 1997, 'Netherlands', ['CM', 'DM'], 60, 90, 2020, 10, t(9, 6, 9, 8, 4, 9)),
];

/** The full Barcelona-2014 curated universe. */
export const BARCELONA_2014_SQUADS: Record<string, CuratedSeed[]> = {
  barcelona: BARCELONA_2014,
  real_madrid: REAL_MADRID_2014,
  atletico: ATLETICO_2014,
  sevilla: SEVILLA_2014,
  valencia: VALENCIA_2014,
  bayern: BAYERN_2014,
  man_city: MANCITY_2014,
  chelsea: CHELSEA_2014,
  juventus: JUVENTUS_2014,
  liverpool: LIVERPOOL_2014,
  inter: INTER_2014,
  psg: PSG_2014,
  dortmund: DORTMUND_2014,
  ajax: AJAX_2014,
  arsenal: ARSENAL_2014,
};

// Domestic mid-tier of the 2014-15 La Liga (M12 shortlist supply) — real squad
// players at the non-elite clubs so options lists read like a real shortlist.
for (const [club, seeds] of Object.entries(ESP_DOMESTIC_2014_SQUADS)) {
  BARCELONA_2014_SQUADS[club] = [...(BARCELONA_2014_SQUADS[club] ?? []), ...seeds];
}
