/**
 * Curated real players — 2010 Bundesliga "Klopp vs the Throne" pack (Germany).
 *
 * The vertical slice for BOTH German starts, which share this world as direct
 * rivals in the 2010-11 season:
 *  • "Borussia Dortmund — 2010: Klopp's Rising" — a brilliant young side (Hummels,
 *    Götze, Kagawa, Şahin, a new Lewandowski) about to win back-to-back titles and
 *    reach the 2013 final, then face the real test: holding the golden generation
 *    as Bayern, Barça and the Premier League come raiding.
 *  • "Bayern München — 2010: Defend the Throne" — van Gaal's double winners
 *    (Robben, Ribéry, Schweinsteiger, Müller), champions of Germany and beaten
 *    Champions League finalists, now facing an insurgency from the yellow wall.
 *
 * Around them the elite of Europe — Mourinho's first Madrid, Guardiola's Barça,
 * the treble-winning Inter — whose real European Cups (2011-2025) are anchored.
 * Ability/potential/personality are HIDDEN designer estimates (§7); clubs, birth
 * years, positions and contracts are real.
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

// ── Borussia Dortmund, 2010–11 (Klopp; the young champions rising) ────────────
export const DORTMUND_2010: CuratedSeed[] = [
  q('dortmund', 'weidenfeller_2010', 'Roman Weidenfeller', 1980, 'Germany', ['GK'], 82, 84, 2016, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 92 }),
  q('dortmund', 'langerak', 'Mitchell Langerak', 1988, 'Australia', ['GK'], 74, 78, 2015, 20, t(8, 5, 7, 8, 5, 7)),
  q('dortmund', 'piszczek_2010', 'Łukasz Piszczek', 1985, 'Poland', ['RB'], 82, 85, 2016, 20, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('dortmund', 'subotic_2010', 'Neven Subotić', 1988, 'Serbia', ['CB'], 82, 86, 2016, 20, t(9, 6, 8, 9, 5, 7)),
  q('dortmund', 'hummels_2010', 'Mats Hummels', 1988, 'Germany', ['CB'], 84, 90, 2015, 20, t(9, 6, 9, 8, 5, 8)),
  q('dortmund', 'schmelzer_2010', 'Marcel Schmelzer', 1988, 'Germany', ['LB'], 80, 84, 2016, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 92 }),
  q('dortmund', 'bender_2010', 'Sven Bender', 1989, 'Germany', ['DM', 'CB'], 81, 85, 2016, 25, t(9, 5, 8, 9, 5, 7)),
  q('dortmund', 'sahin_2010', 'Nuri Şahin', 1988, 'Turkey', ['CM', 'DM'], 84, 87, 2013, 25, t(8, 6, 9, 8, 5, 8)),
  q('dortmund', 'gundogan_2010', 'İlkay Gündoğan', 1990, 'Germany', ['CM', 'DM'], 78, 89, 2015, 25, t(9, 6, 9, 8, 5, 8)),
  q('dortmund', 'kagawa_2010', 'Shinji Kagawa', 1989, 'Japan', ['AM', 'LW'], 82, 87, 2014, 20, t(9, 5, 9, 8, 4, 8)),
  q('dortmund', 'grosskreutz', 'Kevin Großkreutz', 1988, 'Germany', ['LW', 'RB'], 78, 82, 2016, 20, t(8, 6, 8, 9, 6, 7)),
  q('dortmund', 'kuba_2010', 'Jakub Błaszczykowski', 1985, 'Poland', ['RW'], 81, 84, 2016, 25, t(9, 6, 8, 9, 5, 8)),
  q('dortmund', 'gotze_2010', 'Mario Götze', 1992, 'Germany', ['AM', 'ST'], 80, 91, 2014, 25, t(8, 7, 9, 7, 5, 8)),
  q('dortmund', 'barrios_2010', 'Lucas Barrios', 1984, 'Paraguay', ['ST'], 81, 83, 2014, 25, t(8, 6, 8, 7, 5, 7)),
  q('dortmund', 'lewandowski_2010', 'Robert Lewandowski', 1988, 'Poland', ['ST'], 81, 92, 2014, 15, t(9, 7, 10, 8, 5, 8)),
];

// ── Bayern München, 2010–11 (van Gaal; the double winners defending) ──────────
export const BAYERN_2010: CuratedSeed[] = [
  q('bayern', 'kraft_2010', 'Thomas Kraft', 1988, 'Germany', ['GK'], 78, 82, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('bayern', 'butt_2010', 'Hans-Jörg Butt', 1974, 'Germany', ['GK'], 79, 79, 2012, 20, t(8, 6, 7, 8, 5, 6)),
  q('bayern', 'lahm_2010', 'Philipp Lahm', 1983, 'Germany', ['RB', 'LB'], 87, 88, 2016, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 95 }),
  q('bayern', 'van_buyten_2010', 'Daniel Van Buyten', 1978, 'Belgium', ['CB'], 82, 82, 2014, 20, t(8, 5, 8, 8, 5, 7)),
  q('bayern', 'badstuber_2010', 'Holger Badstuber', 1989, 'Germany', ['CB', 'LB'], 80, 86, 2015, 25, t(9, 5, 8, 9, 5, 7)),
  q('bayern', 'contento', 'Diego Contento', 1990, 'Germany', ['LB'], 74, 79, 2014, 20, t(8, 5, 7, 8, 5, 7)),
  q('bayern', 'rafinha_2010', 'Rafinha', 1985, 'Brazil', ['RB'], 80, 82, 2015, 20, t(8, 5, 8, 8, 5, 8)),
  q('bayern', 'schweinsteiger_2010', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'DM'], 86, 88, 2016, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 92 }),
  q('bayern', 'van_bommel_2010', 'Mark van Bommel', 1977, 'Netherlands', ['DM', 'CM'], 83, 83, 2012, 20, t(8, 7, 8, 7, 6, 7)),
  q('bayern', 'kroos_2010', 'Toni Kroos', 1990, 'Germany', ['CM', 'AM'], 80, 90, 2015, 15, t(10, 5, 9, 8, 4, 8)),
  q('bayern', 'muller_2010', 'Thomas Müller', 1989, 'Germany', ['AM', 'RW', 'ST'], 84, 88, 2016, 15, t(9, 6, 9, 10, 4, 8), { loyalty: 94 }),
  q('bayern', 'robben_2010', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 88, 89, 2013, 30, t(8, 7, 9, 8, 5, 8)),
  q('bayern', 'ribery_2010', 'Franck Ribéry', 1983, 'France', ['LW', 'AM'], 87, 88, 2015, 30, t(8, 7, 9, 8, 6, 8)),
  q('bayern', 'pranjic', 'Danijel Pranjić', 1981, 'Croatia', ['LB', 'LW'], 77, 78, 2012, 20, t(8, 5, 7, 7, 5, 7)),
  q('bayern', 'alaba_2010', 'David Alaba', 1992, 'Austria', ['LB', 'CM'], 74, 89, 2015, 15, t(9, 6, 9, 9, 5, 8)),
  q('bayern', 'gomez_2010', 'Mario Gómez', 1985, 'Germany', ['ST'], 84, 86, 2015, 20, t(8, 6, 9, 8, 5, 7)),
  q('bayern', 'klose_2010', 'Miroslav Klose', 1978, 'Germany', ['ST'], 82, 82, 2011, 20, t(9, 5, 8, 8, 4, 7)),
  q('bayern', 'olic', 'Ivica Olić', 1979, 'Croatia', ['ST', 'LW'], 80, 81, 2012, 20, t(9, 6, 8, 8, 5, 8)),
];

// ── The elite of Europe, 2010–11 — full squads so every real European Cup of the
//    span (2011–2025) is anchored to a side that exists. ───────────────────────
export const BARCELONA_B10: CuratedSeed[] = [
  q('barcelona', 'valdes_bc10', 'Víctor Valdés', 1982, 'Spain', ['GK'], 86, 87, 2014, 15, t(8, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('barcelona', 'alves_bc10', 'Dani Alves', 1983, 'Brazil', ['RB'], 86, 87, 2015, 20, t(8, 7, 9, 8, 5, 8)),
  q('barcelona', 'pique_bc10', 'Gerard Piqué', 1987, 'Spain', ['CB'], 87, 89, 2015, 20, t(8, 7, 8, 9, 5, 8), { loyalty: 90 }),
  q('barcelona', 'puyol_bc10', 'Carles Puyol', 1978, 'Spain', ['CB'], 86, 86, 2013, 20, t(10, 5, 9, 10, 4, 7), { loyalty: 97 }),
  q('barcelona', 'abidal_bc10', 'Éric Abidal', 1979, 'France', ['LB', 'CB'], 84, 84, 2013, 20, t(9, 5, 8, 8, 4, 8)),
  q('barcelona', 'busquets_bc10', 'Sergio Busquets', 1988, 'Spain', ['DM'], 86, 89, 2015, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 92 }),
  q('barcelona', 'xavi_bc10', 'Xavi', 1980, 'Spain', ['CM'], 90, 90, 2014, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'iniesta_bc10', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 89, 90, 2015, 20, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'mascherano_bc10', 'Javier Mascherano', 1984, 'Argentina', ['DM', 'CB'], 84, 86, 2015, 20, t(9, 6, 9, 8, 6, 7)),
  q('barcelona', 'messi_bc10', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 93, 99, 2016, 15, t(10, 6, 10, 10, 3, 8), { loyalty: 95 }),
  q('barcelona', 'villa_bc10', 'David Villa', 1981, 'Spain', ['ST', 'LW'], 87, 88, 2014, 20, t(9, 6, 9, 8, 5, 8)),
  q('barcelona', 'pedro_bc10', 'Pedro', 1987, 'Spain', ['RW', 'ST'], 83, 85, 2015, 20, t(9, 5, 8, 9, 4, 8)),
  q('barcelona', 'afellay', 'Ibrahim Afellay', 1986, 'Netherlands', ['AM', 'LW'], 80, 83, 2015, 25, t(8, 6, 8, 7, 5, 8)),
  q('barcelona', 'keita_bc10', 'Seydou Keita', 1980, 'Mali', ['CM', 'DM'], 82, 82, 2013, 20, t(9, 5, 8, 8, 5, 8)),
  // Thiago Alcântara — seeded young (18, breaking into the first team) for his real
  // 2013 Barcelona→Bayern move, Guardiola's first signing at his new club.
  q('barcelona', 'thiago_bc10', 'Thiago Alcântara', 1991, 'Spain', ['CM', 'AM'], 72, 88, 2015, 15, t(9, 6, 9, 8, 5, 9)),
];

export const REAL_MADRID_B10: CuratedSeed[] = [
  q('real_madrid', 'casillas_rm10', 'Iker Casillas', 1981, 'Spain', ['GK'], 89, 90, 2015, 15, t(9, 6, 9, 10, 4, 7), { loyalty: 95 }),
  q('real_madrid', 'ramos_rm10', 'Sergio Ramos', 1986, 'Spain', ['CB', 'RB'], 87, 90, 2015, 20, t(8, 7, 9, 9, 7, 7), { loyalty: 90 }),
  q('real_madrid', 'pepe_rm10', 'Pepe', 1983, 'Portugal', ['CB'], 84, 85, 2014, 25, t(7, 7, 8, 8, 8, 7)),
  q('real_madrid', 'carvalho_rm10', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 84, 84, 2013, 20, t(8, 6, 8, 8, 5, 7)),
  q('real_madrid', 'marcelo_rm10', 'Marcelo', 1988, 'Brazil', ['LB', 'LW'], 84, 88, 2015, 20, t(8, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('real_madrid', 'arbeloa_rm10', 'Álvaro Arbeloa', 1983, 'Spain', ['RB', 'LB'], 81, 82, 2014, 20, t(9, 5, 8, 9, 5, 8)),
  q('real_madrid', 'alonso_rm10', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 87, 88, 2014, 15, t(10, 5, 9, 8, 4, 8)),
  q('real_madrid', 'khedira_rm10', 'Sami Khedira', 1987, 'Germany', ['DM', 'CM'], 82, 86, 2015, 25, t(9, 6, 9, 8, 5, 8)),
  q('real_madrid', 'ozil_rm10', 'Mesut Özil', 1988, 'Germany', ['AM'], 85, 89, 2015, 20, t(8, 6, 9, 8, 4, 8)),
  q('real_madrid', 'di_maria_rm10', 'Ángel Di María', 1988, 'Argentina', ['RW', 'LW'], 83, 89, 2015, 20, t(8, 6, 9, 8, 6, 8)),
  q('real_madrid', 'cristiano_rm10', 'Cristiano Ronaldo', 1985, 'Portugal', ['LW', 'ST'], 92, 95, 2015, 15, t(10, 9, 10, 8, 5, 8)),
  q('real_madrid', 'benzema_rm10', 'Karim Benzema', 1987, 'France', ['ST'], 84, 90, 2015, 20, t(8, 7, 9, 8, 5, 8)),
  q('real_madrid', 'higuain_rm10', 'Gonzalo Higuaín', 1987, 'Argentina', ['ST'], 84, 87, 2013, 20, t(8, 6, 9, 8, 5, 8)),
  q('real_madrid', 'kaka_rm10', 'Kaká', 1982, 'Brazil', ['AM'], 84, 86, 2014, 25, t(9, 6, 9, 8, 4, 8)),
];

export const MANUTD_B10: CuratedSeed[] = [
  q('man_utd', 'van_der_sar_u10', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 85, 85, 2011, 15, t(9, 6, 8, 8, 4, 7)),
  q('man_utd', 'ferdinand_u10', 'Rio Ferdinand', 1978, 'England', ['CB'], 85, 85, 2013, 25, t(8, 6, 8, 8, 4, 7)),
  q('man_utd', 'vidic_u10', 'Nemanja Vidić', 1981, 'Serbia', ['CB'], 87, 88, 2014, 20, t(9, 6, 9, 9, 6, 7), { loyalty: 90 }),
  q('man_utd', 'evra_u10', 'Patrice Evra', 1981, 'France', ['LB'], 84, 85, 2014, 20, t(9, 6, 9, 8, 5, 8)),
  q('man_utd', 'oshea_u10', 'John O’Shea', 1981, 'Ireland', ['CB', 'RB'], 78, 79, 2013, 20, t(8, 5, 7, 9, 4, 7)),
  q('man_utd', 'fletcher_u10', 'Darren Fletcher', 1984, 'Scotland', ['CM'], 82, 83, 2014, 25, t(9, 5, 8, 9, 5, 7)),
  q('man_utd', 'carrick_u10', 'Michael Carrick', 1981, 'England', ['CM', 'DM'], 84, 85, 2014, 20, t(9, 5, 8, 9, 4, 8)),
  q('man_utd', 'giggs_u10', 'Ryan Giggs', 1973, 'Wales', ['LW', 'CM'], 83, 83, 2012, 20, t(9, 6, 9, 10, 4, 8), { loyalty: 97 }),
  q('man_utd', 'nani_u10', 'Nani', 1986, 'Portugal', ['RW', 'LW'], 83, 86, 2015, 20, t(6, 7, 8, 7, 6, 8)),
  q('man_utd', 'valencia_u10', 'Antonio Valencia', 1985, 'Ecuador', ['RW', 'RB'], 82, 85, 2015, 20, t(9, 5, 8, 9, 5, 8)),
  q('man_utd', 'park_u10', 'Park Ji-sung', 1981, 'South Korea', ['LW', 'CM'], 81, 82, 2013, 20, t(10, 5, 9, 9, 4, 8)),
  q('man_utd', 'rooney_u10', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 89, 90, 2015, 25, t(8, 7, 9, 8, 7, 8)),
  q('man_utd', 'berbatov_u10', 'Dimitar Berbatov', 1981, 'Bulgaria', ['ST'], 84, 85, 2013, 20, t(7, 7, 8, 7, 5, 8)),
  q('man_utd', 'hernandez_u10', 'Javier Hernández', 1988, 'Mexico', ['ST'], 80, 85, 2015, 20, t(9, 6, 8, 8, 5, 8)),
];

export const CHELSEA_B10: CuratedSeed[] = [
  q('chelsea', 'cech_ch10', 'Petr Čech', 1982, 'Czechia', ['GK'], 88, 89, 2015, 15, t(9, 6, 8, 9, 4, 7)),
  q('chelsea', 'terry_ch10', 'John Terry', 1980, 'England', ['CB'], 86, 86, 2015, 20, t(9, 7, 9, 10, 6, 7), { loyalty: 95 }),
  q('chelsea', 'ivanovic_ch10', 'Branislav Ivanović', 1984, 'Serbia', ['RB', 'CB'], 84, 86, 2015, 20, t(9, 6, 8, 8, 6, 7)),
  q('chelsea', 'a_cole_ch10', 'Ashley Cole', 1980, 'England', ['LB'], 86, 86, 2014, 20, t(8, 7, 9, 8, 6, 7)),
  q('chelsea', 'bosingwa', 'José Bosingwa', 1982, 'Portugal', ['RB'], 80, 81, 2013, 20, t(7, 6, 8, 7, 5, 8)),
  q('chelsea', 'ramires_ch10', 'Ramires', 1987, 'Brazil', ['CM', 'DM'], 82, 85, 2015, 20, t(9, 6, 8, 7, 5, 8)),
  q('chelsea', 'essien_ch10', 'Michael Essien', 1982, 'Ghana', ['DM', 'CM'], 85, 86, 2014, 25, t(9, 6, 9, 8, 6, 7)),
  q('chelsea', 'lampard_ch10', 'Frank Lampard', 1978, 'England', ['CM', 'AM'], 87, 87, 2014, 15, t(10, 6, 9, 9, 4, 7), { loyalty: 92 }),
  q('chelsea', 'mikel_ch10', 'John Obi Mikel', 1987, 'Nigeria', ['DM'], 80, 83, 2014, 20, t(8, 5, 8, 8, 5, 7)),
  q('chelsea', 'malouda_ch10', 'Florent Malouda', 1980, 'France', ['LW', 'AM'], 83, 84, 2014, 20, t(8, 6, 8, 7, 5, 8)),
  q('chelsea', 'anelka_ch10', 'Nicolas Anelka', 1979, 'France', ['ST'], 83, 83, 2012, 20, t(7, 7, 8, 6, 6, 7)),
  q('chelsea', 'drogba_ch10', 'Didier Drogba', 1978, 'Ivory Coast', ['ST'], 87, 88, 2014, 25, t(8, 7, 9, 8, 6, 7)),
  q('chelsea', 'kalou_ch10', 'Salomon Kalou', 1985, 'Ivory Coast', ['LW', 'ST'], 79, 82, 2014, 20, t(7, 6, 8, 7, 5, 7)),
  q('chelsea', 'sturridge_ch10', 'Daniel Sturridge', 1989, 'England', ['ST'], 78, 85, 2015, 30, t(7, 7, 8, 6, 6, 8)),
];

export const MANCITY_B10: CuratedSeed[] = [
  q('man_city', 'hart_ci10', 'Joe Hart', 1987, 'England', ['GK'], 84, 87, 2015, 15, t(8, 6, 8, 8, 6, 7)),
  q('man_city', 'kompany_ci10', 'Vincent Kompany', 1986, 'Belgium', ['CB'], 86, 89, 2015, 25, t(9, 7, 9, 9, 5, 7), { loyalty: 90 }),
  q('man_city', 'kolo_ci10', 'Kolo Touré', 1981, 'Ivory Coast', ['CB'], 82, 82, 2014, 20, t(8, 6, 8, 8, 5, 7)),
  q('man_city', 'lescott_ci10', 'Joleon Lescott', 1982, 'England', ['CB'], 82, 83, 2014, 20, t(8, 6, 8, 8, 5, 7)),
  q('man_city', 'zabaleta_ci10', 'Pablo Zabaleta', 1985, 'Argentina', ['RB'], 82, 85, 2015, 20, t(9, 6, 9, 9, 6, 8)),
  q('man_city', 'kolarov_ci10', 'Aleksandar Kolarov', 1985, 'Serbia', ['LB'], 80, 83, 2015, 20, t(8, 6, 8, 7, 5, 7)),
  q('man_city', 'yaya_ci10', 'Yaya Touré', 1983, 'Ivory Coast', ['CM', 'DM'], 86, 88, 2015, 20, t(7, 8, 9, 8, 6, 8)),
  q('man_city', 'barry_ci10', 'Gareth Barry', 1981, 'England', ['CM', 'DM'], 82, 83, 2014, 20, t(9, 5, 8, 8, 5, 8)),
  q('man_city', 'de_jong_ci10', 'Nigel de Jong', 1984, 'Netherlands', ['DM'], 81, 82, 2014, 20, t(8, 6, 8, 7, 6, 8)),
  q('man_city', 'silva_ci10', 'David Silva', 1986, 'Spain', ['AM', 'LW'], 86, 89, 2015, 15, t(9, 6, 9, 9, 4, 8)),
  q('man_city', 'tevez_ci10', 'Carlos Tévez', 1984, 'Argentina', ['ST', 'AM'], 87, 87, 2014, 20, t(8, 8, 10, 6, 7, 8)),
  q('man_city', 'balotelli_ci10', 'Mario Balotelli', 1990, 'Italy', ['ST'], 80, 88, 2015, 25, t(4, 9, 8, 5, 9, 7)),
  q('man_city', 'adebayor_ci10', 'Emmanuel Adebayor', 1984, 'Togo', ['ST'], 81, 83, 2014, 20, t(6, 7, 8, 6, 6, 7)),
  q('man_city', 'dzeko_ci10', 'Edin Džeko', 1986, 'Bosnia', ['ST'], 82, 85, 2015, 20, t(8, 6, 8, 7, 5, 8)),
];

export const LIVERPOOL_B10: CuratedSeed[] = [
  q('liverpool', 'reina_lv10', 'Pepe Reina', 1982, 'Spain', ['GK'], 85, 86, 2016, 15, t(9, 6, 8, 9, 4, 7)),
  q('liverpool', 'carragher_lv10', 'Jamie Carragher', 1978, 'England', ['CB'], 82, 82, 2013, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'agger_lv10', 'Daniel Agger', 1984, 'Denmark', ['CB'], 82, 85, 2015, 30, t(8, 5, 8, 9, 5, 7)),
  q('liverpool', 'skrtel_lv10', 'Martin Škrtel', 1984, 'Slovakia', ['CB'], 81, 84, 2015, 20, t(8, 6, 8, 8, 6, 7)),
  q('liverpool', 'johnson_lv10', 'Glen Johnson', 1984, 'England', ['RB'], 81, 82, 2015, 25, t(7, 6, 8, 7, 5, 7)),
  q('liverpool', 'gerrard_lv10', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 87, 88, 2015, 20, t(9, 7, 9, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'lucas_lv10', 'Lucas Leiva', 1987, 'Brazil', ['DM', 'CM'], 81, 84, 2015, 20, t(9, 5, 8, 9, 5, 8)),
  q('liverpool', 'meireles_lv10', 'Raul Meireles', 1983, 'Portugal', ['CM', 'AM'], 82, 83, 2014, 20, t(8, 6, 8, 8, 5, 8)),
  q('liverpool', 'kuyt_lv10', 'Dirk Kuyt', 1980, 'Netherlands', ['RW', 'ST'], 81, 82, 2014, 20, t(9, 5, 8, 9, 4, 7)),
  q('liverpool', 'maxi_lv10', 'Maxi Rodríguez', 1981, 'Argentina', ['RW', 'AM'], 80, 81, 2013, 20, t(8, 6, 8, 7, 5, 8)),
  q('liverpool', 'ngog', 'David N’Gog', 1989, 'France', ['ST'], 76, 81, 2014, 20, t(7, 6, 8, 7, 5, 7)),
  q('liverpool', 'suarez_lv10', 'Luis Suárez', 1987, 'Uruguay', ['ST'], 85, 91, 2016, 20, t(8, 8, 10, 8, 8, 8)),
  q('liverpool', 'carroll_lv10', 'Andy Carroll', 1989, 'England', ['ST'], 78, 84, 2016, 30, t(5, 7, 7, 6, 7, 7)),
  q('liverpool', 'torres_lv10', 'Fernando Torres', 1984, 'Spain', ['ST'], 86, 89, 2014, 30, t(8, 6, 9, 7, 5, 8)),
  // Real 2010-11 depth to the era minimum (Jones deputising for Reina; the
  // full-back cover and the summer's midfield/attacking additions).
  q('liverpool', 'bjones_lv10', 'Brad Jones', 1982, 'Australia', ['GK'], 72, 73, 2013, 25, t(8, 4, 7, 7, 5, 7)),
  q('liverpool', 'aurelio_lv10', 'Fábio Aurélio', 1979, 'Brazil', ['LB'], 78, 79, 2012, 45, t(8, 4, 7, 7, 4, 7)),
  q('liverpool', 'konchesky_lv10', 'Paul Konchesky', 1981, 'England', ['LB'], 74, 75, 2014, 25, t(7, 5, 7, 6, 5, 7)),
  q('liverpool', 'kyrgiakos_lv10', 'Sotirios Kyrgiakos', 1979, 'Greece', ['CB'], 76, 77, 2012, 30, t(7, 6, 7, 7, 6, 6)),
  q('liverpool', 'poulsen_lv10', 'Christian Poulsen', 1980, 'Denmark', ['DM'], 76, 77, 2013, 30, t(7, 5, 7, 6, 5, 7)),
  q('liverpool', 'joecole_lv10', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 78, 80, 2014, 30, t(6, 6, 7, 6, 5, 7)),
];

export const INTER_B10: CuratedSeed[] = [
  q('inter', 'julio_cesar_in10', 'Júlio César', 1979, 'Brazil', ['GK'], 87, 87, 2014, 15, t(9, 6, 8, 8, 4, 7)),
  q('inter', 'maicon_in10', 'Maicon', 1981, 'Brazil', ['RB'], 86, 86, 2014, 20, t(8, 6, 8, 7, 5, 7)),
  q('inter', 'lucio_in10', 'Lúcio', 1978, 'Brazil', ['CB'], 85, 85, 2013, 20, t(8, 6, 8, 7, 5, 7)),
  q('inter', 'samuel_in10', 'Walter Samuel', 1978, 'Argentina', ['CB'], 84, 84, 2013, 20, t(9, 6, 8, 8, 6, 7)),
  q('inter', 'zanetti_in10', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 84, 84, 2013, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 97 }),
  q('inter', 'chivu_in10', 'Cristian Chivu', 1980, 'Romania', ['CB', 'LB'], 80, 81, 2013, 25, t(8, 5, 8, 7, 5, 7)),
  q('inter', 'cambiasso_in10', 'Esteban Cambiasso', 1980, 'Argentina', ['DM', 'CM'], 85, 86, 2014, 20, t(9, 6, 9, 8, 5, 7)),
  q('inter', 'sneijder_in10', 'Wesley Sneijder', 1984, 'Netherlands', ['AM', 'CM'], 87, 88, 2015, 20, t(7, 7, 9, 7, 6, 8)),
  q('inter', 'stankovic_in10', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 82, 82, 2013, 25, t(8, 6, 8, 8, 5, 7)),
  q('inter', 'eto_in10', 'Samuel Eto’o', 1981, 'Cameroon', ['ST', 'RW'], 88, 89, 2014, 20, t(7, 8, 9, 6, 6, 7)),
  q('inter', 'milito_in10', 'Diego Milito', 1979, 'Argentina', ['ST'], 85, 86, 2014, 20, t(8, 7, 9, 8, 5, 7)),
  q('inter', 'pandev_in10', 'Goran Pandev', 1983, 'North Macedonia', ['AM', 'ST'], 81, 82, 2014, 20, t(8, 6, 8, 7, 5, 7)),
  q('inter', 'coutinho_in10', 'Philippe Coutinho', 1992, 'Brazil', ['AM', 'LW'], 72, 90, 2015, 20, t(8, 6, 9, 8, 5, 8)),
];

export const JUVENTUS_B10: CuratedSeed[] = [
  q('juventus', 'buffon_ju10', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 88, 88, 2015, 20, t(10, 6, 9, 10, 4, 7), { loyalty: 97 }),
  q('juventus', 'chiellini_ju10', 'Giorgio Chiellini', 1984, 'Italy', ['CB', 'LB'], 85, 88, 2015, 20, t(9, 6, 9, 10, 5, 7), { loyalty: 95 }),
  q('juventus', 'bonucci_ju10', 'Leonardo Bonucci', 1987, 'Italy', ['CB'], 81, 89, 2015, 20, t(8, 7, 9, 8, 5, 8)),
  q('juventus', 'barzagli_ju10', 'Andrea Barzagli', 1981, 'Italy', ['CB'], 82, 85, 2014, 20, t(9, 5, 8, 9, 4, 7)),
  q('juventus', 'motta_ju10', 'Marco Motta', 1986, 'Italy', ['RB'], 76, 79, 2014, 20, t(8, 5, 7, 8, 5, 7)),
  q('juventus', 'marchisio_ju10', 'Claudio Marchisio', 1986, 'Italy', ['CM', 'DM'], 82, 86, 2015, 20, t(9, 6, 9, 10, 4, 8), { loyalty: 94 }),
  q('juventus', 'aquilani_ju10', 'Alberto Aquilani', 1984, 'Italy', ['CM', 'AM'], 81, 83, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('juventus', 'krasic_ju10', 'Miloš Krasić', 1984, 'Serbia', ['RW'], 81, 83, 2014, 20, t(7, 6, 8, 7, 5, 8)),
  q('juventus', 'pepe_ju10', 'Simone Pepe', 1983, 'Italy', ['LW', 'RW'], 77, 79, 2014, 20, t(9, 5, 8, 8, 5, 8), { loyalty: 85 }),
  q('juventus', 'del_piero_ju10', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 82, 82, 2012, 25, t(9, 6, 9, 10, 4, 7), { loyalty: 99, hardBlocks: [{ reason: 'Del Piero, il capitano, is Juventus for life.', untilYear: 2099 }] }),
  q('juventus', 'iaquinta_ju10', 'Vincenzo Iaquinta', 1979, 'Italy', ['ST'], 79, 80, 2013, 25, t(8, 5, 8, 7, 5, 7)),
  q('juventus', 'matri_ju10', 'Alessandro Matri', 1984, 'Italy', ['ST'], 79, 82, 2015, 20, t(8, 6, 8, 7, 5, 7)),
  q('juventus', 'quagliarella_ju10', 'Fabio Quagliarella', 1983, 'Italy', ['ST', 'AM'], 81, 82, 2014, 20, t(8, 6, 8, 7, 5, 7)),
];

// ── Bundesliga rivals (real, lighter) ─────────────────────────────────────────
export const SCHALKE_2010: CuratedSeed[] = [
  q('schalke', 'neuer_sc10', 'Manuel Neuer', 1986, 'Germany', ['GK'], 87, 91, 2012, 15, t(10, 6, 9, 8, 4, 8)),
  q('schalke', 'raul_sc10', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 83, 83, 2012, 20, t(9, 6, 9, 9, 4, 8)),
  q('schalke', 'huntelaar_sc10', 'Klaas-Jan Huntelaar', 1983, 'Netherlands', ['ST'], 83, 85, 2015, 20, t(8, 6, 9, 8, 5, 8)),
  q('schalke', 'howedes', 'Benedikt Höwedes', 1988, 'Germany', ['CB'], 80, 84, 2015, 20, t(9, 5, 8, 9, 5, 7)),
  q('schalke', 'metzelder', 'Christoph Metzelder', 1980, 'Germany', ['CB'], 79, 79, 2013, 25, t(8, 5, 8, 8, 5, 7)),
  q('schalke', 'jurado', 'José Manuel Jurado', 1986, 'Spain', ['AM', 'RW'], 78, 81, 2014, 20, t(7, 6, 8, 7, 5, 8)),
  q('schalke', 'draxler_sc10', 'Julian Draxler', 1993, 'Germany', ['AM', 'LW'], 70, 87, 2015, 20, t(8, 6, 9, 8, 5, 8)),
];
export const WERDER_2010: CuratedSeed[] = [
  q('werder', 'wiese', 'Tim Wiese', 1981, 'Germany', ['GK'], 81, 82, 2014, 20, t(7, 6, 8, 8, 6, 7)),
  q('werder', 'pizarro_we10', 'Claudio Pizarro', 1978, 'Peru', ['ST'], 82, 82, 2012, 20, t(8, 6, 8, 8, 5, 8)),
  q('werder', 'marin_we10', 'Marko Marin', 1989, 'Germany', ['AM', 'LW'], 79, 84, 2014, 20, t(7, 6, 8, 7, 5, 8)),
  q('werder', 'almeida_we10', 'Hugo Almeida', 1984, 'Portugal', ['ST'], 79, 80, 2013, 20, t(8, 6, 8, 7, 5, 7)),
  q('werder', 'frings_we10', 'Torsten Frings', 1976, 'Germany', ['DM', 'CM'], 81, 81, 2011, 20, t(8, 6, 8, 8, 5, 7)),
  q('werder', 'mertesacker_we10', 'Per Mertesacker', 1984, 'Germany', ['CB'], 82, 84, 2014, 20, t(9, 5, 8, 8, 4, 7)),
  q('werder', 'hunt', 'Aaron Hunt', 1986, 'Germany', ['AM', 'LW'], 78, 81, 2014, 20, t(8, 5, 8, 8, 5, 8)),
];
export const LEVERKUSEN_2010: CuratedSeed[] = [
  q('leverkusen', 'leno_lv', 'Bernd Leno', 1992, 'Germany', ['GK'], 74, 86, 2015, 15, t(9, 5, 8, 8, 5, 7)),
  q('leverkusen', 'kiessling', 'Stefan Kießling', 1984, 'Germany', ['ST'], 82, 84, 2015, 20, t(9, 6, 8, 9, 5, 7)),
  q('leverkusen', 'sam', 'Sidney Sam', 1988, 'Germany', ['RW', 'AM'], 79, 82, 2014, 20, t(8, 6, 8, 7, 5, 8)),
  q('leverkusen', 'castro', 'Gonzalo Castro', 1987, 'Germany', ['RB', 'CM'], 80, 82, 2015, 20, t(9, 5, 8, 8, 5, 8)),
  q('leverkusen', 'rolfes', 'Simon Rolfes', 1982, 'Germany', ['DM', 'CM'], 81, 82, 2014, 20, t(9, 5, 8, 9, 5, 7)),
  q('leverkusen', 'vidal_lv', 'Arturo Vidal', 1987, 'Chile', ['CM', 'DM'], 82, 88, 2014, 20, t(7, 8, 9, 7, 7, 8)),
  q('leverkusen', 'derdiyok', 'Eren Derdiyok', 1988, 'Switzerland', ['ST'], 77, 80, 2013, 20, t(7, 6, 8, 7, 5, 7)),
];
export const WOLFSBURG_2010: CuratedSeed[] = [
  q('wolfsburg', 'benaglio', 'Diego Benaglio', 1983, 'Switzerland', ['GK'], 81, 82, 2014, 20, t(8, 5, 8, 8, 5, 7)),
  q('wolfsburg', 'grafite', 'Grafite', 1979, 'Brazil', ['ST'], 82, 82, 2012, 20, t(7, 7, 8, 7, 6, 7)),
  q('wolfsburg', 'dzeko_wo10', 'Edin Džeko', 1986, 'Bosnia', ['ST'], 83, 86, 2013, 20, t(8, 6, 9, 7, 5, 8)),
  q('wolfsburg', 'diego_wo10', 'Diego', 1985, 'Brazil', ['AM'], 83, 85, 2014, 20, t(6, 7, 8, 7, 6, 8)),
  q('wolfsburg', 'josue', 'Josué', 1979, 'Brazil', ['DM', 'CM'], 79, 80, 2012, 20, t(8, 6, 8, 7, 6, 7)),
  q('wolfsburg', 'riether', 'Sascha Riether', 1983, 'Germany', ['RB'], 77, 78, 2013, 20, t(8, 5, 7, 8, 5, 7)),
];
export const HAMBURG_2010: CuratedSeed[] = [
  q('hamburg', 'rost', 'Frank Rost', 1973, 'Germany', ['GK'], 78, 78, 2011, 20, t(8, 5, 7, 8, 5, 6)),
  q('hamburg', 'petric', 'Mladen Petrić', 1981, 'Croatia', ['ST'], 80, 81, 2012, 20, t(8, 6, 8, 7, 5, 7)),
  q('hamburg', 'van_nistelrooy_ha10', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 80, 80, 2011, 25, t(9, 7, 9, 7, 4, 7)),
  q('hamburg', 'ze_roberto_ha10', 'Zé Roberto', 1974, 'Brazil', ['CM', 'LW'], 81, 81, 2011, 20, t(9, 5, 8, 7, 4, 8)),
  q('hamburg', 'jarolim', 'David Jarolím', 1979, 'Czechia', ['CM'], 78, 79, 2012, 20, t(8, 5, 7, 8, 5, 7)),
  q('hamburg', 'elia', 'Eljero Elia', 1987, 'Netherlands', ['LW', 'RW'], 78, 82, 2013, 20, t(6, 7, 8, 6, 6, 8)),
];

/** The full Bundesliga-2010 curated universe (shared by the Dortmund and Bayern
 *  starts): the two German rivals + full elite-of-Europe squads so every real
 *  European Cup of 2011-2025 is anchored, plus a light Bundesliga context. */
export const BUNDESLIGA_2010_SQUADS: Record<string, CuratedSeed[]> = {
  dortmund: DORTMUND_2010,
  bayern: BAYERN_2010,
  barcelona: BARCELONA_B10,
  real_madrid: REAL_MADRID_B10,
  man_utd: MANUTD_B10,
  chelsea: CHELSEA_B10,
  man_city: MANCITY_B10,
  liverpool: LIVERPOOL_B10,
  inter: INTER_B10,
  juventus: JUVENTUS_B10,
  schalke: SCHALKE_2010,
  werder: WERDER_2010,
  leverkusen: LEVERKUSEN_2010,
  wolfsburg: WOLFSBURG_2010,
  hamburg: HAMBURG_2010,
};
