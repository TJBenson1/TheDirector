/**
 * Engine operations as narrator TOOLS.
 *
 * Each op runs a pure @director/engine transition on a passed-in state and
 * returns `{ state, result }` — the result is compact data the narrator turns
 * into prose. `TOOL_SCHEMAS` describes the same ops to the language model.
 */

import {
  createNewGame,
  advanceWindow,
  applyDecision,
  attemptSigning,
  executeTransfer,
  scoutPlayer,
  suggestTargets,
  resolvePlayer,
  askingPrice,
  realDepartureThisWindow,
  evaluateApproach,
  coachFit,
  currentYear,
  suggestWage,
  narrativeContext,
  coachBriefing,
  managerRoom,
  midSeasonForm,
  europeanCampaign,
  appointCoach,
  coachArchetypes,
  standingsOrder,
  clubSquadPlayers,
  isProcedural,
  applyConsequence,
  rippleSaleSatesNeed,
  SCENARIOS,
  Rng,
  type GameState,
  type Position,
} from '@director/engine';

const m = (n: number) => `£${(n / 1_000_000).toFixed(1)}m`;
type Op = { state: GameState; result: unknown };

function jitter(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 100;
}

export function listScenarios() {
  return Object.values(SCENARIOS).map((sc) => ({ id: sc.id, name: sc.name, startDate: sc.startDate, mandate: sc.mandate }));
}

export function situationOf(s: GameState) {
  const club = s.clubs[s.playerClub]!;
  return {
    status: { club: club.name, date: s.clock.date, window: s.clock.window, budget: m(club.finances.transferBudget) },
    situation: narrativeContext(s),
    pendingDecisions: s.pendingDecisions.map((d) => ({ id: d.id, title: d.title, choices: d.choices.map((c) => ({ id: c.id, label: c.label })) })),
  };
}

