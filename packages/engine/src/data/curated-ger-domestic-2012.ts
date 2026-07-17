/**
 * Curated domestic mid-tier — 2012-13 Bundesliga (M12 shortlist supply).
 *
 * Real 2012-13 squad players at the modelled Bundesliga's non-elite clubs for
 * the dortmund-2012 world, so options lists read like a real shortlist — a young
 * Roberto Firmino & Kevin Volland at Hoffenheim, Heung-min Son & van der Vaart at
 * Hamburg, Marc-André ter Stegen at Gladbach, Matthias Ginter & Max Kruse at the
 * overachieving Freiburg, Ibišević & Okazaki at Stuttgart. HIDDEN designer
 * estimates (§7); real clubs, birth years, positions, contracts. A prospect-rich
 * era. Injury proneness at the population norm (~30). Names already curated in
 * the world are omitted.
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

const HOFFENHEIM_12: CuratedSeed[] = [
  q('hoffenheim', 'firmino_ho12', 'Roberto Firmino', 1991, 'Brazil', ['AM', 'ST'], 76, 87, 2016, 30, t(8, 6, 9, 7, 5, 8)),
  q('hoffenheim', 'volland_ho12', 'Kevin Volland', 1992, 'Germany', ['ST', 'LW'], 74, 84, 2015, 30, t(8, 6, 8, 7, 5, 8)),
  q('hoffenheim', 'rudy_ho12', 'Sebastian Rudy', 1990, 'Germany', ['CM', 'DM'], 74, 81, 2015, 30, t(9, 5, 8, 8, 4, 8)),
  q('hoffenheim', 'salihovic_ho12', 'Sejad Salihović', 1984, 'Bosnia', ['LB', 'LW'], 75, 77, 2014, 30, t(7, 6, 8, 7, 6, 8)),
  q('hoffenheim', 'beck_ho12', 'Andreas Beck', 1987, 'Germany', ['RB'], 75, 78, 2015, 30, t(8, 5, 8, 8, 5, 8)),
];

const HAMBURG_12: CuratedSeed[] = [
  q('hamburg', 'vdv_ha12', 'Rafael van der Vaart', 1983, 'Netherlands', ['AM', 'CM'], 80, 82, 2015, 30, t(7, 7, 8, 7, 5, 8)),
  q('hamburg', 'son_ha12', 'Heung-min Son', 1992, 'South Korea', ['LW', 'ST'], 76, 87, 2015, 30, t(8, 6, 9, 7, 5, 8)),
  q('hamburg', 'adler_ha12', 'René Adler', 1985, 'Germany', ['GK'], 79, 82, 2015, 30, t(9, 5, 8, 8, 4, 8)),
  q('hamburg', 'westermann_ha12', 'Heiko Westermann', 1983, 'Germany', ['CB', 'DM'], 77, 78, 2014, 30, t(8, 5, 8, 8, 5, 8)),
  q('hamburg', 'badelj_ha12', 'Milan Badelj', 1989, 'Croatia', ['CM', 'DM'], 75, 81, 2016, 30, t(8, 5, 8, 7, 5, 8)),
  q('hamburg', 'aogo_ha12', 'Dennis Aogo', 1986, 'Germany', ['LB', 'DM'], 75, 77, 2014, 30, t(8, 5, 8, 7, 5, 8)),
];

const GLADBACH_12: CuratedSeed[] = [
  q('gladbach', 'ter_stegen_gl12', 'Marc-André ter Stegen', 1992, 'Germany', ['GK'], 78, 89, 2015, 30, t(9, 5, 8, 8, 4, 8)),
  q('gladbach', 'dominguez_gl12', 'Álvaro Domínguez', 1989, 'Spain', ['CB'], 77, 81, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('gladbach', 'nordtveit_gl12', 'Håvard Nordtveit', 1990, 'Norway', ['DM', 'CB'], 76, 80, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('gladbach', 'herrmann_gl12', 'Patrick Herrmann', 1991, 'Germany', ['RW', 'LW'], 74, 80, 2016, 30, t(8, 5, 8, 8, 5, 8)),
  q('gladbach', 'hanke_gl12', 'Mike Hanke', 1983, 'Germany', ['ST'], 74, 76, 2014, 30, t(8, 5, 8, 8, 5, 8)),
  q('gladbach', 'jantschke_gl12', 'Tony Jantschke', 1990, 'Germany', ['RB', 'CB'], 73, 77, 2016, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
];

const FREIBURG_12: CuratedSeed[] = [
  q('freiburg', 'kruse_fr12', 'Max Kruse', 1988, 'Germany', ['ST', 'AM'], 77, 82, 2015, 30, t(6, 7, 8, 6, 6, 8)),
  q('freiburg', 'ginter_fr12', 'Matthias Ginter', 1994, 'Germany', ['CB', 'DM'], 72, 84, 2015, 30, t(9, 5, 8, 8, 4, 8)),
  q('freiburg', 'caligiuri_fr12', 'Daniel Caligiuri', 1988, 'Germany', ['RW', 'LW'], 74, 79, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('freiburg', 'baumann_fr12', 'Oliver Baumann', 1990, 'Germany', ['GK'], 75, 81, 2015, 30, t(9, 5, 8, 8, 4, 8)),
  q('freiburg', 'rosenthal_fr12', 'Jan Rosenthal', 1986, 'Germany', ['AM', 'LW'], 73, 75, 2014, 30, t(8, 5, 8, 8, 5, 8)),
];

const STUTTGART_12: CuratedSeed[] = [
  q('stuttgart', 'ibisevic_st12', 'Vedad Ibišević', 1984, 'Bosnia', ['ST'], 78, 80, 2015, 30, t(8, 6, 8, 7, 5, 8)),
  q('stuttgart', 'harnik_st12', 'Martin Harnik', 1987, 'Austria', ['ST', 'RW'], 76, 79, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('stuttgart', 'okazaki_st12', 'Shinji Okazaki', 1986, 'Japan', ['ST', 'AM'], 76, 80, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('stuttgart', 'gentner_st12', 'Christian Gentner', 1985, 'Germany', ['CM', 'DM'], 75, 77, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('stuttgart', 'tasci_st12', 'Serdar Tasci', 1987, 'Germany', ['CB'], 75, 78, 2014, 30, t(8, 5, 8, 8, 5, 8)),
  q('stuttgart', 'ulreich_st12', 'Sven Ulreich', 1988, 'Germany', ['GK'], 74, 80, 2015, 30, t(8, 5, 8, 8, 5, 8)),
];

const FRANKFURT_12: CuratedSeed[] = [
  q('frankfurt', 'meier_fr12', 'Alexander Meier', 1983, 'Germany', ['ST', 'AM'], 76, 79, 2015, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('frankfurt', 'inui_fr12', 'Takashi Inui', 1988, 'Japan', ['LW', 'RW'], 74, 79, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('frankfurt', 'rode_fr12', 'Sebastian Rode', 1990, 'Germany', ['CM', 'DM'], 74, 81, 2014, 30, t(8, 5, 8, 8, 4, 8)),
  q('frankfurt', 'schwegler_fr12', 'Pirmin Schwegler', 1987, 'Switzerland', ['CM', 'DM'], 74, 77, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('frankfurt', 'trapp_fr12', 'Kevin Trapp', 1990, 'Germany', ['GK'], 74, 82, 2015, 30, t(8, 5, 8, 8, 5, 8)),
];

const HANNOVER_12: CuratedSeed[] = [
  q('hannover', 'stindl_hn12', 'Lars Stindl', 1988, 'Germany', ['AM', 'ST'], 76, 81, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('hannover', 'diouf_hn12', 'Mame Biram Diouf', 1987, 'Senegal', ['ST'], 75, 79, 2015, 30, t(7, 6, 8, 7, 5, 8)),
  q('hannover', 'huszti_hn12', 'Szabolcs Huszti', 1983, 'Hungary', ['AM', 'LW'], 75, 77, 2014, 30, t(7, 6, 8, 7, 5, 8)),
  q('hannover', 'yakonan_hn12', 'Didier Ya Konan', 1984, 'Ivory Coast', ['ST'], 74, 76, 2014, 30, t(7, 6, 8, 7, 5, 8)),
  q('hannover', 'zieler_hn12', 'Ron-Robert Zieler', 1989, 'Germany', ['GK'], 75, 81, 2015, 30, t(9, 5, 8, 8, 4, 8)),
];

const MAINZ_12: CuratedSeed[] = [
  q('mainz', 'szalai_mz12', 'Ádám Szalai', 1987, 'Hungary', ['ST'], 75, 79, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('mainz', 'nmuller_mz12', 'Nicolai Müller', 1987, 'Germany', ['RW', 'AM'], 75, 79, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('mainz', 'baumgartlinger_mz12', 'Julian Baumgartlinger', 1988, 'Austria', ['DM', 'CM'], 74, 79, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('mainz', 'malli_mz12', 'Yunus Malli', 1992, 'Germany', ['AM', 'CM'], 72, 80, 2016, 30, t(8, 5, 8, 7, 5, 8)),
];

const NURNBERG_12: CuratedSeed[] = [
  q('nurnberg', 'kiyotake_nu12', 'Hiroshi Kiyotake', 1990, 'Japan', ['AM', 'RW'], 74, 81, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('nurnberg', 'pekhart_nu12', 'Tomáš Pekhart', 1989, 'Czechia', ['ST'], 73, 77, 2015, 30, t(7, 6, 8, 7, 5, 8)),
  q('nurnberg', 'chandler_nu12', 'Timothy Chandler', 1990, 'United States', ['RB', 'RW'], 73, 78, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('nurnberg', 'feulner_nu12', 'Markus Feulner', 1982, 'Germany', ['CM'], 72, 74, 2014, 30, t(8, 5, 8, 8, 5, 8)),
];

const AUGSBURG_12: CuratedSeed[] = [
  q('augsburg', 'baier_au12', 'Daniel Baier', 1984, 'Germany', ['CM', 'DM'], 74, 76, 2015, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('augsburg', 'verhaegh_au12', 'Paul Verhaegh', 1983, 'Netherlands', ['RB'], 74, 76, 2015, 30, t(8, 5, 8, 8, 5, 8)),
  q('augsburg', 'koo_au12', 'Koo Ja-cheol', 1989, 'South Korea', ['AM', 'CM'], 74, 79, 2015, 30, t(8, 5, 8, 7, 5, 8)),
  q('augsburg', 'molders_au12', 'Sascha Mölders', 1985, 'Germany', ['ST'], 72, 74, 2014, 30, t(7, 6, 8, 7, 5, 8)),
];

/** The domestic mid-tier of the 2012-13 Bundesliga. Merged by CONCATENATION into
 *  DORTMUND_2012_SQUADS. */
export const GER_DOMESTIC_2012_SQUADS: Record<string, CuratedSeed[]> = {
  hoffenheim: HOFFENHEIM_12,
  hamburg: HAMBURG_12,
  gladbach: GLADBACH_12,
  freiburg: FREIBURG_12,
  stuttgart: STUTTGART_12,
  frankfurt: FRANKFURT_12,
  hannover: HANNOVER_12,
  mainz: MAINZ_12,
  nurnberg: NURNBERG_12,
  augsburg: AUGSBURG_12,
};
