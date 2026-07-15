/**
 * Curated real players — 2013 post-Fergie era pack (§4, §17.10).
 *
 * Vertical slice for the "United after Ferguson" counterfactual: the real David
 * Moyes inheritance plus the 2013–14 title rivals, and the four targets from the
 * transfer plan Ferguson is said to have left him — Garay (Benfica), Thiago
 * (Barcelona), Baines (Everton) and Bale (Spurs). Ability/potential/personality
 * are HIDDEN designer estimates (§7), not scraped facts; everything else (birth
 * years, clubs, positions, contracts) is real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';

type Trait = PlayerState['personality'];

// professionalism, ego, ambition, loyalty, volatility, adaptability
const t = (
  prof: number,
  ego: number,
  amb: number,
  loy: number,
  vol: number,
  adapt: number,
): Trait => ({ professionalism: prof, ego, ambition: amb, loyalty: loy, volatility: vol, adaptability: adapt });

function q(
  club: ClubId,
  id: string,
  name: string,
  birthYear: number,
  nationality: string,
  positions: Position[],
  ability: number,
  potentialCeiling: number,
  contractUntil: number,
  injuryProneness: number,
  personality: Trait,
  extra: { hardBlocks?: HardBlock[]; loyalty?: number; latentCeiling?: number; archetype?: string } = {},
): CuratedSeed {
  return {
    id: `cur_${id}`,
    name,
    birthYear,
    nationality,
    positions,
    club,
    contractUntil,
    ability,
    potentialCeiling,
    personality,
    injuryProneness,
    ...extra,
  };
}

/** Manchester United, 2013–14 — the squad Ferguson handed to Moyes. */
export const MAN_UTD_2013: CuratedSeed[] = [
  q('man_utd', 'degea', 'David de Gea', 1990, 'Spain', ['GK'], 84, 91, 2016, 20, t(8, 5, 8, 7, 4, 7)),
  q('man_utd', 'lindegaard', 'Anders Lindegaard', 1984, 'Denmark', ['GK'], 72, 73, 2015, 25, t(7, 4, 6, 7, 4, 6)),
  q('man_utd', 'rafael', 'Rafael da Silva', 1990, 'Brazil', ['RB'], 78, 83, 2016, 40, t(6, 6, 7, 7, 6, 7)),
  q('man_utd', 'evra', 'Patrice Evra', 1981, 'France', ['LB'], 81, 82, 2014, 25, t(8, 6, 8, 8, 5, 7)),
  q('man_utd', 'vidic', 'Nemanja Vidić', 1981, 'Serbia', ['CB'], 85, 86, 2014, 40, t(9, 6, 9, 8, 5, 6)),
  q('man_utd', 'ferdinand2', 'Rio Ferdinand', 1978, 'England', ['CB'], 81, 82, 2014, 45, t(8, 6, 8, 8, 4, 6)),
  q('man_utd', 'evans', 'Jonny Evans', 1988, 'Northern Ireland', ['CB'], 79, 83, 2016, 35, t(8, 4, 7, 8, 4, 7)),
  q('man_utd', 'smalling', 'Chris Smalling', 1989, 'England', ['CB', 'RB'], 78, 85, 2016, 35, t(7, 5, 7, 7, 4, 7)),
  // Phil Jones — Ferguson called him a potential all-time United great; injuries
  // and inconsistency wasted it. A fragile-AND-lost talent (latent 89): keep his
  // body right (injury management) and give him minutes, and the defender he was
  // billed as can still emerge — but the odds fight you.
  q('man_utd', 'jones', 'Phil Jones', 1992, 'England', ['CB', 'DM'], 77, 86, 2017, 55, t(7, 5, 8, 8, 6, 6), { latentCeiling: 89 }),
  q('man_utd', 'carrick', 'Michael Carrick', 1981, 'England', ['CM', 'DM'], 84, 85, 2015, 25, t(9, 4, 7, 9, 3, 7)),
  q('man_utd', 'cleverley', 'Tom Cleverley', 1989, 'England', ['CM'], 74, 80, 2015, 30, t(7, 5, 7, 7, 4, 7)),
  // Anderson — a £27m talent wasted by fitness/complacency. A user who instils
  // the professionalism reality never got out of him unlocks the midfielder he
  // was billed as (latent 88 vs the 84 he was rated, 74 he stagnated at).
  q('man_utd', 'anderson', 'Anderson', 1988, 'Brazil', ['CM'], 74, 84, 2015, 65, t(4, 7, 6, 6, 7, 6), { latentCeiling: 88 }),
  q('man_utd', 'fletcher', 'Darren Fletcher', 1984, 'Scotland', ['CM'], 76, 82, 2015, 60, t(9, 4, 8, 9, 3, 7)),
  q('man_utd', 'valencia', 'Antonio Valencia', 1985, 'Ecuador', ['RW', 'RB'], 80, 82, 2015, 30, t(8, 4, 7, 8, 3, 7)),
  // Nani — flashes of brilliance, never the consistent star his gifts promised.
  q('man_utd', 'nani', 'Nani', 1986, 'Portugal', ['RW', 'LW'], 79, 85, 2018, 35, t(5, 8, 7, 6, 7, 7), { latentCeiling: 88 }),
  q('man_utd', 'ashleyyoung', 'Ashley Young', 1985, 'England', ['LW', 'LB'], 76, 80, 2015, 30, t(6, 6, 7, 7, 5, 7)),
  q('man_utd', 'kagawa', 'Shinji Kagawa', 1989, 'Japan', ['AM', 'LW'], 79, 85, 2016, 30, t(8, 5, 7, 6, 4, 6)),
  q('man_utd', 'giggs2', 'Ryan Giggs', 1973, 'Wales', ['LW', 'CM'], 78, 79, 2014, 30, t(9, 5, 8, 10, 3, 7)),
  q('man_utd', 'rooney', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 87, 89, 2015, 35, t(7, 8, 9, 7, 6, 7)),
  q('man_utd', 'vanpersie', 'Robin van Persie', 1983, 'Netherlands', ['ST'], 87, 88, 2016, 64, t(8, 7, 9, 6, 5, 7)),
  q('man_utd', 'welbeck', 'Danny Welbeck', 1990, 'England', ['ST', 'LW'], 76, 84, 2015, 35, t(8, 4, 8, 8, 4, 7)),
  q('man_utd', 'chicharito', 'Javier Hernández', 1988, 'Mexico', ['ST'], 78, 82, 2016, 30, t(8, 5, 8, 6, 4, 7)),
];

