# THE DIRECTOR — Start-Point Catalogue (Handover)

You are working on **THE DIRECTOR**, a counterfactual football-management simulation
(1995–2025). You direct one club through real history; the world executes reality by
default and frays only as you push on it.

## Standing rules (apply to every start point)
- **Reality-default.** Do nothing and the world reproduces real history — real
  transfers execute, real champions are crowned. Your interventions create
  butterflies; aggression compounds divergence over time.
- **The world stops at 2025** (`WORLD_END = '2025-07'`). No invented seasons past it.
- **The Champions League is reality-anchored.** Every real European Cup winner
  1996–2025 is forced if that club exists in the field; domestic races are emergent
  from per-club strength arcs bent to real trajectories.
- **Transfers execute as reality EXCEPT at your club**, where you may veto/hijack.
- **The board has a club-aware temperament** (ruthlessness R ∈ [0.7, 1.7]):
  sugar-daddy owners (Abramovich, takeovers) and title-or-bust mandates fire readily
  and escalate on a *run* of near-misses (a Pérez board won't take 2nd twice in a
  row); rebuild/project mandates ride out lean years.
- Each start runs ~to 2025; every elite club in a scenario ships ≥13 curated real
  players. 14 Monte-Carlo calibration targets (on `man-utd-1999`) must never break.

## The 26 start points

Format: `scenario-id` · Club — Year: Title — *mandate* — board temperament.

### England (12)
- `liverpool-1995` · **Liverpool — 1995: Spice Boys** — *Make the swagger count; win the title the real Spice Boys never did.* — patient (R 1.00, exp 3).
- `arsenal-1996` · **Arsenal — 1996: Arrival of Wenger** — *Back the revolution and challenge for the title.* — patient (R 1.00, exp 3).
- `chelsea-1996` · **Chelsea — 1996: Pre-Money** — *No billions, no shortcuts — build a top-four side the hard way.* — very patient (R 0.75, exp 6).
- `man-utd-1999` · **Manchester United — 1999: After the Treble** — *Sustain dominance and win a second European Cup.* — neutral (R 1.00, exp 2). **[calibration scenario]**
- `liverpool-2001` · **Liverpool — 2001: After the Treble** — *Turn the cup treble into a first league title in a decade.* — neutral (R 1.00, exp 2).
- `spurs-2001` · **Tottenham — 2001: Sleeping Giant** — *Wake the giant and drag Spurs back into Europe.* — very patient (R 0.75, exp 7).
- `chelsea-2003` · **Chelsea — 2003: The Roman Empire** — *Turn Abramovich's billions into the title — fast.* — **ruthless sugar-daddy (R 1.45, exp 2)**.
- `arsenal-2004` · **Arsenal — 2004: The Invincibles** — *Build a dynasty on the unbeaten season; hold off Chelsea's billions.* — demanding (R 1.15, exp 1, debt).
- `man-city-2008` · **Manchester City — 2008: The Takeover** — *Turn the billions into titles without wasting a decade.* — sugar-daddy but rebuild mandate (R 1.20, exp 5).
- `liverpool-2010` · **Liverpool — 2010: FSG Reset** — *Turn the reset into a return to the summit — faster, without the false dawns.* — patient (R 0.75, exp 5).
- `man-utd-2013` · **Manchester United — 2013: After Ferguson** — *Defend the title; prove the dynasty outlives Ferguson.* — title-or-bust (R 1.25, exp 1). *(the impossible job)*
- `spurs-2013` · **Tottenham — 2013: The Bale Money** — *Reinvest the Bale windfall wisely and crack the top four.* — patient (R 0.75, exp 5).

### Spain (4)
- `real-madrid-2000` · **Real Madrid — 2000: Galácticos** — *Assemble the Galácticos and conquer Spain and Europe.* — **Pérez, title-or-bust (R 1.25, exp 1)**.
- `barcelona-2003` · **Barcelona — 2003: Pre-Messi Dawn** — *Turn the dawn into a dynasty with the golden generation.* — title-or-bust (R 1.25, exp 1).
- `real-madrid-2006` · **Real Madrid — 2006: Post-Galáctico Rebuild** — *End the circus; rebuild a team that wins Spain and the Décima.* — **Pérez, title-or-bust (R 1.25, exp 1)**.
- `barcelona-2014` · **Barcelona — 2014: Peak — Don't Waste It** — *Win everything with MSN; don't waste the greatest team you'll ever have.* — title-or-bust (R 1.25, exp 1).

