/**
 * Item 1 — the 2001-02 "selling clubs" (Celtic, Rangers, Galatasaray, Fenerbahçe)
 * and the emergent suitor saga that turns them from inert depth into live sources
 * of transfer stories: a giant prising a real ≥82 star away from a non-user club.
 */
import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { clubSquadPlayers } from './players.js';
import { rollDivergentStoryline, divergenceFactor } from './divergence.js';
import { Rng } from './rng.js';
import type { ClubId } from './types.js';

describe('2001-02 selling clubs', () => {
  it('Celtic, Rangers, Galatasaray and Fenerbahçe are real curated squads with a marquee ≥82 star', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'sell' });
    for (const club of ['celtic', 'rangers', 'galatasaray', 'fenerbahce'] as ClubId[]) {
      const squad = clubSquadPlayers(s, club);
      // A believable selling club, not a bare shell.
      expect(squad.length, `${club} squad size`).toBeGreaterThanOrEqual(7);
      expect(squad.every((p) => p.curated), `${club} all curated`).toBe(true);
      // The jewel the elite would come circling for.
      expect(squad.some((p) => p.ability >= 82), `${club} has a ≥82 star`).toBe(true);
    }
  });
});

describe('suitor saga — the world prises a star from a non-user club', () => {
  it('a diverged world writes a concrete, player-anchored selling story', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'saga' });
    // Force a strongly diverged world (an aggressive Director, several seasons in).
    s.userAggression = 40;
    s.clock.date = '2005-07';
    expect(divergenceFactor(s)).toBeGreaterThan(0);

    // Roll many windows; a suitor saga should eventually name a real ≥82 star at a
    // NON-user club (Larsson, Rüştü, Hasan Şaş, Barry Ferguson…).
    const rng = new Rng(12345);
    for (let i = 0; i < 200; i++) rollDivergentStoryline(s, rng);
    const sagas = s.eventLog.filter((e) => e.code === 'divergence.suitor');
    expect(sagas.length).toBeGreaterThan(0);
    for (const e of sagas) {
      const pid = e.data?.playerId as string;
      const target = s.players[pid]!;
      expect(target.curated).toBe(true);
      expect(target.ability).toBeGreaterThanOrEqual(82);
      expect(target.club).not.toBe(s.playerClub);
    }
    // At least one of the new selling clubs' stars features across the run.
    const sellingClubStarFeatured = sagas.some((e) =>
      ['celtic', 'rangers', 'galatasaray', 'fenerbahce'].includes(String(e.data?.clubId)),
    );
    expect(sellingClubStarFeatured).toBe(true);
  });

  it('a passive world never triggers a suitor saga (the calibration gate holds)', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'passive' });
    expect(s.userAggression).toBe(0);
    expect(divergenceFactor(s)).toBe(0);
    const rng = new Rng(999);
    for (let i = 0; i < 200; i++) rollDivergentStoryline(s, rng);
    expect(s.eventLog.some((e) => e.code.startsWith('divergence.'))).toBe(false);
  });
});
