// =============================================================================
// DepGraph — Middleware: API Key Authentication (Week 6)
// Used by all /api/action/* routes. Validates X-API-Key header.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserByApiKey } from '@/lib/db/queries/apiKeys';

export type ApiKeyContext = {
  userId: string;
  plan:   string;
  keyId:  string;
};

/**
 * Validate the X-API-Key header and return the resolved user context.
 * Returns a NextResponse error if invalid; call-site must return it immediately.
 */
export async function validateApiKey(
  req: NextRequest,
): Promise<{ ctx: ApiKeyContext; error: null } | { ctx: null; error: NextResponse }> {
  const rawKey = req.headers.get('x-api-key') ?? req.headers.get('authorization')?.replace('Bearer ', '');

  if (!rawKey) {
    return {
      ctx: null,
      error: NextResponse.json(
        { error: 'Missing X-API-Key header' },
        { status: 401 },
      ),
    };
  }

  const result = await getUserByApiKey(rawKey);
  if (!result) {
    return {
      ctx: null,
      error: NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 },
      ),
    };
  }

  return { ctx: result, error: null };
}

/**
 * Assert that the authenticated user is on Pro or Team plan.
 * GitHub Action is a Pro/Team feature per PRD §15.
 */
export function assertActionPlan(plan: string): NextResponse | null {
  if (plan === 'free') {
    return NextResponse.json(
      { error: 'GitHub Action requires a Pro or Team plan. Upgrade at depgraph.vedanshh.dev/pricing' },
      { status: 403 },
    );
  }
  return null;
}
