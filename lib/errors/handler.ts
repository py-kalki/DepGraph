// =============================================================================
// DepGraph — Error Handler HOF (Week 7)
// Wraps API route handlers in standardized try/catch.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { AppError, classifyError } from './index';
import { createLogger } from '@/lib/logger';

const log = createLogger('api');

type RouteHandler = (req: NextRequest, context?: unknown) => Promise<NextResponse>;

/**
 * Higher-order function that wraps a Next.js route handler with:
 * - Standardized try/catch
 * - AppError classification
 * - Structured JSON error responses
 * - Error logging
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: unknown): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (err) {
      const appError = classifyError(err);

      // Log 5xx errors and send to Sentry; skip logging for expected client errors
      if (appError.statusCode >= 500) {
        Sentry.captureException(err);
        log.error(`Unhandled error in ${req.method} ${req.nextUrl.pathname}`, {
          code:       appError.code,
          message:    appError.message,
          statusCode: appError.statusCode,
        });
      }

      return appError.toResponse();
    }
  };
}
