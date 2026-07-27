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

import { coachBriefing, getScenario, clubSquadPlayers, realInboundThisWindow, realDepartureThisWindow, narrativeContext, divergenceFactor, standingsOrder, midSeasonForm, ERA_REALITY, eraForScenario, type GameState, type ScenarioOpening } from '@director/engine';

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

/** Surname for a compact chip caption ("Luís Figo" → "Figo", "Kevin De Bruyne" →
 *  "De Bruyne", "Edwin van der Sar" → "van der Sar"). Keeps trailing name
 *  particles so multi-word surnames read right. */
function surname(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const particles = new Set(['de', 'da', 'del', 'della', 'di', 'van', 'von', 'der', 'den', 'ten', 'ter', 'dos', 'do', 'la', 'le', 'al']);
  let i = parts.length - 1;
  while (i > 1 && particles.has(parts[i - 1]!.toLowerCase())) i -= 1;
  return parts.slice(i).join(' ');
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
  // The coach's own recommended targets (real players the recommender surfaces) —
  // so even a quiet summer with no real inbound still offers a concrete, named
  // signing to chase. Real business always ranks ahead of these; they fill the gap.
  const brief = coachBriefing(state);
  const inboundNames = new Set(inbound.map((i) => i.name));
  for (const t of brief.targets.filter((t) => !inboundNames.has(t.name)).slice(0, 2)) {
    ranked.push({
      label: `Go for ${surname(t.name)}?`,
      message: `${brief.coach} rates ${t.name} at ${t.club} — should we go for him this summer? Talk me through it.`,
    });
  }

  return [
    ...ranked.slice(0, 3),
    { label: 'Review the wider market', message: 'Show me the wider market — who else could we go for this summer?' },
  ];
}

/**
 * The story of world football that summer — the era-defining macro-beat every
 * scenario lives through when its clock reaches that year, named explicitly so a
 * takeover, a world-record fee or a market earthquake reads as a live story in any
 * save (Abramovich in a Man Utd 1999 play, the Bosman ruling in a Serie A 1995
 * one). Calendar-keyed, real history — pure narration, no bearing on the sim.
 */
const WORLD_HEADLINES: Record<number, string> = {
  1995: `The Bosman ruling is about to tear up the rulebook — out-of-contract players will soon move for nothing, and the transfer market will never be the same.`,
  1996: `Bosman's free transfers arrive, and Alan Shearer's world-record £15m move to Newcastle sets the tone: English money is beginning to talk.`,
  1997: `Ronaldo joins Inter for a world-record £19.5m — Serie A is the richest, most glamorous league on earth, and everyone wants in.`,
  1998: `Fresh off France '98, the game's biggest names are on the move, and the record fees keep climbing across Italy and Spain.`,
  1999: `Christian Vieri's £32m move to Inter smashes the world record again — Serie A's spending arms race is at its peak.`,
  2000: `Florentino Pérez wins the Real Madrid presidency on a promise to sign Luís Figo from Barcelona, and does — a world-record £37m that lights the fuse on the Galácticos.`,
  2001: `Zinedine Zidane joins Real Madrid for a world-record £46m — the Galácticos are in full flow, and the rest of Europe scrambles to keep up.`,
  2002: `Rio Ferdinand becomes the world's most expensive defender at £30m, and Ronaldo joins the Galácticos — the post-World Cup market is booming.`,
  2003: `Roman Abramovich buys Chelsea and turns the market upside down overnight — his billions rewrite what's possible, and every rival feels the ground shift.`,
  2004: `José Mourinho arrives at Abramovich's Chelsea and declares himself the Special One — the balance of power in England is tilting.`,
  2005: `Chelsea's money machine rolls on after back-to-back title assaults, and the rest of the Premier League races to respond.`,
  2006: `Post-Germany '06, Chelsea land Shevchenko and Ballack, and the transfer market's centre of gravity is firmly in the Premier League.`,
  2007: `Fernando Torres joins Liverpool and Kaká reigns as the world's best — the elite are separating from the pack.`,
  2008: `Abu Dhabi's takeover makes Manchester City the richest club on the planet overnight, hijacking Robinho on deadline day — a new superpower is born.`,
  2009: `Cristiano Ronaldo joins Real Madrid for a world-record £80m and Kaká arrives too — Florentino's second Galácticos, as City start spending to match.`,
  2010: `Post-South Africa 2010, Real and Barça pull clear at the top while Manchester City's project accelerates with every window.`,
  2011: `Sergio Agüero joins City and Cesc Fàbregas returns to Barça — the money at the top of the game keeps concentrating.`,
  2012: `Eden Hazard picks Chelsea and Robin van Persie joins United — the Premier League's spending power is drawing the world's best.`,
  2013: `Gareth Bale joins Real Madrid for a world-record £86m and Neymar lands at Barça — and in Manchester, Guardiola-era football looms as the giants rearm.`,
  2014: `Luis Suárez joins Barça and James Rodríguez lights up Real after the World Cup — the superclubs are hoarding the game's brightest talents.`,
  2015: `Financial Fair Play bites, but the elite keep spending — De Bruyne and Sterling head to City as the arms race rolls on.`,
  2016: `Paul Pogba returns to United for a world-record £89m, and Guardiola and Mourinho arrive in Manchester on the same summer — the stakes have never been higher.`,
  2017: `Neymar joins PSG for £198m — more than double the old record. The market has shattered, and no valuation feels safe again.`,
  2018: `Cristiano Ronaldo stuns Madrid by joining Juventus, and goalkeepers go for record fees — the post-Russia market has no ceiling.`,
  2019: `Eden Hazard finally gets his Real move and João Félix commands £113m — the game's inflation shows no sign of slowing.`,
  2020: `Covid empties the stadiums and squeezes the market — even the giants tighten their belts, and Messi's future at Barça is suddenly in doubt.`,
  2021: `Lionel Messi leaves a broke Barcelona for PSG and Ronaldo returns to United — the Super League collapses in days, but the financial fault lines it exposed remain.`,
  2022: `Erling Haaland joins City and the post-Qatar market roars back — the Premier League's spending dwarfs the rest of Europe.`,
  2023: `Saudi Arabia's PIF pours billions into its Pro League — Ronaldo, Benzema and Neymar head east — while Bellingham lights up Real and Kane joins Bayern.`,
  2024: `Kylian Mbappé finally joins Real Madrid on a free, and the Saudi spending wave keeps reshaping the game's economics.`,
};

