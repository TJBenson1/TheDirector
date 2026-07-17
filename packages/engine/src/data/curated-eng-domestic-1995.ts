/**
 * Curated domestic mid-tier — 1995-96 Premier League (M12 shortlist supply).
 *
 * The real squad players of the modelled PL's non-elite clubs in the Spice Boys
 * season, so options lists read like a real 1995-96 shortlist. Ability/potential/
 * personality are HIDDEN designer estimates (§7); clubs, birth years, positions and
 * contracts are real. Injury proneness sits at the population norm (~30) so the
 * league-wide injury rate is unperturbed. Names already curated in the world are
 * omitted (Le Tissier at Southampton).
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

// ── Aston Villa, 1995-96 (Little's cup winners; a young Yorke) ─────────────────
const ASTON_VILLA_95: CuratedSeed[] = [
  q('aston_villa', 'bosnich_av95', 'Mark Bosnich', 1972, 'Australia', ['GK'], 78, 80, 1999, 30, t(6, 7, 8, 6, 6, 8)),
  q('aston_villa', 'southgate_av95', 'Gareth Southgate', 1970, 'England', ['CB', 'DM'], 78, 82, 1998, 30, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'ehiogu_av95', 'Ugo Ehiogu', 1972, 'England', ['CB'], 77, 81, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'mcgrath_av95', 'Paul McGrath', 1959, 'Ireland', ['CB'], 79, 79, 1997, 40, t(7, 6, 8, 8, 5, 7)),
  q('aston_villa', 'wright_av95', 'Alan Wright', 1971, 'England', ['LB'], 73, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'townsend_av95', 'Andy Townsend', 1963, 'Ireland', ['CM', 'DM'], 76, 77, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'draper_av95', 'Mark Draper', 1970, 'England', ['CM'], 74, 76, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'yorke_av95', 'Dwight Yorke', 1971, 'Trinidad', ['ST', 'AM'], 79, 85, 1998, 30, t(7, 7, 8, 7, 5, 8)),
  q('aston_villa', 'milosevic_av95', 'Savo Milošević', 1973, 'Serbia', ['ST'], 76, 80, 1999, 30, t(6, 7, 8, 6, 6, 8)),
];

// ── Everton, 1995-96 (Royle's FA Cup holders; Kanchelskis on the wing) ────────
const EVERTON_95: CuratedSeed[] = [
  q('everton', 'southall_ev95', 'Neville Southall', 1958, 'Wales', ['GK'], 80, 80, 1998, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('everton', 'watson_d_ev95', 'Dave Watson', 1961, 'England', ['CB'], 76, 76, 1997, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('everton', 'hinchcliffe_ev95', 'Andy Hinchcliffe', 1969, 'England', ['LB'], 75, 77, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'kanchelskis_ev95', 'Andrei Kanchelskis', 1969, 'Russia', ['RW'], 80, 82, 1998, 30, t(7, 6, 8, 7, 6, 8)),
  q('everton', 'parkinson_ev95', 'Joe Parkinson', 1971, 'England', ['CM', 'DM'], 73, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'limpar_ev95', 'Anders Limpar', 1965, 'Sweden', ['LW', 'AM'], 76, 77, 1997, 30, t(6, 6, 8, 7, 6, 8)),
  q('everton', 'ferguson_d_ev95', 'Duncan Ferguson', 1971, 'Scotland', ['ST'], 78, 81, 1999, 35, t(6, 7, 8, 7, 7, 7)),
  q('everton', 'rideout_ev95', 'Paul Rideout', 1964, 'England', ['ST'], 73, 74, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'stuart_ev95', 'Graham Stuart', 1970, 'England', ['AM', 'RW'], 73, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Nottingham Forest, 1995-96 (Pearce's side; Roy the Dutch flair) ───────────
const NOTTM_FOREST_95: CuratedSeed[] = [
  q('nottm_forest', 'crossley_nf95', 'Mark Crossley', 1969, 'Wales', ['GK'], 74, 76, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('nottm_forest', 'pearce_nf95', 'Stuart Pearce', 1962, 'England', ['LB', 'CB'], 79, 79, 1997, 30, t(9, 6, 8, 9, 6, 7), { loyalty: 90 }),
  q('nottm_forest', 'cooper_c_nf95', 'Colin Cooper', 1967, 'England', ['CB'], 75, 76, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('nottm_forest', 'chettle_nf95', 'Steve Chettle', 1968, 'England', ['CB'], 73, 74, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('nottm_forest', 'stone_nf95', 'Steve Stone', 1971, 'England', ['RW', 'CM'], 77, 80, 1998, 30, t(8, 6, 8, 8, 5, 8)),
  q('nottm_forest', 'woan_nf95', 'Ian Woan', 1967, 'England', ['LW', 'AM'], 74, 75, 1997, 30, t(7, 5, 8, 8, 5, 7)),
  q('nottm_forest', 'bohinen_nf95', 'Lars Bohinen', 1969, 'Norway', ['CM', 'AM'], 76, 78, 1997, 30, t(8, 5, 8, 7, 5, 8)),
  q('nottm_forest', 'roy_nf95', 'Bryan Roy', 1970, 'Netherlands', ['LW', 'AM'], 78, 80, 1998, 30, t(6, 7, 8, 6, 6, 8)),
  q('nottm_forest', 'campbell_nf95', 'Kevin Campbell', 1970, 'England', ['ST'], 76, 78, 1999, 30, t(8, 6, 8, 8, 5, 8)),
];

// ── West Ham United, 1995-96 (Redknapp's side; Dicks the cult hero) ───────────
const WEST_HAM_95: CuratedSeed[] = [
  q('west_ham', 'miklosko_wh95', 'Ludek Miklosko', 1961, 'Czechia', ['GK'], 76, 76, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_ham', 'dicks_wh95', 'Julian Dicks', 1968, 'England', ['LB'], 76, 78, 1998, 35, t(6, 7, 8, 9, 7, 7), { loyalty: 88 }),
  q('west_ham', 'rieper_wh95', 'Marc Rieper', 1968, 'Denmark', ['CB'], 76, 78, 1998, 30, t(9, 5, 8, 8, 5, 7)),
  q('west_ham', 'potts_wh95', 'Steve Potts', 1967, 'England', ['CB', 'RB'], 73, 74, 1997, 30, t(9, 5, 8, 9, 5, 7)),
  q('west_ham', 'bishop_wh95', 'Ian Bishop', 1965, 'England', ['CM', 'AM'], 74, 75, 1997, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'moncur_wh95', 'John Moncur', 1966, 'England', ['CM'], 72, 73, 1998, 30, t(7, 5, 8, 7, 6, 7)),
  q('west_ham', 'hughes_m_wh95', 'Michael Hughes', 1971, 'Northern Ireland', ['LW', 'CM'], 73, 76, 1998, 30, t(7, 5, 8, 7, 5, 8)),
  q('west_ham', 'cottee_wh95', 'Tony Cottee', 1965, 'England', ['ST'], 75, 76, 1998, 30, t(8, 6, 8, 8, 5, 7)),
  q('west_ham', 'dowie_wh95', 'Iain Dowie', 1965, 'Northern Ireland', ['ST'], 71, 72, 1997, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Middlesbrough, 1995-96 (Robson's promoted side; Juninho arrives) ──────────
const MIDDLESBROUGH_95: CuratedSeed[] = [
  q('middlesbrough', 'walsh_mi95', 'Gary Walsh', 1968, 'England', ['GK'], 73, 74, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'pearson_mi95', 'Nigel Pearson', 1963, 'England', ['CB'], 74, 74, 1997, 30, t(9, 5, 8, 9, 5, 7)),
  q('middlesbrough', 'vickers_mi95', 'Steve Vickers', 1967, 'England', ['CB'], 73, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'cox_n_mi95', 'Neil Cox', 1971, 'England', ['RB', 'CB'], 72, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'juninho_mi95', 'Juninho', 1973, 'Brazil', ['AM'], 80, 84, 1999, 30, t(8, 6, 8, 8, 5, 8)),
  q('middlesbrough', 'barmby_mi95', 'Nick Barmby', 1974, 'England', ['AM'], 76, 80, 1999, 30, t(8, 6, 8, 7, 5, 8)),
  q('middlesbrough', 'fjortoft_mi95', 'Jan Åge Fjørtoft', 1967, 'Norway', ['ST'], 74, 76, 1998, 30, t(7, 6, 8, 7, 5, 8)),
  q('middlesbrough', 'hignett_mi95', 'Craig Hignett', 1970, 'England', ['AM', 'ST'], 73, 75, 1998, 30, t(7, 6, 8, 7, 5, 7)),
  q('middlesbrough', 'mustoe_mi95', 'Robbie Mustoe', 1968, 'England', ['CM', 'DM'], 72, 73, 1998, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Leeds United, 1995-96 (Wilkinson's side; Yeboah's thunderbolts) ───────────
const LEEDS_95: CuratedSeed[] = [
  q('leeds', 'lukic_le95', 'John Lukic', 1960, 'England', ['GK'], 75, 75, 1997, 30, t(9, 5, 8, 9, 5, 7)),
  q('leeds', 'kelly_g_le95', 'Gary Kelly', 1974, 'Ireland', ['RB'], 76, 79, 1999, 30, t(8, 5, 8, 8, 5, 8)),
  q('leeds', 'radebe_le95', 'Lucas Radebe', 1969, 'South Africa', ['CB', 'DM'], 77, 80, 1999, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('leeds', 'dorigo_le95', 'Tony Dorigo', 1965, 'England', ['LB'], 75, 76, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('leeds', 'palmer_c_le95', 'Carlton Palmer', 1965, 'England', ['DM', 'CM'], 74, 75, 1997, 30, t(7, 5, 8, 8, 5, 7)),
  q('leeds', 'mcallister_le95', 'Gary McAllister', 1964, 'Scotland', ['CM', 'AM'], 80, 81, 1997, 30, t(9, 6, 8, 8, 5, 8)),
  q('leeds', 'speed_le95', 'Gary Speed', 1969, 'Wales', ['CM', 'LW'], 78, 80, 1998, 30, t(9, 5, 8, 8, 4, 8)),
  q('leeds', 'yeboah_le95', 'Tony Yeboah', 1966, 'Ghana', ['ST'], 80, 82, 1998, 30, t(7, 7, 8, 7, 6, 8)),
  q('leeds', 'brolin_le95', 'Tomas Brolin', 1969, 'Sweden', ['AM', 'ST'], 76, 80, 1998, 35, t(4, 8, 7, 6, 7, 7)),
  q('leeds', 'wallace_r_le95', 'Rod Wallace', 1969, 'England', ['ST', 'LW'], 75, 77, 1998, 30, t(8, 5, 8, 8, 5, 8)),
];

// ── Wimbledon, 1995-96 (the Crazy Gang; Vinnie's enforcers) ───────────────────
const WIMBLEDON_95: CuratedSeed[] = [
  q('wimbledon', 'heald_wi95', 'Paul Heald', 1968, 'England', ['GK'], 71, 72, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('wimbledon', 'cunningham_wi95', 'Kenny Cunningham', 1971, 'Ireland', ['CB', 'RB'], 75, 78, 1999, 30, t(9, 5, 8, 8, 5, 7)),
  q('wimbledon', 'kimble_wi95', 'Alan Kimble', 1966, 'England', ['LB'], 70, 71, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('wimbledon', 'jones_v_wi95', 'Vinnie Jones', 1965, 'Wales', ['DM', 'CM'], 72, 73, 1997, 30, t(6, 7, 8, 8, 8, 7)),
  q('wimbledon', 'earle_wi95', 'Robbie Earle', 1965, 'Jamaica', ['CM', 'AM'], 74, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('wimbledon', 'leonhardsen_wi95', 'Øyvind Leonhardsen', 1970, 'Norway', ['CM'], 76, 79, 1998, 30, t(8, 5, 8, 7, 5, 8)),
  q('wimbledon', 'gayle_wi95', 'Marcus Gayle', 1970, 'Jamaica', ['LW', 'ST'], 72, 74, 1998, 30, t(7, 5, 8, 7, 5, 7)),
  q('wimbledon', 'ekoku_wi95', 'Efan Ekoku', 1967, 'Nigeria', ['ST'], 74, 76, 1998, 30, t(7, 6, 8, 7, 5, 8)),
  q('wimbledon', 'holdsworth_wi95', 'Dean Holdsworth', 1968, 'England', ['ST'], 73, 74, 1998, 30, t(7, 6, 8, 7, 5, 7)),
];

// ── Sheffield Wednesday, 1995-96 (Waddle's craft) ─────────────────────────────
const SHEFFIELD_WEDNESDAY_95: CuratedSeed[] = [
  q('sheffield_wednesday', 'pressman_sw95', 'Kevin Pressman', 1967, 'England', ['GK'], 73, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'walker_d_sw95', 'Des Walker', 1965, 'England', ['CB'], 76, 76, 1998, 30, t(9, 5, 8, 8, 4, 7)),
  q('sheffield_wednesday', 'nolan_sw95', 'Ian Nolan', 1970, 'Northern Ireland', ['LB', 'RB'], 72, 74, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'sheridan_sw95', 'John Sheridan', 1964, 'Ireland', ['CM'], 74, 75, 1997, 30, t(8, 5, 8, 8, 5, 8)),
  q('sheffield_wednesday', 'waddle_sw95', 'Chris Waddle', 1960, 'England', ['AM', 'LW'], 79, 79, 1997, 30, t(7, 7, 8, 8, 5, 8)),
  q('sheffield_wednesday', 'bright_sw95', 'Mark Bright', 1962, 'England', ['ST'], 73, 73, 1997, 30, t(8, 6, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'hirst_sw95', 'David Hirst', 1967, 'England', ['ST'], 75, 77, 1997, 35, t(7, 6, 8, 8, 6, 7)),
  q('sheffield_wednesday', 'degryse_sw95', 'Marc Degryse', 1965, 'Belgium', ['AM', 'ST'], 76, 77, 1997, 30, t(8, 6, 8, 7, 5, 8)),
  q('sheffield_wednesday', 'whittingham_sw95', 'Guy Whittingham', 1964, 'England', ['ST'], 72, 73, 1997, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Coventry City, 1995-96 (Big Ron's escape artists; Ndlovu's flair) ─────────
const COVENTRY_95: CuratedSeed[] = [
  q('coventry', 'ogrizovic_co95', 'Steve Ogrizovic', 1957, 'England', ['GK'], 73, 73, 1997, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('coventry', 'borrows_co95', 'Brian Borrows', 1960, 'England', ['RB', 'CB'], 71, 71, 1997, 30, t(8, 5, 8, 9, 5, 7)),
  q('coventry', 'williams_p_co95', 'Paul Williams', 1971, 'England', ['CB'], 72, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('coventry', 'richardson_k_co95', 'Kevin Richardson', 1962, 'England', ['CM', 'DM'], 74, 74, 1997, 30, t(9, 5, 8, 8, 4, 7)),
  q('coventry', 'dublin_co95', 'Dion Dublin', 1969, 'England', ['ST', 'CB'], 77, 79, 1998, 30, t(8, 6, 8, 8, 5, 8)),
  q('coventry', 'ndlovu_co95', 'Peter Ndlovu', 1973, 'Zimbabwe', ['LW', 'ST'], 75, 78, 1998, 30, t(6, 7, 8, 7, 6, 8)),
  q('coventry', 'whelan_co95', 'Noel Whelan', 1974, 'England', ['ST', 'AM'], 73, 77, 1999, 30, t(6, 6, 8, 7, 6, 7)),
  q('coventry', 'salako_co95', 'John Salako', 1969, 'England', ['LW', 'RW'], 72, 74, 1998, 30, t(7, 5, 8, 7, 5, 8)),
  q('coventry', 'busst_co95', 'David Busst', 1967, 'England', ['CB'], 70, 71, 1998, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Southampton, 1995-96 top-up (Le Tissier already curated) ──────────────────
const SOUTHAMPTON_95: CuratedSeed[] = [
  q('southampton', 'beasant_so95', 'Dave Beasant', 1959, 'England', ['GK'], 74, 74, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'monkou_so95', 'Ken Monkou', 1964, 'Netherlands', ['CB'], 74, 75, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'dodd_so95', 'Jason Dodd', 1970, 'England', ['RB'], 73, 76, 1998, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('southampton', 'benali_so95', 'Francis Benali', 1968, 'England', ['LB'], 70, 71, 1998, 30, t(8, 5, 8, 10, 6, 7), { loyalty: 92 }),
  q('southampton', 'magilton_so95', 'Jim Magilton', 1969, 'Northern Ireland', ['CM', 'AM'], 74, 76, 1998, 30, t(8, 5, 8, 8, 5, 8)),
  q('southampton', 'shipperley_so95', 'Neil Shipperley', 1974, 'England', ['ST'], 72, 76, 1999, 30, t(7, 6, 8, 7, 5, 7)),
  q('southampton', 'watson_g_so95', 'Gordon Watson', 1971, 'England', ['ST'], 71, 73, 1998, 30, t(7, 6, 8, 7, 5, 7)),
  q('southampton', 'venison_so95', 'Barry Venison', 1964, 'England', ['RB', 'DM'], 73, 73, 1997, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Queens Park Rangers, 1995-96 (Sinclair's emergence) ───────────────────────
const QPR_95: CuratedSeed[] = [
  q('qpr', 'roberts_t_qpr95', 'Tony Roberts', 1969, 'Wales', ['GK'], 71, 72, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('qpr', 'mcdonald_qpr95', 'Alan McDonald', 1963, 'Northern Ireland', ['CB'], 73, 73, 1997, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('qpr', 'maddix_qpr95', 'Danny Maddix', 1967, 'England', ['CB'], 71, 72, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('qpr', 'bardsley_qpr95', 'David Bardsley', 1964, 'England', ['RB'], 72, 72, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('qpr', 'holloway_qpr95', 'Ian Holloway', 1963, 'England', ['CM', 'DM'], 72, 73, 1997, 30, t(8, 5, 8, 8, 6, 7)),
  q('qpr', 'barker_qpr95', 'Simon Barker', 1964, 'England', ['CM', 'AM'], 72, 73, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('qpr', 'sinclair_t_qpr95', 'Trevor Sinclair', 1973, 'England', ['RW', 'RB'], 76, 81, 1999, 30, t(8, 6, 8, 8, 5, 8)),
  q('qpr', 'gallen_qpr95', 'Kevin Gallen', 1975, 'England', ['ST'], 72, 78, 1999, 30, t(7, 6, 8, 8, 5, 7)),
  q('qpr', 'impey_qpr95', 'Andy Impey', 1971, 'England', ['RW', 'RB'], 73, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Bolton Wanderers, 1995-96 (promoted; Curcic's flair) ──────────────────────
const BOLTON_95: CuratedSeed[] = [
  q('bolton', 'branagan_bo95', 'Keith Branagan', 1966, 'Ireland', ['GK'], 72, 73, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'bergsson_bo95', 'Gudni Bergsson', 1965, 'Iceland', ['CB', 'RB'], 74, 75, 1998, 30, t(9, 5, 8, 8, 5, 7)),
  q('bolton', 'stubbs_bo95', 'Alan Stubbs', 1971, 'England', ['CB'], 75, 79, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'fairclough_bo95', 'Chris Fairclough', 1964, 'England', ['CB'], 72, 72, 1997, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'curcic_bo95', 'Saša Ćurčić', 1972, 'Serbia', ['AM', 'LW'], 76, 79, 1998, 30, t(5, 7, 8, 6, 7, 8)),
  q('bolton', 'mcginlay_bo95', 'John McGinlay', 1964, 'Scotland', ['ST'], 74, 75, 1998, 30, t(7, 6, 8, 8, 5, 7)),
  q('bolton', 'blake_n_bo95', 'Nathan Blake', 1972, 'Wales', ['ST'], 73, 76, 1998, 30, t(7, 6, 8, 7, 5, 7)),
  q('bolton', 'thompson_a_bo95', 'Alan Thompson', 1973, 'England', ['LW', 'CM'], 73, 77, 1999, 30, t(7, 5, 8, 7, 5, 8)),
  q('bolton', 'green_s_bo95', 'Scott Green', 1970, 'England', ['RB', 'CM'], 70, 72, 1998, 30, t(8, 5, 8, 8, 5, 7)),
];

/** The domestic mid-tier of the 1995-96 PL — real squad players at the non-elite
 *  clubs. Merged by CONCATENATION into LIVERPOOL_1995_SQUADS. */
export const ENG_DOMESTIC_1995_SQUADS: Record<string, CuratedSeed[]> = {
  aston_villa: ASTON_VILLA_95,
  everton: EVERTON_95,
  nottm_forest: NOTTM_FOREST_95,
  west_ham: WEST_HAM_95,
  middlesbrough: MIDDLESBROUGH_95,
  leeds: LEEDS_95,
  wimbledon: WIMBLEDON_95,
  sheffield_wednesday: SHEFFIELD_WEDNESDAY_95,
  coventry: COVENTRY_95,
  southampton: SOUTHAMPTON_95,
  qpr: QPR_95,
  bolton: BOLTON_95,
};
