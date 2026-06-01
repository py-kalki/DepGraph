// =============================================================================
// DepGraph — Shared Domain Types
// Single source of truth for all type definitions across services
// PRD v1.0 — Week 1–4 scope
// =============================================================================

// ─── Enumerations ─────────────────────────────────────────────────────────────

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'healthy';
export type Ecosystem = 'npm'; // V2: 'pypi' | 'crates' | 'go'
export type PlanTier = 'free' | 'pro';
export type AlertType = 'score_drop' | 'new_cve' | 'abandonment_risk' | 'digest';
export type AlertChannel = 'email' | 'webhook';
export type MigrationEffort = 'easy' | 'medium' | 'hard';
export type ApiCompat = 'drop-in' | 'similar' | 'different';

// ─── External API — Raw Signals ───────────────────────────────────────────────

/**
 * Signals gathered from the GitHub REST API.
 * Bus factor: number of contributors accounting for ≥80% of commits in last 12mo.
 * (PRD Appendix A definition)
 */
export interface GitHubSignals {
  /** Date of the most recent commit to the default branch */
  lastCommitDate: Date | null;
  /** Average commits per week over the last 90 days */
  commitFrequency90d: number;
  /** All-time unique contributor count */
  contributorCount: number;
  /** Contributors with at least 1 commit in the last 12 months */
  activeContributors: number;
  /**
   * Bus factor — minimum contributors accounting for ≥80% of commits in 12mo.
   * PRD Appendix A: "if bus factor = 1, one person wrote essentially all recent code"
   */
  busFactor: number;
  /** Total open issues at time of scan */
  openIssues: number;
  /** Total closed issues sampled in last 90 days */
  closedIssues: number;
  /** Average days to close an issue (null if no closed issues) */
  avgIssueCloseTimeDays: number | null;
  /** GitHub repository URL parsed from package.json */
  repoUrl: string | null;
  /** Whether a valid GitHub repo URL was found in package.json */
  hasRepoLink: boolean;
  /** Number of GitHub releases published in the last 12 months */
  releaseCount12mo: number;
}

/**
 * Signals gathered from the npm registry API.
 */
export interface NpmSignals {
  /** Weekly downloads in the most recent full week */
  weeklyDownloads: number;
  /** Weekly downloads exactly 30 days ago (for short-term slope) */
  weeklyDownloads30dAgo: number;
  /** Weekly downloads exactly 90 days ago (for abandonment risk check) */
  weeklyDownloads90dAgo: number;
  /**
   * Normalised 90-day download slope.
   * Positive = growing, negative = declining.
   * Range: approximately -1.0 to +1.0
   */
  downloadSlope90d: number;
  /** Latest published version string */
  latestVersion: string;
  /** Publish date of the latest version */
  publishedAt: Date | null;
  /** Total number of published versions */
  totalVersions: number;
  /** Count of direct dependencies declared by this package */
  directDepCount: number;
  /** Count of this package's direct deps that are behind the latest version */
  outdatedDepCount: number;
  /**
   * Whether this package declares install scripts (preinstall/install/postinstall).
   * Supply chain signal for F-06 (V2).
   */
  hasInstallScript: boolean;
}

/**
 * Signals gathered from the OSV.dev vulnerability API.
 * OSV returns only active/unpatched vulnerabilities.
 */
export interface OsvSignals {
  /** Total active (unpatched) vulnerability count */
  activeCveCount: number;
  /** Vulnerabilities with CVSS score ≥ 9.0 */
  criticalCveCount: number;
  /** Vulnerabilities with CVSS score ≥ 7.0 and < 9.0 */
  highCveCount: number;
  /** Days since the oldest unpatched CVE was published (null if none) */
  oldestUnpatchedDays: number | null;
  /** CVE IDs extracted from OSV aliases array */
  cveIds: string[];
}

/**
 * Aggregated raw signals from all 3 external sources.
 * null = data source unavailable or request failed (score engine handles gracefully).
 */
export interface RawSignals {
  github: GitHubSignals | null;
  npm: NpmSignals | null;
  osv: OsvSignals | null;
  /** When these signals were fetched */
  fetchedAt: Date;
}

// ─── Score Engine — Dimension Scores ──────────────────────────────────────────

/**
 * Score for a single scoring dimension.
 * PRD dimensions: Maintenance (25%), Bus Factor (20%), Issue Health (15%),
 * Download Trend (15%), Dep Freshness (10%), Vulnerability (15%)
 */
