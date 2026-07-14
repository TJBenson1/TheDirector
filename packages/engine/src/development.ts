/**
 * Contextual development engine (§5) — the signature system.
 *
 * A player's potential is a ceiling, not a script. Whether he approaches it
 * depends on development inputs evaluated each season: minutes at an appropriate
 * level (the biggest factor — benched wonderkids plateau), competition for
 * place, coaching, injury history, professionalism, and the age/position curve.
 *
 * Anti-hindsight property (§5): because development is contextual, "X became
 * world-class in reality" only pays off if the player can supply the pathway.
 *
 * Runs at the season rollover alongside decline (ageing.ts). This module owns
 * the *growth* half (young players); ageing.ts owns decline. It also runs the
 * low-professionalism lifestyle-decline check (the Ronaldinho pattern).
 *
 * Calibration target (§12), owned here: benched (<40% minutes, 2+ yrs)
 * wonderkids reaching their ceiling < 15%.
 */

import type { ClubId, ClubState, GameState, PlayerState, Position } from './types.js';
import { Rng, clamp01 } from './rng.js';
import { logEvent } from './eventLog.js';
import { clubSquadPlayers, recomputeClubStrength, buildResistance } from './players.js';
import { suggestWage } from './finance.js';
import { ERA_REALITY, eraForScenario } from './ledger.js';
import { managerDevMod, managerAttributeDevMod } from './manager.js';

const DEV_AGE_MAX = 23; // growth window (§5 age curve)
const REACHED_MARGIN = 2; // ability within this of ceiling ⇒ "reached potential"

type PositionGroup = 'GK' | 'DEF' | 'MID' | 'ATT';

const GROUP_OF: Record<Position, PositionGroup> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF',
  DM: 'MID', CM: 'MID', AM: 'MID',
  LW: 'ATT', RW: 'ATT', ST: 'ATT',
};

/** Typical first-choice slots per position group in a matchday XI. */
const GROUP_SLOTS: Record<PositionGroup, number> = { GK: 1, DEF: 4, MID: 3, ATT: 3 };

function groupOf(player: PlayerState): PositionGroup {
  return GROUP_OF[player.positions[0] ?? 'CM'];
}

/**
 * Estimated share of "minutes at an appropriate level" (0..1) for a player,
 * from his ability rank within his position group at the club. A young talent
 * blocked behind established stars gets few minutes → stunted; the same player
 * at a weaker club plays → develops. This is the core anti-hindsight lever.
 */
export function estimateMinutesShare(state: GameState, club: ClubState, player: PlayerState): number {
  const raw = rawMinutesShare(state, club, player);
  // A Director directive the coach has ACCEPTED overrides his ability-based
  // selection for the user's OWN players: guarantee a prospect first-team
  // football (the develop-him lever), or cap a fragile star's load. Empty by
  // default, so a hands-off Director (and the passive harness) is unaffected.
  if (club.id === state.playerClub) {
    const d = state.directives?.[player.id];
    if (d?.kind === 'minutes') return Math.max(raw, 0.7); // first-choice minutes, guaranteed
    if (d?.kind === 'load') return Math.min(raw, 0.4); // rotation at most — his body is protected
  }
  return raw;
}

function rawMinutesShare(state: GameState, club: ClubState, player: PlayerState): number {
  const group = groupOf(player);
  const year = Number(state.clock.date.slice(0, 4));
  // Rank by EFFECTIVE ability: a fading veteran (32+) is discounted, because
  // clubs transition minutes to youth rather than block a prospect behind a
  // declining 34-year-old for years. A prospect stuck behind PRIME players
  // (no discount) still rides the bench and plateaus — so this doesn't rescue
  // a genuinely benched wonderkid, only an unrealistically age-blocked one.
  const eff = (p: PlayerState): number => {
    const age = year - p.birthYear;
    return p.ability - (age >= 32 ? (age - 31) * 3 : 0);
  };
  const mine = eff(player);
  const peers = clubSquadPlayers(state, club.id).filter((p) => groupOf(p) === group);
  const rank = peers.filter((p) => eff(p) > mine || (eff(p) === mine && p.id < player.id)).length;
  const slots = GROUP_SLOTS[group];
  if (rank < slots) return 0.85; // first choice
  if (rank < slots + 2) return 0.4; // rotation
  // A real gem is blooded even when not yet the best on paper — a club plays its
  // prized prospect. But FLOOD his position (rank ≥ slots+3) and he is genuinely
  // buried: that is the "blocked pathway" butterfly (buy Duff/Kewell over a young
  // Ronaldo). So moderate competition develops him; over-stacking blocks him.
  const age = year - player.birthYear;
  if (player.curated && age <= 23 && player.potentialCeiling >= 86 && rank < slots + 3) return 0.4;
  return 0.1; // benched
}

