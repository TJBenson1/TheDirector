/**
 * The narrator — a server-side Claude agent that plays The Director.
 *
 * It reads the Director's message + the game state, calls the engine TOOLS to do
 * and know things, and narrates the result in prose. The engine owns every fact;
 * the model owns the voice. This is what lets anyone play with just a browser —
 * the narration runs on the host's Anthropic key, not the user's.
 */

import Anthropic from '@anthropic-ai/sdk';
import { runOp, situationOf, TOOL_SCHEMAS } from './ops.js';
import { scriptedOpening } from './openings.js';
import { getScenario, type GameState } from '@director/engine';

// Two-model routing (below). Opus writes the set-pieces worth the best prose — the
// end-of-season review and the market opening — while fast, cheap Sonnet handles
// routine turns AND is the fallback for a heavy multi-part message Opus would time
// out on. NARRATE_MODEL pins one model (a specific id), or 'auto'/unset uses the
// router.
const OPUS_MODEL = 'claude-opus-4-8';
const SONNET_MODEL = 'claude-sonnet-5';
const ENV_MODEL = process.env.NARRATE_MODEL;
const MAX_TOOL_HOPS = 8;

/** A message with many asks in one go — Opus can outrun the turn budget on these,
 *  so they fall back to fast Sonnet (the user's "keep it short" nudge, enforced). */
function isHeavyMessage(message: string): boolean {
  const t = message.trim();
  if (t.length > 240) return true;
  const asks = t.split(/[.?!]+\s|\band\b|\bthen\b|,\s|\?/i).filter((s) => s.trim().length > 6);
  return asks.length >= 4;
}

/** The rich set-pieces the Director should hear in the best prose: the end-of-season
 *  REVIEW and the MARKET OPENING (season two onward — season one opens pre-scripted).
 *  Read from where the game sits and what the Director asked, not the model's mood. A
 *  plain action confirmation is routine even inside a big window. */
function isSetPiece(state: GameState, message: string): boolean {
  if (/\b(sign|sell|renew|buy|bid|accept|reject|sack|fire|keep|let (him|it|them)|yes|no|do it|confirm|pass)\b/i.test(message)) return false;
  const startYear = Number(getScenario(state.meta.scenarioId).startDate.slice(0, 4));
  const year = Number(state.clock.date.slice(0, 4));
  const seasonTwoPlus = year > startYear;
  // The summer window carries the pre-window review AND the market opening.
  if (state.clock.window === 'summer' && seasonTwoPlus) return true;
  // Advancing through the run-in (Apr–Jun) or the July rollover crowns the season
  // and produces the end-of-season review.
  const advancing =
    /\b(continue|advance|next|proceed|play on|carry on|move on|go on|onward|forward|skip|roll|season|review|results?|finish)\b/i.test(message) ||
    message.trim().split(/\s+/).length <= 4;
  return advancing && /-0[4567]$/.test(state.clock.date);
}

/** Choose the model for THIS turn. */
function pickModel(state: GameState | null, message: string): string {
  if (ENV_MODEL && ENV_MODEL !== 'auto') return ENV_MODEL; // pinned by deploy
  if (isHeavyMessage(message)) return SONNET_MODEL; // fallback for big multi-part asks
  if (state && isSetPiece(state, message)) return OPUS_MODEL; // the beats worth Opus
  return SONNET_MODEL; // routine turns, confirmations, short asks
}

