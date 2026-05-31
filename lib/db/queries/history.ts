// =============================================================================
// DepGraph — DB Queries: history
// Score history for trend charts. Uses scan_reports table (already exists).
// PRD §12: score_history table for 30/365-day charts.
// =============================================================================

import { getDbClient } from '@/lib/db/client';

export interface ScoreHistoryPoint {
  score: number;
  recordedAt: string; // ISO date string
}

/**
 * Fetch the score history for a project from scan_reports.
 * Each scan creates a record in scan_reports; we use overall_score + created_at.
 *
 * Free tier: 30 days max.
 * Pro tier: 365 days max.
 * The `days` parameter is enforced at the API route level based on plan.
 */
export async function getProjectHistory(
  projectId: string,
  days: number = 30
): Promise<ScoreHistoryPoint[]> {
  const db = getDbClient();

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await db
    .from('scan_reports')
    .select('overall_score, created_at')
    .eq('project_id', projectId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw new Error(`[DB] getProjectHistory failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    score: row.overall_score as number,
    recordedAt: row.created_at as string,
  }));
}

/**
 * Insert a score history record for a package.
 * Called after a scan to keep the score_history table updated.
 * Used by POST /api/scan (via fire-and-forget).
 */
export async function insertScoreHistory(
  packageName: string,
  score: number,
  ecosystem: string = 'npm'
): Promise<void> {
  const db = getDbClient();

  const { error } = await db
    .from('score_history')
    .insert({ package_name: packageName, ecosystem, score });

  if (error) {
    // Non-fatal — history insert failures must not break a scan
    console.warn(`[DB] insertScoreHistory failed for ${packageName}:`, error.message);
  }
}

/**
 * Insert a score_history row linked to a project (for project-level trend chart).
 * Called by the daily refresh service after each project re-scan.
 */
export async function snapshotProjectScore(
  projectId: string,
  score: number,
): Promise<void> {
  const db = getDbClient();

  const { error } = await db
    .from('score_history')
    .insert({ project_id: projectId, package_name: `project:${projectId}`, ecosystem: 'project', score });

  if (error) {
    console.warn(`[DB] snapshotProjectScore failed for ${projectId}:`, error.message);
  }
}

/**
 * Get score history for a package from the score_history table.
 * Returns up to `days` days of data points, one per day.
 */
export async function getPackageHistory(
  packageName: string,
  days: number = 30,
  ecosystem: string = 'npm',
): Promise<ScoreHistoryPoint[]> {
  const db = getDbClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('score_history')
    .select('score, recorded_at')
    .eq('package_name', packageName)
    .eq('ecosystem', ecosystem)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true })
    .limit(days);

  if (error) throw new Error(`[DB] getPackageHistory failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    score:      row.score as number,
    recordedAt: row.recorded_at as string,
  }));
}

/**
 * Snapshot score_history for all packages in the package_scores table.
 * Called by GET /api/cron/history-snapshot daily.
 * Returns the number of snapshots inserted.
 */
export async function snapshotAllPackageScores(): Promise<number> {
  const db = getDbClient();

  // Fetch all current package scores
  const { data: packages, error } = await db
    .from('package_scores')
    .select('package_name, score, ecosystem');

  if (error) throw new Error(`[DB] snapshotAllPackageScores: ${error.message}`);

  const rows = (packages ?? []).map((p) => ({
    package_name: p.package_name as string,
    ecosystem:    p.ecosystem as string,
    score:        p.score as number,
  }));

  if (rows.length === 0) return 0;

  // Batch insert score_history rows (Supabase handles up to ~1000 rows per insert)
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error: insertError } = await db.from('score_history').insert(batch);
    if (insertError) {
      console.warn(`[DB] snapshotAllPackageScores batch insert failed:`, insertError.message);
    } else {
      inserted += batch.length;
    }
  }

  return inserted;
}
