import { describe, it, expect } from 'vitest';
import { createNewGame, cloneState } from './state.js';
import { advanceWindow } from './advance.js';
import { applyDecision } from './events.js';
import { executeTransfer } from './transfers.js';
import { resolvePlayer, askingPrice, acquisitionTags } from './recommend.js';
import { valuePlayer } from './finance.js';
import { ledgerSquadMatch } from './ledgerExec.js';
import { parseYearMonth } from './clock.js';
import type { GameState } from './types.js';

function play(state: GameState, windows: number): GameState {
  let s = state;
  for (let i = 0; i < windows; i++) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    s = advanceWindow(s).state;
  }
  return s;
}

describe('reality-ledger execution (§9f)', () => {
  it('a passive user preserves real history — ledger subjects reach real clubs', () => {
    let s = createNewGame({ seed: 'ledger-passive' });
    s = play(s, 30); // ~15 years, no user transfers
    // Real destinations, as in reality — OR the legend has since retired (also
    // reality-consistent; a retired player isn't sitting at the wrong club).
    const reality = (id: string, club: string) =>
      s.players[id]?.club === club || (s.meta.retiredLedgerSubjects ?? []).includes(id);
    expect(reality('cur_anelka', 'real_madrid')).toBe(true);
    expect(reality('cur_overmars', 'barcelona')).toBe(true);
    expect(reality('cur_crespo', 'chelsea')).toBe(true);
    expect(reality('cur_rkeane', 'spurs')).toBe(true);
    expect(reality('cur_owen', 'real_madrid')).toBe(true);

    const match = ledgerSquadMatch(s);
    expect(match.total).toBeGreaterThan(0);
    expect(match.atRealClub / match.total).toBeGreaterThanOrEqual(0.85);
    // Every executed entry logged as reality holding.
    expect(s.eventLog.some((e) => e.code === 'ledger.executed')).toBe(true);
    expect(s.eventLog.some((e) => e.code === 'ledger.fallback')).toBe(false);
  });

  it('the user signing a ledger target invalidates the entry → logged butterfly', () => {
    let s = cloneState(createNewGame({ seed: 'ledger-butterfly' }));
    // Before Anelka's move, the user (Man Utd) signs him first.
    s.clubs.man_utd!.finances.transferBudget = 100_000_000;
    const res = executeTransfer(s, { playerId: 'cur_anelka', toClub: 'man_utd', fee: 22_000_000 });
    expect(res.ok).toBe(true);

    // Advance until the ledger processes the Anelka entry (interrupts like the
    // Dec-1999 Keane event can fragment the way there).
    for (let i = 0; i < 6; i++) {
      if (s.meta.executedLedger.some((k) => k.startsWith('cur_anelka@'))) break;
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      s = advanceWindow(s).state;
    }
    // The real move to Real Madrid could not happen; a butterfly was logged.
    expect(s.players.cur_anelka?.club).not.toBe('real_madrid');
    expect(s.timeline.divergenceLog.some((d) => d.kind === 'butterfly')).toBe(true);
    expect(s.eventLog.some((e) => e.code === 'ledger.fallback' && e.data?.cause === 'user-signed-target')).toBe(true);
  });

  it('each ledger entry resolves only once', () => {
    let s = createNewGame({ seed: 'ledger-once' });
    s = play(s, 30);
    const executed = s.eventLog.filter((e) => e.code === 'ledger.executed');
    const ids = executed.map((e) => e.data?.playerId);
    expect(new Set(ids).size).toBe(ids.length); // no duplicates
  });

  it('a ledger entry TO the user club is offered as a decision, never a rival butterfly', () => {
    // Fellaini → Man Utd (2013) targets the user's own club: it surfaces as a
    // reality-default "real signing" offer the user can decline, and never a
    // fallback/poach bid against the user's squad. Here the user PASSES.
    let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'ledger-userclub' });
    let sawOffer = false;
    for (let i = 0; i < 8; i++) {
      for (const d of [...s.pendingDecisions]) {
        if (d.id.startsWith('real-in:') && d.title.includes('Fellaini')) {
          sawOffer = true;
          s = applyDecision(s, d.id, 'pass').state; // decline — "no Fellaini"
        } else {
          s = applyDecision(s, d.id, d.choices[0]!.id).state;
        }
      }
      s = advanceWindow(s).state;
    }
    expect(sawOffer).toBe(true);
    expect(s.players.cur_fellaini?.club).toBe('everton'); // declined → he stays
    expect(s.eventLog.some((e) => e.code === 'poach.bid' && e.data?.from === 'man_utd')).toBe(false);
  });
});

