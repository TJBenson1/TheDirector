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
    1995: ['man_utd', 'newcastle', 'liverpool', 'aston_villa', 'arsenal', 'everton', 'blackburn', 'spurs', 'nottm_forest', 'west_ham', 'chelsea', 'middlesbrough', 'leeds', 'wimbledon', 'sheffield_wednesday', 'coventry', 'southampton', 'man_city', 'qpr', 'bolton'],
    1996: ['man_utd', 'newcastle', 'arsenal', 'liverpool', 'aston_villa', 'chelsea', 'sheffield_wednesday', 'wimbledon', 'leicester', 'spurs', 'leeds', 'derby', 'blackburn', 'west_ham', 'everton', 'southampton', 'coventry', 'sunderland', 'middlesbrough', 'nottm_forest'],
    1997: ['arsenal', 'man_utd', 'liverpool', 'chelsea', 'leeds', 'blackburn', 'aston_villa', 'west_ham', 'derby', 'leicester', 'coventry', 'southampton', 'newcastle', 'spurs', 'wimbledon', 'sheffield_wednesday', 'everton', 'bolton'],
    1998: ['man_utd', 'arsenal', 'chelsea', 'leeds', 'west_ham', 'aston_villa', 'liverpool', 'derby', 'middlesbrough', 'leicester', 'spurs', 'sheffield_wednesday', 'newcastle', 'everton', 'coventry', 'wimbledon', 'southampton', 'blackburn', 'nottm_forest'],
    1999: ['man_utd', 'arsenal', 'leeds', 'liverpool', 'chelsea', 'aston_villa', 'sunderland', 'leicester', 'west_ham', 'spurs', 'newcastle', 'middlesbrough', 'everton', 'coventry', 'southampton', 'derby', 'bradford', 'wimbledon', 'sheffield_wednesday', 'watford'],
    2000: ['man_utd', 'arsenal', 'liverpool', 'leeds', 'ipswich', 'chelsea', 'sunderland', 'aston_villa', 'charlton', 'southampton', 'newcastle', 'spurs', 'leicester', 'middlesbrough', 'west_ham', 'everton', 'derby', 'man_city', 'coventry', 'bradford'],
    2001: ['arsenal', 'liverpool', 'man_utd', 'newcastle', 'leeds', 'chelsea', 'west_ham', 'aston_villa', 'spurs', 'blackburn', 'southampton', 'middlesbrough', 'fulham', 'charlton', 'everton', 'bolton', 'sunderland', 'ipswich', 'derby', 'leicester'],
    2002: ['man_utd', 'arsenal', 'newcastle', 'chelsea', 'liverpool', 'blackburn', 'everton', 'southampton', 'man_city', 'spurs', 'middlesbrough', 'charlton', 'birmingham', 'fulham', 'leeds', 'aston_villa', 'bolton', 'west_ham', 'west_brom', 'sunderland'],
    2003: ['arsenal', 'chelsea', 'man_utd', 'liverpool', 'newcastle', 'aston_villa', 'charlton', 'bolton', 'fulham', 'birmingham', 'middlesbrough', 'southampton', 'portsmouth', 'spurs', 'blackburn', 'man_city', 'everton', 'leicester', 'leeds', 'wolves'],
    2004: ['chelsea', 'arsenal', 'man_utd', 'everton', 'liverpool', 'bolton', 'middlesbrough', 'man_city', 'spurs', 'aston_villa', 'charlton', 'birmingham', 'fulham', 'newcastle', 'blackburn', 'portsmouth', 'west_brom', 'crystal_palace', 'norwich', 'southampton'],
    2005: ['chelsea', 'man_utd', 'liverpool', 'arsenal', 'spurs', 'blackburn', 'newcastle', 'bolton', 'west_ham', 'wigan', 'everton', 'fulham', 'charlton', 'middlesbrough', 'man_city', 'aston_villa', 'portsmouth', 'birmingham', 'west_brom', 'sunderland'],
    2006: ['man_utd', 'chelsea', 'liverpool', 'arsenal', 'spurs', 'everton', 'bolton', 'reading', 'portsmouth', 'blackburn', 'aston_villa', 'middlesbrough', 'newcastle', 'man_city', 'west_ham', 'fulham', 'wigan', 'sheffield_united', 'charlton', 'watford'],
    2007: ['man_utd', 'chelsea', 'arsenal', 'liverpool', 'everton', 'aston_villa', 'blackburn', 'portsmouth', 'man_city', 'west_ham', 'spurs', 'newcastle', 'middlesbrough', 'wigan', 'sunderland', 'bolton', 'fulham', 'reading', 'birmingham', 'derby'],
    2008: ['man_utd', 'liverpool', 'chelsea', 'arsenal', 'everton', 'aston_villa', 'fulham', 'spurs', 'west_ham', 'man_city', 'wigan', 'stoke', 'bolton', 'portsmouth', 'blackburn', 'sunderland', 'hull', 'newcastle', 'middlesbrough', 'west_brom'],
    2009: ['chelsea', 'man_utd', 'arsenal', 'spurs', 'man_city', 'aston_villa', 'liverpool', 'everton', 'birmingham', 'blackburn', 'stoke', 'fulham', 'sunderland', 'bolton', 'wolves', 'wigan', 'west_ham', 'burnley', 'hull', 'portsmouth'],
    2010: ['man_utd', 'chelsea', 'man_city', 'arsenal', 'spurs', 'liverpool', 'everton', 'fulham', 'aston_villa', 'sunderland', 'west_brom', 'newcastle', 'stoke', 'bolton', 'blackburn', 'wigan', 'wolves', 'birmingham', 'blackpool', 'west_ham'],
    2011: ['man_city', 'man_utd', 'arsenal', 'spurs', 'newcastle', 'chelsea', 'everton', 'liverpool', 'fulham', 'west_brom', 'swansea', 'norwich', 'sunderland', 'stoke', 'wigan', 'aston_villa', 'qpr', 'bolton', 'blackburn', 'wolves'],
    2012: ['man_utd', 'man_city', 'chelsea', 'arsenal', 'spurs', 'everton', 'liverpool', 'west_brom', 'swansea', 'west_ham', 'norwich', 'fulham', 'stoke', 'southampton', 'aston_villa', 'newcastle', 'sunderland', 'wigan', 'reading', 'qpr'],
    2013: ['man_city', 'liverpool', 'chelsea', 'arsenal', 'everton', 'spurs', 'man_utd', 'southampton', 'stoke', 'newcastle', 'crystal_palace', 'swansea', 'west_ham', 'sunderland', 'aston_villa', 'hull', 'west_brom', 'norwich', 'fulham', 'cardiff'],
  },
  // La Liga (Primera División), 2000–01 → 2013–14. Real finishing order; clubs the
  // pack doesn't model that season are omitted (their relative order is kept).
  spanish: {
    2000: ['real_madrid', 'deportivo', 'mallorca', 'barcelona', 'valencia', 'celta', 'villarreal', 'malaga', 'espanyol', 'alaves', 'las_palmas', 'athletic', 'real_sociedad', 'rayo', 'osasuna', 'valladolid', 'zaragoza', 'oviedo', 'racing', 'numancia'],
    2001: ['valencia', 'deportivo', 'real_madrid', 'barcelona', 'celta', 'betis', 'alaves', 'sevilla', 'athletic', 'malaga', 'rayo', 'valladolid', 'real_sociedad', 'espanyol', 'villarreal', 'mallorca', 'osasuna', 'las_palmas', 'zaragoza'],
    2002: ['real_madrid', 'real_sociedad', 'deportivo', 'celta', 'valencia', 'barcelona', 'athletic', 'betis', 'mallorca', 'sevilla', 'osasuna', 'atletico', 'malaga', 'valladolid', 'villarreal', 'racing', 'espanyol', 'recreativo', 'alaves', 'rayo'],
    2003: ['valencia', 'barcelona', 'deportivo', 'real_madrid', 'athletic', 'sevilla', 'atletico', 'villarreal', 'betis', 'malaga', 'mallorca', 'zaragoza', 'osasuna', 'albacete', 'real_sociedad', 'racing', 'espanyol', 'valladolid', 'celta', 'murcia'],
    2004: ['barcelona', 'real_madrid', 'villarreal', 'betis', 'espanyol', 'sevilla', 'valencia', 'deportivo', 'athletic', 'malaga', 'atletico', 'zaragoza', 'getafe', 'real_sociedad', 'osasuna', 'racing', 'mallorca', 'levante', 'numancia', 'albacete'],
    2005: ['barcelona', 'real_madrid', 'valencia', 'osasuna', 'sevilla', 'celta', 'villarreal', 'deportivo', 'getafe', 'atletico', 'zaragoza', 'athletic', 'mallorca', 'betis', 'espanyol', 'real_sociedad', 'racing', 'alaves', 'malaga'],
    2006: ['real_madrid', 'barcelona', 'sevilla', 'valencia', 'villarreal', 'zaragoza', 'atletico', 'recreativo', 'getafe', 'racing', 'espanyol', 'mallorca', 'deportivo', 'osasuna', 'levante', 'betis', 'athletic', 'celta', 'real_sociedad', 'nastic'],
    2007: ['real_madrid', 'villarreal', 'barcelona', 'atletico', 'sevilla', 'racing', 'mallorca', 'almeria', 'deportivo', 'valencia', 'athletic', 'espanyol', 'betis', 'getafe', 'valladolid', 'recreativo', 'osasuna', 'zaragoza', 'murcia', 'levante'],
    2008: ['barcelona', 'real_madrid', 'sevilla', 'atletico', 'villarreal', 'valencia', 'deportivo', 'malaga', 'mallorca', 'espanyol', 'almeria', 'racing', 'athletic', 'osasuna', 'valladolid', 'getafe', 'betis', 'numancia', 'recreativo'],
    2009: ['barcelona', 'real_madrid', 'valencia', 'sevilla', 'mallorca', 'getafe', 'villarreal', 'athletic', 'atletico', 'deportivo', 'espanyol', 'osasuna', 'almeria', 'zaragoza', 'racing', 'malaga', 'valladolid'],
    2010: ['barcelona', 'real_madrid', 'valencia', 'villarreal', 'sevilla', 'athletic', 'atletico', 'espanyol', 'osasuna', 'malaga', 'racing', 'zaragoza', 'levante', 'real_sociedad', 'getafe', 'mallorca', 'deportivo', 'almeria'],
    2011: ['real_madrid', 'barcelona', 'valencia', 'malaga', 'atletico', 'levante', 'osasuna', 'mallorca', 'sevilla', 'athletic', 'getafe', 'real_sociedad', 'betis', 'espanyol', 'rayo', 'zaragoza', 'granada', 'villarreal', 'racing'],
    2012: ['barcelona', 'real_madrid', 'atletico', 'real_sociedad', 'valencia', 'malaga', 'betis', 'rayo', 'sevilla', 'getafe', 'levante', 'athletic', 'espanyol', 'valladolid', 'granada', 'osasuna', 'celta', 'mallorca', 'deportivo', 'zaragoza'],
    2013: ['atletico', 'barcelona', 'real_madrid', 'athletic', 'sevilla', 'villarreal', 'real_sociedad', 'valencia', 'celta', 'levante', 'malaga', 'rayo', 'getafe', 'espanyol', 'granada', 'elche', 'almeria', 'osasuna', 'valladolid', 'betis'],
  },
  // Serie A, 1995–96 → 2007–08. 18-team era to 2003–04, 20-team from 2004–05.
  // 2005–06 is the revised post-Calciopoli table (Juventus placed last, Inter
  // champions); 2006–07 omits Juventus (Serie B).
  italian: {
    1995: ['milan', 'juventus', 'lazio', 'fiorentina', 'roma', 'parma', 'inter', 'sampdoria', 'vicenza', 'cagliari', 'udinese', 'napoli', 'atalanta', 'piacenza', 'bari', 'torino'],
    1996: ['juventus', 'parma', 'inter', 'lazio', 'udinese', 'sampdoria', 'bologna', 'vicenza', 'fiorentina', 'atalanta', 'milan', 'roma', 'napoli', 'cagliari', 'piacenza', 'perugia'],
    1997: ['juventus', 'inter', 'udinese', 'roma', 'fiorentina', 'parma', 'lazio', 'bologna', 'sampdoria', 'milan', 'bari', 'piacenza', 'empoli', 'vicenza', 'brescia', 'atalanta', 'lecce', 'napoli'],
    1998: ['milan', 'lazio', 'fiorentina', 'parma', 'roma', 'juventus', 'udinese', 'inter', 'bologna', 'bari', 'venezia', 'piacenza', 'cagliari', 'perugia', 'sampdoria', 'vicenza', 'empoli'],
    1999: ['lazio', 'juventus', 'milan', 'inter', 'parma', 'roma', 'fiorentina', 'udinese', 'perugia', 'reggina', 'bologna', 'lecce', 'bari', 'torino', 'venezia', 'cagliari', 'piacenza'],
    2000: ['roma', 'juventus', 'lazio', 'parma', 'inter', 'milan', 'atalanta', 'brescia', 'fiorentina', 'bologna', 'perugia', 'udinese', 'lecce', 'reggina', 'vicenza', 'napoli', 'bari'],
    2001: ['juventus', 'roma', 'inter', 'milan', 'chievo', 'lazio', 'bologna', 'perugia', 'atalanta', 'parma', 'torino', 'piacenza', 'brescia', 'udinese', 'lecce', 'fiorentina', 'venezia'],
    2002: ['juventus', 'inter', 'milan', 'lazio', 'parma', 'udinese', 'chievo', 'roma', 'brescia', 'perugia', 'bologna', 'modena', 'empoli', 'atalanta', 'reggina', 'piacenza', 'torino'],
    2003: ['milan', 'roma', 'juventus', 'inter', 'parma', 'lazio', 'udinese', 'sampdoria', 'chievo', 'lecce', 'brescia', 'bologna', 'reggina', 'siena', 'perugia', 'modena', 'empoli'],
    2004: ['juventus', 'milan', 'inter', 'udinese', 'sampdoria', 'palermo', 'messina', 'roma', 'livorno', 'reggina', 'lecce', 'cagliari', 'lazio', 'siena', 'chievo', 'fiorentina', 'bologna', 'parma', 'brescia', 'atalanta'],
    2005: ['inter', 'roma', 'milan', 'chievo', 'palermo', 'livorno', 'parma', 'empoli', 'fiorentina', 'ascoli', 'udinese', 'sampdoria', 'reggina', 'cagliari', 'siena', 'lazio', 'messina', 'lecce', 'juventus'],
    2006: ['inter', 'roma', 'lazio', 'milan', 'palermo', 'fiorentina', 'empoli', 'atalanta', 'sampdoria', 'udinese', 'livorno', 'parma', 'siena', 'catania', 'reggina', 'torino', 'cagliari', 'chievo', 'ascoli', 'messina'],
    2007: ['inter', 'roma', 'juventus', 'fiorentina', 'milan', 'sampdoria', 'udinese', 'napoli', 'atalanta', 'genoa', 'palermo', 'lazio', 'siena', 'cagliari', 'torino', 'reggina', 'catania', 'empoli', 'parma', 'livorno'],
  },
  // Bundesliga, 1997–98 → 2013–14. 18 teams, 34 games throughout.
  german: {
    1997: ['kaiserslautern', 'bayern', 'leverkusen', 'stuttgart', 'schalke', 'hansa', 'werder', 'duisburg', 'hamburg', 'dortmund', 'hertha', 'bochum', 'munich_1860', 'wolfsburg', 'gladbach', 'karlsruhe', 'koln', 'bielefeld'],
    1998: ['bayern', 'leverkusen', 'hertha', 'dortmund', 'kaiserslautern', 'wolfsburg', 'hamburg', 'duisburg', 'munich_1860', 'schalke', 'stuttgart', 'freiburg', 'werder', 'hansa', 'frankfurt', 'nurnberg', 'bochum', 'gladbach'],
    1999: ['bayern', 'leverkusen', 'hamburg', 'munich_1860', 'kaiserslautern', 'hertha', 'wolfsburg', 'stuttgart', 'werder', 'frankfurt', 'dortmund', 'freiburg', 'schalke', 'hansa', 'bielefeld', 'duisburg'],
    2000: ['bayern', 'schalke', 'dortmund', 'leverkusen', 'hertha', 'freiburg', 'werder', 'kaiserslautern', 'wolfsburg', 'koln', 'munich_1860', 'hansa', 'hamburg', 'stuttgart', 'frankfurt', 'bochum'],
    2001: ['dortmund', 'leverkusen', 'bayern', 'hertha', 'schalke', 'werder', 'kaiserslautern', 'stuttgart', 'munich_1860', 'wolfsburg', 'hamburg', 'gladbach', 'hansa', 'nurnberg', 'freiburg', 'koln'],
    2002: ['bayern', 'stuttgart', 'dortmund', 'hamburg', 'hertha', 'werder', 'schalke', 'wolfsburg', 'bochum', 'munich_1860', 'hannover', 'gladbach', 'hansa', 'kaiserslautern', 'leverkusen', 'bielefeld', 'nurnberg'],
    2003: ['werder', 'bayern', 'leverkusen', 'stuttgart', 'bochum', 'dortmund', 'schalke', 'hamburg', 'hansa', 'wolfsburg', 'gladbach', 'hertha', 'kaiserslautern', 'freiburg', 'hannover', 'frankfurt', 'munich_1860', 'koln'],
    2004: ['bayern', 'schalke', 'werder', 'hertha', 'stuttgart', 'leverkusen', 'dortmund', 'hamburg', 'wolfsburg', 'hannover', 'mainz', 'kaiserslautern', 'bielefeld', 'nurnberg', 'gladbach', 'bochum', 'hansa', 'freiburg'],
    2005: ['bayern', 'werder', 'hamburg', 'schalke', 'leverkusen', 'hertha', 'dortmund', 'nurnberg', 'stuttgart', 'gladbach', 'mainz', 'hannover', 'bielefeld', 'frankfurt', 'wolfsburg', 'kaiserslautern', 'koln', 'duisburg'],
    2006: ['stuttgart', 'schalke', 'werder', 'bayern', 'leverkusen', 'nurnberg', 'hamburg', 'bochum', 'dortmund', 'hertha', 'hannover', 'bielefeld', 'frankfurt', 'wolfsburg', 'mainz', 'gladbach'],
    2007: ['bayern', 'werder', 'schalke', 'hamburg', 'wolfsburg', 'stuttgart', 'leverkusen', 'hannover', 'frankfurt', 'hertha', 'karlsruhe', 'bochum', 'dortmund', 'bielefeld', 'nurnberg', 'hansa', 'duisburg'],
    2008: ['wolfsburg', 'bayern', 'stuttgart', 'hertha', 'hamburg', 'dortmund', 'hoffenheim', 'schalke', 'leverkusen', 'werder', 'hannover', 'koln', 'frankfurt', 'bochum', 'gladbach', 'karlsruhe', 'bielefeld'],
    2009: ['bayern', 'schalke', 'werder', 'leverkusen', 'dortmund', 'stuttgart', 'hamburg', 'wolfsburg', 'mainz', 'frankfurt', 'hoffenheim', 'gladbach', 'koln', 'freiburg', 'hannover', 'nurnberg', 'bochum', 'hertha'],
    2010: ['dortmund', 'leverkusen', 'bayern', 'hannover', 'mainz', 'nurnberg', 'kaiserslautern', 'hamburg', 'freiburg', 'koln', 'hoffenheim', 'stuttgart', 'werder', 'schalke', 'wolfsburg', 'gladbach', 'frankfurt'],
    2011: ['dortmund', 'bayern', 'schalke', 'gladbach', 'leverkusen', 'stuttgart', 'hannover', 'wolfsburg', 'werder', 'nurnberg', 'hoffenheim', 'freiburg', 'mainz', 'augsburg', 'hamburg', 'hertha', 'koln', 'kaiserslautern'],
    2012: ['bayern', 'dortmund', 'leverkusen', 'schalke', 'freiburg', 'frankfurt', 'hamburg', 'gladbach', 'hannover', 'nurnberg', 'wolfsburg', 'stuttgart', 'mainz', 'werder', 'augsburg', 'hoffenheim', 'dusseldorf', 'furth'],
    2013: ['bayern', 'dortmund', 'schalke', 'leverkusen', 'wolfsburg', 'gladbach', 'mainz', 'augsburg', 'hoffenheim', 'hannover', 'hertha', 'werder', 'frankfurt', 'freiburg', 'stuttgart', 'hamburg', 'nurnberg'],
  },
};

