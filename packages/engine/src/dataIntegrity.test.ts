import { describe, it, expect } from 'vitest';
import { SCENARIOS } from './scenarios.js';
import { createNewGame } from './state.js';
import { currentYear } from './transfers.js';
import { clubSquadPlayers } from './players.js';
import { ERA_REALITY, eraForScenario } from './ledger.js';
import { transferWindowOrdinal } from './clock.js';
import type { GameState } from './types.js';

/**
 * Data-integrity guard for the curated world. The curated packs are large and
 * hand-edited era by era; the two failure modes that most damage immersion are
 * (a) the same real footballer seeded at two clubs at once ("Ćorluka at Spurs
 * AND City") and (b) an invalid position code that the tactical layer can't map.
 * These assertions run every scenario's opening world and fail loudly the moment
 * a ledger edit reintroduces either. If a duplicate is legitimate (two real
 * players who genuinely share a name) add the name to KNOWN_SHARED_NAMES with a
 * note — do not weaken the check.
 */

const VALID_POS = new Set(['GK', 'RB', 'LB', 'CB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']);

// Real distinct footballers who happen to share a display name and may legitimately
// appear at two clubs in the same world. Empty today; extend with a justification.
const KNOWN_SHARED_NAMES = new Set<string>([]);

// Players deliberately seeded outside the 15–42 plausibility band: young talents
// placed at their real selling club well before their breakout (so the pipeline
// can develop them forward), and genuine late-career outliers.
const KNOWN_AGE_EXCEPTIONS = new Set<string>([
  'Cristiano Ronaldo', // seeded at Sporting as a teenager for the youth pipeline
  'Antonio Valencia', //  early selling-club seed
  'Sergio Ramos', //      early selling-club seed at Sevilla
  'Marco Ballotta', //    genuinely played top-flight into his mid-40s
]);

