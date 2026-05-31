// =============================================================================
// DepGraph — OSV.dev Service Types
// Internal types for the OSV.dev vulnerability API responses.
// API docs: https://google.github.io/osv.dev/post-v1-query/
// =============================================================================

/** Request body for POST https://api.osv.dev/v1/query */
export interface OsvQueryRequest {
  package: {
    name: string;
    ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go';
  };
  version?: string;
}

/** Top-level response from POST /v1/query */
export interface OsvQueryResponse {
  vulns?: OsvVulnerability[];
}

/** A single vulnerability record from OSV */
export interface OsvVulnerability {
  id: string; // e.g. "GHSA-...", "CVE-..."
  summary?: string;
  details?: string;
  aliases?: string[]; // includes "CVE-XXXX-XXXXX" entries
  published: string; // ISO date
  modified: string; // ISO date
  severity?: OsvSeverity[];
  affected?: OsvAffected[];
  database_specific?: Record<string, unknown>;
}

export interface OsvSeverity {
  type: 'CVSS_V2' | 'CVSS_V3' | string;
  score: string; // CVSS vector string, e.g. "CVSS:3.1/AV:N/AC:L/..."
}

export interface OsvAffected {
  package: {
    name: string;
    ecosystem: string;
  };
  ranges?: OsvRange[];
  versions?: string[];
}

export interface OsvRange {
  type: 'GIT' | 'SEMVER' | 'ECOSYSTEM';
  events: Array<{
    introduced?: string;
    fixed?: string;
    last_affected?: string;
  }>;
}
