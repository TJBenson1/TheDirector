/**
 * Curated real players — 2008 Abu Dhabi takeover pack (§4, §17.10).
 *
 * Vertical slice for "Manchester City, 2008: the money lands": Mark Hughes's
 * mid-table side at the moment the Abu Dhabi United Group buy the club. Robinho —
 * the deadline-day statement signing — is NOT in the starting squad; he arrives
 * via the takeover event (a signReal), the counterfactual first splurge.
 * Ability/personality are hidden designer estimates (§7).
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

/** Manchester City, 2008–09 — the squad Mark Hughes inherited as the Abu Dhabi
 *  billions arrived; a good-not-great side about to be transformed by money. */
export const MAN_CITY_2008: CuratedSeed[] = [
  q('man_city', 'hart08', 'Joe Hart', 1987, 'England', ['GK'], 76, 88, 2013, 20, t(8, 5, 8, 8, 4, 7)),
  q('man_city', 'kschmeichel08', 'Kasper Schmeichel', 1986, 'Denmark', ['GK'], 71, 84, 2011, 20, t(8, 6, 8, 7, 5, 7)),
  q('man_city', 'richards08', 'Micah Richards', 1988, 'England', ['RB', 'CB'], 78, 86, 2013, 35, t(7, 6, 7, 7, 5, 7), { archetype: 'full-back-attacking' }),
  q('man_city', 'dunne08', 'Richard Dunne', 1979, 'Ireland', ['CB'], 78, 79, 2011, 30, t(8, 4, 7, 9, 5, 6), { archetype: 'covering-cb' }),
  q('man_city', 'kompany08', 'Vincent Kompany', 1986, 'Belgium', ['CB', 'DM'], 79, 89, 2013, 30, t(9, 6, 9, 8, 3, 7), { archetype: 'covering-cb' }),
  q('man_city', 'onuoha08', 'Nedum Onuoha', 1986, 'England', ['CB', 'RB'], 72, 78, 2011, 30, t(8, 4, 7, 8, 4, 7)),
  q('man_city', 'benhaim08', 'Tal Ben Haim', 1982, 'Israel', ['CB'], 73, 75, 2011, 28, t(7, 6, 7, 6, 6, 6)),
  q('man_city', 'ball08', 'Michael Ball', 1979, 'England', ['LB'], 71, 74, 2010, 45, t(7, 5, 6, 7, 5, 6)),
  q('man_city', 'zabaleta08', 'Pablo Zabaleta', 1985, 'Argentina', ['RB', 'LB'], 76, 84, 2013, 25, t(9, 5, 8, 9, 5, 8), { archetype: 'full-back-attacking' }),
  q('man_city', 'ireland08', 'Stephen Ireland', 1986, 'Ireland', ['AM', 'CM'], 78, 85, 2012, 30, t(6, 7, 7, 5, 7, 6), { archetype: 'playmaker' }),
  q('man_city', 'swp08', 'Shaun Wright-Phillips', 1981, 'England', ['RW'], 77, 82, 2012, 25, t(7, 6, 7, 7, 5, 7), { archetype: 'inside-forward' }),
  q('man_city', 'elano08', 'Elano', 1981, 'Brazil', ['AM', 'CM'], 79, 82, 2011, 30, t(7, 6, 7, 6, 6, 7), { archetype: 'playmaker' }),
  q('man_city', 'petrov08', 'Martin Petrov', 1979, 'Bulgaria', ['LW'], 77, 80, 2011, 40, t(7, 6, 7, 6, 5, 7)),
  q('man_city', 'hamann08', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 76, 77, 2010, 35, t(8, 5, 7, 6, 4, 7), { archetype: 'deep-playmaker' }),
  q('man_city', 'mjohnson08', 'Michael Johnson', 1988, 'England', ['CM'], 73, 84, 2012, 45, t(6, 5, 6, 7, 6, 6), { archetype: 'deep-playmaker', latentCeiling: 84 }),
  q('man_city', 'gelson08', 'Gelson Fernandes', 1986, 'Switzerland', ['CM', 'DM'], 73, 79, 2012, 28, t(7, 6, 7, 6, 6, 7)),
  q('man_city', 'jo08', 'Jô', 1987, 'Brazil', ['ST'], 74, 82, 2012, 30, t(5, 7, 6, 5, 7, 5), { archetype: 'poacher', latentCeiling: 82 }),
  q('man_city', 'benjani08', 'Benjani Mwaruwari', 1978, 'Zimbabwe', ['ST'], 74, 76, 2011, 35, t(7, 5, 7, 7, 5, 6), { archetype: 'poacher' }),
  q('man_city', 'vassell08', 'Darius Vassell', 1980, 'England', ['ST'], 72, 74, 2010, 30, t(7, 5, 6, 7, 5, 7)),
  q('man_city', 'sturridge08', 'Daniel Sturridge', 1989, 'England', ['ST', 'RW'], 71, 86, 2011, 45, t(6, 7, 8, 5, 6, 6), { archetype: 'poacher', latentCeiling: 86 }),
  q('man_city', 'caicedo08', 'Felipe Caicedo', 1988, 'Ecuador', ['ST'], 71, 78, 2012, 30, t(6, 6, 7, 6, 6, 6)),
];

/** Curated squads for the man-city-2008 start — the club the takeover transforms. */
export const MAN_CITY_2008_SQUADS: Record<string, CuratedSeed[]> = {
  man_city: MAN_CITY_2008,
};