/** Realistic Premier-League points by finishing rank (20-team, 38-game league).
 *  Strictly decreasing so an anchored table has a definite order. Champion ~88
 *  down to a ~24-point bottom side. This is the SHAPE reused (normalised) for every
 *  league; the champion/wooden-spoon anchors below scale it per league and size. */
const PL_POINTS_BY_RANK = [88, 80, 74, 69, 64, 60, 56, 53, 50, 48, 45, 43, 41, 39, 37, 35, 33, 30, 27, 24];
/** The PL curve normalised to 1.0 (champion) … 0.0 (bottom) — a league-agnostic
 *  shape re-scaled to each competition's realistic points spread. */
const PL_SHAPE = PL_POINTS_BY_RANK.map((p) => (p - 24) / (88 - 24));

/** Points-per-game for the champion and the wooden-spoon side, by league. The
 *  spread is what makes an anchored table read true to its competition: La Liga's
 *  Barça/Real routinely clear 90+ over 38, Serie A and the 34-game Bundesliga peak
 *  lower. Multiplying by games played makes an 18-team (34-game) season and a
 *  20-team (38-game) one each land at realistic totals off one curve. */
const CHAMP_PPG: Record<string, number> = { english: 2.32, spanish: 2.42, italian: 2.30, german: 2.29 };
const BOTTOM_PPG: Record<string, number> = { english: 0.63, spanish: 0.70, italian: 0.68, german: 0.62 };

