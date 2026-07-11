import { describe, it, expect } from 'vitest';
import {
  parseYearMonth,
  formatYearMonth,
  nextMonth,
  seasonMonthIndex,
  windowForMonthIndex,
  isRunInMonth,
  advanceOneMonth,
} from './clock.js';
import { createNewGame } from './state.js';

describe('YearMonth helpers', () => {
  it('parses and formats round-trip', () => {
    expect(formatYearMonth(parseYearMonth('1999-07'))).toBe('1999-07');
  });

  it('rejects malformed input', () => {
    expect(() => parseYearMonth('1999-13')).toThrow();
    expect(() => parseYearMonth('99-7')).toThrow();
    expect(() => parseYearMonth('nope')).toThrow();
  });

  it('advances months and rolls the year at December', () => {
    expect(nextMonth('1999-07')).toBe('1999-08');
    expect(nextMonth('1999-12')).toBe('2000-01');
  });
});

describe('season indexing', () => {
  it('maps July to index 0 and June to index 11', () => {
    expect(seasonMonthIndex('1999-07')).toBe(0);
    expect(seasonMonthIndex('2000-06')).toBe(11);
    expect(seasonMonthIndex('2000-01')).toBe(6);
  });

  it('opens summer in July and winter in January only', () => {
    expect(windowForMonthIndex(0)).toBe('summer');
    expect(windowForMonthIndex(6)).toBe('winter');
    expect(windowForMonthIndex(3)).toBeNull();
  });

  it('flags the spring run-in months (Mar–May)', () => {
    expect(isRunInMonth(seasonMonthIndex('2000-03'))).toBe(true);
    expect(isRunInMonth(seasonMonthIndex('2000-05'))).toBe(true);
    expect(isRunInMonth(seasonMonthIndex('2000-02'))).toBe(false);
    expect(isRunInMonth(seasonMonthIndex('2000-06'))).toBe(false);
  });
});

describe('advanceOneMonth', () => {
  it('steps the clock, updates the window, and logs the tick', () => {
    const state = createNewGame({ scenarioId: 'man-utd-1999' });
    expect(state.clock.date).toBe('1999-07');
    const before = state.eventLog.length;

    const window = advanceOneMonth(state);
    expect(state.clock.date).toBe('1999-08');
    expect(state.clock.monthIndex).toBe(1);
    expect(window).toBeNull();
    expect(state.eventLog.length).toBe(before + 1);
    expect(state.eventLog.at(-1)?.code).toBe('month.advanced');
  });

  it('reports the winter window when January arrives', () => {
    const state = createNewGame({ scenarioId: 'man-utd-1999' });
    let opened: string | null = null;
    for (let i = 0; i < 6; i++) opened = advanceOneMonth(state);
    expect(state.clock.date).toBe('2000-01');
    expect(opened).toBe('winter');
  });
});
