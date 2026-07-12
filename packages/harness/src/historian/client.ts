/**
 * The Historian's LLM seam. Everything the reviewer needs from a model is behind
 * `HistorianClient` so the layer is fully testable without a network (tests use
 * `scriptedClient`) and swappable to any strong general LLM.
 *
 * `createHistorianClientFromEnv()` returns the real Anthropic-backed client when
 * an API key is present, or `null` when it is not — in which case the run is
 * SKIPPED rather than failed. A missing key is a config gap, not a realism
 * regression, so it must never break the build (see run.ts / §6).
 */

import type { RawVerdict, ReviewItem } from './types.js';

export interface ReviewRequest {
  /** prompt.md + rubric.md (+ any mode suffix), assembled by the reviewer. */
  systemPrompt: string;
  /** The batch of items to judge — one verdict expected per item. */
  items: ReviewItem[];
  /** Low by default (§1: 0.2) for stable, near-deterministic judgment. */
  temperature?: number;
}

export interface HistorianClient {
  readonly name: string;
  review(req: ReviewRequest): Promise<RawVerdict[]>;
}

/** The tool the model is forced to call, so output is structured JSON (§4). */
const VERDICT_TOOL = {
  name: 'emit_verdicts',
  description: 'Return one verdict object per reviewed item, in the given schema.',
  input_schema: {
    type: 'object',
    properties: {
      verdicts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            itemId: { type: 'string' },
            verdict: { type: 'string', enum: ['PASS', 'FLAG', 'FAIL'] },
            severity: { type: ['string', 'null'], enum: ['MINOR', 'MODERATE', 'SEVERE', null] },
            confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
            reasoning: { type: 'string' },
            suspectedSystem: { type: 'string' },
          },
          required: ['itemId', 'verdict', 'severity', 'confidence', 'reasoning', 'suspectedSystem'],
        },
      },
    },
    required: ['verdicts'],
  },
} as const;

/** Serialise a batch into the user-turn payload the model judges. */
export function renderBatch(items: ReviewItem[]): string {
  const lines = [
    'Review the following items. Return exactly one verdict per item, keyed by',
    'itemId. Use ONLY the referenceData for facts; use expertise for judgment.',
    '',
    JSON.stringify({ items }, null, 2),
  ];
  return lines.join('\n');
}

export interface AnthropicClientOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  /** Injectable for tests; defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

/**
 * Real client: Anthropic Messages API with a forced tool call for structured
 * output. Dependency-free (uses global fetch). The model id is plain API config
 * (which model the Historian *calls*), configurable via HISTORIAN_MODEL.
 */
export function anthropicHistorianClient(opts: AnthropicClientOptions): HistorianClient {
  const model = opts.model ?? 'claude-sonnet-5';
  const baseUrl = opts.baseUrl ?? 'https://api.anthropic.com';
  const maxTokens = opts.maxTokens ?? 4096;
  const doFetch = opts.fetchImpl ?? fetch;

  return {
    name: `anthropic:${model}`,
    async review(req: ReviewRequest): Promise<RawVerdict[]> {
      const res = await doFetch(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': opts.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature: req.temperature ?? 0.2,
          system: req.systemPrompt,
          tools: [VERDICT_TOOL],
          tool_choice: { type: 'tool', name: VERDICT_TOOL.name },
          messages: [{ role: 'user', content: renderBatch(req.items) }],
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Historian API ${res.status}: ${body.slice(0, 500)}`);
      }
      const json = (await res.json()) as {
        content?: Array<{ type: string; name?: string; input?: { verdicts?: RawVerdict[] } }>;
      };
      const toolUse = json.content?.find((b) => b.type === 'tool_use' && b.name === VERDICT_TOOL.name);
      const verdicts = toolUse?.input?.verdicts;
      if (!Array.isArray(verdicts)) {
        throw new Error('Historian API returned no verdicts tool call');
      }
      return verdicts;
    },
  };
}

/**
 * Build the real client from the environment, or return null if no key is set.
 * Null ⇒ the caller SKIPS the Historian (does not fail CI).
 */
export function createHistorianClientFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): HistorianClient | null {
  const apiKey = env.ANTHROPIC_API_KEY ?? env.HISTORIAN_API_KEY;
  if (!apiKey) return null;
  return anthropicHistorianClient({
    apiKey,
    model: env.HISTORIAN_MODEL,
    baseUrl: env.ANTHROPIC_BASE_URL,
  });
}

/**
 * Deterministic in-process client for tests and offline dry-runs: the verdict
 * function is called with the batch and returns raw verdicts. No network.
 */
export function scriptedClient(
  fn: (items: ReviewItem[]) => RawVerdict[],
  name = 'scripted',
): HistorianClient {
  return {
    name,
    async review(req: ReviewRequest): Promise<RawVerdict[]> {
      return fn(req.items);
    },
  };
}
