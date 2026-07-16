/**
 * League seed data — SKELETON (M2). Migrates to @director/data at M3.
 *
 * The player's domestic division, seeded from the real 1999–2000 Premier League
 * (§17.2: "sane tables from real 1999 data"). `strength` is an abstracted
 * squad-strength rating (0–100); at M3 it will be *derived* from the curated
 * player squads rather than authored here. It is calibrated so the season sim
 * reproduces a plausible final table (Man Utd champions, the promoted/weak
 * sides in the relegation places), verified by season.test.ts.
 */

import type { ClubId, YearMonth } from './types.js';

export interface LeagueClubSeed {
  id: ClubId;
  name: string;
  prestige: number;
  strength: number;
}

export interface LeagueSeed {
  id: string;
  name: string;
  /** Season start (July of the opening year). */
  season: YearMonth;
  clubs: LeagueClubSeed[];
}

/** England, 1999–2000 Premier League. Final real table informed the ordering. */
export const ENGLAND_1999: LeagueSeed = {
  id: 'eng-1',
  name: 'English Premier League',
  season: '1999-07',
  clubs: [
    { id: 'man_utd', name: 'Manchester United', prestige: 92, strength: 90 },
    { id: 'arsenal', name: 'Arsenal', prestige: 82, strength: 78 },
    { id: 'leeds', name: 'Leeds United', prestige: 70, strength: 75 },
    { id: 'liverpool', name: 'Liverpool', prestige: 83, strength: 74 },
    { id: 'chelsea', name: 'Chelsea', prestige: 78, strength: 73 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 66, strength: 64 },
    { id: 'sunderland', name: 'Sunderland', prestige: 58, strength: 62 },
    { id: 'leicester', name: 'Leicester City', prestige: 58, strength: 61 },
    { id: 'west_ham', name: 'West Ham United', prestige: 62, strength: 61 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 72, strength: 60 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 70, strength: 59 },
    { id: 'middlesbrough', name: 'Middlesbrough', prestige: 56, strength: 58 },
    { id: 'everton', name: 'Everton', prestige: 64, strength: 57 },
    { id: 'coventry', name: 'Coventry City', prestige: 50, strength: 52 },
    { id: 'southampton', name: 'Southampton', prestige: 50, strength: 52 },
    { id: 'derby', name: 'Derby County', prestige: 50, strength: 49 },
    { id: 'bradford', name: 'Bradford City', prestige: 44, strength: 47 },
    { id: 'wimbledon', name: 'Wimbledon', prestige: 48, strength: 46 },
    { id: 'sheffield_wednesday', name: 'Sheffield Wednesday', prestige: 50, strength: 45 },
    { id: 'watford', name: 'Watford', prestige: 42, strength: 42 },
  ],
};

/** Spain, La Liga (2000-era). Deportivo were the 1999–2000 champions. */
export const SPAIN_2000: LeagueSeed = {
  id: 'esp-1',
  name: 'La Liga',
  season: '2000-07',
  clubs: [
    { id: 'real_madrid', name: 'Real Madrid', prestige: 94, strength: 90 },
    { id: 'barcelona', name: 'Barcelona', prestige: 90, strength: 86 },
    { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 74, strength: 82 },
    { id: 'valencia', name: 'Valencia', prestige: 78, strength: 84 },
    { id: 'celta', name: 'Celta Vigo', prestige: 64, strength: 68 },
    { id: 'mallorca', name: 'RCD Mallorca', prestige: 60, strength: 66 },
    { id: 'athletic', name: 'Athletic Bilbao', prestige: 68, strength: 64 },
    { id: 'real_sociedad', name: 'Real Sociedad', prestige: 64, strength: 62 },
    { id: 'espanyol', name: 'Espanyol', prestige: 60, strength: 60 },
    { id: 'betis', name: 'Real Betis', prestige: 62, strength: 60 },
    { id: 'malaga', name: 'Málaga', prestige: 56, strength: 59 },
    { id: 'zaragoza', name: 'Real Zaragoza', prestige: 60, strength: 61 },
    { id: 'villarreal', name: 'Villarreal', prestige: 54, strength: 57 },
    { id: 'alaves', name: 'Deportivo Alavés', prestige: 52, strength: 58 },
    { id: 'osasuna', name: 'Osasuna', prestige: 52, strength: 55 },
    { id: 'valladolid', name: 'Real Valladolid', prestige: 52, strength: 54 },
    { id: 'rayo', name: 'Rayo Vallecano', prestige: 50, strength: 56 },
    { id: 'las_palmas', name: 'Las Palmas', prestige: 48, strength: 52 },
    { id: 'numancia', name: 'Numancia', prestige: 46, strength: 50 },
    { id: 'oviedo', name: 'Real Oviedo', prestige: 48, strength: 50 },
  ],
};

/** England, 2013–14 Premier League — the post-Ferguson season. Strengths are
 *  authored anchors; where a curated real squad exists (the top clubs) the sim
 *  re-derives strength from it at squad build. Ordering informed by the real
 *  final table (City champions; United collapsed to 7th under Moyes). */
