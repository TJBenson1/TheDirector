/**
 * Curated real players — 2012 Dortmund vs Bayern pack (§4, §17.10).
 *
 * Vertical slice for "Borussia Dortmund, 2012: hold the wall": Klopp's back-to-back
 * champions against the Bayern juggernaut that would win the 2013 treble. Both
 * giants are curated because the whole drama is Bayern prising Götze (2013) and
 * Lewandowski (2014) out of Dortmund — the twin defections you can fight to stop.
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

/** Borussia Dortmund, 2012–13 — Klopp's champions; a young, hungry, home-grown
 *  side with Götze and Reus the jewels and Lewandowski the spearhead. */
export const DORTMUND_2012: CuratedSeed[] = [
  q('dortmund', 'weidenfeller12', 'Roman Weidenfeller', 1980, 'Germany', ['GK'], 82, 82, 2016, 25, t(8, 6, 8, 9, 5, 7)),
  q('dortmund', 'piszczek12', 'Łukasz Piszczek', 1985, 'Poland', ['RB'], 82, 84, 2016, 30, t(9, 5, 8, 8, 4, 7), { archetype: 'full-back-attacking' }),
  q('dortmund', 'hummels12', 'Mats Hummels', 1988, 'Germany', ['CB'], 85, 89, 2016, 30, t(8, 6, 8, 7, 5, 7), { archetype: 'ball-playing-cb' }),
  q('dortmund', 'subotic12', 'Neven Subotić', 1988, 'Serbia', ['CB'], 82, 85, 2016, 30, t(8, 5, 8, 8, 5, 7), { archetype: 'covering-cb' }),
  q('dortmund', 'schmelzer12', 'Marcel Schmelzer', 1988, 'Germany', ['LB'], 80, 82, 2016, 30, t(8, 5, 7, 9, 4, 7), { archetype: 'full-back-attacking' }),
  q('dortmund', 'santana12', 'Felipe Santana', 1986, 'Brazil', ['CB'], 76, 78, 2014, 30, t(7, 5, 7, 7, 5, 7)),
  q('dortmund', 'grosskreutz12', 'Kevin Großkreutz', 1988, 'Germany', ['LB', 'RW'], 76, 79, 2016, 25, t(8, 6, 7, 9, 6, 7)),
  q('dortmund', 'gundogan12', 'İlkay Gündoğan', 1990, 'Germany', ['CM', 'DM'], 82, 88, 2015, 40, t(8, 6, 8, 6, 4, 8), { archetype: 'deep-playmaker' }),
  q('dortmund', 'bender12', 'Sven Bender', 1989, 'Germany', ['DM', 'CM'], 80, 83, 2017, 40, t(9, 4, 8, 9, 4, 7), { archetype: 'deep-playmaker' }),
  q('dortmund', 'kehl12', 'Sebastian Kehl', 1980, 'Germany', ['DM', 'CM'], 76, 77, 2014, 35, t(9, 5, 8, 9, 5, 7)),
  q('dortmund', 'sahin12', 'Nuri Şahin', 1988, 'Turkey', ['CM', 'DM'], 80, 85, 2015, 35, t(7, 6, 7, 7, 5, 7), { archetype: 'deep-playmaker' }),
  // Götze — the home-grown jewel Bayern would buy in 2013; the ultimate betrayal.
  q('dortmund', 'gotze12', 'Mario Götze', 1992, 'Germany', ['AM', 'CM'], 84, 90, 2016, 40, t(7, 7, 8, 6, 5, 8), { archetype: 'playmaker', latentCeiling: 90 }),
  // Reus — the local boy come home, electric and beloved.
  q('dortmund', 'reus12', 'Marco Reus', 1989, 'Germany', ['AM', 'LW'], 85, 89, 2017, 45, t(8, 6, 8, 8, 5, 8), { archetype: 'inside-forward' }),
  q('dortmund', 'blaszczykowski12', 'Jakub Błaszczykowski', 1985, 'Poland', ['RW'], 80, 82, 2016, 35, t(8, 6, 8, 8, 5, 7), { archetype: 'inside-forward' }),
  q('dortmund', 'leitner12', 'Moritz Leitner', 1992, 'Germany', ['AM', 'CM'], 71, 82, 2015, 30, t(6, 6, 7, 6, 6, 7), { archetype: 'playmaker', latentCeiling: 82 }),
  // Lewandowski — the spearhead who would run down his deal and leave for Bayern
  // on a free in 2014; the contract standoff to win or lose.
  q('dortmund', 'lewandowski12', 'Robert Lewandowski', 1988, 'Poland', ['ST'], 86, 92, 2014, 20, t(9, 7, 9, 6, 4, 8), { archetype: 'poacher' }),
  q('dortmund', 'schieber12', 'Julian Schieber', 1989, 'Germany', ['ST'], 72, 78, 2015, 30, t(7, 5, 7, 7, 5, 6), { archetype: 'poacher' }),
];

