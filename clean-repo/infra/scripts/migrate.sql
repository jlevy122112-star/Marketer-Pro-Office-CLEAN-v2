-- ─────────────────────────────────────────────────────────────────────────────
-- MARKETER-PRO OFFICE EDITION — COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)
-- Supabase project: qormgykublfsmgacbpyx
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 — USER PROFILES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                 TEXT NOT NULL UNIQUE,
  display_name          TEXT NOT NULL DEFAULT '',
  avatar_url            TEXT,
  password_hash         TEXT,                        -- null for OAuth users
  plan_id               TEXT NOT NULL DEFAULT 'free'
                          CHECK (plan_id IN ('free','pro','enterprise')),
  xp                    INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level                 INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
  streak_current        INTEGER NOT NULL DEFAULT 0 CHECK (streak_current >= 0),
  streak_longest        INTEGER NOT NULL DEFAULT 0 CHECK (streak_longest >= 0),
  streak_last_active    DATE,
  total_posts           INTEGER NOT NULL DEFAULT 0 CHECK (total_posts >= 0),
  total_generations     INTEGER NOT NULL DEFAULT 0 CHECK (total_generations >= 0),
  onboarding_complete   BOOLEAN NOT NULL DEFAULT FALSE,
  workspace_name        TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text OR auth.uid() IS NULL);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "profiles_insert_service" ON profiles
  FOR INSERT WITH CHECK (TRUE);

