# Backlog — queued ideas

Deferred items, captured so they aren't lost. Not yet built.

## Full realistic era databases (ongoing mission)
Goal: every era world has real, recognisable squads at every relevant club, plus
complete ledgers. How the data layer works (see `state.ts::populateSquads`):
`CURATED_SQUADS[scenarioId][clubId]` → real seeds; procedural filler tops each
squad to 23; a foreign context club's strength becomes squad-derived once curated.

**Recruitment depth (✅ mechanic + first mid-clubs).** Procedural filler is now
SIGNABLE as depth (`recommend.ts`), so recruitment reaches beyond the famous few
to every club and down the leagues — a Man Utd '99 user can sign a serviceable RB
from Aston Villa / Sunderland / anywhere. On top of that, real names were curated
for the English mid clubs the DB had left empty: **West Ham '99** (Di Canio,
Lampard, Joe Cole, Foé, Berkovic…), **Everton '99** (Materazzi, Dacourt, Ferguson,
Jeffers, Dunne…), **Southampton '99** extended (Beattie, Pahars, Lundekvam…).
Still to do: curate **Leverkusen / Sevilla / Villarreal** and more mid clubs in
the 2004/2009/2013 worlds (the mechanic already makes their filler signable).

**Progress:** user-club leagues are well curated. Host-club pass done for AC Milan
('04 + '13), Barcelona '04, Real Madrid '04, Real Betis '99. Context-deepening
round 1 done: **era-2004** Juventus (new), Bayern, Porto, Valencia, Lyon, Monaco
now have full real squads; **1999 La Liga** Valencia and Deportivo added. That
surfaced a batch of new lost/fragile talents (Deisler, Carlos Alberto, Vicente,
Aimar, Saviola, Mendieta, Gerard López, Djalminha, Valerón, Tristán). Priority
eras per user: 1999, 2004, 2009, 2013 first; 1995 / late-2010s / 2020s last.

