// =============================================================================
// DepGraph — Private Repo Validation Tests (Week 5)
// =============================================================================

import { validatePrivateRepo } from '@/lib/services/github/privateRepo';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

afterEach(() => mockFetch.mockReset());

describe('validatePrivateRepo', () => {
  it('returns accessible=false for 404', async () => {
    mockFetch.mockResolvedValueOnce({ status: 404, ok: false });
    const result = await validatePrivateRepo('owner/missing-repo', null);
    expect(result.accessible).toBe(false);
    expect(result.isPrivate).toBe(false);
  });

  it('returns accessible=false, isPrivate=true for 403', async () => {
    mockFetch.mockResolvedValueOnce({ status: 403, ok: false });
    const result = await validatePrivateRepo('owner/private-repo', 'bad_token');
    expect(result.accessible).toBe(false);
    expect(result.isPrivate).toBe(true);
  });

  it('returns correct data for public repo', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ name: 'my-repo', full_name: 'owner/my-repo', private: false }),
    });
    const result = await validatePrivateRepo('owner/my-repo', null);
    expect(result.accessible).toBe(true);
    expect(result.isPrivate).toBe(false);
    expect(result.fullName).toBe('owner/my-repo');
  });

  it('returns correct data for private repo with valid token', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ name: 'private-repo', full_name: 'owner/private-repo', private: true }),
    });
    const result = await validatePrivateRepo('owner/private-repo', 'valid_token');
    expect(result.accessible).toBe(true);
    expect(result.isPrivate).toBe(true);
  });

  it('throws on non-404/401/403 API error', async () => {
    mockFetch.mockResolvedValueOnce({ status: 502, ok: false, statusText: 'Bad Gateway' });
    await expect(validatePrivateRepo('owner/repo', null)).rejects.toThrow('GitHub API error');
  });
});
