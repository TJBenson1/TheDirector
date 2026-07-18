/**
 * Real-standings ledger (M14 — domestic reality-default).
 *
 * The Champions League and the transfer market already replay history by default;
 * the domestic LEAGUE did not — a 38-game season of an inherently high-variance
 * match model scrambles the table, so a passive Liverpool-2001 could see Newcastle
 * crowned and Derby finish seventh. You cannot fix that by tuning strength (the
 * variance is irreducible and realistic); you fix it the way the rest of the engine
 * already works: anchor the RESULT to reality by default, and simulate only the
 * DIVERGENCE.
 *
 * At season finalisation each club's league record is pulled toward its real
 * finishing position for that season, scaled by (1 − divergence). A passive run
 * (divergence 0) reproduces the real table exactly; an active Director who guts a
 * rival or builds a superclub bends the table off history in proportion to how far
 * they have pushed the world off its real course.
 *
 * Only leagues/seasons present in the ledger are anchored; anything else keeps the
 * pure emergent simulation, so coverage can grow season by season.
 */

import type { ClubId, GameState, LeagueState, TeamRecord } from './types.js';
import { divergenceFactor } from './divergence.js';

/** Small deterministic non-negative integer hash of a string (for draw jitter). */
function jitter(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 5;
}

/** Real final order (1st → last) of the clubs we simulate, by league key and
 *  SEASON-START year (1999 = the 1999–2000 season). Clubs the pack doesn't model
 *  that season are simply omitted; a simulated club absent from the real order
 *  keeps its emergent result. */
const REAL_STANDINGS: Record<string, Record<number, ClubId[]>> = {
  english: {
    1999: ['man_utd', 'arsenal', 'leeds', 'liverpool', 'chelsea', 'aston_villa', 'sunderland', 'leicester', 'west_ham', 'spurs', 'newcastle', 'middlesbrough', 'everton', 'coventry', 'southampton', 'derby', 'bradford', 'wimbledon', 'sheffield_wednesday', 'watford'],
    2000: ['man_utd', 'arsenal', 'liverpool', 'leeds', 'ipswich', 'chelsea', 'sunderland', 'aston_villa', 'charlton', 'southampton', 'newcastle', 'spurs', 'leicester', 'middlesbrough', 'west_ham', 'everton', 'derby', 'man_city', 'coventry', 'bradford'],
    2001: ['arsenal', 'liverpool', 'man_utd', 'newcastle', 'leeds', 'chelsea', 'west_ham', 'aston_villa', 'spurs', 'blackburn', 'southampton', 'middlesbrough', 'fulham', 'charlton', 'everton', 'bolton', 'sunderland', 'ipswich', 'derby', 'leicester'],
    2002: ['man_utd', 'arsenal', 'newcastle', 'chelsea', 'liverpool', 'blackburn', 'everton', 'southampton', 'man_city', 'spurs', 'middlesbrough', 'charlton', 'birmingham', 'fulham', 'leeds', 'aston_villa', 'bolton', 'west_ham', 'west_brom', 'sunderland'],
    2003: ['arsenal', 'chelsea', 'man_utd', 'liverpool', 'newcastle', 'aston_villa', 'charlton', 'bolton', 'fulham', 'birmingham', 'middlesbrough', 'southampton', 'portsmouth', 'spurs', 'blackburn', 'man_city', 'everton', 'leicester', 'leeds', 'wolves'],
    2004: ['chelsea', 'arsenal', 'man_utd', 'everton', 'liverpool', 'bolton', 'middlesbrough', 'man_city', 'spurs', 'aston_villa', 'charlton', 'birmingham', 'fulham', 'newcastle', 'blackburn', 'portsmouth', 'west_brom', 'crystal_palace', 'norwich', 'southampton'],
    2008: ['man_utd', 'liverpool', 'chelsea', 'arsenal', 'everton', 'aston_villa', 'fulham', 'spurs', 'west_ham', 'man_city', 'wigan', 'stoke', 'bolton', 'portsmouth', 'blackburn', 'sunderland', 'hull', 'newcastle', 'middlesbrough', 'west_brom'],
    2010: ['man_utd', 'chelsea', 'man_city', 'arsenal', 'spurs', 'liverpool', 'everton', 'fulham', 'aston_villa', 'sunderland', 'west_brom', 'newcastle', 'stoke', 'bolton', 'blackburn', 'wigan', 'wolves', 'birmingham', 'blackpool', 'west_ham'],
    2013: ['man_city', 'liverpool', 'chelsea', 'arsenal', 'everton', 'spurs', 'man_utd', 'southampton', 'stoke', 'newcastle', 'crystal_palace', 'swansea', 'west_ham', 'sunderland', 'aston_villa', 'hull', 'west_brom', 'norwich', 'fulham', 'cardiff'],
  },
};

