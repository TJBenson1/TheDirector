import { describe, it, expect } from 'vitest';
import { createNewGame, SCENARIOS } from './index.js';

/**
 * Data-integrity guard. Curated squads are authored across many files by
 * different passes (and research agents that can't see each other's ids), so a
 * player id reused for two different real players silently puts one man in two
 * squads and overwrites the other. This scans every scenario at kickoff and
 * fails on ANY duplicate squad membership — the cheap check that catches an id
 * collision the moment it's introduced.
 */
describe('curated data integrity', () => {
  it('no player id appears in more than one squad (no id collisions)', () => {
    const offenders: string[] = [];
    for (const scenarioId of Object.keys(SCENARIOS)) {
      const s = createNewGame({ scenarioId: scenarioId as never, seed: 'collide' });
      const seen = new Map<string, string>();
      for (const club of Object.values(s.clubs)) {
        for (const id of club.squad) {
          const prior = seen.get(id);
          if (prior) offenders.push(`${scenarioId}: ${id} (${s.players[id]?.name}) in ${prior} & ${club.id}`);
          else seen.set(id, club.id);
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
