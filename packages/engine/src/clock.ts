/**
 * The two-clock model (§3).
 *
 * - Decision clock: two windows per year (summer, winter) — the player's turn.
 * - Simulation clock: the season runs month-by-month underneath. Injuries,
 *   scandals and rival moves fire mid-window; interrupt-class events can pause
 *   the sim and hand control back between windows.
 *
 * A football season runs July → June. We index months within the season 0..11
 * (July = 0 … June = 11) so seasonal logic ("spring run-in congestion", §9c)
 * is index arithmetic rather than calendar juggling.
 */

import type { GameState, SeasonWindow, YearMonth } from './types.js';
import { logEvent } from './eventLog.js';

/** Season starts in July (calendar month 7). */
export const SEASON_START_CALENDAR_MONTH = 7;

/** Summer window opens in July (season index 0); winter window in January (index 6). */
export const SUMMER_WINDOW_MONTH_INDEX = 0;
export const WINTER_WINDOW_MONTH_INDEX = 6;

/**
 * How many sub-steps a transfer window unfolds over (§3 multi-step windows).
 * The user acts between steps; real ledger moves are distributed across them so
 * business lands at different points (early → mid → deadline day). Three keeps
 * the loop light while giving a genuine "deadline day" beat.
 */
/**
 * A transfer window unfolds over four phases (§3), not an instant:
 *  1 REVIEW   — pre-window: the club's looming issues (expiries, retirements,
 *               decline, injuries) and the user's own real ins/outs are surfaced.
 *  2 MARKET   — the market opens; reality moves the user would never touch
 *               execute; the relevant shortlist becomes visible.
 *  3 DECISIONS— narrow the shortlist, woo long-term targets, defer or act.
 *  4 DEADLINE — reality-default holds on anything left open, and every remaining
 *               transfer CHAIN settles in-window; rivals react. Nothing defers.
 */
export const WINDOW_STEPS = 4;
export const WINDOW_PHASE_REVIEW = 1;
export const WINDOW_PHASE_MARKET = 2;
export const WINDOW_PHASE_DECISIONS = 3;
export const WINDOW_PHASE_DEADLINE = 4;

/** Human-readable name for a window phase (1..WINDOW_STEPS). */
export function windowStepLabel(step: number): string {
  if (step <= WINDOW_PHASE_REVIEW) return 'pre-window review';
  if (step === WINDOW_PHASE_MARKET) return 'window opens';
  if (step >= WINDOW_STEPS) return 'deadline day';
  return 'mid-window';
}

export interface ParsedYearMonth {
  year: number;
  month: number; // 1..12
}

export function parseYearMonth(ym: YearMonth): ParsedYearMonth {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) throw new Error(`Invalid YearMonth: "${ym}" (expected YYYY-MM)`);
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) throw new Error(`Invalid month in YearMonth: "${ym}"`);
  return { year, month };
}

export function formatYearMonth({ year, month }: ParsedYearMonth): YearMonth {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
}

/**
 * Ordinal identifying the transfer window a calendar month belongs to, so two
 * months in the SAME real window compare equal. The sim models a summer window
 * (opening around July) and a winter window (January), but the real ledger dates
 * moves to their actual month — a late-summer transfer is `YYYY-08` or `YYYY-09`.
 * Without this, a lexical `YYYY-MM` compare strands an August move outside the
 * July summer window and defers it to January (e.g. Van der Sar → Juventus).
 *
 * Months Jun–Dec map to that year's SUMMER window; Jan–May map to that year's
 * WINTER window. `year*2 + isSummer` then orders windows chronologically:
 * winter(Y) < summer(Y) < winter(Y+1).
 */
export function transferWindowOrdinal(ym: YearMonth): number {
  const { year, month } = parseYearMonth(ym);
  const isSummer = month >= SEASON_START_CALENDAR_MONTH - 1 ? 1 : 0; // Jun onward = summer
  return year * 2 + isSummer;
}

/** The next calendar month (rolls the year over from December). */
export function nextMonth(ym: YearMonth): YearMonth {
  const { year, month } = parseYearMonth(ym);
  return month === 12 ? formatYearMonth({ year: year + 1, month: 1 }) : formatYearMonth({ year, month: month + 1 });
}

/** Season index 0..11 (July = 0 … June = 11) for a calendar month. */
export function seasonMonthIndex(ym: YearMonth): number {
  const { month } = parseYearMonth(ym);
  return (month - SEASON_START_CALENDAR_MONTH + 12) % 12;
}

/** Which decision window (if any) opens at a given season index. */
export function windowForMonthIndex(monthIndex: number): SeasonWindow {
  if (monthIndex === SUMMER_WINDOW_MONTH_INDEX) return 'summer';
  if (monthIndex === WINTER_WINDOW_MONTH_INDEX) return 'winter';
  return null;
}

/** True during the spring run-in (Mar–May), when congestion elevates injury risk (§9c). */
export function isRunInMonth(monthIndex: number): boolean {
  // Mar = index 8, Apr = 9, May = 10.
  return monthIndex >= 8 && monthIndex <= 10;
}

/**
 * Advance the simulation clock by exactly one month, in place on a draft state.
 * Updates date, season index and the active decision window, and logs the tick.
 * Returns the newly-opened window (or null) so callers can decide whether to
 * pause for the player.
 */
export function advanceOneMonth(state: GameState): SeasonWindow {
  const newDate = nextMonth(state.clock.date);
  const monthIndex = seasonMonthIndex(newDate);
  const window = windowForMonthIndex(monthIndex);

  state.clock.date = newDate;
  state.clock.monthIndex = monthIndex;
  state.clock.window = window;
  // Entering a window opens it at step 1 (early business); a non-window month
  // clears the sub-step. Mid-window steps (2..N) are driven by advanceWindow
  // without moving the calendar, so this only ever sets the opening step.
  state.clock.windowStep = window !== null ? 1 : 0;

  logEvent(state, {
    category: 'clock',
    code: 'month.advanced',
    message: `Advanced to ${newDate}${window ? ` (${window} window opens)` : ''}`,
    data: { date: newDate, monthIndex, window },
  });

  return window;
}
