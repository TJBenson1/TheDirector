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
 * first meeting"; then, as a secondary reply, the MANAGER MEETING itself — his
 * mood, his plan, his best XI, his concerns and the names he's floated.
 */

import { coachBriefing, getScenario, clubSquadPlayers, realInboundThisWindow, type GameState } from '@director/engine';

type Group = 'GK' | 'DEF' | 'MID' | 'ATT';
const GROUP: Record<string, Group> = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', DM: 'MID', CM: 'MID', AM: 'ATT', LW: 'ATT', RW: 'ATT', ST: 'ATT',
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

/** Build the two-beat opening for a freshly-created game — pure prose over the
 *  engine facts, no model call. */
export function scriptedOpening(state: GameState): Opening {
  const b = coachBriefing(state);
  const sc = getScenario(state.meta.scenarioId);
  const club = state.clubs[state.playerClub]!;
  const season = Number(state.clock.date.slice(0, 4));
  const seasonLabel = `${season}–${String((season + 1) % 100).padStart(2, '0')}`;

  // The marquee man you've inherited, for a line of colour in the scene.
  const star = [...clubSquadPlayers(state, state.playerClub)].sort((a, b) => b.ability - a.ability)[0];

  // The headline real signing already on the table this window — the deal history
  // says the club made on day one (Figo → Real Madrid, 2000). Naming it gives the
  // opening its "sign the deal Pérez really did, or veto it" hook.
  const marquee = realInboundThisWindow(state)[0];
  const marqueeLine = marquee
    ? `And there's already a deal on the table: ${marquee.name}, ${fee(marquee.fee)} from ${marquee.fromClub} — the signing history remembers. It's yours to push through or to walk away from.`
    : '';

  // ── Beat one: the scene ──
  // A curated scenario supplies authored, historically-accurate context for this
  // exact summer (the state of the club, the mood, the real subplots — e.g. Lippi
  // cashing in Baggio). It carries far more colour than the generic star line, so
  // when it's present we lead with it; otherwise fall back to the inherited-star line.
  const context = b.openingProse
    ? b.openingProse
    : star
      ? `It's a squad with ${star.name} at its heart, and it's yours to shape.`
      : '';
  const scene = [
    `${club.name}, ${seasonLabel}. You've taken the Director's chair — the boardroom power above the manager — and the board's brief is not complicated: ${sc.mandate}`,
    context,
    marqueeLine,
    `${b.coach} is here for your first meeting.`,
  ].filter((p) => p && p.length).join('\n\n');

  // ── Beat two: the manager meeting ──
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
