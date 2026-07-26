/**
 * Reality-default contracts (see docs/DESIGN-reality-default.md).
 *
 * TYPE SEAMS ONLY at this stage — the data is populated per era pack when the
 * Rival AI (M8) and academy (M9) land. Defined now so those milestones build
 * against a fixed contract rather than inventing an incompatible one.
 *
 * Principle 1: AI clubs execute their REAL transfers by default; autonomous
 * decision-making fires only when a ledger entry is invalidated, and every
 * butterfly is a traceable chain logged to `timeline.divergenceLog`.
 *
 * Principle 2: academy intakes and scoutable prospects are REAL players only;
 * procedural players (`curated === false`) are anonymous depth, excluded from
 * scouting, academy and narrative.
 */

import type { ClubId, GameState, PlayerId, YearMonth } from './types.js';
import type { CuratedSeed } from './data/curated-1999.js';
import { GRADUATES_1999, INTAKES_1999 } from './data/curated-graduates-1999.js';
import { GRADUATES_ESP, INTAKES_ESP } from './data/curated-graduates-esp.js';
import { GRADUATES_ITA, INTAKES_ITA } from './data/curated-graduates-ita.js';
import { GRADUATES_GER, INTAKES_GER } from './data/curated-graduates-ger.js';

/** One real historical transfer among tracked clubs. */
export interface RealTransferLedgerEntry {
  /**
   * Stable entry id. Optional — defaults to `${playerId}@${window}->${to}`.
   * Required only when a player has MORE THAN ONE real move in an era (Ronaldo:
   * Sporting→United→Real) or when something depends on this exact move via
   * `enabledBy`. This is the key tracked in meta.executedLedger/realizedLedger,
   * so a multi-move player is no longer collapsed to one entry.
   */
  id?: string;
  /** Curated player id (real player). */
  playerId: PlayerId;
  from: ClubId | null; // null = academy graduation / free arrival
  to: ClubId;
  /** The real window this happened in. */
  window: YearMonth;
  fee: number;
  /**
   * Causal link: this move only happened in reality BECAUSE another move did —
   * a sale to fund/clear space for an arrival. Value is the funder entry's `id`
   * (or default key). If that funder is pre-empted by the user (never executes
   * as reality), this entry is CANCELLED, not replaced: the club no longer needs
   * or can afford the move (keep Bale from Madrid and Özil stays; keep Ronaldo
   * at United and Madrid never offload Robben/Sneijder). Author the funder
   * earlier in the array so it is processed first.
   */
  enabledBy?: string;
  /**
   * Probability (0..1, default 1) that this entry is CANCELLED when its
   * `enabledBy` funder was pre-empted. < 1 models "they might still have done it
   * anyway for depth" — e.g. United losing the Ronaldo windfall probably but not
   * certainly cancels their fringe depth signings.
   */
  cancelChance?: number;
  /**
   * A LOCKED move: a Bosman or otherwise pre-agreed deal that was done months in
   * advance (McManaman's 1999 free to Real, agreed the previous January). It is
   * NOT contestable — no rival can hijack the player, the user cannot intercept or
   * block him, and a Bosman OUT of the user's own club cannot be kept (the
   * contract has already expired). It simply EXECUTES to its real destination.
   * Distinguishes these from genuinely live summer business a Director can gazump.
   */
  preAgreed?: boolean;
}

/**
 * A real LOAN — a TEMPORARY move that reverts to the parent club (Coutinho to
 * Bayern 2019-20, the Chelsea loan army). Kept as a SEPARATE record from the
 * permanent-transfer ledger because a loan must never be treated as a permanent
 * transfer: the player belongs to `parent`, plays at `to` for the loan spell, and
 * returns at `until`. Squad-fidelity and "at real club" checks judge a loanee by
 * his PARENT club, not the temporary host.
 *
 * NOTE: the record exists so later loan-heavy eras have somewhere accurate to put
 * this data; execution semantics (temporary move + scheduled return, judged by
 * parent) are wired when the first such era is seeded, against real data to verify.
 */
export interface RealLoanEntry {
  /** Curated player id (real player). */
  playerId: PlayerId;
  /** The club that OWNS him (he returns here). */
  parent: ClubId;
  /** The club he is loaned TO for the spell. */
  to: ClubId;
  /** When the loan begins. */
  window: YearMonth;
  /** When he reverts to `parent`. */
  until: YearMonth;
  /** Loan fee (0 for most). */
  fee?: number;
  /** A loan carrying an obligation/option that reality exercised — becomes a
   *  permanent transfer to `to` at `until` rather than a return to `parent`. */
  buyPermanent?: boolean;
}

/** The key an entry is tracked by (supports multiple moves per player). */
export function entryKey(e: RealTransferLedgerEntry): string {
  return e.id ?? `${e.playerId}@${e.window}->${e.to}`;
}

/**
 * If a player has a still-pending PRE-AGREED move away from his current club (a
 * Bosman/pre-contract done months ahead), return where he is bound. Such a player
 * is off the market — no one, the user included, can hijack a done deal — so this
 * gates every acquisition path (recommend/find/sign). Returns null for a normal,
 * genuinely contestable ledger subject (those stay hijackable — the whole point of
 * the counterfactual game). Import kept lightweight: reads only the era ledger and
 * the executed set.
 */
export function pendingPreAgreedMove(state: GameState, playerId: PlayerId): ClubId | null {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack) return null;
  const p = state.players[playerId];
  if (!p) return null;
  for (const e of pack.realTransferLedger) {
    if (!e.preAgreed) continue;
    if (e.playerId !== playerId) continue;
    if (e.from !== p.club) continue; // he has already moved on / not from here
    if (state.meta.executedLedger.includes(entryKey(e))) continue; // already done
    return e.to;
  }
  return null;
}

/** Which tier satisfied an invalidated ledger entry (recorded for audit). */
export type FallbackTier = 'near-miss' | 'real-backup' | 'profile-similar' | 'generic-needs';

/**
 * A transfer that ALMOST happened in reality — a club's documented real intent
 * that fell through (Chelsea's long pursuit of Gerrard, Barça's of Beckham). When
 * a butterfly denies that club a target, it turns to its near-miss FIRST, ahead of
 * any generic alternative — the deviation follows the grain of what nearly was
 * (§ butterfly showcase). Curated, so it overrides the ordinary "no raiding a
 * direct rival" caution: these moves were genuinely on the table.
 */
export interface NearMissEntry {
  /** Curated player id (real player) who almost made the move. */
  playerId: PlayerId;
  /** The club that ALMOST signed him. */
  to: ClubId;
  /** Roughly when the pursuit was live. */
  window: YearMonth;
  note?: string;
}

/** Why a ledger entry could not execute as in reality. */
export type InvalidationCause =
  | 'user-signed-target'
  | 'user-owns-seller-player'
  | 'chain-broken-by-user'
  | 'upstream-butterfly';

/** A real youth graduate surfaced into a club's academy at 17–18. */
export interface AcademyIntake {
  clubId: ClubId;
  year: number;
  /** Curated player id (real graduate). */
  playerId: PlayerId;
}

/** A real injury that happened in history — fired only if the player is still at
 *  the club he was at in reality (so injuries "match up", per feedback). */
export interface RealInjuryEntry {
  playerId: PlayerId;
  atClub: ClubId;
  since: YearMonth;
  months: number;
  serious: boolean;
  note?: string;
}

/** Per-era reality data. */
export interface EraRealityPack {
  realTransferLedger: RealTransferLedgerEntry[];
  academyIntakes: AcademyIntake[];
  realInjuries: RealInjuryEntry[];
  /** Moves that ALMOST happened — preferred targets when a butterfly deprives
   *  their club of a real signing (§ butterfly showcase). Optional. */
  nearMissLedger?: NearMissEntry[];
  /** Real LOANS (temporary moves that revert to the parent club). Kept separate
   *  from the permanent ledger so a loanee is never mistaken for a real transfer.
   *  Optional; execution wired when the first loan-heavy era is seeded. */
  realLoans?: RealLoanEntry[];
  /** The real next generation — curated seeds for players who break through
   *  mid-timeline (a Rooney in a 1999 start), instantiated at their debut window by
   *  `academyIntakes` so a long save is repopulated by real names, not just
   *  anonymous academy filler (§4, long-horizon fidelity). Optional. */
  academyGraduates?: CuratedSeed[];
}

/**
 * Near-misses of the mid-2000s — famous pursuits that fell through. If a butterfly
 * denies one of these clubs a real target, it turns HERE first: the alternate
 * history follows the grain of what genuinely nearly happened.
 */
const NEAR_MISS_2004: NearMissEntry[] = [
  // Chelsea chased Gerrard hard in 2004 and again in 2005; he stayed at Liverpool.
  { playerId: 'cur_gerrard3', to: 'chelsea', window: '2004-07', note: 'Chelsea pursued Gerrard; he stayed at Liverpool' },
  // Essien nearly joined Liverpool before Mourinho's Chelsea landed him.
  { playerId: 'cur_essien', to: 'liverpool', window: '2005-07', note: 'Liverpool were in for Essien before Chelsea' },
  // Chelsea's £30m bid for Rooney in 2004 was real; he chose United instead.
  { playerId: 'cur_rooney2', to: 'chelsea', window: '2004-07', note: 'Chelsea bid £30m for Rooney; he chose United' },
  // Both Real and Chelsea chased Robben out of PSV in 2004; Chelsea won the race.
  { playerId: 'cur_robben2', to: 'real_madrid', window: '2004-07', note: 'Real were in for Robben before Chelsea landed him' },
];

/** Near-misses of 2003: the summer the game turns on. */
const NEAR_MISS_2003: NearMissEntry[] = [
  // Laporta campaigned on signing Beckham for Barcelona; he chose Real Madrid.
  { playerId: 'cur_beckham_u', to: 'barcelona', window: '2003-07', note: "Barça's Laporta courted Beckham; he chose Real" },
];

/**
 * Near-misses of the early-2010s English boom (eng-2010, played from Liverpool's chair).
 * The user's own example: deny a rival its striker and it turns to the man it nearly
 * signed anyway — sign Agüero out from under City in 2011 and they go for Van Persie,
 * whom they circled before he chose United. (Agüero's real 2011 move to City is seeded
 * in LEDGER_ENG_2010 so there is a real signing for the Director to butterfly away.)
 */
const NEAR_MISS_ENG_2010: NearMissEntry[] = [
  { playerId: 'cur_van_persie_10', to: 'man_city', window: '2011-07', note: 'City circled Van Persie before he chose United' },
];

/**
 * Real transfers among tracked (non-user) clubs, 1999–2004 — a seed slice of the
 * full ledger (the complete curation is ongoing data work). Each subject player
 * is curated at his source club (data/curated-1999.ts) so the entry can execute
 * on schedule. The AI executes these by DEFAULT; a user action that invalidates
 * one triggers the fallback + a logged butterfly (§9f).
 */
