# Backlog — queued ideas

Deferred items, captured so they aren't lost. Not yet built.

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
- **Still to do:** Robinho (hyped "next Pelé", never generational), Alexandre Pato
  (the definitive Milan wonderkid wrecked by injuries), Bojan (La Masia prodigy,
  pressure/anxiety), Balotelli (Adriano-class temperament waste), Denílson
  (world-record flop), Freddy-Adu-class hype busts.
  - **Blocker:** these all played at clubs NOT yet curated in any era world at the
    age they were young (Pato/Balotelli → Milan '08–'13; Bojan → Barça '07;
    Robinho → Santos/Madrid '05; Denílson → Betis '98). Adding them needs those
    clubs curated (or an academy-graduate seed) in an era where the player is ≤23
    — otherwise the latent window (age ≤23) never opens. Curate the host club
    first, then add the profile.
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
