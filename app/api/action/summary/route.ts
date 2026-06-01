// =============================================================================
// DepGraph — POST /api/action/summary
// Generates PR comment markdown from a compare result.
// Auth: X-API-Key (Pro/Team plans only)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, assertActionPlan } from '@/lib/middleware/apiKeyAuth';
import { buildPrComment } from '@/lib/services/action/commentBuilder';
import { hashCommentBody } from '@/lib/db/queries/prComments';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { ctx, error } = await validateApiKey(req);
  if (error) return error;
  const planError = assertActionPlan(ctx.plan);
  if (planError) return planError;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const {
    baseScore,
    headScore,
    scoreDelta,
    added   = [],
    removed = [],
    updated = [],
    criticalCount = 0,
    highCount     = 0,
    gateResult    = 'pass',
    gateReason    = '',
    reportUrl     = '',
    githubRepo    = '',
    prNumber      = 0,
  } = body;

  if (typeof headScore !== 'number') {
    return NextResponse.json({ error: 'headScore is required' }, { status: 400 });
  }

  const markdown = buildPrComment({
    baseScore:  baseScore ?? null,
    headScore,
    delta:      { added, removed, updated },
    gateResult,
    gateReason,
    reportUrl,
    githubRepo,
    prNumber,
  });

  const bodyHash = hashCommentBody(markdown);

  return NextResponse.json({ markdown, body_hash: bodyHash });
}