/** The world's story this summer, if history recorded a defining one. */
function worldHeadline(year: number): string | null {
  return WORLD_HEADLINES[year] ?? null;
}

/** 1st, 2nd, 3rd, … */
function ordinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/** The last season the club just played (finish, points, whether it won the title),
 *  the shape a summer set-piece opens on. */
export interface SeasonReviewFacts {
  finish: number;
  expected: number;
  points: number;
  wonTitle: boolean;
  patience: number;
  season: number;
}

/**
 * The biggest moves ELSEWHERE this window — the galácticos, the Bosmans, the
 * record fees that set the scene the Director is operating against. The summer's
 * backdrop, drawn straight from the era ledger so it needs no authoring and stays
 * true even as the Director's own play veers away from history.
 */
function worldMovesThisWindow(state: GameState, max = 3): string[] {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack?.realTransferLedger) return [];
  const now = state.clock.date;
  return pack.realTransferLedger
    .filter((e) => e.window === now && e.to !== state.playerClub && e.from !== state.playerClub)
    .map((e) => {
      const p = state.players[e.playerId];
      if (!p || p.retired) return null;
      const to = state.clubs[e.to]?.name ?? e.to;
      const from = e.from ? state.clubs[e.from]?.name ?? e.from : null;
      const fromPart = from ? ` from ${from}` : '';
      const feePart = e.fee ? ` for ${fee(e.fee)}` : from ? ' on a free' : '';
      return { fee: e.fee, line: `${p.name} to ${to}${fromPart}${feePart}` };
    })
    .filter((x): x is { fee: number; line: string } => !!x)
    .sort((a, b) => b.fee - a.fee)
    .slice(0, max)
    .map((x) => x.line);
}

/**
 * The summer's big spender, if one club is stacking up arrivals this window — a
 * rival's spree as a live story (Abramovich's Chelsea in 2003, PIF-era Newcastle,
 * a galáctico Madrid). Drawn from the ledger, so it needs no authoring and holds
 * even when the Director's play has bent the world off its real course.
 */
