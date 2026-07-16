/**
 * Curated real players — 2009 Bundesliga "Van Gaal Reset" pack (Germany).
 *
 * The vertical slice for "Bayern München — 2009: Van Gaal Reset". Louis van Gaal
 * has just arrived to rebuild: Robben and Gómez are signed, a nineteen-year-old
 * Thomas Müller and Holger Badstuber break through, Schweinsteiger is remade as a
 * midfielder. Reality: the double, a lost Champions League final to Inter, and the
 * foundation of the dynasty — but Klopp's young Dortmund are about to take the next
 * two titles. Fend off the insurgency, then finish the job in Europe.
 *
 * The elite of Europe and the Bundesliga context are reused from the 2010 pack (a
 * one-year offset), so every real European Cup of 2010-2025 is anchored. Only the
 * two German sides are authored fresh here. Ability/potential/personality are
 * HIDDEN designer estimates (§7); clubs, birth years, positions and contracts are
 * real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import {
  BARCELONA_B10, REAL_MADRID_B10, MANUTD_B10, CHELSEA_B10, MANCITY_B10,
  LIVERPOOL_B10, INTER_B10, JUVENTUS_B10,
  SCHALKE_2010, WERDER_2010, LEVERKUSEN_2010, WOLFSBURG_2010, HAMBURG_2010,
} from './curated-bundesliga-2010.js';

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

// ── Bayern München, 2009–10 (van Gaal; the reset that built the dynasty) ──────
export const BAYERN_2009: CuratedSeed[] = [
  q('bayern', 'butt_09', 'Hans-Jörg Butt', 1974, 'Germany', ['GK'], 80, 80, 2012, 20, t(8, 6, 7, 8, 5, 6)),
  q('bayern', 'rensing', 'Michael Rensing', 1984, 'Germany', ['GK'], 76, 79, 2011, 20, t(8, 5, 7, 8, 5, 7)),
  q('bayern', 'lahm_09', 'Philipp Lahm', 1983, 'Germany', ['RB', 'LB'], 86, 88, 2016, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 95 }),
  q('bayern', 'van_buyten_09', 'Daniel Van Buyten', 1978, 'Belgium', ['CB'], 82, 82, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('bayern', 'demichelis', 'Martín Demichelis', 1980, 'Argentina', ['CB'], 81, 82, 2012, 20, t(8, 6, 8, 7, 6, 7)),
  q('bayern', 'badstuber_09', 'Holger Badstuber', 1989, 'Germany', ['CB', 'LB'], 76, 86, 2014, 25, t(9, 5, 8, 9, 5, 7)),
  q('bayern', 'lell', 'Christian Lell', 1984, 'Germany', ['RB'], 74, 76, 2011, 20, t(7, 5, 7, 7, 5, 7)),
  q('bayern', 'contento_09', 'Diego Contento', 1990, 'Germany', ['LB'], 72, 79, 2013, 20, t(8, 5, 7, 8, 5, 7)),
  q('bayern', 'schweinsteiger_09', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'RW'], 84, 88, 2014, 20, t(9, 6, 9, 9, 5, 8), { loyalty: 92 }),
  q('bayern', 'van_bommel_09', 'Mark van Bommel', 1977, 'Netherlands', ['DM', 'CM'], 84, 84, 2011, 20, t(8, 7, 8, 7, 6, 7)),
  q('bayern', 'tymoshchuk', 'Anatoliy Tymoshchuk', 1979, 'Ukraine', ['DM', 'CB'], 81, 82, 2013, 20, t(9, 5, 8, 8, 5, 7)),
  q('bayern', 'altintop_09', 'Hamit Altıntop', 1982, 'Turkey', ['RW', 'CM'], 80, 82, 2011, 20, t(8, 5, 8, 7, 5, 7)),
  q('bayern', 'robben_09', 'Arjen Robben', 1984, 'Netherlands', ['RW', 'LW'], 87, 89, 2013, 30, t(8, 7, 9, 8, 5, 8)),
  q('bayern', 'ribery_09', 'Franck Ribéry', 1983, 'France', ['LW', 'AM'], 87, 88, 2013, 30, t(8, 7, 9, 8, 6, 8)),
  q('bayern', 'muller_09', 'Thomas Müller', 1989, 'Germany', ['AM', 'RW', 'ST'], 78, 88, 2015, 15, t(9, 6, 9, 10, 4, 8), { loyalty: 94 }),
  q('bayern', 'kroos_09', 'Toni Kroos', 1990, 'Germany', ['CM', 'AM'], 76, 90, 2014, 15, t(10, 5, 9, 8, 4, 8)),
  q('bayern', 'pranjic_09', 'Danijel Pranjić', 1981, 'Croatia', ['LB', 'LW'], 77, 78, 2012, 20, t(8, 5, 7, 7, 5, 7)),
  q('bayern', 'gomez_09', 'Mario Gómez', 1985, 'Germany', ['ST'], 84, 86, 2014, 20, t(8, 6, 9, 8, 5, 7)),
  q('bayern', 'klose_09', 'Miroslav Klose', 1978, 'Germany', ['ST'], 82, 82, 2011, 20, t(9, 5, 8, 8, 4, 7)),
  q('bayern', 'olic_09', 'Ivica Olić', 1979, 'Croatia', ['ST', 'LW'], 81, 82, 2012, 20, t(9, 6, 8, 8, 5, 8)),
];

// ── Borussia Dortmund, 2009–10 (Klopp; the young side before the rise) ────────
export const DORTMUND_2009: CuratedSeed[] = [
  q('dortmund', 'weidenfeller_09', 'Roman Weidenfeller', 1980, 'Germany', ['GK'], 81, 83, 2014, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 92 }),
  q('dortmund', 'owomoyela', 'Patrick Owomoyela', 1979, 'Germany', ['RB'], 76, 77, 2012, 20, t(8, 5, 7, 8, 5, 7)),
  q('dortmund', 'subotic_09', 'Neven Subotić', 1988, 'Serbia', ['CB'], 81, 86, 2015, 20, t(9, 6, 8, 9, 5, 7)),
  q('dortmund', 'hummels_09', 'Mats Hummels', 1988, 'Germany', ['CB'], 80, 90, 2015, 20, t(9, 6, 9, 8, 5, 8)),
  q('dortmund', 'schmelzer_09', 'Marcel Schmelzer', 1988, 'Germany', ['LB'], 77, 84, 2015, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 92 }),
  q('dortmund', 'santana_09', 'Felipe Santana', 1986, 'Brazil', ['CB'], 77, 80, 2014, 20, t(8, 5, 8, 8, 5, 7)),
  q('dortmund', 'kehl_09', 'Sebastian Kehl', 1980, 'Germany', ['DM', 'CM'], 80, 81, 2013, 20, t(9, 5, 8, 10, 5, 7), { loyalty: 92 }),
  q('dortmund', 'sahin_09', 'Nuri Şahin', 1988, 'Turkey', ['CM', 'DM'], 81, 87, 2013, 25, t(8, 6, 9, 8, 5, 8)),
  q('dortmund', 'kuba_09', 'Jakub Błaszczykowski', 1985, 'Poland', ['RW'], 80, 84, 2015, 25, t(9, 6, 8, 9, 5, 8)),
  q('dortmund', 'grosskreutz_09', 'Kevin Großkreutz', 1988, 'Germany', ['LW', 'RB'], 76, 82, 2015, 20, t(8, 6, 8, 9, 6, 7)),
  q('dortmund', 'tinga_09', 'Tinga', 1978, 'Brazil', ['CM', 'DM'], 78, 79, 2012, 20, t(8, 5, 7, 7, 5, 7)),
  q('dortmund', 'gotze_09', 'Mario Götze', 1992, 'Germany', ['AM', 'ST'], 72, 91, 2014, 25, t(8, 7, 9, 8, 5, 8)),
  q('dortmund', 'barrios_09', 'Lucas Barrios', 1984, 'Paraguay', ['ST'], 80, 83, 2013, 25, t(8, 6, 8, 7, 5, 7)),
  q('dortmund', 'zidan', 'Mohamed Zidan', 1981, 'Egypt', ['ST', 'AM'], 77, 79, 2012, 20, t(6, 6, 8, 7, 6, 7)),
  q('dortmund', 'valdez', 'Nelson Valdez', 1983, 'Paraguay', ['ST'], 76, 78, 2010, 20, t(7, 6, 8, 7, 5, 7)),
];

/** The full Bayern-2009 curated universe: van Gaal's fresh Bayern and Klopp's
 *  pre-rise Dortmund, plus the elite of Europe and Bundesliga context reused from
 *  the 2010 pack so every real European Cup of 2010-2025 is anchored. */
export const BAYERN_2009_SQUADS: Record<string, CuratedSeed[]> = {
  bayern: BAYERN_2009,
  dortmund: DORTMUND_2009,
  barcelona: BARCELONA_B10,
  real_madrid: REAL_MADRID_B10,
  man_utd: MANUTD_B10,
  chelsea: CHELSEA_B10,
  man_city: MANCITY_B10,
  liverpool: LIVERPOOL_B10,
  inter: INTER_B10,
  juventus: JUVENTUS_B10,
  schalke: SCHALKE_2010,
  werder: WERDER_2010,
  leverkusen: LEVERKUSEN_2010,
  wolfsburg: WOLFSBURG_2010,
  hamburg: HAMBURG_2010,
};
