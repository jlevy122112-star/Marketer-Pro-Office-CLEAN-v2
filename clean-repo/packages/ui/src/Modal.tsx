// ─────────────────────────────────────────────────────────────────────────────
// MODAL
// Bottom sheet modal for mobile. Swipe-down to dismiss.
// Used for: schedule picker, report content, paywall, confirmations.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, radii, shadows, gradients, zIndex } from './tokens';

interface ModalProps {
  open:        boolean;
  onClose:     () => void;
  title?:      string;
  children:    ReactNode;
  accentBar?:  boolean;  // gold top accent bar
  maxHeight?:  string;
  showHandle?: boolean;
  showClose?:  boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  accentBar   = false,
  maxHeight   = '90dvh',
  showHandle  = true,
  showClose   = true,
}: ModalProps) {
  const reduce = useReducedMotion();

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape key dismissal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position:   'fixed',
              inset:       0,
              zIndex:     zIndex.overlay,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduce ? {} : { y: '100%' }}
            animate={reduce ? {} : { y: 0 }}
            exit={reduce   ? {} : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            drag={reduce ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            onDragEnd={(_e, info) => { if (info.offset.y > 80) onClose(); }}
            style={{
              position:   'fixed',
              bottom:     0,
              left:       0,
              right:      0,
              zIndex:     zIndex.overlay + 1,
              background: colors.void[800],
              borderRadius: `${radii['3xl']} ${radii['3xl']} 0 0`,
              maxHeight,
              overflowY:  'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
              boxShadow:  shadows.modal,
            }}
          >
            {/* Accent bar */}
            {accentBar && (
              <div style={{
                height:     3,
                background: gradients.goldSheen,
                borderRadius: `${radii['3xl']} ${radii['3xl']} 0 0`,
              }} />
            )}

            {/* Drag handle */}
            {showHandle && (
              <div style={{
                width:        36,
                height:       4,
                borderRadius: 2,
                background:   colors.border.moderate,
                margin:       '14px auto 0',
              }} aria-hidden />
            )}

            {/* Header */}
            {(title || showClose) && (
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                padding:        '16px 20px 8px',
              }}>
                {title && (
                  <p style={{
                    fontFamily:    fonts.display,
                    fontWeight:    fontWeights.bold,
                    fontSize:      fontSizes.xl,
                    letterSpacing: letterSpacings.wide,
                    textTransform: 'uppercase',
                    background:    gradients.goldText,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor:  'transparent',
                    backgroundClip: 'text',
                  }}>
                    {title}
                  </p>
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                      color:      colors.text.tertiary,
                      background: 'none',
                      border:     'none',
                      cursor:     'pointer',
                      padding:    4,
                      marginLeft: 'auto',
                    }}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div style={{ padding: '8px 20px 20px' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
