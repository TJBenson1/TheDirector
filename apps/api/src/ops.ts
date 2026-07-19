/**
 * Engine operations as narrator TOOLS.
 *
 * Each op runs a pure @director/engine transition on a passed-in state and
 * returns `{ state, result }` — the result is compact data the narrator turns
 * into prose. `TOOL_SCHEMAS` describes the same ops to the language model.
 */

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
  coachBriefing,
  standingsOrder,
  clubSquadPlayers,
  isProcedural,
  applyConsequence,
  SCENARIOS,
  Rng,
  type GameState,
  type Position,
} from '@director/engine';

const m = (n: number) => `£${(n / 1_000_000).toFixed(1)}m`;
type Op = { state: GameState; result: unknown };

function jitter(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 100;
}

export function listScenarios() {
  return Object.values(SCENARIOS).map((sc) => ({ id: sc.id, name: sc.name, startDate: sc.startDate, mandate: sc.mandate }));
}

export function situationOf(s: GameState) {
  const club = s.clubs[s.playerClub]!;
  return {
    status: { club: club.name, date: s.clock.date, window: s.clock.window, budget: m(club.finances.transferBudget) },
    situation: narrativeContext(s),
    pendingDecisions: s.pendingDecisions.map((d) => ({ id: d.id, title: d.title, choices: d.choices.map((c) => ({ id: c.id, label: c.label })) })),
  };
}