/** Manchester City, 2013–14 — Pellegrini's champions-to-be. */
export const MAN_CITY_2013: CuratedSeed[] = [
  q('man_city', 'hart', 'Joe Hart', 1987, 'England', ['GK'], 82, 86, 2016, 20, t(7, 6, 8, 7, 6, 7)),
  q('man_city', 'zabaleta', 'Pablo Zabaleta', 1985, 'Argentina', ['RB'], 83, 84, 2016, 35, t(9, 5, 9, 8, 5, 7)),
  q('man_city', 'kompany', 'Vincent Kompany', 1986, 'Belgium', ['CB'], 86, 87, 2016, 45, t(9, 6, 9, 9, 4, 6)),
  q('man_city', 'nastasic', 'Matija Nastasić', 1993, 'Serbia', ['CB'], 79, 86, 2017, 30, t(8, 4, 7, 7, 4, 7)),
  q('man_city', 'demichelis', 'Martín Demichelis', 1980, 'Argentina', ['CB', 'DM'], 79, 80, 2015, 35, t(7, 5, 7, 7, 5, 6)),
  q('man_city', 'clichy', 'Gaël Clichy', 1985, 'France', ['LB'], 80, 82, 2016, 25, t(8, 5, 7, 7, 4, 7)),
  q('man_city', 'kolarov', 'Aleksandar Kolarov', 1985, 'Serbia', ['LB'], 78, 80, 2015, 30, t(7, 6, 7, 6, 5, 7)),
  q('man_city', 'fernandinho', 'Fernandinho', 1985, 'Brazil', ['DM', 'CM'], 83, 85, 2017, 30, t(8, 5, 8, 7, 5, 7)),
  q('man_city', 'yayatoure', 'Yaya Touré', 1983, 'Ivory Coast', ['CM', 'DM'], 87, 88, 2015, 30, t(7, 7, 8, 6, 5, 7)),
  q('man_city', 'davidsilva', 'David Silva', 1986, 'Spain', ['AM', 'LW'], 87, 88, 2016, 30, t(9, 5, 8, 8, 3, 7)),
  q('man_city', 'nasri', 'Samir Nasri', 1987, 'France', ['AM', 'LW'], 82, 86, 2016, 35, t(6, 8, 7, 6, 7, 7)),
  q('man_city', 'navas', 'Jesús Navas', 1985, 'Spain', ['RW'], 80, 82, 2017, 30, t(8, 4, 7, 7, 5, 6)),
  q('man_city', 'aguero', 'Sergio Agüero', 1988, 'Argentina', ['ST'], 89, 91, 2017, 45, t(8, 7, 9, 7, 5, 7), { archetype: 'poacher' }),
  q('man_city', 'negredo', 'Álvaro Negredo', 1985, 'Spain', ['ST'], 81, 83, 2017, 35, t(7, 6, 7, 6, 5, 7)),
  q('man_city', 'dzeko', 'Edin Džeko', 1986, 'Bosnia', ['ST'], 82, 84, 2016, 30, t(7, 6, 8, 6, 5, 7)),
  q('man_city', 'jovetic', 'Stevan Jovetić', 1989, 'Montenegro', ['ST', 'AM'], 81, 86, 2017, 64, t(6, 7, 7, 6, 6, 6)),
];

/** Chelsea, 2013–14 — Mourinho's second coming. */
export const CHELSEA_2013: CuratedSeed[] = [
  q('chelsea', 'cech', 'Petr Čech', 1982, 'Czech Republic', ['GK'], 85, 87, 2016, 25, t(9, 5, 8, 8, 3, 7)),
  q('chelsea', 'ivanovic', 'Branislav Ivanović', 1984, 'Serbia', ['RB', 'CB'], 83, 84, 2016, 30, t(9, 5, 8, 8, 4, 7)),
  q('chelsea', 'cahill', 'Gary Cahill', 1985, 'England', ['CB'], 82, 84, 2017, 30, t(8, 5, 8, 8, 4, 7)),
  q('chelsea', 'terry', 'John Terry', 1980, 'England', ['CB'], 83, 84, 2015, 35, t(8, 7, 9, 9, 5, 6)),
  q('chelsea', 'azpilicueta', 'César Azpilicueta', 1989, 'Spain', ['LB', 'RB'], 81, 87, 2017, 20, t(9, 4, 8, 8, 3, 8)),
  q('chelsea', 'ashleycole', 'Ashley Cole', 1980, 'England', ['LB'], 82, 83, 2014, 25, t(8, 6, 8, 7, 5, 7)),
  q('chelsea', 'ramires', 'Ramires', 1987, 'Brazil', ['CM', 'DM'], 82, 84, 2017, 30, t(8, 5, 8, 7, 4, 7)),
  q('chelsea', 'lampard', 'Frank Lampard', 1978, 'England', ['CM'], 82, 83, 2014, 25, t(9, 6, 9, 9, 3, 7)),
  q('chelsea', 'mikel', 'John Obi Mikel', 1987, 'Nigeria', ['DM'], 79, 82, 2017, 30, t(8, 4, 7, 7, 4, 7)),
  q('chelsea', 'oscar', 'Oscar', 1991, 'Brazil', ['AM'], 82, 88, 2017, 30, t(8, 6, 8, 7, 4, 7)),
  q('chelsea', 'hazard', 'Eden Hazard', 1991, 'Belgium', ['LW', 'AM'], 87, 92, 2017, 25, t(7, 7, 8, 6, 4, 7), { archetype: 'inside-forward' }),
  q('chelsea', 'mata', 'Juan Mata', 1988, 'Spain', ['AM', 'RW'], 84, 86, 2016, 20, t(9, 5, 7, 7, 3, 8)),
  q('chelsea', 'willian', 'Willian', 1988, 'Brazil', ['RW', 'AM'], 82, 85, 2018, 30, t(8, 5, 8, 7, 4, 7)),
  q('chelsea', 'schurrle', 'André Schürrle', 1990, 'Germany', ['LW', 'ST'], 80, 85, 2017, 30, t(7, 6, 7, 6, 5, 7)),
  q('chelsea', 'torres', 'Fernando Torres', 1984, 'Spain', ['ST'], 79, 82, 2016, 40, t(7, 7, 7, 6, 6, 6)),
  q('chelsea', 'etoo', 'Samuel Eto’o', 1981, 'Cameroon', ['ST'], 81, 82, 2014, 35, t(7, 8, 8, 5, 6, 7)),
];

/** Arsenal, 2013–14 (Özil arrives from Real Madrid via the ledger). */
export const ARSENAL_2013: CuratedSeed[] = [
  q('arsenal', 'szczesny', 'Wojciech Szczęsny', 1990, 'Poland', ['GK'], 80, 86, 2017, 25, t(7, 6, 7, 7, 6, 7)),
  q('arsenal', 'sagna', 'Bacary Sagna', 1983, 'France', ['RB'], 81, 82, 2014, 30, t(8, 5, 8, 7, 4, 7)),
  q('arsenal', 'mertesacker', 'Per Mertesacker', 1984, 'Germany', ['CB'], 81, 83, 2016, 25, t(9, 5, 8, 8, 3, 6)),
  q('arsenal', 'koscielny', 'Laurent Koscielny', 1985, 'France', ['CB'], 83, 85, 2016, 30, t(8, 5, 8, 8, 5, 7)),
  q('arsenal', 'gibbs', 'Kieran Gibbs', 1989, 'England', ['LB'], 79, 83, 2016, 40, t(7, 5, 7, 7, 4, 7)),
  q('arsenal', 'arteta', 'Mikel Arteta', 1982, 'Spain', ['DM', 'CM'], 81, 82, 2015, 30, t(9, 5, 8, 8, 3, 7)),
  q('arsenal', 'ramsey', 'Aaron Ramsey', 1990, 'Wales', ['CM'], 83, 88, 2016, 45, t(8, 5, 8, 8, 4, 7)),
  q('arsenal', 'wilshere', 'Jack Wilshere', 1992, 'England', ['CM', 'AM'], 80, 89, 2018, 70, t(6, 7, 8, 8, 6, 6)),
  q('arsenal', 'cazorla', 'Santi Cazorla', 1984, 'Spain', ['AM', 'LW'], 84, 85, 2016, 25, t(9, 5, 7, 7, 3, 8)),
  q('arsenal', 'rosicky', 'Tomáš Rosický', 1980, 'Czech Republic', ['AM'], 79, 80, 2014, 55, t(8, 5, 7, 8, 4, 7)),
  q('arsenal', 'walcott', 'Theo Walcott', 1989, 'England', ['RW'], 81, 85, 2016, 45, t(7, 6, 7, 7, 4, 7)),
  // Bendtner — rated himself world-class; almost nobody else did. The purest
  // ego-bust gamble: prove him right, or watch the talent go to waste.
  q('arsenal', 'bendtner', 'Nicklas Bendtner', 1988, 'Denmark', ['ST'], 74, 80, 2015, 30, t(4, 9, 8, 5, 6, 6), { latentCeiling: 86 }),
  q('arsenal', 'giroud', 'Olivier Giroud', 1986, 'France', ['ST'], 81, 83, 2016, 30, t(8, 5, 8, 7, 4, 7)),
  q('arsenal', 'podolski', 'Lukas Podolski', 1985, 'Germany', ['LW', 'ST'], 80, 82, 2016, 30, t(7, 6, 7, 6, 5, 7)),
];

