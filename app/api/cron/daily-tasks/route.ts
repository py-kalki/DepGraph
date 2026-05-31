// =============================================================================
// DepGraph — API: GET /api/cron/daily-tasks
// Vercel Cron job: runs at 08:00 UTC daily.
// Combines multiple daily maintenance tasks to comply with Vercel Hobby limits:
// 1. Refreshes stale projects
// 2. Snapshots score history
// 3. Runs alert scanner
// =============================================================================

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { runDailyRefresh } from '@/lib/services/refresh/dailyRefresh';
import { snapshotAllPackageScores } from '@/lib/db/queries/history';
import { runAlertScan } from '@/lib/services/alerts/scanner';
import { getEnv } from '@/lib/env';

export async function GET(): Promise<NextResponse> {
  const headersList = await headers();
  const cronSecret  = headersList.get('authorization');

  if (cronSecret !== `Bearer ${getEnv().CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] daily-tasks: starting');

  try {
    // Run all daily maintenance tasks concurrently
    const [refreshResult, snapshotResult, scanResult] = await Promise.allSettled([
      runDailyRefresh(),
      snapshotAllPackageScores(),
      runAlertScan()
    ]);

    const result = {
      refresh: refreshResult.status === 'fulfilled' ? refreshResult.value : { error: String(refreshResult.reason) },
      snapshots: snapshotResult.status === 'fulfilled' ? snapshotResult.value : { error: String(snapshotResult.reason) },
      alerts: scanResult.status === 'fulfilled' ? scanResult.value : { error: String(scanResult.reason) }
    };

    console.log('[Cron] daily-tasks: done', JSON.stringify(result));
    
    // Always return 200 — Vercel Cron treats non-2xx as a cron failure
    return NextResponse.json({ ...result, ok: true }, { status: 200 });
  } catch (err) {
    console.error('[Cron] daily-tasks: fatal error', err);
    return NextResponse.json({ error: 'Daily tasks failed', ok: false }, { status: 200 });
  }
}
