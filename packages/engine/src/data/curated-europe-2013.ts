/**
 * European selling clubs — 2013-14 (M12A rollout, the talent pipeline).
 *
 * The real clubs OUTSIDE the modelled Premier League that fed the mid-2010s big
 * leagues: Atlético (Courtois, Diego Costa, Koke), Dortmund (Reus, Hummels,
 * Lewandowski), Napoli (Higuaín, Hamšík, Insigne), Monaco (Falcao, James),
 * Porto, Sevilla (Rakitić), Lyon (Lacazette), Schalke, Fiorentina. Gives the
 * post-Ferguson 2013 world (Man Utd / Spurs' Bale money) the deep market the
 * flagship already has. Ability/potential/personality are HIDDEN designer
 * estimates (§7); clubs, birth years, positions and contracts are real.
 *
 * Merged (concatenated) into the man-utd-2013 universe: the existing thin
 * context sellers (Ajax, Benfica, Roma, Valencia) are AUGMENTED; the rest are
 * whole new clubs. Names already curated in the 2013 pack (Oblak, Jovetić,
 * De Rossi, Guardado…) are omitted — no double-roster.
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

// ── Atlético Madrid, 2013-14 (Simeone's champions-in-waiting) ──────────────────
const ATLETICO_2013: CuratedSeed[] = [
  q('atletico', 'courtois_13', 'Thibaut Courtois', 1992, 'Belgium', ['GK'], 85, 91, 2016, 15, t(9, 6, 9, 7, 4, 8)),
  q('atletico', 'godin_13', 'Diego Godín', 1986, 'Uruguay', ['CB'], 85, 87, 2017, 20, t(9, 5, 8, 8, 5, 8)),
  q('atletico', 'miranda_13', 'Miranda', 1984, 'Brazil', ['CB'], 82, 84, 2016, 20, t(9, 5, 8, 8, 5, 8)),
  q('atletico', 'filipe_luis_13', 'Filipe Luís', 1985, 'Brazil', ['LB'], 83, 85, 2016, 20, t(9, 5, 8, 8, 5, 8)),
  q('atletico', 'juanfran_13', 'Juanfran', 1985, 'Spain', ['RB'], 81, 82, 2016, 20, t(9, 5, 8, 8, 5, 8)),
  q('atletico', 'koke_13', 'Koke', 1992, 'Spain', ['CM', 'AM'], 82, 89, 2018, 15, t(9, 5, 9, 9, 4, 8), { loyalty: 90 }),
  q('atletico', 'gabi_13', 'Gabi', 1983, 'Spain', ['DM', 'CM'], 81, 82, 2016, 20, t(9, 5, 8, 9, 5, 8), { loyalty: 88 }),
  q('atletico', 'arda_13', 'Arda Turan', 1987, 'Turkey', ['AM', 'RW'], 83, 85, 2016, 20, t(6, 7, 8, 7, 6, 8)),
  q('atletico', 'diego_costa_13', 'Diego Costa', 1988, 'Spain', ['ST'], 84, 87, 2016, 25, t(6, 8, 9, 6, 7, 8)),
  q('atletico', 'villa_13', 'David Villa', 1981, 'Spain', ['ST'], 83, 84, 2015, 20, t(8, 6, 8, 8, 5, 8)),
  q('atletico', 'raul_garcia_13', 'Raúl García', 1986, 'Spain', ['CM', 'AM'], 79, 81, 2016, 20, t(8, 5, 8, 8, 5, 8)),
  // Depth of Simeone's title side — the rotation and the bench that made the run.
  q('atletico', 'tiago_13', 'Tiago', 1981, 'Portugal', ['DM', 'CM'], 80, 80, 2015, 25, t(9, 5, 8, 8, 5, 8)),
  q('atletico', 'mario_suarez_13', 'Mario Suárez', 1987, 'Spain', ['DM'], 79, 80, 2016, 20, t(8, 5, 8, 8, 6, 8)),
  q('atletico', 'alderweireld_13', 'Toby Alderweireld', 1989, 'Belgium', ['CB', 'RB'], 80, 86, 2018, 15, t(9, 5, 8, 8, 4, 8)),
  q('atletico', 'cristian_rodriguez_13', 'Cristian Rodríguez', 1985, 'Uruguay', ['LW', 'AM'], 78, 80, 2015, 20, t(8, 5, 8, 7, 5, 8)),
  q('atletico', 'adrian_lopez_13', 'Adrián López', 1988, 'Spain', ['ST'], 78, 80, 2016, 20, t(8, 5, 8, 7, 5, 8)),
  q('atletico', 'aranzubia_13', 'Daniel Aranzubia', 1979, 'Spain', ['GK'], 74, 74, 2015, 20, t(8, 4, 6, 8, 4, 7)),
];

// ── Borussia Dortmund, 2013-14 (the Wembley-final side, Bayern circling) ────────
const DORTMUND_2013: CuratedSeed[] = [
  q('dortmund', 'weidenfeller_13', 'Roman Weidenfeller', 1980, 'Germany', ['GK'], 81, 82, 2016, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
  q('dortmund', 'hummels_13', 'Mats Hummels', 1988, 'Germany', ['CB'], 85, 89, 2017, 20, t(9, 6, 9, 8, 4, 8)),
  q('dortmund', 'subotic_13', 'Neven Subotić', 1988, 'Serbia', ['CB'], 81, 84, 2016, 25, t(9, 5, 8, 8, 5, 8)),
  q('dortmund', 'piszczek_13', 'Łukasz Piszczek', 1985, 'Poland', ['RB'], 81, 83, 2016, 20, t(9, 5, 8, 8, 5, 8)),
  q('dortmund', 'gundogan_13', 'İlkay Gündoğan', 1990, 'Germany', ['CM', 'DM'], 82, 88, 2015, 30, t(9, 5, 9, 8, 4, 8)),
  q('dortmund', 'reus_13', 'Marco Reus', 1989, 'Germany', ['AM', 'LW'], 85, 89, 2017, 30, t(9, 6, 9, 8, 5, 8)),
  q('dortmund', 'mkhitaryan_13', 'Henrikh Mkhitaryan', 1989, 'Armenia', ['AM', 'RW'], 82, 86, 2017, 20, t(9, 6, 9, 7, 5, 8)),
  q('dortmund', 'lewandowski_13', 'Robert Lewandowski', 1988, 'Poland', ['ST'], 86, 91, 2014, 15, t(9, 7, 10, 7, 4, 8)),
  q('dortmund', 'grosskreutz_13', 'Kevin Großkreutz', 1988, 'Germany', ['LW', 'RB'], 78, 80, 2016, 20, t(8, 5, 8, 9, 5, 8)),
];

// ── Napoli, 2013-14 (Benítez's side; Higuaín & Callejón just arrived) ──────────
const NAPOLI_2013: CuratedSeed[] = [
  q('napoli', 'reina_13', 'Pepe Reina', 1982, 'Spain', ['GK'], 82, 84, 2015, 20, t(9, 6, 8, 8, 5, 8)),
  q('napoli', 'higuain_13', 'Gonzalo Higuaín', 1987, 'Argentina', ['ST'], 85, 88, 2018, 20, t(8, 6, 9, 7, 5, 8)),
  q('napoli', 'hamsik_13', 'Marek Hamšík', 1987, 'Slovakia', ['AM', 'CM'], 84, 86, 2018, 15, t(9, 6, 9, 9, 4, 8), { loyalty: 90 }),
  q('napoli', 'insigne_13', 'Lorenzo Insigne', 1991, 'Italy', ['LW', 'AM'], 80, 87, 2018, 20, t(8, 6, 9, 9, 6, 8), { loyalty: 88 }),
  q('napoli', 'callejon_13', 'José Callejón', 1987, 'Spain', ['RW'], 82, 84, 2018, 15, t(9, 5, 8, 8, 4, 8)),
  q('napoli', 'mertens_13', 'Dries Mertens', 1987, 'Belgium', ['LW', 'AM'], 81, 85, 2018, 15, t(8, 6, 8, 8, 5, 8)),
  q('napoli', 'albiol_13', 'Raúl Albiol', 1985, 'Spain', ['CB'], 81, 82, 2018, 20, t(9, 5, 8, 8, 5, 8)),
  q('napoli', 'inler_13', 'Gökhan Inler', 1984, 'Switzerland', ['DM', 'CM'], 80, 82, 2016, 20, t(9, 5, 8, 8, 5, 8)),
];

// ── FC Porto, 2013-14 (Otamendi/Mangala's back line, Jackson up front) ─────────
const PORTO_2013: CuratedSeed[] = [
  q('porto', 'fabiano_13', 'Fabiano', 1988, 'Brazil', ['GK'], 78, 81, 2017, 20, t(8, 5, 8, 7, 5, 8)),
  q('porto', 'mangala_13', 'Eliaquim Mangala', 1991, 'France', ['CB'], 81, 86, 2016, 20, t(8, 6, 8, 7, 5, 8)),
  q('porto', 'otamendi_13', 'Nicolás Otamendi', 1988, 'Argentina', ['CB'], 82, 86, 2017, 20, t(7, 6, 8, 7, 6, 8)),
  q('porto', 'danilo_13', 'Danilo', 1991, 'Brazil', ['RB'], 80, 85, 2016, 20, t(8, 6, 8, 7, 5, 8)),
  q('porto', 'alex_sandro_13', 'Alex Sandro', 1991, 'Brazil', ['LB'], 80, 86, 2017, 20, t(8, 6, 8, 7, 5, 8)),
  q('porto', 'herrera_h_13', 'Héctor Herrera', 1990, 'Mexico', ['CM', 'DM'], 80, 85, 2017, 20, t(8, 6, 8, 7, 5, 8)),
  q('porto', 'fernando_p13', 'Fernando', 1987, 'Brazil', ['DM'], 80, 83, 2015, 20, t(9, 5, 8, 8, 5, 8)),
  q('porto', 'jackson_13', 'Jackson Martínez', 1986, 'Colombia', ['ST'], 83, 85, 2015, 20, t(8, 6, 9, 7, 5, 8)),
  q('porto', 'quintero_13', 'Juan Fernando Quintero', 1993, 'Colombia', ['AM'], 76, 85, 2017, 25, t(6, 7, 8, 6, 6, 8)),
];

// ── AS Monaco, 2013-14 (the Rybolovlev spending: Falcao, James, Moutinho) ───────
const MONACO_2013: CuratedSeed[] = [
  q('monaco', 'subasic_13', 'Danijel Subašić', 1984, 'Croatia', ['GK'], 80, 82, 2017, 20, t(9, 5, 8, 8, 5, 8)),
  q('monaco', 'falcao_13', 'Radamel Falcao', 1986, 'Colombia', ['ST'], 85, 87, 2018, 30, t(9, 7, 9, 7, 5, 8)),
  q('monaco', 'james_13', 'James Rodríguez', 1991, 'Colombia', ['AM', 'LW'], 83, 89, 2018, 20, t(8, 6, 9, 7, 5, 8)),
  q('monaco', 'moutinho_13', 'João Moutinho', 1986, 'Portugal', ['CM', 'AM'], 83, 85, 2017, 15, t(9, 6, 9, 8, 4, 8)),
  q('monaco', 'carvalho_r13', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 82, 83, 2015, 25, t(9, 6, 8, 8, 5, 8)),
  q('monaco', 'toulalan_13', 'Jérémy Toulalan', 1983, 'France', ['DM', 'CB'], 81, 82, 2016, 20, t(9, 5, 8, 8, 4, 8)),
  q('monaco', 'kondogbia_13', 'Geoffrey Kondogbia', 1993, 'France', ['DM', 'CM'], 78, 85, 2018, 20, t(7, 6, 8, 7, 5, 8)),
  q('monaco', 'riviere_13', 'Emmanuel Rivière', 1990, 'France', ['ST'], 76, 80, 2017, 20, t(7, 6, 8, 7, 5, 8)),
  // Anthony Martial — seeded young (17, just arrived from Lyon) for his real 2015
  // Monaco→United move, the club-record fee for a teenager Van Gaal gambled on.
  q('monaco', 'martial_13', 'Anthony Martial', 1995, 'France', ['ST', 'LW'], 62, 87, 2019, 15, t(8, 7, 9, 7, 6, 8)),
];

// ── Sevilla, 2013-14 (Emery's cup kings; Rakitić the metronome) ────────────────
const SEVILLA_2013: CuratedSeed[] = [
  q('sevilla', 'beto_13', 'Beto', 1982, 'Portugal', ['GK'], 78, 80, 2016, 20, t(8, 5, 8, 7, 5, 8)),
  q('sevilla', 'rakitic_13', 'Ivan Rakitić', 1988, 'Croatia', ['CM', 'AM'], 84, 87, 2015, 15, t(9, 6, 9, 8, 4, 8)),
  q('sevilla', 'gameiro_13', 'Kevin Gameiro', 1987, 'France', ['ST'], 80, 83, 2017, 20, t(8, 6, 8, 7, 5, 8)),
  q('sevilla', 'bacca_13', 'Carlos Bacca', 1986, 'Colombia', ['ST'], 81, 84, 2017, 20, t(8, 6, 8, 7, 5, 8)),
  q('sevilla', 'fazio_13', 'Federico Fazio', 1987, 'Argentina', ['CB'], 79, 82, 2016, 20, t(8, 5, 8, 7, 5, 8)),
  q('sevilla', 'carrico_13', 'Daniel Carriço', 1988, 'Portugal', ['CB', 'DM'], 77, 80, 2017, 20, t(8, 5, 8, 8, 5, 8)),
  q('sevilla', 'vitolo_13', 'Vitolo', 1989, 'Spain', ['LW', 'RW'], 79, 84, 2017, 20, t(8, 6, 8, 7, 5, 8)),
];

// ── Olympique Lyonnais, 2013-14 (Lacazette's breakout; Umtiti & Fekir emerging) ─
const LYON_2013: CuratedSeed[] = [
  q('lyon', 'lopes_13', 'Anthony Lopes', 1990, 'Portugal', ['GK'], 79, 85, 2017, 15, t(8, 6, 8, 8, 5, 8)),
  q('lyon', 'lacazette_13', 'Alexandre Lacazette', 1991, 'France', ['ST'], 81, 87, 2017, 20, t(8, 6, 9, 8, 5, 8)),
  q('lyon', 'gonalons_13', 'Maxime Gonalons', 1989, 'France', ['DM', 'CM'], 79, 82, 2016, 20, t(9, 5, 8, 8, 5, 8)),
  q('lyon', 'grenier_13', 'Clément Grenier', 1991, 'France', ['AM', 'CM'], 78, 84, 2016, 25, t(7, 6, 8, 7, 5, 8)),
  q('lyon', 'umtiti_13', 'Samuel Umtiti', 1993, 'France', ['CB'], 76, 87, 2017, 15, t(8, 6, 9, 8, 5, 8)),
  q('lyon', 'fekir_13', 'Nabil Fekir', 1993, 'France', ['AM', 'ST'], 74, 86, 2018, 25, t(7, 7, 9, 7, 6, 8)),
  q('lyon', 'gomis_13', 'Bafétimbi Gomis', 1985, 'France', ['ST'], 79, 81, 2014, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── Schalke 04, 2013-14 (Draxler the jewel; Huntelaar's goals) ──────────────────
const SCHALKE_2013: CuratedSeed[] = [
  q('schalke', 'fahrmann_13', 'Ralf Fährmann', 1988, 'Germany', ['GK'], 78, 82, 2017, 20, t(8, 5, 8, 8, 5, 7)),
  q('schalke', 'draxler_13', 'Julian Draxler', 1993, 'Germany', ['AM', 'LW'], 80, 88, 2018, 20, t(7, 7, 9, 7, 5, 8)),
  q('schalke', 'huntelaar_13', 'Klaas-Jan Huntelaar', 1983, 'Netherlands', ['ST'], 82, 83, 2015, 20, t(8, 6, 9, 7, 5, 8)),
  q('schalke', 'howedes_13', 'Benedikt Höwedes', 1988, 'Germany', ['CB'], 81, 83, 2017, 20, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('schalke', 'matip_13', 'Joel Matip', 1991, 'Cameroon', ['CB', 'DM'], 79, 84, 2015, 20, t(9, 5, 8, 8, 5, 8)),
  q('schalke', 'neustadter_13', 'Roman Neustädter', 1988, 'Germany', ['DM', 'CB'], 77, 80, 2016, 20, t(8, 5, 8, 8, 5, 8)),
  q('schalke', 'boateng_kp_13', 'Kevin-Prince Boateng', 1987, 'Ghana', ['AM', 'CM'], 79, 81, 2015, 25, t(5, 8, 8, 6, 7, 8)),
];

// ── Fiorentina, 2013-14 (Montella's side; Cuadrado the flyer) ──────────────────
const FIORENTINA_2013: CuratedSeed[] = [
  q('fiorentina', 'cuadrado_13', 'Juan Cuadrado', 1988, 'Colombia', ['RW', 'RB'], 81, 85, 2017, 20, t(7, 6, 8, 7, 6, 8)),
  q('fiorentina', 'gomez_m13', 'Mario Gómez', 1985, 'Germany', ['ST'], 81, 83, 2016, 30, t(8, 6, 8, 7, 5, 8)),
  q('fiorentina', 'borja_valero_13', 'Borja Valero', 1985, 'Spain', ['CM', 'AM'], 81, 83, 2017, 15, t(9, 5, 8, 8, 4, 8)),
  q('fiorentina', 'pizarro_d13', 'David Pizarro', 1979, 'Chile', ['CM', 'DM'], 79, 80, 2015, 20, t(8, 6, 8, 7, 5, 8)),
  q('fiorentina', 'gonzalo_r13', 'Gonzalo Rodríguez', 1984, 'Argentina', ['CB'], 80, 82, 2016, 20, t(9, 5, 8, 8, 5, 8)),
  q('fiorentina', 'aquilani_13', 'Alberto Aquilani', 1984, 'Italy', ['CM', 'AM'], 79, 81, 2015, 30, t(8, 6, 8, 7, 5, 8)),
];

// ── Augmentations of the 2013 pack's existing (thin) context sellers ────────────
const AJAX_2013_EXTRA: CuratedSeed[] = [
  q('ajax', 'blind_13', 'Daley Blind', 1990, 'Netherlands', ['LB', 'DM'], 79, 84, 2016, 15, t(9, 5, 8, 8, 4, 8)),
  q('ajax', 'klaassen_13', 'Davy Klaassen', 1993, 'Netherlands', ['CM', 'AM'], 75, 84, 2017, 15, t(9, 5, 9, 8, 4, 8)),
  q('ajax', 'schone_13', 'Lasse Schöne', 1986, 'Denmark', ['CM', 'AM'], 78, 80, 2016, 20, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'bazoer_13', 'Riechedly Bazoer', 1996, 'Netherlands', ['DM', 'CM'], 66, 84, 2018, 15, t(7, 6, 9, 7, 5, 8)),
];
const BENFICA_2013_EXTRA: CuratedSeed[] = [
  q('benfica', 'andre_gomes_13', 'André Gomes', 1993, 'Portugal', ['CM', 'AM'], 77, 86, 2018, 20, t(8, 6, 8, 7, 5, 8)),
  q('benfica', 'gaitan_13', 'Nicolás Gaitán', 1988, 'Argentina', ['LW', 'AM'], 81, 84, 2016, 20, t(7, 6, 8, 7, 6, 8)),
  q('benfica', 'salvio_13', 'Eduardo Salvio', 1990, 'Argentina', ['RW'], 80, 83, 2017, 20, t(7, 6, 8, 7, 5, 8)),
  q('benfica', 'lima_13', 'Lima', 1983, 'Brazil', ['ST'], 79, 81, 2016, 20, t(8, 6, 8, 7, 5, 8)),
];
const ROMA_2013_EXTRA: CuratedSeed[] = [
  q('roma', 'pjanic_13', 'Miralem Pjanić', 1990, 'Bosnia', ['AM', 'CM'], 82, 87, 2018, 15, t(9, 6, 9, 8, 4, 8)),
  q('roma', 'benatia_13', 'Mehdi Benatia', 1987, 'Morocco', ['CB'], 82, 85, 2018, 20, t(9, 5, 8, 8, 5, 8)),
  q('roma', 'nainggolan_13', 'Radja Nainggolan', 1988, 'Belgium', ['CM', 'DM'], 82, 85, 2018, 20, t(7, 7, 9, 8, 6, 8)),
  q('roma', 'ljajic_13', 'Adem Ljajić', 1991, 'Serbia', ['LW', 'AM'], 78, 83, 2017, 20, t(6, 7, 8, 6, 6, 8)),
  q('roma', 'florenzi_13', 'Alessandro Florenzi', 1991, 'Italy', ['RB', 'CM'], 78, 84, 2017, 20, t(9, 5, 9, 9, 5, 8), { loyalty: 88 }),
];
const VALENCIA_2013_EXTRA: CuratedSeed[] = [
  q('valencia', 'parejo_13', 'Dani Parejo', 1989, 'Spain', ['CM', 'AM'], 80, 84, 2017, 20, t(7, 6, 8, 8, 5, 8)),
  q('valencia', 'alcacer_13', 'Paco Alcácer', 1993, 'Spain', ['ST'], 76, 84, 2017, 20, t(8, 6, 8, 7, 5, 8)),
  q('valencia', 'bernat_13', 'Juan Bernat', 1993, 'Spain', ['LB', 'LW'], 76, 84, 2018, 15, t(8, 6, 8, 8, 5, 8)),
  q('valencia', 'mathieu_13', 'Jérémy Mathieu', 1983, 'France', ['CB', 'LB'], 81, 83, 2015, 20, t(8, 5, 8, 7, 5, 8)),
];

/** The European selling clubs of the 2013-14 world — new clubs plus the
 *  augmentations of the pack's existing thin sellers. Merged by CONCATENATION
 *  into the man-utd-2013 universe. */
