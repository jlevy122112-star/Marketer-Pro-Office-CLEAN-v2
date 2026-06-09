/**
 * BillingPage.tsx  (Settings → Billing)
 * Marketer Pro Office Edition — Full Subscription & Billing UI
 *
 * Sections:
 *   1. Current plan status + usage meters
 *   2. Plan comparison + upgrade/downgrade
 *   3. Payment method
 *   4. Invoice history
 *   5. Danger zone (cancel / reactivate)
 *
 * Design system: void-900 dark, classified gold, reactor accent,
 * font-display / font-heading / font-classified / font-body,
 * framer-motion animations, matching HelpCenterPage & LoginPage exactly.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, CreditCard, Zap, Check, X,
  Download, AlertTriangle, RefreshCw, ArrowRight,
  Clock, Shield, Star, Users, BarChart3, Globe,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { useBilling, PLANS, type PlanId, type BillingInterval } from '../hooks/useBilling';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Usage meter ──────────────────────────────────────────────────────────────

const UsageMeter: React.FC<{
  label: string;
  used: number;
  limit: number | 'unlimited';
  icon: React.ReactNode;
}> = ({ label, used, limit, icon }) => {
  const pct = limit === 'unlimited' ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = pct >= 80;
  const isAtLimit = pct >= 100;

  const barColor = isAtLimit
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-amber-500'
    : 'bg-classified';

  return (
    <div className="p-3 rounded-xl bg-void-900/60 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-4 h-4 text-slate-600">{icon}</span>
          <span className="text-xs font-body">{label}</span>
        </div>
        <span className="text-xs font-heading text-slate-400 tracking-wide">
          {limit === 'unlimited' ? (
            <span className="text-classified/70">Unlimited</span>
          ) : (
            <><span className={isAtLimit ? 'text-red-400' : 'text-slate-300'}>{used}</span>
            <span className="text-slate-700"> / {limit}</span></>
          )}
        </span>
      </div>
      {limit !== 'unlimited' && (
        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
      )}
    </div>
  );
};

// ─── Plan card ────────────────────────────────────────────────────────────────

const PlanCard: React.FC<{
  plan: typeof PLANS[0];
  isCurrent: boolean;
  interval: BillingInterval;
  onSelect: (id: PlanId) => void;
  loading: boolean;
}> = ({ plan, isCurrent, interval, onSelect, loading }) => {
  const price = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const savings = Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-4 rounded-xl border transition-all
        ${isCurrent
          ? 'border-classified/50 bg-classified/5'
          : plan.id === 'pro'
          ? 'border-classified/25 bg-white/[0.02]'
          : 'border-white/[0.06] bg-white/[0.01]'}
      `}
    >
      {/* Current badge */}
      {isCurrent && (
        <div className="absolute -top-2.5 left-4">
          <span className="px-2 py-0.5 rounded text-[9px] font-classified tracking-widest uppercase bg-classified/20 text-classified border border-classified/30">
            Current Plan
          </span>
        </div>
      )}

      {/* Popular badge */}
      {plan.badge && !isCurrent && (
        <div className="absolute -top-2.5 left-4">
          <span className="px-2 py-0.5 rounded text-[9px] font-classified tracking-widest uppercase bg-classified text-void-900">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-heading text-sm text-slate-200 tracking-wide">{plan.name}</p>
          <p className="text-xs text-slate-600 font-body mt-0.5">{plan.tagline}</p>
        </div>
        <div className="text-right">
          {plan.monthlyPrice === 0 ? (
            <p className="font-display text-2xl text-slate-400 tracking-wider">Free</p>
          ) : (
            <>
              <p className="font-display text-2xl text-classified tracking-wider">${price}</p>
              <p className="text-[10px] text-slate-600 font-body">
                /mo{interval === 'annual' && plan.monthlyPrice > 0
                  ? <span className="text-emerald-500 ml-1">save {savings}%</span>
                  : ''}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Features list */}
      <div className="space-y-1.5 mb-4">
        {plan.features.map(f => (
          <div key={f} className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-classified/60 flex-shrink-0" />
            <span className="text-xs text-slate-500 font-body">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {isCurrent ? (
        <div className="w-full h-10 rounded-xl flex items-center justify-center border border-classified/20 text-classified/50 text-xs font-heading tracking-wider uppercase">
          Active
        </div>
      ) : (
        <button
          onClick={() => onSelect(plan.id)}
          disabled={loading}
          className={`
            w-full h-10 rounded-xl font-heading text-xs tracking-wider uppercase
            flex items-center justify-center gap-2 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
            ${plan.id === 'pro' || plan.id === 'enterprise'
              ? 'text-void-900 hover:opacity-90'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}
          `}
          style={
            plan.id === 'pro'
              ? { background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)' }
              : plan.id === 'enterprise'
              ? { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }
              : {}
          }
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : plan.monthlyPrice === 0 ? (
            'Downgrade'
          ) : (
            <>Upgrade to {plan.name} <ArrowRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </motion.div>
  );
};

// ─── Cancel modal ─────────────────────────────────────────────────────────────

const CancelModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  renewalDate: string | null;
}> = ({ open, onClose, onConfirm, renewalDate }) => {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm();
    setConfirming(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void-900/90 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm z-50"
          >
            <div className="bg-desk-800 border border-red-500/20 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="font-display text-base tracking-[0.15em] text-slate-200 text-center mb-2">
                  CANCEL SUBSCRIPTION?
                </h3>
                <p className="text-sm text-slate-500 text-center font-body leading-relaxed mb-1">
                  You'll keep full access until{' '}
                  <span className="text-slate-300">{formatDate(renewalDate)}</span>.
                </p>
                <p className="text-xs text-slate-600 text-center font-body mb-6">
                  Your vault, history, and brand profiles are saved. Reactivate anytime.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="w-full h-11 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-heading text-xs tracking-wider uppercase hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {confirming
                      ? <><span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />Canceling…</>
                      : 'Yes, Cancel Subscription'}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full h-11 rounded-xl bg-white/5 text-slate-400 border border-white/10 font-heading text-xs tracking-wider uppercase hover:bg-white/10 transition-all"
                  >
                    Keep My Plan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Main BillingPage ─────────────────────────────────────────────────────────

export const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    plan, status, interval: currentInterval,
    currentPeriodEnd, trialEnd, trialDaysLeft,
    isTrialing, cancelAtPeriodEnd, daysUntilRenewal,
    usage, invoices, paymentMethod,
    loading, error,
    currentPlan, annualSavingsPct,
    openCheckout, openPortal, cancelSubscription,
    refresh,
  } = useBilling();

  const [billingInterval, setBillingInterval] = useState<BillingInterval>('annual');
  const [upgradingPlan, setUpgradingPlan] = useState<PlanId | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const handleUpgrade = async (planId: PlanId) => {
    setUpgradingPlan(planId);
    await openCheckout(planId, billingInterval);
    setUpgradingPlan(null);
  };

  // ── Mock usage for display (replace with real API data) ──────────────────
  const displayUsage = usage.length > 0 ? usage : [
    { label: 'Generations this month', used: 18, limit: currentPlan.limits.generationsPerMonth, unit: '' },
    { label: 'Social accounts', used: 1, limit: currentPlan.limits.socialAccounts, unit: '' },
    { label: 'Brand profiles', used: 1, limit: currentPlan.limits.brandProfiles, unit: '' },
    { label: 'Team members', used: 1, limit: currentPlan.limits.teamMembers, unit: '' },
  ];

  // ── Mock invoices ────────────────────────────────────────────────────────
  const displayInvoices = invoices.length > 0 ? invoices : [
    { id: 'inv_001', date: '2025-06-01', amount: 2900, status: 'paid' as const, downloadUrl: '#' },
    { id: 'inv_002', date: '2025-05-01', amount: 2900, status: 'paid' as const, downloadUrl: '#' },
    { id: 'inv_003', date: '2025-04-01', amount: 2900, status: 'paid' as const, downloadUrl: '#' },
  ];

  const visibleInvoices = showAllInvoices ? displayInvoices : displayInvoices.slice(0, 3);

  return (
    <div className="min-h-screen bg-void-900 safe-top">

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-void-900/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="font-display text-base tracking-[0.15em] text-classified">BILLING & PLANS</p>
            <p className="font-classified text-[9px] tracking-[0.2em] text-slate-600 uppercase">
              {currentPlan.name} Plan
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={refresh}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 safe-bottom">

        {/* ── Error state ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 flex items-center gap-3"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-300 font-body">{error}</p>
            <button onClick={refresh} className="ml-auto text-xs text-red-400 font-heading tracking-wide">Retry</button>
          </motion.div>
        )}

        {/* ── 1. Current plan card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-4 rounded-2xl border border-classified/30 bg-classified/5 overflow-hidden"
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-classified/60 to-transparent" />

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display text-lg tracking-[0.12em] text-classified">{currentPlan.name.toUpperCase()}</p>
                {/* Status badge */}
                <span className={`
                  px-2 py-0.5 rounded text-[9px] font-classified tracking-widest uppercase border
                  ${status === 'active' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                    : status === 'trialing' ? 'text-classified border-classified/20 bg-classified/5'
                    : status === 'past_due' ? 'text-red-400 border-red-500/20 bg-red-500/5'
                    : status === 'canceled' ? 'text-slate-500 border-slate-500/20 bg-slate-500/5'
                    : 'text-slate-400 border-slate-500/20 bg-slate-500/5'}
                `}>
                  {status === 'trialing' ? `Trial · ${trialDaysLeft}d left`
                    : status === 'past_due' ? 'Payment Due'
                    : status === 'canceled' ? 'Canceled'
                    : cancelAtPeriodEnd ? 'Canceling'
                    : 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-body">{currentPlan.tagline}</p>
            </div>

            {currentPlan.monthlyPrice > 0 && (
              <div className="text-right">
                <p className="font-display text-2xl text-classified tracking-wider">
                  ${currentInterval === 'annual' ? currentPlan.annualPrice : currentPlan.monthlyPrice}
                </p>
                <p className="text-[10px] text-slate-600 font-body capitalize">/mo · {currentInterval}</p>
              </div>
            )}
          </div>

          {/* Renewal / trial info */}
          {(currentPeriodEnd || trialEnd) && (
            <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-void-900/40 border border-white/[0.04]">
              <Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <p className="text-xs text-slate-500 font-body">
                {cancelAtPeriodEnd
                  ? `Access ends ${formatDate(currentPeriodEnd)}`
                  : isTrialing
                  ? `Trial ends ${formatDate(trialEnd)}`
                  : `Renews ${formatDate(currentPeriodEnd)}`}
                {daysUntilRenewal !== null && !cancelAtPeriodEnd && (
                  <span className="text-slate-600 ml-1">({daysUntilRenewal} days)</span>
                )}
              </p>
            </div>
          )}

          {/* Usage meters */}
          <div className="space-y-2">
            {displayUsage.map(u => (
              <UsageMeter
                key={u.label}
                label={u.label}
                used={u.used}
                limit={u.limit}
                icon={
                  u.label.includes('Generation') ? <Zap className="w-3.5 h-3.5" /> :
                  u.label.includes('account') ? <Globe className="w-3.5 h-3.5" /> :
                  u.label.includes('brand') ? <Shield className="w-3.5 h-3.5" /> :
                  <Users className="w-3.5 h-3.5" />
                }
              />
            ))}
          </div>
        </motion.div>

        {/* ── 2. Upgrade section ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden"
        >
          {/* Toggle header */}
          <button
            onClick={() => setShowPlans(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-classified" />
              <span className="font-heading text-sm text-slate-300 tracking-wide">
                {plan === 'enterprise' ? 'Your Plan' : 'Upgrade Plan'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {plan !== 'enterprise' && (
                <span className="text-[10px] text-emerald-400 font-classified tracking-widest uppercase">
                  Save {annualSavingsPct(PLANS.find(p => p.id === 'pro')!)}% annually
                </span>
              )}
              {showPlans
                ? <ChevronUp className="w-4 h-4 text-slate-600" />
                : <ChevronDown className="w-4 h-4 text-slate-600" />}
            </div>
          </button>

          <AnimatePresence>
            {showPlans && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {/* Interval toggle */}
                  <div className="flex items-center justify-center pt-1">
                    <div className="flex items-center gap-1 p-1 bg-void-900/60 rounded-xl border border-white/[0.06]">
                      {(['monthly', 'annual'] as BillingInterval[]).map(i => (
                        <button
                          key={i}
                          onClick={() => setBillingInterval(i)}
                          className={`
                            px-4 py-1.5 rounded-lg text-xs font-heading tracking-wider uppercase transition-all
                            ${billingInterval === i
                              ? 'bg-classified/20 text-classified border border-classified/30'
                              : 'text-slate-500 hover:text-slate-300'}
                          `}
                        >
                          {i}
                          {i === 'annual' && (
                            <span className="ml-1.5 text-[9px] text-emerald-400 font-classified">SAVE 34%</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plan cards */}
                  {PLANS.map(p => (
                    <PlanCard
                      key={p.id}
                      plan={p}
                      isCurrent={p.id === plan}
                      interval={billingInterval}
                      onSelect={handleUpgrade}
                      loading={upgradingPlan === p.id}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── 3. Payment method ── */}
        {plan !== 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span className="font-heading text-sm text-slate-300 tracking-wide">Payment Method</span>
              </div>
              <button
                onClick={openPortal}
                className="text-xs text-classified font-classified tracking-widest uppercase hover:text-classified-light transition-colors"
              >
                Manage →
              </button>
            </div>

            {paymentMethod ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-void-900/60 border border-white/[0.04]">
                <div className="w-10 h-7 rounded bg-slate-800 border border-white/[0.08] flex items-center justify-center">
                  <span className="text-[9px] font-heading text-slate-400 uppercase">
                    {paymentMethod.brand === 'visa' ? 'VISA'
                      : paymentMethod.brand === 'mastercard' ? 'MC'
                      : paymentMethod.brand.toUpperCase().slice(0, 4)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-heading text-slate-300 tracking-wide">
                    •••• •••• •••• {paymentMethod.last4}
                  </p>
                  <p className="text-[11px] text-slate-600 font-body">
                    Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-void-900/60 border border-dashed border-white/[0.06] flex items-center justify-between">
                <p className="text-xs text-slate-600 font-body">No payment method on file</p>
                <button
                  onClick={openPortal}
                  className="text-xs text-classified font-classified tracking-widest uppercase hover:text-classified-light transition-colors"
                >
                  Add Card
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── 4. Invoice history ── */}
        {plan !== 'free' && displayInvoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <span className="font-heading text-sm text-slate-300 tracking-wide">Invoice History</span>
              </div>
              <button
                onClick={openPortal}
                className="text-xs text-classified font-classified tracking-widest uppercase hover:text-classified-light transition-colors"
              >
                All Invoices →
              </button>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {visibleInvoices.map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-heading text-slate-300 tracking-wide">
                      {formatDate(inv.date)}
                    </p>
                    <span className={`
                      text-[10px] font-classified tracking-widest uppercase
                      ${inv.status === 'paid' ? 'text-emerald-500'
                        : inv.status === 'open' ? 'text-amber-400'
                        : 'text-slate-600'}
                    `}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="font-heading text-sm text-slate-300">
                    {formatCurrency(inv.amount)}
                  </p>
                  <a
                    href={inv.downloadUrl}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors"
                    aria-label="Download invoice"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </motion.div>
              ))}
            </div>

            {displayInvoices.length > 3 && (
              <button
                onClick={() => setShowAllInvoices(p => !p)}
                className="w-full py-3 text-xs text-slate-600 font-body hover:text-slate-400 transition-colors flex items-center justify-center gap-1"
              >
                {showAllInvoices ? 'Show less' : `Show ${displayInvoices.length - 3} more`}
                {showAllInvoices ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </motion.div>
        )}

        {/* ── 5. Danger zone ── */}
        {plan !== 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl border border-dashed border-red-500/15 bg-red-950/10"
          >
            <p className="text-[10px] font-classified tracking-widest uppercase text-red-900/60 mb-3">
              Danger Zone
            </p>
            {cancelAtPeriodEnd ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-body">
                  Your plan cancels on <span className="text-slate-300">{formatDate(currentPeriodEnd)}</span>.
                  Change your mind?
                </p>
                <button
                  onClick={() => openCheckout(plan, currentInterval)}
                  className="w-full h-10 rounded-xl bg-classified/10 text-classified border border-classified/20 font-heading text-xs tracking-wider uppercase hover:bg-classified/20 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reactivate Subscription
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCancel(true)}
                className="w-full h-10 rounded-xl bg-red-500/5 text-red-500/60 border border-red-500/15 font-heading text-xs tracking-wider uppercase hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25 transition-all"
              >
                Cancel Subscription
              </button>
            )}
          </motion.div>
        )}

        {/* ── Guarantee footer ── */}
        <div className="flex items-center justify-center gap-2 py-2">
          <Shield className="w-3.5 h-3.5 text-slate-700" />
          <p className="text-[11px] text-slate-700 font-body text-center">
            14-day money-back guarantee · Encrypted payments · Cancel anytime
          </p>
        </div>

      </div>

      {/* ── Cancel modal ── */}
      <CancelModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={cancelSubscription}
        renewalDate={currentPeriodEnd}
      />
    </div>
  );
};

export default BillingPage;
