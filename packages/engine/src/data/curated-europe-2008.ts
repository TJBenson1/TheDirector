/**
 * European selling clubs — 2008-09 (M12A rollout, the talent pipeline).
 *
 * The real clubs OUTSIDE the modelled Premier League that fed the big leagues in
 * the takeover era: Ajax (Suárez, Vertonghen, Huntelaar), Atlético (Agüero,
 * Forlán), Lyon (Benzema, Lloris), Porto (Lisandro, Meireles), Werder (Diego,
 * a teenage Özil). Gives the man-city-2008 world (the Abu Dhabi takeover) the
 * deep market its billions deserve. Ability/potential/personality are HIDDEN
 * designer estimates (§7); clubs, birth years, positions and contracts are real.
 *
 * Dani Alves and Seydou Keita are already curated at Barça in the 2008 pack, so
 * they are omitted here — no double-roster.
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

// ── Ajax, 2008-09 (Suárez & Huntelaar up front, a teenage Vertonghen behind) ────
const AJAX_2008: CuratedSeed[] = [
  q('ajax', 'stekelenburg_08', 'Maarten Stekelenburg', 1982, 'Netherlands', ['GK'], 80, 84, 2012, 20, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'van_der_wiel_08', 'Gregory van der Wiel', 1988, 'Netherlands', ['RB'], 76, 84, 2012, 20, t(7, 6, 8, 7, 5, 8)),
  q('ajax', 'vertonghen_08', 'Jan Vertonghen', 1987, 'Belgium', ['CB', 'LB'], 78, 87, 2012, 15, t(9, 5, 8, 8, 5, 8)),
  q('ajax', 'huntelaar_08', 'Klaas-Jan Huntelaar', 1983, 'Netherlands', ['ST'], 82, 85, 2011, 20, t(8, 6, 9, 7, 5, 8)),
  q('ajax', 'suarez_aj08', 'Luis Suárez', 1987, 'Uruguay', ['ST'], 81, 90, 2013, 15, t(7, 7, 10, 7, 7, 8)),
  q('ajax', 'de_zeeuw_08', 'Demy de Zeeuw', 1983, 'Netherlands', ['DM', 'CM'], 77, 80, 2011, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'emanuelson_08', 'Urby Emanuelson', 1986, 'Netherlands', ['LB', 'LW'], 76, 81, 2012, 20, t(7, 6, 8, 7, 6, 8)),
];

// ── PSV, 2008-09 ────────────────────────────────────────────────────────────────
const PSV_2008: CuratedSeed[] = [
  q('psv', 'afellay_08', 'Ibrahim Afellay', 1986, 'Netherlands', ['AM', 'LW'], 79, 84, 2011, 20, t(8, 6, 8, 7, 5, 8)),
  q('psv', 'dzsudzsak_08', 'Balázs Dzsudzsák', 1987, 'Hungary', ['LW', 'RW'], 77, 83, 2012, 20, t(7, 6, 8, 7, 5, 8)),
  q('psv', 'lazovic_08', 'Danko Lazović', 1983, 'Serbia', ['ST', 'LW'], 76, 79, 2011, 20, t(7, 6, 8, 7, 6, 8)),
  q('psv', 'simons_08', 'Timmy Simons', 1976, 'Belgium', ['DM', 'CB'], 78, 79, 2010, 15, t(9, 5, 8, 8, 4, 8)),
  q('psv', 'salcido_08', 'Carlos Salcido', 1980, 'Mexico', ['LB', 'DM'], 77, 80, 2011, 20, t(8, 5, 8, 8, 5, 8)),
  q('psv', 'koevermans_08', 'Danny Koevermans', 1978, 'Netherlands', ['ST'], 75, 78, 2011, 25, t(7, 6, 8, 7, 5, 8)),
];

// ── FC Porto, 2008-09 (Jesualdo's champions; Lisandro & Lucho the jewels) ───────
const PORTO_2008: CuratedSeed[] = [
  q('porto', 'helton_08', 'Helton', 1978, 'Brazil', ['GK'], 79, 81, 2012, 20, t(8, 5, 8, 8, 5, 7)),
  q('porto', 'bruno_alves_08', 'Bruno Alves', 1981, 'Portugal', ['CB'], 80, 83, 2012, 20, t(8, 6, 8, 8, 5, 8)),
  q('porto', 'lisandro_08', 'Lisandro López', 1983, 'Argentina', ['ST'], 82, 84, 2011, 20, t(8, 6, 9, 7, 5, 8)),
  q('porto', 'lucho_08', 'Lucho González', 1981, 'Argentina', ['CM', 'AM'], 81, 83, 2011, 20, t(8, 6, 8, 8, 5, 8)),
  q('porto', 'meireles_08', 'Raul Meireles', 1983, 'Portugal', ['CM', 'AM'], 79, 84, 2012, 20, t(8, 6, 8, 8, 5, 8)),
  q('porto', 'rodriguez_c_08', 'Cristian Rodríguez', 1985, 'Uruguay', ['LW', 'LB'], 77, 81, 2012, 20, t(7, 6, 8, 7, 6, 8)),
  q('porto', 'hulk_08', 'Hulk', 1986, 'Brazil', ['RW', 'ST'], 78, 87, 2013, 20, t(8, 7, 9, 7, 5, 8)),
];

// ── Benfica, 2008-09 (Di María & Ramires on the way up) ─────────────────────────
const BENFICA_2008: CuratedSeed[] = [
  q('benfica', 'di_maria_be08', 'Ángel Di María', 1988, 'Argentina', ['LW', 'RW'], 79, 89, 2012, 20, t(8, 6, 9, 7, 6, 8)),
  q('benfica', 'ramires_08', 'Ramires', 1987, 'Brazil', ['CM', 'DM'], 78, 85, 2013, 15, t(8, 6, 9, 7, 5, 8)),
  q('benfica', 'david_luiz_08', 'David Luiz', 1987, 'Brazil', ['CB'], 78, 86, 2013, 20, t(6, 7, 8, 6, 7, 8)),
  q('benfica', 'cardozo_08', 'Óscar Cardozo', 1983, 'Paraguay', ['ST'], 79, 83, 2012, 20, t(8, 6, 8, 8, 5, 8)),
  q('benfica', 'aimar_08', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 80, 82, 2011, 30, t(8, 6, 8, 8, 5, 8)),
  q('benfica', 'nuno_gomes_08', 'Nuno Gomes', 1976, 'Portugal', ['ST'], 78, 79, 2010, 25, t(8, 6, 8, 9, 5, 8), { loyalty: 88 }),
  q('benfica', 'luisao_08', 'Luisão', 1981, 'Brazil', ['CB'], 80, 82, 2012, 20, t(8, 6, 8, 8, 5, 8), { loyalty: 88 }),
];

// ── Sporting CP, 2008-09 (Moutinho & Veloso before their moves) ─────────────────
const SPORTING_2008: CuratedSeed[] = [
  q('sporting', 'moutinho_08', 'João Moutinho', 1986, 'Portugal', ['CM', 'AM'], 81, 86, 2012, 15, t(9, 6, 9, 8, 4, 8)),
  q('sporting', 'veloso_08', 'Miguel Veloso', 1986, 'Portugal', ['DM', 'CM'], 78, 83, 2012, 20, t(8, 5, 8, 8, 5, 8)),
  q('sporting', 'liedson_08', 'Liédson', 1977, 'Brazil', ['ST'], 80, 81, 2011, 20, t(8, 6, 8, 8, 5, 8)),
  q('sporting', 'izmailov_08', 'Marat Izmailov', 1982, 'Russia', ['RW', 'AM'], 77, 80, 2012, 25, t(6, 6, 8, 7, 6, 8)),
  q('sporting', 'rui_patricio_08', 'Rui Patrício', 1988, 'Portugal', ['GK'], 77, 87, 2013, 15, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('sporting', 'polga_08', 'Tonel', 1980, 'Portugal', ['CB'], 76, 78, 2011, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── Olympique Lyonnais, 2008-09 (Benzema's last year; Lloris arrives) ───────────
const LYON_2008: CuratedSeed[] = [
  q('lyon', 'lloris_08', 'Hugo Lloris', 1986, 'France', ['GK'], 82, 88, 2013, 15, t(9, 5, 9, 8, 4, 8)),
  q('lyon', 'benzema_08', 'Karim Benzema', 1987, 'France', ['ST'], 83, 90, 2011, 15, t(7, 7, 9, 7, 5, 8)),
  q('lyon', 'juninho_08', 'Juninho Pernambucano', 1975, 'Brazil', ['CM', 'AM'], 82, 83, 2010, 20, t(9, 6, 8, 8, 5, 8)),
  q('lyon', 'govou_08', 'Sidney Govou', 1979, 'France', ['RW', 'ST'], 78, 80, 2011, 20, t(7, 6, 8, 8, 5, 8)),
  q('lyon', 'grosso_08', 'Fabio Grosso', 1977, 'Italy', ['LB'], 79, 80, 2011, 20, t(8, 5, 8, 8, 5, 8)),
  q('lyon', 'cris_08', 'Cris', 1977, 'Brazil', ['CB'], 80, 81, 2011, 20, t(8, 6, 8, 8, 6, 7)),
  q('lyon', 'kallstrom_08', 'Kim Källström', 1982, 'Sweden', ['CM'], 78, 81, 2012, 20, t(8, 5, 8, 8, 5, 8)),
];

// ── Olympique de Marseille, 2008-09 ─────────────────────────────────────────────
const MARSEILLE_2008: CuratedSeed[] = [
  q('marseille', 'mandanda_08', 'Steve Mandanda', 1985, 'France', ['GK'], 81, 85, 2013, 15, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('marseille', 'niang_08', 'Mamadou Niang', 1979, 'Senegal', ['ST'], 79, 81, 2011, 20, t(7, 6, 8, 7, 6, 8)),
  q('marseille', 'ben_arfa_08', 'Hatem Ben Arfa', 1987, 'France', ['AM', 'RW'], 79, 86, 2012, 25, t(5, 8, 8, 6, 7, 7)),
  q('marseille', 'cana_08', 'Lorik Cana', 1983, 'Albania', ['DM', 'CB'], 78, 80, 2011, 20, t(7, 6, 8, 7, 7, 8)),
  q('marseille', 'kone_b_08', 'Bakari Koné', 1981, 'Ivory Coast', ['RW', 'ST'], 76, 79, 2011, 20, t(7, 6, 8, 7, 6, 8)),
  q('marseille', 'zenden_08', 'Boudewijn Zenden', 1976, 'Netherlands', ['LW', 'LB'], 76, 78, 2010, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Sevilla, 2008-09 ────────────────────────────────────────────────────────────
const SEVILLA_2008: CuratedSeed[] = [
  q('sevilla', 'palop_08', 'Andrés Palop', 1973, 'Spain', ['GK'], 79, 80, 2011, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 88 }),
  q('sevilla', 'luis_fabiano_08', 'Luís Fabiano', 1980, 'Brazil', ['ST'], 82, 84, 2011, 25, t(6, 7, 8, 6, 6, 7)),
  q('sevilla', 'kanoute_08', 'Frédéric Kanouté', 1977, 'Mali', ['ST'], 82, 83, 2011, 25, t(8, 6, 8, 8, 5, 8)),
  q('sevilla', 'navas_08', 'Jesús Navas', 1985, 'Spain', ['RW'], 81, 84, 2013, 20, t(8, 5, 8, 9, 6, 7), { loyalty: 88 }),
  q('sevilla', 'renato_08', 'Renato', 1979, 'Brazil', ['DM', 'CM'], 78, 80, 2011, 20, t(8, 5, 8, 7, 5, 8)),
  q('sevilla', 'squillaci_08', 'Sébastien Squillaci', 1980, 'France', ['CB'], 77, 79, 2011, 20, t(8, 5, 8, 7, 5, 7)),
];

// ── Villarreal, 2008-09 (the season they nearly won La Liga) ────────────────────
const VILLARREAL_2008: CuratedSeed[] = [
  q('villarreal', 'diego_lopez_08', 'Diego López', 1981, 'Spain', ['GK'], 79, 83, 2012, 15, t(9, 5, 8, 8, 4, 8)),
  q('villarreal', 'rossi_08', 'Giuseppe Rossi', 1987, 'Italy', ['ST'], 80, 87, 2013, 30, t(8, 6, 9, 7, 5, 8)),
  q('villarreal', 'cazorla_08', 'Santi Cazorla', 1984, 'Spain', ['AM', 'LW'], 81, 86, 2013, 20, t(9, 5, 8, 8, 4, 8)),
  q('villarreal', 'senna_08', 'Marcos Senna', 1976, 'Spain', ['DM', 'CM'], 80, 81, 2011, 20, t(9, 5, 8, 8, 4, 8)),
  q('villarreal', 'capdevila_08', 'Joan Capdevila', 1978, 'Spain', ['LB'], 79, 80, 2011, 20, t(8, 5, 8, 8, 5, 8)),
  q('villarreal', 'pires_08', 'Robert Pirès', 1973, 'France', ['LW', 'AM'], 80, 81, 2010, 20, t(8, 6, 8, 8, 5, 8)),
];

// ── Atlético Madrid, 2008-09 (Agüero & Forlán, the Kun–Cachavacha strike pair) ──
const ATLETICO_2008: CuratedSeed[] = [
  q('atletico', 'aguero_08', 'Sergio Agüero', 1988, 'Argentina', ['ST'], 84, 90, 2012, 20, t(8, 7, 9, 7, 5, 8)),
  q('atletico', 'forlan_08', 'Diego Forlán', 1979, 'Uruguay', ['ST'], 83, 85, 2011, 20, t(9, 6, 8, 8, 5, 8)),
  q('atletico', 'maxi_08', 'Maxi Rodríguez', 1981, 'Argentina', ['RW', 'AM'], 79, 82, 2011, 20, t(7, 6, 8, 7, 5, 8)),
  q('atletico', 'simao_08', 'Simão', 1979, 'Portugal', ['LW', 'RW'], 80, 82, 2011, 20, t(8, 6, 8, 7, 5, 8)),
  q('atletico', 'heitinga_08', 'John Heitinga', 1983, 'Netherlands', ['CB', 'DM'], 79, 82, 2012, 20, t(8, 5, 8, 8, 6, 8)),
  q('atletico', 'antonio_lopez_08', 'Antonio López', 1981, 'Spain', ['LB'], 77, 79, 2011, 20, t(8, 5, 7, 8, 5, 7)),
  q('atletico', 'ujfalusi_08', 'Tomáš Ujfaluši', 1978, 'Czechia', ['CB', 'RB'], 78, 79, 2011, 20, t(8, 5, 8, 7, 6, 7)),
];

// ── AS Roma, 2008-09 ────────────────────────────────────────────────────────────
const ROMA_2008: CuratedSeed[] = [
  q('roma', 'totti_08', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 85, 86, 2012, 25, t(8, 7, 8, 10, 5, 7), { loyalty: 96 }),
  q('roma', 'de_rossi_08', 'Daniele De Rossi', 1983, 'Italy', ['DM', 'CM'], 83, 86, 2012, 20, t(8, 6, 8, 9, 6, 8), { loyalty: 90 }),
  q('roma', 'vucinic_08', 'Mirko Vučinić', 1983, 'Montenegro', ['ST', 'LW'], 80, 83, 2012, 25, t(6, 7, 8, 7, 6, 8)),
  q('roma', 'aquilani_08', 'Alberto Aquilani', 1984, 'Italy', ['CM', 'AM'], 79, 84, 2011, 30, t(8, 6, 8, 8, 5, 8)),
  q('roma', 'mexes_08', 'Philippe Mexès', 1982, 'France', ['CB'], 80, 82, 2011, 20, t(6, 7, 8, 6, 7, 7)),
  q('roma', 'perrotta_08', 'Simone Perrotta', 1977, 'Italy', ['CM'], 78, 79, 2011, 20, t(9, 5, 8, 8, 4, 8)),
  q('roma', 'doni_08', 'Doni', 1979, 'Brazil', ['GK'], 78, 80, 2011, 20, t(8, 5, 8, 8, 6, 7)),
];

// ── Fiorentina, 2008-09 (Gilardino, Mutu and a teenage Jovetić) ─────────────────
const FIORENTINA_2008: CuratedSeed[] = [
  q('fiorentina', 'frey_08', 'Sébastien Frey', 1980, 'France', ['GK'], 80, 82, 2012, 20, t(8, 6, 8, 8, 5, 7)),
  q('fiorentina', 'gilardino_08', 'Alberto Gilardino', 1982, 'Italy', ['ST'], 80, 82, 2012, 20, t(8, 6, 8, 8, 5, 8)),
  q('fiorentina', 'mutu_08', 'Adrian Mutu', 1979, 'Romania', ['ST', 'AM'], 80, 82, 2011, 20, t(5, 7, 8, 6, 7, 7)),
  q('fiorentina', 'montolivo_08', 'Riccardo Montolivo', 1985, 'Italy', ['CM', 'AM'], 79, 84, 2012, 20, t(9, 5, 8, 8, 4, 8)),
  q('fiorentina', 'melo_08', 'Felipe Melo', 1983, 'Brazil', ['DM'], 79, 82, 2011, 20, t(6, 7, 8, 7, 7, 8)),
  q('fiorentina', 'jovetic_08', 'Stevan Jovetić', 1989, 'Montenegro', ['AM', 'ST'], 74, 86, 2013, 25, t(8, 6, 9, 7, 5, 8)),
  q('fiorentina', 'gamberini_08', 'Alessandro Gamberini', 1981, 'Italy', ['CB'], 77, 79, 2011, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── Werder Bremen, 2008-09 (Diego the fulcrum, a teenage Özil emerging) ─────────
const WERDER_2008: CuratedSeed[] = [
  q('werder', 'diego_we08', 'Diego', 1985, 'Brazil', ['AM'], 83, 86, 2011, 20, t(7, 7, 9, 7, 5, 8)),
  q('werder', 'ozil_we08', 'Mesut Özil', 1988, 'Germany', ['AM'], 78, 89, 2011, 15, t(8, 6, 9, 7, 5, 9)),
  q('werder', 'pizarro_we08', 'Claudio Pizarro', 1978, 'Peru', ['ST'], 80, 82, 2011, 20, t(8, 6, 8, 8, 5, 8)),
  q('werder', 'frings_we08', 'Torsten Frings', 1976, 'Germany', ['DM', 'CM'], 80, 81, 2010, 20, t(9, 5, 8, 8, 5, 8)),
  q('werder', 'naldo_we08', 'Naldo', 1982, 'Brazil', ['CB'], 79, 82, 2012, 20, t(8, 5, 8, 8, 5, 8)),
  q('werder', 'mertesacker_we08', 'Per Mertesacker', 1984, 'Germany', ['CB'], 80, 84, 2012, 20, t(9, 5, 8, 8, 4, 8)),
  q('werder', 'wiese_we08', 'Tim Wiese', 1981, 'Germany', ['GK'], 78, 81, 2012, 20, t(7, 6, 8, 7, 6, 7)),
];

/** The European selling clubs of the 2008-09 world, merged into the
 *  man-city-2008 universe (all whole new clubs). */
export const EUROPE_2008_SQUADS: Record<string, CuratedSeed[]> = {
  ajax: AJAX_2008,
  psv: PSV_2008,
  porto: PORTO_2008,
  benfica: BENFICA_2008,
  sporting: SPORTING_2008,
  lyon: LYON_2008,
  marseille: MARSEILLE_2008,
  sevilla: SEVILLA_2008,
  villarreal: VILLARREAL_2008,
  atletico: ATLETICO_2008,
  roma: ROMA_2008,
  fiorentina: FIORENTINA_2008,
  werder: WERDER_2008,
};
