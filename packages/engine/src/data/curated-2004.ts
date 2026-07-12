/**
 * Curated real players — 2004 "Invincibles" era pack (§4, §17.10).
 *
 * Vertical slice for "Arsenal build on the Invincibles": the unbeaten 2003–04
 * side plus the rivals that overtook them (Mourinho's Chelsea, Ferguson's United,
 * Benítez's Liverpool). Ability/potential/personality are HIDDEN designer
 * estimates (§7); birth years, clubs, positions, contracts are real.
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

/** Arsenal, 2003–04 — the Invincibles. */
export const ARSENAL_2004: CuratedSeed[] = [
  q('arsenal', 'lehmann', 'Jens Lehmann', 1969, 'Germany', ['GK'], 82, 83, 2007, 25, t(7, 8, 8, 7, 6, 6)),
  q('arsenal', 'lauren', 'Lauren', 1977, 'Cameroon', ['RB'], 81, 82, 2007, 30, t(8, 5, 8, 7, 4, 7)),
  q('arsenal', 'toure', 'Kolo Touré', 1981, 'Ivory Coast', ['CB'], 82, 86, 2008, 25, t(8, 5, 8, 7, 4, 7)),
  q('arsenal', 'campbell2', 'Sol Campbell', 1974, 'England', ['CB'], 85, 86, 2006, 25, t(8, 6, 8, 7, 4, 6)),
  q('arsenal', 'acole', 'Ashley Cole', 1980, 'England', ['LB'], 84, 88, 2006, 25, t(8, 6, 8, 6, 5, 7)),
  q('arsenal', 'gilberto', 'Gilberto Silva', 1976, 'Brazil', ['DM'], 82, 84, 2008, 25, t(9, 4, 8, 8, 3, 7)),
  q('arsenal', 'vieira2', 'Patrick Vieira', 1976, 'France', ['CM', 'DM'], 88, 89, 2005, 25, t(8, 7, 9, 6, 6, 7)),
  q('arsenal', 'pires2', 'Robert Pirès', 1973, 'France', ['LW', 'AM'], 86, 87, 2006, 30, t(8, 5, 8, 7, 3, 7)),
  q('arsenal', 'ljungberg', 'Fredrik Ljungberg', 1977, 'Sweden', ['RW', 'AM'], 83, 85, 2007, 35, t(8, 6, 8, 7, 4, 7)),
  q('arsenal', 'bergkamp2', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 85, 86, 2006, 25, t(9, 6, 8, 8, 3, 6)),
  q('arsenal', 'henry', 'Thierry Henry', 1977, 'France', ['ST', 'LW'], 91, 92, 2007, 25, t(9, 7, 9, 8, 4, 8), { loyalty: 88 }),
  q('arsenal', 'reyes', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'ST'], 80, 86, 2008, 35, t(6, 7, 7, 6, 7, 6)),
  q('arsenal', 'fabregas', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 68, 90, 2008, 20, t(9, 6, 9, 7, 3, 8)),
  q('arsenal', 'clichy', 'Gaël Clichy', 1985, 'France', ['LB'], 70, 84, 2008, 30, t(8, 5, 7, 7, 4, 7)),
  q('arsenal', 'edu', 'Edu', 1978, 'Brazil', ['CM'], 80, 82, 2005, 30, t(8, 5, 7, 6, 4, 7)),
];

/** Chelsea, 2004–05 — Mourinho's first title side. */
export const CHELSEA_2004: CuratedSeed[] = [
  q('chelsea', 'cech2', 'Petr Čech', 1982, 'Czech Republic', ['GK'], 85, 89, 2009, 25, t(9, 5, 8, 8, 3, 7)),
  q('chelsea', 'ferreira', 'Paulo Ferreira', 1979, 'Portugal', ['RB'], 80, 82, 2008, 25, t(8, 4, 7, 7, 4, 7)),
  q('chelsea', 'terry2', 'John Terry', 1980, 'England', ['CB'], 86, 88, 2009, 30, t(8, 7, 9, 9, 5, 6)),
  q('chelsea', 'carvalho', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 85, 86, 2009, 30, t(8, 6, 8, 7, 5, 7)),
  q('chelsea', 'gallas2', 'William Gallas', 1977, 'France', ['CB', 'LB'], 83, 85, 2008, 30, t(7, 6, 7, 5, 6, 7)),
  q('chelsea', 'bridge', 'Wayne Bridge', 1980, 'England', ['LB'], 79, 81, 2008, 35, t(7, 5, 7, 6, 4, 7)),
  q('chelsea', 'makelele2', 'Claude Makélélé', 1973, 'France', ['DM'], 85, 85, 2007, 25, t(9, 4, 8, 7, 3, 7)),
  q('chelsea', 'lampard2', 'Frank Lampard', 1978, 'England', ['CM'], 87, 88, 2008, 20, t(9, 6, 9, 8, 3, 7)),
  q('chelsea', 'essien', 'Michael Essien', 1982, 'Ghana', ['DM', 'CM'], 84, 88, 2010, 30, t(8, 5, 9, 7, 5, 7)),
  q('chelsea', 'duff', 'Damien Duff', 1979, 'Ireland', ['LW', 'RW'], 83, 84, 2008, 35, t(8, 5, 7, 7, 4, 7)),
  q('chelsea', 'cole_j', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 82, 85, 2008, 30, t(7, 6, 8, 7, 5, 7)),
  q('chelsea', 'gudjohnsen', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 82, 83, 2007, 30, t(8, 5, 7, 6, 4, 7)),
];

