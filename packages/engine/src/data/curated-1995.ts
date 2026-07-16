/**
 * Curated real players — 1995–96 pack (§4, §17.10).
 *
 * The vertical slice for "Keegan's Entertainers": Newcastle United 1995-96, the
 * side that led the Premier League by twelve points and threw it away in the most
 * thrilling, open football England had seen — Ginola and Ferdinand and a mercurial
 * Asprilla, all attack and no brakes. The counterfactual is whether you can hold
 * the nerve Keegan couldn't (and whether you still bring Shearer home in 1996).
 * Ability/potential/personality are hidden designer estimates (§7).
 *
 * Isolated in its own scenario squad set so it never touches the 1999 world
 * (man-utd-1999 is the calibration scenario and shares the eng-1 league).
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

/** Newcastle United, 1995–96 — Kevin Keegan's Entertainers. */
export const NEWCASTLE_1995: CuratedSeed[] = [
  q('newcastle', 'srnicek95', 'Pavel Srníček', 1968, 'Czech Republic', ['GK'], 77, 78, 1999, 30, t(7, 5, 6, 8, 6, 6)),
  q('newcastle', 'hislop95', 'Shaka Hislop', 1969, 'Trinidad and Tobago', ['GK'], 76, 79, 1999, 30, t(7, 5, 6, 6, 4, 7)),
  q('newcastle', 'barton95', 'Warren Barton', 1969, 'England', ['RB', 'CB'], 78, 79, 2000, 35, t(7, 6, 7, 6, 6, 7), { archetype: 'full-back-attacking' }),
  q('newcastle', 'watson95', 'Steve Watson', 1974, 'England', ['RB', 'RW'], 74, 79, 2000, 30, t(7, 4, 7, 8, 4, 8)),
  q('newcastle', 'peacock95', 'Darren Peacock', 1968, 'England', ['CB'], 77, 77, 1999, 35, t(7, 5, 6, 7, 5, 6)),
  q('newcastle', 'albert95', 'Philippe Albert', 1967, 'Belgium', ['CB'], 80, 81, 2000, 45, t(7, 6, 6, 7, 5, 6), { archetype: 'covering-cb' }),
  q('newcastle', 'howey95', 'Steve Howey', 1971, 'England', ['CB'], 77, 80, 2000, 45, t(7, 5, 7, 8, 4, 7)),
  q('newcastle', 'beresford95', 'John Beresford', 1966, 'England', ['LB'], 76, 77, 1999, 35, t(7, 6, 6, 7, 6, 6), { archetype: 'full-back-attacking' }),
  q('newcastle', 'elliott95', 'Robbie Elliott', 1973, 'England', ['LB'], 72, 77, 1999, 40, t(7, 4, 6, 8, 4, 7)),
  q('newcastle', 'roblee95', 'Rob Lee', 1966, 'England', ['CM'], 81, 81, 2000, 30, t(8, 5, 7, 9, 4, 7)),
  q('newcastle', 'clark95', 'Lee Clark', 1972, 'England', ['CM', 'AM'], 74, 78, 1999, 30, t(7, 5, 7, 9, 5, 7)),
  q('newcastle', 'batty95', 'David Batty', 1968, 'England', ['DM', 'CM'], 80, 80, 2000, 30, t(8, 5, 6, 6, 6, 6), { archetype: 'deep-playmaker' }),
  q('newcastle', 'gillespie95', 'Keith Gillespie', 1975, 'Northern Ireland', ['RW'], 76, 82, 2000, 30, t(6, 6, 7, 6, 6, 6)),
  // Ginola — the flair of the side, box-office and mercurial (high ego/volatility).
  q('newcastle', 'ginola95', 'David Ginola', 1967, 'France', ['LW'], 84, 85, 2000, 35, t(6, 8, 7, 5, 8, 6), { archetype: 'inside-forward' }),
  q('newcastle', 'beardsley95', 'Peter Beardsley', 1961, 'England', ['AM', 'ST'], 83, 83, 1998, 35, t(9, 5, 7, 9, 3, 8), { archetype: 'playmaker' }),
  q('newcastle', 'lesferdinand95', 'Les Ferdinand', 1966, 'England', ['ST'], 84, 84, 2000, 35, t(8, 6, 8, 6, 5, 7), { archetype: 'poacher' }),
  // Asprilla — the January gamble whose brilliance (and chaos) upset the title
  // run-in; the mercurial spark reality signed mid-collapse.
  q('newcastle', 'asprilla95', 'Faustino Asprilla', 1969, 'Colombia', ['ST', 'AM'], 83, 84, 2000, 40, t(5, 8, 7, 5, 9, 5), { archetype: 'inside-forward' }),
  q('newcastle', 'kitson95', 'Paul Kitson', 1971, 'England', ['ST'], 74, 78, 1999, 45, t(6, 5, 6, 6, 5, 6), { archetype: 'poacher' }),
];

/** Curated squads for the newcastle-1995 scenario, keyed by club. Only Newcastle
 *  is curated (the rivals run on the procedural pool), so the set stays isolated
 *  from the 1999 world that shares the eng-1 league. */
export const NEWCASTLE_1995_SQUADS: Record<string, CuratedSeed[]> = {
  newcastle: NEWCASTLE_1995,
};
