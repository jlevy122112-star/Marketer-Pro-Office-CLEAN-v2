// ─────────────────────────────────────────────────────────────────────────────
// REWARD ENGINE — TYPES
// XP, levels, departments, achievements, streaks.
// This is the retention backbone of the entire app.
// ─────────────────────────────────────────────────────────────────────────────

export type DepartmentKey =
  | 'brand_identity_chamber'
  | 'audience_arena'
  | 'content_forge'
  | 'tone_lab'
  | 'artifact_vault'
  | 'scheduler_tower'
  | 'analytics_observatory'
  | 'ppc_command_center'
  | 'multiverse_gate';

export type EventType =
  | 'content_generated'
  | 'post_published'
  | 'post_scheduled'
  | 'campaign_created'
  | 'brand_created'
  | 'platform_connected'
  | 'daily_login'
  | 'streak_continued'
  | 'artifact_saved'
  | 'first_generation'
  | 'first_publish'
  | 'five_posts_published'
  | 'ten_posts_published'
  | 'first_platform_connected'
  | 'all_platforms_connected'
  | 'profile_completed';

export interface XPEvent {
  type:      EventType;
  xp:        number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface Achievement {
  id:          string;
  key:         EventType;
  title:       string;
  description: string;
  xpReward:    number;
  icon:        string;
  unlockedAt?: string;
  unlocked:    boolean;
}

export interface Department {
  key:         DepartmentKey;
  label:       string;
  description: string;
  icon:        string;
  requiredLevel: number;
  unlocked:    boolean;
  scene?:      string; // route or scene key to navigate to
}

export interface StreakData {
  currentStreak:  number;
  longestStreak:  number;
  lastActiveDate: string | null;
  streakActive:   boolean;
}

export interface OfficeState {
  userId:       string;
  xp:           number;
  level:        number;
  xpInLevel:    number;   // XP earned within the current level
  xpToNextLevel:number;   // XP needed to reach next level
  percentToNext:number;   // 0-100
  departments:  Department[];
  achievements: Achievement[];
  streak:       StreakData;
  totalPosts:   number;
  totalGenerations: number;
}

export interface RewardEngineCallbacks {
  /** Called when a level-up occurs — host app shows celebration UI */
  onLevelUp?: (newLevel: number, unlockedDepartments: Department[]) => void;
  /** Called when an achievement is earned */
  onAchievement?: (achievement: Achievement) => void;
  /** Called when a streak milestone is hit (7, 30, 100 days) */
  onStreakMilestone?: (days: number) => void;
}
