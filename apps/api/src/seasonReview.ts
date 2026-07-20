/**
 * Scripted end-of-season (and mid-season) commentary — token-free narrative over
 * the deterministic engine facts, shown in the Advance feed.
 *
 * The engine emits a `board.season-review` event at each summer rollover carrying
 * the finish, the board's expectation and the points total; here we turn that into
 * a real review — where you finished, how the board took it, who your top scorer
 * was, and how the European run went — so advancing past a season lands as a story,
 * not a bare "38 rounds played". No model call.
 */

import { clubSquadPlayers, europeanCampaign, midSeasonForm, standingsOrder, type GameState } from '@director/engine';

interface ReviewData {
  finish: number;
  expected: number;
  points: number;
  wonTitle: boolean;
  patience: number;
  season: number;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0]!;
}

/** The club's top league scorer last season, from the settled per-player stats. */
function topScorer(state: GameState): { name: string; goals: number; assists: number } | null {
  let best: { name: string; goals: number; assists: number } | null = null;
  for (const p of clubSquadPlayers(state, state.playerClub)) {
    const g = p.lastSeason?.goals ?? 0;
    if (g > 0 && (!best || g > best.goals)) best = { name: p.name, goals: g, assists: p.lastSeason?.assists ?? 0 };
  }
  return best;
}

/** How the board reads the finish, coloured by patience. */
function boardVerdict(d: ReviewData, club: string): string {
  const exp = d.expected <= 1 ? 'the title' : `a top-${d.expected} finish`;
  if (d.wonTitle) return `The title is back at ${club}. The board are ecstatic — this is exactly what they hired you for.`;
  if (d.finish <= d.expected) return `That meets the board's brief (${exp}), and they'll back you again in the summer.`;
  const miss = d.finish - d.expected;
  if (d.patience < 25) return `The board wanted ${exp}, and falling short has their patience close to breaking — your position is under real threat.`;
  if (miss <= 1) return `The board wanted ${exp}; a near-miss is tolerated, but they'll want to see progress next season.`;
  return `Well short of ${exp} the board demanded — the mood in the boardroom has soured, and questions are being asked.`;
}

/** Build the end-of-season review narrative from the engine's season-review data. */
export function scriptedSeasonReview(state: GameState, data: ReviewData): string {
  const club = state.clubs[state.playerClub]?.name ?? 'the club';
  const seasonLabel = `${data.season}–${String((data.season + 1) % 100).padStart(2, '0')}`;
  const lines: string[] = [];

  lines.push(
    data.wonTitle
      ? `📋 Season review — ${seasonLabel}: CHAMPIONS. ${club} finish top on ${data.points} points.`
      : `📋 Season review — ${seasonLabel}: ${club} finish ${data.finish}${ordinal(data.finish)} on ${data.points} points.`,
  );

  const scorer = topScorer(state);
  if (scorer) lines.push(`Top scorer: ${scorer.name} with ${scorer.goals} league goal${scorer.goals === 1 ? '' : 's'}${scorer.assists ? ` and ${scorer.assists} assist${scorer.assists === 1 ? '' : 's'}` : ''}.`);

  // The European run just concluded (the read layer keeps last season's final).
  try {
    const euro = europeanCampaign(state);
    if (euro.note) lines.push(euro.note);
  } catch {
    /* europe read is best-effort */
  }

  lines.push(boardVerdict(data, club));
  return lines.join('\n\n');
}

/** A lighter mid-season note, shown when the Advance lands in the winter window —
 *  the natural halfway checkpoint, so it lands roughly once per season, not monthly. */
export function scriptedMidSeasonNote(state: GameState): string | null {
  if (state.clock.window !== 'winter') return null;
  const form = midSeasonForm(state);
  if (!form.underway || form.roundsPlayed < 6) return null;
  const club = state.clubs[state.playerClub];
  const league = club?.leagueId ? state.leagues[club.leagueId] : undefined;
  if (!league) return null;
  const order = standingsOrder(league); // ordered clubIds, proper tie-breaks
  const pos = order.indexOf(state.playerClub) + 1;
  const me = league.standings[state.playerClub];
  if (!pos || !me) return null;
  const top4 = order[3] ? league.standings[order[3]]?.points ?? 0 : 0;
  const gap = top4 - me.points;
  const flyer = form.players.filter((p) => p.flag === 'flying').slice(0, 2).map((p) => p.name);
  const parts = [`⏱ Mid-season — ${club?.name} sit ${pos}${ordinal(pos)} after ${form.roundsPlayed} games on ${me.points} points${pos > 4 && gap > 0 ? `, ${gap} off the top four` : pos <= 4 ? ', inside the Champions League places' : ''}.`];
  if (flyer.length) parts.push(`Flying: ${flyer.join(' and ')}.`);
  return parts.join(' ');
}