-- XP increment function called from backend
CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE profiles
  SET
    xp = xp + amount,
    total_generations = total_generations + CASE WHEN amount > 0 THEN 1 ELSE 0 END
  WHERE id = user_id
  RETURNING xp INTO new_xp;

  -- Calculate level from XP thresholds
  new_level := CASE
    WHEN new_xp >= 5500 THEN 10
    WHEN new_xp >= 4000 THEN 9
    WHEN new_xp >= 3000 THEN 8
    WHEN new_xp >= 2200 THEN 7
    WHEN new_xp >= 1500 THEN 6
    WHEN new_xp >= 1000 THEN 5
    WHEN new_xp >= 600  THEN 4
    WHEN new_xp >= 300  THEN 3
    WHEN new_xp >= 100  THEN 2
    ELSE 1
  END;

  UPDATE profiles SET level = new_level WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 — BRANDS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  industry         TEXT NOT NULL DEFAULT 'General',
  tone             TEXT NOT NULL DEFAULT 'professional'
                     CHECK (tone IN ('professional','casual','playful','authoritative','inspirational','educational','witty','luxury')),
  target_audience  TEXT,
  workspace_name   TEXT,
  logo_url         TEXT,
  color_primary    TEXT,
  color_secondary  TEXT,
  platforms        TEXT[] NOT NULL DEFAULT '{}',
  is_default       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_own" ON brands
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 — AUDIENCE SEGMENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audience_segments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id    UUID REFERENCES brands(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  age_range   TEXT,
  interests   TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER audience_segments_updated_at
  BEFORE UPDATE ON audience_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audience_segments_own" ON audience_segments
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4 — CAMPAIGNS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS campaigns (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id     UUID REFERENCES brands(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  goal         TEXT,
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','active','paused','completed','archived')),
  start_date   DATE,
  end_date     DATE,
  budget       NUMERIC(10,2),
  platforms    TEXT[] NOT NULL DEFAULT '{}',
  tags         TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_own" ON campaigns
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5 — CONTENT GENERATION RESULTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS generation_results (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id      UUID REFERENCES brands(id) ON DELETE SET NULL,
  campaign_id   UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  prompt        TEXT NOT NULL,
  content_type  TEXT NOT NULL DEFAULT 'post',
  platforms     TEXT[] NOT NULL DEFAULT '{}',
  tone          TEXT NOT NULL DEFAULT 'professional',
  artifacts     JSONB NOT NULL DEFAULT '[]',  -- Array of GeneratedArtifact
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','complete','error')),
  tokens_used   INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE generation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "generation_results_own" ON generation_results
  FOR ALL USING (user_id = auth.uid());

-- Monthly generation count for free plan enforcement
CREATE OR REPLACE FUNCTION get_monthly_generation_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM generation_results
  WHERE user_id = p_user_id
    AND status = 'complete'
    AND created_at >= DATE_TRUNC('month', NOW());
$$ LANGUAGE SQL SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6 — CONTENT ITEMS (saved artifacts)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id        UUID REFERENCES brands(id) ON DELETE SET NULL,
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  generation_id   UUID REFERENCES generation_results(id) ON DELETE SET NULL,
  platform        TEXT NOT NULL,
  content_type    TEXT NOT NULL DEFAULT 'post',
  copy            TEXT NOT NULL,
  caption         TEXT,
  hashtags        TEXT[] NOT NULL DEFAULT '{}',
  alt_text        TEXT,
  image_url       TEXT,
  image_prompt    TEXT,
  ad_headline     TEXT,
  ad_description  TEXT,
  character_count INTEGER NOT NULL DEFAULT 0,
  score           INTEGER CHECK (score BETWEEN 0 AND 100),
  optimized       BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','scheduled','published','failed','archived')),
  reported        BOOLEAN NOT NULL DEFAULT FALSE,
  report_reason   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_items_own" ON content_items
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7 — SCHEDULED POSTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id          UUID REFERENCES brands(id) ON DELETE SET NULL,
  content_item_id   UUID REFERENCES content_items(id) ON DELETE SET NULL,
  platform          TEXT NOT NULL,
  content           TEXT NOT NULL,
  hashtags          TEXT[] NOT NULL DEFAULT '{}',
  alt_text          TEXT,
  media_urls        TEXT[] NOT NULL DEFAULT '{}',
  scheduled_for     TIMESTAMPTZ NOT NULL,
  published_at      TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'scheduled'
                      CHECK (status IN ('scheduled','publishing','published','failed','cancelled')),
  retry_count       INTEGER NOT NULL DEFAULT 0,
  max_retries       INTEGER NOT NULL DEFAULT 3,
  error_message     TEXT,
  external_post_id  TEXT,    -- ID returned by the social platform
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_scheduled_posts_user_date
  ON scheduled_posts (user_id, scheduled_for);

CREATE INDEX idx_scheduled_posts_pending
  ON scheduled_posts (status, scheduled_for)
  WHERE status = 'scheduled';

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scheduled_posts_own" ON scheduled_posts
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8 — PLATFORM CONNECTIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS platform_connections (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform               TEXT NOT NULL
                           CHECK (platform IN ('facebook','instagram','twitter','linkedin','tiktok','youtube','pinterest','snapchat')),
  account_id             TEXT NOT NULL,
  account_name           TEXT,
  account_handle         TEXT,
  avatar_url             TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at       TIMESTAMPTZ,
  scopes                 TEXT[] NOT NULL DEFAULT '{}',
  is_active              BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at         TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, platform)
);

CREATE TRIGGER platform_connections_updated_at
  BEFORE UPDATE ON platform_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_connections_own" ON platform_connections
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9 — SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  plan_id                 TEXT NOT NULL DEFAULT 'free'
                            CHECK (plan_id IN ('free','pro','enterprise')),
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  status                  TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','trialing','past_due','canceled','unpaid','paused')),
  interval                TEXT NOT NULL DEFAULT 'monthly'
                            CHECK (interval IN ('monthly','annual')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at             TIMESTAMPTZ,
  trial_end               TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_own" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "subscriptions_service_write" ON subscriptions
  FOR ALL USING (TRUE)
  WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10 — ACHIEVEMENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_achievements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  xp_awarded   INTEGER NOT NULL DEFAULT 0,
  unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, key)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_own" ON user_achievements
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11 — USAGE EVENTS (for analytics + XP audit trail)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  platform    TEXT,
  metadata    JSONB,
  xp_awarded  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_events_user_type
  ON usage_events (user_id, event_type, created_at DESC);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_events_own" ON usage_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "usage_events_service_insert" ON usage_events
  FOR INSERT WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12 — NOTIFICATION PREFERENCES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notification_preferences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  post_published  BOOLEAN NOT NULL DEFAULT TRUE,
  post_failed     BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_report   BOOLEAN NOT NULL DEFAULT TRUE,
  ai_insights     BOOLEAN NOT NULL DEFAULT TRUE,
  billing_alerts  BOOLEAN NOT NULL DEFAULT TRUE,
  new_features    BOOLEAN NOT NULL DEFAULT FALSE,
  push_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences_own" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 13 — ANALYTICS SNAPSHOTS
-- Stored daily by the fetchMetrics worker for historical charts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,
  date            DATE NOT NULL,
  impressions     BIGINT NOT NULL DEFAULT 0,
  reach           BIGINT NOT NULL DEFAULT 0,
  engagements     BIGINT NOT NULL DEFAULT 0,
  clicks          BIGINT NOT NULL DEFAULT 0,
  followers       INTEGER NOT NULL DEFAULT 0,
  follower_delta  INTEGER NOT NULL DEFAULT 0,
  posts_published INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, platform, date)
);

CREATE INDEX idx_analytics_snapshots_user_date
  ON analytics_snapshots (user_id, date DESC);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_snapshots_own" ON analytics_snapshots
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 14 — DATA EXPORT REQUESTS (GDPR Article 20)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS data_export_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','processing','complete','failed')),
  download_url TEXT,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_export_own" ON data_export_requests
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 15 — CONTENT REPORTS (Apple 1.2 / Google AI Policy)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_item_id   UUID REFERENCES content_items(id) ON DELETE SET NULL,
  generation_id     UUID REFERENCES generation_results(id) ON DELETE SET NULL,
  platform          TEXT,
  reason            TEXT NOT NULL,
  artifact_sna
-- ── user_progress ──────────────────────────
create table if not exists user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade unique,
  level int not null default 1,
  xp int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── campaigns ──────────────────────────────
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  name text not null,
  objective text not null default '',
  status text not null default 'draft',
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── campaign_channels ──────────────────────
create table if not exists campaign_channels (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  channel text not null
);

-- ── campaign_metrics ───────────────────────
create table if not exists campaign_metrics (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  impressions int default 0,
  reach int default 0,
  clicks int default 0,
  conversions int default 0,
  spend numeric(12,2) default 0,
  roas numeric(8,2) default 0,
  updated_at timestamptz default now()
);

-- ── content_items ──────────────────────────
create table if not exists content_items (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  channel text not null,
  type text not null default 'post',
  title text not null,
  status text not null default 'draft',
  scheduled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── content_variants ───────────────────────
create table if not exists content_variants (
  id uuid primary key default uuid_generate_v4(),
  content_id uuid references content_items(id) on delete cascade,
  copy text not null,
  media_url text,
  created_at timestamptz default now()
);

-- ── content_status_history ─────────────────
create table if not exists content_status_history (
  id uuid primary key default uuid_generate_v4(),
  content_id uuid references content_items(id) on delete cascade,
  status text not null,
  changed_at timestamptz default now(),
  changed_by uuid references users(id) on delete set null
);

-- ── tasks ──────────────────────────────────
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  content_id uuid references content_items(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'todo',
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── task_dependencies ──────────────────────
create table if not exists task_dependencies (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  depends_on_task_id uuid references tasks(id) on delete cascade
);

-- ── task_activity_log ──────────────────────
create table if not exists task_activity_log (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  timestamp timestamptz default now()
);

-- ── task_suggestions ───────────────────────
create table if not exists task_suggestions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  suggestion_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ── metrics_raw ────────────────────────────
create table if not exists metrics_raw (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  provider text not null,
  external_id text,
  payload jsonb not null default '{}',
  fetched_at timestamptz default now()
);

-- ── metrics_aggregated ─────────────────────
create table if not exists metrics_aggregated (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  content_id uuid references content_items(id) on delete set null,
  channel text not null,
  date date not null,
  impressions int default 0,
  reach int default 0,
  clicks int default 0,
  conversions int default 0,
  spend numeric(12,2) default 0,
  roas numeric(8,2) default 0,
  created_at timestamptz default now()
);

-- ── integrations ───────────────────────────
create table if not exists integrations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  provider text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(workspace_id, provider)
);

-- ── unlocks ────────────────────────────────
create table if not exists unlocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  scene_key text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, scene_key)
);

