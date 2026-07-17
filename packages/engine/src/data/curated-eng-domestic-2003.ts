/**
 * Curated domestic mid-tier — 2003-04 Premier League (M12 shortlist supply).
 *
 * Real 2003-04 squad players at the modelled PL's non-elite clubs for the
 * chelsea-2003 world. HIDDEN designer estimates (§7); real clubs, birth years,
 * positions, contracts. Injury proneness at the population norm (~30). A teenage
 * Wayne Rooney at Everton and Van der Sar at Fulham are the marquee listables.
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

const NEWCASTLE_03: CuratedSeed[] = [
  q('newcastle', 'given_nu03', 'Shay Given', 1976, 'Ireland', ['GK'], 80, 84, 2006, 30, t(9, 5, 8, 8, 4, 8)),
  q('newcastle', 'obrien_a_nu03', 'Andy O’Brien', 1979, 'Ireland', ['CB'], 75, 79, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('newcastle', 'bramble_nu03', 'Titus Bramble', 1981, 'England', ['CB'], 74, 80, 2007, 30, t(6, 6, 8, 7, 6, 7)),
  q('newcastle', 'bernard_nu03', 'Olivier Bernard', 1979, 'France', ['LB', 'LW'], 74, 77, 2006, 30, t(7, 5, 8, 7, 5, 8)),
  q('newcastle', 'jenas_nu03', 'Jermaine Jenas', 1983, 'England', ['CM'], 76, 84, 2007, 30, t(8, 6, 8, 7, 5, 8)),
  q('newcastle', 'speed_nu03', 'Gary Speed', 1969, 'Wales', ['CM'], 78, 79, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('newcastle', 'robert_nu03', 'Laurent Robert', 1975, 'France', ['LW'], 78, 80, 2006, 30, t(5, 7, 8, 6, 7, 8)),
  q('newcastle', 'ameobi_nu03', 'Shola Ameobi', 1981, 'England', ['ST'], 73, 78, 2007, 30, t(7, 5, 8, 8, 5, 7)),
];

const ASTON_VILLA_03: CuratedSeed[] = [
  q('aston_villa', 'sorensen_av03', 'Thomas Sørensen', 1976, 'Denmark', ['GK'], 79, 82, 2007, 30, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'mellberg_av03', 'Olof Mellberg', 1977, 'Sweden', ['CB'], 80, 82, 2006, 30, t(9, 5, 8, 8, 5, 8)),
  q('aston_villa', 'barry_av03', 'Gareth Barry', 1981, 'England', ['LB', 'CM'], 78, 86, 2007, 30, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'samuel_av03', 'Jlloyd Samuel', 1981, 'England', ['LB', 'CB'], 73, 77, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'mccann_av03', 'Gavin McCann', 1978, 'England', ['CM', 'DM'], 75, 79, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'hitzlsperger_av03', 'Thomas Hitzlsperger', 1982, 'Germany', ['CM', 'DM'], 74, 82, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('aston_villa', 'angel_av03', 'Juan Pablo Ángel', 1975, 'Colombia', ['ST'], 78, 81, 2006, 30, t(8, 6, 8, 7, 5, 8)),
  q('aston_villa', 'vassell_av03', 'Darius Vassell', 1980, 'England', ['ST'], 75, 80, 2006, 30, t(7, 6, 8, 7, 5, 8)),
];

const CHARLTON_03: CuratedSeed[] = [
  q('charlton', 'kiely_ch03', 'Dean Kiely', 1970, 'Ireland', ['GK'], 76, 78, 2006, 30, t(9, 5, 8, 8, 5, 7)),
  q('charlton', 'fortune_ch03', 'Jonatan Fortune', 1980, 'England', ['CB'], 72, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('charlton', 'young_l_ch03', 'Luke Young', 1979, 'England', ['RB'], 76, 80, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('charlton', 'powell_c_ch03', 'Chris Powell', 1969, 'England', ['LB'], 73, 74, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('charlton', 'holland_ch03', 'Matt Holland', 1974, 'Ireland', ['CM'], 75, 77, 2006, 30, t(9, 5, 8, 8, 4, 8)),
  q('charlton', 'jensen_c_ch03', 'Claus Jensen', 1977, 'Denmark', ['AM', 'CM'], 77, 80, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('charlton', 'di_canio_ch03', 'Paolo Di Canio', 1968, 'Italy', ['AM', 'ST'], 78, 79, 2005, 30, t(5, 9, 8, 7, 8, 8)),
  q('charlton', 'euell_ch03', 'Jason Euell', 1977, 'Jamaica', ['ST', 'AM'], 75, 78, 2006, 30, t(7, 6, 8, 7, 5, 8)),
  q('charlton', 'bartlett_ch03', 'Shaun Bartlett', 1972, 'South Africa', ['ST'], 73, 75, 2005, 30, t(7, 6, 8, 7, 5, 8)),
];

const BOLTON_03: CuratedSeed[] = [
  q('bolton', 'jaaskelainen_bo03', 'Jussi Jääskeläinen', 1975, 'Finland', ['GK'], 79, 82, 2007, 30, t(9, 5, 8, 8, 4, 8)),
  q('bolton', 'ngotty_bo03', 'Bruno N’Gotty', 1971, 'France', ['CB'], 75, 77, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'campo_bo03', 'Iván Campo', 1974, 'Spain', ['DM', 'CB'], 77, 79, 2006, 30, t(7, 6, 8, 7, 6, 8)),
  q('bolton', 'gardner_bo03', 'Ricardo Gardner', 1978, 'Jamaica', ['LB', 'LW'], 74, 78, 2006, 30, t(7, 5, 8, 7, 5, 8)),
  q('bolton', 'nolan_bo03', 'Kevin Nolan', 1982, 'England', ['CM', 'AM'], 75, 82, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('bolton', 'okocha_bo03', 'Jay-Jay Okocha', 1973, 'Nigeria', ['AM', 'RW'], 80, 82, 2005, 30, t(6, 8, 8, 7, 6, 8)),
  q('bolton', 'stelios_bo03', 'Stelios Giannakopoulos', 1974, 'Greece', ['RW', 'AM'], 76, 78, 2006, 30, t(8, 5, 8, 8, 5, 8)),
  q('bolton', 'djorkaeff_bo03', 'Youri Djorkaeff', 1968, 'France', ['AM', 'ST'], 77, 78, 2004, 30, t(8, 7, 8, 7, 5, 8)),
  q('bolton', 'davies_k_bo03', 'Kevin Davies', 1977, 'England', ['ST'], 75, 79, 2007, 30, t(7, 6, 8, 8, 5, 8)),
];

const FULHAM_03: CuratedSeed[] = [
  q('fulham', 'vandersar_fu03', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 84, 85, 2006, 30, t(9, 5, 8, 8, 3, 8)),
  q('fulham', 'volz_fu03', 'Moritz Volz', 1983, 'Germany', ['RB'], 72, 78, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('fulham', 'knight_z_fu03', 'Zat Knight', 1980, 'England', ['CB'], 73, 78, 2007, 30, t(8, 5, 8, 8, 5, 7)),
  q('fulham', 'bocanegra_fu03', 'Carlos Bocanegra', 1979, 'United States', ['CB', 'LB'], 74, 78, 2007, 30, t(9, 5, 8, 8, 4, 8)),
  q('fulham', 'malbranque_fu03', 'Steed Malbranque', 1980, 'France', ['AM', 'RW'], 78, 83, 2006, 30, t(8, 6, 8, 7, 5, 8)),
  q('fulham', 'davis_s_fu03', 'Sean Davis', 1979, 'England', ['CM', 'DM'], 74, 78, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('fulham', 'boa_morte_fu03', 'Luís Boa Morte', 1977, 'Portugal', ['LW', 'ST'], 77, 80, 2006, 30, t(6, 7, 8, 7, 6, 8)),
  q('fulham', 'hayles_fu03', 'Barry Hayles', 1972, 'Jamaica', ['ST'], 73, 75, 2005, 30, t(7, 6, 8, 7, 5, 7)),
];

const BIRMINGHAM_03: CuratedSeed[] = [
  q('birmingham', 'maik_taylor_bi03', 'Maik Taylor', 1971, 'Northern Ireland', ['GK'], 76, 78, 2006, 30, t(9, 5, 8, 8, 5, 7)),
  q('birmingham', 'cunningham_bi03', 'Kenny Cunningham', 1971, 'Ireland', ['CB', 'RB'], 74, 75, 2005, 30, t(9, 5, 8, 8, 5, 7)),
  q('birmingham', 'upson_bi03', 'Matthew Upson', 1979, 'England', ['CB'], 76, 81, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('birmingham', 'johnson_d_bi03', 'Damien Johnson', 1978, 'Northern Ireland', ['CM', 'DM'], 73, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('birmingham', 'clemence_bi03', 'Stephen Clemence', 1978, 'England', ['CM'], 73, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('birmingham', 'dugarry_bi03', 'Christophe Dugarry', 1972, 'France', ['AM', 'ST'], 77, 78, 2005, 30, t(5, 8, 8, 6, 7, 8)),
  q('birmingham', 'forssell_bi03', 'Mikael Forssell', 1981, 'Finland', ['ST'], 76, 80, 2004, 30, t(7, 6, 8, 7, 5, 8)),
  q('birmingham', 'morrison_bi03', 'Clinton Morrison', 1979, 'Ireland', ['ST'], 73, 76, 2006, 30, t(7, 6, 8, 7, 5, 7)),
];

const MIDDLESBROUGH_03: CuratedSeed[] = [
  q('middlesbrough', 'schwarzer_mi03', 'Mark Schwarzer', 1972, 'Australia', ['GK'], 79, 81, 2006, 30, t(9, 5, 8, 8, 4, 8)),
  q('middlesbrough', 'southgate_mi03', 'Gareth Southgate', 1970, 'England', ['CB'], 79, 80, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('middlesbrough', 'ehiogu_mi03', 'Ugo Ehiogu', 1972, 'England', ['CB'], 77, 79, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'queudrue_mi03', 'Franck Queudrue', 1978, 'France', ['LB', 'CB'], 75, 79, 2006, 30, t(7, 6, 8, 7, 6, 8)),
  q('middlesbrough', 'boateng_mi03', 'George Boateng', 1975, 'Netherlands', ['CM', 'DM'], 77, 80, 2006, 30, t(8, 6, 8, 7, 5, 8)),
  q('middlesbrough', 'juninho_mi03', 'Juninho', 1973, 'Brazil', ['AM'], 79, 81, 2005, 30, t(8, 6, 8, 8, 5, 8)),
  q('middlesbrough', 'nemeth_mi03', 'Szilárd Németh', 1977, 'Slovakia', ['ST'], 73, 77, 2006, 30, t(7, 6, 8, 7, 5, 8)),
  q('middlesbrough', 'maccarone_mi03', 'Massimo Maccarone', 1979, 'Italy', ['ST'], 74, 79, 2007, 30, t(6, 7, 8, 6, 6, 8)),
  q('middlesbrough', 'job_mi03', 'Joseph-Désiré Job', 1977, 'Cameroon', ['ST', 'RW'], 73, 76, 2006, 30, t(7, 6, 8, 7, 5, 8)),
];

const SOUTHAMPTON_03: CuratedSeed[] = [
  q('southampton', 'niemi_so03', 'Antti Niemi', 1972, 'Finland', ['GK'], 79, 81, 2006, 30, t(9, 5, 8, 8, 5, 7)),
  q('southampton', 'm_svensson_so03', 'Michael Svensson', 1975, 'Sweden', ['CB'], 75, 77, 2006, 30, t(9, 5, 8, 8, 5, 7)),
  q('southampton', 'lundekvam_so03', 'Claus Lundekvam', 1973, 'Norway', ['CB'], 75, 77, 2006, 30, t(9, 5, 8, 8, 5, 7)),
  q('southampton', 'baird_so03', 'Chris Baird', 1982, 'Northern Ireland', ['RB', 'CB'], 71, 78, 2007, 30, t(9, 5, 8, 8, 5, 8)),
  q('southampton', 'a_svensson_so03', 'Anders Svensson', 1976, 'Sweden', ['AM', 'CM'], 76, 79, 2006, 30, t(8, 5, 8, 8, 5, 8)),
  q('southampton', 'oakley_so03', 'Matt Oakley', 1977, 'England', ['CM'], 74, 77, 2006, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('southampton', 'fernandes_so03', 'Fabrice Fernandes', 1979, 'France', ['RW', 'AM'], 75, 78, 2006, 30, t(6, 6, 8, 7, 6, 8)),
  q('southampton', 'beattie_so03', 'James Beattie', 1978, 'England', ['ST'], 78, 82, 2006, 30, t(8, 6, 8, 8, 5, 8)),
  q('southampton', 'phillips_so03', 'Kevin Phillips', 1973, 'England', ['ST'], 79, 81, 2006, 30, t(8, 6, 8, 8, 5, 8)),
];

const PORTSMOUTH_03: CuratedSeed[] = [
  q('portsmouth', 'hislop_po03', 'Shaka Hislop', 1969, 'Trinidad', ['GK'], 75, 76, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('portsmouth', 'de_zeeuw_po03', 'Arjan De Zeeuw', 1970, 'Netherlands', ['CB'], 74, 75, 2005, 30, t(9, 5, 8, 8, 5, 7)),
  q('portsmouth', 'stefanovic_po03', 'Dejan Stefanović', 1974, 'Serbia', ['CB'], 74, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('portsmouth', 'taylor_m_po03', 'Matthew Taylor', 1981, 'England', ['LB', 'LW'], 75, 80, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('portsmouth', 'quashie_po03', 'Nigel Quashie', 1978, 'Scotland', ['CM', 'DM'], 74, 77, 2006, 30, t(7, 5, 8, 7, 5, 8)),
  q('portsmouth', 'berger_po03', 'Patrik Berger', 1973, 'Czechia', ['AM', 'LW'], 76, 78, 2005, 35, t(7, 5, 8, 6, 5, 8)),
  q('portsmouth', 'sheringham_po03', 'Teddy Sheringham', 1966, 'England', ['ST', 'AM'], 77, 78, 2005, 30, t(8, 6, 8, 8, 5, 8)),
  q('portsmouth', 'yakubu_po03', 'Yakubu', 1982, 'Nigeria', ['ST'], 77, 82, 2007, 30, t(6, 7, 8, 7, 6, 8)),
  q('portsmouth', 'stone_po03', 'Steve Stone', 1971, 'England', ['RW', 'CM'], 73, 74, 2005, 30, t(8, 5, 8, 8, 5, 7)),
];

const BLACKBURN_03: CuratedSeed[] = [
  q('blackburn', 'friedel_bl03', 'Brad Friedel', 1971, 'United States', ['GK'], 80, 82, 2006, 30, t(9, 5, 8, 8, 4, 8)),
  q('blackburn', 'neill_bl03', 'Lucas Neill', 1978, 'Australia', ['RB', 'CB'], 76, 80, 2006, 30, t(8, 5, 8, 7, 6, 8)),
  q('blackburn', 'babbel_bl03', 'Markus Babbel', 1972, 'Germany', ['CB', 'RB'], 77, 78, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('blackburn', 'todd_a_bl03', 'Andy Todd', 1974, 'England', ['CB'], 72, 74, 2006, 30, t(7, 5, 8, 8, 6, 7)),
  q('blackburn', 'tugay_bl03', 'Tugay Kerimoğlu', 1970, 'Turkey', ['CM', 'DM'], 78, 79, 2005, 30, t(8, 6, 8, 7, 5, 8)),
  q('blackburn', 'ferguson_b_bl03', 'Barry Ferguson', 1978, 'Scotland', ['CM', 'DM'], 77, 81, 2007, 30, t(8, 6, 9, 8, 5, 8)),
  q('blackburn', 'emerton_bl03', 'Brett Emerton', 1979, 'Australia', ['RW', 'RB'], 77, 81, 2007, 30, t(8, 5, 8, 7, 5, 8)),
  q('blackburn', 'cole_a_bl03', 'Andy Cole', 1971, 'England', ['ST'], 76, 78, 2005, 30, t(7, 7, 8, 7, 6, 8)),
  q('blackburn', 'yorke_bl03', 'Dwight Yorke', 1971, 'Trinidad', ['ST', 'AM'], 75, 77, 2005, 30, t(6, 7, 8, 7, 6, 8)),
];

const EVERTON_03: CuratedSeed[] = [
  q('everton', 'martyn_ev03', 'Nigel Martyn', 1966, 'England', ['GK'], 78, 79, 2005, 30, t(9, 5, 8, 8, 4, 8)),
  q('everton', 'yobo_ev03', 'Joseph Yobo', 1980, 'Nigeria', ['CB'], 77, 82, 2007, 30, t(8, 5, 8, 8, 5, 8)),
  q('everton', 'weir_ev03', 'David Weir', 1970, 'Scotland', ['CB'], 76, 77, 2005, 30, t(9, 5, 8, 8, 4, 7)),
  q('everton', 'stubbs_ev03', 'Alan Stubbs', 1971, 'England', ['CB'], 74, 75, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'gravesen_ev03', 'Thomas Gravesen', 1976, 'Denmark', ['CM', 'DM'], 78, 82, 2006, 30, t(6, 7, 8, 7, 7, 8)),
  q('everton', 'carsley_ev03', 'Lee Carsley', 1974, 'Ireland', ['DM', 'CM'], 74, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'kilbane_ev03', 'Kevin Kilbane', 1977, 'Ireland', ['LW', 'LB'], 74, 77, 2006, 30, t(8, 5, 8, 8, 5, 8)),
  q('everton', 'radzinski_ev03', 'Tomasz Radzinski', 1973, 'Canada', ['ST', 'LW'], 75, 77, 2005, 30, t(7, 6, 8, 7, 5, 8)),
  q('everton', 'rooney_ev03', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 78, 92, 2007, 30, t(7, 7, 10, 8, 6, 8)),
];

const LEICESTER_03: CuratedSeed[] = [
  q('leicester', 'walker_i_le03', 'Ian Walker', 1971, 'England', ['GK'], 75, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'elliott_le03', 'Matt Elliott', 1968, 'Scotland', ['CB'], 74, 75, 2005, 30, t(9, 5, 8, 8, 5, 7)),
  q('leicester', 'sinclair_le03', 'Frank Sinclair', 1971, 'Jamaica', ['CB', 'RB'], 72, 73, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'thatcher_le03', 'Ben Thatcher', 1975, 'England', ['LB'], 73, 76, 2006, 30, t(7, 6, 8, 7, 6, 7)),
  q('leicester', 'izzet_le03', 'Muzzy Izzet', 1974, 'Turkey', ['CM', 'AM'], 76, 79, 2006, 30, t(8, 5, 8, 8, 5, 8)),
  q('leicester', 'scimeca_le03', 'Riccardo Scimeca', 1975, 'England', ['DM', 'CB'], 72, 74, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'ferdinand_l_le03', 'Les Ferdinand', 1966, 'England', ['ST'], 75, 76, 2005, 30, t(8, 6, 8, 8, 5, 8)),
  q('leicester', 'dickov_le03', 'Paul Dickov', 1972, 'Scotland', ['ST'], 72, 74, 2005, 30, t(7, 6, 8, 8, 6, 7)),
  q('leicester', 'bent_m_le03', 'Marcus Bent', 1978, 'England', ['ST'], 74, 78, 2006, 30, t(7, 6, 8, 7, 5, 8)),
];

const LEEDS_03: CuratedSeed[] = [
  q('leeds', 'robinson_le03', 'Paul Robinson', 1979, 'England', ['GK'], 80, 84, 2006, 30, t(9, 5, 8, 8, 4, 8)),
  q('leeds', 'matteo_le03', 'Dominic Matteo', 1974, 'Scotland', ['CB', 'LB'], 76, 77, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('leeds', 'radebe_le03', 'Lucas Radebe', 1969, 'South Africa', ['CB'], 74, 75, 2005, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('leeds', 'harte_le03', 'Ian Harte', 1977, 'Ireland', ['LB'], 76, 78, 2005, 30, t(8, 5, 8, 8, 5, 8)),
  q('leeds', 'kelly_g_le03', 'Gary Kelly', 1974, 'Ireland', ['RB'], 75, 76, 2005, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('leeds', 'batty_le03', 'David Batty', 1968, 'England', ['DM', 'CM'], 76, 77, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('leeds', 'bakke_le03', 'Eirik Bakke', 1977, 'Norway', ['CM', 'DM'], 74, 78, 2006, 30, t(8, 5, 8, 7, 5, 8)),
  q('leeds', 'smith_a_le03', 'Alan Smith', 1980, 'England', ['ST', 'AM'], 78, 83, 2006, 30, t(7, 7, 9, 8, 7, 8)),
  q('leeds', 'viduka_le03', 'Mark Viduka', 1975, 'Australia', ['ST'], 80, 82, 2005, 30, t(6, 7, 8, 7, 6, 8)),
  q('leeds', 'milner_le03', 'James Milner', 1986, 'England', ['RW', 'CM'], 68, 84, 2007, 30, t(9, 5, 9, 8, 4, 8)),
];

const WOLVES_03: CuratedSeed[] = [
  q('wolves', 'jones_p_wo03', 'Paul Jones', 1967, 'Wales', ['GK'], 74, 75, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('wolves', 'lescott_wo03', 'Joleon Lescott', 1982, 'England', ['CB', 'LB'], 74, 84, 2007, 30, t(9, 5, 8, 8, 4, 8)),
  q('wolves', 'butler_wo03', 'Paul Butler', 1972, 'Ireland', ['CB'], 72, 73, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('wolves', 'naylor_wo03', 'Lee Naylor', 1980, 'England', ['LB'], 72, 76, 2006, 30, t(8, 5, 8, 8, 5, 7)),
  q('wolves', 'ince_wo03', 'Paul Ince', 1967, 'England', ['CM', 'DM'], 74, 75, 2004, 30, t(7, 8, 9, 7, 6, 8)),
  q('wolves', 'cameron_wo03', 'Colin Cameron', 1972, 'Scotland', ['CM', 'AM'], 73, 74, 2005, 30, t(8, 5, 8, 8, 5, 7)),
  q('wolves', 'miller_k_wo03', 'Kenny Miller', 1979, 'Scotland', ['ST'], 74, 78, 2006, 30, t(7, 6, 8, 7, 5, 8)),
  q('wolves', 'camara_h_wo03', 'Henri Camara', 1977, 'Senegal', ['ST', 'LW'], 74, 78, 2006, 30, t(6, 7, 8, 6, 6, 8)),
  q('wolves', 'cort_wo03', 'Carl Cort', 1977, 'England', ['ST'], 72, 76, 2006, 30, t(7, 6, 8, 7, 5, 7)),
];

/** The domestic mid-tier of the 2003-04 PL. Merged by CONCATENATION into the
 *  chelsea-2003 pack (MANUTD_2003_SQUADS). */
export const ENG_DOMESTIC_2003_SQUADS: Record<string, CuratedSeed[]> = {
  newcastle: NEWCASTLE_03,
  aston_villa: ASTON_VILLA_03,
  charlton: CHARLTON_03,
  bolton: BOLTON_03,
  fulham: FULHAM_03,
  birmingham: BIRMINGHAM_03,
  middlesbrough: MIDDLESBROUGH_03,
  southampton: SOUTHAMPTON_03,
  portsmouth: PORTSMOUTH_03,
  blackburn: BLACKBURN_03,
  everton: EVERTON_03,
  leicester: LEICESTER_03,
  leeds: LEEDS_03,
  wolves: WOLVES_03,
};
