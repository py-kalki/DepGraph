// =============================================================================
// DepGraph — Cache Key Builders
// Central registry of all Redis key patterns.
// TTL constants are defined in redis.ts — not here.
// =============================================================================

export const CacheKeys = {
  // Per-package composite score (TTL: 24hr per PRD)
  packageScore: (name: string, ecosystem = 'npm') =>
    `pkg:score:${ecosystem}:${name}`,

  // GitHub raw signals (TTL: 6hr per PRD)
  githubSignals: (owner: string, repo: string) =>
    `github:repo:${owner}:${repo}`,

  // npm metadata + download stats (TTL: 12hr per PRD)
  npmSignals: (name: string) => `npm:meta:${name}`,

  // OSV vulnerability data (TTL: 24hr per PRD)
  osvSignals: (name: string, ecosystem = 'npm') =>
    `osv:${ecosystem}:${name}`,

  // Full scan report keyed by lockfile hash (TTL: 1hr per PRD)
  scanReport: (lockfileHash: string) => `scan:report:${lockfileHash}`,

  // Public share report (TTL: 1hr per PRD)
  shareReport: (shareToken: string) => `share:${shareToken}`,
} as const;
