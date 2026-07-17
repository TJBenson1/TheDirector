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

## Integration — run the engine, don't call a server

The engine (`@director/engine`) is a **pure, deterministic, browser-safe TypeScript
package**: no I/O, no clock, no randomness outside a seeded RNG. Every function is a
pure transform over a **fully serialisable `GameState`**. Two ways to wire it up —
both project the *same* `GameState`, so build the views once:

- **Client-side (recommended for Lovable).** Import the engine directly and run the
  whole game in the browser — no backend at all. Persist with `saveGame(state)` →
  JSON string (to `localStorage` or Supabase) and `loadGame(json)` → `GameState`.
  The REST rows above map 1:1 to function calls:

  ```ts
  import {
    createNewGame, advanceWindow, applyDecision, saveGame, loadGame,
    SCENARIOS, getScenario, suggestTargets, scoutPlayer, medicalCheck, queryPlayer,
  } from '@director/engine';

  let state = createNewGame({ scenarioId: 'man-utd-1999' /*, seed, settings */ });
  // resolve a pending decision:
  state = applyDecision(state, decision.id, choice.id).state;
  // advance time (interactive: unfold sub-steps, pausing on interrupts):
  const { state: next, events } = advanceWindow(state, { pausePerStep: true });
  state = next;                       // render it
  // events: LoggedEvent[] that just happened → the feed
  ```

  Because determinism holds, a save is just the JSON; reloading and advancing is
  bit-identical to never having stopped.

- **Server-backed.** If you'd rather hold state server-side, wrap those same calls
  behind the REST contract above (a thin handler per row). Nothing else changes.

`createNewGame` / `advanceWindow` also generate fixtures for Storybook/tests.

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

## Start points (scenario select)

`SCENARIOS` is a registry of **27 curated start points** (1995–2014), e.g.
`man-utd-1999` "After the Treble", `chelsea-2003` "The Roman Empire",
`barcelona-2014` "Peak — Don't Waste It", `dortmund-2012` "Hold the Wall". Build a
picker from it — each `ScenarioSeed` carries `id`, `name`, `playerClub`, `startDate`,
`mandate`, and `boardExpectedFinish`. `DEFAULT_SCENARIO_ID` is `man-utd-1999`.

```ts
Object.values(SCENARIOS).map(s => ({ id: s.id, name: s.name, mandate: s.mandate }));
```

## Event vocabulary (the feed)

The feed is `eventLog: LoggedEvent[]` — key off `event.code` (+ `event.category`,
`event.data`) to group and style. A career surfaces these families; render them,
don't invent them:

- **Real history playing out** — `scripted.fired` (a historical beat, e.g. the
  Keane contract, the Glazer takeover), `ledger.executed` / `nearmiss.signed` (a
  real transfer happens), `academy.graduate` (a real youth debut), `career.retired`.
- **The story follows the man** — `personal.fired` (at your club, interactive) /
  `personal.world` (a marquee personal storyline that travels with a player wherever
  the counterfactual sent him — "Rio still misses his drug test at Arsenal").
- **The world diverges as you reshape it** — `divergence.displaced` (a giant comes
  for a star you relocated), `divergence.suitor`, `divergence.storyline`,
  `divergence.contract`, `ambition.override` (a rival makes an off-script statement
  signing), and **`reality.thwarted-signing` / `reality.thwarted-trophy`** (a club
  you denied a signing or a title is stung into clawing back).
- **Macro world events** — `macro.world` / `macro.fired` (era-defining moments that
  fire regardless of club: **Covid 2020, the Super League 2021, City's financial
  charges 2023**), `ffp.constrained` (a benefactor's blank cheque is curbed),
  `points.deducted`, `league.promoted-in-place`.
- **Club & squad life** — `injury.serious` / `injury.recurrence`, `scandal.fired`,
  `decline.*`, `development.unlocked` / `development.busted`, `raid.suffered`,
  `poach.*`, `club.distress`.
- **Board & dugout** — `board.warning` / `board.sacked`, `internal.crisis`,
  `manager.pressure` / `manager.appointed` / `manager.departed`, `directive.*`.

`pendingDecisions` is the *now* (interrupts to resolve); the codes above are the
*record* of what happened (the feed). Both come off the same `GameState`.

## Keeping the front-end and the engine in sync

The engine **is** the contract — `@director/engine` exports `GameState`, every type,
and the pure functions above. Keep them from drifting apart:

1. **Depend on a pinned version.** Consume `@director/engine` as a versioned package
   (npm private or a git tag). The front-end updates deliberately, never silently.
2. **Let TypeScript be the drift detector.** Because you import the engine's *types*
   (`GameState`, `Decision`, `PlayerState`, …), any breaking change to a shape the UI
   binds to **fails the front-end's `tsc` build**. Keep `index.ts` as the curated
   public surface — if it's not exported there, don't rely on it.
3. **The save format is versioned.** `state.meta.version` stamps every game;
   `loadGame` rejects a payload without it. Bump it on a breaking `GameState` change
   and migrate (or invalidate) old saves — so a stale save never renders wrong.
4. **A public-API contract test guards the surface** (`packages/engine/src/public-api.test.ts`):
   it asserts the front-end-critical exports exist, that `GameState` still has its
   top-level keys, and that it round-trips through `saveGame`/`loadGame`. Removing or
   renaming any of them fails CI **before** you publish.
5. **The engine's own gates protect behaviour.** `pnpm vitest` (incl. the
   27-scenario invariant + determinism suite) and `pnpm harness` (the calibration
   run) must stay green on every engine change; the front-end can trust that a new
   version is behaviourally sound, not just type-compatible.

**Workflow when you change the engine:** edit → `vitest` + `harness` green → bump the
version → publish → front-end bumps the dependency; `tsc` + its own tests flag any
integration break. That's the whole loop — the types catch shape drift, the contract
test catches surface drift, the harness catches behaviour drift.
