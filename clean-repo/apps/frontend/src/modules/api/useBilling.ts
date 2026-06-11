'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Subscription {
  id: string;
  planId: string;
  status: string;
  interval: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export function useBilling() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading]           = useState(true);
  const [upgrading, setUpgrading]       = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await api.get<Subscription>('/billing/subscription');
      setSubscription(data);
    } catch { setSubscription(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const canUse = useCallback((feature: string): boolean => {
    const planId = subscription?.planId ?? 'free';
    const active = !subscription || ['active','trialing'].includes(subscription.status);
    if (!active) return false;
    const map: Record<string, string[]> = {
      unlimited_generations: ['pro','enterprise'],
      multi_brand:           ['pro','enterprise'],
      analytics_90d:         ['pro','enterprise'],
      analytics_365d:        ['enterprise'],
      team_members:          ['enterprise'],
      white_label:           ['enterprise'],
    };
    return map[feature]?.includes(planId) ?? true;
  }, [subscription]);

  const startCheckout = useCallback(async (planId: string, interval: 'monthly' | 'annual') => {
    setUpgrading(true);
    try {
      const priceMap: Record<string, string> = {
        'pro-monthly':        process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY!,
        'pro-annual':         process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL!,
        'enterprise-monthly': process.env.NEXT_PUBLIC_STRIPE_ENT_MONTHLY!,
        'enterprise-annual':  process.env.NEXT_PUBLIC_STRIPE_ENT_ANNUAL!,
      };
      const priceId = priceMap[`${planId}-${interval}`];
      if (!priceId) throw new Error('Price not configured');
      const { url } = await api.post<{ url: string }>('/billing/checkout', {
        priceId,
        successUrl: `${window.location.origin}/settings?success=1`,
        cancelUrl:  `${window.location.origin}/office/settings`,
      });
      window.location.href = url;
    } finally {
      setUpgrading(false);
    }
  }, []);

  const openPortal = useCallback(async () => {
    const { url } = await api.post<{ url: string }>('/billing/portal');
    window.location.href = url;
  }, []);

  return { subscription, loading, upgrading, canUse, startCheckout, openPortal, refetch: fetchSubscription };
}
