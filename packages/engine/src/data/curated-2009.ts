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
  extra: { hardBlocks?: HardBlock[]; loyalty?: number; latentCeiling?: number; archetype?: string; loanFrom?: ClubId } = {},
): CuratedSeed {
  return { id: `cur_${id}`, name, birthYear, nationality, positions, club, contractUntil, ability, potentialCeiling, personality, injuryProneness, ...extra };
}

/** Bayern Munich, 2009–10 — van Gaal's double-winning reset. Robben arrives from
 *  Madrid, Gómez from Stuttgart; Müller and Badstuber break through from the
 *  academy, with a 17-year-old Alaba on the fringe. */
export const BAYERN_2009: CuratedSeed[] = [
  q('bayern', 'butt09', 'Hans-Jörg Butt', 1974, 'Germany', ['GK'], 78, 78, 2012, 25, t(8, 6, 6, 8, 4, 6)),
  q('bayern', 'rensing09', 'Michael Rensing', 1984, 'Germany', ['GK'], 70, 74, 2011, 25, t(7, 5, 6, 6, 5, 6)),
  q('bayern', 'lahm09', 'Philipp Lahm', 1983, 'Germany', ['RB', 'LB'], 86, 88, 2013, 25, t(10, 4, 9, 10, 3, 8), { archetype: 'full-back-attacking' }),
  q('bayern', 'vanbuyten09', 'Daniel Van Buyten', 1978, 'Belgium', ['CB'], 80, 80, 2012, 35, t(8, 5, 7, 8, 4, 7)),
  q('bayern', 'demichelis09', 'Martín Demichelis', 1980, 'Argentina', ['CB', 'DM'], 79, 80, 2011, 35, t(7, 6, 7, 7, 6, 7)),
  // Badstuber — a van Gaal academy promotion who became a Germany regular before
  // a run of severe knee injuries stalled him. Fragile-and-lost (latent 87).
  q('bayern', 'badstuber09', 'Holger Badstuber', 1989, 'Germany', ['CB', 'LB'], 72, 84, 2013, 60, t(9, 4, 8, 9, 4, 7), { latentCeiling: 87 }),
  q('bayern', 'braafheid09', 'Edson Braafheid', 1983, 'Netherlands', ['LB'], 72, 74, 2012, 30, t(7, 5, 6, 6, 5, 7)),
  q('bayern', 'contento09', 'Diego Contento', 1990, 'Germany', ['LB'], 66, 76, 2013, 30, t(7, 4, 7, 8, 4, 7)),
  q('bayern', 'vanbommel09', 'Mark van Bommel', 1977, 'Netherlands', ['DM'], 82, 82, 2011, 30, t(8, 7, 8, 6, 7, 7)),
  q('bayern', 'schweinsteiger09', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'DM'], 84, 88, 2013, 40, t(9, 6, 9, 9, 5, 8), { archetype: 'deep-playmaker' }),
  q('bayern', 'tymoshchuk09', 'Anatoliy Tymoshchuk', 1979, 'Ukraine', ['DM', 'CM'], 78, 79, 2011, 30, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'altintop09', 'Hamit Altıntop', 1982, 'Turkey', ['RW', 'CM'], 78, 80, 2011, 35, t(8, 5, 7, 7, 5, 7)),
  q('bayern', 'pranjic09', 'Danijel Pranjić', 1981, 'Croatia', ['LW', 'LB'], 76, 77, 2012, 30, t(7, 5, 6, 6, 5, 7)),
  q('bayern', 'ribery09', 'Franck Ribéry', 1983, 'France', ['LW', 'AM'], 88, 90, 2013, 45, t(7, 7, 9, 7, 6, 7), { archetype: 'inside-forward' }),
  // Robben — signed from Real Madrid in Aug 2009; a match-winner when fit, but a
  // famously fragile hamstring. Fragile star (high proneness).
  q('bayern', 'robben09', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 87, 89, 2013, 65, t(8, 7, 9, 7, 5, 7), { archetype: 'inside-forward' }),
  // Müller — the academy breakout of the reset; van Gaal handed him the season and
  // he never looked back. A reality-rail star (high ceiling, unlocked by minutes).
  q('bayern', 'muller09', 'Thomas Müller', 1989, 'Germany', ['AM', 'RW', 'ST'], 70, 88, 2013, 20, t(9, 5, 9, 10, 3, 8)),
  q('bayern', 'gomez09', 'Mario Gómez', 1985, 'Germany', ['ST'], 82, 85, 2013, 35, t(8, 6, 8, 6, 5, 7), { archetype: 'poacher' }),
  q('bayern', 'olic09', 'Ivica Olić', 1979, 'Croatia', ['ST', 'LW'], 79, 80, 2012, 35, t(8, 6, 8, 6, 5, 7)),
  q('bayern', 'klose09', 'Miroslav Klose', 1978, 'Germany', ['ST'], 81, 81, 2011, 35, t(9, 5, 8, 7, 4, 7)),
  // Alaba — a 17-year-old on the fringe in 2009, about to become one of the best
  // full-backs in the world. Reality-rail wonderkid (latent-free; huge ceiling).
  q('bayern', 'alaba09', 'David Alaba', 1992, 'Austria', ['LB', 'CM'], 60, 90, 2014, 25, t(9, 5, 9, 9, 3, 8)),
  // Breno — a much-hyped young Brazilian CB whose career collapsed entirely (a
  // bizarre arson conviction ended it). The cautionary lost talent (latent 85).
  q('bayern', 'breno09', 'Breno', 1989, 'Brazil', ['CB'], 66, 76, 2012, 40, t(4, 6, 6, 5, 8, 5), { latentCeiling: 85 }),
];

/** VfL Wolfsburg, 2009–10 — the reigning champions, built on the Grafite–Džeko
 *  strike partnership and Misimović's creativity. */
export const WOLFSBURG_2009: CuratedSeed[] = [
  q('wolfsburg', 'benaglio09', 'Diego Benaglio', 1983, 'Switzerland', ['GK'], 80, 82, 2013, 25, t(8, 4, 6, 8, 3, 7)),
  q('wolfsburg', 'barzagli09', 'Andrea Barzagli', 1981, 'Italy', ['CB'], 80, 82, 2012, 25, t(9, 3, 7, 7, 3, 7)),
  q('wolfsburg', 'madlung09', 'Alexander Madlung', 1982, 'Germany', ['CB'], 73, 74, 2012, 30, t(7, 4, 5, 6, 4, 6)),
  q('wolfsburg', 'rcosta09', 'Ricardo Costa', 1981, 'Portugal', ['CB'], 74, 75, 2012, 30, t(6, 5, 5, 5, 6, 6)),
  q('wolfsburg', 'schafer09', 'Marcel Schäfer', 1984, 'Germany', ['LB'], 76, 78, 2013, 25, t(7, 3, 5, 9, 3, 6)),
  q('wolfsburg', 'riether09', 'Sascha Riether', 1983, 'Germany', ['RB'], 75, 77, 2012, 25, t(7, 4, 6, 6, 4, 7)),
  q('wolfsburg', 'pekarik09', 'Peter Pekarík', 1986, 'Slovakia', ['RB'], 73, 78, 2013, 25, t(7, 4, 6, 6, 3, 7)),
  q('wolfsburg', 'josue09', 'Josué', 1979, 'Brazil', ['DM', 'CM'], 80, 81, 2012, 30, t(7, 6, 6, 6, 6, 6)),
  q('wolfsburg', 'hasebe09', 'Makoto Hasebe', 1984, 'Japan', ['DM', 'CM'], 76, 80, 2013, 20, t(9, 2, 6, 8, 2, 8)),
  q('wolfsburg', 'gentner09', 'Christian Gentner', 1985, 'Germany', ['CM', 'AM'], 76, 79, 2012, 25, t(8, 3, 6, 7, 3, 7)),
  q('wolfsburg', 'misimovic09', 'Zvjezdan Misimović', 1982, 'Bosnia and Herzegovina', ['AM'], 83, 84, 2011, 25, t(6, 7, 7, 5, 6, 6)),
  q('wolfsburg', 'ziani09', 'Karim Ziani', 1982, 'Algeria', ['AM', 'LW'], 76, 80, 2013, 60, t(5, 7, 6, 4, 7, 5)),
  q('wolfsburg', 'dejagah09', 'Ashkan Dejagah', 1986, 'Germany', ['LW', 'RW'], 72, 80, 2013, 30, t(6, 6, 7, 5, 5, 6)),
  q('wolfsburg', 'grafite09', 'Grafite', 1979, 'Brazil', ['ST'], 84, 85, 2012, 30, t(6, 6, 6, 6, 5, 6)),
  q('wolfsburg', 'dzeko09', 'Edin Džeko', 1986, 'Bosnia and Herzegovina', ['ST'], 82, 90, 2013, 20, t(7, 7, 9, 4, 5, 7), { archetype: 'target-man' }),
  q('wolfsburg', 'martins09', 'Obafemi Martins', 1984, 'Nigeria', ['ST'], 80, 82, 2013, 35, t(6, 7, 7, 5, 6, 6)),
];

/** SV Werder Bremen, 2009–10 — Özil's breakout side (Diego having left for Juve). */
export const BREMEN_2009: CuratedSeed[] = [
  q('bremen', 'wiese09', 'Tim Wiese', 1981, 'Germany', ['GK'], 80, 82, 2012, 30, t(8, 8, 7, 6, 8, 6)),
  q('bremen', 'merte09', 'Per Mertesacker', 1984, 'Germany', ['CB'], 83, 85, 2011, 25, t(9, 5, 8, 7, 3, 7)),
  q('bremen', 'naldo09', 'Naldo', 1982, 'Brazil', ['CB'], 81, 82, 2013, 40, t(8, 5, 6, 7, 4, 7)),
  q('bremen', 'prodl09', 'Sebastian Prödl', 1987, 'Austria', ['CB'], 72, 78, 2013, 45, t(7, 4, 7, 7, 4, 7)),
  q('bremen', 'boenisch09', 'Sebastian Boenisch', 1987, 'Germany', ['LB'], 74, 79, 2012, 55, t(7, 5, 7, 6, 5, 6)),
  q('bremen', 'fritz09', 'Clemens Fritz', 1980, 'Germany', ['RB', 'RW'], 78, 79, 2012, 35, t(8, 5, 7, 8, 4, 7)),
  q('bremen', 'frings09', 'Torsten Frings', 1976, 'Germany', ['DM', 'CM'], 82, 82, 2011, 45, t(9, 7, 8, 8, 6, 7)),
  q('bremen', 'borowski09', 'Tim Borowski', 1980, 'Germany', ['CM', 'DM'], 76, 77, 2012, 40, t(7, 5, 6, 8, 5, 7)),
  q('bremen', 'hunt09', 'Aaron Hunt', 1986, 'Germany', ['AM', 'ST'], 78, 83, 2013, 45, t(7, 6, 7, 7, 6, 7)),
  // Özil — a reality-rail world-beater in waiting; given minutes he climbs to elite.
  q('bremen', 'ozil09', 'Mesut Özil', 1988, 'Germany', ['AM', 'LW'], 81, 92, 2011, 30, t(8, 6, 8, 5, 5, 8), { archetype: 'playmaker' }),
  // Marin — the hyped "German Messi" whose confidence and body failed him after a
  // big move. A genuine lost talent (latent 86).
  q('bremen', 'marin09', 'Marko Marin', 1989, 'Germany', ['LW', 'AM'], 74, 80, 2012, 55, t(6, 7, 7, 5, 7, 5), { latentCeiling: 86 }),
  q('bremen', 'pizarro09', 'Claudio Pizarro', 1978, 'Peru', ['ST'], 82, 82, 2011, 30, t(9, 6, 7, 8, 4, 8)),
  q('bremen', 'almeida09', 'Hugo Almeida', 1984, 'Portugal', ['ST'], 77, 79, 2012, 50, t(7, 6, 7, 6, 6, 6)),
  q('bremen', 'rosenberg09', 'Markus Rosenberg', 1982, 'Sweden', ['ST'], 71, 73, 2011, 40, t(7, 5, 6, 6, 5, 6)),
];

/** Borussia Dortmund, 2009–10 — Klopp's rising young side, two years before the
 *  title. Barrios' goals, and the kids (Hummels, Subotić, Şahin) coming of age. */