export const ENGLAND_2013: LeagueSeed = {
  id: 'eng-2013',
  name: 'English Premier League',
  season: '2013-07',
  clubs: [
    { id: 'man_city', name: 'Manchester City', prestige: 85, strength: 86 },
    { id: 'chelsea', name: 'Chelsea', prestige: 86, strength: 85 },
    { id: 'man_utd', name: 'Manchester United', prestige: 90, strength: 83 },
    { id: 'arsenal', name: 'Arsenal', prestige: 82, strength: 82 },
    { id: 'liverpool', name: 'Liverpool', prestige: 82, strength: 81 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 78, strength: 79 },
    { id: 'everton', name: 'Everton', prestige: 72, strength: 77 },
    { id: 'southampton', name: 'Southampton', prestige: 64, strength: 72 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 68, strength: 70 },
    { id: 'swansea', name: 'Swansea City', prestige: 60, strength: 67 },
    { id: 'stoke', name: 'Stoke City', prestige: 58, strength: 65 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 62, strength: 63 },
    { id: 'west_ham', name: 'West Ham United', prestige: 62, strength: 63 },
    { id: 'hull', name: 'Hull City', prestige: 50, strength: 60 },
    { id: 'west_brom', name: 'West Bromwich Albion', prestige: 54, strength: 61 },
    { id: 'crystal_palace', name: 'Crystal Palace', prestige: 50, strength: 58 },
    { id: 'norwich', name: 'Norwich City', prestige: 52, strength: 59 },
    { id: 'fulham', name: 'Fulham', prestige: 56, strength: 57 },
    { id: 'cardiff', name: 'Cardiff City', prestige: 48, strength: 55 },
    { id: 'sunderland', name: 'Sunderland', prestige: 56, strength: 58 },
  ],
};

/** England, 2004–05 Premier League — Mourinho's first title, Arsenal's
 *  Invincibles the season before. Ordering informed by the real final table. */
export const ENGLAND_2004: LeagueSeed = {
  id: 'eng-2004',
  name: 'English Premier League',
  season: '2004-07',
  clubs: [
    { id: 'chelsea', name: 'Chelsea', prestige: 84, strength: 88 },
    { id: 'arsenal', name: 'Arsenal', prestige: 86, strength: 86 },
    { id: 'man_utd', name: 'Manchester United', prestige: 88, strength: 85 },
    { id: 'everton', name: 'Everton', prestige: 66, strength: 74 },
    { id: 'liverpool', name: 'Liverpool', prestige: 82, strength: 82 },
    { id: 'bolton', name: 'Bolton Wanderers', prestige: 58, strength: 70 },
    { id: 'middlesbrough', name: 'Middlesbrough', prestige: 60, strength: 71 },
    { id: 'man_city', name: 'Manchester City', prestige: 64, strength: 69 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 70, strength: 72 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 62, strength: 67 },
    { id: 'charlton', name: 'Charlton Athletic', prestige: 54, strength: 65 },
    { id: 'birmingham', name: 'Birmingham City', prestige: 54, strength: 64 },
    { id: 'fulham', name: 'Fulham', prestige: 58, strength: 63 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 68, strength: 70 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 58, strength: 64 },
    { id: 'portsmouth', name: 'Portsmouth', prestige: 52, strength: 61 },
    { id: 'west_brom', name: 'West Bromwich Albion', prestige: 50, strength: 58 },
    { id: 'crystal_palace', name: 'Crystal Palace', prestige: 48, strength: 57 },
    { id: 'norwich', name: 'Norwich City', prestige: 48, strength: 56 },
    { id: 'southampton', name: 'Southampton', prestige: 54, strength: 60 },
  ],
};

/** England, 2001–02 Premier League — Arsenal's Double; Liverpool fresh off the
 *  treble; Leeds still a force. Ordering informed by the real final table. */
export const ENGLAND_2001: LeagueSeed = {
  id: 'eng-2001',
  name: 'English Premier League',
  season: '2001-07',
  clubs: [
    { id: 'arsenal', name: 'Arsenal', prestige: 84, strength: 86 },
    { id: 'liverpool', name: 'Liverpool', prestige: 82, strength: 85 },
    { id: 'man_utd', name: 'Manchester United', prestige: 88, strength: 87 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 70, strength: 79 },
    { id: 'leeds', name: 'Leeds United', prestige: 74, strength: 82 },
    { id: 'chelsea', name: 'Chelsea', prestige: 74, strength: 80 },
    { id: 'west_ham', name: 'West Ham United', prestige: 62, strength: 71 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 64, strength: 70 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 68, strength: 71 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 58, strength: 68 },
    { id: 'southampton', name: 'Southampton', prestige: 56, strength: 66 },
    { id: 'middlesbrough', name: 'Middlesbrough', prestige: 58, strength: 65 },
    { id: 'fulham', name: 'Fulham', prestige: 56, strength: 64 },
    { id: 'charlton', name: 'Charlton Athletic', prestige: 52, strength: 63 },
    { id: 'everton', name: 'Everton', prestige: 62, strength: 64 },
    { id: 'bolton', name: 'Bolton Wanderers', prestige: 52, strength: 61 },
    { id: 'sunderland', name: 'Sunderland', prestige: 56, strength: 62 },
    { id: 'ipswich', name: 'Ipswich Town', prestige: 50, strength: 60 },
    // Man City were a season from the top flight in 2001 (promoted 2002); included
    // a year early and weak so their takeover-era arc can lift them into the title
    // race, as it really did, rather than leaving them stranded in the lower leagues.
    { id: 'man_city', name: 'Manchester City', prestige: 62, strength: 62 },
    { id: 'leicester', name: 'Leicester City', prestige: 52, strength: 59 },
  ],
};

/** Italy, Serie A 1995–96 — "il campionato più bello del mondo". Milan were the
 *  champions; Juventus (reigning champions, about to win the Champions League)
 *  chase them. 18 clubs, as Serie A was then. Ordering follows the real table. */
