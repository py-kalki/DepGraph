// =============================================================================
// DepGraph — Plan Guard Tests (Week 5)
// =============================================================================

import {
  assertPrivateRepoAccess,
  assertAlertAccess,
  PlanLimitError,
} from '@/lib/middleware/planGuard';

describe('assertPrivateRepoAccess', () => {
  it('throws PlanLimitError for free plan', () => {
    expect(() => assertPrivateRepoAccess('free')).toThrow(PlanLimitError);
    expect(() => assertPrivateRepoAccess('free')).toThrow('Private repository');
  });

  it('allows pro plan', () => {
    expect(() => assertPrivateRepoAccess('pro')).not.toThrow();
  });

  it('allows team plan', () => {
    expect(() => assertPrivateRepoAccess('team')).not.toThrow();
  });
});

describe('assertAlertAccess', () => {
  const realTimeAlerts = ['score_drop', 'new_cve', 'abandonment_risk'];

  realTimeAlerts.forEach((alertType) => {
    it(`throws for free plan + ${alertType}`, () => {
      expect(() => assertAlertAccess('free', alertType)).toThrow(PlanLimitError);
    });

    it(`allows pro plan + ${alertType}`, () => {
      expect(() => assertAlertAccess('pro', alertType)).not.toThrow();
    });

    it(`allows team plan + ${alertType}`, () => {
      expect(() => assertAlertAccess('team', alertType)).not.toThrow();
    });
  });

  it('allows free plan + digest', () => {
    expect(() => assertAlertAccess('free', 'digest')).not.toThrow();
  });
});
