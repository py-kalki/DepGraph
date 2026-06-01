// =============================================================================
// DepGraph — DB Queries: pr_comments
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import { createHash } from 'crypto';

export type DbPrComment = {
  id: string;
  action_run_id: string | null;
  user_id: string;
  github_repo: string;
  pr_number: number;
  comment_id: number | null;
  body_hash: string | null;
  created_at: string;
  updated_at: string;
};

export function hashCommentBody(body: string): string {
  return createHash('sha256').update(body).digest('hex');
}

/** Get the tracked comment for a repo+PR+user. */
export async function getPrComment(
  userId: string,
  githubRepo: string,
  prNumber: number,
): Promise<DbPrComment | null> {
  const db = getDbClient();
  const { data } = await db
    .from('pr_comments')
    .select('*')
    .eq('user_id', userId)
    .eq('github_repo', githubRepo)
    .eq('pr_number', prNumber)
    .maybeSingle();

  return (data as DbPrComment | null) ?? null;
}

/** Upsert the tracked comment (create or update comment_id + body_hash). */
export async function upsertPrComment(params: {
  userId:       string;
  githubRepo:   string;
  prNumber:     number;
  commentId:    number;
  bodyHash:     string;
  actionRunId:  string | null;
}): Promise<void> {
  const db = getDbClient();
  const now = new Date().toISOString();
  await db
    .from('pr_comments')
    .upsert(
      {
        user_id:       params.userId,
        github_repo:   params.githubRepo,
        pr_number:     params.prNumber,
        comment_id:    params.commentId,
        body_hash:     params.bodyHash,
        action_run_id: params.actionRunId,
        updated_at:    now,
      },
      { onConflict: 'github_repo,pr_number,user_id' },
    );
}
