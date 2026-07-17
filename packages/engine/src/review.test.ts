import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { resolvePlayer } from './recommend.js';
import type { GameState } from './types.js';

/** Advance to the REVIEW phase (first sub-step) of the opening summer window. */
function toReview(s: GameState): GameState {
  return advanceWindow(s, { pausePerStep: true }).state;
}

describe('pre-window REVIEW phase (§3 phase 1)', () => {
  it('surfaces a key player in his final year as a renewal decision', () => {
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'review-a' });
    const keane = resolvePlayer(s, 'Roy Keane')!;
    s.players[keane.id]!.contractUntil = 1999; // final year → can leave for free
    s = toReview(s);

    expect(s.eventLog.some((e) => e.code === 'window.review')).toBe(true);
    const offer = s.pendingDecisions.find((d) => d.id === `renew:${keane.id}`);
    expect(offer).toBeDefined();
    expect(offer!.title).toContain('Roy Keane');
    expect(offer!.clubId).toBe('man_utd');
  });

  it('renewing extends the contract and lifts morale', () => {
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'review-b' });
    const keane = resolvePlayer(s, 'Roy Keane')!;
    s.players[keane.id]!.contractUntil = 1999;
    const morale0 = s.players[keane.id]!.morale;
    s = toReview(s);
    s = applyDecision(s, `renew:${keane.id}`, 'renew').state;

    expect(s.players[keane.id]!.contractUntil).toBeGreaterThanOrEqual(2002);
    expect(s.players[keane.id]!.morale).toBeGreaterThan(morale0);
  });

  it('reality-default: an ignored renewal keeps the player (never lost to inattention)', () => {
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'review-c' });
    const keane = resolvePlayer(s, 'Roy Keane')!;
    s.players[keane.id]!.contractUntil = 1999;
    s = toReview(s);
    // Do NOT act on the renewal — advance through the window; reality-default renews.
    for (let i = 0; i < 6 && s.pendingDecisions.some((d) => d.id === `renew:${keane.id}`); i++) {
      s = advanceWindow(s, { pausePerStep: true }).state;
    }
    expect(s.players[keane.id]!.contractUntil).toBeGreaterThan(1999); // secured, not run down
  });

  it('only the user club is reviewed — no renewal offers for rivals', () => {
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'review-d' });
    s = toReview(s);
    for (const d of s.pendingDecisions.filter((d) => d.id.startsWith('renew:'))) {
      expect(d.clubId).toBe('man_utd');
    }
  });
});
