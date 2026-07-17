/**
 * European selling clubs — mid-1990s (M12A rollout, the talent pipeline).
 *
 * The real clubs OUTSIDE the modelled Premier League that fed the mid-90s big
 * leagues: Ajax's post-1995-European-Cup side, PSV, Porto, Deschamps-era Monaco,
 * SuperDepor, Fiorentina and Lazio's Serie A, Dortmund's back-to-back champions.
 * Shared by the 1995 (Liverpool Spice Boys) and 1996 (Wenger's arrival / Gullit's
 * Chelsea) English worlds, which already share their continental elite squads.
 * Ability/potential/personality are HIDDEN designer estimates (§7); clubs, birth
 * years, positions and contracts are real.
 *
 * Names already curated in the mid-90s packs (Van der Sar aside, the Ajax/Milan
 * stars, Batistuta, Zola, Signori, Shevchenko…) are omitted — no double-roster.
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

// ── Ajax, mid-90s (the reigning European champions, being picked apart) ─────────
const AJAX_90S: CuratedSeed[] = [
  q('ajax', 'vandersar_96', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 82, 84, 1999, 20, t(9, 5, 8, 7, 3, 8)),
  q('ajax', 'f_de_boer_96', 'Frank de Boer', 1970, 'Netherlands', ['CB'], 82, 83, 1999, 20, t(9, 5, 8, 8, 4, 8)),
  q('ajax', 'r_de_boer_96', 'Ronald de Boer', 1970, 'Netherlands', ['AM', 'ST'], 80, 81, 1999, 20, t(8, 5, 8, 8, 5, 8)),
  q('ajax', 'melchiot_96', 'Mario Melchiot', 1976, 'Netherlands', ['RB', 'CB'], 74, 82, 1999, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'finidi_96', 'Finidi George', 1971, 'Nigeria', ['RW'], 79, 81, 1998, 20, t(7, 6, 8, 7, 5, 8)),
  q('ajax', 'bogarde_96', 'Winston Bogarde', 1970, 'Netherlands', ['CB', 'LB'], 78, 80, 1998, 20, t(7, 6, 8, 7, 5, 8)),
  q('ajax', 'blind_d_96', 'Danny Blind', 1961, 'Netherlands', ['CB'], 78, 78, 1997, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 90 }),
];

// ── PSV, mid-90s (Nilis & Cocu; a young Van Bommel to come) ─────────────────────
const PSV_90S: CuratedSeed[] = [
  q('psv', 'nilis_96', 'Luc Nilis', 1967, 'Belgium', ['ST'], 81, 82, 1999, 20, t(9, 6, 8, 8, 4, 8)),
  q('psv', 'cocu_96', 'Phillip Cocu', 1970, 'Netherlands', ['CM', 'AM'], 81, 84, 1999, 20, t(9, 5, 8, 8, 4, 8)),
  q('psv', 'jonk_96', 'Wim Jonk', 1966, 'Netherlands', ['CM', 'AM'], 79, 80, 1998, 20, t(9, 5, 8, 8, 5, 8)),
  q('psv', 'numan_96', 'Arthur Numan', 1969, 'Netherlands', ['LB'], 79, 81, 1998, 20, t(9, 5, 8, 8, 4, 8)),
  q('psv', 'zenden_96', 'Boudewijn Zenden', 1976, 'Netherlands', ['LW'], 76, 84, 2000, 20, t(8, 5, 8, 7, 5, 8)),
  q('psv', 'vinck_96', 'Stan Valckx', 1963, 'Netherlands', ['CB'], 76, 77, 1997, 20, t(8, 5, 8, 8, 5, 7)),
];

// ── FC Porto, mid-90s ───────────────────────────────────────────────────────────
const PORTO_90S: CuratedSeed[] = [
  q('porto', 'hilario_96', 'Hilário', 1975, 'Portugal', ['GK'], 76, 81, 1999, 20, t(8, 5, 8, 8, 5, 7)),
  q('porto', 'drulovic_96', 'Ljubinko Drulović', 1968, 'Serbia', ['RW', 'LW'], 77, 79, 1998, 25, t(8, 6, 8, 7, 5, 8)),
  q('porto', 'domingos_96', 'Domingos Paciência', 1968, 'Portugal', ['ST'], 77, 78, 1998, 20, t(8, 6, 8, 8, 5, 8)),
  q('porto', 'jorge_costa_96', 'Jorge Costa', 1971, 'Portugal', ['CB'], 79, 82, 1999, 20, t(9, 6, 8, 9, 6, 7), { loyalty: 88 }),
  q('porto', 'zahovic_96', 'Zlatko Zahovič', 1971, 'Slovenia', ['AM'], 79, 82, 1999, 20, t(7, 7, 8, 6, 6, 8)),
  q('porto', 'emerson_p96', 'Emerson', 1972, 'Brazil', ['DM', 'CM'], 77, 80, 1998, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── AS Monaco, mid-90s (Petit & Djorkaeff; a teenage Henry & Trezeguet to come) ─
const MONACO_90S: CuratedSeed[] = [
  q('monaco', 'petit_96', 'Emmanuel Petit', 1970, 'France', ['DM', 'CB'], 81, 83, 1999, 20, t(8, 6, 8, 7, 5, 8)),
  q('monaco', 'benarbia_96', 'Ali Benarbia', 1968, 'Algeria', ['AM'], 79, 81, 1998, 20, t(7, 6, 8, 7, 5, 8)),
  q('monaco', 'sonny_anderson_96', 'Sonny Anderson', 1970, 'Brazil', ['ST'], 81, 83, 1998, 20, t(8, 6, 8, 8, 5, 8)),
  q('monaco', 'scifo_96', 'Enzo Scifo', 1966, 'Belgium', ['AM'], 79, 80, 1997, 20, t(8, 6, 8, 8, 5, 8)),
  q('monaco', 'dumas_96', 'Franck Dumas', 1968, 'France', ['CB'], 76, 78, 1998, 20, t(8, 5, 8, 8, 5, 7)),
  q('monaco', 'legwinski_96', 'Sylvain Legwinski', 1973, 'France', ['CM'], 74, 79, 1999, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Deportivo La Coruña, mid-90s (SuperDepor: Bebeto, Fran, Mauro Silva) ─────────
const DEPORTIVO_90S: CuratedSeed[] = [
  q('deportivo', 'bebeto_96', 'Bebeto', 1964, 'Brazil', ['ST', 'AM'], 81, 82, 1998, 20, t(8, 6, 8, 8, 5, 8)),
  q('deportivo', 'fran_96', 'Fran', 1969, 'Spain', ['AM', 'LW'], 79, 81, 1999, 20, t(8, 5, 8, 9, 5, 8), { loyalty: 92 }),
  q('deportivo', 'mauro_silva_96', 'Mauro Silva', 1968, 'Brazil', ['DM'], 80, 81, 1999, 20, t(9, 5, 8, 9, 4, 8)),
  q('deportivo', 'donato_96', 'Donato', 1962, 'Spain', ['CB', 'DM'], 78, 78, 1997, 20, t(9, 5, 8, 8, 5, 7)),
  q('deportivo', 'naybet_96', 'Noureddine Naybet', 1970, 'Morocco', ['CB'], 79, 82, 1999, 20, t(9, 5, 8, 8, 5, 8)),
  q('deportivo', 'alfredo_96', 'Alfredo', 1973, 'Spain', ['CM'], 74, 78, 1999, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Fiorentina, mid-90s (Rui Costa the fantasista) ─────────────────────────────
const FIORENTINA_90S: CuratedSeed[] = [
  q('fiorentina', 'rui_costa_96', 'Manuel Rui Costa', 1972, 'Portugal', ['AM'], 83, 86, 1999, 20, t(8, 6, 8, 8, 5, 8)),
  q('fiorentina', 'schwarz_96', 'Stefan Schwarz', 1969, 'Sweden', ['DM', 'CM'], 78, 80, 1998, 20, t(8, 5, 8, 7, 5, 8)),
  q('fiorentina', 'baiano_96', 'Francesco Baiano', 1968, 'Italy', ['AM', 'ST'], 77, 79, 1998, 20, t(7, 6, 8, 7, 5, 8)),
  q('fiorentina', 'amoroso_f96', 'Toldo', 1971, 'Italy', ['GK'], 80, 84, 2000, 20, t(9, 5, 8, 8, 4, 8)),
  q('fiorentina', 'robbiati_96', 'Anselmo Robbiati', 1970, 'Italy', ['LW', 'AM'], 75, 77, 1998, 20, t(7, 5, 8, 7, 5, 8)),
];

// ── Lazio, mid-90s (Bokšić & Casiraghi; Cragnotti's spending begins) ────────────
const LAZIO_90S: CuratedSeed[] = [
  q('lazio', 'fuser_96', 'Diego Fuser', 1968, 'Italy', ['RW', 'CM'], 79, 81, 1999, 20, t(8, 6, 8, 7, 5, 8)),
  q('lazio', 'casiraghi_96', 'Pierluigi Casiraghi', 1969, 'Italy', ['ST'], 79, 80, 1998, 20, t(8, 6, 8, 8, 5, 8)),
  q('lazio', 'favalli_96', 'Giuseppe Favalli', 1972, 'Italy', ['LB', 'CB'], 79, 82, 1999, 20, t(9, 5, 8, 8, 5, 8)),
  q('lazio', 'rambaudi_96', 'Roberto Rambaudi', 1966, 'Italy', ['LW', 'RW'], 76, 78, 1998, 20, t(7, 6, 8, 7, 5, 8)),
  q('lazio', 'nesta_96', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 76, 88, 2001, 20, t(9, 5, 8, 9, 4, 8), { loyalty: 88 }),
  q('lazio', 'marcolin_96', 'Dario Marcolin', 1971, 'Italy', ['CM'], 74, 77, 1998, 20, t(8, 5, 8, 7, 5, 8)),
];

// ── Borussia Dortmund, mid-90s (back-to-back champions, Kings of Europe 1997) ────
const DORTMUND_90S: CuratedSeed[] = [
  q('dortmund', 'moller_96', 'Andreas Möller', 1967, 'Germany', ['AM'], 82, 84, 1999, 20, t(7, 7, 8, 7, 6, 8)),
  q('dortmund', 'ricken_96', 'Lars Ricken', 1976, 'Germany', ['AM', 'ST'], 77, 84, 2000, 20, t(8, 6, 8, 8, 5, 8)),
  q('dortmund', 'freund_96', 'Steffen Freund', 1970, 'Germany', ['DM'], 78, 80, 1999, 20, t(9, 5, 8, 8, 5, 8)),
  q('dortmund', 'kohler_96', 'Jürgen Kohler', 1965, 'Germany', ['CB'], 81, 82, 1998, 20, t(9, 5, 8, 9, 4, 7), { loyalty: 88 }),
  q('dortmund', 'reuter_96', 'Stefan Reuter', 1966, 'Germany', ['RB', 'DM'], 79, 80, 1998, 20, t(9, 5, 8, 8, 4, 8)),
  q('dortmund', 'chapuisat_96', 'Stéphane Chapuisat', 1969, 'Switzerland', ['ST', 'LW'], 80, 82, 1999, 20, t(8, 6, 8, 8, 5, 8)),
  q('dortmund', 'kree_96', 'Karl-Heinz Riedle', 1965, 'Germany', ['ST'], 79, 80, 1997, 20, t(8, 6, 8, 8, 5, 8)),
];

/** The European selling clubs of the mid-90s world, shared by the 1995 and 1996
 *  English universes (all whole new clubs). */
export const EUROPE_MID90S_SQUADS: Record<string, CuratedSeed[]> = {
  ajax: AJAX_90S,
  psv: PSV_90S,
  porto: PORTO_90S,
  monaco: MONACO_90S,
  deportivo: DEPORTIVO_90S,
  fiorentina: FIORENTINA_90S,
  lazio: LAZIO_90S,
  dortmund: DORTMUND_90S,
};
