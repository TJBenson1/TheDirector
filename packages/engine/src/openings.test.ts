/**
 * Curated opening briefings (§ narration): every scenario carries a real,
 * historically-grounded opening, and it stays pure metadata — never read by the
 * simulation. Guards the data quality the narration layer renders.
 */
import { describe, it, expect } from 'vitest';
import { SCENARIOS, getScenario } from './scenarios.js';
import { createNewGame, hashState } from './state.js';
import { clubSquadPlayers } from './players.js';
import { realInboundThisWindow } from './recommend.js';
import type { ScenarioId } from './types.js';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ðđ]/g, 'd').replace(/þ/g, 'th').toLowerCase().replace(/[^a-z ]/g, '').trim();
const xiName = (entry: string) => { const sp = entry.indexOf(' '); return sp === -1 ? entry : entry.slice(sp + 1); };

const POS = new Set([
  'GK', 'RB', 'LB', 'CB', 'RWB', 'LWB', 'WB', 'SW',
  'DM', 'CDM', 'CM', 'RM', 'LM', 'WM',
  'AM', 'CAM', 'RW', 'LW', 'ST', 'CF', 'SS', 'RF', 'LF',
]);

describe('curated opening briefings', () => {
  it('every scenario has a curated opening', () => {
    for (const id of Object.keys(SCENARIOS) as ScenarioId[]) {
      const o = getScenario(id).opening;
      expect(o, `scenario ${id} missing opening`).toBeDefined();
      expect(o!.coach.length).toBeGreaterThan(0);
      expect(o!.formation.length).toBeGreaterThan(0);
      expect(o!.briefing.length).toBeGreaterThan(80); // a real paragraph, not a stub
    }
  });

  it('each first XI is eleven men with valid position tags', () => {
    for (const id of Object.keys(SCENARIOS) as ScenarioId[]) {
      const o = getScenario(id).opening!;
      expect(o.firstEleven.length, `${id} XI size`).toBe(11);
      for (const entry of o.firstEleven) {
        const pos = entry.slice(0, entry.indexOf(' ')).toUpperCase();
        expect(POS.has(pos), `${id}: bad position "${pos}" in "${entry}"`).toBe(true);
      }
    }
  });

  it('every opening XI player exists in the squad or arrives via the real ledger', () => {
    // A shipped opening must not name a starter the squad data doesn't have (the risk
    // when the XIs assume a differently-built squad). Guards the openings↔squads join.
    for (const id of Object.keys(SCENARIOS) as ScenarioId[]) {
      const o = getScenario(id).opening!;
      const s = createNewGame({ scenarioId: id, seed: 'xi' });
      const available = new Set(
        [...clubSquadPlayers(s, s.playerClub).map((p) => p.name), ...realInboundThisWindow(s).map((r) => r.name)].map(norm),
      );
      const surnames = new Set([...available].map((n) => n.split(' ').slice(-1)[0]));
      for (const entry of o.firstEleven) {
        const n = norm(xiName(entry));
        const ok = available.has(n) || surnames.has(n.split(' ').slice(-1)[0]);
        expect(ok, `${id}: XI names "${xiName(entry)}" but no such player in squad/inbound`).toBe(true);
      }
    }
  });

  it('no two scenarios share a briefing (each summer reads unique)', () => {
    const briefings = (Object.keys(SCENARIOS) as ScenarioId[]).map((id) => getScenario(id).opening!.briefing);
    expect(new Set(briefings).size).toBe(briefings.length);
  });

  it('the opening never leaks into the simulation state (pure metadata)', () => {
    // hashState captures everything the sim reads; the opening lives on the seed,
    // not on GameState, so a game hashes the same regardless.
    const s = createNewGame({ scenarioId: 'juventus-1995', seed: 'x' });
    expect(JSON.stringify(s)).not.toContain('firstEleven');
    expect(typeof hashState(s)).toBe('string');
  });
});
