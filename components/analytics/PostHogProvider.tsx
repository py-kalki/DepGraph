'use client';

// =============================================================================
// DepGraph — PostHog Client-Side Provider (Week 8)
// Wraps the app with PostHog for automatic pageview + click tracking.
// =============================================================================

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function PostHogProvider({ children }: Props) {
  useEffect(() => {
    const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';
    if (!key) return;

    posthog.init(key, {
      api_host:                       host,
      capture_pageview:               true,
      capture_pageleave:              true,
      autocapture:                    false, // manual events only
      session_recording: {
        maskAllInputs:                true,
      },
    });
  }, []);

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return <>{children}</>;

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
