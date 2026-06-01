// =============================================================================
// DepGraph — DB Queries: action_runs
// =============================================================================

import { getDbClient } from '@/lib/db/client';

export type GateResult = 'pass' | 'warn' | 'fail';

export type DbActionRun = {
  id: string;
  api_key_id: string | null;
  user_id: string;
  github_repo: string;
  pr_number: number;
  base_sha: string | null;
  head_sha: string | null;
  overall_score: number | null;
  critical_count: number;
  high_count: number;
  gate_result: GateResult;
  report_url: string | null;
  execution_ms: number | null;
  created_at: string;
};

export type CreateActionRunParams = {
  apiKeyId:      string | null;
  userId:        string;
  githubRepo:    string;
  prNumber:      number;
  baseSha:       string | null;
  headSha:       string | null;
  overallScore:  number | null;
  criticalCount: number;
  highCount:     number;
  gateResult:    GateResult;
  reportUrl:     string | null;
  executionMs:   number | null;
};

export async function createActionRun(params: CreateActionRunParams): Promise<DbActionRun> {
  const db = getDbClient();
  const { data, error } = await db
    .from('action_runs')
    .insert({
      api_key_id:     params.apiKeyId,
      user_id:        params.userId,
      github_repo:    params.githubRepo,
      pr_number:      params.prNumber,
      base_sha:       params.baseSha,
      head_sha:       params.headSha,
      overall_score:  params.overallScore,
      critical_count: params.criticalCount,
      high_count:     params.highCount,
      gate_result:    params.gateResult,
      report_url:     params.reportUrl,
      execution_ms:   params.executionMs,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`[DB] createActionRun failed: ${error?.message}`);
  return data as DbActionRun;
}

export async function getActionRunsByUser(userId: string, limit = 20): Promise<DbActionRun[]> {
  const db = getDbClient();
  const { data, error } = await db
    .from('action_runs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`[DB] getActionRunsByUser failed: ${error.message}`);
  return (data ?? []) as DbActionRun[];
}
