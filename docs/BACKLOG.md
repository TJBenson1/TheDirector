# Backlog — queued ideas

Deferred items, captured so they aren't lost. Not yet built.

## Full realistic era databases (ongoing mission)
Goal: every era world has real, recognisable squads at every relevant club, plus
complete ledgers. How the data layer works (see `state.ts::populateSquads`):
`CURATED_SQUADS[scenarioId][clubId]` → real seeds; procedural filler tops each
squad to 23; a foreign context club's strength becomes squad-derived once curated.

**Progress:** user-club leagues are well curated. Host-club pass done for AC Milan
('04 + '13), Barcelona '04, Real Madrid '04, Real Betis '99 (see below). Most
OTHER European context clubs are still stubs (1–2 players) or absent.

**Approach that works (proven this round):** fan out one research agent per
club-season (web-verify birth years / positions / squad membership), return data
in the exact `q(...)` seed format with era-suffixed ids, then integrate + wire
into the scenario `contextExtra` and the `_SQUADS` registry + add any lost/fragile
`latentCeiling` flags. Calibration only runs `man-utd-1999`, so curating any club
outside that world is calibration-safe.

**Priority queue (per era):**
- **era-2004:** deepen Juventus, Bayern, Chelsea, Porto, Valencia, Lyon, Atlético
  to full squads; add the real 2004–09 ledger for the new European clubs.
- **era-2013:** deepen Bayern, PSG, Juventus, Roma; add Serie A/ Bundesliga ledger.
- **era-1998 (Serie A):** deepen Roma, Fiorentina, Parma, Lazio beyond marquee names.
- **1999 world:** flesh out La Liga (Depor, Valencia, Celta) + Serie A selling clubs.
- **Cross-cutting:** real transfer ledgers + retirements for every newly-curated
  club so a passive career reproduces their real history, not a frozen 1998 squad.

## Lost-talent profile expansion
More real under-achievers to curate with a `latentCeiling` (the reverse
reality-rail gamble — see `development.ts` / DESIGN docs):

- ✅ **Done:** Anderson, Reyes, Woodgate, Diouf, Alan Smith, Welbeck, Wes Brown,
  Januzaj, James Wilson (earlier). Now added: **Ravel Morrison** (West Ham '13,
  signable), **Adriano** (Inter '98 academy — the tragic arc, latent 94),
  **Quaresma** ('04), **Bendtner/Nani/Barkley/Deulofeu** ('13), **Phil Jones**
  ('13 — "best-ever" hype wrecked by injuries, latent 89), **Nicola Ventola**
  (Inter '98 — knee injuries broke up a real talent, latent 87). King, Hargreaves,
  Jones and Ventola are fragile-AND-lost talents (manage the body to unlock).
- ✅ **Hosts curated + landed (this round):** Full realistic squads added for the
  host clubs, which lands all five: **Pato** (Milan '04 pack, breaks through 2008,
  latent 92), **Bojan** (Barcelona '04 pack, La Masia graduate 2007, latent 89),
  **Robinho** (Real Madrid '04, latent 90), **Balotelli** (AC Milan '13, latent
  94), **Denílson** (Real Betis, esp-1 scenarios, latent 89). Bonus fragile-lost
  talents from the same squads: **Woodgate** (Madrid '04, latent 86), **El
  Shaarawy** (Milan '13, latent 88).
- **Still to do:** Freddy-Adu-class hype busts; Denílson-tier world-record flops in
  other eras; a "cautionary tier" (below).
- **NOT lost talents (do not add here):** Kaká — won the Ballon d'Or, FIFA World
  Player, a Champions League and Scudetto; he *reached* his ceiling. His only
  counterfactual is the injury-cut Real Madrid spell, which is the fragile-star /
  injury-management system (a broken-down *peak*), not unrealised potential. Keep
  the two mechanics distinct: lost talent = a young ceiling never reached; fragile
  star = an established peak the body cut short.
- **General:** a "cautionary tier" of high-latent / high-bust talents where the
  smart play is often NOT to gamble — so the mechanic rewards judgement, not just
  minutes.

## "Almost happened" (near-miss) ledger
Real, well-documented deals that collapsed or were passed up — offered to the
user as a counterfactual (`NearMissEntry` in `ledger.ts`, executed in
`ledgerExec.ts::executeNearMisses`). Doing nothing reproduces history.

- ✅ **Done (mechanism + first entries):** the type + decision flow (near-miss-in
  / near-miss-out, `realTo` sends him to his real club on a pass, AI-only resolves
  to reality silently). Seeded: **Batistuta** (Inter chased him; Roma really got
  him, 2000), **Fàbregas** & **Baines** (the Moyes-2013 bids United bottled; both
  stayed put). Verified end-to-end (`harness/src/moyesNearMiss.ts`).
- **Still to do:**
  - **Bale (→ Madrid) and Thiago (→ Bayern)** as Moyes near-misses. Both already
    have a real ledger move, so a near-miss would double-process them. Needs the
    near-miss to CLAIM a player who also has a ledger entry: suppress/defer his
    ledger move while the near-miss is pending, and on a pass reproduce it
    (including realising the funder id for `enabledBy` chains, e.g. Özil).
  - **Gerrard → Chelsea (2005)** for a Liverpool save; **Alonso → Arsenal (2004)**;
    Real Madrid galáctico near-misses (real-madrid-2000).
  - An **AI-club butterfly** option: let a deprived rival occasionally COMPLETE a
    near-miss it really bottled (currently AI near-misses always hold reality).

## Hand-played Reyes career (arsenal-2004)
Run an interactive `pnpm play arsenal-2004` career that deliberately centres
José Antonio Reyes (latent 90, flaky) — give him the minutes, ride the gamble,
and narrate whether he becomes the Highbury star or busts. A showcase of the
lost-talent strategy played live rather than in the harness.
