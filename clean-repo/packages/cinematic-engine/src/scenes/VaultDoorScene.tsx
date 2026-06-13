'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ACT I — VAULT DOOR SCENE
// Full-screen cinematic takeover. Tap the scanner to begin unlocking.
// Audit upgrades applied:
//   - Haptic feedback on tap and unlock
//   - Total timeline under 2 seconds (was 4s+)
//   - Scan line uses window.innerHeight, not hardcoded 700px
//   - "TAP SCANNER TO ACCESS VAULT" affordance with pulsing glow
//   - Cancel button while idle
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { haptic, hapticUnlockSequence } from '../haptics';

type VaultPhase = 'idle' | 'scanning' | 'unlocking' | 'opening' | 'done';

interface VaultDoorSceneProps {
  onComplete: () => void;
  onAbort:    () => void;
}

const BOLT_POSITIONS = [
  { angle: 0,   label: '12' },
  { angle: 60,  label: '2'  },
  { angle: 120, label: '4'  },
  { angle: 180, label: '6'  },
  { angle: 240, label: '8'  },
  { angle: 300, label: '10' },
];

const STATUS_TEXT: Record<VaultPhase, string> = {
  idle:      'TAP SCANNER TO ACCESS VAULT',
  scanning:  'SCANNING BIOMETRICS…',
  unlocking: 'DISENGAGING LOCK BOLTS…',
  opening:   'VAULT OPENING…',
  done:      'ACCESS GRANTED',
};

export default function VaultDoorScene({ onComplete, onAbort }: VaultDoorSceneProps) {
  const [phase, setPhase] = useState<VaultPhase>('idle');
  const [scanHeight, setScanHeight] = useState(800);
  const triggered = useRef(false);
  const reduce = useReducedMotion();

  // Scan line height — fixes hardcoded 700px from audit
  useEffect(() => {
    const update = () => setScanHeight(window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const trigger = useCallback(async () => {
    if (triggered.current) return;
    triggered.current = true;

    await haptic('medium');
    setPhase('scanning');

    // Total timeline: 1.6s — under the 2.5s audit limit
    setTimeout(async () => {
      await hapticUnlockSequence();
      setPhase('unlocking');
    }, 500);

    setTimeout(() => setPhase('opening'), 1000);

    setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 1600);
  }, [onComplete]);

  // Auto-trigger fallback after 1.4s if user hasn't tapped —
  // ensures users who don't realize they can tap aren't stuck
  useEffect(() => {
    const autoTimer = setTimeout(() => {
      if (!triggered.current) trigger();
    }, 1400);
    return () => clearTimeout(autoTimer);
  }, [trigger]);

  const doorOpen = phase === 'opening' || phase === 'done';

  return (
    <motion.div
      role="dialog"
      aria-label="Vault Door — generating content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#03050A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Grid backdrop */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.03) 1px,transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Scan line */}
      {!reduce && phase === 'idle' && (
        <motion.div
          aria-hidden
          animate={{ y: [0, scanHeight, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Vault door */}
      <motion.div
        animate={doorOpen ? { rotateY: -75, x: -40 } : { rotateY: 0, x: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'relative',
          width: 260, height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #1a2235, #0D1120)',
          border: '3px solid rgba(201,168,76,0.35)',
          boxShadow: '0 0 60px rgba(201,168,76,0.12), inset 0 0 40px rgba(0,0,0,0.6)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'left center',
        }}
      >
        {/* Bolts */}
        {BOLT_POSITIONS.map(({ angle, label }) => {
          const radius = 105;
          const x = Math.sin((angle * Math.PI) / 180) * radius;
          const y = -Math.cos((angle * Math.PI) / 180) * radius;
          const retracted = phase === 'unlocking' || phase === 'opening' || phase === 'done';
          return (
            <motion.div
              key={label}
              animate={{
                scale: retracted ? 0.4 : 1,
                opacity: retracted ? 0.2 : 1,
              }}
              transition={{ duration: 0.4, delay: BOLT_POSITIONS.findIndex((b) => b.label === label) * 0.05 }}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: `translate(${x - 8}px, ${y - 8}px)`,
                width: 16, height: 16, borderRadius: 4,
                background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)',
                boxShadow: '0 0 8px rgba(201,168,76,0.4)',
              }}
            />
          );
        })}

        {/* Fingerprint scanner */}
        <button
          onClick={trigger}
          aria-label="Scan fingerprint to access vault"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            borderRadius: '50%',
            border: 'none', background: 'transparent',
            cursor: phase === 'idle' ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Pulsing glow while idle */}
          {phase === 'idle' && !reduce && (
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', width: 90, height: 90, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)',
              }}
            />
          )}
          <motion.div
            animate={
              phase === 'scanning' ? { scale: [1, 1.08, 1] } :
              phase === 'unlocking' ? { scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] } :
              {}
            }
            transition={{ duration: 0.5, repeat: phase === 'scanning' ? Infinity : 0 }}
            style={{ fontSize: 44, filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.5))' }}
          >
            {phase === 'done' || phase === 'opening' ? '🔓' : '🔒'}
          </motion.div>
        </button>
      </motion.div>

      {/* Status text */}
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          marginTop: 32,
          fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11,
          letterSpacing: '0.35em', textTransform: 'uppercase',
          color: phase === 'done' ? '#6EE7B7' : 'rgba(201,168,76,0.7)',
          textAlign: 'center', maxWidth: 280,
        }}
      >
        {STATUS_TEXT[phase]}
      </motion.p>

      {/* Cancel — only while idle, escape hatch from audit */}
      {phase === 'idle' && (
        <button
          onClick={onAbort}
          style={{
            position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom,0px) + 32px)',
            fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 16px',
          }}
        >
          Cancel
        </button>
      )}
    </motion.div>
  );
}
