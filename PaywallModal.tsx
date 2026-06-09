/**
 * PaywallModal.tsx
 * Marketer Pro — Plan limit paywall.
 *
 * Fires when a user hits a feature gate (generation limit,
 * social accounts, team members, etc.).
 *
 * Design: dark modal, classified gold accents, cinematic feel
 * matching the Vault/reactor design language.
 * Never feels like a wall — feels like an invitation.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Lock, Check, ArrowRight } from 'lucide-react';
import { PLANS, type PlanId, type BillingInterval } from '../hooks/useBilling';
import { useBilling } from '../hooks/useBilling';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  /** Which feature was gated — shown in the headline */
  feature?: string;
  /** Which plan is required minimum */
  requiredPlan?: PlanId;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PaywallModal: React.FC<PaywallModalProps> = ({
  open,
  onClose,
  feature = 'this feature',
  requiredPlan = 'pro',
}) => {
  const { plan: currentPlan, openCheckout } = useBilling();
  const [interval, setInterval] = useState<BillingInterval>('annual');
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);

  // Show plans above the current one
  const upgradePlans = PLANS.filter(p =>
    p.id !== 'free' &&
    (currentPlan === 'free' ? true : p.id === 'enterprise')
  );

  const handleUpgrade = async (planId: PlanId) => {
    setUpgrading(planId);
    await openCheckout(planId, interval);
    setUpgrading(null);
  };

  const savingsPct = (plan: typeof PLANS[0]) =>
    plan.monthlyPrice > 0
      ? Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100)
      : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void-900/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50"
          >
            <div className="bg-desk-800 border border-white/[0.08] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">

              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.06]">
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-classified/60 to-transparent" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-classified/10 border border-classified/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-classified" />
                    </div>
                    <div>
                      <p className="font-display text-sm tracking-[0.15em] text-classified">
                        UPGRADE REQUIRED
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-body">
                        Unlock {feature}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interval toggle */}
              <div className="flex items-center justify-center gap-3 px-6 pt-5">
                <div className="flex items-center gap-1 p-1 bg-void-900/60 rounded-xl border border-white/[0.06]">
                  {(['monthly', 'annual'] as BillingInterval[]).map(i => (
                    <button
                      key={i}
                      onClick={() => setInterval(i)}
                      className={`
                        px-4 py-1.5 rounded-lg text-xs font-heading tracking-wider uppercase transition-all
                        ${interval === i
                          ? 'bg-classified/20 text-classified border border-classified/30'
                          : 'text-slate-500 hover:text-slate-300'}
                      `}
                    >
                      {i}
                      {i === 'annual' && (
                        <span className="ml-1.5 text-[9px] text-emerald-400">SAVE 34%</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan cards */}
              <div className="px-4 pt-4 pb-2 space-y-3">
                {upgradePlans.map(plan => {
                  const price = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                  const isPopular = plan.id === 'pro';
                  const isLoading = upgrading === plan.id;

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`
                        relative p-4 rounded-xl border transition-all
                        ${isPopular
                          ? 'border-classified/40 bg-classified/5'
                          : 'border-white/[0.08] bg-white/[0.02]'}
                      `}
                    >
                      {/* Popular badge */}
                      {plan.badge && (
                        <div className="absolute -top-2.5 left-4">
                          <span className="px-2 py-0.5 rounded text-[9px] font-classified tracking-widest uppercase bg-classified text-void-900">
                            {plan.badge}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-heading text-sm text-slate-200 tracking-wide">
                            {plan.name}
                          </p>
                          <p className="text-xs text-slate-600 font-body">{plan.tagline}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl text-classified tracking-wider">
                            ${price}
                          </p>
                          <p className="text-[10px] text-slate-600 font-body">
                            /mo{interval === 'annual' ? ' · billed annually' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Top 4 features */}
                      <div className="grid grid-cols-2 gap-1 mb-3">
                        {plan.features.slice(0, 4).map(f => (
                          <div key={f} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-classified/70 flex-shrink-0" />
                            <span className="text-[11px] text-slate-500 font-body truncate">{f}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isLoading}
                        className={`
                          w-full h-11 rounded-xl font-heading text-sm tracking-wider uppercase
                          flex items-center justify-center gap-2 transition-all
                          disabled:opacity-60 disabled:cursor-not-allowed
                          ${isPopular
                            ? 'bg-classified text-void-900 hover:bg-classified-light active:scale-[0.98]'
                            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}
                        `}
                        style={isPopular ? { background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)' } : {}}
                      >
                        {isLoading ? (
                          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        ) : (
                          <>
                            Upgrade to {plan.name}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 text-center">
                <p className="text-[11px] text-slate-700 font-body">
                  14-day money-back guarantee · Cancel anytime · No questions asked
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaywallModal;
