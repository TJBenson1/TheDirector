/**
 * Ageing & decline (§5, §17.4). Applied once per season at the July rollover.
 *
 * Position-specific decline curves that can BREAK SUDDENLY (post-30 collapse
 * rolls) — rewarding "sell at peak" judgment and punishing holding too long.
 * Contextual *development* (young players growing toward their ceiling) is the
 * M5 signature system; M4 owns the decline half so squads age realistically
 * and dominance erodes over a career.
 */

import type { GameState, Position, PlayerState } from './types.js';
import { Rng } from './rng.js';
import { logEvent } from './eventLog.js';
import { clubSquadPlayers, recomputeClubStrength, overstackedStars } from './players.js';

/** Age at which decline begins, by position group (keepers last longest). */
const DECLINE_START: Record<Position, number> = {
  GK: 34,
  CB: 32,
  LB: 31,
  RB: 31,
  DM: 31,
  CM: 30,
  AM: 30,
  LW: 29,
  RW: 29,
  ST: 30,
};

function declineStartFor(positions: Position[]): number {
  // Use the most forgiving of the player's positions.
  return Math.max(...positions.map((p) => DECLINE_START[p]));
}

/**
 * Age the world by one season: apply decline to players past their curve, with
 * rare sudden collapses. Recomputes strength for simulated clubs afterwards.
 * Also nudges morale by last season's club success (light — full happiness/
 * agency is M6).
 */
export function processSeasonAgeing(state: GameState, rng: Rng): void {
  const year = Number(state.clock.date.slice(0, 4));
  const ageRng = rng.fork(`ageing:${year}`);

  for (const club of Object.values(state.clubs)) {
    let changed = false;
    for (const player of clubSquadPlayers(state, club.id)) {
      const age = year - player.birthYear;
      const start = declineStartFor(player.positions);
      if (age < start) continue;

      const yearsPast = age - start;
      // Gentle base decline that steepens with age.
      let drop = 1 + Math.floor(yearsPast / 2) + (ageRng.chance(0.5) ? 1 : 0);

      // Post-30 sudden collapse: a rare, sharp fall (the "held him too long" trap).
      if (age >= 31 && ageRng.chance(0.09)) {
        drop += ageRng.int(4, 8);
        logEvent(state, {
          category: 'development',
          code: 'decline.collapse',
          message: `${player.name} (${club.name}, ${age}) declines sharply`,
          data: { playerId: player.id, clubId: club.id, age },
        });
      }

      player.ability = Math.max(28, player.ability - drop);
      player.potentialCeiling = Math.max(player.ability, player.potentialCeiling);
      changed = true;
    }
    if (changed && club.leagueId !== null) recomputeClubStrength(state, club.id);
  }
}

// The age a player hangs up his boots, before personality/position adjustment. A
// keeper plays years longer; a true professional squeezes out a season or two more.
// Set past the typical 15-year career window so a normal save keeps its real spine
// and only the true long-horizon (25-year) run sheds and refreshes a generation.
const BASE_RETIRE_AGE = 37;

/** Position group's retirement bonus (keepers last far longer). */
export function retireAgeFor(positions: Position[], professionalism: number): number {
  const gk = positions.includes('GK') ? 3 : 0;
  const defender = positions.some((p) => p === 'CB') ? 1 : 0;
  const pro = Math.round((professionalism - 6) * 0.3);
  return BASE_RETIRE_AGE + gk + defender + pro;
}

/**
 * How far a player's CURRENT level shifts his retirement age — the reality that
 * hanging up the boots tracks DECLINE, not just the calendar. A still-elite
 * veteran plays deep into his late thirties or beyond (Maldini, Buffon, Giggs);
 * a player who has faded to fringe quality bows out earlier rather than soldier
 * on at 41 barely able to play. Centred on 0 for a solid top-flight regular.
 */
function retireAbilityShift(ability: number): number {
  if (ability >= 84) return 2; // still excellent — plays on
  if (ability >= 74) return 0; // a dependable regular — the baseline
  if (ability >= 64) return -1;
  if (ability >= 54) return -3;
  return -5; // clearly faded — hangs it up rather than limp on for years
}

