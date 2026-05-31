// =============================================================================
// DepGraph — GitHub Repository Validator
// Validates that a github_repo string (owner/repo) exists via the GitHub API.
// PRD §F-04: "Users can add a project by pasting a GitHub repo URL"
// Free tier restriction: public repos only.
// =============================================================================

import { getEnv } from '@/lib/env';

export class RepoValidationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 422,
  ) {
    super(message);
    this.name = 'RepoValidationError';
  }
}

const REPO_FORMAT_RE = /^[\w.-]+\/[\w.-]+$/;

/**
 * Validates the repo string format and checks GitHub API to confirm it exists.
 * @param githubRepo - "owner/repo" string
 * @param requirePublic - true for free tier (rejects private repos)
 * @throws {RepoValidationError} on invalid format, non-existent repo, or private repo (free tier)
 */
export async function validateGithubRepo(
  githubRepo: string,
  requirePublic: boolean = true,
): Promise<{ name: string; fullName: string; isPrivate: boolean; description: string | null }> {
  // 1. Format check
  if (!REPO_FORMAT_RE.test(githubRepo)) {
    throw new RepoValidationError(
      `Invalid repository format. Expected "owner/repo", got "${githubRepo}"`,
      400,
    );
  }

  const env = getEnv();

  // 2. GitHub API existence check
  const response = await fetch(`https://api.github.com/repos/${githubRepo}`, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    // 5 second timeout
    signal: AbortSignal.timeout(5000),
  });

  if (response.status === 404) {
    throw new RepoValidationError(`Repository "${githubRepo}" not found on GitHub`, 422);
  }

  if (response.status === 403 || response.status === 401) {
    throw new RepoValidationError('GitHub API rate limit or authentication error', 503);
  }

  if (!response.ok) {
    throw new RepoValidationError(`GitHub API error: ${response.status}`, 503);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repo = await response.json() as any;

  // 3. Private repo check for free tier
  if (requirePublic && repo.private === true) {
    throw new RepoValidationError(
      'Private repositories require a Pro plan. Upgrade to add private repos.',
      403,
    );
  }

  return {
    name:        repo.name as string,
    fullName:    repo.full_name as string,
    isPrivate:   repo.private as boolean,
    description: (repo.description as string | null) ?? null,
  };
}
