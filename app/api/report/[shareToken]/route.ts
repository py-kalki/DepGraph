// =============================================================================
// DepGraph — API: GET /api/report/[shareToken]
// Public endpoint — no authentication required.
// Returns a scan report by its share token.
// Cached in Redis for 1 hour per PRD §13.
// =============================================================================

import { NextResponse } from 'next/server';
import { cacheGet, cacheSet, TTL } from '@/lib/cache/redis';
import { getScanReportByToken } from '@/lib/db/queries/scans';
import type { DbScanReport } from '@/lib/types';

const CACHE_TTL_SECONDS = 3600; // 1 hour — PRD §13

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;

  if (!shareToken || shareToken.length > 30) {
    return NextResponse.json({ error: 'Invalid share token' }, { status: 400 });
  }

  const cacheKey = `report:${shareToken}`;

  // ─── Redis cache hit ───────────────────────────────────────────────────────
  try {
    const cached = await cacheGet<DbScanReport>(cacheKey);
    if (cached) {
      return NextResponse.json(
        { report: cached },
        { headers: { 'X-Cache': 'HIT' } }
      );
    }
  } catch (cacheErr) {
    // Cache miss — continue to DB (non-fatal)
    console.warn('[report route] Redis get failed:', cacheErr);
  }

  // ─── DB lookup ─────────────────────────────────────────────────────────────
  const report = await getScanReportByToken(shareToken);
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // ─── Populate cache ────────────────────────────────────────────────────────
  try {
    await cacheSet(cacheKey, report, CACHE_TTL_SECONDS);
  } catch (cacheErr) {
    console.warn('[report route] Redis set failed:', cacheErr);
  }

  return NextResponse.json(
    { report },
    { headers: { 'X-Cache': 'MISS' } }
  );
}
