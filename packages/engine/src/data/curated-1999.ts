/**
 * Curated real players — SKELETON pack (M3). The full ~800/era curation is M10
 * data work (§4, §17.10). This file ships the flagship vertical-slice squad —
 * the real Manchester United 1999–2000 side — with real birth years,
 * nationalities and positions. Ability/potential/personality are designer
 * estimates (they are HIDDEN from the user and calibrated, §7), not scraped
 * facts. Everything else in the world is procedural filler for now.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';

/** A curated seed: the intrinsic record plus optional agency hints (§6). Wage,
 *  the `curated` flag, live state and a generated resistance profile are filled
 *  in at squad build; `hardBlocks`/`loyalty` override the generated resistance. */
export type CuratedSeed = Omit<
  PlayerState,
  | 'wage'
  | 'curated'
  | 'fitness'
  | 'morale'
  | 'form'
  | 'injury'
  | 'injuryHistory'
  | 'wonderkid'
  | 'benchedDevSeasons'
  | 'reachedPotential'
  | 'birthCeiling'
  | 'lastSeason'
  | 'seasonMonthsInjured'
  | 'adaptation'
  | 'resistance'
> & { hardBlocks?: HardBlock[]; loyalty?: number };

type Trait = PlayerState['personality'];

function p(
  id: string,
  name: string,
  birthYear: number,
  nationality: string,
  positions: Position[],
  ability: number,
  potentialCeiling: number,
  contractUntil: number,
  injuryProneness: number,
  personality: Trait,
): CuratedSeed {
  return {
    id: `cur_${id}`,
    name,
    birthYear,
    nationality,
    positions,
    club: 'man_utd',
    contractUntil,
    ability,
    potentialCeiling,
    personality,
    injuryProneness,
  };
}

// professionalism, ego, ambition, loyalty, volatility, adaptability
const t = (
  prof: number,
  ego: number,
  amb: number,
  loy: number,
  vol: number,
  adapt: number,
): Trait => ({ professionalism: prof, ego, ambition: amb, loyalty: loy, volatility: vol, adaptability: adapt });

/** Manchester United, 1999–2000. */
export const MAN_UTD_1999: CuratedSeed[] = [
  p('bosnich', 'Mark Bosnich', 1972, 'Australia', ['GK'], 78, 80, 2001, 45, t(4, 7, 6, 4, 7, 6)),
  p('vdgouw', 'Raimond van der Gouw', 1963, 'Netherlands', ['GK'], 72, 72, 2002, 20, t(9, 3, 5, 8, 2, 7)),
  p('gneville', 'Gary Neville', 1975, 'England', ['RB'], 82, 86, 2004, 25, t(9, 5, 8, 10, 4, 7)),
  p('pneville', 'Phil Neville', 1977, 'England', ['LB', 'CM'], 78, 82, 2004, 25, t(8, 4, 7, 9, 3, 8)),
  p('irwin', 'Denis Irwin', 1965, 'Ireland', ['LB', 'RB'], 82, 82, 2001, 22, t(9, 3, 7, 9, 2, 8)),
  p('silvestre', 'Mikael Silvestre', 1977, 'France', ['CB', 'LB'], 79, 86, 2004, 28, t(7, 5, 7, 6, 4, 8)),
  p('stam', 'Jaap Stam', 1972, 'Netherlands', ['CB'], 89, 90, 2003, 35, t(8, 6, 8, 6, 5, 6)),
  p('rjohnsen', 'Ronny Johnsen', 1969, 'Norway', ['CB', 'DM'], 79, 80, 2002, 55, t(8, 4, 6, 7, 3, 6)),
  p('wbrown', 'Wes Brown', 1979, 'England', ['CB'], 74, 85, 2004, 60, t(7, 4, 7, 9, 4, 6)),
  p('berg', 'Henning Berg', 1969, 'Norway', ['CB'], 77, 78, 2001, 30, t(8, 4, 6, 7, 3, 7)),
  p('may', 'David May', 1970, 'England', ['CB'], 70, 72, 2002, 40, t(6, 6, 5, 7, 5, 6)),
  p('keane', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 90, 91, 2003, 45, t(9, 7, 10, 8, 8, 6)),
  p('scholes', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 88, 90, 2004, 20, t(9, 3, 8, 10, 5, 7)),
  p('beckham', 'David Beckham', 1975, 'England', ['RW', 'CM'], 88, 91, 2003, 20, t(9, 8, 9, 7, 4, 7)),
  p('giggs', 'Ryan Giggs', 1973, 'Wales', ['LW'], 88, 90, 2004, 30, t(9, 5, 8, 10, 3, 7)),
  p('butt', 'Nicky Butt', 1975, 'England', ['CM', 'DM'], 79, 82, 2003, 25, t(8, 4, 7, 9, 4, 7)),
  p('blomqvist', 'Jesper Blomqvist', 1974, 'Sweden', ['LW'], 74, 76, 2001, 70, t(7, 4, 6, 5, 3, 7)),
  p('cruyff', 'Jordi Cruyff', 1974, 'Netherlands', ['AM', 'RW'], 73, 76, 2001, 40, t(7, 6, 6, 5, 4, 7)),
  p('fortune', 'Quinton Fortune', 1977, 'South Africa', ['LW', 'LB'], 73, 78, 2003, 35, t(7, 4, 6, 6, 4, 8)),
  p('cole', 'Andy Cole', 1971, 'England', ['ST'], 85, 86, 2002, 30, t(7, 7, 8, 7, 6, 6)),
  p('yorke', 'Dwight Yorke', 1971, 'Trinidad & Tobago', ['ST'], 86, 87, 2003, 35, t(6, 7, 7, 6, 7, 8)),
  p('solskjaer', 'Ole Gunnar Solskjær', 1973, 'Norway', ['ST'], 84, 85, 2003, 25, t(9, 3, 7, 9, 2, 7)),
  p('sheringham', 'Teddy Sheringham', 1966, 'England', ['ST', 'AM'], 83, 83, 2001, 30, t(8, 6, 8, 6, 5, 7)),
];

