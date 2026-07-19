/**
 * Curated real players — 1995 Serie A "Golden Age" pack (Italy; §4, §17.10).
 *
 * The vertical slice for "Juventus — 1995: The Lippi Era". Serie A 1995–96 as it
 * really was — il campionato più bello del mondo — with the defending-champion
 * Bianconeri (about to win the 1996 Champions League), Capello's champion Milan,
 * and the Parmalat-funded Parma side whose jewels (Buffon, Cannavaro, Thuram,
 * Crespo) are the era's great selling assets. Around them, the real calcio market
 * of 1995–2001: young Zidane from Bordeaux, Ronaldo's world-record move to Inter,
 * the Vieri fee saga, and Juve cashing in Vialli/Ravanelli after Turin.
 *
 * Roberto Baggio still starts at Juventus: his move to Milan is the first
 * decision the player faces in the live opening window — let the Divine Ponytail
 * go, as reality did, or keep him. Ability/potential/personality are HIDDEN
 * designer estimates (§7); clubs, birth years, positions and contracts are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { EUROPE_1995_SQUADS } from './curated-europe-1995.js';
import { ITA_DOMESTIC_1995_SQUADS } from './curated-ita-domestic-1995.js';

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

// ── Juventus, 1995–96 (Lippi; reigning champions, European Cup to come) ───────
export const JUVENTUS_1995: CuratedSeed[] = [
  q('juventus', 'peruzzi', 'Angelo Peruzzi', 1970, 'Italy', ['GK'], 85, 86, 1999, 25, t(8, 6, 8, 8, 5, 6)),
  q('juventus', 'rampulla', 'Michelangelo Rampulla', 1962, 'Italy', ['GK'], 74, 74, 1998, 25, t(8, 4, 5, 8, 4, 6)),
  q('juventus', 'ferrara', 'Ciro Ferrara', 1967, 'Italy', ['CB'], 85, 86, 1999, 25, t(9, 5, 8, 8, 4, 7)),
  q('juventus', 'kohler', 'Jürgen Kohler', 1965, 'Germany', ['CB'], 84, 84, 1998, 30, t(8, 5, 8, 6, 5, 7)),
  q('juventus', 'torricelli', 'Moreno Torricelli', 1970, 'Italy', ['RB', 'CB'], 80, 81, 1999, 25, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'pessotto', 'Gianluca Pessotto', 1970, 'Italy', ['LB', 'RB'], 80, 82, 1999, 25, t(9, 4, 7, 9, 3, 7)),
  q('juventus', 'porrini', 'Sergio Porrini', 1968, 'Italy', ['RB', 'CB'], 78, 79, 1998, 25, t(8, 4, 7, 7, 4, 7)),
  q('juventus', 'iuliano', 'Mark Iuliano', 1973, 'Italy', ['CB'], 76, 82, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('juventus', 'carrera', 'Massimo Carrera', 1964, 'Italy', ['CB'], 76, 76, 1998, 30, t(8, 4, 6, 8, 4, 6)),
  q('juventus', 'deschamps', 'Didier Deschamps', 1968, 'France', ['DM', 'CM'], 84, 85, 1999, 25, t(9, 6, 9, 7, 4, 7)),
  q('juventus', 'conte_j', 'Antonio Conte', 1969, 'Italy', ['CM'], 82, 84, 2000, 30, t(9, 7, 9, 10, 6, 6), { loyalty: 92 }),
  q('juventus', 'di_livio', 'Angelo Di Livio', 1966, 'Italy', ['RW', 'CM'], 79, 80, 1999, 25, t(9, 4, 8, 9, 4, 7)),
  q('juventus', 'paulo_sousa', 'Paulo Sousa', 1970, 'Portugal', ['DM', 'CM'], 82, 84, 1997, 30, t(8, 5, 8, 6, 4, 7)),
  q('juventus', 'jugovic', 'Vladimir Jugović', 1970, 'Serbia', ['CM', 'AM'], 81, 83, 1998, 30, t(7, 6, 8, 6, 5, 7)),
  q('juventus', 'tacchinardi_j', 'Alessio Tacchinardi', 1975, 'Italy', ['DM', 'CM'], 72, 83, 2000, 30, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'delpiero_j', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 86, 92, 2001, 30, t(9, 6, 9, 10, 4, 7), { loyalty: 95 }),
  q('juventus', 'baggio_r', 'Roberto Baggio', 1967, 'Italy', ['AM', 'ST'], 90, 91, 1998, 35, t(8, 6, 8, 7, 5, 7)),
  q('juventus', 'ravanelli', 'Fabrizio Ravanelli', 1968, 'Italy', ['ST'], 84, 85, 1998, 25, t(8, 7, 8, 6, 6, 6)),
  q('juventus', 'vialli', 'Gianluca Vialli', 1964, 'Italy', ['ST'], 84, 84, 1996, 30, t(9, 7, 9, 8, 5, 7)),
  q('juventus', 'padovano', 'Michele Padovano', 1966, 'Italy', ['ST'], 77, 78, 1998, 30, t(7, 5, 7, 6, 5, 7)),
];

// ── AC Milan, 1995–96 (Capello; champions) ────────────────────────────────────
export const MILAN_1995: CuratedSeed[] = [
  q('milan', 'rossi_s', 'Sebastiano Rossi', 1964, 'Italy', ['GK'], 83, 83, 1999, 25, t(8, 6, 7, 8, 5, 6)),
  q('milan', 'maldini_m', 'Paolo Maldini', 1968, 'Italy', ['LB', 'CB'], 88, 89, 2001, 20, t(10, 6, 9, 10, 3, 7), { loyalty: 99, hardBlocks: [{ reason: 'Paolo Maldini is Milan for life.', untilYear: 2099 }] }),
  q('milan', 'baresi', 'Franco Baresi', 1960, 'Italy', ['CB'], 87, 87, 1997, 25, t(10, 6, 9, 10, 3, 6), { loyalty: 99, hardBlocks: [{ reason: 'Franco Baresi is a Milan legend and captain.', untilYear: 2099 }] }),
  q('milan', 'costacurta', 'Alessandro Costacurta', 1966, 'Italy', ['CB'], 84, 85, 2000, 25, t(9, 5, 8, 10, 3, 7), { loyalty: 94 }),
  q('milan', 'tassotti', 'Mauro Tassotti', 1960, 'Italy', ['RB'], 79, 79, 1997, 25, t(9, 4, 7, 10, 3, 6)),
  q('milan', 'desailly', 'Marcel Desailly', 1968, 'France', ['DM', 'CB'], 85, 86, 1999, 25, t(9, 5, 8, 7, 4, 7)),
  q('milan', 'albertini', 'Demetrio Albertini', 1971, 'Italy', ['CM', 'DM'], 83, 85, 2000, 25, t(9, 5, 8, 8, 3, 7)),
  q('milan', 'donadoni', 'Roberto Donadoni', 1963, 'Italy', ['RW', 'AM'], 82, 82, 1997, 25, t(9, 5, 8, 9, 4, 7)),
  q('milan', 'boban', 'Zvonimir Boban', 1968, 'Croatia', ['AM'], 84, 85, 1999, 30, t(8, 6, 8, 7, 5, 7)),
  q('milan', 'savicevic', 'Dejan Savićević', 1966, 'Montenegro', ['AM', 'ST'], 84, 85, 1998, 35, t(6, 8, 7, 6, 7, 6)),
  q('milan', 'weah', 'George Weah', 1966, 'Liberia', ['ST'], 87, 88, 1999, 25, t(8, 6, 9, 7, 4, 7)),
  q('milan', 'simone_m', 'Marco Simone', 1969, 'Italy', ['ST'], 80, 81, 1998, 30, t(7, 6, 7, 7, 5, 7)),
  q('milan', 'eranio', 'Stefano Eranio', 1966, 'Italy', ['RW', 'CM'], 79, 80, 1997, 25, t(8, 5, 7, 7, 4, 7)),
];

// ── Internazionale, 1995–96 ───────────────────────────────────────────────────
export const INTER_1995: CuratedSeed[] = [
  q('inter', 'pagliuca', 'Gianluca Pagliuca', 1966, 'Italy', ['GK'], 84, 84, 1999, 20, t(8, 6, 7, 8, 5, 6)),
  q('inter', 'zanetti_i', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 82, 88, 2001, 15, t(10, 5, 9, 10, 2, 8)),
  q('inter', 'bergomi', 'Giuseppe Bergomi', 1963, 'Italy', ['CB', 'RB'], 81, 81, 1998, 25, t(9, 5, 8, 10, 4, 6), { loyalty: 96 }),
  q('inter', 'fresi', 'Salvatore Fresi', 1973, 'Italy', ['CB'], 74, 80, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('inter', 'roberto_carlos_i', 'Roberto Carlos', 1973, 'Brazil', ['LB'], 84, 88, 1998, 25, t(8, 7, 8, 6, 5, 7)),
  q('inter', 'angloma_i', 'Jocelyn Angloma', 1965, 'France', ['RB', 'CB'], 78, 79, 1997, 25, t(8, 5, 7, 6, 4, 7)),
  q('inter', 'ince', 'Paul Ince', 1967, 'England', ['CM', 'DM'], 82, 83, 1998, 30, t(7, 7, 8, 6, 6, 6)),
  q('inter', 'berti', 'Nicola Berti', 1967, 'Italy', ['CM'], 80, 80, 1997, 30, t(7, 6, 7, 7, 6, 6)),
  q('inter', 'sforza', 'Ciriaco Sforza', 1970, 'Switzerland', ['CM', 'DM'], 79, 81, 1997, 30, t(8, 5, 7, 6, 5, 7)),
  q('inter', 'branca', 'Marco Branca', 1965, 'Italy', ['ST'], 78, 79, 1998, 35, t(7, 5, 7, 6, 5, 6)),
  q('inter', 'ganz', 'Maurizio Ganz', 1968, 'Italy', ['ST'], 77, 78, 1998, 30, t(7, 6, 7, 6, 6, 6)),
];

// ── Lazio, 1995–96 ────────────────────────────────────────────────────────────
export const LAZIO_1995: CuratedSeed[] = [
  q('lazio', 'marchegiani', 'Luca Marchegiani', 1966, 'Italy', ['GK'], 82, 82, 1999, 25, t(8, 5, 7, 8, 4, 6)),
  q('lazio', 'favalli', 'Giuseppe Favalli', 1972, 'Italy', ['LB'], 80, 82, 2000, 25, t(9, 4, 7, 9, 3, 7)),
  q('lazio', 'negro', 'Paolo Negro', 1972, 'Italy', ['CB', 'RB'], 78, 80, 2000, 25, t(8, 4, 7, 8, 4, 7)),
  q('lazio', 'chamot', 'José Chamot', 1969, 'Argentina', ['CB', 'LB'], 79, 81, 1998, 30, t(7, 5, 7, 6, 6, 7)),
  q('lazio', 'winter_l', 'Aron Winter', 1967, 'Netherlands', ['CM', 'AM'], 80, 81, 1997, 25, t(8, 5, 7, 7, 4, 7)),
  q('lazio', 'di_matteo', 'Roberto Di Matteo', 1970, 'Italy', ['CM'], 80, 82, 1996, 25, t(8, 5, 7, 7, 4, 7)),
  q('lazio', 'fuser', 'Diego Fuser', 1968, 'Italy', ['RW', 'RB'], 80, 82, 1999, 25, t(8, 5, 7, 7, 4, 7)),
  q('lazio', 'rambaudi', 'Roberto Rambaudi', 1966, 'Italy', ['LW'], 76, 77, 1998, 30, t(7, 5, 6, 7, 5, 7)),
  q('lazio', 'signori', 'Beppe Signori', 1968, 'Italy', ['ST', 'AM'], 85, 86, 1999, 30, t(8, 6, 8, 8, 5, 6)),
  q('lazio', 'boksic', 'Alen Bokšić', 1970, 'Croatia', ['ST'], 83, 85, 1996, 35, t(7, 6, 8, 6, 5, 7)),
  q('lazio', 'casiraghi', 'Pierluigi Casiraghi', 1969, 'Italy', ['ST'], 81, 82, 1998, 35, t(8, 5, 8, 7, 5, 6)),
];

// ── Parma, 1995–96 (the Parmalat side; Italy's great selling asset) ───────────
export const PARMA_1995: CuratedSeed[] = [
  q('parma', 'buffon_p', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 68, 91, 2001, 20, t(9, 6, 9, 8, 4, 7)),
  q('parma', 'bucci', 'Luca Bucci', 1969, 'Italy', ['GK'], 80, 81, 1998, 25, t(8, 5, 7, 7, 4, 6)),
  q('parma', 'cannavaro_p', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 78, 88, 2000, 20, t(9, 6, 9, 6, 4, 8)),
  q('parma', 'thuram_p', 'Lilian Thuram', 1972, 'France', ['RB', 'CB'], 82, 87, 2001, 20, t(9, 5, 8, 7, 3, 7)),
  q('parma', 'sensini_p', 'Néstor Sensini', 1966, 'Argentina', ['CB', 'DM'], 80, 81, 1998, 30, t(8, 5, 7, 7, 4, 7)),
  q('parma', 'benarrivo', 'Antonio Benarrivo', 1968, 'Italy', ['LB'], 78, 79, 1999, 25, t(8, 4, 7, 8, 4, 7)),
  q('parma', 'mussi', 'Roberto Mussi', 1963, 'Italy', ['RB'], 76, 76, 1997, 25, t(8, 4, 6, 7, 4, 6)),
  q('parma', 'dino_baggio', 'Dino Baggio', 1971, 'Italy', ['CM', 'DM'], 82, 84, 2000, 30, t(8, 5, 8, 7, 5, 7)),
  q('parma', 'crippa', 'Massimo Crippa', 1965, 'Italy', ['CM', 'DM'], 78, 79, 1997, 25, t(8, 4, 7, 7, 4, 6)),
  q('parma', 'zola_p', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 85, 86, 1997, 25, t(9, 5, 8, 8, 3, 7)),
  q('parma', 'asprilla', 'Faustino Asprilla', 1969, 'Colombia', ['ST'], 84, 86, 1998, 30, t(5, 8, 7, 5, 8, 6)),
  q('parma', 'stoichkov', 'Hristo Stoichkov', 1966, 'Bulgaria', ['LW', 'ST'], 85, 86, 1996, 30, t(5, 9, 8, 5, 8, 6)),
];

// ── Roma, 1995–96 (a teenage Totti emerging) ──────────────────────────────────
export const ROMA_1995: CuratedSeed[] = [
  q('roma', 'cervone', 'Giovanni Cervone', 1963, 'Italy', ['GK'], 78, 78, 1997, 25, t(8, 4, 6, 8, 4, 6)),
  q('roma', 'aldair', 'Aldair', 1965, 'Brazil', ['CB'], 84, 85, 1999, 25, t(9, 5, 8, 8, 3, 7)),
  q('roma', 'carboni_a', 'Amedeo Carboni', 1965, 'Italy', ['LB'], 78, 79, 1998, 25, t(8, 5, 7, 7, 4, 7)),
  q('roma', 'totti', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 72, 90, 2001, 30, t(8, 7, 8, 10, 5, 6), { loyalty: 96 }),
  q('roma', 'di_biagio', 'Luigi Di Biagio', 1971, 'Italy', ['DM', 'CM'], 79, 82, 2000, 30, t(8, 5, 8, 7, 5, 7)),
  q('roma', 'giannini', 'Giuseppe Giannini', 1964, 'Italy', ['AM'], 80, 80, 1997, 30, t(8, 6, 7, 10, 5, 6), { loyalty: 92 }),
  q('roma', 'fonseca_r', 'Daniel Fonseca', 1969, 'Uruguay', ['ST'], 80, 81, 1998, 35, t(7, 6, 7, 6, 6, 7)),
  q('roma', 'balbo', 'Abel Balbo', 1966, 'Argentina', ['ST'], 82, 83, 1998, 30, t(8, 6, 8, 6, 5, 7)),
  q('roma', 'delvecchio', 'Marco Delvecchio', 1973, 'Italy', ['ST'], 76, 82, 2000, 30, t(7, 5, 7, 7, 5, 7)),
  q('roma', 'moriero', 'Francesco Moriero', 1969, 'Italy', ['RW'], 78, 80, 1998, 30, t(7, 5, 7, 6, 5, 7)),
];

// ── Fiorentina, 1995–96 (Batistuta & Rui Costa) ───────────────────────────────
export const FIORENTINA_1995: CuratedSeed[] = [
  q('fiorentina', 'toldo', 'Francesco Toldo', 1971, 'Italy', ['GK'], 80, 86, 2001, 20, t(8, 5, 8, 8, 4, 7)),
  q('fiorentina', 'batistuta_f', 'Gabriel Batistuta', 1969, 'Argentina', ['ST'], 87, 88, 2000, 30, t(8, 7, 9, 8, 5, 6), { loyalty: 90 }),
  q('fiorentina', 'rui_costa_f', 'Manuel Rui Costa', 1972, 'Portugal', ['AM'], 84, 87, 2001, 25, t(8, 6, 8, 7, 4, 7)),
  q('fiorentina', 'schwarz', 'Stefan Schwarz', 1969, 'Sweden', ['CM', 'DM'], 80, 81, 1997, 25, t(8, 5, 7, 6, 4, 7)),
  q('fiorentina', 'robbiati', 'Anselmo Robbiati', 1970, 'Italy', ['LW'], 76, 78, 1999, 30, t(7, 5, 6, 7, 5, 7)),
  q('fiorentina', 'carnasciali', 'Daniele Carnasciali', 1967, 'Italy', ['RB'], 76, 77, 1998, 25, t(8, 4, 6, 8, 4, 7)),
  q('fiorentina', 'padalino', 'Pasquale Padalino', 1972, 'Italy', ['CB'], 75, 78, 1999, 30, t(8, 4, 7, 7, 4, 7)),
  q('fiorentina', 'baiano', 'Francesco Baiano', 1968, 'Italy', ['AM', 'ST'], 78, 80, 1998, 30, t(7, 6, 7, 7, 5, 6)),
];

// ── Sampdoria, 1995–96 (an Ajax nucleus passing through) ──────────────────────
export const SAMPDORIA_1995: CuratedSeed[] = [
  q('sampdoria', 'ferron', 'Fausto Ferron', 1961, 'Italy', ['GK'], 76, 76, 1997, 25, t(8, 4, 6, 8, 4, 6)),
  q('sampdoria', 'mancini_s', 'Roberto Mancini', 1964, 'Italy', ['AM', 'ST'], 84, 85, 1997, 25, t(8, 7, 8, 9, 6, 6), { loyalty: 90 }),
  q('sampdoria', 'chiesa_s', 'Enrico Chiesa', 1970, 'Italy', ['ST'], 82, 85, 1996, 30, t(7, 6, 8, 7, 5, 7)),
  q('sampdoria', 'seedorf_s', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 80, 88, 1998, 20, t(7, 7, 8, 5, 5, 7)),
  q('sampdoria', 'karembeu', 'Christian Karembeu', 1970, 'France', ['CM', 'RB'], 79, 82, 1997, 25, t(8, 5, 8, 6, 5, 7)),
  q('sampdoria', 'lombardo', 'Attilio Lombardo', 1966, 'Italy', ['RW'], 81, 82, 1997, 25, t(8, 5, 8, 7, 4, 7)),
  q('sampdoria', 'mihajlovic_s', 'Siniša Mihajlović', 1969, 'Serbia', ['CB', 'LB'], 81, 83, 1998, 30, t(6, 7, 7, 6, 8, 6)),
  q('sampdoria', 'ferri', 'Riccardo Ferri', 1963, 'Italy', ['CB'], 78, 78, 1997, 25, t(8, 4, 6, 8, 4, 6)),
];

// ── Napoli, 1995–96 (post-Maradona; a young Ayala the gem) ────────────────────
export const NAPOLI_1995: CuratedSeed[] = [
  q('napoli', 'taglialatela', 'Giuseppe Taglialatela', 1968, 'Italy', ['GK'], 76, 77, 1998, 25, t(8, 4, 6, 8, 4, 6)),
  q('napoli', 'ayala_n', 'Roberto Ayala', 1973, 'Argentina', ['CB'], 80, 86, 1998, 25, t(9, 5, 8, 7, 4, 7)),
  q('napoli', 'boghossian', 'Alain Boghossian', 1970, 'France', ['CM', 'DM'], 78, 80, 1998, 30, t(8, 5, 7, 6, 5, 7)),
  q('napoli', 'pecchia', 'Fabio Pecchia', 1973, 'Italy', ['CM'], 74, 76, 1998, 30, t(8, 4, 6, 7, 4, 7)),
  q('napoli', 'beto', 'Beto', 1965, 'Italy', ['ST'], 76, 77, 1997, 30, t(7, 5, 6, 6, 5, 6)),
];

// ── Serie A mid/lower table — lighter, still recognisable era faces ───────────
export const ATALANTA_1995: CuratedSeed[] = [
  q('atalanta', 'vieri_a', 'Christian Vieri', 1973, 'Italy', ['ST'], 82, 88, 1998, 35, t(6, 8, 8, 5, 7, 6)),
  q('atalanta', 'inzaghi_a', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 78, 86, 1998, 30, t(7, 6, 8, 6, 5, 6)),
  q('atalanta', 'morfeo', 'Domenico Morfeo', 1976, 'Italy', ['AM'], 74, 82, 1999, 35, t(6, 6, 7, 7, 6, 7)),
];
export const UDINESE_1995: CuratedSeed[] = [
  q('udinese', 'bierhoff', 'Oliver Bierhoff', 1968, 'Germany', ['ST'], 80, 84, 1998, 25, t(9, 5, 8, 6, 4, 7)),
  q('udinese', 'helveg', 'Thomas Helveg', 1971, 'Denmark', ['RB', 'CM'], 78, 82, 1998, 25, t(8, 5, 7, 6, 4, 7)),
  q('udinese', 'poggi', 'Paolo Poggi', 1970, 'Italy', ['ST'], 74, 76, 1998, 30, t(7, 5, 6, 7, 5, 6)),
];
export const VICENZA_1995: CuratedSeed[] = [
  q('vicenza', 'luiso', 'Pasquale Luiso', 1969, 'Italy', ['ST'], 76, 78, 1998, 30, t(7, 6, 7, 6, 6, 6)),
  q('vicenza', 'ambrosetti', 'Gabriele Ambrosetti', 1973, 'Italy', ['LW'], 74, 78, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('vicenza', 'lorenzini', 'Otello Lorenzini', 1966, 'Italy', ['GK'], 74, 75, 1998, 25, t(8, 4, 6, 7, 4, 6)),
];
export const TORINO_1995: CuratedSeed[] = [
  q('torino', 'rizzitelli', 'Ruggiero Rizzitelli', 1967, 'Italy', ['ST'], 78, 79, 1997, 30, t(7, 6, 7, 6, 5, 6)),
  q('torino', 'silenzi', 'Andrea Silenzi', 1966, 'Italy', ['ST'], 76, 76, 1997, 30, t(7, 5, 6, 6, 5, 6)),
];
export const CAGLIARI_1995: CuratedSeed[] = [
  q('cagliari', 'oliveira_c', 'Luís Oliveira', 1969, 'Belgium', ['ST'], 78, 80, 1998, 30, t(7, 6, 7, 6, 5, 7)),
  q('cagliari', 'marcolin', 'Dario Marcolin', 1971, 'Italy', ['CM'], 75, 78, 1998, 30, t(8, 4, 7, 7, 4, 7)),
];
export const PIACENZA_1995: CuratedSeed[] = [
  q('piacenza', 'de_vitis', 'Fabio De Vitis', 1971, 'Italy', ['CM'], 72, 74, 1998, 30, t(8, 4, 6, 7, 4, 7)),
];

export const SERIE_A_1995_SQUADS: Record<string, CuratedSeed[]> = {
  juventus: JUVENTUS_1995,
  milan: MILAN_1995,
  inter: INTER_1995,
  lazio: LAZIO_1995,
  parma: PARMA_1995,
  roma: ROMA_1995,
  fiorentina: FIORENTINA_1995,
  sampdoria: SAMPDORIA_1995,
  napoli: NAPOLI_1995,
  atalanta: ATALANTA_1995,
  udinese: UDINESE_1995,
  vicenza: VICENZA_1995,
  torino: TORINO_1995,
  cagliari: CAGLIARI_1995,
  piacenza: PIACENZA_1995,
};

// ── European context: the clubs that sold to / bought from Serie A ─────────────
export const BORDEAUX_1995: CuratedSeed[] = [
  q('bordeaux', 'zidane_b', 'Zinedine Zidane', 1972, 'France', ['AM', 'CM'], 84, 93, 1998, 25, t(9, 6, 8, 6, 4, 7)),
  q('bordeaux', 'dugarry', 'Christophe Dugarry', 1972, 'France', ['ST'], 79, 82, 1998, 30, t(6, 7, 7, 6, 6, 6)),
  q('bordeaux', 'lizarazu_b', 'Bixente Lizarazu', 1969, 'France', ['LB'], 82, 83, 1997, 25, t(8, 5, 7, 7, 4, 7)),
];
export const AJAX_1995: CuratedSeed[] = [
  q('ajax', 'kluivert_aj', 'Patrick Kluivert', 1976, 'Netherlands', ['ST'], 78, 88, 1998, 30, t(6, 7, 7, 6, 6, 7)),
  q('ajax', 'davids_aj', 'Edgar Davids', 1973, 'Netherlands', ['DM', 'CM'], 82, 86, 1997, 35, t(7, 6, 8, 6, 6, 7)),
  q('ajax', 'litmanen', 'Jari Litmanen', 1971, 'Finland', ['AM'], 84, 87, 1998, 30, t(8, 6, 8, 7, 4, 7)),
  q('ajax', 'kanu', 'Nwankwo Kanu', 1976, 'Nigeria', ['ST'], 76, 85, 1998, 40, t(7, 6, 7, 6, 5, 7)),
  q('ajax', 'overmars_aj', 'Marc Overmars', 1973, 'Netherlands', ['LW'], 82, 86, 1997, 45, t(8, 6, 8, 6, 4, 7)),
  q('ajax', 'f_de_boer', 'Frank de Boer', 1970, 'Netherlands', ['CB'], 82, 84, 1998, 25, t(8, 5, 7, 6, 3, 7)),
  q('ajax', 'bogarde', 'Winston Bogarde', 1970, 'Netherlands', ['CB', 'LB'], 78, 80, 1997, 30, t(6, 6, 6, 5, 6, 6)),
];
export const REAL_1995: CuratedSeed[] = [
  q('real_madrid', 'raul_95', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 80, 90, 2000, 20, t(9, 6, 9, 10, 3, 7), { loyalty: 92 }),
  q('real_madrid', 'hierro_95', 'Fernando Hierro', 1968, 'Spain', ['CB'], 85, 85, 1999, 25, t(9, 6, 8, 9, 4, 6)),
  q('real_madrid', 'suker', 'Davor Šuker', 1968, 'Croatia', ['ST'], 84, 85, 1999, 30, t(7, 7, 8, 6, 5, 7)),
  q('real_madrid', 'mijatovic', 'Predrag Mijatović', 1969, 'Montenegro', ['ST', 'AM'], 83, 84, 1999, 30, t(7, 7, 8, 6, 5, 7)),
];
export const BARCA_1995: CuratedSeed[] = [
  // Ronaldo is NOT here in 1995 — he was at PSV (see PSV_95 in curated-europe-1995)
  // and only moved to Barça in 1996 (that real move is in LEDGER_1995_2001).
  q('barcelona', 'figo_95', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 85, 89, 1999, 25, t(8, 7, 8, 6, 4, 7)),
  q('barcelona', 'guardiola_95', 'Pep Guardiola', 1971, 'Spain', ['DM', 'CM'], 82, 83, 1999, 25, t(9, 6, 8, 9, 3, 7)),
];
export const CHELSEA_1995: CuratedSeed[] = [
  q('chelsea', 'gullit', 'Ruud Gullit', 1962, 'Netherlands', ['AM', 'CB'], 82, 82, 1997, 30, t(8, 7, 8, 6, 5, 7)),
  q('chelsea', 'hughes_c', 'Mark Hughes', 1963, 'Wales', ['ST'], 79, 79, 1997, 30, t(8, 6, 7, 7, 6, 6)),
  q('chelsea', 'wise', 'Dennis Wise', 1966, 'England', ['CM'], 78, 79, 1999, 30, t(6, 7, 8, 8, 7, 6)),
];
// Manchester United, 1995–96 — Ferguson's Double winners ("you can't win anything
// with kids"), the English force the European board must reckon with.
export const MANUTD_1995: CuratedSeed[] = [
  q('man_utd', 'schmeichel_mu95', 'Peter Schmeichel', 1963, 'Denmark', ['GK'], 88, 89, 1999, 20, t(9, 7, 9, 8, 5, 6)),
  q('man_utd', 'gneville_mu95', 'Gary Neville', 1975, 'England', ['RB'], 76, 84, 2001, 25, t(9, 5, 8, 10, 4, 7), { loyalty: 94 }),
  q('man_utd', 'irwin_mu95', 'Denis Irwin', 1965, 'Ireland', ['LB', 'RB'], 82, 82, 1999, 22, t(9, 3, 7, 9, 2, 8)),
  q('man_utd', 'pallister_mu95', 'Gary Pallister', 1965, 'England', ['CB'], 84, 84, 1998, 25, t(8, 5, 7, 8, 3, 7)),
  q('man_utd', 'bruce_mu95', 'Steve Bruce', 1960, 'England', ['CB'], 80, 80, 1997, 30, t(9, 6, 8, 9, 4, 6)),
  q('man_utd', 'may_mu95', 'David May', 1970, 'England', ['CB'], 74, 76, 1998, 35, t(6, 6, 6, 7, 5, 6)),
  q('man_utd', 'pneville_mu95', 'Phil Neville', 1977, 'England', ['LB', 'CM'], 72, 82, 2001, 25, t(8, 4, 7, 9, 3, 8)),
  q('man_utd', 'keane_mu95', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 86, 90, 2000, 40, t(9, 7, 10, 8, 8, 6)),
  q('man_utd', 'butt_mu95', 'Nicky Butt', 1975, 'England', ['CM', 'DM'], 74, 82, 2001, 25, t(8, 4, 7, 9, 4, 7)),
  q('man_utd', 'beckham_mu95', 'David Beckham', 1975, 'England', ['RW', 'CM'], 74, 90, 2002, 20, t(9, 7, 9, 8, 4, 7)),
  q('man_utd', 'giggs_mu95', 'Ryan Giggs', 1973, 'Wales', ['LW'], 84, 88, 2001, 30, t(9, 5, 8, 10, 3, 7), { loyalty: 95 }),
  q('man_utd', 'sharpe_mu95', 'Lee Sharpe', 1971, 'England', ['LW', 'LB'], 76, 78, 1997, 35, t(6, 6, 7, 6, 6, 7)),
  q('man_utd', 'scholes_mu95', 'Paul Scholes', 1974, 'England', ['CM', 'ST'], 74, 90, 2001, 20, t(9, 3, 8, 10, 5, 7), { loyalty: 95 }),
  q('man_utd', 'cantona_mu95', 'Eric Cantona', 1966, 'France', ['AM', 'ST'], 89, 90, 1998, 25, t(7, 9, 9, 8, 8, 7)),
  q('man_utd', 'cole_mu95', 'Andy Cole', 1971, 'England', ['ST'], 82, 84, 1999, 30, t(7, 7, 8, 7, 6, 6)),
  q('man_utd', 'mcclair_mu95', 'Brian McClair', 1963, 'Scotland', ['ST', 'CM'], 76, 76, 1997, 25, t(9, 4, 7, 9, 3, 7)),
];
// Liverpool, 1995–96 — Roy Evans' entertainers, McManaman and Fowler at the fore.
export const LIVERPOOL_1995: CuratedSeed[] = [
  q('liverpool', 'james_lv95', 'David James', 1970, 'England', ['GK'], 79, 82, 1999, 30, t(6, 6, 7, 7, 6, 6)),
  q('liverpool', 'rjones_lv95', 'Rob Jones', 1971, 'England', ['RB'], 78, 80, 1998, 45, t(8, 4, 7, 9, 4, 7)),
  q('liverpool', 'mcateer_lv95', 'Jason McAteer', 1971, 'Ireland', ['RB', 'CM'], 76, 78, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('liverpool', 'bjornebye_lv95', 'Stig Inge Bjørnebye', 1969, 'Norway', ['LB'], 76, 78, 1999, 30, t(8, 4, 7, 7, 4, 7)),
  q('liverpool', 'mwright_lv95', 'Mark Wright', 1963, 'England', ['CB'], 79, 79, 1998, 35, t(8, 5, 7, 7, 5, 6)),
  q('liverpool', 'ruddock_lv95', 'Neil Ruddock', 1968, 'England', ['CB'], 77, 78, 1998, 40, t(6, 6, 7, 7, 7, 6)),
  q('liverpool', 'scales_lv95', 'John Scales', 1966, 'England', ['CB'], 76, 77, 1998, 30, t(8, 4, 7, 7, 4, 7)),
  q('liverpool', 'babb_lv95', 'Phil Babb', 1970, 'Ireland', ['CB'], 76, 78, 1999, 30, t(7, 5, 7, 6, 5, 7)),
  q('liverpool', 'redknapp_lv95', 'Jamie Redknapp', 1973, 'England', ['CM'], 80, 84, 2000, 45, t(8, 5, 8, 8, 4, 7)),
  q('liverpool', 'barnes_lv95', 'John Barnes', 1963, 'England', ['CM', 'AM'], 81, 82, 1997, 30, t(8, 6, 8, 9, 4, 7)),
  q('liverpool', 'mthomas_lv95', 'Michael Thomas', 1967, 'England', ['CM', 'DM'], 76, 77, 1998, 35, t(7, 5, 7, 7, 5, 7)),
  q('liverpool', 'mcmanaman_lv95', 'Steve McManaman', 1972, 'England', ['RW', 'AM'], 83, 85, 1999, 25, t(7, 6, 7, 6, 4, 8)),
  q('liverpool', 'fowler_lv95', 'Robbie Fowler', 1975, 'England', ['ST'], 84, 87, 2001, 35, t(6, 7, 8, 9, 6, 6)),
  q('liverpool', 'collymore_lv95', 'Stan Collymore', 1971, 'England', ['ST'], 82, 84, 1999, 35, t(4, 8, 7, 5, 8, 5)),
  q('liverpool', 'rush_lv95', 'Ian Rush', 1961, 'Wales', ['ST'], 79, 79, 1996, 30, t(9, 6, 8, 9, 4, 7)),
];
export const NEWCASTLE_1995: CuratedSeed[] = [
  q('newcastle', 'ferdinand_l', 'Les Ferdinand', 1966, 'England', ['ST'], 82, 83, 1998, 30, t(8, 6, 8, 7, 5, 6)),
  q('newcastle', 'ginola', 'David Ginola', 1967, 'France', ['LW'], 82, 83, 1998, 30, t(6, 7, 7, 6, 6, 6)),
  q('newcastle', 'beardsley', 'Peter Beardsley', 1961, 'England', ['AM', 'ST'], 79, 79, 1997, 25, t(9, 5, 7, 9, 4, 6)),
];
export const MIDDLESBROUGH_1995: CuratedSeed[] = [
  q('middlesbrough', 'juninho_m', 'Juninho Paulista', 1973, 'Brazil', ['AM'], 82, 85, 1999, 30, t(8, 6, 8, 6, 5, 7)),
  q('middlesbrough', 'barmby', 'Nick Barmby', 1974, 'England', ['AM'], 78, 82, 1999, 30, t(7, 6, 7, 6, 5, 7)),
];
export const DORTMUND_1995: CuratedSeed[] = [
  q('dortmund', 'sammer', 'Matthias Sammer', 1967, 'Germany', ['CB', 'DM'], 85, 86, 1998, 30, t(9, 6, 9, 8, 5, 7)),
  q('dortmund', 'moller', 'Andreas Möller', 1967, 'Germany', ['AM'], 83, 84, 1998, 30, t(7, 7, 8, 6, 5, 7)),
  q('dortmund', 'chapuisat', 'Stéphane Chapuisat', 1969, 'Switzerland', ['ST', 'LW'], 81, 82, 1998, 30, t(8, 5, 7, 7, 4, 7)),
];
export const MONACO_1995: CuratedSeed[] = [
  q('monaco', 'henry_m', 'Thierry Henry', 1977, 'France', ['LW', 'ST'], 74, 92, 2000, 25, t(9, 6, 9, 7, 4, 8)),
  q('monaco', 'trezeguet_m', 'David Trezeguet', 1977, 'France', ['ST'], 74, 88, 2001, 30, t(7, 6, 8, 7, 5, 7)),
  q('monaco', 'barthez', 'Fabien Barthez', 1971, 'France', ['GK'], 83, 85, 1999, 25, t(6, 7, 8, 6, 6, 7)),
];
export const ATLETICO_1995: CuratedSeed[] = [
  q('atletico', 'kiko', 'Kiko', 1972, 'Spain', ['ST', 'AM'], 80, 82, 1999, 30, t(7, 6, 7, 7, 5, 7)),
  q('atletico', 'caminero', 'José Luis Caminero', 1967, 'Spain', ['CM', 'AM'], 79, 80, 1998, 30, t(8, 5, 7, 7, 4, 7)),
];
export const KYIV_1995: CuratedSeed[] = [
  q('dynamo_kyiv', 'shevchenko_k', 'Andriy Shevchenko', 1976, 'Ukraine', ['ST'], 80, 91, 1999, 25, t(8, 6, 9, 7, 4, 7)),
  q('dynamo_kyiv', 'rebrov', 'Serhiy Rebrov', 1974, 'Ukraine', ['ST'], 80, 84, 1999, 30, t(8, 6, 8, 7, 5, 7)),
];

// FC Porto — in the pack so Mourinho's 2004 European Cup (the one final of the run
// not taken by a giant) can be anchored to reality rather than defaulting to sim.
// The starting XI is Bobby Robson's 1995-96 champions; the club endures to 2004.
export const PORTO_1995: CuratedSeed[] = [
  q('porto', 'baia_po95', 'Vítor Baía', 1969, 'Portugal', ['GK'], 82, 83, 1999, 25, t(8, 6, 7, 9, 5, 6)),
  q('porto', 'joaopinto_po95', 'João Pinto', 1961, 'Portugal', ['RB'], 76, 76, 1997, 25, t(8, 5, 7, 9, 4, 6)),
  q('porto', 'jorgecosta_po95', 'Jorge Costa', 1971, 'Portugal', ['CB'], 76, 80, 2000, 30, t(8, 6, 8, 9, 5, 6)),
  q('porto', 'aloisio_po95', 'Aloísio', 1963, 'Brazil', ['CB'], 76, 76, 1997, 30, t(8, 5, 7, 7, 5, 6)),
  q('porto', 'ruijorge_po95', 'Rui Jorge', 1973, 'Portugal', ['LB'], 75, 78, 1999, 25, t(8, 4, 7, 7, 4, 7)),
  q('porto', 'secretario_po95', 'Secretário', 1976, 'Portugal', ['RB'], 74, 78, 2000, 25, t(8, 4, 7, 7, 4, 7)),
  q('porto', 'emerson_po95', 'Emerson', 1972, 'Brazil', ['DM', 'CM'], 77, 79, 1998, 30, t(7, 5, 7, 6, 5, 7)),
  q('porto', 'paulinho_po95', 'Paulinho Santos', 1972, 'Portugal', ['CM'], 75, 77, 1998, 25, t(8, 4, 7, 8, 4, 7)),
  q('porto', 'ruibarros_po95', 'Rui Barros', 1965, 'Portugal', ['AM'], 78, 78, 1997, 30, t(8, 6, 7, 8, 5, 7)),
  q('porto', 'drulovic_po95', 'Ljubinko Drulović', 1968, 'Serbia', ['LW', 'RW'], 77, 78, 1998, 30, t(7, 5, 7, 6, 5, 7)),
  q('porto', 'domingos_po95', 'Domingos Paciência', 1969, 'Portugal', ['ST'], 79, 80, 1998, 30, t(8, 6, 8, 8, 5, 6)),
  q('porto', 'jardel_po95', 'Mário Jardel', 1973, 'Brazil', ['ST'], 80, 85, 2000, 30, t(7, 7, 8, 6, 5, 7)),
  q('porto', 'folha_po95', 'Rui Filipe', 1970, 'Portugal', ['CM', 'DM'], 72, 74, 1998, 25, t(8, 4, 6, 7, 4, 7)),
];
export const BAYERN_1995: CuratedSeed[] = [
  q('bayern', 'kahn_95', 'Oliver Kahn', 1969, 'Germany', ['GK'], 84, 88, 2000, 20, t(9, 7, 9, 9, 5, 6)),
  q('bayern', 'matthaus', 'Lothar Matthäus', 1961, 'Germany', ['DM', 'CB'], 84, 84, 1998, 25, t(8, 8, 9, 7, 5, 7)),
  q('bayern', 'klinsmann', 'Jürgen Klinsmann', 1964, 'Germany', ['ST'], 84, 85, 1997, 25, t(9, 6, 8, 6, 5, 8)),
  q('bayern', 'scholl_95', 'Mehmet Scholl', 1970, 'Germany', ['AM'], 81, 83, 1999, 30, t(7, 6, 7, 8, 5, 7)),
  q('bayern', 'helmer', 'Thomas Helmer', 1965, 'Germany', ['CB'], 80, 81, 1998, 25, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'ziege', 'Christian Ziege', 1972, 'Germany', ['LB', 'LW'], 80, 82, 1998, 25, t(8, 5, 7, 7, 4, 7)),
];

export const CONTEXT_1995_SQUADS: Record<string, CuratedSeed[]> = {
  bordeaux: BORDEAUX_1995,
  ajax: AJAX_1995,
  real_madrid: REAL_1995,
  barcelona: BARCA_1995,
  bayern: BAYERN_1995,
  man_utd: MANUTD_1995,
  liverpool: LIVERPOOL_1995,
  porto: PORTO_1995,
  chelsea: CHELSEA_1995,
  newcastle: NEWCASTLE_1995,
  middlesbrough: MIDDLESBROUGH_1995,
  dortmund: DORTMUND_1995,
  monaco: MONACO_1995,
  atletico: ATLETICO_1995,
  dynamo_kyiv: KYIV_1995,
};

/**
 * Further real depth across the era, so any realistic signing for a playable
 * Italian club exists in the database (user directive). Merged in as [club,seed].
 */
