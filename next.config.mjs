// =============================================================================
// DepGraph — next.config.mjs (Week 7 — deployment readiness)
// Added: gzip compression, remove X-Powered-By header
// =============================================================================

import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,               // gzip response compression
  poweredByHeader: false,       // remove X-Powered-By: Next.js header (security)
  serverExternalPackages: ['os', 'crypto', 'child_process'],
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  hideSourceMaps: true,
});
