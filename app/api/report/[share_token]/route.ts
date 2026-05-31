// =============================================================================
// GET /api/report/:share_token
// Public endpoint — no auth required (PRD §13 public endpoints).
// Returns full scan report for a share URL. Cache: 1hr.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getScanReportByToken } from '@/lib/db/queries/scans';
import { cacheGet, cacheSet, TTL } from '@/lib/cache/redis';
import { CacheKeys } from '@/lib/cache/keys';
import type { DbScanReport } from '@/lib/types';

interface RouteParams {
  params: { share_token: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { share_token } = params;

  // Basic validation — share tokens are 20 alphanumeric chars
  if (!share_token || !/^[a-zA-Z0-9_-]{10,30}$/.test(share_token)) {
    return NextResponse.json({ error: 'Invalid share token' }, { status: 400 });
  }

  try {
    // 1. Check Redis cache (TTL: 1hr per PRD)
    const cacheKey = CacheKeys.shareReport(share_token);
    const cached = await cacheGet<DbScanReport>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 2. Fetch from DB
    const report = await getScanReportByToken(share_token);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // 3. Cache and return
    cacheSet(cacheKey, report, TTL.SHARE_REPORT).catch(() => {});

    return NextResponse.json(report, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error(`[API /report/:token] Error for token "${share_token}":`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
