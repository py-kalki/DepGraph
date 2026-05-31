// =============================================================================
// DepGraph — npm Registry Service
// Fetches package metadata and download statistics for health scoring.
// Cache TTL: 12hr per PRD caching strategy (§11).
// =============================================================================

import { npmRegistryGet, npmApiGet } from './client';
import { cacheAside, TTL } from '@/lib/cache/redis';
import { CacheKeys } from '@/lib/cache/keys';
import type { NpmSignals } from '@/lib/types';
import type { NpmPackageDoc, NpmDownloadPoint, NpmVersionManifest } from './types';
import { satisfies, valid, validRange } from 'semver';

/** Maximum number of direct deps to check for outdated status */
const MAX_DEPS_TO_CHECK = 20;

// ─── Download slope computation ───────────────────────────────────────────────

/**
 * Compute normalised 90-day download slope.
 * Result range: approximately -1.0 (rapid decline) to +1.0 (rapid growth).
 */
function computeDownloadSlope(
  current: number,
  ninetyDaysAgo: number
): number {
  if (ninetyDaysAgo === 0 && current === 0) return 0;
  if (ninetyDaysAgo === 0) return 1; // went from 0 to something — growing

  const rawSlope = (current - ninetyDaysAgo) / ninetyDaysAgo; // percentage change
  // Clamp to [-1, 1]
  return Math.max(-1, Math.min(1, rawSlope));
}

// ─── Date range helpers ───────────────────────────────────────────────────────

function formatDateRange(daysAgo: number): string {
  const end = new Date();
  end.setDate(end.getDate() - daysAgo);
  const start = new Date(end);
  start.setDate(start.getDate() - 7); // one week window

  return `${formatDate(start)}:${formatDate(end)}`;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// ─── Outdated deps detection ──────────────────────────────────────────────────

/**
 * Check how many of a package's direct dependencies are outdated.
 * Caps at MAX_DEPS_TO_CHECK to control API call volume.
 */
async function checkOutdatedDeps(
  manifest: NpmVersionManifest
): Promise<{ directDepCount: number; outdatedDepCount: number }> {
  const deps = manifest.dependencies ?? {};
  const depEntries = Object.entries(deps).slice(0, MAX_DEPS_TO_CHECK);

  if (depEntries.length === 0) {
    return { directDepCount: 0, outdatedDepCount: 0 };
  }

  const results = await Promise.allSettled(
    depEntries.map(async ([name, range]) => {
      const latestDoc = await npmRegistryGet<{ 'dist-tags': { latest: string } }>(
        `/${name}/latest`
      );
      if (!latestDoc) return { name, outdated: false };

      const latestVersion = latestDoc['dist-tags']?.latest ?? null;
      if (!latestVersion || !validRange(range) || !valid(latestVersion)) {
        return { name, outdated: false };
      }

      // If latest version doesn't satisfy the declared range, it's "outdated"
      const outdated = !satisfies(latestVersion, range);
      return { name, outdated };
    })
  );

  const outdatedCount = results.filter(
    (r) => r.status === 'fulfilled' && r.value.outdated
  ).length;

  return {
    directDepCount: Object.keys(deps).length, // full count, not capped
    outdatedDepCount: outdatedCount,
  };
}

// ─── Install script detection ─────────────────────────────────────────────────

function hasInstallScript(manifest: NpmVersionManifest): boolean {
  const scripts = manifest.scripts ?? {};
  return !!(scripts['preinstall'] || scripts['install'] || scripts['postinstall']);
}

// ─── Main service function ────────────────────────────────────────────────────

/**
 * Fetch all npm signals for a package.
 * Uses Redis cache-aside (TTL: 12hr per PRD).
 *
 * Returns null if the package doesn't exist on npm.
 */
export async function getNpmSignals(name: string): Promise<NpmSignals | null> {
  const cacheKey = CacheKeys.npmSignals(name);

  return cacheAside<NpmSignals>(cacheKey, TTL.NPM_SIGNALS, () =>
    fetchNpmSignals(name)
  );
}

async function fetchNpmSignals(name: string): Promise<NpmSignals | null> {
  // Fetch package doc and all three download windows in parallel
  const [packageDoc, dlCurrent, dl30d, dl90d] = await Promise.all([
    npmRegistryGet<NpmPackageDoc>(`/${name}`),
    npmApiGet<NpmDownloadPoint>(`/downloads/point/last-week/${name}`),
    npmApiGet<NpmDownloadPoint>(
      `/downloads/point/${formatDateRange(30)}/${name}`
    ),
    npmApiGet<NpmDownloadPoint>(
      `/downloads/point/${formatDateRange(90)}/${name}`
    ),
  ]);

  // Package must exist on npm
  if (!packageDoc) return null;

  const latestVersion = packageDoc['dist-tags']?.latest ?? 'unknown';
  const latestManifest = packageDoc.versions?.[latestVersion];
  const publishedAt = packageDoc.time?.[latestVersion]
    ? new Date(packageDoc.time[latestVersion])
    : null;

  const totalVersions = Object.keys(packageDoc.versions ?? {}).length;

  const weeklyDownloads = dlCurrent?.downloads ?? 0;
  const weeklyDownloads30dAgo = dl30d?.downloads ?? 0;
  const weeklyDownloads90dAgo = dl90d?.downloads ?? 0;

  const downloadSlope90d = computeDownloadSlope(weeklyDownloads, weeklyDownloads90dAgo);

  // Check outdated deps (capped at 20 packages)
  const { directDepCount, outdatedDepCount } = latestManifest
    ? await checkOutdatedDeps(latestManifest)
    : { directDepCount: 0, outdatedDepCount: 0 };

  return {
    weeklyDownloads,
    weeklyDownloads30dAgo,
    weeklyDownloads90dAgo,
    downloadSlope90d,
    latestVersion,
    publishedAt,
    totalVersions,
    directDepCount,
    outdatedDepCount,
    hasInstallScript: latestManifest ? hasInstallScript(latestManifest) : false,
  };
}

/**
 * Extract the GitHub repository URL from an npm package manifest.
 * Used by the GitHub service to resolve repo coordinates.
 */
export function extractRepoUrl(manifest: NpmVersionManifest | undefined): string | undefined {
  if (!manifest?.repository) return undefined;
  if (typeof manifest.repository === 'string') return manifest.repository;
  return manifest.repository.url;
}

/**
 * Get just the repository URL for a package (lightweight — uses cached doc).
 */
export async function getPackageRepoUrl(name: string): Promise<string | undefined> {
  const doc = await npmRegistryGet<NpmPackageDoc>(`/${name}`);
  if (!doc) return undefined;
  const latest = doc['dist-tags']?.latest;
  const manifest = latest ? doc.versions?.[latest] : undefined;
  return extractRepoUrl(manifest);
}