export const DEPTH_1995: Array<[ClubId, CuratedSeed]> = [
  // Serie A depth
  ['juventus', q('juventus', 'chimenti', 'Antonio Chimenti', 1970, 'Italy', ['GK'], 72, 74, 1999, 25, t(8, 4, 6, 8, 4, 6))],
  ['milan', q('milan', 'panucci', 'Christian Panucci', 1969, 'Italy', ['RB', 'CB'], 81, 83, 1999, 25, t(7, 6, 7, 6, 5, 7))],
  ['milan', q('milan', 'lentini', 'Gianluigi Lentini', 1969, 'Italy', ['RW'], 76, 78, 1997, 40, t(6, 6, 6, 7, 6, 6))],
  ['milan', q('milan', 'dicanio', 'Paolo Di Canio', 1968, 'Italy', ['ST', 'AM'], 78, 80, 1998, 30, t(5, 8, 8, 6, 8, 6))],
  ['inter', q('inter', 'festa', 'Gianluca Festa', 1969, 'Italy', ['CB'], 77, 78, 1998, 25, t(8, 4, 7, 7, 4, 7))],
  ['inter', q('inter', 'paganin', 'Massimo Paganin', 1970, 'Italy', ['CB'], 75, 77, 1998, 25, t(8, 4, 6, 7, 4, 7))],
  ['lazio', q('lazio', 'nesta_l', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 76, 90, 2001, 25, t(9, 5, 8, 9, 3, 7), { loyalty: 88 })],
  ['lazio', q('lazio', 'gottardi', 'Luca Gottardi', 1972, 'Italy', ['CM'], 73, 75, 1998, 25, t(8, 4, 6, 7, 4, 7))],
  ['parma', q('parma', 'apolloni', 'Luigi Apolloni', 1967, 'Italy', ['CB'], 78, 79, 1998, 25, t(8, 4, 7, 8, 4, 6))],
  ['parma', q('parma', 'fontolan', 'Roberto Fontolan', 1968, 'Italy', ['RB'], 74, 75, 1998, 25, t(8, 4, 6, 7, 4, 7))],
  ['roma', q('roma', 'di_francesco', 'Eusebio Di Francesco', 1969, 'Italy', ['CM'], 77, 79, 1999, 30, t(8, 5, 7, 7, 4, 7))],
  ['roma', q('roma', 'statuto', 'Damiano Tommasi', 1974, 'Italy', ['CM', 'DM'], 75, 83, 2001, 25, t(9, 4, 8, 8, 3, 7))],
  ['fiorentina', q('fiorentina', 'cois', 'Sandro Cois', 1972, 'Italy', ['CM', 'DM'], 77, 79, 1999, 30, t(8, 5, 7, 7, 4, 7))],
  ['fiorentina', q('fiorentina', 'flachi', 'Francesco Flachi', 1975, 'Italy', ['ST', 'AM'], 72, 78, 2000, 30, t(6, 6, 7, 7, 6, 6))],
  ['sampdoria', q('sampdoria', 'salsano', 'Fausto Salsano', 1962, 'Italy', ['CM'], 74, 74, 1997, 30, t(8, 4, 6, 8, 4, 6))],
  ['sampdoria', q('sampdoria', 'montella_s', 'Vincenzo Montella', 1974, 'Italy', ['ST'], 76, 83, 2000, 30, t(7, 6, 8, 7, 5, 6))],
  ['napoli', q('napoli', 'pistone', 'Alessandro Pistone', 1975, 'Italy', ['LB', 'CB'], 74, 80, 2000, 25, t(8, 4, 7, 7, 4, 7))],
  ['napoli', q('napoli', 'andre_cruz', 'André Cruz', 1968, 'Brazil', ['CB'], 76, 77, 1998, 30, t(7, 5, 6, 6, 5, 7))],
  ['atalanta', q('atalanta', 'bianchezi', 'Christian Bianchezi', 1971, 'Italy', ['RB'], 72, 74, 1998, 25, t(8, 4, 6, 7, 4, 7))],
  ['udinese', q('udinese', 'pierini', 'Stefano Pierini', 1971, 'Italy', ['LW'], 72, 74, 1998, 30, t(7, 5, 6, 6, 5, 7))],
  ['torino', q('torino', 'sordo', 'Giuseppe Sordo', 1974, 'Italy', ['CM'], 71, 74, 1998, 25, t(8, 4, 6, 7, 4, 7))],
  ['cagliari', q('cagliari', 'muzzi', 'Roberto Muzzi', 1971, 'Italy', ['ST'], 75, 78, 1999, 30, t(7, 5, 7, 6, 5, 6))],
  // European depth
  ['bayern', q('bayern', 'strunz', 'Thomas Strunz', 1968, 'Germany', ['CM', 'RB'], 78, 79, 1998, 25, t(8, 5, 7, 7, 4, 7))],
  ['bayern', q('bayern', 'babbel', 'Markus Babbel', 1972, 'Germany', ['CB', 'RB'], 79, 82, 1999, 25, t(8, 5, 7, 7, 4, 7))],
  ['dortmund', q('dortmund', 'riedle', 'Karl-Heinz Riedle', 1965, 'Germany', ['ST'], 80, 80, 1997, 30, t(8, 5, 7, 7, 4, 6))],
  ['dortmund', q('dortmund', 'ricken', 'Lars Ricken', 1976, 'Germany', ['AM', 'ST'], 74, 82, 2000, 30, t(8, 5, 7, 8, 4, 7))],
  ['dortmund', q('dortmund', 'reuter', 'Stefan Reuter', 1966, 'Germany', ['RB'], 79, 79, 1998, 25, t(8, 4, 7, 8, 4, 7))],
  ['ajax', q('ajax', 'ronald_de_boer', 'Ronald de Boer', 1970, 'Netherlands', ['AM', 'ST'], 81, 82, 1998, 25, t(8, 5, 7, 6, 4, 7))],
  ['ajax', q('ajax', 'finidi', 'Finidi George', 1971, 'Nigeria', ['RW'], 80, 81, 1997, 30, t(7, 6, 7, 6, 5, 7))],
  ['ajax', q('ajax', 'blind', 'Danny Blind', 1961, 'Netherlands', ['CB'], 80, 80, 1997, 25, t(9, 5, 7, 9, 3, 6))],
  ['real_madrid', q('real_madrid', 'redondo_r', 'Fernando Redondo', 1969, 'Argentina', ['DM', 'CM'], 85, 86, 1999, 30, t(8, 5, 7, 6, 3, 7))],
  ['real_madrid', q('real_madrid', 'sanchis', 'Manolo Sanchís', 1965, 'Spain', ['CB'], 82, 82, 1998, 25, t(9, 5, 7, 10, 3, 6), { loyalty: 95 })],
  ['barcelona', q('barcelona', 'nadal_b', 'Miguel Ángel Nadal', 1966, 'Spain', ['CB', 'DM'], 81, 82, 1998, 30, t(8, 5, 7, 8, 5, 6))],
  ['barcelona', q('barcelona', 'sergi_b', 'Sergi Barjuán', 1971, 'Spain', ['LB'], 80, 81, 1999, 25, t(8, 5, 7, 9, 4, 7))],
  ['monaco', q('monaco', 'petit_m', 'Emmanuel Petit', 1970, 'France', ['DM', 'CB'], 81, 83, 1997, 25, t(7, 5, 7, 6, 5, 7))],
  ['monaco', q('monaco', 'legwinski', 'Sylvain Legwinski', 1973, 'France', ['CM'], 74, 78, 1999, 25, t(8, 4, 7, 6, 4, 7))],
  ['newcastle', q('newcastle', 'lee_r', 'Robert Lee', 1966, 'England', ['CM'], 78, 79, 1998, 25, t(8, 5, 7, 8, 4, 6))],
  ['chelsea', q('chelsea', 'petrescu', 'Dan Petrescu', 1967, 'Romania', ['RB', 'RW'], 78, 79, 1999, 25, t(8, 5, 7, 6, 5, 7))],
  ['atletico', q('atletico', 'pantic', 'Milinko Pantić', 1966, 'Serbia', ['AM'], 79, 80, 1998, 30, t(7, 6, 7, 6, 5, 7))],
  ['atletico', q('atletico', 'simeone_a', 'Diego Simeone', 1970, 'Argentina', ['CM', 'DM'], 82, 84, 1999, 30, t(7, 7, 9, 6, 8, 6))],
  // Serie A minnows — recognisable faces so promotions/relegations have real names
  ['padova', q('padova', 'vlaovic', 'Goran Vlaović', 1972, 'Croatia', ['ST'], 78, 80, 1997, 30, t(7, 6, 7, 6, 5, 7))],
  ['vicenza', q('vicenza', 'di_napoli', 'Giuseppe Di Napoli', 1968, 'Italy', ['ST'], 74, 75, 1998, 30, t(7, 5, 6, 6, 5, 6))],
  ['cremonese', q('cremonese', 'maspero', 'Marco Maspero', 1972, 'Italy', ['CM'], 73, 76, 1998, 25, t(8, 4, 6, 7, 4, 7))],
  ['bari', q('bari', 'loseto', 'Nicola Loseto', 1971, 'Italy', ['CM'], 71, 74, 1998, 25, t(8, 4, 6, 7, 4, 7))],
  ['bari', q('bari', 'zambrotta_j', 'Gianluca Zambrotta', 1977, 'Italy', ['RB', 'LB', 'LW'], 74, 85, 2000, 25, t(8, 5, 8, 7, 4, 7))],
  ['cagliari', q('cagliari', 'herrera_c', 'José Herrera', 1967, 'Argentina', ['ST'], 74, 75, 1998, 30, t(7, 5, 6, 6, 5, 7))],
  ['torino', q('torino', 'sinigaglia', 'Roberto Sinigaglia', 1968, 'Italy', ['DM'], 72, 73, 1998, 25, t(8, 4, 6, 7, 4, 7))],
  ['juventus', q('juventus', 'dimas', 'Dimas', 1969, 'Portugal', ['LB', 'CB'], 76, 77, 1998, 25, t(8, 4, 7, 7, 4, 7))],
  ['fiorentina', q('fiorentina', 'bigica', 'Emiliano Bigica', 1972, 'Italy', ['ST'], 71, 74, 1998, 30, t(7, 5, 6, 7, 5, 6))],
  ['bordeaux', q('bordeaux', 'grenet', 'François Grenet', 1975, 'France', ['RB'], 73, 78, 1999, 25, t(8, 4, 7, 6, 4, 7))],
  ['real_madrid', q('real_madrid', 'amavisca', 'José Amavisca', 1971, 'Spain', ['LW', 'AM'], 77, 78, 1998, 30, t(7, 5, 7, 7, 5, 7))],
];