/** Run a named tool against `state`. Returns the (possibly new) state + a result. */
export function runOp(state: GameState, name: string, input: Record<string, unknown>): Op {
  const s = state;
  switch (name) {
    case 'list_scenarios':
      return { state: s, result: listScenarios() };

    case 'new_game': {
      const next = createNewGame({ scenarioId: String(input.scenarioId), seed: input.seed ? String(input.seed) : `web:${Date.now()}` });
      return { state: next, result: situationOf(next) };
    }

    case 'situation':
      return { state: s, result: situationOf(s) };

    case 'advance': {
      const before = s.meta.nextSeq;
      const { state: next, events } = advanceWindow(s, { pausePerStep: true });
      return {
        state: next,
        result: {
          now: { date: next.clock.date, window: next.clock.window, step: next.clock.windowStep },
          events: events.filter((e) => e.seq >= before).map((e) => e.message),
          pendingDecisions: next.pendingDecisions.map((d) => ({ id: d.id, title: d.title, choices: d.choices.map((c) => ({ id: c.id, label: c.label })) })),
        },
      };
    }

    case 'manager_meeting':
      return { state: s, result: coachBriefing(s) };

    case 'manager_room':
      return { state: s, result: managerRoom(s) };

    case 'squad_form':
      return { state: s, result: midSeasonForm(s) };

    case 'europe':
      return { state: s, result: europeanCampaign(s) };

    case 'change_coach': {
      const styles = coachArchetypes();
      // If no style is named, list the choices rather than guessing.
      if (!input.style && !input.name) {
        return { state: s, result: { chooseFrom: styles.map((c) => ({ style: c.archetype, plays: c.style, formation: c.formation })) } };
      }
      const wanted = String(input.style ?? '').toLowerCase().replace(/\s+/g, '-');
      const match = styles.find((c) => c.archetype === wanted);
      appointCoach(s, {
        identity: input.name ? String(input.name) : undefined,
        archetype: match?.archetype,
        formation: input.formation ? (String(input.formation) as any) : undefined,
      });
      const c = s.managerRelations;
      return { state: s, result: { ok: true, coach: c.identity, style: c.archetype, formation: c.preferredFormation } };
    }

    case 'squad': {
      const year = currentYear(s);
      return {
        state: s,
        result: clubSquadPlayers(s, s.playerClub).sort((a, b) => b.ability - a.ability).map((p) => ({
          id: p.id, name: p.name, positions: p.positions, age: year - p.birthYear, ability: p.ability, morale: p.morale, contractUntil: p.contractUntil, wageWeekly: `£${Math.round(p.wage / 52 / 1000)}k/wk`, injured: !!p.injury,
        })),
      };
    }

    case 'league_table': {
      const club = s.clubs[s.playerClub]!;
      const league = club.leagueId ? s.leagues[club.leagueId] : undefined;
      if (!league) return { state: s, result: [] };
      const order = league.roundsPlayed === 0 ? [...league.clubIds].sort((a, b) => s.clubs[b]!.strength - s.clubs[a]!.strength) : standingsOrder(league);
      return { state: s, result: order.map((id, i) => ({ pos: i + 1, club: s.clubs[id]?.name ?? id, points: league.standings[id]?.points ?? 0, played: league.standings[id]?.played ?? 0, isYou: id === s.playerClub })) };
    }

    case 'resolve_decision': {
      const { state: next, events, success } = applyDecision(s, String(input.decisionId), String(input.choiceId));
      return { state: next, result: { success, events: events.map((e) => e.message) } };
    }

    case 'list_targets': {
      const pos = String(input.position) as Position;
      const maxPrice = input.maxPriceM !== undefined ? Number(input.maxPriceM) * 1_000_000 : undefined;
      // `young: true` → prospect mode: rank by scouted UPSIDE, not present ability,
      // so a request for young talent surfaces teenagers with a ceiling, not 30-yos.
      const prospects = Boolean(input.young);
      const targets = suggestTargets(s, pos, { maxPrice, maxResults: 12, prospects }).map((t) => {
        const p = s.players[t.playerId];
        const fit = p ? coachFit(s.managerRelations, p) : undefined;
        return { playerId: t.playerId, name: t.name, club: t.clubName, age: t.age, positions: p?.positions ?? [], askingPrice: m(t.askingPrice), ability: t.ability, tags: t.tags, willing: t.willing, coach: fit ? `${fit.verdict}: ${fit.reason}` : undefined, exact: (p?.positions ?? []).includes(pos) };
      });
      targets.sort((a, b) => Number(b.exact) - Number(a.exact));
      return { state: s, result: targets };
    }

    case 'find_player': {
      const p = resolvePlayer(s, String(input.name));
      if (!p) return { state: s, result: { found: false } };
      const fit = coachFit(s.managerRelations, p);
      // YOUR OWN player has no asking price TO YOU — you already own him. Returning
      // one made the narrator invent "pay £6.5m to keep Baggio", which is nonsense:
      // keeping your own man costs no fee. Report his standing instead, and if
      // reality has him leaving this window, frame the real keep/sell call plainly.
      if (p.club === s.playerClub) {
        const dep = realDepartureThisWindow(s).find((d) => d.playerId === p.id);
        // Prefer a live pending decision (once the window has opened) so the narrator
        // can resolve it directly; else point at how to action it.
        const pending = s.pendingDecisions.find((d) => d.id.startsWith('real-out:') && (d.memoryTags ?? []).includes(p.id));
        return {
          state: s,
          result: {
            found: true,
            yours: true,
            playerId: p.id,
            name: p.name,
            club: s.clubs[p.club]?.name,
            age: currentYear(s) - p.birthYear,
            positions: p.positions,
            contractUntil: p.contractUntil,
            morale: p.morale,
            coach: `${fit.verdict}: ${fit.reason}`,
            ...(dep
              ? {
                  realDeparture: {
                    toClub: dep.toClub,
                    sellBanks: m(dep.fee),
                    // A coach-castoff (Lippi/Baggio) is the COACH's call, not the
                    // player agitating to leave — keeping him overrules the coach.
                    keepCost: (s.managerRelations.castoffs ?? []).includes(p.name)
                      ? `nothing — keeping him costs NO transfer fee; you simply block the move. But this is a sale ${s.managerRelations.identity} wants: keep ${p.name} and you overrule your coach and strain that relationship.`
                      : 'nothing — keeping your own player costs NO transfer fee; you simply block the move. He wanted to go, so expect him to be unsettled.',
                    note: (s.managerRelations.castoffs ?? []).includes(p.name)
                      ? `This is the window ${p.name} really left for ${dep.toClub} — a sale ${s.managerRelations.identity} pushed for. Sanction it to bank ${m(dep.fee)}, or overrule your coach and keep him (no fee, but the friction festers).`
                      : `This is the window ${p.name} really left for ${dep.toClub}. Sanction the sale to bank ${m(dep.fee)}, or keep him for free (he sulks, since he wanted the move).`,
                    ...(pending
                      ? { decisionId: pending.id, keepChoiceId: 'keep', sellChoiceId: 'sell' }
                      : { howToAction: 'When the window opens (advance), his sale comes up as a keep/sell decision — resolve it as keep to retain him. Doing nothing lets reality hold and he leaves.' }),
                  },
                }
              : {}),
          },
        };
      }
      const verdict = evaluateApproach(s, { playerId: p.id, toClub: s.playerClub });
      const age = currentYear(s) - p.birthYear;
      const clubName = p.club ? s.clubs[p.club]?.name ?? p.club : 'Free agent';
      const rising = p.potentialCeiling - p.ability >= 5 && age <= 23;
      return {
        state: s,
        result: {
          found: true,
          // He IS on our radar — the scouts know exactly where he is and what he'd
          // take. Report this; never say there's "no file" on a player we found.
          onRadar: true,
          summary: `${p.name}, ${age}, ${clubName}${rising ? ' — a rising talent' : ''}. ${verdict.reason}`,
          playerId: p.id,
          name: p.name,
          club: clubName,
          age,
          positions: p.positions,
          askingPrice: m(askingPrice(s, p.id)),
          willing: verdict.willing,
          resistanceReason: verdict.reason,
          coach: `${fit.verdict}: ${fit.reason}`,
        },
      };
    }

    case 'scout': {
      const rng = new Rng(s.meta.rngState).fork(`scout:web:${input.playerId}`);
      return { state: s, result: scoutPlayer(s, s.playerClub, String(input.playerId), rng, { observation: 0.6 }) };
    }

    case 'sign': {
      const p = s.players[String(input.playerId)];
      // Realism floor: a player still under contract can't be prised from his club
      // for less than his asking price — which already bakes in the near-expiry
      // (Bosman) discount and any distress. No taking a contracted player for
      // nothing in January; a genuine free applies only to an actual free agent.
      const floor = p && p.club && p.club !== s.playerClub ? askingPrice(s, p.id) : 0;
      const raw = input.feeM !== undefined ? Math.round(Number(input.feeM) * 1_000_000) : undefined;
      const fee = raw !== undefined ? Math.max(raw, floor) : floor > 0 ? floor : undefined;
      const result = attemptSigning(s, { playerId: String(input.playerId), toClub: s.playerClub, fee });
      return { state: s, result: result.ok ? { ok: true, signed: s.players[String(input.playerId)]?.name, fee: m(result.fee) } : { ok: false, reason: result.reason } };
    }

    case 'offers': {
      const p = s.players[String(input.playerId)];
      if (!p || p.club !== s.playerClub) return { state: s, result: { offers: [], reason: 'Not your player.' } };
      // Reality-anchored value: askingPrice uses the real sale fee when the ledger
      // knows it (Baggio → Milan was £6.5m, not his £14m abstract model value), so
      // an offer never inflates a departure the history books already priced.
      const value = askingPrice(s, p.id);
      const offers = Object.values(s.clubs)
        .filter((c) => c.id !== s.playerClub && c.leagueId !== null && c.strength >= p.ability - 13 && c.strength <= p.ability + 5 && c.finances.transferBudget >= value * 0.5)
        .map((c) => ({ clubId: c.id, club: c.name, fee: Math.round(Math.min(c.finances.transferBudget, value * (0.6 + (jitter(c.id + p.id) / 100) * 0.35))) }))
        .sort((a, b) => b.fee - a.fee).slice(0, 4).map((o) => ({ ...o, feeLabel: m(o.fee) }));
      return { state: s, result: { player: p.name, marketValue: m(value), offers } };
    }

    case 'sell': {
      const p = s.players[String(input.playerId)];
      if (!p || p.club !== s.playerClub) return { state: s, result: { ok: false, reason: 'Not your player.' } };
      const buyer = s.clubs[String(input.toClub)];
      if (!buyer) return { state: s, result: { ok: false, reason: 'Unknown buying club.' } };
      // Never sell for £0 because the fee arrived missing/garbled — fall back to
      // the reality-anchored asking price so a fumbled number can't give a player
      // away (and matches the real fee when the ledger knows it).
      const rawFee = Number(input.fee);
      const fee = Number.isFinite(rawFee) && rawFee > 0 ? Math.round(rawFee) : askingPrice(s, p.id);
      // Clubs have REAL budgets — a buyer that can't afford the fee doesn't get
      // topped up. Reject clearly so the Director can pick a buyer who can pay or
      // sell fewer players (e.g. "Roma can take one, not both"), rather than the
      // sale silently failing or the world handing out unrealistic money.
      if (fee > buyer.finances.transferBudget) {
        return {
          state: s,
          result: {
            ok: false,
            reason: `${buyer.name} can't afford ${m(fee)} — their budget is ${m(buyer.finances.transferBudget)}. Drop the fee to what they can pay, or find another buyer (check offers).`,
            buyerBudget: m(buyer.finances.transferBudget),
          },
        };
      }
      const result = executeTransfer(s, { playerId: p.id, toClub: buyer.id, fee });
      // Selling to a club can sate a real need — cancelling their same-position
      // ledger signing with a traceable butterfly (the mirror of the raid-ripple).
      const sated = result.ok ? rippleSaleSatesNeed(s, buyer.id, p.id) : null;
      return {
        state: s,
        result: result.ok
          ? {
              ok: true,
              sold: p.name,
              to: buyer.name,
              fee: m(result.fee),
              newBudget: m(s.clubs[s.playerClub]!.finances.transferBudget),
              ...(sated ? { ripple: `${buyer.name} now no longer need to sign ${sated.cancelled} — you've filled their gap.` } : {}),
            }
          : { ok: false, reason: result.reason },
      };
    }

    case 'renew': {
      const p = s.players[String(input.playerId)];
      if (!p || p.club !== s.playerClub) return { state: s, result: { ok: false, reason: 'Not your player.' } };
      const n = Math.max(1, Math.min(5, Math.round(Number(input.years ?? 3))));
      const wageBefore = p.wage;
      applyConsequence(s, { kind: 'renewContract', playerId: p.id, amount: n });
      // A new deal is never free: the market rate for his ability, and a status rise
      // that grows with the length of the deal (see the /games/renew endpoint).
      const statusRise = Math.round(wageBefore * (1 + 0.06 * n));
      p.wage = Math.max(p.wage, statusRise, suggestWage(p, currentYear(s)));
      const wk = (annual: number) => Math.round(annual / 52 / 1000);
      return {
        state: s,
        result: {
          ok: true, player: p.name, contractUntil: s.players[p.id]?.contractUntil,
          newWageWeekly: `£${wk(p.wage)}k/wk`, previousWageWeekly: `£${wk(wageBefore)}k/wk`,
          note: `A new deal costs a rise — ${p.name} moves to £${wk(p.wage)}k/wk (from £${wk(wageBefore)}k/wk).`,
        },
      };
    }

    case 'let_lapse': {
      const p = s.players[String(input.playerId)];
      if (!p || p.club !== s.playerClub) return { state: s, result: { ok: false, reason: 'Not your player.' } };
      applyConsequence(s, { kind: 'letContractLapse', playerId: p.id });
      return { state: s, result: { ok: true, player: p.name, note: `${p.name}'s deal will run down — he leaves on a free at the next summer window unless you renew him first.` } };
    }

    case 'free_agents': {
      const yr = currentYear(s);
      const wantPos = input.position ? (String(input.position) as Position) : null;
      return {
        state: s,
        result: Object.values(s.players)
          .filter((p) => !isProcedural(p) && !p.retired && p.club !== s.playerClub && p.contractUntil <= yr + 1)
          .filter((p) => !wantPos || p.positions.includes(wantPos))
          .sort((a, b) => b.ability - a.ability).slice(0, 12)
          .map((p) => ({ playerId: p.id, name: p.name, club: p.club ? s.clubs[p.club]?.name : 'Free agent', age: yr - p.birthYear, positions: p.positions, expires: p.contractUntil })),
      };
    }

    default:
      return { state: s, result: { error: `Unknown tool ${name}` } };
  }
}