const LEDGER_1999_2004: RealTransferLedgerEntry[] = [
  // United's real 1999 summer signings — OFFERED to a United Director as real-in
  // decisions in the opening window (execute by default if ignored), rather than
  // baked into the starting squad. Seeded at their selling clubs (Inter, Atlético).
  { playerId: 'cur_silvestre', from: 'inter', to: 'man_utd', window: '1999-07', fee: 4_000_000, id: 'silvestre-utd-1999' },
  { playerId: 'cur_fortune', from: 'atletico', to: 'man_utd', window: '1999-07', fee: 1_500_000, id: 'fortune-utd-1999' },
  // Van der Sar's real summer-1999 move out of Ajax — now a live deal a United (or
  // anyone) can gazump in the opening window, not a fait accompli (M12A/C).
  { playerId: 'cur_vandersar', from: 'ajax', to: 'juventus', window: '1999-08', fee: 5_000_000 },
  { playerId: 'cur_anelka', from: 'arsenal', to: 'real_madrid', window: '1999-08', fee: 22_000_000 },
  // McManaman's free to Real was agreed the previous January, with no English club
  // in the race — a done deal, not live summer business. Locked: not hijackable.
  { playerId: 'cur_mcmanaman', from: 'liverpool', to: 'real_madrid', window: '1999-08', fee: 0, preAgreed: true },
  { playerId: 'cur_overmars', from: 'arsenal', to: 'barcelona', window: '2000-07', fee: 25_000_000 },
  { playerId: 'cur_figo', from: 'barcelona', to: 'real_madrid', window: '2000-07', fee: 37_000_000 },
  { playerId: 'cur_redondo', from: 'real_madrid', to: 'milan', window: '2000-08', fee: 0 },
  { playerId: 'cur_campbell', from: 'spurs', to: 'arsenal', window: '2001-07', fee: 0 },
  // ── United's own real summer business 2000–2001 — live calls for the Director ──
  // Barthez was Ferguson's real answer to the post-Schmeichel keeper void (2000);
  // Verón the record British buy of 2001. Do nothing and each follows history.
  // (Stam's shock 2001 sale to Lazio is NOT a ledger move — it's the richer
  // `scripted:stam-exit` interrupt, the "back the boss or overrule him" decision.)
  { playerId: 'cur_barthez', from: 'monaco', to: 'man_utd', window: '2000-07', fee: 7_800_000, id: 'barthez-utd-2000' },
  { playerId: 'cur_veron', from: 'lazio', to: 'man_utd', window: '2001-07', fee: 28_100_000, id: 'veron-utd-2001' },
  { playerId: 'cur_rkeane', from: 'leeds', to: 'spurs', window: '2002-07', fee: 7_000_000 },
  { playerId: 'cur_ferdinand', from: 'leeds', to: 'man_utd', window: '2002-07', fee: 30_000_000 },
  { playerId: 'cur_woodgate', from: 'leeds', to: 'newcastle', window: '2003-01', fee: 9_000_000 },
  { playerId: 'cur_crespo', from: 'inter', to: 'chelsea', window: '2003-07', fee: 16_800_000 },
  { playerId: 'cur_shevchenko', from: 'milan', to: 'chelsea', window: '2006-07', fee: 30_000_000 },
  { playerId: 'cur_owen', from: 'liverpool', to: 'real_madrid', window: '2004-07', fee: 8_000_000 },
  { playerId: 'cur_nedved', from: 'lazio', to: 'juventus', window: '2001-07', fee: 41_000_000 },

  // ── The galáctico era (real-madrid-2000 start point) ────────────────────────
  // Figo (above) then a marquee a year: Zidane, Ronaldo, Beckham (below). The
  // pragmatic pivot is Makélélé — sold in 2003 to help fund the Beckham galáctico
  // window, unbalancing the midfield. Keep him instead and history diverges.
  { playerId: 'cur_zidane', from: 'juventus', to: 'real_madrid', window: '2001-07', fee: 46_000_000, id: 'zidane-real-2001' },
  { playerId: 'cur_ronaldo', from: 'inter', to: 'real_madrid', window: '2002-08', fee: 30_000_000, id: 'ronaldo-real-2002' },
  { playerId: 'cur_makelele', from: 'real_madrid', to: 'chelsea', window: '2003-08', fee: 16_000_000, id: 'makelele-chelsea-2003' },

  // ── The Cristiano Ronaldo arc + the 2009 galáctico cascade ──────────────────
  // A long-horizon chain that only bites a 1999 playthrough that reaches 2009.
  // Ronaldo joins United in 2003 (a signing the user makes by default) and is
  // sold to Madrid in 2009 (a sale the user sanctions by default). Madrid funded
  // that galáctico window by offloading Robben and Sneijder — the pieces that
  // built Bayern's and, above all, Inter's 2010 treble side. Keep Ronaldo and
  // none of it happens: Madrid never sign him, never sell Robben/Sneijder, and
  // Inter's treble talisman never arrives.
  // Beckham's real 2003 exit is what opened the wing for Ronaldo — a sale the
  // user sanctions by default, and the reason the kid gets the minutes to grow.
  { playerId: 'cur_beckham', from: 'man_utd', to: 'real_madrid', window: '2003-07', fee: 25_000_000, id: 'beckham-real-2003' },
  { playerId: 'cur_cristiano', from: 'sporting', to: 'man_utd', window: '2003-07', fee: 12_240_000, id: 'cr7-utd-2003' },
  // The Ronaldinho gambit: his real 2003 move to Barça, live for a United side
  // playing forward from 1999 to hijack (the counterfactual that was once its own
  // 2003 start point). Left alone, Barça sign him as reality.
  { playerId: 'cur_ronaldinho', from: 'psg', to: 'barcelona', window: '2003-07', fee: 30_000_000, id: 'ronaldinho-barca-2003' },
  { playerId: 'cur_cristiano', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cr7-real-2009' },
  { playerId: 'cur_robben', from: 'real_madrid', to: 'bayern', window: '2009-08', fee: 25_000_000, enabledBy: 'cr7-real-2009' },
  { playerId: 'cur_sneijder', from: 'real_madrid', to: 'inter', window: '2009-08', fee: 15_000_000, enabledBy: 'cr7-real-2009' },
  // United reinvested some of the Ronaldo money on depth — probably, not surely.
  { playerId: 'cur_valencia_w', from: 'wigan', to: 'man_utd', window: '2009-06', fee: 16_000_000, id: 'valencia-utd-2009', enabledBy: 'cr7-real-2009', cancelChance: 0.5 },
  // Gap-sweep: Van Nistelrooy's 2001 arrival and his 2006 move to Madrid. (Stam's
  // exit is intentionally NOT here — it is already the `stam-exit` scripted event,
  // a user choice; a ledger entry would pre-empt and skip it.)
  { playerId: 'cur_ruud', from: 'psv', to: 'man_utd', window: '2001-07', fee: 19_000_000, id: 'ruud-utd-2001' },
  { playerId: 'cur_ruud', from: 'man_utd', to: 'real_madrid', window: '2006-07', fee: 14_000_000 },
  // ── Academy graduates' real onward moves ──
  // The home-grown players seeded by INTAKES_1999 don't stay put: their real
  // transfers execute by default, so a Carrick ends up at United, a Henderson at
  // Liverpool, an O'Shea drifts to Sunderland — reality, not a frozen debut club.
  // (`from` matches where each sits at the time, so sequential moves chain.)
  { playerId: 'cur_carrick_grad', from: 'west_ham', to: 'spurs', window: '2004-07', fee: 3_500_000 },
  { playerId: 'cur_carrick_grad', from: 'spurs', to: 'man_utd', window: '2006-07', fee: 18_600_000, id: 'carrick-utd-2006' },
  { playerId: 'cur_defoe_grad', from: 'west_ham', to: 'spurs', window: '2004-01', fee: 7_000_000 },
  { playerId: 'cur_g_johnson_grad', from: 'west_ham', to: 'chelsea', window: '2003-07', fee: 6_000_000 },
  { playerId: 'cur_lennon_grad', from: 'leeds', to: 'spurs', window: '2005-07', fee: 1_000_000 },
  { playerId: 'cur_a_johnson_grad', from: 'middlesbrough', to: 'man_city', window: '2010-01', fee: 7_000_000 },
  { playerId: 'cur_downing_grad', from: 'middlesbrough', to: 'aston_villa', window: '2009-07', fee: 12_000_000 },
  { playerId: 'cur_downing_grad', from: 'aston_villa', to: 'liverpool', window: '2011-07', fee: 20_000_000 },
  { playerId: 'cur_carroll_grad', from: 'newcastle', to: 'liverpool', window: '2011-01', fee: 35_000_000 },
  { playerId: 'cur_henderson_grad', from: 'sunderland', to: 'liverpool', window: '2011-06', fee: 16_000_000, id: 'henderson-lfc-2011' },
  { playerId: 'cur_rodwell_grad', from: 'everton', to: 'man_city', window: '2012-08', fee: 12_000_000 },
  { playerId: 'cur_oxlade_grad', from: 'southampton', to: 'arsenal', window: '2011-08', fee: 12_000_000 },
  { playerId: 'cur_lallana_grad', from: 'southampton', to: 'liverpool', window: '2014-07', fee: 25_000_000 },
  { playerId: 'cur_shaw_grad', from: 'southampton', to: 'man_utd', window: '2014-06', fee: 30_000_000, id: 'shaw-utd-2014' },
  { playerId: 'cur_oshea_grad', from: 'man_utd', to: 'sunderland', window: '2011-07', fee: 4_000_000 },
  // ── United's real 2007-2011 arrivals — OFFERED to a United Director (real-in) ──
  // Fills the mid/late-2000s gap so a long 1999 save keeps being presented real
  // signings (Nani, Anderson, Hargreaves in the '07 rebuild; Berbatov '08; De Gea
  // '11). Each subject debuts at his source club via INTAKES_1999; declining any
  // simply diverges from history. `from` matches where INTAKES_1999 seeds him.
  { playerId: 'cur_nani_grad', from: 'sporting', to: 'man_utd', window: '2007-07', fee: 17_000_000, id: 'nani-utd-2007' },
  { playerId: 'cur_anderson_grad', from: 'porto', to: 'man_utd', window: '2007-07', fee: 20_000_000, id: 'anderson-utd-2007' },
  { playerId: 'cur_hargreaves_grad', from: 'bayern', to: 'man_utd', window: '2007-07', fee: 17_000_000, id: 'hargreaves-utd-2007' },
  { playerId: 'cur_berbatov_grad', from: 'spurs', to: 'man_utd', window: '2008-07', fee: 30_750_000, id: 'berba-grad-utd-2008' },
  { playerId: 'cur_degea_grad', from: 'atletico', to: 'man_utd', window: '2011-07', fee: 18_900_000, id: 'degea-utd-2011' },
];

/** Real injuries of the era — fire only if the player is at his real club. */
const INJURIES_1999: RealInjuryEntry[] = [
  { playerId: 'cur_ruud', atClub: 'psv', since: '2000-04', months: 8, serious: true, note: 'ruptured knee ligaments (delayed his real move a year)' },
  { playerId: 'cur_owen', atClub: 'liverpool', since: '1999-04', months: 4, serious: false, note: 'hamstring trouble' },
  { playerId: 'cur_woodgate', atClub: 'leeds', since: '2001-08', months: 6, serious: true, note: 'recurrent injury problems' },
];

/**
 * Real 2013–16 transfers among tracked clubs — the post-Ferguson slice. Entries
 * whose destination is the user's club (Fellaini 2013; Di María / Shaw 2014) are
 * consumed silently by the executor, so a user who declines them simply never
 * makes those signings — exactly the "no Fellaini, no Van Gaal signings" path.
 */
const LEDGER_2013_2016: RealTransferLedgerEntry[] = [
  { playerId: 'cur_bale', from: 'spurs', to: 'real_madrid', window: '2013-08', fee: 85_000_000, id: 'bale-real-2013' },
  { playerId: 'cur_james_13', from: 'monaco', to: 'real_madrid', window: '2014-07', fee: 63_000_000, id: 'james-real-2014' },
  { playerId: 'cur_thiago', from: 'barcelona', to: 'bayern', window: '2013-07', fee: 22_000_000 },
  // Madrid only sold Özil to raise/clear the Bale money — no Bale, no Özil sale.
  { playerId: 'cur_ozil', from: 'real_madrid', to: 'arsenal', window: '2013-08', fee: 42_000_000, enabledBy: 'bale-real-2013' },
  { playerId: 'cur_fellaini', from: 'everton', to: 'man_utd', window: '2013-08', fee: 27_500_000 },
  // Spurs' rebuild was funded by SELLING Bale for a huge fee — which happens
  // whether he joins Madrid or you, so the Magnificent Seven arrive regardless.
  { playerId: 'cur_lamela', from: 'roma', to: 'spurs', window: '2013-08', fee: 26_000_000 },
  { playerId: 'cur_soldado', from: 'valencia', to: 'spurs', window: '2013-08', fee: 26_000_000 },
  { playerId: 'cur_eriksen', from: 'ajax', to: 'spurs', window: '2013-08', fee: 11_500_000 },
  // The rest of the Magnificent Seven, from their (thin) selling clubs — all live.
  { playerId: 'cur_paulinho_13', from: 'corinthians', to: 'spurs', window: '2013-07', fee: 17_000_000, id: 'paulinho-spurs-2013' },
  { playerId: 'cur_capoue_13', from: 'toulouse', to: 'spurs', window: '2013-08', fee: 9_000_000, id: 'capoue-spurs-2013' },
  { playerId: 'cur_chadli_13', from: 'twente', to: 'spurs', window: '2013-07', fee: 7_000_000, id: 'chadli-spurs-2013' },
  { playerId: 'cur_chiriches_13', from: 'steaua', to: 'spurs', window: '2013-08', fee: 8_500_000, id: 'chiriches-spurs-2013' },
  { playerId: 'cur_suarez', from: 'liverpool', to: 'barcelona', window: '2014-07', fee: 65_000_000, id: 'suarez-barca-2014' },
  // Barça part-funded Suárez by selling Sánchez — no Suárez, no Sánchez sale.
  { playerId: 'cur_alexis', from: 'barcelona', to: 'arsenal', window: '2014-07', fee: 35_000_000, enabledBy: 'suarez-barca-2014' },
  { playerId: 'cur_dimaria', from: 'real_madrid', to: 'man_utd', window: '2014-08', fee: 59_700_000 },
  { playerId: 'cur_lukeshaw', from: 'southampton', to: 'man_utd', window: '2014-06', fee: 30_000_000 },
  { playerId: 'cur_lallana', from: 'southampton', to: 'liverpool', window: '2014-07', fee: 25_000_000 },
  // Gap-sweep: United's marquee post-2013 business (Mata, a free Zlatan, the record
  // Pogba, Lukaku; Rooney home to Everton) and Spurs' Walker sale to City.
  { playerId: 'cur_mata', from: 'chelsea', to: 'man_utd', window: '2014-01', fee: 37_000_000 },
  { playerId: 'cur_ibrahimovic', from: 'psg', to: 'man_utd', window: '2016-07', fee: 0 },
  { playerId: 'cur_pogba', from: 'juventus', to: 'man_utd', window: '2016-08', fee: 89_000_000 },
  { playerId: 'cur_lukaku', from: 'everton', to: 'man_utd', window: '2017-07', fee: 75_000_000 },
  { playerId: 'cur_rooney', from: 'man_utd', to: 'everton', window: '2017-07', fee: 0 },
  { playerId: 'cur_kwalker', from: 'spurs', to: 'man_city', window: '2017-07', fee: 50_000_000 },
  // ── Post-Ferguson youth, seeded at their real selling clubs so the engine can
  //    grow them into the players who actually rebuilt United. ──
  { playerId: 'cur_martial_13', from: 'monaco', to: 'man_utd', window: '2015-09', fee: 36_000_000, id: 'martial-utd-2015' },
  { playerId: 'cur_bruno_f_13', from: 'sporting', to: 'man_utd', window: '2020-01', fee: 47_000_000, id: 'bruno-utd-2020' },
  // ── Son Heung-min, seeded young at Leverkusen, follows his real 2015 move to Spurs
  //    — the wide forward of Pochettino's front line. ──
  { playerId: 'cur_son_13', from: 'leverkusen', to: 'spurs', window: '2015-08', fee: 22_000_000, id: 'son-spurs-2015' },
];

/** Real 2013–14 injuries — fire only if the player is at his real club. */
const INJURIES_2013: RealInjuryEntry[] = [
  { playerId: 'cur_vanpersie', atClub: 'man_utd', since: '2013-11', months: 3, serious: false, note: 'thigh and toe trouble disrupt his season' },
  { playerId: 'cur_wilshere', atClub: 'arsenal', since: '2014-03', months: 3, serious: false, note: 'fractured foot' },
  { playerId: 'cur_sturridge', atClub: 'liverpool', since: '2014-09', months: 5, serious: true, note: 'recurrent thigh/calf injuries' },
];

/**
 * Real 2004–09 transfers for the Invincibles era pack. Arsenal's real story is
 * one of SELLING the spine (Vieira 2005, Cole 2006, Henry 2007) and going frugal
 * for the Emirates move. Each is a from-user decision the player can refuse — the
 * aggressive-build counterfactual keeps them. A couple of context moves colour
 * the rest of the world (the Cole↔Gallas swap; United cashing in on Ronaldo).
 */
const LEDGER_2004_2009: RealTransferLedgerEntry[] = [
  // Arsenal's real 2004 arrival — Van Persie from Feyenoord (a live signing for an
  // Arsenal Director).
  { playerId: 'cur_rvp', from: 'feyenoord', to: 'arsenal', window: '2004-07', fee: 2_750_000, id: 'rvp-arsenal-2004' },
  // Chelsea's real 2004 arrivals — at their source clubs, joining via the ledger,
  // so intercepting one is a butterfly and a deprived Chelsea buys an alternative.
  { playerId: 'cur_drogba', from: 'marseille', to: 'chelsea', window: '2004-07', fee: 24_000_000, id: 'drogba-chelsea-2004' },
  { playerId: 'cur_robben2', from: 'psv', to: 'chelsea', window: '2004-07', fee: 12_000_000, id: 'robben-chelsea-2004' },
  { playerId: 'cur_vieira2', from: 'arsenal', to: 'juventus', window: '2005-07', fee: 13_750_000, id: 'vieira-juve-2005' },
  { playerId: 'cur_acole', from: 'arsenal', to: 'chelsea', window: '2006-07', fee: 16_000_000, id: 'cole-chelsea-2006' },
  // The Gallas move was the OTHER HALF of the Cole deal — a swap. If the user
  // keeps Cole, the swap never happens, so Gallas never arrives.
  { playerId: 'cur_gallas2', from: 'chelsea', to: 'arsenal', window: '2006-08', fee: 5_000_000, id: 'gallas-arsenal-2006', enabledBy: 'cole-chelsea-2006' },
  { playerId: 'cur_henry', from: 'arsenal', to: 'barcelona', window: '2007-07', fee: 16_100_000, id: 'henry-barca-2007' },
  { playerId: 'cur_cristiano2', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cr7b-real-2009' },

  // United's real rebuild — the reason they, not Arsenal, dominated 2007-09.
  { playerId: 'cur_vidic', from: 'spartak_moscow', to: 'man_utd', window: '2006-01', fee: 7_000_000, id: 'vidic-utd-2006' },
  { playerId: 'cur_evra', from: 'monaco', to: 'man_utd', window: '2006-01', fee: 5_500_000, id: 'evra-utd-2006' },
  { playerId: 'cur_carrick2', from: 'spurs', to: 'man_utd', window: '2006-07', fee: 18_600_000, id: 'carrick-utd-2006' },
  { playerId: 'cur_vannistelrooy2', from: 'man_utd', to: 'real_madrid', window: '2006-07', fee: 10_000_000, id: 'ruud-real-2006' },
  { playerId: 'cur_hargreaves', from: 'bayern', to: 'man_utd', window: '2007-07', fee: 17_000_000, id: 'hargreaves-utd-2007' },
  { playerId: 'cur_tevez', from: 'west_ham', to: 'man_utd', window: '2007-07', fee: 20_000_000, id: 'tevez-utd-2007' },
  { playerId: 'cur_anderson_p', from: 'porto', to: 'man_utd', window: '2007-07', fee: 20_000_000, id: 'anderson-utd-2007' },
  { playerId: 'cur_nani', from: 'sporting', to: 'man_utd', window: '2007-07', fee: 17_000_000, id: 'nani-utd-2007' },
  { playerId: 'cur_park', from: 'psv', to: 'man_utd', window: '2005-07', fee: 4_000_000, id: 'park-utd-2005' },
  { playerId: 'cur_berbatov', from: 'leverkusen', to: 'spurs', window: '2006-07', fee: 11_000_000, id: 'berba-spurs-2006' },
  { playerId: 'cur_berbatov', from: 'spurs', to: 'man_utd', window: '2008-07', fee: 30_750_000, id: 'berba-utd-2008' },
  // Chelsea and Liverpool's real strengthening.
  { playerId: 'cur_essien', from: 'lyon', to: 'chelsea', window: '2005-08', fee: 24_400_000, id: 'essien-chelsea-2005' },
  { playerId: 'cur_ballack', from: 'bayern', to: 'chelsea', window: '2006-07', fee: 0, id: 'ballack-chelsea-2006' },
  { playerId: 'cur_shevchenko2', from: 'milan', to: 'chelsea', window: '2006-07', fee: 30_000_000, id: 'shevchenko-chelsea-2006' },
  { playerId: 'cur_torres', from: 'atletico', to: 'liverpool', window: '2007-07', fee: 26_500_000, id: 'torres-liverpool-2007' },
  { playerId: 'cur_alonso', from: 'liverpool', to: 'real_madrid', window: '2009-07', fee: 30_000_000, id: 'alonso-real-2009' },
  // Barça sign Eto'o (2004): a settled, happy star — so he is NOT a soft
  // fallback for an English club later; Villa is the more available option.
  { playerId: 'cur_etoo', from: 'mallorca', to: 'barcelona', window: '2004-07', fee: 16_000_000, id: 'etoo-barca-2004' },
  // Arsenal's real replacements — OFFERED to the user (their club), declinable.
  { playerId: 'cur_adebayor', from: 'monaco', to: 'arsenal', window: '2006-01', fee: 7_000_000, id: 'adebayor-arsenal-2006' },
  { playerId: 'cur_rosicky', from: 'dortmund', to: 'arsenal', window: '2006-07', fee: 6_800_000, id: 'rosicky-arsenal-2006' },
  { playerId: 'cur_nasri', from: 'marseille', to: 'arsenal', window: '2008-07', fee: 12_000_000, id: 'nasri-arsenal-2008' },
  { playerId: 'cur_arshavin', from: 'zenit', to: 'arsenal', window: '2009-01', fee: 15_000_000, id: 'arshavin-arsenal-2009' },
];

/** Real 2004-era injuries — fire only if the player is at his real club. */
const INJURIES_2004: RealInjuryEntry[] = [
  { playerId: 'cur_king', atClub: 'spurs', since: '2005-11', months: 4, serious: true, note: 'chronic knee trouble' },
  { playerId: 'cur_rooney2', atClub: 'man_utd', since: '2006-04', months: 2, serious: false, note: 'metatarsal fracture before the World Cup' },
];

/** Real 2001–02 injuries so a liverpool-2001 start maps to history from month one,
 *  rather than a procedural random draw. The landmark case is Markus Babbel, whose
 *  Guillain-Barré syndrome wiped out effectively two seasons. */
const INJURIES_2001: RealInjuryEntry[] = [
  { playerId: 'cur_babbel', atClub: 'liverpool', since: '2001-10', months: 14, serious: true, note: 'Guillain-Barré syndrome' },
  { playerId: 'cur_gerrard01', atClub: 'liverpool', since: '2002-04', months: 3, serious: false, note: 'groin operation — missed the 2002 World Cup' },
];

/**
 * Real 2001–05 transfers for the post-treble era pack. Liverpool's real recruits
 * (Diouf, Cheyrou) are OFFERED to the user — the counterfactual passes on the
 * flops and signs Anelka permanently instead. Chelsea's 2003 takeover splurge is
 * gated by `enabledBy: 'abramovich'` — a marker realized only if the takeover
 * actually happens (see the Abramovich check in season rollover). Deny Chelsea a
 * Champions-League place in 2003 and the takeover — and the splurge — may vanish.
 */
const LEDGER_2001_2005: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 2001) — the movers are auto-rewound to their
  //    selling clubs at kickoff, so a Director completes, intercepts or diverts each.
  //    Zidane's £46m switch is the galáctico a rival can try to derail. ──
  { playerId: 'cur_zidane01', from: 'juventus', to: 'real_madrid', window: '2001-07', fee: 46_000_000, id: 'zidane-real-2001' },
  { playerId: 'cur_ruud01', from: 'psv', to: 'man_utd', window: '2001-07', fee: 19_000_000, id: 'ruud-utd-2001' },
  { playerId: 'cur_veron01', from: 'lazio', to: 'man_utd', window: '2001-07', fee: 28_100_000, id: 'veron-utd-2001' },
  { playerId: 'cur_buffon_ju01', from: 'parma', to: 'juventus', window: '2001-07', fee: 32_000_000, id: 'buffon-juve-2001' },
  { playerId: 'cur_thuram_ju01', from: 'parma', to: 'juventus', window: '2001-07', fee: 22_000_000, id: 'thuram-juve-2001' },
  { playerId: 'cur_riise01', from: 'monaco', to: 'liverpool', window: '2001-07', fee: 4_000_000, id: 'riise-liverpool-2001' },
  { playerId: 'cur_sheringham01', from: 'man_utd', to: 'spurs', window: '2001-07', fee: 0, id: 'sheringham-spurs-2001' },
  { playerId: 'cur_ziege_s01', from: 'liverpool', to: 'spurs', window: '2001-07', fee: 4_000_000, id: 'ziege-spurs-2001' },
  // The Leeds fire-sale — O'Leary's over-leveraged side broke up piece by piece.
  // Seeding the real departures makes their historical collapse happen by default:
  // stripped of its spine, Leeds' anchored strength falls and they stop being a
  // European force, as reality demanded (they were relegated by 2004).
  { playerId: 'cur_ferdinand01', from: 'leeds', to: 'man_utd', window: '2002-07', fee: 30_000_000, id: 'ferdinand-utd-2002' },
  { playerId: 'cur_woodgate01', from: 'leeds', to: 'newcastle', window: '2003-01', fee: 9_000_000, id: 'woodgate-newcastle-2003' },
  { playerId: 'cur_bowyer', from: 'leeds', to: 'newcastle', window: '2003-07', fee: 100_000, id: 'bowyer-newcastle-2003' },
  { playerId: 'cur_kewell01', from: 'leeds', to: 'liverpool', window: '2003-07', fee: 5_000_000, id: 'kewell-liverpool-2003' },
  { playerId: 'cur_smith01', from: 'leeds', to: 'man_utd', window: '2004-07', fee: 7_000_000, id: 'smith-utd-2004' },
  { playerId: 'cur_viduka01', from: 'leeds', to: 'middlesbrough', window: '2004-07', fee: 4_500_000, id: 'viduka-boro-2004' },
  // Anelka's loan ends and he really left in 2002 — offered as the user's call
  // (keep him permanently, the counterfactual, or let him go, as reality did).
  { playerId: 'cur_anelka01', from: 'liverpool', to: 'man_city', window: '2002-07', fee: 13_000_000, id: 'anelka-out-2002' },
  { playerId: 'cur_diouf', from: 'lens', to: 'liverpool', window: '2002-07', fee: 10_000_000, id: 'diouf-liverpool-2002' },
  { playerId: 'cur_cheyrou', from: 'lille', to: 'liverpool', window: '2002-07', fee: 4_000_000, id: 'cheyrou-liverpool-2002' },
  // Abramovich's Chelsea — only if the takeover completes.
  { playerId: 'cur_makelele03', from: 'real_madrid', to: 'chelsea', window: '2003-08', fee: 16_000_000, id: 'makelele-chelsea-2003b', enabledBy: 'abramovich' },
  { playerId: 'cur_duff03', from: 'blackburn', to: 'chelsea', window: '2003-07', fee: 17_000_000, id: 'duff-chelsea-2003', enabledBy: 'abramovich' },
  { playerId: 'cur_crespo03', from: 'inter', to: 'chelsea', window: '2003-07', fee: 16_800_000, id: 'crespo-chelsea-2003', enabledBy: 'abramovich' },
  { playerId: 'cur_mutu03', from: 'parma', to: 'chelsea', window: '2003-07', fee: 15_800_000, id: 'mutu-chelsea-2003', enabledBy: 'abramovich' },
  { playerId: 'cur_bridge03', from: 'southampton', to: 'chelsea', window: '2003-07', fee: 7_000_000, id: 'bridge-chelsea-2003', enabledBy: 'abramovich' },
  // Gap-sweep: Liverpool's real exits in the era — Fowler to Leeds, Owen to Madrid.
  { playerId: 'cur_fowler01', from: 'liverpool', to: 'leeds', window: '2001-08', fee: 11_000_000 },
  { playerId: 'cur_owen01', from: 'liverpool', to: 'real_madrid', window: '2004-07', fee: 8_000_000 },
  // ── Rafa's spine, seeded young at their real selling clubs — the players who
  //    turned Houllier's cup side into the 2005 European champions. ──
  { playerId: 'cur_xabi_rs01', from: 'real_sociedad', to: 'liverpool', window: '2004-08', fee: 10_500_000, id: 'xabi-liverpool-2004' },
  { playerId: 'cur_torres_at01', from: 'atletico', to: 'liverpool', window: '2007-07', fee: 26_500_000, id: 'torres-liverpool-2007' },
];