/** League key for the club's competition, or null if we don't anchor it. */
function leagueKey(league: LeagueState): string | null {
  const id = league.id.toLowerCase();
  if (id.includes('england') || id.includes('premier') || id.includes('epl') || id.includes('eng')) return 'english';
  if (id.includes('esp') || id.includes('liga') || id.includes('spain')) return 'spanish';
  if (id.includes('ita') || id.includes('serie') || id.includes('italy')) return 'italian';
  if (id.includes('ger') || id.includes('bundes') || id.includes('germany')) return 'german';
  return null;
}

/** Target points for a finishing rank in an n-club league, on that league's own
 *  realistic spread. The normalised PL shape is interpolated across the league's
 *  size and mapped onto its champion…bottom band, so every competition anchors to
 *  a table that reads true (a Bundesliga champion on ~78, not a rescaled 88). */
function pointsForRank(rank0: number, n: number, key: string): number {
  const games = (n - 1) * 2;
  const champ = Math.round(games * (CHAMP_PPG[key] ?? 2.32));
  const bottom = Math.round(games * (BOTTOM_PPG[key] ?? 0.63));
  const t = n <= 1 ? 0 : rank0 / (n - 1); // 0 (champion) … 1 (bottom)
  const idx = t * (PL_SHAPE.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(PL_SHAPE.length - 1, Math.ceil(idx));
  const shape = PL_SHAPE[lo]! + (PL_SHAPE[hi]! - PL_SHAPE[lo]!) * (idx - lo);
  return Math.round(bottom + shape * (champ - bottom));
}

/** Plausible W/D/L/goals for a target points total at a finishing rank over
 *  `games` matches, so the displayed record is internally consistent
 *  (points = 3·W + D). Draws and goals scale with games so a mid-season record
 *  reads right, not a full-season one crammed into 23 games. */
function synthRecord(points: number, rank0: number, n: number, salt: number, games: number): TeamRecord {
  const full = (n - 1) * 2;
  const frac = full > 0 ? games / full : 1;
  const drawn = Math.max(0, Math.min(games, Math.round((9 + jitter(`${salt}:${rank0}`) - 2) * frac)));
  let won = Math.round((points - drawn) / 3);
  won = Math.max(0, Math.min(games - drawn, won));
  const lost = games - won - drawn;
  const goalsFor = Math.max(0, Math.round((74 - rank0 * (52 / Math.max(1, n - 1))) * frac));
  const goalsAgainst = Math.max(0, Math.round((24 + rank0 * (44 / Math.max(1, n - 1))) * frac));
  return { played: games, won, drawn, lost, goalsFor, goalsAgainst, points: 3 * won + drawn };
}

/**
 * Anchor a league season toward its real table, scaled by how far the Director has
 * pushed the world off course (divergence) AND, mid-season, by how far the campaign
 * has run (`progress` 0→1). Called every month so the table TRENDS toward reality
 * as the season unfolds — no more a passive Spurs top at Christmas that snaps to a
 * real Chelsea title in June — and at finalisation with progress 1 (identical to
 * before, so the crowned champion and end-of-season table are unchanged). The real
 * target is pro-rated to games actually played. Mutates `league.standings`.
 */
export function anchorSeasonToReality(state: GameState, league: LeagueState, progress = 1): void {
  const key = leagueKey(league);
  if (!key) return;
  const order = REAL_STANDINGS[key]?.[league.seasonYear];
  if (!order) return;

  const prog = Math.max(0, Math.min(1, progress));
  if (prog <= 0) return;
  const div = divergenceFactor(state);

  const n = league.clubIds.length;
  const full = (n - 1) * 2;
  order.forEach((clubId, rank0) => {
    const rec = league.standings[clubId];
    if (!rec || rec.played === 0) return; // not simulated / not started
    // The FIELD stays anchored to reality however far the Director has pushed the
    // world — buying players for YOUR club must not free-fall Man Utd to 8th or
    // Newcastle to 7th. Only the user's OWN club floats off its real result,
    // scaled by divergence (passive = fully anchored, so passive reproduces the
    // real table exactly; a title-builder rises as far as his real squad warrants,
    // displacing the field minimally rather than scrambling it).
    const weight = (clubId === state.playerClub ? 1 - div : 1) * prog;
    if (weight <= 0) return;
    // The real full-season points, pro-rated to the games played so far.
    const realPts = pointsForRank(rank0, n, key) * (full > 0 ? rec.played / full : 1);
    const real = synthRecord(realPts, rank0, n, league.seasonYear, rec.played);
    // Blend the simulated record toward the (pro-rated) real one by `weight`.
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