/** Bayern München, 2012–13 — the treble-winning juggernaut and the club whose
 *  money would pick Dortmund apart; the rival and the destination in one. */
export const BAYERN_2012: CuratedSeed[] = [
  q('bayern', 'neuer12', 'Manuel Neuer', 1986, 'Germany', ['GK'], 89, 92, 2016, 20, t(9, 6, 9, 8, 4, 8)),
  q('bayern', 'lahm12', 'Philipp Lahm', 1983, 'Germany', ['RB', 'LB'], 88, 89, 2016, 20, t(10, 5, 9, 10, 3, 8), { archetype: 'full-back-attacking' }),
  q('bayern', 'boateng12', 'Jérôme Boateng', 1988, 'Germany', ['CB'], 84, 89, 2016, 25, t(8, 6, 8, 7, 5, 7), { archetype: 'ball-playing-cb' }),
  q('bayern', 'dante12', 'Dante', 1983, 'Brazil', ['CB'], 82, 83, 2016, 25, t(8, 6, 7, 7, 6, 7), { archetype: 'covering-cb' }),
  q('bayern', 'badstuber12', 'Holger Badstuber', 1989, 'Germany', ['CB'], 81, 86, 2017, 50, t(8, 5, 8, 8, 4, 7), { archetype: 'covering-cb' }),
  q('bayern', 'alaba12', 'David Alaba', 1992, 'Austria', ['LB', 'CM'], 82, 90, 2018, 20, t(8, 6, 8, 8, 4, 8), { archetype: 'full-back-attacking' }),
  q('bayern', 'rafinha12', 'Rafinha', 1985, 'Brazil', ['RB'], 78, 80, 2015, 25, t(8, 5, 7, 7, 5, 7)),
  q('bayern', 'schweinsteiger12', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'DM'], 87, 88, 2016, 40, t(9, 7, 9, 9, 5, 7), { archetype: 'deep-playmaker' }),
  q('bayern', 'javimartinez12', 'Javi Martínez', 1988, 'Spain', ['DM', 'CB'], 84, 87, 2017, 30, t(9, 5, 8, 7, 4, 7), { archetype: 'deep-playmaker' }),
  q('bayern', 'kroos12', 'Toni Kroos', 1990, 'Germany', ['CM', 'AM'], 84, 91, 2015, 20, t(9, 6, 8, 6, 3, 8), { archetype: 'deep-playmaker' }),
  q('bayern', 'muller12', 'Thomas Müller', 1989, 'Germany', ['AM', 'RW'], 85, 89, 2016, 20, t(9, 6, 9, 10, 4, 8), { archetype: 'inside-forward' }),
  q('bayern', 'ribery12', 'Franck Ribéry', 1983, 'France', ['LW'], 88, 89, 2015, 35, t(8, 7, 9, 7, 6, 7), { archetype: 'inside-forward' }),
  q('bayern', 'robben12', 'Arjen Robben', 1984, 'Netherlands', ['RW'], 88, 89, 2015, 55, t(8, 8, 9, 6, 6, 7), { archetype: 'inside-forward' }),
  q('bayern', 'shaqiri12', 'Xherdan Shaqiri', 1991, 'Switzerland', ['RW', 'AM'], 78, 85, 2016, 30, t(7, 7, 8, 6, 6, 7), { archetype: 'inside-forward', latentCeiling: 85 }),
  q('bayern', 'mandzukic12', 'Mario Mandžukić', 1986, 'Croatia', ['ST'], 82, 85, 2016, 30, t(9, 6, 8, 7, 6, 7), { archetype: 'poacher' }),
  q('bayern', 'gomez12', 'Mario Gómez', 1985, 'Germany', ['ST'], 82, 84, 2015, 35, t(8, 6, 8, 7, 5, 7), { archetype: 'poacher' }),
  q('bayern', 'pizarro12', 'Claudio Pizarro', 1978, 'Peru', ['ST'], 78, 79, 2014, 30, t(8, 6, 7, 7, 5, 7), { archetype: 'poacher' }),
];

/** Curated squads for the dortmund-2012 start — the wall and the wrecking ball. */
export const DORTMUND_2012_SQUADS: Record<string, CuratedSeed[]> = {
  dortmund: DORTMUND_2012,
  bayern: BAYERN_2012,
};
