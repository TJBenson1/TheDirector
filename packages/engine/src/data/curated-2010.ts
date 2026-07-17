/**
 * Curated real players — 2010 Liverpool ownership-crisis pack (§4, §17.10).
 *
 * Vertical slice for "Liverpool, 2010: the ownership crisis": Roy Hodgson's side
 * at the moment Hicks & Gillett's debt drags the club to the brink. Torres and
 * Mascherano are both here at kickoff — the twin exits (Mascherano to Barça that
 * August, Torres to Chelsea in January) are the counterfactual calls you can
 * refuse. Ability/personality are hidden designer estimates (§7).
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

/** Liverpool, 2010–11 — Hodgson's side as the ownership crisis peaks; Torres and
 *  Mascherano still here, Gerrard the talisman, Reina the wall. */
export const LIVERPOOL_2010: CuratedSeed[] = [
  q('liverpool', 'reina10', 'Pepe Reina', 1982, 'Spain', ['GK'], 85, 86, 2016, 20, t(8, 6, 8, 8, 5, 7)),
  q('liverpool', 'gjohnson10', 'Glen Johnson', 1984, 'England', ['RB', 'LB'], 80, 83, 2014, 30, t(6, 6, 7, 6, 5, 7), { archetype: 'full-back-attacking' }),
  q('liverpool', 'carra10', 'Jamie Carragher', 1978, 'England', ['CB'], 80, 81, 2013, 25, t(9, 5, 8, 10, 5, 6), { archetype: 'covering-cb' }),
  q('liverpool', 'agger10', 'Daniel Agger', 1984, 'Denmark', ['CB'], 81, 84, 2014, 45, t(8, 5, 7, 8, 4, 7), { archetype: 'covering-cb' }),
  q('liverpool', 'skrtel10', 'Martin Škrtel', 1984, 'Slovakia', ['CB'], 80, 83, 2014, 30, t(8, 5, 7, 7, 6, 7), { archetype: 'covering-cb' }),
  q('liverpool', 'aurelio10', 'Fábio Aurélio', 1979, 'Brazil', ['LB'], 78, 80, 2012, 55, t(8, 4, 6, 7, 4, 7)),
  q('liverpool', 'kyrgiakos10', 'Sotirios Kyrgiakos', 1979, 'Greece', ['CB'], 74, 75, 2012, 30, t(7, 5, 6, 7, 6, 6)),
  q('liverpool', 'konchesky10', 'Paul Konchesky', 1981, 'England', ['LB'], 72, 74, 2013, 30, t(7, 5, 6, 6, 5, 6)),
  q('liverpool', 'gerrard10', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 86, 88, 2013, 40, t(9, 7, 9, 10, 5, 7), { loyalty: 92, archetype: 'playmaker' }),
  q('liverpool', 'mascherano10', 'Javier Mascherano', 1984, 'Argentina', ['DM', 'CM'], 84, 86, 2013, 25, t(8, 6, 8, 5, 6, 7), { archetype: 'deep-playmaker' }),
  q('liverpool', 'lucas10', 'Lucas Leiva', 1987, 'Brazil', ['DM', 'CM'], 79, 84, 2014, 25, t(8, 5, 7, 7, 5, 7), { archetype: 'deep-playmaker' }),
  q('liverpool', 'meireles10', 'Raul Meireles', 1983, 'Portugal', ['CM', 'AM'], 80, 83, 2013, 30, t(8, 6, 7, 6, 5, 7), { archetype: 'playmaker' }),
  q('liverpool', 'poulsen10', 'Christian Poulsen', 1980, 'Denmark', ['DM', 'CM'], 74, 76, 2013, 30, t(7, 5, 7, 6, 5, 6)),
  q('liverpool', 'shelvey10', 'Jonjo Shelvey', 1992, 'England', ['CM'], 68, 82, 2013, 30, t(5, 7, 7, 6, 7, 6), { archetype: 'playmaker', latentCeiling: 82 }),
  q('liverpool', 'maxi10', 'Maxi Rodríguez', 1981, 'Argentina', ['RW', 'AM'], 79, 81, 2012, 30, t(8, 6, 7, 7, 5, 7), { archetype: 'inside-forward' }),
  q('liverpool', 'joecole10', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 77, 82, 2014, 40, t(6, 7, 7, 6, 6, 6), { archetype: 'playmaker' }),
  q('liverpool', 'torres10', 'Fernando Torres', 1984, 'Spain', ['ST'], 87, 90, 2014, 45, t(7, 7, 8, 5, 6, 7), { archetype: 'poacher' }),
  q('liverpool', 'kuyt10', 'Dirk Kuyt', 1980, 'Netherlands', ['RW', 'ST'], 80, 82, 2013, 20, t(9, 5, 8, 8, 4, 8), { archetype: 'poacher' }),
  q('liverpool', 'ngog10', 'David Ngog', 1989, 'France', ['ST'], 72, 80, 2013, 30, t(6, 6, 7, 6, 5, 6), { archetype: 'poacher' }),
  q('liverpool', 'babel10', 'Ryan Babel', 1986, 'Netherlands', ['LW', 'ST'], 75, 82, 2012, 30, t(5, 7, 7, 5, 7, 6), { archetype: 'inside-forward', latentCeiling: 82 }),
  q('liverpool', 'jovanovic10', 'Milan Jovanović', 1981, 'Serbia', ['LW', 'ST'], 74, 76, 2013, 30, t(7, 6, 6, 6, 6, 5)),
];

/** Curated squads for the liverpool-2010 start — Anfield in the storm. */
export const LIVERPOOL_2010_SQUADS: Record<string, CuratedSeed[]> = {
  liverpool: LIVERPOOL_2010,
};
