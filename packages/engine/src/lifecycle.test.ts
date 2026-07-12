import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { processSeasonDevelopment } from './development.js';
import { Rng } from './rng.js';
import type { GameState, LoggedEvent } from './types.js';

/** Walk a passive (reality-holds) Man Utd 1999 career to ~2014. */
function passiveCareer(seed: string, years = 15): GameState {
  let s = createNewGame({ scenarioId: 'man-utd-1999', seed });
  const endYear = Number(s.clock.date.slice(0, 4)) + years;
  // Ignore any decisions (reality-default): advanceWindow applies their fallout,
  // executing the real moves — so reality holds.
  for (let i = 0; i < 400 && Number(s.clock.date.slice(0, 4)) < endYear; i++) {
    s = advanceWindow(s).state;
    if (s.board.dismissed) break;
  }
  return s;
}

const ev = (s: GameState, code: string): LoggedEvent[] => s.eventLog.filter((e) => e.code === code);

describe('player lifecycle (retirement / academy / lost talent)', () => {
  const s = passiveCareer('lifecycle');

  it('retires real players within ~1–2 years of their real date', () => {
    const keane = ev(s, 'career.retired').find((e) => e.data?.playerId === 'cur_keane');
    expect(keane).toBeDefined();
    const y = Number(String(keane!.date).slice(0, 4));
    expect(y).toBeGreaterThanOrEqual(2005); // real: 2006
    expect(y).toBeLessThanOrEqual(2008);
    // Cole/Yorke/Solskjær all bow out in the same era, not still playing in 2014.
    for (const id of ['cur_cole', 'cur_yorke', 'cur_solskjaer']) {
      expect(ev(s, 'career.retired').some((e) => e.data?.playerId === id)).toBe(true);
    }
  });

  it('surfaces real academy graduates — real players only, on their real years', () => {
    const grads = ev(s, 'academy.graduate');
    const ids = grads.map((e) => String(e.data?.playerId));
    expect(ids).toContain('cur_oshea99'); // John O'Shea, 2001
    expect(ids).toContain('cur_fletcher99'); // Darren Fletcher, 2003
    // Every graduate is a real (curated) player.
    for (const e of grads) expect(s.players[String(e.data?.playerId)]?.curated).toBe(true);
  });

  it('unlocks a lost talent given real minutes at the user club (reverse reality-rail)', () => {
    // Wes Brown is a lost talent (ceiling 85, latent 89). Make him the clear
    // first-choice CB so he gets top minutes, then run development seasons: his
    // ceiling should climb past what he reached in reality.
    const g = createNewGame({ scenarioId: 'man-utd-1999', seed: 'unlock' });
    const utd = g.clubs['man_utd']!;
    utd.squad = utd.squad.filter((id) => id === 'cur_wbrown' || g.players[id]!.positions[0] !== 'CB');
    const brown = g.players['cur_wbrown']!;
    const before = brown.potentialCeiling;
    const rng = Rng.fromSeed('unlock-dev');
    for (let i = 0; i < 6; i++) processSeasonDevelopment(g, rng.fork(`s${i}`));
    expect(brown.potentialCeiling).toBeGreaterThan(before); // broke past his real ceiling
    expect(ev(g, 'development.unlocked').some((e) => e.data?.playerId === 'cur_wbrown')).toBe(true);
  });

  it('never fabricates a real-looking player to replace a retiree (anonymous depth only)', () => {
    // Every generated (procedural) player id is the anonymous p_* form; no
    // retirement ever mints a curated-looking academy name.
    for (const p of Object.values(s.players)) {
      if (p.id.includes('_y')) expect(p.curated).toBe(false); // retirement-backfill ids are anonymous
    }
  });
});
