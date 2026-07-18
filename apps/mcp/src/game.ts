/**
 * Game store for the MCP server.
 *
 * The MCP tools are stateless calls, so the server holds the current game and
 * persists it to a save file between calls (one game per server — personal play).
 * Each helper loads the game, runs a pure @director/engine transition, saves, and
 * returns compact data for Claude to narrate.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import {
  createNewGame,
  advanceWindow,
  applyDecision,
  attemptSigning,
  executeTransfer,
  scoutPlayer,
  suggestTargets,
  resolvePlayer,
  askingPrice,
  evaluateApproach,
  coachFit,
  valuePlayer,
  currentYear,
  narrativeContext,
  standingsOrder,
  clubSquadPlayers,
  isProcedural,
  SCENARIOS,
  Rng,
  type GameState,
  type Position,
} from '@director/engine';

const SAVE = process.env.DIRECTOR_SAVE ?? new URL('../the-director-save.json', import.meta.url).pathname;

export function hasGame(): boolean {
  return existsSync(SAVE);
}
function load(): GameState {
  if (!existsSync(SAVE)) throw new Error('No game in progress. Start one with new_game first.');
  return JSON.parse(readFileSync(SAVE, 'utf8')) as GameState;
}
function save(s: GameState): void {
  writeFileSync(SAVE, JSON.stringify(s));
}

const m = (n: number) => `£${(n / 1_000_000).toFixed(1)}m`;

export function listScenarios() {
  return Object.values(SCENARIOS).map((sc) => ({
    id: sc.id,
    name: sc.name,
    startDate: sc.startDate,
    club: sc.playerClub,
    mandate: sc.mandate,
  }));
}

export function newGame(scenarioId: string, seed?: string) {
  const state = createNewGame({ scenarioId, seed: seed ?? `mcp:${Date.now()}` });
  save(state);
  return situation();
}

/** The rich narrative situation + a compact status line. */
export function situation() {
  const s = load();
  const club = s.clubs[s.playerClub]!;
  return {
    status: {
      club: club.name,
      date: s.clock.date,
      window: s.clock.window,
      budget: m(club.finances.transferBudget),
      wageBillAnnual: m(club.finances.wageBill),
    },
    situation: narrativeContext(s),
    pendingDecisions: s.pendingDecisions.map((d) => ({ id: d.id, title: d.title, choices: d.choices.map((c) => ({ id: c.id, label: c.label })) })),
  };
}

export function advance() {
  const s = load();
  const before = s.meta.nextSeq;
  const { state, events } = advanceWindow(s, { pausePerStep: true });
  save(state);
  return {
    now: { date: state.clock.date, window: state.clock.window, step: state.clock.windowStep },
    events: events.filter((e) => e.seq >= before).map((e) => e.message),
    pendingDecisions: state.pendingDecisions.map((d) => ({ id: d.id, title: d.title, choices: d.choices.map((c) => ({ id: c.id, label: c.label })) })),
  };
}

export function squad() {
  const s = load();
  const year = currentYear(s);
  return clubSquadPlayers(s, s.playerClub)
    .sort((a, b) => b.ability - a.ability)
    .map((p) => ({
      id: p.id,
      name: p.name,
      positions: p.positions,
      age: year - p.birthYear,
      ability: p.ability,
      morale: p.morale,
      contractUntil: p.contractUntil,
      wageWeekly: `£${Math.round(p.wage / 52 / 1000)}k/wk`,
      injured: !!p.injury,
    }));
}

export function table() {
  const s = load();
  const club = s.clubs[s.playerClub]!;
  const league = club.leagueId ? s.leagues[club.leagueId] : undefined;
  if (!league) return [];
  const order = league.roundsPlayed === 0
    ? [...league.clubIds].sort((a, b) => s.clubs[b]!.strength - s.clubs[a]!.strength)
    : standingsOrder(league);
  return order.map((id, i) => {
    const r = league.standings[id];
    return { pos: i + 1, club: s.clubs[id]?.name ?? id, points: r?.points ?? 0, played: r?.played ?? 0, isYou: id === s.playerClub };
  });
}

export function resolveDecision(decisionId: string, choiceId: string) {
  const s = load();
  const { state, events, success } = applyDecision(s, decisionId, choiceId);
  save(state);
  return { success, events: events.map((e) => e.message) };
}

