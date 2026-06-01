-- =============================================================================
-- DepGraph — Migration 007: Cleanup Stored Procedures
-- Week 7: automated data lifecycle management.
-- =============================================================================

-- Removes score_history rows older than 395 days (12 months + 30-day buffer).
-- Returns the count of deleted rows.
CREATE OR REPLACE FUNCTION cleanup_old_score_history()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM score_history
  WHERE recorded_at < NOW() - INTERVAL '395 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Removes action_runs older than 90 days for free-plan users.
-- Pro/Team users retain 12 months of history.
CREATE OR REPLACE FUNCTION cleanup_old_action_runs()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM action_runs ar
  USING users u
  WHERE ar.user_id = u.id
    AND u.plan = 'free'
    AND ar.created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Removes usage_events older than 180 days.
CREATE OR REPLACE FUNCTION cleanup_old_usage_events()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM usage_events
  WHERE created_at < NOW() - INTERVAL '180 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
