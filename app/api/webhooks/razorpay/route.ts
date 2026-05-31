// =============================================================================
// DepGraph — API: POST /api/webhooks/razorpay
// Razorpay webhook receiver.
// Security: HMAC SHA256 signature verification via RAZORPAY_WEBHOOK_SECRET.
// Idempotency: duplicate event IDs are skipped via webhook_events table.
// PRD §11 events: subscription.activated, subscription.charged,
//   subscription.cancelled, payment.captured, payment.failed
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  processWebhookEvent,
  WebhookVerificationError,
  type RazorpayWebhookPayload,
} from '@/lib/services/razorpay/webhooks';

// Razorpay sends the signature in this header
const SIGNATURE_HEADER = 'x-razorpay-signature';

export async function POST(req: NextRequest) {
  // 1. Read raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get(SIGNATURE_HEADER);

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  // 2. Verify signature
  try {
    verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.warn('[Webhook] Invalid Razorpay signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    throw err;
  }

  // 3. Parse payload
  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // 4. Generate event ID for idempotency (use Razorpay's event ID or hash)
  const razorpayEventId =
    (payload.id as string | undefined) ??
    `${payload.event}:${payload.created_at}:${JSON.stringify(payload.payload).slice(0, 32)}`;

  // 5. Process event (idempotent — duplicate events are skipped)
  try {
    await processWebhookEvent(razorpayEventId, payload);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    // Return 500 so Razorpay retries delivery
    console.error('[Webhook] processWebhookEvent failed:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
