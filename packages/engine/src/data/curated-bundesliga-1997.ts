/**
 * Curated real players — 1997 Bundesliga "Kings of Europe" pack (Germany).
 *
 * The vertical slice for BOTH late-90s German starts, a season apart in the same
 * shared world:
 *  • "Borussia Dortmund — 1997: Kings of Europe" — the reigning European champions
 *    (Riedle's brace and Ricken's chip beat Juventus in Munich, May 1997). Sammer is
 *    the Ballon d'Or libero, Möller and Chapuisat the craft — but the side is ageing
 *    and the real story is a slow fade. Defend the throne; don't let it slip.
 *  • "Bayern München — 1998: The Treble Denied" — Kahn, Matthäus, Effenberg and
 *    Élber: ninety seconds from the 1999 European Cup before Solskjær and Sheringham
 *    turned Camp Nou. The other bench that night is the user's man-utd-1999. This
 *    time, hold on.
 *
 * The continental elite (Real, Barça, Juventus, Milan, Inter, United, Liverpool,
 * Arsenal, Chelsea) are reused from the 1996 pack — near-identical a season on — so
 * every real European Cup of 1998-2013 is anchored; only the two German giants and a
 * light Bundesliga context (Leverkusen, Kaiserslautern, Stuttgart) are authored
 * fresh. Ability/potential/personality are HIDDEN designer estimates (§7); clubs,
 * birth years, positions and contracts are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { EUROPE_LATE90S_SQUADS } from './curated-europe-late90s.js';
import {
  MANUTD_1996, ARSENAL_1996, CHELSEA_1996, LIVERPOOL_1996,
  REAL_1996, BARCA_1996, JUVENTUS_1996, MILAN_1996, INTER_1996,
} from './curated-1996.js';

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

// ── Borussia Dortmund, 1996–97 (Hitzfeld; the reigning European champions, ageing) ─
export const DORTMUND_1997: CuratedSeed[] = [
  q('dortmund', 'klos_97', 'Stefan Klos', 1971, 'Germany', ['GK'], 80, 82, 2001, 20, t(8, 6, 8, 8, 5, 7)),
  q('dortmund', 'reuter_97', 'Stefan Reuter', 1966, 'Germany', ['RB', 'RW'], 80, 80, 2000, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
  q('dortmund', 'kohler_97', 'Jürgen Kohler', 1965, 'Germany', ['CB'], 83, 83, 2000, 25, t(9, 6, 8, 9, 5, 6), { loyalty: 90 }),
  q('dortmund', 'sammer_97', 'Matthias Sammer', 1967, 'Germany', ['CB', 'DM'], 86, 86, 2000, 35, t(9, 7, 9, 9, 5, 7), { loyalty: 90 }),
  q('dortmund', 'feiersinger_97', 'Wolfgang Feiersinger', 1965, 'Austria', ['CB'], 78, 78, 1999, 25, t(8, 5, 7, 8, 5, 7)),
  q('dortmund', 'heinrich_97', 'Jörg Heinrich', 1969, 'Germany', ['LB', 'LW'], 80, 82, 2001, 25, t(8, 6, 8, 8, 5, 7)),
  q('dortmund', 'lambert_97', 'Paul Lambert', 1969, 'Scotland', ['DM', 'CM'], 79, 80, 1999, 20, t(9, 5, 8, 8, 4, 7)),
  q('dortmund', 'zorc_97', 'Michael Zorc', 1962, 'Germany', ['CM', 'AM'], 80, 80, 1999, 20, t(9, 6, 8, 10, 4, 7), { loyalty: 97 }),
  q('dortmund', 'freund_97', 'Steffen Freund', 1970, 'Germany', ['DM'], 78, 79, 2000, 25, t(8, 6, 8, 8, 6, 7)),
  q('dortmund', 'moller_97', 'Andreas Möller', 1967, 'Germany', ['AM'], 84, 84, 2000, 25, t(7, 7, 8, 7, 6, 7)),
  q('dortmund', 'ricken_97', 'Lars Ricken', 1976, 'Germany', ['AM', 'ST'], 79, 87, 2002, 25, t(8, 6, 8, 9, 5, 8)),
  q('dortmund', 'herrlich_97', 'Heiko Herrlich', 1971, 'Germany', ['ST', 'AM'], 79, 81, 2000, 25, t(8, 6, 8, 8, 5, 7)),
  q('dortmund', 'riedle_97', 'Karl-Heinz Riedle', 1965, 'Germany', ['ST'], 81, 81, 1998, 25, t(9, 6, 8, 8, 4, 7)),
  q('dortmund', 'chapuisat_97', 'Stéphane Chapuisat', 1969, 'Switzerland', ['ST', 'LW'], 83, 84, 2000, 30, t(8, 6, 8, 8, 5, 8)),
  q('dortmund', 'tretschok_97', 'René Tretschok', 1968, 'Germany', ['CM'], 76, 77, 1999, 25, t(8, 5, 7, 8, 5, 7)),
];

// ── Bayern München, 1998–99 (Hitzfeld; ninety seconds from the treble) ────────
export const BAYERN_1998: CuratedSeed[] = [
  q('bayern', 'kahn_98', 'Oliver Kahn', 1969, 'Germany', ['GK'], 88, 90, 2002, 15, t(9, 8, 10, 9, 6, 7), { loyalty: 92 }),
  q('bayern', 'babbel_98', 'Markus Babbel', 1972, 'Germany', ['RB', 'CB'], 82, 84, 2000, 20, t(9, 6, 8, 8, 5, 7)),
  q('bayern', 'helmer_98', 'Thomas Helmer', 1965, 'Germany', ['CB'], 80, 80, 1999, 25, t(8, 6, 8, 8, 5, 6)),
  q('bayern', 'kuffour_98', 'Samuel Kuffour', 1976, 'Ghana', ['CB'], 81, 85, 2002, 25, t(8, 6, 8, 8, 6, 7)),
  q('bayern', 'linke_98', 'Thomas Linke', 1969, 'Germany', ['CB'], 79, 81, 2002, 20, t(9, 5, 8, 9, 4, 7)),
  q('bayern', 'lizarazu_98', 'Bixente Lizarazu', 1969, 'France', ['LB'], 84, 85, 2002, 20, t(9, 6, 8, 8, 5, 8)),
  q('bayern', 'tarnat_98', 'Michael Tarnat', 1969, 'Germany', ['LB', 'LW'], 79, 80, 2001, 20, t(8, 5, 8, 8, 5, 7)),
  q('bayern', 'jeremies_98', 'Jens Jeremies', 1974, 'Germany', ['DM', 'CM'], 81, 83, 2002, 25, t(9, 6, 8, 8, 6, 7)),
  q('bayern', 'effenberg_98', 'Stefan Effenberg', 1968, 'Germany', ['CM', 'AM'], 85, 85, 2002, 20, t(6, 8, 9, 7, 7, 7)),
  q('bayern', 'matthaus_98', 'Lothar Matthäus', 1961, 'Germany', ['DM', 'CB'], 82, 82, 2000, 25, t(9, 8, 9, 8, 6, 7), { loyalty: 88 }),
  q('bayern', 'scholl_98', 'Mehmet Scholl', 1970, 'Germany', ['AM', 'RW'], 83, 84, 2002, 30, t(7, 6, 8, 9, 5, 8), { loyalty: 90 }),
  q('bayern', 'basler_98', 'Mario Basler', 1968, 'Germany', ['RW', 'AM'], 82, 83, 2000, 25, t(4, 8, 7, 6, 8, 7)),
  q('bayern', 'elber_98', 'Giovane Élber', 1972, 'Brazil', ['ST'], 83, 85, 2002, 25, t(8, 6, 9, 8, 5, 8)),
  q('bayern', 'jancker_98', 'Carsten Jancker', 1974, 'Germany', ['ST'], 80, 82, 2002, 25, t(8, 6, 8, 8, 5, 7)),
  q('bayern', 'salihamidzic_98', 'Hasan Salihamidžić', 1977, 'Bosnia', ['RW', 'CM'], 78, 83, 2002, 20, t(9, 6, 8, 8, 5, 8)),
];

// ── Bundesliga context (real, lighter) ────────────────────────────────────────
export const LEVERKUSEN_1997: CuratedSeed[] = [
  q('leverkusen', 'butt_97', 'Hans-Jörg Butt', 1974, 'Germany', ['GK'], 79, 82, 2002, 20, t(8, 6, 8, 8, 5, 7)),
  q('leverkusen', 'nowotny_97', 'Jens Nowotny', 1974, 'Germany', ['CB'], 82, 85, 2002, 25, t(9, 5, 8, 8, 5, 7)),
  q('leverkusen', 'ramelow_97', 'Carsten Ramelow', 1974, 'Germany', ['DM', 'CB'], 79, 82, 2002, 20, t(9, 5, 8, 8, 5, 7)),
  q('leverkusen', 'ze_roberto_97', 'Zé Roberto', 1974, 'Brazil', ['LW', 'CM'], 82, 85, 2001, 20, t(8, 6, 8, 7, 4, 8)),
  q('leverkusen', 'kirsten_97', 'Ulf Kirsten', 1965, 'Germany', ['ST'], 82, 82, 2000, 25, t(9, 6, 8, 9, 5, 7)),
  q('leverkusen', 'neuville_97', 'Oliver Neuville', 1973, 'Germany', ['ST'], 79, 82, 2002, 25, t(8, 6, 8, 8, 5, 7)),
  q('leverkusen', 'schneider_97', 'Bernd Schneider', 1973, 'Germany', ['RW', 'AM'], 80, 84, 2002, 20, t(8, 6, 8, 8, 4, 8)),
];
export const KAISERSLAUTERN_1997: CuratedSeed[] = [
  q('kaiserslautern', 'reinke_97', 'Andreas Reinke', 1960, 'Germany', ['GK'], 77, 77, 1999, 20, t(8, 5, 7, 8, 5, 6)),
  q('kaiserslautern', 'kadlec_97', 'Miroslav Kadlec', 1964, 'Czech Republic', ['CB'], 79, 79, 1999, 25, t(9, 5, 8, 8, 4, 6)),
  q('kaiserslautern', 'koch_97', 'Harry Koch', 1969, 'Germany', ['CB'], 76, 77, 2001, 25, t(8, 5, 7, 8, 5, 7)),
  q('kaiserslautern', 'sforza_97', 'Ciriaco Sforza', 1970, 'Switzerland', ['DM', 'CM'], 81, 82, 2001, 20, t(8, 6, 8, 8, 5, 7)),
  q('kaiserslautern', 'ballack_97', 'Michael Ballack', 1976, 'Germany', ['CM', 'AM'], 68, 90, 2002, 20, t(9, 6, 9, 8, 4, 8)),
  q('kaiserslautern', 'marschall_97', 'Olaf Marschall', 1966, 'Germany', ['ST'], 80, 80, 2000, 25, t(8, 6, 8, 8, 5, 7)),
  q('kaiserslautern', 'wagner_97', 'Martin Wagner', 1968, 'Germany', ['LB', 'LW'], 76, 77, 2000, 20, t(8, 5, 7, 8, 5, 7)),
];
export const STUTTGART_1997: CuratedSeed[] = [
  q('stuttgart', 'wohlfahrt_97', 'Marc Ziegler', 1976, 'Germany', ['GK'], 74, 78, 2002, 20, t(8, 5, 7, 8, 5, 7)),
  q('stuttgart', 'yakin_97', 'Murat Yakin', 1974, 'Switzerland', ['CB', 'DM'], 77, 79, 2001, 20, t(8, 5, 7, 8, 5, 7)),
  q('stuttgart', 'poschner_97', 'Gerhard Poschner', 1969, 'Germany', ['DM', 'CM'], 76, 77, 2000, 20, t(8, 5, 7, 8, 5, 7)),
  q('stuttgart', 'balakov_97', 'Krassimir Balakov', 1966, 'Bulgaria', ['AM'], 83, 83, 2000, 25, t(7, 7, 8, 7, 5, 8)),
  q('stuttgart', 'bobic_97', 'Fredi Bobic', 1971, 'Germany', ['ST'], 80, 82, 2000, 25, t(8, 6, 8, 8, 5, 7)),
  q('stuttgart', 'kirovski_97', 'Jovan Kirovski', 1976, 'United States', ['AM', 'ST'], 74, 80, 2001, 20, t(8, 6, 8, 7, 5, 8)),
  q('stuttgart', 'schneider_st97', 'Thomas Schneider', 1972, 'Germany', ['RB', 'CM'], 75, 77, 2001, 20, t(8, 5, 7, 8, 5, 7)),
];

/** The full late-90s German curated universe (shared by the Dortmund and Bayern
 *  starts): the two German giants + a light Bundesliga context, and the full
 *  continental elite reused from the 1996 pack so every real European Cup of
 *  1998-2013 is anchored to a side that exists. */
export const BUNDESLIGA_1997_SQUADS: Record<string, CuratedSeed[]> = {
  dortmund: DORTMUND_1997,
  bayern: BAYERN_1998,
  leverkusen: LEVERKUSEN_1997,
  kaiserslautern: KAISERSLAUTERN_1997,
  stuttgart: STUTTGART_1997,
  real_madrid: REAL_1996,
  barcelona: BARCA_1996,
  juventus: JUVENTUS_1996,
  milan: MILAN_1996,
  inter: INTER_1996,
  man_utd: MANUTD_1996,
  liverpool: LIVERPOOL_1996,
  arsenal: ARSENAL_1996,
  chelsea: CHELSEA_1996,
};

// European selling clubs (M12A rollout) — the late-90s foreign talent pipeline
// (shared with inter-1998). All whole new clubs merged into the Bundesliga worlds.
for (const [club, seeds] of Object.entries(EUROPE_LATE90S_SQUADS)) {
  BUNDESLIGA_1997_SQUADS[club] = [...(BUNDESLIGA_1997_SQUADS[club] ?? []), ...seeds];
}
