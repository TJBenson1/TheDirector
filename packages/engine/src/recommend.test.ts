import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { suggestTargets, queryPlayer, acquisitionTags, askingPrice, resolvePlayer } from './recommend.js';
import { isProcedural } from './ledger.js';
import { valuePlayer } from './finance.js';

describe('target suggestions (§16 UI)', () => {
  it('suggests real players for a position, ≥16, not at the user club', () => {
    const state = createNewGame({ seed: 'targets' });
    const list = suggestTargets(state, 'CM', { maxResults: 10 });
    expect(list.length).toBeGreaterThan(3);
    for (const t of list) {
      const p = state.players[t.playerId]!;
      expect(isProcedural(p)).toBe(false); // real players only
      expect(t.club).not.toBe(state.playerClub);
      expect(t.age).toBeGreaterThanOrEqual(16);
      // Position-relevant.
      expect(p.positions.some((pos) => ['DM', 'CM', 'AM'].includes(pos))).toBe(true);
    }
  });

  it('surfaces fire-sale (distressed-club) options and prices them cheaply', () => {
    const state = createNewGame({ seed: 'firesale' });
    // Lazio is in crisis this scenario. A LOWER-loyalty mercenary (Verón, whom
    // the real collapse sold to United) is a flagged, cheap fire-sale — while a
    // loyal one-club icon like Nesta rides it out and is shielded (not a bargain).
    const veron = resolvePlayer(state, 'Verón')!;
    expect(state.clubs[veron.club!]!.financialHealth).toBe('crisis');
    expect(acquisitionTags(state, veron)).toContain('fire-sale');
    // A crisis club sells its non-loyalists below market.
    expect(askingPrice(state, veron.id)).toBeLessThan(valuePlayer(veron, 1999));
  });

  it('flags a player in the last year of his deal as a Bosman', () => {
    const state = cloneState(createNewGame({ seed: 'bosman' }));
    const p = resolvePlayer(state, 'Sol Campbell')!;
    p.contractUntil = 2000; // one year left in 1999
    expect(acquisitionTags(state, p)).toContain('bosman');
  });
});

describe('player query + the 16+ rule (§4)', () => {
  it('answers a query about a specific real player', () => {
    const state = createNewGame({ seed: 'query' });
    const q = queryPlayer(state, 'Alessandro Nesta');
    expect(q.visible).toBe(true);
    expect(q.report?.name).toBe('Alessandro Nesta');
    expect(q.report?.ability.low).toBeLessThanOrEqual(state.players[resolvePlayer(state, 'Nesta')!.id]!.ability);
  });

  it('resolves by partial name', () => {
    const state = createNewGame({ seed: 'q2' });
    expect(resolvePlayer(state, 'zidane')?.name).toBe('Zinedine Zidane');
  });

  it('hides a player under 16 (not yet on the radar)', () => {
    const state = cloneState(createNewGame({ seed: 'young' }));
    const p = resolvePlayer(state, 'Casillas')!;
    p.birthYear = 1985; // 14 in 1999
    const q = queryPlayer(state, 'Casillas');
    expect(q.visible).toBe(false);
    expect(q.note).toMatch(/16\+ rule|not yet on the radar/i);
  });

  it('never surfaces procedural filler as a queryable player', () => {
    const state = createNewGame({ seed: 'filler' });
    const proc = Object.values(state.players).find((p) => isProcedural(p))!;
    const q = queryPlayer(state, proc.id);
    expect(q.visible).toBe(false);
  });
});
