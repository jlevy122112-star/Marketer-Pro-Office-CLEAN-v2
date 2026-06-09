/**
 * SubscriptionBanner.tsx
 * Marketer Pro — Sticky subscription status banner.
 *
 * Shows only when action is needed:
 * - Trial ending (≤7 days left)
 * - Past due payment
 * - Subscription canceled (access ending)
 *
 * Matches void-900 dark + classified gold design system.
 * Never shown for healthy active subscriptions.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, AlertTriangle, Clock } from 'lucide-react';
import { useBilling } from '../hooks/useBilling';
import { useNavigate } from 'react-router-dom';

export const SubscriptionBanner: React.FC = () => {
  const { plan, status, trialDaysLeft, isTrialing, daysUntilRenewal, cancelAtPeriodEnd } = useBilling();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Determine which banner to show (priority order)
  type BannerVariant = 'trial-urgent' | 'trial-warning' | 'past-due' | 'canceling' | null;

  let variant: BannerVariant = null;

  if (status === 'past_due') {
    variant = 'past-due';
  } else if (cancelAtPeriodEnd && daysUntilRenewal !== null) {
    variant = 'canceling';
  } else if (isTrialing && trialDaysLeft !== null) {
    if (trialDaysLeft <= 2) variant = 'trial-urgent';
    else if (trialDaysLeft <= 7) variant = 'trial-warning';
  }

  if (!variant) return null;

  const config = {
    'trial-urgent': {
      bg: 'bg-red-950/80 border-red-500/20',
      icon: <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />,
      text: trialDaysLeft === 0
        ? 'Your trial ends today.'
        : `Your trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}.`,
      sub: 'Upgrade now to keep access to all your content.',
      cta: 'Upgrade Now',
      ctaStyle: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
    },
    'trial-warning': {
      bg: 'bg-amber-950/60 border-amber-500/20',
      icon: <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />,
      text: `${trialDaysLeft} days left in your trial.`,
      sub: 'Unlock unlimited generations and more.',
      cta: 'See Plans',
      ctaStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
    },
    'past-due': {
      bg: 'bg-red-950/80 border-red-500/30',
      icon: <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />,
      text: 'Payment failed.',
      sub: 'Update your payment method to keep your workspace running.',
      cta: 'Fix Payment',
      ctaStyle: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
    },
    'canceling': {
      bg: 'bg-slate-800/80 border-slate-600/20',
      icon: <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />,
      text: `Access ends in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? '' : 's'}.`,
      sub: 'Reactivate anytime to keep your vault and history.',
      cta: 'Reactivate',
      ctaStyle: 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10',
    },
  }[variant];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`
          w-full px-4 py-3 border-b backdrop-blur-md
          flex items-center gap-3
          ${config.bg}
        `}
        role="alert"
      >
        {config.icon}

        <div className="flex-1 min-w-0">
          <span className="text-xs font-heading text-slate-200 tracking-wide">
            {config.text}
          </span>
          <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
            {config.sub}
          </span>
        </div>

        <button
          onClick={() => navigate('/settings/billing')}
          className={`
            flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-heading
            tracking-wider uppercase transition-all
            ${config.ctaStyle}
          `}
        >
          {config.cta}
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionBanner;
