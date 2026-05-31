// =============================================================================
// DepGraph — API: POST /api/billing/cancel-subscription
// Cancels at cycle end (cancel_at_cycle_end: true).
// Actual plan downgrade happens when subscription.cancelled webhook fires.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { cancelRazorpaySubscription } from '@/lib/services/razorpay/subscriptions';
import { getActiveSubscriptionByUserId } from '@/lib/db/queries/billing';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subscription = await getActiveSubscriptionByUserId(session.userId);
  if (!subscription) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }

  try {
    await cancelRazorpaySubscription(subscription.razorpay_subscription_id, true);
    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current billing period.',
      currentEnd: subscription.current_end,
    });
  } catch (err) {
    console.error('[POST /api/billing/cancel-subscription]', err);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
