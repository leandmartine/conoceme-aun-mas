import type { Context } from 'hono';
import type { HealthDto } from '@conoceme/shared';

const VERSION = '0.1.0';

export class HealthController {
  get = async (c: Context) => {
    const body: HealthDto = {
      ok: true,
      service: 'conoceme-backend',
      version: VERSION,
      timestamp: new Date().toISOString(),
    };
    return c.json(body);
  };
}
