-- =============================================================================
-- DepGraph Migration 004: Repository Permissions + Sync Logs
-- Week 5: Private repository support for Pro/Team plan users
-- =============================================================================

-- ─── Repository Permissions ───────────────────────────────────────────────────
-- Tracks which private repos a user has verified access to.
-- access_token_hint stores only the last 4 chars of the OAuth token for audit.

CREATE TABLE IF NOT EXISTS repository_permissions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_repo           VARCHAR(512) NOT NULL,   -- "owner/repo"
  is_private            BOOLEAN     NOT NULL DEFAULT FALSE,
  access_verified_at    TIMESTAMPTZ,
  access_token_hint     VARCHAR(4),              -- last 4 chars of OAuth token used
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, github_repo)
);

CREATE INDEX IF NOT EXISTS idx_repo_permissions_user_id    ON repository_permissions (user_id);
CREATE INDEX IF NOT EXISTS idx_repo_permissions_repo       ON repository_permissions (github_repo);

-- ─── Repository Sync Logs ─────────────────────────────────────────────────────
-- Records each time a project's repository is synced/refreshed.

CREATE TABLE IF NOT EXISTS repository_sync_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  error       TEXT,
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repo_sync_logs_project_id ON repository_sync_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_repo_sync_logs_synced_at  ON repository_sync_logs (synced_at DESC);

-- ─── Extend Projects Table ────────────────────────────────────────────────────
-- Add is_private flag so dashboard can show a lock icon
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS is_private       BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS refresh_enabled  BOOLEAN     NOT NULL DEFAULT TRUE;
