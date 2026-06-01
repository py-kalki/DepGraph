export const maxDuration = 60;
// =============================================================================
// POST /api/scan
// Authenticated endpoint — accepts API key or session cookie (PRD §13).
// Scans a list of npm packages and returns a full scored report.
// Full scan result cached for 1hr keyed by lockfileHash.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNpmSignals, getPackageRepoUrl } from '@/lib/services/npm';
import { getGitHubSignals } from '@/lib/services/github';
import { getOsvSignals } from '@/lib/services/osv';
import {
  computePackageScore,
  computeProjectScore,
  countByRiskLevel,
} from '@/lib/services/scoring/engine';
import { cacheGet, cacheSet, TTL } from '@/lib/cache/redis';
import { CacheKeys } from '@/lib/cache/keys';
import { upsertPackageScore } from '@/lib/db/queries/packages';
import { insertScoreHistory } from '@/lib/db/queries/history';
import { createScanReport } from '@/lib/db/queries/scans';
import { trackFirstScan } from '@/lib/analytics/events';
import type { ScanRequest, ScanReport, PackageScore, RawSignals } from '@/lib/types';
import { getEnv } from '@/lib/env';

// Maximum packages per scan request
const MAX_PACKAGES = 500;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Week 1: Basic API key authentication
  // Week 3 will add NextAuth session support
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    // Unauthenticated scans allowed in Week 1 for testing
    // TODO Week 3: enforce auth, check against user's API key
    console.warn('[API /scan] Unauthenticated scan request');
  }

  let body: ScanRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { packages, lockfileHash } = body;

  if (!Array.isArray(packages) || packages.length === 0) {
    return NextResponse.json(
      { error: '`packages` must be a non-empty array' },
      { status: 400 }
    );
  }

  if (packages.length > MAX_PACKAGES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_PACKAGES} packages per scan` },
      { status: 400 }
    );
  }

  try {
    // 1. Check full-scan cache (keyed by lockfileHash, TTL: 1hr per PRD)
    if (lockfileHash) {
      const cacheKey = CacheKeys.scanReport(lockfileHash);
      const cached = await cacheGet<ScanReport>(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'X-Cache': 'HIT' },
        });
      }
    }

    // 2. Score all packages in parallel (Promise.allSettled — failures don't kill the scan)
    // Process in chunks to avoid rate limiting and concurrency bombs
    const CHUNK_SIZE = 50;
    const packageResults: PromiseSettledResult<PackageScore>[] = [];
    for (let i = 0; i < packages.length; i += CHUNK_SIZE) {
      const chunk = packages.slice(i, i + CHUNK_SIZE);
      const chunkResults = await Promise.allSettled(chunk.map((pkg) => scorePackage(pkg)));
      packageResults.push(...chunkResults);
    }

    const packageScores: PackageScore[] = packageResults
      .filter((r): r is PromiseFulfilledResult<PackageScore> => r.status === 'fulfilled')
      .map((r) => r.value);

    // 3. Aggregate project-level stats
    const overallScore = computeProjectScore(packageScores);
    const counts = countByRiskLevel(packageScores);
    const env = getEnv();

    // 4. Persist scan report to DB
    const { id, shareToken } = await createScanReport({
      packages: packageScores,
      overallScore,
      totalDeps: packageScores.length,
      criticalCount: counts.critical,
      highCount: counts.high,
      mediumCount: counts.medium,
      lowCount: counts.low,
      healthyCount: counts.healthy,
      projectId: null, // Week 4: link to saved project
    });

    // Track analytics (use apiKey or lockfileHash as distinctId if unauthenticated)
    const distinctId = apiKey ?? lockfileHash ?? 'anonymous';
    trackFirstScan(distinctId, {
      packageCount: packageScores.length,
      overallScore,
    });

    const report: ScanReport = {
      id,
      shareToken,
      overallScore,
      totalDeps: packageScores.length,
      criticalCount: counts.critical,
      highCount: counts.high,
      mediumCount: counts.medium,
      lowCount: counts.low,
      healthyCount: counts.healthy,
      packages: packageScores,
      createdAt: new Date(),
      projectId: null,
    };

    // 5. Cache full scan result (1hr TTL per PRD)
    if (lockfileHash) {
      cacheSet(CacheKeys.scanReport(lockfileHash), report, TTL.SCAN_REPORT).catch(() => {});
    }

    // Share URL format per PRD: depgraph.vedanshh.dev/r/{shareToken}
    return NextResponse.json({
      ...report,
      shareUrl: `${env.NEXT_PUBLIC_APP_URL}/r/${shareToken}`,
    });
  } catch (err) {
    console.error('[API /scan] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Score a single package — parses "name@version" format from CLI.
 * Fetches all signals in parallel and computes score.
 */
async function scorePackage(pkgString: string): Promise<PackageScore> {
  // Parse "name@version" — handle scoped packages like @types/node@20.0.0
  const lastAt = pkgString.lastIndexOf('@');
  const packageName = lastAt > 0 ? pkgString.slice(0, lastAt) : pkgString;
  const packageVersion = lastAt > 0 ? pkgString.slice(lastAt + 1) : null;

  // Check per-package Redis cache (TTL: 24hr per PRD)
  const cacheKey = CacheKeys.packageScore(packageName);
  const cached = await cacheGet<PackageScore>(cacheKey);
  if (cached) return cached;

  // Fetch all signals in parallel
  const repoUrl = await getPackageRepoUrl(packageName);
  const [npmSignals, githubSignals, osvSignals] = await Promise.all([
    getNpmSignals(packageName),
    getGitHubSignals(repoUrl),
    getOsvSignals(packageName, packageVersion ?? undefined),
  ]);

  const rawSignals: RawSignals = {
    github: githubSignals,
    npm: npmSignals,
    osv: osvSignals,
    fetchedAt: new Date(),
  };

  const score = computePackageScore(packageName, packageVersion, rawSignals);

  // Persist to cache + DB (fire-and-forget)
  cacheSet(cacheKey, score, TTL.PACKAGE_SCORE).catch(() => {});
  upsertPackageScore(score).catch(() => {});
  insertScoreHistory(packageName, score.score).catch(() => {});

  return score;
}
