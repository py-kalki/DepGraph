// =============================================================================
// DepGraph — GET /api/admin/metrics (Week 8)
// Fetches key business metrics from Supabase for the internal dashboard.
// Protected by ADMIN_EMAILS env var check.
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDbClient } from '@/lib/db/client';
import { getEnv } from '@/lib/env';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDbClient();

  // Validate admin access
  const { data: user } = await db.from('users').select('email').eq('id', session.userId).single();
  const adminEmails = getEnv().ADMIN_EMAILS?.split(',') ?? [];
  if (!user?.email || !adminEmails.includes(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch metrics in parallel
  const [
    { count: freeUsers },
    { count: proUsers },
    { count: teamUsers },
    { count: activeProjects },
    { count: betaUsers },
  ] = await Promise.all([
    db.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'free'),
    db.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    db.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'team'),
    db.from('projects').select('*', { count: 'exact', head: true }),
    db.from('beta_users').select('*', { count: 'exact', head: true }),
  ]);

  return NextResponse.json({
    users: {
      free: freeUsers ?? 0,
      pro: proUsers ?? 0,
      team: teamUsers ?? 0,
      total: (freeUsers ?? 0) + (proUsers ?? 0) + (teamUsers ?? 0)
    },
    projects: {
      active: activeProjects ?? 0
    },
    beta: {
      invited: betaUsers ?? 0
    },
    mrr: ((proUsers ?? 0) * 19) + ((teamUsers ?? 0) * 79)
  });
}
