/**
 * plans.config.ts
 * Marketer Pro — Frontend plan & price configuration.
 *
 * Price IDs come from Vite env vars (VITE_ prefix = safe for frontend).
 * These are PUBLISHABLE price IDs only — used to identify which plan
 * the user is selecting. Actual charge happens server-side.
 *
 * NEVER put STRIPE_SECRET_KEY in VITE_ vars. It would be exposed in the bundle.
 *
 * .env.local:
 *   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
 *   VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
 *   VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_...
 *   VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
 *   VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...
 */

export type PlanId = 'free' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;   // display price — $29
  annualPrice: number;    // display price per month — $19
  annualTotal: number;    // total charged annually — $228
  badge?: string;
  color: 'slate' | 'classified' | 'reactor';
  features: string[];
  limits: {
    generationsPerMonth: number | null; // null = unlimited
    socialAccounts: number | null;
    brandProfiles: number | null;
    teamMembers: number | null;
    analyticsHistoryDays: number | null;
    aiModel: string;
  };
  priceIds: {
    monthly: string | null;
    annual: string | null;
  };
}

export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Starter',
    tagline: 'Try the Vault',
    monthlyPrice: 0,
    annualPrice: 0,
    annualTotal: 0,
    color: 'slate',
    features: [
      '25 AI generations / month',
      '1 social account',
      '1 brand profile',
      '7-day analytics history',
      'Standard AI model',
      'Community support',
    ],
    limits: {
      generationsPerMonth: 25,
      socialAccounts: 1,
      brandProfiles: 1,
      teamMembers: 1,
      analyticsHistoryDays: 7,
      aiModel: 'Standard',
    },
    priceIds: { monthly: null, annual: null },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Built for creators',
    monthlyPrice: 29,
    annualPrice: 19,
    annualTotal: 228,
    badge: 'Most Popular',
    color: 'classified',
    features: [
      'Unlimited AI generations',
      '10 social accounts',
      '5 brand profiles',
      '90-day analytics history',
      'Advanced AI model',
      'Priority support',
      'Full Vault progression system',
      'Content scheduling & calendar',
      'Platform-optimized content',
    ],
    limits: {
      generationsPerMonth: null,
      socialAccounts: 10,
      brandProfiles: 5,
      teamMembers: 3,
      analyticsHistoryDays: 90,
      aiModel: 'Advanced',
    },
    priceIds: {
      monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID ?? null,
      annual: import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID ?? null,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For serious teams',
    monthlyPrice: 99,
    annualPrice: 79,
    annualTotal: 948,
    color: 'reactor',
    features: [
      'Unlimited everything',
      'Unlimited team members',
      'Unlimited brand profiles',
      '1-year analytics history',
      'Frontier AI model',
      'Dedicated support manager',
      'Custom social integrations',
      'SSO & advanced RBAC',
      'SLA uptime guarantee',
      'Custom contract & invoicing',
    ],
    limits: {
      generationsPerMonth: null,
      socialAccounts: null,
      brandProfiles: null,
      teamMembers: null,
      analyticsHistoryDays: 365,
      aiModel: 'Frontier',
    },
    priceIds: {
      monthly: import.meta.env.VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ?? null,
      annual: import.meta.env.VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID ?? null,
    },
  },
];

export const getPlanById = (id: PlanId): PlanConfig =>
  PLANS.find(p => p.id === id) ?? PLANS[0];

export const annualSavingsPct = (plan: PlanConfig): number =>
  plan.monthlyPrice > 0
    ? Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100)
    : 0;

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';
