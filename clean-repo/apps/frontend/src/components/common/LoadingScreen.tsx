// UPGRADE: Add progress signal + exit animation to LoadingScreen.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress?: number; // 0-100, passed from app bootstrap
  onComplete?: () => void;
}

export function LoadingScreen({ progress = 0, onComplete }: LoadingScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => onComplete?.(), 400);
      }, 200);
    }
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed', inset: 0, background: '#060912',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', zIndex: 50,
          }}
        >
          {/* Atmospheric glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)',
          }} />

          {/* Grid overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.025) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.34,1.56,0.64,1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, position: 'relative', zIndex: 1 }}
          >
            {/* Logo */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: 'linear-gradient(135deg,#C9A84C 0%,#9d7c2e 100%)',
                boxShadow: '0 0 80px rgba(201,168,76,0.35), 0 0 160px rgba(201,168,76,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 34, color: '#060912', letterSpacing: '-1.5px' }}>M</span>
              </div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', inset: -10, borderRadius: 30, border: '1.5px solid transparent', borderTopColor: 'rgba(201,168,76,0.7)', borderRightColor: 'rgba(201,168,76,0.2)' }} />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', inset: -18, borderRadius: 38, border: '1px dashed rgba(201,168,76,0.12)' }} />
            </div>

            {/* Brand */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '0.25em', textTransform: 'uppercase', background: 'linear-gradient(135deg,#C9A84C 0%,#E8C54E 50%,#9d7c2e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Marketer-Pro
              </p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginTop: 5 }}>
                Your Digital Office
              </p>
            </div>

            {/* Progress bar — the critical upgrade */}
            <div style={{ width: 160, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <div style={{ width: '100%', height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 1, background: 'linear-gradient(90deg,#C9A84C,#E8C54E)', boxShadow: '0 0 8px rgba(201,168,76,0.6)' }}
                />
              </div>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'rgba(201,168,76,0.4)', letterSpacing: '0.2em' }}>
                {progress < 100 ? `${Math.round(progress)}%` : 'READY'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060912', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.34,1.56,0.64,1] }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', boxShadow: '0 0 60px rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, color: '#060912' }}>M</span>
          </div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', inset: -8, borderRadius: 28, border: '2px solid transparent', borderTopColor: 'rgba(201,168,76,0.6)', borderRightColor: 'rgba(201,168,76,0.15)' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Marketer-Pro</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Your Digital Office</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0,1,2,3].map((i) => (
            <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }}
              animate={{ opacity: [0.2,1,0.2], scale: [0.8,1.2,0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