/** Liverpool, 2013–14 — the Suárez/Sturridge title challenge (Suárez leaves 2014). */
export const LIVERPOOL_2013: CuratedSeed[] = [
  q('liverpool', 'mignolet', 'Simon Mignolet', 1988, 'Belgium', ['GK'], 80, 84, 2018, 25, t(8, 5, 7, 7, 5, 7)),
  q('liverpool', 'gjohnson', 'Glen Johnson', 1984, 'England', ['RB'], 80, 82, 2015, 35, t(7, 6, 7, 6, 5, 7)),
  q('liverpool', 'skrtel', 'Martin Škrtel', 1984, 'Slovakia', ['CB'], 81, 83, 2016, 30, t(8, 5, 8, 7, 5, 6)),
  q('liverpool', 'agger', 'Daniel Agger', 1984, 'Denmark', ['CB'], 81, 83, 2016, 45, t(8, 5, 7, 8, 4, 7)),
  q('liverpool', 'sakho', 'Mamadou Sakho', 1990, 'France', ['CB'], 79, 85, 2018, 35, t(7, 6, 7, 6, 5, 6)),
  q('liverpool', 'enrique', 'José Enrique', 1986, 'Spain', ['LB'], 78, 80, 2016, 40, t(7, 5, 7, 6, 5, 7)),
  q('liverpool', 'gerrard2', 'Steven Gerrard', 1980, 'England', ['CM', 'DM'], 84, 85, 2015, 40, t(9, 7, 10, 10, 5, 7)),
  q('liverpool', 'henderson', 'Jordan Henderson', 1990, 'England', ['CM'], 80, 87, 2017, 25, t(9, 5, 9, 8, 4, 7)),
  q('liverpool', 'lucas', 'Lucas Leiva', 1987, 'Brazil', ['DM'], 79, 82, 2017, 45, t(8, 4, 7, 8, 4, 7)),
  q('liverpool', 'coutinho', 'Philippe Coutinho', 1992, 'Brazil', ['AM', 'LW'], 82, 89, 2018, 30, t(8, 6, 8, 7, 4, 7)),
  q('liverpool', 'sterling', 'Raheem Sterling', 1994, 'England', ['RW', 'LW'], 78, 89, 2017, 25, t(7, 6, 8, 6, 5, 7)),
  q('liverpool', 'suarez', 'Luis Suárez', 1987, 'Uruguay', ['ST'], 89, 91, 2018, 30, t(6, 8, 10, 5, 8, 7)),
  q('liverpool', 'sturridge', 'Daniel Sturridge', 1989, 'England', ['ST'], 83, 86, 2018, 70, t(6, 7, 8, 6, 6, 7)),
];

/** Tottenham, 2013–14 — Bale is the marquee target (else he leaves via the ledger). */
export const SPURS_2013: CuratedSeed[] = [
  q('spurs', 'lloris', 'Hugo Lloris', 1986, 'France', ['GK'], 84, 87, 2017, 20, t(9, 5, 8, 8, 4, 7)),
  q('spurs', 'kwalker', 'Kyle Walker', 1990, 'England', ['RB'], 80, 86, 2016, 30, t(7, 6, 8, 7, 5, 7)),
  q('spurs', 'vertonghen', 'Jan Vertonghen', 1987, 'Belgium', ['CB', 'LB'], 83, 85, 2018, 25, t(8, 5, 8, 7, 4, 7)),
  q('spurs', 'dawson', 'Michael Dawson', 1983, 'England', ['CB'], 79, 80, 2015, 35, t(8, 5, 8, 8, 4, 6)),
  q('spurs', 'kaboul', 'Younès Kaboul', 1986, 'France', ['CB'], 78, 82, 2016, 55, t(6, 6, 7, 6, 6, 6)),
  q('spurs', 'rose', 'Danny Rose', 1990, 'England', ['LB'], 77, 84, 2016, 40, t(7, 5, 7, 7, 5, 7)),
  q('spurs', 'dembele', 'Mousa Dembélé', 1987, 'Belgium', ['CM', 'DM'], 82, 84, 2016, 30, t(8, 5, 7, 7, 4, 7)),
  q('spurs', 'sandro', 'Sandro', 1989, 'Brazil', ['DM'], 79, 83, 2016, 50, t(7, 5, 8, 7, 5, 6)),
  q('spurs', 'lennon', 'Aaron Lennon', 1987, 'England', ['RW'], 79, 81, 2015, 35, t(8, 4, 7, 7, 4, 7)),
  q('spurs', 'sigurdsson', 'Gylfi Sigurðsson', 1989, 'Iceland', ['AM'], 79, 85, 2017, 25, t(8, 5, 7, 7, 4, 7)),
  q('spurs', 'holtby', 'Lewis Holtby', 1990, 'Germany', ['AM', 'CM'], 76, 82, 2017, 35, t(7, 5, 7, 6, 5, 7)),
  q('spurs', 'defoe', 'Jermain Defoe', 1982, 'England', ['ST'], 79, 80, 2015, 30, t(7, 6, 8, 6, 5, 7)),
  q('spurs', 'adebayor', 'Emmanuel Adebayor', 1984, 'Togo', ['ST'], 80, 84, 2016, 35, t(5, 8, 6, 5, 7, 6)),
  q('spurs', 'bale', 'Gareth Bale', 1989, 'Wales', ['LW', 'AM'], 88, 92, 2017, 40, t(8, 7, 9, 6, 5, 7), { archetype: 'inside-forward' }),
];

/** Everton, 2013–14 — Baines is the target. */
export const EVERTON_2013: CuratedSeed[] = [
  q('everton', 'thoward', 'Tim Howard', 1979, 'United States', ['GK'], 80, 81, 2016, 25, t(8, 5, 8, 8, 4, 7)),
  q('everton', 'coleman', 'Séamus Coleman', 1988, 'Ireland', ['RB'], 81, 85, 2016, 30, t(8, 5, 8, 8, 4, 7)),
  q('everton', 'jagielka', 'Phil Jagielka', 1982, 'England', ['CB'], 81, 82, 2016, 30, t(9, 5, 8, 8, 4, 6)),
  q('everton', 'distin', 'Sylvain Distin', 1978, 'France', ['CB'], 79, 80, 2015, 25, t(8, 5, 7, 7, 4, 6)),
  q('everton', 'baines', 'Leighton Baines', 1984, 'England', ['LB'], 83, 84, 2015, 25, t(9, 5, 8, 8, 3, 7)),
  q('everton', 'fellaini', 'Marouane Fellaini', 1987, 'Belgium', ['CM', 'DM'], 80, 83, 2016, 30, t(7, 6, 7, 6, 6, 6)),
  q('everton', 'gbarry', 'Gareth Barry', 1981, 'England', ['DM', 'CM'], 80, 81, 2014, 25, t(9, 4, 7, 7, 3, 7)),
  q('everton', 'mccarthy', 'James McCarthy', 1990, 'Ireland', ['CM', 'DM'], 79, 85, 2018, 30, t(8, 4, 8, 8, 4, 7)),
  q('everton', 'osman', 'Leon Osman', 1981, 'England', ['CM', 'AM'], 77, 78, 2015, 30, t(8, 4, 7, 8, 4, 7)),
  q('everton', 'pienaar', 'Steven Pienaar', 1982, 'South Africa', ['LW', 'AM'], 78, 80, 2016, 40, t(7, 5, 7, 7, 5, 7)),
  q('everton', 'mirallas', 'Kevin Mirallas', 1987, 'Belgium', ['LW', 'RW'], 80, 84, 2017, 45, t(6, 6, 7, 6, 6, 7)),
  // Barkley & Deulofeu — two academy-golden talents who stalled; either can be
  // the player everyone saw at 19 if a manager gets the best out of him.
  q('everton', 'barkley', 'Ross Barkley', 1993, 'England', ['AM', 'CM'], 77, 87, 2018, 35, t(6, 6, 8, 8, 5, 6), { latentCeiling: 91 }),
  q('everton', 'lukaku', 'Romelu Lukaku', 1993, 'Belgium', ['ST'], 82, 89, 2018, 30, t(7, 7, 9, 6, 5, 7)),
  q('everton', 'deulofeu', 'Gerard Deulofeu', 1994, 'Spain', ['LW', 'RW'], 75, 85, 2017, 35, t(6, 7, 7, 5, 6, 6), { latentCeiling: 88 }),
];

