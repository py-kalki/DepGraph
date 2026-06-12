// =============================================================================
// DepGraph — POST /api/billing/sync
// Backfills invoices for the current user by fetching all payments for their
// active subscription from Razorpay. Idempotent — skips existing records.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getActiveSubscriptionByUserId, insertInvoice } from '@/lib/db/queries/billing';
import { getRazorpay } from '@/lib/services/razorpay/client';
import { getDbClient } from '@/lib/db/client';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subscription = await getActiveSubscriptionByUserId(session.userId);
  if (!subscription) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }

  try {
    const razorpay = getRazorpay();
    const db = getDbClient();

    // Only fetch payments created AFTER this subscription was recorded in our DB.
    // This prevents historical payments from earlier subscriptions/accounts bleeding in.
    const subscriptionCreatedAt = subscription.created_at
      ? Math.floor(new Date(subscription.created_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - 86400; // default: last 24h

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (razorpay.payments as any).all({
      subscription_id: subscription.razorpay_subscription_id,
      from:  subscriptionCreatedAt,
      count: 20,
    }) as { items?: Record<string, unknown>[] };

    const payments = result.items ?? [];
    let synced = 0;

    for (const payment of payments) {
      const paymentId = payment.id as string;
      if (!paymentId) continue;

      // Skip payments outside expected amount range (₹99 = 9900 paise, allow ±50%)
      const amount = (payment.amount as number) ?? 0;
      if (amount > 20000) {
        console.log(`[billing/sync] Skipping payment ${paymentId} with amount ${amount} (too high)`);
        continue;
      }

      // Check if we already have this invoice
      const { data: existing } = await db
        .from('invoices')
        .select('id')
        .eq('razorpay_payment_id', paymentId)
        .single();

      if (existing) continue; // already recorded

      // Insert invoice record
      await insertInvoice({
        userId:            session.userId,
        subscriptionId:    subscription.id,
        razorpayInvoiceId: null,
        razorpayPaymentId: paymentId,
        amountPaise:       amount,
        currency:          (payment.currency as string) ?? 'INR',
        pdfUrl:            `/api/billing/invoice/${paymentId}`,
        paidAt:            payment.created_at
          ? new Date((payment.created_at as number) * 1000).toISOString()
          : new Date().toISOString(),
      });
      synced++;
    }

    return NextResponse.json({
      success: true,
      synced,
      total: payments.length,
      message: synced > 0 ? `Synced ${synced} payment(s)` : 'All payments already recorded',
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/billing/sync]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
