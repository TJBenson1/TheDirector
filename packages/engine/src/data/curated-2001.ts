/**
 * Curated real players — 2001 post-treble era pack (§4, §17.10).
 *
 * Vertical slice for "Liverpool go for it after the 2001 treble": Houllier's
 * side, the rivals of the day (Ferguson's United, Wenger's Arsenal, O'Leary's
 * Leeds) and a PRE-Abramovich Chelsea, plus the pieces of the counterfactual —
 * Anelka (on loan, the sign-him-or-not call), Diouf/Cheyrou (the real flops to
 * avoid), and Chelsea's 2003 takeover splurge (which only happens if Abramovich
 * buys). Ability/personality are hidden designer estimates (§7).
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

/** Liverpool, 2001–02 — the treble winners, with Anelka on loan. */
export const LIVERPOOL_2001: CuratedSeed[] = [
  q('liverpool', 'dudek', 'Jerzy Dudek', 1973, 'Poland', ['GK'], 80, 82, 2006, 25, t(7, 5, 7, 7, 5, 7)),
  q('liverpool', 'babbel', 'Markus Babbel', 1972, 'Germany', ['RB', 'CB'], 81, 82, 2005, 40, t(8, 5, 8, 7, 4, 7)),
  q('liverpool', 'henchoz', 'Stéphane Henchoz', 1974, 'Switzerland', ['CB'], 80, 81, 2005, 30, t(8, 4, 7, 7, 4, 6)),
  q('liverpool', 'hyypia01', 'Sami Hyypiä', 1973, 'Finland', ['CB'], 83, 84, 2006, 20, t(9, 4, 7, 8, 3, 7)),
  q('liverpool', 'carra01', 'Jamie Carragher', 1978, 'England', ['CB', 'RB'], 79, 86, 2007, 25, t(9, 4, 8, 10, 5, 6)),
  q('liverpool', 'riise01', 'John Arne Riise', 1980, 'Norway', ['LB', 'LW'], 78, 83, 2006, 25, t(8, 5, 7, 7, 4, 7)),
  q('liverpool', 'gerrard01', 'Steven Gerrard', 1980, 'England', ['CM', 'AM'], 82, 91, 2006, 35, t(9, 6, 10, 10, 5, 7), { loyalty: 92 }),
  q('liverpool', 'hamann01', 'Dietmar Hamann', 1973, 'Germany', ['DM', 'CM'], 82, 83, 2005, 30, t(8, 4, 7, 6, 3, 7)),
  q('liverpool', 'mcallister', 'Gary McAllister', 1964, 'Scotland', ['CM'], 80, 80, 2002, 25, t(9, 5, 8, 8, 3, 7)),
  q('liverpool', 'murphy01', 'Danny Murphy', 1977, 'England', ['CM', 'AM'], 78, 82, 2005, 25, t(8, 5, 7, 7, 4, 7)),
  q('liverpool', 'owen01', 'Michael Owen', 1979, 'England', ['ST'], 86, 89, 2005, 68, t(8, 6, 8, 7, 4, 7), { archetype: 'poacher' }),
  q('liverpool', 'heskey01', 'Emile Heskey', 1978, 'England', ['ST', 'LW'], 79, 82, 2005, 30, t(7, 5, 7, 7, 4, 7)),
  q('liverpool', 'fowler01', 'Robbie Fowler', 1975, 'England', ['ST'], 82, 84, 2004, 45, t(6, 7, 7, 8, 6, 7)),
  q('liverpool', 'litmanen', 'Jari Litmanen', 1971, 'Finland', ['AM'], 82, 83, 2003, 40, t(8, 5, 7, 6, 4, 7)),
  q('liverpool', 'smicer', 'Vladimír Šmicer', 1973, 'Czech Republic', ['RW', 'AM'], 77, 79, 2005, 45, t(7, 5, 7, 6, 5, 7)),
  // On loan from PSG — the sign-him-permanently call (real Liverpool passed).
  q('liverpool', 'anelka01', 'Nicolas Anelka', 1979, 'France', ['ST'], 84, 87, 2002, 30, t(5, 8, 8, 4, 6, 6), { loanFrom: 'psg' }),
];

/** Manchester United, 2001–02. */
export const MAN_UTD_2001: CuratedSeed[] = [
  q('man_utd', 'barthez01', 'Fabien Barthez', 1971, 'France', ['GK'], 82, 83, 2004, 25, t(6, 7, 7, 6, 6, 6)),
  q('man_utd', 'gneville01', 'Gary Neville', 1975, 'England', ['RB'], 82, 84, 2006, 25, t(9, 5, 8, 10, 4, 7)),
  q('man_utd', 'stam01', 'Jaap Stam', 1972, 'Netherlands', ['CB'], 88, 89, 2004, 35, t(8, 6, 8, 6, 5, 6)),
  q('man_utd', 'blanc', 'Laurent Blanc', 1965, 'France', ['CB'], 81, 82, 2003, 25, t(9, 6, 8, 8, 3, 6)),
  q('man_utd', 'silvestre01', 'Mikael Silvestre', 1977, 'France', ['CB', 'LB'], 79, 85, 2006, 28, t(7, 5, 7, 6, 4, 8)),
  q('man_utd', 'keane01', 'Roy Keane', 1971, 'Ireland', ['CM', 'DM'], 89, 90, 2005, 45, t(9, 8, 10, 8, 8, 6)),
  q('man_utd', 'scholes01', 'Paul Scholes', 1974, 'England', ['CM', 'AM'], 87, 89, 2005, 25, t(9, 3, 8, 10, 5, 7), { archetype: 'deep-playmaker' }),
  q('man_utd', 'beckham01', 'David Beckham', 1975, 'England', ['RW', 'CM'], 88, 89, 2004, 20, t(9, 8, 9, 7, 4, 7), { archetype: 'crosser' }),
  q('man_utd', 'giggs01', 'Ryan Giggs', 1973, 'Wales', ['LW'], 87, 88, 2006, 30, t(9, 5, 8, 10, 3, 7)),
  q('man_utd', 'veron01', 'Juan Sebastián Verón', 1975, 'Argentina', ['CM', 'AM'], 85, 86, 2005, 35, t(7, 6, 8, 5, 5, 5), { archetype: 'deep-playmaker' }),
  q('man_utd', 'ruud01', 'Ruud van Nistelrooy', 1976, 'Netherlands', ['ST'], 87, 90, 2006, 45, t(8, 6, 9, 6, 4, 7), { archetype: 'poacher' }),
  q('man_utd', 'solskjaer01', 'Ole Gunnar Solskjær', 1973, 'Norway', ['ST'], 82, 83, 2004, 40, t(9, 4, 8, 9, 3, 7), { archetype: 'poacher' }),
  q('man_utd', 'cole01', 'Andy Cole', 1971, 'England', ['ST'], 81, 82, 2003, 35, t(7, 6, 7, 6, 5, 7), { archetype: 'poacher' }),
];

