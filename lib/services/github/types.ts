// =============================================================================
// DepGraph — GitHub Service Types
// Internal types for GitHub REST API responses.
// =============================================================================

/** Subset of GET /repos/{owner}/{repo} response */
export interface GHRepo {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  pushed_at: string; // ISO date string of last push
  open_issues_count: number;
  stargazers_count: number;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
}

/** Item from GET /repos/{owner}/{repo}/contributors */
export interface GHContributor {
  login: string;
  id: number;
  contributions: number; // total commit count
}

/** Item from GET /repos/{owner}/{repo}/commits */
export interface GHCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string; // ISO date string
    };
  };
  author: {
    login: string;
  } | null;
}

/** Item from GET /repos/{owner}/{repo}/releases */
export interface GHRelease {
  id: number;
  tag_name: string;
  published_at: string; // ISO date string
  prerelease: boolean;
  draft: boolean;
}

/** Item from GET /repos/{owner}/{repo}/issues */
export interface GHIssue {
  id: number;
  number: number;
  state: 'open' | 'closed';
  created_at: string;
  closed_at: string | null;
  pull_request?: unknown; // present if this is a PR, not an issue
}

/** Rate limit info from response headers */
export interface GHRateLimit {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

/** Parsed GitHub repo coordinates from a package.json repository URL */
export interface GHRepoCoords {
  owner: string;
  repo: string;
}
