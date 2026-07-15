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

// English top flight, 1999–2024. Waypoint years are SEASON-START years (the
// champion is crowned the following year), tuned so the strongest side each season
// is the real title winner — United's run, Arsenal's Invincibles peaks (01/03),
// Chelsea's Mourinho/Ancelotti eras, City's takeover then dynasty (11+), United's
// post-Ferguson fade — with the gaps small enough that variance flips the close
// ones. One table serves every English pack (the clubs and years overlap); each
// scenario arcs only the clubs it actually contains. The 1999–2013 values are the
// calibrated originals, unchanged; only 2014+ is new.
const ENGLISH: Record<string, readonly Waypoint[]> = {
  man_utd: [[1999, 89], [2001, 86], [2002, 89], [2003, 86], [2004, 85], [2006, 89], [2009, 86], [2010, 89], [2011, 86], [2012, 89], [2013, 80], [2016, 79]],
  arsenal: [[1999, 83], [2001, 88], [2002, 83], [2003, 88], [2004, 83], [2008, 80], [2013, 78], [2022, 82]],
  chelsea: [[1999, 74], [2003, 80], [2004, 89], [2006, 86], [2009, 90], [2010, 86], [2013, 85], [2014, 89], [2015, 85], [2016, 90], [2017, 85]],
  man_city: [[1999, 64], [2008, 74], [2010, 84], [2011, 90], [2012, 86], [2013, 91], [2014, 88], [2016, 89], [2017, 92], [2019, 89], [2020, 93], [2023, 92]],
  liverpool: [[1999, 81], [2008, 85], [2013, 84], [2018, 88], [2019, 91], [2020, 86], [2022, 88]],
  leeds: [[1999, 76], [2001, 78], [2004, 62], [2007, 55], [2010, 52]],
  newcastle: [[1999, 76], [2003, 77], [2009, 62], [2010, 58], [2021, 78]],
  spurs: [[1999, 72], [2009, 79], [2012, 80], [2016, 82]],
};

// La Liga, 2000–14 (real-madrid-2000). Real Madrid, Barça and Valencia trade the
// title as they really did; Deportivo's early-2000s peak fades. (2014's Atlético
// aren't a tracked club in this pack, so that one title defaults to the field.)
const LA_LIGA: Record<string, readonly Waypoint[]> = {
  real_madrid: [[2000, 91], [2001, 87], [2002, 91], [2003, 87], [2004, 89], [2006, 92], [2008, 90], [2011, 93], [2012, 90]],
  barcelona: [[2000, 86], [2004, 92], [2006, 90], [2008, 93], [2011, 91], [2012, 93]],
  valencia: [[2000, 84], [2001, 89], [2002, 84], [2003, 89], [2004, 84], [2008, 82], [2012, 79]],
  deportivo: [[2000, 86], [2002, 83], [2005, 79], [2009, 73], [2012, 68]],
};

// Serie A, 1995–2009 (juventus-1995). Milan and (post-Calciopoli) Inter carry the
// era; Lazio, Parma and Fiorentina collapse under the real financial crises
// (Cragnotti, Parmalat, bankruptcy) instead of enduring as fantasy contenders.
const ITALIAN: Record<string, readonly Waypoint[]> = {
  milan: [[1995, 88], [1999, 85], [2004, 87], [2007, 86], [2009, 82]],
  inter: [[1995, 82], [2004, 84], [2006, 87], [2007, 88], [2009, 87]],
  lazio: [[1995, 80], [1999, 84], [2000, 84], [2002, 70], [2004, 66]],
  roma: [[1995, 78], [2001, 84], [2003, 82], [2007, 82], [2009, 80]],
  fiorentina: [[1995, 80], [2001, 78], [2002, 58], [2005, 66], [2008, 72]],
  parma: [[1995, 80], [2000, 80], [2003, 68], [2005, 64]],
};

/** Every pack's domestic strength arc. The English packs share one table (same
 *  league, overlapping years); each scenario re-anchors only the clubs it holds. */
const ARCS: Record<string, Record<string, readonly Waypoint[]>> = {
  'era-1995-2005': ENGLISH, // man-utd-1999, arsenal-1996
  'era-2001': ENGLISH, // liverpool-2001
  'era-2003': ENGLISH, // manchester-united-2003, chelsea-2003
  'era-2004': ENGLISH, // arsenal-2004
  'era-2013': ENGLISH, // man-utd-2013
  'era-2000': LA_LIGA, // real-madrid-2000
  'era-serie-a-1995': ITALIAN, // juventus-1995
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
