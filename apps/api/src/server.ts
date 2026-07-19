/**
 * The Director — engine API.
 *
 * A thin, zero-dependency HTTP wrapper over the pure @director/engine. Every
 * endpoint is a stateless engine transition: the client sends the current
 * `state` blob, the server runs the pure function, and returns the new `state`
 * plus a UI `view` projection. The engine is the single source of truth — the
 * frontend never reimplements game logic, so any engine change here reaches the
 * app the moment this service is redeployed.
 *
 * Stateless by design: the client persists the `state` blob (localStorage /
 * Supabase). Swap in server-side persistence later without touching the client
 * contract — the transitions stay the same.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { narrate } from './narrate.js';
import {
  createNewGame,
  advanceWindow,
  applyDecision,
  applyConsequence,
  attemptSigning,
  executeTransfer,
  scoutPlayer,
  suggestTargets,
  isProcedural,
  resolvePlayer,
  askingPrice,
  evaluateApproach,
  coachFit,
  narrativeContext,
  coachBriefing,
  clubSquadPlayers,
  standingsOrder,
  valuePlayer,
  liveRoleEstimate,
  currentYear,
  Rng,
  SCENARIOS,
  type GameState,
  type Position,
} from '@director/engine';
import { buildView } from './view.js';

const PORT = Number(process.env.PORT ?? 8787);
// Lock this to your Lovable app's origin in production; '*' is fine for dev.
const ALLOW_ORIGIN = process.env.CORS_ORIGIN ?? '*';

type Handler = (body: any) => unknown | Promise<unknown>;

/** POST route table — every game transition is a pure engine call. */
const routes: Record<string, Handler> = {
  // The hosted narrator: one Director turn (message in → prose + new state out).
  // Runs the Claude tool-loop server-side on the host's key, so anyone can play
  // with just a browser.
  '/games/narrate': ({ state, message, history }) =>
    narrate({ state: state ?? null, message: String(message ?? ''), history }),

  '/games': ({ scenarioId, seed }) => {
    const state = createNewGame({ scenarioId, seed: seed ?? `web:${Date.now()}` });
    return { state, view: buildView(state) };
  },

  '/games/advance': ({ state, perStep }) => {
    const { state: next, events } = advanceWindow(state as GameState, { pausePerStep: perStep ?? true });
    return { state: next, view: buildView(next), events };
  },

  '/games/decision': ({ state, decisionId, choiceId }) => {
    const { state: next, events, success } = applyDecision(state as GameState, decisionId, choiceId);
    return { state: next, view: buildView(next), events, success };
  },

  '/games/sign': ({ state, playerId, feeM }) => {
    const s = state as GameState;
    const fee = feeM !== undefined ? Math.round(feeM * 1_000_000) : undefined;
    const result = attemptSigning(s, { playerId, toClub: s.playerClub, fee });
    return { state: s, view: buildView(s), result };
  },

  '/games/targets': ({ state, position, maxPrice }) => {
    const s = state as GameState;
    const pos = position as Position;
    const targets = suggestTargets(s, pos, { maxPrice, maxResults: 14 });
    // Enrich each with the player's ACTUAL positions (so the UI can show "Reus
    // (AM/LW)" even under a group search) and the head coach's read (M13).
    const enriched = targets.map((t) => {
      const p = s.players[t.playerId];
      const fit = p ? coachFit(s.managerRelations, p) : undefined;
      return {
        ...t,
        positions: p?.positions ?? [],
        coach: fit ? { verdict: fit.verdict, score: fit.score, reason: fit.reason } : undefined,
      };
    });
    // Show players who ACTUALLY play the requested position first, then the rest
    // of the position group (a natural winger before a converted striker).
    enriched.sort((a, b) => Number(b.positions.includes(pos)) - Number(a.positions.includes(pos)));
    return { targets: enriched };
  },

  // Players out of contract next summer (Bosman pre-contract targets) — real,
  // named, sorted by quality, with the coach's read. Answers "who's available on
  // a free / running down their deal?".
  '/games/freeagents': ({ state, position, maxResults }) => {
    const s = state as GameState;
    const yr = currentYear(s);
    const wantPos = position ? (position as Position) : null;
    const players = Object.values(s.players)
      .filter((p) => !isProcedural(p) && !p.retired && p.club !== s.playerClub)
      .filter((p) => p.contractUntil <= yr + 1)
      .filter((p) => !wantPos || p.positions.includes(wantPos))
      .sort((a, b) => b.ability - a.ability)
      .slice(0, Math.min(20, Number(maxResults ?? 12)));
    return {
      freeAgents: players.map((p) => {
        const fit = coachFit(s.managerRelations, p);
        return {
          playerId: p.id,
          name: p.name,
          club: p.club,
          clubName: p.club ? s.clubs[p.club]?.name : 'Free agent',
          age: yr - p.birthYear,
          positions: p.positions,
          expires: p.contractUntil,
          coach: { verdict: fit.verdict, reason: fit.reason },
        };
      }),
    };
  },

  // Name a dream target — search the world for a real player by name, even one the
  // recommender hides as unraidable (Moyes naming Kroos). Returns his read + terms.
  '/games/find': ({ state, query }) => {
    const s = state as GameState;
    const p = resolvePlayer(s, String(query ?? ''));
    if (!p) return { found: false };
    const verdict = evaluateApproach(s, { playerId: p.id, toClub: s.playerClub });
    const fit = coachFit(s.managerRelations, p);
    return {
      found: true,
      target: {
        playerId: p.id,
        name: p.name,
        club: p.club,
        clubName: p.club ? s.clubs[p.club]?.name : null,
        age: currentYear(s) - p.birthYear,
        positions: p.positions,
        askingPrice: askingPrice(s, p.id),
        willing: verdict.willing,
        resistanceReason: verdict.reason,
        coach: { verdict: fit.verdict, score: fit.score, reason: fit.reason },
      },
    };
  },

  // Who would realistically buy one of YOUR players, and for how much. A fringe
  // player draws clubs AT HIS LEVEL (not the elite, who don't want him) at a
  // discount to book value, with fees varying by club. Powers "sell" in the UI.
  '/games/offers': ({ state, playerId }) => {
    const s = state as GameState;
    const p = s.players[playerId];
    if (!p || p.club !== s.playerClub) return { offers: [], marketValue: 0 };
    const value = valuePlayer(p, currentYear(s));
    const jitter = (str: string): number => {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return (h >>> 0) % 100; // 0..99
    };
    const offers = Object.values(s.clubs)
      // Any real club may bid — including continental giants, who in an English
      // save carry no simulated leagueId but are very much in the market (Vieira to
      // Juventus, say). Exclude only the user and synthetic promoted placeholders.
      .filter((c) => c.id !== s.playerClub && !c.id.startsWith('promoted_'))
      // Clubs roughly at the player's level: the elite don't want a squad player,
      // and a much weaker club can't realistically land him.
      .filter((c) => c.strength >= p.ability - 13 && c.strength <= p.ability + 5)
      .filter((c) => c.finances.transferBudget >= value * 0.5)
      .map((c) => {
        // Discounted, varied bid (0.6–0.95 of value) — you rarely get full price
        // for a man you're offloading.
        const factor = 0.6 + (jitter(c.id + playerId) / 100) * 0.35;
        return { clubId: c.id, clubName: c.name, fee: Math.round(Math.min(c.finances.transferBudget, value * factor)) };
      })
      .filter((o) => o.fee > 0)
      .sort((a, b) => b.fee - a.fee)
      .slice(0, 4);
    return { offers, marketValue: Math.round(value) };
  },

  // Sell one of your players to a named buyer (accept an offer).
  '/games/sell': ({ state, playerId, toClub, fee }) => {
    const s = state as GameState;
    const p = s.players[playerId];
    if (!p || p.club !== s.playerClub) return { state: s, view: buildView(s), result: { ok: false, reason: 'Not your player.' } };
    const buyer = s.clubs[toClub as string];
    if (!buyer) return { state: s, view: buildView(s), result: { ok: false, reason: 'Unknown buying club.' } };
    const price = fee !== undefined ? Math.round(fee) : Math.round(valuePlayer(p, currentYear(s)));
    // A Director-sanctioned sale always completes — the buyer stretches to the
    // agreed fee, so the sale banks money instead of failing on the buyer's kitty.
    buyer.finances.transferBudget = Math.max(buyer.finances.transferBudget, price);
    const result = executeTransfer(s, { playerId, toClub: buyer.id, fee: price });
    return { state: s, view: buildView(s), result };
  },

  // Renew a squad player for a chosen number of years (1–5).
  '/games/renew': ({ state, playerId, years }) => {
    const s = state as GameState;
    const p = s.players[playerId];
    if (!p || p.club !== s.playerClub) return { state: s, view: buildView(s), result: { ok: false, reason: 'Not your player.' } };
    const n = Math.max(1, Math.min(5, Math.round(Number(years ?? 3))));
    applyConsequence(s, { kind: 'renewContract', playerId, amount: n });
    return { state: s, view: buildView(s), result: { ok: true, playerId, years: n, contractUntil: s.players[playerId]?.contractUntil } };
  },

  '/games/scout': ({ state, playerId }) => {
    const s = state as GameState;
    const rng = new Rng(s.meta.rngState).fork(`scout:web:${playerId}`);
    const report = scoutPlayer(s, s.playerClub, playerId, rng, { observation: 0.6 });
    const p = s.players[playerId];
    const value = p ? valuePlayer(p, currentYear(s)) : 0;
    return { report, value };
  },

  '/games/view': ({ state }) => ({ view: buildView(state as GameState) }),

  // The head coach's opening briefing (mood, priority, shape, best XI, players
  // he isn't sold on, positions to strengthen, targets) — the manager meeting.
  '/games/manager': ({ state }) => ({ briefing: coachBriefing(state as GameState) }),

  // Rich structured "current situation" for the narrator (the app's language
  // model turns this into prose — a briefing, a matchday report, an answer to
  // "how's the dressing room?"). Facts only; no prose.
  '/games/situation': ({ state }) => ({ situation: narrativeContext(state as GameState) }),

  // Clickable panels for the chat UI: squad, finances, league table, inbox.
  '/games/panels': ({ state }) => ({ panels: buildPanels(state as GameState) }),
};

