import { describe, it, expect } from 'vitest';
import { SCENARIOS } from './scenarios.js';
import { createNewGame } from './state.js';
import { currentYear } from './transfers.js';
import { clubSquadPlayers } from './players.js';
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
});
