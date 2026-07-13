/**
 * Curated real players — 1998 Serie A pack (§4, §17.10).
 *
 * Vertical slice for "Inter with a healthy Ronaldo": the 1998–99 Internazionale
 * of Ronaldo, Baggio, Zamorano and Djorkaeff, in a Serie A that was then the
 * strongest league in the world (Juventus, Milan, Lazio, Parma, Fiorentina,
 * Roma). The counterfactual is Ronaldo's knee: manage his 1999–2000 injury and
 * his workload (injuryManagement.ts) and the sim's most gifted forward need not
 * break down as he did in reality. Ability/personality are hidden estimates (§7).
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
  extra: { hardBlocks?: HardBlock[]; loyalty?: number; latentCeiling?: number } = {},
): CuratedSeed {
  return { id: `cur_${id}`, name, birthYear, nationality, positions, club, contractUntil, ability, potentialCeiling, personality, injuryProneness, ...extra };
}

/** Internazionale, 1998–99 — Ronaldo's Inter. */
export const INTER_1998: CuratedSeed[] = [
  q('inter', 'pagliuca', 'Gianluca Pagliuca', 1966, 'Italy', ['GK'], 82, 83, 2001, 25, t(8, 5, 8, 8, 4, 6)),
  q('inter', 'zanetti', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'DM'], 85, 88, 2004, 15, t(10, 4, 9, 10, 3, 8)),
  q('inter', 'bergomi', 'Giuseppe Bergomi', 1963, 'Italy', ['CB', 'RB'], 80, 81, 2000, 30, t(9, 5, 8, 10, 3, 6)),
  q('inter', 'west', 'Taribo West', 1974, 'Nigeria', ['CB'], 79, 81, 2001, 35, t(7, 6, 7, 6, 6, 7)),
  q('inter', 'colonnese', 'Francesco Colonnese', 1971, 'Italy', ['CB', 'LB'], 77, 79, 2001, 30, t(7, 5, 7, 7, 5, 6)),
  q('inter', 'zeelias', 'Zé Elias', 1976, 'Brazil', ['DM', 'CM'], 76, 82, 2002, 35, t(6, 6, 7, 6, 6, 7)),
  q('inter', 'simeone', 'Diego Simeone', 1970, 'Argentina', ['CM', 'DM'], 83, 84, 2001, 30, t(8, 7, 9, 7, 7, 7)),
  q('inter', 'cauet', 'Benoît Cauet', 1969, 'France', ['CM'], 78, 80, 2001, 30, t(8, 5, 7, 7, 4, 7)),
  q('inter', 'winter', 'Aron Winter', 1967, 'Netherlands', ['CM', 'DM'], 80, 81, 2000, 25, t(8, 5, 8, 7, 4, 7)),
  q('inter', 'djorkaeff', 'Youri Djorkaeff', 1968, 'France', ['AM', 'ST'], 84, 85, 2001, 25, t(8, 6, 8, 7, 4, 7)),
  q('inter', 'baggio_r', 'Roberto Baggio', 1967, 'Italy', ['AM', 'ST'], 85, 86, 2000, 40, t(9, 6, 8, 8, 4, 7)),
  q('inter', 'zamorano', 'Iván Zamorano', 1967, 'Chile', ['ST'], 82, 83, 2001, 30, t(9, 6, 9, 8, 4, 7)),
  // Ronaldo — the phenomenon, and a knee that reality wrecked. High proneness +
  // his real 1999 injury (era pack) make injury management THE call of this save.
  q('inter', 'r9', 'Ronaldo', 1976, 'Brazil', ['ST'], 93, 95, 2002, 72, t(7, 7, 9, 6, 5, 8), { latentCeiling: 96 }),
  // Nicola Ventola — a quick, gifted Inter striker of real promise whose career
  // was broken up by one knee injury after another. A fragile-AND-lost talent
  // (latent 87): manage the body and give him the run reality never did, and he
  // becomes the forward Inter hoped for rather than a what-might-have-been.
  q('inter', 'ventola', 'Nicola Ventola', 1978, 'Italy', ['ST'], 74, 83, 2003, 45, t(6, 6, 8, 7, 6, 7), { latentCeiling: 87 }),
  q('inter', 'moriero', 'Francesco Moriero', 1969, 'Italy', ['RW', 'LW'], 77, 79, 2001, 30, t(7, 5, 7, 7, 5, 7)),
  q('inter', 'silvestrin', 'Gianluca Silvestrin', 1976, 'Italy', ['CB'], 70, 78, 2002, 30, t(7, 4, 7, 7, 4, 6)),
];

/** Juventus, 1998–99 — Zidane and Del Piero. */
export const JUVENTUS_1998: CuratedSeed[] = [
  q('juventus', 'zidane98', 'Zinedine Zidane', 1972, 'France', ['AM', 'CM'], 90, 92, 2003, 20, t(9, 6, 9, 7, 4, 8)),
  q('juventus', 'delpiero', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 88, 90, 2004, 45, t(9, 6, 9, 10, 4, 7)),
  q('juventus', 'inzaghi_f', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 84, 86, 2002, 30, t(8, 6, 9, 7, 4, 7)),
  q('juventus', 'davids', 'Edgar Davids', 1973, 'Netherlands', ['CM', 'DM'], 85, 86, 2003, 30, t(8, 6, 9, 7, 6, 7)),
  q('juventus', 'deschamps', 'Didier Deschamps', 1968, 'France', ['DM', 'CM'], 82, 83, 2000, 25, t(9, 5, 9, 8, 4, 7)),
  q('juventus', 'montero', 'Paolo Montero', 1971, 'Uruguay', ['CB'], 84, 85, 2003, 30, t(8, 6, 8, 8, 7, 6)),
];

