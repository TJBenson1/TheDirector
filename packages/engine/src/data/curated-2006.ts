/**
 * Curated real players — 2006–07 La Liga pack (§4, §17.10).
 *
 * The vertical slice for real-madrid-2006: Capello's champion Real Madrid at the
 * end of the galáctico era and start of the rebuild (Cannavaro's Ballon d'Or,
 * Van Nistelrooy's goals, a young Ramos/Robinho/Higuaín), with Ronaldinho and
 * Eto'o's Barça — and a 19-year-old Messi — the Clásico rival. Both giants curated.
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
  extra: { hardBlocks?: HardBlock[]; loyalty?: number; latentCeiling?: number; archetype?: string } = {},
): CuratedSeed {
  return { id: `cur_${id}`, name, birthYear, nationality, positions, club, contractUntil, ability, potentialCeiling, personality, injuryProneness, ...extra };
}

/** Real Madrid, 2006–07 — Capello's champions; the galáctico era ending, the
 *  rebuild beginning around a young Ramos, Robinho and Higuaín. */
export const REAL_MADRID_2006: CuratedSeed[] = [
  q('real_madrid', 'casillas06', 'Iker Casillas', 1981, 'Spain', ['GK'], 86, 88, 2011, 25, t(8, 4, 8, 10, 3, 7)),
  q('real_madrid', 'salgado06', 'Míchel Salgado', 1975, 'Spain', ['RB'], 77, 77, 2008, 32, t(8, 4, 6, 9, 4, 7), { archetype: 'full-back-attacking' }),
  // Ramos — a 20-year-old about to become one of the great defenders of his age.
  q('real_madrid', 'ramos06', 'Sergio Ramos', 1986, 'Spain', ['RB', 'CB'], 82, 92, 2011, 30, t(7, 6, 8, 6, 6, 7), { archetype: 'covering-cb' }),
  q('real_madrid', 'cannavaro06', 'Fabio Cannavaro', 1973, 'Italy', ['CB'], 86, 86, 2010, 30, t(9, 5, 8, 7, 3, 7), { archetype: 'covering-cb' }),
  q('real_madrid', 'helguera06', 'Iván Helguera', 1975, 'Spain', ['CB', 'DM'], 78, 78, 2008, 35, t(7, 5, 6, 8, 6, 7)),
  q('real_madrid', 'robertocarlos06', 'Roberto Carlos', 1973, 'Brazil', ['LB'], 82, 82, 2008, 30, t(8, 7, 7, 8, 5, 8), { archetype: 'full-back-attacking' }),
  q('real_madrid', 'emerson06', 'Emerson', 1976, 'Brazil', ['DM', 'CM'], 82, 82, 2010, 30, t(8, 5, 7, 6, 4, 6), { archetype: 'deep-playmaker' }),
  q('real_madrid', 'diarra06', 'Mahamadou Diarra', 1981, 'Mali', ['DM', 'CM'], 81, 82, 2011, 30, t(7, 5, 7, 6, 5, 6)),
  q('real_madrid', 'guti06', 'Guti', 1976, 'Spain', ['AM', 'CM'], 80, 82, 2009, 28, t(6, 7, 6, 10, 7, 7), { archetype: 'playmaker' }),
  q('real_madrid', 'beckham06', 'David Beckham', 1975, 'England', ['RW', 'CM'], 83, 83, 2008, 25, t(9, 8, 8, 6, 4, 8), { archetype: 'inside-forward' }),
  q('real_madrid', 'reyes06', 'José Antonio Reyes', 1983, 'Spain', ['LW'], 79, 82, 2008, 30, t(6, 5, 6, 5, 6, 5), { archetype: 'inside-forward' }),
  // Robinho — the mercurial Brazilian whose gifts flickered but never fully caught
  // fire; a high-ego lost talent (latent 90).
  q('real_madrid', 'robinho06', 'Robinho', 1984, 'Brazil', ['LW', 'ST'], 82, 88, 2010, 30, t(5, 8, 7, 5, 8, 6), { archetype: 'inside-forward', latentCeiling: 90 }),
  q('real_madrid', 'raul06', 'Raúl', 1977, 'Spain', ['ST', 'AM'], 82, 82, 2010, 30, t(9, 6, 8, 10, 4, 7), { archetype: 'poacher' }),
  q('real_madrid', 'vannistelrooy06', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 87, 87, 2010, 30, t(8, 7, 8, 6, 4, 7), { archetype: 'poacher' }),
  // Ronaldo — overweight and on his way out to Milan (January 2007), a shadow of
  // the phenomenon; what remains of a generational talent (latent 88).
  q('real_madrid', 'ronaldo06', 'Ronaldo', 1976, 'Brazil', ['ST'], 80, 80, 2008, 45, t(4, 8, 6, 5, 7, 6), { archetype: 'poacher', latentCeiling: 88 }),
  // Higuaín — the young Argentine who arrives in January; a prolific goalscorer in
  // the making.
  q('real_madrid', 'higuain06', 'Gonzalo Higuaín', 1987, 'Argentina', ['ST'], 76, 87, 2011, 28, t(7, 5, 7, 6, 4, 7), { archetype: 'poacher' }),
  q('real_madrid', 'gago06', 'Fernando Gago', 1986, 'Argentina', ['DM', 'CM'], 77, 85, 2011, 30, t(7, 5, 7, 5, 4, 6), { archetype: 'deep-playmaker' }),
  q('real_madrid', 'cassano06', 'Antonio Cassano', 1982, 'Italy', ['ST', 'AM'], 78, 80, 2008, 35, t(4, 9, 6, 4, 9, 5)),
];

