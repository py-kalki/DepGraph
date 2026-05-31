// =============================================================================
// DepGraph — Private Repository Validation Service
// Uses the user's GitHub OAuth access token to verify private repo access.
// =============================================================================

export interface PrivateRepoValidationResult {
  accessible: boolean;
  isPrivate:  boolean;
  repoName:   string | null;
  fullName:   string | null;
}

/**
 * Validate whether a GitHub repository is accessible with the given token.
 * Uses GitHub REST API v3.
 * - Public repos: accessible without a token (read-only)
 * - Private repos: require a token with `repo` scope
 */
export async function validatePrivateRepo(
  githubRepo: string,           // "owner/repo"
  accessToken: string | null,
): Promise<PrivateRepoValidationResult> {
  const headers: Record<string, string> = {
    Accept:     'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'DepGraph/1.0',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${githubRepo}`,
    { headers },
  );

  if (response.status === 401 || response.status === 403) {
    // Token invalid or insufficient scope
    return { accessible: false, isPrivate: true, repoName: null, fullName: null };
  }

  if (response.status === 404) {
    // Repo doesn't exist or inaccessible
    return { accessible: false, isPrivate: false, repoName: null, fullName: null };
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as {
    name:     string;
    full_name: string;
    private:  boolean;
  };

  return {
    accessible: true,
    isPrivate:  data.private,
    repoName:   data.name,
    fullName:   data.full_name,
  };
}
