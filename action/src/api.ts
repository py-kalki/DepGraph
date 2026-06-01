// =============================================================================
// depgraph/action — api.ts
// DepGraph API client with retry logic.
// =============================================================================

import type {
  CompareResult,
  DecisionResult,
  ScanResult,
  FailOn,
  DepDelta,
  ScoredDep,
  DepEntry,
} from './types';

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delayMs = 2000,
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.status === 429) {
      // Rate limited — back off
      await new Promise((r) => setTimeout(r, delayMs * attempt));
      continue;
    }
    return res;
  }
  throw new Error(`API request failed after ${retries} retries (rate limited)`);
}

export class DepGraphApiClient {
  private headers: Record<string, string>;

  constructor(private apiUrl: string, apiKey: string) {
    this.headers = {
      'Content-Type':  'application/json',
      'X-API-Key':     apiKey,
    };
  }

  async scan(packages: string[]): Promise<ScanResult> {
    const res = await fetchWithRetry(`${this.apiUrl}/api/action/scan`, {
      method:  'POST',
      headers: this.headers,
      body:    JSON.stringify({ packages }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
      throw new Error(`/api/action/scan failed (${res.status}): ${err.error}`);
    }
    return res.json() as Promise<ScanResult>;
  }

  async compare(params: {
    base:        string;
    head:        string;
    githubRepo:  string;
    prNumber:    number;
    baseSha:     string;
    headSha:     string;
  }): Promise<CompareResult> {
    const res = await fetchWithRetry(`${this.apiUrl}/api/action/compare`, {
      method:  'POST',
      headers: this.headers,
      body:    JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
      throw new Error(`/api/action/compare failed (${res.status}): ${err.error}`);
    }
    return res.json() as Promise<CompareResult>;
  }

  async summary(params: {
    baseScore:     number | null;
    headScore:     number;
    scoreDelta:    number;
    added:         ScoredDep[];
    removed:       DepEntry[];
    updated:       DepDelta['updated'];
    criticalCount: number;
    highCount:     number;
    gateResult:    string;
    gateReason:    string;
    reportUrl:     string;
    githubRepo:    string;
    prNumber:      number;
  }): Promise<{ markdown: string; body_hash: string }> {
    const res = await fetchWithRetry(`${this.apiUrl}/api/action/summary`, {
      method:  'POST',
      headers: this.headers,
      body:    JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
      throw new Error(`/api/action/summary failed (${res.status}): ${err.error}`);
    }
    return res.json() as Promise<{ markdown: string; body_hash: string }>;
  }

  async decision(params: {
    criticalCount: number;
    highCount:     number;
    mediumCount:   number;
    scoreDelta:    number;
    failOn:        FailOn;
  }): Promise<DecisionResult> {
    const res = await fetchWithRetry(`${this.apiUrl}/api/action/decision`, {
      method:  'POST',
      headers: this.headers,
      body:    JSON.stringify({
        critical_count: params.criticalCount,
        high_count:     params.highCount,
        medium_count:   params.mediumCount,
        score_delta:    params.scoreDelta,
        fail_on:        params.failOn,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
      throw new Error(`/api/action/decision failed (${res.status}): ${err.error}`);
    }
    return res.json() as Promise<DecisionResult>;
  }
}
