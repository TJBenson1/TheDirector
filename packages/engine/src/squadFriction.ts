/**
 * Emergent squad-friction & lifecycle decisions (§ narrative-is-everything).
 *
 * The consequences of the squad the Director BUILDS — and the men in it as their
 * careers turn — come back to him as genuine forks in the road, not as tidy stat
 * lines:
 *   • adaptation — a marquee signing floundering in a new league;
 *   • misfit     — a talent the coach can't fit into his system;
 *   • overstock  — a good player frozen out by a glut you've stockpiled;
 *   • poach      — a giant circling an unsettled star of yours;
 *   • legend     — an ageing club great on his last contract;
 *   • wonderkid  — a high-ceiling kid demanding a pathway.
 * Each is a real dilemma with an unintended downside on every branch — stand by a
 * flop and the board sours; cash him in and he blooms elsewhere; overrule the coach
 * and the dressing room fractures; reject a giant's bid and a loyal man rewards you,
 * or sulks; hand a legend a farewell year and the fans sing, but a slot is spent.
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

type FrictionKind = 'adaptation' | 'misfit' | 'overstock' | 'poach' | 'legend' | 'wonderkid';
interface FrictionCase {
  player: PlayerState;
  kind: FrictionKind;
  severity: number;
}

function year(state: GameState): number {
  return Number(state.clock.date.slice(0, 4));
}

function age(state: GameState, p: PlayerState): number {
  return year(state) - p.birthYear;
}

/** The most pressing squad situations, worst first. Each player yields at most one
 *  case (the else-if chain fixes a priority), and a player already the subject of a
 *  live friction decision is skipped upstream (no stacking on one man). */
