// =============================================================================
// DepGraph — Razorpay Webhook Processor
// Verifies webhook signatures and dispatches events to appropriate handlers.
// Idempotent: checks webhook_events table before processing.
// PRD §11 webhook events: subscription.activated, subscription.charged,
//   subscription.cancelled, payment.captured, payment.failed
// =============================================================================

import crypto from 'crypto';
import { getEnv } from '@/lib/env';
import { getDbClient } from '@/lib/db/client';
import {
  upsertCustomer,
  createSubscriptionRecord,
  updateSubscriptionStatus,
  insertPayment,
  markWebhookProcessed,
  insertWebhookEvent,
} from '@/lib/db/queries/billing';
import { updateUserPlan, updateUserSubscriptionStatus } from '@/lib/db/queries/users';

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
  }
}

// ─── Signature Verification ───────────────────────────────────────────────────

/**
 * Verify the Razorpay webhook signature.
 * Uses RAZORPAY_WEBHOOK_SECRET (separate from API key secret).
 * @throws {WebhookVerificationError} if signature is invalid
 */
export function verifyWebhookSignature(rawBody: string, signature: string): void {
  const env = getEnv();
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new WebhookVerificationError('Invalid Razorpay webhook signature');
  }
}

// ─── Event Dispatcher ─────────────────────────────────────────────────────────

export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    subscription?: { entity: Record<string, unknown> };
    payment?:      { entity: Record<string, unknown> };
  };
  created_at: number;
  id?: string; // Razorpay event ID (present in newer API versions)
  [key: string]: unknown; // Index signature to satisfy Record<string, unknown>
}

/**
 * Process a verified Razorpay webhook event.
 * Idempotent: events already in webhook_events are skipped.
 */
