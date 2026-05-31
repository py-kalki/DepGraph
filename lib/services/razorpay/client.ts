// =============================================================================
// DepGraph — Razorpay SDK Singleton
// PRD §11: "Payments: RAZORPAY"
// =============================================================================

import Razorpay from 'razorpay';
import { getEnv } from '@/lib/env';

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    const env = getEnv();
    _razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

/** Reset singleton (for testing only) */
export function _resetRazorpayClient(): void {
  _razorpay = null;
}
