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
import { INTER_1998_SQUADS } from './curated-1998.js';

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
  extra: { latentCeiling?: number } = {},
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
    ...extra,
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
  // Wes Brown — a genuine talent whose ceiling was capped by chronic injuries.
  // A user who keeps him fit and central can unlock the defender he could've been.
  p('wbrown', 'Wes Brown', 1979, 'England', ['CB'], 74, 85, 2004, 60, t(7, 4, 7, 9, 4, 6), { latentCeiling: 89 }),
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
  extra: { hardBlocks?: HardBlock[]; loyalty?: number; latentCeiling?: number } = {},
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
  q('liverpool', 'owen', 'Michael Owen', 1979, 'England', ['ST'], 87, 90, 2005, 68, t(8, 6, 8, 6, 4, 7)),
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

/** Real Betis, 1998–99 — home of Denílson, the world-record signing (~£21.5m from
 *  São Paulo) who became the definitive expensive flop: mesmerising stepovers,
 *  almost no end product. The lost-talent gamble is to make the fee finally make
 *  sense (latent 89). A La-Liga selling club for the esp-1 scenarios. */
export const BETIS_1999: CuratedSeed[] = [
  q('betis', 'prats99', 'Toni Prats', 1971, 'Spain', ['GK'], 76, 77, 2003, 20, t(7, 5, 5, 8, 4, 7)),
  q('betis', 'solozabal99', 'Roberto Solozábal', 1969, 'Spain', ['CB'], 75, 75, 2001, 30, t(7, 6, 6, 4, 6, 6)),
  q('betis', 'vidakovic99', 'Risto Vidaković', 1969, 'Serbia', ['CB'], 73, 74, 2001, 65, t(7, 5, 5, 6, 5, 6)),
  q('betis', 'filipescu99', 'Iulian Filipescu', 1974, 'Romania', ['CB'], 76, 79, 2003, 25, t(7, 5, 6, 6, 5, 6)),
  q('betis', 'ito99', 'Ito', 1975, 'Spain', ['RB', 'DM'], 75, 78, 2003, 25, t(8, 5, 6, 7, 4, 7)),
  q('betis', 'merino99', 'Juan Merino', 1970, 'Spain', ['DM', 'CB'], 73, 74, 2002, 25, t(8, 4, 5, 8, 3, 7)),
  q('betis', 'alexis99', 'Alexis Trujillo', 1965, 'Spain', ['CM'], 72, 72, 2000, 30, t(8, 4, 5, 8, 3, 7)),
  q('betis', 'canas99', 'Juanjo Cañas', 1972, 'Spain', ['CM', 'DM'], 70, 73, 2003, 25, t(8, 4, 5, 9, 3, 7)),
  // Benjamín Zarandona — a Spain U-21 champion of prodigious gifts, undone by a
  // hot temperament; a ceiling (81) his volatility keeps him from reaching.
  q('betis', 'benjamin99', 'Benjamín Zarandona', 1976, 'Spain', ['AM', 'CM'], 73, 81, 2003, 30, t(5, 6, 6, 6, 8, 6)),
  q('betis', 'finidi99', 'Finidi George', 1971, 'Nigeria', ['RW', 'LW'], 79, 80, 2001, 30, t(7, 5, 6, 7, 4, 7)),
  // Denílson — the world-record flop. Real ability modest (76); the gap to his
  // latent (89) IS the story: all flair, no end product, weak adaptability.
  q('betis', 'denilson99', 'Denílson', 1977, 'Brazil', ['LW', 'RW'], 76, 82, 2005, 25, t(5, 6, 6, 5, 8, 4), { latentCeiling: 89 }),
  q('betis', 'alfonso99', 'Alfonso Pérez', 1972, 'Spain', ['ST'], 80, 81, 2002, 40, t(8, 6, 8, 6, 4, 7)),
  q('betis', 'oli99', 'Oli', 1972, 'Spain', ['ST'], 76, 76, 2003, 35, t(7, 5, 6, 6, 5, 7)),
];

