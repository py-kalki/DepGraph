// =============================================================================
// DepGraph — GET/POST /api/user/api-keys
// List user's API keys / Create a new API key.
// Auth: NextAuth session
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  getApiKeysByUserId,
  createApiKey,
} from '@/lib/db/queries/apiKeys';

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keys = await getApiKeysByUserId(session.userId);
  // Never expose key_hash
  return NextResponse.json(
    keys.map(({ key_hash: _h, ...rest }) => rest),
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body  = await req.json().catch(() => ({}));
  const name  = (body.name as string)?.trim() || 'Default';

  // Plan check: require Pro or Team to create action API keys
  const plan = (session as { plan?: string }).plan ?? 'free';
  if (plan === 'free') {
    return NextResponse.json(
      { error: 'API keys require a Pro or Team plan' },
      { status: 403 },
    );
  }

  const { rawKey, record } = await createApiKey(session.userId, name);

  // Return raw key ONCE — client must copy it now
  const { key_hash: _h, ...safeRecord } = record;
  return NextResponse.json({ ...safeRecord, raw_key: rawKey }, { status: 201 });
}
