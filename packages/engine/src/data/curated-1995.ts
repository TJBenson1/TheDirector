/**
 * Curated real players — 1995–96 pack (§4, §17.10).
 *
 * The vertical slice for "Keegan's Entertainers": Newcastle United 1995-96, the
 * side that led the Premier League by twelve points and threw it away in the most
 * thrilling, open football England had seen — Ginola and Ferdinand and a mercurial
 * Asprilla, all attack and no brakes. The counterfactual is whether you can hold
 * the nerve Keegan couldn't (and whether you still bring Shearer home in 1996).
 * Ability/potential/personality are hidden designer estimates (§7).
 *
 * Isolated in its own scenario squad set so it never touches the 1999 world
 * (man-utd-1999 is the calibration scenario and shares the eng-1 league).
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

/** Newcastle United, 1995–96 — Kevin Keegan's Entertainers. */
export const NEWCASTLE_1995: CuratedSeed[] = [
  q('newcastle', 'srnicek95', 'Pavel Srníček', 1968, 'Czech Republic', ['GK'], 77, 78, 1999, 30, t(7, 5, 6, 8, 6, 6)),
  q('newcastle', 'hislop95', 'Shaka Hislop', 1969, 'Trinidad and Tobago', ['GK'], 76, 79, 1999, 30, t(7, 5, 6, 6, 4, 7)),
  q('newcastle', 'barton95', 'Warren Barton', 1969, 'England', ['RB', 'CB'], 78, 79, 2000, 35, t(7, 6, 7, 6, 6, 7), { archetype: 'full-back-attacking' }),
  q('newcastle', 'watson95', 'Steve Watson', 1974, 'England', ['RB', 'RW'], 74, 79, 2000, 30, t(7, 4, 7, 8, 4, 8)),
  q('newcastle', 'peacock95', 'Darren Peacock', 1968, 'England', ['CB'], 77, 77, 1999, 35, t(7, 5, 6, 7, 5, 6)),
  q('newcastle', 'albert95', 'Philippe Albert', 1967, 'Belgium', ['CB'], 80, 81, 2000, 45, t(7, 6, 6, 7, 5, 6), { archetype: 'covering-cb' }),
  q('newcastle', 'howey95', 'Steve Howey', 1971, 'England', ['CB'], 77, 80, 2000, 45, t(7, 5, 7, 8, 4, 7)),
  q('newcastle', 'beresford95', 'John Beresford', 1966, 'England', ['LB'], 76, 77, 1999, 35, t(7, 6, 6, 7, 6, 6), { archetype: 'full-back-attacking' }),
  q('newcastle', 'elliott95', 'Robbie Elliott', 1973, 'England', ['LB'], 72, 77, 1999, 40, t(7, 4, 6, 8, 4, 7)),
  q('newcastle', 'roblee95', 'Rob Lee', 1966, 'England', ['CM'], 81, 81, 2000, 30, t(8, 5, 7, 9, 4, 7)),
  q('newcastle', 'clark95', 'Lee Clark', 1972, 'England', ['CM', 'AM'], 74, 78, 1999, 30, t(7, 5, 7, 9, 5, 7)),
  q('newcastle', 'batty95', 'David Batty', 1968, 'England', ['DM', 'CM'], 80, 80, 2000, 30, t(8, 5, 6, 6, 6, 6), { archetype: 'deep-playmaker' }),
  q('newcastle', 'gillespie95', 'Keith Gillespie', 1975, 'Northern Ireland', ['RW'], 76, 82, 2000, 30, t(6, 6, 7, 6, 6, 6)),
  // Ginola — the flair of the side, box-office and mercurial (high ego/volatility).
  q('newcastle', 'ginola95', 'David Ginola', 1967, 'France', ['LW'], 84, 85, 2000, 35, t(6, 8, 7, 5, 8, 6), { archetype: 'inside-forward' }),
  q('newcastle', 'beardsley95', 'Peter Beardsley', 1961, 'England', ['AM', 'ST'], 83, 83, 1998, 35, t(9, 5, 7, 9, 3, 8), { archetype: 'playmaker' }),
  q('newcastle', 'lesferdinand95', 'Les Ferdinand', 1966, 'England', ['ST'], 84, 84, 2000, 35, t(8, 6, 8, 6, 5, 7), { archetype: 'poacher' }),
  // Asprilla — the January gamble whose brilliance (and chaos) upset the title
  // run-in; the mercurial spark reality signed mid-collapse.
  q('newcastle', 'asprilla95', 'Faustino Asprilla', 1969, 'Colombia', ['ST', 'AM'], 83, 84, 2000, 40, t(5, 8, 7, 5, 9, 5), { archetype: 'inside-forward' }),
  q('newcastle', 'kitson95', 'Paul Kitson', 1971, 'England', ['ST'], 74, 78, 1999, 45, t(6, 5, 6, 6, 5, 6), { archetype: 'poacher' }),
];

