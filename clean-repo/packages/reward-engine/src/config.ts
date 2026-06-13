// ─────────────────────────────────────────────────────────────────────────────
// REWARD ENGINE — CONFIGURATION
// XP values, level thresholds, departments, achievements.
// All values here are tuned for mobile SaaS retention.
// ─────────────────────────────────────────────────────────────────────────────

import type { EventType, Department, Achievement } from './types';

// ── XP awarded per event ─────────────────────────────────────────────────────
// Values are deliberately generous early on to create momentum.
// Research shows the first 48 hours of app use determines 30-day retention.
export const XP_VALUES: Record<EventType, number> = {
  content_generated:        10,
  post_published:           25,
  post_scheduled:           15,
  campaign_created:         20,
  brand_created:            30,
  platform_connected:       40,
  daily_login:               5,
  streak_continued:         10,
  artifact_saved:            8,
  first_generation:         50,   // One-time bonus — first-time magic moment
  first_publish:            75,   // One-time bonus — first real post live
  five_posts_published:     60,
  ten_posts_published:     100,
  first_platform_connected: 50,
  all_platforms_connected: 150,
  profile_completed:        40,
};

// ── Level thresholds ──────────────────────────────────────────────────────────
// Level 1-3 unlocks happen quickly (first session) to create momentum.
// Later levels require sustained engagement.
export const LEVEL_THRESHOLDS: number[] = [
  0,     // Level 1 starts here
  100,   // Level 2 — unlocked by first_generation + daily_login + brand
  300,   // Level 3 — unlocked after ~3 content pieces
  600,   // Level 4 — active user, multiple platforms
  1000,  // Level 5 — power user
  1500,  // Level 6
  2200,  // Level 7
  3000,  // Level 8
  4000,  // Level 9
  5500,  // Level 10 — CMO status
];

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPProgress(xp: number): {
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  percentToNext: number;
} {
  const level = getLevelFromXP(xp);
  if (level >= MAX_LEVEL) {
    return { level, xpInLevel: 0, xpToNextLevel: 0, percentToNext: 100 };
  }
  const current = LEVEL_THRESHOLDS[level - 1];
  const next    = LEVEL_THRESHOLDS[level];
  const xpInLevel   = xp - current;
  const xpToNextLevel = next - current;
  const percentToNext = Math.min(100, Math.round((xpInLevel / xpToNextLevel) * 100));
  return { level, xpInLevel, xpToNextLevel, percentToNext };
}

// ── Department definitions ────────────────────────────────────────────────────
export const DEPARTMENTS: Omit<Department, 'unlocked'>[] = [
  {
    key: 'brand_identity_chamber',
    label: 'Brand Identity Chamber',
    description: 'Define your brand voice, values, and visual identity.',
    icon: '🏛️',
    requiredLevel: 1,
    scene: 'brand-identity',
  },
  {
    key: 'audience_arena',
    label: 'Audience Arena',
    description: 'Build and understand your target audience profiles.',
    icon: '🎯',
    requiredLevel: 1,
    scene: 'audience-arena',
  },
  {
    key: 'content_forge',
    label: 'Content Forge',
    description: 'AI-powered content generation for every platform.',
    icon: '⚡',
    requiredLevel: 1,
    scene: 'content-forge',
  },
  {
    key: 'tone_lab',
    label: 'Tone Lab',
    description: 'Fine-tune your brand voice across platforms and campaigns.',
    icon: '🎨',
    requiredLevel: 2,
    scene: 'tone-lab',
  },
  {
    key: 'artifact_vault',
    label: 'Artifact Vault',
    description: 'Your library of saved, published and archived content.',
    icon: '🗄️',
    requiredLevel: 2,
    scene: 'artifact-vault',
  },
  {
    key: 'scheduler_tower',
    label: 'Scheduler Tower',
    description: 'Queue and auto-publish content across all platforms.',
    icon: '🗓️',
    requiredLevel: 2,
    scene: 'scheduler-tower',
  },
  {
    key: 'analytics_observatory',
    label: 'Analytics Observatory',
    description: 'Deep performance insights across every platform.',
    icon: '📊',
    requiredLevel: 3,
    scene: 'observatory',
  },
  {
    key: 'ppc_command_center',
    label: 'PPC Command Center',
    description: 'Paid advertising management across Google and Meta.',
    icon: '💰',
    requiredLevel: 4,
    scene: 'ppc-command',
  },
  {
    key: 'multiverse_gate',
    label: 'Multiverse Gate',
    description: 'Cross-platform content adaptation and syndication.',
    icon: '🌐',
    requiredLevel: 5,
    scene: 'multiverse-gate',
  },
];

// ── Achievement definitions ───────────────────────────────────────────────────
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id:          'first-generation',
    key:         'first_generation',
    title:       'First Spark',
    description: 'Generated your first piece of AI content.',
    xpReward:    50,
    icon:        '⚡',
  },
  {
    id:          'first-publish',
    key:         'first_publish',
    title:       'Live on Air',
    description: 'Published your first post to a social platform.',
    xpReward:    75,
    icon:        '🚀',
  },
  {
    id:          'five-posts',
    key:         'five_posts_published',
    title:       'Content Machine',
    description: 'Published 5 posts across your platforms.',
    xpReward:    60,
    icon:        '🔥',
  },
  {
    id:          'ten-posts',
    key:         'ten_posts_published',
    title:       'Power Publisher',
    description: 'Published 10 posts. You are building momentum.',
    xpReward:    100,
    icon:        '💪',
  },
  {
    id:          'first-platform',
    key:         'first_platform_connected',
    title:       'Connected',
    description: 'Connected your first social platform.',
    xpReward:    50,
    icon:        '🔗',
  },
  {
    id:          'all-platforms',
    key:         'all_platforms_connected',
    title:       'Omni-Channel',
    description: 'Connected all 5 active social platforms.',
    xpReward:    150,
    icon:        '🌐',
  },
  {
    id:          'profile-complete',
    key:         'profile_completed',
    title:       'Identity Established',
    description: 'Completed your brand identity profile.',
    xpReward:    40,
    icon:        '🏛️',
  },
];

// ── Streak milestone days ─────────────────────────────────────────────────────
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];
