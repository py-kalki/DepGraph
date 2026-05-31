// =============================================================================
// DepGraph — Scoring Engine: Maintenance Activity Dimension
// Weight: 25% (PRD §F-02)
// Data sources: GitHub API (last commit, commit frequency, releases)
// =============================================================================

import type { RawSignals, DimensionScore } from '@/lib/types';

const WEIGHT = 0.25;
const LABEL = 'Maintenance Activity';

/**
 * Clamp a number between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get months between a past date and now.
 */
function monthsSince(date: Date): number {
  const now = new Date();
  return (
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth())
  );
}

/**
 * Score the Maintenance Activity dimension (0–100).
 *
 * Considers:
 * - Months since last commit (primary signal)
 * - Number of releases in last 12 months (bonus)
 * - Commit frequency over 90 days (bonus)
 */
export function scoreMaintenance(signals: RawSignals): DimensionScore {
  const github = signals.github;

  // No GitHub link — signals unavailable
  if (!github || !github.hasRepoLink) {
    return {
      score: 0,
      weight: WEIGHT,
      label: LABEL,
      reason: 'No GitHub repository linked — maintenance activity cannot be assessed.',
      available: false,
    };
  }

  // Last commit is the primary signal
  if (!github.lastCommitDate) {
    return {
      score: 0,
      weight: WEIGHT,
      label: LABEL,
      reason: 'No commit history found — repository may be empty or inaccessible.',
      available: true,
    };
  }

  const months = monthsSince(github.lastCommitDate);

  // Base score from time since last commit
  let commitScore: number;
  if (months <= 1) commitScore = 100;
  else if (months <= 3) commitScore = 80;
  else if (months <= 6) commitScore = 60;
  else if (months <= 12) commitScore = 40;
  else if (months <= 24) commitScore = 20;
  else commitScore = 0;

  // Release bonus
  let releaseBonus = 0;
  if (github.releaseCount12mo >= 4) releaseBonus = 10;
  else if (github.releaseCount12mo >= 1) releaseBonus = 5;

  // Commit frequency bonus
  let frequencyBonus = 0;
  if (github.commitFrequency90d >= 5) frequencyBonus = 10;
  else if (github.commitFrequency90d >= 1) frequencyBonus = 5;

  const score = clamp(commitScore + releaseBonus + frequencyBonus, 0, 100);

  // Generate human-readable reason
  let reason: string;
  if (months <= 1) {
    reason = `Active: last commit ${months === 0 ? 'this month' : '1 month ago'} with ${github.releaseCount12mo} releases in the past year.`;
  } else if (months <= 6) {
    reason = `Maintained: last commit ${months} months ago with ${github.commitFrequency90d.toFixed(1)} commits/week.`;
  } else if (months <= 12) {
    reason = `Slowing: last commit ${months} months ago — watch for reduced activity.`;
  } else if (months <= 24) {
    reason = `Low activity: last commit ${months} months ago with ${github.releaseCount12mo} releases in the past year.`;
  } else {
    reason = `Inactive: last commit was ${months} months ago — possible abandonment.`;
  }

  return { score, weight: WEIGHT, label: LABEL, reason, available: true };
}
