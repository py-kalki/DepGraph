// =============================================================================
// DepGraph — API: POST /api/projects/[id]/refresh
// On-demand project re-scan. Pro plan only per PRD §15.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getProjectById } from '@/lib/db/queries/projects';
import { getProjectScanHistory } from '@/lib/db/queries/scans';
import { refreshProject } from '@/lib/services/refresh/projectRefresh';
import { assertProFeature, PlanLimitError } from '@/lib/middleware/planGuard';
import type { PlanTier } from '@/lib/types';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Pro-only feature guard
    assertProFeature((session.plan as PlanTier) ?? 'free', 'onDemandRefresh');
  } catch (err) {
    if (err instanceof PlanLimitError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
  }

  const { id } = await params;
  const project = await getProjectById(id, session.userId);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  // Get the most recent dep list to re-score
  const scans = await getProjectScanHistory(id, 1);
  const latestScan = scans[0];

  if (!latestScan || !Array.isArray(latestScan.dep_scores) || latestScan.dep_scores.length === 0) {
    return NextResponse.json(
      { error: 'No previous scan found for this project. Run a CLI scan first.' },
      { status: 409 },
    );
  }

  const depNames: string[] = latestScan.dep_scores.map((d) =>
    d.version ? `${d.name}@${d.version}` : d.name,
  );

  try {
    const result = await refreshProject(id, depNames);
    return NextResponse.json({ result });
  } catch (err) {
    console.error('[POST /api/projects/:id/refresh]', err);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
