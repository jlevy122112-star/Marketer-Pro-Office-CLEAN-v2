'use client';

// ─────────────────────────────────────────────────────────────────────────────
// STREAK BADGE
// Shows the user's current daily login streak.
// Pulses gold when the streak is active today.
// ─────────────────────────────────────────────────────────────────────────────

import { motion, useReducedMotion } from 'framer-motion';
import type { StreakData } from './types';

interface StreakBadgeProps {
  streak: StreakData;
  size?:  'sm' | 'md';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const reduce = useReducedMotion();
  const isSmall = size === 'sm';

  if (streak.currentStreak === 0) return null;

  return (
    <motion.div
      animate={
        streak.streakActive && !reduce
          ? { boxShadow: ['0 0 0px rgba(201,168,76,0)', '0 0 18px rgba(201,168,76,0.45)', '0 0 0px rgba(201,168,76,0)'] }
          : {}
      }
      transition={{ duration: 2, repeat: Infinity }}
      role="status"
      aria-label={`${streak.currentStreak} day streak`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: isSmall ? 5 : 7,
        padding: isSmall ? '4px 10px' : '6px 14px', borderRadius: 20,
        background: streak.streakActive
          ? 'rgba(201,168,76,0.12)'
          : 'rgba(255,255,255,0.05)',
        border: `1px solid ${streak.streakActive ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <span aria-hidden style={{ fontSize: isSmall ? 12 : 15 }}>🔥</span>
      <span style={{
        fontFamily: "'Syne',sans-serif", fontWeight: 700,
        fontSize: isSmall ? 11 : 13,
        color: streak.streakActive ? '#C9A84C' : 'rgba(255,255,255,0.4)',
      }}>
        {streak.currentStreak}d
      </span>
    </motion.div>
  );
}
