/**
 * Curated real players — 2008 Premier League "The Takeover" pack (England).
 *
 * The vertical slice for "Manchester City — 2008: The Takeover". In September 2008
 * the Abu Dhabi United Group buy City and everything changes: a mid-table club with
 * Richard Dunne and Stephen Ireland is suddenly the richest in the world, and
 * Robinho arrives on deadline day as a statement. Reality: years of expensive
 * mistakes, then Tévez, Yaya Touré, Silva and the 2012 title — the birth of a
 * superclub. Build it faster, or waste the billions.
 *
 * Around City, the peak of the English game: Ferguson's champions with a
 * twenty-three-year-old Ronaldo, the Gerrard–Torres Liverpool, Wenger's young
 * Arsenal, Chelsea's Drogba-and-Lampard core — whose real European Cups (2009-2025)
 * are anchored, alongside the continental giants. Ability/potential/personality are
 * HIDDEN designer estimates (§7); clubs, birth years, positions and contracts are
 * real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { EUROPE_2008_SQUADS } from './curated-europe-2008.js';
import { ENG_DOMESTIC_2008_SQUADS } from './curated-eng-domestic-2008.js';

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

// ── Manchester City, 2008–09 (the takeover; a mid-table club made rich overnight) ─
export const MANCITY_2008: CuratedSeed[] = [
  q('man_city', 'given_c8', 'Shay Given', 1976, 'Ireland', ['GK'], 83, 83, 2012, 20, t(9, 5, 8, 8, 5, 7)),
  // Real 2008–09 Man City (pre-takeover Mark Hughes side): the full-back pairing.
  q('man_city', 'benhaim08', 'Tal Ben Haim', 1982, 'Israel', ['CB'], 73, 75, 2011, 28, t(7, 6, 7, 6, 6, 6)),
  q('man_city', 'garrido08', 'Javier Garrido', 1985, 'Spain', ['LB'], 72, 76, 2012, 25, t(7, 5, 7, 7, 5, 7)),
  q('man_city', 'hart_c8', 'Joe Hart', 1987, 'England', ['GK'], 76, 87, 2013, 15, t(8, 6, 8, 8, 5, 7)),
  q('man_city', 'richards_c8', 'Micah Richards', 1988, 'England', ['RB', 'CB'], 79, 85, 2013, 25, t(7, 6, 8, 8, 6, 7)),
  q('man_city', 'dunne_c8', 'Richard Dunne', 1979, 'Ireland', ['CB'], 80, 80, 2011, 25, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('man_city', 'onuoha', 'Nedum Onuoha', 1986, 'England', ['CB', 'RB'], 76, 80, 2012, 20, t(8, 5, 7, 8, 5, 7)),
  q('man_city', 'bridge_c8', 'Wayne Bridge', 1980, 'England', ['LB'], 79, 80, 2012, 25, t(8, 5, 7, 8, 5, 7)),
  q('man_city', 'zabaleta_c8', 'Pablo Zabaleta', 1985, 'Argentina', ['RB', 'LB'], 79, 85, 2013, 20, t(9, 6, 9, 9, 6, 8)),
  q('man_city', 'ireland_c8', 'Stephen Ireland', 1986, 'Ireland', ['AM', 'CM'], 80, 84, 2013, 25, t(6, 7, 8, 6, 6, 7)),
  q('man_city', 'kompany_c8', 'Vincent Kompany', 1986, 'Belgium', ['CB', 'DM'], 80, 89, 2013, 25, t(9, 7, 9, 9, 5, 7), { loyalty: 88 }),
  q('man_city', 'de_jong_c8', 'Nigel de Jong', 1984, 'Netherlands', ['DM'], 80, 83, 2013, 20, t(8, 6, 8, 7, 6, 8)),
  q('man_city', 'petrov_c8', 'Martin Petrov', 1979, 'Bulgaria', ['LW'], 78, 79, 2011, 25, t(7, 6, 8, 7, 5, 7)),
  q('man_city', 'wright_phillips', 'Shaun Wright-Phillips', 1981, 'England', ['RW'], 79, 81, 2012, 20, t(7, 6, 8, 8, 5, 7)),
  q('man_city', 'robinho_c8', 'Robinho', 1984, 'Brazil', ['LW', 'ST'], 84, 86, 2013, 25, t(5, 8, 8, 5, 6, 7)),
  // Real 2008–09 Man City: the £19m CSKA Moscow striker who led the line beside Robinho.
  q('man_city', 'jo_c8', 'Jô', 1987, 'Brazil', ['ST'], 74, 80, 2012, 25, t(6, 6, 7, 6, 6, 6)),
  q('man_city', 'caicedo', 'Felipe Caicedo', 1988, 'Ecuador', ['ST'], 74, 80, 2013, 20, t(6, 6, 8, 7, 6, 7)),
  q('man_city', 'sturridge_c8', 'Daniel Sturridge', 1989, 'England', ['ST'], 74, 86, 2012, 25, t(6, 7, 8, 6, 6, 8)),
  // Real 2008-09 depth to the era minimum (Elano's creativity, Ćorluka's defensive
  // cover, Benjani up front — the pre-splurge takeover squad).
  q('man_city', 'elano_c8', 'Elano', 1981, 'Brazil', ['AM', 'RW'], 80, 82, 2011, 25, t(7, 6, 7, 6, 5, 7)),
  q('man_city', 'corluka_c8', 'Vedran Ćorluka', 1986, 'Croatia', ['CB', 'RB'], 78, 82, 2012, 25, t(8, 5, 7, 7, 5, 7)),
  q('man_city', 'benjani_c8', 'Benjani', 1978, 'Zimbabwe', ['ST'], 75, 76, 2011, 30, t(7, 5, 7, 7, 5, 6)),
];

// ── Manchester United, 2008–09 (Ferguson; champions of England and Europe) ────
export const MANUTD_2008: CuratedSeed[] = [
  q('man_utd', 'van_der_sar_u8', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 86, 86, 2011, 15, t(9, 6, 8, 8, 4, 7)),
  q('man_utd', 'ferdinand_u8', 'Rio Ferdinand', 1978, 'England', ['CB'], 87, 88, 2013, 20, t(8, 6, 8, 8, 4, 7)),
  q('man_utd', 'vidic_u8', 'Nemanja Vidić', 1981, 'Serbia', ['CB'], 87, 88, 2012, 20, t(9, 6, 9, 9, 6, 7), { loyalty: 90 }),
  q('man_utd', 'evra_u8', 'Patrice Evra', 1981, 'France', ['LB'], 85, 86, 2013, 20, t(9, 6, 9, 8, 5, 8)),
  q('man_utd', 'brown_u8', 'Wes Brown', 1979, 'England', ['CB', 'RB'], 80, 80, 2012, 25, t(8, 5, 7, 9, 4, 7)),
  q('man_utd', 'oshea_u8', 'John O’Shea', 1981, 'Ireland', ['RB', 'CB'], 79, 80, 2013, 20, t(8, 5, 7, 9, 4, 7)),
  q('man_utd', 'carrick_u8', 'Michael Carrick', 1981, 'England', ['CM', 'DM'], 84, 85, 2013, 20, t(9, 5, 8, 9, 4, 8)),
  q('man_utd', 'anderson_u8', 'Anderson', 1988, 'Brazil', ['CM', 'AM'], 78, 85, 2013, 25, t(6, 6, 7, 7, 6, 7)),
  q('man_utd', 'fletcher_u8', 'Darren Fletcher', 1984, 'Scotland', ['CM'], 81, 84, 2013, 20, t(9, 5, 8, 9, 4, 7)),
  q('man_utd', 'giggs_u8', 'Ryan Giggs', 1973, 'Wales', ['LW', 'CM'], 84, 84, 2011, 20, t(9, 6, 9, 10, 4, 8), { loyalty: 97 }),
  q('man_utd', 'park_u8', 'Park Ji-sung', 1981, 'South Korea', ['LW', 'CM'], 81, 82, 2012, 20, t(10, 5, 9, 9, 4, 8)),
  q('man_utd', 'nani_u8', 'Nani', 1986, 'Portugal', ['RW', 'LW'], 80, 86, 2013, 20, t(6, 7, 8, 7, 6, 8)),
  q('man_utd', 'cristiano_u8', 'Cristiano Ronaldo', 1985, 'Portugal', ['RW', 'LW', 'ST'], 92, 95, 2012, 15, t(10, 9, 10, 7, 4, 8)),
  q('man_utd', 'rooney_u8', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 87, 91, 2012, 25, t(8, 7, 9, 8, 7, 8)),
  q('man_utd', 'berbatov_u8', 'Dimitar Berbatov', 1981, 'Bulgaria', ['ST'], 84, 85, 2013, 20, t(7, 7, 8, 7, 5, 8)),
  q('man_utd', 'tevez_u8', 'Carlos Tévez', 1984, 'Argentina', ['ST', 'AM'], 85, 87, 2009, 20, t(8, 8, 10, 6, 6, 8)),
];

// ── Liverpool, 2008–09 (Benítez; Gerrard and Torres at their peak) ────────────
export const LIVERPOOL_2008: CuratedSeed[] = [
  q('liverpool', 'reina_l8', 'Pepe Reina', 1982, 'Spain', ['GK'], 85, 87, 2013, 15, t(9, 6, 8, 9, 4, 7)),
  q('liverpool', 'carragher_l8', 'Jamie Carragher', 1978, 'England', ['CB'], 84, 84, 2013, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'agger_l8', 'Daniel Agger', 1984, 'Denmark', ['CB'], 81, 85, 2014, 30, t(8, 5, 8, 9, 5, 7)),
  q('liverpool', 'skrtel_l8', 'Martin Škrtel', 1984, 'Slovakia', ['CB'], 80, 84, 2013, 20, t(8, 6, 8, 8, 6, 7)),
  q('liverpool', 'arbeloa_l8', 'Álvaro Arbeloa', 1983, 'Spain', ['RB', 'LB'], 80, 82, 2012, 20, t(9, 5, 8, 8, 5, 8)),
  q('liverpool', 'aurelio', 'Fábio Aurélio', 1979, 'Brazil', ['LB'], 79, 80, 2011, 30, t(8, 5, 7, 8, 5, 8)),
  q('liverpool', 'gerrard_l8', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 89, 90, 2013, 20, t(9, 7, 9, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'alonso_l8', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 86, 88, 2012, 20, t(9, 5, 8, 8, 4, 8)),
  q('liverpool', 'mascherano_l8', 'Javier Mascherano', 1984, 'Argentina', ['DM', 'CM'], 84, 86, 2013, 20, t(9, 6, 9, 8, 6, 7)),
  q('liverpool', 'kuyt_l8', 'Dirk Kuyt', 1980, 'Netherlands', ['RW', 'ST'], 81, 82, 2013, 20, t(9, 5, 8, 9, 4, 7)),
  q('liverpool', 'benayoun_l8', 'Yossi Benayoun', 1980, 'Israel', ['AM', 'RW'], 80, 82, 2012, 20, t(8, 6, 8, 7, 5, 8)),
  q('liverpool', 'riera_l8', 'Albert Riera', 1982, 'Spain', ['LW'], 78, 80, 2012, 20, t(7, 6, 8, 7, 5, 7)),
  q('liverpool', 'torres_l8', 'Fernando Torres', 1984, 'Spain', ['ST'], 88, 91, 2013, 30, t(8, 6, 9, 8, 5, 8)),
  q('liverpool', 'ngog_l8', 'David N’Gog', 1989, 'France', ['ST'], 74, 80, 2013, 20, t(7, 6, 8, 7, 5, 7)),
];

// ── Chelsea, 2008–09 (the Drogba–Lampard–Terry core; Scolari then Hiddink) ─────
export const CHELSEA_2008: CuratedSeed[] = [
  q('chelsea', 'cech_c8', 'Petr Čech', 1982, 'Czechia', ['GK'], 87, 88, 2013, 15, t(9, 6, 8, 9, 4, 7)),
  q('chelsea', 'terry_c8', 'John Terry', 1980, 'England', ['CB'], 87, 87, 2013, 20, t(9, 7, 9, 10, 6, 7), { loyalty: 95 }),
  q('chelsea', 'carvalho_c8', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 85, 85, 2012, 20, t(8, 6, 8, 8, 5, 7)),
  q('chelsea', 'a_cole_c8', 'Ashley Cole', 1980, 'England', ['LB'], 86, 87, 2013, 20, t(8, 7, 9, 8, 6, 7)),
  q('chelsea', 'bosingwa_c8', 'José Bosingwa', 1982, 'Portugal', ['RB'], 81, 83, 2013, 20, t(7, 6, 8, 7, 5, 8)),
  q('chelsea', 'ivanovic_c8', 'Branislav Ivanović', 1984, 'Serbia', ['RB', 'CB'], 80, 86, 2013, 20, t(9, 6, 8, 8, 6, 7)),
  q('chelsea', 'essien_c8', 'Michael Essien', 1982, 'Ghana', ['DM', 'CM'], 86, 87, 2013, 25, t(9, 6, 9, 8, 6, 7)),
  q('chelsea', 'lampard_c8', 'Frank Lampard', 1978, 'England', ['CM', 'AM'], 88, 88, 2013, 15, t(10, 6, 9, 9, 4, 7), { loyalty: 92 }),
  q('chelsea', 'mikel_c8', 'John Obi Mikel', 1987, 'Nigeria', ['DM'], 79, 83, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('chelsea', 'deco_c8', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 84, 84, 2011, 20, t(7, 6, 8, 7, 5, 8)),
  q('chelsea', 'malouda_c8', 'Florent Malouda', 1980, 'France', ['LW', 'AM'], 82, 84, 2013, 20, t(8, 6, 8, 7, 5, 8)),
  q('chelsea', 'j_cole_c8', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 82, 84, 2012, 25, t(7, 6, 8, 8, 5, 8)),
  q('chelsea', 'drogba_c8', 'Didier Drogba', 1978, 'Ivory Coast', ['ST'], 87, 88, 2012, 25, t(8, 7, 9, 8, 6, 7)),
  q('chelsea', 'anelka_c8', 'Nicolas Anelka', 1979, 'France', ['ST'], 84, 85, 2012, 20, t(7, 7, 8, 6, 6, 7)),
];

// ── Arsenal, 2008–09 (Wenger's young project) ─────────────────────────────────
export const ARSENAL_2008: CuratedSeed[] = [
  q('arsenal', 'almunia', 'Manuel Almunia', 1977, 'Spain', ['GK'], 80, 81, 2012, 20, t(8, 5, 7, 8, 5, 7)),
  q('arsenal', 'sagna_a8', 'Bacary Sagna', 1983, 'France', ['RB'], 83, 85, 2013, 20, t(9, 5, 8, 8, 5, 8)),
  q('arsenal', 'gallas_a8', 'William Gallas', 1977, 'France', ['CB'], 83, 83, 2011, 20, t(8, 7, 8, 6, 6, 7)),
  q('arsenal', 'toure_a8', 'Kolo Touré', 1981, 'Ivory Coast', ['CB'], 82, 83, 2012, 20, t(8, 6, 8, 8, 5, 7)),
  q('arsenal', 'clichy_a8', 'Gaël Clichy', 1985, 'France', ['LB'], 82, 84, 2013, 20, t(8, 5, 8, 8, 5, 8)),
  q('arsenal', 'song_a8', 'Alex Song', 1987, 'Cameroon', ['DM', 'CB'], 78, 84, 2013, 20, t(7, 6, 8, 7, 6, 8)),
  q('arsenal', 'fabregas_a8', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 86, 90, 2014, 20, t(9, 6, 9, 8, 5, 8)),
  q('arsenal', 'denilson_a8', 'Denílson', 1988, 'Brazil', ['DM', 'CM'], 76, 82, 2014, 20, t(8, 5, 8, 7, 5, 8)),
  q('arsenal', 'nasri_a8', 'Samir Nasri', 1987, 'France', ['AM', 'LW'], 82, 87, 2013, 20, t(6, 7, 8, 6, 6, 8)),
  q('arsenal', 'walcott_a8', 'Theo Walcott', 1989, 'England', ['RW'], 79, 86, 2013, 25, t(8, 6, 8, 8, 5, 8)),
  q('arsenal', 'arshavin', 'Andrey Arshavin', 1981, 'Russia', ['AM', 'LW'], 84, 85, 2013, 20, t(6, 7, 8, 6, 6, 7)),
  q('arsenal', 'van_persie_a8', 'Robin van Persie', 1983, 'Netherlands', ['ST', 'LW'], 85, 89, 2013, 30, t(7, 7, 9, 7, 6, 8)),
  q('arsenal', 'adebayor_a8', 'Emmanuel Adebayor', 1984, 'Togo', ['ST'], 82, 84, 2012, 20, t(6, 7, 8, 6, 6, 7)),
  q('arsenal', 'bendtner', 'Nicklas Bendtner', 1988, 'Denmark', ['ST'], 75, 82, 2013, 20, t(5, 8, 8, 6, 6, 7)),
];

// ── The continental elite, 2008–09 — full squads so every real European Cup of the
//    span (2009–2025) is anchored to a side that exists. ───────────────────────
export const BARCELONA_E8: CuratedSeed[] = [
  q('barcelona', 'valdes_e8', 'Víctor Valdés', 1982, 'Spain', ['GK'], 85, 86, 2013, 15, t(8, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('barcelona', 'alves_e8', 'Dani Alves', 1983, 'Brazil', ['RB'], 85, 87, 2013, 20, t(8, 7, 9, 8, 5, 8)),
  q('barcelona', 'pique_e8', 'Gerard Piqué', 1987, 'Spain', ['CB'], 83, 89, 2014, 20, t(8, 7, 8, 9, 5, 8), { loyalty: 90 }),
  q('barcelona', 'puyol_e8', 'Carles Puyol', 1978, 'Spain', ['CB'], 86, 86, 2013, 20, t(10, 5, 9, 10, 4, 7), { loyalty: 97 }),
  q('barcelona', 'abidal_e8', 'Éric Abidal', 1979, 'France', ['LB', 'CB'], 83, 84, 2013, 20, t(9, 5, 8, 8, 4, 8)),
  q('barcelona', 'busquets_e8', 'Sergio Busquets', 1988, 'Spain', ['DM'], 78, 89, 2015, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 92 }),
  q('barcelona', 'xavi_e8', 'Xavi', 1980, 'Spain', ['CM'], 89, 90, 2014, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'iniesta_e8', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 87, 90, 2014, 20, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'keita_e8', 'Seydou Keita', 1980, 'Mali', ['CM', 'DM'], 81, 82, 2012, 20, t(9, 5, 8, 8, 5, 8)),
  q('barcelona', 'messi_e8', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 90, 99, 2016, 15, t(10, 6, 10, 10, 3, 8), { loyalty: 95 }),
  q('barcelona', 'etoo_e8', 'Samuel Eto’o', 1981, 'Cameroon', ['ST'], 88, 88, 2012, 20, t(7, 8, 9, 6, 6, 7)),
  q('barcelona', 'henry_e8', 'Thierry Henry', 1977, 'France', ['LW', 'ST'], 84, 85, 2012, 20, t(9, 7, 9, 7, 4, 8)),
  q('barcelona', 'bojan_e8', 'Bojan Krkić', 1990, 'Spain', ['ST', 'RW'], 74, 84, 2014, 20, t(8, 6, 8, 8, 5, 7)),
];

export const REAL_MADRID_E8: CuratedSeed[] = [
  q('real_madrid', 'casillas_e8', 'Iker Casillas', 1981, 'Spain', ['GK'], 88, 90, 2014, 15, t(9, 6, 9, 10, 4, 7), { loyalty: 95 }),
  q('real_madrid', 'ramos_e8', 'Sergio Ramos', 1986, 'Spain', ['RB', 'CB'], 85, 91, 2014, 20, t(8, 7, 9, 9, 7, 7)),
  q('real_madrid', 'pepe_e8', 'Pepe', 1983, 'Portugal', ['CB'], 83, 85, 2013, 25, t(7, 7, 8, 8, 8, 7)),
  q('real_madrid', 'cannavaro_e8', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 84, 84, 2010, 20, t(9, 6, 9, 8, 5, 7)),
  q('real_madrid', 'heinze_e8', 'Gabriel Heinze', 1978, 'Argentina', ['LB', 'CB'], 81, 81, 2011, 20, t(8, 6, 8, 7, 7, 7)),
  q('real_madrid', 'marcelo_e8', 'Marcelo', 1988, 'Brazil', ['LB', 'LW'], 80, 88, 2014, 20, t(8, 6, 9, 9, 5, 8), { loyalty: 90 }),
  q('real_madrid', 'gago_e8', 'Fernando Gago', 1986, 'Argentina', ['DM', 'CM'], 80, 85, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('real_madrid', 'diarra_e8', 'Lassana Diarra', 1985, 'France', ['DM', 'CM'], 82, 85, 2013, 20, t(8, 6, 8, 7, 6, 7)),
  q('real_madrid', 'sneijder_e8', 'Wesley Sneijder', 1984, 'Netherlands', ['AM', 'CM'], 85, 87, 2013, 20, t(7, 7, 8, 6, 6, 8)),
  q('real_madrid', 'robben_e8', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 85, 88, 2012, 30, t(8, 7, 9, 7, 5, 7)),
  q('real_madrid', 'guti_e8', 'Guti', 1976, 'Spain', ['AM'], 81, 81, 2010, 20, t(6, 7, 7, 8, 6, 7)),
  q('real_madrid', 'raul_e8', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 84, 84, 2010, 20, t(9, 6, 9, 10, 4, 7), { loyalty: 96 }),
  q('real_madrid', 'higuain_e8', 'Gonzalo Higuaín', 1987, 'Argentina', ['ST'], 82, 88, 2013, 20, t(8, 6, 9, 8, 5, 8)),
  q('real_madrid', 'van_nistelrooy_e8', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 84, 84, 2010, 25, t(9, 7, 9, 7, 4, 7)),
];

export const BAYERN_E8: CuratedSeed[] = [
  q('bayern', 'butt_e8', 'Hans-Jörg Butt', 1974, 'Germany', ['GK'], 80, 80, 2011, 20, t(8, 6, 7, 8, 5, 6)),
  q('bayern', 'lahm_e8', 'Philipp Lahm', 1983, 'Germany', ['RB', 'LB'], 85, 88, 2013, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 95 }),
  q('bayern', 'van_buyten_e8', 'Daniel Van Buyten', 1978, 'Belgium', ['CB'], 82, 82, 2012, 20, t(8, 5, 8, 8, 5, 7)),
  q('bayern', 'demichelis_e8', 'Martín Demichelis', 1980, 'Argentina', ['CB'], 81, 82, 2011, 20, t(8, 6, 8, 7, 6, 7)),
  q('bayern', 'lucio_e8', 'Lúcio', 1978, 'Brazil', ['CB'], 84, 84, 2010, 20, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'schweinsteiger_e8', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'RW'], 84, 88, 2013, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 92 }),
  q('bayern', 'van_bommel_e8', 'Mark van Bommel', 1977, 'Netherlands', ['DM', 'CM'], 83, 83, 2011, 20, t(8, 7, 8, 7, 6, 7)),
  q('bayern', 'ze_roberto_e8', 'Zé Roberto', 1974, 'Brazil', ['CM', 'LW'], 82, 82, 2010, 20, t(9, 5, 8, 7, 4, 8)),
  q('bayern', 'ribery_e8', 'Franck Ribéry', 1983, 'France', ['LW', 'AM'], 86, 88, 2013, 30, t(8, 7, 9, 8, 6, 8)),
  q('bayern', 'toni_e8', 'Luca Toni', 1977, 'Italy', ['ST'], 83, 83, 2011, 20, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'klose_e8', 'Miroslav Klose', 1978, 'Germany', ['ST'], 82, 82, 2011, 20, t(9, 5, 8, 8, 4, 7)),
  q('bayern', 'podolski_e8', 'Lukas Podolski', 1985, 'Germany', ['ST', 'LW'], 81, 84, 2012, 20, t(7, 6, 8, 8, 5, 7)),
  q('bayern', 'altintop_e8', 'Hamit Altıntop', 1982, 'Turkey', ['RW', 'CM'], 79, 81, 2011, 20, t(8, 5, 8, 7, 5, 7)),
];

export const INTER_E8: CuratedSeed[] = [
  q('inter', 'julio_cesar_e8', 'Júlio César', 1979, 'Brazil', ['GK'], 87, 87, 2013, 15, t(9, 6, 8, 8, 4, 7)),
  q('inter', 'maicon_e8', 'Maicon', 1981, 'Brazil', ['RB'], 86, 86, 2013, 20, t(8, 6, 8, 7, 5, 7)),
  q('inter', 'lucio_e8', 'Lúcio', 1978, 'Brazil', ['CB'], 85, 85, 2012, 20, t(8, 6, 8, 7, 5, 7)),
  q('inter', 'samuel_e8', 'Walter Samuel', 1978, 'Argentina', ['CB'], 84, 84, 2012, 20, t(9, 6, 8, 8, 6, 7)),
  q('inter', 'zanetti_e8', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 85, 85, 2012, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 97 }),
  q('inter', 'cambiasso_e8', 'Esteban Cambiasso', 1980, 'Argentina', ['DM', 'CM'], 85, 86, 2013, 20, t(9, 6, 9, 8, 5, 7)),
  q('inter', 'sneijder_e8', 'Wesley Sneijder', 1984, 'Netherlands', ['AM', 'CM'], 86, 88, 2014, 20, t(7, 7, 9, 7, 6, 8)),
  q('inter', 'stankovic_e8', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 82, 82, 2012, 25, t(8, 6, 8, 8, 5, 7)),
  q('inter', 'muntari', 'Sulley Muntari', 1984, 'Ghana', ['CM', 'DM'], 80, 82, 2013, 20, t(7, 6, 8, 7, 6, 8)),
  q('inter', 'ibrahimovic_e8', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 88, 89, 2013, 20, t(6, 9, 9, 6, 6, 8)),
  q('inter', 'milito_e8', 'Diego Milito', 1979, 'Argentina', ['ST'], 84, 86, 2014, 20, t(8, 7, 9, 8, 5, 7)),
  q('inter', 'balotelli_e8', 'Mario Balotelli', 1990, 'Italy', ['ST'], 76, 88, 2013, 20, t(4, 9, 8, 5, 9, 6)),
  q('inter', 'pandev_e8', 'Goran Pandev', 1983, 'North Macedonia', ['AM', 'ST'], 80, 82, 2013, 20, t(8, 6, 8, 7, 5, 7)),
];

export const JUVENTUS_E8: CuratedSeed[] = [
  q('juventus', 'buffon_e8', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 88, 88, 2013, 20, t(10, 6, 9, 10, 4, 7), { loyalty: 97 }),
  q('juventus', 'chiellini_e8', 'Giorgio Chiellini', 1984, 'Italy', ['CB', 'LB'], 84, 88, 2013, 20, t(9, 6, 9, 10, 5, 7), { loyalty: 95 }),
  q('juventus', 'legrottaglie_e8', 'Nicola Legrottaglie', 1976, 'Italy', ['CB'], 79, 80, 2011, 20, t(8, 5, 7, 8, 5, 6)),
  q('juventus', 'grygera_e8', 'Zdeněk Grygera', 1980, 'Czechia', ['RB', 'CB'], 78, 79, 2012, 20, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'molinaro_e8', 'Cristian Molinaro', 1983, 'Italy', ['LB'], 76, 78, 2012, 20, t(7, 5, 7, 8, 5, 7)),
  q('juventus', 'sissoko_e8', 'Momo Sissoko', 1985, 'Mali', ['DM', 'CM'], 79, 82, 2013, 20, t(8, 5, 8, 7, 5, 7)),
  q('juventus', 'marchisio_e8', 'Claudio Marchisio', 1986, 'Italy', ['CM', 'DM'], 80, 86, 2014, 20, t(9, 6, 9, 10, 4, 8), { loyalty: 92 }),
  q('juventus', 'nedved_e8', 'Pavel Nedvěd', 1972, 'Czechia', ['AM', 'LW'], 83, 83, 2010, 20, t(10, 6, 9, 8, 4, 8)),
  q('juventus', 'camoranesi_e8', 'Mauro Camoranesi', 1976, 'Italy', ['RW'], 80, 80, 2011, 20, t(8, 6, 8, 7, 6, 7)),
  q('juventus', 'del_piero_e8', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 84, 84, 2012, 25, t(9, 6, 9, 10, 4, 7), { loyalty: 98 }),
  q('juventus', 'trezeguet_e8', 'David Trezeguet', 1977, 'France', ['ST'], 83, 83, 2011, 25, t(8, 6, 8, 8, 5, 7)),
  q('juventus', 'iaquinta_e8', 'Vincenzo Iaquinta', 1979, 'Italy', ['ST'], 79, 80, 2012, 25, t(8, 5, 8, 7, 5, 7)),
  q('juventus', 'amauri', 'Amauri', 1980, 'Italy', ['ST'], 80, 81, 2013, 20, t(7, 6, 8, 7, 5, 7)),
];

// ── Premier League supporting cast (real, lighter) ────────────────────────────
export const ASTON_VILLA_2008: CuratedSeed[] = [
  q('aston_villa', 'friedel', 'Brad Friedel', 1971, 'United States', ['GK'], 82, 82, 2011, 20, t(9, 5, 8, 8, 5, 7)),
  q('aston_villa', 'young_av', 'Ashley Young', 1985, 'England', ['LW', 'RW'], 81, 85, 2013, 20, t(8, 6, 8, 8, 5, 8)),
  q('aston_villa', 'milner_av', 'James Milner', 1986, 'England', ['CM', 'RW'], 80, 86, 2013, 15, t(10, 5, 9, 9, 4, 8)),
  q('aston_villa', 'barry_av', 'Gareth Barry', 1981, 'England', ['CM', 'DM'], 82, 84, 2013, 20, t(9, 5, 8, 8, 5, 8)),
  q('aston_villa', 'agbonlahor', 'Gabriel Agbonlahor', 1986, 'England', ['ST', 'RW'], 79, 82, 2014, 20, t(8, 6, 8, 9, 5, 8)),
  q('aston_villa', 'laursen', 'Martin Laursen', 1977, 'Denmark', ['CB'], 80, 80, 2011, 25, t(9, 5, 8, 9, 5, 7)),
  q('aston_villa', 'petrov_av', 'Stiliyan Petrov', 1979, 'Bulgaria', ['CM', 'DM'], 79, 80, 2012, 20, t(9, 5, 8, 9, 5, 8)),
];
export const EVERTON_2008: CuratedSeed[] = [
  q('everton', 'howard_ev', 'Tim Howard', 1979, 'United States', ['GK'], 82, 83, 2013, 20, t(9, 5, 8, 9, 5, 7)),
  q('everton', 'cahill_ev', 'Tim Cahill', 1979, 'Australia', ['AM', 'CM'], 81, 82, 2012, 20, t(9, 6, 9, 9, 6, 8)),
  q('everton', 'arteta_ev', 'Mikel Arteta', 1982, 'Spain', ['CM', 'AM'], 83, 85, 2013, 25, t(9, 5, 8, 8, 4, 8)),
  q('everton', 'jagielka', 'Phil Jagielka', 1982, 'England', ['CB'], 81, 84, 2014, 20, t(9, 5, 8, 9, 5, 7)),
  q('everton', 'lescott_ev', 'Joleon Lescott', 1982, 'England', ['CB'], 81, 83, 2012, 20, t(8, 6, 8, 8, 5, 7)),
  q('everton', 'pienaar', 'Steven Pienaar', 1982, 'South Africa', ['LW', 'AM'], 80, 82, 2012, 20, t(8, 5, 8, 8, 5, 8)),
  q('everton', 'fellaini_ev', 'Marouane Fellaini', 1987, 'Belgium', ['CM', 'DM'], 79, 85, 2013, 20, t(8, 6, 8, 8, 6, 7)),
];
export const TOTTENHAM_2008: CuratedSeed[] = [
  q('spurs', 'gomes_sp', 'Heurelho Gomes', 1981, 'Brazil', ['GK'], 79, 81, 2013, 20, t(7, 6, 8, 8, 6, 7)),
  q('spurs', 'modric_sp', 'Luka Modrić', 1985, 'Croatia', ['CM', 'AM'], 83, 89, 2013, 15, t(10, 5, 9, 9, 4, 8)),
  q('spurs', 'lennon_sp', 'Aaron Lennon', 1987, 'England', ['RW'], 80, 83, 2013, 20, t(8, 5, 8, 8, 5, 8)),
  q('spurs', 'king_sp', 'Ledley King', 1980, 'England', ['CB'], 83, 84, 2012, 40, t(9, 5, 8, 10, 3, 7), { loyalty: 92 }),
  q('spurs', 'huddlestone', 'Tom Huddlestone', 1986, 'England', ['DM', 'CM'], 78, 82, 2013, 20, t(8, 5, 7, 8, 5, 7)),
  q('spurs', 'defoe_sp', 'Jermain Defoe', 1982, 'England', ['ST'], 82, 83, 2013, 20, t(8, 6, 8, 8, 5, 8)),
  q('spurs', 'bale_sp', 'Gareth Bale', 1989, 'Wales', ['LB', 'LW'], 76, 91, 2014, 25, t(8, 6, 9, 8, 5, 8)),
  q('spurs', 'woodgate_sp', 'Jonathan Woodgate', 1980, 'England', ['CB'], 81, 82, 2012, 35, t(8, 5, 8, 8, 5, 7)),
  q('spurs', 'corluka_sp', 'Vedran Ćorluka', 1986, 'Croatia', ['CB', 'RB'], 79, 82, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('spurs', 'assou_ekotto', 'Benoît Assou-Ekotto', 1984, 'Cameroon', ['LB'], 78, 80, 2013, 20, t(6, 6, 7, 8, 6, 7)),
  q('spurs', 'jenas_sp', 'Jermaine Jenas', 1983, 'England', ['CM', 'AM'], 79, 81, 2013, 20, t(8, 5, 8, 7, 5, 8)),
  q('spurs', 'palacios_sp', 'Wilson Palacios', 1984, 'Honduras', ['DM', 'CM'], 79, 82, 2013, 20, t(8, 6, 8, 7, 6, 8)),
  q('spurs', 'pavlyuchenko', 'Roman Pavlyuchenko', 1981, 'Russia', ['ST'], 79, 81, 2013, 20, t(6, 6, 8, 7, 6, 7)),
  q('spurs', 'dawson_sp', 'Michael Dawson', 1983, 'England', ['CB'], 79, 82, 2013, 20, t(9, 5, 8, 9, 5, 7)),
];

/** The full Man-City-2008 curated universe. */
export const MANCITY_2008_SQUADS: Record<string, CuratedSeed[]> = {
  man_city: MANCITY_2008,
  man_utd: MANUTD_2008,
  liverpool: LIVERPOOL_2008,
  chelsea: CHELSEA_2008,
  arsenal: ARSENAL_2008,
  barcelona: BARCELONA_E8,
  real_madrid: REAL_MADRID_E8,
  bayern: BAYERN_E8,
  inter: INTER_E8,
  juventus: JUVENTUS_E8,
  aston_villa: ASTON_VILLA_2008,
  everton: EVERTON_2008,
  spurs: TOTTENHAM_2008,
  // European selling clubs (M12A rollout) — the takeover-era talent pipeline.
  ...EUROPE_2008_SQUADS,
};

// Domestic mid-tier (M12 shortlist supply): real 2008-09 squad players at the
// non-elite PL clubs, so options lists read like a real shortlist.
for (const [club, seeds] of Object.entries(ENG_DOMESTIC_2008_SQUADS)) {
  MANCITY_2008_SQUADS[club] = [...(MANCITY_2008_SQUADS[club] ?? []), ...seeds];
}
