import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { serveStatic } from '@hono/node-server/serve-static';
import { API_V1_PREFIX } from '@conoceme/shared';
import type { Env } from './config/env.js';
import { errorHandler } from './http/error-handler.js';
import { createApiRoutes } from './http/create-routes.js';
import { AiController } from './modules/ai/ai.controller.js';
import { AiService } from './modules/ai/ai.service.js';
import { FileKnowledgeRepository } from './modules/ai/knowledge.repository.js';
import { HealthController } from './modules/health/health.controller.js';
import { PlacesController } from './modules/places/places.controller.js';
import { FilePlacesRepository } from './modules/places/places.repository.js';
import { PlacesService } from './modules/places/places.service.js';
import { PlayerController } from './modules/player/player.controller.js';
import { PlayerService } from './modules/player/player.service.js';
import { ProfileController } from './modules/profile/profile.controller.js';
import { FileProfileRepository } from './modules/profile/profile.repository.js';
import { ProfileService } from './modules/profile/profile.service.js';

/** Composition root: wires implementations (DIP). */
export function createApp(env: Env): Hono {
  const profileRepo = new FileProfileRepository(env.contentRoot);
  const placesRepo = new FilePlacesRepository(env.contentRoot);
  const knowledgeRepo = new FileKnowledgeRepository(env.contentRoot);

  const profileService = new ProfileService(profileRepo);
  const placesService = new PlacesService(placesRepo);
  const playerService = new PlayerService();
  const aiService = new AiService(env, knowledgeRepo, profileService);

  const controllers = {
    health: new HealthController(),
    profile: new ProfileController(profileService),
    places: new PlacesController(placesService),
    player: new PlayerController(playerService),
    ai: new AiController(aiService),
  };

  const app = new Hono();

  app.use(
    '*',
    secureHeaders({
      xFrameOptions: 'SAMEORIGIN',
      referrerPolicy: 'strict-origin-when-cross-origin',
    }),
  );

  app.use(
    '*',
    cors({
      origin: env.CORS_ORIGIN,
      allowMethods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
    }),
  );

  app.onError(errorHandler);

  const api = createApiRoutes(controllers, env);
  app.route(API_V1_PREFIX, api);

  if (env.staticRoot && existsSync(path.join(env.staticRoot, 'index.html'))) {
    mountSpa(app, env.staticRoot);
  } else {
    app.get('/', (c) =>
      c.json({
        name: 'conoceme-aun-mas API',
        docs: API_V1_PREFIX,
        health: `${API_V1_PREFIX}/health`,
        ai: `${API_V1_PREFIX}/ai/status`,
      }),
    );
  }

  return app;
}

/** Serve Vite build + SPA fallback (same origin as API in production). */
function mountSpa(app: Hono, staticRoot: string): void {
  const root = path.resolve(staticRoot);
  const indexHtml = path.join(root, 'index.html');

  // Relative root for serve-static (expects path relative to process.cwd)
  const relRoot = path.relative(process.cwd(), root) || '.';

  app.use(
    '/*',
    serveStatic({
      root: relRoot,
    }),
  );

  // SPA fallback for client routes (keep API 404s intact)
  app.notFound((c) => {
    if (c.req.path.startsWith(API_V1_PREFIX)) {
      return c.json(
        { error: { code: 'NOT_FOUND', message: 'Route not found' } },
        404,
      );
    }
    if (!existsSync(indexHtml)) {
      return c.text('Frontend build missing', 500);
    }
    const html = readFileSync(indexHtml, 'utf8');
    return c.html(html);
  });
}
