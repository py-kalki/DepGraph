// =============================================================================
// DepGraph — DB Queries: api_keys
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import { createHash, randomBytes } from 'crypto';

export type DbApiKey = {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a new raw API key: dg_live_<32 random hex chars> */
export function generateRawApiKey(): string {
  const rand = randomBytes(24).toString('hex'); // 48 hex chars
  return `dg_live_${rand}`;
}

/** Hash a raw key for storage (never store raw) */
export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

/** Extract the display prefix (first 12 chars of raw key, e.g. "dg_live_a1b2") */
export function keyPrefix(rawKey: string): string {
  return rawKey.slice(0, 12);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Create a new API key. Returns the raw key ONCE — hash is stored. */
export async function createApiKey(
  userId: string,
  name: string,
): Promise<{ rawKey: string; record: DbApiKey }> {
  const db = getDbClient();
  const rawKey = generateRawApiKey();

  const { data, error } = await db
    .from('api_keys')
    .insert({
      user_id:    userId,
      key_hash:   hashApiKey(rawKey),
      key_prefix: keyPrefix(rawKey),
      name,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`[DB] createApiKey failed: ${error?.message}`);
  return { rawKey, record: data as DbApiKey };
}

/** List all API keys for a user (no hashes exposed). */
export async function getApiKeysByUserId(userId: string): Promise<DbApiKey[]> {
  const db = getDbClient();
  const { data, error } = await db
    .from('api_keys')
    .select('id, user_id, key_prefix, name, last_used_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`[DB] getApiKeysByUserId failed: ${error.message}`);
  return (data ?? []) as DbApiKey[];
}

/** Look up a user by raw API key. Returns null if invalid. */
export async function getUserByApiKey(
  rawKey: string,
): Promise<{ userId: string; plan: string; keyId: string } | null> {
  const db = getDbClient();
  const hash = hashApiKey(rawKey);

  const { data, error } = await db
    .from('api_keys')
    .select('id, user_id, users!inner(plan)')
    .eq('key_hash', hash)
    .single();

  if (error || !data) return null;

  // Update last_used_at asynchronously (non-blocking)
  db.from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then(() => {});

  // Supabase !inner join returns users as an object; cast through unknown for safety
  const userData = (data as unknown as { id: string; user_id: string; users: { plan: string } });
  return {
    userId: userData.user_id,
    plan:   userData.users?.plan ?? 'free',
    keyId:  userData.id,
  };
}

/** Delete a single API key (ownership-checked). */
export async function deleteApiKey(id: string, userId: string): Promise<boolean> {
  const db = getDbClient();
  const { error, count } = await db
    .from('api_keys')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(`[DB] deleteApiKey failed: ${error.message}`);
  return (count ?? 0) > 0;
}
