// =============================================================================
// Tests: projects/repoValidation
// Tests the validateGithubRepo service.
// =============================================================================

import { validateGithubRepo, RepoValidationError } from '@/lib/services/github/validateRepo';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => jest.clearAllMocks());

describe('validateGithubRepo', () => {
  test('throws 400 for invalid format (no slash)', async () => {
    await expect(validateGithubRepo('notavalidrepo')).rejects.toThrow(RepoValidationError);
    await expect(validateGithubRepo('notavalidrepo')).rejects.toMatchObject({ statusCode: 400 });
  });

  test('throws 400 for empty string', async () => {
    await expect(validateGithubRepo('')).rejects.toThrow(RepoValidationError);
  });

  test('throws 422 for non-existent repo (404 from GitHub)', async () => {
    mockFetch.mockResolvedValueOnce({ status: 404, ok: false } as Response);
    await expect(validateGithubRepo('owner/nonexistent')).rejects.toMatchObject({ statusCode: 422 });
  });

  test('returns repo info for a valid public repo', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ name: 'repo', full_name: 'owner/repo', private: false, description: 'A repo' }),
    } as unknown as Response);

    const result = await validateGithubRepo('owner/repo', true);
    expect(result.fullName).toBe('owner/repo');
    expect(result.isPrivate).toBe(false);
  });

  test('throws 403 for private repo when requirePublic=true', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ name: 'private-repo', full_name: 'owner/private-repo', private: true, description: null }),
    } as unknown as Response);

    await expect(validateGithubRepo('owner/private-repo', true)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test('allows private repo when requirePublic=false (Pro user)', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ name: 'private-repo', full_name: 'owner/private-repo', private: true, description: null }),
    } as unknown as Response);

    const result = await validateGithubRepo('owner/private-repo', false);
    expect(result.isPrivate).toBe(true);
  });

  test('calls GitHub API with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ name: 'repo', full_name: 'owner/repo', private: false, description: null }),
    } as unknown as Response);

    await validateGithubRepo('owner/repo');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github.v3+json',
        }),
      }),
    );
  });
});
