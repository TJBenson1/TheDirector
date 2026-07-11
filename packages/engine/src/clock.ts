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

  logEvent(state, {
    category: 'clock',
    code: 'month.advanced',
    message: `Advanced to ${newDate}${window ? ` (${window} window opens)` : ''}`,
    data: { date: newDate, monthIndex, window },
  });

  return window;
}
