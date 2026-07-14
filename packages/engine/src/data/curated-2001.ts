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

/**
 * The other two playable giants of the era, as full sides so the pack is a
 * complete 2001–02 board (§4, §14). Real Madrid's Galácticos (Figo + Zidane just
 * in) and Cúper's beaten-to-the-post Inter. Makélélé/Crespo keep their ledger ids
 * so Chelsea's 2003 splurge still resolves. Foreign to eng-2001 — zero kickoff
 * calibration risk (anchored strength).
 */
export const REAL_MADRID_2001: CuratedSeed[] = [
  q('real_madrid', 'casillas01', 'Iker Casillas', 1981, 'Spain', ['GK'], 84, 91, 2007, 15, t(9, 6, 9, 10, 3, 7), { loyalty: 92 }),
  q('real_madrid', 'cesar01', 'César Sánchez', 1971, 'Spain', ['GK'], 78, 79, 2004, 20, t(8, 4, 6, 7, 4, 6)),
  q('real_madrid', 'salgado01', 'Míchel Salgado', 1975, 'Spain', ['RB'], 82, 83, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('real_madrid', 'hierro01', 'Fernando Hierro', 1968, 'Spain', ['CB', 'DM'], 85, 85, 2003, 25, t(9, 6, 8, 9, 4, 6), { loyalty: 90 }),
  q('real_madrid', 'helguera01', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 83, 84, 2006, 25, t(8, 5, 8, 8, 5, 7)),
  q('real_madrid', 'karanka01', 'Aitor Karanka', 1973, 'Spain', ['CB'], 78, 79, 2004, 25, t(8, 4, 7, 8, 4, 6)),
  q('real_madrid', 'robertocarlos01', 'Roberto Carlos', 1973, 'Brazil', ['LB', 'LW'], 87, 88, 2006, 25, t(8, 6, 8, 8, 4, 8)),
  q('real_madrid', 'zidane01', 'Zinedine Zidane', 1972, 'France', ['AM', 'CM'], 93, 94, 2006, 25, t(9, 7, 9, 8, 3, 8)),
  q('real_madrid', 'figo01', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 90, 91, 2006, 30, t(8, 7, 9, 6, 4, 8)),
  q('real_madrid', 'makelele03', 'Claude Makélélé', 1973, 'France', ['DM'], 85, 86, 2007, 25, t(9, 4, 8, 7, 3, 7)),
  q('real_madrid', 'guti01', 'Guti', 1976, 'Spain', ['AM', 'CM'], 81, 84, 2006, 25, t(6, 7, 7, 8, 6, 7)),
  q('real_madrid', 'mcmanaman01', 'Steve McManaman', 1972, 'England', ['RW', 'AM'], 81, 82, 2003, 25, t(7, 6, 7, 6, 4, 8)),
  q('real_madrid', 'solari01', 'Santiago Solari', 1976, 'Argentina', ['LW', 'AM'], 80, 82, 2006, 30, t(8, 5, 7, 7, 4, 7)),
  q('real_madrid', 'raul01', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 89, 90, 2007, 25, t(9, 6, 9, 10, 4, 7), { loyalty: 93 }),
  q('real_madrid', 'morientes01', 'Fernando Morientes', 1976, 'Spain', ['ST'], 84, 85, 2006, 30, t(8, 6, 8, 7, 4, 7)),
  q('real_madrid', 'conceicao01', 'Flávio Conceição', 1974, 'Brazil', ['DM', 'CM'], 79, 80, 2005, 30, t(7, 5, 7, 6, 5, 7)),
];
export const INTER_2001: CuratedSeed[] = [
  q('inter', 'toldo01', 'Francesco Toldo', 1971, 'Italy', ['GK'], 84, 85, 2006, 25, t(8, 5, 7, 8, 4, 6)),
  q('inter', 'jzanetti01', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 86, 87, 2007, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 95 }),
  q('inter', 'cordoba01', 'Iván Córdoba', 1976, 'Colombia', ['CB'], 82, 83, 2007, 25, t(8, 5, 8, 8, 4, 7)),
  q('inter', 'materazzi01', 'Marco Materazzi', 1973, 'Italy', ['CB'], 80, 82, 2006, 30, t(6, 7, 8, 7, 8, 6)),
  q('inter', 'coco01', 'Francesco Coco', 1977, 'Italy', ['LB'], 78, 81, 2005, 40, t(5, 7, 6, 5, 7, 6)),
  q('inter', 'dibiagio01', 'Luigi Di Biagio', 1971, 'Italy', ['DM', 'CM'], 79, 80, 2004, 30, t(8, 5, 8, 7, 5, 7)),
  q('inter', 'czanetti01', 'Cristiano Zanetti', 1977, 'Italy', ['DM', 'CM'], 78, 80, 2006, 30, t(8, 4, 7, 7, 4, 7)),
  q('inter', 'sconceicao01', 'Sérgio Conceição', 1974, 'Portugal', ['RW'], 80, 81, 2005, 30, t(7, 6, 8, 6, 5, 7)),
  q('inter', 'seedorf01', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 85, 86, 2005, 25, t(8, 7, 8, 6, 5, 8)),
  q('inter', 'recoba01', 'Álvaro Recoba', 1976, 'Uruguay', ['AM', 'LW'], 83, 85, 2007, 30, t(5, 8, 7, 6, 7, 7)),
  q('inter', 'vieri01', 'Christian Vieri', 1973, 'Italy', ['ST'], 88, 89, 2006, 45, t(6, 8, 8, 6, 6, 6)),
  q('inter', 'crespo03', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 85, 86, 2007, 40, t(7, 6, 8, 5, 5, 7)),
  q('inter', 'kallon01', 'Mohamed Kallon', 1979, 'Sierra Leone', ['ST', 'RW'], 78, 82, 2006, 35, t(6, 6, 7, 5, 6, 7)),
  q('inter', 'ventola01', 'Nicola Ventola', 1978, 'Italy', ['ST'], 77, 80, 2005, 50, t(6, 6, 7, 6, 6, 6)),
];

