import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { firePersonalEvents } from './events.js';
import type { GameState } from './types.js';

/** Rio Ferdinand starts at Leeds in man-utd-1999 (he joined United in 2002); his
 *  missed-drug-test storyline (2003-09) is the flagship "story follows the man". */
function rioGameAt(date: string): GameState {
  const state = createNewGame({ scenarioId: 'man-utd-1999', seed: 'rio' });
  state.clock = { ...state.clock, date };
  return state;
}

const personalLogs = (s: GameState, code: string) =>
  s.eventLog.filter((e) => e.code === code && e.data?.id === 'rio-missed-test');

describe('personal storylines follow the player (§9f)', () => {
  it('does not fire while the player sits at his origin club (calibration-safe)', () => {
    const s = rioGameAt('2003-09');
    // Rio is untouched at Leeds (his seed club) — not displaced.
    expect(s.players['cur_ferdinand']!.club).toBe('leeds');
    firePersonalEvents(s);
    expect(personalLogs(s, 'personal.world')).toHaveLength(0);
    expect(personalLogs(s, 'personal.fired')).toHaveLength(0);
    expect(s.pendingDecisions.some((d) => d.id.startsWith('personal:rio-missed-test'))).toBe(false);
  });

  it('defers to the scenario pack when he is at his home club (United)', () => {
    const s = rioGameAt('2003-09');
    s.players['cur_ferdinand']!.club = 'man_utd'; // the pack owns the beat here
    firePersonalEvents(s);
    expect(personalLogs(s, 'personal.world')).toHaveLength(0);
    expect(personalLogs(s, 'personal.fired')).toHaveLength(0);
  });

  it('follows him as logged colour when the counterfactual sends him to a rival', () => {
    const s = rioGameAt('2003-09');
    s.players['cur_ferdinand']!.club = 'arsenal'; // "Rio still misses his drug test at Arsenal"
    firePersonalEvents(s);
    expect(personalLogs(s, 'personal.world')).toHaveLength(1);
    expect(s.timeline.divergenceLog.some((d) => d.detail.includes('Ferdinand'))).toBe(true);
  });

  it('becomes a decision at your own club — only once the world is reshaped', () => {
    // Passive user who happens to hold a displaced Rio: colour, never a decision.
    const passive = rioGameAt('2003-09');
    passive.playerClub = 'chelsea';
    passive.players['cur_ferdinand']!.club = 'chelsea'; // displaced from Leeds, not his home club
    passive.userAggression = 2;
    firePersonalEvents(passive);
    expect(passive.pendingDecisions.some((d) => d.id.startsWith('personal:rio-missed-test'))).toBe(false);
    expect(personalLogs(passive, 'personal.world')).toHaveLength(1);

    // Reshaped user: the story lands as an interactive decision.
    const reshaped = rioGameAt('2003-09');
    reshaped.playerClub = 'chelsea';
    reshaped.players['cur_ferdinand']!.club = 'chelsea';
    reshaped.userAggression = 20;
    firePersonalEvents(reshaped);
    expect(reshaped.pendingDecisions.some((d) => d.id.startsWith('personal:rio-missed-test'))).toBe(true);
  });

  it('fires only once, and lapses if its window passes', () => {
    const s = rioGameAt('2003-09');
    s.players['cur_ferdinand']!.club = 'arsenal';
    firePersonalEvents(s);
    firePersonalEvents(s); // second call in the same window
    expect(personalLogs(s, 'personal.world')).toHaveLength(1);

    // A fresh game where the window has already elapsed: it never lands.
    const late = rioGameAt('2006-01');
    late.players['cur_ferdinand']!.club = 'arsenal';
    firePersonalEvents(late);
    expect(personalLogs(late, 'personal.world')).toHaveLength(0);
  });
});