/** Arsenal, 2001–02 — the double winners. */
export const ARSENAL_2001: CuratedSeed[] = [
  q('arsenal', 'seaman01', 'David Seaman', 1963, 'England', ['GK'], 80, 81, 2003, 25, t(8, 6, 8, 9, 3, 6)),
  q('arsenal', 'lauren01', 'Lauren', 1977, 'Cameroon', ['RB'], 79, 82, 2006, 30, t(8, 5, 8, 7, 4, 7)),
  q('arsenal', 'campbell01', 'Sol Campbell', 1974, 'England', ['CB'], 85, 87, 2006, 25, t(8, 6, 8, 7, 4, 6)),
  q('arsenal', 'adams01', 'Tony Adams', 1966, 'England', ['CB'], 82, 82, 2002, 30, t(9, 7, 9, 10, 4, 6)),
  q('arsenal', 'acole01', 'Ashley Cole', 1980, 'England', ['LB'], 78, 88, 2006, 25, t(8, 6, 8, 7, 5, 7)),
  q('arsenal', 'vieira01', 'Patrick Vieira', 1976, 'France', ['CM', 'DM'], 87, 89, 2005, 25, t(8, 7, 9, 6, 6, 7)),
  q('arsenal', 'pires01', 'Robert Pirès', 1973, 'France', ['LW', 'AM'], 85, 87, 2005, 30, t(8, 5, 8, 7, 3, 7)),
  q('arsenal', 'ljungberg01', 'Fredrik Ljungberg', 1977, 'Sweden', ['RW', 'AM'], 83, 85, 2006, 35, t(8, 6, 8, 7, 4, 7)),
  q('arsenal', 'bergkamp01', 'Dennis Bergkamp', 1969, 'Netherlands', ['AM', 'ST'], 86, 87, 2005, 25, t(9, 6, 8, 8, 3, 6)),
  q('arsenal', 'henry01', 'Thierry Henry', 1977, 'France', ['ST', 'LW'], 88, 92, 2006, 25, t(9, 7, 9, 8, 4, 8)),
  q('arsenal', 'wiltord', 'Sylvain Wiltord', 1974, 'France', ['ST', 'RW'], 81, 83, 2005, 30, t(7, 6, 7, 6, 5, 7)),
];

/** Chelsea, 2001–02 — PRE-Abramovich: a good side, not yet a superpower. */
export const CHELSEA_2001: CuratedSeed[] = [
  q('chelsea', 'cudicini', 'Carlo Cudicini', 1973, 'Italy', ['GK'], 81, 83, 2006, 25, t(8, 5, 7, 7, 4, 7)),
  q('chelsea', 'melchiot', 'Mario Melchiot', 1976, 'Netherlands', ['RB'], 77, 79, 2004, 25, t(7, 5, 7, 6, 4, 7)),
  q('chelsea', 'terry01', 'John Terry', 1980, 'England', ['CB'], 80, 88, 2006, 30, t(8, 7, 9, 9, 5, 6)),
  q('chelsea', 'gallas01', 'William Gallas', 1977, 'France', ['CB', 'LB'], 81, 85, 2005, 30, t(7, 6, 7, 5, 6, 7)),
  q('chelsea', 'lesaux', 'Graeme Le Saux', 1968, 'England', ['LB'], 78, 79, 2003, 30, t(8, 5, 7, 7, 5, 7)),
  q('chelsea', 'lampard01', 'Frank Lampard', 1978, 'England', ['CM'], 82, 88, 2007, 20, t(9, 6, 9, 8, 3, 7)),
  q('chelsea', 'petit', 'Emmanuel Petit', 1970, 'France', ['DM', 'CM'], 81, 82, 2004, 30, t(7, 6, 7, 6, 5, 7)),
  q('chelsea', 'gronkjaer', 'Jesper Grønkjær', 1977, 'Denmark', ['RW', 'LW'], 77, 80, 2004, 30, t(7, 5, 7, 6, 5, 7)),
  q('chelsea', 'zola01', 'Gianfranco Zola', 1966, 'Italy', ['AM', 'ST'], 84, 85, 2003, 25, t(9, 5, 8, 9, 3, 7), { archetype: 'playmaker' }),
  q('chelsea', 'gudjohnsen01', 'Eiður Guðjohnsen', 1978, 'Iceland', ['ST', 'AM'], 81, 84, 2006, 30, t(8, 5, 7, 6, 4, 7)),
  q('chelsea', 'hasselbaink', 'Jimmy Floyd Hasselbaink', 1972, 'Netherlands', ['ST'], 84, 85, 2004, 30, t(7, 7, 8, 6, 5, 7)),
];

