# THE DIRECTOR — Front-end handoff (Lovable)

This is your contract. The API and the six views below are deliberately written
so you can build the entire front end **without understanding the engine**. You
render `GameState`; the engine decides outcomes. Treat `GameState` as the single
source of truth — every screen is a projection of it.

> Source of truth for types: [`packages/engine/src/types.ts`](../packages/engine/src/types.ts).
> The `GameState` interface there is exactly what every endpoint returns.

## API contract (§16)

```
POST /game/new            { scenarioId, settings, seed? }        → GameState
GET  /game/:id/state                                              → GameState
GET  /game/:id/decisions                                          → Decision[]   // pending, incl. interrupts
POST /game/:id/decision   { decisionId, choiceId, params? }       → GameState + LoggedEvent[]
POST /game/:id/advance                                            → GameState + LoggedEvent[]  // steps months until next interrupt or window
GET  /game/:id/log        { since? }                              → LoggedEvent[]
GET  /game/:id/narrative  { since? }                              → NarrativeBlock[]  // optional LLM layer
```

**How a turn flows:**
1. `POST /game/new` → get a `GameState`. Render the **Window check-in**.
2. Player resolves pending decisions: `POST /game/:id/decision` for each.
3. `POST /game/:id/advance` → the engine steps months under the hood and returns
   control the moment a decision window opens **or** an interrupt fires (an
   emergency mid-window — an injury crisis, a hijack opportunity). The response
   carries the new `GameState` + the `LoggedEvent[]` that happened in between.
4. If `GameState.pendingDecisions` is non-empty after an advance, it's an
   **interrupt** — surface it immediately (a March ACL is a March problem).

**Key rendering facts:**
- `GameState.clock` gives `date` (`YYYY-MM`), `window` (`summer|winter|null`),
  and `monthIndex` (0 = July … 11 = June).
- `GameState.pendingDecisions: Decision[]` is what the UI must surface **now**.
  Each `Decision` has `interrupt: boolean` and `choices[]`; each choice may carry
  a `successProbability` (0..1) — **show the risk framing, never hide it**.
- `GameState.eventLog: LoggedEvent[]` is the append-only audit trail. `seq` is a
  monotonic ordering key; poll `GET /log?since=<lastSeq>` for deltas.
- The user **never** sees raw `ability`/`potentialCeiling`. Scouting/medicals
  return ranges with confidence and risk grades (M5+). Bind to those fields, not
  to hidden truth.

> **Status:** the `/api` package is hardened at M10; until then the endpoints are
> a stable contract you can mock against. The `GameState` shape is already real —
> `packages/engine` produces it today. You can generate fixtures by importing
> `createNewGame` / `advanceWindow` from `@director/engine`.

## The six views (all render from `GameState`)

1. **Window check-in** — the advisor briefing: league table, the events since last
   window (`LoggedEvent[]`), rival moves, budget/wages. The landing screen each turn.
2. **Decision cards** — event choices with **visible risk/probability framing**
   (`choice.successProbability`). Outcomes are uncertain; mediation can fail.
3. **Squad screen** — audit-table style: age, impact, happiness, value, wage —
   as the user played it. (Fields populate M3/M4.)
4. **Tracking board** — targets, contingencies, tracked prospects, looming events.
5. **Transfer/negotiation flow** — scout reports with confidence ranges, medical
   risk grades, resistance verdicts ("He will not leave Barcelona. This is not
   about money."). Use `suggestTargets(state, position)` for realistic ranked
   options per position (tagged `bosman` / `unsettled` / `fire-sale` /
   `relegation-threatened`, with fogged ability ranges and asking prices), and
   `queryPlayer(state, nameOrId)` to look up any specific real player — subject
   to the 16+ rule (under-16s are "not yet on the radar"). Distressed clubs
   (Leeds, Lazio) and relegated sides sell cheaply.
6. **Timeline / divergence view** — what you changed vs. real history
   (`GameState.timeline.divergenceLog`).

## Difficulty & modes (§13)

`GameState.settings` carries the sliders (`injuryFrequency`, `scandalFrequency`,
`rivalAggression`, `worldDefiance`, `starTemptation`, `varianceLuck`,
`scoutingFog`) plus `ironman` and `narration`. Surface them on a new-game screen;
defaults are the calibrated realism bands.

## Narration on/off

Every screen must be fully usable with narration **off** (raw structured output).
The `/narrative` endpoint is an optional prose layer over the same events — it
never introduces information that isn't already in the log.
