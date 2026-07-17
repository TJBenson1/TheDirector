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
    { id: 'derby', name: 'Derby County', prestige: 50, strength: 58 },
    { id: 'leicester', name: 'Leicester City', prestige: 52, strength: 59 },
  ],
};

/** Italy, Serie A 1998–99 — then the strongest league in the world. Milan were
 *  the real champions; Juventus/Inter/Lazio/Parma/Fiorentina the powers. 20 clubs
 *  (the real 18 plus two, to fit the sim's double round-robin). */
export const SERIE_A_1998: LeagueSeed = {
  id: 'ita-1',
  name: 'Serie A',
  season: '1998-07',
  clubs: [
    { id: 'juventus', name: 'Juventus', prestige: 90, strength: 88 },
    { id: 'inter', name: 'Internazionale', prestige: 88, strength: 87 },
    { id: 'lazio', name: 'Lazio', prestige: 82, strength: 85 },
    { id: 'milan', name: 'AC Milan', prestige: 88, strength: 84 },
    { id: 'parma', name: 'Parma', prestige: 76, strength: 84 },
    { id: 'fiorentina', name: 'Fiorentina', prestige: 74, strength: 82 },
    { id: 'roma', name: 'AS Roma', prestige: 78, strength: 80 },
    { id: 'bologna', name: 'Bologna', prestige: 60, strength: 74 },
    { id: 'udinese', name: 'Udinese', prestige: 58, strength: 73 },
    { id: 'sampdoria', name: 'Sampdoria', prestige: 62, strength: 70 },
    { id: 'vicenza', name: 'Vicenza', prestige: 52, strength: 68 },
    { id: 'perugia', name: 'Perugia', prestige: 52, strength: 66 },
    { id: 'bari', name: 'Bari', prestige: 50, strength: 64 },
    { id: 'piacenza', name: 'Piacenza', prestige: 48, strength: 62 },
    { id: 'cagliari', name: 'Cagliari', prestige: 50, strength: 62 },
    { id: 'empoli', name: 'Empoli', prestige: 46, strength: 60 },
    { id: 'venezia', name: 'Venezia', prestige: 46, strength: 60 },
    { id: 'salernitana', name: 'Salernitana', prestige: 44, strength: 58 },
    { id: 'reggina', name: 'Reggina', prestige: 46, strength: 58 },
    { id: 'lecce', name: 'Lecce', prestige: 46, strength: 56 },
  ],
};

/** Germany, 2009–10 Bundesliga — 18 teams (van Gaal's first Bayern season, which
 *  ended in a domestic double). Wolfsburg are the reigning champions; Klopp's
 *  Dortmund and Rangnick's Hoffenheim are the rising sides. */
export const BUNDESLIGA_2009: LeagueSeed = {
  id: 'ger-2009',
  name: 'Bundesliga',
  season: '2009-07',
  clubs: [
    { id: 'bayern', name: 'Bayern Munich', prestige: 88, strength: 87 },
    { id: 'wolfsburg', name: 'VfL Wolfsburg', prestige: 66, strength: 80 },
    { id: 'schalke', name: 'Schalke 04', prestige: 74, strength: 80 },
    { id: 'bremen', name: 'Werder Bremen', prestige: 72, strength: 80 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 72, strength: 79 },
    { id: 'dortmund', name: 'Borussia Dortmund', prestige: 74, strength: 77 },
    { id: 'stuttgart', name: 'VfB Stuttgart', prestige: 70, strength: 76 },
    { id: 'hamburg', name: 'Hamburger SV', prestige: 70, strength: 76 },
    { id: 'hoffenheim', name: '1899 Hoffenheim', prestige: 58, strength: 73 },
    { id: 'frankfurt', name: 'Eintracht Frankfurt', prestige: 62, strength: 69 },
    { id: 'gladbach', name: "Borussia Mönchengladbach", prestige: 64, strength: 67 },
    { id: 'koln', name: '1. FC Köln', prestige: 62, strength: 67 },
    { id: 'hannover', name: 'Hannover 96', prestige: 56, strength: 65 },
    { id: 'mainz', name: 'Mainz 05', prestige: 54, strength: 65 },
    { id: 'freiburg', name: 'SC Freiburg', prestige: 54, strength: 63 },
    { id: 'hertha', name: 'Hertha BSC', prestige: 62, strength: 62 },
    { id: 'nurnberg', name: '1. FC Nürnberg', prestige: 56, strength: 61 },
    { id: 'bochum', name: 'VfL Bochum', prestige: 52, strength: 60 },
  ],
};

