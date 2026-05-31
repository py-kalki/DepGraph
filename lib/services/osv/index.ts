// =============================================================================
// DepGraph — OSV.dev Service
// Fetches and normalises vulnerability data for npm packages.
// Cache TTL: 24hr per PRD caching strategy (§11).
// =============================================================================

import { osvQuery } from './client';
import { cacheAside, TTL } from '@/lib/cache/redis';
import { CacheKeys } from '@/lib/cache/keys';
import type { OsvSignals } from '@/lib/types';
import type { OsvVulnerability } from './types';

// ─── CVSS Score extraction ────────────────────────────────────────────────────

/**
 * Extract the CVSS numeric score from an OSV severity entry.
 * OSV stores the CVSS vector string (e.g. "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H")
 * We extract the base score from the CVSS3 environmental score if available.
 * Fallback: check database_specific.severity string ("CRITICAL", "HIGH", etc.)
 */
function extractCvssScore(vuln: OsvVulnerability): number {
  // Check CVSS_V3 severity entries first
  const cvssV3 = vuln.severity?.find((s) => s.type === 'CVSS_V3');
  if (cvssV3?.score) {
    // The score field in OSV is the full CVSS vector; we need to compute or look up
    // the base score. For now, we parse from database_specific or use a text mapping.
    // TODO Week 7: integrate cvss npm package for proper computation
  }

  // Fallback: use database_specific severity string
  const dbSpecific = vuln.database_specific as Record<string, unknown> | undefined;
  const severityStr = dbSpecific?.severity as string | undefined;

  if (severityStr) {
    const upper = severityStr.toUpperCase();
    if (upper === 'CRITICAL') return 9.5;
    if (upper === 'HIGH') return 8.0;
    if (upper === 'MEDIUM') return 5.5;
    if (upper === 'LOW') return 2.0;
  }

  // No severity data — default to medium
  return 5.0;
}

// ─── CVE ID extraction ────────────────────────────────────────────────────────

function extractCveIds(vuln: OsvVulnerability): string[] {
  const cvePattern = /^CVE-\d{4}-\d+$/;
  const aliases = vuln.aliases ?? [];
  const cveIds = aliases.filter((a) => cvePattern.test(a));

  // Also check if the main ID is a CVE
  if (cvePattern.test(vuln.id)) {
    cveIds.push(vuln.id);
  }

  return Array.from(new Set(cveIds));
}

// ─── Normalisation ────────────────────────────────────────────────────────────

/**
 * Normalise a list of OSV vulnerabilities into our OsvSignals shape.
 */
function normaliseVulnerabilities(vulns: OsvVulnerability[]): OsvSignals {
  if (vulns.length === 0) {
    return {
      activeCveCount: 0,
      criticalCveCount: 0,
      highCveCount: 0,
      oldestUnpatchedDays: null,
      cveIds: [],
    };
  }

  let criticalCount = 0;
  let highCount = 0;
  let oldestDate: Date | null = null;
  const allCveIds: string[] = [];

  for (const vuln of vulns) {
    const cvssScore = extractCvssScore(vuln);

    if (cvssScore >= 9.0) criticalCount++;
    else if (cvssScore >= 7.0) highCount++;

    // Track oldest published vulnerability
    const publishedDate = new Date(vuln.published);
    if (!oldestDate || publishedDate < oldestDate) {
      oldestDate = publishedDate;
    }

    allCveIds.push(...extractCveIds(vuln));
  }

  const oldestUnpatchedDays = oldestDate
    ? Math.floor((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    activeCveCount: vulns.length,
    criticalCveCount: criticalCount,
    highCveCount: highCount,
    oldestUnpatchedDays,
    cveIds: Array.from(new Set(allCveIds)),
  };
}

// ─── Main service function ────────────────────────────────────────────────────

/**
 * Fetch vulnerability signals for an npm package from OSV.dev.
 * Uses Redis cache-aside (TTL: 24hr per PRD).
 *
 * Returns:
 * - OsvSignals with all zeros if the package is clean
 * - null if the OSV API is unreachable (caller handles gracefully)
 */
export async function getOsvSignals(
  name: string,
  version?: string
): Promise<OsvSignals | null> {
  const cacheKey = CacheKeys.osvSignals(name);

  return cacheAside<OsvSignals>(cacheKey, TTL.OSV_SIGNALS, () =>
    fetchOsvSignals(name, version)
  );
}

async function fetchOsvSignals(
  name: string,
  version?: string
): Promise<OsvSignals | null> {
  const request = {
    package: { name, ecosystem: 'npm' as const },
    ...(version ? { version } : {}),
  };

  const response = await osvQuery(request);

  // null = API unreachable — signal to caller to exclude this dimension
  if (response === null) return null;

  // Empty response or no vulns array = clean package
  return normaliseVulnerabilities(response.vulns ?? []);
}
