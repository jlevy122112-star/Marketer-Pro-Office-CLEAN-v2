// FILE PATH: src/components/common/TabBar.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Calendar, BarChart2, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const TABS = [
  { id: 'create',   label: 'Create',  path: '/create',   icon: Zap },
  { id: 'plan',     label: 'Plan',    path: '/plan',     icon: Calendar },
  { id: 'analyze',  label: 'Analyze', path: '/analyze',  icon: BarChart2 },
  { id: 'settings', label: 'Settings',path: '/settings', icon: Settings },
] as const;

async function triggerHaptic() {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    if (navigator.vibrate) navigator.vibrate(8);
  }
}

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="flex-shrink-0 glass-classified"
      style={{ paddingBottom: 'var(--sab)' }}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {TABS.map((tab) => {
          const Icon     = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={async () => {
                if (!isActive) {
                  await triggerHaptic();
                  navigate(tab.path);
                }
              }}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-0 flex-1"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div layoutId="tab-pill"
                            className="absolute inset-0 rounded-xl"
                            style={{ background: 'rgba(201, 168, 76, 0.1)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <motion.div animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="relative">
                <Icon size={22}
                      className={cn('transition-colors duration-200', isActive ? 'text-classified' : 'text-white/40')}
                      strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-classified" />
                )}
              </motion.div>
              <span className={cn('text-2xs font-display font-semibold tracking-wider uppercase transition-colors duration-200',
                                  isActive ? 'text-classified' : 'text-white/30')}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
