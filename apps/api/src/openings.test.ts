/**
 * Regression guard for the GENERATED set-pieces — the summer and winter openings
 * the Advance feed renders each year. These are pure-prose over engine facts (no
 * model call), and they are where the "form of his life / struggling on the
 * fringes" and "who carried your season" beats live. The winter form beat once
 * read a club-tier `player.form` field that stays 0 mid-season, so it silently
 * never fired; this test pins the live behaviour so that class of regression
 * fails loudly.
 */
import { describe, it, expect } from 'vitest';
import {
  createNewGame,
  advanceWindow,
  applyDecision,
  midSeasonForm,
  standingsOrder,
  currentYear,
  realInboundThisWindow,
  realDepartureThisWindow,
  SCENARIOS,
  getScenario,
  type GameState,
} from '@director/engine';
import { generatedSummerOpening, generatedWinterOpening, scriptedOpening } from './openings.js';

/** Advance passively to the first January at which the season is underway. */
function toFirstWinter(scenarioId: string): GameState {
  let s = createNewGame({ scenarioId, seed: 'narr-test' });
  for (let i = 0; i < 24; i++) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    s = advanceWindow(s).state;
    if (s.clock.date.slice(5, 7) === '01' && midSeasonForm(s).underway) return s;
  }
  throw new Error(`no winter reached for ${scenarioId}`);
}

/** Advance passively into a later season's summer window (season 2+). */
function toNextSummer(scenarioId: string): GameState {
  let s = createNewGame({ scenarioId, seed: 'narr-test' });
  const startYr = Number(s.clock.date.slice(0, 4));
  for (let i = 0; i < 26; i++) {
    for (const d of [...s.pendingDecisions]) s = applyDecision(s, d.id, d.choices[0]!.id).state;
    s = advanceWindow(s).state;
    if (Number(s.clock.date.slice(0, 4)) > startYr && s.clock.date.slice(5, 7) >= '06') return s;
  }
  throw new Error(`no summer reached for ${scenarioId}`);
}

const allText = (beats: { text: string }[]) => beats.map((b) => b.text).join('\n');

describe('generated winter set-piece', () => {
  it('names the title race and a live form story from midSeasonForm (not the dead form field)', () => {
    const s = toFirstWinter('juventus-1995');
    const winter = generatedWinterOpening(s);
    expect(winter).not.toBeNull();
    const text = allText(winter!.beats);
    // The title-race line is always present once a season is underway.
    expect(text).toMatch(/top of the table|behind leaders|level (on points|with)/i);
    // A live form story must surface — a flying man or a struggler/adapting story.
    // These phrases come straight from midSeasonForm()'s authored notes.
    expect(text).toMatch(/on fire|off the pace|still adapting|barely featuring|below his level|squad man/i);
  });

  it('is deterministic and renders for several eras without empty beats', () => {
    for (const id of ['juventus-1995', 'inter-2004', 'barcelona-2003', 'dortmund-2012']) {
      const winter = generatedWinterOpening(toFirstWinter(id));
      expect(winter, id).not.toBeNull();
      expect(winter!.beats.length, id).toBeGreaterThan(0);
      for (const b of winter!.beats) expect(b.text.length, `${id} beat`).toBeGreaterThan(20);
    }
  });
});

describe('curated opening tense/sequencing (§ narration)', () => {
  // The live opening window rewinds this summer's real moves and offers them as
  // decisions, so the opening PROSE must not narrate one of those movers as done.
  // The fringe list must therefore drop any pending mover — an arrival still to be
  // signed, or a departure still to be fought over — because each is surfaced as a
  // tappable decision instead (Figo "on the table", Redondo "fight to keep").
  for (const sc of Object.values(SCENARIOS)) {
    if (!getScenario(sc.id).opening) continue;
    it(`"${sc.id}" opening never lists a live mover in the fringe`, () => {
      const s = createNewGame({ scenarioId: sc.id, seed: 'tense' });
      const movers = new Set<string>([
        ...realInboundThisWindow(s).map((m) => m.name),
        ...realDepartureThisWindow(s).map((m) => m.name),
      ]);
      const opening = scriptedOpening(s);
      const fringeBullets = allText(opening.beats)
        .split('\n')
        .filter((l) => l.trimStart().startsWith('•'))
        .map((l) => l.replace(/^\s*•\s*/, ''));
      for (const bullet of fringeBullets) {
        for (const name of movers) {
          // A bullet whose subject IS a live mover (it leads with his name) must not
          // appear — he lives in the tappable decisions, not the past-tense fringe.
          expect(bullet.startsWith(name), `${sc.id}: fringe narrates live mover "${name}": ${bullet}`).toBe(false);
        }
      }
    });
  }
});

describe('generated summer set-piece', () => {
  it('tells your own season story — the standout who carried the side', () => {
    const s = toNextSummer('juventus-1995');
    const lg = s.leagues[s.clubs[s.playerClub]!.leagueId!]!;
    const finish = standingsOrder(lg).indexOf(s.playerClub) + 1;
    const review = {
      finish: finish || 6,
      expected: 3,
      points: lg.standings[s.playerClub]?.points ?? 60,
      wonTitle: finish === 1,
      patience: 60,
      season: currentYear(s) - 1,
    };
    const summer = generatedSummerOpening(s, { review });
    const text = allText(summer.beats);
    expect(text).toMatch(/carried the side/i);
  });
});
