import { Hono } from 'hono';
import { API_V1_PREFIX } from '@conoceme/shared';
import type { HealthController } from '../modules/health/health.controller.js';
import type { PlacesController } from '../modules/places/places.controller.js';
import type { PlayerController } from '../modules/player/player.controller.js';
import type { ProfileController } from '../modules/profile/profile.controller.js';

export interface RouteControllers {
  health: HealthController;
  profile: ProfileController;
  places: PlacesController;
  player: PlayerController;
}

export function createApiRoutes(controllers: RouteControllers): Hono {
  const api = new Hono();

  api.get('/health', (c) => controllers.health.get(c));
  api.get('/profile', (c) => controllers.profile.get(c));
  api.get('/places', (c) => controllers.places.list(c));
  api.get('/places/:id', (c) => controllers.places.getById(c));
  api.get('/player/state', (c) => controllers.player.get(c));
  api.put('/player/state', (c) => controllers.player.put(c));

  // Mount point helper — prefix applied in app.ts
  void API_V1_PREFIX;
  return api;
}
