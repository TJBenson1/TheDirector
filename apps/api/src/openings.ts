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

import { coachBriefing, getScenario, clubSquadPlayers, realInboundThisWindow, realDepartureThisWindow, type GameState, type ScenarioOpening } from '@director/engine';

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

export interface OpeningChip {
  /** The button caption (short — a surname, a call). */
  label: string;
  /** The message sent to the narrator when the chip is tapped. */
  message: string;
}

export interface OpeningBeat {
  /** The prose for this beat. */
  text: string;
  /** If set, a "continue" chip with this caption reveals the NEXT beat —
   *  client-side, no model call (the free "meet the manager" step the Director
   *  taps through, so the summer arrives one message at a time). */
  reveal?: string;
  /** The summer's live decisions as tappable prompts — each opens the
   *  conversation with the narrator. Present on the final beat. */
  actions?: OpeningChip[];
}

export interface Opening {
  /** Beat-one prose (the scene) — kept for the typed-narrator opening path. */
  scene: string;
  /** The head coach's first-meeting briefing — kept for the narrator path. */
  meeting: string;
  /** The staged, interactive opening: prose beats the Director taps through one
   *  at a time, ending on the summer's live calls as tappable prompts. This is
   *  what makes the opening feel lived-through rather than read at. */
  beats: OpeningBeat[];
}

/** Surname for a compact chip caption ("Luís Figo" → "Figo"). */
function surname(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

/**
 * The summer's live opening-window calls, as tappable prompts that open the
 * conversation with the narrator: the marquee signing to bless (or walk from),
 * the choice between the other arrivals, the departing man to fight for, and the
 * door to the wider market. Derived from the live ledger, so every scenario
 * surfaces its own real decisions — Figo/Makélélé/Flávio for Madrid 2000, and
 * so on — with no per-scenario authoring.
 */
function openingActions(state: GameState): OpeningChip[] {
  const inbound = realInboundThisWindow(state); // biggest fee first
  const out = [...realDepartureThisWindow(state)].sort((a, b) => b.fee - a.fee); // biggest exit first

  // A prioritised list: the marquee arrival, the biggest exit to fight for, and
  // the choice between the other arrivals. "Review the market" is always appended,
  // so it survives the cap even when the summer is busy.
  const ranked: OpeningChip[] = [];

  if (inbound[0]) {
    const m = inbound[0];
    ranked.push({
      label: `Bless the ${surname(m.name)} signing?`,
      message: `Give my blessing to the ${m.name} signing — ${fee(m.fee)} from ${m.fromClub} — or should I walk away? Talk me through it.`,
    });
  }
  if (out[0]) {
    ranked.push({
      label: `Fight to keep ${surname(out[0].name)}?`,
      message: `Do I fight to keep ${out[0].name}, or let the sale go through? Talk me through it.`,
    });
  }
  const rest = inbound.slice(1, 3);
  if (rest.length === 2) {
    ranked.push({
      label: `${surname(rest[0]!.name)} or ${surname(rest[1]!.name)} — or both?`,
      message: `${rest[0]!.name} or ${rest[1]!.name} this summer — or both? Talk me through them and what each would cost.`,
    });
  } else if (rest.length === 1) {
    ranked.push({
      label: `Back the ${surname(rest[0]!.name)} deal?`,
      message: `Should I back the ${rest[0]!.name} signing? Talk me through it.`,
    });
  }
  // A second exit, if the summer has one and there's still room.
  if (out[1]) {
    ranked.push({
      label: `Fight to keep ${surname(out[1].name)}?`,
      message: `And ${out[1].name} — do I fight to keep him too, or let him go? Talk me through it.`,
    });
  }

  return [
    ...ranked.slice(0, 3),
    { label: 'Review the wider market', message: 'Show me the wider market — who else could we go for this summer?' },
  ];
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
    ? `Word is there's already a deal on the table: ${marquee.name}, ${fee(marquee.fee)} from ${marquee.fromClub}. It's yours to push through or to walk away from.`
    : '';

  // ── Beat one: the chair and the brief — short, so it lands rather than reads
  // as a wall. The Director taps through from here. ──
  const opener = [
    `${club.name}, ${seasonLabel}. You've taken the Director's chair — the boardroom power above the manager. The board's brief is not complicated: ${sc.mandate}`,
    marqueeLine,
  ].filter((p) => p && p.length).join('\n\n');

  // ── Beat two: the summer's story (the authored history of that window). ──
  const backstory = o.briefing;

  // ── Beat three: the manager meeting — his real shape, his real XI, the fringe,
  // and where he wants the side strengthened. The named deals become tappable
  // decisions below (openingActions), so the prose ends on the hook, not a list. ──
  const meetingParts: string[] = [
    `You take your seat opposite ${o.coach}. He'll set up in a ${o.formation}, and he names the side he trusts: ${renderXI(o.firstEleven)}`,
  ];
  if (o.fringe && o.fringe.length) {
    meetingParts.push(
      `But the squad isn't settled, and the real decisions live around the edges:\n${o.fringe.map((f) => `• ${f}`).join('\n')}`,
    );
  }
  const brief = coachBriefing(state);
  const spots = [...new Set(brief.strengthen.map((s) => POSITION_LABEL[s.position] ?? s.position))];
  if (spots.length) {
    meetingParts.push(`Pressed on where the side needs work, ${o.coach} doesn't hedge: he wants it strengthened at ${joinNames(spots)}.`);
  }
  const meetingBeat = [...meetingParts, `The window is open, and the summer's first calls are already on your desk.`].join('\n\n');

  const beats: OpeningBeat[] = [
    { text: opener, reveal: `What's the story this summer?` },
    { text: backstory, reveal: `Meet ${o.coach}` },
    { text: meetingBeat, actions: openingActions(state) },
  ];

  // Back-compat prose for the typed-narrator opening path (no chip UI there):
  // scene = the first two beats, meeting = the manager meeting.
  const scene = [opener, backstory, `${o.coach} is here for your first meeting.`].join('\n\n');
  const meeting = [...meetingParts, `The transfer window is open and the squad is yours to shape. Where do you want to start?`].join('\n\n');

  return { scene, meeting, beats };
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

  const meeting = meetingParts.join('\n\n');
  const beats: OpeningBeat[] = [
    { text: scene, reveal: `Meet ${b.coach}` },
    { text: meeting, actions: openingActions(state) },
  ];
  return { scene, meeting, beats };
}