/**
 * Full-squad completion for the playable giants abroad (§4, §14): every playable
 * club that features must field >=13 real players. All are foreign to Serie A
 * (leagueId null) — zero kickoff calibration risk (anchored strength).
 */
export const REAL_1995_EXTRA: CuratedSeed[] = [
  q('real_madrid', 'buyo_rm95', 'Francisco Buyo', 1958, 'Spain', ['GK'], 78, 78, 1997, 25, t(8, 5, 7, 9, 4, 6)),
  q('real_madrid', 'alkorta_rm95', 'Rafael Alkorta', 1968, 'Spain', ['CB'], 80, 80, 1998, 25, t(8, 5, 7, 8, 4, 6)),
  q('real_madrid', 'chendo_rm95', 'Chendo', 1961, 'Spain', ['RB'], 76, 76, 1997, 25, t(8, 4, 7, 10, 3, 6), { loyalty: 94 }),
  q('real_madrid', 'zamorano_rm95', 'Iván Zamorano', 1967, 'Chile', ['ST'], 82, 83, 1997, 30, t(8, 6, 8, 8, 5, 7)),
  q('real_madrid', 'laudrup_rm95', 'Michael Laudrup', 1964, 'Denmark', ['AM'], 85, 85, 1996, 25, t(9, 6, 8, 6, 4, 8)),
  q('real_madrid', 'luisenrique_rm95', 'Luís Enrique', 1970, 'Spain', ['CM', 'RW'], 82, 84, 1996, 30, t(9, 6, 9, 7, 4, 7)),
];
export const BARCA_1995_EXTRA: CuratedSeed[] = [
  q('barcelona', 'busquets_ba95', 'Carles Busquets', 1967, 'Spain', ['GK'], 76, 76, 1998, 25, t(7, 5, 6, 9, 5, 6)),
  q('barcelona', 'ferrer_ba95', 'Albert Ferrer', 1970, 'Spain', ['RB'], 79, 80, 1998, 25, t(8, 4, 7, 8, 4, 7)),
  q('barcelona', 'abelardo_ba95', 'Abelardo', 1970, 'Spain', ['CB'], 81, 82, 1999, 30, t(8, 5, 7, 8, 5, 6)),
  q('barcelona', 'popescu_ba95', 'Gheorghe Popescu', 1967, 'Romania', ['CB', 'DM'], 82, 83, 1998, 25, t(8, 5, 8, 6, 4, 7)),
  q('barcelona', 'bakero_ba95', 'José Mari Bakero', 1963, 'Spain', ['CM', 'AM'], 80, 80, 1997, 25, t(9, 5, 8, 9, 4, 6)),
  q('barcelona', 'kodro_ba95', 'Meho Kodro', 1967, 'Bosnia', ['ST'], 79, 80, 1998, 30, t(7, 6, 7, 6, 5, 7)),
  q('barcelona', 'prosinecki_ba95', 'Robert Prosinečki', 1969, 'Croatia', ['AM'], 82, 83, 1997, 45, t(6, 7, 7, 6, 6, 6)),
  q('barcelona', 'jordicruyff_ba95', 'Jordi Cruyff', 1974, 'Netherlands', ['AM', 'ST'], 76, 79, 1996, 30, t(7, 6, 7, 6, 4, 7)),
  // Homegrown, breaking through in 1995-96 (backfills the slot Ronaldo vacated when
  // he was moved to his real 1995 club, PSV).
  q('barcelona', 'delapenya_ba95', 'Iván de la Peña', 1976, 'Spain', ['AM', 'DM'], 76, 84, 1999, 25, t(8, 6, 8, 8, 4, 7)),
];
export const BAYERN_1995_EXTRA: CuratedSeed[] = [
  q('bayern', 'herzog_by95', 'Andreas Herzog', 1968, 'Austria', ['AM'], 79, 80, 1998, 30, t(7, 6, 7, 6, 5, 7)),
  q('bayern', 'papin_by95', 'Jean-Pierre Papin', 1963, 'France', ['ST'], 80, 80, 1996, 35, t(8, 7, 8, 6, 5, 7)),
  q('bayern', 'nerlinger_by95', 'Christian Nerlinger', 1973, 'Germany', ['CM', 'DM'], 76, 79, 1999, 30, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'hamann_by95', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 76, 84, 2000, 30, t(8, 4, 7, 6, 3, 7)),
  q('bayern', 'zickler_by95', 'Alexander Zickler', 1974, 'Germany', ['ST'], 74, 78, 1999, 35, t(7, 5, 7, 7, 5, 6)),
];
/** Arsenal, 1995–96 — Rioch's season; Bergkamp just arrived, Wenger a year off. */
export const ARSENAL_1995: CuratedSeed[] = [
  q('arsenal', 'seaman_ar95', 'David Seaman', 1963, 'England', ['GK'], 84, 84, 1999, 25, t(8, 6, 8, 9, 3, 6)),
  q('arsenal', 'dixon_ar95', 'Lee Dixon', 1964, 'England', ['RB'], 78, 78, 1998, 25, t(9, 4, 7, 9, 3, 6)),
  q('arsenal', 'adams_ar95', 'Tony Adams', 1966, 'England', ['CB'], 84, 85, 1999, 30, t(9, 7, 9, 10, 4, 6), { loyalty: 96 }),
  q('arsenal', 'bould_ar95', 'Steve Bould', 1962, 'England', ['CB'], 79, 79, 1997, 30, t(8, 4, 7, 8, 4, 6)),
  q('arsenal', 'winterburn_ar95', 'Nigel Winterburn', 1963, 'England', ['LB'], 78, 78, 1998, 25, t(9, 4, 7, 9, 3, 6)),
  q('arsenal', 'keown_ar95', 'Martin Keown', 1966, 'England', ['CB'], 79, 81, 1999, 30, t(8, 6, 8, 9, 5, 6)),
  q('arsenal', 'platt_ar95', 'David Platt', 1966, 'England', ['CM'], 81, 82, 1998, 30, t(9, 6, 8, 8, 4, 7)),
  q('arsenal', 'merson_ar95', 'Paul Merson', 1968, 'England', ['AM', 'ST'], 80, 81, 1998, 30, t(5, 7, 7, 7, 7, 6)),
  q('arsenal', 'wright_ar95', 'Ian Wright', 1963, 'England', ['ST'], 84, 84, 1998, 30, t(7, 8, 9, 9, 6, 6)),
  q('arsenal', 'bergkamp_ar95', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 86, 88, 1999, 20, t(9, 6, 8, 8, 3, 6)),
  q('arsenal', 'hartson_ar95', 'John Hartson', 1975, 'Wales', ['ST'], 76, 80, 1999, 35, t(6, 7, 7, 6, 7, 6)),
  q('arsenal', 'parlour_ar95', 'Ray Parlour', 1973, 'England', ['CM', 'RW'], 76, 80, 1999, 25, t(8, 5, 7, 8, 5, 7)),
  q('arsenal', 'helder_ar95', 'Glenn Helder', 1968, 'Netherlands', ['LW'], 74, 76, 1998, 30, t(6, 6, 6, 6, 6, 7)),
];
export const CHELSEA_1995_EXTRA: CuratedSeed[] = [
  q('chelsea', 'kharine_ch95', 'Dmitri Kharine', 1968, 'Russia', ['GK'], 78, 79, 1998, 30, t(7, 5, 7, 7, 5, 6)),
  q('chelsea', 'clarke_ch95', 'Steve Clarke', 1963, 'Scotland', ['RB', 'CB'], 77, 77, 1997, 25, t(9, 4, 7, 9, 3, 6)),
  q('chelsea', 'sinclair_ch95', 'Frank Sinclair', 1971, 'Jamaica', ['CB', 'RB'], 76, 78, 1999, 25, t(7, 5, 7, 7, 5, 7)),
  q('chelsea', 'duberry_ch95', 'Michael Duberry', 1975, 'England', ['CB'], 74, 80, 2000, 30, t(7, 5, 7, 7, 5, 6)),
  q('chelsea', 'phelan_ch95', 'Terry Phelan', 1967, 'Ireland', ['LB'], 74, 75, 1998, 30, t(7, 4, 6, 7, 5, 7)),
  q('chelsea', 'burley_ch95', 'Craig Burley', 1971, 'Scotland', ['CM'], 76, 79, 1999, 25, t(8, 5, 7, 7, 5, 7)),
  q('chelsea', 'peacock_ch95', 'Gavin Peacock', 1967, 'England', ['AM', 'CM'], 75, 76, 1997, 25, t(8, 5, 7, 7, 4, 6)),
  q('chelsea', 'spencer_ch95', 'John Spencer', 1970, 'Scotland', ['ST'], 77, 78, 1998, 30, t(7, 6, 7, 7, 6, 6)),
  q('chelsea', 'furlong_ch95', 'Paul Furlong', 1968, 'England', ['ST'], 74, 75, 1998, 30, t(7, 5, 7, 6, 5, 6)),
];