/** Curated squads for the newcastle-1995 scenario, keyed by club. Only Newcastle
 *  is curated (the rivals run on the procedural pool), so the set stays isolated
 *  from the 1999 world that shares the eng-1 league. */
export const NEWCASTLE_1995_SQUADS: Record<string, CuratedSeed[]> = {
  newcastle: NEWCASTLE_1995,
};

/** AC Milan, 1995–96 — Capello's champions at the tail of the dynasty, with Weah
 *  and Baggio just aboard around the immortal Baresi–Maldini spine. */
export const MILAN_1995: CuratedSeed[] = [
  q('milan', 'weah95', 'George Weah', 1966, 'Liberia', ['ST'], 88, 90, 1999, 30, t(8, 6, 9, 6, 5, 8), { archetype: 'poacher' }),
  // Baggio — the Divine Ponytail, arrived from Juventus but destined to chafe under
  // Capello's rigid system; a genius asked to fit a shape that wasn't his.
  q('milan', 'baggio95', 'Roberto Baggio', 1967, 'Italy', ['AM', 'ST', 'RW'], 87, 91, 1998, 40, t(8, 8, 8, 5, 6, 6), { archetype: 'playmaker' }),
  q('milan', 'maldini95', 'Paolo Maldini', 1968, 'Italy', ['LB', 'CB'], 87, 90, 2000, 28, t(10, 5, 9, 10, 3, 8), { archetype: 'covering-cb', loyalty: 99 }),
  q('milan', 'baresi95', 'Franco Baresi', 1960, 'Italy', ['CB', 'DM'], 86, 86, 1997, 30, t(10, 4, 8, 10, 3, 7), { archetype: 'covering-cb', loyalty: 97 }),
  q('milan', 'savicevic95', 'Dejan Savićević', 1966, 'Serbia and Montenegro', ['AM', 'RW'], 85, 86, 1998, 42, t(6, 9, 7, 6, 8, 6), { archetype: 'playmaker' }),
  q('milan', 'desailly95', 'Marcel Desailly', 1968, 'France', ['DM', 'CB'], 85, 88, 1999, 30, t(9, 5, 9, 7, 4, 8), { archetype: 'deep-playmaker' }),
  q('milan', 'boban95', 'Zvonimir Boban', 1968, 'Croatia', ['CM', 'AM'], 84, 86, 1999, 35, t(8, 6, 8, 8, 6, 7)),
  q('milan', 'albertini95', 'Demetrio Albertini', 1971, 'Italy', ['CM', 'DM'], 83, 86, 2000, 28, t(9, 5, 8, 9, 4, 7), { archetype: 'deep-playmaker' }),
  q('milan', 'costacurta95', 'Alessandro Costacurta', 1966, 'Italy', ['CB'], 82, 84, 1999, 30, t(9, 4, 8, 9, 3, 7), { archetype: 'covering-cb' }),
  q('milan', 'donadoni95', 'Roberto Donadoni', 1963, 'Italy', ['RW', 'AM', 'CM'], 81, 81, 1997, 32, t(9, 5, 8, 9, 4, 7)),
  q('milan', 'panucci95', 'Christian Panucci', 1973, 'Italy', ['RB', 'CB'], 80, 85, 1999, 30, t(7, 6, 8, 6, 6, 7), { archetype: 'full-back-attacking' }),
  q('milan', 'rossi95', 'Sebastiano Rossi', 1964, 'Italy', ['GK'], 80, 81, 1999, 30, t(8, 6, 7, 8, 5, 6)),
  q('milan', 'simone95', 'Marco Simone', 1969, 'Italy', ['ST', 'RW'], 79, 80, 1998, 32, t(7, 6, 8, 7, 6, 7), { archetype: 'poacher' }),
  q('milan', 'eranio95', 'Stefano Eranio', 1966, 'Italy', ['RW', 'CM', 'RB'], 78, 78, 1998, 34, t(8, 5, 7, 8, 5, 7)),
  q('milan', 'dicanio95', 'Paolo Di Canio', 1968, 'Italy', ['AM', 'RW', 'ST'], 77, 82, 1997, 38, t(5, 9, 8, 4, 9, 5)),
  q('milan', 'galli95', 'Filippo Galli', 1963, 'Italy', ['CB'], 76, 76, 1997, 32, t(8, 4, 6, 9, 3, 6), { archetype: 'covering-cb' }),
  q('milan', 'tassotti95', 'Mauro Tassotti', 1960, 'Italy', ['RB', 'CB'], 76, 76, 1997, 34, t(9, 4, 6, 10, 3, 6), { loyalty: 95 }),
];

