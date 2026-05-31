// =============================================================================
// DepGraph — API: GET /api/cron/daily-refresh
// Vercel Cron job: runs at 02:00 UTC daily.
// Re-scans all projects due for a refresh (last_scanned > 23 hours ago or never).
// PRD §F-04: "Projects auto-refresh scores daily"
// PRD §11: "Background jobs: Vercel Cron (V1)"
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { runDailyRefresh } from '@/lib/services/refresh/dailyRefresh';
import { getEnv } from '@/lib/env';

export async function GET(req: NextRequest) {
  // Vercel Cron authentication
  const env = getEnv();
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] daily-refresh: starting');

  try {
    const result = await runDailyRefresh();

    console.log(
      `[Cron] daily-refresh: done. ` +
      `refreshed=${result.refreshed} failed=${result.failed}`,
    );

    // Always return 200 — Vercel Cron treats non-2xx as a cron failure
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[Cron] daily-refresh: fatal error', err);
    return NextResponse.json(
      { error: 'Daily refresh failed', refreshed: 0, failed: 0 },
      { status: 200 }, // Still 200 — Vercel Cron does not benefit from 500 retries
    );
  }
}
