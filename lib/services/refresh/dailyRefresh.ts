// =============================================================================
// DepGraph — Daily Refresh Batch
// Finds all projects due for refresh and calls refreshProject() on each.
// Used by: GET /api/cron/daily-refresh (Vercel Cron)
// PRD §F-04: "Projects auto-refresh scores daily"
// =============================================================================

import { getProjectsDueForRefresh } from '@/lib/db/queries/projects';
import { getProjectScanHistory } from '@/lib/db/queries/scans';
import { refreshProject } from './projectRefresh';

export interface DailyRefreshResult {
  refreshed: number;
  failed:    number;
  errors:    Array<{ projectId: string; error: string }>;
}

/**
 * Batch refresh all eligible projects.
 * Each project is refreshed independently — one failure doesn't abort the batch.
 */
export async function runDailyRefresh(): Promise<DailyRefreshResult> {
  const projects = await getProjectsDueForRefresh();

  let refreshed = 0;
  let failed    = 0;
  const errors: Array<{ projectId: string; error: string }> = [];

  for (const project of projects) {
    try {
      // Get the latest dep list from the most recent scan
      const scans = await getProjectScanHistory(project.id, 1);
      const latestScan = scans[0];

      if (!latestScan || !Array.isArray(latestScan.dep_scores) || latestScan.dep_scores.length === 0) {
        // No prior scan to base refresh on — skip
        continue;
      }

      // Reconstruct "name@version" strings from the stored dep_scores
      const depNames: string[] = latestScan.dep_scores.map((d) =>
        d.version ? `${d.name}@${d.version}` : d.name,
      );

      await refreshProject(project.id, depNames);
      refreshed++;
    } catch (err) {
      failed++;
      const errMessage = err instanceof Error ? err.message : String(err);
      errors.push({ projectId: project.id, error: errMessage });
      console.error(`[DailyRefresh] Failed to refresh project ${project.id}: ${errMessage}`);
    }
  }

  return { refreshed, failed, errors };
}
