// =============================================================================
// depgraph/action — diff.ts
// Parse package.json and detect dependency changes between base and head.
// =============================================================================

import { execSync } from 'child_process';
import * as core from '@actions/core';
import type { DepEntry } from './types';

/** Parse a package.json string into a flat name→version map. */
export function parsePackageJson(raw: string): Map<string, string> {
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw);
  } catch {
    throw new Error('Failed to parse package.json — invalid JSON');
  }

  const deps: Record<string, string> = {
    ...((pkg.dependencies    as Record<string, string>) ?? {}),
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
  };

  return new Map(
    Object.entries(deps).map(([name, ver]) => [name, ver.replace(/^[\^~>=<]+/, '')]),
  );
}

/** Read the base branch version of a file using git show. */
export function readBaseFile(baseSha: string, filePath: string): string | null {
  try {
    return execSync(`git show ${baseSha}:${filePath}`, { encoding: 'utf8' });
  } catch {
    core.debug(`Could not read ${filePath} from base commit ${baseSha}`);
    return null;
  }
}

/** Detect if package.json or package-lock.json changed in this PR. */
export function packageFilesChanged(baseSha: string, headSha: string): boolean {
  try {
    const output = execSync(
      `git diff --name-only ${baseSha} ${headSha}`,
      { encoding: 'utf8' },
    );
    return output.includes('package.json') || output.includes('package-lock.json');
  } catch {
    core.warning('Could not determine changed files — proceeding with full scan');
    return true;
  }
}

/** Convert a version map to a sorted DepEntry array. */
export function mapToDepList(map: Map<string, string>): DepEntry[] {
  return Array.from(map.entries())
    .map(([name, version]) => ({ name, version }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
