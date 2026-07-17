import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8787),
  HOST: z.string().default('0.0.0.0'),
  CONTENT_ROOT: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  /** Comma-separated keys for AI chat (Bearer / X-Api-Key). */
  PORTFOLIO_API_KEYS: z.string().optional(),
  /** Optional SpaceXAI / xAI key for future LLM mode (server-only). */
  XAI_API_KEY: z.string().optional(),
  AI_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  AI_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
});

export type Env = z.infer<typeof envSchema> & {
  contentRoot: string;
  apiKeys: Set<string>;
};

function resolveMonorepoRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // apps/backend/src/config -> repo root
  return path.resolve(here, '../../../../');
}

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.parse(raw);
  const monorepoRoot = resolveMonorepoRoot();
  const contentRoot = parsed.CONTENT_ROOT
    ? path.resolve(monorepoRoot, parsed.CONTENT_ROOT)
    : path.join(monorepoRoot, 'content');

  const apiKeys = new Set(
    (parsed.PORTFOLIO_API_KEYS ?? '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
  );

  return {
    ...parsed,
    contentRoot,
    apiKeys,
  };
}
