/**
 * Academy graduates — the real next generation for the era-1995-2005 world
 * (man-utd-1999 and the other late-90s English starts route here).
 *
 * A 1999 start runs 26 years; without new blood the world ages into its kickoff
 * generation. These are the real players who broke through 2000-2005 at clubs that
 * exist in the scenario — Rooney bursting through at Everton, a teenage Messi at
 * Barça, Kaká at Milan, the golden generation of English midfielders — instantiated
 * at their real debut window by INTAKES_1999. They arrive young and grow through the
 * normal development system (§5). Ability/potential/personality are HIDDEN designer
 * estimates (§7); clubs, birth years, positions and debut years are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import type { AcademyIntake } from '../ledger.js';

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

/** The graduate seeds — instantiated at their debut year by INTAKES_1999. */
export const GRADUATES_1999: CuratedSeed[] = [
  // ── England's golden generation ──
  q('everton', 'rooney_grad', 'Wayne Rooney', 1985, 'England', ['ST', 'AM'], 68, 90, 2006, 25, t(7, 7, 9, 7, 7, 8)),
  q('chelsea', 'terry_grad', 'John Terry', 1980, 'England', ['CB'], 72, 86, 2007, 20, t(9, 7, 9, 10, 6, 7), { loyalty: 92 }),
  q('chelsea', 'lampard_grad', 'Frank Lampard', 1978, 'England', ['CM', 'AM'], 76, 87, 2007, 15, t(10, 6, 9, 9, 4, 7)),
  q('arsenal', 'a_cole_grad', 'Ashley Cole', 1980, 'England', ['LB'], 70, 86, 2006, 20, t(8, 7, 9, 7, 6, 7)),
  q('west_ham', 'j_cole_grad', 'Joe Cole', 1981, 'England', ['AM', 'LW'], 66, 83, 2004, 25, t(7, 6, 8, 7, 6, 8)),
  q('west_ham', 'defoe_grad', 'Jermain Defoe', 1982, 'England', ['ST'], 66, 82, 2005, 20, t(8, 6, 8, 7, 5, 8)),
  q('leeds', 'smith_grad', 'Alan Smith', 1980, 'England', ['ST', 'AM'], 68, 82, 2004, 25, t(7, 7, 8, 8, 7, 7)),
  q('leeds', 'milner_grad', 'James Milner', 1986, 'England', ['RW', 'CM'], 58, 82, 2007, 15, t(10, 5, 9, 8, 4, 8)),
  q('man_city', 'swp_grad', 'Shaun Wright-Phillips', 1981, 'England', ['RW'], 66, 83, 2006, 20, t(8, 6, 8, 8, 5, 8)),
  // ── The continent's next generation ──
  q('barcelona', 'messi_grad', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 62, 99, 2010, 20, t(9, 6, 10, 10, 3, 8), { loyalty: 95 }),
  q('barcelona', 'iniesta_grad', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 68, 90, 2008, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 94 }),
  q('arsenal', 'fabregas_grad', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 65, 89, 2010, 15, t(9, 6, 9, 7, 5, 8)),
  q('real_madrid', 'ramos_grad', 'Sergio Ramos', 1986, 'Spain', ['CB', 'RB'], 72, 90, 2011, 20, t(8, 7, 9, 9, 7, 7)),
  q('milan', 'kaka_grad', 'Kaká', 1982, 'Brazil', ['AM'], 78, 91, 2009, 20, t(9, 6, 9, 8, 4, 8)),
  q('milan', 'pirlo_grad', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'CM'], 76, 88, 2007, 20, t(10, 6, 9, 8, 4, 8)),
  // ── The next English waves (2006-2025) — fire beyond the 15-year calibration ──
  q('spurs', 'bale_grad', 'Gareth Bale', 1989, 'Wales', ['LW', 'LB'], 66, 90, 2011, 25, t(8, 6, 9, 8, 5, 8)),
  q('arsenal', 'walcott_grad', 'Theo Walcott', 1989, 'England', ['RW', 'ST'], 64, 84, 2011, 25, t(8, 6, 8, 8, 5, 8)),
  q('arsenal', 'ramsey_grad', 'Aaron Ramsey', 1990, 'Wales', ['CM', 'AM'], 62, 85, 2012, 30, t(8, 6, 8, 8, 5, 8)),
  q('man_utd', 'welbeck_grad', 'Danny Welbeck', 1990, 'England', ['ST', 'LW'], 62, 82, 2012, 30, t(8, 6, 8, 8, 5, 8)),
  q('liverpool', 'sterling_grad', 'Raheem Sterling', 1994, 'England', ['LW', 'RW'], 66, 88, 2015, 20, t(7, 7, 9, 6, 5, 8)),
  q('spurs', 'kane_grad', 'Harry Kane', 1993, 'England', ['ST'], 62, 90, 2016, 20, t(9, 7, 10, 9, 4, 8)),
  q('spurs', 'alli_grad', 'Dele Alli', 1996, 'England', ['AM', 'CM'], 66, 86, 2018, 20, t(6, 7, 8, 6, 7, 8)),
  q('man_utd', 'rashford_grad', 'Marcus Rashford', 1997, 'England', ['ST', 'LW'], 66, 87, 2019, 20, t(8, 6, 9, 9, 5, 8)),
  q('aston_villa', 'grealish_grad', 'Jack Grealish', 1995, 'England', ['AM', 'LW'], 64, 86, 2018, 25, t(6, 7, 8, 8, 6, 8)),
  q('west_ham', 'rice_grad', 'Declan Rice', 1999, 'England', ['DM', 'CB'], 62, 87, 2022, 15, t(9, 6, 9, 8, 4, 8)),
  q('liverpool', 'taa_grad', 'Trent Alexander-Arnold', 1998, 'England', ['RB'], 62, 88, 2021, 20, t(8, 6, 9, 9, 5, 8)),
  q('man_city', 'foden_grad', 'Phil Foden', 2000, 'England', ['AM', 'LW'], 58, 89, 2022, 15, t(9, 6, 9, 9, 4, 8)),
  q('chelsea', 'mount_grad', 'Mason Mount', 1999, 'England', ['AM', 'CM'], 66, 85, 2023, 20, t(9, 6, 9, 8, 4, 8)),
  q('arsenal', 'saka_grad', 'Bukayo Saka', 2001, 'England', ['RW', 'LW'], 60, 89, 2024, 15, t(9, 6, 9, 9, 4, 8)),
  q('man_city', 'haaland_grad', 'Erling Haaland', 2000, 'Norway', ['ST'], 88, 94, 2027, 15, t(9, 7, 10, 8, 4, 8)),
  q('chelsea', 'palmer_grad', 'Cole Palmer', 2002, 'England', ['AM', 'RW'], 74, 89, 2028, 15, t(9, 6, 9, 8, 4, 8)),

  // ── Squad-depth academy products (2000-2012) ──
  // The real home-grown players who broke through at English clubs beyond the
  // marquee names above — the everyday spine that keeps mid-table and background
  // sides real over a long save, rather than draining to a bare skeleton. Debut
  // clubs, birth years and positions are real; ability/potential are estimates.
  q('man_utd', 'oshea_grad', "John O'Shea", 1981, 'Ireland', ['CB', 'RB'], 62, 78, 2004, 20, t(9, 4, 7, 9, 3, 8)),
  q('man_utd', 'fletcher_grad', 'Darren Fletcher', 1984, 'Scotland', ['CM'], 60, 80, 2006, 30, t(9, 4, 8, 9, 3, 7)),
  q('man_utd', 'evans_grad', 'Jonny Evans', 1988, 'N. Ireland', ['CB'], 58, 80, 2010, 25, t(9, 4, 7, 8, 3, 7)),
  q('man_utd', 'cleverley_grad', 'Tom Cleverley', 1989, 'England', ['CM', 'AM'], 60, 75, 2014, 25, t(8, 5, 7, 7, 4, 7)),
  q('arsenal', 'wilshere_grad', 'Jack Wilshere', 1992, 'England', ['CM', 'AM'], 64, 84, 2013, 60, t(7, 6, 8, 8, 6, 7)),
  q('arsenal', 'gibbs_grad', 'Kieran Gibbs', 1989, 'England', ['LB'], 60, 77, 2012, 30, t(8, 5, 7, 7, 4, 7)),
  q('west_ham', 'carrick_grad', 'Michael Carrick', 1981, 'England', ['CM', 'DM'], 64, 84, 2004, 20, t(9, 4, 8, 7, 3, 8)),
  q('west_ham', 'g_johnson_grad', 'Glen Johnson', 1984, 'England', ['RB'], 60, 80, 2006, 30, t(7, 6, 7, 6, 5, 7)),
  q('west_ham', 'noble_grad', 'Mark Noble', 1987, 'England', ['CM'], 58, 77, 2010, 25, t(9, 5, 7, 10, 4, 7), { loyalty: 92 }),
  q('spurs', 'king_grad', 'Ledley King', 1980, 'England', ['CB'], 64, 85, 2004, 65, t(9, 5, 8, 10, 3, 8), { loyalty: 90 }),
  q('everton', 'osman_grad', 'Leon Osman', 1981, 'England', ['AM', 'CM'], 58, 75, 2006, 25, t(8, 4, 7, 9, 3, 7)),
  q('everton', 'rodwell_grad', 'Jack Rodwell', 1991, 'England', ['CM', 'CB'], 60, 76, 2011, 45, t(7, 5, 7, 6, 4, 7)),
  q('everton', 'barkley_grad', 'Ross Barkley', 1993, 'England', ['AM', 'CM'], 62, 82, 2014, 30, t(6, 6, 8, 6, 6, 7)),
  q('man_city', 'richards_grad', 'Micah Richards', 1988, 'England', ['RB', 'CB'], 62, 80, 2008, 40, t(7, 6, 8, 7, 5, 7)),
  q('aston_villa', 'agbonlahor_grad', 'Gabriel Agbonlahor', 1986, 'England', ['ST', 'RW'], 62, 78, 2009, 30, t(7, 5, 7, 9, 4, 7)),
  q('newcastle', 'carroll_grad', 'Andy Carroll', 1989, 'England', ['ST'], 60, 79, 2010, 55, t(6, 7, 7, 6, 6, 6)),
  q('newcastle', 's_taylor_grad', 'Steven Taylor', 1986, 'England', ['CB'], 58, 74, 2007, 35, t(7, 6, 7, 8, 5, 7)),
  q('middlesbrough', 'downing_grad', 'Stewart Downing', 1984, 'England', ['LW'], 62, 80, 2005, 25, t(8, 5, 7, 7, 4, 7)),
  q('middlesbrough', 'a_johnson_grad', 'Adam Johnson', 1987, 'England', ['RW'], 60, 78, 2008, 30, t(6, 6, 7, 6, 6, 7)),
  q('leeds', 'lennon_grad', 'Aaron Lennon', 1987, 'England', ['RW'], 60, 80, 2006, 30, t(8, 5, 7, 7, 4, 8)),
  q('sunderland', 'henderson_grad', 'Jordan Henderson', 1990, 'England', ['CM'], 60, 83, 2011, 20, t(10, 5, 9, 8, 3, 8)),
  q('southampton', 'lallana_grad', 'Adam Lallana', 1988, 'England', ['AM', 'CM'], 60, 82, 2009, 30, t(9, 5, 8, 8, 4, 8)),
  q('southampton', 'oxlade_grad', 'Alex Oxlade-Chamberlain', 1993, 'England', ['RW', 'CM'], 60, 81, 2013, 45, t(8, 6, 8, 7, 5, 7)),
  q('southampton', 'shaw_grad', 'Luke Shaw', 1995, 'England', ['LB'], 62, 82, 2015, 45, t(7, 6, 7, 7, 5, 7)),

  // ── United's real 2007-2011 arrivals, at their real source clubs ──
  // The Ferguson rebuild that kept United on top after the 2003 Ronaldo signing:
  // these are the real names a 1999 Director is OFFERED (real-in decisions) as
  // their own club's history, filling the mid/late-2000s window. Each breaks
  // through young at a source club that exists in this world (Sporting, Porto,
  // Bayern, Spurs, Atlético) via INTAKES_1999, then moves to United on his real
  // date via LEDGER_1999_2004 — declinable, reality if ignored.
  q('sporting', 'nani_grad', 'Nani', 1986, 'Portugal', ['RW', 'LW'], 66, 84, 2007, 35, t(6, 8, 7, 6, 7, 7)),
  q('porto', 'anderson_grad', 'Anderson', 1988, 'Brazil', ['CM', 'AM'], 64, 84, 2011, 55, t(6, 7, 7, 6, 6, 7)),
  q('bayern', 'hargreaves_grad', 'Owen Hargreaves', 1981, 'England', ['DM', 'CM'], 72, 84, 2007, 65, t(9, 5, 8, 7, 4, 7)),
  q('spurs', 'berbatov_grad', 'Dimitar Berbatov', 1981, 'Bulgaria', ['ST', 'AM'], 76, 86, 2006, 30, t(7, 7, 7, 6, 5, 7)),
  q('atletico', 'degea_grad', 'David de Gea', 1990, 'Spain', ['GK'], 66, 89, 2011, 15, t(8, 6, 8, 7, 4, 7)),

  // ── The modern generation (2016-2025 breakthroughs) ──
  // A 1999 save that runs its full 26 years reaches 2025 — and without these the
  // world ages into 2025 with no Mbappé, no Yamal, no Bellingham. Each debuts as a
  // teenager at the club he really broke through at, then grows through the normal
  // development system. Where a player's real youth club isn't in this world
  // (Rennes for Camavinga, Dortmund for Bellingham), he is seeded at the present
  // club he genuinely became a star at instead. Downstream moves are emergent (the
  // ledger/market may carry them on, as reality did). Fire only in eras whose
  // window reaches them; dedup-safe against any later-start kickoff squad.
  q('monaco', 'mbappe_grad', 'Kylian Mbappé', 1998, 'France', ['ST', 'LW', 'RW'], 70, 96, 2022, 15, t(8, 8, 10, 6, 4, 8)),
  q('real_madrid', 'vinicius_grad', 'Vinícius Júnior', 2000, 'Brazil', ['LW'], 64, 92, 2024, 20, t(7, 7, 9, 7, 5, 8)),
  q('barcelona', 'pedri_grad', 'Pedri', 2002, 'Spain', ['CM', 'AM'], 66, 92, 2026, 25, t(9, 5, 9, 9, 4, 8)),
  q('barcelona', 'gavi_grad', 'Gavi', 2004, 'Spain', ['CM', 'AM'], 62, 90, 2026, 30, t(8, 6, 9, 9, 6, 8)),
  q('barcelona', 'yamal_grad', 'Lamine Yamal', 2007, 'Spain', ['RW', 'LW'], 66, 96, 2026, 15, t(8, 7, 10, 8, 4, 8)),
  q('bayern', 'musiala_grad', 'Jamal Musiala', 2003, 'Germany', ['AM', 'CM'], 64, 93, 2026, 20, t(9, 6, 9, 8, 4, 8)),
  q('real_madrid', 'camavinga_grad', 'Eduardo Camavinga', 2002, 'France', ['DM', 'CM'], 68, 90, 2027, 20, t(9, 6, 9, 8, 5, 8)),
  q('real_madrid', 'bellingham_grad', 'Jude Bellingham', 2003, 'England', ['CM', 'AM'], 80, 94, 2029, 15, t(9, 7, 10, 8, 4, 8)),

  // ── The 2010s elite still defining the game in 2025 ──
  // Seeded at the present club where each genuinely broke through, so the modern
  // world isn't missing its spine. Their later transfers are emergent — the sim
  // may move them on as reality did, or keep them, which is the whole point.
  q('spurs', 'modric_grad', 'Luka Modrić', 1985, 'Croatia', ['CM', 'AM'], 78, 89, 2016, 15, t(10, 5, 9, 8, 3, 8)),
  q('celtic', 'vandijk_grad', 'Virgil van Dijk', 1991, 'Netherlands', ['CB'], 70, 90, 2017, 15, t(9, 6, 9, 8, 4, 8)),
  q('southampton', 'mane_grad', 'Sadio Mané', 1992, 'Senegal', ['LW', 'RW'], 72, 88, 2019, 20, t(9, 6, 9, 7, 5, 8)),
  q('leicester', 'kante_grad', "N'Golo Kanté", 1991, 'France', ['DM', 'CM'], 74, 87, 2019, 15, t(10, 4, 9, 8, 3, 8)),
  q('sporting', 'bruno_f_grad', 'Bruno Fernandes', 1994, 'Portugal', ['AM', 'CM'], 76, 88, 2022, 15, t(9, 7, 9, 7, 5, 8)),
];

