import type { Context } from 'hono';
import type { PlayerService } from './player.service.js';

export class PlayerController {
  constructor(private readonly service: PlayerService) {}

  get = async (c: Context) => {
    return c.json(this.service.getState());
  };

  put = async (c: Context) => {
    const body = await c.req.json();
    const state = this.service.putState(body);
    return c.json(state);
  };
}