export function listTargets(position: string, maxPrice?: number) {
  const s = load();
  const pos = position as Position;
  const targets = suggestTargets(s, pos, { maxPrice, maxResults: 12 });
  return targets
    .map((t) => {
      const p = s.players[t.playerId];
      const fit = p ? coachFit(s.managerRelations, p) : undefined;
      return {
        playerId: t.playerId,
        name: t.name,
        club: t.clubName,
        age: t.age,
        positions: p?.positions ?? [],
        askingPrice: m(t.askingPrice),
        ability: t.ability,
        tags: t.tags,
        willing: t.willing,
        coach: fit ? `${fit.verdict}: ${fit.reason}` : undefined,
        exactPosition: (p?.positions ?? []).includes(pos),
      };
    })
    .sort((a, b) => Number(b.exactPosition) - Number(a.exactPosition));
}

export function findPlayer(query: string) {
  const s = load();
  const p = resolvePlayer(s, query);
  if (!p) return { found: false };
  const verdict = evaluateApproach(s, { playerId: p.id, toClub: s.playerClub });
  const fit = coachFit(s.managerRelations, p);
  return {
    found: true,
    playerId: p.id,
    name: p.name,
    club: p.club ? s.clubs[p.club]?.name : 'Free agent',
    age: currentYear(s) - p.birthYear,
    positions: p.positions,
    askingPrice: m(askingPrice(s, p.id)),
    willing: verdict.willing,
    resistanceReason: verdict.reason,
    coach: `${fit.verdict}: ${fit.reason}`,
  };
}

export function scout(playerId: string) {
  const s = load();
  const rng = new Rng(s.meta.rngState).fork(`scout:mcp:${playerId}`);
  const report = scoutPlayer(s, s.playerClub, playerId, rng, { observation: 0.6 });
  return report;
}

export function sign(playerId: string, feeM?: number) {
  const s = load();
  const fee = feeM !== undefined ? Math.round(feeM * 1_000_000) : undefined;
  const result = attemptSigning(s, { playerId, toClub: s.playerClub, fee });
  save(s);
  return result.ok
    ? { ok: true, signed: s.players[playerId]?.name, fee: m(result.fee) }
    : { ok: false, reason: result.reason };
}

export function offers(playerId: string) {
  const s = load();
  const p = s.players[playerId];
  if (!p || p.club !== s.playerClub) return { offers: [], reason: 'Not one of your players.' };
  const value = valuePlayer(p, currentYear(s));
  const jitter = (str: string): number => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % 100;
  };
  const list = Object.values(s.clubs)
    .filter((c) => c.id !== s.playerClub && c.leagueId !== null)
    .filter((c) => c.strength >= p.ability - 13 && c.strength <= p.ability + 5)
    .filter((c) => c.finances.transferBudget >= value * 0.5)
    .map((c) => ({ clubId: c.id, club: c.name, fee: Math.round(Math.min(c.finances.transferBudget, value * (0.6 + (jitter(c.id + playerId) / 100) * 0.35))) }))
    .sort((a, b) => b.fee - a.fee)
    .slice(0, 4)
    .map((o) => ({ ...o, feeLabel: m(o.fee) }));
  return { player: p.name, marketValue: m(value), offers: list };
}

export function sell(playerId: string, toClub: string, fee: number) {
  const s = load();
  const p = s.players[playerId];
  if (!p || p.club !== s.playerClub) return { ok: false, reason: 'Not your player.' };
  const result = executeTransfer(s, { playerId, toClub, fee: Math.round(fee) });
  save(s);
  return result.ok ? { ok: true, sold: p.name, to: s.clubs[toClub]?.name, fee: m(result.fee) } : { ok: false, reason: result.reason };
}

export function renew(playerId: string, years: number) {
  const s = load();
  const p = s.players[playerId];
  if (!p || p.club !== s.playerClub) return { ok: false, reason: 'Not your player.' };
  const n = Math.max(1, Math.min(5, Math.round(years)));
  // Extend from the current season, off a free transfer; modest wage bump.
  const year = currentYear(s);
  p.contractUntil = Math.max(p.contractUntil, year + n);
  p.wage = Math.round(p.wage * 1.1);
  save(s);
  return { ok: true, player: p.name, contractUntil: p.contractUntil };
}

export function freeAgents(position?: string) {
  const s = load();
  const yr = currentYear(s);
  const wantPos = position ? (position as Position) : null;
  return Object.values(s.players)
    .filter((p) => !isProcedural(p) && !p.retired && p.club !== s.playerClub && p.contractUntil <= yr + 1)
    .filter((p) => !wantPos || p.positions.includes(wantPos))
    .sort((a, b) => b.ability - a.ability)
    .slice(0, 12)
    .map((p) => ({ playerId: p.id, name: p.name, club: p.club ? s.clubs[p.club]?.name : 'Free agent', age: yr - p.birthYear, positions: p.positions, expires: p.contractUntil }));
}
