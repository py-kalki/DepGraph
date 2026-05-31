// =============================================================================
// DepGraph — Health Score Engine
// Main orchestrator: takes RawSignals → returns PackageScore
// Pure function — zero I/O, fully deterministic.
// =============================================================================

import type {
  RawSignals,
  PackageScore,
  ScoreDimensions,
  RiskLevel,
  Ecosystem,
  Alternative,
} from '@/lib/types';
import { scoreMaintenance } from './dimensions/maintenance';
import { scoreBusFactor } from './dimensions/busFactor';
import { scoreIssueHealth } from './dimensions/issueHealth';
import { scoreDownloadTrend } from './dimensions/downloadTrend';
import { scoreDepFreshness } from './dimensions/depFreshness';
import { scoreVulnerability } from './dimensions/vulnerability';
import { checkAbandonmentRisk } from './abandonment';
import { getTopFactors } from './explainer';

// ─── Risk level classification ────────────────────────────────────────────────

/**
 * Map a composite score to a risk level per PRD §F-02 score bands.
 *
 * Score 80–100 → healthy  (Green)
 * Score 60–79  → stable   (Blue)   [PRD label: "Stable"]
 * Score 40–59  → medium   (Yellow) [PRD label: "Aging"]
 * Score 20–39  → high     (Orange) [PRD label: "At Risk"]
 * Score 0–19   → critical (Red)
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'healthy';
  if (score >= 60) return 'low'; // maps to PRD "Stable" band, internally 'low'
  if (score >= 40) return 'medium'; // maps to PRD "Aging"
  if (score >= 20) return 'high';   // maps to PRD "At Risk"
  return 'critical';
}

// ─── Display label (for UI rendering) ────────────────────────────────────────

export const RISK_DISPLAY_LABELS: Record<RiskLevel, string> = {
  healthy: 'Healthy',
  low: 'Stable',      // PRD calls the 60-79 band "Stable" (Blue)
  medium: 'Aging',    // PRD calls the 40-59 band "Aging" (Yellow)
  high: 'At Risk',    // PRD calls the 20-39 band "At Risk" (Orange)
  critical: 'Critical',
};

// ─── Weighted score computation ───────────────────────────────────────────────

/**
 * Compute the final weighted composite score.
 *
 * Null-signal re-weighting: if a dimension's signals were unavailable (available=false),
 * exclude it and redistribute its weight proportionally among remaining dimensions.
 * This prevents unfair penalisation for missing data.
 */
function computeWeightedScore(dimensions: ScoreDimensions): number {
  const allDimensions = [
    dimensions.maintenance,
    dimensions.busFactor,
    dimensions.issueHealth,
    dimensions.downloadTrend,
    dimensions.depFreshness,
    dimensions.vulnerability,
  ];

  const available = allDimensions.filter((d) => d.available);

  // Edge case: no dimensions available at all
  if (available.length === 0) return 0;

  const totalWeight = available.reduce((sum, d) => sum + d.weight, 0);

  const weightedSum = available.reduce((sum, d) => {
    const normalizedWeight = d.weight / totalWeight; // re-weight proportionally
    return sum + d.score * normalizedWeight;
  }, 0);

  return Math.round(weightedSum);
}

// ─── Main scoring function ────────────────────────────────────────────────────

/**
 * Compute a full PackageScore from raw signals.
 *
 * This is the heart of DepGraph's scoring engine.
 * Pure function — same inputs always produce the same output.
 * No network calls, no database access, no side effects.
 */
export function computePackageScore(
  packageName: string,
  packageVersion: string | null,
  signals: RawSignals,
  ecosystem: Ecosystem = 'npm',
  alternatives: Alternative[] = []
): PackageScore {
  // 1. Compute all 6 dimension scores
  const dimensions: ScoreDimensions = {
    maintenance: scoreMaintenance(signals),
    busFactor: scoreBusFactor(signals),
    issueHealth: scoreIssueHealth(signals),
    downloadTrend: scoreDownloadTrend(signals),
    depFreshness: scoreDepFreshness(signals),
    vulnerability: scoreVulnerability(signals),
  };

  // 2. Compute weighted composite score (with null-signal re-weighting)
  const score = computeWeightedScore(dimensions);

  // 3. Classify risk level
  const riskLevel = scoreToRiskLevel(score);

  // 4. Check abandonment risk flag (all 4 PRD conditions)
  const abandonmentRisk = checkAbandonmentRisk(signals);

  // 5. Generate top-2 explaining factors (PRD requirement)
  const topFactors = getTopFactors(dimensions);

  return {
    packageName,
    packageVersion,
    ecosystem,
    score,
    riskLevel,
    abandonmentRisk,
    dimensions,
    topFactors,
    alternatives,
    computedAt: new Date(),
  };
}

// ─── Project-level aggregation ────────────────────────────────────────────────

/**
 * Compute an overall project health score from a list of package scores.
 * Simple mean — all packages weighted equally.
 */
export function computeProjectScore(packageScores: PackageScore[]): number {
  if (packageScores.length === 0) return 100;
  const total = packageScores.reduce((sum, p) => sum + p.score, 0);
  return Math.round(total / packageScores.length);
}

/**
 * Count packages by risk level.
 */
export function countByRiskLevel(
  packageScores: PackageScore[]
): Record<RiskLevel, number> {
  const counts: Record<RiskLevel, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    healthy: 0,
  };

  for (const pkg of packageScores) {
    const countKey = pkg.riskLevel;
    counts[countKey]++;
  }

  return counts;
}
