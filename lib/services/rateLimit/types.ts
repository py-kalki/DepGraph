// =============================================================================
// DepGraph — Rate Limit Types (Week 7)
// =============================================================================

export interface RateLimitState {
  limit:     number;
  remaining: number;
  reset:     number;  // Unix epoch seconds
  used:      number;
  paused:    boolean;
}

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs:  number;
  jitter:      boolean;
}

export const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs:  30000,
  jitter:      true,
};
