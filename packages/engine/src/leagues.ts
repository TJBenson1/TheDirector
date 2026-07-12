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

export const LEAGUES: Record<string, LeagueSeed> = {
  'eng-1': ENGLAND_1999,
  'esp-1': SPAIN_2000,
  'ita-1': ITALY_1995,
  'eng-2013': ENGLAND_2013,
  'eng-2004': ENGLAND_2004,
  'eng-2001': ENGLAND_2001,
};
