// =============================================================================
// DepGraph — PATCH + DELETE /api/alerts/[id]
// Update or delete a specific alert subscription (ownership enforced).
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { updateAlertSubscription, deleteAlertSubscription } from '@/lib/db/queries/alerts';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { threshold, destination, isActive } = body as {
    threshold?:   number;
    destination?: string;
    isActive?:    boolean;
  };

  const updated = await updateAlertSubscription(
    id,
    session.userId,
    {
      ...(threshold   !== undefined && { threshold }),
      ...(destination !== undefined && { destination }),
      ...(isActive    !== undefined && { is_active: isActive }),
    },
  );

  if (!updated) {
    return NextResponse.json({ error: 'Alert not found or access denied' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ok = await deleteAlertSubscription(id, session.userId);
  if (!ok) return NextResponse.json({ error: 'Alert not found or access denied' }, { status: 404 });

  return NextResponse.json({ deleted: true });
}
