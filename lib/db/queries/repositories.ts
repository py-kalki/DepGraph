// =============================================================================
// DepGraph — Repository Permissions DB Queries
// Tracks private repo access grants per user.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import type { DbRepositoryPermission, DbRepositorySyncLog } from '@/lib/types';

export async function upsertRepositoryPermission(params: {
  userId:            string;
  githubRepo:        string;
  isPrivate:         boolean;
  accessVerifiedAt:  string;
  accessTokenHint:   string | null;
}): Promise<DbRepositoryPermission> {
  const db = getDbClient();
  const { data, error } = await db
    .from('repository_permissions')
    .upsert(
      {
        user_id:            params.userId,
        github_repo:        params.githubRepo,
        is_private:         params.isPrivate,
        access_verified_at: params.accessVerifiedAt,
        access_token_hint:  params.accessTokenHint,
      },
      { onConflict: 'user_id,github_repo' },
    )
    .select()
    .single();

  if (error) throw new Error(`[DB] upsertRepositoryPermission: ${error.message}`);
  return data as DbRepositoryPermission;
}

export async function getRepositoryPermission(
  userId: string,
  githubRepo: string,
): Promise<DbRepositoryPermission | null> {
  const db = getDbClient();
  const { data } = await db
    .from('repository_permissions')
    .select('*')
    .eq('user_id', userId)
    .eq('github_repo', githubRepo)
    .single();
  return (data as DbRepositoryPermission) ?? null;
}

export async function insertSyncLog(params: {
  projectId: string;
  status:    'success' | 'failed' | 'skipped';
  error:     string | null;
}): Promise<void> {
  const db = getDbClient();
  await db.from('repository_sync_logs').insert({
    project_id: params.projectId,
    status:     params.status,
    error:      params.error,
    synced_at:  new Date().toISOString(),
  });
}

export async function getRecentSyncLogs(
  projectId: string,
  limit = 10,
): Promise<DbRepositorySyncLog[]> {
  const db = getDbClient();
  const { data } = await db
    .from('repository_sync_logs')
    .select('*')
    .eq('project_id', projectId)
    .order('synced_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as DbRepositorySyncLog[];
}
