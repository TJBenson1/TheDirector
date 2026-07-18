/**
 * Curated real players — 2003–04 La Liga pack (§4, §17.10).
 *
 * The vertical slice for barcelona-2003: Rijkaard's Barça and the arrival of
 * Ronaldinho that began the revival, with the peak Galácticos of Real Madrid
 * (Zidane, Ronaldo, Figo, Beckham, Raúl) the Clásico rival. Both giants curated.
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
  extra: { hardBlocks?: HardBlock[]; loyalty?: number; latentCeiling?: number; archetype?: string } = {},
): CuratedSeed {
  return { id: `cur_${id}`, name, birthYear, nationality, positions, club, contractUntil, ability, potentialCeiling, personality, injuryProneness, ...extra };
}

/** Barcelona, 2003–04 — Rijkaard's first season; Ronaldinho arrives to begin the
 *  revival, with a teenage Xavi/Iniesta/Valdés core forming. */
export const BARCELONA_2003: CuratedSeed[] = [
  q('barcelona', 'valdes03', 'Víctor Valdés', 1982, 'Spain', ['GK'], 80, 85, 2008, 30, t(8, 5, 7, 9, 6, 6)),
  q('barcelona', 'rustu03', 'Rüştü Reçber', 1973, 'Turkey', ['GK'], 78, 78, 2006, 32, t(7, 5, 6, 6, 5, 5)),
  q('barcelona', 'reiziger03', 'Michael Reiziger', 1973, 'Netherlands', ['RB', 'CB'], 79, 79, 2005, 35, t(8, 4, 6, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('barcelona', 'puyol03', 'Carles Puyol', 1978, 'Spain', ['CB', 'RB'], 83, 84, 2008, 28, t(10, 3, 9, 10, 4, 6), { archetype: 'covering-cb' }),
  q('barcelona', 'marquez03', 'Rafael Márquez', 1979, 'Mexico', ['CB', 'DM'], 82, 84, 2008, 33, t(7, 6, 7, 7, 6, 7)),
  q('barcelona', 'cocu03', 'Phillip Cocu', 1970, 'Netherlands', ['DM', 'CM'], 81, 81, 2006, 30, t(9, 4, 7, 8, 3, 8), { archetype: 'deep-playmaker' }),
  q('barcelona', 'navarro03', 'Fernando Navarro', 1982, 'Spain', ['LB'], 74, 78, 2007, 32, t(7, 4, 6, 8, 4, 6)),
  q('barcelona', 'xavi03', 'Xavi Hernández', 1980, 'Spain', ['CM', 'DM'], 83, 88, 2008, 30, t(9, 3, 8, 10, 3, 7), { archetype: 'deep-playmaker' }),
  q('barcelona', 'luisenrique03', 'Luis Enrique', 1970, 'Spain', ['CM', 'RW', 'AM'], 80, 80, 2005, 40, t(9, 5, 9, 9, 6, 7)),
  q('barcelona', 'ronaldinho03', 'Ronaldinho', 1980, 'Brazil', ['LW', 'AM'], 88, 91, 2008, 32, t(6, 6, 8, 6, 5, 8), { archetype: 'inside-forward' }),
  // Quaresma — the dazzling trickster who never fulfilled his gift; a high-ego lost
  // talent traded away that very summer for Deco (latent 85).
  q('barcelona', 'quaresma03', 'Ricardo Quaresma', 1983, 'Portugal', ['RW', 'LW'], 74, 85, 2008, 30, t(5, 8, 7, 5, 7, 5), { archetype: 'inside-forward', latentCeiling: 85 }),
  q('barcelona', 'overmars03', 'Marc Overmars', 1973, 'Netherlands', ['LW'], 80, 80, 2005, 42, t(8, 5, 7, 6, 4, 7)),
  // Iniesta — a 19-year-old about to become one of the greatest midfielders ever.
  q('barcelona', 'iniesta03', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 70, 90, 2009, 35, t(9, 2, 7, 10, 2, 7), { archetype: 'playmaker' }),
  q('barcelona', 'kluivert03', 'Patrick Kluivert', 1976, 'Netherlands', ['ST'], 84, 84, 2006, 38, t(6, 7, 6, 6, 6, 6), { archetype: 'poacher' }),
  q('barcelona', 'saviola03', 'Javier Saviola', 1981, 'Argentina', ['ST'], 82, 85, 2007, 30, t(8, 5, 8, 7, 4, 7), { archetype: 'poacher' }),
  q('barcelona', 'davids03', 'Edgar Davids', 1973, 'Netherlands', ['DM', 'CM'], 82, 82, 2005, 34, t(8, 7, 8, 6, 7, 7)),
];

/** Real Madrid, 2003–04 — the peak Galácticos: Zidane, Ronaldo, Figo, Beckham and
 *  Raúl, unbalanced by the sale of Makélélé. The Clásico rival. */
export const REAL_MADRID_2003: CuratedSeed[] = [
  q('real_madrid', 'casillas03', 'Iker Casillas', 1981, 'Spain', ['GK'], 86, 90, 2008, 25, t(9, 4, 8, 9, 3, 7)),
  q('real_madrid', 'cesar03', 'César Sánchez', 1971, 'Spain', ['GK'], 76, 77, 2006, 30, t(8, 5, 6, 6, 4, 7)),
  q('real_madrid', 'salgado03', 'Míchel Salgado', 1975, 'Spain', ['RB'], 79, 80, 2006, 35, t(8, 6, 8, 7, 6, 7)),
  q('real_madrid', 'robertocarlos03', 'Roberto Carlos', 1973, 'Brazil', ['LB'], 85, 86, 2007, 30, t(8, 7, 8, 7, 5, 8), { archetype: 'full-back-attacking' }),
  q('real_madrid', 'raulbravo03', 'Raúl Bravo', 1981, 'Spain', ['LB', 'CB'], 74, 78, 2007, 30, t(6, 5, 6, 6, 6, 6)),
  q('real_madrid', 'helguera03', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 80, 81, 2007, 30, t(8, 6, 8, 7, 6, 7)),
  q('real_madrid', 'pavon03', 'Francisco Pavón', 1980, 'Spain', ['CB'], 74, 78, 2007, 30, t(8, 4, 7, 8, 4, 6), { archetype: 'covering-cb' }),
  q('real_madrid', 'mejia03', 'Álvaro Mejía', 1982, 'Spain', ['CB'], 73, 79, 2006, 35, t(7, 4, 6, 7, 4, 6)),
  q('real_madrid', 'cambiasso03', 'Esteban Cambiasso', 1980, 'Argentina', ['DM', 'CM'], 79, 85, 2005, 25, t(9, 4, 8, 7, 3, 7), { archetype: 'deep-playmaker' }),
  q('real_madrid', 'guti03', 'Guti', 1976, 'Spain', ['AM', 'CM'], 80, 83, 2008, 30, t(6, 7, 7, 8, 7, 6), { archetype: 'playmaker' }),
  q('real_madrid', 'beckham03', 'David Beckham', 1975, 'England', ['RW', 'CM'], 84, 85, 2007, 30, t(9, 7, 9, 7, 4, 7), { archetype: 'inside-forward' }),
  q('real_madrid', 'zidane03', 'Zinedine Zidane', 1972, 'France', ['AM'], 92, 93, 2007, 30, t(9, 6, 9, 7, 4, 8), { archetype: 'playmaker' }),
  q('real_madrid', 'figo03', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 87, 88, 2005, 30, t(8, 7, 9, 6, 5, 7), { archetype: 'inside-forward' }),
  q('real_madrid', 'solari03', 'Santiago Solari', 1976, 'Argentina', ['LW', 'AM'], 78, 80, 2006, 30, t(8, 5, 7, 7, 4, 7)),
  q('real_madrid', 'raul03', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 86, 87, 2008, 30, t(9, 7, 9, 9, 4, 7), { archetype: 'inside-forward' }),
  q('real_madrid', 'ronaldo03', 'Ronaldo', 1976, 'Brazil', ['ST'], 90, 91, 2007, 50, t(6, 8, 8, 5, 6, 7), { archetype: 'poacher' }),
  q('real_madrid', 'portillo03', 'Javier Portillo', 1982, 'Spain', ['ST'], 74, 80, 2007, 35, t(7, 6, 7, 7, 5, 6), { archetype: 'poacher' }),
];

/** Chelsea, 2003–04 — Abramovich's first, splurge season: the old guard (Terry,
 *  Lampard, Gudjohnsen) plus the summer's statement buys (Makélélé, Verón, Crespo,
 *  Duff, Cole, Mutu). The Roman Empire begins. */
export const CHELSEA_2003: CuratedSeed[] = [
  q('chelsea', 'cudicini03c', 'Carlo Cudicini', 1973, 'Italy', ['GK'], 82, 83, 2007, 25, t(8, 5, 7, 8, 4, 7)),
  q('chelsea', 'sullivan03c', 'Neil Sullivan', 1970, 'Scotland', ['GK'], 75, 75, 2006, 25, t(7, 4, 6, 7, 4, 6)),
  q('chelsea', 'gjohnson03c', 'Glen Johnson', 1984, 'England', ['RB'], 76, 85, 2008, 30, t(6, 6, 7, 6, 5, 7), { archetype: 'full-back-attacking' }),
  q('chelsea', 'melchiot03c', 'Mario Melchiot', 1976, 'Netherlands', ['RB'], 78, 79, 2006, 30, t(7, 5, 7, 6, 4, 7)),
  q('chelsea', 'terry03c', 'John Terry', 1980, 'England', ['CB'], 84, 90, 2008, 30, t(8, 7, 9, 9, 6, 6), { archetype: 'covering-cb' }),
  q('chelsea', 'desailly03c', 'Marcel Desailly', 1968, 'France', ['CB'], 82, 82, 2004, 30, t(9, 6, 8, 7, 4, 7), { archetype: 'covering-cb' }),
  q('chelsea', 'gallas03c', 'William Gallas', 1977, 'France', ['CB', 'LB'], 82, 85, 2007, 28, t(7, 6, 8, 6, 6, 7), { archetype: 'covering-cb' }),
  q('chelsea', 'bridge03c', 'Wayne Bridge', 1980, 'England', ['LB'], 78, 82, 2008, 35, t(8, 5, 7, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('chelsea', 'babayaro03c', 'Celestine Babayaro', 1978, 'Nigeria', ['LB'], 74, 78, 2005, 40, t(6, 6, 6, 6, 6, 6)),
  q('chelsea', 'makelele03c', 'Claude Makélélé', 1973, 'France', ['DM'], 85, 86, 2007, 20, t(9, 4, 8, 7, 3, 8), { archetype: 'deep-playmaker' }),
  q('chelsea', 'lampard03c', 'Frank Lampard', 1978, 'England', ['CM'], 84, 89, 2008, 15, t(9, 6, 9, 9, 4, 8), { archetype: 'playmaker' }),
  q('chelsea', 'veron03c', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM', 'AM'], 82, 86, 2007, 40, t(7, 7, 8, 5, 6, 6), { archetype: 'playmaker' }),
  q('chelsea', 'geremi03c', 'Geremi', 1978, 'Cameroon', ['RW', 'RB'], 78, 80, 2007, 30, t(7, 5, 7, 6, 5, 7)),
  q('chelsea', 'parker03c', 'Scott Parker', 1980, 'England', ['CM', 'DM'], 77, 83, 2008, 30, t(8, 5, 8, 7, 5, 7), { archetype: 'deep-playmaker' }),
  q('chelsea', 'duff03c', 'Damien Duff', 1979, 'Ireland', ['LW'], 82, 84, 2008, 35, t(8, 5, 7, 7, 4, 7), { archetype: 'inside-forward' }),
  q('chelsea', 'joecole03c', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 80, 85, 2008, 35, t(6, 7, 7, 6, 6, 7), { archetype: 'playmaker' }),
  q('chelsea', 'gudjohnsen03c', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 81, 83, 2007, 30, t(8, 6, 7, 7, 5, 7), { archetype: 'poacher' }),
  q('chelsea', 'crespo03c', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 84, 85, 2007, 40, t(7, 7, 8, 5, 6, 6), { archetype: 'poacher' }),
  q('chelsea', 'hasselbaink03c', 'Jimmy Floyd Hasselbaink', 1972, 'Netherlands', ['ST'], 82, 82, 2005, 35, t(7, 7, 8, 6, 6, 6), { archetype: 'poacher' }),
  q('chelsea', 'mutu03c', 'Adrian Mutu', 1979, 'Romania', ['ST', 'AM'], 80, 85, 2008, 35, t(4, 8, 7, 5, 8, 6), { archetype: 'poacher', latentCeiling: 85 }),
];

/** Arsenal, 2003–04 — the Invincibles, the unbeaten champions. Chelsea's title
 *  rival and the era's benchmark side. */
export const ARSENAL_2003: CuratedSeed[] = [
  q('arsenal', 'lehmann03a', 'Jens Lehmann', 1969, 'Germany', ['GK'], 83, 83, 2007, 25, t(7, 7, 8, 7, 7, 6)),
  q('arsenal', 'lauren03a', 'Lauren', 1977, 'Cameroon', ['RB'], 80, 81, 2007, 30, t(8, 5, 8, 7, 5, 7), { archetype: 'full-back-attacking' }),
  q('arsenal', 'kolotoure03a', 'Kolo Touré', 1981, 'Ivory Coast', ['CB'], 82, 85, 2008, 25, t(8, 6, 8, 7, 5, 7), { archetype: 'covering-cb' }),
  q('arsenal', 'campbell03a', 'Sol Campbell', 1974, 'England', ['CB'], 85, 86, 2007, 25, t(8, 6, 8, 7, 4, 6), { archetype: 'covering-cb' }),
  q('arsenal', 'acole03a', 'Ashley Cole', 1980, 'England', ['LB'], 84, 88, 2008, 25, t(7, 7, 8, 5, 6, 7), { archetype: 'full-back-attacking' }),
  q('arsenal', 'cygan03a', 'Pascal Cygan', 1974, 'France', ['CB'], 74, 75, 2006, 30, t(7, 4, 6, 7, 5, 6)),
  q('arsenal', 'vieira03a', 'Patrick Vieira', 1976, 'France', ['CM', 'DM'], 88, 89, 2007, 25, t(8, 7, 9, 6, 6, 7), { archetype: 'deep-playmaker' }),
  q('arsenal', 'gilberto03a', 'Gilberto Silva', 1976, 'Brazil', ['DM'], 82, 84, 2008, 25, t(9, 4, 8, 7, 4, 7), { archetype: 'deep-playmaker' }),
  q('arsenal', 'pires03a', 'Robert Pirès', 1973, 'France', ['LW', 'AM'], 86, 87, 2006, 30, t(8, 5, 8, 7, 3, 7), { archetype: 'inside-forward' }),
  q('arsenal', 'ljungberg03a', 'Fredrik Ljungberg', 1977, 'Sweden', ['RW', 'AM'], 83, 85, 2007, 35, t(8, 6, 8, 7, 4, 7), { archetype: 'inside-forward' }),
  q('arsenal', 'edu03a', 'Edu', 1978, 'Brazil', ['CM'], 79, 81, 2005, 30, t(8, 5, 7, 6, 5, 7)),
  q('arsenal', 'parlour03a', 'Ray Parlour', 1973, 'England', ['CM'], 78, 78, 2004, 30, t(8, 5, 7, 8, 5, 6)),
  q('arsenal', 'reyes03a', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'ST'], 80, 86, 2008, 35, t(6, 6, 7, 5, 7, 5), { archetype: 'inside-forward' }),
  q('arsenal', 'henry03a', 'Thierry Henry', 1977, 'France', ['ST', 'LW'], 90, 92, 2007, 25, t(9, 7, 9, 8, 4, 8), { archetype: 'poacher' }),
  q('arsenal', 'bergkamp03a', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 85, 86, 2006, 25, t(9, 6, 8, 8, 3, 6), { archetype: 'playmaker' }),
  q('arsenal', 'wiltord03a', 'Sylvain Wiltord', 1974, 'France', ['ST', 'RW'], 80, 82, 2005, 30, t(7, 6, 7, 6, 5, 7), { archetype: 'poacher' }),
  q('arsenal', 'kanu03a', 'Nwankwo Kanu', 1976, 'Nigeria', ['ST'], 79, 81, 2004, 30, t(7, 6, 7, 6, 6, 7), { archetype: 'poacher' }),
];

/** Manchester United, 2003–04 — Ferguson rebuilding around a teenage Cristiano
 *  Ronaldo, with Van Nistelrooy's goals and Keane's engine. */
export const MAN_UTD_2003: CuratedSeed[] = [
  q('man_utd', 'howard03m', 'Tim Howard', 1979, 'United States', ['GK'], 79, 84, 2007, 25, t(7, 6, 7, 7, 5, 7)),
  q('man_utd', 'carroll03m', 'Roy Carroll', 1977, 'N. Ireland', ['GK'], 74, 76, 2005, 30, t(6, 5, 6, 6, 6, 6)),
  q('man_utd', 'gneville03m', 'Gary Neville', 1975, 'England', ['RB'], 82, 83, 2007, 25, t(9, 5, 8, 10, 4, 7), { archetype: 'full-back-attacking' }),
  q('man_utd', 'ferdinand03m', 'Rio Ferdinand', 1978, 'England', ['CB'], 86, 89, 2008, 25, t(7, 6, 8, 7, 5, 7), { archetype: 'ball-playing-cb' }),
  q('man_utd', 'silvestre03m', 'Mikael Silvestre', 1977, 'France', ['CB', 'LB'], 80, 82, 2008, 28, t(7, 5, 7, 6, 4, 8)),
  q('man_utd', 'oshea03m', 'John O\'Shea', 1981, 'Ireland', ['RB', 'CB'], 77, 82, 2008, 25, t(8, 5, 7, 8, 4, 7)),
  q('man_utd', 'wbrown03m', 'Wes Brown', 1979, 'England', ['CB'], 78, 82, 2007, 40, t(8, 4, 7, 9, 5, 6), { archetype: 'covering-cb' }),
  q('man_utd', 'pneville03m', 'Phil Neville', 1977, 'England', ['LB', 'CM'], 78, 80, 2007, 25, t(8, 4, 7, 9, 4, 7)),
  q('man_utd', 'keane03m', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 87, 88, 2006, 45, t(9, 8, 10, 8, 8, 6), { archetype: 'deep-playmaker' }),
  q('man_utd', 'scholes03m', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 86, 88, 2007, 30, t(9, 5, 8, 10, 5, 7), { archetype: 'playmaker' }),
  q('man_utd', 'giggs03m', 'Ryan Giggs', 1973, 'Wales', ['LW'], 85, 86, 2008, 25, t(9, 6, 8, 10, 4, 8), { archetype: 'inside-forward' }),
  q('man_utd', 'butt03m', 'Nicky Butt', 1975, 'England', ['CM', 'DM'], 78, 80, 2005, 30, t(8, 5, 7, 8, 5, 6)),
  q('man_utd', 'kleberson03m', 'Kléberson', 1979, 'Brazil', ['CM', 'DM'], 76, 82, 2007, 35, t(6, 5, 6, 6, 6, 5)),
  q('man_utd', 'fortune03m', 'Quinton Fortune', 1977, 'South Africa', ['LB', 'CM'], 74, 76, 2006, 40, t(7, 5, 6, 7, 5, 6)),
  // Ronaldo — the 18-year-old who arrived that summer; a reality-rail talent whose
  // ceiling the user can help unlock early.
  q('man_utd', 'ronaldo03m', 'Cristiano Ronaldo', 1985, 'Portugal', ['RW', 'LW'], 76, 95, 2008, 25, t(9, 9, 10, 7, 5, 8), { archetype: 'inside-forward' }),
  q('man_utd', 'vannistelrooy03m', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 88, 89, 2007, 30, t(8, 7, 9, 7, 5, 7), { archetype: 'poacher' }),
  q('man_utd', 'solskjaer03m', 'Ole Gunnar Solskjær', 1973, 'Norway', ['ST'], 81, 82, 2006, 45, t(9, 5, 8, 10, 4, 7), { archetype: 'poacher' }),
  q('man_utd', 'forlan03m', 'Diego Forlán', 1979, 'Uruguay', ['ST'], 77, 85, 2007, 25, t(8, 6, 8, 6, 5, 7), { archetype: 'poacher', latentCeiling: 85 }),
  q('man_utd', 'saha03m', 'Louis Saha', 1978, 'France', ['ST'], 81, 85, 2008, 55, t(7, 6, 7, 6, 5, 7), { archetype: 'poacher' }),
];

/** Curated squads for the barcelona-2003 start — Barça and the Galácticos both real. */
/** Deportivo La Coruña, 2003–04 — "Super Depor" at their European peak: Champions
 *  League quarter-final 4-0 demolition of Milan, Valerón the artist, Mauro Silva and
 *  Fran the veterans, Pandiani signed to replace the departed Makaay. */
export const DEPORTIVO_2003: CuratedSeed[] = [
  q('deportivo', 'molina03', 'José Molina', 1970, 'Spain', ['GK'], 80, 80, 2006, 25, t(8, 5, 6, 8, 3, 7)),
  q('deportivo', 'munua03', 'Gustavo Munúa', 1978, 'Uruguay', ['GK'], 74, 78, 2007, 25, t(7, 5, 7, 6, 4, 7)),
  q('deportivo', 'songoo03', "Jacques Songo'o", 1964, 'Cameroon', ['GK'], 71, 71, 2004, 25, t(8, 4, 5, 8, 3, 6)),
  q('deportivo', 'manuelpablo03', 'Manuel Pablo', 1976, 'Spain', ['RB'], 79, 80, 2007, 40, t(8, 4, 7, 10, 3, 7), { archetype: 'full-back-attacking' }),
  q('deportivo', 'scaloni03', 'Lionel Scaloni', 1978, 'Argentina', ['RB'], 77, 79, 2006, 30, t(8, 5, 8, 7, 4, 8)),
  q('deportivo', 'capdevila03', 'Joan Capdevila', 1978, 'Spain', ['LB'], 79, 82, 2007, 25, t(8, 4, 7, 7, 4, 8), { archetype: 'full-back-attacking' }),
  q('deportivo', 'romero03d', 'Enrique Romero', 1972, 'Spain', ['LB'], 74, 74, 2005, 30, t(7, 4, 6, 7, 4, 7)),
  q('deportivo', 'naybet03', 'Noureddine Naybet', 1970, 'Morocco', ['CB'], 82, 82, 2005, 30, t(9, 5, 7, 8, 3, 7), { archetype: 'covering-cb', loyalty: 88 }),
  q('deportivo', 'andrade03', 'Jorge Andrade', 1978, 'Portugal', ['CB'], 80, 83, 2006, 30, t(8, 5, 7, 7, 4, 7), { archetype: 'covering-cb' }),
  q('deportivo', 'cesarmartin03', 'César Martín', 1977, 'Spain', ['CB'], 77, 79, 2007, 30, t(8, 4, 6, 7, 4, 7), { archetype: 'covering-cb' }),
  q('deportivo', 'hector03', 'Héctor', 1980, 'Spain', ['CB'], 72, 78, 2007, 30, t(7, 4, 7, 7, 4, 7)),
  q('deportivo', 'maurosilva03', 'Mauro Silva', 1968, 'Brazil', ['DM'], 82, 82, 2005, 25, t(9, 3, 6, 10, 2, 8), { archetype: 'destroyer', loyalty: 90 }),
  q('deportivo', 'duscher03', 'Aldo Duscher', 1979, 'Argentina', ['DM', 'CM'], 79, 81, 2007, 30, t(7, 6, 8, 6, 6, 7), { archetype: 'destroyer' }),
  q('deportivo', 'sergiog03', 'Sergio', 1976, 'Spain', ['CM'], 79, 80, 2006, 30, t(8, 5, 7, 7, 4, 7)),
  q('deportivo', 'fran03', 'Fran', 1969, 'Spain', ['CM', 'AM'], 79, 79, 2005, 30, t(8, 4, 6, 10, 3, 7), { loyalty: 92 }),
  q('deportivo', 'victorsanchez03', 'Víctor Sánchez', 1976, 'Spain', ['RW', 'AM'], 77, 79, 2006, 30, t(7, 5, 7, 7, 5, 7)),
  q('deportivo', 'munitis03', 'Pedro Munitis', 1975, 'Spain', ['RW', 'AM'], 78, 80, 2006, 30, t(7, 5, 7, 6, 5, 7)),
  // Valerón — the sublime playmaker, the artist at the heart of Super Depor.
  q('deportivo', 'valeron03', 'Juan Carlos Valerón', 1975, 'Spain', ['AM'], 85, 87, 2007, 45, t(9, 4, 7, 9, 3, 8), { archetype: 'playmaker', latentCeiling: 88 }),
  q('deportivo', 'tristan03', 'Diego Tristán', 1976, 'Spain', ['ST'], 83, 84, 2006, 40, t(6, 7, 7, 6, 6, 6), { archetype: 'poacher' }),
  q('deportivo', 'luque03', 'Albert Luque', 1978, 'Spain', ['LW', 'ST'], 81, 83, 2006, 35, t(7, 6, 7, 6, 6, 7), { archetype: 'inside-forward' }),
  // Pandiani — the €7.2m Makaay replacement who top-scored with 19 and downed Milan.
  q('deportivo', 'pandiani03', 'Walter Pandiani', 1976, 'Uruguay', ['ST'], 80, 81, 2006, 35, t(7, 6, 8, 6, 5, 7), { archetype: 'poacher' }),
];

/** Valencia CF, 2003–04 — Rafa Benítez's La Liga + UEFA Cup DOUBLE winners: the
 *  Albelda–Baraja engine, Aimar and Vicente the flair, Mista's 19 goals, marshalled by
 *  Cañizares and captain Ayala. One of the great modern non-giant sides. */
export const VALENCIA_2003: CuratedSeed[] = [
  q('valencia', 'canizares03', 'Santiago Cañizares', 1969, 'Spain', ['GK'], 84, 84, 2007, 25, t(8, 6, 7, 8, 5, 7)),
  q('valencia', 'palop03', 'Andrés Palop', 1973, 'Spain', ['GK'], 74, 78, 2005, 25, t(8, 5, 6, 7, 4, 7)),
  q('valencia', 'rangel03', 'David Rangel', 1979, 'Spain', ['GK'], 68, 72, 2006, 25, t(7, 4, 6, 7, 4, 6)),
  q('valencia', 'currotorres03', 'Curro Torres', 1976, 'Spain', ['RB'], 78, 79, 2006, 30, t(8, 4, 7, 8, 3, 7)),
  // Ayala — the captain and defensive rock of the double-winning side.
  q('valencia', 'ayala03', 'Roberto Ayala', 1973, 'Argentina', ['CB'], 85, 85, 2007, 25, t(9, 5, 8, 8, 4, 7), { archetype: 'covering-cb', loyalty: 88 }),
  q('valencia', 'marchena03', 'Carlos Marchena', 1979, 'Spain', ['CB', 'DM'], 80, 82, 2007, 25, t(8, 5, 7, 7, 4, 7), { archetype: 'covering-cb' }),
  q('valencia', 'pellegrino03', 'Mauricio Pellegrino', 1971, 'Argentina', ['CB'], 80, 80, 2004, 25, t(9, 4, 7, 8, 3, 7), { archetype: 'covering-cb' }),
  q('valencia', 'davidnavarro03', 'David Navarro', 1980, 'Spain', ['CB'], 74, 78, 2007, 30, t(7, 5, 6, 7, 5, 6), { archetype: 'covering-cb' }),
  q('valencia', 'carboni03', 'Amedeo Carboni', 1965, 'Italy', ['LB'], 76, 76, 2005, 25, t(8, 5, 7, 8, 3, 8), { archetype: 'full-back-attacking' }),
  q('valencia', 'fabioaurelio03', 'Fábio Aurélio', 1979, 'Brazil', ['LB'], 76, 80, 2006, 55, t(8, 4, 7, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('valencia', 'albelda03', 'David Albelda', 1977, 'Spain', ['DM'], 83, 84, 2008, 30, t(9, 5, 8, 10, 5, 7), { archetype: 'destroyer', loyalty: 90 }),
  q('valencia', 'baraja03', 'Rubén Baraja', 1975, 'Spain', ['CM'], 84, 85, 2007, 30, t(8, 6, 9, 8, 5, 7), { archetype: 'deep-playmaker' }),
  // Sissoko — the teenage engine signed on a free, a future Liverpool midfielder.
  q('valencia', 'sissoko03', 'Mohamed Sissoko', 1985, 'Mali', ['DM', 'CM'], 70, 84, 2007, 30, t(7, 5, 8, 6, 5, 7), { archetype: 'destroyer', latentCeiling: 85 }),
  q('valencia', 'jorgelopez03', 'Jorge López', 1978, 'Spain', ['RW'], 76, 78, 2006, 30, t(7, 5, 7, 7, 5, 7)),
  q('valencia', 'rufete03', 'Francisco Rufete', 1976, 'Spain', ['RW'], 78, 79, 2006, 30, t(8, 5, 7, 7, 4, 7)),
  // Aimar — the little playmaker Maradona called his favourite; Valencia's spark.
  q('valencia', 'aimar03', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 84, 87, 2006, 45, t(8, 5, 7, 7, 4, 8), { archetype: 'playmaker', latentCeiling: 87 }),
  // Vicente — the electric left winger; scored the opening penalty in the UEFA Cup final.
  q('valencia', 'vicente03', 'Vicente', 1981, 'Spain', ['LW'], 84, 87, 2007, 50, t(7, 6, 8, 7, 5, 7), { archetype: 'inside-forward', latentCeiling: 88 }),
  q('valencia', 'angulo03', 'Miguel Ángel Angulo', 1977, 'Spain', ['RW', 'ST'], 76, 78, 2006, 30, t(8, 4, 6, 8, 4, 7)),
  q('valencia', 'xisco03', 'Xisco Muñoz', 1980, 'Spain', ['LW'], 71, 74, 2006, 30, t(7, 5, 6, 7, 5, 7)),
  // Mista — 19 La Liga goals and a strike in the UEFA Cup final; the season's cutting edge.
  q('valencia', 'mista03', 'Mista', 1978, 'Spain', ['ST'], 82, 83, 2006, 30, t(7, 6, 8, 7, 5, 7), { archetype: 'poacher' }),
  q('valencia', 'juansanchez03', 'Juan Sánchez', 1972, 'Spain', ['ST'], 74, 75, 2005, 35, t(7, 4, 6, 7, 4, 7), { archetype: 'poacher' }),
  q('valencia', 'oliveira03', 'Ricardo Oliveira', 1980, 'Brazil', ['ST'], 78, 82, 2006, 30, t(6, 7, 7, 5, 6, 7), { archetype: 'poacher' }),
];

export const BARCELONA_2003_SQUADS: Record<string, CuratedSeed[]> = {
  barcelona: BARCELONA_2003,
  real_madrid: REAL_MADRID_2003,
  deportivo: DEPORTIVO_2003,
  valencia: VALENCIA_2003,
};

/** Curated squads for the chelsea-2003 start — the Roman Empire and its English
 *  title rivals (the Invincibles, Ferguson's United). */
export const CHELSEA_2003_SQUADS: Record<string, CuratedSeed[]> = {
  chelsea: CHELSEA_2003,
  arsenal: ARSENAL_2003,
  man_utd: MAN_UTD_2003,
};
