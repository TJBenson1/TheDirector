/**
 * Pre-scripted game openings.
 *
 * The opening — set the scene, then sit the Director down with his head coach — is
 * the heaviest turn of the whole game. Generating it live on every new game is slow
 * and burns credits for what is essentially the same beat each time a scenario is
 * picked. So we script it: assemble rich, authored prose from the deterministic
 * engine facts with no model call at all.
 *
 * It comes in TWO beats, so the Director isn't met with a wall of text: first the
 * SCENE (the club, the season, the brief) closing on "the manager's here for your
 * first meeting"; then, as a secondary reply, the MANAGER MEETING itself.
 *
 * Where a scenario carries a curated `ScenarioOpening` (data/openings.ts — the real
 * head coach, his genuine first-choice XI, the men on the fringe with real reasons,
 * and 2–4 sentences of authored history), we render THAT: the true story of that
 * summer, not a "best XI" derived from raw ability. Scenarios without one fall back
 * to the generic derivation.
 */

import { coachBriefing, getScenario, clubSquadPlayers, realInboundThisWindow, type GameState, type ScenarioOpening } from '@director/engine';

type Group = 'GK' | 'DEF' | 'MID' | 'ATT';
const GROUP: Record<string, Group> = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', DM: 'MID', CM: 'MID', AM: 'ATT', LW: 'ATT', RW: 'ATT', ST: 'ATT',
};

// A readable superset of the engine positions used by curated first-XI display
// strings (LWB/RWB/RM/LM/CF/SS/…). Maps each to the unit it belongs to.
const UNIT: Record<string, Group> = {
  GK: 'GK',
  RB: 'DEF', LB: 'DEF', CB: 'DEF', RWB: 'DEF', LWB: 'DEF', WB: 'DEF', SW: 'DEF',
  DM: 'MID', CDM: 'MID', CM: 'MID', RM: 'MID', LM: 'MID', WM: 'MID',
  AM: 'ATT', CAM: 'ATT', RW: 'ATT', LW: 'ATT', ST: 'ATT', CF: 'ATT', SS: 'ATT', RF: 'ATT', LF: 'ATT',
};

const POSITION_LABEL: Record<string, string> = {
  GK: 'goalkeeper', CB: 'centre-back', LB: 'left-back', RB: 'right-back', DM: 'holding midfield',
  CM: 'central midfield', AM: 'attacking midfield', LW: 'left wing', RW: 'right wing', ST: 'up front',
};

/** A transfer fee in the game's shorthand: £37m, £3.5m, or "a free". */
function fee(pounds: number): string {
  if (pounds <= 0) return 'a free transfer';
  const m = pounds / 1_000_000;
  if (m >= 10) return `£${Math.round(m)}m`;
  return `£${(Math.round(m * 10) / 10).toString()}m`;
}

function joinNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0]!;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export interface Opening {
  /** Beat one: the context-setting scene, closing on the meeting hook. */
  scene: string;
  /** Beat two: the head coach's first-meeting briefing (a secondary reply). */
  meeting: string;
}

/** Render a curated first XI ("GK Peruzzi", "CB Ferrara", …) as prose by unit. */
function renderXI(firstEleven: string[]): string {
  const byUnit: Record<Group, string[]> = { GK: [], DEF: [], MID: [], ATT: [] };
  for (const entry of firstEleven) {
    const sp = entry.indexOf(' ');
    const pos = sp === -1 ? '' : entry.slice(0, sp).toUpperCase();
    const name = sp === -1 ? entry : entry.slice(sp + 1);
    byUnit[UNIT[pos] ?? 'MID'].push(name);
  }
  const keeper = byUnit.GK[0] ?? 'the keeper';
  const parts: string[] = [];
  if (byUnit.DEF.length) parts.push(`a back line of ${joinNames(byUnit.DEF)}`);
  if (byUnit.MID.length) parts.push(`${joinNames(byUnit.MID)} in midfield`);
  if (byUnit.ATT.length) parts.push(`${joinNames(byUnit.ATT)} to lead the line`);
  return `${keeper} in goal, ${parts.join(', ')}.`;
}

