
// The Plan, Analytics, and Settings pages have no pull-to-refresh.
// On mobile, users expect swipe-down-to-refresh on any content list.

function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; },
    onTouchMove: (e: React.TouchEvent) => {
      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY > 80 && !refreshing) {
        setRefreshing(true);
        onRefresh().finally(() => setRefreshing(false));
      }
    },
  };

  return { refreshing, handlers };
}
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export const SettingsPage = () => (
  <div className="flex flex-col h-screen bg-void-900 items-center justify-center safe-top">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-classified/10 border border-classified/20 flex items-center justify-center">
        <Settings className="w-8 h-8 text-classified" />
      </div>
      <div>
        <h1 className="font-display text-2xl tracking-wider text-classified">SETTINGS</h1>
        <p className="text-sm text-slate-500 mt-1">Phase 5 — Coming Soon</p>
      </div>
    </motion.div>
  </div>
);