/** Southampton, 2013–14 — Shaw (a later Van Gaal target the user skips) + core. */
export const SOUTHAMPTON_2013: CuratedSeed[] = [
  q('southampton', 'lukeshaw', 'Luke Shaw', 1995, 'England', ['LB'], 78, 88, 2018, 40, t(7, 5, 7, 6, 5, 7)),
  q('southampton', 'lallana', 'Adam Lallana', 1988, 'England', ['AM', 'LW'], 82, 85, 2017, 30, t(8, 5, 8, 7, 4, 7)),
  q('southampton', 'lambert', 'Rickie Lambert', 1982, 'England', ['ST'], 80, 81, 2016, 25, t(8, 5, 8, 8, 3, 7)),
  q('southampton', 'jayrod', 'Jay Rodriguez', 1989, 'England', ['ST', 'LW'], 79, 84, 2018, 45, t(8, 4, 8, 7, 4, 7)),
  q('southampton', 'schneiderlin', 'Morgan Schneiderlin', 1989, 'France', ['DM', 'CM'], 80, 85, 2017, 25, t(8, 5, 8, 7, 4, 7)),
  q('southampton', 'wanyama', 'Victor Wanyama', 1991, 'Kenya', ['DM'], 79, 84, 2018, 30, t(8, 5, 8, 7, 4, 6)),
  q('southampton', 'fonte', 'José Fonte', 1983, 'Portugal', ['CB'], 78, 80, 2016, 25, t(8, 4, 7, 8, 3, 7)),
];

/** Real Madrid, 2013–14 — Bale's real destination; Özil + Di María leave here. */
export const REAL_MADRID_2013: CuratedSeed[] = [
  q('real_madrid', 'casillas2', 'Iker Casillas', 1981, 'Spain', ['GK'], 85, 86, 2017, 20, t(9, 6, 9, 9, 3, 7)),
  q('real_madrid', 'carvajal', 'Dani Carvajal', 1992, 'Spain', ['RB'], 79, 87, 2018, 25, t(8, 5, 8, 8, 4, 7)),
  q('real_madrid', 'sramos', 'Sergio Ramos', 1986, 'Spain', ['CB'], 88, 89, 2017, 30, t(8, 7, 9, 8, 6, 7)),
  q('real_madrid', 'pepe2', 'Pepe', 1983, 'Portugal', ['CB'], 84, 85, 2017, 40, t(7, 6, 8, 8, 7, 6)),
  q('real_madrid', 'marcelo', 'Marcelo', 1988, 'Brazil', ['LB'], 85, 87, 2017, 30, t(7, 6, 8, 8, 4, 7)),
  q('real_madrid', 'xabialonso', 'Xabi Alonso', 1981, 'Spain', ['DM', 'CM'], 85, 86, 2014, 30, t(9, 6, 8, 8, 3, 7)),
  q('real_madrid', 'modric', 'Luka Modrić', 1985, 'Croatia', ['CM'], 86, 88, 2017, 25, t(9, 5, 8, 8, 3, 8)),
  q('real_madrid', 'khedira', 'Sami Khedira', 1987, 'Germany', ['CM', 'DM'], 82, 85, 2016, 45, t(8, 5, 8, 7, 4, 7)),
  q('real_madrid', 'dimaria', 'Ángel Di María', 1988, 'Argentina', ['LW', 'CM'], 84, 87, 2016, 30, t(8, 6, 8, 6, 5, 7)),
  q('real_madrid', 'isco', 'Isco', 1992, 'Spain', ['AM'], 81, 88, 2018, 25, t(8, 6, 8, 7, 4, 7)),
  q('real_madrid', 'ozil', 'Mesut Özil', 1988, 'Germany', ['AM'], 85, 87, 2016, 25, t(8, 5, 7, 6, 4, 7)),
  q('real_madrid', 'ronaldo2', 'Cristiano Ronaldo', 1985, 'Portugal', ['LW', 'ST'], 93, 94, 2018, 25, t(9, 9, 10, 7, 5, 8)),
  q('real_madrid', 'benzema', 'Karim Benzema', 1987, 'France', ['ST'], 85, 88, 2017, 25, t(7, 6, 8, 7, 5, 7)),
];

/** Barcelona, 2013–14 — Thiago is a target (else he joins Bayern via the ledger). */
export const BARCELONA_2013: CuratedSeed[] = [
  q('barcelona', 'valdes', 'Víctor Valdés', 1982, 'Spain', ['GK'], 84, 85, 2014, 25, t(8, 6, 8, 8, 4, 6)),
  q('barcelona', 'dalves', 'Dani Alves', 1983, 'Brazil', ['RB'], 84, 85, 2017, 30, t(7, 7, 8, 7, 5, 7)),
  q('barcelona', 'pique', 'Gerard Piqué', 1987, 'Spain', ['CB'], 85, 87, 2016, 30, t(8, 7, 8, 8, 5, 7)),
  q('barcelona', 'mascherano', 'Javier Mascherano', 1984, 'Argentina', ['CB', 'DM'], 83, 85, 2016, 30, t(9, 5, 9, 8, 5, 6)),
  q('barcelona', 'jordialba', 'Jordi Alba', 1989, 'Spain', ['LB'], 84, 86, 2018, 30, t(8, 5, 8, 8, 4, 7)),
  q('barcelona', 'xavi', 'Xavi', 1980, 'Spain', ['CM'], 85, 86, 2016, 20, t(9, 6, 8, 10, 3, 7)),
  q('barcelona', 'iniesta', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 88, 89, 2018, 25, t(10, 5, 8, 10, 3, 8)),
  q('barcelona', 'busquets', 'Sergio Busquets', 1988, 'Spain', ['DM'], 86, 88, 2018, 20, t(9, 5, 8, 9, 3, 7)),
  q('barcelona', 'thiago', 'Thiago Alcântara', 1991, 'Spain', ['CM', 'AM'], 82, 90, 2018, 45, t(8, 6, 8, 6, 4, 7)),
  q('barcelona', 'cesc', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 84, 87, 2016, 25, t(8, 6, 8, 6, 4, 7)),
  q('barcelona', 'messi', 'Lionel Messi', 1987, 'Argentina', ['AM', 'ST'], 94, 95, 2018, 30, t(9, 6, 10, 10, 3, 8), {
    loyalty: 95,
    hardBlocks: [{ reason: 'Lionel Messi will not leave Barcelona. This is not about money.', untilYear: 2020 }],
  }),
  q('barcelona', 'neymar', 'Neymar', 1992, 'Brazil', ['LW', 'ST'], 86, 92, 2018, 30, t(6, 8, 9, 6, 6, 8)),
  q('barcelona', 'pedro', 'Pedro', 1987, 'Spain', ['RW', 'ST'], 81, 83, 2016, 25, t(8, 4, 7, 8, 3, 7)),
  q('barcelona', 'alexis', 'Alexis Sánchez', 1988, 'Chile', ['RW', 'ST'], 83, 88, 2016, 35, t(8, 6, 9, 6, 5, 7)),
];