export const ITALY_1995: LeagueSeed = {
  id: 'ita-1',
  name: 'Serie A',
  season: '1995-07',
  clubs: [
    { id: 'milan', name: 'AC Milan', prestige: 90, strength: 88 },
    { id: 'juventus', name: 'Juventus', prestige: 88, strength: 87 },
    { id: 'fiorentina', name: 'Fiorentina', prestige: 74, strength: 81 },
    { id: 'lazio', name: 'Lazio', prestige: 78, strength: 81 },
    { id: 'inter', name: 'Internazionale', prestige: 84, strength: 80 },
    { id: 'roma', name: 'AS Roma', prestige: 78, strength: 79 },
    { id: 'parma', name: 'Parma', prestige: 76, strength: 80 },
    { id: 'sampdoria', name: 'Sampdoria', prestige: 70, strength: 77 },
    { id: 'vicenza', name: 'Vicenza', prestige: 56, strength: 68 },
    { id: 'napoli', name: 'Napoli', prestige: 68, strength: 70 },
    { id: 'atalanta', name: 'Atalanta', prestige: 58, strength: 66 },
    { id: 'cagliari', name: 'Cagliari', prestige: 56, strength: 66 },
    { id: 'udinese', name: 'Udinese', prestige: 58, strength: 65 },
    { id: 'torino', name: 'Torino', prestige: 60, strength: 63 },
    { id: 'cremonese', name: 'Cremonese', prestige: 48, strength: 61 },
    { id: 'piacenza', name: 'Piacenza', prestige: 46, strength: 59 },
    { id: 'padova', name: 'Padova', prestige: 46, strength: 56 },
    { id: 'bari', name: 'Bari', prestige: 48, strength: 56 },
  ],
};

/** Serie A, 1998–99 — Il Fenomeno's Inter, Zaccheroni's champion Milan, Eriksson's
 *  Lazio and the Parmalat-funded Parma. Ordering follows the real final table. */
export const ITALY_1998: LeagueSeed = {
  id: 'ita-1998',
  name: 'Serie A',
  season: '1998-07',
  clubs: [
    { id: 'milan', name: 'AC Milan', prestige: 88, strength: 85 },
    { id: 'lazio', name: 'Lazio', prestige: 82, strength: 84 },
    { id: 'fiorentina', name: 'Fiorentina', prestige: 76, strength: 82 },
    { id: 'parma', name: 'Parma', prestige: 80, strength: 83 },
    { id: 'juventus', name: 'Juventus', prestige: 86, strength: 84 },
    { id: 'inter', name: 'Internazionale', prestige: 85, strength: 84 },
    { id: 'roma', name: 'AS Roma', prestige: 78, strength: 80 },
    { id: 'bologna', name: 'Bologna', prestige: 62, strength: 74 },
    { id: 'udinese', name: 'Udinese', prestige: 60, strength: 73 },
    { id: 'sampdoria', name: 'Sampdoria', prestige: 66, strength: 70 },
    { id: 'piacenza', name: 'Piacenza', prestige: 48, strength: 66 },
    { id: 'perugia', name: 'Perugia', prestige: 52, strength: 67 },
    { id: 'bari', name: 'Bari', prestige: 50, strength: 66 },
    { id: 'cagliari', name: 'Cagliari', prestige: 54, strength: 66 },
    { id: 'venezia', name: 'Venezia', prestige: 46, strength: 63 },
    { id: 'vicenza', name: 'Vicenza', prestige: 54, strength: 65 },
    { id: 'salernitana', name: 'Salernitana', prestige: 44, strength: 61 },
    { id: 'empoli', name: 'Empoli', prestige: 44, strength: 61 },
  ],
};

/** La Liga, 2003–04 — Benítez's champion Valencia, Rijkaard's reborn Barça, the
 *  galáctico Real. 20 clubs; ordering follows the real final table. */
export const SPAIN_2003: LeagueSeed = {
  id: 'esp-2003',
  name: 'La Liga',
  season: '2003-07',
  clubs: [
    { id: 'valencia', name: 'Valencia', prestige: 82, strength: 86 },
    { id: 'barcelona', name: 'Barcelona', prestige: 88, strength: 85 },
    { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 78, strength: 83 },
    { id: 'real_madrid', name: 'Real Madrid', prestige: 92, strength: 88 },
    { id: 'athletic', name: 'Athletic Bilbao', prestige: 66, strength: 74 },
    { id: 'sevilla', name: 'Sevilla', prestige: 66, strength: 76 },
    { id: 'atletico', name: 'Atlético Madrid', prestige: 72, strength: 76 },
    { id: 'villarreal', name: 'Villarreal', prestige: 62, strength: 75 },
    { id: 'malaga', name: 'Málaga', prestige: 58, strength: 72 },
    { id: 'betis', name: 'Real Betis', prestige: 64, strength: 73 },
    { id: 'osasuna', name: 'Osasuna', prestige: 54, strength: 70 },
    { id: 'zaragoza', name: 'Real Zaragoza', prestige: 60, strength: 72 },
    { id: 'mallorca', name: 'RCD Mallorca', prestige: 58, strength: 71 },
    { id: 'real_sociedad', name: 'Real Sociedad', prestige: 66, strength: 78 },
    { id: 'racing', name: 'Racing Santander', prestige: 50, strength: 68 },
    { id: 'espanyol', name: 'Espanyol', prestige: 58, strength: 70 },
    { id: 'albacete', name: 'Albacete', prestige: 44, strength: 65 },
    { id: 'valladolid', name: 'Real Valladolid', prestige: 50, strength: 67 },
    { id: 'celta', name: 'Celta Vigo', prestige: 60, strength: 71 },
    { id: 'murcia', name: 'Real Murcia', prestige: 44, strength: 64 },
  ],
};

/** Bundesliga, 2009–10 — van Gaal's double-winning Bayern, before Klopp's Dortmund
 *  rose. 18 clubs; ordering follows the real final table. */
