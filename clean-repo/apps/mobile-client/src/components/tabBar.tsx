'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TAB BAR
// Exactly four tabs per product spec: Create / Plan / Analyze / Settings
// Gold indicator follows active tab with Framer Motion layout animation.
// Haptic feedback on every tap.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CalendarDays, BarChart3, Settings2 } from 'lucide-react';
import { haptic } from '@marketer-pro/cinematic-engine';
import { colors, fonts, fontSizes, fontWeights, letterSpacings } from '@marketer-pro/ui';

const TABS = [
  { path: '/desk',    label: 'Create',   Icon: Zap          },
  { path: '/plan',    label: 'Plan',     Icon: CalendarDays },
  { path: '/analyze', label: 'Analyze',  Icon: BarChart3    },
  { path: '/settings',label: 'Settings', Icon: Settings2    },
] as const;

export function TabBar() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const handleTab = useCallback(async (path: string) => {
    if (pathname === path) return;
    await haptic('light');
    navigate(path);
  }, [pathname, navigate]);

  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      style={{
        flexShrink:          0,
        background:          'rgba(6,9,18,0.94)',
        backdropFilter:      'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
        borderTop:           '1px solid rgba(201,168,76,0.12)',
        paddingBottom:       'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{
        display:  'flex',
        alignItems: 'stretch',
        padding: '4px 8px 2px',
      }}>
        {TABS.map(({ path, label, Icon }) => {
          const active = pathname === path || (path !== '/desk' && pathname.startsWith(path));
          return (
            <button
              key={path}
              role="tab"
              aria-selected={active}
              aria-label={label}
              onClick={() => handleTab(path)}
              style={{
                flex:            1,
                display:         'flex',
                flexDirection:   'column',
                alignItems:      'center',
                gap:             4,
                padding:         '8px 4px',
                borderRadius:    12,
                position:        'relative',
                background:      'none',
                border:          'none',
                cursor:          'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {active && (
                <motion.div
                  layoutId="tab-bg"
                  style={{
                    position:    'absolute',
                    inset:        0,
                    borderRadius: 12,
                    background:  colors.classified.faint,
                  }}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <motion.div
                animate={active ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 1.75}
                  color={active ? colors.classified.DEFAULT : 'rgba(255,255,255,0.32)'}
                  aria-hidden
                />
              </motion.div>
              <span style={{
                fontFamily:    fonts.display,
                fontSize:      fontSizes['2xs'],
                fontWeight:    fontWeights.bold,
                letterSpacing: letterSpacings.wider,
                textTransform: 'uppercase',
                color:         active ? colors.classified.DEFAULT : 'rgba(255,255,255,0.28)',
                position:      'relative',
                zIndex:        1,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