describe('capitalising on the food chain + clubs in distress', () => {
  it('a much bigger club raids a smaller selling club at a discount (step-up)', () => {
    const a = createNewGame({ scenarioId: 'arsenal-2004', seed: 'foodchain' });
    const year = parseYearMonth(a.clock.date).year;
    const pepe = a.players.cur_pepe04!; // Porto (prestige 76) vs Arsenal (86+)
    const full = valuePlayer(pepe, year);
    const toArsenal = askingPrice(a, 'cur_pepe04', 'arsenal');
    expect(toArsenal).toBeLessThan(full); // motivated seller — the food-chain cut
    expect(acquisitionTags(a, pepe, 'arsenal')).toContain('step-up');
    // A peer/no-buyer pays full — the discount is buyer-specific.
    expect(askingPrice(a, 'cur_pepe04')).toBe(
      Math.max(50_000, Math.round(full / 100_000) * 100_000),
    );
  });

  it('Calciopoli drops Juventus into a raidable fire-sale in 2006', () => {
    let a = createNewGame({ scenarioId: 'arsenal-2004', seed: 'calciopoli' });
    for (let i = 0; i < 30 && parseYearMonth(a.clock.date).year < 2007; i++) {
      for (const d of [...a.pendingDecisions]) a = applyDecision(a, d.id, d.choices[0]!.id).state;
      a = advanceWindow(a).state;
      if (a.board.dismissed) break;
    }
    // The scheduled financial shock has fired: Juve are in crisis, a fire-sale.
    expect(a.clubs.juventus?.financialHealth).toBe('crisis');
    expect(a.eventLog.some((e) => e.code === 'club.distress' && e.data?.clubId === 'juventus')).toBe(true);
    const now = parseYearMonth(a.clock.date).year;
    // A LOYAL icon rides the crisis out — Del Piero, Buffon & co. followed Juve
    // down to Serie B, so the fire-sale can't buy them on the cheap: his loyalty
    // cancels the discount (buyer price ≈ full value, no fire-sale tag).
    const dp = a.players.cur_delpiero04;
    if (dp?.club === 'juventus') {
      const full = Math.max(50_000, Math.round(valuePlayer(dp, now) / 100_000) * 100_000);
      expect(askingPrice(a, 'cur_delpiero04', 'arsenal')).toBeGreaterThanOrEqual(full * 0.98);
      const dpTags = acquisitionTags(a, dp, 'arsenal');
      expect(dpTags).not.toContain('fire-sale');
      expect(dpTags).toContain('one-club-man');
    }
    // But a LOWER-loyalty squad player around them is a genuine bargain — the
    // "gettable but overlooked" pieces a distressed club really does let go.
    const zeb = a.players.cur_zebina04;
    if (zeb?.club === 'juventus') {
      expect(askingPrice(a, 'cur_zebina04', 'arsenal')).toBeLessThan(valuePlayer(zeb, now) * 0.7);
      expect(acquisitionTags(a, zeb, 'arsenal')).toContain('fire-sale');
    }
  });

  it('a user can pick Porto apart in 2002 — Deco/Carvalho cheap before the giants come', () => {
    const s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'porto-raid' });
    const year = parseYearMonth(s.clock.date).year;
    for (const id of ['cur_deco01', 'cur_carvalho01']) {
      const p = s.players[id]!;
      expect(p.club).toBe('porto'); // the jewels are still at Porto in 2001
      const full = valuePlayer(p, year);
      const toLiverpool = askingPrice(s, id, 'liverpool'); // Liverpool 82 vs Porto 72
      expect(toLiverpool).toBeLessThan(full); // motivated feeder club — food-chain cut
      expect(acquisitionTags(s, p, 'liverpool')).toContain('step-up');
      // A peer/no-buyer pays full — the raid discount is buyer-specific.
      expect(askingPrice(s, id)).toBe(Math.max(50_000, Math.round(full / 100_000) * 100_000));
    }
  });

  it('leave Porto alone and the giants raid it in 2004 (Deco → Barça, as in reality)', () => {
    let s = createNewGame({ scenarioId: 'liverpool-2001', seed: 'porto-passive' });
    // Passive Liverpool career through the 2004 sell-off window (interrupt
    // windows can fragment the way there, so allow plenty of steps).
    for (let i = 0; i < 20 && parseYearMonth(s.clock.date).year < 2005; i++) {
      for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      s = advanceWindow(s).state;
      if (s.board.dismissed) break;
    }
    // Deco's move is ungated — Barcelona took him regardless of Abramovich.
    expect(s.players.cur_deco01?.club).toBe('barcelona');
    // Carvalho/Ferreira needed Chelsea's new money: only if the takeover completed.
    if (s.meta.realizedLedger.includes('abramovich')) {
      expect(s.players.cur_carvalho01?.club).toBe('chelsea');
    }
  });
});