/** Realistic Premier-League points by finishing rank (20-team league). Strictly
 *  decreasing so an anchored table has a definite order. Champion ~88 down to a
 *  ~24-point bottom side. */
const PL_POINTS_BY_RANK = [88, 80, 74, 69, 64, 60, 56, 53, 50, 48, 45, 43, 41, 39, 37, 35, 33, 30, 27, 24];

/** League key for the club's competition, or null if we don't anchor it. */
function leagueKey(league: LeagueState): string | null {
  // Only the English top flight is seeded so far (id like "england"/"epl").
  const id = league.id.toLowerCase();
  if (id.includes('england') || id.includes('premier') || id.includes('epl') || id.includes('eng')) return 'english';
  return null;
}

/** Target points for a finishing rank in an n-club league. */
function pointsForRank(rank0: number, n: number): number {
  if (n === 20) return PL_POINTS_BY_RANK[rank0] ?? 30;
  // Rescale the 20-team curve onto a differently-sized league.
  const idx = Math.round((rank0 / Math.max(1, n - 1)) * (PL_POINTS_BY_RANK.length - 1));
  return PL_POINTS_BY_RANK[Math.min(PL_POINTS_BY_RANK.length - 1, idx)] ?? 30;
}

/** Plausible W/D/L/goals for a target points total at a finishing rank, so the
 *  displayed record is internally consistent (points = 3·W + D). Draws sit near the
 *  league average (~26%) with a little rank-seeded jitter. */
function synthRecord(points: number, rank0: number, n: number, salt: number): TeamRecord {
  const games = (n - 1) * 2;
  const drawn = Math.max(4, Math.min(16, 9 + jitter(`${salt}:${rank0}`) - 2));
  let won = Math.round((points - drawn) / 3);
  won = Math.max(0, Math.min(games - drawn, won));
  const lost = games - won - drawn;
  const goalsFor = Math.max(20, Math.round(74 - rank0 * (52 / Math.max(1, n - 1))));
  const goalsAgainst = Math.max(18, Math.round(24 + rank0 * (44 / Math.max(1, n - 1))));
  return { played: games, won, drawn, lost, goalsFor, goalsAgainst, points: 3 * won + drawn };
}

/**
 * Anchor a just-completed league season toward its real final table, scaled by how
 * far the Director has pushed the world off course. Mutates `league.standings` in
 * place; call BEFORE crowning the champion so the real winner is crowned in a
 * passive run.
 */
export function anchorSeasonToReality(state: GameState, league: LeagueState): void {
  const key = leagueKey(league);
  if (!key) return;
  const order = REAL_STANDINGS[key]?.[league.seasonYear];
  if (!order) return;

  const weight = 1 - divergenceFactor(state); // 1 = full reality (passive)
  if (weight <= 0) return;

  const n = league.clubIds.length;
  order.forEach((clubId, rank0) => {
    const rec = league.standings[clubId];
    if (!rec) return; // in the real table but not simulated this season
    const realPts = pointsForRank(rank0, n);
    const real = synthRecord(realPts, rank0, n, league.seasonYear);
    // Blend the simulated record toward the real one by `weight`.
    const blended: TeamRecord = {
      played: rec.played,
      won: Math.round(rec.won * (1 - weight) + real.won * weight),
      drawn: Math.round(rec.drawn * (1 - weight) + real.drawn * weight),
      lost: 0,
      goalsFor: Math.round(rec.goalsFor * (1 - weight) + real.goalsFor * weight),
      goalsAgainst: Math.round(rec.goalsAgainst * (1 - weight) + real.goalsAgainst * weight),
      points: 0,
    };
    blended.won = Math.max(0, Math.min(rec.played, blended.won));
    blended.drawn = Math.max(0, Math.min(rec.played - blended.won, blended.drawn));
    blended.lost = rec.played - blended.won - blended.drawn;
    blended.points = 3 * blended.won + blended.drawn;
    league.standings[clubId] = blended;
  });
}