export const GERMANY_2009: LeagueSeed = {
  id: 'ger-2009',
  name: 'Bundesliga',
  season: '2009-07',
  clubs: [
    { id: 'bayern', name: 'Bayern München', prestige: 90, strength: 87 },
    { id: 'schalke', name: 'Schalke 04', prestige: 70, strength: 80 },
    { id: 'werder', name: 'Werder Bremen', prestige: 68, strength: 80 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 70, strength: 80 },
    { id: 'dortmund', name: 'Borussia Dortmund', prestige: 74, strength: 79 },
    { id: 'stuttgart', name: 'VfB Stuttgart', prestige: 64, strength: 77 },
    { id: 'hamburg', name: 'Hamburger SV', prestige: 66, strength: 78 },
    { id: 'wolfsburg', name: 'VfL Wolfsburg', prestige: 64, strength: 79 },
    { id: 'mainz', name: 'Mainz 05', prestige: 50, strength: 71 },
    { id: 'frankfurt', name: 'Eintracht Frankfurt', prestige: 56, strength: 72 },
    { id: 'hoffenheim', name: 'Hoffenheim', prestige: 54, strength: 74 },
    { id: 'freiburg', name: 'SC Freiburg', prestige: 50, strength: 70 },
    { id: 'koln', name: '1. FC Köln', prestige: 58, strength: 72 },
    { id: 'gladbach', name: 'Borussia Mönchengladbach', prestige: 60, strength: 71 },
    { id: 'bochum', name: 'VfL Bochum', prestige: 48, strength: 68 },
    { id: 'hannover', name: 'Hannover 96', prestige: 54, strength: 70 },
    { id: 'nurnberg', name: '1. FC Nürnberg', prestige: 54, strength: 70 },
    { id: 'hertha', name: 'Hertha BSC', prestige: 58, strength: 69 },
  ],
};

/** Bundesliga, 2012–13 — Heynckes's treble Bayern and Klopp's Wembley-final
 *  Dortmund at their shared peak. 18 clubs; ordering follows the real table. */
export const GERMANY_2012: LeagueSeed = {
  id: 'ger-2012',
  name: 'Bundesliga',
  season: '2012-07',
  clubs: [
    { id: 'bayern', name: 'Bayern München', prestige: 92, strength: 91 },
    { id: 'dortmund', name: 'Borussia Dortmund', prestige: 84, strength: 86 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 72, strength: 81 },
    { id: 'schalke', name: 'Schalke 04', prestige: 72, strength: 80 },
    { id: 'frankfurt', name: 'Eintracht Frankfurt', prestige: 58, strength: 74 },
    { id: 'freiburg', name: 'SC Freiburg', prestige: 52, strength: 73 },
    { id: 'hamburg', name: 'Hamburger SV', prestige: 62, strength: 74 },
    { id: 'hannover', name: 'Hannover 96', prestige: 54, strength: 74 },
    { id: 'nurnberg', name: '1. FC Nürnberg', prestige: 54, strength: 73 },
    { id: 'mainz', name: 'Mainz 05', prestige: 54, strength: 73 },
    { id: 'gladbach', name: 'Borussia Mönchengladbach', prestige: 62, strength: 76 },
    { id: 'wolfsburg', name: 'VfL Wolfsburg', prestige: 62, strength: 75 },
    { id: 'stuttgart', name: 'VfB Stuttgart', prestige: 62, strength: 74 },
    { id: 'werder', name: 'Werder Bremen', prestige: 62, strength: 73 },
    { id: 'augsburg', name: 'FC Augsburg', prestige: 48, strength: 70 },
    { id: 'hoffenheim', name: 'Hoffenheim', prestige: 52, strength: 71 },
    { id: 'furth', name: 'Greuther Fürth', prestige: 44, strength: 67 },
    { id: 'dusseldorf', name: 'Fortuna Düsseldorf', prestige: 46, strength: 68 },
  ],
};

/** Bundesliga, 1997–98 — the reigning European champions Dortmund (a fading, ageing
 *  side domestically), Bayern, and the fairytale champions Kaiserslautern, promoted
 *  and crowned in one season. 18 clubs; ordering approximates the real final table. */
export const GERMANY_1997: LeagueSeed = {
  id: 'ger-1997',
  name: 'Bundesliga',
  season: '1997-07',
  clubs: [
    { id: 'kaiserslautern', name: '1. FC Kaiserslautern', prestige: 58, strength: 82 },
    { id: 'bayern', name: 'Bayern München', prestige: 88, strength: 85 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 66, strength: 82 },
    { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80, strength: 83 },
    { id: 'stuttgart', name: 'VfB Stuttgart', prestige: 62, strength: 80 },
    { id: 'schalke', name: 'Schalke 04', prestige: 64, strength: 79 },
    { id: 'werder', name: 'Werder Bremen', prestige: 62, strength: 76 },
    { id: 'hamburg', name: 'Hamburger SV', prestige: 62, strength: 76 },
    { id: 'munich_1860', name: '1860 München', prestige: 52, strength: 74 },
    { id: 'wolfsburg', name: 'VfL Wolfsburg', prestige: 52, strength: 72 },
    { id: 'gladbach', name: 'Borussia Mönchengladbach', prestige: 60, strength: 73 },
    { id: 'koln', name: '1. FC Köln', prestige: 58, strength: 72 },
    { id: 'hertha', name: 'Hertha BSC', prestige: 56, strength: 71 },
    { id: 'bochum', name: 'VfL Bochum', prestige: 48, strength: 70 },
    { id: 'duisburg', name: 'MSV Duisburg', prestige: 46, strength: 70 },
    { id: 'karlsruhe', name: 'Karlsruher SC', prestige: 50, strength: 70 },
    { id: 'bielefeld', name: 'Arminia Bielefeld', prestige: 44, strength: 68 },
    { id: 'hansa', name: 'Hansa Rostock', prestige: 48, strength: 69 },
  ],
};

/** Bundesliga, 1998–99 — Hitzfeld's Bayern march to the title (and the 1999 European
 *  Cup final), Leverkusen and Dortmund chasing. 18 clubs; ordering approximates the
 *  real final table. */
