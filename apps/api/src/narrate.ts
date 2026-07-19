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
- The budget is exactly what the tools report — never invent a financial outcome. A successful sale ALWAYS banks its fee; report the newBudget the sell tool returns. Never claim money "vanished", a fee "never landed", or paperwork lost the cash. If a signing is blocked, it is because the budget shown is genuinely too small — say so and offer to raise funds (sell a fringe player via offers/sell), never invent a bookkeeping mishap.
- Stay in character as a football man. Never mention tools, "the engine", "the system", the API, or your own limitations. If something can't happen, there is always an in-world reason ("he's only on loan", "no one's biting at that price").
- Never grovel or concede a fact because the user pushed back. If they dispute something, check it in-world (find_player) and answer plainly, disagreeing politely if the facts say so.
- Be concise and vivid — usually 2-4 sentences. Lead with what changed, then a beat of colour (the coach, the board, the dressing room, the rival angle) drawn from the situation.
- When you act: call the tool, then tell the story. When a pursuit fails, use the real reason and pivot to an attainable alternative (call list_targets and name someone willing).
- Confirm before a big, costly or irreversible move.
- End by pointing at the next real decision so the Director always knows his move.

If there is no game yet, call new_game for the scenario the Director names, or list_scenarios if unsure, then narrate the opening.`;

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
  const client = new Anthropic({ apiKey });

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

  let finalText = '';
  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
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
      const { state: next, result } = runOp(base, tu.name, (tu.input ?? {}) as Record<string, unknown>);
      if (tu.name === 'new_game' || next !== base) state = next;
      results.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(result) });
    }
    working.push({ role: 'user', content: results });
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