/** Run a named tool against `state`. Returns the (possibly new) state + a result. */
export function runOp(state: GameState, name: string, input: Record<string, unknown>): Op {
  const s = state;
  switch (name) {
    case 'list_scenarios':
      return { state: s, result: listScenarios() };

    case 'new_game': {
      const next = createNewGame({ scenarioId: String(input.scenarioId), seed: input.seed ? String(input.seed) : `web:${Date.now()}` });
      return { state: next, result: situationOf(next) };
    }

    case 'situation':
      return { state: s, result: situationOf(s) };

    case 'advance': {
      const before = s.meta.nextSeq;
      const { state: next, events } = advanceWindow(s, { pausePerStep: true });
      return {
        state: next,
        result: {
          now: { date: next.clock.date, window: next.clock.window, step: next.clock.windowStep },
          events: events.filter((e) => e.seq >= before).map((e) => e.message),
          pendingDecisions: next.pendingDecisions.map((d) => ({ id: d.id, title: d.title, choices: d.choices.map((c) => ({ id: c.id, label: c.label })) })),
        },
      };
    }

    case 'manager_meeting':
      return { state: s, result: coachBriefing(s) };

    case 'squad': {
      const year = currentYear(s);
      return {
        state: s,
        result: clubSquadPlayers(s, s.playerClub).sort((a, b) => b.ability - a.ability).map((p) => ({
          id: p.id, name: p.name, positions: p.positions, age: year - p.birthYear, ability: p.ability, morale: p.morale, contractUntil: p.contractUntil, wageWeekly: `£${Math.round(p.wage / 52 / 1000)}k/wk`, injured: !!p.injury,
        })),
      };
    }

    case 'league_table': {
      const club = s.clubs[s.playerClub]!;
      const league = club.leagueId ? s.leagues[club.leagueId] : undefined;
      if (!league) return { state: s, result: [] };
      const order = league.roundsPlayed === 0 ? [...league.clubIds].sort((a, b) => s.clubs[b]!.strength - s.clubs[a]!.strength) : standingsOrder(league);
      return { state: s, result: order.map((id, i) => ({ pos: i + 1, club: s.clubs[id]?.name ?? id, points: league.standings[id]?.points ?? 0, played: league.standings[id]?.played ?? 0, isYou: id === s.playerClub })) };
    }

    case 'resolve_decision': {
      const { state: next, events, success } = applyDecision(s, String(input.decisionId), String(input.choiceId));
      return { state: next, result: { success, events: events.map((e) => e.message) } };
    }

    case 'list_targets': {
      const pos = String(input.position) as Position;
      const maxPrice = input.maxPriceM !== undefined ? Number(input.maxPriceM) * 1_000_000 : undefined;
      // `young: true` → prospect mode: rank by scouted UPSIDE, not present ability,
      // so a request for young talent surfaces teenagers with a ceiling, not 30-yos.
      const prospects = Boolean(input.young);
      const targets = suggestTargets(s, pos, { maxPrice, maxResults: 12, prospects }).map((t) => {
        const p = s.players[t.playerId];
        const fit = p ? coachFit(s.managerRelations, p) : undefined;
        return { playerId: t.playerId, name: t.name, club: t.clubName, age: t.age, positions: p?.positions ?? [], askingPrice: m(t.askingPrice), ability: t.ability, tags: t.tags, willing: t.willing, coach: fit ? `${fit.verdict}: ${fit.reason}` : undefined, exact: (p?.positions ?? []).includes(pos) };
      });
      targets.sort((a, b) => Number(b.exact) - Number(a.exact));
      return { state: s, result: targets };
    }

    case 'find_player': {
      const p = resolvePlayer(s, String(input.name));
      if (!p) return { state: s, result: { found: false } };
      const verdict = evaluateApproach(s, { playerId: p.id, toClub: s.playerClub });
      const fit = coachFit(s.managerRelations, p);
      return { state: s, result: { found: true, playerId: p.id, name: p.name, club: p.club ? s.clubs[p.club]?.name : 'Free agent', age: currentYear(s) - p.birthYear, positions: p.positions, askingPrice: m(askingPrice(s, p.id)), willing: verdict.willing, resistanceReason: verdict.reason, coach: `${fit.verdict}: ${fit.reason}` } };
    }

    case 'scout': {
      const rng = new Rng(s.meta.rngState).fork(`scout:web:${input.playerId}`);
      return { state: s, result: scoutPlayer(s, s.playerClub, String(input.playerId), rng, { observation: 0.6 }) };
    }

    case 'sign': {
      const fee = input.feeM !== undefined ? Math.round(Number(input.feeM) * 1_000_000) : undefined;
      const result = attemptSigning(s, { playerId: String(input.playerId), toClub: s.playerClub, fee });
      return { state: s, result: result.ok ? { ok: true, signed: s.players[String(input.playerId)]?.name, fee: m(result.fee) } : { ok: false, reason: result.reason } };
    }

    case 'offers': {
      const p = s.players[String(input.playerId)];
      if (!p || p.club !== s.playerClub) return { state: s, result: { offers: [], reason: 'Not your player.' } };
      const value = valuePlayer(p, currentYear(s));
      const offers = Object.values(s.clubs)
        .filter((c) => c.id !== s.playerClub && c.leagueId !== null && c.strength >= p.ability - 13 && c.strength <= p.ability + 5 && c.finances.transferBudget >= value * 0.5)
        .map((c) => ({ clubId: c.id, club: c.name, fee: Math.round(Math.min(c.finances.transferBudget, value * (0.6 + (jitter(c.id + p.id) / 100) * 0.35))) }))
        .sort((a, b) => b.fee - a.fee).slice(0, 4).map((o) => ({ ...o, feeLabel: m(o.fee) }));
      return { state: s, result: { player: p.name, marketValue: m(value), offers } };
    }

    case 'sell': {
      const p = s.players[String(input.playerId)];
      if (!p || p.club !== s.playerClub) return { state: s, result: { ok: false, reason: 'Not your player.' } };
      const buyer = s.clubs[String(input.toClub)];
      if (!buyer) return { state: s, result: { ok: false, reason: 'Unknown buying club.' } };
      // Never sell for £0 because the fee arrived missing/garbled — fall back to
      // the player's market value so the sale actually banks money.
      const rawFee = Number(input.fee);
      const fee = Number.isFinite(rawFee) && rawFee > 0 ? Math.round(rawFee) : Math.round(valuePlayer(p, currentYear(s)));
      // A Director-sanctioned sale always completes: the buying club stretches to
      // the agreed fee (as real clubs do for a target they want), so the sale
      // reliably banks money instead of silently failing when that club's kitty is
      // short — the "fee never landed" bug. Report the resulting budget so the
      // narrator states the real number rather than guessing.
      buyer.finances.transferBudget = Math.max(buyer.finances.transferBudget, fee);
      const result = executeTransfer(s, { playerId: p.id, toClub: buyer.id, fee });
      return {
        state: s,
        result: result.ok
          ? { ok: true, sold: p.name, to: buyer.name, fee: m(result.fee), newBudget: m(s.clubs[s.playerClub]!.finances.transferBudget) }
          : { ok: false, reason: result.reason },
      };
    }

    case 'renew': {
      const p = s.players[String(input.playerId)];
      if (!p || p.club !== s.playerClub) return { state: s, result: { ok: false, reason: 'Not your player.' } };
      const n = Math.max(1, Math.min(5, Math.round(Number(input.years ?? 3))));
      applyConsequence(s, { kind: 'renewContract', playerId: p.id, amount: n });
      return { state: s, result: { ok: true, player: p.name, contractUntil: s.players[p.id]?.contractUntil } };
    }

    case 'free_agents': {
      const yr = currentYear(s);
      const wantPos = input.position ? (String(input.position) as Position) : null;
      return {
        state: s,
        result: Object.values(s.players)
          .filter((p) => !isProcedural(p) && !p.retired && p.club !== s.playerClub && p.contractUntil <= yr + 1)
          .filter((p) => !wantPos || p.positions.includes(wantPos))
          .sort((a, b) => b.ability - a.ability).slice(0, 12)
          .map((p) => ({ playerId: p.id, name: p.name, club: p.club ? s.clubs[p.club]?.name : 'Free agent', age: yr - p.birthYear, positions: p.positions, expires: p.contractUntil })),
      };
    }

    default:
      return { state: s, result: { error: `Unknown tool ${name}` } };
  }
}

