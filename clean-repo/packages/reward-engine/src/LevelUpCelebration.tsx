'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL UP CELEBRATION
// Full-screen modal shown when the user earns a new level.
// Shows newly unlocked departments. Disappears on tap.
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Department } from './types';

interface LevelUpCelebrationProps {
  level:               number;
  unlockedDepartments: Department[];
  onDismiss:           () => void;
}

export function LevelUpCelebration({
  level, unlockedDepartments, onDismiss,
}: LevelUpCelebrationProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      role="dialog"
      aria-label={`Level up — you reached level ${level}`}
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(6,9,18,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 24, padding: 32,
      }}
    >
      {/* Glow burst */}
      {!reduce && (
        <motion.div
          aria-hidden
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.8, 1], opacity: [0, 0.6, 0] }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.5) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <motion.div
        initial={reduce ? {} : { scale: 0.5, opacity: 0 }}
        animate={reduce ? {} : { scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <motion.div
          animate={reduce ? {} : { rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ fontSize: 64, marginBottom: 16 }}
          aria-hidden
        >
          🏆
        </motion.div>

        <p style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 10,
          letterSpacing: '0.5em', textTransform: 'uppercase',
          color: 'rgba(201,168,76,0.6)', marginBottom: 8,
        }}>
          Level Up
        </p>

        <p style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800,
          fontSize: 64, letterSpacing: '-2px', lineHeight: 1,
          background: 'linear-gradient(135deg,#C9A84C 0%,#E8C54E 50%,#9d7c2e 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {level}
        </p>

        {level === 10 && (
          <p style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginTop: 8,
          }}>
            CMO Status Achieved
          </p>
        )}
      </motion.div>

      {/* Newly unlocked departments */}
      {unlockedDepartments.length > 0 && (
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 16 }}
          animate={reduce ? {} : { opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ width: '100%', maxWidth: 320, position: 'relative', zIndex: 1 }}
        >
          <p style={{
            fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700,
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.5)', marginBottom: 10, textAlign: 'center',
          }}>
            Departments Unlocked
          </p>
          {unlockedDepartments.map((dept, i) => (
            <motion.div
              key={dept.key}
              initial={reduce ? {} : { opacity: 0, x: -16 }}
              animate={reduce ? {} : { opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 14, marginBottom: 8,
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.25)',
              }}
            >
              <span style={{ fontSize: 22 }} aria-hidden>{dept.icon}</span>
              <div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#fff' }}>
                  {dept.label}
                </p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {dept.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.p
        initial={reduce ? {} : { opacity: 0 }}
        animate={reduce ? {} : { opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
        style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: 12,
          color: 'rgba(255,255,255,0.3)', position: 'relative', zIndex: 1,
        }}
      >
        Tap anywhere to continue
      </motion.p>
    </motion.div>
  );
}
