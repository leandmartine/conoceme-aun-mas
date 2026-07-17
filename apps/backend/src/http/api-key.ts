import type { Context, Next } from 'hono';
import type { Env } from '../config/env.js';
import { UnauthorizedError } from '../shared/errors.js';

/**
 * Bearer token or X-Api-Key against PORTFOLIO_API_KEYS.
 * If no keys configured → 503-style unauthorized (AI routes disabled).
 */
export function requirePortfolioApiKey(env: Env) {
  return async (c: Context, next: Next) => {
    if (env.apiKeys.size === 0) {
      throw new UnauthorizedError(
        'AI no configurada: definí PORTFOLIO_API_KEYS en el backend (.env).',
      );
    }

    const header = c.req.header('authorization') ?? '';
    const bearer = header.toLowerCase().startsWith('bearer ')
      ? header.slice(7).trim()
      : '';
    const xKey = (c.req.header('x-api-key') ?? '').trim();
    const key = bearer || xKey;

    if (!key || !env.apiKeys.has(key)) {
      throw new UnauthorizedError('API key inválida o ausente');
    }

    c.set('apiKey', key);
    await next();
  };
}
