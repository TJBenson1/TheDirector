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
  man_utd: [[1996, 88], [1997, 86], [1998, 89], [1999, 89], [2001, 86], [2002, 89], [2003, 86], [2004, 85], [2006, 89], [2009, 86], [2010, 89], [2011, 86], [2012, 89], [2013, 80], [2016, 79]],
  arsenal: [[1996, 83], [1997, 88], [1998, 83], [1999, 83], [2001, 88], [2002, 83], [2003, 88], [2004, 83], [2008, 80], [2013, 78], [2022, 82]],
  chelsea: [[1996, 78], [1999, 74], [2003, 80], [2004, 89], [2006, 86], [2009, 90], [2010, 86], [2013, 85], [2014, 89], [2015, 85], [2016, 90], [2017, 85]],
  man_city: [[1999, 64], [2008, 74], [2010, 84], [2011, 90], [2012, 86], [2013, 91], [2014, 88], [2016, 89], [2017, 92], [2019, 89], [2020, 93], [2023, 92]],
  liverpool: [[1996, 82], [1999, 81], [2008, 85], [2013, 84], [2018, 88], [2019, 91], [2020, 86], [2022, 88]],
  newcastle: [[1996, 82], [1998, 79], [1999, 76], [2003, 77], [2009, 62], [2010, 58], [2021, 78]],
  leeds: [[1999, 76], [2001, 78], [2004, 62], [2007, 55], [2010, 52]],
  spurs: [[1996, 76], [1999, 72], [2009, 79], [2012, 80], [2016, 82]],
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