/** Bayern Munich, 2013–14 — Guardiola's treble holders; Thiago's real destination. */
export const BAYERN_2013: CuratedSeed[] = [
  q('bayern', 'neuer', 'Manuel Neuer', 1986, 'Germany', ['GK'], 89, 91, 2018, 20, t(9, 6, 9, 8, 3, 8)),
  q('bayern', 'lahm', 'Philipp Lahm', 1983, 'Germany', ['RB', 'DM'], 86, 87, 2016, 20, t(10, 5, 9, 9, 3, 8)),
  q('bayern', 'boateng', 'Jérôme Boateng', 1988, 'Germany', ['CB'], 83, 88, 2018, 30, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'dante', 'Dante', 1983, 'Brazil', ['CB'], 82, 83, 2017, 30, t(8, 5, 7, 7, 5, 7)),
  q('bayern', 'alaba', 'David Alaba', 1992, 'Austria', ['LB', 'CM'], 84, 89, 2018, 25, t(9, 5, 8, 8, 3, 8)),
  q('bayern', 'schweinsteiger', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'DM'], 85, 87, 2016, 45, t(9, 6, 9, 9, 4, 7)),
  q('bayern', 'kroos', 'Toni Kroos', 1990, 'Germany', ['CM'], 84, 89, 2015, 20, t(9, 5, 8, 7, 3, 7)),
  q('bayern', 'ribery', 'Franck Ribéry', 1983, 'France', ['LW'], 88, 89, 2017, 35, t(8, 7, 9, 8, 5, 7)),
  q('bayern', 'robben', 'Arjen Robben', 1984, 'Netherlands', ['RW'], 87, 88, 2017, 64, t(8, 7, 9, 7, 5, 7)),
  q('bayern', 'muller', 'Thomas Müller', 1989, 'Germany', ['AM', 'ST'], 85, 88, 2017, 20, t(9, 5, 9, 10, 3, 8)),
  q('bayern', 'mandzukic', 'Mario Mandžukić', 1986, 'Croatia', ['ST'], 82, 84, 2017, 30, t(8, 6, 8, 6, 6, 7)),
  q('bayern', 'gotze', 'Mario Götze', 1992, 'Germany', ['AM'], 83, 89, 2017, 40, t(7, 6, 8, 6, 5, 7)),
];

/** Benfica, 2013–14 — Garay is the target. */
export const BENFICA_2013: CuratedSeed[] = [
  q('benfica', 'oblak', 'Jan Oblak', 1993, 'Slovenia', ['GK'], 76, 90, 2019, 20, t(8, 5, 8, 7, 3, 7)),
  q('benfica', 'garay', 'Ezequiel Garay', 1986, 'Argentina', ['CB'], 82, 84, 2016, 30, t(8, 5, 8, 7, 4, 7)),
  q('benfica', 'luisao', 'Luisão', 1981, 'Brazil', ['CB'], 80, 81, 2016, 30, t(8, 5, 8, 8, 4, 6)),
  q('benfica', 'maxipereira', 'Maxi Pereira', 1984, 'Uruguay', ['RB'], 79, 80, 2016, 30, t(8, 5, 8, 7, 5, 7)),
  q('benfica', 'enzoperez', 'Enzo Pérez', 1986, 'Argentina', ['CM'], 80, 83, 2017, 30, t(8, 5, 8, 6, 5, 7)),
  q('benfica', 'rodrigo', 'Rodrigo', 1991, 'Spain', ['ST'], 78, 85, 2017, 35, t(7, 6, 8, 6, 5, 7)),
  q('benfica', 'artur13', 'Artur Moraes', 1981, 'Brazil', ['GK'], 72, 72, 2015, 30, t(7, 4, 5, 7, 3, 7)),
  q('benfica', 'andrealmeida13', 'André Almeida', 1990, 'Portugal', ['RB', 'DM', 'CB'], 73, 80, 2018, 30, t(8, 3, 7, 9, 3, 8)),
  q('benfica', 'silvio13', 'Sílvio', 1987, 'Portugal', ['RB', 'LB'], 72, 74, 2017, 40, t(7, 4, 6, 6, 4, 7)),
  q('benfica', 'matic13', 'Nemanja Matić', 1988, 'Serbia', ['DM', 'CM'], 82, 86, 2015, 20, t(8, 5, 9, 4, 3, 7)),
  q('benfica', 'fejsa13', 'Ljubomir Fejsa', 1988, 'Serbia', ['DM'], 76, 79, 2018, 35, t(8, 4, 6, 8, 3, 7)),
  q('benfica', 'gaitan13', 'Nicolás Gaitán', 1988, 'Argentina', ['AM', 'LW'], 80, 82, 2017, 30, t(7, 6, 7, 6, 5, 7)),
  q('benfica', 'salvio13', 'Eduardo Salvio', 1990, 'Argentina', ['RW', 'AM'], 78, 82, 2017, 45, t(7, 6, 7, 6, 6, 7)),
  q('benfica', 'lima13', 'Lima', 1983, 'Brazil', ['ST'], 76, 77, 2016, 30, t(7, 4, 6, 6, 4, 7)),
  q('benfica', 'cardozo13', 'Óscar Cardozo', 1983, 'Paraguay', ['ST'], 78, 79, 2015, 35, t(7, 6, 6, 7, 4, 7)),
  q('benfica', 'olajohn13', 'Ola John', 1992, 'Netherlands', ['LW', 'RW'], 71, 78, 2017, 40, t(6, 6, 7, 4, 7, 6)),
  // Marković — an explosive teenage winger, domestic treble here then a £20m
  // Liverpool move that badly flopped. A high-ceiling lost talent (latent 88).
  q('benfica', 'markovic13', 'Lazar Marković', 1994, 'Serbia', ['LW', 'RW'], 77, 82, 2018, 30, t(6, 7, 8, 3, 7, 5), { latentCeiling: 88 }),
  q('benfica', 'djuricic13', 'Filip Đuričić', 1992, 'Serbia', ['AM', 'LW'], 72, 78, 2018, 40, t(6, 5, 7, 4, 6, 5), { latentCeiling: 83 }),
  // Cavaleiro — an academy graduate of huge youth hype; a solid-not-elite career.
  q('benfica', 'cavaleiro13', 'Ivan Cavaleiro', 1993, 'Portugal', ['LW', 'RW'], 68, 80, 2018, 35, t(6, 6, 8, 5, 6, 6), { latentCeiling: 85 }),
];