/**
 * Real 2000–06 transfers for the Galácticos era pack (Spain). Real Madrid's real
 * story is one signing a summer (Zidane 2001, Ronaldo 2002, Beckham 2003, Owen
 * 2004, Robinho 2005, Van Nistelrooy 2006) — each OFFERED to the user, and the
 * pragmatic pivot of selling Makélélé (2003) to fund it. Around them, the real
 * La Liga recruitment holds: Barça rebuild via Ronaldinho/Eto'o/Deco, Valencia's
 * back-to-back titles, Deportivo cashing in Makaay.
 *
 * NB the opening 2000-07 window is pre-closed, so Figo (already at Madrid),
 * Overmars/Petit (Barça) and Redondo (Milan) are baked into the starting squads;
 * the ledger runs from 2001.
 */
const LEDGER_2000_2006: RealTransferLedgerEntry[] = [
  { playerId: 'cur_vieri', from: 'inter', to: 'milan', window: '2005-07', fee: 8_000_000, id: 'vieri-milan-2005' },
  // ── The LIVE opening window (summer 2000) — beyond Figo's galáctico, the summer's
  //    other business (Arsenal's double exit to Barça, Crespo's world-record move to
  //    Lazio) is live and interceptable. ──
  { playerId: 'cur_overmars', from: 'arsenal', to: 'barcelona', window: '2000-07', fee: 25_000_000, id: 'overmars-barca-2000' },
  { playerId: 'cur_petit', from: 'arsenal', to: 'barcelona', window: '2000-07', fee: 7_000_000, id: 'petit-barca-2000' },
  { playerId: 'cur_crespo', from: 'parma', to: 'lazio', window: '2000-07', fee: 35_000_000, id: 'crespo-lazio-2000' },
  // Real's own summer-2000 midfield rebuild alongside Figo — live for the Director.
  { playerId: 'cur_makelele', from: 'celta', to: 'real_madrid', window: '2000-07', fee: 15_000_000, id: 'makelele-real-2000' },
  { playerId: 'cur_flavio', from: 'deportivo', to: 'real_madrid', window: '2000-07', fee: 15_000_000, id: 'flavio-real-2000' },
  // Real's summer-2000 EXITS — live "fight to keep" calls: Redondo forced out to
  // Milan against his will (fans protested outside the Bernabéu), and Anelka sold
  // back to PSG after one turbulent season. Do nothing and both leave, as history;
  // intervene and the Director keeps them.
  { playerId: 'cur_redondo', from: 'real_madrid', to: 'milan', window: '2000-07', fee: 8_000_000, id: 'redondo-milan-2000' },
  { playerId: 'cur_anelka', from: 'real_madrid', to: 'psg', window: '2000-07', fee: 20_000_000, id: 'anelka-psg-2000' },
  // ── Real Madrid's galácticos — each a real-in decision for the user ──
  // The opening galáctico: Figo's move from Barça is the first decision — sign
  // the deal Pérez really did, or veto it and let him stay a rival.
  { playerId: 'cur_figo', from: 'barcelona', to: 'real_madrid', window: '2000-07', fee: 37_000_000, id: 'figo-real-2000' },
  { playerId: 'cur_zidane', from: 'juventus', to: 'real_madrid', window: '2001-07', fee: 46_000_000, id: 'zidane-real-2001' },
  { playerId: 'cur_ronaldo_r9', from: 'inter', to: 'real_madrid', window: '2002-07', fee: 30_000_000, id: 'ronaldo-real-2002' },
  { playerId: 'cur_beckham', from: 'man_utd', to: 'real_madrid', window: '2003-07', fee: 25_000_000, id: 'beckham-real-2003' },
  { playerId: 'cur_owen', from: 'liverpool', to: 'real_madrid', window: '2004-07', fee: 8_000_000, id: 'owen-real-2004' },
  { playerId: 'cur_woodgate', from: 'newcastle', to: 'real_madrid', window: '2004-07', fee: 13_400_000, id: 'woodgate-real-2004' },
  { playerId: 'cur_gravesen', from: 'everton', to: 'real_madrid', window: '2005-01', fee: 3_000_000, id: 'gravesen-real-2005' },
  { playerId: 'cur_robinho', from: 'santos', to: 'real_madrid', window: '2005-07', fee: 24_000_000, id: 'robinho-real-2005' },
  { playerId: 'cur_baptista', from: 'sevilla', to: 'real_madrid', window: '2005-07', fee: 20_000_000, id: 'baptista-real-2005' },
  { playerId: 'cur_ramos_s', from: 'sevilla', to: 'real_madrid', window: '2005-07', fee: 27_000_000, id: 'ramos-real-2005' },
  { playerId: 'cur_vannistelrooy', from: 'man_utd', to: 'real_madrid', window: '2006-07', fee: 10_000_000, id: 'ruud-real-2006' },
  // Cannavaro & Emerson reach Madrid in 2006 by their REAL paths through Italy —
  // both viable Madrid targets at any earlier point too (Parmalat/Calciopoli
  // distress is modelled in the Italy pack). Multi-move players, tracked by id.
  { playerId: 'cur_cannavaro', from: 'parma', to: 'inter', window: '2002-07', fee: 23_000_000, id: 'cannavaro-inter-2002' },
  { playerId: 'cur_cannavaro', from: 'inter', to: 'juventus', window: '2004-07', fee: 10_000_000, id: 'cannavaro-juve-2004' },
  { playerId: 'cur_cannavaro', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 7_000_000, id: 'cannavaro-real-2006' },
  { playerId: 'cur_emerson', from: 'roma', to: 'juventus', window: '2004-07', fee: 28_000_000, id: 'emerson-juve-2004' },
  { playerId: 'cur_emerson', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 4_000_000, id: 'emerson-real-2006' },
  // ── Real Madrid's real departures — offered to the user (sell / keep) ──
  { playerId: 'cur_makelele', from: 'real_madrid', to: 'chelsea', window: '2003-07', fee: 16_000_000, id: 'makelele-chelsea-2003' },
  { playerId: 'cur_mcmanaman', from: 'real_madrid', to: 'man_city', window: '2003-07', fee: 0, id: 'mcmanaman-city-2003' },
  { playerId: 'cur_morientes', from: 'real_madrid', to: 'liverpool', window: '2005-01', fee: 8_000_000, id: 'morientes-liverpool-2005' },
  // ── Barça's real rebuild (context) ──
  { playerId: 'cur_saviola', from: 'river_plate', to: 'barcelona', window: '2001-07', fee: 15_000_000, id: 'saviola-barca-2001' },
  { playerId: 'cur_ronaldinho', from: 'psg', to: 'barcelona', window: '2003-07', fee: 30_000_000, id: 'ronaldinho-barca-2003' },
  { playerId: 'cur_etoo', from: 'mallorca', to: 'barcelona', window: '2004-07', fee: 16_000_000, id: 'etoo-barca-2004' },
  { playerId: 'cur_deco', from: 'porto', to: 'barcelona', window: '2004-07', fee: 14_000_000, id: 'deco-barca-2004' },
  { playerId: 'cur_giuly', from: 'monaco', to: 'barcelona', window: '2004-07', fee: 8_000_000, id: 'giuly-barca-2004' },
  { playerId: 'cur_kluivert', from: 'barcelona', to: 'newcastle', window: '2004-07', fee: 5_000_000, id: 'kluivert-newcastle-2004' },
  // ── Valencia / Deportivo / Sociedad (context: title rivals' real business) ──
  { playerId: 'cur_mendieta', from: 'valencia', to: 'lazio', window: '2001-07', fee: 48_000_000, id: 'mendieta-lazio-2001' },
  { playerId: 'cur_makaay', from: 'deportivo', to: 'bayern', window: '2003-07', fee: 19_000_000, id: 'makaay-bayern-2003' },
  { playerId: 'cur_xabi_alonso', from: 'real_sociedad', to: 'liverpool', window: '2004-07', fee: 11_000_000, id: 'xabi-liverpool-2004' },
  { playerId: 'cur_villa', from: 'zaragoza', to: 'valencia', window: '2005-07', fee: 8_000_000, id: 'villa-valencia-2005' },
  // ── Italy/England context that colours the wider world ──
  { playerId: 'cur_veron', from: 'lazio', to: 'man_utd', window: '2001-07', fee: 28_000_000, id: 'veron-utd-2001' },
  { playerId: 'cur_nesta', from: 'lazio', to: 'milan', window: '2002-07', fee: 30_000_000, id: 'nesta-milan-2002' },
  { playerId: 'cur_crespo', from: 'lazio', to: 'inter', window: '2002-07', fee: 35_000_000, id: 'crespo-inter-2002' },
  { playerId: 'cur_reyes', from: 'sevilla', to: 'arsenal', window: '2004-01', fee: 17_000_000, id: 'reyes-arsenal-2004' },
  { playerId: 'cur_carvalho_r', from: 'porto', to: 'chelsea', window: '2004-07', fee: 20_000_000, id: 'carvalho-chelsea-2004' },
  { playerId: 'cur_forlan', from: 'man_utd', to: 'villarreal', window: '2004-07', fee: 3_000_000, id: 'forlan-villarreal-2004' },
];

