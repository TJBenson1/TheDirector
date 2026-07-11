/**
 * Monte Carlo harness runner (§12). Runs a batch of headless careers across a
 * mix of strategy bots, evaluates the calibration targets, prints a report, and
 * exits non-zero if any ACTIVE target is out of band — this is the realism gate
 * that CI enforces (§18).
 *
 * Usage: tsx src/run.ts [--careers=N] [--years=Y] [--seed=S] [--scenario=ID]
 * Defaults: 500 careers × 15 years (the §12 spec minimum).
 */

import { runCareer } from './runCareer.js';
import { ALL_BOTS } from './strategy.js';
import { evaluateAll, type TargetResult } from './calibration.js';
import type { CareerMetrics } from './metrics.js';

interface Args {
  careers: number;
  years: number;
  seed: string;
  scenario: string;
}

function parseArgs(argv: string[]): Args {
  const get = (k: string, d: string) => {
    const hit = argv.find((a) => a.startsWith(`--${k}=`));
    return hit ? hit.slice(k.length + 3) : d;
  };
  return {
    careers: Math.max(1, Number(get('careers', '500'))),
    years: Math.max(1, Number(get('years', '15'))),
    seed: get('seed', 'harness'),
    scenario: get('scenario', 'man-utd-1999'),
  };
}

function runBatch(args: Args): CareerMetrics[] {
  const careers: CareerMetrics[] = [];
  for (let i = 0; i < args.careers; i++) {
    // Deterministic per-career seed + a rotating bot for strategy mix (§12).
    const bot = ALL_BOTS[i % ALL_BOTS.length]!;
    careers.push(
      runCareer({
        scenarioId: args.scenario,
        seed: `${args.seed}:${i}`,
        years: args.years,
        bot,
      }),
    );
  }
  return careers;
}

function printReport(args: Args, careers: CareerMetrics[], results: TargetResult[]): void {
  const totalMonths = careers.reduce((a, c) => a + c.monthsSimulated, 0);
  console.log('');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  THE DIRECTOR — Monte Carlo Calibration Harness (§12)');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(
    `  ${args.careers} careers × ${args.years} yrs · scenario ${args.scenario} · ` +
      `${totalMonths.toLocaleString()} months simulated`,
  );
  console.log('----------------------------------------------------------------');

  for (const r of results) {
    const status = r.pass === null ? 'PENDING' : r.pass ? 'PASS' : 'FAIL';
    const mark = r.pass === null ? '·' : r.pass ? '✓' : '✗';
    const owner = r.active ? '' : `  (awaiting ${r.ownedBy})`;
    console.log(`  ${mark} [${status.padEnd(7)}] ${r.label}`);
    console.log(`        band ${r.band} · measured ${r.value}${owner}`);
  }

  console.log('----------------------------------------------------------------');
  const active = results.filter((r) => r.active);
  const failed = active.filter((r) => r.pass === false);
  console.log(
    `  ${active.length} active target(s), ${failed.length} failing, ` +
      `${results.length - active.length} pending future milestones.`,
  );
  console.log('════════════════════════════════════════════════════════════════');
  console.log('');
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const started = Date.now();
  const careers = runBatch(args);
  const results = evaluateAll(careers);
  printReport(args, careers, results);

  const failures = results.filter((r) => r.active && r.pass === false);
  console.log(`Harness completed in ${((Date.now() - started) / 1000).toFixed(1)}s`);

  if (failures.length > 0) {
    console.error(`\n❌ Calibration FAILED: ${failures.map((f) => f.id).join(', ')}`);
    process.exit(1);
  }
  console.log('✅ Calibration passed (no active target out of band).');
}

main();
