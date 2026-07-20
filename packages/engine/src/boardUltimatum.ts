/**
 * Board & ownership ultimatums (§ narrative-is-everything, seam 2).
 *
 * When the board's patience has genuinely run down, the pressure stops being a
 * quiet meter and becomes a fork in the road: the owner puts a demand on the desk
 * and dares the Director to meet it. The flavour follows the ownership — a
 * sugar-daddy owner wants trophies for his money NOW; a club living in debt wants
 * the wage bill cut; a plc board just wants results and an end to the drift. Every
 * branch costs something: stake your job on a strong finish and it's double or
 * nothing; comply and balance the books and you gut your own squad; defy them and
 * you spend the last of your credit.
 *
 * This is DISTINCT from the season-end board review (board.ts, which moves the
 * patience meter and can sack you) and from the imposed internal crises: it is a
 * player-facing CHOICE, raised only in a world the Director has reshaped.
 *
 * Gated on DIVERGENCE — a passive, reality-default world (the calibration run)
 * never reshapes and so never provokes an ultimatum. All randomness is on the
 * passed (forked) stream, so the sim RNG is untouched whether one fires or not.
 */

import type { Decision, GameState } from './types.js';
import type { Rng } from './rng.js';
import { divergenceFactor } from './divergence.js';
import { boardRuthlessness } from './board.js';
import { logEvent } from './eventLog.js';

interface UltimatumFlavour {
  code: string;
  title: string;
  description: string;
  /** The "comply" branch — how the board wants the books squared. */
  complyLabel: string;
  complyMoney: number;
}

function flavourFor(state: GameState): UltimatumFlavour {
  const club = state.clubs[state.playerClub];
  const name = club?.name ?? 'the club';
  const ownership = club?.finances.ownership;
  if (ownership === 'sugar-daddy') {
    return {
      code: 'trophies-now',
      title: `The owner wants a return on his money — now`,
      description: `The owner has poured a fortune into ${name} and is done waiting. He didn't buy this club to finish where you're finishing — he wants silverware, and he wants it this season. The message is unmistakable: deliver, or he'll find someone who will.`,
      complyLabel: 'Sanction a fire-sale of fringe men to fund one last statement signing',
      complyMoney: 12_000_000,
    };
  }
  if (ownership === 'debt') {
    return {
      code: 'balance-books',
      title: `The board demands the wage bill comes down`,
      description: `${name} is living beyond its means and the board has run out of road. The debt is real, the lenders are circling, and they want the wage bill cut — whatever it does to the team. Balance the books, or explain to them why you won't.`,
      complyLabel: 'Cut the wage bill — sell to balance the books',
      complyMoney: 9_000_000,
    };
  }
  return {
    code: 'results-now',
    title: `The board has lost patience — results, and soon`,
    description: `The drift has gone on too long for the ${name} board. They've stopped talking about projects and started talking about results. This is the last of your credit: turn it around, and quickly, or they'll turn to someone else.`,
    complyLabel: 'Trim the squad and reinvest — show them decisive action',
    complyMoney: 7_000_000,
  };
}

function buildUltimatum(state: GameState, f: UltimatumFlavour): Decision {
  return {
    id: `ultimatum:${f.code}:${state.clock.date}`,
    title: f.title,
    description: f.description,
    interrupt: true,
    clubId: state.playerClub,
    category: 'system',
    choices: [
      {
        // Double or nothing — stake the job on the season to come.
        id: 'stake-job', label: 'Stake your job on it — judge me in May', successProbability: 0.5,
        onSuccess: [{ kind: 'boardPatience', amount: 12, text: 'The board respected the conviction — for now.' }, { kind: 'memory', tag: 'board', text: `Stared the board down and staked the job on the run-in — a gambler's stand.` }],
        onFailure: [{ kind: 'boardPatience', amount: -16, text: 'A bold promise made, and nothing to back it — the board hardened.' }, { kind: 'memory', tag: 'board', text: `Promised the board a turnaround and the credibility drained further.` }],
      },
      {
        // Comply — square the books, gut the squad.
        id: 'comply', label: f.complyLabel, successProbability: 0.8,
        onSuccess: [{ kind: 'money', clubId: state.playerClub, amount: f.complyMoney }, { kind: 'boardPatience', amount: 8 }, { kind: 'morale', clubId: state.playerClub, amount: -5 }, { kind: 'memory', tag: 'board', text: `Bent to the board and balanced the books — the dressing room noticed who blinked.` }],
        onFailure: [{ kind: 'boardPatience', amount: 4 }, { kind: 'morale', clubId: state.playerClub, amount: -8 }],
      },
      {
        // Defy — back the project, spend the last of your credit.
        id: 'defy', label: 'Defy them — back your project and hold the line', successProbability: 0.4,
        onSuccess: [{ kind: 'boardPatience', amount: 5 }, { kind: 'memory', tag: 'board', text: `Faced down the ultimatum and held the line — a stand that will define the tenure.` }],
        onFailure: [{ kind: 'boardPatience', amount: -12 }, { kind: 'memory', tag: 'board', text: `Defied the board with nothing to show for it — the end feels closer.` }],
      },
    ],
    falloutIfIgnored: [{ kind: 'boardPatience', amount: -8 }, { kind: 'memory', tag: 'board', text: `Let the board's ultimatum go unanswered — silence they read as weakness.` }],
    memoryTags: ['board', 'ultimatum'],
  };
}

/**
 * Raise a board/ownership ultimatum when patience has genuinely run down. Gated on
 * divergence (a passive world raises none), throttled so only one is live at a
 * time, and all randomness is on the passed (forked) stream so the sim RNG is never
 * perturbed. The odds rise as patience falls and with a ruthless owner.
 */
export function rollBoardUltimatum(state: GameState, rng: Rng): void {
  if (state.board.dismissed) return;
  const f = divergenceFactor(state);
  if (f <= 0) return;
  // Only a board that has genuinely lost faith — low patience AND a track record of
  // warnings or near-misses. A comfortable board never delivers an ultimatum.
  if (state.board.patience >= 40) return;
  if (state.board.warnings < 1 && state.board.consecutiveMisses < 1) return;
  // Never stack two ultimatums.
  if (state.pendingDecisions.some((d) => d.id.startsWith('ultimatum:'))) return;
  // Rises as patience falls (0 → ~0.75 at empty) and with a ruthless owner, capped.
  const r = boardRuthlessness(state);
  const p = Math.min(0.85, ((40 - state.board.patience) / 40) * 0.6 * r);
  if (!rng.chance(p)) return;

  const flavour = flavourFor(state);
  state.pendingDecisions.push(buildUltimatum(state, flavour));
  logEvent(state, {
    category: 'system',
    code: 'board.ultimatum',
    message: `The board delivers an ultimatum: ${flavour.title}`,
    data: { code: flavour.code, patience: state.board.patience, clubId: state.playerClub },
  });
}
