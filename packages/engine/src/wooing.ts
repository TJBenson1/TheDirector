/**
 * Wooing / pursuit (§6, §16 — "speak to his people").
 *
 * Reality is hard to override on a whim. A settled star, or a target another club
 * is already in pole position for (the deal reality has lined up), will not be
 * prised away by a cold late bid. He can be got — but you have to have been
 * COURTING him: "speak to his people" over one or more windows to build a pursuit
 * score, and/or be a bigger draw than the club in pole. This is what makes an
 * Eto'o-in-summer-2004 signing something you earn, not something you click.
 */

import type { ClubId, GameState, PlayerId } from './types.js';
import { logEvent } from './eventLog.js';
import { ERA_REALITY, eraForScenario, entryKey } from './ledger.js';
import { transferWindowOrdinal } from './clock.js';

/** How far ahead a reality move can be and still read as "in pole position" for
 *  a player NOW — i.e. imminent enough to gazump. A move further out than this
 *  has not been lined up yet: Nedvěd's 2001 Juventus move is not his "pole" in
 *  1999. Two window-ordinals ≈ one year (this summer → next summer). */
const POLE_HORIZON_ORDINALS = 2;

/** How much one "speak to his people" nudges pursuit; decay per window. */
const COURT_STEP = 30;
const PURSUIT_DECAY = 10;
const MAX_PURSUIT = 100;

/** The user courts a target — builds the pursuit that can override reality. */
export function courtPlayer(state: GameState, playerId: PlayerId): { ok: boolean; pursuit: number; reason: string } {
  const player = state.players[playerId];
  if (!player) return { ok: false, pursuit: 0, reason: 'Unknown player' };
  if (player.club === state.playerClub) return { ok: false, pursuit: 0, reason: 'Already your player' };
  const next = Math.min(MAX_PURSUIT, (state.pursuit[playerId] ?? 0) + COURT_STEP);
  state.pursuit[playerId] = next;
  logEvent(state, {
    category: 'transfer',
    code: 'pursuit.court',
    message: `Your people have spoken to ${player.name}'s camp — interest is building (pursuit ${next}).`,
    data: { playerId, pursuit: next },
  });
  return { ok: true, pursuit: next, reason: `Courting ${player.name} (pursuit ${next}/100).` };
}

/** Pursuit fades if you stop courting — call once per window. */
export function decayPursuit(state: GameState): void {
  for (const id of Object.keys(state.pursuit)) {
    const v = (state.pursuit[id] ?? 0) - PURSUIT_DECAY;
    if (v <= 0) delete state.pursuit[id];
    else state.pursuit[id] = v;
  }
}

/**
 * The move reality has lined up for this player next — his "pole" deal. If he has
 * a real move still ahead (to a club other than the one asking), that club is in
 * pole position, and prising him away means beating them to it. Returns the club
 * AND the real fee, so a rival bidder can be out-bid at the SELLING club (paying
 * more than the pole suitor buys the club's agreement, so the player never gets
 * to negotiate with them — "he isn't allowed to speak to Juve").
 */
export function poleMoveFor(state: GameState, playerId: PlayerId): { to: ClubId; fee: number; window: string } | null {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return null;
  const nowOrd = transferWindowOrdinal(state.clock.date);
  let best: { window: string; to: ClubId; fee: number } | null = null;
  for (const e of pack.realTransferLedger) {
    if (e.playerId !== playerId) continue;
    if (e.to === state.playerClub) continue; // the user's own real signing, not a rival suitor
    if (state.meta.executedLedger.includes(entryKey(e))) continue; // his move already resolved
    if (transferWindowOrdinal(e.window) - nowOrd > POLE_HORIZON_ORDINALS) continue; // too far off to be "in pole" now
    if (!best || e.window < best.window) best = { window: e.window, to: e.to, fee: e.fee };
  }
  return best ? { to: best.to, fee: best.fee, window: best.window } : null;
}

/** The club reality has lined up to sign this player next — his "pole" suitor. */
export function poleSuitorFor(state: GameState, playerId: PlayerId): ClubId | null {
  return poleMoveFor(state, playerId)?.to ?? null;
}
