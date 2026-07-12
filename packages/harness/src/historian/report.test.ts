import { describe, it, expect } from 'vitest';
import { buildReport, formatReport, skippedReport } from './report.js';
import type { ReviewVerdict, Severity } from './types.js';

function v(
  itemId: string,
  verdict: ReviewVerdict['verdict'],
  severity: Severity | null,
  extra: Partial<ReviewVerdict> = {},
): ReviewVerdict {
  return {
    itemId, verdict, severity, confidence: 'high', reasoning: 'r',
    suspectedSystem: 'valuation', category: 'career-arc', ...extra,
  };
}

describe('buildReport gating (§5)', () => {
  it('fails on a confirmed SEVERE finding', () => {
    const report = buildReport('calibration', [v('x', 'FAIL', 'SEVERE', { confirmed: true })]);
    expect(report.pass).toBe(false);
    expect(report.failReasons[0]).toContain('confirmed SEVERE');
  });

  it('does NOT fail on an unconfirmed SEVERE finding (advisory only)', () => {
    const report = buildReport('calibration', [v('x', 'FAIL', 'SEVERE', { confirmed: false })]);
    expect(report.pass).toBe(true);
    expect(report.severities.severe).toBe(1);
  });

  it('fails when MODERATE findings exceed the threshold', () => {
    const verdicts = Array.from({ length: 11 }, (_, i) => v(`m${i}`, 'FLAG', 'MODERATE'));
    const report = buildReport('calibration', verdicts, { moderateThreshold: 10 });
    expect(report.pass).toBe(false);
    expect(report.failReasons[0]).toContain('MODERATE');
  });

  it('passes MINOR findings (report only) and groups findings by system', () => {
    const report = buildReport('calibration', [
      v('a', 'PASS', null),
      v('b', 'FLAG', 'MINOR', { suspectedSystem: 'adaptation' }),
      v('c', 'FLAG', 'MODERATE', { suspectedSystem: 'valuation' }),
    ]);
    expect(report.pass).toBe(true);
    expect(report.counts).toEqual({ pass: 1, flag: 2, fail: 0 });
    // PASS is excluded from the by-system grouping.
    expect(Object.keys(report.bySystem).sort()).toEqual(['adaptation', 'valuation']);
  });
});

describe('formatReport', () => {
  it('notes a skipped run and never gates it', () => {
    const report = skippedReport('calibration');
    expect(report.pass).toBe(true);
    expect(formatReport(report)).toContain('did not run');
  });

  it('renders findings grouped by suspected system', () => {
    const md = formatReport(
      buildReport('calibration', [v('c', 'FAIL', 'SEVERE', { confirmed: true, suspectedSystem: 'rival-AI' })]),
    );
    expect(md).toContain('Realism gate: ❌ FAIL');
    expect(md).toContain('rival-AI');
    expect(md).toContain('confirmed');
  });
});
