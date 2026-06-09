/**
 * Toast.tsx
 * Marketer Pro — Premium notification system.
 *
 * Features:
 * - Success, error, warning, info, and loading variants
 * - Animated entrance/exit with spring physics
 * - Auto-dismiss with progress bar
 * - Action button support
 * - Stacks up to 3, older ones compress
 * - Positioned bottom-center on mobile, top-right on desktop
 * - Matches void-900/classified design system
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, Info, Loader2, Zap } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'gold';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
  action?: ToastAction;
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  // Convenience helpers
  success: (title: string, message?: string, opts?: Partial<Toast>) => string;
  error:   (title: string, message?: string, opts?: Partial<Toast>) => string;
  warning: (title: string, message?: string, opts?: Partial<Toast>) => string;
  info:    (title: string, message?: string, opts?: Partial<Toast>) => string;
  loading: (title: string, message?: string) => string;
  gold:    (title: string, message?: string, opts?: Partial<Toast>) => string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<ToastVariant, {
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}> = {
  success: {
    icon: <Check className="w-4 h-4"/>,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
  },
  error: {
    icon: <AlertTriangle className="w-4 h-4"/>,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4"/>,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  info: {
    icon: <Info className="w-4 h-4"/>,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
  },
  loading: {
    icon: <Loader2 className="w-4 h-4 animate-spin"/>,
    color: '#94a3b8',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
  },
  gold: {
    icon: <Zap className="w-4 h-4"/>,
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.08)',
    border: 'rgba(201,168,76,0.22)',
  },
};

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 4500;

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// ─── Individual toast item ────────────────────────────────────────────────────

const ToastItem: React.FC<{
  toast: Toast;
  onDismiss: (id: string) => void;
  index: number;
  total: number;
}> = ({ toast, onDismiss, index, total }) => {
  const config = VARIANT_CONFIG[toast.variant];
  const duration = toast.duration ?? DEFAULT_DURATION;
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (duration === 0 || toast.variant === 'loading') return;

    const start = Date.now();
    const end = start + duration;

    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const remaining = end - Date.now();
      const pct = Math.max(0, (remaining / duration) * 100);
      setProgress(pct);
      if (pct <= 0) {
        clearInterval(intervalRef.current!);
        onDismiss(toast.id);
      }
    }, 50);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [toast.id, duration, toast.variant]);

  // Stack compression for older toasts
  const isOldest = index === 0 && total > 1;
  const scale = isOldest && total >= 3 ? 0.92 : isOldest ? 0.95 : 1;
  const opacity = isOldest && total >= 3 ? 0.5 : isOldest ? 0.7 : 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity, y: 0, scale }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      className="w-full max-w-[360px] rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: `linear-gradient(135deg, var(--desk-700, #1a2233), var(--desk-800, #111827))`,
        border: `1px solid ${config.border}`,
        backdropFilter: 'blur(16px)',
      }}
      role="alert"
      aria-live="assertive"
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${config.color},transparent)` }} />

      <div className="px-4 py-3.5 flex items-start gap-3">
        {/* Icon */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 leading-tight"
            style={{ fontFamily: "'DM Sans',sans-serif" }}>{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={() => { toast.action!.onClick(); onDismiss(toast.id); }}
              className="mt-2 text-xs font-bold tracking-wider uppercase transition-colors"
              style={{ color: config.color, fontFamily: "'Syne',sans-serif" }}
            >
              {toast.action.label} →
            </button>
          )}
        </div>

        {/* Dismiss */}
        {toast.variant !== 'loading' && (
          <button
            onClick={() => onDismiss(toast.id)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 mt-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {duration > 0 && toast.variant !== 'loading' && (
        <div className="h-0.5 w-full mx-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full transition-none rounded-full"
            style={{ width: `${progress}%`, background: config.color }}
          />
        </div>
      )}
    </motion.div>
  );
};

// ─── Toast provider ───────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const toast = useCallback((options: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => {
      const next = [...prev, { ...options, id }];
      return next.slice(-MAX_TOASTS); // Keep max toasts
    });
    return id;
  }, []);

  // Convenience helpers
  const success = useCallback((title: string, message?: string, opts?: Partial<Toast>) =>
    toast({ variant: 'success', title, message, ...opts }), [toast]);
  const error = useCallback((title: string, message?: string, opts?: Partial<Toast>) =>
    toast({ variant: 'error', title, message, duration: 6000, ...opts }), [toast]);
  const warning = useCallback((title: string, message?: string, opts?: Partial<Toast>) =>
    toast({ variant: 'warning', title, message, ...opts }), [toast]);
  const info = useCallback((title: string, message?: string, opts?: Partial<Toast>) =>
    toast({ variant: 'info', title, message, ...opts }), [toast]);
  const loading = useCallback((title: string, message?: string) =>
    toast({ variant: 'loading', title, message, duration: 0 }), [toast]);
  const gold = useCallback((title: string, message?: string, opts?: Partial<Toast>) =>
    toast({ variant: 'gold', title, message, duration: 5000, ...opts }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll, success, error, warning, info, loading, gold }}>
      {children}

      {/* Toast portal */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed z-[9999] flex flex-col gap-2.5 pointer-events-none"
        style={{
          // Mobile: bottom center
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '360px',
        }}
      >
        <AnimatePresence mode="sync">
          {toasts.map((t, i) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem
                toast={t}
                onDismiss={dismiss}
                index={i}
                total={toasts.length}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