function bigSpenderThisWindow(state: GameState): string | null {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  if (!pack?.realTransferLedger) return null;
  const now = state.clock.date;
  const byClub = new Map<string, { names: string[]; spend: number }>();
  for (const e of pack.realTransferLedger) {
    if (e.window !== now || e.to === state.playerClub || !e.fee) continue;
    const p = state.players[e.playerId];
    if (!p || p.retired) continue;
    const agg = byClub.get(e.to) ?? { names: [], spend: 0 };
    agg.names.push(p.name);
    agg.spend += e.fee;
    byClub.set(e.to, agg);
  }
  let best: { club: string; names: string[]; spend: number } | null = null;
  for (const [club, agg] of byClub) {
    if (agg.names.length < 2) continue; // a spree is two or more marquee arrivals
    if (!best || agg.spend > best.spend) best = { club, names: agg.names, spend: agg.spend };
  }
  if (!best) return null;
  const clubName = state.clubs[best.club]?.name ?? best.club;
  return `${clubName} are the summer's big spenders, landing ${joinNames(best.names)} — a statement of intent the whole league can read.`;
}

/**
 * A GENERATED summer set-piece for any window past the game's opening — the same
 * lived-through, tap-through shape as the curated opening, but assembled from the
 * live facts of that summer: where the club sits after the season just gone, the
 * world moving around it (and any macro shock like the Abramovich takeover, passed
 * in from the advance), the coach's read, and the summer's real calls as tappable
 * prompts. Deterministic — a passive, reality-default play costs no tokens; the
 * model can refine the prose later as divergence makes the scripted line stale.
 */
export function generatedSummerOpening(
  state: GameState,
  opts: { review?: SeasonReviewFacts; worldStory?: string[] } = {},
): Opening {
  const club = state.clubs[state.playerClub]!;
  const year = Number(state.clock.date.slice(0, 4));
  const ctx = narrativeContext(state);
  const coach = coachBriefing(state);

  // ── Beat one: where the club stands after the season just gone. ──
  const r = opts.review;
  let standing = '';
  if (r) {
    const label = `${r.season}–${String((r.season + 1) % 100).padStart(2, '0')}`;
    standing = r.wonTitle
      ? `You finished ${label} as champions — ${r.points} points and the title in the cabinet. `
      : `You finished ${label} ${ordinalSuffix(r.finish)} on ${r.points} points. `;
  }
  const boardLine = `The board are ${ctx.board.mood}${ctx.board.mandate ? `; the brief is unchanged — ${ctx.board.mandate.replace(/\.$/, '')}` : ''}.`;
  const realityLine = ctx.reality?.note ? ` ${ctx.reality.note}` : '';
  const opener = `${club.name}, summer ${year}. ${standing}${boardLine}${realityLine}`.trim();

  // ── Beat two: the story of the summer — the world's defining beat, the rivals
  //    moving, and any macro shock from the sim. ──
  const storyParts: string[] = [];
  const macro = (opts.worldStory ?? []).filter(Boolean);
  if (macro.length) storyParts.push(macro.join(' '));
  // The era-defining story of world football that summer — named explicitly, so
  // every scenario lives the takeover / world-record / market shock of its year.
  const headline = worldHeadline(year);
  if (headline && !macro.length) storyParts.push(headline);
  // A rival throwing its weight around — the summer's big spender (a club stacking
  // up arrivals, e.g. Abramovich's Chelsea in 2003). Surfaces a spree as a live
  // story from the ledger, no per-scenario authoring, true even off history's path.
  const spender = bigSpenderThisWindow(state);
  if (spender) storyParts.push(spender);
  const world = worldMovesThisWindow(state);
  if (world.length) storyParts.push(`The summer's big business is being done elsewhere too: ${joinNames(world)}.`);
  if (divergenceFactor(state) > 0) {
    storyParts.push(`And this is no longer history's script — the world you've bent is writing its own summer now.`);
  }
  if (!storyParts.length) {
    storyParts.push(`It's a quieter window across the game — the noise this summer, if there's to be any, will be of your making.`);
  }
  const story = storyParts.join('\n\n');

  // ── Beat three: the coach's read and the summer's live calls. ──
  const spine = coach.bestXI.slice(0, 5).map((x) => x.name);
  const spots = [...new Set(coach.strengthen.map((s) => POSITION_LABEL[s.position] ?? s.position))];
  const meetParts = [
    `You sit down with ${coach.coach}. He'll line up in a ${coach.formation}, built around ${joinNames(spine)}.`,
  ];
  if (spots.length) meetParts.push(`Pressed on where the side still needs work, he wants it strengthened at ${joinNames(spots)}.`);
  meetParts.push(`The window is open, and the summer's first calls are on your desk.`);
  const meeting = meetParts.join('\n\n');

  const beats: OpeningBeat[] = [
    { text: opener, reveal: `What's the story this summer?` },
    { text: story, reveal: `Meet ${coach.coach}` },
    { text: meeting, actions: openingActions(state) },
  ];
  return { scene: [opener, story].join('\n\n'), meeting, beats };
}

