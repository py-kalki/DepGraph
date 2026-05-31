// =============================================================================
// DepGraph — Project Refresh Service
// Re-scans a single project's packages and updates scores.
// Used by: POST /api/projects/[id]/refresh (on-demand, Pro)
//          GET  /api/cron/daily-refresh    (automated, all plans)
// =============================================================================

import { getNpmSignals, getPackageRepoUrl } from '@/lib/services/npm';
import { getGitHubSignals } from '@/lib/services/github';
import { getOsvSignals } from '@/lib/services/osv';
import {
  computePackageScore,
  computeProjectScore,
  countByRiskLevel,
} from '@/lib/services/scoring/engine';
import { cacheSet, TTL } from '@/lib/cache/redis';
import { CacheKeys } from '@/lib/cache/keys';
import { upsertPackageScore } from '@/lib/db/queries/packages';
import { updateProjectScore } from '@/lib/db/queries/projects';
import { createScanReport } from '@/lib/db/queries/scans';
import { snapshotProjectScore } from '@/lib/db/queries/history';
import type { PackageScore, RawSignals } from '@/lib/types';

export interface ProjectRefreshResult {
  projectId:    string;
  overallScore: number;
  totalDeps:    number;
  shareToken:   string;
  durationMs:   number;
}

/**
 * Re-score all packages from a project's dep_scores list.
 * Fetches fresh signals, updates the scan report, and updates projects.score.
 */
export async function refreshProject(
  projectId: string,
  depNames: string[], // ["express@4.18.2", "lodash@4.17.21"]
): Promise<ProjectRefreshResult> {
  const startMs = Date.now();

  // Score all packages in parallel (failures are non-blocking)
  const results = await Promise.allSettled(
    depNames.map((pkg) => scorePackage(pkg)),
  );

  const packageScores: PackageScore[] = results
    .filter((r): r is PromiseFulfilledResult<PackageScore> => r.status === 'fulfilled')
    .map((r) => r.value);

  const overallScore = computeProjectScore(packageScores);
  const counts       = countByRiskLevel(packageScores);

  // Persist new scan report
  const { id: _scanId, shareToken } = await createScanReport({
    packages:     packageScores,
    overallScore,
    totalDeps:    packageScores.length,
    criticalCount: counts.critical,
    highCount:    counts.high,
    mediumCount:  counts.medium,
    lowCount:     counts.low,
    healthyCount: counts.healthy,
    projectId,
  });

  // Update projects.score + last_scanned
  await updateProjectScore(projectId, overallScore);

  // Record daily snapshot for trend chart
  await snapshotProjectScore(projectId, overallScore);

  return {
    projectId,
    overallScore,
    totalDeps:  packageScores.length,
    shareToken,
    durationMs: Date.now() - startMs,
  };
}

/**
 * Score a single package string in "name@version" format.
 * Fetches fresh signals (bypassing the scan cache — daily refresh needs fresh data).
 */
async function scorePackage(pkgString: string): Promise<PackageScore> {
  const lastAt      = pkgString.lastIndexOf('@');
  const packageName = lastAt > 0 ? pkgString.slice(0, lastAt) : pkgString;
  const packageVersion = lastAt > 0 ? pkgString.slice(lastAt + 1) : null;

  const repoUrl = await getPackageRepoUrl(packageName);
  const [npmSignals, githubSignals, osvSignals] = await Promise.all([
    getNpmSignals(packageName),
    getGitHubSignals(repoUrl),
    getOsvSignals(packageName, packageVersion ?? undefined),
  ]);

  const rawSignals: RawSignals = {
    github: githubSignals,
    npm:    npmSignals,
    osv:    osvSignals,
    fetchedAt: new Date(),
  };

  const score = computePackageScore(packageName, packageVersion, rawSignals);

  // Update per-package cache + DB (fire-and-forget)
  cacheSet(CacheKeys.packageScore(packageName), score, TTL.PACKAGE_SCORE).catch(() => {});
  upsertPackageScore(score).catch(() => {});

  return score;
}
