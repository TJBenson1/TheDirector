/**
 * Curated real players — 2000 "Galácticos" era pack (Spain; §4, §17.10).
 *
 * The vertical slice for "Real Madrid — 2000: Galácticos". La Liga 2000–01 as it
 * really was (Figo already arrived; Deportivo the reigning champions; Valencia a
 * back-to-back Champions League finalist) plus the European clubs that sold Real
 * their galácticos (Juventus→Zidane, Inter→Ronaldo, United→Beckham, Liverpool→
 * Owen) and the La Liga rivals' real recruitment (Barça's Ronaldinho/Eto'o/Deco).
 *
 * The point of the depth here is the user directive: any realistic signing for a
 * playable Spanish club should exist in the database, so the market offers real
 * options, not procedural filler. Ability/potential/personality are HIDDEN
 * designer estimates (§7); clubs, birth years, positions and contracts are real.
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

// ── Real Madrid, 2000–01 (Figo has arrived; Anelka/Redondo have gone) ─────────
export const REAL_MADRID_2000: CuratedSeed[] = [
  q('real_madrid', 'casillas', 'Iker Casillas', 1981, 'Spain', ['GK'], 79, 90, 2004, 20, t(9, 4, 8, 9, 3, 8)),
  q('real_madrid', 'cesar_s', 'César Sánchez', 1971, 'Spain', ['GK'], 77, 78, 2003, 25, t(8, 4, 6, 7, 4, 7)),
  q('real_madrid', 'salgado', 'Míchel Salgado', 1975, 'Spain', ['RB'], 81, 82, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('real_madrid', 'roberto_carlos', 'Roberto Carlos', 1973, 'Brazil', ['LB'], 88, 88, 2004, 25, t(8, 7, 8, 8, 4, 7)),
  q('real_madrid', 'hierro', 'Fernando Hierro', 1968, 'Spain', ['CB', 'DM'], 85, 85, 2003, 25, t(9, 6, 8, 9, 4, 6), { loyalty: 90 }),
  q('real_madrid', 'helguera', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 82, 84, 2004, 30, t(8, 5, 8, 7, 5, 7)),
  q('real_madrid', 'karanka', 'Aitor Karanka', 1973, 'Spain', ['CB'], 76, 77, 2003, 25, t(8, 4, 6, 8, 3, 7)),
  q('real_madrid', 'ivan_campo', 'Iván Campo', 1974, 'Spain', ['CB'], 76, 78, 2003, 30, t(6, 5, 6, 6, 6, 7)),
  q('real_madrid', 'makelele', 'Claude Makélélé', 1973, 'France', ['DM'], 85, 86, 2003, 25, t(9, 4, 8, 7, 3, 7)),
  q('real_madrid', 'flavio', 'Flávio Conceição', 1974, 'Brazil', ['DM', 'CM'], 79, 81, 2004, 30, t(7, 5, 6, 6, 6, 7)),
  q('real_madrid', 'guti', 'Guti', 1976, 'Spain', ['AM', 'CM'], 82, 86, 2004, 30, t(6, 7, 6, 8, 6, 7)),
  q('real_madrid', 'mcmanaman', 'Steve McManaman', 1972, 'England', ['RW', 'AM'], 82, 84, 2003, 30, t(8, 5, 7, 6, 4, 7)),
  q('real_madrid', 'solari', 'Santiago Solari', 1976, 'Argentina', ['LW', 'AM'], 79, 82, 2004, 25, t(8, 5, 7, 7, 4, 7)),
  q('real_madrid', 'celades', 'Albert Celades', 1975, 'Spain', ['CM', 'DM'], 74, 76, 2003, 25, t(8, 4, 6, 7, 4, 7)),
  q('real_madrid', 'raul', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 89, 91, 2004, 20, t(9, 6, 9, 10, 3, 7), { loyalty: 92 }),
  q('real_madrid', 'morientes', 'Fernando Morientes', 1976, 'Spain', ['ST'], 84, 85, 2004, 35, t(8, 5, 8, 7, 4, 7)),
  q('real_madrid', 'savio', 'Sávio', 1974, 'Brazil', ['RW', 'ST'], 79, 81, 2003, 30, t(7, 5, 6, 6, 5, 7)),
  q('real_madrid', 'munitis', 'Pedro Munitis', 1975, 'Spain', ['LW', 'RW'], 77, 79, 2003, 30, t(8, 4, 7, 7, 4, 7)),
];

// ── Barcelona, 2000–01 (Figo still here — his move to Madrid is the opening
//    decision the Real Madrid player faces, not a fait accompli) ──────────────
export const BARCELONA_2000: CuratedSeed[] = [
  q('barcelona', 'figo', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 89, 90, 2005, 25, t(8, 7, 9, 5, 4, 7)),
  q('barcelona', 'reina', 'Pepe Reina', 1982, 'Spain', ['GK'], 70, 86, 2004, 20, t(9, 5, 8, 7, 3, 8)),
  q('barcelona', 'dutruel', 'Richard Dutruel', 1972, 'France', ['GK'], 75, 76, 2003, 25, t(7, 4, 5, 6, 5, 6)),
  q('barcelona', 'puyol', 'Carles Puyol', 1978, 'Spain', ['CB', 'RB'], 78, 88, 2005, 25, t(9, 5, 9, 10, 3, 7)),
  q('barcelona', 'deboer_f', 'Frank de Boer', 1970, 'Netherlands', ['CB'], 83, 84, 2003, 25, t(8, 5, 7, 6, 3, 7)),
  q('barcelona', 'abelardo', 'Abelardo', 1970, 'Spain', ['CB'], 80, 81, 2002, 30, t(8, 5, 7, 8, 5, 6)),
  q('barcelona', 'sergi', 'Sergi Barjuán', 1971, 'Spain', ['LB'], 79, 80, 2002, 25, t(8, 5, 7, 9, 4, 7)),
  q('barcelona', 'reiziger', 'Michael Reiziger', 1973, 'Netherlands', ['RB'], 79, 80, 2004, 25, t(8, 4, 7, 6, 4, 7)),
  q('barcelona', 'cocu', 'Phillip Cocu', 1970, 'Netherlands', ['CM', 'DM'], 82, 83, 2003, 20, t(8, 4, 7, 7, 3, 8)),
  q('barcelona', 'xavi', 'Xavi', 1980, 'Spain', ['CM', 'DM'], 74, 90, 2005, 15, t(9, 5, 9, 10, 2, 8)),
  q('barcelona', 'guardiola2', 'Pep Guardiola', 1971, 'Spain', ['DM', 'CM'], 81, 82, 2001, 25, t(9, 6, 8, 9, 3, 7)),
  q('barcelona', 'gerard_lopez', 'Gerard López', 1979, 'Spain', ['AM', 'CM'], 76, 80, 2004, 30, t(7, 5, 7, 7, 5, 7)),
  q('barcelona', 'rivaldo', 'Rivaldo', 1972, 'Brazil', ['AM', 'LW'], 89, 89, 2003, 30, t(7, 7, 8, 5, 5, 6)),
  q('barcelona', 'luis_enrique', 'Luís Enrique', 1970, 'Spain', ['CM', 'RW', 'ST'], 82, 83, 2004, 35, t(9, 6, 9, 9, 4, 7)),
  q('barcelona', 'kluivert', 'Patrick Kluivert', 1976, 'Netherlands', ['ST'], 85, 87, 2004, 30, t(6, 7, 7, 6, 6, 7)),
  q('barcelona', 'overmars', 'Marc Overmars', 1973, 'Netherlands', ['LW'], 84, 85, 2004, 45, t(8, 6, 8, 6, 4, 7)),
  q('barcelona', 'petit', 'Emmanuel Petit', 1970, 'France', ['DM', 'CM'], 80, 82, 2004, 30, t(7, 5, 7, 6, 5, 6)),
];

// ── Valencia, 2000–01 (back-to-back CL finalists) ─────────────────────────────
export const VALENCIA_2000: CuratedSeed[] = [
  q('valencia', 'canizares', 'Santiago Cañizares', 1969, 'Spain', ['GK'], 84, 84, 2004, 20, t(8, 6, 8, 8, 5, 6)),
  q('valencia', 'ayala', 'Roberto Ayala', 1973, 'Argentina', ['CB'], 85, 86, 2005, 25, t(9, 5, 8, 8, 4, 7)),
  q('valencia', 'pellegrino', 'Mauricio Pellegrino', 1971, 'Argentina', ['CB'], 79, 80, 2003, 25, t(8, 4, 7, 7, 4, 7)),
  q('valencia', 'carboni', 'Amedeo Carboni', 1965, 'Italy', ['LB', 'CB'], 78, 78, 2003, 25, t(8, 5, 7, 8, 5, 7)),
  q('valencia', 'angloma', 'Jocelyn Angloma', 1965, 'France', ['RB'], 77, 77, 2002, 30, t(8, 5, 7, 7, 4, 7)),
  q('valencia', 'mendieta', 'Gaizka Mendieta', 1974, 'Spain', ['CM', 'AM', 'RW'], 85, 86, 2001, 25, t(8, 6, 8, 7, 4, 7)),
  q('valencia', 'baraja', 'Rubén Baraja', 1975, 'Spain', ['CM', 'DM'], 82, 84, 2005, 30, t(8, 5, 8, 8, 4, 7)),
  q('valencia', 'albelda', 'David Albelda', 1977, 'Spain', ['DM'], 79, 83, 2005, 25, t(8, 5, 8, 8, 4, 7)),
  q('valencia', 'kily_gonzalez', 'Kily González', 1974, 'Argentina', ['LW', 'CM'], 80, 82, 2003, 30, t(7, 6, 8, 6, 6, 7)),
  q('valencia', 'aimar', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 82, 86, 2005, 40, t(7, 6, 7, 6, 5, 7)),
  q('valencia', 'vicente', 'Vicente Rodríguez', 1981, 'Spain', ['LW'], 74, 85, 2005, 40, t(7, 5, 7, 7, 5, 7)),
  q('valencia', 'angulo', 'Miguel Ángel Angulo', 1977, 'Spain', ['RW', 'ST'], 78, 80, 2004, 30, t(8, 5, 7, 8, 4, 7)),
  q('valencia', 'carew', 'John Carew', 1979, 'Norway', ['ST'], 79, 84, 2004, 35, t(6, 6, 7, 6, 6, 6)),
  q('valencia', 'zahovic', 'Zlatko Zahovič', 1971, 'Slovenia', ['AM'], 80, 81, 2003, 30, t(6, 8, 7, 5, 7, 6)),
];

// ── Deportivo La Coruña, 2000–01 (reigning champions) ─────────────────────────
export const DEPORTIVO_2000: CuratedSeed[] = [
  q('deportivo', 'molina', 'José Molina', 1970, 'Spain', ['GK'], 80, 80, 2003, 25, t(8, 5, 7, 8, 4, 6)),
  q('deportivo', 'naybet', 'Noureddine Naybet', 1970, 'Morocco', ['CB'], 82, 83, 2004, 25, t(8, 5, 8, 7, 4, 7)),
  q('deportivo', 'cesar_martin', 'César Martín', 1977, 'Spain', ['CB'], 78, 80, 2004, 30, t(8, 4, 7, 8, 4, 7)),
  q('deportivo', 'manuel_pablo', 'Manuel Pablo', 1976, 'Spain', ['RB'], 79, 81, 2004, 35, t(8, 4, 7, 9, 4, 7)),
  q('deportivo', 'capdevila', 'Joan Capdevila', 1978, 'Spain', ['LB'], 78, 83, 2004, 25, t(8, 5, 8, 7, 4, 7)),
  q('deportivo', 'mauro_silva', 'Mauro Silva', 1968, 'Brazil', ['DM'], 82, 82, 2003, 25, t(9, 4, 7, 9, 3, 7)),
  q('deportivo', 'sergio', 'Sergio González', 1976, 'Spain', ['CM'], 78, 80, 2004, 30, t(8, 4, 7, 8, 4, 7)),
  q('deportivo', 'valeron', 'Juan Carlos Valerón', 1975, 'Spain', ['AM'], 84, 86, 2005, 40, t(8, 5, 7, 8, 4, 7)),
  q('deportivo', 'djalminha', 'Djalminha', 1970, 'Brazil', ['AM'], 82, 83, 2003, 30, t(5, 8, 6, 6, 8, 6)),
  q('deportivo', 'fran', 'Fran', 1969, 'Spain', ['LW', 'AM'], 80, 80, 2003, 30, t(8, 5, 7, 10, 4, 6), { loyalty: 92 }),
  q('deportivo', 'victor', 'Víctor Sánchez', 1976, 'Spain', ['RW', 'CM'], 77, 79, 2004, 30, t(8, 4, 7, 7, 4, 7)),
  q('deportivo', 'makaay', 'Roy Makaay', 1975, 'Netherlands', ['ST'], 84, 87, 2005, 25, t(8, 6, 8, 6, 4, 7)),
  q('deportivo', 'tristan', 'Diego Tristán', 1976, 'Spain', ['ST'], 83, 86, 2005, 40, t(6, 7, 7, 6, 6, 6)),
  q('deportivo', 'pauleta', 'Pauleta', 1973, 'Portugal', ['ST'], 82, 84, 2002, 25, t(8, 6, 8, 6, 4, 7)),
];

// ── La Liga mid-table (2000–01): lighter, still real recognisable spines ──────
export const ATHLETIC_2000: CuratedSeed[] = [
  q('athletic', 'lafuente_a', 'Aitor Lafuente', 1978, 'Spain', ['GK'], 74, 76, 2004, 25, t(7, 4, 6, 8, 4, 6)),
  q('athletic', 'guerrero_j', 'Julen Guerrero', 1974, 'Spain', ['AM'], 80, 82, 2004, 30, t(8, 6, 7, 10, 5, 6), { loyalty: 92 }),
  q('athletic', 'urzaiz', 'Ismael Urzaiz', 1971, 'Spain', ['ST'], 81, 82, 2004, 30, t(8, 5, 7, 8, 4, 7)),
  q('athletic', 'etxeberria', 'Joseba Etxeberria', 1977, 'Spain', ['RW', 'ST'], 80, 82, 2005, 35, t(8, 5, 7, 9, 4, 7)),
  q('athletic', 'larrainzar', 'Aitor Larrazábal', 1971, 'Spain', ['LB'], 76, 77, 2003, 25, t(8, 4, 6, 9, 4, 6)),
  q('athletic', 'alkiza', 'Bittor Alkiza', 1971, 'Spain', ['CM'], 76, 77, 2003, 30, t(8, 4, 6, 8, 4, 7)),
];
export const SOCIEDAD_2000: CuratedSeed[] = [  q('real_sociedad', 'kovacevic', 'Darko Kovačević', 1973, 'Serbia', ['ST'], 82, 84, 2004, 30, t(8, 6, 8, 6, 5, 7)),
  q('real_sociedad', 'nihat', 'Nihat Kahveci', 1979, 'Turkey', ['ST', 'RW'], 78, 84, 2005, 30, t(7, 6, 7, 6, 6, 7)),
  q('real_sociedad', 'de_pedro', 'Javier de Pedro', 1973, 'Spain', ['LW', 'AM'], 79, 81, 2003, 30, t(7, 5, 7, 7, 5, 7)),
  q('real_sociedad', 'xabi_alonso', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 74, 88, 2005, 20, t(9, 5, 9, 8, 3, 8)),
  q('real_sociedad', 'aranzabal', 'Agustín Aranzábal', 1973, 'Spain', ['LB'], 78, 79, 2003, 25, t(8, 4, 7, 9, 4, 7)),
];
export const CELTA_2000: CuratedSeed[] = [
  q('celta', 'mostovoi', 'Aleksandr Mostovoi', 1968, 'Russia', ['AM'], 82, 82, 2003, 30, t(6, 7, 7, 7, 6, 6)),
  q('celta', 'karpin', 'Valeri Karpin', 1969, 'Russia', ['RW', 'CM'], 80, 81, 2003, 25, t(8, 5, 8, 7, 5, 7)),
  q('celta', 'gustavo_lopez', 'Gustavo López', 1973, 'Argentina', ['AM', 'CM'], 79, 80, 2004, 30, t(7, 5, 7, 7, 5, 7)),
  q('celta', 'catanha', 'Catanha', 1971, 'Brazil', ['ST'], 78, 79, 2003, 30, t(7, 5, 6, 6, 6, 7)),
  q('celta', 'juanfran', 'Juanfran', 1976, 'Spain', ['RW', 'LW'], 76, 78, 2004, 30, t(8, 4, 7, 7, 4, 7)),
  q('celta', 'doriva', 'Doriva', 1972, 'Brazil', ['DM', 'CM'], 76, 77, 2003, 30, t(8, 4, 6, 6, 5, 7)),
  q('celta', 'mazinho', 'Mazinho', 1966, 'Brazil', ['DM'], 75, 75, 2002, 30, t(8, 4, 6, 7, 5, 6)),
];
export const ESPANYOL_2000: CuratedSeed[] = [
  q('espanyol', 'tamudo', 'Raúl Tamudo', 1977, 'Spain', ['ST'], 80, 83, 2005, 30, t(8, 6, 8, 9, 5, 7)),
  q('espanyol', 'de_la_pena', 'Iván de la Peña', 1976, 'Spain', ['AM'], 79, 82, 2004, 40, t(6, 7, 7, 7, 6, 6)),
  q('espanyol', 'tomas', 'Toni Velamazán', 1974, 'Spain', ['DM', 'CM'], 74, 75, 2003, 30, t(8, 4, 6, 7, 4, 7)),
  q('espanyol', 'lopo', 'Jordi Lopo', 1981, 'Spain', ['CB'], 71, 78, 2005, 25, t(8, 4, 7, 7, 4, 7)),
];
export const BETIS_2000: CuratedSeed[] = [
  q('betis', 'joaquin', 'Joaquín', 1981, 'Spain', ['RW'], 74, 85, 2005, 30, t(7, 6, 7, 8, 5, 7)),
  q('betis', 'denilson', 'Denílson', 1977, 'Brazil', ['LW'], 79, 82, 2004, 35, t(6, 7, 7, 6, 6, 7)),
  q('betis', 'alfonso', 'Alfonso Pérez', 1972, 'Spain', ['ST'], 81, 82, 2003, 40, t(7, 6, 7, 7, 5, 6)),
  q('betis', 'assuncao', 'Marcos Assunção', 1976, 'Brazil', ['CM', 'DM'], 79, 81, 2004, 30, t(7, 5, 7, 6, 5, 7)),
  q('betis', 'capi', 'Capi', 1980, 'Spain', ['LB', 'LW'], 73, 78, 2005, 30, t(8, 4, 7, 8, 4, 7)),
];
export const ZARAGOZA_2000: CuratedSeed[] = [
  q('zaragoza', 'milosevic', 'Savo Milošević', 1973, 'Serbia', ['ST'], 82, 83, 2004, 30, t(7, 6, 8, 6, 6, 7)),
  q('zaragoza', 'villa', 'David Villa', 1981, 'Spain', ['ST'], 73, 88, 2005, 30, t(9, 6, 9, 7, 4, 7)),
  q('zaragoza', 'yordi', 'Yordi', 1974, 'Spain', ['ST'], 76, 77, 2003, 30, t(7, 5, 6, 7, 5, 7)),
  q('zaragoza', 'cani', 'Cani', 1981, 'Spain', ['AM', 'RW'], 72, 82, 2005, 30, t(7, 5, 7, 7, 5, 7)),
];
export const MALLORCA_2000: CuratedSeed[] = [
  q('mallorca', 'etoo', 'Samuel Eto’o', 1981, 'Cameroon', ['ST'], 80, 88, 2005, 30, t(7, 8, 9, 5, 6, 7)),
  q('mallorca', 'engonga', 'Vicente Engonga', 1965, 'Spain', ['DM', 'CM'], 76, 76, 2002, 30, t(8, 4, 6, 7, 4, 7)),
  q('mallorca', 'novo', 'Ariel Ibagaza', 1976, 'Argentina', ['AM', 'CM'], 77, 80, 2004, 30, t(7, 5, 7, 7, 5, 7)),
  q('mallorca', 'nadal_m', 'Miguel Ángel Nadal', 1966, 'Spain', ['CB', 'DM'], 78, 78, 2002, 30, t(8, 5, 7, 9, 5, 6)),
];
export const MALAGA_2000: CuratedSeed[] = [
  q('malaga', 'dely_valdes', 'Julio Dely Valdés', 1967, 'Panama', ['ST'], 78, 79, 2002, 30, t(7, 5, 7, 6, 5, 7)),
  q('malaga', 'rufete', 'Rufete', 1976, 'Spain', ['RW', 'LW'], 78, 80, 2003, 30, t(8, 5, 7, 7, 5, 7)),
  q('malaga', 'musampa', 'Kiki Musampa', 1977, 'Netherlands', ['LW', 'AM'], 77, 79, 2004, 30, t(7, 5, 7, 6, 5, 7)),
  q('malaga', 'sandro_m', 'Sandro', 1965, 'Spain', ['GK'], 76, 76, 2002, 25, t(8, 4, 6, 8, 4, 6)),
];
export const VILLARREAL_2000: CuratedSeed[] = [
  q('villarreal', 'palermo', 'Martín Palermo', 1973, 'Argentina', ['ST'], 79, 81, 2003, 40, t(6, 7, 8, 6, 7, 6)),
  q('villarreal', 'victor_villa', 'Víctor', 1976, 'Spain', ['RW', 'CM'], 75, 78, 2004, 30, t(8, 4, 7, 7, 4, 7)),
  q('villarreal', 'craioveanu', 'Gheorghe Craioveanu', 1968, 'Romania', ['ST', 'AM'], 75, 76, 2002, 30, t(7, 5, 6, 6, 5, 7)),
];
export const ALAVES_2000: CuratedSeed[] = [
  q('alaves', 'javi_moreno', 'Javi Moreno', 1974, 'Spain', ['ST'], 79, 81, 2002, 30, t(7, 6, 7, 6, 6, 7)),
  q('alaves', 'contra', 'Cosmin Contra', 1975, 'Romania', ['RB'], 78, 80, 2003, 25, t(8, 5, 7, 6, 5, 7)),
  q('alaves', 'astudillo', 'Iván Alonso Astudillo', 1971, 'Spain', ['CM'], 74, 75, 2003, 30, t(8, 4, 6, 7, 4, 7)),
  q('alaves', 'tomic', 'Ivica Kralj Tomić', 1976, 'Croatia', ['CM'], 73, 75, 2003, 30, t(7, 4, 6, 6, 5, 7)),
];

export const LA_LIGA_2000_SQUADS: Record<string, CuratedSeed[]> = {
  real_madrid: REAL_MADRID_2000,
  barcelona: BARCELONA_2000,
  valencia: VALENCIA_2000,
  deportivo: DEPORTIVO_2000,
  athletic: ATHLETIC_2000,
  real_sociedad: SOCIEDAD_2000,
  celta: CELTA_2000,
  espanyol: ESPANYOL_2000,
  betis: BETIS_2000,
  zaragoza: ZARAGOZA_2000,
  mallorca: MALLORCA_2000,
  malaga: MALAGA_2000,
  villarreal: VILLARREAL_2000,
  alaves: ALAVES_2000,
};

// ── European context clubs: the sellers of Real's galácticos and the clubs the
//    La Liga rivals really recruited from (so every real move has a real source).
export const JUVENTUS_2000: CuratedSeed[] = [
  q('juventus', 'buffon', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 86, 90, 2006, 20, t(9, 6, 9, 8, 4, 7)),
  q('juventus', 'zidane', 'Zinedine Zidane', 1972, 'France', ['AM', 'CM'], 92, 93, 2004, 25, t(9, 6, 8, 6, 4, 7)),
  q('juventus', 'delpiero', 'Alessandro Del Piero', 1974, 'Italy', ['ST', 'AM'], 87, 88, 2005, 35, t(8, 7, 8, 9, 4, 7), { loyalty: 90 }),
  q('juventus', 'trezeguet', 'David Trezeguet', 1977, 'France', ['ST'], 85, 88, 2005, 30, t(7, 6, 8, 7, 5, 7)),
  q('juventus', 'davids', 'Edgar Davids', 1973, 'Netherlands', ['CM', 'DM'], 85, 86, 2004, 35, t(7, 6, 8, 6, 6, 7)),
  q('juventus', 'thuram', 'Lilian Thuram', 1972, 'France', ['CB', 'RB'], 86, 87, 2005, 25, t(9, 5, 8, 7, 3, 7)),
  q('juventus', 'montero', 'Paolo Montero', 1971, 'Uruguay', ['CB'], 82, 83, 2004, 35, t(7, 6, 7, 7, 7, 6)),
];
// Parma — Cannavaro's real 2000 club, before Parmalat's collapse forced the
// fire-sale that broke the side up (the Italy pack will model that distress).
export const PARMA_2000: CuratedSeed[] = [
  q('parma', 'cannavaro', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 85, 87, 2002, 20, t(9, 6, 9, 6, 4, 8)),
  q('parma', 'di_vaio', 'Marco Di Vaio', 1976, 'Italy', ['ST'], 81, 84, 2002, 30, t(7, 6, 8, 6, 5, 7)),
  q('parma', 'lamouchi', 'Sabri Lamouchi', 1971, 'France', ['CM', 'DM'], 78, 79, 2002, 30, t(8, 5, 7, 6, 5, 7)),
  q('parma', 'sensini', 'Néstor Sensini', 1966, 'Argentina', ['CB', 'DM'], 79, 79, 2002, 30, t(8, 5, 7, 7, 4, 7)),
  q('parma', 'junior_p', 'Júnior', 1973, 'Brazil', ['LB', 'LW'], 78, 80, 2003, 30, t(7, 5, 7, 6, 5, 7)),
];
// Roma — Emerson's real 2000 club, the Totti/Batistuta side that won 2001.
export const ROMA_2000: CuratedSeed[] = [
  q('roma', 'emerson', 'Emerson', 1976, 'Brazil', ['DM', 'CM'], 83, 85, 2004, 25, t(8, 5, 8, 6, 4, 7)),
  q('roma', 'totti', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 87, 90, 2006, 30, t(8, 7, 8, 10, 5, 6), { loyalty: 96 }),
  q('roma', 'batistuta', 'Gabriel Batistuta', 1969, 'Argentina', ['ST'], 86, 86, 2003, 35, t(8, 7, 9, 7, 5, 6)),
  q('roma', 'cafu', 'Cafu', 1970, 'Brazil', ['RB'], 84, 85, 2003, 25, t(9, 5, 8, 7, 4, 7)),
  q('roma', 'montella', 'Vincenzo Montella', 1974, 'Italy', ['ST'], 82, 83, 2004, 35, t(7, 7, 8, 7, 6, 6)),
  q('roma', 'samuel', 'Walter Samuel', 1978, 'Argentina', ['CB'], 83, 85, 2004, 25, t(8, 5, 8, 6, 5, 7)),
  q('roma', 'candela', 'Vincent Candela', 1973, 'France', ['LB'], 80, 81, 2004, 25, t(8, 5, 7, 7, 4, 7)),
];
export const INTER_2000: CuratedSeed[] = [
  q('inter', 'ronaldo_r9', 'Ronaldo', 1976, 'Brazil', ['ST'], 90, 93, 2005, 75, t(6, 8, 8, 5, 6, 7)),
  q('inter', 'vieri', 'Christian Vieri', 1973, 'Italy', ['ST'], 87, 88, 2004, 45, t(6, 8, 8, 5, 7, 6)),
  q('inter', 'zanetti', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 85, 86, 2005, 15, t(10, 5, 9, 10, 2, 8)),
  q('inter', 'recoba', 'Álvaro Recoba', 1976, 'Uruguay', ['AM', 'LW'], 82, 84, 2005, 30, t(5, 8, 6, 6, 7, 6)),
  q('inter', 'seedorf', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 84, 87, 2004, 25, t(7, 7, 8, 5, 5, 7)),
  q('inter', 'cordoba', 'Iván Córdoba', 1976, 'Colombia', ['CB'], 81, 83, 2005, 25, t(8, 5, 7, 7, 4, 7)),
];
export const MILAN_2000: CuratedSeed[] = [
  q('milan', 'maldini', 'Paolo Maldini', 1968, 'Italy', ['CB', 'LB'], 88, 88, 2005, 20, t(10, 6, 9, 10, 3, 7), { loyalty: 99, hardBlocks: [{ reason: 'Paolo Maldini is Milan for life.', untilYear: 2099 }] }),
  q('milan', 'shevchenko', 'Andriy Shevchenko', 1976, 'Ukraine', ['ST'], 88, 91, 2004, 30, t(8, 6, 9, 7, 4, 7)),
  q('milan', 'redondo', 'Fernando Redondo', 1969, 'Argentina', ['DM', 'CM'], 84, 85, 2004, 55, t(8, 5, 7, 6, 3, 7)),
  q('milan', 'inzaghi_f', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 84, 85, 2004, 30, t(7, 6, 8, 7, 5, 6)),
  q('milan', 'rui_costa', 'Manuel Rui Costa', 1972, 'Portugal', ['AM'], 85, 86, 2005, 25, t(8, 6, 8, 7, 4, 7)),
  q('milan', 'gattuso', 'Gennaro Gattuso', 1978, 'Italy', ['DM'], 79, 85, 2005, 30, t(8, 5, 9, 8, 6, 7)),
];
export const MANUTD_2000: CuratedSeed[] = [
  q('man_utd', 'beckham', 'David Beckham', 1975, 'England', ['RW', 'CM'], 87, 88, 2004, 20, t(9, 7, 8, 7, 4, 7)),
  q('man_utd', 'keane_r', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 87, 88, 2004, 35, t(9, 8, 10, 8, 8, 6)),
  q('man_utd', 'giggs', 'Ryan Giggs', 1973, 'Wales', ['LW'], 85, 86, 2005, 30, t(9, 5, 8, 10, 3, 7), { loyalty: 96 }),
  q('man_utd', 'scholes', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 86, 87, 2005, 25, t(9, 4, 8, 10, 3, 7), { loyalty: 95 }),
];
export const LIVERPOOL_2000: CuratedSeed[] = [
  q('liverpool', 'owen', 'Michael Owen', 1979, 'England', ['ST'], 85, 89, 2004, 45, t(8, 7, 8, 6, 4, 7)),
  q('liverpool', 'gerrard', 'Steven Gerrard', 1980, 'England', ['CM'], 79, 91, 2005, 40, t(9, 6, 10, 10, 5, 7)),
  q('liverpool', 'hamann', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 81, 82, 2004, 30, t(8, 4, 7, 6, 3, 7)),
  q('liverpool', 'hyypia', 'Sami Hyypiä', 1973, 'Finland', ['CB'], 82, 84, 2005, 20, t(9, 4, 7, 8, 3, 7)),
];
export const BAYERN_2000: CuratedSeed[] = [
  q('bayern', 'kahn', 'Oliver Kahn', 1969, 'Germany', ['GK'], 88, 88, 2005, 20, t(9, 7, 9, 9, 5, 6)),
  q('bayern', 'effenberg', 'Stefan Effenberg', 1968, 'Germany', ['CM'], 83, 84, 2002, 30, t(6, 8, 8, 6, 7, 6)),
  q('bayern', 'elber', 'Giovane Élber', 1972, 'Brazil', ['ST'], 82, 83, 2003, 30, t(7, 6, 7, 6, 5, 7)),
  q('bayern', 'scholl', 'Mehmet Scholl', 1970, 'Germany', ['AM'], 81, 82, 2004, 35, t(7, 6, 7, 8, 5, 7)),
];
export const NEWCASTLE_2000: CuratedSeed[] = [
  q('newcastle', 'woodgate', 'Jonathan Woodgate', 1980, 'England', ['CB'], 80, 85, 2005, 45, t(7, 5, 7, 6, 5, 6)),
  q('newcastle', 'shearer_a', 'Alan Shearer', 1970, 'England', ['ST'], 84, 85, 2004, 30, t(9, 7, 9, 10, 4, 6), { loyalty: 95 }),
  q('newcastle', 'bellamy', 'Craig Bellamy', 1979, 'Wales', ['ST', 'LW'], 79, 83, 2005, 40, t(5, 7, 8, 5, 8, 6)),
];
export const EVERTON_2000: CuratedSeed[] = [
  q('everton', 'gravesen', 'Thomas Gravesen', 1976, 'Denmark', ['DM', 'CM'], 79, 81, 2005, 30, t(6, 6, 7, 6, 7, 7)),
  q('everton', 'ferguson_d', 'Duncan Ferguson', 1971, 'Scotland', ['ST'], 78, 79, 2004, 45, t(6, 7, 6, 8, 8, 6)),
];
export const MONACO_2000: CuratedSeed[] = [
  q('monaco', 'giuly', 'Ludovic Giuly', 1976, 'France', ['RW', 'AM'], 81, 83, 2004, 35, t(8, 6, 8, 6, 5, 7)),
  q('monaco', 'rothen', 'Jérôme Rothen', 1978, 'France', ['LW'], 79, 81, 2005, 30, t(6, 6, 7, 6, 6, 7)),
  q('monaco', 'simone_m', 'Marco Simone', 1969, 'Italy', ['ST'], 78, 78, 2002, 30, t(7, 6, 7, 6, 5, 7)),
];
export const PORTO_2000: CuratedSeed[] = [
  q('porto', 'deco', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 84, 86, 2006, 25, t(8, 6, 8, 6, 5, 7)),
  q('porto', 'carvalho_r', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 83, 86, 2006, 25, t(8, 5, 8, 6, 5, 7)),
  q('porto', 'costinha', 'Costinha', 1974, 'Portugal', ['DM'], 80, 82, 2005, 30, t(8, 5, 7, 6, 5, 7)),
  q('porto', 'maniche', 'Maniche', 1977, 'Portugal', ['CM', 'DM'], 80, 82, 2006, 30, t(7, 6, 8, 6, 6, 7)),
];
export const PSG_2000: CuratedSeed[] = [
  q('psg', 'ronaldinho', 'Ronaldinho', 1980, 'Brazil', ['AM', 'LW'], 84, 92, 2006, 30, t(6, 7, 8, 6, 6, 8)),
  q('psg', 'anelka', 'Nicolas Anelka', 1979, 'France', ['ST'], 82, 86, 2004, 30, t(5, 8, 8, 4, 7, 6)),
  q('psg', 'pochettino', 'Mauricio Pochettino', 1972, 'Argentina', ['CB'], 79, 80, 2003, 25, t(8, 5, 7, 7, 5, 7)),
];
export const SANTOS_2000: CuratedSeed[] = [
  q('santos', 'robinho', 'Robinho', 1984, 'Brazil', ['LW', 'ST'], 76, 87, 2006, 30, t(6, 7, 8, 6, 6, 7)),
  q('santos', 'diego_r', 'Diego', 1985, 'Brazil', ['AM'], 74, 87, 2005, 25, t(8, 6, 8, 6, 4, 7)),
];
export const SEVILLA_2000: CuratedSeed[] = [
  // Sevilla's real academy spine of 2000 (Reyes/Ramos/Puerta came through here).
  // Baptista and Dani Alves are NOT here yet — both were still in South America in
  // 2000 and only arrived in 2003/2002 (seeded at their real clubs below, with a
  // reality ledger move at the right window).
  q('sevilla', 'ramos_s', 'Sergio Ramos', 1986, 'Spain', ['RB', 'CB'], 68, 90, 2006, 25, t(8, 7, 9, 7, 6, 7)),
  q('sevilla', 'reyes', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'ST'], 78, 86, 2005, 35, t(6, 7, 7, 6, 7, 6)),
  q('sevilla', 'puerta', 'Antonio Puerta', 1984, 'Spain', ['LB', 'LW'], 70, 82, 2006, 25, t(8, 5, 8, 9, 5, 7)),
];

// ── South American source clubs: the real 2000 homes of players who only crossed
//    to Europe later. Seeding them here (not at their eventual European club) keeps
//    the reality-default honest — a 17-year-old Dani Alves is at Bahia in 2000, not
//    already at Sevilla — and the era ledger moves each to Europe at his real window.
export const BAHIA_2000: CuratedSeed[] = [
  q('bahia', 'dani_alves', 'Dani Alves', 1983, 'Brazil', ['RB'], 66, 88, 2004, 5, t(8, 6, 9, 7, 5, 8)),
];
export const SAO_PAULO_2000: CuratedSeed[] = [
  q('sao_paulo', 'baptista', 'Julio Baptista', 1981, 'Brazil', ['CM', 'ST'], 76, 85, 2004, 10, t(7, 6, 8, 6, 5, 7)),
];
export const INDEPENDIENTE_2000: CuratedSeed[] = [
  q('independiente', 'forlan', 'Diego Forlán', 1979, 'Uruguay', ['ST'], 70, 84, 2003, 8, t(9, 5, 8, 6, 4, 7)),
];
// van Nistelrooy is still at PSV in 2000 — his Manchester United move collapsed on a
// cruciate injury that summer and only completed in 2001, so he starts here and
// crosses at his real window via the ledger, not seeded at United a year early.
export const PSV_2000: CuratedSeed[] = [
  q('psv', 'vannistelrooy', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 85, 89, 2003, 20, t(8, 6, 9, 6, 4, 7)),
];
export const LAZIO_2000: CuratedSeed[] = [
  q('lazio', 'crespo', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 86, 87, 2004, 35, t(7, 7, 8, 6, 5, 7)),
  q('lazio', 'nesta', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 87, 90, 2005, 30, t(9, 5, 8, 8, 3, 7)),
  q('lazio', 'veron', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM'], 85, 86, 2004, 30, t(7, 6, 8, 6, 5, 7)),
  q('lazio', 'simeone', 'Diego Simeone', 1970, 'Argentina', ['CM', 'DM'], 81, 82, 2003, 30, t(7, 7, 9, 6, 8, 6)),
];
export const ARSENAL_2000: CuratedSeed[] = [
  q('arsenal', 'henry_a', 'Thierry Henry', 1977, 'France', ['ST', 'LW'], 88, 92, 2004, 25, t(9, 7, 9, 8, 4, 8)),
  q('arsenal', 'vieira_a', 'Patrick Vieira', 1976, 'France', ['DM', 'CM'], 87, 89, 2004, 25, t(8, 7, 9, 6, 6, 7)),
  q('arsenal', 'bergkamp_a', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 86, 87, 2003, 20, t(9, 6, 8, 8, 3, 6)),
];
export const CHELSEA_2000: CuratedSeed[] = [
  q('chelsea', 'zola', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 84, 85, 2003, 25, t(9, 5, 8, 9, 3, 7)),
  q('chelsea', 'terry_c', 'John Terry', 1980, 'England', ['CB'], 76, 88, 2005, 30, t(8, 7, 9, 9, 5, 6)),
  q('chelsea', 'lampard_c', 'Frank Lampard', 1978, 'England', ['CM'], 80, 88, 2005, 20, t(9, 6, 9, 8, 3, 7)),
];
export const RIVER_2000: CuratedSeed[] = [
  q('river_plate', 'saviola', 'Javier Saviola', 1981, 'Argentina', ['ST'], 78, 86, 2004, 30, t(7, 6, 8, 6, 5, 7)),
  q('river_plate', 'dalessandro', 'Andrés D’Alessandro', 1981, 'Argentina', ['AM', 'LW'], 75, 84, 2005, 30, t(6, 7, 7, 6, 6, 7)),
];

export const CONTEXT_2000_SQUADS: Record<string, CuratedSeed[]> = {
  juventus: JUVENTUS_2000,
  parma: PARMA_2000,
  roma: ROMA_2000,
  inter: INTER_2000,
  milan: MILAN_2000,
  man_utd: MANUTD_2000,
  liverpool: LIVERPOOL_2000,
  bayern: BAYERN_2000,
  newcastle: NEWCASTLE_2000,
  everton: EVERTON_2000,
  monaco: MONACO_2000,
  porto: PORTO_2000,
  psg: PSG_2000,
  santos: SANTOS_2000,
  sevilla: SEVILLA_2000,
  lazio: LAZIO_2000,
  arsenal: ARSENAL_2000,
  chelsea: CHELSEA_2000,
  river_plate: RIVER_2000,
  bahia: BAHIA_2000,
  sao_paulo: SAO_PAULO_2000,
  independiente: INDEPENDIENTE_2000,
  psv: PSV_2000,
};

/**
 * Further real depth across the era, so the market offers recognisable options
 * for any position at any playable Spanish club (user directive: any realistic
 * signing should exist in the database). Spread as [club, seed] pairs, merged in.
 */
