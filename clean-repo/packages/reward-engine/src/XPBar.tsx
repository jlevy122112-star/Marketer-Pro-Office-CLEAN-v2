'use client';

// ─────────────────────────────────────────────────────────────────────────────
// XP BAR
// Compact progress bar used in the Desk header and Settings profile card.
// Shows level, current XP progress, and animates on XP gain.
// ─────────────────────────────────────────────────────────────────────────────

import { motion, useReducedMotion } from 'framer-motion';
import type { OfficeState } from './types';

interface XPBarProps {
  state:    OfficeState | null;
  compact?: boolean; // compact=true for header, compact=false for profile card
}

export function XPBar({ state, compact = true }: XPBarProps) {
  const reduce = useReducedMotion();

  if (!state) return null;

  if (compact) {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}
        role="progressbar"
        aria-valuenow={state.percentToNext}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Level ${state.level}, ${state.xpInLevel} of ${state.xpToNextLevel} XP to next level`}
      >
        <p style={{
          fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(201,168,76,0.55)',
        }}>
          LVL {state.level}
        </p>
        <div style={{
          width: 72, height: 3, borderRadius: 2,
          background: 'rgba(255,255,255,0.08)',
        }}>
          <motion.div
            initial={reduce ? {} : { width: 0 }}
            animate={{ width: `${state.percentToNext}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 2,
              background: 'linear-gradient(90deg,#C9A84C,#E8C54E)',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ width: '100%' }}
      role="progressbar"
      aria-valuenow={state.percentToNext}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Level ${state.level}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <span style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#fff',
          }}>
            Level {state.level}
          </span>
          {state.level === 10 && (
            <span style={{
              marginLeft: 10, fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', padding: '3px 8px',
              borderRadius: 5, background: 'rgba(201,168,76,0.12)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.25)',
            }}>
              CMO
            </span>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#C9A84C',
          }}>
            {state.xpInLevel.toLocaleString()} / {state.xpToNextLevel.toLocaleString()} XP
          </p>
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)',
            marginTop: 2,
          }}>
            Total: {state.xp.toLocaleString()} XP
          </p>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          initial={reduce ? {} : { width: 0 }}
          animate={{ width: `${state.percentToNext}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: 3,
            background: 'linear-gradient(90deg,#C9A84C,#E8C54E)',
            boxShadow: '0 0 8px rgba(201,168,76,0.4)',
          }}
        />
      </div>
      {state.level < 10 && (
        <p style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: 11,
          color: 'rgba(255,255,255,0.25)', marginTop: 6,
        }}>
          {(state.xpToNextLevel - state.xpInLevel).toLocaleString()} XP to Level {state.level + 1}
        </p>
      )}
    </div>
  );
}
