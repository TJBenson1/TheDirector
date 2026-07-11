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

export const LEAGUES: Record<string, LeagueSeed> = {
  'eng-1': ENGLAND_1999,
  'esp-1': SPAIN_2000,
};
