// =============================================================================
// DepGraph — API: GET /api/projects/[id]/history
// Returns score history for a project. Plan-capped:
//   Free: 30 days. Pro/Team: 365 days.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getProjectById } from '@/lib/db/queries/projects';
import { getProjectHistory } from '@/lib/db/queries/history';
import { clampHistoryDays } from '@/lib/middleware/planGuard';
import type { PlanTier } from '@/lib/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id, session.userId);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  // Parse requested days from query string
  const url = new URL(req.url);
  const requestedDays = parseInt(url.searchParams.get('days') ?? '30', 10);

  // Clamp to plan limit
  const allowedDays = clampHistoryDays((session.plan as PlanTier) ?? 'free', requestedDays);

  const history = await getProjectHistory(id, allowedDays);
  return NextResponse.json({ history, days: allowedDays, plan: session.plan });
}