function minutesFactor(share: number): number {
  if (share >= 0.6) return 1.0;
  if (share >= 0.4) return 0.5;
  return 0.05; // benched → almost no growth
}

/** Ceiling erosion per benched development season — a lost window that
 *  permanently plateaus the player below his birth potential (§5: ~70–80%). */
const BENCH_CEILING_EROSION = 4;

/**
 * Develop and lifestyle-check every player at the season rollover. Growth for
 * the young (gated by minutes/coaching/professionalism/injuries), and a
 * lifestyle-decline roll for successful low-professionalism stars.
 */
export function processSeasonDevelopment(state: GameState, rng: Rng): void {
  const year = Number(state.clock.date.slice(0, 4));
  const devRng = rng.fork(`development:${year}`);

  for (const club of Object.values(state.clubs)) {
    let changed = false;
    for (const player of clubSquadPlayers(state, club.id)) {
      const age = year - player.birthYear;

      // Real players keep improving toward their peak into their mid-20s (many
      // defenders/keepers peak at 27+); procedural filler follows the tighter
      // youth curve. A lost talent with a still-locked latent ceiling develops
      // even once he has maxed his (low) real ceiling — the unlock can raise it.
      const devMax = player.curated ? 27 : DEV_AGE_MAX;
      const hasLatent = player.latentCeiling !== undefined && player.latentCeiling > player.potentialCeiling;
      if (age <= devMax && (player.ability < player.potentialCeiling || hasLatent)) {
        changed = developYoungster(state, club, player, age, devRng) || changed;
      } else if (age >= 25 && player.ability >= 82) {
        lifestyleDeclineCheck(state, club, player, devRng);
        changed = true;
      }

      // "Reached potential" is measured against the BIRTH ceiling — a stunted
      // player who plateaus below it never counts, even if he maxes his eroded
      // working ceiling.
      if (!player.reachedPotential && player.ability >= player.birthCeiling - REACHED_MARGIN) {
        player.reachedPotential = true;
      }
    }
    if (changed && club.leagueId !== null) recomputeClubStrength(state, club.id);
  }
}

