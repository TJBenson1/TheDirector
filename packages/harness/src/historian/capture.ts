/**
 * Capture finished careers for post-hoc review. This mirrors the Monte Carlo
 * batch (run.ts) but keeps each career's final GameState — the review material
 * the sampler works over. It reuses `traceCareer`, so a captured career is the
 * exact same deterministic run the calibration harness measures.
 */

import type { GameState } from '@director/engine';
import { traceCareer } from '../runCareer.js';
import { ALL_BOTS } from '../strategy.js';

export interface CaptureOptions {
  careers: number;
  years: number;
  seed: string;
  scenario: string;
}

export interface CapturedCareer {
  careerId: string;
  botName: string;
  finalState: GameState;
}

export function captureCareers(opts: CaptureOptions): CapturedCareer[] {
  const out: CapturedCareer[] = [];
  for (let i = 0; i < opts.careers; i++) {
    const bot = ALL_BOTS[i % ALL_BOTS.length]!;
    const { finalState } = traceCareer({
      scenarioId: opts.scenario,
      seed: `${opts.seed}:${i}`,
      years: opts.years,
      bot,
    });
    out.push({ careerId: `${opts.scenario}#${i}:${bot.name}`, botName: bot.name, finalState });
  }
  return out;
}
