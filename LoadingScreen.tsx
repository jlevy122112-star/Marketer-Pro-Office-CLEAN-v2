/**
 * LoadingScreen.tsx + PageTransition.tsx
 * Marketer Pro — Branded loading states, never blank.
 *
 * Components:
 *   LoadingScreen    — full-screen branded loader (app init, auth check)
 *   SectionLoader    — in-section skeleton with branded pulse
 *   PageTransition   — wraps pages for animated enter/exit
 *   ContentSkeleton  — content card skeleton grid
 *   StatCardSkeleton — metrics row skeleton
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

// ─── Full-screen app loader ───────────────────────────────────────────────────

export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = 'Loading your workspace…',
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void-900"
    role="status"
    aria-label={message}
    style={{ background: 'var(--void-900,#080B14)' }}
  >
    {/* Background glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 70%)' }} />

    <div className="relative z-10 flex flex-col items-center gap-5">
      {/* Animated logo */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)',
          boxShadow: '0 0 32px rgba(201,168,76,0.35)',
        }}
      >
        <TrendingUp className="w-6 h-6 text-void-900" style={{ color: '#080B14' }} />
      </motion.div>

      {/* App name */}
      <div className="text-center">
        <p style={{
          fontFamily: "'Syne',system-ui,sans-serif",
          fontSize: '13px', fontWeight: 700, letterSpacing: '0.18em',
          color: '#C9A84C', textTransform: 'uppercase', marginBottom: '4px',
        }}>
          MARKETER PRO
        </p>
        <p style={{ fontSize: '12px', color: '#475569', fontFamily: "'DM Sans',sans-serif" }}>
          {message}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100px', height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '60%', height: '100%', borderRadius: '999px',
            background: 'linear-gradient(90deg,transparent,#C9A84C,transparent)',
          }}
        />
      </div>
    </div>

    <style>{`@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important}}`}</style>
  </motion.div>
);

// ─── Section loader ───────────────────────────────────────────────────────────

export const SectionLoader: React.FC<{ rows?: number; label?: string }> = ({
  rows = 3,
  label = 'Loading…',
}) => (
  <div role="status" aria-label={label} className="py-6 px-4 flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.05 }}
        className="flex items-center gap-3"
      >
        <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="skeleton h-3.5 rounded-full" style={{ width: `${70 + i * 8}%` }} />
          <div className="skeleton h-2.5 rounded-full" style={{ width: `${45 + i * 5}%` }} />
        </div>
        <div className="skeleton w-16 h-6 rounded-full" />
      </motion.div>
    ))}
    <style>{`.skeleton{background:linear-gradient(90deg,#111827 25%,#1a2233 50%,#111827 75%);background-size:800px 100%;animation:sk 1.5s ease-in-out infinite}@keyframes sk{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
  </div>
);

// ─── Content card skeleton ────────────────────────────────────────────────────

export const ContentCardSkeleton: React.FC = () => (
  <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01] flex flex-col gap-3" aria-hidden="true">
    <div className="skeleton h-4 w-24 rounded-full" />
    <div className="flex flex-col gap-2">
      <div className="skeleton h-3 rounded-full w-full" />
      <div className="skeleton h-3 rounded-full w-4/5" />
      <div className="skeleton h-3 rounded-full w-3/5" />
    </div>
    <div className="skeleton h-28 rounded-xl" />
    <div className="flex justify-between items-center">
      <div className="skeleton h-3 w-24 rounded-full" />
      <div className="flex gap-2">
        <div className="skeleton w-7 h-7 rounded-lg" />
        <div className="skeleton w-7 h-7 rounded-lg" />
      </div>
    </div>
    <style>{`.skeleton{background:linear-gradient(90deg,#111827 25%,#1a2233 50%,#111827 75%);background-size:800px 100%;animation:sk 1.5s ease-in-out infinite}@keyframes sk{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
  </div>
);

export const ContentGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div role="status" aria-label="Loading content" className="grid grid-cols-1 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
        <ContentCardSkeleton />
      </motion.div>
    ))}
  </div>
);

// ─── Metrics skeleton ─────────────────────────────────────────────────────────

export const MetricsSkeleton: React.FC = () => (
  <div role="status" aria-label="Loading metrics" className="grid grid-cols-3 gap-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01] flex flex-col gap-2">
        <div className="skeleton h-2.5 w-12 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-2 w-10 rounded-full" />
      </div>
    ))}
    <style>{`.skeleton{background:linear-gradient(90deg,#111827 25%,#1a2233 50%,#111827 75%);background-size:800px 100%;animation:sk 1.5s ease-in-out infinite}@keyframes sk{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
  </div>
);

// ─── Page transition wrapper ──────────────────────────────────────────────────

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Inline button spinner ────────────────────────────────────────────────────

export const ButtonSpinner: React.FC<{ light?: boolean }> = ({ light = true }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: '14px', height: '14px',
      border: `2px solid ${light ? 'rgba(8,11,20,0.3)' : 'rgba(255,255,255,0.3)'}`,
      borderTopColor: light ? '#080B14' : 'white',
      borderRadius: '50%',
      animation: 'spin 500ms linear infinite',
      flexShrink: 0,
    }}
  >
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </span>
);
