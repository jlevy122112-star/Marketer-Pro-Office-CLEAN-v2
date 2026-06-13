'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENT TOAST
// Non-blocking bottom notification when an achievement is earned.
// Auto-dismisses after 4 seconds. Matches the dark/gold design system.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Achievement } from './types';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss:   () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!achievement) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label={`Achievement unlocked: ${achievement.title}`}
          initial={reduce ? {} : { y: 80, opacity: 0 }}
          animate={reduce ? {} : { y: 0, opacity: 1 }}
          exit={reduce ? {} : { y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={onDismiss}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)',
            left: 16, right: 16,
            zIndex: 400,
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', borderRadius: 18,
            background: 'rgba(10,14,28,0.97)',
            border: '1px solid rgba(201,168,76,0.35)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.08)',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.05))',
            border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }} aria-hidden>
            {achievement.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700,
              letterSpacing: '0.35em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.65)', marginBottom: 3,
            }}>
              Achievement Unlocked
            </p>
            <p style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14,
              color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {achievement.title}
            </p>
            <p style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: 12,
              color: 'rgba(255,255,255,0.4)', marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {achievement.description}
            </p>
          </div>
          <div style={{
            flexShrink: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'flex-end', gap: 4,
          }}>
            <span style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15,
              color: '#C9A84C',
            }}>
              +{achievement.xpReward}
            </span>
            <span style={{
              fontFamily: "'Syne',sans-serif", fontSize: 8, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)',
            }}>
              XP
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
