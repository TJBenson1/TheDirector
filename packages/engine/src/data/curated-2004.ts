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
  extra: { hardBlocks?: HardBlock[]; loyalty?: number; latentCeiling?: number } = {},
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
  // Reyes — dazzled at 20, then faded under pressure. A flaky (low-prof, volatile)
  // lost talent: centre him and he MIGHT become the star Highbury dreamed of.
  q('arsenal', 'reyes', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'ST'], 80, 86, 2008, 35, t(6, 7, 7, 6, 7, 6), { latentCeiling: 90 }),
  q('arsenal', 'fabregas', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 68, 90, 2008, 20, t(9, 6, 9, 7, 3, 8)),
  q('arsenal', 'rvp', 'Robin van Persie', 1983, 'Netherlands', ['ST', 'LW'], 74, 90, 2009, 55, t(6, 7, 8, 6, 6, 7)),
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
  q('marseille', 'nasri', 'Samir Nasri', 1987, 'France', ['AM', 'LW'], 76, 85, 2008, 30, t(6, 7, 7, 6, 6, 7)),
];
export const PSV_2004: CuratedSeed[] = [
  q('psv', 'robben2', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 83, 89, 2008, 64, t(8, 7, 9, 6, 5, 7)),
  q('psv', 'park', 'Park Ji-sung', 1981, 'South Korea', ['RW', 'CM'], 78, 82, 2005, 30, t(9, 4, 8, 8, 3, 8)),
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
  // Ledley King — a world-class defender on one good knee; managed right, the
  // Rio-level career the injuries denied him.
  q('spurs', 'king', 'Ledley King', 1980, 'England', ['CB', 'DM'], 84, 87, 2008, 70, t(8, 5, 8, 9, 4, 7), { latentCeiling: 90 }),
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

/**
 * Real 2005–08 arrivals at their SOURCE clubs, so the reality-default ledger can
 * reproduce the rebuilds that kept the giants on top — United's especially. They
 * execute as reality unless a butterfly diverts them.
 */
export const SPARTAK_2004: CuratedSeed[] = [
  q('spartak_moscow', 'vidic', 'Nemanja Vidić', 1981, 'Serbia', ['CB'], 82, 87, 2010, 40, t(9, 6, 9, 8, 5, 6)),
];
export const MONACO_2004: CuratedSeed[] = [
  q('monaco', 'evra', 'Patrice Evra', 1981, 'France', ['LB'], 81, 85, 2010, 25, t(8, 6, 8, 8, 5, 7)),
  q('monaco', 'adebayor', 'Emmanuel Adebayor', 1984, 'Togo', ['ST'], 79, 85, 2008, 35, t(5, 8, 7, 5, 7, 6)),
];
export const ATLETICO_2004: CuratedSeed[] = [
  q('atletico', 'torres', 'Fernando Torres', 1984, 'Spain', ['ST'], 84, 90, 2009, 40, t(8, 6, 9, 7, 5, 7)),
];
export const WESTHAM_2004: CuratedSeed[] = [
  q('west_ham', 'tevez', 'Carlos Tévez', 1984, 'Argentina', ['ST', 'AM'], 83, 88, 2008, 30, t(7, 8, 9, 6, 7, 7)),
];
/** Ballack + Hargreaves join English clubs from Bayern (curated as the source). */
export const BAYERN_2004: CuratedSeed[] = [
  q('bayern', 'ballack', 'Michael Ballack', 1976, 'Germany', ['CM', 'AM'], 85, 86, 2006, 30, t(8, 7, 9, 6, 5, 7)),
  // Owen Hargreaves — a fine midfielder whose body simply gave out. High latent
  // if a manager can somehow keep him on the pitch.
  q('bayern', 'hargreaves', 'Owen Hargreaves', 1981, 'England', ['DM', 'CM'], 82, 85, 2007, 76, t(9, 5, 8, 7, 4, 7), { latentCeiling: 88 }),
];
export const PORTO_2004: CuratedSeed[] = [
  q('porto', 'anderson_p', 'Anderson', 1988, 'Brazil', ['CM'], 76, 86, 2011, 55, t(6, 7, 7, 6, 6, 7), { latentCeiling: 89 }),
  // Quaresma — the trick that never became an end product. Flair for days, a
  // temperament that squandered it (latent 90, but a nightmare to unlock).
  q('porto', 'quaresma', 'Ricardo Quaresma', 1983, 'Portugal', ['RW'], 80, 85, 2008, 40, t(6, 8, 7, 5, 7, 6), { latentCeiling: 90 }),
];
export const SPORTING_2004: CuratedSeed[] = [
  q('sporting', 'nani', 'Nani', 1986, 'Portugal', ['RW', 'LW'], 76, 86, 2011, 35, t(6, 8, 7, 6, 7, 7)),
];

// ── Further real 2004-09 movers, curated at their source clubs ────────────────
/** Park (United '05), Berbatov (United '08 via Spurs), Shevchenko (Chelsea '06),
 *  and the Arsenal targets the user is offered (Adebayor, Rosický, Nasri, …). */
/** AC Milan, 2003–04 — the Scudetto winners: an all-time defence (Maldini,
 *  Nesta, Stam) in front of Dida, Pirlo's regista game, and a young Kaká. */
export const MILAN_2004: CuratedSeed[] = [
  q('milan', 'shevchenko2', 'Andriy Shevchenko', 1976, 'Ukraine', ['ST'], 86, 87, 2006, 30, t(8, 6, 9, 6, 4, 7)),
  q('milan', 'dida04', 'Dida', 1973, 'Brazil', ['GK'], 86, 86, 2007, 20, t(8, 5, 7, 8, 3, 7)),
  q('milan', 'cafu04', 'Cafu', 1970, 'Brazil', ['RB'], 84, 84, 2006, 25, t(8, 6, 8, 7, 3, 8)),
  q('milan', 'nesta04', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 90, 90, 2008, 45, t(9, 4, 7, 8, 3, 7)),
  q('milan', 'maldini04', 'Paolo Maldini', 1968, 'Italy', ['CB', 'LB'], 87, 87, 2006, 25, t(10, 5, 8, 10, 2, 8)),
  q('milan', 'stam04', 'Jaap Stam', 1972, 'Netherlands', ['CB'], 85, 85, 2005, 30, t(8, 5, 7, 6, 4, 7)),
  q('milan', 'kaladze04', 'Kakhaber Kaladze', 1978, 'Georgia', ['CB', 'LB'], 78, 80, 2008, 30, t(8, 5, 6, 7, 4, 7)),
  q('milan', 'serginho04', 'Serginho', 1971, 'Brazil', ['LB', 'LW'], 79, 79, 2006, 25, t(7, 5, 6, 7, 4, 7)),
  q('milan', 'costacurta04', 'Alessandro Costacurta', 1966, 'Italy', ['CB'], 76, 76, 2005, 40, t(9, 4, 6, 10, 3, 7)),
  q('milan', 'gattuso04', 'Gennaro Gattuso', 1978, 'Italy', ['CM', 'DM'], 84, 85, 2008, 25, t(8, 5, 8, 9, 7, 7)),
  q('milan', 'pirlo04', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'CM'], 85, 88, 2008, 20, t(9, 4, 7, 8, 2, 8)),
  q('milan', 'seedorf04', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 85, 85, 2008, 25, t(8, 7, 8, 7, 4, 8)),
  q('milan', 'ambrosini04', 'Massimo Ambrosini', 1977, 'Italy', ['CM'], 77, 78, 2007, 45, t(8, 4, 6, 9, 3, 7)),
  q('milan', 'ruicosta04', 'Rui Costa', 1972, 'Portugal', ['AM'], 82, 82, 2006, 30, t(8, 6, 6, 7, 4, 7)),
  q('milan', 'kaka04', 'Kaká', 1982, 'Brazil', ['AM'], 84, 93, 2008, 25, t(9, 4, 9, 8, 2, 9)),
  // Inzaghi — an elite finisher, but 2003–04 was a write-off (fractured ankle,
  // recurring muscle trouble): a fragile star, not an unfulfilled one.
  q('milan', 'inzaghi04', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 82, 82, 2007, 70, t(7, 6, 8, 8, 4, 6)),
  q('milan', 'tomasson04', 'Jon Dahl Tomasson', 1976, 'Denmark', ['ST'], 78, 78, 2005, 25, t(8, 5, 7, 6, 3, 7)),
];
/** FC Barcelona, 2004–05 — Rijkaard's first title: peak Ronaldinho and Eto'o,
 *  Xavi/Deco running it, and a 17-year-old Messi breaking through. */
