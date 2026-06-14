// FILE PATH: src/components/common/LoadingScreen.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredReturningName } from '../../contexts/AuthContext';

const NEW_USER_MESSAGES = [
  'Connecting to your Digital Office…',
  'Preparing your workspace…',
  'Loading AI systems…',
  'Almost ready…',
];

const RETURNING_MESSAGES = [
  'Welcome back…',
  'Loading your content…',
  'Syncing your data…',
  'Almost ready…',
];

interface LoadingScreenProps {
  onTimeout?: () => void;
  timeoutMs?: number;
}

export function LoadingScreen({ onTimeout, timeoutMs = 12000 }: LoadingScreenProps) {
  const returningName  = getStoredReturningName();
  const isReturning    = !!returningName;
  const firstName      = returningName?.split(' ')[0] ?? '';
  const messages       = isReturning ? RETURNING_MESSAGES : NEW_USER_MESSAGES;

  const [msgIdx, setMsgIdx]       = useState(0);
  const [progress, setProgress]   = useState(0);
  const [timedOut, setTimedOut]   = useState(false);

  // Rotate status messages every 1.8s
  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => Math.min(i + 1, messages.length - 1));
    }, 1800);
    return () => clearInterval(t);
  }, [messages.length]);

  // Simulate progress bar
  useEffect(() => {
    const milestones = [0, 20, 40, 60, 80, 95];
    let idx = 0;
    const t = setInterval(() => {
      if (idx < milestones.length) {
        setProgress(milestones[idx]);
        idx++;
      }
    }, timeoutMs / milestones.length);
    return () => clearInterval(t);
  }, [timeoutMs]);

  // 12-second timeout → show recovery UI
  useEffect(() => {
    const t = setTimeout(() => {
      setTimedOut(true);
      onTimeout?.();
    }, timeoutMs);
    return () => clearTimeout(t);
  }, [timeoutMs, onTimeout]);

  if (timedOut) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 px-8 text-center"
           style={{ background: '#080B14' }}>
        <div className="text-4xl">⚠️</div>
        <div>
          <p className="font-display font-bold text-lg heading-classified mb-2">Taking longer than usual</p>
          <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            Check your internet connection and try again.
          </p>
        </div>
        <button onClick={() => window.location.reload()}
                className="btn-classified w-full max-w-xs justify-center">
          Retry
        </button>
        <button onClick={() => { setTimedOut(false); }}
                className="btn-void w-full max-w-xs justify-center">
          Continue Anyway
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: '#080B14' }}>
      <div className="absolute inset-0 bg-grid opacity-25" />
      <div className="absolute inset-0"
           style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative flex flex-col items-center gap-6 z-10"
      >
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #9d7c2e 100%)',
                        boxShadow: '0 0 50px rgba(201,168,76,0.3)' }}>
            <span className="font-display font-bold text-2xl" style={{ color: '#080B14' }}>M</span>
          </div>
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-1.5 rounded-3xl border-2 border-transparent"
            style={{ borderTopColor: '#C9A84C', borderRightColor: 'rgba(201,168,76,0.2)' }}
          />
          {/* Inner counter-ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-3 rounded-3xl border border-dashed"
            style={{ borderColor: 'rgba(201,168,76,0.1)' }}
          />
        </div>

        {/* Brand */}
        <div className="text-center">
          <p className="font-display font-bold text-xl tracking-widest uppercase heading-classified">
            Marketer-Pro
          </p>
          {isReturning && firstName && (
            <p className="font-body text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Welcome back, {firstName}
            </p>
          )}
        </div>

        {/* Rotating status message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="font-body text-xs"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-40">
          <div className="h-0.5 rounded-full overflow-hidden"
               style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C54E)',
                       boxShadow: '0 0 8px rgba(201,168,76,0.5)' }}
            />
          </div>
          <p className="text-center font-mono text-2xs mt-1.5"
             style={{ color: 'rgba(201,168,76,0.4)' }}>
            {progress}%
          </p>
        </div>
      </motion.div>
    </div>
  );
}