/** Serie A, 2006–07 — Inter's record-points Scudetto, Milan's Champions League;
 *  Juventus are ABSENT (relegated to Serie B in Calciopoli). Ordering informed by
 *  the real final table. */
export const SERIE_A_2007: LeagueSeed = {
  id: 'ita-2007',
  name: 'Serie A',
  season: '2006-07',
  clubs: [
    { id: 'inter', name: 'Internazionale', prestige: 86, strength: 87 },
    { id: 'milan', name: 'AC Milan', prestige: 86, strength: 85 },
    { id: 'roma', name: 'AS Roma', prestige: 80, strength: 83 },
    { id: 'lazio', name: 'Lazio', prestige: 76, strength: 80 },
    { id: 'fiorentina', name: 'Fiorentina', prestige: 74, strength: 80 },
    { id: 'palermo', name: 'Palermo', prestige: 62, strength: 77 },
    { id: 'sampdoria', name: 'Sampdoria', prestige: 62, strength: 75 },
    { id: 'udinese', name: 'Udinese', prestige: 60, strength: 74 },
    { id: 'empoli', name: 'Empoli', prestige: 50, strength: 72 },
    { id: 'atalanta', name: 'Atalanta', prestige: 58, strength: 72 },
    { id: 'parma', name: 'Parma', prestige: 62, strength: 71 },
    { id: 'livorno', name: 'Livorno', prestige: 50, strength: 70 },
    { id: 'catania', name: 'Catania', prestige: 48, strength: 68 },
    { id: 'siena', name: 'Siena', prestige: 48, strength: 68 },
    { id: 'torino', name: 'Torino', prestige: 56, strength: 67 },
    { id: 'cagliari', name: 'Cagliari', prestige: 50, strength: 67 },
    { id: 'reggina', name: 'Reggina', prestige: 46, strength: 66 },
    { id: 'chievo', name: 'Chievo', prestige: 48, strength: 65 },
    { id: 'ascoli', name: 'Ascoli', prestige: 44, strength: 63 },
    { id: 'messina', name: 'Messina', prestige: 44, strength: 62 },
  ],
};

/** Serie B, 2006–07 — the division Juventus were dumped into after Calciopoli and
 *  won at the first attempt. Juve are far and away the strongest; Napoli and Genoa
 *  went up with them. */
export const SERIE_B_2006: LeagueSeed = {
  id: 'ita-b-2006',
  name: 'Serie B',
  season: '2006-07',
  clubs: [
    { id: 'juventus', name: 'Juventus', prestige: 82, strength: 82 },
    { id: 'napoli', name: 'Napoli', prestige: 66, strength: 74 },
    { id: 'genoa', name: 'Genoa', prestige: 58, strength: 73 },
    { id: 'lecce', name: 'Lecce', prestige: 50, strength: 71 },
    { id: 'bologna', name: 'Bologna', prestige: 56, strength: 71 },
    { id: 'brescia', name: 'Brescia', prestige: 50, strength: 70 },
    { id: 'verona', name: 'Hellas Verona', prestige: 52, strength: 68 },
    { id: 'cesena', name: 'Cesena', prestige: 44, strength: 67 },
    { id: 'bari', name: 'Bari', prestige: 48, strength: 67 },
    { id: 'piacenza', name: 'Piacenza', prestige: 44, strength: 66 },
    { id: 'triestina', name: 'Triestina', prestige: 42, strength: 65 },
    { id: 'modena', name: 'Modena', prestige: 44, strength: 65 },
    { id: 'mantova', name: 'Mantova', prestige: 40, strength: 64 },
    { id: 'frosinone', name: 'Frosinone', prestige: 40, strength: 63 },
    { id: 'vicenza', name: 'Vicenza', prestige: 44, strength: 63 },
    { id: 'rimini', name: 'Rimini', prestige: 40, strength: 62 },
    { id: 'crotone', name: 'Crotone', prestige: 40, strength: 61 },
    { id: 'spezia', name: 'Spezia', prestige: 40, strength: 61 },
    { id: 'arezzo', name: 'Arezzo', prestige: 40, strength: 60 },
    { id: 'albinoleffe', name: 'AlbinoLeffe', prestige: 38, strength: 59 },
  ],
};

/** Bundesliga, 1997–98 — Dortmund the reigning European champions, Bayern rebuilding
 *  towards the 1999 final; Kaiserslautern's sensational newly-promoted title. Shared
 *  by dortmund-1997 and bayern-1998. */
