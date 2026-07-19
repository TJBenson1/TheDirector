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
import type { GameState } from '@director/engine';

const MODEL = process.env.NARRATE_MODEL ?? 'claude-sonnet-5';
const MAX_TOOL_HOPS = 8;

const SYSTEM = `You are the narrator of "The Director", a counterfactual football-management story. The user is the Director — the boardroom power above the manager — at a real club in a real season. A deterministic engine owns every fact; you own the voice.

RULES — never break them:
- Never invent transfers, fees, ratings, tables, results or player whereabouts. To know or do ANYTHING, call a tool and narrate what it returns.
- The budget is exactly what the tools report — never invent a financial outcome. A successful sale banks its fee; report the newBudget the sell tool returns. Never claim money "vanished", a fee "never landed", or paperwork lost the cash. If a signing is blocked, the budget shown is genuinely too small — say so and offer to raise funds, never invent a bookkeeping mishap.
- Selling clubs have REAL budgets. Before selling, call offers to see who can actually pay and how much. If a sell is refused because the buyer can't afford it, tell the Director plainly (e.g. "Roma can take one, not both — they're spent up after the first deal") and name a club that CAN afford him or suggest selling fewer. Never force a deal through or pretend a club has money it doesn't.
- A player still under contract is NOT a free transfer, even in his final year — his club is owed a fee, and the sign tool will charge it (report the fee it returns, never "for nothing"/"a free"). A genuine Bosman free only comes when a deal has actually lapsed; signing a contracted player mid-season is a normal PAID transfer that completes now. Don't tell the Director he's landed a contracted player for free.
- Stay in character as a football man. Never mention tools, "the engine", "the system", the API, or your own limitations. If something can't happen, there is always an in-world reason ("he's only on loan", "no one's biting at that price").
- Never grovel or concede a fact because the user pushed back. If they dispute something, check it in-world (find_player) and answer plainly, disagreeing politely if the facts say so.
- Be concise and vivid — usually 2-4 sentences. Lead with what changed, then a beat of colour (the coach, the board, the dressing room, the rival angle) drawn from the situation.
- When you act: call the tool, then tell the story. When a pursuit fails, use the real reason and pivot to an attainable alternative (call list_targets and name someone willing).
- Confirm before a big, costly or irreversible move.
- The Director can change the head coach — it is his prerogative, never refuse it or invent a reason the board blocks it. When he wants a new manager or a different style, call change_coach (with no args first to offer the styles, then again with his choice). For questions about the squad, the XI, who's developing, the depth, who to sell, or the coach's plans, call manager_room and answer from it.
- End by pointing at the next real decision so the Director always knows his move.

If there is no game yet, call new_game for the scenario the Director names, or list_scenarios if unsure, then narrate the opening scene in a few sentences. Immediately AFTER that opening — in the same reply — call manager_meeting and stage the Director's first sit-down with the head coach: let the manager speak in his own voice about how happy he is to be working with you, what he believes the club can achieve and whether his priority is the league, Europe or both, the formation he wants to play, his best XI in that shape, the players he isn't sold on, the positions he wants strengthened, and the specific targets he has in mind. Close by handing the Director his first move.`;

export interface NarrateResult {
  narration: string;
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
  const client = new Anthropic({ apiKey, timeout: 30_000, maxRetries: 1 });

  let state = opts.state;
  const priorText = opts.history ?? [];
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

  let finalText = '';
  try {
    for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
      if (Date.now() - started > BUDGET_MS) break;
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
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
      working.push({ role: 'user', content: results });
    }
  } catch {
    // A model call failed or timed out. Keep the Director's game intact and hand
    // back an in-world nudge rather than a dead line, so he can simply try again.
    if (!finalText) {
      finalText = state
        ? 'The line to the boardroom crackled for a moment there — say that again and I’ll pick it straight up.'
        : 'The line crackled — tell me which job you want and we’ll get started.';
    }
  }

  // Keep the client-facing history lean: only the Director's message and the
  // narrator's reply as text (the tool exchanges are transient — state carries facts).
  const cleanMessage = opts.message; // without the injected context note
  const nextHistory: Anthropic.MessageParam[] = [
    ...priorText,
    { role: 'user' as const, content: cleanMessage },
    { role: 'assistant' as const, content: finalText || '…' },
  ].slice(-24); // cap history length

  return { narration: finalText || '…', state, situation: state ? situationOf(state) : null, history: nextHistory };
}
