// =============================================================================
// DepGraph — API: GET /api/billing/history
// Returns paginated payment history for the authenticated user.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getPaymentsByUserId } from '@/lib/db/queries/billing';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 100);

  const payments = await getPaymentsByUserId(session.userId, limit);
  return NextResponse.json({ payments });
}
