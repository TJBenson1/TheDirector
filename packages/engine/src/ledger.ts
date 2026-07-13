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

import type { ClubId, PlayerId, YearMonth } from './types.js';

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

/** Per-era reality data. */
export interface EraRealityPack {
  realTransferLedger: RealTransferLedgerEntry[];
  academyIntakes: AcademyIntake[];
  realInjuries: RealInjuryEntry[];
  /** Real retirement years for curated players (age-based fallback otherwise). */
  retirements?: RealRetirement[];
  /** Real youth graduates who break through during the era (real players only). */
  academyGraduates?: AcademyGraduate[];
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
  { playerId: 'cur_redondo', from: 'real_madrid', to: 'milan', window: '2000-08', fee: 0 },
  { playerId: 'cur_campbell', from: 'spurs', to: 'arsenal', window: '2001-07', fee: 0 },
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
  { playerId: 'cur_vieira2', from: 'arsenal', to: 'juventus', window: '2005-07', fee: 20_000_000, id: 'vieira-juve-2005' },
  { playerId: 'cur_acole', from: 'arsenal', to: 'chelsea', window: '2006-07', fee: 16_000_000, id: 'cole-chelsea-2006' },
  // The Gallas move was the OTHER HALF of the Cole deal — a swap. If the user
  // keeps Cole, the swap never happens, so Gallas never arrives.
  { playerId: 'cur_gallas2', from: 'chelsea', to: 'arsenal', window: '2006-08', fee: 5_000_000, id: 'gallas-arsenal-2006', enabledBy: 'cole-chelsea-2006' },
  { playerId: 'cur_henry', from: 'arsenal', to: 'barcelona', window: '2007-07', fee: 24_000_000, id: 'henry-barca-2007' },
  { playerId: 'cur_cristiano2', from: 'man_utd', to: 'real_madrid', window: '2009-07', fee: 80_000_000, id: 'cr7b-real-2009' },

  // United's real rebuild — the reason they, not Arsenal, dominated 2007-09.
  { playerId: 'cur_vidic', from: 'spartak_moscow', to: 'man_utd', window: '2006-01', fee: 7_000_000, id: 'vidic-utd-2006' },
  { playerId: 'cur_evra', from: 'monaco', to: 'man_utd', window: '2006-01', fee: 5_500_000, id: 'evra-utd-2006' },
  { playerId: 'cur_carrick2', from: 'spurs', to: 'man_utd', window: '2006-07', fee: 18_600_000, id: 'carrick-utd-2006' },
  { playerId: 'cur_vannistelrooy2', from: 'man_utd', to: 'real_madrid', window: '2006-07', fee: 14_000_000, id: 'ruud-real-2006' },
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
  { playerId: 'cur_etoo', from: 'mallorca', to: 'barcelona', window: '2004-07', fee: 24_000_000, id: 'etoo-barca-2004' },
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
];

// ── Real retirements (curated players hang up their boots ≈ when they did) ────

/** Man Utd 1999 squad + marquee era stars. Ledger subjects (Beckham, Anelka,
 *  Owen…) are exempt from retirement elsewhere, so they need no entry here. */
const RETIREMENTS_1999: RealRetirement[] = [
  { playerId: 'cur_bosnich', year: 2009 }, { playerId: 'cur_vdgouw', year: 2003 },
  { playerId: 'cur_gneville', year: 2011 }, { playerId: 'cur_pneville', year: 2013 },
  { playerId: 'cur_irwin', year: 2004 }, { playerId: 'cur_silvestre', year: 2014 },
  { playerId: 'cur_stam', year: 2007 }, { playerId: 'cur_rjohnsen', year: 2008 },
  { playerId: 'cur_wbrown', year: 2016 }, { playerId: 'cur_berg', year: 2004 },
  { playerId: 'cur_may', year: 2003 }, { playerId: 'cur_keane', year: 2006 },
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
  { playerId: 'cur_totti', year: 2017 }, { playerId: 'cur_pepe2', year: 2021 },
];

// ── Real academy graduates (real players only — the youth pipeline) ───────────

const per = (
  professionalism: number, ego: number, ambition: number,
  loyalty: number, volatility: number, adaptability: number,
) => ({ professionalism, ego, ambition, loyalty, volatility, adaptability });

