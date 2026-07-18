/**
 * Curated real players — 2006–07 Serie A pack (§4, §17.10).
 *
 * The vertical slice for the post-Calciopoli Italian game: Ancelotti's Milan
 * (2007 Champions League winners, Kaká the world's best), Mancini's record-points
 * Inter, Spalletti's Totti-led Roma — and, in Serie B, the Juventus that was dumped
 * a division for Calciopoli and won it back behind the loyal icons who refused to
 * leave (Del Piero, Buffon, Nedvěd, Trézéguet). Serves both the milan-2007 and
 * juventus-2006 start points. Ability/potential/personality are designer estimates.
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
  extra: { hardBlocks?: HardBlock[]; loyalty?: number; latentCeiling?: number; archetype?: string; loanFrom?: ClubId } = {},
): CuratedSeed {
  return { id: `cur_${id}`, name, birthYear, nationality, positions, club, contractUntil, ability, potentialCeiling, personality, injuryProneness, ...extra };
}

/** AC Milan, 2006–07 — Ancelotti's Champions League winners; Kaká's peak, Ronaldo
 *  arriving in January. */
export const MILAN_2007: CuratedSeed[] = [
  q('milan', 'dida07', 'Dida', 1973, 'Brazil', ['GK'], 82, 82, 2010, 25, t(7, 5, 6, 7, 4, 6)),
  q('milan', 'cafu07', 'Cafu', 1970, 'Brazil', ['RB'], 80, 80, 2008, 45, t(8, 5, 7, 8, 5, 7), { archetype: 'full-back-attacking' }),
  q('milan', 'oddo07', 'Massimo Oddo', 1976, 'Italy', ['RB'], 79, 79, 2011, 30, t(7, 5, 6, 6, 5, 6), { archetype: 'full-back-attacking' }),
  q('milan', 'nesta07', 'Alessandro Nesta', 1976, 'Italy', ['CB'], 86, 86, 2011, 55, t(8, 4, 7, 9, 3, 7), { archetype: 'covering-cb' }),
  q('milan', 'maldini07', 'Paolo Maldini', 1968, 'Italy', ['CB', 'LB'], 83, 83, 2009, 55, t(10, 3, 8, 10, 2, 8), { archetype: 'covering-cb' }),
  q('milan', 'kaladze07', 'Kakhaber Kaladze', 1978, 'Georgia', ['CB', 'LB'], 78, 78, 2010, 30, t(7, 4, 6, 7, 4, 6), { archetype: 'covering-cb' }),
  q('milan', 'jankulovski07', 'Marek Jankulovski', 1977, 'Czech Republic', ['LB'], 77, 77, 2010, 35, t(7, 5, 6, 6, 5, 6), { archetype: 'full-back-attacking' }),
  q('milan', 'favalli07', 'Giuseppe Favalli', 1972, 'Italy', ['LB', 'CB'], 75, 75, 2008, 40, t(7, 4, 6, 7, 3, 6)),
  q('milan', 'bonera07', 'Daniele Bonera', 1981, 'Italy', ['CB', 'RB'], 75, 76, 2011, 35, t(6, 5, 6, 6, 5, 6)),
  q('milan', 'gattuso07', 'Gennaro Gattuso', 1978, 'Italy', ['DM', 'CM'], 82, 82, 2011, 30, t(9, 5, 8, 9, 8, 7)),
  q('milan', 'pirlo07', 'Andrea Pirlo', 1979, 'Italy', ['DM', 'CM'], 88, 88, 2010, 30, t(8, 4, 7, 8, 3, 7), { archetype: 'deep-playmaker' }),
  q('milan', 'ambrosini07', 'Massimo Ambrosini', 1977, 'Italy', ['CM', 'DM'], 80, 80, 2011, 40, t(8, 4, 7, 9, 4, 7)),
  q('milan', 'seedorf07', 'Clarence Seedorf', 1976, 'Netherlands', ['CM', 'AM'], 84, 84, 2010, 30, t(8, 7, 8, 7, 5, 9), { archetype: 'playmaker' }),
  // Kaká — the reigning best player in the world, and about to win the Ballon d'Or.
  q('milan', 'kaka07', 'Kaká', 1982, 'Brazil', ['AM'], 91, 92, 2011, 25, t(9, 4, 9, 8, 2, 8), { archetype: 'playmaker' }),
  q('milan', 'gourcuff07', 'Yoann Gourcuff', 1986, 'France', ['AM', 'CM'], 72, 85, 2010, 25, t(7, 5, 8, 5, 4, 6), { archetype: 'playmaker' }),
  q('milan', 'inzaghi07', 'Filippo Inzaghi', 1973, 'Italy', ['ST'], 82, 82, 2010, 50, t(8, 6, 8, 8, 4, 6), { archetype: 'poacher' }),
  q('milan', 'gilardino07', 'Alberto Gilardino', 1982, 'Italy', ['ST'], 81, 81, 2011, 25, t(7, 5, 7, 6, 4, 7), { archetype: 'poacher' }),
  // Ronaldo (R9) — arrived from Real Madrid in January 2007, past his brilliant best
  // and carrying the weight, but still a name. A fragile, faded great.
  q('milan', 'r9milan07', 'Ronaldo', 1976, 'Brazil', ['ST'], 85, 85, 2008, 55, t(4, 8, 7, 5, 6, 6), { archetype: 'poacher', latentCeiling: 90 }),
  q('milan', 'oliveira07', 'Ricardo Oliveira', 1980, 'Brazil', ['ST'], 76, 77, 2010, 30, t(6, 6, 6, 5, 5, 6), { archetype: 'poacher' }),
];

