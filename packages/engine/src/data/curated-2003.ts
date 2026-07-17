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

/** Curated squads for the barcelona-2003 start — Barça and the Galácticos both real. */
export const BARCELONA_2003_SQUADS: Record<string, CuratedSeed[]> = {
  barcelona: BARCELONA_2003,
  real_madrid: REAL_MADRID_2003,
};
