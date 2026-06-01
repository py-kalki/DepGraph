// =============================================================================
// DepGraph — POST /api/action/decision
// Applies CI gate logic and returns pass / warn / fail.
// Auth: X-API-Key (Pro/Team plans only)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, assertActionPlan } from '@/lib/middleware/apiKeyAuth';
import { applyGate, type FailOn } from '@/lib/services/action/gate';

const VALID_FAIL_ON: FailOn[] = ['none', 'critical', 'high', 'medium'];

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { ctx, error } = await validateApiKey(req);
  if (error) return error;
  const planError = assertActionPlan(ctx.plan);
  if (planError) return planError;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const {
    critical_count = 0,
    high_count     = 0,
    medium_count   = 0,
    score_delta    = 0,
    fail_on        = 'critical',
  } = body;

  if (!VALID_FAIL_ON.includes(fail_on)) {
    return NextResponse.json(
      { error: `fail_on must be one of: ${VALID_FAIL_ON.join(' | ')}` },
      { status: 400 },
    );
  }

  const output = applyGate({
    failOn:        fail_on,
    criticalCount: Number(critical_count),
    highCount:     Number(high_count),
    mediumCount:   Number(medium_count),
    scoreDelta:    Number(score_delta),
  });

  return NextResponse.json({
    result:    output.result,
    reason:    output.reason,
    exit_code: output.exitCode,
  });
}