/** AC Milan, 1998–99 — Serie A champions that year. */
export const MILAN_1998: CuratedSeed[] = [
  q('milan', 'maldini98', 'Paolo Maldini', 1968, 'Italy', ['LB', 'CB'], 90, 91, 2005, 20, t(10, 6, 8, 10, 2, 6), {
    loyalty: 99, hardBlocks: [{ reason: 'Paolo Maldini is Milan for life.', untilYear: 2009 }],
  }),
  q('milan', 'weah', 'George Weah', 1966, 'Liberia', ['ST'], 85, 86, 2000, 25, t(8, 6, 8, 7, 4, 7)),
  q('milan', 'bierhoff', 'Oliver Bierhoff', 1968, 'Germany', ['ST'], 83, 84, 2001, 30, t(8, 5, 8, 7, 3, 7)),
  q('milan', 'boban', 'Zvonimir Boban', 1968, 'Croatia', ['AM', 'CM'], 84, 85, 2001, 25, t(8, 6, 8, 8, 5, 7)),
  q('milan', 'costacurta', 'Alessandro Costacurta', 1966, 'Italy', ['CB'], 82, 83, 2002, 25, t(9, 5, 8, 9, 3, 6)),
  q('milan', 'albertini', 'Demetrio Albertini', 1971, 'Italy', ['CM', 'DM'], 82, 84, 2002, 25, t(9, 5, 8, 8, 3, 7)),
];

/** Lazio, 1998–99 — Cragnotti's galácticos-in-waiting. */
export const LAZIO_1998: CuratedSeed[] = [
  q('lazio', 'vieri98', 'Christian Vieri', 1973, 'Italy', ['ST'], 87, 89, 2002, 45, t(7, 7, 9, 6, 5, 7)),
  q('lazio', 'nesta98', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 86, 90, 2004, 30, t(9, 5, 8, 9, 4, 7)),
  q('lazio', 'nedved98', 'Pavel Nedvěd', 1972, 'Czech Republic', ['LW', 'CM'], 85, 88, 2003, 20, t(9, 5, 9, 8, 4, 7)),
  q('lazio', 'mihajlovic', 'Siniša Mihajlović', 1969, 'Serbia', ['CB', 'LB'], 82, 83, 2002, 30, t(7, 7, 8, 7, 7, 6)),
  q('lazio', 'salas', 'Marcelo Salas', 1974, 'Chile', ['ST'], 83, 85, 2002, 35, t(7, 6, 8, 6, 5, 7)),
  q('lazio', 'veron98', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM', 'AM'], 85, 87, 2003, 35, t(7, 6, 8, 5, 5, 6)),
];

/** Parma, 1998–99 — Buffon, Cannavaro, Thuram, Crespo, Verón: a superclub. */
export const PARMA_1998: CuratedSeed[] = [
  q('parma', 'buffon98', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 84, 92, 2005, 20, t(9, 6, 9, 9, 3, 7)),
  q('parma', 'cannavaro', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 85, 89, 2004, 25, t(9, 6, 9, 8, 4, 7)),
  q('parma', 'thuram', 'Lilian Thuram', 1972, 'France', ['CB', 'RB'], 86, 88, 2003, 20, t(9, 5, 9, 8, 3, 7)),
  q('parma', 'crespo98', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 85, 88, 2004, 40, t(7, 6, 8, 5, 5, 7)),
];

/** Fiorentina, 1998–99 — Batistuta and Rui Costa. */
export const FIORENTINA_1998: CuratedSeed[] = [
  q('fiorentina', 'batistuta', 'Gabriel Batistuta', 1969, 'Argentina', ['ST'], 88, 89, 2002, 30, t(8, 7, 9, 8, 4, 7)),
  q('fiorentina', 'ruicosta', 'Manuel Rui Costa', 1972, 'Portugal', ['AM'], 85, 86, 2002, 25, t(8, 6, 8, 7, 4, 7)),
];

/** Roma, 1998–99 — a 22-year-old Totti. */
export const ROMA_1998: CuratedSeed[] = [
  q('roma', 'totti98', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 84, 90, 2005, 25, t(8, 7, 9, 10, 4, 7), {
    loyalty: 97, hardBlocks: [{ reason: 'Totti is Roma. He will not leave.', untilYear: 2008 }],
  }),
  q('roma', 'aldair', 'Aldair', 1965, 'Brazil', ['CB'], 82, 83, 2001, 25, t(9, 5, 8, 9, 3, 6)),
  q('roma', 'candela', 'Vincent Candela', 1973, 'France', ['LB', 'LW'], 79, 81, 2002, 30, t(7, 5, 7, 7, 4, 7)),
];

/** Curated squads for the inter-1998 scenario, keyed by club. */
export const INTER_1998_SQUADS: Record<string, CuratedSeed[]> = {
  inter: INTER_1998,
  juventus: JUVENTUS_1998,
  milan: MILAN_1998,
  lazio: LAZIO_1998,
  parma: PARMA_1998,
  fiorentina: FIORENTINA_1998,
  roma: ROMA_1998,
};
