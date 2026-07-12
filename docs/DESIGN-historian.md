# THE HISTORIAN — Realism Review Layer

**Handoff doc #3, as built.** An LLM-powered review agent, expert in football
history 1995–2025, that audits simulation outputs, data packs, and playthroughs
for realism. It complements — never replaces — the deterministic Monte Carlo
calibration harness: **code asserts statistics; the Historian judges
plausibility.**

**Hard rule: the Historian is a REVIEW layer only.** It lives in
`packages/harness/src/historian`, runs post-hoc on outputs, and never touches
gameplay, never decides outcomes, never runs at play-time.

## Architecture

```
packages/harness/src/historian
  prompt.md             ← the §4 system prompt (shipped verbatim)
  rubric.md             ← the §5 judgment rubric (appended to the prompt)
  prompt.ts             ← assembles prompt + rubric + mode suffix (§7/§8)
  types.ts              ← verdict/report/reference contracts
  client.ts             ← HistorianClient seam + Anthropic client + env factory + scripted (test) client
  reference-loader.ts   ← injects data-pack slices into context (§2)
  sampler.ts            ← selects what to review from a finished career (§3)
  datapack-sampler.ts   ← Mode 3: validates a raw era pack (§8)
  reviewer.ts           ← batches samples → LLM → verdicts, with SEVERE confirmation (§6)
  report.ts             ← aggregates verdicts → realism report + CI signal (§5)
  capture.ts            ← runs careers and keeps their final state (review material)
  run.ts                ← CLI entry (calibration / playtest / datapack)
```

- **Model:** any strong general LLM via API (temperature 0.2; structured JSON
  output enforced through a forced tool call). Default `claude-sonnet-5`,
  overridable with `HISTORIAN_MODEL`.
- **Determinism handling:** verdicts are advisory-tiered; only a **confirmed**
  SEVERE gates CI, and SEVERE findings are re-run once for confirmation before
  failing a build.
- **Runs:** (a) after a Monte Carlo capture batch; (b) on demand against a
  single playthrough (Mode 2); (c) against data packs pre-build (Mode 3).

## Grounding (§2) — never trust the model's memory for facts

`reference-loader.ts` injects the relevant slice of the data pack into each
item's context: real ledger entries for the clubs/windows under review, career
baselines (immutable birth ceiling) for the players being judged, club
finance/ownership state, and the divergence chain. **Use the reference data for
facts; use domain expertise for plausibility judgment.** Pure factual diffs are
already done in code by the calibration harness — the Historian answers only the
question code cannot: *is this believable football?*

## Sampling (§3) — review divergences, not everything

Per capture batch, `sampleCareer` selects (from a finished career's final state
and event log):

| Sample | Coverage |
|---|---|
| Divergence-log chains + significant ledger butterflies | 100% above the significance bar |
| Ambition overrides | 100% (forward-compatible with the M8 override event) |
| Career arcs (superstars, prospects, real players) | ~20 key players per career |
| Full transfer windows | 2–3 random windows |
| League tables / trophy lists at 5-year checkpoints | all checkpoints (catches trajectory fantasy) |
| Event sequences (scandals, crises, injuries) | random 10–15 |
| Reality-fidelity control (ledger held) | small random control |

A per-career cap keeps LLM calls to a few dozen per batch. 100%-coverage
categories (divergences, overrides) are never dropped by the cap; the sampled
categories fill the remaining headroom by significance.

## Verdict & rubric (§4/§5)

Each item receives one verdict: `PASS | FLAG | FAIL`, a severity
(`MINOR | MODERATE | SEVERE | null`), a confidence, one-to-four sentences of
reasoning, and a `suspectedSystem` naming the engine module that likely drifted.
The prompt polices seven archetypes: trajectory fantasy, money blunted,
suppression collapse, career-arc implausibility, resistance breach,
tone/frequency, and valuation nonsense.

## Aggregation & CI gating (§5/§6)

`report.ts` applies:

- Any **confirmed SEVERE** (re-run once; both runs must agree) → **CI fails.**
- **MODERATE** findings > N per batch (default 10) → CI fails.
- **MINOR** findings → realism report only.
- All findings grouped by `suspectedSystem`, so the report tells us *which
  module is drifting* — review becomes actionable regression targeting.

`run.ts` writes `realism-report.md` (a build artifact) and returns the gate
signal. If no API key is configured (or `--historian=off`), the run is
**SKIPPED** and the build is **not failed** — a missing key is a config gap, not
a realism regression. On main-branch CI the flag must never be off.

## Mode 2 — Playtest reviewer (§7)

`--mode=playtest` reviews one full playthrough with an extra prompt suffix that
asks: where was the sim TOO KIND to the player; where did the player's own club
lack internal friction; and rank the five least believable moments. Run it on
every internal playtest.

## Mode 3 — Data-pack validator (§8) — run BEFORE the engine consumes a pack

`--mode=datapack` validates a raw era pack: wrong fees/windows/clubs in the
ledger, missing significant real transfers, over/under-rated ceilings, missing
or wrong resistance profiles/hard blocks, era-inappropriate wage/fee bands, and
missing real injuries. **Data errors are the single most likely source of
unrealism and the cheapest to fix — validate every era pack before M3+ consumes
it.**

## Usage

```bash
pnpm historian -- --mode=calibration --careers=20 --years=15   # review a batch
pnpm historian -- --mode=datapack   --scenario=man-utd-1999    # validate a pack
pnpm historian -- --mode=playtest   --careers=1                # review one career
# With ANTHROPIC_API_KEY (or HISTORIAN_API_KEY) the reviewer runs automatically;
# otherwise the run is SKIPPED (never fails the build).
```

### Reviewing an actual playthrough, and reviewing without an API key

The reviewer is *an LLM*. In CI that LLM is the API client; in a coding chat it
can be the assistant you are already talking to. Two flags bridge the gap:

- `--from=<save.json>` — sample an existing **playthrough save** (a serialised
  `GameState`, e.g. `playthrough.json` from `pnpm play`) instead of running a
  fresh batch. This is the Mode 2 "feed the Historian a full playthrough" path.
- `--dump=<items.json>` — also write the sampled, reference-grounded review
  items to JSON. Works with or without an API key — it is the review *packet* a
  reviewer judges.

So the in-chat loop is:

```bash
pnpm play new man-utd-1999          # …play a career (or generate one), producing playthrough.json
pnpm historian -- --mode=playtest --from=playthrough.json --dump=review-items.json
# → hand review-items.json to a reviewer (an LLM in chat, or a human), who judges
#   each item against prompt.md + rubric.md and writes the realism report.
```

With a key set, the same command auto-reviews and writes `realism-report.md`.

## Limits & honesty (§9)

- The Historian is **judgment, not ground truth** — it can be wrong, which is
  why only confirmed SEVERE gates CI and everything else is advisory.
- It reviews **structured outputs**, not prose — it is fed engine logs/state, so
  it judges the sim, not the storytelling.
- Its factual reliability comes from the injected reference data; if a fact is
  not in context, it must say `confidence: "low"` rather than assert from memory.
- It does not tune the engine; humans (guided by the `suspectedSystem`
  groupings) do.
