/**
 * Strategy bots (§12 "mixed strategies incl. a strong scripted-bot player").
 *
 * A bot inspects a GameState's pending decisions and returns choices. M1 has no
 * decisions to make, so both bots are effectively no-ops — but the interface is
 * fixed now so M6+ can plug real transfer/contract policies (and the §18
 * scripted-bot regression) in without touching the harness runner.
 */

import type { GameState, Decision, TransferRequest } from '@director/engine';
import { Rng, valuePlayer, currentYear } from '@director/engine';

export interface BotChoice {
  decisionId: string;
  choiceId: string;
}

export interface StrategyBot {
  readonly name: string;
  decide(state: GameState, decisions: Decision[], rng: Rng): BotChoice[];
  /** Optional summer-window transfer activity (logical signings). */
  transferActions?(state: GameState, rng: Rng): TransferRequest[];
}

/** Passive baseline: never acts. Useful as the "do nothing" control. */
export const passiveBot: StrategyBot = {
  name: 'passive',
  decide: () => [],
};

/** Picks the first offered choice on every pending decision. Stand-in for the
 *  "strong scripted bot" until real policies exist (M6+). */
export const firstChoiceBot: StrategyBot = {
  name: 'first-choice',
  decide: (_state, decisions) =>
    decisions
      .filter((d) => d.choices.length > 0)
      .map((d) => ({ decisionId: d.id, choiceId: d.choices[0]!.id })),
};

/**
 * Makes an "on-paper-logical" signing each summer: an affordable, good-fit
 * foreign player who would strengthen the user club. Exists to exercise the
 * adaptation engine (§3) in the harness — logical signings must still carry real
 * first-season risk, so this bot's outcomes feed the adaptation calibration.
 */
export const signingBot: StrategyBot = {
  name: 'signing',
  decide: () => [],
  transferActions(state, rng) {
    const clubId = state.playerClub;
    const club = state.clubs[clubId];
    if (!club) return [];
    const budget = club.finances.transferBudget;
    const year = currentYear(state);

    // Candidate = a sensible foreign (non-domestic) target: good ability, decent
    // adaptability, affordable. Precisely the "logical signing" that should still
    // sometimes flop.
    const candidates = Object.values(state.players)
      .filter(
        (p) =>
          p.club !== null &&
          p.club !== clubId &&
          state.clubs[p.club]?.leagueId === null && // foreign / non-simulated league
          p.ability >= 72 &&
          p.personality.adaptability >= 5 &&
          valuePlayer(p, year) <= budget,
      )
      .sort((a, b) => b.ability - a.ability);

    if (candidates.length === 0) return [];
    const pick = candidates[rng.int(0, Math.min(4, candidates.length - 1))]!;
    return [{ playerId: pick.id, toClub: clubId, fee: valuePlayer(pick, year) }];
  },
};

export const ALL_BOTS: StrategyBot[] = [passiveBot, firstChoiceBot, signingBot];