/** Arsenal & Chelsea depth — completing the two English giants' squads (§4). */
export const ARSENAL_2001_EXTRA: CuratedSeed[] = [
  q('arsenal', 'kanu01', 'Nwankwo Kanu', 1976, 'Nigeria', ['ST', 'AM'], 80, 82, 2004, 30, t(7, 6, 7, 6, 5, 7)),
  q('arsenal', 'parlour01', 'Ray Parlour', 1973, 'England', ['CM', 'RW'], 78, 79, 2004, 25, t(8, 5, 8, 8, 5, 7)),
  q('arsenal', 'keown01', 'Martin Keown', 1966, 'England', ['CB'], 80, 80, 2003, 30, t(8, 6, 8, 9, 5, 6)),
  q('arsenal', 'dixon01', 'Lee Dixon', 1964, 'England', ['RB'], 74, 74, 2002, 25, t(9, 4, 7, 9, 3, 6)),
  q('arsenal', 'edu01', 'Edu', 1978, 'Brazil', ['CM', 'DM'], 78, 82, 2005, 30, t(8, 5, 7, 6, 4, 7)),
];
export const CHELSEA_2001_EXTRA: CuratedSeed[] = [
  q('chelsea', 'desailly01', 'Marcel Desailly', 1968, 'France', ['CB', 'DM'], 85, 85, 2004, 25, t(9, 6, 8, 8, 3, 7)),
  q('chelsea', 'babayaro01', 'Celestine Babayaro', 1978, 'Nigeria', ['LB'], 77, 80, 2005, 35, t(6, 6, 7, 6, 5, 7)),
  q('chelsea', 'stanic01', 'Mario Stanić', 1972, 'Croatia', ['RW', 'AM'], 77, 78, 2004, 40, t(7, 6, 7, 6, 5, 7)),
  q('chelsea', 'ferrer01', 'Albert Ferrer', 1970, 'Spain', ['RB'], 76, 77, 2003, 30, t(8, 4, 7, 7, 4, 7)),
  q('chelsea', 'zenden01', 'Boudewijn Zenden', 1976, 'Netherlands', ['LW', 'AM'], 78, 80, 2005, 30, t(7, 5, 7, 6, 5, 7)),
];

/** Manchester City, 2001–02 — Division One champions on the way up (2nd-tier
 *  ratings; a promotion-chasing side, not yet the modern superpower). */
export const MAN_CITY_2001: CuratedSeed[] = [
  q('man_city', 'weaver01', 'Nicky Weaver', 1979, 'England', ['GK'], 68, 74, 2005, 30, t(7, 5, 7, 7, 5, 6)),
  q('man_city', 'nash01', 'Carlo Nash', 1973, 'England', ['GK'], 64, 66, 2004, 25, t(7, 4, 6, 6, 5, 6)),
  q('man_city', 'pearce_mc01', 'Stuart Pearce', 1962, 'England', ['LB', 'CB'], 72, 72, 2002, 30, t(9, 6, 9, 9, 6, 6)),
  q('man_city', 'dunne01', 'Richard Dunne', 1979, 'Ireland', ['CB'], 72, 80, 2006, 30, t(7, 4, 7, 8, 5, 6)),
  q('man_city', 'howey01', 'Steve Howey', 1971, 'England', ['CB'], 70, 72, 2004, 40, t(7, 5, 7, 7, 5, 6)),
  q('man_city', 'wiekens01', 'Gerard Wiekens', 1973, 'Netherlands', ['CB', 'DM'], 66, 68, 2004, 25, t(8, 4, 7, 7, 4, 7)),
  q('man_city', 'tiatto_mc01', 'Danny Tiatto', 1973, 'Australia', ['LB', 'LW'], 66, 68, 2004, 35, t(6, 6, 7, 6, 7, 6)),
  q('man_city', 'benarbia01', 'Ali Benarbia', 1968, 'Algeria', ['AM'], 76, 77, 2004, 30, t(7, 6, 7, 6, 5, 7)),
  q('man_city', 'berkovic01', 'Eyal Berkovic', 1972, 'Israel', ['AM'], 74, 76, 2004, 35, t(6, 7, 7, 5, 6, 6)),
  q('man_city', 'horlock01', 'Kevin Horlock', 1972, 'Northern Ireland', ['CM', 'LW'], 68, 70, 2004, 30, t(8, 5, 7, 7, 5, 6)),
  q('man_city', 'goater01', 'Shaun Goater', 1970, 'Bermuda', ['ST'], 72, 74, 2004, 25, t(8, 5, 8, 8, 4, 7)),
  q('man_city', 'huckerby01', 'Darren Huckerby', 1976, 'England', ['LW', 'ST'], 74, 76, 2005, 30, t(6, 6, 7, 6, 6, 7)),
  q('man_city', 'wanchope01', 'Paulo Wanchope', 1976, 'Costa Rica', ['ST'], 74, 76, 2005, 40, t(6, 6, 7, 6, 6, 6)),
  q('man_city', 'swp01', 'Shaun Wright-Phillips', 1981, 'England', ['RW'], 66, 82, 2006, 25, t(8, 6, 8, 7, 4, 7)),
];

