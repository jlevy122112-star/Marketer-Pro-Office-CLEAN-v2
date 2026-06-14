// FILE PATH: src/components/common/CoachMark.tsx
// First-session coach marks — pulse ring + tooltip around a target element.
// Dismisses on tap and never reappears (persisted to localStorage).
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISSED_KEY = 'mp_dismissed_coaches';

function getDismissed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]')); }
  catch { return new Set(); }
}
function dismiss(id: string) {
  const set = getDismissed();
  set.add(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

interface CoachMarkProps {
  id:        string;       // unique — once dismissed, never shown again
  text:      string;       // instruction text
  position?: 'above' | 'below' | 'left' | 'right';
  children:  React.ReactNode;
}

export function CoachMark({ id, text, position = 'above', children }: CoachMarkProps) {
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getDismissed().has(id)) {
      // Small delay so the UI is settled before the coach mark appears
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [id]);

  function handleDismiss() {
    dismiss(id);
    setVisible(false);
  }

  const TOOLTIP_STYLE: React.CSSProperties = {
    position: 'absolute',
    zIndex: 60,
    background: 'rgba(10, 15, 30, 0.97)',
    border: '1px solid rgba(201,168,76,0.45)',
    borderRadius: 12,
    padding: '10px 14px',
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    ...(position === 'above' ? { bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' } : {}),
    ...(position === 'below' ? { top:    'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' } : {}),
    ...(position === 'left'  ? { right:  'calc(100% + 10px)', top: '50%',  transform: 'translateY(-50%)' } : {}),
    ...(position === 'right' ? { left:   'calc(100% + 10px)', top: '50%',  transform: 'translateY(-50%)' } : {}),
  };

  return (
    <div ref={wrapRef} className="relative inline-block" onClick={visible ? handleDismiss : undefined}>
      {children}
      <AnimatePresence>
        {visible && (
          <>
            {/* Pulsing gold ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: [0.6, 0.9, 0.6], scale: [0.98, 1.04, 0.98] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ border: '2px solid rgba(201,168,76,0.8)', boxShadow: '0 0 18px rgba(201,168,76,0.35)' }}
            />
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: position === 'above' ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={TOOLTIP_STYLE}
            >
              <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>{text}</p>
              <p className="font-display text-2xs tracking-widest uppercase mt-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
                Tap to dismiss
              </p>
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                width: 8, height: 8,
                background: 'rgba(10, 15, 30, 0.97)',
                border: '1px solid rgba(201,168,76,0.45)',
                transform: 'rotate(45deg)',
                ...(position === 'above' ? { bottom: -5, left: '50%', marginLeft: -4, borderTop: 'none', borderLeft: 'none' } : {}),
                ...(position === 'below' ? { top:    -5, left: '50%', marginLeft: -4, borderBottom: 'none', borderRight: 'none' } : {}),
              }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Hook for checking/dismissing coach marks without the wrapper */
export function useCoachMark(id: string) {
  const [visible, setVisible] = useState(!getDismissed().has(id));
  const dismissMark = () => { dismiss(id); setVisible(false); };
  return { visible, dismiss: dismissMark };
}