/**
 * Real 1995–2001 transfers for the Serie A "Golden Age" pack. Juventus's real
 * story: cash in the Turin heroes after 1995 (Vialli, Ravanelli, Paulo Sousa),
 * reinvest in a young Zidane, Davids, Inzaghi and Trezeguet, and — the opening
 * decision — let Roberto Baggio go to Milan. Around them the real calcio market:
 * Ronaldo's world-record move to Inter, the Vieri fee saga, and Parma's Parmalat
 * side cashing in its jewels (Zola, Asprilla, then Buffon & Thuram to Juve).
 *
 * The 1995-07 window is LIVE, so Baggio's move to Milan is offered to the user;
 * summer-1995 arrivals already in the squads are recognised as reality.
 */
const LEDGER_1995_2001: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 1995) — the great Serie A reshuffle: Weah to
  //    Milan, Ince and Roberto Carlos to Inter, all live and interceptable. ──
  { playerId: 'cur_weah', from: 'psg', to: 'milan', window: '1995-07', fee: 4_000_000, id: 'weah-milan-1995' },
  { playerId: 'cur_ince', from: 'man_utd', to: 'inter', window: '1995-07', fee: 6_000_000, id: 'ince-inter-1995' },
  { playerId: 'cur_roberto_carlos_i', from: 'palmeiras', to: 'inter', window: '1995-07', fee: 5_000_000, id: 'robertocarlos-inter-1995' },
  // ── Juventus depart (real-out decisions for the user) ──
  { playerId: 'cur_baggio_r', from: 'juventus', to: 'milan', window: '1995-07', fee: 6_500_000, id: 'baggio-milan-1995' },
  { playerId: 'cur_vialli', from: 'juventus', to: 'chelsea', window: '1996-07', fee: 0, id: 'vialli-chelsea-1996' },
  { playerId: 'cur_ravanelli', from: 'juventus', to: 'middlesbrough', window: '1996-07', fee: 7_000_000, id: 'rava-boro-1996' },
  { playerId: 'cur_paulo_sousa', from: 'juventus', to: 'dortmund', window: '1996-07', fee: 3_000_000, id: 'sousa-dortmund-1996' },
  { playerId: 'cur_deschamps', from: 'juventus', to: 'chelsea', window: '1999-07', fee: 3_000_000, id: 'deschamps-chelsea-1999' },
  // ── Juventus rebuild (real-in decisions) ──
  { playerId: 'cur_zidane_b', from: 'bordeaux', to: 'juventus', window: '1996-07', fee: 3_200_000, id: 'zidane-juve-1996' },
  { playerId: 'cur_boksic', from: 'lazio', to: 'juventus', window: '1996-07', fee: 7_000_000, id: 'boksic-juve-1996' },
  { playerId: 'cur_inzaghi_a', from: 'atalanta', to: 'juventus', window: '1997-07', fee: 12_500_000, id: 'inzaghi-juve-1997' },
  { playerId: 'cur_trezeguet_m', from: 'monaco', to: 'juventus', window: '2000-07', fee: 21_000_000, id: 'trezeguet-juve-2000' },
  { playerId: 'cur_thuram_p', from: 'parma', to: 'juventus', window: '2001-07', fee: 32_500_000, id: 'thuram-juve-2001' },
  { playerId: 'cur_buffon_p', from: 'parma', to: 'juventus', window: '2001-07', fee: 32_000_000, id: 'buffon-juve-2001' },
  // ── The Vieri fee saga: Atalanta → Juve → Atlético → Lazio → Inter ──
  { playerId: 'cur_vieri_a', from: 'atalanta', to: 'juventus', window: '1996-07', fee: 6_000_000, id: 'vieri-juve-1996' },
  { playerId: 'cur_vieri_a', from: 'juventus', to: 'atletico', window: '1997-07', fee: 12_000_000, id: 'vieri-atletico-1997' },
  { playerId: 'cur_vieri_a', from: 'atletico', to: 'lazio', window: '1998-07', fee: 18_000_000, id: 'vieri-lazio-1998' },
  { playerId: 'cur_vieri_a', from: 'lazio', to: 'inter', window: '1999-07', fee: 31_000_000, id: 'vieri-inter-1999' },
  // ── Davids: Ajax → Milan → Juventus. Henry: Monaco → Juventus → Arsenal ──
  { playerId: 'cur_davids_aj', from: 'ajax', to: 'milan', window: '1996-07', fee: 5_500_000, id: 'davids-milan-1996' },
  { playerId: 'cur_davids_aj', from: 'milan', to: 'juventus', window: '1997-07', fee: 8_000_000, id: 'davids-juve-1997' },
  { playerId: 'cur_henry_m', from: 'monaco', to: 'juventus', window: '1999-01', fee: 10_500_000, id: 'henry-juve-1999' },
  { playerId: 'cur_henry_m', from: 'juventus', to: 'arsenal', window: '1999-07', fee: 11_000_000, id: 'henry-arsenal-1999' },
  // ── Serie A context: the real market around Turin ──
  { playerId: 'cur_roberto_carlos_i', from: 'inter', to: 'real_madrid', window: '1996-07', fee: 5_000_000, id: 'rcarlos-real-1996' },
  { playerId: 'cur_seedorf_s', from: 'sampdoria', to: 'real_madrid', window: '1996-07', fee: 4_500_000, id: 'seedorf-real-1996' },
  { playerId: 'cur_karembeu', from: 'sampdoria', to: 'real_madrid', window: '1997-07', fee: 5_000_000, id: 'karembeu-real-1997' },
  { playerId: 'cur_zola_p', from: 'parma', to: 'chelsea', window: '1996-07', fee: 4_500_000, id: 'zola-chelsea-1996' },
  { playerId: 'cur_asprilla', from: 'parma', to: 'newcastle', window: '1996-01', fee: 6_700_000, id: 'asprilla-newcastle-1996' },
  { playerId: 'cur_stoichkov', from: 'parma', to: 'barcelona', window: '1996-07', fee: 3_000_000, id: 'stoichkov-barca-1996' },
  { playerId: 'cur_di_matteo', from: 'lazio', to: 'chelsea', window: '1996-07', fee: 4_900_000, id: 'dimatteo-chelsea-1996' },
  { playerId: 'cur_chiesa_s', from: 'sampdoria', to: 'parma', window: '1996-07', fee: 8_000_000, id: 'chiesa-parma-1996' },
  { playerId: 'cur_kanu', from: 'ajax', to: 'inter', window: '1996-07', fee: 4_500_000, id: 'kanu-inter-1996' },
  { playerId: 'cur_overmars_aj', from: 'ajax', to: 'arsenal', window: '1997-07', fee: 7_000_000, id: 'overmars-arsenal-1997' },
  { playerId: 'cur_f_de_boer', from: 'ajax', to: 'barcelona', window: '1999-01', fee: 9_000_000, id: 'fdeboer-barca-1999' },
  // Ronaldo's real two-step: PSV → Barça (world-record, 1996) → Inter (1997). Author
  // the 1996 move first so he is at Barça before the 1997 entry executes.
  { playerId: 'cur_ronaldo_r', from: 'psv', to: 'barcelona', window: '1996-07', fee: 13_000_000, id: 'ronaldo-barca-1996' },
  { playerId: 'cur_ronaldo_r', from: 'barcelona', to: 'inter', window: '1997-07', fee: 19_500_000, id: 'ronaldo-inter-1997' },
  { playerId: 'cur_shevchenko_k', from: 'dynamo_kyiv', to: 'milan', window: '1999-07', fee: 24_000_000, id: 'sheva-milan-1999' },
  { playerId: 'cur_batistuta_f', from: 'fiorentina', to: 'roma', window: '2000-07', fee: 23_000_000, id: 'bati-roma-2000' },
  { playerId: 'cur_rui_costa_f', from: 'fiorentina', to: 'milan', window: '2001-07', fee: 42_000_000, id: 'ruicosta-milan-2001' },
  { playerId: 'cur_cannavaro_p', from: 'parma', to: 'inter', window: '2002-07', fee: 23_000_000, id: 'cannavaro-inter-2002' },
  { playerId: 'cur_mihajlovic_s', from: 'sampdoria', to: 'lazio', window: '1998-07', fee: 9_000_000, id: 'miha-lazio-1998' },
  { playerId: 'cur_bierhoff', from: 'udinese', to: 'milan', window: '1998-07', fee: 10_000_000, id: 'bierhoff-milan-1998' },
  { playerId: 'cur_ayala_n', from: 'napoli', to: 'milan', window: '1998-07', fee: 8_000_000, id: 'ayala-milan-1998' },
  { playerId: 'cur_zambrotta_j', from: 'bari', to: 'juventus', window: '1999-07', fee: 12_000_000, id: 'zambrotta-juve-1999' },
  // Cannavaro's return to Turin (2004) sets up his Ballon d'Or-winning exit.
  { playerId: 'cur_cannavaro_p', from: 'inter', to: 'juventus', window: '2004-07', fee: 10_000_000, id: 'cannavaro-juve-2004' },
  // ── The Calciopoli exodus (2006): the mercenaries leave, offered to the user
  //    if they are Juventus (the legends — Del Piero, Buffon, Nedvěd — stay). ──
  { playerId: 'cur_cannavaro_p', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 7_000_000, id: 'cannavaro-real-2006' },
  { playerId: 'cur_thuram_p', from: 'juventus', to: 'barcelona', window: '2006-07', fee: 5_000_000, id: 'thuram-barca-2006' },
  { playerId: 'cur_zambrotta_j', from: 'juventus', to: 'barcelona', window: '2006-07', fee: 10_000_000, id: 'zambrotta-barca-2006' },
];

/** Real Galácticos-era injuries — fire only if the player is at his real club. */
const INJURIES_2000: RealInjuryEntry[] = [
  { playerId: 'cur_ronaldo_r9', atClub: 'real_madrid', since: '2003-11', months: 2, serious: false, note: 'recurrent muscle trouble' },
  { playerId: 'cur_owen', atClub: 'real_madrid', since: '2004-12', months: 2, serious: false, note: 'hamstring' },
  { playerId: 'cur_aimar', atClub: 'valencia', since: '2002-10', months: 3, serious: false, note: 'ankle ligament damage' },
];

/**
 * Real 2003–2011 transfers for the "Manchester United 2003" pack — home of the
 * great Barça counterfactual. The 2003 window is live: Ronaldinho's move to
 * Barça (from PSG), Cristiano's to United (from Sporting) and Beckham's to Madrid
 * are all decisions. Divert Ronaldinho/Eto'o/Deco away from Barça, or keep Piqué
 * at United past 2008, and the Champions League board from 2006 rearranges.
 */