/** Valencia, 1999–2000 — the side that reached the 2000 Champions League final:
 *  Cañizares behind Mendieta, the Argentine flair of the Lópezes. A La-Liga
 *  power for the esp-1 scenarios; the ledger-worthy exodus began in 2000-01. */
export const VALENCIA_1999: CuratedSeed[] = [
  q('valencia', 'canizares99', 'Santiago Cañizares', 1969, 'Spain', ['GK'], 83, 84, 2004, 25, t(8, 6, 7, 7, 5, 7)),
  q('valencia', 'angloma99', 'Jocelyn Angloma', 1965, 'France', ['RB', 'CB'], 79, 79, 2002, 25, t(8, 4, 6, 8, 3, 8)),
  q('valencia', 'pellegrino99', 'Mauricio Pellegrino', 1971, 'Argentina', ['CB'], 80, 81, 2002, 30, t(9, 3, 7, 8, 2, 7)),
  q('valencia', 'djukic99', 'Miroslav Đukić', 1966, 'Yugoslavia', ['CB'], 79, 79, 2001, 25, t(8, 4, 6, 7, 3, 7)),
  q('valencia', 'carboni99', 'Amedeo Carboni', 1965, 'Italy', ['LB'], 78, 78, 2003, 22, t(8, 4, 6, 9, 3, 8)),
  // Mendieta — the best midfielder in the 2000 CL, then a record move to Lazio in
  // 2001 soured and he fell away sharply. A fragile star (latent 86).
  q('valencia', 'mendieta99', 'Gaizka Mendieta', 1974, 'Spain', ['CM', 'AM'], 84, 86, 2004, 30, t(8, 6, 9, 6, 4, 7), { latentCeiling: 86 }),
  q('valencia', 'albelda99', 'David Albelda', 1977, 'Spain', ['DM'], 76, 84, 2005, 35, t(9, 4, 7, 10, 5, 6)),
  q('valencia', 'kily99', 'Kily González', 1974, 'Argentina', ['LW', 'CM'], 80, 82, 2004, 35, t(7, 6, 7, 6, 6, 7)),
  // Gerard López — chased by Inter/Milan/United at 21, sold to Barça for ~€24m,
  // then injuries and inconsistency stopped him reaching it. Lost talent (87).
  q('valencia', 'gerard99', 'Gerard López', 1979, 'Spain', ['AM', 'CM'], 79, 84, 2003, 70, t(7, 5, 7, 6, 5, 6), { latentCeiling: 87 }),
  q('valencia', 'claudiolopez99', 'Claudio López', 1974, 'Argentina', ['ST', 'LW'], 83, 84, 2003, 40, t(7, 6, 8, 5, 5, 7)),
  q('valencia', 'ilie99', 'Adrian Ilie', 1974, 'Romania', ['ST', 'RW'], 80, 82, 2002, 55, t(6, 7, 7, 5, 6, 6)),
  q('valencia', 'angulo99', 'Miguel Ángel Angulo', 1977, 'Spain', ['RW', 'ST'], 76, 82, 2005, 30, t(8, 4, 6, 9, 4, 7)),
  q('valencia', 'farinos99', 'Javier Farinós', 1978, 'Spain', ['DM', 'CM'], 76, 82, 2002, 40, t(6, 6, 7, 5, 6, 5)),
  q('valencia', 'juansanchez99', 'Juan Sánchez', 1972, 'Spain', ['ST'], 76, 77, 2003, 35, t(7, 4, 6, 8, 4, 7)),
];

/** Deportivo La Coruña, 1999–2000 — "SuperDépor", the shock La Liga champions:
 *  Mauro Silva's screen, Fran and Djalminha's craft, Makaay's goals. Valerón and
 *  Tristán join in 2000. Genuine La-Liga heavyweight of the era. */