export const BUNDESLIGA_1997: LeagueSeed = {
  id: 'ger-1997',
  name: 'Bundesliga',
  season: '1997-07',
  clubs: [
    { id: 'bayern', name: 'Bayern Munich', prestige: 86, strength: 86 },
    { id: 'dortmund', name: 'Borussia Dortmund', prestige: 82, strength: 84 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 74, strength: 81 },
    { id: 'kaiserslautern', name: '1. FC Kaiserslautern', prestige: 64, strength: 80 },
    { id: 'schalke', name: 'Schalke 04', prestige: 72, strength: 79 },
    { id: 'stuttgart', name: 'VfB Stuttgart', prestige: 72, strength: 78 },
    { id: 'bremen', name: 'Werder Bremen', prestige: 70, strength: 76 },
    { id: 'munich_1860', name: '1860 Munich', prestige: 60, strength: 74 },
    { id: 'hamburg', name: 'Hamburger SV', prestige: 68, strength: 73 },
    { id: 'bochum', name: 'VfL Bochum', prestige: 54, strength: 72 },
    { id: 'wolfsburg', name: 'VfL Wolfsburg', prestige: 52, strength: 70 },
    { id: 'gladbach', name: 'Borussia Mönchengladbach', prestige: 62, strength: 69 },
    { id: 'hansa', name: 'Hansa Rostock', prestige: 50, strength: 68 },
    { id: 'duisburg', name: 'MSV Duisburg', prestige: 48, strength: 67 },
    { id: 'karlsruhe', name: 'Karlsruher SC', prestige: 50, strength: 66 },
    { id: 'bielefeld', name: 'Arminia Bielefeld', prestige: 46, strength: 64 },
    { id: 'koln', name: '1. FC Köln', prestige: 58, strength: 65 },
    { id: 'hertha', name: 'Hertha BSC', prestige: 56, strength: 63 },
  ],
};

/** Serie A, 1995–96 — Capello's Milan champions, Lippi's Juventus European Cup
 *  winners; the golden age of Serie A. Shared by milan-1995 and juventus-1995. */
export const SERIE_A_1995: LeagueSeed = {
  id: 'ita-1995',
  name: 'Serie A',
  season: '1995-07',
  clubs: [
    { id: 'juventus', name: 'Juventus', prestige: 84, strength: 86 },
    { id: 'milan', name: 'AC Milan', prestige: 86, strength: 85 },
    { id: 'parma', name: 'Parma', prestige: 72, strength: 81 },
    { id: 'lazio', name: 'Lazio', prestige: 74, strength: 80 },
    { id: 'fiorentina', name: 'Fiorentina', prestige: 72, strength: 80 },
    { id: 'inter', name: 'Internazionale', prestige: 82, strength: 79 },
    { id: 'roma', name: 'AS Roma', prestige: 76, strength: 78 },
    { id: 'sampdoria', name: 'Sampdoria', prestige: 66, strength: 76 },
    { id: 'napoli', name: 'Napoli', prestige: 64, strength: 74 },
    { id: 'udinese', name: 'Udinese', prestige: 56, strength: 72 },
    { id: 'atalanta', name: 'Atalanta', prestige: 56, strength: 70 },
    { id: 'torino', name: 'Torino', prestige: 58, strength: 70 },
    { id: 'vicenza', name: 'Vicenza', prestige: 48, strength: 68 },
    { id: 'cagliari', name: 'Cagliari', prestige: 50, strength: 68 },
    { id: 'bari', name: 'Bari', prestige: 46, strength: 66 },
    { id: 'piacenza', name: 'Piacenza', prestige: 44, strength: 64 },
    { id: 'cremonese', name: 'Cremonese', prestige: 42, strength: 63 },
    { id: 'padova', name: 'Padova', prestige: 42, strength: 62 },
  ],
};

/** England, 1996–97 Premier League — Ferguson's champions, Newcastle's Entertainers,
 *  Wenger's arriving Arsenal and Liverpool's Spice Boys. Shared by liverpool-1995,
 *  chelsea-1996 and arsenal-1996. */