export async function processWebhookEvent(
  razorpayEventId: string,
  payload: RazorpayWebhookPayload,
): Promise<void> {
  const db = getDbClient();

  // ─── Idempotency check ───────────────────────────────────────────────────
  const { data: existing } = await db
    .from('webhook_events')
    .select('id, processed')
    .eq('razorpay_event_id', razorpayEventId)
    .single();

  if (existing?.processed) {
    // Already processed — skip silently
    return;
  }

  // ─── Insert raw event (unprocessed) ──────────────────────────────────────
  let eventRowId: string | null = null;
  if (!existing) {
    eventRowId = await insertWebhookEvent(razorpayEventId, payload.event, payload);
  } else {
    eventRowId = existing.id as string;
  }

  // ─── Dispatch ─────────────────────────────────────────────────────────────
  try {
    switch (payload.event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(payload);
        break;
      case 'subscription.charged':
        await handleSubscriptionCharged(payload);
        break;
      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.expired':
        await handleSubscriptionEnded(payload);
        break;
      case 'subscription.halted':
        await handleSubscriptionHalted(payload);
        break;
      case 'subscription.resumed':
        await handleSubscriptionResumed(payload);
        break;
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      default:
        // Unknown event — mark as processed to avoid re-delivery loops
        break;
    }

    if (eventRowId) {
      await markWebhookProcessed(eventRowId, null);
    }
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    if (eventRowId) {
      await markWebhookProcessed(eventRowId, errMessage);
    }
    throw err; // Re-throw so the route returns 500, triggering Razorpay retry
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleSubscriptionActivated(payload: RazorpayWebhookPayload): Promise<void> {
  const sub = payload.payload.subscription?.entity;
  if (!sub) return;

  const razorpaySubId = sub.id as string;
  const planId        = sub.plan_id as string;

  // Determine plan tier from plan ID
  const plan = planId.includes('team') ? 'team' : 'pro';

  // Find our subscription record
  const db = getDbClient();
  const { data: subRow } = await db
    .from('subscriptions')
    .select('id, user_id')
    .eq('razorpay_subscription_id', razorpaySubId)
    .single();

  if (!subRow) return;

  // Update subscription status
  await updateSubscriptionStatus(razorpaySubId, 'active', {
    currentStart: sub.current_start ? new Date((sub.current_start as number) * 1000).toISOString() : null,
    currentEnd:   sub.current_end   ? new Date((sub.current_end as number) * 1000).toISOString()   : null,
  });

  // Upgrade user plan
  await updateUserPlan(subRow.user_id as string, plan);
  await updateUserSubscriptionStatus(subRow.user_id as string, 'active');
}

async function handleSubscriptionCharged(payload: RazorpayWebhookPayload): Promise<void> {
  const payment = payload.payload.payment?.entity;
  const sub     = payload.payload.subscription?.entity;
  if (!payment || !sub) return;

  const db = getDbClient();
  const { data: subRow } = await db
    .from('subscriptions')
    .select('id, user_id')
    .eq('razorpay_subscription_id', sub.id as string)
    .single();

  if (!subRow) return;

  await insertPayment({
    userId:             subRow.user_id as string,
    subscriptionId:     subRow.id as string,
    razorpayPaymentId:  payment.id as string,
    razorpayOrderId:    (payment.order_id as string) ?? null,
    amount:             payment.amount as number,
    currency:           (payment.currency as string) ?? 'INR',
    status:             'captured',
    capturedAt:         new Date().toISOString(),
  });
}

async function handleSubscriptionEnded(payload: RazorpayWebhookPayload): Promise<void> {
  const sub = payload.payload.subscription?.entity;
  if (!sub) return;

  const razorpaySubId = sub.id as string;

  const db = getDbClient();
  const { data: subRow } = await db
    .from('subscriptions')
    .select('user_id')
    .eq('razorpay_subscription_id', razorpaySubId)
    .single();

  if (!subRow) return;

  const newStatus = payload.event === 'subscription.cancelled' ? 'cancelled'
    : payload.event === 'subscription.completed'               ? 'completed'
    : 'expired';

  await updateSubscriptionStatus(razorpaySubId, newStatus as never, {});
  // Downgrade user to free plan
  await updateUserPlan(subRow.user_id as string, 'free');
  await updateUserSubscriptionStatus(subRow.user_id as string, 'cancelled');
}

async function handlePaymentCaptured(payload: RazorpayWebhookPayload): Promise<void> {
  const payment = payload.payload.payment?.entity;
  if (!payment) return;
  // Update payment status if record already exists (created via subscription.charged)
  const db = getDbClient();
  await db
    .from('payments')
    .update({ status: 'captured', captured_at: new Date().toISOString() })
    .eq('razorpay_payment_id', payment.id as string);
}

async function handlePaymentFailed(payload: RazorpayWebhookPayload): Promise<void> {
  const payment = payload.payload.payment?.entity;
  if (!payment) return;

  const db = getDbClient();

  // Try to find the user via subscription ID
  const subId = (payment.subscription_id ?? payment.order_id) as string | undefined;
  if (subId) {
    const { data: subRow } = await db
      .from('subscriptions')
      .select('user_id')
      .eq('razorpay_subscription_id', subId)
      .single();

    if (subRow) {
      await updateUserSubscriptionStatus(subRow.user_id as string, 'past_due');
    }
  }

  // Update payment record if it exists (add failure_reason from error_description)
  await db
    .from('payments')
    .update({
      status:         'failed',
      failure_reason: (payment.error_description as string) ?? null,
    })
    .eq('razorpay_payment_id', payment.id as string);
}

/**
 * subscription.halted: payment retries exhausted — set subscription to past_due.
 * Does NOT downgrade the plan yet; gives user a chance to update payment method.
 */
async function handleSubscriptionHalted(payload: RazorpayWebhookPayload): Promise<void> {
  const sub = payload.payload.subscription?.entity;
  if (!sub) return;

  const db = getDbClient();
  const { data: subRow } = await db
    .from('subscriptions')
    .select('user_id')
    .eq('razorpay_subscription_id', sub.id as string)
    .single();

  if (!subRow) return;

  await updateSubscriptionStatus(sub.id as string, 'halted', {});
  await updateUserSubscriptionStatus(subRow.user_id as string, 'past_due');
}

/**
 * subscription.resumed: user updated payment method, subscription reactivated.
 */
async function handleSubscriptionResumed(payload: RazorpayWebhookPayload): Promise<void> {
  const sub = payload.payload.subscription?.entity;
  if (!sub) return;

  const db = getDbClient();
  const { data: subRow } = await db
    .from('subscriptions')
    .select('user_id, plan')
    .eq('razorpay_subscription_id', sub.id as string)
    .single();

  if (!subRow) return;

  await updateSubscriptionStatus(sub.id as string, 'active', {
    currentStart: sub.current_start ? new Date((sub.current_start as number) * 1000).toISOString() : null,
    currentEnd:   sub.current_end   ? new Date((sub.current_end as number) * 1000).toISOString()   : null,
  });

  const plan = (subRow.plan as 'pro' | 'team') ?? 'pro';
  await updateUserPlan(subRow.user_id as string, plan);
  await updateUserSubscriptionStatus(subRow.user_id as string, 'active');
}