/** Leeds United, 2001–02 — O'Leary's Champions-League semi-finalists. */
export const LEEDS_2001: CuratedSeed[] = [
  q('leeds', 'martyn', 'Nigel Martyn', 1966, 'England', ['GK'], 80, 81, 2004, 25, t(8, 5, 7, 8, 4, 6)),
  q('leeds', 'ferdinand01', 'Rio Ferdinand', 1978, 'England', ['CB'], 84, 90, 2006, 30, t(7, 6, 8, 6, 5, 7)),
  // Woodgate — an England centre-half of rare talent whose career was gutted by
  // injuries. Kept fit and central, the defender he should have been (latent 91).
  q('leeds', 'woodgate01', 'Jonathan Woodgate', 1980, 'England', ['CB'], 81, 88, 2006, 65, t(6, 5, 7, 6, 6, 6), { latentCeiling: 91 }),
  q('leeds', 'harte', 'Ian Harte', 1977, 'Ireland', ['LB'], 78, 80, 2005, 30, t(7, 5, 7, 7, 4, 7)),
  q('leeds', 'batty', 'David Batty', 1968, 'England', ['DM'], 79, 80, 2004, 35, t(8, 5, 8, 8, 6, 6)),
  q('leeds', 'bowyer', 'Lee Bowyer', 1977, 'England', ['CM'], 80, 83, 2004, 35, t(6, 7, 8, 6, 7, 6)),
  q('leeds', 'dacourt01', 'Olivier Dacourt', 1974, 'France', ['CM', 'DM'], 80, 82, 2005, 30, t(7, 5, 7, 5, 6, 7)),
  q('leeds', 'kewell01', 'Harry Kewell', 1978, 'Australia', ['LW', 'ST'], 83, 87, 2004, 50, t(6, 7, 7, 5, 6, 7)),
  q('leeds', 'viduka01', 'Mark Viduka', 1975, 'Australia', ['ST'], 83, 85, 2005, 35, t(6, 7, 7, 5, 6, 6)),
  // Alan Smith — a fearless young striker before a broken leg and a positional
  // exile derailed him. A volatile, high-risk lost talent (latent 88).
  q('leeds', 'smith01', 'Alan Smith', 1980, 'England', ['ST', 'AM'], 78, 84, 2006, 40, t(6, 7, 8, 7, 8, 6), { latentCeiling: 88 }),
];

/** Newcastle United, 2001–02 — Robson's top-four side. */
export const NEWCASTLE_2001: CuratedSeed[] = [
  q('newcastle', 'shearer01', 'Alan Shearer', 1970, 'England', ['ST'], 84, 85, 2004, 40, t(9, 7, 8, 10, 4, 6)),
  q('newcastle', 'bellamy', 'Craig Bellamy', 1979, 'Wales', ['ST', 'LW'], 80, 84, 2005, 40, t(6, 7, 8, 6, 8, 7)),
  q('newcastle', 'robert', 'Laurent Robert', 1975, 'France', ['LW'], 79, 81, 2005, 30, t(6, 6, 7, 5, 6, 7)),
  q('newcastle', 'speed01', 'Gary Speed', 1969, 'Wales', ['CM'], 80, 81, 2004, 20, t(9, 4, 8, 8, 3, 7)),
  q('newcastle', 'dyer', 'Kieron Dyer', 1978, 'England', ['CM', 'RW'], 80, 85, 2006, 66, t(6, 6, 7, 6, 6, 7)),
];

/** FC Porto, 2001–04 — the feeder-club raid target (§ food-chain). In 2001 they
 *  are a strong-but-sellable side a notch below the English/Spanish giants
 *  (prestige 72): Deco and Ricardo Carvalho are the jewels, not yet the European
 *  champions they became under Mourinho. A big club can prise them loose in
 *  2002–03 at a food-chain discount BEFORE the 2004 Champions League win sends
 *  their value — and Barça/Chelsea — after them (see the Porto sell-off ledger).
 *  Ferreira/Maniche joined in 2002; seeded here so the raidable side is whole. */
export const PORTO_2001: CuratedSeed[] = [
  q('porto', 'baia01', 'Vítor Baía', 1969, 'Portugal', ['GK'], 82, 83, 2006, 25, t(8, 6, 8, 9, 4, 6)),
  q('porto', 'jcosta01', 'Jorge Costa', 1971, 'Portugal', ['CB'], 80, 81, 2005, 30, t(9, 6, 8, 9, 5, 6)),
  // Ricardo Carvalho — the jewel. A world-class centre-half in the making; Chelsea
  // paid £30m for him after the 2004 CL win. Raidable years earlier and cheaper.
  q('porto', 'carvalho01', 'Ricardo Carvalho', 1978, 'Portugal', ['CB'], 79, 88, 2006, 25, t(8, 5, 8, 7, 4, 7)),
  q('porto', 'pedroemanuel01', 'Pedro Emanuel', 1975, 'Portugal', ['CB'], 75, 77, 2005, 30, t(8, 5, 7, 7, 5, 6)),
  q('porto', 'nvalente01', 'Nuno Valente', 1974, 'Portugal', ['LB'], 77, 79, 2006, 25, t(8, 4, 7, 7, 4, 7)),
  // Paulo Ferreira — the overlapping right-back Chelsea also took in 2004.
  q('porto', 'pferreira01', 'Paulo Ferreira', 1979, 'Portugal', ['RB'], 77, 84, 2007, 25, t(8, 4, 8, 7, 4, 7)),
  q('porto', 'costinha01', 'Costinha', 1974, 'Portugal', ['DM', 'CM'], 80, 82, 2006, 30, t(8, 6, 8, 7, 5, 7)),
  q('porto', 'maniche01', 'Maniche', 1977, 'Portugal', ['CM', 'DM'], 80, 85, 2007, 30, t(7, 6, 8, 6, 6, 7)),
  // Deco — the orchestrator. Barcelona's 2004 marquee buy; the definitive
  // "raid Porto before his value explodes" target.
  q('porto', 'deco01', 'Deco', 1977, 'Portugal', ['AM', 'CM'], 83, 88, 2006, 25, t(8, 6, 9, 6, 5, 8), { archetype: 'playmaker' }),
  q('porto', 'capucho01', 'Capucho', 1972, 'Portugal', ['RW', 'LW'], 78, 80, 2005, 30, t(7, 6, 7, 6, 5, 7)),
  // Hélder Postiga — the academy striker sold to Spurs on a wave of hype in 2003,
  // then faded; a mild lost talent (latent 84) if unlocked at home.
  q('porto', 'postiga01', 'Hélder Postiga', 1982, 'Portugal', ['ST'], 68, 80, 2006, 30, t(6, 6, 7, 6, 6, 6), { latentCeiling: 84 }),
  q('porto', 'derlei01', 'Derlei', 1975, 'Brazil', ['ST'], 77, 80, 2006, 35, t(7, 6, 8, 6, 5, 7)),
];

/** ACF Fiorentina, 2001–02 — their LAST season before Cecchi Gori's finances
 *  collapsed and the club was liquidated into Serie C2 (summer 2002). Rui Costa
 *  and Toldo were already cashed in (2001); what's left is a raidable, doomed side
 *  (crisis from 2002). Di Livio is the loyal captain who followed them all the way
 *  down; Chiesa and Nuno Gomes are the sellable stars; Adriano (on loan, latent
 *  93) is the lost-talent gamble before "L'Imperatore" rose and then fell. */
