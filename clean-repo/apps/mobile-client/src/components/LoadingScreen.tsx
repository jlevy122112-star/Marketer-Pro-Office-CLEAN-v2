'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SCREEN
// Shown during app bootstrap. Progress bar connected to real load state.
// Audit upgrade: progress signal, dual rotating rings, clean exit animation.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, gradients } from '@marketer-pro/ui';

interface LoadingScreenProps {
  progress?: number;    // 0-100
  onComplete?: () => void;
}

export function LoadingScreen({ progress = 0, onComplete }: LoadingScreenProps) {
  const reduce   = useReducedMotion();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (progress < 100) return;
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onComplete?.(), 400);
    }, 200);
    return () => clearTimeout(t);
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          role="status"
          aria-label="Loading Marketer-Pro"
          style={{
            position:        'fixed',
            inset:            0,
            background:       colors.void[900],
            display:         'flex',
            flexDirection:   'column',
            alignItems:      'center',
            justifyContent:  'center',
            zIndex:           9999,
          }}
        >
          {/* Grid backdrop */}
          <div style={{
            position:        'absolute',
            inset:            0,
            pointerEvents:   'none',
            backgroundImage:  gradients.grid,
            backgroundSize:  '40px 40px',
          }} aria-hidden />

          {/* Radial glow */}
          <div style={{
            position:  'absolute',
            inset:      0,
            background: gradients.goldRadial,
            pointerEvents: 'none',
          }} aria-hidden />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           28,
              position:      'relative',
              zIndex:         1,
            }}
          >
            {/* Logo + spinning rings */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width:          80,
                height:         80,
                borderRadius:   22,
                background:     gradients.gold,
                boxShadow:      '0 0 80px rgba(201,168,76,0.35), 0 0 160px rgba(201,168,76,0.1)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily:    fonts.display,
                  fontWeight:    fontWeights.extrabold,
                  fontSize:      fontSizes['4xl'],
                  color:         '#060912',
                  letterSpacing: '-2px',
                }}>M</span>
              </div>

              {/* Outer ring */}
              {!reduce && (
                <motion.div
                  aria-hidden
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position:     'absolute',
                    inset:         -10,
                    borderRadius: 30,
                    border:       '1.5px solid transparent',
                    borderTopColor:   'rgba(201,168,76,0.7)',
                    borderRightColor: 'rgba(201,168,76,0.2)',
                  }}
                />
              )}

              {/* Inner counter-ring */}
              {!reduce && (
                <motion.div
                  aria-hidden
                  animate={{ rotate: -360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position:     'absolute',
                    inset:         -18,
                    borderRadius: 38,
                    border:       '1px dashed rgba(201,168,76,0.12)',
                  }}
                />
              )}
            </div>

            {/* Brand name */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily:    fonts.display,
                fontWeight:    fontWeights.extrabold,
                fontSize:      fontSizes['2xl'],
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                background:    gradients.goldSheen,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip: 'text',
              }}>
                Marketer-Pro
              </p>
              <p style={{
                fontFamily:    fonts.display,
                fontSize:      fontSizes['2xs'],
                letterSpacing: letterSpacings.caps,
                textTransform: 'uppercase',
                color:         'rgba(255,255,255,0.28)',
                marginTop:     5,
              }}>
                Your Digital Office
              </p>
            </div>

            {/* Progress bar */}
            <div style={{
              width:         160,
              display:       'flex',
              flexDirection: 'column',
              gap:           8,
              alignItems:    'center',
            }}>
              <div
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Loading: ${Math.round(progress)}%`}
                style={{
                  width:        '100%',
                  height:        2,
                  borderRadius:  1,
                  background:   'rgba(255,255,255,0.06)',
                }}
              >
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    height:       '100%',
                    borderRadius:  1,
                    background:    gradients.gold,
                    boxShadow:    '0 0 8px rgba(201,168,76,0.6)',
                  }}
                />
              </div>
              <p style={{
                fontFamily:    fonts.mono,
                fontSize:      fontSizes['2xs'],
                color:         'rgba(201,168,76,0.4)',
                letterSpacing: letterSpacings.wider,
              }}>
                {progress < 100 ? `${Math.round(progress)}%` : 'READY'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingScreen;          MARKETER PRO
        </div>
        <div className="font-heading text-xs tracking-[0.3em] text-slate-500 uppercase mt-1">
          Office Edition
        </div>
      </div>

      {/* Loading dots */}
      <div className="flex gap-2 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-classified/60"
          />
        ))}
      </div>
    </motion.div>
  </div>
);
