// =============================================================================
// DepGraph — Tests: errors/handler
// =============================================================================

import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/errors/handler';
import {
  AppError,
  AuthError,
  PlanError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  classifyError,
} from '@/lib/errors';

function makeReq(path = '/api/test'): NextRequest {
  return new NextRequest(`http://localhost${path}`);
}

describe('classifyError', () => {
  it('passes through AppError subclasses unchanged', () => {
    const err = new AuthError('Custom auth message');
    expect(classifyError(err)).toBe(err);
  });

  it('classifies "unauthorized" message as AuthError', () => {
    const e = classifyError(new Error('401 unauthorized'));
    expect(e).toBeInstanceOf(AuthError);
    expect(e.statusCode).toBe(401);
  });

  it('classifies "not found" as NotFoundError', () => {
    const e = classifyError(new Error('resource not found'));
    expect(e).toBeInstanceOf(NotFoundError);
    expect(e.statusCode).toBe(404);
  });

  it('classifies "rate limit" as RateLimitError', () => {
    const e = classifyError(new Error('rate limit exceeded'));
    expect(e).toBeInstanceOf(RateLimitError);
    expect(e.statusCode).toBe(429);
  });

  it('wraps generic errors as 500 AppError', () => {
    const e = classifyError(new Error('something blew up'));
    expect(e.statusCode).toBe(500);
    expect(e.code).toBe('INTERNAL_ERROR');
  });

  it('wraps non-Error throwables', () => {
    const e = classifyError('a string was thrown');
    expect(e.statusCode).toBe(500);
  });
});

describe('AppError.toResponse', () => {
  it('returns correct status and JSON body', async () => {
    const err = new PlanError('Upgrade required');
    const res = err.toResponse();
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string; code: string };
    expect(body.code).toBe('PLAN_REQUIRED');
    expect(body.error).toBe('Upgrade required');
  });
});

describe('withErrorHandler', () => {
  it('passes through successful responses', async () => {
    const handler = withErrorHandler(async () => Response.json({ ok: true }) as never);
    const res = await handler(makeReq());
    expect(res.status).toBe(200);
  });

  it('catches AppError and returns its status', async () => {
    const handler = withErrorHandler(async () => { throw new ValidationError('bad input'); });
    const res = await handler(makeReq());
    expect(res.status).toBe(400);
    const body = await res.json() as { code: string };
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('catches unknown errors and returns 500', async () => {
    const handler = withErrorHandler(async () => { throw new Error('db exploded'); });
    const res = await handler(makeReq());
    expect(res.status).toBe(500);
  });
});
