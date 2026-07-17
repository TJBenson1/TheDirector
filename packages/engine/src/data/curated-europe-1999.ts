/**
 * European selling clubs — 1998-99 (M12A, the talent pipeline).
 *
 * The real clubs OUTSIDE the four modelled leagues that actually fed them: the
 * Dutch, Portuguese, Scottish, Turkish and (already-present) French sides whose
 * best players moved to England/Spain/Italy/Germany. Adding them as real squads
 * makes those moves representable (Van der Sar leaving Ajax for Juve, Van
 * Nistelrooy's PSV, Larsson's Celtic) and gives the market real depth to shop in.
 *
 * Merged into the man-utd-1999 (era-1995-2005) universe: for clubs that already
 * carry a marquee name or two (PSV, Monaco, Marseille) these are ADDITIONS around
 * them; the rest are whole new clubs. Ability/potential/personality are HIDDEN
 * designer estimates (§7); clubs, birth years, positions and contracts are real.
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

// ── Ajax (VDS's real club — he leaves for Juve this very window) ───────────────
const AJAX_1999: CuratedSeed[] = [
  q('ajax', 'vandersar', 'Edwin van der Sar', 1970, 'Netherlands', ['GK'], 84, 85, 2002, 20, t(9, 5, 7, 6, 2, 8)),
  q('ajax', 'melchiot_aj', 'Mario Melchiot', 1976, 'Netherlands', ['RB', 'CB'], 76, 80, 2001, 20, t(8, 5, 8, 7, 5, 8)),
  q('ajax', 'chivu_aj', 'Cristian Chivu', 1980, 'Romania', ['CB', 'LB'], 68, 86, 2003, 20, t(9, 5, 8, 8, 4, 8)),
  q('ajax', 'witschge_aj', 'Richard Witschge', 1969, 'Netherlands', ['CM', 'LW'], 76, 77, 2001, 25, t(8, 6, 7, 7, 5, 8)),
  q('ajax', 'winter_aj', 'Aron Winter', 1967, 'Netherlands', ['CM', 'DM'], 78, 79, 2000, 25, t(9, 5, 8, 8, 4, 8)),
  q('ajax', 'arveladze_aj', 'Shota Arveladze', 1973, 'Georgia', ['ST'], 77, 80, 2001, 25, t(8, 6, 8, 7, 5, 8)),
  q('ajax', 'mccarthy_aj', 'Benni McCarthy', 1977, 'South Africa', ['ST'], 76, 84, 2002, 25, t(6, 7, 8, 6, 6, 8)),
  q('ajax', 'wamberto_aj', 'Wamberto', 1975, 'Brazil', ['ST', 'RW'], 74, 79, 2001, 25, t(7, 6, 8, 6, 6, 8)),
];

// ── PSV additions (Van Nistelrooy is already curated) ──────────────────────────
const PSV_1999_EURO: CuratedSeed[] = [
  q('psv', 'van_bommel_ps', 'Mark van Bommel', 1977, 'Netherlands', ['CM', 'DM'], 77, 86, 2002, 20, t(8, 7, 9, 7, 6, 8)),
  q('psv', 'nilis_ps', 'Luc Nilis', 1967, 'Belgium', ['ST'], 80, 81, 2000, 20, t(9, 6, 8, 8, 4, 8)),
  q('psv', 'ooijer_ps', 'André Ooijer', 1974, 'Netherlands', ['CB', 'DM'], 76, 80, 2002, 20, t(9, 5, 8, 8, 5, 8)),
  q('psv', 'bouma_ps', 'Wilfred Bouma', 1978, 'Netherlands', ['LB', 'CB'], 72, 82, 2003, 20, t(9, 5, 8, 8, 5, 8)),
  q('psv', 'hofland_ps', 'Kevin Hofland', 1979, 'Netherlands', ['CB'], 70, 80, 2003, 20, t(8, 5, 7, 8, 5, 8)),
];

// ── Monaco additions (Barthez & Trezeguet already curated) ─────────────────────
const MONACO_1999_EURO: CuratedSeed[] = [
  q('monaco', 'giuly_mo', 'Ludovic Giuly', 1976, 'France', ['RW', 'ST'], 77, 85, 2002, 25, t(8, 6, 9, 7, 5, 8)),
  q('monaco', 'sagnol_mo', 'Willy Sagnol', 1977, 'France', ['RB'], 76, 84, 2002, 20, t(9, 5, 8, 8, 4, 8)),
  q('monaco', 'simone_mo', 'Marco Simone', 1969, 'Italy', ['ST'], 78, 80, 2001, 25, t(8, 6, 8, 7, 5, 8)),
  q('monaco', 'riise_mo', 'John Arne Riise', 1980, 'Norway', ['LB', 'LW'], 66, 84, 2003, 20, t(9, 6, 9, 8, 5, 8)),
];

// ── Marseille additions (Pirès & Gallas already curated) ───────────────────────
const MARSEILLE_1999_EURO: CuratedSeed[] = [
  q('marseille', 'dugarry_ms', 'Christophe Dugarry', 1972, 'France', ['ST', 'AM'], 78, 80, 2001, 30, t(6, 7, 8, 6, 6, 8)),
  q('marseille', 'ravanelli_ms', 'Fabrizio Ravanelli', 1968, 'Italy', ['ST'], 80, 81, 2001, 25, t(7, 8, 9, 6, 6, 7)),
  q('marseille', 'maurice_ms', 'Florian Maurice', 1974, 'France', ['ST'], 75, 78, 2001, 25, t(7, 6, 8, 7, 5, 7)),
  q('marseille', 'luccin_ms', 'Peter Luccin', 1979, 'France', ['DM', 'CM'], 72, 82, 2003, 25, t(7, 6, 8, 6, 6, 8)),
];

// ── Porto ──────────────────────────────────────────────────────────────────────
const PORTO_1999: CuratedSeed[] = [
  q('porto', 'baia_po', 'Vítor Baía', 1969, 'Portugal', ['GK'], 80, 82, 2002, 20, t(8, 6, 8, 9, 5, 7), { loyalty: 90 }),
  q('porto', 'jardel_po', 'Mário Jardel', 1973, 'Brazil', ['ST'], 84, 85, 2001, 20, t(8, 7, 9, 7, 5, 7)),
  q('porto', 'jorge_costa_po', 'Jorge Costa', 1971, 'Portugal', ['CB'], 79, 81, 2002, 20, t(9, 6, 8, 9, 6, 7), { loyalty: 90 }),
  q('porto', 'deco_po', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 74, 88, 2003, 20, t(8, 6, 9, 7, 5, 8)),
  q('porto', 'drulovic_po', 'Ljubinko Drulović', 1968, 'Serbia', ['RW', 'LW'], 76, 78, 2001, 25, t(8, 6, 8, 7, 5, 8)),
  q('porto', 'capucho_po', 'Capucho', 1972, 'Portugal', ['RW', 'AM'], 75, 79, 2002, 25, t(7, 6, 8, 7, 5, 8)),
  q('porto', 'aloisio_po', 'Aloísio', 1972, 'Brazil', ['CB'], 74, 78, 2002, 20, t(8, 5, 8, 7, 5, 8)),
  q('porto', 'rui_barros_po', 'Rui Barros', 1965, 'Portugal', ['AM'], 74, 75, 2000, 25, t(8, 6, 8, 8, 5, 8)),
];

// ── Benfica ────────────────────────────────────────────────────────────────────
const BENFICA_1999: CuratedSeed[] = [
  q('benfica', 'joao_pinto_be', 'João Pinto', 1971, 'Portugal', ['AM', 'ST'], 79, 82, 2001, 25, t(6, 7, 8, 7, 6, 8)),
  q('benfica', 'nuno_gomes_be', 'Nuno Gomes', 1976, 'Portugal', ['ST'], 78, 85, 2002, 25, t(8, 6, 8, 7, 5, 8)),
  q('benfica', 'poborsky_be', 'Karel Poborský', 1972, 'Czech Republic', ['RW', 'AM'], 78, 80, 2001, 25, t(8, 6, 8, 7, 5, 8)),
  q('benfica', 'van_hooijdonk_be', 'Pierre van Hooijdonk', 1969, 'Netherlands', ['ST'], 79, 81, 2001, 25, t(6, 7, 8, 6, 7, 8)),
  q('benfica', 'sabry_be', 'Sabry', 1976, 'Egypt', ['AM', 'LW'], 74, 79, 2002, 25, t(6, 7, 8, 6, 6, 7)),
  q('benfica', 'helder_be', 'Hélder', 1971, 'Portugal', ['CB'], 75, 78, 2002, 20, t(8, 5, 8, 8, 5, 8)),
];

// ── Celtic ─────────────────────────────────────────────────────────────────────
const CELTIC_1999: CuratedSeed[] = [
  q('celtic', 'larsson_ce', 'Henrik Larsson', 1971, 'Sweden', ['ST', 'AM'], 84, 87, 2003, 20, t(9, 6, 9, 9, 4, 8), { loyalty: 90 }),
  q('celtic', 'moravcik_ce', 'Lubomír Moravčík', 1965, 'Slovakia', ['AM', 'LW'], 80, 81, 2001, 25, t(8, 6, 8, 8, 5, 8)),
  // (Viduka is pre-parked at Leeds in this pack; his real Celtic→Leeds move is a
  //  pre-window rewind for M12C — kept out of Celtic here to avoid a double-roster.)
  q('celtic', 'stubbs_ce', 'Alan Stubbs', 1971, 'England', ['CB'], 76, 78, 2002, 25, t(8, 5, 8, 8, 5, 7)),
  q('celtic', 'lambert_ce', 'Paul Lambert', 1969, 'Scotland', ['CM', 'DM'], 78, 79, 2002, 20, t(9, 5, 8, 8, 4, 8)),
  q('celtic', 'gould_ce', 'Jonathan Gould', 1968, 'Scotland', ['GK'], 72, 74, 2001, 20, t(8, 5, 7, 8, 5, 7)),
  q('celtic', 'mahe_ce', 'Stéphane Mahé', 1968, 'France', ['LB'], 72, 74, 2001, 25, t(7, 5, 7, 7, 6, 7)),
  q('celtic', 'burley_ce', 'Craig Burley', 1971, 'Scotland', ['CM'], 74, 76, 2001, 25, t(8, 5, 8, 7, 5, 7)),
];

// ── Rangers ────────────────────────────────────────────────────────────────────
const RANGERS_1999: CuratedSeed[] = [
  q('rangers', 'van_bronckhorst_ra', 'Giovanni van Bronckhorst', 1975, 'Netherlands', ['CM', 'LB'], 78, 86, 2002, 20, t(9, 6, 9, 8, 4, 8)),
  q('rangers', 'ferguson_ra', 'Barry Ferguson', 1978, 'Scotland', ['CM', 'DM'], 74, 84, 2003, 20, t(8, 6, 9, 9, 5, 8)),
  q('rangers', 'numan_ra', 'Arthur Numan', 1969, 'Netherlands', ['LB'], 78, 80, 2001, 20, t(9, 5, 8, 8, 4, 8)),
  q('rangers', 'reyna_ra', 'Claudio Reyna', 1973, 'United States', ['CM'], 77, 80, 2002, 25, t(9, 5, 8, 7, 5, 8)),
  q('rangers', 'kanchelskis_ra', 'Andrei Kanchelskis', 1969, 'Russia', ['RW'], 78, 80, 2001, 25, t(7, 6, 8, 6, 6, 8)),
  q('rangers', 'wallace_ra', 'Rod Wallace', 1969, 'England', ['ST'], 76, 78, 2001, 25, t(8, 6, 8, 7, 5, 8)),
  q('rangers', 'klos_ra', 'Stefan Klos', 1971, 'Germany', ['GK'], 78, 80, 2003, 20, t(9, 5, 8, 8, 4, 7)),
  q('rangers', 'albertz_ra', 'Jörg Albertz', 1971, 'Germany', ['CM', 'LW'], 77, 79, 2002, 25, t(7, 6, 8, 7, 6, 8)),
];

// ── Galatasaray ────────────────────────────────────────────────────────────────
const GALATASARAY_1999: CuratedSeed[] = [
  q('galatasaray', 'hagi_ga', 'Gheorghe Hagi', 1965, 'Romania', ['AM'], 82, 83, 2001, 25, t(7, 8, 9, 8, 6, 8), { loyalty: 88 }),
  q('galatasaray', 'sukur_ga', 'Hakan Şükür', 1971, 'Turkey', ['ST'], 82, 86, 2002, 20, t(8, 7, 9, 8, 5, 8)),
  q('galatasaray', 'popescu_ga', 'Gheorghe Popescu', 1967, 'Romania', ['CB', 'DM'], 79, 81, 2001, 20, t(9, 6, 8, 8, 5, 8)),
  q('galatasaray', 'taffarel_ga', 'Cláudio Taffarel', 1966, 'Brazil', ['GK'], 78, 79, 2001, 20, t(8, 6, 8, 8, 5, 7)),
  q('galatasaray', 'emre_ga', 'Emre Belözoğlu', 1980, 'Turkey', ['CM', 'AM'], 66, 86, 2003, 25, t(7, 7, 9, 7, 6, 8)),
  q('galatasaray', 'arif_ga', 'Arif Erdem', 1972, 'Turkey', ['ST', 'RW'], 76, 79, 2002, 25, t(8, 6, 8, 8, 5, 8)),
  q('galatasaray', 'bulent_ga', 'Bülent Korkmaz', 1968, 'Turkey', ['CB'], 75, 77, 2001, 20, t(9, 5, 8, 9, 5, 7), { loyalty: 90 }),
];

// ── Feyenoord ──────────────────────────────────────────────────────────────────
const FEYENOORD_1999: CuratedSeed[] = [
  q('feyenoord', 'dudek_fe', 'Jerzy Dudek', 1973, 'Poland', ['GK'], 78, 84, 2002, 20, t(8, 6, 8, 7, 5, 8)),
  q('feyenoord', 'tomasson_fe', 'Jon Dahl Tomasson', 1976, 'Denmark', ['ST', 'AM'], 78, 84, 2002, 20, t(9, 6, 9, 7, 4, 8)),
  q('feyenoord', 'cruz_fe', 'Julio Cruz', 1974, 'Argentina', ['ST'], 78, 82, 2002, 25, t(8, 6, 8, 7, 5, 8)),
  q('feyenoord', 'bosvelt_fe', 'Paul Bosvelt', 1970, 'Netherlands', ['DM', 'CM'], 76, 78, 2001, 20, t(9, 5, 8, 8, 4, 8)),
  q('feyenoord', 'kalou_fe', 'Bonaventure Kalou', 1978, 'Ivory Coast', ['ST', 'RW'], 74, 82, 2002, 25, t(7, 6, 8, 6, 6, 8)),
  q('feyenoord', 'van_wonderen_fe', 'Kees van Wonderen', 1969, 'Netherlands', ['CB'], 73, 75, 2001, 20, t(8, 5, 8, 8, 5, 7)),
];

/** All the European selling clubs of the 1999 world, merged into the man-utd-1999
 *  universe (additions for clubs already present; whole new clubs otherwise). */
export const EUROPE_1999_SQUADS: Record<string, CuratedSeed[]> = {
  ajax: AJAX_1999,
  psv: PSV_1999_EURO,
  monaco: MONACO_1999_EURO,
  marseille: MARSEILLE_1999_EURO,
  porto: PORTO_1999,
  benfica: BENFICA_1999,
  celtic: CELTIC_1999,
  rangers: RANGERS_1999,
  galatasaray: GALATASARAY_1999,
  feyenoord: FEYENOORD_1999,
};
