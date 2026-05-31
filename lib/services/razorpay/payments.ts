// =============================================================================
// DepGraph — Razorpay Payment Verification
// Verifies HMAC SHA256 signature on payment captures.
// See: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/
// =============================================================================

import crypto from 'crypto';
import { getEnv } from '@/lib/env';

export class PaymentVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentVerificationError';
  }
}

/**
 * Verify a Razorpay payment signature.
 * The signature is HMAC SHA256 of "razorpay_order_id|razorpay_payment_id"
 * signed with RAZORPAY_KEY_SECRET.
 *
 * @throws {PaymentVerificationError} if signature is invalid
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const env = getEnv();
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new PaymentVerificationError('Invalid Razorpay payment signature');
  }

  return true;
}

/**
 * Verify a Razorpay subscription payment signature.
 * Used for subscription.charged events where there's no order_id.
 * Signature = HMAC SHA256 of "razorpay_payment_id|razorpay_subscription_id"
 */
export function verifySubscriptionPaymentSignature(
  razorpayPaymentId: string,
  razorpaySubscriptionId: string,
  razorpaySignature: string,
): boolean {
  const env = getEnv();
  const body = `${razorpayPaymentId}|${razorpaySubscriptionId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new PaymentVerificationError('Invalid Razorpay subscription payment signature');
  }

  return true;
}
