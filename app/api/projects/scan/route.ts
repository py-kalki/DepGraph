// =============================================================================
// DepGraph — POST /api/projects/scan
// Triggers an automatic scan of a project's GitHub repo.
// Called after project creation to provide an immediate first report.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getProjectById, updateProjectScore } from '@/lib/db/queries/projects';
import { createScanReport } from '@/lib/db/queries/scans';
import { getNpmSignals, getPackageRepoUrl } from '@/lib/services/npm';
import { getGitHubSignals } from '@/lib/services/github';
import { getOsvSignals } from '@/lib/services/osv';
import {
  computePackageScore,
  computeProjectScore,
  countByRiskLevel,
} from '@/lib/services/scoring/engine';
import type { PackageScore, RawSignals } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.projectId || !body?.githubRepo) {
    return NextResponse.json({ error: 'projectId and githubRepo are required' }, { status: 400 });
  }

  // Verify project ownership
  const project = await getProjectById(body.projectId, session.userId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  try {
    // Fetch package.json from the GitHub repo
    const repoPath = body.githubRepo as string;
    const pkgJsonUrl = `https://raw.githubusercontent.com/${repoPath}/HEAD/package.json`;

    const pkgRes = await fetch(pkgJsonUrl);
    if (!pkgRes.ok) {
      return NextResponse.json(
        { error: `Could not fetch package.json from ${repoPath}. Make sure the repo is public and has a package.json.` },
        { status: 422 }
      );
    }

    const pkgJson = await pkgRes.json() as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
    const packages = Object.entries(allDeps).map(([name, ver]) => `${name}@${String(ver).replace(/[\^~>=<]/g, '')}`);

    if (packages.length === 0) {
      return NextResponse.json({ error: 'No dependencies found in package.json' }, { status: 422 });
    }

    // Score all packages (cap at 200 for speed)
    const capped = packages.slice(0, 200);
    const results = await Promise.allSettled(capped.map(scorePackage));
    const packageScores: PackageScore[] = results
      .filter((r): r is PromiseFulfilledResult<PackageScore> => r.status === 'fulfilled')
      .map((r) => r.value);

    const overallScore = computeProjectScore(packageScores);
    const counts = countByRiskLevel(packageScores);

    // Save scan report linked to this project
    const { id, shareToken } = await createScanReport({
      packages: packageScores,
      overallScore,
      totalDeps: packageScores.length,
      criticalCount: counts.critical,
      highCount: counts.high,
      mediumCount: counts.medium,
      lowCount: counts.low,
      healthyCount: counts.healthy,
      projectId: project.id,
    });

    // Update project score
    await updateProjectScore(project.id, overallScore);

    return NextResponse.json({ id, shareToken, overallScore, totalDeps: packageScores.length });

  } catch (err) {
    console.error('[POST /api/projects/scan]', err);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}

async function scorePackage(pkgString: string): Promise<PackageScore> {
  const lastAt = pkgString.lastIndexOf('@');
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
    npm: npmSignals,
    osv: osvSignals,
    fetchedAt: new Date(),
  };

  return computePackageScore(packageName, packageVersion, rawSignals);
}
