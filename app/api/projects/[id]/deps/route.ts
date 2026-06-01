// =============================================================================
// DepGraph — GET /api/projects/[id]/deps
// Paginated dependency list for a project. Week 7 dashboard performance.
// Auth: NextAuth session + project ownership
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDbClient } from '@/lib/db/client';
import { withErrorHandler } from '@/lib/errors/handler';
import { AuthError, NotFoundError, ValidationError } from '@/lib/errors';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT     = 100;

type SortField = 'score' | 'name' | 'risk_level';
type SortOrder = 'asc' | 'desc';

const VALID_SORT: SortField[]  = ['score', 'name', 'risk_level'];
const VALID_ORDER: SortOrder[] = ['asc', 'desc'];

export const GET = withErrorHandler(async (
  req: NextRequest,
  context: unknown,
) => {
  const session = await getServerSession(authOptions);
  if (!session?.userId) throw new AuthError();

  const { id: projectId } = (context as { params: { id: string } }).params;

  const { searchParams } = req.nextUrl;
  const limitRaw  = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const limit     = Math.min(isNaN(limitRaw) ? DEFAULT_LIMIT : limitRaw, MAX_LIMIT);
  const cursor    = searchParams.get('cursor') ?? null;   // last score seen (for cursor pagination)
  const sortParam = (searchParams.get('sort') ?? 'score') as SortField;
  const orderParam = (searchParams.get('order') ?? 'asc') as SortOrder;

  if (!VALID_SORT.includes(sortParam))  throw new ValidationError(`sort must be one of: ${VALID_SORT.join(', ')}`);
  if (!VALID_ORDER.includes(orderParam)) throw new ValidationError(`order must be one of: ${VALID_ORDER.join(', ')}`);

  const db = getDbClient();

  // Verify project belongs to this user
  const { data: project } = await db
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', session.userId)
    .single();

  if (!project) throw new NotFoundError('Project not found');

  // Fetch latest scan report for the project
  const { data: report } = await db
    .from('scan_reports')
    .select('dep_scores, total_deps')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!report) {
    return NextResponse.json({ data: [], nextCursor: null, total: 0 });
  }

  // dep_scores is JSONB array — sort + paginate in JS (small enough: max 500 items)
  type DepScore = { name: string; version: string; score: number; risk_level: string };
  let deps: DepScore[] = (report.dep_scores as DepScore[]) ?? [];

  // Sort
  deps.sort((a, b) => {
    let cmp = 0;
    if (sortParam === 'score')      cmp = a.score - b.score;
    else if (sortParam === 'name')  cmp = a.name.localeCompare(b.name);
    else if (sortParam === 'risk_level') {
      const order = { critical: 0, high: 1, medium: 2, low: 3, healthy: 4 };
      cmp = (order[a.risk_level as keyof typeof order] ?? 5) - (order[b.risk_level as keyof typeof order] ?? 5);
    }
    return orderParam === 'asc' ? cmp : -cmp;
  });

  // Cursor-based pagination: cursor is the index of the last item returned
  const startIndex = cursor ? parseInt(cursor, 10) : 0;
  const page       = deps.slice(startIndex, startIndex + limit);
  const nextIndex  = startIndex + page.length;
  const nextCursor = nextIndex < deps.length ? String(nextIndex) : null;

  return NextResponse.json({
    data:       page,
    nextCursor,
    total:      report.total_deps ?? deps.length,
    page:       Math.floor(startIndex / limit) + 1,
  });
});