export const GERMANY_1998: LeagueSeed = {
  id: 'ger-1998',
  name: 'Bundesliga',
  season: '1998-07',
  clubs: [
    { id: 'bayern', name: 'Bayern München', prestige: 90, strength: 88 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 68, strength: 82 },
    { id: 'dortmund', name: 'Borussia Dortmund', prestige: 80, strength: 82 },
    { id: 'hertha', name: 'Hertha BSC', prestige: 58, strength: 79 },
    { id: 'werder', name: 'Werder Bremen', prestige: 62, strength: 78 },
    { id: 'stuttgart', name: 'VfB Stuttgart', prestige: 62, strength: 78 },
    { id: 'schalke', name: 'Schalke 04', prestige: 66, strength: 80 },
    { id: 'kaiserslautern', name: '1. FC Kaiserslautern', prestige: 58, strength: 78 },
    { id: 'munich_1860', name: '1860 München', prestige: 52, strength: 75 },
    { id: 'hamburg', name: 'Hamburger SV', prestige: 62, strength: 77 },
    { id: 'wolfsburg', name: 'VfL Wolfsburg', prestige: 54, strength: 73 },
    { id: 'gladbach', name: 'Borussia Mönchengladbach', prestige: 58, strength: 72 },
    { id: 'freiburg', name: 'SC Freiburg', prestige: 50, strength: 72 },
    { id: 'frankfurt', name: 'Eintracht Frankfurt', prestige: 56, strength: 72 },
    { id: 'hansa', name: 'Hansa Rostock', prestige: 48, strength: 71 },
    { id: 'bochum', name: 'VfL Bochum', prestige: 48, strength: 70 },
    { id: 'nurnberg', name: '1. FC Nürnberg', prestige: 52, strength: 70 },
    { id: 'duisburg', name: 'MSV Duisburg', prestige: 46, strength: 68 },
  ],
};

/** La Liga, 2014–15 — Luis Enrique's treble-winning MSN Barça, the BBC Real, and
 *  Simeone's champion Atlético. 20 clubs; ordering follows the real final table. */
export const SPAIN_2014: LeagueSeed = {
  id: 'esp-2014',
  name: 'La Liga',
  season: '2014-07',
  clubs: [
    { id: 'barcelona', name: 'Barcelona', prestige: 92, strength: 91 },
    { id: 'real_madrid', name: 'Real Madrid', prestige: 92, strength: 90 },
    { id: 'atletico', name: 'Atlético Madrid', prestige: 82, strength: 86 },
    { id: 'valencia', name: 'Valencia', prestige: 72, strength: 80 },
    { id: 'sevilla', name: 'Sevilla', prestige: 72, strength: 82 },
    { id: 'villarreal', name: 'Villarreal', prestige: 66, strength: 78 },
    { id: 'athletic', name: 'Athletic Bilbao', prestige: 66, strength: 77 },
    { id: 'celta', name: 'Celta Vigo', prestige: 58, strength: 74 },
    { id: 'malaga', name: 'Málaga', prestige: 58, strength: 74 },
    { id: 'espanyol', name: 'Espanyol', prestige: 58, strength: 73 },
    { id: 'rayo', name: 'Rayo Vallecano', prestige: 50, strength: 70 },
    { id: 'real_sociedad', name: 'Real Sociedad', prestige: 62, strength: 75 },
    { id: 'elche', name: 'Elche', prestige: 44, strength: 67 },
    { id: 'levante', name: 'Levante', prestige: 48, strength: 69 },
    { id: 'getafe', name: 'Getafe', prestige: 50, strength: 70 },
    { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 56, strength: 70 },
    { id: 'granada', name: 'Granada', prestige: 46, strength: 68 },
    { id: 'eibar', name: 'Eibar', prestige: 44, strength: 68 },
    { id: 'almeria', name: 'Almería', prestige: 44, strength: 66 },
    { id: 'cordoba', name: 'Córdoba', prestige: 42, strength: 64 },
  ],
};

/** La Liga, 2006–07 — Capello's rebuilding Real, Rijkaard's fading champions, and
 *  Juande Ramos's Sevilla. 20 clubs; ordering follows the real final table. */
export const SPAIN_2006: LeagueSeed = {
  id: 'esp-2006',
  name: 'La Liga',
  season: '2006-07',
  clubs: [
    { id: 'real_madrid', name: 'Real Madrid', prestige: 90, strength: 87 },
    { id: 'barcelona', name: 'Barcelona', prestige: 90, strength: 87 },
    { id: 'sevilla', name: 'Sevilla', prestige: 74, strength: 84 },
    { id: 'valencia', name: 'Valencia', prestige: 78, strength: 83 },
    { id: 'villarreal', name: 'Villarreal', prestige: 68, strength: 80 },
    { id: 'zaragoza', name: 'Real Zaragoza', prestige: 62, strength: 77 },
    { id: 'atletico', name: 'Atlético Madrid', prestige: 74, strength: 80 },
    { id: 'recreativo', name: 'Recreativo Huelva', prestige: 46, strength: 70 },
    { id: 'getafe', name: 'Getafe', prestige: 52, strength: 72 },
    { id: 'racing', name: 'Racing Santander', prestige: 52, strength: 71 },
    { id: 'espanyol', name: 'Espanyol', prestige: 60, strength: 74 },
    { id: 'mallorca', name: 'RCD Mallorca', prestige: 56, strength: 72 },
    { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 66, strength: 74 },
    { id: 'betis', name: 'Real Betis', prestige: 62, strength: 72 },
    { id: 'levante', name: 'Levante', prestige: 46, strength: 67 },
    { id: 'osasuna', name: 'Osasuna', prestige: 56, strength: 74 },
    { id: 'athletic', name: 'Athletic Bilbao', prestige: 64, strength: 72 },
    { id: 'nastic', name: 'Gimnàstic', prestige: 42, strength: 65 },
    { id: 'celta', name: 'Celta Vigo', prestige: 56, strength: 70 },
    { id: 'real_sociedad', name: 'Real Sociedad', prestige: 60, strength: 69 },
  ],
};

