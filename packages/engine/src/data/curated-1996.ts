/**
 * Curated real players — 1996 "Arrival of Wenger" pack (§4, §17.10).
 *
 * The vertical slice for "Arsenal — 1996": the 1996–97 season as it really was —
 * Wenger's revolution just beginning (Vieira in, Petit/Overmars/Anelka to come),
 * United's title machine, Keegan/Dalglish Newcastle spending big on Shearer, and on
 * the continent a young Ronaldo at Robson's Barça, Zidane's first year at the
 * Scudetto-and-CL-final Juventus, and Capello's Real. Ability/potential/personality
 * are HIDDEN designer estimates (§7); clubs, birth years, positions and contracts
 * are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { EUROPE_MID90S_SQUADS } from './curated-europe-mid90s.js';
import { ENG_DOMESTIC_1996_SQUADS } from './curated-eng-domestic-1996.js';

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

// ── Arsenal, 1996–97 — Wenger arrives; Vieira in, the Invincibles a distant seed ─
export const ARSENAL_1996: CuratedSeed[] = [
  q('arsenal', 'seaman_a96', 'David Seaman', 1963, 'England', ['GK'], 84, 84, 2000, 25, t(8, 6, 8, 9, 3, 6)),
  q('arsenal', 'dixon_a96', 'Lee Dixon', 1964, 'England', ['RB'], 78, 78, 1999, 25, t(9, 4, 7, 9, 3, 6)),
  q('arsenal', 'adams_a96', 'Tony Adams', 1966, 'England', ['CB'], 85, 85, 2000, 30, t(9, 7, 9, 10, 5, 6), { loyalty: 97 }),
  q('arsenal', 'bould_a96', 'Steve Bould', 1962, 'England', ['CB'], 79, 79, 1998, 30, t(8, 4, 7, 8, 4, 6)),
  q('arsenal', 'winterburn_a96', 'Nigel Winterburn', 1963, 'England', ['LB'], 78, 78, 2000, 25, t(9, 4, 7, 9, 3, 6)),
  q('arsenal', 'keown_a96', 'Martin Keown', 1966, 'England', ['CB'], 80, 81, 2000, 30, t(8, 6, 8, 9, 5, 6)),
  q('arsenal', 'vieira_a96', 'Patrick Vieira', 1976, 'France', ['CM', 'DM'], 82, 90, 2002, 25, t(8, 7, 9, 7, 6, 8)),
  q('arsenal', 'platt_a96', 'David Platt', 1966, 'England', ['CM', 'AM'], 81, 81, 1999, 30, t(9, 6, 8, 8, 4, 7)),
  q('arsenal', 'merson_a96', 'Paul Merson', 1968, 'England', ['AM', 'ST'], 80, 81, 1999, 30, t(5, 7, 7, 7, 7, 6)),
  q('arsenal', 'parlour_a96', 'Ray Parlour', 1973, 'England', ['CM', 'RW'], 76, 80, 2001, 25, t(8, 5, 7, 8, 5, 7)),
  q('arsenal', 'wright_a96', 'Ian Wright', 1963, 'England', ['ST'], 85, 85, 1999, 30, t(7, 8, 9, 9, 6, 6)),
  q('arsenal', 'bergkamp_a96', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 87, 89, 2000, 20, t(9, 6, 8, 8, 3, 6)),
  q('arsenal', 'hartson_a96', 'John Hartson', 1975, 'Wales', ['ST'], 76, 79, 1999, 35, t(6, 7, 7, 6, 7, 6)),
  q('arsenal', 'anelka_a96', 'Nicolas Anelka', 1979, 'France', ['ST'], 68, 88, 2001, 30, t(6, 8, 8, 4, 6, 6)),
  // Real 1996-97 depth to the era minimum (Lukic back as Seaman's deputy; Garde,
  // one of Wenger's first French imports, in midfield).
  q('arsenal', 'lukic_a96', 'John Lukic', 1960, 'England', ['GK'], 76, 76, 1999, 25, t(8, 4, 7, 8, 4, 6)),
  q('arsenal', 'garde_a96', 'Rémi Garde', 1966, 'France', ['DM', 'CM'], 76, 77, 1999, 30, t(8, 4, 7, 7, 4, 7)),
];

// ── Manchester United, 1996–97 (champions; Cantona's last season) ─────────────
export const MANUTD_1996: CuratedSeed[] = [
  q('man_utd', 'schmeichel_u96', 'Peter Schmeichel', 1963, 'Denmark', ['GK'], 89, 89, 1999, 20, t(9, 7, 9, 8, 5, 6)),
  q('man_utd', 'gneville_u96', 'Gary Neville', 1975, 'England', ['RB'], 79, 84, 2002, 25, t(9, 5, 8, 10, 4, 7), { loyalty: 94 }),
  q('man_utd', 'irwin_u96', 'Denis Irwin', 1965, 'Ireland', ['LB', 'RB'], 82, 82, 2000, 22, t(9, 3, 7, 9, 2, 8)),
  q('man_utd', 'pallister_u96', 'Gary Pallister', 1965, 'England', ['CB'], 84, 84, 1999, 25, t(8, 5, 7, 8, 3, 7)),
  q('man_utd', 'johnsen_u96', 'Ronny Johnsen', 1969, 'Norway', ['CB', 'DM'], 79, 80, 2000, 55, t(8, 4, 7, 7, 3, 7)),
  q('man_utd', 'may_u96', 'David May', 1970, 'England', ['CB'], 74, 76, 1999, 35, t(6, 6, 6, 7, 5, 6)),
  q('man_utd', 'pneville_u96', 'Phil Neville', 1977, 'England', ['LB', 'CM'], 74, 82, 2002, 25, t(8, 4, 7, 9, 3, 8)),
  q('man_utd', 'keane_u96', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 87, 90, 2000, 40, t(9, 7, 10, 8, 8, 6)),
  q('man_utd', 'butt_u96', 'Nicky Butt', 1975, 'England', ['CM', 'DM'], 78, 82, 2001, 25, t(8, 4, 7, 9, 4, 7)),
  q('man_utd', 'beckham_u96', 'David Beckham', 1975, 'England', ['RW', 'CM'], 82, 90, 2002, 20, t(9, 7, 9, 8, 4, 7)),
  q('man_utd', 'giggs_u96', 'Ryan Giggs', 1973, 'Wales', ['LW'], 86, 88, 2001, 30, t(9, 5, 8, 10, 3, 7), { loyalty: 95 }),
  q('man_utd', 'scholes_u96', 'Paul Scholes', 1974, 'England', ['CM', 'ST'], 80, 90, 2001, 20, t(9, 3, 8, 10, 5, 7), { loyalty: 95 }),
  q('man_utd', 'cantona_u96', 'Eric Cantona', 1966, 'France', ['AM', 'ST'], 89, 89, 1998, 25, t(7, 9, 9, 8, 8, 7)),
  q('man_utd', 'cole_u96', 'Andy Cole', 1971, 'England', ['ST'], 83, 84, 1999, 30, t(7, 7, 8, 7, 6, 6)),
  q('man_utd', 'solskjaer_u96', 'Ole Gunnar Solskjær', 1973, 'Norway', ['ST'], 80, 83, 2000, 25, t(9, 4, 8, 9, 3, 7)),
];

// ── Liverpool, 1996–97 (Roy Evans; the "Spice Boys") ──────────────────────────
export const LIVERPOOL_1996: CuratedSeed[] = [
  q('liverpool', 'james_l96', 'David James', 1970, 'England', ['GK'], 80, 82, 2000, 30, t(6, 6, 7, 7, 6, 6)),
  q('liverpool', 'mcateer_l96', 'Jason McAteer', 1971, 'Ireland', ['RB', 'CM'], 77, 79, 2000, 30, t(7, 5, 7, 7, 5, 7)),
  q('liverpool', 'rjones_l96', 'Rob Jones', 1971, 'England', ['RB'], 77, 79, 1999, 45, t(8, 4, 7, 9, 4, 7)),
  q('liverpool', 'mwright_l96', 'Mark Wright', 1963, 'England', ['CB'], 80, 80, 1998, 35, t(8, 5, 7, 7, 5, 6)),
  q('liverpool', 'ruddock_l96', 'Neil Ruddock', 1968, 'England', ['CB'], 77, 78, 1998, 40, t(6, 6, 7, 7, 7, 6)),
  q('liverpool', 'bjornebye_l96', 'Stig Inge Bjørnebye', 1969, 'Norway', ['LB'], 76, 78, 1999, 30, t(8, 4, 7, 7, 4, 7)),
  q('liverpool', 'matteo_l96', 'Dominic Matteo', 1974, 'Scotland', ['CB', 'LB'], 74, 79, 2000, 30, t(8, 4, 7, 7, 4, 7)),
  q('liverpool', 'redknapp_l96', 'Jamie Redknapp', 1973, 'England', ['CM'], 81, 84, 2001, 45, t(8, 5, 8, 8, 4, 7)),
  q('liverpool', 'barnes_l96', 'John Barnes', 1963, 'England', ['CM', 'AM'], 80, 81, 1998, 30, t(8, 6, 8, 9, 4, 7)),
  q('liverpool', 'mcmanaman_l96', 'Steve McManaman', 1972, 'England', ['RW', 'AM'], 84, 86, 1999, 25, t(7, 6, 7, 6, 4, 8)),
  q('liverpool', 'berger_l96', 'Patrik Berger', 1973, 'Czech Republic', ['LW', 'AM'], 79, 82, 2001, 40, t(7, 5, 7, 6, 5, 7)),
  q('liverpool', 'fowler_l96', 'Robbie Fowler', 1975, 'England', ['ST'], 85, 88, 2001, 35, t(6, 7, 8, 9, 6, 6)),
  q('liverpool', 'collymore_l96', 'Stan Collymore', 1971, 'England', ['ST'], 82, 84, 1999, 35, t(4, 8, 7, 5, 8, 5)),
  q('liverpool', 'thomas_l96', 'Michael Thomas', 1967, 'England', ['CM', 'DM'], 76, 77, 1998, 35, t(7, 5, 7, 7, 5, 7)),
];

// ── Chelsea, 1996–97 (Gullit player-manager; FA Cup winners) ──────────────────
export const CHELSEA_1996: CuratedSeed[] = [
  q('chelsea', 'grodas_c96', 'Frode Grodås', 1964, 'Norway', ['GK'], 76, 76, 1998, 25, t(7, 5, 6, 7, 5, 6)),
  // Real 1996–97 Chelsea: the Russian who was first-choice keeper before injury.
  q('chelsea', 'kharine96', 'Dmitri Kharine', 1968, 'Russia', ['GK'], 75, 76, 1998, 40, t(6, 4, 5, 7, 4, 6)),
  q('chelsea', 'petrescu_c96', 'Dan Petrescu', 1967, 'Romania', ['RB', 'RW'], 79, 80, 2000, 25, t(8, 5, 7, 6, 5, 7)),
  q('chelsea', 'leboeuf_c96', 'Frank Leboeuf', 1968, 'France', ['CB'], 81, 82, 2000, 25, t(8, 6, 7, 7, 5, 7)),
  q('chelsea', 'sinclair_c96', 'Frank Sinclair', 1971, 'Jamaica', ['CB', 'RB'], 76, 78, 1999, 25, t(7, 5, 7, 7, 5, 7)),
  q('chelsea', 'clarke_c96', 'Steve Clarke', 1963, 'Scotland', ['RB', 'CB'], 77, 77, 1998, 25, t(9, 4, 7, 9, 3, 6)),
  q('chelsea', 'minto_c96', 'Scott Minto', 1971, 'England', ['LB'], 73, 75, 1998, 30, t(7, 4, 6, 7, 5, 7)),
  q('chelsea', 'wise_c96', 'Dennis Wise', 1966, 'England', ['CM'], 79, 80, 2000, 25, t(7, 7, 8, 8, 7, 6)),
  q('chelsea', 'dimatteo_c96', 'Roberto Di Matteo', 1970, 'Italy', ['CM'], 81, 82, 2001, 25, t(8, 5, 8, 7, 4, 7)),
  q('chelsea', 'newton_c96', 'Eddie Newton', 1971, 'England', ['CM', 'DM'], 74, 76, 1999, 30, t(8, 4, 7, 8, 4, 7)),
  q('chelsea', 'gullit_c96', 'Ruud Gullit', 1962, 'Netherlands', ['AM', 'CB'], 80, 80, 1998, 30, t(8, 7, 8, 6, 5, 7)),
  // NB Gianfranco Zola is NOT here at kickoff — he arrives from Parma in November
  // 1996, as the briefing says. He lives at Parma (PARMA_1996) and joins via the
  // 1996 ledger; Gullit's summer cast (Vialli, Leboeuf, Di Matteo) is here already.
  q('chelsea', 'vialli_c96', 'Gianluca Vialli', 1964, 'Italy', ['ST'], 82, 82, 1999, 30, t(9, 7, 9, 7, 5, 7)),
  q('chelsea', 'hughes_c96', 'Mark Hughes', 1963, 'Wales', ['ST'], 79, 79, 1998, 30, t(8, 6, 7, 7, 6, 6)),
  q('chelsea', 'burley_c96', 'Craig Burley', 1971, 'Scotland', ['CM'], 75, 78, 1999, 25, t(8, 5, 7, 7, 5, 7)),
  // Real 1996-97 depth to the era minimum (Hitchcock deputising in goal; Duberry,
  // the young academy centre-half of Gullit's FA Cup side).
  q('chelsea', 'hitchcock_c96', 'Kevin Hitchcock', 1962, 'England', ['GK'], 74, 74, 1998, 25, t(8, 4, 6, 8, 4, 6)),
  q('chelsea', 'duberry_c96', 'Michael Duberry', 1975, 'England', ['CB'], 75, 79, 2000, 30, t(7, 5, 7, 7, 5, 7)),
];

// ── Newcastle United, 1996–97 (2nd; Shearer's world-record homecoming) ────────
export const NEWCASTLE_1996: CuratedSeed[] = [
  q('newcastle', 'srnicek_n96', 'Pavel Srníček', 1968, 'Czech Republic', ['GK'], 77, 78, 1999, 25, t(7, 5, 7, 7, 5, 6)),
  q('newcastle', 'watson_n96', 'Steve Watson', 1974, 'England', ['RB', 'CB'], 76, 79, 2000, 25, t(8, 4, 7, 8, 4, 7)),
  q('newcastle', 'albert_n96', 'Philippe Albert', 1967, 'Belgium', ['CB'], 81, 82, 1999, 30, t(8, 5, 7, 7, 4, 7)),
  q('newcastle', 'peacock_n96', 'Darren Peacock', 1967, 'England', ['CB'], 78, 78, 1999, 30, t(8, 4, 7, 7, 4, 6)),
  q('newcastle', 'beresford_n96', 'John Beresford', 1966, 'England', ['LB'], 76, 77, 1998, 30, t(8, 5, 7, 7, 5, 7)),
  q('newcastle', 'batty_n96', 'David Batty', 1968, 'England', ['DM', 'CM'], 80, 81, 2000, 35, t(8, 5, 8, 8, 6, 6)),
  q('newcastle', 'lee_n96', 'Robert Lee', 1966, 'England', ['CM', 'RW'], 80, 81, 1999, 25, t(8, 5, 8, 8, 4, 6)),
  q('newcastle', 'gillespie_n96', 'Keith Gillespie', 1975, 'Northern Ireland', ['RW'], 76, 80, 2000, 30, t(6, 6, 7, 6, 6, 7)),
  q('newcastle', 'ginola_n96', 'David Ginola', 1967, 'France', ['LW'], 82, 83, 1999, 30, t(6, 7, 7, 6, 6, 6)),
  q('newcastle', 'beardsley_n96', 'Peter Beardsley', 1961, 'England', ['AM', 'ST'], 80, 80, 1998, 25, t(9, 5, 7, 9, 4, 6)),
  q('newcastle', 'shearer_n96', 'Alan Shearer', 1970, 'England', ['ST'], 89, 90, 2001, 35, t(9, 7, 9, 10, 4, 6), { loyalty: 94 }),
  q('newcastle', 'ferdinand_n96', 'Les Ferdinand', 1966, 'England', ['ST'], 83, 84, 1999, 30, t(8, 6, 8, 7, 5, 6)),
  q('newcastle', 'asprilla_n96', 'Faustino Asprilla', 1969, 'Colombia', ['ST', 'AM'], 82, 84, 1999, 30, t(5, 8, 7, 5, 8, 6)),
  q('newcastle', 'elliott_n96', 'Robbie Elliott', 1973, 'England', ['LB', 'CB'], 74, 77, 2000, 30, t(8, 4, 7, 8, 4, 7)),
];

// ── Real Madrid, 1996–97 (Capello; La Liga champions) ─────────────────────────
export const REAL_1996: CuratedSeed[] = [
  q('real_madrid', 'illgner_r96', 'Bodo Illgner', 1967, 'Germany', ['GK'], 81, 82, 2000, 25, t(8, 5, 7, 7, 4, 7)),
  q('real_madrid', 'robertocarlos_r96', 'Roberto Carlos', 1973, 'Brazil', ['LB', 'LW'], 85, 88, 2001, 25, t(8, 6, 8, 8, 4, 8)),
  q('real_madrid', 'hierro_r96', 'Fernando Hierro', 1968, 'Spain', ['CB', 'DM'], 85, 86, 2001, 25, t(9, 6, 8, 9, 4, 6), { loyalty: 92 }),
  q('real_madrid', 'sanchis_r96', 'Manolo Sanchís', 1965, 'Spain', ['CB'], 81, 81, 1999, 25, t(9, 5, 7, 10, 3, 6), { loyalty: 95 }),
  q('real_madrid', 'fsanz_r96', 'Fernando Sanz', 1974, 'Spain', ['CB'], 74, 77, 2000, 25, t(8, 4, 7, 8, 4, 6)),
  q('real_madrid', 'redondo_r96', 'Fernando Redondo', 1969, 'Argentina', ['DM', 'CM'], 85, 86, 2000, 30, t(8, 5, 7, 6, 3, 7)),
  q('real_madrid', 'seedorf_r96', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 82, 87, 2001, 25, t(7, 7, 8, 5, 5, 8)),
  q('real_madrid', 'amavisca_r96', 'José Amavisca', 1971, 'Spain', ['LW', 'AM'], 76, 78, 1999, 30, t(7, 5, 7, 7, 5, 7)),
  q('real_madrid', 'raul_r96', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 82, 90, 2002, 20, t(9, 6, 9, 10, 3, 7), { loyalty: 93 }),
  q('real_madrid', 'suker_r96', 'Davor Šuker', 1968, 'Croatia', ['ST'], 84, 85, 2000, 30, t(7, 7, 8, 6, 5, 7)),
  q('real_madrid', 'mijatovic_r96', 'Predrag Mijatović', 1969, 'Montenegro', ['ST', 'AM'], 83, 84, 2000, 30, t(7, 7, 8, 6, 5, 7)),
  q('real_madrid', 'alkorta_r96', 'Rafael Alkorta', 1968, 'Spain', ['CB'], 79, 80, 1999, 25, t(8, 5, 7, 8, 4, 6)),
  q('real_madrid', 'guti_r96', 'Guti', 1976, 'Spain', ['AM', 'CM'], 68, 84, 2003, 25, t(6, 7, 7, 8, 6, 7)),
  q('real_madrid', 'panucci_r96', 'Christian Panucci', 1969, 'Italy', ['RB', 'CB'], 80, 82, 2000, 25, t(7, 6, 7, 6, 5, 7)),
];

// ── Barcelona, 1996–97 (Bobby Robson; a 20-year-old Ronaldo, 47 goals) ────────
export const BARCA_1996: CuratedSeed[] = [
  q('barcelona', 'baia_b96', 'Vítor Baía', 1969, 'Portugal', ['GK'], 82, 83, 2000, 25, t(8, 6, 7, 8, 5, 6)),
  q('barcelona', 'ferrer_b96', 'Albert Ferrer', 1970, 'Spain', ['RB'], 79, 80, 1999, 25, t(8, 4, 7, 8, 4, 7)),
  q('barcelona', 'abelardo_b96', 'Abelardo', 1970, 'Spain', ['CB'], 81, 82, 2000, 30, t(8, 5, 7, 8, 5, 6)),
  q('barcelona', 'nadal_b96', 'Miguel Ángel Nadal', 1966, 'Spain', ['CB', 'DM'], 81, 81, 1999, 30, t(8, 5, 7, 9, 5, 6)),
  q('barcelona', 'sergi_b96', 'Sergi Barjuán', 1971, 'Spain', ['LB'], 80, 81, 2000, 25, t(8, 5, 7, 9, 4, 7)),
  q('barcelona', 'couto_b96', 'Fernando Couto', 1969, 'Portugal', ['CB'], 78, 81, 2000, 25, t(7, 6, 7, 6, 5, 7)),
  q('barcelona', 'guardiola_b96', 'Pep Guardiola', 1971, 'Spain', ['DM', 'CM'], 83, 84, 2001, 25, t(9, 6, 8, 9, 3, 7)),
  q('barcelona', 'popescu_b96', 'Gheorghe Popescu', 1967, 'Romania', ['CB', 'DM'], 82, 82, 1999, 25, t(8, 5, 8, 6, 4, 7)),
  q('barcelona', 'luisenrique_b96', 'Luís Enrique', 1970, 'Spain', ['CM', 'RW', 'ST'], 83, 84, 2001, 30, t(9, 6, 9, 9, 4, 7)),
  q('barcelona', 'figo_b96', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 85, 89, 2001, 25, t(8, 7, 8, 6, 4, 7)),
  q('barcelona', 'ronaldo_b96', 'Ronaldo', 1976, 'Brazil', ['ST'], 90, 95, 2000, 55, t(6, 8, 9, 5, 6, 8)),
  q('barcelona', 'pizzi_b96', 'Juan Antonio Pizzi', 1968, 'Argentina', ['ST'], 80, 81, 1999, 30, t(7, 6, 7, 6, 5, 7)),
  q('barcelona', 'giovanni_b96', 'Giovanni', 1972, 'Brazil', ['AM', 'ST'], 78, 81, 2000, 30, t(6, 7, 7, 6, 6, 7)),
  q('barcelona', 'amor_b96', 'Guillermo Amor', 1967, 'Spain', ['CM', 'AM'], 78, 79, 1999, 25, t(9, 5, 7, 9, 3, 7)),
];

// ── Bayern München, 1996–97 (Trapattoni; Bundesliga champions) ────────────────
export const BAYERN_1996: CuratedSeed[] = [
  q('bayern', 'kahn_b96', 'Oliver Kahn', 1969, 'Germany', ['GK'], 85, 88, 2001, 20, t(9, 7, 9, 9, 5, 6)),
  q('bayern', 'babbel_b96', 'Markus Babbel', 1972, 'Germany', ['RB', 'CB'], 80, 82, 2000, 25, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'matthaus_b96', 'Lothar Matthäus', 1961, 'Germany', ['DM', 'CB'], 83, 83, 1999, 25, t(8, 8, 9, 7, 5, 7)),
  q('bayern', 'helmer_b96', 'Thomas Helmer', 1965, 'Germany', ['CB'], 79, 80, 1999, 25, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'kuffour_b96', 'Samuel Kuffour', 1976, 'Ghana', ['CB'], 76, 82, 2001, 30, t(8, 5, 8, 7, 5, 7)),
  q('bayern', 'strunz_b96', 'Thomas Strunz', 1968, 'Germany', ['CM', 'RB'], 78, 79, 1999, 25, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'hamann_b96', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 78, 84, 2001, 30, t(8, 4, 7, 7, 3, 7)),
  q('bayern', 'nerlinger_b96', 'Christian Nerlinger', 1973, 'Germany', ['CM'], 76, 79, 1999, 30, t(8, 5, 7, 7, 4, 7)),
  q('bayern', 'scholl_b96', 'Mehmet Scholl', 1970, 'Germany', ['AM'], 82, 84, 2000, 30, t(7, 6, 7, 8, 5, 7)),
  q('bayern', 'basler_b96', 'Mario Basler', 1968, 'Germany', ['AM', 'RW'], 82, 83, 2000, 30, t(5, 8, 7, 5, 8, 6)),
  q('bayern', 'klinsmann_b96', 'Jürgen Klinsmann', 1964, 'Germany', ['ST'], 84, 85, 1998, 25, t(9, 6, 8, 6, 5, 8)),
  q('bayern', 'papin_b96', 'Jean-Pierre Papin', 1963, 'France', ['ST'], 78, 78, 1998, 35, t(8, 7, 8, 6, 5, 7)),
  q('bayern', 'zickler_b96', 'Alexander Zickler', 1974, 'Germany', ['ST'], 74, 78, 2000, 35, t(7, 5, 7, 7, 5, 6)),
  q('bayern', 'sforza_b96', 'Ciriaco Sforza', 1970, 'Switzerland', ['CM', 'DM'], 78, 80, 1999, 30, t(8, 5, 7, 6, 5, 7)),
];

// ── Juventus, 1996–97 (Lippi; Serie A champions, CL finalists; Zidane's year 1) ─
export const JUVENTUS_1996: CuratedSeed[] = [
  q('juventus', 'peruzzi_j96', 'Angelo Peruzzi', 1970, 'Italy', ['GK'], 85, 86, 2000, 25, t(8, 6, 8, 8, 5, 6)),
  q('juventus', 'ferrara_j96', 'Ciro Ferrara', 1967, 'Italy', ['CB'], 84, 84, 2000, 25, t(9, 5, 8, 8, 4, 7)),
  q('juventus', 'montero_j96', 'Paolo Montero', 1971, 'Uruguay', ['CB'], 82, 83, 2000, 35, t(7, 6, 7, 7, 7, 6)),
  q('juventus', 'iuliano_j96', 'Mark Iuliano', 1973, 'Italy', ['CB'], 77, 80, 2001, 30, t(7, 5, 7, 7, 5, 6)),
  q('juventus', 'pessotto_j96', 'Gianluca Pessotto', 1970, 'Italy', ['LB', 'RB'], 80, 81, 2000, 25, t(9, 4, 7, 9, 3, 7)),
  q('juventus', 'torricelli_j96', 'Moreno Torricelli', 1970, 'Italy', ['RB', 'CB'], 79, 80, 2000, 25, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'deschamps_j96', 'Didier Deschamps', 1968, 'France', ['DM', 'CM'], 84, 85, 1999, 25, t(9, 6, 9, 7, 4, 7)),
  q('juventus', 'dilivio_j96', 'Angelo Di Livio', 1966, 'Italy', ['RW', 'CM'], 79, 80, 1999, 25, t(9, 4, 8, 9, 4, 7)),
  q('juventus', 'zidane_j96', 'Zinedine Zidane', 1972, 'France', ['AM', 'CM'], 86, 93, 2001, 25, t(9, 6, 8, 7, 4, 8)),
  q('juventus', 'delpiero_j96', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 87, 91, 2002, 30, t(9, 6, 9, 10, 4, 7), { loyalty: 94 }),
  q('juventus', 'boksic_j96', 'Alen Bokšić', 1970, 'Croatia', ['ST'], 82, 84, 2000, 35, t(7, 6, 8, 6, 5, 7)),
  q('juventus', 'vieri_j96', 'Christian Vieri', 1973, 'Italy', ['ST'], 82, 88, 1999, 35, t(6, 8, 8, 5, 7, 6)),
  q('juventus', 'amoruso_j96', 'Nicola Amoruso', 1974, 'Italy', ['ST'], 76, 79, 2000, 30, t(7, 6, 7, 6, 5, 6)),
  q('juventus', 'jugovic_j96', 'Vladimir Jugović', 1970, 'Serbia', ['CM', 'AM'], 80, 81, 1999, 30, t(7, 6, 8, 6, 5, 7)),
];

// ── AC Milan, 1996–97 (a poor title defence, but the old guard remains) ───────
export const MILAN_1996: CuratedSeed[] = [
  q('milan', 'rossi_m96', 'Sebastiano Rossi', 1964, 'Italy', ['GK'], 82, 82, 2000, 25, t(8, 6, 7, 8, 5, 6)),
  q('milan', 'maldini_m96', 'Paolo Maldini', 1968, 'Italy', ['LB', 'CB'], 88, 89, 2002, 20, t(10, 6, 9, 10, 3, 7), { loyalty: 99, hardBlocks: [{ reason: 'Paolo Maldini is Milan for life.', untilYear: 2099 }] }),
  q('milan', 'baresi_m96', 'Franco Baresi', 1960, 'Italy', ['CB'], 86, 86, 1998, 25, t(10, 6, 9, 10, 3, 6), { loyalty: 99, hardBlocks: [{ reason: 'Franco Baresi is a Milan legend.', untilYear: 2099 }] }),
  q('milan', 'costacurta_m96', 'Alessandro Costacurta', 1966, 'Italy', ['CB'], 84, 85, 2001, 25, t(9, 5, 8, 10, 3, 7), { loyalty: 94 }),
  q('milan', 'reiziger_m96', 'Michael Reiziger', 1973, 'Netherlands', ['RB', 'CB'], 81, 83, 1999, 20, t(8, 5, 8, 7, 5, 8)),
  q('milan', 'albertini_m96', 'Demetrio Albertini', 1971, 'Italy', ['CM', 'DM'], 83, 85, 2001, 25, t(9, 5, 8, 8, 3, 7)),
  q('milan', 'desailly_m96', 'Marcel Desailly', 1968, 'France', ['DM', 'CB'], 85, 86, 2000, 25, t(9, 5, 8, 7, 4, 7)),
  q('milan', 'boban_m96', 'Zvonimir Boban', 1968, 'Croatia', ['AM'], 83, 84, 2000, 30, t(8, 6, 8, 7, 5, 7)),
  q('milan', 'savicevic_m96', 'Dejan Savićević', 1966, 'Montenegro', ['AM', 'ST'], 83, 84, 1999, 35, t(6, 8, 7, 6, 7, 6)),
  q('milan', 'weah_m96', 'George Weah', 1966, 'Liberia', ['ST'], 86, 87, 2000, 25, t(8, 6, 9, 7, 4, 7)),
  q('milan', 'baggio_m96', 'Roberto Baggio', 1967, 'Italy', ['AM', 'ST'], 85, 86, 1998, 35, t(8, 6, 8, 7, 5, 7)),
  q('milan', 'simone_m96', 'Marco Simone', 1969, 'Italy', ['ST'], 79, 80, 1998, 30, t(7, 6, 7, 7, 5, 7)),
  q('milan', 'ambrosini_m96', 'Massimo Ambrosini', 1977, 'Italy', ['CM', 'DM'], 68, 82, 2003, 30, t(8, 5, 8, 9, 4, 7)),
];

// ── Internazionale, 1996–97 (Djorkaeff & Zamorano arrive) ─────────────────────
export const INTER_1996: CuratedSeed[] = [
  q('inter', 'pagliuca_i96', 'Gianluca Pagliuca', 1966, 'Italy', ['GK'], 83, 84, 2000, 20, t(8, 6, 7, 8, 5, 6)),
  q('inter', 'bergomi_i96', 'Giuseppe Bergomi', 1963, 'Italy', ['CB', 'RB'], 80, 80, 1999, 25, t(9, 5, 8, 10, 4, 6), { loyalty: 96 }),
  q('inter', 'fresi_i96', 'Salvatore Fresi', 1973, 'Italy', ['CB'], 76, 80, 2000, 30, t(7, 5, 7, 7, 5, 7)),
  q('inter', 'galante_i96', 'Fabio Galante', 1973, 'Italy', ['CB'], 76, 79, 2000, 30, t(7, 5, 7, 7, 5, 6)),
  q('inter', 'jzanetti_i96', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 83, 88, 2002, 15, t(10, 5, 9, 10, 2, 8), { loyalty: 94 }),
  q('inter', 'ince_i96', 'Paul Ince', 1967, 'England', ['CM', 'DM'], 82, 83, 1999, 30, t(7, 7, 8, 6, 6, 6)),
  q('inter', 'winter_i96', 'Aron Winter', 1967, 'Netherlands', ['CM', 'AM'], 79, 80, 1998, 25, t(8, 5, 7, 7, 4, 7)),
  q('inter', 'berti_i96', 'Nicola Berti', 1967, 'Italy', ['CM'], 78, 79, 1998, 30, t(7, 6, 7, 7, 6, 6)),
  q('inter', 'angloma_i96', 'Jocelyn Angloma', 1965, 'France', ['RB', 'CB'], 77, 78, 1998, 25, t(8, 5, 7, 6, 4, 7)),
  q('inter', 'djorkaeff_i96', 'Youri Djorkaeff', 1968, 'France', ['AM', 'ST'], 83, 84, 2000, 25, t(8, 6, 8, 7, 5, 7)),
  q('inter', 'zamorano_i96', 'Iván Zamorano', 1967, 'Chile', ['ST'], 82, 83, 2000, 30, t(8, 6, 8, 8, 5, 7)),
  q('inter', 'ganz_i96', 'Maurizio Ganz', 1968, 'Italy', ['ST'], 77, 78, 1998, 30, t(7, 6, 7, 6, 6, 6)),
  q('inter', 'branca_i96', 'Marco Branca', 1965, 'Italy', ['ST'], 78, 79, 1998, 35, t(7, 5, 7, 6, 5, 6)),
];

// ── Tottenham Hotspur, 1996–97 (mid-table; Sheringham's last season) ──────────
export const SPURS_1996: CuratedSeed[] = [
  q('spurs', 'walker_s96', 'Ian Walker', 1971, 'England', ['GK'], 78, 80, 2000, 25, t(7, 5, 7, 7, 5, 6)),
  q('spurs', 'carr_s96', 'Stephen Carr', 1976, 'Ireland', ['RB'], 76, 81, 2001, 30, t(8, 5, 8, 7, 4, 7)),
  q('spurs', 'campbell_s96', 'Sol Campbell', 1974, 'England', ['CB'], 82, 87, 2001, 25, t(8, 6, 8, 7, 4, 6)),
  q('spurs', 'calderwood_s96', 'Colin Calderwood', 1965, 'Scotland', ['CB'], 74, 74, 1998, 30, t(8, 4, 7, 8, 4, 6)),
  q('spurs', 'wilson_s96', 'Clive Wilson', 1961, 'England', ['LB'], 73, 73, 1998, 30, t(8, 4, 6, 7, 4, 7)),
  q('spurs', 'howells_s96', 'David Howells', 1967, 'England', ['CM', 'DM'], 75, 76, 1998, 30, t(8, 4, 7, 8, 4, 7)),
  q('spurs', 'anderton_s96', 'Darren Anderton', 1972, 'England', ['RW', 'AM'], 80, 82, 2001, 55, t(7, 6, 7, 8, 5, 7)),
  q('spurs', 'sinton_s96', 'Andy Sinton', 1966, 'England', ['LW', 'CM'], 74, 75, 1998, 30, t(8, 4, 7, 7, 4, 7)),
  q('spurs', 'fox_s96', 'Ruel Fox', 1968, 'England', ['RW', 'AM'], 75, 77, 1999, 30, t(7, 5, 7, 6, 5, 7)),
  q('spurs', 'sheringham_s96', 'Teddy Sheringham', 1966, 'England', ['ST', 'AM'], 84, 85, 1998, 30, t(9, 6, 8, 7, 4, 7)),
  q('spurs', 'armstrong_s96', 'Chris Armstrong', 1971, 'England', ['ST'], 78, 79, 2000, 35, t(7, 5, 7, 7, 5, 6)),
  q('spurs', 'iversen_s96', 'Steffen Iversen', 1976, 'Norway', ['ST', 'LW'], 76, 82, 2001, 30, t(7, 5, 7, 7, 5, 7)),
  q('spurs', 'nielsen_s96', 'Allan Nielsen', 1971, 'Denmark', ['CM', 'AM'], 76, 78, 2000, 30, t(8, 5, 7, 7, 5, 7)),
  q('spurs', 'dozzell_s96', 'Jason Dozzell', 1967, 'England', ['CM'], 72, 73, 1998, 30, t(7, 5, 6, 7, 5, 6)),
];

// ── Manchester City, 1996–97 — a fallen giant in Division One (Kinkladze the jewel).
//    Not in the Premier League then, so a context club here; their takeover-era arc
//    lies decades ahead. Second-tier ratings.
export const MANCITY_1996: CuratedSeed[] = [
  q('man_city', 'immel_mc96', 'Eike Immel', 1960, 'Germany', ['GK'], 72, 72, 1998, 30, t(8, 5, 6, 7, 5, 6)),
  q('man_city', 'summerbee_mc96', 'Nicky Summerbee', 1971, 'England', ['RB', 'RW'], 70, 74, 1999, 25, t(7, 5, 7, 7, 5, 7)),
  q('man_city', 'symons_mc96', 'Kit Symons', 1971, 'Wales', ['CB'], 72, 74, 1999, 25, t(8, 4, 7, 8, 4, 6)),
  q('man_city', 'brightwell_mc96', 'Ian Brightwell', 1968, 'England', ['RB', 'CM'], 68, 70, 1998, 30, t(8, 4, 7, 9, 4, 6)),
  q('man_city', 'vanblerk_mc96', 'Jason van Blerk', 1968, 'Australia', ['LB'], 66, 68, 1999, 30, t(7, 4, 7, 7, 5, 6)),
  q('man_city', 'lomas_mc96', 'Steve Lomas', 1974, 'Northern Ireland', ['CM', 'DM'], 74, 78, 2000, 30, t(8, 5, 8, 7, 5, 6)),
  q('man_city', 'brown_mc96', 'Michael Brown', 1977, 'England', ['CM'], 66, 76, 2001, 25, t(8, 5, 7, 8, 5, 6)),
  q('man_city', 'kinkladze_mc96', 'Georgi Kinkladze', 1973, 'Georgia', ['AM'], 80, 82, 1999, 30, t(6, 7, 7, 7, 6, 7)),
  q('man_city', 'clough_mc96', 'Nigel Clough', 1966, 'England', ['AM'], 74, 75, 1998, 30, t(9, 4, 7, 8, 3, 7)),
  q('man_city', 'beagrie_mc96', 'Peter Beagrie', 1965, 'England', ['LW'], 72, 73, 1998, 30, t(6, 6, 7, 6, 6, 7)),
  q('man_city', 'rosler_mc96', 'Uwe Rösler', 1968, 'Germany', ['ST'], 74, 76, 1999, 30, t(7, 6, 7, 7, 5, 7)),
  q('man_city', 'dickov_mc96', 'Paul Dickov', 1972, 'Scotland', ['ST'], 70, 73, 1999, 30, t(7, 6, 8, 8, 6, 6)),
  q('man_city', 'kavelashvili_mc96', 'Mikheil Kavelashvili', 1971, 'Georgia', ['ST'], 68, 70, 1999, 30, t(6, 6, 7, 6, 6, 6)),
];

/** Parma, 1996-97 — Gianfranco Zola's club until his November-1996 move to
 *  Chelsea. A couple of real team-mates from Carlo Ancelotti's side give the
 *  Gialloblù some depth as a selling club in the era-1996 world. */
