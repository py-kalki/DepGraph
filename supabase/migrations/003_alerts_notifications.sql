-- =============================================================================
-- DepGraph Migration 003: Alert Subscriptions + Notification Logging
-- Week 5: Email alerts, notification preferences, invoice storage
-- =============================================================================

-- ─── Alert Subscriptions ─────────────────────────────────────────────────────
-- PRD §12: "alert_subscriptions" table
-- Stores per-project, per-user alert rules.

-- Modify the skeleton table created in 001_initial_schema

ALTER TABLE alert_subscriptions DROP CONSTRAINT IF EXISTS alert_subscriptions_alert_type_check;
ALTER TABLE alert_subscriptions DROP CONSTRAINT IF EXISTS alert_subscriptions_channel_check;

ALTER TABLE alert_subscriptions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE alert_subscriptions ADD CONSTRAINT alert_subscriptions_alert_type_check 
  CHECK (alert_type IN ('score_drop', 'new_cve', 'abandonment_risk', 'digest'));

ALTER TABLE alert_subscriptions ADD CONSTRAINT alert_subscriptions_channel_check 
  CHECK (channel IN ('email', 'webhook'));

ALTER TABLE alert_subscriptions ADD CONSTRAINT alert_subscriptions_unique_idx UNIQUE (user_id, project_id, alert_type, channel);

CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_user_id    ON alert_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_project_id ON alert_subscriptions (project_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_active     ON alert_subscriptions (is_active) WHERE is_active = TRUE;

-- ─── Notification Logs ───────────────────────────────────────────────────────
-- Records every email send attempt for audit + retry purposes.

CREATE TABLE IF NOT EXISTS notification_logs (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_subscription_id   UUID        REFERENCES alert_subscriptions(id) ON DELETE SET NULL,
  email_type              VARCHAR(50) NOT NULL, -- score_drop | new_cve | abandonment_risk | digest
  recipient               VARCHAR(512) NOT NULL,
  status                  VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  error                   TEXT,
  resend_message_id       VARCHAR(255), -- Resend API message ID for tracking
  sent_at                 TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status  ON notification_logs (status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs (sent_at);

-- ─── Email Preferences ────────────────────────────────────────────────────────
-- Per-user email opt-in settings. One row per user (upserted on first access).

CREATE TABLE IF NOT EXISTS email_preferences (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  score_drop_enabled    BOOLEAN     NOT NULL DEFAULT TRUE,
  new_cve_enabled       BOOLEAN     NOT NULL DEFAULT TRUE,
  abandonment_enabled   BOOLEAN     NOT NULL DEFAULT TRUE,
  digest_enabled        BOOLEAN     NOT NULL DEFAULT TRUE,
  digest_day            SMALLINT    NOT NULL DEFAULT 1 CHECK (digest_day BETWEEN 0 AND 6), -- 0=Sun,1=Mon,...,6=Sat
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Invoices ────────────────────────────────────────────────────────────────
-- Stores Razorpay invoice metadata. PDF URL from Razorpay API.

CREATE TABLE IF NOT EXISTS invoices (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id       UUID        REFERENCES subscriptions(id) ON DELETE SET NULL,
  razorpay_invoice_id   VARCHAR(255) UNIQUE,
  razorpay_payment_id   VARCHAR(255),
  amount_paise          INTEGER     NOT NULL,   -- amount in paise (1 INR = 100 paise)
  currency              VARCHAR(10) NOT NULL DEFAULT 'INR',
  pdf_url               TEXT,
  status                VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'void', 'draft')),
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices (user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_paid_at ON invoices (paid_at DESC);

-- ─── Extend Existing Tables ───────────────────────────────────────────────────

-- Add resend_contact_id to users (for Resend audience management)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS resend_contact_id VARCHAR(255);

-- Add cancelled_at / reactivated_at to subscriptions
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS cancelled_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reactivated_at  TIMESTAMPTZ;

-- Add failure_reason to payments
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS failure_reason  VARCHAR(512);
