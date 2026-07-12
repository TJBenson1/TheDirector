/**
 * Curated real players — 2001 post-treble era pack (§4, §17.10).
 *
 * Vertical slice for "Liverpool go for it after the 2001 treble": Houllier's
 * side, the rivals of the day (Ferguson's United, Wenger's Arsenal, O'Leary's
 * Leeds) and a PRE-Abramovich Chelsea, plus the pieces of the counterfactual —
 * Anelka (on loan, the sign-him-or-not call), Diouf/Cheyrou (the real flops to
 * avoid), and Chelsea's 2003 takeover splurge (which only happens if Abramovich
 * buys). Ability/personality are hidden designer estimates (§7).
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
  extra: { hardBlocks?: HardBlock[]; loyalty?: number } = {},
): CuratedSeed {
  return { id: `cur_${id}`, name, birthYear, nationality, positions, club, contractUntil, ability, potentialCeiling, personality, injuryProneness, ...extra };
}

/** Liverpool, 2001–02 — the treble winners, with Anelka on loan. */
export const LIVERPOOL_2001: CuratedSeed[] = [
  q('liverpool', 'dudek', 'Jerzy Dudek', 1973, 'Poland', ['GK'], 80, 82, 2006, 25, t(7, 5, 7, 7, 5, 7)),
  q('liverpool', 'babbel', 'Markus Babbel', 1972, 'Germany', ['RB', 'CB'], 81, 82, 2005, 40, t(8, 5, 8, 7, 4, 7)),
  q('liverpool', 'henchoz', 'Stéphane Henchoz', 1974, 'Switzerland', ['CB'], 80, 81, 2005, 30, t(8, 4, 7, 7, 4, 6)),
  q('liverpool', 'hyypia01', 'Sami Hyypiä', 1973, 'Finland', ['CB'], 83, 84, 2006, 20, t(9, 4, 7, 8, 3, 7)),
  q('liverpool', 'carra01', 'Jamie Carragher', 1978, 'England', ['CB', 'RB'], 79, 86, 2007, 25, t(9, 4, 8, 10, 5, 6)),
  q('liverpool', 'riise01', 'John Arne Riise', 1980, 'Norway', ['LB', 'LW'], 78, 83, 2006, 25, t(8, 5, 7, 7, 4, 7)),
  q('liverpool', 'gerrard01', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 82, 91, 2006, 35, t(9, 6, 10, 10, 5, 7), { loyalty: 92 }),
  q('liverpool', 'hamann01', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 82, 83, 2005, 30, t(8, 4, 7, 6, 3, 7)),
  q('liverpool', 'mcallister', 'Gary McAllister', 1964, 'Scotland', ['CM'], 80, 80, 2002, 25, t(9, 5, 8, 8, 3, 7)),
  q('liverpool', 'murphy01', 'Danny Murphy', 1977, 'England', ['CM', 'AM'], 78, 82, 2005, 25, t(8, 5, 7, 7, 4, 7)),
  q('liverpool', 'owen01', 'Michael Owen', 1979, 'England', ['ST'], 86, 89, 2005, 45, t(8, 6, 8, 7, 4, 7)),
  q('liverpool', 'heskey01', 'Emile Heskey', 1978, 'England', ['ST', 'LW'], 79, 82, 2005, 30, t(7, 5, 7, 7, 4, 7)),
  q('liverpool', 'fowler01', 'Robbie Fowler', 1975, 'England', ['ST'], 82, 84, 2004, 45, t(6, 7, 7, 8, 6, 7)),
  q('liverpool', 'litmanen', 'Jari Litmanen', 1971, 'Finland', ['AM'], 82, 83, 2003, 40, t(8, 5, 7, 6, 4, 7)),
  q('liverpool', 'smicer', 'Vladimír Šmicer', 1973, 'Czech Republic', ['RW', 'AM'], 77, 79, 2005, 45, t(7, 5, 7, 6, 5, 7)),
  // On loan from PSG — the sign-him-permanently call (real Liverpool passed).
  q('liverpool', 'anelka01', 'Nicolas Anelka', 1979, 'France', ['ST'], 84, 87, 2002, 30, t(5, 8, 8, 4, 6, 6)),
];

