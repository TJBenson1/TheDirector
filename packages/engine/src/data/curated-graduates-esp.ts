/**
 * Academy graduates — the real next generation for the Spanish eras (era-2000,
 * era-la-liga-2003 / -2006 / -2014). Real La Liga breakthroughs 2000-2025 at clubs
 * present in those worlds, injected at their debut window by INTAKES_ESP. Each era
 * fires only the intakes inside its own calendar span; a name already in a later
 * era's kickoff squad is skipped. Ratings are HIDDEN designer estimates (§7).
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

export const GRADUATES_ESP: CuratedSeed[] = [
  q('real_madrid', 'casillas_esp', 'Iker Casillas', 1981, 'Spain', ['GK'], 66, 90, 2006, 15, t(9, 6, 9, 10, 4, 7), { loyalty: 92 }),
  q('barcelona', 'iniesta_esp', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 68, 90, 2008, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 94 }),
  q('barcelona', 'messi_esp', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM', 'ST'], 62, 99, 2010, 20, t(9, 6, 10, 10, 3, 8), { loyalty: 95 }),
  q('real_madrid', 'ramos_esp', 'Sergio Ramos', 1986, 'Spain', ['CB', 'RB'], 72, 90, 2011, 20, t(8, 7, 9, 9, 7, 7)),
  q('valencia', 'villa_esp', 'David Villa', 1981, 'Spain', ['ST', 'LW'], 76, 88, 2009, 20, t(9, 6, 9, 8, 5, 8)),
  q('valencia', 'silva_esp', 'David Silva', 1986, 'Spain', ['AM', 'LW'], 66, 89, 2010, 15, t(9, 6, 9, 9, 4, 8)),
  q('valencia', 'mata_esp', 'Juan Mata', 1988, 'Spain', ['AM', 'RW'], 64, 86, 2011, 15, t(9, 6, 8, 8, 4, 8)),
  q('barcelona', 'busquets_esp', 'Sergio Busquets', 1988, 'Spain', ['DM'], 64, 88, 2013, 15, t(10, 5, 9, 10, 3, 8), { loyalty: 92 }),
  q('barcelona', 'pedro_esp', 'Pedro', 1987, 'Spain', ['RW', 'ST'], 66, 85, 2014, 20, t(9, 5, 8, 9, 4, 8)),
  q('atletico', 'koke_esp', 'Koke', 1992, 'Spain', ['CM', 'AM'], 62, 87, 2016, 15, t(9, 6, 9, 9, 4, 8)),
  q('atletico', 'saul_esp', 'Saúl Ñíguez', 1994, 'Spain', ['CM', 'DM'], 60, 86, 2018, 20, t(9, 6, 9, 8, 5, 8)),
  q('real_madrid', 'isco_esp', 'Isco', 1992, 'Spain', ['AM'], 66, 88, 2018, 20, t(7, 7, 8, 7, 5, 8)),
  q('real_madrid', 'asensio_esp', 'Marco Asensio', 1996, 'Spain', ['RW', 'AM'], 62, 86, 2021, 25, t(8, 6, 8, 8, 5, 8)),
  q('real_madrid', 'vinicius_esp', 'Vinícius Júnior', 2000, 'Brazil', ['LW'], 66, 92, 2024, 20, t(8, 7, 9, 8, 5, 8)),
  q('real_madrid', 'rodrygo_esp', 'Rodrygo', 2001, 'Brazil', ['RW', 'ST'], 64, 88, 2025, 20, t(9, 6, 9, 8, 4, 8)),
  q('real_madrid', 'valverde_esp', 'Federico Valverde', 1998, 'Uruguay', ['CM'], 64, 89, 2024, 15, t(10, 6, 9, 9, 4, 8)),
  q('barcelona', 'pedri_esp', 'Pedri', 2002, 'Spain', ['CM', 'AM'], 68, 91, 2026, 20, t(10, 5, 9, 9, 3, 8)),
  q('barcelona', 'gavi_esp', 'Gavi', 2004, 'Spain', ['CM'], 64, 89, 2026, 20, t(9, 7, 9, 9, 5, 8)),
  q('barcelona', 'fati_esp', 'Ansu Fati', 2002, 'Spain', ['LW', 'ST'], 62, 88, 2027, 30, t(8, 6, 9, 9, 5, 8)),

  // ── Squad-depth La Liga academy products (2000-2013) ──
  // Real cantera breakthroughs beyond the marquee names — Atléti's Torres, the
  // Basque conveyor at Athletic and Sociedad, Sevilla's and Villarreal's youth —
  // the home-grown spine that keeps the Spanish world real over a long save.
  q('atletico', 'torres_esp', 'Fernando Torres', 1984, 'Spain', ['ST'], 68, 87, 2004, 25, t(8, 6, 9, 9, 5, 8), { loyalty: 88 }),
  q('real_sociedad', 'xabi_esp', 'Xabi Alonso', 1981, 'Spain', ['CM', 'DM'], 66, 87, 2004, 15, t(10, 5, 9, 8, 3, 8)),
  q('real_sociedad', 'griezmann_esp', 'Antoine Griezmann', 1991, 'France', ['ST', 'AM'], 62, 88, 2013, 15, t(9, 6, 9, 8, 4, 8)),
  q('athletic', 'llorente_esp', 'Fernando Llorente', 1985, 'Spain', ['ST'], 64, 82, 2009, 25, t(8, 5, 8, 8, 5, 7)),
  q('athletic', 'javimartinez_esp', 'Javi Martínez', 1988, 'Spain', ['DM', 'CB'], 62, 85, 2011, 20, t(9, 5, 8, 8, 4, 7)),
  q('athletic', 'muniain_esp', 'Iker Muniain', 1992, 'Spain', ['LW', 'AM'], 60, 82, 2015, 25, t(8, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('athletic', 'laporte_esp', 'Aymeric Laporte', 1994, 'France', ['CB'], 62, 85, 2017, 20, t(9, 6, 8, 7, 4, 7)),
  q('sevilla', 'reyes_esp', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'RW'], 66, 84, 2004, 25, t(6, 7, 8, 7, 6, 7)),
  q('sevilla', 'navas_esp', 'Jesús Navas', 1985, 'Spain', ['RW'], 64, 84, 2008, 30, t(8, 5, 8, 9, 5, 6), { loyalty: 90 }),
  q('villarreal', 'cazorla_esp', 'Santi Cazorla', 1984, 'Spain', ['AM', 'LW'], 64, 85, 2008, 25, t(9, 6, 8, 8, 4, 8)),
  q('valencia', 'albiol_esp', 'Raúl Albiol', 1985, 'Spain', ['CB'], 62, 82, 2009, 20, t(8, 5, 8, 8, 4, 7)),
  q('barcelona', 'bojan_esp', 'Bojan Krkić', 1990, 'Spain', ['ST', 'RW'], 62, 80, 2011, 25, t(8, 6, 8, 8, 5, 7)),
  q('barcelona', 'thiago_esp', 'Thiago Alcântara', 1991, 'Spain', ['CM', 'AM'], 64, 87, 2014, 30, t(9, 6, 9, 8, 4, 8)),
  q('barcelona', 'sergiroberto_esp', 'Sergi Roberto', 1992, 'Spain', ['CM', 'RB'], 62, 82, 2017, 20, t(9, 5, 8, 9, 4, 8), { loyalty: 90 }),
];

export const INTAKES_ESP: AcademyIntake[] = [
  { clubId: 'real_madrid', year: 2000, playerId: 'cur_casillas_esp' },
  { clubId: 'barcelona', year: 2002, playerId: 'cur_iniesta_esp' },
  { clubId: 'barcelona', year: 2004, playerId: 'cur_messi_esp' },
  { clubId: 'valencia', year: 2005, playerId: 'cur_villa_esp' },
  { clubId: 'real_madrid', year: 2005, playerId: 'cur_ramos_esp' },
  { clubId: 'valencia', year: 2006, playerId: 'cur_silva_esp' },
  { clubId: 'valencia', year: 2007, playerId: 'cur_mata_esp' },
  { clubId: 'barcelona', year: 2008, playerId: 'cur_busquets_esp' },
  { clubId: 'barcelona', year: 2009, playerId: 'cur_pedro_esp' },
  { clubId: 'atletico', year: 2011, playerId: 'cur_koke_esp' },
  { clubId: 'real_madrid', year: 2013, playerId: 'cur_isco_esp' },
  { clubId: 'atletico', year: 2013, playerId: 'cur_saul_esp' },
  { clubId: 'real_madrid', year: 2016, playerId: 'cur_asensio_esp' },
  { clubId: 'real_madrid', year: 2018, playerId: 'cur_vinicius_esp' },
  { clubId: 'real_madrid', year: 2018, playerId: 'cur_valverde_esp' },
  { clubId: 'real_madrid', year: 2019, playerId: 'cur_rodrygo_esp' },
  { clubId: 'barcelona', year: 2020, playerId: 'cur_pedri_esp' },
  { clubId: 'barcelona', year: 2019, playerId: 'cur_fati_esp' },
  { clubId: 'barcelona', year: 2021, playerId: 'cur_gavi_esp' },

  // ── Squad-depth cantera products, at their real debut years ──
  { clubId: 'real_sociedad', year: 2000, playerId: 'cur_xabi_esp' },
  { clubId: 'sevilla', year: 2000, playerId: 'cur_reyes_esp' },
  { clubId: 'atletico', year: 2001, playerId: 'cur_torres_esp' },
  { clubId: 'sevilla', year: 2003, playerId: 'cur_navas_esp' },
  { clubId: 'villarreal', year: 2003, playerId: 'cur_cazorla_esp' },
  { clubId: 'valencia', year: 2004, playerId: 'cur_albiol_esp' },
  { clubId: 'athletic', year: 2005, playerId: 'cur_llorente_esp' },
  { clubId: 'athletic', year: 2006, playerId: 'cur_javimartinez_esp' },
  { clubId: 'barcelona', year: 2007, playerId: 'cur_bojan_esp' },
  { clubId: 'real_sociedad', year: 2009, playerId: 'cur_griezmann_esp' },
  { clubId: 'athletic', year: 2009, playerId: 'cur_muniain_esp' },
  { clubId: 'barcelona', year: 2009, playerId: 'cur_thiago_esp' },
  { clubId: 'athletic', year: 2012, playerId: 'cur_laporte_esp' },
  { clubId: 'barcelona', year: 2013, playerId: 'cur_sergiroberto_esp' },
];