export const BARCELONA_2004: CuratedSeed[] = [
  q('barcelona', 'valdes04', 'Víctor Valdés', 1982, 'Spain', ['GK'], 80, 86, 2010, 25, t(8, 5, 7, 9, 6, 7)),
  q('barcelona', 'puyol04', 'Carles Puyol', 1978, 'Spain', ['CB'], 85, 85, 2010, 35, t(10, 3, 9, 10, 3, 8)),
  q('barcelona', 'marquez04', 'Rafael Márquez', 1979, 'Mexico', ['CB', 'DM'], 82, 83, 2010, 45, t(7, 6, 7, 7, 5, 8)),
  q('barcelona', 'vanbronckhorst04', 'Giovanni van Bronckhorst', 1975, 'Netherlands', ['LB'], 79, 79, 2007, 30, t(8, 4, 7, 7, 3, 8)),
  q('barcelona', 'belletti04', 'Juliano Belletti', 1976, 'Brazil', ['RB'], 77, 77, 2008, 30, t(7, 5, 6, 6, 4, 7)),
  q('barcelona', 'oleguer04', 'Oleguer', 1980, 'Spain', ['RB', 'CB'], 73, 74, 2008, 25, t(8, 3, 6, 8, 3, 7)),
  q('barcelona', 'sylvinho04', 'Sylvinho', 1974, 'Brazil', ['LB'], 77, 77, 2007, 30, t(8, 4, 6, 7, 3, 8)),
  q('barcelona', 'edmilson04', 'Edmílson', 1976, 'Brazil', ['DM', 'CM'], 79, 79, 2008, 60, t(7, 5, 6, 6, 4, 7)),
  q('barcelona', 'xavi04', 'Xavi', 1980, 'Spain', ['CM'], 84, 88, 2010, 30, t(10, 4, 9, 10, 3, 8)),
  q('barcelona', 'deco04', 'Deco', 1977, 'Portugal', ['CM', 'AM'], 85, 85, 2008, 30, t(7, 7, 8, 6, 6, 7)),
  q('barcelona', 'iniesta04', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 76, 90, 2010, 45, t(10, 2, 8, 10, 2, 8)),
  q('barcelona', 'ronaldinho04', 'Ronaldinho', 1980, 'Brazil', ['LW', 'AM'], 90, 90, 2010, 35, t(6, 6, 7, 6, 5, 9)),
  q('barcelona', 'etoo04', "Samuel Eto'o", 1981, 'Cameroon', ['ST'], 87, 89, 2009, 40, t(8, 9, 9, 5, 8, 7)),
  q('barcelona', 'giuly04', 'Ludovic Giuly', 1976, 'France', ['RW'], 80, 80, 2008, 30, t(7, 5, 7, 6, 5, 7)),
  q('barcelona', 'larsson04', 'Henrik Larsson', 1971, 'Sweden', ['ST'], 82, 82, 2006, 45, t(9, 3, 7, 8, 2, 8)),
  q('barcelona', 'messi04', 'Lionel Messi', 1987, 'Argentina', ['RW', 'ST'], 68, 94, 2010, 55, t(9, 4, 10, 10, 3, 6)),
];

