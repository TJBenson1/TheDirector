/**
 * Reality strength arcs (§9a domestic reality-default).
 *
 * The Champions League is reality-anchored, but the DOMESTIC league is pure
 * emergent strength — and squad strength is dominated by kickoff prestige and
 * barely moves with transfers or time, so whoever starts strongest wins almost
 * every season for fifteen years. Real title races reshuffle because clubs RISE
 * and FALL: Abramovich's money remakes Chelsea in 2004, City's takeover lands in
 * 2008, Ferguson's United fades after 2013, Leeds and the Italian giants collapse
 * under debt.
 *
 * An arc is a scripted trajectory of a club's strength over time. At each season
 * rollover we re-baseline the club to its arc value for that year (see
 * reanchorClubStrength), so the pecking order follows reality's shape instead of
 * freezing at the start. This includes the USER's club: reality-default means a
 * club left alone follows its real trajectory (a passive Ferguson-era United keeps
 * winning, it does not quietly rot) — the player bends it off the arc by ACTING,
 * since their transfers bank a butterfly (starButterfly) that layers on top in
 * matchStrength/clStrength. A club is simply left to natural drift by omitting it
 * from the table (e.g. Juventus, whose 1995 arc is shaped by Calciopoli instead).
 *
 * Values are target STRENGTHS at a given season-start year, held (step-wise) until
 * the next waypoint. They encode the net effect of each club's real recruitment,
 * so the club's overall level follows the arc while the reality ledger keeps
 * moving the actual players (roster fidelity) underneath.
 */

import type { GameState } from './types.js';
import { eraForScenario } from './ledger.js';
import { reanchorClubStrength } from './players.js';
import { parseYearMonth } from './clock.js';

type Waypoint = readonly [year: number, strength: number];

const ARCS: Record<string, Record<string, readonly Waypoint[]>> = {
  // English top flight, 1999–2014 (man-utd-1999 / arsenal-1996). The user's club
  // is skipped, so United's post-Ferguson fade emerges organically when they are
  // the player, and is scripted when they are a rival.
  // Waypoint years are SEASON-START years (the champion is crowned the following
  // year), tuned so the strongest side each season is the real title winner —
  // United's run, Arsenal's Invincibles peaks (01/03), Chelsea's Mourinho/Ancelotti
  // eras (04/05/09), City's takeover (11/13) — with the gaps small enough that
  // match variance still flips the close ones.
  'era-1995-2005': {
    man_utd: [[1999, 89], [2001, 86], [2002, 89], [2003, 86], [2004, 85], [2006, 89], [2009, 86], [2010, 89], [2011, 86], [2012, 89], [2013, 80]],
    arsenal: [[1999, 83], [2001, 88], [2002, 83], [2003, 88], [2004, 83], [2008, 80], [2013, 78]],
    chelsea: [[1999, 74], [2003, 80], [2004, 89], [2006, 86], [2009, 90], [2010, 86], [2013, 85]],
    man_city: [[1999, 64], [2008, 74], [2010, 84], [2011, 90], [2012, 86], [2013, 91]],
    liverpool: [[1999, 81], [2008, 85], [2013, 84]],
    leeds: [[1999, 76], [2001, 78], [2004, 62], [2007, 55], [2010, 52]],
    newcastle: [[1999, 76], [2003, 77], [2009, 62], [2010, 58]],
    spurs: [[1999, 72], [2009, 79], [2012, 80]],
  },
  // Serie A, 1995–2009 (juventus-1995). Milan and (post-Calciopoli) Inter carry
  // the era; Lazio, Parma and Fiorentina collapse under the real financial crises
  // (Cragnotti, Parmalat, bankruptcy) instead of enduring as fantasy contenders.
  'era-serie-a-1995': {
    milan: [[1995, 88], [1999, 85], [2004, 87], [2007, 86], [2009, 82]],
    inter: [[1995, 82], [2004, 84], [2006, 87], [2007, 88], [2009, 87]],
    lazio: [[1995, 80], [1999, 84], [2000, 84], [2002, 70], [2004, 66]],
    roma: [[1995, 78], [2001, 84], [2003, 82], [2007, 82], [2009, 80]],
    fiorentina: [[1995, 80], [2001, 78], [2002, 58], [2005, 66], [2008, 72]],
    parma: [[1995, 80], [2000, 80], [2003, 68], [2005, 64]],
  },
};

/** The arc's target strength for `year` — the latest waypoint at or before it, or
 *  null while the year predates the first waypoint (leave the club untouched). */
function valueAt(waypoints: readonly Waypoint[], year: number): number | null {
  let v: number | null = null;
  for (const [y, s] of waypoints) {
    if (year >= y) v = s;
    else break;
  }
  return v;
}

/**
 * Bend every arced non-user club to its trajectory for the current season. Called
 * at the July rollover, after ageing/recompute so the arc has the final say on the
 * strength each rival carries into the new campaign.
 */
export function applyStrengthArcs(state: GameState): void {
  const arcs = ARCS[eraForScenario(state.meta.scenarioId)];
  if (!arcs) return;
  const year = parseYearMonth(state.clock.date).year;
  for (const [clubId, waypoints] of Object.entries(arcs)) {
    if (!state.clubs[clubId]) continue;
    const target = valueAt(waypoints, year);
    if (target != null) reanchorClubStrength(state, clubId, target);
  }
}
