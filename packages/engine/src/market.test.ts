import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState, hashState } from './state.js';
import {
  inflationFactor,
  valuePlayer,
  suggestWage,
} from './finance.js';
import { generatePlayer, deriveRawStrength, clubSquadPlayers } from './players.js';
import { executeTransfer, currentYear, squadSize } from './transfers.js';
import { Rng } from './rng.js';
import type { PlayerState } from './types.js';

describe('market inflation (§11)', () => {
  it('is anchored at 1995 and rises monotonically across the era', () => {
    expect(inflationFactor(1995)).toBe(1);
    const years = [1995, 1999, 2003, 2008, 2014, 2020, 2025];
    for (let i = 1; i < years.length; i++) {
      expect(inflationFactor(years[i]!)).toBeGreaterThan(inflationFactor(years[i - 1]!));
    }
  });

  it('clamps outside the waypoint range', () => {
    expect(inflationFactor(1980)).toBe(1);
    expect(inflationFactor(2100)).toBe(inflationFactor(2025));
  });

  it('makes the same quality dwarf its 1995 price by 2020', () => {
    // Same profile (age 25, ability 88, healthy contract), valued in each era.
    const in1999 = mkPlayer({ ability: 88, birthYear: 1974, contractUntil: 2004 });
    const in2020 = mkPlayer({ ability: 88, birthYear: 1995, contractUntil: 2025 });
    expect(valuePlayer(in2020, 2020)).toBeGreaterThan(valuePlayer(in1999, 1999) * 3);
  });
});

describe('valuations & wages (§11)', () => {
  it('produce realistic 1999 figures for a top player', () => {
    const keane = mkPlayer({ ability: 90, birthYear: 1971, contractUntil: 2003 });
    const value = valuePlayer(keane, 1999);
    expect(value).toBeGreaterThan(12_000_000);
    expect(value).toBeLessThan(45_000_000);
    const wage = suggestWage(keane, 1999);
    expect(wage).toBeGreaterThan(1_000_000);
    expect(wage).toBeLessThan(4_000_000);
  });

  it('values a young high-ceiling prospect above an equal-ability veteran', () => {
    const prospect = mkPlayer({ ability: 72, potentialCeiling: 90, birthYear: 1981 }); // 18
    const veteran = mkPlayer({ ability: 72, potentialCeiling: 72, birthYear: 1966 }); // 33
    expect(valuePlayer(prospect, 1999)).toBeGreaterThan(valuePlayer(veteran, 1999));
  });

  it('cuts value for a near-expired contract', () => {
    const long = mkPlayer({ ability: 80, birthYear: 1975, contractUntil: 2004 });
    const short = mkPlayer({ ability: 80, birthYear: 1975, contractUntil: 2000 });
    expect(valuePlayer(short, 1999)).toBeLessThan(valuePlayer(long, 1999));
  });
});

describe('player generation (§4, §9e)', () => {
  it('builds a full curated + procedural world for the scenario', () => {
    const state = createNewGame({ seed: 'gen' });
    expect(Object.keys(state.players).length).toBeGreaterThan(600);
    // The curated Man Utd squad is present and flagged.
    const keane = Object.values(state.players).find((p) => p.name === 'Roy Keane');
    expect(keane?.curated).toBe(true);
    expect(keane?.club).toBe('man_utd');
  });

  it('anchors each club to its authored baseline strength at kickoff', () => {
    const state = createNewGame({ seed: 'anchor' });
    for (const club of Object.values(state.clubs)) {
      expect(Math.abs(club.strength - club.baseStrength)).toBeLessThan(0.001);
    }
  });

  it('weights nationality by club region', () => {
    const state = createNewGame({ seed: 'nat' });
    const british = ['England', 'Scotland', 'Wales', 'Ireland', 'N. Ireland'];
    const watford = clubSquadPlayers(state, 'watford');
    const brit = watford.filter((p) => british.includes(p.nationality)).length;
    expect(brit / watford.length).toBeGreaterThan(0.5);
  });

  it('generatePlayer is deterministic for a given stream', () => {
    const mk = () =>
      generatePlayer({
        id: 'x',
        clubId: 'man_utd',
        leagueId: 'eng-1',
        position: 'ST',
        targetAbility: 80,
        currentYear: 1999,
        rng: Rng.fromSeed('p'),
      });
    expect(mk()).toEqual(mk());
  });

  it('deriveRawStrength rewards a stronger squad', () => {
    const weak = [70, 68, 66].map((a, i) => mkPlayer({ id: `w${i}`, ability: a }));
    const strong = [90, 88, 86].map((a, i) => mkPlayer({ id: `s${i}`, ability: a }));
    expect(deriveRawStrength(strong)).toBeGreaterThan(deriveRawStrength(weak));
  });
});

