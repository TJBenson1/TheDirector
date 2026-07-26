/**
 * European selling clubs — 2010-11 (M12A rollout, the talent pipeline).
 *
 * The real clubs OUTSIDE the modelled Premier League that fed the 2010s big
 * leagues: the Dutch, Portuguese, French, Spanish and Italian sides whose best
 * players moved on (Falcao/Hulk's Porto, Agüero/De Gea's Atlético, Cavani's
 * Napoli, Vertonghen/Eriksen's Ajax). Adding them as real squads gives the
 * 2010 world (Liverpool — FSG Reset) the deep, realistic market the flagship
 * 1999 world already has. Ability/potential/personality are HIDDEN designer
 * estimates (§7); clubs, birth years, positions and contracts are real.
 *
 * Suárez (Ajax) and Di María (Real) are already curated in the 2010 pack, so
 * they are deliberately omitted here — no double-roster.
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

// ── Ajax, 2010-11 (De Boer's side; the next Dutch export wave) ──────────────────
const AJAX_2010: CuratedSeed[] = [
  q('ajax', 'stekelenburg_10', 'Maarten Stekelenburg', 1982, 'Netherlands', ['GK'], 81, 83, 2013, 20, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'van_der_wiel_10', 'Gregory van der Wiel', 1988, 'Netherlands', ['RB'], 79, 84, 2013, 20, t(7, 6, 8, 7, 5, 8)),
  q('ajax', 'alderweireld_10', 'Toby Alderweireld', 1989, 'Belgium', ['CB', 'RB'], 78, 87, 2014, 15, t(9, 5, 8, 8, 4, 8)),
  q('ajax', 'vertonghen_10', 'Jan Vertonghen', 1987, 'Belgium', ['CB', 'LB'], 82, 87, 2012, 15, t(9, 5, 8, 8, 5, 8)),
  q('ajax', 'anita_10', 'Vurnon Anita', 1989, 'Netherlands', ['DM', 'RB'], 76, 82, 2013, 15, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'eriksen_10', 'Christian Eriksen', 1992, 'Denmark', ['AM', 'CM'], 76, 89, 2014, 15, t(9, 6, 9, 8, 4, 8)),
  q('ajax', 'de_jong_s_10', 'Siem de Jong', 1988, 'Netherlands', ['AM', 'ST'], 77, 83, 2014, 20, t(8, 6, 8, 8, 5, 8)),
  q('ajax', 'sulejmani_10', 'Miralem Sulejmani', 1988, 'Serbia', ['LW', 'ST'], 74, 81, 2013, 20, t(6, 6, 8, 6, 6, 8)),
];

// ── PSV, 2010-11 ────────────────────────────────────────────────────────────────
const PSV_2010: CuratedSeed[] = [
  q('psv', 'toivonen_10', 'Ola Toivonen', 1986, 'Sweden', ['ST', 'AM'], 78, 82, 2013, 20, t(7, 6, 8, 7, 5, 8)),
  q('psv', 'dzsudzsak_10', 'Balázs Dzsudzsák', 1987, 'Hungary', ['LW', 'RW'], 79, 83, 2012, 20, t(7, 6, 8, 7, 5, 8)),
  q('psv', 'lens_10', 'Jeremain Lens', 1987, 'Netherlands', ['RW', 'ST'], 78, 83, 2013, 20, t(7, 6, 8, 7, 6, 8)),
  q('psv', 'wijnaldum_10', 'Georginio Wijnaldum', 1990, 'Netherlands', ['AM', 'CM'], 76, 86, 2014, 15, t(9, 6, 9, 8, 4, 8)),
  q('psv', 'engelaar_10', 'Orlando Engelaar', 1979, 'Netherlands', ['DM', 'CM'], 76, 78, 2012, 20, t(8, 5, 7, 7, 5, 8)),
  q('psv', 'pieters_10', 'Erik Pieters', 1988, 'Netherlands', ['LB'], 76, 82, 2014, 20, t(8, 5, 8, 8, 5, 8)),
  q('psv', 'manolev_ps10', 'Stanislav Manolev', 1985, 'Bulgaria', ['RB'], 74, 79, 2013, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── FC Porto, 2010-11 (the treble side; Falcao & Hulk about to be sold on) ──────
const PORTO_2010: CuratedSeed[] = [
  q('porto', 'helton_10', 'Helton', 1978, 'Brazil', ['GK'], 79, 80, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('porto', 'falcao_10', 'Radamel Falcao', 1986, 'Colombia', ['ST'], 85, 90, 2014, 20, t(9, 7, 9, 7, 5, 8)),
  q('porto', 'hulk_10', 'Hulk', 1986, 'Brazil', ['RW', 'ST'], 84, 87, 2014, 20, t(8, 7, 9, 7, 5, 8)),
  q('porto', 'moutinho_10', 'João Moutinho', 1986, 'Portugal', ['CM', 'AM'], 83, 86, 2014, 15, t(9, 6, 9, 8, 4, 8)),
  q('porto', 'guarin_10', 'Fredy Guarín', 1986, 'Colombia', ['CM', 'AM'], 80, 84, 2014, 20, t(7, 6, 8, 7, 6, 8)),
  q('porto', 'rolando_10', 'Rolando', 1985, 'Portugal', ['CB'], 79, 83, 2014, 20, t(8, 5, 8, 8, 5, 8)),
  q('porto', 'otamendi_10', 'Nicolás Otamendi', 1988, 'Argentina', ['CB'], 78, 86, 2014, 20, t(7, 6, 8, 7, 6, 8)),
  q('porto', 'fernando_10', 'Fernando', 1987, 'Brazil', ['DM'], 78, 84, 2014, 20, t(9, 5, 8, 8, 5, 8)),
  q('porto', 'varela_10', 'Silvestre Varela', 1985, 'Portugal', ['LW', 'RW'], 77, 81, 2014, 20, t(8, 6, 8, 7, 5, 8)),
];

// ── Benfica, 2010-11 (Jesus's champions; the David Luiz/Coentrão exports) ───────
const BENFICA_2010: CuratedSeed[] = [
  q('benfica', 'roberto_be10', 'Roberto', 1986, 'Spain', ['GK'], 77, 80, 2014, 20, t(8, 5, 8, 7, 5, 7)),
  q('benfica', 'coentrao_10', 'Fábio Coentrão', 1988, 'Portugal', ['LB', 'LW'], 82, 86, 2014, 20, t(8, 6, 9, 7, 6, 8)),
  q('benfica', 'david_luiz_10', 'David Luiz', 1987, 'Brazil', ['CB'], 82, 86, 2014, 20, t(6, 7, 8, 6, 7, 8)),
  q('benfica', 'luisao_10', 'Luisão', 1981, 'Brazil', ['CB'], 81, 82, 2014, 20, t(8, 6, 8, 8, 5, 8), { loyalty: 88 }),
  q('benfica', 'javi_garcia_10', 'Javi García', 1987, 'Spain', ['DM', 'CM'], 79, 83, 2014, 20, t(9, 5, 8, 8, 4, 8)),
  q('benfica', 'gaitan_10', 'Nicolás Gaitán', 1988, 'Argentina', ['LW', 'AM'], 79, 85, 2015, 20, t(7, 6, 8, 7, 6, 8)),
  q('benfica', 'aimar_10', 'Pablo Aimar', 1979, 'Argentina', ['AM'], 80, 82, 2012, 30, t(8, 6, 8, 8, 5, 8)),
  q('benfica', 'cardozo_10', 'Óscar Cardozo', 1983, 'Paraguay', ['ST'], 81, 83, 2014, 20, t(8, 6, 8, 8, 5, 8)),
  q('benfica', 'maxi_pereira_10', 'Maxi Pereira', 1984, 'Uruguay', ['RB'], 78, 80, 2014, 20, t(8, 5, 8, 8, 5, 8)),
];

// ── Olympique Lyonnais, 2010-11 ────────────────────────────────────────────────
const LYON_2010: CuratedSeed[] = [
  q('lyon', 'lloris_10', 'Hugo Lloris', 1986, 'France', ['GK'], 84, 88, 2014, 15, t(9, 5, 9, 8, 4, 8)),
  q('lyon', 'gourcuff_10', 'Yoann Gourcuff', 1986, 'France', ['AM'], 82, 85, 2014, 30, t(7, 7, 8, 7, 6, 7)),
  q('lyon', 'gomis_10', 'Bafétimbi Gomis', 1985, 'France', ['ST'], 79, 82, 2014, 20, t(7, 6, 8, 7, 5, 8)),
  q('lyon', 'bastos_10', 'Michel Bastos', 1983, 'Brazil', ['LW', 'LB'], 79, 82, 2014, 20, t(7, 6, 8, 7, 6, 8)),
  q('lyon', 'pjanic_10', 'Miralem Pjanić', 1990, 'Bosnia', ['AM', 'CM'], 78, 88, 2014, 15, t(9, 6, 9, 8, 4, 8)),
  q('lyon', 'toulalan_10', 'Jérémy Toulalan', 1983, 'France', ['DM', 'CB'], 81, 83, 2013, 20, t(9, 5, 8, 8, 4, 8)),
  q('lyon', 'cissokho_10', 'Aly Cissokho', 1987, 'France', ['LB'], 77, 81, 2014, 20, t(7, 5, 8, 7, 6, 8)),
  q('lyon', 'briand_10', 'Jimmy Briand', 1985, 'France', ['ST', 'RW'], 76, 79, 2013, 20, t(7, 6, 8, 7, 5, 8)),
];

// ── Olympique de Marseille, 2010-11 (the 2010 Ligue 1 champions) ────────────────
const MARSEILLE_2010: CuratedSeed[] = [
  q('marseille', 'mandanda_10', 'Steve Mandanda', 1985, 'France', ['GK'], 82, 85, 2014, 15, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('marseille', 'valbuena_10', 'Mathieu Valbuena', 1984, 'France', ['AM', 'RW'], 81, 83, 2014, 20, t(8, 6, 8, 8, 5, 8)),
  q('marseille', 'gignac_10', 'André-Pierre Gignac', 1985, 'France', ['ST'], 79, 82, 2014, 20, t(6, 6, 8, 7, 6, 8)),
  q('marseille', 'remy_10', 'Loïc Rémy', 1987, 'France', ['ST', 'RW'], 79, 84, 2014, 25, t(7, 6, 8, 7, 6, 8)),
  q('marseille', 'diawara_10', 'Souleymane Diawara', 1979, 'Senegal', ['CB'], 78, 79, 2013, 20, t(7, 6, 8, 7, 6, 7)),
  q('marseille', 'lucho_10', 'Lucho González', 1981, 'Argentina', ['CM', 'AM'], 80, 82, 2013, 20, t(8, 6, 8, 8, 5, 8)),
  q('marseille', 'heinze_10', 'Gabriel Heinze', 1978, 'Argentina', ['CB', 'LB'], 79, 80, 2012, 25, t(8, 7, 8, 7, 6, 7)),
];

// ── Sevilla, 2010-11 ────────────────────────────────────────────────────────────
const SEVILLA_2010: CuratedSeed[] = [
  q('sevilla', 'negredo_10', 'Álvaro Negredo', 1985, 'Spain', ['ST'], 81, 84, 2014, 20, t(8, 6, 8, 7, 5, 8)),
  q('sevilla', 'navas_10', 'Jesús Navas', 1985, 'Spain', ['RW'], 82, 84, 2014, 20, t(8, 5, 8, 9, 6, 7), { loyalty: 88 }),
  q('sevilla', 'kanoute_10', 'Frédéric Kanouté', 1977, 'Mali', ['ST'], 80, 81, 2012, 25, t(8, 6, 8, 8, 5, 8)),
  q('sevilla', 'luis_fabiano_10', 'Luís Fabiano', 1980, 'Brazil', ['ST'], 80, 82, 2012, 25, t(6, 7, 8, 6, 6, 7)),
  q('sevilla', 'rakitic_10', 'Ivan Rakitić', 1988, 'Croatia', ['CM', 'AM'], 79, 87, 2015, 15, t(9, 6, 9, 8, 4, 8)),
  q('sevilla', 'fazio_10', 'Federico Fazio', 1987, 'Argentina', ['CB'], 77, 82, 2014, 20, t(8, 5, 8, 7, 5, 8)),
  q('sevilla', 'perotti_10', 'Diego Perotti', 1988, 'Argentina', ['LW'], 76, 82, 2014, 25, t(7, 6, 8, 7, 6, 8)),
];

// ── Villarreal, 2010-11 (the "Yellow Submarine" of Rossi & Cazorla) ─────────────
const VILLARREAL_2010: CuratedSeed[] = [
  q('villarreal', 'diego_lopez_10', 'Diego López', 1981, 'Spain', ['GK'], 80, 83, 2014, 15, t(9, 5, 8, 8, 4, 8)),
  q('villarreal', 'rossi_10', 'Giuseppe Rossi', 1987, 'Italy', ['ST'], 82, 87, 2014, 30, t(8, 6, 9, 7, 5, 8)),
  q('villarreal', 'cazorla_10', 'Santi Cazorla', 1984, 'Spain', ['AM', 'LW'], 83, 86, 2014, 20, t(9, 5, 8, 8, 4, 8)),
  q('villarreal', 'nilmar_10', 'Nilmar', 1984, 'Brazil', ['ST'], 79, 82, 2014, 20, t(7, 6, 8, 7, 6, 8)),
  q('villarreal', 'borja_valero_10', 'Borja Valero', 1985, 'Spain', ['CM', 'AM'], 79, 84, 2014, 15, t(9, 5, 8, 8, 4, 8)),
  q('villarreal', 'bruno_10', 'Bruno Soriano', 1984, 'Spain', ['DM', 'CM'], 78, 82, 2014, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 88 }),
  q('villarreal', 'marchena_10', 'Carlos Marchena', 1979, 'Spain', ['CB'], 78, 79, 2012, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── Atlético Madrid, 2010-11 (Agüero, Forlán and a teenage De Gea) ─────────────
const ATLETICO_2010: CuratedSeed[] = [
  q('atletico', 'de_gea_10', 'David de Gea', 1990, 'Spain', ['GK'], 80, 90, 2014, 15, t(9, 6, 9, 8, 4, 8)),
  q('atletico', 'aguero_10', 'Sergio Agüero', 1988, 'Argentina', ['ST'], 86, 90, 2014, 20, t(8, 7, 9, 7, 5, 8)),
  q('atletico', 'forlan_10', 'Diego Forlán', 1979, 'Uruguay', ['ST'], 84, 85, 2013, 20, t(9, 6, 8, 8, 5, 8)),
  q('atletico', 'simao_10', 'Simão', 1979, 'Portugal', ['LW', 'RW'], 80, 82, 2012, 20, t(8, 6, 8, 7, 5, 8)),
  q('atletico', 'reyes_10', 'José Antonio Reyes', 1983, 'Spain', ['LW', 'ST'], 79, 82, 2013, 20, t(6, 6, 8, 7, 6, 8)),
  q('atletico', 'raul_garcia_10', 'Raúl García', 1986, 'Spain', ['CM', 'AM'], 78, 82, 2014, 20, t(8, 5, 8, 8, 5, 8)),
  q('atletico', 'tiago_10', 'Tiago', 1981, 'Portugal', ['CM', 'DM'], 79, 80, 2013, 20, t(9, 5, 8, 8, 5, 8)),
  q('atletico', 'antonio_lopez_10', 'Antonio López', 1981, 'Spain', ['LB'], 76, 78, 2012, 20, t(8, 5, 7, 8, 5, 7)),
];

// ── AS Roma, 2010-11 ────────────────────────────────────────────────────────────
const ROMA_2010: CuratedSeed[] = [
  q('roma', 'totti_10', 'Francesco Totti', 1976, 'Italy', ['AM', 'ST'], 84, 85, 2014, 25, t(8, 7, 8, 10, 5, 7), { loyalty: 96 }),
  q('roma', 'de_rossi_10', 'Daniele De Rossi', 1983, 'Italy', ['DM', 'CM'], 84, 86, 2014, 20, t(8, 6, 8, 9, 6, 8), { loyalty: 90 }),
  q('roma', 'vucinic_10', 'Mirko Vučinić', 1983, 'Montenegro', ['ST', 'LW'], 81, 83, 2014, 25, t(6, 7, 8, 7, 6, 8)),
  q('roma', 'mexes_10', 'Philippe Mexès', 1982, 'France', ['CB'], 80, 82, 2011, 20, t(6, 7, 8, 6, 7, 7)),
  q('roma', 'burdisso_10', 'Nicolás Burdisso', 1981, 'Argentina', ['CB'], 78, 80, 2014, 20, t(8, 5, 8, 8, 6, 7)),
  q('roma', 'pizarro_d_10', 'David Pizarro', 1979, 'Chile', ['CM', 'DM'], 80, 81, 2013, 20, t(8, 6, 8, 7, 5, 8)),
  q('roma', 'borriello_10', 'Marco Borriello', 1982, 'Italy', ['ST'], 78, 80, 2014, 25, t(6, 6, 8, 7, 6, 7)),
  // Mohamed Salah — seeded young (18 in 2010) so the engine can grow him toward his
  // real 2017 Roma→Liverpool move (LEDGER_ENG_2010). At the anchor he is a raw
  // Egyptian teenager; the taper does the rest.
  q('roma', 'salah_ro10', 'Mohamed Salah', 1992, 'Egypt', ['RW', 'LW', 'ST'], 62, 90, 2018, 10, t(9, 6, 9, 7, 4, 9)),
];

// ── Napoli, 2010-11 (the Lavezzi–Hamšík–Cavani front) ──────────────────────────
const NAPOLI_2010: CuratedSeed[] = [
  q('napoli', 'de_sanctis_10', 'Morgan De Sanctis', 1977, 'Italy', ['GK'], 79, 80, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('napoli', 'cavani_10', 'Edinson Cavani', 1987, 'Uruguay', ['ST'], 84, 89, 2014, 15, t(9, 6, 9, 8, 5, 8)),
  q('napoli', 'lavezzi_10', 'Ezequiel Lavezzi', 1985, 'Argentina', ['LW', 'ST'], 82, 85, 2014, 20, t(7, 6, 8, 7, 6, 8)),
  q('napoli', 'hamsik_10', 'Marek Hamšík', 1987, 'Slovakia', ['AM', 'CM'], 83, 86, 2014, 15, t(9, 6, 9, 9, 4, 8), { loyalty: 88 }),
  q('napoli', 'maggio_10', 'Christian Maggio', 1982, 'Italy', ['RB', 'RW'], 79, 81, 2014, 20, t(8, 5, 8, 8, 5, 8)),
  q('napoli', 'gargano_10', 'Walter Gargano', 1984, 'Uruguay', ['DM', 'CM'], 78, 80, 2014, 20, t(8, 5, 8, 7, 5, 8)),
  q('napoli', 'cannavaro_p_10', 'Paolo Cannavaro', 1981, 'Italy', ['CB'], 78, 79, 2014, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── TSG Hoffenheim, 2010-11 (Rangnick's side; Firmino's launch pad) ─────────────
const HOFFENHEIM_2010: CuratedSeed[] = [
  q('hoffenheim', 'starke_ho10', 'Tom Starke', 1981, 'Germany', ['GK'], 78, 80, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('hoffenheim', 'beck_ho10', 'Andreas Beck', 1987, 'Germany', ['RB'], 77, 81, 2014, 15, t(8, 5, 8, 8, 5, 8)),
  q('hoffenheim', 'compper_ho10', 'Marvin Compper', 1985, 'Germany', ['CB'], 76, 79, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('hoffenheim', 'simunic_ho10', 'Josip Šimunić', 1978, 'Croatia', ['CB'], 78, 79, 2012, 20, t(7, 6, 8, 7, 6, 7)),
  q('hoffenheim', 'salihovic_ho10', 'Sejad Salihović', 1984, 'Bosnia', ['LB'], 76, 79, 2014, 20, t(7, 6, 8, 7, 6, 8)),
  q('hoffenheim', 'luiz_gustavo_ho10', 'Luiz Gustavo', 1987, 'Brazil', ['DM'], 79, 85, 2014, 15, t(9, 5, 9, 7, 4, 8)),
  q('hoffenheim', 'sigurdsson_ho10', 'Gylfi Sigurðsson', 1989, 'Iceland', ['AM', 'CM'], 74, 84, 2014, 15, t(9, 6, 8, 8, 4, 8)),
  q('hoffenheim', 'obasi_ho10', 'Chinedu Obasi', 1986, 'Nigeria', ['LW', 'ST'], 75, 79, 2013, 20, t(7, 6, 8, 7, 6, 8)),
  q('hoffenheim', 'ba_ho10', 'Demba Ba', 1985, 'Senegal', ['ST'], 79, 83, 2013, 20, t(7, 6, 9, 6, 6, 8)),
  q('hoffenheim', 'ibisevic_ho10', 'Vedad Ibišević', 1984, 'Bosnia', ['ST'], 79, 82, 2014, 20, t(8, 5, 8, 8, 5, 8)),
  // Roberto Firmino — seeded young (19 in 2010) for his real 2015 Hoffenheim→
  // Liverpool move. The false-nine engine Klopp built out of a Bundesliga forward.
  q('hoffenheim', 'firmino_ho10', 'Roberto Firmino', 1991, 'Brazil', ['AM', 'ST'], 64, 88, 2016, 10, t(9, 6, 9, 8, 4, 9)),
];

// ── Southampton, 2010-11 (the League One rebuild that became a talent factory) ───
const SOUTHAMPTON_2010: CuratedSeed[] = [
  q('southampton', 'k_davis_so10', 'Kelvin Davis', 1976, 'England', ['GK'], 72, 74, 2013, 20, t(8, 5, 8, 9, 5, 7)),
  q('southampton', 'fonte_so10', 'José Fonte', 1983, 'Portugal', ['CB'], 72, 82, 2014, 15, t(9, 5, 8, 8, 4, 8)),
  q('southampton', 'hammond_so10', 'Dean Hammond', 1983, 'England', ['CM'], 70, 74, 2013, 20, t(8, 5, 8, 8, 5, 7)),
  q('southampton', 'lallana_so10', 'Adam Lallana', 1988, 'England', ['AM', 'CM'], 73, 85, 2014, 15, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('southampton', 'schneiderlin_so10', 'Morgan Schneiderlin', 1989, 'France', ['DM', 'CM'], 71, 84, 2014, 15, t(9, 5, 8, 8, 4, 8)),
  q('southampton', 'lambert_so10', 'Rickie Lambert', 1982, 'England', ['ST'], 74, 79, 2014, 20, t(8, 5, 8, 9, 5, 8)),
  // Southampton's future-Liverpool trio — seeded young for their real Anfield moves
  // (Lovren 2014, Clyne 2015, Mané 2016). All three cross the M27 pipeline.
  q('southampton', 'lovren_so10', 'Dejan Lovren', 1989, 'Croatia', ['CB'], 70, 84, 2015, 15, t(8, 6, 8, 7, 6, 8)),
  q('southampton', 'clyne_so10', 'Nathaniel Clyne', 1991, 'England', ['RB'], 66, 83, 2016, 15, t(9, 5, 8, 8, 4, 8)),
  q('southampton', 'mane_so10', 'Sadio Mané', 1992, 'Senegal', ['RW', 'LW', 'ST'], 60, 90, 2017, 10, t(9, 6, 9, 8, 4, 9)),
];

/** The European selling clubs of the 2010-11 world, merged into the
 *  liverpool-2010 universe (all whole new clubs). */
export const EUROPE_2010_SQUADS: Record<string, CuratedSeed[]> = {
  ajax: AJAX_2010,
  psv: PSV_2010,
  porto: PORTO_2010,
  benfica: BENFICA_2010,
  lyon: LYON_2010,
  marseille: MARSEILLE_2010,
  sevilla: SEVILLA_2010,
  villarreal: VILLARREAL_2010,
  atletico: ATLETICO_2010,
  roma: ROMA_2010,
  napoli: NAPOLI_2010,
  hoffenheim: HOFFENHEIM_2010,
  southampton: SOUTHAMPTON_2010,
};
