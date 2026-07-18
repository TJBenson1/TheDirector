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
import {
  createNewGame,
  advanceWindow,
  applyDecision,
  applyConsequence,
  attemptSigning,
  executeTransfer,
  scoutPlayer,
  suggestTargets,
  resolvePlayer,
  askingPrice,
  evaluateApproach,
  coachFit,
  narrativeContext,
  valuePlayer,
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

type Handler = (body: any) => unknown;

/** POST route table — every game transition is a pure engine call. */
const routes: Record<string, Handler> = {
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

  // Who would buy one of YOUR players, and for how much. Powers "sell" in the UI.
  '/games/offers': ({ state, playerId }) => {
    const s = state as GameState;
    const p = s.players[playerId];
    if (!p || p.club !== s.playerClub) return { offers: [] };
    const value = valuePlayer(p, currentYear(s));
    const offers = Object.values(s.clubs)
      .filter((c) => c.id !== s.playerClub && c.leagueId !== null && c.finances.transferBudget >= value * 0.7)
      .map((c) => {
        // Fee scales with the buyer's ambition/prestige; a keener club bids over the odds.
        const factor = 0.8 + (c.prestige / 100) * 0.5;
        return { clubId: c.id, clubName: c.name, fee: Math.round(Math.min(c.finances.transferBudget, value * factor)) };
      })
      .sort((a, b) => b.fee - a.fee)
      .slice(0, 4);
    return { offers, marketValue: Math.round(value) };
  },

  // Sell one of your players to a named buyer (accept an offer).
  '/games/sell': ({ state, playerId, toClub, fee }) => {
    const s = state as GameState;
    const p = s.players[playerId];
    if (!p || p.club !== s.playerClub) return { state: s, view: buildView(s), result: { ok: false, reason: 'Not your player.' } };
    const price = fee !== undefined ? Math.round(fee) : Math.round(valuePlayer(p, currentYear(s)));
    const result = executeTransfer(s, { playerId, toClub: toClub as string, fee: price });
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

  // Rich structured "current situation" for the narrator (the app's language
  // model turns this into prose — a briefing, a matchday report, an answer to
  // "how's the dressing room?"). Facts only; no prose.
  '/games/situation': ({ state }) => ({ situation: narrativeContext(state as GameState) }),
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
    if (req.method === 'GET' && getRoutes[path]) {
      send(res, 200, getRoutes[path]!());
      return;
    }
    if (req.method === 'POST' && routes[path]) {
      const body = await readBody(req);
      send(res, 200, routes[path]!(body));
      return;
    }
    send(res, 404, { error: `No route ${req.method} ${path}` });
  } catch (err) {
    send(res, 400, { error: err instanceof Error ? err.message : String(err) });
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`The Director engine API listening on :${PORT} (CORS: ${ALLOW_ORIGIN})`);
});