const POS = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];

/** Anthropic tool definitions for the same ops. */
export const TOOL_SCHEMAS = [
  { name: 'list_scenarios', description: 'List playable starting points (club + season + mandate).', input_schema: { type: 'object', properties: {} } },
  { name: 'new_game', description: 'Start a new career at a scenario id.', input_schema: { type: 'object', properties: { scenarioId: { type: 'string' }, seed: { type: 'string' } }, required: ['scenarioId'] } },
  { name: 'situation', description: 'Current story: club, board mood, coach, squad tensions, open decisions.', input_schema: { type: 'object', properties: {} } },
  { name: 'manager_meeting', description: "The head coach's briefing: his mood, the club's priority (league/Europe/both), the shape he wants, his best XI, players he isn't sold on, positions to strengthen, and concrete targets. Use it for the opening manager meeting and whenever the Director asks the coach's view.", input_schema: { type: 'object', properties: {} } },
  { name: 'manager_room', description: "The head coach's full dashboard: his happiness, playing style and formation, first-choice XI (top performers marked), position-by-position depth chart, rising stars and whether they're getting minutes to develop, concerns (age/form/happiness/injury/contract), and his transfer wishlist in and out. Use when the Director asks about the squad, the coach's plans, who's developing, who to sell, or the state of the dressing room.", input_schema: { type: 'object', properties: {} } },
  { name: 'squad_form', description: "A MID-SEASON form report on the Director's own players — a SITUATION-driven read, not just ability: each man's minutes%, projected goals & assists, an impact rating, starter or not, and a flag/note. Flags: flying (real attacking output), solid, struggling, fringe (barely playing), injured, and three situational stories the engine engineers around a player's circumstances — ADAPTING (a signing from a foreign league still settling, a story of time not talent), MISFIT (a talent the coach can't fit into his system — great player, wrong shape), and LOGJAM (a good player stuck in a position the Director has OVERSTOCKED, chafing on the bench). Use whenever the Director asks how his players/signings are performing, who's scoring/assisting/getting minutes, who's struggling to settle or fit, or who's frustrated. Lead with the notable stories.", input_schema: { type: 'object', properties: {} } },
  { name: 'europe', description: "The continental cup (Champions League / European Cup) this season: whether the club is in it, how the group stage went (cruised through / a close shave), the phase, and the tournament favourites with reasons. Use whenever the Director asks how Europe / the Champions League is going.", input_schema: { type: 'object', properties: {} } },
  { name: 'change_coach', description: "Appoint a new head coach — the Director's prerogative, so it always goes through. Call with no arguments to list the playing styles to choose from; then call again with a style (and optionally a name and formation) to make the change. Never refuse a coach change.", input_schema: { type: 'object', properties: { style: { type: 'string', description: 'possession | gegenpress | pragmatic-counter | defensive-block | man-manager | balanced' }, name: { type: 'string', description: "the new coach's name (optional)" }, formation: { type: 'string' } }, required: [] } },
  { name: 'advance', description: 'Move time forward one step (window phase or month). Returns what happened + new decisions.', input_schema: { type: 'object', properties: {} } },
  { name: 'squad', description: 'Your full squad with age, ability, morale, contract, wages.', input_schema: { type: 'object', properties: {} } },
  { name: 'league_table', description: 'The current league table.', input_schema: { type: 'object', properties: {} } },
  { name: 'resolve_decision', description: 'Answer an open decision by id + choice id.', input_schema: { type: 'object', properties: { decisionId: { type: 'string' }, choiceId: { type: 'string' } }, required: ['decisionId', 'choiceId'] } },
  { name: 'list_targets', description: 'Realistic scouted transfer targets for a position (fogged ability, price, willingness, coach read). Set young:true for PROSPECTS — young players ranked by upside, for a "wonderkid"/"young talent"/"one for the future" request.', input_schema: { type: 'object', properties: { position: { type: 'string', enum: POS }, maxPriceM: { type: 'number' }, young: { type: 'boolean' } }, required: ['position'] } },
  { name: 'find_player', description: 'Look up a specific/dream target by name.', input_schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
  { name: 'scout', description: 'A sharper scouting report on a player id.', input_schema: { type: 'object', properties: { playerId: { type: 'string' } }, required: ['playerId'] } },
  { name: 'sign', description: 'Sign a player to your club (optional fee in £m). May be refused.', input_schema: { type: 'object', properties: { playerId: { type: 'string' }, feeM: { type: 'number' } }, required: ['playerId'] } },
  { name: 'offers', description: 'Who would buy one of your players, and for how much.', input_schema: { type: 'object', properties: { playerId: { type: 'string' } }, required: ['playerId'] } },
  { name: 'sell', description: 'Sell your player to a club for a fee (from offers).', input_schema: { type: 'object', properties: { playerId: { type: 'string' }, toClub: { type: 'string' }, fee: { type: 'number' } }, required: ['playerId', 'toClub', 'fee'] } },
  { name: 'renew', description: "Extend one of your players' contracts by 1-5 years.", input_schema: { type: 'object', properties: { playerId: { type: 'string' }, years: { type: 'number' } }, required: ['playerId', 'years'] } },
  { name: 'let_lapse', description: "Choose NOT to renew a player — let his contract run down so he leaves on a free at the next summer window (real free agency). Reverse it any time before then by renewing him.", input_schema: { type: 'object', properties: { playerId: { type: 'string' } }, required: ['playerId'] } },
  { name: 'free_agents', description: 'Players out of contract next summer, optionally by position.', input_schema: { type: 'object', properties: { position: { type: 'string', enum: POS } } } },
];