/**
 * Chelsea's 2004 arrivals sit at their REAL source clubs, joining via the ledger
 * — so intercepting Drogba or Robben is a traceable butterfly, and a deprived
 * Chelsea signs a genuine alternative (Eto'o, Villa) rather than being gutted.
 */
export const MARSEILLE_2004: CuratedSeed[] = [
  q('marseille', 'drogba', 'Didier Drogba', 1978, 'Ivory Coast', ['ST'], 84, 88, 2008, 30, t(8, 7, 9, 7, 5, 7)),
];
export const PSV_2004: CuratedSeed[] = [
  q('psv', 'robben2', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 83, 89, 2008, 55, t(8, 7, 9, 6, 5, 7)),
];
export const MALLORCA_2004: CuratedSeed[] = [
  q('mallorca', 'etoo', 'Samuel Eto’o', 1981, 'Cameroon', ['ST'], 84, 88, 2008, 30, t(7, 8, 9, 5, 6, 7)),
];
export const VALENCIA_2004: CuratedSeed[] = [
  q('valencia', 'villa', 'David Villa', 1981, 'Spain', ['ST'], 82, 88, 2009, 30, t(8, 6, 9, 6, 5, 7)),
  q('valencia', 'aimar', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 82, 84, 2008, 40, t(7, 6, 7, 6, 5, 7)),
  q('valencia', 'baraja', 'Rubén Baraja', 1975, 'Spain', ['CM', 'DM'], 81, 82, 2007, 30, t(8, 5, 8, 8, 4, 7)),
];

/** Manchester United, 2004–05 — rebuilding around Rooney and Ronaldo. */
export const MAN_UTD_2004: CuratedSeed[] = [
  q('man_utd', 'howard_t', 'Tim Howard', 1979, 'United States', ['GK'], 79, 82, 2007, 25, t(8, 5, 7, 7, 5, 7)),
  q('man_utd', 'gneville2', 'Gary Neville', 1975, 'England', ['RB'], 82, 83, 2008, 25, t(9, 5, 8, 10, 4, 7)),
  q('man_utd', 'ferdinand3', 'Rio Ferdinand', 1978, 'England', ['CB'], 86, 88, 2008, 30, t(8, 6, 8, 8, 5, 7)),
  q('man_utd', 'silvestre2', 'Mikael Silvestre', 1977, 'France', ['CB', 'LB'], 80, 82, 2007, 30, t(7, 5, 7, 6, 4, 7)),
  q('man_utd', 'oshea', 'John O’Shea', 1981, 'Ireland', ['RB', 'CB'], 78, 82, 2008, 25, t(8, 4, 7, 9, 4, 7)),
  q('man_utd', 'keane2', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 84, 85, 2005, 45, t(9, 8, 10, 8, 8, 6)),
  q('man_utd', 'scholes2', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 86, 87, 2007, 25, t(9, 4, 8, 10, 5, 7)),
  q('man_utd', 'giggs3', 'Ryan Giggs', 1973, 'Wales', ['LW'], 85, 86, 2008, 30, t(9, 5, 8, 10, 3, 7)),
  q('man_utd', 'cristiano2', 'Cristiano Ronaldo', 1985, 'Portugal', ['RW', 'LW'], 79, 94, 2009, 15, t(10, 8, 10, 6, 3, 9)),
  q('man_utd', 'rooney2', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 82, 91, 2010, 30, t(6, 8, 9, 7, 7, 7)),
  q('man_utd', 'vannistelrooy2', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 87, 88, 2007, 45, t(8, 6, 9, 6, 4, 7)),
  q('man_utd', 'saha', 'Louis Saha', 1978, 'France', ['ST'], 80, 84, 2008, 60, t(7, 5, 7, 6, 5, 7)),
];

