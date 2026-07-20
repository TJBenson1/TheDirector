/**
 * The Reality Register (§ story-first counterfactual) — curated real events of the
 * era that the Director lives THROUGH, and whose outcome the game lets swing away
 * from history when the FACTORS warrant it. Three registers, all reality-accurate
 * and all able to "go the other way":
 *
 *   • contract sagas   — the tense will-they-won't-they renewals (Gerrard's Chelsea
 *                        u-turn, Henry to Barça, Suárez's £40m+£1, Pirlo let walk).
 *   • sporting near-misses — the almost-glory / almost-disaster (a title by a point,
 *                        a final lost late, a great escape) the Director can rewrite.
 *   • transfer & career near-misses — deals and careers that ALMOST went differently.
 *
 * The engine here is the FACTOR MODEL: each beat carries what really happened
 * (`realStayed`, `realWon`, …) as an anchor, and the live squad state — wages vs the
 * market, morale, agitation, board backing, a circling suitor, squad depth, form —
 * shifts the odds around that anchor. In a faithful, undisturbed run the factors sit
 * near neutral and reality mostly holds; mistreat a star or build a juggernaut and
 * the register bends. The beats themselves are authored in events.ts as ScriptedEvent
 * packs that call these helpers; this module owns the maths and the curated data.
 *
 * Nothing here touches the passive man-utd-1999 calibration: the calibration scenario
 * carries no register beats, and every helper is a pure read of state.
 */

import type { ClubId, GameState, PlayerState } from './types.js';
import { suggestWage, valuePlayer } from './finance.js';

function yearOf(state: GameState): number {
  return Number(state.clock.date.slice(0, 4));
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/**
 * The probability a player STAYS this time, anchored on what really happened and
 * bent by how the club has treated him and who is circling. This is the heart of
 * the will-they-won't-they: a star reality kept (Gerrard, Suárez, Drogba) walks if
 * he's underpaid, unhappy and courted by a giant; a star reality sold (Henry, Pirlo,
 * Neymar) can be talked into staying if the wages, the mood and the project are right.
 */
export function contractRetentionOdds(
  state: GameState,
  player: PlayerState,
  opts: { realStayed: boolean; suitor?: ClubId },
): number {
  const year = yearOf(state);
  const club = player.club ? state.clubs[player.club] : undefined;
  // Reality anchor: history is the strong prior, factors move it.
  let p = opts.realStayed ? 0.68 : 0.32;

  // Wages vs the going market rate for his level — the single biggest lever.
  const market = suggestWage(player, year);
  const ratio = market > 0 ? player.wage / market : 1;
  p += ratio >= 1.15 ? 0.15 : ratio >= 0.95 ? 0.05 : ratio >= 0.8 ? -0.06 : -0.17;

  // Happiness and unrest.
  p += ((player.morale - 55) / 45) * 0.16;
  p -= (player.agitation / 100) * 0.22;

  // Character: a loyal one-club man resists; a restless careerist chases the move.
  p += ((player.personality.loyalty - 5) / 5) * 0.1;
  p -= ((player.personality.ambition - 5) / 5) * 0.06;

  // A materially bigger suitor unsettles him; a smaller one barely registers.
  if (opts.suitor && club) {
    const suit = state.clubs[opts.suitor];
    if (suit) p -= Math.max(0, Math.min(0.14, (suit.strength - club.strength) * 0.02));
  }

  // The board's backing of the project — a club going places holds its stars.
  p += ((state.board.patience - 50) / 50) * 0.06;

  return clamp01(p) * 0.94 + 0.03; // keep it genuinely uncertain, never a certainty
}

/** The transfer fee (in £) his exit would command right now, floored for drama. */
export function sagaFee(state: GameState, player: PlayerState): number {
  const raw = valuePlayer(player, yearOf(state));
  return Math.max(2_000_000, Math.round(raw / 1_000_000) * 1_000_000);
}

/** A whole-million label for a fee, e.g. 40 for £40m. */
export function feeMillions(fee: number): number {
  return Math.max(1, Math.round(fee / 1_000_000));
}

/**
 * The probability the Director REWRITES a famous near-miss — wins the title he lost
 * by a point, takes the final he lost late, survives the drop reality suffered. It
 * turns on how good the side actually is now relative to its league (its strength
 * percentile), lifted by a happy, in-form dressing room and a backing board. Kept in
 * a tense middle band: the greatest near-misses were decided by inches, and this beat
 * should feel that way — never a foregone conclusion in either direction.
 *
 * `realWon` flips the meaning: for the handful of near-misses reality turned into
 * glory at the death (City's "Aguerooooo" title), it returns the odds that the
 * glory HOLDS — so a mismanaged, low-morale side can throw it away instead.
 */
export function sportingRewriteOdds(
  state: GameState,
  opts: { realWon?: boolean } = {},
): number {
  const club = state.clubs[state.playerClub];
  if (!club) return 0.5;
  const league = club.leagueId ? state.leagues[club.leagueId] : undefined;

  // Strength percentile within the club's own league (0 = weakest, 1 = strongest).
  let percentile = 0.5;
  if (league) {
    const rivals = Object.values(state.clubs).filter((c) => c.leagueId === club.leagueId);
    if (rivals.length > 1) {
      const weaker = rivals.filter((c) => c.id !== club.id && c.strength < club.strength).length;
      percentile = weaker / (rivals.length - 1);
    }
  }

  // Base: a title-calibre side (top of its league) rewrites more often than a
  // mid-table one, but even the best only lands the miracle a bit over half the time.
  let p = 0.34 + percentile * 0.30;

  // Dressing-room mood and momentum across the run-in.
  const squad = club.squad.map((id) => state.players[id]).filter((x): x is PlayerState => !!x);
  if (squad.length) {
    const avgMorale = squad.reduce((a, b) => a + b.morale, 0) / squad.length;
    p += ((avgMorale - 55) / 45) * 0.12;
  }
  p += ((state.board.patience - 50) / 50) * 0.05;

  if (opts.realWon) {
    // Reality already won it at the death; here we return the odds it HOLDS. A strong,
    // happy side keeps its nerve; a mismanaged one can still throw the miracle away.
    p = 0.5 + (p - 0.5) * 0.7 + 0.14;
  }

  return clamp01(p) * 0.9 + 0.05;
}
