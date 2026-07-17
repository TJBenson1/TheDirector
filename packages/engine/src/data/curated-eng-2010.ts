/**
 * Curated real players — 2010 Premier League "FSG Reset" pack (England).
 *
 * The vertical slice for "Liverpool — 2010: FSG Reset". The Hicks & Gillett era
 * ends in a fire sale and a High Court battle; in October 2010 Fenway Sports Group
 * take over a club on the brink. Torres forces his way to Chelsea in January,
 * Suárez and Carroll arrive, and a long rebuild begins — through Dalglish, Rodgers
 * and the near-miss of 2014 to Klopp, the 2019 European Cup and 2020 title. Turn
 * the reset into a return to the summit — faster, and without the false dawns.
 *
 * The 2010-11 Premier League and continental elite are reused from the 2010 pack;
 * only Arsenal and Tottenham are authored fresh here. Every real European Cup of
 * 2011-2025 is anchored. Ability/potential/personality are HIDDEN designer
 * estimates (§7); clubs, birth years, positions and contracts are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import {
  LIVERPOOL_B10, MANUTD_B10, CHELSEA_B10, MANCITY_B10, BAYERN_2010,
  BARCELONA_B10, REAL_MADRID_B10, INTER_B10, JUVENTUS_B10,
} from './curated-bundesliga-2010.js';
import { EUROPE_2010_SQUADS } from './curated-europe-2010.js';
import { ENG_DOMESTIC_2010_SQUADS } from './curated-eng-domestic-2010.js';

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

// ── Arsenal, 2010–11 (Wenger; the young side that keeps falling short) ─────────
export const ARSENAL_2010: CuratedSeed[] = [
  q('arsenal', 'szczesny_10', 'Wojciech Szczęsny', 1990, 'Poland', ['GK'], 78, 87, 2015, 15, t(8, 6, 8, 8, 5, 8)),
  q('arsenal', 'almunia_10', 'Manuel Almunia', 1977, 'Spain', ['GK'], 78, 78, 2012, 20, t(8, 5, 7, 8, 5, 7)),
  q('arsenal', 'sagna_10', 'Bacary Sagna', 1983, 'France', ['RB'], 83, 84, 2014, 20, t(9, 5, 8, 8, 5, 8)),
  q('arsenal', 'vermaelen_10', 'Thomas Vermaelen', 1985, 'Belgium', ['CB'], 82, 85, 2014, 30, t(9, 5, 8, 8, 5, 8)),
  q('arsenal', 'koscielny_10', 'Laurent Koscielny', 1985, 'France', ['CB'], 79, 87, 2015, 20, t(9, 5, 8, 8, 5, 8)),
  q('arsenal', 'clichy_10', 'Gaël Clichy', 1985, 'France', ['LB'], 82, 84, 2013, 20, t(8, 5, 8, 8, 5, 8)),
  q('arsenal', 'song_10', 'Alex Song', 1987, 'Cameroon', ['DM', 'CB'], 81, 84, 2014, 20, t(7, 6, 8, 7, 6, 8)),
  q('arsenal', 'wilshere_10', 'Jack Wilshere', 1992, 'England', ['CM', 'AM'], 78, 89, 2015, 30, t(7, 7, 9, 9, 6, 8)),
  q('arsenal', 'fabregas_10', 'Cesc Fàbregas', 1987, 'Spain', ['CM', 'AM'], 87, 89, 2015, 20, t(9, 6, 9, 8, 5, 8)),
  q('arsenal', 'nasri_10', 'Samir Nasri', 1987, 'France', ['AM', 'LW'], 84, 86, 2011, 20, t(6, 7, 8, 6, 6, 8)),
  q('arsenal', 'arshavin_10', 'Andrey Arshavin', 1981, 'Russia', ['AM', 'LW'], 82, 83, 2013, 20, t(6, 7, 8, 6, 6, 7)),
  q('arsenal', 'walcott_10', 'Theo Walcott', 1989, 'England', ['RW'], 81, 86, 2014, 25, t(8, 6, 8, 8, 5, 8)),
  q('arsenal', 'rosicky_10', 'Tomáš Rosický', 1980, 'Czechia', ['AM', 'CM'], 81, 82, 2013, 30, t(8, 6, 8, 7, 5, 8)),
  q('arsenal', 'van_persie_10', 'Robin van Persie', 1983, 'Netherlands', ['ST', 'LW'], 86, 89, 2013, 30, t(7, 7, 9, 7, 6, 8)),
  q('arsenal', 'chamakh', 'Marouane Chamakh', 1984, 'Morocco', ['ST'], 78, 80, 2014, 20, t(7, 6, 8, 7, 5, 7)),
];

// ── Tottenham, 2010–11 (Redknapp; Bale's breakout and the Champions League run) ─
export const SPURS_2010: CuratedSeed[] = [
  q('spurs', 'gomes_10', 'Heurelho Gomes', 1981, 'Brazil', ['GK'], 79, 81, 2014, 20, t(7, 6, 8, 8, 6, 7)),
  q('spurs', 'walker_10', 'Kyle Walker', 1990, 'England', ['RB'], 74, 87, 2015, 20, t(8, 6, 9, 8, 5, 8)),
  q('spurs', 'king_10', 'Ledley King', 1980, 'England', ['CB'], 82, 82, 2012, 40, t(9, 5, 8, 10, 3, 7), { loyalty: 92 }),
  q('spurs', 'dawson_10', 'Michael Dawson', 1983, 'England', ['CB'], 80, 82, 2014, 20, t(9, 5, 8, 9, 5, 7)),
  q('spurs', 'corluka_10', 'Vedran Ćorluka', 1986, 'Croatia', ['CB', 'RB'], 79, 82, 2014, 20, t(8, 5, 8, 8, 5, 7)),
  q('spurs', 'assou_ekotto_10', 'Benoît Assou-Ekotto', 1984, 'Cameroon', ['LB'], 78, 80, 2014, 20, t(6, 6, 7, 8, 6, 7)),
  q('spurs', 'modric_10', 'Luka Modrić', 1985, 'Croatia', ['CM', 'AM'], 85, 89, 2013, 15, t(10, 5, 9, 9, 4, 8)),
  q('spurs', 'huddlestone_10', 'Tom Huddlestone', 1986, 'England', ['DM', 'CM'], 78, 82, 2014, 20, t(8, 5, 7, 8, 5, 7)),
  q('spurs', 'palacios_10', 'Wilson Palacios', 1984, 'Honduras', ['DM', 'CM'], 79, 81, 2013, 20, t(8, 6, 8, 7, 6, 8)),
  q('spurs', 'van_der_vaart', 'Rafael van der Vaart', 1983, 'Netherlands', ['AM'], 84, 85, 2013, 25, t(7, 7, 8, 7, 5, 8)),
  q('spurs', 'lennon_10', 'Aaron Lennon', 1987, 'England', ['RW'], 81, 83, 2014, 20, t(8, 5, 8, 8, 5, 8)),
  q('spurs', 'bale_10', 'Gareth Bale', 1989, 'Wales', ['LW', 'LB'], 82, 91, 2015, 25, t(8, 6, 9, 8, 5, 8)),
  q('spurs', 'defoe_10', 'Jermain Defoe', 1982, 'England', ['ST'], 81, 82, 2014, 20, t(8, 6, 8, 8, 5, 8)),
  q('spurs', 'crouch_10', 'Peter Crouch', 1981, 'England', ['ST'], 79, 80, 2013, 20, t(8, 5, 8, 7, 5, 7)),
  q('spurs', 'pavlyuchenko_10', 'Roman Pavlyuchenko', 1981, 'Russia', ['ST'], 79, 80, 2013, 20, t(6, 6, 8, 7, 6, 7)),
];

/** The full Liverpool-2010 curated universe: FSG's Liverpool (reused 2010-11 squad)
 *  plus the 2010-11 Premier League and continental elite reused from the 2010 pack,
 *  with Arsenal and Tottenham authored fresh — every real European Cup 2011-2025
 *  anchored. */
export const LIVERPOOL_2010_SQUADS: Record<string, CuratedSeed[]> = {
  liverpool: LIVERPOOL_B10,
  man_utd: MANUTD_B10,
  chelsea: CHELSEA_B10,
  man_city: MANCITY_B10,
  arsenal: ARSENAL_2010,
  spurs: SPURS_2010,
  barcelona: BARCELONA_B10,
  real_madrid: REAL_MADRID_B10,
  bayern: BAYERN_2010,
  inter: INTER_B10,
  juventus: JUVENTUS_B10,
  // European selling clubs (M12A rollout) — the 2010s talent pipeline.
  ...EUROPE_2010_SQUADS,
};

// Domestic mid-tier (M12 shortlist supply): real 2010-11 squad players at the
// non-elite PL clubs, so options lists read like a real shortlist.
for (const [club, seeds] of Object.entries(ENG_DOMESTIC_2010_SQUADS)) {
  LIVERPOOL_2010_SQUADS[club] = [...(LIVERPOOL_2010_SQUADS[club] ?? []), ...seeds];
}
