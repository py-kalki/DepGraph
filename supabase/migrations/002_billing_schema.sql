-- =============================================================================
-- DepGraph — Billing Schema
-- Migration: 002_billing_schema
-- Adds Razorpay subscription tables + billing columns to existing tables.
-- PRD §11: Payments = RAZORPAY | PRD §15: Pro $19/mo, Team $79/mo
-- =============================================================================

-- =============================================================================
-- ALTER USERS TABLE
-- Add Razorpay customer ID + subscription status columns
-- =============================================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS razorpay_customer_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS subscription_status  VARCHAR(20) DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'past_due'));

CREATE INDEX IF NOT EXISTS idx_users_razorpay_customer ON users(razorpay_customer_id)
  WHERE razorpay_customer_id IS NOT NULL;

-- =============================================================================
-- ALTER PROJECTS TABLE
-- Add soft-delete + refresh control columns
-- =============================================================================
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS is_active       BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS refresh_enabled BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_projects_refresh
  ON projects(refresh_enabled, last_scanned)
  WHERE is_active = TRUE AND refresh_enabled = TRUE;

-- =============================================================================
-- ALTER SCORE_HISTORY TABLE
-- Add project_id for project-level trend queries
-- =============================================================================
ALTER TABLE score_history
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_score_history_project ON score_history(project_id, recorded_at DESC)
  WHERE project_id IS NOT NULL;

-- =============================================================================
-- CUSTOMERS
-- One row per user who has ever initiated a Razorpay subscription.
-- =============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  razorpay_customer_id  VARCHAR(100) UNIQUE NOT NULL,
  email                 VARCHAR(255),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id           ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_razorpay_customer ON customers(razorpay_customer_id);

-- =============================================================================
-- SUBSCRIPTIONS
-- Tracks Razorpay subscription lifecycle per user.
-- =============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  razorpay_subscription_id VARCHAR(100) UNIQUE NOT NULL,
  razorpay_plan_id         VARCHAR(100) NOT NULL,
  plan                     VARCHAR(20) NOT NULL CHECK (plan IN ('pro', 'team')),
  status                   VARCHAR(20) NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'authenticated', 'active', 'paused', 'pending', 'halted', 'cancelled', 'completed', 'expired')),
  current_start            TIMESTAMPTZ,
  current_end              TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id      ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_id  ON subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status       ON subscriptions(status);

-- =============================================================================
-- PAYMENTS
-- Individual payment records linked to subscriptions.
-- Amounts stored in paise (INR smallest unit). ₹19 = 1900 paise.
-- =============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subscription_id      UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  razorpay_payment_id  VARCHAR(100) UNIQUE NOT NULL,
  razorpay_order_id    VARCHAR(100),
  amount               INTEGER NOT NULL CHECK (amount > 0),  -- paise
  currency             VARCHAR(10) DEFAULT 'INR',
  status               VARCHAR(20) NOT NULL DEFAULT 'captured'
    CHECK (status IN ('captured', 'failed', 'refunded')),
  captured_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id     ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_sub_id      ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_id ON payments(razorpay_payment_id);

-- =============================================================================
-- WEBHOOK_EVENTS
-- Idempotent log of every Razorpay webhook received.
-- razorpay_event_id is the unique key for deduplication.
-- =============================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_event_id   VARCHAR(100) UNIQUE NOT NULL,
  event_type          VARCHAR(100) NOT NULL,
  payload             JSONB NOT NULL,
  processed           BOOLEAN DEFAULT FALSE,
  processed_at        TIMESTAMPTZ,
  error               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id  ON webhook_events(razorpay_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_unprocessed
  ON webhook_events(processed, event_type)
  WHERE processed = FALSE;

-- =============================================================================
-- ROW LEVEL SECURITY — new tables
-- All access via service role key (server-side only). Client never hits DB directly.
-- =============================================================================
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_customers"       ON customers      FOR ALL USING (true);
CREATE POLICY "service_role_all_subscriptions"   ON subscriptions  FOR ALL USING (true);
CREATE POLICY "service_role_all_payments"        ON payments       FOR ALL USING (true);
CREATE POLICY "service_role_all_webhook_events"  ON webhook_events FOR ALL USING (true);
