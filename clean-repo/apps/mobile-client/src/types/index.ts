// FILE PATH: src/types/index.ts
import type { PlatformId, PlanId, ContentType } from '../lib/constants';

// ── User ──────────────────────────────────────────────────────
export interface User {
  id:                 string;
  email:              string;
  displayName:        string;
  avatarUrl?:         string;
  planId:             PlanId;
  xp:                 number;
  level:              number;
  onboardingComplete: boolean;
  createdAt:          string;
}

// ── Brand ─────────────────────────────────────────────────────
export interface Brand {
  id:             string;
  userId:         string;
  name:           string;
  tagline?:       string;
  logoUrl?:       string;
  primaryColor:   string;
  secondaryColor: string;
  tone:           BrandTone;
  targetAudience: string;
  industry:       string;
  platforms:      PlatformId[];
  createdAt:      string;
  updatedAt:      string;
}

export type BrandTone =
  | 'professional'
  | 'casual'
  | 'playful'
  | 'authoritative'
  | 'inspirational'
  | 'luxury'
  | 'witty';

// ── Content generation ────────────────────────────────────────
export interface GenerationRequest {
  brandId:          string;
  prompt:           string;
  contentType:      ContentType;
  platforms:        PlatformId[];
  tone?:            BrandTone;
  includeHashtags?: boolean;
  includeAltText?:  boolean;
  includeAdCopy?:   boolean;
}

export interface GeneratedArtifact {
  id:            string;
  platform:      PlatformId;
  contentType:   ContentType;
  copy:          string;
  caption?:      string;
  hashtags?:     string[];
  altText?:      string;
  adHeadline?:   string;
  adDescription?: string;
  imagePrompt?:  string;
  characterCount: number;
  optimized:     boolean;
  score?:        number;
}

export interface GenerationResult {
  id:        string;
  brandId:   string;
  prompt:    string;
  artifacts: GeneratedArtifact[];
  status:    'complete' | 'partial' | 'failed';
  createdAt: string;
}

// ── Scheduled posts ───────────────────────────────────────────
export interface ScheduledPost {
  id:           string;
  brandId:      string;
  artifactId:   string;
  platform:     PlatformId;
  content:      string;
  mediaUrls?:   string[];
  scheduledFor: string;
  status:       'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  publishedAt?:  string;
  errorMessage?: string;
  createdAt:    string;
}

// ── Campaigns ─────────────────────────────────────────────────
export interface Campaign {
  id:          string;
  userId:      string;
  brandId:     string;
  name:        string;
  description: string;
  objective:   CampaignObjective;
  startDate:   string;
  endDate?:    string;
  platforms:   PlatformId[];
  status:      'draft' | 'active' | 'paused' | 'completed';
  kpis:        CampaignKPI[];
  createdAt:   string;
  updatedAt:   string;
}

export type CampaignObjective =
  | 'brand_awareness'
  | 'lead_generation'
  | 'engagement'
  | 'conversions'
  | 'traffic';

export interface CampaignKPI {
  metric: string;
  target: number;
  current: number;
}

// ── Analytics ─────────────────────────────────────────────────
export interface AnalyticsSummary {
  totalImpressions:  number;
  totalEngagements:  number;
  totalClicks:       number;
  engagementRate:    number;
  followerGrowth:    number;
  followerGrowthPct: number;
}

export interface PlatformMetric {
  platform:       string;
  impressions:    number;
  engagements:    number;
  clicks:         number;
  followers:      number;
  engagementRate: number;
  color:          string;
}

export interface ContentMetric {
  contentId:      string;
  platform:       string;
  impressions:    number;
  engagements:    number;
  clicks:         number;
  engagementRate: number;
}

export interface GrowthPoint {
  date:      string;
  followers: number;
  delta:     number;
}

