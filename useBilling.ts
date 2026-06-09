/**
 * useBilling.ts
 * Marketer Pro — Subscription & Billing State Hook
 *
 * Matches the app's existing dark/classified design system.
 * Provides plan state, usage meters, upgrade/cancel flows,
 * and trial countdown — all self-healing on failure.
 */

import { useState, useEffect, useCallback } from 'react';
import { healingRun } from '../lib/selfHealing';

// ─── Plan definitions ─────────────────────────────────────────────────────────

export type PlanId = 'free' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'paused';

export interface PlanFeature {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
  highlight?: boolean; // bold in comparison table
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number; // per month billed annually
  color: string;      // tailwind color token
  badge?: string;     // e.g. "Most Popular"
  features: string[]; // bullet list for plan card
  limits: {
    generationsPerMonth: number | 'unlimited';
    socialAccounts: number | 'unlimited';
    teamMembers: number | 'unlimited';
    brandProfiles: number | 'unlimited';
    analyticsHistory: string;
    aiModels: string;
  };
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    tagline: 'Try the Vault',
    monthlyPrice: 0,
    annualPrice: 0,
    color: 'slate',
    features: [
      '25 AI generations / month',
      '1 social account',
      '1 brand profile',
      '7-day analytics',
      'Standard AI model',
      'Community support',
    ],
    limits: {
      generationsPerMonth: 25,
      socialAccounts: 1,
      teamMembers: 1,
      brandProfiles: 1,
      analyticsHistory: '7 days',
      aiModels: 'Standard',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Built for creators',
    monthlyPrice: 29,
    annualPrice: 19,
    color: 'classified',
    badge: 'Most Popular',
    features: [
      'Unlimited AI generations',
      '10 social accounts',
      '5 brand profiles',
      '90-day analytics',
      'Advanced AI model',
      'Priority support',
      'Vault progression system',
      'Content scheduling',
    ],
    limits: {
      generationsPerMonth: 'unlimited',
      socialAccounts: 10,
      teamMembers: 3,
      brandProfiles: 5,
      analyticsHistory: '90 days',
      aiModels: 'Advanced',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For serious teams',
    monthlyPrice: 99,
    annualPrice: 79,
    color: 'reactor',
    features: [
      'Unlimited everything',
      'Unlimited team members',
      'Unlimited brand profiles',
      '1-year analytics',
      'Frontier AI model',
      'Dedicated support',
      'Custom integrations',
      'SSO & advanced RBAC',
      'SLA guarantee',
    ],
    limits: {
      generationsPerMonth: 'unlimited',
      socialAccounts: 'unlimited',
      teamMembers: 'unlimited',
      brandProfiles: 'unlimited',
      analyticsHistory: '1 year',
      aiModels: 'Frontier',
    },
  },
];

// ─── Subscription state ───────────────────────────────────────────────────────

export interface UsageMetric {
  label: string;
  used: number;
  limit: number | 'unlimited';
  unit: string;
}

export interface BillingState {
  plan: PlanId;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  usage: UsageMetric[];
  invoices: Invoice[];
  paymentMethod: PaymentMethod | null;
  loading: boolean;
  error: string | null;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'open' | 'void';
  downloadUrl: string;
}

export interface PaymentMethod {
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'apple_pay' | 'google_pay';
  last4: string;
  expMonth: number;
  expYear: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBilling() {
  const [state, setState] = useState<BillingState>({
    plan: 'free',
    status: 'active',
    interval: 'monthly',
    currentPeriodEnd: null,
    trialEnd: null,
    cancelAtPeriodEnd: false,
    usage: [],
    invoices: [],
    paymentMethod: null,
    loading: true,
    error: null,
  });

  const fetchBilling = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));

    const result = await healingRun('fetch-billing', async () => {
      // Dynamic import to avoid circular deps
      const { createApiClient } = await import('../packages/api-client/src');
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const tenantId = session?.user?.user_metadata?.tenant_id ?? null;

      const client = createApiClient({
        getToken: async () => session?.access_token ?? null,
        getTenantId: () => tenantId,
      });

      const [sub] = await Promise.all([client.billing.subscription()]);
      return sub;
    });

    if (result.data) {
      const sub = result.data as any;
      setState(s => ({
        ...s,
        plan: sub.plan ?? 'free',
        status: sub.status ?? 'active',
        interval: sub.interval ?? 'monthly',
        currentPeriodEnd: sub.currentPeriodEnd ?? null,
        trialEnd: sub.trialEnd ?? null,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
        loading: false,
        error: null,
      }));
    } else {
      setState(s => ({
        ...s,
        loading: false,
        error: result.userMessage,
      }));
    }
  }, []);

  useEffect(() => { fetchBilling(); }, [fetchBilling]);

  // ── Computed helpers ────────────────────────────────────────────────────────

  const currentPlan = PLANS.find(p => p.id === state.plan) ?? PLANS[0];

  const trialDaysLeft = state.trialEnd
    ? Math.max(0, Math.ceil((new Date(state.trialEnd).getTime() - Date.now()) / 86400000))
    : null;

  const isTrialing = state.status === 'trialing' && trialDaysLeft !== null && trialDaysLeft > 0;

  const daysUntilRenewal = state.currentPeriodEnd
    ? Math.max(0, Math.ceil((new Date(state.currentPeriodEnd).getTime() - Date.now()) / 86400000))
    : null;

  const annualSavings = (plan: Plan) =>
    Math.round((plan.monthlyPrice - plan.annualPrice) * 12);

  const annualSavingsPct = (plan: Plan) =>
    plan.monthlyPrice > 0
      ? Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100)
      : 0;

  // ── Actions ─────────────────────────────────────────────────────────────────

  const openCheckout = useCallback(async (planId: PlanId, interval: BillingInterval) => {
    const result = await healingRun('create-checkout', async () => {
      const { createApiClient } = await import('../packages/api-client/src');
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const client = createApiClient({
        getToken: async () => session?.access_token ?? null,
        getTenantId: () => session?.user?.user_metadata?.tenant_id ?? null,
      });
      return client.billing.createCheckout(planId, interval);
    });
    if (result.data?.url) window.location.href = result.data.url;
    return result;
  }, []);

  const openPortal = useCallback(async () => {
    const result = await healingRun('billing-portal', async () => {
      const { createApiClient } = await import('../packages/api-client/src');
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const client = createApiClient({
        getToken: async () => session?.access_token ?? null,
        getTenantId: () => session?.user?.user_metadata?.tenant_id ?? null,
      });
      return client.billing.createPortalSession();
    });
    if (result.data?.url) window.location.href = result.data.url;
    return result;
  }, []);

  const cancelSubscription = useCallback(async () => {
    const result = await healingRun('cancel-subscription', async () => {
      const { createApiClient } = await import('../packages/api-client/src');
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const client = createApiClient({
        getToken: async () => session?.access_token ?? null,
        getTenantId: () => session?.user?.user_metadata?.tenant_id ?? null,
      });
      return client.billing.cancelSubscription();
    });
    if (result.data) {
      setState(s => ({ ...s, cancelAtPeriodEnd: true }));
    }
    return result;
  }, []);

  return {
    ...state,
    currentPlan,
    trialDaysLeft,
    isTrialing,
    daysUntilRenewal,
    annualSavings,
    annualSavingsPct,
    refresh: fetchBilling,
    openCheckout,
    openPortal,
    cancelSubscription,
  };
}
