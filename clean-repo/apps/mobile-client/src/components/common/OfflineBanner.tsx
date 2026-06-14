// FILE PATH: src/components/common/OfflineBanner.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { getQueueCount } from '../../lib/offlineQueue';

export function OfflineBanner() {
  const [offline, setOffline]     = useState(!navigator.onLine);
  const [queueCount, setQueueCount] = useState(getQueueCount);

  useEffect(() => {
    const onOnline  = () => setOffline(false);
    const onOffline = () => setOffline(true);
    const onQueue   = () => setQueueCount(getQueueCount());

    window.addEventListener('online',            onOnline);
    window.addEventListener('offline',           onOffline);
    window.addEventListener('mp:queue-updated',  onQueue);
    return () => {
      window.removeEventListener('online',           onOnline);
      window.removeEventListener('offline',          onOffline);
      window.removeEventListener('mp:queue-updated', onQueue);
    };
  }, []);

  const show = offline || queueCount > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5"
          style={{
            paddingTop: 'calc(var(--sat) + 10px)',
            background: offline ? 'rgba(239,68,68,0.15)' : 'rgba(201,168,76,0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${offline ? 'rgba(239,68,68,0.3)' : 'rgba(201,168,76,0.25)'}`,
          }}
          role="status"
          aria-live="polite"
        >
          {offline ? (
            <>
              <WifiOff size={13} style={{ color: '#EF4444' }} />
              <span className="font-display text-2xs tracking-widest uppercase" style={{ color: '#EF4444' }}>
                No internet connection
              </span>
            </>
          ) : (
            <>
              <RefreshCw size={13} style={{ color: '#C9A84C' }} className="animate-spin" />
              <span className="font-display text-2xs tracking-widest uppercase" style={{ color: '#C9A84C' }}>
                {queueCount} change{queueCount > 1 ? 's' : ''} pending sync
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