const LEDGER_2003_2011: RealTransferLedgerEntry[] = [
  // ── Abramovich's first spree, live for a Chelsea Director (the whole point of the
  //    scenario): every marquee arrival is a sign/veto decision, not a done deal —
  //    their selling clubs are seeded into this world so the deals are all live. ──
  { playerId: 'cur_makelele_c', from: 'real_madrid', to: 'chelsea', window: '2003-07', fee: 16_000_000, id: 'makelele-chelsea-2003c' },
  { playerId: 'cur_duff_c', from: 'blackburn', to: 'chelsea', window: '2003-07', fee: 17_000_000, id: 'duff-chelsea-2003c' },
  { playerId: 'cur_mutu_c3', from: 'parma', to: 'chelsea', window: '2003-07', fee: 15_800_000, id: 'mutu-chelsea-2003c' },
  { playerId: 'cur_joecole_c3', from: 'west_ham', to: 'chelsea', window: '2003-07', fee: 6_600_000, id: 'joecole-chelsea-2003c' },
  { playerId: 'cur_bridge_c3', from: 'southampton', to: 'chelsea', window: '2003-07', fee: 7_000_000, id: 'bridge-chelsea-2003c' },
  { playerId: 'cur_crespo_c3', from: 'inter', to: 'chelsea', window: '2003-07', fee: 16_800_000, id: 'crespo-chelsea-2003c' },
  { playerId: 'cur_veron_c3', from: 'man_utd', to: 'chelsea', window: '2003-07', fee: 15_000_000, id: 'veron-chelsea-2003c' },
  { playerId: 'cur_geremi_c3', from: 'real_madrid', to: 'chelsea', window: '2003-07', fee: 7_000_000, id: 'geremi-chelsea-2003c' },
  // ── The live 2003 window — the counterfactual's launch point ──
  { playerId: 'cur_ronaldinho', from: 'psg', to: 'barcelona', window: '2003-07', fee: 30_000_000, id: 'ronaldinho-barca-2003' },
  { playerId: 'cur_cristiano', from: 'sporting', to: 'man_utd', window: '2003-07', fee: 12_200_000, id: 'cristiano-utd-2003' },
  { playerId: 'cur_beckham_u', from: 'man_utd', to: 'real_madrid', window: '2003-07', fee: 25_000_000, id: 'beckham-real-2003' },
  // ── Barça's bought spine arrives (2004) — divertible by the user ──
  { playerId: 'cur_deco', from: 'porto', to: 'barcelona', window: '2004-07', fee: 14_000_000, id: 'deco-barca-2004' },
  { playerId: 'cur_etoo', from: 'mallorca', to: 'barcelona', window: '2004-07', fee: 16_000_000, id: 'etoo-barca-2004' },
  // Piqué to United (2004) then home to Barça (2008) — the "keep Piqué" decision.
  { playerId: 'cur_pique_b', from: 'barcelona', to: 'man_utd', window: '2004-07', fee: 5_000_000, id: 'pique-utd-2004' },
  { playerId: 'cur_pique_b', from: 'man_utd', to: 'barcelona', window: '2008-07', fee: 5_000_000, id: 'pique-barca-2008' },
  // ── Real Madrid / Chelsea / Arsenal real business (context for the CL) ──
  { playerId: 'cur_reyes_s', from: 'sevilla', to: 'arsenal', window: '2004-01', fee: 17_000_000, id: 'reyes-arsenal-2004' },
  { playerId: 'cur_owen_l', from: 'liverpool', to: 'real_madrid', window: '2004-07', fee: 8_000_000, id: 'owen-real-2004' },
  { playerId: 'cur_baptista_s', from: 'sevilla', to: 'real_madrid', window: '2005-07', fee: 20_000_000, id: 'baptista-real-2005' },
  { playerId: 'cur_henry_a', from: 'arsenal', to: 'barcelona', window: '2007-07', fee: 16_100_000, id: 'henry-barca-2007' },
  { playerId: 'cur_alonso_l', from: 'liverpool', to: 'real_madrid', window: '2009-07', fee: 30_000_000, id: 'alonso-real-2009' },
  { playerId: 'cur_kaka_m', from: 'milan', to: 'real_madrid', window: '2009-07', fee: 65_000_000, id: 'kaka-real-2009' },
  { playerId: 'cur_cristiano', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cristiano-real-2009' },
  // ── Barça's late-2000s reinforcements (the treble era) ──
  { playerId: 'cur_dani_alves', from: 'sevilla', to: 'barcelona', window: '2008-07', fee: 30_000_000, id: 'alves-barca-2008' },
  // The Ibrahimović–Eto'o swap (2009): Eto'o to Inter is what makes the 2010
  // Nerazzurri treble — divert Eto'o from Barça and this chain never forms.
  { playerId: 'cur_ibrahimovic_i', from: 'inter', to: 'barcelona', window: '2009-07', fee: 46_000_000, id: 'ibra-barca-2009' },
  { playerId: 'cur_etoo', from: 'barcelona', to: 'inter', window: '2009-07', fee: 20_000_000, id: 'etoo-inter-2009', enabledBy: 'ibra-barca-2009' },
  { playerId: 'cur_villa_v', from: 'valencia', to: 'barcelona', window: '2010-07', fee: 40_000_000, id: 'villa-barca-2010' },
  // Gap-sweep: Chelsea's own post-2003 Mourinho spine for the chelsea-2003 world —
  // Carvalho, a free Ballack, Shevchenko in; Verón & Duff out.
  { playerId: 'cur_carvalho_p', from: 'porto', to: 'chelsea', window: '2004-07', fee: 20_000_000 },
  { playerId: 'cur_ballack_b', from: 'bayern', to: 'chelsea', window: '2006-07', fee: 0 },
  { playerId: 'cur_shevchenko_m', from: 'milan', to: 'chelsea', window: '2006-07', fee: 30_000_000 },
  { playerId: 'cur_veron_c3', from: 'chelsea', to: 'inter', window: '2004-08', fee: 0 },
  { playerId: 'cur_duff_c', from: 'chelsea', to: 'newcastle', window: '2006-07', fee: 5_000_000 },
];

/** Real 2003-era injuries — fire only if the player is at his real club. */
const INJURIES_2003: RealInjuryEntry[] = [
  { playerId: 'cur_owen_l', atClub: 'real_madrid', since: '2004-12', months: 2, serious: false, note: 'hamstring trouble in Spain' },
  { playerId: 'cur_messi', atClub: 'barcelona', since: '2006-03', months: 3, serious: false, note: 'metatarsal — the wonderkid’s early setback' },
];

/** Real Serie A "Golden Age" injuries — fire only if the player is at his club. */
const INJURIES_1995: RealInjuryEntry[] = [
  { playerId: 'cur_delpiero_j', atClub: 'juventus', since: '1998-11', months: 6, serious: true, note: 'cruciate ligament rupture at Udine' },
  { playerId: 'cur_ronaldo_r', atClub: 'inter', since: '2000-04', months: 5, serious: true, note: 'catastrophic knee injury' },
];

/**
 * Real 1996–2001 transfers for the "Arrival of Wenger" pack — the era's iconic
 * moves among clubs the pack models: Ronaldo's world-record leap to Inter, Figo's
 * Barça-to-Madrid betrayal, Zidane's record move to Madrid, Sheringham to United,
 * and Anelka's cash-out (Arsenal is the user, so his sale is theirs to sanction).
 */
const LEDGER_1996_2001: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 1996) — Ronaldo's move to Barça (his one
  //    Camp Nou season), Wenger's Vieira, and Chelsea's Italians, all interceptable. ──
  { playerId: 'cur_ronaldo_b96', from: 'psv', to: 'barcelona', window: '1996-07', fee: 13_200_000, id: 'ronaldo-barca-1996' },
  { playerId: 'cur_vieira_a96', from: 'milan', to: 'arsenal', window: '1996-07', fee: 3_500_000, id: 'vieira-arsenal-1996' },
  { playerId: 'cur_dimatteo_c96', from: 'lazio', to: 'chelsea', window: '1996-07', fee: 4_900_000, id: 'dimatteo-chelsea-1996' },
  { playerId: 'cur_vialli_c96', from: 'juventus', to: 'chelsea', window: '1996-07', fee: 0, id: 'vialli-chelsea-1996b' },
  { playerId: 'cur_sheringham_s96', from: 'spurs', to: 'man_utd', window: '1997-07', fee: 3_500_000, id: 'sheringham-utd-1997' },
  { playerId: 'cur_ronaldo_b96', from: 'barcelona', to: 'inter', window: '1997-07', fee: 27_000_000, id: 'ronaldo-inter-1997' },
  { playerId: 'cur_anelka_a96', from: 'arsenal', to: 'real_madrid', window: '1999-07', fee: 22_500_000, id: 'anelka-real-1999' },
  { playerId: 'cur_figo_b96', from: 'barcelona', to: 'real_madrid', window: '2000-07', fee: 37_000_000, id: 'figo-real-2000' },
  { playerId: 'cur_zidane_j96', from: 'juventus', to: 'real_madrid', window: '2001-07', fee: 46_000_000, id: 'zidane-real-2001' },
  // Gap-sweep: Petit's 1997 arrival for the arsenal-1996 world.
  { playerId: 'cur_petit_96', from: 'monaco', to: 'arsenal', window: '1997-07', fee: 3_500_000 },
];

/**
 * Real La Liga / European market, 2003→2009 (barcelona-2003 "Pre-Messi Dawn").
 * Barça build the golden age — Eto'o and Deco arrive in 2004 (the user's, if they
 * are Barça) — while Real's galácticos age out and the great 2009 churn plays out.
 */
/**
 * Real Premier League / European market, 2008→2014 (man-city-2008 "The Takeover").
 * The reality is City spending their new billions — Tévez, Barry, Lescott,
 * Adebayor, then Milner and Nasri (all consumed silently, so a passive City never
 * makes the signings; the user chooses whom to buy) — while the rest of the game's
 * stars move as they really did.
 */
const LEDGER_ENG_2008: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 2008) — the takeover-summer moves, seeded at
  //    their selling clubs so a Director signs/intercepts them rather than inheriting
  //    a done deal (M12C). Robinho's deadline-day switch is the takeover's statement. ──
  { playerId: 'cur_robinho_c8', from: 'real_madrid', to: 'man_city', window: '2008-07', fee: 32_500_000, id: 'robinho-city-2008' },
  { playerId: 'cur_berbatov_u8', from: 'spurs', to: 'man_utd', window: '2008-08', fee: 30_750_000, id: 'berbatov-utd-2008' },
  { playerId: 'cur_deco_c8', from: 'barcelona', to: 'chelsea', window: '2008-07', fee: 8_000_000, id: 'deco-chelsea-2008' },
  // The era's other defining moves (rival business the Director can intercept):
  { playerId: 'cur_torres_l8', from: 'liverpool', to: 'chelsea', window: '2011-01', fee: 50_000_000, id: 'torres-chelsea-2011' },
  { playerId: 'cur_suarez_aj08', from: 'ajax', to: 'liverpool', window: '2011-01', fee: 22_800_000, id: 'suarez-lfc-2011' },
  // ── City's takeover spending (the user's, if they are City) ──
  { playerId: 'cur_tevez_u8', from: 'man_utd', to: 'man_city', window: '2009-07', fee: 25_500_000, id: 'tevez-city-2009' },
  { playerId: 'cur_barry_av', from: 'aston_villa', to: 'man_city', window: '2009-07', fee: 12_000_000, id: 'barry-city-2009' },
  { playerId: 'cur_lescott_ev', from: 'everton', to: 'man_city', window: '2009-08', fee: 22_000_000, id: 'lescott-city-2009' },
  { playerId: 'cur_adebayor_a8', from: 'arsenal', to: 'man_city', window: '2009-07', fee: 25_000_000, id: 'adebayor-city-2009' },
  { playerId: 'cur_milner_av', from: 'aston_villa', to: 'man_city', window: '2010-08', fee: 26_000_000, id: 'milner-city-2010' },
  { playerId: 'cur_nasri_a8', from: 'arsenal', to: 'man_city', window: '2011-08', fee: 24_000_000, id: 'nasri-city-2011' },
  // ── The rest of the market moves as reality ──
  { playerId: 'cur_cristiano_u8', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cr7-real-2009' },
  { playerId: 'cur_alonso_l8', from: 'liverpool', to: 'real_madrid', window: '2009-08', fee: 30_000_000, id: 'alonso-real-2009' },
  { playerId: 'cur_mascherano_l8', from: 'liverpool', to: 'barcelona', window: '2010-08', fee: 24_000_000, id: 'masche-barca-2010' },
  { playerId: 'cur_modric_sp', from: 'spurs', to: 'real_madrid', window: '2012-08', fee: 33_000_000, id: 'modric-real-2012' },
  { playerId: 'cur_bale_sp', from: 'spurs', to: 'real_madrid', window: '2013-09', fee: 85_000_000, id: 'bale-real-2013' },
  { playerId: 'cur_van_persie_a8', from: 'arsenal', to: 'man_utd', window: '2012-08', fee: 24_000_000, id: 'rvp-utd-2012' },
  { playerId: 'cur_fabregas_a8', from: 'arsenal', to: 'barcelona', window: '2011-08', fee: 29_000_000, id: 'cesc-barca-2011' },
  { playerId: 'cur_arteta_ev', from: 'everton', to: 'arsenal', window: '2011-08', fee: 10_000_000, id: 'arteta-arsenal-2011' },
  { playerId: 'cur_sneijder_e8', from: 'real_madrid', to: 'inter', window: '2009-08', fee: 15_000_000, id: 'sneijder-inter-2009' },
  // The 2009 Ibrahimović–Eto'o swap, both halves (Ibra was Inter's striker in 2008-09).
  { playerId: 'cur_ibrahimovic_e8', from: 'inter', to: 'barcelona', window: '2009-07', fee: 46_000_000, id: 'ibra-barca-2009' },
  { playerId: 'cur_etoo_e8', from: 'barcelona', to: 'inter', window: '2009-07', fee: 20_000_000, id: 'etoo-inter-2009', enabledBy: 'ibra-barca-2009' },
  // Gap-sweep: Agüero's statement arrival at City (2011).
  { playerId: 'cur_aguero_08', from: 'atletico', to: 'man_city', window: '2011-07', fee: 38_000_000 },
  // City's post-title rebuild — real arrivals that fill the mid-decade summers.
  { playerId: 'cur_navas_08', from: 'sevilla', to: 'man_city', window: '2013-07', fee: 14_900_000, id: 'navas-city-2013' },
  { playerId: 'cur_negredo_08', from: 'sevilla', to: 'man_city', window: '2013-07', fee: 16_400_000, id: 'negredo-city-2013' },
  { playerId: 'cur_jovetic_08', from: 'fiorentina', to: 'man_city', window: '2013-07', fee: 22_000_000, id: 'jovetic-city-2013' },
  { playerId: 'cur_sagna_a8', from: 'arsenal', to: 'man_city', window: '2014-07', fee: 0, id: 'sagna-city-2014' },
  { playerId: 'cur_fernando_re08', from: 'porto', to: 'man_city', window: '2014-07', fee: 12_000_000, id: 'fernando-city-2014' },
  // Džeko's real Wolfsburg→City move (Jan 2011), and De Bruyne's £55m arrival in
  // 2015 — the young Wolfsburg seed grown into the marquee signing.
  { playerId: 'cur_dzeko_08', from: 'wolfsburg', to: 'man_city', window: '2011-01', fee: 27_000_000, id: 'dzeko-city-2011' },
  { playerId: 'cur_debruyne_08', from: 'wolfsburg', to: 'man_city', window: '2015-07', fee: 55_000_000, id: 'debruyne-city-2015' },
  // Dortmund's young core scatters as it really did: Gündoğan grown into City's
  // 2016 signing, plus Şahin to Real (2011) and Hummels to Bayern (2016) as the
  // market's real business around it.
  { playerId: 'cur_gundogan_08', from: 'dortmund', to: 'man_city', window: '2016-07', fee: 20_000_000, id: 'gundogan-city-2016' },
  { playerId: 'cur_sahin_08', from: 'dortmund', to: 'real_madrid', window: '2011-07', fee: 8_000_000, id: 'sahin-real-2011' },
  { playerId: 'cur_hummels_08', from: 'dortmund', to: 'bayern', window: '2016-07', fee: 35_000_000, id: 'hummels-bayern-2016' },
];

/**
 * Real Premier League / European market, 1995→2001 (liverpool-1995). Shearer's
 * world-record move from Blackburn to Newcastle opens it (correcting the timeline —
 * he was a champion at Ewood in 1995-96), then the Spice Boys are picked apart:
 * Collymore to Villa, McManaman a Bosman to Madrid. On the continent Ronaldo,
 * Figo and Zidane make their real moves — the last two to Real.
 */
const LEDGER_ENG_1995: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 1995) — auto-rewound to their sellers, so
  //    Bergkamp's arrival, Collymore's British-record move to Anfield and the rest
  //    are live decisions. ──
  { playerId: 'cur_bergkamp_a96', from: 'inter', to: 'arsenal', window: '1995-07', fee: 7_500_000, id: 'bergkamp-arsenal-1995' },
  { playerId: 'cur_collymore_95', from: 'nottm_forest', to: 'liverpool', window: '1995-07', fee: 8_500_000, id: 'collymore-lfc-1995' },
  { playerId: 'cur_ferdinand_95', from: 'qpr', to: 'newcastle', window: '1995-07', fee: 6_000_000, id: 'lesferdinand-newcastle-1995' },
  { playerId: 'cur_klinsmann_b96', from: 'spurs', to: 'bayern', window: '1995-07', fee: 3_000_000, id: 'klinsmann-bayern-1995' },
  // ── Shearer's £15m record move home (and the correct home for him from 1996) ──
  { playerId: 'cur_shearer_95', from: 'blackburn', to: 'newcastle', window: '1996-07', fee: 15_000_000, id: 'shearer-newcastle-1996' },
  // ── The Spice Boys picked apart (the user's stars leaving, if they are Liverpool) ──
  { playerId: 'cur_collymore_95', from: 'liverpool', to: 'aston_villa', window: '1997-07', fee: 7_000_000, id: 'collymore-villa-1997' },
  // A pre-agreed Bosman (see LEDGER_1999_2004) — locked, not hijackable.
  { playerId: 'cur_mcmanaman_95', from: 'liverpool', to: 'real_madrid', window: '1999-07', fee: 0, id: 'mcmanaman-real-1999', preAgreed: true },
  // ── The continental market moves as reality ──
  { playerId: 'cur_ronaldo_b96', from: 'barcelona', to: 'inter', window: '1997-07', fee: 27_000_000, id: 'ronaldo-inter-1997' },
  { playerId: 'cur_anelka_a96', from: 'arsenal', to: 'real_madrid', window: '1999-07', fee: 22_500_000, id: 'anelka-real-1999' },
  { playerId: 'cur_figo_b96', from: 'barcelona', to: 'real_madrid', window: '2000-07', fee: 37_000_000, id: 'figo-real-2000' },
  { playerId: 'cur_zidane_j96', from: 'juventus', to: 'real_madrid', window: '2001-07', fee: 46_000_000, id: 'zidane-real-2001' },
];

