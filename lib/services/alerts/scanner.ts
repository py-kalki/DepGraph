// =============================================================================
// DepGraph — Alert Scanner
// Batch-processes all active alert subscriptions for the cron job.
// Reads project scores, compares to previous snapshots, fires emails.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import { getAllActiveEmailAlerts } from '@/lib/db/queries/alerts';
import { processEmailQueue } from '@/lib/services/resend/queue';
import {
  checkScoreDrop,
  type ScoreSnapshot,
} from './engine';
import type { SendEmailParams } from '@/lib/services/resend/sender';

export interface AlertScanResult {
  processed:  number;
  emailsQueued: number;
  sent:       number;
  failed:     number;
}

/**
 * Main entry point called by /api/cron/alert-scan.
 * 1. Fetch all active alert subscriptions
 * 2. For each, compare current score vs previous score snapshot
 * 3. Build email queue
 * 4. Process queue (max 50 emails)
 */
export async function runAlertScan(): Promise<AlertScanResult> {
  const db     = getDbClient();
  const alerts = await getAllActiveEmailAlerts();

  const emails: SendEmailParams[] = [];

  // Collect unique project IDs
  const projectIds = Array.from(new Set(alerts.map((a) => a.project_id)));

  // Fetch current project scores
  const { data: projects } = await db
    .from('projects')
    .select('id, name, score, share_token')
    .in('id', projectIds);

  const projectMap = new Map<string, { id: string; name: string; score: number | null; share_token: string | null }>(
    (projects ?? []).map((p) => [p.id as string, p as never]),
  );

  // Fetch previous score snapshots (last record before today)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { data: historyRows } = await db
    .from('project_score_history')
    .select('project_id, overall_score, created_at')
    .in('project_id', projectIds)
    .lt('created_at', yesterday.toISOString())
    .order('created_at', { ascending: false });

  // Build previous score map (most recent history per project)
  const prevScoreMap = new Map<string, number>();
  for (const row of (historyRows ?? [])) {
    const pid = row.project_id as string;
    if (!prevScoreMap.has(pid)) {
      prevScoreMap.set(pid, row.overall_score as number);
    }
  }

  // Evaluate each alert
  for (const alert of alerts) {
    const project = projectMap.get(alert.project_id);
    if (!project || project.score === null) continue;

    const current: ScoreSnapshot = {
      projectId:   project.id,
      projectName: project.name,
      score:       project.score,
      shareToken:  project.share_token,
    };

    const prevScore = prevScoreMap.get(alert.project_id);
    const previous: ScoreSnapshot | null = prevScore !== undefined
      ? { ...current, score: prevScore }
      : null;

    const email = checkScoreDrop(alert, current, previous);
    if (email) emails.push(email);
  }

  // Process the queue
  const result = await processEmailQueue(emails);

  return {
    processed:    alerts.length,
    emailsQueued: emails.length,
    sent:         result.sent,
    failed:       result.failed,
  };
}
