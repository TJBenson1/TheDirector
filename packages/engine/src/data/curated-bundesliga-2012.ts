/**
 * Curated real players — 2012 Bundesliga "Defend the Peak" pack (Germany).
 *
 * The vertical slice for "Borussia Dortmund — 2012: Defend the Peak". Klopp's side
 * are back-to-back champions and about to reach the 2013 Wembley final — the best
 * young team in Europe (Hummels, Götze, Reus, Gündoğan, Lewandowski). But the
 * vultures are already circling: Götze's move to Bayern is agreed mid-season, and
 * Lewandowski, Hummels and Gündoğan will all follow the money. The whole scenario
 * is holding the golden generation together before it is picked apart.
 *
 * Around them, the peak of the 2010s: Heynckes's treble Bayern, Tito's Barça, the
 * BBC-era Madrid — whose real European Cups (2013-2025) are anchored. The lighter
 * Bundesliga context is reused from the 2010 pack. Ability/potential/personality
 * are HIDDEN designer estimates (§7); clubs, birth years, positions and contracts
 * are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { SCHALKE_2010, WERDER_2010, LEVERKUSEN_2010, WOLFSBURG_2010 } from './curated-bundesliga-2010.js';

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

// ── Borussia Dortmund, 2012–13 (Klopp; the Wembley-final peak) ────────────────
export const DORTMUND_2012: CuratedSeed[] = [
  q('dortmund', 'weidenfeller_12', 'Roman Weidenfeller', 1980, 'Germany', ['GK'], 83, 84, 2016, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 92 }),
  q('dortmund', 'langerak_12', 'Mitchell Langerak', 1988, 'Australia', ['GK'], 75, 79, 2015, 20, t(8, 5, 7, 8, 5, 7)),
  q('dortmund', 'piszczek_12', 'Łukasz Piszczek', 1985, 'Poland', ['RB'], 84, 85, 2016, 20, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('dortmund', 'subotic_12', 'Neven Subotić', 1988, 'Serbia', ['CB'], 83, 85, 2016, 20, t(9, 6, 8, 9, 5, 7)),
  q('dortmund', 'hummels_12', 'Mats Hummels', 1988, 'Germany', ['CB'], 87, 90, 2016, 20, t(9, 6, 9, 8, 5, 8)),
  q('dortmund', 'schmelzer_12', 'Marcel Schmelzer', 1988, 'Germany', ['LB'], 81, 84, 2016, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 92 }),
  q('dortmund', 'santana_12', 'Felipe Santana', 1986, 'Brazil', ['CB'], 78, 80, 2015, 20, t(8, 5, 8, 8, 5, 7)),
  q('dortmund', 'bender_12', 'Sven Bender', 1989, 'Germany', ['DM', 'CB'], 82, 85, 2016, 25, t(9, 5, 8, 9, 5, 7)),
  q('dortmund', 'gundogan_12', 'İlkay Gündoğan', 1990, 'Germany', ['CM', 'DM'], 84, 89, 2015, 25, t(9, 6, 9, 8, 5, 8)),
  q('dortmund', 'kehl_12', 'Sebastian Kehl', 1980, 'Germany', ['DM', 'CM'], 79, 79, 2014, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 92 }),
  q('dortmund', 'gotze_12', 'Mario Götze', 1992, 'Germany', ['AM', 'ST'], 85, 91, 2016, 25, t(8, 7, 9, 7, 5, 8)),
  q('dortmund', 'reus_12', 'Marco Reus', 1989, 'Germany', ['LW', 'AM'], 86, 90, 2017, 25, t(9, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('dortmund', 'kuba_12', 'Jakub Błaszczykowski', 1985, 'Poland', ['RW'], 82, 84, 2016, 25, t(9, 6, 8, 9, 5, 8)),
  q('dortmund', 'grosskreutz_12', 'Kevin Großkreutz', 1988, 'Germany', ['LW', 'RB'], 79, 82, 2016, 20, t(8, 6, 8, 9, 6, 7)),
  q('dortmund', 'lewandowski_12', 'Robert Lewandowski', 1988, 'Poland', ['ST'], 87, 92, 2014, 15, t(9, 7, 10, 8, 5, 8)),
  q('dortmund', 'schieber', 'Julian Schieber', 1989, 'Germany', ['ST'], 76, 79, 2015, 20, t(8, 6, 8, 8, 5, 7)),
  q('dortmund', 'perisic_12', 'Ivan Perišić', 1989, 'Croatia', ['LW', 'RW'], 79, 85, 2016, 20, t(7, 6, 8, 7, 6, 8)),
];

// ── Bayern München, 2012–13 (Heynckes; the treble juggernaut) ─────────────────
export const BAYERN_2012: CuratedSeed[] = [
  q('bayern', 'neuer_12', 'Manuel Neuer', 1986, 'Germany', ['GK'], 89, 91, 2016, 15, t(10, 6, 9, 9, 4, 8), { loyalty: 92 }),
  q('bayern', 'lahm_12', 'Philipp Lahm', 1983, 'Germany', ['RB', 'DM'], 88, 88, 2016, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 95 }),
  q('bayern', 'boateng_12', 'Jérôme Boateng', 1988, 'Germany', ['CB'], 84, 89, 2017, 20, t(8, 6, 8, 8, 5, 8)),
  q('bayern', 'dante_12', 'Dante', 1983, 'Brazil', ['CB'], 83, 84, 2016, 20, t(8, 6, 8, 8, 5, 8)),
  q('bayern', 'van_buyten_12', 'Daniel Van Buyten', 1978, 'Belgium', ['CB'], 80, 80, 2014, 20, t(8, 5, 8, 8, 5, 7)),
  q('bayern', 'alaba_12', 'David Alaba', 1992, 'Austria', ['LB', 'CM'], 84, 90, 2017, 15, t(9, 6, 9, 9, 5, 8)),
  q('bayern', 'schweinsteiger_12', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'DM'], 87, 88, 2016, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 92 }),
  q('bayern', 'martinez_12', 'Javi Martínez', 1988, 'Spain', ['DM', 'CB'], 84, 88, 2017, 20, t(9, 6, 9, 8, 5, 8)),
  q('bayern', 'kroos_12', 'Toni Kroos', 1990, 'Germany', ['CM', 'AM'], 85, 90, 2015, 15, t(10, 5, 9, 8, 4, 8)),
  q('bayern', 'muller_12', 'Thomas Müller', 1989, 'Germany', ['AM', 'RW', 'ST'], 86, 89, 2016, 15, t(9, 6, 9, 10, 4, 8), { loyalty: 94 }),
  q('bayern', 'robben_12', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 88, 88, 2015, 30, t(8, 7, 9, 8, 5, 8)),
  q('bayern', 'ribery_12', 'Franck Ribéry', 1983, 'France', ['LW', 'AM'], 88, 89, 2015, 30, t(8, 7, 9, 8, 6, 8)),
  q('bayern', 'shaqiri_12', 'Xherdan Shaqiri', 1991, 'Switzerland', ['RW', 'AM'], 80, 85, 2016, 20, t(7, 7, 8, 7, 5, 8)),
  q('bayern', 'gomez_12', 'Mario Gómez', 1985, 'Germany', ['ST'], 84, 85, 2015, 20, t(8, 6, 9, 8, 5, 7)),
  q('bayern', 'mandzukic_12', 'Mario Mandžukić', 1986, 'Croatia', ['ST'], 84, 85, 2016, 20, t(8, 7, 9, 7, 6, 7)),
  q('bayern', 'pizarro_12', 'Claudio Pizarro', 1978, 'Peru', ['ST'], 80, 80, 2014, 20, t(9, 6, 8, 8, 5, 8)),
];

// ── The elite of Europe, 2012–13 — full squads so every real European Cup of the
//    span (2013–2025) is anchored to a side that exists. ───────────────────────
export const BARCELONA_B12: CuratedSeed[] = [
  q('barcelona', 'valdes_bc12', 'Víctor Valdés', 1982, 'Spain', ['GK'], 85, 86, 2014, 15, t(8, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('barcelona', 'alves_bc12', 'Dani Alves', 1983, 'Brazil', ['RB'], 86, 86, 2015, 20, t(8, 7, 9, 8, 5, 8)),
  q('barcelona', 'pique_bc12', 'Gerard Piqué', 1987, 'Spain', ['CB'], 87, 88, 2016, 20, t(8, 7, 8, 9, 5, 8), { loyalty: 90 }),
  q('barcelona', 'puyol_bc12', 'Carles Puyol', 1978, 'Spain', ['CB'], 84, 84, 2014, 20, t(10, 5, 9, 10, 4, 7), { loyalty: 97 }),
  q('barcelona', 'mascherano_bc12', 'Javier Mascherano', 1984, 'Argentina', ['CB', 'DM'], 84, 86, 2016, 20, t(9, 6, 9, 8, 6, 7)),
  q('barcelona', 'alba_bc12', 'Jordi Alba', 1989, 'Spain', ['LB'], 84, 87, 2017, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 88 }),
  q('barcelona', 'busquets_bc12', 'Sergio Busquets', 1988, 'Spain', ['DM'], 87, 89, 2016, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 92 }),
  q('barcelona', 'xavi_bc12', 'Xavi', 1980, 'Spain', ['CM'], 88, 88, 2014, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'iniesta_bc12', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 89, 90, 2016, 20, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'fabregas_bc12', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 85, 87, 2015, 20, t(8, 6, 8, 8, 5, 8)),
  q('barcelona', 'messi_bc12', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 95, 99, 2018, 15, t(10, 6, 10, 10, 3, 8), { loyalty: 95 }),
  q('barcelona', 'villa_bc12', 'David Villa', 1981, 'Spain', ['ST', 'LW'], 84, 85, 2015, 20, t(9, 6, 9, 8, 5, 8)),
  q('barcelona', 'pedro_bc12', 'Pedro', 1987, 'Spain', ['RW', 'ST'], 83, 85, 2016, 20, t(9, 5, 8, 9, 4, 8)),
  q('barcelona', 'sanchez_bc12', 'Alexis Sánchez', 1988, 'Chile', ['RW', 'ST'], 82, 88, 2016, 20, t(8, 6, 9, 7, 6, 8)),
  q('barcelona', 'song_bc12', 'Alex Song', 1987, 'Cameroon', ['DM', 'CB'], 79, 82, 2016, 20, t(7, 6, 8, 7, 6, 8)),
];

export const REAL_MADRID_B12: CuratedSeed[] = [
  q('real_madrid', 'casillas_rm12', 'Iker Casillas', 1981, 'Spain', ['GK'], 88, 88, 2015, 15, t(9, 6, 9, 10, 4, 7), { loyalty: 95 }),
  q('real_madrid', 'ramos_rm12', 'Sergio Ramos', 1986, 'Spain', ['CB', 'RB'], 88, 90, 2016, 20, t(8, 7, 9, 9, 7, 7), { loyalty: 90 }),
  q('real_madrid', 'pepe_rm12', 'Pepe', 1983, 'Portugal', ['CB'], 84, 85, 2015, 25, t(7, 7, 8, 8, 8, 7)),
  q('real_madrid', 'varane_rm12', 'Raphaël Varane', 1993, 'France', ['CB'], 79, 90, 2017, 20, t(9, 6, 9, 8, 4, 8)),
  q('real_madrid', 'marcelo_rm12', 'Marcelo', 1988, 'Brazil', ['LB', 'LW'], 85, 88, 2017, 20, t(8, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('real_madrid', 'arbeloa_rm12', 'Álvaro Arbeloa', 1983, 'Spain', ['RB', 'LB'], 81, 81, 2015, 20, t(9, 5, 8, 9, 5, 8)),
  q('real_madrid', 'alonso_rm12', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 87, 87, 2014, 15, t(10, 5, 9, 8, 4, 8)),
  q('real_madrid', 'khedira_rm12', 'Sami Khedira', 1987, 'Germany', ['DM', 'CM'], 84, 86, 2015, 25, t(9, 6, 9, 8, 5, 8)),
  q('real_madrid', 'modric_rm12', 'Luka Modrić', 1985, 'Croatia', ['CM'], 86, 89, 2016, 15, t(10, 5, 9, 9, 4, 8)),
  q('real_madrid', 'ozil_rm12', 'Mesut Özil', 1988, 'Germany', ['AM'], 86, 89, 2016, 20, t(8, 6, 9, 8, 4, 8)),
  q('real_madrid', 'di_maria_rm12', 'Ángel Di María', 1988, 'Argentina', ['RW', 'LW'], 84, 89, 2016, 20, t(8, 6, 9, 8, 6, 8)),
  q('real_madrid', 'cristiano_rm12', 'Cristiano Ronaldo', 1985, 'Portugal', ['LW', 'ST'], 93, 95, 2015, 15, t(10, 9, 10, 8, 5, 8)),
  q('real_madrid', 'benzema_rm12', 'Karim Benzema', 1987, 'France', ['ST'], 85, 90, 2015, 20, t(8, 7, 9, 8, 5, 8)),
  q('real_madrid', 'higuain_rm12', 'Gonzalo Higuaín', 1987, 'Argentina', ['ST'], 84, 87, 2013, 20, t(8, 6, 9, 8, 5, 8)),
];

export const MANCITY_B12: CuratedSeed[] = [
  q('man_city', 'hart_ci12', 'Joe Hart', 1987, 'England', ['GK'], 85, 87, 2016, 15, t(8, 6, 8, 8, 6, 7)),
  q('man_city', 'kompany_ci12', 'Vincent Kompany', 1986, 'Belgium', ['CB'], 87, 89, 2016, 25, t(9, 7, 9, 9, 5, 7), { loyalty: 90 }),
  q('man_city', 'nastasic', 'Matija Nastasić', 1993, 'Serbia', ['CB'], 78, 85, 2017, 20, t(8, 5, 8, 8, 5, 7)),
  q('man_city', 'zabaleta_ci12', 'Pablo Zabaleta', 1985, 'Argentina', ['RB'], 84, 85, 2016, 20, t(9, 6, 9, 9, 6, 8)),
  q('man_city', 'clichy_ci12', 'Gaël Clichy', 1985, 'France', ['LB'], 81, 82, 2016, 20, t(8, 5, 8, 8, 5, 8)),
  q('man_city', 'kolarov_ci12', 'Aleksandar Kolarov', 1985, 'Serbia', ['LB'], 80, 82, 2016, 20, t(8, 6, 8, 7, 5, 7)),
  q('man_city', 'yaya_ci12', 'Yaya Touré', 1983, 'Ivory Coast', ['CM', 'DM'], 87, 88, 2016, 20, t(7, 8, 9, 8, 6, 8)),
  q('man_city', 'barry_ci12', 'Gareth Barry', 1981, 'England', ['CM', 'DM'], 81, 82, 2015, 20, t(9, 5, 8, 8, 5, 8)),
  q('man_city', 'garcia_ci12', 'Javi García', 1987, 'Spain', ['DM', 'CM'], 80, 82, 2016, 20, t(9, 5, 8, 8, 5, 7)),
  q('man_city', 'silva_ci12', 'David Silva', 1986, 'Spain', ['AM', 'LW'], 87, 89, 2016, 15, t(9, 6, 9, 9, 4, 8)),
  q('man_city', 'nasri_ci12', 'Samir Nasri', 1987, 'France', ['AM', 'LW'], 83, 85, 2016, 20, t(6, 7, 8, 7, 6, 8)),
  q('man_city', 'tevez_ci12', 'Carlos Tévez', 1984, 'Argentina', ['ST', 'AM'], 86, 86, 2015, 20, t(8, 8, 10, 6, 7, 8)),
  q('man_city', 'aguero_ci12', 'Sergio Agüero', 1988, 'Argentina', ['ST'], 89, 92, 2016, 25, t(8, 7, 10, 8, 5, 8)),
  q('man_city', 'dzeko_ci12', 'Edin Džeko', 1986, 'Bosnia', ['ST'], 82, 85, 2016, 20, t(8, 6, 8, 7, 5, 8)),
  q('man_city', 'balotelli_ci12', 'Mario Balotelli', 1990, 'Italy', ['ST'], 80, 88, 2016, 25, t(4, 9, 8, 5, 9, 7)),
];

export const CHELSEA_B12: CuratedSeed[] = [
  q('chelsea', 'cech_ch12', 'Petr Čech', 1982, 'Czechia', ['GK'], 87, 88, 2016, 15, t(9, 6, 8, 9, 4, 7)),
  q('chelsea', 'ivanovic_ch12', 'Branislav Ivanović', 1984, 'Serbia', ['RB', 'CB'], 85, 86, 2016, 20, t(9, 6, 8, 8, 6, 7)),
  q('chelsea', 'terry_ch12', 'John Terry', 1980, 'England', ['CB'], 84, 84, 2015, 20, t(9, 7, 9, 10, 6, 7), { loyalty: 95 }),
  q('chelsea', 'luiz_ch12', 'David Luiz', 1987, 'Brazil', ['CB', 'DM'], 84, 86, 2016, 20, t(7, 7, 8, 7, 6, 8)),
  q('chelsea', 'cole_ch12', 'Ashley Cole', 1980, 'England', ['LB'], 85, 85, 2015, 20, t(8, 7, 9, 8, 6, 7)),
  q('chelsea', 'ramires_ch12', 'Ramires', 1987, 'Brazil', ['CM', 'DM'], 83, 85, 2016, 20, t(9, 6, 8, 7, 5, 8)),
  q('chelsea', 'mikel_ch12', 'John Obi Mikel', 1987, 'Nigeria', ['DM'], 80, 82, 2016, 20, t(8, 5, 8, 8, 5, 7)),
  q('chelsea', 'lampard_ch12', 'Frank Lampard', 1978, 'England', ['CM', 'AM'], 85, 85, 2014, 15, t(10, 6, 9, 9, 4, 7), { loyalty: 92 }),
  q('chelsea', 'mata_ch12', 'Juan Mata', 1988, 'Spain', ['AM', 'LW'], 85, 88, 2016, 20, t(9, 6, 9, 8, 4, 8)),
  q('chelsea', 'hazard_ch12', 'Eden Hazard', 1991, 'Belgium', ['LW', 'AM'], 86, 92, 2017, 20, t(8, 7, 9, 8, 5, 8)),
  q('chelsea', 'oscar_ch12', 'Oscar', 1991, 'Brazil', ['AM', 'CM'], 81, 88, 2017, 20, t(8, 6, 8, 8, 5, 8)),
  q('chelsea', 'torres_ch12', 'Fernando Torres', 1984, 'Spain', ['ST'], 81, 84, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('chelsea', 'ba_ch12', 'Demba Ba', 1985, 'Senegal', ['ST'], 81, 82, 2015, 20, t(7, 6, 8, 7, 5, 7)),
  q('chelsea', 'sturridge_ch12', 'Daniel Sturridge', 1989, 'England', ['ST'], 80, 86, 2016, 30, t(7, 7, 8, 6, 6, 8)),
];

export const LIVERPOOL_B12: CuratedSeed[] = [
  q('liverpool', 'reina_lv12', 'Pepe Reina', 1982, 'Spain', ['GK'], 84, 85, 2016, 15, t(9, 6, 8, 9, 4, 7)),
  q('liverpool', 'agger_lv12', 'Daniel Agger', 1984, 'Denmark', ['CB'], 82, 84, 2016, 30, t(8, 5, 8, 9, 5, 7)),
  q('liverpool', 'skrtel_lv12', 'Martin Škrtel', 1984, 'Slovakia', ['CB'], 82, 84, 2016, 20, t(8, 6, 8, 8, 6, 7)),
  q('liverpool', 'johnson_lv12', 'Glen Johnson', 1984, 'England', ['RB'], 81, 82, 2015, 25, t(7, 6, 8, 7, 5, 7)),
  q('liverpool', 'enrique_lv12', 'José Enrique', 1986, 'Spain', ['LB'], 79, 81, 2016, 20, t(8, 5, 8, 8, 5, 7)),
  q('liverpool', 'gerrard_lv12', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 86, 87, 2015, 20, t(9, 7, 9, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'lucas_lv12', 'Lucas Leiva', 1987, 'Brazil', ['DM', 'CM'], 81, 83, 2016, 25, t(9, 5, 8, 9, 5, 8)),
  q('liverpool', 'allen_lv12', 'Joe Allen', 1990, 'Wales', ['CM', 'DM'], 79, 84, 2017, 20, t(9, 5, 8, 8, 5, 8)),
  q('liverpool', 'henderson_lv12', 'Jordan Henderson', 1990, 'England', ['CM'], 80, 87, 2017, 20, t(10, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('liverpool', 'sterling_lv12', 'Raheem Sterling', 1994, 'England', ['RW', 'LW'], 76, 89, 2016, 20, t(8, 7, 9, 7, 5, 8)),
  q('liverpool', 'suarez_lv12', 'Luis Suárez', 1987, 'Uruguay', ['ST'], 88, 92, 2016, 20, t(8, 8, 10, 8, 8, 8)),
  q('liverpool', 'borini_lv12', 'Fabio Borini', 1991, 'Italy', ['ST', 'LW'], 77, 82, 2016, 25, t(8, 6, 8, 7, 5, 8)),
  q('liverpool', 'downing_lv12', 'Stewart Downing', 1984, 'England', ['LW', 'RW'], 78, 80, 2015, 20, t(8, 5, 8, 8, 5, 8)),
];

export const JUVENTUS_B12: CuratedSeed[] = [
  q('juventus', 'buffon_ju12', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 88, 88, 2015, 20, t(10, 6, 9, 10, 4, 7), { loyalty: 97 }),
  q('juventus', 'barzagli_ju12', 'Andrea Barzagli', 1981, 'Italy', ['CB'], 85, 85, 2015, 20, t(9, 5, 8, 9, 4, 7)),
  q('juventus', 'bonucci_ju12', 'Leonardo Bonucci', 1987, 'Italy', ['CB'], 85, 89, 2016, 20, t(8, 7, 9, 8, 5, 8)),
  q('juventus', 'chiellini_ju12', 'Giorgio Chiellini', 1984, 'Italy', ['CB', 'LB'], 86, 88, 2016, 20, t(9, 6, 9, 10, 5, 7), { loyalty: 95 }),
  q('juventus', 'lichtsteiner_ju12', 'Stephan Lichtsteiner', 1984, 'Switzerland', ['RB'], 82, 83, 2016, 20, t(9, 6, 8, 8, 5, 8)),
  q('juventus', 'asamoah_ju12', 'Kwadwo Asamoah', 1988, 'Ghana', ['LB', 'CM'], 81, 84, 2017, 20, t(9, 5, 8, 8, 5, 8)),
  q('juventus', 'pirlo_ju12', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'CM'], 87, 87, 2015, 20, t(9, 6, 9, 9, 4, 8)),
  q('juventus', 'vidal_ju12', 'Arturo Vidal', 1987, 'Chile', ['CM', 'DM'], 86, 88, 2016, 20, t(7, 8, 9, 7, 7, 8)),
  q('juventus', 'marchisio_ju12', 'Claudio Marchisio', 1986, 'Italy', ['CM', 'DM'], 84, 86, 2016, 20, t(9, 6, 9, 10, 4, 8), { loyalty: 94 }),
  q('juventus', 'pogba_ju12', 'Paul Pogba', 1993, 'France', ['CM', 'DM'], 80, 93, 2016, 20, t(7, 8, 9, 7, 5, 8)),
  q('juventus', 'giovinco_ju12', 'Sebastian Giovinco', 1987, 'Italy', ['AM', 'ST'], 80, 83, 2016, 20, t(8, 6, 8, 7, 5, 8)),
  q('juventus', 'vucinic_ju12', 'Mirko Vučinić', 1983, 'Montenegro', ['ST'], 81, 82, 2015, 25, t(6, 7, 8, 7, 6, 7)),
  q('juventus', 'matri_ju12', 'Alessandro Matri', 1984, 'Italy', ['ST'], 79, 81, 2015, 20, t(8, 6, 8, 7, 5, 7)),
];

export const MANUTD_B12: CuratedSeed[] = [
  q('man_utd', 'de_gea_u12', 'David de Gea', 1990, 'Spain', ['GK'], 84, 92, 2016, 15, t(9, 6, 9, 8, 4, 8)),
  q('man_utd', 'rafael_u12', 'Rafael', 1990, 'Brazil', ['RB'], 80, 84, 2016, 20, t(8, 6, 8, 8, 6, 8)),
  q('man_utd', 'ferdinand_u12', 'Rio Ferdinand', 1978, 'England', ['CB'], 83, 83, 2014, 25, t(8, 6, 8, 8, 4, 7)),
  q('man_utd', 'vidic_u12', 'Nemanja Vidić', 1981, 'Serbia', ['CB'], 85, 85, 2014, 25, t(9, 6, 9, 9, 6, 7), { loyalty: 90 }),
  q('man_utd', 'evra_u12', 'Patrice Evra', 1981, 'France', ['LB'], 83, 83, 2015, 20, t(9, 6, 9, 8, 5, 8)),
  q('man_utd', 'valencia_u12', 'Antonio Valencia', 1985, 'Ecuador', ['RW', 'RB'], 82, 84, 2015, 20, t(9, 5, 8, 9, 5, 8)),
  q('man_utd', 'carrick_u12', 'Michael Carrick', 1981, 'England', ['CM', 'DM'], 84, 85, 2015, 20, t(9, 5, 8, 9, 4, 8)),
  q('man_utd', 'cleverley_u12', 'Tom Cleverley', 1989, 'England', ['CM'], 78, 83, 2016, 20, t(8, 5, 8, 8, 5, 8)),
  q('man_utd', 'kagawa_u12', 'Shinji Kagawa', 1989, 'Japan', ['AM', 'LW'], 82, 86, 2016, 20, t(9, 5, 9, 8, 4, 8)),
  q('man_utd', 'young_u12', 'Ashley Young', 1985, 'England', ['LW', 'RW'], 80, 82, 2015, 20, t(8, 6, 8, 8, 5, 8)),
  q('man_utd', 'nani_u12', 'Nani', 1986, 'Portugal', ['RW', 'LW'], 82, 85, 2015, 20, t(6, 7, 8, 7, 6, 8)),
  q('man_utd', 'rooney_u12', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 88, 89, 2015, 25, t(8, 7, 9, 8, 7, 8)),
  q('man_utd', 'van_persie_u12', 'Robin van Persie', 1983, 'Netherlands', ['ST'], 88, 89, 2016, 25, t(8, 7, 9, 7, 5, 8)),
  q('man_utd', 'hernandez_u12', 'Javier Hernández', 1988, 'Mexico', ['ST'], 80, 84, 2016, 20, t(9, 6, 8, 8, 5, 8)),
];

export const INTER_B12: CuratedSeed[] = [
  q('inter', 'handanovic_in12', 'Samir Handanović', 1984, 'Slovenia', ['GK'], 86, 87, 2017, 15, t(9, 6, 9, 9, 4, 7), { loyalty: 90 }),
  q('inter', 'ranocchia_in12', 'Andrea Ranocchia', 1988, 'Italy', ['CB'], 80, 84, 2016, 20, t(8, 5, 8, 8, 6, 7)),
  q('inter', 'samuel_in12', 'Walter Samuel', 1978, 'Argentina', ['CB'], 82, 82, 2014, 20, t(9, 6, 8, 8, 6, 7)),
  q('inter', 'juan_in12', 'Juan Jesus', 1991, 'Brazil', ['CB', 'LB'], 77, 83, 2017, 20, t(8, 5, 8, 7, 5, 7)),
  q('inter', 'zanetti_in12', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 82, 82, 2014, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 97 }),
  q('inter', 'nagatomo_in12', 'Yuto Nagatomo', 1986, 'Japan', ['LB', 'RB'], 80, 82, 2016, 20, t(9, 5, 8, 8, 5, 8)),
  q('inter', 'cambiasso_in12', 'Esteban Cambiasso', 1980, 'Argentina', ['DM', 'CM'], 83, 83, 2014, 20, t(9, 6, 9, 8, 5, 7)),
  q('inter', 'guarin_in12', 'Fredy Guarín', 1986, 'Colombia', ['CM', 'AM'], 81, 83, 2016, 20, t(6, 7, 8, 7, 6, 7)),
  q('inter', 'kovacic_in12', 'Mateo Kovačić', 1994, 'Croatia', ['CM', 'AM'], 74, 88, 2017, 20, t(9, 6, 9, 8, 4, 8)),
  q('inter', 'palacio_in12', 'Rodrigo Palacio', 1982, 'Argentina', ['ST'], 82, 82, 2015, 20, t(8, 6, 8, 8, 5, 8)),
  q('inter', 'milito_in12', 'Diego Milito', 1979, 'Argentina', ['ST'], 82, 82, 2014, 25, t(8, 7, 9, 8, 5, 7)),
  q('inter', 'cassano_in12', 'Antonio Cassano', 1982, 'Italy', ['AM', 'ST'], 81, 82, 2015, 20, t(4, 9, 7, 6, 9, 6)),
  q('inter', 'icardi_in12', 'Mauro Icardi', 1993, 'Argentina', ['ST'], 76, 88, 2017, 20, t(6, 8, 9, 6, 6, 7)),
];

export const ATLETICO_B12: CuratedSeed[] = [
  q('atletico', 'courtois_at12', 'Thibaut Courtois', 1992, 'Belgium', ['GK'], 84, 92, 2014, 15, t(9, 6, 9, 8, 4, 8)),
  q('atletico', 'godin_at12', 'Diego Godín', 1986, 'Uruguay', ['CB'], 85, 88, 2016, 20, t(9, 6, 9, 9, 6, 7), { loyalty: 90 }),
  q('atletico', 'miranda_at12', 'Miranda', 1984, 'Brazil', ['CB'], 83, 85, 2016, 20, t(9, 5, 8, 8, 5, 7)),
  q('atletico', 'juanfran_at12', 'Juanfran', 1985, 'Spain', ['RB'], 82, 84, 2016, 20, t(9, 5, 8, 9, 5, 7)),
  q('atletico', 'filipe_at12', 'Filipe Luís', 1985, 'Brazil', ['LB'], 83, 85, 2015, 20, t(9, 5, 8, 8, 5, 8)),
  q('atletico', 'gabi_at12', 'Gabi', 1983, 'Spain', ['DM', 'CM'], 82, 84, 2016, 20, t(9, 6, 8, 10, 6, 7), { loyalty: 92 }),
  q('atletico', 'mario_suarez_at12', 'Mario Suárez', 1987, 'Spain', ['DM', 'CM'], 79, 82, 2016, 20, t(8, 6, 8, 8, 6, 7)),
  q('atletico', 'arda_at12', 'Arda Turan', 1987, 'Turkey', ['AM', 'RW'], 83, 85, 2015, 20, t(6, 7, 8, 7, 6, 8)),
  q('atletico', 'koke_at12', 'Koke', 1992, 'Spain', ['CM', 'AM'], 81, 89, 2017, 15, t(9, 6, 9, 10, 5, 8), { loyalty: 92 }),
  q('atletico', 'falcao_at12', 'Radamel Falcao', 1986, 'Colombia', ['ST'], 88, 89, 2015, 20, t(9, 7, 10, 7, 5, 8)),
  q('atletico', 'adrian_at12', 'Adrián López', 1987, 'Spain', ['ST'], 79, 81, 2015, 20, t(8, 6, 8, 7, 5, 7)),
];

export const PSG_B12: CuratedSeed[] = [
  q('psg', 'sirigu_pg12', 'Salvatore Sirigu', 1987, 'Italy', ['GK'], 82, 84, 2016, 15, t(8, 6, 8, 8, 5, 7)),
  q('psg', 'thiago_silva_pg12', 'Thiago Silva', 1984, 'Brazil', ['CB'], 88, 88, 2016, 20, t(9, 6, 9, 8, 5, 8), { loyalty: 88 }),
  q('psg', 'alex_pg12', 'Alex', 1982, 'Brazil', ['CB'], 82, 82, 2015, 20, t(8, 6, 8, 8, 5, 7)),
  q('psg', 'maxwell_pg12', 'Maxwell', 1981, 'Brazil', ['LB'], 82, 82, 2015, 20, t(9, 5, 8, 8, 4, 8)),
  q('psg', 'verratti_pg12', 'Marco Verratti', 1992, 'Italy', ['CM', 'DM'], 80, 90, 2017, 20, t(8, 7, 9, 8, 6, 8)),
  q('psg', 'matuidi_pg12', 'Blaise Matuidi', 1987, 'France', ['CM', 'DM'], 83, 85, 2016, 15, t(9, 6, 9, 8, 5, 8)),
  q('psg', 'motta_pg12', 'Thiago Motta', 1982, 'Italy', ['DM', 'CM'], 82, 82, 2015, 25, t(8, 6, 8, 7, 6, 8)),
  q('psg', 'pastore_pg12', 'Javier Pastore', 1989, 'Argentina', ['AM'], 83, 86, 2016, 25, t(6, 7, 8, 7, 5, 8)),
  q('psg', 'lavezzi_pg12', 'Ezequiel Lavezzi', 1985, 'Argentina', ['LW', 'ST'], 82, 83, 2016, 20, t(7, 6, 8, 7, 6, 8)),
  q('psg', 'ibrahimovic_pg12', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 89, 89, 2015, 20, t(8, 9, 9, 7, 6, 8)),
  q('psg', 'menez', 'Jérémy Ménez', 1987, 'France', ['AM', 'RW'], 80, 83, 2015, 20, t(6, 7, 8, 6, 6, 8)),
];

/** The full Dortmund-2012 curated universe: the peak Klopp Dortmund and Heynckes's
 *  treble Bayern, plus full elite-of-Europe squads so every real European Cup of
 *  2013-2025 is anchored, with a light (reused) Bundesliga context. */
export const DORTMUND_2012_SQUADS: Record<string, CuratedSeed[]> = {
  dortmund: DORTMUND_2012,
  bayern: BAYERN_2012,
  barcelona: BARCELONA_B12,
  real_madrid: REAL_MADRID_B12,
  man_city: MANCITY_B12,
  chelsea: CHELSEA_B12,
  liverpool: LIVERPOOL_B12,
  juventus: JUVENTUS_B12,
  man_utd: MANUTD_B12,
  inter: INTER_B12,
  atletico: ATLETICO_B12,
  psg: PSG_B12,
  // Reused 2010-11 context squads — drop the players who had moved on by 2012 (and
  // are curated at their new clubs above), so nobody is rostered at two clubs.
  schalke: SCHALKE_2010.filter((p) => p.name !== 'Manuel Neuer'),
  werder: WERDER_2010.filter((p) => p.name !== 'Claudio Pizarro'),
  leverkusen: LEVERKUSEN_2010.filter((p) => p.name !== 'Arturo Vidal'),
  wolfsburg: WOLFSBURG_2010.filter((p) => p.name !== 'Edin Džeko'),
};
