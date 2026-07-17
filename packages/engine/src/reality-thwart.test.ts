import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { applyRealityThwarts } from './ambition.js';
import { ERA_REALITY, eraForScenario, entryKey } from './ledger.js';

describe('reality reasserts: thwarted clubs claw back (§9f)', () => {
  it('a real signing the user hijacked/blocked stings the intended buyer', () => {
    const s = cloneState(createNewGame({ seed: 'thwart-sign' }));
    const pack = ERA_REALITY[eraForScenario(s.meta.scenarioId)]!;
    const entry = pack.realTransferLedger.find(
      (e) => e.to && s.clubs[e.to] && s.clubs[e.to]!.leagueId !== null && e.to !== s.playerClub,
    )!;
    const key = entryKey(entry);
    s.meta.executedLedger.push(key); // offered as reality — but never realized (blocked/hijacked)
    const before = s.clubs[entry.to!]!.grudge;
    applyRealityThwarts(s);
    expect(s.clubs[entry.to!]!.grudge).toBeGreaterThan(before);
    expect(s.eventLog.some((e) => e.code === 'reality.thwarted-signing')).toBe(true);
  });

  it('taking a title reality favoured a rival stings the strongest rival, once', () => {
    const s = cloneState(createNewGame({ seed: 'thwart-trophy' }));
    const lg = s.leagues[s.clubs[s.playerClub]!.leagueId!]!;
    lg.titleHistory.push({ seasonYear: 1999, championId: s.playerClub, points: 90 });
    let rival = undefined as any;
    for (const id of lg.clubIds) {
      if (id === s.playerClub) continue;
      const c = s.clubs[id]; if (!c || c.leagueId === null) continue;
      if (!rival || c.prestige > rival.prestige) rival = c;
    }
    applyRealityThwarts(s);
    expect(rival.grudge).toBeGreaterThan(0);
    expect(s.eventLog.filter((e) => e.code === 'reality.thwarted-trophy')).toHaveLength(1);
    const g = rival.grudge;
    applyRealityThwarts(s); // dedup: same season doesn't sting twice
    expect(rival.grudge).toBe(g);
  });

  it('a passive, reality-following run never thwarts (calibration-safe)', () => {
    const s = cloneState(createNewGame({ seed: 'thwart-passive' }));
    applyRealityThwarts(s);
    expect(s.eventLog.some((e) => e.code.startsWith('reality.thwarted'))).toBe(false);
  });
});
