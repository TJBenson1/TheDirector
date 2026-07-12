# THE DIRECTOR

A counterfactual football management simulation (1995–2025). Turn-based,
text-driven, engine-first. You are Director of Football at one of 12 elite
clubs, entering at a curated historical scenario, making transfer/contract/
strategy calls while a reactive, adversarial world pushes back.

> **Prime directive: realism. The world pushes back.** Success is earned, adversity
> is real, and history is a starting point — not a script. See the build spec.

## Architecture

```
packages/
  engine     ← pure, deterministic, zero UI deps. All game logic.
  data       ← versioned JSON data packs (M3+)
  narrative  ← optional LLM narration layer (M10)
  api        ← thin HTTP layer exposing the engine (§16, M10)
  harness    ← Monte Carlo calibration harness (CI realism gate, §12)
             + the Historian realism-review layer (LLM plausibility audit)
apps/
  web        ← Lovable front end (consumes /api). See docs/LOVABLE.md
```

> **Two-part realism gate.** The deterministic Monte Carlo harness *asserts
> statistics*; the **[Historian](docs/DESIGN-historian.md)** — an LLM reviewer
> expert in football history 1995–2025 — *judges plausibility* of sampled
> divergences, career arcs and data packs. Code asserts; the Historian judges.
> It is a review layer only (`packages/harness/src/historian`), runs post-hoc,
> and never touches gameplay. `pnpm historian` (skips cleanly without an API
> key). See [`docs/DESIGN-historian.md`](docs/DESIGN-historian.md).

**Engineering rules (non-negotiable):**
1. Engine is **pure functions** over a serialisable `GameState`. No I/O, no clocks,
   no randomness outside the seeded RNG.
2. **Seeded deterministic RNG.** Same seed + same decisions = identical game.
   Every roll is logged to an append-only `eventLog`.
3. **Data over code.** Players/clubs/events/scenarios are versioned JSON.
4. **Test-first via the harness.** The Monte Carlo harness asserts the §12
   calibration targets in CI. Realism is measured, not vibes.

## Getting started

```bash
pnpm install
pnpm typecheck        # all packages
pnpm test             # unit + property tests (determinism gate)
pnpm harness -- --careers=500 --years=15   # full Monte Carlo pass
pnpm ci               # typecheck + test + harness (what CI runs)
```

## Milestone status

Built incrementally, one milestone at a time (see §17 of the build spec).

| Milestone | Status | Summary |
|---|---|---|
| **M1 — Skeleton** | ✅ Done | Monorepo, `GameState` (§2), seeded RNG + fork streams, append-only event log, two-clock `WorldClock` (§3), save/load + stable hashing, harness scaffold running real headless careers. |
| **M2 — Season sim** | ✅ Done | Abstracted monthly match model (strength + form + variance → Poisson goals), deterministic double round-robin, league tables + title history (§15). Calibrated to a sane 1999–2000 Premier League (Man Utd champions, real ordering). The §12 dynasty metric is now *measured* (still pending M9 to come into band). |
| **M3 — Players & market** | ✅ Done | Full player records (§4, hidden ability/potential/personality), curated Man Utd 1999 squad + procedural filler (~673 players/world), squad-derived-but-anchored strength, finances + market inflation (§11), transfers with budget invariants (§18). |
| **M4 — Player state + harness live** | ✅ Done | Player state (fitness, morale, form, injury), calibrated injuries (§9c), ageing/decline with sudden-collapse rolls. **Two §12 calibration targets now active and gating CI**: user injury-crisis-per-decade (≥90%) and league-wide serious-injury rate (~1–2/squad-season). |
| **M5 — Development + scouting** | ✅ Done | Contextual development (§5) — minutes-at-level/coaching/professionalism/injuries drive growth; benched wonderkids plateau (working ceiling erodes). Lifestyle decline (Ronaldinho pattern). Fog-of-war scouting (§7): confidence ranges, medicals with false-clean, real-only prospect discovery. **Third §12 target now active**: benched wonderkids reaching ceiling <15% (~0%). |
| **M6 — Agency + friction** | ✅ Done | Resistance profiles, willingness maths, hard blocks (Messi rule — Shearer/Le Tissier/Maldini exemplars), rivalry resistance, poaching maths (§6). Dynamic valuation, league-style model, adaptation engine, per-player season stats (context/friction §1,§3,§4). Prospect hit-rate recalibrated to 40–60%. **Six §12 targets now gating CI.** |
| **M7 — Event engine** | ✅ Done | GameEvent/Consequence schema, `applyDecision` with uncertain outcomes (mediation can fail), procedural scandals (§9d), Man Utd 1999 scripted pack (Keane contract, Stam exit, Beckham boot), interrupts pausing the sim mid-window (§3), narrative memory (§10). **Eight §12 targets now gating CI** (added user-scandal ≥80%, scripted-event fidelity ≥95%). |
| **M8 — Rival AI (reactive)** | ✅ Done | Reactive response layer (§9a): counter-punch when raided, poaching of the user's stars, grudge memory, rubber-band (worldDefiance). **Poaching is gated on user aggression** — a passive user doesn't provoke it, so reality/scripted history holds (reality-default). **Ten §12 targets now gating CI** (added rival counter-punch ≥70%, star-retention departure ~30%). |
| **M9 — Internal friction** | ✅ Done | Divergence drift (§9f): non-real storylines rise with user aggression × elapsed time (passive user preserves reality). Board mandate/patience → warnings → dismissal (the player can lose the job). Imposed internal crises (financial shocks, board-ordered sales, manager unrest, dressing-room rifts). **Twelve §12 targets now gating CI** (added player-sackable, internal-crisis cadence). |
| **M10 — Reality-ledger (in progress)** | 🟡 | Reality-ledger execution: real transfers execute by default (Anelka→Madrid, Crespo→Chelsea, Owen→Madrid…) so a passive world matches history; user interference invalidates entries → logged butterflies + fallback hierarchy (§9f). **Fourteen §12 targets now gating CI** (added ledger-fidelity 100%, squad-match). Remaining: fuller ledger data, ambition overrides, academy, API/narrative, difficulty sliders. |

Three binding design docs shape M7–M10:
[reality-default](docs/DESIGN-reality-default.md),
[context & friction](docs/DESIGN-context-and-friction.md),
[internal friction](docs/DESIGN-internal-friction.md).

The **Monte Carlo harness runs from M1** and its §12 target table is fully
defined; each target activates (and starts gating CI) as the milestone that
produces its behaviour lands. Injury targets went live at **M4**.

> **Binding architecture:** [`docs/DESIGN-reality-default.md`](docs/DESIGN-reality-default.md)
> — AI clubs follow the *real* timeline by default (execute real transfers unless
> a user action invalidates them, with traceable butterfly chains), and academy/
> prospect players are *real players only*. Two reality-fidelity calibration
> targets are tracked (pending until the Rival AI lands in M8).

## Determinism

Every game carries a `seed` and a serialised RNG cursor inside `GameState`.
`advanceWindow(state) → { state, events }` is pure. Save → load → continue is
bit-identical to an uninterrupted run — enforced by property tests
(`packages/engine/src/state.test.ts`) and the harness.

## For the front end (Lovable)

Point Lovable at [`docs/LOVABLE.md`](docs/LOVABLE.md) — it reproduces the §16
API contract and the six views. The front end renders directly from
`GameState` and never needs to understand the engine.
