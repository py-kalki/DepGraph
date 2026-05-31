// =============================================================================
// DepGraph — Scoring Engine: Abandonment Risk Detection
// PRD §F-02: "Abandonment risk flag"
// All 4 conditions must be true simultaneously.
// =============================================================================

import type { RawSignals } from '@/lib/types';

const TWELVE_MONTHS_MS = 12 * 30 * 24 * 60 * 60 * 1000;

/**
 * Compute the abandonment risk flag.
 *
 * Per PRD §F-02, triggered when ALL four conditions are simultaneously met:
 * 1. Last commit > 12 months ago
 * 2. Bus factor = 1 (single maintainer)
 * 3. Download trend negative for 90 days (downloadSlope90d < 0)
 * 4. 0 releases in the last 12 months
 *
 * Returns false if any signal is null — we only flag when we have
 * positive evidence of all four risk indicators (conservative approach).
 *
 * This flag is independent of the numeric score — a package can score
 * 25/100 without triggering the flag (e.g., if it has 2 maintainers).
 */
export function checkAbandonmentRisk(signals: RawSignals): boolean {
  const { github, npm } = signals;

  // Conservative: missing signals → do not flag
  if (!github || !npm) return false;
  if (!github.hasRepoLink) return false;
  if (github.lastCommitDate === null) return false;

  // Condition 1: Last commit > 12 months ago
  const daysSinceCommit = Date.now() - github.lastCommitDate.getTime();
  if (daysSinceCommit <= TWELVE_MONTHS_MS) return false;

  // Condition 2: Bus factor = 1
  if (github.busFactor !== 1) return false;

  // Condition 3: Download trend negative for 90 days
  if (npm.downloadSlope90d >= 0) return false;

  // Condition 4: 0 releases in last 12 months
  if (github.releaseCount12mo !== 0) return false;

  // All 4 conditions met
  return true;
}
