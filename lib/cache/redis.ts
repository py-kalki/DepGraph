// =============================================================================
// DepGraph — Upstash Redis Client
// Wraps @upstash/redis with typed get/set helpers and TTL constants.
// Per PRD caching strategy (§11):
//   - Per-package scores:   24hr
//   - GitHub API responses:  6hr
//   - npm download stats:   12hr
//   - Full scan results:     1hr (keyed by lockfileHash)
// =============================================================================

import { Redis } from '@upstash/redis';
import { getEnv } from '@/lib/env';

// ─── TTL Constants (seconds) ──────────────────────────────────────────────────

export const TTL = {
  /** Per-package composite score — 24 hours */
  PACKAGE_SCORE: 86_400,
  /** GitHub API signals — 6 hours */
  GITHUB_SIGNALS: 21_600,
  /** npm metadata + download stats — 12 hours */
  NPM_SIGNALS: 43_200,
  /** OSV vulnerability data — 24 hours */
  OSV_SIGNALS: 86_400,
  /** Full scan report keyed by lockfile hash — 1 hour */
  SCAN_REPORT: 3_600,
  /** Public share report — 1 hour */
  SHARE_REPORT: 3_600,
} as const;

// ─── Client singleton ─────────────────────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    const env = getEnv();
    _redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

// ─── Typed Helpers ────────────────────────────────────────────────────────────

/**
 * Get a cached value. Returns null on miss or error.
 * All values stored as JSON strings.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const value = await redis.get<T>(key);
    return value ?? null;
  } catch (err) {
    console.error(`[Cache] GET failed for key "${key}":`, err);
    return null;
  }
}

/**
 * Set a cached value with a TTL (seconds).
 * Silently swallows errors — cache failures must never break a scan.
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.error(`[Cache] SET failed for key "${key}":`, err);
  }
}

/**
 * Delete a cached value. Used for on-demand re-scans (Pro tier).
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch (err) {
    console.error(`[Cache] DEL failed for key "${key}":`, err);
  }
}

/**
 * Cache-aside helper: returns cached value if present,
 * otherwise calls fetcher, caches the result, and returns it.
 */
export async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  if (fresh !== null) {
    await cacheSet(key, fresh, ttlSeconds);
  }
  return fresh;
}

export { getRedis };
