/**
 * THE HISTORIAN — CLI runner (§6/§10). Samples finished careers (or a data pack),
 * sends them to the reviewer, aggregates a realism report, writes the
 * realism-report.md artifact, and returns the CI signal.
 *
 * Usage:
 *   tsx src/historian/run.ts [--mode=calibration|playtest|datapack]
 *        [--careers=N] [--years=Y] [--seed=S] [--scenario=ID]
 *        [--out=path] [--moderate-threshold=N] [--historian=off]
 *
 * The gate fails (exit 1) ONLY on a confirmed SEVERE or too-many-MODERATE batch.
 * If no API key is configured (or --historian=off), the run is SKIPPED and the
 * build is NOT failed — a missing key is a config gap, not a realism regression.
 * On main-branch CI the flag must never be off (§6).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createNewGame, type GameState } from '@director/engine';
import { captureCareers } from './capture.js';
import { sampleCareer } from './sampler.js';
import { sampleDataPack } from './datapack-sampler.js';
import { reviewItems } from './reviewer.js';
import { buildReport, formatReport, skippedReport } from './report.js';
import { createHistorianClientFromEnv } from './client.js';
import type { HistorianMode, ReviewItem } from './types.js';

interface Args {
  mode: HistorianMode;
  careers: number;
  years: number;
  seed: string;
  scenario: string;
  out: string;
  moderateThreshold: number;
  off: boolean;
  /** Sample an existing playthrough save (a GameState JSON) instead of running a
   *  fresh batch — the Mode 2 "feed the Historian a full playthrough" path. */
  from: string;
  /** Also write the sampled review items to this JSON, so a reviewer (an LLM in
   *  a chat, or a human) can judge them without a live API key. */
  dump: string;
}

function parseArgs(argv: string[]): Args {
  const get = (k: string, d: string) => {
    const hit = argv.find((a) => a.startsWith(`--${k}=`));
    return hit ? hit.slice(k.length + 3) : d;
  };
  const mode = get('mode', 'calibration') as HistorianMode;
  return {
    mode,
    careers: Math.max(1, Number(get('careers', mode === 'playtest' ? '1' : '20'))),
    years: Math.max(1, Number(get('years', '15'))),
    seed: get('seed', 'historian'),
    scenario: get('scenario', 'man-utd-1999'),
    out: get('out', 'realism-report.md'),
    moderateThreshold: Math.max(0, Number(get('moderate-threshold', '10'))),
    off: get('historian', process.env.HISTORIAN ?? '') === 'off',
    from: get('from', ''),
    dump: get('dump', ''),
  };
}

function collectItems(args: Args): ReviewItem[] {
  // Mode 2: review an existing playthrough save (a serialised GameState).
  if (args.from) {
    const state = JSON.parse(readFileSync(args.from, 'utf8')) as GameState;
    return sampleCareer(state, state.meta.seed || 'playthrough');
  }
  if (args.mode === 'datapack') {
    const state: GameState = createNewGame({ scenarioId: args.scenario, seed: `${args.seed}:datapack` });
    return sampleDataPack(state);
  }
  const captured = captureCareers({
    careers: args.careers,
    years: args.years,
    seed: args.seed,
    scenario: args.scenario,
  });
  return captured.flatMap((c) => sampleCareer(c.finalState, c.careerId));
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  THE DIRECTOR — Historian realism review (${args.mode})`);
  console.log('════════════════════════════════════════════════════════════════');

  const client = args.off ? null : createHistorianClientFromEnv();

  // A --dump packet can be produced with OR without a client: it's the review
  // material (items + grounded reference data) an offline reviewer judges.
  if (args.dump || !client) {
    const items = collectItems(args);
    if (args.dump) {
      writeFileSync(args.dump, JSON.stringify(items, null, 2));
      console.log(`  Sampled ${items.length} items → dumped to ${args.dump}`);
      console.log('  Review these against packages/harness/src/historian/prompt.md + rubric.md.');
    }
    if (!client) {
      const report = skippedReport(args.mode);
      writeFileSync(args.out, formatReport(report));
      console.log(
        args.off
          ? '  Reviewer SKIPPED — --historian=off (never permitted on main-branch CI).'
          : '  Reviewer SKIPPED — no ANTHROPIC_API_KEY / HISTORIAN_API_KEY set.' +
              (args.dump ? ' Hand the dumped items to a reviewer (an LLM in chat, or a human).' : ''),
      );
      console.log(`  Wrote ${args.out}. Realism gate: PASS (nothing auto-reviewed).`);
      console.log('════════════════════════════════════════════════════════════════');
      return;
    }
  }

  const items = collectItems(args);
  console.log(`  Sampled ${items.length} items · reviewer ${client.name}`);

  const verdicts = await reviewItems(items, client, {
    mode: args.mode,
    confirmSevere: true,
  });
  const report = buildReport(args.mode, verdicts, { moderateThreshold: args.moderateThreshold });

  writeFileSync(args.out, formatReport(report));
  console.log('----------------------------------------------------------------');
  console.log(
    `  ${report.counts.pass} PASS · ${report.counts.flag} FLAG · ${report.counts.fail} FAIL ` +
      `(${report.severities.severe} severe, ${report.severities.moderate} moderate, ${report.severities.minor} minor)`,
  );
  for (const r of report.failReasons) console.log(`  ✗ ${r}`);
  console.log(`  Wrote ${args.out}. Realism gate: ${report.pass ? '✅ PASS' : '❌ FAIL'}`);
  console.log('════════════════════════════════════════════════════════════════');

  if (!report.pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Historian run failed:', err);
  process.exitCode = 1;
});