/** Liverpool, 2004–05 — Benítez's Istanbul side. */
export const LIVERPOOL_2004: CuratedSeed[] = [
  q('liverpool', 'reina', 'Pepe Reina', 1982, 'Spain', ['GK'], 82, 86, 2009, 20, t(8, 5, 8, 8, 4, 7)),
  q('liverpool', 'finnan', 'Steve Finnan', 1976, 'Ireland', ['RB'], 80, 81, 2008, 25, t(8, 4, 7, 7, 3, 7)),
  q('liverpool', 'carragher2', 'Jamie Carragher', 1978, 'England', ['CB'], 84, 85, 2009, 25, t(9, 4, 8, 10, 5, 6)),
  q('liverpool', 'hyypia2', 'Sami Hyypiä', 1973, 'Finland', ['CB'], 83, 84, 2007, 20, t(9, 4, 7, 8, 3, 7)),
  q('liverpool', 'riise', 'John Arne Riise', 1980, 'Norway', ['LB', 'LW'], 80, 82, 2008, 25, t(8, 5, 7, 7, 4, 7)),
  q('liverpool', 'gerrard3', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 88, 90, 2008, 30, t(9, 7, 10, 10, 5, 7), { loyalty: 90 }),
  q('liverpool', 'alonso', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 84, 88, 2009, 25, t(9, 5, 8, 7, 3, 8)),
  q('liverpool', 'mascherano2', 'Javier Mascherano', 1984, 'Argentina', ['DM'], 82, 86, 2010, 30, t(9, 5, 9, 7, 5, 6)),
  q('liverpool', 'kewell2', 'Harry Kewell', 1978, 'Australia', ['LW'], 80, 84, 2008, 55, t(6, 6, 7, 6, 6, 7)),
  q('liverpool', 'baros', 'Milan Baroš', 1981, 'Czech Republic', ['ST'], 79, 83, 2007, 35, t(7, 6, 7, 6, 5, 7)),
  q('liverpool', 'garcia_l', 'Luis García', 1978, 'Spain', ['AM', 'RW'], 80, 82, 2008, 30, t(7, 6, 7, 6, 5, 7)),
  q('liverpool', 'crouch', 'Peter Crouch', 1981, 'England', ['ST'], 78, 81, 2008, 30, t(8, 4, 7, 7, 4, 7)),
];

/** Tottenham, 2004–05 — the rising challenger. */
export const SPURS_2004: CuratedSeed[] = [
  q('spurs', 'robinson_p', 'Paul Robinson', 1979, 'England', ['GK'], 80, 82, 2008, 25, t(7, 5, 7, 7, 5, 7)),
  q('spurs', 'king', 'Ledley King', 1980, 'England', ['CB', 'DM'], 84, 87, 2008, 55, t(8, 5, 8, 9, 4, 7)),
  q('spurs', 'carrick2', 'Michael Carrick', 1981, 'England', ['CM', 'DM'], 81, 85, 2007, 25, t(9, 4, 7, 8, 3, 7)),
  q('spurs', 'defoe2', 'Jermain Defoe', 1982, 'England', ['ST'], 79, 84, 2008, 30, t(7, 6, 8, 6, 5, 7)),
  q('spurs', 'keane_r', 'Robbie Keane', 1980, 'Ireland', ['ST', 'AM'], 81, 84, 2008, 25, t(7, 6, 8, 6, 5, 8)),
  q('spurs', 'lennon2', 'Aaron Lennon', 1987, 'England', ['RW'], 70, 82, 2009, 30, t(8, 4, 7, 7, 4, 7)),
];

/** Everton, 2004–05 — Champions-League chasers; Rooney's old club. */
export const EVERTON_2004: CuratedSeed[] = [
  q('everton', 'cahill_t', 'Tim Cahill', 1979, 'Australia', ['AM', 'CM'], 80, 83, 2008, 30, t(8, 5, 8, 7, 5, 7)),
  q('everton', 'arteta2', 'Mikel Arteta', 1982, 'Spain', ['CM', 'AM'], 80, 85, 2009, 25, t(9, 5, 7, 7, 3, 8)),
  q('everton', 'lescott', 'Joleon Lescott', 1982, 'England', ['CB', 'LB'], 78, 84, 2009, 30, t(8, 5, 8, 7, 4, 7)),
];

/** Curated squads for the arsenal-2004 scenario, keyed by club. */
export const ARSENAL_2004_SQUADS: Record<string, CuratedSeed[]> = {
  arsenal: ARSENAL_2004,
  chelsea: CHELSEA_2004,
  man_utd: MAN_UTD_2004,
  liverpool: LIVERPOOL_2004,
  spurs: SPURS_2004,
  everton: EVERTON_2004,
  marseille: MARSEILLE_2004,
  psv: PSV_2004,
  mallorca: MALLORCA_2004,
  valencia: VALENCIA_2004,
};