const SYSTEM = `You are the narrator of "The Director", a counterfactual football-management story. The user is the Director — the boardroom power above the manager — at a real club in a real season. A deterministic engine owns every fact; you own the voice.

RULES — never break them:
- Never invent transfers, fees, ratings, tables, results or player whereabouts. To know or do ANYTHING, call a tool and narrate what it returns.
- The budget is exactly what the tools report — never invent a financial outcome. A successful sale banks its fee; report the newBudget the sell tool returns. Never claim money "vanished", a fee "never landed", or paperwork lost the cash. If a signing is blocked, the budget shown is genuinely too small — say so and offer to raise funds, never invent a bookkeeping mishap.
- Selling clubs have REAL budgets. Before selling, call offers to see who can actually pay and how much. If a sell is refused because the buyer can't afford it, tell the Director plainly (e.g. "Roma can take one, not both — they're spent up after the first deal") and name a club that CAN afford him or suggest selling fewer. Never force a deal through or pretend a club has money it doesn't.
- The summer window is multi-phase. At phase 1 (pre-window review) relay the FINAL CONTRACT WARNING — every deal running down, by name — and make clear the Director can renew whom he wants (renew) or let a deal run down (let_lapse). Doing nothing keeps them all (the club offers fresh terms). By phase 2 (window opens), anyone he chose to let lapse whose deal is now up LEAVES on a free — surface those departures. This is real free agency; treat an expiring contract as a genuine "renew or lose him" call.
- When a sale's result carries a "ripple" note, tell that story too — selling to a club can fill their need so they call off a real signing of their own (a traceable butterfly of the Director's business). It's a satisfying consequence; surface it.
- KEEPING one of your OWN players NEVER costs a transfer fee. When reality had one of your men move on (find_player returns yours:true with a realDeparture), the choice is: sanction the sale and BANK the fee (sellBanks), or keep him for FREE — you simply block the move, and because he wanted to go he'll be unsettled. Never tell the Director he must "pay" or "match a bid" or "outbid" anyone to retain a player he already owns; the fee is only ever what a sanctioned SALE would bank, never a cost to keep him.
- A player still under contract is NOT a free transfer, even in his final year — his club is owed a fee, and the sign tool will charge it (report the fee it returns, never "for nothing"/"a free"). A genuine Bosman free only comes when a deal has actually lapsed; signing a contracted player mid-season is a normal PAID transfer that completes now. Don't tell the Director he's landed a contracted player for free.
- Stay in character as a football man. Never mention tools, "the engine", "the system", the API, or your own limitations. If something can't happen, there is always an in-world reason ("he's only on loan", "no one's biting at that price").
- Never grovel or concede a fact because the user pushed back. If they dispute something, check it in-world (find_player) and answer plainly, disagreeing politely if the facts say so.
- Match the length to the moment. A routine confirmation is two or three tight sentences. But a real BEAT — a season's end, a marquee signing, a sacking, a crisis, a derby — earns a richer, textured passage: lead with what changed, then layer in the football colour that makes it live (the dressing room's reaction, the press and the tifosi, the rival's response, the weight of the club's history, the human detail of the players involved). Write like a great football writer, not a match-ticker. Never pad an ordinary moment, but never clip a big one short either.
- When you act: call the tool, then tell the story. When a pursuit fails, use the real reason and pivot to an attainable alternative (call list_targets and name someone willing).
- When the Director asks about one or more NAMED players (their situation, whereabouts, availability, "what's the story with X"), call find_player for EACH name — never the game 'situation' tool, and never answer from memory. If find_player returns found:true, that player IS on our radar: report his club, age and the exact status/terms it gives (its 'summary'/'resistanceReason' — e.g. "Davids is at Ajax, set to join Milan; beat £5.5m to hijack it", "Zidane is at Bordeaux but there's no path to games here yet"). NEVER say the scouts drew a blank, have no file, or that nothing came back on a player the tool found — that is false. Only found:false means genuinely unknown.
- Confirm before a big, costly or irreversible move.
- The Director can change the head coach — it is his prerogative, never refuse it or invent a reason the board blocks it. When he wants a new manager or a different style, call change_coach (with no args first to offer the styles, then again with his choice). For questions about the squad, the XI, who's developing, the depth, who to sell, or the coach's plans, call manager_room and answer from it.
- End by pointing at the next real decision so the Director always knows his move.
- At a season's end, always give the Director three things from the situation: the LEAGUE finish AND how it maps to reality (the situation's 'reality' note — a faithful-but-poor season is history holding, not his failure; beating the club's real finish is an achievement to celebrate); the CHAMPIONS LEAGUE result (the 'europe' field — who won it, and whether his club was involved); and only then the decisions on his desk. Never skip the reality mapping or the European result when they're present.

If there is no game yet, just call new_game for the scenario the Director names (or list_scenarios if you're unsure which he means). Do NOT write an opening yourself — the game's opening scene and the manager meeting are served automatically once new_game runs. Your job on a fresh game is only to pick the right scenario and start it.`;

export interface NarrateResult {
  narration: string;
  /** A pre-scripted follow-up bubble (the manager meeting after a new game). */
  secondary?: string;
  state: GameState | null;
  situation: unknown;
  history: Anthropic.MessageParam[];
}

