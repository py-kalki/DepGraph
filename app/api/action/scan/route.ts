// =============================================================================
// DepGraph — POST /api/action/scan
// Accepts a dependency list from the GitHub Action, runs scoring, returns report.
// Reuses the same scorePackage pattern as /api/scan (PRD §F-05).
// Auth: X-API-Key (Pro/Team plans only)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, assertActionPlan } from '@/lib/middleware/apiKeyAuth';
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
import { getDbClient } from '@/lib/db/client';
import { trackApiScan } from '@/lib/services/action/usageTracker';
import { getEnv } from '@/lib/env';
import type { PackageScore, RawSignals } from '@/lib/types';
import type { ScoredDep } from '@/lib/services/action/differ';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth
  const { ctx, error } = await validateApiKey(req);
  if (error) return error;
  const planError = assertActionPlan(ctx.plan);
  if (planError) return planError;

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.packages)) {
    return NextResponse.json({ error: 'packages array is required' }, { status: 400 });
  }

  const packages: string[] = (body.packages as string[]).slice(0, 500);
  const githubRepo: string | null = body.githubRepo ?? null;
  const appUrl = getEnv().NEXT_PUBLIC_APP_URL;

  const packageResults = await Promise.allSettled(packages.map((pkg) => scorePackage(pkg)));

  const packageScores: PackageScore[] = packageResults
    .filter((r): r is PromiseFulfilledResult<PackageScore> => r.status === 'fulfilled')
    .map((r) => r.value);

  const overallScore  = computeProjectScore(packageScores);
  const counts        = countByRiskLevel(packageScores);

  // Convert to ScoredDep shape for action consumers
  const depScores: ScoredDep[] = packageScores.map((ps) => ({
    name:            ps.packageName,
    version:         ps.packageVersion ?? 'unknown',
    score:           ps.score,
    riskLevel:       ps.riskLevel,
    abandonmentRisk: ps.abandonmentRisk,
    cveCount:        0, // PackageScore doesn't expose CVE count directly; use /api/action/compare for delta
  }));

  // Save scan report for share URL
  const db = getDbClient();
  const { data: report } = await db
    .from('scan_reports')
    .insert({
      project_id:     null,
      share_token:    Math.random().toString(36).slice(2, 22),
      overall_score:  overallScore,
      total_deps:     depScores.length,
      critical_count: counts.critical,
      high_count:     counts.high,
      dep_scores:     depScores,
    })
    .select('share_token')
    .single();

  const reportUrl = report?.share_token ? `${appUrl}/report/${report.share_token}` : appUrl;

  // Track usage (non-blocking)
  void trackApiScan({ userId: ctx.userId, githubRepo, packCount: packages.length });

  return NextResponse.json({
    overall_score:  overallScore,
    critical_count: counts.critical,
    high_count:     counts.high,
    dep_scores:     depScores,
    report_url:     reportUrl,
  });
}

async function scorePackage(pkgString: string): Promise<PackageScore> {
  const lastAt      = pkgString.lastIndexOf('@');
  const packageName = lastAt > 0 ? pkgString.slice(0, lastAt) : pkgString;
  const packageVersion = lastAt > 0 ? pkgString.slice(lastAt + 1) : null;

  const cacheKey = CacheKeys.packageScore(packageName);
  const cached   = await cacheGet<PackageScore>(cacheKey);
  if (cached) return cached;

  const repoUrl = await getPackageRepoUrl(packageName);
  const [npmSignals, githubSignals, osvSignals] = await Promise.all([
    getNpmSignals(packageName),
    getGitHubSignals(repoUrl),
    getOsvSignals(packageName, packageVersion ?? undefined),
  ]);

  const rawSignals: RawSignals = {
    github:    githubSignals,
    npm:       npmSignals,
    osv:       osvSignals,
    fetchedAt: new Date(),
  };

  const score = computePackageScore(packageName, packageVersion, rawSignals);
  cacheSet(cacheKey, score, TTL.PACKAGE_SCORE).catch(() => {});
  return score;
}
