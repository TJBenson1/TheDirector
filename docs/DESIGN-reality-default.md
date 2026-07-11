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
