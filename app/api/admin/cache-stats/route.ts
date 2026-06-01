// =============================================================================
// DepGraph — GET /api/admin/cache-stats
// Internal observability endpoint — returns Redis cache hit/miss stats.
// Protected by CRON_SECRET header.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/cache/monitor';
import { getGitHubRateLimitState } from '@/lib/services/rateLimit/githubQueue';
import { getEnv } from '@/lib/env';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${getEnv().CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [cacheStats, rateLimitState] = await Promise.all([
    getCacheStats(),
    Promise.resolve(getGitHubRateLimitState()),
  ]);

  return NextResponse.json({
    cache:     cacheStats,
    github:    rateLimitState,
    timestamp: new Date().toISOString(),
  });
}
