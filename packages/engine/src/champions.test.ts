import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import type { GameState } from './types.js';

function play(scenarioId: string, seed: string, endYear: number, hook?: (s: GameState) => void): GameState {
  let s = createNewGame({ scenarioId, seed });
  let guard = 0;
  while (Number(s.clock.date.slice(0, 4)) < endYear && guard++ < 120) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    if (s.board.dismissed) {
      s.board.dismissed = false;
      s.board.patience = 40;
      s.board.warnings = 0;
    }
    hook?.(s);
    s = advanceWindow(s).state;
  }
  return s;
}
const clWinner = (s: GameState, finalYear: number): string | undefined =>
  s.europeanCup?.titleHistory.find((t) => t.seasonYear === finalYear - 1)?.winnerId;

describe('Champions League (§ butterfly showcase)', () => {
  it('reality-default: a passive world reproduces the real European Cup winners', () => {
    const s = play('arsenal-2004', 'ucl', 2010);
    // era-2004 window, reality-anchored.
    expect(clWinner(s, 2006)).toBe('barcelona'); // Ronaldinho's Barça
    expect(clWinner(s, 2007)).toBe('milan');
    expect(clWinner(s, 2008)).toBe('man_utd');
    expect(clWinner(s, 2009)).toBe('barcelona'); // Guardiola's Barça
  });

  it('a butterfly that saps a champion flips the trophy to the next-best side', () => {
    // Barça, weakened (never landed Ronaldinho/Eto'o/Deco) — a strength drop
    // below their real baseline. Reality no longer holds where it depended on them.
    const weaken = (s: GameState) => {
      const b = s.clubs['barcelona'];
      if (b) b.strength = Math.max(20, b.baseStrength - 7);
    };
    const s = play('arsenal-2004', 'ucl', 2010, weaken);
    expect(clWinner(s, 2006)).not.toBe('barcelona'); // someone else lifts it
    expect(clWinner(s, 2009)).not.toBe('barcelona');
    // A year that never depended on Barça is untouched.
    expect(clWinner(s, 2008)).toBe('man_utd');
  });
});

describe('temporary relegation (Calciopoli)', () => {
  it('Juventus vanish from Serie A for a season and return', () => {
    const s = play('juventus-1995', 'releg', 2009);
    const ita = s.leagues['ita-1']!;
    // Back in the top flight by 2007-08, at a full 18-club division.
    expect(ita.clubIds).toContain('juventus');
    expect(ita.clubIds).not.toContain('promoted_juventus');
    expect(ita.clubIds).toHaveLength(18);
    expect(s.clubs['juventus']!.relegatedUntil).toBeUndefined();
    // The drop-and-return really happened.
    expect(s.eventLog.some((e) => e.code === 'club.relegated' && e.data?.clubId === 'juventus')).toBe(true);
    expect(s.eventLog.some((e) => e.code === 'club.promoted' && e.data?.clubId === 'juventus')).toBe(true);
    // While relegated (2006-07), Juventus did not contest the Champions League.
    const cl0607 = s.europeanCup?.titleHistory.find((t) => t.seasonYear === 2006);
    expect(cl0607?.winnerId).not.toBe('juventus');
  });
});
