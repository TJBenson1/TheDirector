/**
 * The reviewer: batches sampled items, sends each batch to the HistorianClient
 * with the mode's system prompt, and returns enriched verdicts. Determinism is
 * advisory-tiered (§6): a SEVERE finding is re-run once for confirmation before
 * it is allowed to gate a build — both runs must agree.
 */

import type { HistorianClient } from './client.js';
import { systemPromptFor } from './prompt.js';
import type {
  HistorianMode,
  RawVerdict,
  ReviewItem,
  ReviewVerdict,
} from './types.js';

export interface ReviewerOptions {
  mode: HistorianMode;
  /** Items per LLM call. A few dozen items → a handful of batched calls. */
  batchSize?: number;
  temperature?: number;
  /** Re-run SEVERE findings once to confirm before gating (§6). Default true. */
  confirmSevere?: boolean;
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function runBatches(
  items: ReviewItem[],
  client: HistorianClient,
  systemPrompt: string,
  batchSize: number,
  temperature: number,
): Promise<Map<string, RawVerdict>> {
  const byId = new Map<string, RawVerdict>();
  const valid = new Set(items.map((i) => i.id));
  for (const batch of chunk(items, batchSize)) {
    const verdicts = await client.review({ systemPrompt, items: batch, temperature });
    for (const v of verdicts) {
      // Ignore hallucinated ids; last write wins for duplicates.
      if (valid.has(v.itemId)) byId.set(v.itemId, v);
    }
  }
  return byId;
}

/** A synthetic verdict for an item the model failed to score — advisory only,
 *  never gates (low confidence PASS), but surfaced so coverage is honest. */
function unreviewed(item: ReviewItem): RawVerdict {
  return {
    itemId: item.id,
    verdict: 'PASS',
    severity: null,
    confidence: 'low',
    reasoning: 'No verdict returned by the model for this item (uncovered).',
    suspectedSystem: 'historian-coverage',
  };
}

/**
 * Review a set of items. Returns one verdict per item (in item order), with
 * `confirmed` set on SEVERE findings once the confirmation re-run has run.
 */
export async function reviewItems(
  items: ReviewItem[],
  client: HistorianClient,
  options: ReviewerOptions,
): Promise<ReviewVerdict[]> {
  const batchSize = options.batchSize ?? 12;
  const temperature = options.temperature ?? 0.2;
  const confirmSevere = options.confirmSevere ?? true;
  const systemPrompt = systemPromptFor(options.mode);
  const categoryById = new Map(items.map((i) => [i.id, i.category]));

  if (items.length === 0) return [];

  const first = await runBatches(items, client, systemPrompt, batchSize, temperature);

  // Confirmation pass: re-run only the SEVERE findings, once (§6).
  const severeItems = items.filter((i) => first.get(i.id)?.severity === 'SEVERE');
  const confirm = confirmSevere && severeItems.length > 0
    ? await runBatches(severeItems, client, systemPrompt, batchSize, temperature)
    : new Map<string, RawVerdict>();

  return items.map((item) => {
    const raw = first.get(item.id) ?? unreviewed(item);
    const category = categoryById.get(item.id)!;
    const verdict: ReviewVerdict = { ...raw, category };
    if (raw.severity === 'SEVERE') {
      // Confirmed only if the re-run also came back SEVERE.
      verdict.confirmed = confirmSevere ? confirm.get(item.id)?.severity === 'SEVERE' : true;
    }
    return verdict;
  });
}