export const DORTMUND_2009: CuratedSeed[] = [
  q('dortmund', 'weidenfeller09', 'Roman Weidenfeller', 1980, 'Germany', ['GK'], 77, 78, 2014, 25, t(8, 5, 6, 9, 4, 7)),
  q('dortmund', 'subotic09', 'Neven Subotić', 1988, 'Serbia', ['CB'], 76, 84, 2013, 30, t(7, 5, 7, 7, 4, 7)),
  q('dortmund', 'hummels09', 'Mats Hummels', 1988, 'Germany', ['CB'], 75, 88, 2014, 45, t(8, 6, 8, 6, 5, 7)),
  q('dortmund', 'schmelzer09', 'Marcel Schmelzer', 1988, 'Germany', ['LB'], 72, 80, 2013, 30, t(7, 4, 6, 9, 3, 7)),
  q('dortmund', 'kehl09', 'Sebastian Kehl', 1980, 'Germany', ['DM', 'CM'], 75, 75, 2011, 50, t(8, 6, 6, 9, 4, 7)),
  q('dortmund', 'bender09', 'Sven Bender', 1989, 'Germany', ['DM', 'CM'], 70, 82, 2013, 55, t(8, 4, 7, 8, 3, 7)),
  // Şahin — the jewel of the young side; Bundesliga Player of the Season in 2011,
  // then his Madrid move and recurring knee trouble stalled him. Lost talent (88).
  q('dortmund', 'sahin09', 'Nuri Şahin', 1988, 'Turkey', ['CM', 'AM'], 76, 87, 2012, 55, t(8, 6, 8, 6, 5, 6), { latentCeiling: 88 }),
  q('dortmund', 'grosskreutz09', 'Kevin Großkreutz', 1988, 'Germany', ['LW', 'RW'], 71, 79, 2013, 30, t(6, 5, 7, 9, 6, 7)),
  q('dortmund', 'blaszczykowski09', 'Jakub Błaszczykowski', 1985, 'Poland', ['RW', 'RB'], 75, 79, 2012, 40, t(8, 5, 6, 8, 4, 7)),
  q('dortmund', 'hajnal09', 'Tamás Hajnal', 1981, 'Hungary', ['AM', 'CM'], 73, 75, 2012, 40, t(7, 5, 5, 6, 4, 7)),
  q('dortmund', 'barrios09', 'Lucas Barrios', 1984, 'Paraguay', ['ST'], 78, 80, 2013, 35, t(7, 6, 7, 6, 5, 6)),
  q('dortmund', 'valdez09', 'Nelson Valdez', 1983, 'Paraguay', ['ST', 'LW'], 71, 76, 2011, 35, t(6, 5, 6, 6, 5, 6)),
  q('dortmund', 'zidan09', 'Mohamed Zidan', 1981, 'Egypt', ['ST', 'AM'], 73, 76, 2013, 55, t(6, 7, 6, 5, 7, 6)),
  q('dortmund', 'santana09', 'Felipe Santana', 1986, 'Brazil', ['CB'], 69, 76, 2013, 35, t(7, 5, 6, 7, 5, 6)),
];

/** FC Schalke 04, 2009–10 — Magath's runners-up: a young Neuer and Rakitić either
 *  side of Kurányi's goals. */
export const SCHALKE_2009: CuratedSeed[] = [
  q('schalke', 'neuer09', 'Manuel Neuer', 1986, 'Germany', ['GK'], 82, 92, 2011, 12, t(9, 5, 9, 6, 3, 8)),
  q('schalke', 'howedes09', 'Benedikt Höwedes', 1988, 'Germany', ['CB', 'RB'], 75, 84, 2014, 18, t(8, 4, 7, 9, 3, 7)),
  q('schalke', 'westermann09', 'Heiko Westermann', 1983, 'Germany', ['CB', 'DM'], 78, 80, 2013, 15, t(7, 5, 6, 6, 4, 7)),
  q('schalke', 'bordon09', 'Marcelo Bordon', 1976, 'Brazil', ['CB'], 77, 77, 2011, 28, t(7, 5, 5, 7, 5, 6)),
  q('schalke', 'rafinha09', 'Rafinha', 1985, 'Brazil', ['RB'], 78, 82, 2011, 20, t(6, 6, 6, 4, 7, 6)),
  q('schalke', 'jjones09', 'Jermaine Jones', 1981, 'United States', ['DM', 'CM'], 77, 78, 2012, 42, t(6, 7, 6, 4, 8, 5)),
  q('schalke', 'farfan09', 'Jefferson Farfán', 1984, 'Peru', ['RW', 'ST'], 80, 83, 2013, 35, t(6, 7, 6, 5, 6, 6)),
  q('schalke', 'kuranyi09', 'Kevin Kurányi', 1982, 'Germany', ['ST'], 81, 83, 2011, 20, t(7, 7, 6, 6, 6, 6)),
  q('schalke', 'rakitic09', 'Ivan Rakitić', 1988, 'Croatia', ['AM', 'CM'], 78, 90, 2011, 12, t(8, 5, 8, 5, 4, 8)),
  q('schalke', 'haltintop09', 'Halil Altıntop', 1982, 'Turkey', ['ST'], 71, 75, 2011, 25, t(6, 5, 5, 5, 5, 5)),
  q('schalke', 'schmitz09', 'Lukas Schmitz', 1988, 'Germany', ['LB'], 68, 74, 2013, 25, t(6, 4, 6, 6, 4, 6)),
  // Pander — a gifted left foot chronically wrecked by muscle/foot injuries. A
  // fragile-and-lost talent (latent 82) if a manager can keep him fit.
  q('schalke', 'pander09', 'Christian Pander', 1983, 'Germany', ['LB', 'CM'], 72, 78, 2011, 70, t(6, 4, 5, 7, 4, 5), { latentCeiling: 82 }),
  q('schalke', 'fernst09', 'Fabian Ernst', 1979, 'Germany', ['DM', 'CM'], 74, 76, 2011, 45, t(7, 5, 5, 7, 4, 6)),
  q('schalke', 'matip09', 'Joël Matip', 1991, 'Cameroon', ['CB', 'DM'], 65, 85, 2013, 20, t(7, 4, 7, 7, 3, 7)),
];

/** VfB Stuttgart, 2009–10 — a young Khedira anchoring; Lehmann in goal. */
export const STUTTGART_2009: CuratedSeed[] = [
  q('stuttgart', 'lehmann09', 'Jens Lehmann', 1969, 'Germany', ['GK'], 76, 76, 2011, 35, t(8, 9, 7, 6, 8, 6)),
  q('stuttgart', 'ulreich09', 'Sven Ulreich', 1988, 'Germany', ['GK'], 62, 76, 2013, 25, t(7, 5, 7, 8, 4, 7)),
  q('stuttgart', 'delpierre09', 'Matthieu Delpierre', 1981, 'France', ['CB'], 74, 75, 2012, 40, t(8, 5, 6, 8, 4, 7)),
  q('stuttgart', 'tasci09', 'Serdar Taşçı', 1987, 'Germany', ['CB'], 74, 82, 2013, 40, t(7, 6, 8, 7, 5, 7)),
  q('stuttgart', 'boka09', 'Arthur Boka', 1983, 'Ivory Coast', ['LB'], 72, 74, 2013, 45, t(7, 6, 6, 7, 5, 7)),
  q('stuttgart', 'boulahrouz09', 'Khalid Boulahrouz', 1981, 'Netherlands', ['CB', 'RB'], 72, 74, 2012, 60, t(7, 6, 6, 6, 6, 6)),
  q('stuttgart', 'traesch09', 'Christian Träsch', 1987, 'Germany', ['RB', 'DM'], 71, 79, 2013, 30, t(8, 5, 8, 7, 4, 8)),
  q('stuttgart', 'khedira09', 'Sami Khedira', 1987, 'Germany', ['DM', 'CM'], 76, 88, 2011, 30, t(9, 6, 9, 6, 4, 8)),
  q('stuttgart', 'hleb09', 'Aleksandr Hleb', 1981, 'Belarus', ['AM', 'RW'], 77, 80, 2011, 45, t(7, 7, 7, 4, 7, 6), { loanFrom: 'barcelona' }),
  q('stuttgart', 'kuzmanovic09', 'Zdravko Kuzmanović', 1987, 'Serbia', ['CM', 'AM'], 73, 80, 2013, 35, t(6, 7, 7, 6, 7, 6)),
  // Gebhart — a much-hyped young attacker who never kicked on. Lost talent (80).
  q('stuttgart', 'gebhart09', 'Timo Gebhart', 1989, 'Germany', ['AM', 'LW'], 63, 76, 2013, 40, t(6, 7, 8, 6, 7, 6), { latentCeiling: 80 }),
  q('stuttgart', 'cacau09', 'Cacau', 1981, 'Germany', ['ST'], 75, 76, 2012, 45, t(8, 6, 7, 8, 5, 8)),
  q('stuttgart', 'pogrebnyak09', 'Pavel Pogrebnyak', 1983, 'Russia', ['ST'], 73, 75, 2013, 45, t(7, 6, 7, 6, 6, 6)),
  q('stuttgart', 'marica09', 'Ciprian Marica', 1985, 'Romania', ['ST'], 72, 78, 2012, 55, t(6, 7, 7, 6, 7, 6)),
];

/** Hamburger SV, 2009–10 — a Europa-League-semifinal side; a teenage Boateng at CB. */
export const HAMBURG_2009: CuratedSeed[] = [
  q('hamburg', 'rost09', 'Frank Rost', 1973, 'Germany', ['GK'], 78, 78, 2011, 30, t(8, 7, 6, 7, 6, 6)),
  q('hamburg', 'mathijsen09', 'Joris Mathijsen', 1980, 'Netherlands', ['CB'], 79, 79, 2011, 35, t(8, 5, 6, 7, 4, 7)),
  q('hamburg', 'boateng09', 'Jérôme Boateng', 1988, 'Germany', ['CB', 'RB'], 76, 88, 2011, 30, t(7, 7, 9, 4, 5, 8)),
  q('hamburg', 'demel09', 'Guy Demel', 1981, 'Ivory Coast', ['RB', 'CB'], 72, 74, 2012, 45, t(6, 5, 5, 6, 5, 6)),
  q('hamburg', 'aogo09', 'Dennis Aogo', 1987, 'Germany', ['LB'], 74, 81, 2013, 40, t(7, 5, 7, 6, 5, 7)),
  q('hamburg', 'jansen09', 'Marcell Jansen', 1985, 'Germany', ['LB', 'LW'], 77, 80, 2013, 45, t(6, 6, 6, 6, 6, 7)),
  q('hamburg', 'jarolim09', 'David Jarolím', 1979, 'Czech Republic', ['CM', 'DM'], 76, 76, 2011, 40, t(8, 5, 6, 9, 4, 7)),
  q('hamburg', 'zeroberto09', 'Zé Roberto', 1974, 'Brazil', ['CM', 'LB'], 79, 79, 2011, 30, t(9, 6, 7, 6, 4, 8)),
  q('hamburg', 'ptroch09', 'Piotr Trochowski', 1984, 'Germany', ['AM', 'CM'], 80, 81, 2011, 40, t(7, 6, 7, 6, 6, 7)),
  q('hamburg', 'pitroipa09', 'Jonathan Pitroipa', 1986, 'Burkina Faso', ['RW', 'LW'], 71, 78, 2011, 45, t(6, 6, 6, 6, 6, 6)),
  // Elia — an electric, direct young winger (Dutch Talent of the Year 2009) whose
  // career stalled on temperament and inconsistency. A lost talent (latent 88).
  q('hamburg', 'elia09', 'Eljero Elia', 1987, 'Netherlands', ['LW', 'RW'], 74, 80, 2014, 40, t(5, 8, 6, 4, 8, 5), { latentCeiling: 88 }),
  q('hamburg', 'petric09', 'Mladen Petrić', 1981, 'Croatia', ['ST'], 79, 80, 2012, 55, t(7, 6, 6, 6, 5, 7)),
  q('hamburg', 'guerrero09', 'Paolo Guerrero', 1984, 'Peru', ['ST'], 74, 80, 2012, 45, t(6, 8, 7, 5, 8, 6)),
  q('hamburg', 'vannistelrooy09', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 80, 80, 2011, 55, t(9, 7, 7, 6, 5, 7)),
];

/** Bayer Leverkusen, 2009–10 — led the table for much of the season; a loaned-in
 *  teenage Toni Kroos ran the show alongside Vidal. */
export const LEVERKUSEN_2009: CuratedSeed[] = [
  // Adler — Germany's young No.1, whose run of injuries (a rib fracture cost him
  // the 2010 World Cup) kept eroding him. Fragile-and-lost (latent 84).
  q('leverkusen', 'adler09', 'René Adler', 1985, 'Germany', ['GK'], 80, 82, 2014, 60, t(8, 4, 7, 7, 4, 6), { latentCeiling: 84 }),
  q('leverkusen', 'friedrich09', 'Manuel Friedrich', 1979, 'Germany', ['CB'], 76, 77, 2012, 40, t(7, 4, 5, 7, 4, 6)),
  q('leverkusen', 'hyypia09', 'Sami Hyypiä', 1973, 'Finland', ['CB'], 78, 78, 2011, 25, t(9, 4, 6, 8, 3, 7)),
  q('leverkusen', 'kadlec09', 'Michal Kadlec', 1984, 'Czech Republic', ['LB', 'CB'], 75, 79, 2013, 35, t(7, 4, 6, 7, 4, 6)),
  q('leverkusen', 'castro09', 'Gonzalo Castro', 1987, 'Germany', ['RB', 'CM'], 75, 79, 2013, 30, t(7, 4, 6, 8, 4, 7)),
  q('leverkusen', 'rolfes09', 'Simon Rolfes', 1982, 'Germany', ['DM', 'CM'], 80, 82, 2013, 45, t(9, 4, 7, 8, 3, 6)),
  q('leverkusen', 'vidal09', 'Arturo Vidal', 1987, 'Chile', ['CM', 'DM'], 79, 90, 2012, 30, t(7, 7, 9, 4, 7, 7)),
  q('leverkusen', 'barnetta09', 'Tranquillo Barnetta', 1985, 'Switzerland', ['AM', 'RW'], 78, 82, 2012, 45, t(7, 5, 6, 6, 4, 7)),
  // Renato Augusto — a gifted Brazilian playmaker whose Leverkusen years were
  // repeatedly interrupted by injury; only bloomed later. Lost talent (84).
  q('leverkusen', 'augusto09', 'Renato Augusto', 1988, 'Brazil', ['AM', 'LW'], 74, 80, 2012, 55, t(6, 6, 7, 5, 5, 5), { latentCeiling: 84 }),
  // Kroos — on an 18-month loan from Bayern; a reality-rail future great. Huge ceiling.
  // On loan at Leverkusen from Bayern for 2009–10 (returned to Bayern in 2010, per the ledger).
  q('leverkusen', 'kroos09', 'Toni Kroos', 1990, 'Germany', ['AM', 'CM'], 79, 93, 2011, 20, t(9, 5, 9, 5, 3, 7), { loanFrom: 'bayern' }),
  q('leverkusen', 'kiessling09', 'Stefan Kießling', 1983, 'Germany', ['ST'], 82, 84, 2013, 30, t(8, 4, 6, 8, 4, 6)),
  q('leverkusen', 'helmes09', 'Patrick Helmes', 1984, 'Germany', ['ST'], 77, 82, 2013, 75, t(7, 5, 6, 6, 4, 6)),
  q('leverkusen', 'derdiyok09', 'Eren Derdiyok', 1988, 'Switzerland', ['ST', 'LW'], 74, 82, 2013, 35, t(6, 5, 6, 5, 5, 6)),
  q('leverkusen', 'lbender09', 'Lars Bender', 1989, 'Germany', ['DM', 'CM'], 74, 84, 2014, 50, t(8, 4, 7, 8, 4, 6)),
];

