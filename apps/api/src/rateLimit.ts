/**
 * Per-client rate limiting for the credit-costing endpoints.
 *
 * The narrator (`/games/narrate`) runs the Claude tool-loop on the HOST's key, so
 * every turn spends real API credits; the season beats inside `/games/advance` do
 * too (Opus prose). This is a hard backstop so a runaway client — a stuck loop, a
 * script, or plain abuse of the public URL — can't quietly burn the month's budget.
 * It is a SPEND guardrail, not a fairness system; keep the real ceiling in the
 * Anthropic Console (a spend-limited workspace + a workspace-scoped key).
 *
 * The server is stateless (the client holds the game blob) and unauthenticated, so
 * the only trustworthy key is the client IP. Two fixed windows — a short burst cap
 * and a daily cap — are kept per IP in memory. In-memory means the limit is
 * per-instance; on a single Render instance that's the whole service. Zero deps by
 * design, matching the rest of this server.
 *
 * Tune (or disable) via env without a redeploy of logic:
 *   RATE_LIMIT_PER_MIN  burst cap per IP per minute   (default 12; 0 disables)
 *   RATE_LIMIT_PER_DAY  spend backstop per IP per day (default 300; 0 disables)
 */

import type { IncomingMessage } from 'node:http';

const PER_MIN = envInt('RATE_LIMIT_PER_MIN', 12);
const PER_DAY = envInt('RATE_LIMIT_PER_DAY', 300);

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

interface Bucket {
  minuteStart: number;
  minuteCount: number;
  dayStart: number;
  dayCount: number;
}

const buckets = new Map<string, Bucket>();
// Cap the map's size so a flood of unique IPs can't grow memory without bound —
// well above any realistic concurrent-player count, and swept lazily.
const MAX_BUCKETS = 50_000;

/** Roll expired windows forward in place, returning the live bucket for this IP. */
function bucketFor(ip: string, now: number): Bucket {
  let b = buckets.get(ip);
  if (!b) {
    b = { minuteStart: now, minuteCount: 0, dayStart: now, dayCount: 0 };
    buckets.set(ip, b);
  }
  if (now - b.minuteStart >= MINUTE_MS) {
    b.minuteStart = now;
    b.minuteCount = 0;
  }
  if (now - b.dayStart >= DAY_MS) {
    b.dayStart = now;
    b.dayCount = 0;
  }
  return b;
}

/** Drop buckets whose daily window has fully expired (nothing else to remember). */
function sweep(now: number): void {
  for (const [ip, b] of buckets) {
    if (now - b.dayStart >= DAY_MS) buckets.delete(ip);
  }
}

export interface RateDecision {
  ok: boolean;
  /** Which window is exhausted (null when allowed). */
  scope: 'minute' | 'day' | null;
  /** Seconds until the exhausted window resets (0 when allowed). */
  retryAfterSec: number;
}

/**
 * Would a metered call from this IP be allowed right now? Read-only — call
 * `recordRateLimit` once the call is confirmed to have cost credits. Peeking
 * (rather than count-on-check) lets a token-free `/games/advance` that fires no
 * season beat pass without consuming budget.
 */
export function peekRateLimit(ip: string, now = Date.now()): RateDecision {
  const b = bucketFor(ip, now);
  if (PER_DAY > 0 && b.dayCount >= PER_DAY) {
    return { ok: false, scope: 'day', retryAfterSec: Math.ceil((b.dayStart + DAY_MS - now) / 1000) };
  }
  if (PER_MIN > 0 && b.minuteCount >= PER_MIN) {
    return { ok: false, scope: 'minute', retryAfterSec: Math.ceil((b.minuteStart + MINUTE_MS - now) / 1000) };
  }
  return { ok: true, scope: null, retryAfterSec: 0 };
}

/** Charge one metered hit against this IP's windows. */
export function recordRateLimit(ip: string, now = Date.now()): void {
  if (buckets.size >= MAX_BUCKETS) sweep(now);
  const b = bucketFor(ip, now);
  b.minuteCount += 1;
  b.dayCount += 1;
}

/**
 * Best-effort client IP. Behind Render's proxy the real client is the first hop of
 * `x-forwarded-for`; fall back to the socket address for a direct connection. Not a
 * security boundary (headers are spoofable) — good enough for a spend backstop.
 */
export function clientIp(req: IncomingMessage): string {
  const xff = req.headers['x-forwarded-for'];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  if (raw) {
    const first = raw.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.socket.remoteAddress ?? 'unknown';
}

/** A friendly, in-world line for the chat when a client is throttled. */
export function throttleMessage(scope: 'minute' | 'day'): string {
  return scope === 'day'
    ? "That's the boardroom done for the day — the switchboard's shut. Come back tomorrow and we'll pick it up."
    : "Steady on — the switchboard can't keep up. Give it a minute and try that again.";
}