/** Context selling-clubs for Spurs' post-Bale rebuild (via the ledger). */
export const ROMA_2013: CuratedSeed[] = [
  q('roma', 'lamela', 'Erik Lamela', 1992, 'Argentina', ['RW', 'AM'], 80, 87, 2018, 35, t(6, 7, 8, 5, 6, 7)),
  q('roma', 'totti', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 84, 85, 2016, 30, t(8, 7, 8, 10, 4, 6), {
    loyalty: 98,
    hardBlocks: [{ reason: 'Francesco Totti is Roma for life. He is not for sale.', untilYear: 2017 }],
  }),
  q('roma', 'derossi', 'Daniele De Rossi', 1983, 'Italy', ['DM', 'CM'], 83, 85, 2017, 30, t(8, 6, 9, 9, 6, 6)),
  q('roma', 'strootman', 'Kevin Strootman', 1990, 'Netherlands', ['CM', 'DM'], 82, 87, 2018, 45, t(8, 5, 8, 7, 5, 7)),
  q('roma', 'desanctis13', 'Morgan De Sanctis', 1977, 'Italy', ['GK'], 79, 79, 2016, 30, t(8, 4, 6, 7, 3, 7)),
  q('roma', 'benatia13', 'Mehdi Benatia', 1987, 'Morocco', ['CB'], 83, 86, 2018, 25, t(8, 6, 9, 4, 4, 7)),
  q('roma', 'castan13', 'Leandro Castán', 1986, 'Brazil', ['CB'], 79, 81, 2017, 40, t(7, 4, 7, 7, 4, 7)),
  q('roma', 'balzaretti13', 'Federico Balzaretti', 1981, 'Italy', ['LB'], 78, 78, 2015, 75, t(8, 4, 6, 8, 3, 7)),
  q('roma', 'maicon13', 'Maicon', 1981, 'Brazil', ['RB'], 80, 80, 2015, 55, t(6, 6, 6, 5, 5, 6)),
  q('roma', 'torosidis13', 'Vasilis Torosidis', 1985, 'Greece', ['RB', 'CB'], 78, 79, 2017, 25, t(7, 4, 7, 7, 4, 7)),
  q('roma', 'dodo13', 'Dodô', 1992, 'Brazil', ['LB'], 76, 82, 2017, 30, t(6, 5, 7, 5, 5, 7)),
  q('roma', 'pjanic13', 'Miralem Pjanić', 1990, 'Bosnia and Herzegovina', ['AM', 'CM'], 82, 87, 2018, 30, t(8, 6, 8, 4, 4, 8)),
  q('roma', 'nainggolan13', 'Radja Nainggolan', 1988, 'Belgium', ['CM', 'DM'], 81, 85, 2018, 25, t(8, 6, 8, 6, 7, 7)),
  q('roma', 'florenzi13', 'Alessandro Florenzi', 1991, 'Italy', ['RW', 'CM', 'RB'], 78, 84, 2018, 30, t(8, 5, 8, 9, 4, 7)),
  q('roma', 'gervinho13', 'Gervinho', 1987, 'Ivory Coast', ['LW', 'ST'], 81, 82, 2017, 30, t(6, 6, 7, 5, 7, 6)),
  q('roma', 'borriello13', 'Marco Borriello', 1982, 'Italy', ['ST'], 73, 73, 2015, 45, t(6, 6, 5, 5, 5, 7)),
  // Destro — a lethal poacher whose 2013-14 form promised a top striker, then
  // chronic injuries stopped it. Fragile-and-lost (latent 86).
  q('roma', 'destro13', 'Mattia Destro', 1991, 'Italy', ['ST'], 78, 82, 2017, 70, t(6, 7, 7, 5, 6, 6), { latentCeiling: 86 }),
  // Ljajić — huge technical gift, low professionalism and a temperament that
  // stalled it. A lost talent (latent 86).
  q('roma', 'ljajic13', 'Adem Ljajić', 1991, 'Serbia', ['LW', 'AM'], 78, 82, 2018, 35, t(5, 7, 6, 4, 7, 6), { latentCeiling: 86 }),
];
export const VALENCIA_2013: CuratedSeed[] = [
  q('valencia', 'soldado', 'Roberto Soldado', 1985, 'Spain', ['ST'], 81, 82, 2017, 30, t(8, 5, 8, 7, 4, 7)),
  q('valencia', 'guardado', 'Andrés Guardado', 1986, 'Mexico', ['LW', 'LB'], 78, 80, 2017, 30, t(7, 5, 7, 7, 5, 7)),
  q('valencia', 'feghouli', 'Sofiane Feghouli', 1989, 'Algeria', ['RW', 'AM'], 78, 83, 2016, 30, t(7, 6, 7, 6, 5, 7)),
  q('valencia', 'dalves13', 'Diego Alves', 1985, 'Brazil', ['GK'], 78, 80, 2017, 45, t(7, 5, 6, 7, 4, 6)),
  q('valencia', 'barragan13', 'Antonio Barragán', 1987, 'Spain', ['RB'], 68, 70, 2015, 30, t(6, 5, 5, 6, 5, 6)),
  q('valencia', 'rami13', 'Adil Rami', 1985, 'France', ['CB'], 75, 78, 2016, 35, t(5, 7, 6, 5, 7, 6)),
  q('valencia', 'mathieu13', 'Jérémy Mathieu', 1983, 'France', ['CB', 'LB'], 77, 78, 2016, 30, t(7, 5, 8, 5, 4, 7)),
  q('valencia', 'jpereira13', 'João Pereira', 1984, 'Portugal', ['RB'], 72, 73, 2016, 25, t(7, 5, 6, 6, 4, 7)),
  q('valencia', 'parejo13', 'Dani Parejo', 1989, 'Spain', ['CM', 'AM'], 74, 82, 2018, 25, t(5, 7, 7, 6, 6, 6)),
  q('valencia', 'michel13', 'Michel', 1985, 'Spain', ['DM', 'CM'], 70, 73, 2016, 30, t(7, 4, 6, 7, 4, 6)),
  q('valencia', 'piatti13', 'Pablo Piatti', 1989, 'Argentina', ['LW', 'RW'], 71, 76, 2017, 65, t(7, 5, 6, 7, 4, 7)),
  q('valencia', 'postiga13', 'Hélder Postiga', 1982, 'Portugal', ['ST'], 71, 72, 2015, 60, t(6, 6, 5, 5, 6, 6)),
  q('valencia', 'alcacer13', 'Paco Alcácer', 1993, 'Spain', ['ST'], 68, 86, 2018, 25, t(7, 4, 8, 7, 3, 7)),
  // Banega — a mercurial passing talent perennially undercut by professionalism
  // and temperament. A lost talent (latent 84).
  q('valencia', 'banega13', 'Éver Banega', 1988, 'Argentina', ['CM', 'AM'], 76, 79, 2016, 30, t(4, 7, 7, 4, 8, 6), { latentCeiling: 84 }),
];
export const AJAX_2013: CuratedSeed[] = [
  q('ajax', 'eriksen', 'Christian Eriksen', 1992, 'Denmark', ['AM', 'CM'], 81, 88, 2016, 25, t(8, 5, 8, 6, 4, 8)),
  q('ajax', 'alderweireld', 'Toby Alderweireld', 1989, 'Belgium', ['CB'], 80, 86, 2016, 25, t(8, 5, 8, 7, 4, 7)),
  q('ajax', 'cillessen13', 'Jasper Cillessen', 1989, 'Netherlands', ['GK'], 76, 82, 2016, 20, t(8, 5, 7, 6, 4, 7)),
  q('ajax', 'blind13', 'Daley Blind', 1990, 'Netherlands', ['LB', 'DM', 'CM'], 79, 84, 2016, 18, t(9, 4, 8, 6, 3, 8)),
  q('ajax', 'veltman13', 'Joël Veltman', 1992, 'Netherlands', ['CB', 'RB'], 71, 79, 2017, 25, t(8, 5, 7, 7, 4, 7)),
  q('ajax', 'moisander13', 'Niklas Moisander', 1985, 'Finland', ['CB'], 74, 76, 2015, 30, t(8, 5, 7, 6, 4, 7)),
  q('ajax', 'vanrhijn13', 'Ricardo van Rhijn', 1991, 'Netherlands', ['RB', 'CB'], 72, 77, 2016, 22, t(7, 5, 7, 6, 4, 6)),
  q('ajax', 'schone13', 'Lasse Schöne', 1986, 'Denmark', ['CM', 'AM'], 74, 76, 2016, 22, t(8, 4, 6, 7, 3, 7)),
  q('ajax', 'klaassen13', 'Davy Klaassen', 1993, 'Netherlands', ['AM', 'CM'], 72, 84, 2016, 20, t(9, 5, 8, 8, 3, 7)),
  q('ajax', 'siemdejong13', 'Siem de Jong', 1988, 'Netherlands', ['AM', 'ST'], 76, 79, 2015, 45, t(8, 6, 8, 6, 4, 7)),
  q('ajax', 'poulsen13', 'Christian Poulsen', 1980, 'Denmark', ['DM', 'CM'], 71, 71, 2015, 50, t(7, 6, 6, 6, 6, 6)),
  // Bojan — the ex-Barça wonderkid on a season's loan, his once-huge ceiling long
  // since sapped by pressure and volatility. A lost talent (latent 84).
  q('ajax', 'bojan13', 'Bojan Krkić', 1990, 'Spain', ['ST', 'AM', 'LW'], 74, 78, 2015, 45, t(7, 4, 6, 5, 7, 6), { latentCeiling: 84 }),
  // Fischer — an electric young winger whose knee ligaments kept betraying him.
  // Fragile-and-lost (latent 88).
  q('ajax', 'fischer13', 'Viktor Fischer', 1994, 'Denmark', ['LW', 'ST'], 71, 82, 2017, 80, t(7, 6, 8, 5, 6, 6), { latentCeiling: 88 }),
  q('ajax', 'elghazi13', 'Anwar El Ghazi', 1995, 'Netherlands', ['RW', 'LW'], 62, 82, 2017, 30, t(6, 7, 8, 4, 6, 6)),
  q('ajax', 'sigthorsson13', 'Kolbeinn Sigþórsson', 1990, 'Iceland', ['ST'], 73, 78, 2015, 72, t(7, 5, 7, 6, 5, 6)),
];

