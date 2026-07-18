# @director/api — the engine API + hosted narrator (the shareable game)

## The hosted game (one URL, anyone can play)

This service also **is** the game: it serves a chat website at `/` and runs the
Claude narration server-side, so anyone plays with just a browser — no Claude
subscription, no MCP connector.

- `GET /` — the chat website.
- `POST /games/narrate` `{ state, message, history }` → `{ narration, state, situation, history }`.
  Runs one Director turn: the model reads the message + state, calls the engine
  tools (`ops.ts`), and narrates the result. The engine owns every fact.

**Required env for narration:** `ANTHROPIC_API_KEY` (the host's key — this is what
lets users play without their own). Optional: `NARRATE_MODEL` (default
`claude-sonnet-5`). Deploy exactly like below and add `ANTHROPIC_API_KEY`; the
play URL is just the service root.

---


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
| POST | `/games/targets` | `{ state, position, maxPrice? }` | `{ targets }` (each has `positions`, `coach`) |
| POST | `/games/find` | `{ state, query }` | `{ found, target? }` — name a dream target (even unraidable ones) |
| POST | `/games/sign` | `{ state, playerId, feeM? }` | `{ state, view, result }` |
| POST | `/games/offers` | `{ state, playerId }` | `{ offers: [{ clubId, clubName, fee }], marketValue }` |
| POST | `/games/sell` | `{ state, playerId, toClub, fee }` | `{ state, view, result }` |
| POST | `/games/renew` | `{ state, playerId, years }` | `{ state, view, result }` — years 1–5 |
| POST | `/games/scout` | `{ state, playerId }` | `{ report, value }` |
| POST | `/games/view` | `{ state }` | `{ view }` |

- `targets[]` / `find.target` carry `positions` (the player's ACTUAL positions —
  render them so a striker found under an LW search reads "Lewandowski (ST)").
  Targets are sorted natural-position-first.
- `askingPrice` and `fee`/`marketValue` are in **pounds** (e.g. `30800000` = £30.8m)
  — divide by 1e6 for display, don't append "m" to the raw number.
- `ability`/`potential` on a target are fogged **ranges** `{ low, high }` (or a
  `confidence`) — render as "82–90", not a single number.
- **Sell flow:** `/games/offers` lists who'll buy one of your players and for how
  much; `/games/sell` accepts a chosen offer. **Renew:** `/games/renew` extends a
  contract by 1–5 years (not just 3).

### Transfers (market screen)

`/games/targets` powers the market: pass a `position` (`GK|CB|LB|RB|DM|CM|AM|LW|RW|ST`)
and it returns real, era-appropriate, scouting-fogged targets — never filler.
Each entry:

```ts
{
  playerId, name, club, clubName, age,
  ability, potential, confidence,   // fogged ranges (fog of war)
  askingPrice, tags,                // e.g. "bosman", "fire-sale", "unsettled"
  willing, resistanceReason,        // §6 player agency — may refuse regardless of fee
  coach: { verdict, score, reason } // M13 head-coach read: wants | fine | reluctant | veto
}
```

To sign: `POST /games/sign { state, playerId, feeM }`. The result may be a refusal
(player unwilling, unaffordable, or filler) — surface `result.reason`. A completed
signing returns the updated `state`/`view`; the coach's reaction is in the feed.

### `view` shape

```ts
{
  meta:  { scenarioId, date, year, windowLabel, windowStep, windowSteps, stepLabel },
  club:  { id, name, strength },
  board: { mandate, patience, expectedFinish, warnings, dismissed },
  coach: { identity, archetype, relationship, preferredFormation, activeFormation, style },
  finances: { transferBudget, wageBill },
  table:  [{ pos, clubId, name, played, won, drawn, lost, goalsFor, goalsAgainst, points, isUser }],
  squad:  [{ id, name, positions, age, ability, potential, morale, fitness, contractUntil, injured, wageWeekly, wageAnnual }],
  decisions: Decision[],     // engine shape — render generically
  events:    LoggedEvent[],  // most-recent first — render generically; ALREADY filtered of filler noise
}
```

**Wages:** render `wageWeekly` (£/week). `wageAnnual` is the same figure ×52 —
do not label the annual number as weekly.

**Feed:** `events` is already filtered server-side to drop procedural squad-filler
noise. Render `event.message` verbatim — never invent or embellish narrative the
engine did not produce (there is no "manager heart attack" unless an engine event
says so).

`Decision` = `{ id, title, description, interrupt, clubId?, category?, choices: [{ id, label, successProbability? }] }`.
`LoggedEvent` = `{ seq, date, category, code, message, data? }`.

## Deploy

Any Node host (Render, Railway, Fly.io, a VPS). Build with `pnpm -r build` and
run `node apps/api/dist/server.js`, or run `tsx src/server.ts` directly. Point
the frontend's `VITE_ENGINE_API_URL` at the deployed URL and set `CORS_ORIGIN`
to the app's origin.
