/**
 * Curated real players — 2004 Serie A "Pre-Calciopoli Positioning" pack (Italy).
 *
 * The vertical slice for "Internazionale — 2004: Pre-Calciopoli Positioning".
 * Mancini's Inter, with Adriano at his terrifying peak, are the perennial
 * nearly-men — beaten to the Scudetto by Juventus and Milan every year. But a
 * reckoning is coming: the 2006 Calciopoli scandal will strip Juventus, send them
 * to Serie B and hand Inter the title, launching five in a row. The counterfactual
 * is to be built and ready the moment the balance tips — or to win it on merit
 * before the scandal ever breaks.
 *
 * Around Inter, the mid-2000s calcio at its richest: Capello's Juventus (Ibra,
 * Nedvěd, Cannavaro), the Milan of Kaká and Shevchenko who would lose Istanbul,
 * and the elite of Europe whose real European Cups (2005–2019) are anchored.
 * Ability/potential/personality are HIDDEN designer estimates (§7); clubs, birth
 * years, positions and contracts are real.
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

// ── Internazionale, 2004–05 (Mancini; Adriano's peak; the nearly-men) ─────────
export const INTER_2004: CuratedSeed[] = [
  q('inter', 'toldo_04', 'Francesco Toldo', 1971, 'Italy', ['GK'], 84, 84, 2008, 20, t(8, 5, 8, 8, 4, 6)),
  q('inter', 'cesar_04', 'Júlio César', 1979, 'Brazil', ['GK'], 80, 88, 2010, 20, t(9, 5, 8, 8, 4, 7)),
  q('inter', 'zanetti_04', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 87, 87, 2009, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 97 }),
  q('inter', 'cordoba_04', 'Iván Córdoba', 1976, 'Colombia', ['CB'], 82, 83, 2009, 25, t(8, 5, 8, 8, 5, 7)),
  q('inter', 'materazzi_04', 'Marco Materazzi', 1973, 'Italy', ['CB'], 82, 83, 2009, 25, t(7, 7, 8, 8, 8, 6)),
  q('inter', 'mihajlovic_04', 'Siniša Mihajlović', 1969, 'Serbia', ['CB'], 79, 79, 2006, 25, t(7, 7, 8, 7, 8, 6)),
  q('inter', 'favalli_04', 'Giuseppe Favalli', 1972, 'Italy', ['LB', 'CB'], 79, 79, 2007, 25, t(8, 4, 7, 8, 4, 7)),
  q('inter', 'van_der_meyde', 'Andy van der Meyde', 1979, 'Netherlands', ['RW'], 77, 79, 2008, 30, t(5, 7, 7, 6, 7, 7)),
  q('inter', 'cambiasso_04', 'Esteban Cambiasso', 1980, 'Argentina', ['DM', 'CM'], 83, 86, 2009, 20, t(9, 6, 9, 8, 5, 7)),
  q('inter', 'veron_04', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM', 'AM'], 83, 84, 2007, 25, t(8, 6, 8, 6, 5, 7)),
  q('inter', 'stankovic_04', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 82, 84, 2009, 25, t(8, 6, 8, 8, 5, 7)),
  q('inter', 'emre_04', 'Emre Belözoğlu', 1980, 'Turkey', ['CM', 'AM'], 80, 83, 2008, 30, t(6, 7, 8, 6, 7, 7)),
  q('inter', 'kily_gonzalez', 'Kily González', 1974, 'Argentina', ['LW', 'LB'], 78, 79, 2007, 25, t(7, 6, 8, 7, 6, 7)),
  q('inter', 'adriano_04', 'Adriano', 1982, 'Brazil', ['ST'], 86, 91, 2009, 25, t(5, 7, 8, 7, 7, 7)),
  q('inter', 'vieri_04', 'Christian Vieri', 1973, 'Italy', ['ST'], 83, 83, 2005, 30, t(6, 7, 8, 6, 6, 7)),
  q('inter', 'recoba', 'Álvaro Recoba', 1976, 'Uruguay', ['AM', 'ST'], 81, 82, 2008, 30, t(5, 7, 7, 7, 7, 7)),
  q('inter', 'cruz_04', 'Julio Cruz', 1974, 'Argentina', ['ST'], 79, 80, 2008, 25, t(8, 6, 8, 8, 5, 7)),
  q('inter', 'martins_04', 'Obafemi Martins', 1984, 'Nigeria', ['ST'], 77, 84, 2009, 25, t(6, 6, 8, 7, 6, 7)),
];

// ── Juventus, 2004–05 (Capello; the last title before Calciopoli) ─────────────
export const JUVENTUS_2004: CuratedSeed[] = [
  q('juventus', 'buffon_04', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 89, 90, 2009, 20, t(10, 6, 9, 9, 4, 7), { loyalty: 95 }),
  q('juventus', 'thuram_04', 'Lilian Thuram', 1972, 'France', ['CB', 'RB'], 85, 85, 2006, 20, t(9, 5, 9, 8, 4, 7)),
  q('juventus', 'cannavaro_f04', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 86, 88, 2007, 20, t(9, 6, 9, 8, 5, 7)),
  q('juventus', 'zambrotta_04', 'Gianluca Zambrotta', 1977, 'Italy', ['RB', 'LB'], 84, 86, 2008, 20, t(9, 5, 8, 8, 5, 7)),
  q('juventus', 'birindelli_04', 'Alessandro Birindelli', 1974, 'Italy', ['RB'], 75, 76, 2007, 25, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'emerson_04', 'Emerson', 1976, 'Brazil', ['DM', 'CM'], 84, 85, 2007, 25, t(8, 6, 8, 7, 5, 7)),
  q('juventus', 'nedved_04', 'Pavel Nedvěd', 1972, 'Czechia', ['AM', 'LW'], 86, 87, 2007, 20, t(10, 6, 9, 8, 4, 8)),
  q('juventus', 'camoranesi_04', 'Mauro Camoranesi', 1976, 'Italy', ['RW'], 81, 82, 2008, 25, t(8, 6, 8, 7, 6, 7)),
  q('juventus', 'tacchinardi_04', 'Alessio Tacchinardi', 1975, 'Italy', ['DM', 'CM'], 79, 80, 2007, 30, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'appiah_04', 'Stephen Appiah', 1980, 'Ghana', ['CM', 'DM'], 78, 81, 2008, 25, t(8, 5, 8, 7, 5, 7)),
  q('juventus', 'delpiero_04', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 86, 86, 2008, 30, t(9, 6, 9, 10, 4, 7), { loyalty: 98 }),
  q('juventus', 'trezeguet_04', 'David Trezeguet', 1977, 'France', ['ST'], 85, 86, 2008, 30, t(8, 6, 8, 8, 5, 7)),
  q('juventus', 'ibrahimovic_04', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 84, 90, 2009, 20, t(7, 9, 9, 6, 6, 7)),
  q('juventus', 'zalayeta_04', 'Marcelo Zalayeta', 1978, 'Uruguay', ['ST'], 76, 77, 2007, 25, t(7, 5, 7, 7, 5, 7)),
];

// ── AC Milan, 2004–05 (Ancelotti; the side that would lose Istanbul) ───────────
export const MILAN_2004: CuratedSeed[] = [
  q('milan', 'dida_04', 'Dida', 1973, 'Brazil', ['GK'], 85, 85, 2008, 20, t(8, 6, 8, 8, 5, 6)),
  q('milan', 'cafu_04', 'Cafu', 1970, 'Brazil', ['RB'], 84, 84, 2007, 25, t(9, 6, 8, 8, 4, 8)),
  q('milan', 'nesta_04', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 88, 89, 2009, 25, t(9, 5, 8, 9, 4, 7), { loyalty: 92 }),
  q('milan', 'stam_04', 'Jaap Stam', 1972, 'Netherlands', ['CB'], 84, 84, 2006, 25, t(9, 6, 8, 8, 4, 7)),
  q('milan', 'maldini_04', 'Paolo Maldini', 1968, 'Italy', ['CB', 'LB'], 86, 86, 2007, 25, t(10, 6, 9, 10, 3, 7), { loyalty: 99, hardBlocks: [{ reason: 'Paolo Maldini is Milan for life.', untilYear: 2099 }] }),
  q('milan', 'kaladze_04', 'Kakha Kaladze', 1978, 'Georgia', ['CB', 'LB'], 81, 82, 2008, 25, t(8, 5, 8, 8, 5, 7)),
  q('milan', 'gattuso_04', 'Gennaro Gattuso', 1978, 'Italy', ['DM', 'CM'], 83, 84, 2008, 25, t(9, 7, 9, 9, 7, 7), { loyalty: 92 }),
  q('milan', 'pirlo_04', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'CM'], 86, 88, 2009, 20, t(9, 6, 9, 8, 4, 8)),
  q('milan', 'seedorf_04', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 85, 86, 2008, 20, t(8, 7, 8, 8, 5, 8)),
  q('milan', 'rui_costa_04', 'Manuel Rui Costa', 1972, 'Portugal', ['AM'], 82, 82, 2006, 20, t(8, 6, 8, 7, 4, 8)),
  q('milan', 'kaka_04', 'Kaká', 1982, 'Brazil', ['AM'], 88, 93, 2010, 20, t(9, 6, 9, 8, 4, 8), { loyalty: 90 }),
  q('milan', 'shevchenko_04', 'Andriy Shevchenko', 1976, 'Ukraine', ['ST'], 89, 90, 2009, 25, t(9, 6, 9, 8, 4, 8)),
  q('milan', 'crespo_04', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 85, 86, 2008, 25, t(8, 7, 9, 7, 5, 7)),
  q('milan', 'tomasson', 'Jon Dahl Tomasson', 1976, 'Denmark', ['ST', 'AM'], 80, 81, 2007, 25, t(8, 5, 8, 7, 5, 7)),
];

// ── AS Roma, 2004–05 (Totti and Cassano) ──────────────────────────────────────
export const ROMA_2004: CuratedSeed[] = [
  q('roma', 'pelizzoli', 'Ivan Pelizzoli', 1980, 'Italy', ['GK'], 76, 78, 2008, 25, t(7, 5, 7, 8, 5, 6)),
  q('roma', 'panucci_04', 'Christian Panucci', 1973, 'Italy', ['CB', 'RB'], 81, 81, 2007, 25, t(8, 6, 8, 7, 5, 7)),
  q('roma', 'mexes_04', 'Philippe Mexès', 1982, 'France', ['CB'], 80, 84, 2009, 25, t(7, 6, 8, 7, 6, 7)),
  q('roma', 'ferrari_r', 'Matteo Ferrari', 1979, 'Italy', ['CB'], 78, 80, 2008, 25, t(8, 5, 7, 7, 5, 7)),
  q('roma', 'dellas', 'Traianos Dellas', 1976, 'Greece', ['CB'], 77, 78, 2007, 25, t(8, 5, 7, 7, 5, 6)),
  q('roma', 'chivu_r', 'Cristian Chivu', 1980, 'Romania', ['CB', 'LB'], 80, 83, 2008, 25, t(8, 5, 8, 7, 5, 7)),
  q('roma', 'dacourt', 'Olivier Dacourt', 1974, 'France', ['DM', 'CM'], 80, 81, 2007, 25, t(8, 6, 8, 7, 6, 7)),
  q('roma', 'de_rossi_04', 'Daniele De Rossi', 1983, 'Italy', ['DM', 'CM'], 79, 88, 2009, 20, t(9, 6, 9, 10, 6, 7), { loyalty: 96 }),
  q('roma', 'perrotta_04', 'Simone Perrotta', 1977, 'Italy', ['CM', 'AM'], 78, 80, 2008, 25, t(8, 5, 8, 8, 4, 7)),
  q('roma', 'mancini_04', 'Mancini', 1980, 'Brazil', ['RW', 'AM'], 80, 83, 2008, 25, t(6, 7, 7, 6, 6, 7)),
  q('roma', 'totti_04', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 88, 89, 2010, 25, t(9, 7, 8, 10, 5, 7), { loyalty: 99, hardBlocks: [{ reason: 'Francesco Totti is Roma, il capitano, for life.', untilYear: 2099 }] }),
  q('roma', 'cassano_04', 'Antonio Cassano', 1982, 'Italy', ['AM', 'ST'], 83, 88, 2008, 25, t(4, 9, 7, 6, 9, 6)),
  q('roma', 'montella_04', 'Vincenzo Montella', 1974, 'Italy', ['ST'], 81, 81, 2007, 30, t(8, 6, 8, 8, 5, 7)),
];

// ── Serie A supporting cast (real, lighter) ───────────────────────────────────
export const FIORENTINA_2004: CuratedSeed[] = [
  q('fiorentina', 'lupatelli', 'Cristiano Lupatelli', 1978, 'Italy', ['GK'], 74, 75, 2007, 25, t(7, 5, 6, 7, 5, 6)),
  q('fiorentina', 'ujfalusi', 'Tomáš Ujfaluši', 1978, 'Czechia', ['CB', 'RB'], 79, 81, 2008, 25, t(8, 5, 8, 7, 5, 7)),
  q('fiorentina', 'di_livio_04', 'Angelo Di Livio', 1966, 'Italy', ['RW', 'CM'], 74, 74, 2005, 25, t(9, 4, 7, 9, 4, 7)),
  q('fiorentina', 'fiore', 'Stefano Fiore', 1975, 'Italy', ['AM', 'CM'], 78, 79, 2007, 25, t(8, 5, 7, 7, 5, 7)),
  q('fiorentina', 'jorgensen_04', 'Martin Jørgensen', 1975, 'Denmark', ['RW', 'AM'], 78, 79, 2007, 25, t(8, 5, 7, 7, 5, 7)),
  q('fiorentina', 'miccoli', 'Fabrizio Miccoli', 1979, 'Italy', ['ST'], 78, 80, 2007, 25, t(7, 6, 8, 7, 6, 7)),
  q('fiorentina', 'toni_04', 'Luca Toni', 1977, 'Italy', ['ST'], 82, 86, 2008, 25, t(8, 6, 8, 7, 5, 7)),
];
export const LAZIO_2004: CuratedSeed[] = [
  q('lazio', 'peruzzi_04', 'Angelo Peruzzi', 1970, 'Italy', ['GK'], 82, 82, 2007, 25, t(8, 6, 8, 8, 5, 6)),
  q('lazio', 'couto', 'Fernando Couto', 1969, 'Portugal', ['CB'], 78, 78, 2006, 25, t(8, 5, 7, 8, 5, 6)),
  q('lazio', 'oddo_04', 'Massimo Oddo', 1976, 'Italy', ['RB'], 79, 80, 2007, 25, t(8, 5, 7, 8, 4, 7)),
  q('lazio', 'liverani_04', 'Fabio Liverani', 1976, 'Italy', ['CM'], 78, 79, 2007, 25, t(8, 5, 7, 7, 5, 7)),
  q('lazio', 'zauri', 'Luciano Zauri', 1978, 'Italy', ['LB', 'LW'], 76, 78, 2007, 25, t(8, 4, 7, 7, 5, 7)),
  q('lazio', 'rocchi_04', 'Tommaso Rocchi', 1977, 'Italy', ['ST'], 78, 79, 2008, 25, t(8, 5, 8, 9, 5, 7)),
  q('lazio', 'di_canio', 'Paolo Di Canio', 1968, 'Italy', ['ST', 'AM'], 78, 78, 2006, 30, t(6, 8, 7, 7, 8, 6)),
];

// ── The elite of Europe, 2004–05 — full squads so every real European Cup of the
//    span (2005–2019) is anchored to a side that exists. ───────────────────────
export const REAL_MADRID_2004: CuratedSeed[] = [
  q('real_madrid', 'casillas_04', 'Iker Casillas', 1981, 'Spain', ['GK'], 87, 90, 2010, 15, t(9, 6, 9, 10, 4, 7), { loyalty: 95 }),
  q('real_madrid', 'salgado', 'Míchel Salgado', 1975, 'Spain', ['RB'], 80, 81, 2008, 25, t(8, 5, 8, 8, 5, 7)),
  q('real_madrid', 'helguera', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 82, 82, 2007, 25, t(8, 6, 8, 8, 5, 7)),
  q('real_madrid', 'samuel_04', 'Walter Samuel', 1978, 'Argentina', ['CB'], 83, 85, 2008, 25, t(8, 6, 8, 7, 6, 7)),
  q('real_madrid', 'roberto_carlos_04', 'Roberto Carlos', 1973, 'Brazil', ['LB', 'LW'], 85, 85, 2007, 20, t(8, 7, 9, 8, 5, 8)),
  q('real_madrid', 'zidane_04', 'Zinédine Zidane', 1972, 'France', ['AM', 'CM'], 90, 90, 2006, 20, t(9, 6, 9, 8, 4, 8)),
  q('real_madrid', 'figo_04', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 85, 85, 2005, 20, t(8, 7, 8, 7, 4, 8)),
  q('real_madrid', 'beckham_04', 'David Beckham', 1975, 'England', ['RW', 'CM'], 84, 85, 2007, 15, t(9, 7, 9, 7, 4, 7)),
  q('real_madrid', 'guti_04', 'Guti', 1976, 'Spain', ['AM', 'CM'], 82, 83, 2008, 25, t(6, 7, 7, 8, 6, 7)),
  q('real_madrid', 'raul_04', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 86, 86, 2009, 20, t(9, 6, 9, 10, 4, 7), { loyalty: 96 }),
  q('real_madrid', 'ronaldo_r04', 'Ronaldo', 1976, 'Brazil', ['ST'], 88, 88, 2007, 35, t(5, 8, 8, 6, 7, 8)),
  q('real_madrid', 'owen_04', 'Michael Owen', 1979, 'England', ['ST'], 84, 85, 2008, 30, t(9, 6, 9, 8, 4, 7)),
  q('real_madrid', 'morientes_04', 'Fernando Morientes', 1976, 'Spain', ['ST'], 82, 83, 2007, 25, t(8, 6, 8, 8, 4, 7)),
  q('real_madrid', 'gravesen', 'Thomas Gravesen', 1976, 'Denmark', ['DM', 'CM'], 79, 80, 2008, 25, t(7, 6, 8, 7, 6, 7)),
];

export const BARCELONA_2004: CuratedSeed[] = [
  q('barcelona', 'valdes_04', 'Víctor Valdés', 1982, 'Spain', ['GK'], 84, 88, 2010, 15, t(8, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('barcelona', 'belletti', 'Juliano Belletti', 1976, 'Brazil', ['RB'], 80, 81, 2008, 20, t(8, 5, 8, 7, 5, 7)),
  q('barcelona', 'puyol_04', 'Carles Puyol', 1978, 'Spain', ['CB', 'RB'], 86, 87, 2010, 20, t(10, 5, 9, 10, 4, 7), { loyalty: 96 }),
  q('barcelona', 'marquez_04', 'Rafael Márquez', 1979, 'Mexico', ['CB', 'DM'], 82, 84, 2009, 25, t(8, 6, 8, 7, 5, 7)),
  q('barcelona', 'van_bronckhorst_04', 'Giovanni van Bronckhorst', 1975, 'Netherlands', ['LB', 'CM'], 80, 81, 2007, 20, t(9, 5, 8, 7, 4, 8)),
  q('barcelona', 'xavi_04', 'Xavi', 1980, 'Spain', ['CM'], 85, 91, 2010, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'deco_04', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 86, 87, 2008, 25, t(8, 6, 8, 7, 5, 7)),
  q('barcelona', 'iniesta_04', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 78, 93, 2010, 20, t(10, 4, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'giuly', 'Ludovic Giuly', 1976, 'France', ['RW'], 81, 82, 2008, 25, t(8, 6, 8, 7, 5, 7)),
  q('barcelona', 'ronaldinho_04', 'Ronaldinho', 1980, 'Brazil', ['AM', 'LW'], 91, 93, 2010, 25, t(6, 7, 8, 7, 6, 8)),
  q('barcelona', 'etoo_04', 'Samuel Eto’o', 1981, 'Cameroon', ['ST'], 87, 89, 2009, 25, t(7, 8, 9, 6, 6, 7)),
  q('barcelona', 'larsson_04', 'Henrik Larsson', 1971, 'Sweden', ['ST'], 83, 83, 2006, 25, t(9, 6, 9, 8, 4, 7)),
  q('barcelona', 'messi_04', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 70, 99, 2012, 15, t(10, 6, 10, 10, 3, 8), { loyalty: 96 }),
];

export const BAYERN_2004: CuratedSeed[] = [
  q('bayern', 'kahn_04', 'Oliver Kahn', 1969, 'Germany', ['GK'], 87, 87, 2008, 15, t(10, 7, 9, 9, 5, 7), { loyalty: 92 }),
  q('bayern', 'sagnol_04', 'Willy Sagnol', 1977, 'France', ['RB'], 81, 82, 2008, 25, t(8, 5, 8, 8, 4, 7)),
  q('bayern', 'lucio_04', 'Lúcio', 1978, 'Brazil', ['CB'], 84, 85, 2008, 25, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'kovac_r', 'Robert Kovač', 1974, 'Croatia', ['CB'], 79, 80, 2007, 25, t(8, 5, 7, 8, 5, 6)),
  q('bayern', 'lizarazu_04', 'Bixente Lizarazu', 1969, 'France', ['LB'], 81, 81, 2006, 20, t(9, 5, 8, 8, 4, 8)),
  q('bayern', 'ballack_04', 'Michael Ballack', 1976, 'Germany', ['CM', 'AM'], 87, 88, 2006, 25, t(8, 7, 9, 7, 5, 7)),
  q('bayern', 'hargreaves_04', 'Owen Hargreaves', 1981, 'England', ['DM', 'CM'], 80, 84, 2007, 40, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'ze_roberto_04', 'Zé Roberto', 1974, 'Brazil', ['CM', 'LW'], 83, 83, 2007, 25, t(9, 5, 8, 7, 4, 8)),
  q('bayern', 'schweinsteiger_04', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'RW'], 74, 89, 2010, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 92 }),
  q('bayern', 'salihamidzic_04', 'Hasan Salihamidžić', 1977, 'Bosnia', ['RW', 'CM'], 80, 81, 2007, 20, t(9, 5, 8, 8, 4, 7)),
  q('bayern', 'makaay_04', 'Roy Makaay', 1975, 'Netherlands', ['ST'], 84, 85, 2008, 25, t(9, 6, 8, 8, 4, 7)),
  q('bayern', 'pizarro_04', 'Claudio Pizarro', 1978, 'Peru', ['ST'], 82, 83, 2007, 25, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'santa_cruz', 'Roque Santa Cruz', 1981, 'Paraguay', ['ST'], 78, 82, 2007, 35, t(8, 5, 8, 7, 5, 7)),
];

export const MANUTD_2004: CuratedSeed[] = [
  q('man_utd', 'howard_04', 'Tim Howard', 1979, 'United States', ['GK'], 80, 83, 2008, 20, t(8, 5, 8, 8, 5, 7)),
  q('man_utd', 'g_neville_04', 'Gary Neville', 1975, 'England', ['RB'], 82, 82, 2008, 25, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('man_utd', 'ferdinand_04', 'Rio Ferdinand', 1978, 'England', ['CB'], 86, 88, 2009, 20, t(8, 6, 8, 8, 4, 7)),
  q('man_utd', 'silvestre', 'Mikaël Silvestre', 1977, 'France', ['CB', 'LB'], 80, 81, 2008, 25, t(8, 5, 7, 8, 5, 7)),
  q('man_utd', 'heinze_04', 'Gabriel Heinze', 1978, 'Argentina', ['LB', 'CB'], 82, 83, 2008, 25, t(8, 6, 8, 7, 7, 7)),
  q('man_utd', 'cristiano_04', 'Cristiano Ronaldo', 1985, 'Portugal', ['RW', 'LW'], 82, 96, 2009, 15, t(9, 8, 10, 7, 4, 8)),
  q('man_utd', 'keane_04', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 84, 84, 2006, 25, t(9, 8, 10, 9, 8, 6), { loyalty: 90 }),
  q('man_utd', 'scholes_04', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 85, 86, 2008, 20, t(9, 5, 8, 10, 4, 7), { loyalty: 96 }),
  q('man_utd', 'giggs_04', 'Ryan Giggs', 1973, 'Wales', ['LW'], 85, 85, 2008, 20, t(9, 6, 9, 10, 4, 8), { loyalty: 97 }),
  q('man_utd', 'fletcher_04', 'Darren Fletcher', 1984, 'Scotland', ['CM'], 74, 83, 2009, 20, t(9, 5, 8, 9, 4, 7)),
  q('man_utd', 'rooney_04', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 84, 91, 2010, 20, t(8, 7, 9, 8, 7, 8)),
  q('man_utd', 'van_nistelrooy_04', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 88, 88, 2007, 25, t(9, 7, 9, 7, 4, 7)),
  q('man_utd', 'smith_04', 'Alan Smith', 1980, 'England', ['ST', 'CM'], 79, 81, 2008, 25, t(8, 6, 8, 8, 6, 7)),
];

export const LIVERPOOL_2004: CuratedSeed[] = [
  q('liverpool', 'dudek', 'Jerzy Dudek', 1973, 'Poland', ['GK'], 80, 81, 2007, 25, t(7, 6, 7, 8, 6, 6)),
  q('liverpool', 'finnan', 'Steve Finnan', 1976, 'Ireland', ['RB'], 80, 81, 2008, 20, t(9, 4, 8, 8, 4, 7)),
  q('liverpool', 'carragher_04', 'Jamie Carragher', 1978, 'England', ['CB'], 84, 85, 2009, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'hyypia', 'Sami Hyypiä', 1973, 'Finland', ['CB'], 84, 84, 2007, 20, t(9, 5, 8, 9, 4, 7)),
  q('liverpool', 'traore', 'Djimi Traoré', 1980, 'France', ['LB', 'CB'], 74, 76, 2008, 25, t(7, 5, 7, 7, 6, 7)),
  q('liverpool', 'gerrard_04', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 88, 90, 2008, 20, t(9, 7, 9, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'alonso_04', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 84, 88, 2009, 20, t(9, 5, 8, 8, 4, 8)),
  q('liverpool', 'hamann', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 81, 81, 2007, 25, t(8, 5, 8, 7, 5, 7)),
  q('liverpool', 'luis_garcia', 'Luis García', 1978, 'Spain', ['AM', 'RW'], 81, 83, 2008, 25, t(7, 6, 8, 7, 5, 8)),
  q('liverpool', 'riise_04', 'John Arne Riise', 1980, 'Norway', ['LB', 'LW'], 80, 81, 2008, 25, t(8, 5, 8, 8, 4, 7)),
  q('liverpool', 'baros', 'Milan Baroš', 1981, 'Czechia', ['ST'], 79, 82, 2008, 25, t(7, 6, 8, 7, 6, 7)),
  q('liverpool', 'cisse', 'Djibril Cissé', 1981, 'France', ['ST'], 79, 83, 2009, 30, t(6, 7, 8, 6, 6, 7)),
  q('liverpool', 'kewell', 'Harry Kewell', 1978, 'Australia', ['LW', 'ST'], 80, 83, 2008, 35, t(7, 6, 8, 7, 6, 7)),
];

export const CHELSEA_2004: CuratedSeed[] = [
  q('chelsea', 'cech_04', 'Petr Čech', 1982, 'Czechia', ['GK'], 87, 90, 2010, 15, t(9, 6, 8, 9, 4, 7)),
  q('chelsea', 'ferreira_04', 'Paulo Ferreira', 1979, 'Portugal', ['RB', 'CB'], 80, 81, 2008, 25, t(8, 5, 8, 8, 4, 7)),
  q('chelsea', 'terry_04', 'John Terry', 1980, 'England', ['CB'], 86, 88, 2009, 20, t(9, 7, 9, 10, 6, 7), { loyalty: 95 }),
  q('chelsea', 'carvalho_04', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 84, 86, 2009, 20, t(8, 6, 8, 8, 5, 7)),
  q('chelsea', 'gallas', 'William Gallas', 1977, 'France', ['CB', 'LB'], 83, 84, 2008, 25, t(8, 6, 8, 7, 6, 7)),
  q('chelsea', 'makelele_04', 'Claude Makélélé', 1973, 'France', ['DM'], 84, 84, 2008, 20, t(9, 5, 8, 8, 4, 7)),
  q('chelsea', 'lampard_04', 'Frank Lampard', 1978, 'England', ['CM', 'AM'], 87, 89, 2009, 15, t(10, 6, 9, 9, 4, 7), { loyalty: 92 }),
  q('chelsea', 'tiago', 'Tiago', 1981, 'Portugal', ['CM', 'DM'], 79, 82, 2008, 25, t(8, 5, 8, 7, 5, 7)),
  q('chelsea', 'duff', 'Damien Duff', 1979, 'Ireland', ['LW', 'RW'], 83, 84, 2008, 25, t(8, 6, 8, 8, 5, 8)),
  q('chelsea', 'robben_04', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 83, 89, 2009, 35, t(8, 7, 9, 7, 5, 7)),
  q('chelsea', 'j_cole_04', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 81, 84, 2008, 25, t(7, 6, 8, 8, 5, 8)),
  q('chelsea', 'drogba_04', 'Didier Drogba', 1978, 'Ivory Coast', ['ST'], 85, 89, 2009, 25, t(8, 7, 9, 8, 6, 7)),
  q('chelsea', 'gudjohnsen_04', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 82, 82, 2008, 25, t(8, 6, 8, 7, 5, 7)),
  q('chelsea', 'kezman', 'Mateja Kežman', 1979, 'Serbia', ['ST'], 78, 80, 2008, 25, t(7, 6, 8, 6, 6, 7)),
];

// ── European context (light — present so the reality-anchored Cup has a field
//    and every real winner/finalist exists) ────────────────────────────────────
export const DORTMUND_2004: CuratedSeed[] = [
  q('dortmund', 'weidenfeller_04', 'Roman Weidenfeller', 1980, 'Germany', ['GK'], 78, 82, 2009, 20, t(9, 5, 8, 9, 5, 6), { loyalty: 90 }),
  q('dortmund', 'rosicky', 'Tomáš Rosický', 1980, 'Czechia', ['AM', 'CM'], 83, 85, 2008, 30, t(8, 6, 8, 7, 5, 8)),
  q('dortmund', 'frings', 'Torsten Frings', 1976, 'Germany', ['DM', 'CM'], 82, 83, 2007, 25, t(8, 6, 8, 7, 5, 7)),
  q('dortmund', 'koller', 'Jan Koller', 1973, 'Czechia', ['ST'], 80, 81, 2007, 25, t(8, 5, 8, 7, 5, 7)),
  q('dortmund', 'kehl_04', 'Sebastian Kehl', 1980, 'Germany', ['DM', 'CM'], 79, 81, 2008, 25, t(8, 5, 8, 8, 5, 7)),
  q('dortmund', 'evanilson', 'Evanilson', 1975, 'Brazil', ['LB'], 76, 76, 2007, 25, t(8, 4, 7, 7, 5, 7)),
];
export const ATLETICO_2004: CuratedSeed[] = [
  q('atletico', 'perea_04', 'Luis Perea', 1979, 'Colombia', ['CB'], 79, 81, 2009, 25, t(8, 5, 8, 8, 5, 7)),
  q('atletico', 'gabi_a', 'Gabi', 1983, 'Spain', ['DM', 'CM'], 74, 82, 2009, 20, t(9, 5, 8, 9, 5, 7)),
  q('atletico', 'maxi_04', 'Maxi Rodríguez', 1981, 'Argentina', ['RW', 'AM'], 80, 82, 2008, 25, t(8, 6, 8, 7, 5, 7)),
  q('atletico', 'torres_a04', 'Fernando Torres', 1984, 'Spain', ['ST'], 83, 90, 2009, 25, t(8, 6, 9, 9, 5, 8), { loyalty: 88 }),
  q('atletico', 'ibagaza', 'Ariel Ibagaza', 1976, 'Argentina', ['AM'], 78, 79, 2007, 25, t(7, 6, 7, 7, 5, 7)),
  q('atletico', 'jorge_a', 'Jorge', 1979, 'Brazil', ['LB'], 75, 76, 2007, 25, t(7, 5, 7, 7, 5, 7)),
];
export const VALENCIA_2004: CuratedSeed[] = [
  q('valencia', 'canizares_04', 'Santiago Cañizares', 1969, 'Spain', ['GK'], 84, 84, 2007, 20, t(9, 6, 8, 8, 5, 6)),
  q('valencia', 'ayala_v', 'Roberto Ayala', 1973, 'Argentina', ['CB'], 85, 85, 2007, 20, t(9, 6, 8, 8, 5, 7)),
  q('valencia', 'baraja', 'Rubén Baraja', 1975, 'Spain', ['CM', 'DM'], 82, 83, 2008, 25, t(9, 5, 8, 8, 5, 7)),
  q('valencia', 'vicente', 'Vicente', 1981, 'Spain', ['LW'], 83, 85, 2009, 30, t(8, 6, 8, 8, 5, 8)),
  q('valencia', 'aimar_v', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 83, 85, 2008, 30, t(7, 6, 8, 7, 5, 8)),
  q('valencia', 'villa_v', 'David Villa', 1981, 'Spain', ['ST'], 82, 89, 2009, 20, t(9, 6, 9, 8, 5, 8)),
];

/** The full Inter-2004 curated universe: Serie A + the elite of Europe (full
 *  squads) and a light continental context so every real European Cup of the
 *  2005–2019 span is anchored to a side that exists. */
export const INTER_2004_SQUADS: Record<string, CuratedSeed[]> = {
  inter: INTER_2004,
  juventus: JUVENTUS_2004,
  milan: MILAN_2004,
  roma: ROMA_2004,
  fiorentina: FIORENTINA_2004,
  lazio: LAZIO_2004,
  real_madrid: REAL_MADRID_2004,
  barcelona: BARCELONA_2004,
  bayern: BAYERN_2004,
  man_utd: MANUTD_2004,
  liverpool: LIVERPOOL_2004,
  chelsea: CHELSEA_2004,
  dortmund: DORTMUND_2004,
  atletico: ATLETICO_2004,
  valencia: VALENCIA_2004,
};
