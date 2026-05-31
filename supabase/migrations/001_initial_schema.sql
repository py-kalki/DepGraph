-- =============================================================================
-- DepGraph — Initial Database Schema
-- Migration: 001_initial_schema
-- PRD §12 — Data Model
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS
-- GitHub OAuth only in V1 (PRD §F-04)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id    INTEGER UNIQUE NOT NULL,
  github_login VARCHAR(255) NOT NULL,
  email        VARCHAR(255),
  plan         VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PROJECTS
-- Saved repos linked to a user
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  github_repo  VARCHAR(512),  -- owner/repo format
  last_scanned TIMESTAMPTZ,
  score        INTEGER CHECK (score >= 0 AND score <= 100),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- =============================================================================
-- PACKAGE SCORES
-- Core dataset — one row per package per ecosystem.
-- Updated daily by the scoring cron job.
-- =============================================================================
CREATE TABLE IF NOT EXISTS package_scores (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name         VARCHAR(255) NOT NULL,
  package_version      VARCHAR(50),
  ecosystem            VARCHAR(20) DEFAULT 'npm' CHECK (ecosystem IN ('npm')),
  score                INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level           VARCHAR(20) CHECK (risk_level IN ('critical', 'high', 'medium', 'low', 'healthy')),

  -- Dimension sub-scores (PRD §F-02)
  maintenance_score    INTEGER CHECK (maintenance_score >= 0 AND maintenance_score <= 100),
  bus_factor_score     INTEGER CHECK (bus_factor_score >= 0 AND bus_factor_score <= 100),
  issue_health_score   INTEGER CHECK (issue_health_score >= 0 AND issue_health_score <= 100),
  download_trend_score INTEGER CHECK (download_trend_score >= 0 AND download_trend_score <= 100),
  freshness_score      INTEGER CHECK (freshness_score >= 0 AND freshness_score <= 100),
  vulnerability_score  INTEGER CHECK (vulnerability_score >= 0 AND vulnerability_score <= 100),

  -- Risk flags
  abandonment_risk     BOOLEAN DEFAULT FALSE,
  cve_count_active     INTEGER DEFAULT 0 CHECK (cve_count_active >= 0),

  -- Key raw data points (denormalised for fast display)
  last_commit_date     DATE,
  contributor_count    INTEGER CHECK (contributor_count >= 0),
  weekly_downloads     INTEGER CHECK (weekly_downloads >= 0),

  -- JSONB payloads
  alternatives         JSONB,  -- Array of {name, score, apiCompat, migrationEffort}
  raw_signals          JSONB,  -- Full raw data from GitHub/npm/OSV APIs

  computed_at          TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(package_name, ecosystem)
);

CREATE INDEX IF NOT EXISTS idx_package_scores_name     ON package_scores(package_name);
CREATE INDEX IF NOT EXISTS idx_package_scores_ecosystem ON package_scores(ecosystem);
CREATE INDEX IF NOT EXISTS idx_package_scores_score     ON package_scores(score);
CREATE INDEX IF NOT EXISTS idx_package_scores_risk      ON package_scores(risk_level);

-- =============================================================================
-- SCORE HISTORY
-- Time-series data for trend charts (PRD §F-03 dashboard home)
-- =============================================================================
CREATE TABLE IF NOT EXISTS score_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name VARCHAR(255) NOT NULL,
  ecosystem    VARCHAR(20) DEFAULT 'npm',
  score        INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  recorded_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_history_package ON score_history(package_name, recorded_at DESC);

-- =============================================================================
-- SCAN REPORTS
-- Full project scan result. share_token enables public share URLs.
-- =============================================================================
CREATE TABLE IF NOT EXISTS scan_reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES projects(id) ON DELETE SET NULL,
  share_token    VARCHAR(20) UNIQUE NOT NULL,
  overall_score  INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  total_deps     INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count     INTEGER DEFAULT 0,
  dep_scores     JSONB,  -- Array of {name, version, score, risk_level}
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_reports_share_token ON scan_reports(share_token);
CREATE INDEX IF NOT EXISTS idx_scan_reports_project_id  ON scan_reports(project_id);

-- =============================================================================
-- ALERT SUBSCRIPTIONS
-- User-configured alerts (Week 5 — email/webhook delivery)
-- Schema created now so it can be referenced in future migrations.
-- =============================================================================
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  alert_type   VARCHAR(50) CHECK (alert_type IN ('score_drop', 'new_cve', 'abandonment_risk')),
  threshold    INTEGER,  -- Score threshold for score_drop alerts
  channel      VARCHAR(20) CHECK (channel IN ('email', 'webhook', 'slack')),
  destination  VARCHAR(512),  -- email address or webhook URL
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_subs_user_id    ON alert_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_subs_project_id ON alert_subscriptions(project_id);

-- =============================================================================
-- Row Level Security (RLS)
-- Enabled now; policies to be added in Week 3 when auth is implemented.
-- package_scores and score_history are public read (no RLS needed).
-- =============================================================================
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- Temporary open policies for Week 1 (server-side only access via service role key)
-- These will be replaced in Week 3 with user-scoped policies.
CREATE POLICY "service_role_all_users"    ON users               FOR ALL USING (true);
CREATE POLICY "service_role_all_projects" ON projects            FOR ALL USING (true);
CREATE POLICY "service_role_all_scans"    ON scan_reports        FOR ALL USING (true);
CREATE POLICY "service_role_all_alerts"   ON alert_subscriptions FOR ALL USING (true);