/** Real Madrid, 2004–05 — the Galácticos: Zidane, Ronaldo, Figo, Beckham, Raúl,
 *  Owen. Star-studded and top-heavy, the balance reality never quite found. */
export const REAL_MADRID_2004: CuratedSeed[] = [
  q('real_madrid', 'casillas04', 'Iker Casillas', 1981, 'Spain', ['GK'], 85, 89, 2010, 20, t(8, 4, 8, 10, 3, 7)),
  q('real_madrid', 'salgado04', 'Míchel Salgado', 1975, 'Spain', ['RB'], 80, 80, 2007, 30, t(8, 4, 6, 9, 4, 7)),
  q('real_madrid', 'robertocarlos04', 'Roberto Carlos', 1973, 'Brazil', ['LB'], 85, 85, 2008, 25, t(8, 7, 8, 8, 5, 8)),
  q('real_madrid', 'helguera04', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 81, 81, 2007, 30, t(7, 5, 6, 8, 6, 7)),
  q('real_madrid', 'samuel04', 'Walter Samuel', 1978, 'Argentina', ['CB'], 82, 83, 2009, 30, t(8, 5, 7, 7, 4, 6)),
  // Woodgate — England's brightest young centre-back, but his Madrid move was
  // wrecked by injury (no competitive minutes in 2004–05). Fragile-and-lost.
  q('real_madrid', 'woodgate04', 'Jonathan Woodgate', 1980, 'England', ['CB'], 78, 84, 2009, 82, t(7, 4, 6, 7, 5, 5), { latentCeiling: 86 }),
  q('real_madrid', 'raulbravo04', 'Raúl Bravo', 1981, 'Spain', ['LB', 'CB'], 74, 77, 2008, 30, t(6, 4, 5, 7, 5, 6)),
  q('real_madrid', 'zidane04', 'Zinedine Zidane', 1972, 'France', ['AM'], 90, 90, 2007, 25, t(9, 6, 9, 9, 4, 8)),
  q('real_madrid', 'figo04', 'Luís Figo', 1972, 'Portugal', ['RW'], 86, 86, 2007, 25, t(8, 8, 8, 6, 6, 8)),
  q('real_madrid', 'beckham04', 'David Beckham', 1975, 'England', ['CM', 'RW'], 84, 84, 2007, 20, t(9, 8, 8, 6, 4, 8)),
  q('real_madrid', 'guti04', 'Guti', 1976, 'Spain', ['AM', 'CM'], 80, 82, 2008, 25, t(6, 7, 6, 10, 7, 7)),
  q('real_madrid', 'gravesen04', 'Thomas Gravesen', 1976, 'Denmark', ['DM', 'CM'], 78, 79, 2008, 35, t(7, 6, 6, 5, 8, 6)),
  q('real_madrid', 'solari04', 'Santiago Solari', 1976, 'Argentina', ['LW', 'AM'], 77, 77, 2007, 25, t(7, 4, 6, 7, 4, 7)),
  q('real_madrid', 'ronaldo04', 'Ronaldo', 1976, 'Brazil', ['ST'], 88, 88, 2008, 60, t(6, 8, 8, 6, 6, 7)),
  q('real_madrid', 'raul04', 'Raúl', 1977, 'Spain', ['ST'], 85, 85, 2010, 30, t(9, 6, 9, 10, 4, 7)),
  q('real_madrid', 'owen04', 'Michael Owen', 1979, 'England', ['ST'], 84, 85, 2008, 45, t(8, 6, 8, 6, 4, 6)),
  // Robinho — the "next Pelé" who dazzled but never dominated. Seeded from the
  // 2004 start (he really arrived a year later, from Santos); the lost-talent
  // gamble is to make the Bernabéu wonderkid finally deliver. Latent 90.
  q('real_madrid', 'robinho04', 'Robinho', 1984, 'Brazil', ['LW', 'ST'], 74, 84, 2010, 30, t(5, 7, 7, 5, 8, 6), { latentCeiling: 90 }),
];

