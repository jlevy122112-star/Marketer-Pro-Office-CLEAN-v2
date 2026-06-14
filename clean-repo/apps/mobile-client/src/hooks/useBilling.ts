// FILE PATH: src/hooks/useBilling.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PLANS } from '../lib/constants';
import type { Subscription } from '../types';
import type { PlanId } from '../lib/constants';
import { api } from '../lib/api';

export function useBilling() {
  const { session, refreshUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading]           = useState(true);
  const [upgrading, setUpgrading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      // PGRST116 = no rows found — means user is on free plan, not an error
      if (err && err.code !== 'PGRST116') throw err;

      if (data) {
        setSubscription({
          id:                data.id,
          userId:            data.user_id,
          planId:            data.plan_id as PlanId,
          status:            data.status as Subscription['status'],
          interval:          data.interval as Subscription['interval'],
          currentPeriodEnd:  data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          trialEnd:          data.trial_end ?? undefined,
        });
      } else {
        // No subscription row = free plan user
        setSubscription(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  // ── Checkout ─────────────────────────────────────────────────
  // FIX: was calling /api/billing/checkout — correct path is /billing/checkout
  // FIX: priceIds come from plan.priceIds which IS correctly set in constants.ts
  const startCheckout = useCallback(async (planId: PlanId, interval: 'monthly' | 'annual') => {
    const plan    = PLANS.find((p) => p.id === planId);
    const priceId = interval === 'annual' ? plan?.priceIds?.annual : plan?.priceIds?.monthly;

    if (!priceId) {
      throw new Error(
        `Price ID not configured for ${planId} ${interval}. ` +
        'Add VITE_STRIPE_PRO_MONTHLY_PRICE_ID etc. to your .env file.'
      );
    }

    setUpgrading(true);
    setError(null);
    try {
      const { url } = await api.post<{ url: string }>('/billing/checkout', {
        priceId,
        successUrl: `${window.location.origin}/settings?checkout=success`,
        cancelUrl:  `${window.location.origin}/billing`,
      });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
      throw e;
    } finally {
      setUpgrading(false);
    }
  }, []);

  // ── Customer portal ───────────────────────────────────────────
  const openPortal = useCallback(async () => {
    const { url } = await api.post<{ url: string }>('/billing/portal');
    window.location.href = url;
  }, []);

  // ── Feature gating ─────────────────────────────────────────────
  const canUse = useCallback((feature: string): boolean => {
    const planId = subscription?.planId ?? 'free';
    const active = !subscription || ['active', 'trialing'].includes(subscription.status);
    if (!active && planId !== 'free') return false;

    switch (feature) {
      case 'unlimited_generations': return planId === 'pro' || planId === 'enterprise';
      case 'multi_brand':           return planId === 'pro' || planId === 'enterprise';
      case 'analytics_90d':         return planId === 'pro' || planId === 'enterprise';
      case 'analytics_365d':        return planId === 'enterprise';
      case 'ppc':                   return planId === 'enterprise';
      case 'team_members':          return planId === 'enterprise';
      default:                      return true;
    }
  }, [subscription]);

  return {
    subscription,
    loading,
    upgrading,
    error,
    canUse,
    startCheckout,
    openPortal,
    refetch: fetchSubscription,
  };
}