function detectFriction(state: GameState): FrictionCase[] {
  const coach = state.managerRelations;
  const squad = clubSquadPlayers(state, state.playerClub);
  const overstocked = new Set(overstackedStars(state, state.playerClub).map((p) => p.id));
  const y = year(state);
  const cases: FrictionCase[] = [];
  for (const p of squad) {
    if (p.injury) continue;
    const a = age(state, p);
    const expiring = p.contractUntil <= y + 1 && !p.letLapse;
    // A marquee signing badly failing to settle in a new league — a story of a
    // move that isn't working, the board and fans restless.
    if (p.adaptation && !p.adaptation.settled && (p.adaptation.outcome === 'failure' || p.adaptation.outcome === 'partial') && p.ability >= 78) {
      cases.push({ player: p, kind: 'adaptation', severity: 62 + (p.adaptation.outcome === 'failure' ? 20 : 0) + p.agitation * 0.2 });
    } else if (overstocked.has(p.id) && p.agitation >= 24) {
      // A good player buried in a glut the Director stockpiled, agitating for games.
      cases.push({ player: p, kind: 'overstock', severity: 50 + p.agitation * 0.4 });
    } else if (coachFit(coach, p).verdict === 'veto' && p.ability >= 76 && p.agitation >= 14) {
      // A talent the coach cannot fit into how he plays — great player, wrong system.
      cases.push({ player: p, kind: 'misfit', severity: 44 + p.agitation * 0.3 });
    } else if (p.ability >= 80 && p.agitation >= 24 && plausibleSuitor(state, p)) {
      // An unsettled star of yours with a giant circling — cash in, or make it a
      // loyalty test. (Distinct from the forced departures in rival.ts, which fire
      // at agitation ≥ 40; this fork does NOT itself move the player, so the two
      // never double-count.)
      cases.push({ player: p, kind: 'poach', severity: 56 + Math.min(12, (p.agitation - 30) * 0.5) });
    } else if (a >= 33 && p.personality.loyalty >= 7 && p.ability >= 80 && expiring) {
      // A one-club great in the twilight, his deal running down — the farewell.
      cases.push({ player: p, kind: 'legend', severity: 48 });
    } else if (a <= 21 && (p.wonderkid || p.potentialCeiling >= 85) && p.potentialCeiling - p.ability >= 6 && (p.benchedDevSeasons >= 1 || p.agitation >= 20)) {
      // A high-ceiling kid starved of minutes, getting restless — a pathway demand.
      cases.push({ player: p, kind: 'wonderkid', severity: 40 + p.agitation * 0.2 });
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

/** Where an ageing great goes for a final move — a lateral or step-DOWN switch to a
 *  club at or below his level (a veteran drops down for a last run of games), never a
 *  step up to a giant. The fee carries a commercial floor: clubs pay for a marquee
 *  name beyond his declined sporting value. Null if no realistic home exists. */
function plausibleFarewellDestination(state: GameState, player: PlayerState): { id: ClubId; fee: number } | null {
  const value = valuePlayer(player, year(state));
  const floor = 2_000_000; // a legend still shifts shirts — a nominal fee, never derisory
  const cands = Object.values(state.clubs)
    .filter((c) => c.id !== state.playerClub && !c.id.startsWith('promoted_'))
    .filter((c) => !areDirectRivals(state, c.id, state.playerClub))
    .filter((c) => c.strength <= player.ability && c.strength >= player.ability - 16)
    .filter((c) => c.finances.transferBudget >= floor * 0.5)
    .sort((a, b) => b.strength - a.strength);
  const buyer = cands[0];
  if (!buyer) return null;
  return { id: buyer.id, fee: Math.round(Math.min(buyer.finances.transferBudget, Math.max(value, floor))) };
}

/** A genuine step up — the giant that comes calling for an unsettled star. Unlike
 *  a plausible buyer this CAN be a direct rival (rivals poach), and it must be a
 *  bigger stage (strength above the player), able to pay a premium. */
function plausibleSuitor(state: GameState, player: PlayerState): { id: ClubId; fee: number } | null {
  const value = valuePlayer(player, year(state));
  const cands = Object.values(state.clubs)
    .filter((c) => c.id !== state.playerClub && !c.id.startsWith('promoted_'))
    // A genuine giant: at least the player's equal (for a star at a superclub, a
    // domestic "step up" may not exist, but an equal rival or a foreign power still
    // comes calling), and able to pay a premium.
    .filter((c) => c.strength >= player.ability - 2)
    .filter((c) => c.finances.transferBudget >= value * 0.9)
    .sort((a, b) => b.strength - a.strength);
  const suitor = cands[0];
  if (!suitor) return null;
  // A giant pays over the odds for an unsettled man he thinks he can unlock.
  return { id: suitor.id, fee: Math.round(Math.min(suitor.finances.transferBudget, value * 1.25)) };
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

  if (c.kind === 'poach') {
    const suitor = plausibleSuitor(state, p)!;
    const suitorClub = state.clubs[suitor.id];
    const loyal = p.personality.loyalty >= 7;
    return {
      ...base,
      title: `${suitorClub?.name} come calling for ${p.name}`,
      description: `${suitorClub?.name} have made their move for ${p.name}, and he's unsettled enough to have his head turned — a bigger stage, and his agent is talking. Cash in on a man who has one foot out the door, make it a loyalty test and dare him to stay, or hold out for a fee that truly hurts them?`,
      choices: [
        {
          id: 'cash-in', label: `Cash in — sell to ${suitorClub?.name} (${m(suitor.fee)})`,
          onSuccess: [{ kind: 'transferOut' as const, playerId: p.id, clubId: suitor.id, amount: suitor.fee }, { kind: 'memory' as const, tag: 'squad-friction', text: `Sold ${p.name} to ${suitorClub?.name} at the top of the market — took the money and moved on.` }],
        },
        {
          id: 'reject', label: 'Reject it out of hand — he stays, no debate', successProbability: loyal ? 0.7 : 0.45,
          onSuccess: [{ kind: 'morale', playerId: p.id, amount: 10 }, { kind: 'agitation', playerId: p.id, amount: -18 }, { kind: 'memory', tag: 'squad-friction', text: `Turned ${suitorClub?.name} away and told ${p.name} he's going nowhere — and he took it as a compliment.` }],
          onFailure: [{ kind: 'agitation', playerId: p.id, amount: 14, text: 'furious the move was blocked' }, { kind: 'memory', tag: 'squad-friction', text: `Blocked the move for ${p.name}, but he wanted it — the resentment will linger.` }],
        },
        {
          id: 'hold-out', label: `Hold out for a fee that hurts them (${m(Math.round(suitor.fee * 1.4))})`, successProbability: 0.4,
          onSuccess: [{ kind: 'transferOut' as const, playerId: p.id, clubId: suitor.id, amount: Math.round(suitor.fee * 1.4) }, { kind: 'boardPatience', amount: 4 }, { kind: 'memory', tag: 'squad-friction', text: `Squeezed ${suitorClub?.name} for every penny on ${p.name} — a masterclass in the market.` }],
          onFailure: [{ kind: 'agitation', playerId: p.id, amount: 12, text: 'the move he wanted collapsed over money' }, { kind: 'memory', tag: 'squad-friction', text: `Priced ${suitorClub?.name} out over ${p.name} — the deal died, and he's stewing.` }],
        },
      ],
      // Neutral on ignore — the fork is a choice, not a forced departure. If he is
      // genuinely unhappy enough, rival.ts handles the exit separately; here we only
      // let the drift harden, so the two mechanisms never double-count.
      falloutIfIgnored: [{ kind: 'agitation', playerId: p.id, amount: 8 }, { kind: 'memory', tag: 'squad-friction', text: `Let the ${p.name}–${suitorClub?.name} saga drift — nothing resolved, his head still turned.` }],
    };
  }

  if (c.kind === 'legend') {
    const farewell = plausibleFarewellDestination(state, p);
    const farewellClub = farewell ? state.clubs[farewell.id] : undefined;
    // A farewell year must add a season BEYOND his current deal — one guaranteed last
    // run in these colours — not silently no-op when a year already remains.
    const farewellYears = Math.max(1, p.contractUntil - year(state) + 1);
    return {
      ...base,
      title: `${p.name}'s last act — a decision on a club great`,
      description: `${p.name} has given the club everything, and his deal is running down. The legs aren't what they were, but the name still means something to every soul in the stands. Hand him a farewell year, let him bow out with a testimonial, or take one last fee while there's still one on the table?`,
      choices: [
        {
          id: 'farewell', label: 'Offer a farewell year — he retires in these colours',
          onSuccess: [{ kind: 'renewContract' as const, playerId: p.id, amount: farewellYears }, { kind: 'morale', clubId: state.playerClub, amount: 5 }, { kind: 'boardPatience', amount: 3 }, { kind: 'memory' as const, tag: 'squad-friction', text: `Gave ${p.name} a farewell year — the fans will sing his name to the end.` }],
        },
        {
          id: 'dignified-exit', label: 'Let him go with a testimonial — a dignified goodbye',
          onSuccess: [{ kind: 'letContractLapse' as const, playerId: p.id }, { kind: 'morale', clubId: state.playerClub, amount: 4 }, { kind: 'memory' as const, tag: 'squad-friction', text: `Sent ${p.name} off with a testimonial and the club's gratitude — a legend leaves on his own terms.` }],
        },
        ...(farewell ? [{
          id: 'one-last-fee', label: `Take one last fee — a final move to ${farewellClub?.name} (${m(farewell.fee)})`, successProbability: 0.55,
          onSuccess: [{ kind: 'transferOut' as const, playerId: p.id, clubId: farewell.id, amount: farewell.fee }, { kind: 'memory' as const, tag: 'squad-friction', text: `Let ${p.name} go to ${farewellClub?.name} for a final payday — the pragmatist's call, and not one every fan forgave.` }],
          onFailure: [{ kind: 'morale' as const, clubId: state.playerClub, amount: -6, text: `Selling a club great didn't sit right in the dressing room.` }],
        }] : []),
      ],
      falloutIfIgnored: [{ kind: 'letContractLapse', playerId: p.id }, { kind: 'morale', clubId: state.playerClub, amount: -4 }, { kind: 'memory', tag: 'squad-friction', text: `Let ${p.name}'s deal lapse without a word — a club great slipped away unmarked.` }],
    };
  }

  if (c.kind === 'overstock') {
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

  // wonderkid
  const suitor = plausibleSuitor(state, p);
  const suitorClub = suitor ? state.clubs[suitor.id] : undefined;
  const saleFee = suitor ? suitor.fee : buyer ? buyer.fee : Math.round(valuePlayer(p, year(state)) * 1.2);
  const saleId = suitor ? suitor.id : buyer?.id;
  return {
    ...base,
    title: `${p.name} wants a pathway — the wonderkid is getting restless`,
    description: `${p.name} is one of the brightest young talents in the game, and he isn't getting the minutes he believes he's earned. His camp want a plan. Promise him a route into the side, loan him out to play and grow, or sell on the hype now while the number is enormous?`,
    choices: [
      {
        id: 'promise-pathway', label: 'Promise him a pathway — guaranteed football', successProbability: 0.55,
        onSuccess: [{ kind: 'morale', playerId: p.id, amount: 12 }, { kind: 'agitation', playerId: p.id, amount: -20 }, { kind: 'memory', tag: 'squad-friction', text: `Promised ${p.name} a way into the side — a bet on the kid over the here-and-now.` }],
        onFailure: [{ kind: 'managerRelationship', amount: -10, text: `The coach didn't want a kid forced into his plans.` }, { kind: 'agitation', playerId: p.id, amount: 6 }],
      },
      {
        id: 'loan-out', label: 'Loan him out to play and develop',
        onSuccess: [{ kind: 'agitation', playerId: p.id, amount: -14 }, { kind: 'memory', tag: 'squad-friction', text: `Loaned ${p.name} out to get real football into him — the patient path.` }],
      },
      ...(saleId ? [{
        id: 'sell-hype', label: `Sell on the hype now — ${suitorClub?.name ?? buyerClub?.name} (${m(saleFee)})`, successProbability: 0.5,
        onSuccess: [{ kind: 'transferOut' as const, playerId: p.id, clubId: saleId, amount: saleFee }, { kind: 'memory' as const, tag: 'squad-friction', text: `Sold ${p.name} at the peak of the hype — a fortune banked, and a gamble that he never quite delivers it elsewhere.` }],
        onFailure: [{ kind: 'memory' as const, tag: 'squad-friction', text: `Cashed in on ${p.name} — the fans will judge this one for years.` }, { kind: 'boardPatience' as const, amount: -3 }],
      }] : []),
    ],
    falloutIfIgnored: [{ kind: 'agitation', playerId: p.id, amount: 16 }, { kind: 'memory', tag: 'squad-friction', text: `Ignored ${p.name}'s demand for a pathway — a special talent left to stagnate on the bench.` }],
  };
}

/**
 * Raise at most one emergent squad dilemma this window — friction (adaptation /
 * misfit / overstock), a poaching giant, or a career-lifecycle fork (legend /
 * wonderkid). Gated on divergence (a passive world raises none), throttled so only
 * one is live at a time, and all randomness is on the passed (forked) stream so the
 * sim RNG is never perturbed.
 */
export function rollSquadFrictionEvents(state: GameState, rng: Rng): void {
  const f = divergenceFactor(state);
  if (f <= 0) return;
  // Never stack two of these dilemmas at once.
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
