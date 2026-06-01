// =============================================================================
// DepGraph — GitHub API Rate Limit Queue (Week 7)
// Token-bucket singleton that throttles outbound GitHub API requests.
// Reads X-RateLimit-Remaining / X-RateLimit-Reset from every response.
// Pauses all requests when remaining < 100; resumes at reset time.
// =============================================================================

import { createLogger } from '@/lib/logger';
import type { RateLimitState, RetryOptions } from './types';

const log = createLogger('github-queue');

const PAUSE_THRESHOLD = 100;  // pause when fewer than this many requests remain

class GitHubRateLimitQueue {
  private state: RateLimitState = {
    limit:     5000,
    remaining: 5000,
    reset:     0,
    used:      0,
    paused:    false,
  };

  /** Parse rate-limit headers from a GitHub API response. */
  parseHeaders(headers: Headers): void {
    const limit     = parseInt(headers.get('x-ratelimit-limit')     ?? '5000', 10);
    const remaining = parseInt(headers.get('x-ratelimit-remaining') ?? '5000', 10);
    const reset     = parseInt(headers.get('x-ratelimit-reset')     ?? '0',    10);
    const used      = parseInt(headers.get('x-ratelimit-used')      ?? '0',    10);

    this.state = { limit, remaining, reset, used, paused: remaining < PAUSE_THRESHOLD };

    if (this.state.paused) {
      const resumeIn = Math.max(0, reset - Math.floor(Date.now() / 1000));
      log.warn('GitHub rate limit low — pausing requests', { remaining, resumeIn: `${resumeIn}s` });
    } else if (remaining < 500) {
      log.warn('GitHub rate limit running low', { remaining, limit });
    }
  }

  /** How many ms to wait before the rate limit window resets. */
  private msUntilReset(): number {
    if (!this.state.reset) return 0;
    return Math.max(0, this.state.reset * 1000 - Date.now());
  }

  /** Wait until rate limit is no longer paused. */
  async waitIfPaused(): Promise<void> {
    if (!this.state.paused) return;
    const wait = this.msUntilReset() + 500; // +500ms safety margin
    log.info(`Rate limit paused — waiting ${wait}ms until reset`);
    await new Promise((r) => setTimeout(r, wait));
    this.state.paused   = false;
    this.state.remaining = this.state.limit;
  }

  getState(): Readonly<RateLimitState> {
    return { ...this.state };
  }
}

/** Singleton shared across all GitHub API callers. */
export const githubQueue = new GitHubRateLimitQueue();

/**
 * Exponential backoff with jitter.
 * Delays: ~1s, ~2s, ~4s (±25% jitter each step).
 */
export function backoffDelay(attempt: number, opts: Pick<RetryOptions, 'baseDelayMs' | 'maxDelayMs' | 'jitter'>): number {
  const base    = opts.baseDelayMs * Math.pow(2, attempt - 1);
  const capped  = Math.min(base, opts.maxDelayMs);
  const jitter  = opts.jitter ? capped * 0.25 * Math.random() : 0;
  return Math.floor(capped + jitter);
}

/**
 * Wraps a fetch-like function with:
 * 1. Rate-limit pause check before the request
 * 2. Header parsing after the response
 * 3. Automatic retry on 429/403 with exponential backoff
 */
export async function githubFetchWithRateLimit(
  url: string,
  options: RequestInit,
  maxAttempts = 3,
): Promise<Response> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Wait if currently paused
    await githubQueue.waitIfPaused();

    const res = await fetch(url, options);

    // Always parse rate-limit headers
    githubQueue.parseHeaders(res.headers);

    if (res.status === 429 || res.status === 403) {
      if (attempt < maxAttempts) {
        const delay = backoffDelay(attempt, { baseDelayMs: 2000, maxDelayMs: 30000, jitter: true });
        log.warn(`GitHub API ${res.status} on attempt ${attempt}/${maxAttempts} — retrying in ${delay}ms`, { url });
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
    }

    return res;
  }

  throw new Error(`GitHub API request failed after ${maxAttempts} attempts: ${url}`);
}

export function getGitHubRateLimitState(): Readonly<RateLimitState> {
  return githubQueue.getState();
}
