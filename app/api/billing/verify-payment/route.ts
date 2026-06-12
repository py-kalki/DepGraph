// =============================================================================
// DepGraph — API: POST /api/billing/verify-payment
// Verifies a Razorpay payment signature after checkout completion.
// Accepts both snake_case (from Razorpay SDK) and camelCase field names.
// On success, activates the subscription + records payment in DB.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  verifyPaymentSignature,
  PaymentVerificationError,
} from '@/lib/services/razorpay/payments';
import { updateSubscriptionStatus, insertPayment } from '@/lib/db/queries/billing';
import { updateUserPlan, updateUserSubscriptionStatus } from '@/lib/db/queries/users';
import { getDbClient } from '@/lib/db/client';
import { getRazorpay } from '@/lib/services/razorpay/client';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Accept both snake_case (Razorpay SDK) and camelCase
  const paymentId      = (body.razorpay_payment_id      ?? body.razorpayPaymentId)      as string | undefined;
  const subscriptionId = (body.razorpay_subscription_id ?? body.razorpaySubscriptionId) as string | undefined;
  const signature      = (body.razorpay_signature       ?? body.razorpaySignature)       as string | undefined;
  const orderId        = (body.razorpay_order_id        ?? body.razorpayOrderId)         as string | undefined;

  if (!paymentId || !signature) {
    return NextResponse.json(
      { error: 'razorpay_payment_id and razorpay_signature are required' },
      { status: 400 },
    );
  }

  try {
    // Verify HMAC signature if order-based payment
    if (orderId) {
      verifyPaymentSignature(orderId, paymentId, signature);
    }

    // Resolve plan from subscription record
    let plan: 'pro' = 'pro';
    if (subscriptionId) {
      const db = getDbClient();
      const { data: subRow } = await db
        .from('subscriptions')
        .select('plan')
        .eq('razorpay_subscription_id', subscriptionId)
        .eq('user_id', session.userId)
        .single();

      if (subRow?.plan) plan = subRow.plan as 'pro';

      // Activate subscription in DB
      await updateSubscriptionStatus(subscriptionId, 'authenticated', {});
    }

    // Update user plan + status
    await updateUserPlan(session.userId, plan);
    await updateUserSubscriptionStatus(session.userId, 'active');

    // Fetch payment details from Razorpay to record amount, currency, method
    try {
      const razorpay = getRazorpay();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payment = await (razorpay.payments as any).fetch(paymentId) as Record<string, unknown>;

      // Record payment in DB (shows in billing history)
      await insertPayment({
        userId:            session.userId,
        subscriptionId:    subscriptionId ?? null,
        razorpayPaymentId: paymentId,
        razorpayOrderId:   orderId ?? null,
        amount:            (payment.amount as number) ?? 0,
        currency:          (payment.currency as string) ?? 'INR',
        status:            'captured',
        capturedAt:        new Date().toISOString(),
      });
    } catch (e) {
      // Non-fatal — plan is already activated
      console.warn('[verify-payment] Could not record payment row:', e);
    }

    console.log(`[verify-payment] Activated plan=${plan} for user=${session.userId} payment=${paymentId}`);

    return NextResponse.json({ success: true, plan, paymentId });

  } catch (err) {
    if (err instanceof PaymentVerificationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[POST /api/billing/verify-payment]', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
