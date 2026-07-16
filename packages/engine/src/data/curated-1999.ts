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
import { ARSENAL_2004_SQUADS } from './curated-2004.js';
import { LIVERPOOL_2001_SQUADS } from './curated-2001.js';
import { REAL_MADRID_2000_SQUADS } from './curated-2000.js';
import { JUVENTUS_1995_SQUADS } from './curated-1995.js';
import { MANUTD_2003_SQUADS } from './curated-2003.js';
import { ARSENAL_1996_SQUADS } from './curated-1996.js';
import { INTER_1998_SQUADS } from './curated-serie-a-1998.js';
import { MILAN_2007_SQUADS } from './curated-serie-a-2007.js';

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
 * Long-horizon subjects for the Cristiano Ronaldo arc (2003 arrival, 2009 sale)
 * and the 2009 galáctico cascade. Curated at their source clubs as teenagers
 * with real birth years so a 1999 playthrough that reaches 2009 sees them come
 * of age and move on schedule (unless the user diverts the chain). Robben and
 * Sneijder sit as Madrid depth that the Ronaldo money offloaded in reality.
 */
export const SPORTING_1999: CuratedSeed[] = [
  q('sporting', 'cristiano', 'Cristiano Ronaldo', 1985, 'Portugal', ['RW', 'LW', 'ST'], 66, 94, 2003, 15, t(10, 8, 10, 5, 3, 9)),
];
export const WIGAN_1999: CuratedSeed[] = [
  q('wigan', 'valencia_w', 'Antonio Valencia', 1985, 'Ecuador', ['RW'], 52, 82, 2009, 25, t(8, 4, 8, 6, 3, 7)),
];
// The Ronaldinho gambit as a 1999 play: the young Brazilian sits at PSG on a
// contract that runs to his real 2003 Barça move (see LEDGER_1999_2004). A United
// side playing forward can hijack him that summer — the counterfactual that used
// to be its own 2003 start point. His decline-prone lifestyle profile mirrors the
// era-2003 pack; the ceiling is high enough that four years of development make
// him the world-class playmaker Barça really signed.
export const PSG_1999: CuratedSeed[] = [
  q('psg', 'ronaldinho', 'Ronaldinho', 1980, 'Brazil', ['AM', 'LW'], 83, 93, 2003, 30, t(6, 7, 9, 6, 6, 8)),
  q('psg', 'ronaldinho_foil', 'Jérôme Leroy', 1974, 'France', ['AM'], 74, 75, 2005, 25, t(7, 5, 6, 6, 5, 7)),
];
export const REAL_MADRID_CASCADE_1999: CuratedSeed[] = [
  q('real_madrid', 'robben', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 60, 89, 2010, 55, t(8, 7, 9, 6, 5, 7)),
  q('real_madrid', 'sneijder', 'Wesley Sneijder', 1984, 'Netherlands', ['AM', 'CM'], 60, 88, 2010, 35, t(7, 6, 8, 6, 5, 7)),
];

/**
 * Real Madrid's 2000 supporting cast for the galáctico-era start point
 * (real-madrid-2000). The marquee names (Raúl, Casillas, Roberto Carlos, Hierro,
 * Redondo) already live in the shared era pools; this fills out the rest of the
 * real squad — including Makélélé, whose 2003 sale is the pragmatic pivot of
 * that era ("keep the balance, or cash in for another galáctico?").
 */
