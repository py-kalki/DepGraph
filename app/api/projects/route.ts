// =============================================================================
// DepGraph — API: GET /api/projects, POST /api/projects
// Session-protected. Free tier: max 3 projects.
// Week 4: Added validateGithubRepo + planGuard.assertProjectLimit
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserProjects, createProject } from '@/lib/db/queries/projects';
import { validateGithubRepo, RepoValidationError } from '@/lib/services/github/validateRepo';
import { assertProjectLimit, PlanLimitError } from '@/lib/middleware/planGuard';
import { trackProjectCreated } from '@/lib/analytics/events';
import type { PlanTier } from '@/lib/types';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await getUserProjects(session.userId);
    return NextResponse.json({ projects });
  } catch (err) {
    console.error('[GET /api/projects]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string; githubRepo?: string };
  try {
    body = (await req.json()) as { name?: string; githubRepo?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  try {
    // PRD §F-04: enforce project limit via planGuard
    const existing = await getUserProjects(session.userId);
    assertProjectLimit((session.plan as PlanTier) ?? 'free', existing.length);

    let githubRepo: string | null = body.githubRepo?.trim() ?? null;

    // Validate repo if provided
    if (githubRepo) {
      const requirePublic = (session.plan ?? 'free') === 'free';
      const validated = await validateGithubRepo(githubRepo, requirePublic);
      githubRepo = validated.fullName; // normalize to "owner/repo" from GitHub API
    }

    const project = await createProject(session.userId, body.name.trim(), githubRepo);
    
    trackProjectCreated(session.userId, { 
      githubRepo,
      plan: session.plan ?? 'free'
    });
    
    return NextResponse.json({ project }, { status: 201 });

  } catch (err) {
    if (err instanceof PlanLimitError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof RepoValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[POST /api/projects]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
