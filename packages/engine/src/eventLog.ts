import type { GameState, LoggedEvent, LoggedEventCategory } from './types.js';

export interface LogInput {
  category: LoggedEventCategory;
  code: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Append one entry to the append-only audit trail (§1 rule #2) and return it.
 *
 * Mutates `state.eventLog` and `state.meta.nextSeq`. This is intended to be
 * called on a working *draft* of GameState inside an engine transition — the
 * engine's external contract stays pure because transitions clone at their
 * boundary (see `advance`). `seq` is monotonic so replays and UI diffs
 * (`GET /game/:id/log?since=`) have a stable ordering key.
 */
export function logEvent(state: GameState, input: LogInput): LoggedEvent {
  const entry: LoggedEvent = {
    seq: state.meta.nextSeq,
    date: state.clock.date,
    category: input.category,
    code: input.code,
    message: input.message,
    ...(input.data ? { data: input.data } : {}),
  };
  state.eventLog.push(entry);
  state.meta.nextSeq += 1;
  return entry;
}

/** Events at or after a given sequence number (for `GET /game/:id/log?since=`). */
export function eventsSince(state: GameState, since: number): LoggedEvent[] {
  if (since <= 0) return state.eventLog.slice();
  return state.eventLog.filter((e) => e.seq >= since);
}
