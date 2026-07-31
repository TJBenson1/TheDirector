import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { assessSigning } from './signingFit.js';
import type { GameState, PlayerState } from './types.js';

/** A real player from the world by (partial) name. */
function byName(s: GameState, name: string): PlayerState {
  const p = Object.values(s.players).find((pp) => pp.name.includes(name));
  if (!p) throw new Error(`no player ${name}`);
  return p;
}

describe('signing assessment — does he improve the side?', () => {
  it('a genuine positional upgrade reads as an upgrade, with arguments for', () => {
    // The friend's case: Nedvěd is a clear upgrade on Madrid's left over Solari/Savio.
    const s = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'fit' });
    const a = assessSigning(s, 'real_madrid', byName(s, 'Nedvěd'));
    expect(a.role).toBe('upgrade');
    expect(a.slotGain).toBeGreaterThan(0);
    expect(a.for.length).toBeGreaterThan(0);
    expect(a.for.join(' ')).toMatch(/upgrade|ceiling/i);
  });

  it('a player who betters no position reads as surplus, with arguments against', () => {
    // A modest striker behind Raúl/Morientes/Anelka strengthens nothing.
    const s = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'fit' });
    const base = Object.values(s.players)[0]!;
    const st = { ...base, id: 'test_surplus_st', name: 'Test Striker', birthYear: 1978, positions: ['ST'], ability: 81, potentialCeiling: 81 } as PlayerState;
    s.players['test_surplus_st'] = st;
    const a = assessSigning(s, 'real_madrid', st);
    expect(a.role).toBe('surplus');
    expect(a.against.length).toBeGreaterThan(0);
    expect(a.against.join(' ')).toMatch(/well-stocked|rotate/i);
  });

  it('fills a genuine gap when the position is short of bodies', () => {
    // Strip Madrid of its left-backs so a left-back addresses a real need.
    const s = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'fit' });
    const mad = s.clubs['real_madrid']!;
    mad.squad = mad.squad.filter((id) => !(s.players[id]?.positions.includes('LB')));
    const base = Object.values(s.players)[0]!;
    const lb = { ...base, id: 'test_lb', name: 'Test Full-back', birthYear: 1979, positions: ['LB'], ability: 80, potentialCeiling: 82 } as PlayerState;
    s.players['test_lb'] = lb;
    const a = assessSigning(s, 'real_madrid', lb);
    expect(a.for.join(' ')).toMatch(/light|need/i);
  });
});