export const ENGLAND_1996: LeagueSeed = {
  id: 'eng-1996',
  name: 'FA Premier League',
  season: '1996-07',
  clubs: [
    { id: 'man_utd', name: 'Manchester United', prestige: 84, strength: 84 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 74, strength: 82 },
    { id: 'arsenal', name: 'Arsenal', prestige: 76, strength: 80 },
    { id: 'liverpool', name: 'Liverpool', prestige: 78, strength: 80 },
    { id: 'chelsea', name: 'Chelsea', prestige: 68, strength: 78 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 66, strength: 76 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 66, strength: 74 },
    { id: 'leeds', name: 'Leeds United', prestige: 66, strength: 72 },
    { id: 'everton', name: 'Everton', prestige: 64, strength: 72 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 66, strength: 72 },
    { id: 'sheffield_wednesday', name: 'Sheffield Wednesday', prestige: 56, strength: 70 },
    { id: 'wimbledon', name: 'Wimbledon', prestige: 50, strength: 70 },
    { id: 'leicester', name: 'Leicester City', prestige: 52, strength: 69 },
    { id: 'west_ham', name: 'West Ham United', prestige: 58, strength: 69 },
    { id: 'middlesbrough', name: 'Middlesbrough', prestige: 54, strength: 68 },
    { id: 'derby', name: 'Derby County', prestige: 50, strength: 67 },
    { id: 'sunderland', name: 'Sunderland', prestige: 52, strength: 65 },
    { id: 'coventry', name: 'Coventry City', prestige: 48, strength: 65 },
    { id: 'southampton', name: 'Southampton', prestige: 48, strength: 65 },
    { id: 'nottm_forest', name: 'Nottingham Forest', prestige: 52, strength: 63 },
  ],
};

/** La Liga, 2014–15 — Barcelona's MSN treble, Real Madrid's BBC, Simeone's
 *  reigning champions Atlético. Used by barcelona-2014. */
export const SPAIN_2014: LeagueSeed = {
  id: 'esp-2014',
  name: 'La Liga',
  season: '2014-07',
  clubs: [
    { id: 'barcelona', name: 'Barcelona', prestige: 90, strength: 90 },
    { id: 'real_madrid', name: 'Real Madrid', prestige: 90, strength: 90 },
    { id: 'atletico', name: 'Atlético Madrid', prestige: 80, strength: 84 },
    { id: 'valencia', name: 'Valencia', prestige: 74, strength: 78 },
    { id: 'sevilla', name: 'Sevilla', prestige: 72, strength: 78 },
    { id: 'villarreal', name: 'Villarreal', prestige: 68, strength: 76 },
    { id: 'athletic_bilbao', name: 'Athletic Bilbao', prestige: 66, strength: 74 },
    { id: 'malaga', name: 'Málaga', prestige: 60, strength: 72 },
    { id: 'celta', name: 'Celta Vigo', prestige: 56, strength: 72 },
    { id: 'real_sociedad', name: 'Real Sociedad', prestige: 62, strength: 71 },
    { id: 'espanyol', name: 'Espanyol', prestige: 58, strength: 70 },
    { id: 'rayo', name: 'Rayo Vallecano', prestige: 50, strength: 68 },
    { id: 'getafe', name: 'Getafe', prestige: 50, strength: 67 },
    { id: 'levante', name: 'Levante', prestige: 48, strength: 66 },
    { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 56, strength: 66 },
    { id: 'elche', name: 'Elche', prestige: 44, strength: 64 },
    { id: 'granada', name: 'Granada', prestige: 46, strength: 64 },
    { id: 'eibar', name: 'Eibar', prestige: 42, strength: 63 },
    { id: 'almeria', name: 'Almería', prestige: 44, strength: 62 },
    { id: 'cordoba', name: 'Córdoba', prestige: 42, strength: 60 },
  ],
};

/** La Liga, 2003–04 — the peak Galácticos, Ronaldinho's arriving Barça, and
 *  Benítez's Valencia (the champions). Used by barcelona-2003. */
export const SPAIN_2003: LeagueSeed = {
  id: 'esp-2003',
  name: 'La Liga',
  season: '2003-07',
  clubs: [
    { id: 'real_madrid', name: 'Real Madrid', prestige: 90, strength: 88 },
    { id: 'barcelona', name: 'Barcelona', prestige: 86, strength: 84 },
    { id: 'valencia', name: 'Valencia', prestige: 76, strength: 84 },
    { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 70, strength: 82 },
    { id: 'real_sociedad', name: 'Real Sociedad', prestige: 64, strength: 79 },
    { id: 'sevilla', name: 'Sevilla', prestige: 66, strength: 76 },
    { id: 'villarreal', name: 'Villarreal', prestige: 60, strength: 76 },
    { id: 'atletico', name: 'Atlético Madrid', prestige: 74, strength: 74 },
    { id: 'betis', name: 'Real Betis', prestige: 60, strength: 74 },
    { id: 'athletic_bilbao', name: 'Athletic Bilbao', prestige: 64, strength: 72 },
    { id: 'celta', name: 'Celta Vigo', prestige: 56, strength: 72 },
    { id: 'malaga', name: 'Málaga', prestige: 54, strength: 71 },
    { id: 'zaragoza', name: 'Real Zaragoza', prestige: 58, strength: 70 },
    { id: 'espanyol', name: 'Espanyol', prestige: 56, strength: 69 },
    { id: 'mallorca', name: 'Mallorca', prestige: 54, strength: 69 },
    { id: 'osasuna', name: 'Osasuna', prestige: 50, strength: 67 },
    { id: 'racing', name: 'Racing Santander', prestige: 48, strength: 65 },
    { id: 'valladolid', name: 'Real Valladolid', prestige: 48, strength: 64 },
    { id: 'albacete', name: 'Albacete', prestige: 42, strength: 62 },
    { id: 'murcia', name: 'Real Murcia', prestige: 42, strength: 61 },
  ],
};

