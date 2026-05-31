// =============================================================================
// DepGraph — DB Queries: package_scores
// CRUD operations for the core package health score dataset.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import type { DbPackageScore, PackageScore, Alternative, RawSignals } from '@/lib/types';

/**
 * Upsert a computed package score into the database.
 * Uses UNIQUE(package_name, ecosystem) conflict resolution to update in place.
 */
export async function upsertPackageScore(score: PackageScore): Promise<void> {
  const db = getDbClient();

  const row: Omit<DbPackageScore, 'id'> = {
    package_name: score.packageName,
    package_version: score.packageVersion,
    ecosystem: score.ecosystem,
    score: score.score,
    risk_level: score.riskLevel,
    maintenance_score: score.dimensions.maintenance.score,
    bus_factor_score: score.dimensions.busFactor.score,
    issue_health_score: score.dimensions.issueHealth.score,
    download_trend_score: score.dimensions.downloadTrend.score,
    freshness_score: score.dimensions.depFreshness.score,
    vulnerability_score: score.dimensions.vulnerability.score,
    abandonment_risk: score.abandonmentRisk,
    cve_count_active: 0, // populated from osv signals by caller
    last_commit_date: null, // populated from github signals by caller
    contributor_count: null, // populated from github signals by caller
    weekly_downloads: null, // populated from npm signals by caller
    alternatives: score.alternatives,
    raw_signals: null, // stored separately to avoid leaking secrets
    computed_at: score.computedAt.toISOString(),
  };

  const { error } = await db
    .from('package_scores')
    .upsert(row, { onConflict: 'package_name,ecosystem' });

  if (error) {
    console.error(
      `[DB] Failed to upsert package score for "${score.packageName}":`,
      error.message
    );
  }
}

/**
 * Fetch a single package score from the DB.
 * Returns null if not found or if the score is stale (> 24 hours).
 */
export async function getPackageScore(
  name: string,
  ecosystem = 'npm'
): Promise<DbPackageScore | null> {
  const db = getDbClient();

  const { data, error } = await db
    .from('package_scores')
    .select('*')
    .eq('package_name', name)
    .eq('ecosystem', ecosystem)
    .single();

  if (error || !data) return null;

  // Treat data older than 25 hours as stale (give 1hr buffer over 24hr TTL)
  const age = Date.now() - new Date(data.computed_at).getTime();
  if (age > 25 * 60 * 60 * 1000) return null;

  return data as DbPackageScore;
}

/**
 * Fetch multiple package scores in a single query.
 * Returns a Map keyed by package name for O(1) lookup.
 */
export async function getPackageScoresBatch(
  names: string[],
  ecosystem = 'npm'
): Promise<Map<string, DbPackageScore>> {
  const db = getDbClient();

  const { data, error } = await db
    .from('package_scores')
    .select('*')
    .in('package_name', names)
    .eq('ecosystem', ecosystem);

  if (error || !data) return new Map();

  return new Map(data.map((row: DbPackageScore) => [row.package_name, row]));
}
