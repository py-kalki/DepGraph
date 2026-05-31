// =============================================================================
// DepGraph — GitHub Service
// Public interface for fetching GitHub signals for npm packages.
// All results cached in Redis per PRD caching strategy (TTL: 6hr).
// =============================================================================

import { githubGet } from './client';
import { cacheAside, TTL } from '@/lib/cache/redis';
import { CacheKeys } from '@/lib/cache/keys';
import type { GitHubSignals } from '@/lib/types';
import type {
  GHRepo,
  GHContributor,
  GHCommit,
  GHRelease,
  GHIssue,
  GHRepoCoords,
} from './types';

// ─── Repo URL parsing ─────────────────────────────────────────────────────────

/**
 * Parse a GitHub owner/repo from various repository URL formats found in package.json.
 * Handles: https://github.com/owner/repo, git+https://..., github:owner/repo, owner/repo
 */
export function parseGitHubRepo(repoUrl: string | undefined): GHRepoCoords | null {
  if (!repoUrl) return null;

  // Normalize to string (package.json `repository` can be an object or string)
  const url = typeof repoUrl === 'string' ? repoUrl : '';

  // Pattern: https://github.com/owner/repo(.git)
  const httpsMatch = url.match(/github\.com[/:]([^/]+)\/([^/.#?]+)/);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2].replace(/\.git$/, '') };
  }

  // Pattern: github:owner/repo
  const ghShorthand = url.match(/^github:([^/]+)\/([^/.#?]+)/);
  if (ghShorthand) {
    return { owner: ghShorthand[1], repo: ghShorthand[2] };
  }

  // Pattern: owner/repo (bare shorthand)
  const bareMatch = url.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (bareMatch) {
    return { owner: bareMatch[1], repo: bareMatch[2] };
  }

  return null;
}

// ─── Bus factor calculation ───────────────────────────────────────────────────

/**
 * Compute bus factor: minimum number of contributors accounting for ≥80% of commits.
 * PRD Appendix A definition.
 */
function computeBusFactor(contributors: GHContributor[]): number {
  if (contributors.length === 0) return 1;

  const total = contributors.reduce((sum, c) => sum + c.contributions, 0);
  if (total === 0) return 1;

  // Sort by contribution count descending
  const sorted = [...contributors].sort((a, b) => b.contributions - a.contributions);

  let accumulated = 0;
  let busFactor = 0;

  for (const contributor of sorted) {
    accumulated += contributor.contributions;
    busFactor++;
    if (accumulated / total >= 0.8) break;
  }

  return busFactor;
}

/**
 * Compute average days to close issues from a sample of closed issues.
 */
function computeAvgIssueCloseTime(issues: GHIssue[]): number | null {
  const closed = issues.filter(
    (i) => i.state === 'closed' && i.closed_at && !i.pull_request
  );

  if (closed.length === 0) return null;

  const totalDays = closed.reduce((sum, issue) => {
    const created = new Date(issue.created_at).getTime();
    const closedAt = new Date(issue.closed_at!).getTime();
    return sum + (closedAt - created) / (1000 * 60 * 60 * 24);
  }, 0);

  return Math.round(totalDays / closed.length);
}

/**
 * Count commits per week over the last 90 days.
 */
function computeCommitFrequency(commits: GHCommit[]): number {
  if (commits.length === 0) return 0;
  // Commits fetched with `since` 90 days ago — divide by 13 weeks
  return Math.round((commits.length / 13) * 10) / 10;
}

// ─── Main service function ────────────────────────────────────────────────────

/**
 * Fetch all GitHub signals for a package, given its repo URL.
 * Uses Redis cache-aside (TTL: 6hr per PRD).
 *
 * Returns null if:
 * - No GitHub repo URL provided
 * - Repo is private or deleted (GitHub returns 404/403)
 * - Network failure
 */
export async function getGitHubSignals(
  repoUrl: string | undefined
): Promise<GitHubSignals | null> {
  const coords = parseGitHubRepo(repoUrl);

  if (!coords) {
    // Package has no parseable GitHub URL — return a zero-scored placeholder
    return {
      lastCommitDate: null,
      commitFrequency90d: 0,
      contributorCount: 0,
      activeContributors: 0,
      busFactor: 1,
      openIssues: 0,
      closedIssues: 0,
      avgIssueCloseTimeDays: null,
      repoUrl: repoUrl ?? null,
      hasRepoLink: false,
      releaseCount12mo: 0,
    };
  }

  const cacheKey = CacheKeys.githubSignals(coords.owner, coords.repo);

  return cacheAside<GitHubSignals>(cacheKey, TTL.GITHUB_SIGNALS, () =>
    fetchGitHubSignals(coords)
  );
}

async function fetchGitHubSignals(
  coords: GHRepoCoords
): Promise<GitHubSignals | null> {
  const { owner, repo } = coords;
  const path = `/repos/${owner}/${repo}`;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // Fetch all data in parallel to minimise latency
  const [repoData, contributors, commits90d, releases12mo, issuesSample] =
    await Promise.all([
      githubGet<GHRepo>(path),
      githubGet<GHContributor[]>(`${path}/contributors`, { per_page: 100, anon: 1 }),
      githubGet<GHCommit[]>(`${path}/commits`, {
        since: ninetyDaysAgo.toISOString(),
        per_page: 100,
      }),
      githubGet<GHRelease[]>(`${path}/releases`, {
        per_page: 100,
      }),
      githubGet<GHIssue[]>(`${path}/issues`, {
        state: 'closed',
        per_page: 100,
        since: threeMonthsAgo.toISOString(),
      }),
    ]);

  // If repo metadata fails, we can't compute signals
  if (!repoData) return null;

  const allContributors = contributors ?? [];
  const allCommits = commits90d ?? [];
  const allReleases = releases12mo ?? [];
  const allIssues = issuesSample ?? [];

  // Last commit date from repo's pushed_at
  const lastCommitDate = repoData.pushed_at ? new Date(repoData.pushed_at) : null;

  // Active contributors in last 12 months — GitHub contributors API returns all-time
  // We approximate by checking if their contribution count is recent
  // For precision, we'd need the /stats/contributors endpoint (Week 7 optimization)
  const activeContributors = allContributors.length; // conservative: all returned contributors

  // Count releases published in the last 12 months (exclude pre-releases and drafts)
  const releaseCount12mo = allReleases.filter((r) => {
    if (r.draft || r.prerelease) return false;
    return new Date(r.published_at) >= twelveMonthsAgo;
  }).length;

  // Count open vs closed issues (excluding PRs from the issue count)
  const closedIssues = allIssues.filter(
    (i) => i.state === 'closed' && !i.pull_request
  ).length;

  return {
    lastCommitDate,
    commitFrequency90d: computeCommitFrequency(allCommits),
    contributorCount: allContributors.length,
    activeContributors,
    busFactor: computeBusFactor(allContributors),
    openIssues: repoData.open_issues_count,
    closedIssues,
    avgIssueCloseTimeDays: computeAvgIssueCloseTime(allIssues),
    repoUrl: repoData.html_url,
    hasRepoLink: true,
    releaseCount12mo,
  };
}