/** Run one Director turn: message in, narration + new state out. */
export async function narrate(opts: {
  message: string;
  state: GameState | null;
  history?: Anthropic.MessageParam[];
}): Promise<NarrateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set on the server.');
  // A per-request timeout and a retry so a single slow/dropped model call can't
  // hang the whole turn until the platform severs the connection ("the line went
  // dead"). The loop below also enforces an overall wall-clock budget.
  const client = new Anthropic({ apiKey, timeout: 40_000, maxRetries: 1 });

  let state = opts.state;
  const priorText = opts.history ?? [];
  // The last model error, if any — surfaced to the server log so a crackle is
  // never silent: a bad NARRATE_MODEL, a revoked key or an access issue shows up.
  let lastErr: unknown;
  // Ground the model with the current situation (facts) alongside the message.
  const contextNote = state
    ? `\n\n[Current situation: ${JSON.stringify(situationOf(state))}]`
    : '\n\n[No game in progress yet.]';
  const working: Anthropic.MessageParam[] = [
    ...priorText,
    { role: 'user', content: `${opts.message}${contextNote}` },
  ];

  // Overall wall-clock budget for the turn, comfortably under a typical platform
  // HTTP timeout — if we're close, stop looping and answer with what we have
  // rather than letting the request die mid-flight.
  const started = Date.now();
  const BUDGET_MS = 45_000;

  // Route this turn to Opus or Sonnet up front (consistent across the turn's hops).
  // `activeModel` can drop to Sonnet mid-turn if the routed model call fails — a
  // pinned/unavailable Opus must not sink the whole turn into a dead line.
  const model = pickModel(opts.state, opts.message);
  let activeModel = model;

  // One model call, with a safety net: if the chosen model errors (unavailable on
  // the key, a bad NARRATE_MODEL, a transient 5xx), log it and retry once on the
  // known-good Sonnet before giving up — so the turn degrades gracefully instead
  // of crackling. Never swallows the error silently: it lands in the server log.
  async function createMessage(
    params: Anthropic.MessageCreateParamsNonStreaming,
  ): Promise<Anthropic.Message> {
    try {
      return await client.messages.create({ ...params, model: activeModel });
    } catch (err) {
      lastErr = err;
      console.error(`[narrate] model "${activeModel}" failed:`, err instanceof Error ? err.message : err);
      if (activeModel !== SONNET_MODEL) {
        activeModel = SONNET_MODEL;
        console.error('[narrate] retrying on fallback model:', SONNET_MODEL);
        return await client.messages.create({ ...params, model: activeModel });
      }
      throw err;
    }
  }

  let finalText = '';
  let secondary: string | undefined;
  try {
    for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
      if (Date.now() - started > BUDGET_MS) break;
      const res = await createMessage({
        model: activeModel,
        max_tokens: 1600,
        system: SYSTEM,
        tools: TOOL_SCHEMAS as Anthropic.Tool[],
        messages: working,
      });
      working.push({ role: 'assistant', content: res.content });

      const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
      finalText = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n').trim();

      if (toolUses.length === 0 || res.stop_reason !== 'tool_use') break;

      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        const base = state ?? ({} as GameState);
        // Isolate each tool: a single op throwing must not kill the turn — hand the
        // model an error result and let it recover in-world.
        try {
          const { state: next, result } = runOp(base, tu.name, (tu.input ?? {}) as Record<string, unknown>);
          if (tu.name === 'new_game' || next !== base) state = next;
          results.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(result) });
        } catch (err) {
          results.push({
            type: 'tool_result',
            tool_use_id: tu.id,
            is_error: true,
            content: `That didn't work: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      }
      // A brand-new game: don't have the model write the (heavy, credit-hungry)
      // opening live — serve the PRE-SCRIPTED two-beat opening and end the turn.
      if (toolUses.some((tu) => tu.name === 'new_game') && state) {
        const opening = scriptedOpening(state);
        finalText = opening.scene;
        secondary = opening.meeting;
        break;
      }
      working.push({ role: 'user', content: results });
    }
  } catch (err) {
    // A model call failed or timed out mid-loop — fall through; the synthesis
    // step below tries to answer from what was gathered, else a graceful nudge.
    lastErr = err;
  }

  // If the loop stopped (budget or hop cap) with tools mid-flight and no prose
  // written yet, force ONE final answer from everything gathered — no tools — so a
  // big multi-part turn (five signings, three enquiries, a board meeting) still
  // REPLIES with what it found instead of dying on a bare "line went dead".
  if (!finalText && working.length > 2) {
    try {
      const wrap = await createMessage({
        model: activeModel,
        max_tokens: 1600,
        system: `${SYSTEM}\n\nWrap up NOW: answer the Director in prose from what you have already gathered. Do not ask for more time and do not call any tools.`,
        messages: working,
      });
      finalText = wrap.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n').trim();
    } catch (err) {
      lastErr = err;
    }
  }
  if (!finalText) {
    // Never silent: record WHY the turn produced nothing (model error, empty reply)
    // so a recurring crackle can be diagnosed from the server log.
    console.error(
      '[narrate] no narration produced — serving the crackle fallback.',
      lastErr instanceof Error ? lastErr.message : (lastErr ?? '(model returned empty text)'),
    );
    finalText = state
      ? 'The line to the boardroom crackled for a moment there — say that again and I’ll pick it straight up.'
      : 'The line crackled — tell me which job you want and we’ll get started.';
  }

  // Keep the client-facing history lean: only the Director's message and the
  // narrator's reply as text (the tool exchanges are transient — state carries facts).
  const cleanMessage = opts.message; // without the injected context note
  // The assistant's turn for history is both beats (scene + manager meeting) when a
  // secondary reply was served, so the narrator has the full opening as context.
  const assistantTurn = secondary ? `${finalText}\n\n${secondary}` : finalText || '…';
  const nextHistory: Anthropic.MessageParam[] = [
    ...priorText,
    { role: 'user' as const, content: cleanMessage },
    { role: 'assistant' as const, content: assistantTurn },
  ].slice(-24); // cap history length

  return { narration: finalText || '…', secondary, state, situation: state ? situationOf(state) : null, history: nextHistory };
}
