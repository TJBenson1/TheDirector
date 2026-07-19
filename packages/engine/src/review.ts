/**
 * Pre-window REVIEW phase (§3 window phase 1).
 *
 * Before the summer market opens, the club takes stock: contracts running down,
 * players nearing retirement, stars in decline, the long-term injured. The most
 * pressing — a key player about to leave on a free — is surfaced as an actionable
 * decision (renew him, or let his deal run down). Reality-default is to keep your
 * own: ignore it and the club offers the new deal, so you never lose a mainstay
 * to inattention. Only the USER's club is reviewed; the AI keeps its own house.
 */

import type { GameState } from './types.js';
import { logEvent } from './eventLog.js';
import { parseYearMonth } from './clock.js';
import { clubSquadPlayers } from './players.js';
import { retireAgeFor } from './ageing.js';
import { isProcedural } from './ledger.js';
import { formationEraModifier, eraIdealFormation, formationLabel } from './tactics.js';

/** A player worth a conscious renewal call — a genuine squad contributor. */
const RENEW_ABILITY_FLOOR = 76;
/** Cap on renewal decisions per window: you consciously tie down your key men;
 *  the rest of the expiring squad is the briefing's business, not a click each. */
const MAX_RENEWAL_OFFERS = 4;

/** Players whose expiring-contract story is told by a bespoke scripted event, so
 *  the generic renewal decision must not also raise one for them. */
const SCRIPTED_CONTRACT_STORIES = new Set(['cur_keane']);
/** Long-term injury threshold for the briefing (months still to run). */
const LONG_TERM_INJURY_MONTHS = 4;