/** La Liga, 2006–07 — Capello's champion Real Madrid at the end of the galáctico
 *  era, Ronaldinho's Barça, Sevilla's rise. Used by real-madrid-2006. */
export const SPAIN_2006: LeagueSeed = {
  id: 'esp-2006',
  name: 'La Liga',
  season: '2006-07',
  clubs: [
    { id: 'barcelona', name: 'Barcelona', prestige: 88, strength: 86 },
    { id: 'real_madrid', name: 'Real Madrid', prestige: 88, strength: 84 },
    { id: 'sevilla', name: 'Sevilla', prestige: 72, strength: 81 },
    { id: 'valencia', name: 'Valencia', prestige: 74, strength: 78 },
    { id: 'villarreal', name: 'Villarreal', prestige: 66, strength: 76 },
    { id: 'atletico', name: 'Atlético Madrid', prestige: 74, strength: 75 },
    { id: 'zaragoza', name: 'Real Zaragoza', prestige: 60, strength: 74 },
    { id: 'osasuna', name: 'Osasuna', prestige: 54, strength: 73 },
    { id: 'espanyol', name: 'Espanyol', prestige: 58, strength: 72 },
    { id: 'getafe', name: 'Getafe', prestige: 50, strength: 71 },
    { id: 'betis', name: 'Real Betis', prestige: 60, strength: 70 },
    { id: 'athletic_bilbao', name: 'Athletic Bilbao', prestige: 64, strength: 70 },
    { id: 'deportivo', name: 'Deportivo La Coruña', prestige: 62, strength: 70 },
    { id: 'recreativo', name: 'Recreativo Huelva', prestige: 44, strength: 68 },
    { id: 'mallorca', name: 'Mallorca', prestige: 52, strength: 68 },
    { id: 'levante', name: 'Levante', prestige: 46, strength: 66 },
    { id: 'racing', name: 'Racing Santander', prestige: 48, strength: 66 },
    { id: 'celta', name: 'Celta Vigo', prestige: 54, strength: 65 },
    { id: 'real_sociedad', name: 'Real Sociedad', prestige: 58, strength: 64 },
    { id: 'nastic', name: 'Gimnàstic Tarragona', prestige: 40, strength: 61 },
  ],
};

/** Premier League, 2008–09 — the season the Abu Dhabi money landed at City
 *  (still a mid-table side at kickoff). United are champions; Liverpool run them
 *  close. */
export const ENGLAND_2008: LeagueSeed = {
  id: 'eng-2008',
  name: 'English Premier League',
  season: '2008-07',
  clubs: [
    { id: 'man_utd', name: 'Manchester United', prestige: 90, strength: 88 },
    { id: 'liverpool', name: 'Liverpool', prestige: 82, strength: 85 },
    { id: 'chelsea', name: 'Chelsea', prestige: 86, strength: 86 },
    { id: 'arsenal', name: 'Arsenal', prestige: 82, strength: 82 },
    { id: 'everton', name: 'Everton', prestige: 66, strength: 76 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 64, strength: 75 },
    { id: 'man_city', name: 'Manchester City', prestige: 66, strength: 73 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 72, strength: 74 },
    { id: 'west_ham', name: 'West Ham United', prestige: 60, strength: 70 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 66, strength: 69 },
    { id: 'fulham', name: 'Fulham', prestige: 56, strength: 68 },
    { id: 'wigan', name: 'Wigan Athletic', prestige: 50, strength: 66 },
    { id: 'stoke', name: 'Stoke City', prestige: 50, strength: 65 },
    { id: 'bolton', name: 'Bolton Wanderers', prestige: 52, strength: 65 },
    { id: 'portsmouth', name: 'Portsmouth', prestige: 56, strength: 68 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 54, strength: 66 },
    { id: 'sunderland', name: 'Sunderland', prestige: 56, strength: 64 },
    { id: 'hull', name: 'Hull City', prestige: 48, strength: 62 },
    { id: 'middlesbrough', name: 'Middlesbrough', prestige: 56, strength: 64 },
    { id: 'west_brom', name: 'West Bromwich Albion', prestige: 48, strength: 60 },
  ],
};

