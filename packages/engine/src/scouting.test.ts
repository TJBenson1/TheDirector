import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import {
  scoutPlayer,
  medicalCheck,
  listScoutableProspects,
} from './scouting.js';
import { isProcedural } from './ledger.js';
import { Rng } from './rng.js';

describe('fog-of-war scouting (§7)', () => {
  it('returns a range that contains the true (hidden) ability', () => {
    const state = createNewGame({ seed: 'scout' });
    const keane = state.players['cur_keane']!;
    const report = scoutPlayer(state, 'man_utd', keane.id, Rng.fromSeed('r'), { observation: 0.5 });
    expect(report.ability.low).toBeLessThanOrEqual(keane.ability);
    expect(report.ability.high).toBeGreaterThanOrEqual(keane.ability);
    expect(report.potential.low).toBeLessThanOrEqual(keane.potentialCeiling);
    expect(report.potential.high).toBeGreaterThanOrEqual(keane.potentialCeiling);
    expect(['low', 'medium', 'high']).toContain(report.confidence);
  });

  it('is deterministic for the same scout/player/seed', () => {
    const state = createNewGame({ seed: 'scout-det' });
    const id = state.players['cur_keane']!.id;
    const a = scoutPlayer(state, 'man_utd', id, Rng.fromSeed('r'));
    const b = scoutPlayer(state, 'man_utd', id, Rng.fromSeed('r'));
    expect(a).toEqual(b);
  });

  it('sees own-league players more sharply than exotic ones', () => {
    const state = createNewGame({ seed: 'reach' });
    // A domestic (eng-1) player vs a foreign context-club player.
    const domestic = Object.values(state.players).find((p) => p.club === 'leeds')!;
    const exotic = Object.values(state.players).find((p) => p.club === 'real_madrid')!;
    const rHome = scoutPlayer(state, 'man_utd', domestic.id, Rng.fromSeed('a'));
    const rAway = scoutPlayer(state, 'man_utd', exotic.id, Rng.fromSeed('a'));
    const width = (x: { ability: { low: number; high: number } }) => x.ability.high - x.ability.low;
    expect(width(rHome)).toBeLessThan(width(rAway));
  });

  it('more observation narrows the range', () => {
    const state = createNewGame({ seed: 'obs' });
    const id = state.players['cur_stam']!.id;
    const shallow = scoutPlayer(state, 'man_utd', id, Rng.fromSeed('a'), { observation: 0 });
    const deep = scoutPlayer(state, 'man_utd', id, Rng.fromSeed('a'), { observation: 1 });
    const width = (x: { ability: { low: number; high: number } }) => x.ability.high - x.ability.low;
    expect(width(deep)).toBeLessThanOrEqual(width(shallow));
  });
});

describe('medicals (§7)', () => {
  it('a top medical department reports the true grade', () => {
    const state = createNewGame({ seed: 'med' });
    // Blomqvist has high injury-proneness in the curated data.
    const risky = state.players['cur_blomqvist']!;
    const res = medicalCheck(state, risky.id, 1.0, Rng.fromSeed('m'));
    expect(res.missedRisk).toBe(false);
    expect(res.grade).not.toBe('clean');
  });

  it('a poor department can miss a real risk (false-clean) over many checks', () => {
    const state = createNewGame({ seed: 'med2' });
    const risky = state.players['cur_blomqvist']!;
    let missed = 0;
    for (let i = 0; i < 200; i++) {
      const res = medicalCheck(state, risky.id, 0.1, Rng.fromSeed(`m:${i}`));
      if (res.missedRisk) missed++;
    }
    expect(missed).toBeGreaterThan(0);
  });
});

describe('prospect discovery — real players only (Principle 2)', () => {
  it('never surfaces procedural players as prospects', () => {
    const state = createNewGame({ seed: 'prospects' });
    const prospects = listScoutableProspects(state, 'man_utd');
    for (const id of prospects) {
      expect(isProcedural(state.players[id]!)).toBe(false);
    }
  });

  it('only surfaces players in the 16–18 emergence band', () => {
    const state = createNewGame({ seed: 'band' });
    const year = 1999;
    for (const id of listScoutableProspects(state, 'man_utd')) {
      const age = year - state.players[id]!.birthYear;
      expect(age).toBeGreaterThanOrEqual(16);
      expect(age).toBeLessThanOrEqual(18);
    }
  });
});
