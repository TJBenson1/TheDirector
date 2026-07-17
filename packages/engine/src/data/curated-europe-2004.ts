/**
 * European selling clubs — 2003-04 (M12A rollout, the talent pipeline).
 *
 * The real non-Italian, non-Spanish clubs that fed the big leagues in the
 * Mourinho-Porto era: Ajax (Van der Vaart, a teenage Sneijder), PSV (Park, Van
 * Bommel), the CL-winning Porto and finalist Monaco stripped of the stars already
 * curated elsewhere, Lyon's dynasty (Essien, Malouda, Abidal), Werder's champions
 * and Leverkusen's Berbatov. Shared context for the inter-2004 (Serie A) and
 * barcelona-2003 (La Liga) worlds, whose own domestic leagues are modelled.
 * Ability/potential/personality are HIDDEN designer estimates (§7); clubs, birth
 * years, positions and contracts are real.
 *
 * Names already curated in the 2003-04 packs (Deco, Carvalho, Costinha, Maniche,
 * Quaresma, Robben, Kežman, Makélélé, Ibrahimović, Larsson…) are omitted.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';

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

// ── Ajax, 2003-04 (Van der Vaart the captain, a teenage Sneijder emerging) ──────
const AJAX_2004: CuratedSeed[] = [
  q('ajax', 'van_der_vaart_04', 'Rafael van der Vaart', 1983, 'Netherlands', ['AM'], 82, 87, 2006, 20, t(8, 6, 9, 7, 5, 8)),
  q('ajax', 'sneijder_04', 'Wesley Sneijder', 1984, 'Netherlands', ['AM', 'CM'], 76, 89, 2007, 20, t(7, 7, 9, 7, 6, 8)),
  q('ajax', 'heitinga_04', 'John Heitinga', 1983, 'Netherlands', ['CB', 'DM'], 78, 84, 2007, 20, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'trabelsi_04', 'Hatem Trabelsi', 1977, 'Tunisia', ['RB'], 80, 82, 2006, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'maxwell_04', 'Maxwell', 1981, 'Brazil', ['LB'], 78, 84, 2007, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'galasek_04', 'Tomáš Galásek', 1973, 'Czechia', ['DM', 'CM'], 77, 79, 2006, 20, t(9, 5, 8, 8, 4, 8)),
  q('ajax', 'pienaar_04', 'Steven Pienaar', 1982, 'South Africa', ['AM', 'LW'], 74, 83, 2007, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── PSV, 2003-04 (Park & Van Bommel; champions the next spring) ─────────────────
const PSV_2004: CuratedSeed[] = [
  q('psv', 'van_bommel_04', 'Mark van Bommel', 1977, 'Netherlands', ['CM', 'DM'], 82, 85, 2006, 20, t(8, 7, 9, 7, 6, 8)),
  q('psv', 'park_04', 'Park Ji-sung', 1981, 'South Korea', ['RW', 'CM'], 79, 84, 2006, 15, t(9, 5, 9, 8, 4, 8)),
  q('psv', 'bouma_04', 'Wilfred Bouma', 1978, 'Netherlands', ['LB', 'CB'], 79, 82, 2006, 20, t(9, 5, 8, 8, 5, 8)),
  q('psv', 'vogel_04', 'Johann Vogel', 1977, 'Switzerland', ['DM', 'CM'], 79, 81, 2005, 20, t(9, 5, 8, 8, 4, 8)),
  q('psv', 'lee_yp_04', 'Lee Young-pyo', 1977, 'South Korea', ['LB'], 77, 80, 2006, 15, t(9, 5, 8, 8, 4, 8)),
  q('psv', 'beasley_04', 'DaMarcus Beasley', 1982, 'United States', ['LW'], 76, 82, 2007, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── FC Porto, 2003-04 (the Mourinho miracle, minus the already-curated stars) ───
const PORTO_2004: CuratedSeed[] = [
  q('porto', 'baia_04', 'Vítor Baía', 1969, 'Portugal', ['GK'], 80, 81, 2006, 20, t(9, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('porto', 'pedro_emanuel_04', 'Pedro Emanuel', 1975, 'Portugal', ['CB'], 77, 79, 2006, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('porto', 'jorge_costa_04', 'Jorge Costa', 1971, 'Portugal', ['CB'], 79, 80, 2005, 20, t(9, 6, 8, 9, 6, 7), { loyalty: 88 }),
  q('porto', 'nuno_valente_04', 'Nuno Valente', 1974, 'Portugal', ['LB'], 77, 79, 2006, 20, t(8, 5, 8, 8, 5, 8)),
  q('porto', 'derlei_04', 'Derlei', 1975, 'Brazil', ['ST'], 79, 81, 2006, 20, t(8, 6, 8, 7, 5, 8)),
  q('porto', 'mccarthy_04', 'Benni McCarthy', 1977, 'South Africa', ['ST'], 79, 82, 2006, 20, t(6, 7, 8, 6, 6, 8)),
  q('porto', 'alenichev_04', 'Dmitri Alenichev', 1972, 'Russia', ['AM', 'LW'], 78, 79, 2005, 20, t(8, 6, 8, 7, 5, 8)),
];

// ── AS Monaco, 2003-04 (the CL finalists; a teenage Evra & Adebayor) ───────────
const MONACO_2004: CuratedSeed[] = [
  q('monaco', 'morientes_04', 'Fernando Morientes', 1976, 'Spain', ['ST'], 83, 85, 2006, 20, t(8, 6, 8, 7, 5, 8)),
  q('monaco', 'nonda_04', 'Shabani Nonda', 1977, 'DR Congo', ['ST'], 79, 82, 2006, 25, t(7, 6, 8, 7, 6, 8)),
  q('monaco', 'rothen_04', 'Jérôme Rothen', 1978, 'France', ['LW', 'LB'], 80, 82, 2006, 20, t(7, 6, 8, 7, 6, 8)),
  q('monaco', 'prso_04', 'Dado Pršo', 1974, 'Croatia', ['ST'], 78, 80, 2005, 20, t(8, 6, 8, 7, 5, 8)),
  q('monaco', 'evra_04', 'Patrice Evra', 1981, 'France', ['LB'], 78, 86, 2007, 20, t(8, 6, 9, 8, 5, 8)),
  q('monaco', 'adebayor_04', 'Emmanuel Adebayor', 1984, 'Togo', ['ST'], 74, 85, 2007, 20, t(6, 7, 8, 6, 6, 8)),
  q('monaco', 'zikos_04', 'Akis Zikos', 1974, 'Greece', ['DM', 'CM'], 76, 78, 2005, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── Olympique Lyonnais, 2003-04 (the dynasty: Essien, Malouda, Abidal) ─────────
const LYON_2004: CuratedSeed[] = [
  q('lyon', 'coupet_04', 'Grégory Coupet', 1972, 'France', ['GK'], 83, 85, 2007, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('lyon', 'essien_04', 'Michael Essien', 1982, 'Ghana', ['DM', 'CM'], 82, 88, 2007, 20, t(8, 6, 9, 7, 5, 8)),
  q('lyon', 'juninho_04', 'Juninho Pernambucano', 1975, 'Brazil', ['CM', 'AM'], 83, 85, 2007, 20, t(9, 6, 8, 8, 5, 8)),
  q('lyon', 'malouda_04', 'Florent Malouda', 1980, 'France', ['LW', 'AM'], 80, 85, 2007, 20, t(8, 6, 8, 7, 5, 8)),
  q('lyon', 'abidal_04', 'Éric Abidal', 1979, 'France', ['LB', 'CB'], 80, 85, 2007, 20, t(9, 5, 8, 8, 5, 8)),
  q('lyon', 'diarra_m04', 'Mahamadou Diarra', 1981, 'Mali', ['DM', 'CM'], 81, 85, 2007, 20, t(8, 6, 8, 7, 5, 8)),
  q('lyon', 'luyindula_04', 'Péguy Luyindula', 1979, 'France', ['ST'], 78, 81, 2006, 20, t(7, 6, 8, 7, 5, 8)),
  q('lyon', 'govou_04', 'Sidney Govou', 1979, 'France', ['RW', 'ST'], 78, 82, 2007, 20, t(7, 6, 8, 8, 5, 8)),
];

// ── Werder Bremen, 2003-04 (the double winners: Ailton, Micoud) ────────────────
const WERDER_2004: CuratedSeed[] = [
  q('werder', 'ailton_04', 'Ailton', 1973, 'Brazil', ['ST'], 80, 81, 2005, 20, t(6, 7, 8, 6, 6, 8)),
  q('werder', 'micoud_04', 'Johan Micoud', 1973, 'France', ['AM'], 81, 83, 2006, 20, t(8, 6, 8, 7, 5, 8)),
  q('werder', 'klasnic_04', 'Ivan Klasnić', 1980, 'Croatia', ['ST'], 77, 82, 2007, 20, t(7, 6, 8, 7, 5, 8)),
  q('werder', 'baumann_04', 'Frank Baumann', 1975, 'Germany', ['DM', 'CB'], 78, 80, 2006, 20, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('werder', 'borowski_04', 'Tim Borowski', 1980, 'Germany', ['CM', 'AM'], 78, 83, 2007, 20, t(8, 5, 8, 8, 5, 8)),
  q('werder', 'ismael_04', 'Valérien Ismaël', 1975, 'France', ['CB'], 77, 79, 2006, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Bayer Leverkusen, 2003-04 (Berbatov's rise) ────────────────────────────────
const LEVERKUSEN_2004: CuratedSeed[] = [
  q('leverkusen', 'berbatov_04', 'Dimitar Berbatov', 1981, 'Bulgaria', ['ST'], 80, 87, 2006, 20, t(7, 7, 8, 6, 5, 8)),
  q('leverkusen', 'schneider_04', 'Bernd Schneider', 1973, 'Germany', ['RW', 'AM'], 81, 82, 2006, 20, t(9, 5, 8, 8, 4, 8)),
  q('leverkusen', 'juan_04', 'Juan', 1979, 'Brazil', ['CB'], 80, 83, 2007, 20, t(9, 5, 8, 8, 5, 8)),
  q('leverkusen', 'placente_04', 'Diego Placente', 1977, 'Argentina', ['LB'], 77, 79, 2006, 20, t(8, 5, 8, 7, 5, 8)),
  q('leverkusen', 'ramelow_04', 'Carsten Ramelow', 1974, 'Germany', ['DM', 'CB'], 77, 79, 2006, 20, t(9, 5, 8, 8, 4, 8)),
  q('leverkusen', 'franca_04', 'França', 1976, 'Brazil', ['ST'], 76, 78, 2005, 25, t(7, 6, 8, 7, 5, 8)),
];

// ── Celtic, 2003-04 (O'Neill's side, minus the departing Larsson) ──────────────
const CELTIC_2004: CuratedSeed[] = [
  q('celtic', 'petrov_s_04', 'Stiliyan Petrov', 1979, 'Bulgaria', ['CM', 'DM'], 80, 84, 2007, 20, t(8, 5, 8, 8, 5, 8)),
  q('celtic', 'hartson_04', 'John Hartson', 1975, 'Wales', ['ST'], 79, 80, 2006, 25, t(7, 6, 8, 7, 6, 8)),
  q('celtic', 'sutton_04', 'Chris Sutton', 1973, 'England', ['ST', 'AM'], 79, 80, 2006, 20, t(8, 6, 8, 8, 5, 8)),
  q('celtic', 'balde_04', 'Bobo Baldé', 1975, 'Guinea', ['CB'], 78, 80, 2007, 20, t(8, 5, 8, 8, 5, 7)),
  q('celtic', 'thompson_04', 'Alan Thompson', 1973, 'England', ['LW', 'LB'], 76, 78, 2006, 20, t(7, 5, 8, 8, 5, 8)),
  q('celtic', 'lennon_04', 'Neil Lennon', 1971, 'Northern Ireland', ['DM', 'CM'], 78, 79, 2006, 20, t(8, 6, 8, 9, 6, 7)),
];

/** The non-Italian, non-Spanish European selling clubs of the 2003-04 world,
 *  shared context for the inter-2004 and barcelona-2003 universes. Merged by
 *  CONCATENATION so any club already curated in a pack is augmented. */
export const EUROPE_2004_SQUADS: Record<string, CuratedSeed[]> = {
  ajax: AJAX_2004,
  psv: PSV_2004,
  porto: PORTO_2004,
  monaco: MONACO_2004,
  lyon: LYON_2004,
  werder: WERDER_2004,
  leverkusen: LEVERKUSEN_2004,
  celtic: CELTIC_2004,
};