/**
 * A GENERATED winter set-piece — the January window as a moment, but only when
 * there's a crisis worth pausing on (a contract running down, an unsettled man, an
 * injury pile-up, or form gone sour). No crisis → returns null and the Advance feed
 * keeps its lighter mid-season note. Summer is the set-piece every time; winter
 * earns it. Deterministic; no tokens.
 */
/** Where the club's league campaign sits — leader/gap or the lead they hold. */
function titleRaceLine(state: GameState): string | null {
  const club = state.clubs[state.playerClub]!;
  const league = club.leagueId ? state.leagues[club.leagueId] : undefined;
  if (!league || league.roundsPlayed === 0) return null;
  const order = standingsOrder(league);
  const pos = order.indexOf(state.playerClub) + 1;
  if (pos === 0) return null;
  const myPts = league.standings[state.playerClub]?.points ?? 0;
  if (pos === 1) {
    const second = order[1];
    const gap = myPts - (second ? league.standings[second]?.points ?? 0 : 0);
    return `You sit top of the table${second ? `, ${gap === 0 ? 'level on points with' : `${gap} clear of`} ${state.clubs[second]?.name}` : ''}`;
  }
  const leader = order[0]!;
  const gap = (league.standings[leader]?.points ?? 0) - myPts;
  return `You sit ${ordinalSuffix(pos)}, ${gap === 0 ? 'level with' : `${gap} ${gap === 1 ? 'point' : 'points'} behind`} leaders ${state.clubs[leader]?.name}`;
}

/** One standout and one struggler in the current side — "the form of his life"
 *  vs "lost on the fringes" — read from the engine's live mid-season form, which
 *  writes the authored note per player (goals/assists, why he's off the pace, the
 *  logjam he's stuck in). Reusing those notes keeps the winter beat true to what
 *  the squad panel shows and rich without per-scenario authoring. p.form itself is
 *  a club-tier field that stays 0 mid-season, so it must NOT be read here. */
function formStoryLines(state: GameState): string[] {
  const form = midSeasonForm(state);
  if (!form.underway) return [];
  const out: string[] = [];
  const flying = form.players.find((p) => p.flag === 'flying');
  if (flying) out.push(`${flying.name} is ${flying.note}`);
  // The most telling downside story — a stranded talent or a man off his level.
  // Ordered by how much of a story it is (misfit/logjam/struggling over a mere
  // squad-filler on the fringe).
  const downRank: Record<string, number> = { misfit: 0, logjam: 1, struggling: 2, adapting: 3, fringe: 4 };
  const struggling = form.players
    .filter((p) => p.flag in downRank && p.name !== flying?.name)
    .sort((a, b) => downRank[a.flag]! - downRank[b.flag]!)[0];
  if (struggling) out.push(`${struggling.name} is ${struggling.note}`);
  return out;
}

/** If defenders/keeper are in the treatment room while results slide, name the
 *  cause-and-effect the Director will feel — the leaking-at-the-back story. */
function injuryConsequenceLine(state: GameState): string | null {
  const squad = clubSquadPlayers(state, state.playerClub);
  const backOut = squad.filter((p) => p.injury && p.injury.monthsRemaining > 0 && p.positions.some((pos) => ['GK', 'CB', 'RB', 'LB'].includes(pos)));
  if (backOut.length && narrativeContext(state).form?.momentum === 'slumping') {
    return `with ${joinNames(backOut.slice(0, 2).map((p) => p.name))} out at the back, you've been leaking goals`;
  }
  return null;
}