describe('curated data integrity', () => {
  const scenarioIds = Object.keys(SCENARIOS);

  it.each(scenarioIds)('%s seeds no player at two clubs at once', (id) => {
    const s: GameState = createNewGame({ scenarioId: id, seed: 'integrity' });
    const byName = new Map<string, Set<string>>();
    for (const p of Object.values(s.players)) {
      if (p.retired) continue;
      if (KNOWN_SHARED_NAMES.has(p.name)) continue;
      const clubs = byName.get(p.name) ?? new Set<string>();
      clubs.add(String(p.club));
      byName.set(p.name, clubs);
    }
    const dups = [...byName.entries()]
      .filter(([, clubs]) => clubs.size > 1)
      .map(([name, clubs]) => `${name} @ ${[...clubs].join(', ')}`);
    expect(dups, `duplicate players in ${id}`).toEqual([]);
  });

  it.each(scenarioIds)('%s seeds no player twice at the same club', (id) => {
    // A club can accrete the same real man from two curated packs (a domestic
    // top-up plus a bespoke seed) — a dup the cross-club check above misses because
    // both copies sit at one club. Count names per club and flag any that repeat.
    const s: GameState = createNewGame({ scenarioId: id, seed: 'integrity' });
    const seen = new Map<string, number>();
    for (const p of Object.values(s.players)) {
      if (p.retired) continue;
      const key = `${p.club}::${p.name}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    const dups = [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k);
    expect(dups, `same-club duplicate seeds in ${id}`).toEqual([]);
  });

  // The two checks above read `s.players`, a map keyed by id — so a player seeded at
  // two clubs collapses to ONE entry and the dup hides in the `club.squad` ARRAYS.
  // These two inspect the squad arrays directly, catching the id-level duplication the
  // name checks structurally cannot (a curated seed re-listed at his destination, or a
  // depth pack re-adding a marquee already present).
  it.each(scenarioIds)('%s lists no player in two squads at once', (id) => {
    const s: GameState = createNewGame({ scenarioId: id, seed: 'integrity' });
    const clubsOf = new Map<string, Set<string>>();
    for (const [cid, club] of Object.entries(s.clubs))
      for (const pid of club.squad ?? []) (clubsOf.get(pid) ?? clubsOf.set(pid, new Set()).get(pid)!).add(cid);
    const dups = [...clubsOf.entries()].filter(([, c]) => c.size > 1)
      .map(([pid, c]) => `${s.players[pid]?.name ?? pid} @ ${[...c].join(', ')}`);
    expect(dups, `player in two squads in ${id}`).toEqual([]);
  });

  it.each(scenarioIds)('%s lists no player twice in one squad', (id) => {
    const s: GameState = createNewGame({ scenarioId: id, seed: 'integrity' });
    const dups: string[] = [];
    for (const [cid, club] of Object.entries(s.clubs)) {
      const seen = new Set<string>();
      for (const pid of club.squad ?? []) { if (seen.has(pid)) dups.push(`${s.players[pid]?.name ?? pid} @ ${cid}`); seen.add(pid); }
    }
    expect(dups, `same-squad duplicate entries in ${id}`).toEqual([]);
  });

  it.each(scenarioIds)('%s uses only valid position codes', (id) => {
    const s: GameState = createNewGame({ scenarioId: id, seed: 'integrity' });
    const bad: string[] = [];
    for (const p of Object.values(s.players)) {
      for (const pos of p.positions) if (!VALID_POS.has(pos)) bad.push(`${p.name}: ${pos}`);
    }
    expect(bad, `invalid positions in ${id}`).toEqual([]);
  });

  it.each(scenarioIds)('%s fields a goalkeeper in the playable squad', (id) => {
    // A club with no keeper on the roster is a broken start (the coach can't pick
    // an XI). Every scenario's own club must carry at least one GK at kickoff.
    const s: GameState = createNewGame({ scenarioId: id, seed: 'integrity' });
    const keepers = clubSquadPlayers(s, s.playerClub).filter((p) => p.positions.includes('GK'));
    expect(keepers.length, `no goalkeeper in ${id} playable squad`).toBeGreaterThan(0);
  });

  it.each(scenarioIds)('%s seeds every player at a plausible age', (id) => {
    const s: GameState = createNewGame({ scenarioId: id, seed: 'integrity' });
    const yr = currentYear(s);
    const bad: string[] = [];
    for (const p of Object.values(s.players)) {
      if (p.retired || KNOWN_AGE_EXCEPTIONS.has(p.name)) continue;
      const age = yr - p.birthYear;
      if (age < 15 || age > 42) bad.push(`${p.name}: age ${age}`);
    }
    expect(bad, `implausible ages in ${id}`).toEqual([]);
  });

  // "Seeded too early": a player sitting at a club at kickoff that the reality ledger
  // says he only ARRIVES at later (Dani Alves at Sevilla in 2000; van Nistelrooy at
  // United a year before his move). A genuine round-trip (he was really there, left,
  // and returns — Piqué's Barça→United→Barça) is NOT this: it has an earlier ledger
  // departure FROM that club, so it's excluded. The remaining allowlist is context
  // clubs whose whole squad is deliberately reused from the adjacent era pack (a
  // Serie-B Juventus save borrowing Milan's 2007 side, a Dortmund '97 save borrowing
  // Bayern's '98 side) — low-visibility bit-part clubs, documented not chased.
  const KNOWN_EARLY_SEEDS = new Set<string>([
    'cur_effenberg_98@bayern', // dortmund-1997 reuses the 1998 Bayern squad
    'cur_emerson_07@milan', //    juventus-2006 reuses the 2007 Milan squad
    'cur_oddo@milan', //          juventus-2006 reuses the 2007 Milan squad
  ]);

  it.each(scenarioIds)('%s seeds no player at a club before his real arrival', (id) => {
    const s: GameState = createNewGame({ scenarioId: id, seed: 'integrity' });
    const ledger = ERA_REALITY[eraForScenario(id)]?.realTransferLedger ?? [];
    const kick = transferWindowOrdinal(s.clock.date);
    const early: string[] = [];
    for (const e of ledger) {
      const p = s.players[e.playerId];
      if (!p || p.retired || p.club !== e.to) continue; // must be seeded AT the arrival club
      if (transferWindowOrdinal(e.window) - kick <= 1) continue; // opening-window move (M12C rewind handles it)
      // Round-trip? An earlier real departure FROM this club means he was genuinely
      // here and this "arrival" is a return, not a too-early seed.
      const isReturn = ledger.some((d) => d.playerId === e.playerId && d.from === e.to && d.window < e.window);
      if (isReturn) continue;
      const key = `${e.playerId}@${e.to}`;
      if (!KNOWN_EARLY_SEEDS.has(key)) early.push(`${p.name} @ ${e.to} (arrives ${e.window})`);
    }
    expect(early, `players seeded before real arrival in ${id}`).toEqual([]);
  });

  // "Dead price anchor": a paid departure whose playerId never resolves to a real
  // squad member at its `from` club. This is the SWP/Wiltord class — the same real
  // footballer carries a DIFFERENT curated id per era (SWP is `cur_swp_mc` in
  // era-2004 but `cur_swp_mc3` in era-2003), so a sale entry keyed to the other
  // era's id silently anchors nothing. realMarketFee matches on
  // `e.playerId === p.id && e.from === p.club && e.fee > 0`; if no seeded player
  // satisfies that, the asking price falls back to the abstract model value and
  // reality-pricing breaks (SWP offered at £3.7m in Jan 2005 instead of ~£21m).
  // A departure is "live" when the player is either seeded at `from` at kickoff OR
  // arrives there via an earlier ledger entry (so he'll be there when it fires).
  // A departure fires only while the player is at `from`; he can get there three
  // ways: (a) seeded at `from` at kickoff, (b) an earlier ledger arrival TO `from`,
  // or (c) an academy intake at `from` before the sale (graduates enter the world
  // mid-sim, not at kickoff, so the kickoff snapshot won't list them). Context
  // clubs whose whole squad is borrowed from an adjacent era carry pre-borrow sale
  // entries that can never fire — the same reuse the early-seed check documents.
  const KNOWN_DEAD_ANCHORS = new Set<string>([
    'cur_emerson_07@real_madrid', // juventus-2006 reuses the 2007 Milan squad
    'cur_oddo@lazio', //            juventus-2006 reuses the 2007 Milan squad
    'cur_effenberg_98@gladbach', // dortmund-1997 reuses the 1998 Bayern squad (he's
    //                              already at Bayern a year early, so his real
    //                              Gladbach→Bayern '98 move can never fire)
    'cur_suarez_lv10@liverpool', // bayern-2009 background: Suárez isn't seeded (he
    //                              was at Ajax in '09, no Ajax→Liverpool arrival in
    //                              this pack), so the '14 Barça sale is inert colour,
    //                              not a mispriced live player. Expand upstream to lift.
  ]);

  it.each(scenarioIds)('%s anchors every paid future departure to a resolvable squad member', (id) => {
    const s: GameState = createNewGame({ scenarioId: id, seed: 'integrity' });
    const ledger = ERA_REALITY[eraForScenario(id)]?.realTransferLedger ?? [];
    const intakes = ERA_REALITY[eraForScenario(id)]?.academyIntakes ?? [];
    const kick = transferWindowOrdinal(s.clock.date);
    const dead: string[] = [];
    for (const e of ledger) {
      if (e.fee <= 0 || !e.from) continue; // only paid departures anchor pricing
      // A move at/before kickoff has already happened (or is the opening window,
      // handled by the M12C rewind) — it never anchors a live price, so skip it.
      if (transferWindowOrdinal(e.window) <= kick) continue;
      if (KNOWN_DEAD_ANCHORS.has(`${e.playerId}@${e.from}`)) continue;
      const p = s.players[e.playerId];
      const eYear = Number(e.window.slice(0, 4));
      const seededAtFrom = !!p && !p.retired && p.club === e.from;
      const arrivesAtFrom = ledger.some(
        (d) => d.playerId === e.playerId && d.to === e.from && d.window < e.window,
      );
      const graduatesAtFrom = intakes.some(
        (g) => g.playerId === e.playerId && g.clubId === e.from && g.year <= eYear,
      );
      if (!seededAtFrom && !arrivesAtFrom && !graduatesAtFrom) {
        dead.push(`${p?.name ?? '??'} (${e.playerId}) leaves ${e.from} for ${e.fee} @ ${e.window}`);
      }
    }
    expect(dead, `dead price anchors (playerId never reaches 'from') in ${id}`).toEqual([]);
  });
});
