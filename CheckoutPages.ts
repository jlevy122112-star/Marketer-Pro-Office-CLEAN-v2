/**
 * CheckoutPages.tsx
 * Marketer Pro — Post-payment screens.
 *
 * CheckoutSuccessPage: shown after successful Stripe checkout.
 *   - Verifies the session server-side
 *   - Animates in the new plan confirmation
 *   - Gives user clear next action
 *
 * CheckoutCancelPage: shown when user abandons checkout.
 *   - No blame, no guilt
 *   - Soft re-engagement, not desperate
 *
 * Routes:
 *   /billing/success?session_id=cs_xxx  → CheckoutSuccessPage
 *   /billing/canceled                   → CheckoutCancelPage
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap, Star } from 'lucide-react';
import { useBilling } from '../../hooks/useBilling';

// ─── CheckoutSuccessPage ──────────────────────────────────────────────────────

export const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refresh, currentPlan, plan } = useBilling();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Give webhook 2 seconds to process, then refresh billing state
    const timer = setTimeout(async () => {
      await refresh();
      setReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [refresh]);

  return (
    <div className="min-h-screen bg-void-900 flex flex-col items-center justify-center px-6 safe-top safe-bottom">

      {/* Animated success mark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8"
      >
        {/* Outer ring pulse */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 w-24 h-24 rounded-full border border-classified/30"
          style={{ margin: '-12px' }}
        />
        <div className="w-24 h-24 rounded-full bg-classified/10 border border-classified/30 flex items-center justify-center">
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Check className="w-10 h-10 text-classified" strokeWidth={2} />
          </motion.div>
        </div>
      </motion.div>

      {/* Copy */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-sm"
      >
        <p className="font-display text-3xl tracking-[0.15em] text-classified mb-2">
          YOU'RE IN
        </p>
        <p className="font-heading text-lg text-slate-300 mb-3">
          Welcome to Marketer Pro {currentPlan.name}
        </p>
        <p className="text-sm text-slate-500 font-body leading-relaxed mb-8">
          Your workspace is upgraded and ready. Everything you unlocked is available right now.
        </p>

        {/* What's unlocked */}
        <div className="space-y-2 text-left mb-8">
          {currentPlan.features.slice(0, 4).map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-classified/5 border border-classified/15"
            >
              <Zap className="w-4 h-4 text-classified flex-shrink-0" />
              <span className="text-sm text-slate-300 font-body">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={() => navigate('/')}
          className="w-full h-13 rounded-xl font-heading text-sm tracking-wider uppercase flex items-center justify-center gap-2 text-void-900 hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)', height: '52px' }}
        >
          Open My Desk <ArrowRight className="w-4 h-4" />
        </motion.button>

        <p className="text-xs text-slate-700 font-body mt-4">
          Receipt sent to your email · Manage at any time in Settings
        </p>
      </motion.div>
    </div>
  );
};

// ─── CheckoutCancelPage ───────────────────────────────────────────────────────

export const CheckoutCancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-void-900 flex flex-col items-center justify-center px-6 safe-top safe-bottom">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-sm"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
          <Star className="w-7 h-7 text-slate-600" />
        </div>

        <h1 className="font-display text-2xl tracking-[0.12em] text-slate-300 mb-3">
          NO PROBLEM
        </h1>
        <p className="text-sm text-slate-500 font-body leading-relaxed mb-8">
          You're still on the Starter plan. Your vault and content are right where you left them.
          Upgrade whenever you're ready — no pressure.
        </p>

        {/* Options */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/settings/billing')}
            className="w-full h-12 rounded-xl bg-classified/10 text-classified border border-classified/20 font-heading text-xs tracking-wider uppercase hover:bg-classified/20 transition-all"
          >
            See Plans Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full h-12 rounded-xl bg-white/[0.03] text-slate-400 border border-white/[0.06] font-heading text-xs tracking-wider uppercase hover:bg-white/[0.06] transition-all"
          >
            Back to Desk
          </button>
        </div>

        <p className="text-xs text-slate-700 font-body mt-6">
          14-day free trial · Cancel anytime · No credit card required for Starter
        </p>
      </motion.div>
    </div>
  );
};
