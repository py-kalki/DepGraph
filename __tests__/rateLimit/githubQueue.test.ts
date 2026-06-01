// =============================================================================
// DepGraph — Tests: rateLimit/githubQueue
// Tests the exported functions only (class is not exported by design).
// =============================================================================

import { backoffDelay, githubQueue, getGitHubRateLimitState } from '@/lib/services/rateLimit/githubQueue';

describe('backoffDelay', () => {
  it('returns increasing delays for successive attempts', () => {
    const d1 = backoffDelay(1, { baseDelayMs: 1000, maxDelayMs: 30000, jitter: false });
    const d2 = backoffDelay(2, { baseDelayMs: 1000, maxDelayMs: 30000, jitter: false });
    const d3 = backoffDelay(3, { baseDelayMs: 1000, maxDelayMs: 30000, jitter: false });
    expect(d1).toBe(1000);
    expect(d2).toBe(2000);
    expect(d3).toBe(4000);
  });

  it('caps at maxDelayMs', () => {
    const d = backoffDelay(10, { baseDelayMs: 1000, maxDelayMs: 5000, jitter: false });
    expect(d).toBe(5000);
  });

  it('adds jitter when enabled', () => {
    const results = new Set<number>();
    for (let i = 0; i < 20; i++) {
      results.add(backoffDelay(1, { baseDelayMs: 1000, maxDelayMs: 30000, jitter: true }));
    }
    // With jitter, not all 20 results should be identical
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('githubQueue.parseHeaders', () => {
  beforeEach(() => {
    // Reset state by feeding a healthy state before each test
    const safeHeaders = new Headers({
      'x-ratelimit-limit':     '5000',
      'x-ratelimit-remaining': '4800',
      'x-ratelimit-reset':     String(Math.floor(Date.now() / 1000) + 3600),
      'x-ratelimit-used':      '200',
    });
    githubQueue.parseHeaders(safeHeaders);
  });

  it('sets paused=true when remaining < 100', () => {
    const headers = new Headers({
      'x-ratelimit-limit':     '5000',
      'x-ratelimit-remaining': '50',
      'x-ratelimit-reset':     String(Math.floor(Date.now() / 1000) + 60),
      'x-ratelimit-used':      '4950',
    });
    githubQueue.parseHeaders(headers);
    const state = getGitHubRateLimitState();
    expect(state.paused).toBe(true);
    expect(state.remaining).toBe(50);
  });

  it('sets paused=false when remaining >= 100', () => {
    const headers = new Headers({
      'x-ratelimit-limit':     '5000',
      'x-ratelimit-remaining': '4500',
      'x-ratelimit-reset':     String(Math.floor(Date.now() / 1000) + 3600),
      'x-ratelimit-used':      '500',
    });
    githubQueue.parseHeaders(headers);
    const state = getGitHubRateLimitState();
    expect(state.paused).toBe(false);
    expect(state.remaining).toBe(4500);
  });

  it('reads limit and used from headers', () => {
    const headers = new Headers({
      'x-ratelimit-limit':     '5000',
      'x-ratelimit-remaining': '3000',
      'x-ratelimit-reset':     String(Math.floor(Date.now() / 1000) + 3600),
      'x-ratelimit-used':      '2000',
    });
    githubQueue.parseHeaders(headers);
    const state = getGitHubRateLimitState();
    expect(state.limit).toBe(5000);
    expect(state.used).toBe(2000);
  });
});
