// =============================================================================
// DepGraph — Razorpay Subscription Operations
// Create, cancel, and fetch subscriptions via Razorpay API.
// =============================================================================

import { getRazorpay } from './client';

export interface RazorpaySubscriptionResult {
  id: string;            // Razorpay subscription ID
  planId: string;
  status: string;
  shortUrl: string;     // Hosted payment page URL
}

/**
 * Create a new Razorpay subscription.
 * Returns the subscription object including the hosted payment short_url.
 */
export async function createRazorpaySubscription(
  razorpayCustomerId: string,
  planId: string,
  totalCount: number = 12,  // 12 billing cycles (1 year)
): Promise<RazorpaySubscriptionResult> {
  const razorpay = getRazorpay();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = await (razorpay.subscriptions as any).create({
    plan_id:     planId,
    customer_id: razorpayCustomerId,
    total_count: totalCount,
    quantity:    1,
  });

  return {
    id:       subscription.id,
    planId:   subscription.plan_id,
    status:   subscription.status,
    shortUrl: subscription.short_url ?? '',
  };
}

/**
 * Cancel a Razorpay subscription.
 * cancel_at_cycle_end: true = cancel at billing period end (graceful).
 * cancel_at_cycle_end: false = cancel immediately.
 */
export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = true,
): Promise<void> {
  const razorpay = getRazorpay();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (razorpay.subscriptions as any).cancel(subscriptionId, cancelAtCycleEnd);
}

/**
 * Fetch current subscription status from Razorpay.
 */
export async function getRazorpaySubscription(
  subscriptionId: string,
): Promise<{ id: string; status: string; planId: string }> {
  const razorpay = getRazorpay();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = await (razorpay.subscriptions as any).fetch(subscriptionId);
  return { id: sub.id, status: sub.status, planId: sub.plan_id };
}

/**
 * Reactivate a subscription by creating a new one.
 * Used when a subscription is halted (payment failed) or cancelled.
 * The caller is responsible for cancelling the old record in DB.
 */
export async function reactivateRazorpaySubscription(
  razorpayCustomerId: string,
  planId: string,
): Promise<RazorpaySubscriptionResult> {
  // Reactivation = create a fresh subscription with the same plan
  return createRazorpaySubscription(razorpayCustomerId, planId, 12);
}
