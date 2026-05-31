// =============================================================================
// Test Fixtures — PRD Appendix B calibration packages
// These signal sets are hand-crafted to produce expected scores from PRD.
// =============================================================================

import type { RawSignals } from '@/lib/types';

// ─── Helper ───────────────────────────────────────────────────────────────────

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ─── react — expected score: 95+ ─────────────────────────────────────────────
// "Facebook-backed, massive contributor base, frequent releases"

export const mockReactSignals: RawSignals = {
  github: {
    lastCommitDate: daysAgo(3),       // 3 days ago — active
    commitFrequency90d: 12.5,          // very active — 12.5 commits/week
    contributorCount: 1_600,
    activeContributors: 320,
    busFactor: 18,                     // 18 people account for 80% of commits
    openIssues: 800,
    closedIssues: 12_000,
    avgIssueCloseTimeDays: 14,
    repoUrl: 'https://github.com/facebook/react',
    hasRepoLink: true,
    releaseCount12mo: 8,               // frequent releases
  },
  npm: {
    weeklyDownloads: 22_000_000,       // 22M weekly downloads
    weeklyDownloads30dAgo: 21_000_000,
    weeklyDownloads90dAgo: 20_000_000,
    downloadSlope90d: 0.1,             // gently growing
    latestVersion: '18.3.1',
    publishedAt: daysAgo(30),
    totalVersions: 120,
    directDepCount: 3,
    outdatedDepCount: 0,
    hasInstallScript: false,
  },
  osv: {
    activeCveCount: 0,
    criticalCveCount: 0,
    highCveCount: 0,
    oldestUnpatchedDays: null,
    cveIds: [],
  },
  fetchedAt: new Date(),
};

// ─── lodash — expected score: 70–80 ─────────────────────────────────────────
// "Maintained but in low-activity stable phase"

export const mockLodashSignals: RawSignals = {
  github: {
    lastCommitDate: daysAgo(120),     // ~4 months ago — slowing
    commitFrequency90d: 0.3,           // very low activity
    contributorCount: 380,
    activeContributors: 5,             // only a few still active
    busFactor: 2,
    openIssues: 120,
    closedIssues: 2_800,
    avgIssueCloseTimeDays: 45,
    repoUrl: 'https://github.com/lodash/lodash',
    hasRepoLink: true,
    releaseCount12mo: 1,               // 1 release in 12 months
  },
  npm: {
    weeklyDownloads: 48_000_000,       // massive adoption
    weeklyDownloads30dAgo: 48_500_000,
    weeklyDownloads90dAgo: 49_000_000,
    downloadSlope90d: -0.02,           // very slight decline — flat
    latestVersion: '4.17.21',
    publishedAt: daysAgo(700),
    totalVersions: 140,
    directDepCount: 0,
    outdatedDepCount: 0,
    hasInstallScript: false,
  },
  osv: {
    activeCveCount: 0,
    criticalCveCount: 0,
    highCveCount: 0,
    oldestUnpatchedDays: null,
    cveIds: [],
  },
  fetchedAt: new Date(),
};

// ─── moment — expected score: 35–45 ─────────────────────────────────────────
// "Officially in maintenance mode, not recommended for new projects"

export const mockMomentSignals: RawSignals = {
  github: {
    lastCommitDate: daysAgo(400),     // > 12 months — low activity
    commitFrequency90d: 0.1,
    contributorCount: 600,
    activeContributors: 2,
    busFactor: 2,
    openIssues: 400,
    closedIssues: 1_200,
    avgIssueCloseTimeDays: 120,
    repoUrl: 'https://github.com/moment/moment',
    hasRepoLink: true,
    releaseCount12mo: 0,
  },
  npm: {
    weeklyDownloads: 15_000_000,
    weeklyDownloads30dAgo: 15_500_000,
    weeklyDownloads90dAgo: 16_500_000,
    downloadSlope90d: -0.09,           // declining but still popular
    latestVersion: '2.29.4',
    publishedAt: daysAgo(600),
    totalVersions: 85,
    directDepCount: 4,
    outdatedDepCount: 3,               // most deps are outdated
    hasInstallScript: false,
  },
  osv: {
    activeCveCount: 0,
    criticalCveCount: 0,
    highCveCount: 0,
    oldestUnpatchedDays: null,
    cveIds: [],
  },
  fetchedAt: new Date(),
};

// ─── event-stream — expected score: <15 ─────────────────────────────────────────────
// "Previously hijacked, abandoned, historical supply chain incident"

