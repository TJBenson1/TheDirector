# @director/api — the engine API (the app's backend)

A zero-dependency HTTP wrapper over the pure `@director/engine`. The engine is
the single source of truth; this service just exposes its transitions over
HTTP so a frontend (e.g. the Lovable app) can drive a game without
reimplementing any game logic.

**Pull-through:** the frontend renders the `view` this API returns — including
generic `events[]` and `decisions[]` arrays. When the engine changes here (new
coach behaviour, new decisions, new events), redeploy this service and the app
reflects it with no frontend change.

## Run

```bash
pnpm --filter @director/api start      # PORT=8787 by default
pnpm --filter @director/api dev        # watch mode
```

Env:
- `PORT` — listen port (default `8787`)
- `CORS_ORIGIN` — allowed origin (default `*`; set to your app origin in prod)

## Statelessness

Every transition is a pure function: the client sends the current `state` blob,
the server returns the new `state` + a UI `view`. The client persists `state`
(localStorage / Supabase). No server-side game storage — swap in persistence
later without changing the client contract.

## Contract

All bodies are JSON. Every mutating response returns `{ state, view, ... }`.

| Method | Path | Body | Returns |
| ------ | ---- | ---- | ------- |
| GET  | `/health` | — | `{ ok }` |
| GET  | `/scenarios` | — | `[{ id, name, startDate, playerClub, mandate }]` |
| POST | `/games` | `{ scenarioId, seed? }` | `{ state, view }` |
| POST | `/games/advance` | `{ state, perStep? }` | `{ state, view, events }` |
| POST | `/games/decision` | `{ state, decisionId, choiceId }` | `{ state, view, events, success }` |
| POST | `/games/sign` | `{ state, playerId, feeM? }` | `{ state, view, result }` |
| POST | `/games/scout` | `{ state, playerId }` | `{ report, value }` |
| POST | `/games/view` | `{ state }` | `{ view }` |

### `view` shape

```ts
{
  meta:  { scenarioId, date, year, windowLabel, windowStep, windowSteps, stepLabel },
  club:  { id, name, strength },
  board: { mandate, patience, expectedFinish, warnings, dismissed },
  coach: { identity, archetype, relationship, preferredFormation, activeFormation, style },
  finances: { transferBudget, wageBill },
  table:  [{ pos, clubId, name, played, won, drawn, lost, goalsFor, goalsAgainst, points, isUser }],
  squad:  [{ id, name, positions, age, ability, potential, morale, fitness, contractUntil, injured }],
  decisions: Decision[],     // engine shape — render generically
  events:    LoggedEvent[],  // most-recent first — render generically
}
```

`Decision` = `{ id, title, description, interrupt, clubId?, category?, choices: [{ id, label, successProbability? }] }`.
`LoggedEvent` = `{ seq, date, category, code, message, data? }`.

## Deploy

Any Node host (Render, Railway, Fly.io, a VPS). Build with `pnpm -r build` and
run `node apps/api/dist/server.js`, or run `tsx src/server.ts` directly. Point
the frontend's `VITE_ENGINE_API_URL` at the deployed URL and set `CORS_ORIGIN`
to the app's origin.
