// =============================================================================
// DepGraph — npm Registry HTTP Client
// No authentication required. Implements timeout and basic retry.
// =============================================================================

const NPM_REGISTRY_BASE = 'https://registry.npmjs.org';
const NPM_API_BASE = 'https://api.npmjs.org';
const REQUEST_TIMEOUT_MS = 6_000;
const RETRY_DELAY_MS = 3_000;

/**
 * Fetch from the npm registry (registry.npmjs.org).
 * Returns null on any error.
 */
export async function npmRegistryGet<T>(path: string): Promise<T | null> {
  return fetchWithRetry<T>(`${NPM_REGISTRY_BASE}${path}`);
}

/**
 * Fetch from the npm API (api.npmjs.org — for download stats).
 * Returns null on any error.
 */
export async function npmApiGet<T>(path: string): Promise<T | null> {
  return fetchWithRetry<T>(`${NPM_API_BASE}${path}`);
}

async function fetchWithRetry<T>(
  url: string,
  isRetry = false
): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if ((err as Error).name === 'AbortError') {
      console.error(`[npm] Request timed out: ${url}`);
    } else {
      console.error(`[npm] Network error for ${url}:`, err);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    console.warn(`[npm] Package not found: ${url}`);
    return null;
  }

  if (response.status === 429 && !isRetry) {
    console.warn(`[npm] Rate limited. Retrying after ${RETRY_DELAY_MS}ms`);
    await sleep(RETRY_DELAY_MS);
    return fetchWithRetry<T>(url, true);
  }

  if (!response.ok) {
    console.error(`[npm] Unexpected status ${response.status} for ${url}`);
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    console.error(`[npm] Failed to parse JSON from ${url}`);
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
