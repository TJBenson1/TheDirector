import { describe, it, expect } from 'vitest';
import { SCENARIOS } from './scenarios.js';
import { createNewGame, hashState } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { exceedsPlausibleCeiling } from './ambition.js';
import type { GameState } from './types.js';

/** Play a passive career (resolve every decision with its first choice) for up to
 *  `years`, stopping early on dismissal. */
function playCareer(scenarioId: string, seed: string, years: number): GameState {
  let s = createNewGame({ scenarioId, seed });
  const start = s.meta.startYear;
  let guard = 0;
  while (Number(s.clock.date.slice(0, 4)) < start + years && !s.board.dismissed && guard < 500) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    s = advanceWindow(s).state;
    guard++;
  }
  return s;
}

const IDS = Object.keys(SCENARIOS);

describe('every scenario plays a full career with its invariants intact', () => {
  it.each(IDS)('%s: valid, deterministic, no fantasy leaps, pack engages', (id) => {
    const s = playCareer(id, `inv:${id}`, 12);

    // The user's club is still real and in a simulated league.
    const club = s.clubs[s.playerClub];
    expect(club, `${id}: player club missing`).toBeDefined();
    expect(club!.leagueId, `${id}: player club not in a league`).not.toBeNull();

    // No fantasy leaps: no simulated club's live strength runs past its plausible
    // ceiling without a logged multi-cause chain (the M8 hard invariant).
    for (const c of Object.values(s.clubs)) {
      if (c.leagueId == null) continue;
      expect(exceedsPlausibleCeiling(c), `${id}: ${c.name} exceeded its plausible ceiling`).toBe(false);
    }

    // If a scripted pack engaged at all this career, it must actually FIRE events
    // (a pack that only ever skips is broken).
    const fired = s.eventLog.filter((e) => e.code === 'scripted.fired').length;
    const skipped = s.eventLog.filter((e) => e.code === 'scripted.skipped').length;
    if (fired + skipped > 0) expect(fired, `${id}: scripted pack only skipped`).toBeGreaterThan(0);

    // Determinism: same seed → identical end-state hash.
    const rerun = playCareer(id, `inv:${id}`, 12);
    expect(hashState(rerun), `${id}: non-deterministic`).toBe(hashState(s));
  }, 40000);
});
