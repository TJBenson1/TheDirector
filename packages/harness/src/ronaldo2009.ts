/**
 * Counterfactual: "Keep Ronaldo." A Manchester United 1999 playthrough that
 * reaches 2009. By default the user makes their real signings (presented each
 * window) — Ronaldo joins in 2003 — but in 2009 the user REFUSES to sanction his
 * £80m sale to Madrid. He is kept against his wishes (unrest), and because Madrid
 * never fund that galáctico window, they never offload Robben and Sneijder — so
 * Inter's 2010 treble talisman never arrives.
 *
 * Everything else is left to reality-default: pending real-transfer decisions are
 * resolved as history (choices[0]) except the Ronaldo sale, which we keep.
 */

import {
  createNewGame,
  advanceWindow,
  applyDecision,
  clubSquadPlayers,
  currentYear,
  valuePlayer,
  parseYearMonth,
  type GameState,
} from '@director/engine';

const m = (n: number) => `£${(n / 1_000_000).toFixed(0)}m`;

function where(s: GameState, id: string): string {
  const p = s.players[id];
  return p?.club ? s.clubs[p.club]?.name ?? p.club : '—';
}

function main(): void {
  let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'keep-ronaldo' });
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  KEEP RONALDO — a Man United 1999 playthrough to 2009');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  ${s.clock.date} · Board: "${s.board.mandate}"`);

  const seen = new Set<string>();
  let keptRonaldo = false;

  const note = (e: { code: string; date: string; message: string }, glyph: string) => {
    if (seen.has(e.message)) return;
    seen.add(e.message);
    console.log(`   ${glyph} ${e.date}  ${e.message}`);
  };

  for (let step = 0; step < 300; step++) {
    // Resolve pending real-transfer + event decisions.
    for (const d of [...s.pendingDecisions]) {
      if (d.id.startsWith('real-out:') && d.title.includes('Ronaldo')) {
        // THE decision: refuse to sell Cristiano Ronaldo.
        s = applyDecision(s, d.id, 'keep').state;
        keptRonaldo = true;
        console.log(`\n  ✋ ${s.clock.date}  ${d.title}`);
        console.log(`     → You REFUSE the sale. Ronaldo stays — but he wanted the move.\n`);
      } else if (d.id.startsWith('real-in:') && d.title.includes('Ronaldo')) {
        s = applyDecision(s, d.id, 'sign').state;
        console.log(`\n  ✍ ${s.clock.date}  Signed Cristiano Ronaldo from Sporting.\n`);
      } else {
        s = applyDecision(s, d.id, d.choices[0]!.id).state; // reality-default
      }
    }

    const since = s.meta.nextSeq;
    const before = s.eventLog.length;
    s = advanceWindow(s).state;

    for (const e of s.eventLog.filter((x) => x.seq >= since)) {
      if (e.code === 'ledger.cancelled') note(e, '✂');
      if (e.code === 'ledger.executed' && /Robben|Sneijder|Ronaldo/.test(e.message)) note(e, '↳');
    }

    // Keep the manager installed for the whole arc (the directive: don't sack).
    if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; s.board.warnings = 0; }

    if (before === s.eventLog.length) break;
    if (parseYearMonth(s.clock.date).year >= 2010) break;
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`  WORLD IN 2009  (Ronaldo ${keptRonaldo ? 'KEPT at United' : 'left'})`);
  console.log('════════════════════════════════════════════════════════════════');
  const cr = s.players['cur_cristiano'];
  if (cr) {
    const age = currentYear(s) - cr.birthYear;
    console.log(`  Cristiano Ronaldo — ${where(s, 'cur_cristiano')}, age ${age}, ability→ ${cr.ability}, unrest ${cr.agitation}, ${m(valuePlayer(cr, currentYear(s)))}`);
  }
  console.log(`  Robben:   ${where(s, 'cur_robben')}   (real 2009: Bayern)`);
  console.log(`  Sneijder: ${where(s, 'cur_sneijder')}   (real 2009: Inter — their treble talisman)`);

  console.log('\n  Inter squad calibre (curated stars):');
  const inter = clubSquadPlayers(s, 'inter').filter((p) => p.curated).sort((a, b) => b.ability - a.ability).slice(0, 6);
  console.log('   ' + (inter.map((p) => `${p.name} ${p.ability}`).join(', ') || '—'));

  console.log('\n  United front line (as played):');
  const utd = clubSquadPlayers(s, 'man_utd').filter((p) => p.curated && ['LW', 'RW', 'ST', 'AM'].includes(p.positions[0]!)).sort((a, b) => b.ability - a.ability).slice(0, 6);
  for (const p of utd) console.log(`   · ${p.name.padEnd(22)} ${p.positions.join('/').padEnd(7)} ability ${p.ability}`);

  console.log('\n  Divergences from real history:');
  for (const d of s.timeline.divergenceLog.filter((d) => /Ronaldo|Robben|Sneijder|Madrid/.test(d.detail)).slice(0, 8)) {
    console.log(`   · ${d.date}  ${d.detail}`);
  }
}

main();
