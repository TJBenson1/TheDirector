/**
 * Counterfactual verification: "Inter 1998 — the squad turns over on schedule."
 *
 * A passive (reality-holds) walk of the inter-1998 scenario to confirm the fix
 * for "aging stars retire in place". The old Inter of Zamorano/Baggio/Djorkaeff
 * should LEAVE for regular football elsewhere as they fade — freeing space for
 * Adriano — rather than sitting in the reserves until they retire years late.
 * Vieri (Lazio→Inter, 1999) should be OFFERED as the user's call, not forgotten.
 *
 *   pnpm --filter @director/harness exec tsx src/inter1998.ts
 */

import {
  createNewGame,
  advanceWindow,
  applyDecision,
  clubSquadPlayers,
  type GameState,
} from '@director/engine';

const WATCH = ['Zamorano', 'Baggio', 'Djorkaeff', 'Simeone', 'Winter', 'Bergomi', 'Vieri', 'Adriano'];

function squadLine(s: GameState): string {
  return clubSquadPlayers(s, 'inter')
    .filter((p) => p.curated)
    .map((p) => p.name)
    .sort()
    .join(', ');
}

function main(): void {
  let s = createNewGame({ scenarioId: 'inter-1998', seed: 'inter-reality' });
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  INTER 1998 → 2010  (reality holds; take Vieri when offered)');
  console.log('════════════════════════════════════════════════════════════════');

  const seenLog = new Set<string>();

  for (let step = 0; step < 60; step++) {
    // Reality-default with one active call: accept Vieri if he's offered in.
    for (const d of [...s.pendingDecisions]) {
      if (d.id.startsWith('real-in:') && d.title.includes('Vieri')) {
        s = applyDecision(s, d.id, 'sign').state;
        console.log(`   ✍️  ${s.clock.date}  DECISION OFFERED → signed Vieri (choices: ${d.choices.map((o) => o.id).join('/')})`);
      }
    }

    const before = s.eventLog.length;
    s = advanceWindow(s).state;
    for (const e of s.eventLog.slice(before)) {
      const who = String(e.data?.playerId ?? '');
      const line = e.message ?? '';
      const key = e.code + who + String(e.date);
      if (seenLog.has(key)) continue;
      if (e.code === 'veteran.movedon' && WATCH.some((n) => line.includes(n))) {
        seenLog.add(key);
        console.log(`   → ${e.date}  MOVED ON: ${line}`);
      } else if (e.code === 'career.retired' && WATCH.some((n) => line.includes(n))) {
        seenLog.add(key);
        console.log(`   ⚰  ${e.date}  RETIRED: ${line}`);
      } else if (e.code === 'ledger.executed' && WATCH.some((n) => line.includes(n))) {
        seenLog.add(key);
        console.log(`   🔁 ${e.date}  LEDGER: ${line}`);
      } else if (e.code === 'academy.graduate' && line.includes('Adriano')) {
        seenLog.add(key);
        console.log(`   🎓 ${e.date}  ACADEMY: ${line}`);
      }
    }
    if (s.board.dismissed) { console.log(`   (note: the board dismissed the manager ${s.clock.date} — a reality-default Inter under-performs an impatient board; the squad turnover above is the point)`); break; }
  }

  console.log('────────────────────────────────────────────────────────────────');
  console.log('  Inter curated squad at end:', squadLine(s));
  console.log('════════════════════════════════════════════════════════════════');
}

main();