/** PSG, 2013–14 — Ibrahimović-era context for cross-European realism/queries. */
export const PSG_2013: CuratedSeed[] = [
  q('psg', 'ibrahimovic', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 89, 90, 2016, 25, t(7, 10, 9, 6, 6, 7), { archetype: 'target-man' }),
  q('psg', 'thiagosilva', 'Thiago Silva', 1984, 'Brazil', ['CB'], 87, 88, 2018, 25, t(9, 6, 9, 8, 4, 7)),
  q('psg', 'cavani', 'Edinson Cavani', 1987, 'Uruguay', ['ST'], 85, 87, 2018, 30, t(8, 6, 9, 7, 5, 7), { archetype: 'poacher' }),
  q('psg', 'verratti', 'Marco Verratti', 1992, 'Italy', ['CM', 'DM'], 81, 90, 2018, 30, t(7, 6, 8, 7, 6, 7)),
  q('psg', 'lavezzi', 'Ezequiel Lavezzi', 1985, 'Argentina', ['LW', 'ST'], 81, 83, 2016, 30, t(7, 6, 7, 6, 6, 7)),
  q('psg', 'sirigu13', 'Salvatore Sirigu', 1987, 'Italy', ['GK'], 82, 84, 2018, 20, t(8, 5, 7, 7, 4, 7)),
  q('psg', 'alexpsg13', 'Alex', 1982, 'Brazil', ['CB'], 81, 82, 2015, 35, t(8, 5, 7, 7, 4, 6)),
  q('psg', 'maxwell13', 'Maxwell', 1981, 'Brazil', ['LB'], 80, 81, 2015, 25, t(9, 4, 7, 8, 3, 7)),
  q('psg', 'vanderwiel13', 'Gregory van der Wiel', 1988, 'Netherlands', ['RB'], 79, 83, 2015, 30, t(7, 6, 7, 6, 5, 7)),
  q('psg', 'marquinhos13', 'Marquinhos', 1994, 'Brazil', ['CB'], 78, 90, 2018, 25, t(8, 5, 8, 7, 3, 8)),
  q('psg', 'matuidi13', 'Blaise Matuidi', 1987, 'France', ['DM', 'CM'], 83, 85, 2017, 20, t(9, 4, 9, 8, 3, 7)),
  q('psg', 'thiagomotta13', 'Thiago Motta', 1982, 'Italy', ['DM', 'CM'], 82, 83, 2016, 45, t(8, 6, 8, 7, 6, 7)),
  // Pastore — "El Flaco", a €42m gem billed for the very top; the talent was
  // always there but fragility and inconsistency capped him. Lost talent (89).
  q('psg', 'pastore13', 'Javier Pastore', 1989, 'Argentina', ['AM'], 82, 87, 2016, 45, t(7, 6, 7, 6, 6, 6), { latentCeiling: 89 }),
  // Ménez — dazzling flair undone by attitude. A lost talent (latent 86).
  q('psg', 'menez13', 'Jérémy Ménez', 1987, 'France', ['AM', 'RW', 'ST'], 80, 83, 2015, 40, t(5, 8, 7, 5, 7, 6), { latentCeiling: 86 }),
  q('psg', 'lucasmoura13', 'Lucas Moura', 1992, 'Brazil', ['RW', 'LW'], 81, 88, 2018, 25, t(8, 6, 8, 6, 4, 8)),
  q('psg', 'cabaye13', 'Yohan Cabaye', 1986, 'France', ['CM', 'DM'], 82, 84, 2017, 25, t(8, 5, 8, 6, 5, 7)),
  q('psg', 'digne13', 'Lucas Digne', 1993, 'France', ['LB'], 76, 85, 2018, 30, t(8, 5, 7, 6, 4, 7)),
];

/** AC Milan, 2013–14 — a fading giant (finished 8th), home of the marquee lost
 *  talent Mario Balotelli and the injury-hit "Faraone", Stephan El Shaarawy. */
export const MILAN_2013: CuratedSeed[] = [
  q('milan', 'abbiati13', 'Christian Abbiati', 1977, 'Italy', ['GK'], 76, 76, 2015, 30, t(9, 3, 5, 9, 2, 6)),
  q('milan', 'abate13', 'Ignazio Abate', 1986, 'Italy', ['RB'], 77, 78, 2017, 35, t(7, 4, 5, 8, 3, 6)),
  q('milan', 'desciglio13', 'Mattia De Sciglio', 1992, 'Italy', ['LB', 'RB'], 76, 83, 2018, 45, t(8, 4, 6, 8, 2, 6)),
  q('milan', 'mexes13', 'Philippe Mexès', 1982, 'France', ['CB'], 77, 77, 2015, 35, t(6, 6, 5, 6, 7, 6)),
  q('milan', 'zapata13', 'Cristián Zapata', 1986, 'Colombia', ['CB'], 75, 76, 2017, 30, t(7, 4, 5, 6, 4, 6)),
  q('milan', 'constant13', 'Kévin Constant', 1987, 'Guinea', ['LB', 'DM'], 72, 73, 2017, 30, t(6, 5, 5, 5, 6, 5)),
  q('milan', 'dejong13', 'Nigel de Jong', 1985, 'Netherlands', ['DM', 'CM'], 79, 79, 2015, 35, t(8, 5, 6, 6, 6, 7)),
  q('milan', 'montolivo13', 'Riccardo Montolivo', 1985, 'Italy', ['CM', 'DM'], 80, 80, 2017, 35, t(8, 4, 6, 7, 3, 6)),
  q('milan', 'muntari13', 'Sulley Muntari', 1984, 'Ghana', ['CM'], 76, 76, 2015, 30, t(6, 6, 6, 6, 7, 6)),
  q('milan', 'poli13', 'Andrea Poli', 1989, 'Italy', ['CM', 'DM'], 74, 79, 2017, 30, t(8, 4, 6, 6, 3, 6)),
  q('milan', 'kaka13', 'Kaká', 1982, 'Brazil', ['AM'], 80, 80, 2015, 55, t(9, 4, 6, 8, 2, 7)),
  q('milan', 'honda13', 'Keisuke Honda', 1986, 'Japan', ['AM', 'RW'], 77, 78, 2017, 25, t(8, 6, 8, 6, 3, 7)),
  q('milan', 'robinho13', 'Robinho', 1984, 'Brazil', ['LW', 'AM'], 77, 77, 2015, 35, t(5, 7, 5, 5, 5, 6)),
  q('milan', 'pazzini13', 'Giampaolo Pazzini', 1984, 'Italy', ['ST'], 76, 76, 2016, 45, t(7, 6, 6, 6, 4, 5)),
  // Balotelli — the marquee lost talent: the pace, power and technique of a
  // world-class No. 9 (latent 94), squandered by temperament (prof 3, ego 9,
  // volatility 9). Milan's top scorer at 23, yet never close to what he could be.
  q('milan', 'balotelli13', 'Mario Balotelli', 1990, 'Italy', ['ST'], 84, 88, 2018, 30, t(3, 9, 7, 4, 9, 5), { latentCeiling: 94 }),
  // El Shaarawy — "Il Faraone": a 16-goal breakout at 20, then a metatarsal
  // fracture wrecked his season. Fragile-and-lost (latent 88) if kept fit.
  q('milan', 'elshaarawy13', 'Stephan El Shaarawy', 1992, 'Italy', ['LW', 'ST'], 79, 86, 2018, 72, t(7, 5, 7, 7, 4, 6), { latentCeiling: 88 }),
];

