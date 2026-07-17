import { serve } from '@hono/node-server';
import { loadEnv } from './config/env.js';
import { createApp } from './app.js';

const env = loadEnv();
const app = createApp(env);

console.log(`[backend] content root: ${env.contentRoot}`);
console.log(`[backend] listening on http://${env.HOST}:${env.PORT}`);

serve({
  fetch: app.fetch,
  hostname: env.HOST,
  port: env.PORT,
});
