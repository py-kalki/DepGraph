// =============================================================================
// Unit Tests: Download Trend Dimension
// =============================================================================

import { scoreDownloadTrend } from '@/lib/services/scoring/dimensions/downloadTrend';
import type { RawSignals } from '@/lib/types';

function makeSignals(weeklyDownloads: number, downloadSlope90d: number): RawSignals {
  return {
    github: null,
    npm: {
      weeklyDownloads,
      weeklyDownloads30dAgo: weeklyDownloads,
      weeklyDownloads90dAgo: weeklyDownloads,
      downloadSlope90d,
      latestVersion: '1.0.0',
      publishedAt: new Date(),
      totalVersions: 10,
      directDepCount: 5,
      outdatedDepCount: 0,
      hasInstallScript: false,
    },
    osv: null,
    fetchedAt: new Date(),
  };
}

describe('scoreDownloadTrend', () => {
  test('zero downloads → score = 0', () => {
    const result = scoreDownloadTrend(makeSignals(0, 0));
    expect(result.score).toBe(0);
  });

  test('1M+ downloads + positive slope → score ≥ 90', () => {
    const result = scoreDownloadTrend(makeSignals(5_000_000, 0.3));
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test('1M+ downloads + rapid decline (slope -0.6) → score ≤ 75', () => {
    const result = scoreDownloadTrend(makeSignals(1_000_000, -0.6));
    expect(result.score).toBeLessThanOrEqual(75);
  });

  test('100k downloads + flat slope → mid-range score', () => {
    const result = scoreDownloadTrend(makeSignals(100_000, 0));
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.score).toBeLessThanOrEqual(90);
  });

  test('1k downloads + flat slope → low-mid score', () => {
    const result = scoreDownloadTrend(makeSignals(1_000, 0));
    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.score).toBeLessThanOrEqual(60);
  });

  test('small package (500 downloads) → above 0 (logarithmic scale)', () => {
    const result = scoreDownloadTrend(makeSignals(500, 0));
    expect(result.score).toBeGreaterThan(0);
  });

  test('positive slope (0.3) adds +15 to base score', () => {
    const growing = scoreDownloadTrend(makeSignals(10_000, 0.3));
    const flat = scoreDownloadTrend(makeSignals(10_000, 0));
    expect(growing.score).toBeGreaterThan(flat.score);
  });

  test('rapidly declining slope (-0.6) subtracts from base', () => {
    const declining = scoreDownloadTrend(makeSignals(10_000, -0.6));
    const flat = scoreDownloadTrend(makeSignals(10_000, 0));
    expect(declining.score).toBeLessThan(flat.score);
  });

  test('null npm signals → available = false, score = 0', () => {
    const signals: RawSignals = { github: null, npm: null, osv: null, fetchedAt: new Date() };
    const result = scoreDownloadTrend(signals);
    expect(result.score).toBe(0);
    expect(result.available).toBe(false);
  });

  test('score always 0–100', () => {
    const extremeHigh = scoreDownloadTrend(makeSignals(100_000_000, 1.0));
    const extremeLow = scoreDownloadTrend(makeSignals(1, -1.0));
    expect(extremeHigh.score).toBeLessThanOrEqual(100);
    expect(extremeLow.score).toBeGreaterThanOrEqual(0);
  });

  test('weight is 0.15', () => {
    const result = scoreDownloadTrend(makeSignals(1_000_000, 0));
    expect(result.weight).toBe(0.15);
  });
});
