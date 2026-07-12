/**
 * Counterfactual playthrough: "United after Ferguson — the Moyes plan."
 *
 * Moyes inherits the champions in 2013 and is backed to complete the transfer
 * plan Ferguson is said to have left him: Garay, Thiago, Baines, Bale. He is
 * NOT replaced by Van Gaal; no Fellaini, no 2014/15 Van Gaal signings (those
 * ledger entries target man_utd and are consumed silently). We run to summer
 * 2016 and report what happened to United and the knock-on effects on rivals.
 */

import {
  createNewGame,
  advanceWindow,
  applyDecision,
  attemptSigning,
  executeTransfer,
  standingsOrder,
  clubSquadPlayers,
  currentYear,
  valuePlayer,
  resolvePlayer,
  parseYearMonth,
  type GameState,
} from '@director/engine';

const m = (n: number) => `£${(n / 1_000_000).toFixed(0)}m`;

function pos(s: GameState, clubId: string): number {
  const league = s.leagues['eng-2013']!;
  return standingsOrder(league).indexOf(clubId) + 1;
}

function tableTop(s: GameState, n: number): string[] {
  const league = s.leagues['eng-2013']!;
  return standingsOrder(league)
    .slice(0, n)
    .map((id, i) => {
      const r = league.standings[id]!;
      return `   ${String(i + 1).padStart(2)} ${s.clubs[id]!.name.padEnd(20)} ${String(r.points).padStart(2)}pts (${r.won}-${r.drawn}-${r.lost}, GD ${r.goalsFor - r.goalsAgainst >= 0 ? '+' : ''}${r.goalsFor - r.goalsAgainst})`;
    });
}

function sign(s: GameState, name: string, feeM: number): void {
  const target = resolvePlayer(s, name);
  if (!target) { console.log(`   ✗ ${name}: not found`); return; }
  const req = { playerId: target.id, toClub: 'man_utd', fee: feeM * 1_000_000, wageOffer: target.wage * 1.6 };
  const res = attemptSigning(s, req);
  if (res.ok) {
    console.log(`   ✓ Signed ${target.name} (from ${res.from ? s.clubs[res.from]?.name ?? '—' : '—'}) for ${m(res.fee)}`);
    return;
  }
  // The player resists (as Thiago snubbed United in reality for Guardiola). The
  // premise is that the plan is completed regardless, so the director forces the
  // deal through — but we surface that the recruit arrived reluctantly.
  const forced = executeTransfer(s, req);
  if (forced.ok) console.log(`   ✓ Signed ${target.name} for ${m(forced.fee)}  (⚠ he had to be talked round — resisted the move)`);
  else console.log(`   ✗ ${target.name}: ${res.reason}`);
}

function resolvePending(s: GameState): GameState {
  let state = s;
  let guard = 0;
  while (state.pendingDecisions.length && guard++ < 50) {
    const d = state.pendingDecisions[0]!;
    // choices[0] is the conservative option: reject a poach bid = keep the
    // player (the user never sells his stars here), decline mediation risk, etc.
    const choice = d.choices[0]!;
    const summary = `${d.title} → ${choice.label}`;
    state = applyDecision(state, d.id, choice.id).state;
    console.log(`     · decision: ${summary}`);
  }
  return state;
}

