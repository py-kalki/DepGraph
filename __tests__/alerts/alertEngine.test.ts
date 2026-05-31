// =============================================================================
// DepGraph — Alert Engine Tests (Week 5)
// =============================================================================

import { checkScoreDrop, checkNewCve, checkAbandonmentRisk } from '@/lib/services/alerts/engine';
import type { DbAlertSubscription } from '@/lib/types';

const baseAlert: DbAlertSubscription = {
  id:         'alert-1',
  user_id:    'user-1',
  project_id: 'proj-1',
  alert_type: 'score_drop',
  threshold:  10,
  channel:    'email',
  destination: 'user@example.com',
  is_active:  true,
  created_at: new Date().toISOString(),
};

const snapshot = (score: number) => ({
  projectId:   'proj-1',
  projectName: 'My Project',
  score,
  shareToken:  'abc123',
});

describe('checkScoreDrop', () => {
  it('returns null for non-score_drop alert', () => {
    const alert = { ...baseAlert, alert_type: 'new_cve' as const };
    expect(checkScoreDrop(alert, snapshot(60), snapshot(70))).toBeNull();
  });

  it('returns null when there is no previous score', () => {
    expect(checkScoreDrop(baseAlert, snapshot(50), null)).toBeNull();
  });

  it('returns null when drop is less than threshold', () => {
    // Drop of 5, threshold 10 — should not alert
    expect(checkScoreDrop(baseAlert, snapshot(65), snapshot(70))).toBeNull();
  });

  it('returns null when score improved', () => {
    expect(checkScoreDrop(baseAlert, snapshot(80), snapshot(70))).toBeNull();
  });

  it('returns email params when drop meets threshold', () => {
    const result = checkScoreDrop(baseAlert, snapshot(55), snapshot(70));
    expect(result).not.toBeNull();
    expect(result?.emailType).toBe('score_drop');
    expect(result?.to).toBe('user@example.com');
    expect(result?.subject).toContain('55');
  });

  it('uses default threshold of 10 when threshold is null', () => {
    const alert = { ...baseAlert, threshold: null };
    // Drop of 15 — should fire with default threshold
    const result = checkScoreDrop(alert, snapshot(55), snapshot(70));
    expect(result).not.toBeNull();
  });
});

describe('checkNewCve', () => {
  const cveAlert = { ...baseAlert, alert_type: 'new_cve' as const };

  it('returns empty array when no new CVEs', () => {
    const result = checkNewCve(cveAlert, snapshot(70), [
      { packageName: 'pkg', cveId: 'CVE-2024-001', severity: 'HIGH', description: 'desc', isNew: false },
    ]);
    expect(result).toHaveLength(0);
  });

  it('returns email per new CVE', () => {
    const result = checkNewCve(cveAlert, snapshot(70), [
      { packageName: 'pkg', cveId: 'CVE-2024-001', severity: 'CRITICAL', description: 'RCE', isNew: true },
      { packageName: 'pkg2', cveId: 'CVE-2024-002', severity: 'HIGH',     description: 'XSS', isNew: true },
    ]);
    expect(result).toHaveLength(2);
    // Subject contains package name and severity, not CVE ID (CVE ID is in the body)
    expect(result[0].subject).toContain('pkg');
    expect(result[0].subject).toContain('CRITICAL');
    expect(result[1].subject).toContain('pkg2');
    expect(result[1].subject).toContain('HIGH');
  });
});

describe('checkAbandonmentRisk', () => {
  const abandAlert = { ...baseAlert, alert_type: 'abandonment_risk' as const };

  it('returns empty array when no new abandonment flags', () => {
    const result = checkAbandonmentRisk(abandAlert, snapshot(30), [
      { packageName: 'pkg', score: 15, lastCommitDate: null, isNewFlag: false },
    ]);
    expect(result).toHaveLength(0);
  });

  it('returns email for newly flagged abandonment', () => {
    const result = checkAbandonmentRisk(abandAlert, snapshot(30), [
      { packageName: 'old-pkg', score: 8, lastCommitDate: '2022-01-01', isNewFlag: true },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].subject).toContain('old-pkg');
  });
});