**Known follow-ons (data fidelity):**
- ✅ **era-2009 established + deepened** — bayern-2009 "Van Gaal reset" on a real
  18-team Bundesliga (season length now derives from club count). **14 of 18
  Bundesliga clubs fully curated** (Bayern, Wolfsburg, Schalke, Bremen, Dortmund,
  Stuttgart, Hamburg, Leverkusen, Hoffenheim, Gladbach, Köln, Hannover, Frankfurt,
  Mainz) + the CR7/Kaká Real Madrid as context. **era-2009 ledger live**: Özil/
  Khedira→Madrid, Džeko→City, Şahin/Vidal/Barzagli sold on, Podolski→Arsenal,
  Reus→Dortmund — and the real Bayern buys (Neuer, Boateng, Kroos, Gustavo, Dante)
  offered to the user as decisions. + retirements + Götze (Dortmund '10 academy,
  latent). Still to do for 2009:
  - the **bottom-4 Bundesliga clubs** (Freiburg, Hertha, Nürnberg, Bochum) —
    currently procedural.
  - **more European context**: Barça treble, Mourinho's Inter (2010 treble), Man
    City post-takeover, Chelsea (Ancelotti double), Man Utd post-CR7, Juventus.
  - **era-2009 injuries** (Kaká's knee is flagged via proneness, but real dated
    injuries aren't in the pack yet).
- Add the real transfer ledgers for the newly-curated clubs so a passive career
  reproduces their history: the **2006 Calciopoli Juventus exodus** (Cannavaro/
  Emerson→Madrid, Thuram/Zambrotta→Barça, Ibrahimović→Inter), Porto's onward
  sales (Pepe→Madrid '07, Diego→Bremen '06, Maniche/Costinha→Dynamo Moscow), the
  2000-01 Valencia/Depor breakups, Makaay→Bayern '03. Without these they sit as
  frozen squads.
- David Villa isn't placed in era-2004 (he was at Zaragoza in '04-05; Zaragoza
  isn't curated). Add Zaragoza, or seed Villa on his 2005 move.

**Approach that works (proven this round):** fan out one research agent per
club-season (web-verify birth years / positions / squad membership), return data
in the exact `q(...)` seed format with era-suffixed ids, then integrate + wire
into the scenario `contextExtra` and the `_SQUADS` registry + add any lost/fragile
`latentCeiling` flags. Calibration only runs `man-utd-1999`, so curating any club
outside that world is calibration-safe.

**Priority queue (per era):**
- **era-2004:** deepen Juventus, Bayern, Chelsea, Porto, Valencia, Lyon, Atlético
  to full squads (✅ mostly done); add the real 2004–09 ledger for the new
  European clubs (Calciopoli exodus etc.).
- ✅ **era-2013 European context done:** Juventus, PSG, Roma, Benfica, Ajax,
  Valencia, West Ham now deep real squads; 2013 ledger extended (Matić→Chelsea,
  Blind→United as a user signing, Benatia→Bayern, Mathieu→Barça, Marković→
  Liverpool, Ménez→Milan, Pjanić→Juve). Lost talents: Pastore, Ménez, Giovinco,
  Destro, Ljajić, Marković, Cavaleiro, Fischer, Banega, Carroll, Bojan(-loan).
  Remaining 2013: real injuries pack; deepen Bayern (12→full).
- **era-1998 (Serie A):** deepen Roma, Fiorentina, Parma, Lazio beyond marquee names.
- **1999 world:** flesh out La Liga (Depor, Valencia, Celta) + Serie A selling clubs.
- **Cross-cutting:** real transfer ledgers + retirements for every newly-curated
  club so a passive career reproduces their real history, not a frozen 1998 squad.

## Capitalising on the food chain / clubs in distress (✅ model built)
The user can now pick apart smaller/distressed clubs:
- **Food-chain discount** (`recommend.ts` askingPrice + `step-up` tag): a much
  bigger club is a magnet, and a smaller "selling club" is a motivated seller —
  ~1.8%/prestige-point off (Arsenal→Porto ≈ 13%), capped ~32%, stacking on any
  distress cut. Willingness already rewards "moving up".
- **Scheduled financial shocks** (`FinancialShock` on the era pack, applied at the
  rollover): **Calciopoli drops Juventus into crisis in 2006** — a cheap, raidable
  fire-sale (Del Piero ~£1.5m). Reusable for Leeds/Parma/etc.
- **Porto sell-off** ledgered TWICE, so both eras can raid it:
  - **era-2004** (Nuno Valente→Everton '05, Pepe→Madrid '07, Bosingwa→Chelsea '08).
  - ✅ **era-2001** (`liverpool-2001`): the full Mourinho side is now a curated,
    raidable feeder club (prestige 72) — **Deco, Ricardo Carvalho, Paulo
    Ferreira, Costinha, Maniche, Baía, Postiga…** — and the real 2004 break-up is
    ledgered (**Deco→Barça**, **Carvalho & Ferreira→Chelsea**, the Chelsea legs
    gated on the Abramovich takeover). The user's literal example works: pick
    Deco/Carvalho off in 2002–03 at a food-chain discount + `step-up` tag,
    BEFORE the 2004 CL win sends the giants after them. Passive career = the
    real raid happens TO you.
- Injuries packs added: **INJURIES_2004** (Woodgate's wrecked Madrid season,
  Hargreaves' knee) and **INJURIES_2009** (Kaká's knee, Robben's hamstring).
- ✅ **Loyalty-aware fire-sales:** a club's distress no longer dangles its LOYAL
  icons as cheap bargains — Del Piero/Buffon/Nedvěd/Trézéguet followed Juve down
  to Serie B, so an `openness` factor (from clubLoyalty) cancels the fire-sale /
  food-chain discount for a one-club man (tagged `one-club-man`, not `fire-sale`).
  The bargains are the LOWER-loyalty squad players a distressed club really lets go.
- **Still to do:** more financial shocks (Leeds 2004, Parma/Parmalat 2004,
  Rangers 2012); injuries packs for 2013/2001; Porto's other onward sales
  (Postiga→Spurs '03, Costinha/Maniche→Dynamo '05) once those clubs are curated.
  - ✅ **The "gettable but overlooked" data** (user ask) — two of the three built:
    - **Leeds** (`liverpool-2001`): the "living the dream" collapse is now a
      scheduled shock (strained '02 → crisis '03) plus the real fire-sale ledger
      (Ferdinand→United £30m, Woodgate & Bowyer→Newcastle, Smith→United, and
      **Kewell→Liverpool ~£5m** as the user's own real-in). Beat reality's raiders
      and it's your discount fire-sale.
    - **Parma** (`arsenal-2004`): Parmalat's fraud collapsed them, so Parma starts
      in **crisis** (`distressedClubs`) with a curated squad. The jewel is a
      22-year-old **Gilardino** — a raider gets him for ~£6.7m in 2004 (fire-sale +
      step-up) before Milan really paid ~£19m in 2005; the onward sale is ledgered.
    - ✅ **Fiorentina** (`liverpool-2001`): their real 2001–02 squad curated (the
      last season before the Cecchi Gori bankruptcy), crisis from 2002 — Chiesa,
      Nuno Gomes and a young **Adriano** (loan, latent 93) are raidable, while
      loyal captain **Di Livio** (who followed them down to Serie C2) is shielded.

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

## The head coach — Director vs Manager (✅ politics MVP built)
The player IS the Director; the head coach is a hired agent (`manager.ts`,
`ManagerState`). Built this pass:
- **Inherited real coaches** at kickoff (Ferguson '99, Houllier '01, Wenger '04/'96,
  Van Gaal '09/bar-99, Moyes '13, Ranieri '03, Del Bosque '00, Simoni '98).
- **Hire & fire:** `directorSackManager` (proactive, any time) → caretaker + a
  wooable hire shortlist; sacking a well-regarded coach costs Director credibility,
  a failing one is accepted.
- **Differentiated thresholds:** the coach's `standing` erodes FASTER than board
  patience (−11/place vs −9) and trips a board-pressure "sack him?" decision at a
  higher floor — the coach is blamed first. Director dismissal stays rarer
  (`board.ts` unchanged) — measured **4.0%** (was 2.7%), still in band.
- **Survive a sacking (lightning rod):** sacking the coach restores Director
  patience; **×0.4 if the Director appointed him** (you own that hire).
- **Director fired WITHOUT a coach sacking (rare):** `reviewDirectorStrategy` —
  a board strategy rejection (patience < 42) or a powerful, estranged manager's
  boardroom **coup** (reputation ≥ 84, relationship < 28).
- **Wooing:** a marquee coach snubs a cold offer; `courtManager` ("speak to his
  people") warms him until he'll take the job.
- ✅ **The coach may resist a directive** (`issueDirective`): the coach picks the
  XI by ability, so a Director who wants to blood a benched prospect (a `minutes`
  directive — the develop-him / unlock-latent lever) or protect a fragile star (a
  `load` directive) may be pushed back on. Resistance rises with the coach's
  reputation, a poor relationship, and how much it fights winning football; a
  coach you hired complies more readily. A resisted directive is a confrontation:
  DEFER, or OVERRULE (it takes effect, at a cost to his goodwill and standing —
  overrule a big name too often and he may win a boardroom coup). Honoured
  directives override `estimateMinutesShare` and ease a managed body's proneness.
- **Calibration-safe:** every added decision puts the reality-default option
  FIRST (the passive first-choice bot backs the coach), so the baseline is
  unperturbed; 215 tests + calibration 14/14.
- ✅ **On-pitch effect (`managerStrengthMod` / `managerDevMod`):** the coach's
  calibre now nudges MATCH STRENGTH and youth development — but **anchored to
  `parReputation`** (the coach reality gave the club), so keeping the inherited
  coach is exactly neutral (0 strength / ×1 dev) and the passive path is
  byte-identical → no re-tuning needed. Asymmetric ([−7, +4] strength): a marquee
  upgrade sharpens the side a little, a caretaker/mismatch drags it a lot.
  Verified end-to-end: over 16 seeds × ~6 seasons of man-utd-2013, the par coach
  wins 7 user titles, a −7 caretaker 0.
- ✅ **Management style — real archetypes** (`ManagerStyle`, `coachStyle`):
  Mourinho is Mourinho, Pep is Pep. Every coach carries a signature style on two
  axes (possession ↔ pragmatic, youth ↔ win-now): Pep {0.98, 0.75}, Mourinho
  {0.2, 0.2}, Wenger {0.8, 0.9}, Allardyce {0.2, 0.3}, Ferguson {0.5, 0.82}…
  Style bites through **squad fit** (`styleMatchAffinity`): a possession coach
  gets more from a MIDFIELD-strong squad, a pragmatist from DEFENCE + a counter —
  so the right appointment is squad-dependent. Also anchored to a `parStyle`
  baseline (0 when the inherited coach is kept → calibration-neutral) and folds a
  youth-emphasis term into development. Pep & Mourinho are hireable names.
  Verified: on a midfield-heavy squad Pep out-adds Allardyce (+4.8 str); on a
  defensive one Mourinho out-adds Pep (+3.4).
- ✅ **Era-real coach pool** (`COACH_POOL` with availability windows): the hire
  shortlist is now ERA-GATED to the current year, so a 2001 vacancy sees the real
  names in the frame (Eriksson, Capello, Hitzfeld, Lippi) and never a pre-Barça
  Pep (gated `from: 2008`). Added Ottmar Hitzfeld (a real 2002 United target).
- ✅ **Ferguson 2001 retirement counterfactual** (`rollManagerRetirement`, scripted
  for man-utd-1999): in 2001 the Director gets the call reality's board didn't
  force — Sir Alex is weighing retirement (framed "on a high" or "the team needs
  rebuilding" from where United actually sit). **Talk him round with a
  squad-building plan and he stays, as he did** (reality-default → calibration
  byte-identical), or let him bow out and appoint an era-real successor. Data-driven
  (`MANAGER_RETIREMENTS`) so more can be added (e.g. Wenger, Moyes-successor arcs).
- ✅ **More succession crossroads** (`MANAGER_CROSSROADS`, generalised): three
  flavours — RETIREMENT (Ferguson 2001, stayed), COURTED (Wenger 2007, stayed),
  PRESSURE (Moyes 2014, sacked). Doing nothing reproduces reality (so man-utd-1999
  stays byte-identical), and the counterfactual is the road not taken — back Moyes
  and give him the time United never did, or make the change and pick from the
  era-real 2014 pool (Van Gaal, Mourinho, Ancelotti…). Data-driven; add a row per
  arc.
- ✅ **Style ↔ player-type development** (`managerPositionDevMod`): position
  stands in for player type — a POSSESSION coach brings midfielders (and
  attackers) on faster and defenders slower than the coach the club had; a
  PRAGMATIST the reverse (Pep MID ×1.14 / DEF ×0.86; Mourinho the mirror).
  Anchored to par → 0-delta for a kept coach, calibration-inert.
- ✅ **Coach occupancy** (`COACH_JOBS`): the big names carry real job tenures, so a
  coach under contract elsewhere (Pep at Bayern in 2013–16) is a "stretch" target
  the shortlist flags as "under contract, hard to prise" and that needs
  materially harder wooing than one out of work.
- **Still to do (deferred by design):**
  - **Manager tenure narrative:** trophies/relationships accruing to a coach's
    reputation; a sacked big name resurfacing at a rival.
  - ✅ **Richer player attributes — Phase 1 shipped** (`attributes.ts`; see
    `docs/DESIGN-player-attributes.md`): an 8-attribute vector derived on demand
    from `ability` + archetype, so it's calibration-inert (14/14 byte-identical).
    Style-fit and player-type development now read real attributes, not position;
    scouting returns per-attribute ranges. **Phase 2 started**: ~58 marquee players
    tagged with real archetypes (Beckham a crosser, Cannavaro/Pirlo re-typed, etc.)
    + 3 new archetypes; the long tail keeps position defaults until tagged (pure,
    incremental data). **Phase 3** (optional) — make the vector authoritative and
    derive `ability` from it.

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
