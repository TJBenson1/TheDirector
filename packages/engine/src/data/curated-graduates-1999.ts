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
];
