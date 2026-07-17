/**
 * Curated real players — 1997–99 Bundesliga pack (§4, §17.10).
 *
 * Shared by two start points: Dortmund 1997 (the reigning European champions, a
 * side at its peak and about to age) and Bayern 1998 (Hitzfeld's "treble denied"
 * side, ninety seconds from the 1999 European Cup). Both clubs are curated, so
 * each is the other's real title rival. Ability/potential/personality are hidden
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

/** Borussia Dortmund, 1997–98 — Nevio Scala's reigning European champions. */
export const DORTMUND_1997: CuratedSeed[] = [
  q('dortmund', 'klos97', 'Stefan Klos', 1971, 'Germany', ['GK'], 80, 80, 2001, 30, t(8, 4, 6, 8, 4, 6)),
  q('dortmund', 'debeer97', 'Wolfgang de Beer', 1964, 'Germany', ['GK'], 71, 71, 1999, 30, t(7, 3, 4, 10, 4, 6)),
  q('dortmund', 'kohler97', 'Jürgen Kohler', 1965, 'Germany', ['CB'], 83, 83, 2000, 50, t(8, 5, 7, 8, 6, 6), { archetype: 'covering-cb' }),
  q('dortmund', 'juliocesar97', 'Júlio César', 1963, 'Brazil', ['CB'], 76, 76, 1999, 40, t(7, 5, 6, 6, 5, 7)),
  q('dortmund', 'feiersinger97', 'Wolfgang Feiersinger', 1965, 'Austria', ['CB', 'DM'], 76, 76, 2000, 40, t(7, 4, 6, 7, 5, 7)),
  q('dortmund', 'kree97', 'Martin Kree', 1965, 'Germany', ['CB'], 74, 74, 1999, 40, t(7, 4, 5, 7, 5, 6)),
  q('dortmund', 'reuter97', 'Stefan Reuter', 1966, 'Germany', ['RB', 'CB'], 80, 80, 2001, 35, t(8, 4, 6, 8, 4, 7), { archetype: 'full-back-attacking' }),
  q('dortmund', 'heinrich97', 'Jörg Heinrich', 1969, 'Germany', ['LB', 'LW'], 79, 80, 2001, 35, t(7, 5, 7, 6, 5, 6), { archetype: 'full-back-attacking' }),
  q('dortmund', 'reinhardt97', 'Knut Reinhardt', 1968, 'Germany', ['LB', 'LW'], 73, 73, 1999, 35, t(7, 4, 5, 7, 5, 6)),
  // Sammer — the Ballon d'Or libero whose career was being ended by chronic knee
  // trouble. Play him and it's magic; his fragility is the tragedy (latent 88).
  q('dortmund', 'sammer97', 'Matthias Sammer', 1967, 'Germany', ['CB', 'DM'], 86, 86, 1999, 75, t(9, 6, 9, 8, 5, 7), { archetype: 'covering-cb', latentCeiling: 88 }),
  q('dortmund', 'zorc97', 'Michael Zorc', 1962, 'Germany', ['CM', 'AM'], 79, 79, 1999, 35, t(8, 4, 6, 10, 4, 6)),
  q('dortmund', 'freund97', 'Steffen Freund', 1970, 'Germany', ['DM', 'CM'], 78, 78, 2001, 35, t(7, 5, 7, 7, 8, 6)),
  q('dortmund', 'sousa97', 'Paulo Sousa', 1970, 'Portugal', ['DM', 'CM'], 82, 82, 2000, 40, t(8, 5, 7, 6, 4, 7), { archetype: 'deep-playmaker' }),
  q('dortmund', 'moller97', 'Andreas Möller', 1967, 'Germany', ['AM'], 85, 85, 2001, 40, t(8, 8, 8, 6, 7, 6), { archetype: 'playmaker' }),
  q('dortmund', 'tretschok97', 'René Tretschok', 1968, 'Germany', ['CM', 'AM'], 74, 74, 2000, 35, t(7, 4, 6, 7, 5, 6)),
  // Ricken — the wonderkid who lobbed the 1997 final winner; a huge ceiling that
  // injuries never let him reach.
  q('dortmund', 'ricken97', 'Lars Ricken', 1976, 'Germany', ['AM', 'ST'], 79, 86, 2002, 35, t(7, 5, 8, 8, 5, 7), { archetype: 'inside-forward', latentCeiling: 86 }),
  q('dortmund', 'chapuisat97', 'Stéphane Chapuisat', 1969, 'Switzerland', ['ST', 'LW'], 83, 83, 2001, 35, t(8, 3, 6, 8, 3, 6), { archetype: 'poacher' }),
  q('dortmund', 'herrlich97', 'Heiko Herrlich', 1971, 'Germany', ['ST'], 79, 79, 2001, 35, t(7, 5, 6, 6, 5, 6)),
];

