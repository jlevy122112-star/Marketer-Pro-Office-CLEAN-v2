---

## FILE 22/24: `src/components/desk/departments/DepartmentDoors.tsx` — XP context on locked departments

```tsx
// FILE PATH: src/components/desk/departments/DepartmentDoors.tsx
import { motion } from 'framer-motion';
import { Lock, ChevronRight } from 'lucide-react';
import { DEPARTMENTS, XP_THRESHOLDS } from '../../../lib/constants';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getXPProgress } from '../../../lib/constants';

interface DepartmentDoorsProps {
  userLevel: number;
}

export function DepartmentDoors({ userLevel }: DepartmentDoorsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const xpData   = user ? getXPProgress(user.xp) : null;

  function getXPToNextLevel(requiredLevel: number): number {
    const currentXP = user?.xp ?? 0;
    const targetXP  = XP_THRESHOLDS[requiredLevel - 1] ?? 0;
    return Math.max(0, targetXP - currentXP);
  }

  // Route map — each department key maps to a page/scene
  const DEPT_ROUTES: Record<string, string> = {
    brand_identity_chamber: '/settings',   // Brand tab in settings for now
    audience_arena:         '/settings',
    content_forge:          '/create',
    tone_lab:               '/create',
    artifact_vault:         '/create',
    scheduler_tower:        '/plan',
    analytics_observatory:  '/analyze',
    ppc_command_center:     '/analyze',
    multiverse_gate:        '/create',
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-sm mb-2" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
        Level up by generating content and publishing posts to unlock new departments.
      </p>
      {DEPARTMENTS.map((dept, i) => {
        const unlocked = userLevel >= dept.requiredLevel;
        const xpNeeded = !unlocked ? getXPToNextLevel(dept.requiredLevel) : 0;
        // Estimate posts needed (~10 XP per generation)
        const generationsNeeded = Math.ceil(xpNeeded / 10);

        return (
          <motion.div
            key={dept.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <button
              onClick={() => unlocked && navigate(DEPT_ROUTES[dept.key] ?? '/create')}
              disabled={!unlocked}
              className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
              style={{
                background: unlocked ? 'rgba(15,22,41,0.8)' : 'rgba(15,22,41,0.4)',
                border: `1px solid ${unlocked ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)'}`,
                opacity: unlocked ? 1 : 0.6,
                cursor: unlocked ? 'pointer' : 'not-allowed',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                   style={{ background: unlocked ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)' }}>
                {dept.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-display font-semibold text-sm text-white truncate">{dept.label}</p>
                  {unlocked ? (
                    <span className="badge-classified text-2xs flex-shrink-0">Open</span>
                  ) : (
                    <span className="badge-classified text-2xs flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      LVL {dept.requiredLevel}
                    </span>
                  )}
                </div>
                <p className="font-body text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{dept.description}</p>
                {/* XP context for locked departments */}
                {!unlocked && xpNeeded > 0 && (
                  <p className="font-body text-2xs mt-1" style={{ color: 'rgba(201,168,76,0.5)' }}>
                    {xpNeeded} XP needed · Generate ~{generationsNeeded} more posts
                  </p>
                )}
              </div>
              {unlocked ? (
                <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              ) : (
                <Lock size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              )}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
