# DESIGN — M8: AI club ambition & the "money still talks" constraint

> **Status: SHIPPED (2026-07).**
> - **Increment 1 (measurement)** — activated money-club-title-share (92.2%, band
>   ≥50%) and no-fantasy-leaps (0, band 0) on the untouched sim, byte-identical.
> - **Increment 2 (the ambition-override mechanic)** — the first
>   calibration-perturbing build of the project. Club pressure now drives at most
>   one plausibility-gated, ceiling-guarded statement signing per summer.
>   Overrides land at **9.4%** of significant AI transfers (band ~10–15%, fail
>   >20%); every other active band held (fantasy leaps 0, squad-match 97.7%,
>   ledger fidelity 100%). **All 17 active targets pass; determinism intact.**

M8 is the milestone that makes the *rest of the world* an economic actor. Today
AI clubs only move players two ways: they execute the real transfer ledger, and
they run a reactive response layer (counter-punch a raid, poach an agitating
star). Nothing lets a rival get *ambitious* — spend its money to chase a target
reality never gave it — and nothing measures whether the wealthy clubs actually
win, or whether a mid-table side has fluked its way somewhere it shouldn't.

Three calibration targets have sat `active: false`, "awaiting M8", since the
harness was written:

| Target | Band | Reads |
|---|---|---|
| Ambition overrides as a share of significant AI transfers | ~10–15% (fail >20%) | `ambitionOverrides / significantAiTransfers` |
| Title share won by big-money clubs ("money still talks") | clear majority (≥50%) | `moneyClubTitles / leagueTitlesTotal` |
| Clubs exceeding their plausible ceiling without cause | 0 (hard) | `fantasyLeaps` |

All five underlying metric fields are zero-initialised and **never written** —
`emptyCareerMetrics` sets them to 0 and no code increments them. The types
`ClubPressure` and `AmbitionOverride` exist in `ledger.ts` but are pure stubs:
no producer, no consumer, no `ambition.override` event ever emitted (the
Historian sampler already *listens* for one — `sampler.ts:130` — so the wiring
seam is in place). M8 fills all of this in.

The three targets are the three faces of one principle from
`DESIGN-internal-friction.md` — **"a healthy dose of reality" (the governing
constraint that overrides everything):**

- **Money still talks, correctly** (title-share target) — big spenders win in the
  large majority; blunting money into repeated failure is as unrealistic as the
  player never failing.
- **Suppressed rivals fight harder, not worse** (ambition-override target) —
  losing a target to the user *raises* a club's pressure and makes it do
  something ambitious; that's the emergent "rivals react" realism.
- **No fantasy leaps** (ceiling target) — no club exceeds its plausible ceiling
  without a long, logged, multi-cause chain. Spurs don't win the European Cup in
  2004 because a few transfers fell through.

This document scopes the mechanic and — because M8 is the **first build that
deliberately perturbs the calibrated `man-utd-1999` world** — its calibration
plan in detail.

---

## 1. The pieces, and where they hang

### 1.1 Big-money designation (`isMoneyClub`)

There is no "money club" flag today; the metric comment names them informally
("Chelsea/City/Madrid"). We derive the set rather than hand-list it, so it works
across every era world:

```
isMoneyClub(club) =  club.finances.ownership === 'sugar-daddy'
                  || club.prestige >= MONEY_PRESTIGE   // wealth proxy (≈ 80)
```

Ownership is already era-encoded (`scenario.ownership`, e.g. 2004 Chelsea =
`sugar-daddy`), and prestige already carries the moneyed-era signal (Man City
60→85 across eras). A realised funder (`state.meta.realizedLedger` includes
`abramovich` after the takeover fires) flips Chelsea into the set exactly when
the money arrives. This keeps the designation *inside the existing economic
model* — no new authored list to drift out of date.

This is a **pure read** — it changes no simulation.

### 1.2 Plausible ceiling (`plausibleCeiling`)

Every club is anchored to an authored `baseStrength` (the M2 calibration
baseline). A club may legitimately climb above it — real ledger buys, academy
graduations, an unlocked lost talent, an ambition override (below) — but only so
far, and only *with* those causes logged. We define:

```
plausibleCeiling(club) = club.baseStrength + CEILING_MARGIN     // ≈ +8
```