/** The debut schedule: which graduate arrives at which club, and when. */
export const INTAKES_1999: AcademyIntake[] = [
  { clubId: 'west_ham', year: 2000, playerId: 'cur_j_cole_grad' },
  { clubId: 'leeds', year: 2000, playerId: 'cur_smith_grad' },
  { clubId: 'arsenal', year: 2001, playerId: 'cur_a_cole_grad' },
  { clubId: 'chelsea', year: 2001, playerId: 'cur_terry_grad' },
  { clubId: 'chelsea', year: 2001, playerId: 'cur_lampard_grad' },
  { clubId: 'west_ham', year: 2001, playerId: 'cur_defoe_grad' },
  { clubId: 'milan', year: 2001, playerId: 'cur_pirlo_grad' },
  { clubId: 'everton', year: 2002, playerId: 'cur_rooney_grad' },
  { clubId: 'barcelona', year: 2002, playerId: 'cur_iniesta_grad' },
  { clubId: 'man_city', year: 2002, playerId: 'cur_swp_grad' },
  { clubId: 'milan', year: 2003, playerId: 'cur_kaka_grad' },
  { clubId: 'leeds', year: 2003, playerId: 'cur_milner_grad' },
  { clubId: 'arsenal', year: 2004, playerId: 'cur_fabregas_grad' },
  { clubId: 'barcelona', year: 2004, playerId: 'cur_messi_grad' },
  { clubId: 'real_madrid', year: 2005, playerId: 'cur_ramos_grad' },
  // ── 2006-2025 (fire only in eras whose window reaches them) ──
  { clubId: 'arsenal', year: 2006, playerId: 'cur_walcott_grad' },
  { clubId: 'spurs', year: 2007, playerId: 'cur_bale_grad' },
  { clubId: 'arsenal', year: 2008, playerId: 'cur_ramsey_grad' },
  { clubId: 'man_utd', year: 2010, playerId: 'cur_welbeck_grad' },
  { clubId: 'liverpool', year: 2012, playerId: 'cur_sterling_grad' },
  { clubId: 'spurs', year: 2013, playerId: 'cur_kane_grad' },
  { clubId: 'aston_villa', year: 2015, playerId: 'cur_grealish_grad' },
  { clubId: 'spurs', year: 2015, playerId: 'cur_alli_grad' },
  { clubId: 'man_utd', year: 2016, playerId: 'cur_rashford_grad' },
  { clubId: 'liverpool', year: 2016, playerId: 'cur_taa_grad' },
  { clubId: 'west_ham', year: 2017, playerId: 'cur_rice_grad' },
  { clubId: 'man_city', year: 2017, playerId: 'cur_foden_grad' },
  { clubId: 'chelsea', year: 2019, playerId: 'cur_mount_grad' },
  { clubId: 'arsenal', year: 2019, playerId: 'cur_saka_grad' },
  { clubId: 'man_city', year: 2022, playerId: 'cur_haaland_grad' },
  { clubId: 'chelsea', year: 2023, playerId: 'cur_palmer_grad' },

  // ── Squad-depth academy products, at their real debut years ──
  { clubId: 'man_utd', year: 2000, playerId: 'cur_oshea_grad' },
  { clubId: 'west_ham', year: 2000, playerId: 'cur_carrick_grad' },
  { clubId: 'spurs', year: 2000, playerId: 'cur_king_grad' },
  { clubId: 'middlesbrough', year: 2002, playerId: 'cur_downing_grad' },
  { clubId: 'everton', year: 2003, playerId: 'cur_osman_grad' },
  { clubId: 'man_utd', year: 2003, playerId: 'cur_fletcher_grad' },
  { clubId: 'west_ham', year: 2003, playerId: 'cur_g_johnson_grad' },
  { clubId: 'leeds', year: 2003, playerId: 'cur_lennon_grad' },
  { clubId: 'newcastle', year: 2004, playerId: 'cur_s_taylor_grad' },
  { clubId: 'man_city', year: 2005, playerId: 'cur_richards_grad' },
  { clubId: 'middlesbrough', year: 2005, playerId: 'cur_a_johnson_grad' },
  { clubId: 'aston_villa', year: 2006, playerId: 'cur_agbonlahor_grad' },
  { clubId: 'southampton', year: 2006, playerId: 'cur_lallana_grad' },
  { clubId: 'man_utd', year: 2007, playerId: 'cur_evans_grad' },
  { clubId: 'west_ham', year: 2007, playerId: 'cur_noble_grad' },
  { clubId: 'newcastle', year: 2007, playerId: 'cur_carroll_grad' },
  { clubId: 'everton', year: 2008, playerId: 'cur_rodwell_grad' },
  { clubId: 'sunderland', year: 2008, playerId: 'cur_henderson_grad' },
  { clubId: 'arsenal', year: 2009, playerId: 'cur_gibbs_grad' },
  { clubId: 'arsenal', year: 2010, playerId: 'cur_wilshere_grad' },
  { clubId: 'southampton', year: 2010, playerId: 'cur_oxlade_grad' },
  { clubId: 'man_utd', year: 2011, playerId: 'cur_cleverley_grad' },
  { clubId: 'everton', year: 2011, playerId: 'cur_barkley_grad' },
  { clubId: 'southampton', year: 2012, playerId: 'cur_shaw_grad' },
  // United's real 2007-2011 arrivals debut at their source clubs (skipped in any
  // era whose kickoff squad already holds the man — e.g. arsenal-2004 ships Nani
  // at Sporting — via the name guard in executeAcademyIntakes).
  { clubId: 'bayern', year: 2001, playerId: 'cur_hargreaves_grad' },
  { clubId: 'sporting', year: 2005, playerId: 'cur_nani_grad' },
  { clubId: 'spurs', year: 2006, playerId: 'cur_berbatov_grad' },
  { clubId: 'porto', year: 2006, playerId: 'cur_anderson_grad' },
  { clubId: 'atletico', year: 2009, playerId: 'cur_degea_grad' },

  // ── The modern generation, at their real breakthrough year ──
  { clubId: 'spurs', year: 2008, playerId: 'cur_modric_grad' },
  { clubId: 'celtic', year: 2013, playerId: 'cur_vandijk_grad' },
  { clubId: 'southampton', year: 2014, playerId: 'cur_mane_grad' },
  { clubId: 'leicester', year: 2015, playerId: 'cur_kante_grad' },
  { clubId: 'monaco', year: 2016, playerId: 'cur_mbappe_grad' },
  { clubId: 'sporting', year: 2017, playerId: 'cur_bruno_f_grad' },
  { clubId: 'real_madrid', year: 2018, playerId: 'cur_vinicius_grad' },
  { clubId: 'barcelona', year: 2020, playerId: 'cur_pedri_grad' },
  { clubId: 'bayern', year: 2020, playerId: 'cur_musiala_grad' },
  { clubId: 'barcelona', year: 2021, playerId: 'cur_gavi_grad' },
  { clubId: 'real_madrid', year: 2021, playerId: 'cur_camavinga_grad' },
  { clubId: 'real_madrid', year: 2023, playerId: 'cur_bellingham_grad' },
  { clubId: 'barcelona', year: 2023, playerId: 'cur_yamal_grad' },
];
