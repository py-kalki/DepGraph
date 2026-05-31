// =============================================================================
// DepGraph — API: GET /api/cron/history-snapshot
// Vercel Cron job: runs at 03:00 UTC daily.
// Writes a score_history row for every package in package_scores.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { snapshotAllPackageScores } from '@/lib/db/queries/history';
import { getEnv } from '@/lib/env';

export async function GET(req: NextRequest) {
  const env = getEnv();
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] history-snapshot: starting');

  try {
    const snapshots = await snapshotAllPackageScores();
    console.log(`[Cron] history-snapshot: inserted ${snapshots} rows`);
    return NextResponse.json({ snapshots }, { status: 200 });
  } catch (err) {
    console.error('[Cron] history-snapshot: error', err);
    return NextResponse.json({ snapshots: 0 }, { status: 200 });
  }
}
