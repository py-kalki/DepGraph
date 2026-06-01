// =============================================================================
// DepGraph — Typed Analytics Events (Week 8)
// Single source of truth for all PostHog event names + typed wrappers.
// =============================================================================

import { trackEvent, identifyUser } from './posthog';

// ─── Event Name Constants ────────────────────────────────────────────────────

export const EVENTS = {
  USER_SIGNUP:              'user_signup',
  FIRST_SCAN:               'first_scan',
  PROJECT_CREATED:          'project_created',
  DASHBOARD_VISIT:          'dashboard_visit',
  SUBSCRIPTION_UPGRADED:    'subscription_upgraded',
  ACTION_INSTALLED:         'action_installed',
  ALERT_CREATED:            'alert_created',
  FEEDBACK_SUBMITTED:       'feedback_submitted',
  API_KEY_CREATED:          'api_key_created',
  REPORT_SHARED:            'report_shared',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

// ─── Typed Tracking Wrappers ─────────────────────────────────────────────────

export function trackSignup(userId: string, properties: { plan: string; githubLogin: string }) {
  trackEvent(userId, EVENTS.USER_SIGNUP, properties);
  identifyUser(userId, { plan: properties.plan, github_login: properties.githubLogin });
}

export function trackFirstScan(userId: string, properties: { packageCount: number; overallScore: number }) {
  trackEvent(userId, EVENTS.FIRST_SCAN, properties);
}

export function trackProjectCreated(userId: string, properties: { githubRepo: string | null; plan: string }) {
  trackEvent(userId, EVENTS.PROJECT_CREATED, properties);
}

export function trackSubscriptionUpgraded(userId: string, properties: { plan: string; previousPlan: string; mrr: number }) {
  trackEvent(userId, EVENTS.SUBSCRIPTION_UPGRADED, properties);
  identifyUser(userId, { plan: properties.plan });
}

export function trackAlertCreated(userId: string, properties: { alertType: string; channel: string }) {
  trackEvent(userId, EVENTS.ALERT_CREATED, properties);
}

export function trackFeedbackSubmitted(userId: string, properties: { rating: number; category: string }) {
  trackEvent(userId, EVENTS.FEEDBACK_SUBMITTED, properties);
}

export function trackApiKeyCreated(userId: string) {
  trackEvent(userId, EVENTS.API_KEY_CREATED);
}
