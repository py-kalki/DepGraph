// =============================================================================
// DepGraph — DELETE /api/user/api-keys/[id]
// Revoke (delete) a single API key.
// Auth: NextAuth session + ownership check
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { deleteApiKey } from '@/lib/db/queries/apiKeys';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteApiKey(id, session.userId);

  if (!deleted) {
    return NextResponse.json({ error: 'API key not found or access denied' }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