function main(): void {
  let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'moyes-plan' });

  console.log('════════════════════════════════════════════════════════════════');
  console.log('  UNITED AFTER FERGUSON — the Moyes plan (2013 → 2016)');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  Start: ${s.clock.date}  ·  Board: "${s.board.mandate}"`);
  console.log(`  United strength at kick-off: ${s.clubs['man_utd']!.strength.toFixed(1)}`);

  // The board backs Ferguson's plan — fund it.
  s.clubs['man_utd']!.finances.transferBudget = 320_000_000;

  console.log('\n  SUMMER 2013 — completing Ferguson’s plan:');
  sign(s, 'Bale', 85);
  sign(s, 'Thiago', 25);
  sign(s, 'Baines', 15);
  sign(s, 'Garay', 12);
  s = resolvePending(s);
  console.log(`  United strength after signings: ${s.clubs['man_utd']!.strength.toFixed(1)}`);

  const titles: Record<string, number> = {};
  const seenLedger = new Set<string>();
  const seenButterfly = new Set<string>();
  const boardMood: string[] = [];
  let reportedSeasons = 0;
  let boardWantedOut = false;

  // Run three full seasons to summer 2016. Per the directive, Moyes is NOT
  // replaced — so if the board loses patience we note it but keep him installed
  // (restore a floor of patience) to observe the whole counterfactual.
  const startYear = currentYear(s);
  for (let step = 0; step < 120 && reportedSeasons < 3; step++) {
    const since = s.meta.nextSeq;
    s = resolvePending(advanceWindow(s).state);

    for (const e of s.eventLog.filter((x) => x.seq >= since)) {
      if (e.code === 'ledger.executed' && !seenLedger.has(e.message)) {
        seenLedger.add(e.message);
        console.log(`     ↳ ${e.date}  ${e.message}`);
      }
      if (e.code === 'ledger.fallback' && !seenButterfly.has(e.message)) {
        seenButterfly.add(e.message);
        console.log(`     ⤳ ${e.date}  ${e.message}`);
      }
    }

    if (s.board.dismissed) {
      boardWantedOut = true;
      s.board.dismissed = false; // directive: Moyes stays the whole period
      s.board.patience = 25;
      s.board.warnings = 0;
    }

    // A completed season is viewable at the summer window (July) — the prior
    // final table survives the lazy reset until the next August.
    const y = currentYear(s);
    const league = s.leagues['eng-2013']!;
    if (s.clock.window === 'summer' && y > startYear && league.roundsPlayed >= 38 && reportedSeasons < y - startYear) {
      reportedSeasons++;
      console.log(`\n  ─── ${y - 1}–${String(y).slice(2)} PREMIER LEAGUE — final table ───`);
      for (const line of tableTop(s, 6)) console.log(line);
      const utd = pos(s, 'man_utd');
      const tag = utd === 1 ? ' — CHAMPIONS' : utd <= 4 ? ' — top four' : utd >= 15 ? ' — bottom half' : '';
      console.log(`     United finished ${utd}${tag}   ·   board patience ${s.board.patience}${boardWantedOut ? ' (board pushed to sack Moyes)' : ''}`);
      boardMood.push(`${y - 1}–${String(y).slice(2)}: ${utd}${utd === 1 ? 'st' : utd === 2 ? 'nd' : utd === 3 ? 'rd' : 'th'}`);
      const champ = standingsOrder(league)[0]!;
      titles[champ] = (titles[champ] ?? 0) + 1;
    }
  }

  // ── Closing report ──────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  WHERE UNITED ENDED UP (summer 2016)');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  United’s finishes: ${boardMood.join('  ·  ')}`);
  console.log(`  PL champions 2013–16: ${Object.entries(titles).map(([c, n]) => `${s.clubs[c]!.name} ×${n}`).join(', ')}`);
  console.log(`  Moyes kept in post the whole period${boardWantedOut ? ' — but the board repeatedly pushed to sack him' : ''}.`);
  console.log(`  United strength ${s.clubs['man_utd']!.strength.toFixed(1)} (kick-off was 84.3 after the signings).`);

  console.log('\n  United’s marquee men (as played):');
  const utdSquad = clubSquadPlayers(s, 'man_utd').filter((p) => p.curated).sort((a, b) => b.ability - a.ability);
  for (const p of utdSquad.slice(0, 8)) {
    const age = currentYear(s) - p.birthYear;
    console.log(`   · ${p.name.padEnd(22)} ${p.positions.join('/').padEnd(7)} age ${age}  ${m(valuePlayer(p, currentYear(s)))}`);
  }

  console.log('\n  Knock-on effects on rivals:');
  const wanted = ['real_madrid', 'bayern', 'arsenal', 'spurs', 'liverpool', 'barcelona'];
  for (const cid of wanted) {
    const club = s.clubs[cid];
    if (!club) continue;
    const stars = clubSquadPlayers(s, cid).filter((p) => p.curated).sort((a, b) => b.ability - a.ability).slice(0, 4);
    console.log(`   · ${club.name.padEnd(16)} ${stars.map((p) => p.name).join(', ')}`);
  }

  console.log('\n  Divergences from real history (butterflies logged):');
  for (const d of s.timeline.divergenceLog.slice(0, 12)) {
    console.log(`   · ${d.date}  [${d.kind}] ${d.detail}`);
  }
}

main();
