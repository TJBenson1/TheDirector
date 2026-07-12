/**
 * Assembles the Historian system prompt: the shipped prompt.md + rubric.md,
 * plus the per-mode suffix (§7 playtest, §8 data-pack validator). The base
 * files are read once from disk (they ship verbatim as authored in the spec).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { HistorianMode } from './types.js';

const HERE = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(HERE, name), 'utf8').trimEnd();
}

/** §4 system prompt, shipped verbatim. */
export const BASE_PROMPT = read('prompt.md');
/** §5 judgment rubric, appended to the prompt. */
export const RUBRIC = read('rubric.md');

/** §7 — playtest reviewer suffix (Mode 2). */
export const PLAYTEST_SUFFIX = `
You are reviewing a complete playthrough. In addition to the standard
rubric, answer: (1) Where was the simulation TOO KIND to the player —
outcomes that resolved too cleanly, valuations independent of context,
adversity that never landed, rivals that rolled over? (2) Where did the
player's own club lack realistic internal friction? (3) Rank the five
least believable moments of the career. Cite specific events by id.`.trim();

/** §8 — data-pack validator suffix (Mode 3). */
export const DATAPACK_SUFFIX = `
You are validating source data, not simulation output. Review for:
factual errors in the transfer ledger (wrong fee/window/club); missing
significant real transfers for the covered clubs; potentialCeiling
calibrations that over/under-rate real careers; missing or wrong
ResistanceProfiles and hard blocks (one-club players, rivalry blocks,
the Messi-class unlock dates); missing scripted events a club's era is
known for; era-inappropriate wage/fee bands.`.trim();

/** The full system prompt for a given mode. */
export function systemPromptFor(mode: HistorianMode): string {
  const parts = [BASE_PROMPT, RUBRIC];
  if (mode === 'playtest') parts.push(PLAYTEST_SUFFIX);
  else if (mode === 'datapack') parts.push(DATAPACK_SUFFIX);
  return parts.join('\n\n');
}
