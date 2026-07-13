/**
 * Injury management (user-only decision layer).
 *
 * Real football sometimes ruins a great player by mishandling his body — the
 * canonical case is Ronaldo, rushed back from a partial knee tear at Inter in
 * 2000 and rupturing it completely on his comeback. This layer gives the user
 * the calls reality got wrong:
 *
 *  - RETURN FROM INJURY: as a serious injury nears its end, rush him back (a
 *    gamble — he might break down again, worse) or manage the return carefully
 *    (he takes his time, and the careful rehab lowers his long-run fragility).
 *  - LOAD MANAGEMENT: a fragile star can be wrapped in cotton wool through a
 *    congested run — fewer minutes, but his injury-proneness eases over time.
 *
 * Managed well over a career, a glass-bodied talent becomes durable (a less
 * injury-prone Ronaldo). Only the USER's club gets these interrupts; AI clubs
 * are handled by the base injury model.
 */

import type { Decision, GameState } from './types.js';
import { Rng } from './rng.js';
import { isRunInMonth } from './clock.js';
import { clubSquadPlayers } from './players.js';

/** A serious injury this close to return triggers the comeback decision. */
const RETURN_WINDOW_MONTHS = 2;
/**
 * These calls only surface for a genuinely FRAGILE STAR worth managing — a
 * glass-bodied talent (high proneness) who is also a key man (high ability), the
 * Ronaldo case. A robust player's one-off knock needs no special handling, and
 * gating this way keeps the interrupt off normal squads entirely (so the base
 * injury calibration is untouched). */
const FRAGILE_PRONENESS = 60;
const FRAGILE_ABILITY = 80;

function hasPendingFor(state: GameState, playerId: string, prefix: string): boolean {
  return state.pendingDecisions.some((d) => d.id === `${prefix}:${playerId}`);
}

/**
 * Raise injury-management interrupts for the user's club this month. Returns
 * without effect for everyone else — the base model handles AI squads.
 */
export function rollInjuryManagement(state: GameState, rng: Rng): void {
  const club = state.clubs[state.playerClub];
  if (!club) return;
  const r = rng.fork(`injman:${state.clock.date}`);

  for (const p of clubSquadPlayers(state, state.playerClub)) {
    // ── Return-from-injury: a serious injury nearing its end ──────────────────
    if (
      p.injury &&
      p.injury.kind === 'serious' &&
      p.injury.monthsRemaining <= RETURN_WINDOW_MONTHS &&
      p.injury.monthsRemaining >= 1 &&
      p.injuryProneness >= FRAGILE_PRONENESS &&
      p.ability >= FRAGILE_ABILITY &&
      !hasPendingFor(state, p.id, 'return')
    ) {
      const left = p.injury.monthsRemaining;
      const decision: Decision = {
        id: `return:${p.id}`,
        title: `${p.name} is close to a return — how do you manage it?`,
        description: `${p.name} is ~${left} month(s) from full fitness after a serious injury. Rush him back now and you gain him early — but a body that isn't ready can break down worse. Manage the return and he takes his time, but you protect him for the long run.`,
        interrupt: true,
        clubId: state.playerClub,
        category: 'injury',
        choices: [
          {
            id: 'rush',
            label: `Rush ${p.name} back now (gamble)`,
            // Rushing usually works — but when it fails, it fails badly.
            successProbability: 0.55,
            onSuccess: [
              { kind: 'injuryHeal', playerId: p.id, amount: 55 },
              { kind: 'memory', tag: 'injury', text: `Rushed ${p.name} back — it paid off.` },
            ],
            onFailure: [
              { kind: 'reinjure', playerId: p.id, months: r.int(6, 9) },
            ],
          },
          {
            id: 'manage',
            label: `Manage his return carefully (protect him)`,
            // Deterministic: he returns on schedule and the careful rehab lowers
            // his long-run fragility a notch.
            onSuccess: [
              { kind: 'injuryProneness', playerId: p.id, amount: -8 },
              { kind: 'memory', tag: 'injury', text: `Handled ${p.name}'s comeback patiently.` },
            ],
          },
        ],
        // Doing nothing is NEUTRAL: the injury simply heals on schedule (the base
        // model), no bonus and no penalty — so a hands-off user (and the harness)
        // is unaffected. Only ACTIVELY managing him changes his long-run body.
        falloutIfIgnored: [],
        memoryTags: ['injury-management', p.id],
      };
      state.pendingDecisions.push(decision);
      continue; // don't also raise a load-management call for the same player
    }

    // ── Load management: a fit, fragile star through a congested run ───────────
    // Rare and only in the congested midwinter run, so it reads as an occasional
    // strategic call, not a monthly nag. Non-interrupt (it doesn't pause the sim).
    if (
      !p.injury &&
      p.injuryProneness >= FRAGILE_PRONENESS &&
      p.ability >= FRAGILE_ABILITY &&
      p.injuryHistory >= 1 &&
      isRunInMonth(state.clock.monthIndex) &&
      !hasPendingFor(state, p.id, 'load') &&
      r.chance(0.05)
    ) {
      const decision: Decision = {
        id: `load:${p.id}`,
        title: `Manage ${p.name}'s workload?`,
        description: `${p.name} is a proven injury risk. Wrap him in cotton wool through the busy period — rotate and rest him — and you ease the strain on his body over time, at the cost of some minutes now. Or ride him hard while he's fit.`,
        interrupt: false,
        clubId: state.playerClub,
        category: 'injury',
        choices: [
          {
            id: 'rest',
            label: `Load-manage ${p.name} (fewer minutes, fitter body)`,
            onSuccess: [
              { kind: 'injuryProneness', playerId: p.id, amount: -6 },
              { kind: 'memory', tag: 'injury', text: `Load-managing ${p.name} to keep him fit.` },
            ],
          },
          {
            id: 'ride',
            label: `Play ${p.name} every game`,
            onSuccess: [{ kind: 'memory', tag: 'injury', text: `Riding ${p.name} hard.` }],
          },
        ],
        falloutIfIgnored: [],
        memoryTags: ['injury-management', p.id],
      };
      state.pendingDecisions.push(decision);
    }
  }
}
