import type { Context } from 'hono';
import { z } from 'zod';
import { AppError } from '../../shared/errors.js';
import type { AiService } from './ai.service.js';

const chatSchema = z.object({
  message: z.string().min(0).max(2000),
  locale: z.string().max(16).optional(),
  player: z
    .object({
      zoneId: z
        .enum([
          'rambla',
          'ciudad-vieja',
          'skyline',
          'universidad',
          'puerto',
          'campo',
          'faro',
        ])
        .nullable()
        .optional(),
      visitedPlaceIds: z
        .array(
          z.enum([
            'rambla',
            'ciudad-vieja',
            'skyline',
            'universidad',
            'puerto',
            'campo',
            'faro',
          ]),
        )
        .max(20)
        .optional(),
    })
    .optional(),
});

export class AiController {
  constructor(private readonly service: AiService) {}

  status = async (c: Context) => {
    return c.json(this.service.status());
  };

  chat = async (c: Context) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw new AppError('BAD_REQUEST', 'JSON inválido', 400);
    }

    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError('BAD_REQUEST', 'Mensaje o payload inválido', 400);
    }

    const result = await this.service.chat(parsed.data);
    return c.json(result);
  };
}
