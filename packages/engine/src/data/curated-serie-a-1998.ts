/**
 * Curated real players — 1998 Serie A "Il Fenomeno" pack (Italy; §4, §17.10).
 *
 * The vertical slice for "Internazionale — 1998: Il Fenomeno". Serie A 1998–99 as
 * it really was, built around the greatest attacking talent ever hoarded at one
 * club: Ronaldo at his supernatural peak, flanked by Roberto Baggio, Iván
 * Zamorano and Youri Djorkaeff — a forward line so overstocked it strangled its
 * own balance (the very tension the squad-chemistry mechanic models). Around
 * Inter, the calcio golden age: the Zaccheroni Milan who would pip them to the
 * 1999 Scudetto, Lippi's Juventus, Eriksson's Lazio, Ancelotti's Juve-to-come,
 * and the Parmalat-funded Parma of Buffon/Cannavaro/Thuram/Crespo/Verón.
 *
 * The looming shadow is Ronaldo's knee: his 1999–2000 rupture is the era's great
 * real injury (see INJURIES_1998 in ledger.ts). Ability/potential/personality are
 * HIDDEN designer estimates (§7); clubs, birth years, positions and contracts are
 * real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { EUROPE_LATE90S_SQUADS } from './curated-europe-late90s.js';

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

// ── Internazionale, 1998–99 (Il Fenomeno; the overstocked front line) ─────────
export const INTER_1998: CuratedSeed[] = [
  q('inter', 'pagliuca', 'Gianluca Pagliuca', 1966, 'Italy', ['GK'], 83, 83, 2001, 25, t(8, 5, 7, 8, 4, 6)),
  q('inter', 'fontana_i', 'Gianluca Fontana', 1970, 'Italy', ['GK'], 72, 73, 2000, 25, t(7, 4, 6, 7, 4, 6)),
  q('inter', 'zanetti_j', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 86, 89, 2003, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 96 }),
  q('inter', 'bergomi', 'Giuseppe Bergomi', 1963, 'Italy', ['CB', 'RB'], 82, 82, 2000, 25, t(9, 5, 8, 10, 4, 6), { loyalty: 97 }),
  q('inter', 'west_i', 'Taribo West', 1974, 'Nigeria', ['CB'], 79, 81, 2001, 30, t(7, 6, 7, 6, 6, 7)),
  q('inter', 'colonnese', 'Francesco Colonnese', 1971, 'Italy', ['CB', 'LB'], 77, 79, 2001, 30, t(7, 5, 7, 7, 5, 6)),
  q('inter', 'galante', 'Fabio Galante', 1973, 'Italy', ['CB'], 76, 79, 2001, 30, t(7, 5, 7, 7, 5, 6)),
  q('inter', 'fresi', 'Salvatore Fresi', 1973, 'Italy', ['CB', 'DM'], 75, 79, 2001, 30, t(7, 5, 7, 7, 5, 6)),
  q('inter', 'simeone_i', 'Diego Simeone', 1970, 'Argentina', ['CM', 'DM'], 84, 85, 2002, 25, t(8, 7, 9, 7, 7, 7)),
  q('inter', 'cauet', 'Benoît Cauet', 1969, 'France', ['CM'], 78, 80, 2001, 25, t(8, 5, 7, 7, 5, 7)),
  q('inter', 'winter_i', 'Aron Winter', 1966, 'Netherlands', ['CM', 'DM'], 80, 80, 2000, 25, t(8, 5, 8, 7, 4, 7)),
  q('inter', 'ze_elias', 'Zé Elias', 1976, 'Brazil', ['DM', 'CM'], 76, 82, 2002, 30, t(7, 5, 7, 6, 6, 7)),
  q('inter', 'moriero', 'Francesco Moriero', 1969, 'Italy', ['RW', 'AM'], 78, 80, 2001, 30, t(7, 6, 7, 7, 6, 7)),
  q('inter', 'sforza', 'Ciriaco Sforza', 1970, 'Switzerland', ['CM', 'DM'], 77, 79, 2000, 30, t(7, 6, 7, 6, 6, 7)),
  q('inter', 'ronaldo_r9', 'Ronaldo', 1976, 'Brazil', ['ST'], 94, 96, 2003, 45, t(6, 8, 9, 6, 6, 8)),
  q('inter', 'baggio_i', 'Roberto Baggio', 1967, 'Italy', ['AM', 'ST'], 87, 87, 2000, 35, t(8, 6, 8, 6, 5, 7)),
  q('inter', 'zamorano', 'Iván Zamorano', 1967, 'Chile', ['ST'], 83, 83, 2001, 30, t(9, 6, 8, 8, 5, 7)),
  q('inter', 'djorkaeff', 'Youri Djorkaeff', 1968, 'France', ['AM', 'ST'], 84, 85, 2001, 30, t(8, 6, 8, 7, 5, 7)),
  q('inter', 'ventola', 'Nicola Ventola', 1978, 'Italy', ['ST'], 73, 84, 2003, 35, t(7, 6, 8, 7, 6, 7)),
];

// ── Juventus, 1998–99 (Lippi then Ancelotti; Del Piero's cruciate season) ─────
export const JUVENTUS_1998: CuratedSeed[] = [
  q('juventus', 'peruzzi_j', 'Angelo Peruzzi', 1970, 'Italy', ['GK'], 86, 86, 2001, 25, t(8, 6, 8, 8, 5, 6)),
  q('juventus', 'ferrara_j', 'Ciro Ferrara', 1967, 'Italy', ['CB'], 84, 84, 2001, 25, t(9, 5, 8, 8, 4, 7)),
  q('juventus', 'montero', 'Paolo Montero', 1971, 'Uruguay', ['CB'], 84, 85, 2002, 30, t(8, 6, 8, 8, 7, 6)),
  q('juventus', 'iuliano_j', 'Mark Iuliano', 1973, 'Italy', ['CB'], 80, 82, 2002, 30, t(7, 5, 7, 7, 5, 7)),
  q('juventus', 'birindelli', 'Alessandro Birindelli', 1974, 'Italy', ['RB'], 76, 79, 2002, 25, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'pessotto_j', 'Gianluca Pessotto', 1970, 'Italy', ['LB', 'RB'], 80, 81, 2002, 25, t(9, 4, 7, 9, 3, 7)),
  q('juventus', 'mirkovic', 'Zoran Mirković', 1971, 'Serbia', ['RB', 'CB'], 76, 78, 2000, 25, t(7, 5, 7, 6, 6, 7)),
  q('juventus', 'deschamps_j', 'Didier Deschamps', 1968, 'France', ['DM', 'CM'], 83, 83, 1999, 25, t(9, 6, 9, 7, 4, 7)),
  q('juventus', 'davids_j', 'Edgar Davids', 1973, 'Netherlands', ['CM', 'DM'], 85, 87, 2003, 25, t(8, 7, 9, 7, 7, 7)),
  q('juventus', 'conte_j8', 'Antonio Conte', 1969, 'Italy', ['CM'], 82, 83, 2002, 30, t(9, 7, 9, 10, 6, 6), { loyalty: 92 }),
  q('juventus', 'di_livio_j', 'Angelo Di Livio', 1966, 'Italy', ['RW', 'CM'], 78, 79, 2000, 25, t(9, 4, 8, 9, 4, 7)),
  q('juventus', 'tacchinardi_j8', 'Alessio Tacchinardi', 1975, 'Italy', ['DM', 'CM'], 79, 84, 2003, 30, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'zidane_j8', 'Zinédine Zidane', 1972, 'France', ['AM', 'CM'], 90, 94, 2002, 20, t(9, 6, 9, 7, 5, 8)),
  q('juventus', 'delpiero_j8', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 89, 91, 2003, 40, t(9, 6, 9, 10, 4, 7), { loyalty: 96 }),
  q('juventus', 'inzaghi_j', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 85, 86, 2002, 30, t(8, 7, 9, 7, 5, 7)),
  q('juventus', 'amoruso', 'Nicola Amoruso', 1974, 'Italy', ['ST'], 76, 79, 2001, 30, t(7, 6, 7, 6, 6, 7)),
  q('juventus', 'fonseca_j', 'Daniel Fonseca', 1969, 'Uruguay', ['ST'], 74, 75, 2000, 35, t(7, 5, 7, 6, 6, 6)),
];

// ── AC Milan, 1998–99 (Zaccheroni; the Scudetto champions) ────────────────────
export const MILAN_1998: CuratedSeed[] = [
  q('milan', 'abbiati', 'Christian Abbiati', 1977, 'Italy', ['GK'], 79, 85, 2003, 20, t(8, 5, 8, 9, 4, 6), { loyalty: 88 }),
  q('milan', 'rossi_s8', 'Sebastiano Rossi', 1964, 'Italy', ['GK'], 78, 78, 2000, 25, t(8, 5, 7, 8, 5, 6)),
  q('milan', 'maldini_m8', 'Paolo Maldini', 1968, 'Italy', ['LB', 'CB'], 89, 89, 2003, 20, t(10, 6, 9, 10, 3, 7), { loyalty: 99, hardBlocks: [{ reason: 'Paolo Maldini is Milan for life.', untilYear: 2099 }] }),
  q('milan', 'costacurta_8', 'Alessandro Costacurta', 1966, 'Italy', ['CB'], 83, 83, 2002, 25, t(9, 5, 8, 10, 3, 7), { loyalty: 94 }),
  q('milan', 'ngotty', 'Bruno N’Gotty', 1971, 'France', ['CB'], 78, 80, 2001, 25, t(7, 5, 7, 7, 5, 7)),
  q('milan', 'sala_c', 'Christian Sala', 1970, 'Italy', ['CB', 'RB'], 74, 75, 2000, 25, t(7, 4, 6, 7, 5, 6)),
  q('milan', 'helveg', 'Thomas Helveg', 1971, 'Denmark', ['RB', 'RW'], 80, 82, 2002, 20, t(8, 5, 8, 8, 4, 7)),
  q('milan', 'bogarde', 'Winston Bogarde', 1970, 'Netherlands', ['LB', 'CB'], 77, 79, 2001, 25, t(6, 6, 7, 6, 6, 6)),
  q('milan', 'albertini_8', 'Demetrio Albertini', 1971, 'Italy', ['CM', 'DM'], 83, 84, 2002, 25, t(9, 5, 8, 8, 3, 7)),
  q('milan', 'ambrosini', 'Massimo Ambrosini', 1977, 'Italy', ['CM', 'DM'], 76, 84, 2003, 25, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
  q('milan', 'boban_8', 'Zvonimir Boban', 1968, 'Croatia', ['AM'], 83, 83, 2001, 30, t(8, 6, 8, 7, 5, 7)),
  q('milan', 'ba_i', 'Ibrahim Ba', 1973, 'France', ['RW'], 78, 80, 2001, 30, t(6, 7, 7, 6, 6, 7)),
  q('milan', 'guglielminpietro', 'Andrés Guglielminpietro', 1974, 'Argentina', ['LW', 'LB'], 77, 79, 2002, 25, t(7, 5, 7, 7, 5, 7)),
  q('milan', 'leonardo_m', 'Leonardo', 1969, 'Brazil', ['AM', 'LW'], 83, 84, 2001, 25, t(8, 6, 8, 7, 5, 8)),
  q('milan', 'weah_8', 'George Weah', 1966, 'Liberia', ['ST'], 84, 84, 2000, 25, t(8, 6, 9, 7, 4, 7)),
  q('milan', 'bierhoff', 'Oliver Bierhoff', 1968, 'Germany', ['ST'], 83, 84, 2001, 25, t(8, 6, 8, 7, 4, 7)),
];

// ── Lazio, 1998–99 (Eriksson; Cup Winners' Cup + a title tilt) ────────────────
export const LAZIO_1998: CuratedSeed[] = [
  q('lazio', 'marchegiani', 'Luca Marchegiani', 1966, 'Italy', ['GK'], 81, 81, 2001, 25, t(8, 5, 7, 8, 4, 6)),
  q('lazio', 'nesta', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 85, 90, 2004, 25, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
  q('lazio', 'mihajlovic', 'Siniša Mihajlović', 1969, 'Serbia', ['CB', 'LB'], 82, 83, 2002, 25, t(7, 7, 8, 7, 8, 6)),
  q('lazio', 'negro', 'Paolo Negro', 1972, 'Italy', ['CB', 'RB'], 78, 79, 2002, 25, t(8, 4, 7, 8, 4, 7)),
  q('lazio', 'favalli', 'Giuseppe Favalli', 1972, 'Italy', ['LB'], 79, 81, 2002, 25, t(8, 4, 7, 8, 4, 7)),
  q('lazio', 'pancaro', 'Giuseppe Pancaro', 1971, 'Italy', ['LB', 'RB'], 77, 79, 2002, 25, t(8, 4, 7, 8, 4, 7)),
  q('lazio', 'almeyda', 'Matías Almeyda', 1973, 'Argentina', ['DM', 'CM'], 80, 82, 2002, 25, t(7, 6, 8, 7, 6, 7)),
  q('lazio', 'jugovic_l', 'Vladimir Jugović', 1970, 'Serbia', ['CM', 'AM'], 80, 81, 2001, 30, t(7, 6, 8, 6, 5, 7)),
  q('lazio', 'nedved_l', 'Pavel Nedvěd', 1972, 'Czechia', ['AM', 'LW'], 84, 89, 2003, 20, t(10, 6, 9, 8, 4, 8)),
  q('lazio', 'conceicao', 'Sérgio Conceição', 1974, 'Portugal', ['RW'], 82, 84, 2002, 25, t(8, 6, 8, 7, 5, 7)),
  q('lazio', 'vieri_l', 'Christian Vieri', 1973, 'Italy', ['ST'], 86, 88, 2001, 30, t(7, 7, 8, 6, 6, 7)),
  q('lazio', 'salas', 'Marcelo Salas', 1974, 'Chile', ['ST'], 83, 84, 2002, 30, t(8, 6, 8, 7, 5, 7)),
  q('lazio', 'boksic_l', 'Alen Bokšić', 1970, 'Croatia', ['ST'], 80, 81, 2001, 35, t(7, 6, 7, 6, 6, 7)),
  q('lazio', 'stankovic_l', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 76, 86, 2004, 25, t(8, 6, 8, 7, 5, 7)),
];

// ── AS Roma, 1998–99 (Totti's rise) ───────────────────────────────────────────
export const ROMA_1998: CuratedSeed[] = [
  q('roma', 'konsel', 'Michael Konsel', 1962, 'Austria', ['GK'], 79, 79, 2000, 25, t(8, 5, 7, 7, 4, 6)),
  q('roma', 'aldair', 'Aldair', 1965, 'Brazil', ['CB'], 83, 83, 2001, 25, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
  q('roma', 'zago', 'Antônio Carlos Zago', 1969, 'Brazil', ['CB'], 78, 79, 2001, 30, t(7, 5, 7, 7, 5, 7)),
  q('roma', 'cafu', 'Cafu', 1970, 'Brazil', ['RB', 'RW'], 85, 86, 2002, 20, t(9, 6, 9, 8, 4, 8)),
  q('roma', 'candela', 'Vincent Candela', 1973, 'France', ['LB', 'LW'], 80, 82, 2002, 25, t(8, 5, 8, 8, 4, 7)),
  q('roma', 'petruzzi', 'Fabio Petruzzi', 1970, 'Italy', ['CB'], 74, 75, 2000, 25, t(7, 4, 6, 7, 5, 6)),
  q('roma', 'di_biagio', 'Luigi Di Biagio', 1971, 'Italy', ['CM', 'DM'], 80, 82, 2002, 25, t(8, 5, 8, 7, 5, 7)),
  q('roma', 'tommasi', 'Damiano Tommasi', 1974, 'Italy', ['CM', 'DM'], 78, 82, 2003, 25, t(9, 4, 8, 9, 3, 7), { loyalty: 90 }),
  q('roma', 'totti', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 84, 92, 2004, 25, t(9, 6, 8, 10, 4, 7), { loyalty: 98 }),
  q('roma', 'delvecchio', 'Marco Delvecchio', 1973, 'Italy', ['ST'], 79, 81, 2002, 25, t(8, 5, 8, 8, 5, 7)),
  q('roma', 'paulo_sergio', 'Paulo Sérgio', 1969, 'Brazil', ['LW', 'AM'], 79, 80, 2000, 30, t(7, 6, 7, 6, 6, 7)),
  q('roma', 'balbo_r', 'Abel Balbo', 1966, 'Argentina', ['ST'], 78, 79, 2000, 30, t(8, 5, 7, 7, 5, 7)),
  q('roma', 'gustavo_bartelt', 'Gustavo Bartelt', 1977, 'Argentina', ['ST'], 70, 76, 2002, 30, t(7, 5, 7, 6, 6, 7)),
];

// ── Parma, 1998–99 (Parmalat's jewels; UEFA Cup + Coppa Italia winners) ────────
export const PARMA_1998: CuratedSeed[] = [
  q('parma', 'buffon_p8', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 86, 94, 2004, 15, t(10, 6, 9, 8, 3, 7), { loyalty: 88 }),
  q('parma', 'thuram_p8', 'Lilian Thuram', 1972, 'France', ['CB', 'RB'], 86, 88, 2003, 20, t(9, 5, 9, 8, 4, 7)),
  q('parma', 'cannavaro_p8', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 85, 90, 2004, 20, t(9, 6, 9, 8, 5, 7)),
  q('parma', 'sensini', 'Néstor Sensini', 1966, 'Argentina', ['CB', 'DM'], 79, 80, 2000, 25, t(8, 5, 7, 7, 5, 7)),
  q('parma', 'benarrivo', 'Antonio Benarrivo', 1968, 'Italy', ['LB'], 77, 78, 2001, 25, t(8, 4, 7, 8, 4, 7)),
  q('parma', 'veron_p', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM', 'AM'], 86, 90, 2003, 25, t(8, 6, 9, 7, 5, 8)),
  q('parma', 'dino_baggio', 'Dino Baggio', 1971, 'Italy', ['CM', 'DM'], 80, 81, 2002, 25, t(8, 5, 8, 7, 5, 6)),
  q('parma', 'boghossian', 'Alain Boghossian', 1970, 'France', ['DM', 'CM'], 77, 79, 2001, 25, t(8, 5, 7, 7, 5, 7)),
  q('parma', 'fuser', 'Diego Fuser', 1968, 'Italy', ['RW', 'RB'], 79, 80, 2001, 25, t(8, 5, 8, 7, 5, 7)),
  q('parma', 'stanic', 'Mario Stanić', 1972, 'Croatia', ['RW', 'ST'], 78, 80, 2002, 25, t(7, 6, 7, 7, 5, 7)),
  q('parma', 'crespo_p', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 85, 89, 2003, 25, t(8, 7, 9, 7, 5, 7)),
  q('parma', 'chiesa_p', 'Enrico Chiesa', 1970, 'Italy', ['ST'], 82, 83, 2002, 30, t(8, 6, 8, 7, 5, 7)),];

// ── Fiorentina, 1998–99 (Batistuta and Rui Costa) ─────────────────────────────
export const FIORENTINA_1998: CuratedSeed[] = [
  q('fiorentina', 'toldo', 'Francesco Toldo', 1971, 'Italy', ['GK'], 84, 86, 2003, 20, t(8, 5, 8, 8, 4, 6)),
  q('fiorentina', 'firicano', 'Aldo Firicano', 1967, 'Italy', ['CB'], 74, 75, 2000, 25, t(7, 4, 6, 7, 5, 6)),
  q('fiorentina', 'repka', 'Tomáš Řepka', 1974, 'Czechia', ['CB'], 78, 80, 2002, 25, t(6, 6, 7, 6, 7, 6)),
  q('fiorentina', 'torricelli_f', 'Moreno Torricelli', 1970, 'Italy', ['RB', 'CB'], 78, 79, 2001, 25, t(8, 4, 7, 8, 4, 7)),
  q('fiorentina', 'pierini', 'Daniele Adani', 1974, 'Italy', ['CB'], 74, 78, 2002, 25, t(7, 4, 7, 7, 5, 6)),
  q('fiorentina', 'cois', 'Sandro Cois', 1972, 'Italy', ['CM', 'DM'], 76, 78, 2001, 25, t(8, 4, 7, 8, 5, 6)),
  q('fiorentina', 'bigica', 'Emiliano Bigica', 1973, 'Italy', ['CM'], 72, 74, 2000, 25, t(7, 4, 6, 7, 5, 6)),
  q('fiorentina', 'rui_costa_f', 'Manuel Rui Costa', 1972, 'Portugal', ['AM'], 86, 87, 2003, 20, t(8, 6, 8, 7, 4, 8)),
  q('fiorentina', 'schwarz', 'Stefan Schwarz', 1969, 'Sweden', ['CM', 'DM'], 78, 79, 2001, 25, t(8, 5, 7, 7, 5, 7)),
  q('fiorentina', 'robbiati', 'Andrea Robbiati', 1976, 'Italy', ['LW', 'AM'], 73, 77, 2002, 25, t(7, 5, 7, 7, 5, 7)),
  q('fiorentina', 'batistuta', 'Gabriel Batistuta', 1969, 'Argentina', ['ST'], 89, 89, 2002, 30, t(8, 7, 9, 9, 5, 7), { loyalty: 90 }),
  q('fiorentina', 'edmundo', 'Edmundo', 1971, 'Brazil', ['ST', 'AM'], 82, 84, 2001, 35, t(5, 8, 7, 5, 8, 6)),
  q('fiorentina', 'oliveira_f', 'Luís Oliveira', 1969, 'Belgium', ['ST'], 76, 77, 2000, 30, t(7, 5, 7, 6, 5, 7)),
];

// ── The elite of Europe, 1998 — full playable squads so every real European Cup
//    of the scenario span (1999–2013) is anchored to a side that exists. ────────
export const REAL_MADRID_1998: CuratedSeed[] = [
  q('real_madrid', 'illgner', 'Bodo Illgner', 1967, 'Germany', ['GK'], 82, 82, 2001, 25, t(8, 5, 7, 8, 4, 6)),
  q('real_madrid', 'roberto_carlos_r', 'Roberto Carlos', 1973, 'Brazil', ['LB', 'LW'], 87, 89, 2003, 20, t(8, 7, 9, 8, 5, 8)),
  q('real_madrid', 'hierro', 'Fernando Hierro', 1968, 'Spain', ['CB', 'DM'], 86, 86, 2002, 20, t(9, 6, 8, 9, 4, 7), { loyalty: 92 }),
  q('real_madrid', 'sanchis', 'Manolo Sanchís', 1965, 'Spain', ['CB'], 82, 82, 2000, 25, t(9, 5, 7, 10, 3, 6), { loyalty: 95 }),
  q('real_madrid', 'panucci_r', 'Christian Panucci', 1973, 'Italy', ['RB', 'CB'], 82, 84, 2001, 25, t(8, 6, 8, 7, 5, 7)),
  q('real_madrid', 'karembeu', 'Christian Karembeu', 1970, 'France', ['CM', 'RB'], 80, 81, 2001, 25, t(8, 6, 8, 7, 5, 7)),
  q('real_madrid', 'redondo_r', 'Fernando Redondo', 1969, 'Argentina', ['DM', 'CM'], 87, 88, 2002, 20, t(9, 6, 8, 8, 4, 8)),
  q('real_madrid', 'seedorf_r', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 84, 88, 2003, 20, t(7, 7, 8, 6, 5, 8)),
  q('real_madrid', 'savio', 'Sávio', 1974, 'Brazil', ['RW', 'AM'], 80, 82, 2002, 25, t(7, 6, 7, 7, 5, 7)),
  q('real_madrid', 'raul', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 87, 92, 2004, 20, t(9, 6, 9, 10, 4, 7), { loyalty: 96 }),
  q('real_madrid', 'morientes', 'Fernando Morientes', 1976, 'Spain', ['ST'], 84, 86, 2003, 25, t(8, 6, 8, 8, 4, 7)),
  q('real_madrid', 'suker', 'Davor Šuker', 1968, 'Croatia', ['ST'], 84, 84, 2000, 30, t(7, 7, 8, 6, 5, 7)),
  q('real_madrid', 'mijatovic', 'Predrag Mijatović', 1969, 'Montenegro', ['ST', 'AM'], 83, 83, 2000, 30, t(7, 7, 8, 6, 6, 7)),
  q('real_madrid', 'ivan_campo', 'Iván Campo', 1974, 'Spain', ['CB', 'DM'], 77, 80, 2002, 25, t(7, 5, 7, 7, 5, 7)),
];

export const BARCELONA_1998: CuratedSeed[] = [
  q('barcelona', 'hesp', 'Ruud Hesp', 1965, 'Netherlands', ['GK'], 79, 79, 2000, 25, t(8, 4, 7, 7, 4, 6)),
  q('barcelona', 'reiziger', 'Michael Reiziger', 1973, 'Netherlands', ['RB'], 81, 83, 2002, 20, t(8, 5, 8, 7, 4, 8)),
  q('barcelona', 'f_de_boer_b', 'Frank de Boer', 1970, 'Netherlands', ['CB'], 84, 85, 2002, 20, t(9, 5, 8, 8, 4, 8)),
  q('barcelona', 'abelardo', 'Abelardo', 1970, 'Spain', ['CB'], 82, 82, 2001, 25, t(8, 5, 8, 8, 4, 7)),
  q('barcelona', 'sergi', 'Sergi Barjuan', 1971, 'Spain', ['LB'], 82, 83, 2002, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
  q('barcelona', 'guardiola_b', 'Pep Guardiola', 1971, 'Spain', ['DM', 'CM'], 84, 85, 2002, 25, t(9, 6, 8, 9, 4, 8), { loyalty: 92 }),
  q('barcelona', 'cocu_b8', 'Phillip Cocu', 1970, 'Netherlands', ['CM', 'DM'], 83, 84, 2002, 20, t(9, 5, 8, 8, 3, 8)),
  q('barcelona', 'xavi_b8', 'Xavi', 1980, 'Spain', ['CM'], 68, 91, 2005, 15, t(10, 5, 9, 10, 2, 8), { loyalty: 95 }),
  q('barcelona', 'figo_b', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 88, 90, 2003, 20, t(8, 7, 9, 7, 4, 8)),
  q('barcelona', 'rivaldo_b', 'Rivaldo', 1972, 'Brazil', ['AM', 'LW'], 89, 91, 2003, 25, t(8, 7, 9, 7, 5, 8)),
  q('barcelona', 'luis_enrique_b8', 'Luís Enrique', 1970, 'Spain', ['CM', 'RW'], 83, 84, 2002, 25, t(9, 6, 9, 10, 4, 7), { loyalty: 90 }),
  q('barcelona', 'kluivert_b8', 'Patrick Kluivert', 1976, 'Netherlands', ['ST'], 84, 87, 2003, 30, t(6, 7, 7, 6, 6, 7)),
  q('barcelona', 'zenden', 'Boudewijn Zenden', 1976, 'Netherlands', ['LW'], 79, 82, 2002, 25, t(8, 5, 8, 7, 4, 8)),
  q('barcelona', 'anderson_b', 'Sonny Anderson', 1970, 'Brazil', ['ST'], 81, 82, 2001, 25, t(8, 6, 8, 7, 5, 7)),
];

export const BAYERN_1998: CuratedSeed[] = [
  q('bayern', 'kahn', 'Oliver Kahn', 1969, 'Germany', ['GK'], 88, 90, 2003, 15, t(10, 7, 9, 9, 5, 7), { loyalty: 92 }),
  q('bayern', 'babbel', 'Markus Babbel', 1972, 'Germany', ['CB', 'RB'], 82, 83, 2001, 20, t(9, 5, 8, 8, 4, 7)),
  q('bayern', 'matthaus', 'Lothar Matthäus', 1961, 'Germany', ['DM', 'CB'], 82, 82, 2000, 25, t(9, 8, 9, 8, 5, 6)),
  q('bayern', 'kuffour', 'Samuel Kuffour', 1976, 'Ghana', ['CB'], 81, 84, 2003, 25, t(8, 6, 8, 8, 5, 7)),
  q('bayern', 'linke', 'Thomas Linke', 1969, 'Germany', ['CB'], 79, 80, 2002, 25, t(8, 4, 7, 8, 4, 6)),
  q('bayern', 'lizarazu', 'Bixente Lizarazu', 1969, 'France', ['LB'], 84, 85, 2003, 20, t(9, 5, 8, 8, 4, 8)),
  q('bayern', 'effenberg', 'Stefan Effenberg', 1968, 'Germany', ['CM'], 85, 86, 2002, 25, t(7, 8, 9, 7, 7, 7)),
  q('bayern', 'jeremies', 'Jens Jeremies', 1974, 'Germany', ['DM', 'CM'], 80, 82, 2003, 25, t(9, 5, 8, 8, 5, 7)),
  q('bayern', 'basler', 'Mario Basler', 1968, 'Germany', ['RW', 'AM'], 82, 83, 2000, 30, t(5, 8, 7, 6, 8, 6)),
  q('bayern', 'tarnat', 'Michael Tarnat', 1969, 'Germany', ['LB', 'LW'], 79, 80, 2002, 25, t(8, 5, 7, 8, 4, 7)),
  q('bayern', 'salihamidzic', 'Hasan Salihamidžić', 1977, 'Bosnia', ['RW', 'CM'], 78, 82, 2003, 20, t(9, 5, 8, 8, 4, 7)),
  q('bayern', 'elber', 'Giovane Élber', 1972, 'Brazil', ['ST'], 84, 85, 2003, 25, t(8, 6, 8, 8, 4, 7)),
  q('bayern', 'jancker', 'Carsten Jancker', 1974, 'Germany', ['ST'], 79, 81, 2002, 25, t(8, 5, 8, 7, 5, 7)),
  q('bayern', 'zickler', 'Alexander Zickler', 1974, 'Germany', ['ST'], 76, 79, 2002, 25, t(7, 5, 7, 7, 5, 7)),
];

export const MANUTD_1998: CuratedSeed[] = [
  q('man_utd', 'schmeichel_u8', 'Peter Schmeichel', 1963, 'Denmark', ['GK'], 88, 88, 1999, 20, t(9, 7, 9, 8, 5, 6)),
  q('man_utd', 'g_neville_u', 'Gary Neville', 1975, 'England', ['RB', 'CB'], 82, 84, 2003, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('man_utd', 'stam_u', 'Jaap Stam', 1972, 'Netherlands', ['CB'], 87, 88, 2003, 20, t(9, 6, 8, 8, 4, 7)),
  q('man_utd', 'johnsen_u', 'Ronny Johnsen', 1969, 'Norway', ['CB', 'DM'], 80, 81, 2001, 30, t(8, 5, 7, 8, 4, 7)),
  q('man_utd', 'irwin_u', 'Denis Irwin', 1965, 'Ireland', ['LB', 'RB'], 82, 82, 2001, 20, t(9, 4, 8, 9, 3, 7)),
  q('man_utd', 'p_neville_u', 'Phil Neville', 1977, 'England', ['LB', 'CM'], 78, 81, 2003, 20, t(9, 4, 7, 10, 4, 7)),
  q('man_utd', 'beckham_u8', 'David Beckham', 1975, 'England', ['RW', 'CM'], 86, 88, 2003, 15, t(9, 7, 9, 8, 4, 7)),
  q('man_utd', 'keane_u8', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 88, 89, 2003, 25, t(9, 8, 10, 9, 8, 6), { loyalty: 92 }),
  q('man_utd', 'scholes_u8', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 86, 88, 2003, 20, t(9, 5, 8, 10, 4, 7), { loyalty: 96 }),
  q('man_utd', 'giggs_u8', 'Ryan Giggs', 1973, 'Wales', ['LW'], 86, 88, 2003, 25, t(9, 6, 9, 10, 4, 8), { loyalty: 97 }),
  q('man_utd', 'butt_u', 'Nicky Butt', 1975, 'England', ['CM', 'DM'], 78, 80, 2003, 20, t(8, 5, 7, 9, 5, 7)),
  q('man_utd', 'yorke_u', 'Dwight Yorke', 1971, 'Trinidad and Tobago', ['ST'], 85, 86, 2002, 25, t(8, 6, 8, 7, 5, 8)),
  q('man_utd', 'cole_u', 'Andy Cole', 1971, 'England', ['ST'], 84, 85, 2002, 25, t(8, 6, 8, 7, 5, 7)),
  q('man_utd', 'sheringham_u', 'Teddy Sheringham', 1966, 'England', ['ST', 'AM'], 82, 82, 2001, 25, t(8, 6, 8, 7, 5, 7)),
  q('man_utd', 'solskjaer_u', 'Ole Gunnar Solskjær', 1973, 'Norway', ['ST'], 82, 84, 2003, 25, t(9, 5, 8, 9, 4, 8)),
];

export const LIVERPOOL_1998: CuratedSeed[] = [
  q('liverpool', 'james_l', 'David James', 1970, 'England', ['GK'], 80, 82, 2001, 25, t(7, 6, 7, 7, 6, 6)),
  q('liverpool', 'carragher_l', 'Jamie Carragher', 1978, 'England', ['CB', 'RB'], 76, 85, 2004, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 96 }),
  q('liverpool', 'babb', 'Phil Babb', 1970, 'Ireland', ['CB'], 76, 77, 2000, 25, t(7, 5, 7, 7, 5, 6)),
  q('liverpool', 'matteo', 'Dominic Matteo', 1974, 'Scotland', ['CB', 'LB'], 76, 79, 2001, 25, t(8, 4, 7, 8, 4, 7)),
  q('liverpool', 'bjornebye', 'Stig Inge Bjørnebye', 1969, 'Norway', ['LB'], 77, 78, 2000, 25, t(8, 4, 7, 8, 4, 7)),
  q('liverpool', 'heggem', 'Vegard Heggem', 1975, 'Norway', ['RB'], 75, 78, 2002, 25, t(8, 4, 7, 8, 4, 7)),
  q('liverpool', 'mcmanaman_l', 'Steve McManaman', 1972, 'England', ['RW', 'AM'], 84, 85, 1999, 20, t(8, 6, 8, 7, 4, 8)),
  q('liverpool', 'redknapp_l', 'Jamie Redknapp', 1973, 'England', ['CM'], 80, 82, 2002, 30, t(8, 5, 8, 8, 4, 7)),
  q('liverpool', 'ince_l', 'Paul Ince', 1967, 'England', ['CM', 'DM'], 81, 81, 2000, 25, t(7, 7, 8, 7, 6, 6)),
  q('liverpool', 'berger', 'Patrik Berger', 1973, 'Czechia', ['LW', 'AM'], 80, 82, 2002, 25, t(7, 6, 8, 7, 5, 7)),
  q('liverpool', 'thompson_l', 'David Thompson', 1977, 'England', ['CM', 'RW'], 74, 79, 2002, 25, t(8, 5, 7, 8, 5, 7)),
  q('liverpool', 'owen_l', 'Michael Owen', 1979, 'England', ['ST'], 86, 90, 2004, 30, t(9, 6, 9, 8, 4, 7)),
  q('liverpool', 'fowler_l', 'Robbie Fowler', 1975, 'England', ['ST'], 85, 87, 2003, 30, t(7, 6, 8, 8, 6, 7)),
  q('liverpool', 'riedle', 'Karl-Heinz Riedle', 1965, 'Germany', ['ST'], 78, 78, 2000, 25, t(8, 5, 7, 7, 4, 7)),
];

export const CHELSEA_1998: CuratedSeed[] = [
  q('chelsea', 'de_goey', 'Ed de Goey', 1966, 'Netherlands', ['GK'], 80, 80, 2001, 25, t(8, 4, 7, 7, 4, 6)),
  q('chelsea', 'ferrer', 'Albert Ferrer', 1970, 'Spain', ['RB'], 79, 80, 2001, 25, t(8, 5, 7, 8, 4, 7)),
  q('chelsea', 'leboeuf', 'Frank Leboeuf', 1968, 'France', ['CB'], 82, 83, 2001, 25, t(8, 6, 8, 7, 5, 7)),
  q('chelsea', 'desailly_c', 'Marcel Desailly', 1968, 'France', ['CB', 'DM'], 85, 85, 2002, 25, t(9, 5, 8, 7, 4, 7)),
  q('chelsea', 'le_saux', 'Graeme Le Saux', 1968, 'England', ['LB'], 80, 81, 2001, 25, t(8, 5, 7, 7, 5, 7)),
  q('chelsea', 'duberry', 'Michael Duberry', 1975, 'England', ['CB'], 74, 77, 2002, 25, t(7, 5, 7, 7, 5, 6)),
  q('chelsea', 'petrescu', 'Dan Petrescu', 1967, 'Romania', ['RB', 'RW'], 80, 80, 2000, 25, t(8, 5, 8, 7, 5, 7)),
  q('chelsea', 'di_matteo_c', 'Roberto Di Matteo', 1970, 'Italy', ['CM'], 80, 81, 2002, 25, t(8, 5, 8, 7, 5, 7)),
  q('chelsea', 'wise', 'Dennis Wise', 1966, 'England', ['CM'], 80, 80, 2001, 25, t(7, 7, 8, 9, 7, 6), { loyalty: 90 }),
  q('chelsea', 'poyet_c', 'Gustavo Poyet', 1967, 'Uruguay', ['CM', 'AM'], 81, 82, 2001, 25, t(8, 6, 8, 6, 5, 7)),
  q('chelsea', 'morris_c', 'Jody Morris', 1978, 'England', ['CM'], 73, 78, 2002, 25, t(7, 5, 7, 7, 6, 7)),
  q('chelsea', 'zola_c', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 86, 86, 2002, 25, t(9, 6, 8, 9, 4, 8), { loyalty: 90 }),
  q('chelsea', 'flo', 'Tore André Flo', 1973, 'Norway', ['ST'], 80, 82, 2002, 25, t(8, 5, 8, 8, 4, 7)),
  q('chelsea', 'vialli_c', 'Gianluca Vialli', 1964, 'Italy', ['ST'], 79, 79, 2000, 30, t(9, 7, 9, 8, 5, 7)),
  q('chelsea', 'casiraghi', 'Pierluigi Casiraghi', 1969, 'Italy', ['ST'], 78, 79, 2001, 35, t(8, 5, 7, 7, 5, 7)),
];

// ── European context (light — present so the reality-anchored Cup has a field and
//    the era's real winners exist even outside the Italian giants) ─────────────
export const DORTMUND_1998: CuratedSeed[] = [
  q('dortmund', 'moller_d', 'Andreas Möller', 1967, 'Germany', ['AM'], 82, 82, 2000, 25, t(7, 7, 8, 6, 6, 7)),
  q('dortmund', 'kohler_d', 'Jürgen Kohler', 1965, 'Germany', ['CB'], 81, 81, 2000, 30, t(8, 5, 8, 7, 5, 6)),
  q('dortmund', 'ricken', 'Lars Ricken', 1976, 'Germany', ['AM', 'ST'], 79, 82, 2003, 25, t(8, 5, 8, 8, 5, 7)),
  q('dortmund', 'chapuisat', 'Stéphane Chapuisat', 1969, 'Switzerland', ['ST'], 80, 80, 2000, 30, t(8, 5, 8, 7, 5, 7)),
  q('dortmund', 'reuter', 'Stefan Reuter', 1966, 'Germany', ['RB'], 78, 78, 2000, 25, t(8, 4, 7, 8, 4, 6)),
  q('dortmund', 'heinrich_d', 'Jörg Heinrich', 1969, 'Germany', ['LB', 'LW'], 78, 79, 2001, 25, t(8, 5, 7, 7, 5, 7)),
];
export const PORTO_1998: CuratedSeed[] = [
  q('porto', 'vitor_baia', 'Vítor Baía', 1969, 'Portugal', ['GK'], 83, 84, 2002, 20, t(8, 6, 8, 9, 4, 7), { loyalty: 90 }),
  q('porto', 'jardel', 'Mário Jardel', 1973, 'Brazil', ['ST'], 84, 85, 2001, 25, t(8, 6, 8, 7, 5, 7)),
  q('porto', 'drulovic', 'Ljubinko Drulović', 1968, 'Serbia', ['LW'], 78, 79, 2000, 25, t(7, 5, 7, 7, 5, 7)),
  q('porto', 'zahovic', 'Zlatko Zahovič', 1971, 'Slovenia', ['AM'], 81, 82, 2001, 25, t(7, 6, 8, 6, 5, 7)),
  q('porto', 'aloisio', 'Aloísio', 1963, 'Brazil', ['CB'], 76, 76, 1999, 25, t(8, 4, 7, 7, 5, 6)),
  q('porto', 'jorge_costa', 'Jorge Costa', 1971, 'Portugal', ['CB'], 80, 81, 2002, 25, t(8, 5, 8, 8, 5, 6)),
];
export const VALENCIA_1998: CuratedSeed[] = [
  q('valencia', 'canizares', 'Santiago Cañizares', 1969, 'Spain', ['GK'], 84, 85, 2003, 20, t(9, 6, 8, 8, 5, 6)),
  q('valencia', 'mendieta', 'Gaizka Mendieta', 1974, 'Spain', ['CM', 'RW'], 84, 87, 2003, 20, t(9, 6, 8, 8, 4, 8)),
  q('valencia', 'lopez_valencia', 'Claudio López', 1974, 'Argentina', ['ST', 'LW'], 84, 85, 2002, 25, t(8, 6, 8, 7, 5, 7)),
  q('valencia', 'ilie', 'Adrian Ilie', 1974, 'Romania', ['ST', 'RW'], 79, 81, 2002, 25, t(7, 6, 7, 7, 5, 7)),
  q('valencia', 'djukic', 'Miroslav Đukić', 1966, 'Serbia', ['CB'], 79, 79, 2000, 25, t(8, 5, 7, 8, 4, 6)),
  q('valencia', 'gerard_v', 'Gerard', 1969, 'Spain', ['ST'], 76, 77, 2001, 25, t(7, 5, 7, 7, 5, 7)),
];
export const DEPORTIVO_1998: CuratedSeed[] = [
  q('deportivo', 'songo_o', 'Jacques Songo’o', 1964, 'Cameroon', ['GK'], 80, 80, 2001, 25, t(8, 5, 7, 8, 4, 6)),
  q('deportivo', 'djalminha', 'Djalminha', 1970, 'Brazil', ['AM'], 82, 83, 2002, 25, t(6, 7, 7, 6, 7, 7)),
  q('deportivo', 'mauro_silva', 'Mauro Silva', 1968, 'Brazil', ['DM'], 82, 82, 2002, 20, t(9, 5, 8, 9, 3, 7)),
  q('deportivo', 'flavio', 'Flávio Conceição', 1974, 'Brazil', ['CM', 'DM'], 80, 82, 2001, 25, t(8, 6, 8, 7, 5, 7)),
  q('deportivo', 'naybet', 'Noureddine Naybet', 1970, 'Morocco', ['CB'], 81, 82, 2002, 25, t(8, 5, 8, 8, 4, 7)),
  q('deportivo', 'donato', 'Donato', 1962, 'Spain', ['CB', 'DM'], 76, 76, 2000, 25, t(8, 4, 7, 8, 4, 6)),
];
export const MONACO_1998: CuratedSeed[] = [
  q('monaco', 'barthez', 'Fabien Barthez', 1971, 'France', ['GK'], 84, 85, 2002, 25, t(7, 7, 8, 7, 6, 7)),
  q('monaco', 'trezeguet_m8', 'David Trezeguet', 1977, 'France', ['ST'], 82, 88, 2004, 25, t(8, 6, 9, 7, 5, 7)),
  q('monaco', 'henry_m8', 'Thierry Henry', 1977, 'France', ['LW', 'ST'], 80, 93, 2004, 20, t(9, 6, 9, 8, 4, 8)),
  q('monaco', 'gallardo', 'Marcelo Gallardo', 1976, 'Argentina', ['AM'], 80, 83, 2002, 25, t(7, 6, 8, 7, 5, 7)),
  q('monaco', 'legwinski', 'Sylvain Legwinski', 1973, 'France', ['CM'], 76, 78, 2001, 25, t(8, 5, 7, 7, 5, 7)),
  q('monaco', 'dumas', 'Franck Dumas', 1968, 'France', ['CB'], 76, 76, 2000, 25, t(8, 4, 7, 7, 5, 6)),
];
export const KYIV_1998: CuratedSeed[] = [
  q('dynamo_kyiv', 'shovkovskyi', 'Oleksandr Shovkovskyi', 1975, 'Ukraine', ['GK'], 80, 83, 2003, 20, t(9, 5, 8, 9, 4, 6), { loyalty: 92 }),
  q('dynamo_kyiv', 'shevchenko_k8', 'Andriy Shevchenko', 1976, 'Ukraine', ['ST'], 86, 92, 2003, 20, t(9, 6, 9, 8, 4, 8)),
  q('dynamo_kyiv', 'rebrov_k', 'Serhiy Rebrov', 1974, 'Ukraine', ['ST', 'AM'], 83, 85, 2002, 25, t(8, 6, 8, 8, 5, 7)),
  q('dynamo_kyiv', 'kaladze_k', 'Kakha Kaladze', 1978, 'Georgia', ['CB', 'LB'], 76, 85, 2004, 25, t(8, 5, 8, 7, 5, 7)),
  q('dynamo_kyiv', 'luzhny', 'Oleh Luzhny', 1968, 'Ukraine', ['RB', 'CB'], 78, 79, 2001, 25, t(8, 4, 7, 8, 4, 6)),
  q('dynamo_kyiv', 'holovko', 'Oleh Holovko', 1971, 'Ukraine', ['CB'], 76, 77, 2001, 25, t(8, 4, 7, 8, 4, 6)),
];

/** The full Inter-1998 curated universe: Serie A giants + the elite of Europe
 *  (full squads) and a light continental context so every real European Cup of
 *  the span is anchored to a side that exists. */
