/**
 * Strategy bots (§12 "mixed strategies incl. a strong scripted-bot player").
 *
 * A bot inspects a GameState's pending decisions and returns choices. M1 has no
 * decisions to make, so both bots are effectively no-ops — but the interface is
 * fixed now so M6+ can plug real transfer/contract policies (and the §18
 * scripted-bot regression) in without touching the harness runner.
 */

import type { GameState, Decision } from '@director/engine';
import { Rng } from '@director/engine';

export interface BotChoice {
  decisionId: string;
  choiceId: string;
}

export interface StrategyBot {
  readonly name: string;
  decide(state: GameState, decisions: Decision[], rng: Rng): BotChoice[];
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

export const ALL_BOTS: StrategyBot[] = [passiveBot, firstChoiceBot];
