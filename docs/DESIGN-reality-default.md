# DESIGN — Reality is the default timeline (binding)

> **Status: binding architecture.** These two principles supersede any
> conflicting reading of the build spec (notably a *pure* needs-based Rival AI,
> §9a, and procedural academy generation, §9e). All work from M5 onward is built
> against this document. Applied 2026-07 during M4→M5.

## Principle 1 — Reality is the default timeline

Non-player-affected squads must broadly mirror real history. Real Madrid should
have Modrić, Kroos, Marcelo, Pepe, Khedira etc. arriving in their real windows
unless something *in-game* logically prevented it.

**Mechanism:**

- Each era data pack ships a **`realTransferLedger`**: every significant real
  transfer (fee, window, buyer, seller) for the 12 playable clubs + all major
  European clubs.
- Each window, AI clubs **execute their real transfers by default.** Autonomous
  Rival-AI decision-making (§9a needs analysis) activates **only when a ledger
  entry is invalidated.**
- **Invalidation conditions (exhaustive):**
  1. the user signed the target first, or owns the selling club's player;
  2. a prior user action broke the chain (e.g. the target's club no longer needs
     to sell);
  3. an upstream butterfly — a previously logged divergence — removed the move's
     premise.
- **Butterflies are explicit, traceable chains, never free-form.** Every link is
  written to `GameState.timeline.divergenceLog` with its cause. Example: user's
  Chelsea buys De Jong → City's real DM signing invalidated → City pursues a
  profile-similar alternative (Khedira) → Madrid's real Khedira signing now
  invalidated → Madrid falls back per hierarchy. Each arrow is one logged entry.
- **Fallback hierarchy when a real transfer is invalidated** (record which tier
  fired):
  1. the club's known real-world backup/alternative target, if in the data;
  2. the closest **profile-similar** available player (position, age band,
     ability band, price band);
  3. generic needs-based AI.
- The §9a counter-punch / poaching behaviours remain — but as a **response layer
  triggered by user aggression, sitting on top of the reality baseline**, never
  replacing it.

**New calibration targets (harness, §12):** in a zero-divergence run (user makes
no signings/sales), ≥90% of ledger transfers among tracked clubs must execute as
in reality, and end-of-era squads at the 12 playable clubs must materially match
their real counterparts. *A build where 2012 Madrid doesn't broadly look like
real 2012 Madrid, absent user interference, is a failing build.*

## Principle 2 — Academy & prospects: real players only

- Academy intakes come from **`academyIntakes[clubId][year]`**: real historical
  youth graduates, surfaced at age 17–18, ≥3/year (pad thin vintages with the
  club's real lesser-known youth-teamers of that year). Their in-game fate is
  decided by the contextual development engine (§5) — the real career is
  calibration, never a script.
- **Generational talents at other clubs** enter the database at 16 and must
  **reliably appear on scout reports between ages 16–18.** Scouting-network
  quality affects how early in that band, and report precision — never *whether*
  they surface.
- **Procedurally generated players** are permitted ONLY as anonymous,
  ability-capped squad **depth at non-playable clubs**, flagged
  `procedural` (in this codebase: `curated === false`), and **excluded from
  prospect scouting, academy intakes, and all narrative events.** No invented
  name may ever become part of the story.

## Amendment A — Ambition overrides (reality can be superseded, with cause)

Reality stays the default (~80–90% of AI transfer activity executes the real
ledger). Alongside invalidation-triggered butterflies, a **second legitimate
trigger** exists: **pressure-driven ambition overrides.**

- Each AI club tracks a **`pressure`** state: trophy drought vs. expectations,
  manager job security, fan/board unrest, a rival's dominance, financial
  windfalls.
- When pressure crosses a threshold, the club may **deviate from its real ledger
  with an ambitious, logical move** — e.g. a still-trophyless 2006 Chelsea bids
  aggressively for Kaká/Ronaldinho (never signed in reality, but plausible in
  that state); an Arsenal that lost Pirès to the user moves *earlier* for
  Duff/Kewell.
- **Plausibility gate (all must hold):** the target fits the club's need,
  profile, budget/wage reality and prestige pull, AND respects the target's
  transfer-resistance profile (§6). **Zero overrides may breach a hard block.**
- Overrides are logged to `divergenceLog` with the pressure cause, and then
  ripple through the standard butterfly chain (whoever loses that player falls
  back per the hierarchy).
- **This is why suppressing a rival is risky:** gutting Arsenal *raises* their
  pressure, making them *more* likely to do something ambitious and
  unpredictable — the "rivals react better" realism, emergent from one mechanic.

**Calibration (harness):** in a zero-user-divergence run, ledger fidelity stays
**≥85%**; ambition overrides are **~10–15%** of significant AI transfers across a
decade, concentrated at high-pressure clubs; **>~20% overrides is a failing
build**; hard-block breaches must be **0**.

## Amendment B — Non-playable clubs are full narrative participants

The world is not "12 clubs + fog." Clubs like Atlético, Dortmund, Valencia,
Porto, Newcastle, Deportivo, Leeds, Sevilla, Lyon, Ajax, PSV, Benfica, Roma,
Napoli, Marseille, Monaco must exist as simulated actors:

- Real squads (curated key players + capped procedural depth), real managers
  where notable, and their real ledger entries.
- Full participation in league tables, European competitions and the event
  system — real financial crises (Leeds, Valencia, Deportivo's decline),
  golden generations (Porto '04, Deportivo '00–'04, Dortmund '11–'13),
  fire-sales — all creating the buy/sell opportunities the player interacts with.
- They buy, sell, develop and lose players via the same reality-default +
  butterfly + (rarer) ambition-override machinery — a non-playable club can
  hijack your target or refuse to sell you its captain.

**Tiering (performance only, never narrative):**
- **Tier 1** — the 12 playable clubs: full simulation.
- **Tier 2** — ~30–40 significant clubs: full transfer/event/squad simulation,
  not playable. **Narratively indistinguishable** from Tier 1 (scout reports,
  negotiations, events, butterflies all treat them as real actors).
- **Tier 3** — results-level simulation only.

The **Tier 2 roster is per-era data** — which clubs matter shifts across
1995–2025 (Leeds/Deportivo early; Dortmund/Atlético late). `ClubState.tier`
carries the tier; the roster lives in the era pack.

## Current state vs. this design (honest gaps)

| Area | Now (M4) | Target |
|---|---|---|
| Transfer mechanism (`executeTransfer`) | ✅ correct primitive | unchanged — ledger execution & user actions both call it |
| Rival AI | not built | M8: ledger-default + invalidation + fallback + §9a response layer |
| Playable-club squads | only Man Utd 1999 curated; other 11 procedural | **data work**: real squads for all 12 across eras (M10 curation) |
| `realTransferLedger` / `academyIntakes` | type seams defined (`ledger.ts`), data empty | populated as era-pack data (M8/M9) |
| Procedural flag + exclusion rule | flag present (`curated`), rule documented | enforced when scouting (M5) / academy (M9) / narrative land |
| Reality-fidelity calibration targets | added to harness, **pending (M8)** | active once the ledger system lands |

The engine already supports real squads at every club via `CURATED_SQUADS`; the
gap is data, not architecture. No built module needs rework.
