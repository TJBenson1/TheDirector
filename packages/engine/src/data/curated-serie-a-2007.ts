/**
 * Curated real players — 2007 Serie A "Last Dance Before the Fall" pack (Italy).
 *
 * The vertical slice for "AC Milan — 2007: Last Dance Before the Fall". Milan have
 * just won the 2007 Champions League in Athens (revenge for Istanbul), but the
 * side is the oldest in Europe: Maldini at 39, Cafu at 37, Costacurta retiring,
 * Nesta/Seedorf/Gattuso/Pirlo/Inzaghi all past thirty, a broken-down Ronaldo, and
 * only Kaká and the teenage Pato pointing forward. Reality: one more Club World
 * Cup, then a slow decline into the 2012 austerity fire-sale (Ibrahimović and
 * Thiago Silva to PSG) and years in the wilderness. The counterfactual: rebuild
 * around Kaká and Pato before the fall.
 *
 * Around Milan, the late-2000s calcio: Mourinho-to-be's champion Inter, Juventus
 * back from Serie B, Totti's Roma, and the elite of Europe whose real European
 * Cups (2008–2022) are anchored. Ability/potential/personality are HIDDEN designer
 * estimates (§7); clubs, birth years, positions and contracts are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { EUROPE_2007_SQUADS } from './curated-europe-2007.js';

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

// ── AC Milan, 2007–08 (European champions; the oldest side in Europe) ──────────
export const MILAN_2007: CuratedSeed[] = [
  q('milan', 'dida', 'Dida', 1973, 'Brazil', ['GK'], 84, 84, 2010, 20, t(8, 6, 7, 8, 5, 6)),
  q('milan', 'kalac', 'Zeljko Kalac', 1972, 'Australia', ['GK'], 76, 76, 2009, 20, t(7, 5, 6, 7, 5, 6)),
  q('milan', 'maldini_m07', 'Paolo Maldini', 1968, 'Italy', ['CB', 'LB'], 85, 85, 2009, 25, t(10, 6, 9, 10, 3, 7), { loyalty: 99, hardBlocks: [{ reason: 'Paolo Maldini is Milan for life.', untilYear: 2099 }] }),
  q('milan', 'nesta_07', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 87, 87, 2011, 30, t(9, 5, 8, 9, 4, 7), { loyalty: 92 }),
  q('milan', 'cafu_07', 'Cafu', 1970, 'Brazil', ['RB'], 82, 82, 2008, 25, t(9, 6, 8, 8, 4, 8)),
  q('milan', 'jankulovski', 'Marek Jankulovski', 1977, 'Czechia', ['LB', 'LW'], 80, 81, 2010, 25, t(8, 5, 7, 8, 4, 7)),
  q('milan', 'oddo', 'Massimo Oddo', 1976, 'Italy', ['RB'], 79, 80, 2010, 25, t(8, 5, 7, 8, 4, 7)),
  q('milan', 'kaladze_07', 'Kakha Kaladze', 1978, 'Georgia', ['CB', 'LB'], 81, 82, 2010, 25, t(8, 5, 8, 8, 5, 7)),
  q('milan', 'bonera', 'Daniele Bonera', 1981, 'Italy', ['CB', 'RB'], 77, 79, 2011, 25, t(7, 5, 7, 8, 5, 7)),
  q('milan', 'favalli_07', 'Giuseppe Favalli', 1972, 'Italy', ['LB', 'CB'], 76, 76, 2009, 25, t(8, 4, 7, 8, 4, 7)),
  q('milan', 'pirlo_07', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'CM'], 87, 89, 2011, 20, t(9, 6, 9, 8, 4, 8)),
  q('milan', 'gattuso_07', 'Gennaro Gattuso', 1978, 'Italy', ['DM', 'CM'], 83, 84, 2011, 25, t(9, 7, 9, 9, 7, 7), { loyalty: 92 }),
  q('milan', 'seedorf_07', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 85, 85, 2010, 20, t(8, 7, 8, 8, 5, 8)),
  q('milan', 'ambrosini_07', 'Massimo Ambrosini', 1977, 'Italy', ['CM', 'DM'], 81, 82, 2011, 25, t(9, 5, 8, 10, 4, 7), { loyalty: 94 }),
  q('milan', 'emerson_07', 'Emerson', 1976, 'Brazil', ['DM', 'CM'], 81, 82, 2010, 25, t(8, 6, 8, 7, 5, 7)),
  q('milan', 'kaka_07', 'Kaká', 1982, 'Brazil', ['AM'], 91, 93, 2013, 20, t(9, 6, 9, 8, 4, 8), { loyalty: 88 }),
  q('milan', 'inzaghi_07', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 83, 83, 2010, 30, t(8, 7, 9, 9, 5, 7), { loyalty: 90 }),
  q('milan', 'gilardino_07', 'Alberto Gilardino', 1982, 'Italy', ['ST'], 82, 84, 2011, 25, t(8, 6, 8, 7, 5, 7)),
  q('milan', 'ronaldo_r07', 'Ronaldo', 1976, 'Brazil', ['ST'], 80, 80, 2008, 55, t(5, 8, 7, 6, 7, 7)),
  q('milan', 'pato_07', 'Alexandre Pato', 1989, 'Brazil', ['ST'], 76, 90, 2013, 40, t(7, 6, 8, 7, 6, 8)),
];

// ── Internazionale, 2007–08 (Serie A champions; Mourinho about to arrive) ─────
export const INTER_2007: CuratedSeed[] = [
  q('inter', 'julio_cesar', 'Júlio César', 1979, 'Brazil', ['GK'], 86, 88, 2012, 20, t(9, 6, 8, 8, 4, 7)),
  q('inter', 'maicon_07', 'Maicon', 1981, 'Brazil', ['RB'], 85, 87, 2012, 20, t(8, 6, 8, 7, 5, 7)),
  q('inter', 'materazzi', 'Marco Materazzi', 1973, 'Italy', ['CB'], 82, 82, 2010, 25, t(7, 7, 8, 8, 8, 6)),
  q('inter', 'cordoba', 'Iván Córdoba', 1976, 'Colombia', ['CB'], 81, 82, 2011, 25, t(8, 5, 8, 8, 5, 7)),
  q('inter', 'chivu', 'Cristian Chivu', 1980, 'Romania', ['CB', 'LB'], 81, 83, 2011, 25, t(8, 5, 8, 7, 5, 7)),
  q('inter', 'zanetti_07', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 85, 86, 2011, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 97 }),
  q('inter', 'maxwell_07', 'Maxwell', 1981, 'Brazil', ['LB'], 80, 82, 2011, 20, t(8, 5, 8, 8, 4, 7)),
  q('inter', 'cambiasso', 'Esteban Cambiasso', 1980, 'Argentina', ['DM', 'CM'], 85, 86, 2012, 20, t(9, 6, 9, 8, 5, 7)),
  q('inter', 'vieira_07', 'Patrick Vieira', 1976, 'France', ['CM', 'DM'], 82, 83, 2010, 25, t(8, 7, 8, 7, 5, 7)),
  q('inter', 'stankovic_07', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 82, 83, 2011, 25, t(8, 6, 8, 8, 5, 7)),
  q('inter', 'figo_07', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 82, 82, 2009, 25, t(8, 7, 8, 7, 4, 8)),
  q('inter', 'ibrahimovic_07', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 87, 90, 2012, 20, t(8, 9, 9, 6, 6, 7)),
  q('inter', 'cruz_07', 'Julio Cruz', 1974, 'Argentina', ['ST'], 79, 79, 2009, 25, t(8, 6, 8, 8, 5, 7)),
  q('inter', 'suazo', 'David Suazo', 1979, 'Honduras', ['ST'], 80, 81, 2011, 25, t(7, 6, 8, 7, 5, 7)),
  q('inter', 'balotelli_07', 'Mario Balotelli', 1990, 'Italy', ['ST'], 68, 88, 2012, 25, t(4, 9, 8, 5, 9, 6)),
];

// ── Juventus, 2007–08 (back from Serie B; Del Piero's Indian summer) ───────────
export const JUVENTUS_2007: CuratedSeed[] = [
  q('juventus', 'buffon_07', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 90, 90, 2012, 20, t(10, 6, 9, 9, 4, 7), { loyalty: 95 }),
  q('juventus', 'zebina', 'Jonathan Zebina', 1978, 'France', ['RB', 'CB'], 76, 77, 2010, 25, t(6, 6, 7, 7, 6, 6)),
  q('juventus', 'chiellini_07', 'Giorgio Chiellini', 1984, 'Italy', ['CB', 'LB'], 82, 89, 2013, 20, t(9, 6, 9, 10, 5, 7), { loyalty: 95 }),
  q('juventus', 'legrottaglie', 'Nicola Legrottaglie', 1976, 'Italy', ['CB'], 79, 80, 2010, 25, t(8, 5, 7, 8, 5, 6)),
  q('juventus', 'grygera', 'Zdeněk Grygera', 1980, 'Czechia', ['RB', 'CB'], 77, 78, 2011, 25, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'molinaro', 'Cristian Molinaro', 1983, 'Italy', ['LB'], 75, 78, 2011, 25, t(7, 5, 7, 8, 5, 7)),
  q('juventus', 'nedved_07', 'Pavel Nedvěd', 1972, 'Czechia', ['AM', 'LW'], 84, 84, 2009, 20, t(10, 6, 9, 8, 4, 8)),
  q('juventus', 'camoranesi', 'Mauro Camoranesi', 1976, 'Italy', ['RW'], 80, 81, 2010, 25, t(8, 6, 8, 7, 6, 7)),
  q('juventus', 'sissoko_07', 'Momo Sissoko', 1985, 'Mali', ['DM', 'CM'], 79, 83, 2012, 25, t(8, 5, 8, 7, 5, 7)),
  q('juventus', 'marchisio_07', 'Claudio Marchisio', 1986, 'Italy', ['CM', 'DM'], 72, 86, 2013, 20, t(9, 5, 8, 10, 4, 7), { loyalty: 92 }),
  q('juventus', 'almiron', 'Sergio Almirón', 1980, 'Argentina', ['AM', 'LW'], 74, 76, 2010, 25, t(7, 5, 7, 6, 6, 7)),
  q('juventus', 'delpiero_07', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 85, 85, 2010, 30, t(9, 6, 9, 10, 4, 7), { loyalty: 98 }),
  q('juventus', 'trezeguet_07', 'David Trezeguet', 1977, 'France', ['ST'], 84, 85, 2010, 30, t(8, 6, 8, 8, 5, 7)),
  q('juventus', 'iaquinta', 'Vincenzo Iaquinta', 1979, 'Italy', ['ST'], 79, 80, 2011, 25, t(8, 5, 8, 7, 5, 7)),
];

// ── AS Roma, 2007–08 (Spalletti; Totti's playmaker years) ─────────────────────
export const ROMA_2007: CuratedSeed[] = [
  q('roma', 'doni', 'Doni', 1979, 'Brazil', ['GK'], 81, 82, 2011, 25, t(8, 5, 7, 8, 5, 6)),
  q('roma', 'panucci_07', 'Christian Panucci', 1973, 'Italy', ['CB', 'RB'], 80, 80, 2009, 25, t(8, 6, 8, 7, 5, 7)),
  q('roma', 'mexes', 'Philippe Mexès', 1982, 'France', ['CB'], 82, 84, 2011, 25, t(7, 6, 8, 7, 6, 7)),
  q('roma', 'juan_r', 'Juan', 1979, 'Brazil', ['CB'], 81, 82, 2011, 25, t(8, 5, 8, 8, 5, 7)),
  q('roma', 'cassetti', 'Marco Cassetti', 1977, 'Italy', ['RB', 'CB'], 77, 78, 2010, 25, t(8, 4, 7, 8, 4, 7)),
  q('roma', 'tonetto', 'Max Tonetto', 1974, 'Italy', ['LB'], 76, 76, 2010, 25, t(8, 4, 7, 8, 4, 7)),
  q('roma', 'de_rossi', 'Daniele De Rossi', 1983, 'Italy', ['DM', 'CM'], 84, 88, 2012, 20, t(9, 6, 9, 10, 6, 7), { loyalty: 96 }),
  q('roma', 'pizarro_r', 'David Pizarro', 1979, 'Chile', ['CM', 'DM'], 82, 83, 2011, 25, t(8, 6, 8, 7, 5, 7)),
  q('roma', 'aquilani', 'Alberto Aquilani', 1984, 'Italy', ['CM', 'AM'], 79, 84, 2012, 30, t(8, 5, 8, 8, 5, 7)),
  q('roma', 'perrotta', 'Simone Perrotta', 1977, 'Italy', ['CM', 'AM'], 79, 80, 2011, 25, t(8, 5, 8, 8, 4, 7)),
  q('roma', 'taddei', 'Rodrigo Taddei', 1980, 'Brazil', ['RW', 'RB'], 78, 79, 2011, 25, t(8, 5, 7, 7, 5, 7)),
  q('roma', 'totti_07', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 88, 88, 2012, 25, t(9, 7, 8, 10, 5, 7), { loyalty: 99, hardBlocks: [{ reason: 'Francesco Totti is Roma, il capitano, for life.', untilYear: 2099 }] }),
  q('roma', 'vucinic', 'Mirko Vučinić', 1983, 'Montenegro', ['ST', 'LW'], 80, 83, 2011, 30, t(6, 6, 7, 7, 6, 7)),
  q('roma', 'mancini_r', 'Mancini', 1980, 'Brazil', ['RW', 'AM'], 80, 82, 2010, 25, t(6, 7, 7, 6, 6, 7)),
];

// ── Serie A supporting cast (real, lighter) ───────────────────────────────────
export const FIORENTINA_2007: CuratedSeed[] = [
  q('fiorentina', 'frey', 'Sébastien Frey', 1980, 'France', ['GK'], 84, 85, 2011, 25, t(8, 6, 8, 8, 5, 6)),
  q('fiorentina', 'gamberini', 'Alessandro Gamberini', 1981, 'Italy', ['CB'], 79, 81, 2011, 25, t(8, 5, 7, 8, 5, 7)),
  q('fiorentina', 'dainelli', 'Dario Dainelli', 1979, 'Italy', ['CB'], 77, 78, 2010, 25, t(8, 4, 7, 8, 5, 6)),
  q('fiorentina', 'montolivo', 'Riccardo Montolivo', 1985, 'Italy', ['CM', 'AM'], 78, 85, 2012, 20, t(8, 5, 8, 8, 4, 7)),
  q('fiorentina', 'liverani', 'Fabio Liverani', 1976, 'Italy', ['CM'], 77, 78, 2010, 25, t(8, 5, 7, 7, 5, 7)),
  q('fiorentina', 'donadel', 'Marco Donadel', 1983, 'Italy', ['DM', 'CM'], 76, 79, 2011, 25, t(8, 4, 7, 8, 5, 7)),
  q('fiorentina', 'mutu', 'Adrian Mutu', 1979, 'Romania', ['ST', 'AM'], 82, 83, 2011, 30, t(5, 8, 7, 6, 8, 7)),
  q('fiorentina', 'pazzini', 'Giampaolo Pazzini', 1984, 'Italy', ['ST'], 78, 82, 2012, 25, t(8, 6, 8, 7, 5, 7)),
  q('fiorentina', 'jorgensen', 'Martin Jørgensen', 1975, 'Denmark', ['RW', 'AM'], 77, 78, 2010, 25, t(8, 5, 7, 7, 5, 7)),
];
export const NAPOLI_2007: CuratedSeed[] = [
  q('napoli', 'iezzo', 'Gennaro Iezzo', 1973, 'Italy', ['GK'], 75, 75, 2009, 25, t(7, 5, 6, 8, 5, 6)),
  q('napoli', 'cannavaro_p07', 'Paolo Cannavaro', 1981, 'Italy', ['CB'], 78, 80, 2012, 25, t(8, 5, 7, 9, 5, 7), { loyalty: 90 }),
  q('napoli', 'gargano', 'Walter Gargano', 1984, 'Uruguay', ['DM', 'CM'], 77, 81, 2012, 25, t(8, 5, 8, 7, 5, 7)),
  q('napoli', 'hamsik', 'Marek Hamšík', 1987, 'Slovakia', ['AM', 'CM'], 76, 87, 2013, 20, t(9, 6, 9, 9, 4, 8)),
  q('napoli', 'lavezzi', 'Ezequiel Lavezzi', 1985, 'Argentina', ['LW', 'ST'], 79, 84, 2012, 25, t(7, 6, 8, 7, 6, 8)),
  q('napoli', 'zalayeta', 'Marcelo Zalayeta', 1978, 'Uruguay', ['ST'], 76, 77, 2010, 25, t(7, 5, 7, 7, 5, 7)),
  q('napoli', 'sosa_n', 'Roberto Sosa', 1970, 'Argentina', ['ST'], 74, 74, 2009, 25, t(8, 5, 7, 7, 5, 7)),
];
export const LAZIO_2007: CuratedSeed[] = [
  q('lazio', 'ballotta_07', 'Marco Ballotta', 1964, 'Italy', ['GK'], 74, 74, 2008, 25, t(8, 4, 6, 8, 4, 6)),
  q('lazio', 'rocchi', 'Tommaso Rocchi', 1977, 'Italy', ['ST'], 79, 80, 2011, 25, t(8, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('lazio', 'pandev', 'Goran Pandev', 1983, 'North Macedonia', ['AM', 'ST'], 81, 84, 2011, 25, t(8, 6, 8, 7, 5, 7)),
  q('lazio', 'mauri', 'Stefano Mauri', 1980, 'Italy', ['AM', 'CM'], 77, 79, 2011, 25, t(8, 5, 7, 8, 5, 7)),
  q('lazio', 'ledesma', 'Cristian Ledesma', 1982, 'Italy', ['DM', 'CM'], 77, 80, 2012, 25, t(8, 5, 8, 7, 5, 7)),
  q('lazio', 'siviglia', 'Giuseppe Biava', 1977, 'Italy', ['CB'], 75, 76, 2010, 25, t(8, 4, 7, 8, 5, 6)),
  q('lazio', 'de_silvestri', 'Lorenzo De Silvestri', 1988, 'Italy', ['RB'], 70, 81, 2012, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── The elite of Europe, 2007–08 — full squads so every real European Cup of the
//    span (2008–2022) is anchored to a side that exists. ───────────────────────
export const REAL_MADRID_2007: CuratedSeed[] = [
  q('real_madrid', 'casillas_07', 'Iker Casillas', 1981, 'Spain', ['GK'], 89, 90, 2013, 15, t(9, 6, 9, 10, 4, 7), { loyalty: 95 }),
  q('real_madrid', 'sergio_ramos_07', 'Sergio Ramos', 1986, 'Spain', ['CB', 'RB'], 85, 92, 2013, 20, t(8, 7, 9, 9, 7, 7)),
  q('real_madrid', 'cannavaro_f07', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 85, 85, 2009, 25, t(9, 6, 9, 8, 5, 7)),
  q('real_madrid', 'pepe_07', 'Pepe', 1983, 'Portugal', ['CB'], 82, 86, 2012, 25, t(7, 7, 8, 8, 8, 7)),
  q('real_madrid', 'heinze_07', 'Gabriel Heinze', 1978, 'Argentina', ['LB', 'CB'], 81, 82, 2011, 25, t(8, 6, 8, 7, 7, 7)),
  q('real_madrid', 'marcelo_07', 'Marcelo', 1988, 'Brazil', ['LB', 'LW'], 78, 90, 2013, 20, t(8, 6, 9, 9, 5, 8), { loyalty: 92 }),
  q('real_madrid', 'guti_07', 'Guti', 1976, 'Spain', ['AM', 'CM'], 82, 82, 2010, 25, t(6, 7, 7, 8, 6, 7)),
  q('real_madrid', 'diarra_07', 'Mahamadou Diarra', 1981, 'Mali', ['DM', 'CM'], 81, 82, 2011, 25, t(8, 5, 8, 7, 5, 7)),
  q('real_madrid', 'robben_07', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 85, 89, 2011, 35, t(8, 7, 9, 7, 5, 7)),
  q('real_madrid', 'sneijder_07', 'Wesley Sneijder', 1984, 'Netherlands', ['AM', 'CM'], 84, 88, 2011, 20, t(7, 7, 8, 6, 6, 8)),
  q('real_madrid', 'robinho_07', 'Robinho', 1984, 'Brazil', ['LW', 'ST'], 84, 86, 2011, 25, t(6, 7, 8, 6, 6, 8)),
  q('real_madrid', 'raul_07', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 85, 85, 2010, 20, t(9, 6, 9, 10, 4, 7), { loyalty: 96 }),
  q('real_madrid', 'van_nistelrooy_07', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 86, 86, 2010, 25, t(9, 7, 9, 7, 4, 7)),
  q('real_madrid', 'higuain_07', 'Gonzalo Higuaín', 1987, 'Argentina', ['ST'], 78, 88, 2013, 20, t(8, 6, 8, 7, 5, 8)),
];

export const BARCELONA_2007: CuratedSeed[] = [
  q('barcelona', 'valdes_07', 'Víctor Valdés', 1982, 'Spain', ['GK'], 85, 87, 2012, 15, t(8, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('barcelona', 'puyol_07', 'Carles Puyol', 1978, 'Spain', ['CB', 'RB'], 86, 87, 2011, 20, t(10, 5, 9, 10, 4, 7), { loyalty: 96 }),
  q('barcelona', 'marquez_07', 'Rafael Márquez', 1979, 'Mexico', ['CB', 'DM'], 82, 84, 2010, 25, t(8, 6, 8, 7, 5, 7)),
  q('barcelona', 'milito_g', 'Gabriel Milito', 1980, 'Argentina', ['CB'], 81, 84, 2011, 30, t(8, 5, 8, 7, 5, 7)),
  q('barcelona', 'abidal_07', 'Éric Abidal', 1979, 'France', ['LB', 'CB'], 83, 85, 2012, 20, t(9, 5, 8, 8, 4, 7)),
  q('barcelona', 'xavi_07', 'Xavi', 1980, 'Spain', ['CM'], 89, 92, 2013, 15, t(10, 6, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'iniesta_07', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 87, 93, 2013, 20, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'deco_07', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 85, 86, 2010, 25, t(7, 6, 8, 7, 5, 7)),
  q('barcelona', 'toure_yaya', 'Yaya Touré', 1983, 'Ivory Coast', ['DM', 'CM'], 83, 88, 2012, 20, t(8, 6, 8, 7, 5, 7)),
  q('barcelona', 'messi_07', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 88, 99, 2014, 15, t(10, 6, 10, 10, 3, 8), { loyalty: 96 }),
  q('barcelona', 'etoo_07', 'Samuel Eto’o', 1981, 'Cameroon', ['ST'], 87, 89, 2011, 25, t(7, 8, 9, 6, 6, 7)),
  q('barcelona', 'henry_b07', 'Thierry Henry', 1977, 'France', ['LW', 'ST'], 85, 87, 2011, 25, t(9, 7, 9, 7, 4, 8)),
  q('barcelona', 'bojan_07', 'Bojan Krkić', 1990, 'Spain', ['ST', 'RW'], 68, 84, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('barcelona', 'gudjohnsen_07', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 80, 80, 2010, 25, t(8, 6, 8, 7, 5, 7)),
];

export const BAYERN_2007: CuratedSeed[] = [
  q('bayern', 'kahn_07', 'Oliver Kahn', 1969, 'Germany', ['GK'], 85, 85, 2008, 20, t(10, 7, 9, 9, 5, 7), { loyalty: 92 }),
  q('bayern', 'lahm_07', 'Philipp Lahm', 1983, 'Germany', ['RB', 'LB'], 85, 88, 2013, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 95 }),
  q('bayern', 'van_buyten', 'Daniel Van Buyten', 1978, 'Belgium', ['CB'], 81, 82, 2011, 25, t(8, 5, 8, 8, 5, 7)),
  q('bayern', 'lucio_07', 'Lúcio', 1978, 'Brazil', ['CB'], 84, 85, 2011, 25, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'sagnol', 'Willy Sagnol', 1977, 'France', ['RB'], 80, 81, 2009, 25, t(8, 5, 8, 8, 4, 7)),
  q('bayern', 'van_bommel', 'Mark van Bommel', 1977, 'Netherlands', ['DM', 'CM'], 83, 84, 2011, 25, t(8, 7, 8, 7, 6, 7)),
  q('bayern', 'ze_roberto_07', 'Zé Roberto', 1974, 'Brazil', ['CM', 'LW'], 82, 82, 2009, 25, t(9, 5, 8, 7, 4, 8)),
  q('bayern', 'schweinsteiger_07', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'RW'], 82, 89, 2013, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 92 }),
  q('bayern', 'ribery_07', 'Franck Ribéry', 1983, 'France', ['LW', 'AM'], 85, 90, 2012, 25, t(8, 7, 9, 8, 6, 8)),
  q('bayern', 'podolski_07', 'Lukas Podolski', 1985, 'Germany', ['ST', 'LW'], 81, 85, 2011, 20, t(7, 6, 8, 8, 5, 7)),
  q('bayern', 'toni_07', 'Luca Toni', 1977, 'Italy', ['ST'], 84, 85, 2011, 25, t(8, 6, 8, 7, 5, 7)),
  q('bayern', 'klose_07', 'Miroslav Klose', 1978, 'Germany', ['ST'], 83, 84, 2011, 25, t(9, 5, 8, 8, 4, 7)),
  q('bayern', 'altintop', 'Hamit Altıntop', 1982, 'Turkey', ['RW', 'CM'], 79, 81, 2011, 25, t(8, 5, 8, 7, 5, 7)),
];

export const MANUTD_2007: CuratedSeed[] = [
  q('man_utd', 'van_der_sar_07', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 86, 86, 2010, 20, t(9, 6, 8, 8, 4, 7)),
  q('man_utd', 'g_neville_07', 'Gary Neville', 1975, 'England', ['RB'], 80, 80, 2010, 25, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('man_utd', 'ferdinand_07', 'Rio Ferdinand', 1978, 'England', ['CB'], 87, 88, 2012, 20, t(8, 6, 8, 8, 4, 7)),
  q('man_utd', 'vidic_07', 'Nemanja Vidić', 1981, 'Serbia', ['CB'], 86, 88, 2012, 20, t(9, 6, 9, 9, 6, 7)),
  q('man_utd', 'evra_07', 'Patrice Evra', 1981, 'France', ['LB'], 84, 86, 2012, 20, t(9, 6, 9, 8, 5, 8)),
  q('man_utd', 'cristiano_07', 'Cristiano Ronaldo', 1985, 'Portugal', ['RW', 'LW', 'ST'], 90, 96, 2012, 15, t(10, 8, 10, 7, 4, 8)),
  q('man_utd', 'carrick_07', 'Michael Carrick', 1981, 'England', ['CM', 'DM'], 83, 85, 2012, 20, t(9, 5, 8, 9, 4, 7)),
  q('man_utd', 'scholes_07', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 85, 85, 2011, 20, t(9, 5, 8, 10, 4, 7), { loyalty: 96 }),
  q('man_utd', 'giggs_07', 'Ryan Giggs', 1973, 'Wales', ['LW', 'CM'], 84, 84, 2011, 20, t(9, 6, 9, 10, 4, 8), { loyalty: 97 }),
  q('man_utd', 'hargreaves', 'Owen Hargreaves', 1981, 'England', ['DM', 'CM'], 82, 84, 2011, 40, t(8, 6, 8, 7, 5, 7)),
  q('man_utd', 'anderson_u07', 'Anderson', 1988, 'Brazil', ['CM', 'AM'], 74, 85, 2013, 25, t(6, 6, 7, 7, 6, 7)),
  q('man_utd', 'nani_07', 'Nani', 1986, 'Portugal', ['RW', 'LW'], 78, 86, 2012, 25, t(6, 7, 8, 7, 6, 8)),
  q('man_utd', 'rooney_07', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 88, 91, 2012, 25, t(8, 7, 9, 8, 7, 8)),
  q('man_utd', 'tevez_07', 'Carlos Tévez', 1984, 'Argentina', ['ST'], 85, 87, 2009, 25, t(8, 7, 9, 6, 6, 7)),
  q('man_utd', 'saha_07', 'Louis Saha', 1978, 'France', ['ST'], 80, 82, 2010, 40, t(7, 6, 8, 7, 5, 7)),
];

export const LIVERPOOL_2007: CuratedSeed[] = [
  q('liverpool', 'reina_07', 'Pepe Reina', 1982, 'Spain', ['GK'], 85, 87, 2012, 15, t(9, 6, 8, 9, 4, 7)),
  q('liverpool', 'carragher_07', 'Jamie Carragher', 1978, 'England', ['CB'], 84, 85, 2012, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'agger', 'Daniel Agger', 1984, 'Denmark', ['CB'], 81, 85, 2012, 30, t(8, 5, 8, 9, 5, 7)),
  q('liverpool', 'arbeloa', 'Álvaro Arbeloa', 1983, 'Spain', ['RB', 'LB'], 79, 82, 2011, 20, t(8, 5, 8, 8, 4, 7)),
  q('liverpool', 'riise_07', 'John Arne Riise', 1980, 'Norway', ['LB', 'LW'], 80, 81, 2010, 25, t(8, 5, 8, 8, 4, 7)),
  q('liverpool', 'gerrard_07', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 89, 90, 2012, 20, t(9, 7, 9, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'mascherano_07', 'Javier Mascherano', 1984, 'Argentina', ['DM', 'CM'], 84, 86, 2011, 20, t(9, 6, 9, 8, 6, 7)),
  q('liverpool', 'alonso_07', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 85, 88, 2011, 20, t(9, 5, 8, 8, 4, 8)),
  q('liverpool', 'kuyt', 'Dirk Kuyt', 1980, 'Netherlands', ['RW', 'ST'], 81, 82, 2011, 20, t(9, 5, 8, 9, 4, 7)),
  q('liverpool', 'benayoun', 'Yossi Benayoun', 1980, 'Israel', ['AM', 'RW'], 80, 82, 2010, 25, t(8, 6, 8, 7, 5, 7)),
  q('liverpool', 'torres_07', 'Fernando Torres', 1984, 'Spain', ['ST'], 87, 91, 2012, 30, t(8, 6, 9, 8, 5, 8)),
  q('liverpool', 'crouch_07', 'Peter Crouch', 1981, 'England', ['ST'], 79, 80, 2010, 25, t(8, 5, 8, 7, 5, 7)),
  q('liverpool', 'babel', 'Ryan Babel', 1986, 'Netherlands', ['LW', 'ST'], 76, 82, 2012, 25, t(6, 6, 7, 7, 6, 7)),
];

export const CHELSEA_2007: CuratedSeed[] = [
  q('chelsea', 'cech_07', 'Petr Čech', 1982, 'Czechia', ['GK'], 88, 89, 2012, 15, t(9, 6, 8, 9, 4, 7)),
  q('chelsea', 'ferreira_07', 'Paulo Ferreira', 1979, 'Portugal', ['RB', 'CB'], 80, 81, 2010, 25, t(8, 5, 8, 8, 4, 7)),
  q('chelsea', 'terry_07', 'John Terry', 1980, 'England', ['CB'], 87, 88, 2012, 20, t(9, 7, 9, 10, 6, 7), { loyalty: 95 }),
  q('chelsea', 'carvalho_07', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 85, 86, 2011, 20, t(8, 6, 8, 8, 5, 7)),
  q('chelsea', 'a_cole_07', 'Ashley Cole', 1980, 'England', ['LB'], 85, 87, 2012, 20, t(8, 7, 9, 7, 6, 7)),
  q('chelsea', 'essien_07', 'Michael Essien', 1982, 'Ghana', ['DM', 'CM'], 86, 88, 2012, 25, t(9, 6, 9, 8, 6, 7)),
  q('chelsea', 'lampard_07', 'Frank Lampard', 1978, 'England', ['CM', 'AM'], 88, 89, 2012, 15, t(10, 6, 9, 9, 4, 7), { loyalty: 92 }),
  q('chelsea', 'ballack_07', 'Michael Ballack', 1976, 'Germany', ['CM', 'AM'], 85, 86, 2010, 25, t(8, 7, 9, 7, 5, 7)),
  q('chelsea', 'makelele_07', 'Claude Makélélé', 1973, 'France', ['DM'], 83, 83, 2009, 20, t(9, 5, 8, 8, 4, 7)),
  q('chelsea', 'j_cole_07', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 82, 84, 2011, 25, t(7, 6, 8, 8, 5, 8)),
  q('chelsea', 'malouda_07', 'Florent Malouda', 1980, 'France', ['LW', 'AM'], 82, 84, 2012, 20, t(8, 6, 8, 7, 5, 8)),
  q('chelsea', 'drogba_07', 'Didier Drogba', 1978, 'Ivory Coast', ['ST'], 88, 89, 2012, 25, t(8, 7, 9, 8, 6, 7)),
  q('chelsea', 'anelka_07', 'Nicolas Anelka', 1979, 'France', ['ST'], 84, 85, 2012, 25, t(7, 7, 8, 6, 6, 7)),
  q('chelsea', 'kalou', 'Salomon Kalou', 1985, 'Ivory Coast', ['LW', 'ST'], 78, 82, 2011, 25, t(7, 6, 8, 7, 5, 7)),
];

// ── European context (light — present so the reality-anchored Cup has a field
//    and every real winner/finalist exists) ────────────────────────────────────
export const DORTMUND_2007: CuratedSeed[] = [
  q('dortmund', 'weidenfeller', 'Roman Weidenfeller', 1980, 'Germany', ['GK'], 79, 82, 2012, 20, t(9, 5, 8, 9, 5, 6), { loyalty: 90 }),
  q('dortmund', 'kringe', 'Florian Kringe', 1982, 'Germany', ['CM'], 74, 76, 2011, 25, t(8, 4, 7, 8, 5, 7)),
  q('dortmund', 'frei_d', 'Alexander Frei', 1979, 'Switzerland', ['ST'], 80, 81, 2010, 25, t(8, 6, 8, 7, 5, 7)),
  q('dortmund', 'kehl', 'Sebastian Kehl', 1980, 'Germany', ['DM', 'CM'], 79, 80, 2011, 25, t(8, 5, 8, 8, 5, 7)),
  q('dortmund', 'tinga', 'Tinga', 1978, 'Brazil', ['CM', 'DM'], 76, 77, 2010, 25, t(8, 5, 7, 7, 5, 7)),
  q('dortmund', 'hajnal', 'Tamás Hajnal', 1981, 'Hungary', ['AM'], 75, 78, 2011, 25, t(8, 5, 7, 7, 5, 7)),
];
export const ATLETICO_2007: CuratedSeed[] = [
  q('atletico', 'aguero_07', 'Sergio Agüero', 1988, 'Argentina', ['ST'], 84, 92, 2013, 20, t(8, 7, 9, 7, 5, 8)),
  q('atletico', 'forlan_07', 'Diego Forlán', 1979, 'Uruguay', ['ST', 'AM'], 85, 86, 2011, 20, t(9, 6, 9, 8, 4, 8)),
  q('atletico', 'simao', 'Simão Sabrosa', 1979, 'Portugal', ['LW', 'RW'], 82, 83, 2011, 25, t(8, 6, 8, 7, 5, 7)),
  q('atletico', 'maxi_r', 'Maxi Rodríguez', 1981, 'Argentina', ['RW', 'AM'], 80, 82, 2010, 25, t(8, 6, 8, 7, 5, 7)),
  q('atletico', 'perea', 'Luis Perea', 1979, 'Colombia', ['CB'], 79, 80, 2011, 25, t(8, 5, 8, 8, 5, 7)),
  q('atletico', 'seitaridis', 'Giourkas Seitaridis', 1981, 'Greece', ['RB'], 77, 78, 2010, 25, t(8, 4, 7, 7, 5, 7)),
];
export const PORTO_2007: CuratedSeed[] = [
  q('porto', 'helton', 'Helton', 1978, 'Brazil', ['GK'], 80, 81, 2012, 20, t(8, 5, 7, 8, 5, 6)),
  q('porto', 'bruno_alves', 'Bruno Alves', 1981, 'Portugal', ['CB'], 81, 83, 2011, 25, t(8, 6, 8, 8, 5, 7)),
  q('porto', 'lucho', 'Lucho González', 1981, 'Argentina', ['CM', 'AM'], 82, 84, 2011, 25, t(8, 6, 8, 7, 5, 7)),
  q('porto', 'quaresma_07', 'Ricardo Quaresma', 1983, 'Portugal', ['RW'], 80, 84, 2010, 30, t(5, 8, 7, 6, 7, 7)),
  q('porto', 'lisandro', 'Lisandro López', 1983, 'Argentina', ['ST'], 82, 84, 2011, 25, t(8, 6, 8, 7, 5, 7)),
  q('porto', 'raul_meireles', 'Raul Meireles', 1983, 'Portugal', ['CM', 'AM'], 80, 84, 2011, 25, t(8, 6, 8, 8, 5, 7)),
];

/** The full Milan-2007 curated universe: Serie A + the elite of Europe (full
 *  squads) and a light continental context so every real European Cup of the
 *  2008–2022 span is anchored to a side that exists. */
export const MILAN_2007_SQUADS: Record<string, CuratedSeed[]> = {
  milan: MILAN_2007,
  inter: INTER_2007,
  juventus: JUVENTUS_2007,
  roma: ROMA_2007,
  fiorentina: FIORENTINA_2007,
  napoli: NAPOLI_2007,
  lazio: LAZIO_2007,
  real_madrid: REAL_MADRID_2007,
  barcelona: BARCELONA_2007,
  bayern: BAYERN_2007,
  man_utd: MANUTD_2007,
  liverpool: LIVERPOOL_2007,
  chelsea: CHELSEA_2007,
  dortmund: DORTMUND_2007,
  atletico: ATLETICO_2007,
  porto: PORTO_2007,
};

// European selling clubs (M12A rollout) — the mid-2000s foreign talent pipeline
// (shared with juventus-2006, which spreads this record). Merged by CONCATENATION.
for (const [club, seeds] of Object.entries(EUROPE_2007_SQUADS)) {
  if (club === 'porto') continue; // this pack already curates the full 2006-07 Porto
  MILAN_2007_SQUADS[club] = [...(MILAN_2007_SQUADS[club] ?? []), ...seeds];
}