export const FIORENTINA_2001: CuratedSeed[] = [
  q('fiorentina', 'manninger02', 'Alexander Manninger', 1977, 'Austria', ['GK'], 76, 78, 2002, 30, t(7, 6, 7, 4, 5, 5), { loanFrom: 'arsenal' }),
  q('fiorentina', 'torricelli02', 'Moreno Torricelli', 1970, 'Italy', ['RB', 'CB'], 74, 74, 2003, 35, t(8, 4, 6, 7, 3, 7)),
  q('fiorentina', 'tarozzi02', 'Andrea Tarozzi', 1973, 'Italy', ['RB', 'CB'], 70, 71, 2003, 35, t(7, 4, 5, 7, 3, 6)),
  q('fiorentina', 'adani02', 'Daniele Adani', 1974, 'Italy', ['CB'], 74, 75, 2002, 35, t(7, 7, 7, 5, 5, 7)),
  q('fiorentina', 'moretti02', 'Emiliano Moretti', 1981, 'Italy', ['LB', 'CB'], 72, 82, 2005, 30, t(8, 4, 7, 6, 3, 7)),
  // Di Livio — the loyal captain, the only man who stayed down into Serie C2.
  q('fiorentina', 'dilivio02', 'Angelo Di Livio', 1966, 'Italy', ['DM', 'CM'], 74, 74, 2003, 35, t(9, 3, 6, 10, 2, 8), { loyalty: 92 }),
  q('fiorentina', 'amaral02', 'Amaral', 1973, 'Brazil', ['DM', 'CB'], 75, 76, 2004, 35, t(7, 6, 6, 5, 5, 6)),
  q('fiorentina', 'baronio02', 'Roberto Baronio', 1977, 'Italy', ['CM'], 71, 76, 2002, 40, t(6, 5, 6, 5, 5, 6)),
  q('fiorentina', 'amoroso02', 'Christian Amoroso', 1976, 'Italy', ['CM', 'AM'], 72, 74, 2003, 35, t(7, 5, 6, 6, 4, 6)),
  // Morfeo — a gifted playmaker who drifted through a journeyman career (latent 84).
  q('fiorentina', 'morfeo02', 'Domenico Morfeo', 1976, 'Italy', ['AM'], 77, 80, 2003, 40, t(5, 7, 6, 4, 7, 5), { latentCeiling: 84 }),
  q('fiorentina', 'nunogomes02', 'Nuno Gomes', 1976, 'Portugal', ['ST'], 80, 82, 2004, 45, t(7, 6, 7, 5, 5, 6)),
  q('fiorentina', 'chiesa02', 'Enrico Chiesa', 1970, 'Italy', ['ST'], 83, 84, 2004, 55, t(8, 6, 7, 6, 4, 6)),
  // Adriano — on loan from Inter; the definitive lost talent (latent 93): rose to
  // "L'Imperatore", then a spectacular off-pitch collapse. A cheap gamble here.
  q('fiorentina', 'adriano02', 'Adriano', 1982, 'Brazil', ['ST'], 76, 84, 2004, 35, t(4, 7, 6, 4, 8, 6), { latentCeiling: 93, loanFrom: 'inter' }),
];

/** Source clubs for the Liverpool 2002 decisions + Chelsea's 2003 splurge. */
export const LENS_2001: CuratedSeed[] = [
  // Diouf — a World Cup star who flopped in England on attitude. The riskiest
  // lost-talent bet there is (prof 4, ego 8, volatile): most who try him get
  // burned, but the talent (latent 88) is genuinely there for a manager who reaches him.
  q('lens', 'diouf', 'El-Hadji Diouf', 1981, 'Senegal', ['RW', 'ST'], 78, 84, 2006, 30, t(4, 8, 7, 4, 8, 6), { latentCeiling: 88 }),
];
export const LILLE_2001: CuratedSeed[] = [
  q('lille', 'cheyrou', 'Bruno Cheyrou', 1978, 'France', ['AM', 'LW'], 75, 82, 2006, 35, t(6, 6, 6, 6, 6, 6)),
];
/** Chelsea's real 2003 takeover buys, at their source clubs — they only move if
 *  Abramovich actually completes the purchase (the enabledBy funder). */
export const CHELSEA_TARGETS_2003: CuratedSeed[] = [
  q('real_madrid', 'makelele03', 'Claude Makélélé', 1973, 'France', ['DM'], 85, 86, 2007, 25, t(9, 4, 8, 7, 3, 7)),
  q('blackburn', 'duff03', 'Damien Duff', 1979, 'Ireland', ['LW', 'RW'], 82, 84, 2007, 35, t(8, 5, 7, 7, 4, 7)),
  q('inter', 'crespo03', 'Hernán Crespo', 1975, 'Argentina', ['ST'], 85, 86, 2007, 40, t(7, 6, 8, 5, 5, 7)),
  q('parma', 'mutu03', 'Adrian Mutu', 1979, 'Romania', ['ST', 'AM'], 82, 85, 2007, 35, t(4, 8, 7, 5, 8, 6)),
  q('southampton', 'bridge03', 'Wayne Bridge', 1980, 'England', ['LB'], 79, 82, 2007, 35, t(7, 5, 7, 6, 4, 7)),
];

/** Curated squads for the liverpool-2001 scenario, keyed by club. */
/** Tottenham Hotspur, 2001–02 — Hoddle's side; Sol Campbell still here at kickoff
 *  (his free-transfer defection to Arsenal is the counterfactual to prevent),
 *  Sheringham back home, a teenage Ledley King emerging. */
