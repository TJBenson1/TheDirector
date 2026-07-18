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

import type { ClubId, FinancialHealth, PlayerId, YearMonth } from './types.js';

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
}

/** The key an entry is tracked by (supports multiple moves per player). */
export function entryKey(e: RealTransferLedgerEntry): string {
  return e.id ?? `${e.playerId}@${e.window}->${e.to}`;
}

/** Which tier satisfied an invalidated ledger entry (recorded for audit). */
export type FallbackTier = 'real-backup' | 'profile-similar' | 'generic-needs';

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

/** When a real player actually hung up his boots. Curated players retire within
 *  ~1 year of this (± user influence on the user's own squad — see ageing.ts).
 *  Players NOT listed fall back to a position-based age threshold. */
export interface RealRetirement {
  playerId: PlayerId;
  year: number;
}

/**
 * A real academy graduate who breaks into his club's first team in a given year
 * — the REAL-players-only youth pipeline (Principle 2). The seed is a full
 * curated player (see data/curated-*.ts); he is instantiated into the squad, at
 * a youth age, in `year`. This is how squads renew without fabricating players.
 */
export interface AcademyGraduate {
  year: number;
  /** The real graduate's curated seed (typed loosely to avoid a data-module
   *  import cycle; validated at instantiation). */
  seed: {
    id: PlayerId;
    club: ClubId;
    name: string;
    birthYear: number;
    nationality: string;
    positions: string[];
    ability: number;
    potentialCeiling: number;
    birthCeiling?: number;
    latentCeiling?: number;
    contractUntil: number;
    injuryProneness: number;
    personality: {
      professionalism: number;
      ego: number;
      ambition: number;
      loyalty: number;
      volatility: number;
      adaptability: number;
    };
    loyalty?: number;
  };
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

/**
 * A transfer that ALMOST happened — a real, well-documented deal that collapsed
 * or was passed up in reality (Moyes's United bidding twice for Cesc and bottling
 * it; Inter chasing Batistuta for years before Roma got him). Unlike the reality
 * ledger (which HOLDS reality by default), a near-miss is a COUNTERFACTUAL the
 * user can seize:
 *   - If `almostTo` is the user's club, he is offered the signing reality didn't
 *     complete — take it (divergence) or let it collapse as it really did.
 *   - If `from` is the user's club, a club that nearly bought his player comes
 *     back — sanction the sale (divergence) or keep him (reality).
 *   - When the user is not involved, reality holds automatically (see `realTo`).
 * Doing nothing always reproduces history — that is the whole point.
 */
/** Why an almost-deal collapsed in reality — the documented cause, linked to the
 *  narrative and (for a hijack) to `realTo`. */
export type NearMissReason =
  | 'hijack' // a rival swooped in and signed him (realTo = that rival)
  | 'other-target' // the club signed someone else instead
  | 'manager' // a manager/board declined, or a manager elsewhere blocked it
  | 'fee' // clubs couldn't agree a fee
  | 'wages' // wages / personal terms collapsed
  | 'player-choice' // the player chose to go elsewhere / stay
  | 'board' // the SELLING club refused (he stayed)
  | 'medical'; // failed a medical

/** A self-contained player seed carried by a near-miss so the subject need not be
 *  pre-curated: the player is spawned (at the user's club) only if the deal is
 *  actually completed. Mirrors the academy-graduate seed shape. */
export interface NearMissSeed {
  id: PlayerId;
  name: string;
  birthYear: number;
  nationality: string;
  positions: string[];
  ability: number;
  potentialCeiling: number;
  contractUntil: number;
  injuryProneness: number;
  personality: ReturnType<typeof per>;
  latentCeiling?: number;
  archetype?: string;
}

export interface NearMissEntry {
  /** The player. For a seed-based entry this is `seed.id` (a virtual player,
   *  spawned only on completion); for a legacy entry it is an already-curated id
   *  who must still be at `from` for the near-miss to be live. */
  playerId: PlayerId;
  from: ClubId | null;
  /** The club that ALMOST signed him (the counterfactual buyer). */
  almostTo: ClubId;
  /** Where he ACTUALLY ended up if the deal collapsed. Omit/null = he stayed at
   *  `from` (Cesc, Baines). Set it (Batistuta → Roma) and reality moves him there
   *  when the user passes (legacy/curated entries only). */
  realTo?: ClubId | null;
  window: YearMonth;
  /** The fee the `almostTo` club would have paid (the counterfactual deal). */
  fee: number;
  /** The fee of the real move, if `realTo` is set (defaults to `fee`). */
  realFee?: number;
  /** One-line narrative of what really happened (shown in the decision). */
  note: string;
  /** Why it collapsed in reality (M-nearmiss). */
  reason?: NearMissReason;
  /** Self-contained seed for a not-otherwise-curated subject (spawn on sign). */
  seed?: NearMissSeed;
}

/**
 * Concise builder for a seed-based near-miss from the flat research format. The
 * counterfactual is offered to the user in the real `window`, and (unlike a
 * speculative transfer) completing it is a GUARANTEED signing — reality had the
 * deal all but done, so it is more likely to happen than an ordinary target.
 */
export function nm(o: {
  reason: NearMissReason;
  window: YearMonth;
  from: ClubId | null;
  almostTo: ClubId;
  realTo?: ClubId | null;
  fee: number;
  realFee?: number;
  id: string;
  name: string;
  birthYear: number;
  nationality: string;
  positions: string[];
  ability: number;
  ceiling: number;
  proneness: number;
  per: [number, number, number, number, number, number];
  note: string;
  latentCeiling?: number;
  archetype?: string;
}): NearMissEntry {
  const id = o.id.startsWith('nm_') ? o.id : `nm_${o.id}`;
  return {
    playerId: id,
    from: o.from,
    almostTo: o.almostTo,
    realTo: o.realTo ?? null,
    window: o.window,
    fee: o.fee,
    realFee: o.realFee ?? o.fee,
    note: o.note,
    reason: o.reason,
    seed: {
      id,
      name: o.name,
      birthYear: o.birthYear,
      nationality: o.nationality,
      positions: o.positions,
      ability: o.ability,
      potentialCeiling: o.ceiling,
      contractUntil: Number(o.window.slice(0, 4)) + 4,
      injuryProneness: o.proneness,
      personality: per(...o.per),
      ...(o.latentCeiling !== undefined ? { latentCeiling: o.latentCeiling } : {}),
      ...(o.archetype ? { archetype: o.archetype } : {}),
    },
  };
}

/** The key a near-miss is tracked by (one presentation per player per window). */
export function nearMissKey(e: NearMissEntry): string {
  return `${e.playerId}@${e.window}~>${e.almostTo}`;
}

/**
 * A club that really fell into financial distress mid-era — Calciopoli's Serie-B
 * Juventus, Leeds' post-overreach collapse, Parma's Parmalat crash. When the year
 * arrives the club's `financialHealth` drops, which (see recommend.ts / ledgerExec)
 * makes it a cheap, raidable fire-sale: exactly the "capitalise on a club in
 * distress" window. Fires once (tracked in meta.appliedFinancialShocks).
 */
export interface FinancialShock {
  clubId: ClubId;
  year: number;
  health: FinancialHealth;
  note?: string;
}

/** Per-era reality data. */
export interface EraRealityPack {
  realTransferLedger: RealTransferLedgerEntry[];
  academyIntakes: AcademyIntake[];
  realInjuries: RealInjuryEntry[];
  /** Clubs that fall into distress mid-era (a raidable fire-sale opens). */
  financialShocks?: FinancialShock[];
  /** Real retirement years for curated players (age-based fallback otherwise). */
  retirements?: RealRetirement[];
  /** Real youth graduates who break through during the era (real players only). */
  academyGraduates?: AcademyGraduate[];
  /** "Almost happened" deals the user can seize (see `NearMissEntry`). */
  nearMisses?: NearMissEntry[];
}

/**
 * Real transfers among tracked (non-user) clubs, 1999–2004 — a seed slice of the
 * full ledger (the complete curation is ongoing data work). Each subject player
 * is curated at his source club (data/curated-1999.ts) so the entry can execute
 * on schedule. The AI executes these by DEFAULT; a user action that invalidates
 * one triggers the fallback + a logged butterfly (§9f).
 */
const LEDGER_1999_2004: RealTransferLedgerEntry[] = [
  { playerId: 'cur_anelka', from: 'arsenal', to: 'real_madrid', window: '1999-08', fee: 22_000_000 },
  { playerId: 'cur_mcmanaman', from: 'liverpool', to: 'real_madrid', window: '1999-08', fee: 0 },
  { playerId: 'cur_overmars', from: 'arsenal', to: 'barcelona', window: '2000-07', fee: 25_000_000 },
  { playerId: 'cur_figo', from: 'barcelona', to: 'real_madrid', window: '2000-07', fee: 37_000_000 },
  { playerId: 'cur_redondo', from: 'real_madrid', to: 'milan', window: '2000-08', fee: 11_000_000 },
  { playerId: 'cur_campbell', from: 'spurs', to: 'arsenal', window: '2001-07', fee: 0 },
  { playerId: 'cur_rkeane', from: 'leeds', to: 'spurs', window: '2002-07', fee: 7_000_000 },
  { playerId: 'cur_ferdinand', from: 'leeds', to: 'man_utd', window: '2002-07', fee: 30_000_000 },
  { playerId: 'cur_woodgate', from: 'leeds', to: 'newcastle', window: '2003-01', fee: 9_000_000 },
  { playerId: 'cur_crespo', from: 'inter', to: 'chelsea', window: '2003-07', fee: 16_800_000 },
  { playerId: 'cur_shevchenko', from: 'milan', to: 'chelsea', window: '2006-07', fee: 30_000_000 },
  { playerId: 'cur_owen', from: 'liverpool', to: 'real_madrid', window: '2004-07', fee: 8_000_000 },
  { playerId: 'cur_nedved', from: 'lazio', to: 'juventus', window: '2001-07', fee: 25_000_000 },

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
  { playerId: 'cur_cristiano', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cr7-real-2009' },
  { playerId: 'cur_robben', from: 'real_madrid', to: 'bayern', window: '2009-08', fee: 25_000_000, enabledBy: 'cr7-real-2009' },
  { playerId: 'cur_sneijder', from: 'real_madrid', to: 'inter', window: '2009-08', fee: 15_000_000, enabledBy: 'cr7-real-2009' },
  // United reinvested some of the Ronaldo money on depth — probably, not surely.
  { playerId: 'cur_valencia_w', from: 'wigan', to: 'man_utd', window: '2009-06', fee: 16_000_000, id: 'valencia-utd-2009', enabledBy: 'cr7-real-2009', cancelChance: 0.5 },
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
  { playerId: 'cur_thiago', from: 'barcelona', to: 'bayern', window: '2013-07', fee: 22_000_000 },
  // Madrid only sold Özil to raise/clear the Bale money — no Bale, no Özil sale.
  { playerId: 'cur_ozil', from: 'real_madrid', to: 'arsenal', window: '2013-08', fee: 42_000_000, enabledBy: 'bale-real-2013' },
  { playerId: 'cur_fellaini', from: 'everton', to: 'man_utd', window: '2013-08', fee: 27_500_000 },
  // Spurs' rebuild was funded by SELLING Bale for a huge fee — which happens
  // whether he joins Madrid or you, so the Magnificent Seven arrive regardless.
  { playerId: 'cur_lamela', from: 'roma', to: 'spurs', window: '2013-08', fee: 26_000_000 },
  { playerId: 'cur_soldado', from: 'valencia', to: 'spurs', window: '2013-08', fee: 26_000_000 },
  { playerId: 'cur_eriksen', from: 'ajax', to: 'spurs', window: '2013-08', fee: 11_500_000 },
  { playerId: 'cur_suarez', from: 'liverpool', to: 'barcelona', window: '2014-07', fee: 65_000_000, id: 'suarez-barca-2014' },
  // Barça part-funded Suárez by selling Sánchez — no Suárez, no Sánchez sale.
  { playerId: 'cur_alexis', from: 'barcelona', to: 'arsenal', window: '2014-07', fee: 35_000_000, enabledBy: 'suarez-barca-2014' },
  { playerId: 'cur_dimaria', from: 'real_madrid', to: 'man_utd', window: '2014-08', fee: 59_700_000 },
  { playerId: 'cur_lukeshaw', from: 'southampton', to: 'man_utd', window: '2014-06', fee: 30_000_000 },
  { playerId: 'cur_lallana', from: 'southampton', to: 'liverpool', window: '2014-07', fee: 25_000_000 },
  // The newly-curated European clubs sell on: Matić back to Chelsea, Benatia to
  // Bayern, Mathieu to Barça, Ménez to Milan, Marković to Liverpool, Pjanić to
  // Juve — and Daley Blind's real move to United, offered to the user as a signing.
  { playerId: 'cur_matic13', from: 'benfica', to: 'chelsea', window: '2014-01', fee: 21_000_000 },
  { playerId: 'cur_blind13', from: 'ajax', to: 'man_utd', window: '2014-08', fee: 14_000_000 },
  { playerId: 'cur_benatia13', from: 'roma', to: 'bayern', window: '2014-08', fee: 28_000_000 },
  { playerId: 'cur_mathieu13', from: 'valencia', to: 'barcelona', window: '2014-07', fee: 16_000_000 },
  { playerId: 'cur_menez13', from: 'psg', to: 'milan', window: '2014-07', fee: 0 },
  { playerId: 'cur_markovic13', from: 'benfica', to: 'liverpool', window: '2014-07', fee: 20_000_000 },
  { playerId: 'cur_pjanic13', from: 'roma', to: 'juventus', window: '2016-07', fee: 32_000_000 },
  // Mid-club stars moving up the food chain — the real deals a Man Utd '13 user
  // could gazump (sign the man before the big club does).
  { playerId: 'cur_cabaye13', from: 'newcastle', to: 'psg', window: '2014-01', fee: 19_000_000 },
  { playerId: 'cur_bony13', from: 'swansea', to: 'man_city', window: '2015-01', fee: 28_000_000 },
  { playerId: 'cur_benteke13', from: 'aston_villa', to: 'liverpool', window: '2015-07', fee: 32_500_000 },
  { playerId: 'cur_delph13', from: 'aston_villa', to: 'man_city', window: '2015-07', fee: 8_000_000 },
];

/**
 * The Moyes summer of near-misses (2013). United, defending champions, spent the
 * window chasing and bottling: two bids for Fàbregas rejected by Barça, a low
 * offer for Baines snubbed by Everton, dithering over Thiago and Bale (both in
 * the reality ledger, going to Bayern/Madrid). Playing that United, you get the
 * deals Moyes couldn't close — take them, or repeat the summer that set the tone
 * for the whole reign. Fàbregas and Baines both stayed put in reality (realTo
 * omitted); pass, and they stay exactly as they did.
 */
const NEARMISS_2013: NearMissEntry[] = [
  {
    playerId: 'cur_cesc',
    from: 'barcelona',
    almostTo: 'man_utd',
    window: '2013-08',
    fee: 30_000_000,
    note: 'United bid twice for Fàbregas; Barcelona rejected both and he stayed.',
  },
  {
    playerId: 'cur_baines',
    from: 'everton',
    almostTo: 'man_utd',
    window: '2013-08',
    fee: 15_000_000,
    note: 'United’s offers for Baines were snubbed by Everton; he stayed on Merseyside.',
  },
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
  // Chelsea's real 2004 arrivals — at their source clubs, joining via the ledger,
  // so intercepting one is a butterfly and a deprived Chelsea buys an alternative.
  { playerId: 'cur_drogba', from: 'marseille', to: 'chelsea', window: '2004-07', fee: 24_000_000, id: 'drogba-chelsea-2004' },
  { playerId: 'cur_robben2', from: 'psv', to: 'chelsea', window: '2004-07', fee: 12_000_000, id: 'robben-chelsea-2004' },
  { playerId: 'cur_vieira2', from: 'arsenal', to: 'juventus', window: '2005-07', fee: 13_750_000, id: 'vieira-juve-2005' },
  { playerId: 'cur_acole', from: 'arsenal', to: 'chelsea', window: '2006-08', fee: 16_000_000, id: 'cole-chelsea-2006' },
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
  { playerId: 'cur_berbatov', from: 'spurs', to: 'man_utd', window: '2008-08', fee: 30_750_000, id: 'berba-utd-2008' },
  // Chelsea and Liverpool's real strengthening.
  { playerId: 'cur_essien', from: 'lyon', to: 'chelsea', window: '2005-08', fee: 24_400_000, id: 'essien-chelsea-2005' },
  { playerId: 'cur_ballack', from: 'bayern', to: 'chelsea', window: '2006-07', fee: 0, id: 'ballack-chelsea-2006' },
  { playerId: 'cur_shevchenko2', from: 'milan', to: 'chelsea', window: '2006-07', fee: 30_000_000, id: 'shevchenko-chelsea-2006' },
  { playerId: 'cur_torres', from: 'atletico', to: 'liverpool', window: '2007-07', fee: 26_500_000, id: 'torres-liverpool-2007' },
  { playerId: 'cur_alonso', from: 'liverpool', to: 'real_madrid', window: '2009-07', fee: 30_000_000, id: 'alonso-real-2009' },
  // Barça sign Eto'o (2004): a settled, happy star — so he is NOT a soft
  // fallback for an English club later; Villa is the more available option.
  { playerId: 'cur_etoo', from: 'mallorca', to: 'barcelona', window: '2004-07', fee: 16_000_000, id: 'etoo-barca-2004' },
  // Villa's breakout move: Zaragoza → Valencia (2005), the step up that launched
  // him. Prise him from Zaragoza first (food-chain discount) and reality diverges.
  { playerId: 'cur_villa04', from: 'zaragoza', to: 'valencia', window: '2005-07', fee: 8_000_000, id: 'villa-valencia-2005' },
  // Gabriel Milito's real 2007 move to Barcelona — another Zaragoza sale a big
  // club can beat them to.
  { playerId: 'cur_milito04', from: 'zaragoza', to: 'barcelona', window: '2007-07', fee: 17_000_000, id: 'gmilito-barca-2007' },
  // Arsenal's real replacements — OFFERED to the user (their club), declinable.
  { playerId: 'cur_adebayor', from: 'monaco', to: 'arsenal', window: '2006-01', fee: 7_000_000, id: 'adebayor-arsenal-2006' },
  { playerId: 'cur_rosicky', from: 'dortmund', to: 'arsenal', window: '2006-07', fee: 6_800_000, id: 'rosicky-arsenal-2006' },
  { playerId: 'cur_nasri', from: 'marseille', to: 'arsenal', window: '2008-07', fee: 12_000_000, id: 'nasri-arsenal-2008' },
  { playerId: 'cur_arshavin', from: 'zenit', to: 'arsenal', window: '2009-01', fee: 15_000_000, id: 'arshavin-arsenal-2009' },

  // ── Calciopoli (2006): Juventus, stripped of two titles and relegated to Serie
  // B, are forced into a fire-sale (financialShocks drops them into crisis the
  // same summer). The champions scatter cheaply — pick them from the wreckage, or
  // let reality hold. This is the marquee "capitalise on a club in distress" beat.
  { playerId: 'cur_cannavaro04', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 5_000_000, id: 'cannavaro-madrid-2006' },
  { playerId: 'cur_emerson04', from: 'juventus', to: 'real_madrid', window: '2006-07', fee: 20_000_000, id: 'emerson-madrid-2006' },
  { playerId: 'cur_thuram04', from: 'juventus', to: 'barcelona', window: '2006-07', fee: 5_000_000, id: 'thuram-barca-2006' },
  { playerId: 'cur_zambrotta04', from: 'juventus', to: 'barcelona', window: '2006-07', fee: 10_000_000, id: 'zambrotta-barca-2006' },
  { playerId: 'cur_ibrahimovic04', from: 'juventus', to: 'inter', window: '2006-08', fee: 16_600_000, id: 'ibra-inter-2006' },

  // ── Porto's post-2004-CL sell-off: the classic feeder club cashing in as its
  // stars rise. A big side can pick them off EARLY (food-chain discount + they
  // want the step up) before these real moves land.
  { playerId: 'cur_nunovalente04', from: 'porto', to: 'everton', window: '2005-08', fee: 1_500_000, id: 'valente-everton-2005' },
  { playerId: 'cur_pepe04', from: 'porto', to: 'real_madrid', window: '2007-07', fee: 20_000_000, id: 'pepe-madrid-2007' },
  { playerId: 'cur_bosingwa04', from: 'porto', to: 'chelsea', window: '2008-07', fee: 16_000_000, id: 'bosingwa-chelsea-2008' },
  // ── Parma's post-Parmalat sell-off. The broke club cashed in a year after the
  // crash: Gilardino to Milan (2005), Bonera the year after. Beat Milan to the
  // punch in 2004 — Parma is a `crisis` seller, so it's a food-chain steal.
  { playerId: 'cur_gilardino04', from: 'parma', to: 'milan', window: '2005-07', fee: 19_000_000, id: 'gilardino-milan-2005' },
  { playerId: 'cur_bonera04', from: 'parma', to: 'milan', window: '2006-07', fee: 8_000_000, id: 'bonera-milan-2006' },
];

/** Calciopoli sends Juventus down to Serie B and into a forced fire-sale. */
const SHOCKS_2004: FinancialShock[] = [
  { clubId: 'juventus', year: 2006, health: 'crisis', note: 'is relegated to Serie B in the Calciopoli scandal — a forced fire-sale opens' },
];

/** Leeds's over-reach for the Champions League tips them into meltdown — the
 *  books slide from strained (2002) to a full fire-sale crisis (2003). */
const SHOCKS_2001: FinancialShock[] = [
  { clubId: 'leeds', year: 2002, health: 'strained', note: 'are straining under the debt from "living the dream" — cash must be raised' },
  { clubId: 'leeds', year: 2003, health: 'crisis', note: 'have collapsed financially — a forced fire-sale of the whole squad opens' },
  { clubId: 'fiorentina', year: 2002, health: 'crisis', note: 'have gone bankrupt (Cecchi Gori) — the squad is up for grabs before liquidation' },
];

/** Real 2004-era injuries — fire only if the player is at his real club. */
const INJURIES_2004: RealInjuryEntry[] = [
  { playerId: 'cur_king', atClub: 'spurs', since: '2005-11', months: 4, serious: true, note: 'chronic knee trouble' },
  { playerId: 'cur_rooney2', atClub: 'man_utd', since: '2006-04', months: 2, serious: false, note: 'metatarsal fracture before the World Cup' },
  // Woodgate — the £13m Madrid signing who didn't play a competitive minute in
  // his first season (thigh trouble, then an infamous debut own goal + red card).
  { playerId: 'cur_woodgate04', atClub: 'real_madrid', since: '2004-09', months: 11, serious: true, note: 'thigh/muscle trouble wrecks his first season' },
  { playerId: 'cur_hargreaves', atClub: 'bayern', since: '2006-09', months: 6, serious: true, note: 'broken leg (Sept 2006) — out most of the season' },
];

/** Real 2009–12 injuries — fire only if the player is at his real club. */
const INJURIES_2009: RealInjuryEntry[] = [
  // Kaká's Madrid years, wrecked by a chronic knee/patellar-tendon problem (a
  // surgery in Aug 2010) — the injury that turned a Ballon d'Or into a shadow.
  { playerId: 'cur_kaka09', atClub: 'real_madrid', since: '2010-08', months: 4, serious: true, note: 'knee/patellar-tendon surgery' },
  { playerId: 'cur_robben09', atClub: 'bayern', since: '2010-04', months: 2, serious: false, note: 'hamstring trouble around the Champions League final' },
  { playerId: 'cur_ibisevic09', atClub: 'hoffenheim', since: '2009-11', months: 2, serious: false, note: 'lingering effects of his cruciate rupture' },
  // Van Persie — a Nov 2009 ankle-ligament injury (a challenge on international
  // duty) cost him half the season; the fragile Arsenal spine of the era.
  { playerId: 'cur_vanpersie09', atClub: 'arsenal', since: '2009-11', months: 6, serious: true, note: 'ankle ligament damage on international duty' },
  // Ramsey — the horror double leg-break at Stoke (Feb 2010) that took him out
  // for the best part of a year. The era's defining young-talent setback.
  { playerId: 'cur_ramsey09', atClub: 'arsenal', since: '2010-02', months: 9, serious: true, note: 'double leg fracture at Stoke' },
  // Vermaelen — a persistent Achilles problem wrecked almost all of his second
  // season after a brilliant first.
  { playerId: 'cur_vermaelen09', atClub: 'arsenal', since: '2010-09', months: 9, serious: true, note: 'recurring Achilles tendon trouble' },
  // Torres — knee and groin problems through 2009-10 (surgery in April 2010)
  // blunted the striker who nearly fired Liverpool to the title a year earlier.
  { playerId: 'cur_torres09', atClub: 'liverpool', since: '2010-01', months: 3, serious: true, note: 'knee trouble, surgery in April 2010' },
  // Aquilani — the £20m Alonso replacement arrived carrying an ankle injury and
  // did not make his league debut until late autumn; a signing that never landed.
  { playerId: 'cur_aquilani09', atClub: 'liverpool', since: '2009-08', months: 4, serious: false, note: 'arrived injured — ankle surgery delays his debut' },
  // Hargreaves — chronic patellar tendinitis (multiple knee surgeries) meant he
  // barely played for United across these years. A career effectively lost to it.
  { playerId: 'cur_hargreaves09', atClub: 'man_utd', since: '2009-09', months: 11, serious: true, note: 'chronic knee tendinitis — barely plays for two years' },
  // Owen — a hamstring tear at Wembley (League Cup final, Feb 2010) ruled him out
  // for the rest of the season and the World Cup.
  { playerId: 'cur_owen09', atClub: 'man_utd', since: '2010-02', months: 3, serious: false, note: 'hamstring tear in the League Cup final' },
  // Pato — the recurring thigh/muscle injuries that slowly wrecked a generational
  // talent at Milan.
  { playerId: 'cur_pato09', atClub: 'milan', since: '2010-11', months: 2, serious: false, note: 'recurring thigh-muscle injuries' },
  // Nesta — the chronic back trouble that dogged the great defender's final years.
  { playerId: 'cur_nesta09', atClub: 'milan', since: '2010-01', months: 2, serious: false, note: 'chronic lower-back trouble' },
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
  // ── The Porto sell-off (§ food-chain). After the 2003 UEFA Cup and 2004
  // Champions League, the giants picked Mourinho's side apart. Leave it alone and
  // the raid happens ON the user (Barça take Deco, Chelsea take Carvalho/Ferreira)
  // — beat them to it in 2002–03 at a food-chain discount and you keep the jewels.
  { playerId: 'cur_deco01', from: 'porto', to: 'barcelona', window: '2004-07', fee: 14_000_000, id: 'deco-barca-2004' },
  { playerId: 'cur_carvalho01', from: 'porto', to: 'chelsea', window: '2004-08', fee: 20_000_000, id: 'carvalho-chelsea-2004', enabledBy: 'abramovich' },
  { playerId: 'cur_pferreira01', from: 'porto', to: 'chelsea', window: '2004-07', fee: 13_200_000, id: 'ferreira-chelsea-2004', enabledBy: 'abramovich' },
  // ── Leeds "living the dream" collapse (§ distress). Overspending on the
  // Champions League run tipped them into meltdown; from 2002 the side was
  // dismantled dirt-cheap. Ferdinand banked £30m, but the rest went for a
  // pittance — Kewell to the user for ~£5m, Woodgate & Bowyer to Newcastle, Smith
  // to United. Leave it and reality's raiders take them; get there first and it's
  // your fire-sale (Leeds is a `crisis` seller — a food-chain steal).
  { playerId: 'cur_ferdinand01', from: 'leeds', to: 'man_utd', window: '2002-07', fee: 30_000_000, id: 'ferdinand-utd-2002' },
  { playerId: 'cur_woodgate01', from: 'leeds', to: 'newcastle', window: '2003-01', fee: 9_000_000, id: 'woodgate-newcastle-2003' },
  { playerId: 'cur_kewell01', from: 'leeds', to: 'liverpool', window: '2003-07', fee: 5_000_000, id: 'kewell-liverpool-2003' },
  { playerId: 'cur_bowyer', from: 'leeds', to: 'west_ham', window: '2003-01', fee: 500_000, id: 'bowyer-westham-2003' },
  { playerId: 'cur_smith01', from: 'leeds', to: 'man_utd', window: '2004-07', fee: 7_000_000, id: 'smith-utd-2004' },
];

// ── Real retirements (curated players hang up their boots ≈ when they did) ────

/** Man Utd 1999 squad + marquee era stars. Ledger subjects (Beckham, Anelka,
 *  Owen…) are exempt from retirement elsewhere, so they need no entry here. */
const RETIREMENTS_1999: RealRetirement[] = [
  { playerId: 'cur_bosnich', year: 2009 }, { playerId: 'cur_vdgouw', year: 2007 },
  { playerId: 'cur_gneville', year: 2011 }, { playerId: 'cur_pneville', year: 2013 },
  { playerId: 'cur_irwin', year: 2004 }, { playerId: 'cur_silvestre', year: 2014 },
  { playerId: 'cur_stam', year: 2007 }, { playerId: 'cur_rjohnsen', year: 2008 },
  { playerId: 'cur_wbrown', year: 2018 }, { playerId: 'cur_berg', year: 2004 },
  { playerId: 'cur_may', year: 2004 }, { playerId: 'cur_keane', year: 2006 },
  { playerId: 'cur_scholes', year: 2013 }, { playerId: 'cur_giggs', year: 2014 },
  { playerId: 'cur_butt', year: 2011 }, { playerId: 'cur_blomqvist', year: 2005 },
  { playerId: 'cur_cruyff', year: 2010 }, { playerId: 'cur_fortune', year: 2010 },
  { playerId: 'cur_cole', year: 2008 }, { playerId: 'cur_yorke', year: 2009 },
  { playerId: 'cur_solskjaer', year: 2007 }, { playerId: 'cur_sheringham', year: 2008 },
  // Marquee world stars.
  { playerId: 'cur_maldini', year: 2009 }, { playerId: 'cur_shearer', year: 2006 },
  { playerId: 'cur_letissier', year: 2002 }, { playerId: 'cur_veron', year: 2012 },
  { playerId: 'cur_barthez', year: 2007 },
  // Ledger legends retire ≈ when they did (they may only retire once their real
  // moves are done; the squad-match metric credits a retired legend as reality-
  // consistent, so they no longer linger into their mid-40s).
  { playerId: 'cur_redondo', year: 2004 }, { playerId: 'cur_zidane', year: 2006 },
  { playerId: 'cur_figo', year: 2009 }, { playerId: 'cur_mcmanaman', year: 2005 },
  { playerId: 'cur_overmars', year: 2009 }, { playerId: 'cur_nedved', year: 2009 },
  { playerId: 'cur_ronaldo', year: 2011 }, { playerId: 'cur_makelele', year: 2011 },
  { playerId: 'cur_owen', year: 2013 }, { playerId: 'cur_crespo', year: 2012 },
  { playerId: 'cur_beckham', year: 2013 },
];

const RETIREMENTS_2013: RealRetirement[] = [
  { playerId: 'cur_giggs2', year: 2014 }, { playerId: 'cur_ferdinand2', year: 2015 },
  { playerId: 'cur_vidic', year: 2016 }, { playerId: 'cur_evra', year: 2019 },
  { playerId: 'cur_carrick', year: 2018 }, { playerId: 'cur_fletcher', year: 2019 },
  { playerId: 'cur_xavi', year: 2019 }, { playerId: 'cur_pirlo', year: 2017 },
  { playerId: 'cur_gerrard2', year: 2016 }, { playerId: 'cur_lampard', year: 2017 },
  { playerId: 'cur_terry', year: 2018 }, { playerId: 'cur_buffon', year: 2023 },
  { playerId: 'cur_totti', year: 2017 }, { playerId: 'cur_pepe2', year: 2024 },
];

// ── Real academy graduates (real players only — the youth pipeline) ───────────

const per = (
  professionalism: number, ego: number, ambition: number,
  loyalty: number, volatility: number, adaptability: number,
) => ({ professionalism, ego, ambition, loyalty, volatility, adaptability });

const ACADEMY_1999: AcademyGraduate[] = [
  { year: 2001, seed: { id: 'cur_oshea99', club: 'man_utd', name: 'John O’Shea', birthYear: 1981, nationality: 'Ireland', positions: ['CB', 'RB'], ability: 60, potentialCeiling: 80, contractUntil: 2006, injuryProneness: 25, personality: per(8, 4, 7, 9, 4, 7) } },
  { year: 2003, seed: { id: 'cur_fletcher99', club: 'man_utd', name: 'Darren Fletcher', birthYear: 1984, nationality: 'Scotland', positions: ['CM'], ability: 58, potentialCeiling: 82, contractUntil: 2007, injuryProneness: 55, personality: per(9, 4, 8, 9, 3, 7) } },
  { year: 2003, seed: { id: 'cur_richardson99', club: 'man_utd', name: 'Kieran Richardson', birthYear: 1984, nationality: 'England', positions: ['LW', 'CM'], ability: 58, potentialCeiling: 76, contractUntil: 2007, injuryProneness: 30, personality: per(6, 6, 7, 6, 5, 7) } },
  { year: 2007, seed: { id: 'cur_jevans99', club: 'man_utd', name: 'Jonny Evans', birthYear: 1988, nationality: 'Northern Ireland', positions: ['CB'], ability: 56, potentialCeiling: 81, contractUntil: 2010, injuryProneness: 35, personality: per(8, 4, 7, 8, 4, 7) } },
  // Danny Welbeck — a real academy graduate carrying LATENT upside (his end
  // product never quite matched his talent; a patient United user can unlock it).
  { year: 2009, seed: { id: 'cur_welbeck99', club: 'man_utd', name: 'Danny Welbeck', birthYear: 1990, nationality: 'England', positions: ['ST', 'LW'], ability: 55, potentialCeiling: 80, latentCeiling: 87, contractUntil: 2012, injuryProneness: 45, personality: per(8, 4, 8, 8, 4, 7) } },
  { year: 2011, seed: { id: 'cur_cleverley99', club: 'man_utd', name: 'Tom Cleverley', birthYear: 1989, nationality: 'England', positions: ['CM'], ability: 55, potentialCeiling: 76, contractUntil: 2012, injuryProneness: 30, personality: per(7, 5, 7, 7, 4, 7) } },
];

const ACADEMY_2013: AcademyGraduate[] = [
  // Adnan Januzaj — the flagship LOST TALENT: dazzled at 18, then faded through
  // mismanagement/minutes. A 2013 user who centres him can unlock what reality
  // wasted (latent 88 vs the 78 he actually reached).
  { year: 2013, seed: { id: 'cur_januzaj', club: 'man_utd', name: 'Adnan Januzaj', birthYear: 1995, nationality: 'Belgium', positions: ['LW', 'AM'], ability: 68, potentialCeiling: 78, latentCeiling: 88, contractUntil: 2018, injuryProneness: 30, personality: per(6, 7, 7, 5, 5, 7) } },
  { year: 2014, seed: { id: 'cur_wilson13', club: 'man_utd', name: 'James Wilson', birthYear: 1995, nationality: 'England', positions: ['ST'], ability: 62, potentialCeiling: 74, latentCeiling: 83, contractUntil: 2018, injuryProneness: 35, personality: per(7, 5, 7, 7, 4, 7) } },
];

// ── era-2004 (Arsenal Invincibles) retirements + academy ─────────────────────
const RETIREMENTS_2004: RealRetirement[] = [
  { playerId: 'cur_lehmann', year: 2011 }, { playerId: 'cur_lauren', year: 2010 },
  { playerId: 'cur_toure', year: 2017 }, { playerId: 'cur_campbell2', year: 2012 },
  { playerId: 'cur_gilberto', year: 2013 }, { playerId: 'cur_vieira2', year: 2011 },
  { playerId: 'cur_pires2', year: 2015 }, { playerId: 'cur_ljungberg', year: 2012 },
  { playerId: 'cur_bergkamp2', year: 2006 }, { playerId: 'cur_henry', year: 2014 },
  { playerId: 'cur_edu', year: 2011 },
  { playerId: 'cur_keane2', year: 2006 }, { playerId: 'cur_scholes2', year: 2013 },
  { playerId: 'cur_giggs3', year: 2014 }, { playerId: 'cur_vannistelrooy2', year: 2012 },
  { playerId: 'cur_gneville2', year: 2011 }, { playerId: 'cur_ferdinand3', year: 2015 },
  { playerId: 'cur_makelele2', year: 2011 }, { playerId: 'cur_lampard2', year: 2017 },
  { playerId: 'cur_terry2', year: 2018 }, { playerId: 'cur_carragher2', year: 2013 },
  { playerId: 'cur_gerrard3', year: 2016 }, { playerId: 'cur_hyypia2', year: 2011 },
  { playerId: 'cur_shevchenko2', year: 2012 }, { playerId: 'cur_ballack', year: 2012 },
];

const ACADEMY_2004: AcademyGraduate[] = [
  // Jack Wilshere — the flagship Arsenal graduate AND a lost talent: brilliant at
  // 18, then broken by injuries. Latent 90 if a user can keep him fit and central.
  { year: 2008, seed: { id: 'cur_wilshere04', club: 'arsenal', name: 'Jack Wilshere', birthYear: 1992, nationality: 'England', positions: ['CM', 'AM'], ability: 60, potentialCeiling: 82, latentCeiling: 90, contractUntil: 2013, injuryProneness: 70, personality: per(6, 7, 8, 8, 6, 6) } },
  { year: 2009, seed: { id: 'cur_gibbs04', club: 'arsenal', name: 'Kieran Gibbs', birthYear: 1989, nationality: 'England', positions: ['LB'], ability: 58, potentialCeiling: 80, contractUntil: 2013, injuryProneness: 45, personality: per(7, 5, 7, 7, 4, 7) } },
  // Alexandre Pato — "O Pato", the Milan wonderkid whose every season was cut
  // short by muscle tears until the talent bled away. The definitive fragile-
  // and-lost striker: latent 92 if a manager can ever keep him on the pitch.
  // Pato came through Internacional, but he broke into Milan's first team as an 18-year-old
  // in Jan 2008 — surfaced here as that real young-first-team breakthrough (not an academy product).
  { year: 2008, seed: { id: 'cur_pato04', club: 'milan', name: 'Alexandre Pato', birthYear: 1989, nationality: 'Brazil', positions: ['ST'], ability: 66, potentialCeiling: 82, latentCeiling: 92, contractUntil: 2013, injuryProneness: 68, personality: per(5, 7, 8, 6, 7, 6) } },
  // Bojan Krkić — La Masia's record-breaking teenager (youngest-ever Barça
  // scorer) who buckled under the weight of expectation and never kicked on.
  { year: 2007, seed: { id: 'cur_bojan04', club: 'barcelona', name: 'Bojan Krkić', birthYear: 1990, nationality: 'Spain', positions: ['ST', 'AM'], ability: 62, potentialCeiling: 80, latentCeiling: 89, contractUntil: 2012, injuryProneness: 30, personality: per(6, 5, 7, 8, 7, 5) } },
];

// ── era-2001 (Liverpool post-treble) retirements + academy ───────────────────
const RETIREMENTS_2001: RealRetirement[] = [
  { playerId: 'cur_dudek', year: 2011 }, { playerId: 'cur_babbel', year: 2007 },
  { playerId: 'cur_henchoz', year: 2008 }, { playerId: 'cur_hyypia01', year: 2011 },
  { playerId: 'cur_carra01', year: 2013 }, { playerId: 'cur_gerrard01', year: 2016 },
  { playerId: 'cur_hamann01', year: 2011 }, { playerId: 'cur_mcallister', year: 2004 },
  { playerId: 'cur_murphy01', year: 2013 }, { playerId: 'cur_owen01', year: 2013 },
  { playerId: 'cur_fowler01', year: 2012 }, { playerId: 'cur_litmanen', year: 2011 },
  { playerId: 'cur_smicer', year: 2009 },
  { playerId: 'cur_barthez01', year: 2007 }, { playerId: 'cur_gneville01', year: 2011 },
  { playerId: 'cur_stam01', year: 2007 }, { playerId: 'cur_blanc', year: 2003 },
  { playerId: 'cur_keane01', year: 2006 }, { playerId: 'cur_scholes01', year: 2013 },
  { playerId: 'cur_beckham01', year: 2013 }, { playerId: 'cur_giggs01', year: 2014 },
  { playerId: 'cur_veron01', year: 2014 }, { playerId: 'cur_ruud01', year: 2012 },
  { playerId: 'cur_solskjaer01', year: 2007 }, { playerId: 'cur_cole01', year: 2008 },
  { playerId: 'cur_seaman01', year: 2004 }, { playerId: 'cur_adams01', year: 2002 },
  { playerId: 'cur_vieira01', year: 2011 }, { playerId: 'cur_bergkamp01', year: 2006 },
  { playerId: 'cur_henry01', year: 2014 }, { playerId: 'cur_shearer01', year: 2006 },
  { playerId: 'cur_martyn', year: 2006 }, { playerId: 'cur_speed01', year: 2010 },
];

const ACADEMY_2001: AcademyGraduate[] = [
  { year: 2004, seed: { id: 'cur_warnock01', club: 'liverpool', name: 'Stephen Warnock', birthYear: 1981, nationality: 'England', positions: ['LB'], ability: 58, potentialCeiling: 76, contractUntil: 2008, injuryProneness: 35, personality: per(7, 4, 7, 7, 4, 7) } },
  // Neil Mellor — a promising academy striker whose knees betrayed him (latent 82).
  { year: 2004, seed: { id: 'cur_mellor01', club: 'liverpool', name: 'Neil Mellor', birthYear: 1982, nationality: 'England', positions: ['ST'], ability: 56, potentialCeiling: 72, latentCeiling: 82, contractUntil: 2008, injuryProneness: 65, personality: per(7, 5, 7, 8, 5, 6) } },
];

// ── era-1998 (Inter / Serie A) — Ronaldo's knee + Serie A retirements ─────────
/** Ronaldo's real 1999 knee injury. His REAL catastrophe was the comeback: rushed
 *  back in April 2000 he ruptured it completely. Here the first injury fires; the
 *  return-from-injury decision (injuryManagement.ts) is where the user avoids —
 *  or repeats — the mistake that cost him years. */
const INJURIES_1998: RealInjuryEntry[] = [
  { playerId: 'cur_r9', atClub: 'inter', since: '1999-11', months: 5, serious: true, note: 'ruptured knee tendon — the injury that defined his Inter years' },
  { playerId: 'cur_ronaldo', atClub: 'inter', since: '1999-11', months: 5, serious: true, note: 'knee tendon injury' },
];

/**
 * Real Serie A transfers of the era. The marquee one for an Inter save is VIERI
 * from Lazio in 1999 (a world-record fee) — offered to the user as his call: pair
 * him with Ronaldo, or trust the fit Fenomeno alone. Cannavaro follows in 2002.
 * The rest colour the title race (Crespo/Nedvěd/Thuram moving), and Simeone's
 * real 1999 exit to Lazio frees an Inter midfield berth.
 */
const LEDGER_1998: RealTransferLedgerEntry[] = [
  { playerId: 'cur_vieri98', from: 'lazio', to: 'inter', window: '1999-06', fee: 31_000_000 },
  { playerId: 'cur_simeone', from: 'inter', to: 'lazio', window: '1999-07', fee: 12_000_000 },
  { playerId: 'cur_crespo98', from: 'parma', to: 'lazio', window: '2000-07', fee: 35_000_000 },
  { playerId: 'cur_nedved98', from: 'lazio', to: 'juventus', window: '2001-07', fee: 25_000_000 },
  { playerId: 'cur_thuram', from: 'parma', to: 'juventus', window: '2001-07', fee: 22_000_000 },
  { playerId: 'cur_cannavaro', from: 'parma', to: 'inter', window: '2002-07', fee: 14_500_000 },
];

/**
 * "Almost happened" deals of the era. Inter chased Batistuta for years — the
 * Fenomeno-plus-Batigol front line that never was — before Roma finally landed
 * him in 2000. Playing Inter, you get the call reality bottled: pair him with
 * Ronaldo, or let him go to Roma as he really did.
 */
const NEARMISS_1998: NearMissEntry[] = [
  {
    playerId: 'cur_batistuta',
    from: 'fiorentina',
    almostTo: 'inter',
    realTo: 'roma',
    window: '2000-07',
    fee: 32_000_000,
    realFee: 23_000_000,
    note: 'Inter courted Batistuta for years; Roma won the race in 2000.',
  },
  // Inter's other almost-deals (seed-based). Offered in the inter-1998 world.
  nm({ reason: 'player-choice', window: '2001-07', from: 'gremio', almostTo: 'inter', realTo: 'psg', fee: 5_000_000, realFee: 5_000_000, id: 'ronaldinho_psg', name: 'Ronaldinho', birthYear: 1980, nationality: 'Brazil', positions: ['AM', 'LW'], ability: 76, ceiling: 91, proneness: 40, per: [5, 6, 7, 4, 6, 8], note: 'Moratti met his brother in Mexico, but Ronaldinho feared being overshadowed by Ronaldo and chose PSG instead.' }),
  nm({ reason: 'hijack', window: '2007-01', from: 'real_madrid', almostTo: 'inter', realTo: 'milan', fee: 8_000_000, realFee: 8_000_000, id: 'ronaldo_return', name: 'Ronaldo', birthYear: 1976, nationality: 'Brazil', positions: ['ST'], ability: 79, ceiling: 90, proneness: 55, per: [4, 7, 6, 5, 6, 7], note: 'Ronaldo phoned Moratti asking to return, but Inter turned him down and rivals Milan swooped for the out-of-favour striker.' }),
  nm({ reason: 'hijack', window: '2002-07', from: 'barcelona', almostTo: 'inter', realTo: 'milan', fee: 0, realFee: 0, id: 'rivaldo', name: 'Rivaldo', birthYear: 1972, nationality: 'Brazil', positions: ['AM', 'LW'], ability: 83, ceiling: 88, proneness: 38, per: [6, 7, 6, 5, 5, 6], note: 'Inter were among the suitors for the free-agent Ballon d’Or winner, but Berlusconi’s Milan signed him on a free.' }),
  nm({ reason: 'player-choice', window: '2006-08', from: 'corinthians', almostTo: 'inter', realTo: 'west_ham', fee: 0, realFee: 0, id: 'tevez', name: 'Carlos Tévez', birthYear: 1984, nationality: 'Argentina', positions: ['ST', 'AM'], ability: 79, ceiling: 86, proneness: 42, per: [6, 7, 8, 4, 7, 6], note: 'His agent shopped him to Inter but couldn’t agree a deal, so the third-party-owned striker landed at West Ham.' }),
  nm({ reason: 'hijack', window: '2008-07', from: 'barcelona', almostTo: 'inter', realTo: 'milan', fee: 22_000_000, realFee: 22_000_000, id: 'ronaldinho_milan', name: 'Ronaldinho', birthYear: 1980, nationality: 'Brazil', positions: ['AM', 'LW'], ability: 81, ceiling: 91, proneness: 45, per: [4, 7, 6, 5, 6, 7], note: 'Moratti vowed Inter would "fight" for the Barça outcast, but Milan won the derby tug-of-war for €22m.' }),
];

// ── "Almost happened" near-misses, seed-based (nm()) — one set per era pack ───
// Doing nothing reproduces reality; the user can rewrite it in the real window.

/** era-1995-2005 world (man-utd-1999, chelsea-2003, real-madrid-2000,
 *  barcelona-1999): each entry offers only to the scenario whose club it targets. */
const NEARMISS_1999_2014: NearMissEntry[] = [
  // Manchester United — the ones that got away (1999–2014).
  nm({ reason: 'medical', window: '2000-07', from: 'psv', almostTo: 'man_utd', realTo: null, fee: 18_500_000, realFee: 18_500_000, id: 'van_nistelrooy', name: 'Ruud van Nistelrooy', birthYear: 1976, nationality: 'Netherlands', positions: ['ST'], ability: 82, ceiling: 88, proneness: 50, per: [9, 5, 8, 6, 3, 7], note: 'United agreed an £18.5m deal but he failed the medical on a knee ligament, then ruptured his ACL — the move slipped to 2001.' }),
  nm({ reason: 'hijack', window: '2003-07', from: 'psg', almostTo: 'man_utd', realTo: 'barcelona', fee: 19_000_000, realFee: 21_000_000, id: 'ronaldinho', name: 'Ronaldinho', birthYear: 1980, nationality: 'Brazil', positions: ['AM', 'LW'], ability: 84, ceiling: 89, proneness: 35, per: [6, 6, 8, 4, 5, 8], note: 'United were hours from announcing him as the Beckham replacement, but he changed his mind and chose Barcelona.' }),
  nm({ reason: 'hijack', window: '2004-07', from: 'psv', almostTo: 'man_utd', realTo: 'chelsea', fee: 5_000_000, realFee: 12_000_000, id: 'robben', name: 'Arjen Robben', birthYear: 1984, nationality: 'Netherlands', positions: ['RW', 'LW'], ability: 80, ceiling: 88, proneness: 50, per: [7, 6, 8, 5, 5, 7], note: 'Ferguson met him but United never followed up their low PSV bid, so Chelsea swooped with £12m.' }),
  nm({ reason: 'player-choice', window: '2006-07', from: 'bayern', almostTo: 'man_utd', realTo: 'chelsea', fee: 0, realFee: 0, id: 'ballack', name: 'Michael Ballack', birthYear: 1976, nationality: 'Germany', positions: ['CM', 'AM'], ability: 85, ceiling: 86, proneness: 40, per: [8, 7, 8, 5, 4, 6], note: 'A free agent courted by United, he opted for Chelsea’s terms instead.' }),
  nm({ reason: 'player-choice', window: '2007-07', from: 'atletico', almostTo: 'man_utd', realTo: 'liverpool', fee: 20_000_000, realFee: 20_000_000, id: 'torres', name: 'Fernando Torres', birthYear: 1984, nationality: 'Spain', positions: ['ST'], ability: 83, ceiling: 88, proneness: 40, per: [7, 5, 8, 7, 4, 7], note: 'Ferguson chased him for years, but Atlético were reluctant and Torres had his heart set on Liverpool.' }),
  nm({ reason: 'player-choice', window: '2009-07', from: 'lyon', almostTo: 'man_utd', realTo: 'real_madrid', fee: 30_000_000, realFee: 30_000_000, id: 'benzema', name: 'Karim Benzema', birthYear: 1987, nationality: 'France', positions: ['ST'], ability: 81, ceiling: 88, proneness: 30, per: [6, 6, 8, 5, 4, 6], note: 'United tabled a superior offer, but he chose his dream move to the Bernabéu.' }),
  nm({ reason: 'manager', window: '2010-08', from: 'bremen', almostTo: 'man_utd', realTo: 'real_madrid', fee: 15_000_000, realFee: 15_000_000, id: 'ozil', name: 'Mesut Özil', birthYear: 1988, nationality: 'Germany', positions: ['AM'], ability: 80, ceiling: 87, proneness: 30, per: [7, 5, 7, 5, 4, 6], note: 'Rooney urged Ferguson to sign him after the World Cup, but the manager declined and he joined Real Madrid.' }),
  nm({ reason: 'hijack', window: '2010-07', from: 'valencia', almostTo: 'man_utd', realTo: 'barcelona', fee: 30_000_000, realFee: 34_000_000, id: 'villa', name: 'David Villa', birthYear: 1981, nationality: 'Spain', positions: ['ST', 'LW'], ability: 85, ceiling: 86, proneness: 35, per: [8, 6, 8, 6, 4, 6], note: 'Ferguson long admired him and the player was keen, but Barcelona won the race.' }),
  nm({ reason: 'wages', window: '2011-08', from: 'inter', almostTo: 'man_utd', realTo: null, fee: 28_000_000, realFee: 28_000_000, id: 'sneijder', name: 'Wesley Sneijder', birthYear: 1984, nationality: 'Netherlands', positions: ['AM', 'CM'], ability: 85, ceiling: 87, proneness: 40, per: [6, 7, 7, 5, 5, 6], note: 'Months of talks collapsed over his €200k-a-week wages and Inter’s fee, and he stayed in Milan.' }),
  nm({ reason: 'hijack', window: '2012-06', from: 'lille', almostTo: 'man_utd', realTo: 'chelsea', fee: 32_000_000, realFee: 32_000_000, id: 'hazard', name: 'Eden Hazard', birthYear: 1991, nationality: 'Belgium', positions: ['LW', 'AM'], ability: 82, ceiling: 90, proneness: 30, per: [7, 6, 8, 5, 4, 7], note: 'United had agreed fee and terms but baulked at his agent’s demands, so Chelsea signed him.' }),
  nm({ reason: 'manager', window: '2013-07', from: 'barcelona', almostTo: 'man_utd', realTo: 'bayern', fee: 17_000_000, realFee: 22_000_000, id: 'thiago', name: 'Thiago Alcántara', birthYear: 1991, nationality: 'Spain', positions: ['CM', 'AM'], ability: 79, ceiling: 87, proneness: 40, per: [8, 5, 7, 5, 4, 7], note: 'He wanted the move on a 24-hour ultimatum, but Moyes prioritised Fellaini and Guardiola took him to Bayern.' }),
  nm({ reason: 'board', window: '2013-08', from: 'everton', almostTo: 'man_utd', realTo: null, fee: 15_000_000, realFee: 15_000_000, id: 'baines', name: 'Leighton Baines', birthYear: 1984, nationality: 'England', positions: ['LB'], ability: 82, ceiling: 83, proneness: 30, per: [8, 3, 6, 8, 2, 7], note: 'United made multiple bids but Everton rejected them all and he stayed at Goodison.' }),
  nm({ reason: 'fee', window: '2013-08', from: 'athletic', almostTo: 'man_utd', realTo: null, fee: 30_000_000, realFee: 30_000_000, id: 'herrera', name: 'Ander Herrera', birthYear: 1989, nationality: 'Spain', positions: ['CM', 'AM'], ability: 78, ceiling: 83, proneness: 35, per: [8, 4, 7, 6, 3, 6], note: 'The move collapsed an hour before deadline day over his buyout clause; United signed him a year later.' }),
  nm({ reason: 'board', window: '2013-08', from: 'barcelona', almostTo: 'man_utd', realTo: null, fee: 30_000_000, realFee: 30_000_000, id: 'fabregas', name: 'Cesc Fàbregas', birthYear: 1987, nationality: 'Spain', positions: ['CM', 'AM'], ability: 84, ceiling: 86, proneness: 30, per: [8, 6, 7, 6, 4, 7], note: 'Moyes made repeated bids but Barcelona refused to sell and he stayed at the Camp Nou.' }),
  // Chelsea — offered in the chelsea-2003 world.
  nm({ reason: 'player-choice', window: '2003-07', from: 'psg', almostTo: 'chelsea', realTo: 'barcelona', fee: 21_000_000, realFee: 21_000_000, id: 'ronaldinho_che', name: 'Ronaldinho', birthYear: 1980, nationality: 'Brazil', positions: ['AM', 'LW'], ability: 83, ceiling: 90, proneness: 40, per: [5, 6, 8, 4, 6, 8], note: 'Chelsea and United both chased him in Abramovich’s first summer, but he honoured a promise to Rosell and picked Barcelona.' }),
  nm({ reason: 'player-choice', window: '2005-07', from: 'liverpool', almostTo: 'chelsea', realTo: null, fee: 32_000_000, realFee: 32_000_000, id: 'gerrard', name: 'Steven Gerrard', birthYear: 1980, nationality: 'England', positions: ['CM', 'AM'], ability: 86, ceiling: 88, proneness: 35, per: [9, 5, 8, 9, 4, 7], note: 'Mourinho "did everything" to sign him, but Gerrard rejected the move a day after handing in a transfer request.' }),
  nm({ reason: 'board', window: '2008-08', from: 'bayern', almostTo: 'chelsea', realTo: null, fee: 52_000_000, realFee: 52_000_000, id: 'ribery', name: 'Franck Ribéry', birthYear: 1983, nationality: 'France', positions: ['LW', 'RW'], ability: 84, ceiling: 88, proneness: 40, per: [7, 6, 7, 7, 5, 6], note: 'Chelsea tabled a huge offer but Bayern flatly refused to sell their newly-signed winger.' }),
  nm({ reason: 'hijack', window: '2008-08', from: 'real_madrid', almostTo: 'chelsea', realTo: 'man_city', fee: 30_000_000, realFee: 32_000_000, id: 'robinho', name: 'Robinho', birthYear: 1984, nationality: 'Brazil', positions: ['LW', 'ST'], ability: 82, ceiling: 86, proneness: 45, per: [4, 7, 6, 3, 7, 5], note: 'Chelsea led the chase and Robinho wanted it, but a freshly-rich Manchester City gazumped them on deadline day.' }),
  nm({ reason: 'board', window: '2011-08', from: 'spurs', almostTo: 'chelsea', realTo: null, fee: 27_000_000, realFee: 27_000_000, id: 'modric', name: 'Luka Modrić', birthYear: 1985, nationality: 'Croatia', positions: ['CM', 'AM'], ability: 83, ceiling: 88, proneness: 30, per: [9, 4, 8, 6, 3, 8], note: 'Modrić wanted the switch but Levy refused to sell to a London rival, rejecting three Chelsea bids.' }),
  nm({ reason: 'player-choice', window: '2010-08', from: 'santos', almostTo: 'chelsea', realTo: null, fee: 20_000_000, realFee: 20_000_000, id: 'neymar_che', name: 'Neymar', birthYear: 1992, nationality: 'Brazil', positions: ['LW', 'ST'], ability: 74, ceiling: 90, proneness: 45, per: [5, 7, 8, 5, 6, 7], note: 'Chelsea bid ~£20m for the teenager, but he chose to stay at Santos before joining Barcelona in 2013.' }),
  nm({ reason: 'fee', window: '2013-07', from: 'napoli', almostTo: 'chelsea', realTo: 'psg', fee: 45_000_000, realFee: 55_000_000, id: 'cavani', name: 'Edinson Cavani', birthYear: 1987, nationality: 'Uruguay', positions: ['ST'], ability: 84, ceiling: 86, proneness: 30, per: [8, 5, 7, 6, 3, 6], note: 'Chelsea pursued him but baulked at Napoli’s buyout clause, letting PSG meet the price.' }),
  // Real Madrid — offered in the real-madrid-2000 world.
  nm({ reason: 'board', window: '2008-07', from: 'man_utd', almostTo: 'real_madrid', realTo: null, fee: 75_000_000, realFee: 75_000_000, id: 'cristiano_2008', name: 'Cristiano Ronaldo', birthYear: 1985, nationality: 'Portugal', positions: ['RW', 'LW'], ability: 89, ceiling: 92, proneness: 30, per: [8, 9, 10, 4, 5, 8], note: 'Ronaldo agreed terms with Madrid but Ferguson refused to sell, keeping him a year before the 2009 world record.' }),
  nm({ reason: 'player-choice', window: '2009-01', from: 'milan', almostTo: 'man_city', realTo: null, fee: 100_000_000, realFee: 100_000_000, id: 'kaka_2008', name: 'Kaká', birthYear: 1982, nationality: 'Brazil', positions: ['AM'], ability: 87, ceiling: 88, proneness: 45, per: [9, 4, 7, 8, 3, 7], note: 'Manchester City tabled a £100m+ bid in January 2009 that Milan were ready to accept, but Kaká rejected the move; he joined Real Madrid that summer.' }),
  nm({ reason: 'hijack', window: '2003-07', from: 'psg', almostTo: 'real_madrid', realTo: 'barcelona', fee: 30_000_000, realFee: 30_000_000, id: 'ronaldinho_2003', name: 'Ronaldinho', birthYear: 1980, nationality: 'Brazil', positions: ['AM', 'LW'], ability: 82, ceiling: 90, proneness: 35, per: [5, 7, 7, 5, 6, 8], note: 'Florentino prioritised Beckham over Ronaldinho, so Laporta’s Barcelona swooped instead.' }),
  nm({ reason: 'player-choice', window: '2009-07', from: 'bayern', almostTo: 'real_madrid', realTo: null, fee: 65_000_000, realFee: 65_000_000, id: 'ribery_2009', name: 'Franck Ribéry', birthYear: 1983, nationality: 'France', positions: ['LW', 'AM'], ability: 88, ceiling: 90, proneness: 45, per: [7, 7, 9, 7, 6, 7], note: 'Madrid tabled a near-record fee but Bayern convinced Ribéry he was their Messi and he stayed.' }),
  nm({ reason: 'medical', window: '2003-07', from: 'independiente', almostTo: 'real_madrid', realTo: 'zaragoza', fee: 15_000_000, realFee: 4_000_000, id: 'milito_2003', name: 'Gabriel Milito', birthYear: 1980, nationality: 'Argentina', positions: ['CB'], ability: 76, ceiling: 82, proneness: 55, per: [7, 5, 7, 6, 5, 6], note: 'Madrid agreed the deal but cancelled after a scan flagged his knee, and he joined Zaragoza.' }),
  nm({ reason: 'player-choice', window: '2004-08', from: 'arsenal', almostTo: 'real_madrid', realTo: null, fee: 20_000_000, realFee: 20_000_000, id: 'vieira_2004', name: 'Patrick Vieira', birthYear: 1976, nationality: 'France', positions: ['DM', 'CM'], ability: 86, ceiling: 87, proneness: 40, per: [8, 7, 8, 6, 5, 7], note: 'With Arsenal’s acceptance and terms agreed, Vieira had a late change of heart and stayed at Highbury.' }),
  nm({ reason: 'hijack', window: '2008-07', from: 'sevilla', almostTo: 'real_madrid', realTo: 'barcelona', fee: 30_000_000, realFee: 30_000_000, id: 'alves_2008', name: 'Dani Alves', birthYear: 1983, nationality: 'Brazil', positions: ['RB'], ability: 82, ceiling: 85, proneness: 35, per: [7, 7, 8, 6, 6, 8], note: 'Alves said he was 95% set for Madrid before Guardiola’s Barcelona gazumped the deal.' }),
  // Barcelona — offered in the barcelona-1999 world.
  nm({ reason: 'hijack', window: '2003-07', from: 'man_utd', almostTo: 'barcelona', realTo: 'real_madrid', fee: 25_000_000, realFee: 25_000_000, id: 'beckham_2003', name: 'David Beckham', birthYear: 1975, nationality: 'England', positions: ['RW', 'CM'], ability: 84, ceiling: 85, proneness: 25, per: [8, 8, 7, 5, 4, 7], note: 'United publicly agreed to sell Beckham to Barcelona, but he refused, insisting he would only join Real Madrid.' }),
  nm({ reason: 'board', window: '2010-07', from: 'arsenal', almostTo: 'barcelona', realTo: null, fee: 35_000_000, realFee: 35_000_000, id: 'fabregas_2010', name: 'Cesc Fàbregas', birthYear: 1987, nationality: 'Spain', positions: ['CM', 'AM'], ability: 85, ceiling: 88, proneness: 35, per: [8, 6, 8, 6, 5, 8], note: 'Barcelona’s €35m bid was rejected by Arsenal and he stayed a year before the 2011 homecoming.' }),
  nm({ reason: 'board', window: '2009-07', from: 'valencia', almostTo: 'barcelona', realTo: null, fee: 35_000_000, realFee: 35_000_000, id: 'villa_2009', name: 'David Villa', birthYear: 1981, nationality: 'Spain', positions: ['ST', 'LW'], ability: 85, ceiling: 86, proneness: 40, per: [8, 6, 8, 6, 5, 7], note: 'Barça and Madrid both pushed, but a cash-strapped Valencia refused to sanction any sale until 2010.' }),
  nm({ reason: 'player-choice', window: '2011-08', from: 'santos', almostTo: 'barcelona', realTo: null, fee: 25_000_000, realFee: 25_000_000, id: 'neymar_2011', name: 'Neymar', birthYear: 1992, nationality: 'Brazil', positions: ['LW', 'ST'], ability: 80, ceiling: 89, proneness: 40, per: [6, 8, 9, 5, 6, 8], note: 'Barcelona secured a pre-agreement but Neymar signed a Santos extension to delay the switch to 2013.' }),
  nm({ reason: 'player-choice', window: '2006-07', from: 'arsenal', almostTo: 'barcelona', realTo: null, fee: 24_000_000, realFee: 24_000_000, id: 'henry_2006', name: 'Thierry Henry', birthYear: 1977, nationality: 'France', positions: ['ST', 'LW'], ability: 88, ceiling: 89, proneness: 35, per: [7, 7, 8, 6, 5, 7], note: 'Chased by Barcelona after the 2006 final, Henry pledged loyalty and signed a new Arsenal deal before moving in 2007.' }),
  nm({ reason: 'hijack', window: '2012-08', from: 'athletic', almostTo: 'barcelona', realTo: 'bayern', fee: 30_000_000, realFee: 40_000_000, id: 'javimartinez_2012', name: 'Javi Martínez', birthYear: 1988, nationality: 'Spain', positions: ['DM', 'CB'], ability: 82, ceiling: 84, proneness: 30, per: [8, 5, 7, 7, 4, 7], note: 'Barcelona held talks but baulked at his €40m clause, and Bayern paid it in full.' }),
];

/** era-2004 world (arsenal-2004) — Arsenal's ones that got away. */
const NEARMISS_2004_NM: NearMissEntry[] = [
  nm({ reason: 'hijack', window: '2003-07', from: 'sporting', almostTo: 'arsenal', realTo: 'man_utd', fee: 4_500_000, realFee: 12_240_000, id: 'ronaldo_arsenal', name: 'Cristiano Ronaldo', birthYear: 1985, nationality: 'Portugal', positions: ['RW', 'LW'], ability: 72, ceiling: 94, proneness: 25, per: [9, 8, 10, 5, 5, 8], note: 'Wenger met Ronaldo three times with a deal all but agreed, but Arsenal dithered and Ferguson swooped after Sporting beat United in a friendly.' }),
  nm({ reason: 'hijack', window: '2013-07', from: 'real_madrid', almostTo: 'arsenal', realTo: 'napoli', fee: 23_000_000, realFee: 34_500_000, id: 'higuain_arsenal', name: 'Gonzalo Higuaín', birthYear: 1987, nationality: 'Argentina', positions: ['ST'], ability: 84, ceiling: 86, proneness: 30, per: [7, 6, 7, 6, 5, 7], note: 'Arsenal had terms agreed and Madrid cleared talks, but the Gunners hesitated on the fee and Napoli moved in.' }),
  nm({ reason: 'board', window: '2013-07', from: 'liverpool', almostTo: 'arsenal', realTo: null, fee: 40_000_001, realFee: 40_000_001, id: 'suarez_arsenal', name: 'Luis Suárez', birthYear: 1987, nationality: 'Uruguay', positions: ['ST', 'LW'], ability: 88, ceiling: 90, proneness: 30, per: [7, 8, 9, 5, 9, 8], note: 'Arsenal’s famous £40,000,001 bid was rejected out of hand by Liverpool’s owners, who kept him a further season.' }),
  nm({ reason: 'hijack', window: '2011-08', from: 'valencia', almostTo: 'arsenal', realTo: 'chelsea', fee: 20_000_000, realFee: 23_500_000, id: 'mata_arsenal', name: 'Juan Mata', birthYear: 1988, nationality: 'Spain', positions: ['AM', 'RW'], ability: 82, ceiling: 85, proneness: 25, per: [8, 5, 8, 6, 3, 8], note: 'Mata had agreed personal terms with Arsenal, but Wenger’s dithering let Chelsea gazump the deal.' }),
  nm({ reason: 'board', window: '2012-07', from: 'rennes', almostTo: 'arsenal', realTo: null, fee: 17_000_000, realFee: 17_000_000, id: 'mvila_arsenal', name: 'Yann M’Vila', birthYear: 1990, nationality: 'France', positions: ['DM', 'CM'], ability: 78, ceiling: 84, proneness: 35, per: [5, 7, 7, 5, 7, 5], note: 'Arsenal chased him all summer but Rennes simply refused to sell and he stayed put.' }),
  nm({ reason: 'fee', window: '2008-08', from: 'liverpool', almostTo: 'arsenal', realTo: 'real_madrid', fee: 15_000_000, realFee: 30_000_000, id: 'alonso_arsenal', name: 'Xabi Alonso', birthYear: 1981, nationality: 'Spain', positions: ['CM', 'DM'], ability: 85, ceiling: 87, proneness: 30, per: [9, 5, 8, 6, 3, 8], note: 'Alonso had an agreement to join Arsenal and Fàbregas lobbied all summer, but the Gunners fell ~£3m short.' }),
  nm({ reason: 'board', window: '2014-01', from: 'schalke', almostTo: 'arsenal', realTo: null, fee: 25_000_000, realFee: 25_000_000, id: 'draxler_arsenal', name: 'Julian Draxler', birthYear: 1993, nationality: 'Germany', positions: ['LW', 'AM'], ability: 77, ceiling: 87, proneness: 35, per: [7, 6, 7, 6, 5, 6], note: 'Arsenal bid around £25m, but Schalke rejected it and Draxler was never given the option to move.' }),
];

/** era-2001 world (liverpool-2001) — Liverpool's ones that got away. */
const NEARMISS_2001_NM: NearMissEntry[] = [
  nm({ reason: 'manager', window: '2002-05', from: 'psg', almostTo: 'liverpool', realTo: 'man_city', fee: 10_000_000, realFee: 13_000_000, id: 'anelka_liverpool', name: 'Nicolas Anelka', birthYear: 1979, nationality: 'France', positions: ['ST'], ability: 82, ceiling: 87, proneness: 30, per: [6, 8, 8, 4, 7, 6], note: 'Anelka impressed on loan and wanted to stay, but Houllier chose Diouf instead and he joined Man City.' }),
  nm({ reason: 'board', window: '2006-01', from: 'benfica', almostTo: 'liverpool', realTo: null, fee: 8_000_000, realFee: 8_000_000, id: 'simao_liverpool', name: 'Simão Sabrosa', birthYear: 1979, nationality: 'Portugal', positions: ['LW', 'RW'], ability: 83, ceiling: 85, proneness: 35, per: [8, 6, 7, 6, 5, 6], note: 'Simão was at the airport to fly to Liverpool when Benfica’s president phoned to say he had no authorisation to leave.' }),
  nm({ reason: 'fee', window: '2006-07', from: 'sevilla', almostTo: 'liverpool', realTo: 'barcelona', fee: 8_000_000, realFee: 23_000_000, id: 'alves_liverpool', name: 'Dani Alves', birthYear: 1983, nationality: 'Brazil', positions: ['RB'], ability: 82, ceiling: 88, proneness: 25, per: [8, 7, 9, 5, 6, 8], note: 'Benítez all but agreed a deal, but Liverpool couldn’t meet Sevilla’s price and spent the money on Kuyt; Alves later joined Barcelona.' }),
  nm({ reason: 'fee', window: '2008-07', from: 'aston_villa', almostTo: 'liverpool', realTo: null, fee: 8_000_000, realFee: 8_000_000, id: 'barry_liverpool', name: 'Gareth Barry', birthYear: 1981, nationality: 'England', positions: ['CM', 'DM'], ability: 81, ceiling: 83, proneness: 25, per: [8, 5, 7, 6, 4, 7], note: 'Liverpool chased Barry all summer but refused the extra £2m Villa wanted; he joined Man City a year later.' }),
  nm({ reason: 'hijack', window: '2012-08', from: 'fulham', almostTo: 'liverpool', realTo: 'spurs', fee: 6_000_000, realFee: 6_000_000, id: 'dempsey_liverpool', name: 'Clint Dempsey', birthYear: 1983, nationality: 'United States', positions: ['AM', 'ST'], ability: 80, ceiling: 82, proneness: 30, per: [8, 6, 8, 6, 5, 7], note: 'A deadline-day deal fell apart when Henderson refused to move to Fulham as a makeweight, and Tottenham swooped.' }),
  nm({ reason: 'player-choice', window: '2013-08', from: 'anzhi', almostTo: 'liverpool', realTo: 'chelsea', fee: 30_000_000, realFee: 32_000_000, id: 'willian_liverpool', name: 'Willian', birthYear: 1988, nationality: 'Brazil', positions: ['AM', 'RW'], ability: 82, ceiling: 84, proneness: 25, per: [8, 6, 8, 5, 4, 7], note: 'Willian turned down Liverpool because he wanted London, then Chelsea hijacked his near-complete Spurs medical.' }),
];

/** era-2009 world (bayern-2009) — Bayern's ones that got away. */
const NEARMISS_2009_NM: NearMissEntry[] = [
  nm({ reason: 'hijack', window: '2011-07', from: 'leverkusen', almostTo: 'bayern', realTo: 'juventus', fee: 11_000_000, realFee: 11_000_000, id: 'vidal_2011', name: 'Arturo Vidal', birthYear: 1987, nationality: 'Chile', positions: ['CM', 'DM'], ability: 81, ceiling: 86, proneness: 40, per: [7, 6, 8, 5, 7, 8], note: 'Heynckes wanted him but Leverkusen refused to strengthen a rival, and Juventus swooped (Bayern finally got him in 2015).' }),
  nm({ reason: 'hijack', window: '2012-01', from: 'gladbach', almostTo: 'bayern', realTo: 'dortmund', fee: 17_000_000, realFee: 17_000_000, id: 'reus', name: 'Marco Reus', birthYear: 1989, nationality: 'Germany', positions: ['AM', 'LW'], ability: 82, ceiling: 87, proneness: 55, per: [7, 5, 7, 8, 3, 7], note: 'Bayern courted him, but Dortmund triggered his €17.1m clause and the boyhood BVB fan went home.' }),
  nm({ reason: 'board', window: '2013-07', from: 'dortmund', almostTo: 'bayern', realTo: null, fee: 25_000_000, realFee: 25_000_000, id: 'lewandowski', name: 'Robert Lewandowski', birthYear: 1988, nationality: 'Poland', positions: ['ST'], ability: 85, ceiling: 89, proneness: 28, per: [9, 6, 9, 5, 3, 8], note: 'Bayern agreed personal terms in 2013 but Dortmund refused to sell to a rival after the Götze row, so he stayed a year and left on a free.' }),
  nm({ reason: 'other-target', window: '2013-07', from: 'santos', almostTo: 'bayern', realTo: 'barcelona', fee: 40_000_000, realFee: 57_000_000, id: 'neymar', name: 'Neymar', birthYear: 1992, nationality: 'Brazil', positions: ['LW', 'AM'], ability: 82, ceiling: 92, proneness: 45, per: [5, 8, 8, 4, 7, 6], note: 'Bayern held advanced talks but Rummenigge feared he’d struggle to adapt and prioritised Götze, so Neymar joined Messi at Barça.' }),
  nm({ reason: 'player-choice', window: '2015-08', from: 'wolfsburg', almostTo: 'bayern', realTo: 'man_city', fee: 50_000_000, realFee: 55_000_000, id: 'debruyne', name: 'Kevin De Bruyne', birthYear: 1991, nationality: 'Belgium', positions: ['AM', 'CM'], ability: 83, ceiling: 90, proneness: 30, per: [8, 5, 8, 5, 3, 7], note: 'Guardiola raved "after Messi comes Kevin," but De Bruyne wanted Premier League business and City landed him.' }),
  nm({ reason: 'player-choice', window: '2017-07', from: 'psg', almostTo: 'bayern', realTo: null, fee: 40_000_000, realFee: 40_000_000, id: 'verratti', name: 'Marco Verratti', birthYear: 1992, nationality: 'Italy', positions: ['CM', 'DM'], ability: 82, ceiling: 87, proneness: 40, per: [6, 6, 6, 7, 6, 6], note: 'Ancelotti personally tried to bring him to Munich, but Verratti refused and stayed at PSG.' }),
];

/** era-2013 world (man-utd-2013) — United's later ones that got away. */
const NEARMISS_2013_NM: NearMissEntry[] = [
  nm({ reason: 'manager', window: '2013-07', from: 'barcelona', almostTo: 'man_utd', realTo: 'bayern', fee: 18_000_000, realFee: 21_000_000, id: 'thiago', name: 'Thiago Alcántara', birthYear: 1991, nationality: 'Spain', positions: ['CM', 'AM'], ability: 79, ceiling: 87, proneness: 45, per: [8, 5, 7, 5, 3, 7], note: 'United could have triggered his release clause but Moyes prioritised Fellaini, so Guardiola took him to Bayern.' }),
  nm({ reason: 'player-choice', window: '2013-08', from: 'spurs', almostTo: 'man_utd', realTo: 'real_madrid', fee: 85_000_000, realFee: 85_000_000, id: 'bale', name: 'Gareth Bale', birthYear: 1989, nationality: 'Wales', positions: ['LW', 'RW'], ability: 85, ceiling: 88, proneness: 40, per: [8, 6, 8, 5, 4, 6], note: 'Moyes came close and United reportedly offered more money, but Bale’s heart was set on Real Madrid.' }),
  nm({ reason: 'fee', window: '2013-08', from: 'athletic', almostTo: 'man_utd', realTo: null, fee: 29_000_000, realFee: 29_000_000, id: 'herrera_2013', name: 'Ander Herrera', birthYear: 1989, nationality: 'Spain', positions: ['CM', 'AM'], ability: 77, ceiling: 82, proneness: 30, per: [8, 4, 7, 6, 4, 7], note: 'The deadline-day deal descended into farce with imposter lawyers over his clause; United signed him a year later.' }),
  nm({ reason: 'manager', window: '2014-07', from: 'bayern', almostTo: 'man_utd', realTo: 'real_madrid', fee: 20_000_000, realFee: 24_000_000, id: 'kroos', name: 'Toni Kroos', birthYear: 1990, nationality: 'Germany', positions: ['CM', 'AM'], ability: 85, ceiling: 88, proneness: 25, per: [9, 5, 7, 5, 2, 8], note: 'Kroos had verbally agreed with Moyes, but when Van Gaal replaced him the pair cooled and Real Madrid swooped.' }),
  nm({ reason: 'board', window: '2015-07', from: 'real_madrid', almostTo: 'man_utd', realTo: null, fee: 40_000_000, realFee: 40_000_000, id: 'ramos', name: 'Sergio Ramos', birthYear: 1986, nationality: 'Spain', positions: ['CB', 'RB'], ability: 86, ceiling: 88, proneness: 30, per: [7, 7, 8, 6, 6, 6], note: 'United chased him with cash-plus-De Gea, but Real refused any swap and tied him to a new contract.' }),
];

const ACADEMY_1998: AcademyGraduate[] = [
  // Adriano — O Imperador. Arrived at Inter with the physique and shot of a
  // generational striker; personal tragedy and lifestyle unravelled him. The
  // definitive lost talent: latent 94, but a temperament almost no one reaches.
  // Adriano was signed from Flamengo (not a Milan-style academy product), but he did
  // join Inter as a teenager in 2001 — surfaced here as a young first-team breakthrough.
  { year: 2001, seed: { id: 'cur_adriano', club: 'inter', name: 'Adriano', birthYear: 1982, nationality: 'Brazil', positions: ['ST'], ability: 72, potentialCeiling: 82, latentCeiling: 94, contractUntil: 2006, injuryProneness: 30, personality: per(4, 7, 8, 6, 8, 7) } },
];

const RETIREMENTS_1998: RealRetirement[] = [
  { playerId: 'cur_bergomi', year: 1999 }, { playerId: 'cur_pagliuca', year: 2007 },
  { playerId: 'cur_baggio_r', year: 2004 }, { playerId: 'cur_zamorano', year: 2003 },
  { playerId: 'cur_djorkaeff', year: 2006 }, { playerId: 'cur_winter', year: 2003 },
  { playerId: 'cur_simeone', year: 2006 }, { playerId: 'cur_zanetti', year: 2014 },
  { playerId: 'cur_r9', year: 2011 },
  { playerId: 'cur_maldini98', year: 2009 }, { playerId: 'cur_weah', year: 2003 },
  { playerId: 'cur_costacurta', year: 2007 }, { playerId: 'cur_bierhoff', year: 2003 },
  { playerId: 'cur_boban', year: 2002 }, { playerId: 'cur_deschamps', year: 2001 },
  { playerId: 'cur_batistuta', year: 2005 }, { playerId: 'cur_aldair', year: 2003 },
  { playerId: 'cur_zidane98', year: 2006 }, { playerId: 'cur_delpiero', year: 2015 },
  { playerId: 'cur_mihajlovic', year: 2006 }, { playerId: 'cur_weah', year: 2003 },
];

// ── era-2009 (Bayern / Van Gaal reset) ───────────────────────────────────────
/**
 * Real 2009–12 transfers of the era. Ronaldo/Kaká/Benzema/Alonso/Robben/Gómez all
 * arrived in summer 2009 and are baked into the opening squads, so the ledger
 * carries the ONWARD moves: Özil and Khedira to Madrid (2010), the Bundesliga's
 * best sold on (Džeko to City, Vidal to Juve, Şahin to Madrid), and — offered to
 * the user as Bayern — the real Bayern buys Neuer, Boateng and Kroos.
 */
const LEDGER_2009: RealTransferLedgerEntry[] = [
  { playerId: 'cur_raul09', from: 'real_madrid', to: 'schalke', window: '2010-07', fee: 0 },
  { playerId: 'cur_khedira09', from: 'stuttgart', to: 'real_madrid', window: '2010-07', fee: 12_000_000 },
  { playerId: 'cur_ozil09', from: 'bremen', to: 'real_madrid', window: '2010-08', fee: 15_000_000 },
  { playerId: 'cur_kroos09', from: 'leverkusen', to: 'bayern', window: '2010-07', fee: 0 },
  { playerId: 'cur_boateng09', from: 'hamburg', to: 'man_city', window: '2010-07', fee: 10_500_000, id: 'boateng-city-2010' },
  { playerId: 'cur_barzagli09', from: 'wolfsburg', to: 'juventus', window: '2011-01', fee: 300_000 },
  { playerId: 'cur_dzeko09', from: 'wolfsburg', to: 'man_city', window: '2011-01', fee: 27_000_000 },
  { playerId: 'cur_rakitic09', from: 'schalke', to: 'sevilla', window: '2011-01', fee: 2_500_000 },
  { playerId: 'cur_neuer09', from: 'schalke', to: 'bayern', window: '2011-07', fee: 22_000_000 },
  { playerId: 'cur_boateng09', from: 'man_city', to: 'bayern', window: '2011-07', fee: 13_500_000, id: 'boateng-bayern-2011' },
  { playerId: 'cur_sahin09', from: 'dortmund', to: 'real_madrid', window: '2011-07', fee: 8_000_000 },
  { playerId: 'cur_vidal09', from: 'leverkusen', to: 'juventus', window: '2011-07', fee: 10_500_000 },
  { playerId: 'cur_merte09', from: 'bremen', to: 'arsenal', window: '2011-08', fee: 8_000_000 },
  { playerId: 'cur_gustavo09', from: 'hoffenheim', to: 'bayern', window: '2011-01', fee: 15_000_000 },
  { playerId: 'cur_schurrle09', from: 'mainz', to: 'leverkusen', window: '2011-07', fee: 8_000_000 },
  { playerId: 'cur_marin09', from: 'bremen', to: 'chelsea', window: '2012-07', fee: 7_000_000 },
  { playerId: 'cur_reus09', from: 'gladbach', to: 'dortmund', window: '2012-07', fee: 17_000_000 },
  { playerId: 'cur_dante09', from: 'gladbach', to: 'bayern', window: '2012-07', fee: 4_500_000 },
  { playerId: 'cur_podolski09', from: 'koln', to: 'arsenal', window: '2012-07', fee: 11_000_000 },
  // The bottom-four's future stars leaving for the big clubs — the real moves a
  // Bayern user could pre-empt (sign the kid before Dortmund/Leverkusen do).
  { playerId: 'cur_piszczek09', from: 'hertha', to: 'dortmund', window: '2010-07', fee: 0 },
  { playerId: 'cur_gundogan09', from: 'nurnberg', to: 'dortmund', window: '2011-07', fee: 4_000_000 },
  { playerId: 'cur_toprak09', from: 'freiburg', to: 'leverkusen', window: '2011-07', fee: 2_500_000 },
];

const RETIREMENTS_2009: RealRetirement[] = [
  { playerId: 'cur_hyypia09', year: 2011 }, { playerId: 'cur_lehmann09', year: 2011 },
  { playerId: 'cur_guti09', year: 2011 }, { playerId: 'cur_butt09', year: 2011 },
  { playerId: 'cur_vannistelrooy09', year: 2012 }, { playerId: 'cur_frings09', year: 2013 },
  { playerId: 'cur_klose09', year: 2016 }, { playerId: 'cur_raul09', year: 2015 },
  { playerId: 'cur_casillas09', year: 2020 }, { playerId: 'cur_pizarro09', year: 2020 },
];

const ACADEMY_2009: AcademyGraduate[] = [
  // Mario Götze — the Dortmund academy jewel of the era (and the man who scored
  // the 2014 World Cup final winner), whose CLUB career never matched it: a move
  // to Bayern and a metabolic illness derailed him. A lost talent (latent 91).
  { year: 2010, seed: { id: 'cur_gotze09', club: 'dortmund', name: 'Mario Götze', birthYear: 1992, nationality: 'Germany', positions: ['AM', 'RW'], ability: 64, potentialCeiling: 84, latentCeiling: 91, contractUntil: 2014, injuryProneness: 45, personality: per(7, 6, 8, 6, 5, 7) } },
];

/** era-2003 forward ledger (barcelona-2003 / chelsea-2003 starts) — the real exits
 *  of the curated 2003 Clásico squads across 2003–08, so a mid-era start has a real
 *  transfer market rather than a ledger that is already in the past. */
const LEDGER_2003: RealTransferLedgerEntry[] = [
  { playerId: 'cur_quaresma03', from: 'barcelona', to: 'porto', window: '2004-07', fee: 6_000_000 },
  { playerId: 'cur_kluivert03', from: 'barcelona', to: 'newcastle', window: '2004-07', fee: 0 },
  { playerId: 'cur_cocu03', from: 'barcelona', to: 'psv', window: '2004-07', fee: 0 },
  { playerId: 'cur_davids03', from: 'barcelona', to: 'inter', window: '2004-07', fee: 0 },
  { playerId: 'cur_saviola03', from: 'barcelona', to: 'monaco', window: '2004-07', fee: 0 },
  { playerId: 'cur_reiziger03', from: 'barcelona', to: 'middlesbrough', window: '2004-07', fee: 0 },
  { playerId: 'cur_cambiasso03', from: 'real_madrid', to: 'inter', window: '2004-07', fee: 0 },
  { playerId: 'cur_figo03', from: 'real_madrid', to: 'inter', window: '2005-07', fee: 0 },
  { playerId: 'cur_portillo03', from: 'real_madrid', to: 'fiorentina', window: '2005-07', fee: 0 },
  { playerId: 'cur_ronaldo03', from: 'real_madrid', to: 'milan', window: '2007-01', fee: 5_000_000 },
  { playerId: 'cur_beckham03', from: 'real_madrid', to: 'la_galaxy', window: '2007-07', fee: 0 },
  // English top three (chelsea-2003) — the real churn of the Roman Empire's first
  // years and the break-up of the Invincibles / Ferguson's rebuild.
  { playerId: 'cur_hasselbaink03c', from: 'chelsea', to: 'middlesbrough', window: '2004-07', fee: 0 },
  { playerId: 'cur_desailly03c', from: 'chelsea', to: 'al_gharafa', window: '2004-07', fee: 0 },
  { playerId: 'cur_melchiot03c', from: 'chelsea', to: 'birmingham', window: '2004-07', fee: 0 },
  { playerId: 'cur_veron03c', from: 'chelsea', to: 'inter', window: '2004-08', fee: 0 },
  { playerId: 'cur_crespo03c', from: 'chelsea', to: 'milan', window: '2004-08', fee: 0 },
  { playerId: 'cur_mutu03c', from: 'chelsea', to: 'juventus', window: '2005-01', fee: 0 },
  { playerId: 'cur_babayaro03c', from: 'chelsea', to: 'newcastle', window: '2005-01', fee: 0 },
  { playerId: 'cur_gallas03c', from: 'chelsea', to: 'arsenal', window: '2006-07', fee: 0 },
  { playerId: 'cur_duff03c', from: 'chelsea', to: 'newcastle', window: '2006-07', fee: 10_000_000 },
  { playerId: 'cur_geremi03c', from: 'chelsea', to: 'newcastle', window: '2007-07', fee: 0 },
  { playerId: 'cur_gjohnson03c', from: 'chelsea', to: 'portsmouth', window: '2007-07', fee: 4_000_000 },
  { playerId: 'cur_wiltord03a', from: 'arsenal', to: 'lyon', window: '2004-07', fee: 0 },
  { playerId: 'cur_vieira03a', from: 'arsenal', to: 'juventus', window: '2005-07', fee: 13_000_000 },
  { playerId: 'cur_edu03a', from: 'arsenal', to: 'valencia', window: '2005-07', fee: 0 },
  { playerId: 'cur_acole03a', from: 'arsenal', to: 'chelsea', window: '2006-07', fee: 5_000_000 },
  { playerId: 'cur_campbell03a', from: 'arsenal', to: 'portsmouth', window: '2006-07', fee: 0 },
  { playerId: 'cur_pires03a', from: 'arsenal', to: 'villarreal', window: '2006-07', fee: 0 },
  { playerId: 'cur_lauren03a', from: 'arsenal', to: 'portsmouth', window: '2007-01', fee: 0 },
  { playerId: 'cur_butt03m', from: 'man_utd', to: 'newcastle', window: '2004-07', fee: 0 },
  { playerId: 'cur_forlan03m', from: 'man_utd', to: 'villarreal', window: '2004-07', fee: 0 },
  { playerId: 'cur_keane03m', from: 'man_utd', to: 'celtic', window: '2005-12', fee: 0 },
  { playerId: 'cur_pneville03m', from: 'man_utd', to: 'everton', window: '2005-07', fee: 3_500_000 },
  { playerId: 'cur_kleberson03m', from: 'man_utd', to: 'besiktas', window: '2005-07', fee: 0 },
  { playerId: 'cur_ronaldo03m', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000 },
];

/** era-2006 forward ledger (real-madrid-2006 / juventus-2006 / milan-2007 starts) —
 *  the real exits of the curated 2006 Real Madrid & Barça squads across 2006–11.
 *  real-madrid-2006 had NO forward ledger before this (its era-1995-2005 fallthrough
 *  was entirely in the past); now the Galáctico break-up plays out as reality. */
const LEDGER_2006: RealTransferLedgerEntry[] = [
  // Real Madrid — the Capello champions dismantled.
  { playerId: 'cur_ronaldo06', from: 'real_madrid', to: 'milan', window: '2007-01', fee: 7_500_000 },
  { playerId: 'cur_cassano06', from: 'real_madrid', to: 'sampdoria', window: '2007-07', fee: 0 },
  { playerId: 'cur_emerson06', from: 'real_madrid', to: 'milan', window: '2007-07', fee: 0 },
  { playerId: 'cur_robertocarlos06', from: 'real_madrid', to: 'fenerbahce', window: '2007-07', fee: 0 },
  { playerId: 'cur_beckham06', from: 'real_madrid', to: 'la_galaxy', window: '2007-07', fee: 0 },
  { playerId: 'cur_helguera06', from: 'real_madrid', to: 'valencia', window: '2007-07', fee: 0 },
  { playerId: 'cur_robinho06', from: 'real_madrid', to: 'man_city', window: '2008-08', fee: 32_000_000 },
  { playerId: 'cur_cannavaro06', from: 'real_madrid', to: 'juventus', window: '2009-07', fee: 0 },
  { playerId: 'cur_salgado06', from: 'real_madrid', to: 'blackburn', window: '2009-07', fee: 0 },
  { playerId: 'cur_vannistelrooy06', from: 'real_madrid', to: 'hamburg', window: '2010-01', fee: 0 },
  { playerId: 'cur_raul06', from: 'real_madrid', to: 'schalke', window: '2010-07', fee: 0 },
  { playerId: 'cur_guti06', from: 'real_madrid', to: 'besiktas', window: '2010-07', fee: 0 },
  // Barcelona — the Rijkaard side breaking up.
  { playerId: 'cur_giuly06', from: 'barcelona', to: 'roma', window: '2007-07', fee: 3_000_000 },
  { playerId: 'cur_ronaldinho06', from: 'barcelona', to: 'milan', window: '2008-07', fee: 21_000_000 },
  { playerId: 'cur_deco06', from: 'barcelona', to: 'chelsea', window: '2008-07', fee: 8_000_000 },
  { playerId: 'cur_zambrotta06', from: 'barcelona', to: 'milan', window: '2008-07', fee: 9_000_000 },
  { playerId: 'cur_oleguer06', from: 'barcelona', to: 'ajax', window: '2008-07', fee: 0 },
  { playerId: 'cur_edmilson06', from: 'barcelona', to: 'villarreal', window: '2008-07', fee: 0 },
  { playerId: 'cur_motta06', from: 'barcelona', to: 'genoa', window: '2008-07', fee: 0 },
  { playerId: 'cur_giovani06', from: 'barcelona', to: 'spurs', window: '2008-07', fee: 5_000_000 },
  { playerId: 'cur_etoo06', from: 'barcelona', to: 'inter', window: '2009-07', fee: 20_000_000 },
  { playerId: 'cur_gudjohnsen06', from: 'barcelona', to: 'monaco', window: '2009-07', fee: 0 },
  { playerId: 'cur_sylvinho06', from: 'barcelona', to: 'man_city', window: '2009-07', fee: 0 },
  { playerId: 'cur_marquez06', from: 'barcelona', to: 'ny_red_bulls', window: '2010-07', fee: 0 },
];

/** Registry keyed by era pack id. */
export const ERA_REALITY: Record<string, EraRealityPack> = {
  'era-2003': { realTransferLedger: LEDGER_2003, academyIntakes: [], realInjuries: [], retirements: [], academyGraduates: [], nearMisses: [] },
  'era-2006': { realTransferLedger: LEDGER_2006, academyIntakes: [], realInjuries: [], retirements: [], academyGraduates: [], nearMisses: [] },
  'era-1998': { realTransferLedger: LEDGER_1998, academyIntakes: [], realInjuries: INJURIES_1998, retirements: RETIREMENTS_1998, academyGraduates: ACADEMY_1998, nearMisses: NEARMISS_1998 },
  'era-1995-2005': { realTransferLedger: LEDGER_1999_2004, academyIntakes: [], realInjuries: INJURIES_1999, retirements: RETIREMENTS_1999, academyGraduates: ACADEMY_1999, nearMisses: NEARMISS_1999_2014 },
  'era-2013': { realTransferLedger: LEDGER_2013_2016, academyIntakes: [], realInjuries: INJURIES_2013, retirements: RETIREMENTS_2013, academyGraduates: ACADEMY_2013, nearMisses: [...NEARMISS_2013, ...NEARMISS_2013_NM] },
  'era-2004': { realTransferLedger: LEDGER_2004_2009, academyIntakes: [], realInjuries: INJURIES_2004, retirements: RETIREMENTS_2004, academyGraduates: ACADEMY_2004, financialShocks: SHOCKS_2004, nearMisses: NEARMISS_2004_NM },
  'era-2001': { realTransferLedger: LEDGER_2001_2005, academyIntakes: [], realInjuries: [], retirements: RETIREMENTS_2001, academyGraduates: ACADEMY_2001, financialShocks: SHOCKS_2001, nearMisses: NEARMISS_2001_NM },
  // era-2009 (Bayern / Van Gaal reset). Ledger + injuries + retirements are the
  'era-2009': { realTransferLedger: LEDGER_2009, academyIntakes: [], realInjuries: INJURIES_2009, retirements: RETIREMENTS_2009, academyGraduates: ACADEMY_2009, nearMisses: NEARMISS_2009_NM },
};

/** The era pack a scenario draws its reality data from. */
export function eraForScenario(scenarioId: string): string {
  if (scenarioId.endsWith('-2013')) return 'era-2013';
  if (scenarioId.endsWith('-2009')) return 'era-2009';
  if (scenarioId.endsWith('-2004')) return 'era-2004';
  if (scenarioId.endsWith('-2001')) return 'era-2001';
  if (scenarioId.endsWith('-1998')) return 'era-1998';
  // Mid-era starts get their own FORWARD ledger (their era-1995-2005 fallthrough was
  // already in the past → a near-empty market). §reality-default.
  if (scenarioId.endsWith('-2003')) return 'era-2003';
  if (scenarioId.endsWith('-2006') || scenarioId.endsWith('-2007')) return 'era-2006';
  return 'era-1995-2005';
}

// Pressure/override types moved to types.ts (ClubState now carries `pressure`,
// so they must live where ClubState does to avoid a circular import). Re-exported
// here so existing import sites (index.ts) are unchanged. Wired live in M8
// (ambition.ts) — see docs/DESIGN-ambition.md.
export type { ClubPressure, AmbitionOverride } from './types.js';

/**
 * A procedural player is anonymous depth (Principle 2): NEVER a scoutable
 * prospect, academy intake, or narrative subject. Real players are `curated`.
 */
export function isProcedural(player: { curated: boolean }): boolean {
  return player.curated === false;
}