describe('near-miss ledger — "almost happened" deals', () => {
  it('offers the user the counterfactual signing, and completing it diverges', () => {
    // Moyes-2013: United really bid twice for Fàbregas and bottled it. The user
    // is offered the deal reality never closed; taking it brings Cesc to United.
    let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'nm-sign' });
    let signed = false;
    for (let i = 0; i < 6 && !signed; i++) {
      for (const d of [...s.pendingDecisions]) {
        if (d.id.startsWith('near-miss-in:') && d.title.includes('Fàbregas')) {
          signed = true;
          s = applyDecision(s, d.id, 'sign').state;
        } else {
          s = applyDecision(s, d.id, d.choices[0]!.id).state;
        }
      }
      if (!signed) s = advanceWindow(s).state;
    }
    expect(signed).toBe(true);
    expect(s.players.cur_cesc?.club).toBe('man_utd'); // the deal reality bottled
  });

  it('passing a near-miss sends the player to his real destination (reality)', () => {
    // Inter chased Batistuta; Roma really got him in 2000. Pass, and reality holds
    // — he moves to Roma exactly as he did.
    let s = createNewGame({ scenarioId: 'inter-1998', seed: 'nm-pass' });
    let resolved = false;
    for (let i = 0; i < 10 && !resolved; i++) {
      for (const d of [...s.pendingDecisions]) {
        if (d.id.startsWith('near-miss-in:') && d.title.includes('Batistuta')) {
          resolved = true;
          s = applyDecision(s, d.id, 'pass').state;
        } else {
          s = applyDecision(s, d.id, d.choices[0]!.id).state;
        }
      }
      if (!resolved) s = advanceWindow(s).state;
    }
    expect(resolved).toBe(true);
    expect(s.players.cur_batistuta?.club).toBe('roma'); // reality holds on a pass
  });

  it('ignoring near-misses preserves reality — the deals collapse as they did', () => {
    // Answer everything EXCEPT the near-misses; leaving them pending = ignore, and
    // Fàbregas/Baines stay exactly where they really did.
    let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'nm-ignore' });
    for (let i = 0; i < 6; i++) {
      for (const d of [...s.pendingDecisions]) {
        if (!d.id.startsWith('near-miss')) s = applyDecision(s, d.id, d.choices[0]!.id).state;
      }
      s = advanceWindow(s).state;
    }
    expect(s.players.cur_cesc?.club).toBe('barcelona'); // stayed, as in reality
    expect(s.players.cur_baines?.club).toBe('everton'); // stayed, as in reality
    // Each near-miss was presented at most once.
    const processed = s.meta.processedNearMisses ?? [];
    expect(new Set(processed).size).toBe(processed.length);
    expect(processed.some((k) => k.startsWith('cur_cesc@'))).toBe(true);
  });

  it('curates the new fragile-and-lost talents with a latent ceiling', () => {
    const utd = createNewGame({ scenarioId: 'man-utd-2013', seed: 'lt-jones' });
    expect(utd.players.cur_jones?.latentCeiling).toBe(89); // Phil Jones
    const inter = createNewGame({ scenarioId: 'inter-1998', seed: 'lt-ventola' });
    expect(inter.players.cur_ventola?.latentCeiling).toBe(87); // Nicola Ventola
  });
});

