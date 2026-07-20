/**
 * Curated real players — 1995 Premier League "Spice Boys" pack (England).
 *
 * The vertical slice for "Liverpool — 1995: Spice Boys". Roy Evans's Liverpool are
 * the most talented side in England — Fowler and Collymore up top, McManaman and a
 * young Redknapp running the show — and the most maddening: brilliant one week,
 * beaten in white Armani suits at Wembley the next. The 1995-96 title goes to
 * Ferguson's kids as Keegan's Newcastle blow a twelve-point lead. Reality: near
 * misses, then a slow fade and no title for another quarter-century. Make the
 * talent count — and put the swagger to work.
 *
 * The 1995-96 continental elite and the reused English rivals (United, Arsenal,
 * Chelsea, Spurs, City) come from the 1996 pack — near-identical a season on; only
 * Liverpool, Keegan's pre-Shearer Newcastle and the reigning champions Blackburn are
 * authored fresh. Every real European Cup of 1996-2010 is anchored. Ability/potential
 * /personality are HIDDEN designer estimates (§7); clubs, birth years, positions and
 * contracts are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import {
  MANUTD_1996, ARSENAL_1996, CHELSEA_1996, SPURS_1996, MANCITY_1996,
  REAL_1996, BARCA_1996, BAYERN_1996, JUVENTUS_1996, MILAN_1996, INTER_1996,
} from './curated-1996.js';
import { EUROPE_MID90S_SQUADS } from './curated-europe-mid90s.js';
import { ENG_DOMESTIC_1995_SQUADS } from './curated-eng-domestic-1995.js';

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

// ── Liverpool, 1995–96 (Roy Evans; the Spice Boys — talent and swagger) ───────
export const LIVERPOOL_1995: CuratedSeed[] = [
  q('liverpool', 'james_95', 'David James', 1970, 'England', ['GK'], 79, 82, 1999, 30, t(6, 6, 7, 7, 6, 6)),
  // Real 1995–96 Liverpool: Roy Evans's attacking left wing-back in the 3-5-2.
  q('liverpool', 'harkness_95', 'Steve Harkness', 1971, 'England', ['LB', 'CB'], 72, 74, 1999, 40, t(6, 5, 5, 7, 5, 6)),
  q('liverpool', 'mcateer_95', 'Jason McAteer', 1971, 'Ireland', ['RB', 'CM'], 76, 79, 1999, 30, t(7, 6, 7, 6, 5, 7)),
  q('liverpool', 'rjones_95', 'Rob Jones', 1971, 'England', ['RB'], 77, 80, 1998, 45, t(8, 4, 7, 9, 4, 7)),
  q('liverpool', 'scales_95', 'John Scales', 1966, 'England', ['CB'], 77, 78, 1998, 25, t(8, 5, 7, 7, 4, 7)),
  q('liverpool', 'mwright_95', 'Mark Wright', 1963, 'England', ['CB'], 79, 79, 1998, 35, t(8, 5, 7, 7, 5, 6)),
  q('liverpool', 'babb_95', 'Phil Babb', 1970, 'Ireland', ['CB'], 76, 79, 1999, 25, t(7, 5, 7, 7, 5, 7)),
  q('liverpool', 'ruddock_95', 'Neil Ruddock', 1968, 'England', ['CB'], 76, 77, 1998, 40, t(5, 7, 7, 7, 8, 6)),
  q('liverpool', 'bjornebye_95', 'Stig Inge Bjørnebye', 1969, 'Norway', ['LB'], 75, 78, 1998, 30, t(8, 4, 7, 7, 4, 7)),
  q('liverpool', 'redknapp_95', 'Jamie Redknapp', 1973, 'England', ['CM'], 80, 85, 2000, 45, t(8, 6, 8, 8, 4, 7)),
  q('liverpool', 'barnes_95', 'John Barnes', 1963, 'England', ['CM', 'AM'], 81, 81, 1997, 30, t(8, 6, 8, 9, 4, 7), { loyalty: 88 }),
  q('liverpool', 'thomas_95', 'Michael Thomas', 1967, 'England', ['CM', 'DM'], 76, 77, 1998, 35, t(7, 5, 7, 7, 5, 7)),
  q('liverpool', 'mcmanaman_95', 'Steve McManaman', 1972, 'England', ['RW', 'AM'], 84, 87, 1998, 25, t(7, 7, 8, 6, 4, 8)),
  q('liverpool', 'fowler_95', 'Robbie Fowler', 1975, 'England', ['ST'], 84, 89, 2000, 35, t(6, 7, 8, 9, 6, 6), { loyalty: 90 }),
  q('liverpool', 'collymore_95', 'Stan Collymore', 1971, 'England', ['ST'], 82, 85, 1999, 35, t(4, 8, 7, 5, 8, 5)),
  q('liverpool', 'rush_95', 'Ian Rush', 1961, 'Wales', ['ST'], 79, 79, 1996, 30, t(9, 6, 8, 10, 4, 7), { loyalty: 95 }),
  // Real 1995-96 depth to the era minimum (Matteo, the versatile young defender).
  q('liverpool', 'matteo_95', 'Dominic Matteo', 1974, 'Scotland', ['CB', 'LB'], 74, 80, 2000, 30, t(8, 4, 7, 7, 4, 7)),
];

// ── Newcastle, 1995–96 (Keegan's Entertainers; the twelve-point lead, no Shearer) ─
export const NEWCASTLE_1995: CuratedSeed[] = [
  q('newcastle', 'srnicek_95', 'Pavel Srníček', 1968, 'Czech Republic', ['GK'], 77, 78, 1998, 25, t(7, 6, 7, 7, 6, 7)),
  q('newcastle', 'barton_95', 'Warren Barton', 1969, 'England', ['RB'], 76, 78, 1999, 25, t(8, 5, 7, 7, 5, 7)),
  q('newcastle', 'albert_95', 'Philippe Albert', 1967, 'Belgium', ['CB'], 79, 80, 1999, 25, t(8, 6, 7, 7, 5, 7)),
  q('newcastle', 'howey_95', 'Steve Howey', 1971, 'England', ['CB'], 77, 80, 1999, 30, t(8, 5, 7, 8, 5, 7)),
  q('newcastle', 'beresford_95', 'John Beresford', 1966, 'England', ['LB'], 76, 77, 1998, 25, t(8, 5, 7, 7, 5, 7)),
  q('newcastle', 'lee_95', 'Rob Lee', 1966, 'England', ['CM'], 80, 81, 1999, 25, t(9, 6, 8, 9, 4, 7)),
  q('newcastle', 'batty_95', 'David Batty', 1968, 'England', ['DM', 'CM'], 80, 81, 2000, 25, t(8, 6, 8, 8, 6, 7)),
  q('newcastle', 'beardsley_95', 'Peter Beardsley', 1961, 'England', ['AM', 'ST'], 82, 82, 1997, 30, t(9, 6, 8, 9, 4, 7)),
  q('newcastle', 'ginola_95', 'David Ginola', 1967, 'France', ['LW', 'AM'], 82, 84, 1999, 25, t(6, 8, 8, 6, 6, 8)),
  q('newcastle', 'gillespie_95', 'Keith Gillespie', 1975, 'Northern Ireland', ['RW'], 76, 81, 2000, 30, t(5, 7, 7, 6, 7, 7)),
  q('newcastle', 'ferdinand_95', 'Les Ferdinand', 1966, 'England', ['ST'], 83, 84, 1999, 25, t(8, 6, 8, 8, 5, 7)),
  q('newcastle', 'asprilla_95', 'Faustino Asprilla', 1969, 'Colombia', ['ST', 'AM'], 82, 84, 1999, 30, t(5, 8, 8, 5, 8, 7)),
];

// ── Blackburn, 1995–96 (the reigning champions declining; SAS still firing) ────
export const BLACKBURN_1995: CuratedSeed[] = [
  q('blackburn', 'flowers_95', 'Tim Flowers', 1967, 'England', ['GK'], 80, 81, 1999, 25, t(8, 6, 7, 8, 5, 6)),
  q('blackburn', 'berg_95', 'Henning Berg', 1969, 'Norway', ['CB', 'RB'], 80, 82, 1999, 25, t(9, 5, 8, 8, 4, 7)),
  q('blackburn', 'hendry_95', 'Colin Hendry', 1965, 'Scotland', ['CB'], 80, 81, 1999, 30, t(9, 6, 8, 9, 6, 6), { loyalty: 90 }),
  q('blackburn', 'pearce_95', 'Ian Pearce', 1974, 'England', ['CB'], 74, 79, 2000, 25, t(8, 5, 7, 8, 5, 7)),
  q('blackburn', 'le_saux_95', 'Graeme Le Saux', 1968, 'England', ['LB'], 81, 83, 1999, 30, t(8, 6, 8, 7, 5, 7)),
  q('blackburn', 'sherwood_95', 'Tim Sherwood', 1969, 'England', ['CM', 'DM'], 79, 80, 1999, 25, t(8, 6, 8, 8, 5, 7)),
  q('blackburn', 'ripley_95', 'Stuart Ripley', 1967, 'England', ['RW'], 77, 78, 1999, 25, t(8, 5, 7, 8, 5, 7)),
  q('blackburn', 'wilcox_95', 'Jason Wilcox', 1971, 'England', ['LW'], 77, 79, 1999, 25, t(8, 5, 7, 8, 5, 7)),
  q('blackburn', 'shearer_95', 'Alan Shearer', 1970, 'England', ['ST'], 88, 89, 1998, 25, t(9, 7, 9, 8, 4, 7)),
  q('blackburn', 'sutton_95', 'Chris Sutton', 1973, 'England', ['ST', 'AM'], 82, 85, 1999, 25, t(8, 6, 8, 8, 5, 7)),
  q('blackburn', 'mckinlay_95', 'Billy McKinlay', 1969, 'Scotland', ['CM', 'DM'], 74, 76, 1998, 25, t(8, 5, 7, 8, 5, 7)),
];

/** The full Liverpool-1995 curated universe: the Spice Boys plus Keegan's pre-Shearer
 *  Newcastle and the reigning-champion Blackburn (both authored fresh), with the
 *  reused United, Arsenal, Chelsea, Spurs and City and the 1995-96 continental elite
 *  from the 1996 pack — every real European Cup 1996-2010 anchored. */