export const DEPORTIVO_1999: CuratedSeed[] = [
  q('deportivo', 'songoo99', "Jacques Songo'o", 1964, 'Cameroon', ['GK'], 80, 80, 2001, 25, t(8, 5, 5, 7, 3, 7)),
  q('deportivo', 'molina99', 'José Molina', 1970, 'Spain', ['GK'], 78, 80, 2002, 20, t(8, 5, 6, 6, 3, 7)),
  q('deportivo', 'manuelpablo99', 'Manuel Pablo', 1976, 'Spain', ['RB'], 78, 82, 2004, 70, t(8, 4, 6, 10, 3, 7)),
  q('deportivo', 'romero99', 'Enrique Romero', 1970, 'Spain', ['LB'], 76, 77, 2002, 35, t(7, 4, 5, 7, 4, 7)),
  q('deportivo', 'naybet99', 'Noureddine Naybet', 1970, 'Morocco', ['CB'], 82, 84, 2003, 30, t(8, 5, 7, 7, 4, 7)),
  q('deportivo', 'donato99', 'Donato', 1962, 'Spain', ['CB', 'DM'], 76, 76, 2001, 30, t(9, 4, 5, 8, 2, 7)),
  q('deportivo', 'cesar99', 'César Martín', 1977, 'Spain', ['CB'], 74, 80, 2004, 30, t(7, 4, 6, 7, 4, 7)),
  q('deportivo', 'mauro99', 'Mauro Silva', 1968, 'Brazil', ['DM'], 83, 84, 2002, 25, t(9, 3, 6, 9, 2, 8)),
  q('deportivo', 'flavio99', 'Flávio Conceição', 1974, 'Brazil', ['DM', 'CM'], 81, 84, 2001, 30, t(7, 6, 8, 4, 5, 7)),
  q('deportivo', 'victor99', 'Víctor Sánchez', 1976, 'Spain', ['CM', 'RB'], 77, 80, 2004, 35, t(8, 4, 6, 9, 3, 7)),
  q('deportivo', 'fran99', 'Fran', 1969, 'Spain', ['LW', 'AM'], 81, 82, 2003, 30, t(8, 4, 6, 10, 3, 7)),
  // Djalminha — the mercurial genius who head-butted his coach and torched his own
  // career. A world-class ceiling wrecked by temperament. Lost talent (latent 90).
  q('deportivo', 'djalminha99', 'Djalminha', 1970, 'Brazil', ['AM'], 84, 86, 2003, 40, t(4, 9, 6, 5, 9, 5), { latentCeiling: 90 }),
  q('deportivo', 'makaay99', 'Roy Makaay', 1975, 'Netherlands', ['ST'], 83, 88, 2004, 20, t(9, 5, 8, 6, 3, 8)),
  // Valerón — an elegant playmaker on the cusp of world-class, then serial knee
  // ruptures took his prime. The definitive injury-lost talent (latent 90).
  q('deportivo', 'valeron99', 'Juan Carlos Valerón', 1975, 'Spain', ['AM'], 82, 87, 2005, 55, t(9, 3, 6, 10, 2, 7), { latentCeiling: 90 }),
  // Tristán — exploded to a Pichichi (2002), then fitness and lifestyle undid him.
  q('deportivo', 'tristan99', 'Diego Tristán', 1976, 'Spain', ['ST'], 81, 85, 2005, 45, t(6, 7, 6, 6, 7, 6), { latentCeiling: 89 }),
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
  sporting: SPORTING_1999,
  wigan: WIGAN_1999,
  betis: BETIS_1999,
  valencia: VALENCIA_1999,
  deportivo: DEPORTIVO_1999,
};
// Merge the midfield pool + the broad era pool into the relevant clubs.
for (const [club, seed] of [...MIDFIELD_POOL_1999, ...ERA_1999_POOL]) {
  (MAN_UTD_1999_SQUADS[club] ??= []).push(seed);
}
// The 2009 Madrid-cascade depth + the 2000 supporting cast live at Real Madrid.
for (const seed of [...REAL_MADRID_CASCADE_1999, ...REAL_MADRID_2000]) {
  (MAN_UTD_1999_SQUADS.real_madrid ??= []).push(seed);
}

/** Barcelona, 1999–2000 — Rivaldo's Ballon d'Or side, with Figo still at Camp Nou
 *  (the ledger offers his real 2000 move to Real Madrid) and a teenage Xavi/Puyol. */
