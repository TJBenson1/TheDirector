/**
 * Emergent squad-friction decisions (§ narrative-is-everything).
 *
 * The consequences of the squad the Director BUILDS come back to him as genuine
 * forks in the road, not as tidy stat lines: a marquee signing floundering in a
 * new league, a talent the coach can't fit into his system, a good player frozen
 * out by a glut you've stockpiled. Each is a real dilemma with an unintended
 * downside on every branch — stand by a flop and the board sours; cash him in and
 * he blooms elsewhere; overrule the coach and the dressing room fractures.
 *
 * Gated on DIVERGENCE: a passive, reality-default world raises none of these — the
 * friction is the price of reshaping, and the calibration run (which never
 * reshapes) never sees them. All randomness draws from a forked stream, so the sim
 * RNG is untouched whether or not a dilemma fires.
 */

import type { ClubId, Decision, GameState, PlayerState } from './types.js';
import type { Rng } from './rng.js';
import { clubSquadPlayers, overstackedStars } from './players.js';
import { coachFit } from './coaches.js';
import { valuePlayer } from './finance.js';
import { areDirectRivals } from './agency.js';
import { divergenceFactor } from './divergence.js';
import { logEvent } from './eventLog.js';

type FrictionKind = 'adaptation' | 'misfit' | 'overstock';
interface FrictionCase {
  player: PlayerState;
  kind: FrictionKind;
  severity: number;
}

function year(state: GameState): number {
  return Number(state.clock.date.slice(0, 4));
}

/** The most pressing squad-friction situations, worst first. A player already the
 *  subject of a live friction decision is skipped (no stacking on one man). */
function detectFriction(state: GameState): FrictionCase[] {
  const coach = state.managerRelations;
  const squad = clubSquadPlayers(state, state.playerClub);
  const overstocked = new Set(overstackedStars(state, state.playerClub).map((p) => p.id));
  const cases: FrictionCase[] = [];
  for (const p of squad) {
    if (p.injury) continue;
    // A marquee signing badly failing to settle in a new league — a story of a
    // move that isn't working, the board and fans restless.
    if (p.adaptation && !p.adaptation.settled && (p.adaptation.outcome === 'failure' || p.adaptation.outcome === 'partial') && p.ability >= 78) {
      cases.push({ player: p, kind: 'adaptation', severity: 62 + (p.adaptation.outcome === 'failure' ? 20 : 0) + p.agitation * 0.2 });
    } else if (overstocked.has(p.id) && p.agitation >= 24) {
      // A good player buried in a glut the Director stockpiled, agitating for games.
      cases.push({ player: p, kind: 'overstock', severity: 50 + p.agitation * 0.4 });
    } else if (coachFit(coach, p).verdict === 'veto' && p.ability >= 76 && p.agitation >= 18) {
      // A talent the coach cannot fit into how he plays — great player, wrong system.
      cases.push({ player: p, kind: 'misfit', severity: 44 + p.agitation * 0.3 });
    }
  }
  return cases.sort((a, b) => b.severity - a.severity);
}

/** The strongest realistic buyer at roughly the player's level who can afford him
 *  and isn't a direct rival — the club that will take him off your hands. */
function plausibleBuyer(state: GameState, player: PlayerState): { id: ClubId; fee: number } | null {
  const value = valuePlayer(player, year(state));
  const cands = Object.values(state.clubs)
    .filter((c) => c.id !== state.playerClub && !c.id.startsWith('promoted_'))
    .filter((c) => !areDirectRivals(state, c.id, state.playerClub))
    .filter((c) => c.strength >= player.ability - 12 && c.strength <= player.ability + 6)
    .filter((c) => c.finances.transferBudget >= value * 0.6)
    .sort((a, b) => b.strength - a.strength);
  const buyer = cands[0];
  if (!buyer) return null;
  return { id: buyer.id, fee: Math.round(Math.min(buyer.finances.transferBudget, value)) };
}

const m = (n: number): string => `£${(n / 1_000_000).toFixed(1)}m`;