/** Internazionale, 2006–07 — Mancini's record 97-point Scudetto, the first of five
 *  straight titles. */
export const INTER_2007: CuratedSeed[] = [
  q('inter', 'juliocesar07', 'Júlio César', 1979, 'Brazil', ['GK'], 84, 87, 2011, 30, t(8, 5, 7, 7, 4, 7)),
  q('inter', 'toldo07', 'Francesco Toldo', 1971, 'Italy', ['GK'], 78, 78, 2010, 35, t(8, 4, 6, 8, 3, 7)),
  q('inter', 'maicon07', 'Maicon', 1981, 'Brazil', ['RB'], 85, 88, 2011, 30, t(7, 7, 8, 5, 5, 7), { archetype: 'full-back-attacking' }),
  q('inter', 'jzanetti07', 'Javier Zanetti', 1973, 'Argentina', ['RB', 'CM'], 85, 85, 2010, 15, t(10, 4, 9, 10, 2, 8)),
  q('inter', 'materazzi07', 'Marco Materazzi', 1973, 'Italy', ['CB'], 82, 82, 2010, 45, t(7, 8, 7, 7, 9, 6), { archetype: 'covering-cb' }),
  q('inter', 'samuel07', 'Walter Samuel', 1978, 'Argentina', ['CB'], 83, 84, 2011, 45, t(8, 5, 7, 7, 4, 7), { archetype: 'covering-cb' }),
  q('inter', 'cordoba07', 'Iván Córdoba', 1976, 'Colombia', ['CB'], 80, 80, 2010, 40, t(8, 5, 7, 8, 4, 7)),
  q('inter', 'burdisso07', 'Nicolás Burdisso', 1981, 'Argentina', ['CB', 'RB'], 77, 80, 2010, 40, t(7, 6, 7, 6, 6, 7)),
  q('inter', 'grosso07', 'Fabio Grosso', 1977, 'Italy', ['LB'], 80, 81, 2009, 35, t(7, 6, 7, 6, 5, 7)),
  q('inter', 'maxwell07', 'Maxwell', 1981, 'Brazil', ['LB'], 78, 82, 2010, 30, t(8, 4, 7, 6, 3, 8)),
  q('inter', 'vieira07', 'Patrick Vieira', 1976, 'France', ['DM', 'CM'], 83, 83, 2009, 40, t(8, 7, 8, 5, 5, 7)),
  q('inter', 'cambiasso07', 'Esteban Cambiasso', 1980, 'Argentina', ['DM', 'CM'], 85, 86, 2011, 30, t(9, 5, 8, 7, 3, 8), { archetype: 'deep-playmaker' }),
  q('inter', 'stankovic07', 'Dejan Stanković', 1978, 'Serbia', ['CM', 'AM'], 82, 83, 2010, 40, t(8, 6, 7, 7, 5, 7)),
  q('inter', 'dacourt07', 'Olivier Dacourt', 1974, 'France', ['CM', 'DM'], 77, 78, 2009, 45, t(7, 6, 7, 5, 6, 7)),
  q('inter', 'figo07', 'Luís Figo', 1972, 'Portugal', ['RW', 'AM'], 82, 82, 2009, 35, t(8, 7, 8, 5, 4, 7)),
  q('inter', 'solari07', 'Santiago Solari', 1976, 'Argentina', ['LW', 'AM'], 76, 77, 2008, 35, t(7, 5, 7, 6, 4, 7)),
  q('inter', 'ibrahimovic07', 'Zlatan Ibrahimović', 1981, 'Sweden', ['ST'], 87, 90, 2011, 35, t(7, 9, 9, 4, 8, 7), { archetype: 'inside-forward' }),
  q('inter', 'crespo07', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 83, 84, 2008, 45, t(7, 6, 8, 5, 5, 7), { archetype: 'poacher', loanFrom: 'chelsea' }),
  q('inter', 'cruz07', 'Julio Cruz', 1974, 'Argentina', ['ST'], 78, 78, 2009, 40, t(8, 5, 7, 7, 4, 7)),
];