/** Real Madrid, 2009–10 — Florentino's second Galácticos: Ronaldo (£80m) and Kaká
 *  arrive alongside Benzema, Xabi Alonso and a young Sergio Ramos. */
export const REAL_MADRID_2009: CuratedSeed[] = [
  q('real_madrid', 'casillas09', 'Iker Casillas', 1981, 'Spain', ['GK'], 89, 90, 2013, 20, t(9, 6, 8, 10, 4, 8)),
  q('real_madrid', 'ramos09', 'Sergio Ramos', 1986, 'Spain', ['RB', 'CB'], 85, 92, 2013, 30, t(8, 8, 9, 9, 8, 8)),
  q('real_madrid', 'pepe09', 'Pepe', 1983, 'Portugal', ['CB'], 83, 85, 2013, 40, t(7, 7, 7, 8, 9, 7)),
  q('real_madrid', 'albiol09', 'Raúl Albiol', 1985, 'Spain', ['CB'], 79, 82, 2014, 30, t(8, 5, 6, 8, 4, 7)),
  q('real_madrid', 'arbeloa09', 'Álvaro Arbeloa', 1983, 'Spain', ['RB', 'LB'], 79, 81, 2013, 35, t(8, 6, 7, 9, 6, 8)),
  q('real_madrid', 'marcelo09', 'Marcelo', 1988, 'Brazil', ['LB'], 80, 90, 2013, 30, t(7, 7, 8, 9, 7, 8)),
  q('real_madrid', 'xabialonso09', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 87, 89, 2013, 25, t(9, 6, 8, 8, 4, 8), { archetype: 'deep-playmaker' }),
  q('real_madrid', 'lassdiarra09', 'Lassana Diarra', 1985, 'France', ['DM', 'CM'], 82, 85, 2012, 45, t(7, 7, 7, 6, 7, 6)),
  q('real_madrid', 'guti09', 'Guti', 1976, 'Spain', ['AM', 'CM'], 81, 84, 2011, 40, t(6, 8, 6, 9, 8, 7)),
  q('real_madrid', 'ronaldo09', 'Cristiano Ronaldo', 1985, 'Portugal', ['LW', 'ST'], 92, 95, 2015, 25, t(10, 10, 10, 7, 7, 8), { archetype: 'inside-forward' }),
  // Kaká — arrived as a Ballon d'Or great, then knee and groin injuries wrecked
  // his Madrid years. The era's definitive fragile-and-lost star (latent 90).
  q('real_madrid', 'kaka09', 'Kaká', 1982, 'Brazil', ['AM'], 86, 88, 2015, 80, t(9, 6, 8, 7, 4, 6), { latentCeiling: 90 , archetype: 'playmaker' }),
  q('real_madrid', 'benzema09', 'Karim Benzema', 1987, 'France', ['ST'], 79, 91, 2015, 30, t(7, 7, 8, 7, 6, 6)),
  q('real_madrid', 'higuain09', 'Gonzalo Higuaín', 1987, 'Argentina', ['ST'], 82, 87, 2013, 40, t(8, 6, 8, 7, 5, 7)),
  q('real_madrid', 'raul09', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 82, 84, 2010, 35, t(9, 8, 8, 10, 5, 8)),
  q('real_madrid', 'vdvaart09', 'Rafael van der Vaart', 1983, 'Netherlands', ['AM'], 82, 85, 2012, 45, t(7, 7, 7, 6, 7, 8)),
  q('real_madrid', 'granero09', 'Esteban Granero', 1987, 'Spain', ['CM', 'AM'], 74, 82, 2015, 35, t(8, 5, 7, 8, 5, 7)),
];

/** 1. FC Köln, 2009–10 — Lukas Podolski home at his boyhood club; Novaković's goals. */
export const KOLN_2009: CuratedSeed[] = [
  q('koln', 'mondragon09', 'Faryd Mondragón', 1971, 'Colombia', ['GK'], 72, 72, 2011, 35, t(9, 5, 5, 7, 3, 8)),
  q('koln', 'geromel09', 'Pedro Geromel', 1985, 'Brazil', ['CB'], 69, 76, 2012, 30, t(8, 4, 7, 6, 3, 6)),
  q('koln', 'mohamad09', 'Youssef Mohamad', 1980, 'Lebanon', ['CB'], 68, 68, 2013, 40, t(7, 4, 5, 7, 4, 6)),
  q('koln', 'brecko09', 'Miso Brečko', 1984, 'Slovenia', ['RB'], 68, 70, 2013, 30, t(8, 3, 5, 7, 3, 7)),
  q('koln', 'ehret09', 'Fabrice Ehret', 1979, 'France', ['LB'], 66, 66, 2012, 40, t(7, 4, 4, 6, 4, 6)),
  q('koln', 'mckenna09', 'Kevin McKenna', 1980, 'Canada', ['CB', 'ST'], 68, 68, 2012, 35, t(8, 3, 5, 8, 3, 7)),
  q('koln', 'petit09', 'Petit', 1976, 'Portugal', ['DM'], 72, 72, 2011, 45, t(7, 5, 5, 6, 5, 7)),
  q('koln', 'matuszczyk09', 'Adam Matuszczyk', 1989, 'Poland', ['DM', 'CM'], 58, 70, 2013, 30, t(6, 4, 6, 6, 5, 6)),
  // Chihi — a winger of genuine flair tipped for the top, derailed by injuries and
  // inconsistency. A fragile-and-lost talent (latent 80).
  q('koln', 'chihi09', 'Adil Chihi', 1988, 'Morocco', ['LW', 'AM'], 65, 74, 2013, 70, t(4, 7, 6, 5, 7, 5), { latentCeiling: 80 }),
  q('koln', 'freis09', 'Sebastian Freis', 1985, 'Germany', ['RW', 'ST'], 66, 68, 2011, 55, t(7, 4, 5, 7, 4, 6)),
  q('koln', 'podolski09', 'Lukas Podolski', 1985, 'Germany', ['ST', 'LW'], 80, 84, 2012, 25, t(7, 6, 8, 9, 5, 7)),
  q('koln', 'novakovic09', 'Milivoje Novaković', 1979, 'Slovenia', ['ST'], 74, 75, 2013, 30, t(8, 4, 6, 7, 3, 7)),
  q('koln', 'kessler09', 'Thomas Kessler', 1986, 'Germany', ['GK'], 62, 68, 2011, 20, t(8, 3, 4, 9, 3, 6)),
];

/** 1899 Hoffenheim, 2009–10 — Rangnick's exciting young project; Gustavo and a
 *  young Demba Ba on the way up, Carlos Eduardo the gifted flair man. */
export const HOFFENHEIM_2009: CuratedSeed[] = [
  q('hoffenheim', 'hildebrand09', 'Timo Hildebrand', 1979, 'Germany', ['GK'], 74, 76, 2012, 25, t(7, 6, 6, 5, 5, 6)),
  q('hoffenheim', 'beck09', 'Andreas Beck', 1987, 'Germany', ['RB'], 73, 79, 2012, 20, t(8, 4, 6, 7, 3, 7)),
  q('hoffenheim', 'compper09', 'Marvin Compper', 1985, 'Germany', ['CB'], 70, 74, 2012, 30, t(7, 4, 5, 6, 4, 6)),
  q('hoffenheim', 'simunic09', 'Josip Šimunić', 1978, 'Croatia', ['CB'], 73, 74, 2012, 30, t(6, 6, 5, 6, 7, 6)),
  q('hoffenheim', 'vorsah09', 'Isaac Vorsah', 1988, 'Ghana', ['CB'], 69, 78, 2013, 45, t(7, 3, 7, 7, 4, 6)),
  q('hoffenheim', 'nilsson09', 'Per Nilsson', 1982, 'Sweden', ['CB', 'RB'], 70, 72, 2012, 25, t(8, 3, 5, 8, 3, 7)),
  q('hoffenheim', 'gustavo09', 'Luiz Gustavo', 1987, 'Brazil', ['DM', 'CM'], 74, 86, 2013, 20, t(8, 5, 9, 5, 4, 7)),
  q('hoffenheim', 'weis09', 'Tobias Weis', 1985, 'Germany', ['CM', 'DM'], 65, 72, 2012, 30, t(6, 4, 5, 6, 4, 6)),
  q('hoffenheim', 'salihovic09', 'Sejad Salihović', 1984, 'Bosnia and Herzegovina', ['LW', 'LB'], 74, 77, 2013, 40, t(6, 6, 6, 7, 6, 6)),
  // Carlos Eduardo — the side's most gifted footballer; a record move to Rubin
  // Kazan and repeated injuries stalled him for good. Lost talent (latent 87).
  q('hoffenheim', 'carloseduardo09', 'Carlos Eduardo', 1987, 'Brazil', ['AM', 'LW'], 78, 84, 2013, 65, t(6, 7, 8, 4, 6, 5), { latentCeiling: 87 }),
  q('hoffenheim', 'demba09', 'Demba Ba', 1985, 'Senegal', ['ST'], 73, 85, 2012, 30, t(7, 6, 9, 4, 5, 7)),
  // Ibišević — a runaway top scorer until an ACL rupture; a fragile-and-lost
  // striker (latent 84) whose knee kept him from the level he'd shown.
  q('hoffenheim', 'ibisevic09', 'Vedad Ibišević', 1984, 'Bosnia and Herzegovina', ['ST'], 76, 82, 2013, 70, t(8, 5, 7, 6, 5, 6), { latentCeiling: 84 }),
  q('hoffenheim', 'obasi09', 'Chinedu Obasi', 1986, 'Nigeria', ['LW', 'ST'], 71, 79, 2012, 55, t(6, 6, 6, 5, 6, 6)),
];

/** Borussia Mönchengladbach, 2009–10 — a relegation-scrap side, but home to a
 *  raw teenage Marco Reus and a young Dante at the back. */
export const GLADBACH_2009: CuratedSeed[] = [
  q('gladbach', 'bailly09', 'Logan Bailly', 1985, 'Belgium', ['GK'], 72, 76, 2012, 35, t(7, 6, 6, 6, 5, 7)),
  q('gladbach', 'daems09', 'Filip Daems', 1978, 'Belgium', ['LB'], 74, 74, 2012, 30, t(8, 5, 6, 8, 4, 7)),
  q('gladbach', 'brouwers09', 'Roel Brouwers', 1981, 'Netherlands', ['CB'], 71, 73, 2013, 30, t(7, 4, 5, 8, 4, 7)),
  q('gladbach', 'dante09', 'Dante', 1983, 'Brazil', ['CB'], 75, 80, 2012, 25, t(7, 7, 8, 6, 6, 7)),
  q('gladbach', 'levels09', 'Tobias Levels', 1986, 'Germany', ['RB', 'CB'], 68, 71, 2012, 40, t(7, 5, 6, 7, 4, 7)),
  q('gladbach', 'jantschke09', 'Tony Jantschke', 1990, 'Germany', ['CB', 'RB'], 62, 74, 2012, 30, t(8, 4, 7, 10, 4, 8)),
  q('gladbach', 'bradley09', 'Michael Bradley', 1987, 'United States', ['CM', 'DM'], 72, 78, 2012, 25, t(9, 6, 8, 6, 6, 7)),
  q('gladbach', 'meeuwis09', 'Marcel Meeuwis', 1980, 'Netherlands', ['CM'], 66, 68, 2012, 40, t(6, 5, 5, 6, 5, 6)),
  q('gladbach', 'arango09', 'Juan Arango', 1980, 'Venezuela', ['AM', 'LW'], 76, 76, 2012, 30, t(8, 7, 7, 6, 6, 7)),
  q('gladbach', 'matmour09', 'Karim Matmour', 1985, 'Algeria', ['RW', 'LW'], 68, 71, 2012, 35, t(7, 6, 6, 6, 6, 7)),
  // Reus — a raw wide forward here, a season from exploding into one of Europe's
  // best. Reality-rail (huge ceiling); a modest fragility flag for later years.
  q('gladbach', 'reus09', 'Marco Reus', 1989, 'Germany', ['RW', 'AM'], 70, 92, 2013, 45, t(9, 6, 9, 6, 6, 8)),
  q('gladbach', 'herrmann09', 'Patrick Herrmann', 1991, 'Germany', ['RW'], 57, 74, 2014, 40, t(7, 5, 7, 9, 5, 7)),
  q('gladbach', 'bobadilla09', 'Raúl Bobadilla', 1987, 'Argentina', ['ST'], 66, 72, 2012, 40, t(6, 7, 6, 5, 6, 6)),
  q('gladbach', 'neuville09', 'Oliver Neuville', 1973, 'Germany', ['ST'], 63, 63, 2011, 55, t(9, 5, 5, 7, 5, 7)),
];

