# DESIGN — Richer player attributes

> **Status: Phase 1 SHIPPED (2026-07); Phases 2–3 queued.** A foundational change
> to the player model:
> replace the single hidden `ability` scalar's role as the *only* descriptor of a
> player with a small **attribute vector** (technical / physical / mental), so
> style-fit, player-type development, scouting and valuation can key off *what
> kind* of player someone is — not just how good and what position. Scoped
> 2026-07 after the manager subsystem (style, on-pitch effect, player-type dev)
> shipped using **position as a stand-in** for player type. This removes the
> stand-in.

## 1. Why

Today a player is `ability: number` (1–100, hidden) + `positions` + `personality`
+ `injuryProneness` + ceilings. That single scalar can't distinguish a pacey
poacher from a hold-up target man, or a ball-playing centre-half from a
no-nonsense stopper. Several systems already *want* that distinction and fake it
with position:

- **Manager style-fit** (`styleMatchAffinity`) rates a possession coach by his
  squad's **midfield** ability vs the rest — but a possession coach really wants
  *technical, passing* players wherever they play; a ball-playing CB suits Pep,
  a route-one CB does not. Position is a coarse proxy.
- **Player-type development** (`managerPositionDevMod`) speeds a possession coach's
  **midfielders** and slows his defenders — but it should speed his *technical*
  players and the *technical* attributes, not a whole position line.
- **Scouting** (`ScoutReport`) reveals only `ability`/`potential` ranges. Real
  scouting is "quick, great finisher, can't defend" — an attribute profile with
  fog, which is far richer and is what makes recruitment a *judgement*.
- **Valuation / recommend / tactical fit** would all sharpen with player types
  (a 78-pace winger and a 78-target-man are priced and used differently).

The lost-talent and fragile-star systems also gain: a latent ceiling could raise
*specific* attributes (the pace a player never developed), not an abstract number.

## 2. The model

Add a hidden **attribute vector** to `PlayerState`, 8 attributes in 3 groups
(1–100 each, same hidden/scouted treatment as `ability`):

| Group | Attribute | Captures |
|-------|-----------|----------|
| Technical | `finishing` | putting chances away |
| Technical | `passing` | range + accuracy of distribution |
| Technical | `technique` | first touch, dribbling, ball-striking |
| Technical | `defending` | tackling, marking, positioning |
| Physical | `pace` | acceleration + top speed |
| Physical | `physical` | strength, stamina, aerial |
| Mental | `vision` | creativity, decisions, composure |
| Mental | `workrate` | tenacity, pressing, off-ball graft |

(Goalkeepers are a special case: their `ability` already means shot-stopping;
Phase 1 gives them a flat/derived vector and leaves GK-specific attributes —
handling, command — as a **later** addition. Not worth blocking on.)

### `ability` becomes a derived roll-up (the calibration key)

`ability` stays on `PlayerState` and stays the source of truth the **match sim
uses** (`deriveRawStrength` averages it). The attribute vector rolls **up** to it
through a **position-weighted mean**:

```
ability ≈ Σ weight[position][attr] · attr        (weights sum to 1 per position)
```

Example weights (illustrative, to be tuned):

```
ST : finishing .30 pace .20 technique .15 physical .15 vision .10 passing .05 workrate .05
CB : defending .35 physical .25 pace .10 passing .10 workrate .10 vision .05 technique .05
AM : vision .25 passing .20 technique .20 finishing .10 pace .10 workrate .10 physical .05
DM : defending .25 workrate .20 passing .15 physical .15 pace .10 vision .10 technique .05
```

**This is what makes the change calibration-safe by construction:** if every
player's vector is generated so its position-weighted roll-up *equals his current
`ability`*, then `ability` is unchanged, `deriveRawStrength` is unchanged, every
match is identical, and all 14 calibration targets hold on day one. The new
consumers (style-fit, dev, scouting) read the *vector*; the sim keeps reading the
*scalar*. Same anchoring philosophy as the manager subsystem (par reputation, par
style): add fidelity as a *decomposition of the existing baseline*, never a shift.

## 3. Authoring strategy (the real cost)

The blocker is data: ~800 curated players/era. We do **not** hand-author 8
numbers × hundreds of players. Instead:

1. **Archetype tags.** A curated seed gets an optional `archetype` (a string like
   `'poacher'`, `'target-man'`, `'ball-playing-cb'`, `'stopper'`, `'winger-pace'`,
   `'playmaker'`, `'destroyer'`, `'box-to-box'`, `'full-back-attacking'`). Each
   archetype is a **shape** (relative attribute emphases). A generator spreads the
   player's `ability` across the vector per the archetype, then **normalizes** so
   the roll-up returns exactly `ability`. So one tag → a plausible, consistent
   8-vector, and the roll-up invariant is preserved automatically.
2. **Default archetype by position** when none is given — so every existing
   curated player and all procedural filler get a reasonable vector for free.