export const DORTMUND_2004: CuratedSeed[] = [
  q('dortmund', 'rosicky', 'Tomáš Rosický', 1980, 'Czech Republic', ['AM'], 82, 84, 2006, 45, t(8, 5, 7, 7, 4, 7)),
];
export const ZENIT_2004: CuratedSeed[] = [
  q('zenit', 'arshavin', 'Andrey Arshavin', 1981, 'Russia', ['AM', 'ST'], 83, 85, 2009, 35, t(6, 7, 8, 6, 6, 7)),
];
export const LEVERKUSEN_2004: CuratedSeed[] = [
  q('leverkusen', 'berbatov', 'Dimitar Berbatov', 1981, 'Bulgaria', ['ST'], 82, 87, 2006, 30, t(7, 7, 7, 6, 5, 7)),
];
/** Essien at his real source club — Chelsea sign him in 2005, so a rival could
 *  legitimately hijack him from Lyon in 2004 (but never FROM Chelsea). */
export const LYON_2004: CuratedSeed[] = [
  q('lyon', 'essien', 'Michael Essien', 1982, 'Ghana', ['DM', 'CM'], 82, 88, 2010, 30, t(8, 5, 9, 7, 5, 7)),
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
  spartak_moscow: SPARTAK_2004,
  monaco: MONACO_2004,
  atletico: ATLETICO_2004,
  west_ham: WESTHAM_2004,
  bayern: BAYERN_2004,
  porto: PORTO_2004,
  sporting: SPORTING_2004,
  milan: MILAN_2004,
  barcelona: BARCELONA_2004,
  real_madrid: REAL_MADRID_2004,
  dortmund: DORTMUND_2004,
  zenit: ZENIT_2004,
  leverkusen: LEVERKUSEN_2004,
  lyon: LYON_2004,
};