/** Premier League, 2010–11 — the season of the NESV takeover at Anfield and
 *  Torres's January exit; United march to a 19th title, City rising fast. */
export const ENGLAND_2010: LeagueSeed = {
  id: 'eng-2010',
  name: 'English Premier League',
  season: '2010-07',
  clubs: [
    { id: 'man_utd', name: 'Manchester United', prestige: 90, strength: 87 },
    { id: 'chelsea', name: 'Chelsea', prestige: 86, strength: 87 },
    { id: 'man_city', name: 'Manchester City', prestige: 78, strength: 84 },
    { id: 'arsenal', name: 'Arsenal', prestige: 82, strength: 83 },
    { id: 'liverpool', name: 'Liverpool', prestige: 80, strength: 79 },
    { id: 'spurs', name: 'Tottenham Hotspur', prestige: 74, strength: 80 },
    { id: 'everton', name: 'Everton', prestige: 66, strength: 75 },
    { id: 'aston_villa', name: 'Aston Villa', prestige: 64, strength: 73 },
    { id: 'newcastle', name: 'Newcastle United', prestige: 66, strength: 71 },
    { id: 'sunderland', name: 'Sunderland', prestige: 58, strength: 70 },
    { id: 'fulham', name: 'Fulham', prestige: 58, strength: 70 },
    { id: 'stoke', name: 'Stoke City', prestige: 52, strength: 69 },
    { id: 'bolton', name: 'Bolton Wanderers', prestige: 52, strength: 68 },
    { id: 'blackburn', name: 'Blackburn Rovers', prestige: 54, strength: 66 },
    { id: 'wigan', name: 'Wigan Athletic', prestige: 50, strength: 64 },
    { id: 'west_brom', name: 'West Bromwich Albion', prestige: 50, strength: 63 },
    { id: 'wolves', name: 'Wolverhampton Wanderers', prestige: 50, strength: 63 },
    { id: 'birmingham', name: 'Birmingham City', prestige: 52, strength: 64 },
    { id: 'blackpool', name: 'Blackpool', prestige: 44, strength: 60 },
    { id: 'west_ham', name: 'West Ham United', prestige: 60, strength: 66 },
  ],
};

/** Serie A, 2004–05 — Mancini's Inter chase Juventus and Milan; the title race
 *  later erased by Calciopoli. Ordering informed by the real (pre-scandal) table. */
export const SERIE_A_2004: LeagueSeed = {
  id: 'ita-2004',
  name: 'Serie A',
  season: '2004-07',
  clubs: [
    { id: 'juventus', name: 'Juventus', prestige: 88, strength: 88 },
    { id: 'milan', name: 'AC Milan', prestige: 88, strength: 87 },
    { id: 'inter', name: 'Internazionale', prestige: 84, strength: 85 },
    { id: 'roma', name: 'AS Roma', prestige: 78, strength: 80 },
    { id: 'lazio', name: 'Lazio', prestige: 74, strength: 78 },
    { id: 'sampdoria', name: 'Sampdoria', prestige: 62, strength: 75 },
    { id: 'udinese', name: 'Udinese', prestige: 62, strength: 76 },
    { id: 'palermo', name: 'Palermo', prestige: 56, strength: 73 },
    { id: 'parma', name: 'Parma', prestige: 64, strength: 74 },
    { id: 'bologna', name: 'Bologna', prestige: 54, strength: 71 },
    { id: 'fiorentina', name: 'Fiorentina', prestige: 68, strength: 72 },
    { id: 'reggina', name: 'Reggina', prestige: 48, strength: 68 },
    { id: 'lecce', name: 'Lecce', prestige: 46, strength: 68 },
    { id: 'messina', name: 'Messina', prestige: 44, strength: 66 },
    { id: 'cagliari', name: 'Cagliari', prestige: 50, strength: 68 },
    { id: 'chievo', name: 'Chievo', prestige: 50, strength: 67 },
    { id: 'siena', name: 'Siena', prestige: 46, strength: 66 },
    { id: 'livorno', name: 'Livorno', prestige: 48, strength: 67 },
    { id: 'atalanta', name: 'Atalanta', prestige: 54, strength: 66 },
    { id: 'brescia', name: 'Brescia', prestige: 46, strength: 65 },
  ],
};

