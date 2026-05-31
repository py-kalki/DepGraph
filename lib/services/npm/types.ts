// =============================================================================
// DepGraph — npm Registry Service Types
// Internal types for npm registry API responses.
// =============================================================================

/** Top-level shape of GET https://registry.npmjs.org/{name} */
export interface NpmPackageDoc {
  name: string;
  description?: string;
  'dist-tags': {
    latest: string;
    [tag: string]: string;
  };
  versions: Record<string, NpmVersionManifest>;
  time: Record<string, string>; // version → ISO date, plus "created" and "modified"
}

/** Per-version manifest within the package doc */
export interface NpmVersionManifest {
  name: string;
  version: string;
  description?: string;
  main?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  repository?: { type: string; url: string } | string;
  license?: string;
  _npmUser?: { name: string; email: string };
}

/** Response from https://api.npmjs.org/downloads/point/{period}/{name} */
export interface NpmDownloadPoint {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

/** A simplified resolved dep: name → latest version */
export interface NpmDepInfo {
  name: string;
  declaredRange: string;
  latestVersion: string;
  isOutdated: boolean;
}
