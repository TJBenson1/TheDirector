/**
 * Curated real players — SKELETON pack (M3). The full ~800/era curation is M10
 * data work (§4, §17.10). This file ships the flagship vertical-slice squad —
 * the real Manchester United 1999–2000 side — with real birth years,
 * nationalities and positions. Ability/potential/personality are designer
 * estimates (they are HIDDEN from the user and calibrated, §7), not scraped
 * facts. Everything else in the world is procedural filler for now.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import { MAN_UTD_2013_SQUADS } from './curated-2013.js';

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
  | 'agitation'
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

/** Era transfer targets curated at their real 1999 clubs (the selling clubs are
 *  Tier-3 context clubs added by the scenario). */
export const MONACO_1999: CuratedSeed[] = [
  q('monaco', 'barthez', 'Fabien Barthez', 1971, 'France', ['GK'], 84, 85, 2002, 25, t(6, 7, 7, 5, 6, 6)),
];
export const LAZIO_1999: CuratedSeed[] = [
  q('lazio', 'veron', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM', 'AM'], 86, 87, 2004, 35, t(7, 6, 8, 5, 5, 5)),
];
export const PSV_1999: CuratedSeed[] = [
  q('psv', 'ruud', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 85, 90, 2004, 60, t(8, 6, 9, 6, 4, 7)),
];
export const MARSEILLE_1999: CuratedSeed[] = [
  q('marseille', 'pires', 'Robert Pirès', 1973, 'France', ['LW', 'AM'], 83, 87, 2002, 30, t(8, 5, 7, 6, 3, 7)),
];

/**
 * A pool of real central midfielders of the era, spread across clubs, so the
 * player has genuine, recognisable options to rebuild a midfield (e.g. to
 * replace Keane) rather than only procedural filler.
 */
export const MIDFIELD_POOL_1999: Array<[ClubId, CuratedSeed]> = [
  ['juventus', q('juventus', 'davids', 'Edgar Davids', 1973, 'Netherlands', ['CM', 'DM'], 85, 86, 2004, 35, t(7, 6, 8, 6, 6, 7))],
  ['juventus', q('juventus', 'tacchinardi', 'Alessio Tacchinardi', 1975, 'Italy', ['DM', 'CM'], 79, 81, 2004, 30, t(7, 4, 6, 7, 4, 6))],
  ['milan', q('milan', 'albertini', 'Demetrio Albertini', 1971, 'Italy', ['CM', 'DM'], 82, 82, 2002, 25, t(8, 5, 7, 8, 3, 7))],
  ['milan', q('milan', 'gattuso', 'Gennaro Gattuso', 1978, 'Italy', ['DM'], 79, 85, 2004, 30, t(8, 5, 9, 7, 6, 7))],
  ['real_madrid', q('real_madrid', 'redondo', 'Fernando Redondo', 1969, 'Argentina', ['DM', 'CM'], 86, 86, 2002, 30, t(8, 5, 7, 6, 3, 7))],
  ['liverpool', q('liverpool', 'hamann', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 81, 82, 2003, 30, t(8, 4, 7, 6, 3, 7))],
  ['inter', q('inter', 'seedorf', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 84, 87, 2004, 25, t(7, 7, 8, 5, 5, 7))],
  ['barcelona', q('barcelona', 'cocu', 'Phillip Cocu', 1970, 'Netherlands', ['CM', 'DM'], 82, 83, 2003, 20, t(8, 4, 7, 7, 3, 8))],
  ['bayern', q('bayern', 'effenberg', 'Stefan Effenberg', 1968, 'Germany', ['CM'], 83, 84, 2002, 30, t(6, 8, 8, 6, 7, 6))],
  ['lazio', q('lazio', 'nedved', 'Pavel Nedvěd', 1972, 'Czech Republic', ['CM', 'LW'], 85, 88, 2004, 25, t(9, 5, 9, 6, 4, 7))],
];

/**
 * Broad real-player pool for 1999 across positions and clubs, so the UI can
 * suggest realistic options for ANY position and answer queries about specific
 * real players. Contracts reflect reality (short ones = Bosman risk, e.g. Sol
 * Campbell 2001). Distressed clubs (Leeds, Lazio) hold sellable stars.
 */
export const ERA_1999_POOL: Array<[ClubId, CuratedSeed]> = [
  // ── Goalkeepers ──
  ['juventus', q('juventus', 'vandersar', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 84, 85, 2002, 20, t(9, 5, 7, 6, 2, 8))],
  ['bayern', q('bayern', 'kahn', 'Oliver Kahn', 1969, 'Germany', ['GK'], 88, 88, 2004, 20, t(9, 7, 9, 9, 5, 6))],
  ['real_madrid', q('real_madrid', 'casillas', 'Iker Casillas', 1981, 'Spain', ['GK'], 76, 90, 2004, 20, t(9, 4, 8, 9, 3, 8))],
  // ── Defenders ──
  ['real_madrid', q('real_madrid', 'hierro', 'Fernando Hierro', 1968, 'Spain', ['CB'], 85, 85, 2003, 25, t(9, 6, 8, 9, 4, 6))],
  ['real_madrid', q('real_madrid', 'roberto_carlos', 'Roberto Carlos', 1973, 'Brazil', ['LB'], 87, 87, 2004, 25, t(8, 6, 8, 7, 4, 7))],
  ['barcelona', q('barcelona', 'deboer', 'Frank de Boer', 1970, 'Netherlands', ['CB'], 84, 84, 2003, 25, t(8, 5, 7, 6, 3, 7))],
  ['lazio', q('lazio', 'nesta', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 87, 90, 2005, 30, t(9, 5, 8, 9, 3, 7))],
  ['lazio', q('lazio', 'mihajlovic', 'Siniša Mihajlović', 1969, 'Serbia', ['CB', 'LB'], 82, 82, 2003, 30, t(6, 7, 7, 6, 8, 6))],
  ['spurs', q('spurs', 'campbell', 'Sol Campbell', 1974, 'England', ['CB'], 85, 87, 2001, 25, t(8, 6, 8, 7, 4, 6))],
  ['leeds', q('leeds', 'ferdinand', 'Rio Ferdinand', 1978, 'England', ['CB'], 82, 90, 2004, 30, t(7, 6, 8, 6, 5, 7))],
  ['chelsea', q('chelsea', 'desailly', 'Marcel Desailly', 1968, 'France', ['CB', 'DM'], 85, 85, 2002, 25, t(8, 6, 8, 7, 4, 7))],
  ['liverpool', q('liverpool', 'hyypia', 'Sami Hyypiä', 1973, 'Finland', ['CB'], 82, 84, 2004, 20, t(9, 4, 7, 8, 3, 7))],
  ['liverpool', q('liverpool', 'carragher', 'Jamie Carragher', 1978, 'England', ['CB', 'RB'], 78, 84, 2004, 25, t(9, 4, 8, 10, 5, 6))],
  ['bayern', q('bayern', 'lizarazu', 'Bixente Lizarazu', 1969, 'France', ['LB'], 83, 83, 2003, 25, t(8, 5, 7, 7, 4, 7))],
  ['marseille', q('marseille', 'gallas', 'William Gallas', 1977, 'France', ['CB', 'LB'], 79, 86, 2003, 30, t(7, 6, 7, 5, 6, 7))],
  // ── Midfielders (beyond the dedicated pool) ──
  ['juventus', q('juventus', 'zidane', 'Zinedine Zidane', 1972, 'France', ['AM', 'CM'], 91, 92, 2004, 25, t(9, 6, 8, 6, 4, 7))],
  ['barcelona', q('barcelona', 'figo', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 88, 89, 2003, 25, t(8, 7, 8, 5, 4, 7))],
  ['barcelona', q('barcelona', 'rivaldo', 'Rivaldo', 1972, 'Brazil', ['AM', 'LW'], 89, 89, 2003, 30, t(7, 7, 8, 5, 5, 6))],
  ['barcelona', q('barcelona', 'guardiola', 'Pep Guardiola', 1971, 'Spain', ['DM', 'CM'], 82, 82, 2001, 25, t(9, 6, 8, 9, 3, 7))],
  ['arsenal', q('arsenal', 'vieira', 'Patrick Vieira', 1976, 'France', ['DM', 'CM'], 86, 89, 2004, 25, t(8, 7, 9, 6, 6, 7))],
  ['liverpool', q('liverpool', 'gerrard', 'Steven Gerrard', 1980, 'England', ['CM'], 76, 91, 2004, 40, t(9, 6, 10, 10, 5, 7))],
  ['leeds', q('leeds', 'dacourt', 'Olivier Dacourt', 1974, 'France', ['CM', 'DM'], 80, 82, 2004, 30, t(7, 5, 7, 5, 6, 7))],
  ['newcastle', q('newcastle', 'speed', 'Gary Speed', 1969, 'Wales', ['CM'], 79, 79, 2002, 20, t(9, 4, 7, 7, 3, 7))],
  ['lazio', q('lazio', 'simeone', 'Diego Simeone', 1970, 'Argentina', ['CM', 'DM'], 82, 82, 2002, 30, t(7, 7, 9, 6, 8, 6))],
  // ── Forwards ──
  ['real_madrid', q('real_madrid', 'raul', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 88, 90, 2004, 25, t(9, 6, 9, 10, 3, 7))],
  ['juventus', q('juventus', 'delpiero', 'Alessandro Del Piero', 1974, 'Italy', ['ST', 'AM'], 88, 89, 2004, 35, t(8, 7, 8, 9, 4, 7))],
  ['juventus', q('juventus', 'inzaghi', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 84, 85, 2003, 30, t(7, 6, 8, 6, 5, 6))],
  ['milan', q('milan', 'shevchenko', 'Andriy Shevchenko', 1976, 'Ukraine', ['ST'], 87, 91, 2004, 30, t(8, 6, 9, 7, 4, 7))],
  ['inter', q('inter', 'ronaldo', 'Ronaldo', 1976, 'Brazil', ['ST'], 90, 94, 2004, 75, t(6, 8, 8, 5, 6, 7))],
  ['inter', q('inter', 'vieri', 'Christian Vieri', 1973, 'Italy', ['ST'], 87, 88, 2004, 45, t(6, 8, 8, 5, 7, 6))],
  ['inter', q('inter', 'zanetti', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 85, 86, 2005, 15, t(10, 5, 9, 10, 2, 8))],
  ['bayern', q('bayern', 'elber', 'Giovane Élber', 1972, 'Brazil', ['ST'], 82, 83, 2003, 30, t(7, 6, 7, 6, 5, 7))],
  ['lazio', q('lazio', 'salas', 'Marcelo Salas', 1974, 'Chile', ['ST'], 83, 84, 2003, 40, t(7, 6, 8, 6, 6, 6))],
  ['leeds', q('leeds', 'kewell', 'Harry Kewell', 1978, 'Australia', ['LW', 'ST'], 82, 87, 2004, 45, t(6, 7, 7, 5, 6, 7))],
  ['leeds', q('leeds', 'viduka', 'Mark Viduka', 1975, 'Australia', ['ST'], 82, 84, 2004, 35, t(6, 7, 7, 5, 6, 6))],
  ['arsenal', q('arsenal', 'bergkamp', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 87, 88, 2003, 20, t(9, 6, 8, 8, 3, 6))],
  ['arsenal', q('arsenal', 'kanu', 'Nwankwo Kanu', 1976, 'Nigeria', ['ST'], 81, 84, 2003, 40, t(7, 6, 7, 6, 5, 7))],
  ['chelsea', q('chelsea', 'zola', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 85, 85, 2002, 25, t(9, 5, 8, 9, 3, 7))],
  ['monaco', q('monaco', 'trezeguet', 'David Trezeguet', 1977, 'France', ['ST'], 84, 88, 2004, 30, t(7, 6, 8, 6, 5, 7))],
];

/** Curated squads keyed by scenario → club (marquee real players + procedural
 *  depth is filled in at squad build). */
const MAN_UTD_1999_SQUADS: Record<string, CuratedSeed[]> = {
  man_utd: MAN_UTD_1999,
  newcastle: NEWCASTLE_1999,
  southampton: SOUTHAMPTON_1999,
  milan: [...MILAN_1999],
  arsenal: ARSENAL_1999,
  liverpool: [...LIVERPOOL_1999],
  leeds: LEEDS_1999,
  inter: [...INTER_1999],
  monaco: MONACO_1999,
  lazio: [...LAZIO_1999],
  psv: PSV_1999,
  marseille: MARSEILLE_1999,
};
// Merge the midfield pool + the broad era pool into the relevant clubs.
for (const [club, seed] of [...MIDFIELD_POOL_1999, ...ERA_1999_POOL]) {
  (MAN_UTD_1999_SQUADS[club] ??= []).push(seed);
}

export const CURATED_SQUADS: Record<string, Record<string, CuratedSeed[]>> = {
  'man-utd-1999': MAN_UTD_1999_SQUADS,
  'man-utd-2013': MAN_UTD_2013_SQUADS,
};