/** Bundesliga, 2012–13 — Klopp's back-to-back champions vs the Bayern juggernaut
 *  that would win the treble; the season Götze's move to Bayern was announced. */
export const BUNDESLIGA_2012: LeagueSeed = {
  id: 'ger-2012',
  name: 'Bundesliga',
  season: '2012-07',
  clubs: [
    { id: 'bayern', name: 'Bayern Munich', prestige: 92, strength: 92 },
    { id: 'dortmund', name: 'Borussia Dortmund', prestige: 82, strength: 86 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', prestige: 72, strength: 79 },
    { id: 'schalke', name: 'Schalke 04', prestige: 74, strength: 80 },
    { id: 'gladbach', name: 'Borussia Mönchengladbach', prestige: 66, strength: 77 },
    { id: 'frankfurt', name: 'Eintracht Frankfurt', prestige: 62, strength: 73 },
    { id: 'hamburg', name: 'Hamburger SV', prestige: 68, strength: 72 },
    { id: 'stuttgart', name: 'VfB Stuttgart', prestige: 68, strength: 74 },
    { id: 'bremen', name: 'Werder Bremen', prestige: 68, strength: 73 },
    { id: 'hannover', name: 'Hannover 96', prestige: 56, strength: 71 },
    { id: 'freiburg', name: 'SC Freiburg', prestige: 54, strength: 70 },
    { id: 'mainz', name: 'Mainz 05', prestige: 56, strength: 70 },
    { id: 'wolfsburg', name: 'VfL Wolfsburg', prestige: 64, strength: 72 },
    { id: 'nurnberg', name: '1. FC Nürnberg', prestige: 54, strength: 69 },
    { id: 'hoffenheim', name: '1899 Hoffenheim', prestige: 56, strength: 68 },
    { id: 'augsburg', name: 'FC Augsburg', prestige: 48, strength: 65 },
    { id: 'dusseldorf', name: 'Fortuna Düsseldorf', prestige: 48, strength: 64 },
    { id: 'greuther_furth', name: 'Greuther Fürth', prestige: 44, strength: 61 },
  ],
};

export const LEAGUES: Record<string, LeagueSeed> = {
  'eng-1': ENGLAND_1999,
  'eng-1996': ENGLAND_1996,
  'esp-1': SPAIN_2000,
  'esp-2003': SPAIN_2003,
  'esp-2006': SPAIN_2006,
  'esp-2014': SPAIN_2014,
  'ita-1': SERIE_A_1998,
  'ita-1995': SERIE_A_1995,
  'ita-2007': SERIE_A_2007,
  'ita-b-2006': SERIE_B_2006,
  'eng-2013': ENGLAND_2013,
  'eng-2004': ENGLAND_2004,
  'eng-2001': ENGLAND_2001,
  'ger-1997': BUNDESLIGA_1997,
  'ger-2009': BUNDESLIGA_2009,
  'ger-2012': BUNDESLIGA_2012,
  'eng-2008': ENGLAND_2008,
  'eng-2010': ENGLAND_2010,
  'ita-2004': SERIE_A_2004,
};

/**
 * Second-tier reservoirs (promotion pools). Each season the league's bottom 3
 * swap with the strongest 3 clubs here, so the division churns across a long
 * career (real clubs go down and come back; the 1999 membership doesn't persist
 * unchanged to 2013 — a Historian realism note). Clubs already in a given
 * league are filtered out when the pool is attached (see state.ts), so one broad
 * pool per country serves every era of that country's top flight. Strengths are
 * promoted-side level (a newly-up club is near the drop, not mid-table).
 */
const ENGLISH_POOL: LeagueClubSeed[] = [
  { id: 'fulham', name: 'Fulham', prestige: 56, strength: 55 },
  { id: 'man_city', name: 'Manchester City', prestige: 64, strength: 58 },
  { id: 'bolton', name: 'Bolton Wanderers', prestige: 54, strength: 55 },
  { id: 'charlton', name: 'Charlton Athletic', prestige: 52, strength: 53 },
  { id: 'blackburn', name: 'Blackburn Rovers', prestige: 58, strength: 57 },
  { id: 'birmingham', name: 'Birmingham City', prestige: 52, strength: 52 },
  { id: 'west_brom', name: 'West Bromwich Albion', prestige: 50, strength: 51 },
  { id: 'portsmouth', name: 'Portsmouth', prestige: 52, strength: 53 },
  { id: 'wolves', name: 'Wolverhampton Wanderers', prestige: 50, strength: 50 },
  { id: 'norwich', name: 'Norwich City', prestige: 50, strength: 51 },
  { id: 'crystal_palace', name: 'Crystal Palace', prestige: 50, strength: 51 },
  { id: 'wigan', name: 'Wigan Athletic', prestige: 50, strength: 52 },
  { id: 'reading', name: 'Reading', prestige: 48, strength: 51 },
  { id: 'hull', name: 'Hull City', prestige: 48, strength: 50 },
  { id: 'stoke', name: 'Stoke City', prestige: 52, strength: 54 },
  { id: 'burnley', name: 'Burnley', prestige: 46, strength: 49 },
  { id: 'qpr', name: 'Queens Park Rangers', prestige: 48, strength: 50 },
  { id: 'ipswich', name: 'Ipswich Town', prestige: 50, strength: 52 },
];

const SPANISH_POOL: LeagueClubSeed[] = [
  { id: 'sevilla', name: 'Sevilla', prestige: 66, strength: 62 },
  { id: 'getafe', name: 'Getafe', prestige: 50, strength: 55 },
  { id: 'levante', name: 'Levante', prestige: 48, strength: 53 },
  { id: 'sporting_gijon', name: 'Sporting Gijón', prestige: 50, strength: 53 },
  { id: 'tenerife', name: 'CD Tenerife', prestige: 48, strength: 52 },
  { id: 'recreativo', name: 'Recreativo Huelva', prestige: 46, strength: 51 },
  { id: 'almeria', name: 'UD Almería', prestige: 46, strength: 52 },
  { id: 'hercules', name: 'Hércules', prestige: 44, strength: 50 },
];

const ITALIAN_POOL: LeagueClubSeed[] = [
  { id: 'napoli', name: 'Napoli', prestige: 58, strength: 62 },
  { id: 'torino', name: 'Torino', prestige: 52, strength: 58 },
  { id: 'atalanta', name: 'Atalanta', prestige: 52, strength: 60 },
  { id: 'verona', name: 'Hellas Verona', prestige: 48, strength: 57 },
  { id: 'brescia', name: 'Brescia', prestige: 46, strength: 56 },
  { id: 'genoa', name: 'Genoa', prestige: 48, strength: 56 },
  { id: 'ancona', name: 'Ancona', prestige: 42, strength: 53 },
  { id: 'siena', name: 'Siena', prestige: 42, strength: 54 },
];

const GERMAN_POOL: LeagueClubSeed[] = [
  { id: 'kaiserslautern', name: '1. FC Kaiserslautern', prestige: 54, strength: 58 },
  { id: 'st_pauli', name: 'FC St. Pauli', prestige: 48, strength: 55 },
  { id: 'augsburg', name: 'FC Augsburg', prestige: 46, strength: 55 },
  { id: 'union_berlin', name: 'Union Berlin', prestige: 46, strength: 54 },
  { id: 'dusseldorf', name: 'Fortuna Düsseldorf', prestige: 48, strength: 54 },
  { id: 'karlsruhe', name: 'Karlsruher SC', prestige: 46, strength: 53 },
  { id: 'duisburg', name: 'MSV Duisburg', prestige: 44, strength: 52 },
  { id: 'cottbus', name: 'Energie Cottbus', prestige: 44, strength: 52 },
];

/** Reservoir seeds per league id (broad national pool; league members filtered
 *  out at attach time). */
export const SECOND_TIER: Record<string, LeagueClubSeed[]> = {
  'eng-1': ENGLISH_POOL,
  'eng-1996': ENGLISH_POOL,
  'eng-2001': ENGLISH_POOL,
  'eng-2004': ENGLISH_POOL,
  'eng-2008': ENGLISH_POOL,
  'eng-2010': ENGLISH_POOL,
  'eng-2013': ENGLISH_POOL,
  'esp-1': SPANISH_POOL,
  'esp-2003': SPANISH_POOL,
  'esp-2006': SPANISH_POOL,
  'esp-2014': SPANISH_POOL,
  'ita-1': ITALIAN_POOL,
  'ita-1995': ITALIAN_POOL,
  'ita-2004': ITALIAN_POOL,
  'ita-2007': ITALIAN_POOL,
  'ger-1997': GERMAN_POOL,
  'ger-2009': GERMAN_POOL,
  'ger-2012': GERMAN_POOL,
};

/** Flat lookup for instantiating a promoted club not yet in the world. */
export const SECOND_TIER_CLUB: Record<string, LeagueClubSeed> = Object.fromEntries(
  [...ENGLISH_POOL, ...SPANISH_POOL, ...ITALIAN_POOL, ...GERMAN_POOL].map((c) => [c.id, c]),
);
