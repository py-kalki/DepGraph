// =============================================================================
// DepGraph — API: POST /api/billing/create-subscription
// Creates a Razorpay subscription for the authenticated user.
// Returns subscriptionId + short_url for the Razorpay checkout page.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getRazorpay } from '@/lib/services/razorpay/client';
import { getRazorpayPlanId } from '@/lib/services/razorpay/plans';
import { createRazorpaySubscription } from '@/lib/services/razorpay/subscriptions';
import { upsertCustomer, createSubscriptionRecord } from '@/lib/db/queries/billing';
import { getUserById } from '@/lib/db/queries/users';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { plan?: string };
  try {
    body = (await req.json()) as { plan?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const plan = 'pro';
  const planId = getRazorpayPlanId(plan);

  try {
    const user = await getUserById(session.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Upsert Razorpay customer
    const razorpay = getRazorpay();
    let razorpayCustomerId = user.razorpay_customer_id ?? null;

    if (!razorpayCustomerId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customer = await (razorpay.customers as any).create({
        email: user.email ?? `${user.github_login}@users.noreply.github.com`,
        name:  user.github_login,
      });
      razorpayCustomerId = customer.id as string;
    }

    await upsertCustomer(session.userId, razorpayCustomerId, user.email);

    // Create subscription
    const subscription = await createRazorpaySubscription(razorpayCustomerId, planId);

    // Persist subscription record
    await createSubscriptionRecord({
      userId:                  session.userId,
      razorpaySubscriptionId:  subscription.id,
      razorpayPlanId:          planId,
      plan,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId:  process.env.RAZORPAY_KEY_ID,  // public key for client-side popup
      shortUrl:       subscription.shortUrl,          // fallback hosted page
      checkoutUrl:    subscription.shortUrl,
      plan,
    }, { status: 201 });

  } catch (err) {
    // Log the full Razorpay error so we can debug in Vercel logs
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[POST /api/billing/create-subscription] Razorpay error:', errMsg);
    return NextResponse.json({ error: errMsg || 'Failed to create subscription' }, { status: 500 });
  }
}
