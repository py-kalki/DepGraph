-- =============================================================================
-- DepGraph — Migration 005: GitHub Action Support (Week 6)
-- Tables: api_keys, action_runs, ci_reports, pr_comments, usage_events
-- =============================================================================

-- ─── API Keys ─────────────────────────────────────────────────────────────────
-- Raw key is NEVER stored. Only the SHA-256 hash and an 8-char display prefix.

CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash     VARCHAR(64) NOT NULL UNIQUE,       -- SHA-256 hex of raw key
  key_prefix   VARCHAR(12) NOT NULL,              -- e.g. "dg_live_a1b2" (shown in UI)
  name         VARCHAR(255) NOT NULL DEFAULT 'Default',
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id  ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- ─── Action Runs ──────────────────────────────────────────────────────────────
-- One row per GitHub Action execution.

CREATE TABLE IF NOT EXISTS action_runs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id     UUID        REFERENCES api_keys(id) ON DELETE SET NULL,
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_repo    VARCHAR(512) NOT NULL,            -- owner/repo
  pr_number      INTEGER     NOT NULL,
  base_sha       VARCHAR(40),
  head_sha       VARCHAR(40),
  overall_score  INTEGER,
  critical_count INTEGER     NOT NULL DEFAULT 0,
  high_count     INTEGER     NOT NULL DEFAULT 0,
  gate_result    VARCHAR(10) NOT NULL DEFAULT 'pass', -- pass | warn | fail
  report_url     TEXT,
  execution_ms   INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_runs_user_id     ON action_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_action_runs_github_repo ON action_runs(github_repo);
CREATE INDEX IF NOT EXISTS idx_action_runs_created_at  ON action_runs(created_at DESC);

-- ─── CI Reports ───────────────────────────────────────────────────────────────
-- Detailed diff + gate data for each action run.

CREATE TABLE IF NOT EXISTS ci_reports (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action_run_id  UUID        NOT NULL REFERENCES action_runs(id) ON DELETE CASCADE,
  dep_delta      JSONB       NOT NULL DEFAULT '{}',  -- {added:[], removed:[], updated:[]}
  base_score     INTEGER,
  head_score     INTEGER,
  score_delta    INTEGER     GENERATED ALWAYS AS (head_score - base_score) STORED,
  new_critical   JSONB       NOT NULL DEFAULT '[]',  -- array of {name, score, reason}
  new_high       JSONB       NOT NULL DEFAULT '[]',
  fail_on        VARCHAR(10) NOT NULL DEFAULT 'critical',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ci_reports_action_run_id ON ci_reports(action_run_id);

-- ─── PR Comments ──────────────────────────────────────────────────────────────
-- Tracks posted GitHub PR comments for update-in-place dedup.

CREATE TABLE IF NOT EXISTS pr_comments (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action_run_id  UUID        REFERENCES action_runs(id) ON DELETE SET NULL,
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_repo    VARCHAR(512) NOT NULL,
  pr_number      INTEGER     NOT NULL,
  comment_id     BIGINT,                           -- GitHub comment ID for PATCH
  body_hash      VARCHAR(64),                      -- SHA-256 of last body (skip re-post if same)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one tracked comment per repo+PR per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_pr_comments_repo_pr_user
  ON pr_comments(github_repo, pr_number, user_id);

-- ─── Usage Events ─────────────────────────────────────────────────────────────
-- Append-only event log for usage tracking and billing.

CREATE TABLE IF NOT EXISTS usage_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type   VARCHAR(50) NOT NULL,   -- action_run | api_scan | api_compare
  github_repo  VARCHAR(512),
  metadata     JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id    ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_type       ON usage_events(event_type);
