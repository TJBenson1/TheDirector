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
];

/** Near-misses of 2003: the summer the game turns on. */
const NEAR_MISS_2003: NearMissEntry[] = [
  // Laporta campaigned on signing Beckham for Barcelona; he chose Real Madrid.
  { playerId: 'cur_beckham_u', to: 'barcelona', window: '2003-07', note: "Barça's Laporta courted Beckham; he chose Real" },
];

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
  // The Ronaldinho gambit: his real 2003 move to Barça, live for a United side
  // playing forward from 1999 to hijack (the counterfactual that was once its own
  // 2003 start point). Left alone, Barça sign him as reality.
  { playerId: 'cur_ronaldinho', from: 'psg', to: 'barcelona', window: '2003-07', fee: 30_000_000, id: 'ronaldinho-barca-2003' },
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
  { playerId: 'cur_etoo', from: 'mallorca', to: 'barcelona', window: '2004-07', fee: 24_000_000, id: 'etoo-barca-2004' },
  { playerId: 'cur_deco', from: 'porto', to: 'barcelona', window: '2004-07', fee: 21_000_000, id: 'deco-barca-2004' },
  { playerId: 'cur_giuly', from: 'monaco', to: 'barcelona', window: '2004-07', fee: 8_000_000, id: 'giuly-barca-2004' },
  { playerId: 'cur_kluivert', from: 'barcelona', to: 'newcastle', window: '2004-07', fee: 5_000_000, id: 'kluivert-newcastle-2004' },
  // ── Valencia / Deportivo / Sociedad (context: title rivals' real business) ──
  { playerId: 'cur_mendieta', from: 'valencia', to: 'lazio', window: '2001-07', fee: 48_000_000, id: 'mendieta-lazio-2001' },
  { playerId: 'cur_makaay', from: 'deportivo', to: 'bayern', window: '2003-07', fee: 19_000_000, id: 'makaay-bayern-2003' },
  { playerId: 'cur_xabi_alonso', from: 'real_sociedad', to: 'liverpool', window: '2004-07', fee: 11_000_000, id: 'xabi-liverpool-2004' },
  { playerId: 'cur_villa', from: 'zaragoza', to: 'valencia', window: '2005-07', fee: 12_000_000, id: 'villa-valencia-2005' },
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
  { playerId: 'cur_zambrotta_j', from: 'juventus', to: 'barcelona', window: '2006-07', fee: 14_000_000, id: 'zambrotta-barca-2006' },
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
  // ── The live 2003 window — the counterfactual's launch point ──
  { playerId: 'cur_ronaldinho', from: 'psg', to: 'barcelona', window: '2003-07', fee: 30_000_000, id: 'ronaldinho-barca-2003' },
  { playerId: 'cur_cristiano', from: 'sporting', to: 'man_utd', window: '2003-07', fee: 12_200_000, id: 'cristiano-utd-2003' },
  { playerId: 'cur_beckham_u', from: 'man_utd', to: 'real_madrid', window: '2003-07', fee: 25_000_000, id: 'beckham-real-2003' },
  // ── Barça's bought spine arrives (2004) — divertible by the user ──
  { playerId: 'cur_deco', from: 'porto', to: 'barcelona', window: '2004-07', fee: 21_000_000, id: 'deco-barca-2004' },
  { playerId: 'cur_etoo', from: 'mallorca', to: 'barcelona', window: '2004-07', fee: 24_000_000, id: 'etoo-barca-2004' },
  // Piqué to United (2004) then home to Barça (2008) — the "keep Piqué" decision.
  { playerId: 'cur_pique_b', from: 'barcelona', to: 'man_utd', window: '2004-07', fee: 5_000_000, id: 'pique-utd-2004' },
  { playerId: 'cur_pique_b', from: 'man_utd', to: 'barcelona', window: '2008-07', fee: 5_000_000, id: 'pique-barca-2008' },
  // ── Real Madrid / Chelsea / Arsenal real business (context for the CL) ──
  { playerId: 'cur_reyes_s', from: 'sevilla', to: 'arsenal', window: '2004-01', fee: 17_000_000, id: 'reyes-arsenal-2004' },
  { playerId: 'cur_owen_l', from: 'liverpool', to: 'real_madrid', window: '2004-07', fee: 8_000_000, id: 'owen-real-2004' },
  { playerId: 'cur_baptista_s', from: 'sevilla', to: 'real_madrid', window: '2005-07', fee: 20_000_000, id: 'baptista-real-2005' },
  { playerId: 'cur_henry_a', from: 'arsenal', to: 'barcelona', window: '2007-07', fee: 24_000_000, id: 'henry-barca-2007' },
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
  { playerId: 'cur_sheringham_s96', from: 'spurs', to: 'man_utd', window: '1997-07', fee: 3_500_000, id: 'sheringham-utd-1997' },
  { playerId: 'cur_ronaldo_b96', from: 'barcelona', to: 'inter', window: '1997-07', fee: 27_000_000, id: 'ronaldo-inter-1997' },
  { playerId: 'cur_anelka_a96', from: 'arsenal', to: 'real_madrid', window: '1999-07', fee: 22_500_000, id: 'anelka-real-1999' },
  { playerId: 'cur_figo_b96', from: 'barcelona', to: 'real_madrid', window: '2000-07', fee: 37_000_000, id: 'figo-real-2000' },
  { playerId: 'cur_zidane_j96', from: 'juventus', to: 'real_madrid', window: '2001-07', fee: 46_000_000, id: 'zidane-real-2001' },
];

