// =============================================================================
// DepGraph — Cache Warmer (Week 7)
// Pre-fills Redis with scores for the most-queried packages.
// Called by the daily cron job to maximize cache hit rate.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import { cacheGet, cacheSet, TTL } from '@/lib/cache/redis';
import { CacheKeys } from '@/lib/cache/keys';
import { getNpmSignals, getPackageRepoUrl } from '@/lib/services/npm';
import { getGitHubSignals } from '@/lib/services/github';
import { getOsvSignals } from '@/lib/services/osv';
import { computePackageScore } from '@/lib/services/scoring/engine';
import { createLogger } from '@/lib/logger';
import type { PackageScore, RawSignals } from '@/lib/types';

const log = createLogger('cache-warmer');

const TOP_N = 50; // warm the top 50 most-scanned packages

/**
 * Fetch the top-N most frequently scanned packages from the DB.
 * Uses the package_scores table ordered by how recently they were computed.
 */
async function getTopPackages(): Promise<string[]> {
  const db = getDbClient();
  const { data } = await db
    .from('package_scores')
    .select('package_name')
    .order('computed_at', { ascending: false })
    .limit(TOP_N);

  return (data ?? []).map((r: { package_name: string }) => r.package_name);
}

/**
 * Warm a single package — skip if already cached.
 */
async function warmPackage(name: string): Promise<'hit' | 'warmed' | 'error'> {
  const cacheKey = CacheKeys.packageScore(name);
  const cached   = await cacheGet<PackageScore>(cacheKey);
  if (cached) return 'hit';

  try {
    const repoUrl = await getPackageRepoUrl(name);
    const [npm, github, osv] = await Promise.all([
      getNpmSignals(name),
      getGitHubSignals(repoUrl),
      getOsvSignals(name, undefined),
    ]);

    const signals: RawSignals = { github, npm, osv, fetchedAt: new Date() };
    const score = computePackageScore(name, null, signals);
    await cacheSet(cacheKey, score, TTL.PACKAGE_SCORE);
    return 'warmed';
  } catch {
    return 'error';
  }
}

/**
 * Main entry point — warms the top-N packages.
 * Safe to call concurrently; individual failures do not stop the batch.
 */
export async function warmTopPackages(): Promise<{ hit: number; warmed: number; errors: number }> {
  log.info('Cache warmer starting', { topN: TOP_N });
  const start    = Date.now();
  const packages = await getTopPackages();

  const results = await Promise.allSettled(packages.map((name) => warmPackage(name)));

  const counts = { hit: 0, warmed: 0, errors: 0 };
  for (const r of results) {
    if (r.status === 'fulfilled') {
      if (r.value === 'hit')    counts.hit++;
      else if (r.value === 'warmed') counts.warmed++;
      else counts.errors++;
    } else {
      counts.errors++;
    }
  }

  log.info('Cache warmer complete', { ...counts, ms: Date.now() - start });
  return counts;
}
