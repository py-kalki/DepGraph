-- =============================================================================
-- DepGraph — Migration 006: Performance Indexes
-- Week 7: adds indexes for query optimization.
-- (Removed CONCURRENTLY because Supabase push runs migrations in a pipeline transaction)
-- =============================================================================

-- score_history: trend chart queries — ordered by package + date desc
CREATE INDEX IF NOT EXISTS idx_score_history_pkg_date
  ON score_history (package_name, recorded_at DESC);

-- action_runs: user action history queries
CREATE INDEX IF NOT EXISTS idx_action_runs_user_date
  ON action_runs (user_id, created_at DESC);

-- usage_events: analytics queries by user + type
CREATE INDEX IF NOT EXISTS idx_usage_events_user_type_date
  ON usage_events (user_id, event_type, created_at DESC);

-- scan_reports: project report listing
CREATE INDEX IF NOT EXISTS idx_scan_reports_project_date
  ON scan_reports (project_id, created_at DESC);

-- pr_comments: dedup lookup by repo + PR
CREATE INDEX IF NOT EXISTS idx_pr_comments_repo_pr
  ON pr_comments (github_repo, pr_number);

-- package_scores: lookup by name (already unique, but explicit for planner)
CREATE INDEX IF NOT EXISTS idx_package_scores_name
  ON package_scores (package_name);

-- api_keys: lookup by key_hash (used on every action API request)
CREATE INDEX IF NOT EXISTS idx_api_keys_hash
  ON api_keys (key_hash);