/** The rich, historically-grounded opening — the true story of this exact summer. */
function curatedOpening(state: GameState, o: ScenarioOpening): Opening {
  const club = state.clubs[state.playerClub]!;
  const season = Number(state.clock.date.slice(0, 4));
  const seasonLabel = `${season}–${String((season + 1) % 100).padStart(2, '0')}`;
  const sc = getScenario(state.meta.scenarioId);

  // The headline real signing already on the table — the deal the club really made
  // on day one. Naming it gives the "push it through or veto it" hook.
  const marquee = realInboundThisWindow(state)[0];
  const marqueeLine = marquee
    ? `There's already a deal on the table: ${marquee.name}, ${fee(marquee.fee)} from ${marquee.fromClub} — the signing history remembers. It's yours to push through or to walk away from.`
    : '';

  // ── Beat one: the scene, carrying the authored history ──
  const scene = [
    `${club.name}, ${seasonLabel}. You've taken the Director's chair — the boardroom power above the manager — and the board's brief is not complicated: ${sc.mandate}`,
    o.briefing,
    marqueeLine,
    `${o.coach} is here for your first meeting.`,
  ].filter((p) => p && p.length).join('\n\n');

  // ── Beat two: the manager meeting — his real shape, his real XI, the fringe ──
  const meetingParts: string[] = [
    `You take your seat opposite ${o.coach}. He'll set up in a ${o.formation}, and he names the side he trusts: ${renderXI(o.firstEleven)}`,
  ];
  if (o.fringe && o.fringe.length) {
    meetingParts.push(
      `But the squad isn't settled, and the real decisions live around the edges:\n${o.fringe.map((f) => `• ${f}`).join('\n')}`,
    );
  }

  // ── The coach's own wish-list: the positions he wants strengthened, and the
  // concrete names he'd move for. Prefer the real deals the club actually chased
  // this summer (the marquee is already named in the scene, so skip it); fall
  // back to the engine's derived targets when the ledger has nothing more. ──
  const brief = coachBriefing(state);
  const spots = [...new Set(brief.strengthen.map((s) => POSITION_LABEL[s.position] ?? s.position))];
  if (spots.length) {
    meetingParts.push(`Pressed on where the side needs work, ${o.coach} doesn't hedge: he wants it strengthened at ${joinNames(spots)}.`);
  }

  const inbound = realInboundThisWindow(state).slice(1); // drop the marquee (already named)
  if (inbound.length) {
    const named = inbound.map((r) => {
      const pos = state.players[r.playerId]?.positions?.[0];
      const posLabel = pos ? POSITION_LABEL[pos] ?? pos.toLowerCase() : '';
      const detail = [posLabel, `${fee(r.fee)} from ${r.fromClub}`].filter((x) => x).join(', ');
      return `${r.name} (${detail})`;
    });
    meetingParts.push(`And he's put names on the table — the men the club really went for that summer: ${joinNames(named)}. Back the moves, redirect the money, or hold your fire.`);
  } else if (brief.targets.length) {
    const named = brief.targets.map((t) => `${t.name} (${t.club})`);
    meetingParts.push(`And he's put a name or two in front of you — the sort who'd move the needle: ${joinNames(named)}.`);
  }

  meetingParts.push(
    `The transfer window is open and the squad is yours to shape. Renew the men worth keeping, back the coach or overrule him, correct the history or let it ride — where do you want to start?`,
  );

  return { scene, meeting: meetingParts.join('\n\n') };
}

/** Build the two-beat opening for a freshly-created game — pure prose over the
 *  engine facts, no model call. Uses the curated historical opening when present. */
export function scriptedOpening(state: GameState): Opening {
  const sc = getScenario(state.meta.scenarioId);
  if (sc.opening) return curatedOpening(state, sc.opening);

  // ── Fallback: the generic derivation (scenarios without a curated opening) ──
  const b = coachBriefing(state);
  const club = state.clubs[state.playerClub]!;
  const season = Number(state.clock.date.slice(0, 4));
  const seasonLabel = `${season}–${String((season + 1) % 100).padStart(2, '0')}`;

  const star = [...clubSquadPlayers(state, state.playerClub)].sort((a, b) => b.ability - a.ability)[0];

  const marquee = realInboundThisWindow(state)[0];
  const marqueeLine = marquee
    ? `And there's already a deal on the table: ${marquee.name}, ${fee(marquee.fee)} from ${marquee.fromClub} — the signing history remembers. It's yours to push through or to walk away from.`
    : '';

  const scene = [
    `${club.name}, ${seasonLabel}. You've taken the Director's chair — the boardroom power above the manager — and the board's brief is not complicated: ${sc.mandate}`,
    `${star ? `It's a squad with ${star.name} at its heart, and it's yours to shape.` : ''}${marqueeLine ? `${star ? ' ' : ''}${marqueeLine}` : ''}`.trim(),
    `${b.coach} is here for your first meeting.`,
  ].filter((p) => p.length).join('\n\n');

  const byGroup: Record<Group, string[]> = { GK: [], DEF: [], MID: [], ATT: [] };
  for (const x of b.bestXI) byGroup[GROUP[x.slot] ?? 'MID'].push(x.name);
  const keeper = byGroup.GK[0] ?? 'the keeper';
  const shapeLine =
    `${keeper} behind a back line of ${joinNames(byGroup.DEF)}; ` +
    `${joinNames(byGroup.MID)} through the middle; ` +
    `${joinNames(byGroup.ATT)} to make it count.`;

  const meetingParts: string[] = [];
  meetingParts.push(
    `You take your seat opposite ${b.coach}. He's ${b.mood}. Ask him where the season is won and he doesn't hesitate: his priority is ${b.priority}. ` +
      `He wants to play a ${b.formation}, and he already has his best eleven in mind — ${shapeLine}`,
  );

  const concerns: string[] = [];
  if (b.notKeenOn.length) concerns.push(`he isn't fully sold on ${joinNames(b.notKeenOn.map((n) => n.name))}`);
  if (b.strengthen.length) {
    const spots = [...new Set(b.strengthen.map((s) => POSITION_LABEL[s.position] ?? s.position))];
    concerns.push(`he wants the squad strengthened at ${joinNames(spots)}`);
  }
  if (concerns.length) meetingParts.push(`Pressed on where it can be better, ${b.coach} doesn't hedge: ${joinNames(concerns)}.`);

  if (b.targets.length) {
    const named = b.targets.map((t) => `${t.name} (${t.club})`);
    meetingParts.push(`He's even put a couple of names in front of you: ${joinNames(named)} — the sort who'd move the needle.`);
  }

  meetingParts.push(
    `The transfer window is open and the squad is yours to shape. Renew the men worth keeping, back the coach or overrule him, chase a marquee signing, or simply take stock. Where do you want to start?`,
  );

  return { scene, meeting: meetingParts.join('\n\n') };
}
