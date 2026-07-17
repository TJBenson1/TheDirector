/**
 * Curated domestic mid-tier — 1997-98 Bundesliga (M12 shortlist supply).
 *
 * Real 1997-98 squad players at the modelled Bundesliga's non-elite clubs for
 * the dortmund-1997 world, so options lists read like a real shortlist — the
 * UEFA-Cup-winning Schalke of Lehmann, Wilmots & Thon, Andreas Herzog & Marco
 * Bode at Werder, Yeboah & a young Salihamidžić at Hamburg, Thomas Häßler at
 * 1860, Effenberg at Gladbach, Toni Polster at Köln, Ali Daei at Bielefeld, a
 * young Yıldıray Baştürk at Hansa. HIDDEN designer estimates (§7); real clubs,
 * birth years, positions, contracts. Injury proneness at the population norm
 * (~30). Names already curated in the world are omitted.
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

const SCHALKE_97: CuratedSeed[] = [
  q('schalke', 'lehmann_sc97', 'Jens Lehmann', 1969, 'Germany', ['GK'], 80, 84, 2001, 30, t(8, 7, 9, 7, 6, 8)),
  q('schalke', 'wilmots_sc97', 'Marc Wilmots', 1969, 'Belgium', ['ST', 'AM'], 79, 80, 2000, 30, t(8, 6, 9, 8, 6, 8)),
  q('schalke', 'thon_sc97', 'Olaf Thon', 1966, 'Germany', ['CM', 'CB'], 78, 79, 2000, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('schalke', 'mulder_sc97', 'Youri Mulder', 1969, 'Netherlands', ['ST', 'AM'], 76, 77, 2000, 30, t(8, 5, 8, 8, 5, 8)),
  q('schalke', 'mpenza_sc97', 'Emile Mpenza', 1978, 'Belgium', ['ST'], 76, 82, 2001, 30, t(6, 7, 8, 7, 6, 8)),
  q('schalke', 'buskens_sc97', 'Mike Büskens', 1968, 'Germany', ['RB', 'CB'], 74, 75, 2000, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
];

const WERDER_97: CuratedSeed[] = [
  q('werder', 'rost_we97', 'Frank Rost', 1973, 'Germany', ['GK'], 77, 80, 2001, 30, t(8, 6, 8, 8, 5, 8)),
  q('werder', 'herzog_we97', 'Andreas Herzog', 1968, 'Austria', ['AM', 'CM'], 79, 80, 2000, 30, t(8, 6, 8, 8, 5, 8)),
  q('werder', 'bode_we97', 'Marco Bode', 1969, 'Germany', ['LW', 'ST'], 78, 79, 2001, 30, t(8, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('werder', 'eilts_we97', 'Dieter Eilts', 1964, 'Germany', ['DM'], 76, 77, 2000, 30, t(9, 5, 8, 9, 5, 8), { loyalty: 90 }),
  q('werder', 'labbadia_we97', 'Bruno Labbadia', 1966, 'Germany', ['ST'], 74, 75, 2000, 30, t(7, 6, 8, 7, 5, 8)),
];

const HAMBURG_97: CuratedSeed[] = [
  q('hamburg', 'yeboah_ha97', 'Anthony Yeboah', 1966, 'Ghana', ['ST'], 78, 79, 2000, 30, t(7, 7, 8, 7, 6, 8)),
  q('hamburg', 'kovac_n_ha97', 'Niko Kovač', 1971, 'Croatia', ['DM', 'CM'], 76, 78, 2000, 30, t(9, 5, 8, 8, 5, 8)),
  q('hamburg', 'hollerbach_ha97', 'Bernd Hollerbach', 1969, 'Germany', ['LB', 'DM'], 73, 74, 2000, 30, t(8, 5, 8, 8, 5, 8)),
  q('hamburg', 'cardoso_ha97', 'Rodolfo Cardoso', 1968, 'Argentina', ['AM', 'CM'], 74, 76, 2000, 30, t(7, 6, 8, 7, 5, 8)),
  q('hamburg', 'hertzsch_ha97', 'Ingo Hertzsch', 1977, 'Germany', ['CB'], 72, 77, 2001, 30, t(8, 5, 8, 8, 5, 8)),
];

const MUNICH1860_97: CuratedSeed[] = [
  q('munich_1860', 'hassler_60', 'Thomas Häßler', 1966, 'Germany', ['AM', 'RW'], 79, 80, 2000, 30, t(7, 6, 8, 7, 5, 8)),
  q('munich_1860', 'borimirov_60', 'Daniel Borimirov', 1970, 'Bulgaria', ['CM', 'DM'], 74, 76, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('munich_1860', 'winkler_60', 'Bernhard Winkler', 1970, 'Germany', ['ST'], 73, 74, 2000, 30, t(7, 6, 8, 7, 5, 8)),
  q('munich_1860', 'cerny_60', 'Harald Cerny', 1973, 'Austria', ['AM', 'RW'], 73, 76, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('munich_1860', 'nowak_60', 'Peter Nowak', 1964, 'Germany', ['AM', 'CM'], 73, 74, 2000, 30, t(8, 5, 8, 8, 5, 8)),
];

const GLADBACH_97: CuratedSeed[] = [
  q('gladbach', 'deisler_gl97', 'Sebastian Deisler', 1980, 'Germany', ['RW', 'AM'], 74, 84, 2001, 30, t(8, 5, 8, 7, 6, 8)),
  q('gladbach', 'p_andersson_gl97', 'Patrik Andersson', 1971, 'Sweden', ['CB'], 78, 80, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('gladbach', 'pflipsen_gl97', 'Karlheinz Pflipsen', 1970, 'Germany', ['AM', 'CM'], 73, 75, 2000, 30, t(8, 5, 8, 8, 5, 8)),
  q('gladbach', 'kastenmaier_gl97', 'Robert Kastenmaier', 1973, 'Germany', ['DM', 'CM'], 71, 73, 2001, 30, t(8, 5, 8, 8, 5, 8)),
];

const KOLN_97: CuratedSeed[] = [
  q('koln', 'polster_ko97', 'Toni Polster', 1964, 'Austria', ['ST'], 78, 79, 2000, 30, t(6, 7, 8, 7, 6, 8)),
  q('koln', 'munteanu_ko97', 'Dorinel Munteanu', 1968, 'Romania', ['CM', 'LW'], 77, 78, 2000, 30, t(8, 6, 8, 7, 5, 8)),
  q('koln', 'lottner_ko97', 'Dirk Lottner', 1972, 'Germany', ['AM', 'CM'], 73, 75, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('koln', 'gohlke_ko97', 'Jörg Böhme', 1974, 'Germany', ['LW', 'LB'], 74, 78, 2001, 30, t(7, 6, 8, 7, 5, 8)),
];

const BIELEFELD_97: CuratedSeed[] = [
  q('bielefeld', 'daei_bi97', 'Ali Daei', 1969, 'Iran', ['ST'], 77, 78, 2000, 30, t(7, 6, 8, 7, 5, 8)),
  q('bielefeld', 'kuntz_bi97', 'Stefan Kuntz', 1962, 'Germany', ['ST'], 74, 74, 1999, 30, t(8, 6, 8, 8, 5, 8)),
  q('bielefeld', 'vata_bi97', 'Fatmir Vata', 1972, 'Albania', ['AM', 'CM'], 72, 74, 2001, 30, t(7, 6, 8, 7, 5, 8)),
  q('bielefeld', 'wichniarek_bi97', 'Artur Wichniarek', 1977, 'Poland', ['ST'], 71, 76, 2001, 30, t(7, 6, 8, 7, 5, 8)),
];

const BOCHUM_97: CuratedSeed[] = [
  q('bochum', 'wosz_bo97', 'Dariusz Wosz', 1969, 'Germany', ['AM', 'CM'], 77, 79, 2000, 30, t(8, 5, 8, 8, 5, 8)),
  q('bochum', 'christiansen_bo97', 'Thomas Christiansen', 1973, 'Spain', ['ST'], 74, 77, 2001, 30, t(7, 6, 8, 7, 5, 8)),
  q('bochum', 'freier_bo97', 'Paul Freier', 1979, 'Germany', ['RW', 'CM'], 71, 79, 2002, 30, t(8, 5, 8, 8, 5, 8)),
  q('bochum', 'fahrenhorst_bo97', 'Frank Fahrenhorst', 1977, 'Germany', ['CB'], 72, 76, 2001, 30, t(8, 5, 8, 8, 5, 8)),
];

const HANSA_97: CuratedSeed[] = [
  q('hansa', 'basturk_hr97', 'Yıldıray Baştürk', 1978, 'Turkey', ['AM', 'CM'], 74, 82, 2001, 30, t(8, 5, 8, 7, 5, 8)),
  q('hansa', 'beinlich_hr97', 'Stefan Beinlich', 1972, 'Germany', ['AM', 'LW'], 75, 77, 2000, 30, t(8, 5, 8, 8, 5, 8)),
  q('hansa', 'rydlewicz_hr97', 'René Rydlewicz', 1973, 'Germany', ['CM', 'DM'], 72, 74, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('hansa', 'pieckenhagen_hr97', 'Martin Pieckenhagen', 1971, 'Germany', ['GK'], 72, 74, 2001, 30, t(8, 5, 8, 8, 5, 8)),
];

const HERTHA_97: CuratedSeed[] = [
  q('hertha', 'preetz_he97', 'Michael Preetz', 1967, 'Germany', ['ST'], 76, 77, 2000, 30, t(8, 5, 8, 8, 5, 8)),
  q('hertha', 'kiraly_he97', 'Gábor Király', 1976, 'Hungary', ['GK'], 74, 79, 2001, 30, t(8, 5, 8, 8, 5, 8)),
  q('hertha', 'sverrisson_he97', 'Eyjólfur Sverrisson', 1968, 'Iceland', ['AM', 'ST'], 73, 74, 2000, 30, t(8, 5, 8, 8, 5, 8)),
  q('hertha', 'hartmann_he97', 'Michael Hartmann', 1974, 'Germany', ['LB', 'LW'], 72, 75, 2001, 30, t(8, 5, 8, 8, 5, 8)),
];

const KARLSRUHE_97: CuratedSeed[] = [
  q('karlsruhe', 'dundee_ka97', 'Sean Dundee', 1972, 'South Africa', ['ST'], 74, 76, 2000, 30, t(7, 6, 8, 7, 5, 8)),
  q('karlsruhe', 'kreuzer_ka97', 'Oliver Kreuzer', 1965, 'Germany', ['CB', 'DM'], 72, 73, 1999, 30, t(8, 5, 8, 8, 5, 8)),
  q('karlsruhe', 'carl_ka97', 'Michael Sternkopf', 1968, 'Germany', ['CM'], 71, 72, 2000, 30, t(8, 5, 8, 8, 5, 8)),
];

/** The domestic mid-tier of the 1997-98 Bundesliga. Merged by CONCATENATION into
 *  DORTMUND_1997_SQUADS. */
export const GER_DOMESTIC_1997_SQUADS: Record<string, CuratedSeed[]> = {
  schalke: SCHALKE_97,
  werder: WERDER_97,
  hamburg: HAMBURG_97,
  munich_1860: MUNICH1860_97,
  gladbach: GLADBACH_97,
  koln: KOLN_97,
  bielefeld: BIELEFELD_97,
  bochum: BOCHUM_97,
  hansa: HANSA_97,
  hertha: HERTHA_97,
  karlsruhe: KARLSRUHE_97,
};
