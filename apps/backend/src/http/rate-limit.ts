import type { Context, Next } from 'hono';
import { AppError } from '../shared/errors.js';

/** Simple in-memory sliding window per API key (process-local). */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
}) {
  const hits = new Map<string, number[]>();

  return async (c: Context, next: Next) => {
    const key = (c.get('apiKey') as string | undefined) ?? 'anon';
    const now = Date.now();
    const windowStart = now - options.windowMs;
    const prev = (hits.get(key) ?? []).filter((t) => t > windowStart);
    if (prev.length >= options.max) {
      throw new AppError(
        'RATE_LIMIT',
        'Demasiados mensajes. Esperá un momento y probá de nuevo.',
        429,
      );
    }
    prev.push(now);
    hits.set(key, prev);
    await next();
  };
}
