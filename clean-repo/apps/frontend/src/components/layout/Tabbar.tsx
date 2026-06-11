'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, CalendarDays, BarChart3, Settings2 } from 'lucide-react';

const TABS = [
  { path: '/office',            label: 'Create',   Icon: Zap           },
  { path: '/office/calendar',   label: 'Plan',     Icon: CalendarDays  },
  { path: '/office/analytics',  label: 'Analyze',  Icon: BarChart3     },
  { path: '/office/settings',   label: 'Settings', Icon: Settings2     },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav style={{ flexShrink: 0, background: 'rgba(6,9,18,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(201,168,76,0.12)', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', padding: '4px 8px 4px' }}>
        {TABS.map(({ path, label, Icon }) => {
          const active = pathname === path || (path !== '/office' && pathname.startsWith(path));
          return (
            <Link key={path} href={path} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 12, position: 'relative', textDecoration: 'none', transition: 'all 0.2s' }}>
              {active && (
                <motion.div layoutId="tab-bg" style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(201,168,76,0.08)' }} transition={{ type: 'spring', stiffness: 450, damping: 35 }} />
              )}
              <motion.div animate={active ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} style={{ position: 'relative', zIndex: 1 }}>
                <Icon size={21} strokeWidth={active ? 2.5 : 1.75} style={{ color: active ? '#C9A84C' : 'rgba(255,255,255,0.35)' }} />
              </motion.div>
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: active ? '#C9A84C' : 'rgba(255,255,255,0.28)', position: 'relative', zIndex: 1 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
