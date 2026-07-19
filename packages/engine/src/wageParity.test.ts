/**
 * Wage parity ripple (§ internal friction): football wages ratchet upward, so a
 * key player's lucrative new deal unsettles comparable teammates, who want their
 * own terms brought up to the market. Deterministic — it perturbs no roll.
 */
import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { applyConsequence } from './events.js';
import { clubSquadPlayers } from './players.js';
import type { GameState } from './types.js';

function utd2013(seed = 'wage'): GameState {
  return createNewGame({ scenarioId: 'man-utd-2013', seed });
}

describe('wage parity ripple', () => {
  it('a KEY player’s new deal unsettles his comparable, lower-paid peers', () => {
    const s = utd2013();
    const star = Object.values(s.players).find((p) => p.name === 'Wayne Rooney')!;
    const peers = clubSquadPlayers(s, 'man_utd').filter(
      (p) => p.id !== star.id && p.ability >= star.ability - 2 && p.wage < star.wage,
    );
    expect(peers.length).toBeGreaterThan(0);
    const before = new Map(peers.map((p) => [p.id, p.agitation]));

    applyConsequence(s, { kind: 'renewContract', playerId: star.id, amount: 3 });

    // The ripple is logged and the peers' unrest rose.
    const ev = s.eventLog.find((e) => e.code === 'wage.parity');
    expect(ev).toBeDefined();
    expect((ev!.data!.peers as string[]).length).toBeGreaterThan(0);
    for (const id of ev!.data!.peers as string[]) {
      expect(s.players[id]!.agitation).toBeGreaterThan(before.get(id) ?? 0);
    }
  });

  it('a squad player’s renewal does NOT move the dressing room', () => {
    const s = utd2013();
    // A fringe man well under the key-player threshold.
    const fringe = clubSquadPlayers(s, 'man_utd').sort((a, b) => a.ability - b.ability)[0]!;
    expect(fringe.ability).toBeLessThan(80);
    applyConsequence(s, { kind: 'renewContract', playerId: fringe.id, amount: 2 });
    expect(s.eventLog.some((e) => e.code === 'wage.parity')).toBe(false);
  });

  it('is deterministic — the same renewal yields the same unrest', () => {
    const run = () => {
      const s = utd2013('det');
      const star = Object.values(s.players).find((p) => p.name === 'Wayne Rooney')!;
      applyConsequence(s, { kind: 'renewContract', playerId: star.id, amount: 3 });
      return clubSquadPlayers(s, 'man_utd').map((p) => `${p.id}:${p.agitation}`).sort().join('|');
    };
    expect(run()).toBe(run());
  });
});
