// =============================================================================
// DepGraph — GitHub API HTTP Client
// Authenticated GitHub REST API client with rate limit handling.
// Rate limit: 5,000 req/hr when authenticated (PRD §11)
// =============================================================================

import { getEnv } from '@/lib/env';
import type { GHRateLimit } from './types';

const GITHUB_API_BASE = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 8_000;
/** Warn when remaining requests fall below this threshold */
const RATE_LIMIT_WARN_THRESHOLD = 100;
/** Maximum wait time for Retry-After header (ms) */
const MAX_RETRY_AFTER_MS = 10_000;

export class GitHubRateLimitError extends Error {
  constructor(public resetAt: Date) {
    super(`GitHub API rate limit exceeded. Resets at ${resetAt.toISOString()}`);
    this.name = 'GitHubRateLimitError';
  }
}

/**
 * Make an authenticated GET request to the GitHub REST API.
 *
 * Features:
 * - Adds Authorization header (5,000 req/hr)
 * - Enforces 8s timeout
 * - Logs warning when < 100 requests remaining
 * - Single retry on 429/503 with Retry-After delay (max 10s)
 * - Returns null on 404/403 (package has no/private repo)
 *
 * @param path - API path, e.g. "/repos/expressjs/express/commits"
 * @param params - Query parameters
 */
export async function githubGet<T>(
  path: string,
  params?: Record<string, string | number>
): Promise<T | null> {
  const env = getEnv();
  const url = buildUrl(path, params);

  return executeRequest<T>(url, env.GITHUB_TOKEN, false);
}

async function executeRequest<T>(
  url: string,
  token: string,
  isRetry: boolean
): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if ((err as Error).name === 'AbortError') {
      console.error(`[GitHub] Request timed out: ${url}`);
    } else {
      console.error(`[GitHub] Network error for ${url}:`, err);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }

  // Inspect rate limit headers on every response
  checkRateLimitHeaders(response, url);

  // Handle 404/403 — repo doesn't exist or is private
  if (response.status === 404 || response.status === 403) {
    console.warn(`[GitHub] ${response.status} for ${url} — skipping`);
    return null;
  }

  // Handle 429/503 — rate limited or service unavailable
  if ((response.status === 429 || response.status === 503) && !isRetry) {
    const retryAfterMs = getRetryAfterMs(response);
    if (retryAfterMs <= MAX_RETRY_AFTER_MS) {
      console.warn(`[GitHub] Rate limited. Retrying after ${retryAfterMs}ms`);
      await sleep(retryAfterMs);
      return executeRequest<T>(url, token, true);
    }
    console.error(`[GitHub] Rate limit retry-after too long (${retryAfterMs}ms). Giving up.`);
    return null;
  }

  // 403 with rate limit exceeded (GitHub returns 403 for secondary rate limits)
  if (response.status === 403) {
    const resetHeader = response.headers.get('x-ratelimit-reset');
    if (resetHeader) {
      throw new GitHubRateLimitError(new Date(parseInt(resetHeader, 10) * 1000));
    }
    return null;
  }

  if (!response.ok) {
    console.error(`[GitHub] Unexpected status ${response.status} for ${url}`);
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    console.error(`[GitHub] Failed to parse JSON response from ${url}`);
    return null;
  }
}

function checkRateLimitHeaders(response: Response, url: string): void {
  const remaining = response.headers.get('x-ratelimit-remaining');
  const limit = response.headers.get('x-ratelimit-limit');
  const reset = response.headers.get('x-ratelimit-reset');

  if (remaining !== null && parseInt(remaining, 10) < RATE_LIMIT_WARN_THRESHOLD) {
    const resetAt = reset
      ? new Date(parseInt(reset, 10) * 1000).toISOString()
      : 'unknown';
    console.warn(
      `[GitHub] Rate limit warning: ${remaining}/${limit} remaining. Resets at ${resetAt}. URL: ${url}`
    );
  }
}

function getRetryAfterMs(response: Response): number {
  const retryAfter = response.headers.get('retry-after');
  if (!retryAfter) return 1_000;
  const seconds = parseInt(retryAfter, 10);
  return isNaN(seconds) ? 1_000 : seconds * 1_000;
}

function buildUrl(path: string, params?: Record<string, string | number>): string {
  const url = new URL(`${GITHUB_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
