// =============================================================================
// DepGraph — API: GET /api/billing/status
// Returns current plan, subscription status, and subscription dates.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserById } from '@/lib/db/queries/users';
import { getActiveSubscriptionByUserId } from '@/lib/db/queries/billing';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserById(session.userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const subscription = await getActiveSubscriptionByUserId(session.userId);

  return NextResponse.json({
    plan:               user.plan,
    subscriptionStatus: user.subscription_status ?? 'inactive',
    subscription: subscription
      ? {
          id:           subscription.id,
          status:       subscription.status,
          plan:         subscription.plan,
          currentStart: subscription.current_start,
          currentEnd:   subscription.current_end,
        }
      : null,
  });
}
