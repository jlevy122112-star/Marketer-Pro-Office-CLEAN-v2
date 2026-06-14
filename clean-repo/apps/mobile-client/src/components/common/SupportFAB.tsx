// FILE PATH: src/components/common/SupportFAB.tsx
// Global floating support button — renders on every screen except cinematic scenes.
// Satisfies: support access requirement + screen share requirement.
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, BookOpen, Mail, Bug, Share } from 'lucide-react';
import { SUPPORT } from '../../lib/constants';
import { APP_VERSION } from '../../lib/constants';

interface SupportFABProps {
  /** Pass 'scene' to render only a minimal icon (no FAB sheet inside cinematic flows) */
  mode?: 'default' | 'scene';
}

export function SupportFAB({ mode = 'default' }: SupportFABProps) {
  const [open, setOpen] = useState(false);

  async function handleShare() {
    setOpen(false);
    const shareData = {
      title: 'Marketer-Pro Office Edition',
      text: 'Check out Marketer-Pro — AI-powered social media marketing',
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  async function handleBug() {
    setOpen(false);
    const body = encodeURIComponent(
      `App version: ${APP_VERSION}\nPage: ${window.location.pathname}\nIssue:\n\n`
    );
    window.location.href = `mailto:${SUPPORT.email}?subject=Bug%20Report&body=${body}`;
  }

  // Scene mode — just a small ? icon in the corner
  if (mode === 'scene') {
    return (
      <a href={`mailto:${SUPPORT.email}`}
         className="fixed top-4 right-4 z-50 w-8 h-8 rounded-full flex items-center justify-center"
         style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
         aria-label="Get help">
        <HelpCircle size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
      </a>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed left-0 right-0 z-50 glass-classified rounded-t-3xl"
            style={{ bottom: 0, paddingBottom: 'var(--sab)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>

            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-bold text-base tracking-wider uppercase heading-classified">
                  How can we help?
                </p>
                <button onClick={() => setOpen(false)} style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { icon: BookOpen, label: 'Help Center',     sub: 'Guides and tutorials',    action: () => { setOpen(false); window.open(SUPPORT.helpUrl); }},
                  { icon: Mail,     label: 'Email Support',   sub: SUPPORT.email,             action: () => { setOpen(false); window.location.href = `mailto:${SUPPORT.email}`; }},
                  { icon: Bug,      label: 'Report a Bug',    sub: 'Something not working?',  action: handleBug },
                  { icon: Share,    label: 'Share Screen',    sub: 'Share your current view', action: handleShare },
                ].map(({ icon: Icon, label, sub, action }) => (
                  <button key={label} onClick={action}
                          className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                      <Icon size={18} style={{ color: '#C9A84C' }} />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-white">{label}</p>
                      <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed z-40 flex items-center justify-center"
        style={{
          bottom: 'calc(var(--tab-bar-height) + var(--sab) + 16px)',
          right: 16,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(201,168,76,0.15)',
          border: '1px solid rgba(201,168,76,0.35)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        aria-label="Get help or share screen"
      >
        <HelpCircle size={18} style={{ color: '#C9A84C' }} />
      </motion.button>
    </>
  );
}
