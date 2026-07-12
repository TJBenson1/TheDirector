/**
 * Counterfactual: "The pragmatic galácticos." Real Madrid from 2000. Sign Figo
 * (the move that started it) and Zidane (a footballing genius), but resist the
 * marketing-galáctico treadmill: KEEP Makélélé in 2003 rather than cashing him
 * in, pass on Ronaldo and Beckham, and reinvest the saved money in the back line.
 * Run to 2004 and see how the balance holds.
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
} from '@director/engine';

const KEEP: Record<string, true> = { Makélélé: true }; // decline his real sale
const PASS: Record<string, true> = { Ronaldo: true, Beckham: true }; // pass on these galácticos

function tableTop(s: GameState, n: number): string[] {
  const league = s.leagues['esp-1']!;
  return standingsOrder(league)
    .slice(0, n)
    .map((id, i) => {
      const r = league.standings[id]!;
      return `   ${String(i + 1).padStart(2)} ${s.clubs[id]!.name.padEnd(20)} ${String(r.points).padStart(2)}pts`;
    });
}

function main(): void {
  let s = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'pragmatic-galacticos' });
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  THE PRAGMATIC GALÁCTICOS — Real Madrid 2000 → 2004');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  ${s.clock.date} · Board: "${s.board.mandate}"`);

  const seen = new Set<string>();
  let boughtDefender = false;

  for (let step = 0; step < 80; step++) {
    for (const d of [...s.pendingDecisions]) {
      if (d.id.startsWith('real-in:')) {
        const star = Object.keys(PASS).find((n) => d.title.includes(n));
        if (star) {
          s = applyDecision(s, d.id, 'pass').state;
          console.log(`   ✗ ${s.clock.date}  Passed on ${star} (stay pragmatic).`);
        } else {
          s = applyDecision(s, d.id, 'sign').state;
          const who = d.title.match(/: ([^(]+)\(/)?.[1]?.trim();
          if (who) console.log(`   ✍ ${s.clock.date}  Signed ${who}`);
        }
      } else if (d.id.startsWith('real-out:')) {
        const star = Object.keys(KEEP).find((n) => d.title.includes(n));
        if (star) {
          s = applyDecision(s, d.id, 'keep').state;
          console.log(`   ✋ ${s.clock.date}  KEPT ${star} — held the midfield balance (he wanted the move).`);
        } else {
          s = applyDecision(s, d.id, 'sell').state;
        }
      } else {
        s = applyDecision(s, d.id, d.choices[0]!.id).state;
      }
    }

    // With the money saved on marketing galácticos, reinforce the defence once.
    if (!boughtDefender && parseYearMonth(s.clock.date).year >= 2002 && s.clock.window === 'summer') {
      const cbs = suggestTargets(s, 'CB', { maxResults: 6, favourAvailable: true }).filter((t) => t.willing);
      const pick = cbs.find((t) => t.askingPrice <= s.clubs[s.playerClub]!.finances.transferBudget) ?? cbs[0];
      if (pick) {
        const res = attemptSigning(s, { playerId: pick.playerId, toClub: s.playerClub, fee: pick.askingPrice });
        if (res.ok) { console.log(`   🛡 ${s.clock.date}  Reinvested in defence: signed ${pick.name} (${pick.clubName}).`); boughtDefender = true; }
      }
    }

    const before = s.eventLog.length;
    const since = s.meta.nextSeq;
    s = advanceWindow(s).state;
    for (const e of s.eventLog.filter((x) => x.seq >= since)) {
      if ((e.code === 'ledger.cancelled' || e.code === 'ledger.alternative') && !seen.has(e.message)) {
        seen.add(e.message);
        console.log(`     ↳ ${e.date}  ${e.message}`);
      }
    }
    if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; s.board.warnings = 0; }
    if (before === s.eventLog.length) break;
    // Stop at the 2004 summer window — the 2003–04 season is complete and shown.
    if (parseYearMonth(s.clock.date).year >= 2004 && s.clock.window === 'summer') break;
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  REAL MADRID IN 2004');
  console.log('════════════════════════════════════════════════════════════════');
  const league = s.leagues['esp-1']!;
  const utd = standingsOrder(league).indexOf('real_madrid') + 1;
  console.log(`  La Liga ${league.seasonYear}: Real Madrid ${utd}${utd === 1 ? 'st — CHAMPIONS' : 'th'}`);
  for (const line of tableTop(s, 5)) console.log(line);

  console.log('\n  Squad (curated, by ability):');
  for (const p of clubSquadPlayers(s, 'real_madrid').filter((p) => p.curated).sort((a, b) => b.ability - a.ability).slice(0, 12)) {
    const age = currentYear(s) - p.birthYear;
    const mood = p.agitation >= 40 ? '  ☹ unsettled' : '';
    console.log(`   · ${p.name.padEnd(20)} ${p.positions.join('/').padEnd(7)} age ${age}  ability ${p.ability}${mood}`);
  }

  const where = (id: string) => { const p = s.players[id]; return p?.club ? s.clubs[p.club]?.name ?? p.club : '—'; };
  console.log('\n  Knock-on effects of staying pragmatic:');
  console.log(`   · Makélélé:  ${where('cur_makelele')}  (real: sold to Chelsea 2003)`);
  console.log(`   · Beckham:   ${where('cur_beckham')}  (real: Real Madrid 2003)`);
  console.log(`   · Ronaldo:   ${where('cur_ronaldo')}  (real: Real Madrid 2002)`);
  console.log('\n  Divergences from real history:');
  for (const d of s.timeline.divergenceLog.filter((d) => /Makélélé|Beckham|Ronaldo|Madrid/.test(d.detail)).slice(0, 8)) {
    console.log(`   · ${d.date}  ${d.detail}`);
  }
}

main();
