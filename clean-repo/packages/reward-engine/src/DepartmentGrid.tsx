'use client';

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT GRID
// Renders the department list on the Desk departments view.
// Locked departments shown greyed with required level badge.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import type { Department } from './types';

interface DepartmentGridProps {
  departments: Department[];
  onEnter:     (dept: Department) => void;
}

export function DepartmentGrid({ departments, onEnter }: DepartmentGridProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {departments.map((dept, i) => (
        <motion.div
          key={dept.key}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => dept.unlocked && onEnter(dept)}
          role={dept.unlocked ? 'button' : undefined}
          aria-label={dept.unlocked ? `Enter ${dept.label}` : `${dept.label} — requires level ${dept.requiredLevel}`}
          tabIndex={dept.unlocked ? 0 : undefined}
          onKeyDown={(e) => { if (dept.unlocked && (e.key === 'Enter' || e.key === ' ')) onEnter(dept); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', borderRadius: 16,
            background: dept.unlocked ? 'rgba(13,17,32,0.85)' : 'rgba(13,17,32,0.4)',
            border: `1px solid ${dept.unlocked ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)'}`,
            opacity: dept.unlocked ? 1 : 0.5,
            cursor: dept.unlocked ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            background: dept.unlocked ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${dept.unlocked ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.06)'}`,
          }} aria-hidden>
            {dept.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <p style={{
                fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14,
                color: dept.unlocked ? '#fff' : 'rgba(255,255,255,0.3)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {dept.label}
              </p>
              {dept.unlocked ? (
                <span style={{
                  fontFamily: "'Syne',sans-serif", fontSize: 8, fontWeight: 700,
                  letterSpacing: '0.15em', textTransform: 'uppercase', padding: '2px 6px',
                  borderRadius: 4, background: 'rgba(201,168,76,0.12)', color: '#C9A84C',
                  border: '1px solid rgba(201,168,76,0.22)', flexShrink: 0,
                }}>
                  OPEN
                </span>
              ) : (
                <span style={{
                  fontFamily: "'Syne',sans-serif", fontSize: 8, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase', padding: '2px 6px',
                  borderRadius: 4, background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.25)', flexShrink: 0,
                }}>
                  LVL {dept.requiredLevel}
                </span>
              )}
            </div>
            <p style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: 12,
              color: 'rgba(255,255,255,0.3)', lineHeight: 1.4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {dept.description}
            </p>
          </div>

          {dept.unlocked && (
            <span aria-hidden style={{ color: 'rgba(201,168,76,0.4)', fontSize: 20, flexShrink: 0 }}>›</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
