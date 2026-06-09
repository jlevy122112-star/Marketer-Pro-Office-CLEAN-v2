/**
 * PlanLimitGuard.tsx
 * Marketer Pro — Feature gate component.
 *
 * Wraps any UI element that requires a minimum plan.
 * When a user without the required plan interacts with the element,
 * it intercepts the action and shows the PaywallModal instead.
 *
 * Usage:
 *   <PlanLimitGuard requiredPlan="pro" feature="unlimited generations">
 *     <GenerateButton />
 *   </PlanLimitGuard>
 *
 *   // Or as a hook:
 *   const { checkAccess } = usePlanLimit('pro');
 *   const handleGenerate = () => {
 *     if (!checkAccess()) return; // opens paywall if needed
 *     doGenerate();
 *   };
 */

import React, { useState, useCallback, createContext, useContext } from 'react';
import { PaywallModal } from './PaywallModal';
import { useBilling } from '../../hooks/useBilling';
import type { PlanId } from '../../config/plans.config';

// ─── Plan rank helper ─────────────────────────────────────────────────────────

const PLAN_RANK: Record<PlanId, number> = { free: 1, pro: 2, enterprise: 3 };

function meetsRequirement(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];
}

// ─── PlanLimitGuard component ─────────────────────────────────────────────────

interface PlanLimitGuardProps {
  requiredPlan: PlanId;
  feature?: string;
  children: React.ReactNode;
  /** If true, renders children as disabled + shows lock indicator */
  showLock?: boolean;
}

export const PlanLimitGuard: React.FC<PlanLimitGuardProps> = ({
  requiredPlan,
  feature = 'this feature',
  children,
  showLock = false,
}) => {
  const { plan } = useBilling();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const hasAccess = meetsRequirement(plan, requiredPlan);

  if (hasAccess) return <>{children}</>;

  return (
    <>
      <div
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPaywallOpen(true); }}
        style={{ position: 'relative', cursor: 'pointer' }}
        aria-label={`Upgrade to ${requiredPlan} to access ${feature}`}
      >
        {/* Dim the locked content */}
        <div style={{ opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>

        {/* Lock overlay */}
        {showLock && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 'inherit',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '999px',
            }}>
              <span style={{ fontSize: '11px', color: '#c9a84c' }}>🔒</span>
              <span style={{
                fontSize: '10px',
                color: '#c9a84c',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {requiredPlan}
              </span>
            </div>
          </div>
        )}
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature={feature}
        requiredPlan={requiredPlan}
      />
    </>
  );
};

// ─── usePlanLimit hook ────────────────────────────────────────────────────────

export function usePlanLimit(requiredPlan: PlanId, feature?: string) {
  const { plan } = useBilling();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const hasAccess = meetsRequirement(plan, requiredPlan);

  const checkAccess = useCallback((): boolean => {
    if (hasAccess) return true;
    setPaywallOpen(true);
    return false;
  }, [hasAccess]);

  const PaywallGate = useCallback(() => (
    <PaywallModal
      open={paywallOpen}
      onClose={() => setPaywallOpen(false)}
      feature={feature}
      requiredPlan={requiredPlan}
    />
  ), [paywallOpen, feature, requiredPlan]);

  return { hasAccess, checkAccess, PaywallGate, paywallOpen, setPaywallOpen };
}

export default PlanLimitGuard;
