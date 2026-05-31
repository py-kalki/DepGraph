// =============================================================================
// DepGraph — API: POST /api/billing/verify-payment
// Verifies a Razorpay payment signature after checkout completion.
// On success, activates the plan immediately (webhook will also fire).
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  verifyPaymentSignature,
  PaymentVerificationError,
} from '@/lib/services/razorpay/payments';
import { updateSubscriptionStatus } from '@/lib/db/queries/billing';
import { updateUserPlan, updateUserSubscriptionStatus } from '@/lib/db/queries/users';
import { getDbClient } from '@/lib/db/client';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    razorpaySubscriptionId?: string;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, razorpaySubscriptionId } = body;

  if (!razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json(
      { error: 'razorpayPaymentId and razorpaySignature are required' },
      { status: 400 },
    );
  }

  try {
    // Verify signature
    if (razorpayOrderId) {
      verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    }

    // Find subscription record to determine plan
    if (razorpaySubscriptionId) {
      const db = getDbClient();
      const { data: subRow } = await db
        .from('subscriptions')
        .select('plan')
        .eq('razorpay_subscription_id', razorpaySubscriptionId)
        .eq('user_id', session.userId)
        .single();

      const plan = (subRow?.plan as 'pro' | 'team') ?? 'pro';

      // Optimistically activate plan (webhook will confirm)
      await updateSubscriptionStatus(razorpaySubscriptionId, 'authenticated', {});
      await updateUserPlan(session.userId, plan);
      await updateUserSubscriptionStatus(session.userId, 'active');
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    if (err instanceof PaymentVerificationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[POST /api/billing/verify-payment]', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
