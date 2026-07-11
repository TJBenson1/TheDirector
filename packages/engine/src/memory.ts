/**
 * Narrative memory (§10). Append-only entries consumed by the event engine,
 * rival AI, and narration — grudges, fan trust, media threads. A small system
 * with a large realism payoff: consequences thread across seasons.
 */

import type { GameState } from './types.js';

export function appendMemory(state: GameState, tag: string, detail: string): void {
  state.timeline.narrativeMemory.push({ date: state.clock.date, tag, detail });
}

/** Recent memory entries with a given tag (most recent last). */
export function memoriesWithTag(state: GameState, tag: string): typeof state.timeline.narrativeMemory {
  return state.timeline.narrativeMemory.filter((m) => m.tag === tag);
}