export const DEPTH_2000: Array<[ClubId, CuratedSeed]> = [
  // La Liga depth
  ['real_madrid', q('real_madrid', 'pavon', 'Francisco Pavón', 1980, 'Spain', ['CB'], 74, 78, 2005, 25, t(8, 4, 7, 9, 4, 7))],
  ['real_madrid', q('real_madrid', 'portillo', 'Javier Portillo', 1982, 'Spain', ['ST'], 70, 80, 2005, 30, t(7, 6, 7, 8, 5, 7))],
  ['barcelona', q('barcelona', 'simao', 'Simão Sabrosa', 1979, 'Portugal', ['LW', 'RW'], 79, 84, 2004, 30, t(7, 6, 8, 6, 5, 7))],
  ['barcelona', q('barcelona', 'gabri', 'Gabri', 1979, 'Spain', ['CM'], 75, 79, 2004, 25, t(8, 4, 7, 8, 4, 7))],
  ['barcelona', q('barcelona', 'motta_t', 'Thiago Motta', 1982, 'Brazil', ['DM', 'CM'], 71, 84, 2005, 35, t(7, 5, 8, 6, 5, 7))],
  ['barcelona', q('barcelona', 'christanval', 'Philippe Christanval', 1978, 'France', ['CB', 'DM'], 77, 82, 2004, 40, t(6, 5, 7, 6, 6, 6))],
  ['valencia', q('valencia', 'fabio_aurelio', 'Fábio Aurélio', 1979, 'Brazil', ['LB'], 78, 82, 2005, 45, t(8, 5, 7, 6, 4, 7))],
  ['valencia', q('valencia', 'curro_torres', 'Curro Torres', 1976, 'Spain', ['RB', 'CB'], 76, 78, 2004, 30, t(8, 4, 7, 8, 4, 7))],
  ['deportivo', q('deportivo', 'scaloni', 'Lionel Scaloni', 1978, 'Argentina', ['RB'], 77, 79, 2004, 30, t(8, 5, 8, 6, 5, 7))],
  ['deportivo', q('deportivo', 'hector', 'Héctor', 1973, 'Spain', ['CB'], 76, 77, 2003, 30, t(8, 4, 6, 8, 4, 7))],
  ['real_sociedad', q('real_sociedad', 'idiakez', 'Iñigo Idiakez', 1973, 'Spain', ['AM', 'CM'], 78, 80, 2004, 25, t(8, 5, 7, 7, 4, 7))],
  ['real_sociedad', q('real_sociedad', 'boris', 'Boris', 1979, 'Spain', ['ST'], 73, 78, 2004, 30, t(7, 5, 7, 6, 5, 7))],
  ['celta', q('celta', 'revivo', 'Haim Revivo', 1972, 'Israel', ['AM', 'RW'], 78, 79, 2003, 30, t(6, 7, 7, 6, 6, 7))],
  ['celta', q('celta', 'vagner', 'Vágner', 1974, 'Brazil', ['ST'], 76, 78, 2003, 30, t(7, 5, 6, 6, 5, 7))],
  ['athletic', q('athletic', 'ezquerro', 'Santi Ezquerro', 1976, 'Spain', ['RW', 'ST'], 77, 79, 2004, 30, t(8, 5, 7, 8, 4, 7))],
  ['betis', q('betis', 'juanito_b', 'Juanito', 1976, 'Spain', ['CB'], 77, 80, 2005, 25, t(8, 4, 7, 8, 4, 7))],
  ['sevilla', q('sevilla', 'casquero', 'Fernando Sales', 1977, 'Spain', ['CM'], 74, 77, 2004, 30, t(8, 4, 7, 7, 4, 7))],
  // European depth — realistic galáctico-era targets for a big Spanish club
  ['juventus', q('juventus', 'zambrotta', 'Gianluca Zambrotta', 1977, 'Italy', ['RB', 'LB'], 83, 85, 2006, 25, t(8, 5, 8, 7, 5, 7))],
  ['juventus', q('juventus', 'tudor', 'Igor Tudor', 1978, 'Croatia', ['CB'], 79, 81, 2005, 30, t(7, 5, 7, 7, 6, 6))],
  ['juventus', q('juventus', 'tacchinardi', 'Alessio Tacchinardi', 1975, 'Italy', ['DM', 'CM'], 79, 81, 2004, 30, t(7, 4, 6, 7, 4, 6))],
  ['inter', q('inter', 'kallon', 'Mohamed Kallon', 1979, 'Sierra Leone', ['ST'], 78, 82, 2004, 30, t(6, 6, 7, 5, 6, 7))],
  ['milan', q('milan', 'pirlo', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'AM'], 80, 89, 2006, 25, t(9, 5, 8, 7, 3, 7))],
  ['milan', q('milan', 'ambrosini', 'Massimo Ambrosini', 1977, 'Italy', ['CM', 'DM'], 79, 82, 2005, 30, t(8, 5, 8, 8, 5, 7))],
  ['bayern', q('bayern', 'sagnol', 'Willy Sagnol', 1977, 'France', ['RB'], 80, 82, 2005, 25, t(8, 5, 7, 7, 4, 7))],
  ['bayern', q('bayern', 'salihamidzic', 'Hasan Salihamidžić', 1977, 'Bosnia', ['RW', 'CM'], 78, 80, 2005, 25, t(8, 5, 8, 7, 5, 7))],
  ['bayern', q('bayern', 'lizarazu', 'Bixente Lizarazu', 1969, 'France', ['LB'], 83, 83, 2004, 25, t(8, 5, 7, 7, 4, 7))],
  ['liverpool', q('liverpool', 'heskey', 'Emile Heskey', 1978, 'England', ['ST'], 79, 82, 2004, 35, t(7, 5, 7, 7, 5, 7))],
  ['liverpool', q('liverpool', 'murphy', 'Danny Murphy', 1977, 'England', ['CM'], 78, 80, 2004, 25, t(8, 5, 7, 8, 4, 7))],
  ['man_utd', q('man_utd', 'solskjaer', 'Ole Gunnar Solskjær', 1973, 'Norway', ['ST'], 82, 83, 2004, 30, t(9, 5, 8, 9, 3, 7))],
  ['man_utd', q('man_utd', 'g_neville', 'Gary Neville', 1975, 'England', ['RB'], 82, 83, 2005, 25, t(9, 5, 8, 10, 4, 6), { loyalty: 94 })],
  ['porto', q('porto', 'derlei', 'Derlei', 1975, 'Brazil', ['ST'], 78, 80, 2005, 30, t(7, 6, 8, 6, 5, 7))],
  ['monaco', q('monaco', 'squillaci', 'Sébastien Squillaci', 1980, 'France', ['CB'], 76, 81, 2005, 25, t(8, 4, 7, 7, 4, 7))],
  // ── Expansion pass: further real 2000-01 squad men at the thin European context
  //    clubs (the giants are already completed via the *_EXTRA arrays below), so the
  //    scoutable pool reads deep and true at every notable rival. Real names, real
  //    clubs, HIDDEN designer estimates. ──
  ['roma', q('roma', 'aldair_r00', 'Aldair', 1965, 'Brazil', ['CB'], 81, 81, 2003, 30, t(9, 5, 8, 9, 4, 6))],
  ['roma', q('roma', 'tommasi_r00', 'Damiano Tommasi', 1974, 'Italy', ['CM', 'DM'], 80, 81, 2005, 30, t(9, 4, 8, 9, 4, 7))],
  ['roma', q('roma', 'nakata_r00', 'Hidetoshi Nakata', 1977, 'Japan', ['AM', 'CM'], 82, 84, 2004, 30, t(8, 5, 8, 7, 5, 8))],
  ['roma', q('roma', 'zago_r00', 'Antônio Carlos Zago', 1969, 'Brazil', ['CB'], 79, 79, 2003, 30, t(8, 5, 7, 8, 5, 6))],
  ['lazio', q('lazio', 'nedved_z00', 'Pavel Nedvěd', 1972, 'Czech Republic', ['AM', 'CM', 'LW'], 86, 88, 2004, 20, t(9, 6, 9, 8, 5, 7))],
  ['lazio', q('lazio', 'mihajlovic_z00', 'Siniša Mihajlović', 1969, 'Serbia', ['CB', 'LB'], 82, 82, 2004, 30, t(7, 7, 8, 7, 7, 6))],
  ['lazio', q('lazio', 'salas_z00', 'Marcelo Salas', 1974, 'Chile', ['ST'], 82, 83, 2003, 35, t(7, 6, 8, 6, 6, 7))],
  ['lazio', q('lazio', 'stankovic_z00', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 80, 84, 2005, 25, t(8, 6, 8, 7, 5, 7))],
  ['lazio', q('lazio', 'favalli_z00', 'Giuseppe Favalli', 1972, 'Italy', ['LB', 'CB'], 79, 80, 2004, 30, t(8, 5, 7, 8, 4, 7))],
  ['porto', q('porto', 'vitor_baia_p00', 'Vítor Baía', 1969, 'Portugal', ['GK'], 82, 82, 2005, 25, t(8, 6, 8, 8, 5, 6))],
  ['porto', q('porto', 'jorge_costa_p00', 'Jorge Costa', 1971, 'Portugal', ['CB'], 80, 81, 2005, 30, t(8, 6, 8, 9, 5, 6))],
  ['psg', q('psg', 'okocha_p00', 'Jay-Jay Okocha', 1973, 'Nigeria', ['AM'], 83, 84, 2003, 30, t(6, 8, 8, 6, 6, 7))],
  ['psg', q('psg', 'robert_p00', 'Laurent Robert', 1975, 'France', ['LW'], 79, 81, 2004, 30, t(6, 6, 7, 6, 6, 7))],
  ['psg', q('psg', 'distin_p00', 'Sylvain Distin', 1977, 'France', ['CB'], 77, 82, 2004, 25, t(8, 5, 8, 7, 5, 7))],
  ['monaco', q('monaco', 'gallardo_m00', 'Marcelo Gallardo', 1976, 'Argentina', ['AM'], 82, 83, 2004, 30, t(7, 6, 8, 6, 5, 7))],
  ['monaco', q('monaco', 'nonda_m00', 'Shabani Nonda', 1977, 'DR Congo', ['ST'], 79, 82, 2005, 30, t(7, 6, 8, 6, 6, 7))],
  ['parma', q('parma', 'amoroso_pa00', 'Márcio Amoroso', 1974, 'Brazil', ['ST'], 83, 84, 2003, 40, t(6, 7, 8, 6, 6, 7))],
  ['parma', q('parma', 'fuser_pa00', 'Diego Fuser', 1968, 'Italy', ['RW', 'CM'], 79, 80, 2003, 30, t(8, 5, 7, 7, 5, 6))],
];

