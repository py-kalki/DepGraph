// =============================================================================
// Tests: usage/freePlanLimits
// Tests plan guard assertions for free tier limits.
// =============================================================================

import {
  assertProjectLimit,
  assertHistoryAccess,
  assertProFeature,
  assertActiveSubscription,
  clampHistoryDays,
  PlanLimitError,
  SubscriptionError,
} from '@/lib/middleware/planGuard';

describe('assertProjectLimit — free plan', () => {
  test('does not throw for 0 projects', () => {
    expect(() => assertProjectLimit('free', 0)).not.toThrow();
  });

  test('does not throw for 2 projects', () => {
    expect(() => assertProjectLimit('free', 2)).not.toThrow();
  });

  test('throws PlanLimitError at 3 projects', () => {
    expect(() => assertProjectLimit('free', 3)).toThrow(PlanLimitError);
  });

  test('throws PlanLimitError at 4 projects', () => {
    expect(() => assertProjectLimit('free', 4)).toThrow(PlanLimitError);
  });

  test('error message mentions upgrade', () => {
    try {
      assertProjectLimit('free', 3);
    } catch (err) {
      expect((err as PlanLimitError).message).toContain('Upgrade');
    }
  });
});

describe('assertHistoryAccess — free plan', () => {
  test('allows 30 days', () => {
    expect(() => assertHistoryAccess('free', 30)).not.toThrow();
  });

  test('throws for 31 days', () => {
    expect(() => assertHistoryAccess('free', 31)).toThrow(PlanLimitError);
  });

  test('throws for 365 days', () => {
    expect(() => assertHistoryAccess('free', 365)).toThrow(PlanLimitError);
  });
});

describe('assertProFeature — free plan', () => {
  test('throws for onDemandRefresh', () => {
    expect(() => assertProFeature('free', 'onDemandRefresh')).toThrow(PlanLimitError);
  });

  test('throws for privateRepos', () => {
    expect(() => assertProFeature('free', 'privateRepos')).toThrow(PlanLimitError);
  });
});

describe('assertActiveSubscription', () => {
  test('does not throw for active status', () => {
    expect(() => assertActiveSubscription('active')).not.toThrow();
  });

  test('does not throw for inactive status', () => {
    expect(() => assertActiveSubscription('inactive')).not.toThrow();
  });

  test('throws SubscriptionError for past_due', () => {
    expect(() => assertActiveSubscription('past_due')).toThrow(SubscriptionError);
  });
});

describe('clampHistoryDays — free plan', () => {
  test('clamps 365 to 30 for free user', () => {
    expect(clampHistoryDays('free', 365)).toBe(30);
  });

  test('returns 30 when undefined', () => {
    expect(clampHistoryDays('free', undefined)).toBe(30);
  });

  test('returns 20 when 20 requested', () => {
    expect(clampHistoryDays('free', 20)).toBe(20);
  });
});