/** Curated squads for the Lippi-era Juventus start, keyed by club. */
export const JUVENTUS_1995_SQUADS: Record<string, CuratedSeed[]> = {
  ...SERIE_A_1995_SQUADS,
  ...CONTEXT_1995_SQUADS,
  arsenal: ARSENAL_1995,
};
for (const [club, seed] of DEPTH_1995) {
  (JUVENTUS_1995_SQUADS[club] ??= []).push(seed);
}
// Full-squad completion for the playable giants abroad (§4, §14).
for (const extra of [REAL_1995_EXTRA, BARCA_1995_EXTRA, BAYERN_1995_EXTRA, CHELSEA_1995_EXTRA]) {
  for (const seed of extra) (JUVENTUS_1995_SQUADS[seed.club as ClubId] ??= []).push(seed);
}

// European selling clubs (M12A rollout) — the 1995-96 foreign talent pipeline
// (shared with milan-1995). All whole new clubs merged into the 1995 universe.
for (const [club, seeds] of Object.entries(EUROPE_1995_SQUADS)) {
  JUVENTUS_1995_SQUADS[club] = [...(JUVENTUS_1995_SQUADS[club] ?? []), ...seeds];
}

// Domestic mid-tier top-up of the 1995-96 Serie A (M12 shortlist supply) — real
// squad players at the thin non-elite clubs so options lists read like a real
// shortlist.
for (const [club, seeds] of Object.entries(ITA_DOMESTIC_1995_SQUADS)) {
  JUVENTUS_1995_SQUADS[club] = [...(JUVENTUS_1995_SQUADS[club] ?? []), ...seeds];
}
