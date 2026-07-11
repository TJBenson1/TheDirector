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

export const LEAGUES: Record<string, LeagueSeed> = {
  'eng-1': ENGLAND_1999,
};
