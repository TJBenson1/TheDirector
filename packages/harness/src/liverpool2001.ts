/**
 * Counterfactual: "Liverpool really go for it after the 2001 treble."
 *
 * The minimum brief: sign Anelka permanently (reality let him go) and DON'T waste
 * money on the flops (Diouf, Cheyrou). Plus a couple of aggressive upgrades. The
 * aim is to finish above Chelsea in 2002–03 and take their Champions-League place
 * — which, per historical testimony, may cause the Abramovich takeover to fall
 * through, changing the whole era. Run to 2005; reality holds otherwise.
 */

import {
  createNewGame,
  advanceWindow,
  applyDecision,
  attemptSigning,
  suggestTargets,
  standingsOrder,
  clubSquadPlayers,
  currentYear,
  parseYearMonth,
  type GameState,
  type Position,
} from '@director/engine';

const AVOID = ['Diouf', 'Cheyrou']; // the real flops — pass
const KEEP = ['Anelka']; // make the loan permanent

function pos(s: GameState, club: string): number {
  return standingsOrder(s.leagues['eng-2001']!).indexOf(club) + 1;
}
function buy(s: GameState, p: Position, label: string): void {
  const budget = s.clubs['liverpool']!.finances.transferBudget;
  const opts = suggestTargets(s, p, { maxResults: 12, favourAvailable: true }).filter(
    (t) => t.willing && t.askingPrice <= budget && t.ability.high >= 82 && t.age <= 28 && t.club !== 'liverpool',
  );
  const pick = opts[0];
  if (!pick) return;
  const res = attemptSigning(s, { playerId: pick.playerId, toClub: 'liverpool', fee: pick.askingPrice });
  if (res.ok) console.log(`   💰 ${s.clock.date}  ${label}: ${pick.name} (${pick.clubName}, ${p}, £${Math.round(pick.askingPrice / 1e6)}m)`);
}

function main(): void {
  let s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'liverpool-go-for-it' });
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  LIVERPOOL GO FOR IT — 2001 → 2005');
  console.log('════════════════════════════════════════════════════════════════');

  const finishes: string[] = [];
  let lastSeason = 2000;
  let abramovich = '(pending)';

  for (let step = 0; step < 50; step++) {
    for (const d of [...s.pendingDecisions]) {
      if (d.id.startsWith('real-in:') && AVOID.some((n) => d.title.includes(n))) {
        s = applyDecision(s, d.id, 'pass').state;
        console.log(`   ✗ ${s.clock.date}  Passed on a flop: ${AVOID.find((n) => d.title.includes(n))}`);
      } else if (d.id.startsWith('real-out:') && KEEP.some((n) => d.title.includes(n))) {
        s = applyDecision(s, d.id, 'keep').state;
        console.log(`   ✋ ${s.clock.date}  Signed Anelka permanently (kept, not sold).`);
      } else {
        s = applyDecision(s, d.id, d.choices[0]!.id).state; // reality-default
      }
    }

    const yr = parseYearMonth(s.clock.date).year;
    if (s.clock.window === 'summer' && yr >= 2001 && yr <= 2003) {
      s.clubs['liverpool']!.finances.transferBudget = Math.max(s.clubs['liverpool']!.finances.transferBudget, 25_000_000);
      if (yr === 2001) buy(s, 'CB', 'Going for it: a commanding centre-back');
      if (yr === 2002) buy(s, 'RW', 'Going for it: width and goals');
    }

    const since = s.meta.nextSeq;
    const before = s.eventLog.length;
    s = advanceWindow(s).state;
    for (const e of s.eventLog.filter((x) => x.seq >= since)) {
      if (e.code.startsWith('takeover.abramovich')) { abramovich = e.message; console.log(`\n   ★ ${e.date}  ${e.message}\n`); }
    }

    const y = currentYear(s);
    if (s.clock.window === 'summer' && y > 2001 && s.leagues['eng-2001']!.roundsPlayed >= 38 && y > lastSeason + 1) {
      lastSeason = y - 1;
      const lp = pos(s, 'liverpool');
      const ch = pos(s, 'chelsea');
      const champ = standingsOrder(s.leagues['eng-2001']!)[0]!;
      finishes.push(`${y - 1}–${String(y).slice(2)}: Liverpool ${lp}${lp <= 4 ? ' (CL)' : ''}, Chelsea ${ch}${ch <= 4 ? ' (CL)' : ''}  — champions ${s.clubs[champ]!.name}`);
    }
    if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; s.board.warnings = 0; }
    if (before === s.eventLog.length) break;
    if (currentYear(s) >= 2005 && s.clock.window === 'summer') break;
  }

  console.log('════════════════════════════════════════════════════════════════');
  console.log('  RESULTS 2001 → 2005');
  console.log('════════════════════════════════════════════════════════════════');
  for (const f of finishes) console.log('   ' + f);
  console.log(`\n  Abramovich: ${abramovich}`);
  console.log('\n  Chelsea in 2005 (curated stars):');
  const che = clubSquadPlayers(s, 'chelsea').filter((p) => p.curated).sort((a, b) => b.ability - a.ability).slice(0, 6);
  console.log('   ' + che.map((p) => `${p.name} ${p.ability}`).join(', '));
  console.log(`   Chelsea strength: ${s.clubs['chelsea']!.strength.toFixed(0)}`);
  console.log('\n  Liverpool in 2005 (curated stars):');
  const lp = clubSquadPlayers(s, 'liverpool').filter((p) => p.curated).sort((a, b) => b.ability - a.ability).slice(0, 6);
  console.log('   ' + lp.map((p) => `${p.name} ${p.ability}`).join(', '));
}

main();
