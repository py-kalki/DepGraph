// =============================================================================
// DepGraph — API: GET /api/cron/daily-tasks (Week 7 updated)
// Added: cache warming (Phase 2) + structured logging (Phase 6)
// =============================================================================

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { runDailyRefresh } from '@/lib/services/refresh/dailyRefresh';
import { snapshotAllPackageScores } from '@/lib/db/queries/history';
import { runAlertScan } from '@/lib/services/alerts/scanner';
import { warmTopPackages } from '@/lib/cache/warmer';
import { getDbClient } from '@/lib/db/client';
import { createLogger } from '@/lib/logger';
import { getEnv } from '@/lib/env';

const log = createLogger('cron');

export async function GET(): Promise<NextResponse> {
  const headersList = await headers();
  const cronSecret  = headersList.get('authorization');

  if (cronSecret !== `Bearer ${getEnv().CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  log.info('daily-tasks: starting');

  try {
    const [refreshResult, snapshotResult, scanResult, warmResult, cleanupResult] =
      await Promise.allSettled([
        runDailyRefresh(),
        snapshotAllPackageScores(),
        runAlertScan(),
        warmTopPackages(),
        runCleanup(),
      ]);

    const result = {
      refresh:  refreshResult.status  === 'fulfilled' ? refreshResult.value  : { error: String(refreshResult.reason) },
      snapshots: snapshotResult.status === 'fulfilled' ? snapshotResult.value : { error: String(snapshotResult.reason) },
      alerts:   scanResult.status     === 'fulfilled' ? scanResult.value     : { error: String(scanResult.reason) },
      cacheWarm: warmResult.status    === 'fulfilled' ? warmResult.value     : { error: String(warmResult.reason) },
      cleanup:  cleanupResult.status  === 'fulfilled' ? cleanupResult.value  : { error: String(cleanupResult.reason) },
    };

    log.info('daily-tasks: done', result as Record<string, unknown>);
    return NextResponse.json({ ...result, ok: true }, { status: 200 });
  } catch (err) {
    Sentry.captureException(err);
    log.error('daily-tasks: fatal error', { error: String(err) });
    return NextResponse.json({ error: 'Daily tasks failed', ok: false }, { status: 200 });
  }
}

/** Run DB cleanup stored procedure (Week 7 — migration 007). */
async function runCleanup(): Promise<{ deleted: number }> {
  const db = getDbClient();
  const { data, error } = await db.rpc('cleanup_old_score_history');
  if (error) throw new Error(error.message);
  return { deleted: (data as number) ?? 0 };
}
