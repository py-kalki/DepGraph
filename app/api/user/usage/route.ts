// =============================================================================
// DepGraph — API: GET /api/user/usage
// Returns plan limits, project count, scan count, and subscription status.
// Extended in Week 4 to include billing details.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserUsage } from '@/lib/db/queries/usage';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const usage = await getUserUsage(session.userId);
    return NextResponse.json(usage);
  } catch (err) {
    console.error('[GET /api/user/usage]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