/** GET route table (read-only, no body). */
const getRoutes: Record<string, () => unknown> = {
  '/health': () => ({ ok: true }),
  '/scenarios': () =>
    Object.values(SCENARIOS).map((sc) => ({
      id: sc.id,
      name: sc.name,
      startDate: sc.startDate,
      playerClub: sc.playerClub,
      mandate: sc.mandate,
    })),
};

function cors(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function send(res: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

async function readBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const path = url.pathname.replace(/\/$/, '') || '/';

  try {
    // The chat website — one URL anyone can play.
    if (req.method === 'GET' && (path === '/' || path === '/play')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(chatPage());
      return;
    }
    if (req.method === 'GET' && getRoutes[path]) {
      send(res, 200, getRoutes[path]!());
      return;
    }
    if (req.method === 'POST' && routes[path]) {
      const body = await readBody(req);
      send(res, 200, await routes[path]!(body));
      return;
    }
    send(res, 404, { error: `No route ${req.method} ${path}` });
  } catch (err) {
    send(res, 400, { error: err instanceof Error ? err.message : String(err) });
  }
});

const HERE = dirname(fileURLToPath(import.meta.url));
let _page: string | null = null;
function chatPage(): string {
  if (_page === null) _page = readFileSync(join(HERE, 'index.html'), 'utf8');
  return _page;
}