/** Tottenham Hotspur, 2001–02 — a mid-table cup side (Worthington Cup finalists). */
export const SPURS_2001: CuratedSeed[] = [
  q('spurs', 'keller01', 'Kasey Keller', 1969, 'United States', ['GK'], 78, 79, 2004, 25, t(8, 5, 7, 7, 4, 7)),
  q('spurs', 'sullivan01', 'Neil Sullivan', 1970, 'Scotland', ['GK'], 76, 77, 2004, 25, t(8, 4, 7, 7, 4, 6)),
  q('spurs', 'carr01', 'Stephen Carr', 1976, 'Ireland', ['RB'], 79, 81, 2005, 30, t(8, 5, 8, 7, 4, 7)),
  q('spurs', 'king01', 'Ledley King', 1980, 'England', ['CB', 'DM'], 80, 87, 2006, 45, t(9, 5, 8, 10, 3, 7), { loyalty: 90 }),
  q('spurs', 'perry01', 'Chris Perry', 1973, 'England', ['CB'], 75, 76, 2004, 25, t(8, 4, 7, 7, 4, 6)),
  q('spurs', 'doherty01', 'Gary Doherty', 1980, 'Ireland', ['CB', 'ST'], 68, 72, 2005, 35, t(7, 5, 7, 7, 5, 6)),
  q('spurs', 'thatcher01', 'Ben Thatcher', 1975, 'England', ['LB'], 72, 74, 2004, 35, t(6, 6, 7, 6, 6, 6)),
  q('spurs', 'ziege_s01', 'Christian Ziege', 1972, 'Germany', ['LB', 'LW'], 79, 80, 2005, 40, t(7, 6, 7, 7, 5, 7)),
  q('spurs', 'anderton01', 'Darren Anderton', 1972, 'England', ['RW', 'AM'], 78, 80, 2004, 55, t(7, 5, 7, 7, 5, 7)),
  q('spurs', 'poyet01', 'Gus Poyet', 1967, 'Uruguay', ['CM', 'AM'], 80, 81, 2004, 30, t(8, 6, 8, 6, 5, 7)),
  q('spurs', 'freund01', 'Steffen Freund', 1970, 'Germany', ['DM'], 75, 76, 2004, 30, t(8, 5, 8, 7, 6, 6)),
  q('spurs', 'davies_s01', 'Simon Davies', 1979, 'Wales', ['RW', 'CM'], 74, 79, 2006, 25, t(8, 5, 7, 7, 4, 7)),
  q('spurs', 'sheringham01', 'Teddy Sheringham', 1966, 'England', ['ST', 'AM'], 82, 83, 2004, 30, t(9, 6, 8, 7, 4, 7)),
  q('spurs', 'ferdinand_l01', 'Les Ferdinand', 1966, 'England', ['ST'], 79, 80, 2003, 40, t(8, 6, 8, 7, 5, 6)),
  q('spurs', 'rebrov01', 'Sergei Rebrov', 1974, 'Ukraine', ['ST', 'AM'], 78, 81, 2005, 30, t(7, 6, 7, 6, 5, 6)),
];

/** Curated squads for the liverpool-2001 scenario, keyed by club. */
export const LIVERPOOL_2001_SQUADS: Record<string, CuratedSeed[]> = {
  liverpool: LIVERPOOL_2001,
  man_utd: MAN_UTD_2001,
  arsenal: [...ARSENAL_2001, ...ARSENAL_2001_EXTRA],
  chelsea: [...CHELSEA_2001, ...CHELSEA_2001_EXTRA],
  leeds: LEEDS_2001,
  newcastle: NEWCASTLE_2001,
  lens: LENS_2001,
  lille: LILLE_2001,
  real_madrid: REAL_MADRID_2001,
  inter: INTER_2001,
  man_city: MAN_CITY_2001,
  spurs: SPURS_2001,
  blackburn: [CHELSEA_TARGETS_2003[1]!],
  parma: [CHELSEA_TARGETS_2003[3]!],
  southampton: [CHELSEA_TARGETS_2003[4]!],
};