/** Juventus, 1995–96 — Lippi's Champions League winners, the young Del Piero
 *  rising as Vialli and Ravanelli lead the line one last season. */
export const JUVENTUS_1995: CuratedSeed[] = [
  q('juventus', 'peruzzi95', 'Angelo Peruzzi', 1970, 'Italy', ['GK'], 83, 84, 2000, 30, t(8, 5, 7, 8, 5, 6)),
  q('juventus', 'torricelli95', 'Moreno Torricelli', 1970, 'Italy', ['RB', 'CB'], 78, 79, 1999, 30, t(8, 4, 7, 8, 5, 7), { archetype: 'full-back-attacking' }),
  q('juventus', 'ferrara95', 'Ciro Ferrara', 1967, 'Italy', ['CB'], 82, 82, 2000, 32, t(8, 4, 7, 9, 4, 7), { archetype: 'covering-cb' }),
  q('juventus', 'vierchowod95', 'Pietro Vierchowod', 1959, 'Italy', ['CB'], 80, 80, 1997, 38, t(9, 4, 6, 8, 4, 6), { archetype: 'covering-cb' }),
  q('juventus', 'pessotto95', 'Gianluca Pessotto', 1970, 'Italy', ['LB', 'RB'], 78, 80, 2000, 30, t(8, 3, 7, 8, 4, 7), { archetype: 'full-back-attacking' }),
  q('juventus', 'iuliano95', 'Mark Iuliano', 1973, 'Italy', ['CB'], 75, 80, 2000, 30, t(7, 4, 7, 8, 5, 6)),
  q('juventus', 'porrini95', 'Sergio Porrini', 1968, 'Italy', ['RB', 'CB'], 75, 76, 1998, 30, t(7, 4, 6, 7, 5, 6)),
  q('juventus', 'deschamps95', 'Didier Deschamps', 1968, 'France', ['DM', 'CM'], 82, 83, 2000, 28, t(9, 5, 8, 8, 4, 8), { archetype: 'deep-playmaker' }),
  q('juventus', 'sousa95', 'Paulo Sousa', 1970, 'Portugal', ['DM', 'CM'], 82, 83, 1997, 30, t(9, 5, 8, 6, 4, 7), { archetype: 'deep-playmaker' }),
  q('juventus', 'conte95', 'Antonio Conte', 1969, 'Italy', ['CM', 'DM'], 80, 81, 2001, 32, t(9, 6, 9, 9, 7, 6), { archetype: 'playmaker' }),
  q('juventus', 'jugovic95', 'Vladimir Jugović', 1969, 'Serbia', ['CM', 'AM'], 80, 81, 1999, 30, t(8, 6, 8, 6, 6, 7)),
  q('juventus', 'dilivio95', 'Angelo Di Livio', 1966, 'Italy', ['CM', 'RW'], 78, 78, 1999, 28, t(9, 3, 7, 9, 4, 7)),
  q('juventus', 'tacchinardi95', 'Alessio Tacchinardi', 1975, 'Italy', ['DM', 'CM'], 74, 82, 2001, 30, t(8, 4, 7, 8, 5, 6)),
  // Del Piero — the 20-year-old heir, about to become a Juventus immortal. A
  // reality-rail talent (huge ceiling, unlocked by minutes).
  q('juventus', 'delpiero95', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST', 'LW'], 82, 90, 2001, 35, t(9, 4, 9, 10, 3, 7), { archetype: 'inside-forward' }),
  q('juventus', 'vialli95', 'Gianluca Vialli', 1964, 'Italy', ['ST'], 84, 84, 1997, 40, t(8, 6, 8, 9, 5, 7), { archetype: 'poacher' }),
  q('juventus', 'ravanelli95', 'Fabrizio Ravanelli', 1968, 'Italy', ['ST'], 83, 83, 1998, 32, t(7, 7, 8, 5, 7, 6), { archetype: 'poacher' }),
  q('juventus', 'padovano95', 'Michele Padovano', 1966, 'Italy', ['ST'], 76, 76, 1998, 30, t(7, 5, 6, 7, 5, 6), { archetype: 'poacher' }),
];

/** Shared curated squads for the Serie A 1995-96 cluster — both Milan and Juventus
 *  are real, so each is the other's title rival in either start point. */
export const SERIE_A_1995_SQUADS: Record<string, CuratedSeed[]> = {
  milan: MILAN_1995,
  juventus: JUVENTUS_1995,
};
