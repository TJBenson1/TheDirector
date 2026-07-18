/* Proactive issue hunt: play several scenarios passively for many seasons and
 * flag anything that doesn't sit right. Read-only on the engine. */
import { createNewGame, advanceWindow, standingsOrder, clubSquadPlayers, isProcedural, currentYear, valuePlayer, type GameState } from '@director/engine';

const findings: string[] = [];
function flag(s: string) { findings.push(s); }

function auditSquad(s: GameState, scn: string) {
  const yr = currentYear(s);
  for (const cid of Object.keys(s.clubs)) {
    const club = s.clubs[cid]!;
    const squad = clubSquadPlayers(s, cid);
    if (club.leagueId && s.leagues[club.leagueId]?.clubIds.includes(cid)) {
      if (squad.length < 14) flag(`[${scn} ${s.clock.date}] ${club.name} squad thin: ${squad.length}`);
      const ages = squad.map(p => yr - p.birthYear);
      const over36 = squad.filter(p => yr - p.birthYear >= 37).length;
      if (over36 >= 4) flag(`[${scn} ${s.clock.date}] ${club.name} has ${over36} players 37+ (ossifying?)`);
      const gk = squad.filter(p => p.positions.includes('GK')).length;
      if (gk === 0) flag(`[${scn} ${s.clock.date}] ${club.name} has NO goalkeeper`);
      if (Math.min(...ages) > 24 && squad.length > 15) flag(`[${scn} ${s.clock.date}] ${club.name} youngest player is ${Math.min(...ages)} (no youth)`);
    }
    for (const p of squad) {
      if (p.ability > 99 || p.ability < 20) flag(`[${scn} ${s.clock.date}] ${p.name} ability ${p.ability} out of range @ ${club.name}`);
      if (yr - p.birthYear > 43) flag(`[${scn} ${s.clock.date}] ${p.name} age ${yr - p.birthYear} still active @ ${club.name}`);
      if (!isProcedural(p) && p.contractUntil < yr - 1) flag(`[${scn} ${s.clock.date}] ${p.name} contract expired ${p.contractUntil} but still @ ${club.name}`);
    }
    if (club.finances.transferBudget < 0) flag(`[${scn} ${s.clock.date}] ${club.name} NEGATIVE budget ${club.finances.transferBudget}`);
    // filler out-rating a club's real stars
    const real = squad.filter(p => !isProcedural(p));
    const fill = squad.filter(p => isProcedural(p));
    if (real.length && fill.length) {
      const topReal = Math.max(...real.map(p => p.ability));
      const topFill = Math.max(...fill.map(p => p.ability));
      if (topFill > topReal) flag(`[${scn} ${s.clock.date}] ${club.name} filler (${topFill}) out-rates best real player (${topReal})`);
    }
  }
}

function auditTransfers(s: GameState, scn: string, sinceSeq: number) {
  const yr = currentYear(s);
  for (const e of s.eventLog.filter(e => e.seq >= sinceSeq && e.code === 'transfer.completed')) {
    const pid = e.data?.playerId as string; const fee = Number(e.data?.fee ?? 0);
    const p = pid ? s.players[pid] : null;
    if (p && fee > 0) {
      const age = yr - p.birthYear;
      if (age >= 33 && fee >= 30_000_000) flag(`[${scn} ${s.clock.date}] £${(fee/1e6).toFixed(0)}m for ${p.name} aged ${age} (old for the fee)`);
      if (isProcedural(p) && fee >= 15_000_000) flag(`[${scn} ${s.clock.date}] £${(fee/1e6).toFixed(0)}m for FILLER ${p.name}`);
      const val = valuePlayer(p, yr);
      if (fee > val * 3 && fee >= 20_000_000) flag(`[${scn} ${s.clock.date}] ${p.name} sold for £${(fee/1e6).toFixed(0)}m vs value £${(val/1e6).toFixed(0)}m (>3x)`);
    }
  }
}

const SCN = ['man-utd-1999', 'liverpool-2001', 'chelsea-2003', 'real-madrid-2000', 'juventus-1995', 'bayern-1998'];
for (const scn of SCN) {
  let s = createNewGame({ scenarioId: scn, seed: `hunt:${scn}` });
  const champions: string[] = [];
  let guard = 0;
  const startYear = currentYear(s);
  while (currentYear(s) < startYear + 12 && guard++ < 200) {
    const before = s.meta.nextSeq;
    s = advanceWindow(s, { pausePerStep: false }).state;
    auditTransfers(s, scn, before);
    // At each July rollover, audit squads + record champion
    if (s.clock.date.endsWith('-07')) {
      auditSquad(s, scn);
      const club = s.clubs[s.playerClub]!;
      const lg = club.leagueId ? s.leagues[club.leagueId] : undefined;
      if (lg && lg.titleHistory.length) {
        const last = lg.titleHistory[lg.titleHistory.length - 1]!;
        champions.push(`${last.seasonYear}:${s.clubs[last.championId]?.name}(${last.points})`);
      }
    }
    if (s.board.dismissed) { flag(`[${scn} ${s.clock.date}] USER DISMISSED (passive run should rarely sack a reality-tracking Director)`); break; }
  }
  console.log(`\n=== ${scn} champions ===\n  ${champions.join('  ')}`);
}

console.log(`\n\n================ FINDINGS (${findings.length}) ================`);
for (const f of findings) console.log('  ' + f);
if (!findings.length) console.log('  (no anomalies flagged)');
