/**
 * Academy graduates — the real next generation for the Bundesliga eras (era-
 * bundesliga-1997 / -1998 / -2009 / -2012). Real German-league breakthroughs
 * 1998-2025 at clubs present in those worlds, injected at their debut window by
 * INTAKES_GER. Each era fires only its in-span intakes; a name already present is
 * skipped. Ratings are HIDDEN designer estimates (§7).
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

export const GRADUATES_GER: CuratedSeed[] = [
  q('bayern', 'schweinsteiger_ger', 'Bastian Schweinsteiger', 1984, 'Germany', ['CM', 'DM'], 62, 88, 2008, 20, t(9, 6, 9, 9, 5, 8)),
  q('bayern', 'lahm_ger', 'Philipp Lahm', 1983, 'Germany', ['RB', 'LB'], 64, 89, 2009, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 95 }),
  q('koln', 'podolski_ger', 'Lukas Podolski', 1985, 'Germany', ['ST', 'LW'], 66, 85, 2006, 20, t(8, 6, 8, 8, 5, 8)),
  q('schalke', 'neuer_ger', 'Manuel Neuer', 1986, 'Germany', ['GK'], 66, 91, 2011, 15, t(10, 6, 9, 8, 4, 8)),
  q('bayern', 'kroos_ger', 'Toni Kroos', 1990, 'Germany', ['CM', 'AM'], 60, 90, 2013, 15, t(10, 5, 9, 8, 4, 8)),
  q('bayern', 'muller_ger', 'Thomas Müller', 1989, 'Germany', ['AM', 'RW', 'ST'], 62, 89, 2014, 15, t(9, 6, 9, 10, 4, 8), { loyalty: 94 }),
  q('werder', 'ozil_ger', 'Mesut Özil', 1988, 'Germany', ['AM'], 66, 88, 2011, 20, t(8, 6, 9, 7, 4, 8)),
  q('dortmund', 'hummels_ger', 'Mats Hummels', 1988, 'Germany', ['CB'], 66, 89, 2013, 20, t(9, 6, 9, 8, 5, 8)),
  q('dortmund', 'gundogan_ger', 'İlkay Gündoğan', 1990, 'Germany', ['CM', 'DM'], 64, 88, 2015, 25, t(9, 6, 9, 8, 5, 8)),
  q('gladbach', 'reus_ger', 'Marco Reus', 1989, 'Germany', ['LW', 'AM'], 68, 88, 2014, 30, t(8, 6, 9, 9, 5, 8)),
  q('schalke', 'draxler_ger', 'Julian Draxler', 1993, 'Germany', ['AM', 'LW'], 62, 86, 2016, 20, t(8, 6, 8, 7, 5, 8)),
  q('schalke', 'sane_ger', 'Leroy Sané', 1996, 'Germany', ['LW', 'RW'], 64, 88, 2019, 20, t(7, 7, 8, 7, 5, 8)),
  q('stuttgart', 'werner_ger', 'Timo Werner', 1996, 'Germany', ['ST'], 62, 86, 2019, 20, t(8, 6, 8, 8, 5, 8)),
  q('leverkusen', 'havertz_ger', 'Kai Havertz', 1999, 'Germany', ['AM', 'ST'], 66, 89, 2023, 20, t(9, 6, 9, 8, 4, 8)),
  q('dortmund', 'sancho_ger', 'Jadon Sancho', 2000, 'England', ['RW', 'LW'], 66, 88, 2023, 20, t(6, 7, 8, 6, 6, 8)),
  q('dortmund', 'haaland_ger', 'Erling Haaland', 2000, 'Norway', ['ST'], 82, 93, 2024, 15, t(9, 7, 10, 8, 4, 8)),
  q('dortmund', 'bellingham_ger', 'Jude Bellingham', 2003, 'England', ['CM', 'AM'], 70, 93, 2025, 15, t(9, 7, 10, 8, 4, 8)),
  q('bayern', 'musiala_ger', 'Jamal Musiala', 2003, 'Germany', ['AM'], 64, 91, 2026, 15, t(9, 6, 9, 9, 4, 8)),
  q('leverkusen', 'wirtz_ger', 'Florian Wirtz', 2003, 'Germany', ['AM'], 66, 92, 2027, 20, t(10, 6, 9, 9, 4, 8)),

  // ── Squad-depth Bundesliga academy products (2004-2011) ──
  // Real breakthroughs beyond the marquee names — Stuttgart's and Dortmund's famous
  // youth lines, Bayern's Alaba, Gladbach's ter Stegen — the home-grown spine that
  // keeps the German world real over a long save.
  q('stuttgart', 'gomez_ger', 'Mario Gómez', 1985, 'Germany', ['ST'], 64, 84, 2008, 20, t(8, 6, 8, 7, 5, 7)),
  q('dortmund', 'sahin_ger', 'Nuri Şahin', 1988, 'Turkey', ['CM'], 62, 84, 2009, 25, t(8, 6, 8, 8, 5, 7)),
  q('stuttgart', 'khedira_ger', 'Sami Khedira', 1987, 'Germany', ['CM', 'DM'], 62, 85, 2010, 25, t(9, 6, 9, 7, 4, 8)),
  q('hertha', 'boateng_ger', 'Jérôme Boateng', 1988, 'Germany', ['CB'], 62, 85, 2010, 25, t(7, 6, 8, 6, 5, 7)),
  q('schalke', 'howedes_ger', 'Benedikt Höwedes', 1988, 'Germany', ['CB'], 60, 82, 2011, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
  q('bayern', 'alaba_ger', 'David Alaba', 1992, 'Austria', ['LB', 'CM'], 62, 87, 2015, 15, t(9, 6, 9, 9, 4, 8)),
  q('dortmund', 'gotze_ger', 'Mario Götze', 1992, 'Germany', ['AM'], 62, 87, 2015, 30, t(7, 6, 8, 7, 5, 8)),
  q('gladbach', 'terstegen_ger', 'Marc-André ter Stegen', 1992, 'Germany', ['GK'], 62, 88, 2015, 15, t(9, 6, 9, 8, 4, 8)),
];

export const INTAKES_GER: AcademyIntake[] = [
  { clubId: 'bayern', year: 2002, playerId: 'cur_schweinsteiger_ger' },
  { clubId: 'bayern', year: 2003, playerId: 'cur_lahm_ger' },
  { clubId: 'koln', year: 2004, playerId: 'cur_podolski_ger' },
  { clubId: 'schalke', year: 2006, playerId: 'cur_neuer_ger' },
  { clubId: 'bayern', year: 2008, playerId: 'cur_kroos_ger' },
  { clubId: 'werder', year: 2008, playerId: 'cur_ozil_ger' },
  { clubId: 'bayern', year: 2009, playerId: 'cur_muller_ger' },
  { clubId: 'dortmund', year: 2009, playerId: 'cur_hummels_ger' },
  { clubId: 'dortmund', year: 2011, playerId: 'cur_gundogan_ger' },
  { clubId: 'gladbach', year: 2011, playerId: 'cur_reus_ger' },
  { clubId: 'schalke', year: 2012, playerId: 'cur_draxler_ger' },
  { clubId: 'stuttgart', year: 2014, playerId: 'cur_werner_ger' },
  { clubId: 'schalke', year: 2015, playerId: 'cur_sane_ger' },
  { clubId: 'leverkusen', year: 2017, playerId: 'cur_havertz_ger' },
  { clubId: 'dortmund', year: 2017, playerId: 'cur_sancho_ger' },
  { clubId: 'dortmund', year: 2020, playerId: 'cur_haaland_ger' },
  { clubId: 'dortmund', year: 2020, playerId: 'cur_bellingham_ger' },
  { clubId: 'bayern', year: 2021, playerId: 'cur_musiala_ger' },
  { clubId: 'leverkusen', year: 2021, playerId: 'cur_wirtz_ger' },

  // ── Squad-depth academy products, at their real debut years ──
  { clubId: 'stuttgart', year: 2004, playerId: 'cur_gomez_ger' },
  { clubId: 'dortmund', year: 2005, playerId: 'cur_sahin_ger' },
  { clubId: 'stuttgart', year: 2006, playerId: 'cur_khedira_ger' },
  { clubId: 'hertha', year: 2007, playerId: 'cur_boateng_ger' },
  { clubId: 'schalke', year: 2007, playerId: 'cur_howedes_ger' },
  { clubId: 'bayern', year: 2010, playerId: 'cur_alaba_ger' },
  { clubId: 'dortmund', year: 2010, playerId: 'cur_gotze_ger' },
  { clubId: 'gladbach', year: 2011, playerId: 'cur_terstegen_ger' },
];