export interface DimensionScore {
  /** Computed score for this dimension: 0–100 */
  score: number;
  /** Fixed weight for this dimension (0–1); all weights sum to 1.0 */
  weight: number;
  /** Human-readable dimension name (used in explainability output) */
  label: string;
  /** One-sentence explanation of the score (displayed in UI and CLI) */
  reason: string;
  /** Whether this dimension was computed (false = signals were null, re-weighted) */
  available: boolean;
}

/** All six scoring dimensions as defined in PRD §F-02 */
export interface ScoreDimensions {
  maintenance: DimensionScore; // weight: 0.25
  busFactor: DimensionScore; // weight: 0.20
  issueHealth: DimensionScore; // weight: 0.15
  downloadTrend: DimensionScore; // weight: 0.15
  depFreshness: DimensionScore; // weight: 0.10
  vulnerability: DimensionScore; // weight: 0.15
}

// ─── Score Engine — Output ────────────────────────────────────────────────────

/** Suggested alternative library for a risky package */
export interface Alternative {
  name: string;
  score: number;
  apiCompat: ApiCompat;
  migrationEffort: MigrationEffort;
}

/**
 * Full computed health score for a single npm package.
 * This is the primary output of the ScoreEngine.
 */
export interface PackageScore {
  packageName: string;
  packageVersion: string | null;
  ecosystem: Ecosystem;
  /** Composite weighted score: 0–100 (integer) */
  score: number;
  /** Risk band derived from score (PRD §F-02 score bands) */
  riskLevel: RiskLevel;
  /**
   * Abandonment risk flag.
   * True only when ALL four PRD conditions are met:
   * - lastCommit > 12 months ago
   * - busFactor = 1
   * - downloadSlope negative for 90 days
   * - 0 releases in 12 months
   */
  abandonmentRisk: boolean;
  /** Per-dimension breakdown */
  dimensions: ScoreDimensions;
  /**
   * Top 2 contributing factors (worst dimensions).
   * PRD requirement: "every score includes the top 2 contributing factors"
   * Format: [factorLabel, factorReason][]
   */
  topFactors: Array<{ label: string; reason: string }>;
  /** Suggested alternatives (populated from package_scores.alternatives in DB) */
  alternatives: Alternative[];
  /** When this score was computed */
  computedAt: Date;
}

// ─── Scan Report ──────────────────────────────────────────────────────────────

/**
 * The output of POST /api/scan — scored report for a full project.
 * Stored in scan_reports table and accessible via share_token.
 */
export interface ScanReport {
  id: string;
  /** Short token for the public share URL: depgraph.vedanshh.dev/r/{shareToken} */
  shareToken: string;
  /** Weighted average of all package scores */
  overallScore: number;
  totalDeps: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  healthyCount: number;
  packages: PackageScore[];
  createdAt: Date;
  /** project_id if this scan is linked to a saved project (null for anonymous scans) */
  projectId: string | null;
}

// ─── API Request / Response Shapes ───────────────────────────────────────────

/** Body for POST /api/scan */
export interface ScanRequest {
  /** List of npm package names with versions: ["express@4.18.2", "react@18.2.0"] */
  packages: string[];
  /**
   * SHA-256 hash of package-lock.json content.
   * Used as Redis cache key for the full scan result (TTL: 1hr).
   */
  lockfileHash: string;
}

/** Response from GET /api/package/:name/score */
export interface PackageScoreResponse {
  packageName: string;
  score: number;
  riskLevel: RiskLevel;
  abandonmentRisk: boolean;
  topFactors: Array<{ label: string; reason: string }>;
  dimensions: ScoreDimensions;
  computedAt: string; // ISO string
}

// ─── Database Row Shapes ──────────────────────────────────────────────────────
// Mirror the SQL schema defined in PRD §12 exactly.

export interface DbUser {
  id: string;
  github_id: number;
  github_login: string;
  email: string | null;
  plan: PlanTier;
  // Week 4 billing columns (added in migration 002)
  razorpay_customer_id: string | null;
  subscription_status: string | null;
  created_at: string;
}

export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  github_repo: string | null;
  last_scanned: string | null;
  score: number | null;
  created_at: string;
}

export interface DbPackageScore {
  id: string;
  package_name: string;
  package_version: string | null;
  ecosystem: string;
  score: number;
  risk_level: string;
  maintenance_score: number | null;
  bus_factor_score: number | null;
  issue_health_score: number | null;
  download_trend_score: number | null;
  freshness_score: number | null;
  vulnerability_score: number | null;
  abandonment_risk: boolean;
  cve_count_active: number;
  last_commit_date: string | null;
  contributor_count: number | null;
  weekly_downloads: number | null;
  alternatives: Alternative[] | null;
  raw_signals: RawSignals | null;
  computed_at: string;
}