A **fantasy leap** is a club whose live `strength` exceeds its
`plausibleCeiling` at era end without a logged multi-cause chain. In a
zero-divergence run the sim anchors strength to `baseStrength` and only nudges it
as squads change, so leaps should be **0 by construction** — the metric is a
*guard* that stays lit for the life of the project, catching any future mechanic
(M8's own overrides most of all) that would let a club run away. Also a **pure
read** in Increment 1.

### 1.3 Club pressure (`ClubPressure`, now live on `ClubState`)

The stub type becomes an optional field, `club.pressure?`, updated at each season
rollover for every simulated AI club (never the user's — the user's ambition is
the user). Components, each 0–100, already named in the stub:

- **`trophyDrought`** — seasons without a title relative to what prestige
  expects. A prestige-85 club that hasn't won in 4 years is under real pressure; a
  prestige-62 club that never wins isn't.
- **`rivalDominance`** — how dominant the strongest club in the league is (the
  user on a title streak drives this up across the whole field — the rubber-band
  already computes a league-level version in `worldDefiance`).
- **`unrest`** — fan/board discontent, fed by drought + finishing below
  expectation.
- **`windfall`** — a recent sale (including selling *to the user*) leaves money
  burning a hole; a club that just banked a fee is primed for a statement buy.
- **`jobSecurity`** — the manager subsystem's standing (low security → a
  desperate, roll-the-dice window).

Pressure is derived, deterministic, and **forked** so it consumes no existing
RNG stream.

### 1.4 The ambition override (the actual sim change)

At the summer window, an AI club whose pressure crosses threshold **may** make a
single ambitious signing that deviates from what it would otherwise do:

1. **Trigger** — `max(pressure components) >= OVERRIDE_THRESHOLD`, then a
   per-window probability roll (forked). Rarity is the point: overrides are a
   *minority* of AI activity.
2. **Target selection** — a plausible, logical move: the target fills a squad
   need, sits within the club's **budget/wage reality and prestige pull**, and
   **respects the target's transfer-resistance profile (§6)**. Prefer
   foreign/context sellers (as counter-punch does) so an override rarely disturbs
   the tracked real players — this protects the squad-match target (§4).
3. **Hard gates (all mandatory):**
   - **Zero hard-block breaches** — an override may never sign a hard-blocked
     player (the invariant the harness probes every window).
   - **Ceiling gate** — the resulting squad strength may not push the buyer over
     its `plausibleCeiling`. An override makes a club *more competitive within
     plausible bounds*, never a fantasy leap. This is what keeps Target 3 at 0
     even after Target 1 goes live.
4. **Logging** — emit an `ambition.override` event (the code the sampler already
   watches) and a `divergenceLog` butterfly with the pressure `cause`, then let
   the standard ledger-butterfly chain handle whoever lost the player.
5. **Pressure release** — a completed statement signing relieves the pressure
   that drove it (drought/unrest ease), so a club doesn't override every window.

Because suppressing a rival (raiding it, gazumping its ledger move) *raises* its
pressure, the "rivals fight harder when you lean on them" behaviour falls out of
this one mechanic — no separate system.

### 1.5 Metric counting (`runCareer.ts`)

- **`significantAiTransfers`** — incremented per AI transfer INTO a simulated club
  of a player above an ability floor (`ledger.executed`, `rival.counterpunch`,
  and `ambition.override` events), read from the event stream the loop already
  walks.
- **`ambitionOverrides`** — the `ambition.override` subset.
- **`leagueTitlesTotal` / `moneyClubTitles`** — in `collectEndOfCareerMetrics`,
  walk every league's `titleHistory` (already read there for the dynasty metric);
  total titles, and the subset whose `championId` is an `isMoneyClub`.
- **`fantasyLeaps`** — in `collectEndOfCareerMetrics`, count simulated clubs whose
  final `strength > plausibleCeiling` with no logged cause chain.

---

## 2. Why this is the first calibration-perturbing milestone

Every prior system on this branch was **byte-identical by construction** — manager
effects par-anchored to zero at a kept coach, attributes re-pinned to the exact
same ability, curation of non-`man-utd-1999` scenarios only. M8 cannot be. The
ambition-override target is measured on the **only** scenario the harness runs
(`man-utd-1999`), so overrides *must* occur there, and an override changes a
squad → strength → results → titles. There is no par-anchor that makes it vanish.

The calibration contract therefore changes from **byte-identical** to **stays in
band**:

- The **determinism** target ("same seed ⇒ identical hash") stays green: M8 is
  fully deterministic (all new rolls forked), so a given build still replays
  identically. Determinism ≠ identical-to-the-previous-build.
- The **14 active bands** have margin. M8 must keep all 14 inside their bands; any
  that drift are tuned back (override rate, thresholds, seller preference) before
  the milestone lands. This is the "re-verify end-to-end" work called out when the
  milestone was proposed.

### The bands most at risk, and the mitigation

