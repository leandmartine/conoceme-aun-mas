import { Hono } from 'hono';
import { API_V1_PREFIX } from '@conoceme/shared';
import type { Env } from '../config/env.js';
import type { AiController } from '../modules/ai/ai.controller.js';
import type { HealthController } from '../modules/health/health.controller.js';
import type { PlacesController } from '../modules/places/places.controller.js';
import type { PlayerController } from '../modules/player/player.controller.js';
import type { ProfileController } from '../modules/profile/profile.controller.js';
import { requirePortfolioApiKey } from './api-key.js';
import { createRateLimiter } from './rate-limit.js';

export interface RouteControllers {
  health: HealthController;
  profile: ProfileController;
  places: PlacesController;
  player: PlayerController;
  ai: AiController;
}

export function createApiRoutes(controllers: RouteControllers, env: Env): Hono {
  const api = new Hono();

  api.get('/health', (c) => controllers.health.get(c));
  api.get('/profile', (c) => controllers.profile.get(c));
  api.get('/places', (c) => controllers.places.list(c));
  api.get('/places/:id', (c) => controllers.places.getById(c));
  api.get('/player/state', (c) => controllers.player.get(c));
  api.put('/player/state', (c) => controllers.player.put(c));

  // AI — status is public (no secrets); chat requires portfolio API key
  api.get('/ai/status', (c) => controllers.ai.status(c));

  const aiChat = new Hono();
  aiChat.use('*', requirePortfolioApiKey(env));
  aiChat.use(
    '*',
    createRateLimiter({
      windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
      max: env.AI_RATE_LIMIT_MAX,
    }),
  );
  aiChat.post('/chat', (c) => controllers.ai.chat(c));
  api.route('/ai', aiChat);

  void API_V1_PREFIX;
  return api;
}