/** A curated marquee player at another club, with optional agency hints. */
function q(
  club: ClubId,
  id: string,
  name: string,
  birthYear: number,
  nationality: string,
  positions: Position[],
  ability: number,
  potentialCeiling: number,
  contractUntil: number,
  injuryProneness: number,
  personality: Trait,
  extra: { hardBlocks?: HardBlock[]; loyalty?: number } = {},
): CuratedSeed {
  return {
    id: `cur_${id}`,
    name,
    birthYear,
    nationality,
    positions,
    club,
    contractUntil,
    ability,
    potentialCeiling,
    personality,
    injuryProneness,
    ...extra,
  };
}

/**
 * Hard-block exemplars — real one-club men who are practically unbuyable (the
 * Messi rule, §6). Their clubs get a curated marquee + procedural depth.
 */
export const NEWCASTLE_1999: CuratedSeed[] = [
  q('newcastle', 'shearer', 'Alan Shearer', 1970, 'England', ['ST'], 87, 88, 2004, 40, t(9, 7, 8, 10, 4, 6), {
    loyalty: 96,
    hardBlocks: [{ reason: 'Alan Shearer will not leave Newcastle. This is not about money.', untilYear: 2006 }],
  }),
];

export const SOUTHAMPTON_1999: CuratedSeed[] = [
  q('southampton', 'letissier', 'Matt Le Tissier', 1968, 'England', ['AM'], 82, 83, 2002, 45, t(7, 6, 6, 10, 5, 6), {
    loyalty: 98,
    hardBlocks: [{ reason: 'Le Tissier is a Southampton one-club man. He will not move.', untilYear: 2003 }],
  }),
];

export const MILAN_1999: CuratedSeed[] = [
  q('milan', 'maldini', 'Paolo Maldini', 1968, 'Italy', ['LB', 'CB'], 89, 90, 2005, 25, t(10, 6, 8, 10, 2, 6), {
    loyalty: 99,
    hardBlocks: [{ reason: 'Paolo Maldini is Milan for life. He is not for sale at any price.', untilYear: 2009 }],
  }),
];

/**
 * Real-ledger subjects — players curated at their SOURCE clubs so the real
 * transfer ledger (ledger.ts) can move them to their real destinations on
 * schedule (reality-default, §9f). Non-user clubs only.
 */
export const ARSENAL_1999: CuratedSeed[] = [
  q('arsenal', 'anelka', 'Nicolas Anelka', 1979, 'France', ['ST'], 82, 86, 2003, 30, t(5, 8, 8, 3, 6, 6)),
  q('arsenal', 'overmars', 'Marc Overmars', 1973, 'Netherlands', ['LW'], 84, 85, 2002, 55, t(7, 5, 7, 5, 4, 7)),
];
export const LIVERPOOL_1999: CuratedSeed[] = [
  q('liverpool', 'mcmanaman', 'Steve McManaman', 1972, 'England', ['RW', 'AM'], 82, 83, 2000, 25, t(7, 6, 7, 5, 4, 8)),
  q('liverpool', 'owen', 'Michael Owen', 1979, 'England', ['ST'], 87, 90, 2005, 45, t(8, 6, 8, 6, 4, 7)),
];
export const LEEDS_1999: CuratedSeed[] = [
  q('leeds', 'rkeane', 'Robbie Keane', 1980, 'Ireland', ['ST'], 79, 85, 2004, 25, t(7, 6, 8, 5, 5, 8)),
  q('leeds', 'woodgate', 'Jonathan Woodgate', 1980, 'England', ['CB'], 80, 87, 2004, 65, t(6, 5, 7, 6, 6, 6)),
];
export const INTER_1999: CuratedSeed[] = [
  q('inter', 'crespo', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 85, 86, 2006, 40, t(7, 6, 8, 5, 5, 7)),
];

/** Curated squads keyed by scenario → club (marquee real players + procedural
 *  depth is filled in at squad build). */
export const CURATED_SQUADS: Record<string, Record<string, CuratedSeed[]>> = {
  'man-utd-1999': {
    man_utd: MAN_UTD_1999,
    newcastle: NEWCASTLE_1999,
    southampton: SOUTHAMPTON_1999,
    milan: MILAN_1999,
    arsenal: ARSENAL_1999,
    liverpool: LIVERPOOL_1999,
    leeds: LEEDS_1999,
    inter: INTER_1999,
  },
};