/** Barcelona, 2006–07 — Rijkaard's post-2006-CL side; Ronaldinho and Eto'o at the
 *  peak, a 19-year-old Messi exploding. The Clásico rival. */
export const BARCELONA_2006: CuratedSeed[] = [
  q('barcelona', 'valdes06', 'Víctor Valdés', 1982, 'Spain', ['GK'], 83, 83, 2010, 30, t(8, 6, 7, 9, 7, 6)),
  q('barcelona', 'zambrotta06', 'Gianluca Zambrotta', 1977, 'Italy', ['RB', 'LB'], 82, 82, 2010, 32, t(8, 5, 7, 6, 6, 7), { archetype: 'full-back-attacking' }),
  q('barcelona', 'thuram06', 'Lilian Thuram', 1972, 'France', ['CB', 'RB'], 82, 82, 2008, 30, t(9, 5, 7, 7, 4, 7), { archetype: 'covering-cb' }),
  q('barcelona', 'puyol06', 'Carles Puyol', 1978, 'Spain', ['CB'], 84, 84, 2010, 33, t(10, 3, 8, 10, 5, 7), { archetype: 'covering-cb' }),
  q('barcelona', 'marquez06', 'Rafael Márquez', 1979, 'Mexico', ['CB', 'DM'], 82, 82, 2010, 32, t(7, 6, 7, 7, 6, 7)),
  q('barcelona', 'sylvinho06', 'Sylvinho', 1974, 'Brazil', ['LB'], 78, 78, 2008, 33, t(8, 4, 6, 8, 4, 8)),
  q('barcelona', 'oleguer06', 'Oleguer Presas', 1980, 'Spain', ['RB', 'CB'], 76, 78, 2009, 30, t(7, 4, 6, 8, 5, 7)),
  q('barcelona', 'edmilson06', 'Edmílson', 1976, 'Brazil', ['DM', 'CM'], 78, 78, 2008, 38, t(7, 5, 6, 7, 5, 7)),
  q('barcelona', 'motta06', 'Thiago Motta', 1982, 'Brazil', ['DM', 'CM'], 77, 80, 2009, 40, t(6, 6, 7, 6, 6, 7)),
  q('barcelona', 'xavi06', 'Xavi Hernández', 1980, 'Spain', ['CM', 'DM'], 85, 85, 2010, 30, t(9, 4, 8, 10, 4, 7), { archetype: 'deep-playmaker' }),
  q('barcelona', 'iniesta06', 'Andrés Iniesta', 1984, 'Spain', ['CM', 'AM'], 82, 90, 2011, 30, t(10, 3, 8, 10, 3, 8), { archetype: 'playmaker' }),
  q('barcelona', 'deco06', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 85, 85, 2009, 30, t(7, 7, 7, 6, 7, 7), { archetype: 'playmaker' }),
  q('barcelona', 'giuly06', 'Ludovic Giuly', 1976, 'France', ['RW', 'AM'], 80, 80, 2008, 32, t(8, 6, 7, 6, 6, 7)),
  q('barcelona', 'ronaldinho06', 'Ronaldinho', 1980, 'Brazil', ['LW', 'AM', 'RW'], 90, 91, 2010, 32, t(5, 7, 6, 6, 6, 8), { archetype: 'inside-forward' }),
  // Messi — a 19-year-old already electric, the greatest of all time in the making.
  q('barcelona', 'messi06', 'Lionel Messi', 1987, 'Argentina', ['RW', 'AM'], 84, 95, 2011, 38, t(9, 5, 9, 9, 4, 7), { archetype: 'inside-forward' }),
  q('barcelona', 'etoo06', 'Samuel Eto\'o', 1981, 'Cameroon', ['ST'], 88, 88, 2010, 40, t(8, 9, 9, 6, 8, 7), { archetype: 'poacher' }),
  q('barcelona', 'gudjohnsen06', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 80, 80, 2010, 30, t(8, 5, 7, 7, 5, 7)),
  q('barcelona', 'giovani06', 'Giovani dos Santos', 1989, 'Mexico', ['AM', 'RW', 'LW'], 70, 85, 2011, 28, t(5, 7, 8, 5, 7, 6), { archetype: 'inside-forward', latentCeiling: 85 }),
];

/** Curated squads for the real-madrid-2006 start — Real and Barça both real. */
export const REAL_MADRID_2006_SQUADS: Record<string, CuratedSeed[]> = {
  real_madrid: REAL_MADRID_2006,
  barcelona: BARCELONA_2006,
};
