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
import { ENG_DOMESTIC_2003_SQUADS } from './curated-eng-domestic-2003.js';

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

// ── Depth top-ups: every playable club that appears in this pack fields a full
//    real 2003-04 squad (>=13), not a first XI padded with anonymous filler. ──────
const REAL_2003_EXTRA: CuratedSeed[] = [
  q('real_madrid', 'salgado_r3', 'Míchel Salgado', 1975, 'Spain', ['RB'], 80, 81, 2007, 30, t(8, 5, 7, 8, 5, 7)),
  q('real_madrid', 'cambiasso_r3', 'Esteban Cambiasso', 1980, 'Argentina', ['CM', 'DM'], 79, 85, 2004, 25, t(9, 5, 8, 7, 4, 7)),
  q('real_madrid', 'solari_r3', 'Santiago Solari', 1976, 'Argentina', ['LW', 'AM'], 79, 80, 2005, 30, t(8, 5, 7, 7, 5, 7)),
  q('real_madrid', 'pavon_r3', 'Francisco Pavón', 1980, 'Spain', ['CB'], 77, 79, 2007, 30, t(7, 4, 7, 8, 5, 6)),
  q('real_madrid', 'raulbravo_r3', 'Raúl Bravo', 1981, 'Spain', ['LB', 'CB'], 75, 78, 2007, 30, t(7, 4, 7, 7, 5, 6)),
];
const BAYERN_2003_EXTRA: CuratedSeed[] = [
  q('bayern', 'sagnol_b3', 'Willy Sagnol', 1977, 'France', ['RB'], 80, 82, 2007, 30, t(8, 5, 8, 8, 4, 7)),
  q('bayern', 'rkovac_b3', 'Robert Kovač', 1974, 'Croatia', ['CB'], 79, 80, 2006, 30, t(8, 5, 7, 7, 5, 6)),
  q('bayern', 'hargreaves_b3', 'Owen Hargreaves', 1981, 'England', ['DM', 'CM'], 81, 85, 2006, 60, t(9, 5, 8, 7, 4, 7)),
  q('bayern', 'zeroberto_b3', 'Zé Roberto', 1974, 'Brazil', ['LW', 'CM'], 82, 83, 2006, 30, t(8, 6, 8, 7, 5, 8)),
  q('bayern', 'salihamidzic_b3', 'Hasan Salihamidžić', 1977, 'Bosnia', ['RW'], 79, 80, 2007, 30, t(9, 5, 8, 8, 5, 7)),
  q('bayern', 'pizarro_b3', 'Claudio Pizarro', 1978, 'Peru', ['ST'], 82, 83, 2006, 30, t(7, 6, 8, 7, 5, 7)),
  q('bayern', 'santacruz_b3', 'Roque Santa Cruz', 1981, 'Paraguay', ['ST'], 78, 82, 2006, 55, t(7, 6, 7, 7, 5, 7)),
  q('bayern', 'demichelis_b3', 'Martín Demichelis', 1980, 'Argentina', ['CB', 'DM'], 77, 82, 2008, 30, t(8, 5, 8, 7, 5, 7)),
];
const JUVENTUS_2003_EXTRA: CuratedSeed[] = [
  q('juventus', 'zambrotta_j3', 'Gianluca Zambrotta', 1977, 'Italy', ['LB', 'RB'], 84, 85, 2008, 30, t(8, 6, 8, 7, 5, 7)),
  q('juventus', 'montero_j3', 'Paolo Montero', 1971, 'Uruguay', ['CB'], 82, 83, 2005, 40, t(8, 7, 8, 8, 7, 6)),
  q('juventus', 'tudor_j3', 'Igor Tudor', 1978, 'Croatia', ['CB'], 79, 80, 2007, 35, t(8, 6, 8, 7, 6, 6)),
  q('juventus', 'davids_j3', 'Edgar Davids', 1973, 'Netherlands', ['CM', 'DM'], 83, 84, 2004, 35, t(8, 7, 9, 6, 7, 7)),
  q('juventus', 'tacchinardi_j3', 'Alessio Tacchinardi', 1975, 'Italy', ['CM', 'DM'], 79, 80, 2007, 35, t(8, 5, 7, 8, 5, 6)),
  q('juventus', 'divaio_j3', 'Marco Di Vaio', 1976, 'Italy', ['ST'], 79, 81, 2006, 35, t(7, 6, 8, 7, 5, 7)),
  q('juventus', 'pessotto_j3', 'Gianluca Pessotto', 1970, 'Italy', ['LB', 'RB'], 77, 78, 2005, 30, t(8, 4, 7, 9, 4, 6)),
];
const MILAN_2003_EXTRA: CuratedSeed[] = [
  q('milan', 'dida_m3', 'Dida', 1973, 'Brazil', ['GK'], 84, 85, 2007, 25, t(8, 5, 7, 8, 5, 7)),
  q('milan', 'kaladze_m3', 'Kakha Kaladze', 1978, 'Georgia', ['LB', 'CB'], 80, 81, 2008, 30, t(8, 5, 7, 7, 5, 7)),
  q('milan', 'ruicosta_m3', 'Rui Costa', 1972, 'Portugal', ['AM'], 82, 83, 2006, 30, t(8, 6, 7, 7, 5, 7)),
  q('milan', 'inzaghi_m3', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 84, 85, 2006, 45, t(8, 6, 9, 8, 5, 7)),
  q('milan', 'ambrosini_m3', 'Massimo Ambrosini', 1977, 'Italy', ['CM', 'DM'], 80, 81, 2008, 35, t(9, 5, 8, 9, 4, 6)),
];
const INTER_2003_EXTRA: CuratedSeed[] = [
  q('inter', 'toldo_i3', 'Francesco Toldo', 1971, 'Italy', ['GK'], 83, 84, 2007, 30, t(8, 6, 8, 8, 5, 6)),
  q('inter', 'materazzi_i3', 'Marco Materazzi', 1973, 'Italy', ['CB'], 82, 83, 2007, 40, t(7, 7, 8, 8, 8, 6)),
  q('inter', 'cannavaro_i3', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 85, 87, 2006, 25, t(9, 6, 9, 8, 4, 7)),
  q('inter', 'favalli_i3', 'Giuseppe Favalli', 1972, 'Italy', ['LB', 'CB'], 78, 79, 2006, 30, t(8, 4, 7, 8, 5, 6)),
  q('inter', 'emre_i3', 'Emre Belözoğlu', 1980, 'Turkey', ['CM', 'AM'], 79, 82, 2007, 40, t(6, 7, 8, 6, 7, 7)),
  q('inter', 'czanetti_i3', 'Cristiano Zanetti', 1977, 'Italy', ['DM', 'CM'], 78, 79, 2007, 35, t(8, 5, 7, 7, 5, 6)),
  q('inter', 'recoba_i3', 'Álvaro Recoba', 1976, 'Uruguay', ['AM', 'LW'], 80, 82, 2007, 35, t(6, 8, 7, 6, 6, 7)),
  q('inter', 'adriano_i3', 'Adriano', 1982, 'Brazil', ['ST'], 83, 88, 2008, 35, t(6, 7, 8, 6, 7, 7)),
];
const ARSENAL_2003_EXTRA: CuratedSeed[] = [
  q('arsenal', 'lehmann_a3', 'Jens Lehmann', 1969, 'Germany', ['GK'], 82, 83, 2007, 25, t(7, 8, 8, 7, 6, 6)),
  q('arsenal', 'lauren_a3', 'Lauren', 1977, 'Cameroon', ['RB'], 81, 82, 2007, 30, t(8, 5, 8, 7, 4, 7)),
  q('arsenal', 'gilberto_a3', 'Gilberto Silva', 1976, 'Brazil', ['DM'], 82, 84, 2008, 25, t(9, 4, 8, 8, 3, 7)),
  q('arsenal', 'kanu_a3', 'Nwankwo Kanu', 1976, 'Nigeria', ['ST'], 79, 80, 2004, 35, t(7, 6, 7, 7, 5, 7)),
];
const LIVERPOOL_2003_EXTRA: CuratedSeed[] = [
  q('liverpool', 'dudek_l3', 'Jerzy Dudek', 1973, 'Poland', ['GK'], 80, 82, 2006, 25, t(7, 5, 7, 7, 5, 7)),
  q('liverpool', 'finnan_l3', 'Steve Finnan', 1976, 'Ireland', ['RB'], 80, 81, 2008, 25, t(8, 4, 7, 7, 3, 7)),
  q('liverpool', 'riise_l3', 'John Arne Riise', 1980, 'Norway', ['LB', 'LW'], 80, 82, 2008, 25, t(8, 5, 7, 7, 4, 7)),
  q('liverpool', 'hamann_l3', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 81, 82, 2006, 30, t(8, 4, 7, 6, 3, 7)),
  q('liverpool', 'kewell_l3', 'Harry Kewell', 1978, 'Australia', ['LW'], 81, 84, 2008, 50, t(6, 6, 7, 6, 6, 7)),
  q('liverpool', 'baros_l3', 'Milan Baroš', 1981, 'Czech Republic', ['ST'], 79, 83, 2007, 35, t(7, 6, 7, 6, 5, 7)),
  q('liverpool', 'murphy_l3', 'Danny Murphy', 1977, 'England', ['CM', 'AM'], 79, 80, 2006, 25, t(8, 5, 7, 8, 4, 7)),
  q('liverpool', 'biscan_l3', 'Igor Bišćan', 1978, 'Croatia', ['DM', 'CB'], 77, 79, 2005, 30, t(7, 5, 7, 6, 5, 7)),
];
const CHELSEA_2003_EXTRA: CuratedSeed[] = [
  q('chelsea', 'bridge_c3', 'Wayne Bridge', 1980, 'England', ['LB'], 79, 81, 2008, 35, t(7, 5, 7, 6, 4, 7)),
  q('chelsea', 'gallas_c3', 'William Gallas', 1977, 'France', ['CB', 'LB'], 83, 85, 2007, 30, t(7, 6, 7, 5, 6, 7)),
  q('chelsea', 'veron_c3', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM'], 82, 84, 2007, 40, t(7, 7, 8, 6, 6, 6)),
  q('chelsea', 'crespo_c3', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 84, 85, 2007, 40, t(8, 6, 8, 6, 5, 7)),
  q('chelsea', 'mutu_c3', 'Adrian Mutu', 1979, 'Romania', ['ST', 'AM'], 81, 84, 2008, 35, t(5, 8, 8, 5, 8, 6)),
  q('chelsea', 'joecole_c3', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 80, 85, 2008, 30, t(7, 6, 8, 7, 5, 7)),
];
/** Manchester City, 2003–04 — a mid-table side (Anelka up front, pre-takeover). */
const MAN_CITY_2003: CuratedSeed[] = [
  q('man_city', 'james_mc3', 'David James', 1970, 'England', ['GK'], 81, 82, 2006, 30, t(7, 6, 7, 7, 6, 6)),
  q('man_city', 'sunjihai_mc3', 'Sun Jihai', 1977, 'China', ['RB'], 76, 77, 2006, 30, t(8, 4, 7, 7, 4, 7)),
  q('man_city', 'distin_mc3', 'Sylvain Distin', 1977, 'France', ['CB'], 80, 82, 2008, 25, t(8, 5, 8, 7, 4, 7)),
  q('man_city', 'dunne_mc3', 'Richard Dunne', 1979, 'Ireland', ['CB'], 79, 81, 2007, 30, t(8, 5, 8, 8, 5, 6)),
  q('man_city', 'tarnat_mc3', 'Michael Tarnat', 1969, 'Germany', ['LB'], 77, 78, 2006, 30, t(8, 5, 7, 7, 5, 7)),
  q('man_city', 'barton_mc3', 'Joey Barton', 1982, 'England', ['CM'], 74, 82, 2007, 35, t(5, 8, 8, 6, 9, 6)),
  q('man_city', 'bosvelt_mc3', 'Paul Bosvelt', 1970, 'Netherlands', ['DM', 'CM'], 77, 78, 2005, 30, t(8, 5, 8, 7, 5, 7)),
  q('man_city', 'swp_mc3', 'Shaun Wright-Phillips', 1981, 'England', ['RW'], 78, 84, 2006, 30, t(8, 6, 8, 7, 5, 7)),
  q('man_city', 'berkovic_mc3', 'Eyal Berkovic', 1972, 'Israel', ['AM'], 77, 78, 2005, 30, t(7, 6, 7, 6, 6, 7)),
  q('man_city', 'sibierski_mc3', 'Antoine Sibierski', 1974, 'France', ['AM', 'ST'], 76, 77, 2006, 30, t(8, 5, 7, 7, 5, 7)),
  q('man_city', 'anelka_mc3', 'Nicolas Anelka', 1979, 'France', ['ST'], 82, 84, 2007, 30, t(6, 8, 8, 5, 7, 7)),
  q('man_city', 'fowler_mc3', 'Robbie Fowler', 1975, 'England', ['ST'], 80, 81, 2006, 40, t(7, 7, 8, 7, 6, 6)),
  q('man_city', 'wanchope_mc3', 'Paulo Wanchope', 1976, 'Costa Rica', ['ST'], 77, 79, 2005, 40, t(6, 6, 7, 6, 6, 7)),
];
/** Tottenham, 2003–04 — a mid-table side before the Carrick/Berbatov years. */
const SPURS_2003: CuratedSeed[] = [
  q('spurs', 'keller_s3', 'Kasey Keller', 1969, 'United States', ['GK'], 79, 80, 2005, 25, t(8, 5, 7, 8, 5, 7)),
  q('spurs', 'kelly_s3', 'Stephen Kelly', 1983, 'Ireland', ['RB'], 72, 76, 2007, 30, t(7, 4, 7, 7, 4, 7)),
  q('spurs', 'king_s3', 'Ledley King', 1980, 'England', ['CB', 'DM'], 83, 87, 2008, 55, t(8, 5, 8, 9, 4, 7)),
  q('spurs', 'doherty_s3', 'Gary Doherty', 1980, 'Ireland', ['CB'], 73, 75, 2006, 30, t(7, 4, 7, 7, 5, 6)),
  q('spurs', 'taricco_s3', 'Mauricio Taricco', 1973, 'Argentina', ['LB'], 76, 77, 2005, 35, t(7, 5, 7, 7, 6, 7)),
  q('spurs', 'anderton_s3', 'Darren Anderton', 1972, 'England', ['RW', 'AM'], 78, 79, 2004, 45, t(8, 5, 7, 8, 4, 7)),
  q('spurs', 'redknapp_s3', 'Jamie Redknapp', 1973, 'England', ['CM'], 78, 80, 2005, 55, t(8, 5, 7, 7, 4, 7)),
  q('spurs', 'davies_s3', 'Simon Davies', 1979, 'Wales', ['RW', 'CM'], 76, 78, 2006, 30, t(8, 5, 7, 7, 4, 7)),
  q('spurs', 'ziege_s3', 'Christian Ziege', 1972, 'Germany', ['LB', 'LW'], 78, 79, 2004, 40, t(7, 6, 7, 7, 5, 7)),
  q('spurs', 'keane_s3', 'Robbie Keane', 1980, 'Ireland', ['ST', 'AM'], 81, 84, 2007, 25, t(7, 6, 8, 6, 5, 8)),
  q('spurs', 'kanoute_s3', 'Frédéric Kanouté', 1977, 'Mali', ['ST'], 80, 82, 2006, 35, t(7, 6, 7, 6, 5, 7)),
  q('spurs', 'postiga_s3', 'Hélder Postiga', 1982, 'Portugal', ['ST'], 76, 80, 2007, 30, t(6, 6, 7, 6, 6, 6)),
  q('spurs', 'poyet_s3', 'Gustavo Poyet', 1967, 'Uruguay', ['CM', 'AM'], 78, 79, 2004, 35, t(8, 6, 8, 7, 5, 7)),
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
  real_madrid: [...REAL_2003, ...REAL_2003_EXTRA],
  chelsea: [...CHELSEA_2003, ...CHELSEA_2003_EXTRA],
  arsenal: [...ARSENAL_2003, ...ARSENAL_2003_EXTRA],
  liverpool: [...LIVERPOOL_2003, ...LIVERPOOL_2003_EXTRA],
  milan: [...MILAN_2003, ...MILAN_2003_EXTRA],
  inter: [...INTER_2003, ...INTER_2003_EXTRA],
  juventus: [...JUVENTUS_2003, ...JUVENTUS_2003_EXTRA],
  bayern: [...BAYERN_2003, ...BAYERN_2003_EXTRA],
  man_city: MAN_CITY_2003,
  spurs: SPURS_2003,
};

export const MANUTD_2003_SQUADS: Record<string, CuratedSeed[]> = { ...CURATED_2003 };
// Domestic mid-tier (M12 shortlist supply): real 2003-04 squad players at the
// non-elite PL clubs, so options lists read like a real shortlist.
for (const [club, seeds] of Object.entries(ENG_DOMESTIC_2003_SQUADS)) {
  MANUTD_2003_SQUADS[club] = [...(MANUTD_2003_SQUADS[club] ?? []), ...seeds];
}