export const INTER_1998_SQUADS: Record<string, CuratedSeed[]> = {
  inter: INTER_1998,
  juventus: JUVENTUS_1998,
  milan: MILAN_1998,
  lazio: LAZIO_1998,
  roma: ROMA_1998,
  parma: PARMA_1998,
  fiorentina: FIORENTINA_1998,
  real_madrid: REAL_MADRID_1998,
  barcelona: BARCELONA_1998,
  bayern: BAYERN_1998,
  man_utd: MANUTD_1998,
  liverpool: LIVERPOOL_1998,
  chelsea: CHELSEA_1998,
  dortmund: DORTMUND_1998,
  porto: PORTO_1998,
  valencia: VALENCIA_1998,
  deportivo: DEPORTIVO_1998,
  monaco: MONACO_1998,
  dynamo_kyiv: KYIV_1998,
};

// European selling clubs (M12A rollout) — the late-90s foreign talent pipeline
// (shared with the Bundesliga-1997 worlds). Merged by CONCATENATION onto any club
// already present.
for (const [club, seeds] of Object.entries(EUROPE_LATE90S_SQUADS)) {
  if (club === 'porto' || club === 'valencia' || club === 'deportivo') continue; // already curated here
  INTER_1998_SQUADS[club] = [...(INTER_1998_SQUADS[club] ?? []), ...seeds];
}
