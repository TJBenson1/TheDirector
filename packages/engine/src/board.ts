/**
 * Board, job security & internal crises (internal-friction §1, §6, §9).
 *
 * The board carries a mandate + patience. Meeting expectations buys latitude;
 * missing them spends it, through warnings to dismissal — the player CAN lose
 * the job (winning is not guaranteed continuation). Separately, internal crises
 * (financial shocks, board-ordered sales, manager unrest, dressing-room
 * trouble) hit every few seasons, imposed on the player rather than chosen.
 *
 * GOVERNING CONSTRAINT (docs/DESIGN-internal-friction.md): friction must stay
 * plausible. Dismissal happens in a meaningful minority of underperforming runs,
 * not a chaotic majority.
 */

import type { Decision, GameState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { standingsOrder } from './season.js';
import { appendMemory } from './memory.js';

/**
 * Review the user's season against the board mandate and adjust patience;
 * escalate to a warning and ultimately dismissal on sustained failure. Called
 * at the rollover once a champion has been crowned.
 */
/**
 * Board temperament (§11): how ruthless the owner is, in [0.7, 1.7]. A rebuild /
 * project board (a modest mandate) rides out lean years; a title-or-bust superclub
 * board and — most of all — a sugar-daddy owner (Abramovich's Chelsea, a takeover)
 * won't. It scales how hard a missed season bites, how early a warning lands, and
 * how readily the axe falls, so the SAME 3rd-place finish is a shrug at one club and
 * a firing offence at another.
 */
export function boardRuthlessness(state: GameState): number {
  let r = 1.0;
  const ownership = state.clubs[state.playerClub]?.finances.ownership;
  if (ownership === 'sugar-daddy') r += 0.35; // trophies-now money (Abramovich, takeovers)
  else if (ownership === 'debt') r -= 0.12; // a club living within a squeeze is more forgiving
  const expected = state.board.expectedFinish;
  if (expected <= 1) r += 0.18; // title-or-bust (Pérez's Real, Ferguson's United)
  else if (expected >= 5) r -= 0.28; // a rebuild / overachiever mandate is patient
  // The Director is given real time to build a project (a forgiving board, by
  // design): even the most demanding owner does not swing the axe on a season or two.
  return Math.max(0.65, Math.min(1.5, r));
}

export function reviewBoard(state: GameState, rng: Rng): void {
  if (state.board.dismissed) return;
  const league = state.leagues[state.clubs[state.playerClub]?.leagueId ?? ''];
  if (!league || league.titleHistory.length === 0) return;

  const order = standingsOrder(league);
  const pos = order.indexOf(state.playerClub);
  if (pos < 0) return;
  const finish = pos + 1;
  const wonTitle = league.titleHistory[league.titleHistory.length - 1]!.championId === state.playerClub;
  const expected = state.board.expectedFinish;
  const r = boardRuthlessness(state);

  let delta: number;
  if (wonTitle) {
    delta = 14;
    state.board.consecutiveMisses = 0;
  } else if (finish <= expected) {
    delta = 7; // meeting the brief buys real goodwill — a project is being backed
    state.board.consecutiveMisses = 0;
  } else {
    // Softened, CAPPED base penalty (a FORGIVING board, by design): one realistic
    // off-season — a strong club finishing behind the era's superpower — barely moves
    // the meter. 1 place short ≈ −3, 2 ≈ −7, 3 ≈ −11, capped at −12 before temperament.
    const miss = finish - expected;
    const base = Math.min(12, 3 + (miss - 1) * 4);
    delta = -Math.round(base * r);
    state.board.consecutiveMisses += 1;
    // The Pérez rule, softened: even an impatient board gives a project two full
    // seasons; only a SUSTAINED run (3+) of misses under demanding ownership escalates.
    if (state.board.consecutiveMisses >= 3 && r >= 1.3) {
      delta -= Math.round(6 * r * (state.board.consecutiveMisses - 2));
    }
  }

  state.board.patience = Math.max(0, Math.min(100, state.board.patience + delta));

  // Always record the season's verdict — the narration layer turns this into the
  // end-of-season review (position, board mood, and, enriched API-side, top scorer
  // and the European run). Pure narration metadata; the sim never reads it back.
  const points = league.standings[state.playerClub]?.points ?? 0;
  logEvent(state, {
    category: 'system',
    code: 'board.season-review',
    message: wonTitle
      ? `Season review: ${state.clubs[state.playerClub]?.name} are CHAMPIONS.`
      : `Season review: finished ${finish}${ordinal(finish)} (the board expected top ${expected}).`,
    data: { finish, expected, points, wonTitle, patience: state.board.patience, season: Number(state.clock.date.slice(0, 4)) - 1 },
  });

  // A FORGIVING board (by design): warnings still come, but the axe needs a genuine,
  // SUSTAINED collapse — several warnings AND a floored meter — and even then it is
  // far from certain. A demanding owner is quicker to grumble, never quick to sack.
  const warnAt = 32 + Math.round(16 * (r - 1));
  const dismissPatience = 15 + Math.round(12 * (r - 1));
  const dismissWarnings = r >= 1.45 ? 2 : 3;
  const dismissChance = Math.min(0.62, 0.28 + 0.18 * r);

  if (delta < 0 && state.board.patience < warnAt) {
    state.board.warnings += 1;
    logEvent(state, {
      category: 'system',
      code: 'board.warning',
      message: `The board issues a warning after finishing ${finish}${ordinal(finish)} (expected top ${expected}).`,
      data: { finish, patience: state.board.patience, warnings: state.board.warnings },
    });
    appendMemory(state, 'board', `Warning after a ${finish}${ordinal(finish)}-place finish.`);

    // Dismissal: only a sustained failure, and even then not a certainty — the board
    // would rather back the project through a rough patch than swing the axe.
    if (state.board.warnings >= dismissWarnings && state.board.patience < dismissPatience && rng.chance(dismissChance)) {
      state.board.dismissed = true;
      logEvent(state, {
        category: 'system',
        code: 'board.sacked',
        message: `You have been dismissed by ${state.clubs[state.playerClub]?.name}. The mandate went unmet.`,
        data: { finish },
      });
    }
  } else if (delta > 0) {
    // A season that meets or beats the brief buys the Director back credit — any
    // warning on the books is eased, so a good year genuinely resets the pressure.
    state.board.warnings = Math.max(0, state.board.warnings - 1);
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0]!;
}

// ── Internal crises (imposed, not chosen) ────────────────────────────────────

interface CrisisSpec {
  code: string;
  title: string;
  description: string;
  build: (state: GameState) => Decision;
}

const CRISES: CrisisSpec[] = [
  {
    code: 'financial-shock',
    title: 'A revenue shortfall hits the club',
    description: 'A shock to the club’s finances (a TV-deal change / a sponsor pulling out) has blown a hole in the budget. Something has to give.',
    build: (s) => ({
      id: `crisis:financial:${s.clock.date}`,
      title: 'Financial shortfall',
      description: 'The board needs the books balanced. Raise funds by selling, or protect the squad and take the hit on patience.',
      interrupt: true,
      clubId: s.playerClub,
      category: 'system',
      choices: [
        { id: 'sell', label: 'Sell to balance the books', successProbability: 0.85, onSuccess: [{ kind: 'money', clubId: s.playerClub, amount: 8_000_000 }, { kind: 'morale', clubId: s.playerClub, amount: -3 }], onFailure: [{ kind: 'morale', clubId: s.playerClub, amount: -6 }] },
        { id: 'absorb', label: 'Protect the squad, absorb the loss', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: -2 }], onFailure: [{ kind: 'boardPatience', amount: -8 }] },
      ],
      falloutIfIgnored: [{ kind: 'boardPatience', amount: -6 }],
      memoryTags: ['finance'],
    }),
  },
  {
    code: 'board-sale',
    title: 'The board wants a big earner sold',
    description: 'The board has identified a high earner they want off the wage bill — against your wishes.',
    build: (s) => ({
      id: `crisis:boardsale:${s.clock.date}`,
      title: 'Board-ordered sale',
      description: 'The board is pushing to cash in on a senior player. Comply, or dig in and spend credibility.',
      interrupt: true,
      clubId: s.playerClub,
      category: 'system',
      choices: [
        { id: 'comply', label: 'Comply and sell', successProbability: 0.8, onSuccess: [{ kind: 'money', clubId: s.playerClub, amount: 6_000_000 }], onFailure: [{ kind: 'morale', clubId: s.playerClub, amount: -5 }] },
        { id: 'resist', label: 'Refuse to sell', successProbability: 0.45, onSuccess: [{ kind: 'morale', clubId: s.playerClub, amount: 4 }], onFailure: [{ kind: 'boardPatience', amount: -9 }] },
      ],
      falloutIfIgnored: [{ kind: 'boardPatience', amount: -5 }],
      memoryTags: ['board'],
    }),
  },
  {
    code: 'manager-unrest',
    title: 'The manager is unhappy with recruitment',
    description: 'The manager feels undermined in the market and is letting it be known.',
    build: (s) => ({
      id: `crisis:manager:${s.clock.date}`,
      title: 'Manager unrest',
      description: 'Your manager is unhappy. Back him with assurances, or hold your line on strategy.',
      interrupt: true,
      clubId: s.playerClub,
      category: 'system',
      choices: [
        { id: 'back', label: 'Back the manager', successProbability: 0.7, onSuccess: [{ kind: 'managerRelationship', amount: 8 }], onFailure: [{ kind: 'managerRelationship', amount: -3 }] },
        { id: 'hold', label: 'Hold your line', successProbability: 0.5, onSuccess: [{ kind: 'boardPatience', amount: 3 }], onFailure: [{ kind: 'managerRelationship', amount: -10 }] },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: -6 }],
      memoryTags: ['manager'],
    }),
  },
  {
    code: 'dressing-room',
    title: 'A dressing-room rift',
    description: 'A clique / a disruptive senior pro is poisoning squad harmony.',
    build: (s) => ({
      id: `crisis:dressingroom:${s.clock.date}`,
      title: 'Dressing-room rift',
      description: 'Squad harmony is fraying. Intervene, or trust it to settle.',
      interrupt: true,
      clubId: s.playerClub,
      category: 'system',
      choices: [
        { id: 'intervene', label: 'Intervene decisively', successProbability: 0.6, onSuccess: [{ kind: 'morale', clubId: s.playerClub, amount: 6 }], onFailure: [{ kind: 'morale', clubId: s.playerClub, amount: -5 }] },
        { id: 'trust', label: 'Trust it to settle', successProbability: 0.45, onSuccess: [], onFailure: [{ kind: 'morale', clubId: s.playerClub, amount: -8 }] },
      ],
      falloutIfIgnored: [{ kind: 'morale', clubId: s.playerClub, amount: -6 }],
      memoryTags: ['chemistry'],
    }),
  },
];

/**
 * Roll for an internal crisis at the user's club this season (imposed
 * adversity, internal-friction §2/§4/§6/§9). Calibrated so the player faces one
 * every ~2–3 seasons on average. Divergence adds to the odds — a reshaped world
 * is a more turbulent one.
 */
export function rollInternalCrisis(state: GameState, rng: Rng, extraChance: number): void {
  if (state.board.dismissed) return;
  const p = Math.min(0.85, 0.42 + extraChance);
  if (!rng.chance(p)) return;

  const crisis = rng.pick(CRISES);
  logEvent(state, {
    category: 'system',
    code: 'internal.crisis',
    message: `Internal crisis: ${crisis.title}`,
    data: { category: crisis.code },
  });
  state.pendingDecisions.push(crisis.build(state));
}
