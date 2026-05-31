// =============================================================================
// DepGraph — DB Queries: scan_reports
// Stores full project scan results; share_token enables public share URLs.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import type { DbScanReport, ScanReport } from '@/lib/types';
import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically random share token (20 chars).
 * Uses Node.js crypto to avoid ESM/CJS compatibility issues.
 * Format: URL-safe base64 chars. e.g., "a3f9x2k1Bz7Nm4Pq2R8W"
 */
function generateShareToken(): string {
  return randomBytes(15).toString('base64url').slice(0, 20);
}

/**
 * Persist a new scan report and return its share token.
 */
export async function createScanReport(
  report: Omit<ScanReport, 'id' | 'shareToken' | 'createdAt'>
): Promise<{ id: string; shareToken: string }> {
  const db = getDbClient();
  const shareToken = generateShareToken();

  const depScores = report.packages.map((p) => ({
    name: p.packageName,
    version: p.packageVersion,
    score: p.score,
    risk_level: p.riskLevel,
  }));

  const { data, error } = await db
    .from('scan_reports')
    .insert({
      project_id: report.projectId,
      share_token: shareToken,
      overall_score: report.overallScore,
      total_deps: report.totalDeps,
      critical_count: report.criticalCount,
      high_count: report.highCount,
      dep_scores: depScores,
    })
    .select('id, share_token')
    .single();

  if (error || !data) {
    throw new Error(`[DB] Failed to create scan report: ${error?.message}`);
  }

  return { id: data.id, shareToken: data.share_token };
}

/**
 * Fetch a scan report by its share token.
 * Used by GET /api/report/:share_token (public endpoint, no auth).
 */
export async function getScanReportByToken(
  shareToken: string
): Promise<DbScanReport | null> {
  const db = getDbClient();

  const { data, error } = await db
    .from('scan_reports')
    .select('*')
    .eq('share_token', shareToken)
    .single();

  if (error || !data) return null;
  return data as DbScanReport;
}

/**
 * Fetch recent scan reports for a project (for history view).
 */
export async function getProjectScanHistory(
  projectId: string,
  limit = 30
): Promise<DbScanReport[]> {
  const db = getDbClient();

  const { data, error } = await db
    .from('scan_reports')
    .select('id, share_token, overall_score, total_deps, critical_count, high_count, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as DbScanReport[];
}
