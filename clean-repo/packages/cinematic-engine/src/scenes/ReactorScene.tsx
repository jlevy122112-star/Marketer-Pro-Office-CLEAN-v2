'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ACT II — REACTOR CONTROL SCENE
// 3 switches arm sequentially → lever pull → reactor fires.
// Audit upgrades applied:
//   - Haptic tick on every switch toggle
//   - Sequential unlock (engine enforces this; UI reflects locked state)
//   - "PULL TO GENERATE" animates in with anticipation
//   - Lever ball is the only interactive element (rod/base are visual)
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCallback } from 'react';
import { haptic } from '../haptics';
import {
  canToggleSwitch,
  allSwitchesArmed,
  REACTOR_SWITCH_ORDER,
} from '../stateMachine';
import type { ReactorSwitchKey, ReactorSwitchState } from '../types';

interface ReactorSceneProps {
  switches:       ReactorSwitchState;
  isGenerating:   boolean;
  onToggleSwitch: (key: ReactorSwitchKey) => void;
  onPullLever:    () => void;
}

const SWITCH_LABELS: Record<ReactorSwitchKey, string> = {
  brand:    'Brand Intel',
  audience: 'Audience',
  ai_core:  'AI Core',
};

export default function ReactorScene({
  switches, isGenerating, onToggleSwitch, onPullLever,
}: ReactorSceneProps) {
  const reduce = useReducedMotion();
  const armedCount = REACTOR_SWITCH_ORDER.filter((k) => switches[k]).length;
  const allArmed   = allSwitchesArmed(switches);
  const glowIntensity = armedCount / REACTOR_SWITCH_ORDER.length; // 0 → 1

  const handleToggle = useCallback(async (key: ReactorSwitchKey) => {
    if (isGenerating || !canToggleSwitch(switches, key)) return;
    await haptic('light');
    onToggleSwitch(key);
  }, [switches, isGenerating, onToggleSwitch]);

  const handlePull = useCallback(async () => {
    if (!allArmed || isGenerating) return;
    await haptic('heavy');
    onPullLever();
  }, [allArmed, isGenerating, onPullLever]);

  return (
    <motion.div
      role="dialog"
      aria-label="Reactor Control — arm systems and generate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#03050A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 40, overflow: 'hidden', padding: 24,
      }}
    >
      {/* Reactor core glow — intensifies with armed count */}
      <motion.div
        aria-hidden
        animate={{
          opacity: 0.15 + glowIntensity * 0.45,
          scale: isGenerating ? [1, 1.4, 1] : 1 + glowIntensity * 0.2,
        }}
        transition={
          isGenerating
            ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.5 }
        }
        style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          background: `radial-gradient(circle, ${isGenerating ? 'rgba(110,231,183,0.5)' : 'rgba(110,231,183,0.35)'} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Fire flash on generation */}
      <AnimatePresence>
        {isGenerating && !reduce && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle, rgba(201,168,76,0.25) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <p style={{
        fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11,
        letterSpacing: '0.35em', textTransform: 'uppercase',
        color: 'rgba(201,168,76,0.6)', textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        {isGenerating ? 'GENERATING…' : 'ARM SYSTEMS'}
      </p>

      {/* Switch panel */}
      <div style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}>
        {REACTOR_SWITCH_ORDER.map((key) => {
          const armed  = switches[key];
          const locked = !canToggleSwitch(switches, key);
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => handleToggle(key)}
                disabled={locked || isGenerating}
                role="switch"
                aria-checked={armed}
                aria-label={SWITCH_LABELS[key]}
                style={{
                  width: 44, height: 80, borderRadius: 22,
                  border: `1.5px solid ${armed ? 'rgba(110,231,183,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  background: armed ? 'rgba(110,231,183,0.1)' : 'rgba(255,255,255,0.03)',
                  cursor: locked || isGenerating ? 'not-allowed' : 'pointer',
                  opacity: locked ? 0.35 : 1,
                  position: 'relative',
                  transition: 'all 0.3s',
                  padding: 4,
                }}
              >
                <motion.div
                  animate={{ y: armed ? 0 : 36 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  style={{
                    width: 32, height: 32, borderRadius: 16,
                    background: armed
                      ? 'linear-gradient(135deg,#6EE7B7,#10B981)'
                      : 'rgba(255,255,255,0.15)',
                    boxShadow: armed ? '0 0 16px rgba(110,231,183,0.5)' : 'none',
                  }}
                />
              </button>
              <span style={{
                fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: armed ? '#6EE7B7' : locked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
              }}>
                {SWITCH_LABELS[key]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Lever */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <motion.button
          onClick={handlePull}
          disabled={!allArmed || isGenerating}
          aria-label="Pull lever to generate content"
          whileHover={allArmed && !isGenerating ? { scale: 1.1 } : {}}
          whileTap={allArmed && !isGenerating ? { scale: 0.9 } : {}}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            cursor: allArmed && !isGenerating ? 'pointer' : 'not-allowed',
            background: allArmed
              ? 'radial-gradient(circle at 35% 35%, #E8C54E, #9d7c2e)'
              : 'rgba(255,255,255,0.12)',
            border: 'none',
            boxShadow: allArmed ? '0 0 28px rgba(201,168,76,0.6)' : 'none',
          }}
        />
        {/* Rod — visual only */}
        <motion.div
          aria-hidden
          animate={isGenerating ? { rotate: 50 } : { rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            width: 10, height: 56, borderRadius: 5,
            background: allArmed ? 'linear-gradient(180deg,#C9A84C,#9d7c2e)' : 'rgba(255,255,255,0.1)',
            transformOrigin: 'bottom center',
            pointerEvents: 'none',
            marginTop: -4,
          }}
        />
        {/* Base — visual only */}
        <div aria-hidden style={{
          width: 50, height: 12, borderRadius: 6,
          background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
        }} />
      </div>

      {/* PULL TO GENERATE prompt */}
      <AnimatePresence>
        {allArmed && !isGenerating && (
          <motion.p
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{
              opacity: reduce ? 1 : [0.6, 1, 0.6],
              y: 0, scale: 1,
              textShadow: reduce ? 'none' : [
                '0 0 10px rgba(201,168,76,0.3)',
                '0 0 20px rgba(201,168,76,0.7)',
                '0 0 10px rgba(201,168,76,0.3)',
              ],
            }}
            transition={{ duration: 1.5, repeat: reduce ? 0 : Infinity }}
            style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11,
              letterSpacing: '0.35em', textTransform: 'uppercase',
              color: '#C9A84C', position: 'relative', zIndex: 1,
            }}
          >
            ▼ PULL TO GENERATE ▼
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
        }  );
};
