/**
 * Curated domestic mid-tier — 2001-02 Premier League (M12 shortlist supply).
 *
 * Real 2001-02 squad players at the modelled PL's non-elite clubs for the
 * liverpool-2001 / spurs-2001 world. HIDDEN designer estimates (§7); real clubs,
 * birth years, positions, contracts. Injury proneness at the population norm (~30).
 * Van der Sar is at Fulham this era (his real 2001 move from Juventus). Names
 * already curated in the world are omitted. Deepened to ~16-18 real players per
 * club (era-2001 reference-quality world) — full first-team squads, not just a spine.
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

const WEST_HAM_01: CuratedSeed[] = [
  q('west_ham', 'james_wh01', 'David James', 1970, 'England', ['GK'], 80, 83, 2004, 30, t(6, 7, 8, 7, 6, 8)),
  q('west_ham', 'hislop_wh01', 'Shaka Hislop', 1969, 'Trinidad and Tobago', ['GK'], 74, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_ham', 'repka_wh01', 'Tomáš Řepka', 1974, 'Czechia', ['CB'], 76, 78, 2004, 30, t(6, 7, 8, 7, 7, 7)),
  q('west_ham', 'dailly_wh01', 'Christian Dailly', 1973, 'Scotland', ['CB', 'DM'], 74, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_ham', 'pearce_i_wh01', 'Ian Pearce', 1974, 'England', ['CB'], 73, 75, 2004, 30, t(8, 5, 8, 7, 5, 7)),
  q('west_ham', 'song_wh01', 'Rigobert Song', 1976, 'Cameroon', ['CB'], 74, 77, 2004, 30, t(7, 6, 8, 7, 6, 7)),
  q('west_ham', 'schemmel_wh01', 'Sébastien Schemmel', 1975, 'France', ['RB'], 74, 76, 2003, 30, t(7, 5, 8, 7, 6, 7)),
  q('west_ham', 'winterburn_wh01', 'Nigel Winterburn', 1963, 'England', ['LB'], 74, 74, 2003, 30, t(9, 5, 8, 8, 4, 7)),
  q('west_ham', 'carrick_wh01', 'Michael Carrick', 1981, 'England', ['CM', 'DM'], 74, 85, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('west_ham', 'lomas_wh01', 'Steve Lomas', 1974, 'Northern Ireland', ['CM', 'DM'], 74, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_ham', 'hutchison_wh01', 'Don Hutchison', 1971, 'Scotland', ['AM', 'CM'], 75, 77, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('west_ham', 'joe_cole_wh01', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 78, 86, 2004, 30, t(7, 7, 9, 8, 5, 8)),
  q('west_ham', 'sinclair_wh01', 'Trevor Sinclair', 1973, 'England', ['RW', 'RB'], 78, 80, 2004, 30, t(8, 6, 8, 8, 5, 8)),
  q('west_ham', 'dicanio_wh01', 'Paolo Di Canio', 1968, 'Italy', ['AM', 'ST'], 82, 84, 2003, 30, t(5, 9, 8, 6, 8, 8)),
  q('west_ham', 'kanoute_wh01', 'Frédéric Kanouté', 1977, 'Mali', ['ST'], 79, 83, 2004, 30, t(8, 6, 8, 7, 5, 8)),
  q('west_ham', 'defoe_wh01', 'Jermain Defoe', 1982, 'England', ['ST'], 72, 84, 2005, 30, t(8, 6, 9, 7, 5, 8)),
  q('west_ham', 'todorov_wh01', 'Svetoslav Todorov', 1978, 'Bulgaria', ['ST'], 72, 76, 2004, 30, t(7, 6, 8, 7, 5, 8)),
];

const ASTON_VILLA_01: CuratedSeed[] = [
  q('aston_villa', 'schmeichel_av01', 'Peter Schmeichel', 1963, 'Denmark', ['GK'], 80, 80, 2003, 30, t(9, 7, 9, 8, 5, 7)),
  q('aston_villa', 'enckelman_av01', 'Peter Enckelman', 1977, 'Finland', ['GK'], 72, 78, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'mellberg_av01', 'Olof Mellberg', 1977, 'Sweden', ['CB'], 79, 82, 2005, 30, t(9, 5, 8, 8, 5, 8)),
  q('aston_villa', 'alpay_av01', 'Alpay Özalan', 1973, 'Turkey', ['CB'], 76, 78, 2004, 30, t(6, 7, 8, 7, 7, 7)),
  q('aston_villa', 'staunton_av01', 'Steve Staunton', 1969, 'Ireland', ['CB', 'LB'], 74, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'delaney_av01', 'Mark Delaney', 1976, 'Wales', ['RB'], 73, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'wright_a_av01', 'Alan Wright', 1971, 'England', ['LB'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'barry_av01', 'Gareth Barry', 1981, 'England', ['LB', 'CM'], 76, 86, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'boateng_av01', 'George Boateng', 1975, 'Netherlands', ['CM', 'DM'], 77, 80, 2004, 30, t(8, 6, 8, 7, 5, 8)),
  q('aston_villa', 'taylor_i_av01', 'Ian Taylor', 1968, 'England', ['CM'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'hendrie_av01', 'Lee Hendrie', 1977, 'England', ['CM', 'AM'], 74, 78, 2004, 30, t(6, 6, 8, 7, 6, 7)),
  q('aston_villa', 'stone_av01', 'Steve Stone', 1971, 'England', ['RW', 'CM'], 74, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'merson_av01', 'Paul Merson', 1968, 'England', ['AM'], 76, 77, 2003, 35, t(5, 7, 8, 6, 7, 8)),
  q('aston_villa', 'kachloul_av01', 'Hassan Kachloul', 1973, 'Morocco', ['AM', 'LW'], 73, 76, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('aston_villa', 'angel_av01', 'Juan Pablo Ángel', 1975, 'Colombia', ['ST'], 78, 81, 2005, 30, t(8, 6, 8, 7, 5, 8)),
  q('aston_villa', 'dublin_av01', 'Dion Dublin', 1969, 'England', ['ST', 'CB'], 75, 76, 2003, 30, t(8, 6, 8, 8, 5, 8)),
  q('aston_villa', 'vassell_av01', 'Darius Vassell', 1980, 'England', ['ST'], 74, 80, 2005, 30, t(7, 6, 8, 7, 5, 8)),
];

const MIDDLESBROUGH_01: CuratedSeed[] = [
  q('middlesbrough', 'schwarzer_mi01', 'Mark Schwarzer', 1972, 'Australia', ['GK'], 79, 81, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('middlesbrough', 'crossley_mi01', 'Mark Crossley', 1969, 'Wales', ['GK'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'southgate_mi01', 'Gareth Southgate', 1970, 'England', ['CB'], 80, 81, 2004, 30, t(9, 5, 8, 8, 4, 8)),
  q('middlesbrough', 'ehiogu_mi01', 'Ugo Ehiogu', 1972, 'England', ['CB'], 78, 80, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'cooper_c_mi01', 'Colin Cooper', 1967, 'England', ['CB'], 73, 74, 2003, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('middlesbrough', 'queudrue_mi01', 'Franck Queudrue', 1978, 'France', ['LB', 'CB'], 75, 79, 2005, 30, t(7, 6, 8, 7, 6, 8)),
  q('middlesbrough', 'fleming_mi01', 'Curtis Fleming', 1968, 'Ireland', ['RB'], 72, 73, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'ince_mi01', 'Paul Ince', 1967, 'England', ['CM', 'DM'], 77, 78, 2003, 30, t(7, 8, 9, 7, 6, 8)),
  q('middlesbrough', 'okon_mi01', 'Paul Okon', 1972, 'Australia', ['DM', 'CM'], 74, 76, 2003, 30, t(8, 5, 8, 7, 5, 8)),
  q('middlesbrough', 'mustoe_mi01', 'Robbie Mustoe', 1968, 'England', ['CM'], 72, 73, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'greening_mi01', 'Jonathan Greening', 1979, 'England', ['RW', 'CM'], 74, 79, 2005, 30, t(8, 5, 8, 7, 5, 8)),
  q('middlesbrough', 'marinelli_mi01', 'Carlos Marinelli', 1982, 'Argentina', ['AM', 'RW'], 71, 80, 2005, 30, t(6, 7, 8, 6, 6, 7)),
  q('middlesbrough', 'boksic_mi01', 'Alen Bokšić', 1970, 'Croatia', ['ST'], 79, 80, 2003, 35, t(6, 7, 8, 7, 6, 8)),
  q('middlesbrough', 'ricard_mi01', 'Hamilton Ricard', 1974, 'Colombia', ['ST'], 73, 75, 2003, 30, t(7, 6, 8, 7, 6, 7)),
  q('middlesbrough', 'nemeth_mi01', 'Szilárd Németh', 1977, 'Slovakia', ['ST'], 73, 77, 2005, 30, t(7, 6, 8, 7, 5, 8)),
  q('middlesbrough', 'windass_mi01', 'Dean Windass', 1969, 'England', ['ST', 'AM'], 72, 73, 2003, 30, t(6, 6, 8, 7, 6, 7)),
];

const FULHAM_01: CuratedSeed[] = [
  q('fulham', 'vandersar_fu01', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 84, 85, 2005, 30, t(9, 5, 8, 8, 3, 8)),
  q('fulham', 'taylor_m_fu01', 'Maik Taylor', 1971, 'Northern Ireland', ['GK'], 74, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('fulham', 'finnan_fu01', 'Steve Finnan', 1976, 'Ireland', ['RB'], 78, 82, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'goma_fu01', 'Alain Goma', 1972, 'France', ['CB'], 76, 78, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('fulham', 'melville_fu01', 'Andy Melville', 1968, 'Wales', ['CB'], 74, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('fulham', 'symons_fu01', 'Kit Symons', 1971, 'Wales', ['CB'], 72, 73, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('fulham', 'brevett_fu01', 'Rufus Brevett', 1969, 'England', ['LB'], 74, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('fulham', 'knight_z_fu01', 'Zat Knight', 1980, 'England', ['CB'], 70, 79, 2005, 30, t(8, 5, 8, 7, 5, 7)),
  q('fulham', 'malbranque_fu01', 'Steed Malbranque', 1980, 'France', ['AM', 'RW'], 77, 83, 2005, 30, t(8, 6, 8, 7, 5, 8)),
  q('fulham', 'legwinski_fu01', 'Sylvain Legwinski', 1973, 'France', ['CM', 'DM'], 74, 77, 2004, 30, t(8, 5, 8, 7, 5, 8)),
  q('fulham', 'davis_s_fu01', 'Sean Davis', 1979, 'England', ['CM'], 73, 79, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('fulham', 'collins_j_fu01', 'John Collins', 1968, 'Scotland', ['CM'], 74, 75, 2003, 30, t(8, 5, 8, 8, 4, 8)),
  q('fulham', 'goldbaek_fu01', 'Bjarne Goldbæk', 1968, 'Denmark', ['RW', 'AM'], 73, 74, 2003, 30, t(7, 6, 8, 7, 5, 8)),
  q('fulham', 'boa_morte_fu01', 'Luís Boa Morte', 1977, 'Portugal', ['LW', 'ST'], 76, 80, 2005, 30, t(6, 7, 8, 7, 6, 8)),
  q('fulham', 'saha_fu01', 'Louis Saha', 1978, 'France', ['ST'], 78, 84, 2005, 30, t(7, 6, 8, 7, 5, 8)),
  q('fulham', 'sava_fu01', 'Facundo Sava', 1974, 'Argentina', ['ST'], 72, 74, 2004, 30, t(7, 6, 8, 7, 6, 7)),
  q('fulham', 'hayles_fu01', 'Barry Hayles', 1972, 'Jamaica', ['ST'], 73, 75, 2004, 30, t(7, 6, 8, 7, 5, 7)),
];

const CHARLTON_01: CuratedSeed[] = [
  q('charlton', 'kiely_ch01', 'Dean Kiely', 1970, 'Ireland', ['GK'], 76, 78, 2004, 30, t(9, 5, 8, 8, 5, 7)),
  q('charlton', 'ilic_ch01', 'Saša Ilić', 1972, 'Serbia', ['GK'], 71, 72, 2003, 30, t(8, 5, 8, 7, 5, 7)),
  q('charlton', 'rufus_ch01', 'Richard Rufus', 1975, 'England', ['CB'], 74, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('charlton', 'fish_ch01', 'Mark Fish', 1974, 'South Africa', ['CB'], 74, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('charlton', 'brown_s_ch01', 'Steve Brown', 1972, 'England', ['CB', 'CM'], 71, 72, 2003, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('charlton', 'powell_c_ch01', 'Chris Powell', 1969, 'England', ['LB'], 74, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('charlton', 'young_l_ch01', 'Luke Young', 1979, 'England', ['RB'], 74, 80, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('charlton', 'konchesky_ch01', 'Paul Konchesky', 1981, 'England', ['LB'], 72, 80, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('charlton', 'parker_s_ch01', 'Scott Parker', 1980, 'England', ['CM', 'DM'], 75, 84, 2005, 30, t(9, 5, 9, 8, 5, 8)),
  q('charlton', 'kinsella_ch01', 'Mark Kinsella', 1972, 'Ireland', ['CM'], 74, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('charlton', 'jensen_c_ch01', 'Claus Jensen', 1977, 'Denmark', ['AM', 'CM'], 77, 81, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('charlton', 'stuart_g_ch01', 'Graham Stuart', 1970, 'England', ['AM', 'RW'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('charlton', 'robinson_j_ch01', 'John Robinson', 1971, 'Wales', ['RW'], 72, 73, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('charlton', 'euell_ch01', 'Jason Euell', 1977, 'Jamaica', ['ST', 'AM'], 75, 78, 2005, 30, t(7, 6, 8, 7, 5, 8)),
  q('charlton', 'bartlett_ch01', 'Shaun Bartlett', 1972, 'South Africa', ['ST'], 74, 76, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('charlton', 'lisbie_ch01', 'Kevin Lisbie', 1978, 'Jamaica', ['ST'], 71, 74, 2004, 30, t(7, 6, 8, 7, 6, 7)),
];

const EVERTON_01: CuratedSeed[] = [
  q('everton', 'gerrard_ev01', 'Paul Gerrard', 1973, 'England', ['GK'], 73, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'simonsen_ev01', 'Steve Simonsen', 1979, 'England', ['GK'], 72, 78, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'weir_ev01', 'David Weir', 1970, 'Scotland', ['CB'], 77, 79, 2004, 30, t(9, 5, 8, 8, 4, 7)),
  q('everton', 'stubbs_ev01', 'Alan Stubbs', 1971, 'England', ['CB'], 75, 77, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'unsworth_ev01', 'David Unsworth', 1973, 'England', ['CB', 'LB'], 74, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'pistone_ev01', 'Alessandro Pistone', 1975, 'Italy', ['LB', 'CB'], 74, 76, 2004, 30, t(7, 5, 8, 7, 6, 7)),
  q('everton', 'watson_s_ev01', 'Steve Watson', 1974, 'England', ['RB', 'RW'], 74, 76, 2004, 30, t(8, 5, 8, 8, 5, 8)),
  q('everton', 'hibbert_ev01', 'Tony Hibbert', 1981, 'England', ['RB'], 71, 78, 2005, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('everton', 'gravesen_ev01', 'Thomas Gravesen', 1976, 'Denmark', ['CM', 'DM'], 77, 81, 2004, 30, t(6, 7, 8, 7, 7, 8)),
  q('everton', 'gemmill_ev01', 'Scot Gemmill', 1971, 'Scotland', ['CM'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'pembridge_ev01', 'Mark Pembridge', 1970, 'Wales', ['CM', 'LW'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'alexandersson_ev01', 'Niclas Alexandersson', 1971, 'Sweden', ['RW', 'CM'], 75, 77, 2004, 30, t(8, 5, 8, 7, 5, 8)),
  q('everton', 'tal_ev01', 'Idan Tal', 1975, 'Israel', ['LW', 'AM'], 73, 76, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('everton', 'campbell_ev01', 'Kevin Campbell', 1970, 'England', ['ST'], 75, 76, 2003, 30, t(8, 6, 8, 8, 5, 8)),
  q('everton', 'ferguson_d_ev01', 'Duncan Ferguson', 1971, 'Scotland', ['ST'], 76, 78, 2004, 35, t(6, 7, 8, 7, 7, 7)),
  q('everton', 'radzinski_ev01', 'Tomasz Radzinski', 1973, 'Canada', ['ST', 'LW'], 75, 78, 2005, 30, t(7, 6, 8, 7, 5, 8)),
  q('everton', 'moore_jm_ev01', 'Joe-Max Moore', 1971, 'United States', ['ST', 'AM'], 71, 72, 2003, 30, t(7, 6, 8, 7, 5, 8)),
];

const BOLTON_01: CuratedSeed[] = [
  q('bolton', 'jaaskelainen_bo01', 'Jussi Jääskeläinen', 1975, 'Finland', ['GK'], 78, 82, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('bolton', 'poole_bo01', 'Kevin Poole', 1963, 'England', ['GK'], 70, 70, 2003, 30, t(8, 5, 7, 8, 5, 7)),
  q('bolton', 'bergsson_bo01', 'Gudni Bergsson', 1965, 'Iceland', ['CB'], 74, 74, 2003, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('bolton', 'ngotty_bo01', 'Bruno N’Gotty', 1971, 'France', ['CB'], 75, 77, 2004, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'whitlow_bo01', 'Mike Whitlow', 1968, 'England', ['CB', 'LB'], 71, 72, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'hendry_bo01', 'Colin Hendry', 1965, 'Scotland', ['CB'], 73, 73, 2003, 30, t(8, 6, 8, 8, 6, 7)),
  q('bolton', 'gardner_bo01', 'Ricardo Gardner', 1978, 'Jamaica', ['LB', 'LW'], 74, 78, 2005, 30, t(7, 5, 8, 7, 5, 8)),
  q('bolton', 'charlton_s_bo01', 'Simon Charlton', 1971, 'England', ['LB'], 71, 72, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'frandsen_bo01', 'Per Frandsen', 1970, 'Denmark', ['CM', 'DM'], 74, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'nolan_bo01', 'Kevin Nolan', 1982, 'England', ['CM', 'AM'], 71, 81, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'farrelly_bo01', 'Gareth Farrelly', 1975, 'Ireland', ['CM'], 71, 73, 2004, 30, t(7, 5, 8, 7, 5, 8)),
  q('bolton', 'djorkaeff_bo01', 'Youri Djorkaeff', 1968, 'France', ['AM', 'ST'], 79, 80, 2003, 30, t(8, 7, 8, 7, 5, 8)),
  q('bolton', 'hansen_bo01', 'Bo Hansen', 1972, 'Denmark', ['LW', 'ST'], 72, 74, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('bolton', 'bobic_bo01', 'Fredi Bobic', 1971, 'Germany', ['ST'], 75, 77, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('bolton', 'ricketts_bo01', 'Michael Ricketts', 1978, 'England', ['ST'], 73, 78, 2004, 30, t(6, 6, 8, 7, 6, 7)),
  q('bolton', 'holdsworth_bo01', 'Dean Holdsworth', 1968, 'England', ['ST'], 71, 72, 2003, 30, t(7, 6, 8, 7, 6, 7)),
];

const SUNDERLAND_01: CuratedSeed[] = [
  q('sunderland', 'sorensen_su01', 'Thomas Sørensen', 1976, 'Denmark', ['GK'], 79, 83, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('sunderland', 'macho_su01', 'Jürgen Macho', 1977, 'Austria', ['GK'], 72, 75, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'craddock_su01', 'Jody Craddock', 1975, 'England', ['CB'], 73, 75, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'thome_su01', 'Emerson Thome', 1972, 'Brazil', ['CB'], 75, 77, 2004, 30, t(8, 5, 8, 7, 5, 8)),
  q('sunderland', 'varga_su01', 'Stanislav Varga', 1972, 'Slovakia', ['CB'], 73, 75, 2004, 30, t(8, 5, 8, 7, 5, 8)),
  q('sunderland', 'gray_su01', 'Michael Gray', 1974, 'England', ['LB'], 74, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'williams_d_su01', 'Darren Williams', 1977, 'England', ['RB', 'CB'], 73, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'mccartney_su01', 'George McCartney', 1981, 'Northern Ireland', ['LB'], 70, 78, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'mccann_su01', 'Gavin McCann', 1978, 'England', ['CM', 'DM'], 74, 79, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'reyna_su01', 'Claudio Reyna', 1973, 'United States', ['CM'], 76, 78, 2004, 30, t(9, 5, 8, 7, 5, 8)),
  q('sunderland', 'mcateer_su01', 'Jason McAteer', 1971, 'Ireland', ['RW', 'CM'], 74, 75, 2003, 30, t(7, 6, 8, 7, 5, 8)),
  q('sunderland', 'kilbane_su01', 'Kevin Kilbane', 1977, 'Ireland', ['LW', 'LB'], 74, 77, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('sunderland', 'arca_su01', 'Julio Arca', 1981, 'Argentina', ['LB', 'LW'], 74, 80, 2005, 30, t(8, 5, 8, 7, 5, 8)),
  q('sunderland', 'phillips_su01', 'Kevin Phillips', 1973, 'England', ['ST'], 79, 81, 2004, 30, t(8, 6, 8, 8, 5, 8)),
  q('sunderland', 'quinn_su01', 'Niall Quinn', 1966, 'Ireland', ['ST'], 74, 75, 2003, 35, t(8, 6, 8, 8, 5, 8)),
  q('sunderland', 'kyle_su01', 'Kevin Kyle', 1981, 'Scotland', ['ST'], 70, 76, 2005, 30, t(7, 6, 8, 7, 5, 7)),
];

const IPSWICH_01: CuratedSeed[] = [
  q('ipswich', 'sereni_ip01', 'Matteo Sereni', 1975, 'Italy', ['GK'], 74, 77, 2005, 30, t(8, 5, 8, 7, 5, 7)),
  q('ipswich', 'marshall_a_ip01', 'Andy Marshall', 1975, 'England', ['GK'], 73, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('ipswich', 'hreidarsson_ip01', 'Hermann Hreiðarsson', 1974, 'Iceland', ['CB', 'LB'], 74, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('ipswich', 'mcgreal_ip01', 'John McGreal', 1972, 'England', ['CB'], 72, 74, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('ipswich', 'venus_ip01', 'Mark Venus', 1967, 'England', ['CB'], 71, 72, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('ipswich', 'bramble_ip01', 'Titus Bramble', 1981, 'England', ['CB'], 72, 80, 2005, 30, t(6, 6, 8, 7, 6, 7)),
  q('ipswich', 'wilnis_ip01', 'Fabian Wilnis', 1970, 'Netherlands', ['RB', 'CB'], 72, 73, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('ipswich', 'clapham_ip01', 'Jamie Clapham', 1975, 'England', ['LB', 'LW'], 72, 75, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('ipswich', 'holland_ip01', 'Matt Holland', 1974, 'Ireland', ['CM'], 75, 77, 2004, 30, t(9, 5, 8, 8, 4, 8)),
  q('ipswich', 'magilton_ip01', 'Jim Magilton', 1969, 'Northern Ireland', ['CM', 'AM'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 8)),
  q('ipswich', 'wright_j_ip01', 'Jermaine Wright', 1975, 'England', ['CM', 'RW'], 72, 74, 2004, 30, t(8, 5, 8, 7, 5, 8)),
  q('ipswich', 'reuser_ip01', 'Martijn Reuser', 1975, 'Netherlands', ['AM', 'LW'], 73, 76, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('ipswich', 'stewart_m_ip01', 'Marcus Stewart', 1972, 'England', ['ST'], 75, 77, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('ipswich', 'counago_ip01', 'Pablo Couñago', 1979, 'Spain', ['ST'], 72, 78, 2005, 30, t(7, 6, 8, 7, 5, 8)),
  q('ipswich', 'bent_d_ip01', 'Darren Bent', 1984, 'England', ['ST'], 66, 83, 2006, 30, t(8, 6, 8, 7, 5, 8)),
  q('ipswich', 'armstrong_a_ip01', 'Alun Armstrong', 1975, 'England', ['ST'], 71, 74, 2004, 30, t(7, 5, 8, 7, 5, 7)),
];

const LEICESTER_01: CuratedSeed[] = [
  q('leicester', 'walker_i_le01', 'Ian Walker', 1971, 'England', ['GK'], 75, 77, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'royce_le01', 'Simon Royce', 1971, 'England', ['GK'], 71, 73, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'elliott_le01', 'Matt Elliott', 1968, 'Scotland', ['CB'], 76, 77, 2003, 30, t(9, 5, 8, 8, 5, 7)),
  q('leicester', 'taggart_le01', 'Gerry Taggart', 1970, 'Northern Ireland', ['CB'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'sinclair_f_le01', 'Frank Sinclair', 1971, 'Jamaica', ['CB', 'RB'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'davidson_le01', 'Callum Davidson', 1976, 'Scotland', ['LB'], 73, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'impey_le01', 'Andy Impey', 1971, 'England', ['RB', 'RW'], 72, 73, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'izzet_le01', 'Muzzy Izzet', 1974, 'Turkey', ['CM', 'AM'], 77, 80, 2004, 30, t(8, 5, 8, 8, 5, 8)),
  q('leicester', 'savage_le01', 'Robbie Savage', 1974, 'Wales', ['DM', 'CM'], 74, 77, 2004, 30, t(6, 7, 8, 7, 6, 7)),
  q('leicester', 'wise_le01', 'Dennis Wise', 1966, 'England', ['CM', 'AM'], 76, 77, 2003, 30, t(6, 8, 8, 7, 7, 8)),
  q('leicester', 'lewis_j_le01', 'Junior Lewis', 1973, 'England', ['CM'], 70, 72, 2003, 30, t(7, 5, 8, 7, 5, 7)),
  q('leicester', 'piper_le01', 'Matt Piper', 1981, 'England', ['RW'], 70, 77, 2005, 30, t(7, 6, 8, 7, 5, 7)),
  q('leicester', 'akinbiyi_le01', 'Ade Akinbiyi', 1974, 'Nigeria', ['ST'], 72, 75, 2004, 30, t(6, 6, 8, 7, 6, 7)),
  q('leicester', 'dickov_le01', 'Paul Dickov', 1972, 'Scotland', ['ST'], 72, 74, 2004, 30, t(7, 6, 8, 8, 6, 7)),
  q('leicester', 'benjamin_le01', 'Trevor Benjamin', 1979, 'England', ['ST'], 70, 74, 2004, 30, t(6, 6, 8, 7, 6, 7)),
  q('leicester', 'deane_le01', 'Brian Deane', 1968, 'England', ['ST'], 71, 72, 2003, 30, t(7, 6, 8, 7, 5, 7)),
];

const BLACKBURN_01: CuratedSeed[] = [
  q('blackburn', 'friedel_bl01', 'Brad Friedel', 1971, 'United States', ['GK'], 80, 82, 2004, 30, t(9, 5, 8, 8, 4, 8)),
  q('blackburn', 'kelly_a_bl01', 'Alan Kelly', 1968, 'Ireland', ['GK'], 71, 72, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('blackburn', 'berg_bl01', 'Henning Berg', 1969, 'Norway', ['CB', 'RB'], 76, 77, 2003, 30, t(9, 5, 8, 8, 4, 8)),
  q('blackburn', 'short_bl01', 'Craig Short', 1968, 'England', ['CB'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('blackburn', 'johansson_bl01', 'Nils-Eric Johansson', 1980, 'Sweden', ['CB', 'LB'], 72, 78, 2005, 30, t(8, 5, 8, 7, 5, 8)),
  q('blackburn', 'neill_bl01', 'Lucas Neill', 1978, 'Australia', ['RB', 'CB'], 75, 80, 2005, 30, t(8, 5, 8, 7, 6, 8)),
  q('blackburn', 'bjornebye_bl01', 'Stig Inge Bjørnebye', 1969, 'Norway', ['LB'], 74, 75, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('blackburn', 'tugay_bl01', 'Tugay Kerimoğlu', 1970, 'Turkey', ['CM', 'DM'], 78, 80, 2004, 30, t(8, 6, 8, 7, 5, 8)),
  q('blackburn', 'flitcroft_bl01', 'Garry Flitcroft', 1972, 'England', ['CM', 'DM'], 74, 75, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('blackburn', 'dunn_bl01', 'David Dunn', 1979, 'England', ['AM', 'CM'], 76, 82, 2005, 30, t(7, 6, 8, 8, 5, 8)),
  q('blackburn', 'gillespie_bl01', 'Keith Gillespie', 1975, 'Northern Ireland', ['RW'], 74, 76, 2004, 30, t(6, 6, 8, 7, 6, 8)),
  q('blackburn', 'mahon_bl01', 'Alan Mahon', 1978, 'Ireland', ['CM', 'AM'], 72, 76, 2004, 30, t(7, 5, 8, 7, 5, 8)),
  q('blackburn', 'jansen_bl01', 'Matt Jansen', 1977, 'England', ['ST', 'AM'], 76, 82, 2005, 35, t(7, 6, 8, 7, 5, 8)),
  q('blackburn', 'hughes_m_bl01', 'Mark Hughes', 1963, 'Wales', ['ST'], 73, 73, 2002, 30, t(8, 7, 9, 8, 6, 8)),
  q('blackburn', 'grabbi_bl01', 'Corrado Grabbi', 1975, 'Italy', ['ST'], 71, 74, 2005, 30, t(6, 6, 8, 6, 6, 7)),
  q('blackburn', 'ostenstad_bl01', 'Egil Østenstad', 1972, 'Norway', ['ST'], 73, 76, 2004, 30, t(7, 6, 8, 7, 5, 8)),
];

const SOUTHAMPTON_01: CuratedSeed[] = [
  q('southampton', 'jones_p_so01', 'Paul Jones', 1967, 'Wales', ['GK'], 76, 77, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'niemi_so01', 'Antti Niemi', 1972, 'Finland', ['GK'], 78, 81, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('southampton', 'lundekvam_so01', 'Claus Lundekvam', 1973, 'Norway', ['CB'], 75, 78, 2004, 30, t(9, 5, 8, 8, 5, 7)),
  q('southampton', 'elkhalej_so01', 'Tahar El Khalej', 1968, 'Morocco', ['CB'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'dodd_so01', 'Jason Dodd', 1970, 'England', ['RB'], 73, 74, 2003, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('southampton', 'telfer_so01', 'Paul Telfer', 1971, 'Scotland', ['RB', 'CM'], 73, 74, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'marsden_so01', 'Chris Marsden', 1969, 'England', ['CM'], 73, 74, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'oakley_so01', 'Matt Oakley', 1977, 'England', ['CM'], 73, 76, 2004, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('southampton', 'svensson_a_so01', 'Anders Svensson', 1976, 'Sweden', ['AM', 'CM'], 76, 79, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('southampton', 'delap_so01', 'Rory Delap', 1976, 'Ireland', ['CM', 'RW'], 73, 76, 2004, 30, t(8, 5, 8, 7, 5, 8)),
  q('southampton', 'tessem_so01', 'Jo Tessem', 1972, 'Norway', ['RW', 'CM'], 72, 74, 2004, 30, t(7, 5, 8, 7, 5, 8)),
  q('southampton', 'beattie_so01', 'James Beattie', 1978, 'England', ['ST'], 77, 82, 2005, 30, t(8, 6, 8, 8, 5, 8)),
  q('southampton', 'pahars_so01', 'Marian Pahars', 1976, 'Latvia', ['ST'], 76, 80, 2004, 30, t(8, 5, 8, 8, 5, 8)),
  q('southampton', 'davies_k_so01', 'Kevin Davies', 1977, 'England', ['ST'], 73, 76, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('southampton', 'fernandes_f_so01', 'Fabrice Fernandes', 1979, 'France', ['RW', 'AM'], 74, 78, 2005, 30, t(6, 6, 8, 7, 6, 8)),
];

const NEWCASTLE_01_EXTRA: CuratedSeed[] = [
  q('newcastle', 'obrien_a_nu01', 'Andy O’Brien', 1979, 'Ireland', ['CB'], 74, 79, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('newcastle', 'hughes_a_nu01', 'Aaron Hughes', 1979, 'Northern Ireland', ['CB', 'RB'], 75, 81, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('newcastle', 'acuna_nu01', 'Clarence Acuña', 1975, 'Chile', ['CM', 'DM'], 74, 76, 2004, 30, t(8, 5, 8, 7, 5, 8)),
  q('newcastle', 'lua_lua_nu01', 'Lomana LuaLua', 1980, 'DR Congo', ['LW', 'ST'], 72, 78, 2005, 30, t(5, 7, 8, 6, 7, 8)),
  q('newcastle', 'given_nu01', 'Shay Given', 1976, 'Ireland', ['GK'], 82, 85, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('newcastle', 'harper_nu01', 'Steve Harper', 1975, 'England', ['GK'], 73, 75, 2004, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('newcastle', 'griffin_nu01', 'Andy Griffin', 1979, 'England', ['RB'], 72, 76, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('newcastle', 'elliott_r_nu01', 'Robert Lee', 1966, 'England', ['CM'], 73, 74, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('newcastle', 'quinn_w_nu01', 'Wayne Quinn', 1976, 'England', ['LB'], 71, 73, 2004, 30, t(7, 5, 8, 7, 5, 7)),
  q('newcastle', 'bassedas_nu01', 'Christian Bassedas', 1973, 'Argentina', ['CM'], 73, 75, 2004, 30, t(7, 5, 8, 7, 5, 8)),
  q('newcastle', 'ameobi_nu01', 'Shola Ameobi', 1981, 'England', ['ST'], 70, 78, 2005, 30, t(7, 6, 8, 8, 5, 7)),
  q('newcastle', 'cort_nu01', 'Carl Cort', 1977, 'England', ['ST'], 72, 76, 2004, 35, t(7, 6, 8, 7, 6, 7)),
];

/** The domestic mid-tier of the 2001-02 PL. Merged by CONCATENATION into
 *  LIVERPOOL_2001_SQUADS (liverpool-2001 / spurs-2001). */
export const ENG_DOMESTIC_2001_SQUADS: Record<string, CuratedSeed[]> = {
  west_ham: WEST_HAM_01,
  aston_villa: ASTON_VILLA_01,
  middlesbrough: MIDDLESBROUGH_01,
  fulham: FULHAM_01,
  charlton: CHARLTON_01,
  everton: EVERTON_01,
  bolton: BOLTON_01,
  sunderland: SUNDERLAND_01,
  ipswich: IPSWICH_01,
  leicester: LEICESTER_01,
  blackburn: BLACKBURN_01,
  southampton: SOUTHAMPTON_01,
  newcastle: NEWCASTLE_01_EXTRA,
};
