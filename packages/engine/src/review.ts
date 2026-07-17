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

  // Actionable: offer a renewal for the top key players in their final year,
  // before they can walk on a free. Reality-default (ignore) is to secure them.
  const renewTargets = expiring.filter((p) => p.ability >= RENEW_ABILITY_FLOOR).slice(0, MAX_RENEWAL_OFFERS);
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
        { id: 'let-run', label: 'Let it run down', onSuccess: [{ kind: 'memory', tag: 'contract', text: `Let ${p.name}'s deal run down.` }, { kind: 'morale', playerId: p.id, amount: -3 }] },
      ],
      // Reality-default: a mainstay is never lost to inattention — the club renews.
      falloutIfIgnored: [{ kind: 'renewContract', playerId: p.id, amount: 3 }],
      memoryTags: ['contract', p.id],
    });
  }
}