/** Serie B, 2006–07 — Juventus's one season in the wilderness after Calciopoli.
 *  Juve tower over a procedural second tier; the promotion mechanic swaps them into
 *  the Serie A world (ITALY_2007's roster) the moment they go up (see italyEvents). */
export const ITALY_B_2006: LeagueSeed = {
  id: 'ita-b-2006',
  name: 'Serie B',
  season: '2006-07',
  clubs: [
    { id: 'juventus', name: 'Juventus', prestige: 78, strength: 77 },
    { id: 'bari', name: 'Bari', prestige: 48, strength: 66 },
    { id: 'rimini', name: 'Rimini', prestige: 40, strength: 62 },
    { id: 'crotone', name: 'Crotone', prestige: 38, strength: 61 },
    { id: 'mantova', name: 'Mantova', prestige: 38, strength: 62 },
    { id: 'albinoleffe', name: 'AlbinoLeffe', prestige: 36, strength: 60 },
    { id: 'vicenza_b', name: 'Vicenza', prestige: 42, strength: 63 },
    { id: 'frosinone', name: 'Frosinone', prestige: 38, strength: 61 },
    { id: 'spezia', name: 'Spezia', prestige: 38, strength: 61 },
    { id: 'arezzo', name: 'Arezzo', prestige: 36, strength: 60 },
    { id: 'verona_b', name: 'Hellas Verona', prestige: 46, strength: 63 },
    { id: 'pescara_b', name: 'Pescara', prestige: 42, strength: 62 },
    { id: 'cesena_b', name: 'Cesena', prestige: 42, strength: 63 },
    { id: 'brescia_b', name: 'Brescia', prestige: 48, strength: 65 },
    { id: 'piacenza_b', name: 'Piacenza', prestige: 42, strength: 63 },
    { id: 'modena', name: 'Modena', prestige: 42, strength: 63 },
    { id: 'triestina', name: 'Triestina', prestige: 40, strength: 62 },
    { id: 'cremonese_b', name: 'Cremonese', prestige: 40, strength: 61 },
    { id: 'ascoli', name: 'Ascoli', prestige: 42, strength: 63 },
    { id: 'lecce_b', name: 'Lecce', prestige: 46, strength: 64 },
  ],
};

/** England, 2008–09 Premier League — Ferguson's champions with a 23-year-old
 *  Ronaldo, the Gerrard–Torres Liverpool, and the newly-rich Manchester City.
 *  20 clubs; ordering follows the real final table. */
export const ENGLAND_2008: LeagueSeed = {
  id: 'eng-2008',
  name: 'Premier League',
  season: '2008-07',
  clubs: [
    { id: 'man_utd', name: 'Manchester United', prestige: 90, strength: 89 },
    { id: 'liverpool', name: 'Liverpool', prestige: 82, strength: 86 },
    { id: 'chelsea', name: 'Chelsea', prestige: 86, strength: 87 },
    { id: 'arsenal', name: 'Arsenal', prestige: 80, strength: 83 },
    { id: 'everton', name: 'Everton', prestige: 64, strength: 78 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 62, strength: 78 },
    { id: 'fulham', name: 'Fulham', prestige: 54, strength: 74 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 70, strength: 79 },
    { id: 'west_ham', name: 'West Ham United', prestige: 58, strength: 74 },
    { id: 'man_city', name: 'Manchester City', prestige: 62, strength: 78 },
    { id: 'wigan', name: 'Wigan Athletic', prestige: 48, strength: 71 },
    { id: 'stoke', name: 'Stoke City', prestige: 48, strength: 71 },
    { id: 'bolton', name: 'Bolton Wanderers', prestige: 52, strength: 72 },
    { id: 'portsmouth', name: 'Portsmouth', prestige: 54, strength: 73 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 54, strength: 72 },
    { id: 'sunderland', name: 'Sunderland', prestige: 52, strength: 71 },
    { id: 'hull', name: 'Hull City', prestige: 44, strength: 69 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 62, strength: 72 },
    { id: 'middlesbrough', name: 'Middlesbrough', prestige: 52, strength: 70 },
    { id: 'west_brom', name: 'West Bromwich Albion', prestige: 46, strength: 68 },
  ],
};

/** England, 2010–11 Premier League — Ferguson's record 19th title, Ancelotti's
 *  holders Chelsea, the rising takeover City, and the FSG-rescued Liverpool in 6th.
 *  20 clubs; ordering follows the real final table. */
export const ENGLAND_2010: LeagueSeed = {
  id: 'eng-2010',
  name: 'Premier League',
  season: '2010-07',
  clubs: [
    { id: 'man_utd', name: 'Manchester United', prestige: 90, strength: 89 },
    { id: 'chelsea', name: 'Chelsea', prestige: 86, strength: 87 },
    { id: 'man_city', name: 'Manchester City', prestige: 74, strength: 85 },
    { id: 'arsenal', name: 'Arsenal', prestige: 80, strength: 84 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 72, strength: 81 },
    { id: 'liverpool', name: 'Liverpool', prestige: 80, strength: 82 },
    { id: 'everton', name: 'Everton', prestige: 64, strength: 77 },
    { id: 'fulham', name: 'Fulham', prestige: 54, strength: 73 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 62, strength: 75 },
    { id: 'sunderland', name: 'Sunderland', prestige: 54, strength: 72 },
    { id: 'west_brom', name: 'West Bromwich Albion', prestige: 48, strength: 70 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 62, strength: 72 },
    { id: 'stoke', name: 'Stoke City', prestige: 50, strength: 71 },
    { id: 'bolton', name: 'Bolton Wanderers', prestige: 52, strength: 71 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 52, strength: 70 },
    { id: 'wigan', name: 'Wigan Athletic', prestige: 46, strength: 68 },
    { id: 'wolves', name: 'Wolverhampton', prestige: 48, strength: 68 },
    { id: 'birmingham', name: 'Birmingham City', prestige: 50, strength: 68 },
    { id: 'blackpool', name: 'Blackpool', prestige: 40, strength: 66 },
    { id: 'west_ham', name: 'West Ham United', prestige: 56, strength: 68 },
  ],
};

