/**
 * Curated domestic mid-tier — 1999-2000 Premier League (M12 shortlist supply).
 *
 * The real squad players of the modelled English clubs OUTSIDE the elite, so a
 * manager asking for options in a position gets a realistic shortlist of pullable
 * targets — the Kirklands, Marian Paharses and Kevin Phillipses of the day — not a
 * wall of anonymous filler. These are the bread-and-butter of a real transfer
 * market: gettable squad players and prospects, not galácticos.
 *
 * Ability/potential/personality are HIDDEN designer estimates (§7); clubs, birth
 * years, positions and contracts are real. Names already curated in the
 * man-utd-1999 world (Ferdinand & R. Keane parked at Leeds, Le Tissier at
 * Southampton, Shearer at Newcastle, Carr at Spurs) are omitted — no double-roster.
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

// ── Aston Villa, 1999-2000 (Gregory's side; David James in goal) ───────────────
const ASTON_VILLA_99: CuratedSeed[] = [
  q('aston_villa', 'james_av99', 'David James', 1970, 'England', ['GK'], 80, 83, 2003, 30, t(6, 7, 8, 7, 6, 8)),
  q('aston_villa', 'southgate_av99', 'Gareth Southgate', 1970, 'England', ['CB', 'DM'], 80, 82, 2003, 30, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'ehiogu_av99', 'Ugo Ehiogu', 1972, 'England', ['CB'], 79, 81, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'barry_av99', 'Gareth Barry', 1981, 'England', ['LB', 'CM'], 70, 86, 2004, 35, t(9, 5, 8, 8, 4, 8)),
  q('aston_villa', 'wright_av99', 'Alan Wright', 1971, 'England', ['LB'], 74, 76, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'watson_av99', 'Steve Watson', 1974, 'England', ['RB', 'RW'], 75, 77, 2003, 30, t(8, 5, 8, 8, 5, 8)),
  q('aston_villa', 'taylor_av99', 'Ian Taylor', 1968, 'England', ['CM'], 74, 76, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('aston_villa', 'boateng_av99', 'George Boateng', 1975, 'Netherlands', ['CM', 'DM'], 77, 80, 2003, 30, t(8, 6, 8, 7, 5, 8)),
  q('aston_villa', 'merson_av99', 'Paul Merson', 1968, 'England', ['AM'], 78, 79, 2002, 35, t(5, 7, 8, 6, 7, 8)),
  q('aston_villa', 'dublin_av99', 'Dion Dublin', 1969, 'England', ['ST', 'CB'], 77, 78, 2002, 30, t(8, 6, 8, 8, 5, 8)),
  q('aston_villa', 'joachim_av99', 'Julian Joachim', 1974, 'England', ['ST'], 74, 77, 2002, 30, t(7, 6, 8, 7, 5, 8)),
  q('aston_villa', 'carbone_av99', 'Benito Carbone', 1971, 'Italy', ['AM', 'ST'], 76, 78, 2001, 30, t(5, 8, 8, 5, 7, 8)),
];

// ── Sunderland, 1999-2000 (Reid's side; the Phillips–Quinn strike pair) ────────
const SUNDERLAND_99: CuratedSeed[] = [
  q('sunderland', 'sorensen_su99', 'Thomas Sørensen', 1976, 'Denmark', ['GK'], 78, 83, 2003, 30, t(9, 5, 8, 8, 4, 8)),
  q('sunderland', 'phillips_su99', 'Kevin Phillips', 1973, 'England', ['ST'], 80, 82, 2003, 30, t(8, 6, 8, 8, 5, 8)),
  q('sunderland', 'quinn_su99', 'Niall Quinn', 1966, 'Ireland', ['ST'], 77, 78, 2002, 35, t(8, 6, 8, 8, 5, 8)),
  q('sunderland', 'gray_su99', 'Michael Gray', 1974, 'England', ['LB'], 75, 77, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'makin_su99', 'Chris Makin', 1973, 'England', ['RB'], 74, 76, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'butler_su99', 'Paul Butler', 1972, 'Ireland', ['CB'], 74, 76, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'schwarz_su99', 'Stefan Schwarz', 1969, 'Sweden', ['DM', 'CM'], 78, 79, 2002, 30, t(8, 5, 8, 7, 5, 8)),
  q('sunderland', 'mccann_su99', 'Gavin McCann', 1978, 'England', ['CM', 'DM'], 73, 80, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('sunderland', 'summerbee_su99', 'Nicky Summerbee', 1971, 'England', ['RW'], 73, 75, 2002, 30, t(7, 5, 8, 7, 5, 7)),
  q('sunderland', 'rae_su99', 'Alex Rae', 1969, 'Scotland', ['CM'], 72, 74, 2002, 30, t(7, 6, 8, 7, 6, 7)),
];

// ── Leicester City, 1999-2000 (O'Neill's cup side) ─────────────────────────────
const LEICESTER_99: CuratedSeed[] = [
  q('leicester', 'flowers_le99', 'Tim Flowers', 1967, 'England', ['GK'], 76, 77, 2002, 30, t(8, 6, 8, 8, 5, 7)),
  q('leicester', 'elliott_le99', 'Matt Elliott', 1968, 'Scotland', ['CB'], 78, 79, 2002, 30, t(9, 5, 8, 8, 5, 7)),
  q('leicester', 'sinclair_le99', 'Frank Sinclair', 1971, 'Jamaica', ['CB', 'RB'], 74, 76, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'heskey_le99', 'Emile Heskey', 1978, 'England', ['ST'], 78, 84, 2003, 30, t(8, 6, 8, 8, 5, 8)),
  q('leicester', 'izzet_le99', 'Muzzy Izzet', 1974, 'Turkey', ['CM', 'AM'], 77, 80, 2003, 30, t(8, 5, 8, 8, 5, 8)),
  q('leicester', 'savage_le99', 'Robbie Savage', 1974, 'Wales', ['DM', 'CM'], 74, 77, 2003, 30, t(6, 7, 8, 7, 6, 7)),
  q('leicester', 'lennon_le99', 'Neil Lennon', 1971, 'Northern Ireland', ['DM', 'CM'], 77, 79, 2002, 30, t(8, 6, 8, 8, 6, 7)),
  q('leicester', 'guppy_le99', 'Steve Guppy', 1969, 'England', ['LW', 'LB'], 74, 76, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('leicester', 'cottee_le99', 'Tony Cottee', 1965, 'England', ['ST'], 73, 74, 2001, 30, t(8, 6, 8, 8, 5, 7)),
  q('leicester', 'taggart_le99', 'Gerry Taggart', 1970, 'Northern Ireland', ['CB'], 73, 75, 2002, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── West Ham United, 1999-2000 (the academy: Lampard, Joe Cole, Di Canio) ──────
const WEST_HAM_99: CuratedSeed[] = [
  q('west_ham', 'hislop_wh99', 'Shaka Hislop', 1969, 'Trinidad', ['GK'], 76, 78, 2002, 30, t(8, 5, 8, 8, 5, 8)),
  q('west_ham', 'lampard_wh99', 'Frank Lampard', 1978, 'England', ['CM', 'AM'], 76, 88, 2004, 35, t(9, 6, 9, 8, 4, 8)),
  q('west_ham', 'joe_cole_wh99', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 72, 86, 2004, 30, t(7, 7, 9, 8, 5, 8)),
  q('west_ham', 'di_canio_wh99', 'Paolo Di Canio', 1968, 'Italy', ['AM', 'ST'], 81, 82, 2002, 30, t(5, 9, 8, 7, 8, 8)),
  q('west_ham', 'sinclair_wh99', 'Trevor Sinclair', 1973, 'England', ['RW', 'RB'], 77, 79, 2003, 30, t(8, 6, 8, 8, 5, 8)),
  q('west_ham', 'foe_wh99', 'Marc-Vivien Foé', 1975, 'Cameroon', ['DM', 'CM'], 78, 81, 2002, 30, t(9, 5, 8, 8, 5, 8)),
  q('west_ham', 'lomas_wh99', 'Steve Lomas', 1974, 'Northern Ireland', ['CM', 'DM'], 74, 76, 2003, 30, t(8, 5, 8, 8, 6, 7)),
  q('west_ham', 'pearce_wh99', 'Stuart Pearce', 1962, 'England', ['LB'], 76, 76, 2001, 30, t(9, 6, 8, 9, 6, 7), { loyalty: 88 }),
  q('west_ham', 'wanchope_wh99', 'Paulo Wanchope', 1976, 'Costa Rica', ['ST'], 77, 80, 2002, 30, t(6, 7, 8, 6, 6, 8)),
  q('west_ham', 'stimac_wh99', 'Igor Štimac', 1967, 'Croatia', ['CB'], 76, 77, 2001, 30, t(8, 5, 8, 7, 6, 7)),
  q('west_ham', 'ruddock_wh99', 'Neil Ruddock', 1968, 'England', ['CB'], 73, 74, 2001, 35, t(6, 6, 8, 7, 7, 7)),
];

// ── Middlesbrough, 1999-2000 (Robson's side; Juninho, Ince, Ziege) ─────────────
const MIDDLESBROUGH_99: CuratedSeed[] = [
  q('middlesbrough', 'schwarzer_mi99', 'Mark Schwarzer', 1972, 'Australia', ['GK'], 78, 81, 2003, 30, t(9, 5, 8, 8, 4, 8)),
  q('middlesbrough', 'pallister_mi99', 'Gary Pallister', 1965, 'England', ['CB'], 77, 78, 2001, 30, t(9, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'festa_mi99', 'Gianluca Festa', 1969, 'Italy', ['CB'], 75, 77, 2002, 30, t(8, 5, 8, 8, 6, 7)),
  q('middlesbrough', 'ince_mi99', 'Paul Ince', 1967, 'England', ['CM', 'DM'], 80, 81, 2002, 30, t(7, 8, 9, 7, 6, 8)),
  q('middlesbrough', 'juninho_mi99', 'Juninho', 1973, 'Brazil', ['AM'], 82, 84, 2001, 30, t(8, 6, 8, 8, 5, 8)),
  q('middlesbrough', 'ziege_mi99', 'Christian Ziege', 1972, 'Germany', ['LB', 'LW'], 79, 81, 2002, 30, t(8, 6, 8, 7, 5, 8)),
  q('middlesbrough', 'ricard_mi99', 'Hamilton Ricard', 1974, 'Colombia', ['ST'], 74, 77, 2002, 30, t(6, 6, 8, 7, 6, 7)),
  q('middlesbrough', 'deane_mi99', 'Brian Deane', 1968, 'England', ['ST'], 73, 74, 2001, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'mustoe_mi99', 'Robbie Mustoe', 1968, 'England', ['CM', 'DM'], 72, 73, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('middlesbrough', 'gordon_mi99', 'Dean Gordon', 1973, 'England', ['LB'], 72, 74, 2002, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Everton, 1999-2000 (Smith's side; a teenage Francis Jeffers) ───────────────
const EVERTON_99: CuratedSeed[] = [
  q('everton', 'gerrard_ev99', 'Paul Gerrard', 1973, 'England', ['GK'], 73, 75, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'weir_ev99', 'David Weir', 1970, 'Scotland', ['CB'], 77, 79, 2003, 30, t(9, 5, 8, 8, 4, 7)),
  q('everton', 'ball_m_ev99', 'Michael Ball', 1979, 'England', ['LB', 'CB'], 74, 81, 2004, 30, t(8, 5, 8, 8, 5, 8)),
  q('everton', 'hutchison_ev99', 'Don Hutchison', 1971, 'Scotland', ['CM', 'AM'], 76, 78, 2002, 30, t(7, 6, 8, 7, 6, 8)),
  q('everton', 'collins_ev99', 'John Collins', 1968, 'Scotland', ['CM'], 77, 78, 2001, 30, t(9, 5, 8, 8, 4, 8)),
  q('everton', 'barmby_ev99', 'Nick Barmby', 1974, 'England', ['AM'], 77, 79, 2002, 30, t(8, 6, 8, 7, 5, 8)),
  q('everton', 'campbell_ev99', 'Kevin Campbell', 1970, 'England', ['ST'], 76, 78, 2002, 30, t(8, 6, 8, 8, 5, 8)),
  q('everton', 'jeffers_ev99', 'Francis Jeffers', 1981, 'England', ['ST'], 71, 84, 2004, 35, t(6, 7, 8, 7, 6, 8)),
  q('everton', 'pembridge_ev99', 'Mark Pembridge', 1970, 'Wales', ['LW', 'CM'], 73, 75, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('everton', 'unsworth_ev99', 'David Unsworth', 1973, 'England', ['CB', 'LB'], 74, 76, 2003, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Coventry City, 1999-2000 (Strachan's side; a teenage Kirkland behind Hedman) ─
const COVENTRY_99: CuratedSeed[] = [
  q('coventry', 'hedman_co99', 'Magnus Hedman', 1973, 'Sweden', ['GK'], 76, 79, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('coventry', 'kirkland_co99', 'Chris Kirkland', 1981, 'England', ['GK'], 68, 85, 2004, 35, t(8, 6, 8, 8, 5, 7)),
  q('coventry', 'mcallister_co99', 'Gary McAllister', 1964, 'Scotland', ['CM', 'AM'], 79, 80, 2001, 30, t(9, 6, 8, 8, 5, 8)),
  q('coventry', 'hadji_co99', 'Mustapha Hadji', 1971, 'Morocco', ['AM', 'RW'], 77, 79, 2002, 30, t(7, 6, 8, 7, 5, 8)),
  q('coventry', 'chippo_co99', 'Youssef Chippo', 1973, 'Morocco', ['CM', 'DM'], 74, 77, 2003, 30, t(8, 5, 8, 7, 5, 8)),
  q('coventry', 'aloisi_co99', 'John Aloisi', 1976, 'Australia', ['ST'], 74, 77, 2002, 30, t(7, 6, 8, 7, 5, 8)),
  q('coventry', 'roussel_co99', 'Cédric Roussel', 1978, 'Belgium', ['ST'], 71, 76, 2003, 30, t(7, 5, 8, 7, 5, 7)),
  q('coventry', 'whelan_co99', 'Noel Whelan', 1974, 'England', ['ST', 'AM'], 73, 75, 2002, 30, t(6, 6, 8, 7, 6, 7)),
  q('coventry', 'telfer_co99', 'Paul Telfer', 1971, 'Scotland', ['RB', 'CM'], 73, 75, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('coventry', 'breen_co99', 'Gary Breen', 1973, 'Ireland', ['CB'], 74, 76, 2002, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Derby County, 1999-2000 (a young Seth Johnson; Eranio's craft) ─────────────
const DERBY_99: CuratedSeed[] = [
  q('derby', 'poom_de99', 'Mart Poom', 1972, 'Estonia', ['GK'], 76, 79, 2002, 30, t(9, 5, 8, 8, 5, 7)),
  q('derby', 'carbonari_de99', 'Horacio Carbonari', 1973, 'Argentina', ['CB'], 74, 76, 2002, 30, t(7, 6, 8, 7, 6, 7)),
  q('derby', 'west_de99', 'Taribo West', 1974, 'Nigeria', ['CB'], 75, 77, 2001, 30, t(7, 6, 8, 7, 6, 8)),
  q('derby', 'johnson_s_de99', 'Seth Johnson', 1979, 'England', ['CM', 'DM'], 72, 81, 2004, 30, t(8, 5, 8, 8, 5, 8)),
  q('derby', 'delap_de99', 'Rory Delap', 1976, 'Ireland', ['CM', 'RB'], 73, 77, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('derby', 'eranio_de99', 'Stefano Eranio', 1966, 'Italy', ['RW', 'AM'], 77, 78, 2001, 30, t(8, 6, 8, 8, 5, 8)),
  q('derby', 'burton_de99', 'Deon Burton', 1976, 'Jamaica', ['ST'], 72, 75, 2002, 30, t(7, 6, 8, 7, 5, 7)),
  q('derby', 'sturridge_de99', 'Dean Sturridge', 1973, 'England', ['ST'], 72, 74, 2002, 30, t(7, 6, 8, 7, 5, 7)),
  q('derby', 'baiano_de99', 'Francesco Baiano', 1968, 'Italy', ['AM', 'ST'], 74, 76, 2001, 30, t(6, 7, 8, 6, 6, 8)),
  q('derby', 'laursen_de99', 'Jacob Laursen', 1971, 'Denmark', ['CB', 'RB'], 73, 75, 2002, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Bradford City, 1999-2000 (the great escape; Windass & Mills up top) ────────
const BRADFORD_99: CuratedSeed[] = [
  q('bradford', 'clarke_br99', 'Matt Clarke', 1973, 'England', ['GK'], 71, 73, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('bradford', 'wetherall_br99', 'David Wetherall', 1971, 'England', ['CB'], 74, 76, 2003, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('bradford', 'obrien_br99', 'Andy O’Brien', 1979, 'Ireland', ['CB'], 71, 80, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('bradford', 'jacobs_br99', 'Wayne Jacobs', 1969, 'England', ['LB'], 70, 71, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('bradford', 'mccall_br99', 'Stuart McCall', 1964, 'Scotland', ['CM'], 73, 74, 2001, 30, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('bradford', 'beagrie_br99', 'Peter Beagrie', 1965, 'England', ['LW'], 72, 73, 2001, 30, t(7, 6, 8, 7, 5, 7)),
  q('bradford', 'windass_br99', 'Dean Windass', 1969, 'England', ['ST'], 73, 75, 2002, 30, t(7, 6, 8, 7, 6, 7)),
  q('bradford', 'mills_br99', 'Lee Mills', 1970, 'England', ['ST'], 71, 73, 2002, 30, t(7, 5, 8, 7, 5, 7)),
  q('bradford', 'blake_br99', 'Robbie Blake', 1976, 'England', ['ST', 'AM'], 71, 76, 2003, 30, t(7, 6, 8, 7, 5, 7)),
  q('bradford', 'redfearn_br99', 'Neil Redfearn', 1965, 'England', ['CM'], 71, 72, 2001, 30, t(8, 5, 8, 8, 5, 7)),
];

// ── Wimbledon, 1999-2000 (the Crazy Gang's last top-flight season) ─────────────
const WIMBLEDON_99: CuratedSeed[] = [
  q('wimbledon', 'sullivan_wi99', 'Neil Sullivan', 1970, 'Scotland', ['GK'], 76, 78, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('wimbledon', 'cunningham_wi99', 'Kenny Cunningham', 1971, 'Ireland', ['CB', 'RB'], 76, 78, 2003, 30, t(9, 5, 8, 8, 5, 7)),
  q('wimbledon', 'thatcher_wi99', 'Ben Thatcher', 1975, 'England', ['LB'], 74, 77, 2003, 30, t(7, 6, 8, 7, 6, 7)),
  q('wimbledon', 'earle_wi99', 'Robbie Earle', 1965, 'Jamaica', ['CM', 'AM'], 74, 75, 2001, 30, t(8, 5, 8, 8, 5, 7)),
  q('wimbledon', 'euell_wi99', 'Jason Euell', 1977, 'Jamaica', ['ST', 'AM'], 74, 78, 2003, 30, t(7, 6, 8, 7, 5, 8)),
  q('wimbledon', 'cort_wi99', 'Carl Cort', 1977, 'England', ['ST'], 73, 78, 2003, 30, t(7, 6, 8, 7, 5, 7)),
  q('wimbledon', 'hartson_wi99', 'John Hartson', 1975, 'Wales', ['ST'], 76, 78, 2002, 35, t(7, 6, 8, 7, 6, 8)),
  q('wimbledon', 'gayle_wi99', 'Marcus Gayle', 1970, 'Jamaica', ['LW', 'ST'], 72, 74, 2002, 30, t(7, 5, 8, 7, 5, 7)),
  q('wimbledon', 'hughes_m_wi99', 'Michael Hughes', 1971, 'Northern Ireland', ['LW', 'CM'], 73, 75, 2002, 30, t(7, 5, 8, 7, 5, 8)),
  q('wimbledon', 'andersen_wi99', 'Trond Andersen', 1975, 'Norway', ['DM', 'CM'], 72, 75, 2003, 30, t(8, 5, 8, 7, 5, 7)),
];

// ── Sheffield Wednesday, 1999-2000 ─────────────────────────────────────────────
const SHEFFIELD_WEDNESDAY_99: CuratedSeed[] = [
  q('sheffield_wednesday', 'pressman_sw99', 'Kevin Pressman', 1967, 'England', ['GK'], 73, 74, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'thome_sw99', 'Emerson Thome', 1972, 'Brazil', ['CB'], 76, 78, 2002, 30, t(8, 5, 8, 7, 5, 8)),
  q('sheffield_wednesday', 'walker_d_sw99', 'Des Walker', 1965, 'England', ['CB'], 74, 75, 2001, 30, t(9, 5, 8, 8, 4, 7)),
  q('sheffield_wednesday', 'hinchcliffe_sw99', 'Andy Hinchcliffe', 1969, 'England', ['LB'], 74, 76, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'jonk_sw99', 'Wim Jonk', 1966, 'Netherlands', ['CM', 'AM'], 78, 79, 2002, 30, t(9, 5, 8, 8, 5, 8)),
  q('sheffield_wednesday', 'alexandersson_sw99', 'Niclas Alexandersson', 1971, 'Sweden', ['RW', 'CM'], 75, 78, 2002, 30, t(8, 5, 8, 7, 5, 8)),
  q('sheffield_wednesday', 'rudi_sw99', 'Petter Rudi', 1973, 'Norway', ['AM', 'LW'], 73, 76, 2002, 30, t(7, 5, 8, 7, 5, 8)),
  q('sheffield_wednesday', 'de_bilde_sw99', 'Gilles De Bilde', 1971, 'Belgium', ['ST'], 74, 76, 2002, 30, t(6, 6, 8, 7, 6, 7)),
  q('sheffield_wednesday', 'booth_sw99', 'Andy Booth', 1973, 'England', ['ST'], 72, 74, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('sheffield_wednesday', 'sonner_sw99', 'Danny Sonner', 1972, 'Northern Ireland', ['CM', 'DM'], 70, 72, 2001, 30, t(7, 5, 8, 7, 5, 7)),
];

// ── Watford, 1999-2000 (Taylor's promoted side, straight back down) ────────────
const WATFORD_99: CuratedSeed[] = [
  q('watford', 'chamberlain_wa99', 'Alec Chamberlain', 1964, 'England', ['GK'], 70, 71, 2002, 30, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('watford', 'page_wa99', 'Robert Page', 1974, 'Wales', ['CB'], 72, 74, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('watford', 'palmer_wa99', 'Steve Palmer', 1968, 'England', ['CB', 'CM'], 70, 71, 2001, 30, t(8, 5, 8, 8, 5, 7)),
  q('watford', 'hyde_wa99', 'Micah Hyde', 1974, 'Jamaica', ['CM', 'AM'], 71, 74, 2002, 30, t(8, 5, 8, 7, 5, 8)),
  q('watford', 'nielsen_wa99', 'Allan Nielsen', 1971, 'Denmark', ['CM', 'AM'], 73, 75, 2002, 30, t(8, 5, 8, 7, 5, 8)),
  q('watford', 'wooter_wa99', 'Nordin Wooter', 1976, 'Netherlands', ['RW', 'LW'], 71, 76, 2003, 30, t(6, 6, 8, 6, 6, 8)),
  q('watford', 'mooney_wa99', 'Tommy Mooney', 1971, 'England', ['ST'], 71, 73, 2002, 30, t(8, 5, 8, 8, 6, 7)),
  q('watford', 'johnson_r_wa99', 'Richard Johnson', 1974, 'Australia', ['CM', 'DM'], 70, 72, 2002, 30, t(8, 5, 8, 7, 5, 7)),
  q('watford', 'kennedy_wa99', 'Peter Kennedy', 1973, 'Northern Ireland', ['LW', 'LB'], 70, 72, 2002, 30, t(7, 5, 8, 7, 5, 7)),
];

// ── Newcastle United top-up (Shearer already curated) ──────────────────────────
const NEWCASTLE_99_EXTRA: CuratedSeed[] = [
  q('newcastle', 'given_nu99', 'Shay Given', 1976, 'Ireland', ['GK'], 79, 84, 2003, 35, t(9, 5, 8, 8, 4, 8)),
  q('newcastle', 'dyer_nu99', 'Kieron Dyer', 1978, 'England', ['CM', 'RW'], 76, 85, 2004, 35, t(7, 6, 9, 7, 5, 8)),
  q('newcastle', 'solano_nu99', 'Nolberto Solano', 1974, 'Peru', ['RW', 'AM'], 78, 80, 2003, 30, t(8, 6, 8, 8, 5, 8)),
  q('newcastle', 'lee_nu99', 'Rob Lee', 1966, 'England', ['CM'], 76, 77, 2002, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('newcastle', 'domi_nu99', 'Didier Domi', 1978, 'France', ['LB'], 74, 79, 2003, 30, t(7, 6, 8, 7, 5, 8)),
  q('newcastle', 'dabizas_nu99', 'Nikos Dabizas', 1973, 'Greece', ['CB'], 75, 77, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('newcastle', 'hughes_a_nu99', 'Aaron Hughes', 1979, 'Northern Ireland', ['CB', 'RB'], 73, 81, 2004, 35, t(9, 5, 8, 8, 4, 8)),
  q('newcastle', 'ferguson_d_nu99', 'Duncan Ferguson', 1971, 'Scotland', ['ST'], 77, 79, 2002, 35, t(6, 7, 8, 7, 7, 7)),
];

// ── Southampton top-up (Le Tissier already curated) ────────────────────────────
const SOUTHAMPTON_99_EXTRA: CuratedSeed[] = [
  q('southampton', 'jones_p_so99', 'Paul Jones', 1967, 'Wales', ['GK'], 76, 77, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'pahars_so99', 'Marian Pahars', 1976, 'Latvia', ['ST'], 76, 80, 2003, 30, t(8, 5, 8, 8, 5, 8)),
  q('southampton', 'beattie_so99', 'James Beattie', 1978, 'England', ['ST'], 74, 82, 2004, 30, t(8, 6, 8, 8, 5, 8)),
  q('southampton', 'richards_d_so99', 'Dean Richards', 1974, 'England', ['CB'], 77, 80, 2003, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'lundekvam_so99', 'Claus Lundekvam', 1973, 'Norway', ['CB'], 75, 78, 2003, 30, t(9, 5, 8, 8, 5, 7)),
  q('southampton', 'bridge_so99', 'Wayne Bridge', 1980, 'England', ['LB'], 72, 83, 2004, 30, t(9, 5, 8, 8, 5, 8)),
  q('southampton', 'marsden_so99', 'Chris Marsden', 1969, 'England', ['CM'], 73, 75, 2002, 30, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'davies_k_so99', 'Kevin Davies', 1977, 'England', ['ST'], 73, 78, 2003, 30, t(7, 6, 8, 7, 5, 7)),
];

/** The modelled-league domestic mid-tier of the 1999-2000 Premier League — real
 *  squad players at the non-elite clubs, so options lists read like a real
 *  shortlist. Merged by CONCATENATION into MAN_UTD_1999_SQUADS. */
export const ENG_DOMESTIC_1999_SQUADS: Record<string, CuratedSeed[]> = {
  aston_villa: ASTON_VILLA_99,
  sunderland: SUNDERLAND_99,
  leicester: LEICESTER_99,
  west_ham: WEST_HAM_99,
  middlesbrough: MIDDLESBROUGH_99,
  everton: EVERTON_99,
  coventry: COVENTRY_99,
  derby: DERBY_99,
  bradford: BRADFORD_99,
  wimbledon: WIMBLEDON_99,
  sheffield_wednesday: SHEFFIELD_WEDNESDAY_99,
  watford: WATFORD_99,
  newcastle: NEWCASTLE_99_EXTRA,
  southampton: SOUTHAMPTON_99_EXTRA,
};