/**
 * Probability a player retires this summer. Retirement opens as he approaches his
 * DECLINE-ADJUSTED age (position + professionalism + current level), never before
 * a hard floor of 32 so no one leaves in their twenties, and ramps to near-certain
 * a few seasons later. A great at 84+ can push into his forties; a faded squad man
 * bows out in his mid-thirties.
 */
function retirementProbability(player: PlayerState, age: number): number {
  const effectiveRetireAge =
    retireAgeFor(player.positions, player.personality.professionalism) + retireAbilityShift(player.ability);
  const opensAt = Math.max(32, effectiveRetireAge - 3);
  if (age < opensAt) return 0;
  return Math.max(0, Math.min(1, (age - opensAt + 1) * 0.24));
}

/** The 23-slot squad-refresh template — a young graduate is generated into a
 *  position the squad most needs, cycling through this canonical spine. */

/**
 * Retirement & youth regeneration (§5, long-horizon world coherence). Applied at
 * the July rollover AFTER decline, so the world doesn't ossify into a squad of
 * fifty-year-olds over a 25-year save. Veterans hang up their boots around their
 * late thirties (keepers later, true pros a touch later still), and each club
 * refreshes with home-grown youth so squads stay a realistic age pyramid rather
 * than the frozen kickoff generation slowly aching into their sixties.
 *
 * The real next generation — a Rooney, a Messi — arrives via the ledger's
 * authored academyIntakes. There is NO procedural regeneration (no regens, real
 * youth only): a retiree simply leaves, and the squad depth his exit opens is
 * carried by the abstract depth term in the strength calc, not by an invented
 * academy body. Squads thin toward their real, named spine over a long save
 * rather than being padded back out with fabricated names.
 */
export function processRetirementsAndYouth(state: GameState, rng: Rng): void {
  const year = Number(state.clock.date.slice(0, 4));
  const rr = rng.fork(`retire:${year}`);

  for (const club of Object.values(state.clubs)) {
    // Retirements — collect first, then remove (don't mutate while iterating).
    const retirees = [];
    for (const player of clubSquadPlayers(state, club.id)) {
      const prob = retirementProbability(player, year - player.birthYear);
      // Only players in the retirement window draw — a young player never consumes
      // an RNG draw (keeps the stream stable and cheap).
      if (prob > 0 && rr.chance(prob)) retirees.push(player);
    }
    for (const player of retirees) {
      // Remove from the squad but KEEP `club` (his final club is his reality — the
      // ledger/fidelity record that "he reached real_madrid" must still read true).
      // Filtered out of the market and selection via the `retired` flag.
      club.squad = club.squad.filter((id) => id !== player.id);
      player.retired = true;
      delete state.pursuit[player.id];
      logEvent(state, {
        category: 'development',
        code: 'player.retired',
        message: `${player.name} retires from football at ${year - player.birthYear}`,
        data: { playerId: player.id, clubId: club.id, age: year - player.birthYear },
      });
    }

    if (retirees.length && club.leagueId !== null) recomputeClubStrength(state, club.id);
  }
}

/**
 * Contract management at the summer rollover (real free agency, part 1). A club
 * renews the players it wants to keep — a genuine squad member not yet in his
 * mid-30s whose deal is running down — extending it to a fresh multi-year contract.
 * This is what keeps a long save's contract data sane: valued players stay tied
 * down instead of every deal silently lapsing and reading as "expired" a decade on.
 *
 * Pure arithmetic — no RNG, no squad change — so a passive/reality run is
 * byte-identical and the calibration harness is untouched. A veteran (34+) is left
 * to run his deal down toward retirement, and deep-fringe filler is allowed to lapse
 * (realistic churn, no invented free agents). The physical DEPARTURE of a lapsed
 * player is a separate, squad-changing step handled elsewhere.
 */
export function processContractRenewals(state: GameState): void {
  const year = Number(state.clock.date.slice(0, 4));
  for (const club of Object.values(state.clubs)) {
    // The DIRECTOR handles his own club's renewals inside the window (the final
    // warning + the phase-2 lifecycle), so he can choose to let a man walk — the
    // AI keeps its own house here.
    if (club.id === state.playerClub) continue;
    for (const player of clubSquadPlayers(state, club.id)) {
      if (player.retired) continue;
      if (player.contractUntil > year + 1) continue; // not running down yet
      const age = year - player.birthYear;
      if (age >= 34) continue; // a veteran is left to run down toward retirement
      if (player.ability < club.strength - 15) continue; // deep fringe — allowed to lapse
      player.contractUntil = year + 3; // a keeper gets a fresh deal
    }
  }
}

