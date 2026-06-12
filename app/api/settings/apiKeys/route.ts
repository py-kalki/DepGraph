import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createApiKey, getApiKeysByUserId, deleteApiKey } from '@/lib/db/queries/apiKeys';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const keys = await getApiKeysByUserId(session.userId);
    return NextResponse.json({ keys });
  } catch (err) {
    console.error('[GET /api/settings/apiKeys]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Key name is required' }, { status: 400 });
    }

    const { rawKey, record } = await createApiKey(session.userId, body.name);
    return NextResponse.json({ rawKey, record }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/settings/apiKeys]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    await deleteApiKey(id, session.userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/settings/apiKeys]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
