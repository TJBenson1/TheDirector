# DESIGN — Internal friction (binding)

> **Status: binding architecture.** The player's OWN club must have friction,
> incomplete control, and incomplete information. Plans must be allowed to fail
> for reasons that aren't the player's fault — **but the world must stay
> realistic** (see the Governing Constraint, which overrides everything else).
> Applied 2026-07 during M6.

Prior corrections hardened the *external* world. This hardens the *internal*
experience: perfect squad info, total manager control, an obedient board, no
financial shocks, no dressing-room politics, a ~100% prospect hit rate and no
job risk were all too kind.

## The ten systems

1. **The player can be sacked.** Board mandate + patience per scenario; the
   board can overrule (veto a signing, cap wages, refuse a fee, order a sale,
   reject poor value); sustained failure → warnings → dismissal. *(M9)*
2. **Forced & crisis sales.** Sustained agitation → discount sale; release
   clauses triggered by outside clubs; board-ordered sales; late transfer
   requests forcing weak-position deals. Sometimes the only buyer is a rival.
   Not every unwanted sale is avoidable. *(M6b/M7)*
3. **Contracts & agents can beat the player.** Agents hold out for
   above-structure wages, stall toward the final year, leverage rival interest;
   a misjudged renewal loses a player on a free or forces a cut-price sale;
   standoffs can go nuclear (Rooney-2010) and sometimes end in departure. *(M7)*
4. **The manager is not fully controlled** (expands §8). Autonomous character:
   picks players the director didn't sanction, freezes out expensive signings
   (wasting fee, stunting development §5), demands targets, publicly contradicts
   the director, sabotages succession, can leave for a rival. **The director does
   NOT have final say on the XI or development minutes** — those flow through the
   manager, whose trust must be managed. *(M8/M9)*
5. **Prospects bust — realistic hit rates.** Highly-rated youth frequently fail:
   plateau, injury-wreck, fame/complacency decline, or never adapt. **Calibration:
   "generational" prospects reach ceiling ~40–60% under good management;
   "promising" far lower; most intakes are fillers/washouts. A ~100% hit rate is
   a failing build.** *(M5 — recalibrated now)*
6. **Financial fragility & shocks.** TV-deal changes, currency swings, stadium
   rebuilds, FFP charges (post-2011), sponsor collapse, revenue shocks
   (pandemic-class). Money is not a smooth line. *(M9)*
7. **Deadline-day & deal-collapse risk.** Targets dither and pick a rival late;
   medicals fail at the eleventh hour; deals collapse over image rights/agent
   fees; windows close with business unfinished; late panic-buys carry elevated
   flop risk. *(M7)*
8. **Fog of war on the player's OWN squad.** Own players' true level/peak timing
   are estimates (better than outsiders', not perfect). The player can misjudge
   their own — sell too early, hold too long. *(M7 — extends §7 scouting)*
9. **Dressing-room chemistry & culture.** Output can underperform the sum of
   parts: cliques, a poisonous senior pro, a disruptive signing, captaincy rows,
   ego clashes (galáctico cautionary tale). A stacked squad doesn't auto-gel. *(M9)*
10. **Managerial succession is hard** (expands §8). The wrong hire, culture
    clash, a new boss who dismantles the inherited squad, players downing tools,
    a botched handover. Landing a top successor is contested and uncertain.
    Dynasties die here. *(M9)*

## AI quality requirement

Rival AND board/manager/agent AI must be clever and reactive — read the state
and exploit the player's weaknesses (bid for an unsettled star, trigger a
clause, poach a frozen-out prospect, pounce when over budget) while pursuing
their own logical agendas. Opposition on every front, external and internal.

## GOVERNING CONSTRAINT — "a healthy dose of reality" (overrides everything)

Friction must stay **plausible**; it must NOT produce fantasy outcomes.

- **Money still talks, correctly.** Post-2003 Chelsea, post-2008 City, galáctico
  Madrid **win trophies commensurate with spend in the large majority of sims.**
  Blunting money into repeated failure is as unrealistic as the player never
  failing. Suppression makes rivals fight *harder*, not disappear.
- **Suppressed rivals still compete.** Losing a couple of targets makes a club
  higher-pressure and more aggressive (ambition overrides), not broken; they stay
  plausible contenders unless *sustained, compounding, logged* causes justify
  decline.
- **No fantasy leaps.** No club exceeds its real trajectory without a long,
  logged, multi-cause chain. *Spurs do not win the Champions League before 2006*
  because a few transfers were scuppered.
- **Reality remains the ~80–90% default** (ledger-fidelity targets).

### Calibration additions (harness)
- Player is **sacked in a meaningful minority** of underperforming runs.
- **Big-money clubs win trophies proportional to spend** in the clear majority.
- **Prospect hit-rates land in the §5 bands** (generational 40–60%).
- **≥1 internal crisis** (forced sale / contract loss / manager conflict /
  financial shock / prospect bust / chemistry failure) per few seasons on average.
- **No club exceeds its plausible ceiling** without a traceable multi-cause chain.

A build where money-clubs routinely win nothing, OR a mid-tier club fluke-wins
the biggest prizes, OR the player never faces internal adversity — all fail.

## Impact on built modules (honest assessment)

| Module | Now | Action |
|---|---|---|
| M5 development | played generational prospects reached ceiling ~81% | **Recalibrated now** → 40–60% via fame/complacency/stagnation/injury bust modes + a new active calibration target |
| M6 transfers/valuation/adaptation | consistent | unchanged |
| Board (M1 stub) | mandate + patience fields exist | sacking/overrule logic = M9 |
| Manager (M1 stub) | identity + relationship only | autonomy = M8/M9 |
| Everything else (agents, shocks, deadline-day, chemistry, succession, own-squad fog) | not built | seams + pending calibration targets; built M7–M9 |
