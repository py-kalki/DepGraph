// =============================================================================
// DepGraph — Service: Dependency Differ (Week 6)
// Computes the delta between base and head dependency trees.
// =============================================================================

export type DepEntry = {
  name:    string;
  version: string;
};

export type ScoredDep = DepEntry & {
  score:          number;
  riskLevel:      'critical' | 'high' | 'medium' | 'low' | 'healthy';
  abandonmentRisk: boolean;
  cveCount:       number;
};

export type DepDelta = {
  added:   ScoredDep[];
  removed: DepEntry[];
  updated: Array<{ name: string; fromVersion: string; toVersion: string; scoreDelta: number | null }>;
};

/**
 * Parse a package.json string into a flat DepEntry list.
 * Merges dependencies + devDependencies, strips semver prefixes.
 */
export function parsePackageJson(raw: string): DepEntry[] {
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw);
  } catch {
    throw new Error('Invalid package.json content');
  }

  const merged: Record<string, string> = {
    ...((pkg.dependencies as Record<string, string>) ?? {}),
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
  };

  return Object.entries(merged).map(([name, version]) => ({
    name,
    version: version.replace(/^[\^~>=<]+/, ''),
  }));
}

/**
 * Compute the dependency delta between base and head.
 * headScored contains scored versions for added/updated deps.
 */
export function computeDepDelta(
  base: DepEntry[],
  head: DepEntry[],
  headScored: Map<string, ScoredDep>,
  baseScored: Map<string, ScoredDep>,
): DepDelta {
  const baseMap = new Map(base.map((d) => [d.name, d]));
  const headMap = new Map(head.map((d) => [d.name, d]));

  const added: ScoredDep[]   = [];
  const removed: DepEntry[]  = [];
  const updated: DepDelta['updated'] = [];

  // Added deps — in head but not in base
  for (const [name, dep] of headMap) {
    if (!baseMap.has(name)) {
      const scored = headScored.get(name);
      if (scored) added.push(scored);
      else added.push({ ...dep, score: 0, riskLevel: 'medium', abandonmentRisk: false, cveCount: 0 });
    }
  }

  // Removed deps — in base but not in head
  for (const [name, dep] of baseMap) {
    if (!headMap.has(name)) {
      removed.push(dep);
    }
  }

  // Updated deps — version changed
  for (const [name, headDep] of headMap) {
    const baseDep = baseMap.get(name);
    if (baseDep && baseDep.version !== headDep.version) {
      const baseScore = baseScored.get(name)?.score ?? null;
      const headScore = headScored.get(name)?.score ?? null;
      updated.push({
        name,
        fromVersion: baseDep.version,
        toVersion:   headDep.version,
        scoreDelta:  baseScore !== null && headScore !== null ? headScore - baseScore : null,
      });
    }
  }

  return { added, removed, updated };
}
