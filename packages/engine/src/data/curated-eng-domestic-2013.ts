/**
 * Curated domestic mid-tier — 2013-14 Premier League (M12 shortlist supply).
 *
 * Real 2013-14 squad players at the modelled PL's non-elite clubs for the
 * man-utd-2013 / spurs-2013 world. HIDDEN designer estimates (§7); real clubs,
 * birth years, positions, contracts. Injury proneness at the population norm (~30).
 * Names already curated in the world are omitted.
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

const NEWCASTLE_13: CuratedSeed[] = [
  q('newcastle', 'krul_nu13', 'Tim Krul', 1988, 'Netherlands', ['GK'], 78, 83, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('newcastle', 'coloccini_nu13', 'Fabricio Coloccini', 1982, 'Argentina', ['CB'], 78, 80, 2015, 30, t(8, 6, 8, 8, 5, 8)),
  q('newcastle', 'debuchy_nu13', 'Mathieu Debuchy', 1985, 'France', ['RB'], 77, 80, 2016, 30, t(8, 5, 8, 7, 5, 8)),
  q('newcastle', 'yanga_mbiwa_nu13', 'Mapou Yanga-Mbiwa', 1989, 'France', ['CB'], 75, 81, 2017, 30, t(8, 5, 8, 7, 5, 8)),
  q('newcastle', 'tiote_nu13', 'Cheick Tioté', 1986, 'Ivory Coast', ['DM'], 76, 79, 2016, 30, t(7, 6, 8, 7, 6, 8)),
  q('newcastle', 'sissoko_nu13', 'Moussa Sissoko', 1989, 'France', ['CM', 'RW'], 78, 83, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('newcastle', 'cabaye_nu13', 'Yohan Cabaye', 1986, 'France', ['CM', 'AM'], 81, 84, 2015, 30, t(8, 6, 8, 7, 5, 8)),
  q('newcastle', 'ben_arfa_nu13', 'Hatem Ben Arfa', 1987, 'France', ['AM', 'RW'], 77, 82, 2015, 30, t(4, 8, 8, 5, 7, 7)),
  q('newcastle', 'cisse_p_nu13', 'Papiss Cissé', 1985, 'Senegal', ['ST'], 76, 80, 2016, 30, t(6, 6, 8, 6, 6, 8)),
];

const SWANSEA_13: CuratedSeed[] = [
  q('swansea', 'vorm_sw13', 'Michel Vorm', 1983, 'Netherlands', ['GK'], 78, 81, 2016, 30, t(9, 5, 8, 8, 5, 8)),
  q('swansea', 'williams_a_sw13', 'Ashley Williams', 1984, 'Wales', ['CB'], 78, 81, 2016, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('swansea', 'chico_sw13', 'Chico Flores', 1987, 'Spain', ['CB'], 74, 77, 2016, 30, t(6, 6, 8, 7, 6, 8)),
  q('swansea', 'davies_b_sw13', 'Ben Davies', 1993, 'Wales', ['LB'], 74, 84, 2017, 30, t(9, 5, 8, 8, 4, 8)),
  q('swansea', 'rangel_sw13', 'Ángel Rangel', 1982, 'Spain', ['RB'], 75, 77, 2015, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('swansea', 'britton_sw13', 'Leon Britton', 1982, 'England', ['CM', 'DM'], 76, 78, 2015, 30, t(9, 5, 8, 9, 4, 8), { loyalty: 90 }),
  q('swansea', 'shelvey_sw13', 'Jonjo Shelvey', 1992, 'England', ['CM', 'AM'], 76, 84, 2017, 30, t(6, 7, 8, 7, 6, 8)),
  q('swansea', 'de_guzman_sw13', 'Jonathan de Guzmán', 1987, 'Netherlands', ['AM', 'CM'], 77, 81, 2015, 30, t(7, 6, 8, 7, 5, 8)),
  q('swansea', 'michu_sw13', 'Michu', 1986, 'Spain', ['AM', 'ST'], 78, 82, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('swansea', 'bony_sw13', 'Wilfried Bony', 1988, 'Ivory Coast', ['ST'], 80, 84, 2017, 30, t(7, 6, 8, 7, 5, 8)),
];

const STOKE_13: CuratedSeed[] = [
  q('stoke', 'begovic_st13', 'Asmir Begović', 1987, 'Bosnia', ['GK'], 80, 84, 2016, 30, t(9, 5, 8, 8, 4, 8)),
  q('stoke', 'shawcross_st13', 'Ryan Shawcross', 1987, 'England', ['CB'], 77, 80, 2016, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('stoke', 'wilson_m_st13', 'Marc Wilson', 1987, 'Ireland', ['CB', 'LB'], 74, 77, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'pieters_st13', 'Erik Pieters', 1988, 'Netherlands', ['LB'], 76, 80, 2017, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'nzonzi_st13', 'Steven Nzonzi', 1988, 'France', ['DM', 'CM'], 78, 83, 2016, 30, t(8, 5, 8, 7, 5, 8)),
  q('stoke', 'whelan_g_st13', 'Glenn Whelan', 1984, 'Ireland', ['DM', 'CM'], 74, 76, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'adam_st13', 'Charlie Adam', 1985, 'Scotland', ['CM', 'AM'], 76, 79, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('stoke', 'arnautovic_st13', 'Marko Arnautović', 1989, 'Austria', ['LW', 'ST'], 78, 84, 2017, 30, t(5, 8, 8, 6, 7, 8)),
  q('stoke', 'crouch_st13', 'Peter Crouch', 1981, 'England', ['ST'], 74, 76, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'walters_st13', 'Jonathan Walters', 1983, 'Ireland', ['ST', 'RW'], 74, 76, 2015, 30, t(8, 6, 8, 8, 5, 8)),
];

const ASTON_VILLA_13: CuratedSeed[] = [
  q('aston_villa', 'guzan_av13', 'Brad Guzan', 1984, 'United States', ['GK'], 77, 80, 2016, 30, t(9, 5, 8, 8, 5, 8)),
  q('aston_villa', 'vlaar_av13', 'Ron Vlaar', 1985, 'Netherlands', ['CB'], 78, 80, 2015, 30, t(9, 5, 8, 8, 5, 8)),
  q('aston_villa', 'baker_n_av13', 'Nathan Baker', 1991, 'England', ['CB'], 72, 78, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('aston_villa', 'luna_av13', 'Antonio Luna', 1991, 'Spain', ['LB'], 72, 77, 2016, 30, t(8, 5, 8, 7, 5, 8)),
  q('aston_villa', 'delph_av13', 'Fabian Delph', 1989, 'England', ['CM', 'DM'], 76, 82, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('aston_villa', 'westwood_av13', 'Ashley Westwood', 1990, 'England', ['CM'], 74, 79, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('aston_villa', 'bacuna_av13', 'Leandro Bacuna', 1991, 'Curaçao', ['RB', 'RW'], 73, 79, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('aston_villa', 'agbonlahor_av13', 'Gabriel Agbonlahor', 1986, 'England', ['ST', 'RW'], 76, 78, 2016, 30, t(8, 6, 8, 8, 5, 8)),
  q('aston_villa', 'benteke_av13', 'Christian Benteke', 1990, 'Belgium', ['ST'], 80, 85, 2016, 30, t(7, 7, 8, 7, 5, 8)),
  q('aston_villa', 'weimann_av13', 'Andreas Weimann', 1991, 'Austria', ['ST', 'RW'], 73, 78, 2016, 30, t(7, 6, 8, 7, 5, 8)),
];

const WEST_HAM_13: CuratedSeed[] = [
  q('west_ham', 'jaaskelainen_wh13', 'Jussi Jääskeläinen', 1975, 'Finland', ['GK'], 76, 77, 2015, 30, t(9, 5, 8, 8, 4, 8)),
  q('west_ham', 'collins_j_wh13', 'James Collins', 1983, 'Wales', ['CB'], 74, 76, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'reid_w_wh13', 'Winston Reid', 1988, 'New Zealand', ['CB'], 77, 82, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'tomkins_wh13', 'James Tomkins', 1989, 'England', ['CB'], 74, 79, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'noble_wh13', 'Mark Noble', 1987, 'England', ['CM', 'DM'], 77, 81, 2017, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('west_ham', 'diame_wh13', 'Mohamed Diamé', 1987, 'Senegal', ['CM', 'AM'], 76, 80, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_ham', 'downing_wh13', 'Stewart Downing', 1984, 'England', ['LW', 'AM'], 77, 80, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'jarvis_wh13', 'Matt Jarvis', 1986, 'England', ['LW', 'RW'], 75, 78, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'carroll_a_wh13', 'Andy Carroll', 1989, 'England', ['ST'], 77, 82, 2016, 35, t(6, 7, 8, 7, 6, 8)),
  q('west_ham', 'maiga_wh13', 'Modibo Maïga', 1988, 'Mali', ['ST'], 72, 77, 2016, 30, t(6, 6, 8, 7, 6, 8)),
];

const HULL_13: CuratedSeed[] = [
  q('hull', 'mcgregor_hu13', 'Allan McGregor', 1982, 'Scotland', ['GK'], 77, 79, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('hull', 'davies_c_hu13', 'Curtis Davies', 1985, 'England', ['CB'], 76, 79, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('hull', 'chester_hu13', 'James Chester', 1989, 'Wales', ['CB'], 75, 80, 2016, 30, t(9, 5, 8, 8, 5, 8)),
  q('hull', 'figueroa_hu13', 'Maynor Figueroa', 1983, 'Honduras', ['CB', 'LB'], 73, 75, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('hull', 'elmohamady_hu13', 'Ahmed Elmohamady', 1987, 'Egypt', ['RB', 'RW'], 74, 78, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('hull', 'huddlestone_hu13', 'Tom Huddlestone', 1986, 'England', ['DM', 'CM'], 75, 78, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('hull', 'livermore_hu13', 'Jake Livermore', 1989, 'England', ['CM', 'DM'], 74, 79, 2016, 30, t(7, 6, 8, 7, 6, 8)),
  q('hull', 'brady_r_hu13', 'Robbie Brady', 1992, 'Ireland', ['LW', 'LB'], 73, 81, 2017, 30, t(8, 5, 8, 8, 5, 8)),
  q('hull', 'long_s_hu13', 'Shane Long', 1987, 'Ireland', ['ST'], 76, 79, 2016, 30, t(8, 6, 8, 8, 5, 8)),
];

const WEST_BROM_13: CuratedSeed[] = [
  q('west_brom', 'myhill_wb13', 'Boaz Myhill', 1982, 'Wales', ['GK'], 73, 75, 2015, 30, t(8, 5, 8, 8, 5, 7)),
  q('west_brom', 'mcauley_wb13', 'Gareth McAuley', 1979, 'Northern Ireland', ['CB'], 75, 76, 2015, 30, t(9, 5, 8, 8, 5, 8)),
  q('west_brom', 'olsson_j_wb13', 'Jonas Olsson', 1983, 'Sweden', ['CB'], 75, 77, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'ridgewell_wb13', 'Liam Ridgewell', 1984, 'England', ['CB', 'LB'], 73, 75, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'mulumbu_wb13', 'Youssouf Mulumbu', 1987, 'DR Congo', ['DM', 'CM'], 75, 79, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_brom', 'yacob_wb13', 'Claudio Yacob', 1987, 'Argentina', ['DM'], 74, 77, 2016, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_brom', 'brunt_wb13', 'Chris Brunt', 1984, 'Northern Ireland', ['LW', 'CM'], 74, 76, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'sessegnon_wb13', 'Stéphane Sessègnon', 1984, 'Benin', ['AM', 'ST'], 76, 79, 2016, 30, t(6, 7, 8, 6, 6, 8)),
  q('west_brom', 'berahino_wb13', 'Saido Berahino', 1993, 'England', ['ST'], 72, 83, 2017, 30, t(5, 7, 8, 6, 7, 8)),
];

const CRYSTAL_PALACE_13: CuratedSeed[] = [
  q('crystal_palace', 'speroni_cp13', 'Julián Speroni', 1979, 'Argentina', ['GK'], 75, 76, 2015, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('crystal_palace', 'delaney_d_cp13', 'Damien Delaney', 1981, 'Ireland', ['CB'], 73, 75, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('crystal_palace', 'dann_cp13', 'Scott Dann', 1987, 'England', ['CB'], 76, 79, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('crystal_palace', 'ward_j_cp13', 'Joel Ward', 1989, 'England', ['RB', 'LB'], 73, 78, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('crystal_palace', 'jedinak_cp13', 'Mile Jedinak', 1984, 'Australia', ['DM', 'CM'], 76, 78, 2016, 30, t(8, 5, 8, 8, 6, 8)),
  q('crystal_palace', 'dikgacoi_cp13', 'Kagisho Dikgacoi', 1984, 'South Africa', ['DM', 'CM'], 73, 75, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('crystal_palace', 'bolasie_cp13', 'Yannick Bolasie', 1989, 'DR Congo', ['LW', 'RW'], 76, 82, 2016, 30, t(6, 7, 8, 7, 6, 8)),
  q('crystal_palace', 'puncheon_cp13', 'Jason Puncheon', 1986, 'England', ['AM', 'LW'], 74, 78, 2016, 30, t(6, 6, 8, 7, 6, 8)),
  q('crystal_palace', 'chamakh_cp13', 'Marouane Chamakh', 1984, 'Morocco', ['ST'], 73, 75, 2015, 30, t(6, 6, 8, 7, 5, 8)),
];

const NORWICH_13: CuratedSeed[] = [
  q('norwich', 'ruddy_no13', 'John Ruddy', 1986, 'England', ['GK'], 76, 79, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('norwich', 'bassong_no13', 'Sébastien Bassong', 1986, 'Cameroon', ['CB'], 75, 78, 2016, 30, t(8, 5, 8, 7, 5, 8)),
  q('norwich', 'r_martin_no13', 'Russell Martin', 1986, 'Scotland', ['CB', 'RB'], 73, 75, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('norwich', 'whittaker_no13', 'Steven Whittaker', 1984, 'Scotland', ['RB', 'LB'], 73, 75, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('norwich', 'fer_no13', 'Leroy Fer', 1990, 'Netherlands', ['CM', 'AM'], 76, 81, 2017, 30, t(8, 5, 8, 7, 5, 8)),
  q('norwich', 'howson_no13', 'Jonny Howson', 1988, 'England', ['CM', 'AM'], 74, 78, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('norwich', 'snodgrass_no13', 'Robert Snodgrass', 1987, 'Scotland', ['RW', 'AM'], 76, 79, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('norwich', 'redmond_no13', 'Nathan Redmond', 1994, 'England', ['LW', 'RW'], 71, 82, 2017, 30, t(8, 5, 9, 8, 5, 8)),
  q('norwich', 'hooper_no13', 'Gary Hooper', 1988, 'England', ['ST'], 75, 79, 2016, 30, t(8, 6, 8, 8, 5, 8)),
];

const FULHAM_13: CuratedSeed[] = [
  q('fulham', 'stekelenburg_fu13', 'Maarten Stekelenburg', 1982, 'Netherlands', ['GK'], 77, 79, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('fulham', 'hangeland_fu13', 'Brede Hangeland', 1981, 'Norway', ['CB'], 76, 77, 2015, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'senderos_fu13', 'Philippe Senderos', 1985, 'Switzerland', ['CB'], 73, 75, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('fulham', 'riether_fu13', 'Sascha Riether', 1983, 'Germany', ['RB'], 74, 76, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('fulham', 'sidwell_fu13', 'Steve Sidwell', 1982, 'England', ['CM', 'DM'], 74, 76, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('fulham', 'karagounis_fu13', 'Giorgos Karagounis', 1977, 'Greece', ['CM', 'DM'], 75, 76, 2015, 30, t(8, 6, 8, 8, 5, 8)),
  q('fulham', 'kasami_fu13', 'Pajtim Kasami', 1992, 'Switzerland', ['AM', 'CM'], 72, 79, 2016, 30, t(6, 6, 8, 7, 6, 8)),
  q('fulham', 'taarabt_fu13', 'Adel Taarabt', 1989, 'Morocco', ['AM', 'LW'], 76, 81, 2015, 30, t(4, 8, 8, 5, 7, 7)),
];

const CARDIFF_13: CuratedSeed[] = [
  q('cardiff', 'marshall_d_ca13', 'David Marshall', 1985, 'Scotland', ['GK'], 76, 79, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('cardiff', 'caulker_ca13', 'Steven Caulker', 1991, 'England', ['CB'], 75, 81, 2017, 30, t(8, 5, 8, 8, 5, 8)),
  q('cardiff', 'turner_b_ca13', 'Ben Turner', 1988, 'England', ['CB'], 72, 75, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('cardiff', 'taylor_a_ca13', 'Andrew Taylor', 1986, 'England', ['LB'], 72, 74, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('cardiff', 'medel_ca13', 'Gary Medel', 1987, 'Chile', ['DM', 'CB'], 78, 82, 2016, 30, t(6, 7, 8, 7, 7, 8)),
  q('cardiff', 'gunnarsson_ca13', 'Aron Gunnarsson', 1989, 'Iceland', ['DM', 'CM'], 74, 78, 2016, 30, t(8, 5, 8, 8, 6, 8)),
  q('cardiff', 'whittingham_ca13', 'Peter Whittingham', 1984, 'England', ['CM', 'LW'], 75, 77, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('cardiff', 'campbell_f_ca13', 'Fraizer Campbell', 1987, 'England', ['ST'], 73, 76, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('cardiff', 'mutch_ca13', 'Jordon Mutch', 1991, 'England', ['CM', 'AM'], 73, 80, 2016, 30, t(7, 6, 8, 7, 5, 8)),
];

const SUNDERLAND_13: CuratedSeed[] = [
  q('sunderland', 'mannone_su13', 'Vito Mannone', 1988, 'Italy', ['GK'], 74, 78, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('sunderland', 'brown_w_su13', 'Wes Brown', 1979, 'England', ['CB'], 74, 75, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('sunderland', 'oshea_su13', 'John O’Shea', 1981, 'Ireland', ['CB', 'RB'], 75, 76, 2015, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('sunderland', 'bardsley_su13', 'Phil Bardsley', 1985, 'Scotland', ['RB'], 73, 76, 2015, 30, t(7, 5, 8, 8, 5, 8)),
  q('sunderland', 'colback_su13', 'Jack Colback', 1989, 'England', ['CM', 'LB'], 74, 78, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('sunderland', 'cattermole_su13', 'Lee Cattermole', 1988, 'England', ['DM', 'CM'], 75, 79, 2016, 30, t(6, 7, 8, 7, 7, 8)),
  q('sunderland', 'johnson_a_su13', 'Adam Johnson', 1987, 'England', ['RW', 'LW'], 77, 80, 2016, 30, t(6, 7, 8, 7, 6, 8)),
  q('sunderland', 'giaccherini_su13', 'Emanuele Giaccherini', 1985, 'Italy', ['LW', 'AM'], 75, 78, 2016, 30, t(7, 6, 8, 7, 5, 8)),
  q('sunderland', 'fletcher_s_su13', 'Steven Fletcher', 1987, 'Scotland', ['ST'], 75, 78, 2016, 30, t(8, 6, 8, 7, 5, 8)),
  q('sunderland', 'altidore_su13', 'Jozy Altidore', 1989, 'United States', ['ST'], 74, 79, 2016, 30, t(7, 6, 8, 7, 5, 8)),
];

/** The domestic mid-tier of the 2013-14 PL. Merged by CONCATENATION into
 *  MAN_UTD_2013_SQUADS (man-utd-2013 / spurs-2013). */
export const ENG_DOMESTIC_2013_SQUADS: Record<string, CuratedSeed[]> = {
  newcastle: NEWCASTLE_13,
  swansea: SWANSEA_13,
  stoke: STOKE_13,
  aston_villa: ASTON_VILLA_13,
  west_ham: WEST_HAM_13,
  hull: HULL_13,
  west_brom: WEST_BROM_13,
  crystal_palace: CRYSTAL_PALACE_13,
  norwich: NORWICH_13,
  fulham: FULHAM_13,
  cardiff: CARDIFF_13,
  sunderland: SUNDERLAND_13,
};
