/**
 * Conditional takeover events (§9f, scenario butterflies).
 *
 * The Abramovich purchase of Chelsea (summer 2003) is the era's biggest butterfly
 * hinge. In reality Chelsea's 4th-place Champions-League finish — plus a London
 * club carrying buyable debt — made them the target. Historical testimony is that
 * the CL place mattered but was not the sole factor (Abramovich looked at other
 * clubs and simply wanted a big London side he could buy). So: if Chelsea take a
 * top-four place, the takeover completes; if a rival (e.g. a resurgent Liverpool)
 * denies them it, the takeover is materially less likely but still plausible —
 * modelled here at ~45%. The takeover "realises" the `abramovich` funder, which
 * gates Chelsea's 2003 splurge (Makélélé, Crespo, Duff, …) in the ledger.
 */

import type { GameState } from './types.js';
import { standingsOrder } from './season.js';
import { logEvent } from './eventLog.js';
import { Rng } from './rng.js';

/** Chance the takeover still happens if Chelsea MISS the Champions League. */
const TAKEOVER_WITHOUT_CL = 0.45;

/** Resolve the Abramovich takeover once, at the July 2003 rollover. */
export function resolveAbramovich(state: GameState, rng: Rng): void {
  if (state.meta.scenarioId !== 'liverpool-2001') return;
  if (state.clock.monthIndex !== 0 || !state.clock.date.startsWith('2003')) return;
  if (state.meta.firedScripted.includes('abramovich-check')) return;
  state.meta.firedScripted.push('abramovich-check');

  const league = state.leagues['eng-2001'];
  if (!league) return;
  const order = standingsOrder(league);
  const chelseaPos = order.indexOf('chelsea') + 1;
  const gotCL = chelseaPos >= 1 && chelseaPos <= 4; // top four = Champions League

  const buys = gotCL || rng.fork('abramovich').chance(TAKEOVER_WITHOUT_CL);
  if (buys) {
    state.meta.realizedLedger.push('abramovich');
    logEvent(state, {
      category: 'event',
      code: 'takeover.abramovich',
      message: gotCL
        ? 'Roman Abramovich completes his takeover of Chelsea — the billions arrive'
        : 'Despite missing the Champions League, Abramovich still buys Chelsea',
      data: { chelseaPos, gotCL },
    });
  } else {
    state.timeline.divergenceLog.push({
      date: state.clock.date,
      kind: 'butterfly',
      detail: `Chelsea finished ${chelseaPos}th and missed the Champions League — Abramovich walks away, and the takeover never happens.`,
    });
    logEvent(state, {
      category: 'event',
      code: 'takeover.abramovich.collapsed',
      message: 'No Champions League, no takeover: Chelsea remain a mid-table-budget club',
      data: { chelseaPos, gotCL },
    });
  }
}