/** Manchester United, 2001–02. */
export const MAN_UTD_2001: CuratedSeed[] = [
  q('man_utd', 'barthez01', 'Fabien Barthez', 1971, 'France', ['GK'], 82, 83, 2004, 25, t(6, 7, 7, 6, 6, 6)),
  q('man_utd', 'gneville01', 'Gary Neville', 1975, 'England', ['RB'], 82, 84, 2006, 25, t(9, 5, 8, 10, 4, 7)),
  q('man_utd', 'stam01', 'Jaap Stam', 1972, 'Netherlands', ['CB'], 88, 89, 2004, 35, t(8, 6, 8, 6, 5, 6)),
  q('man_utd', 'blanc', 'Laurent Blanc', 1965, 'France', ['CB'], 81, 82, 2003, 25, t(9, 6, 8, 8, 3, 6)),
  q('man_utd', 'silvestre01', 'Mikael Silvestre', 1977, 'France', ['CB', 'LB'], 79, 85, 2006, 28, t(7, 5, 7, 6, 4, 8)),
  q('man_utd', 'keane01', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 89, 90, 2005, 45, t(9, 8, 10, 8, 8, 6)),
  q('man_utd', 'scholes01', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 87, 89, 2005, 25, t(9, 3, 8, 10, 5, 7)),
  q('man_utd', 'beckham01', 'David Beckham', 1975, 'England', ['RW', 'CM'], 88, 89, 2004, 20, t(9, 8, 9, 7, 4, 7)),
  q('man_utd', 'giggs01', 'Ryan Giggs', 1973, 'Wales', ['LW'], 87, 88, 2006, 30, t(9, 5, 8, 10, 3, 7)),
  q('man_utd', 'veron01', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM', 'AM'], 85, 86, 2005, 35, t(7, 6, 8, 5, 5, 5)),
  q('man_utd', 'ruud01', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 87, 90, 2006, 45, t(8, 6, 9, 6, 4, 7)),
  q('man_utd', 'solskjaer01', 'Ole Gunnar Solskjær', 1973, 'Norway', ['ST'], 82, 83, 2004, 40, t(9, 4, 8, 9, 3, 7)),
  q('man_utd', 'cole01', 'Andy Cole', 1971, 'England', ['ST'], 81, 82, 2003, 35, t(7, 6, 7, 6, 5, 7)),
];

/** Arsenal, 2001–02 — the double winners. */
export const ARSENAL_2001: CuratedSeed[] = [
  q('arsenal', 'seaman01', 'David Seaman', 1963, 'England', ['GK'], 80, 81, 2003, 25, t(8, 6, 8, 9, 3, 6)),
  q('arsenal', 'lauren01', 'Lauren', 1977, 'Cameroon', ['RB'], 79, 82, 2006, 30, t(8, 5, 8, 7, 4, 7)),
  q('arsenal', 'campbell01', 'Sol Campbell', 1974, 'England', ['CB'], 85, 87, 2006, 25, t(8, 6, 8, 7, 4, 6)),
  q('arsenal', 'adams01', 'Tony Adams', 1966, 'England', ['CB'], 82, 82, 2002, 30, t(9, 7, 9, 10, 4, 6)),
  q('arsenal', 'acole01', 'Ashley Cole', 1980, 'England', ['LB'], 78, 88, 2006, 25, t(8, 6, 8, 7, 5, 7)),
  q('arsenal', 'vieira01', 'Patrick Vieira', 1976, 'France', ['CM', 'DM'], 87, 89, 2005, 25, t(8, 7, 9, 6, 6, 7)),
  q('arsenal', 'pires01', 'Robert Pirès', 1973, 'France', ['LW', 'AM'], 85, 87, 2005, 30, t(8, 5, 8, 7, 3, 7)),
  q('arsenal', 'ljungberg01', 'Fredrik Ljungberg', 1977, 'Sweden', ['RW', 'AM'], 83, 85, 2006, 35, t(8, 6, 8, 7, 4, 7)),
  q('arsenal', 'bergkamp01', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 86, 87, 2005, 25, t(9, 6, 8, 8, 3, 6)),
  q('arsenal', 'henry01', 'Thierry Henry', 1977, 'France', ['ST', 'LW'], 88, 92, 2006, 25, t(9, 7, 9, 8, 4, 8)),
  q('arsenal', 'wiltord', 'Sylvain Wiltord', 1974, 'France', ['ST', 'RW'], 81, 83, 2005, 30, t(7, 6, 7, 6, 5, 7)),
];

/** Chelsea, 2001–02 — PRE-Abramovich: a good side, not yet a superpower. */
export const CHELSEA_2001: CuratedSeed[] = [
  q('chelsea', 'cudicini', 'Carlo Cudicini', 1973, 'Italy', ['GK'], 81, 83, 2006, 25, t(8, 5, 7, 7, 4, 7)),
  q('chelsea', 'melchiot', 'Mario Melchiot', 1976, 'Netherlands', ['RB'], 77, 79, 2004, 25, t(7, 5, 7, 6, 4, 7)),
  q('chelsea', 'terry01', 'John Terry', 1980, 'England', ['CB'], 80, 88, 2006, 30, t(8, 7, 9, 9, 5, 6)),
  q('chelsea', 'gallas01', 'William Gallas', 1977, 'France', ['CB', 'LB'], 81, 85, 2005, 30, t(7, 6, 7, 5, 6, 7)),
  q('chelsea', 'lesaux', 'Graeme Le Saux', 1968, 'England', ['LB'], 78, 79, 2003, 30, t(8, 5, 7, 7, 5, 7)),
  q('chelsea', 'lampard01', 'Frank Lampard', 1978, 'England', ['CM'], 82, 88, 2007, 20, t(9, 6, 9, 8, 3, 7)),
  q('chelsea', 'petit', 'Emmanuel Petit', 1970, 'France', ['DM', 'CM'], 81, 82, 2004, 30, t(7, 6, 7, 6, 5, 7)),
  q('chelsea', 'gronkjaer', 'Jesper Grønkjær', 1977, 'Denmark', ['RW', 'LW'], 77, 80, 2004, 30, t(7, 5, 7, 6, 5, 7)),
  q('chelsea', 'zola01', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 84, 85, 2003, 25, t(9, 5, 8, 9, 3, 7)),
  q('chelsea', 'gudjohnsen01', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 81, 84, 2006, 30, t(8, 5, 7, 6, 4, 7)),
  q('chelsea', 'hasselbaink', 'Jimmy Floyd Hasselbaink', 1972, 'Netherlands', ['ST'], 84, 85, 2004, 30, t(7, 7, 8, 6, 5, 7)),
];

/** Leeds United, 2001–02 — O'Leary's Champions-League semi-finalists. */
export const LEEDS_2001: CuratedSeed[] = [
  q('leeds', 'martyn', 'Nigel Martyn', 1966, 'England', ['GK'], 80, 81, 2004, 25, t(8, 5, 7, 8, 4, 6)),
  q('leeds', 'ferdinand01', 'Rio Ferdinand', 1978, 'England', ['CB'], 84, 90, 2006, 30, t(7, 6, 8, 6, 5, 7)),
  q('leeds', 'woodgate01', 'Jonathan Woodgate', 1980, 'England', ['CB'], 81, 88, 2006, 65, t(6, 5, 7, 6, 6, 6)),
  q('leeds', 'harte', 'Ian Harte', 1977, 'Ireland', ['LB'], 78, 80, 2005, 30, t(7, 5, 7, 7, 4, 7)),
  q('leeds', 'batty', 'David Batty', 1968, 'England', ['DM'], 79, 80, 2004, 35, t(8, 5, 8, 8, 6, 6)),
  q('leeds', 'bowyer', 'Lee Bowyer', 1977, 'England', ['CM'], 80, 83, 2004, 35, t(6, 7, 8, 6, 7, 6)),
  q('leeds', 'dacourt01', 'Olivier Dacourt', 1974, 'France', ['CM', 'DM'], 80, 82, 2005, 30, t(7, 5, 7, 5, 6, 7)),
  q('leeds', 'kewell01', 'Harry Kewell', 1978, 'Australia', ['LW', 'ST'], 83, 87, 2004, 50, t(6, 7, 7, 5, 6, 7)),
  q('leeds', 'viduka01', 'Mark Viduka', 1975, 'Australia', ['ST'], 83, 85, 2005, 35, t(6, 7, 7, 5, 6, 6)),
  q('leeds', 'smith01', 'Alan Smith', 1980, 'England', ['ST', 'AM'], 78, 84, 2006, 40, t(6, 7, 8, 7, 8, 6)),
];

/** Newcastle United, 2001–02 — Robson's top-four side. */
export const NEWCASTLE_2001: CuratedSeed[] = [
  q('newcastle', 'shearer01', 'Alan Shearer', 1970, 'England', ['ST'], 84, 85, 2004, 40, t(9, 7, 8, 10, 4, 6)),
  q('newcastle', 'bellamy', 'Craig Bellamy', 1979, 'Wales', ['ST', 'LW'], 80, 84, 2005, 40, t(6, 7, 8, 6, 8, 7)),
  q('newcastle', 'robert', 'Laurent Robert', 1975, 'France', ['LW'], 79, 81, 2005, 30, t(6, 6, 7, 5, 6, 7)),
  q('newcastle', 'speed01', 'Gary Speed', 1969, 'Wales', ['CM'], 80, 81, 2004, 20, t(9, 4, 8, 8, 3, 7)),
  q('newcastle', 'dyer', 'Kieron Dyer', 1978, 'England', ['CM', 'RW'], 80, 85, 2006, 55, t(6, 6, 7, 6, 6, 7)),
];

/** Source clubs for the Liverpool 2002 decisions + Chelsea's 2003 splurge. */
export const LENS_2001: CuratedSeed[] = [
  q('lens', 'diouf', 'El-Hadji Diouf', 1981, 'Senegal', ['RW', 'ST'], 78, 84, 2006, 30, t(4, 8, 7, 4, 8, 6)),
];
export const LILLE_2001: CuratedSeed[] = [
  q('lille', 'cheyrou', 'Bruno Cheyrou', 1978, 'France', ['AM', 'LW'], 75, 82, 2006, 35, t(6, 6, 6, 6, 6, 6)),
];
/** Chelsea's real 2003 takeover buys, at their source clubs — they only move if
 *  Abramovich actually completes the purchase (the enabledBy funder). */
export const CHELSEA_TARGETS_2003: CuratedSeed[] = [
  q('real_madrid', 'makelele03', 'Claude Makélélé', 1973, 'France', ['DM'], 85, 86, 2007, 25, t(9, 4, 8, 7, 3, 7)),
  q('blackburn', 'duff03', 'Damien Duff', 1979, 'Ireland', ['LW', 'RW'], 82, 84, 2007, 35, t(8, 5, 7, 7, 4, 7)),
  q('inter', 'crespo03', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 85, 86, 2007, 40, t(7, 6, 8, 5, 5, 7)),
  q('parma', 'mutu03', 'Adrian Mutu', 1979, 'Romania', ['ST', 'AM'], 82, 85, 2007, 35, t(4, 8, 7, 5, 8, 6)),
  q('southampton', 'bridge03', 'Wayne Bridge', 1980, 'England', ['LB'], 79, 82, 2007, 35, t(7, 5, 7, 6, 4, 7)),
];

/** Curated squads for the liverpool-2001 scenario, keyed by club. */
export const LIVERPOOL_2001_SQUADS: Record<string, CuratedSeed[]> = {
  liverpool: LIVERPOOL_2001,
  man_utd: MAN_UTD_2001,
  arsenal: ARSENAL_2001,
  chelsea: CHELSEA_2001,
  leeds: LEEDS_2001,
  newcastle: NEWCASTLE_2001,
  lens: LENS_2001,
  lille: LILLE_2001,
  real_madrid: [CHELSEA_TARGETS_2003[0]!],
  blackburn: [CHELSEA_TARGETS_2003[1]!],
  inter: [CHELSEA_TARGETS_2003[2]!],
  parma: [CHELSEA_TARGETS_2003[3]!],
  southampton: [CHELSEA_TARGETS_2003[4]!],
};
