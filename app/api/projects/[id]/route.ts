// =============================================================================
// DepGraph — API: GET / PATCH / DELETE /api/projects/[id]
// Session-protected. Enforces project ownership on all verbs.
// Week 4: Added PATCH + DELETE handlers.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getProjectById, updateProject, deleteProject } from '@/lib/db/queries/projects';
import { getProjectScanHistory } from '@/lib/db/queries/scans';
import { validateGithubRepo, RepoValidationError } from '@/lib/services/github/validateRepo';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id, session.userId);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const scans = await getProjectScanHistory(id, 1);
  const latestScan = scans[0] ?? null;

  return NextResponse.json({ project, latestScan });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Ownership check
  const existing = await getProjectById(id, session.userId);
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  let body: { name?: string; githubRepo?: string | null };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    let githubRepo = body.githubRepo;

    // Validate new repo URL if provided and non-null
    if (githubRepo != null && githubRepo !== '') {
      const requirePublic = (session.plan ?? 'free') === 'free';
      const validated = await validateGithubRepo(githubRepo, requirePublic);
      githubRepo = validated.fullName;
    }

    const project = await updateProject(id, session.userId, {
      name: body.name?.trim(),
      githubRepo,
    });
    return NextResponse.json({ project });

  } catch (err) {
    if (err instanceof RepoValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[PATCH /api/projects/:id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Ownership check
  const existing = await getProjectById(id, session.userId);
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  try {
    await deleteProject(id, session.userId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[DELETE /api/projects/:id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
