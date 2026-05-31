// =============================================================================
// DepGraph — GET + PATCH /api/notifications/preferences
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getOrCreateEmailPreferences, updateEmailPreferences } from '@/lib/db/queries/notifications';

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prefs = await getOrCreateEmailPreferences(session.userId);
  return NextResponse.json(prefs);
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const {
    scoreDropEnabled,
    newCveEnabled,
    abandonmentEnabled,
    digestEnabled,
    digestDay,
  } = body as {
    scoreDropEnabled?:  boolean;
    newCveEnabled?:     boolean;
    abandonmentEnabled?: boolean;
    digestEnabled?:     boolean;
    digestDay?:         number;
  };

  const updated = await updateEmailPreferences(session.userId, {
    ...(scoreDropEnabled  !== undefined && { score_drop_enabled:  scoreDropEnabled }),
    ...(newCveEnabled     !== undefined && { new_cve_enabled:     newCveEnabled }),
    ...(abandonmentEnabled !== undefined && { abandonment_enabled: abandonmentEnabled }),
    ...(digestEnabled     !== undefined && { digest_enabled:      digestEnabled }),
    ...(digestDay         !== undefined && { digest_day:          digestDay }),
  });

  return NextResponse.json(updated);
}
