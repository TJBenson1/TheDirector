/**
 * The modern elite (2011-2024 breakthroughs) — every player of genuine 80+
 * stature in the 2020s game, seeded so a long save reaching 2025 has a real
 * elite population rather than ageing into a thin, English-biased skeleton.
 *
 * Each is instantiated at the club he really emerged at (INTAKES_MODERN), grows
 * through the normal development system (§5), and then moves on emergently — the
 * ledger/market may carry him to his later clubs, or a diverging world may keep
 * him. Where a player's real breakthrough club isn't in the world, he is seeded
 * at the present club he genuinely became a star at instead; a handful of stars
 * whose only clubs are absent minor sides (RB Leipzig, Real Sociedad, Athletic
 * Bilbao) are placed at a present club they later played for. Ability/potential/
 * personality are HIDDEN designer estimates (§7); clubs, birth years, positions
 * and debut years are real.
 *
 * Merged into the shared GRADUATES_1999 / INTAKES_1999 pool, so ANY era whose
 * window reaches the 2010s-20s is repopulated — dedup-safe against later-start
 * kickoff squads via the name/id guard in executeAcademyIntakes.
 */

import type { HardBlock, PlayerState, Position } from '../types.js';
import type { ClubId } from '../types.js';
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

/** id → real debut club + year, driving instantiation. */
const g: Array<[CuratedSeed, ClubId, number]> = [
  // ── Goalkeepers ──
  [q('liverpool', 'alisson_m', 'Alisson', 1992, 'Brazil', ['GK'], 82, 88, 2027, 15, t(9, 6, 9, 8, 3, 8)), 'liverpool', 2018],
  [q('benfica', 'ederson_m', 'Ederson', 1993, 'Brazil', ['GK'], 78, 86, 2022, 15, t(8, 6, 8, 7, 4, 8)), 'benfica', 2015],
  [q('atletico', 'courtois_m', 'Thibaut Courtois', 1992, 'Belgium', ['GK'], 74, 89, 2018, 15, t(9, 6, 9, 7, 4, 8)), 'atletico', 2011],
  [q('milan', 'donnarumma_m', 'Gianluigi Donnarumma', 1999, 'Italy', ['GK'], 66, 90, 2021, 15, t(8, 6, 9, 7, 5, 7)), 'milan', 2015],
  [q('barcelona', 'terstegen_m', 'Marc-André ter Stegen', 1992, 'Germany', ['GK'], 78, 88, 2025, 15, t(9, 6, 8, 8, 4, 8)), 'barcelona', 2014],
  [q('ajax', 'onana_m', 'André Onana', 1996, 'Cameroon', ['GK'], 70, 85, 2022, 20, t(7, 7, 9, 6, 6, 8)), 'ajax', 2016],
  [q('atletico', 'oblak_m', 'Jan Oblak', 1993, 'Slovenia', ['GK'], 74, 89, 2023, 15, t(9, 5, 8, 8, 3, 7)), 'atletico', 2014],

  // ── Defenders ──
  [q('benfica', 'rubendias_m', 'Rúben Dias', 1997, 'Portugal', ['CB'], 74, 88, 2025, 15, t(10, 6, 9, 8, 4, 8)), 'benfica', 2017],
  [q('psg', 'marquinhos_m', 'Marquinhos', 1994, 'Brazil', ['CB', 'DM'], 72, 88, 2024, 15, t(9, 6, 9, 8, 4, 8)), 'psg', 2013],
  [q('porto', 'militao_m', 'Éder Militão', 1998, 'Brazil', ['CB', 'RB'], 72, 86, 2024, 20, t(9, 6, 8, 7, 4, 8)), 'porto', 2018],
  [q('atletico', 'theo_m', 'Theo Hernández', 1997, 'France', ['LB'], 68, 86, 2028, 20, t(7, 7, 9, 6, 5, 8)), 'atletico', 2016],
  [q('bayern', 'davies_m', 'Alphonso Davies', 2000, 'Canada', ['LB', 'LW'], 66, 88, 2025, 20, t(8, 7, 9, 7, 5, 8)), 'bayern', 2019],
  [q('real_madrid', 'hakimi_m', 'Achraf Hakimi', 1998, 'Morocco', ['RB'], 68, 86, 2026, 15, t(8, 6, 9, 6, 5, 8)), 'real_madrid', 2017],
  [q('inter', 'bastoni_m', 'Alessandro Bastoni', 1999, 'Italy', ['CB'], 70, 86, 2028, 15, t(9, 5, 8, 8, 4, 8)), 'inter', 2019],
  [q('chelsea', 'rudiger_m', 'Antonio Rüdiger', 1993, 'Germany', ['CB'], 76, 84, 2022, 20, t(8, 7, 9, 7, 6, 8)), 'chelsea', 2017],
  [q('barcelona', 'araujo_m', 'Ronald Araújo', 1999, 'Uruguay', ['CB', 'RB'], 70, 86, 2026, 20, t(9, 6, 8, 8, 5, 8)), 'barcelona', 2020],
  [q('barcelona', 'kounde_m', 'Jules Koundé', 1998, 'France', ['CB', 'RB'], 78, 85, 2027, 15, t(9, 6, 8, 7, 4, 8)), 'barcelona', 2022],
  [q('arsenal', 'saliba_m', 'William Saliba', 2001, 'France', ['CB'], 74, 88, 2027, 15, t(9, 6, 8, 8, 4, 8)), 'arsenal', 2022],
  [q('arsenal', 'gabriel_m', 'Gabriel Magalhães', 1997, 'Brazil', ['CB'], 74, 84, 2027, 15, t(9, 6, 8, 8, 5, 8)), 'arsenal', 2020],
  [q('man_city', 'gvardiol_m', 'Joško Gvardiol', 2002, 'Croatia', ['CB', 'LB'], 78, 88, 2028, 15, t(9, 6, 9, 7, 4, 8)), 'man_city', 2023],
  [q('juventus', 'bremer_m', 'Gleison Bremer', 1997, 'Brazil', ['CB'], 78, 83, 2028, 20, t(9, 6, 8, 7, 5, 8)), 'juventus', 2022],
  [q('arsenal', 'calafiori_m', 'Riccardo Calafiori', 2002, 'Italy', ['CB', 'LB'], 76, 85, 2028, 25, t(8, 6, 8, 7, 5, 8)), 'arsenal', 2024],
  [q('benfica', 'cancelo_m', 'João Cancelo', 1994, 'Portugal', ['RB', 'LB'], 72, 86, 2022, 20, t(7, 7, 9, 6, 6, 8)), 'benfica', 2014],
  [q('barcelona', 'cubarsi_m', 'Pau Cubarsí', 2007, 'Spain', ['CB'], 64, 88, 2027, 15, t(9, 5, 8, 8, 4, 8)), 'barcelona', 2024],

  // ── Midfielders ──
  [q('man_city', 'rodri_m', 'Rodri', 1996, 'Spain', ['DM'], 80, 90, 2027, 15, t(10, 5, 9, 8, 3, 8)), 'man_city', 2019],
  [q('real_madrid', 'odegaard_m', 'Martin Ødegaard', 1998, 'Norway', ['AM', 'CM'], 62, 88, 2028, 15, t(9, 6, 9, 7, 4, 8)), 'real_madrid', 2015],
  [q('real_madrid', 'valverde_m', 'Federico Valverde', 1998, 'Uruguay', ['CM', 'RW'], 70, 88, 2027, 15, t(10, 5, 9, 9, 4, 8)), 'real_madrid', 2018],
  [q('monaco', 'tchouameni_m', 'Aurélien Tchouaméni', 2000, 'France', ['DM', 'CM'], 72, 88, 2028, 15, t(9, 6, 9, 7, 4, 8)), 'monaco', 2020],
  [q('bayern', 'kimmich_m', 'Joshua Kimmich', 1995, 'Germany', ['RB', 'DM', 'CM'], 74, 89, 2025, 15, t(10, 6, 9, 8, 4, 8)), 'bayern', 2015],
  [q('porto', 'vitinha_m', 'Vitinha', 2000, 'Portugal', ['CM'], 70, 86, 2027, 15, t(9, 5, 9, 7, 4, 8)), 'porto', 2020],
  [q('inter', 'barella_m', 'Nicolò Barella', 1997, 'Italy', ['CM'], 76, 87, 2026, 15, t(9, 6, 9, 8, 5, 8)), 'inter', 2019],
  [q('milan', 'calhanoglu_m', 'Hakan Çalhanoğlu', 1994, 'Turkey', ['CM', 'AM', 'DM'], 78, 85, 2024, 15, t(8, 6, 9, 6, 5, 8)), 'milan', 2017],
  [q('ajax', 'dejong_m', 'Frenkie de Jong', 1997, 'Netherlands', ['CM', 'DM'], 76, 88, 2026, 15, t(9, 6, 8, 7, 4, 8)), 'ajax', 2018],
  [q('newcastle', 'brunog_m', 'Bruno Guimarães', 1997, 'Brazil', ['CM', 'DM'], 78, 85, 2028, 15, t(9, 6, 9, 7, 5, 8)), 'newcastle', 2022],
  [q('benfica', 'enzo_m', 'Enzo Fernández', 2001, 'Argentina', ['CM'], 76, 87, 2027, 15, t(9, 6, 9, 7, 4, 8)), 'benfica', 2022],
  [q('liverpool', 'macallister_m', 'Alexis Mac Allister', 1998, 'Argentina', ['CM', 'AM'], 78, 84, 2028, 15, t(9, 6, 8, 8, 4, 8)), 'liverpool', 2023],
  [q('liverpool', 'szoboszlai_m', 'Dominik Szoboszlai', 2000, 'Hungary', ['AM', 'CM'], 78, 86, 2028, 15, t(9, 6, 9, 7, 5, 8)), 'liverpool', 2023],
  [q('milan', 'tonali_m', 'Sandro Tonali', 2000, 'Italy', ['DM', 'CM'], 72, 86, 2026, 15, t(8, 6, 8, 7, 5, 8)), 'milan', 2020],
  [q('chelsea', 'caicedo_m', 'Moisés Caicedo', 2001, 'Ecuador', ['DM', 'CM'], 78, 87, 2031, 15, t(9, 6, 9, 7, 4, 8)), 'chelsea', 2023],
  [q('leverkusen', 'wirtz_m', 'Florian Wirtz', 2003, 'Germany', ['AM', 'CM'], 64, 92, 2027, 20, t(9, 6, 9, 8, 4, 8)), 'leverkusen', 2020],
  [q('man_utd', 'mctominay_m', 'Scott McTominay', 1996, 'Scotland', ['CM'], 66, 82, 2025, 20, t(9, 5, 8, 9, 4, 7)), 'man_utd', 2017],

  // ── Forwards & wingers ──
  [q('inter', 'lautaro_m', 'Lautaro Martínez', 1997, 'Argentina', ['ST'], 74, 88, 2026, 15, t(9, 7, 9, 8, 5, 8)), 'inter', 2018],
  [q('napoli', 'osimhen_m', 'Victor Osimhen', 1998, 'Nigeria', ['ST'], 78, 88, 2025, 20, t(8, 7, 9, 6, 6, 8)), 'napoli', 2020],
  [q('napoli', 'kvara_m', 'Khvicha Kvaratskhelia', 2001, 'Georgia', ['LW'], 78, 88, 2027, 15, t(8, 7, 9, 7, 5, 8)), 'napoli', 2022],
  [q('sporting', 'leao_m', 'Rafael Leão', 1999, 'Portugal', ['LW'], 68, 87, 2024, 15, t(7, 7, 9, 6, 6, 8)), 'sporting', 2018],
  [q('dortmund', 'dembele_m', 'Ousmane Dembélé', 1997, 'France', ['RW', 'LW'], 74, 89, 2016, 30, t(6, 7, 9, 5, 7, 8)), 'dortmund', 2016],
  [q('newcastle', 'isak_m', 'Alexander Isak', 1999, 'Sweden', ['ST'], 72, 87, 2028, 20, t(8, 6, 9, 7, 5, 8)), 'newcastle', 2022],
  [q('atletico', 'griezmann_m', 'Antoine Griezmann', 1991, 'France', ['ST', 'AM'], 80, 88, 2018, 15, t(9, 6, 9, 7, 4, 8)), 'atletico', 2014],
  [q('man_city', 'julian_m', 'Julián Álvarez', 2000, 'Argentina', ['ST', 'AM'], 74, 87, 2028, 15, t(9, 6, 9, 8, 4, 8)), 'man_city', 2022],
  [q('benfica', 'nunez_m', 'Darwin Núñez', 1999, 'Uruguay', ['ST'], 72, 85, 2028, 20, t(7, 7, 9, 6, 6, 8)), 'benfica', 2020],
  [q('man_utd', 'hojlund_m', 'Rasmus Højlund', 2003, 'Denmark', ['ST'], 74, 86, 2028, 20, t(8, 6, 9, 7, 5, 8)), 'man_utd', 2023],
  [q('sporting', 'raphinha_m', 'Raphinha', 1996, 'Brazil', ['RW', 'LW'], 70, 85, 2024, 15, t(8, 6, 9, 7, 5, 8)), 'sporting', 2018],
  [q('sporting', 'gyokeres_m', 'Viktor Gyökeres', 1998, 'Sweden', ['ST'], 80, 85, 2028, 15, t(9, 7, 9, 7, 5, 8)), 'sporting', 2023],
  [q('juventus', 'vlahovic_m', 'Dušan Vlahović', 2000, 'Serbia', ['ST'], 78, 86, 2026, 15, t(8, 7, 9, 6, 5, 8)), 'juventus', 2022],
  [q('psg', 'nkunku_m', 'Christopher Nkunku', 1997, 'France', ['AM', 'ST'], 68, 86, 2016, 20, t(8, 6, 9, 6, 5, 8)), 'psg', 2017],
  [q('ajax', 'kudus_m', 'Mohammed Kudus', 2000, 'Ghana', ['AM', 'RW'], 70, 85, 2025, 20, t(8, 6, 9, 6, 5, 8)), 'ajax', 2020],
  [q('spurs', 'son_m', 'Son Heung-min', 1992, 'South Korea', ['LW', 'ST'], 74, 87, 2028, 15, t(9, 6, 9, 8, 4, 8)), 'spurs', 2015],
  [q('aston_villa', 'watkins_m', 'Ollie Watkins', 1995, 'England', ['ST'], 76, 84, 2028, 15, t(9, 6, 9, 8, 4, 8)), 'aston_villa', 2020],
  [q('real_madrid', 'rodrygo_m', 'Rodrygo', 2001, 'Brazil', ['RW', 'LW'], 68, 87, 2027, 15, t(9, 6, 9, 7, 4, 8)), 'real_madrid', 2019],
  [q('juventus', 'chiesa_m', 'Federico Chiesa', 1997, 'Italy', ['RW', 'LW'], 76, 85, 2025, 25, t(8, 6, 9, 7, 5, 8)), 'juventus', 2020],
  [q('monaco', 'bernardo_m', 'Bernardo Silva', 1994, 'Portugal', ['AM', 'RW', 'CM'], 74, 88, 2017, 15, t(9, 6, 9, 8, 4, 8)), 'monaco', 2015],
  [q('barcelona', 'olmo_m', 'Dani Olmo', 1998, 'Spain', ['AM', 'CM'], 80, 85, 2029, 20, t(9, 6, 9, 7, 5, 8)), 'barcelona', 2024],

  // ── Napoli depth (rebuilding the club into the world at their real years) ──
  [q('napoli', 'dilorenzo_m', 'Giovanni Di Lorenzo', 1993, 'Italy', ['RB', 'CB'], 76, 82, 2028, 15, t(9, 5, 8, 8, 4, 8)), 'napoli', 2019],
  [q('napoli', 'lobotka_m', 'Stanislav Lobotka', 1994, 'Slovakia', ['DM', 'CM'], 76, 83, 2027, 15, t(9, 5, 8, 7, 4, 8)), 'napoli', 2020],
  [q('napoli', 'anguissa_m', 'André-Frank Zambo Anguissa', 1995, 'Cameroon', ['CM', 'DM'], 76, 83, 2027, 15, t(8, 6, 8, 7, 5, 8)), 'napoli', 2021],
];

export const MODERN_GRADS: CuratedSeed[] = g.map(([seed]) => seed);
export const MODERN_INTAKES: AcademyIntake[] = g.map(([seed, clubId, year]) => ({ clubId, year, playerId: seed.id }));
