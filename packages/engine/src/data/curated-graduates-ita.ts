/**
 * Academy graduates — the real next generation for the Serie A eras (era-serie-a-
 * 1995 / -1998 / -2004 / -2006 / -2007). Real Italian-league breakthroughs 1996-2025
 * at clubs present in those worlds, injected at their debut window by INTAKES_ITA.
 * Each era fires only its in-span intakes; a name already present is skipped.
 * Ratings are HIDDEN designer estimates (§7).
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import type { AcademyIntake } from '../ledger.js';

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

export const GRADUATES_ITA: CuratedSeed[] = [
  q('roma', 'totti_ita', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 72, 90, 2003, 20, t(8, 7, 9, 10, 4, 7), { loyalty: 98 }),
  q('parma', 'buffon_ita', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 74, 90, 2003, 15, t(10, 6, 9, 9, 4, 7)),
  q('roma', 'de_rossi_ita', 'Daniele De Rossi', 1983, 'Italy', ['DM', 'CM'], 66, 87, 2008, 20, t(9, 6, 9, 10, 5, 7), { loyalty: 95 }),
  q('roma', 'cassano_ita', 'Antonio Cassano', 1982, 'Italy', ['AM', 'ST'], 68, 86, 2005, 25, t(4, 8, 7, 5, 8, 7)),
  q('parma', 'gilardino_ita', 'Alberto Gilardino', 1982, 'Italy', ['ST'], 70, 84, 2005, 20, t(8, 6, 8, 7, 5, 7)),
  q('fiorentina', 'chiellini_ita', 'Giorgio Chiellini', 1984, 'Italy', ['CB'], 66, 88, 2008, 20, t(9, 6, 9, 9, 5, 7)),
  q('milan', 'kaka_ita', 'Kaká', 1982, 'Brazil', ['AM'], 78, 91, 2009, 20, t(9, 6, 9, 8, 4, 8)),
  q('juventus', 'marchisio_ita', 'Claudio Marchisio', 1986, 'Italy', ['CM'], 62, 85, 2012, 20, t(9, 6, 8, 10, 4, 7), { loyalty: 92 }),
  q('udinese', 'sanchez_ita', 'Alexis Sánchez', 1988, 'Chile', ['RW', 'ST'], 70, 87, 2011, 20, t(8, 7, 9, 7, 6, 8)),
  q('juventus', 'pogba_ita', 'Paul Pogba', 1993, 'France', ['CM'], 70, 90, 2016, 20, t(7, 8, 9, 7, 6, 8)),
  q('napoli', 'insigne_ita', 'Lorenzo Insigne', 1991, 'Italy', ['LW', 'AM'], 64, 86, 2015, 20, t(8, 6, 8, 9, 5, 7)),
  q('inter', 'barella_ita', 'Nicolò Barella', 1997, 'Italy', ['CM'], 66, 88, 2024, 15, t(9, 7, 9, 8, 5, 8)),
  q('fiorentina', 'chiesa_ita', 'Federico Chiesa', 1997, 'Italy', ['RW', 'LW'], 66, 88, 2022, 25, t(8, 6, 9, 8, 5, 8)),
  q('milan', 'tonali_ita', 'Sandro Tonali', 2000, 'Italy', ['DM', 'CM'], 66, 88, 2025, 15, t(9, 6, 9, 8, 4, 8)),
  q('roma', 'zaniolo_ita', 'Nicolò Zaniolo', 1999, 'Italy', ['AM', 'RW'], 64, 86, 2024, 30, t(6, 7, 8, 7, 6, 8)),
  q('juventus', 'kean_ita', 'Moise Kean', 2000, 'Italy', ['ST'], 62, 85, 2025, 20, t(7, 7, 8, 7, 6, 8)),
];

export const INTAKES_ITA: AcademyIntake[] = [
  { clubId: 'roma', year: 1996, playerId: 'cur_totti_ita' },
  { clubId: 'parma', year: 1997, playerId: 'cur_buffon_ita' },
  { clubId: 'roma', year: 2001, playerId: 'cur_cassano_ita' },
  { clubId: 'parma', year: 2002, playerId: 'cur_gilardino_ita' },
  { clubId: 'roma', year: 2003, playerId: 'cur_de_rossi_ita' },
  { clubId: 'fiorentina', year: 2004, playerId: 'cur_chiellini_ita' },
  { clubId: 'milan', year: 2003, playerId: 'cur_kaka_ita' },
  { clubId: 'juventus', year: 2007, playerId: 'cur_marchisio_ita' },
  { clubId: 'udinese', year: 2008, playerId: 'cur_sanchez_ita' },
  { clubId: 'napoli', year: 2011, playerId: 'cur_insigne_ita' },
  { clubId: 'juventus', year: 2012, playerId: 'cur_pogba_ita' },
  { clubId: 'fiorentina', year: 2016, playerId: 'cur_chiesa_ita' },
  { clubId: 'roma', year: 2018, playerId: 'cur_zaniolo_ita' },
  { clubId: 'inter', year: 2019, playerId: 'cur_barella_ita' },
  { clubId: 'juventus', year: 2017, playerId: 'cur_kean_ita' },
  { clubId: 'milan', year: 2020, playerId: 'cur_tonali_ita' },
];
