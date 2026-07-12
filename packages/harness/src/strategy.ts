/**
 * Strategy bots (§12 "mixed strategies incl. a strong scripted-bot player").
 *
 * A bot inspects a GameState's pending decisions and returns choices. M1 has no
 * decisions to make, so both bots are effectively no-ops — but the interface is
 * fixed now so M6+ can plug real transfer/contract policies (and the §18
 * scripted-bot regression) in without touching the harness runner.
 */

import type { GameState, Decision, TransferRequest } from '@director/engine';
import { Rng, valuePlayer, currentYear, evaluateApproach } from '@director/engine';

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

/**
 * Raids a simulated domestic rival each summer — buying a willing, affordable
 * player from another in-league club. Exists to exercise the counter-punch
 * response (§9a): a raided rival must respond within ≤2 windows. Resolves
 * decisions (first choice) so scandals/events don't stall the loop.
 */
export const raidingBot: StrategyBot = {
  name: 'raiding',
  decide: (state, decisions, rng) => firstChoiceBot.decide(state, decisions, rng),
  transferActions(state) {
    const clubId = state.playerClub;
    const club = state.clubs[clubId];
    if (!club) return [];
    const budget = club.finances.transferBudget;
    const year = currentYear(state);
    const candidates = Object.values(state.players)
      .filter(
        (p) =>
          p.club !== null &&
          p.club !== clubId &&
          state.clubs[p.club]?.leagueId != null && // simulated (in-league) rival
          p.ability >= 68 &&
          valuePlayer(p, year) <= budget,
      )
      .sort((a, b) => b.ability - a.ability);
    for (const p of candidates) {
      const v = evaluateApproach(state, { playerId: p.id, toClub: clubId, wageOffer: p.wage * 1.4 });
      if (v.willing) return [{ playerId: p.id, toClub: clubId, fee: valuePlayer(p, year) }];
    }
    return [];
  },
};

/**
 * Deliberately triggers reality butterflies: each summer it buys a real ledger
 * subject (depriving that player's real destination), then KEEPS the resulting
 * poach-bid targets (rejects the bid). Exercises the star-retention mechanic
 * (§12): of players kept against a logical bid, ~30% still force their way out.
 */
export const butterflyBot: StrategyBot = {
  name: 'butterfly',
  decide: (state, decisions, rng) => firstChoiceBot.decide(state, decisions, rng), // choices[0] on a poach bid is 'reject' (keep)
  transferActions(state) {
    const clubId = state.playerClub;
    const year = currentYear(state);
    const budget = state.clubs[clubId]?.finances.transferBudget ?? 0;
    // Buyable ledger subjects, only from their original source club (so a
    // player already moved on isn't chased around the world).
    const subjects: Array<[string, string]> = [['cur_anelka', 'arsenal'], ['cur_overmars', 'arsenal'], ['cur_crespo', 'inter']];
    for (const [id, source] of subjects) {
      const p = state.players[id];
      if (!p || p.club !== source) continue;
      if (valuePlayer(p, year) > budget) continue;
      if (!evaluateApproach(state, { playerId: id, toClub: clubId, wageOffer: p.wage * 1.4 }).willing) continue;
      return [{ playerId: id, toClub: clubId, fee: valuePlayer(p, year) }];
    }
    return [];
  },
};

export const ALL_BOTS: StrategyBot[] = [passiveBot, firstChoiceBot, signingBot, raidingBot, butterflyBot];