export function runReviewPhase(state: GameState): void {
  const club = state.clubs[state.playerClub];
  if (!club) return;
  const year = parseYearMonth(state.clock.date).year;
  // Only REAL players are reviewed — the manager tracks recognisable names, not
  // the procedural filler that pads a squad (whose generated names read oddly and
  // whose expiry is inconsequential: contracts drive a Bosman discount, not a
  // departure).
  const squad = clubSquadPlayers(state, state.playerClub).filter((p) => !isProcedural(p));
  const ageOf = (p: (typeof squad)[number]) => year - p.birthYear;

  // Categorise the looming issues.
  const expiring = squad
    .filter((p) => p.contractUntil <= year + 1)
    .sort((a, b) => b.ability - a.ability);
  const retiring = squad.filter(
    (p) => ageOf(p) >= retireAgeFor(p.positions, p.personality.professionalism) - 1,
  );
  const injured = squad.filter((p) => p.injury && p.injury.monthsRemaining >= LONG_TERM_INJURY_MONTHS);
  const declining = squad.filter((p) => ageOf(p) >= 32 && p.ability <= p.potentialCeiling - 3);

  // FINAL WARNING (§3 window phase 1): every deal running down this summer, named,
  // so the Director sees the full list before the window opens. Anyone he does not
  // renew — via the renewal decisions below, or by telling the club to let a deal
  // lapse — leaves on a free when the window's second phase comes round. Doing
  // nothing keeps them all (reality-default): the club offers fresh terms.
  const runningDownNow = expiring.filter((p) => p.contractUntil <= year);
  if (expiring.length) {
    logEvent(state, {
      category: 'transfer',
      code: 'window.contracts.warning',
      message: `Final contract warning — ${club.name}: ${expiring.map((p) => `${p.name} (to ${p.contractUntil})`).join(', ')}. Renew whom you want to keep; anyone left to lapse walks for free when the window opens.`,
      data: { expiring: expiring.map((p) => p.id), lapsingNow: runningDownNow.map((p) => p.id) },
    });
  }

  // The briefing (informational): what the manager should be aware of going in.
  if (expiring.length || retiring.length || injured.length || declining.length) {
    const bits: string[] = [];
    if (expiring.length) bits.push(`${expiring.length} contract(s) running down`);
    if (retiring.length) bits.push(`${retiring.length} nearing retirement (${retiring.map((p) => p.name).join(', ')})`);
    if (injured.length) bits.push(`${injured.length} long-term injured`);
    if (declining.length) bits.push(`${declining.length} past their peak`);
    logEvent(state, {
      category: 'transfer',
      code: 'window.review',
      message: `Pre-window review — ${club.name}: ${bits.join('; ')}.`,
      data: {
        expiring: expiring.map((p) => p.id),
        retiring: retiring.map((p) => p.id),
        injured: injured.map((p) => p.id),
        declining: declining.map((p) => p.id),
      },
    });
  }

  // Actionable: the tactical era. If the coach's active shape is being left
  // behind — a flat two overrun by the modern three-man midfields — the Director
  // can suggest moving to the era-appropriate shape. The coach isn't a pushover:
  // whether he agrees turns on his adaptability and how he rates the Director.
  const coach = state.managerRelations;
  const ideal = eraIdealFormation(year);
  const currentDelta = formationEraModifier(coach.activeFormation, year);
  const idealDelta = formationEraModifier(ideal, year);
  if (coach.activeFormation !== ideal && idealDelta - currentDelta >= 2) {
    const decisionId = `formation:${year}`;
    if (!state.pendingDecisions.some((d) => d.id === decisionId)) {
      // Acceptance probability: an adaptable coach who trusts the Director bends;
      // a dogmatic one on a shaky relationship digs in on his shape.
      const accept = Math.max(
        0.1,
        Math.min(0.9, 0.2 + coach.adaptability * 0.05 + (coach.relationshipWithUser - 60) * 0.004),
      );
      state.pendingDecisions.push({
        id: decisionId,
        title: `${formationLabel(coach.activeFormation)} is being left behind — the modern game is a three-man midfield`,
        description: `${coach.identity} still sets up in a ${formationLabel(coach.activeFormation)}. You can push him toward a ${formationLabel(ideal)} to match the era, or back his judgement and leave the shape to him.`,
        interrupt: false,
        clubId: state.playerClub,
        category: 'decision',
        choices: [
          {
            id: 'suggest-switch',
            label: `Suggest switching to a ${formationLabel(ideal)}`,
            successProbability: accept,
            onSuccess: [
              { kind: 'changeFormation', formation: ideal },
              { kind: 'memory', tag: 'tactics', text: `${coach.identity} agreed to switch to a ${formationLabel(ideal)}.` },
            ],
            onFailure: [
              { kind: 'managerRelationship', amount: -4 },
              { kind: 'memory', tag: 'tactics', text: `${coach.identity} rebuffed the Director's push to change shape.` },
            ],
          },
          {
            id: 'trust-coach',
            label: 'Back his judgement — leave the shape to him',
            onSuccess: [
              { kind: 'managerRelationship', amount: 2 },
              { kind: 'memory', tag: 'tactics', text: `Left the formation to ${coach.identity}.` },
            ],
          },
        ],
        // Reality-default: the Director doesn't interfere — the coach keeps his shape.
        memoryTags: ['tactics'],
      });
    }
  }

  // Actionable: a coach request. If one of the coach's favourites from a former
  // club is out there in the world (and not already ours), he lobbies the Director
  // to sign him. Backing the request warms the relationship; overruling it erodes
  // it. Reality-default (ignore) lets the request lapse — no world change, so a
  // passive run is untouched.
  const wanted = coach.favourites
    .map((name) => Object.values(state.players).find((p) => p.name === name && !p.retired && p.club !== state.playerClub))
    .find((p): p is NonNullable<typeof p> => !!p);
  if (wanted) {
    const decisionId = `coach-request:${wanted.id}`;
    if (!state.pendingDecisions.some((d) => d.id === decisionId)) {
      state.pendingDecisions.push({
        id: decisionId,
        title: `${coach.identity} wants you to sign ${wanted.name}`,
        description: `${coach.identity} knows ${wanted.name} from a former club and is pushing the Director to bring him in. Back the request and pursue him, or tell the coach no.`,
        interrupt: false,
        clubId: state.playerClub,
        category: 'transfer',
        choices: [
          {
            id: 'back',
            label: `Back the coach — pursue ${wanted.name}`,
            onSuccess: [
              { kind: 'managerRelationship', amount: 4 },
              { kind: 'memory', tag: 'coach', text: `Backed ${coach.identity}'s push for ${wanted.name}.` },
            ],
          },
          {
            id: 'overrule',
            label: 'Overrule him — not this window',
            onSuccess: [
              { kind: 'managerRelationship', amount: -4 },
              { kind: 'memory', tag: 'coach', text: `Overruled ${coach.identity} on ${wanted.name}.` },
            ],
          },
        ],
        memoryTags: ['coach'],
      });
    }
  }

  // Actionable: offer a renewal for the top key players in their final year,
  // before they can walk on a free. Reality-default (ignore) is to secure them.
  // Players whose contract story is a scripted set-piece (e.g. Keane's 1999
  // landmark-deal saga) are handled by that event alone — skip the generic offer
  // so the two don't collide.
  const renewTargets = expiring
    .filter((p) => p.ability >= RENEW_ABILITY_FLOOR && !SCRIPTED_CONTRACT_STORIES.has(p.id))
    .slice(0, MAX_RENEWAL_OFFERS);
  for (const p of renewTargets) {
    const decisionId = `renew:${p.id}`;
    if (state.pendingDecisions.some((d) => d.id === decisionId)) continue;
    const bosman = p.contractUntil <= year; // in his last year → free next summer
    state.pendingDecisions.push({
      id: decisionId,
      title: `${p.name}'s contract expires in ${p.contractUntil}${bosman ? ' — he can leave for free' : ''}`,
      description: `${p.name} (${ageOf(p)}) is entering the last stretch of his deal. Offer him fresh terms to keep him, or let it run down and free the wages.`,
      interrupt: false,
      clubId: state.playerClub,
      category: 'transfer',
      choices: [
        { id: 'renew', label: 'Offer a new 3-year deal', onSuccess: [{ kind: 'renewContract', playerId: p.id, amount: 3 }, { kind: 'morale', playerId: p.id, amount: 3 }] },
        { id: 'let-run', label: 'Let it run down — he leaves on a free', onSuccess: [{ kind: 'letContractLapse', playerId: p.id }, { kind: 'memory', tag: 'contract', text: `Chose to let ${p.name}'s deal lapse — he leaves on a free.` }, { kind: 'morale', playerId: p.id, amount: -3 }] },
      ],
      // Reality-default: a mainstay is never lost to inattention — the club renews.
      falloutIfIgnored: [{ kind: 'renewContract', playerId: p.id, amount: 3 }],
      memoryTags: ['contract', p.id],
    });
  }
}
