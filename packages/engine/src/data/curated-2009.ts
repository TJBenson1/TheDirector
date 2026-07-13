/**
 * Curated real players — 2009–10 pack (§4, §17.10).
 *
 * The vertical slice for "the Van Gaal reset": Bayern Munich 2009–10, rebuilding
 * after the Klinsmann failure. Van Gaal blooded the youth (Müller, Badstuber, a
 * teenage Alaba) around the Robben-and-Ribéry wings and won the domestic double
 * while reaching the Champions League final. The counterfactual is whether you
 * trust the kids and build the next dynasty, or spend to paper over the reset.
 * Ability/potential/personality are hidden designer estimates (§7).
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

/** Bayern Munich, 2009–10 — van Gaal's double-winning reset. Robben arrives from
 *  Madrid, Gómez from Stuttgart; Müller and Badstuber break through from the
 *  academy, with a 17-year-old Alaba on the fringe. */
export const BAYERN_2009: CuratedSeed[] = [
  q('bayern', 'butt09', 'Hans-Jörg Butt', 1974, 'Germany', ['GK'], 78, 78, 2012, 25, t(8, 6, 6, 8, 4, 6)),
  q('bayern', 'rensing09', 'Michael Rensing', 1984, 'Germany', ['GK'], 70, 74, 2011, 25, t(7, 5, 6, 6, 5, 6)),
  q('bayern', 'lahm09', 'Philipp Lahm', 1983, 'Germany', ['RB', 'LB'], 86, 88, 2013, 25, t(10, 4, 9, 10, 3, 8)),
  q('bayern', 'vanbuyten09', 'Daniel Van Buyten', 1978, 'Belgium', ['CB'], 80, 80, 2012, 35, t(8, 5, 7, 8, 4, 7)),
  q('bayern', 'demichelis09', 'Martín Demichelis', 1980, 'Argentina', ['CB', 'DM'], 79, 80, 2011, 35, t(7, 6, 7, 7, 6, 7)),
  // Badstuber — a van Gaal academy promotion who became a Germany regular before
  // a run of severe knee injuries stalled him. Fragile-and-lost (latent 87).
  q('bayern', 'badstuber09', 'Holger Badstuber', 1989, 'Germany', ['CB', 'LB'], 72, 84, 2013, 60, t(9, 4, 8, 9, 4, 7), { latentCeiling: 87 }),
  q('bayern', 'braafheid09', 'Edson Braafheid', 1983, 'Netherlands', ['LB'], 72, 74, 2012, 30, t(7, 5, 6, 6, 5, 7)),
  q('bayern', 'contento09', 'Diego Contento', 1990, 'Germany', ['LB'], 66, 76, 2013, 30, t(7, 4, 7, 8, 4, 7)),
  q('bayern', 'vanbommel09', 'Mark van Bommel', 1977, 'Netherlands', ['DM'], 82, 82, 2011, 30, t(8, 7, 8, 6, 7, 7)),
  q('bayern', 'schweinsteiger09', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'DM'], 84, 88, 2013, 40, t(9, 6, 9, 9, 5, 8)),
  q('bayern', 'tymoshchuk09', 'Anatoliy Tymoshchuk', 1979, 'Ukraine', ['DM', 'CM'], 78, 79, 2011, 30, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'altintop09', 'Hamit Altıntop', 1982, 'Turkey', ['RW', 'CM'], 78, 80, 2011, 35, t(8, 5, 7, 7, 5, 7)),
  q('bayern', 'pranjic09', 'Danijel Pranjić', 1981, 'Croatia', ['LW', 'LB'], 76, 77, 2012, 30, t(7, 5, 6, 6, 5, 7)),
  q('bayern', 'ribery09', 'Franck Ribéry', 1983, 'France', ['LW', 'AM'], 88, 90, 2013, 45, t(7, 7, 9, 7, 6, 7)),
  // Robben — signed from Real Madrid in Aug 2009; a match-winner when fit, but a
  // famously fragile hamstring. Fragile star (high proneness).
  q('bayern', 'robben09', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 87, 89, 2013, 65, t(8, 7, 9, 7, 5, 7)),
  // Müller — the academy breakout of the reset; van Gaal handed him the season and
  // he never looked back. A reality-rail star (high ceiling, unlocked by minutes).
  q('bayern', 'muller09', 'Thomas Müller', 1989, 'Germany', ['AM', 'RW', 'ST'], 70, 88, 2013, 20, t(9, 5, 9, 10, 3, 8)),
  q('bayern', 'gomez09', 'Mario Gómez', 1985, 'Germany', ['ST'], 82, 85, 2013, 35, t(8, 6, 8, 6, 5, 7)),
  q('bayern', 'olic09', 'Ivica Olić', 1979, 'Croatia', ['ST', 'LW'], 79, 80, 2012, 35, t(8, 6, 8, 6, 5, 7)),
  q('bayern', 'klose09', 'Miroslav Klose', 1978, 'Germany', ['ST'], 81, 81, 2011, 35, t(9, 5, 8, 7, 4, 7)),
  // Alaba — a 17-year-old on the fringe in 2009, about to become one of the best
  // full-backs in the world. Reality-rail wonderkid (latent-free; huge ceiling).
  q('bayern', 'alaba09', 'David Alaba', 1992, 'Austria', ['LB', 'CM'], 60, 90, 2014, 25, t(9, 5, 9, 9, 3, 8)),
  // Breno — a much-hyped young Brazilian CB whose career collapsed entirely (a
  // bizarre arson conviction ended it). The cautionary lost talent (latent 85).
  q('bayern', 'breno09', 'Breno', 1989, 'Brazil', ['CB'], 66, 76, 2012, 40, t(4, 6, 6, 5, 8, 5), { latentCeiling: 85 }),
];

/** Curated squads for the bayern-2009 scenario, keyed by club. Bundesliga rivals
 *  and the European elite are added as the 2009 data pass continues. */
export const BAYERN_2009_SQUADS: Record<string, CuratedSeed[]> = {
  bayern: BAYERN_2009,
};
