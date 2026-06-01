// =============================================================================
// DepGraph — PostHog Analytics Client (Week 8)
// Server-side PostHog client for event tracking.
// Client-side tracking handled by PostHogProvider component.
// =============================================================================

import { PostHog } from 'posthog-node';

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';
  if (!key) return null;

  if (!_client) {
    _client = new PostHog(key, {
      host,
      flushAt:        20,
      flushInterval:  10000,
    });
  }
  return _client;
}

/**
 * Track a server-side event.
 * Safe to call when PostHog key is not configured — silently no-ops.
 */
export function trackEvent(
  distinctId: string,
  event:      string,
  properties?: Record<string, unknown>,
): void {
  try {
    getClient()?.capture({ distinctId, event, properties });
  } catch { /* non-fatal */ }
}

/**
 * Identify a user with traits.
 * Called on signup and plan change.
 */
export function identifyUser(
  distinctId: string,
  properties: Record<string, unknown>,
): void {
  try {
    getClient()?.identify({ distinctId, properties });
  } catch { /* non-fatal */ }
}

/** Flush pending events. Call on serverless function exit if needed. */
export async function flushAnalytics(): Promise<void> {
  try {
    await getClient()?.shutdown();
  } catch { /* non-fatal */ }
}
