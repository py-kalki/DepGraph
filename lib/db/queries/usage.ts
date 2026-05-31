// =============================================================================
// DepGraph — Usage Metrics Queries
// Aggregates usage for /api/user/usage endpoint.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import type { PlanTier } from '@/lib/types';
import { PLAN_LIMITS } from '@/lib/types';

export interface UserUsage {
  plan: PlanTier;
  subscriptionStatus: string;
  projectCount: number;
  maxProjects: number | null;
  scanCount: number;         // scans in the last 30 days
  historyDays: 30 | 365;
  canUsePrivateRepos: boolean;
  canOnDemandRefresh: boolean;
}

export async function getUserUsage(userId: string): Promise<UserUsage> {
  const db = getDbClient();

  // Fetch user plan + subscription status
  const { data: user } = await db
    .from('users')
    .select('plan, subscription_status')
    .eq('id', userId)
    .single();

  const plan = ((user?.plan as PlanTier) ?? 'free');
  const subscriptionStatus = (user?.subscription_status as string) ?? 'inactive';
  const limits = PLAN_LIMITS[plan];

  // Count active projects
  const { count: projectCount } = await db
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);

  // Count scans in last 30 days
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: scanCount } = await db
    .from('scan_reports')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', userId) // this is wrong — join via projects
    .gte('created_at', since);

  // Correct scan count: scans on user's projects
  const { data: projectIds } = await db
    .from('projects')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  const ids = (projectIds ?? []).map((p: { id: string }) => p.id);
  let finalScanCount = 0;
  if (ids.length > 0) {
    const { count } = await db
      .from('scan_reports')
      .select('id', { count: 'exact', head: true })
      .in('project_id', ids)
      .gte('created_at', since);
    finalScanCount = count ?? 0;
  }

  return {
    plan,
    subscriptionStatus,
    projectCount: projectCount ?? 0,
    maxProjects:  limits.maxProjects,
    scanCount:    finalScanCount,
    historyDays:  limits.historyDays,
    canUsePrivateRepos:    limits.canUsePrivateRepos,
    canOnDemandRefresh:    limits.canOnDemandRefresh,
  };
}