/**
 * Real Premier League / European market, 2010→2016 (liverpool-2010). The hinge is
 * Torres forcing his way to Chelsea in January 2011 (the user's captain-in-waiting
 * sold, if they are Liverpool), with Suárez and Meireles moving on too, while the
 * elite churn — CR7 already at Madrid, Fàbregas home to Barça, Bale and Modrić to
 * Madrid, RVP to United — plays out as it really did.
 */
const LEDGER_ENG_2010: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 2010) — auto-rewound to their selling clubs.
  //    City's project signings (Yaya, Balotelli), Chelsea and Spurs' business, and
  //    Liverpool's own arrivals become live decisions. ──
  { playerId: 'cur_yaya_ci10', from: 'barcelona', to: 'man_city', window: '2010-07', fee: 24_000_000, id: 'yaya-city-2010' },
  { playerId: 'cur_balotelli_ci10', from: 'inter', to: 'man_city', window: '2010-08', fee: 24_000_000, id: 'balotelli-city-2010' },
  { playerId: 'cur_ramires_ch10', from: 'benfica', to: 'chelsea', window: '2010-07', fee: 18_000_000, id: 'ramires-chelsea-2010' },
  { playerId: 'cur_van_der_vaart', from: 'real_madrid', to: 'spurs', window: '2010-08', fee: 8_000_000, id: 'vdv-spurs-2010' },
  { playerId: 'cur_joecole_lv10', from: 'chelsea', to: 'liverpool', window: '2010-07', fee: 0, id: 'joecole-lfc-2010' },
  { playerId: 'cur_meireles_lv10', from: 'porto', to: 'liverpool', window: '2010-07', fee: 11_500_000, id: 'meireles-lfc-2010' },
  { playerId: 'cur_poulsen_lv10', from: 'juventus', to: 'liverpool', window: '2010-07', fee: 4_500_000, id: 'poulsen-lfc-2010' },
  { playerId: 'cur_konchesky_lv10', from: 'fulham', to: 'liverpool', window: '2010-07', fee: 4_000_000, id: 'konchesky-lfc-2010' },
  // ── Liverpool's departures (the user's stars leaving, if they are Liverpool) ──
  { playerId: 'cur_torres_lv10', from: 'liverpool', to: 'chelsea', window: '2011-01', fee: 50_000_000, id: 'torres-chelsea-2011' },
  { playerId: 'cur_meireles_lv10', from: 'liverpool', to: 'chelsea', window: '2011-08', fee: 12_000_000, id: 'meireles-chelsea-2011' },
  { playerId: 'cur_suarez_lv10', from: 'liverpool', to: 'barcelona', window: '2014-07', fee: 65_000_000, id: 'suarez-barca-2014' },
  // ── The elite market moves as reality ──
  { playerId: 'cur_fabregas_10', from: 'arsenal', to: 'barcelona', window: '2011-08', fee: 29_000_000, id: 'cesc-barca-2011' },
  { playerId: 'cur_nasri_10', from: 'arsenal', to: 'man_city', window: '2011-08', fee: 24_000_000, id: 'nasri-city-2011' },
  // Agüero's real 2011 move to City — seeded so the takeover-era striker signing is
  // modelled, and so a Director who signs him first leaves City chasing their Plan-B
  // (Van Persie, in NEAR_MISS_ENG_2010).
  { playerId: 'cur_aguero_10', from: 'atletico', to: 'man_city', window: '2011-07', fee: 38_000_000, id: 'aguero-city-2011' },
  { playerId: 'cur_van_persie_10', from: 'arsenal', to: 'man_utd', window: '2012-08', fee: 24_000_000, id: 'rvp-utd-2012' },
  { playerId: 'cur_ozil_rm10', from: 'real_madrid', to: 'arsenal', window: '2013-09', fee: 42_500_000, id: 'ozil-arsenal-2013' },
  { playerId: 'cur_modric_10', from: 'spurs', to: 'real_madrid', window: '2012-08', fee: 33_000_000, id: 'modric-real-2012' },
  { playerId: 'cur_bale_10', from: 'spurs', to: 'real_madrid', window: '2013-09', fee: 85_000_000, id: 'bale-real-2013' },
  { playerId: 'cur_kroos_2010', from: 'bayern', to: 'real_madrid', window: '2014-07', fee: 24_000_000, id: 'kroos-real-2014' },
  { playerId: 'cur_di_maria_rm10', from: 'real_madrid', to: 'man_utd', window: '2014-08', fee: 59_700_000, id: 'dimaria-utd-2014' },
  // Gap-sweep: Liverpool's rebuild intake — Henderson, Coutinho, Sturridge.
  { playerId: 'cur_henderson_su10', from: 'sunderland', to: 'liverpool', window: '2011-07', fee: 16_000_000 },
  { playerId: 'cur_coutinho_in10', from: 'inter', to: 'liverpool', window: '2013-01', fee: 8_500_000 },
  { playerId: 'cur_sturridge_ch10', from: 'chelsea', to: 'liverpool', window: '2013-01', fee: 12_000_000 },
  { playerId: 'cur_mignolet_su10', from: 'sunderland', to: 'liverpool', window: '2013-07', fee: 9_000_000, id: 'mignolet-lfc-2013' },
  // ── The Klopp-era spine, seeded young at their real selling clubs so the engine
  //    grows them into the 2019/2020 champions the Director can pre-empt or divert. ──
  { playerId: 'cur_lovren_so10', from: 'southampton', to: 'liverpool', window: '2014-07', fee: 20_000_000, id: 'lovren-lfc-2014' },
  { playerId: 'cur_clyne_so10', from: 'southampton', to: 'liverpool', window: '2015-07', fee: 12_500_000, id: 'clyne-lfc-2015' },
  { playerId: 'cur_firmino_ho10', from: 'hoffenheim', to: 'liverpool', window: '2015-07', fee: 29_000_000, id: 'firmino-lfc-2015' },
  { playerId: 'cur_mane_so10', from: 'southampton', to: 'liverpool', window: '2016-07', fee: 34_000_000, id: 'mane-lfc-2016' },
  { playerId: 'cur_wijnaldum_10', from: 'psv', to: 'liverpool', window: '2016-07', fee: 25_000_000, id: 'wijnaldum-lfc-2016' },
  { playerId: 'cur_salah_ro10', from: 'roma', to: 'liverpool', window: '2017-07', fee: 36_900_000, id: 'salah-lfc-2017' },
];

/**
 * Real Bundesliga / European market, 1997→2001 (dortmund-1997 + bayern-1998). The
 * European champions are picked apart — Riedle to Liverpool the summer after Munich,
 * Möller to Schalke — while a teenage Ballack leaves Kaiserslautern for Leverkusen
 * and Babbel makes his Bosman move to Anfield. On the continent Ronaldo, Anelka,
 * Figo and Zidane make their real transfers, the last three to Madrid.
 */
const LEDGER_BUNDESLIGA_1997: RealTransferLedgerEntry[] = [
  // The LIVE opening window for bayern-1998 (summer 1998): Effenberg's return to
  // Bayern from Gladbach — the midfield general who drove the treble run.
  { playerId: 'cur_effenberg_98', from: 'gladbach', to: 'bayern', window: '1998-07', fee: 5_000_000, id: 'effenberg-bayern-1998' },
  // ── Dortmund's champions dispersed (the user's stars, if they are Dortmund) ──
  { playerId: 'cur_riedle_97', from: 'dortmund', to: 'liverpool', window: '1997-07', fee: 2_000_000, id: 'riedle-liverpool-1997' },
  { playerId: 'cur_moller_97', from: 'dortmund', to: 'schalke', window: '2000-07', fee: 0, id: 'moller-schalke-2000' },
  // ── Bayern's Bosman departure + a teenage Ballack on the rise ──
  { playerId: 'cur_babbel_98', from: 'bayern', to: 'liverpool', window: '2000-07', fee: 0, id: 'babbel-liverpool-2000' },
  { playerId: 'cur_ballack_97', from: 'kaiserslautern', to: 'leverkusen', window: '1999-07', fee: 4_000_000, id: 'ballack-leverkusen-1999' },
  // ── The continental market moves as reality ──
  { playerId: 'cur_ronaldo_b96', from: 'barcelona', to: 'inter', window: '1997-07', fee: 27_000_000, id: 'ronaldo-inter-1997' },
  { playerId: 'cur_anelka_a96', from: 'arsenal', to: 'real_madrid', window: '1999-07', fee: 22_500_000, id: 'anelka-real-1999' },
  { playerId: 'cur_figo_b96', from: 'barcelona', to: 'real_madrid', window: '2000-07', fee: 37_000_000, id: 'figo-real-2000' },
  { playerId: 'cur_zidane_j96', from: 'juventus', to: 'real_madrid', window: '2001-07', fee: 46_000_000, id: 'zidane-real-2001' },
];

/**
 * Real Bundesliga / European market, 2009→2016 (bayern-2009). Şahin leaves Dortmund
 * for Madrid, then Götze crosses to Bayern (the user's signing, if they are Bayern)
 * and Kroos leaves for Madrid — the reset's stars arriving and departing — while the
 * elite market churns around them.
 */
const LEDGER_BUNDESLIGA_2009: RealTransferLedgerEntry[] = [
  // The LIVE opening window (summer 2009): Robben's move from Real is the Van Gaal
  // reset's cornerstone — a Director signs, or a rival hijacks, the deal.
  { playerId: 'cur_robben_09', from: 'real_madrid', to: 'bayern', window: '2009-07', fee: 24_000_000, id: 'robben-bayern-2009' },
  { playerId: 'cur_gomez_09', from: 'stuttgart', to: 'bayern', window: '2009-07', fee: 30_000_000, id: 'gomez-bayern-2009' },
  { playerId: 'cur_olic_09', from: 'hamburg', to: 'bayern', window: '2009-07', fee: 0, id: 'olic-bayern-2009' },
  { playerId: 'cur_sahin_09', from: 'dortmund', to: 'real_madrid', window: '2011-07', fee: 10_000_000, id: 'sahin-real-2011' },
  { playerId: 'cur_gotze_09', from: 'dortmund', to: 'bayern', window: '2013-07', fee: 37_000_000, id: 'gotze-bayern-2013' },
  { playerId: 'cur_kroos_09', from: 'bayern', to: 'real_madrid', window: '2014-07', fee: 24_000_000, id: 'kroos-real-2014' },
  { playerId: 'cur_torres_lv10', from: 'liverpool', to: 'chelsea', window: '2011-01', fee: 50_000_000, id: 'torres-chelsea-2011' },
  { playerId: 'cur_di_maria_rm10', from: 'real_madrid', to: 'man_utd', window: '2014-08', fee: 59_700_000, id: 'dimaria-utd-2014' },
  { playerId: 'cur_suarez_lv10', from: 'liverpool', to: 'barcelona', window: '2014-07', fee: 65_000_000, id: 'suarez-barca-2014' },
  // Gap-sweep: Neuer's move from Schalke to Bayern (2011).
  { playerId: 'cur_neuer_sc10', from: 'schalke', to: 'bayern', window: '2011-07', fee: 22_000_000 },
  // Thiago, seeded young at Barcelona, follows Guardiola to Bayern on his real 2013
  // window — "Thiago oder nichts", the midfielder the reset was built around.
  { playerId: 'cur_thiago_bc10', from: 'barcelona', to: 'bayern', window: '2013-07', fee: 22_000_000, id: 'thiago-bayern-2013' },
];

/**
 * Real Bundesliga / European market, 2012→2016 (dortmund-2012). The heart of it is
 * the picking-apart of Klopp's peak side — Götze, Lewandowski and Hummels to
 * Bayern, Gündoğan to City — while Kagawa comes home. If the user IS Dortmund those
 * are their stars being prised away one by one.
 */
const LEDGER_BUNDESLIGA_2012: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 2012) — Reus comes home to Dortmund; Kagawa
  //    is cashed in to United (the user's own sale to sanction or block). ──
  { playerId: 'cur_reus_12', from: 'gladbach', to: 'dortmund', window: '2012-07', fee: 17_000_000, id: 'reus-dortmund-2012' },
  { playerId: 'cur_kagawa_u12', from: 'dortmund', to: 'man_utd', window: '2012-07', fee: 12_000_000, id: 'kagawa-utd-2012' },
  // Bayern's response to losing the 2012 final — Mandžukić and Javi Martínez arrive.
  { playerId: 'cur_mandzukic_12', from: 'wolfsburg', to: 'bayern', window: '2012-07', fee: 13_000_000, id: 'mandzukic-bayern-2012' },
  { playerId: 'cur_martinez_12', from: 'athletic', to: 'bayern', window: '2012-08', fee: 40_000_000, id: 'javimartinez-bayern-2012' },
  // ── The picking-apart of Dortmund's golden generation ──
  { playerId: 'cur_gotze_12', from: 'dortmund', to: 'bayern', window: '2013-07', fee: 37_000_000, id: 'gotze-bayern-2013' },
  { playerId: 'cur_lewandowski_12', from: 'dortmund', to: 'bayern', window: '2014-07', fee: 0, id: 'lewa-bayern-2014' },
  { playerId: 'cur_hummels_12', from: 'dortmund', to: 'bayern', window: '2016-07', fee: 35_000_000, id: 'hummels-bayern-2016' },
  { playerId: 'cur_gundogan_12', from: 'dortmund', to: 'man_city', window: '2016-07', fee: 22_000_000, id: 'gundogan-city-2016' },
  // ── Kagawa comes home from United ──
  { playerId: 'cur_kagawa_u12', from: 'man_utd', to: 'dortmund', window: '2014-08', fee: 8_000_000, id: 'kagawa-home-2014' },
  // ── Bayern reload; Vidal joins the dynasty ──
  { playerId: 'cur_vidal_ju12', from: 'juventus', to: 'bayern', window: '2015-07', fee: 37_000_000, id: 'vidal-bayern-2015' },
  { playerId: 'cur_gomez_12', from: 'bayern', to: 'juventus', window: '2013-07', fee: 15_500_000, id: 'gomez-fiorentina-2013' },
  // ── The elite market around them ──
  { playerId: 'cur_di_maria_rm12', from: 'real_madrid', to: 'man_utd', window: '2014-08', fee: 59_700_000, id: 'dimaria-utd-2014' },
  { playerId: 'cur_suarez_lv12', from: 'liverpool', to: 'barcelona', window: '2014-07', fee: 65_000_000, id: 'suarez-barca-2014' },
  { playerId: 'cur_villa_bc12', from: 'barcelona', to: 'atletico', window: '2013-07', fee: 5_100_000, id: 'villa-atletico-2013' },
  { playerId: 'cur_pogba_ju12', from: 'juventus', to: 'man_utd', window: '2016-08', fee: 105_000_000, id: 'pogba-utd-2016' },
  { playerId: 'cur_ibrahimovic_pg12', from: 'psg', to: 'man_utd', window: '2016-07', fee: 0, id: 'ibra-utd-2016' },
  // ── Klopp's rebuild: the replacements bought as the golden generation was sold. ──
  { playerId: 'cur_aubameyang_12', from: 'st_etienne', to: 'dortmund', window: '2013-07', fee: 13_000_000, id: 'auba-dortmund-2013' },
  { playerId: 'cur_mkhitaryan_12', from: 'shakhtar', to: 'dortmund', window: '2013-07', fee: 27_500_000, id: 'mkhitaryan-dortmund-2013' },
];

/**
 * Real La Liga / European market, 2014→2020 (barcelona-2014 "Peak — Don't Waste
 * It"). The hinge is Neymar's €222m defection to PSG in 2017 (the user's star, if
 * they are Barça) and the money famously wasted on Coutinho; keep the front three
 * together and the decline never comes. Around it, the modern market churns.
 */