// ── Billing ───────────────────────────────────────────────────
export interface Subscription {
  id:                string;
  userId:            string;
  planId:            PlanId;
  status:            'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  interval:          'monthly' | 'annual';
  currentPeriodEnd:  string;
  cancelAtPeriodEnd: boolean;
  trialEnd?:         string;
}

// ── Cinematic engine ──────────────────────────────────────────
// FIX: was missing 'vault_open' — caused CinematicEngine to skip reactor
// All states the reducer emits are now listed here
export type CinematicState =
  | 'idle'
  | 'vault_intro'
  | 'vault_open'      // ← was missing from original
  | 'reactor_arm'
  | 'reactor_fire'    // ← was missing from original
  | 'generating'
  | 'presentation'
  | 'artifact_select'
  | 'error';

export interface CinematicContext {
  request?:   GenerationRequest;
  result?:    GenerationResult;
  error?:     string;
  startedAt?: number;
}

// ── Toast ─────────────────────────────────────────────────────
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'gold';

export interface Toast {
  id:           string;
  variant:      ToastVariant;
  title:        string;
  description?: string;
  }
// ─── Platform ──────────────────────────────────────────────────────────────
export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'linkedin'
  | 'x';

// ─── Campaign ──────────────────────────────────────────────────────────────
export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  color: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'paused' | 'completed' | 'draft';
}

// ─── Planner Task ──────────────────────────────────────────────────────────
export interface PlannerTask {
  id: string;
  brandId: string;
  campaignId: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  platform: SocialPlatform | null;
  createdAt: string;
}

// ─── Calendar Post ─────────────────────────────────────────────────────────
export interface CalendarPost {
  id: string;
  brandId: string;
  campaignId: string | null;
  scheduledAt: string;
  status: 'scheduled' | 'sent' | 'draft' | 'failed';
  platform: SocialPlatform;
  caption: string | null;
  imageUrls: string[];
  hashtags: string[];
}

// ─── Content Generation ────────────────────────────────────────────────────
export interface GenerationRequest {
  brandId: string;
  audienceId: string | null;
  tone: BrandTone;
  platforms: SocialPlatform[];
  goals: string[];
  contentType: 'post' | 'story' | 'reel' | 'ad' | 'email';
  topic: string;
  keywords: string[];
}

export interface GenerationResult {
  id: string;
  copy: string[];
  images: string[];
  captions: string[];
  hashtags: string[];
  variations: string[];
  generatedAt: string;
}

// ─── Progression / Rewards ─────────────────────────────────────────────────
export interface UserProgression {
  userId: string;
  totalXp: number;
  level: number;
  prestigeRank: number;
  currentStreak: number;
  longestStreak: number;
  generationsCount: number;
  updatedAt: string;
}

export interface OfficeState {
  userId: string;
  level: number;
  generationsCount: number;
  prestigeRank: number;
  cosmetics: Record<string, string>;
  unlockedScenes: string[];
  updatedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  achievementKey: string;
  title: string;
  description: string;
  iconUrl: string | null;
  unlockedAt: string;
}

export interface LootboxReward {
  type: 'cosmetic' | 'xp_boost' | 'scene_unlock' | 'template' | 'badge';
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: string | number;
}

// ─── Scene ─────────────────────────────────────────────────────────────────
export type SceneId =
  | 'brand_identity_chamber'
  | 'audience_arena'
  | 'content_forge'
  | 'artifact_vault'
  | 'scheduler_tower'
  | 'observatory'
  | 'creator_hub'
  | 'prestige_sanctum'
  | 'archive_depths'
  | 'command_bridge';

export interface SceneProgress {
  sceneId: SceneId;
  userId: string;
  isUnlocked: boolean;
  completionPercent: number;
  lastVisited: string | null;
}

// ─── Analytics ─────────────────────────────────────────────────────────────
export interface AnalyticsSummary {
  totalPosts: number;
  totalReach: number;
  avgEngagementRate: number;
  topPlatform: SocialPlatform;
  growthPercent: number;
  period: '7d' | '30d' | '90d';
}

// ─── API Response ──────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
