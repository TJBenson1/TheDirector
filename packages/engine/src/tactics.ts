/**
 * Formations & the tactical era (M13).
 *
 * A formation is not era-neutral. A flat 4-4-2 that dominated the 1990s gets its
 * two-man central midfield overrun by the 4-3-3 / 4-2-3-1 three-man midfields
 * that took over from the late 2000s; wing-back systems come and go. Each
 * formation therefore carries an era-effectiveness — a small strength delta that
 * rewards playing the shape of the moment and punishes being tactically stuck.
 *
 * The delta is applied to the USER's club only: the AI world is abstracted as
 * always fielding an era-appropriate shape (so the reality baseline — and the
 * calibration harness — is untouched), while the manager the user works with has
 * a real formation they may need persuading to change.
 */

export type Formation =
  | '4-4-2'
  | '4-4-2-diamond'
  | '4-3-3'
  | '4-2-3-1'
  | '3-5-2'
  | '5-3-2'
  | '3-4-3';

export const ALL_FORMATIONS: Formation[] = ['4-4-2', '4-4-2-diamond', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2', '3-4-3'];

/** Central-midfield bodies a shape fields — the axis the modern game is won on. */
const CENTRAL_MIDFIELD: Record<Formation, number> = {
  '4-4-2': 2,
  '4-4-2-diamond': 4,
  '4-3-3': 3,
  '4-2-3-1': 3,
  '3-5-2': 3,
  '5-3-2': 3,
  '3-4-3': 2,
};

export function formationLabel(f: Formation): string {
  return f === '4-4-2-diamond' ? '4-4-2 (diamond)' : f;
}

/**
 * Strength delta (in match-strength points) for fielding `formation` in `year`.
 * Zero is "the shape of its time". A two-man central midfield is fine into the
 * early 2000s but increasingly overrun as three-man midfields take over; a
 * diamond or a genuine three keeps pace; back-three/wing-back shapes are strong
 * in their two windows (mid-90s, later 2010s) and unfashionable between.
 */
export function formationEraModifier(formation: Formation, year: number): number {
  const mid = CENTRAL_MIDFIELD[formation];
  // The midfield-overrun curve: before ~2004 numbers barely matter; by the 2010s
  // a two-man central midfield concedes the middle of the park.
  const modernity = Math.max(0, Math.min(1, (year - 2004) / 8)); // 0 at 2004, 1 by 2012
  const midfieldGap = (3 - mid) * modernity; // positive when short of a three in the modern game
  let delta = -midfieldGap * 3; // up to ~-6 for a flat two in the deep 2010s

  // Back-three / wing-back shapes: fashionable in the mid-90s and again from ~2016,
  // awkward in the possession-fullback 2000s-early-2010s between.
  if (formation === '3-5-2' || formation === '5-3-2' || formation === '3-4-3') {
    const inVogue = year <= 1998 || year >= 2016;
    delta += inVogue ? 1 : -1.5;
  }
  // The lone-striker 4-2-3-1 is the defining modern shape — a touch ahead of its
  // time in the 1990s, the standard from the 2010s.
  if (formation === '4-2-3-1') delta += year >= 2010 ? 1 : year < 2000 ? -1 : 0;

  return (Math.round(delta * 10) / 10) + 0; // normalise -0 → 0
}

/** The best era-appropriate shape for a given year — what the Director would
 *  suggest, and what an adaptable coach drifts toward. */
export function eraIdealFormation(year: number): Formation {
  if (year >= 2016) return '4-2-3-1';
  if (year >= 2008) return '4-3-3';
  if (year >= 2000) return '4-4-2-diamond';
  return '4-4-2';
}
