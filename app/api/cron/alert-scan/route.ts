// =============================================================================
// DepGraph — GET /api/cron/alert-scan
// Runs 2× daily (08:00 + 20:00 UTC) via Vercel Cron.
// Scans all active alert subscriptions, sends score-drop / CVE / abandonment emails.
// =============================================================================

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getEnv } from '@/lib/env';
import { runAlertScan } from '@/lib/services/alerts/scanner';

export async function GET(): Promise<NextResponse> {
  const headersList = await headers();
  const cronSecret  = headersList.get('authorization');

  if (cronSecret !== `Bearer ${getEnv().CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] alert-scan: starting');

  try {
    const result = await runAlertScan();
    console.log(`[Cron] alert-scan: done. processed=${result.processed} sent=${result.sent} failed=${result.failed}`);
    return NextResponse.json({ ...result, ok: true }, { status: 200 });
  } catch (err) {
    console.error('[Cron] alert-scan: fatal error', err);
    return NextResponse.json({ error: 'Alert scan failed', ok: false }, { status: 200 });
  }
}