export const SPURS_2001: CuratedSeed[] = [
  q('spurs', 'sullivan01s', 'Neil Sullivan', 1970, 'Scotland', ['GK'], 76, 77, 2004, 25, t(7, 5, 7, 7, 5, 6)),
  q('spurs', 'keller01s', 'Kasey Keller', 1969, 'United States', ['GK'], 77, 78, 2005, 25, t(8, 5, 7, 7, 4, 7)),
  // Campbell — England's best defender, agitating for a free move across north
  // London to Arsenal; the betrayal you can fight to stop.
  q('spurs', 'campbell01s', 'Sol Campbell', 1974, 'England', ['CB'], 85, 87, 2002, 25, t(8, 6, 8, 5, 5, 6), { archetype: 'covering-cb' }),
  q('spurs', 'king01s', 'Ledley King', 1980, 'England', ['CB', 'DM'], 79, 88, 2006, 40, t(9, 4, 8, 10, 3, 7), { archetype: 'ball-playing-cb' }),
  q('spurs', 'perry01s', 'Chris Perry', 1973, 'England', ['CB'], 74, 75, 2004, 30, t(8, 4, 7, 8, 4, 6)),
  q('spurs', 'taricco01s', 'Mauricio Taricco', 1973, 'Argentina', ['LB', 'RB'], 75, 77, 2005, 35, t(7, 5, 7, 7, 6, 7)),
  q('spurs', 'carr01s', 'Stephen Carr', 1976, 'Ireland', ['RB'], 78, 81, 2005, 35, t(8, 5, 7, 8, 5, 7), { archetype: 'full-back-attacking' }),
  q('spurs', 'ziege01s', 'Christian Ziege', 1972, 'Germany', ['LB', 'LW'], 78, 80, 2005, 40, t(7, 6, 7, 6, 5, 7), { archetype: 'full-back-attacking' }),
  q('spurs', 'freund01s', 'Steffen Freund', 1970, 'Germany', ['DM', 'CM'], 74, 75, 2004, 35, t(8, 5, 7, 8, 6, 7), { archetype: 'deep-playmaker' }),
  q('spurs', 'anderton01s', 'Darren Anderton', 1972, 'England', ['RW', 'AM'], 79, 82, 2004, 55, t(7, 6, 7, 8, 4, 7), { archetype: 'inside-forward' }),
  q('spurs', 'poyet01s', 'Gustavo Poyet', 1967, 'Uruguay', ['AM', 'CM'], 80, 81, 2004, 30, t(8, 6, 8, 7, 5, 7), { archetype: 'playmaker' }),
  q('spurs', 'clemence01s', 'Stephen Clemence', 1977, 'England', ['CM', 'DM'], 72, 75, 2005, 30, t(8, 4, 7, 7, 5, 6)),
  q('spurs', 'davies01s', 'Simon Davies', 1979, 'Wales', ['RW', 'CM'], 74, 80, 2006, 30, t(7, 5, 7, 7, 5, 7), { archetype: 'inside-forward' }),
  q('spurs', 'rebrov01s', 'Serhiy Rebrov', 1974, 'Ukraine', ['AM', 'ST'], 78, 82, 2005, 30, t(7, 6, 7, 6, 6, 6), { archetype: 'playmaker' }),
  // Sheringham — back at the Lane at 35, the returning talisman and Player of the
  // Year in waiting.
  q('spurs', 'sheringham01s', 'Teddy Sheringham', 1966, 'England', ['ST', 'AM'], 82, 82, 2003, 30, t(9, 7, 8, 8, 4, 7), { archetype: 'poacher' }),
  q('spurs', 'ferdinand01s', 'Les Ferdinand', 1966, 'England', ['ST'], 78, 79, 2003, 35, t(8, 6, 7, 8, 5, 7), { archetype: 'poacher' }),
  q('spurs', 'iversen01s', 'Steffen Iversen', 1976, 'Norway', ['ST', 'RW'], 76, 80, 2005, 40, t(7, 5, 7, 7, 5, 7), { archetype: 'poacher' }),
  q('spurs', 'leonhardsen01s', 'Øyvind Leonhardsen', 1970, 'Norway', ['CM'], 73, 75, 2004, 35, t(8, 4, 7, 7, 5, 7)),
];

/** Curated squads for the spurs-2001 start — a sleeping giant to reawaken. */
export const SPURS_2001_SQUADS: Record<string, CuratedSeed[]> = {
  spurs: SPURS_2001,
};

/** Celtic, 2001–02 — Martin O'Neill's reigning treble winners: Larsson's European
 *  Golden Boot season, the Sutton/Hartson power up top, Lennon and Lambert in midfield.
 *  A classic selling club — Petrov and Larsson would be prised away by bigger fish. */
