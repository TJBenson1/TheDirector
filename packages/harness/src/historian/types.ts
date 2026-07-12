/**
 * THE HISTORIAN — realism review layer (handoff doc #3).
 *
 * An LLM-powered reviewer that audits simulation outputs, data packs and
 * playthroughs for *plausibility*. It complements the deterministic Monte Carlo
 * calibration harness — code asserts statistics; the Historian judges whether
 * what the sim produced is BELIEVABLE FOOTBALL.
 *
 * REVIEW LAYER ONLY. Everything here lives in /harness, runs post-hoc on
 * outputs, and never touches gameplay, never decides outcomes, never runs at
 * play-time. See docs/DESIGN-historian.md for the full spec.
 */

import type {
  DivergenceEntry,
  RealTransferLedgerEntry,
} from '@director/engine';

// ── Verdict vocabulary (§4 schema / §5 rubric) ───────────────────────────────

export type Verdict = 'PASS' | 'FLAG' | 'FAIL';
export type Severity = 'MINOR' | 'MODERATE' | 'SEVERE';
export type Confidence = 'low' | 'medium' | 'high';

/** Which run mode produced the items under review. */
export type HistorianMode = 'calibration' | 'playtest' | 'datapack';

/** The kind of thing being judged — drives sampling priority and groups the
 *  report. Maps onto the §3 sampling strategy and §8 data-pack checks. */
export type ReviewCategory =
  | 'divergence-chain'
  | 'ambition-override'
  | 'career-arc'
  | 'transfer-window'
  | 'table-checkpoint'
  | 'event-sequence'
  | 'reality-control'
  | 'data-ledger'
  | 'data-resistance'
  | 'data-ceiling'
  | 'data-injury';

// ── Grounding (§2): reference data injected per item ─────────────────────────

/** A real player's authored baseline — the anchor for judging a simulated arc.
 *  Derived from the curated record (immutable birth ceiling), never the model's
 *  memory. */
export interface CareerBaseline {
  playerId: string;
  name: string;
  birthYear: number;
  nationality: string;
  positions: string[];
  /** The ceiling he was born with (immutable) — "reached potential" is measured
   *  against this, not the erodable working ceiling. */
  birthCeiling: number;
  /** Real destination(s) from the ledger, if this player has real moves. */
  realMoves?: RealTransferLedgerEntry[];
}

/** Club facts injected for financial/ownership plausibility (money-blunted etc). */
export interface ClubReference {
  id: string;
  name: string;
  prestige: number;
  ownership: string;
  financialHealth: string;
  baseStrength: number;
}

/** The slice of reference data injected into a review request (§2). Facts come
 *  from here; the model supplies judgment, not fact recall. */
export interface ReferenceSlice {
  eraContext: string;
  ledgerEntries: RealTransferLedgerEntry[];
  careerBaselines: CareerBaseline[];
  clubs: ClubReference[];
  divergenceLog: DivergenceEntry[];
}

// ── Items & verdicts ─────────────────────────────────────────────────────────

/** One reviewable unit handed to the Historian. `payload` is the structured
 *  engine output being judged (never prose — §9). */
export interface ReviewItem {
  id: string;
  category: ReviewCategory;
  /** One-line human summary (for the report; also seeds the model's context). */
  summary: string;
  /** 0..1 sampling priority. Divergences and overrides score highest (§3). */
  significance: number;
  payload: Record<string, unknown>;
  reference: ReferenceSlice;
}

/** A verdict as returned by the model (the §4 VERDICT SCHEMA). */
export interface RawVerdict {
  itemId: string;
  verdict: Verdict;
  severity: Severity | null;
  confidence: Confidence;
  reasoning: string;
  suspectedSystem: string;
}

/** A verdict enriched by the reviewer with local context. */
export interface ReviewVerdict extends RawVerdict {
  category: ReviewCategory;
  /** For a SEVERE finding: did the confirmation re-run agree? (§ CI gating). */
  confirmed?: boolean;
}

// ── Report ───────────────────────────────────────────────────────────────────

export interface HistorianReport {
  mode: HistorianMode;
  /** Whether the Historian ran at all (false ⇒ skipped, no client). */
  ran: boolean;
  itemsReviewed: number;
  verdicts: ReviewVerdict[];
  counts: { pass: number; flag: number; fail: number };
  severities: { minor: number; moderate: number; severe: number };
  /** Findings grouped by the engine system suspected of drifting (§5). */
  bySystem: Record<string, ReviewVerdict[]>;
  /** The CI signal. `pass` false ⇒ the realism gate fails this build. */
  pass: boolean;
  /** Human-readable reasons the gate failed (empty when it passed). */
  failReasons: string[];
}