3. **Hand-tune only the marquee few** where reality is distinctive (Cannavaro:
   defending≫physical, low pace; Ronaldo/R9: pace+finishing; Xavi: passing+vision,
   low pace/physical) — an override vector on the seed.

Procedural filler: `generatePlayer` already rolls `ability` from a target; it
additionally picks an archetype (weighted by position) and fills the vector from
it. Deterministic (same RNG), so save/replay is unaffected.

## 4. What it unlocks (rewire these off attributes)

- **`styleMatchAffinity`**: a possession coach's fit = squad's mean
  `technique/passing/vision`; a pragmatist's = `defending/physical/pace`. Keep the
  **par-anchoring** (delta vs `parStyle` on the same squad → 0 for a kept coach),
  so still calibration-inert. Now a technical CB genuinely suits Pep.
- **`managerPositionDevMod` → `managerAttributeDevMod`**: a possession coach
  develops *technical* attributes faster, a pragmatist *physical/defensive* ones —
  and those roll back up into `ability` growth. Same par-anchoring.
- **Scouting**: `ScoutReport` gains per-attribute ranges under the same fog model
  (observation/medicals narrow them). "Quick, elite finisher, poor defender."
- **Later, optional**: tactical/formation fit, positional retraining (a fading
  winger converted to full-back if his `defending/workrate` allow), attribute-
  specific lost-talent unlocks, sharper valuation.

## 5. Blast radius

`.ability` appears in **85 places across 23 files**. The roll-up design means
**almost none change** — they keep reading the scalar:

- **Unchanged** (read `ability`): `deriveRawStrength`/match sim, `finance`
  (valuation), `agency`, `rival`, `ageing`, `injuries`, most of `development`.
- **New field + generation**: `types.ts` (the vector + optional `archetype`),
  `players.ts` (`generatePlayer` fills it; a `deriveAbility(vector, position)`
  helper + a `fillVector(ability, archetype, position)` generator), the curated
  seed type + `state.ts` squad build (fill vectors for curated players).
- **Rewired to read the vector**: `manager.ts` (style-fit + attribute dev),
  `scouting.ts` (+ the API/`recommend` surface), `development.ts` (attribute
  growth composing to ability).
- **Data**: archetype tags on curated seeds (incremental — defaults cover the
  rest); a research pass for marquee overrides.

## 6. Phasing

- ✅ **Phase 1 — model + invariant (SHIPPED).** `attributes.ts`: the 8-attribute
  vector, archetype shapes + position weights, `fillVector`/`deriveAbility` with
  the roll-up invariant, and `attributesOf(player)` deriving the vector on demand
  from `ability` + `archetype` (default by position) — no storage, no RNG, so the
  sim never reads it. Rewired `styleMatchAffinity` and (new) `managerAttributeDevMod`
  off real attributes instead of the position stand-in, keeping par-anchoring.
  Scouting now returns fogged per-attribute ranges. **Calibration byte-identical,
  14/14; 234 tests.** (A high-ability standout attribute can hit the 99 cap, so the
  roll-up is exact only pre-clamp — fine while `ability` stays authoritative.)
- **Phase 2 — fidelity (incremental data).** Archetype tags on the notable
  curated players per era; hand-tuned overrides for the marquee handful. Pure data,
  calibration-safe (roll-up preserved), no engine change.
- **Phase 3 — optional source-of-truth flip.** Make the vector authoritative and
  derive `ability` from it live (so an attribute change *moves* ability). Larger:
  re-point the 85 readers conceptually (they still read `ability`, now computed),
  re-verify calibration end-to-end. Only worth it if Phase 1/2 prove the model.

## 7. Risks & open questions

- **Weight tuning.** The position weights must produce sane rolls; a bad set makes
  archetypes feel wrong even with the invariant. Mitigate: unit-test that
  `deriveAbility(fillVector(a, arch, pos), pos) === a` for all archetypes, and
  eyeball marquee players.
- **GK model.** Deferring GK-specific attributes is fine but leaves keepers coarse.
  Acceptable for Phase 1.
- **Scope creep into tactics.** Formations/roles are tempting once attributes
  exist — explicitly OUT of this scope; attributes first, tactics as a separate
  later design.
- **Determinism.** The vector generator must draw from the existing per-player RNG
  fork so save/load/replay stays bit-identical. Same discipline as everywhere else.
- **Serialization.** New optional fields on `PlayerState`; old saves load with the
  vector absent → fill lazily from `ability`+position default. Low risk.

## 8. Recommendation

Do **Phase 1** as one focused build: it's bounded, the roll-up invariant makes it
calibration-safe by construction, and it immediately upgrades the manager
style-fit and player-type development from position-proxy to real attributes (the
reason this was raised). Phase 2 is then ordinary, low-risk era data. Phase 3 only
if the model earns it. Estimated Phase 1: comparable to the manager on-pitch +
style work already shipped — a day's focused build with the usual test +
calibration gate.