describe('host-club curation — real squads + landed lost talents', () => {
  it('era-2004 curates Barça/Madrid/Milan and lands Robinho, Bojan, Pato', () => {
    let a = createNewGame({ scenarioId: 'arsenal-2004', seed: 'hosts-04' });
    // Real squads now exist at the European context clubs.
    expect(a.players.cur_ronaldinho04?.club).toBe('barcelona');
    expect(a.players.cur_zidane04?.club).toBe('real_madrid');
    expect(a.players.cur_pirlo04?.club).toBe('milan');
    // Robinho is a lost talent available from the start; Woodgate a fragile one.
    expect(a.players.cur_robinho04?.latentCeiling).toBe(90);
    expect(a.players.cur_woodgate04?.latentCeiling).toBe(86);
    // Bojan (2007) and Pato (2008) arrive mid-era as breakthrough graduates.
    // Their latent ceiling fades a little each season they aren't unlocked, so
    // snapshot each the season he appears rather than asserting a fixed value.
    let bojanLatent: number | undefined;
    let patoLatent: number | undefined;
    for (let i = 0; i < 40 && !(bojanLatent && patoLatent); i++) {
      a = advanceWindow(a).state;
      bojanLatent ??= a.players.cur_bojan04?.latentCeiling;
      patoLatent ??= a.players.cur_pato04?.latentCeiling;
      if (a.board.dismissed) break;
    }
    expect(bojanLatent).toBe(89); // La Masia prodigy, on arrival
    expect(patoLatent).toBe(92); // O Pato, on arrival
  });

  it('era-2013 curates AC Milan and lands Balotelli', () => {
    const b = createNewGame({ scenarioId: 'man-utd-2013', seed: 'hosts-13' });
    expect(b.players.cur_montolivo13?.club).toBe('milan');
    expect(b.players.cur_balotelli13?.latentCeiling).toBe(94);
    expect(b.players.cur_elshaarawy13?.latentCeiling).toBe(88);
  });

  it('the La Liga worlds curate Real Betis and land Denílson', () => {
    const c = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'hosts-99' });
    expect(c.players.cur_alfonso99?.club).toBe('betis');
    expect(c.players.cur_denilson99?.latentCeiling).toBe(89);
  });

  it('era-2004 European context clubs now carry full real squads', () => {
    const a = createNewGame({ scenarioId: 'arsenal-2004', seed: 'ctx-04' });
    const curatedAt = (club: string) =>
      (a.clubs[club]?.squad ?? []).map((id) => a.players[id]).filter((p) => p?.curated).length;
    // Juventus was fully procedural before; Bayern/Porto/Valencia/Lyon/Monaco stubs.
    expect(curatedAt('juventus')).toBeGreaterThanOrEqual(14);
    expect(curatedAt('bayern')).toBeGreaterThanOrEqual(14);
    expect(curatedAt('porto')).toBeGreaterThanOrEqual(14);
    expect(curatedAt('lyon')).toBeGreaterThanOrEqual(14);
    expect(a.players.cur_buffon04?.club).toBe('juventus');
    expect(a.players.cur_saviola04?.latentCeiling).toBe(88); // a new lost talent
  });

  it('the 1999 La Liga adds Valencia and Deportivo with their lost talents', () => {
    const c = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'ctx-99' });
    expect(c.players.cur_mendieta99?.club).toBe('valencia');
    expect(c.players.cur_valeron99?.latentCeiling).toBe(90); // injury-lost talent
    expect(c.players.cur_djalminha99?.latentCeiling).toBe(90); // temperament-lost talent
  });

  it('the 2009 Bayern world is a real 18-team Bundesliga with European context', () => {
    const b = createNewGame({ scenarioId: 'bayern-2009', seed: 'era-09' });
    // 18-team Bundesliga (not the 20-team default).
    const league = b.leagues[b.clubs.bayern!.leagueId!]!;
    expect(league.clubIds.length).toBe(18);
    // Van Gaal's Bayern + curated rivals + the CR7/Kaká galácticos as context.
    expect(b.players.cur_muller09?.club).toBe('bayern');
    expect(b.players.cur_ronaldo09?.club).toBe('real_madrid');
    const curatedAt = (club: string) =>
      (b.clubs[club]?.squad ?? []).map((id) => b.players[id]).filter((p) => p?.curated).length;
    for (const club of ['bayern', 'dortmund', 'schalke', 'leverkusen', 'wolfsburg']) {
      expect(curatedAt(club)).toBeGreaterThanOrEqual(14);
    }
    // Lost talents from the era: Şahin (injury) and Kaká (fragile at Madrid).
    expect(b.players.cur_sahin09?.latentCeiling).toBe(88);
    expect(b.players.cur_kaka09?.latentCeiling).toBe(90);
  });

  it('the 2013 European context clubs are now deep real squads', () => {
    const m = createNewGame({ scenarioId: 'man-utd-2013', seed: 'ctx-13' });
    const curatedAt = (club: string) =>
      (m.clubs[club]?.squad ?? []).map((id) => m.players[id]).filter((p) => p?.curated).length;
    for (const club of ['juventus', 'psg', 'roma', 'benfica', 'valencia']) {
      expect(curatedAt(club)).toBeGreaterThanOrEqual(13);
    }
    // Real players at their real 2013-14 clubs, and a couple of the era's lost talents.
    expect(m.players.cur_pjanic13?.club).toBe('roma');
    expect(m.players.cur_pastore13?.latentCeiling).toBe(89);
    expect(m.players.cur_markovic13?.latentCeiling).toBe(88);
    // Daley Blind is seeded at Ajax for his real move to United (a user decision).
    expect(m.players.cur_blind13?.club).toBe('ajax');
  });
});