/** Serie A, 2004–05 — Capello's (later stripped) Juventus, the Milan of Istanbul,
 *  and Mancini's nearly-men Inter, on the eve of Calciopoli. 20 clubs. */
export const ITALY_2004: LeagueSeed = {
  id: 'ita-2004',
  name: 'Serie A',
  season: '2004-07',
  clubs: [
    { id: 'juventus', name: 'Juventus', prestige: 86, strength: 87 },
    { id: 'milan', name: 'AC Milan', prestige: 88, strength: 87 },
    { id: 'inter', name: 'Internazionale', prestige: 85, strength: 84 },
    { id: 'roma', name: 'AS Roma', prestige: 80, strength: 82 },
    { id: 'sampdoria', name: 'Sampdoria', prestige: 62, strength: 74 },
    { id: 'udinese', name: 'Udinese', prestige: 62, strength: 75 },
    { id: 'palermo', name: 'Palermo', prestige: 56, strength: 72 },
    { id: 'lecce', name: 'Lecce', prestige: 48, strength: 67 },
    { id: 'bologna', name: 'Bologna', prestige: 56, strength: 70 },
    { id: 'livorno', name: 'Livorno', prestige: 46, strength: 66 },
    { id: 'messina', name: 'Messina', prestige: 44, strength: 64 },
    { id: 'reggina', name: 'Reggina', prestige: 46, strength: 65 },
    { id: 'cagliari', name: 'Cagliari', prestige: 50, strength: 67 },
    { id: 'siena', name: 'Siena', prestige: 46, strength: 66 },
    { id: 'lazio', name: 'Lazio', prestige: 72, strength: 75 },
    { id: 'chievo', name: 'Chievo', prestige: 50, strength: 68 },
    { id: 'fiorentina', name: 'Fiorentina', prestige: 68, strength: 71 },
    { id: 'parma', name: 'Parma', prestige: 60, strength: 71 },
    { id: 'brescia', name: 'Brescia', prestige: 50, strength: 67 },
    { id: 'atalanta', name: 'Atalanta', prestige: 52, strength: 66 },
  ],
};

/** Serie A, 2007–08 — champion Inter, Roma, Juventus back from Serie B, and the
 *  ageing European-champion Milan. 20 clubs; ordering follows the real table. */
export const ITALY_2007: LeagueSeed = {
  id: 'ita-2007',
  name: 'Serie A',
  season: '2007-07',
  clubs: [
    { id: 'inter', name: 'Internazionale', prestige: 86, strength: 87 },
    { id: 'roma', name: 'AS Roma', prestige: 82, strength: 84 },
    { id: 'juventus', name: 'Juventus', prestige: 84, strength: 83 },
    { id: 'fiorentina', name: 'Fiorentina', prestige: 76, strength: 80 },
    { id: 'milan', name: 'AC Milan', prestige: 86, strength: 84 },
    { id: 'sampdoria', name: 'Sampdoria', prestige: 66, strength: 75 },
    { id: 'udinese', name: 'Udinese', prestige: 64, strength: 75 },
    { id: 'napoli', name: 'Napoli', prestige: 68, strength: 74 },
    { id: 'genoa', name: 'Genoa', prestige: 60, strength: 73 },
    { id: 'atalanta', name: 'Atalanta', prestige: 58, strength: 71 },
    { id: 'palermo', name: 'Palermo', prestige: 58, strength: 72 },
    { id: 'lazio', name: 'Lazio', prestige: 74, strength: 76 },
    { id: 'siena', name: 'Siena', prestige: 48, strength: 68 },
    { id: 'cagliari', name: 'Cagliari', prestige: 52, strength: 67 },
    { id: 'torino', name: 'Torino', prestige: 56, strength: 67 },
    { id: 'reggina', name: 'Reggina', prestige: 46, strength: 65 },
    { id: 'catania', name: 'Catania', prestige: 46, strength: 65 },
    { id: 'empoli', name: 'Empoli', prestige: 46, strength: 64 },
    { id: 'parma', name: 'Parma', prestige: 58, strength: 66 },
    { id: 'livorno', name: 'Livorno', prestige: 46, strength: 63 },
  ],
};

/** England, 2003–04 Premier League — Arsenal's Invincibles, Abramovich's first
 *  Chelsea season, United post-Beckham. Ordering follows the real final table. */
export const ENGLAND_2003: LeagueSeed = {
  id: 'eng-2003',
  name: 'English Premier League',
  season: '2003-07',
  clubs: [
    { id: 'arsenal', name: 'Arsenal', prestige: 84, strength: 88 },
    { id: 'man_utd', name: 'Manchester United', prestige: 88, strength: 86 },
    { id: 'chelsea', name: 'Chelsea', prestige: 78, strength: 84 },
    { id: 'liverpool', name: 'Liverpool', prestige: 80, strength: 79 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 70, strength: 76 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 62, strength: 68 },
    { id: 'charlton', name: 'Charlton Athletic', prestige: 54, strength: 66 },
    { id: 'bolton', name: 'Bolton Wanderers', prestige: 56, strength: 67 },
    { id: 'fulham', name: 'Fulham', prestige: 58, strength: 65 },
    { id: 'birmingham', name: 'Birmingham City', prestige: 54, strength: 64 },
    { id: 'middlesbrough', name: 'Middlesbrough', prestige: 60, strength: 66 },
    { id: 'southampton', name: 'Southampton', prestige: 56, strength: 68 },
    { id: 'portsmouth', name: 'Portsmouth', prestige: 52, strength: 62 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 68, strength: 66 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 58, strength: 63 },
    { id: 'man_city', name: 'Manchester City', prestige: 62, strength: 64 },
    { id: 'everton', name: 'Everton', prestige: 64, strength: 62 },
    { id: 'leicester', name: 'Leicester City', prestige: 50, strength: 58 },
    { id: 'leeds', name: 'Leeds United', prestige: 62, strength: 60 },
    { id: 'wolves', name: 'Wolverhampton', prestige: 48, strength: 55 },
  ],
};

