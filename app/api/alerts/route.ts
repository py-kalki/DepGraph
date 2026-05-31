// =============================================================================
// DepGraph — GET + POST /api/alerts
// List and create alert subscriptions.
// Session required. Plan enforcement: free tier = digest only.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createAlertSubscription, getAlertsByUserId } from '@/lib/db/queries/alerts';
import { assertAlertAccess } from '@/lib/middleware/planGuard';
import type { AlertType, AlertChannel } from '@/lib/types';

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const alerts = await getAlertsByUserId(session.userId);
  return NextResponse.json(alerts);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { projectId, alertType, threshold, channel = 'email', destination } = body as {
    projectId:   string;
    alertType:   AlertType;
    threshold?:  number;
    channel?:    AlertChannel;
    destination: string;
  };

  if (!projectId || !alertType || !destination) {
    return NextResponse.json({ error: 'projectId, alertType, and destination are required' }, { status: 400 });
  }

  const plan = (session as { plan?: string }).plan ?? 'free';

  // Plan gate: free users can only set up digest alerts
  try {
    assertAlertAccess(plan, alertType);
  } catch {
    return NextResponse.json(
      { error: 'Upgrade to Pro to enable real-time alerts' },
      { status: 403 },
    );
  }

  const alert = await createAlertSubscription({
    userId:     session.userId,
    projectId,
    alertType,
    threshold:  threshold ?? null,
    channel,
    destination,
  });

  return NextResponse.json(alert, { status: 201 });
}
