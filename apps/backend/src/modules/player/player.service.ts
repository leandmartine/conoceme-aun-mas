import type { PlaceId, PlayerStateDto } from '@conoceme/shared';
import { z } from 'zod';
import { AppError } from '../../shared/errors.js';

const placeIdSchema = z.enum([
  'rambla',
  'ciudad-vieja',
  'skyline',
  'universidad',
  'puerto',
  'campo',
  'faro',
]);

export const playerStateInputSchema = z.object({
  zoneId: placeIdSchema.nullable(),
  position: z.object({
    x: z.number().finite(),
    y: z.number().finite(),
  }),
  visitedPlaceIds: z.array(placeIdSchema),
  focusedPlaceId: placeIdSchema.nullable(),
});

export type PlayerStateInput = z.infer<typeof playerStateInputSchema>;

/**
 * In-memory player state (v1). Client may also persist localStorage;
 * this endpoint defines the contract for future real sessions.
 */
export class PlayerService {
  private state: PlayerStateDto = {
    zoneId: 'rambla',
    position: { x: 0, y: 120 },
    visitedPlaceIds: [],
    focusedPlaceId: null,
    updatedAt: new Date().toISOString(),
  };

  getState(): PlayerStateDto {
    return this.state;
  }

  putState(input: PlayerStateInput): PlayerStateDto {
    const parsed = playerStateInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError('INVALID_PLAYER_STATE', parsed.error.message, 400);
    }

    this.state = {
      zoneId: parsed.data.zoneId as PlaceId | null,
      position: parsed.data.position,
      visitedPlaceIds: parsed.data.visitedPlaceIds as PlaceId[],
      focusedPlaceId: parsed.data.focusedPlaceId as PlaceId | null,
      updatedAt: new Date().toISOString(),
    };
    return this.state;
  }
}