export const LIVERPOOL_1995_SQUADS: Record<string, CuratedSeed[]> = {
  liverpool: LIVERPOOL_1995,
  man_utd: MANUTD_1996,
  arsenal: ARSENAL_1996,
  chelsea: CHELSEA_1996,
  spurs: SPURS_1996,
  man_city: MANCITY_1996,
  newcastle: NEWCASTLE_1995,
  blackburn: BLACKBURN_1995,
  barcelona: BARCA_1996,
  real_madrid: REAL_1996,
  bayern: BAYERN_1996,
  juventus: JUVENTUS_1996,
  milan: MILAN_1996,
  inter: INTER_1996,
};

// European selling clubs (M12A rollout) — the mid-90s talent pipeline (shared with
// the 1996 English world). Merged by CONCATENATION onto any club already present.
for (const [club, seeds] of Object.entries(EUROPE_MID90S_SQUADS)) {
  LIVERPOOL_1995_SQUADS[club] = [...(LIVERPOOL_1995_SQUADS[club] ?? []), ...seeds];
}
// Domestic mid-tier (M12 shortlist supply): real squad players at the modelled PL's
// non-elite clubs, so options lists read like a real 1995-96 shortlist.
for (const [club, seeds] of Object.entries(ENG_DOMESTIC_1995_SQUADS)) {
  LIVERPOOL_1995_SQUADS[club] = [...(LIVERPOOL_1995_SQUADS[club] ?? []), ...seeds];
}