/** Hannover 96, 2009–10 — a lower-mid side led by Ya Konan's goals. */
export const HANNOVER_2009: CuratedSeed[] = [
  q('hannover', 'fromlowitz09', 'Florian Fromlowitz', 1986, 'Germany', ['GK'], 68, 71, 2011, 30, t(7, 4, 6, 6, 4, 6)),
  q('hannover', 'cherundolo09', 'Steve Cherundolo', 1979, 'United States', ['RB'], 76, 76, 2012, 55, t(9, 3, 7, 10, 3, 8)),
  q('hannover', 'djakpa09', 'Constant Djakpa', 1986, 'Ivory Coast', ['LB', 'CB'], 69, 74, 2011, 30, t(6, 5, 7, 5, 5, 6)),
  q('hannover', 'haggui09', 'Karim Haggui', 1984, 'Tunisia', ['CB'], 72, 73, 2012, 35, t(7, 5, 6, 6, 5, 6)),
  q('hannover', 'balitsch09', 'Hanno Balitsch', 1981, 'Germany', ['RB', 'DM'], 70, 70, 2011, 40, t(8, 4, 6, 7, 4, 7)),
  q('hannover', 'schulz09', 'Christian Schulz', 1983, 'Germany', ['CB', 'LB'], 71, 72, 2012, 35, t(7, 4, 6, 7, 4, 7)),
  q('hannover', 'pinto09', 'Sérgio Pinto', 1980, 'Portugal', ['DM', 'CM'], 70, 70, 2012, 30, t(7, 5, 6, 7, 5, 7)),
  q('hannover', 'rosenthal09', 'Jan Rosenthal', 1986, 'Germany', ['AM', 'LW'], 69, 76, 2011, 55, t(7, 4, 6, 6, 4, 6)),
  q('hannover', 'stajner09', 'Jiří Štajner', 1976, 'Czech Republic', ['LW', 'ST'], 71, 71, 2011, 40, t(6, 6, 6, 9, 7, 6)),
  q('hannover', 'yakonan09', 'Didier Ya Konan', 1984, 'Ivory Coast', ['ST'], 77, 78, 2012, 30, t(8, 6, 8, 6, 4, 7)),
  q('hannover', 'hanke09', 'Mike Hanke', 1983, 'Germany', ['ST'], 73, 73, 2012, 35, t(7, 5, 6, 6, 5, 7)),
];

/** Eintracht Frankfurt, 2009–10 — a mid-table side; Meier and Schwegler its spine. */
export const FRANKFURT_2009: CuratedSeed[] = [
  q('frankfurt', 'nikolov09', 'Oka Nikolov', 1974, 'North Macedonia', ['GK'], 73, 73, 2012, 30, t(8, 3, 5, 10, 3, 7)),
  q('frankfurt', 'ochs09', 'Patrick Ochs', 1984, 'Germany', ['RB'], 70, 72, 2011, 30, t(7, 4, 6, 7, 4, 6)),
  q('frankfurt', 'franz09', 'Maik Franz', 1981, 'Germany', ['CB'], 73, 73, 2011, 35, t(7, 6, 6, 6, 7, 6)),
  q('frankfurt', 'russ09', 'Marco Russ', 1985, 'Germany', ['CB', 'DM'], 72, 75, 2013, 30, t(7, 3, 6, 9, 4, 7)),
  q('frankfurt', 'chris09', 'Chris', 1978, 'Brazil', ['CB', 'DM'], 72, 72, 2011, 35, t(7, 4, 5, 8, 4, 6)),
  q('frankfurt', 'spycher09', 'Christoph Spycher', 1978, 'Switzerland', ['LB'], 74, 74, 2011, 30, t(8, 4, 6, 7, 3, 7)),
  q('frankfurt', 'schwegler09', 'Pirmin Schwegler', 1987, 'Switzerland', ['CM', 'DM'], 77, 79, 2013, 35, t(8, 5, 7, 7, 4, 7)),
  q('frankfurt', 'teber09', 'Selim Teber', 1981, 'Germany', ['DM', 'CM'], 68, 68, 2012, 35, t(6, 4, 5, 6, 5, 6)),
  q('frankfurt', 'meier09', 'Alexander Meier', 1983, 'Germany', ['AM', 'ST'], 75, 79, 2013, 40, t(7, 4, 6, 9, 3, 6)),
  q('frankfurt', 'koehler09', 'Benjamin Köhler', 1980, 'Germany', ['LW', 'AM'], 71, 71, 2012, 40, t(7, 4, 5, 7, 4, 6)),
  q('frankfurt', 'caio09', 'Caio', 1986, 'Brazil', ['AM', 'RW'], 72, 78, 2011, 30, t(5, 6, 6, 5, 6, 5)),
  q('frankfurt', 'amanatidis09', 'Ioannis Amanatidis', 1981, 'Greece', ['ST'], 74, 74, 2011, 65, t(7, 5, 6, 7, 5, 6)),
  q('frankfurt', 'liberopoulos09', 'Nikos Liberopoulos', 1975, 'Greece', ['ST'], 73, 73, 2011, 55, t(8, 5, 6, 6, 4, 6)),
  // Fenin — a hat-trick on his Bundesliga debut, then injuries and off-field
  // troubles collapsed the whole thing. A cautionary lost talent (latent 82).
  q('frankfurt', 'fenin09', 'Martin Fenin', 1987, 'Czech Republic', ['ST'], 68, 76, 2012, 78, t(3, 7, 6, 4, 9, 4), { latentCeiling: 82 }),
];

/** 1. FSV Mainz 05, 2009–10 — newly promoted, finished a strong 9th under a young
 *  Thomas Tuchel; a teenage André Schürrle emerging. */
export const MAINZ_2009: CuratedSeed[] = [
  q('mainz', 'hmueller09', 'Heinz Müller', 1978, 'Germany', ['GK'], 71, 72, 2012, 30, t(8, 6, 5, 7, 4, 7)),
  q('mainz', 'noveski09', 'Nikolce Noveski', 1979, 'North Macedonia', ['CB'], 73, 74, 2013, 45, t(8, 5, 5, 9, 4, 7)),
  q('mainz', 'svensson09', 'Bo Svensson', 1979, 'Denmark', ['CB', 'LB'], 71, 72, 2012, 55, t(8, 4, 6, 8, 3, 7)),
  q('mainz', 'bungert09', 'Niko Bungert', 1986, 'Germany', ['CB'], 65, 76, 2013, 40, t(7, 5, 6, 9, 4, 7)),
  q('mainz', 'zabavnik09', 'Radoslav Zabavník', 1980, 'Slovakia', ['RB', 'CB'], 69, 70, 2013, 40, t(7, 5, 6, 6, 5, 7)),
  q('mainz', 'karhan09', 'Miroslav Karhan', 1976, 'Slovakia', ['DM', 'CM'], 72, 72, 2011, 45, t(9, 6, 7, 9, 3, 7)),
  q('mainz', 'soto09', 'Elkin Soto', 1980, 'Colombia', ['CM', 'DM'], 72, 73, 2013, 50, t(8, 5, 6, 9, 5, 7)),
  q('mainz', 'polanski09', 'Eugen Polanski', 1986, 'Germany', ['CM', 'DM'], 70, 78, 2012, 45, t(7, 6, 7, 6, 5, 7)),
  q('mainz', 'ivanschitz09', 'Andreas Ivanschitz', 1983, 'Austria', ['AM', 'LW'], 72, 74, 2012, 40, t(7, 6, 6, 6, 5, 6)),
  // Schürrle — the teenage breakout here; he reached the top (2014 World Cup) then
  // faded early. Reality-rail (a genuine high ceiling), not a lost talent.
  q('mainz', 'schurrle09', 'André Schürrle', 1990, 'Germany', ['LW', 'ST'], 69, 86, 2012, 45, t(7, 6, 8, 5, 6, 7)),
  q('mainz', 'szalai09', 'Ádám Szalai', 1987, 'Hungary', ['ST'], 70, 82, 2013, 50, t(7, 6, 7, 6, 5, 7)),
  q('mainz', 'bance09', 'Aristide Bancé', 1984, 'Burkina Faso', ['ST'], 70, 72, 2012, 45, t(6, 8, 6, 5, 7, 6)),
  q('mainz', 'allagui09', 'Sami Allagui', 1986, 'Tunisia', ['ST', 'RW'], 68, 74, 2012, 40, t(6, 6, 6, 6, 5, 6)),
];

/** Curated squads for the bayern-2009 scenario, keyed by club — a fully real
 *  top of the Bundesliga plus the galáctico Real Madrid as European context. */
/** Villarreal, 2008–09 (5th) — the Yellow Submarine's peak: Senna & Cazorla's
 *  midfield, a young Godín, Rossi up top, Pirès the veteran craft. */
