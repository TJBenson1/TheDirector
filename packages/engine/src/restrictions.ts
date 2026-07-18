/**
 * Real-world transfer restrictions that pure market logic misses.
 *
 * Two textures:
 *  • LOAN OWNERSHIP — a player on loan is controlled by his PARENT club, not the
 *    club he's playing for. You can't buy Courtois from Atlético; Chelsea own him.
 *  • RETURNING VILLAINS — some moves the fans would never forgive. Tévez does not
 *    go back to Old Trafford; Figo does not return to Barcelona.
 *
 * Both are consulted in `evaluateApproach`, so every path (recommend, find, sign)
 * respects them.
 */

import type { ClubId, PlayerId, PlayerState } from './types.js';

/** Players on loan, keyed to the PARENT club that actually owns them. Approaching
 *  the loan club gets you nowhere — the parent controls his future. */
const ON_LOAN: Record<PlayerId, ClubId> = {
  cur_courtois_13: 'chelsea', // on loan at Atlético from Chelsea
  cur_lukaku: 'chelsea', // on loan at Everton from Chelsea
};

/** Personae non gratae: clubId → the players its supporters would never accept.
 *  Matched by name so it holds whatever era the player appears in. */
const NON_GRATA: Record<ClubId, string[]> = {
  man_utd: ['Carlos Tévez'], // City's talisman by 2013 — unthinkable
  barcelona: ['Luís Figo'], // the pig's-head defection to Real
  spurs: ['Sol Campbell'], // crossed to Arsenal on a free
};

export function loanParent(playerId: PlayerId): ClubId | undefined {
  return ON_LOAN[playerId];
}

export function isOnLoan(playerId: PlayerId): boolean {
  return playerId in ON_LOAN;
}

export function isPersonaNonGrata(clubId: ClubId, player: PlayerState): boolean {
  return (NON_GRATA[clubId] ?? []).includes(player.name);
}
