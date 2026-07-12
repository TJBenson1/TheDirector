/**
 * Counterfactual: "Aggressive Arsenal." From 2004 the board backs Wenger to
 * build, rather than tightening for the Emirates move. In the 2004 window in
 * particular they go big — a Bergkamp successor (a playmaker) and a strong
 * central midfielder to push Gilberto alongside Vieira. Vieira is then sold a
 * year later (as in reality) to hand Fàbregas the midfield. Every summer they
 * upgrade their weakest area within a realistic budget; RvP and Cesc grow into
 * the reality-rail. Real signings (Adebayor, Rosický, …) still arrive. Run to
 * 2009. Reality holds except where these user moves deviate from it.
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
  resolvePlayer,
  type GameState,
  type Position,
} from '@director/engine';

const groupOf = (p: string): 'GK' | 'DEF' | 'MID' | 'ATT' =>
  p === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(p) ? 'DEF' : ['DM', 'CM', 'AM'].includes(p) ? 'MID' : 'ATT';
const REP: Record<string, Position> = { GK: 'GK', DEF: 'CB', MID: 'CM', ATT: 'ST' };

// The board's aggressive backing: a big 2004, then leaner as the stadium bites.
const budgetFor = (year: number): number => (year === 2004 ? 42 : year <= 2006 ? 24 : 18) * 1_000_000;

const RIVALS = new Set(['man_utd', 'chelsea', 'liverpool']);

/** A high-ceiling young Arsenal player still developing in this group — someone
 *  who needs the minutes, so we must NOT block him with a signing. */
function hasBlockableYouth(s: GameState, group: string): boolean {
  return clubSquadPlayers(s, 'arsenal').some(
    (p) => p.curated && groupOf(p.positions[0]!) === group && currentYear(s) - p.birthYear <= 24 && p.potentialCeiling >= 86 && p.ability < p.potentialCeiling - 3,
  );
}

function buy(s: GameState, pos: Position, maxAge: number, label: string, force = false): boolean {
  if (!force && hasBlockableYouth(s, groupOf(pos))) return false; // give the kid his minutes
  const budget = s.clubs['arsenal']!.finances.transferBudget;
  const opts = suggestTargets(s, pos, { maxResults: 16, favourAvailable: true }).filter(
    (t) => t.willing && t.askingPrice <= budget && t.ability.high >= 80 && t.age <= maxAge && t.club !== 'arsenal' && !RIVALS.has(t.club ?? ''),
  );
  const pick = opts[0];
  if (!pick) return false;
  const res = attemptSigning(s, { playerId: pick.playerId, toClub: 'arsenal', fee: pick.askingPrice });
  if (res.ok) console.log(`   💰 ${s.clock.date}  ${label}: ${pick.name} (${pick.clubName}, ${pos}, age ${pick.age}, £${Math.round(pick.askingPrice / 1e6)}m)`);
  return res.ok;
}

/** The position group where Arsenal's best man is weakest AND no developing
 *  youngster already owns the future there — their genuine upgrade target. */
function weakestGroup(s: GameState): 'GK' | 'DEF' | 'MID' | 'ATT' {
  const squad = clubSquadPlayers(s, 'arsenal');
  const best: Record<string, number> = { GK: 0, DEF: 0, MID: 0, ATT: 0 };
  for (const p of squad) best[groupOf(p.positions[0]!)] = Math.max(best[groupOf(p.positions[0]!)]!, p.ability);
  return (['GK', 'DEF', 'MID', 'ATT'] as const)
    .filter((g) => !hasBlockableYouth(s, g))
    .sort((a, b) => best[a]! - best[b]!)[0] ?? 'DEF';
}

function main(): void {
  let s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'aggressive-arsenal' });
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  AGGRESSIVE ARSENAL — 2004 → 2009');
  console.log('════════════════════════════════════════════════════════════════');

  const finishes: string[] = [];
  const titles: Record<string, number> = {};
  let lastSeason = 2003;

  for (let step = 0; step < 60; step++) {
    // Reality-default on every offered window move (sign incoming / sanction
    // outgoing) — Vieira leaves in 2005, the real signings arrive, etc.
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;

    const yr = parseYearMonth(s.clock.date).year;
    if (s.clock.window === 'summer') {
      s.clubs['arsenal']!.finances.transferBudget = Math.max(s.clubs['arsenal']!.finances.transferBudget, budgetFor(yr));
      if (yr === 2004) {
        // The statement window: a deep midfielder to push Gilberto (Cesc will
        // inherit Vieira's creative role in 2005 — he is the real successor), and
        // a top keeper, an area with no blocked youth.
        buy(s, 'DM', 27, 'Midfield muscle for Gilberto', true);
        buy(s, 'GK', 30, 'Goalkeeping upgrade');
      } else {
        // Upgrade the weakest area, realistically and with young quality.
        const g = weakestGroup(s);
        buy(s, REP[g]!, 27, `Upgrade weakest area (${g})`);
      }
    }

    const before = s.eventLog.length;
    s = advanceWindow(s).state;

    const y = currentYear(s);
    if (s.clock.window === 'summer' && y > 2004 && s.leagues['eng-2004']!.roundsPlayed >= 38 && y > lastSeason + 1) {
      lastSeason = y - 1;
      const pos = standingsOrder(s.leagues['eng-2004']!).indexOf('arsenal') + 1;
      const champ = standingsOrder(s.leagues['eng-2004']!)[0]!;
      titles[champ] = (titles[champ] ?? 0) + 1;
      finishes.push(`${y - 1}–${String(y).slice(2)}: ${pos}${pos === 1 ? 'st 🏆' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'}  (champions: ${s.clubs[champ]!.name})`);
    }
    if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; s.board.warnings = 0; }
    if (before === s.eventLog.length) break;
    if (currentYear(s) >= 2009 && s.clock.window === 'summer') break;
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  ARSENAL 2004 → 2009');
  console.log('════════════════════════════════════════════════════════════════');
  for (const f of finishes) console.log('   ' + f);
  console.log(`\n  PL titles: ${Object.entries(titles).map(([c, n]) => `${s.clubs[c]!.name} ×${n}`).join(', ')}`);

  console.log('\n  Arsenal squad in 2009 (curated, by ability):');
  for (const p of clubSquadPlayers(s, 'arsenal').filter((p) => p.curated).sort((a, b) => b.ability - a.ability).slice(0, 12)) {
    console.log(`   · ${p.name.padEnd(20)} ${p.positions.join('/').padEnd(7)} age ${currentYear(s) - p.birthYear}  ability ${p.ability}`);
  }
  const rvp = resolvePlayer(s, 'Robin van Persie');
  const cesc = resolvePlayer(s, 'Fàbregas');
  console.log(`\n  Youth on the reality-rail: RvP ${rvp?.ability} (ceiling ${rvp?.potentialCeiling}), Fàbregas ${cesc?.ability} (ceiling ${cesc?.potentialCeiling}).`);
}

main();
