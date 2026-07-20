/**
 * Curated real players — 2006 Serie B "Calciopoli" pack (Italy).
 *
 * The vertical slice for "Juventus — 2006: Calciopoli — Serie B". Stripped of two
 * Scudetti and relegated to Serie B in disgrace, Juventus have been gutted: the
 * mercenaries fled (Cannavaro and Emerson to Madrid, Thuram and Zambrotta to
 * Barça, Ibrahimović and Vieira to Inter), but the legends stayed to drag the Old
 * Lady back — Buffon, Del Piero, Nedvěd, Trezeguet, Camoranesi — alongside the
 * academy kids (Chiellini, Marchisio, De Ceglie) who would become the dynasty's
 * spine. Reality: they win Serie B at a canter, go straight back up, and rebuild
 * into the side that wins nine Scudetti in a row.
 *
 * The Serie B opponents are procedural (the second tier is not curated). Once
 * Juventus are promoted, the Serie A world and the elite of Europe are exactly the
 * late-2000s pack — so this file reuses curated-serie-a-2007 for everyone but the
 * Bianconeri themselves. Ability/potential/personality are HIDDEN designer
 * estimates (§7); clubs, birth years, positions and contracts are real.
 */

import type { ClubId, HardBlock, PlayerState, Position } from '../types.js';
import type { CuratedSeed } from './curated-1999.js';
import { MILAN_2007_SQUADS } from './curated-serie-a-2007.js';

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

// ── Juventus, 2006–07 (Serie B; the legends who stayed to rebuild) ────────────
export const JUVENTUS_2006: CuratedSeed[] = [
  q('juventus', 'buffon_06', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 90, 90, 2011, 20, t(10, 6, 9, 10, 4, 7), { loyalty: 97, hardBlocks: [{ reason: 'Buffon stayed in Serie B — a captain does not desert the Old Lady.', untilYear: 2008 }] }),
  // Real 2006–07 Serie B Juventus: the loyalists who stayed down to win promotion.
  q('juventus', 'legrottaglie06', 'Nicola Legrottaglie', 1976, 'Italy', ['CB'], 78, 79, 2010, 30, t(8, 5, 7, 7, 5, 7)),
  q('juventus', 'czanetti06', 'Cristiano Zanetti', 1977, 'Italy', ['DM', 'CM'], 78, 79, 2009, 40, t(8, 5, 7, 7, 5, 7)),
  q('juventus', 'paro06', 'Matteo Paro', 1983, 'Italy', ['CM'], 70, 74, 2009, 25, t(7, 4, 7, 7, 4, 7)),
  q('juventus', 'chimenti', 'Antonio Chimenti', 1970, 'Italy', ['GK'], 72, 72, 2008, 25, t(8, 4, 6, 8, 4, 6)),
  q('juventus', 'zebina_06', 'Jonathan Zebina', 1978, 'France', ['RB', 'CB'], 76, 77, 2009, 25, t(6, 6, 7, 7, 6, 6)),
  q('juventus', 'chiellini_06', 'Giorgio Chiellini', 1984, 'Italy', ['CB', 'LB'], 80, 89, 2012, 20, t(9, 6, 9, 10, 5, 7), { loyalty: 95 }),
  q('juventus', 'balzaretti', 'Federico Balzaretti', 1981, 'Italy', ['LB', 'RB'], 77, 80, 2009, 25, t(8, 5, 7, 8, 5, 7)),
  q('juventus', 'birindelli_06', 'Alessandro Birindelli', 1974, 'Italy', ['RB'], 75, 75, 2008, 25, t(8, 4, 7, 8, 4, 7)),
  q('juventus', 'boumsong', 'Jean-Alain Boumsong', 1979, 'France', ['CB'], 78, 79, 2009, 25, t(7, 5, 7, 7, 6, 6)),
  q('juventus', 'giannichedda', 'Giuliano Giannichedda', 1975, 'Italy', ['DM', 'CM'], 75, 76, 2008, 25, t(8, 4, 7, 7, 5, 7)),
  q('juventus', 'nedved_06', 'Pavel Nedvěd', 1972, 'Czechia', ['AM', 'LW'], 85, 85, 2009, 20, t(10, 6, 9, 9, 4, 8), { loyalty: 88 }),
  q('juventus', 'camoranesi_06', 'Mauro Camoranesi', 1976, 'Italy', ['RW'], 81, 81, 2009, 25, t(8, 6, 8, 8, 6, 7)),
  q('juventus', 'marchionni', 'Marco Marchionni', 1980, 'Italy', ['LW', 'AM'], 75, 77, 2009, 25, t(7, 5, 7, 7, 5, 7)),
  q('juventus', 'nocerino', 'Antonio Nocerino', 1985, 'Italy', ['CM', 'DM'], 72, 80, 2010, 25, t(8, 5, 8, 8, 5, 7)),
  q('juventus', 'marchisio_06', 'Claudio Marchisio', 1986, 'Italy', ['CM', 'DM'], 70, 86, 2011, 20, t(9, 5, 8, 10, 4, 7), { loyalty: 94 }),
  q('juventus', 'de_ceglie', 'Paolo De Ceglie', 1986, 'Italy', ['LB'], 68, 79, 2011, 20, t(8, 5, 7, 9, 4, 7)),
  q('juventus', 'delpiero_06', 'Alessandro Del Piero', 1974, 'Italy', ['AM', 'ST'], 86, 86, 2010, 30, t(9, 6, 9, 10, 4, 7), { loyalty: 99, hardBlocks: [{ reason: 'Del Piero, il capitano, went down to Serie B with Juventus — he is Juventus for life.', untilYear: 2099 }] }),
  q('juventus', 'trezeguet_06', 'David Trezeguet', 1977, 'France', ['ST'], 85, 85, 2010, 30, t(8, 6, 8, 9, 5, 7), { loyalty: 88 }),
  q('juventus', 'bojinov', 'Valeri Bojinov', 1986, 'Bulgaria', ['ST'], 74, 82, 2010, 30, t(5, 7, 7, 6, 7, 7)),
  q('juventus', 'palladino', 'Raffaele Palladino', 1984, 'Italy', ['ST', 'AM'], 72, 78, 2010, 25, t(7, 5, 7, 8, 5, 7)),
];

/**
 * The full Juventus-2006 curated universe. Juventus carry the Serie B legends;
 * everyone else — the late-2000s Serie A (Inter, Milan, Roma…) and the elite of
 * Europe — is the era-serie-a-2007 pack, ready to be swapped into the top flight
 * the moment Juventus win promotion (see promoteJuventus in italyEvents.ts).
 */
export const JUVENTUS_2006_SQUADS: Record<string, CuratedSeed[]> = {
  ...MILAN_2007_SQUADS,
  juventus: JUVENTUS_2006,
};