const POS = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];

/** Anthropic tool definitions for the same ops. */
export const TOOL_SCHEMAS = [
  { name: 'list_scenarios', description: 'List playable starting points (club + season + mandate).', input_schema: { type: 'object', properties: {} } },
  { name: 'new_game', description: 'Start a new career at a scenario id.', input_schema: { type: 'object', properties: { scenarioId: { type: 'string' }, seed: { type: 'string' } }, required: ['scenarioId'] } },
  { name: 'situation', description: 'Current story: club, board mood, coach, squad tensions, open decisions.', input_schema: { type: 'object', properties: {} } },
  { name: 'manager_meeting', description: "The head coach's briefing: his mood, the club's priority (league/Europe/both), the shape he wants, his best XI, players he isn't sold on, positions to strengthen, and concrete targets. Use it for the opening manager meeting and whenever the Director asks the coach's view.", input_schema: { type: 'object', properties: {} } },
  { name: 'advance', description: 'Move time forward one step (window phase or month). Returns what happened + new decisions.', input_schema: { type: 'object', properties: {} } },
  { name: 'squad', description: 'Your full squad with age, ability, morale, contract, wages.', input_schema: { type: 'object', properties: {} } },
  { name: 'league_table', description: 'The current league table.', input_schema: { type: 'object', properties: {} } },
  { name: 'resolve_decision', description: 'Answer an open decision by id + choice id.', input_schema: { type: 'object', properties: { decisionId: { type: 'string' }, choiceId: { type: 'string' } }, required: ['decisionId', 'choiceId'] } },
  { name: 'list_targets', description: 'Realistic scouted transfer targets for a position (fogged ability, price, willingness, coach read). Set young:true for PROSPECTS — young players ranked by upside, for a "wonderkid"/"young talent"/"one for the future" request.', input_schema: { type: 'object', properties: { position: { type: 'string', enum: POS }, maxPriceM: { type: 'number' }, young: { type: 'boolean' } }, required: ['position'] } },
  { name: 'find_player', description: 'Look up a specific/dream target by name.', input_schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
  { name: 'scout', description: 'A sharper scouting report on a player id.', input_schema: { type: 'object', properties: { playerId: { type: 'string' } }, required: ['playerId'] } },
  { name: 'sign', description: 'Sign a player to your club (optional fee in £m). May be refused.', input_schema: { type: 'object', properties: { playerId: { type: 'string' }, feeM: { type: 'number' } }, required: ['playerId'] } },
  { name: 'offers', description: 'Who would buy one of your players, and for how much.', input_schema: { type: 'object', properties: { playerId: { type: 'string' } }, required: ['playerId'] } },
  { name: 'sell', description: 'Sell your player to a club for a fee (from offers).', input_schema: { type: 'object', properties: { playerId: { type: 'string' }, toClub: { type: 'string' }, fee: { type: 'number' } }, required: ['playerId', 'toClub', 'fee'] } },
  { name: 'renew', description: "Extend one of your players' contracts by 1-5 years.", input_schema: { type: 'object', properties: { playerId: { type: 'string' }, years: { type: 'number' } }, required: ['playerId', 'years'] } },
  { name: 'free_agents', description: 'Players out of contract next summer, optionally by position.', input_schema: { type: 'object', properties: { position: { type: 'string', enum: POS } } } },
];