export const CELTIC_2001: CuratedSeed[] = [
  q('celtic', 'douglas01', 'Robert Douglas', 1972, 'Scotland', ['GK'], 76, 77, 2005, 25, t(8, 5, 6, 8, 4, 7)),
  q('celtic', 'gould01', 'Jonathan Gould', 1968, 'Scotland', ['GK'], 70, 70, 2003, 25, t(8, 4, 5, 8, 3, 6)),
  q('celtic', 'valgaeren01', 'Joos Valgaeren', 1976, 'Belgium', ['CB'], 77, 79, 2005, 30, t(8, 4, 7, 7, 4, 7), { archetype: 'covering-cb' }),
  q('celtic', 'balde01', 'Dianbobo Balde', 1975, 'Guinea', ['CB'], 78, 80, 2006, 30, t(8, 5, 7, 7, 5, 7), { archetype: 'covering-cb' }),
  q('celtic', 'mjallby01', 'Johan Mjällby', 1971, 'Sweden', ['CB', 'DM'], 77, 78, 2004, 30, t(8, 5, 7, 8, 4, 7), { archetype: 'covering-cb' }),
  q('celtic', 'mcnamara01', 'Jackie McNamara', 1973, 'Scotland', ['RB'], 76, 77, 2005, 30, t(8, 4, 7, 8, 4, 7), { archetype: 'full-back-attacking' }),
  q('celtic', 'boyd01', 'Tom Boyd', 1965, 'Scotland', ['LB', 'CB'], 72, 72, 2003, 30, t(9, 4, 6, 10, 3, 7), { loyalty: 92 }),
  q('celtic', 'lennon01', 'Neil Lennon', 1971, 'N. Ireland', ['DM'], 78, 80, 2005, 28, t(8, 6, 8, 8, 6, 7), { archetype: 'destroyer' }),
  q('celtic', 'petrov01', 'Stiliyan Petrov', 1979, 'Bulgaria', ['CM'], 79, 84, 2006, 25, t(8, 5, 8, 7, 4, 7), { latentCeiling: 84 }),
  q('celtic', 'lambert01', 'Paul Lambert', 1969, 'Scotland', ['CM', 'DM'], 78, 79, 2004, 30, t(9, 5, 7, 9, 4, 7), { archetype: 'deep-playmaker' }),
  q('celtic', 'moravcik01', 'Lubomír Moravčík', 1965, 'Slovakia', ['AM', 'RW'], 80, 80, 2003, 32, t(8, 6, 7, 8, 5, 8), { archetype: 'playmaker' }),
  q('celtic', 'thompson01', 'Alan Thompson', 1973, 'England', ['LW', 'LB'], 76, 77, 2005, 30, t(7, 6, 7, 7, 5, 7)),
  q('celtic', 'agathe01', 'Didier Agathe', 1975, 'France', ['RW', 'RB'], 75, 77, 2005, 30, t(7, 5, 7, 7, 5, 7)),
  q('celtic', 'petta01', 'Bobby Petta', 1974, 'Netherlands', ['LW'], 72, 74, 2004, 30, t(6, 6, 6, 6, 6, 7)),
  q('celtic', 'guppy01', 'Steve Guppy', 1969, 'England', ['LW'], 71, 72, 2004, 30, t(7, 4, 6, 7, 4, 7)),
  q('celtic', 'healy01', 'Colin Healy', 1980, 'Ireland', ['CM'], 70, 76, 2005, 30, t(7, 4, 7, 7, 4, 7)),
  q('celtic', 'sylla01', 'Momo Sylla', 1977, 'Guinea', ['CM', 'RW'], 72, 74, 2005, 30, t(7, 5, 7, 6, 5, 7)),
  q('celtic', 'wieghorst01', 'Morten Wieghorst', 1971, 'Denmark', ['CM'], 71, 72, 2004, 45, t(7, 4, 6, 7, 4, 7)),
  // Larsson — the King of Kings; the European Golden Boot and the club's talisman.
  q('celtic', 'larsson01', 'Henrik Larsson', 1971, 'Sweden', ['ST'], 86, 87, 2004, 30, t(9, 6, 8, 8, 4, 8), { archetype: 'poacher', loyalty: 85 }),
  q('celtic', 'sutton01', 'Chris Sutton', 1973, 'England', ['ST'], 80, 81, 2005, 30, t(7, 6, 7, 7, 5, 7), { archetype: 'poacher' }),
  q('celtic', 'hartson01', 'John Hartson', 1975, 'Wales', ['ST'], 79, 80, 2005, 40, t(7, 6, 7, 6, 6, 6), { archetype: 'poacher' }),
  q('celtic', 'maloney01', 'Shaun Maloney', 1983, 'Scotland', ['AM', 'ST'], 66, 80, 2005, 35, t(7, 5, 7, 7, 4, 7), { latentCeiling: 81 }),
];

/** Rangers, 2001–02 — Advocaat's big-spending Ibrox side (McLeish took over in Dec):
 *  captain Barry Ferguson, the £12m Tore André Flo, Ronald de Boer and Amoruso. A
 *  cash-rich buyer at home but a selling club to the elite south of the border. */
