/**
 * Curated domestic mid-tier — 2010-11 Premier League (M12 shortlist supply).
 *
 * Real 2010-11 squad players at the modelled PL's non-elite clubs for the
 * liverpool-2010 world. HIDDEN designer estimates (§7); real clubs, birth years,
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

const EVERTON_10: CuratedSeed[] = [
  q('everton', 'howard_ev10', 'Tim Howard', 1979, 'United States', ['GK'], 80, 82, 2013, 30, t(9, 5, 8, 8, 5, 8)),
  q('everton', 'jagielka_ev10', 'Phil Jagielka', 1982, 'England', ['CB'], 79, 82, 2013, 30, t(9, 5, 8, 8, 4, 8)),
  q('everton', 'distin_ev10', 'Sylvain Distin', 1977, 'France', ['CB'], 78, 79, 2012, 30, t(9, 5, 8, 8, 5, 8)),
  q('everton', 'baines_ev10', 'Leighton Baines', 1984, 'England', ['LB'], 81, 85, 2013, 30, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('everton', 'fellaini_ev10', 'Marouane Fellaini', 1987, 'Belgium', ['CM', 'DM'], 80, 85, 2013, 30, t(8, 6, 8, 7, 6, 8)),
  q('everton', 'arteta_ev10', 'Mikel Arteta', 1982, 'Spain', ['CM', 'AM'], 81, 83, 2012, 30, t(9, 5, 8, 8, 4, 8)),
  q('everton', 'pienaar_ev10', 'Steven Pienaar', 1982, 'South Africa', ['AM', 'LW'], 78, 81, 2012, 30, t(8, 6, 8, 7, 5, 8)),
  q('everton', 'cahill_t_ev10', 'Tim Cahill', 1979, 'Australia', ['AM', 'ST'], 79, 81, 2012, 30, t(8, 6, 8, 8, 5, 8)),
  q('everton', 'coleman_ev10', 'Séamus Coleman', 1988, 'Ireland', ['RB', 'RW'], 74, 83, 2014, 30, t(9, 5, 9, 8, 5, 8)),
  q('everton', 'saha_ev10', 'Louis Saha', 1978, 'France', ['ST'], 76, 78, 2012, 35, t(7, 6, 8, 7, 5, 8)),
];

const FULHAM_10: CuratedSeed[] = [
  q('fulham', 'schwarzer_fu10', 'Mark Schwarzer', 1972, 'Australia', ['GK'], 78, 79, 2012, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'hangeland_fu10', 'Brede Hangeland', 1981, 'Norway', ['CB'], 79, 81, 2013, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'hughes_a_fu10', 'Aaron Hughes', 1979, 'Northern Ireland', ['CB', 'RB'], 76, 77, 2012, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'salcido_fu10', 'Carlos Salcido', 1980, 'Mexico', ['LB', 'DM'], 75, 77, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('fulham', 'murphy_d_fu10', 'Danny Murphy', 1977, 'England', ['CM', 'AM'], 76, 77, 2012, 30, t(8, 6, 8, 8, 5, 8)),
  q('fulham', 'etuhu_fu10', 'Dickson Etuhu', 1982, 'Nigeria', ['DM', 'CM'], 73, 75, 2012, 30, t(8, 5, 8, 7, 5, 8)),
  q('fulham', 'dembele_fu10', 'Moussa Dembélé', 1987, 'Belgium', ['AM', 'CM'], 78, 84, 2013, 30, t(8, 6, 8, 7, 5, 8)),
  q('fulham', 'dempsey_fu10', 'Clint Dempsey', 1983, 'United States', ['AM', 'ST'], 79, 83, 2013, 30, t(8, 6, 9, 8, 5, 8)),
  q('fulham', 'zamora_fu10', 'Bobby Zamora', 1981, 'England', ['ST'], 76, 79, 2013, 30, t(7, 6, 8, 7, 5, 8)),
];

const ASTON_VILLA_10: CuratedSeed[] = [
  q('aston_villa', 'friedel_av10', 'Brad Friedel', 1971, 'United States', ['GK'], 79, 80, 2012, 30, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'dunne_av10', 'Richard Dunne', 1979, 'Ireland', ['CB'], 79, 80, 2013, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('aston_villa', 'collins_j_av10', 'James Collins', 1983, 'Wales', ['CB'], 75, 78, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('aston_villa', 'warnock_av10', 'Stephen Warnock', 1981, 'England', ['LB'], 75, 78, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('aston_villa', 'petrov_s_av10', 'Stiliyan Petrov', 1979, 'Bulgaria', ['CM', 'DM'], 77, 79, 2013, 30, t(9, 5, 8, 8, 5, 8)),
  q('aston_villa', 'downing_av10', 'Stewart Downing', 1984, 'England', ['LW'], 78, 82, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('aston_villa', 'albrighton_av10', 'Marc Albrighton', 1989, 'England', ['RW'], 73, 80, 2014, 30, t(8, 5, 8, 8, 5, 8)),
  q('aston_villa', 'agbonlahor_av10', 'Gabriel Agbonlahor', 1986, 'England', ['ST', 'RW'], 77, 81, 2013, 30, t(8, 6, 8, 8, 5, 8)),
  q('aston_villa', 'heskey_av10', 'Emile Heskey', 1978, 'England', ['ST'], 74, 75, 2012, 30, t(8, 6, 8, 8, 5, 8)),
];

const SUNDERLAND_10: CuratedSeed[] = [
  q('sunderland', 'mignolet_su10', 'Simon Mignolet', 1988, 'Belgium', ['GK'], 76, 83, 2014, 30, t(9, 5, 8, 8, 4, 8)),
  q('sunderland', 'turner_m_su10', 'Michael Turner', 1983, 'England', ['CB'], 75, 78, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('sunderland', 'ferdinand_a_su10', 'Anton Ferdinand', 1985, 'England', ['CB'], 74, 78, 2012, 30, t(7, 6, 8, 7, 6, 8)),
  q('sunderland', 'bardsley_su10', 'Phil Bardsley', 1985, 'Scotland', ['RB'], 74, 78, 2013, 30, t(7, 5, 8, 8, 5, 8)),
  q('sunderland', 'cattermole_su10', 'Lee Cattermole', 1988, 'England', ['DM', 'CM'], 75, 81, 2014, 30, t(6, 7, 8, 7, 7, 8)),
  q('sunderland', 'henderson_su10', 'Jordan Henderson', 1990, 'England', ['CM'], 74, 86, 2014, 30, t(9, 5, 9, 8, 4, 8)),
  q('sunderland', 'malbranque_su10', 'Steed Malbranque', 1980, 'France', ['AM', 'CM'], 75, 77, 2012, 30, t(8, 5, 8, 7, 5, 8)),
  q('sunderland', 'sessegnon_su10', 'Stéphane Sessègnon', 1984, 'Benin', ['AM', 'ST'], 77, 81, 2013, 30, t(6, 7, 8, 7, 6, 8)),
  q('sunderland', 'gyan_su10', 'Asamoah Gyan', 1985, 'Ghana', ['ST'], 78, 81, 2013, 30, t(6, 7, 8, 6, 6, 8)),
];

const WEST_BROM_10: CuratedSeed[] = [
  q('west_brom', 'carson_wb10', 'Scott Carson', 1985, 'England', ['GK'], 75, 79, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'olsson_j_wb10', 'Jonas Olsson', 1983, 'Sweden', ['CB'], 75, 79, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'jara_wb10', 'Gonzalo Jara', 1985, 'Chile', ['CB', 'RB'], 73, 77, 2013, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_brom', 'mulumbu_wb10', 'Youssouf Mulumbu', 1987, 'DR Congo', ['DM', 'CM'], 75, 80, 2013, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_brom', 'brunt_wb10', 'Chris Brunt', 1984, 'Northern Ireland', ['LW', 'CM'], 74, 78, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'dorrans_wb10', 'Graham Dorrans', 1987, 'Scotland', ['AM', 'CM'], 74, 79, 2013, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_brom', 'morrison_j_wb10', 'James Morrison', 1986, 'Scotland', ['CM', 'AM'], 75, 79, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_brom', 'odemwingie_wb10', 'Peter Odemwingie', 1981, 'Nigeria', ['ST', 'RW'], 76, 79, 2013, 30, t(6, 7, 8, 6, 6, 8)),
];

const NEWCASTLE_10: CuratedSeed[] = [
  q('newcastle', 'harper_nu10', 'Steve Harper', 1975, 'England', ['GK'], 74, 75, 2012, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('newcastle', 'coloccini_nu10', 'Fabricio Coloccini', 1982, 'Argentina', ['CB'], 79, 82, 2013, 30, t(8, 6, 8, 8, 5, 8)),
  q('newcastle', 'williamson_nu10', 'Mike Williamson', 1983, 'England', ['CB'], 73, 76, 2013, 30, t(8, 5, 8, 8, 5, 7)),
  q('newcastle', 'enrique_nu10', 'José Enrique', 1986, 'Spain', ['LB'], 78, 82, 2012, 30, t(8, 5, 8, 7, 5, 8)),
  q('newcastle', 'tiote_nu10', 'Cheick Tioté', 1986, 'Ivory Coast', ['DM'], 78, 82, 2014, 30, t(7, 6, 8, 7, 6, 8)),
  q('newcastle', 'barton_j_nu10', 'Joey Barton', 1982, 'England', ['CM', 'DM'], 75, 78, 2012, 30, t(4, 8, 8, 6, 8, 7)),
  q('newcastle', 'gutierrez_nu10', 'Jonás Gutiérrez', 1983, 'Argentina', ['RW', 'CM'], 75, 78, 2013, 30, t(7, 6, 8, 7, 5, 8)),
  q('newcastle', 'lovenkrands_nu10', 'Peter Løvenkrands', 1980, 'Denmark', ['ST', 'LW'], 74, 76, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('newcastle', 'ameobi_nu10', 'Shola Ameobi', 1981, 'England', ['ST'], 73, 75, 2012, 30, t(7, 5, 8, 8, 5, 7)),
];

const STOKE_10: CuratedSeed[] = [
  q('stoke', 'begovic_st10', 'Asmir Begović', 1987, 'Bosnia', ['GK'], 78, 84, 2014, 30, t(9, 5, 8, 8, 4, 8)),
  q('stoke', 'huth_st10', 'Robert Huth', 1984, 'Germany', ['CB'], 77, 79, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'shawcross_st10', 'Ryan Shawcross', 1987, 'England', ['CB'], 77, 82, 2014, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'wilson_m_st10', 'Marc Wilson', 1987, 'Ireland', ['LB', 'CB'], 73, 77, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'whelan_g_st10', 'Glenn Whelan', 1984, 'Ireland', ['DM', 'CM'], 74, 78, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('stoke', 'delap_st10', 'Rory Delap', 1976, 'Ireland', ['CM', 'RB'], 72, 73, 2012, 30, t(8, 5, 8, 8, 5, 7)),
  q('stoke', 'etherington_st10', 'Matthew Etherington', 1981, 'England', ['LW'], 74, 77, 2012, 30, t(7, 5, 8, 7, 5, 8)),
  q('stoke', 'pennant_st10', 'Jermaine Pennant', 1983, 'England', ['RW'], 74, 78, 2012, 30, t(5, 7, 8, 6, 6, 8)),
  q('stoke', 'jones_ke_st10', 'Kenwyne Jones', 1984, 'Trinidad', ['ST'], 75, 79, 2013, 30, t(7, 6, 8, 7, 5, 8)),
];

const BOLTON_10: CuratedSeed[] = [
  q('bolton', 'jaaskelainen_bo10', 'Jussi Jääskeläinen', 1975, 'Finland', ['GK'], 78, 79, 2012, 30, t(9, 5, 8, 8, 4, 8)),
  q('bolton', 'cahill_g_bo10', 'Gary Cahill', 1985, 'England', ['CB'], 79, 85, 2013, 30, t(9, 5, 9, 8, 4, 8)),
  q('bolton', 'knight_z_bo10', 'Zat Knight', 1980, 'England', ['CB'], 73, 75, 2012, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'steinsson_bo10', 'Gretar Steinsson', 1982, 'Iceland', ['RB'], 73, 76, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'muamba_bo10', 'Fabrice Muamba', 1988, 'England', ['DM', 'CM'], 74, 80, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'holden_bo10', 'Stuart Holden', 1985, 'United States', ['CM'], 75, 81, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'lee_cy_bo10', 'Lee Chung-yong', 1988, 'South Korea', ['RW', 'AM'], 76, 82, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'petrov_m_bo10', 'Martin Petrov', 1979, 'Bulgaria', ['LW'], 75, 77, 2012, 30, t(6, 6, 8, 7, 5, 8)),
  q('bolton', 'elmander_bo10', 'Johan Elmander', 1981, 'Sweden', ['ST'], 76, 79, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('bolton', 'davies_k_bo10', 'Kevin Davies', 1977, 'England', ['ST'], 74, 76, 2012, 30, t(7, 6, 8, 8, 5, 8)),
];

const BLACKBURN_10: CuratedSeed[] = [
  q('blackburn', 'robinson_p_bl10', 'Paul Robinson', 1979, 'England', ['GK'], 78, 80, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('blackburn', 'samba_bl10', 'Christopher Samba', 1984, 'Congo', ['CB'], 78, 81, 2013, 30, t(8, 6, 8, 8, 6, 8)),
  q('blackburn', 'nelsen_bl10', 'Ryan Nelsen', 1977, 'New Zealand', ['CB'], 75, 77, 2012, 30, t(9, 5, 8, 8, 5, 8)),
  q('blackburn', 'salgado_bl10', 'Michel Salgado', 1975, 'Spain', ['RB'], 74, 75, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('blackburn', 'nzonzi_bl10', 'Steven Nzonzi', 1988, 'France', ['DM', 'CM'], 75, 83, 2014, 30, t(8, 5, 8, 7, 5, 8)),
  q('blackburn', 'dunn_bl10', 'David Dunn', 1979, 'England', ['AM', 'CM'], 74, 76, 2012, 30, t(7, 6, 8, 8, 5, 8)),
  q('blackburn', 'pedersen_m_bl10', 'Morten Gamst Pedersen', 1981, 'Norway', ['LW'], 75, 78, 2012, 30, t(8, 5, 8, 7, 5, 8)),
  q('blackburn', 'hoilett_bl10', 'Junior Hoilett', 1990, 'Canada', ['LW', 'RW'], 73, 82, 2014, 30, t(7, 6, 8, 7, 5, 8)),
  q('blackburn', 'kalinic_bl10', 'Nikola Kalinić', 1988, 'Croatia', ['ST'], 74, 80, 2013, 30, t(7, 6, 8, 7, 5, 8)),
];

const WIGAN_10: CuratedSeed[] = [
  q('wigan', 'al_habsi_wg10', 'Ali Al Habsi', 1981, 'Oman', ['GK'], 77, 80, 2013, 30, t(9, 5, 8, 8, 5, 8)),
  q('wigan', 'alcaraz_wg10', 'Antolín Alcaraz', 1982, 'Paraguay', ['CB'], 75, 78, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('wigan', 'caldwell_g_wg10', 'Gary Caldwell', 1982, 'Scotland', ['CB'], 74, 76, 2013, 30, t(9, 5, 8, 8, 5, 8)),
  q('wigan', 'figueroa_wg10', 'Maynor Figueroa', 1983, 'Honduras', ['CB', 'LB'], 74, 77, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('wigan', 'mccarthy_j_wg10', 'James McCarthy', 1990, 'Ireland', ['CM', 'DM'], 76, 84, 2014, 30, t(9, 5, 9, 8, 4, 8)),
  q('wigan', 'diame_wg10', 'Mohamed Diamé', 1987, 'Senegal', ['CM', 'DM'], 76, 81, 2013, 30, t(8, 5, 8, 7, 5, 8)),
  q('wigan', 'nzogbia_wg10', 'Charles N’Zogbia', 1986, 'France', ['LW', 'AM'], 77, 81, 2013, 30, t(6, 7, 8, 6, 6, 8)),
  q('wigan', 'rodallega_wg10', 'Hugo Rodallega', 1985, 'Colombia', ['ST'], 75, 78, 2013, 30, t(7, 6, 8, 7, 5, 8)),
  q('wigan', 'moses_wg10', 'Victor Moses', 1990, 'Nigeria', ['LW', 'RW'], 73, 82, 2014, 30, t(6, 6, 8, 7, 6, 8)),
];

const WOLVES_10: CuratedSeed[] = [
  q('wolves', 'hennessey_wo10', 'Wayne Hennessey', 1987, 'Wales', ['GK'], 74, 79, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('wolves', 'berra_wo10', 'Christophe Berra', 1985, 'Scotland', ['CB'], 73, 77, 2013, 30, t(9, 5, 8, 8, 5, 8)),
  q('wolves', 'johnson_r_wo10', 'Roger Johnson', 1983, 'England', ['CB'], 74, 77, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('wolves', 'ward_s_wo10', 'Stephen Ward', 1985, 'Ireland', ['LB', 'LW'], 73, 76, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('wolves', 'henry_k_wo10', 'Karl Henry', 1982, 'England', ['DM', 'CM'], 73, 75, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('wolves', 'jones_d_wo10', 'David Jones', 1984, 'England', ['CM', 'AM'], 73, 76, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('wolves', 'jarvis_wo10', 'Matt Jarvis', 1986, 'England', ['LW', 'RW'], 75, 79, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('wolves', 'doyle_k_wo10', 'Kevin Doyle', 1983, 'Ireland', ['ST'], 75, 78, 2013, 30, t(8, 6, 8, 8, 5, 8)),
  q('wolves', 'fletcher_s_wo10', 'Steven Fletcher', 1987, 'Scotland', ['ST'], 75, 79, 2013, 30, t(8, 6, 8, 7, 5, 8)),
];

const BIRMINGHAM_10: CuratedSeed[] = [
  q('birmingham', 'foster_bi10', 'Ben Foster', 1983, 'England', ['GK'], 78, 82, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('birmingham', 'dann_bi10', 'Scott Dann', 1987, 'England', ['CB'], 75, 80, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('birmingham', 'ridgewell_bi10', 'Liam Ridgewell', 1984, 'England', ['CB', 'LB'], 74, 77, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('birmingham', 'carr_bi10', 'Stephen Carr', 1976, 'Ireland', ['RB'], 75, 76, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('birmingham', 'ferguson_b_bi10', 'Barry Ferguson', 1978, 'Scotland', ['CM', 'DM'], 75, 77, 2012, 30, t(8, 6, 8, 8, 5, 8)),
  q('birmingham', 'larsson_s_bi10', 'Sebastian Larsson', 1985, 'Sweden', ['RW', 'CM'], 75, 79, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('birmingham', 'gardner_c_bi10', 'Craig Gardner', 1986, 'England', ['CM', 'AM'], 74, 78, 2013, 30, t(7, 6, 8, 8, 5, 8)),
  q('birmingham', 'jerome_bi10', 'Cameron Jerome', 1986, 'England', ['ST'], 74, 78, 2013, 30, t(7, 6, 8, 7, 5, 8)),
  q('birmingham', 'zigic_bi10', 'Nikola Žigić', 1980, 'Serbia', ['ST'], 74, 76, 2013, 30, t(6, 6, 8, 7, 5, 8)),
];

const BLACKPOOL_10: CuratedSeed[] = [
  q('blackpool', 'gilks_bp10', 'Matthew Gilks', 1982, 'Scotland', ['GK'], 72, 75, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('blackpool', 'evatt_bp10', 'Ian Evatt', 1981, 'England', ['CB'], 71, 73, 2012, 30, t(8, 5, 8, 8, 5, 7)),
  q('blackpool', 'cathcart_bp10', 'Craig Cathcart', 1989, 'Northern Ireland', ['CB'], 71, 79, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('blackpool', 'crainey_bp10', 'Stephen Crainey', 1981, 'Scotland', ['LB'], 71, 73, 2012, 30, t(8, 5, 8, 8, 5, 7)),
  q('blackpool', 'adam_bp10', 'Charlie Adam', 1985, 'Scotland', ['CM', 'AM'], 77, 81, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('blackpool', 'vaughan_d_bp10', 'David Vaughan', 1983, 'Wales', ['CM', 'DM'], 73, 76, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('blackpool', 'taylor_fletcher_bp10', 'Gary Taylor-Fletcher', 1981, 'England', ['AM', 'ST'], 71, 73, 2012, 30, t(7, 5, 8, 8, 5, 7)),
  q('blackpool', 'campbell_dj_bp10', 'DJ Campbell', 1981, 'England', ['ST'], 72, 75, 2013, 30, t(6, 6, 8, 7, 6, 7)),
  q('blackpool', 'varney_bp10', 'Luke Varney', 1982, 'England', ['ST', 'LW'], 71, 73, 2012, 30, t(7, 5, 8, 7, 5, 7)),
];

const WEST_HAM_10: CuratedSeed[] = [
  q('west_ham', 'green_r_wh10', 'Robert Green', 1980, 'England', ['GK'], 78, 80, 2013, 30, t(9, 5, 8, 8, 5, 8)),
  q('west_ham', 'upson_wh10', 'Matthew Upson', 1979, 'England', ['CB'], 76, 78, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'tomkins_wh10', 'James Tomkins', 1989, 'England', ['CB'], 73, 80, 2013, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'reid_w_wh10', 'Winston Reid', 1988, 'New Zealand', ['CB'], 73, 81, 2014, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'parker_s_wh10', 'Scott Parker', 1980, 'England', ['CM', 'DM'], 80, 82, 2012, 30, t(9, 5, 9, 8, 5, 8)),
  q('west_ham', 'noble_wh10', 'Mark Noble', 1987, 'England', ['CM', 'DM'], 76, 82, 2014, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('west_ham', 'hitzlsperger_wh10', 'Thomas Hitzlsperger', 1982, 'Germany', ['CM', 'DM'], 76, 79, 2012, 30, t(8, 5, 8, 7, 5, 8)),
  q('west_ham', 'cole_c_wh10', 'Carlton Cole', 1983, 'England', ['ST'], 74, 77, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('west_ham', 'obinna_wh10', 'Victor Obinna', 1987, 'Nigeria', ['ST', 'LW'], 73, 77, 2012, 30, t(6, 6, 8, 6, 6, 8)),
];

/** The domestic mid-tier of the 2010-11 PL. Merged by CONCATENATION into
 *  LIVERPOOL_2010_SQUADS. */
export const ENG_DOMESTIC_2010_SQUADS: Record<string, CuratedSeed[]> = {
  everton: EVERTON_10,
  fulham: FULHAM_10,
  aston_villa: ASTON_VILLA_10,
  sunderland: SUNDERLAND_10,
  west_brom: WEST_BROM_10,
  newcastle: NEWCASTLE_10,
  stoke: STOKE_10,
  bolton: BOLTON_10,
  blackburn: BLACKBURN_10,
  wigan: WIGAN_10,
  wolves: WOLVES_10,
  birmingham: BIRMINGHAM_10,
  blackpool: BLACKPOOL_10,
  west_ham: WEST_HAM_10,
};