function developYoungster(
  state: GameState,
  club: ClubState,
  player: PlayerState,
  age: number,
  rng: Rng,
): boolean {
  const share = estimateMinutesShare(state, club, player);
  if (share < 0.4) {
    // A benched development season: count it and erode the working ceiling —
    // the missed window plateaus him below his birth potential (§5).
    player.benchedDevSeasons += 1;
    player.potentialCeiling = Math.max(player.ability, player.potentialCeiling - BENCH_CEILING_EROSION);
  }
  const per = player.personality;

  // ── LOST TALENT: a deployable GAMBLE, never a guarantee ─────────────────────
  // A real player who under-achieved carries a latent ceiling above what he
  // reached. Giving him real minutes at a real club is a STRATEGY the user can
  // deploy — but it can fail: he might kick on (ceiling climbs toward the latent),
  // or BUST (the talent reality wasted stays wasted). The odds are weighted by
  // temperament — a pro is a safer bet than a flaky, big-ego talent. Deny him
  // minutes and the pathway is blocked, so the latent quietly fades, as reality.
  if (player.curated && player.latentCeiling !== undefined && player.latentCeiling > player.potentialCeiling) {
    developLatentTalent(state, club, player, age, share, rng);
  }

  const gap = player.potentialCeiling - player.ability;
  if (gap <= 0) return false;

  // ── CURATED = reality-rail (§5, user directive) ────────────────────────────
  // A real player became who he became: given minutes he closes the gap to his
  // natural peak over a few seasons. The ONLY thing that derails him is a lack of
  // minutes — a butterfly, usually on the user's own club (buy Ronaldo but also
  // Duff/Kewell and keep Beckham, and his pathway is blocked). Below rotation he
  // stagnates (and the bench erosion above bites); poor professionalism adds only
  // slight friction.
  if (player.curated) {
    const drive = share >= 0.6 ? 0.34 : share >= 0.4 ? 0.18 : 0.0;
    if (drive === 0) return false; // blocked — no progress this season
    const ageTaper = age <= 24 ? 1.0 : 0.6; // still develops in the mid-20s, slower
    // The head coach's calibre nudges even a real player's climb (×1 at par →
    // neutral for a kept inherited coach; a top coach unlocks a touch more), and
    // his STYLE favours the player types it suits (a possession coach his
    // midfielders, a pragmatist his defenders).
    const coachMod = club.id === state.playerClub
      ? managerDevMod(state.managerRelations) * managerAttributeDevMod(state.managerRelations, player)
      : 1;
    let delta = Math.max(1, Math.round(gap * drive * ageTaper * coachMod));
    // Rare friction for the unprofessional, never a hard wall.
    if (per.professionalism <= 5 && rng.chance(0.15)) delta = Math.max(0, delta - 1);
    if (delta > 0) {
      player.ability = Math.min(player.potentialCeiling, player.ability + delta);
      return true;
    }
    return false;
  }

  // ── PROCEDURAL = the user's speculative gamble (anti-hindsight) ─────────────
  const coachQuality = club.id === state.playerClub
    ? managerDevMod(state.managerRelations) * managerAttributeDevMod(state.managerRelations, player)
    : 1;
  const coaching = (0.6 + 0.4 * (club.prestige / 100)) * coachQuality; // facilities + head coach (§5)
  const prof = 0.7 + 0.3 * (player.personality.professionalism / 10);
  const ageFactor = age <= 19 ? 1.2 : age <= 21 ? 1.0 : 0.7;
  const injuryPenalty = player.injuryHistory * 1.5;

  const ideal = gap * 0.35; // approach the ceiling over a few ideal years
  const realized = ideal * minutesFactor(share) * coaching * prof * ageFactor - injuryPenalty;
  let delta = Math.max(0, Math.round(realized + rng.gaussian(0, 0.6)));

  // Even a well-managed procedural prospect only reaches his ceiling ~40–60% of
  // the time — fame/complacency and plain stagnation shave the working ceiling.
  const stallChance =
    0.29 +
    (10 - per.professionalism) * 0.022 +
    per.volatility * 0.008 +
    (player.ability >= 78 ? per.ego * 0.01 : 0);
  if (rng.chance(stallChance)) {
    player.potentialCeiling = Math.max(player.ability, player.potentialCeiling - 2);
    if (player.ability >= 78 && per.professionalism <= 5 && rng.chance(0.35)) {
      player.ability = Math.max(40, player.ability - rng.int(1, 3));
    }
    return true;
  }
  if (delta > 0) {
    player.ability = Math.min(player.potentialCeiling, player.ability + delta);
    return true;
  }
  return false;
}

/**
 * Surface real academy graduates due this year (Principle 2 — youth is REAL
 * players only). Each graduate is a curated seed instantiated into his club at a
 * youth age; this is how squads renew without fabricating players. Idempotent:
 * a graduate already in the world is skipped. Runs at the July rollover.
 */
