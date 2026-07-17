/**
 * Curated domestic mid-tier — 2008-09 Premier League (M12 shortlist supply).
 *
 * Real 2008-09 squad players at the modelled PL's non-elite clubs for the
 * man-city-2008 world. HIDDEN designer estimates (§7); real clubs, birth years,
 * positions, contracts. Injury proneness at the population norm (~30). Chris
 * Kirkland is Wigan's keeper this era. Names already curated are omitted.
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

const FULHAM_08: CuratedSeed[] = [
  q('fulham', 'schwarzer_fu08', 'Mark Schwarzer', 1972, 'Australia', ['GK'], 79, 80, 2011, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'hangeland_fu08', 'Brede Hangeland', 1981, 'Norway', ['CB'], 79, 82, 2012, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'hughes_a_fu08', 'Aaron Hughes', 1979, 'Northern Ireland', ['CB', 'RB'], 76, 78, 2011, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'konchesky_fu08', 'Paul Konchesky', 1981, 'England', ['LB'], 74, 77, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('fulham', 'murphy_d_fu08', 'Danny Murphy', 1977, 'England', ['CM', 'AM'], 77, 79, 2011, 30, t(8, 6, 8, 8, 5, 8)),
  q('fulham', 'bullard_fu08', 'Jimmy Bullard', 1978, 'England', ['CM', 'AM'], 75, 78, 2011, 30, t(6, 6, 8, 7, 6, 8)),
  q('fulham', 'dempsey_fu08', 'Clint Dempsey', 1983, 'United States', ['AM', 'ST'], 77, 82, 2012, 30, t(8, 6, 9, 8, 5, 8)),
  q('fulham', 'zamora_fu08', 'Bobby Zamora', 1981, 'England', ['ST'], 75, 79, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('fulham', 'a_johnson_fu08', 'Andrew Johnson', 1981, 'England', ['ST'], 75, 78, 2011, 30, t(8, 6, 8, 8, 5, 8)),
];

const WEST_HAM_08: CuratedSeed[] = [
  q('west_ham', 'green_r_wh08', 'Robert Green', 1980, 'England', ['GK'], 79, 82, 2011, 30, t(9, 5, 8, 8, 5, 8)),
  q('west_ham', 'upson_wh08', 'Matthew Upson', 1979, 'England', ['CB'], 78, 80, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'collins_j_wh08', 'James Collins', 1983, 'Wales', ['CB'], 75, 79, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'ilunga_wh08', 'Herita Ilunga', 1982, 'DR Congo', ['LB'], 73, 76, 2011, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_ham', 'parker_s_wh08', 'Scott Parker', 1980, 'England', ['CM', 'DM'], 79, 83, 2011, 30, t(9, 5, 9, 8, 5, 8)),
  q('west_ham', 'noble_wh08', 'Mark Noble', 1987, 'England', ['CM', 'DM'], 74, 82, 2012, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('west_ham', 'behrami_wh08', 'Valon Behrami', 1985, 'Switzerland', ['RW', 'CM'], 75, 80, 2012, 30, t(7, 6, 8, 7, 6, 8)),
  q('west_ham', 'cole_c_wh08', 'Carlton Cole', 1983, 'England', ['ST'], 75, 79, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('west_ham', 'collison_wh08', 'Jack Collison', 1988, 'Wales', ['CM', 'AM'], 71, 80, 2012, 30, t(8, 5, 8, 8, 5, 8)),
];

const WIGAN_08: CuratedSeed[] = [
  q('wigan', 'kirkland_wg08', 'Chris Kirkland', 1981, 'England', ['GK'], 77, 81, 2011, 35, t(8, 6, 8, 8, 5, 7)),
  q('wigan', 'bramble_wg08', 'Titus Bramble', 1981, 'England', ['CB'], 74, 78, 2011, 30, t(6, 6, 8, 7, 6, 7)),
  q('wigan', 'boyce_wg08', 'Emmerson Boyce', 1979, 'England', ['RB', 'CB'], 73, 76, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('wigan', 'figueroa_wg08', 'Maynor Figueroa', 1983, 'Honduras', ['CB', 'LB'], 74, 78, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('wigan', 'cattermole_wg08', 'Lee Cattermole', 1988, 'England', ['DM', 'CM'], 73, 80, 2012, 30, t(6, 7, 8, 7, 7, 8)),
  q('wigan', 'valencia_wg08', 'Antonio Valencia', 1985, 'Ecuador', ['RW'], 78, 84, 2011, 30, t(8, 6, 8, 8, 5, 8)),
  q('wigan', 'zaki_wg08', 'Amr Zaki', 1983, 'Egypt', ['ST'], 74, 78, 2011, 30, t(5, 7, 8, 6, 7, 8)),
  q('wigan', 'brown_m_wg08', 'Michael Brown', 1977, 'England', ['CM', 'DM'], 72, 74, 2010, 30, t(7, 6, 8, 7, 6, 7)),
];

const STOKE_08: CuratedSeed[] = [
  q('stoke', 'sorensen_st08', 'Thomas Sørensen', 1976, 'Denmark', ['GK'], 78, 80, 2011, 30, t(9, 5, 8, 8, 4, 8)),
  q('stoke', 'shawcross_st08', 'Ryan Shawcross', 1987, 'England', ['CB'], 74, 82, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'faye_a_st08', 'Abdoulaye Faye', 1978, 'Senegal', ['CB'], 75, 77, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'higginbotham_st08', 'Danny Higginbotham', 1978, 'England', ['LB', 'CB'], 73, 75, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('stoke', 'whelan_g_st08', 'Glenn Whelan', 1984, 'Ireland', ['DM', 'CM'], 73, 78, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'delap_st08', 'Rory Delap', 1976, 'Ireland', ['CM', 'RB'], 72, 74, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('stoke', 'etherington_st08', 'Matthew Etherington', 1981, 'England', ['LW'], 74, 78, 2011, 30, t(7, 5, 8, 7, 5, 8)),
  q('stoke', 'fuller_st08', 'Ricardo Fuller', 1979, 'Jamaica', ['ST'], 74, 78, 2011, 30, t(6, 7, 8, 7, 6, 8)),
  q('stoke', 'kitson_st08', 'Dave Kitson', 1980, 'England', ['ST'], 72, 75, 2011, 30, t(7, 6, 8, 7, 5, 7)),
];

const BOLTON_08: CuratedSeed[] = [
  q('bolton', 'jaaskelainen_bo08', 'Jussi Jääskeläinen', 1975, 'Finland', ['GK'], 78, 80, 2011, 30, t(9, 5, 8, 8, 4, 8)),
  q('bolton', 'cahill_bo08', 'Gary Cahill', 1985, 'England', ['CB'], 76, 85, 2012, 30, t(9, 5, 9, 8, 4, 8)),
  q('bolton', 'steinsson_bo08', 'Gretar Steinsson', 1982, 'Iceland', ['RB', 'CB'], 74, 77, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'obrien_a_bo08', 'Andy O’Brien', 1979, 'Ireland', ['CB'], 74, 76, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'nolan_bo08', 'Kevin Nolan', 1982, 'England', ['CM', 'AM'], 75, 80, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'muamba_bo08', 'Fabrice Muamba', 1988, 'England', ['DM', 'CM'], 73, 80, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'taylor_m_bo08', 'Matthew Taylor', 1981, 'England', ['LW', 'LB'], 75, 78, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'elmander_bo08', 'Johan Elmander', 1981, 'Sweden', ['ST'], 76, 79, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('bolton', 'davies_k_bo08', 'Kevin Davies', 1977, 'England', ['ST'], 75, 77, 2011, 30, t(7, 6, 8, 8, 5, 8)),
];

const PORTSMOUTH_08: CuratedSeed[] = [
  q('portsmouth', 'james_po08', 'David James', 1970, 'England', ['GK'], 78, 79, 2010, 30, t(6, 7, 8, 7, 6, 8)),
  q('portsmouth', 'campbell_s_po08', 'Sol Campbell', 1974, 'England', ['CB'], 79, 80, 2010, 30, t(8, 6, 8, 7, 5, 8)),
  q('portsmouth', 'distin_po08', 'Sylvain Distin', 1977, 'France', ['CB'], 78, 80, 2011, 30, t(9, 5, 8, 8, 5, 8)),
  q('portsmouth', 'hreidarsson_po08', 'Hermann Hreiðarsson', 1974, 'Iceland', ['LB', 'CB'], 74, 75, 2010, 30, t(8, 5, 8, 8, 5, 7)),
  q('portsmouth', 'diop_po08', 'Papa Bouba Diop', 1978, 'Senegal', ['DM', 'CM'], 76, 78, 2010, 30, t(7, 6, 8, 7, 5, 8)),
  q('portsmouth', 'kranjcar_po08', 'Niko Kranjčar', 1984, 'Croatia', ['AM', 'LW'], 77, 81, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('portsmouth', 'crouch_po08', 'Peter Crouch', 1981, 'England', ['ST'], 77, 80, 2011, 30, t(8, 5, 8, 7, 5, 8)),
  q('portsmouth', 'kanu_po08', 'Nwankwo Kanu', 1976, 'Nigeria', ['ST', 'AM'], 73, 74, 2010, 30, t(6, 7, 8, 7, 5, 8)),
];

const BLACKBURN_08: CuratedSeed[] = [
  q('blackburn', 'robinson_p_bl08', 'Paul Robinson', 1979, 'England', ['GK'], 78, 81, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('blackburn', 'samba_bl08', 'Christopher Samba', 1984, 'Congo', ['CB'], 77, 81, 2012, 30, t(8, 6, 8, 8, 6, 8)),
  q('blackburn', 'nelsen_bl08', 'Ryan Nelsen', 1977, 'New Zealand', ['CB'], 76, 78, 2011, 30, t(9, 5, 8, 8, 5, 8)),
  q('blackburn', 'warnock_bl08', 'Stephen Warnock', 1981, 'England', ['LB'], 74, 78, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('blackburn', 'dunn_bl08', 'David Dunn', 1979, 'England', ['AM', 'CM'], 75, 79, 2011, 30, t(7, 6, 8, 8, 5, 8)),
  q('blackburn', 'pedersen_m_bl08', 'Morten Gamst Pedersen', 1981, 'Norway', ['LW'], 76, 80, 2011, 30, t(8, 5, 8, 7, 5, 8)),
  q('blackburn', 'emerton_bl08', 'Brett Emerton', 1979, 'Australia', ['RW', 'RB'], 76, 79, 2011, 30, t(8, 5, 8, 7, 5, 8)),
  q('blackburn', 'mccarthy_bl08', 'Benni McCarthy', 1977, 'South Africa', ['ST'], 76, 79, 2011, 30, t(6, 7, 8, 6, 6, 8)),
  q('blackburn', 'roberts_j_bl08', 'Jason Roberts', 1978, 'Grenada', ['ST'], 73, 75, 2011, 30, t(7, 6, 8, 7, 5, 8)),
];

const SUNDERLAND_08: CuratedSeed[] = [
  q('sunderland', 'gordon_c_su08', 'Craig Gordon', 1982, 'Scotland', ['GK'], 77, 82, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('sunderland', 'collins_d_su08', 'Danny Collins', 1980, 'Wales', ['CB', 'LB'], 73, 76, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'nosworthy_su08', 'Nyron Nosworthy', 1980, 'Jamaica', ['CB', 'RB'], 72, 75, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'bardsley_su08', 'Phil Bardsley', 1985, 'Scotland', ['RB'], 73, 78, 2012, 30, t(7, 5, 8, 8, 5, 8)),
  q('sunderland', 'whitehead_su08', 'Dean Whitehead', 1982, 'England', ['CM', 'DM'], 74, 77, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('sunderland', 'richardson_k_su08', 'Kieran Richardson', 1984, 'England', ['LW', 'CM'], 75, 79, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('sunderland', 'reid_a_su08', 'Andy Reid', 1982, 'Ireland', ['AM', 'LW'], 74, 78, 2011, 30, t(6, 6, 8, 7, 5, 8)),
  q('sunderland', 'jones_ke_su08', 'Kenwyne Jones', 1984, 'Trinidad', ['ST'], 76, 81, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('sunderland', 'cisse_su08', 'Djibril Cissé', 1981, 'France', ['ST'], 77, 80, 2011, 30, t(6, 7, 8, 6, 6, 8)),
];

const HULL_08: CuratedSeed[] = [
  q('hull', 'myhill_hu08', 'Boaz Myhill', 1982, 'Wales', ['GK'], 74, 77, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('hull', 'turner_m_hu08', 'Michael Turner', 1983, 'England', ['CB'], 74, 78, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('hull', 'ricketts_s_hu08', 'Sam Ricketts', 1981, 'Wales', ['RB', 'LB'], 72, 75, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('hull', 'dawson_a_hu08', 'Andy Dawson', 1978, 'England', ['LB'], 71, 73, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('hull', 'boateng_hu08', 'George Boateng', 1975, 'Netherlands', ['CM', 'DM'], 74, 76, 2010, 30, t(8, 6, 8, 7, 5, 8)),
  q('hull', 'ashbee_hu08', 'Ian Ashbee', 1976, 'England', ['DM', 'CB'], 71, 72, 2011, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('hull', 'geovanni_hu08', 'Geovanni', 1980, 'Brazil', ['AM', 'RW'], 75, 78, 2010, 30, t(6, 7, 8, 6, 6, 8)),
  q('hull', 'barmby_hu08', 'Nick Barmby', 1974, 'England', ['AM'], 72, 73, 2010, 30, t(8, 6, 8, 8, 5, 8)),
  q('hull', 'king_m_hu08', 'Marlon King', 1980, 'Jamaica', ['ST'], 72, 75, 2011, 30, t(5, 7, 8, 6, 7, 7)),
];

const NEWCASTLE_08: CuratedSeed[] = [
  q('newcastle', 'harper_nu08', 'Steve Harper', 1975, 'England', ['GK'], 74, 75, 2011, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('newcastle', 'coloccini_nu08', 'Fabricio Coloccini', 1982, 'Argentina', ['CB'], 78, 82, 2012, 30, t(8, 6, 8, 8, 5, 8)),
  q('newcastle', 'bassong_nu08', 'Sébastien Bassong', 1986, 'Cameroon', ['CB'], 74, 80, 2012, 30, t(8, 5, 8, 7, 5, 8)),
  q('newcastle', 'enrique_nu08', 'José Enrique', 1986, 'Spain', ['LB'], 76, 82, 2012, 30, t(8, 5, 8, 7, 5, 8)),
  q('newcastle', 'barton_j_nu08', 'Joey Barton', 1982, 'England', ['CM', 'DM'], 75, 79, 2011, 30, t(4, 8, 8, 6, 8, 7)),
  q('newcastle', 'guttierrez_nu08', 'Jonás Gutiérrez', 1983, 'Argentina', ['RW', 'CM'], 75, 79, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('newcastle', 'martins_nu08', 'Obafemi Martins', 1984, 'Nigeria', ['ST'], 77, 81, 2011, 30, t(6, 7, 8, 6, 6, 8)),
  q('newcastle', 'owen_nu08', 'Michael Owen', 1979, 'England', ['ST'], 79, 81, 2009, 35, t(8, 6, 8, 7, 5, 8)),
  q('newcastle', 'viduka_nu08', 'Mark Viduka', 1975, 'Australia', ['ST'], 75, 76, 2009, 35, t(6, 7, 8, 7, 6, 8)),
];

const MIDDLESBROUGH_08: CuratedSeed[] = [
  q('middlesbrough', 'turnbull_mi08', 'Ross Turnbull', 1985, 'England', ['GK'], 72, 77, 2011, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'wheater_mi08', 'David Wheater', 1987, 'England', ['CB'], 73, 79, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('middlesbrough', 'huth_mi08', 'Robert Huth', 1984, 'Germany', ['CB'], 76, 80, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('middlesbrough', 'pogatetz_mi08', 'Emanuel Pogatetz', 1983, 'Austria', ['CB', 'LB'], 75, 78, 2011, 30, t(7, 6, 8, 7, 6, 8)),
  q('middlesbrough', 'oneil_mi08', 'Gary O’Neil', 1983, 'England', ['CM', 'AM'], 74, 78, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('middlesbrough', 'downing_mi08', 'Stewart Downing', 1984, 'England', ['LW'], 78, 83, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('middlesbrough', 'adam_johnson_mi08', 'Adam Johnson', 1987, 'England', ['RW', 'LW'], 74, 83, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('middlesbrough', 'alves_mi08', 'Afonso Alves', 1981, 'Brazil', ['ST'], 74, 78, 2011, 30, t(6, 7, 8, 6, 6, 8)),
  q('middlesbrough', 'tuncay_mi08', 'Tuncay Şanlı', 1982, 'Turkey', ['AM', 'ST'], 76, 79, 2011, 30, t(7, 6, 8, 7, 5, 8)),
];

const WEST_BROM_08: CuratedSeed[] = [
  q('west_brom', 'carson_wb08', 'Scott Carson', 1985, 'England', ['GK'], 75, 80, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'olsson_j_wb08', 'Jonas Olsson', 1983, 'Sweden', ['CB'], 74, 79, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'cech_m_wb08', 'Marek Čech', 1983, 'Slovakia', ['LB', 'LW'], 73, 76, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'greening_wb08', 'Jonathan Greening', 1979, 'England', ['CM', 'RW'], 74, 77, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'koren_wb08', 'Robert Koren', 1980, 'Slovenia', ['AM', 'CM'], 74, 77, 2011, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_brom', 'brunt_wb08', 'Chris Brunt', 1984, 'Northern Ireland', ['LW', 'CM'], 74, 79, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'miller_i_wb08', 'Ishmael Miller', 1987, 'England', ['ST'], 72, 78, 2012, 30, t(6, 6, 8, 7, 6, 7)),
  q('west_brom', 'bednar_wb08', 'Roman Bednář', 1983, 'Czechia', ['ST'], 72, 76, 2011, 30, t(6, 6, 8, 7, 6, 7)),
];

/** The domestic mid-tier of the 2008-09 PL. Merged by CONCATENATION into
 *  MANCITY_2008_SQUADS. */
export const ENG_DOMESTIC_2008_SQUADS: Record<string, CuratedSeed[]> = {
  fulham: FULHAM_08,
  west_ham: WEST_HAM_08,
  wigan: WIGAN_08,
  stoke: STOKE_08,
  bolton: BOLTON_08,
  portsmouth: PORTSMOUTH_08,
  blackburn: BLACKBURN_08,
  sunderland: SUNDERLAND_08,
  hull: HULL_08,
  newcastle: NEWCASTLE_08,
  middlesbrough: MIDDLESBROUGH_08,
  west_brom: WEST_BROM_08,
};
