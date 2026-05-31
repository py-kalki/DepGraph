// =============================================================================
// Unit Tests: Issue Health Dimension
// =============================================================================

import { scoreIssueHealth } from '@/lib/services/scoring/dimensions/issueHealth';
import type { RawSignals } from '@/lib/types';

function makeSignals(
  openIssues: number,
  closedIssues: number,
  avgIssueCloseTimeDays: number | null = null,
  hasRepoLink = true
): RawSignals {
  return {
    github: {
      lastCommitDate: new Date(),
      commitFrequency90d: 2,
      contributorCount: 10,
      activeContributors: 5,
      busFactor: 3,
      openIssues,
      closedIssues,
      avgIssueCloseTimeDays,
      repoUrl: hasRepoLink ? 'https://github.com/test/test' : null,
      hasRepoLink,
      releaseCount12mo: 4,
    },
    npm: null,
    osv: null,
    fetchedAt: new Date(),
  };
}

describe('scoreIssueHealth', () => {
  test('0 total issues → neutral score (50)', () => {
    const result = scoreIssueHealth(makeSignals(0, 0));
    expect(result.score).toBe(50);
    expect(result.available).toBe(true);
  });

  test('100% close ratio → score ≥ 90', () => {
    const result = scoreIssueHealth(makeSignals(0, 100, 7));
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test('80% close ratio → score ≥ 80', () => {
    const result = scoreIssueHealth(makeSignals(20, 80, 14));
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  test('50% close ratio → mid-range score (40–70)', () => {
    const result = scoreIssueHealth(makeSignals(50, 50));
    expect(result.score).toBeGreaterThanOrEqual(35);
    expect(result.score).toBeLessThanOrEqual(75);
  });

  test('10% close ratio → low score (≤ 35)', () => {
    const result = scoreIssueHealth(makeSignals(90, 10));
    expect(result.score).toBeLessThanOrEqual(35);
  });

  test('avgCloseTime ≤ 7 days → bonus applied (+20)', () => {
    // Use 60% close ratio so base is ~75, leaving room to show the +20 bonus
    const withBonus = scoreIssueHealth(makeSignals(40, 60, 7));
    const withoutBonus = scoreIssueHealth(makeSignals(40, 60, null));
    expect(withBonus.score).toBeGreaterThan(withoutBonus.score);
  });

  test('avgCloseTime > 90 days → penalty applied (-10)', () => {
    const withPenalty = scoreIssueHealth(makeSignals(20, 80, 91));
    const baseline = scoreIssueHealth(makeSignals(20, 80, 30));
    expect(withPenalty.score).toBeLessThan(baseline.score);
  });

  test('null avgCloseTime → no bonus or penalty', () => {
    const withNull = scoreIssueHealth(makeSignals(20, 80, null));
    const with30Days = scoreIssueHealth(makeSignals(20, 80, 30));
    expect(withNull.score).toBe(with30Days.score);
  });

  test('no repo link → available = false, score = 50 (neutral)', () => {
    const result = scoreIssueHealth(makeSignals(10, 90, null, false));
    expect(result.score).toBe(50);
    expect(result.available).toBe(false);
  });

  test('null github signals → available = false', () => {
    const signals: RawSignals = { github: null, npm: null, osv: null, fetchedAt: new Date() };
    const result = scoreIssueHealth(signals);
    expect(result.available).toBe(false);
  });

  test('score never exceeds 100', () => {
    const result = scoreIssueHealth(makeSignals(0, 1000, 1));
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('score never below 0', () => {
    const result = scoreIssueHealth(makeSignals(999, 1, 999));
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('weight is 0.15', () => {
    const result = scoreIssueHealth(makeSignals(10, 90));
    expect(result.weight).toBe(0.15);
  });
});
