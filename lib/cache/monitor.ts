// =============================================================================
// DepGraph — Cache Hit/Miss Monitor (Week 7)
// Records cache statistics in Redis for observability.
// =============================================================================

import { cacheGet, cacheSet } from './redis';

const STATS_KEY   = 'cache:stats';
const STATS_TTL   = 60 * 60 * 24 * 7; // 7 days

type CacheStats = {
  hits:   number;
  misses: number;
  updatedAt: string;
};

async function getStats(): Promise<CacheStats> {
  return (await cacheGet<CacheStats>(STATS_KEY)) ?? { hits: 0, misses: 0, updatedAt: new Date().toISOString() };
}

export async function recordCacheHit(): Promise<void> {
  try {
    const stats = await getStats();
    stats.hits++;
    stats.updatedAt = new Date().toISOString();
    await cacheSet(STATS_KEY, stats, STATS_TTL);
  } catch { /* non-fatal */ }
}

export async function recordCacheMiss(): Promise<void> {
  try {
    const stats = await getStats();
    stats.misses++;
    stats.updatedAt = new Date().toISOString();
    await cacheSet(STATS_KEY, stats, STATS_TTL);
  } catch { /* non-fatal */ }
}

export async function getCacheStats(): Promise<CacheStats & { hitRate: string }> {
  const stats = await getStats();
  const total   = stats.hits + stats.misses;
  const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(1) + '%' : 'N/A';
  return { ...stats, hitRate };
}

export async function resetCacheStats(): Promise<void> {
  await cacheSet(STATS_KEY, { hits: 0, misses: 0, updatedAt: new Date().toISOString() }, STATS_TTL);
}
