-- Per-customer service browse history for "Recently viewed" (run in Supabase SQL editor)
-- Tracks when a logged-in customer opens a service (booking flow / dashboard taps).

CREATE TABLE IF NOT EXISTS customer_service_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_service_views_user_viewed
  ON customer_service_views (user_id, viewed_at DESC);

ALTER TABLE customer_service_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "csv_select_own" ON customer_service_views;
CREATE POLICY "csv_select_own" ON customer_service_views
  FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "csv_insert_own" ON customer_service_views;
CREATE POLICY "csv_insert_own" ON customer_service_views
  FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "csv_update_own" ON customer_service_views;
CREATE POLICY "csv_update_own" ON customer_service_views
  FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