/** Bayern München, 1998–99 — Hitzfeld's side, ninety seconds from the treble. */
export const BAYERN_1998: CuratedSeed[] = [
  q('bayern', 'kahn98', 'Oliver Kahn', 1969, 'Germany', ['GK'], 88, 90, 2003, 30, t(9, 6, 9, 8, 7, 6)),
  q('bayern', 'scheuer98', 'Sven Scheuer', 1971, 'Germany', ['GK'], 68, 68, 2001, 30, t(7, 3, 4, 9, 3, 6)),
  q('bayern', 'babbel98', 'Markus Babbel', 1972, 'Germany', ['RB', 'CB'], 81, 83, 2002, 30, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'kuffour98', 'Samuel Kuffour', 1976, 'Ghana', ['CB'], 80, 84, 2003, 35, t(6, 6, 7, 6, 6, 7)),
  q('bayern', 'linke98', 'Thomas Linke', 1969, 'Germany', ['CB'], 78, 79, 2002, 30, t(8, 3, 6, 8, 3, 6)),
  // Matthäus — the 37-year-old sweeper and serial winner, ego and class in equal
  // measure, still pulling the strings from the back.
  q('bayern', 'matthaus98', 'Lothar Matthäus', 1961, 'Germany', ['CB', 'DM'], 83, 83, 2000, 40, t(9, 9, 8, 6, 6, 5), { archetype: 'covering-cb' }),
  q('bayern', 'lizarazu98', 'Bixente Lizarazu', 1969, 'France', ['LB'], 82, 83, 2003, 30, t(8, 5, 8, 6, 5, 7), { archetype: 'full-back-attacking' }),
  q('bayern', 'tarnat98', 'Michael Tarnat', 1969, 'Germany', ['LB', 'LW'], 78, 79, 2002, 30, t(7, 4, 6, 7, 4, 6)),
  q('bayern', 'strunz98', 'Thomas Strunz', 1968, 'Germany', ['DM', 'CM', 'RB'], 76, 76, 2001, 40, t(7, 5, 6, 7, 5, 6)),
  q('bayern', 'effenberg98', 'Stefan Effenberg', 1968, 'Germany', ['CM', 'DM'], 85, 86, 2002, 30, t(7, 9, 9, 6, 7, 6), { archetype: 'deep-playmaker' }),
  q('bayern', 'jeremies98', 'Jens Jeremies', 1974, 'Germany', ['DM', 'CM'], 79, 81, 2003, 40, t(7, 5, 7, 7, 6, 6)),
  q('bayern', 'scholl98', 'Mehmet Scholl', 1970, 'Germany', ['AM', 'RW'], 83, 85, 2003, 45, t(7, 6, 7, 8, 5, 7), { archetype: 'playmaker' }),
  q('bayern', 'basler98', 'Mario Basler', 1968, 'Germany', ['RW', 'AM'], 82, 82, 2000, 35, t(5, 9, 6, 5, 8, 5), { archetype: 'inside-forward' }),
  q('bayern', 'salihamidzic98', 'Hasan Salihamidžić', 1977, 'Bosnia and Herzegovina', ['RW', 'CM'], 77, 82, 2003, 30, t(8, 4, 7, 7, 4, 8)),
  q('bayern', 'elber98', 'Giovane Élber', 1972, 'Brazil', ['ST'], 82, 84, 2003, 40, t(7, 6, 7, 6, 5, 8), { archetype: 'poacher' }),
  q('bayern', 'jancker98', 'Carsten Jancker', 1974, 'Germany', ['ST'], 79, 80, 2003, 35, t(7, 5, 6, 7, 5, 6)),
  q('bayern', 'zickler98', 'Alexander Zickler', 1974, 'Germany', ['ST'], 76, 79, 2002, 45, t(6, 5, 6, 7, 5, 6)),
  q('bayern', 'fink98', 'Thorsten Fink', 1967, 'Germany', ['DM', 'CM'], 74, 74, 2002, 30, t(7, 3, 6, 8, 3, 6)),
];

/** Shared curated squads for the Bundesliga 1997/98 cluster — both Dortmund and
 *  Bayern are real, so each is the other's title rival in either start point. */
export const BUNDESLIGA_1997_SQUADS: Record<string, CuratedSeed[]> = {
  dortmund: DORTMUND_1997,
  bayern: BAYERN_1998,
};
