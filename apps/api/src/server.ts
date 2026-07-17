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
  attemptSigning,
  scoutPlayer,
  valuePlayer,
  currentYear,
  Rng,
  SCENARIOS,
  type GameState,
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

  '/games/scout': ({ state, playerId }) => {
    const s = state as GameState;
    const rng = new Rng(s.meta.rngState).fork(`scout:web:${playerId}`);
    const report = scoutPlayer(s, s.playerClub, playerId, rng, { observation: 0.6 });
    const p = s.players[playerId];
    const value = p ? valuePlayer(p, currentYear(s)) : 0;
    return { report, value };
  },

  '/games/view': ({ state }) => ({ view: buildView(state as GameState) }),
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
