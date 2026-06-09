/**
 * TabBar.tsx
 * Marketer Pro — Bottom tab navigation.
 * 4 tabs: Create · Plan · Analyze · Settings
 * Premium spring animations, active glow, badge support.
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wand2, CalendarDays, BarChart3, Settings } from 'lucide-react';

const TABS = [
  { path: '/',        label: 'Create',  Icon: Wand2,        key: 'create'  },
  { path: '/plan',    label: 'Plan',    Icon: CalendarDays, key: 'plan'    },
  { path: '/analyze', label: 'Analyze', Icon: BarChart3,    key: 'analyze' },
  { path: '/settings',label: 'Settings',Icon: Settings,     key: 'settings'},
] as const;

export const TabBar: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();

  const activeKey = TABS.find(t =>
    t.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(t.path)
  )?.key ?? 'create';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      style={{
        background:  'rgba(8,11,20,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1"
           style={{ paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom,0px))' }}>
        {TABS.map(({ path, label, Icon, key }) => {
          const isActive = key === activeKey;
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all min-w-[60px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.18)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{ scale: isActive ? 1 : 0.92, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="relative z-10"
                style={{ color: isActive ? '#C9A84C' : '#475569' }}
              >
                <Icon
                  className="w-5 h-5 transition-all"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {/* Active glow dot */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: '#C9A84C' }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <span
                className="text-[10px] font-semibold tracking-wide relative z-10 transition-colors"
                style={{
                  fontFamily: "'Syne', system-ui, sans-serif",
                  color: isActive ? '#C9A84C' : '#334155',
                  letterSpacing: '0.06em',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