/** Build the fork-in-the-road decision for one friction case. */
function buildFrictionDecision(state: GameState, c: FrictionCase): Decision {
  const p = c.player;
  const coach = state.managerRelations;
  const buyer = plausibleBuyer(state, p);
  const buyerClub = buyer ? state.clubs[buyer.id] : undefined;
  const id = `friction:${c.kind}:${p.id}:${state.clock.date}`;
  const base = { id, interrupt: true, clubId: state.playerClub, category: 'transfer' as const, memoryTags: ['squad-friction', p.id] };

  if (c.kind === 'adaptation') {
    return {
      ...base,
      title: `${p.name} is floundering — the big signing isn't working out`,
      description: `${p.name} was meant to be a statement, but he's struggling badly to adjust to a new league and the doubts are growing — in the stands, in the boardroom, in his own head. Hold your nerve, or admit the move has failed?`,
      choices: [
        {
          id: 'stand-by', label: 'Stand by him — give him time to come good', successProbability: 0.55,
          onSuccess: [{ kind: 'morale', playerId: p.id, amount: 12 }, { kind: 'memory', tag: 'squad-friction', text: `Backed ${p.name} through his struggles — a show of faith.` }],
          onFailure: [{ kind: 'boardPatience', amount: -5, text: `The board wanted ${p.name} moved on, not indulged.` }],
        },
        ...(buyer ? [{
          id: 'cut-losses', label: `Cut your losses — sell to ${buyerClub?.name} (${m(buyer.fee)})`,
          onSuccess: [{ kind: 'transferOut' as const, playerId: p.id, clubId: buyer.id, amount: buyer.fee }, { kind: 'memory' as const, tag: 'squad-friction', text: `Cut your losses on ${p.name} — sold to ${buyerClub?.name}. Time will tell if he blooms away from here.` }],
        }] : []),
        {
          id: 'drop', label: 'Drop him to regroup out of the spotlight', successProbability: 0.5,
          onSuccess: [{ kind: 'memory', tag: 'squad-friction', text: `Took ${p.name} out of the firing line to rebuild his confidence.` }],
          onFailure: [{ kind: 'agitation', playerId: p.id, amount: 12, text: 'humiliated at being dropped' }],
        },
      ],
      falloutIfIgnored: [{ kind: 'boardPatience', amount: -3 }, { kind: 'morale', playerId: p.id, amount: -6 }, { kind: 'memory', tag: 'squad-friction', text: `Left ${p.name}'s struggles to drift — the unease festered.` }],
    };
  }

  if (c.kind === 'misfit') {
    return {
      ...base,
      title: `${p.name} doesn't fit — ${coach.identity} wants him gone`,
      description: `${p.name} has the talent, but ${coach.identity} simply can't make him work in his system — a square peg who blunts the shape every time he plays. Back your coach and move a good player on, or overrule him and bend the team to fit the player?`,
      choices: [
        ...(buyer ? [{
          id: 'back-coach', label: `Back the coach — sell to ${buyerClub?.name} (${m(buyer.fee)})`,
          onSuccess: [{ kind: 'transferOut' as const, playerId: p.id, clubId: buyer.id, amount: buyer.fee }, { kind: 'managerRelationship' as const, amount: 8, text: `Backed ${coach.identity} and sold the man who didn't fit.` }, { kind: 'memory' as const, tag: 'squad-friction', text: `Sold ${p.name} to ${buyerClub?.name} on the coach's say-so — a good player, but not for this system.` }],
        }] : []),
        {
          id: 'overrule', label: `Overrule ${coach.identity} — build the side around him`, successProbability: 0.5,
          onSuccess: [{ kind: 'morale', playerId: p.id, amount: 12 }, { kind: 'managerRelationship', amount: -14, text: `Overruled ${coach.identity} to keep ${p.name} — the coach is furious.` }, { kind: 'memory', tag: 'squad-friction', text: `Kept ${p.name} against the coach's wishes and asked the team to accommodate him.` }],
          onFailure: [{ kind: 'managerRelationship', amount: -16 }, { kind: 'agitation', playerId: p.id, amount: 8 }],
        },
        {
          id: 'persevere', label: 'Tell them to make it work — no changes', successProbability: 0.45,
          onSuccess: [{ kind: 'memory', tag: 'squad-friction', text: `Told coach and player to sort it out between them.` }],
          onFailure: [{ kind: 'managerRelationship', amount: -8 }, { kind: 'agitation', playerId: p.id, amount: 10 }],
        },
      ],
      falloutIfIgnored: [{ kind: 'managerRelationship', amount: -6 }, { kind: 'agitation', playerId: p.id, amount: 8 }, { kind: 'memory', tag: 'squad-friction', text: `Ignored the ${p.name} question — coach and player both stewing.` }],
    };
  }

  // overstock
  return {
    ...base,
    title: `${p.name} wants out — frozen out by the glut you've built`,
    description: `${p.name} is too good to be sitting where he is, and he knows it — stockpiled in a position you've overloaded, he's run out of patience and wants regular football. Cash in, placate him, or hold firm and let him stew?`,
    choices: [
      ...(buyer ? [{
        id: 'cash-in', label: `Cash in — sell to ${buyerClub?.name} (${m(buyer.fee)})`,
        onSuccess: [{ kind: 'transferOut' as const, playerId: p.id, clubId: buyer.id, amount: buyer.fee }, { kind: 'memory' as const, tag: 'squad-friction', text: `Sold ${p.name} to ${buyerClub?.name} to ease the glut — he wanted to play, and now he will.` }],
      }] : []),
      {
        id: 'reassure', label: 'Promise him he\'s part of the plans', successProbability: 0.5,
        onSuccess: [{ kind: 'morale', playerId: p.id, amount: 10 }, { kind: 'agitation', playerId: p.id, amount: -20 }, { kind: 'memory', tag: 'squad-friction', text: `Reassured ${p.name} — bought yourself time, but the logjam is still there.` }],
        onFailure: [{ kind: 'agitation', playerId: p.id, amount: 10, text: 'unconvinced by the promises' }],
      },
      {
        id: 'hold-firm', label: 'Hold firm — he can fight for his place', successProbability: 0.4,
        onSuccess: [{ kind: 'boardPatience', amount: 2 }],
        onFailure: [{ kind: 'agitation', playerId: p.id, amount: 16 }, { kind: 'morale', playerId: p.id, amount: -8, text: 'told to fight for a place that isn\'t there' }],
      },
    ],
    falloutIfIgnored: [{ kind: 'agitation', playerId: p.id, amount: 14 }, { kind: 'memory', tag: 'squad-friction', text: `Left ${p.name} to rot in the reserves — the resentment hardened.` }],
  };
}

/**
 * Raise at most one squad-friction dilemma this window. Gated on divergence (a
 * passive world raises none), throttled so only one is live at a time, and all
 * randomness is on the passed (forked) stream so the sim RNG is never perturbed.
 */
export function rollSquadFrictionEvents(state: GameState, rng: Rng): void {
  const f = divergenceFactor(state);
  if (f <= 0) return;
  // Never stack two friction dilemmas at once.
  if (state.pendingDecisions.some((d) => d.id.startsWith('friction:'))) return;
  // Rises with how far the Director has reshaped the world; capped so it stays an
  // occasional beat, not a constant nag.
  if (!rng.chance(Math.min(0.6, 0.4 + 0.4 * f))) return;
  const cases = detectFriction(state);
  if (cases.length === 0) return;
  const c = cases[0]!;
  const decision = buildFrictionDecision(state, c);
  state.pendingDecisions.push(decision);
  logEvent(state, {
    category: 'event',
    code: 'friction.raised',
    message: `A squad dilemma reaches your desk: ${decision.title}`,
    data: { kind: c.kind, playerId: c.player.id, clubId: state.playerClub },
  });
}
