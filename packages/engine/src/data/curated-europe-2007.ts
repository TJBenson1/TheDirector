/**
 * European selling clubs — 2006-07 (M12A rollout, the talent pipeline).
 *
 * The real non-Italian, non-Spanish clubs that fed the big leagues in the
 * mid-2000s: Lyon's dynasty (a teenage Benzema, Juninho), Hamburg (Van der Vaart,
 * a young Kompany), Werder (Diego), Porto and Benfica, Ajax (Huntelaar), Celtic
 * (Nakamura), Marseille. Shared context for the three mid-2000s worlds —
 * milan-2007 and juventus-2006 (Serie A) and real-madrid-2006 (La Liga) — whose
 * own domestic leagues are modelled. Only players STABLE across 2006-07 are
 * included, so the one set is faithful to all three start dates. Ability/potential
 * /personality are HIDDEN designer estimates (§7); clubs, birth years, positions
 * and contracts are real.
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

// ── Olympique Lyonnais, 2006-07 (the dynasty at its height; a teenage Benzema) ──
const LYON_2007: CuratedSeed[] = [
  q('lyon', 'coupet_07', 'Grégory Coupet', 1972, 'France', ['GK'], 83, 84, 2008, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('lyon', 'benzema_07', 'Karim Benzema', 1987, 'France', ['ST'], 80, 90, 2010, 15, t(7, 7, 9, 7, 5, 8)),
  q('lyon', 'juninho_07', 'Juninho Pernambucano', 1975, 'Brazil', ['CM', 'AM'], 83, 85, 2009, 20, t(9, 6, 8, 8, 5, 8)),
  q('lyon', 'fred_07', 'Fred', 1983, 'Brazil', ['ST'], 79, 82, 2009, 20, t(7, 6, 8, 7, 6, 8)),
  q('lyon', 'govou_07', 'Sidney Govou', 1979, 'France', ['RW', 'ST'], 79, 82, 2009, 20, t(7, 6, 8, 8, 5, 8)),
  q('lyon', 'tiago_07', 'Tiago', 1981, 'Portugal', ['CM', 'DM'], 80, 82, 2009, 20, t(9, 5, 8, 8, 5, 8)),
  q('lyon', 'kallstrom_07', 'Kim Källström', 1982, 'Sweden', ['CM', 'AM'], 79, 83, 2010, 20, t(8, 5, 8, 8, 5, 8)),
  q('lyon', 'cris_07', 'Cris', 1977, 'Brazil', ['CB'], 81, 82, 2009, 20, t(8, 6, 8, 8, 6, 7)),
];

// ── Hamburger SV, 2006-07 (Van der Vaart the star; a young Kompany & De Jong) ───
const HAMBURG_2007: CuratedSeed[] = [
  q('hamburg', 'van_der_vaart_07', 'Rafael van der Vaart', 1983, 'Netherlands', ['AM'], 83, 86, 2009, 20, t(8, 6, 9, 7, 5, 8)),
  q('hamburg', 'de_jong_h07', 'Nigel de Jong', 1984, 'Netherlands', ['DM'], 80, 84, 2009, 20, t(8, 6, 8, 7, 6, 8)),
  q('hamburg', 'kompany_07', 'Vincent Kompany', 1986, 'Belgium', ['CB', 'DM'], 80, 88, 2009, 25, t(9, 7, 9, 8, 5, 8)),
  q('hamburg', 'jarolim_07', 'David Jarolím', 1979, 'Czechia', ['CM', 'DM'], 78, 80, 2009, 20, t(9, 5, 8, 8, 5, 8)),
  q('hamburg', 'trochowski_07', 'Piotr Trochowski', 1984, 'Germany', ['AM', 'LW'], 78, 82, 2009, 20, t(8, 5, 8, 7, 5, 8)),
  q('hamburg', 'guerrero_07', 'Paolo Guerrero', 1984, 'Peru', ['ST'], 77, 82, 2009, 20, t(7, 6, 8, 7, 6, 8)),
];

// ── Werder Bremen, 2006-07 (Diego the fulcrum) ─────────────────────────────────
const WERDER_2007: CuratedSeed[] = [
  q('werder', 'diego_we07', 'Diego', 1985, 'Brazil', ['AM'], 82, 86, 2009, 20, t(7, 7, 9, 7, 5, 8)),
  q('werder', 'frings_we07', 'Torsten Frings', 1976, 'Germany', ['DM', 'CM'], 81, 82, 2009, 20, t(9, 5, 8, 8, 5, 8)),
  q('werder', 'naldo_we07', 'Naldo', 1982, 'Brazil', ['CB'], 79, 83, 2010, 20, t(8, 5, 8, 8, 5, 8)),
  q('werder', 'borowski_we07', 'Tim Borowski', 1980, 'Germany', ['CM', 'AM'], 79, 82, 2008, 20, t(8, 5, 8, 8, 5, 8)),
  q('werder', 'jensen_we07', 'Daniel Jensen', 1979, 'Denmark', ['CM', 'DM'], 77, 79, 2009, 20, t(8, 5, 8, 8, 5, 8)),
  q('werder', 'mertesacker_we07', 'Per Mertesacker', 1984, 'Germany', ['CB'], 80, 84, 2010, 20, t(9, 5, 8, 8, 4, 8)),
];

// ── FC Porto, 2006-07 (Lucho & Lisandro; Meireles emerging) ────────────────────
const PORTO_2007: CuratedSeed[] = [
  q('porto', 'helton_07', 'Helton', 1978, 'Brazil', ['GK'], 79, 81, 2010, 20, t(8, 5, 8, 8, 5, 7)),
  q('porto', 'lucho_07', 'Lucho González', 1981, 'Argentina', ['CM', 'AM'], 81, 84, 2009, 20, t(8, 6, 8, 8, 5, 8)),
  q('porto', 'lisandro_07', 'Lisandro López', 1983, 'Argentina', ['ST'], 81, 84, 2009, 20, t(8, 6, 9, 7, 5, 8)),
  q('porto', 'meireles_07', 'Raul Meireles', 1983, 'Portugal', ['CM', 'AM'], 79, 84, 2010, 20, t(8, 6, 8, 8, 5, 8)),
  q('porto', 'bruno_alves_07', 'Bruno Alves', 1981, 'Portugal', ['CB'], 80, 83, 2010, 20, t(8, 6, 8, 8, 5, 8)),
  q('porto', 'bosingwa_07', 'Bosingwa', 1982, 'Portugal', ['RB'], 79, 83, 2009, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Benfica, 2006-07 ────────────────────────────────────────────────────────────
const BENFICA_2007: CuratedSeed[] = [
  q('benfica', 'nuno_gomes_07', 'Nuno Gomes', 1976, 'Portugal', ['ST'], 79, 80, 2009, 25, t(8, 6, 8, 9, 5, 8), { loyalty: 88 }),
  q('benfica', 'katsouranis_07', 'Kostas Katsouranis', 1979, 'Greece', ['DM', 'CM'], 79, 81, 2010, 20, t(9, 5, 8, 8, 5, 8)),
  q('benfica', 'petit_07', 'Petit', 1976, 'Portugal', ['DM', 'CM'], 78, 80, 2009, 20, t(9, 5, 8, 8, 5, 8)),
  q('benfica', 'leo_07', 'Léo', 1975, 'Brazil', ['LB'], 77, 79, 2009, 20, t(8, 5, 8, 7, 5, 8)),
  q('benfica', 'nelson_07', 'Nélson', 1983, 'Portugal', ['RB'], 76, 80, 2010, 20, t(8, 5, 8, 8, 5, 8)),
  q('benfica', 'rui_costa_be07', 'Rui Costa', 1972, 'Portugal', ['AM'], 79, 79, 2008, 25, t(8, 6, 8, 10, 5, 8), { loyalty: 95 }),
];

// ── Ajax, 2006-07 (Huntelaar's goals) ──────────────────────────────────────────
const AJAX_2007: CuratedSeed[] = [
  q('ajax', 'huntelaar_07', 'Klaas-Jan Huntelaar', 1983, 'Netherlands', ['ST'], 81, 85, 2010, 20, t(8, 6, 9, 7, 5, 8)),
  q('ajax', 'heitinga_07', 'John Heitinga', 1983, 'Netherlands', ['CB', 'DM'], 80, 84, 2009, 20, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'maxwell_07', 'Maxwell', 1981, 'Brazil', ['LB'], 79, 83, 2009, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'emanuelson_07', 'Urby Emanuelson', 1986, 'Netherlands', ['LB', 'LW'], 77, 82, 2010, 20, t(7, 6, 8, 7, 6, 8)),
  q('ajax', 'vertonghen_a07', 'Jan Vertonghen', 1987, 'Belgium', ['CB', 'LB'], 72, 87, 2011, 15, t(9, 5, 8, 8, 5, 8)),
  q('ajax', 'vermaelen_a07', 'Thomas Vermaelen', 1985, 'Belgium', ['CB', 'LB'], 76, 85, 2010, 20, t(9, 5, 8, 8, 5, 8)),
];

// ── Celtic, 2006-07 (Nakamura's free kicks) ────────────────────────────────────
const CELTIC_2007: CuratedSeed[] = [
  q('celtic', 'nakamura_07', 'Shunsuke Nakamura', 1978, 'Japan', ['AM', 'RW'], 80, 82, 2009, 20, t(9, 5, 8, 8, 4, 8)),
  q('celtic', 'mcgeady_07', 'Aiden McGeady', 1986, 'Ireland', ['RW', 'LW'], 78, 84, 2010, 20, t(6, 7, 8, 7, 6, 8)),
  q('celtic', 'boruc_07', 'Artur Boruc', 1980, 'Poland', ['GK'], 80, 82, 2010, 20, t(7, 6, 8, 7, 6, 8)),
  q('celtic', 'mcmanus_07', 'Stephen McManus', 1982, 'Scotland', ['CB'], 76, 78, 2010, 20, t(8, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('celtic', 'vennegoor_07', 'Jan Vennegoor of Hesselink', 1978, 'Netherlands', ['ST'], 77, 79, 2009, 20, t(8, 5, 8, 7, 5, 8)),
  q('celtic', 'sno_07', 'Evander Sno', 1987, 'Netherlands', ['CM', 'DM'], 72, 80, 2010, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── Olympique de Marseille, 2006-07 ────────────────────────────────────────────
const MARSEILLE_2007: CuratedSeed[] = [
  q('marseille', 'niang_07', 'Mamadou Niang', 1979, 'Senegal', ['ST'], 80, 82, 2009, 20, t(7, 6, 8, 7, 6, 8)),
  q('marseille', 'taiwo_07', 'Taye Taiwo', 1985, 'Nigeria', ['LB'], 78, 83, 2010, 20, t(7, 6, 8, 7, 6, 8)),
  q('marseille', 'cana_07', 'Lorik Cana', 1983, 'Albania', ['DM', 'CB'], 79, 81, 2009, 20, t(7, 6, 8, 7, 7, 8)),
  q('marseille', 'nasri_07', 'Samir Nasri', 1987, 'France', ['AM', 'LW'], 78, 87, 2010, 20, t(6, 7, 8, 6, 6, 8)),
  q('marseille', 'zenden_07', 'Boudewijn Zenden', 1976, 'Netherlands', ['LW', 'LB'], 77, 78, 2008, 20, t(8, 5, 8, 7, 5, 8)),
  q('marseille', 'valbuena_07', 'Mathieu Valbuena', 1984, 'France', ['AM', 'RW'], 76, 82, 2010, 20, t(8, 6, 8, 8, 5, 8)),
];

/** The non-Italian, non-Spanish European selling clubs of the 2006-07 world,
 *  shared context for the milan-2007, juventus-2006 and real-madrid-2006
 *  universes. Merged by CONCATENATION onto any club already present. */
export const EUROPE_2007_SQUADS: Record<string, CuratedSeed[]> = {
  lyon: LYON_2007,
  hamburg: HAMBURG_2007,
  werder: WERDER_2007,
  porto: PORTO_2007,
  benfica: BENFICA_2007,
  ajax: AJAX_2007,
  celtic: CELTIC_2007,
  marseille: MARSEILLE_2007,
};
