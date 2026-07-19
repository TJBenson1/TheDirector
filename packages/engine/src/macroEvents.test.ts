/**
 * Item 2 — macro market windows: cash-rich destinations (China 2016, MLS 2020,
 * Saudi 2023) open up as one-off selling opportunities. Each fires once when its
 * date is reached, offering the user an inflated bid for a squad player who fits
 * the market's profile. Deterministic and dated ≥2016, beyond the calibration
 * horizon, so the harness never sees them.
 */
import { describe, it, expect } from 'vitest';
import { createNewGame } from './state.js';
import { clubSquadPlayers } from './players.js';
import { fireMacroEvents, applyConsequence } from './events.js';
import type { GameState, YearMonth } from './types.js';

function at(date: YearMonth): GameState {
  const s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'macro' });
  s.clock.date = date;
  return s;
}

describe('macro market windows', () => {
  it.each([
    ['2016-03', 'china-2016', 'Chinese Super League'],
    ['2020-08', 'mls-2020', 'MLS'],
    ['2023-08', 'saudi-2023', 'Saudi'],
  ] as const)('%s fires the %s window with an inflated bid for an eligible player', (date, id, marketName) => {
    const s = at(date);
    fireMacroEvents(s);
    // World colour logged once.
    expect(s.eventLog.some((e) => e.code === 'macro.world' && e.data?.id === id)).toBe(true);
    // A selling decision reaches the user's club, naming that market.
    const dec = s.pendingDecisions.find((d) => d.id.startsWith('macro:'));
    expect(dec, `${id} decision`).toBeDefined();
    expect(dec!.title).toContain(marketName);
    // Keep-first: the reject option leads, so a passive run never sells.
    expect(dec!.choices[0]!.id).toBe('keep');
    expect(dec!.choices.some((c) => c.id === 'cash-in')).toBe(true);
  });

  it('fires only once — a second pass in the same window adds no new decision', () => {
    const s = at('2016-03');
    fireMacroEvents(s);
    const n = s.pendingDecisions.length;
    fireMacroEvents(s);
    expect(s.pendingDecisions.length).toBe(n);
    expect(s.meta.firedScripted).toContain('macro:china-2016');
  });

  it('never fires before its date (a 2013 game in 2014 sees nothing)', () => {
    const s = at('2014-01');
    fireMacroEvents(s);
    expect(s.eventLog.some((e) => e.code === 'macro.world')).toBe(false);
    expect(s.pendingDecisions.some((d) => d.id.startsWith('macro:'))).toBe(false);
  });

  it('the Atlético 2013-14 story is a rich, pure-colour ambient background beat', () => {
    // The title-winning spine is a full curated squad, not a shell.
    const s0 = createNewGame({ scenarioId: 'man-utd-2013', seed: 'atleti' });
    const squad = clubSquadPlayers(s0, 'atletico');
    expect(squad.length).toBeGreaterThanOrEqual(16);
    expect(squad.map((p) => p.name)).toEqual(expect.arrayContaining(['Diego Godín', 'Koke', 'Diego Costa', 'Toby Alderweireld']));

    // Their real title + CL-final run is told as world colour in 2014, and it
    // mutates nothing (no decision, no player change) — pure ambient story.
    const s = at('2014-05');
    const budgetBefore = s.clubs['atletico']!.finances.transferBudget;
    const pendingBefore = s.pendingDecisions.length;
    fireMacroEvents(s);
    expect(s.eventLog.some((e) => e.data?.id === 'atletico-2014')).toBe(true);
    expect(s.pendingDecisions.length).toBe(pendingBefore); // no interactive decision
    expect(s.clubs['atletico']!.finances.transferBudget).toBe(budgetBefore); // no mutation
  });

  it('the Atlético story never fires in a pre-2013 game (the calibration scenario)', () => {
    const s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'atleti' });
    s.clock.date = '2014-05';
    fireMacroEvents(s);
    expect(s.eventLog.some((e) => e.data?.id === 'atletico-2014')).toBe(false);
  });

  it('cashing in sells the player OUT of the world and banks the inflated fee', () => {
    const s = at('2023-08');
    fireMacroEvents(s);
    const dec = s.pendingDecisions.find((d) => d.id.startsWith('macro:saudi'))!;
    const cashIn = dec.choices.find((c) => c.id === 'cash-in')!;
    const sell = cashIn.onSuccess!.find((c) => c.kind === 'sellAbroad')!;
    const pid = sell.playerId!;
    const seller = s.players[pid]!.club!;
    const budgetBefore = s.clubs[seller]!.finances.transferBudget;

    for (const c of cashIn.onSuccess!) applyConsequence(s, c);

    // Parked at the market sentinel, out of his old squad, fee banked.
    expect(s.players[pid]!.club).toBe('saudi');
    expect(s.clubs[seller]!.squad).not.toContain(pid);
    expect(s.clubs[seller]!.finances.transferBudget).toBeGreaterThan(budgetBefore);
    // The fee dwarfs true value (feeMult 1.7).
    expect(sell.amount!).toBeGreaterThan(0);
  });
});