const LEDGER_LA_LIGA_2014: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 2014) — Luis Enrique's midfield rebuild
  //    (Rakitić, Mathieu) and Real's marquee Kroos are live decisions. ──
  { playerId: 'cur_suarez_b14', from: 'liverpool', to: 'barcelona', window: '2014-07', fee: 65_000_000, id: 'suarez-barca-2014b' },
  { playerId: 'cur_rakitic_b14', from: 'sevilla', to: 'barcelona', window: '2014-07', fee: 15_000_000, id: 'rakitic-barca-2014' },
  { playerId: 'cur_mathieu_b14', from: 'valencia', to: 'barcelona', window: '2014-07', fee: 16_000_000, id: 'mathieu-barca-2014' },
  { playerId: 'cur_kroos_r14', from: 'bayern', to: 'real_madrid', window: '2014-07', fee: 24_000_000, id: 'kroos-real-2014' },
  // ── The hinge: Neymar out, the wasted-money signing in ──
  { playerId: 'cur_neymar_b14', from: 'barcelona', to: 'psg', window: '2017-08', fee: 222_000_000, id: 'neymar-psg-2017' },
  { playerId: 'cur_coutinho_l14', from: 'liverpool', to: 'barcelona', window: '2018-01', fee: 142_000_000, id: 'coutinho-barca-2018', enabledBy: 'neymar-psg-2017' },
  // ── Barça's other business ──
  { playerId: 'cur_alves_b14', from: 'barcelona', to: 'juventus', window: '2016-07', fee: 0, id: 'alves-juve-2016' },
  { playerId: 'cur_pedro_b14', from: 'barcelona', to: 'chelsea', window: '2015-08', fee: 27_000_000, id: 'pedro-chelsea-2015' },
  { playerId: 'cur_suarez_b14', from: 'barcelona', to: 'atletico', window: '2020-09', fee: 6_000_000, id: 'suarez-atletico-2020' },
  { playerId: 'cur_griezmann_a14', from: 'atletico', to: 'barcelona', window: '2019-07', fee: 120_000_000, id: 'griezmann-barca-2019' },
  // ── The modern market around the giants ──
  { playerId: 'cur_vidal_j14', from: 'juventus', to: 'bayern', window: '2015-07', fee: 37_000_000, id: 'vidal-bayern-2015' },
  { playerId: 'cur_morata_j14', from: 'juventus', to: 'real_madrid', window: '2016-07', fee: 30_000_000, id: 'morata-real-2016' },
  { playerId: 'cur_james_r14', from: 'real_madrid', to: 'bayern', window: '2017-07', fee: 0, id: 'james-bayern-2017' },
  { playerId: 'cur_sterling_l14', from: 'liverpool', to: 'man_city', window: '2015-07', fee: 49_000_000, id: 'sterling-city-2015' },
  { playerId: 'cur_costa_c14', from: 'chelsea', to: 'atletico', window: '2017-08', fee: 60_000_000, id: 'costa-atletico-2017' },
  // Barça's real 2016 striker signing — fills the mid-cycle summer.
  { playerId: 'cur_paco_alcacer', from: 'valencia', to: 'barcelona', window: '2016-07', fee: 27_000_000, id: 'alcacer-barca-2016' },
  // Frenkie de Jong, seeded young at Ajax, arrives on his real 2019 window — the
  // heir to the midfield the Director must decide whether to build around.
  { playerId: 'cur_de_jong_f14', from: 'ajax', to: 'barcelona', window: '2019-07', fee: 75_000_000, id: 'dejong-barca-2019' },
];

/**
 * Real La Liga / European market, 2006→2010 (real-madrid-2006 "Post-Galáctico").
 * The old galácticos age out (Ronaldo to Milan) and a NEW wave is bought in the
 * 2009 rebuild — Cristiano, Kaká and Xabi Alonso to Madrid (the user's, if they
 * are Real) — while Barça build their own dynasty around Villa and Alves.
 */
const LEDGER_LA_LIGA_2006: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 2006) — Capello's post-galáctico rebuild:
  //    the World-Cup-winning Cannavaro, Emerson and Van Nistelrooy arrive as the
  //    user's real-in decisions. ──
  { playerId: 'cur_cannavaro_r6', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 7_000_000, id: 'cannavaro-real-2006' },
  { playerId: 'cur_emerson_r6', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 7_500_000, id: 'emerson-real-2006' },
  { playerId: 'cur_van_nistelrooy_r6', from: 'man_utd', to: 'real_madrid', window: '2006-07', fee: 10_000_000, id: 'ruud-real-2006' },
  // ── Real's business: the old guard out, the 2009 galácticos in ──
  { playerId: 'cur_ronaldo_r6', from: 'real_madrid', to: 'milan', window: '2007-01', fee: 7_500_000, id: 'ronaldo-milan-2007' },
  { playerId: 'cur_cannavaro_r6', from: 'real_madrid', to: 'juventus', window: '2009-07', fee: 0, id: 'cannavaro-juve-2009' },
  { playerId: 'cur_cristiano_07', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cr7-real-2009' },
  { playerId: 'cur_kaka_07', from: 'milan', to: 'real_madrid', window: '2009-07', fee: 65_000_000, id: 'kaka-real-2009' },
  { playerId: 'cur_alonso_l6', from: 'liverpool', to: 'real_madrid', window: '2009-08', fee: 30_000_000, id: 'alonso-real-2009' },
  // ── Barça's dynasty recruitment ──
  { playerId: 'cur_daniel_alves_s6', from: 'sevilla', to: 'barcelona', window: '2008-07', fee: 32_500_000, id: 'alves-barca-2008' },
  { playerId: 'cur_villa_v6', from: 'valencia', to: 'barcelona', window: '2010-07', fee: 40_000_000, id: 'villa-barca-2010' },
  { playerId: 'cur_ronaldinho_b6', from: 'barcelona', to: 'milan', window: '2008-07', fee: 21_000_000, id: 'dinho-milan-2008' },
  { playerId: 'cur_etoo_b6', from: 'barcelona', to: 'inter', window: '2009-07', fee: 20_000_000, id: 'etoo-inter-2009', enabledBy: 'ibra-barca-2009' },
  { playerId: 'cur_ibrahimovic_07', from: 'inter', to: 'barcelona', window: '2009-07', fee: 46_000_000, id: 'ibra-barca-2009' },
  // ── Fernando Torres's move that built Liverpool's spine ──
  { playerId: 'cur_torres_a6', from: 'atletico', to: 'liverpool', window: '2007-07', fee: 26_500_000, id: 'torres-liverpool-2007' },
  { playerId: 'cur_mascherano_l6', from: 'liverpool', to: 'barcelona', window: '2010-08', fee: 24_000_000, id: 'masche-barca-2010' },
  // Gap-sweep: Benzema's arrival at Madrid (2009).
  { playerId: 'cur_benzema_07', from: 'lyon', to: 'real_madrid', window: '2009-07', fee: 30_000_000 },
];

