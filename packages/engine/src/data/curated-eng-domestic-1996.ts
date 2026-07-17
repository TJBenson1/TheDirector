/**
 * Curated domestic mid-tier — 1996-97 Premier League (M12 shortlist supply).
 *
 * Real 1996-97 squad players at the modelled PL's non-elite clubs, so options lists
 * in the arsenal-1996 / chelsea-1996 world read like a real shortlist. HIDDEN
 * designer estimates for ability/potential/personality (§7); real clubs, birth
 * years, positions, contracts. Injury proneness at the population norm (~30). Names
 * already curated (Le Tissier at Southampton) are omitted.
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

const ASTON_VILLA_96: CuratedSeed[] = [
  q('aston_villa', 'bosnich_av96', 'Mark Bosnich', 1972, 'Australia', ['GK'], 78, 80, 1999, 30, t(6, 7, 8, 6, 6, 8)),
  q('aston_villa', 'southgate_av96', 'Gareth Southgate', 1970, 'England', ['CB', 'DM'], 79, 82, 1999, 30, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'ehiogu_av96', 'Ugo Ehiogu', 1972, 'England', ['CB'], 78, 81, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'staunton_av96', 'Steve Staunton', 1969, 'Ireland', ['LB', 'CB'], 76, 77, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'townsend_av96', 'Andy Townsend', 1963, 'Ireland', ['CM', 'DM'], 75, 76, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'draper_av96', 'Mark Draper', 1970, 'England', ['CM'], 74, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'yorke_av96', 'Dwight Yorke', 1971, 'Trinidad', ['ST', 'AM'], 80, 85, 1999, 30, t(7, 7, 8, 7, 5, 8)),
  q('aston_villa', 'milosevic_av96', 'Savo Milošević', 1973, 'Serbia', ['ST'], 76, 80, 1999, 30, t(6, 7, 8, 6, 6, 8)),
];

const SHEFFIELD_WEDNESDAY_96: CuratedSeed[] = [
  q('sheffield_wednesday', 'pressman_sw96', 'Kevin Pressman', 1967, 'England', ['GK'], 74, 75, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'newsome_sw96', 'Jon Newsome', 1970, 'England', ['CB'], 74, 75, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'atherton_sw96', 'Peter Atherton', 1970, 'England', ['CB', 'RB'], 73, 74, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'carbone_sw96', 'Benito Carbone', 1971, 'Italy', ['AM', 'ST'], 77, 79, 1999, 30, t(5, 8, 8, 5, 7, 8)),
  q('sheffield_wednesday', 'pembridge_sw96', 'Mark Pembridge', 1970, 'Wales', ['LW', 'CM'], 74, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'booth_sw96', 'Andy Booth', 1973, 'England', ['ST'], 74, 77, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'whittingham_sw96', 'Guy Whittingham', 1964, 'England', ['ST'], 72, 73, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'humphreys_sw96', 'Ritchie Humphreys', 1977, 'England', ['LW', 'ST'], 68, 76, 2000, 30, t(7, 5, 8, 7, 5, 7)),
];

const WIMBLEDON_96: CuratedSeed[] = [
  q('wimbledon', 'sullivan_wi96', 'Neil Sullivan', 1970, 'Scotland', ['GK'], 75, 78, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('wimbledon', 'cunningham_wi96', 'Kenny Cunningham', 1971, 'Ireland', ['CB', 'RB'], 76, 79, 1999, 30, t(9, 5, 8, 8, 5, 7)),
  q('wimbledon', 'perry_wi96', 'Chris Perry', 1973, 'England', ['CB'], 74, 78, 2000, 30, t(9, 5, 8, 8, 5, 7)),
  q('wimbledon', 'jones_v_wi96', 'Vinnie Jones', 1965, 'Wales', ['DM', 'CM'], 72, 73, 1998, 30, t(6, 7, 8, 8, 8, 7)),
  q('wimbledon', 'earle_wi96', 'Robbie Earle', 1965, 'Jamaica', ['CM', 'AM'], 74, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('wimbledon', 'ardley_wi96', 'Neal Ardley', 1972, 'England', ['RW', 'CM'], 72, 75, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('wimbledon', 'ekoku_wi96', 'Efan Ekoku', 1967, 'Nigeria', ['ST'], 74, 76, 1998, 30, t(7, 6, 8, 7, 5, 8)),
  q('wimbledon', 'gayle_wi96', 'Marcus Gayle', 1970, 'Jamaica', ['LW', 'ST'], 73, 75, 1999, 30, t(7, 5, 8, 7, 5, 7)),
  q('wimbledon', 'euell_wi96', 'Jason Euell', 1977, 'Jamaica', ['ST', 'AM'], 68, 78, 2000, 30, t(7, 6, 8, 7, 5, 8)),
];

const LEICESTER_96: CuratedSeed[] = [
  q('leicester', 'keller_le96', 'Kasey Keller', 1969, 'United States', ['GK'], 76, 78, 1999, 30, t(9, 5, 8, 8, 5, 7)),
  q('leicester', 'elliott_le96', 'Matt Elliott', 1968, 'Scotland', ['CB'], 77, 78, 1999, 30, t(9, 5, 8, 8, 5, 7)),
  q('leicester', 'walsh_le96', 'Steve Walsh', 1964, 'England', ['CB'], 74, 74, 1998, 30, t(8, 5, 8, 9, 6, 7), { loyalty: 88 }),
  q('leicester', 'parker_le96', 'Garry Parker', 1965, 'England', ['CM', 'AM'], 73, 74, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'izzet_le96', 'Muzzy Izzet', 1974, 'Turkey', ['CM', 'AM'], 76, 80, 1999, 30, t(8, 5, 8, 8, 5, 8)),
  q('leicester', 'lennon_le96', 'Neil Lennon', 1971, 'Northern Ireland', ['DM', 'CM'], 75, 78, 1999, 30, t(8, 6, 8, 8, 6, 7)),
  q('leicester', 'claridge_le96', 'Steve Claridge', 1966, 'England', ['ST'], 72, 73, 1998, 30, t(7, 6, 8, 8, 5, 7)),
  q('leicester', 'heskey_le96', 'Emile Heskey', 1978, 'England', ['ST'], 73, 84, 2000, 30, t(8, 6, 8, 8, 5, 8)),
  q('leicester', 'marshall_le96', 'Ian Marshall', 1966, 'England', ['ST', 'CB'], 72, 73, 1998, 30, t(7, 6, 8, 7, 5, 7)),
];

const LEEDS_96: CuratedSeed[] = [
  q('leeds', 'martyn_le96', 'Nigel Martyn', 1966, 'England', ['GK'], 80, 82, 1999, 30, t(9, 5, 8, 8, 4, 8)),
  q('leeds', 'kelly_g_le96', 'Gary Kelly', 1974, 'Ireland', ['RB'], 76, 79, 1999, 30, t(8, 5, 8, 8, 5, 8)),
  q('leeds', 'radebe_le96', 'Lucas Radebe', 1969, 'South Africa', ['CB', 'DM'], 78, 80, 1999, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('leeds', 'wetherall_le96', 'David Wetherall', 1971, 'England', ['CB'], 74, 77, 1999, 30, t(9, 5, 8, 8, 5, 7)),
  q('leeds', 'bowyer_le96', 'Lee Bowyer', 1977, 'England', ['CM', 'AM'], 72, 82, 2001, 30, t(6, 7, 8, 7, 6, 8)),
  q('leeds', 'palmer_c_le96', 'Carlton Palmer', 1965, 'England', ['DM', 'CM'], 74, 74, 1998, 30, t(7, 5, 8, 8, 5, 7)),
  q('leeds', 'rush_le96', 'Ian Rush', 1961, 'Wales', ['ST'], 74, 74, 1998, 30, t(8, 6, 8, 8, 5, 7)),
  q('leeds', 'deane_le96', 'Brian Deane', 1968, 'England', ['ST'], 74, 75, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('leeds', 'sharpe_le96', 'Lee Sharpe', 1971, 'England', ['LW', 'LB'], 74, 78, 1999, 35, t(6, 7, 8, 7, 6, 8)),
];

const BLACKBURN_96: CuratedSeed[] = [
  q('blackburn', 'flowers_bl96', 'Tim Flowers', 1967, 'England', ['GK'], 77, 78, 1999, 30, t(8, 6, 8, 8, 5, 7)),
  q('blackburn', 'hendry_bl96', 'Colin Hendry', 1965, 'Scotland', ['CB'], 78, 79, 1999, 30, t(8, 6, 8, 9, 6, 7), { loyalty: 88 }),
  q('blackburn', 'berg_bl96', 'Henning Berg', 1969, 'Norway', ['CB', 'RB'], 77, 79, 1999, 30, t(9, 5, 8, 8, 5, 8)),
  q('blackburn', 'le_saux_bl96', 'Graeme Le Saux', 1968, 'England', ['LB'], 78, 80, 1999, 30, t(8, 6, 8, 8, 6, 8)),
  q('blackburn', 'sherwood_bl96', 'Tim Sherwood', 1969, 'England', ['CM', 'DM'], 76, 78, 1999, 30, t(8, 6, 8, 8, 5, 7)),
  q('blackburn', 'flitcroft_bl96', 'Garry Flitcroft', 1972, 'England', ['CM', 'DM'], 74, 77, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('blackburn', 'sutton_bl96', 'Chris Sutton', 1973, 'England', ['ST', 'AM'], 78, 81, 1999, 30, t(8, 6, 8, 8, 5, 8)),
  q('blackburn', 'gallacher_bl96', 'Kevin Gallacher', 1966, 'Scotland', ['ST'], 76, 77, 1999, 30, t(8, 6, 8, 8, 5, 8)),
  q('blackburn', 'duff_bl96', 'Damien Duff', 1979, 'Ireland', ['LW'], 66, 86, 2001, 30, t(8, 5, 9, 8, 5, 8)),
];

const WEST_HAM_96: CuratedSeed[] = [
  q('west_ham', 'miklosko_wh96', 'Ludek Miklosko', 1961, 'Czechia', ['GK'], 75, 75, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_ham', 'bilic_wh96', 'Slaven Bilić', 1968, 'Croatia', ['CB'], 77, 79, 1999, 30, t(8, 6, 8, 7, 6, 8)),
  q('west_ham', 'dicks_wh96', 'Julian Dicks', 1968, 'England', ['LB'], 75, 77, 1999, 35, t(6, 7, 8, 9, 7, 7), { loyalty: 88 }),
  q('west_ham', 'rieper_wh96', 'Marc Rieper', 1968, 'Denmark', ['CB'], 76, 78, 1999, 30, t(9, 5, 8, 8, 5, 7)),
  q('west_ham', 'williamson_wh96', 'Danny Williamson', 1973, 'England', ['CM'], 72, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_ham', 'hughes_m_wh96', 'Michael Hughes', 1971, 'Northern Ireland', ['LW', 'CM'], 73, 76, 1999, 30, t(7, 5, 8, 7, 5, 8)),
  q('west_ham', 'kitson_wh96', 'Paul Kitson', 1971, 'England', ['ST'], 74, 76, 1999, 30, t(7, 6, 8, 7, 5, 7)),
  q('west_ham', 'raducioiu_wh96', 'Florin Răducioiu', 1970, 'Romania', ['ST'], 74, 77, 1999, 30, t(6, 7, 8, 6, 6, 8)),
];

const EVERTON_96: CuratedSeed[] = [
  q('everton', 'southall_ev96', 'Neville Southall', 1958, 'Wales', ['GK'], 79, 79, 1998, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('everton', 'watson_d_ev96', 'Dave Watson', 1961, 'England', ['CB'], 75, 75, 1998, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('everton', 'short_ev96', 'Craig Short', 1968, 'England', ['CB'], 74, 75, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'hinchcliffe_ev96', 'Andy Hinchcliffe', 1969, 'England', ['LB'], 75, 77, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'kanchelskis_ev96', 'Andrei Kanchelskis', 1969, 'Russia', ['RW'], 79, 81, 1999, 30, t(7, 6, 8, 7, 6, 8)),
  q('everton', 'speed_ev96', 'Gary Speed', 1969, 'Wales', ['CM', 'LW'], 78, 80, 1999, 30, t(9, 5, 8, 8, 4, 8)),
  q('everton', 'barmby_ev96', 'Nick Barmby', 1974, 'England', ['AM'], 77, 80, 1999, 30, t(8, 6, 8, 7, 5, 8)),
  q('everton', 'ferguson_d_ev96', 'Duncan Ferguson', 1971, 'Scotland', ['ST'], 78, 81, 1999, 35, t(6, 7, 8, 7, 7, 7)),
  q('everton', 'stuart_ev96', 'Graham Stuart', 1970, 'England', ['AM', 'RW'], 73, 75, 1999, 30, t(8, 5, 8, 8, 5, 7)),
];

const DERBY_96: CuratedSeed[] = [
  q('derby', 'hoult_de96', 'Russell Hoult', 1972, 'England', ['GK'], 73, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('derby', 'stimac_de96', 'Igor Štimac', 1967, 'Croatia', ['CB'], 77, 78, 1999, 30, t(8, 5, 8, 7, 6, 7)),
  q('derby', 'yates_de96', 'Dean Yates', 1967, 'England', ['CB'], 72, 73, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('derby', 'powell_c_de96', 'Chris Powell', 1969, 'England', ['LB'], 74, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('derby', 'powell_d_de96', 'Darryl Powell', 1971, 'Jamaica', ['CM', 'DM'], 73, 76, 1999, 30, t(8, 5, 8, 7, 5, 8)),
  q('derby', 'asanovic_de96', 'Aljoša Asanović', 1965, 'Croatia', ['AM'], 77, 78, 1998, 30, t(6, 7, 8, 7, 5, 8)),
  q('derby', 'sturridge_de96', 'Dean Sturridge', 1973, 'England', ['ST'], 73, 76, 1999, 30, t(7, 6, 8, 7, 5, 7)),
  q('derby', 'ward_a_de96', 'Ashley Ward', 1970, 'England', ['ST'], 72, 74, 1999, 30, t(7, 6, 8, 7, 5, 7)),
];

const SOUTHAMPTON_96: CuratedSeed[] = [
  q('southampton', 'beasant_so96', 'Dave Beasant', 1959, 'England', ['GK'], 73, 73, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'lundekvam_so96', 'Claus Lundekvam', 1973, 'Norway', ['CB'], 73, 78, 2000, 30, t(9, 5, 8, 8, 5, 7)),
  q('southampton', 'dodd_so96', 'Jason Dodd', 1970, 'England', ['RB'], 74, 76, 1999, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('southampton', 'benali_so96', 'Francis Benali', 1968, 'England', ['LB'], 70, 71, 1999, 30, t(8, 5, 8, 10, 6, 7), { loyalty: 92 }),
  q('southampton', 'magilton_so96', 'Jim Magilton', 1969, 'Northern Ireland', ['CM', 'AM'], 74, 76, 1999, 30, t(8, 5, 8, 8, 5, 8)),
  q('southampton', 'berkovic_so96', 'Eyal Berkovic', 1972, 'Israel', ['AM'], 76, 80, 1999, 30, t(6, 7, 8, 6, 6, 8)),
  q('southampton', 'ostenstad_so96', 'Egil Østenstad', 1972, 'Norway', ['ST'], 74, 77, 1999, 30, t(7, 6, 8, 7, 5, 8)),
  q('southampton', 'oakley_so96', 'Matt Oakley', 1977, 'England', ['CM'], 68, 78, 2001, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
];

const COVENTRY_96: CuratedSeed[] = [
  q('coventry', 'ogrizovic_co96', 'Steve Ogrizovic', 1957, 'England', ['GK'], 72, 72, 1998, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('coventry', 'shaw_r_co96', 'Richard Shaw', 1968, 'England', ['CB', 'RB'], 73, 74, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('coventry', 'breen_co96', 'Gary Breen', 1973, 'Ireland', ['CB'], 74, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('coventry', 'burrows_co96', 'David Burrows', 1968, 'England', ['LB'], 72, 73, 1998, 30, t(8, 5, 8, 8, 5, 7)),
  q('coventry', 'telfer_co96', 'Paul Telfer', 1971, 'Scotland', ['RB', 'CM'], 73, 75, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('coventry', 'dublin_co96', 'Dion Dublin', 1969, 'England', ['ST', 'CB'], 77, 79, 1999, 30, t(8, 6, 8, 8, 5, 8)),
  q('coventry', 'huckerby_co96', 'Darren Huckerby', 1976, 'England', ['ST', 'LW'], 73, 79, 2000, 30, t(6, 6, 8, 7, 6, 8)),
  q('coventry', 'ndlovu_co96', 'Peter Ndlovu', 1973, 'Zimbabwe', ['LW', 'ST'], 74, 77, 1998, 30, t(6, 7, 8, 7, 6, 8)),
  q('coventry', 'whelan_co96', 'Noel Whelan', 1974, 'England', ['ST', 'AM'], 73, 77, 1999, 30, t(6, 6, 8, 7, 6, 7)),
];

const SUNDERLAND_96: CuratedSeed[] = [
  q('sunderland', 'perez_su96', 'Lionel Pérez', 1967, 'France', ['GK'], 72, 74, 1999, 30, t(7, 6, 8, 7, 6, 7)),
  q('sunderland', 'melville_su96', 'Andy Melville', 1968, 'Wales', ['CB'], 73, 74, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'ord_su96', 'Richard Ord', 1970, 'England', ['CB'], 72, 73, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'gray_su96', 'Michael Gray', 1974, 'England', ['LB', 'LW'], 74, 77, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'ball_k_su96', 'Kevin Ball', 1964, 'England', ['DM', 'CB'], 73, 73, 1998, 30, t(8, 5, 8, 9, 6, 7), { loyalty: 88 }),
  q('sunderland', 'bracewell_su96', 'Paul Bracewell', 1962, 'England', ['CM', 'DM'], 72, 72, 1998, 30, t(9, 5, 8, 8, 5, 7)),
  q('sunderland', 'quinn_su96', 'Niall Quinn', 1966, 'Ireland', ['ST'], 76, 78, 1999, 35, t(8, 6, 8, 8, 5, 8)),
  q('sunderland', 'stewart_p_su96', 'Paul Stewart', 1964, 'England', ['ST', 'CM'], 72, 72, 1998, 30, t(7, 6, 8, 7, 6, 7)),
];

const MIDDLESBROUGH_96: CuratedSeed[] = [
  q('middlesbrough', 'roberts_b_mi96', 'Ben Roberts', 1975, 'England', ['GK'], 70, 76, 2000, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'festa_mi96', 'Gianluca Festa', 1969, 'Italy', ['CB'], 75, 77, 1999, 30, t(8, 5, 8, 8, 6, 7)),
  q('middlesbrough', 'vickers_mi96', 'Steve Vickers', 1967, 'England', ['CB'], 73, 75, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'cox_n_mi96', 'Neil Cox', 1971, 'England', ['RB', 'CB'], 72, 75, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'fleming_mi96', 'Curtis Fleming', 1968, 'Ireland', ['RB'], 72, 73, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'juninho_mi96', 'Juninho', 1973, 'Brazil', ['AM'], 81, 84, 1999, 30, t(8, 6, 8, 8, 5, 8)),
  q('middlesbrough', 'ravanelli_mi96', 'Fabrizio Ravanelli', 1968, 'Italy', ['ST'], 80, 81, 1999, 30, t(6, 8, 9, 6, 7, 7)),
  q('middlesbrough', 'hignett_mi96', 'Craig Hignett', 1970, 'England', ['AM', 'ST'], 73, 75, 1999, 30, t(7, 6, 8, 7, 5, 7)),
  q('middlesbrough', 'mustoe_mi96', 'Robbie Mustoe', 1968, 'England', ['CM', 'DM'], 72, 73, 1999, 30, t(8, 5, 8, 8, 5, 7)),
];

const NOTTM_FOREST_96: CuratedSeed[] = [
  q('nottm_forest', 'crossley_nf96', 'Mark Crossley', 1969, 'Wales', ['GK'], 74, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('nottm_forest', 'cooper_c_nf96', 'Colin Cooper', 1967, 'England', ['CB'], 75, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('nottm_forest', 'chettle_nf96', 'Steve Chettle', 1968, 'England', ['CB'], 73, 74, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('nottm_forest', 'haaland_nf96', 'Alf-Inge Håland', 1972, 'Norway', ['DM', 'RB'], 74, 78, 1999, 30, t(8, 6, 8, 7, 6, 8)),
  q('nottm_forest', 'gemmill_nf96', 'Scot Gemmill', 1971, 'Scotland', ['CM'], 74, 76, 1999, 30, t(8, 5, 8, 8, 5, 7)),
  q('nottm_forest', 'bart_williams_nf96', 'Chris Bart-Williams', 1974, 'England', ['CM', 'AM'], 74, 78, 1999, 30, t(7, 6, 8, 7, 5, 8)),
  q('nottm_forest', 'woan_nf96', 'Ian Woan', 1967, 'England', ['LW', 'AM'], 74, 75, 1998, 30, t(7, 5, 8, 8, 5, 7)),
  q('nottm_forest', 'campbell_nf96', 'Kevin Campbell', 1970, 'England', ['ST'], 76, 78, 1999, 30, t(8, 6, 8, 8, 5, 8)),
  q('nottm_forest', 'saunders_nf96', 'Dean Saunders', 1964, 'Wales', ['ST'], 74, 75, 1998, 30, t(7, 6, 8, 7, 5, 8)),
];

/** The domestic mid-tier of the 1996-97 PL. Merged by CONCATENATION into
 *  ARSENAL_1996_SQUADS (arsenal-1996 / chelsea-1996). */
export const ENG_DOMESTIC_1996_SQUADS: Record<string, CuratedSeed[]> = {
  aston_villa: ASTON_VILLA_96,
  sheffield_wednesday: SHEFFIELD_WEDNESDAY_96,
  wimbledon: WIMBLEDON_96,
  leicester: LEICESTER_96,
  leeds: LEEDS_96,
  blackburn: BLACKBURN_96,
  west_ham: WEST_HAM_96,
  everton: EVERTON_96,
  derby: DERBY_96,
  southampton: SOUTHAMPTON_96,
  coventry: COVENTRY_96,
  sunderland: SUNDERLAND_96,
  middlesbrough: MIDDLESBROUGH_96,
  nottm_forest: NOTTM_FOREST_96,
};