// ── Sporting CP, 2013-14 (the academy that never stops exporting) ───────────────
const SPORTING_2013: CuratedSeed[] = [
  q('sporting', 'rui_patricio_13', 'Rui Patrício', 1988, 'Portugal', ['GK'], 82, 85, 2017, 15, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('sporting', 'cedric_13', 'Cédric Soares', 1991, 'Portugal', ['RB'], 76, 82, 2016, 15, t(8, 5, 8, 8, 5, 8)),
  q('sporting', 'rojo_13', 'Marcos Rojo', 1990, 'Argentina', ['CB', 'LB'], 78, 83, 2016, 20, t(7, 6, 8, 7, 6, 8)),
  q('sporting', 'w_carvalho_13', 'William Carvalho', 1992, 'Portugal', ['DM'], 78, 86, 2018, 15, t(8, 6, 9, 7, 5, 8)),
  q('sporting', 'adrien_silva_13', 'Adrien Silva', 1989, 'Portugal', ['CM', 'AM'], 78, 82, 2016, 20, t(8, 6, 8, 8, 5, 8)),
  q('sporting', 'carrillo_13', 'André Carrillo', 1991, 'Peru', ['RW', 'LW'], 76, 82, 2017, 20, t(7, 6, 8, 7, 6, 8)),
  q('sporting', 'capel_13', 'Diego Capel', 1988, 'Spain', ['LW'], 75, 80, 2016, 25, t(7, 6, 8, 7, 6, 8)),
  q('sporting', 'slimani_13', 'Islam Slimani', 1988, 'Algeria', ['ST'], 77, 82, 2017, 20, t(7, 6, 8, 7, 6, 8)),
  q('sporting', 'montero_13', 'Fredy Montero', 1987, 'Colombia', ['ST'], 76, 79, 2016, 20, t(7, 6, 8, 7, 6, 8)),
  // Bruno Fernandes — seeded young (19) at Sporting, the launch pad for his real
  // January-2020 move to United, the goal-and-assist engine of the Solskjær rebuild.
  q('sporting', 'bruno_f_13', 'Bruno Fernandes', 1994, 'Portugal', ['AM', 'CM'], 68, 89, 2018, 10, t(9, 7, 9, 8, 5, 9)),
];

export const EUROPE_2013_SQUADS: Record<string, CuratedSeed[]> = {
  atletico: ATLETICO_2013,
  dortmund: DORTMUND_2013,
  napoli: NAPOLI_2013,
  porto: PORTO_2013,
  monaco: MONACO_2013,
  sporting: SPORTING_2013,
  sevilla: SEVILLA_2013,
  lyon: LYON_2013,
  schalke: SCHALKE_2013,
  fiorentina: FIORENTINA_2013,
  // augmentations
  ajax: AJAX_2013_EXTRA,
  benfica: BENFICA_2013_EXTRA,
  roma: ROMA_2013_EXTRA,
  valencia: VALENCIA_2013_EXTRA,
};