const ACADEMY_1999: AcademyGraduate[] = [
  { year: 2001, seed: { id: 'cur_oshea99', club: 'man_utd', name: 'John O’Shea', birthYear: 1981, nationality: 'Ireland', positions: ['CB', 'RB'], ability: 60, potentialCeiling: 80, contractUntil: 2006, injuryProneness: 25, personality: per(8, 4, 7, 9, 4, 7) } },
  { year: 2003, seed: { id: 'cur_fletcher99', club: 'man_utd', name: 'Darren Fletcher', birthYear: 1984, nationality: 'Scotland', positions: ['CM'], ability: 58, potentialCeiling: 82, contractUntil: 2007, injuryProneness: 55, personality: per(9, 4, 8, 9, 3, 7) } },
  { year: 2004, seed: { id: 'cur_richardson99', club: 'man_utd', name: 'Kieran Richardson', birthYear: 1984, nationality: 'England', positions: ['LW', 'CM'], ability: 58, potentialCeiling: 76, contractUntil: 2007, injuryProneness: 30, personality: per(6, 6, 7, 6, 5, 7) } },
  { year: 2007, seed: { id: 'cur_jevans99', club: 'man_utd', name: 'Jonny Evans', birthYear: 1988, nationality: 'Northern Ireland', positions: ['CB'], ability: 56, potentialCeiling: 81, contractUntil: 2010, injuryProneness: 35, personality: per(8, 4, 7, 8, 4, 7) } },
  // Danny Welbeck — a real academy graduate carrying LATENT upside (his end
  // product never quite matched his talent; a patient United user can unlock it).
  { year: 2009, seed: { id: 'cur_welbeck99', club: 'man_utd', name: 'Danny Welbeck', birthYear: 1990, nationality: 'England', positions: ['ST', 'LW'], ability: 55, potentialCeiling: 80, latentCeiling: 87, contractUntil: 2012, injuryProneness: 45, personality: per(8, 4, 8, 8, 4, 7) } },
  { year: 2009, seed: { id: 'cur_cleverley99', club: 'man_utd', name: 'Tom Cleverley', birthYear: 1989, nationality: 'England', positions: ['CM'], ability: 55, potentialCeiling: 76, contractUntil: 2012, injuryProneness: 30, personality: per(7, 5, 7, 7, 4, 7) } },
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
  { playerId: 'cur_lehmann', year: 2011 }, { playerId: 'cur_lauren', year: 2012 },
  { playerId: 'cur_toure', year: 2015 }, { playerId: 'cur_campbell2', year: 2012 },
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
  { playerId: 'cur_shevchenko2', year: 2012 }, { playerId: 'cur_ballack', year: 2013 },
];

const ACADEMY_2004: AcademyGraduate[] = [
  // Jack Wilshere — the flagship Arsenal graduate AND a lost talent: brilliant at
  // 18, then broken by injuries. Latent 90 if a user can keep him fit and central.
  { year: 2008, seed: { id: 'cur_wilshere04', club: 'arsenal', name: 'Jack Wilshere', birthYear: 1992, nationality: 'England', positions: ['CM', 'AM'], ability: 60, potentialCeiling: 82, latentCeiling: 90, contractUntil: 2013, injuryProneness: 70, personality: per(6, 7, 8, 8, 6, 6) } },
  { year: 2009, seed: { id: 'cur_gibbs04', club: 'arsenal', name: 'Kieran Gibbs', birthYear: 1989, nationality: 'England', positions: ['LB'], ability: 58, potentialCeiling: 80, contractUntil: 2013, injuryProneness: 45, personality: per(7, 5, 7, 7, 4, 7) } },
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
  { playerId: 'cur_veron01', year: 2012 }, { playerId: 'cur_ruud01', year: 2012 },
  { playerId: 'cur_solskjaer01', year: 2007 }, { playerId: 'cur_cole01', year: 2008 },
  { playerId: 'cur_seaman01', year: 2004 }, { playerId: 'cur_adams01', year: 2002 },
  { playerId: 'cur_vieira01', year: 2011 }, { playerId: 'cur_bergkamp01', year: 2006 },
  { playerId: 'cur_henry01', year: 2014 }, { playerId: 'cur_shearer01', year: 2006 },
  { playerId: 'cur_martyn', year: 2006 }, { playerId: 'cur_speed01', year: 2011 },
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
  { playerId: 'cur_nedved98', from: 'lazio', to: 'juventus', window: '2001-07', fee: 41_000_000 },
  { playerId: 'cur_thuram', from: 'parma', to: 'juventus', window: '2001-07', fee: 22_000_000 },
  { playerId: 'cur_cannavaro', from: 'parma', to: 'inter', window: '2002-07', fee: 23_000_000 },
];

const ACADEMY_1998: AcademyGraduate[] = [
  // Adriano — O Imperador. Arrived at Inter with the physique and shot of a
  // generational striker; personal tragedy and lifestyle unravelled him. The
  // definitive lost talent: latent 94, but a temperament almost no one reaches.
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
  { playerId: 'cur_zidane98', year: 2006 }, { playerId: 'cur_delpiero', year: 2012 },
  { playerId: 'cur_mihajlovic', year: 2006 }, { playerId: 'cur_weah', year: 2003 },
];

/** Registry keyed by era pack id. */
export const ERA_REALITY: Record<string, EraRealityPack> = {
  'era-1998': { realTransferLedger: LEDGER_1998, academyIntakes: [], realInjuries: INJURIES_1998, retirements: RETIREMENTS_1998, academyGraduates: ACADEMY_1998 },
  'era-1995-2005': { realTransferLedger: LEDGER_1999_2004, academyIntakes: [], realInjuries: INJURIES_1999, retirements: RETIREMENTS_1999, academyGraduates: ACADEMY_1999 },
  'era-2013': { realTransferLedger: LEDGER_2013_2016, academyIntakes: [], realInjuries: INJURIES_2013, retirements: RETIREMENTS_2013, academyGraduates: ACADEMY_2013 },
  'era-2004': { realTransferLedger: LEDGER_2004_2009, academyIntakes: [], realInjuries: INJURIES_2004, retirements: RETIREMENTS_2004, academyGraduates: ACADEMY_2004 },
  'era-2001': { realTransferLedger: LEDGER_2001_2005, academyIntakes: [], realInjuries: [], retirements: RETIREMENTS_2001, academyGraduates: ACADEMY_2001 },
};

/** The era pack a scenario draws its reality data from. */
export function eraForScenario(scenarioId: string): string {
  if (scenarioId.endsWith('-2013')) return 'era-2013';
  if (scenarioId.endsWith('-2004')) return 'era-2004';
  if (scenarioId.endsWith('-2001')) return 'era-2001';
  if (scenarioId.endsWith('-1998')) return 'era-1998';
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
