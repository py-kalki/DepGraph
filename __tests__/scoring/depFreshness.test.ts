// =============================================================================
// Unit Tests: Dependency Freshness Dimension
// =============================================================================

import { scoreDepFreshness } from '@/lib/services/scoring/dimensions/depFreshness';
import type { RawSignals } from '@/lib/types';

function makeSignals(directDepCount: number, outdatedDepCount: number): RawSignals {
  return {
    github: null,
    npm: {
      weeklyDownloads: 100_000,
      weeklyDownloads30dAgo: 100_000,
      weeklyDownloads90dAgo: 100_000,
      downloadSlope90d: 0,
      latestVersion: '1.0.0',
      publishedAt: new Date(),
      totalVersions: 10,
      directDepCount,
      outdatedDepCount,
      hasInstallScript: false,
    },
    osv: null,
    fetchedAt: new Date(),
  };
}

describe('scoreDepFreshness', () => {
  test('0 direct deps → score = 100', () => {
    const result = scoreDepFreshness(makeSignals(0, 0));
    expect(result.score).toBe(100);
  });

  test('all deps up to date → score = 100', () => {
    const result = scoreDepFreshness(makeSignals(10, 0));
    expect(result.score).toBe(100);
  });

  test('10% outdated → score = 80', () => {
    const result = scoreDepFreshness(makeSignals(10, 1));
    expect(result.score).toBe(80);
  });

  test('25% outdated → score ≤ 65', () => {
    const result = scoreDepFreshness(makeSignals(4, 1));
    expect(result.score).toBeLessThanOrEqual(65);
  });

  test('50% outdated → score ≤ 45', () => {
    const result = scoreDepFreshness(makeSignals(10, 5));
    expect(result.score).toBeLessThanOrEqual(45);
  });

  test('75% outdated → score ≤ 25', () => {
    const result = scoreDepFreshness(makeSignals(4, 3));
    expect(result.score).toBeLessThanOrEqual(25);
  });

  test('100% outdated → score = 0', () => {
    const result = scoreDepFreshness(makeSignals(5, 5));
    expect(result.score).toBe(0);
  });

  test('null npm signals → available = false, neutral score', () => {
    const signals: RawSignals = { github: null, npm: null, osv: null, fetchedAt: new Date() };
    const result = scoreDepFreshness(signals);
    expect(result.available).toBe(false);
    expect(result.score).toBe(50); // neutral when no data
  });

  test('more outdated → lower score (monotonically decreasing)', () => {
    const s0 = scoreDepFreshness(makeSignals(10, 0));
    const s2 = scoreDepFreshness(makeSignals(10, 2));
    const s5 = scoreDepFreshness(makeSignals(10, 5));
    const s8 = scoreDepFreshness(makeSignals(10, 8));
    const s10 = scoreDepFreshness(makeSignals(10, 10));
    // Monotonically non-increasing (boundary bands may produce equal values)
    expect(s0.score).toBeGreaterThanOrEqual(s2.score);
    expect(s2.score).toBeGreaterThanOrEqual(s5.score);
    expect(s5.score).toBeGreaterThanOrEqual(s8.score);
    expect(s8.score).toBeGreaterThanOrEqual(s10.score);
    // At least some meaningful separation between clean and fully outdated
    expect(s0.score).toBeGreaterThan(s10.score);
  });

  test('weight is 0.10', () => {
    const result = scoreDepFreshness(makeSignals(10, 2));
    expect(result.weight).toBe(0.10);
  });
});
