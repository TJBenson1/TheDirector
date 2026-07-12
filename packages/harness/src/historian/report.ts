/**
 * Aggregation (§5) → the realism report + the CI signal (§6).
 *
 * Gating rules:
 *   - Any CONFIRMED SEVERE finding        → CI fails.
 *   - MODERATE findings > N per batch      → CI fails (N tunable, default 10).
 *   - MINOR findings                       → report only (human review).
 * Findings are grouped by `suspectedSystem` so the report tells us which engine
 * module is drifting — turning review into actionable regression targeting.
 */

import type {
  HistorianMode,
  HistorianReport,
  ReviewVerdict,
} from './types.js';

export interface ReportOptions {
  /** Max MODERATE findings before the gate fails (§5, start 10). */
  moderateThreshold?: number;
}

function groupBySystem(verdicts: ReviewVerdict[]): Record<string, ReviewVerdict[]> {
  const out: Record<string, ReviewVerdict[]> = {};
  for (const v of verdicts) {
    if (v.verdict === 'PASS') continue;
    const key = v.suspectedSystem || 'unknown';
    (out[key] ??= []).push(v);
  }
  return out;
}

export function buildReport(
  mode: HistorianMode,
  verdicts: ReviewVerdict[],
  options: ReportOptions = {},
): HistorianReport {
  const moderateThreshold = options.moderateThreshold ?? 10;

  const counts = { pass: 0, flag: 0, fail: 0 };
  const severities = { minor: 0, moderate: 0, severe: 0 };
  for (const v of verdicts) {
    if (v.verdict === 'PASS') counts.pass++;
    else if (v.verdict === 'FLAG') counts.flag++;
    else counts.fail++;
    if (v.severity === 'MINOR') severities.minor++;
    else if (v.severity === 'MODERATE') severities.moderate++;
    else if (v.severity === 'SEVERE') severities.severe++;
  }

  const confirmedSevere = verdicts.filter((v) => v.severity === 'SEVERE' && v.confirmed === true);
  const failReasons: string[] = [];
  if (confirmedSevere.length > 0) {
    failReasons.push(
      `${confirmedSevere.length} confirmed SEVERE finding(s): ${confirmedSevere
        .map((v) => v.itemId)
        .join(', ')}`,
    );
  }
  if (severities.moderate > moderateThreshold) {
    failReasons.push(
      `${severities.moderate} MODERATE findings exceed the per-batch threshold of ${moderateThreshold}`,
    );
  }

  return {
    mode,
    ran: true,
    itemsReviewed: verdicts.length,
    verdicts,
    counts,
    severities,
    bySystem: groupBySystem(verdicts),
    pass: failReasons.length === 0,
    failReasons,
  };
}

/** A report for a run that was skipped (no client / historian off). Never fails. */
export function skippedReport(mode: HistorianMode): HistorianReport {
  return {
    mode,
    ran: false,
    itemsReviewed: 0,
    verdicts: [],
    counts: { pass: 0, flag: 0, fail: 0 },
    severities: { minor: 0, moderate: 0, severe: 0 },
    bySystem: {},
    pass: true,
    failReasons: [],
  };
}

/** Render the realism-report.md build artifact (§6). */
export function formatReport(report: HistorianReport): string {
  const L: string[] = [];
  L.push(`# Realism Report — Historian (${report.mode})`);
  L.push('');
  if (!report.ran) {
    L.push('_Historian did not run (no API key / `--historian=off`). No realism review performed._');
    L.push('');
    return L.join('\n');
  }

  const gate = report.pass ? '✅ PASS' : '❌ FAIL';
  L.push(`**Realism gate: ${gate}**`);
  if (report.failReasons.length > 0) {
    for (const r of report.failReasons) L.push(`- ${r}`);
  }
  L.push('');
  L.push(
    `Reviewed **${report.itemsReviewed}** items — ` +
      `${report.counts.pass} PASS · ${report.counts.flag} FLAG · ${report.counts.fail} FAIL ` +
      `(severity: ${report.severities.minor} minor, ${report.severities.moderate} moderate, ${report.severities.severe} severe).`,
  );
  L.push('');

  const systems = Object.keys(report.bySystem).sort(
    (a, b) => report.bySystem[b]!.length - report.bySystem[a]!.length,
  );
  if (systems.length === 0) {
    L.push('_No FLAG/FAIL findings — every reviewed item read as believable football._');
    return L.join('\n');
  }

  L.push('## Findings by suspected system');
  L.push('');
  for (const sys of systems) {
    const findings = report.bySystem[sys]!;
    L.push(`### ${sys} (${findings.length})`);
    // Most severe first.
    const order = { SEVERE: 0, MODERATE: 1, MINOR: 2 } as const;
    const sorted = [...findings].sort(
      (a, b) => (order[a.severity ?? 'MINOR'] ?? 3) - (order[b.severity ?? 'MINOR'] ?? 3),
    );
    for (const v of sorted) {
      const sev = v.severity ?? '—';
      const conf = v.severity === 'SEVERE' ? (v.confirmed ? ', confirmed' : ', UNCONFIRMED') : '';
      L.push(`- **[${v.verdict}/${sev}${conf}]** \`${v.itemId}\` (${v.confidence} conf) — ${v.reasoning}`);
    }
    L.push('');
  }
  return L.join('\n');
}