export const VILLARREAL_2009: CuratedSeed[] = [
  q('villarreal', 'lopez09', 'Diego López', 1981, 'Spain', ['GK'], 80, 83, 2012, 25, t(8, 5, 7, 7, 3, 7), { archetype: 'keeper' }),
  q('villarreal', 'venta09', 'Javi Venta', 1975, 'Spain', ['RB'], 75, 75, 2011, 40, t(8, 4, 5, 9, 3, 6), { archetype: 'full-back-attacking' }),
  q('villarreal', 'angel09', 'Ángel López', 1981, 'Spain', ['RB', 'LB'], 75, 77, 2013, 35, t(7, 5, 6, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('villarreal', 'capdevila09', 'Joan Capdevila', 1978, 'Spain', ['LB'], 82, 82, 2012, 30, t(8, 5, 8, 7, 3, 7), { archetype: 'full-back-attacking' }),
  q('villarreal', 'godin09', 'Diego Godín', 1986, 'Uruguay', ['CB'], 78, 88, 2012, 25, t(9, 5, 9, 7, 3, 8), { archetype: 'stopper' }),
  q('villarreal', 'gonzalo09', 'Gonzalo Rodríguez', 1984, 'Argentina', ['CB'], 79, 82, 2013, 30, t(8, 5, 7, 7, 4, 7), { archetype: 'ball-playing-cb' }),
  q('villarreal', 'senna09', 'Marcos Senna', 1976, 'Spain', ['DM'], 84, 84, 2012, 35, t(9, 5, 8, 8, 3, 7), { archetype: 'deep-playmaker' }),
  q('villarreal', 'soriano09', 'Bruno Soriano', 1984, 'Spain', ['DM', 'CM'], 74, 84, 2013, 30, t(9, 4, 7, 10, 3, 7), { archetype: 'deep-playmaker' }),
  q('villarreal', 'cazorla09', 'Santi Cazorla', 1984, 'Spain', ['AM', 'LW'], 81, 90, 2013, 30, t(9, 5, 9, 7, 3, 9), { archetype: 'playmaker' }),
  q('villarreal', 'pires09', 'Robert Pirès', 1973, 'France', ['AM', 'LW'], 82, 82, 2010, 35, t(8, 6, 7, 7, 4, 8), { archetype: 'inside-forward' }),
  q('villarreal', 'cani09', 'Cani', 1981, 'Spain', ['RW', 'AM'], 77, 78, 2013, 40, t(6, 6, 6, 7, 6, 7), { archetype: 'winger-pace' }),
  q('villarreal', 'ibagaza09', 'Ariel Ibagaza', 1976, 'Argentina', ['AM', 'CM'], 76, 76, 2011, 35, t(8, 5, 6, 8, 3, 7), { archetype: 'playmaker' }),
  q('villarreal', 'rossi09', 'Giuseppe Rossi', 1987, 'Italy', ['ST'], 80, 90, 2013, 35, t(8, 7, 9, 6, 5, 8), { archetype: 'complete-forward' }),
  q('villarreal', 'nihat09', 'Nihat Kahveci', 1979, 'Turkey', ['ST', 'RW'], 80, 80, 2011, 50, t(6, 7, 6, 6, 6, 7), { archetype: 'poacher' }),
  q('villarreal', 'llorente09', 'Joseba Llorente', 1979, 'Spain', ['ST'], 76, 76, 2012, 35, t(8, 5, 6, 7, 4, 7), { archetype: 'poacher' }),
  q('villarreal', 'franco09', 'Guillermo Franco', 1976, 'Mexico', ['ST'], 74, 74, 2010, 55, t(7, 5, 6, 6, 5, 6), { archetype: 'target-man' }),
];

/** Sevilla, 2008–09 (3rd) — Luís Fabiano & Kanouté up top, Jesús Navas flying
 *  down the right, an emerging Fazio, Capel and Perotti. */
export const SEVILLA_2009: CuratedSeed[] = [
  q('sevilla', 'palop09', 'Andrés Palop', 1973, 'Spain', ['GK'], 79, 79, 2011, 25, t(8, 4, 6, 8, 3, 6), { archetype: 'keeper' }),
  q('sevilla', 'squillaci09', 'Sébastien Squillaci', 1980, 'France', ['CB'], 79, 80, 2012, 35, t(7, 5, 7, 5, 4, 6), { archetype: 'stopper' }),
  q('sevilla', 'escude09', 'Julien Escudé', 1979, 'France', ['CB'], 78, 79, 2011, 40, t(7, 4, 6, 6, 3, 7), { archetype: 'ball-playing-cb' }),
  q('sevilla', 'fazio09', 'Federico Fazio', 1987, 'Argentina', ['CB'], 71, 83, 2012, 30, t(7, 5, 8, 5, 5, 6), { archetype: 'stopper' }),
  q('sevilla', 'navarro09', 'Fernando Navarro', 1982, 'Spain', ['LB'], 77, 78, 2012, 35, t(7, 4, 6, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('sevilla', 'adriano09', 'Adriano Correia', 1984, 'Brazil', ['LB', 'RB'], 77, 80, 2011, 30, t(7, 5, 7, 5, 4, 7), { archetype: 'full-back-attacking' }),
  q('sevilla', 'konko09', 'Abdoulay Konko', 1984, 'France', ['RB'], 76, 79, 2013, 35, t(6, 5, 6, 5, 5, 6), { archetype: 'full-back-defensive' }),
  q('sevilla', 'renato09', 'Renato', 1979, 'Brazil', ['DM', 'CM'], 78, 79, 2012, 30, t(8, 4, 6, 8, 3, 7), { archetype: 'deep-playmaker' }),
  q('sevilla', 'duscher09', 'Aldo Duscher', 1979, 'Argentina', ['DM'], 74, 75, 2011, 45, t(6, 6, 6, 4, 7, 6), { archetype: 'destroyer' }),
  q('sevilla', 'romaric09', 'Romaric', 1983, 'Ivory Coast', ['CM', 'DM'], 76, 79, 2012, 40, t(6, 6, 7, 4, 6, 5), { archetype: 'box-to-box' }),
  q('sevilla', 'navas09', 'Jesús Navas', 1985, 'Spain', ['RW'], 82, 88, 2013, 25, t(8, 3, 6, 9, 5, 2), { archetype: 'winger-pace' }),
  q('sevilla', 'capel09', 'Diego Capel', 1988, 'Spain', ['LW'], 72, 84, 2012, 30, t(6, 5, 7, 6, 5, 6), { archetype: 'winger-pace' }),
  // Diego Perotti — huge promise a run of knee/hamstring injuries never let bloom.
  q('sevilla', 'perotti09', 'Diego Perotti', 1988, 'Argentina', ['LW', 'RW'], 68, 84, 2012, 55, t(6, 5, 7, 5, 6, 6), { archetype: 'inside-forward', latentCeiling: 87 }),
  q('sevilla', 'fabiano09', 'Luís Fabiano', 1980, 'Brazil', ['ST'], 85, 86, 2011, 45, t(6, 7, 8, 5, 6, 6), { archetype: 'complete-forward' }),
  q('sevilla', 'kanoute09', 'Frédéric Kanouté', 1977, 'Mali', ['ST'], 84, 84, 2010, 35, t(9, 4, 6, 8, 2, 7), { archetype: 'target-man' }),
];

/** 1. FC Nürnberg, 2009–10 — promoted, survived 16th via the relegation play-off;
 *  a teenage İlkay Gündoğan emerging alongside top-scorer Albert Bunjaku. */
export const NURNBERG_2009: CuratedSeed[] = [
  q('nurnberg', 'rschafer09', 'Raphael Schäfer', 1979, 'Germany', ['GK'], 70, 71, 2012, 30, t(7, 4, 5, 9, 4, 6)),
  q('nurnberg', 'diekmeier09', 'Dennis Diekmeier', 1989, 'Germany', ['RB'], 67, 74, 2013, 35, t(6, 5, 7, 6, 5, 6)),
  q('nurnberg', 'pinola09', 'Javier Pinola', 1983, 'Argentina', ['LB', 'CB'], 70, 71, 2012, 35, t(8, 4, 6, 9, 5, 7)),
  q('nurnberg', 'wolf09', 'Andreas Wolf', 1982, 'Germany', ['CB'], 70, 71, 2011, 40, t(8, 5, 6, 9, 4, 6)),
  q('nurnberg', 'maroh09', 'Dominic Maroh', 1987, 'Slovenia', ['CB'], 65, 72, 2012, 35, t(6, 4, 6, 7, 5, 6)),
  q('nurnberg', 'kluge09', 'Peer Kluge', 1980, 'Germany', ['DM', 'CM'], 68, 69, 2011, 40, t(7, 5, 5, 5, 5, 6)),
  q('nurnberg', 'frantz09', 'Mike Frantz', 1986, 'Germany', ['CM', 'LB'], 68, 73, 2012, 35, t(7, 4, 7, 6, 4, 7)),
  // Gündoğan — the teenage breakout here; reached the top (Dortmund, Man City,
  // a Treble). Reality-rail: low current ability, a real elite ceiling.
  q('nurnberg', 'gundogan09', 'İlkay Gündoğan', 1990, 'Germany', ['CM', 'AM'], 68, 86, 2012, 40, t(8, 5, 9, 5, 4, 8)),
  q('nurnberg', 'mintal09', 'Marek Mintál', 1977, 'Slovakia', ['AM', 'ST'], 66, 66, 2011, 55, t(7, 3, 4, 9, 3, 6)),
  q('nurnberg', 'gygax09', 'Daniel Gygax', 1981, 'Switzerland', ['RW', 'AM'], 69, 70, 2010, 35, t(7, 5, 5, 5, 5, 7)),
  q('nurnberg', 'bunjaku09', 'Albert Bunjaku', 1983, 'Switzerland', ['ST'], 73, 74, 2012, 40, t(7, 6, 7, 6, 5, 6)),
  q('nurnberg', 'choupomoting09', 'Eric Maxim Choupo-Moting', 1989, 'Germany', ['LW', 'ST'], 69, 80, 2010, 35, t(6, 7, 7, 4, 6, 7)),
  q('nurnberg', 'eigler09', 'Christian Eigler', 1984, 'Germany', ['ST'], 66, 68, 2012, 40, t(6, 4, 5, 7, 5, 6)),
];

/** Hertha BSC, 2009–10 — relegated 18th; Favre's collapse, Raffael's flair
 *  wasted, a pre-Dortmund Piszczek, mid-season loans that failed to stop the drop. */
export const HERTHA_2009: CuratedSeed[] = [
  q('hertha', 'drobny09', 'Jaroslav Drobný', 1979, 'Czech Republic', ['GK'], 69, 70, 2010, 32, t(7, 4, 6, 7, 4, 6)),
  q('hertha', 'afriedrich09', 'Arne Friedrich', 1979, 'Germany', ['CB', 'RB'], 71, 72, 2011, 33, t(8, 5, 7, 8, 4, 6)),
  // Piszczek — a wide man here, remade into a world-class right-back at Dortmund.
  // Reality-rail: modest now, elite ceiling.
  q('hertha', 'piszczek09', 'Łukasz Piszczek', 1985, 'Poland', ['RB', 'RW'], 68, 86, 2010, 30, t(8, 5, 8, 6, 4, 8)),
  q('hertha', 'hubnik09', 'Roman Hubník', 1984, 'Czech Republic', ['CB'], 66, 68, 2010, 34, t(7, 4, 6, 6, 5, 6)),
  q('hertha', 'lustenberger09', 'Fabian Lustenberger', 1988, 'Switzerland', ['CB', 'DM'], 65, 74, 2013, 40, t(7, 4, 6, 8, 4, 7)),
  q('hertha', 'kobiashvili09', 'Levan Kobiashvili', 1977, 'Georgia', ['CM', 'LB'], 67, 68, 2011, 38, t(7, 6, 6, 6, 6, 6)),
  q('hertha', 'dardai09', 'Pál Dárdai', 1976, 'Hungary', ['DM', 'CM'], 64, 64, 2011, 36, t(8, 3, 5, 10, 3, 7)),
  // Kačar — a much-hyped Serbian midfielder whose career never kicked on. A wasted
  // talent (latent 79).
  q('hertha', 'kacar09', 'Gojko Kačar', 1987, 'Serbia', ['DM', 'CM'], 67, 70, 2011, 42, t(6, 7, 7, 5, 7, 5), { latentCeiling: 79 }),
  q('hertha', 'cicero09', 'Cícero Santos', 1984, 'Brazil', ['DM', 'CM'], 66, 68, 2012, 33, t(7, 5, 6, 6, 5, 6)),
  q('hertha', 'raffael09', 'Raffael Caetano de Araújo', 1985, 'Brazil', ['AM', 'LW'], 75, 80, 2011, 40, t(7, 5, 7, 7, 5, 7)),
  q('hertha', 'nicu09', 'Maximilian Nicu', 1982, 'Romania', ['AM', 'LW'], 64, 66, 2011, 38, t(6, 5, 6, 6, 6, 6)),
  q('hertha', 'gekas09', 'Theofanis Gekas', 1980, 'Greece', ['ST'], 69, 71, 2010, 34, t(7, 7, 7, 5, 5, 6), { loanFrom: 'leverkusen' }),
  q('hertha', 'aramos09', 'Adrián Ramos', 1986, 'Colombia', ['ST'], 66, 78, 2013, 32, t(7, 5, 7, 6, 5, 7)),
];

/** VfL Bochum, 2009–10 — relegated 16th via the play-off; a modest Ruhr side built
 *  on Šesták's goals, a young Christian Fuchs at left-back, and Dabrowski's midfield. */
export const BOCHUM_2009: CuratedSeed[] = [
  q('bochum', 'heerwagen09', 'Philipp Heerwagen', 1983, 'Germany', ['GK'], 67, 68, 2013, 40, t(7, 4, 5, 7, 4, 6)),
  q('bochum', 'luthe09', 'Andreas Luthe', 1987, 'Germany', ['GK'], 62, 72, 2012, 35, t(7, 4, 7, 6, 4, 6)),
  q('bochum', 'maltritz09', 'Marcel Maltritz', 1978, 'Germany', ['CB'], 68, 68, 2011, 45, t(7, 5, 5, 8, 6, 6)),
  q('bochum', 'fabian09', 'Patrick Fabian', 1987, 'Germany', ['CB'], 63, 70, 2013, 40, t(7, 4, 6, 9, 4, 6)),
  q('bochum', 'mavraj09', 'Mergim Mavraj', 1986, 'Albania', ['CB'], 64, 70, 2012, 42, t(6, 6, 7, 5, 6, 6)),
  // Fuchs — the best young talent here, later a Premier League title winner with
  // Leicester. Reality-rail.
  q('bochum', 'fuchs09', 'Christian Fuchs', 1986, 'Austria', ['LB'], 72, 78, 2011, 35, t(8, 5, 8, 6, 5, 8)),
  q('bochum', 'concha09', 'Matias Concha', 1980, 'Sweden', ['RB'], 66, 66, 2011, 45, t(6, 5, 5, 6, 6, 6)),
  q('bochum', 'dabrowski09', 'Christoph Dabrowski', 1978, 'Germany', ['DM', 'CM'], 67, 67, 2010, 45, t(8, 4, 5, 9, 4, 6)),
  // Azaouagh — a promising Schalke start collapsed into injury and drift. Wasted
  // talent (latent 74).
  q('bochum', 'azaouagh09', 'Mimoun Azaouagh', 1982, 'Germany', ['AM', 'CM'], 64, 66, 2011, 60, t(5, 6, 5, 5, 6, 5), { latentCeiling: 74 }),
  q('bochum', 'epalle09', 'Joel Epalle', 1978, 'Cameroon', ['RW', 'AM'], 66, 66, 2011, 45, t(6, 6, 6, 5, 6, 6)),
  q('bochum', 'sestak09', 'Stanislav Šesták', 1982, 'Slovakia', ['ST'], 73, 74, 2010, 40, t(7, 6, 7, 5, 6, 7)),
  q('bochum', 'dedic09', 'Zlatko Dedič', 1984, 'Slovenia', ['ST'], 67, 69, 2012, 42, t(6, 5, 6, 6, 6, 6)),
  q('bochum', 'klimowicz09', 'Diego Klimowicz', 1974, 'Argentina', ['ST'], 66, 66, 2010, 50, t(7, 6, 5, 7, 6, 6)),
];

/** SC Freiburg, 2009–10 — newly promoted, a spirited but thin lower-table side
 *  (14th) under Robin Dutt; built on cheap finds like Cissé and academy CB Toprak. */
export const FREIBURG_2009: CuratedSeed[] = [
  q('freiburg', 'pouplin09', 'Simon Pouplin', 1985, 'France', ['GK'], 68, 69, 2011, 30, t(7, 5, 6, 6, 4, 6)),
  // Cissé — a bargain here, then a prolific spell at Newcastle. Reality-rail.
  q('freiburg', 'cisse09', 'Papiss Cissé', 1985, 'Senegal', ['ST'], 74, 83, 2013, 35, t(7, 7, 9, 4, 5, 7)),
  q('freiburg', 'makiadi09', 'Cédric Makiadi', 1984, 'DR Congo', ['DM', 'CM'], 73, 74, 2012, 34, t(8, 5, 7, 6, 4, 7)),
  q('freiburg', 'schuster09', 'Julian Schuster', 1985, 'Germany', ['CM', 'DM'], 70, 72, 2013, 32, t(8, 4, 6, 9, 3, 7)),
  q('freiburg', 'krmas09', 'Pavel Krmaš', 1980, 'Czech Republic', ['CB'], 70, 71, 2012, 33, t(8, 4, 5, 8, 3, 6)),
  q('freiburg', 'butscher09', 'Heiko Butscher', 1980, 'Germany', ['CB'], 69, 69, 2011, 36, t(9, 5, 6, 9, 3, 6)),
  q('freiburg', 'mujdza09', 'Mensur Mujdža', 1984, 'Bosnia and Herzegovina', ['RB'], 69, 70, 2013, 34, t(7, 5, 6, 7, 4, 6)),
  q('freiburg', 'abdessadki09', 'Yacine Abdessadki', 1981, 'Morocco', ['AM', 'RW'], 69, 70, 2011, 38, t(7, 6, 6, 6, 5, 7)),
  q('freiburg', 'banovic09', 'Ivica Banović', 1980, 'Croatia', ['LW', 'LB'], 68, 69, 2011, 35, t(6, 6, 6, 6, 5, 6)),
  // Toprak — the academy centre-half who became a Leverkusen/Dortmund regular.
  q('freiburg', 'toprak09', 'Ömer Toprak', 1989, 'Turkey', ['CB', 'DM'], 66, 80, 2012, 42, t(7, 5, 8, 5, 4, 7)),
  q('freiburg', 'reisinger09', 'Stefan Reisinger', 1981, 'Germany', ['ST'], 66, 68, 2012, 40, t(7, 5, 6, 6, 4, 6)),
  q('freiburg', 'jager09', 'Jonathan Jäger', 1978, 'France', ['DM', 'CM'], 66, 67, 2011, 36, t(7, 4, 5, 7, 3, 6)),
  // Baumann — the teenage keeper who became a long-serving Bundesliga No.1.
  q('freiburg', 'baumann09', 'Oliver Baumann', 1990, 'Germany', ['GK'], 64, 78, 2013, 28, t(8, 4, 8, 7, 3, 7)),
];

/** Internazionale, 2009–10 — Mourinho's treble winners (Serie A + Coppa + the
 *  Champions League), the elite Italian pole of the era-2009 world. */
export const INTER_2009: CuratedSeed[] = [
  q('inter', 'juliocesar09', 'Júlio César', 1979, 'Brazil', ['GK'], 86, 86, 2014, 30, t(8, 5, 7, 7, 3, 7)),
  q('inter', 'maicon09', 'Maicon', 1981, 'Brazil', ['RB'], 87, 87, 2012, 35, t(7, 6, 7, 6, 4, 7)),
  q('inter', 'lucio09', 'Lúcio', 1978, 'Brazil', ['CB'], 85, 85, 2012, 35, t(8, 6, 7, 6, 4, 6)),
  q('inter', 'samuel09', 'Walter Samuel', 1978, 'Argentina', ['CB'], 84, 84, 2013, 50, t(9, 4, 6, 8, 3, 6)),
  q('inter', 'chivu09', 'Cristian Chivu', 1980, 'Romania', ['CB', 'LB'], 81, 81, 2012, 45, t(8, 4, 6, 7, 3, 7)),
  q('inter', 'zanetti09', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 85, 85, 2013, 25, t(10, 2, 7, 10, 1, 8)),
  q('inter', 'cambiasso09', 'Esteban Cambiasso', 1980, 'Argentina', ['DM'], 86, 86, 2014, 30, t(9, 3, 7, 8, 2, 7)),
  q('inter', 'motta09', 'Thiago Motta', 1982, 'Brazil', ['CM'], 82, 82, 2013, 45, t(7, 4, 7, 6, 4, 7)),
  q('inter', 'sneijder09', 'Wesley Sneijder', 1984, 'Netherlands', ['AM'], 88, 88, 2014, 40, t(7, 6, 8, 6, 5, 7)),
  q('inter', 'etoo09', 'Samuel Eto’o', 1981, 'Cameroon', ['ST', 'RW'], 87, 87, 2014, 35, t(8, 8, 9, 5, 5, 7)),
  q('inter', 'milito09', 'Diego Milito', 1979, 'Argentina', ['ST'], 88, 88, 2014, 35, t(9, 4, 7, 7, 2, 7)),
  q('inter', 'pandev09', 'Goran Pandev', 1983, 'North Macedonia', ['AM', 'ST'], 82, 82, 2014, 35, t(7, 5, 7, 6, 4, 7)),
  q('inter', 'stankovic09', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 82, 82, 2013, 40, t(9, 4, 7, 9, 3, 7)),
  // Balotelli — a generational talent here as a teenager, forever a what-might-have-been.
  q('inter', 'balotelli09', 'Mario Balotelli', 1990, 'Italy', ['ST'], 79, 87, 2013, 30, t(4, 9, 8, 3, 10, 5), { latentCeiling: 90 }),
];

/** Barcelona, 2009–10 — Guardiola's 99-point champions, a year on from the 2009
 *  treble; the pinnacle of the tiki-taka era and the world's best side. */
export const BARCELONA_2009: CuratedSeed[] = [
  q('barcelona', 'valdes09', 'Víctor Valdés', 1982, 'Spain', ['GK'], 84, 85, 2014, 28, t(8, 4, 7, 9, 4, 7)),
  q('barcelona', 'alves09', 'Dani Alves', 1983, 'Brazil', ['RB'], 85, 86, 2015, 30, t(8, 7, 8, 7, 5, 8)),
  q('barcelona', 'pique09', 'Gerard Piqué', 1987, 'Spain', ['CB'], 84, 87, 2015, 30, t(8, 6, 8, 8, 4, 8)),
  q('barcelona', 'puyol09', 'Carles Puyol', 1978, 'Spain', ['CB'], 85, 85, 2013, 38, t(10, 3, 9, 10, 2, 7)),
  q('barcelona', 'maxwell09', 'Maxwell', 1981, 'Brazil', ['LB'], 80, 81, 2013, 32, t(9, 3, 7, 8, 2, 8)),
  q('barcelona', 'busquets09', 'Sergio Busquets', 1988, 'Spain', ['DM', 'CM'], 83, 88, 2015, 28, t(9, 3, 8, 9, 2, 8)),
  q('barcelona', 'xavi09', 'Xavi Hernández', 1980, 'Spain', ['CM'], 89, 89, 2014, 28, t(10, 3, 8, 10, 2, 8)),
  q('barcelona', 'iniesta09', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 88, 89, 2015, 40, t(10, 2, 8, 10, 2, 8)),
  q('barcelona', 'yayatoure09', 'Yaya Touré', 1983, 'Ivory Coast', ['DM', 'CM'], 84, 85, 2014, 28, t(8, 6, 8, 6, 4, 7)),
  q('barcelona', 'keita09', 'Seydou Keita', 1980, 'Mali', ['CM', 'AM'], 81, 81, 2012, 30, t(9, 4, 7, 8, 3, 8)),
  q('barcelona', 'messi09', 'Lionel Messi', 1987, 'Argentina', ['RW', 'ST'], 92, 95, 2014, 35, t(9, 3, 9, 10, 2, 8)),
  q('barcelona', 'ibrahimovic09', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 86, 87, 2014, 32, t(8, 10, 9, 5, 6, 6)),
  q('barcelona', 'pedro09', 'Pedro Rodríguez', 1987, 'Spain', ['RW', 'ST'], 80, 85, 2014, 30, t(9, 3, 8, 9, 2, 8)),
  q('barcelona', 'henry09', 'Thierry Henry', 1977, 'France', ['LW', 'ST'], 83, 83, 2011, 38, t(9, 6, 8, 6, 3, 7)),
];

/** Chelsea, 2009–10 — Ancelotti's first season, the Double: PL champions (a record
 *  103 goals) and FA Cup. A veteran, physically dominant spine. */
export const CHELSEA_2009: CuratedSeed[] = [
  q('chelsea', 'cech09', 'Petr Čech', 1982, 'Czech Republic', ['GK'], 87, 87, 2013, 25, t(9, 5, 8, 9, 3, 7)),
  q('chelsea', 'ivanovic09', 'Branislav Ivanović', 1984, 'Serbia', ['RB', 'CB'], 82, 85, 2013, 25, t(9, 5, 8, 8, 3, 7)),
  q('chelsea', 'terry09', 'John Terry', 1980, 'England', ['CB'], 87, 87, 2013, 30, t(8, 7, 8, 10, 5, 7), { archetype: 'covering-cb' }),
  q('chelsea', 'carvalho09', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 84, 84, 2011, 40, t(7, 6, 7, 7, 5, 7), { archetype: 'covering-cb' }),
  q('chelsea', 'ashleycole09', 'Ashley Cole', 1980, 'England', ['LB'], 86, 86, 2013, 35, t(8, 7, 8, 7, 6, 7), { archetype: 'full-back-attacking' }),
  q('chelsea', 'essien09', 'Michael Essien', 1982, 'Ghana', ['CM', 'DM'], 85, 86, 2013, 45, t(8, 6, 8, 8, 4, 7)),
  q('chelsea', 'mikel09', 'John Obi Mikel', 1987, 'Nigeria', ['DM'], 78, 83, 2013, 25, t(8, 5, 7, 8, 5, 7), { archetype: 'deep-playmaker', latentCeiling: 84 }),
  q('chelsea', 'lampard09', 'Frank Lampard', 1978, 'England', ['CM', 'AM'], 89, 89, 2013, 25, t(10, 6, 9, 9, 3, 7)),
  q('chelsea', 'malouda09', 'Florent Malouda', 1980, 'France', ['LW', 'AM'], 83, 83, 2012, 30, t(8, 5, 7, 7, 5, 7), { archetype: 'inside-forward' }),
  q('chelsea', 'anelka09', 'Nicolas Anelka', 1979, 'France', ['ST', 'RW'], 84, 84, 2012, 30, t(7, 6, 7, 5, 6, 7), { archetype: 'poacher' }),
  q('chelsea', 'drogba09', 'Didier Drogba', 1978, 'Ivory Coast', ['ST'], 89, 89, 2012, 35, t(8, 8, 9, 7, 7, 7), { archetype: 'poacher' }),
  q('chelsea', 'ballack09', 'Michael Ballack', 1976, 'Germany', ['CM', 'AM'], 83, 83, 2011, 35, t(8, 7, 8, 6, 5, 7)),
  q('chelsea', 'deco09', 'Deco', 1977, 'Portugal', ['AM'], 81, 81, 2011, 45, t(6, 7, 7, 5, 6, 7), { archetype: 'playmaker' }),
  q('chelsea', 'joecole09', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 80, 82, 2011, 50, t(7, 6, 7, 7, 6, 7), { archetype: 'inside-forward', latentCeiling: 86 }),
  q('chelsea', 'kalou09', 'Salomon Kalou', 1985, 'Ivory Coast', ['RW', 'ST'], 78, 81, 2012, 25, t(7, 6, 7, 7, 5, 7)),
  q('chelsea', 'belletti09', 'Juliano Belletti', 1976, 'Brazil', ['RB'], 77, 77, 2011, 30, t(8, 5, 7, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('chelsea', 'zhirkov09', 'Yuri Zhirkov', 1983, 'Russia', ['LB', 'LW'], 78, 80, 2013, 35, t(7, 5, 7, 6, 5, 7), { archetype: 'full-back-attacking', latentCeiling: 82 }),
  q('chelsea', 'ferreira09', 'Paulo Ferreira', 1979, 'Portugal', ['RB', 'LB'], 76, 76, 2011, 30, t(9, 4, 6, 9, 3, 7)),
  q('chelsea', 'hilario09', 'Hilário', 1975, 'Portugal', ['GK'], 70, 70, 2011, 25, t(8, 4, 6, 9, 3, 7)),
];

/** Manchester United, 2009–10 — the post-Ronaldo season (he and Tévez had gone).
 *  Rooney carried the goals; the ageing Giggs/Scholes/Neville core still turned. */
export const MAN_UTD_2009: CuratedSeed[] = [
  q('man_utd', 'vandersar09', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 85, 85, 2011, 25, t(9, 4, 7, 8, 3, 8)),
  q('man_utd', 'foster09', 'Ben Foster', 1983, 'England', ['GK'], 74, 80, 2012, 35, t(7, 5, 6, 6, 5, 6)),
  q('man_utd', 'gneville09', 'Gary Neville', 1975, 'England', ['RB'], 76, 76, 2011, 45, t(9, 5, 8, 10, 6, 6)),
  q('man_utd', 'rafael09', 'Rafael da Silva', 1990, 'Brazil', ['RB'], 74, 84, 2014, 45, t(6, 6, 7, 7, 8, 6), { archetype: 'full-back-attacking', latentCeiling: 82 }),
  q('man_utd', 'ferdinand09', 'Rio Ferdinand', 1978, 'England', ['CB'], 87, 87, 2013, 45, t(7, 6, 8, 8, 5, 7), { archetype: 'covering-cb' }),
  q('man_utd', 'vidic09', 'Nemanja Vidić', 1981, 'Serbia', ['CB'], 87, 87, 2014, 30, t(9, 5, 8, 8, 5, 7)),
  q('man_utd', 'evra09', 'Patrice Evra', 1981, 'France', ['LB'], 84, 84, 2013, 25, t(8, 6, 8, 8, 6, 8), { archetype: 'full-back-attacking' }),
  q('man_utd', 'oshea09', 'John O\'Shea', 1981, 'Ireland', ['CB', 'RB', 'DM'], 78, 78, 2012, 35, t(8, 3, 6, 9, 3, 8)),
  q('man_utd', 'wbrown09', 'Wes Brown', 1979, 'England', ['CB', 'RB'], 76, 76, 2011, 50, t(7, 4, 6, 9, 4, 6)),
  q('man_utd', 'valencia09', 'Antonio Valencia', 1985, 'Ecuador', ['RW', 'RB'], 81, 84, 2013, 30, t(9, 3, 7, 8, 3, 7)),
  q('man_utd', 'carrick09', 'Michael Carrick', 1981, 'England', ['CM', 'DM'], 83, 83, 2013, 30, t(9, 3, 7, 9, 3, 7), { archetype: 'deep-playmaker' }),
  q('man_utd', 'fletcher09', 'Darren Fletcher', 1984, 'Scotland', ['CM'], 81, 82, 2013, 35, t(9, 4, 8, 9, 4, 7)),
  q('man_utd', 'scholes09', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 84, 84, 2011, 35, t(10, 2, 7, 10, 3, 6), { archetype: 'deep-playmaker' }),
  q('man_utd', 'giggs09', 'Ryan Giggs', 1973, 'Wales', ['LW', 'CM', 'AM'], 83, 83, 2011, 30, t(10, 3, 8, 10, 3, 8), { archetype: 'playmaker' }),
  q('man_utd', 'nani09', 'Nani', 1986, 'Portugal', ['LW', 'RW'], 80, 86, 2014, 30, t(6, 8, 8, 6, 7, 6), { archetype: 'inside-forward' }),
  q('man_utd', 'anderson09', 'Anderson', 1988, 'Brazil', ['CM', 'AM'], 77, 84, 2013, 50, t(4, 6, 6, 6, 6, 5), { latentCeiling: 84 }),
  q('man_utd', 'park09', 'Park Ji-sung', 1981, 'South Korea', ['LW', 'RW', 'AM'], 79, 80, 2012, 35, t(10, 2, 7, 9, 2, 9)),
  q('man_utd', 'rooney09', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 90, 90, 2013, 35, t(7, 7, 9, 7, 8, 7)),
  q('man_utd', 'berbatov09', 'Dimitar Berbatov', 1981, 'Bulgaria', ['ST'], 84, 84, 2012, 25, t(6, 8, 6, 6, 4, 6), { archetype: 'poacher' }),
  q('man_utd', 'owen09', 'Michael Owen', 1979, 'England', ['ST'], 78, 80, 2011, 68, t(8, 7, 7, 5, 4, 6), { archetype: 'poacher', latentCeiling: 85 }),
  q('man_utd', 'hargreaves09', 'Owen Hargreaves', 1981, 'England', ['DM', 'CM'], 78, 82, 2011, 70, t(8, 5, 6, 6, 5, 6), { latentCeiling: 84 }),
];

/** Manchester City, 2009–10 — the first full post-takeover season: Tévez, Adebayor,
 *  Barry and the Touré–Lescott spend, Robinho on the way out. 5th, Hughes→Mancini. */
export const MAN_CITY_2009: CuratedSeed[] = [
  q('man_city', 'given09', 'Shay Given', 1976, 'Ireland', ['GK'], 82, 82, 2013, 30, t(9, 4, 7, 7, 3, 7)),
  q('man_city', 'richards09', 'Micah Richards', 1988, 'England', ['RB', 'CB'], 78, 85, 2013, 40, t(6, 6, 7, 7, 5, 6), { archetype: 'full-back-attacking' }),
  q('man_city', 'zabaleta09', 'Pablo Zabaleta', 1985, 'Argentina', ['RB', 'LB'], 78, 83, 2012, 35, t(9, 4, 8, 8, 5, 8), { archetype: 'full-back-attacking' }),
  q('man_city', 'kompany09', 'Vincent Kompany', 1986, 'Belgium', ['CB', 'DM'], 80, 88, 2013, 30, t(10, 4, 9, 8, 2, 8), { archetype: 'covering-cb' }),
  q('man_city', 'kolotoure09', 'Kolo Touré', 1981, 'Ivory Coast', ['CB'], 81, 82, 2013, 30, t(8, 5, 7, 6, 4, 7), { archetype: 'covering-cb' }),
  q('man_city', 'lescott09', 'Joleon Lescott', 1982, 'England', ['CB'], 80, 82, 2014, 35, t(7, 5, 6, 5, 4, 6)),
  q('man_city', 'onuoha09', 'Nedum Onuoha', 1986, 'England', ['CB', 'RB'], 73, 78, 2012, 40, t(7, 4, 6, 7, 4, 6)),
  q('man_city', 'bridge09', 'Wayne Bridge', 1980, 'England', ['LB'], 76, 78, 2013, 45, t(6, 5, 5, 5, 4, 5)),
  q('man_city', 'garrido09', 'Javier Garrido', 1985, 'Spain', ['LB'], 73, 76, 2011, 30, t(6, 4, 5, 5, 3, 5)),
  q('man_city', 'dejong09', 'Nigel de Jong', 1984, 'Netherlands', ['DM', 'CM'], 80, 82, 2013, 35, t(8, 5, 7, 6, 6, 7)),
  q('man_city', 'barry09', 'Gareth Barry', 1981, 'England', ['CM', 'DM'], 83, 84, 2014, 25, t(8, 4, 7, 6, 3, 7), { archetype: 'deep-playmaker' }),
  q('man_city', 'ireland09', 'Stephen Ireland', 1986, 'Ireland', ['AM', 'CM'], 79, 84, 2013, 40, t(5, 7, 6, 4, 7, 4), { archetype: 'playmaker', latentCeiling: 87 }),
  q('man_city', 'swp09', 'Shaun Wright-Phillips', 1981, 'England', ['RW'], 78, 80, 2012, 35, t(7, 4, 6, 6, 3, 6)),
  q('man_city', 'petrov09', 'Martin Petrov', 1979, 'Bulgaria', ['LW'], 78, 78, 2011, 40, t(7, 4, 5, 5, 3, 6)),
  q('man_city', 'weiss09', 'Vladimír Weiss', 1989, 'Slovakia', ['RW', 'LW'], 68, 80, 2013, 30, t(5, 6, 7, 5, 6, 5)),
  q('man_city', 'tevez09', 'Carlos Tévez', 1984, 'Argentina', ['ST', 'AM'], 86, 87, 2014, 35, t(9, 8, 10, 3, 9, 6)),
  q('man_city', 'adebayor09', 'Emmanuel Adebayor', 1984, 'Togo', ['ST'], 84, 85, 2014, 35, t(6, 9, 8, 3, 8, 6), { archetype: 'poacher' }),
  q('man_city', 'robinho09', 'Robinho', 1984, 'Brazil', ['RW', 'LW', 'AM'], 84, 86, 2012, 40, t(5, 8, 7, 3, 8, 4), { archetype: 'inside-forward', latentCeiling: 90 }),
  q('man_city', 'bellamy09', 'Craig Bellamy', 1979, 'Wales', ['LW', 'ST'], 80, 80, 2012, 55, t(7, 7, 8, 5, 9, 6)),
  q('man_city', 'santacruz09', 'Roque Santa Cruz', 1981, 'Paraguay', ['ST'], 76, 79, 2012, 60, t(6, 5, 5, 5, 4, 5), { archetype: 'poacher' }),
];

/** Arsenal, 2009–10 — Wenger's young side around captain Fàbregas; Vermaelen in,
 *  Adebayor and Touré gone to City. 3rd, undone by a fragile spine (RvP, Eduardo). */
export const ARSENAL_2009: CuratedSeed[] = [
  q('arsenal', 'almunia09', 'Manuel Almunia', 1977, 'Spain', ['GK'], 76, 76, 2012, 30, t(7, 4, 6, 7, 4, 7)),
  q('arsenal', 'fabianski09', 'Łukasz Fabiański', 1985, 'Poland', ['GK'], 71, 78, 2012, 35, t(7, 5, 7, 6, 6, 6)),
  q('arsenal', 'sagna09', 'Bacary Sagna', 1983, 'France', ['RB'], 82, 83, 2014, 30, t(9, 4, 7, 8, 3, 8), { archetype: 'full-back-attacking' }),
  q('arsenal', 'clichy09', 'Gaël Clichy', 1985, 'France', ['LB'], 80, 82, 2013, 40, t(8, 4, 7, 7, 4, 8), { archetype: 'full-back-attacking' }),
  q('arsenal', 'vermaelen09', 'Thomas Vermaelen', 1985, 'Belgium', ['CB', 'LB'], 81, 85, 2014, 35, t(9, 5, 8, 7, 4, 8)),
  q('arsenal', 'gallas09', 'William Gallas', 1977, 'France', ['CB'], 82, 82, 2011, 45, t(7, 8, 7, 5, 7, 6), { archetype: 'covering-cb' }),
  q('arsenal', 'eboue09', 'Emmanuel Eboué', 1983, 'Ivory Coast', ['RB', 'RW'], 75, 76, 2012, 35, t(6, 6, 6, 7, 6, 7)),
  q('arsenal', 'song09', 'Alex Song', 1987, 'Cameroon', ['DM', 'CM'], 79, 84, 2013, 30, t(7, 6, 8, 6, 5, 7)),
  q('arsenal', 'fabregas09', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 89, 90, 2014, 45, t(9, 6, 9, 6, 4, 8), { archetype: 'playmaker' }),
  q('arsenal', 'diaby09', 'Abou Diaby', 1986, 'France', ['CM', 'AM'], 78, 82, 2013, 60, t(6, 5, 6, 6, 5, 6)),
  q('arsenal', 'denilson09', 'Denílson', 1988, 'Brazil', ['CM', 'DM'], 76, 80, 2014, 35, t(6, 6, 6, 6, 5, 6), { archetype: 'deep-playmaker', latentCeiling: 80 }),
  q('arsenal', 'nasri09', 'Samir Nasri', 1987, 'France', ['AM', 'LW', 'RW'], 80, 86, 2012, 40, t(6, 8, 8, 5, 7, 7), { archetype: 'inside-forward' }),
  q('arsenal', 'rosicky09', 'Tomáš Rosický', 1980, 'Czech Republic', ['AM', 'CM'], 79, 80, 2012, 55, t(9, 4, 7, 8, 3, 8), { archetype: 'playmaker' }),
  q('arsenal', 'wilshere09', 'Jack Wilshere', 1992, 'England', ['AM', 'CM'], 62, 87, 2013, 45, t(6, 7, 9, 8, 7, 7)),
  q('arsenal', 'ramsey09', 'Aaron Ramsey', 1990, 'Wales', ['CM', 'AM'], 72, 85, 2014, 40, t(8, 5, 8, 8, 4, 7), { archetype: 'playmaker', latentCeiling: 85 }),
  q('arsenal', 'walcott09', 'Theo Walcott', 1989, 'England', ['RW', 'ST'], 78, 85, 2013, 55, t(8, 5, 7, 8, 4, 8)),
  q('arsenal', 'arshavin09', 'Andrey Arshavin', 1981, 'Russia', ['LW', 'AM', 'ST'], 85, 85, 2013, 40, t(6, 7, 6, 5, 7, 5), { archetype: 'inside-forward' }),
  q('arsenal', 'vanpersie09', 'Robin van Persie', 1983, 'Netherlands', ['ST', 'LW'], 86, 87, 2013, 65, t(7, 7, 8, 6, 6, 7), { archetype: 'inside-forward' }),
  q('arsenal', 'eduardo09', 'Eduardo', 1983, 'Croatia', ['ST'], 78, 82, 2011, 68, t(8, 4, 6, 7, 4, 6), { archetype: 'poacher' }),
];

/** Liverpool, 2009–10 — Benítez's last season; the Torres–Gerrard axis, Alonso sold
 *  and (unhappily) replaced by Aquilani. A flat 7th after the near-miss title tilt. */
export const LIVERPOOL_2009: CuratedSeed[] = [
  q('liverpool', 'reina09', 'José Manuel Reina', 1982, 'Spain', ['GK'], 86, 86, 2013, 25, t(8, 5, 7, 7, 5, 7)),
  q('liverpool', 'johnson09', 'Glen Johnson', 1984, 'England', ['RB'], 80, 81, 2013, 40, t(6, 6, 6, 5, 5, 6), { archetype: 'full-back-attacking' }),
  q('liverpool', 'carragher09', 'Jamie Carragher', 1978, 'England', ['CB', 'RB'], 80, 80, 2012, 30, t(9, 4, 7, 10, 6, 6)),
  q('liverpool', 'agger09', 'Daniel Agger', 1985, 'Denmark', ['CB'], 80, 83, 2014, 55, t(8, 4, 6, 8, 4, 7), { archetype: 'covering-cb' }),
  q('liverpool', 'skrtel09', 'Martin Škrtel', 1984, 'Slovakia', ['CB'], 79, 82, 2013, 35, t(8, 5, 6, 7, 6, 6)),
  q('liverpool', 'insua09', 'Emiliano Insúa', 1989, 'Argentina', ['LB'], 74, 82, 2012, 30, t(6, 6, 7, 5, 5, 6), { archetype: 'full-back-attacking', latentCeiling: 82 }),
  q('liverpool', 'aurelio09', 'Fábio Aurélio', 1979, 'Brazil', ['LB'], 76, 76, 2011, 55, t(7, 4, 5, 7, 4, 7)),
  q('liverpool', 'kyrgiakos09', 'Sotirios Kyrgiakos', 1979, 'Greece', ['CB'], 72, 72, 2011, 40, t(7, 5, 5, 6, 7, 6)),
  q('liverpool', 'degen09', 'Philipp Degen', 1983, 'Switzerland', ['RB'], 70, 72, 2011, 45, t(6, 5, 5, 5, 5, 5)),
  q('liverpool', 'mascherano09', 'Javier Mascherano', 1984, 'Argentina', ['DM', 'CM'], 85, 86, 2012, 30, t(9, 5, 8, 6, 6, 7)),
  q('liverpool', 'lucas09', 'Lucas Leiva', 1987, 'Brazil', ['DM', 'CM'], 76, 83, 2013, 30, t(8, 4, 7, 8, 4, 8)),
  q('liverpool', 'aquilani09', 'Alberto Aquilani', 1984, 'Italy', ['CM', 'AM', 'DM'], 78, 82, 2014, 65, t(7, 6, 6, 5, 5, 4), { archetype: 'deep-playmaker', latentCeiling: 85 }),
  q('liverpool', 'gerrard09', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 89, 89, 2013, 40, t(9, 6, 9, 10, 7, 7), { archetype: 'playmaker' }),
  q('liverpool', 'kuyt09', 'Dirk Kuyt', 1980, 'Netherlands', ['RW', 'ST'], 81, 81, 2012, 25, t(10, 3, 7, 8, 3, 8)),
  q('liverpool', 'torres09', 'Fernando Torres', 1984, 'Spain', ['ST'], 90, 92, 2013, 60, t(7, 7, 8, 5, 6, 6), { archetype: 'poacher' }),
  q('liverpool', 'benayoun09', 'Yossi Benayoun', 1980, 'Israel', ['AM', 'RW'], 79, 79, 2011, 35, t(8, 5, 6, 6, 5, 8), { archetype: 'playmaker' }),
  q('liverpool', 'babel09', 'Ryan Babel', 1986, 'Netherlands', ['LW', 'ST'], 74, 82, 2012, 35, t(5, 7, 6, 4, 6, 6), { archetype: 'inside-forward', latentCeiling: 82 }),
  q('liverpool', 'ngog09', 'David Ngog', 1989, 'France', ['ST'], 70, 80, 2013, 35, t(6, 5, 6, 5, 5, 6), { latentCeiling: 80 }),
  q('liverpool', 'riera09', 'Albert Riera', 1982, 'Spain', ['LW'], 75, 75, 2012, 40, t(6, 6, 5, 4, 7, 6)),
];

/** Juventus, 2009–10 — a flat post-Calciopoli-recovery season (7th) under Ferrara
 *  then Zaccheroni; Diego and Felipe Melo the costly summer bets, Del Piero fading. */
export const JUVENTUS_2009: CuratedSeed[] = [
  q('juventus', 'buffon09', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 89, 89, 2012, 25, t(10, 5, 8, 10, 4, 8)),
  q('juventus', 'delpiero09', 'Alessandro Del Piero', 1974, 'Italy', ['ST', 'AM'], 83, 83, 2012, 40, t(10, 6, 7, 10, 4, 8), { archetype: 'inside-forward' }),
  q('juventus', 'trezeguet09', 'David Trézéguet', 1977, 'France', ['ST'], 82, 82, 2011, 40, t(8, 6, 7, 7, 5, 7), { archetype: 'poacher' }),
  q('juventus', 'chiellini09', 'Giorgio Chiellini', 1984, 'Italy', ['CB', 'LB'], 84, 88, 2013, 25, t(10, 5, 8, 10, 4, 8), { archetype: 'covering-cb' }),
  q('juventus', 'fabiocannavaro09', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 82, 82, 2011, 30, t(8, 7, 8, 6, 5, 7), { archetype: 'covering-cb' }),
  q('juventus', 'diego09', 'Diego Ribas da Cunha', 1985, 'Brazil', ['AM'], 83, 85, 2014, 30, t(6, 8, 8, 4, 7, 5), { archetype: 'playmaker', latentCeiling: 87 }),
  q('juventus', 'felipemelo09', 'Felipe Melo', 1983, 'Brazil', ['DM', 'CM', 'CB'], 80, 82, 2014, 30, t(5, 8, 7, 4, 9, 4), { latentCeiling: 84 }),
  q('juventus', 'marchisio09', 'Claudio Marchisio', 1986, 'Italy', ['CM', 'DM'], 79, 86, 2013, 25, t(9, 5, 8, 9, 4, 8)),
  q('juventus', 'sissoko09', 'Mohamed Sissoko', 1985, 'Mali', ['DM', 'CM'], 78, 80, 2012, 35, t(7, 5, 6, 6, 6, 6)),
  q('juventus', 'camoranesi09', 'Mauro Camoranesi', 1976, 'Italy', ['RW', 'AM'], 79, 79, 2011, 35, t(8, 6, 6, 7, 5, 7)),
  q('juventus', 'grosso09', 'Fabio Grosso', 1977, 'Italy', ['LB'], 78, 78, 2012, 30, t(8, 5, 6, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('juventus', 'grygera09', 'Zdeněk Grygera', 1980, 'Czech Republic', ['RB', 'CB'], 75, 75, 2011, 40, t(7, 4, 5, 6, 4, 6)),
  q('juventus', 'zebina09', 'Jonathan Zebina', 1978, 'France', ['RB', 'CB'], 73, 73, 2011, 40, t(5, 6, 5, 5, 7, 6)),
  q('juventus', 'legrottaglie09', 'Nicola Legrottaglie', 1976, 'Italy', ['CB'], 76, 76, 2011, 30, t(8, 5, 5, 7, 4, 7)),
  q('juventus', 'deceglie09', 'Paolo De Ceglie', 1986, 'Italy', ['LB'], 72, 78, 2013, 40, t(7, 5, 6, 8, 5, 7), { archetype: 'full-back-attacking' }),
  q('juventus', 'amauri09', 'Amauri Carvalho de Oliveira', 1980, 'Brazil', ['ST'], 78, 78, 2013, 35, t(6, 6, 6, 5, 6, 6), { archetype: 'poacher' }),
  q('juventus', 'iaquinta09', 'Vincenzo Iaquinta', 1979, 'Italy', ['ST', 'RW'], 78, 78, 2013, 40, t(7, 6, 6, 7, 6, 7)),
  q('juventus', 'salihamidzic09', 'Hasan Salihamidžić', 1977, 'Bosnia and Herzegovina', ['RW', 'CM', 'RB'], 74, 74, 2011, 35, t(8, 5, 6, 7, 4, 8)),
  q('juventus', 'giovinco09', 'Sebastian Giovinco', 1987, 'Italy', ['AM', 'ST', 'RW'], 74, 85, 2013, 45, t(7, 6, 8, 8, 5, 6), { archetype: 'inside-forward', latentCeiling: 86 }),
];

/** AC Milan, 2009–10 — Leonardo's side (3rd); the last of the old guard (Nesta,
 *  Pirlo, Seedorf, Inzaghi, a fading Ronaldinho) around a young Pato and Thiago
 *  Silva, with Beckham's ill-fated loan (an Achilles rupture ended it). */
export const MILAN_2009: CuratedSeed[] = [
  q('milan', 'dida09', 'Dida', 1973, 'Brazil', ['GK'], 79, 79, 2011, 25, t(8, 5, 7, 8, 3, 7)),
  q('milan', 'abbiati09', 'Christian Abbiati', 1977, 'Italy', ['GK'], 80, 80, 2012, 25, t(8, 6, 7, 9, 4, 7)),
  q('milan', 'abate09', 'Ignazio Abate', 1986, 'Italy', ['RB'], 74, 82, 2014, 25, t(8, 5, 7, 8, 4, 7), { archetype: 'full-back-attacking' }),
  q('milan', 'thiagosilva09', 'Thiago Silva', 1984, 'Brazil', ['CB'], 80, 90, 2013, 30, t(9, 5, 8, 7, 4, 7), { archetype: 'covering-cb' }),
  q('milan', 'nesta09', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 85, 85, 2012, 60, t(9, 4, 7, 9, 3, 7), { archetype: 'covering-cb' }),
  q('milan', 'bonera09', 'Daniele Bonera', 1981, 'Italy', ['CB', 'RB'], 76, 77, 2013, 30, t(7, 4, 6, 8, 4, 7)),
  q('milan', 'zambrotta09', 'Gianluca Zambrotta', 1977, 'Italy', ['RB', 'LB'], 80, 80, 2012, 35, t(8, 5, 7, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('milan', 'jankulovski09', 'Marek Jankulovski', 1977, 'Czech Republic', ['LB'], 76, 76, 2011, 45, t(7, 5, 6, 7, 4, 7)),
  q('milan', 'gattuso09', 'Gennaro Gattuso', 1978, 'Italy', ['DM'], 80, 80, 2012, 35, t(8, 6, 8, 9, 7, 7)),
  q('milan', 'pirlo09', 'Andrea Pirlo', 1979, 'Italy', ['CM', 'DM'], 87, 87, 2013, 40, t(9, 5, 8, 8, 3, 7), { archetype: 'deep-playmaker' }),
  q('milan', 'ambrosini09', 'Massimo Ambrosini', 1977, 'Italy', ['CM', 'DM'], 80, 80, 2013, 40, t(9, 4, 7, 10, 4, 7)),
  q('milan', 'seedorf09', 'Clarence Seedorf', 1976, 'Netherlands', ['AM', 'CM'], 83, 83, 2012, 30, t(8, 6, 8, 7, 4, 8), { archetype: 'playmaker' }),
  q('milan', 'flamini09', 'Mathieu Flamini', 1984, 'France', ['CM', 'DM'], 77, 79, 2013, 30, t(7, 6, 7, 6, 5, 7)),
  q('milan', 'beckhammilan09', 'David Beckham', 1975, 'England', ['CM', 'RW', 'AM'], 79, 79, 2010, 40, t(9, 7, 7, 6, 4, 7), { loanFrom: 'la_galaxy' }),
  q('milan', 'ronaldinho09', 'Ronaldinho', 1980, 'Brazil', ['AM', 'LW'], 84, 84, 2011, 45, t(4, 7, 6, 4, 7, 7), { archetype: 'inside-forward', latentCeiling: 92 }),
  q('milan', 'pato09', 'Alexandre Pato', 1989, 'Brazil', ['ST'], 82, 90, 2013, 55, t(6, 6, 8, 6, 6, 6), { archetype: 'poacher', latentCeiling: 92 }),
  q('milan', 'borriello09', 'Marco Borriello', 1982, 'Italy', ['ST'], 79, 80, 2013, 35, t(6, 6, 7, 6, 6, 6), { archetype: 'poacher' }),
  q('milan', 'huntelaar09', 'Klaas-Jan Huntelaar', 1983, 'Netherlands', ['ST'], 78, 82, 2013, 25, t(7, 6, 7, 5, 5, 6), { archetype: 'poacher' }),
  q('milan', 'inzaghi09', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 78, 78, 2011, 55, t(8, 6, 7, 9, 5, 7), { archetype: 'poacher' }),
];

export const BAYERN_2009_SQUADS: Record<string, CuratedSeed[]> = {
  bayern: BAYERN_2009,
  inter: INTER_2009,
  barcelona: BARCELONA_2009,
  freiburg: FREIBURG_2009,
  hertha: HERTHA_2009,
  nurnberg: NURNBERG_2009,
  bochum: BOCHUM_2009,
  wolfsburg: WOLFSBURG_2009,
  bremen: BREMEN_2009,
  dortmund: DORTMUND_2009,
  schalke: SCHALKE_2009,
  stuttgart: STUTTGART_2009,
  hamburg: HAMBURG_2009,
  leverkusen: LEVERKUSEN_2009,
  hoffenheim: HOFFENHEIM_2009,
  gladbach: GLADBACH_2009,
  koln: KOLN_2009,
  hannover: HANNOVER_2009,
  frankfurt: FRANKFURT_2009,
  mainz: MAINZ_2009,
  real_madrid: REAL_MADRID_2009,
  villarreal: VILLARREAL_2009,
  sevilla: SEVILLA_2009,
  chelsea: CHELSEA_2009,
  man_utd: MAN_UTD_2009,
  man_city: MAN_CITY_2009,
  arsenal: ARSENAL_2009,
  liverpool: LIVERPOOL_2009,
  juventus: JUVENTUS_2009,
  milan: MILAN_2009,
};