export function processAcademyGraduates(state: GameState, rng: Rng): void {
  const pack = ERA_REALITY[eraForScenario(state.meta.scenarioId)];
  const grads = pack?.academyGraduates ?? [];
  const year = Number(state.clock.date.slice(0, 4));

  for (const g of grads) {
    if (g.year > year) continue; // not due yet (due-or-overdue handles the start year)
    const seed = g.seed;
    if (state.players[seed.id]) continue; // already surfaced (idempotent)
    const club = state.clubs[seed.club];
    if (!club) continue;

    const gr = rng.fork(`academy:${seed.id}`);
    const age = year - seed.birthYear;
    const ceiling = seed.potentialCeiling;
    const player: PlayerState = {
      id: seed.id,
      name: seed.name,
      birthYear: seed.birthYear,
      nationality: seed.nationality,
      positions: [...seed.positions] as Position[],
      club: seed.club,
      contractUntil: seed.contractUntil,
      wage: 0,
      ability: seed.ability,
      potentialCeiling: ceiling,
      birthCeiling: seed.birthCeiling ?? ceiling,
      ...(seed.latentCeiling !== undefined ? { latentCeiling: seed.latentCeiling } : {}),
      personality: { ...seed.personality },
      injuryProneness: seed.injuryProneness,
      curated: true,
      fitness: 100,
      morale: 78,
      form: 0,
      injury: null,
      injuryHistory: 0,
      wonderkid: ceiling >= 85 && age <= 21,
      benchedDevSeasons: 0,
      reachedPotential: false,
      lastSeason: null,
      seasonMonthsInjured: 0,
      adaptation: null,
      resistance: buildResistance(seed.personality, seed.nationality, age, seed.ability, gr),
      agitation: 0,
    };
    if (seed.loyalty !== undefined) player.resistance.clubLoyalty = seed.loyalty;
    player.wage = suggestWage(player, year);

    state.players[player.id] = player;
    club.squad.push(player.id);
    if (club.leagueId !== null) recomputeClubStrength(state, club.id);

    logEvent(state, {
      category: 'development',
      code: 'academy.graduate',
      message: `${player.name} graduates from the ${club.name} academy${player.latentCeiling ? ' — one to watch' : ''}`,
      data: { playerId: player.id, clubId: club.id, age },
    });
  }
}

/** The latent upside fades once the pathway is missed — a blocked or aged-out
 *  talent goes unfulfilled, exactly as reality left him. */
function fadeLatent(player: PlayerState): void {
  const next = Math.max(player.potentialCeiling, (player.latentCeiling ?? 0) - 2);
  if (next <= player.potentialCeiling) delete player.latentCeiling;
  else player.latentCeiling = next;
}

/**
 * Resolve one development season for a LOST TALENT (reverse reality-rail). This
 * is a gamble the user opts into by playing him:
 *  - Aged out of the window (>23): the chance is gone, the latent fades.
 *  - Given TOP minutes at a suitable club: roll a temperament-weighted
 *    breakthrough (ceiling climbs toward the latent). If it misses, roll a bust —
 *    a flaky, low-professionalism talent is far more likely to throw it away, and
 *    a bust locks him at his real level for good.
 *  - Otherwise (blocked / rotation only): the pathway is missed, the latent fades.
 * Never guaranteed; a pro is a much safer bet than a volatile, big-ego prospect.
 */
function developLatentTalent(
  state: GameState,
  club: ClubState,
  player: PlayerState,
  age: number,
  share: number,
  rng: Rng,
): void {
  if (age > 23) return fadeLatent(player);

  const suitable = club.id === state.playerClub || club.prestige >= 80;
  if (share < 0.6 || !suitable) return fadeLatent(player);

  const { professionalism: prof, volatility: vol, ego } = player.personality;
  const breakthrough = clamp01(0.34 + prof * 0.028 - vol * 0.012 - ego * 0.008);
  if (rng.chance(breakthrough)) {
    const raise = Math.min(player.latentCeiling! - player.potentialCeiling, rng.int(2, 5));
    player.potentialCeiling += raise;
    logEvent(state, {
      category: 'development',
      code: 'development.unlocked',
      message: `${player.name} (${club.name}) is kicking on — fulfilling talent reality wasted, ceiling rises to ${player.potentialCeiling}`,
      data: { playerId: player.id, clubId: club.id, ceiling: player.potentialCeiling, latent: player.latentCeiling },
    });
    return;
  }

  const bust = clamp01(0.07 + (10 - prof) * 0.016 + vol * 0.01);
  if (rng.chance(bust)) {
    logEvent(state, {
      category: 'development',
      code: 'development.busted',
      message: `${player.name} (${club.name}) does not kick on — the talent reality wasted stays wasted`,
      data: { playerId: player.id, clubId: club.id },
    });
    delete player.latentCeiling; // locked at his real level, for good
  }
}

