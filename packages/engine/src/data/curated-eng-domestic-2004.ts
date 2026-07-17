/**
 * Curated domestic mid-tier — 2004-05 Premier League (M12 shortlist supply).
 *
 * Real 2004-05 squad players at the modelled PL's non-elite clubs for the
 * arsenal-2004 world. HIDDEN designer estimates (§7); real clubs, birth years,
 * positions, contracts. Injury proneness at the population norm (~30). Names
 * already curated in the world are omitted.
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

const BOLTON_04: CuratedSeed[] = [
  q('bolton', 'jaaskelainen_bo04', 'Jussi Jääskeläinen', 1975, 'Finland', ['GK'], 79, 82, 2008, 30, t(9, 5, 8, 8, 4, 8)),
  q('bolton', 'jaidi_bo04', 'Radhi Jaïdi', 1975, 'Tunisia', ['CB'], 75, 77, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'campo_bo04', 'Iván Campo', 1974, 'Spain', ['DM', 'CB'], 77, 79, 2006, 30, t(7, 6, 8, 7, 6, 8)),
  q('bolton', 'gardner_bo04', 'Ricardo Gardner', 1978, 'Jamaica', ['LB', 'LW'], 74, 77, 2007, 30, t(7, 5, 8, 7, 5, 8)),
  q('bolton', 'speed_bo04', 'Gary Speed', 1969, 'Wales', ['CM', 'DM'], 76, 77, 2006, 30, t(9, 5, 8, 8, 4, 8)),
  q('bolton', 'hierro_bo04', 'Fernando Hierro', 1968, 'Spain', ['CB', 'DM'], 77, 78, 2005, 30, t(9, 6, 8, 8, 5, 8)),
  q('bolton', 'okocha_bo04', 'Jay-Jay Okocha', 1973, 'Nigeria', ['AM', 'RW'], 79, 80, 2006, 30, t(6, 8, 8, 7, 6, 8)),
  q('bolton', 'stelios_bo04', 'Stelios Giannakopoulos', 1974, 'Greece', ['RW', 'AM'], 76, 78, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'davies_k_bo04', 'Kevin Davies', 1977, 'England', ['ST'], 76, 79, 2007, 30, t(7, 6, 8, 8, 5, 8)),
];

const MIDDLESBROUGH_04: CuratedSeed[] = [
  q('middlesbrough', 'schwarzer_mi04', 'Mark Schwarzer', 1972, 'Australia', ['GK'], 79, 81, 2007, 30, t(9, 5, 8, 8, 4, 8)),
  q('middlesbrough', 'southgate_mi04', 'Gareth Southgate', 1970, 'England', ['CB'], 78, 79, 2006, 30, t(9, 5, 8, 8, 4, 8)),
  q('middlesbrough', 'queudrue_mi04', 'Franck Queudrue', 1978, 'France', ['LB', 'CB'], 75, 79, 2007, 30, t(7, 6, 8, 7, 6, 8)),
  q('middlesbrough', 'boateng_mi04', 'George Boateng', 1975, 'Netherlands', ['CM', 'DM'], 77, 80, 2007, 30, t(8, 6, 8, 7, 5, 8)),
  q('middlesbrough', 'zenden_mi04', 'Bolo Zenden', 1976, 'Netherlands', ['LW', 'AM'], 77, 79, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('middlesbrough', 'mendieta_mi04', 'Gaizka Mendieta', 1974, 'Spain', ['AM', 'CM'], 78, 80, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('middlesbrough', 'downing_mi04', 'Stewart Downing', 1984, 'England', ['LW'], 74, 83, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('middlesbrough', 'hasselbaink_mi04', 'Jimmy Floyd Hasselbaink', 1972, 'Netherlands', ['ST'], 78, 79, 2006, 30, t(7, 7, 8, 6, 6, 8)),
  q('middlesbrough', 'job_mi04', 'Joseph-Désiré Job', 1977, 'Cameroon', ['ST', 'RW'], 73, 76, 2006, 30, t(7, 6, 8, 7, 5, 8)),
];

const ASTON_VILLA_04: CuratedSeed[] = [
  q('aston_villa', 'sorensen_av04', 'Thomas Sørensen', 1976, 'Denmark', ['GK'], 79, 82, 2008, 30, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'mellberg_av04', 'Olof Mellberg', 1977, 'Sweden', ['CB'], 80, 82, 2007, 30, t(9, 5, 8, 8, 5, 8)),
  q('aston_villa', 'barry_av04', 'Gareth Barry', 1981, 'England', ['LB', 'CM'], 79, 86, 2008, 30, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'delaney_av04', 'Mark Delaney', 1976, 'Wales', ['RB'], 73, 75, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'mccann_av04', 'Gavin McCann', 1978, 'England', ['CM', 'DM'], 75, 79, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'solano_av04', 'Nolberto Solano', 1974, 'Peru', ['RW', 'AM'], 77, 79, 2006, 30, t(8, 6, 8, 8, 5, 8)),
  q('aston_villa', 'hitzlsperger_av04', 'Thomas Hitzlsperger', 1982, 'Germany', ['CM', 'DM'], 76, 82, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('aston_villa', 'angel_av04', 'Juan Pablo Ángel', 1975, 'Colombia', ['ST'], 78, 81, 2007, 30, t(8, 6, 8, 7, 5, 8)),
  q('aston_villa', 'vassell_av04', 'Darius Vassell', 1980, 'England', ['ST'], 75, 79, 2007, 30, t(7, 6, 8, 7, 5, 8)),
];

const CHARLTON_04: CuratedSeed[] = [
  q('charlton', 'kiely_ch04', 'Dean Kiely', 1970, 'Ireland', ['GK'], 76, 77, 2006, 30, t(9, 5, 8, 8, 5, 7)),
  q('charlton', 'hreidarsson_ch04', 'Hermann Hreiðarsson', 1974, 'Iceland', ['CB', 'LB'], 74, 76, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('charlton', 'el_karkouri_ch04', 'Talal El Karkouri', 1976, 'Morocco', ['CB', 'DM'], 74, 76, 2007, 30, t(7, 6, 8, 7, 6, 8)),
  q('charlton', 'young_l_ch04', 'Luke Young', 1979, 'England', ['RB'], 76, 80, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('charlton', 'murphy_d_ch04', 'Danny Murphy', 1977, 'England', ['CM', 'AM'], 78, 80, 2007, 30, t(8, 6, 8, 8, 5, 8)),
  q('charlton', 'holland_ch04', 'Matt Holland', 1974, 'Ireland', ['CM'], 74, 76, 2006, 30, t(9, 5, 8, 8, 4, 8)),
  q('charlton', 'kishishev_ch04', 'Radostin Kishishev', 1974, 'Bulgaria', ['DM', 'RB'], 73, 75, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('charlton', 'thomas_j_ch04', 'Jerome Thomas', 1983, 'England', ['LW'], 73, 79, 2008, 30, t(6, 6, 8, 7, 6, 8)),
  q('charlton', 'johansson_ch04', 'Jonatan Johansson', 1975, 'Finland', ['ST'], 73, 75, 2006, 30, t(7, 6, 8, 7, 5, 8)),
];

const BIRMINGHAM_04: CuratedSeed[] = [
  q('birmingham', 'maik_taylor_bi04', 'Maik Taylor', 1971, 'Northern Ireland', ['GK'], 76, 78, 2007, 30, t(9, 5, 8, 8, 5, 7)),
  q('birmingham', 'cunningham_bi04', 'Kenny Cunningham', 1971, 'Ireland', ['CB', 'RB'], 74, 75, 2006, 30, t(9, 5, 8, 8, 5, 7)),
  q('birmingham', 'upson_bi04', 'Matthew Upson', 1979, 'England', ['CB'], 77, 82, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('birmingham', 'melchiot_bi04', 'Mario Melchiot', 1976, 'Netherlands', ['RB'], 76, 78, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('birmingham', 'clapham_bi04', 'Jamie Clapham', 1975, 'England', ['LB', 'LW'], 73, 75, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('birmingham', 'johnson_d_bi04', 'Damien Johnson', 1978, 'Northern Ireland', ['CM', 'DM'], 73, 76, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('birmingham', 'izzet_bi04', 'Muzzy Izzet', 1974, 'Turkey', ['CM', 'AM'], 75, 78, 2006, 30, t(8, 5, 8, 8, 5, 8)),
  q('birmingham', 'heskey_bi04', 'Emile Heskey', 1978, 'England', ['ST'], 77, 82, 2008, 30, t(8, 6, 8, 8, 5, 8)),
  q('birmingham', 'forssell_bi04', 'Mikael Forssell', 1981, 'Finland', ['ST'], 76, 80, 2007, 30, t(7, 6, 8, 7, 5, 8)),
];

const FULHAM_04: CuratedSeed[] = [
  q('fulham', 'vandersar_fu04', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 84, 84, 2006, 30, t(9, 5, 8, 8, 3, 8)),
  q('fulham', 'volz_fu04', 'Moritz Volz', 1983, 'Germany', ['RB'], 73, 79, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('fulham', 'knight_z_fu04', 'Zat Knight', 1980, 'England', ['CB'], 74, 79, 2008, 30, t(8, 5, 8, 8, 5, 7)),
  q('fulham', 'bocanegra_fu04', 'Carlos Bocanegra', 1979, 'United States', ['CB', 'LB'], 75, 79, 2008, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'diop_fu04', 'Papa Bouba Diop', 1978, 'Senegal', ['DM', 'CM'], 77, 80, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('fulham', 'radzinski_fu04', 'Tomasz Radzinski', 1973, 'Canada', ['ST', 'LW'], 75, 77, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('fulham', 'boa_morte_fu04', 'Luís Boa Morte', 1977, 'Portugal', ['LW', 'ST'], 77, 80, 2007, 30, t(6, 7, 8, 7, 6, 8)),
  q('fulham', 'mcbride_fu04', 'Brian McBride', 1972, 'United States', ['ST'], 75, 77, 2007, 30, t(8, 6, 8, 8, 5, 8)),
  q('fulham', 'john_c_fu04', 'Collins John', 1985, 'Netherlands', ['ST'], 72, 80, 2008, 30, t(6, 6, 8, 7, 6, 8)),
];

const NEWCASTLE_04: CuratedSeed[] = [
  q('newcastle', 'given_nu04', 'Shay Given', 1976, 'Ireland', ['GK'], 80, 84, 2007, 30, t(9, 5, 8, 8, 4, 8)),
  q('newcastle', 'bramble_nu04', 'Titus Bramble', 1981, 'England', ['CB'], 74, 80, 2008, 30, t(6, 6, 8, 7, 6, 7)),
  q('newcastle', 'obrien_a_nu04', 'Andy O’Brien', 1979, 'Ireland', ['CB'], 74, 79, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('newcastle', 'carr_nu04', 'Stephen Carr', 1976, 'Ireland', ['RB'], 78, 80, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('newcastle', 'butt_nu04', 'Nicky Butt', 1975, 'England', ['CM', 'DM'], 77, 79, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('newcastle', 'jenas_nu04', 'Jermaine Jenas', 1983, 'England', ['CM'], 77, 84, 2008, 30, t(8, 6, 8, 7, 5, 8)),
  q('newcastle', 'robert_nu04', 'Laurent Robert', 1975, 'France', ['LW'], 77, 79, 2006, 30, t(5, 7, 8, 6, 7, 8)),
  q('newcastle', 'kluivert_nu04', 'Patrick Kluivert', 1976, 'Netherlands', ['ST'], 80, 82, 2006, 30, t(6, 8, 8, 6, 6, 8)),
];

const BLACKBURN_04: CuratedSeed[] = [
  q('blackburn', 'friedel_bl04', 'Brad Friedel', 1971, 'United States', ['GK'], 80, 82, 2007, 30, t(9, 5, 8, 8, 4, 8)),
  q('blackburn', 'neill_bl04', 'Lucas Neill', 1978, 'Australia', ['RB', 'CB'], 76, 80, 2007, 30, t(8, 5, 8, 7, 6, 8)),
  q('blackburn', 'nelsen_bl04', 'Ryan Nelsen', 1977, 'New Zealand', ['CB'], 76, 79, 2007, 30, t(9, 5, 8, 8, 5, 8)),
  q('blackburn', 'matteo_bl04', 'Dominic Matteo', 1974, 'Scotland', ['CB', 'LB'], 74, 75, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('blackburn', 'tugay_bl04', 'Tugay Kerimoğlu', 1970, 'Turkey', ['CM', 'DM'], 78, 79, 2006, 30, t(8, 6, 8, 7, 5, 8)),
  q('blackburn', 'reid_s_bl04', 'Steven Reid', 1981, 'Ireland', ['CM', 'RW'], 74, 78, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('blackburn', 'emerton_bl04', 'Brett Emerton', 1979, 'Australia', ['RW', 'RB'], 77, 81, 2008, 30, t(8, 5, 8, 7, 5, 8)),
  q('blackburn', 'pedersen_m_bl04', 'Morten Gamst Pedersen', 1981, 'Norway', ['LW'], 75, 80, 2008, 30, t(8, 5, 8, 7, 5, 8)),
  q('blackburn', 'dickov_bl04', 'Paul Dickov', 1972, 'Scotland', ['ST'], 72, 74, 2006, 30, t(7, 6, 8, 8, 6, 7)),
];

const PORTSMOUTH_04: CuratedSeed[] = [
  q('portsmouth', 'chalkias_po04', 'Kostas Chalkias', 1974, 'Greece', ['GK'], 72, 74, 2006, 30, t(7, 6, 8, 7, 6, 7)),
  q('portsmouth', 'de_zeeuw_po04', 'Arjan De Zeeuw', 1970, 'Netherlands', ['CB'], 74, 75, 2006, 30, t(9, 5, 8, 8, 5, 7)),
  q('portsmouth', 'primus_po04', 'Linvoy Primus', 1973, 'England', ['CB'], 73, 74, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('portsmouth', 'stefanovic_po04', 'Dejan Stefanović', 1974, 'Serbia', ['CB'], 74, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('portsmouth', 'taylor_m_po04', 'Matthew Taylor', 1981, 'England', ['LB', 'LW'], 75, 80, 2008, 30, t(8, 5, 8, 8, 5, 8)),
  q('portsmouth', 'faye_po04', 'Amdy Faye', 1977, 'Senegal', ['DM', 'CM'], 74, 76, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('portsmouth', 'berger_po04', 'Patrik Berger', 1973, 'Czechia', ['AM', 'LW'], 75, 77, 2006, 35, t(7, 5, 8, 6, 5, 8)),
  q('portsmouth', 'yakubu_po04', 'Yakubu', 1982, 'Nigeria', ['ST'], 78, 83, 2008, 30, t(6, 7, 8, 7, 6, 8)),
  q('portsmouth', 'lua_lua_po04', 'Lomana LuaLua', 1980, 'DR Congo', ['LW', 'ST'], 73, 78, 2007, 30, t(5, 7, 8, 6, 7, 8)),
];

const WEST_BROM_04: CuratedSeed[] = [
  q('west_brom', 'hoult_wb04', 'Russell Hoult', 1972, 'England', ['GK'], 73, 75, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_brom', 'gaardsoe_wb04', 'Thomas Gaardsøe', 1979, 'Denmark', ['CB'], 73, 77, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_brom', 'purse_wb04', 'Darren Purse', 1977, 'England', ['CB'], 72, 74, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_brom', 'clement_wb04', 'Neil Clement', 1978, 'England', ['LB', 'CB'], 72, 74, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_brom', 'greening_wb04', 'Jonathan Greening', 1979, 'England', ['RW', 'CM'], 74, 78, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_brom', 'koumas_wb04', 'Jason Koumas', 1979, 'Wales', ['AM', 'CM'], 76, 80, 2007, 30, t(6, 6, 8, 7, 6, 8)),
  q('west_brom', 'gera_wb04', 'Zoltán Gera', 1979, 'Hungary', ['AM', 'LW'], 75, 79, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('west_brom', 'earnshaw_wb04', 'Robert Earnshaw', 1981, 'Wales', ['ST'], 74, 78, 2007, 30, t(7, 6, 8, 7, 5, 8)),
  q('west_brom', 'kanu_wb04', 'Nwankwo Kanu', 1976, 'Nigeria', ['ST', 'AM'], 74, 76, 2006, 30, t(6, 7, 8, 7, 5, 8)),
];

const CRYSTAL_PALACE_04: CuratedSeed[] = [
  q('crystal_palace', 'kiraly_cp04', 'Gábor Király', 1976, 'Hungary', ['GK'], 74, 76, 2006, 30, t(8, 5, 8, 7, 6, 7)),
  q('crystal_palace', 'popovic_cp04', 'Tony Popovic', 1973, 'Australia', ['CB'], 73, 75, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('crystal_palace', 'hall_f_cp04', 'Fitz Hall', 1980, 'England', ['CB', 'RB'], 73, 77, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('crystal_palace', 'granville_cp04', 'Danny Granville', 1975, 'England', ['LB'], 72, 73, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('crystal_palace', 'riihilahti_cp04', 'Aki Riihilahti', 1976, 'Finland', ['CM', 'DM'], 73, 75, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('crystal_palace', 'routledge_cp04', 'Wayne Routledge', 1985, 'England', ['RW', 'LW'], 72, 80, 2008, 30, t(7, 6, 8, 7, 6, 8)),
  q('crystal_palace', 'hughes_m_cp04', 'Michael Hughes', 1971, 'Northern Ireland', ['CM', 'LW'], 72, 73, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('crystal_palace', 'a_johnson_cp04', 'Andrew Johnson', 1981, 'England', ['ST'], 76, 82, 2007, 30, t(8, 6, 8, 8, 5, 8)),
  q('crystal_palace', 'freedman_cp04', 'Dougie Freedman', 1974, 'Scotland', ['ST'], 72, 73, 2006, 30, t(7, 6, 8, 8, 5, 7)),
];

const NORWICH_04: CuratedSeed[] = [
  q('norwich', 'green_r_no04', 'Robert Green', 1980, 'England', ['GK'], 76, 82, 2008, 30, t(9, 5, 8, 8, 5, 8)),
  q('norwich', 'fleming_c_no04', 'Craig Fleming', 1971, 'England', ['CB'], 72, 73, 2006, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('norwich', 'doherty_no04', 'Gary Doherty', 1980, 'Ireland', ['CB', 'ST'], 71, 74, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('norwich', 'drury_no04', 'Adam Drury', 1978, 'England', ['LB'], 72, 74, 2007, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('norwich', 'francis_d_no04', 'Damien Francis', 1979, 'Jamaica', ['CM', 'DM'], 73, 76, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('norwich', 'safri_no04', 'Youssef Safri', 1977, 'Morocco', ['DM', 'CM'], 73, 75, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('norwich', 'huckerby_no04', 'Darren Huckerby', 1976, 'England', ['LW', 'ST'], 76, 78, 2007, 30, t(6, 6, 8, 8, 6, 8)),
  q('norwich', 'ashton_no04', 'Dean Ashton', 1983, 'England', ['ST'], 75, 82, 2008, 30, t(7, 6, 8, 7, 5, 8)),
  q('norwich', 'mckenzie_no04', 'Leon McKenzie', 1978, 'England', ['ST'], 72, 74, 2007, 30, t(7, 6, 8, 7, 5, 7)),
];

const SOUTHAMPTON_04: CuratedSeed[] = [
  q('southampton', 'niemi_so04', 'Antti Niemi', 1972, 'Finland', ['GK'], 79, 81, 2007, 30, t(9, 5, 8, 8, 5, 7)),
  q('southampton', 'lundekvam_so04', 'Claus Lundekvam', 1973, 'Norway', ['CB'], 75, 77, 2007, 30, t(9, 5, 8, 8, 5, 7)),
  q('southampton', 'm_svensson_so04', 'Michael Svensson', 1975, 'Sweden', ['CB'], 74, 76, 2007, 30, t(9, 5, 8, 8, 5, 7)),
  q('southampton', 'higginbotham_so04', 'Danny Higginbotham', 1978, 'England', ['LB', 'CB'], 73, 76, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'delap_so04', 'Rory Delap', 1976, 'Ireland', ['CM', 'RB'], 73, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'a_svensson_so04', 'Anders Svensson', 1976, 'Sweden', ['AM', 'CM'], 75, 78, 2006, 30, t(8, 5, 8, 8, 5, 8)),
  q('southampton', 'prutton_so04', 'David Prutton', 1981, 'England', ['CM', 'RW'], 73, 77, 2007, 30, t(7, 5, 8, 7, 6, 8)),
  q('southampton', 'camara_h_so04', 'Henri Camara', 1977, 'Senegal', ['ST', 'LW'], 74, 78, 2007, 30, t(6, 7, 8, 6, 6, 8)),
  q('southampton', 'phillips_so04', 'Kevin Phillips', 1973, 'England', ['ST'], 78, 80, 2006, 30, t(8, 6, 8, 8, 5, 8)),
];

/** The domestic mid-tier of the 2004-05 PL. Merged by CONCATENATION into
 *  ARSENAL_2004_SQUADS. */
export const ENG_DOMESTIC_2004_SQUADS: Record<string, CuratedSeed[]> = {
  bolton: BOLTON_04,
  middlesbrough: MIDDLESBROUGH_04,
  aston_villa: ASTON_VILLA_04,
  charlton: CHARLTON_04,
  birmingham: BIRMINGHAM_04,
  fulham: FULHAM_04,
  newcastle: NEWCASTLE_04,
  blackburn: BLACKBURN_04,
  portsmouth: PORTSMOUTH_04,
  west_brom: WEST_BROM_04,
  crystal_palace: CRYSTAL_PALACE_04,
  norwich: NORWICH_04,
  southampton: SOUTHAMPTON_04,
};
