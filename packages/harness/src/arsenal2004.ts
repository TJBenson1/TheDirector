/**
 * Counterfactual: "Build on the Invincibles." Arsenal from 2004. Instead of
 * selling the spine and going frugal for the Emirates move, the user KEEPS
 * Vieira (2005), Cole (2006) and Henry (2007), takes the Gallas deal too, and
 * backs an aggressive signing each summer. Run to 2009 and see whether the
 * dynasty holds off Mourinho's Chelsea and Ferguson's United.
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

const KEEP = ['Vieira', 'Ashley Cole', 'Henry']; // decline these real sales

const posGroup = (p: string): string =>
  p === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(p) ? 'DEF' : ['DM', 'CM', 'AM'].includes(p) ? 'MID' : 'ATT';

function finish(s: GameState): number {
  const league = s.leagues['eng-2004']!;
  return standingsOrder(league).indexOf('arsenal') + 1;
}

function main(): void {
  let s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'aggressive-arsenal' });
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  BUILD ON THE INVINCIBLES — Arsenal 2004 → 2009');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  ${s.clock.date} · Board: "${s.board.mandate}"`);

  const finishes: string[] = [];
  const titles: Record<string, number> = {};
  let lastSeasonReported = 2003;
  // Refresh a different area each summer with YOUNG talent, rather than stacking
  // one position or gutting a direct rival.
  const wantByYear: Record<number, Position> = { 2005: 'CM', 2006: 'CB', 2007: 'ST', 2008: 'LW' };
  const rivals = new Set(['man_utd', 'chelsea', 'liverpool']);

  for (let step = 0; step < 60; step++) {
    for (const d of [...s.pendingDecisions]) {
      if (d.id.startsWith('real-out:')) {
        const star = KEEP.find((n) => d.title.includes(n));
        if (star) { s = applyDecision(s, d.id, 'keep').state; console.log(`   ✋ ${s.clock.date}  KEPT ${star} — the spine stays together.`); }
        else s = applyDecision(s, d.id, 'sell').state;
      } else if (d.id.startsWith('real-in:')) {
        s = applyDecision(s, d.id, 'sign').state;
        const who = d.title.match(/: ([^(]+)\(/)?.[1]?.trim();
        if (who) console.log(`   ✍ ${s.clock.date}  Signed ${who}`);
      } else {
        s = applyDecision(s, d.id, d.choices[0]!.id).state;
      }
    }

    // Aggressive within reason: ONE young signing a summer, in a position that
    // isn't already stacked, funded by the REAL (Emirates-constrained) budget —
    // no gifted money.
    const yr = parseYearMonth(s.clock.date).year;
    if (s.clock.window === 'summer' && wantByYear[yr]) {
      const club = s.clubs['arsenal']!;
      const pos = wantByYear[yr]!;
      // Skip if we already have two 80+ players in that position group.
      const strongHere = clubSquadPlayers(s, 'arsenal').filter(
        (p) => p.curated && p.ability >= 80 && posGroup(p.positions[0]!) === posGroup(pos),
      ).length;
      if (strongHere < 2) {
        const opts = suggestTargets(s, pos, { maxResults: 12, favourAvailable: true }).filter(
          (tg) => tg.willing && tg.askingPrice <= club.finances.transferBudget && tg.ability.high >= 80 && tg.age <= 27 && !rivals.has(tg.club ?? ''),
        );
        const pick = opts[0];
        if (pick) {
          const res = attemptSigning(s, { playerId: pick.playerId, toClub: 'arsenal', fee: pick.askingPrice });
          if (res.ok) console.log(`   💰 ${s.clock.date}  Signed ${pick.name} (${pick.clubName}, ${pos}, age ${pick.age}, ${Math.round(pick.askingPrice / 1e6)}m).`);
        } else {
          console.log(`   · ${s.clock.date}  No affordable ${pos} within budget (£${Math.round(club.finances.transferBudget / 1e6)}m).`);
        }
      }
    }

    const before = s.eventLog.length;
    s = advanceWindow(s).state;

    // Record each completed season at the summer window.
    const y = currentYear(s);
    if (s.clock.window === 'summer' && y > 2004 && s.leagues['eng-2004']!.roundsPlayed >= 38 && y > lastSeasonReported + 1) {
      lastSeasonReported = y - 1;
      const pos = finish(s);
      const champ = standingsOrder(s.leagues['eng-2004']!)[0]!;
      titles[champ] = (titles[champ] ?? 0) + 1;
      finishes.push(`${y - 1}–${String(y).slice(2)}: ${pos}${pos === 1 ? 'st 🏆' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'} (champions: ${s.clubs[champ]!.name})`);
    }

    if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; s.board.warnings = 0; }
    if (before === s.eventLog.length) break;
    if (currentYear(s) >= 2009 && s.clock.window === 'summer') break;
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  ARSENAL 2004 → 2009');
  console.log('════════════════════════════════════════════════════════════════');
  for (const f of finishes) console.log(`   ${f}`);
  console.log(`\n  PL titles: ${Object.entries(titles).map(([c, n]) => `${s.clubs[c]!.name} ×${n}`).join(', ')}`);

  console.log('\n  Arsenal squad in 2009 (curated, by ability):');
  for (const p of clubSquadPlayers(s, 'arsenal').filter((p) => p.curated).sort((a, b) => b.ability - a.ability).slice(0, 12)) {
    const age = currentYear(s) - p.birthYear;
    const mood = p.agitation >= 35 ? '  ☹' : '';
    console.log(`   · ${p.name.padEnd(20)} ${p.positions.join('/').padEnd(7)} age ${age}  ability ${p.ability}${mood}`);
  }

  const where = (n: string) => { const p = clubSquadPlayers(s, 'arsenal').find((x) => x.name.includes(n)) ? 'Arsenal' : '(left)'; return p; };
  console.log('\n  The Invincibles spine, kept:');
  for (const n of ['Henry', 'Vieira', 'Cole']) console.log(`   · ${n}: ${where(n)}`);
}

main();