describe('more start points (§4 data)', () => {
  it('the galáctico Madrid start places Figo/Zidane/Makélélé and can keep Makélélé', () => {
    let s = createNewGame({ scenarioId: 'real-madrid-2000', seed: 'gal' });
    expect(s.playerClub).toBe('real_madrid');
    expect(resolvePlayer(s, 'Figo')?.club).toBe('barcelona'); // his real move is TO the user
    expect(s.players.cur_makelele?.club).toBe('real_madrid');
    // Keep Makélélé when his 2003 sale is offered; he stays, unsettled.
    for (let i = 0; i < 12; i++) {
      for (const d of [...s.pendingDecisions]) {
        const keep = d.id.startsWith('real-out:') && d.title.includes('Makélélé');
        s = applyDecision(s, d.id, keep ? 'keep' : d.choices[0]!.id).state;
      }
      s = advanceWindow(s).state;
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; }
      if (Number(s.clock.date.slice(0, 4)) >= 2004) break;
    }
    expect(s.players.cur_makelele?.club).toBe('real_madrid'); // kept, not sold to Chelsea
  });

  it('the Invincibles Arsenal start builds a real 2004-05 league and squad', () => {
    const s = createNewGame({ scenarioId: 'arsenal-2004', seed: 'inv' });
    expect(s.playerClub).toBe('arsenal');
    expect(resolvePlayer(s, 'Henry')?.club).toBe('arsenal');
    // Drogba starts at his real source club and joins Chelsea via the ledger.
    expect(resolvePlayer(s, 'Drogba')?.club).toBe('marseille');
    expect(s.leagues['eng-2004']?.clubIds).toContain('arsenal');
  });

  it('intercepting a Chelsea target makes Chelsea sign a real alternative, not get gutted', () => {
    // Ronaldo (a distant 2009 subject) must NEVER be hijacked to replace Drogba;
    // and across seeds Chelsea signs a genuine comparable striker.
    let sawAlternative = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      let s = cloneState(createNewGame({ scenarioId: 'arsenal-2004', seed: `intercept:${attempt}` }));
      s.clubs.arsenal!.finances.transferBudget = 40_000_000;
      const drogba = resolvePlayer(s, 'Drogba')!;
      expect(executeTransfer(s, { playerId: drogba.id, toClub: 'arsenal', fee: 24_000_000 }).ok).toBe(true);
      for (let i = 0; i < 3; i++) {
        for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
        s = advanceWindow(s).state;
      }
      expect(resolvePlayer(s, 'Cristiano Ronaldo')?.club).toBe('man_utd'); // never hijacked
      const alt = s.eventLog.find((e) => e.code === 'ledger.alternative' && e.data?.to === 'chelsea');
      if (alt) {
        sawAlternative = true;
        const altPlayer = s.players[String(alt.data!.playerId)]!;
        expect(altPlayer.curated).toBe(true); // a real, named alternative (not procedural)
        expect(altPlayer.name).not.toBe('Cristiano Ronaldo'); // never the distant marquee
      }
    }
    expect(sawAlternative).toBe(true);
  });
});