export const BARCELONA_1999: CuratedSeed[] = [
  q('barcelona', 'hesp', 'Ruud Hesp', 1965, 'Netherlands', ['GK'], 78, 79, 2001, 25, t(8, 4, 7, 7, 4, 6)),
  q('barcelona', 'reiziger', 'Michael Reiziger', 1973, 'Netherlands', ['RB'], 81, 83, 2004, 25, t(8, 5, 8, 7, 4, 7)),
  q('barcelona', 'fdeboer', 'Frank de Boer', 1970, 'Netherlands', ['CB'], 83, 84, 2003, 25, t(8, 6, 8, 8, 4, 7)),
  q('barcelona', 'abelardo', 'Abelardo', 1970, 'Spain', ['CB'], 81, 82, 2002, 30, t(8, 5, 8, 8, 5, 6)),
  q('barcelona', 'sergi', 'Sergi Barjuan', 1971, 'Spain', ['LB'], 80, 81, 2002, 30, t(8, 5, 8, 9, 4, 7)),
  q('barcelona', 'puyol', 'Carles Puyol', 1978, 'Spain', ['CB', 'RB'], 68, 88, 2005, 20, t(10, 4, 9, 10, 4, 7)),
  q('barcelona', 'cocu', 'Phillip Cocu', 1970, 'Netherlands', ['CM', 'DM'], 83, 84, 2003, 20, t(9, 5, 8, 8, 3, 7)),
  q('barcelona', 'guardiola', 'Pep Guardiola', 1971, 'Spain', ['DM', 'CM'], 84, 85, 2001, 30, t(9, 6, 9, 9, 4, 7)),
  q('barcelona', 'luisenrique', 'Luis Enrique', 1970, 'Spain', ['CM', 'RW'], 84, 85, 2004, 30, t(9, 6, 9, 9, 5, 7)),
  q('barcelona', 'xavi', 'Xavi', 1980, 'Spain', ['CM'], 66, 90, 2005, 15, t(10, 4, 9, 10, 3, 8)),
  q('barcelona', 'zenden', 'Boudewijn Zenden', 1976, 'Netherlands', ['LW', 'LB'], 80, 83, 2002, 25, t(8, 5, 7, 6, 4, 8)),
  q('barcelona', 'figo', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 88, 90, 2004, 20, t(8, 7, 9, 6, 4, 8)),
  q('barcelona', 'rivaldo', 'Rivaldo', 1972, 'Brazil', ['AM', 'ST'], 90, 91, 2004, 25, t(8, 7, 9, 7, 4, 7)),
  q('barcelona', 'kluivert', 'Patrick Kluivert', 1976, 'Netherlands', ['ST'], 85, 88, 2004, 30, t(6, 7, 8, 6, 6, 7)),
  q('barcelona', 'dani', 'Dani', 1974, 'Portugal', ['ST'], 76, 80, 2002, 35, t(6, 6, 7, 6, 6, 7)),
  q('barcelona', 'gabri', 'Gabri', 1979, 'Spain', ['CM'], 66, 80, 2004, 25, t(8, 4, 7, 8, 4, 7)),
];

// Barcelona reuses the full 1999 curated world (so the real ledger — Figo to
// Madrid, Anelka/Overmars, the galáctico cascade — all fires) plus a curated Barça.
const BARCELONA_1999_SQUADS: Record<string, CuratedSeed[]> = {
  ...MAN_UTD_1999_SQUADS,
  barcelona: BARCELONA_1999,
};

// The era's curated real players are the same whichever club you play — only
// the playerClub differs — so the galáctico-era Madrid start reuses the map.
export const CURATED_SQUADS: Record<string, Record<string, CuratedSeed[]>> = {
  'man-utd-1999': MAN_UTD_1999_SQUADS,
  'real-madrid-2000': MAN_UTD_1999_SQUADS,
  'barcelona-1999': BARCELONA_1999_SQUADS,
  'inter-1998': INTER_1998_SQUADS,
  'man-utd-2013': MAN_UTD_2013_SQUADS,
  'arsenal-2004': ARSENAL_2004_SQUADS,
  'liverpool-2001': LIVERPOOL_2001_SQUADS,
};
