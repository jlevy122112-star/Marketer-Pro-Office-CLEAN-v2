// ─────────────────────────────────────────────────────────────────────────────
// REWARD ENGINE — PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export { useOfficeEvolution } from './useOfficeEvolution';

export { LevelUpCelebration } from './LevelUpCelebration';
export { AchievementToast }   from './AchievementToast';
export { XPBar }               from './XPBar';
export { StreakBadge }         from './StreakBadge';
export { DepartmentGrid }      from './DepartmentGrid';

export {
  DEPARTMENTS,
  ACHIEVEMENT_DEFINITIONS,
  LEVEL_THRESHOLDS,
  STREAK_MILESTONES,
  XP_VALUES,
  getLevelFromXP,
  getXPProgress,
} from './config';

export type {
  OfficeState,
  EventType,
  Achievement,
  Department,
  DepartmentKey,
  StreakData,
  XPEvent,
  RewardEngineCallbacks,
} from './types';
export { useOfficeEvolution } from './useOfficeEvolution';
export type { OfficeState } from './useOfficeEvolution';
