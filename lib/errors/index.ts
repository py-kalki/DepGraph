// =============================================================================
// DepGraph — AppError classes (Week 7)
// Standardized error classification for all API routes.
// =============================================================================

import { NextResponse } from 'next/server';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code:       string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name       = this.constructor.name;
    this.statusCode = statusCode;
    this.code       = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toResponse(): NextResponse {
    return NextResponse.json(
      { error: this.message, code: this.code },
      { status: this.statusCode },
    );
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class PlanError extends AppError {
  constructor(message = 'Upgrade required') {
    super(message, 403, 'PLAN_REQUIRED');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded — please retry later') {
    super(message, 429, 'RATE_LIMITED');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Classify an unknown thrown value into an AppError.
 * Preserves AppError subclasses; wraps everything else.
 */
export function classifyError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('unauthorized') || msg.includes('401')) return new AuthError(err.message);
    if (msg.includes('not found') || msg.includes('404'))    return new NotFoundError(err.message);
    if (msg.includes('rate limit') || msg.includes('429'))   return new RateLimitError(err.message);
    return new AppError(err.message, 500, 'INTERNAL_ERROR');
  }

  return new AppError('An unexpected error occurred', 500, 'INTERNAL_ERROR');
}