/** AS Roma, 2006–07 — Spalletti's side, Serie A runners-up and Coppa Italia
 *  winners, built around a false-nine Totti (European Golden Boot). */
export const ROMA_2007: CuratedSeed[] = [
  q('roma', 'doni07', 'Doni', 1979, 'Brazil', ['GK'], 80, 80, 2011, 30, t(7, 5, 6, 6, 5, 7)),
  q('roma', 'curci07', 'Gianluca Curci', 1985, 'Italy', ['GK'], 70, 76, 2009, 30, t(6, 5, 6, 7, 5, 6)),
  q('roma', 'panucci07', 'Christian Panucci', 1973, 'Italy', ['RB', 'CB'], 79, 79, 2009, 40, t(8, 6, 6, 7, 5, 7)),
  q('roma', 'mexes07', 'Philippe Mexès', 1982, 'France', ['CB'], 80, 84, 2010, 40, t(6, 7, 7, 5, 6, 6), { archetype: 'covering-cb' }),
  q('roma', 'tonetto07', 'Max Tonetto', 1974, 'Italy', ['LB'], 76, 76, 2009, 35, t(7, 4, 5, 7, 5, 7), { archetype: 'full-back-attacking' }),
  q('roma', 'cassetti07', 'Marco Cassetti', 1977, 'Italy', ['RB', 'CB'], 76, 77, 2010, 35, t(7, 5, 6, 7, 5, 7)),
  q('roma', 'ferrari07', 'Matteo Ferrari', 1979, 'Italy', ['CB'], 77, 78, 2010, 40, t(7, 5, 6, 6, 5, 6), { archetype: 'covering-cb' }),
  q('roma', 'derossi07', 'Daniele De Rossi', 1983, 'Italy', ['DM', 'CM'], 84, 88, 2011, 40, t(8, 6, 8, 9, 6, 7), { archetype: 'deep-playmaker' }),
  q('roma', 'pizarro07', 'David Pizarro', 1979, 'Chile', ['DM', 'CM', 'AM'], 82, 82, 2010, 35, t(8, 5, 7, 6, 5, 7), { archetype: 'deep-playmaker' }),
  q('roma', 'perrotta07', 'Simone Perrotta', 1977, 'Italy', ['CM', 'AM'], 80, 80, 2010, 40, t(8, 4, 6, 7, 5, 7)),
  q('roma', 'manciniroma07', 'Amantino Mancini', 1980, 'Brazil', ['RW', 'LW', 'AM'], 82, 83, 2010, 40, t(6, 7, 7, 5, 7, 6), { archetype: 'inside-forward' }),
  q('roma', 'aquilani07', 'Alberto Aquilani', 1984, 'Italy', ['CM', 'AM'], 78, 85, 2011, 50, t(7, 5, 7, 7, 5, 6)),
  q('roma', 'taddei07', 'Rodrigo Taddei', 1980, 'Brazil', ['RW', 'LW', 'RB'], 77, 78, 2010, 35, t(8, 4, 6, 7, 5, 7)),
  q('roma', 'totti07', 'Francesco Totti', 1976, 'Italy', ['ST', 'AM'], 88, 89, 2011, 45, t(8, 6, 8, 10, 6, 7), { archetype: 'playmaker', loyalty: 95 }),
  q('roma', 'montella07', 'Vincenzo Montella', 1974, 'Italy', ['ST'], 78, 78, 2008, 45, t(7, 7, 7, 7, 5, 6), { archetype: 'poacher' }),
  q('roma', 'tavano07', 'Francesco Tavano', 1979, 'Italy', ['ST'], 74, 76, 2008, 35, t(7, 5, 6, 5, 5, 6), { archetype: 'poacher' }),
  q('roma', 'wilhelmsson07', 'Christian Wilhelmsson', 1979, 'Sweden', ['RW', 'LW'], 74, 76, 2008, 30, t(7, 5, 6, 5, 6, 7), { loanFrom: 'nantes' }),
];

/** Juventus, 2006–07 — the Serie B side. The stars who LEFT after Calciopoli
 *  (Cannavaro, Emerson, Thuram, Zambrotta, Ibrahimović, Vieira) are gone; these are
 *  the loyal icons who stayed to drag the club back up. */
