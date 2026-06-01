// =============================================================================
// DepGraph — Razorpay Plan Constants
// PRD §15: Pro = $19/month, Team = $79/month
// Amounts stored in paise (INR). These plan IDs are created in the
// Razorpay Dashboard and referenced here via env or constants.
// =============================================================================

import { getEnv } from '@/lib/env';

/** Map plan names to Razorpay plan IDs (set via env or hardcoded test IDs) */
export function getRazorpayPlanId(plan: 'pro' | 'team'): string {
  // In production, create plans in the Razorpay dashboard and set env vars.
  // In development/test, use placeholder IDs.
  const env = getEnv();
  if (plan === 'pro') {
    return process.env.RAZORPAY_PRO_PLAN_ID ?? 'plan_pro_placeholder';
  }
  if (plan === 'team') {
    return process.env.RAZORPAY_TEAM_PLAN_ID ?? 'plan_team_placeholder';
  }
  throw new Error(`Unknown plan: ${plan}`);
}

/** Plan amounts in paise (1 INR = 100 paise) */
export const PLAN_AMOUNTS_PAISE: Record<'pro' | 'team', number> = {
  pro:  99_00,  // ₹99/month
  team: 7900_00,  // deprecated
};
