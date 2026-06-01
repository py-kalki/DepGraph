// =============================================================================
// DepGraph — POST /api/action/compare
// Diffs base vs head dependency trees, scores new/updated deps.
// Auth: X-API-Key (Pro/Team plans only)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, assertActionPlan } from '@/lib/middleware/apiKeyAuth';
import { parsePackageJson, computeDepDelta, type ScoredDep } from '@/lib/services/action/differ';
import { cacheGet } from '@/lib/cache/redis';
import { CacheKeys } from '@/lib/cache/keys';
import { createActionRun } from '@/lib/db/queries/actionRuns';
import { trackApiCompare } from '@/lib/services/action/usageTracker';
import type { PackageScore } from '@/lib/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { ctx, error } = await validateApiKey(req);
  if (error) return error;
  const planError = assertActionPlan(ctx.plan);
  if (planError) return planError;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.base !== 'string' || typeof body.head !== 'string') {
    return NextResponse.json(
      { error: 'base and head package.json strings are required' },
      { status: 400 },
    );
  }

  const githubRepo: string = body.githubRepo ?? 'unknown/repo';
  const prNumber:   number = body.prNumber   ?? 0;
  const baseSha:    string = body.baseSha    ?? null;
  const headSha:    string = body.headSha    ?? null;

  let baseDeps, headDeps;
  try {
    baseDeps = parsePackageJson(body.base);
    headDeps = parsePackageJson(body.head);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  // Lookup per-package scores from Redis cache
  const allNames = Array.from(new Set([
    ...baseDeps.map((d) => d.name),
    ...headDeps.map((d) => d.name),
  ]));

  const headScored = new Map<string, ScoredDep>();
  const baseScored = new Map<string, ScoredDep>();

  await Promise.allSettled(allNames.map(async (name) => {
    const cached = await cacheGet<PackageScore>(CacheKeys.packageScore(name));
    if (cached) {
      const scored: ScoredDep = {
        name,
        version:         cached.packageVersion ?? 'unknown',
        score:           cached.score,
        riskLevel:       cached.riskLevel,
        abandonmentRisk: cached.abandonmentRisk,
        cveCount:        0,
      };
      headScored.set(name, scored);
      baseScored.set(name, scored);
    }
  }));

  const delta = computeDepDelta(baseDeps, headDeps, headScored, baseScored);

  const allHeadScores = headDeps.map((d) => headScored.get(d.name)?.score ?? 50);
  const allBaseScores = baseDeps.map((d) => baseScored.get(d.name)?.score ?? 50);
  const headScore = allHeadScores.length > 0
    ? Math.round(allHeadScores.reduce((a, b) => a + b, 0) / allHeadScores.length) : 100;
  const baseScore = allBaseScores.length > 0
    ? Math.round(allBaseScores.reduce((a, b) => a + b, 0) / allBaseScores.length) : 100;

  const criticalCount = delta.added.filter((d) => d.riskLevel === 'critical').length;
  const highCount     = delta.added.filter((d) => d.riskLevel === 'high').length;
  const mediumCount   = delta.added.filter((d) => d.riskLevel === 'medium').length;

  // Record action run (non-fatal)
  try {
    await createActionRun({
      apiKeyId:      ctx.keyId,
      userId:        ctx.userId,
      githubRepo,
      prNumber,
      baseSha,
      headSha,
      overallScore:  headScore,
      criticalCount,
      highCount,
      gateResult:    'pass',
      reportUrl:     null,
      executionMs:   null,
    });
  } catch { /* non-fatal */ }

  void trackApiCompare({ userId: ctx.userId, githubRepo, addedCount: delta.added.length });

  return NextResponse.json({
    base_score:     baseScore,
    head_score:     headScore,
    score_delta:    headScore - baseScore,
    critical_count: criticalCount,
    high_count:     highCount,
    medium_count:   mediumCount,
    added:          delta.added,
    removed:        delta.removed,
    updated:        delta.updated,
  });
}
