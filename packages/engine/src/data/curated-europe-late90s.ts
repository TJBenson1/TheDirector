/**
 * European selling clubs — 1997-98 (M12A rollout, the talent pipeline).
 *
 * The Dutch, Portuguese, Scottish and Spanish clubs that fed the big leagues in
 * the late 90s — foreign to both the Serie A world (inter-1998) and the Bundesliga
 * worlds (dortmund-1997, bayern-1998), so one set serves all three. Ajax's
 * post-dynasty side, PSV, Feyenoord, Porto (Jardel), Benfica, Celtic (Larsson) and
 * Rangers (Gascoigne, Laudrup), SuperDepor and Valencia. Ability/potential/
 * personality are HIDDEN designer estimates (§7); clubs, birth years, positions
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

// ── Ajax, 1997-98 (the champions after the great side was picked apart) ─────────
const AJAX_L90: CuratedSeed[] = [
  q('ajax', 'vandersar_l90', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 83, 84, 2000, 20, t(9, 5, 8, 7, 3, 8)),
  q('ajax', 'witschge_l90', 'Richard Witschge', 1969, 'Netherlands', ['CM', 'LW'], 77, 78, 2000, 25, t(8, 6, 7, 7, 5, 8)),
  q('ajax', 'r_de_boer_l90', 'Ronald de Boer', 1970, 'Netherlands', ['AM', 'ST'], 80, 81, 2000, 20, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'melchiot_l90', 'Mario Melchiot', 1976, 'Netherlands', ['RB', 'CB'], 75, 82, 2000, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'arveladze_l90', 'Shota Arveladze', 1973, 'Georgia', ['ST'], 78, 81, 2000, 20, t(8, 6, 8, 7, 5, 8)),
  q('ajax', 'dani_l90', 'Dani', 1976, 'Portugal', ['ST', 'AM'], 76, 81, 2000, 20, t(6, 7, 8, 6, 6, 8)),
];

// ── PSV, 1997-98 (Nilis & Cocu; a teenage Van Bommel) ──────────────────────────
const PSV_L90: CuratedSeed[] = [
  q('psv', 'nilis_l90', 'Luc Nilis', 1967, 'Belgium', ['ST'], 81, 82, 2000, 20, t(9, 6, 8, 8, 4, 8)),
  q('psv', 'jonk_l90', 'Wim Jonk', 1966, 'Netherlands', ['CM', 'AM'], 79, 80, 1999, 20, t(9, 5, 8, 8, 5, 8)),
  q('psv', 'van_bommel_l90', 'Mark van Bommel', 1977, 'Netherlands', ['CM', 'DM'], 74, 85, 2001, 20, t(8, 6, 9, 7, 6, 8)),
  q('psv', 'faber_l90', 'Ernest Faber', 1971, 'Netherlands', ['RB', 'CB'], 75, 77, 2000, 20, t(8, 5, 8, 8, 5, 7)),
  q('psv', 'ooijer_l90', 'André Ooijer', 1974, 'Netherlands', ['CB', 'DM'], 76, 80, 2000, 20, t(9, 5, 8, 8, 5, 8)),
  q('psv', 'bruggink_l90', 'Arnold Bruggink', 1977, 'Netherlands', ['ST', 'AM'], 75, 79, 2001, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Feyenoord, 1997-98 ──────────────────────────────────────────────────────────
const FEYENOORD_L90: CuratedSeed[] = [
  q('feyenoord', 'cruz_l90', 'Julio Cruz', 1974, 'Argentina', ['ST'], 78, 82, 2000, 25, t(8, 6, 8, 7, 5, 8)),
  q('feyenoord', 'tomasson_l90', 'Jon Dahl Tomasson', 1976, 'Denmark', ['ST', 'AM'], 77, 84, 2001, 20, t(9, 6, 9, 7, 4, 8)),
  q('feyenoord', 'bosvelt_l90', 'Paul Bosvelt', 1970, 'Netherlands', ['DM', 'CM'], 77, 79, 1999, 20, t(9, 5, 8, 8, 4, 8)),
  q('feyenoord', 'vos_l90', 'Jean-Paul van Gastel', 1972, 'Netherlands', ['CM', 'LB'], 75, 77, 2000, 20, t(8, 5, 8, 7, 5, 8)),
  q('feyenoord', 'korneev_l90', 'Igor Korneev', 1967, 'Russia', ['AM'], 75, 77, 1999, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── FC Porto, 1997-98 (Jardel's goals) ─────────────────────────────────────────
const PORTO_L90: CuratedSeed[] = [
  q('porto', 'jardel_l90', 'Mário Jardel', 1973, 'Brazil', ['ST'], 83, 85, 2000, 20, t(8, 7, 9, 7, 5, 8)),
  q('porto', 'drulovic_l90', 'Ljubinko Drulović', 1968, 'Serbia', ['RW', 'LW'], 78, 79, 2000, 25, t(8, 6, 8, 7, 5, 8)),
  q('porto', 'jorge_costa_l90', 'Jorge Costa', 1971, 'Portugal', ['CB'], 79, 82, 2000, 20, t(9, 6, 8, 9, 6, 7), { loyalty: 88 }),
  q('porto', 'zahovic_l90', 'Zlatko Zahovič', 1971, 'Slovenia', ['AM'], 80, 82, 2000, 20, t(7, 7, 8, 6, 6, 8)),
  q('porto', 'emerson_l90', 'Emerson', 1972, 'Brazil', ['DM', 'CM'], 77, 80, 2000, 20, t(8, 5, 8, 7, 5, 8)),
  q('porto', 'capucho_l90', 'Capucho', 1972, 'Portugal', ['RW', 'AM'], 76, 79, 2000, 25, t(7, 6, 8, 7, 5, 8)),
];

// ── Benfica, 1997-98 (João Pinto; a young Nuno Gomes) ──────────────────────────
const BENFICA_L90: CuratedSeed[] = [
  q('benfica', 'joao_pinto_l90', 'João Pinto', 1971, 'Portugal', ['AM', 'ST'], 80, 82, 2000, 25, t(6, 7, 8, 7, 6, 8)),
  q('benfica', 'nuno_gomes_l90', 'Nuno Gomes', 1976, 'Portugal', ['ST'], 78, 85, 2001, 20, t(8, 6, 8, 7, 5, 8)),
  q('benfica', 'poborsky_l90', 'Karel Poborský', 1972, 'Czechia', ['RW', 'AM'], 79, 81, 2000, 20, t(8, 6, 8, 7, 5, 8)),
  q('benfica', 'preudhomme_l90', 'Michel Preud’homme', 1959, 'Belgium', ['GK'], 78, 78, 1999, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
  q('benfica', 'helder_l90', 'Hélder', 1971, 'Portugal', ['CB'], 76, 78, 2000, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── Celtic, 1997-98 (Larsson arrives; the title back from Rangers) ─────────────
const CELTIC_L90: CuratedSeed[] = [
  q('celtic', 'larsson_l90', 'Henrik Larsson', 1971, 'Sweden', ['ST', 'AM'], 82, 86, 2001, 20, t(9, 6, 9, 8, 4, 8)),
  q('celtic', 'boyd_l90', 'Tom Boyd', 1965, 'Scotland', ['LB', 'CB'], 76, 77, 2000, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
  q('celtic', 'wieghorst_l90', 'Morten Wieghorst', 1971, 'Denmark', ['CM', 'DM'], 75, 78, 2000, 20, t(8, 5, 8, 8, 5, 8)),
  q('celtic', 'mcnamara_l90', 'Jackie McNamara', 1973, 'Scotland', ['RB', 'CM'], 76, 79, 2001, 20, t(8, 5, 8, 8, 5, 7)),
  q('celtic', 'rieper_l90', 'Marc Rieper', 1968, 'Denmark', ['CB'], 77, 78, 1999, 20, t(9, 5, 8, 8, 5, 7)),
  q('celtic', 'donnelly_l90', 'Simon Donnelly', 1974, 'Scotland', ['ST', 'AM'], 74, 77, 2000, 20, t(7, 5, 8, 8, 5, 7)),
];

// ── Rangers, 1997-98 (Gascoigne & Laudrup, the nine-in-a-row side's last stand) ─
const RANGERS_L90: CuratedSeed[] = [
  q('rangers', 'laudrup_l90', 'Brian Laudrup', 1969, 'Denmark', ['LW', 'AM'], 83, 84, 1999, 20, t(8, 6, 8, 7, 5, 8)),
  q('rangers', 'gascoigne_l90', 'Paul Gascoigne', 1967, 'England', ['AM', 'CM'], 81, 83, 1999, 30, t(4, 8, 8, 6, 8, 8)),
  q('rangers', 'negri_l90', 'Marco Negri', 1970, 'Italy', ['ST'], 78, 80, 2000, 25, t(6, 7, 8, 6, 6, 7)),
  q('rangers', 'albertz_l90', 'Jörg Albertz', 1971, 'Germany', ['CM', 'LW'], 78, 80, 2000, 20, t(7, 6, 8, 7, 6, 8)),
  q('rangers', 'goram_l90', 'Andy Goram', 1964, 'Scotland', ['GK'], 79, 80, 1999, 20, t(7, 6, 8, 8, 6, 7)),
  q('rangers', 'gough_l90', 'Richard Gough', 1962, 'Scotland', ['CB'], 78, 78, 1998, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
];

// ── Deportivo La Coruña, 1997-98 (Makaay arrives; Fran & Mauro Silva) ──────────
const DEPORTIVO_L90: CuratedSeed[] = [
  q('deportivo', 'makaay_l90', 'Roy Makaay', 1975, 'Netherlands', ['ST'], 81, 86, 2001, 20, t(9, 6, 8, 8, 4, 8)),
  q('deportivo', 'djalminha_l90', 'Djalminha', 1970, 'Brazil', ['AM'], 80, 82, 2000, 20, t(5, 8, 8, 6, 7, 8)),
  q('deportivo', 'fran_l90', 'Fran', 1969, 'Spain', ['AM', 'LW'], 79, 81, 2001, 20, t(8, 5, 8, 9, 5, 8), { loyalty: 92 }),
  q('deportivo', 'mauro_silva_l90', 'Mauro Silva', 1968, 'Brazil', ['DM'], 80, 81, 2000, 20, t(9, 5, 8, 9, 4, 8)),
  q('deportivo', 'naybet_l90', 'Noureddine Naybet', 1970, 'Morocco', ['CB'], 79, 82, 2001, 20, t(9, 5, 8, 8, 5, 8)),
  q('deportivo', 'donato_l90', 'Donato', 1962, 'Spain', ['CB', 'DM'], 77, 77, 1999, 20, t(9, 5, 8, 8, 5, 7)),
];

// ── Valencia, 1997-98 (Mendieta & Claudio López the emerging spine) ────────────
const VALENCIA_L90: CuratedSeed[] = [
  q('valencia', 'mendieta_l90', 'Gaizka Mendieta', 1974, 'Spain', ['CM', 'AM'], 81, 86, 2001, 20, t(9, 5, 8, 8, 4, 8)),
  q('valencia', 'claudio_lopez_l90', 'Claudio López', 1974, 'Argentina', ['ST', 'LW'], 82, 84, 2000, 20, t(7, 6, 8, 7, 6, 8)),
  q('valencia', 'ortega_l90', 'Ariel Ortega', 1974, 'Argentina', ['AM'], 80, 83, 2000, 25, t(5, 8, 8, 6, 7, 8)),
  q('valencia', 'ilie_l90', 'Adrian Ilie', 1974, 'Romania', ['ST', 'RW'], 78, 81, 2000, 20, t(7, 6, 8, 7, 5, 8)),
  q('valencia', 'carboni_l90', 'Amedeo Carboni', 1965, 'Italy', ['LB', 'CB'], 78, 79, 2000, 20, t(9, 5, 8, 8, 5, 7)),
  q('valencia', 'farinos_l90', 'Javier Farinós', 1978, 'Spain', ['DM', 'CM'], 76, 82, 2001, 20, t(8, 5, 8, 7, 5, 8)),
];

/** The non-Italian, non-German European selling clubs of the 1997-98 world,
 *  shared context for the inter-1998, dortmund-1997 and bayern-1998 universes.
 *  Merged by CONCATENATION onto any club already present. */
export const EUROPE_LATE90S_SQUADS: Record<string, CuratedSeed[]> = {
  ajax: AJAX_L90,
  psv: PSV_L90,
  feyenoord: FEYENOORD_L90,
  porto: PORTO_L90,
  benfica: BENFICA_L90,
  celtic: CELTIC_L90,
  rangers: RANGERS_L90,
  deportivo: DEPORTIVO_L90,
  valencia: VALENCIA_L90,
};
