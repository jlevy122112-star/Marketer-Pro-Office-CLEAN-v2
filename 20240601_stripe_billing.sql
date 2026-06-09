-- ============================================================
-- Migration: Stripe billing tables
-- File: 20240601_stripe_billing.sql
-- Run in: Supabase SQL Editor or via supabase db push
-- ============================================================

-- ─── stripe_customers ────────────────────────────────────────────────────────
-- Maps your tenants to their Stripe customer IDs

CREATE TABLE IF NOT EXISTS stripe_customers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id  TEXT NOT NULL UNIQUE,
  email               TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS stripe_customers_tenant_id_idx ON stripe_customers(tenant_id);
CREATE INDEX IF NOT EXISTS stripe_customers_stripe_id_idx ON stripe_customers(stripe_customer_id);

-- ─── subscriptions ───────────────────────────────────────────────────────────
-- Canonical subscription state — synced from Stripe via webhooks

CREATE TABLE IF NOT EXISTS subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id        TEXT NOT NULL,
  stripe_subscription_id    TEXT NOT NULL UNIQUE,
  stripe_price_id           TEXT NOT NULL,

  -- Plan state
  plan                      TEXT NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free', 'pro', 'enterprise')),
  billing_interval          TEXT NOT NULL DEFAULT 'monthly'
                            CHECK (billing_interval IN ('monthly', 'annual')),
  status                    TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN (
                              'active', 'trialing', 'past_due',
                              'canceled', 'unpaid', 'paused', 'incomplete',
                              'incomplete_expired'
                            )),

  -- Period
  trial_start               TIMESTAMPTZ,
  trial_end                 TIMESTAMPTZ,
  current_period_start      TIMESTAMPTZ NOT NULL,
  current_period_end        TIMESTAMPTZ NOT NULL,

  -- Cancellation
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at               TIMESTAMPTZ,
  ended_at                  TIMESTAMPTZ,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_tenant_id_idx ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_sub_id_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- ─── stripe_webhook_events ───────────────────────────────────────────────────
-- Idempotency log — prevents double-processing of webhook events

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id   TEXT NOT NULL UNIQUE,
  event_type        TEXT NOT NULL,
  processed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success           BOOLEAN,
  error             TEXT,
  payload           JSONB
);

CREATE INDEX IF NOT EXISTS webhook_events_stripe_id_idx ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS webhook_events_type_idx ON stripe_webhook_events(event_type);

-- ─── usage_records ───────────────────────────────────────────────────────────
-- Tracks metered usage per tenant per billing period

CREATE TABLE IF NOT EXISTS usage_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric            TEXT NOT NULL,  -- 'generations', 'social_accounts', etc.
  period_start      TIMESTAMPTZ NOT NULL,
  period_end        TIMESTAMPTZ NOT NULL,
  count             INTEGER NOT NULL DEFAULT 0,
  limit_value       INTEGER,        -- NULL = unlimited
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, metric, period_start)
);

CREATE INDEX IF NOT EXISTS usage_records_tenant_metric_idx ON usage_records(tenant_id, metric);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Users can only read their own billing data
-- Backend service role bypasses RLS

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
-- webhook_events: no RLS — backend-only table

CREATE POLICY "Users can read own customer record"
  ON stripe_customers FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Users can read own usage"
  ON usage_records FOR SELECT
  USING (auth.uid() = tenant_id);

-- Service role can do everything (used by backend/webhooks)
CREATE POLICY "Service role full access to customers"
  ON stripe_customers FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to usage"
  ON usage_records FOR ALL
  USING (auth.role() = 'service_role');

-- ─── Helper function: get current plan for a tenant ───────────────────────────

CREATE OR REPLACE FUNCTION get_tenant_plan(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan TEXT;
BEGIN
  SELECT plan INTO v_plan
  FROM subscriptions
  WHERE tenant_id = p_tenant_id
    AND status IN ('active', 'trialing')
  ORDER BY updated_at DESC
  LIMIT 1;

  RETURN COALESCE(v_plan, 'free');
END;
$$;

-- ─── Helper function: check if tenant has access to a feature ─────────────────

CREATE OR REPLACE FUNCTION tenant_has_access(p_tenant_id UUID, p_required_plan TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan TEXT;
  v_rank INTEGER;
  v_required_rank INTEGER;
BEGIN
  v_plan := get_tenant_plan(p_tenant_id);

  v_rank := CASE v_plan
    WHEN 'enterprise' THEN 3
    WHEN 'pro'        THEN 2
    WHEN 'free'       THEN 1
    ELSE 1
  END;

  v_required_rank := CASE p_required_plan
    WHEN 'enterprise' THEN 3
    WHEN 'pro'        THEN 2
    WHEN 'free'       THEN 1
    ELSE 1
  END;

  RETURN v_rank >= v_required_rank;
END;
$$;

-- ─── Trigger: auto-update updated_at ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_records_updated_at
  BEFORE UPDATE ON usage_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
