import type { Context, Next } from 'hono';

/**
 * Simple in-memory rate limiter for Cloudflare Workers.
 * Uses a global Map scoped to the worker isolate.
 * Limits: 100 requests per minute per IP for API endpoints.
 */

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 100;

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

// Periodic cleanup (every 5 minutes of accumulated entries)
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export async function rateLimit(c: Context, next: Next) {
  cleanup();

  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const now = Date.now();

  let entry = store.get(ip);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
  }

  entry.count++;

  // Set rate limit headers
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  c.res.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS));
  c.res.headers.set('X-RateLimit-Remaining', String(remaining));
  c.res.headers.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

  if (entry.count > MAX_REQUESTS) {
    return c.json(
      {
        success: false,
        error: 'Limite de requisições excedido. Tente novamente em 1 minuto.',
      },
      429
    );
  }

  await next();

  // Re-set headers after next() since they may be overwritten
  c.res.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS));
  c.res.headers.set('X-RateLimit-Remaining', String(remaining));
  c.res.headers.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
}
