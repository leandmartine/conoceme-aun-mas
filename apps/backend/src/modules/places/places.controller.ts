import type { Context } from 'hono';
import type { PlaceId } from '@conoceme/shared';
import { z } from 'zod';
import { AppError } from '../../shared/errors.js';
import type { PlacesService } from './places.service.js';

const placeIdSchema = z.enum([
  'rambla',
  'ciudad-vieja',
  'skyline',
  'universidad',
  'puerto',
  'campo',
  'faro',
]);

export class PlacesController {
  constructor(private readonly service: PlacesService) {}

  list = async (c: Context) => {
    const places = await this.service.listPlaces();
    return c.json(places);
  };

  getById = async (c: Context) => {
    const raw = c.req.param('id');
    const parsed = placeIdSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError('INVALID_PLACE_ID', `Invalid place id: ${raw}`, 400);
    }
    const place = await this.service.getPlace(parsed.data as PlaceId);
    return c.json(place);
  };
}
