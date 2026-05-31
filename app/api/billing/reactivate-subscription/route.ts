// =============================================================================
// DepGraph — POST /api/billing/reactivate-subscription
// Reactivates a halted or cancelled subscription by creating a new one.
// Session required. Pro/Team plan required (must have had a prior subscription).
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  getActiveSubscriptionByUserId,
  getCustomerByUserId,
  createSubscriptionRecord,
  markSubscriptionCancelled,
} from '@/lib/db/queries/billing';
import {
  cancelRazorpaySubscription,
  reactivateRazorpaySubscription,
} from '@/lib/services/razorpay/subscriptions';
import { getEnv } from '@/lib/env';

export async function POST(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId;
  const env    = getEnv();

  // Get customer record
  const customer = await getCustomerByUserId(userId);
  if (!customer) {
    return NextResponse.json({ error: 'No billing customer found' }, { status: 404 });
  }

  // Check current subscription (may be halted or cancelled)
  const existingSub = await getActiveSubscriptionByUserId(userId);

  // If there's a live halted subscription, cancel it on Razorpay first
  if (existingSub && existingSub.status === 'halted') {
    try {
      await cancelRazorpaySubscription(existingSub.razorpay_subscription_id, false);
    } catch {
      // Non-fatal — continue with reactivation
    }
    await markSubscriptionCancelled(userId, existingSub.razorpay_subscription_id);
  }

  // Determine plan from last subscription (default pro)
  const plan   = existingSub?.plan ?? 'pro';
  const planId = plan === 'team'
    ? env.RAZORPAY_PLAN_ID_TEAM
    : env.RAZORPAY_PLAN_ID_PRO;

  // Create fresh subscription
  const newSub = await reactivateRazorpaySubscription(
    customer.razorpay_customer_id,
    planId,
  );

  // Persist new subscription record
  await createSubscriptionRecord({
    userId,
    razorpaySubscriptionId: newSub.id,
    razorpayPlanId:         planId,
    plan,
  });

  return NextResponse.json({ subscriptionId: newSub.id, shortUrl: newSub.shortUrl }, { status: 201 });
}
