import type { ErrorHandler } from 'hono';
import type { ApiErrorBody } from '@conoceme/shared';
import { AppError } from '../shared/errors.js';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    const body: ApiErrorBody = {
      error: { code: err.code, message: err.message },
    };
    // Preserve 4xx (401, 404, 429, …)
    return c.json(body, err.status as 400 | 401 | 404 | 429);
  }

  console.error('[backend] unhandled error', err);
  const body: ApiErrorBody = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    },
  };
  return c.json(body, 500);
};
