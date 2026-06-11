'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Sparkles, X } from 'lucide-react';
import { generateId } from '@/lib/utils';

type Variant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'classified';
interface Toast { id: string; variant: Variant; title: string; description?: string; }

interface ToastCtx {
  toast:      (opts: Omit<Toast, 'id'>) => void;
  success:    (title: string, desc?: string) => void;
  error:      (title: string, desc?: string) => void;
  warning:    (title: string, desc?: string) => void;
  info:       (title: string, desc?: string) => void;
  classified: (title: string, desc?: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const ICONS: Record<Variant, ReactNode> = {
  default:    <Info size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />,
  success:    <CheckCircle size={15} style={{ color: '#34D399' }} />,
  error:      <XCircle size={15} style={{ color: '#F87171' }} />,
  warning:    <AlertTriangle size={15} style={{ color: '#FBBF24' }} />,
  info:       <Info size={15} style={{ color: '#60A5FA' }} />,
  classified: <Sparkles size={15} style={{ color: '#C9A84C' }} />,
};

const BORDER: Record<Variant, string> = {
  default: 'rgba(255,255,255,0.1)', success: 'rgba(52,211,153,0.3)',
  error:   'rgba(248,113,113,0.3)', warning: 'rgba(251,191,36,0.3)',
  info:    'rgba(96,165,250,0.3)',  classified: 'rgba(201,168,76,0.4)',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = generateId();
    setToasts((p) => [...p.slice(-3), { ...opts, id }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const success    = useCallback((title: string, description?: string) => toast({ variant: 'success',    title, description }), [toast]);
  const error      = useCallback((title: string, description?: string) => toast({ variant: 'error',      title, description }), [toast]);
  const warning    = useCallback((title: string, description?: string) => toast({ variant: 'warning',    title, description }), [toast]);
  const info       = useCallback((title: string, description?: string) => toast({ variant: 'info',       title, description }), [toast]);
  const classified = useCallback((title: string, description?: string) => toast({ variant: 'classified', title, description }), [toast]);

  return (
    <Ctx.Provider value={{ toast, success, error, warning, info, classified }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, left: 16, zIndex: 9999, maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div key={t.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 16, border: `1px solid ${BORDER[t.variant]}`, background: 'rgba(10,14,28,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <div style={{ flexShrink: 0, marginTop: 1 }}>{ICONS[t.variant]}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 13, color: '#fff' }}>{t.title}</p>
                {t.description && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
