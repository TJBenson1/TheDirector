/**
 * Curated real players — 1995–97 English pack (§4, §17.10).
 *
 * Shared by three start points: Liverpool 1995 (Evans' flashy "Spice Boys"),
 * Chelsea 1996 (Gullit's cosmopolitan revolution, pre-money) and Arsenal 1996
 * (the arrival of Wenger). All four of the era's big sides are curated — plus
 * Ferguson's reigning champions Manchester United — so each is a real title rival
 * in every start point. Ability/potential/personality are designer estimates.
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

/** Liverpool, 1995–96 — Roy Evans' talented, flaky "Spice Boys". */
export const LIVERPOOL_1995: CuratedSeed[] = [
  q('liverpool', 'james96', 'David James', 1970, 'England', ['GK'], 79, 81, 2000, 30, t(6, 6, 6, 6, 6, 6)),
  q('liverpool', 'jones96', 'Rob Jones', 1971, 'England', ['RB', 'CB'], 77, 78, 1999, 50, t(7, 5, 6, 8, 4, 7), { archetype: 'full-back-attacking' }),
  q('liverpool', 'markwright96', 'Mark Wright', 1963, 'England', ['CB'], 78, 78, 1998, 45, t(7, 6, 6, 7, 4, 7), { archetype: 'covering-cb' }),
  q('liverpool', 'scales96', 'John Scales', 1966, 'England', ['CB'], 76, 76, 1999, 35, t(7, 5, 6, 6, 4, 7), { archetype: 'covering-cb' }),
  q('liverpool', 'ruddock96', 'Neil Ruddock', 1968, 'England', ['CB'], 76, 76, 1999, 40, t(5, 7, 5, 7, 7, 6)),
  q('liverpool', 'babb96', 'Phil Babb', 1970, 'Ireland', ['CB', 'LB'], 76, 77, 2000, 35, t(6, 5, 6, 6, 5, 6), { archetype: 'covering-cb' }),
  q('liverpool', 'bjornebye96', 'Stig Inge Bjørnebye', 1969, 'Norway', ['LB'], 74, 75, 1999, 45, t(7, 5, 6, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('liverpool', 'harkness96', 'Steve Harkness', 1971, 'England', ['LB', 'CB'], 73, 74, 2000, 40, t(6, 5, 5, 7, 5, 6)),
  q('liverpool', 'matteo96', 'Dominic Matteo', 1974, 'Scotland', ['CB', 'LB'], 73, 78, 2000, 30, t(7, 5, 6, 6, 4, 7), { archetype: 'covering-cb' }),
  q('liverpool', 'mcateer96', 'Jason McAteer', 1971, 'Ireland', ['RB', 'CM', 'RW'], 77, 78, 2000, 35, t(6, 6, 6, 6, 6, 7), { archetype: 'full-back-attacking' }),
  q('liverpool', 'redknapp96', 'Jamie Redknapp', 1973, 'England', ['CM'], 80, 82, 2000, 55, t(7, 6, 7, 7, 4, 7), { archetype: 'deep-playmaker' }),
  q('liverpool', 'barnes96', 'John Barnes', 1963, 'England', ['CM', 'AM', 'LW'], 80, 80, 1998, 40, t(8, 6, 6, 8, 3, 8), { archetype: 'playmaker' }),
  q('liverpool', 'thomas96', 'Michael Thomas', 1967, 'England', ['CM', 'DM'], 76, 76, 1998, 35, t(7, 5, 5, 6, 4, 7)),
  q('liverpool', 'mcmanaman96', 'Steve McManaman', 1972, 'England', ['RW', 'AM'], 84, 85, 2000, 30, t(7, 6, 7, 8, 4, 7), { archetype: 'inside-forward' }),
  q('liverpool', 'kennedy96', 'Mark Kennedy', 1976, 'Ireland', ['LW', 'LB'], 73, 78, 2000, 30, t(6, 6, 7, 6, 6, 6)),
  q('liverpool', 'fowler96', 'Robbie Fowler', 1975, 'England', ['ST'], 85, 88, 2001, 35, t(6, 6, 7, 9, 6, 7), { archetype: 'poacher' }),
  // Collymore — the British-record signing whose volatility and off-field troubles
  // squandered a huge talent; a lost talent if you can settle him (latent 88).
  q('liverpool', 'collymore96', 'Stan Collymore', 1971, 'England', ['ST'], 82, 84, 2000, 35, t(4, 8, 7, 3, 9, 4), { archetype: 'poacher', latentCeiling: 88 }),
  q('liverpool', 'rush96', 'Ian Rush', 1961, 'Wales', ['ST'], 78, 78, 1998, 35, t(8, 5, 5, 9, 3, 7), { archetype: 'poacher' }),
];

/** Chelsea, 1996–97 — Ruud Gullit's cosmopolitan revolution, pre-Abramovich. */
export const CHELSEA_1996: CuratedSeed[] = [
  q('chelsea', 'kharine96', 'Dmitri Kharine', 1968, 'Russia', ['GK'], 75, 76, 1998, 40, t(6, 4, 5, 7, 4, 6)),
  q('chelsea', 'hitchcock96', 'Kevin Hitchcock', 1962, 'England', ['GK'], 75, 75, 1998, 30, t(7, 3, 4, 9, 3, 6)),
  q('chelsea', 'clarke96', 'Steve Clarke', 1963, 'Scotland', ['RB', 'CB'], 77, 77, 1998, 30, t(8, 4, 5, 9, 3, 6)),
  q('chelsea', 'sinclair96', 'Frank Sinclair', 1971, 'England', ['CB', 'RB'], 74, 76, 1999, 35, t(6, 5, 6, 6, 5, 6)),
  q('chelsea', 'duberry96', 'Michael Duberry', 1975, 'England', ['CB'], 74, 82, 2000, 40, t(6, 5, 7, 6, 5, 6)),
  q('chelsea', 'ejohnsen96', 'Erland Johnsen', 1967, 'Norway', ['CB'], 74, 74, 1998, 35, t(7, 4, 4, 7, 3, 6)),
  q('chelsea', 'leboeuf96', 'Frank Leboeuf', 1968, 'France', ['CB'], 82, 83, 2000, 30, t(7, 8, 7, 5, 5, 7), { archetype: 'covering-cb' }),
  q('chelsea', 'minto96', 'Scott Minto', 1971, 'England', ['LB'], 73, 75, 1998, 40, t(6, 4, 5, 6, 4, 6)),
  q('chelsea', 'petrescu96', 'Dan Petrescu', 1967, 'Romania', ['RB', 'RW'], 79, 79, 2000, 35, t(7, 6, 6, 6, 5, 7), { archetype: 'full-back-attacking' }),
  q('chelsea', 'wise96', 'Dennis Wise', 1966, 'England', ['CM'], 79, 79, 2000, 35, t(6, 6, 7, 9, 9, 6)),
  q('chelsea', 'dimatteo96', 'Roberto Di Matteo', 1970, 'Italy', ['CM'], 81, 82, 2000, 35, t(8, 5, 7, 7, 4, 8)),
  q('chelsea', 'burley96', 'Craig Burley', 1971, 'Scotland', ['CM'], 76, 78, 1999, 35, t(7, 5, 6, 6, 5, 6)),
  q('chelsea', 'peacock96', 'Gavin Peacock', 1967, 'England', ['CM', 'AM'], 74, 74, 1998, 30, t(8, 4, 5, 8, 3, 6)),
  // Gullit — the player-manager, a Ballon d'Or great now orchestrating from deep at 34.
  q('chelsea', 'gullit96', 'Ruud Gullit', 1962, 'Netherlands', ['CM', 'CB'], 81, 81, 1998, 45, t(8, 8, 9, 6, 5, 8), { archetype: 'deep-playmaker' }),
  q('chelsea', 'zola96', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 86, 86, 2000, 30, t(10, 4, 7, 8, 3, 9), { archetype: 'playmaker' }),
  q('chelsea', 'vialli96', 'Gianluca Vialli', 1964, 'Italy', ['ST'], 82, 82, 1999, 40, t(8, 7, 8, 6, 5, 7), { archetype: 'poacher' }),
  q('chelsea', 'hughes96', 'Mark Hughes', 1963, 'Wales', ['ST'], 80, 80, 1998, 35, t(8, 5, 6, 6, 6, 6), { archetype: 'poacher' }),
];

/** Arsenal, 1996–97 — the arrival of Wenger; his revolution begins around the famous
 *  back line, Bergkamp and a young colossus Vieira. */
export const ARSENAL_1996: CuratedSeed[] = [
  q('arsenal', 'seaman96', 'David Seaman', 1963, 'England', ['GK'], 84, 84, 2000, 30, t(9, 5, 6, 9, 4, 7)),
  q('arsenal', 'dixon96', 'Lee Dixon', 1964, 'England', ['RB'], 78, 78, 1999, 30, t(9, 4, 6, 9, 4, 7), { archetype: 'full-back-attacking' }),
  q('arsenal', 'winterburn96', 'Nigel Winterburn', 1963, 'England', ['LB'], 78, 78, 1999, 30, t(9, 4, 6, 9, 4, 7), { archetype: 'full-back-attacking' }),
  q('arsenal', 'adams96', 'Tony Adams', 1966, 'England', ['CB'], 84, 84, 2001, 35, t(10, 5, 7, 10, 5, 7), { archetype: 'covering-cb', loyalty: 95 }),
  q('arsenal', 'bould96', 'Steve Bould', 1962, 'England', ['CB'], 78, 78, 1998, 36, t(9, 4, 5, 9, 4, 6), { archetype: 'covering-cb' }),
  q('arsenal', 'keown96', 'Martin Keown', 1966, 'England', ['CB'], 79, 79, 2000, 35, t(9, 5, 6, 9, 6, 7)),
  // Vieira — Wenger's first great signing, a 20-year-old about to become the best
  // midfielder in England. Reality-rail talent (huge ceiling).
  q('arsenal', 'vieira96', 'Patrick Vieira', 1976, 'France', ['DM', 'CM'], 80, 90, 2001, 30, t(8, 6, 9, 7, 6, 8)),
  q('arsenal', 'garde96', 'Rémi Garde', 1966, 'France', ['DM', 'CM'], 74, 74, 1998, 34, t(8, 4, 5, 7, 4, 7)),
  q('arsenal', 'platt96', 'David Platt', 1966, 'England', ['CM', 'AM'], 80, 80, 1999, 32, t(9, 6, 7, 7, 5, 8), { archetype: 'deep-playmaker' }),
  q('arsenal', 'parlour96', 'Ray Parlour', 1973, 'England', ['CM', 'RW'], 77, 80, 2001, 30, t(8, 4, 7, 9, 6, 7)),
  q('arsenal', 'merson96', 'Paul Merson', 1968, 'England', ['AM', 'RW'], 79, 79, 1999, 32, t(6, 6, 6, 8, 7, 6), { archetype: 'playmaker' }),
  q('arsenal', 'bergkamp96', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 87, 88, 2001, 32, t(10, 6, 8, 8, 5, 7), { archetype: 'playmaker' }),
  q('arsenal', 'ianwright96', 'Ian Wright', 1963, 'England', ['ST'], 84, 84, 1999, 30, t(8, 7, 8, 9, 7, 6), { archetype: 'poacher' }),
  q('arsenal', 'hartson96', 'John Hartson', 1975, 'Wales', ['ST'], 76, 80, 2000, 35, t(6, 6, 7, 6, 7, 6)),
  // Anelka — a 17-year-old who would explode into a star, then agitate his way out.
  // A precocious, high-ego lost-and-found talent (latent 88).
  q('arsenal', 'anelka96', 'Nicolas Anelka', 1979, 'France', ['ST', 'LW'], 68, 88, 2001, 28, t(7, 8, 9, 4, 6, 7), { archetype: 'poacher', latentCeiling: 88 }),
  q('arsenal', 'selley96', 'Ian Selley', 1974, 'England', ['CM', 'DM'], 72, 74, 1998, 42, t(7, 4, 6, 8, 5, 6)),
];

/** Manchester United, 1996–97 — Ferguson's champions; the Class of 92 maturing
 *  around Cantona's final season. The benchmark title rival for the cluster. */
export const MAN_UTD_1996: CuratedSeed[] = [
  q('man_utd', 'schmeichel96', 'Peter Schmeichel', 1963, 'Denmark', ['GK'], 88, 88, 1999, 25, t(9, 7, 8, 7, 7, 7)),
  q('man_utd', 'gneville96', 'Gary Neville', 1975, 'England', ['RB', 'CB'], 78, 84, 2002, 30, t(9, 5, 8, 10, 6, 6), { archetype: 'full-back-attacking' }),
  q('man_utd', 'pneville96', 'Phil Neville', 1977, 'England', ['LB', 'RB', 'CM'], 74, 80, 2002, 30, t(9, 4, 7, 10, 4, 7)),
  q('man_utd', 'irwin96', 'Denis Irwin', 1965, 'Ireland', ['LB', 'RB'], 80, 80, 1999, 30, t(10, 3, 7, 9, 3, 8), { archetype: 'full-back-attacking' }),
  q('man_utd', 'pallister96', 'Gary Pallister', 1965, 'England', ['CB'], 80, 80, 1999, 40, t(8, 4, 7, 8, 4, 7), { archetype: 'covering-cb' }),
  q('man_utd', 'rjohnsen96', 'Ronny Johnsen', 1969, 'Norway', ['CB', 'DM'], 78, 80, 2000, 45, t(8, 4, 7, 7, 4, 8), { archetype: 'covering-cb' }),
  q('man_utd', 'may96', 'David May', 1970, 'England', ['CB', 'RB'], 74, 74, 1999, 40, t(7, 5, 6, 7, 5, 6)),
  q('man_utd', 'keane96', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 85, 88, 2000, 40, t(9, 8, 10, 9, 8, 6), { archetype: 'deep-playmaker' }),
  q('man_utd', 'butt96', 'Nicky Butt', 1975, 'England', ['CM', 'DM'], 76, 82, 2001, 30, t(8, 4, 7, 10, 5, 7)),
  q('man_utd', 'beckham96', 'David Beckham', 1975, 'England', ['RW', 'CM'], 80, 88, 2002, 25, t(9, 6, 8, 9, 4, 7), { archetype: 'inside-forward' }),
  q('man_utd', 'giggs96', 'Ryan Giggs', 1973, 'Wales', ['LW'], 83, 85, 2002, 40, t(9, 4, 8, 10, 3, 7), { archetype: 'inside-forward' }),
  q('man_utd', 'scholes96', 'Paul Scholes', 1974, 'England', ['AM', 'CM', 'ST'], 78, 87, 2002, 30, t(10, 2, 7, 10, 3, 7), { archetype: 'deep-playmaker' }),
  q('man_utd', 'poborsky96', 'Karel Poborský', 1972, 'Czech Republic', ['RW'], 78, 80, 1999, 30, t(7, 5, 6, 5, 4, 5)),
  q('man_utd', 'cruyff96', 'Jordi Cruyff', 1974, 'Netherlands', ['AM', 'ST', 'LW'], 76, 79, 1999, 40, t(6, 6, 6, 5, 5, 5)),
  q('man_utd', 'cantona96', 'Eric Cantona', 1966, 'France', ['AM', 'ST'], 87, 87, 1998, 30, t(8, 9, 8, 7, 9, 6), { archetype: 'playmaker' }),
  q('man_utd', 'cole96', 'Andy Cole', 1971, 'England', ['ST'], 80, 82, 2001, 35, t(7, 6, 8, 6, 5, 6), { archetype: 'poacher' }),
  q('man_utd', 'solskjaer96', 'Ole Gunnar Solskjær', 1973, 'Norway', ['ST'], 79, 83, 2001, 30, t(9, 3, 8, 8, 3, 8), { archetype: 'poacher' }),
  q('man_utd', 'mcclair96', 'Brian McClair', 1963, 'Scotland', ['CM', 'ST'], 74, 74, 1998, 30, t(9, 3, 7, 9, 3, 7)),
];

/** Shared curated squads for the English 1995-97 cluster — all four of the era's
 *  big sides are real, so each is a title rival in every start point. */
export const ENGLAND_1996_SQUADS: Record<string, CuratedSeed[]> = {
  liverpool: LIVERPOOL_1995,
  chelsea: CHELSEA_1996,
  arsenal: ARSENAL_1996,
  man_utd: MAN_UTD_1996,
};
