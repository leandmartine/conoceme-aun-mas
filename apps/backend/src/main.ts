import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { loadEnv } from './config/env.js';
import { createApp } from './app.js';

/** Load monorepo-root `.env` into process.env without a dotenv dependency. */
function loadDotEnvFile(): void {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '../../../');
  const envPath = path.join(root, '.env');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnvFile();
const env = loadEnv();
const app = createApp(env);

console.log(`[backend] content root: ${env.contentRoot}`);
console.log(
  `[backend] AI keys: ${env.apiKeys.size > 0 ? env.apiKeys.size + ' configured' : 'none (chat disabled)'}`,
);
console.log(`[backend] listening on http://${env.HOST}:${env.PORT}`);

serve({
  fetch: app.fetch,
  hostname: env.HOST,
  port: env.PORT,
});