export const JUVENTUS_2007: CuratedSeed[] = [
  q('juventus', 'buffon07', 'Gianluigi Buffon', 1978, 'Italy', ['GK'], 89, 89, 2011, 28, t(9, 7, 9, 9, 5, 7), { loyalty: 92 }),
  q('juventus', 'delpiero07', 'Alessandro Del Piero', 1974, 'Italy', ['ST', 'AM'], 85, 85, 2010, 32, t(9, 6, 8, 10, 5, 7), { loyalty: 96, archetype: 'inside-forward' }),
  q('juventus', 'trezeguet07', 'David Trézéguet', 1977, 'France', ['ST'], 84, 84, 2010, 35, t(8, 6, 7, 8, 5, 7), { archetype: 'poacher' }),
  q('juventus', 'nedved07', 'Pavel Nedvěd', 1972, 'Czech Republic', ['AM', 'LW', 'CM'], 85, 85, 2009, 30, t(10, 6, 9, 9, 6, 8), { loyalty: 88, archetype: 'playmaker' }),
  q('juventus', 'camoranesi07', 'Mauro Camoranesi', 1976, 'Italy', ['RW', 'CM'], 80, 80, 2010, 33, t(8, 6, 7, 8, 6, 8), { loyalty: 84 }),
  q('juventus', 'chiellini07', 'Giorgio Chiellini', 1984, 'Italy', ['CB', 'LB'], 78, 88, 2011, 28, t(9, 5, 8, 9, 4, 8), { loyalty: 90, archetype: 'covering-cb' }),
  q('juventus', 'boumsong07', 'Jean-Alain Boumsong', 1979, 'France', ['CB'], 76, 78, 2010, 32, t(7, 5, 6, 7, 5, 7), { archetype: 'covering-cb' }),
  q('juventus', 'zebina07', 'Jonathan Zebina', 1978, 'France', ['CB', 'RB'], 74, 74, 2009, 34, t(6, 6, 6, 6, 6, 6)),
  q('juventus', 'balzaretti07', 'Federico Balzaretti', 1981, 'Italy', ['LB', 'RB'], 74, 78, 2010, 30, t(8, 4, 7, 7, 5, 7), { archetype: 'full-back-attacking' }),
  q('juventus', 'birindelli07', 'Alessandro Birindelli', 1974, 'Italy', ['RB'], 72, 72, 2008, 30, t(8, 4, 6, 9, 4, 7)),
  q('juventus', 'kovac07', 'Robert Kovač', 1974, 'Croatia', ['CB', 'DM'], 75, 75, 2009, 32, t(7, 5, 6, 7, 5, 7), { archetype: 'covering-cb' }),
  q('juventus', 'czanetti07', 'Cristiano Zanetti', 1977, 'Italy', ['DM', 'CM'], 76, 76, 2010, 40, t(8, 5, 7, 7, 5, 7), { archetype: 'deep-playmaker' }),
  q('juventus', 'giannichedda07', 'Giuliano Giannichedda', 1975, 'Italy', ['DM', 'CM'], 74, 74, 2009, 33, t(7, 5, 6, 7, 5, 6)),
  q('juventus', 'paro07', 'Matteo Paro', 1983, 'Italy', ['CM', 'DM'], 72, 74, 2009, 30, t(7, 4, 6, 7, 5, 7)),
  // Marchisio — the academy graduate who debuted in Serie B and became a dynasty
  // mainstay. A reality-rail homegrown talent.
  q('juventus', 'marchisio07', 'Claudio Marchisio', 1986, 'Italy', ['CM', 'DM'], 72, 86, 2011, 28, t(8, 4, 8, 9, 4, 8)),
  q('juventus', 'marchionni07', 'Marco Marchionni', 1980, 'Italy', ['RW', 'LW', 'AM'], 74, 76, 2010, 30, t(7, 5, 6, 7, 5, 7)),
  q('juventus', 'zalayeta07', 'Marcelo Zalayeta', 1978, 'Uruguay', ['ST'], 75, 75, 2009, 33, t(7, 5, 6, 8, 5, 7), { archetype: 'poacher' }),
  q('juventus', 'bojinov07', 'Valeri Bojinov', 1986, 'Bulgaria', ['ST'], 74, 80, 2011, 35, t(6, 7, 7, 5, 7, 6), { archetype: 'poacher' }),
];

/** Curated squads for the milan-2007 (Serie A) start — Milan, Inter and Roma are
 *  real; the rest of Serie A runs on the procedural pool. */
export const MILAN_2007_SQUADS: Record<string, CuratedSeed[]> = {
  milan: MILAN_2007,
  inter: INTER_2007,
  roma: ROMA_2007,
};

/** Curated squads for the juventus-2006 (Serie B) start — only Juventus is real. */
export const JUVENTUS_2006_SQUADS: Record<string, CuratedSeed[]> = {
  juventus: JUVENTUS_2007,
};
