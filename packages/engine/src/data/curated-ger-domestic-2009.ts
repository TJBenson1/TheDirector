/**
 * Curated domestic mid-tier — 2009-10 Bundesliga (M12 shortlist supply).
 *
 * Real 2009-10 squad players at the modelled Bundesliga's non-elite clubs for
 * the bayern-2009 world, so options lists — and prospect lists — read like a
 * real shortlist. A remarkable pre-fame crop: a teenage Marco Reus at Gladbach,
 * İlkay Gündoğan at Nürnberg, Sami Khedira at Stuttgart, Lukas Podolski back at
 * Köln, Luiz Gustavo & Gylfi Sigurðsson & Demba Ba at Hoffenheim, André Schürrle
 * & Lewis Holtby at promoted Mainz, Papiss Cissé at Freiburg. HIDDEN designer
 * estimates (§7); real clubs, birth years, positions, contracts. Injury
 * proneness at the population norm (~30). Names already curated are omitted.
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

const GLADBACH_09: CuratedSeed[] = [
  q('gladbach', 'reus_gl09', 'Marco Reus', 1989, 'Germany', ['RW', 'AM', 'ST'], 76, 88, 2013, 30, t(8, 6, 9, 7, 5, 8)),
  q('gladbach', 'bradley_gl09', 'Michael Bradley', 1987, 'United States', ['CM', 'DM'], 74, 79, 2011, 30, t(9, 5, 8, 7, 5, 8)),
  q('gladbach', 'daems_gl09', 'Filip Daems', 1978, 'Belgium', ['LB'], 74, 76, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('gladbach', 'friend_gl09', 'Rob Friend', 1981, 'Canada', ['ST'], 72, 74, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('gladbach', 'brouwers_gl09', 'Roel Brouwers', 1981, 'Netherlands', ['CB', 'DM'], 73, 75, 2012, 30, t(8, 5, 8, 8, 5, 8)),
];

const STUTTGART_09: CuratedSeed[] = [
  q('stuttgart', 'hleb_st09', 'Aleksandr Hleb', 1981, 'Belarus', ['AM', 'RW'], 77, 80, 2010, 30, t(7, 6, 8, 7, 5, 8)),
  q('stuttgart', 'cacau_st09', 'Cacau', 1981, 'Germany', ['ST'], 76, 78, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('stuttgart', 'pogrebnyak_st09', 'Pavel Pogrebnyak', 1984, 'Russia', ['ST'], 75, 78, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('stuttgart', 'trasch_st09', 'Christian Träsch', 1987, 'Germany', ['RB', 'CM'], 74, 79, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('stuttgart', 'kuzmanovic_st09', 'Zdravko Kuzmanović', 1987, 'Serbia', ['CM', 'AM'], 75, 79, 2012, 30, t(7, 6, 8, 7, 5, 8)),
];

const KOLN_09: CuratedSeed[] = [
  q('koln', 'podolski_ko09', 'Lukas Podolski', 1985, 'Germany', ['ST', 'LW'], 80, 83, 2012, 30, t(7, 6, 8, 8, 5, 8)),
  q('koln', 'novakovic_ko09', 'Milivoje Novaković', 1979, 'Slovenia', ['ST'], 75, 77, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('koln', 'geromel_ko09', 'Pedro Geromel', 1985, 'Brazil', ['CB'], 74, 78, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('koln', 'petit_ko09', 'Petit', 1976, 'Portugal', ['DM', 'CM'], 74, 75, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('koln', 'mondragon_ko09', 'Faryd Mondragón', 1971, 'Colombia', ['GK'], 74, 74, 2011, 30, t(8, 6, 8, 8, 5, 8)),
];

const HOFFENHEIM_09: CuratedSeed[] = [
  q('hoffenheim', 'demba_ba_ho09', 'Demba Ba', 1985, 'Senegal', ['ST'], 77, 82, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('hoffenheim', 'luiz_gustavo_ho09', 'Luiz Gustavo', 1987, 'Brazil', ['DM', 'CM'], 77, 84, 2012, 30, t(8, 5, 8, 7, 5, 8)),
  q('hoffenheim', 'ibisevic_ho09', 'Vedad Ibišević', 1984, 'Bosnia', ['ST'], 77, 80, 2012, 30, t(8, 6, 8, 7, 5, 8)),
  q('hoffenheim', 'sigurdsson_ho09', 'Gylfi Sigurðsson', 1989, 'Iceland', ['AM', 'CM'], 73, 84, 2011, 30, t(9, 5, 8, 7, 5, 8)),
  q('hoffenheim', 'carlos_eduardo_ho09', 'Carlos Eduardo', 1987, 'Brazil', ['AM', 'LW'], 76, 81, 2012, 30, t(6, 7, 8, 7, 6, 8)),
];

const MAINZ_09: CuratedSeed[] = [
  q('mainz', 'schurrle_mz09', 'André Schürrle', 1990, 'Germany', ['LW', 'ST'], 73, 84, 2011, 30, t(8, 6, 8, 7, 5, 8)),
  q('mainz', 'holtby_mz09', 'Lewis Holtby', 1990, 'Germany', ['AM', 'CM'], 72, 81, 2010, 30, t(8, 6, 8, 7, 5, 8)),
  q('mainz', 'bance_mz09', 'Aristide Bancé', 1984, 'Burkina Faso', ['ST'], 73, 75, 2011, 30, t(6, 7, 8, 7, 6, 8)),
  q('mainz', 'karhan_mz09', 'Miroslav Karhan', 1976, 'Slovakia', ['DM', 'CM'], 74, 75, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('mainz', 'noveski_mz09', 'Nikolče Noveski', 1979, 'North Macedonia', ['CB'], 73, 74, 2012, 30, t(8, 5, 8, 8, 5, 8)),
];

const FREIBURG_09: CuratedSeed[] = [
  q('freiburg', 'cisse_fr09', 'Papiss Cissé', 1985, 'Senegal', ['ST'], 76, 82, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('freiburg', 'makiadi_fr09', 'Cédric Makiadi', 1984, 'DR Congo', ['DM', 'CM'], 74, 76, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('freiburg', 'jager_fr09', 'Jonathan Jäger', 1981, 'France', ['CM', 'DM'], 72, 74, 2011, 30, t(8, 5, 8, 8, 5, 8)),
  q('freiburg', 'butscher_fr09', 'Heiko Butscher', 1980, 'Germany', ['CB'], 72, 73, 2011, 30, t(8, 5, 8, 8, 5, 8)),
];

const NURNBERG_09: CuratedSeed[] = [
  q('nurnberg', 'gundogan_nu09', 'İlkay Gündoğan', 1990, 'Germany', ['CM', 'DM'], 73, 86, 2011, 30, t(9, 5, 8, 7, 4, 8)),
  q('nurnberg', 'schieber_nu09', 'Julian Schieber', 1989, 'Germany', ['ST'], 72, 79, 2010, 30, t(8, 5, 8, 7, 5, 8)),
  q('nurnberg', 'eigler_nu09', 'Christian Eigler', 1984, 'Germany', ['ST', 'RW'], 72, 74, 2012, 30, t(7, 6, 8, 7, 5, 8)),
  q('nurnberg', 'frantz_nu09', 'Mike Frantz', 1986, 'Germany', ['CM', 'LW'], 72, 76, 2012, 30, t(8, 5, 8, 8, 5, 8)),
];

const HERTHA_09: CuratedSeed[] = [
  q('hertha', 'raffael_he09', 'Raffael', 1985, 'Brazil', ['AM', 'LW'], 77, 81, 2012, 30, t(6, 7, 8, 7, 6, 8)),
  q('hertha', 'pantelic_he09', 'Marko Pantelić', 1978, 'Serbia', ['ST'], 75, 76, 2010, 30, t(6, 7, 8, 6, 6, 8)),
  q('hertha', 'voronin_he09', 'Andriy Voronin', 1979, 'Ukraine', ['ST', 'AM'], 75, 77, 2010, 30, t(7, 6, 8, 7, 5, 8)),
  q('hertha', 'friedrich_he09', 'Arne Friedrich', 1979, 'Germany', ['CB', 'RB'], 76, 77, 2010, 30, t(8, 5, 8, 8, 5, 8)),
  q('hertha', 'kacar_he09', 'Gojko Kačar', 1987, 'Serbia', ['DM', 'CM'], 74, 79, 2012, 30, t(8, 5, 8, 7, 5, 8)),
];

const FRANKFURT_09: CuratedSeed[] = [
  q('frankfurt', 'amanatidis_fr09', 'Ioannis Amanatidis', 1981, 'Greece', ['ST', 'AM'], 74, 76, 2011, 30, t(7, 6, 8, 8, 5, 8)),
  q('frankfurt', 'liberopoulos_fr09', 'Nikos Liberopoulos', 1975, 'Greece', ['ST'], 73, 74, 2010, 30, t(7, 6, 8, 7, 5, 8)),
  q('frankfurt', 'russ_fr09', 'Marco Russ', 1985, 'Germany', ['CB', 'DM'], 73, 76, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('frankfurt', 'fenin_fr09', 'Martin Fenin', 1987, 'Czechia', ['ST'], 72, 77, 2011, 30, t(6, 6, 8, 7, 6, 8)),
];

const HANNOVER_09: CuratedSeed[] = [
  q('hannover', 'schlaudraff_hn09', 'Jan Schlaudraff', 1983, 'Germany', ['ST', 'AM'], 73, 76, 2012, 30, t(8, 5, 8, 8, 5, 8)),
  q('hannover', 'forssell_hn09', 'Mikael Forssell', 1981, 'Finland', ['ST'], 74, 76, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('hannover', 'cherundolo_hn09', 'Steven Cherundolo', 1979, 'United States', ['RB'], 74, 75, 2011, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 92 }),
  q('hannover', 'pinto_hn09', 'Sérgio Pinto', 1980, 'Portugal', ['CM', 'RW'], 72, 74, 2011, 30, t(8, 5, 8, 8, 5, 8)),
];

const BOCHUM_09: CuratedSeed[] = [
  q('bochum', 'sestak_bo09', 'Stanislav Šesták', 1982, 'Slovakia', ['ST'], 73, 75, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('bochum', 'dedic_bo09', 'Zlatko Dedič', 1984, 'Slovenia', ['ST'], 72, 74, 2011, 30, t(7, 6, 8, 7, 5, 8)),
  q('bochum', 'maltritz_bo09', 'Marcel Maltritz', 1978, 'Germany', ['CB'], 71, 72, 2011, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
];

/** The domestic mid-tier of the 2009-10 Bundesliga. Merged by CONCATENATION into
 *  BAYERN_2009_SQUADS. */
export const GER_DOMESTIC_2009_SQUADS: Record<string, CuratedSeed[]> = {
  gladbach: GLADBACH_09,
  stuttgart: STUTTGART_09,
  koln: KOLN_09,
  hoffenheim: HOFFENHEIM_09,
  mainz: MAINZ_09,
  freiburg: FREIBURG_09,
  nurnberg: NURNBERG_09,
  hertha: HERTHA_09,
  frankfurt: FRANKFURT_09,
  hannover: HANNOVER_09,
  bochum: BOCHUM_09,
};