const LEDGER_LA_LIGA_2003: RealTransferLedgerEntry[] = [
  // ── The LIVE opening window (summer 2003) — the dawn: Ronaldinho's move from PSG
  //    is the user's signature signing, and Beckham's galáctico switch is the rival
  //    business a Director can try to derail. ──
  { playerId: 'cur_ronaldinho_b3', from: 'psg', to: 'barcelona', window: '2003-07', fee: 30_000_000, id: 'ronaldinho-barca-2003' },
  { playerId: 'cur_beckham_r3', from: 'man_utd', to: 'real_madrid', window: '2003-07', fee: 25_000_000, id: 'beckham-real-2003b' },
  { playerId: 'cur_marquez_b3', from: 'monaco', to: 'barcelona', window: '2003-07', fee: 5_000_000, id: 'marquez-barca-2003' },
  // ── Barça's title-winning recruitment (the user's, if they are Barça) ──
  { playerId: 'cur_etoo_m3', from: 'mallorca', to: 'barcelona', window: '2004-07', fee: 16_000_000, id: 'etoo-barca-2004' },
  { playerId: 'cur_deco_p3', from: 'porto', to: 'barcelona', window: '2004-07', fee: 14_000_000, id: 'deco-barca-2004' },
  { playerId: 'cur_daniel_alves', from: 'sevilla', to: 'barcelona', window: '2008-07', fee: 32_500_000, id: 'alves-barca-2008' },
  // ── Real's galáctico churn: Morientes loaned out, then Owen and the 2009 marquees ──
  { playerId: 'cur_morientes_r3', from: 'real_madrid', to: 'monaco', window: '2003-08', fee: 0, id: 'morientes-monaco-2003' },
  { playerId: 'cur_owen_l3', from: 'liverpool', to: 'real_madrid', window: '2004-07', fee: 12_000_000, id: 'owen-real-2004' },
  { playerId: 'cur_cristiano_u3', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cr7-real-2009' },
  { playerId: 'cur_kaka_m3', from: 'milan', to: 'real_madrid', window: '2009-07', fee: 65_000_000, id: 'kaka-real-2009' },
  // ── Chelsea's spine, and Fernando Torres's move that built Liverpool's ──
  { playerId: 'cur_shevchenko_m3', from: 'milan', to: 'chelsea', window: '2006-07', fee: 43_800_000, id: 'sheva-chelsea-2006' },
  { playerId: 'cur_carvalho_p3', from: 'porto', to: 'chelsea', window: '2004-07', fee: 20_000_000, id: 'carvalho-chelsea-2004' },
  { playerId: 'cur_fernando_torres_a3', from: 'atletico', to: 'liverpool', window: '2007-07', fee: 26_500_000, id: 'torres-liverpool-2007' },
  // Gap-sweep: Barça's own era business — a declining Ronaldinho sold to Milan, and
  // David Villa arriving (the MSN forerunner).
  { playerId: 'cur_ronaldinho_b3', from: 'barcelona', to: 'milan', window: '2008-07', fee: 21_000_000 },
  { playerId: 'cur_villa_za03', from: 'zaragoza', to: 'barcelona', window: '2010-07', fee: 40_000_000 },
];

/**
 * Real Serie A market, 1998→2004 (inter-1998 "Il Fenomeno"). The calcio golden
 * age plays out: Ronaldo's record cash-out to Madrid (the user's to sanction if
 * they are Inter), Vieri's arrival, Zidane and Figo's galáctico moves, the
 * Parmalat fire-sale that fed the giants (Buffon/Thuram to Juve, Cannavaro to
 * Inter, Crespo/Verón to Lazio), and Sheva's leap from Kyiv to Milan.
 */
const LEDGER_1998_2004: RealTransferLedgerEntry[] = [
  // The LIVE opening window (summer 1998): Vieri's world-record move to Lazio — the
  // prelude to his real 1999 switch to Inter (the user) — is live and interceptable.
  { playerId: 'cur_vieri_l', from: 'atletico', to: 'lazio', window: '1998-07', fee: 28_000_000, id: 'vieri-lazio-1998' },
  // Roberto Baggio's move to Inter (the user's own marquee arrival) and Salas's to
  // Lazio round out the live 1998 window.
  { playerId: 'cur_baggio_i', from: 'bologna', to: 'inter', window: '1998-07', fee: 6_500_000, id: 'baggio-inter-1998' },
  { playerId: 'cur_salas', from: 'river_plate', to: 'lazio', window: '1998-07', fee: 12_000_000, id: 'salas-lazio-1998' },
  // ── Inter's business (the user's, if they are Inter) ──
  { playerId: 'cur_vieri_l', from: 'lazio', to: 'inter', window: '1999-07', fee: 46_000_000, id: 'vieri-inter-1999' },
  { playerId: 'cur_cannavaro_p8', from: 'parma', to: 'inter', window: '2002-07', fee: 23_000_000, id: 'cannavaro-inter-2002' },
  { playerId: 'cur_ronaldo_r9', from: 'inter', to: 'real_madrid', window: '2002-08', fee: 30_000_000, id: 'ronaldo-real-2002' },
  // ── The galáctico moves ──
  { playerId: 'cur_figo_b', from: 'barcelona', to: 'real_madrid', window: '2000-07', fee: 60_000_000, id: 'figo-real-2000' },
  { playerId: 'cur_zidane_j8', from: 'juventus', to: 'real_madrid', window: '2001-07', fee: 46_000_000, id: 'zidane-real-2001' },
  // ── Seedorf's real path: Real → Inter → Milan ──
  { playerId: 'cur_seedorf_r', from: 'real_madrid', to: 'inter', window: '2000-07', fee: 20_000_000, id: 'seedorf-inter-2000' },
  { playerId: 'cur_seedorf_r', from: 'inter', to: 'milan', window: '2002-07', fee: 18_000_000, id: 'seedorf-milan-2002' },
  // ── The Parmalat fire-sale feeds the giants ──
  { playerId: 'cur_buffon_p8', from: 'parma', to: 'juventus', window: '2001-07', fee: 52_000_000, id: 'buffon-juve-2001' },
  { playerId: 'cur_thuram_p8', from: 'parma', to: 'juventus', window: '2001-07', fee: 32_500_000, id: 'thuram-juve-2001' },
  { playerId: 'cur_veron_p', from: 'parma', to: 'lazio', window: '1999-07', fee: 18_000_000, id: 'veron-lazio-1999' },
  { playerId: 'cur_veron_p', from: 'lazio', to: 'man_utd', window: '2001-07', fee: 42_600_000, id: 'veron-utd-2001' },
  { playerId: 'cur_crespo_p', from: 'parma', to: 'lazio', window: '2000-07', fee: 56_000_000, id: 'crespo-lazio-2000' },
  // ── Lazio's title-winning recruitment then Cragnotti's crash ──
  { playerId: 'cur_nedved_l', from: 'lazio', to: 'juventus', window: '2001-07', fee: 41_000_000, id: 'nedved-juve-2001' },
  { playerId: 'cur_salas', from: 'lazio', to: 'juventus', window: '2001-07', fee: 22_000_000, id: 'salas-juve-2001' },
  // ── Milan and Roma rebuild around the Fiorentina fire-sale ──
  { playerId: 'cur_shevchenko_k8', from: 'dynamo_kyiv', to: 'milan', window: '1999-07', fee: 24_000_000, id: 'sheva-milan-1999' },
  { playerId: 'cur_inzaghi_j', from: 'juventus', to: 'milan', window: '2001-07', fee: 36_000_000, id: 'inzaghi-milan-2001' },
  { playerId: 'cur_batistuta', from: 'fiorentina', to: 'roma', window: '2000-07', fee: 32_500_000, id: 'bati-roma-2000' },
  { playerId: 'cur_rui_costa_f', from: 'fiorentina', to: 'milan', window: '2001-07', fee: 42_000_000, id: 'ruicosta-milan-2001' },
];

/**
 * Real Serie A / European market, 2007→2013 (milan-2007 "Last Dance"). The ageing
 * champions are broken up: Kaká's record move to Madrid (the user's to sanction if
 * they are Milan), Pirlo's free-transfer exit to Juventus that builds the dynasty,
 * and the great 2009 galáctico churn (Cristiano to Madrid, Ibra/Eto'o swap, the
 * Liverpool spine cashed in).
 */
const LEDGER_2007_2013: RealTransferLedgerEntry[] = [
  // The LIVE opening window (summer 2007, milan-2007): Emerson's move from Real is
  // Milan's real-in decision as the champions try to hold off the fall.
  { playerId: 'cur_emerson_07', from: 'real_madrid', to: 'milan', window: '2007-07', fee: 4_000_000, id: 'emerson-milan-2007' },
  { playerId: 'cur_oddo', from: 'lazio', to: 'milan', window: '2007-07', fee: 6_500_000, id: 'oddo-milan-2007' },
  // The Calciopoli exodus (juventus-2006, summer 2006): the mercenaries flee Serie B
  // — a Juventus Director sanctions the fire-sale or keeps them for the fight back up.
  { playerId: 'cur_vieira_07', from: 'juventus', to: 'inter', window: '2006-07', fee: 9_500_000, id: 'vieira-inter-2006' },
  { playerId: 'cur_cannavaro_f07', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 7_000_000, id: 'cannavaro-real-2006b' },
  { playerId: 'cur_ibrahimovic_07', from: 'juventus', to: 'inter', window: '2006-07', fee: 24_800_000, id: 'ibra-inter-2006' },
  // ── Milan's business (the user's, if they are Milan) ──
  { playerId: 'cur_kaka_07', from: 'milan', to: 'real_madrid', window: '2009-07', fee: 65_000_000, id: 'kaka-real-2009' },
  { playerId: 'cur_pirlo_07', from: 'milan', to: 'juventus', window: '2011-07', fee: 0, id: 'pirlo-juve-2011' },
  { playerId: 'cur_ibrahimovic_07', from: 'barcelona', to: 'milan', window: '2010-08', fee: 24_000_000, id: 'ibra-milan-2010', enabledBy: 'ibra-barca-2009' },
  // ── The 2009 galáctico churn ──
  { playerId: 'cur_cristiano_07', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cr7-real-2009' },
  { playerId: 'cur_robben_07', from: 'real_madrid', to: 'bayern', window: '2009-08', fee: 25_000_000, id: 'robben-bayern-2009', enabledBy: 'cr7-real-2009' },
  { playerId: 'cur_sneijder_07', from: 'real_madrid', to: 'inter', window: '2009-08', fee: 15_000_000, id: 'sneijder-inter-2009', enabledBy: 'cr7-real-2009' },
  { playerId: 'cur_ibrahimovic_07', from: 'inter', to: 'barcelona', window: '2009-07', fee: 46_000_000, id: 'ibra-barca-2009' },
  { playerId: 'cur_etoo_07', from: 'barcelona', to: 'inter', window: '2009-07', fee: 20_000_000, id: 'etoo-inter-2009', enabledBy: 'ibra-barca-2009' },
  // ── The Liverpool spine cashed in ──
  { playerId: 'cur_alonso_07', from: 'liverpool', to: 'real_madrid', window: '2009-08', fee: 30_000_000, id: 'alonso-real-2009' },
  { playerId: 'cur_mascherano_07', from: 'liverpool', to: 'barcelona', window: '2010-08', fee: 24_000_000, id: 'masche-barca-2010' },
  { playerId: 'cur_torres_07', from: 'liverpool', to: 'chelsea', window: '2011-01', fee: 50_000_000, id: 'torres-chelsea-2011' },
  // ── Higuaín cashed in as Madrid reload ──
  { playerId: 'cur_higuain_07', from: 'real_madrid', to: 'napoli', window: '2013-07', fee: 39_000_000, id: 'higuain-napoli-2013' },
  // Gap-sweep: Robinho's move to Milan (2010) for the milan-2007 world.
  { playerId: 'cur_robinho_07', from: 'real_madrid', to: 'milan', window: '2010-08', fee: 18_000_000 },
];

/**
 * Real Serie A / European market, 2004→2009 (inter-2004 "Pre-Calciopoli"). The
 * 2006 scandal breaks up Juventus (Cannavaro/Emerson to Madrid, Thuram/Zambrotta
 * to Barça, and — the hinge — Ibrahimović to Inter), then the great galáctico
 * churn plays out. Vieri's move across Milan and Ronaldinho's later arrival close
 * the era.
 */
const LEDGER_SERIE_A_2004: RealTransferLedgerEntry[] = [
  // The LIVE opening window (summer 2004): Emerson's move from Roma to Juventus is
  // live business a Director can intercept before the champions strengthen.
  { playerId: 'cur_emerson_04', from: 'roma', to: 'juventus', window: '2004-07', fee: 28_000_000, id: 'emerson-juve-2004' },
  { playerId: 'cur_ibrahimovic_04', from: 'ajax', to: 'juventus', window: '2004-07', fee: 16_000_000, id: 'ibra-juve-2004' },
  // Cambiasso's free arrival at Inter (the user) — a real-in decision, not a done deal.
  { playerId: 'cur_cambiasso_04', from: 'real_madrid', to: 'inter', window: '2004-07', fee: 0, id: 'cambiasso-inter-2004' },
  // ── The Calciopoli exodus feeds Inter (the user) and the giants ──
  { playerId: 'cur_ibrahimovic_04', from: 'juventus', to: 'inter', window: '2006-07', fee: 16_600_000, id: 'ibra-inter-2006' },
  { playerId: 'cur_cannavaro_f04', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 7_000_000, id: 'cannavaro-real-2006' },
  { playerId: 'cur_emerson_04', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 13_000_000, id: 'emerson-real-2006' },
  { playerId: 'cur_thuram_04', from: 'juventus', to: 'barcelona', window: '2006-07', fee: 5_000_000, id: 'thuram-barca-2006' },
  { playerId: 'cur_zambrotta_04', from: 'juventus', to: 'barcelona', window: '2006-07', fee: 10_000_000, id: 'zambrotta-barca-2006' },
  // ── Inter's own business ──
  { playerId: 'cur_vieri_04', from: 'inter', to: 'milan', window: '2005-01', fee: 0, id: 'vieri-milan-2005' },
  // ── Milan's business (Sheva out, Ronaldinho in) ──
  { playerId: 'cur_shevchenko_04', from: 'milan', to: 'chelsea', window: '2006-07', fee: 43_800_000, id: 'sheva-chelsea-2006' },
  { playerId: 'cur_ronaldinho_04', from: 'barcelona', to: 'milan', window: '2008-07', fee: 21_000_000, id: 'dinho-milan-2008' },
  // ── Roma cash in on Cassano ──
  { playerId: 'cur_cassano_04', from: 'roma', to: 'real_madrid', window: '2006-01', fee: 5_000_000, id: 'cassano-real-2006' },
  // ── The 2009 galáctico churn + the Ibra/Eto'o swap ──
  { playerId: 'cur_cristiano_04', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cr7-real-2009' },
  { playerId: 'cur_kaka_04', from: 'milan', to: 'real_madrid', window: '2009-07', fee: 65_000_000, id: 'kaka-real-2009' },
  { playerId: 'cur_alonso_04', from: 'liverpool', to: 'real_madrid', window: '2009-08', fee: 30_000_000, id: 'alonso-real-2009' },
  { playerId: 'cur_ibrahimovic_04', from: 'inter', to: 'barcelona', window: '2009-07', fee: 46_000_000, id: 'ibra-barca-2009' },
  { playerId: 'cur_etoo_04', from: 'barcelona', to: 'inter', window: '2009-07', fee: 20_000_000, id: 'etoo-inter-2009', enabledBy: 'ibra-barca-2009' },
  // ── Torres's move that built Liverpool's spine ──
  { playerId: 'cur_torres_a04', from: 'atletico', to: 'liverpool', window: '2007-07', fee: 26_500_000, id: 'torres-liverpool-2007' },
  { playerId: 'cur_robben_04', from: 'chelsea', to: 'real_madrid', window: '2007-08', fee: 35_000_000, id: 'robben-real-2007' },
  // Gap-sweep: Figo's free move from Madrid to Inter (2005).
  { playerId: 'cur_figo_04', from: 'real_madrid', to: 'inter', window: '2005-07', fee: 0 },
];

/** Pato's knee — the wonderkid whose body betrayed him — and the ageing champions'
 *  brittleness. Fire only if the player is still at his real club. */
const INJURIES_2007: RealInjuryEntry[] = [
  { playerId: 'cur_pato_07', atClub: 'milan', since: '2010-09', months: 5, serious: true, note: 'recurrent thigh injuries that wrecked a golden career' },
  { playerId: 'cur_nesta_07', atClub: 'milan', since: '2008-02', months: 3, serious: false, note: 'chronic back and knee trouble' },
];

/** Ronaldo's ruptured knee — the era's defining injury. Fires only if Il Fenomeno
 *  is still at Inter (a user who cashed him in never sees it). */
const INJURIES_1998: RealInjuryEntry[] = [
  { playerId: 'cur_ronaldo_r9', atClub: 'inter', since: '1999-11', months: 15, serious: true, note: 'ruptured knee tendon, then a relapse in his comeback match — the injury that stole his peak' },
  { playerId: 'cur_delpiero_j8', atClub: 'juventus', since: '1998-11', months: 6, serious: true, note: 'cruciate ligament rupture at Udinese' },
];

/** Registry keyed by era pack id. */
export const ERA_REALITY: Record<string, EraRealityPack> = {
  'era-1996': { realTransferLedger: LEDGER_1996_2001, academyIntakes: INTAKES_1999, realInjuries: [], academyGraduates: GRADUATES_1999 },
  'era-1995-2005': { realTransferLedger: LEDGER_1999_2004, academyIntakes: INTAKES_1999, realInjuries: INJURIES_1999, academyGraduates: GRADUATES_1999 },
  'era-2013': { realTransferLedger: LEDGER_2013_2016, academyIntakes: INTAKES_1999, realInjuries: INJURIES_2013, academyGraduates: GRADUATES_1999 },
  'era-2004': { realTransferLedger: LEDGER_2004_2009, academyIntakes: INTAKES_1999, realInjuries: INJURIES_2004, nearMissLedger: NEAR_MISS_2004, academyGraduates: GRADUATES_1999 },
  'era-2001': { realTransferLedger: LEDGER_2001_2005, academyIntakes: INTAKES_1999, realInjuries: INJURIES_2001, academyGraduates: GRADUATES_1999 },
  'era-2000': { realTransferLedger: LEDGER_2000_2006, academyIntakes: INTAKES_ESP, realInjuries: INJURIES_2000, academyGraduates: GRADUATES_ESP },
  'era-serie-a-1995': { realTransferLedger: LEDGER_1995_2001, academyIntakes: INTAKES_ITA, realInjuries: INJURIES_1995, academyGraduates: GRADUATES_ITA },
  'era-serie-a-1998': { realTransferLedger: LEDGER_1998_2004, academyIntakes: INTAKES_ITA, realInjuries: INJURIES_1998, academyGraduates: GRADUATES_ITA },
  'era-la-liga-2003': { realTransferLedger: LEDGER_LA_LIGA_2003, academyIntakes: INTAKES_ESP, realInjuries: [], academyGraduates: GRADUATES_ESP },
  'era-la-liga-2006': { realTransferLedger: LEDGER_LA_LIGA_2006, academyIntakes: INTAKES_ESP, realInjuries: [], academyGraduates: GRADUATES_ESP },
  'era-la-liga-2014': { realTransferLedger: LEDGER_LA_LIGA_2014, academyIntakes: INTAKES_ESP, realInjuries: [], academyGraduates: GRADUATES_ESP },
  'era-eng-2008': { realTransferLedger: LEDGER_ENG_2008, academyIntakes: INTAKES_1999, realInjuries: [], academyGraduates: GRADUATES_1999 },
  'era-eng-2010': { realTransferLedger: LEDGER_ENG_2010, academyIntakes: INTAKES_1999, realInjuries: [], nearMissLedger: NEAR_MISS_ENG_2010, academyGraduates: GRADUATES_1999 },
  'era-eng-1995': { realTransferLedger: LEDGER_ENG_1995, academyIntakes: INTAKES_1999, realInjuries: [], academyGraduates: GRADUATES_1999 },
  'era-bundesliga-1997': { realTransferLedger: LEDGER_BUNDESLIGA_1997, academyIntakes: INTAKES_GER, realInjuries: [], academyGraduates: GRADUATES_GER },
  'era-bundesliga-1998': { realTransferLedger: LEDGER_BUNDESLIGA_1997, academyIntakes: INTAKES_GER, realInjuries: [], academyGraduates: GRADUATES_GER },
  'era-bundesliga-2009': { realTransferLedger: LEDGER_BUNDESLIGA_2009, academyIntakes: INTAKES_GER, realInjuries: [], academyGraduates: GRADUATES_GER },
  'era-bundesliga-2012': { realTransferLedger: LEDGER_BUNDESLIGA_2012, academyIntakes: INTAKES_GER, realInjuries: [], academyGraduates: GRADUATES_GER },
  'era-serie-a-2004': { realTransferLedger: LEDGER_SERIE_A_2004, academyIntakes: INTAKES_ITA, realInjuries: [], academyGraduates: GRADUATES_ITA },
  // Juventus 2006 rejoins the late-2000s Serie A world from 2007, so it draws on
  // the same reality ledger — Pirlo's 2011 free transfer to Juventus included.
  'era-serie-a-2006': { realTransferLedger: LEDGER_2007_2013, academyIntakes: INTAKES_ITA, realInjuries: INJURIES_2007, academyGraduates: GRADUATES_ITA },
  'era-serie-a-2007': { realTransferLedger: LEDGER_2007_2013, academyIntakes: INTAKES_ITA, realInjuries: INJURIES_2007, academyGraduates: GRADUATES_ITA },
  'era-2003': { realTransferLedger: LEDGER_2003_2011, academyIntakes: [], realInjuries: INJURIES_2003, nearMissLedger: NEAR_MISS_2003 },
};

/** The era pack a scenario draws its reality data from. */
export function eraForScenario(scenarioId: string): string {
  // The Serie A cluster is routed explicitly: its year suffixes (‑2004, ‑2006,
  // ‑2007) would otherwise collide with the English/other era packs.
  if (scenarioId === 'man-city-2008') return 'era-eng-2008';
  if (scenarioId === 'liverpool-2010') return 'era-eng-2010';
  // liverpool-1995 must precede the '-1995' suffix check (which is Serie A / milan).
  if (scenarioId === 'liverpool-1995') return 'era-eng-1995';
  if (scenarioId === 'dortmund-1997') return 'era-bundesliga-1997';
  if (scenarioId === 'bayern-1998') return 'era-bundesliga-1998';
  if (scenarioId === 'dortmund-2012') return 'era-bundesliga-2012';
  if (scenarioId === 'bayern-2009') return 'era-bundesliga-2009';
  if (scenarioId === 'barcelona-2003') return 'era-la-liga-2003';
  if (scenarioId === 'real-madrid-2006') return 'era-la-liga-2006';
  if (scenarioId === 'barcelona-2014') return 'era-la-liga-2014';
  if (scenarioId === 'inter-1998') return 'era-serie-a-1998';
  if (scenarioId === 'inter-2004') return 'era-serie-a-2004';
  if (scenarioId === 'milan-2007') return 'era-serie-a-2007';
  if (scenarioId === 'juventus-2006') return 'era-serie-a-2006';
  if (scenarioId.endsWith('-2013')) return 'era-2013';
  if (scenarioId.endsWith('-2004')) return 'era-2004';
  if (scenarioId.endsWith('-2003')) return 'era-2003';
  if (scenarioId.endsWith('-2001')) return 'era-2001';
  if (scenarioId.endsWith('-2000')) return 'era-2000';
  if (scenarioId.endsWith('-1996')) return 'era-1996';
  if (scenarioId.endsWith('-1995')) return 'era-serie-a-1995';
  return 'era-1995-2005';
}

/**
 * Pressure state driving ambition overrides (Amendment A). Higher = more likely
 * to deviate from the real ledger with an ambitious, logged, plausibility-gated
 * move. Wired into ClubState and the Rival AI in M8.
 */
export interface ClubPressure {
  /** Seasons without a trophy relative to expectation. */
  trophyDrought: number;
  /** Manager job security, 0 (about to be sacked) – 100. */
  jobSecurity: number;
  /** Fan/board unrest, 0 (content) – 100. */
  unrest: number;
  /** A rival's perceived dominance, 0 – 100. */
  rivalDominance: number;
  /** Recent financial windfall available for a statement signing, 0 – 100. */
  windfall: number;
}

/** An ambition override: a pressure-driven deviation from the real ledger. */
export interface AmbitionOverride {
  clubId: ClubId;
  targetPlayerId: PlayerId;
  /** Which pressure component crossed threshold. */
  cause: keyof ClubPressure;
  window: YearMonth;
}

/**
 * A procedural player is anonymous depth (Principle 2): NEVER a scoutable
 * prospect, academy intake, or narrative subject. Real players are `curated`.
 */
export function isProcedural(player: { curated: boolean }): boolean {
  return player.curated === false;
}
