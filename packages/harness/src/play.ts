/**
 * Interactive playthrough driver. Persists a single GameState to a save file so
 * a human can play turn-by-turn from the terminal / a chat.
 *
 *   tsx src/play.ts new <scenarioId> [seed]     start a game
 *   tsx src/play.ts state                         re-render the briefing
 *   tsx src/play.ts advance                       advance to the next window/interrupt
 *   tsx src/play.ts decide <decisionId> <choiceId>  resolve a pending decision
 *   tsx src/play.ts sign <playerId> [feeM]        attempt a signing (with agency)
 *   tsx src/play.ts scout <playerId>              fogged scout report
 *   tsx src/play.ts squad                         full squad screen
 *
 * The save path defaults to $DIRECTOR_SAVE or ./playthrough.json.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import {
  createNewGame,
  advanceWindow,
  applyDecision,
  attemptSigning,
  evaluateApproach,
  scoutPlayer,
  standingsOrder,
  valuePlayer,
  clubSquadPlayers,
  currentYear,
  suggestTargets,
  queryPlayer,
  resolvePlayer,
  courtPlayer,
  poleSuitorFor,
  SCENARIOS,
  Rng,
  type GameState,
  type Position,
} from '@director/engine';

const SAVE = process.env.DIRECTOR_SAVE ?? 'playthrough.json';
const m = (n: number) => `£${(n / 1_000_000).toFixed(1)}m`;

function load(): GameState {
  if (!existsSync(SAVE)) throw new Error(`No game in progress. Run: play new <scenarioId>`);
  return JSON.parse(readFileSync(SAVE, 'utf8')) as GameState;
}
function save(s: GameState): void {
  writeFileSync(SAVE, JSON.stringify(s));
}

function table(s: GameState): string {
  const league = s.leagues[s.clubs[s.playerClub]!.leagueId!]!;
  const order =
    league.roundsPlayed === 0
      ? [...league.clubIds].sort((a, b) => s.clubs[b]!.strength - s.clubs[a]!.strength)
      : standingsOrder(league);
  const heading = league.roundsPlayed === 0 ? 'pre-season form guide' : `after ${league.roundsPlayed} rounds`;
  const rows = order.slice(0, 6).map((id, i) => row(s, league, id, i + 1));
  const userPos = order.indexOf(s.playerClub);
  if (userPos >= 6) rows.push('   …', row(s, league, s.playerClub, userPos + 1));
  return `  ${league.name} — ${heading}\n${rows.join('\n')}`;
}
function row(s: GameState, league: GameState['leagues'][string], id: string, pos: number): string {
  const r = league.standings[id]!;
  const you = id === s.playerClub ? ' «' : '';
  const gd = r.goalsFor - r.goalsAgainst;
  return `  ${String(pos).padStart(2)} ${s.clubs[id]!.name.padEnd(22)} P${r.played} ${String(r.points).padStart(2)}pts (${gd >= 0 ? '+' : ''}${gd})${you}`;
}

function briefing(s: GameState): void {
  const club = s.clubs[s.playerClub]!;
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`  ${SCENARIOS[s.meta.scenarioId]?.name ?? s.meta.scenarioId}`);
  console.log(`  ${s.clock.date}  ·  ${s.clock.window ? s.clock.window.toUpperCase() + ' WINDOW' : 'in-season'}  ·  ${club.name}`);
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  Board: "${s.board.mandate}"`);
  console.log(`  Patience ${bar(s.board.patience)}  ${s.board.warnings ? `⚠ ${s.board.warnings} warning(s)` : ''}${s.board.dismissed ? '  ✗ DISMISSED' : ''}`);
  console.log(`  Budget ${m(club.finances.transferBudget)}  ·  Wage bill ${m(club.finances.wageBill)}/yr  ·  Strength ${club.strength.toFixed(0)}`);
  console.log('----------------------------------------------------------------');
  console.log(table(s));
  console.log('----------------------------------------------------------------');

  // Squad highlights: stars, unhappy, injured.
  const squad = clubSquadPlayers(s, s.playerClub).sort((a, b) => b.ability - a.ability);
  console.log('  Key players (scouted view):');
  for (const p of squad.slice(0, 5)) {
    const age = currentYear(s) - p.birthYear;
    const inj = p.injury ? `  ✚ injured ${p.injury.monthsRemaining}mo` : '';
    const mood = p.morale < 50 ? '  ☹ unsettled' : '';
    console.log(`   · ${p.name.padEnd(22)} ${p.positions.join('/').padEnd(6)} age ${age}  ${m(valuePlayer(p, currentYear(s)))}${inj}${mood}`);
  }
  const injured = squad.filter((p) => p.injury);
  if (injured.length) console.log(`  Injured: ${injured.map((p) => p.name).join(', ')}`);

  // Pending decisions (interrupts).
  if (s.pendingDecisions.length) {
    console.log('----------------------------------------------------------------');
    console.log('  ⚡ DECISIONS AWAITING YOU:');
    for (const d of s.pendingDecisions) {
      console.log(`\n  [${d.id}] ${d.title}`);
      console.log(`     ${d.description}`);
      for (const c of d.choices) {
        const risk = c.successProbability !== undefined ? ` (success ~${Math.round(c.successProbability * 100)}%)` : '';
        console.log(`       → ${c.id}: ${c.label}${risk}`);
      }
    }
    console.log(`\n  Resolve with:  play decide <decisionId> <choiceId>`);
  } else {
    console.log('----------------------------------------------------------------');
    console.log('  No decisions pending. Advance with:  play advance');
  }
  console.log('════════════════════════════════════════════════════════════════\n');
}

function bar(v: number): string {
  const n = Math.round(v / 10);
  return `[${'█'.repeat(n)}${'░'.repeat(10 - n)}] ${v}`;
}

function recent(s: GameState, since: number): void {
  const notable = s.eventLog.filter(
    (e) => e.seq >= since && ['transfer', 'injury', 'scandal', 'event', 'match'].includes(e.category) && e.code !== 'league.month',
  );
  if (notable.length) {
    console.log('  Since your last turn:');
    for (const e of notable.slice(-12)) console.log(`   · ${e.date}  ${e.message}`);
  }
}

function main(): void {
  const [cmd, a, b] = process.argv.slice(2);
  switch (cmd) {
    case 'new': {
      const scenarioId = a ?? 'man-utd-1999';
      if (!SCENARIOS[scenarioId]) {
        console.log(`Unknown scenario. Choose one of:\n${Object.keys(SCENARIOS).map((k) => `  - ${k}  (${SCENARIOS[k]!.name})`).join('\n')}`);
        process.exit(1);
      }
      const s = createNewGame({ scenarioId, seed: b ?? `play-${Date.now()}` });
      save(s);
      briefing(s);
      break;
    }
    case 'state':
      briefing(load());
      break;
    case 'advance': {
      const s0 = load();
      if (s0.board.dismissed) { console.log('You have been dismissed. Game over. Start again with: play new'); break; }
      const since = s0.meta.nextSeq;
      const { state } = advanceWindow(s0);
      save(state);
      recent(state, since);
      briefing(state);
      break;
    }
    case 'decide': {
      const s0 = load();
      const { state, success } = applyDecision(s0, a!, b!);
      save(state);
      console.log(`\n  Decision resolved: ${success ? '✓ it went your way' : '✗ it backfired'}.`);
      briefing(state);
      break;
    }
    case 'sign': {
      const s0 = load();
      const target = resolvePlayer(s0, process.argv.slice(3, 4).join(' ') || a!);
      if (!target) { console.log(`\n  ✗ No player matching "${a}".`); break; }
      const res = attemptSigning(s0, { playerId: target.id, toClub: s0.playerClub });
      if (res.ok) {
        save(s0);
        console.log(`\n  ✓ Signed ${target.name} for ${m(res.fee)}.`);
      } else {
        console.log(`\n  ✗ ${res.reason}`);
      }
      briefing(s0);
      break;
    }
    case 'scout': {
      const s = load();
      const target = resolvePlayer(s, process.argv.slice(3).join(' ') || a!);
      if (!target) { console.log(`\n  ✗ No player matching "${a}".`); break; }
      const rep = scoutPlayer(s, s.playerClub, target.id, new Rng(s.meta.rngState).fork('scout-cli'), { observation: 0.6 });
      const verdict = evaluateApproach(s, { playerId: target.id, toClub: s.playerClub });
      console.log(`\n  Scout report — ${rep.name}`);
      console.log(`   Ability   ${rep.ability.low}–${rep.ability.high}  (${rep.confidence} confidence)`);
      console.log(`   Potential ${rep.potential.low}–${rep.potential.high}`);
      console.log(`   Traits    professionalism ${rep.personalityHints.professionalism}, ambition ${rep.personalityHints.ambition}`);
      console.log(`   Value     ${m(valuePlayer(target, currentYear(s)))}`);
      console.log(`   Approach  ${verdict.willing ? 'would consider a move' : 'RESISTS'} — ${verdict.reason}`);
      break;
    }
    case 'squad': {
      const s = load();
      const squad = clubSquadPlayers(s, s.playerClub).sort((x, y) => b2(x) - b2(y));
      console.log(`\n  ${s.clubs[s.playerClub]!.name} squad (${squad.length})`);
      for (const p of squad) {
        const age = currentYear(s) - p.birthYear;
        console.log(`   ${p.positions[0]!.padEnd(3)} ${p.name.padEnd(22)} age ${String(age).padStart(2)}  morale ${p.morale}  ${m(valuePlayer(p, currentYear(s)))}${p.injury ? '  ✚' : ''}`);
      }
      break;
    }
    case 'targets': {
      const s = load();
      const pos = (a?.toUpperCase() ?? 'CM') as Position;
      const budget = s.clubs[s.playerClub]!.finances.transferBudget;
      const list = suggestTargets(s, pos, { maxResults: 10, favourAvailable: true });
      console.log(`\n  Suggested ${pos} targets (budget ${m(budget)}):`);
      for (const t of list) {
        const tags = t.tags.length ? `  [${t.tags.join(', ')}]` : '';
        const afford = t.askingPrice <= budget ? '' : '  (over budget)';
        console.log(`   · ${t.name.padEnd(22)} ${t.clubName.padEnd(18)} age ${t.age}  ability ${t.ability.low}–${t.ability.high}  ~${m(t.askingPrice)}${tags}${afford}`);
        if (!t.willing) console.log(`       ↳ ${t.resistanceReason}`);
      }
      console.log(`\n  Query anyone with:  play query <name>`);
      break;
    }
    case 'court': {
      const s = load();
      const target = resolvePlayer(s, process.argv.slice(3).join(' ') || a!);
      if (!target) { console.log(`\n  ✗ No player matching "${a}".`); break; }
      const r = courtPlayer(s, target.id);
      if (r.ok) {
        save(s);
        console.log(`\n  ${r.reason}`);
        const pole = poleSuitorFor(s, target.id);
        if (pole) console.log(`   ↳ ${s.clubs[pole]?.name ?? pole} are in pole position for him — keep working his camp before you bid.`);
      } else {
        console.log(`\n  ✗ ${r.reason}`);
      }
      break;
    }
    case 'query': {
      const s = load();
      const name = process.argv.slice(3).join(' ');
      const q = queryPlayer(s, name);
      if (!q.visible) { console.log(`\n  ${q.note}`); break; }
      const r = q.report!;
      console.log(`\n  ${r.name} — ${q.clubName} (age ${q.age})`);
      console.log(`   Ability   ${r.ability.low}–${r.ability.high}  (${r.confidence} confidence)`);
      console.log(`   Potential ${r.potential.low}–${r.potential.high}`);
      console.log(`   Asking    ~${m(q.askingPrice!)}${q.tags!.length ? `   [${q.tags!.join(', ')}]` : ''}`);
      console.log(`   Approach  ${q.willing ? 'would consider a move' : 'RESISTS'} — ${q.resistanceReason}`);
      break;
    }
    default:
      console.log('Commands: new <scenario> | state | advance | decide <id> <choice> | sign <playerId|name> [feeM] | scout <playerId> | squad | targets <pos> | query <name>');
  }
}

function b2(_p: unknown): number {
  return 0; // stable order placeholder; squad prints in squad order
}

main();
