import { Hono } from 'hono';
import { cors } from 'hono/cors';
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
    cors({
      origin: env.CORS_ORIGIN,
      allowMethods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
    }),
  );

  app.onError(errorHandler);

  app.get('/', (c) =>
    c.json({
      name: 'conoceme-aun-mas API',
      docs: API_V1_PREFIX,
      health: `${API_V1_PREFIX}/health`,
      ai: `${API_V1_PREFIX}/ai/status`,
    }),
  );

  const api = createApiRoutes(controllers, env);
  app.route(API_V1_PREFIX, api);

  return app;
}
