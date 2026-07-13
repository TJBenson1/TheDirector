/**
 * Curated real players — 2003 pack (England/Europe; §4, §17.10).
 *
 * The vertical slice for "Manchester United — 2003", built to run the great
 * Barça counterfactual: the 2003 window is live, so Ronaldinho (at PSG) and
 * Cristiano (at Sporting) are both there to be signed, Beckham is there to be
 * sold or kept, and — the hinge — United can HIJACK Ronaldinho from Barça.
 *
 * Barça's squad is authored so the counterfactual reads true: the ACADEMY CORE
 * that won 2009 & 2011 (Messi, Xavi, Iniesta, Busquets, Pedro, Valdés, Puyol)
 * is home-grown and survives any transfer butterfly, while the bought spine that
 * won 2006 (Ronaldinho, Eto'o, Deco) sits at its real source clubs, divertible
 * elsewhere. Ability/potential/personality are HIDDEN estimates (§7).
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

// ── Manchester United, 2003–04 (Beckham leaving; the user) ────────────────────
export const MANUTD_2003: CuratedSeed[] = [
  q('man_utd', 'howard_t', 'Tim Howard', 1979, 'United States', ['GK'], 78, 82, 2007, 25, t(8, 5, 8, 6, 5, 7)),
  q('man_utd', 'carroll_r', 'Roy Carroll', 1977, 'Northern Ireland', ['GK'], 74, 75, 2005, 25, t(7, 4, 6, 6, 5, 6)),
  q('man_utd', 'g_neville', 'Gary Neville', 1975, 'England', ['RB'], 82, 83, 2007, 25, t(9, 5, 8, 10, 4, 6), { loyalty: 95 }),
  q('man_utd', 'ferdinand_r', 'Rio Ferdinand', 1978, 'England', ['CB'], 85, 88, 2008, 25, t(7, 6, 8, 7, 4, 7)),
  q('man_utd', 'silvestre', 'Mikaël Silvestre', 1977, 'France', ['CB', 'LB'], 80, 82, 2007, 25, t(7, 5, 7, 7, 4, 7)),
  q('man_utd', 'oshea', 'John O’Shea', 1981, 'Ireland', ['CB', 'RB'], 76, 80, 2007, 25, t(8, 4, 7, 8, 4, 7)),
  q('man_utd', 'wes_brown', 'Wes Brown', 1979, 'England', ['CB'], 77, 80, 2007, 35, t(8, 4, 7, 8, 4, 6)),
  q('man_utd', 'keane_r', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 85, 86, 2006, 35, t(9, 8, 10, 8, 8, 6)),
  q('man_utd', 'scholes', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 85, 86, 2007, 25, t(9, 4, 8, 10, 3, 7), { loyalty: 95 }),
  q('man_utd', 'giggs', 'Ryan Giggs', 1973, 'Wales', ['LW'], 84, 85, 2007, 30, t(9, 5, 8, 10, 3, 7), { loyalty: 96 }),
  q('man_utd', 'fletcher', 'Darren Fletcher', 1984, 'Scotland', ['CM'], 66, 80, 2008, 25, t(9, 4, 8, 9, 3, 7)),
  q('man_utd', 'kleberson', 'Kléberson', 1979, 'Brazil', ['CM', 'DM'], 74, 78, 2007, 30, t(7, 5, 7, 6, 5, 6)),
  q('man_utd', 'djemba', 'Eric Djemba-Djemba', 1981, 'Cameroon', ['DM'], 72, 75, 2007, 30, t(6, 6, 6, 6, 6, 6)),
  q('man_utd', 'vannistelrooy', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 87, 89, 2007, 40, t(8, 6, 9, 6, 4, 7)),
  q('man_utd', 'solskjaer', 'Ole Gunnar Solskjær', 1973, 'Norway', ['ST'], 81, 82, 2006, 40, t(9, 5, 8, 10, 3, 7), { loyalty: 94 }),
  q('man_utd', 'forlan', 'Diego Forlán', 1979, 'Uruguay', ['ST'], 76, 84, 2006, 25, t(9, 5, 8, 6, 4, 7)),
  q('man_utd', 'bellion', 'David Bellion', 1982, 'France', ['ST'], 70, 76, 2007, 30, t(6, 6, 6, 6, 6, 6)),
  q('man_utd', 'beckham_u', 'David Beckham', 1975, 'England', ['RW', 'CM'], 87, 88, 2005, 20, t(9, 7, 8, 7, 4, 7)),
];

// ── Barcelona, 2003–04 (PRE-Ronaldinho; the home-grown core already here) ─────
export const BARCELONA_2003: CuratedSeed[] = [
  q('barcelona', 'valdes', 'Víctor Valdés', 1982, 'Spain', ['GK'], 76, 87, 2008, 20, t(8, 6, 8, 8, 5, 7), { loyalty: 88 }),
  q('barcelona', 'puyol', 'Carles Puyol', 1978, 'Spain', ['CB', 'RB'], 84, 87, 2008, 25, t(10, 5, 9, 10, 3, 7), { loyalty: 95 }),
  q('barcelona', 'marquez', 'Rafael Márquez', 1979, 'Mexico', ['CB', 'DM'], 81, 85, 2008, 25, t(8, 6, 8, 7, 5, 7)),
  q('barcelona', 'oleguer', 'Oleguer', 1980, 'Spain', ['RB', 'CB'], 74, 78, 2007, 25, t(8, 4, 7, 8, 4, 7)),
  q('barcelona', 'van_bronckhorst', 'Giovanni van Bronckhorst', 1975, 'Netherlands', ['LB', 'CM'], 79, 82, 2007, 25, t(8, 5, 7, 7, 4, 7)),
  q('barcelona', 'xavi', 'Xavi', 1980, 'Spain', ['CM'], 82, 91, 2009, 15, t(10, 5, 9, 10, 2, 8), { loyalty: 95 }),
  q('barcelona', 'iniesta', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 70, 93, 2010, 20, t(10, 4, 9, 10, 2, 8), { loyalty: 95 }),
  q('barcelona', 'messi', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 58, 99, 2012, 25, t(9, 6, 10, 10, 3, 8), { loyalty: 95 }),
  q('barcelona', 'busquets', 'Sergio Busquets', 1988, 'Spain', ['DM'], 46, 90, 2012, 15, t(10, 4, 9, 10, 2, 8), { loyalty: 92 }),
  q('barcelona', 'pedro', 'Pedro', 1987, 'Spain', ['RW', 'ST'], 50, 85, 2012, 20, t(9, 4, 9, 9, 3, 8)),
  q('barcelona', 'pique_b', 'Gerard Piqué', 1987, 'Spain', ['CB'], 60, 89, 2008, 25, t(8, 7, 9, 8, 5, 8), { loyalty: 80 }),
  q('barcelona', 'motta', 'Thiago Motta', 1982, 'Brazil', ['DM', 'CM'], 74, 84, 2007, 35, t(7, 5, 8, 6, 5, 7)),
  q('barcelona', 'gerard_b', 'Gerard López', 1979, 'Spain', ['AM', 'CM'], 76, 79, 2005, 30, t(7, 5, 7, 7, 5, 7)),
  q('barcelona', 'cocu_b', 'Phillip Cocu', 1970, 'Netherlands', ['CM', 'DM'], 81, 82, 2004, 20, t(9, 4, 7, 7, 3, 8)),
  q('barcelona', 'luis_enrique_b', 'Luís Enrique', 1970, 'Spain', ['CM', 'RW'], 79, 80, 2004, 35, t(9, 6, 9, 10, 4, 7), { loyalty: 90 }),
  q('barcelona', 'kluivert_b', 'Patrick Kluivert', 1976, 'Netherlands', ['ST'], 83, 85, 2005, 30, t(6, 7, 7, 6, 6, 7)),
  q('barcelona', 'saviola_b', 'Javier Saviola', 1981, 'Argentina', ['ST'], 79, 84, 2007, 30, t(7, 6, 8, 6, 5, 7)),
  q('barcelona', 'overmars_b', 'Marc Overmars', 1973, 'Netherlands', ['LW'], 80, 82, 2005, 45, t(8, 6, 8, 6, 4, 7)),
];

// ── The bought spine — at its REAL source clubs, so a butterfly can divert it ──
export const PSG_2003: CuratedSeed[] = [
  q('psg', 'ronaldinho', 'Ronaldinho', 1980, 'Brazil', ['AM', 'LW'], 88, 92, 2006, 30, t(6, 7, 8, 6, 6, 8)),
  q('psg', 'pochettino_p', 'Mauricio Pochettino', 1972, 'Argentina', ['CB'], 78, 79, 2005, 25, t(8, 5, 7, 6, 5, 7)),
  q('psg', 'ronaldinho_foil', 'Jérôme Leroy', 1974, 'France', ['AM'], 74, 75, 2005, 25, t(7, 5, 6, 6, 5, 7)),
];
export const SPORTING_2003: CuratedSeed[] = [
  q('sporting', 'cristiano', 'Cristiano Ronaldo', 1985, 'Portugal', ['RW', 'LW', 'ST'], 72, 96, 2008, 20, t(9, 8, 10, 6, 4, 8)),
  q('sporting', 'quaresma', 'Ricardo Quaresma', 1983, 'Portugal', ['RW'], 74, 84, 2007, 30, t(5, 8, 7, 5, 7, 6)),
];
export const MALLORCA_2003: CuratedSeed[] = [
  q('mallorca', 'etoo', 'Samuel Eto’o', 1981, 'Cameroon', ['ST'], 84, 89, 2006, 30, t(7, 8, 9, 5, 6, 7)),
];
export const PORTO_2003: CuratedSeed[] = [
  q('porto', 'deco', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 85, 87, 2006, 25, t(8, 6, 8, 6, 5, 7)),
  q('porto', 'carvalho_p', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 84, 86, 2006, 25, t(8, 5, 8, 6, 5, 7)),
  q('porto', 'costinha_p', 'Costinha', 1974, 'Portugal', ['DM'], 80, 82, 2005, 30, t(8, 5, 7, 6, 5, 7)),
  q('porto', 'maniche_p', 'Maniche', 1977, 'Portugal', ['CM', 'DM'], 80, 82, 2006, 30, t(7, 6, 8, 6, 6, 7)),
  q('porto', 'baia', 'Vítor Baía', 1969, 'Portugal', ['GK'], 82, 82, 2005, 25, t(8, 6, 7, 9, 5, 6)),
  q('porto', 'derlei_p', 'Derlei', 1975, 'Brazil', ['ST'], 78, 80, 2005, 30, t(7, 6, 8, 6, 5, 7)),
];
export const SEVILLA_2003: CuratedSeed[] = [
  q('sevilla', 'dani_alves', 'Dani Alves', 1983, 'Brazil', ['RB'], 74, 88, 2008, 20, t(8, 6, 9, 7, 5, 8)),
  q('sevilla', 'reyes_s', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'ST'], 79, 86, 2007, 35, t(6, 7, 7, 6, 7, 6)),
  q('sevilla', 'baptista_s', 'Julio Baptista', 1981, 'Brazil', ['CM', 'ST'], 80, 85, 2006, 25, t(7, 6, 8, 6, 5, 7)),
];
export const VALENCIA_2003: CuratedSeed[] = [
  q('valencia', 'villa_v', 'David Villa', 1981, 'Spain', ['ST'], 80, 89, 2008, 30, t(9, 6, 9, 7, 4, 7)),
  q('valencia', 'aimar_v', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 82, 85, 2006, 40, t(7, 6, 7, 6, 5, 7)),
  q('valencia', 'ayala_v', 'Roberto Ayala', 1973, 'Argentina', ['CB'], 85, 86, 2006, 25, t(9, 5, 8, 8, 4, 7)),
  q('valencia', 'baraja_v', 'Rubén Baraja', 1975, 'Spain', ['CM', 'DM'], 82, 84, 2006, 30, t(8, 5, 8, 8, 4, 7)),
  q('valencia', 'canizares_v', 'Santiago Cañizares', 1969, 'Spain', ['GK'], 84, 84, 2006, 20, t(8, 6, 8, 8, 5, 6)),
  q('valencia', 'vicente_v', 'Vicente Rodríguez', 1981, 'Spain', ['LW'], 82, 85, 2007, 40, t(7, 5, 7, 7, 5, 7)),
];

// ── Champions League context: the other European powers ───────────────────────
export const REAL_2003: CuratedSeed[] = [
  q('real_madrid', 'casillas_r', 'Iker Casillas', 1981, 'Spain', ['GK'], 86, 90, 2008, 20, t(9, 5, 8, 9, 3, 8), { loyalty: 90 }),
  q('real_madrid', 'roberto_carlos_r', 'Roberto Carlos', 1973, 'Brazil', ['LB'], 86, 86, 2007, 25, t(8, 7, 8, 8, 4, 7)),
  q('real_madrid', 'ramos_r', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 82, 83, 2006, 30, t(8, 5, 8, 7, 5, 7)),
  q('real_madrid', 'zidane_r', 'Zinedine Zidane', 1972, 'France', ['AM', 'CM'], 90, 91, 2007, 25, t(9, 6, 8, 7, 4, 7)),
  q('real_madrid', 'figo_r', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 86, 87, 2005, 25, t(8, 7, 8, 6, 4, 7)),
  q('real_madrid', 'raul_r', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 86, 88, 2007, 20, t(9, 6, 9, 10, 3, 7), { loyalty: 92 }),
  q('real_madrid', 'ronaldo_r9', 'Ronaldo', 1976, 'Brazil', ['ST'], 88, 92, 2007, 60, t(6, 8, 8, 5, 6, 7)),
  q('real_madrid', 'guti_r', 'Guti', 1976, 'Spain', ['AM', 'CM'], 82, 84, 2007, 30, t(6, 7, 6, 8, 6, 7)),
];
export const CHELSEA_2003: CuratedSeed[] = [
  q('chelsea', 'cech_c', 'Petr Čech', 1982, 'Czech Republic', ['GK'], 84, 89, 2008, 25, t(9, 5, 8, 8, 3, 7)),
  q('chelsea', 'terry_c', 'John Terry', 1980, 'England', ['CB'], 84, 88, 2008, 30, t(8, 7, 9, 9, 5, 6)),
  q('chelsea', 'lampard_c', 'Frank Lampard', 1978, 'England', ['CM'], 85, 88, 2008, 20, t(9, 6, 9, 8, 3, 7)),
  q('chelsea', 'makelele_c', 'Claude Makélélé', 1973, 'France', ['DM'], 85, 86, 2007, 25, t(9, 4, 8, 7, 3, 7)),
  q('chelsea', 'drogba_c', 'Didier Drogba', 1978, 'Ivory Coast', ['ST'], 82, 88, 2008, 30, t(8, 7, 9, 7, 5, 7)),
  q('chelsea', 'duff_c', 'Damien Duff', 1979, 'Ireland', ['LW', 'RW'], 82, 84, 2007, 35, t(8, 5, 7, 7, 4, 7)),
  q('chelsea', 'gudjohnsen_c', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 81, 83, 2006, 30, t(8, 5, 7, 6, 4, 7)),
];
export const ARSENAL_2003: CuratedSeed[] = [
  q('arsenal', 'henry_a', 'Thierry Henry', 1977, 'France', ['ST', 'LW'], 90, 92, 2007, 25, t(9, 7, 9, 8, 4, 8)),
  q('arsenal', 'vieira_a', 'Patrick Vieira', 1976, 'France', ['DM', 'CM'], 87, 88, 2006, 25, t(8, 7, 9, 6, 6, 7)),
  q('arsenal', 'pires_a', 'Robert Pirès', 1973, 'France', ['LW', 'AM'], 86, 87, 2006, 30, t(8, 5, 8, 7, 3, 7)),
  q('arsenal', 'bergkamp_a', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 85, 86, 2005, 25, t(9, 6, 8, 8, 3, 6)),
  q('arsenal', 'ljungberg_a', 'Fredrik Ljungberg', 1977, 'Sweden', ['RW', 'AM'], 83, 84, 2006, 35, t(8, 6, 8, 7, 4, 7)),
  q('arsenal', 'campbell_a', 'Sol Campbell', 1974, 'England', ['CB'], 85, 86, 2006, 25, t(8, 6, 8, 7, 4, 6)),
  q('arsenal', 'cole_a', 'Ashley Cole', 1980, 'England', ['LB'], 84, 88, 2007, 25, t(8, 6, 8, 6, 5, 7)),
  q('arsenal', 'toure_a', 'Kolo Touré', 1981, 'Ivory Coast', ['CB'], 81, 86, 2007, 25, t(8, 5, 8, 7, 4, 7)),
  q('arsenal', 'fabregas_a', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 62, 90, 2008, 20, t(9, 6, 9, 7, 3, 8)),
];
export const LIVERPOOL_2003: CuratedSeed[] = [
  q('liverpool', 'gerrard_l', 'Steven Gerrard', 1980, 'England', ['CM'], 85, 89, 2008, 30, t(9, 6, 10, 10, 5, 7), { loyalty: 92 }),
  q('liverpool', 'owen_l', 'Michael Owen', 1979, 'England', ['ST'], 85, 88, 2005, 45, t(8, 7, 8, 6, 4, 7)),
  q('liverpool', 'hyypia_l', 'Sami Hyypiä', 1973, 'Finland', ['CB'], 82, 84, 2007, 20, t(9, 4, 7, 8, 3, 7)),
  q('liverpool', 'carragher_l', 'Jamie Carragher', 1978, 'England', ['CB'], 82, 85, 2008, 25, t(9, 4, 8, 10, 5, 6), { loyalty: 92 }),
  q('liverpool', 'alonso_l', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 80, 88, 2008, 25, t(9, 5, 9, 8, 3, 8)),
];
export const MILAN_2003: CuratedSeed[] = [
  q('milan', 'maldini_m', 'Paolo Maldini', 1968, 'Italy', ['LB', 'CB'], 86, 86, 2006, 20, t(10, 6, 9, 10, 3, 7), { loyalty: 99, hardBlocks: [{ reason: 'Paolo Maldini is Milan for life.', untilYear: 2099 }] }),
  q('milan', 'nesta_m', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 87, 89, 2008, 30, t(9, 5, 8, 8, 3, 7)),
  q('milan', 'pirlo_m', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'AM'], 85, 88, 2008, 25, t(9, 5, 8, 8, 3, 7)),
  q('milan', 'gattuso_m', 'Gennaro Gattuso', 1978, 'Italy', ['DM'], 82, 84, 2008, 30, t(8, 5, 9, 8, 6, 7)),
  q('milan', 'seedorf_m', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 85, 86, 2008, 25, t(8, 7, 8, 7, 5, 7)),
  q('milan', 'kaka_m', 'Kaká', 1982, 'Brazil', ['AM'], 82, 92, 2009, 25, t(9, 6, 9, 8, 3, 8)),
  q('milan', 'shevchenko_m', 'Andriy Shevchenko', 1976, 'Ukraine', ['ST'], 88, 90, 2007, 30, t(8, 6, 9, 7, 4, 7)),
  q('milan', 'cafu_m', 'Cafu', 1970, 'Brazil', ['RB'], 84, 84, 2006, 25, t(9, 5, 8, 7, 4, 7)),
];
export const INTER_2003: CuratedSeed[] = [
  q('inter', 'vieri_i', 'Christian Vieri', 1973, 'Italy', ['ST'], 86, 87, 2006, 45, t(6, 8, 8, 5, 7, 6)),
  q('inter', 'zanetti_i', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 85, 86, 2008, 15, t(10, 5, 9, 10, 2, 8)),
  q('inter', 'cordoba_i', 'Iván Córdoba', 1976, 'Colombia', ['CB'], 81, 83, 2007, 25, t(8, 5, 7, 7, 4, 7)),
  q('inter', 'ibrahimovic_i', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 80, 90, 2008, 25, t(7, 9, 9, 6, 6, 7)),
  q('inter', 'stankovic_i', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 81, 83, 2008, 25, t(8, 6, 8, 6, 5, 7)),
];
export const JUVENTUS_2003: CuratedSeed[] = [
  q('juventus', 'buffon_j', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 88, 91, 2008, 20, t(9, 6, 9, 9, 4, 7), { loyalty: 90 }),
  q('juventus', 'thuram_j', 'Lilian Thuram', 1972, 'France', ['CB', 'RB'], 85, 86, 2006, 20, t(9, 5, 8, 7, 3, 7)),
  q('juventus', 'nedved_j', 'Pavel Nedvěd', 1972, 'Czech Republic', ['CM', 'LW'], 87, 88, 2007, 25, t(9, 6, 9, 8, 4, 7)),
  q('juventus', 'delpiero_j', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 85, 86, 2008, 30, t(8, 7, 8, 10, 4, 7), { loyalty: 95 }),
  q('juventus', 'trezeguet_j', 'David Trezeguet', 1977, 'France', ['ST'], 85, 87, 2008, 30, t(7, 6, 8, 7, 5, 7)),
  q('juventus', 'camoranesi_j', 'Mauro Camoranesi', 1976, 'Italy', ['RW', 'CM'], 81, 83, 2008, 30, t(8, 5, 8, 7, 5, 7)),
];
export const BAYERN_2003: CuratedSeed[] = [
  q('bayern', 'kahn_b', 'Oliver Kahn', 1969, 'Germany', ['GK'], 87, 87, 2006, 20, t(9, 7, 9, 9, 5, 6)),
  q('bayern', 'ballack_b', 'Michael Ballack', 1976, 'Germany', ['CM', 'AM'], 86, 88, 2006, 30, t(8, 7, 9, 7, 5, 7)),
  q('bayern', 'lizarazu_b', 'Bixente Lizarazu', 1969, 'France', ['LB'], 82, 82, 2005, 25, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'makaay_b', 'Roy Makaay', 1975, 'Netherlands', ['ST'], 84, 86, 2007, 25, t(8, 6, 8, 6, 4, 7)),
  q('bayern', 'schweinsteiger_b', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'RW'], 66, 88, 2008, 25, t(9, 5, 9, 9, 4, 7)),
];

export const CURATED_2003: Record<string, CuratedSeed[]> = {
  man_utd: MANUTD_2003,
  barcelona: BARCELONA_2003,
  psg: PSG_2003,
  sporting: SPORTING_2003,
  mallorca: MALLORCA_2003,
  porto: PORTO_2003,
  sevilla: SEVILLA_2003,
  valencia: VALENCIA_2003,
  real_madrid: REAL_2003,
  chelsea: CHELSEA_2003,
  arsenal: ARSENAL_2003,
  liverpool: LIVERPOOL_2003,
  milan: MILAN_2003,
  inter: INTER_2003,
  juventus: JUVENTUS_2003,
  bayern: BAYERN_2003,
};

export const MANUTD_2003_SQUADS: Record<string, CuratedSeed[]> = { ...CURATED_2003 };
