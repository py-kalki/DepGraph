// =============================================================================
// DepGraph — POST /api/reports/[shareToken]/claim
// Links an orphan scan_report to the authenticated user's project.
// Called when a user signs in from a report share URL.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDbClient } from '@/lib/db/client';
import { getUserProjects, createProject } from '@/lib/db/queries/projects';

interface Props {
  params: Promise<{ shareToken: string }>;
}

export async function POST(req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { shareToken } = await params;
  const db = getDbClient();

  // Fetch the scan report
  const { data: report, error } = await db
    .from('scan_reports')
    .select('id, project_id')
    .eq('share_token', shareToken)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // If already claimed, return success
  if (report.project_id) {
    return NextResponse.json({ claimed: false, message: 'Report already linked to a project' });
  }

  // Find or create a "CLI Project" for this user to hold the report
  let projectId: string;
  try {
    const userProjects = await getUserProjects(session.userId);
    const cliProject = userProjects.find(p => p.name === 'CLI Project') ?? userProjects[0] ?? null;

    if (cliProject) {
      projectId = cliProject.id;
    } else {
      const newProject = await createProject(session.userId, 'CLI Project', null);
      projectId = newProject.id;
    }
  } catch {
    return NextResponse.json({ error: 'Failed to resolve project' }, { status: 500 });
  }

  // Link the report to the project
  const { error: updateError } = await db
    .from('scan_reports')
    .update({ project_id: projectId })
    .eq('id', report.id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to claim report' }, { status: 500 });
  }

  return NextResponse.json({ claimed: true, projectId });
}
