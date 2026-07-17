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
  lyon: LYON_2001,
};
