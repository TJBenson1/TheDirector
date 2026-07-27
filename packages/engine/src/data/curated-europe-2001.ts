/**
 * European selling clubs — 2001-02 (M12A rollout, the talent pipeline).
 *
 * The real clubs OUTSIDE the modelled leagues that fed them at the turn of the
 * millennium: Ajax (a teenage Ibrahimović & Van der Vaart), Feyenoord (a
 * 17-year-old Van Persie), Deportivo & Valencia's La Liga challengers, Lazio and
 * Roma's Serie A, Leverkusen and Dortmund's Bundesliga, Larsson's Celtic. Gives
 * the 2001 world (Liverpool's treble / Spurs the sleeping giant) the deep market
 * the flagship already has. Ability/potential/personality are HIDDEN designer
 * estimates (§7); clubs, birth years, positions and contracts are real.
 *
 * Names already curated in the 2001 pack (Van Nistelrooy, Crespo, Rivaldo, Rui
 * Costa, Kluivert, Deco, Davids, Hierro, Helguera, Litmanen) are omitted.
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

// ── Ajax, 2001-02 (a teenage Ibrahimović & Van der Vaart) ──────────────────────
const AJAX_2001: CuratedSeed[] = [
  q('ajax', 'ibrahimovic_01', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 76, 90, 2005, 20, t(6, 9, 9, 6, 6, 8)),
  q('ajax', 'van_der_vaart_01', 'Rafael van der Vaart', 1983, 'Netherlands', ['AM'], 76, 87, 2005, 20, t(8, 6, 9, 7, 5, 8)),
  q('ajax', 'chivu_01', 'Cristian Chivu', 1980, 'Romania', ['CB', 'LB'], 78, 86, 2004, 20, t(9, 5, 8, 8, 4, 8)),
  q('ajax', 'trabelsi_01', 'Hatem Trabelsi', 1977, 'Tunisia', ['RB'], 78, 82, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'maxwell_01', 'Maxwell', 1981, 'Brazil', ['LB'], 75, 84, 2005, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'van_der_meyde_01', 'Andy van der Meyde', 1979, 'Netherlands', ['RW', 'AM'], 76, 80, 2004, 25, t(6, 6, 8, 6, 6, 8)),
  q('ajax', 'machlas_01', 'Nikos Machlas', 1973, 'Greece', ['ST'], 77, 79, 2003, 25, t(7, 6, 8, 7, 5, 8)),
  q('ajax', 'lobont_01', 'Bogdan Lobonț', 1978, 'Romania', ['GK'], 75, 79, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'galasek_01', 'Tomáš Galásek', 1973, 'Czechia', ['DM', 'CM'], 77, 79, 2004, 20, t(9, 5, 8, 8, 4, 8)),
  q('ajax', 'bergdolmo_01', 'André Bergdølmo', 1971, 'Norway', ['CB', 'RB'], 74, 76, 2004, 20, t(8, 5, 8, 8, 5, 7)),
  q('ajax', 'pasanen_01', 'Petri Pasanen', 1980, 'Finland', ['CB', 'RB'], 72, 80, 2005, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'sneijder_01', 'Wesley Sneijder', 1984, 'Netherlands', ['AM', 'CM'], 66, 90, 2006, 20, t(7, 7, 9, 7, 6, 8)),
  q('ajax', 'anastasiou_01', 'Yannis Anastasiou', 1973, 'Greece', ['ST'], 73, 75, 2004, 25, t(7, 6, 8, 7, 5, 8)),
  q('ajax', 'wamberto_01', 'Wamberto', 1975, 'Brazil', ['ST', 'RW'], 72, 74, 2003, 25, t(7, 6, 8, 6, 6, 8)),
];

// ── PSV, 2001-02 (Kežman's goals, Van Bommel's engine) ─────────────────────────
const PSV_2001: CuratedSeed[] = [
  q('psv', 'kezman_01', 'Mateja Kežman', 1979, 'Serbia', ['ST'], 80, 84, 2004, 20, t(7, 7, 9, 6, 6, 8)),
  q('psv', 'van_bommel_01', 'Mark van Bommel', 1977, 'Netherlands', ['CM', 'DM'], 80, 85, 2004, 20, t(8, 7, 9, 7, 6, 8)),
  q('psv', 'bruggink_01', 'Arnold Bruggink', 1977, 'Netherlands', ['ST', 'AM'], 76, 79, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('psv', 'ooijer_01', 'André Ooijer', 1974, 'Netherlands', ['CB', 'DM'], 78, 80, 2004, 20, t(9, 5, 8, 8, 5, 8)),
  q('psv', 'bouma_01', 'Wilfred Bouma', 1978, 'Netherlands', ['LB', 'CB'], 77, 82, 2005, 20, t(9, 5, 8, 8, 5, 8)),
  q('psv', 'vogel_01', 'Johann Vogel', 1977, 'Switzerland', ['DM', 'CM'], 78, 80, 2004, 20, t(9, 5, 8, 8, 4, 8)),
  q('psv', 'rommedahl_01', 'Dennis Rommedahl', 1978, 'Denmark', ['RW'], 77, 80, 2004, 20, t(7, 6, 8, 7, 5, 8)),
  q('psv', 'waterreus_01', 'Ronald Waterreus', 1970, 'Netherlands', ['GK'], 79, 80, 2004, 20, t(8, 5, 8, 8, 5, 7)),
  q('psv', 'hofland_01', 'Kevin Hofland', 1979, 'Netherlands', ['CB'], 76, 80, 2005, 20, t(8, 5, 8, 8, 5, 7)),
  q('psv', 'addo_01', 'Eric Addo', 1978, 'Ghana', ['DM', 'CB'], 74, 78, 2005, 20, t(8, 5, 8, 7, 5, 8)),
  q('psv', 'faber_e_01', 'Ernest Faber', 1971, 'Netherlands', ['CB', 'RB'], 74, 75, 2004, 20, t(8, 5, 8, 8, 5, 7)),
  q('psv', 'heintze_01', 'Jan Heintze', 1963, 'Denmark', ['LB'], 74, 74, 2003, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
  q('psv', 'ramzi_01', 'Adil Ramzi', 1977, 'Morocco', ['AM', 'LW'], 73, 76, 2004, 25, t(7, 6, 8, 6, 6, 8)),
  q('psv', 'bogelund_01', 'Kasper Bøgelund', 1980, 'Denmark', ['RB'], 72, 77, 2005, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Feyenoord, 2001-02 (a 17-year-old Van Persie; UEFA Cup winners in 2002) ─────
const FEYENOORD_2001: CuratedSeed[] = [
  q('feyenoord', 'van_hooijdonk_01', 'Pierre van Hooijdonk', 1969, 'Netherlands', ['ST'], 80, 81, 2003, 25, t(6, 7, 8, 6, 7, 8)),
  q('feyenoord', 'van_persie_01', 'Robin van Persie', 1983, 'Netherlands', ['ST', 'LW'], 68, 90, 2005, 30, t(6, 8, 9, 6, 7, 8)),
  q('feyenoord', 'ono_01', 'Shinji Ono', 1979, 'Japan', ['AM', 'CM'], 78, 82, 2004, 25, t(8, 6, 8, 7, 5, 8)),
  q('feyenoord', 'kalou_01', 'Bonaventure Kalou', 1978, 'Ivory Coast', ['ST', 'RW'], 77, 82, 2004, 25, t(7, 6, 8, 6, 6, 8)),
  q('feyenoord', 'emerton_01', 'Brett Emerton', 1979, 'Australia', ['RW', 'RB'], 77, 81, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('feyenoord', 'bosvelt_01', 'Paul Bosvelt', 1970, 'Netherlands', ['DM', 'CM'], 77, 79, 2003, 20, t(9, 5, 8, 8, 4, 8)),
  q('feyenoord', 'paauwe_01', 'Jerzy Paauwe', 1978, 'Netherlands', ['RB', 'DM'], 74, 77, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('feyenoord', 'tomasson_01', 'Jon Dahl Tomasson', 1976, 'Denmark', ['ST', 'AM'], 80, 84, 2004, 20, t(8, 6, 8, 7, 5, 8)),
  q('feyenoord', 'zoetebier_01', 'Edwin Zoetebier', 1970, 'Netherlands', ['GK'], 75, 76, 2004, 20, t(8, 5, 8, 8, 5, 7)),
  q('feyenoord', 'van_wonderen_01', 'Kees van Wonderen', 1969, 'Netherlands', ['CB'], 75, 76, 2003, 20, t(8, 5, 8, 8, 5, 7)),
  q('feyenoord', 'gyan_01', 'Christian Gyan', 1978, 'Ghana', ['RB'], 73, 76, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('feyenoord', 'rzasa_01', 'Tomasz Rząsa', 1973, 'Poland', ['LB'], 73, 75, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('feyenoord', 'escude_01', 'Julien Escudé', 1979, 'France', ['CB'], 74, 82, 2005, 20, t(8, 5, 8, 7, 5, 8)),
  q('feyenoord', 'pardo_01', 'Pavel Pardo', 1976, 'Mexico', ['DM', 'CM'], 74, 77, 2004, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Valencia, 2001-02 (Benítez's La Liga champions) ────────────────────────────
const VALENCIA_2001: CuratedSeed[] = [
  q('valencia', 'canizares_01', 'Santiago Cañizares', 1969, 'Spain', ['GK'], 83, 84, 2004, 20, t(9, 6, 8, 9, 5, 7), { loyalty: 88 }),
  q('valencia', 'ayala_01', 'Roberto Ayala', 1973, 'Argentina', ['CB'], 84, 85, 2005, 20, t(9, 6, 8, 8, 5, 8)),
  q('valencia', 'baraja_01', 'Rubén Baraja', 1975, 'Spain', ['CM', 'DM'], 81, 83, 2005, 20, t(9, 5, 8, 8, 5, 8)),
  q('valencia', 'albelda_01', 'David Albelda', 1977, 'Spain', ['DM'], 80, 82, 2005, 20, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('valencia', 'aimar_01', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 82, 86, 2005, 25, t(8, 6, 8, 8, 5, 8)),
  q('valencia', 'kily_gonzalez_01', 'Kily González', 1974, 'Argentina', ['LW', 'LB'], 79, 81, 2004, 20, t(7, 6, 8, 7, 6, 8)),
  q('valencia', 'mista_01', 'Mista', 1978, 'Spain', ['ST'], 78, 82, 2005, 20, t(8, 5, 8, 7, 5, 8)),
  q('valencia', 'carew_01', 'John Carew', 1979, 'Norway', ['ST'], 79, 83, 2005, 20, t(7, 6, 8, 7, 5, 8)),
  q('valencia', 'vicente_01', 'Vicente', 1981, 'Spain', ['LW', 'AM'], 79, 86, 2006, 25, t(8, 6, 8, 8, 5, 8)),
  q('valencia', 'carboni_01', 'Amedeo Carboni', 1965, 'Italy', ['LB', 'CB'], 78, 79, 2003, 20, t(9, 5, 8, 8, 5, 8)),
  q('valencia', 'pellegrino_01', 'Mauricio Pellegrino', 1971, 'Argentina', ['CB'], 78, 79, 2004, 20, t(9, 5, 8, 8, 5, 8)),
  q('valencia', 'angloma_01', 'Jocelyn Angloma', 1965, 'France', ['RB', 'CB'], 77, 78, 2003, 20, t(8, 5, 8, 8, 5, 8)),
  q('valencia', 'rufete_01', 'Rufete', 1975, 'Spain', ['RW', 'AM'], 76, 79, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('valencia', 'aurelio_01', 'Fábio Aurélio', 1979, 'Brazil', ['LB', 'LW'], 76, 82, 2005, 25, t(8, 5, 8, 7, 5, 8)),
  q('valencia', 'curro_torres_01', 'Curro Torres', 1976, 'Spain', ['RB'], 74, 77, 2005, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── Deportivo La Coruña, 2001-02 (SuperDepor: Makaay, Valerón, Tristán) ─────────
const DEPORTIVO_2001: CuratedSeed[] = [
  q('deportivo', 'makaay_01', 'Roy Makaay', 1975, 'Netherlands', ['ST'], 84, 86, 2005, 20, t(9, 6, 8, 8, 4, 8)),
  q('deportivo', 'tristan_01', 'Diego Tristán', 1976, 'Spain', ['ST'], 82, 84, 2005, 25, t(6, 7, 8, 6, 6, 8)),
  q('deportivo', 'valeron_01', 'Juan Carlos Valerón', 1975, 'Spain', ['AM'], 83, 85, 2005, 25, t(9, 5, 8, 8, 4, 8)),
  q('deportivo', 'djalminha_01', 'Djalminha', 1970, 'Brazil', ['AM'], 80, 81, 2003, 20, t(5, 8, 8, 6, 7, 8)),
  q('deportivo', 'mauro_silva_01', 'Mauro Silva', 1968, 'Brazil', ['DM'], 80, 81, 2003, 20, t(9, 5, 8, 9, 4, 8), { loyalty: 90 }),
  q('deportivo', 'naybet_01', 'Noureddine Naybet', 1970, 'Morocco', ['CB'], 80, 81, 2004, 20, t(9, 5, 8, 8, 5, 8)),
  q('deportivo', 'sergio_01', 'Sergio', 1976, 'Spain', ['CM'], 78, 80, 2004, 20, t(8, 5, 8, 8, 5, 8)),
  q('deportivo', 'molina_dep01', 'José Francisco Molina', 1970, 'Spain', ['GK'], 79, 80, 2004, 20, t(8, 5, 8, 8, 5, 7)),
  q('deportivo', 'manuel_pablo_01', 'Manuel Pablo', 1976, 'Spain', ['RB'], 78, 81, 2005, 20, t(8, 5, 8, 8, 5, 8)),
  q('deportivo', 'cesar_martin_01', 'César Martín', 1977, 'Spain', ['CB'], 76, 79, 2005, 20, t(8, 5, 8, 8, 5, 7)),
  q('deportivo', 'capdevila_01', 'Joan Capdevila', 1978, 'Spain', ['LB', 'LW'], 77, 82, 2005, 20, t(8, 5, 8, 8, 5, 8)),
  q('deportivo', 'scaloni_01', 'Lionel Scaloni', 1978, 'Argentina', ['RB'], 74, 78, 2005, 20, t(8, 5, 8, 7, 5, 8)),
  q('deportivo', 'victor_dep01', 'Víctor Sánchez', 1976, 'Spain', ['RW', 'AM'], 76, 79, 2004, 20, t(7, 6, 8, 7, 5, 8)),
  q('deportivo', 'fran_dep01', 'Fran', 1969, 'Spain', ['AM', 'LW'], 78, 79, 2003, 20, t(9, 5, 8, 10, 5, 8), { loyalty: 95 }),
];

// ── Lazio, 2001-02 (the Cragnotti empire's last stand) ─────────────────────────
const LAZIO_2001: CuratedSeed[] = [
  q('lazio', 'nesta_01', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 86, 88, 2005, 20, t(9, 6, 8, 8, 4, 8)),
  q('lazio', 'mihajlovic_01', 'Siniša Mihajlović', 1969, 'Serbia', ['CB', 'LB'], 80, 81, 2004, 20, t(7, 7, 8, 8, 7, 7)),
  q('lazio', 'claudio_lopez_01', 'Claudio López', 1974, 'Argentina', ['ST', 'LW'], 81, 83, 2004, 20, t(7, 6, 8, 7, 6, 8)),
  q('lazio', 'simeone_01', 'Diego Simeone', 1970, 'Argentina', ['CM', 'DM'], 80, 81, 2003, 20, t(7, 7, 9, 7, 7, 8)),
  q('lazio', 'couto_01', 'Fernando Couto', 1969, 'Portugal', ['CB'], 80, 81, 2004, 20, t(8, 6, 8, 8, 6, 8)),
  q('lazio', 'peruzzi_01', 'Angelo Peruzzi', 1970, 'Italy', ['GK'], 81, 82, 2004, 20, t(9, 6, 8, 8, 5, 7)),
  q('lazio', 'stankovic_01', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 80, 84, 2005, 20, t(8, 6, 8, 7, 5, 8)),
  q('lazio', 'inzaghi_s_01', 'Simone Inzaghi', 1976, 'Italy', ['ST'], 76, 78, 2004, 20, t(8, 6, 8, 8, 5, 8)),
  q('lazio', 'favalli_01', 'Giuseppe Favalli', 1972, 'Italy', ['LB', 'CB'], 78, 80, 2004, 20, t(9, 5, 8, 8, 5, 8)),
  q('lazio', 'negro_01', 'Paolo Negro', 1972, 'Italy', ['CB', 'RB'], 76, 78, 2004, 20, t(8, 5, 8, 8, 5, 7)),
  q('lazio', 'pancaro_01', 'Giuseppe Pancaro', 1971, 'Italy', ['LB'], 76, 78, 2004, 20, t(8, 5, 8, 8, 5, 7)),
  q('lazio', 'liverani_01', 'Fabio Liverani', 1976, 'Italy', ['CM', 'DM'], 76, 80, 2005, 20, t(8, 5, 8, 7, 5, 8)),
  q('lazio', 'corradi_01', 'Bernardo Corradi', 1976, 'Italy', ['ST'], 75, 78, 2005, 20, t(7, 6, 8, 7, 5, 8)),
  q('lazio', 'marchegiani_01', 'Luca Marchegiani', 1966, 'Italy', ['GK'], 76, 76, 2003, 20, t(9, 5, 8, 8, 4, 7)),
];

// ── AS Roma, 2001-02 (the reigning Scudetto champions) ─────────────────────────
const ROMA_2001: CuratedSeed[] = [
  q('roma', 'totti_01', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 85, 88, 2005, 20, t(8, 7, 9, 10, 5, 8), { loyalty: 95 }),
  q('roma', 'batistuta_01', 'Gabriel Batistuta', 1969, 'Argentina', ['ST'], 84, 85, 2003, 25, t(8, 7, 9, 7, 5, 8)),
  q('roma', 'cafu_01', 'Cafu', 1970, 'Brazil', ['RB', 'RW'], 84, 85, 2004, 20, t(9, 6, 9, 8, 5, 8)),
  q('roma', 'emerson_01', 'Emerson', 1976, 'Brazil', ['DM', 'CM'], 82, 85, 2005, 20, t(9, 6, 8, 8, 5, 8)),
  q('roma', 'samuel_01', 'Walter Samuel', 1978, 'Argentina', ['CB'], 82, 85, 2005, 20, t(9, 6, 8, 8, 6, 8)),
  q('roma', 'candela_01', 'Vincent Candela', 1973, 'France', ['LB'], 79, 81, 2004, 20, t(8, 5, 8, 8, 5, 8)),
  q('roma', 'cassano_01', 'Antonio Cassano', 1982, 'Italy', ['AM', 'ST'], 74, 87, 2006, 20, t(4, 9, 8, 5, 8, 7)),
  q('roma', 'antonioli_01', 'Francesco Antonioli', 1969, 'Italy', ['GK'], 78, 79, 2004, 20, t(9, 5, 8, 8, 5, 7)),
  q('roma', 'aldair_01', 'Aldair', 1965, 'Brazil', ['CB'], 80, 80, 2003, 20, t(9, 5, 8, 9, 4, 8), { loyalty: 90 }),
  q('roma', 'zago_01', 'Zago', 1969, 'Brazil', ['CB'], 77, 78, 2004, 20, t(8, 5, 8, 8, 5, 8)),
  q('roma', 'assuncao_01', 'Marcos Assunção', 1976, 'Brazil', ['DM', 'CM'], 78, 80, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('roma', 'tommasi_01', 'Damiano Tommasi', 1974, 'Italy', ['CM', 'DM'], 79, 81, 2004, 20, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('roma', 'nakata_01', 'Hidetoshi Nakata', 1977, 'Japan', ['AM', 'CM'], 80, 83, 2004, 20, t(9, 6, 8, 7, 5, 8)),
  q('roma', 'montella_01', 'Vincenzo Montella', 1974, 'Italy', ['ST'], 81, 83, 2004, 20, t(8, 6, 8, 8, 5, 8)),
  q('roma', 'delvecchio_01', 'Marco Delvecchio', 1973, 'Italy', ['ST', 'LW'], 78, 80, 2004, 20, t(8, 6, 8, 8, 5, 8)),
];

// ── Bayer Leverkusen, 2001-02 (the treble-runners-up of Ballack & Zé Roberto) ──
const LEVERKUSEN_2001: CuratedSeed[] = [
  q('leverkusen', 'ballack_01', 'Michael Ballack', 1976, 'Germany', ['CM', 'AM'], 84, 88, 2004, 20, t(9, 7, 9, 7, 5, 8)),
  q('leverkusen', 'ze_roberto_01', 'Zé Roberto', 1974, 'Brazil', ['LW', 'CM'], 82, 84, 2004, 20, t(9, 5, 8, 8, 4, 8)),
  q('leverkusen', 'lucio_01', 'Lúcio', 1978, 'Brazil', ['CB'], 82, 86, 2005, 20, t(8, 6, 8, 8, 5, 8)),
  q('leverkusen', 'basturk_01', 'Yıldıray Baştürk', 1978, 'Turkey', ['AM', 'CM'], 79, 82, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('leverkusen', 'schneider_01', 'Bernd Schneider', 1973, 'Germany', ['RW', 'AM'], 80, 82, 2005, 20, t(9, 5, 8, 8, 4, 8)),
  q('leverkusen', 'neuville_01', 'Oliver Neuville', 1973, 'Germany', ['ST'], 79, 80, 2004, 20, t(8, 6, 8, 7, 5, 8)),
  q('leverkusen', 'berbatov_01', 'Dimitar Berbatov', 1981, 'Bulgaria', ['ST'], 72, 87, 2005, 20, t(7, 7, 8, 6, 5, 8)),
  q('leverkusen', 'butt_01', 'Hans-Jörg Butt', 1974, 'Germany', ['GK'], 79, 81, 2005, 20, t(9, 5, 8, 8, 4, 8)),
  q('leverkusen', 'nowotny_01', 'Jens Nowotny', 1974, 'Germany', ['CB'], 81, 83, 2005, 25, t(9, 5, 8, 8, 4, 8)),
  q('leverkusen', 'placente_01', 'Diego Placente', 1977, 'Argentina', ['LB'], 77, 80, 2005, 20, t(8, 5, 8, 7, 5, 8)),
  q('leverkusen', 'zivkovic_01', 'Boris Živković', 1975, 'Croatia', ['RB', 'CB'], 76, 78, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('leverkusen', 'ramelow_01', 'Carsten Ramelow', 1974, 'Germany', ['DM', 'CB'], 78, 80, 2005, 20, t(9, 5, 8, 8, 4, 8)),
  q('leverkusen', 'kirsten_01', 'Ulf Kirsten', 1965, 'Germany', ['ST'], 76, 76, 2003, 25, t(8, 6, 8, 9, 5, 8), { loyalty: 90 }),
  q('leverkusen', 'brdaric_01', 'Thomas Brdarić', 1975, 'Germany', ['ST'], 73, 76, 2004, 20, t(7, 6, 8, 7, 5, 8)),
  q('leverkusen', 'babic_01', 'Marko Babić', 1981, 'Croatia', ['LW', 'LB'], 74, 81, 2005, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── Borussia Dortmund, 2001-02 (Bundesliga champions) ──────────────────────────
const DORTMUND_2001: CuratedSeed[] = [
  q('dortmund', 'koller_01', 'Jan Koller', 1973, 'Czechia', ['ST'], 81, 82, 2004, 20, t(8, 6, 8, 8, 5, 8)),
  q('dortmund', 'amoroso_01', 'Márcio Amoroso', 1974, 'Brazil', ['ST'], 81, 83, 2004, 25, t(6, 7, 8, 6, 6, 8)),
  q('dortmund', 'rosicky_01', 'Tomáš Rosický', 1980, 'Czechia', ['AM', 'CM'], 80, 86, 2005, 25, t(8, 6, 9, 7, 5, 8)),
  q('dortmund', 'kehl_01', 'Sebastian Kehl', 1980, 'Germany', ['DM', 'CB'], 78, 83, 2005, 20, t(9, 5, 8, 8, 5, 8)),
  q('dortmund', 'metzelder_01', 'Christoph Metzelder', 1980, 'Germany', ['CB'], 78, 83, 2005, 25, t(9, 5, 8, 8, 5, 8)),
  q('dortmund', 'dede_01', 'Dedé', 1978, 'Brazil', ['LB'], 78, 81, 2005, 20, t(8, 5, 8, 8, 5, 8)),
  q('dortmund', 'lehmann_01', 'Jens Lehmann', 1969, 'Germany', ['GK'], 81, 83, 2004, 20, t(8, 7, 8, 7, 6, 8)),
  q('dortmund', 'worns_01', 'Christian Wörns', 1972, 'Germany', ['CB'], 79, 80, 2004, 20, t(9, 5, 8, 8, 4, 8)),
  q('dortmund', 'evanilson_01', 'Evanílson', 1974, 'Brazil', ['RB', 'CB'], 76, 78, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('dortmund', 'reuter_01', 'Stefan Reuter', 1966, 'Germany', ['RB', 'DM'], 76, 76, 2003, 20, t(9, 5, 8, 9, 4, 8), { loyalty: 90 }),
  q('dortmund', 'heinrich_01', 'Jörg Heinrich', 1969, 'Germany', ['LB', 'LW'], 75, 76, 2003, 20, t(8, 5, 8, 8, 5, 8)),
  q('dortmund', 'ricken_01', 'Lars Ricken', 1976, 'Germany', ['AM', 'ST'], 76, 79, 2004, 20, t(8, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('dortmund', 'ewerthon_01', 'Ewerthon', 1981, 'Brazil', ['ST', 'RW'], 75, 82, 2005, 20, t(7, 6, 8, 7, 5, 8)),
  q('dortmund', 'kohler_01', 'Jürgen Kohler', 1965, 'Germany', ['CB'], 76, 76, 2002, 25, t(9, 6, 8, 9, 5, 7), { loyalty: 88 }),
];

// ── Celtic, 2001-02 (O'Neill's champions; Larsson the talisman) ────────────────
const CELTIC_2001: CuratedSeed[] = [
  q('celtic', 'larsson_01', 'Henrik Larsson', 1971, 'Sweden', ['ST', 'AM'], 84, 86, 2004, 20, t(9, 6, 9, 9, 4, 8), { loyalty: 90 }),
  q('celtic', 'sutton_01', 'Chris Sutton', 1973, 'England', ['ST'], 79, 81, 2005, 20, t(8, 6, 8, 8, 5, 8)),
  q('celtic', 'hartson_01', 'John Hartson', 1975, 'Wales', ['ST'], 78, 80, 2005, 25, t(7, 6, 8, 7, 6, 8)),
  q('celtic', 'lennon_01', 'Neil Lennon', 1971, 'Northern Ireland', ['DM', 'CM'], 78, 80, 2005, 20, t(8, 6, 8, 9, 6, 7)),
  q('celtic', 'petrov_s_01', 'Stiliyan Petrov', 1979, 'Bulgaria', ['CM', 'DM'], 78, 83, 2005, 20, t(8, 5, 8, 8, 5, 8)),
  q('celtic', 'agathe_01', 'Didier Agathe', 1975, 'France', ['RW', 'RB'], 75, 78, 2005, 20, t(7, 5, 8, 7, 5, 8)),
  q('celtic', 'valgaeren_01', 'Joos Valgaeren', 1976, 'Belgium', ['CB'], 76, 79, 2005, 20, t(8, 5, 8, 8, 5, 7)),
  q('celtic', 'douglas_01', 'Rab Douglas', 1972, 'Scotland', ['GK'], 75, 77, 2005, 20, t(8, 5, 8, 8, 5, 7)),
  q('celtic', 'mjallby_01', 'Johan Mjällby', 1971, 'Sweden', ['CB', 'DM'], 77, 78, 2004, 20, t(8, 5, 8, 8, 5, 8)),
  q('celtic', 'balde_01', 'Bobo Baldé', 1975, 'Guinea', ['CB'], 77, 80, 2005, 20, t(8, 5, 8, 8, 6, 8)),
  q('celtic', 'thompson_a_01', 'Alan Thompson', 1973, 'England', ['LW', 'CM'], 75, 77, 2005, 20, t(7, 6, 8, 8, 5, 8)),
  q('celtic', 'lambert_p_01', 'Paul Lambert', 1969, 'Scotland', ['CM', 'DM'], 77, 78, 2004, 20, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('celtic', 'mcnamara_01', 'Jackie McNamara', 1973, 'Scotland', ['RB', 'CM'], 75, 77, 2005, 20, t(8, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('celtic', 'petta_01', 'Bobby Petta', 1974, 'Netherlands', ['LW'], 73, 75, 2004, 20, t(7, 5, 8, 7, 5, 8)),
];

// ── Rangers, 2001-02 (Advocaat/McLeish; the £12m Flo, De Boer, captain Ferguson) ─
const RANGERS_2001: CuratedSeed[] = [
  q('rangers', 'klos_01', 'Stefan Klos', 1971, 'Germany', ['GK'], 80, 81, 2005, 20, t(8, 5, 6, 8, 4, 7)),
  q('rangers', 'amoruso_01', 'Lorenzo Amoruso', 1971, 'Italy', ['CB'], 79, 80, 2004, 25, t(8, 6, 7, 7, 5, 7), { loyalty: 85 }),
  q('rangers', 'moore_r01', 'Craig Moore', 1975, 'Australia', ['CB'], 76, 78, 2005, 25, t(8, 5, 7, 7, 4, 7)),
  q('rangers', 'konterman_01', 'Bert Konterman', 1971, 'Netherlands', ['CB', 'DM'], 74, 75, 2004, 25, t(8, 4, 6, 7, 4, 7)),
  q('rangers', 'numan_r01', 'Arthur Numan', 1969, 'Netherlands', ['LB'], 78, 79, 2003, 20, t(8, 5, 7, 7, 4, 7)),
  q('rangers', 'ball_01', 'Michael Ball', 1979, 'England', ['LB'], 75, 80, 2006, 30, t(7, 5, 7, 6, 5, 7)),
  q('rangers', 'ricksen_01', 'Fernando Ricksen', 1976, 'Netherlands', ['RB', 'DM'], 76, 78, 2006, 25, t(6, 7, 8, 6, 7, 7)),
  q('rangers', 'bferguson_01', 'Barry Ferguson', 1978, 'Scotland', ['CM'], 82, 84, 2005, 20, t(8, 6, 8, 8, 5, 7)),
  q('rangers', 'nerlinger_01', 'Christian Nerlinger', 1973, 'Germany', ['DM', 'CM'], 76, 77, 2004, 25, t(8, 5, 7, 7, 4, 7)),
  q('rangers', 'deboer_r01', 'Ronald de Boer', 1970, 'Netherlands', ['AM', 'ST'], 80, 81, 2004, 25, t(8, 6, 8, 7, 5, 8)),
  q('rangers', 'mccann_01', 'Neil McCann', 1974, 'Scotland', ['LW'], 75, 76, 2004, 25, t(7, 5, 7, 7, 5, 7)),
  q('rangers', 'lovenkrands_01', 'Peter Løvenkrands', 1980, 'Denmark', ['LW', 'ST'], 75, 79, 2006, 25, t(7, 5, 7, 6, 5, 7)),
  q('rangers', 'flo_01', 'Tore André Flo', 1973, 'Norway', ['ST'], 80, 81, 2005, 25, t(7, 6, 7, 6, 5, 7)),
  q('rangers', 'arveladze_01', 'Shota Arveladze', 1973, 'Georgia', ['ST', 'LW'], 77, 78, 2005, 25, t(7, 6, 8, 6, 5, 7)),
  q('rangers', 'mols_01', 'Michael Mols', 1970, 'Netherlands', ['ST'], 77, 78, 2004, 35, t(7, 6, 7, 6, 5, 7)),
  q('rangers', 'miller_r01', 'Kenny Miller', 1979, 'Scotland', ['ST'], 73, 80, 2005, 25, t(7, 6, 8, 6, 5, 7)),
  q('rangers', 'caniggia_01', 'Claudio Caniggia', 1967, 'Argentina', ['ST'], 77, 77, 2003, 30, t(6, 8, 7, 5, 7, 6)),
  q('rangers', 'mcgregor_01', 'Allan McGregor', 1982, 'Scotland', ['GK'], 66, 82, 2006, 20, t(7, 5, 7, 7, 5, 6)),
];

// ── Galatasaray, 2001-02 (Lucescu's Süper Lig champions; Hasan Şaş the jewel) ────
const GALATASARAY_2001: CuratedSeed[] = [
  q('galatasaray', 'mondragon_01', 'Faryd Mondragón', 1971, 'Colombia', ['GK'], 80, 81, 2005, 20, t(7, 6, 7, 7, 5, 7)),
  q('galatasaray', 'bulentkorkmaz_01', 'Bülent Korkmaz', 1968, 'Turkey', ['CB'], 80, 80, 2004, 25, t(9, 6, 7, 10, 4, 7), { loyalty: 92 }),
  q('galatasaray', 'emreasik_01', 'Emre Aşık', 1973, 'Turkey', ['CB'], 78, 79, 2005, 25, t(7, 6, 7, 7, 6, 7)),
  q('galatasaray', 'hakanunsal_01', 'Hakan Ünsal', 1973, 'Turkey', ['LB'], 78, 79, 2004, 25, t(7, 6, 7, 7, 6, 7)),
  q('galatasaray', 'davala_01', 'Ümit Davala', 1973, 'Turkey', ['RW', 'RB'], 78, 79, 2004, 25, t(7, 6, 8, 6, 6, 7)),
  q('galatasaray', 'penbe_01', 'Ergün Penbe', 1972, 'Turkey', ['DM', 'CM'], 77, 78, 2005, 20, t(8, 5, 7, 8, 4, 7)),
  q('galatasaray', 'fleurquin_01', 'Andrés Fleurquin', 1975, 'Uruguay', ['DM', 'CM'], 76, 77, 2005, 25, t(7, 5, 7, 6, 5, 6)),
  q('galatasaray', 'hasansas_01', 'Hasan Şaş', 1976, 'Turkey', ['LW', 'AM'], 83, 84, 2005, 25, t(8, 6, 8, 7, 5, 7)),
  q('galatasaray', 'ariferdem_01', 'Arif Erdem', 1972, 'Turkey', ['ST', 'AM'], 78, 79, 2004, 25, t(8, 6, 7, 8, 5, 7)),
  q('galatasaray', 'umitkaran_01', 'Ümit Karan', 1976, 'Turkey', ['ST'], 79, 80, 2005, 25, t(7, 6, 8, 7, 5, 7)),
  q('galatasaray', 'sebperez_01', 'Sébastien Pérez', 1973, 'France', ['CB', 'DM'], 76, 77, 2004, 25, t(7, 5, 7, 6, 5, 6)),
  q('galatasaray', 'gvictoria_01', 'Gustavo Victoria', 1980, 'Colombia', ['LB', 'LW'], 72, 75, 2005, 25, t(7, 5, 7, 6, 5, 7)),
  q('galatasaray', 'suatkaya_01', 'Suat Kaya', 1967, 'Turkey', ['DM', 'CM'], 73, 73, 2003, 25, t(8, 5, 6, 8, 4, 7)),
  q('galatasaray', 'inceefe_01', 'Vedat İnceefe', 1974, 'Turkey', ['CB'], 72, 73, 2004, 25, t(7, 4, 6, 7, 4, 7)),
];

// ── Fenerbahçe, 2001-02 (a selling engine: Rüştü, Rapaić, Revivo the elite circle) ─
const FENERBAHCE_2001: CuratedSeed[] = [
  q('fenerbahce', 'rustu_01', 'Rüştü Reçber', 1973, 'Turkey', ['GK'], 84, 85, 2005, 20, t(8, 6, 8, 8, 4, 7)),
  q('fenerbahce', 'mirkovic_01', 'Zoran Mirković', 1971, 'Serbia', ['RB'], 77, 78, 2004, 25, t(8, 5, 7, 6, 5, 7)),
  q('fenerbahce', 'fatihakyel_01', 'Fatih Akyel', 1977, 'Turkey', ['RB', 'CB'], 77, 78, 2005, 25, t(7, 5, 7, 7, 5, 7)),
  q('fenerbahce', 'umitozat_01', 'Ümit Özat', 1976, 'Turkey', ['CB', 'DM'], 78, 79, 2005, 25, t(8, 5, 7, 7, 5, 7)),
  q('fenerbahce', 'uche_01', 'Uche Okechukwu', 1967, 'Nigeria', ['CB'], 77, 77, 2003, 30, t(8, 5, 7, 8, 4, 7), { loyalty: 88 }),
  q('fenerbahce', 'ogun_01', 'Ogün Temizkanoğlu', 1969, 'Turkey', ['CB'], 76, 77, 2003, 30, t(8, 5, 7, 8, 4, 7)),
  q('fenerbahce', 'abdullahercan_01', 'Abdullah Ercan', 1971, 'Turkey', ['LB', 'CM'], 76, 77, 2005, 25, t(8, 5, 7, 7, 4, 7)),
  q('fenerbahce', 'samjohnson_01', 'Samuel Johnson', 1973, 'Ghana', ['CM', 'DM'], 76, 77, 2004, 25, t(7, 5, 7, 6, 5, 7)),
  q('fenerbahce', 'lazetic_01', 'Nikola Lazetić', 1978, 'Serbia', ['CM'], 75, 77, 2005, 25, t(7, 5, 7, 6, 5, 7)),
  q('fenerbahce', 'bayraktar_01', 'Hakan Bayraktar', 1976, 'Turkey', ['AM', 'CM'], 77, 78, 2005, 25, t(7, 5, 7, 7, 5, 7)),
  q('fenerbahce', 'rapaic_01', 'Milan Rapaić', 1973, 'Croatia', ['RW', 'AM'], 82, 83, 2004, 25, t(6, 7, 7, 5, 7, 7)),
  q('fenerbahce', 'revivo_01', 'Haim Revivo', 1972, 'Israel', ['AM', 'LW'], 82, 83, 2004, 25, t(7, 7, 8, 5, 6, 7)),
  q('fenerbahce', 'kanderson_01', 'Kennet Andersson', 1967, 'Sweden', ['ST'], 77, 77, 2003, 35, t(7, 5, 7, 7, 4, 7)),
  q('fenerbahce', 'serhatakin_01', 'Serhat Akın', 1981, 'Turkey', ['ST'], 73, 80, 2005, 30, t(6, 6, 8, 6, 6, 7)),
  q('fenerbahce', 'oktayderelioglu_01', 'Oktay Derelioğlu', 1975, 'Turkey', ['ST'], 74, 75, 2004, 30, t(7, 6, 7, 6, 5, 7)),
];

// ── Olympique Lyonnais, 2001-02 (the first of seven straight titles) ───────────
const LYON_2001: CuratedSeed[] = [
  q('lyon', 'coupet_01', 'Grégory Coupet', 1972, 'France', ['GK'], 82, 84, 2005, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('lyon', 'juninho_01', 'Juninho Pernambucano', 1975, 'Brazil', ['CM', 'AM'], 82, 85, 2005, 20, t(9, 6, 8, 8, 5, 8)),
  q('lyon', 'sonny_anderson_01', 'Sonny Anderson', 1970, 'Brazil', ['ST'], 82, 83, 2004, 20, t(8, 6, 8, 8, 5, 8)),
  q('lyon', 'govou_01', 'Sidney Govou', 1979, 'France', ['RW', 'ST'], 77, 82, 2005, 20, t(7, 6, 8, 8, 5, 8)),
  q('lyon', 'carriere_01', 'Éric Carrière', 1973, 'France', ['AM', 'CM'], 78, 80, 2004, 20, t(8, 5, 8, 8, 5, 8)),
  q('lyon', 'edmilson_01', 'Edmílson', 1976, 'Brazil', ['DM', 'CB'], 80, 83, 2005, 20, t(9, 5, 8, 8, 5, 8)),
  q('lyon', 'cris_01', 'Cris', 1977, 'Brazil', ['CB'], 78, 82, 2005, 20, t(8, 6, 8, 8, 6, 7)),
  q('lyon', 'muller_p_01', 'Patrick Müller', 1976, 'Switzerland', ['CB', 'DM'], 78, 80, 2004, 20, t(9, 5, 8, 8, 5, 8)),
  q('lyon', 'brechet_01', 'Jérémie Bréchet', 1979, 'France', ['CB', 'LB'], 75, 80, 2005, 20, t(8, 5, 8, 7, 5, 8)),
  q('lyon', 'deflandre_01', 'Éric Deflandre', 1973, 'Belgium', ['RB'], 75, 77, 2004, 20, t(8, 5, 8, 8, 5, 8)),
  q('lyon', 'violeau_01', 'Philippe Violeau', 1973, 'France', ['DM', 'CM'], 74, 76, 2004, 20, t(8, 5, 8, 8, 5, 8)),
  q('lyon', 'dhorasoo_01', 'Vikash Dhorasoo', 1973, 'France', ['CM', 'AM'], 77, 79, 2004, 20, t(7, 6, 8, 7, 5, 8)),
  q('lyon', 'laville_01', 'Florent Laville', 1973, 'France', ['CB'], 74, 76, 2004, 20, t(8, 5, 8, 8, 5, 7)),
  q('lyon', 'luyindula_01', 'Péguy Luyindula', 1979, 'France', ['ST'], 74, 80, 2005, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── Real Sociedad, 2001-02 (the club that sold Liverpool its metronome) ─────────
const REAL_SOCIEDAD_2001: CuratedSeed[] = [
  q('real_sociedad', 'riesgo_rs01', 'Asier Riesgo', 1983, 'Spain', ['GK'], 71, 80, 2006, 15, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('real_sociedad', 'kvarme_rs01', 'Bjørn Tore Kvarme', 1972, 'Norway', ['CB', 'RB'], 76, 78, 2004, 20, t(8, 5, 8, 8, 5, 8)),
  q('real_sociedad', 'aranzabal_rs01', 'Agustín Aranzábal', 1973, 'Spain', ['LB'], 77, 79, 2004, 20, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('real_sociedad', 'de_pedro_rs01', 'Javier de Pedro', 1973, 'Spain', ['LW', 'AM'], 79, 81, 2004, 20, t(7, 6, 8, 7, 5, 8)),
  q('real_sociedad', 'karpin_rs01', 'Valeri Karpin', 1969, 'Russia', ['RW', 'CM'], 79, 80, 2004, 20, t(8, 6, 8, 8, 5, 8)),
  q('real_sociedad', 'kovacevic_rs01', 'Darko Kovačević', 1973, 'Serbia', ['ST'], 81, 83, 2005, 20, t(8, 6, 8, 7, 5, 8)),
  q('real_sociedad', 'nihat_rs01', 'Nihat Kahveci', 1979, 'Turkey', ['ST', 'RW'], 78, 84, 2005, 20, t(7, 6, 8, 7, 6, 8)),
  // Xabi Alonso — seeded young (19, the captain-in-waiting) for his real 2004 move to
  // Liverpool, the deep-lying passer around whom Rafa built the Istanbul side.
  q('real_sociedad', 'xabi_rs01', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 72, 89, 2005, 10, t(9, 6, 9, 8, 4, 9)),
];

// ── Atlético Madrid, 2001-02 (Segunda years — but El Niño is coming through) ─────
const ATLETICO_2001: CuratedSeed[] = [
  q('atletico', 'burgos_at01', 'Germán Burgos', 1969, 'Argentina', ['GK'], 78, 79, 2004, 20, t(7, 6, 8, 8, 6, 8)),
  q('atletico', 'santi_denia_at01', 'Santi Denia', 1975, 'Spain', ['CB'], 76, 78, 2004, 20, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('atletico', 'hibic_at01', 'Mario Hibić', 1975, 'Croatia', ['CB'], 74, 77, 2004, 20, t(8, 5, 8, 7, 5, 8)),
  q('atletico', 'aguilera_at01', 'Carlos Aguilera', 1969, 'Spain', ['RB', 'RW'], 75, 77, 2003, 20, t(8, 5, 8, 8, 5, 8)),
  q('atletico', 'jorge_at01', 'Jorge Otero', 1969, 'Spain', ['LB'], 74, 76, 2003, 20, t(8, 5, 8, 8, 5, 8)),
  q('atletico', 'correa_at01', 'José Mari', 1978, 'Spain', ['ST'], 76, 80, 2004, 20, t(7, 6, 8, 7, 6, 8)),
  q('atletico', 'luis_garcia_at01', 'Luis García', 1978, 'Spain', ['AM', 'RW'], 76, 84, 2004, 20, t(7, 6, 8, 7, 5, 8)),
  // Fernando Torres — the 17-year-old academy jewel, seeded young for his real 2007
  // move to Liverpool, El Niño who defined Rafa's attack.
  q('atletico', 'torres_at01', 'Fernando Torres', 1984, 'Spain', ['ST'], 62, 90, 2008, 15, t(9, 6, 9, 8, 4, 9)),
];

// ── Coventry City, 2001-02 (just relegated — the club that sold Kirkland) ───────
const COVENTRY_2001: CuratedSeed[] = [
  q('coventry', 'hedman_cv01', 'Magnus Hedman', 1973, 'Sweden', ['GK'], 74, 76, 2004, 20, t(8, 5, 7, 7, 5, 7)),
  q('coventry', 'hall_cv01', 'Marcus Hall', 1976, 'England', ['LB'], 68, 70, 2003, 20, t(8, 5, 7, 8, 5, 7)),
  q('coventry', 'konjic_cv01', 'Mohammed Konjić', 1970, 'Bosnia', ['CB'], 72, 73, 2003, 20, t(8, 5, 7, 8, 5, 7)),
  q('coventry', 'davenport_cv01', 'Calum Davenport', 1983, 'England', ['CB'], 66, 78, 2005, 25, t(7, 5, 7, 7, 5, 7)),
  q('coventry', 'carsley_cv01', 'Lee Carsley', 1974, 'Ireland', ['DM', 'CM'], 74, 76, 2004, 20, t(8, 5, 8, 8, 5, 7)),
  q('coventry', 'chippo_cv01', 'Youssef Chippo', 1973, 'Morocco', ['CM', 'AM'], 73, 75, 2003, 20, t(7, 6, 8, 7, 5, 7)),
  q('coventry', 'eustace_cv01', 'John Eustace', 1979, 'England', ['CM', 'DM'], 67, 74, 2004, 20, t(8, 5, 7, 8, 5, 7)),
  q('coventry', 'bothroyd_cv01', 'Jay Bothroyd', 1982, 'England', ['ST'], 68, 78, 2004, 25, t(6, 7, 8, 6, 6, 7)),
  q('coventry', 'hughes_cv01', 'Lee Hughes', 1976, 'England', ['ST'], 72, 74, 2003, 25, t(7, 6, 8, 7, 6, 7)),
];

// ── Paris Saint-Germain, 2001-02 (Anelka's parent club; a young Ronaldinho) ─────
const PSG_2001: CuratedSeed[] = [
  q('psg', 'letizi_pg01', 'Lionel Letizi', 1973, 'France', ['GK'], 78, 80, 2005, 20, t(8, 5, 8, 8, 5, 7)),
  q('psg', 'pochettino_pg01', 'Mauricio Pochettino', 1972, 'Argentina', ['CB'], 79, 80, 2003, 20, t(9, 5, 8, 8, 5, 7)),
  q('psg', 'heinze_pg01', 'Gabriel Heinze', 1978, 'Argentina', ['LB', 'CB'], 78, 84, 2004, 20, t(8, 6, 9, 7, 6, 7)),
  q('psg', 'mendy_pg01', 'Bernard Mendy', 1981, 'France', ['RB', 'RW'], 74, 79, 2005, 20, t(7, 5, 8, 7, 5, 8)),
  q('psg', 'distin_pg01', 'Sylvain Distin', 1977, 'France', ['CB'], 78, 82, 2004, 20, t(8, 5, 8, 7, 4, 7)),
  q('psg', 'arteta_pg01', 'Mikel Arteta', 1982, 'Spain', ['CM', 'AM'], 73, 85, 2003, 15, t(9, 5, 8, 7, 4, 8)),
  q('psg', 'leroy_pg01', 'Jérôme Leroy', 1974, 'France', ['AM', 'CM'], 76, 79, 2004, 20, t(7, 6, 8, 7, 5, 7)),
  q('psg', 'ronaldinho_pg01', 'Ronaldinho', 1980, 'Brazil', ['AM', 'LW'], 84, 95, 2003, 20, t(8, 7, 9, 6, 5, 9)),
  q('psg', 'okocha_pg01', 'Jay-Jay Okocha', 1973, 'Nigeria', ['AM', 'RW'], 81, 83, 2002, 20, t(7, 7, 8, 6, 6, 8)),
  q('psg', 'aloisio_pg01', 'Aloísio', 1975, 'Brazil', ['ST'], 74, 76, 2003, 20, t(7, 6, 8, 6, 6, 7)),
  // Nicolas Anelka — PSG own him; he goes to Liverpool on loan in January 2002.
  q('psg', 'anelka01', 'Nicolas Anelka', 1979, 'France', ['ST'], 84, 87, 2002, 30, t(5, 8, 8, 4, 6, 6)),
];

/** The European selling clubs of the 2001-02 world, merged into the
 *  liverpool-2001 universe (all whole new clubs). */
export const EUROPE_2001_SQUADS: Record<string, CuratedSeed[]> = {
  ajax: AJAX_2001,
  psv: PSV_2001,
  feyenoord: FEYENOORD_2001,
  valencia: VALENCIA_2001,
  deportivo: DEPORTIVO_2001,
  lazio: LAZIO_2001,
  roma: ROMA_2001,
  leverkusen: LEVERKUSEN_2001,
  dortmund: DORTMUND_2001,
  celtic: CELTIC_2001,
  rangers: RANGERS_2001,
  galatasaray: GALATASARAY_2001,
  fenerbahce: FENERBAHCE_2001,
  lyon: LYON_2001,
  real_sociedad: REAL_SOCIEDAD_2001,
  atletico: ATLETICO_2001,
  coventry: COVENTRY_2001,
  psg: PSG_2001,
};
