// =============================================================================
// DepGraph — Scoring Engine: Download Trend Dimension
// Weight: 15% (PRD §F-02)
// Data sources: npm registry API (weekly downloads, 90-day trend)
// =============================================================================

import type { RawSignals, DimensionScore } from '@/lib/types';
import { clamp } from './maintenance';

const WEIGHT = 0.15;
const LABEL = 'Download Trend';

/**
 * Score the Download Trend dimension (0–100).
 *
 * Considers:
 * - Download volume (logarithmic scale — avoids unfairly penalising small packages)
 * - 90-day download slope (positive = growing, negative = declining)
 */
export function scoreDownloadTrend(signals: RawSignals): DimensionScore {
  const npm = signals.npm;

  if (!npm) {
    return {
      score: 0,
      weight: WEIGHT,
      label: LABEL,
      reason: 'npm download data unavailable.',
      available: false,
    };
  }

  const { weeklyDownloads, downloadSlope90d } = npm;

  // Zero downloads
  if (weeklyDownloads === 0) {
    return {
      score: 0,
      weight: WEIGHT,
      label: LABEL,
      reason: 'No npm downloads recorded — package may be unused or delisted.',
      available: true,
    };
  }

  // Volume baseline — logarithmic scale ensures small packages aren't scored 0
  let volumeScore: number;
  if (weeklyDownloads >= 1_000_000) volumeScore = 100;
  else if (weeklyDownloads >= 100_000) volumeScore = 80;
  else if (weeklyDownloads >= 10_000) volumeScore = 60;
  else if (weeklyDownloads >= 1_000) volumeScore = 40;
  else if (weeklyDownloads >= 100) volumeScore = 20;
  else volumeScore = 10;

  // Trend modifier (slope is normalised -1 to +1)
  let trendModifier: number;
  if (downloadSlope90d > 0.2) trendModifier = 15; // fast growth
  else if (downloadSlope90d > 0) trendModifier = 5; // slow growth
  else if (downloadSlope90d > -0.2) trendModifier = 0; // flat
  else if (downloadSlope90d > -0.5) trendModifier = -15; // declining
  else trendModifier = -30; // rapid decline

  const score = clamp(volumeScore + trendModifier, 0, 100);

  // Human-readable reason
  const downloadsFormatted = formatDownloads(weeklyDownloads);
  const trendLabel =
    downloadSlope90d > 0.2
      ? 'rapidly growing'
      : downloadSlope90d > 0
      ? 'growing'
      : downloadSlope90d > -0.2
      ? 'stable'
      : downloadSlope90d > -0.5
      ? 'declining'
      : 'rapidly declining';

  const reason = `${downloadsFormatted} weekly downloads — ${trendLabel} over the past 90 days.`;

  return { score, weight: WEIGHT, label: LABEL, reason, available: true };
}

function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}
