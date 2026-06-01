// =============================================================================
// DepGraph — Tests: Analytics Events (Week 8)
// =============================================================================

import { trackSignup, trackFirstScan, trackProjectCreated, EVENTS } from '@/lib/analytics/events';
import { trackEvent, identifyUser } from '@/lib/analytics/posthog';

jest.mock('@/lib/analytics/posthog', () => ({
  trackEvent: jest.fn(),
  identifyUser: jest.fn(),
}));

describe('Analytics Events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trackSignup fires trackEvent and identifyUser', () => {
    trackSignup('u123', { plan: 'free', githubLogin: 'testuser' });
    expect(trackEvent).toHaveBeenCalledWith('u123', EVENTS.USER_SIGNUP, { plan: 'free', githubLogin: 'testuser' });
    expect(identifyUser).toHaveBeenCalledWith('u123', { plan: 'free', github_login: 'testuser' });
  });

  it('trackFirstScan fires trackEvent', () => {
    trackFirstScan('u123', { packageCount: 10, overallScore: 85 });
    expect(trackEvent).toHaveBeenCalledWith('u123', EVENTS.FIRST_SCAN, { packageCount: 10, overallScore: 85 });
  });

  it('trackProjectCreated fires trackEvent', () => {
    trackProjectCreated('u123', { githubRepo: 'owner/repo', plan: 'pro' });
    expect(trackEvent).toHaveBeenCalledWith('u123', EVENTS.PROJECT_CREATED, { githubRepo: 'owner/repo', plan: 'pro' });
  });
});
