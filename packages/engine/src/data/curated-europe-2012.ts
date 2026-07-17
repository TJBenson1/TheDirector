/**
 * European selling clubs — 2011-12 (M12A rollout, the talent pipeline).
 *
 * The real clubs OUTSIDE the modelled Bundesliga that fed the early-2010s big
 * leagues: Porto (Hulk, Moutinho, James), Napoli (Cavani, Hamšík), Roma (Totti,
 * a young Lamela & Pjanić), Valencia (Soldado, Jordi Alba), Ajax (Vertonghen,
 * Eriksen), Sevilla (Rakitić, Negredo), Lyon (Lloris, a teenage Lacazette),
 * Benfica (Witsel, Gaitán), Marseille. Gives the dortmund-2012 world (defend the
 * peak before Bayern dismantles it) the deep foreign market it lacks. Ability/
 * potential/personality are HIDDEN designer estimates (§7); clubs, birth years,
 * positions and contracts are real.
 *
 * Names already curated in the 2012 pack (Falcao, Godín, Koke, Courtois at
 * Atlético; Higuaín, Reina, Di María) are omitted — no double-roster.
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

// ── FC Porto, 2011-12 (Hulk, Moutinho, a young James) ──────────────────────────
const PORTO_2012: CuratedSeed[] = [
  q('porto', 'helton_12', 'Helton', 1978, 'Brazil', ['GK'], 80, 81, 2014, 20, t(8, 5, 8, 8, 5, 7)),
  q('porto', 'hulk_12', 'Hulk', 1986, 'Brazil', ['RW', 'ST'], 84, 87, 2014, 20, t(8, 7, 9, 7, 5, 8)),
  q('porto', 'moutinho_12', 'João Moutinho', 1986, 'Portugal', ['CM', 'AM'], 83, 86, 2014, 15, t(9, 6, 9, 8, 4, 8)),
  q('porto', 'james_12', 'James Rodríguez', 1991, 'Colombia', ['AM', 'LW'], 80, 89, 2015, 20, t(8, 6, 9, 7, 5, 8)),
  q('porto', 'fernando_12', 'Fernando', 1987, 'Brazil', ['DM'], 80, 84, 2014, 20, t(9, 5, 8, 8, 5, 8)),
  q('porto', 'rolando_12', 'Rolando', 1985, 'Portugal', ['CB'], 80, 83, 2014, 20, t(8, 5, 8, 8, 5, 8)),
  q('porto', 'varela_12', 'Silvestre Varela', 1985, 'Portugal', ['LW', 'RW'], 78, 82, 2014, 20, t(8, 6, 8, 7, 5, 8)),
  q('porto', 'defour_12', 'Steven Defour', 1988, 'Belgium', ['CM', 'DM'], 78, 83, 2014, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Napoli, 2011-12 (the Cavani–Hamšík–Lavezzi three) ──────────────────────────
const NAPOLI_2012: CuratedSeed[] = [
  q('napoli', 'de_sanctis_12', 'Morgan De Sanctis', 1977, 'Italy', ['GK'], 80, 81, 2014, 20, t(8, 5, 8, 8, 5, 7)),
  q('napoli', 'cavani_12', 'Edinson Cavani', 1987, 'Uruguay', ['ST'], 85, 89, 2014, 15, t(9, 6, 9, 8, 5, 8)),
  q('napoli', 'hamsik_12', 'Marek Hamšík', 1987, 'Slovakia', ['AM', 'CM'], 84, 86, 2016, 15, t(9, 6, 9, 9, 4, 8), { loyalty: 90 }),
  q('napoli', 'fernandez_f12', 'Federico Fernández', 1989, 'Argentina', ['CB'], 79, 84, 2015, 20, t(8, 5, 8, 8, 5, 8)),
  q('napoli', 'pandev_12', 'Goran Pandev', 1983, 'North Macedonia', ['AM', 'ST'], 79, 81, 2014, 20, t(8, 6, 8, 7, 5, 8)),
  q('napoli', 'maggio_12', 'Christian Maggio', 1982, 'Italy', ['RB', 'RW'], 79, 81, 2014, 20, t(8, 5, 8, 8, 5, 8)),
  q('napoli', 'inler_12', 'Gökhan Inler', 1984, 'Switzerland', ['DM', 'CM'], 80, 82, 2015, 20, t(9, 5, 8, 8, 5, 8)),
  q('napoli', 'zuniga_12', 'Juan Zúñiga', 1985, 'Colombia', ['RB', 'LB'], 78, 82, 2015, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── AS Roma, 2011-12 (Totti's twilight; Lamela & Pjanić arriving) ──────────────
const ROMA_2012: CuratedSeed[] = [
  q('roma', 'totti_12', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 84, 85, 2014, 25, t(8, 7, 8, 10, 5, 7), { loyalty: 96 }),
  q('roma', 'de_rossi_12', 'Daniele De Rossi', 1983, 'Italy', ['DM', 'CM'], 84, 86, 2015, 20, t(8, 6, 8, 9, 6, 8), { loyalty: 90 }),
  q('roma', 'lamela_12', 'Erik Lamela', 1992, 'Argentina', ['RW', 'AM'], 77, 87, 2016, 20, t(6, 7, 8, 6, 6, 8)),
  q('roma', 'pjanic_12', 'Miralem Pjanić', 1990, 'Bosnia', ['AM', 'CM'], 80, 87, 2016, 15, t(9, 6, 9, 8, 4, 8)),
  q('roma', 'osvaldo_12', 'Pablo Osvaldo', 1986, 'Italy', ['ST'], 79, 82, 2015, 25, t(5, 8, 8, 6, 7, 8)),
  q('roma', 'burdisso_12', 'Nicolás Burdisso', 1981, 'Argentina', ['CB'], 78, 79, 2014, 20, t(8, 5, 8, 8, 6, 7)),
  q('roma', 'marquinho_12', 'Marquinho', 1986, 'Brazil', ['RW', 'AM'], 76, 79, 2014, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── Valencia, 2011-12 (Soldado's goals, a young Jordi Alba) ─────────────────────
const VALENCIA_2012: CuratedSeed[] = [
  q('valencia', 'diego_alves_12', 'Diego Alves', 1985, 'Brazil', ['GK'], 80, 83, 2015, 15, t(8, 5, 8, 8, 5, 8)),
  q('valencia', 'soldado_12', 'Roberto Soldado', 1985, 'Spain', ['ST'], 82, 84, 2015, 20, t(8, 5, 8, 8, 4, 8)),
  q('valencia', 'feghouli_12', 'Sofiane Feghouli', 1989, 'Algeria', ['RW', 'AM'], 78, 83, 2015, 20, t(7, 6, 8, 7, 5, 8)),
  q('valencia', 'banega_12', 'Ever Banega', 1988, 'Argentina', ['CM', 'AM'], 80, 85, 2015, 20, t(6, 7, 8, 6, 6, 8)),
  q('valencia', 'pablo_hernandez_12', 'Pablo Hernández', 1985, 'Spain', ['RW', 'AM'], 79, 82, 2014, 20, t(8, 5, 8, 7, 5, 8)),
  q('valencia', 'rami_12', 'Adil Rami', 1985, 'France', ['CB'], 79, 83, 2015, 20, t(8, 5, 8, 7, 6, 8)),
  q('valencia', 'mathieu_12', 'Jérémy Mathieu', 1983, 'France', ['CB', 'LB'], 80, 82, 2015, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Ajax, 2011-12 (De Boer's champions; Vertonghen & Eriksen the jewels) ───────
const AJAX_2012: CuratedSeed[] = [
  q('ajax', 'vermeer_12', 'Kenneth Vermeer', 1986, 'Netherlands', ['GK'], 77, 80, 2015, 20, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'vertonghen_12', 'Jan Vertonghen', 1987, 'Belgium', ['CB', 'LB'], 83, 87, 2013, 15, t(9, 5, 8, 8, 5, 8)),
  q('ajax', 'alderweireld_12', 'Toby Alderweireld', 1989, 'Belgium', ['CB', 'RB'], 80, 87, 2015, 15, t(9, 5, 8, 8, 4, 8)),
  q('ajax', 'eriksen_12', 'Christian Eriksen', 1992, 'Denmark', ['AM', 'CM'], 79, 89, 2014, 15, t(9, 6, 9, 8, 4, 8)),
  q('ajax', 'de_jong_s_12', 'Siem de Jong', 1988, 'Netherlands', ['AM', 'ST'], 78, 83, 2015, 20, t(8, 6, 8, 8, 5, 8)),
  q('ajax', 'van_der_wiel_12', 'Gregory van der Wiel', 1988, 'Netherlands', ['RB'], 79, 84, 2013, 20, t(7, 6, 8, 7, 5, 8)),
  q('ajax', 'blind_12', 'Daley Blind', 1990, 'Netherlands', ['LB', 'DM'], 78, 84, 2015, 15, t(9, 5, 8, 8, 4, 8)),
];

// ── Sevilla, 2011-12 (Rakitić the metronome, Negredo the No.9) ─────────────────
const SEVILLA_2012: CuratedSeed[] = [
  q('sevilla', 'negredo_12', 'Álvaro Negredo', 1985, 'Spain', ['ST'], 82, 84, 2015, 20, t(8, 6, 8, 7, 5, 8)),
  q('sevilla', 'navas_12', 'Jesús Navas', 1985, 'Spain', ['RW'], 82, 84, 2014, 20, t(8, 5, 8, 9, 6, 7), { loyalty: 88 }),
  q('sevilla', 'rakitic_12', 'Ivan Rakitić', 1988, 'Croatia', ['CM', 'AM'], 82, 87, 2015, 15, t(9, 6, 9, 8, 4, 8)),
  q('sevilla', 'fazio_12', 'Federico Fazio', 1987, 'Argentina', ['CB'], 78, 82, 2015, 20, t(8, 5, 8, 7, 5, 8)),
  q('sevilla', 'medel_12', 'Gary Medel', 1987, 'Chile', ['DM', 'CB'], 79, 83, 2015, 20, t(6, 7, 8, 7, 7, 8)),
  q('sevilla', 'trochowski_12', 'Piotr Trochowski', 1984, 'Germany', ['AM', 'LW'], 77, 79, 2014, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Olympique Lyonnais, 2011-12 (Lloris the captain; a teenage Lacazette) ──────
const LYON_2012: CuratedSeed[] = [
  q('lyon', 'lloris_12', 'Hugo Lloris', 1986, 'France', ['GK'], 84, 88, 2014, 15, t(9, 5, 9, 8, 4, 8)),
  q('lyon', 'lisandro_12', 'Lisandro López', 1983, 'Argentina', ['ST'], 81, 83, 2014, 20, t(8, 6, 8, 7, 5, 8)),
  q('lyon', 'gomis_12', 'Bafétimbi Gomis', 1985, 'France', ['ST'], 79, 82, 2014, 20, t(7, 6, 8, 7, 5, 8)),
  q('lyon', 'gonalons_12', 'Maxime Gonalons', 1989, 'France', ['DM', 'CM'], 79, 83, 2015, 20, t(9, 5, 8, 8, 5, 8)),
  q('lyon', 'lacazette_12', 'Alexandre Lacazette', 1991, 'France', ['ST', 'LW'], 77, 87, 2015, 20, t(8, 6, 9, 8, 5, 8)),
  q('lyon', 'bastos_12', 'Michel Bastos', 1983, 'Brazil', ['LW', 'LB'], 79, 81, 2014, 20, t(7, 6, 8, 7, 6, 8)),
  q('lyon', 'kallstrom_12', 'Kim Källström', 1982, 'Sweden', ['CM'], 79, 81, 2014, 20, t(8, 5, 8, 8, 5, 8)),
];

// ── Benfica, 2011-12 (Witsel & Gaitán before their moves) ──────────────────────
const BENFICA_2012: CuratedSeed[] = [
  q('benfica', 'artur_12', 'Artur', 1981, 'Brazil', ['GK'], 77, 79, 2014, 20, t(8, 5, 8, 7, 5, 7)),
  q('benfica', 'witsel_12', 'Axel Witsel', 1989, 'Belgium', ['CM', 'DM'], 81, 87, 2015, 20, t(8, 6, 9, 7, 5, 8)),
  q('benfica', 'gaitan_12', 'Nicolás Gaitán', 1988, 'Argentina', ['LW', 'AM'], 81, 85, 2015, 20, t(7, 6, 8, 7, 6, 8)),
  q('benfica', 'cardozo_12', 'Óscar Cardozo', 1983, 'Paraguay', ['ST'], 81, 83, 2014, 20, t(8, 6, 8, 8, 5, 8)),
  q('benfica', 'nolito_12', 'Nolito', 1986, 'Spain', ['LW', 'ST'], 77, 84, 2014, 20, t(7, 6, 8, 7, 5, 8)),
  q('benfica', 'garay_12', 'Ezequiel Garay', 1986, 'Argentina', ['CB'], 82, 85, 2015, 20, t(8, 5, 8, 7, 5, 8)),
  q('benfica', 'aimar_12', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 79, 80, 2013, 30, t(8, 6, 8, 8, 5, 8)),
];

// ── Olympique de Marseille, 2011-12 ────────────────────────────────────────────
const MARSEILLE_2012: CuratedSeed[] = [
  q('marseille', 'mandanda_12', 'Steve Mandanda', 1985, 'France', ['GK'], 83, 85, 2014, 15, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('marseille', 'a_ayew_12', 'André Ayew', 1989, 'Ghana', ['LW', 'ST'], 80, 84, 2015, 20, t(8, 6, 9, 7, 5, 8)),
  q('marseille', 'remy_12', 'Loïc Rémy', 1987, 'France', ['ST', 'RW'], 80, 84, 2014, 20, t(7, 6, 8, 7, 6, 8)),
  q('marseille', 'valbuena_12', 'Mathieu Valbuena', 1984, 'France', ['AM', 'RW'], 81, 83, 2014, 20, t(8, 6, 8, 8, 5, 8)),
  q('marseille', 'amalfitano_12', 'Morgan Amalfitano', 1985, 'France', ['RW', 'CM'], 77, 80, 2014, 20, t(8, 5, 8, 7, 5, 8)),
  q('marseille', 'nkoulou_12', 'Nicolas Nkoulou', 1990, 'Cameroon', ['CB'], 78, 84, 2015, 20, t(8, 5, 8, 8, 5, 8)),
];

/** The European selling clubs of the 2011-12 world, merged into the dortmund-2012
 *  universe (all whole new clubs). */
export const EUROPE_2012_SQUADS: Record<string, CuratedSeed[]> = {
  porto: PORTO_2012,
  napoli: NAPOLI_2012,
  roma: ROMA_2012,
  valencia: VALENCIA_2012,
  ajax: AJAX_2012,
  sevilla: SEVILLA_2012,
  lyon: LYON_2012,
  benfica: BENFICA_2012,
  marseille: MARSEILLE_2012,
};
