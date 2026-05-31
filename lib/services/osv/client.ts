// =============================================================================
// DepGraph — OSV.dev HTTP Client
// POST-based API. Free, no auth required.
// =============================================================================

import type { OsvQueryRequest, OsvQueryResponse } from './types';

const OSV_API_BASE = 'https://api.osv.dev/v1';
const REQUEST_TIMEOUT_MS = 5_000;

/**
 * Query OSV.dev for vulnerabilities affecting a package.
 * Returns null on network error or timeout.
 * Returns empty response (no vulns) when the package is clean.
 */
export async function osvQuery(
  request: OsvQueryRequest
): Promise<OsvQueryResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${OSV_API_BASE}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if ((err as Error).name === 'AbortError') {
      console.error(`[OSV] Request timed out for package: ${request.package.name}`);
    } else {
      console.error(`[OSV] Network error for ${request.package.name}:`, err);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 400) {
    // Malformed package name — treat as no vulnerabilities
    console.warn(`[OSV] 400 Bad Request for "${request.package.name}" — treating as clean`);
    return { vulns: [] };
  }

  if (!response.ok) {
    console.error(`[OSV] Unexpected status ${response.status} for "${request.package.name}"`);
    return null;
  }

  try {
    return (await response.json()) as OsvQueryResponse;
  } catch {
    console.error(`[OSV] Failed to parse JSON for "${request.package.name}"`);
    return null;
  }
}