/** England, 1995–96 Premier League — Ferguson's kids win the double, Keegan's
 *  Newcastle blow a twelve-point lead, and the Spice Boys' Liverpool finish 3rd.
 *  Reigning champions Blackburn (SAS) fade to 7th. Ordering follows the real
 *  final table; the relegated three (City, QPR, Bolton) are included. */
export const ENGLAND_1995: LeagueSeed = {
  id: 'eng-1995',
  name: 'English Premier League',
  season: '1995-07',
  clubs: [
    { id: 'man_utd', name: 'Manchester United', prestige: 88, strength: 86 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 76, strength: 85 },
    { id: 'liverpool', name: 'Liverpool', prestige: 82, strength: 84 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 66, strength: 79 },
    { id: 'arsenal', name: 'Arsenal', prestige: 78, strength: 79 },
    { id: 'everton', name: 'Everton', prestige: 64, strength: 77 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 68, strength: 79 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 70, strength: 76 },
    { id: 'nottm_forest', name: 'Nottingham Forest', prestige: 58, strength: 74 },
    { id: 'west_ham', name: 'West Ham United', prestige: 60, strength: 71 },
    { id: 'chelsea', name: 'Chelsea', prestige: 72, strength: 73 },
    { id: 'middlesbrough', name: 'Middlesbrough', prestige: 56, strength: 69 },
    { id: 'leeds', name: 'Leeds United', prestige: 66, strength: 70 },
    { id: 'wimbledon', name: 'Wimbledon', prestige: 52, strength: 68 },
    { id: 'sheffield_wednesday', name: 'Sheffield Wednesday', prestige: 56, strength: 68 },
    { id: 'coventry', name: 'Coventry City', prestige: 50, strength: 66 },
    { id: 'southampton', name: 'Southampton', prestige: 52, strength: 66 },
    { id: 'man_city', name: 'Manchester City', prestige: 60, strength: 66 },
    { id: 'qpr', name: 'Queens Park Rangers', prestige: 52, strength: 64 },
    { id: 'bolton', name: 'Bolton Wanderers', prestige: 48, strength: 62 },
  ],
};

/** England, 1996–97 Premier League — United's title machine, Keegan/Dalglish
 *  Newcastle 2nd, Wenger's first Arsenal. Man City are in Division One (2nd tier),
 *  so they are NOT here. Ordering follows the real final table. */
export const ENGLAND_1996: LeagueSeed = {
  id: 'eng-1996',
  name: 'English Premier League',
  season: '1996-07',
  clubs: [
    { id: 'man_utd', name: 'Manchester United', prestige: 90, strength: 88 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 78, strength: 83 },
    { id: 'arsenal', name: 'Arsenal', prestige: 80, strength: 83 },
    { id: 'liverpool', name: 'Liverpool', prestige: 82, strength: 82 },
    { id: 'chelsea', name: 'Chelsea', prestige: 74, strength: 79 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 66, strength: 74 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 70, strength: 72 },
    { id: 'sheffield_wednesday', name: 'Sheffield Wednesday', prestige: 58, strength: 71 },
    { id: 'wimbledon', name: 'Wimbledon', prestige: 54, strength: 70 },
    { id: 'leicester', name: 'Leicester City', prestige: 54, strength: 69 },
    { id: 'leeds', name: 'Leeds United', prestige: 66, strength: 68 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 62, strength: 68 },
    { id: 'west_ham', name: 'West Ham United', prestige: 60, strength: 67 },
    { id: 'everton', name: 'Everton', prestige: 64, strength: 66 },
    { id: 'derby', name: 'Derby County', prestige: 52, strength: 65 },
    { id: 'southampton', name: 'Southampton', prestige: 52, strength: 64 },
    { id: 'coventry', name: 'Coventry City', prestige: 50, strength: 63 },
    { id: 'sunderland', name: 'Sunderland', prestige: 54, strength: 61 },
    { id: 'middlesbrough', name: 'Middlesbrough', prestige: 58, strength: 61 },
    { id: 'nottm_forest', name: 'Nottingham Forest', prestige: 56, strength: 59 },
  ],
};

export const LEAGUES: Record<string, LeagueSeed> = {
  'eng-1': ENGLAND_1999,
  'eng-1995': ENGLAND_1995,
  'eng-1996': ENGLAND_1996,
  'eng-2003': ENGLAND_2003,
  'esp-1': SPAIN_2000,
  'esp-2003': SPAIN_2003,
  'esp-2006': SPAIN_2006,
  'esp-2014': SPAIN_2014,
  'ita-1': ITALY_1995,
  'ita-1998': ITALY_1998,
  'ita-b-2006': ITALY_B_2006,
  'ita-2004': ITALY_2004,
  'ita-2007': ITALY_2007,
  'eng-2013': ENGLAND_2013,
  'eng-2004': ENGLAND_2004,
  'eng-2001': ENGLAND_2001,
  'eng-2008': ENGLAND_2008,
  'eng-2010': ENGLAND_2010,
  'ger-1997': GERMANY_1997,
  'ger-1998': GERMANY_1998,
  'ger-2009': GERMANY_2009,
  'ger-2012': GERMANY_2012,
};