export function generatedWinterOpening(state: GameState): Opening | null {
  const ctx = narrativeContext(state);
  const year = Number(state.clock.date.slice(0, 4));
  const injured = ctx.squad.injured ?? [];
  const unsettled = ctx.squad.unsettled ?? [];
  const expiring = ctx.squad.expiring ?? [];
  const badForm = ctx.form?.momentum === 'slumping';
  // The season has to be underway to have a story; before that there's nothing yet.
  if (!ctx.league || ctx.league.position === null) return null;

  const club = state.clubs[state.playerClub]!;
  const coach = coachBriefing(state);

  // ── Beat one: the state of the season — the title race, the form, Europe. ──
  const race = titleRaceLine(state);
  let lead = `Midwinter at ${club.name}, January ${year}.`;
  if (race) {
    lead += ` ${race}`;
    if (ctx.form?.momentum === 'surging') lead += ` — and the side is flying`;
    else if (badForm) lead += ` — but the run of results has the mood turning`;
    lead += '.';
  } else if (ctx.form?.momentum === 'surging') lead += ` The side is flying.`;
  else if (badForm) lead += ` The run of results has the mood turning.`;
  const sentences = [lead];
  if (ctx.reality?.note) sentences.push(ctx.reality.note.trim().replace(/\.?$/, '.'));
  if (ctx.europe && (ctx.europe.youWon || ctx.europe.youReachedFinal)) {
    sentences.push(ctx.europe.youWon
      ? `In Europe you are the reigning champions, having beaten ${ctx.europe.runnerUp} in the final.`
      : `In Europe you reached the final, beaten by ${ctx.europe.winner}.`);
  }
  const opener = sentences.join(' ');

  // ── Beat two: your fingerprints on the half-season — form, injuries, the fans.
  //    Each of these is a full clause (the engine's per-player note, the leaking-
  //    at-the-back line, the fans' unrest over a sale), so they read as their own
  //    sentences rather than one comma-spliced run-on. ──
  const forms = formStoryLines(state);
  const sentenceBits: string[] = [];
  if (forms[0]) sentenceBits.push(`Around the squad, ${forms[0]}.`);
  if (forms[1]) sentenceBits.push(`${capitalise(forms[1])}.`);
  const injLine = injuryConsequenceLine(state);
  if (injLine) sentenceBits.push(`At the back, ${injLine}.`);
  const saleMemory = ctx.threads.find((tdetail) => /still coming to terms with the sale/i.test(tdetail));
  if (saleMemory) sentenceBits.push(saleMemory.trim().replace(/\.?$/, '.'));
  const storyPara = sentenceBits.join(' ');

  // ── Beat three: the calls at the edges. ──
  const crisisBits: string[] = [];
  if (injured.length >= 2) crisisBits.push(`the treatment room is filling up (${joinNames(injured.slice(0, 3).map((i) => i.name))})`);
  if (unsettled.length) crisisBits.push(`${joinNames(unsettled.slice(0, 2).map((u) => u.name))} ${unsettled.length === 1 ? 'is' : 'are'} unsettled`);
  if (expiring.length) crisisBits.push(`contracts are running down (${joinNames(expiring.slice(0, 3).map((e) => e.name))})`);

  const actions: OpeningChip[] = [];
  if (expiring.length) {
    const nm = expiring[0]!.name;
    actions.push({ label: `Sort out ${surname(nm)}'s deal?`, message: `${nm}'s contract is running down — do I tie him to a new deal now, or let it run? Talk me through it.` });
  }
  if (unsettled.length) {
    const nm = unsettled[0]!.name;
    actions.push({ label: `Settle ${surname(nm)}?`, message: `${nm} is unsettled — how do I handle it before it festers?` });
  }
  if (injured.length >= 2) {
    actions.push({ label: 'Bring in cover?', message: 'We are short with these injuries — should I bring in cover this January, and who?' });
  }
  actions.push({ label: 'Review the January market', message: 'Show me who is realistically available this January.' });

  const meetParts = [
    crisisBits.length
      ? `${coach.coach} wants a word before the window shuts — it isn't quiet: ${joinNames(crisisBits)}. The side is his; the calls at the edges are yours.`
      : `${coach.coach} wants a word before the window shuts. The side is his; the calls at the edges are yours.`,
    `Where do you want to start?`,
  ];

  const beats: OpeningBeat[] = [
    { text: opener, reveal: storyPara ? `How's it playing out around the squad?` : `What are my options?` },
  ];
  if (storyPara) beats.push({ text: storyPara, reveal: `What are my options?` });
  beats.push({ text: meetParts.join('\n\n'), actions: actions.slice(0, 4) });
  return { scene: opener, meeting: meetParts.join('\n\n'), beats };
}

function capitalise(s: string): string {
  return s.length ? s[0]!.toUpperCase() + s.slice(1) : s;
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
