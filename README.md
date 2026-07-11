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
apps/
  web        ← Lovable front end (consumes /api). See docs/LOVABLE.md
```

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
| M6 — Agency | ⏳ Next | Resistance profiles, hard blocks (Messi rule), willingness maths, two-sided poaching (§6). |
| M7–M10 | ◻ | Events, rival AI (reality-default + ambition overrides), manager/academy/board, full calibration. |

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
