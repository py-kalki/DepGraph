-- =============================================================================
-- DepGraph — Migration 008: Beta Access + Feedback
-- Week 8: Beta testing program management.
-- =============================================================================

CREATE TABLE IF NOT EXISTS beta_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_code TEXT UNIQUE,
  feedback_submitted BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own beta status" ON beta_users
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can submit own feedback" ON feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
