/**
 * Curated real players — 2003 La Liga "Pre-Messi Dawn" pack (Spain).
 *
 * The vertical slice for "Barcelona — 2003: Pre-Messi Dawn". Rijkaard has just
 * arrived and Ronaldinho with him; the home-grown spine (Xavi, Puyol, Valdés, a
 * teenage Iniesta) is already in place, and a sixteen-year-old Lionel Messi is in
 * the academy about to change football. Reality: Ronaldinho drags them back to the
 * top, Eto'o and Deco arrive in 2004, and the 2006 European Cup and Pep dynasty
 * follow. The counterfactual is to build that golden age — or waste the dawn.
 *
 * Across the Clásico divide, the galácticos in their pomp (Zidane, Figo, Ronaldo,
 * Beckham, Raúl); Benítez's champion Valencia; and the elite of Europe — Ferguson's
 * United, Ancelotti's Milan, Abramovich's first Chelsea — whose real European Cups
 * (2004–2018) are anchored. Ability/potential/personality are HIDDEN designer
 * estimates (§7); clubs, birth years, positions and contracts are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { EUROPE_2004_SQUADS } from './curated-europe-2004.js';

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

// ── Barcelona, 2003–04 (Rijkaard; Ronaldinho arrives, the academy waits) ──────
export const BARCELONA_2003D: CuratedSeed[] = [
  q('barcelona', 'valdes_b3', 'Víctor Valdés', 1982, 'Spain', ['GK'], 82, 88, 2010, 15, t(8, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('barcelona', 'rustu', 'Rüştü Reçber', 1973, 'Turkey', ['GK'], 78, 78, 2006, 20, t(7, 6, 7, 7, 6, 6)),
  q('barcelona', 'puyol_b3', 'Carles Puyol', 1978, 'Spain', ['CB', 'RB'], 85, 87, 2010, 20, t(10, 5, 9, 10, 4, 7), { loyalty: 97 }),
  q('barcelona', 'marquez_b3', 'Rafael Márquez', 1979, 'Mexico', ['CB', 'DM'], 82, 85, 2010, 25, t(8, 6, 8, 7, 5, 7)),
  q('barcelona', 'oleguer_b3', 'Oleguer', 1980, 'Spain', ['RB', 'CB'], 76, 79, 2008, 25, t(8, 4, 7, 8, 4, 7)),
  q('barcelona', 'van_bronckhorst_b3', 'Giovanni van Bronckhorst', 1975, 'Netherlands', ['LB', 'CM'], 80, 82, 2007, 20, t(9, 5, 8, 7, 4, 8)),
  q('barcelona', 'reiziger_b3', 'Michael Reiziger', 1973, 'Netherlands', ['RB'], 79, 79, 2004, 20, t(8, 5, 8, 7, 4, 7)),
  q('barcelona', 'xavi_b3', 'Xavi', 1980, 'Spain', ['CM'], 84, 92, 2012, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'cocu_b3', 'Phillip Cocu', 1970, 'Netherlands', ['CM', 'DM'], 82, 82, 2004, 20, t(9, 5, 8, 8, 3, 8)),
  q('barcelona', 'iniesta_b3', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 73, 93, 2012, 20, t(10, 4, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'motta_b3', 'Thiago Motta', 1982, 'Brazil', ['DM', 'CM'], 76, 84, 2009, 30, t(7, 5, 8, 6, 5, 7)),
  q('barcelona', 'gerard_b3', 'Gerard López', 1979, 'Spain', ['AM', 'CM'], 77, 79, 2005, 25, t(7, 5, 7, 7, 5, 7)),
  q('barcelona', 'luis_enrique_b3', 'Luís Enrique', 1970, 'Spain', ['CM', 'RW'], 80, 80, 2004, 30, t(9, 6, 9, 10, 4, 7), { loyalty: 92 }),
  q('barcelona', 'ronaldinho_b3', 'Ronaldinho', 1980, 'Brazil', ['AM', 'LW'], 88, 93, 2010, 25, t(6, 7, 8, 7, 6, 8)),
  q('barcelona', 'kluivert_b3', 'Patrick Kluivert', 1976, 'Netherlands', ['ST'], 83, 84, 2004, 30, t(6, 7, 7, 6, 6, 7)),
  q('barcelona', 'saviola_b3', 'Javier Saviola', 1981, 'Argentina', ['ST'], 81, 84, 2007, 30, t(7, 6, 8, 6, 5, 7)),
  q('barcelona', 'overmars_b3', 'Marc Overmars', 1973, 'Netherlands', ['LW'], 80, 81, 2005, 45, t(8, 6, 8, 6, 4, 7)),
  q('barcelona', 'quaresma_b3', 'Ricardo Quaresma', 1983, 'Portugal', ['RW'], 74, 84, 2008, 30, t(5, 8, 7, 5, 7, 6)),
  q('barcelona', 'messi_b3', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 60, 99, 2012, 15, t(10, 6, 10, 10, 3, 8), { loyalty: 96 }),
];

// ── Real Madrid, 2003–04 (the galácticos in their pomp) ───────────────────────
export const REAL_MADRID_2003D: CuratedSeed[] = [
  q('real_madrid', 'casillas_r3', 'Iker Casillas', 1981, 'Spain', ['GK'], 87, 90, 2010, 15, t(9, 6, 9, 10, 4, 7), { loyalty: 95 }),
  q('real_madrid', 'salgado_r3', 'Míchel Salgado', 1975, 'Spain', ['RB'], 81, 81, 2007, 25, t(8, 5, 8, 8, 5, 7)),
  q('real_madrid', 'helguera_r3', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 83, 83, 2007, 25, t(8, 6, 8, 8, 5, 7)),
  q('real_madrid', 'pavon', 'Francisco Pavón', 1980, 'Spain', ['CB'], 76, 78, 2007, 25, t(8, 4, 7, 9, 4, 6)),
  q('real_madrid', 'roberto_carlos_r3', 'Roberto Carlos', 1973, 'Brazil', ['LB', 'LW'], 86, 86, 2007, 20, t(8, 7, 9, 8, 5, 8)),
  q('real_madrid', 'raul_bravo', 'Raúl Bravo', 1981, 'Spain', ['LB', 'CB'], 74, 77, 2007, 25, t(7, 5, 7, 7, 5, 7)),
  q('real_madrid', 'zidane_r3', 'Zinédine Zidane', 1972, 'France', ['AM', 'CM'], 91, 91, 2006, 20, t(9, 6, 9, 8, 4, 8)),
  q('real_madrid', 'figo_r3', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 86, 86, 2005, 20, t(8, 7, 8, 7, 4, 8)),
  q('real_madrid', 'beckham_r3', 'David Beckham', 1975, 'England', ['RW', 'CM'], 85, 85, 2007, 15, t(9, 7, 9, 7, 4, 7)),
  q('real_madrid', 'guti_r3', 'Guti', 1976, 'Spain', ['AM', 'CM'], 82, 83, 2008, 25, t(6, 7, 7, 8, 6, 7)),
  q('real_madrid', 'solari', 'Santiago Solari', 1976, 'Argentina', ['LW', 'AM'], 79, 80, 2006, 25, t(8, 5, 8, 7, 5, 7)),
  q('real_madrid', 'raul_r3', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 86, 86, 2008, 20, t(9, 6, 9, 10, 4, 7), { loyalty: 96 }),
  q('real_madrid', 'ronaldo_r3', 'Ronaldo', 1976, 'Brazil', ['ST'], 89, 89, 2007, 35, t(5, 8, 8, 6, 7, 8)),
  q('real_madrid', 'morientes_r3', 'Fernando Morientes', 1976, 'Spain', ['ST'], 83, 84, 2007, 25, t(8, 6, 8, 8, 4, 7)),
  q('real_madrid', 'portillo', 'Javier Portillo', 1982, 'Spain', ['ST'], 74, 78, 2007, 25, t(7, 5, 7, 8, 5, 7)),
];

// ── Valencia, 2003–04 (Benítez; La Liga + UEFA Cup champions) ──────────────────
export const VALENCIA_2003D: CuratedSeed[] = [
  q('valencia', 'canizares_v3', 'Santiago Cañizares', 1969, 'Spain', ['GK'], 84, 84, 2007, 20, t(9, 6, 8, 8, 5, 6)),
  q('valencia', 'ayala_v3', 'Roberto Ayala', 1973, 'Argentina', ['CB'], 85, 85, 2007, 20, t(9, 6, 8, 8, 5, 7)),
  q('valencia', 'marchena', 'Carlos Marchena', 1979, 'Spain', ['CB', 'DM'], 80, 82, 2008, 25, t(8, 5, 8, 8, 5, 7)),
  q('valencia', 'pellegrino', 'Mauricio Pellegrino', 1971, 'Argentina', ['CB'], 78, 78, 2005, 25, t(8, 5, 7, 8, 5, 6)),
  q('valencia', 'curro_torres', 'Curro Torres', 1976, 'Spain', ['RB'], 76, 77, 2006, 25, t(8, 4, 7, 8, 4, 7)),
  q('valencia', 'baraja_v3', 'Rubén Baraja', 1975, 'Spain', ['CM', 'DM'], 83, 84, 2008, 25, t(9, 5, 8, 8, 5, 7)),
  q('valencia', 'albelda', 'David Albelda', 1977, 'Spain', ['DM'], 82, 83, 2009, 25, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('valencia', 'vicente_v3', 'Vicente', 1981, 'Spain', ['LW'], 83, 85, 2009, 30, t(8, 6, 8, 8, 5, 8)),
  q('valencia', 'aimar_v3', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 83, 85, 2008, 30, t(7, 6, 8, 7, 5, 8)),
  q('valencia', 'rufete', 'Francisco Rufete', 1976, 'Spain', ['RW', 'AM'], 78, 79, 2006, 25, t(8, 5, 7, 7, 5, 7)),
  q('valencia', 'mista', 'Miguel Ángel Mista', 1978, 'Spain', ['ST'], 80, 81, 2007, 25, t(8, 6, 8, 7, 5, 7)),
  q('valencia', 'angulo', 'Miguel Ángulo', 1977, 'Spain', ['LW', 'ST'], 78, 79, 2007, 25, t(8, 5, 8, 8, 5, 7)),
  q('valencia', 'carew', 'John Carew', 1979, 'Norway', ['ST'], 79, 82, 2007, 25, t(7, 6, 8, 6, 5, 7)),
];

// ── Deportivo La Coruña, 2003–04 (Súper Dépor's last great side) ───────────────
export const DEPORTIVO_2003D: CuratedSeed[] = [
  q('deportivo', 'molina_d', 'José Molina', 1970, 'Spain', ['GK'], 79, 79, 2006, 25, t(8, 5, 7, 8, 4, 6)),
  q('deportivo', 'naybet_d', 'Noureddine Naybet', 1970, 'Morocco', ['CB'], 81, 81, 2005, 25, t(8, 5, 8, 8, 4, 7)),
  q('deportivo', 'andrade', 'Jorge Andrade', 1978, 'Portugal', ['CB'], 80, 82, 2007, 25, t(8, 5, 8, 7, 5, 7)),
  q('deportivo', 'capdevila_d', 'Joan Capdevila', 1978, 'Spain', ['LB'], 79, 82, 2007, 25, t(8, 5, 8, 8, 5, 7)),
  q('deportivo', 'valeron', 'Juan Carlos Valerón', 1975, 'Spain', ['AM'], 85, 86, 2008, 30, t(8, 5, 8, 9, 4, 8), { loyalty: 90 }),
  q('deportivo', 'mauro_silva_d', 'Mauro Silva', 1968, 'Brazil', ['DM'], 81, 81, 2005, 20, t(9, 5, 8, 9, 3, 7)),
  q('deportivo', 'sergio_d', 'Sergio', 1976, 'Spain', ['CM'], 78, 79, 2006, 25, t(8, 5, 7, 8, 5, 7)),
  q('deportivo', 'fran_d', 'Fran', 1969, 'Spain', ['LW', 'AM'], 79, 79, 2005, 25, t(9, 4, 8, 10, 4, 7), { loyalty: 95 }),
  q('deportivo', 'victor_d', 'Víctor Sánchez', 1976, 'Spain', ['RW', 'CM'], 78, 79, 2007, 25, t(8, 5, 8, 7, 5, 7)),
  q('deportivo', 'luque_d', 'Albert Luque', 1978, 'Spain', ['LW', 'ST'], 80, 82, 2006, 25, t(7, 6, 8, 7, 5, 7)),
  q('deportivo', 'pandiani', 'Walter Pandiani', 1976, 'Uruguay', ['ST'], 78, 79, 2006, 25, t(7, 6, 8, 7, 5, 7)),
  q('deportivo', 'tristan', 'Diego Tristán', 1976, 'Spain', ['ST'], 82, 83, 2007, 30, t(6, 6, 8, 7, 6, 7)),
];

// ── The elite of Europe, 2003–04 — full squads so every real European Cup of the
//    span (2004–2018) is anchored to a side that exists. ───────────────────────
export const MANUTD_2003D: CuratedSeed[] = [
  q('man_utd', 'howard_u3', 'Tim Howard', 1979, 'United States', ['GK'], 79, 82, 2007, 20, t(8, 5, 8, 8, 5, 7)),
  q('man_utd', 'g_neville_u3', 'Gary Neville', 1975, 'England', ['RB'], 82, 82, 2007, 25, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('man_utd', 'ferdinand_u3', 'Rio Ferdinand', 1978, 'England', ['CB'], 85, 88, 2008, 20, t(8, 6, 8, 8, 4, 7)),
  q('man_utd', 'silvestre_u3', 'Mikaël Silvestre', 1977, 'France', ['CB', 'LB'], 80, 81, 2007, 25, t(8, 5, 7, 8, 5, 7)),
  q('man_utd', 'oshea', 'John O’Shea', 1981, 'Ireland', ['CB', 'RB'], 77, 80, 2008, 20, t(8, 5, 7, 9, 4, 7)),
  q('man_utd', 'keane_u3', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 85, 85, 2006, 25, t(9, 8, 10, 9, 8, 6), { loyalty: 90 }),
  q('man_utd', 'scholes_u3', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 86, 86, 2007, 20, t(9, 5, 8, 10, 4, 7), { loyalty: 96 }),
  q('man_utd', 'giggs_u3', 'Ryan Giggs', 1973, 'Wales', ['LW'], 85, 85, 2007, 20, t(9, 6, 9, 10, 4, 8), { loyalty: 97 }),
  q('man_utd', 'fletcher_u3', 'Darren Fletcher', 1984, 'Scotland', ['CM'], 72, 83, 2008, 20, t(9, 5, 8, 9, 4, 7)),
  q('man_utd', 'cristiano_u3', 'Cristiano Ronaldo', 1985, 'Portugal', ['RW', 'LW'], 78, 96, 2008, 15, t(9, 8, 10, 7, 4, 8)),
  q('man_utd', 'van_nistelrooy_u3', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 88, 88, 2007, 25, t(9, 7, 9, 7, 4, 7)),
  q('man_utd', 'butt_u3', 'Nicky Butt', 1975, 'England', ['CM', 'DM'], 78, 79, 2005, 20, t(8, 5, 7, 9, 5, 7)),
  q('man_utd', 'saha_u3', 'Louis Saha', 1978, 'France', ['ST'], 80, 83, 2008, 40, t(7, 6, 8, 7, 5, 7)),
];

export const MILAN_2003D: CuratedSeed[] = [
  q('milan', 'dida_m3', 'Dida', 1973, 'Brazil', ['GK'], 85, 85, 2008, 20, t(8, 6, 8, 8, 5, 6)),
  q('milan', 'cafu_m3', 'Cafu', 1970, 'Brazil', ['RB'], 84, 84, 2007, 25, t(9, 6, 8, 8, 4, 8)),
  q('milan', 'nesta_m3', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 88, 89, 2009, 25, t(9, 5, 8, 9, 4, 7), { loyalty: 92 }),
  q('milan', 'maldini_m3', 'Paolo Maldini', 1968, 'Italy', ['CB', 'LB'], 86, 86, 2007, 25, t(10, 6, 9, 10, 3, 7), { loyalty: 99, hardBlocks: [{ reason: 'Paolo Maldini is Milan for life.', untilYear: 2099 }] }),
  q('milan', 'stam_m3', 'Jaap Stam', 1972, 'Netherlands', ['CB'], 85, 85, 2006, 25, t(9, 6, 8, 8, 4, 7)),
  q('milan', 'costacurta_m3', 'Alessandro Costacurta', 1966, 'Italy', ['CB'], 80, 80, 2005, 25, t(9, 5, 8, 10, 3, 7), { loyalty: 94 }),
  q('milan', 'gattuso_m3', 'Gennaro Gattuso', 1978, 'Italy', ['DM', 'CM'], 83, 84, 2008, 25, t(9, 7, 9, 9, 7, 7), { loyalty: 92 }),
  q('milan', 'pirlo_m3', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'CM'], 85, 88, 2009, 20, t(9, 6, 9, 8, 4, 8)),
  q('milan', 'seedorf_m3', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 85, 86, 2008, 20, t(8, 7, 8, 8, 5, 8)),
  q('milan', 'rui_costa_m3', 'Manuel Rui Costa', 1972, 'Portugal', ['AM'], 83, 83, 2006, 20, t(8, 6, 8, 7, 4, 8)),
  q('milan', 'kaka_m3', 'Kaká', 1982, 'Brazil', ['AM'], 85, 93, 2009, 20, t(9, 6, 9, 8, 4, 8), { loyalty: 90 }),
  q('milan', 'shevchenko_m3', 'Andriy Shevchenko', 1976, 'Ukraine', ['ST'], 89, 90, 2008, 25, t(9, 6, 9, 8, 4, 8)),
  q('milan', 'inzaghi_m3', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 84, 84, 2007, 30, t(8, 7, 9, 8, 5, 7)),
  q('milan', 'tomasson_m3', 'Jon Dahl Tomasson', 1976, 'Denmark', ['ST', 'AM'], 80, 81, 2006, 25, t(8, 5, 8, 7, 5, 7)),
];

export const INTER_2003D: CuratedSeed[] = [
  q('inter', 'toldo_i3', 'Francesco Toldo', 1971, 'Italy', ['GK'], 84, 84, 2007, 20, t(8, 5, 8, 8, 4, 6)),
  q('inter', 'cordoba_i3', 'Iván Córdoba', 1976, 'Colombia', ['CB'], 82, 83, 2008, 25, t(8, 5, 8, 8, 5, 7)),
  q('inter', 'materazzi_i3', 'Marco Materazzi', 1973, 'Italy', ['CB'], 82, 83, 2008, 25, t(7, 7, 8, 8, 8, 6)),
  q('inter', 'cannavaro_i3', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 85, 87, 2007, 20, t(9, 6, 9, 8, 5, 7)),
  q('inter', 'zanetti_i3', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 86, 86, 2008, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 97 }),
  q('inter', 'vieri_i3', 'Christian Vieri', 1973, 'Italy', ['ST'], 85, 85, 2005, 30, t(6, 7, 8, 6, 6, 7)),
  q('inter', 'recoba_i3', 'Álvaro Recoba', 1976, 'Uruguay', ['AM', 'ST'], 81, 82, 2008, 30, t(5, 7, 7, 7, 7, 7)),
  q('inter', 'emre_i3', 'Emre Belözoğlu', 1980, 'Turkey', ['CM', 'AM'], 80, 83, 2007, 30, t(6, 7, 8, 6, 7, 7)),
  q('inter', 'van_der_meyde_i3', 'Andy van der Meyde', 1979, 'Netherlands', ['RW'], 78, 80, 2007, 30, t(5, 7, 7, 6, 7, 7)),
  q('inter', 'cruz_i3', 'Julio Cruz', 1974, 'Argentina', ['ST'], 79, 80, 2007, 25, t(8, 6, 8, 8, 5, 7)),
  q('inter', 'martins_i3', 'Obafemi Martins', 1984, 'Nigeria', ['ST'], 76, 84, 2008, 25, t(6, 6, 8, 7, 6, 7)),
  q('inter', 'kily_i3', 'Kily González', 1974, 'Argentina', ['LW', 'LB'], 78, 79, 2006, 25, t(7, 6, 8, 7, 6, 7)),
  q('inter', 'zanetti_c_i3', 'Cristiano Zanetti', 1977, 'Italy', ['DM', 'CM'], 79, 80, 2007, 25, t(8, 5, 7, 7, 5, 7)),
];

export const BAYERN_2003D: CuratedSeed[] = [
  q('bayern', 'kahn_y3', 'Oliver Kahn', 1969, 'Germany', ['GK'], 88, 88, 2007, 15, t(10, 7, 9, 9, 5, 7), { loyalty: 92 }),
  q('bayern', 'sagnol_y3', 'Willy Sagnol', 1977, 'France', ['RB'], 81, 82, 2007, 25, t(8, 5, 8, 8, 4, 7)),
  q('bayern', 'kovac_y3', 'Robert Kovač', 1974, 'Croatia', ['CB'], 79, 80, 2006, 25, t(8, 5, 7, 8, 5, 6)),
  q('bayern', 'linke_y3', 'Thomas Linke', 1969, 'Germany', ['CB'], 79, 79, 2005, 25, t(8, 4, 7, 8, 4, 6)),
  q('bayern', 'lizarazu_y3', 'Bixente Lizarazu', 1969, 'France', ['LB'], 82, 82, 2006, 20, t(9, 5, 8, 8, 4, 8)),
  q('bayern', 'ballack_y3', 'Michael Ballack', 1976, 'Germany', ['CM', 'AM'], 86, 87, 2006, 25, t(8, 7, 9, 7, 5, 7)),
  q('bayern', 'ze_roberto_y3', 'Zé Roberto', 1974, 'Brazil', ['CM', 'LW'], 83, 83, 2006, 25, t(9, 5, 8, 7, 4, 8)),
  q('bayern', 'hargreaves_y3', 'Owen Hargreaves', 1981, 'England', ['DM', 'CM'], 80, 84, 2007, 40, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'salihamidzic_y3', 'Hasan Salihamidžić', 1977, 'Bosnia', ['RW', 'CM'], 80, 81, 2007, 20, t(9, 5, 8, 8, 4, 7)),
  q('bayern', 'makaay_y3', 'Roy Makaay', 1975, 'Netherlands', ['ST'], 85, 86, 2008, 25, t(9, 6, 8, 8, 4, 7)),
  q('bayern', 'pizarro_y3', 'Claudio Pizarro', 1978, 'Peru', ['ST'], 82, 83, 2007, 25, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'elber_y3', 'Giovane Élber', 1972, 'Brazil', ['ST'], 82, 82, 2005, 25, t(8, 6, 8, 8, 4, 7)),
  q('bayern', 'santa_cruz_y3', 'Roque Santa Cruz', 1981, 'Paraguay', ['ST'], 78, 82, 2007, 35, t(8, 5, 8, 7, 5, 7)),
];

export const LIVERPOOL_2003D: CuratedSeed[] = [
  q('liverpool', 'dudek_l3', 'Jerzy Dudek', 1973, 'Poland', ['GK'], 80, 81, 2006, 25, t(7, 6, 7, 8, 6, 6)),
  q('liverpool', 'finnan_l3', 'Steve Finnan', 1976, 'Ireland', ['RB'], 80, 81, 2008, 20, t(9, 4, 8, 8, 4, 7)),
  q('liverpool', 'carragher_l3', 'Jamie Carragher', 1978, 'England', ['CB'], 83, 85, 2009, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'hyypia_l3', 'Sami Hyypiä', 1973, 'Finland', ['CB'], 84, 84, 2007, 20, t(9, 5, 8, 9, 4, 7)),
  q('liverpool', 'riise_l3', 'John Arne Riise', 1980, 'Norway', ['LB', 'LW'], 80, 81, 2008, 25, t(8, 5, 8, 8, 4, 7)),
  q('liverpool', 'gerrard_l3', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 87, 90, 2008, 20, t(9, 7, 9, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'hamann_l3', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 81, 81, 2006, 25, t(8, 5, 8, 7, 5, 7)),
  q('liverpool', 'murphy_l3', 'Danny Murphy', 1977, 'England', ['CM', 'AM'], 79, 80, 2006, 25, t(8, 5, 8, 8, 5, 7)),
  q('liverpool', 'kewell_l3', 'Harry Kewell', 1978, 'Australia', ['LW', 'ST'], 81, 84, 2008, 35, t(7, 6, 8, 7, 6, 7)),
  q('liverpool', 'baros_l3', 'Milan Baroš', 1981, 'Czechia', ['ST'], 79, 82, 2008, 25, t(7, 6, 8, 7, 6, 7)),
  q('liverpool', 'owen_l3', 'Michael Owen', 1979, 'England', ['ST'], 86, 87, 2004, 30, t(9, 6, 9, 8, 4, 7)),
  q('liverpool', 'heskey_l3', 'Emile Heskey', 1978, 'England', ['ST'], 78, 79, 2006, 25, t(8, 5, 8, 8, 5, 7)),
  q('liverpool', 'diouf', 'El Hadji Diouf', 1981, 'Senegal', ['RW', 'ST'], 76, 80, 2007, 25, t(4, 8, 7, 5, 8, 6)),
];

export const CHELSEA_2003D: CuratedSeed[] = [
  q('chelsea', 'cudicini', 'Carlo Cudicini', 1973, 'Italy', ['GK'], 82, 82, 2007, 20, t(8, 5, 8, 8, 5, 6)),
  q('chelsea', 'ferreira_c3', 'Paulo Ferreira', 1979, 'Portugal', ['RB', 'CB'], 80, 81, 2008, 25, t(8, 5, 8, 8, 4, 7)),
  q('chelsea', 'terry_c3', 'John Terry', 1980, 'England', ['CB'], 84, 88, 2009, 20, t(9, 7, 9, 10, 6, 7), { loyalty: 95 }),
  q('chelsea', 'gallas_c3', 'William Gallas', 1977, 'France', ['CB', 'LB'], 82, 84, 2007, 25, t(8, 6, 8, 7, 6, 7)),
  q('chelsea', 'bridge', 'Wayne Bridge', 1980, 'England', ['LB'], 79, 81, 2008, 25, t(8, 5, 7, 8, 5, 7)),
  q('chelsea', 'makelele_c3', 'Claude Makélélé', 1973, 'France', ['DM'], 84, 84, 2007, 20, t(9, 5, 8, 8, 4, 7)),
  q('chelsea', 'lampard_c3', 'Frank Lampard', 1978, 'England', ['CM', 'AM'], 85, 89, 2008, 15, t(10, 6, 9, 9, 4, 7), { loyalty: 90 }),
  q('chelsea', 'geremi', 'Geremi', 1978, 'Cameroon', ['RB', 'CM'], 79, 80, 2007, 25, t(8, 5, 8, 7, 5, 7)),
  q('chelsea', 'duff_c3', 'Damien Duff', 1979, 'Ireland', ['LW', 'RW'], 82, 84, 2008, 25, t(8, 6, 8, 8, 5, 8)),
  q('chelsea', 'j_cole_c3', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 80, 84, 2008, 25, t(7, 6, 8, 8, 5, 8)),
  q('chelsea', 'veron_c3', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM', 'AM'], 82, 83, 2007, 25, t(8, 6, 8, 6, 5, 7)),
  q('chelsea', 'crespo_c3', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 84, 85, 2008, 25, t(8, 7, 9, 7, 5, 7)),
  q('chelsea', 'hasselbaink', 'Jimmy Floyd Hasselbaink', 1972, 'Netherlands', ['ST'], 82, 82, 2005, 25, t(8, 7, 8, 7, 5, 7)),
  q('chelsea', 'gudjohnsen_c3', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 81, 82, 2007, 25, t(8, 6, 8, 7, 5, 7)),
  q('chelsea', 'mutu_c3', 'Adrian Mutu', 1979, 'Romania', ['ST', 'AM'], 80, 82, 2008, 30, t(4, 8, 7, 5, 8, 6)),
];

export const JUVENTUS_2003D: CuratedSeed[] = [
  q('juventus', 'buffon_j3', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 88, 90, 2008, 20, t(10, 6, 9, 9, 4, 7), { loyalty: 95 }),
  q('juventus', 'thuram_j3', 'Lilian Thuram', 1972, 'France', ['CB', 'RB'], 85, 85, 2006, 20, t(9, 5, 9, 8, 4, 7)),
  q('juventus', 'montero_j3', 'Paolo Montero', 1971, 'Uruguay', ['CB'], 83, 83, 2005, 30, t(8, 6, 8, 8, 7, 6)),
  q('juventus', 'zambrotta_j3', 'Gianluca Zambrotta', 1977, 'Italy', ['RB', 'LB'], 83, 86, 2007, 20, t(9, 5, 8, 8, 5, 7)),
  q('juventus', 'ferrara_j3', 'Ciro Ferrara', 1967, 'Italy', ['CB'], 79, 79, 2005, 25, t(9, 5, 8, 8, 4, 7)),
  q('juventus', 'nedved_j3', 'Pavel Nedvěd', 1972, 'Czechia', ['AM', 'LW'], 88, 88, 2007, 20, t(10, 6, 9, 8, 4, 8)),
  q('juventus', 'camoranesi_j3', 'Mauro Camoranesi', 1976, 'Italy', ['RW'], 81, 82, 2007, 25, t(8, 6, 8, 7, 6, 7)),
  q('juventus', 'tacchinardi_j3', 'Alessio Tacchinardi', 1975, 'Italy', ['DM', 'CM'], 80, 81, 2006, 30, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'davids_j3', 'Edgar Davids', 1973, 'Netherlands', ['CM', 'DM'], 84, 84, 2005, 25, t(8, 7, 9, 7, 7, 7)),
  q('juventus', 'del_piero_j3', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 86, 86, 2008, 30, t(9, 6, 9, 10, 4, 7), { loyalty: 98 }),
  q('juventus', 'trezeguet_j3', 'David Trezeguet', 1977, 'France', ['ST'], 85, 86, 2007, 30, t(8, 6, 8, 8, 5, 7)),
  q('juventus', 'di_vaio', 'Marco Di Vaio', 1976, 'Italy', ['ST'], 80, 81, 2006, 25, t(8, 6, 8, 7, 5, 7)),
  q('juventus', 'miccoli_j3', 'Fabrizio Miccoli', 1979, 'Italy', ['ST', 'AM'], 77, 80, 2007, 25, t(7, 6, 8, 7, 6, 7)),
];

// ── European / La Liga context (light — the reality-anchored Cup's field) ──────
export const PORTO_2003D: CuratedSeed[] = [
  q('porto', 'vitor_baia_p3', 'Vítor Baía', 1969, 'Portugal', ['GK'], 82, 82, 2006, 20, t(8, 6, 8, 9, 4, 7), { loyalty: 90 }),
  q('porto', 'carvalho_p3', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 84, 86, 2007, 20, t(8, 6, 8, 8, 5, 7)),
  q('porto', 'costinha_p3', 'Costinha', 1974, 'Portugal', ['DM'], 80, 81, 2006, 25, t(8, 5, 8, 7, 5, 7)),
  q('porto', 'deco_p3', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 86, 87, 2007, 25, t(8, 6, 8, 7, 5, 7)),
  q('porto', 'derlei', 'Derlei', 1975, 'Brazil', ['ST'], 80, 81, 2006, 25, t(8, 6, 8, 7, 5, 7)),
  q('porto', 'mccarthy_p3', 'Benni McCarthy', 1977, 'South Africa', ['ST'], 80, 81, 2006, 25, t(7, 6, 8, 7, 5, 7)),
  q('porto', 'maniche', 'Maniche', 1977, 'Portugal', ['CM'], 81, 82, 2007, 25, t(8, 6, 8, 7, 5, 7)),
];
export const MONACO_2003D: CuratedSeed[] = [
  q('monaco', 'roma_m3', 'Flavio Roma', 1974, 'Italy', ['GK'], 79, 79, 2006, 25, t(8, 5, 7, 8, 5, 6)),  q('monaco', 'giuly_m3', 'Ludovic Giuly', 1976, 'France', ['RW', 'AM'], 82, 83, 2006, 25, t(8, 6, 8, 7, 5, 7)),
  q('monaco', 'rothen', 'Jérôme Rothen', 1978, 'France', ['LW', 'LB'], 80, 82, 2006, 25, t(7, 6, 8, 7, 5, 7)),
  q('monaco', 'prso', 'Dado Pršo', 1974, 'Croatia', ['ST'], 78, 79, 2005, 25, t(8, 5, 8, 7, 5, 7)),
  q('monaco', 'evra_m3', 'Patrice Evra', 1981, 'France', ['LB'], 79, 86, 2007, 20, t(9, 6, 8, 8, 5, 8)),
  q('monaco', 'zikos', 'Akis Zikos', 1974, 'Greece', ['DM', 'CM'], 76, 77, 2005, 25, t(8, 5, 7, 7, 5, 7)),
];
export const ATLETICO_2003D: CuratedSeed[] = [
  q('atletico', 'fernando_torres_a3', 'Fernando Torres', 1984, 'Spain', ['ST'], 82, 90, 2008, 25, t(8, 6, 9, 9, 5, 8), { loyalty: 85 }),
  q('atletico', 'simao_a3', 'Simão Sabrosa', 1979, 'Portugal', ['LW', 'RW'], 81, 83, 2007, 25, t(8, 6, 8, 7, 5, 7)),
  q('atletico', 'jorge_a3', 'Jorge', 1979, 'Brazil', ['LB'], 75, 76, 2006, 25, t(7, 5, 7, 7, 5, 7)),
  q('atletico', 'perea_a3', 'Luis Perea', 1979, 'Colombia', ['CB'], 79, 81, 2008, 25, t(8, 5, 8, 8, 5, 7)),
  q('atletico', 'ibagaza_a3', 'Ariel Ibagaza', 1976, 'Argentina', ['AM'], 78, 79, 2006, 25, t(7, 6, 7, 7, 5, 7)),
  q('atletico', 'gamarra', 'Carlos Gamarra', 1971, 'Paraguay', ['CB'], 79, 79, 2005, 25, t(8, 5, 8, 8, 5, 6)),
];
export const SEVILLA_2003D: CuratedSeed[] = [
  q('sevilla', 'palop', 'Andrés Palop', 1973, 'Spain', ['GK'], 80, 81, 2007, 20, t(8, 5, 8, 8, 5, 6)),
  q('sevilla', 'javi_navarro', 'Javi Navarro', 1974, 'Spain', ['CB'], 79, 79, 2006, 25, t(8, 5, 7, 9, 6, 6)),
  q('sevilla', 'daniel_alves', 'Dani Alves', 1983, 'Brazil', ['RB'], 74, 89, 2009, 20, t(9, 6, 9, 8, 5, 8)),
  q('sevilla', 'jesus_navas', 'Jesús Navas', 1985, 'Spain', ['RW'], 72, 85, 2010, 20, t(9, 5, 8, 10, 6, 7), { loyalty: 92 }),
  q('sevilla', 'marti', 'Francisco Gallardo', 1979, 'Spain', ['ST'], 76, 77, 2006, 25, t(7, 5, 7, 7, 5, 7)),
  q('sevilla', 'reyes_s3', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'ST'], 80, 85, 2007, 25, t(6, 7, 8, 7, 6, 7)),
];

export const MALLORCA_2003D: CuratedSeed[] = [
  q('mallorca', 'leo_franco', 'Leo Franco', 1977, 'Argentina', ['GK'], 79, 81, 2007, 20, t(8, 5, 7, 8, 5, 6)),
  q('mallorca', 'etoo_m3', 'Samuel Eto’o', 1981, 'Cameroon', ['ST'], 84, 89, 2007, 25, t(7, 8, 9, 6, 6, 7)),
  q('mallorca', 'riera_m3', 'Albert Riera', 1982, 'Spain', ['LW'], 77, 82, 2007, 25, t(7, 6, 8, 7, 5, 7)),
];

/** The full Barcelona-2003 curated universe. */
export const BARCELONA_2003_SQUADS: Record<string, CuratedSeed[]> = {
  barcelona: BARCELONA_2003D,
  real_madrid: REAL_MADRID_2003D,
  valencia: VALENCIA_2003D,
  deportivo: DEPORTIVO_2003D,
  man_utd: MANUTD_2003D,
  milan: MILAN_2003D,
  inter: INTER_2003D,
  bayern: BAYERN_2003D,
  liverpool: LIVERPOOL_2003D,
  chelsea: CHELSEA_2003D,
  juventus: JUVENTUS_2003D,
  porto: PORTO_2003D,
  monaco: MONACO_2003D,
  atletico: ATLETICO_2003D,
  sevilla: SEVILLA_2003D,
  mallorca: MALLORCA_2003D,
};

// European selling clubs (M12A rollout) — the non-Spanish talent pipeline of the
// Mourinho-Porto era. Porto and Monaco are already fully curated in this pack for
// 2003 (their own squads), so only the clubs this pack lacks are added.
for (const [club, seeds] of Object.entries(EUROPE_2004_SQUADS)) {
  if (club === 'porto' || club === 'monaco') continue;
  BARCELONA_2003_SQUADS[club] = [...(BARCELONA_2003_SQUADS[club] ?? []), ...seeds];
}
