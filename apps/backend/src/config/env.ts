import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8787),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CONTENT_ROOT: z.string().optional(),
  /** Directory with Vite `dist` (index.html + assets). Empty = do not serve SPA. */
  STATIC_ROOT: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  /** Comma-separated keys for AI chat (Bearer / X-Api-Key). */
  PORTFOLIO_API_KEYS: z.string().optional(),
  /**
   * Key the SPA may use for the in-game companion (public, rate-limited).
   * Auto-added to accepted keys; exposed via GET /ai/status.
   */
  PUBLIC_COMPANION_KEY: z.string().optional(),
  /** Optional SpaceXAI / xAI key for future LLM mode (server-only). */
  XAI_API_KEY: z.string().optional(),
  AI_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  AI_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
});

export type Env = z.infer<typeof envSchema> & {
  contentRoot: string;
  staticRoot: string | null;
  apiKeys: Set<string>;
  publicCompanionKey: string | null;
};

function resolveMonorepoRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // apps/backend/src/config -> repo root
  return path.resolve(here, '../../../../');
}

function resolveFromRoot(monorepoRoot: string, p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(monorepoRoot, p);
}

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.parse(raw);
  const monorepoRoot = resolveMonorepoRoot();
  const contentRoot = parsed.CONTENT_ROOT
    ? resolveFromRoot(monorepoRoot, parsed.CONTENT_ROOT)
    : path.join(monorepoRoot, 'content');

  const defaultStatic = path.join(monorepoRoot, 'apps/frontend/dist');
  let staticRoot: string | null = null;
  if (parsed.STATIC_ROOT) {
    staticRoot = resolveFromRoot(monorepoRoot, parsed.STATIC_ROOT);
  } else if (parsed.NODE_ENV === 'production' && existsSync(defaultStatic)) {
    staticRoot = defaultStatic;
  }

  const apiKeys = new Set(
    (parsed.PORTFOLIO_API_KEYS ?? '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
  );

  const publicCompanionKey = (parsed.PUBLIC_COMPANION_KEY ?? '').trim() || null;
  if (publicCompanionKey) apiKeys.add(publicCompanionKey);

  return {
    ...parsed,
    contentRoot,
    staticRoot,
    apiKeys,
    publicCompanionKey,
  };
}
