// =============================================================================
// DepGraph — API: POST /api/beta/feedback
// Week 8: Beta feedback submission endpoint.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { submitFeedback } from '@/lib/db/queries/beta';
import { trackFeedbackSubmitted } from '@/lib/analytics/events';
import { withErrorHandler } from '@/lib/errors/handler';
import { AuthError, ValidationError } from '@/lib/errors';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.userId) throw new AuthError();

  const body = (await req.json()) as { rating?: number; message?: string; category?: string };

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    throw new ValidationError('Rating must be between 1 and 5');
  }
  if (!body.message || body.message.trim().length === 0) {
    throw new ValidationError('Message is required');
  }
  if (!body.category) {
    throw new ValidationError('Category is required');
  }

  await submitFeedback(session.userId, {
    rating:   body.rating,
    message:  body.message.trim(),
    category: body.category,
  });

  trackFeedbackSubmitted(session.userId, {
    rating:   body.rating,
    category: body.category,
  });

  return NextResponse.json({ success: true }, { status: 201 });
});
