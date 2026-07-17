/**
 * Curated real players — 2014–15 La Liga pack (§4, §17.10).
 *
 * The vertical slice for barcelona-2014: Luis Enrique's treble winners and the
 * birth of the MSN (Messi–Suárez–Neymar), with Ancelotti's BBC Real Madrid the
 * Clásico rival. Both giants are curated. Ability/potential/personality are hidden
 * designer estimates (§7).
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

/** Barcelona, 2014–15 — Luis Enrique's treble winners; the MSN is born. */
export const BARCELONA_2014: CuratedSeed[] = [
  q('barcelona', 'terstegen14', 'Marc-André ter Stegen', 1992, 'Germany', ['GK'], 82, 89, 2019, 30, t(8, 6, 8, 7, 5, 8)),
  q('barcelona', 'bravo14', 'Claudio Bravo', 1983, 'Chile', ['GK'], 82, 82, 2017, 28, t(9, 5, 7, 8, 4, 7)),
  q('barcelona', 'alves14', 'Dani Alves', 1983, 'Brazil', ['RB'], 84, 84, 2016, 32, t(7, 8, 8, 6, 8, 8), { archetype: 'full-back-attacking' }),
  q('barcelona', 'pique14', 'Gerard Piqué', 1987, 'Spain', ['CB'], 85, 85, 2019, 30, t(7, 8, 8, 9, 7, 7)),
  q('barcelona', 'mascherano14', 'Javier Mascherano', 1984, 'Argentina', ['CB', 'DM'], 83, 83, 2018, 33, t(9, 6, 8, 9, 6, 8), { archetype: 'covering-cb' }),
  q('barcelona', 'alba14', 'Jordi Alba', 1989, 'Spain', ['LB'], 84, 85, 2020, 34, t(8, 6, 8, 8, 6, 7), { archetype: 'full-back-attacking' }),
  q('barcelona', 'mathieu14', 'Jérémy Mathieu', 1983, 'France', ['CB', 'LB'], 80, 80, 2018, 34, t(7, 5, 6, 6, 6, 7)),
  q('barcelona', 'bartra14', 'Marc Bartra', 1991, 'Spain', ['CB'], 78, 82, 2017, 30, t(7, 6, 7, 8, 6, 7)),
  q('barcelona', 'busquets14', 'Sergio Busquets', 1988, 'Spain', ['DM'], 87, 89, 2019, 28, t(9, 5, 8, 9, 4, 8), { archetype: 'deep-playmaker' }),
  q('barcelona', 'rakitic14', 'Ivan Rakitić', 1988, 'Croatia', ['CM'], 84, 84, 2019, 30, t(8, 6, 8, 7, 6, 8)),
  q('barcelona', 'xavi14', 'Xavi Hernández', 1980, 'Spain', ['CM', 'DM'], 85, 85, 2016, 33, t(10, 6, 8, 10, 4, 8), { archetype: 'deep-playmaker' }),
  q('barcelona', 'iniesta14', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 88, 88, 2018, 34, t(10, 5, 8, 10, 4, 8), { archetype: 'playmaker' }),
  q('barcelona', 'robertos14', 'Sergi Roberto', 1992, 'Spain', ['CM', 'RB'], 78, 84, 2019, 28, t(9, 5, 8, 9, 5, 9)),
  q('barcelona', 'rafinha14', 'Rafinha', 1993, 'Brazil', ['CM', 'AM'], 76, 84, 2019, 40, t(8, 6, 8, 7, 6, 8)),
  q('barcelona', 'messi14', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 94, 95, 2018, 30, t(10, 7, 9, 9, 5, 8), { archetype: 'inside-forward' }),
  q('barcelona', 'suarez14', 'Luis Suárez', 1987, 'Uruguay', ['ST'], 90, 90, 2019, 32, t(8, 8, 9, 8, 8, 8), { archetype: 'poacher' }),
  q('barcelona', 'neymar14', 'Neymar', 1992, 'Brazil', ['LW', 'ST'], 88, 92, 2018, 35, t(7, 8, 9, 7, 7, 8), { archetype: 'inside-forward' }),
  q('barcelona', 'pedro14', 'Pedro Rodríguez', 1987, 'Spain', ['RW', 'ST', 'LW'], 82, 82, 2016, 28, t(8, 5, 7, 8, 5, 8)),
  q('barcelona', 'munir14', 'Munir El Haddadi', 1995, 'Spain', ['ST', 'RW'], 76, 82, 2018, 30, t(7, 6, 8, 6, 6, 8)),
];

/** Real Madrid, 2014–15 — Ancelotti's BBC, the season after La Décima; Kroos and
 *  James arrive. The Clásico rival. */