/** Juventus, 2013–14 — Serie A identity for context. */
export const JUVENTUS_2013: CuratedSeed[] = [
  q('juventus', 'buffon', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 86, 87, 2016, 25, t(9, 7, 9, 10, 3, 6)),
  q('juventus', 'pirlo', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'CM'], 85, 86, 2016, 25, t(9, 6, 8, 8, 3, 7), { archetype: 'deep-playmaker' }),
  q('juventus', 'vidal', 'Arturo Vidal', 1987, 'Chile', ['CM', 'DM'], 85, 87, 2017, 40, t(7, 7, 9, 7, 7, 7)),
  q('juventus', 'pogba', 'Paul Pogba', 1993, 'France', ['CM'], 82, 92, 2019, 30, t(6, 8, 9, 6, 6, 7)),
  q('juventus', 'tevez', 'Carlos Tévez', 1984, 'Argentina', ['ST'], 84, 85, 2016, 30, t(6, 8, 9, 5, 7, 7)),
  q('juventus', 'chiellini', 'Giorgio Chiellini', 1984, 'Italy', ['CB'], 85, 86, 2018, 30, t(9, 6, 9, 9, 5, 6)),
  q('juventus', 'barzagli13', 'Andrea Barzagli', 1981, 'Italy', ['CB'], 84, 85, 2016, 35, t(9, 3, 7, 9, 3, 7)),
  q('juventus', 'bonucci13', 'Leonardo Bonucci', 1987, 'Italy', ['CB'], 84, 88, 2018, 20, t(8, 6, 8, 7, 6, 7)),
  q('juventus', 'lichtsteiner13', 'Stephan Lichtsteiner', 1984, 'Switzerland', ['RB'], 82, 83, 2016, 15, t(9, 5, 7, 7, 6, 8)),
  q('juventus', 'ogbonna13', 'Angelo Ogbonna', 1988, 'Italy', ['CB'], 77, 84, 2018, 25, t(7, 4, 6, 6, 4, 6)),
  q('juventus', 'caceres13', 'Martín Cáceres', 1987, 'Uruguay', ['CB', 'RB'], 78, 82, 2016, 55, t(5, 6, 6, 6, 7, 7)),
  q('juventus', 'isla13', 'Mauricio Isla', 1988, 'Chile', ['RB', 'RW'], 77, 81, 2016, 30, t(6, 5, 6, 5, 6, 7)),
  q('juventus', 'asamoah13', 'Kwadwo Asamoah', 1988, 'Ghana', ['LB', 'CM'], 80, 83, 2017, 55, t(8, 4, 6, 7, 3, 7)),
  q('juventus', 'marchisio13', 'Claudio Marchisio', 1986, 'Italy', ['CM', 'DM'], 83, 85, 2018, 30, t(8, 4, 7, 10, 3, 7)),
  q('juventus', 'padoin13', 'Simone Padoin', 1984, 'Italy', ['CM', 'RB'], 70, 72, 2016, 20, t(8, 2, 5, 8, 2, 7)),
  q('juventus', 'llorente13', 'Fernando Llorente', 1985, 'Spain', ['ST'], 81, 83, 2018, 20, t(7, 5, 6, 6, 4, 6)),
  q('juventus', 'vucinic13', 'Mirko Vučinić', 1983, 'Montenegro', ['ST', 'AM'], 80, 82, 2015, 45, t(6, 6, 6, 5, 6, 6)),
  q('juventus', 'quagliarella13', 'Fabio Quagliarella', 1983, 'Italy', ['ST'], 78, 80, 2016, 40, t(7, 5, 6, 6, 5, 6)),
  q('juventus', 'storari13', 'Marco Storari', 1977, 'Italy', ['GK'], 74, 75, 2015, 25, t(7, 3, 5, 7, 3, 6)),
  // Giovinco — the "Atomic Ant", a gifted trequartista who never nailed a starting
  // role in Italy, then exploded in MLS. A lost talent (latent 85).
  q('juventus', 'giovinco13', 'Sebastian Giovinco', 1987, 'Italy', ['AM', 'ST'], 76, 80, 2015, 30, t(6, 7, 7, 5, 6, 6), { latentCeiling: 85 }),
];

/** West Ham, 2013–14 — home of Ravel Morrison, the ultimate what-might-have-been.
 *  A 2013 United user can sign him back and try to unlock the talent that left
 *  Old Trafford in 2012 (latent 90 — but a near-hopeless temperament to reach). */
export const WESTHAM_2013: CuratedSeed[] = [
  q('west_ham', 'ravel', 'Ravel Morrison', 1993, 'England', ['AM', 'CM'], 71, 78, 2016, 35, t(3, 8, 7, 4, 8, 6), { latentCeiling: 90 }),
  q('west_ham', 'noble', 'Mark Noble', 1987, 'England', ['CM', 'DM'], 78, 79, 2016, 25, t(9, 5, 8, 10, 4, 6)),
  q('west_ham', 'nolan', 'Kevin Nolan', 1982, 'England', ['CM', 'AM'], 76, 77, 2015, 30, t(8, 6, 8, 8, 4, 6)),
  q('west_ham', 'jaaskelainen13', 'Jussi Jääskeläinen', 1975, 'Finland', ['GK'], 72, 72, 2015, 20, t(9, 4, 5, 8, 3, 7)),
  q('west_ham', 'adrian13', 'Adrián', 1987, 'Spain', ['GK'], 73, 80, 2016, 20, t(7, 6, 7, 6, 5, 6)),
  q('west_ham', 'reid13', 'Winston Reid', 1988, 'New Zealand', ['CB'], 76, 80, 2015, 35, t(8, 5, 7, 7, 3, 7)),
  q('west_ham', 'jcollins13', 'James Collins', 1983, 'Wales', ['CB'], 73, 74, 2016, 45, t(7, 5, 6, 8, 5, 6)),
  q('west_ham', 'demel13', 'Guy Demel', 1981, 'Ivory Coast', ['RB', 'CB'], 72, 73, 2015, 55, t(6, 6, 5, 6, 6, 6)),
  q('west_ham', 'rat13', 'Răzvan Raț', 1981, 'Romania', ['LB'], 72, 73, 2015, 40, t(7, 5, 5, 6, 5, 5)),
  q('west_ham', 'tomkins13', 'James Tomkins', 1989, 'England', ['CB'], 72, 78, 2016, 40, t(7, 5, 6, 8, 5, 6)),
  q('west_ham', 'diame13', 'Mohamed Diamé', 1987, 'Senegal', ['CM', 'AM'], 76, 78, 2016, 45, t(6, 7, 7, 5, 6, 6)),
  q('west_ham', 'downing13', 'Stewart Downing', 1984, 'England', ['LW', 'AM', 'RW'], 74, 76, 2016, 25, t(8, 5, 6, 7, 4, 7)),
  q('west_ham', 'jarvis13', 'Matt Jarvis', 1986, 'England', ['LW', 'RW'], 72, 74, 2017, 35, t(7, 5, 6, 7, 5, 6)),
  q('west_ham', 'ccole13', 'Carlton Cole', 1983, 'England', ['ST'], 70, 71, 2015, 45, t(6, 5, 5, 8, 5, 6)),
  q('west_ham', 'maiga13', 'Modibo Maïga', 1987, 'Mali', ['ST'], 68, 72, 2016, 40, t(6, 6, 6, 5, 6, 5)),
  q('west_ham', 'joecole13', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 70, 72, 2015, 70, t(7, 6, 6, 7, 5, 6)),
  // Carroll — a physically dominant target man when fit, but the definitive
  // fragile star: a body that never let the £35m talent deliver. Latent 84.
  q('west_ham', 'carroll13', 'Andy Carroll', 1989, 'England', ['ST'], 76, 80, 2017, 88, t(5, 7, 6, 6, 7, 5), { latentCeiling: 84 }),
];

/** Curated squads for the man-utd-2013 scenario, keyed by club. */
export const MAN_UTD_2013_SQUADS: Record<string, CuratedSeed[]> = {
  west_ham: WESTHAM_2013,
  man_utd: MAN_UTD_2013,
  man_city: MAN_CITY_2013,
  chelsea: CHELSEA_2013,
  arsenal: ARSENAL_2013,
  liverpool: LIVERPOOL_2013,
  spurs: SPURS_2013,
  everton: EVERTON_2013,
  southampton: SOUTHAMPTON_2013,
  real_madrid: REAL_MADRID_2013,
  barcelona: BARCELONA_2013,
  bayern: BAYERN_2013,
  benfica: BENFICA_2013,
  roma: ROMA_2013,
  valencia: VALENCIA_2013,
  ajax: AJAX_2013,
  psg: PSG_2013,
  juventus: JUVENTUS_2013,
  milan: MILAN_2013,
};