-- ── achievements ───────────────────────────
create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  achievement text not null,
  unlocked_at timestamptz default now()
);

-- ── cosmetics ──────────────────────────────
create table if not exists cosmetics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  item_key text not null,
  unlocked_at timestamptz default now()
);

-- ── lootboxes ──────────────────────────────
create table if not exists lootboxes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  opened boolean not null default false,
  contents jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ── generations ────────────────────────────
create table if not exists generations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  brief jsonb not null default '{}',
  artifacts jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ── password_reset_tokens ──────────────────
create table if not exists password_reset_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- ── notifications ──────────────────────────
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  priority text not null default 'routine',
  read boolean not null default false,
  created_at timestamptz default now()
);

-- ── ai_insights ────────────────────────────
create table if not exists ai_insights (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  insight text not null,
  created_at timestamptz default now()
);

-- ── Row Level Security ──────────────────────
-- Users can only access their own workspace data
alter table users enable row level security;
alter table workspaces enable row level security;
alter table brands enable row level security;
alter table user_progress enable row level security;
alter table campaigns enable row level security;
alter table campaign_channels enable row level security;
alter table campaign_metrics enable row level security;
alter table content_items enable row level security;
alter table content_variants enable row level security;
alter table content_status_history enable row level security;
alter table tasks enable row level security;
alter table integrations enable row level security;
alter table unlocks enable row level security;
alter table achievements enable row level security;
alter table notifications enable row level security;
alter table generations enable row level security;
alter table ai_insights enable row level security;

-- Service role bypasses RLS (used by backend)
-- Anon/authenticated policies can be added here as needed