export const REAL_MADRID_2000: CuratedSeed[] = [
  q('real_madrid', 'makelele', 'Claude Makélélé', 1973, 'France', ['DM'], 85, 86, 2003, 25, t(9, 4, 8, 7, 3, 7)),
  q('real_madrid', 'salgado', 'Míchel Salgado', 1975, 'Spain', ['RB'], 81, 82, 2004, 30, t(8, 5, 8, 8, 5, 7)),
  q('real_madrid', 'morientes', 'Fernando Morientes', 1976, 'Spain', ['ST'], 84, 85, 2004, 35, t(8, 5, 8, 7, 4, 7)),
  q('real_madrid', 'guti', 'Guti', 1976, 'Spain', ['AM', 'CM'], 82, 85, 2004, 30, t(6, 7, 6, 8, 6, 7)),
  q('real_madrid', 'helguera', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 82, 83, 2004, 30, t(8, 5, 8, 7, 5, 7)),
  q('real_madrid', 'solari', 'Santiago Solari', 1976, 'Argentina', ['LW', 'AM'], 79, 81, 2004, 25, t(8, 5, 7, 7, 4, 7)),
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
// ── Depth top-ups: every playable club that appears in this pack fields a full
//    real 1999-2000 squad (>=13). Some already draw a handful from the shared era
//    pools; these arrays supply the rest with distinct ids. ─────────────────────
const BARCELONA_1999_EXTRA: CuratedSeed[] = [
  q('barcelona', 'arnau_b99', 'Arnau', 1975, 'Spain', ['GK'], 76, 78, 2003, 25, t(7, 5, 7, 7, 5, 7)),
  q('barcelona', 'reiziger_b99', 'Michael Reiziger', 1973, 'Netherlands', ['RB'], 78, 80, 2003, 30, t(8, 5, 7, 7, 4, 7)),
  q('barcelona', 'abelardo_b99', 'Abelardo', 1970, 'Spain', ['CB'], 79, 80, 2002, 30, t(8, 5, 8, 8, 5, 6)),
  q('barcelona', 'puyol_b99', 'Carles Puyol', 1978, 'Spain', ['CB', 'RB'], 72, 87, 2004, 25, t(10, 4, 9, 10, 4, 7)),
  q('barcelona', 'xavi_b99', 'Xavi', 1980, 'Spain', ['CM'], 72, 89, 2004, 20, t(10, 4, 9, 10, 3, 8)),
  q('barcelona', 'luisenrique_b99', 'Luis Enrique', 1970, 'Spain', ['CM', 'RW'], 84, 85, 2003, 30, t(9, 6, 9, 8, 5, 7)),
  q('barcelona', 'kluivert_b99', 'Patrick Kluivert', 1976, 'Netherlands', ['ST'], 84, 86, 2003, 35, t(6, 8, 8, 6, 6, 7)),
  q('barcelona', 'zenden_b99', 'Boudewijn Zenden', 1976, 'Netherlands', ['LW'], 79, 81, 2002, 30, t(8, 5, 7, 7, 4, 7)),
];
const BAYERN_1999: CuratedSeed[] = [
  q('bayern', 'babbel_b99', 'Markus Babbel', 1972, 'Germany', ['RB', 'CB'], 82, 83, 2000, 30, t(8, 5, 8, 7, 4, 7)),
  q('bayern', 'kuffour_b99', 'Samuel Kuffour', 1976, 'Ghana', ['CB'], 80, 82, 2003, 30, t(8, 5, 8, 7, 5, 6)),
  q('bayern', 'linke_b99', 'Thomas Linke', 1969, 'Germany', ['CB'], 78, 79, 2002, 30, t(8, 4, 7, 8, 4, 6)),
  q('bayern', 'tarnat_b99', 'Michael Tarnat', 1969, 'Germany', ['LB'], 78, 79, 2002, 30, t(8, 5, 7, 7, 5, 7)),
  q('bayern', 'jeremies_b99', 'Jens Jeremies', 1974, 'Germany', ['DM'], 80, 81, 2003, 40, t(9, 5, 8, 8, 5, 6)),
  q('bayern', 'salihamidzic_b99', 'Hasan Salihamidžić', 1977, 'Bosnia', ['RW'], 78, 80, 2004, 30, t(9, 5, 8, 8, 5, 7)),
  q('bayern', 'scholl_b99', 'Mehmet Scholl', 1970, 'Germany', ['AM'], 83, 84, 2002, 45, t(7, 6, 7, 8, 5, 7)),
  q('bayern', 'jancker_b99', 'Carsten Jancker', 1974, 'Germany', ['ST'], 80, 81, 2002, 35, t(7, 6, 8, 7, 5, 6)),
  q('bayern', 'zickler_b99', 'Alexander Zickler', 1974, 'Germany', ['ST'], 77, 79, 2002, 40, t(7, 5, 7, 7, 5, 7)),
];
const JUVENTUS_1999: CuratedSeed[] = [
  q('juventus', 'ferrara_j99', 'Ciro Ferrara', 1967, 'Italy', ['CB'], 82, 83, 2001, 30, t(9, 5, 8, 9, 4, 6)),
  q('juventus', 'iuliano_j99', 'Mark Iuliano', 1973, 'Italy', ['CB'], 79, 80, 2003, 35, t(8, 5, 7, 8, 5, 6)),
  q('juventus', 'montero_j99', 'Paolo Montero', 1971, 'Uruguay', ['CB'], 83, 84, 2003, 40, t(8, 7, 8, 8, 7, 6)),
  q('juventus', 'pessotto_j99', 'Gianluca Pessotto', 1970, 'Italy', ['LB', 'RB'], 77, 78, 2003, 30, t(8, 4, 7, 9, 4, 6)),
  q('juventus', 'conte_j99', 'Antonio Conte', 1969, 'Italy', ['CM'], 80, 81, 2003, 40, t(9, 6, 9, 10, 6, 6)),
  q('juventus', 'zambrotta_j99', 'Gianluca Zambrotta', 1977, 'Italy', ['RB', 'LB'], 76, 85, 2004, 30, t(8, 5, 8, 7, 5, 7)),
  q('juventus', 'kovacevic_j99', 'Darko Kovačević', 1973, 'Serbia', ['ST'], 80, 81, 2003, 30, t(7, 6, 8, 6, 5, 7)),
];
const MILAN_1999_EXTRA: CuratedSeed[] = [
  q('milan', 'abbiati_m99', 'Christian Abbiati', 1977, 'Italy', ['GK'], 80, 83, 2004, 25, t(8, 5, 7, 8, 5, 6)),
  q('milan', 'costacurta_m99', 'Alessandro Costacurta', 1966, 'Italy', ['CB'], 82, 83, 2002, 35, t(9, 5, 8, 9, 4, 6)),
  q('milan', 'helveg_m99', 'Thomas Helveg', 1971, 'Denmark', ['RB'], 78, 79, 2002, 30, t(8, 5, 7, 7, 4, 7)),
  q('milan', 'serginho_m99', 'Serginho', 1971, 'Brazil', ['LB', 'LW'], 78, 80, 2003, 30, t(8, 5, 7, 8, 5, 7)),
  q('milan', 'boban_m99', 'Zvonimir Boban', 1968, 'Croatia', ['AM'], 82, 83, 2001, 40, t(7, 7, 8, 7, 6, 7)),
  q('milan', 'ambrosini_m99', 'Massimo Ambrosini', 1977, 'Italy', ['CM', 'DM'], 76, 82, 2004, 35, t(9, 5, 8, 9, 4, 6)),
  q('milan', 'leonardo_m99', 'Leonardo', 1969, 'Brazil', ['AM', 'LW'], 82, 83, 2001, 30, t(8, 6, 8, 7, 5, 8)),
  q('milan', 'bierhoff_m99', 'Oliver Bierhoff', 1968, 'Germany', ['ST'], 82, 83, 2001, 30, t(8, 6, 8, 7, 4, 7)),
  q('milan', 'sala_m99', 'Roberto Sala', 1975, 'Italy', ['RB', 'RW'], 76, 77, 2002, 30, t(8, 4, 7, 7, 5, 6)),
];
const INTER_1999_EXTRA: CuratedSeed[] = [
  q('inter', 'peruzzi_i99', 'Angelo Peruzzi', 1970, 'Italy', ['GK'], 82, 83, 2002, 30, t(8, 6, 8, 8, 5, 6)),
  q('inter', 'blanc_i99', 'Laurent Blanc', 1965, 'France', ['CB'], 82, 83, 2001, 30, t(9, 6, 8, 8, 4, 7)),
  q('inter', 'cauet_i99', 'Benoît Cauet', 1969, 'France', ['CM', 'DM'], 78, 79, 2002, 35, t(8, 5, 7, 7, 5, 6)),
  q('inter', 'simeone_i99', 'Diego Simeone', 1970, 'Argentina', ['CM', 'DM'], 82, 83, 2001, 35, t(8, 7, 9, 7, 7, 7)),
  q('inter', 'rbaggio_i99', 'Roberto Baggio', 1967, 'Italy', ['AM', 'ST'], 84, 85, 2000, 45, t(8, 6, 8, 7, 5, 8)),
  q('inter', 'zamorano_i99', 'Iván Zamorano', 1967, 'Chile', ['ST'], 80, 81, 2001, 35, t(8, 6, 9, 8, 5, 7)),
  q('inter', 'recoba_i99', 'Álvaro Recoba', 1976, 'Uruguay', ['AM', 'LW'], 80, 82, 2004, 35, t(6, 8, 7, 6, 6, 7)),
  q('inter', 'colonnese_i99', 'Francesco Colonnese', 1971, 'Italy', ['CB', 'LB'], 76, 77, 2002, 30, t(7, 5, 7, 7, 5, 6)),
];
const ARSENAL_1999_EXTRA: CuratedSeed[] = [
  q('arsenal', 'seaman_a99', 'David Seaman', 1963, 'England', ['GK'], 84, 85, 2002, 30, t(9, 6, 8, 9, 4, 6)),
  q('arsenal', 'dixon_a99', 'Lee Dixon', 1964, 'England', ['RB'], 80, 81, 2001, 30, t(9, 4, 8, 9, 4, 6)),
  q('arsenal', 'adams_a99', 'Tony Adams', 1966, 'England', ['CB'], 84, 85, 2002, 35, t(9, 7, 10, 10, 5, 6)),
  q('arsenal', 'keown_a99', 'Martin Keown', 1966, 'England', ['CB'], 82, 83, 2002, 30, t(8, 6, 8, 9, 6, 6)),
  q('arsenal', 'winterburn_a99', 'Nigel Winterburn', 1963, 'England', ['LB'], 80, 81, 2001, 30, t(9, 4, 8, 9, 4, 6)),
  q('arsenal', 'petit_a99', 'Emmanuel Petit', 1970, 'France', ['CM', 'DM'], 84, 85, 2001, 30, t(8, 6, 8, 7, 5, 7)),
  q('arsenal', 'parlour_a99', 'Ray Parlour', 1973, 'England', ['CM', 'RW'], 80, 81, 2003, 30, t(9, 5, 8, 9, 4, 7)),
  q('arsenal', 'henry_a99', 'Thierry Henry', 1977, 'France', ['ST', 'LW'], 84, 92, 2004, 25, t(9, 7, 9, 8, 4, 8)),
];
const LIVERPOOL_1999_EXTRA: CuratedSeed[] = [
  q('liverpool', 'westerveld_l99', 'Sander Westerveld', 1974, 'Netherlands', ['GK'], 79, 80, 2003, 25, t(8, 5, 7, 7, 5, 7)),
  q('liverpool', 'henchoz_l99', 'Stéphane Henchoz', 1974, 'Switzerland', ['CB'], 81, 82, 2004, 30, t(8, 4, 7, 8, 4, 6)),
  q('liverpool', 'matteo_l99', 'Dominic Matteo', 1974, 'Scotland', ['CB', 'LB'], 78, 79, 2001, 30, t(8, 4, 7, 7, 5, 6)),
  q('liverpool', 'berger_l99', 'Patrik Berger', 1973, 'Czech Republic', ['LW', 'AM'], 81, 82, 2002, 40, t(7, 6, 7, 7, 5, 7)),
  q('liverpool', 'redknapp_l99', 'Jamie Redknapp', 1973, 'England', ['CM'], 80, 82, 2002, 55, t(8, 5, 7, 8, 4, 7)),
  q('liverpool', 'smicer_l99', 'Vladimír Šmicer', 1973, 'Czech Republic', ['RW', 'AM'], 79, 80, 2003, 40, t(7, 5, 7, 7, 5, 7)),
  q('liverpool', 'fowler_l99', 'Robbie Fowler', 1975, 'England', ['ST'], 84, 85, 2003, 40, t(7, 7, 8, 8, 6, 6)),
];
const CHELSEA_1999: CuratedSeed[] = [
  q('chelsea', 'degoey_c99', 'Ed de Goey', 1966, 'Netherlands', ['GK'], 80, 81, 2002, 25, t(8, 5, 7, 8, 5, 6)),
  q('chelsea', 'ferrer_c99', 'Albert Ferrer', 1970, 'Spain', ['RB'], 80, 81, 2002, 30, t(8, 4, 7, 8, 4, 7)),
  q('chelsea', 'leboeuf_c99', 'Frank Leboeuf', 1968, 'France', ['CB'], 82, 83, 2001, 30, t(8, 6, 8, 7, 5, 7)),
  q('chelsea', 'babayaro_c99', 'Celestine Babayaro', 1978, 'Nigeria', ['LB'], 79, 81, 2003, 35, t(7, 5, 7, 7, 5, 7)),
  q('chelsea', 'petrescu_c99', 'Dan Petrescu', 1967, 'Romania', ['RW', 'RB'], 79, 80, 2001, 30, t(8, 5, 7, 7, 5, 7)),
  q('chelsea', 'deschamps_c99', 'Didier Deschamps', 1968, 'France', ['DM', 'CM'], 82, 83, 2001, 30, t(9, 5, 9, 8, 4, 7)),
  q('chelsea', 'wise_c99', 'Dennis Wise', 1966, 'England', ['CM'], 80, 81, 2001, 35, t(7, 7, 9, 9, 7, 6)),
  q('chelsea', 'poyet_c99', 'Gustavo Poyet', 1967, 'Uruguay', ['AM', 'CM'], 82, 83, 2001, 35, t(8, 6, 8, 7, 5, 7)),
  q('chelsea', 'dimatteo_c99', 'Roberto Di Matteo', 1970, 'Italy', ['CM'], 80, 81, 2002, 35, t(8, 5, 8, 8, 4, 7)),
  q('chelsea', 'flo_c99', 'Tore André Flo', 1973, 'Norway', ['ST'], 80, 81, 2002, 30, t(8, 5, 7, 7, 4, 7)),
  q('chelsea', 'sutton_c99', 'Chris Sutton', 1973, 'England', ['ST'], 79, 80, 2003, 35, t(7, 6, 8, 7, 5, 6)),
];
const SPURS_1999: CuratedSeed[] = [
  q('spurs', 'walker_s99', 'Ian Walker', 1971, 'England', ['GK'], 79, 80, 2002, 25, t(7, 5, 7, 7, 5, 6)),
  q('spurs', 'carr_s99', 'Stephen Carr', 1976, 'Ireland', ['RB'], 79, 81, 2003, 30, t(8, 5, 8, 8, 4, 7)),
  q('spurs', 'perry_s99', 'Chris Perry', 1973, 'England', ['CB'], 76, 77, 2002, 30, t(8, 4, 7, 7, 5, 6)),
  q('spurs', 'taricco_s99', 'Mauricio Taricco', 1973, 'Argentina', ['LB'], 76, 77, 2003, 35, t(7, 5, 7, 7, 6, 7)),
  q('spurs', 'anderton_s99', 'Darren Anderton', 1972, 'England', ['RW', 'AM'], 80, 81, 2002, 45, t(8, 5, 7, 8, 4, 7)),
  q('spurs', 'freund_s99', 'Steffen Freund', 1970, 'Germany', ['DM'], 78, 79, 2002, 35, t(9, 5, 8, 8, 5, 6)),
  q('spurs', 'sherwood_s99', 'Tim Sherwood', 1969, 'England', ['CM'], 79, 80, 2001, 30, t(8, 6, 8, 8, 5, 6)),
  q('spurs', 'ginola_s99', 'David Ginola', 1967, 'France', ['LW'], 83, 84, 2001, 35, t(6, 8, 7, 6, 6, 7)),
  q('spurs', 'iversen_s99', 'Steffen Iversen', 1976, 'Norway', ['ST'], 78, 80, 2003, 35, t(7, 5, 7, 7, 5, 7)),
  q('spurs', 'armstrong_s99', 'Chris Armstrong', 1971, 'England', ['ST'], 78, 79, 2002, 40, t(7, 5, 7, 7, 5, 6)),
  q('spurs', 'leonhardsen_s99', 'Øyvind Leonhardsen', 1970, 'Norway', ['CM'], 78, 79, 2002, 30, t(8, 5, 8, 7, 5, 7)),
  q('spurs', 'dominguez_s99', 'José Domínguez', 1974, 'Portugal', ['LW', 'AM'], 76, 77, 2001, 30, t(6, 6, 7, 6, 6, 7)),
];
/** Manchester City, 1999-2000 — a second-tier side pushing for promotion. */
const MAN_CITY_1999: CuratedSeed[] = [
  q('man_city', 'weaver_mc99', 'Nicky Weaver', 1979, 'England', ['GK'], 70, 76, 2003, 25, t(7, 5, 7, 7, 5, 6)),
  q('man_city', 'crooks_mc99', 'Lee Crooks', 1978, 'England', ['RB', 'CM'], 63, 68, 2002, 30, t(7, 4, 7, 7, 5, 6)),
  q('man_city', 'wiekens_mc99', 'Gerard Wiekens', 1973, 'Netherlands', ['CB', 'DM'], 68, 70, 2002, 30, t(8, 4, 7, 7, 5, 6)),
  q('man_city', 'morrison_mc99', 'Andy Morrison', 1970, 'Scotland', ['CB'], 66, 67, 2001, 35, t(7, 5, 8, 8, 6, 5)),
  q('man_city', 'edghill_mc99', 'Richard Edghill', 1974, 'England', ['RB', 'LB'], 62, 64, 2001, 30, t(7, 4, 7, 7, 5, 6)),
  q('man_city', 'horlock_mc99', 'Kevin Horlock', 1972, 'N. Ireland', ['CM', 'LW'], 68, 70, 2002, 30, t(8, 5, 7, 7, 5, 6)),
  q('man_city', 'bishop_mc99', 'Ian Bishop', 1965, 'England', ['CM'], 67, 68, 2001, 30, t(8, 4, 7, 8, 4, 6)),
  q('man_city', 'cooke_mc99', 'Terry Cooke', 1976, 'England', ['RW'], 66, 70, 2002, 35, t(6, 5, 7, 6, 6, 6)),
  q('man_city', 'kennedy_mc99', 'Mark Kennedy', 1976, 'Ireland', ['LW'], 68, 72, 2003, 35, t(6, 5, 7, 6, 6, 7)),
  q('man_city', 'goater_mc99', 'Shaun Goater', 1970, 'Bermuda', ['ST'], 70, 72, 2002, 30, t(8, 5, 8, 8, 4, 6)),
  q('man_city', 'dickov_mc99', 'Paul Dickov', 1972, 'Scotland', ['ST'], 68, 70, 2002, 35, t(7, 6, 8, 8, 6, 6)),
  q('man_city', 'whitley_mc99', 'Jeff Whitley', 1979, 'N. Ireland', ['CM'], 63, 68, 2003, 30, t(6, 5, 7, 6, 6, 6)),
  q('man_city', 'tiatto_mc99', 'Danny Tiatto', 1973, 'Australia', ['LB', 'LW'], 64, 66, 2002, 35, t(6, 6, 7, 6, 7, 6)),
];

const MAN_UTD_1999_SQUADS: Record<string, CuratedSeed[]> = {
  man_utd: MAN_UTD_1999,
  newcastle: NEWCASTLE_1999,
  southampton: SOUTHAMPTON_1999,
  milan: [...MILAN_1999, ...MILAN_1999_EXTRA],
  arsenal: [...ARSENAL_1999, ...ARSENAL_1999_EXTRA],
  liverpool: [...LIVERPOOL_1999, ...LIVERPOOL_1999_EXTRA],
  leeds: LEEDS_1999,
  inter: [...INTER_1999, ...INTER_1999_EXTRA],
  monaco: MONACO_1999,
  lazio: [...LAZIO_1999],
  psv: PSV_1999,
  marseille: MARSEILLE_1999,
  sporting: SPORTING_1999,
  psg: PSG_1999,
  wigan: WIGAN_1999,
  barcelona: [...BARCELONA_1999_EXTRA],
  bayern: [...BAYERN_1999],
  juventus: [...JUVENTUS_1999],
  chelsea: [...CHELSEA_1999],
  spurs: [...SPURS_1999],
  man_city: [...MAN_CITY_1999],
};
// Merge the midfield pool + the broad era pool into the relevant clubs.
for (const [club, seed] of [...MIDFIELD_POOL_1999, ...ERA_1999_POOL]) {
  (MAN_UTD_1999_SQUADS[club] ??= []).push(seed);
}
// The 2009 Madrid-cascade depth + the 2000 supporting cast live at Real Madrid.
for (const seed of [...REAL_MADRID_CASCADE_1999, ...REAL_MADRID_2000]) {
  (MAN_UTD_1999_SQUADS.real_madrid ??= []).push(seed);
}

export const CURATED_SQUADS: Record<string, Record<string, CuratedSeed[]>> = {
  'man-utd-1999': MAN_UTD_1999_SQUADS,
  // The Lippi-era Juventus start has its own Serie A "Golden Age" pack.
  'juventus-1995': JUVENTUS_1995_SQUADS,
  // Il Fenomeno's Inter has its own Serie A 1998-99 pack (Ronaldo's overstocked
  // front line, Zaccheroni's Milan, the Parmalat jewels, and the elite of Europe).
  'inter-1998': INTER_1998_SQUADS,
  // Milan's ageing 2007 European champions — Maldini, Kaká, Pirlo, Nesta — with
  // the late-2000s calcio and the elite of Europe (CL anchored to 2022).
  'milan-2007': MILAN_2007_SQUADS,
  // The Galácticos-era Madrid start has its own Spanish/European pack (La Liga
  // 2000–01 + the clubs Real bought their galácticos from).
  'real-madrid-2000': REAL_MADRID_2000_SQUADS,
  'man-utd-2013': MAN_UTD_2013_SQUADS,
  'arsenal-2004': ARSENAL_2004_SQUADS,
  'liverpool-2001': LIVERPOOL_2001_SQUADS,
  // Chelsea 2003 is the home of the era-2003 pack (the Roman-empire squads plus
  // the Barça counterfactual's source clubs). The Ronaldinho gambit itself now
  // lives at the man-utd-1999 start, where United can hijack him playing forward.
  'chelsea-2003': MANUTD_2003_SQUADS,
  // Wenger's 1996 Arsenal now has its own dedicated era-1996 pack (real 1996-97
  // squads, no Man City in the top flight, young Ronaldo at Barça, Zidane year 1).
  'arsenal-1996': ARSENAL_1996_SQUADS,
  // Reuse-first sibling starts: each shares its era's curated pack with the club's
  // already-built sibling (same players, different playable club).
  'chelsea-1996': ARSENAL_1996_SQUADS, // era-1996 (Gullit's pre-money Chelsea)
  'spurs-2001': LIVERPOOL_2001_SQUADS, // era-2001 (the sleeping giant)
  'spurs-2013': MAN_UTD_2013_SQUADS, // era-2013 (the Bale windfall)
  'milan-1995': JUVENTUS_1995_SQUADS, // era-serie-a-1995 (end of the dynasty)
};
