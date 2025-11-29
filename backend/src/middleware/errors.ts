import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function middlewareErrors(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
  });
}