export const mockEventStreamSignals: RawSignals = {
  github: {
    lastCommitDate: daysAgo(365 * 4), // ~4 years ago
    commitFrequency90d: 0,
    contributorCount: 12,
    activeContributors: 0,
    busFactor: 1,                      // single maintainer
    openIssues: 80,
    closedIssues: 20,
    avgIssueCloseTimeDays: 500,
    repoUrl: 'https://github.com/dominictarr/event-stream',
    hasRepoLink: true,
    releaseCount12mo: 0,
  },
  npm: {
    weeklyDownloads: 800_000,          // declining
    weeklyDownloads30dAgo: 1_000_000,
    weeklyDownloads90dAgo: 1_500_000,
    downloadSlope90d: -0.467,          // steep decline
    latestVersion: '3.3.4',
    publishedAt: daysAgo(365 * 5),
    totalVersions: 35,
    directDepCount: 5,
    outdatedDepCount: 5,               // all deps are outdated
    hasInstallScript: false,
  },
  osv: {
    activeCveCount: 3,
    criticalCveCount: 2,               // two critical CVEs
    highCveCount: 1,
    oldestUnpatchedDays: 1_500,        // unpatched for 4+ years
    cveIds: ['CVE-2018-21270', 'CVE-2019-10744'],
  },
  fetchedAt: new Date(),
};

// ─── left-pad — expected score: <10 ─────────────────────────────────────────────
// "Infamously removed from npm; maintained as stub only"

export const mockLeftPadSignals: RawSignals = {
  github: {
    lastCommitDate: daysAgo(365 * 5), // 5 years ago
    commitFrequency90d: 0,
    contributorCount: 3,
    activeContributors: 0,
    busFactor: 1,
    openIssues: 5,
    closedIssues: 30,
    avgIssueCloseTimeDays: 365,
    repoUrl: 'https://github.com/stevemao/left-pad',
    hasRepoLink: true,
    releaseCount12mo: 0,
  },
  npm: {
    weeklyDownloads: 800_000,        // declining
    weeklyDownloads30dAgo: 1_000_000,
    weeklyDownloads90dAgo: 1_500_000,
    downloadSlope90d: -0.467,        // steep decline
    latestVersion: '1.3.0',
    publishedAt: daysAgo(365 * 6),
    totalVersions: 10,
    directDepCount: 2,               // has deps that are all outdated
    outdatedDepCount: 2,
    hasInstallScript: false,
  },
  osv: {
    activeCveCount: 2,
    criticalCveCount: 1,             // historical security incident
    highCveCount: 0,
    oldestUnpatchedDays: 2_000,
    cveIds: ['CVE-2020-7598'],
  },
  fetchedAt: new Date(),
};

// ─── express — expected score: 65–80 ─────────────────────────────────────────
// "Widely used but slower maintenance pace in recent years"

export const mockExpressSignals: RawSignals = {
  github: {
    lastCommitDate: daysAgo(60),      // 2 months ago
    commitFrequency90d: 1.2,
    contributorCount: 290,
    activeContributors: 12,
    busFactor: 4,
    openIssues: 160,
    closedIssues: 5_200,
    avgIssueCloseTimeDays: 60,
    repoUrl: 'https://github.com/expressjs/express',
    hasRepoLink: true,
    releaseCount12mo: 2,
  },
  npm: {
    weeklyDownloads: 32_000_000,
    weeklyDownloads30dAgo: 32_000_000,
    weeklyDownloads90dAgo: 31_500_000,
    downloadSlope90d: 0.016,
    latestVersion: '4.18.2',
    publishedAt: daysAgo(90),
    totalVersions: 275,
    directDepCount: 30,
    outdatedDepCount: 8,
    hasInstallScript: false,
  },
  osv: {
    activeCveCount: 0,
    criticalCveCount: 0,
    highCveCount: 0,
    oldestUnpatchedDays: null,
    cveIds: [],
  },
  fetchedAt: new Date(),
};

// ─── Null signal variants (for testing null-handling) ─────────────────────────

export const mockNullGithubSignals: RawSignals = {
  ...mockExpressSignals,
  github: null,
};

export const mockNullNpmSignals: RawSignals = {
  ...mockExpressSignals,
  npm: null,
};

export const mockNullOsvSignals: RawSignals = {
  ...mockExpressSignals,
  osv: null,
};

export const mockAllNullSignals: RawSignals = {
  github: null,
  npm: null,
  osv: null,
  fetchedAt: new Date(),
};

// ─── Abandonment risk fixtures ─────────────────────────────────────────────────

/** All 4 PRD abandonment conditions met */
export const mockAbandonedSignals: RawSignals = {
  github: {
    lastCommitDate: daysAgo(400),     // condition 1: > 12 months
    commitFrequency90d: 0,
    contributorCount: 1,
    activeContributors: 0,
    busFactor: 1,                      // condition 2: bus factor = 1
    openIssues: 20,
    closedIssues: 5,
    avgIssueCloseTimeDays: null,
    repoUrl: 'https://github.com/example/abandoned-pkg',
    hasRepoLink: true,
    releaseCount12mo: 0,               // condition 4: 0 releases in 12mo
  },
  npm: {
    weeklyDownloads: 500,
    weeklyDownloads30dAgo: 600,
    weeklyDownloads90dAgo: 800,
    downloadSlope90d: -0.375,          // condition 3: negative slope
    latestVersion: '1.0.0',
    publishedAt: daysAgo(400),
    totalVersions: 3,
    directDepCount: 2,
    outdatedDepCount: 2,
    hasInstallScript: false,
  },
  osv: {
    activeCveCount: 0,
    criticalCveCount: 0,
    highCveCount: 0,
    oldestUnpatchedDays: null,
    cveIds: [],
  },
  fetchedAt: new Date(),
};
