// =============================================================================
// DepGraph — DB Queries: usage_events
// =============================================================================

import { getDbClient } from '@/lib/db/client';

export type UsageEventType = 'action_run' | 'api_scan' | 'api_compare';

export type DbUsageEvent = {
  id: string;
  user_id: string;
  event_type: UsageEventType;
  github_repo: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function insertUsageEvent(params: {
  userId:     string;
  eventType:  UsageEventType;
  githubRepo: string | null;
  metadata:   Record<string, unknown>;
}): Promise<void> {
  const db = getDbClient();
  await db.from('usage_events').insert({
    user_id:     params.userId,
    event_type:  params.eventType,
    github_repo: params.githubRepo,
    metadata:    params.metadata,
  });
}

/** Count action_run events for current calendar month. */
export async function getMonthlyActionRunCount(userId: string): Promise<number> {
  const db = getDbClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await db
    .from('usage_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'action_run')
    .gte('created_at', startOfMonth.toISOString());

  if (error) throw new Error(`[DB] getMonthlyActionRunCount failed: ${error.message}`);
  return count ?? 0;
}

/** Count action runs per repo for the user. */
export async function getRepoUsageCount(userId: string, githubRepo: string): Promise<number> {
  const db = getDbClient();
  const { count, error } = await db
    .from('usage_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('github_repo', githubRepo)
    .eq('event_type', 'action_run');

  if (error) throw new Error(`[DB] getRepoUsageCount failed: ${error.message}`);
  return count ?? 0;
}