### Italy (6)
- `milan-1995` · **AC Milan — 1995: End of the Dynasty** — *Hold off the decline and win one more Scudetto.* — neutral (R 1.00, exp 2).
- `juventus-1995` · **Juventus — 1995: The Lippi Era** — *Defend the Scudetto and conquer Europe.* — title-or-bust (R 1.25, exp 1).
- `inter-1998` · **Internazionale — 1998: Il Fenomeno** — *Win the Scudetto Moratti's millions keep missing — before the knee goes.* — neutral (R 1.00, exp 2).
- `inter-2004` · **Internazionale — 2004: Pre-Calciopoli Positioning** — *End the wait; position to seize the Scudetto when the balance tips.* — neutral (R 1.00, exp 2).
- `juventus-2006` · **Juventus — 2006: Calciopoli — Serie B** — *Win Serie B, return to the top flight, rebuild a dynasty.* — neutral (R 1.00, exp 2). *(novel: promotes back to Serie A in-place)*
- `milan-2007` · **AC Milan — 2007: Last Dance Before the Fall** — *Squeeze one more European Cup from the champions, and rebuild before the fall.* — neutral (R 1.00, exp 2).

### Germany (4)
- `dortmund-1997` · **Borussia Dortmund — 1997: Kings of Europe** — *You are champions of Europe. Don't let the throne slip.* — neutral (R 1.00, exp 2).
- `bayern-1998` · **Bayern München — 1998: The Treble Denied** — *Ninety seconds from the European Cup last time. Now finish it.* — title-or-bust (R 1.25, exp 1). *(foil to man-utd-1999)*
- `bayern-2009` · **Bayern München — 2009: Van Gaal Reset** — *Complete the reset; fend off Klopp's Dortmund and finish the job in Europe.* — title-or-bust (R 1.25, exp 1).
- `dortmund-2012` · **Borussia Dortmund — 2012: Defend the Peak** — *Hold the golden generation together; turn the Wembley run into a European Cup.* — neutral (R 1.00, exp 2).

## Clusters that share a curated pack (build/reuse notes)
- **Bundesliga 1997** pack → `dortmund-1997` + `bayern-1998` (continental elite reused from the 1996 pack).
- **Bundesliga 2010** pack → `bayern-2009` + `dortmund-2012` + reused by `liverpool-2010`.
- **1996 pack** (English + continental) → `arsenal-1996`, `chelsea-1996`, and reused by `liverpool-1995`.
- **Serie A 2007** pack → `milan-2007`, reused by `juventus-2006`.
- **La Liga 2007-era elite** reused into `real-madrid-2006`.

## Market depth & the gazump (M12)

The transfer market is now **liquid and reality-anchored across all 26 starts**:

- **European selling clubs everywhere.** Every era carries its real talent pipeline —
  the Dutch, Portuguese, French, Scottish, Spanish, German and Italian clubs that fed
  the modelled leagues (Ajax, PSV, Feyenoord, Porto, Benfica, Sporting, Lyon,
  Marseille, Monaco, Sevilla, Villarreal, Atlético, Napoli, Roma, Dortmund, Werder,
  Leverkusen, Hamburg, Celtic, Rangers, Deportivo, Valencia…), each with era-correct
  real squads. Measured attainability of the **top 30% of world talent** for the
  playable club now runs ~53–81% at the giants and ~35–48% at mid clubs (Spurs, a
  newly-rich City) — the mid-club ceiling is deliberate: a smaller side genuinely
  can't attract the world's elite.
- **Sugar-daddy money talks.** A newly-moneyed club (2008 City, Abramovich's Chelsea)
  gets a bounded destination-pull bonus, so the billions attract players its bare
  prestige would not (man-city-2008 rose 23%→53% attainable, chelsea-2003 40%→62%).
- **The gazump (buy a player before his real move).** A "ledger subject" — someone
  with a real transfer still ahead (VDS→Juventus in 1999) — can be prised away by
  **out-bidding the selling club beyond the pole suitor's real fee** (the greater of
  £2m or +30% collapses their advantage), and/or courting + wages. The deprived club
  then signs a real fallback (Juventus turn to another keeper), logged as a butterfly.
  A cold approach leaves reality's deal untouched, so the passive world still holds.

Per-era selling-club data lives in `data/curated-europe-<era>.ts`, merged into each
scenario's `*_SQUADS` record and listed in the scenario's `contextExtra`.

## Known residual tuning notes (not blockers)
- `milan-2007` and `dortmund-1997` still sack a passive manager when the club's real
  decline arrives / against an aspirational top-2 mandate. Faithful, but softening
  either to `expectedFinish: 3` would let passive play ride out the slump.
