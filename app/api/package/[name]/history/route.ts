// =============================================================================
// DepGraph — API: GET /api/package/[name]/history
// Public endpoint — returns score history for a single npm package.
// Returns last 30 data points (no auth required).
// =============================================================================

import { NextResponse } from 'next/server';
import { getPackageHistory } from '@/lib/db/queries/history';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  // Decode scoped package names: @types%2Fnode → @types/node
  const packageName = decodeURIComponent(name);

  if (!packageName || packageName.length > 255) {
    return NextResponse.json({ error: 'Invalid package name' }, { status: 400 });
  }

  const url = new URL(req.url);
  const days = Math.min(parseInt(url.searchParams.get('days') ?? '30', 10), 30);

  const history = await getPackageHistory(packageName, days);
  return NextResponse.json({ packageName, history, days });
}