export const PARMA_1996: CuratedSeed[] = [
  q('parma', 'zola_c96', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 86, 87, 2001, 25, t(9, 5, 8, 8, 3, 7)),
  q('parma', 'dino_baggio_pa96', 'Dino Baggio', 1971, 'Italy', ['CM', 'DM'], 80, 82, 2000, 25, t(8, 5, 8, 8, 5, 7)),
  q('parma', 'sensini_pa96', 'Néstor Sensini', 1966, 'Argentina', ['CB', 'DM'], 79, 80, 2000, 25, t(8, 5, 8, 8, 5, 7)),
];

/** Curated squads for the Wenger-arrival Arsenal start, keyed by club. */
export const ARSENAL_1996_SQUADS: Record<string, CuratedSeed[]> = {
  arsenal: ARSENAL_1996,
  parma: PARMA_1996,
  man_utd: MANUTD_1996,
  liverpool: LIVERPOOL_1996,
  chelsea: CHELSEA_1996,
  newcastle: NEWCASTLE_1996,
  man_city: MANCITY_1996,
  real_madrid: REAL_1996,
  barcelona: BARCA_1996,
  bayern: BAYERN_1996,
  juventus: JUVENTUS_1996,
  milan: MILAN_1996,
  inter: INTER_1996,
  spurs: SPURS_1996,
};

// European selling clubs (M12A rollout) — the mid-90s talent pipeline (shared with
// the 1995 English world). Merged by CONCATENATION onto any club already present.
for (const [club, seeds] of Object.entries(EUROPE_MID90S_SQUADS)) {
  ARSENAL_1996_SQUADS[club] = [...(ARSENAL_1996_SQUADS[club] ?? []), ...seeds];
}
// Domestic mid-tier (M12 shortlist supply): real 1996-97 squad players at the
// non-elite PL clubs, so options lists read like a real shortlist.
for (const [club, seeds] of Object.entries(ENG_DOMESTIC_1996_SQUADS)) {
  ARSENAL_1996_SQUADS[club] = [...(ARSENAL_1996_SQUADS[club] ?? []), ...seeds];
}
