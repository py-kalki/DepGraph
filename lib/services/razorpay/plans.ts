// =============================================================================
// DepGraph — Razorpay Plan Constants
// PRD §15: Pro = $19/month, Team = $79/month
// Amounts stored in paise (INR). These plan IDs are created in the
// Razorpay Dashboard and referenced here via env or constants.
// =============================================================================

import { getEnv } from '@/lib/env';

/** Map plan names to Razorpay plan IDs (set via env or hardcoded test IDs) */
export function getRazorpayPlanId(plan: 'pro'): string {
  if (plan === 'pro') {
    const planId = process.env.RAZORPAY_PLAN_ID_PRO ?? process.env.RAZORPAY_PRO_PLAN_ID;
    if (!planId) throw new Error('RAZORPAY_PLAN_ID_PRO env var is not set');
    return planId;
  }
  throw new Error(`Unknown plan: ${plan}`);
}

/** Plan amounts in paise (1 INR = 100 paise) */
export const PLAN_AMOUNTS_PAISE: Record<'pro', number> = {
  pro:  99_00,  // ₹99/month
};