/**
 * Real Serie A market, 1998→2004 (inter-1998 "Il Fenomeno"). The calcio golden
 * age plays out: Ronaldo's record cash-out to Madrid (the user's to sanction if
 * they are Inter), Vieri's arrival, Zidane and Figo's galáctico moves, the
 * Parmalat fire-sale that fed the giants (Buffon/Thuram to Juve, Cannavaro to
 * Inter, Crespo/Verón to Lazio), and Sheva's leap from Kyiv to Milan.
 */
const LEDGER_1998_2004: RealTransferLedgerEntry[] = [
  // ── Inter's business (the user's, if they are Inter) ──
  { playerId: 'cur_vieri_l', from: 'lazio', to: 'inter', window: '1999-07', fee: 46_000_000, id: 'vieri-inter-1999' },
  { playerId: 'cur_cannavaro_p8', from: 'parma', to: 'inter', window: '2002-07', fee: 23_000_000, id: 'cannavaro-inter-2002' },
  { playerId: 'cur_ronaldo_r9', from: 'inter', to: 'real_madrid', window: '2002-08', fee: 45_000_000, id: 'ronaldo-real-2002' },
  // ── The galáctico moves ──
  { playerId: 'cur_figo_b', from: 'barcelona', to: 'real_madrid', window: '2000-07', fee: 60_000_000, id: 'figo-real-2000' },
  { playerId: 'cur_zidane_j8', from: 'juventus', to: 'real_madrid', window: '2001-07', fee: 75_000_000, id: 'zidane-real-2001' },
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

/** Ronaldo's ruptured knee — the era's defining injury. Fires only if Il Fenomeno
 *  is still at Inter (a user who cashed him in never sees it). */
const INJURIES_1998: RealInjuryEntry[] = [
  { playerId: 'cur_ronaldo_r9', atClub: 'inter', since: '1999-11', months: 15, serious: true, note: 'ruptured knee tendon, then a relapse in his comeback match — the injury that stole his peak' },
  { playerId: 'cur_delpiero_j8', atClub: 'juventus', since: '1998-11', months: 6, serious: true, note: 'cruciate ligament rupture at Udinese' },
];

/** Registry keyed by era pack id. */
export const ERA_REALITY: Record<string, EraRealityPack> = {
  'era-1996': { realTransferLedger: LEDGER_1996_2001, academyIntakes: [], realInjuries: [] },
  'era-1995-2005': { realTransferLedger: LEDGER_1999_2004, academyIntakes: [], realInjuries: INJURIES_1999 },
  'era-2013': { realTransferLedger: LEDGER_2013_2016, academyIntakes: [], realInjuries: INJURIES_2013 },
  'era-2004': { realTransferLedger: LEDGER_2004_2009, academyIntakes: [], realInjuries: INJURIES_2004, nearMissLedger: NEAR_MISS_2004 },
  'era-2001': { realTransferLedger: LEDGER_2001_2005, academyIntakes: [], realInjuries: [] },
  'era-2000': { realTransferLedger: LEDGER_2000_2006, academyIntakes: [], realInjuries: INJURIES_2000 },
  'era-serie-a-1995': { realTransferLedger: LEDGER_1995_2001, academyIntakes: [], realInjuries: INJURIES_1995 },
  'era-serie-a-1998': { realTransferLedger: LEDGER_1998_2004, academyIntakes: [], realInjuries: INJURIES_1998 },
  'era-2003': { realTransferLedger: LEDGER_2003_2011, academyIntakes: [], realInjuries: INJURIES_2003, nearMissLedger: NEAR_MISS_2003 },
};

/** The era pack a scenario draws its reality data from. */
export function eraForScenario(scenarioId: string): string {
  // The Serie A cluster is routed explicitly: its year suffixes (‑2004, ‑2006,
  // ‑2007) would otherwise collide with the English/other era packs.
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