describe('transfers (§11) + property invariants (§18)', () => {
  it('moves a player, charges the fee, and updates both squads', () => {
    const state = cloneState(createNewGame({ seed: 'xfer' }));
    const target = Object.values(state.players).find(
      (p) => p.club === 'chelsea' && p.ability >= 60,
    )!;
    const buyerBudgetBefore = state.clubs.man_utd!.finances.transferBudget;
    const sellerBudgetBefore = state.clubs.chelsea!.finances.transferBudget;

    const res = executeTransfer(state, {
      playerId: target.id,
      toClub: 'man_utd',
      fee: 5_000_000,
    });

    expect(res.ok).toBe(true);
    expect(state.players[target.id]!.club).toBe('man_utd');
    expect(state.clubs.man_utd!.squad).toContain(target.id);
    expect(state.clubs.chelsea!.squad).not.toContain(target.id);
    expect(state.clubs.man_utd!.finances.transferBudget).toBe(buyerBudgetBefore - 5_000_000);
    expect(state.clubs.chelsea!.finances.transferBudget).toBe(sellerBudgetBefore + 5_000_000);
  });

  it('refuses a transfer the buyer cannot afford — budget never goes negative', () => {
    const state = cloneState(createNewGame({ seed: 'broke' }));
    const target = Object.values(state.players).find((p) => p.club === 'arsenal')!;
    const budget = state.clubs.man_utd!.finances.transferBudget;
    const res = executeTransfer(state, {
      playerId: target.id,
      toClub: 'man_utd',
      fee: budget + 1_000_000,
    });
    expect(res.ok).toBe(false);
    // Nothing changed.
    expect(state.clubs.man_utd!.finances.transferBudget).toBe(budget);
    expect(state.players[target.id]!.club).toBe('arsenal');
  });

  it('every player belongs to exactly one club squad after transfers', () => {
    const state = cloneState(createNewGame({ seed: 'unique' }));
    // Do a handful of affordable transfers.
    const cheap = Object.values(state.players).filter(
      (p) => p.club === 'sunderland' && valuePlayer(p, currentYear(state)) < 3_000_000,
    );
    for (const p of cheap.slice(0, 3)) {
      executeTransfer(state, { playerId: p.id, toClub: 'man_utd', fee: 1_000_000 });
    }
    // Build a map of playerId → number of squads containing it.
    const counts = new Map<string, number>();
    for (const club of Object.values(state.clubs)) {
      for (const id of club.squad) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    for (const [, n] of counts) expect(n).toBe(1);
  });

  it('recomputes strength: buying a star lifts the buyer', () => {
    const state = cloneState(createNewGame({ seed: 'lift' }));
    const before = state.clubs.watford!.strength;
    // Give Watford budget and sign a strong Man Utd player.
    state.clubs.watford!.finances.transferBudget = 50_000_000;
    const star = Object.values(state.players)
      .filter((p) => p.club === 'man_utd')
      .sort((a, b) => b.ability - a.ability)[0]!;
    executeTransfer(state, { playerId: star.id, toClub: 'watford', fee: 20_000_000 });
    expect(state.clubs.watford!.strength).toBeGreaterThan(before);
  });

  it('a free agent (no club) can be signed for zero fee', () => {
    const state = cloneState(createNewGame({ seed: 'free' }));
    const freeAgent = mkPlayer({ id: 'fa1', ability: 70 });
    freeAgent.club = null;
    state.players[freeAgent.id] = freeAgent;
    const budget = state.clubs.man_utd!.finances.transferBudget;
    const res = executeTransfer(state, { playerId: 'fa1', toClub: 'man_utd' });
    expect(res.ok).toBe(true);
    expect(state.clubs.man_utd!.finances.transferBudget).toBe(budget); // free
    expect(squadSize(state, 'man_utd')).toBeGreaterThan(23);
  });

  it('world generation is deterministic (same seed ⇒ identical hash)', () => {
    const a = hashState(createNewGame({ seed: 'world-det' }));
    const b = hashState(createNewGame({ seed: 'world-det' }));
    expect(a).toBe(b);
  });
});

// ── helpers ──────────────────────────────────────────────────────────────────

function mkPlayer(overrides: Partial<PlayerState> & { ability: number }): PlayerState {
  return {
    id: overrides.id ?? 'test',
    name: 'Test Player',
    birthYear: 1975,
    nationality: 'England',
    positions: ['CM'],
    club: 'man_utd',
    contractUntil: 2004,
    wage: 1_000_000,
    potentialCeiling: overrides.ability,
    birthCeiling: overrides.potentialCeiling ?? overrides.ability,
    personality: {
      professionalism: 5,
      ego: 5,
      ambition: 5,
      loyalty: 5,
      volatility: 5,
      adaptability: 5,
    },
    injuryProneness: 30,
    curated: false,
    fitness: 100,
    morale: 75,
    form: 0,
    injury: null,
    injuryHistory: 0,
    wonderkid: false,
    benchedDevSeasons: 0,
    reachedPotential: false,
    lastSeason: null,
    seasonMonthsInjured: 0,
    adaptation: null,
    resistance: {
      clubLoyalty: 50, culturalAnchors: ['England'], dreamClubs: [], agentInfluence: 50,
      careerStagePull: 'peak', hardBlocks: [],
    },
    agitation: 0,
    ...overrides,
  };
}