// La Liga, 2003–18 (barcelona-2003). Rijkaard's Barça reborn under Ronaldinho, the
// Pep dynasty and MSN; Real Madrid slump through the late galáctico years then
// return under the BBC; Benítez's Valencia win 2004 and fade; Deportivo collapse;
// Atlético rise to their 2014 title. The user's Barça follows its real title arc.
const LA_LIGA_2003: Record<string, readonly Waypoint[]> = {
  barcelona: [[2003, 84], [2004, 92], [2006, 85], [2008, 93], [2011, 86], [2012, 93], [2013, 84], [2014, 93], [2016, 86], [2017, 92]],
  real_madrid: [[2003, 86], [2006, 92], [2008, 86], [2011, 93], [2012, 87], [2016, 93], [2017, 86]],
  valencia: [[2003, 89], [2004, 83], [2008, 79], [2012, 75]],
  atletico: [[2003, 76], [2011, 83], [2013, 90], [2014, 85], [2016, 84]],
  deportivo: [[2003, 83], [2005, 78], [2008, 73], [2011, 66]],
  sevilla: [[2003, 76], [2006, 82], [2010, 80]],
  real_sociedad: [[2003, 79], [2005, 71], [2010, 70]],
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

// Serie A, 2007–22 (milan-2007). Inter carry the immediate post-Calciopoli years,
// then Juventus's nine-in-a-row dynasty (2012–20) takes over, before Inter and a
// resurgent Milan close the era. Milan — the user's club, the ageing champions —
// take one more title (Allegri, 2011) then fall away under austerity, rising again
// only at the very end (Pioli, 2022). Roma and Napoli are the perennial nearly-men.
const ITALIAN_2007: Record<string, readonly Waypoint[]> = {
  inter: [[2007, 87], [2008, 88], [2009, 88], [2011, 82], [2020, 85], [2021, 87]],
  milan: [[2007, 85], [2009, 83], [2011, 85], [2012, 77], [2021, 83], [2022, 86]],
  juventus: [[2007, 82], [2011, 86], [2012, 88], [2015, 89], [2017, 90], [2020, 87], [2021, 83]],
  roma: [[2007, 84], [2010, 82], [2014, 83], [2018, 82], [2020, 80]],
  napoli: [[2007, 74], [2010, 80], [2013, 83], [2016, 85], [2018, 87], [2020, 84]],
  lazio: [[2007, 78], [2010, 76], [2015, 79], [2020, 81]],
  fiorentina: [[2007, 80], [2010, 79], [2013, 80], [2016, 75]],
};

// Serie A, 2004–19 (inter-2004). Juventus and Milan carry the pre-Calciopoli
// years; then the 2006 scandal craters Juventus (relegation-level collapse) and
// docks Milan, tipping the balance to Inter's real five-in-a-row (2006–10). Once
// Juventus climb back they build the nine-in-a-row dynasty (2012–20). The scandal
// is modelled here as a strength arc rather than the explicit relegation the
// juventus-1995 pack fires — the competitive effect, reality-shaped.
const ITALIAN_2004: Record<string, readonly Waypoint[]> = {
  juventus: [[2004, 88], [2005, 87], [2006, 73], [2007, 82], [2011, 86], [2012, 88], [2015, 89], [2017, 90], [2020, 87]],
  milan: [[2004, 87], [2006, 84], [2009, 83], [2011, 85], [2012, 78], [2018, 82]],
  inter: [[2004, 84], [2005, 85], [2006, 89], [2007, 89], [2010, 88], [2011, 82], [2020, 85], [2021, 87]],
  roma: [[2004, 83], [2006, 84], [2008, 84], [2014, 83], [2018, 82]],
  napoli: [[2004, 62], [2007, 74], [2010, 80], [2013, 83], [2016, 85], [2018, 87]],
  lazio: [[2004, 76], [2007, 76], [2015, 79], [2020, 81]],
  fiorentina: [[2004, 71], [2006, 80], [2009, 80], [2013, 80], [2016, 75]],
};

// Serie A, 2006–21 (juventus-2006). Juventus tower over Serie B in 2006-07, then
// climb back and build the nine-in-a-row dynasty (2012–20); Inter carry the years
// they are away (the real five-in-a-row), before Napoli's rise and Milan/Inter's
// late resurgence. The same reality shape as the 2007 arc, with Juventus starting
// a division down.
const ITALIAN_2006: Record<string, readonly Waypoint[]> = {
  juventus: [[2006, 76], [2007, 80], [2011, 86], [2012, 88], [2015, 89], [2017, 90], [2020, 87]],
  inter: [[2006, 88], [2008, 88], [2009, 88], [2011, 82], [2020, 85], [2021, 87]],
  milan: [[2006, 85], [2009, 83], [2011, 85], [2012, 77], [2021, 83], [2022, 86]],
  roma: [[2006, 84], [2010, 82], [2014, 83], [2018, 82]],
  napoli: [[2006, 72], [2010, 80], [2013, 83], [2016, 85], [2018, 87]],
  lazio: [[2006, 77], [2010, 76], [2015, 79], [2020, 81]],
  fiorentina: [[2006, 79], [2010, 79], [2013, 80], [2016, 75]],
};

// La Liga, 2006–20 (real-madrid-2006). Capello's Real win 2007, Schuster 2008,
// then the great Clásico duopoly: Pep's Barça (2009–11), Mourinho's Real (2012),
// Atlético's 2014 and 2021 breaks, and the Barça/Real trade through the 2010s. The
// user's Real follows its real title arc (2007/08, 2012, 2017, 2020).
const LA_LIGA_2006: Record<string, readonly Waypoint[]> = {
  real_madrid: [[2006, 91], [2008, 85], [2011, 93], [2012, 87], [2016, 93], [2017, 87], [2019, 92], [2020, 86]],
  barcelona: [[2006, 86], [2008, 93], [2011, 86], [2012, 93], [2013, 84], [2014, 93], [2016, 87], [2017, 93], [2019, 87]],
  atletico: [[2006, 80], [2011, 86], [2013, 91], [2014, 86], [2019, 88], [2020, 90]],
  valencia: [[2006, 84], [2009, 80], [2012, 76]],
  sevilla: [[2006, 83], [2010, 81], [2016, 82]],
  villarreal: [[2006, 80], [2009, 76], [2012, 74]],
};

// La Liga, 2014–24 (barcelona-2014). MSN's Barça win 2015/2016/2018/2019 at their
// peak, then trade the title with Real's post-Décima machine and Atlético's 2021.
// The user's Barça follows its real title arc — dominant early, contested late.
const LA_LIGA_2014: Record<string, readonly Waypoint[]> = {
  barcelona: [[2014, 93], [2016, 87], [2017, 93], [2019, 87], [2020, 85], [2022, 92], [2023, 86], [2024, 92]],
  real_madrid: [[2014, 88], [2016, 92], [2017, 87], [2019, 92], [2020, 87], [2021, 92], [2022, 87], [2023, 92], [2024, 87]],
  atletico: [[2014, 86], [2016, 85], [2020, 91], [2021, 85]],
  sevilla: [[2014, 82], [2016, 82], [2020, 82]],
  valencia: [[2014, 82], [2016, 79], [2019, 76]],
};

// Bundesliga, 2009–24 (bayern-2009). Van Gaal's Bayern win 2009-10, then Klopp's
// Dortmund take the next two titles (the insurgency the user must fend off) before
// Bayern's dynasty reasserts through the 2010s, closing with Leverkusen's 2023-24.
const BUNDESLIGA_2009: Record<string, readonly Waypoint[]> = {
  bayern: [[2009, 89], [2010, 85], [2012, 91], [2013, 92], [2020, 91], [2023, 86], [2024, 90]],
  dortmund: [[2009, 80], [2010, 89], [2012, 84], [2019, 84], [2023, 85]],
  leverkusen: [[2009, 80], [2015, 82], [2023, 90], [2024, 84]],
  schalke: [[2009, 81], [2012, 79], [2018, 78]],
  werder: [[2009, 81], [2012, 75]],
  wolfsburg: [[2009, 81], [2012, 77], [2015, 84], [2016, 77]],
};

// Bundesliga, 2012–24 (dortmund-2012). Bayern's dynasty is already in full swing —
// the user's Dortmund start at their 2013-final peak and must ACT to stop the
// throne (and their own stars) sliding to Munich; passively Bayern win almost
// everything until Leverkusen's unbeaten 2023-24.
const BUNDESLIGA_2012: Record<string, readonly Waypoint[]> = {
  dortmund: [[2012, 86], [2013, 84], [2019, 84], [2023, 85]],
  bayern: [[2012, 91], [2013, 92], [2020, 91], [2023, 86], [2024, 90]],
  leverkusen: [[2012, 81], [2015, 82], [2023, 90], [2024, 84]],
  schalke: [[2012, 80], [2018, 78]],
  gladbach: [[2012, 78], [2015, 80], [2017, 76]],
  wolfsburg: [[2012, 78], [2015, 84], [2016, 77]],
};

/** Every pack's domestic strength arc. The English packs share one table (same
 *  league, overlapping years); each scenario re-anchors only the clubs it holds. */
const ARCS: Record<string, Record<string, readonly Waypoint[]>> = {
  'era-1996': ENGLISH, // arsenal-1996
  'era-1995-2005': ENGLISH, // man-utd-1999
  'era-2001': ENGLISH, // liverpool-2001
  'era-2003': ENGLISH, // chelsea-2003
  'era-2004': ENGLISH, // arsenal-2004
  'era-2013': ENGLISH, // man-utd-2013
  'era-eng-2008': ENGLISH, // man-city-2008
  'era-2000': LA_LIGA, // real-madrid-2000
  'era-la-liga-2003': LA_LIGA_2003, // barcelona-2003
  'era-la-liga-2006': LA_LIGA_2006, // real-madrid-2006
  'era-la-liga-2014': LA_LIGA_2014, // barcelona-2014
  'era-bundesliga-2009': BUNDESLIGA_2009, // bayern-2009
  'era-bundesliga-2012': BUNDESLIGA_2012, // dortmund-2012
  'era-serie-a-1995': ITALIAN, // juventus-1995
  'era-serie-a-1998': ITALIAN, // inter-1998
  'era-serie-a-2004': ITALIAN_2004, // inter-2004
  'era-serie-a-2006': ITALIAN_2006, // juventus-2006
  'era-serie-a-2007': ITALIAN_2007, // milan-2007
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
