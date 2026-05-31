// =============================================================================
// Tests: billing/payment
// Tests verifyPaymentSignature and POST /api/billing/verify-payment.
// =============================================================================

import crypto from 'crypto';
import {
  verifyPaymentSignature,
  PaymentVerificationError,
} from '@/lib/services/razorpay/payments';

// Set test env vars before importing env
process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';

beforeEach(() => jest.clearAllMocks());

// ─── verifyPaymentSignature ───────────────────────────────────────────────────

describe('verifyPaymentSignature', () => {
  function makeSignature(orderId: string, paymentId: string): string {
    return crypto
      .createHmac('sha256', 'test_key_secret')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }

  test('returns true for valid signature', () => {
    const orderId   = 'order_test123';
    const paymentId = 'pay_test456';
    const signature = makeSignature(orderId, paymentId);
    expect(verifyPaymentSignature(orderId, paymentId, signature)).toBe(true);
  });

  test('throws PaymentVerificationError for wrong signature', () => {
    expect(() => verifyPaymentSignature('order_1', 'pay_1', 'bad_signature')).toThrow(
      PaymentVerificationError,
    );
  });

  test('throws PaymentVerificationError when order/payment IDs are swapped', () => {
    const sig = makeSignature('order_1', 'pay_1');
    expect(() => verifyPaymentSignature('pay_1', 'order_1', sig)).toThrow(
      PaymentVerificationError,
    );
  });

  test('PaymentVerificationError has correct name', () => {
    try {
      verifyPaymentSignature('a', 'b', 'bad');
    } catch (err) {
      expect(err).toBeInstanceOf(PaymentVerificationError);
      expect((err as PaymentVerificationError).name).toBe('PaymentVerificationError');
    }
  });
});
