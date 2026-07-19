/**
 * Pre-scripted game openings.
 *
 * The opening turn — set the scene, then sit the Director down with his head
 * coach — is the heaviest of the whole game (several tool calls plus a long
 * two-part narration). Generating it live on every new game is slow and burns
 * credits for what is essentially the same beat each time a scenario is picked.
 *
 * So we script it: assemble a rich, authored opening from the deterministic
 * engine facts (the scenario, the coach's briefing, the squad) with no model call
 * at all. It reads like a proper opening, lands instantly, costs nothing, and — by
 * removing the model's heaviest turn — lets even a slower narrator model be used
 * for the in-game conversation without the game failing to start.
 */

import { coachBriefing, getScenario, type GameState } from '@director/engine';

type Group = 'GK' | 'DEF' | 'MID' | 'ATT';
const GROUP: Record<string, Group> = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', DM: 'MID', CM: 'MID', AM: 'ATT', LW: 'ATT', RW: 'ATT', ST: 'ATT',
};

const POSITION_LABEL: Record<string, string> = {
  GK: 'goalkeeper', CB: 'centre-back', LB: 'left-back', RB: 'right-back', DM: 'holding midfield',
  CM: 'central midfield', AM: 'attacking midfield', LW: 'left wing', RW: 'right wing', ST: 'up front',
};

function joinNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0]!;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Build the opening narration for a freshly-created game — pure prose over the
 *  engine facts, no model call. */
export function scriptedOpening(state: GameState): string {
  const b = coachBriefing(state);
  const sc = getScenario(state.meta.scenarioId);
  const club = state.clubs[state.playerClub]!;
  const season = Number(state.clock.date.slice(0, 4));
  const seasonLabel = `${season}–${String((season + 1) % 100).padStart(2, '0')}`;

  // The XI, grouped into a readable shape.
  const byGroup: Record<Group, string[]> = { GK: [], DEF: [], MID: [], ATT: [] };
  for (const x of b.bestXI) byGroup[GROUP[x.slot] ?? 'MID'].push(x.name);
  const keeper = byGroup.GK[0] ?? 'the keeper';
  const shapeLine =
    `${keeper} behind a back line of ${joinNames(byGroup.DEF)}; ` +
    `${joinNames(byGroup.MID)} through the middle; ` +
    `${joinNames(byGroup.ATT)} to make it count.`;

  const parts: string[] = [];

  // 1. The seat.
  parts.push(
    `${club.name}, ${seasonLabel}. You have the Director's chair now — the power above the manager — and the board's brief is not complicated: ${sc.mandate}`,
  );

  // 2. The manager meeting — his mood and his plan.
  parts.push(
    `Your first act is to sit down with ${b.coach}. He's ${b.mood}. Ask him where the season is won and he's clear: his priority is ${b.priority}. ` +
      `He wants to play a ${b.formation}, and he already knows his best eleven — ${shapeLine}`,
  );

  // 3. What he'd change.
  const concerns: string[] = [];
  if (b.notKeenOn.length) {
    concerns.push(`he isn't fully sold on ${joinNames(b.notKeenOn.map((n) => n.name))}`);
  }
  if (b.strengthen.length) {
    const spots = [...new Set(b.strengthen.map((s) => POSITION_LABEL[s.position] ?? s.position))];
    concerns.push(`he wants the squad strengthened at ${joinNames(spots)}`);
  }
  if (concerns.length) {
    parts.push(`Pressed on where it can be better, ${b.coach} doesn't hedge: ${joinNames(concerns)}.`);
  }

  // 4. Concrete names he's floated.
  if (b.targets.length) {
    const named = b.targets.map((t) => `${t.name} (${t.club})`);
    parts.push(`He's even put a couple of names in front of you: ${joinNames(named)} — the sort who'd move the needle.`);
  }

  // 5. Hand over the first move.
  parts.push(
    `The transfer window is open and the squad is yours to shape. Renew the men worth keeping, back the coach or overrule him, chase a marquee signing, or simply take stock. Where do you want to start?`,
  );

  return parts.join('\n\n');
}