describe('2013 post-Ferguson era pack (§4 data)', () => {
  it('places the four plan targets at their real clubs', () => {
    const s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'era2013' });
    expect(s.players.cur_bale?.club).toBe('spurs');
    expect(s.players.cur_thiago?.club).toBe('barcelona');
    expect(s.players.cur_baines?.club).toBe('everton');
    expect(s.players.cur_garay?.club).toBe('benfica');
  });

  it('passively reproduces the real 2013 knock-on transfers', () => {
    let s = createNewGame({ scenarioId: 'man-utd-2013', seed: 'era2013-passive' });
    s = play(s, 6);
    expect(s.players.cur_bale?.club).toBe('real_madrid');
    expect(s.players.cur_thiago?.club).toBe('bayern');
    expect(s.players.cur_ozil?.club).toBe('arsenal');
    expect(s.players.cur_lamela?.club).toBe('spurs');
  });

  it('keeping Ronaldo cancels the sales it funded — Madrid keep Robben & Sneijder', () => {
    // A 1999 playthrough that signs Ronaldo (2003) and REFUSES his 2009 sale.
    let s = createNewGame({ scenarioId: 'man-utd-1999', seed: 'keep-cr7' });
    for (let i = 0; i < 40; i++) {
      for (const d of [...s.pendingDecisions]) {
        const keep = d.id.startsWith('real-out:') && d.title.includes('Ronaldo');
        s = applyDecision(s, d.id, keep ? 'keep' : d.choices[0]!.id).state;
      }
      s = advanceWindow(s).state;
      if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; }
      if (Number(s.clock.date.slice(0, 4)) >= 2010) break;
    }
    expect(s.players.cur_cristiano?.club).toBe('man_utd'); // kept
    expect(s.players.cur_cristiano!.agitation).toBeGreaterThan(0); // he wanted the move
    // Madrid never funded a Ronaldo window, so they never offloaded these two.
    expect(s.players.cur_robben?.club).toBe('real_madrid');
    expect(s.players.cur_sneijder?.club).toBe('real_madrid');
    expect(s.eventLog.some((e) => e.code === 'ledger.cancelled' && e.data?.playerId === 'cur_sneijder')).toBe(true);
  });

  it('a deprived club can hijack a future ledger subject, nullifying his onward move but not his growth', () => {
    // Sign Sol Campbell (Bosman) before his real move to Arsenal. Arsenal, denied
    // him, may hijack Leeds' Ferdinand — who then never joins United, but must
    // still develop toward his ceiling at his new club.
    for (let attempt = 0; attempt < 12; attempt++) {
      let s = cloneState(createNewGame({ scenarioId: 'man-utd-1999', seed: `hijack:${attempt}` }));
      s.clubs.man_utd!.finances.transferBudget = 60_000_000;
      const campbell = resolvePlayer(s, 'Sol Campbell')!;
      executeTransfer(s, { playerId: campbell.id, toClub: 'man_utd', fee: 0 });
      for (let i = 0; i < 20; i++) {
        for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
        s = advanceWindow(s).state;
        if (s.board.dismissed) { s.board.dismissed = false; s.board.patience = 30; }
      }
      const fer = s.players.cur_ferdinand!;
      if (fer.club === 'arsenal') {
        // His onward move to United was consumed, and his pathway wasn't blocked:
        // he held/advanced on his starting ability (82) and kept a high ceiling
        // rather than eroding on the bench behind a fading veteran.
        expect(s.timeline.divergenceLog.some((d) => /Ferdinand.*never happens/.test(d.detail))).toBe(true);
        expect(fer.ability).toBeGreaterThanOrEqual(82);
        expect(fer.potentialCeiling).toBeGreaterThanOrEqual(86);
        return;
      }
    }
    throw new Error('no Ferdinand hijack across 12 seeds');
  });

  it('buying Bale cancels the sale it funded — Madrid keep Özil (causal chain)', () => {
    let s = cloneState(createNewGame({ scenarioId: 'man-utd-2013', seed: 'era2013-bale' }));
    s.clubs.man_utd!.finances.transferBudget = 200_000_000;
    const res = executeTransfer(s, { playerId: 'cur_bale', toClub: 'man_utd', fee: 85_000_000 });
    expect(res.ok).toBe(true);
    s = play(s, 6);
    // Bale never reached Madrid, so the Özil sale it funded is cancelled — he
    // stays at Real Madrid rather than a like-for-like replacing him at Arsenal.
    expect(s.players.cur_bale?.club).toBe('man_utd');
    expect(s.players.cur_ozil?.club).toBe('real_madrid');
    expect(s.eventLog.some((e) => e.code === 'ledger.cancelled' && e.data?.playerId === 'cur_ozil')).toBe(true);
    // But Spurs still bank a huge fee (from you) and still rebuild.
    expect(s.players.cur_lamela?.club).toBe('spurs');
  });
});
