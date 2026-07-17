import type { Context } from 'hono';
import type { ProfileService } from './profile.service.js';

export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  get = async (c: Context) => {
    const profile = await this.service.getProfile();
    return c.json(profile);
  };
}