export const REAL_MADRID_2014: CuratedSeed[] = [
  q('real_madrid', 'casillas14', 'Iker Casillas', 1981, 'Spain', ['GK'], 84, 84, 2017, 28, t(9, 5, 8, 10, 4, 8)),
  q('real_madrid', 'navas14', 'Keylor Navas', 1986, 'Costa Rica', ['GK'], 82, 84, 2018, 28, t(9, 4, 8, 7, 4, 7)),
  q('real_madrid', 'carvajal14', 'Dani Carvajal', 1992, 'Spain', ['RB'], 82, 86, 2020, 35, t(9, 5, 8, 9, 4, 8), { archetype: 'full-back-attacking' }),
  q('real_madrid', 'ramos14', 'Sergio Ramos', 1986, 'Spain', ['CB', 'DM'], 87, 87, 2017, 35, t(8, 8, 9, 10, 7, 8), { archetype: 'covering-cb' }),
  q('real_madrid', 'pepe14', 'Pepe', 1983, 'Portugal', ['CB'], 84, 84, 2017, 38, t(7, 6, 7, 9, 8, 7), { archetype: 'covering-cb' }),
  q('real_madrid', 'varane14', 'Raphaël Varane', 1993, 'France', ['CB'], 80, 90, 2020, 40, t(9, 4, 8, 7, 3, 8), { archetype: 'covering-cb' }),
  q('real_madrid', 'marcelo14', 'Marcelo', 1988, 'Brazil', ['LB'], 85, 86, 2019, 35, t(7, 6, 7, 9, 5, 8), { archetype: 'full-back-attacking' }),
  q('real_madrid', 'coentrao14', 'Fábio Coentrão', 1988, 'Portugal', ['LB'], 79, 80, 2018, 48, t(6, 6, 6, 7, 6, 6)),
  q('real_madrid', 'kroos14', 'Toni Kroos', 1990, 'Germany', ['CM', 'DM'], 87, 89, 2020, 28, t(9, 4, 8, 7, 2, 8), { archetype: 'deep-playmaker' }),
  q('real_madrid', 'modric14', 'Luka Modrić', 1985, 'Croatia', ['CM', 'DM'], 88, 88, 2018, 40, t(9, 3, 8, 8, 3, 8), { archetype: 'playmaker' }),
  q('real_madrid', 'khedira14', 'Sami Khedira', 1987, 'Germany', ['CM', 'DM'], 82, 82, 2016, 50, t(8, 5, 7, 6, 4, 7)),
  q('real_madrid', 'illarramendi14', 'Asier Illarramendi', 1990, 'Spain', ['DM', 'CM'], 77, 80, 2018, 30, t(8, 3, 7, 7, 3, 7)),
  q('real_madrid', 'isco14', 'Isco', 1992, 'Spain', ['AM', 'CM'], 82, 88, 2018, 30, t(7, 6, 8, 7, 5, 7), { archetype: 'playmaker' }),
  q('real_madrid', 'james14', 'James Rodríguez', 1991, 'Colombia', ['AM', 'LW'], 85, 89, 2020, 40, t(7, 7, 8, 6, 6, 6), { archetype: 'playmaker' }),
  q('real_madrid', 'bale14', 'Gareth Bale', 1989, 'Wales', ['RW', 'LW'], 88, 90, 2019, 50, t(8, 5, 8, 7, 4, 6), { archetype: 'inside-forward' }),
  q('real_madrid', 'cristiano14', 'Cristiano Ronaldo', 1985, 'Portugal', ['LW', 'ST'], 93, 94, 2018, 28, t(9, 9, 10, 7, 4, 7), { archetype: 'inside-forward' }),
  q('real_madrid', 'benzema14', 'Karim Benzema', 1987, 'France', ['ST'], 86, 86, 2019, 35, t(7, 6, 7, 8, 5, 7), { archetype: 'poacher' }),
  q('real_madrid', 'chicharito14', 'Javier Hernández', 1988, 'Mexico', ['ST'], 78, 79, 2016, 30, t(8, 4, 7, 6, 4, 7), { archetype: 'poacher' }),
  q('real_madrid', 'jese14', 'Jesé', 1993, 'Spain', ['RW', 'ST'], 78, 85, 2018, 45, t(7, 6, 8, 7, 6, 6)),
];

/** Curated squads for the barcelona-2014 start — Barça and Real both real. */
export const BARCELONA_2014_SQUADS: Record<string, CuratedSeed[]> = {
  barcelona: BARCELONA_2014,
  real_madrid: REAL_MADRID_2014,
};
