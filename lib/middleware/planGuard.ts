// =============================================================================
// DepGraph — Plan Guard Middleware
// Enforces plan limits per PRD §15 and §F-04.
// All functions are pure — no DB access — callers pass in the values.
// =============================================================================

import type { PlanTier } from '@/lib/types';
import { PLAN_LIMITS } from '@/lib/types';

// ─── Error Classes ────────────────────────────────────────────────────────────

export class PlanLimitError extends Error {
  public readonly statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'PlanLimitError';
  }
}

export class SubscriptionError extends Error {
  public readonly statusCode = 402;
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

// ─── Guards ───────────────────────────────────────────────────────────────────

/**
 * Assert that a free user has not reached the 3-project limit.
 * @throws {PlanLimitError} if free tier project cap is reached
 */
export function assertProjectLimit(plan: PlanTier, currentProjectCount: number): void {
  const limits = PLAN_LIMITS[plan];
  if (limits.maxProjects !== null && currentProjectCount >= limits.maxProjects) {
    throw new PlanLimitError(
      `Free tier limit: maximum ${limits.maxProjects} saved projects. ` +
      `Upgrade to Pro for unlimited projects.`,
    );
  }
}

/**
 * Assert the user is allowed to request N days of history.
 * Free: 30 days. Pro/Team: 365 days.
 * @throws {PlanLimitError} if requesting more history than plan allows
 */
export function assertHistoryAccess(plan: PlanTier, requestedDays: number): void {
  const limits = PLAN_LIMITS[plan];
  if (requestedDays > limits.historyDays) {
    throw new PlanLimitError(
      `Your plan allows ${limits.historyDays}-day history. ` +
      `Upgrade to Pro for 365-day history.`,
    );
  }
}

/**
 * Assert the user's plan includes a specific Pro feature.
 * @throws {PlanLimitError} for free users accessing Pro-only features
 */
export function assertProFeature(
  plan: PlanTier,
  feature: 'onDemandRefresh' | 'privateRepos',
): void {
  const limits = PLAN_LIMITS[plan];
  if (feature === 'onDemandRefresh' && !limits.canOnDemandRefresh) {
    throw new PlanLimitError(
      'On-demand re-scan is a Pro feature. Upgrade to get priority re-scans.',
    );
  }
  if (feature === 'privateRepos' && !limits.canUsePrivateRepos) {
    throw new PlanLimitError(
      'Private repository support requires a Pro plan.',
    );
  }
}

/**
 * Assert that the user's subscription is active (not past_due or inactive).
 * @throws {SubscriptionError} if subscription is past_due
 */
export function assertActiveSubscription(subscriptionStatus: string): void {
  if (subscriptionStatus === 'past_due') {
    throw new SubscriptionError(
      'Your subscription payment has failed. Please update your payment method to continue.',
    );
  }
}

/**
 * Parse the `?days=N` query parameter and clamp to plan limits.
 * Returns the allowed number of days (never exceeds plan limit).
 */
export function clampHistoryDays(plan: PlanTier, requestedDays: number | undefined): number {
  const limits = PLAN_LIMITS[plan];
  const days = requestedDays ?? 30;
  return Math.min(days, limits.historyDays);
}

/**
 * Assert the user's plan allows private repository access.
 * Free tier: public repos only. Pro/Team: public + private.
 * @throws {PlanLimitError} for free users
 */
export function assertPrivateRepoAccess(plan: string): void {
  if (plan === 'free') {
    throw new PlanLimitError(
      'Private repository access requires a Pro or Team plan.',
    );
  }
}

/**
 * Assert the user's plan allows the specified alert type.
 * Free tier: digest only. Pro/Team: all alert types.
 * @throws {PlanLimitError} if free user tries to create a real-time alert
 */
export function assertAlertAccess(plan: string, alertType: string): void {
  const realTimeAlerts = ['score_drop', 'new_cve', 'abandonment_risk'];
  if (plan === 'free' && realTimeAlerts.includes(alertType)) {
    throw new PlanLimitError(
      'Real-time alerts (score_drop, new_cve, abandonment_risk) require a Pro plan. ' +
      'Free tier includes weekly digest only.',
    );
  }
}