/** The Ronaldinho pattern: a successful star with low professionalism can
 *  decline early. Weighted by volatility/professionalism and team success. */
function lifestyleDeclineCheck(
  state: GameState,
  club: ClubState,
  player: PlayerState,
  rng: Rng,
): void {
  const prof = player.personality.professionalism;
  const vol = player.personality.volatility;
  if (prof >= 7) return; // consummate pros rarely decline this way

  // Team success amplifies complacency: use club strength as a proxy for "won everything".
  const success = club.strength >= 80 ? 1.4 : 1.0;
  const p = 0.02 * (8 - prof) * (0.6 + vol / 20) * success;
  if (rng.chance(p)) {
    const drop = rng.int(3, 7);
    player.ability = Math.max(40, player.ability - drop);
    player.potentialCeiling = Math.max(player.ability, player.potentialCeiling - Math.round(drop / 2));
    logEvent(state, {
      category: 'development',
      code: 'decline.lifestyle',
      message: `${player.name} (${club.name}) declines through lifestyle/complacency`,
      data: { playerId: player.id, clubId: club.id, drop },
    });
  }
}

/**
 * A curated player pulled off his real pathway PREMATURELY (reality-default): a
 * club signs him `yearsEarly` years ahead of the transfer reality had lined up
 * (e.g. a young striker taken as an alternative to the target you just gazumped).
 *
 * The reality-rail guarantees a curated talent "becomes the player" GIVEN the
 * environment and timing reality gave him. Move him early and that guarantee no
 * longer holds: he is asked to deliver before he was ready, at a club that isn't
 * the one that forged him. With a probability that scales with how early the move
 * is — and is softened by a mature, adaptable, professional head — his potential
 * ceiling slips, so he may never reach the heights he hit in reality. Either way
 * the divergence is logged, so the counterfactual is traceable (§16). Returns
 * true if the ceiling actually eroded.
 */
export function applyPrematureMove(
  state: GameState,
  player: PlayerState,
  yearsEarly: number,
  realDest: ClubId | null,
  rng: Rng,
): boolean {
  if (!player.curated || yearsEarly < 1) return false;
  const year = Number(state.clock.date.slice(0, 4));
  const age = year - player.birthYear;
  // Only a still-developing player has a ceiling left to miss; a finished pro
  // moved early is just a normal transfer.
  if (age > 25 || player.ability >= player.potentialCeiling) return false;

  const temperament =
    (player.personality.adaptability - 5) * 0.03 + (player.personality.professionalism - 5) * 0.02;
  const risk = Math.max(0, Math.min(0.6, 0.22 * yearsEarly - temperament));
  const realDestName = realDest ? state.clubs[realDest]?.name ?? realDest : 'his real destination';

  if (rng.next() >= risk) {
    logEvent(state, {
      category: 'development',
      code: 'development.premature.absorbed',
      message: `${player.name} moved ${yearsEarly}yr ahead of his real path but is taking it in stride — no ceiling lost (so far)`,
      data: { playerId: player.id, yearsEarly, realDest },
    });
    return false;
  }

  const erosion = rng.int(2, 3 + yearsEarly);
  player.potentialCeiling = Math.max(player.ability, player.potentialCeiling - erosion);
  player.morale = Math.max(0, player.morale - 6);
  state.timeline.divergenceLog.push({
    date: state.clock.date,
    kind: 'butterfly',
    detail: `${player.name} was signed ${yearsEarly}yr ahead of his real move to ${realDestName}; asked to deliver before he was ready, his ceiling slips (−${erosion}) — he may not reach the player he became in reality.`,
  });
  logEvent(state, {
    category: 'development',
    code: 'development.premature',
    message: `${player.name} moved ${yearsEarly}yr early — development ceiling eroded (−${erosion}); he may not fulfil his real potential`,
    data: { playerId: player.id, yearsEarly, erosion, realDest },
  });
  return true;
}