| Target | Risk from M8 | Mitigation |
|---|---|---|
| Playable-club squad-match ≥85% | An override signs a tracked real player away from his real club | Overrides prefer foreign/context sellers; never target the 12 playable clubs' tracked men in a zero-divergence run |
| Ledger fidelity ≥85% | Overrides *are* deviations from the ledger | Overrides capped to ~10–15% of significant AI transfers — the ledger stays the ≥85% default (the same number both targets encode) |
| Longest title streak (dynasty band) | A strengthened rival breaks a streak / a weakened one lets one run | Ceiling gate bounds how strong an override makes a club; effect is small and two-sided |
| Serious-injury rate, crisis cadence | Larger squads at some clubs shift exposure | Injuries are per-player on unchanged distributions; squad *size* is capped at 23 as today |

The staging below de-risks this: Increment 1 ships the measurement with **zero
sim change** and tells us where the untouched sim already stands on Targets 2 & 3
before a single override exists.

---

## 3. Build staging

### Increment 1 — measurement (byte-identical, ships first)

1. `isMoneyClub` + `plausibleCeiling` helpers (pure).
2. `collectEndOfCareerMetrics`: populate `leagueTitlesTotal`, `moneyClubTitles`,
   `fantasyLeaps`.
3. `runCareer`: count `significantAiTransfers` (ledger + counter-punch events)
   even before overrides exist, so the denominator is real.
4. Run the harness. **No sim path changes → the 14 active targets are
   byte-identical.** Then:
   - If `money-club-trophy-share` and `no-fantasy-leaps` pass on the untouched
     sim, **activate them** (`active: true`). Expectation: they do — titles are
     strength-driven and strength is anchored, so wealthy clubs already win the
     majority and nothing leaps.
   - `reality-ambition-overrides` stays pending (numerator is still 0 with no
     mechanic) — activated in Increment 2.

This alone turns 2 of the 3 pending targets green with no calibration risk.

### Increment 2 — the mechanic (perturbs; re-verified end-to-end) — SHIPPED

1. ✅ `club.pressure` field (optional on `ClubState`; `ClubPressure`/
   `AmbitionOverride` moved from `ledger.ts` to `types.ts` to avoid the import
   cycle) + `updateClubPressure` each July rollover (derived fresh from the
   honours board + grudge; the user's club is never pressured).
2. ✅ `runAmbitionOverrides` at the summer deadline, with every gate from §1.4 —
   foreign/context sellers only, never a reality-timeline subject, never a
   hard block, ceiling-guarded, budget-stretched not invented.
3. ✅ `ambition.override` event (the code the sampler watches) + `divergenceLog`
   butterfly with the pressure cause.
4. ✅ `runCareer` counts `ambitionOverrides` and folds them into
   `significantAiTransfers`.
5. ✅ `reality-ambition-overrides` activated.
6. ✅ **Re-verified: all 17 active targets in band.**

**The one tuning lesson.** The first run measured 48% overrides — a dominant user
pressures the *whole field*, so many clubs fired at once. The fix was a **global
cap of one override per window**: only the single most-desperate club makes a
statement move in any summer. That dropped the share to a stable ~9.4% and also
reads truer — a splash-the-cash summer is one club's story, not everyone's. The
ceiling gate did its job untouched (fantasy leaps stayed 0 even at 48%), as did
the seller/subject gates (squad-match and ledger fidelity never moved).

---

## 4. Open questions / decisions

- **Money-prestige threshold.** ≈80 is the first cut; verify against each era's
  league so the "money club" set matches intuition (in PL-1999 it should be
  roughly Man Utd / Arsenal / Liverpool / Chelsea / Newcastle-Leeds, i.e. the
  clubs that actually won or challenged).
- **Ceiling margin.** ≈+8 over `baseStrength`. Too tight and legitimate ledger
  buys read as leaps; too loose and the guard is toothless. Increment 1's
  measurement on the untouched sim sets the empirical floor.
- **Significant-transfer ability floor.** The denominator should count *meaningful*
  moves, not squad filler — an ability floor around the first-team level (≈74+).
- **Override cadence.** One override per club per window at most; a global soft cap
  may be needed to hold the ~10–15% share if many clubs are simultaneously
  pressured (e.g. a dominant user driving the whole field's `rivalDominance` up).
- **FFP.** `finance.ts` already flags "FFP scrutiny arrives post-2011, M8" on the
  sugar-daddy multiplier. Out of scope for this pass — overrides are gated by
  current budget, which already reflects ownership; explicit FFP is a later refinement.

---

## 5. Recommendation

Ship **Increment 1 immediately** — it's calibration-safe, activates two of the
three pending targets, and its measurement of the untouched sim is the empirical
baseline that de-risks Increment 2. Then build the override mechanic behind forked
determinism and drive the full board back into band. This is the milestone that
turns the world from a scripted backdrop into an economy that pushes back — the
last major gap in the calibration story.