/**
 * Full-squad completion for the other playable giants (§4, §14): every playable
 * club that appears must field >=13 real players, not a thin spine plus filler.
 * All are foreign to La Liga (leagueId null) — zero kickoff calibration risk.
 */
export const MANUTD_2000_EXTRA: CuratedSeed[] = [
  q('man_utd', 'barthez_mu00', 'Fabien Barthez', 1971, 'France', ['GK'], 82, 83, 2004, 25, t(6, 7, 7, 6, 6, 6)),
  q('man_utd', 'stam_mu00', 'Jaap Stam', 1972, 'Netherlands', ['CB'], 88, 89, 2004, 35, t(8, 6, 8, 6, 5, 6)),
  q('man_utd', 'silvestre_mu00', 'Mikaël Silvestre', 1977, 'France', ['CB', 'LB'], 79, 85, 2005, 28, t(7, 5, 7, 6, 4, 8)),
  q('man_utd', 'irwin_mu00', 'Denis Irwin', 1965, 'Ireland', ['LB', 'RB'], 80, 80, 2002, 22, t(9, 3, 7, 9, 2, 8)),
  q('man_utd', 'butt_mu00', 'Nicky Butt', 1975, 'England', ['CM', 'DM'], 79, 82, 2004, 25, t(8, 4, 7, 9, 4, 7)),
  q('man_utd', 'sheringham_mu00', 'Teddy Sheringham', 1966, 'England', ['ST', 'AM'], 83, 84, 2003, 30, t(9, 6, 8, 7, 4, 7)),
  q('man_utd', 'yorke_mu00', 'Dwight Yorke', 1971, 'Trinidad & Tobago', ['ST'], 82, 83, 2003, 35, t(6, 7, 7, 6, 7, 8)),
];
export const BAYERN_2000_EXTRA: CuratedSeed[] = [
  q('bayern', 'kuffour_bay00', 'Samuel Kuffour', 1976, 'Ghana', ['CB'], 80, 82, 2005, 30, t(8, 5, 8, 7, 5, 7)),
  q('bayern', 'andersson_bay00', 'Patrik Andersson', 1971, 'Sweden', ['CB'], 79, 80, 2003, 30, t(8, 4, 7, 7, 4, 7)),
  q('bayern', 'linke_bay00', 'Thomas Linke', 1969, 'Germany', ['CB'], 78, 79, 2004, 30, t(8, 4, 7, 8, 4, 6)),
  q('bayern', 'jeremies_bay00', 'Jens Jeremies', 1974, 'Germany', ['DM'], 79, 80, 2004, 40, t(8, 5, 8, 8, 5, 6)),
  q('bayern', 'jancker_bay00', 'Carsten Jancker', 1974, 'Germany', ['ST'], 79, 80, 2004, 35, t(7, 5, 7, 7, 5, 6)),
  q('bayern', 'hargreaves_bay00', 'Owen Hargreaves', 1981, 'England', ['DM', 'CM'], 74, 85, 2006, 55, t(8, 5, 8, 7, 4, 8)),
];
export const JUVENTUS_2000_EXTRA: CuratedSeed[] = [
  q('juventus', 'ferrara_juv00', 'Ciro Ferrara', 1967, 'Italy', ['CB'], 80, 80, 2003, 30, t(9, 5, 8, 9, 4, 6)),
  q('juventus', 'conte_juv00', 'Antonio Conte', 1969, 'Italy', ['CM', 'DM'], 80, 81, 2004, 30, t(9, 6, 9, 10, 6, 6), { loyalty: 92 }),
  q('juventus', 'pessotto_juv00', 'Gianluca Pessotto', 1970, 'Italy', ['LB', 'RB'], 78, 79, 2004, 30, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'iuliano_juv00', 'Mark Iuliano', 1973, 'Italy', ['CB'], 77, 78, 2004, 30, t(7, 5, 7, 7, 5, 6)),
];
export const MILAN_2000_EXTRA: CuratedSeed[] = [
  q('milan', 'abbiati_mil00', 'Christian Abbiati', 1977, 'Italy', ['GK'], 82, 84, 2005, 20, t(8, 5, 7, 8, 4, 7)),
  q('milan', 'costacurta_mil00', 'Alessandro Costacurta', 1966, 'Italy', ['CB'], 80, 80, 2003, 30, t(9, 5, 8, 10, 3, 6), { loyalty: 95 }),
  q('milan', 'roque_mil00', 'Roque Júnior', 1976, 'Brazil', ['CB'], 80, 82, 2005, 30, t(7, 5, 7, 6, 5, 7)),
  q('milan', 'serginho_mil00', 'Serginho', 1971, 'Brazil', ['LB', 'LW'], 78, 80, 2004, 30, t(7, 5, 7, 6, 5, 7)),
  q('milan', 'albertini_mil00', 'Demetrio Albertini', 1971, 'Italy', ['CM', 'DM'], 82, 83, 2004, 25, t(9, 5, 8, 9, 3, 7)),
  q('milan', 'bierhoff_mil00', 'Oliver Bierhoff', 1968, 'Germany', ['ST'], 80, 81, 2003, 30, t(8, 6, 8, 7, 4, 6)),
];
export const INTER_2000_EXTRA: CuratedSeed[] = [
  q('inter', 'peruzzi_int00', 'Angelo Peruzzi', 1969, 'Italy', ['GK'], 83, 83, 2004, 25, t(8, 6, 7, 8, 5, 6)),
  q('inter', 'blanc_int00', 'Laurent Blanc', 1965, 'France', ['CB'], 81, 81, 2001, 25, t(9, 6, 8, 8, 3, 6)),
  q('inter', 'dibiagio_int00', 'Luigi Di Biagio', 1971, 'Italy', ['DM', 'CM'], 79, 80, 2003, 30, t(8, 5, 8, 7, 5, 7)),
  q('inter', 'zamorano_int00', 'Iván Zamorano', 1967, 'Chile', ['ST'], 80, 80, 2002, 30, t(8, 6, 8, 8, 5, 7)),
  q('inter', 'robbie_keane_int00', 'Robbie Keane', 1980, 'Ireland', ['ST', 'AM'], 79, 85, 2004, 25, t(7, 6, 8, 5, 5, 8)),
  q('inter', 'ventola_int00', 'Nicola Ventola', 1978, 'Italy', ['ST'], 77, 80, 2004, 50, t(6, 6, 7, 6, 6, 6)),
];
export const ARSENAL_2000_EXTRA: CuratedSeed[] = [
  q('arsenal', 'seaman_ars00', 'David Seaman', 1963, 'England', ['GK'], 82, 82, 2003, 25, t(8, 6, 8, 9, 3, 6)),
  q('arsenal', 'dixon_ars00', 'Lee Dixon', 1964, 'England', ['RB'], 75, 75, 2002, 25, t(9, 4, 7, 9, 3, 6)),
  q('arsenal', 'adams_ars00', 'Tony Adams', 1966, 'England', ['CB'], 83, 83, 2002, 30, t(9, 7, 9, 10, 4, 6), { loyalty: 96 }),
  q('arsenal', 'keown_ars00', 'Martin Keown', 1966, 'England', ['CB'], 81, 81, 2003, 30, t(8, 6, 8, 9, 5, 6)),
  q('arsenal', 'acole_ars00', 'Ashley Cole', 1980, 'England', ['LB'], 76, 88, 2005, 25, t(8, 6, 8, 7, 5, 7)),
  q('arsenal', 'lauren_ars00', 'Lauren', 1977, 'Cameroon', ['RB', 'CM'], 78, 82, 2005, 30, t(8, 5, 8, 7, 4, 7)),
  q('arsenal', 'grimandi_ars00', 'Gilles Grimandi', 1970, 'France', ['DM', 'CB'], 76, 77, 2003, 25, t(8, 4, 7, 7, 5, 7)),
  q('arsenal', 'parlour_ars00', 'Ray Parlour', 1973, 'England', ['CM', 'RW'], 79, 80, 2004, 25, t(8, 5, 8, 8, 5, 7)),
  q('arsenal', 'pires_ars00', 'Robert Pirès', 1973, 'France', ['LW', 'AM'], 84, 87, 2005, 30, t(8, 5, 8, 7, 3, 7)),
  q('arsenal', 'ljungberg_ars00', 'Fredrik Ljungberg', 1977, 'Sweden', ['RW', 'AM'], 81, 84, 2005, 35, t(8, 6, 8, 7, 4, 7)),
  q('arsenal', 'kanu_ars00', 'Nwankwo Kanu', 1976, 'Nigeria', ['ST', 'AM'], 81, 82, 2004, 30, t(7, 6, 7, 6, 5, 7)),
  q('arsenal', 'wiltord_ars00', 'Sylvain Wiltord', 1974, 'France', ['ST', 'RW'], 81, 83, 2005, 30, t(7, 6, 7, 6, 5, 7)),
];
export const CHELSEA_2000_EXTRA: CuratedSeed[] = [
  q('chelsea', 'degoey_che00', 'Ed de Goey', 1966, 'Netherlands', ['GK'], 79, 79, 2003, 25, t(8, 4, 7, 7, 4, 6)),
  q('chelsea', 'cudicini_che00', 'Carlo Cudicini', 1973, 'Italy', ['GK'], 80, 83, 2005, 25, t(8, 5, 7, 7, 4, 7)),
  q('chelsea', 'desailly_che00', 'Marcel Desailly', 1968, 'France', ['CB', 'DM'], 85, 85, 2004, 25, t(9, 6, 8, 8, 3, 7)),
  q('chelsea', 'leboeuf_che00', 'Frank Leboeuf', 1968, 'France', ['CB'], 80, 81, 2001, 25, t(8, 6, 7, 7, 5, 7)),
  q('chelsea', 'melchiot_che00', 'Mario Melchiot', 1976, 'Netherlands', ['RB'], 77, 79, 2004, 25, t(7, 5, 7, 6, 4, 7)),
  q('chelsea', 'babayaro_che00', 'Celestine Babayaro', 1978, 'Nigeria', ['LB'], 77, 80, 2005, 35, t(6, 6, 7, 6, 5, 7)),
  q('chelsea', 'lesaux_che00', 'Graeme Le Saux', 1968, 'England', ['LB'], 78, 79, 2003, 30, t(8, 5, 7, 7, 5, 7)),
  q('chelsea', 'wise_che00', 'Dennis Wise', 1966, 'England', ['CM'], 79, 80, 2003, 25, t(7, 7, 8, 8, 7, 6)),
  q('chelsea', 'poyet_che00', 'Gustavo Poyet', 1967, 'Uruguay', ['CM', 'AM'], 81, 82, 2001, 30, t(8, 6, 8, 6, 5, 7)),
  q('chelsea', 'hasselbaink_che00', 'Jimmy Floyd Hasselbaink', 1972, 'Netherlands', ['ST'], 84, 85, 2004, 30, t(7, 7, 8, 6, 5, 7)),
  q('chelsea', 'gudjohnsen_che00', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 80, 84, 2005, 30, t(8, 5, 7, 6, 4, 7)),
  q('chelsea', 'stanic_che00', 'Mario Stanić', 1972, 'Croatia', ['RW', 'AM'], 77, 78, 2004, 40, t(7, 6, 7, 6, 5, 7)),
];
export const LIVERPOOL_2000_EXTRA: CuratedSeed[] = [
  q('liverpool', 'westerveld_liv00', 'Sander Westerveld', 1974, 'Netherlands', ['GK'], 79, 80, 2004, 25, t(8, 5, 7, 6, 5, 6)),
  q('liverpool', 'henchoz_liv00', 'Stéphane Henchoz', 1974, 'Switzerland', ['CB'], 80, 81, 2005, 30, t(8, 4, 7, 7, 4, 6)),
  q('liverpool', 'babbel_liv00', 'Markus Babbel', 1972, 'Germany', ['RB', 'CB'], 81, 82, 2005, 40, t(8, 5, 8, 7, 4, 7)),
  q('liverpool', 'carragher_liv00', 'Jamie Carragher', 1978, 'England', ['CB', 'RB'], 79, 86, 2007, 25, t(9, 4, 8, 10, 5, 6)),
  q('liverpool', 'mcallister_liv00', 'Gary McAllister', 1964, 'Scotland', ['CM'], 80, 80, 2002, 25, t(9, 5, 8, 8, 3, 7)),
  q('liverpool', 'smicer_liv00', 'Vladimír Šmicer', 1973, 'Czech Republic', ['RW', 'AM'], 77, 79, 2004, 45, t(7, 5, 7, 6, 5, 7)),
  q('liverpool', 'fowler_liv00', 'Robbie Fowler', 1975, 'England', ['ST'], 83, 84, 2003, 45, t(6, 7, 7, 8, 6, 7)),
  q('liverpool', 'barmby_liv00', 'Nick Barmby', 1974, 'England', ['AM', 'LW'], 78, 79, 2004, 30, t(7, 5, 7, 6, 5, 7)),
  q('liverpool', 'berger_liv00', 'Patrik Berger', 1973, 'Czech Republic', ['LW', 'AM'], 79, 81, 2004, 40, t(7, 5, 7, 6, 5, 7)),
];
/** Manchester City, 2000–01 — a top-flight season that ended in relegation. */
export const MAN_CITY_2000: CuratedSeed[] = [
  q('man_city', 'weaver_mc00', 'Nicky Weaver', 1979, 'England', ['GK'], 68, 74, 2004, 30, t(7, 5, 7, 7, 5, 6)),
  q('man_city', 'dunne_mc00', 'Richard Dunne', 1979, 'Ireland', ['CB'], 72, 80, 2005, 30, t(7, 4, 7, 8, 5, 6)),
  q('man_city', 'howey_mc00', 'Steve Howey', 1971, 'England', ['CB'], 72, 73, 2003, 40, t(7, 5, 7, 7, 5, 6)),
  q('man_city', 'morrison_mc00', 'Andy Morrison', 1970, 'Scotland', ['CB'], 68, 69, 2002, 45, t(7, 6, 8, 8, 6, 5)),
  q('man_city', 'edghill_mc00', 'Richard Edghill', 1974, 'England', ['RB'], 66, 67, 2003, 30, t(7, 4, 7, 8, 5, 6)),
  q('man_city', 'granville_mc00', 'Danny Granville', 1975, 'England', ['LB'], 68, 70, 2003, 30, t(7, 4, 7, 7, 5, 6)),
  q('man_city', 'haaland_mc00', 'Alf-Inge Håland', 1972, 'Norway', ['CM', 'CB'], 74, 75, 2003, 45, t(7, 6, 8, 7, 6, 6)),
  q('man_city', 'horlock_mc00', 'Kevin Horlock', 1972, 'Northern Ireland', ['CM', 'LW'], 70, 71, 2004, 30, t(8, 5, 7, 7, 5, 6)),
  q('man_city', 'dickov_mc00', 'Paul Dickov', 1972, 'Scotland', ['ST'], 70, 72, 2003, 30, t(7, 6, 8, 8, 7, 6)),
  q('man_city', 'goater_mc00', 'Shaun Goater', 1970, 'Bermuda', ['ST'], 72, 74, 2004, 25, t(8, 5, 8, 8, 4, 7)),
  q('man_city', 'weah_mc00', 'George Weah', 1966, 'Liberia', ['ST'], 76, 76, 2001, 35, t(8, 6, 8, 7, 5, 7)),
  q('man_city', 'wanchope_mc00', 'Paulo Wanchope', 1976, 'Costa Rica', ['ST'], 75, 77, 2004, 40, t(6, 6, 7, 6, 6, 6)),
  q('man_city', 'huckerby_mc00', 'Darren Huckerby', 1976, 'England', ['LW', 'ST'], 74, 76, 2004, 30, t(6, 6, 7, 6, 6, 7)),
  q('man_city', 'kennedy_mc00', 'Mark Kennedy', 1976, 'Ireland', ['LW'], 72, 74, 2004, 30, t(7, 5, 7, 6, 5, 7)),
];

/** Curated squads for the Galácticos-era Madrid start, keyed by club. */
export const REAL_MADRID_2000_SQUADS: Record<string, CuratedSeed[]> = {
  ...LA_LIGA_2000_SQUADS,
  ...CONTEXT_2000_SQUADS,
  man_city: MAN_CITY_2000,
};
for (const [club, seed] of DEPTH_2000) {
  (REAL_MADRID_2000_SQUADS[club] ??= []).push(seed);
}
// Full-squad completion for the playable giants (§4, §14).
for (const extra of [MANUTD_2000_EXTRA, BAYERN_2000_EXTRA, JUVENTUS_2000_EXTRA, MILAN_2000_EXTRA, INTER_2000_EXTRA, ARSENAL_2000_EXTRA, CHELSEA_2000_EXTRA, LIVERPOOL_2000_EXTRA]) {
  for (const seed of extra) (REAL_MADRID_2000_SQUADS[seed.club as ClubId] ??= []).push(seed);
}