export interface DbScoreHistory {
  id: string;
  package_name: string;
  ecosystem: string;
  score: number;
  recorded_at: string;
}

export interface DbScanReport {
  id: string;
  project_id: string | null;
  share_token: string;
  overall_score: number;
  total_deps: number;
  critical_count: number;
  high_count: number;
  dep_scores: Array<{
    name: string;
    version: string | null;
    score: number;
    risk_level: string;
  }>;
  created_at: string;
}

export interface DbAlertSubscription {
  id: string;
  user_id: string;
  project_id: string;
  alert_type: AlertType;
  threshold: number | null;
  channel: AlertChannel;
  destination: string;
  created_at: string;
}

// ─── Billing / Razorpay Database Row Shapes ───────────────────────────────────

export type SubscriptionStatus = 'inactive' | 'active' | 'cancelled' | 'past_due';

export type RazorpaySubStatus =
  | 'created' | 'authenticated' | 'active' | 'paused'
  | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';

export type PaymentStatus = 'captured' | 'failed' | 'refunded';

export interface DbCustomer {
  id: string;
  user_id: string;
  razorpay_customer_id: string;
  email: string | null;
  created_at: string;
}

export interface DbSubscription {
  id: string;
  user_id: string;
  razorpay_subscription_id: string;
  razorpay_plan_id: string;
  plan: 'pro';
  status: RazorpaySubStatus;
  current_start: string | null;
  current_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPayment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  razorpay_payment_id: string;
  razorpay_order_id: string | null;
  amount: number; // paise
  currency: string;
  status: PaymentStatus;
  captured_at: string | null;
  created_at: string;
}

export interface DbWebhookEvent {
  id: string;
  razorpay_event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processed_at: string | null;
  error: string | null;
  created_at: string;
}

// ─── Plan Limits ──────────────────────────────────────────────────────────────

export interface PlanLimits {
  maxProjects: number | null; // null = unlimited
  historyDays: 30 | 365;
  canUsePrivateRepos: boolean;
  canOnDemandRefresh: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: { maxProjects: 3, historyDays: 30, canUsePrivateRepos: false, canOnDemandRefresh: false },
  pro:  { maxProjects: null, historyDays: 365, canUsePrivateRepos: true, canOnDemandRefresh: true },
};

// ─── Week 5: Alert / Email / Repo DB Row Shapes ───────────────────────────────

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'skipped';
export type InvoiceStatus = 'paid' | 'void' | 'draft';

export interface DbAlertSubscription {
  id: string;
  user_id: string;
  project_id: string;
  alert_type: AlertType;
  threshold: number | null;
  channel: AlertChannel;
  destination: string;
  is_active: boolean;
  created_at: string;
}

export interface DbEmailPreferences {
  id: string;
  user_id: string;
  score_drop_enabled: boolean;
  new_cve_enabled: boolean;
  abandonment_enabled: boolean;
  digest_enabled: boolean;
  digest_day: number; // 0=Sun ... 6=Sat
  created_at: string;
  updated_at: string;
}

export interface DbNotificationLog {
  id: string;
  user_id: string;
  alert_subscription_id: string | null;
  email_type: AlertType | 'digest';
  recipient: string;
  status: NotificationStatus;
  error: string | null;
  resend_message_id: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface DbInvoice {
  id: string;
  user_id: string;
  subscription_id: string | null;
  razorpay_invoice_id: string | null;
  razorpay_payment_id: string | null;
  amount_paise: number;
  currency: string;
  pdf_url: string | null;
  status: InvoiceStatus;
  paid_at: string | null;
  created_at: string;
}

export interface DbRepositoryPermission {
  id: string;
  user_id: string;
  github_repo: string;
  is_private: boolean;
  access_verified_at: string | null;
  access_token_hint: string | null;
  created_at: string;
}

export interface DbRepositorySyncLog {
  id: string;
  project_id: string;
  status: 'success' | 'failed' | 'skipped';
  error: string | null;
  synced_at: string;
}

// Email template payload types
export interface ScoreDropPayload {
  projectName: string;
  projectId: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  shareUrl: string;
}

export interface NewCvePayload {
  projectName: string;
  packageName: string;
  cveId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  shareUrl: string;
}

export interface AbandonmentRiskPayload {
  projectName: string;
  packageName: string;
  score: number;
  lastCommitDate: string | null;
  shareUrl: string;
}

export interface WeeklyDigestPayload {
  userName: string;
  projects: Array<{
    name: string;
    score: number;
    delta: number;
    criticalCount: number;
    highCount: number;
    shareUrl: string;
  }>;
  weekStart: string;
  weekEnd: string;
}
