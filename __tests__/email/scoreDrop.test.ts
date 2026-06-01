// =============================================================================
// DepGraph — Email Template Tests (Week 5)
// =============================================================================

import { scoreDropSubject, scoreDropHtml, scoreDropText } from '@/lib/services/resend/templates/scoreDrop';
import { newCveSubject, newCveHtml } from '@/lib/services/resend/templates/newCve';
import { abandonmentSubject } from '@/lib/services/resend/templates/abandonmentRisk';
import { weeklyDigestSubject, weeklyDigestText } from '@/lib/services/resend/templates/weeklyDigest';

const scoreDropPayload = {
  projectName:   'My App',
  projectId:     'proj-1',
  previousScore: 72,
  currentScore:  51,
  delta:         -21,
  shareUrl:      'https://depgraph.vedanshh.dev/report/abc',
};

describe('scoreDrop template', () => {
  it('subject includes the current score', () => {
    expect(scoreDropSubject(scoreDropPayload)).toContain('51');
  });

  it('subject includes the project name', () => {
    expect(scoreDropSubject(scoreDropPayload)).toContain('My App');
  });

  it('HTML includes previous score', () => {
    const html = scoreDropHtml(scoreDropPayload);
    expect(html).toContain('72');
  });

  it('HTML includes share URL', () => {
    const html = scoreDropHtml(scoreDropPayload);
    expect(html).toContain('https://depgraph.vedanshh.dev/report/abc');
  });

  it('text includes project name and delta', () => {
    const text = scoreDropText(scoreDropPayload);
    expect(text).toContain('My App');
    expect(text).toContain('72');
    expect(text).toContain('51');
  });
});

describe('newCve template', () => {
  const payload = {
    projectName: 'API Server',
    packageName: 'node-forge',
    cveId:       'CVE-2023-99999',
    severity:    'CRITICAL' as const,
    description: 'Remote code execution',
    shareUrl:    'https://depgraph.vedanshh.dev/report/xyz',
  };

  it('subject includes severity and package name', () => {
    const subject = newCveSubject(payload);
    expect(subject).toContain('CRITICAL');
    expect(subject).toContain('node-forge');
  });

  it('HTML includes CVE ID', () => {
    expect(newCveHtml(payload)).toContain('CVE-2023-99999');
  });
});

describe('abandonment template', () => {
  it('subject includes package name', () => {
    const subject = abandonmentSubject({
      projectName: 'My App', packageName: 'event-stream',
      score: 12, lastCommitDate: '2021-06-01', shareUrl: 'https://example.com',
    });
    expect(subject).toContain('event-stream');
  });
});

describe('weeklyDigest template', () => {
  const payload = {
    userName: 'arjun',
    weekStart: 'May 26, 2026',
    weekEnd:   'Jun 2, 2026',
    projects:  [
      { name: 'App', score: 78, delta: -4, criticalCount: 1, highCount: 2, shareUrl: 'https://x.com' },
    ],
  };

  it('subject includes weekStart', () => {
    expect(weeklyDigestSubject(payload)).toContain('May 26, 2026');
  });

  it('text includes user name and project', () => {
    const text = weeklyDigestText(payload);
    expect(text).toContain('arjun');
    expect(text).toContain('App');
    expect(text).toContain('78');
  });
});
