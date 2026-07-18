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
  extra: { hardBlocks?: HardBlock[]; loyalty?: number; latentCeiling?: number; archetype?: string; loanFrom?: ClubId } = {},
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
  q('milan', 'savicevic95', 'Dejan Savićević', 1966, 'Montenegro', ['AM', 'RW'], 85, 86, 1998, 42, t(6, 9, 7, 6, 8, 6), { archetype: 'playmaker' }),
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

/** Lazio, 1995–96 — Zeman's cavalier 3rd-placed side: Signori the capocannoniere,
 *  Casiraghi and Boksic up top, a 19-year-old Nesta already a regular. */
export const LAZIO_1995: CuratedSeed[] = [
  q('lazio', 'marchegiani95', 'Luca Marchegiani', 1966, 'Italy', ['GK'], 82, 82, 1999, 25, t(8, 5, 6, 8, 3, 7)),
  q('lazio', 'orsi95', 'Fernando Orsi', 1959, 'Italy', ['GK'], 71, 71, 1997, 25, t(8, 4, 5, 8, 3, 6)),
  q('lazio', 'fmancini95', 'Francesco Mancini', 1968, 'Italy', ['GK'], 70, 73, 1996, 30, t(7, 4, 6, 6, 4, 6), { loanFrom: 'foggia' }),
  // Nesta — the 19-year-old homegrown centre-back, already first-choice; a legend in waiting.
  q('lazio', 'nesta95', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 78, 90, 2000, 25, t(9, 4, 8, 10, 3, 7), { archetype: 'covering-cb', latentCeiling: 91, loyalty: 90 }),
  q('lazio', 'favalli95', 'Giuseppe Favalli', 1972, 'Italy', ['LB'], 78, 81, 2000, 25, t(8, 4, 7, 8, 3, 7), { archetype: 'full-back-attacking' }),
  q('lazio', 'chamot95', 'José Chamot', 1969, 'Argentina', ['CB', 'LB'], 79, 80, 1998, 30, t(7, 5, 7, 6, 5, 7)),
  q('lazio', 'negro95', 'Paolo Negro', 1972, 'Italy', ['RB', 'CB'], 77, 79, 2000, 30, t(8, 4, 7, 8, 3, 7)),
  q('lazio', 'bergodi95', 'Cristian Bergodi', 1964, 'Italy', ['CB'], 74, 74, 1997, 30, t(8, 4, 6, 7, 4, 6), { archetype: 'covering-cb' }),
  q('lazio', 'gottardi95', 'Guerino Gottardi', 1970, 'Switzerland', ['RB', 'CM'], 73, 75, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('lazio', 'fuser95', 'Diego Fuser', 1968, 'Italy', ['RW', 'CM'], 82, 83, 1999, 30, t(8, 5, 8, 7, 5, 7)),
  q('lazio', 'dimatteo95', 'Roberto Di Matteo', 1970, 'Italy', ['CM'], 79, 81, 1996, 30, t(8, 5, 8, 6, 4, 8)),
  q('lazio', 'winter95', 'Aron Winter', 1967, 'Netherlands', ['CM', 'DM'], 81, 82, 1999, 28, t(8, 5, 8, 7, 4, 8)),
  q('lazio', 'marcolin95', 'Dario Marcolin', 1971, 'Italy', ['CM', 'AM'], 74, 76, 1998, 30, t(7, 5, 7, 7, 5, 6)),
  q('lazio', 'piovanelli95', 'Marco Piovanelli', 1974, 'Italy', ['CM'], 72, 75, 1998, 30, t(7, 4, 7, 7, 4, 6)),
  q('lazio', 'romano95', 'Alessandro Romano', 1969, 'Italy', ['CM', 'DM'], 73, 74, 1998, 30, t(7, 4, 6, 7, 4, 6)),
  // Signori — capocannoniere with 24 goals, the little maestro of the Zeman attack.
  q('lazio', 'signori95', 'Beppe Signori', 1968, 'Italy', ['ST', 'AM'], 85, 86, 1998, 30, t(8, 6, 8, 7, 5, 7), { archetype: 'poacher' }),
  q('lazio', 'casiraghi95', 'Pierluigi Casiraghi', 1969, 'Italy', ['ST'], 82, 83, 1998, 32, t(8, 5, 8, 7, 5, 7), { archetype: 'poacher' }),
  q('lazio', 'boksic95', 'Alen Bokšić', 1970, 'Croatia', ['ST', 'LW'], 83, 84, 1996, 35, t(7, 6, 8, 5, 6, 7), { archetype: 'inside-forward' }),
  q('lazio', 'rambaudi95', 'Roberto Rambaudi', 1966, 'Italy', ['RW', 'LW'], 76, 77, 1998, 30, t(7, 5, 7, 7, 5, 7)),
];

/** Internazionale, 1995–96 — Roy Hodgson's 7th-placed side: Roberto Carlos's lone
 *  Inter season at left-back, Paul Ince and a debutant Javier Zanetti in midfield. */
export const INTER_1995: CuratedSeed[] = [
  q('inter', 'pagliuca95', 'Gianluca Pagliuca', 1966, 'Italy', ['GK'], 84, 85, 1999, 25, t(8, 6, 7, 8, 4, 7)),
  q('inter', 'landucci95', 'Marco Landucci', 1964, 'Italy', ['GK'], 70, 70, 1997, 25, t(8, 4, 5, 8, 3, 6)),
  q('inter', 'frezzolini95', 'Giorgio Frezzolini', 1976, 'Italy', ['GK'], 68, 76, 1999, 25, t(7, 4, 6, 7, 4, 6)),
  q('inter', 'bergomi95', 'Giuseppe Bergomi', 1963, 'Italy', ['CB', 'RB'], 82, 82, 1999, 25, t(9, 4, 7, 10, 3, 7), { archetype: 'covering-cb', loyalty: 96 }),
  q('inter', 'festa95', 'Gianluca Festa', 1969, 'Italy', ['CB'], 78, 79, 1997, 30, t(8, 5, 6, 7, 5, 7), { archetype: 'covering-cb' }),
  q('inter', 'fresi95', 'Salvatore Fresi', 1973, 'Italy', ['CB'], 76, 80, 2000, 30, t(7, 5, 7, 7, 4, 7), { archetype: 'covering-cb' }),
  q('inter', 'paganin95', 'Massimo Paganin', 1970, 'Italy', ['CB'], 73, 75, 1998, 30, t(7, 4, 6, 7, 4, 6)),
  q('inter', 'centofanti95', 'Felice Centofanti', 1969, 'Italy', ['LB', 'CB'], 72, 73, 1997, 30, t(7, 4, 6, 6, 5, 6)),
  // Roberto Carlos — his single, underused Inter season at left-back before the Bernabéu.
  q('inter', 'rcarlos95', 'Roberto Carlos', 1973, 'Brazil', ['LB', 'LW'], 84, 90, 1996, 20, t(8, 6, 9, 5, 5, 8), { archetype: 'full-back-attacking', latentCeiling: 91 }),
  q('inter', 'pistone95', 'Alessandro Pistone', 1975, 'Italy', ['RB', 'CB'], 72, 82, 1999, 30, t(7, 5, 7, 7, 4, 7)),
  // Zanetti — the debut Inter season of a future one-club legend.
  q('inter', 'zanetti95', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 80, 88, 2000, 15, t(10, 4, 9, 10, 3, 8), { archetype: 'full-back-attacking', latentCeiling: 89, loyalty: 95 }),
  q('inter', 'ince95', 'Paul Ince', 1967, 'England', ['CM', 'DM'], 83, 84, 1997, 28, t(7, 7, 8, 6, 6, 7), { archetype: 'destroyer' }),
  q('inter', 'berti95', 'Nicola Berti', 1967, 'Italy', ['CM', 'AM'], 79, 80, 1998, 30, t(7, 6, 8, 7, 6, 7)),
  q('inter', 'manicone95', 'Antonio Manicone', 1966, 'Italy', ['DM', 'CM'], 73, 74, 1997, 30, t(8, 4, 6, 7, 4, 6), { archetype: 'destroyer' }),
  q('inter', 'orlandini95', 'Pierluigi Orlandini', 1969, 'Italy', ['CM', 'RW'], 72, 74, 1997, 30, t(7, 5, 6, 7, 5, 7)),
  q('inter', 'bianchi95', 'Alessandro Bianchi', 1966, 'Italy', ['RW', 'RB'], 73, 74, 1997, 30, t(7, 5, 7, 7, 4, 7)),
  q('inter', 'fontolan95', 'Davide Fontolan', 1966, 'Italy', ['RW', 'AM'], 77, 78, 1998, 30, t(7, 6, 7, 6, 6, 7)),
  q('inter', 'carbone95', 'Benito Carbone', 1971, 'Italy', ['AM', 'ST'], 79, 81, 1997, 32, t(6, 7, 8, 5, 7, 6), { archetype: 'inside-forward' }),
  q('inter', 'branca95', 'Marco Branca', 1965, 'Italy', ['ST'], 79, 80, 1998, 35, t(7, 6, 7, 6, 5, 6), { archetype: 'poacher' }),
  q('inter', 'ganz95', 'Maurizio Ganz', 1968, 'Italy', ['ST'], 78, 79, 1998, 32, t(6, 6, 7, 6, 6, 6), { archetype: 'poacher' }),
];

/** Parma, 1995–96 — Nevio Scala's UEFA Cup holders (6th): Zola and Stoichkov the
 *  flair, Dino Baggio and Cannavaro the spine, and a 17-year-old Buffon debuting. */
export const PARMA_1995: CuratedSeed[] = [
  q('parma', 'bucci95', 'Luca Bucci', 1969, 'Italy', ['GK'], 80, 81, 1998, 25, t(8, 5, 6, 8, 4, 7)),
  q('parma', 'nista95', 'Alessandro Nista', 1965, 'Italy', ['GK'], 71, 71, 1997, 25, t(8, 4, 5, 8, 3, 6)),
  // Buffon — the 17-year-old third keeper who debuted vs Milan in Nov 1995; a GOAT in the making.
  q('parma', 'buffon95', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 68, 93, 2001, 15, t(10, 5, 9, 9, 3, 8), { latentCeiling: 94 }),
  q('parma', 'mussi95', 'Roberto Mussi', 1963, 'Italy', ['RB'], 76, 76, 1997, 30, t(8, 4, 6, 8, 3, 7)),
  q('parma', 'benarrivo95', 'Antonio Benarrivo', 1968, 'Italy', ['LB', 'RB'], 78, 79, 1999, 28, t(8, 4, 7, 8, 3, 7), { archetype: 'full-back-attacking' }),
  q('parma', 'minotti95', 'Lorenzo Minotti', 1967, 'Italy', ['CB'], 78, 78, 1996, 28, t(8, 5, 7, 8, 3, 7), { archetype: 'covering-cb' }),
  q('parma', 'apolloni95', 'Luigi Apolloni', 1967, 'Italy', ['CB'], 77, 77, 1998, 28, t(8, 4, 6, 8, 3, 7), { archetype: 'covering-cb' }),
  // Cannavaro — the breakthrough season of a future Ballon d'Or, newly arrived from Napoli.
  q('parma', 'cannavaro95', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 79, 90, 2001, 20, t(9, 5, 9, 8, 4, 7), { archetype: 'covering-cb', latentCeiling: 91 }),
  q('parma', 'sensini95', 'Néstor Sensini', 1966, 'Argentina', ['CB', 'DM'], 80, 81, 1999, 25, t(9, 4, 8, 7, 3, 7), { archetype: 'covering-cb' }),
  q('parma', 'couto95', 'Fernando Couto', 1969, 'Portugal', ['CB'], 81, 83, 1996, 28, t(8, 5, 8, 6, 5, 7), { archetype: 'covering-cb' }),
  q('parma', 'dichiara95', 'Alberto Di Chiara', 1964, 'Italy', ['LB'], 75, 75, 1996, 30, t(8, 4, 6, 8, 3, 7)),
  q('parma', 'castellini95', 'Marcello Castellini', 1973, 'Italy', ['RB', 'LB'], 72, 76, 1996, 30, t(7, 4, 6, 7, 4, 7)),
  q('parma', 'dinobaggio95', 'Dino Baggio', 1971, 'Italy', ['CM', 'DM'], 82, 84, 1999, 30, t(8, 5, 8, 7, 5, 7), { archetype: 'deep-playmaker' }),
  q('parma', 'crippa95', 'Massimo Crippa', 1965, 'Italy', ['DM', 'CM'], 78, 78, 1998, 30, t(8, 5, 7, 8, 4, 7), { archetype: 'destroyer' }),
  q('parma', 'pin95', 'Gabriele Pin', 1962, 'Italy', ['DM', 'CM'], 73, 73, 1996, 30, t(8, 4, 6, 8, 3, 6)),
  q('parma', 'brambilla95', 'Massimo Brambilla', 1973, 'Italy', ['CM'], 72, 76, 1998, 30, t(7, 5, 7, 7, 4, 7)),
  // Zola — the little magician, Parma's top scorer before his 1996 Chelsea move.
  q('parma', 'zola95', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 85, 86, 1997, 30, t(9, 5, 8, 7, 4, 8), { archetype: 'playmaker' }),
  q('parma', 'stoichkov95', 'Hristo Stoichkov', 1966, 'Bulgaria', ['LW', 'ST'], 84, 85, 1998, 35, t(5, 9, 8, 5, 9, 6), { archetype: 'inside-forward' }),
  // Asprilla — out of favour under Scala; left for Newcastle in Feb 1996.
  q('parma', 'asprillap95', 'Faustino Asprilla', 1969, 'Colombia', ['ST', 'AM'], 82, 84, 2000, 40, t(5, 8, 7, 5, 9, 5), { archetype: 'inside-forward' }),
  q('parma', 'brolin95', 'Tomas Brolin', 1969, 'Sweden', ['AM', 'RW'], 78, 82, 1996, 45, t(6, 7, 6, 5, 7, 6)),
  q('parma', 'inzaghip95', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 74, 86, 2000, 30, t(7, 6, 9, 6, 6, 7), { archetype: 'poacher', latentCeiling: 87 }),
  q('parma', 'melli95', 'Alessandro Melli', 1969, 'Italy', ['ST'], 74, 75, 1998, 32, t(7, 5, 6, 7, 5, 6), { archetype: 'poacher' }),
];

/** Fiorentina, 1995–96 — the Coppa Italia winners: Batistuta and Rui Costa the heart
 *  of a young, expressive side under Claudio Ranieri. */
export const FIORENTINA_1995: CuratedSeed[] = [
  q('fiorentina', 'batistuta95', 'Gabriel Batistuta', 1969, 'Argentina', ['ST'], 87, 88, 1999, 30, t(8, 6, 9, 8, 5, 7), { archetype: 'poacher', loyalty: 88 }),
  q('fiorentina', 'ruicosta95', 'Manuel Rui Costa', 1972, 'Portugal', ['AM'], 85, 88, 1999, 30, t(8, 6, 8, 7, 5, 8), { archetype: 'playmaker' }),
  q('fiorentina', 'baiano95', 'Francesco Baiano', 1968, 'Italy', ['AM', 'ST'], 79, 80, 1998, 30, t(7, 6, 7, 6, 6, 7), { archetype: 'inside-forward' }),
  q('fiorentina', 'toldo95', 'Francesco Toldo', 1971, 'Italy', ['GK'], 80, 87, 2001, 25, t(8, 5, 7, 8, 3, 7), { latentCeiling: 87 }),
  q('fiorentina', 'mareggini95', 'Giovanni Mareggini', 1966, 'Italy', ['GK'], 70, 71, 1997, 25, t(8, 4, 5, 7, 3, 6)),
  q('fiorentina', 'amoruso95', 'Lorenzo Amoruso', 1971, 'Italy', ['CB'], 79, 81, 1997, 30, t(8, 6, 7, 7, 5, 7), { archetype: 'covering-cb' }),
  q('fiorentina', 'padalino95', 'Pasquale Padalino', 1972, 'Italy', ['CB'], 76, 78, 1999, 30, t(8, 4, 6, 7, 4, 7), { archetype: 'covering-cb' }),
  q('fiorentina', 'serena95', 'Michele Serena', 1970, 'Italy', ['RB', 'LB'], 75, 76, 1998, 30, t(8, 4, 6, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('fiorentina', 'carnasciali95', 'Daniele Carnasciali', 1969, 'Italy', ['RB', 'LB'], 75, 76, 1999, 30, t(8, 4, 6, 8, 3, 7)),
  q('fiorentina', 'schwarz95', 'Stefan Schwarz', 1969, 'Sweden', ['DM', 'CM'], 80, 81, 1996, 28, t(8, 5, 7, 6, 5, 7), { archetype: 'destroyer' }),
  q('fiorentina', 'cois95', 'Stefano Cois', 1969, 'Italy', ['CM', 'DM'], 76, 77, 1998, 30, t(8, 4, 7, 7, 4, 7)),
  q('fiorentina', 'piacentini95', 'Giovanni Piacentini', 1968, 'Italy', ['DM', 'CM'], 74, 75, 1998, 30, t(8, 4, 6, 7, 4, 6), { archetype: 'destroyer' }),
  q('fiorentina', 'bigica95', 'Emiliano Bigica', 1973, 'Italy', ['DM', 'CB'], 72, 75, 1998, 30, t(7, 4, 7, 7, 4, 6)),
  q('fiorentina', 'robbiati95', 'Anselmo Robbiati', 1970, 'Italy', ['LW', 'RW'], 76, 77, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('fiorentina', 'orlandom95', 'Massimo Orlando', 1971, 'Italy', ['CM', 'LW'], 73, 76, 1998, 30, t(7, 5, 7, 6, 5, 7)),
  q('fiorentina', 'bettoni95', 'Federico Bettoni', 1972, 'Italy', ['CM', 'DM'], 71, 73, 1998, 30, t(7, 4, 6, 7, 4, 6)),
  q('fiorentina', 'sottil95', 'Andrea Sottil', 1974, 'Italy', ['CB', 'RB'], 71, 76, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('fiorentina', 'malusci95', 'Alessandro Malusci', 1974, 'Italy', ['CB'], 71, 75, 1999, 30, t(7, 4, 6, 7, 4, 7), { archetype: 'covering-cb' }),
  q('fiorentina', 'banchelli95', 'Giacomo Banchelli', 1973, 'Italy', ['ST'], 72, 74, 1998, 30, t(6, 6, 6, 6, 6, 6), { archetype: 'poacher' }),
  q('fiorentina', 'flachi95', 'Francesco Flachi', 1975, 'Italy', ['ST', 'AM'], 70, 80, 1999, 30, t(5, 7, 7, 5, 7, 6), { latentCeiling: 81 }),
];

/** Sampdoria, 1995–96 — Eriksson's talented side: Mancini the captain-talisman, a
 *  22-goal Enrico Chiesa, and two future greats in Seedorf and Karembeu passing through. */
export const SAMPDORIA_1995: CuratedSeed[] = [
  q('sampdoria', 'zenga95', 'Walter Zenga', 1960, 'Italy', ['GK'], 80, 80, 1997, 25, t(8, 7, 7, 6, 5, 7)),
  q('sampdoria', 'pagotto95', 'Angelo Pagotto', 1973, 'Italy', ['GK'], 70, 74, 1998, 30, t(7, 5, 6, 6, 5, 6)),
  q('sampdoria', 'sereni95', 'Matteo Sereni', 1975, 'Italy', ['GK'], 68, 80, 1999, 25, t(7, 4, 7, 7, 4, 6)),
  q('sampdoria', 'mannini95', 'Moreno Mannini', 1962, 'Italy', ['RB', 'CB'], 76, 76, 1997, 30, t(8, 4, 6, 9, 3, 7)),
  q('sampdoria', 'ferri95', 'Riccardo Ferri', 1963, 'Italy', ['CB'], 77, 77, 1997, 30, t(8, 5, 6, 8, 4, 6), { archetype: 'covering-cb' }),
  q('sampdoria', 'mihajlovic95', 'Siniša Mihajlović', 1969, 'Serbia', ['CB', 'LB'], 82, 84, 1998, 30, t(6, 8, 8, 6, 8, 6), { archetype: 'covering-cb' }),
  q('sampdoria', 'balleri95', 'David Balleri', 1969, 'Italy', ['RB'], 74, 76, 1998, 30, t(8, 4, 6, 7, 4, 7)),
  q('sampdoria', 'marcorossi95', 'Marco Rossi', 1964, 'Italy', ['CB', 'LB'], 71, 71, 1997, 30, t(8, 4, 6, 7, 4, 7)),
  q('sampdoria', 'franceschetti95', 'Marco Franceschetti', 1967, 'Italy', ['CB', 'RB'], 71, 72, 1997, 30, t(7, 4, 6, 7, 4, 6)),
  q('sampdoria', 'pesaresi95', 'Emanuele Pesaresi', 1976, 'Italy', ['LB'], 71, 78, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('sampdoria', 'lamonica95', 'Alessandro Lamonica', 1973, 'Italy', ['CB'], 69, 72, 1998, 30, t(7, 4, 6, 7, 4, 6)),
  q('sampdoria', 'sacchetti95', 'Stefano Sacchetti', 1972, 'Italy', ['CB'], 71, 73, 1998, 30, t(7, 4, 6, 7, 4, 6)),
  // Karembeu — the powerful French engine, off to Real Madrid in 1996.
  q('sampdoria', 'karembeu95', 'Christian Karembeu', 1970, 'France', ['DM', 'CM'], 81, 83, 1996, 25, t(8, 5, 8, 6, 5, 8), { archetype: 'destroyer' }),
  // Seedorf — one Sampdoria season at 19 before the Bernabéu; a future four-time European champion.
  q('sampdoria', 'seedorf95', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 82, 90, 1996, 20, t(8, 6, 9, 6, 5, 8), { archetype: 'playmaker', latentCeiling: 90 }),
  q('sampdoria', 'salsano95', 'Fausto Salsano', 1962, 'Italy', ['CM'], 75, 75, 1997, 30, t(8, 4, 6, 8, 4, 7)),
  q('sampdoria', 'evani95', 'Alberigo Evani', 1963, 'Italy', ['LW', 'CM'], 76, 76, 1997, 30, t(8, 4, 6, 8, 4, 7)),
  q('sampdoria', 'invernizzi95', 'Giovanni Invernizzi', 1963, 'Italy', ['CM'], 72, 72, 1997, 30, t(7, 4, 6, 7, 4, 6)),
  q('sampdoria', 'iacopino95', 'Vincenzo Iacopino', 1976, 'Italy', ['CM', 'AM'], 69, 74, 1999, 30, t(7, 4, 7, 7, 4, 7)),
  q('sampdoria', 'rmancini95', 'Roberto Mancini', 1964, 'Italy', ['AM', 'ST'], 83, 84, 1997, 30, t(7, 7, 8, 7, 6, 7), { archetype: 'playmaker', loyalty: 88 }),
  // Enrico Chiesa — 22 league goals, then off to Parma in 1996.
  q('sampdoria', 'echiesa95', 'Enrico Chiesa', 1970, 'Italy', ['ST'], 82, 84, 1996, 32, t(7, 6, 8, 6, 6, 7), { archetype: 'poacher' }),
  q('sampdoria', 'maniero95', 'Filippo Maniero', 1972, 'Italy', ['ST'], 76, 78, 1998, 32, t(7, 5, 7, 6, 5, 7), { archetype: 'poacher' }),
  q('sampdoria', 'bellucci95', 'Claudio Bellucci', 1975, 'Italy', ['ST'], 71, 78, 1999, 30, t(7, 5, 7, 6, 5, 7), { archetype: 'poacher' }),
];

/** AS Roma, 1995–96 — Mazzone's 5th-placed side, and the season a teenage Francesco
 *  Totti began to break through behind captain Giannini and the Balbo–Fonseca attack. */
export const ROMA_1995: CuratedSeed[] = [
  q('roma', 'cervone95', 'Giovanni Cervone', 1961, 'Italy', ['GK'], 78, 78, 1997, 25, t(8, 5, 6, 8, 4, 6)),
  q('roma', 'sterchele95', 'Giorgio Sterchele', 1970, 'Italy', ['GK'], 71, 76, 1999, 25, t(7, 4, 6, 7, 4, 6)),
  q('roma', 'dimagno95', 'Giampaolo Di Magno', 1974, 'Italy', ['GK'], 68, 72, 1998, 25, t(7, 4, 6, 7, 4, 6)),
  q('roma', 'annoni95', 'Enrico Annoni', 1966, 'Italy', ['CB', 'RB'], 76, 76, 1997, 30, t(8, 4, 6, 7, 5, 7), { archetype: 'covering-cb' }),
  q('roma', 'lanna95', 'Marco Lanna', 1968, 'Italy', ['RB', 'CB'], 76, 77, 1998, 30, t(8, 4, 6, 7, 4, 7)),
  q('roma', 'petruzzi95', 'Fabio Petruzzi', 1970, 'Italy', ['CB', 'RB'], 75, 76, 1999, 30, t(8, 4, 6, 7, 4, 7), { archetype: 'covering-cb' }),
  q('roma', 'aldair95', 'Aldair', 1965, 'Brazil', ['CB'], 82, 83, 2000, 25, t(9, 4, 7, 8, 3, 7), { archetype: 'covering-cb', loyalty: 88 }),
  q('roma', 'carboni95', 'Amedeo Carboni', 1965, 'Italy', ['LB'], 76, 77, 1998, 25, t(8, 4, 6, 7, 4, 8), { archetype: 'full-back-attacking' }),
  q('roma', 'statuto95', 'Antonio Statuto', 1968, 'Italy', ['RB', 'LB'], 72, 73, 1998, 30, t(7, 4, 6, 7, 4, 7)),
  q('roma', 'cherubini95', 'Gianluca Cherubini', 1974, 'Italy', ['CB'], 69, 73, 1998, 30, t(7, 4, 6, 7, 4, 6)),
  // Giannini — 'Il Principe', the captain, in his final season in giallorosso.
  q('roma', 'giannini95', 'Giuseppe Giannini', 1964, 'Italy', ['AM', 'CM'], 82, 82, 1996, 30, t(8, 6, 7, 9, 5, 7), { archetype: 'playmaker', loyalty: 90 }),
  q('roma', 'thern95', 'Jonas Thern', 1967, 'Sweden', ['DM', 'CM'], 78, 79, 1997, 30, t(8, 5, 7, 7, 4, 7), { archetype: 'deep-playmaker' }),
  q('roma', 'dibiagio95', 'Luigi Di Biagio', 1971, 'Italy', ['DM', 'CM'], 77, 82, 2000, 30, t(8, 5, 8, 7, 4, 7), { archetype: 'destroyer' }),
  q('roma', 'moriero95', 'Francesco Moriero', 1969, 'Italy', ['RW'], 78, 80, 1997, 30, t(7, 6, 7, 6, 6, 7)),
  q('roma', 'cappioli95', 'Massimiliano Cappioli', 1968, 'Italy', ['CM', 'AM'], 73, 74, 1998, 30, t(7, 5, 6, 7, 5, 7)),
  q('roma', 'scarchilli95', 'Alessio Scarchilli', 1974, 'Italy', ['CM'], 70, 74, 1998, 30, t(7, 4, 7, 7, 4, 7)),
  // Totti — the homegrown teenager beginning to break through; a Roma immortal in waiting.
  q('roma', 'totti95', 'Francesco Totti', 1976, 'Italy', ['AM', 'LW'], 72, 92, 2001, 25, t(8, 5, 8, 10, 4, 7), { archetype: 'playmaker', latentCeiling: 93, loyalty: 96 }),
  q('roma', 'balbo95', 'Abel Balbo', 1966, 'Argentina', ['ST'], 82, 83, 1998, 30, t(8, 5, 8, 7, 5, 7), { archetype: 'poacher' }),
  q('roma', 'fonseca95', 'Daniel Fonseca', 1969, 'Uruguay', ['ST'], 80, 81, 1998, 35, t(7, 6, 7, 6, 6, 7), { archetype: 'poacher' }),
  // Delvecchio — arrived from Inter in the Jan 1996 Branca swap; broke into the attack.
  q('roma', 'delvecchio95', 'Marco Delvecchio', 1973, 'Italy', ['ST'], 74, 81, 2001, 30, t(7, 6, 7, 7, 5, 7), { archetype: 'poacher' }),
];

/** Napoli, 1995–96 — Boskov's mid-table post-Maradona side, its tight back line built
 *  around a young Roberto Ayala and André Cruz; a goal-shy team with local heart. */
export const NAPOLI_1995: CuratedSeed[] = [
  q('napoli', 'taglialatela95', 'Giuseppe Taglialatela', 1969, 'Italy', ['GK'], 78, 79, 1999, 25, t(8, 5, 6, 8, 5, 7)),
  q('napoli', 'difusco95', 'Raffaele Di Fusco', 1961, 'Italy', ['GK'], 69, 69, 1997, 25, t(8, 4, 5, 9, 3, 6)),
  // Ayala — the marquee River Plate signing who anchored the defence at 22.
  q('napoli', 'ayala95', 'Roberto Ayala', 1973, 'Argentina', ['CB'], 80, 87, 2000, 25, t(9, 5, 8, 7, 4, 7), { archetype: 'covering-cb', latentCeiling: 88 }),
  q('napoli', 'andrecruz95', 'André Cruz', 1968, 'Brazil', ['CB'], 78, 80, 1997, 28, t(8, 5, 7, 7, 4, 7), { archetype: 'covering-cb' }),
  q('napoli', 'tarantino95', 'Massimo Tarantino', 1971, 'Italy', ['CB', 'LB'], 74, 76, 1998, 30, t(7, 4, 6, 7, 4, 7)),
  q('napoli', 'colonnese95', 'Francesco Colonnese', 1971, 'Italy', ['LB', 'RB'], 75, 78, 1997, 30, t(7, 5, 7, 6, 5, 7), { archetype: 'full-back-attacking' }),
  q('napoli', 'baldini95', 'Francesco Baldini', 1974, 'Italy', ['LB', 'RB'], 72, 76, 1999, 30, t(7, 4, 7, 7, 4, 7)),
  q('napoli', 'policano95', 'Roberto Policano', 1964, 'Italy', ['RB', 'RW'], 74, 74, 1997, 30, t(7, 5, 6, 7, 5, 7)),
  q('napoli', 'matrecano95', 'Salvatore Matrecano', 1970, 'Italy', ['CB'], 71, 73, 1998, 30, t(7, 4, 6, 7, 4, 6), { archetype: 'covering-cb' }),
  q('napoli', 'taccola95', 'Mirko Taccola', 1970, 'Italy', ['CB', 'RB'], 70, 72, 1998, 30, t(7, 4, 6, 7, 4, 6)),
  q('napoli', 'caruso95', 'Ciro Caruso', 1973, 'Italy', ['CB'], 68, 74, 1998, 45, t(7, 4, 6, 7, 4, 6)),
  // Boghossian — the box-to-box Frenchman, a 1998 World Cup winner in the making.
  q('napoli', 'boghossian95', 'Alain Boghossian', 1970, 'France', ['DM', 'CM'], 78, 81, 1998, 28, t(7, 5, 8, 6, 5, 7), { archetype: 'destroyer' }),
  q('napoli', 'pari95', 'Fausto Pari', 1962, 'Italy', ['DM', 'CM'], 73, 73, 1997, 30, t(8, 4, 6, 8, 3, 6), { archetype: 'destroyer' }),
  q('napoli', 'bordin95', 'Roberto Bordin', 1965, 'Italy', ['CM'], 71, 72, 1997, 30, t(7, 4, 6, 7, 4, 6)),
  q('napoli', 'pecchia95', 'Fabio Pecchia', 1973, 'Italy', ['CM', 'AM'], 75, 78, 1999, 30, t(8, 5, 7, 7, 4, 7)),
  q('napoli', 'pizzi95', 'Fausto Pizzi', 1967, 'Italy', ['AM', 'CM'], 74, 75, 1998, 30, t(7, 5, 7, 6, 5, 7)),
  q('napoli', 'buso95', 'Renato Buso', 1969, 'Italy', ['RW', 'AM'], 74, 76, 1998, 30, t(7, 5, 7, 6, 5, 7)),
  q('napoli', 'agostini95', 'Massimo Agostini', 1964, 'Italy', ['ST'], 75, 75, 1997, 32, t(7, 5, 7, 7, 5, 6), { archetype: 'poacher' }),
  q('napoli', 'dinapoli95', 'Arturo Di Napoli', 1974, 'Italy', ['ST'], 74, 79, 1999, 30, t(6, 7, 7, 6, 6, 6), { archetype: 'poacher' }),
  q('napoli', 'imbriani95', 'Carmelo Imbriani', 1976, 'Italy', ['ST', 'AM'], 72, 78, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('napoli', 'longo95', 'Raffaele Longo', 1977, 'Italy', ['CM'], 68, 76, 1999, 30, t(7, 4, 7, 7, 4, 7)),
];

/** Shared curated squads for the Serie A 1995-96 cluster — Milan and Juventus are the
 *  title rivals, with the rest of the 90s Serie A "seven sisters" (Lazio, Inter, Parma,
 *  Fiorentina, Roma, Sampdoria) plus Napoli filled out so the golden-age Italian world is
 *  a real, living backdrop in either start point. */
export const SERIE_A_1995_SQUADS: Record<string, CuratedSeed[]> = {
  milan: MILAN_1995,
  juventus: JUVENTUS_1995,
  lazio: LAZIO_1995,
  inter: INTER_1995,
  parma: PARMA_1995,
  fiorentina: FIORENTINA_1995,
  sampdoria: SAMPDORIA_1995,
  roma: ROMA_1995,
  napoli: NAPOLI_1995,
};
