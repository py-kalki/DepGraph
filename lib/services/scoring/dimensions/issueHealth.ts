// =============================================================================
// DepGraph — Scoring Engine: Issue Health Dimension
// Weight: 15% (PRD §F-02)
// Data sources: GitHub issues API (open/closed ratio, response time)
// =============================================================================

import type { RawSignals, DimensionScore } from '@/lib/types';
import { clamp } from './maintenance';

const WEIGHT = 0.15;
const LABEL = 'Issue Health';

/**
 * Score the Issue Health dimension (0–100).
 *
 * Considers:
 * - Close ratio (closedIssues / totalIssues) — primary signal
 * - Average issue close time — response time bonus/penalty
 *
 * Edge case: 0 total issues → neutral score (50) — not enough data.
 */
export function scoreIssueHealth(signals: RawSignals): DimensionScore {
  const github = signals.github;

  if (!github || !github.hasRepoLink) {
    return {
      score: 50, // neutral — no data
      weight: WEIGHT,
      label: LABEL,
      reason: 'No GitHub repository linked — issue health cannot be assessed.',
      available: false,
    };
  }

  const totalIssues = github.openIssues + github.closedIssues;

  // No issues at all — return neutral score (new or low-traffic package)
  if (totalIssues === 0) {
    return {
      score: 50,
      weight: WEIGHT,
      label: LABEL,
      reason: 'No issues found — unable to assess issue response patterns.',
      available: true,
    };
  }

  const closeRatio = github.closedIssues / totalIssues;

  // Close ratio score
  let closeRatioScore: number;
  if (closeRatio >= 0.8) closeRatioScore = 100;
  else if (closeRatio >= 0.6) closeRatioScore = 75;
  else if (closeRatio >= 0.4) closeRatioScore = 50;
  else if (closeRatio >= 0.2) closeRatioScore = 25;
  else closeRatioScore = 0;

  // Response time modifier
  let responseModifier = 0;
  const avgDays = github.avgIssueCloseTimeDays;
  if (avgDays !== null) {
    if (avgDays <= 7) responseModifier = 20;
    else if (avgDays <= 30) responseModifier = 10;
    else if (avgDays <= 90) responseModifier = 0;
    else responseModifier = -10;
  }

  const score = clamp(closeRatioScore + responseModifier, 0, 100);

  // Human-readable reason
  const closePercent = Math.round(closeRatio * 100);
  let reason: string;
  if (closeRatio >= 0.8) {
    reason = `Excellent issue hygiene: ${closePercent}% close rate${avgDays !== null ? ` with avg ${avgDays}-day response time` : ''}.`;
  } else if (closeRatio >= 0.5) {
    reason = `Moderate issue health: ${closePercent}% close rate — some issues may be going stale.`;
  } else {
    reason = `Poor issue health: only ${closePercent}% of issues are closed — maintainer responsiveness is low.`;
  }

  return { score, weight: WEIGHT, label: LABEL, reason, available: true };
}
