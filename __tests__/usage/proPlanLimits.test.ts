// =============================================================================
// Tests: usage/proPlanLimits
// Tests that Pro/Team plans bypass all free tier restrictions.
// =============================================================================

import {
  assertProjectLimit,
  assertHistoryAccess,
  assertProFeature,
  clampHistoryDays,
} from '@/lib/middleware/planGuard';

describe('assertProjectLimit — pro plan', () => {
  test('does not throw for 100 projects', () => {
    expect(() => assertProjectLimit('pro', 100)).not.toThrow();
  });

  test('does not throw for 1000 projects', () => {
    expect(() => assertProjectLimit('pro', 1000)).not.toThrow();
  });
});

describe('assertProjectLimit — team plan', () => {
  test('does not throw for 100 projects', () => {
    expect(() => assertProjectLimit('team', 100)).not.toThrow();
  });
});

describe('assertHistoryAccess — pro plan', () => {
  test('allows 365 days', () => {
    expect(() => assertHistoryAccess('pro', 365)).not.toThrow();
  });

  test('allows 30 days', () => {
    expect(() => assertHistoryAccess('pro', 30)).not.toThrow();
  });
});

describe('assertProFeature — pro plan', () => {
  test('does not throw for onDemandRefresh', () => {
    expect(() => assertProFeature('pro', 'onDemandRefresh')).not.toThrow();
  });

  test('does not throw for privateRepos', () => {
    expect(() => assertProFeature('pro', 'privateRepos')).not.toThrow();
  });
});

describe('assertProFeature — team plan', () => {
  test('does not throw for onDemandRefresh', () => {
    expect(() => assertProFeature('team', 'onDemandRefresh')).not.toThrow();
  });
});

describe('clampHistoryDays — pro plan', () => {
  test('allows 365 for pro user', () => {
    expect(clampHistoryDays('pro', 365)).toBe(365);
  });

  test('returns 30 when 30 requested', () => {
    expect(clampHistoryDays('pro', 30)).toBe(30);
  });

  test('defaults to 30 when undefined', () => {
    expect(clampHistoryDays('pro', undefined)).toBe(30);
  });
});