export const RANGERS_2001: CuratedSeed[] = [
  q('rangers', 'klos01', 'Stefan Klos', 1971, 'Germany', ['GK'], 80, 81, 2005, 25, t(8, 5, 6, 8, 4, 7)),
  q('rangers', 'mcgregor01', 'Allan McGregor', 1982, 'Scotland', ['GK'], 66, 82, 2006, 25, t(7, 5, 7, 7, 5, 6), { latentCeiling: 83 }),
  q('rangers', 'amoruso01', 'Lorenzo Amoruso', 1971, 'Italy', ['CB'], 79, 80, 2004, 30, t(8, 6, 7, 7, 5, 7), { archetype: 'covering-cb', loyalty: 85 }),
  q('rangers', 'konterman01', 'Bert Konterman', 1971, 'Netherlands', ['CB', 'DM'], 74, 75, 2004, 30, t(8, 4, 6, 7, 4, 7), { archetype: 'covering-cb' }),
  q('rangers', 'moore01', 'Craig Moore', 1975, 'Australia', ['CB'], 76, 78, 2005, 30, t(8, 5, 7, 7, 4, 7), { archetype: 'covering-cb' }),
  q('rangers', 'wilson01', 'Scott Wilson', 1977, 'Scotland', ['CB'], 71, 73, 2004, 30, t(7, 4, 6, 7, 4, 7)),
  q('rangers', 'numan01', 'Arthur Numan', 1969, 'Netherlands', ['LB'], 78, 79, 2003, 28, t(8, 5, 7, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('rangers', 'ball01', 'Michael Ball', 1979, 'England', ['LB'], 75, 80, 2006, 40, t(7, 5, 7, 6, 5, 7), { archetype: 'full-back-attacking' }),
  q('rangers', 'vidmar01', 'Tony Vidmar', 1970, 'Australia', ['LB', 'CB'], 73, 74, 2003, 30, t(8, 4, 6, 7, 4, 7)),
  q('rangers', 'ricksen01', 'Fernando Ricksen', 1976, 'Netherlands', ['RB', 'DM'], 76, 78, 2006, 30, t(6, 7, 8, 6, 7, 7)),
  q('rangers', 'ross01', 'Maurice Ross', 1981, 'Scotland', ['RB'], 70, 74, 2005, 30, t(7, 5, 7, 6, 5, 7)),
  // Barry Ferguson — the homegrown captain and midfield heartbeat.
  q('rangers', 'bferguson01', 'Barry Ferguson', 1978, 'Scotland', ['CM'], 82, 84, 2005, 28, t(8, 6, 8, 8, 5, 7), { archetype: 'deep-playmaker', latentCeiling: 84 }),
  q('rangers', 'nerlinger01', 'Christian Nerlinger', 1973, 'Germany', ['DM', 'CM'], 76, 77, 2004, 30, t(8, 5, 7, 7, 4, 7), { archetype: 'destroyer' }),
  q('rangers', 'malcolm01', 'Bob Malcolm', 1980, 'Scotland', ['DM', 'CB'], 71, 74, 2005, 30, t(7, 4, 7, 7, 4, 6)),
  q('rangers', 'deboer01', 'Ronald de Boer', 1970, 'Netherlands', ['AM', 'ST'], 80, 81, 2004, 30, t(8, 6, 8, 7, 5, 8), { archetype: 'playmaker' }),
  q('rangers', 'latapy01', 'Russell Latapy', 1968, 'Trinidad and Tobago', ['AM'], 73, 74, 2003, 30, t(6, 7, 6, 5, 7, 7)),
  q('rangers', 'mccann01', 'Neil McCann', 1974, 'Scotland', ['LW'], 75, 76, 2004, 30, t(7, 5, 7, 7, 5, 7)),
  q('rangers', 'lovenkrands01', 'Peter Løvenkrands', 1980, 'Denmark', ['LW', 'ST'], 75, 79, 2006, 30, t(7, 5, 7, 6, 5, 7), { archetype: 'inside-forward' }),
  // Flo — the £12m club-record striker.
  q('rangers', 'flo01', 'Tore André Flo', 1973, 'Norway', ['ST'], 80, 81, 2005, 30, t(7, 6, 7, 6, 5, 7), { archetype: 'poacher' }),
  q('rangers', 'caniggia01', 'Claudio Caniggia', 1967, 'Argentina', ['ST'], 77, 77, 2003, 35, t(6, 8, 7, 5, 7, 6), { archetype: 'poacher' }),
  q('rangers', 'mols01', 'Michael Mols', 1970, 'Netherlands', ['ST'], 77, 78, 2004, 40, t(7, 6, 7, 6, 5, 7), { archetype: 'poacher' }),
  q('rangers', 'arveladze01', 'Shota Arveladze', 1973, 'Georgia', ['ST', 'LW'], 77, 78, 2005, 30, t(7, 6, 8, 6, 5, 7), { archetype: 'poacher' }),
  q('rangers', 'dodds01', 'Billy Dodds', 1969, 'Scotland', ['ST'], 73, 73, 2003, 32, t(7, 5, 7, 6, 5, 6), { archetype: 'poacher' }),
  q('rangers', 'miller01', 'Kenny Miller', 1979, 'Scotland', ['ST'], 73, 80, 2005, 30, t(7, 6, 8, 6, 5, 7), { archetype: 'poacher', latentCeiling: 81 }),
];

/** Galatasaray, 2001–02 — Mircea Lucescu's Süper Lig champions, a year after the 2000
 *  UEFA Cup triumph but with that core dismantled (Hagi retired; Taffarel, Popescu, Emre,
 *  Okan, Jardel all sold). Hasan Şaş is the jewel the elite would come circling for. */
export const GALATASARAY_2001: CuratedSeed[] = [
  q('galatasaray', 'mondragon01', 'Faryd Mondragón', 1971, 'Colombia', ['GK'], 80, 81, 2005, 25, t(7, 6, 7, 7, 5, 7)),
  q('galatasaray', 'kereminan01', 'Kerem İnan', 1980, 'Turkey', ['GK'], 66, 70, 2004, 25, t(7, 4, 6, 7, 4, 7)),
  q('galatasaray', 'bulentkorkmaz01', 'Bülent Korkmaz', 1968, 'Turkey', ['CB'], 80, 80, 2004, 30, t(9, 6, 7, 10, 4, 7), { archetype: 'covering-cb', loyalty: 92 }),
  q('galatasaray', 'emreasik01', 'Emre Aşık', 1973, 'Turkey', ['CB'], 78, 79, 2005, 30, t(7, 6, 7, 7, 6, 7), { archetype: 'covering-cb' }),
  q('galatasaray', 'inceefe01', 'Vedat İnceefe', 1974, 'Turkey', ['CB'], 72, 73, 2004, 30, t(7, 4, 6, 7, 4, 7)),
  // On loan from Marseille for 2001-02 only.
  q('galatasaray', 'sebperez01', 'Sébastien Pérez', 1973, 'France', ['CB', 'DM'], 76, 77, 2002, 30, t(7, 5, 7, 6, 5, 6), { loanFrom: 'marseille' }),
  q('galatasaray', 'gvictoria01', 'Gustavo Victoria', 1980, 'Colombia', ['LB', 'LW'], 72, 75, 2005, 30, t(7, 5, 7, 6, 5, 7)),
  q('galatasaray', 'hakanunsal01', 'Hakan Ünsal', 1973, 'Turkey', ['LB'], 78, 79, 2004, 30, t(7, 6, 7, 7, 6, 7), { archetype: 'full-back-attacking' }),
  q('galatasaray', 'davala01', 'Ümit Davala', 1973, 'Turkey', ['RW', 'RB'], 78, 79, 2004, 30, t(7, 6, 8, 6, 6, 7)),
  q('galatasaray', 'penbe01', 'Ergün Penbe', 1972, 'Turkey', ['DM', 'CM'], 77, 78, 2005, 28, t(8, 5, 7, 8, 4, 7), { archetype: 'destroyer' }),
  q('galatasaray', 'suatkaya01', 'Suat Kaya', 1967, 'Turkey', ['DM', 'CM'], 73, 73, 2003, 30, t(8, 5, 6, 8, 4, 7)),
  q('galatasaray', 'fleurquin01', 'Andrés Fleurquin', 1975, 'Uruguay', ['DM', 'CM'], 76, 77, 2005, 30, t(7, 5, 7, 6, 5, 6)),
  q('galatasaray', 'joaobatista01', 'João Batista', 1975, 'Brazil', ['CB', 'DM'], 73, 75, 2005, 30, t(7, 5, 7, 6, 5, 7)),
  // Hasan Şaş — the creative heartbeat and 2002 World Cup star; the elite come calling.
  q('galatasaray', 'hasansas01', 'Hasan Şaş', 1976, 'Turkey', ['LW', 'AM'], 83, 84, 2005, 32, t(8, 6, 8, 7, 5, 7), { archetype: 'playmaker' }),
  q('galatasaray', 'ariferdem01', 'Arif Erdem', 1972, 'Turkey', ['ST', 'AM'], 78, 79, 2004, 30, t(8, 6, 7, 8, 5, 7), { archetype: 'poacher' }),
  q('galatasaray', 'umitkaran01', 'Ümit Karan', 1976, 'Turkey', ['ST'], 79, 80, 2005, 32, t(7, 6, 8, 7, 5, 7), { archetype: 'poacher' }),
  q('galatasaray', 'sedatdebreli01', 'Sedat Debreli', 1983, 'Turkey', ['ST'], 62, 76, 2005, 32, t(7, 5, 7, 7, 4, 7), { latentCeiling: 77 }),
];

/** Fenerbahçe, 2001–02 — runners-up under Mustafa Denizli then Werner Lorant. A big-club
 *  selling engine: Rüştü was Europe's best keeper (linked with Barcelona), and Rapaić &
 *  Revivo were prime targets — Revivo would defect to Galatasaray in the summer of 2002. */
export const FENERBAHCE_2001: CuratedSeed[] = [
  // Rüştü — world-class No.1, 3rd at the 2002 World Cup; the giants circle.
  q('fenerbahce', 'rustu01', 'Rüştü Reçber', 1973, 'Turkey', ['GK'], 84, 85, 2005, 25, t(8, 6, 8, 8, 4, 7)),
  q('fenerbahce', 'recepbiler01', 'Recep Biler', 1981, 'Turkey', ['GK'], 66, 74, 2005, 25, t(7, 4, 7, 8, 4, 7)),
  q('fenerbahce', 'mirkovic01', 'Zoran Mirković', 1971, 'Serbia', ['RB'], 77, 78, 2004, 30, t(8, 5, 7, 6, 5, 7), { archetype: 'full-back-attacking' }),
  q('fenerbahce', 'fatihakyel01', 'Fatih Akyel', 1977, 'Turkey', ['RB', 'CB'], 77, 78, 2005, 30, t(7, 5, 7, 7, 5, 7)),
  q('fenerbahce', 'umitozat01', 'Ümit Özat', 1976, 'Turkey', ['CB', 'DM'], 78, 79, 2005, 30, t(8, 5, 7, 7, 5, 7), { archetype: 'covering-cb' }),
  q('fenerbahce', 'ogun01', 'Ogün Temizkanoğlu', 1969, 'Turkey', ['CB'], 76, 77, 2003, 32, t(8, 5, 7, 8, 4, 7), { archetype: 'covering-cb' }),
  q('fenerbahce', 'mustafadogan01', 'Mustafa Doğan', 1976, 'Turkey', ['CB'], 73, 74, 2004, 30, t(7, 5, 7, 6, 5, 7)),
  q('fenerbahce', 'uche01', 'Uche Okechukwu', 1967, 'Nigeria', ['CB'], 77, 77, 2003, 32, t(8, 5, 7, 8, 4, 7), { archetype: 'covering-cb', loyalty: 88 }),
  q('fenerbahce', 'serkanozsoy01', 'Serkan Özsoy', 1978, 'Turkey', ['CB', 'RB'], 71, 73, 2004, 30, t(7, 4, 6, 7, 4, 7)),
  q('fenerbahce', 'abdullahercan01', 'Abdullah Ercan', 1971, 'Turkey', ['LB', 'CM'], 76, 77, 2005, 30, t(8, 5, 7, 7, 4, 7), { archetype: 'full-back-attacking' }),
  q('fenerbahce', 'samjohnson01', 'Samuel Johnson', 1973, 'Ghana', ['CM', 'DM'], 76, 77, 2004, 30, t(7, 5, 7, 6, 5, 7), { archetype: 'destroyer' }),
  q('fenerbahce', 'lazetic01', 'Nikola Lazetić', 1978, 'Serbia', ['CM'], 75, 77, 2005, 30, t(7, 5, 7, 6, 5, 7)),
  q('fenerbahce', 'reinaldosimao01', 'Reinaldo Vicente Simão', 1968, 'Brazil', ['DM'], 74, 74, 2004, 30, t(7, 5, 6, 6, 5, 6), { archetype: 'destroyer' }),
  q('fenerbahce', 'bayraktar01', 'Hakan Bayraktar', 1976, 'Turkey', ['AM', 'CM'], 77, 78, 2005, 30, t(7, 5, 7, 7, 5, 7), { archetype: 'playmaker' }),
  q('fenerbahce', 'yusufsimsek01', 'Yusuf Şimşek', 1975, 'Turkey', ['CM', 'AM'], 74, 75, 2004, 30, t(7, 5, 7, 6, 5, 7)),
  q('fenerbahce', 'ceyhuneris01', 'Ceyhun Eriş', 1977, 'Turkey', ['AM'], 72, 75, 2005, 30, t(7, 5, 7, 6, 5, 7)),
  // Rapaić — Croatian playmaker and prime target; left mid-season amid contract disputes.
  q('fenerbahce', 'rapaic01', 'Milan Rapaić', 1973, 'Croatia', ['RW', 'AM'], 82, 83, 2004, 32, t(6, 7, 7, 5, 7, 7), { archetype: 'playmaker' }),
  // Revivo — the Israeli talisman; would controversially cross to Galatasaray in summer 2002.
  q('fenerbahce', 'revivo01', 'Haim Revivo', 1972, 'Israel', ['AM', 'LW'], 82, 83, 2004, 32, t(7, 7, 8, 5, 6, 7), { archetype: 'playmaker' }),
  q('fenerbahce', 'kanderson01', 'Kennet Andersson', 1967, 'Sweden', ['ST'], 77, 77, 2002, 40, t(7, 5, 7, 7, 4, 7), { archetype: 'poacher' }),
  q('fenerbahce', 'serhatakin01', 'Serhat Akın', 1981, 'Turkey', ['ST'], 73, 80, 2005, 32, t(6, 6, 8, 6, 6, 7), { archetype: 'poacher', latentCeiling: 80 }),
  q('fenerbahce', 'oktayderelioglu01', 'Oktay Derelioğlu', 1975, 'Turkey', ['ST'], 74, 75, 2004, 32, t(7, 6, 7, 6, 5, 7), { archetype: 'poacher' }),
];

export const LIVERPOOL_2001_SQUADS: Record<string, CuratedSeed[]> = {
  liverpool: LIVERPOOL_2001,
  man_utd: MAN_UTD_2001,
  arsenal: ARSENAL_2001,
  chelsea: CHELSEA_2001,
  leeds: LEEDS_2001,
  newcastle: NEWCASTLE_2001,
  porto: PORTO_2001,
  fiorentina: FIORENTINA_2001,
  celtic: CELTIC_2001,
  rangers: RANGERS_2001,
  galatasaray: GALATASARAY_2001,
  fenerbahce: FENERBAHCE_2001,
  lens: LENS_2001,
  lille: LILLE_2001,
  real_madrid: [CHELSEA_TARGETS_2003[0]!],
  blackburn: [CHELSEA_TARGETS_2003[1]!],
  inter: [CHELSEA_TARGETS_2003[2]!],
  parma: [CHELSEA_TARGETS_2003[3]!],
  southampton: [CHELSEA_TARGETS_2003[4]!],
};
