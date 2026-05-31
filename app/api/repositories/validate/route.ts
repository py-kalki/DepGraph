// =============================================================================
// DepGraph — POST /api/repositories/validate
// Validates GitHub repository access for a user (private repo support).
// Pro/Team plan required for private repos.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { validatePrivateRepo } from '@/lib/services/github/privateRepo';
import { upsertRepositoryPermission } from '@/lib/db/queries/repositories';
import { assertPrivateRepoAccess } from '@/lib/middleware/planGuard';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { githubRepo } = body as { githubRepo: string };
  if (!githubRepo || !githubRepo.includes('/')) {
    return NextResponse.json({ error: 'githubRepo must be in "owner/repo" format' }, { status: 400 });
  }

  const plan = (session as { plan?: string }).plan ?? 'free';

  // Validate private repo access using user's OAuth token
  const accessToken = (session as { accessToken?: string }).accessToken ?? null;

  let accessible = false;
  let isPrivate   = false;

  try {
    const result = await validatePrivateRepo(githubRepo, accessToken);
    accessible = result.accessible;
    isPrivate  = result.isPrivate;
  } catch {
    return NextResponse.json({ error: 'Failed to validate repository' }, { status: 502 });
  }

  // Enforce plan restriction for private repos
  if (isPrivate) {
    try {
      assertPrivateRepoAccess(plan);
    } catch {
      return NextResponse.json(
        { error: 'Private repository access requires a Pro or Team plan' },
        { status: 403 },
      );
    }
  }

  // Record the permission
  if (accessible) {
    const hint = accessToken ? accessToken.slice(-4) : null;
    await upsertRepositoryPermission({
      userId:           session.userId,
      githubRepo,
      isPrivate,
      accessVerifiedAt: new Date().toISOString(),
      accessTokenHint:  hint,
    });
  }

  return NextResponse.json({ accessible, isPrivate });
}
