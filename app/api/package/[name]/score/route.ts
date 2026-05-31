// =============================================================================
// GET /api/package/:name/score
// Public endpoint — no auth required (PRD §13 public endpoints).
// Returns health score + signals for a single npm package.
// Cache: 24hr (via Redis — served from cache when available).
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNpmSignals, getPackageRepoUrl } from '@/lib/services/npm';
import { getGitHubSignals } from '@/lib/services/github';
import { getOsvSignals } from '@/lib/services/osv';
import { computePackageScore } from '@/lib/services/scoring/engine';
import { cacheGet, cacheSet, TTL } from '@/lib/cache/redis';
import { CacheKeys } from '@/lib/cache/keys';
import { upsertPackageScore } from '@/lib/db/queries/packages';
import { insertScoreHistory } from '@/lib/db/queries/history';
import type { PackageScore, PackageScoreResponse, RawSignals } from '@/lib/types';

interface RouteParams {
  params: Promise<{ name: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // Decode URL-encoded package names (e.g. @types%2Fnode → @types/node)
  const { name } = await params;
  const packageName = decodeURIComponent(name);

  if (!packageName || packageName.length > 255) {
    return NextResponse.json(
      { error: 'Invalid package name' },
      { status: 400 }
    );
  }

  try {
    // 1. Check Redis cache first (TTL: 24hr per PRD)
    const cacheKey = CacheKeys.packageScore(packageName);
    const cached = await cacheGet<PackageScore>(cacheKey);
    if (cached) {
      return NextResponse.json(toResponse(cached), {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    // 2. Fetch all signals in parallel
    const repoUrl = await getPackageRepoUrl(packageName);
    const [npmSignals, githubSignals, osvSignals] = await Promise.all([
      getNpmSignals(packageName),
      getGitHubSignals(repoUrl),
      getOsvSignals(packageName),
    ]);

    const rawSignals: RawSignals = {
      github: githubSignals,
      npm: npmSignals,
      osv: osvSignals,
      fetchedAt: new Date(),
    };

    // 3. Compute score
    const score = computePackageScore(packageName, null, rawSignals);

    // 4. Persist to cache + DB (fire-and-forget — don't await to keep response fast)
    cacheSet(cacheKey, score, TTL.PACKAGE_SCORE).catch(() => {});
    upsertPackageScore(score).catch(() => {});
    insertScoreHistory(packageName, score.score).catch(() => {});

    return NextResponse.json(toResponse(score), {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (err) {
    console.error(`[API /package/:name/score] Error for "${packageName}":`, err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function toResponse(score: PackageScore): PackageScoreResponse {
  return {
    packageName: score.packageName,
    score: score.score,
    riskLevel: score.riskLevel,
    abandonmentRisk: score.abandonmentRisk,
    topFactors: score.topFactors,
    dimensions: score.dimensions,
    computedAt: score.computedAt.toISOString(),
  };
}