/**
 * The USER club's contract lifecycle at the window's SECOND phase (§3, real free
 * agency part 2). By now the Director has had the final warning and the renewal
 * calls. Reality-default holds: any expiring deal he DIDN'T explicitly let lapse is
 * renewed by the club (so a passive/reality run keeps its whole squad and the
 * calibration harness — which never sets the lapse flag — is untouched). A player
 * he DID choose to let go, whose deal is now up, LEAVES on a free — a genuine
 * Bosman exit into free agency. Returns the names who walked, for the narrator.
 */
export function processContractLifecycle(state: GameState): string[] {
  const club = state.clubs[state.playerClub];
  if (!club) return [];
  const year = Number(state.clock.date.slice(0, 4));
  const walked: string[] = [];
  for (const player of [...clubSquadPlayers(state, state.playerClub)]) {
    if (player.retired) continue;
    if (player.letLapse && player.contractUntil <= year) {
      // He walks: out of the squad and onto the free market (club = null), the
      // Director's own choice to let his deal run down.
      club.squad = club.squad.filter((id) => id !== player.id);
      player.club = null;
      player.letLapse = false;
      delete state.pursuit[player.id];
      walked.push(player.name);
      logEvent(state, {
        category: 'transfer',
        code: 'contract.bosman.out',
        message: `${player.name} leaves ${club.name} on a free — his contract ran down and was not renewed`,
        data: { playerId: player.id, from: club.id },
      });
    } else if (!player.letLapse && player.contractUntil <= year + 1) {
      // Reality-default: a deal left untouched is renewed — the Director never loses
      // a man to pure inattention (and the passive world holds its squad). A man he
      // chose to let lapse is NOT renewed; he runs his deal down toward a free exit.
      player.contractUntil = year + 3;
    }
  }
  if (walked.length) recomputeClubStrength(state, club.id);
  return walked;
}

/**
 * Light end-of-season morale drift from league finish (§17.4 stub; §6/M6 owns
 * the full happiness → departure loop). Winners' squads lift; strugglers dip.
 */
export function processSeasonMorale(state: GameState): void {
  for (const league of Object.values(state.leagues)) {
    if (league.titleHistory.length === 0) continue;
    const champ = league.titleHistory[league.titleHistory.length - 1]!.championId;
    for (const clubId of league.clubIds) {
      const delta = clubId === champ ? 4 : 0;
      if (delta === 0) continue;
      for (const player of clubSquadPlayers(state, clubId)) {
        player.morale = Math.max(0, Math.min(100, player.morale + delta));
      }
    }
  }
}

/**
 * Over-stacking's human cost (§ chemistry): the stars a bloated squad can't field
 * chafe and unsettle. Each season on the bench sours their morale and grows their
 * agitation — which the existing agitation system may turn into a forced exit, so a
 * hoarded galáctico glut tends to shed its surplus and rebalance, as the real
 * Galácticos and MSN-era PSG did. Only over-stacked clubs are touched; a balanced
 * squad has no surplus and is untroubled.
 */
export function processOverstackUnrest(state: GameState): void {
  for (const club of Object.values(state.clubs)) {
    if ((club.chemistryPenalty ?? 0) <= 0) continue;
    const surplus = overstackedStars(state, club.id);
    if (surplus.length === 0) continue;
    // Outpace the ordinary agitation decay (a persistent glut is not a one-off
    // snub), so a star kept surplus season on season builds toward forcing an exit.
    for (const p of surplus) {
      p.agitation = Math.max(0, Math.min(100, p.agitation + 32));
      p.morale = Math.max(0, Math.min(100, p.morale - 8));
    }
    logEvent(state, {
      category: 'development',
      code: 'squad.overstacked',
      message: `${club.name}'s squad is bloated — ${surplus.map((p) => p.name).join(', ')} chafe at the lack of minutes.`,
      data: { clubId: club.id, players: surplus.map((p) => p.id), penalty: Number((club.chemistryPenalty ?? 0).toFixed(1)) },
    });
  }
}
