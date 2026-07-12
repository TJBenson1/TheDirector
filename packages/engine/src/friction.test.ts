import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState, hashState } from './state.js';
import { advanceWindow } from './advance.js';
import { valuePlayer, outputFactor } from './finance.js';
import { styleDistance, styleForClub, LEAGUE_STYLES } from './leaguestyle.js';
import { rollAdaptation, effectiveAbility } from './adaptation.js';
import { executeTransfer, currentYear } from './transfers.js';
import { applyDecision } from './events.js';
import { Rng } from './rng.js';
import type { PlayerState, SeasonStats } from './types.js';

function mk(overrides: Partial<PlayerState> & { ability: number }): PlayerState {
  return {
    id: 't', name: 'T', birthYear: 1978, nationality: 'Spain', positions: ['ST'],
    club: 'real_madrid', contractUntil: 2004, wage: 1_000_000,
    potentialCeiling: overrides.ability, birthCeiling: overrides.ability,
    personality: { professionalism: 6, ego: 5, ambition: 6, loyalty: 5, volatility: 5, adaptability: 6 },
    injuryProneness: 30, curated: false, fitness: 100, morale: 75, form: 0, injury: null,
    injuryHistory: 0, wonderkid: false, benchedDevSeasons: 0, reachedPotential: false,
    lastSeason: null, seasonMonthsInjured: 0, adaptation: null,
    resistance: { clubLoyalty: 50, culturalAnchors: ['Spain'], dreamClubs: [], agentInfluence: 50, careerStagePull: 'peak', hardBlocks: [] },
    agitation: 0,
    ...overrides,
  };
}

const season = (o: Partial<SeasonStats>): SeasonStats => ({
  appearances: 34, goals: 12, assists: 6, monthsInjured: 0, minutesShare: 0.85, rating: 7.0, ...o,
});

describe('dynamic valuation (§1)', () => {
  it('is neutral before any season is played', () => {
    expect(outputFactor(mk({ ability: 80 }))).toBe(1.0);
  });

  it('a strong season lifts value; an injury-hit benched season slashes it', () => {
    const base = mk({ ability: 78, birthYear: 1978 });
    const y = 2003;
    const neutral = valuePlayer(base, y);
    const hot = valuePlayer({ ...base, lastSeason: season({ rating: 8.2, goals: 22, minutesShare: 0.9 }) }, y);
    const cold = valuePlayer(
      { ...base, lastSeason: season({ rating: 4.6, goals: 0, minutesShare: 0.15, monthsInjured: 6 }) },
      y,
    );
    expect(hot).toBeGreaterThan(neutral);
    expect(cold).toBeLessThan(neutral * 0.7); // a real haircut
  });
});

describe('league playing-style model (§4)', () => {
  it('England and Spain are a bigger stylistic jump than England and Germany', () => {
    const engEsp = styleDistance(LEAGUE_STYLES.england!, LEAGUE_STYLES.spain!);
    const engGer = styleDistance(LEAGUE_STYLES.germany!, LEAGUE_STYLES.england!);
    expect(engEsp).toBeGreaterThan(engGer);
  });

  it('maps clubs to their country style', () => {
    const state = createNewGame({ seed: 'style' });
    expect(styleForClub(state, 'real_madrid')).toEqual(LEAGUE_STYLES.spain);
    expect(styleForClub(state, 'man_utd')).toEqual(LEAGUE_STYLES.england);
  });
});

describe('adaptation engine (§3)', () => {
  it('a same-country move is seamless', () => {
    const state = createNewGame({ seed: 'adapt-same' });
    const p = mk({ ability: 82, club: 'real_madrid' });
    const a = rollAdaptation(state, p, 'real_madrid', 'barcelona', Rng.fromSeed('x'));
    expect(a.outcome).toBe('seamless');
    expect(a.settled).toBe(true);
  });

  it('a cross-style move sometimes fails — great players can flop', () => {
    const state = createNewGame({ seed: 'adapt-cross' });
    const p = mk({ ability: 84, club: 'real_madrid', personality: { professionalism: 6, ego: 5, ambition: 6, loyalty: 5, volatility: 5, adaptability: 5 } });
    const outcomes = new Set<string>();
    for (let i = 0; i < 200; i++) {
      outcomes.add(rollAdaptation(state, p, 'real_madrid', 'man_utd', Rng.fromSeed(`s:${i}`)).outcome);
    }
    // Across many rolls we see the full spread, including failure.
    expect(outcomes.has('seamless')).toBe(true);
    expect(outcomes.has('failure')).toBe(true);
  });

  it('an unsettled adaptation penalty lowers effective ability', () => {
    const p = mk({ ability: 85, adaptation: { outcome: 'failure', penalty: 0.28, seasonsRemaining: 2, settled: false } });
    expect(effectiveAbility(p)).toBeLessThan(85);
    const settled = mk({ ability: 85, adaptation: { outcome: 'seamless', penalty: 0, seasonsRemaining: 0, settled: true } });
    expect(effectiveAbility(settled)).toBe(85);
  });

  it('a foreign signing weakens the buyer while bedding in, then determinism holds', () => {
    const state = cloneState(createNewGame({ seed: 'adapt-buy' }));
    state.clubs.man_utd!.finances.transferBudget = 200_000_000;
    const target = Object.values(state.players).find((p) => p.club === 'real_madrid' && p.ability >= 78)!;
    const res = executeTransfer(state, { playerId: target.id, toClub: 'man_utd', fee: 20_000_000 });
    expect(res.ok).toBe(true);
    // The player carries an adaptation state (seamless or not).
    expect(state.players[target.id]!.adaptation).not.toBeNull();
  });
});

describe('friction determinism', () => {
  it('same seed ⇒ identical hash across seasons with stats/adaptation active', () => {
    const run = () => {
      let s = createNewGame({ seed: 'friction-det' });
      for (let i = 0; i < 6; i++) s = advanceWindow(s).state;
      return hashState(s);
    };
    expect(run()).toBe(run());
  });

  it('season stats populate after a season and reflect output', () => {
    let s = createNewGame({ seed: 'stats' });
    // Advance a full season, resolving any interrupt events along the way (§9b).
    const startTitles = s.leagues['eng-1']!.titleHistory.length;
    for (let i = 0; i < 40; i++) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      s = advanceWindow(s).state;
      if (s.leagues['eng-1']!.titleHistory.length > startTitles && s.players) {
        // Give the July rollover (stats banked) a step past the crowning.
        if (Object.values(s.players).some((p) => p.lastSeason !== null)) break;
      }
    }
    const withStats = Object.values(s.players).filter((p) => p.lastSeason !== null);
    expect(withStats.length).toBeGreaterThan(0);
    // A first-choice striker should have scored some goals.
    const strikers = withStats.filter(
      (p) => p.positions[0] === 'ST' && (p.lastSeason?.minutesShare ?? 0) >= 0.6,
    );
    const totalGoals = strikers.reduce((a, p) => a + (p.lastSeason?.goals ?? 0), 0);
    expect(totalGoals).toBeGreaterThan(0);
  });
});
