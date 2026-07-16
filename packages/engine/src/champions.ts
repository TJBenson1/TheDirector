/**
 * The Champions League / European Cup (§ butterfly showcase).
 *
 * A continental knockout run each season alongside the domestic leagues. This is
 * where the counterfactual bites hardest: the winner falls out of CLUB STRENGTH,
 * which is squad-derived, so any butterfly the user (or a chain of them) sets off
 * — a weakened Barça that never landed Ronaldinho, a strengthened United that
 * kept Piqué — changes who lifts the trophy, and why.
 *
 * Design: the field is the domestic league's real qualifiers (top four) plus the
 * strongest cross-European context clubs (each standing in for its own league's
 * entrants). A standard seeded single-elimination bracket keeps the two best
 * apart until the final; each tie is decided by a logistic on the strength gap
 * with a floor/ceiling, so favourites usually go through but upsets always can.
 */

import type { ClubId, GameState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { standingsOrder } from './season.js';
import { eraForScenario } from './ledger.js';
/**
 * The club's strength through the CONTINENTAL lens (§ butterfly showcase): the
 * domestic `strength` PLUS the star premium a BUTTERFLY has added or stripped
 * (`starButterfly`). Building on `strength` keeps every domestic signal (squad
 * churn, ageing, a scripted sapping) intact; the added term is non-zero only when
 * a USER or rival deviation has moved a talisman off his real path — reality's own
 * star shuffles and ordinary ageing never touch it. So a passive world reads
 * exactly `strength` (= `baseStrength`) and reproduces the real European Cup
 * winners, while a spine gutted by a deviation bites: a different side lifts it.
 */
function clStrength(state: GameState, id: ClubId): number {
  const c = state.clubs[id];
  if (!c) return 0;
  return Math.max(20, Math.min(99, c.strength + (c.starButterfly ?? 0) - (c.chemistryPenalty ?? 0)));
}

/**
 * Real Champions League / European Cup winners, by ERA pack and SEASON YEAR (the
 * opening year — the final is the following spring). Reality-default: the real
 * winner holds UNLESS a butterfly has knocked them off the top of the European
 * strength table (see `ANCHOR_MARGIN`). Only winners that exist as modelled clubs
 * in the relevant pack are listed; anything else falls through to a pure strength
 * knockout. `r` is the runner-up where it too is modelled.
 */
// `talisman` (a player id) marks a win that was CARRIED by one star: if a butterfly
// has moved him away from the winning club, that win loses its anchor and is thrown
// open to merit — and his strength travels WITH him (the magnet: Ronaldo elsewhere
// makes THAT club a force), so the knockout is genuinely up for grabs.
type RealFinal = { w: ClubId; r?: ClubId; talisman?: string };
const REAL_UCL: Record<string, Record<number, RealFinal>> = {
  'era-serie-a-1995': {
    // With Man Utd, Liverpool and Porto now in the pack, every European Cup of the
    // scenario's span is anchored to its real winner.
    1995: { w: 'juventus', r: 'ajax' },
    1996: { w: 'dortmund', r: 'juventus' },
    1997: { w: 'real_madrid', r: 'juventus' },
    1998: { w: 'man_utd', r: 'bayern' },
    1999: { w: 'real_madrid' },
    2000: { w: 'bayern' },
    2001: { w: 'real_madrid' },
    2002: { w: 'milan', r: 'juventus' },
    2003: { w: 'porto', r: 'monaco' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
  },
  'era-serie-a-1998': {
    // Il Fenomeno's Inter, 1998→2013. Every real European Cup winner's club is in
    // the pack — including Inter's own 2010 win — so a passive walk reproduces the
    // whole board (Mourinho's 2010 Inter treble included).
    1998: { w: 'man_utd', r: 'bayern' },
    1999: { w: 'real_madrid', r: 'valencia' },
    2000: { w: 'bayern', r: 'valencia' },
    2001: { w: 'real_madrid' },
    2002: { w: 'milan', r: 'juventus' },
    2003: { w: 'porto', r: 'monaco' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern', r: 'dortmund' },
  },
  'era-bundesliga-2010': {
    // Klopp's Dortmund and van Gaal's Bayern, 2010→2025. The all-German 2013 final
    // (Bayern beat Dortmund) is anchored, alongside Real Madrid's dynasty and every
    // other real winner; runners-up not in the pack (Atlético) resolve to the field.
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern', r: 'dortmund' },
    2013: { w: 'real_madrid' },
    2014: { w: 'barcelona', r: 'juventus' },
    2015: { w: 'real_madrid' },
    2016: { w: 'real_madrid', r: 'juventus' },
    2017: { w: 'real_madrid', r: 'liverpool' },
    2018: { w: 'liverpool' },
    2019: { w: 'bayern' },
    2020: { w: 'chelsea', r: 'man_city' },
    2021: { w: 'real_madrid', r: 'liverpool' },
    2022: { w: 'man_city', r: 'inter' },
    2023: { w: 'real_madrid', r: 'dortmund' },
  },
  'era-la-liga-2014': {
    // MSN's Barça, 2014→2025. Real Madrid's modern Champions League dominance
    // (2016, 2017, 2018, 2022, 2024) is anchored, alongside Barça's 2015 treble,
    // Liverpool's 2019, Bayern's 2020, Chelsea's 2021 and City's 2023. The 2025
    // final (PSG) sits at the very edge of the 2025 world-end.
    2014: { w: 'barcelona', r: 'juventus' },
    2015: { w: 'real_madrid', r: 'atletico' },
    2016: { w: 'real_madrid', r: 'juventus' },
    2017: { w: 'real_madrid', r: 'liverpool' },
    2018: { w: 'liverpool' },
    2019: { w: 'bayern', r: 'psg' },
    2020: { w: 'chelsea', r: 'man_city' },
    2021: { w: 'real_madrid', r: 'liverpool' },
    2022: { w: 'man_city', r: 'inter' },
    2023: { w: 'real_madrid', r: 'dortmund' },
    2024: { w: 'psg', r: 'inter' },
  },
  'era-la-liga-2006': {
    // Capello's rebuild, 2006→2021. Real Madrid's real mid-2010s Champions League
    // dynasty (2014, 2016, 2017, 2018) is anchored — the "Madrid win a tonne of
    // European Cups" reality — alongside every other real winner in the pack.
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern', r: 'dortmund' },
    2013: { w: 'real_madrid', r: 'atletico' },
    2014: { w: 'barcelona', r: 'juventus' },
    2015: { w: 'real_madrid', r: 'atletico' },
    2016: { w: 'real_madrid', r: 'juventus' },
    2017: { w: 'real_madrid', r: 'liverpool' },
    2018: { w: 'liverpool' },
    2019: { w: 'bayern' },
    2020: { w: 'chelsea' },
  },
  'era-la-liga-2003': {
    // Rijkaard's Barça, 2003→2018. Every real European Cup winner's club is in the
    // pack (Porto's 2004 miracle, Barça's 2006/2009/2011, Real's mid-2010s
    // dynasty); runners-up not in the field resolve to the strongest available.
    2003: { w: 'porto', r: 'monaco' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern' },
    2013: { w: 'real_madrid', r: 'atletico' },
    2014: { w: 'barcelona', r: 'juventus' },
    2015: { w: 'real_madrid', r: 'atletico' },
    2016: { w: 'real_madrid', r: 'juventus' },
    2017: { w: 'real_madrid', r: 'liverpool' },
  },
  'era-serie-a-2006': {
    // Juventus's climb back, 2006→2021. Juve are in Serie B for 2006-07 (no Europe
    // that season); from 2007 they rebuild into the side that reaches the 2015 and
    // 2017 finals. Every real winner's club is in the (reused era-2007) pack.
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern', r: 'dortmund' },
    2013: { w: 'real_madrid', r: 'atletico' },
    2014: { w: 'barcelona', r: 'juventus' },
    2015: { w: 'real_madrid', r: 'atletico' },
    2016: { w: 'real_madrid', r: 'juventus' },
    2017: { w: 'real_madrid', r: 'liverpool' },
    2018: { w: 'liverpool' },
    2019: { w: 'bayern' },
    2020: { w: 'chelsea' },
  },
  'era-serie-a-2004': {
    // Mancini's nearly-men, 2004→2019. Every real European Cup winner's club is in
    // the pack (Inter's own 2010 treble, Real Madrid's mid-2010s dynasty); the
    // Porto/Monaco final of 2004 predates the start, so the board opens at 2005.
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern', r: 'dortmund' },
    2013: { w: 'real_madrid', r: 'atletico' },
    2014: { w: 'barcelona', r: 'juventus' },
    2015: { w: 'real_madrid', r: 'atletico' },
    2016: { w: 'real_madrid', r: 'juventus' },
    2017: { w: 'real_madrid', r: 'liverpool' },
    2018: { w: 'liverpool' },
  },
  'era-serie-a-2007': {
    // The ageing champions of 2007, 2007→2022. Every real European Cup winner's
    // club is in the pack (Real Madrid's 2014–2022 dynasty included); runners-up
    // not in the field (Spurs 2019, PSG 2020, City 2021, Atlético in some years)
    // simply resolve to the strongest available side.
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern', r: 'dortmund' },
    2013: { w: 'real_madrid', r: 'atletico' },
    2014: { w: 'barcelona', r: 'juventus' },
    2015: { w: 'real_madrid', r: 'atletico' },
    2016: { w: 'real_madrid', r: 'juventus' },
    2017: { w: 'real_madrid', r: 'liverpool' },
    2018: { w: 'liverpool' },
    2019: { w: 'bayern' },
    2020: { w: 'chelsea' },
    2021: { w: 'real_madrid', r: 'liverpool' },
  },
  'era-2000': {
    // The full 2000–15 board — every real winner's club is in this pack (Porto's
    // 2004 miracle included), so a passive walk reproduces the European Cup exactly.
    2000: { w: 'bayern', r: 'valencia' },
    2001: { w: 'real_madrid', r: 'valencia' },
    2002: { w: 'milan', r: 'juventus' },
    2003: { w: 'porto', r: 'monaco' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern' },
    2013: { w: 'real_madrid' },
    2014: { w: 'barcelona', r: 'juventus' },
  },
  'era-2001': {
    // Real finalists 2002–2016; every winner's club is now in the pack (Porto
    // included), so only the 2013 Dortmund runner-up falls outside it.
    2001: { w: 'real_madrid' },
    2002: { w: 'milan', r: 'juventus' },
    2003: { w: 'porto', r: 'monaco' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern' },
    2013: { w: 'real_madrid' },
    2014: { w: 'barcelona', r: 'juventus' },
    2015: { w: 'real_madrid' },
  },
  'era-2004': {
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
  },
  'era-2013': {
    // Real Madrid's dynasty is REALITY: six European Cups in eleven years (the
    // Décima and the three-in-a-row among them). A passive world reproduces it —
    // it unravels only if the user diverts Ronaldo (his star premium saps Real, so
    // the anchored wins lose their shield) or otherwise bends the timeline. 2025+
    // is genuine future, left to field sim. Runners-up absent from the pack
    // (Atlético, Inter, Dortmund) are omitted.
    // Real's Décima and three-in-a-row were carried by Ronaldo — divert him and
    // these are open to Pep's Bayern, Messi's Barça, City, Atlético et al. Their
    // post-Ronaldo wins (2022, 2024) carry no such flag.
    2013: { w: 'real_madrid', talisman: 'cur_ronaldo2' },
    2014: { w: 'barcelona', r: 'juventus' },
    2015: { w: 'real_madrid', talisman: 'cur_ronaldo2' },
    2016: { w: 'real_madrid', r: 'juventus', talisman: 'cur_ronaldo2' },
    2017: { w: 'real_madrid', r: 'liverpool', talisman: 'cur_ronaldo2' },
    2018: { w: 'liverpool', r: 'spurs' },
    2019: { w: 'bayern', r: 'psg' },
    2020: { w: 'chelsea', r: 'man_city' },
    2021: { w: 'real_madrid', r: 'liverpool' },
    2022: { w: 'man_city' },
    2023: { w: 'real_madrid' },
    2024: { w: 'psg' },
  },
  // "Arrival of Wenger", 1996–2011 (arsenal-1996). Dortmund's 1997 upset over Juve
  // and United's 1999 treble anchor the early years; only Porto's 2004 win (no Porto
  // in this pack) defaults to field sim.
  'era-1996': {
    1996: { w: 'dortmund', r: 'juventus' },
    1997: { w: 'real_madrid', r: 'juventus' },
    1998: { w: 'man_utd', r: 'bayern' },
    1999: { w: 'real_madrid' },
    2000: { w: 'bayern' },
    2001: { w: 'real_madrid' },
    2002: { w: 'milan', r: 'juventus' },
    2003: { w: 'porto', r: 'monaco' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
  },
  'era-2003': {
    2003: { w: 'porto', r: 'monaco' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
  },
  'era-1995-2005': {
    1999: { w: 'real_madrid' },
    2000: { w: 'bayern' },
    2001: { w: 'real_madrid' },
    2002: { w: 'milan', r: 'juventus' },
    2004: { w: 'liverpool', r: 'milan' },
    2005: { w: 'barcelona', r: 'arsenal' },
    2006: { w: 'milan', r: 'liverpool' },
    2007: { w: 'man_utd', r: 'chelsea' },
    2008: { w: 'barcelona', r: 'man_utd' },
    2009: { w: 'inter', r: 'bayern' },
    2010: { w: 'barcelona', r: 'man_utd' },
    2011: { w: 'chelsea', r: 'bayern' },
    2012: { w: 'bayern', r: 'chelsea' },
    2013: { w: 'real_madrid' },
  },
};

/** Reality deviates only when a butterfly moves the balance: the real winner is
 *  weakened this far below their own baseline, or a rival out-swings them this
 *  far. Small, because squad-strength deltas from real transfers are small. */
const ANCHOR_DROP = 3;
const ANCHOR_SWING = 6;
/** How far below the field's strongest a real winner must sit to count as an
 *  UPSET — a side reality, not merit, crowned. Such a champion is shielded in an
 *  undisturbed world but, once a butterfly reaches them, loses that shield and
 *  takes their true (long) knockout odds. A dominant winner sits inside this gap. */
const UPSET_GAP = 4;
/** Knockout weight of a defining talisman — subtracted from the club he left and
 *  added to the club he joined when a `talisman`-flagged win is thrown open. Big
 *  enough to unseat a champion who relied on him and to lift his new side into
 *  contention (the magnet), without being decisive on its own. */
const TALISMAN_STRENGTH = 6;

/** How many clubs contest the knockout (a clean 16-team bracket when possible). */
const FIELD_SIZE = 16;
/** Logistic spread: a `K`-point strength edge ≈ 73% to advance a single tie. */
const K = 7;
/** Even a heavy favourite can go out; even a minnow can spring one. */
const MIN_ADVANCE = 0.12;
const MAX_ADVANCE = 0.9;

function eligible(state: GameState, id: ClubId): boolean {
  const c = state.clubs[id];
  // A currently-relegated club (out of the top flight this season) does not
  // contest Europe.
  return !!c && c.relegatedUntil === undefined;
}

/** The standard single-elimination seeding order for a bracket of size `n`
 *  (power of two): returns seed numbers 1..n arranged so 1 and 2 can only meet
 *  in the final. e.g. n=4 → [1,4,2,3]. */
function seedOrder(n: number): number[] {
  let order = [1, 2];
  while (order.length < n) {
    const size = order.length * 2;
    const next: number[] = [];
    for (const s of order) {
      next.push(s);
      next.push(size + 1 - s);
    }
    order = next;
  }
  return order;
}

/** Assemble this season's field: domestic top four + strongest context clubs,
 *  plus any `mustInclude` clubs (the season's real qualifiers — a real winner who
 *  slipped out of the domestic top four, like Liverpool 2005 who finished 5th and
 *  won it as holders, must still be in the field for reality to be reproducible). */
function buildField(state: GameState, mustInclude: ClubId[] = []): ClubId[] {
  const userLeague = state.leagues[state.clubs[state.playerClub]?.leagueId ?? ''];
  const seen = new Set<ClubId>();
  const field: ClubId[] = [];
  const add = (id: ClubId) => {
    if (!seen.has(id) && eligible(state, id)) {
      seen.add(id);
      field.push(id);
    }
  };

  // The season's real qualifiers first — they historically got in, so they cannot
  // be trimmed out below.
  for (const id of mustInclude) add(id);

  // Real qualification: the domestic league's top four.
  if (userLeague) for (const id of standingsOrder(userLeague).slice(0, 4)) add(id);

  // Fill from the strongest cross-European context clubs (each its league's
  // entrant), then, if still short, deeper domestic qualifiers.
  const context = Object.values(state.clubs)
    .filter((c) => c.leagueId === null)
    .sort((a, b) => clStrength(state, b.id) - clStrength(state, a.id))
    .map((c) => c.id);
  for (const id of context) {
    if (field.length >= FIELD_SIZE) break;
    add(id);
  }
  if (userLeague) for (const id of standingsOrder(userLeague)) {
    if (field.length >= FIELD_SIZE) break;
    add(id);
  }

  // Trim to the largest power of two ≤ field size (min 4) for a clean bracket —
  // keeping the must-includes and then the strongest of the rest.
  let size = 1;
  while (size * 2 <= Math.min(field.length, FIELD_SIZE)) size *= 2;
  const forced = field.filter((id) => mustInclude.includes(id));
  const rest = field
    .filter((id) => !mustInclude.includes(id))
    .sort((a, b) => clStrength(state, b) - clStrength(state, a));
  return [...forced, ...rest].slice(0, size).sort((a, b) => clStrength(state, b) - clStrength(state, a));
}

/** Probability the stronger side (by `sa` vs `sb`) advances a single tie. */
function advanceProb(sa: number, sb: number): number {
  const p = 1 / (1 + Math.exp(-(sa - sb) / K));
  return Math.max(MIN_ADVANCE, Math.min(MAX_ADVANCE, p));
}

/**
 * Simulate the season's Champions League and record the winner. Uses the field's
 * current squad strengths, so it reflects every butterfly to date. Called at the
 * July rollover for the season just completed (before the summer market runs).
 */
export function simulateChampionsLeague(state: GameState, rng: Rng, seasonYear: number): void {
  // The season's real winner/runner-up qualified historically, so the field must
  // include them even if a butterfly (or a weak league season) dropped them out of
  // the domestic top four — otherwise reality could not be reproduced.
  const realFinal = REAL_UCL[eraForScenario(state.meta.scenarioId)]?.[seasonYear];
  const mustInclude = realFinal ? [realFinal.w, realFinal.r].filter((id): id is ClubId => !!id) : [];
  const seeds = buildField(state, mustInclude);
  if (seeds.length < 4) return; // not enough of a field to bother

  state.europeanCup ??= { name: 'Champions League', titleHistory: [] };
  const record = (winnerId: ClubId, runnerUpId: ClubId, real: boolean, realWinner?: ClubId) => {
    state.europeanCup!.titleHistory.push({ seasonYear, winnerId, runnerUpId });
    logEvent(state, {
      category: 'match',
      code: 'ucl.final',
      message: `${state.clubs[winnerId]!.name} win the Champions League (${seasonYear}–${seasonYear + 1}), beating ${state.clubs[runnerUpId]!.name} in the final`,
      data: { seasonYear, winnerId, runnerUpId, real },
    });
    if (!real && realWinner && realWinner !== winnerId) {
      state.timeline.divergenceLog.push({
        date: state.clock.date,
        kind: 'butterfly',
        detail: `Champions League ${seasonYear + 1}: ${state.clubs[realWinner]?.name ?? realWinner} were no longer strong enough to win it — ${state.clubs[winnerId]!.name} lift the European Cup instead.`,
      });
    }
  };

  const field = new Set(seeds);

  // Reality-default via BUTTERFLY DELTA, not absolute strength: reality isn't
  // strength-monotonic (Liverpool 2005, Porto 2004 were upset winners), so the
  // real winner holds by default and is unseated only when a butterfly has moved
  // the balance — dropped THEIR strength below their real baseline, or lifted a
  // rival's above them by a clear swing. In a passive world every delta is ~0, so
  // every real winner is reproduced exactly.
  const delta = (id: ClubId): number => clStrength(state, id) - state.clubs[id]!.baseStrength;
  const real = realFinal;
  // Reality holds ABSOLUTELY until the world has genuinely DIVERGED — the user has
  // acted on the market (aggression) or a butterfly has been banked into the
  // field. Ageing, form and reality's own transfers are not divergence: they must
  // never unseat a real winner (an upset winner like Liverpool 2005 sits close to
  // the threshold, and squad ageing alone could otherwise tip them out). Only once
  // the user starts bending history do the real results open up to merit.
  const anyButterfly = seeds.some((id) => Math.abs(state.clubs[id]?.starButterfly ?? 0) > 0.01);
  // A talisman-carried win: where is that star now, and has he left the club he won
  // it for? (Absent from the pack entirely counts as gone.)
  const talismanClub = real?.talisman ? state.players[real.talisman]?.club ?? undefined : undefined;
  const talismanGone = real?.talisman != null && talismanClub !== real.w;
  const diverged = state.userAggression > 0 || anyButterfly || talismanGone;
  if (real && field.has(real.w)) {
    const runnerUp = real.r && field.has(real.r) ? real.r : seeds.find((id) => id !== real.w) ?? real.w;
    if (!diverged) {
      record(real.w, runnerUp, true);
      return;
    }
    const rwDelta = delta(real.w);
    let maxRivalSwing = -Infinity;
    let fieldMax = -Infinity;
    for (const id of seeds) {
      fieldMax = Math.max(fieldMax, clStrength(state, id));
      if (id !== real.w) maxRivalSwing = Math.max(maxRivalSwing, delta(id));
    }
    const outSwung = maxRivalSwing - rwDelta > ANCHOR_SWING;
    // An UPSET winner (Liverpool 2005, Porto 2004) sits well below the field's
    // best — reality, not merit, put the trophy in their hands. In an undisturbed
    // world that miracle is reproduced (the !diverged branch above). But once the
    // timeline is bent AND the disturbance actually reaches them (they have been
    // sapped by a butterfly, however small — a raid on their spine), the miracle
    // is no longer shielded: they take their true, long merit odds in the knockout
    // and the upset most likely evaporates. A DOMINANT champion, near the top of
    // the field, keeps the ordinary drop/out-swing protection.
    const isUpset = fieldMax - clStrength(state, real.w) > UPSET_GAP;
    const sapped = (state.clubs[real.w]?.starButterfly ?? 0) < -0.01;
    const fragileUpsetFalls = isUpset && sapped;
    // A win carried by a talisman falls when a butterfly has taken him elsewhere —
    // even a deep side loses the man who won it these finals, and it opens up.
    if (rwDelta >= -ANCHOR_DROP && !outSwung && !fragileUpsetFalls && !talismanGone) {
      record(real.w, runnerUp, true);
      return;
    }
  }

  // Otherwise the knockout decides on merit (a butterfly-driven deviation, or a
  // year/era with no anchored real winner in the field). When a talisman was
  // diverted, his weight leaves the club he carried and travels to the club he
  // joined (the magnet), so the bracket reflects where the star power now is.
  const eff = (id: ClubId): number => {
    let s = clStrength(state, id);
    if (talismanGone) {
      if (id === real!.w) s -= TALISMAN_STRENGTH;
      if (id === talismanClub) s += TALISMAN_STRENGTH;
    }
    return s;
  };
  const r = rng.fork(`ucl:${seasonYear}`);
  let bracket: ClubId[] = seedOrder(seeds.length).map((seed) => seeds[seed - 1]!);
  let runnerUp: ClubId = seeds[1] ?? seeds[0]!;
  while (bracket.length > 1) {
    const next: ClubId[] = [];
    for (let i = 0; i < bracket.length; i += 2) {
      const a = bracket[i]!;
      const b = bracket[i + 1]!;
      const aWins = r.next() < advanceProb(eff(a), eff(b));
      if (bracket.length === 2) runnerUp = aWins ? b : a; // this tie is the final
      next.push(aWins ? a : b);
    }
    bracket = next;
  }
  record(bracket[0]!, runnerUp, false, real?.w);
}
