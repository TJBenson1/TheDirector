/**
 * Verification trace: the Moyes 2013 "almost happened" window.
 *
 * United's real summer of near-misses — two bids for Fàbregas rejected, Baines
 * snubbed, Thiago and Bale drifting away. This script plays man-utd-2013 and
 * takes the deals reality bottled (sign Cesc, sign Baines), showing the
 * counterfactual squad the near-miss ledger unlocks. Run:
 *
 *   pnpm --filter @director/harness exec tsx src/moyesNearMiss.ts
 */

import {
  createNewGame,
  advanceWindow,
  applyDecision,
  clubSquadPlayers,
  type GameState,
} from '@director/engine';

const TAKE = ['Fàbregas', 'Baines']; // the near-misses we complete

function main(): void {
  let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'moyes-take-the-deals' });
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  MOYES 2013 — taking the deals reality bottled');
  console.log('════════════════════════════════════════════════════════════════');

  for (let step = 0; step < 8; step++) {
    for (const d of [...s.pendingDecisions]) {
      if (d.id.startsWith('near-miss-in:')) {
        const take = TAKE.some((n) => d.title.includes(n));
        s = applyDecision(s, d.id, take ? 'sign' : 'pass').state;
        console.log(`   ${take ? '✍️  SIGNED' : '· passed'}: ${d.title}`);
      } else if (d.id.startsWith('near-miss-out:')) {
        s = applyDecision(s, d.id, 'keep').state;
      } else {
        // Reality-default for the ordinary ledger (sign real-ins, sanction sales).
        s = applyDecision(s, d.id, d.choices[0]!.id).state;
      }
    }
    s = advanceWindow(s).state;
    if (s.board.dismissed) { console.log(`   (board dismissed the manager ${s.clock.date})`); break; }
  }

  const utd = clubSquadPlayers(s, 'man_utd')
    .filter((p) => p.curated)
    .map((p) => p.name)
    .sort();
  console.log('────────────────────────────────────────────────────────────────');
  console.log('  United squad now includes the ones that got away:');
  for (const n of ['Cesc Fàbregas', 'Leighton Baines']) {
    console.log(`    ${utd.includes(n) ? '✓' : '✗'} ${n}`);
  }
  console.log('════════════════════════════════════════════════════════════════');
}

main();