const gbp = (n: number) => `£${(n / 1_000_000).toFixed(1)}m`;

/** Data for the four clickable panels (squad, finances, table, inbox). */
function buildPanels(state: GameState) {
  const s = state;
  const club = s.clubs[s.playerClub]!;
  const year = currentYear(s);

  const squad = clubSquadPlayers(s, s.playerClub)
    .sort((a, b) => b.ability - a.ability)
    .map((p) => {
      // Prefer the completed season's real numbers; before the first season ends,
      // fall back to a live role read so mins%/impact aren't blank mid-season.
      const live = liveRoleEstimate(s, club, p);
      const mins = Math.round((p.lastSeason ? p.lastSeason.minutesShare : live.minutesShare) * 100);
      const rating = p.lastSeason?.rating ?? live.rating;
      return {
        name: p.name,
        position: p.positions.join('/'),
        age: year - p.birthYear,
        ability: p.ability,
        value: gbp(valuePlayer(p, year)),
        wage: `£${Math.round(p.wage / 52 / 1000)}k/wk`,
        contractUntil: p.contractUntil,
        happiness: p.morale, // 0..100
        minutes: `${mins}%`,
        impact: rating >= 7.2 ? 'key' : rating >= 6.4 ? 'regular' : 'squad',
        injured: !!p.injury,
      };
    });

  // Commercial heft & liabilities aren't fully modelled yet — derive honest
  // proxies from prestige and ownership rather than invent figures.
  const heft = club.prestige >= 85 ? 'Global powerhouse' : club.prestige >= 74 ? 'Major commercial draw' : club.prestige >= 60 ? 'Established' : 'Modest reach';
  const liabilities = club.finances.ownership === 'debt' ? 'Debt-financed ownership' : club.finances.ownership === 'sugar-daddy' ? 'Owner-underwritten' : 'Self-sustaining';
  const finances = {
    transferBudget: gbp(club.finances.transferBudget),
    wageBudgetAnnual: gbp(club.finances.wageBudget),
    wageBillAnnual: gbp(club.finances.wageBill),
    wageHeadroom: gbp(Math.max(0, club.finances.wageBudget - club.finances.wageBill)),
    commercialHeft: heft,
    ownership: club.finances.ownership,
    financialHealth: club.financialHealth,
    liabilities,
  };

  const league = club.leagueId ? s.leagues[club.leagueId] : undefined;
  const table = league
    ? (league.roundsPlayed === 0 ? [...league.clubIds].sort((a, b) => s.clubs[b]!.strength - s.clubs[a]!.strength) : standingsOrder(league)).map((id: string, i: number) => ({
        pos: i + 1,
        club: s.clubs[id]?.name ?? id,
        played: league.standings[id]?.played ?? 0,
        points: league.standings[id]?.points ?? 0,
        isYou: id === s.playerClub,
      }))
    : [];

  const ctx = narrativeContext(s);
  const inbox: { kind: string; text: string }[] = [];
  for (const d of s.pendingDecisions) inbox.push({ kind: 'decision', text: d.title });
  for (const e of ctx.squad.expiring) inbox.push({ kind: 'contract', text: `${e.name}'s deal expires ${e.until}` });
  for (const inj of ctx.squad.injured) inbox.push({ kind: 'injury', text: `${inj.name} injured — ${inj.months}mo` });
  for (const u of ctx.squad.unsettled) inbox.push({ kind: 'unrest', text: `${u.name} ${u.reason}` });
  if (ctx.coach.formationTension) inbox.push({ kind: 'coach', text: ctx.coach.formationTension });
  inbox.push({ kind: 'board', text: `Board ${ctx.board.mood} (patience ${ctx.board.patience})` });
  for (const t of ctx.threads.slice(0, 3)) inbox.push({ kind: 'story', text: t });

  return { squad, finances, table, inbox };
}

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`The Director engine API listening on :${PORT} (CORS: ${ALLOW_ORIGIN})`);
});
